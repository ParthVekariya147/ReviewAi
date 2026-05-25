/**
 * Standalone seed runner — call via: npm run test:seed
 *
 * Reads .env.test, inserts a live test QR code, then prints:
 *   TEST_QR_TOKEN=<token>
 *
 * Copy that line into .env.test before running `npm run test:e2e`.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

import { seedFunnelToken } from './seed';

(async () => {
  try {
    const result = await seedFunnelToken();
    console.log('\n✅ Seed complete.');
    console.log(`TEST_QR_TOKEN=${result.token}`);
    console.log('\nAdd the line above to .env.test, then run: npm run test:e2e\n');
    process.exit(0);
  } catch (e) {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  }
})();
