import Link from 'next/link';
import { useRouter } from 'next/router';
import { documentPages } from '../lib/navigation';

const pages = documentPages();

function normalize(path: string) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function Arrow({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {direction === 'previous' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 6 6 6-6 6" />}
    </svg>
  );
}

export function DocPagination() {
  const router = useRouter();
  const currentIndex = pages.findIndex((page) => normalize(page.href) === normalize(router.pathname));

  if (currentIndex < 0) return null;

  const previous = pages[currentIndex - 1];
  const next = pages[currentIndex + 1];

  if (!previous && !next) return null;

  return (
    <nav className="doc-pagination" aria-label="Previous and next documentation pages">
      {previous ? (
        <Link className="doc-pagination__link doc-pagination__link--previous" href={previous.href}>
          <Arrow direction="previous" />
          <span>
            <span className="doc-pagination__direction">Previous</span>
            <span className="doc-pagination__title">{previous.title}</span>
          </span>
        </Link>
      ) : <span />}

      {next ? (
        <Link className="doc-pagination__link doc-pagination__link--next" href={next.href}>
          <span>
            <span className="doc-pagination__direction">Next</span>
            <span className="doc-pagination__title">{next.title}</span>
          </span>
          <Arrow direction="next" />
        </Link>
      ) : <span />}
    </nav>
  );
}
