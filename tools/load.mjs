// 在 Node 里加载课程目录、播放引擎、语法高亮和全部课程脚本，供校验工具使用。
// 加载顺序和页面里一样：目录 → 引擎 → 公共写法 → 各门课（每门课先加载 00-course.js）。
import { createRequire } from 'node:module';
import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

for (const f of ['js/catalog.js', 'js/highlight.js', 'js/engine.js', 'lessons/kit.js']) require(join(root, f));
const lessons = join(root, 'lessons');
for (const dir of readdirSync(lessons).sort()) {
  const full = join(lessons, dir);
  if (!statSync(full).isDirectory()) continue;
  for (const f of readdirSync(full).sort()) if (f.endsWith('.js')) require(join(full, f));
}

export const { Catalog, Engine, Highlight } = globalThis;

// 每门课的每种语言（没有多种语言的课程只有一个 null），依次给出编译好的各章
export function* eachVariant() {
  for (const course of Catalog.courses) {
    for (const lang of course.langs || [null]) {
      let previous = null;
      const chapters = [];
      for (const lesson of course.chapters) {
        const resolved = Catalog.resolve(lesson, lang);
        const compiled = Engine.compile(resolved, course.chain ? previous : null);
        previous = compiled.after[compiled.after.length - 1];
        chapters.push({ lesson: resolved, compiled });
      }
      yield { course, lang, chapters };
    }
  }
}

// 某一章导出的目录：输出目录/课程/[语言/]章
export const chapterDir = (out, course, lang, lesson) => join(out, course.id, ...(lang ? [lang] : []), lesson.id);
