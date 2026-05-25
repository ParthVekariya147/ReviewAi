/**
 * Multi-provider AI review generator with round-robin key rotation and
 * automatic provider fallback.
 *
 * Provider order: Anthropic → OpenAI → Gemini
 * Each provider reads up to 9 numbered keys from env:
 *   ANTHROPIC_API_KEY_1 … ANTHROPIC_API_KEY_9
 *   OPENAI_API_KEY_1    … OPENAI_API_KEY_9
 *   GEMINI_API_KEY_1    … GEMINI_API_KEY_9
 *
 * A single fallback key (no number) is also accepted:
 *   ANTHROPIC_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY
 */

import Anthropic       from '@anthropic-ai/sdk';
import OpenAI          from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ReviewRequest {
  businessName:    string;
  tagline:         string;
  businessType:    string;   // e.g. "Restaurant", "Salon"
  reviewKeywords:  string;   // comma-separated highlights
  rating:          number;   // 1–5
  language:        string;   // 'en' | 'es' | …
}

/* ── key helpers ─────────────────────────────────────────── */

function loadKeys(prefix: string): string[] {
  const keys: string[] = [];
  const base = process.env[prefix];
  if (base?.trim()) keys.push(base.trim());
  for (let i = 1; i <= 9; i++) {
    const k = process.env[`${prefix}_${i}`]?.trim();
    if (k) keys.push(k);
  }
  return keys;
}

/* Random key selection — works correctly across serverless cold starts.
   Module-level counters reset on every cold start so round-robin is broken
   in multi-instance deployments; random selection is stateless and equally fair. */
function nextKey(_prefix: string, keys: string[]): string {
  return keys[Math.floor(Math.random() * keys.length)];
}

/* ── prompt ──────────────────────────────────────────────── */

function buildPrompt(req: ReviewRequest): string {
  const stars    = '★'.repeat(req.rating) + '☆'.repeat(5 - req.rating);
  const langNote = req.language !== 'en'
    ? `Write entirely in ${req.language === 'es' ? 'Spanish' : req.language}.`
    : '';
  const typeNote = req.businessType
    ? `Business type: ${req.businessType}.`
    : '';
  const kwNote = req.reviewKeywords
    ? `Naturally weave in 1–2 of these highlights (only if they fit): ${req.reviewKeywords}.`
    : '';
  return `Write a single genuine-sounding customer review for "${req.businessName}"${req.tagline ? ` — "${req.tagline}"` : ''}.
Rating: ${stars} (${req.rating}/5).
${typeNote}
${kwNote}
${langNote}
Rules:
- 2–4 sentences, first-person, natural tone — not salesy or over-the-top
- Sound like a real person, not marketing copy
- If rating is 4–5: warm and enthusiastic but believable
- If rating is 3: mildly positive with a small hint of room to improve
- Output ONLY the review text, no title, no quotes, no preamble`;
}

/* ── providers ───────────────────────────────────────────── */

async function generateWithAnthropic(req: ReviewRequest): Promise<string> {
  const keys = loadKeys('ANTHROPIC_API_KEY');
  if (!keys.length) throw new Error('No Anthropic keys');
  const client = new Anthropic({ apiKey: nextKey('ANTHROPIC_API_KEY', keys) });
  const msg = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages:   [{ role: 'user', content: buildPrompt(req) }],
  });
  const block = msg.content[0];
  if (block.type !== 'text') throw new Error('Unexpected Anthropic response');
  return block.text.trim();
}

async function generateWithOpenAI(req: ReviewRequest): Promise<string> {
  const keys = loadKeys('OPENAI_API_KEY');
  if (!keys.length) throw new Error('No OpenAI keys');
  const client = new OpenAI({ apiKey: nextKey('OPENAI_API_KEY', keys) });
  const res = await client.chat.completions.create({
    model:      'gpt-4o-mini',
    max_tokens: 300,
    messages:   [{ role: 'user', content: buildPrompt(req) }],
  });
  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error('Empty OpenAI response');
  return text.trim();
}

async function generateWithGemini(req: ReviewRequest): Promise<string> {
  const keys = loadKeys('GEMINI_API_KEY');
  if (!keys.length) throw new Error('No Gemini keys');
  const client = new GoogleGenerativeAI(nextKey('GEMINI_API_KEY', keys));
  const model  = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const res    = await model.generateContent(buildPrompt(req));
  const text   = res.response.text();
  if (!text) throw new Error('Empty Gemini response');
  return text.trim();
}

/* ── fallback drafts (used when no API keys are configured) ── */

const FALLBACK_DRAFTS = [
  "Really enjoyed our visit. Everything was well taken care of and the team was genuinely welcoming. Will definitely be coming back — highly recommend!",
  "Great experience from start to finish. You can tell the people here take real pride in what they do. One of those places you keep wanting to return to.",
  "Solid quality and friendly service every time. Nothing feels rushed or impersonal here. Exactly the kind of place you're happy to tell your friends about.",
  "Came on a recommendation and was not disappointed. Everything exceeded expectations and the staff made us feel right at home. Already planning our next visit.",
  "Consistently excellent. The attention to detail is obvious and it makes a real difference. This is our go-to spot now — can't recommend it enough.",
];

function fallbackReview(): string {
  return FALLBACK_DRAFTS[Math.floor(Math.random() * FALLBACK_DRAFTS.length)];
}

function hasAnyKey(): boolean {
  return (
    loadKeys('ANTHROPIC_API_KEY').length > 0 ||
    loadKeys('OPENAI_API_KEY').length    > 0 ||
    loadKeys('GEMINI_API_KEY').length    > 0
  );
}

/* ── public entry point ──────────────────────────────────── */

const PROVIDERS = [generateWithAnthropic, generateWithOpenAI, generateWithGemini];

export async function generateReview(req: ReviewRequest): Promise<string> {
  /* No keys configured at all — use fallback so the funnel stays functional */
  if (!hasAnyKey()) return fallbackReview();

  const errors: string[] = [];
  for (const provider of PROVIDERS) {
    try {
      return await provider(req);
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  /* All configured providers failed — fall back rather than break the funnel */
  console.warn('[ai/generate] All providers failed, using fallback:', errors.join(' | '));
  return fallbackReview();
}
