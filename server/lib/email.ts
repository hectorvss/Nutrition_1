import { Resend } from 'resend';
import { supabaseAdmin } from '../db/index.js';

export type EmailLanguage = 'es' | 'en';

export type LocalizedText = string | { es: string; en: string };

export interface NotificationEmailCopy {
  subject: LocalizedText;
  title: LocalizedText;
  subtitle?: LocalizedText;
  body: LocalizedText;
  imageUrl?: string;
  imageAlt?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaUrl?: string;
  note?: LocalizedText;
  preheader?: LocalizedText;
}

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface ManagerNotificationContext {
  email: string | null;
  language: EmailLanguage;
  notification_prefs: Record<string, any>;
}

const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const EMAIL_FROM = String(process.env.EMAIL_FROM || process.env.RESEND_FROM || '').trim();
const resend = RESEND_API_KEY && EMAIL_FROM ? new Resend(RESEND_API_KEY) : null;

if (!resend) {
  console.warn('[email] RESEND_API_KEY / EMAIL_FROM not configured — email notifications are disabled.');
}

function pickText(value: LocalizedText, language: EmailLanguage): string {
  if (typeof value === 'string') return value;
  return language === 'en' ? value.en : value.es;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatText(content: NotificationEmailCopy, language: EmailLanguage): string {
  const parts = [
    pickText(content.title, language),
    content.subtitle ? pickText(content.subtitle, language) : '',
    '',
    pickText(content.body, language),
  ];
  if (content.imageUrl) {
    parts.push('', content.imageUrl);
  }
  if (content.ctaUrl && content.ctaLabel) {
    parts.push('', `${pickText(content.ctaLabel, language)}: ${content.ctaUrl}`);
  }
  if (content.note) {
    parts.push('', pickText(content.note, language));
  }
  return parts.join('\n');
}

function formatHtml(content: NotificationEmailCopy, language: EmailLanguage): string {
  const subject = escapeHtml(pickText(content.subject, language));
  const title = escapeHtml(pickText(content.title, language));
  const subtitle = content.subtitle ? escapeHtml(pickText(content.subtitle, language)) : '';
  const body = escapeHtml(pickText(content.body, language));
  const imageUrl = content.imageUrl ? escapeHtml(content.imageUrl) : '';
  const imageAlt = content.imageAlt ? escapeHtml(pickText(content.imageAlt, language)) : title;
  const ctaLabel = content.ctaLabel ? escapeHtml(pickText(content.ctaLabel, language)) : '';
  const note = content.note ? escapeHtml(pickText(content.note, language)) : '';
  const preheader = content.preheader ? escapeHtml(pickText(content.preheader, language)) : subject;
  const hero = imageUrl ? `
            <tr>
              <td style="padding:0 40px 12px 40px;">
                <img src="${imageUrl}" alt="${imageAlt}" style="display:block;width:100%;height:auto;border:0;border-radius:14px;max-width:100%;" />
              </td>
            </tr>` : '';
  const cta = content.ctaUrl && content.ctaLabel
    ? `
      <tr>
        <td style="padding: 8px 40px 24px 40px;">
          <a href="${escapeHtml(content.ctaUrl)}" style="display:inline-block;background:#17cf54;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px;">${ctaLabel}</a>
        </td>
      </tr>`
    : '';

  return `
<!doctype html>
<html lang="${language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 12px 40px;">
                <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:12px;">Nutrition</div>
                <h1 style="margin:0;font-size:28px;line-height:1.2;color:#0f172a;">${title}</h1>
                ${subtitle ? `<div style="margin-top:8px;font-size:15px;line-height:1.5;color:#64748b;font-weight:600;">${subtitle}</div>` : ''}
              </td>
            </tr>
            ${hero}
            <tr>
              <td style="padding:0 40px 12px 40px;">
                <p style="margin:0;font-size:16px;line-height:1.7;color:#334155;">${body}</p>
              </td>
            </tr>
            ${cta}
            ${note ? `<tr><td style="padding:0 40px 32px 40px;"><p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;white-space:pre-line;">${note}</p></td></tr>` : ''}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendTransactionalEmail(email: TransactionalEmail): Promise<{ ok: boolean; id?: string; skipped?: boolean }> {
  if (!resend) return { ok: false, skipped: true };
  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: email.replyTo,
    });
    return { ok: true, id: result.data?.id };
  } catch (error) {
    console.error('[email] send failed:', error);
    return { ok: false };
  }
}

