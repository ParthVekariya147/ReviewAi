import { Resend } from 'resend';
import { env } from '@/lib/env';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error('[email] RESEND_API_KEY is not set. Add it to your environment variables.');
  }
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

export interface SendEmailOptions {
  to:      string | string[];
  subject: string;
  html:    string;
  from?:   string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — email suppressed:', subject, 'to:', to);
    return;
  }

  const { error } = await getResend().emails.send({
    from:    from ?? env.EMAIL_FROM,
    to:      Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(`[email] Failed to send "${subject}": ${error.message}`);
  }
}
