import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const required = ['index.html', 'style.css', 'menu.js', 'bezugsquellen.html', 'impressum.html'];
const errors = [];

for (const file of required) {
  if (!existsSync(join(root, file))) errors.push(`Missing required file: ${file}`);
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['.git', 'node_modules'].includes(entry.name)) return [];
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root);
for (const file of files.filter((item) => extname(item) === '.html')) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  if (!/<html[^>]+lang=["'][^"']+["']/i.test(html)) errors.push(`${rel}: missing html lang attribute`);
  if (!/<meta[^>]+charset=/i.test(html)) errors.push(`${rel}: missing charset declaration`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${rel}: missing page title`);

  const refs = [...html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)].map((match) => match[1]);
  for (const ref of refs) {
    if (/^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(ref)) continue;
    const target = resolve(join(file, '..'), ref);
    const candidates = [target, join(target, 'index.html')];
    if (!candidates.some(existsSync)) errors.push(`${rel}: broken local reference ${ref}`);
  }
}

if (errors.length) {
  console.error(`Project check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Project check passed. Checked ${files.length} files.`);
