import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { SideNav } from '../components/SideNav';
import { SiteFooter } from '../components/SiteFooter';
import { CopyForLLM } from '../components/CopyForLLM';
import { DocHelp } from '../components/DocHelp';
import { Breadcrumb } from '../components/Breadcrumb';
import { DocPagination } from '../components/DocPagination';
import { navigation, isSection } from '../lib/navigation';

function pageTitle(pathname: string) {
  if (pathname === '/') return 'Nativ documentation';
  for (const item of navigation) {
    if (!isSection(item)) {
      if (item.href === pathname) return item.title;
      continue;
    }
    if (item.href === pathname) return item.title;
    for (const link of item.links ?? []) if (link.href === pathname) return link.title;
    for (const group of item.groups ?? []) {
      if (group.href === pathname) return group.title;
      for (const link of group.links) if (link.href === pathname) return link.title;
    }
  }
  return pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Documentation';
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLanding = router.pathname === '/';
  const [navOpen, setNavOpen] = useState(false);
  const title = pageTitle(router.pathname);

  useEffect(() => setNavOpen(false), [router.asPath]);

  return (
    <div className="page">
      <Head>
        <title>{isLanding ? title : `${title} · Nativ docs`}</title>
        <meta
          name="description"
          content="Learn how to install Nativ, run local AI models on your Mac, and configure private local workflows."
        />
      </Head>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <TopBar showNavToggle={!isLanding} onNavToggle={() => setNavOpen(true)} />
      <div className="page__main">
        {isLanding ? (
          <main id="main-content" tabIndex={-1}>
            <Component {...pageProps} />
          </main>
        ) : (
          <div className="layout">
            <SideNav isOpen={navOpen} onClose={() => setNavOpen(false)} />
            <main id="main-content" className="content" tabIndex={-1}>
              <div className="doc-topbar">
                <Breadcrumb />
                <CopyForLLM />
              </div>
              <article className="doc-article">
                <Component {...pageProps} />
              </article>
              <div className="doc-actions doc-actions--bottom">
                <CopyForLLM />
              </div>
              <DocPagination />
              <DocHelp />
            </main>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
