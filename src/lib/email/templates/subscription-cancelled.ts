export interface SubscriptionCancelledEmailData {
  businessName: string;
  email:        string;
  endDate:      string;
  appUrl:       string;
}

export function subscriptionCancelledEmailHtml(d: SubscriptionCancelledEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
    <div style="background:#4b5563;padding:32px 40px;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px;">Reevo</span>
    </div>
    <div style="padding:32px 40px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f0f10;">Your subscription has been cancelled</h1>
      <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">Hi ${esc(d.businessName)}, your Reevo subscription has been cancelled. You'll have access until <b>${esc(d.endDate)}</b>. Your data will be kept for 60 days after that.</p>
      <a href="${esc(d.appUrl)}/pricing" style="display:inline-block;background:#6E5BFF;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Resubscribe →</a>
      <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">Changed your mind? You can resubscribe any time before your access expires.</p>
      <hr style="margin:24px 0 20px;border:none;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Reevo · Questions? Reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

function esc(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
