import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AbuseEntry } from '@/types/admin';

export async function GET() {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const flags: AbuseEntry[] = [];

  // Rule 1: QR codes with 0 copy events but >100 scans (dead funnel)
  // TODO(perf): replace with a filtered subquery after migration 018 is run
  const { data: qrCodes } = await db.from('qr_codes').select('id, campaign_name, business_id, businesses(name)').limit(5000);
  if (qrCodes && qrCodes.length > 0) {
    const qrIdList = qrCodes.map(q => q.id);

    // Two bulk queries instead of 2 × N per-QR queries
    const [{ data: scanRows }, { data: copyRows }] = await Promise.all([
      db.from('qr_scans').select('qr_id').in('qr_id', qrIdList).gte('scanned_at', since),
      db.from('analytics_events').select('qr_id').in('qr_id', qrIdList).eq('event_type', 'copy').gte('created_at', since),
    ]);

    const scanMap: Record<string, number> = {};
    scanRows?.forEach(s => { scanMap[s.qr_id] = (scanMap[s.qr_id] ?? 0) + 1; });
    const copyMap: Record<string, number> = {};
    copyRows?.forEach(c => { copyMap[c.qr_id] = (copyMap[c.qr_id] ?? 0) + 1; });

    const now = new Date().toISOString();
    for (const qr of qrCodes) {
      const scanCount = scanMap[qr.id] ?? 0;
      const copyCount = copyMap[qr.id] ?? 0;
      const copyRate  = scanCount > 0 ? (copyCount / scanCount) * 100 : 0;
      const bizRaw    = qr.businesses;
      const bizName   = (Array.isArray(bizRaw) ? (bizRaw[0] as { name: string } | undefined) : (bizRaw as { name: string } | null))?.name ?? '';

      if (scanCount > 100 && copyCount === 0) {
        flags.push({ business_id: qr.business_id, business_name: bizName, qr_id: qr.id, campaign_name: qr.campaign_name, flag_type: 'dead-funnel', scan_count: scanCount, copy_rate: 0, detected_at: now });
      }
      if (scanCount > 200 && copyRate < 20 && copyCount > 0) {
        flags.push({ business_id: qr.business_id, business_name: bizName, qr_id: qr.id, campaign_name: qr.campaign_name, flag_type: 'low-quality', scan_count: scanCount, copy_rate: parseFloat(copyRate.toFixed(1)), detected_at: now });
      }
      if (scanCount > 500 && !flags.some(f => f.qr_id === qr.id && f.flag_type === 'bot')) {
        flags.push({ business_id: qr.business_id, business_name: bizName, qr_id: qr.id, campaign_name: qr.campaign_name, flag_type: 'bot', scan_count: scanCount, copy_rate: parseFloat(copyRate.toFixed(1)), detected_at: now });
      }
    }
  }

  return NextResponse.json({ data: flags, total: flags.length });
}
