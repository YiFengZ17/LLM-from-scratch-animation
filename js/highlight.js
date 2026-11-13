/*
 * 极简 Python 语法高亮。
 * 输入整段源码，输出「行 -> token 列表」，每个 token 是 { t: 文本, c: 类别 }。
 * 代码在打字过程中经常是不完整的（字符串没闭合、括号没配对），
 * 所以这里只做词法扫描，不做任何语法假设。
 */
(function (root) {
  'use strict';

  const set = (s) => new Set(s.split(' '));
  const KW = set('import from as return if elif else for while in not and or is with try except finally raise pass break continue yield lambda assert del global nonlocal async await');
  const KW2 = set('def class None True False');
  const TYPES = set('int float str bool list dict tuple set object');
  const BUILTINS = set('print len range super isinstance enumerate zip max min sum abs open');
  const MODULES = set('torch nn math np F');

  const RE_STR = /[rbfuRBFU]{0,2}("""|'''|"|')/y;
  const RE_NUM = /\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
  const RE_ID = /[A-Za-z_]\w*/y;

  function tokenize(src) {
    const lines = [[]];
    const push = (text, cls) => {
      const parts = text.split('\n');
      for (let k = 0; k < parts.length; k++) {
        if (k) lines.push([]);
        if (parts[k]) lines[lines.length - 1].push({ t: parts[k], c: cls });
      }
    };

    const n = src.length;
    let i = 0;
    let prevWord = '';
    let prevChar = '';

    while (i < n) {
      const ch = src[i];

      if (ch === ' ' || ch === '\t' || ch === '\n') {
        let j = i + 1;
        while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n')) j++;
        push(src.slice(i, j), '');
        i = j;
        continue;
      }

      if (ch === '#') {
        let j = src.indexOf('\n', i);
        if (j < 0) j = n;
        push(src.slice(i, j), 'com');
        i = j;
        prevWord = '';
        prevChar = '';
        continue;
      }

      RE_STR.lastIndex = i;
      const ms = RE_STR.exec(src);
      if (ms) {
        const q = ms[1];
        let j = i + ms[0].length;
        if (q.length === 3) {
          const e = src.indexOf(q, j);
          j = e < 0 ? n : e + 3;
        } else {
          while (j < n && src[j] !== q && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
          if (j < n && src[j] === q) j++;
          if (j > n) j = n;
        }
        push(src.slice(i, j), 'str');
        i = j;
        prevWord = '';
        prevChar = q;
        continue;
      }

      RE_NUM.lastIndex = i;
      const mn = RE_NUM.exec(src);
      if (mn) {
        push(mn[0], 'num');
        i += mn[0].length;
        prevWord = '';
        prevChar = '0';
        continue;
      }

      RE_ID.lastIndex = i;
      const mi = RE_ID.exec(src);
      if (mi) {
        const w = mi[0];
        const j = i + w.length;
        let cls;
        if (prevWord === 'def' || prevChar === '@') cls = 'fn';
        else if (prevWord === 'class') cls = 'cls';
        else if (KW.has(w)) cls = 'kw';
        else if (KW2.has(w)) cls = 'kw2';
        else if (w === 'self') cls = 'self';
        else if (TYPES.has(w) || MODULES.has(w)) cls = 'cls';
        else if (BUILTINS.has(w)) cls = 'fn';
        else if (src[j] === '(') cls = /^[A-Z]/.test(w) ? 'cls' : 'fn';
        else if (/^[A-Z]/.test(w)) cls = 'cls';
        else if (prevChar === '.') cls = 'prop';
        else cls = 'var';
        push(w, cls);
        i = j;
        prevWord = w;
        prevChar = 'a';
        continue;
      }

      // 括号、逗号这类标点和运算符分开，主题给它们的颜色不一样
      push(ch, '()[]{},.:;'.includes(ch) ? 'pun' : 'op');
      i++;
      prevWord = '';
      prevChar = ch;
    }

    return lines;
  }

  root.Highlight = { tokenize };
})(typeof window !== 'undefined' ? window : globalThis);
