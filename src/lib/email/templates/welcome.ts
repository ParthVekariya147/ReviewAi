export interface WelcomeEmailData {
  businessName: string;
  email:        string;
  appUrl:       string;
}

export function welcomeEmailHtml({ businessName, appUrl }: WelcomeEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
    <div style="background:#6E5BFF;padding:32px 40px;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px;">Reevo</span>
    </div>
    <div style="padding:32px 40px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f0f10;">Welcome to Reevo, ${escHtml(businessName)}!</h1>
      <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">Your account is set up and ready. Start collecting smarter reviews in minutes.</p>
      <a href="${appUrl}/dashboard" style="display:inline-block;background:#6E5BFF;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">Go to dashboard →</a>
      <hr style="margin:32px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">You received this because you signed up for Reevo. Questions? Reply to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

function escHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
