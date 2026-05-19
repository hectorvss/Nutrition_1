import webpush from 'web-push';
import { supabaseAdmin } from '../db/index.js';

// VAPID keys come from the environment. Without them push is simply disabled
// (every helper becomes a no-op) — the app keeps working.
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:notifications@nutrifit.app';

export const pushConfigured = !!(VAPID_PUBLIC && VAPID_PRIVATE);
export const vapidPublicKey = VAPID_PUBLIC;

if (pushConfigured) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
} else {
  console.warn('[push] VAPID keys not set — web push notifications are disabled.');
}

interface PushPayload {
  title: string;
  body: string;
  /** Where to navigate when the notification is clicked. */
  url?: string;
  /** notification_prefs key — if the user has it set to false, nothing is sent. */
  prefKey?: string;
}

/**
 * Sends a web-push notification to every device a user has registered.
 * Respects the user's notification_prefs toggle and prunes dead subscriptions.
 * Best-effort: never throws.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!pushConfigured || !userId) return;
  try {
    // Respect the notification preference toggle (opt-out model: send unless false).
    if (payload.prefKey) {
      const { data: settings } = await supabaseAdmin
        .from('manager_settings')
        .select('notification_prefs')
        .eq('user_id', userId)
        .maybeSingle();
      const prefs: any = settings?.notification_prefs || {};
      if (prefs[payload.prefKey] === false) return;
    }

    const { data: subs } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);
    if (!subs || subs.length === 0) return;

    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
    });

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
      } catch (e: any) {
        // 404/410 = the subscription is gone (browser/permission revoked) — drop it.
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', s.id);
        } else {
          console.error('[push] send error:', e?.statusCode, e?.body || e?.message);
        }
      }
    }
  } catch (e) {
    console.error('[push] sendPushToUser error:', e);
  }
}
