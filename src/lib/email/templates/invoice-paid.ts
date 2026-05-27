export interface InvoicePaidEmailData {
  businessName: string;
  email:        string;
  amount:       string;
  invoiceId:    string;
  periodStart:  string;
  periodEnd:    string;
  invoicePdf?:  string | null;
  appUrl:       string;
}

export function invoicePaidEmailHtml(d: InvoicePaidEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
    <div style="background:#6E5BFF;padding:32px 40px;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.5px;">Reevo</span>
    </div>
    <div style="padding:32px 40px;">
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f0f10;">Payment received — ${esc(d.amount)}</h1>
      <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">Thanks for your payment! Here's your receipt for ${esc(d.businessName)}.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Invoice</td><td style="padding:8px 0;color:#0f0f10;font-size:14px;font-weight:600;text-align:right;">${esc(d.invoiceId)}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Period</td><td style="padding:8px 0;color:#0f0f10;font-size:14px;font-weight:600;text-align:right;">${esc(d.periodStart)} – ${esc(d.periodEnd)}</td></tr>
        <tr style="border-top:1px solid #e5e7eb;"><td style="padding:12px 0;color:#0f0f10;font-size:15px;font-weight:700;">Total paid</td><td style="padding:12px 0;color:#0f0f10;font-size:15px;font-weight:700;text-align:right;">${esc(d.amount)}</td></tr>
      </table>
      ${d.invoicePdf ? `<a href="${esc(d.invoicePdf)}" style="display:inline-block;background:#6E5BFF;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;margin-bottom:24px;">Download invoice PDF →</a>` : ''}
      <hr style="margin:24px 0 20px;border:none;border-top:1px solid #e5e7eb;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Reevo · Questions? Reply to this email or visit <a href="${esc(d.appUrl)}" style="color:#6E5BFF;">your account</a>.</p>
    </div>
  </div>
</body>
</html>`;
}

function esc(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
