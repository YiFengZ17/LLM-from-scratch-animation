// 把 index.html 和它引用的 css、js 合并成一个单独的 HTML 文件，方便直接发给别人或嵌到别处。
//
//   node tools/bundle.mjs [输出文件]          默认输出到 dist/index.html
//   node tools/bundle.mjs 输出文件 --fragment  只输出页面内容，不带 <html>/<head>/<body> 外壳
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fragment = args.includes('--fragment');
const out = args.find((a) => !a.startsWith('--')) || join(root, 'dist/index.html');
const read = (p) => readFileSync(join(root, p), 'utf8');

let html = read('index.html')
  .replace(/<link rel="stylesheet" href="([^"]+)">/g, (tag, href) => (/^https?:/.test(href) ? tag : `<style>\n${read(href)}</style>`))
  .replace(/<script src="([^"]+)"><\/script>/g, (tag, src) => (/^https?:/.test(src) ? tag : `<script>\n${read(src)}</script>`));

if (fragment) {
  const title = html.match(/<title>[^<]*<\/title>/)[0];
  const head = html.match(/<head>([\s\S]*)<\/head>/)[1];
  const links = head.match(/<link [^>]*>/g) || [];
  const styles = head.match(/<style>[\s\S]*?<\/style>/g) || [];
  const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
  html = `${title}\n${links.join('\n')}\n${styles.join('\n')}\n${body.trim()}\n`;
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`已生成 ${out}（${(html.length / 1024).toFixed(1)} KB）`);
