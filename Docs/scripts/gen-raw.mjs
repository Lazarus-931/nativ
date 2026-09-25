import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PAGES = path.join(ROOT, 'pages');
const PUBLIC = path.join(ROOT, 'public');
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

async function walkAll(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkAll(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function firstHeading(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : null;
}

function plainText(md) {
  return md
    .replace(/```[a-z0-9_-]*\n([\s\S]*?)```/gi, '$1')
    .replace(/{%[\s\S]*?%}/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstSummary(md) {
  const paragraphs = md
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !paragraph.startsWith('#') && !paragraph.startsWith('{%'));
  const summary = plainText(paragraphs[0] || md);
  return summary.length > 150 ? `${summary.slice(0, 147).trimEnd()}…` : summary;
}

const files = await walk(PAGES);
const entries = [];
const sourceRoutes = new Set(files.map((file) => path.relative(PAGES, file).replace(/\\/g, '/').replace(/\.md$/, '')));

for (const publicFile of await walkAll(PUBLIC)) {
  const rel = path.relative(PUBLIC, publicFile).replace(/\\/g, '/');
  if (rel === 'llms.txt' || (!rel.endsWith('.md') && !rel.endsWith('.txt'))) continue;
  const route = rel.replace(/\.(md|txt)$/, '');
  if (!sourceRoutes.has(route)) await fs.rm(publicFile);
}

for (const file of files) {
  const rel = path.relative(PAGES, file).replace(/\\/g, '/');
  const route = '/' + rel.replace(/\.md$/, '');
  const content = await fs.readFile(file, 'utf8');

  for (const ext of ['md', 'txt']) {
    const dest = path.join(PUBLIC, rel.replace(/\.md$/, `.${ext}`));
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, content);
  }

  entries.push({
    route,
    title: firstHeading(content) || route,
    excerpt: firstSummary(content),
    text: plainText(content),
  });
}

entries.sort((a, b) => a.route.localeCompare(b.route));

const llms = [
  '# Nativ documentation',
  '',
  '> The nativ way to run AI on your Mac — private, local models on Apple silicon.',
  '',
  '## Pages',
  ...entries.map((e) => `- [${e.title}](${BASE}${e.route}.md)`),
  '',
].join('\n');

await fs.mkdir(PUBLIC, { recursive: true });
await fs.writeFile(path.join(PUBLIC, 'llms.txt'), llms);
await fs.writeFile(path.join(PUBLIC, 'search-index.json'), JSON.stringify(entries, null, 2));

console.log(`gen-raw: wrote ${files.length} pages, llms.txt, and search-index.json`);
