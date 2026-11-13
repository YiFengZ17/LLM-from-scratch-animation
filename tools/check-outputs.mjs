// 真实运行每一章最后的那条终端命令，和课程脚本里写的输出逐行比较。
//
//   node tools/verify.mjs 输出目录
//   node tools/check-outputs.mjs 输出目录 [python 路径]
//
// 第一步导出每章结束时的全部文件，第二步在各章的目录里执行脚本里写的命令，
// 比如 python scratch.py、gcc solution.c -o solution && ./solution、javac Main.java && java Main。
// 命令开头的 python / python3 换成第二个参数给的解释器（Transformer 课程需要装好 PyTorch）。
// 只核对每章最后一次运行；同一章前面的运行，输出通常是最后一次的开头几行。
import { execSync } from 'node:child_process';
import { Catalog, eachVariant, chapterDir } from './load.mjs';

const [outDir, python = 'python3', only = ''] = process.argv.slice(2);
if (!outDir) {
  console.error('用法：node tools/check-outputs.mjs 输出目录 [python 路径] [只核对 id 以此开头的章]');
  process.exit(2);
}

let bad = 0;
let checked = 0;
for (const { course, lang, chapters } of eachVariant()) {
  for (const { lesson } of chapters) {
    if (only && !lesson.id.startsWith(only)) continue;
    const runs = lesson.steps.flatMap((s) => (s.ops || []).filter((o) => o.run));
    if (!runs.length) continue;
    const last = runs[runs.length - 1];
    const expected = last.output.join('\n');
    const cmd = last.run.replace(/^python3? /, JSON.stringify(python) + ' ');
    let got;
    try {
      got = execSync(cmd, { cwd: chapterDir(outDir, course, lang, lesson), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], shell: '/bin/bash' }).trimEnd();
    } catch (e) {
      got = '（运行出错）\n' + String(e.stdout || '') + String(e.stderr || e.message).trimEnd();
    }
    checked++;
    const label = course.id + (lang ? ' · ' + Catalog.LANGS[lang].name : '') + ' · ' + lesson.id;
    if (got === expected) {
      console.log('✓ ' + label);
    } else {
      bad++;
      console.log('✗ ' + label + '\n--- 脚本里写的：\n' + expected + '\n--- 实际输出：\n' + got);
    }
  }
}
console.log(`核对了 ${checked} 次运行，${bad ? bad + ' 处不一致' : '全部一致'}`);
process.exit(bad ? 1 : 0);
