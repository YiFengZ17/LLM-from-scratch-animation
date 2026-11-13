/*
 * 极简语法高亮：Python、C、C++、Java、Rust。
 * 输入整段源码和语言，输出「行 -> token 列表」，每个 token 是 { t: 文本, c: 类别 }。
 * 代码在打字过程中经常是不完整的（字符串没闭合、括号没配对），
 * 所以这里只做词法扫描，不做任何语法假设。
 *
 * 类别：kw 关键字，kw2 常量类关键字，fn 函数，cls 类型，str 字符串，num 数字，
 *       com 注释，self self/this，prop 属性，var 变量，op 运算符，pun 标点
 */
(function (root) {
  'use strict';

  const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

  const SPECS = {
    python: {
      kw: set('import from as return if elif else for while in not and or is with try except finally raise pass break continue yield lambda assert del global nonlocal async await'),
      kw2: set('def class None True False'),
      types: set('int float str bool list dict tuple set object'),
      builtins: set('print len range super isinstance enumerate zip max min sum abs open sorted reversed map filter any all'),
      modules: set('torch nn math np F collections heapq'),
      self: set('self'),
      hashComment: true,
      decl: set('def class'),
    },
    c: {
      kw: set('if else for while do return break continue switch case default goto sizeof typedef struct union enum static const extern inline volatile register'),
      kw2: set('NULL true false'),
      types: set('int char double float long short unsigned signed void bool size_t'),
      builtins: set('printf malloc calloc free memset memcpy strlen'),
      self: set(''),
      preprocessor: true,
    },
    cpp: {
      kw: set('if else for while do return break continue switch case default goto sizeof typedef struct union enum static const extern inline volatile class public private protected new delete using namespace template typename auto virtual override this operator'),
      kw2: set('nullptr true false NULL'),
      types: set('int char double float long short unsigned signed void bool size_t string vector unordered_map unordered_set map set pair'),
      builtins: set('max min cout endl printf'),
      modules: set('std'),
      self: set('this'),
      preprocessor: true,
    },
    java: {
      kw: set('if else for while do return break continue switch case default class public private protected static final new import package extends implements interface this super void try catch finally throw throws'),
      kw2: set('null true false'),
      types: set('int char double float long short boolean byte String Integer Character Double Boolean Math System HashMap HashSet Map Set List ArrayList Arrays'),
      builtins: set(''),
      self: set('this'),
    },
    rust: {
      kw: set('fn let mut if else for while loop in return break continue match impl pub struct enum use mod as const static ref move where trait type unsafe'),
      kw2: set('true false None Some Ok Err self Self'),
      types: set('i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec HashMap HashSet Option Result Box'),
      builtins: set(''),
      self: set(''),
    },
  };

  const RE_NUM = /(?:0[xX][0-9a-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)(?:[a-zA-Z]\w*)?/y;
  const RE_ID = /[A-Za-z_]\w*/y;
  const RE_PY_STR = /[rbfuRBFU]{0,2}("""|'''|"|')/y;
  const PUNCT = '()[]{},.:;';

  function tokenize(src, lang) {
    const spec = SPECS[lang] || SPECS.python;
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
    let lineStart = true;

    // 从 i 开始读一个以 q 结尾的字符串（不跨行），返回结束的位置
    const scanQuoted = (from, q) => {
      let j = from;
      while (j < n && src[j] !== q && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      if (j < n && src[j] === q) j++;
      return Math.min(j, n);
    };

    while (i < n) {
      const ch = src[i];

      if (ch === ' ' || ch === '\t' || ch === '\n') {
        let j = i + 1;
        while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\n')) j++;
        if (src.slice(i, j).includes('\n')) lineStart = true;
        push(src.slice(i, j), '');
        i = j;
        continue;
      }

      // 注释
      if ((spec.hashComment && ch === '#') || (!spec.hashComment && ch === '/' && src[i + 1] === '/')) {
        let j = src.indexOf('\n', i);
        if (j < 0) j = n;
        push(src.slice(i, j), 'com');
        i = j;
        prevWord = prevChar = '';
        continue;
      }
      if (!spec.hashComment && ch === '/' && src[i + 1] === '*') {
        const e = src.indexOf('*/', i + 2);
        const j = e < 0 ? n : e + 2;
        push(src.slice(i, j), 'com');
        i = j;
        prevWord = prevChar = '';
        continue;
      }

      // C/C++ 的预处理指令：#include <stdio.h>
      if (spec.preprocessor && ch === '#' && lineStart) {
        const m = /#\s*\w*/y;
        m.lastIndex = i;
        const head = m.exec(src)[0];
        push(head, 'kw');
        i += head.length;
        const rest = /[ \t]*(<[^>\n]*>?|"[^"\n]*"?)?/y;
        rest.lastIndex = i;
        const r = rest.exec(src);
        if (r && r[0]) {
          const lead = r[0].length - (r[1] ? r[1].length : 0);
          if (lead) push(r[0].slice(0, lead), '');
          if (r[1]) push(r[1], 'str');
          i += r[0].length;
        }
        lineStart = false;
        continue;
      }
      lineStart = false;

      // 字符串
      if (lang === 'python' || !SPECS[lang]) {
        RE_PY_STR.lastIndex = i;
        const ms = RE_PY_STR.exec(src);
        if (ms) {
          const q = ms[1];
          let j = i + ms[0].length;
          if (q.length === 3) {
            const e = src.indexOf(q, j);
            j = e < 0 ? n : e + 3;
          } else {
            j = scanQuoted(j, q);
          }
          push(src.slice(i, j), 'str');
          i = j;
          prevWord = '';
          prevChar = q;
          continue;
        }
      } else if (ch === '"') {
        const j = scanQuoted(i + 1, '"');
        push(src.slice(i, j), 'str');
        i = j;
        prevWord = '';
        prevChar = '"';
        continue;
      } else if (ch === "'") {
        // Rust 的生命周期 'a 后面没有右引号，其余语言里单引号是字符
        const life = lang === 'rust' && /^'[A-Za-z_]\w*(?!')/.test(src.slice(i, i + 40)) && src[i + 2] !== "'";
        if (life) {
          const m = /'[A-Za-z_]\w*/.exec(src.slice(i))[0];
          push(m, 'kw2');
          i += m.length;
        } else {
          const j = scanQuoted(i + 1, "'");
          push(src.slice(i, j), 'str');
          i = j;
        }
        prevWord = '';
        prevChar = "'";
        continue;
      }

      RE_NUM.lastIndex = i;
      const mn = /\d/.test(ch) ? RE_NUM.exec(src) : null;
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
        let k = j;
        while (src[k] === ' ') k++;
        const next = src[k];
        let cls;
        if ((spec.decl && spec.decl.has(prevWord)) || prevChar === '@') cls = prevWord === 'class' ? 'cls' : 'fn';
        else if (lang === 'rust' && prevWord === 'fn') cls = 'fn';
        else if (spec.kw.has(w)) cls = 'kw';
        else if (spec.kw2.has(w)) cls = 'kw2';
        else if (spec.self.has(w)) cls = 'self';
        else if (spec.types.has(w) || (spec.modules && spec.modules.has(w))) cls = 'cls';
        else if (src[j] === '!' && lang === 'rust') cls = 'fn';
        else if (next === '(') cls = /^[A-Z]/.test(w) ? 'cls' : 'fn';
        else if (spec.builtins.has(w)) cls = 'fn';
        else if (/^[A-Z]/.test(w)) cls = /^[A-Z0-9_]+$/.test(w) && w.length > 1 ? 'kw2' : 'cls';
        else if (prevChar === '.' || prevChar === '>') cls = 'prop';
        else cls = 'var';
        push(w, cls);
        i = j;
        prevWord = w;
        prevChar = 'a';
        continue;
      }

      push(ch, PUNCT.includes(ch) ? 'pun' : 'op');
      i++;
      prevWord = '';
      prevChar = ch === '-' && src[i] === '>' ? '-' : ch;
    }

    return lines;
  }

  root.Highlight = { tokenize };
})(typeof window !== 'undefined' ? window : globalThis);
