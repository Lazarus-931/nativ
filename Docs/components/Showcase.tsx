import Link from 'next/link';
import type { ReactNode } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function Showcase({
  title,
  image,
  alt,
  href,
  cta,
  children,
}: {
  title: string;
  image?: string;
  alt?: string;
  href?: string;
  cta?: string;
  children?: ReactNode;
}) {
  return (
    <section className="showcase">
      <div className="showcase__text">
        <h2 className="showcase__title">{title}</h2>
        <div className="showcase__body">{children}</div>
        {href && cta ? (
          <Link href={href} className="showcase__cta">
            {cta} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
      {image ? (
        <div className="showcase__media">
          <img src={`${BASE}${image}`} alt={alt || title} />
        </div>
      ) : null}
    </section>
  );
}
