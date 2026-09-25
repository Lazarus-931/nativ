import type { ReactNode } from 'react';

export function Timeline({ children }: { children?: ReactNode }) {
  return <div className="timeline">{children}</div>;
}
