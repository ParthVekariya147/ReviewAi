import { customAlphabet } from 'nanoid';

/* URL-safe alphabet, no look-alike chars */
const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
const nanoid   = customAlphabet(alphabet, 8);

export function generateToken(): string {
  return nanoid();
}

/* e.g. "fc-2k4m9r" — optional campaign prefix for readability */
export function generateTokenWithPrefix(prefix: string): string {
  const slug = prefix.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4);
  return slug ? `${slug}-${nanoid(6)}` : nanoid(8);
}
