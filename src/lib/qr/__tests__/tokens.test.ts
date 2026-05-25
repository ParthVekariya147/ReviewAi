import { describe, it, expect } from 'vitest';
import { generateToken, generateTokenWithPrefix } from '../tokens';

const ALPHABET = new Set('23456789abcdefghjkmnpqrstuvwxyz');

// ── generateToken ─────────────────────────────────────────────

describe('generateToken', () => {
  it('returns a string', () => {
    expect(typeof generateToken()).toBe('string');
  });

  it('is exactly 8 characters long', () => {
    expect(generateToken()).toHaveLength(8);
  });

  it('uses only characters from the defined URL-safe alphabet', () => {
    for (let i = 0; i < 200; i++) {
      const token = generateToken();
      for (const ch of token) {
        expect(ALPHABET.has(ch), `unexpected char '${ch}' in token '${token}'`).toBe(true);
      }
    }
  });

  it('excludes look-alike characters (0, 1, i, l, o)', () => {
    const LOOKALIKES = new Set(['0', '1', 'i', 'l', 'o']);
    for (let i = 0; i < 500; i++) {
      const token = generateToken();
      for (const ch of token) {
        expect(LOOKALIKES.has(ch), `look-alike '${ch}' found in '${token}'`).toBe(false);
      }
    }
  });

  it('produces no collisions in 10,000 tokens', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const t = generateToken();
      expect(seen.has(t), `collision detected: ${t}`).toBe(false);
      seen.add(t);
    }
  });

  it('each call returns a different token', () => {
    expect(generateToken()).not.toBe(generateToken());
  });
});

// ── generateTokenWithPrefix ───────────────────────────────────

describe('generateTokenWithPrefix', () => {
  it('returns a string', () => {
    expect(typeof generateTokenWithPrefix('cafe')).toBe('string');
  });

  it('includes a slug from the prefix when prefix has letters', () => {
    const token = generateTokenWithPrefix('Sunset Grill');
    expect(token).toMatch(/^suns-/); // first 4 lowercase alpha chars
  });

  it('truncates prefix slug to 4 characters', () => {
    const token = generateTokenWithPrefix('abcdefgh');
    const [slug] = token.split('-');
    expect(slug).toHaveLength(4);
  });

  it('separates prefix and random part with a hyphen', () => {
    const token = generateTokenWithPrefix('bakery');
    expect(token).toContain('-');
    const parts = token.split('-');
    expect(parts).toHaveLength(2);
  });

  it('random suffix is 6 characters when prefix is present', () => {
    const token = generateTokenWithPrefix('bakery');
    const suffix = token.split('-')[1];
    expect(suffix).toHaveLength(6);
  });

  it('falls back to an 8-char plain token when prefix is empty', () => {
    const token = generateTokenWithPrefix('');
    expect(token).not.toContain('-');
    expect(token).toHaveLength(8);
  });

  it('falls back to plain token when prefix has only special chars', () => {
    const token = generateTokenWithPrefix('!!!###');
    expect(token).not.toContain('-');
    expect(token).toHaveLength(8);
  });

  it('strips non-alphanumeric chars from the prefix', () => {
    const token = generateTokenWithPrefix('Joe\'s Diner!');
    expect(token).toMatch(/^joes-/);
  });

  it('uses only alphabet characters in the random part', () => {
    for (let i = 0; i < 200; i++) {
      const token = generateTokenWithPrefix('shop');
      const suffix = token.split('-')[1];
      for (const ch of suffix) {
        expect(ALPHABET.has(ch), `unexpected char '${ch}' in suffix`).toBe(true);
      }
    }
  });

  it('handles numeric-only prefix', () => {
    // digits are allowed — prefix "2024" stays as-is (all in alphabet range)
    const token = generateTokenWithPrefix('2024');
    expect(token).toMatch(/^2024-/);
  });

  it('no collisions in 10,000 prefixed tokens', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const t = generateTokenWithPrefix('test');
      expect(seen.has(t), `collision: ${t}`).toBe(false);
      seen.add(t);
    }
  });
});
