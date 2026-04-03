import { Router } from 'express';
import { supabase, supabaseAdmin } from '../db/index.js';

const router = Router();

// Middleware to verify user using Supabase Auth
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      console.error('Messages auth error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error('Messages auth crash:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

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

// Get messages for a specific conversation
// For a manager: receiver_id is the client
// For a client: receiver_id is the manager
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
    res.json(messages);
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

// Send a message
router.post('/', async (req: any, res) => {
  const sender_id = req.user.id;
  const { receiver_id, content, attachment_url, attachment_type, attachment_name } = req.body;

  if (!receiver_id || (!content && !attachment_url)) {
    return res.status(400).json({ error: 'Receiver and content or attachment are required' });
  }

  try {
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

// Clear conversation history
router.delete('/:otherUserId', async (req: any, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);

    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
