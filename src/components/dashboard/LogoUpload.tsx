'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onSuccess?: (logoUrl: string | null) => void;
}

type Mode = 'default' | 'url';

const MAX_MB    = 2;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ALLOWED   = ['image/png', 'image/jpeg', 'image/webp'];

export function LogoUpload({ currentLogoUrl, onSuccess }: LogoUploadProps) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [preview,  setPreview] = useState<string | null>(currentLogoUrl ?? null);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState<string | null>(null);
  const [mode,     setMode]    = useState<Mode>('default');
  const [urlInput, setUrlInput]= useState('');

  /* ── file upload ─────────────────────────────────────────── */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED.includes(file.type)) {
      setError('Only PNG, JPG, or WebP files are supported.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large. Maximum is ${MAX_MB} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('logo', file);
      const res  = await fetch('/api/businesses/logo', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? 'Upload failed. Please try again.');
        setPreview(currentLogoUrl ?? null);
        return;
      }
      onSuccess?.(json.logo_url);
    } catch {
      setError('Network error. Please try again.');
      setPreview(currentLogoUrl ?? null);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  /* ── URL save ────────────────────────────────────────────── */
  async function saveUrl() {
    const url = urlInput.trim();
    if (!url) { setError('Please enter a URL.'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/businesses/logo', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Failed to save URL.'); return; }
      setPreview(url);
      setMode('default');
      setUrlInput('');
      onSuccess?.(json.logo_url);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── remove ──────────────────────────────────────────────── */
  async function removeLogo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/businesses/logo', { method: 'DELETE' });
      if (!res.ok) { const j = await res.json(); setError(j.error ?? 'Failed to remove.'); return; }
      setPreview(null);
      setMode('default');
      onSuccess?.(null);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Preview tile + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Clickable preview / upload tile */}
        <button
          type="button"
          onClick={() => { if (!loading) inputRef.current?.click(); }}
          disabled={loading}
          aria-label="Upload logo"
          style={{
            position:       'relative',
            width:          64, height: 64,
            borderRadius:   10,
            border:         '2px dashed',
            borderColor:    preview ? 'transparent' : 'var(--lp-border, #d1d5db)',
            background:     preview ? 'transparent' : 'var(--lp-surface-muted, #f3f4f6)',
            cursor:         loading ? 'not-allowed' : 'pointer',
            overflow:       'hidden',
            flexShrink:     0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            transition:     'border-color .15s',
          }}
        >
          {preview ? (
            <Image src={preview} alt="Business logo" fill className="object-cover" sizes="64px" unoptimized />
          ) : (
            <UploadIcon />
          )}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.75)',
            }}>
              <SpinnerIcon />
            </div>
          )}
        </button>

        {/* Labels + buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lp-fg, #111)' }}>
            {preview ? 'Logo uploaded' : 'No logo yet'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--lp-fg-muted, #6b7280)' }}>
            PNG / JPG / WebP · max {MAX_MB} MB
          </span>
          <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            <ActionBtn onClick={() => inputRef.current?.click()} disabled={loading}>
              {preview ? 'Change file' : 'Upload file'}
            </ActionBtn>
            <ActionBtn
              onClick={() => { setMode(m => m === 'url' ? 'default' : 'url'); setError(null); }}
              disabled={loading}
              secondary
            >
              {mode === 'url' ? 'Cancel' : 'Use URL'}
            </ActionBtn>
            {preview && (
              <ActionBtn onClick={removeLogo} disabled={loading} danger>Remove</ActionBtn>
            )}
          </div>
        </div>
      </div>

      {/* URL input panel */}
      {mode === 'url' && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={urlInput}
            onChange={e => { setUrlInput(e.target.value); setError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') saveUrl(); if (e.key === 'Escape') { setMode('default'); setUrlInput(''); } }}
            disabled={loading}
            autoFocus
            style={{
              flex: 1, height: 34, padding: '0 10px',
              borderRadius: 6, border: '1px solid var(--lp-border, #d1d5db)',
              background: 'var(--lp-surface, #fff)', color: 'var(--lp-fg, #111)',
              fontSize: 12, outline: 'none',
            }}
          />
          <ActionBtn onClick={saveUrl} disabled={loading || !urlInput.trim()}>Save</ActionBtn>
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" style={{ fontSize: 11, color: 'var(--lp-danger, #ef4444)', margin: 0 }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={loading}
      />
    </div>
  );
}

/* ── small shared sub-components ─── */

function ActionBtn({
  children, onClick, disabled, secondary, danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  secondary?: boolean;
  danger?: boolean;
}) {
  let bg    = 'var(--lp-primary, #6E5BFF)';
  let color = '#fff';
  if (secondary) { bg = 'transparent'; color = 'var(--lp-fg-muted, #6b7280)'; }
  if (danger)    { bg = 'transparent'; color = 'var(--lp-danger, #ef4444)'; }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
        background: bg, color,
        border: secondary || danger ? '1px solid var(--lp-border, #d1d5db)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity .15s',
        lineHeight: '20px',
      }}
    >
      {children}
    </button>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'var(--lp-fg-muted, #9ca3af)' }} aria-hidden>
      <path d="M17 13v3a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16v-3"/>
      <polyline points="13.5 6.5 10 3 6.5 6.5"/>
      <line x1="10" y1="3" x2="10" y2="12"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         style={{ animation: 'spin 1s linear infinite', color: 'var(--lp-primary, #6E5BFF)' }} aria-hidden>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
