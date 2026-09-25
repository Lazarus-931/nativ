import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

type SearchEntry = {
  route: string;
  title: string;
  excerpt: string;
  text: string;
};

export function TopBar({
  showNavToggle = false,
  onNavToggle,
}: {
  showNavToggle?: boolean;
  onNavToggle?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch(`${BASE}/search-index.json`)
      .then((response) => response.json())
      .then((data: SearchEntry[]) => setEntries(data))
      .catch(() => setEntries([]));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    setQuery('');
    setFocused(false);
  }, [router.asPath]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];

    return entries
      .map((entry) => {
        const title = entry.title.toLowerCase();
        const text = entry.text.toLowerCase();
        const score = title === needle ? 0 : title.startsWith(needle) ? 1 : title.includes(needle) ? 2 : text.includes(needle) ? 3 : 99;
        return { entry, score };
      })
      .filter((item) => item.score < 99)
      .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 8)
      .map((item) => item.entry);
  }, [entries, query]);

  useEffect(() => setActiveIndex(0), [query]);

  const isOpen = focused && query.trim().length >= 2;
  const goToResult = (entry: SearchEntry) => {
    setFocused(false);
    setQuery('');
    void router.push(entry.route);
  };

  return (
    <header className="site-title">
      {showNavToggle ? (
        <button
          type="button"
          className="site-title__menu"
          aria-label="Open documentation navigation"
          aria-controls="docs-navigation"
          onClick={onNavToggle}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      ) : null}

      <Link href="/" className="site-title__link" aria-label="Nativ docs home">
        <span className="site-title__name">Nativ</span>
        <span className="site-title__docs">docs</span>
      </Link>

      <div ref={searchRef} className="site-search">
        <svg
          className="site-search__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className="site-search__input"
          placeholder="Search documentation"
          aria-label="Search documentation"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="site-search-results"
          aria-activedescendant={isOpen && results.length > 0 ? `site-search-result-${activeIndex}` : undefined}
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setFocused(false);
              inputRef.current?.blur();
            } else if (event.key === 'ArrowDown' && results.length > 0) {
              event.preventDefault();
              setActiveIndex((index) => (index + 1) % results.length);
            } else if (event.key === 'ArrowUp' && results.length > 0) {
              event.preventDefault();
              setActiveIndex((index) => (index - 1 + results.length) % results.length);
            } else if (event.key === 'Enter' && results[activeIndex]) {
              event.preventDefault();
              goToResult(results[activeIndex]);
            }
          }}
        />
        <kbd className="site-search__shortcut">⌘K</kbd>

        {isOpen ? (
          <div id="site-search-results" className="site-search__results" role="listbox">
            {results.length > 0 ? (
              results.map((entry, index) => (
                <button
                  id={`site-search-result-${index}`}
                  key={entry.route}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? 'site-search__result is-active' : 'site-search__result'}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToResult(entry)}
                >
                  <span className="site-search__result-title">{entry.title}</span>
                  <span className="site-search__result-excerpt">{entry.excerpt}</span>
                </button>
              ))
            ) : (
              <p className="site-search__empty">No documentation found.</p>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
