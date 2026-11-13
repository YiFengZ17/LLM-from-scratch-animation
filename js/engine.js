/*
 * 播放引擎：把「一步里的若干操作」展开成一连串很小的编辑动作。
 *
 * 引擎本身不碰 DOM，也不计时。runStep 是一个生成器：
 * 每执行一个小动作（打一个字符、移动光标、选中一段……）就 yield 一次，
 * yield 的值是「这个动作之后建议停顿多少毫秒」（1 倍速下）。
 *
 *   - 播放器按这个节奏一下一下取，就是打字动画；
 *   - 一口气取完，就是这一步的最终结果（用于后退、跳转、校验）。
 *
 * 两种用法走的是同一段代码，所以动画播完的结果和直接跳过去的结果一定相同。
 * 以后要抽帧做视频，也只需要换一个驱动方式。
 *
 * 一步（step）里可以写的操作（op）：
 *   { type: '文本' }                        在文件末尾打字
 *   { type: '文本', after: '锚点' }          在锚点文本之后打字（回头补代码）
 *   { type: '文本', before: '锚点' }         在锚点文本之前打字
 *   { replace: '旧文本', with: '新文本' }     选中旧文本，删掉，打新文本
 *   { remove: '文本' }                       选中并删掉
 *   { clear: '文件名' }                      全选这个文件并删掉，准备重写
 *   { run: '命令', output: ['一行', ...] }   在终端里运行并显示输出
 *   { pause: 毫秒 }                          停一下
 * 每个操作都可以带 file: '文件名'，不带就沿用这一步的 file 或当前文件。
 * 打字的操作（type、replace）还可以带 note: '说明'：这一行为什么这样写、用到了什么语法。
 * 说明不写进文件，只用来展示：引擎记下它对应文件里的哪个位置，之后插入、删除代码时跟着移动。
 * 锚点文本必须在文件里恰好出现一次，否则加载时直接报错。
 *
 * 一门课分成好几章，后一章接着前一章写完的代码继续：compile 的第二个参数就是前一章结束时的状态。
 */
