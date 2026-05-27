import QRCode from 'qrcode';
import sharp from 'sharp';

export type QRFormat = 'png' | 'svg';

export interface QROptions {
  color?:   string;    /* foreground hex, default #000000 */
  bg?:      string;    /* background hex, default #FFFFFF */
  margin?:  number;    /* quiet-zone modules, default 1   */
  size?:    number;    /* PNG pixel width, default 512    */
  logoUrl?: string;    /* HTTPS URL of logo to embed      */
}

/* Logo occupies 28% of QR width — ECL H tolerates ~30% obstruction */
const LOGO_AREA_RATIO  = 0.28;
const LOGO_PAD_RATIO   = 0.03;
const LOGO_CORNER_RATIO = 0.15;
const LOGO_FETCH_TIMEOUT_MS = 5_000;
const LOGO_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function generateQRPng(url: string, opts: QROptions = {}): Promise<Buffer> {
  const size = opts.size ?? 512;

  const qrBuf = await QRCode.toBuffer(url, {
    type:  'png',
    width: size,
    margin: opts.margin ?? 1,
    color: {
      dark:  opts.color ?? '#000000',
      light: opts.bg    ?? '#FFFFFF',
    },
    // ECL H when logo present: up to 30% of data can be obscured and still scan
    errorCorrectionLevel: opts.logoUrl ? 'H' : 'M',
  });

  if (opts.logoUrl) {
    try {
      return await compositeLogoOnQR(qrBuf, opts.logoUrl, size);
    } catch (e) {
      console.error('[qr/generate] logo composite failed, falling back to plain QR:', e);
    }
  }
  return qrBuf;
}

export async function generateQRSvg(url: string, opts: QROptions = {}): Promise<string> {
  return QRCode.toString(url, {
    type:   'svg',
    margin: opts.margin ?? 1,
    color: {
      dark:  opts.color ?? '#000000',
      light: opts.bg    ?? '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRDataUrl(url: string, opts: QROptions = {}): Promise<string> {
  return QRCode.toDataURL(url, {
    type:   'image/png',
    width:  opts.size   ?? 256,
    margin: opts.margin ?? 1,
    color: {
      dark:  opts.color ?? '#000000',
      light: opts.bg    ?? '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}

/* ─── Internal: composite a logo onto the center of a QR PNG buffer ─────── */

async function compositeLogoOnQR(
  qrBuf: Buffer,
  logoUrl: string,
  qrSize: number,
): Promise<Buffer> {
  const logoRaw = await fetchLogoBuffer(logoUrl);

  const area   = Math.floor(qrSize * LOGO_AREA_RATIO);   // full logo tile (logo + padding)
  const pad    = Math.floor(qrSize * LOGO_PAD_RATIO);    // white ring width
  const inner  = area - pad * 2;                         // actual image pixels
  const radius = Math.floor(inner * LOGO_CORNER_RATIO);  // rounded-corner radius

  // Step 1 — resize to square
  const logoSquare = await sharp(logoRaw)
    .resize(inner, inner, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();

  // Step 2 — rounded-corner SVG mask, then dest-in to clip the logo
  const maskSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${inner}" height="${inner}">` +
    `<rect x="0" y="0" width="${inner}" height="${inner}" ` +
    `rx="${radius}" ry="${radius}" fill="white"/>` +
    `</svg>`,
  );
  const logoRounded = await sharp(logoSquare)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Step 3 — place rounded logo on opaque white tile (the padding ring)
  // NOTE: composite() must come before png() in the sharp pipeline
  const logoPadded = await sharp({
    create: { width: area, height: area, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
  .composite([{ input: logoRounded, top: pad, left: pad }])
  .png()
  .toBuffer();

  // Step 4 — composite tile onto QR center
  const offset = Math.floor((qrSize - area) / 2);
  return sharp(qrBuf)
    .composite([{ input: logoPadded, top: offset, left: offset }])
    .png()
    .toBuffer();
}

async function fetchLogoBuffer(logoUrl: string): Promise<Buffer> {
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), LOGO_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(logoUrl, { signal: controller.signal });
    if (!res.ok) throw new Error(`Logo fetch failed: ${res.status}`);
    const ab = await res.arrayBuffer();
    if (ab.byteLength > LOGO_MAX_BYTES) throw new Error('Logo exceeds 2 MB');
    return Buffer.from(ab);
  } finally {
    clearTimeout(tid);
  }
}
