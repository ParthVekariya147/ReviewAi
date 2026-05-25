import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeColor,
  sanitizeLang,
  sanitizeRating,
  sanitizeUrl,
  sanitizePlatforms,
} from '../sanitize';

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('rejects javascript: URIs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('rejects data: URIs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('rejects javascript: with mixed case', () => {
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
  });

  it('rejects non-string input', () => {
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl(42)).toBe('');
  });

  it('returns empty string for invalid URL', () => {
    expect(sanitizeUrl('not a url')).toBe('');
  });

  it('truncates at maxLen', () => {
    const long = 'https://example.com/' + 'a'.repeat(3000);
    expect(sanitizeUrl(long, 100).length).toBeLessThanOrEqual(100);
  });
});

describe('sanitizePlatforms', () => {
  it('caps at 20 entries', () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({
      id: 'google',
      url: `https://g.co/${i}`,
      enabled: true,
    }));
    expect(sanitizePlatforms(entries).length).toBeLessThanOrEqual(20);
  });

  it('removes entries with unknown platform IDs', () => {
    const entries = [
      { id: 'google', url: 'https://google.com', enabled: true },
      { id: 'evilsite', url: 'https://evil.com', enabled: true },
    ];
    const result = sanitizePlatforms(entries);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('google');
  });

  it('strips XSS strings from unknown IDs', () => {
    const entries = [{ id: '<script>alert(1)</script>', url: 'https://x.com', enabled: true }];
    expect(sanitizePlatforms(entries)).toHaveLength(0);
  });

  it('rejects non-array input', () => {
    expect(sanitizePlatforms(null)).toEqual([]);
    expect(sanitizePlatforms('google')).toEqual([]);
    expect(sanitizePlatforms({})).toEqual([]);
  });

  it('sanitizes the url inside each entry', () => {
    const entries = [{ id: 'google', url: 'javascript:alert(1)', enabled: true }];
    const result = sanitizePlatforms(entries);
    expect(result[0].url).toBe('');
  });

  it('coerces enabled to boolean', () => {
    const entries = [{ id: 'google', url: 'https://g.co', enabled: 1 }];
    const result = sanitizePlatforms(entries);
    expect(typeof result[0].enabled).toBe('boolean');
    expect(result[0].enabled).toBe(true);
  });
});

describe('sanitizeString', () => {
  it('trims and collapses whitespace', () => {
    expect(sanitizeString('  hello   world  ')).toBe('hello world');
  });

  it('enforces max length', () => {
    expect(sanitizeString('a'.repeat(600), 500).length).toBe(500);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(42)).toBe('');
  });
});

describe('sanitizeColor', () => {
  it('accepts valid hex colors', () => {
    expect(sanitizeColor('#FF0000')).toBe('#FF0000');
    expect(sanitizeColor('#abc123')).toBe('#abc123');
  });

  it('rejects invalid values', () => {
    expect(sanitizeColor('red')).toBeNull();
    expect(sanitizeColor('#GGG')).toBeNull();
    expect(sanitizeColor('rgb(255,0,0)')).toBeNull();
    expect(sanitizeColor('')).toBeNull();
  });
});

describe('sanitizeLang', () => {
  it('allows known language codes', () => {
    expect(sanitizeLang('en')).toBe('en');
    expect(sanitizeLang('es')).toBe('es');
    expect(sanitizeLang('fr')).toBe('fr');
  });

  it('defaults unknown codes to en', () => {
    expect(sanitizeLang('xx')).toBe('en');
    expect(sanitizeLang('')).toBe('en');
    expect(sanitizeLang(null)).toBe('en');
  });
});

describe('sanitizeRating', () => {
  it('clamps within valid range', () => {
    expect(sanitizeRating(3)).toBe(3);
    expect(sanitizeRating(0)).toBe(1);
    expect(sanitizeRating(10)).toBe(5);
    expect(sanitizeRating(-1)).toBe(1);
  });

  it('returns min for non-integer input', () => {
    expect(sanitizeRating('abc')).toBe(1);
    expect(sanitizeRating(null)).toBe(1);
    expect(sanitizeRating(3.5)).toBe(1);
  });
});