(function (root) {
  'use strict';

  const TYPE_MS = 55; // 1 倍速下每个字符的平均间隔
  const NEWLINE_MS = 320; // 换行后的停顿，给人看完上一行的时间
  const JUMP_MS = 650; // 光标跳到别处后的停顿，让视线跟上
  const SELECT_MS = 750; // 选中一段文本后的停顿
  const NOTE_BASE_MS = 500; // 一行说明出现后，至少停这么久再开始打这一行
  const NOTE_CHAR_MS = 45; // 说明每多一个字，多停这么久
  const NOTE_MAX_MS = 4500;

  // 固定种子的随机数，保证同一步每次播放的节奏完全一致
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clone(st) {
    return JSON.parse(JSON.stringify(st));
  }

  // notes：这一步的旁白和逐行说明在文件里的位置。
  //   { kind: 'say', file, pos, where }  这一步的旁白放在哪里（where 是 'after' 或 'before' 这一行）
  //   { kind: 'note', file, pos, text }  一行代码的说明，放在这一行上方
  function newState(lesson) {
    const st = { files: {}, order: [], active: null, cursor: {}, marks: {}, notes: [], sel: null, term: null };
    if (lesson.files.length) openFile(st, lesson.files[0]);
    return st;
  }

  function openFile(st, name) {
    if (!(name in st.files)) {
      st.files[name] = '';
      st.cursor[name] = 0;
      st.order.push(name);
    }
    const switched = st.active !== name;
    st.active = name;
    return switched;
  }

  function findUnique(text, needle, file) {
    const i = text.indexOf(needle);
    if (i < 0) throw new Error(`在 ${file} 里找不到锚点：${JSON.stringify(needle)}`);
    if (text.indexOf(needle, i + 1) >= 0) throw new Error(`锚点在 ${file} 里出现了不止一次：${JSON.stringify(needle)}`);
    return i;
  }

  // marks 记录「这一步里新打出来的文本范围」，用来在行号旁画出改动标记
  function insert(st, file, pos, s) {
    const text = st.files[file];
    st.files[file] = text.slice(0, pos) + s + text.slice(pos);
    st.cursor[file] = pos + s.length;
    for (const n of st.notes) if (n.file === file && n.pos > pos) n.pos += s.length;
    const ranges = st.marks[file] || (st.marks[file] = []);
    let merged = false;
    for (const r of ranges) {
      if (!merged && pos >= r[0] && pos <= r[1]) {
        r[1] += s.length;
        merged = true;
      } else if (pos <= r[0]) {
        r[0] += s.length;
        r[1] += s.length;
      }
    }
    if (!merged) ranges.push([pos, pos + s.length]);
  }

  function remove(st, file, a, b) {
    const text = st.files[file];
    st.files[file] = text.slice(0, a) + text.slice(b);
    st.cursor[file] = a;
    const shift = (p) => (p <= a ? p : p >= b ? p - (b - a) : a);
    for (const n of st.notes) if (n.file === file) n.pos = shift(n.pos);
    st.marks[file] = (st.marks[file] || [])
      .map((r) => [shift(r[0]), shift(r[1])])
      .filter((r) => r[1] > r[0]);
  }

  // 把要打的文本切成「一次按键」的小块：回车和它后面的缩进算一次（编辑器会自动缩进）
  function chunks(text) {
    const cps = Array.from(text);
    const out = [];
    for (let i = 0; i < cps.length; i++) {
      if (cps[i] === '\n') {
        let j = i + 1;
        while (j < cps.length && cps[j] === ' ') j++;
        out.push(cps.slice(i, j).join(''));
        i = j - 1;
      } else {
        out.push(cps[i]);
      }
    }
    return out;
  }

  function keyDelay(chunk, rand) {
    if (chunk[0] === '\n') return NEWLINE_MS + rand() * 140;
    let d = TYPE_MS * (0.65 + rand() * 0.7);
    if (chunk === ' ') d *= 0.75;
    else if (',:=()#'.includes(chunk)) d += 45;
    return d;
  }

  // sayNewline：这一步的旁白放在光标所在行的下面（true）还是上面（false），见 placeSay
  function* moveCursor(st, file, pos, switched, sayNewline) {
    const moved = switched || st.cursor[file] !== pos;
    st.cursor[file] = pos;
    placeSay(st, file, sayNewline);
    yield moved ? JUMP_MS : 0;
  }

  // 这一步第一次落笔的位置，就是旁白在「注释」模式下出现的位置：
  // 新写的代码从下一行开始时，旁白放在光标所在行的下面，否则放在它上面
  function placeSay(st, file, startsWithNewline) {
    if (st.notes.some((n) => n.kind === 'say')) return;
    st.notes.push({ kind: 'say', file, pos: st.cursor[file], where: startsWithNewline ? 'after' : 'before' });
  }

  // 带说明的打字：先打开头的换行和缩进，光标落到这一行的第一个字上，再把说明记在这里
  function* typeWithNote(st, file, text, note, rand) {
    const lead = /^(?:\n *)*/.exec(text)[0];
    yield* typeText(st, file, lead, rand);
    if (note) {
      st.notes.push({ kind: 'note', file, pos: st.cursor[file], text: note });
      // 说明出现后先停一下，留出读它的时间：字越多停得越久
      yield Math.min(NOTE_MAX_MS, NOTE_BASE_MS + String(note).length * NOTE_CHAR_MS);
    }
    yield* typeText(st, file, text.slice(lead.length), rand);
  }

  function* typeText(st, file, text, rand) {
    for (const c of chunks(text)) {
      insert(st, file, st.cursor[file], c);
      yield keyDelay(c, rand);
    }
  }

  function* runOp(st, op, step, rand) {
    if (op.pause != null) {
      yield op.pause;
      return;
    }

    if (op.run != null) {
      st.term = { cmd: '', lines: [], done: false };
      yield 500;
      for (const ch of Array.from(op.run)) {
        st.term.cmd += ch;
        yield TYPE_MS * (0.7 + rand() * 0.6);
      }
      yield 700;
      for (const line of op.output || []) {
        st.term.lines.push(line);
        yield 380;
      }
      st.term.done = true;
      yield 0;
      return;
    }

    const file = op.clear || op.file || step.file || st.active;
    const switched = openFile(st, file);
    const text = st.files[file];

    if (op.clear != null) {
      yield* moveCursor(st, file, text.length, switched, false);
      if (text.length) {
        st.sel = { file, from: 0, to: text.length };
        yield SELECT_MS;
        remove(st, file, 0, text.length);
        st.sel = null;
        yield 400;
      }
      return;
    }

    if (op.type != null) {
      let pos = text.length;
      if (op.after != null) pos = findUnique(text, op.after, file) + op.after.length;
      else if (op.before != null) pos = findUnique(text, op.before, file);
      yield* moveCursor(st, file, pos, switched, op.type[0] === '\n');
      yield* typeWithNote(st, file, op.type, op.note, rand);
      return;
    }

    const target = op.replace != null ? op.replace : op.remove;
    if (target != null) {
      const a = findUnique(text, target, file);
      const b = a + target.length;
      yield* moveCursor(st, file, b, switched, false);
      st.sel = { file, from: a, to: b };
      yield SELECT_MS;
      remove(st, file, a, b);
      st.sel = null;
      yield 300;
      if (op.replace != null) yield* typeWithNote(st, file, op.with || '', op.note, rand);
      return;
    }

    throw new Error('不认识的操作：' + JSON.stringify(op));
  }

  function* runStep(st, step, rand) {
    st.marks = {};
    st.notes = [];
    st.sel = null;
    st.term = null;
    if (step.file) openFile(st, step.file);
    for (const op of step.ops || []) yield* runOp(st, op, step, rand);
  }

  // 一章开始时的状态：第一章从空文件开始，之后每章接着上一章结束时的代码
  function startState(lesson, from) {
    if (!from) return newState(lesson);
    const st = clone(from);
    st.marks = {};
    st.notes = [];
    st.sel = null;
    st.term = null;
    if (lesson.files.length) openFile(st, lesson.files[0]);
    return st;
  }

  // 加载时把每一步的最终状态都算出来：既是校验（锚点写错会立刻报错），也供后退和跳转使用
  function compile(lesson, from) {
    const initial = startState(lesson, from);
    const after = [];
    const st = clone(initial);
    lesson.steps.forEach((step, i) => {
      try {
        for (const _ of runStep(st, step, rng(i + 1))); // eslint-disable-line no-unused-vars
      } catch (e) {
        throw new Error(`第 ${i + 1} 步「${step.title}」出错：${e.message}`);
      }
      after.push(clone(st));
    });
    return { initial, after };
  }

  root.Engine = { compile, runStep, clone, rng };
})(typeof window !== 'undefined' ? window : globalThis);
