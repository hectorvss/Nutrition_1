import { Router } from 'express';
import { supabaseAdmin } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Initialize Storage Bucket
const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav',
  'application/pdf'
];
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB

const initStorage = async () => {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) throw listError;

    const bucketCfg = {
      public: true, // attachments are accessed via plain URLs in the chat
      allowedMimeTypes: ALLOWED_MIME, // strict whitelist — no image/* wildcard (would allow SVG with embedded JS)
      fileSizeLimit: MAX_ATTACHMENT_BYTES,
    };

    if (!buckets.find(b => b.name === 'messages-media')) {
      await supabaseAdmin.storage.createBucket('messages-media', bucketCfg);
      console.log('Created storage bucket: messages-media');
    } else {
      // Tighten existing bucket settings (no-op if already correct)
      await supabaseAdmin.storage.updateBucket('messages-media', bucketCfg);
    }
  } catch (err) {
    console.error('Error initializing storage bucket:', err);
  }
};

initStorage();

router.use(authenticate);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Defense against PostgREST filter injection via .or() interpolation —
// any param destined for a Supabase filter string MUST be a valid UUID.
const requireUuidParam = (paramName: string) => (req: any, res: any, next: any) => {
  const v = req.params[paramName];
  if (!v || !UUID_RE.test(v)) {
    return res.status(400).json({ error: `Invalid ${paramName} format` });
  }
  next();
};

// Get total unread messages count
router.get('/unread-count', async (req: any, res) => {
  const userId = req.user.id;
  try {
    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('deleted_by_receiver', false)
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

      // Skip messages soft-deleted for this user
      if (isSender && msg.deleted_by_sender) return;
      if (!isSender && msg.deleted_by_receiver) return;

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
router.get('/:otherUserId', requireUuidParam('otherUserId'), async (req: any, res) => {
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
router.post('/:otherUserId/read', requireUuidParam('otherUserId'), async (req: any, res) => {
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

  if (!receiver_id || !UUID_RE.test(receiver_id)) {
    return res.status(400).json({ error: 'Invalid receiver_id format' });
  }
  if (!content && !attachment_url) {
    return res.status(400).json({ error: 'Receiver and content or attachment are required' });
  }

  // Validate attachment_url, if present, must point to OUR Supabase Storage messages-media bucket.
  // Otherwise an attacker could store a phishing link as an "attachment".
  if (attachment_url) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const expectedPrefix = supabaseUrl.replace(/\/$/, '') + '/storage/v1/object/public/messages-media/';
    if (typeof attachment_url !== 'string' || !attachment_url.startsWith(expectedPrefix)) {
      return res.status(400).json({ error: 'attachment_url must point to messages-media storage' });
    }
    if (attachment_type && !['image', 'audio', 'file', 'pdf'].includes(String(attachment_type))) {
      return res.status(400).json({ error: 'Invalid attachment_type' });
    }
    if (attachment_name && /[\\/\0]/.test(String(attachment_name))) {
      return res.status(400).json({ error: 'Invalid attachment_name' });
    }
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
router.delete('/:otherUserId', requireUuidParam('otherUserId'), async (req: any, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    await Promise.all([
      supabaseAdmin.from('messages').update({ deleted_by_sender: true }).eq('sender_id', userId).eq('receiver_id', otherUserId),
      supabaseAdmin.from('messages').update({ deleted_by_receiver: true }).eq('sender_id', otherUserId).eq('receiver_id', userId),
    ]);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
