// 用真的 Python 运行每一章的 scratch.py，和课程脚本里写的终端输出逐行比较。
//
//   node tools/verify.mjs 输出目录
//   node tools/check-outputs.mjs 输出目录 [python 路径]
//
// 第一步导出每章结束时的全部文件，第二步在各章的目录里运行 scratch.py。
// 只核对每章最后一次运行；同一章前面的运行，输出通常是最后一次的开头几行。
// python 默认用 PATH 里的 python3，需要装好 PyTorch。
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const [outDir, python = 'python3'] = process.argv.slice(2);
if (!outDir) {
  console.error('用法：node tools/check-outputs.mjs 输出目录 [python 路径]');
  process.exit(2);
}

for (const f of readdirSync(join(root, 'lessons')).sort()) {
  if (f.endsWith('.js')) require(join(root, 'lessons', f));
}

let bad = 0;
for (const lesson of globalThis.LESSONS) {
  const runs = lesson.steps.flatMap((s) => (s.ops || []).filter((o) => o.run));
  if (!runs.length) continue;
  const expected = runs[runs.length - 1].output.join('\n');
  let got;
  try {
    got = execFileSync(python, ['scratch.py'], { cwd: join(outDir, lesson.id), encoding: 'utf8' }).trimEnd();
  } catch (e) {
    got = '（运行出错）\n' + String(e.stderr || e.message).trimEnd();
  }
  if (got === expected) {
    console.log('✓ ' + lesson.id);
  } else {
    bad++;
    console.log('✗ ' + lesson.id + '\n--- 脚本里写的：\n' + expected + '\n--- 实际输出：\n' + got);
  }
}
process.exit(bad ? 1 : 0);
