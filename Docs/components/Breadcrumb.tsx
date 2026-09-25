import Link from 'next/link';
import { useRouter } from 'next/router';
import { navigation, isSection } from '../lib/navigation';

function buildTitleMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of navigation) {
    if (isSection(item)) {
      if (item.href) map[item.href] = item.title;
      for (const link of item.links ?? []) map[link.href] = link.title;
      for (const group of item.groups ?? []) {
        if (group.href) map[group.href] = group.title;
        for (const link of group.links) map[link.href] = link.title;
      }
    } else {
      map[item.href] = item.title;
    }
  }
  return map;
}

const TITLES = buildTitleMap();

function prettify(seg: string) {
  return seg
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function normalize(path: string) {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

type Crumb = { title: string; href?: string };

export function Breadcrumb() {
  const router = useRouter();
  const segments = normalize(router.pathname).split('/').filter(Boolean);

  const crumbs: Crumb[] = [{ title: 'Home', href: '/' }];
  let cumulative = '';
  segments.forEach((seg, i) => {
    cumulative += `/${seg}`;
    const title = TITLES[cumulative] || prettify(seg);
    const isLast = i === segments.length - 1;
    if (!isLast && TITLES[cumulative]) crumbs.push({ title, href: cumulative });
    else crumbs.push({ title });
  });

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={i} className="breadcrumb__item">
          {crumb.href ? <Link href={crumb.href}>{crumb.title}</Link> : <span>{crumb.title}</span>}
          {i < crumbs.length - 1 && <span className="breadcrumb__sep">/</span>}
        </span>
      ))}
    </nav>
  );
}
