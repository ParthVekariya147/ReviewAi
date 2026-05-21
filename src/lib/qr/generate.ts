import QRCode from 'qrcode';

export type QRFormat = 'png' | 'svg';

interface QROptions {
  color?:  string;   /* foreground, default #000000 */
  bg?:     string;   /* background, default #FFFFFF */
  margin?: number;   /* quiet zone modules, default 1 */
  size?:   number;   /* PNG: pixel width, default 512 */
}

export async function generateQRPng(url: string, opts: QROptions = {}): Promise<Buffer> {
  const buf = await QRCode.toBuffer(url, {
    type:         'png',
    width:        opts.size   ?? 512,
    margin:       opts.margin ?? 1,
    color: {
      dark:  opts.color ?? '#000000',
      light: opts.bg    ?? '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  return buf;
}

export async function generateQRSvg(url: string, opts: QROptions = {}): Promise<string> {
  const svg = await QRCode.toString(url, {
    type:   'svg',
    margin: opts.margin ?? 1,
    color: {
      dark:  opts.color ?? '#000000',
      light: opts.bg    ?? '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
  return svg;
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
