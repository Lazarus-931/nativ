import Link from 'next/link';
import { navigation, isSection } from '../lib/navigation';
import { releases } from '../lib/releases';

export default function Home() {
  const sections = navigation.filter(isSection);
  const latestNum = releases[0].version.replace(/^Nativ\s*/i, '');

  return (
    <div className="home">
      <h1>Nativ documentation</h1>
      <p className="home__lead">
        Install Nativ, run models locally on your Mac, and connect your tools to a private local API.
      </p>

      <section className="home__whatsnew">
        <h2>What&apos;s new</h2>
        <Link href="/new" className="whatsnew__latest">
          → Release {latestNum}
        </Link>
      </section>

      <div className="home__sections">
        {sections.map((section) => {
          const items = section.groups
            ? section.groups.map((g) => ({ title: g.title, href: g.href }))
            : (section.links ?? []).map((l) => ({ title: l.title, href: l.href }));
          return (
            <section key={section.title} className="home__section">
              <h2>{section.href ? <Link href={section.href}>{section.title}</Link> : section.title}</h2>
              <ul>
                {items.map((item) => (
                  <li key={item.href ?? item.title}>
                    {item.href ? <Link href={item.href}>{item.title}</Link> : item.title}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
