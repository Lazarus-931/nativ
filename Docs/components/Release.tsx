import type { ReactNode } from 'react';

export function Release({
  version,
  date,
  href,
  children,
}: {
  version: string;
  date?: string;
  href?: string;
  children?: ReactNode;
}) {
  return (
    <div className="release">
      <div className="release__box">
        <div className="release__meta">
          <span className="release__tag">Release notes</span>
          {date ? <span className="release__date">{date}</span> : null}
        </div>
        <h3 className="release__version">{version}</h3>
        <div className="release__body">{children}</div>
        {href ? (
          <a className="release__more" href={href} target="_blank" rel="noreferrer">
            Read more
          </a>
        ) : null}
      </div>
    </div>
  );
}
