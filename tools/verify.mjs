// 校验课程脚本，并把每一章写完后的文件导出来。
//
//   node tools/verify.mjs [输出目录]
//
// 对每门课的每种语言做三件事：
//   1. 把每一步都跑一遍，锚点写错、操作写错会在这里报出来；
//   2. 逐格播放，检查动画结果和直接跳转的结果相同，语法高亮切出来的行和源码一一对上；
//   3. 把每章结束时的全部文件存到 输出目录/课程/[语言/]章/，方便拿去真的运行一遍（见 check-outputs.mjs）。
// 接续写的课程（如 Transformer）后一章从前一章结束时的代码开始。
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Catalog, Engine, Highlight, eachVariant, chapterDir } from './load.mjs';

const outDir = process.argv[2];
let failed = false;

try {
  for (const { course, lang, chapters } of eachVariant()) {
    const label = course.id + (lang ? ' · ' + Catalog.LANGS[lang].name : '');
    let frames = 0;
    let typingMs = 0;
    for (const { lesson, compiled } of chapters) {
      const st = Engine.clone(compiled.initial);
      lesson.steps.forEach((step, i) => {
        for (const ms of Engine.runStep(st, step, Engine.rng(i + 1))) {
          frames++;
          typingMs += ms;
          if (!st.active) continue;
          const text = st.files[st.active];
          const lines = Highlight.tokenize(text, Catalog.langOfFile(st.active));
          if (lines.map((l) => l.map((t) => t.t).join('')).join('\n') !== text) {
            console.error(`✗ ${label} ${lesson.id} 第 ${i + 1} 步：高亮结果和源码不一致`);
            failed = true;
          }
        }
        if (JSON.stringify(st) !== JSON.stringify(compiled.after[i])) {
          console.error(`✗ ${label} ${lesson.id} 第 ${i + 1} 步：动画结果和直接计算的结果不一致`);
          failed = true;
        }
      });
      const final = compiled.after[compiled.after.length - 1];
      if (outDir) {
        const dir = chapterDir(outDir, course, lang, lesson);
        mkdirSync(dir, { recursive: true });
        for (const name of final.order) writeFileSync(join(dir, name), final.files[name] + '\n');
      }
    }
    const pages = chapters.reduce((n, c) => n + c.lesson.steps.length, 0);
    console.log(`✓ ${label}：${chapters.length} 章 ${pages} 页，${frames} 帧，1 倍速打字合计约 ${Math.round(typingMs / 1000)} 秒`);
  }
} catch (e) {
  console.error('✗ ' + e.message);
  failed = true;
}

process.exit(failed ? 1 : 0);