export async function getManagerNotificationContext(managerId: string): Promise<ManagerNotificationContext> {
  const [{ data: user }, { data: settings }] = await Promise.all([
    supabaseAdmin.from('users').select('email').eq('id', managerId).maybeSingle(),
    supabaseAdmin.from('manager_settings').select('notification_prefs, language').eq('user_id', managerId).maybeSingle(),
  ]);
  return {
    email: user?.email || null,
    language: (settings?.language === 'en' ? 'en' : 'es'),
    notification_prefs: (settings?.notification_prefs || {}) as Record<string, any>,
  };
}

export async function sendManagerNotificationEmail(
  managerId: string,
  prefKey: string,
  content: NotificationEmailCopy,
): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  if (!resend) return { ok: false, skipped: true, reason: 'not_configured' };
  const ctx = await getManagerNotificationContext(managerId);
  if (ctx.notification_prefs[prefKey] === false) return { ok: true, skipped: true };
  if (!ctx.email) return { ok: false, skipped: true, reason: 'missing_email' };

  const language = ctx.language;
  const subject = pickText(content.subject, language);
  const html = formatHtml(content, language);
  const text = formatText(content, language);
  return sendTransactionalEmail({ to: ctx.email, subject, html, text });
}

export async function sendClientTransactionalEmail(opts: {
  to: string;
  language?: EmailLanguage;
  subject?: LocalizedText;
  title?: LocalizedText;
  subtitle?: LocalizedText;
  body?: LocalizedText;
  imageUrl?: string;
  imageAlt?: LocalizedText;
  ctaLabel?: LocalizedText;
  ctaUrl?: string;
  note?: LocalizedText;
  preheader?: LocalizedText;
  replyTo?: string;
}): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  if (!resend) return { ok: false, skipped: true, reason: 'not_configured' };
  const language = opts.language === 'en' ? 'en' : 'es';
  const subjectValue = opts.subject || opts.title || (language === 'en' ? 'Update from Nutrition' : 'Actualización de Nutrition');
  const titleValue = opts.title || subjectValue;
  const bodyValue = opts.body || '';
  const copy: NotificationEmailCopy = {
    subject: subjectValue,
    title: titleValue,
    subtitle: opts.subtitle,
    body: bodyValue,
    imageUrl: opts.imageUrl,
    imageAlt: opts.imageAlt,
    ctaLabel: opts.ctaLabel,
    ctaUrl: opts.ctaUrl,
    note: opts.note,
    preheader: opts.preheader,
  };
  return sendTransactionalEmail({
    to: opts.to,
    subject: pickText(copy.subject, language),
    html: formatHtml(copy, language),
    text: formatText(copy, language),
    replyTo: opts.replyTo,
  });
}

export async function sendClientAccessEmail(opts: {
  to: string;
  language?: EmailLanguage;
  clientName?: string | null;
  password: string;
  loginUrl?: string;
  managerName?: string | null;
}): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  if (!resend) return { ok: false, skipped: true, reason: 'not_configured' };
  const language = opts.language === 'en' ? 'en' : 'es';
  const loginUrl = opts.loginUrl || `${process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
  const clientName = opts.clientName || (language === 'en' ? 'your client' : 'tu cliente');
  const managerName = opts.managerName || (language === 'en' ? 'your coach' : 'tu coach');

  const copy: NotificationEmailCopy = {
    subject: language === 'en' ? 'Your access details' : 'Tus datos de acceso',
    title: language === 'en' ? `Welcome, ${clientName}` : `¡Bienvenido/a, ${clientName}!`,
    body: language === 'en'
      ? `Your account has been created. Use the email below and the temporary password to sign in. ${managerName} will help you get started.`
      : `Tu cuenta ya está creada. Usa el correo de abajo y la contraseña temporal para entrar. ${managerName} te ayudará a empezar.`,
    ctaLabel: language === 'en' ? 'Open the app' : 'Abrir la app',
    ctaUrl: loginUrl,
    note: language === 'en'
      ? `Email: ${opts.to}\nTemporary password: ${opts.password}`
      : `Email: ${opts.to}\nContraseña temporal: ${opts.password}`,
  };

  return sendTransactionalEmail({
    to: opts.to,
    subject: pickText(copy.subject, language),
    html: formatHtml(copy, language),
    text: formatText(copy, language),
  });
}

export function emailIsConfigured(): boolean {
  return !!resend;
}
