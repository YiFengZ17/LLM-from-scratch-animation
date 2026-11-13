// 校验课程脚本，并把每个文件的最终内容导出来。
//
//   node tools/verify.mjs [输出目录]
//
// 做三件事：
//   1. 把每一步都跑一遍，锚点写错、操作写错会在这里报出来；
//   2. 检查语法高亮切出来的行和源码能一一对上；
//   3. 把写完之后的文件存到输出目录，方便拿去真的运行一遍。
//
// 各章按顺序接续：后一章从前一章结束时的代码开始写。
// 每一章导出的是那一章结束时的全部文件，所以在各章的目录里运行 scratch.py，用的就是当时的 model.py。
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

require(join(root, 'js/highlight.js'));
require(join(root, 'js/engine.js'));
for (const f of readdirSync(join(root, 'lessons')).sort()) {
  if (f.endsWith('.js')) require(join(root, 'lessons', f));
}

const { Engine, Highlight, LESSONS } = globalThis;
const outDir = process.argv[2];
let failed = false;
let previous = null; // 上一章结束时的状态

for (const lesson of LESSONS) {
  let compiled;
  try {
    compiled = Engine.compile(lesson, previous);
  } catch (e) {
    console.error(`✗ ${lesson.id}: ${e.message}`);
    failed = true;
    break;
  }

  // 动画一格一格播完，必须和一口气算出来的结果相同；每一格的高亮也要和源码对得上
  let st = Engine.clone(compiled.initial);
  let frames = 0;
  let typingMs = 0;
  lesson.steps.forEach((step, i) => {
    for (const ms of Engine.runStep(st, step, Engine.rng(i + 1))) {
      frames++;
      typingMs += ms;
      const text = st.files[st.active];
      const lines = Highlight.tokenize(text);
      const rebuilt = lines.map((l) => l.map((t) => t.t).join('')).join('\n');
      if (rebuilt !== text) {
        console.error(`✗ ${lesson.id} 第 ${i + 1} 步：高亮结果和源码不一致`);
        failed = true;
      }
    }
    if (JSON.stringify(st) !== JSON.stringify(compiled.after[i])) {
      console.error(`✗ ${lesson.id} 第 ${i + 1} 步：动画结果和直接计算的结果不一致`);
      failed = true;
    }
  });

  const final = compiled.after[compiled.after.length - 1];
  previous = final;
  console.log(`✓ ${lesson.id}: ${lesson.steps.length} 步，${frames} 帧，1 倍速打字合计约 ${Math.round(typingMs / 1000)} 秒`);
  for (const name of final.order) {
    console.log(`    ${name}: ${final.files[name].split('\n').length} 行`);
    if (outDir) {
      mkdirSync(join(outDir, lesson.id), { recursive: true });
      writeFileSync(join(outDir, lesson.id, name), final.files[name] + '\n');
    }
  }
}

process.exit(failed ? 1 : 0);
