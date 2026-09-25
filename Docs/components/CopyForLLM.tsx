import { useState } from 'react';
import { useRouter } from 'next/router';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function rawPath(asPath: string) {
  let p = asPath.split('#')[0].split('?')[0];
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  if (p === '' || p === '/') p = '/index';
  return `${BASE}${p}.md`;
}

export function CopyForLLM() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  async function onCopy() {
    try {
      const res = await fetch(rawPath(router.asPath));
      if (!res.ok) throw new Error('not found');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('error');
    }
    setTimeout(() => setState('idle'), 1800);
  }

  return (
    <button type="button" className="doc-action" onClick={onCopy}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h10" />
      </svg>
      {state === 'copied' ? 'Copied' : state === 'error' ? 'Copy failed' : 'Copy for LLM'}
    </button>
  );
}
