const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function DocHelp() {
  return (
    <div className="doc-help">
      <p className="doc-help__row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.5" />
          <path d="M14.5 9.5 18 6M9.5 14.5 6 18M14.5 14.5 18 18M9.5 9.5 6 6" />
        </svg>
        <span>
          Have an issue?{' '}
          <a href="https://github.com/Blaizzy/nativ/issues" target="_blank" rel="noreferrer">
            Open a GitHub issue
          </a>
          .
        </span>
      </p>

      <p className="doc-help__row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="m7 9 3 2-3 2M13 13h4" />
        </svg>
        <span>
          Chat with Nativ devs on{' '}
          <a href="https://discord.gg/V4WbKXF45B" target="_blank" rel="noreferrer">
            Discord
          </a>
          .
        </span>
      </p>

      <p className="doc-help__row">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z" />
        </svg>
        <span>
          LLM?{' '}
          <a href={`${BASE}/llms.txt`} target="_blank" rel="noreferrer">
            Read llms.txt
          </a>
          .
        </span>
      </p>
    </div>
  );
}
