import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Initialize Storage Bucket
const initStorage = async () => {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;
    
    if (!buckets.find(b => b.name === 'messages-media')) {
      const { error: createError } = await supabaseAdmin.storage.createBucket('messages-media', {
        public: true, // Allow public read access to attachments via URLs
        allowedMimeTypes: ['image/*', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        fileSizeLimit: 52428800 // 50MB
      });
      console.log('Created storage bucket: messages-media');
    }
  } catch (err) {
    console.error('Error initializing storage bucket:', err);
  }
};

initStorage();

router.use(authenticate);

// Get total unread messages count
router.get('/unread-count', async (req: any, res) => {
  const userId = req.user.id;
  try {
    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .or('is_read.eq.false,is_read.is.null');

    if (error) throw error;
    res.json({ unreadCount: count || 0 });
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get the latest message for each conversation involving the current user.
 * This is used for the inbox view to show previews and sort by recency.
 */
router.get('/recent', async (req: any, res) => {
  const userId = req.user.id;

  try {
    // We use a subquery/grouping approach to find the latest message for each partner.
    // In Supabase/PostgreSQL, we can fetch all messages involving the user and then filter in JS
    // or use a more complex SQL query. For simplicity and reliability with RLS, 
    // we'll fetch recently participated conversations.
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter to get only the latest message per conversation partner and count unread
    const latestMessages: Record<string, any> = {};
    const unreadCounts: Record<string, number> = {};

    messages?.forEach(msg => {
      const isSender = msg.sender_id === userId;
      const partnerId = isSender ? msg.receiver_id : msg.sender_id;
      
      if (!latestMessages[partnerId]) {
        latestMessages[partnerId] = msg;
        unreadCounts[partnerId] = 0;
      }

      const isRead = msg.is_read === true || msg.is_read === 'true';

      if (!isSender && !isRead) {
        unreadCounts[partnerId]++;
      }
    });

    const recentData = Object.values(latestMessages).map(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      return {
        ...msg,
        unreadCount: unreadCounts[partnerId] || 0
      };
    });

    res.json(recentData);
  } catch (error: any) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a specific conversation (filtra soft-deletes)
router.get('/:otherUserId', async (req: any, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Filtrar mensajes soft-deleted para este usuario
    const filtered = (messages || []).filter(msg => {
      if (msg.sender_id === userId && msg.deleted_by_sender) return false;
      if (msg.receiver_id === userId && msg.deleted_by_receiver) return false;
      return true;
    });

    res.json(filtered);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mark messages from a specific conversation as read
router.post('/:otherUserId/read', async (req: any, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .or('is_read.eq.false,is_read.is.null');

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send a message — con validación de que el receiver es un contacto legítimo del sender
router.post('/', async (req: any, res) => {
  const sender_id = req.user.id;
  const { receiver_id, content, attachment_url, attachment_type, attachment_name } = req.body;

  if (!receiver_id || (!content && !attachment_url)) {
    return res.status(400).json({ error: 'Receiver and content or attachment are required' });
  }

  try {
    // Validar que existe una relación manager-client entre sender y receiver
    const { data: senderData } = await supabaseAdmin
      .from('users')
      .select('role, manager_id')
      .eq('id', sender_id)
      .maybeSingle();

    const { data: receiverData } = await supabaseAdmin
      .from('users')
      .select('role, manager_id')
      .eq('id', receiver_id)
      .maybeSingle();

    if (!receiverData) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Un MANAGER solo puede escribir a sus CLIENTs, y un CLIENT solo a su MANAGER
    const isManagerToClient = senderData?.role === 'MANAGER' && receiverData?.manager_id === sender_id;
    const isClientToManager = senderData?.role === 'CLIENT' && senderData?.manager_id === receiver_id;

    if (!isManagerToClient && !isClientToManager) {
      return res.status(403).json({ error: 'No tienes permiso para enviar mensajes a este usuario' });
    }

    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id,
        receiver_id,
        content,
        attachment_url,
        attachment_type,
        attachment_name
      })
      .select()
      .single();

    if (error) throw error;
    res.json(message);
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear conversation history — soft-delete: solo marca como borrado para el usuario que lo solicita
// Los mensajes siguen existiendo para el otro usuario
router.delete('/:otherUserId', async (req: any, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    // Marcar mensajes ENVIADOS por mí como borrados para mí
    await supabaseAdmin
      .from('messages')
      .update({ deleted_by_sender: true })
      .eq('sender_id', userId)
      .eq('receiver_id', otherUserId);

    // Marcar mensajes RECIBIDOS por mí como borrados para mí
    await supabaseAdmin
      .from('messages')
      .update({ deleted_by_receiver: true })
      .eq('sender_id', otherUserId)
      .eq('receiver_id', userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
