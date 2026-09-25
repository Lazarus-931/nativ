import Link from 'next/link';
import type { ReactNode } from 'react';

export function Step({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children?: ReactNode;
}) {
  return (
    <div className="step">
      <Link href={href} className="step__title">
        {title}
      </Link>
      <div className="step__body">{children}</div>
    </div>
  );
}
