import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { navigation, isSection, type NavLink as NavLinkT } from '../lib/navigation';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function normalize(path: string) {
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function Logo({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <span className="sidenav__logo">
      <img src={`${BASE}${src}`} alt="" />
    </span>
  );
}

export function SideNav({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = normalize(router.pathname);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = document.getElementById('docs-navigation');
      const focusable = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      document.querySelector<HTMLElement>('.site-title__menu')?.focus();
    };
  }, [isOpen, onClose]);

  const linkItem = (link: NavLinkT, cls: string) => {
    const active = normalize(link.href) === current;
    return (
      <Link
        href={link.href}
        className={active ? `${cls} is-active` : cls}
        aria-current={active ? 'page' : undefined}
        onClick={onClose}
      >
        {link.logo ? <Logo src={link.logo} /> : null}
        {link.title}
      </Link>
    );
  };

  return (
    <>
      <button
        type="button"
        className={isOpen ? 'sidenav-overlay is-visible' : 'sidenav-overlay'}
        aria-label="Close documentation navigation"
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        id="docs-navigation"
        className={isOpen ? 'sidenav is-open' : 'sidenav'}
        aria-label="Documentation navigation"
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? true : undefined}
      >
        <div className="sidenav__mobile-head">
          <span>Documentation</span>
          <button ref={closeRef} type="button" aria-label="Close documentation navigation" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <nav className="sidenav__inner" aria-label="Documentation">
          {navigation.map((item) => {
            if (!isSection(item)) {
              const active = normalize(item.href) === current;
              const cls = ['sidenav__toplink', item.accent ? 'is-accent' : '', active ? 'is-active' : '']
                .filter(Boolean)
                .join(' ');
              return (
                <div key={item.href} className="sidenav__section">
                  <Link href={item.href} className={cls} aria-current={active ? 'page' : undefined} onClick={onClose}>
                    {item.title}
                  </Link>
                </div>
              );
            }

            const headingActive = item.href ? normalize(item.href) === current : false;
            return (
              <div key={item.title} className="sidenav__section">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={headingActive ? 'sidenav__heading is-active' : 'sidenav__heading'}
                    aria-current={headingActive ? 'page' : undefined}
                    onClick={onClose}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="sidenav__heading">{item.title}</p>
                )}

                {item.groups ? (
                  item.groups.map((group) => {
                    const groupActive = group.href ? normalize(group.href) === current : false;
                    const head = group.href ? (
                      <Link
                        href={group.href}
                        className={groupActive ? 'sidenav__grouphead is-active' : 'sidenav__grouphead'}
                        aria-current={groupActive ? 'page' : undefined}
                        onClick={onClose}
                      >
                        <Logo src={group.logo} />
                        {group.title}
                      </Link>
                    ) : (
                      <p className="sidenav__grouphead">
                        <Logo src={group.logo} />
                        {group.title}
                      </p>
                    );
                    return (
                      <div key={group.title} className="sidenav__group">
                        {head}
                        {group.links.length > 0 ? (
                          <ul className="sidenav__sublist">
                            {group.links.map((link) => (
                              <li key={link.href}>{linkItem(link, 'sidenav__sublink')}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <ul className="sidenav__list">
                    {item.links?.map((link) => (
                      <li key={link.href}>{linkItem(link, 'sidenav__link')}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
