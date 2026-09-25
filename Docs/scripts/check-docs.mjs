import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES = path.join(ROOT, 'pages');
const PUBLIC = path.join(ROOT, 'public');
const NAVIGATION = path.join(ROOT, 'lib', 'navigation.ts');

async function walk(dir, predicate = () => true) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, predicate)));
    else if (entry.isFile() && predicate(full)) out.push(full);
  }
  return out;
}

const markdownFiles = await walk(PAGES, (file) => file.endsWith('.md'));
const sourceRoutes = new Set(markdownFiles.map((file) => `/${path.relative(PAGES, file).replace(/\\/g, '/').replace(/\.md$/, '')}`));
sourceRoutes.add('/');

const errors = [];
const warnings = [];

function lineFor(content, index) {
  return content.slice(0, index).split('\n').length;
}

for (const file of markdownFiles) {
  const rel = path.relative(ROOT, file);
  const content = await fs.readFile(file, 'utf8');

  if (!/^#\s+\S+/m.test(content)) errors.push(`${rel}: missing H1 title`);
  if (content.trim().split('\n').length <= 2) warnings.push(`${rel}: placeholder page`);

  for (const match of content.matchAll(/\[[^\]]+\]\((\/[^)#?]+)(?:[?#][^)]*)?\)/g)) {
    const href = match[1].replace(/\/$/, '') || '/';
    if (!sourceRoutes.has(href)) errors.push(`${rel}:${lineFor(content, match.index ?? 0)} broken internal link ${href}`);
  }

  for (const match of content.matchAll(/src="(\/assets\/[^"]+)"/g)) {
    const asset = path.join(PUBLIC, match[1]);
    try {
      await fs.access(asset);
    } catch {
      errors.push(`${rel}:${lineFor(content, match.index ?? 0)} missing asset ${match[1]}`);
    }
  }

  for (const match of content.matchAll(/{%\s+(image|annotatedimage)\s+([^%]+)%}/g)) {
    const attributes = match[2];
    if (!/\balt="[^"]+"/.test(attributes)) errors.push(`${rel}:${lineFor(content, match.index ?? 0)} image missing alt text`);
    if (!/\bcaption="[^"]+"/.test(attributes)) errors.push(`${rel}:${lineFor(content, match.index ?? 0)} image missing caption`);
  }

  const routeRel = path.relative(PAGES, file).replace(/\\/g, '/').replace(/\.md$/, '');
  for (const extension of ['md', 'txt']) {
    try {
      await fs.access(path.join(PUBLIC, `${routeRel}.${extension}`));
    } catch {
      errors.push(`${rel}: generated public/${routeRel}.${extension} is missing`);
    }
  }
}

const navigationSource = await fs.readFile(NAVIGATION, 'utf8');
const navigationRoutes = [...navigationSource.matchAll(/href:\s*'([^']+)'/g)].map((match) => match[1]);
const seenRoutes = new Set();
for (const route of navigationRoutes) {
  if (seenRoutes.has(route)) errors.push(`lib/navigation.ts: duplicate route ${route}`);
  seenRoutes.add(route);
  if (!sourceRoutes.has(route)) errors.push(`lib/navigation.ts: route has no page ${route}`);
}

const publicRawFiles = await walk(PUBLIC, (file) => /\.(md|txt)$/.test(file) && path.basename(file) !== 'llms.txt');
for (const file of publicRawFiles) {
  const rel = path.relative(PUBLIC, file).replace(/\\/g, '/');
  const source = rel.replace(/\.(md|txt)$/, '');
  if (!sourceRoutes.has(`/${source}`)) errors.push(`public/${rel}: stale generated documentation file`);
}

for (const warning of warnings) console.warn(`warning: ${warning}`);
if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  console.error(`check-docs: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}

console.log(`check-docs: passed with ${warnings.length} placeholder-page warning(s)`);
