/*
 * 课程：滑动窗口（LeetCode 题单第 3 类）。
 * 第一章讲概念和模板，之后每章一道题，从简单到困难。每道题有五种语言的写法。
 *
 * 这个文件除了定义课程，还放了各章共用的东西（root.SW）：
 *   code(...)   把 [代码, 说明] 一对对写成打字操作
 *   RUN、FILES  各语言的终端命令和文件名
 *   trace.*     图形演示的帧：在样例输入上真的跑一遍算法，每走一步记一帧
 */
(function (root) {
  'use strict';

  root.Catalog.defineCourse({
    id: 'sliding-window',
    board: 'algo',
    title: '滑动窗口',
    eyebrow: 'LeetCode 题单 · 第 3 类 · 7 题',
    blurb: '维护一个可以伸缩的连续区间：右端进来一个，左端出去一个，不用每次从头算。先读一章概念和模板，再从两道简单题写起，一直写到困难题「最小覆盖子串」。每道题都能在 Python、C、C++、Java、Rust 之间切换。',
    langs: ['python', 'c', 'cpp', 'java', 'rust'],
    stats: [
      ['8', '章'],
      ['7', '道题'],
      ['5', '种语言'],
      ['3/3/1', '简单/中等/困难'],
    ],
  });

  // [代码, 说明] → 打字操作。说明会以注释的样子出现在这一行上方（或旁白栏的逐行说明里）
  const code = (...pairs) => pairs.map(([type, note]) => (note ? { type, note } : { type }));

  const RUN = {
    python: 'python3 solution.py',
    c: 'gcc solution.c -o solution && ./solution',
    cpp: 'g++ -std=c++17 solution.cpp -o solution && ./solution',
    java: 'javac Main.java && java Main',
    rust: 'rustc --edition 2021 main.rs && ./main',
  };

  const FILES = {
    python: ['solution.py'],
    c: ['solution.c'],
    cpp: ['solution.cpp'],
    java: ['Main.java'],
    rust: ['main.rs'],
  };

  const leetcode = (slug) => 'https://leetcode.cn/problems/' + slug + '/';

  /* ---------------------------------------------------------- 演示的帧 */

  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

  const trace = {
    // 暴力：每个长度为 k 的窗口都从头加一遍
    brute(nums, k) {
      const frames = [];
      let adds = 0;
      for (let i = 0; i + k <= nums.length; i++) {
        const part = nums.slice(i, i + k);
        const sum = part.reduce((a, b) => a + b, 0);
        adds += k;
        frames.push({
          cells: nums,
          win: [i, i + k - 1],
          ptrs: { i },
          marks: Object.fromEntries(range(i, i + k).map((j) => [j, 'in'])),
          vars: [['和', sum], ['累计加法', adds]],
          note: '第 ' + (i + 1) + ' 个窗口从头加：' + part.join(' + ').replace(/\+ -/g, '- ') + ' = ' + sum + '，又做了 ' + k + ' 次加法。',
        });
      }
      return frames;
    },

    // 定长窗口：先算第一个窗口，之后每次进一个、出一个
    fixedSum(nums, k) {
      let sum = nums.slice(0, k).reduce((a, b) => a + b, 0);
      let best = sum;
      const frames = [
        {
          cells: nums,
          win: [0, k - 1],
          ptrs: { left: 0, right: k - 1 },
          marks: Object.fromEntries(range(0, k).map((j) => [j, 'in'])),
          vars: [['window', sum], ['best', best]],
          note: '先把前 ' + k + ' 个数加起来，这是第一个窗口：window = ' + sum + '。',
        },
      ];
      for (let right = k; right < nums.length; right++) {
        const out = nums[right - k];
        sum += nums[right] - out;
        const better = sum > best;
        best = Math.max(best, sum);
        frames.push({
          cells: nums,
          win: [right - k + 1, right],
          ptrs: { left: right - k + 1, right },
          marks: { [right]: 'in', [right - k]: 'out' },
          vars: [['window', sum], ['best', best]],
          note: '右移一格：进来 ' + nums[right] + '，出去 ' + out + '。window = ' + sum + (better ? '，比 best 大，更新 best。' : '，没有超过 best。'),
        });
      }
      frames.push({ cells: nums, ptrs: {}, vars: [['best', best], ['平均数', best / k]], note: '窗口走到头。最大的和是 ' + best + '，除以 k = ' + k + ' 得 ' + best / k + '。' });
      return frames;
    },

    // 长度为 3 的窗口，看三个字符是否各不相同
    distinct3(s) {
      const cells = [...s];
      const frames = [];
      let count = 0;
      for (let left = 0; left + 2 < cells.length; left++) {
        const [a, b, c] = cells.slice(left, left + 3);
        const ok = a !== b && b !== c && a !== c;
        if (ok) count++;
        const marks = {};
        if (!ok) {
          if (a === b) Object.assign(marks, { [left]: 'hit', [left + 1]: 'hit' });
          if (b === c) Object.assign(marks, { [left + 1]: 'hit', [left + 2]: 'hit' });
          if (a === c) Object.assign(marks, { [left]: 'hit', [left + 2]: 'hit' });
        } else Object.assign(marks, { [left]: 'ok', [left + 1]: 'ok', [left + 2]: 'ok' });
        frames.push({
          cells,
          win: [left, left + 2],
          ptrs: { left },
          marks,
          vars: [['count', count]],
          note: '"' + a + b + c + '"' + (ok ? '：三个字符都不同，count 加 1。' : '：有重复的字符，不算。'),
        });
      }
      return frames;
    },

    // 窗口里保留最近 k 个数，新来的数在窗口里出现过就找到了
    nearbyDup(nums, k) {
      const frames = [];
      const win = [];
      for (let right = 0; right < nums.length; right++) {
        const x = nums[right];
        const left = Math.max(0, right - k);
        if (win.includes(x)) {
          const j = right - win.length + win.indexOf(x);
          frames.push({
            cells: nums,
            win: [left, right],
            ptrs: { right },
            marks: { [right]: 'hit', [j]: 'hit' },
            vars: [['窗口里', '{' + win.join(', ') + '}'], ['结果', 'true']],
            note: x + ' 已经在窗口里了：两个 ' + x + ' 的下标相差 ' + (right - j) + '，不超过 k = ' + k + '，返回 true。',
          });
          return frames;
        }
        win.push(x);
        let note = '把 ' + x + ' 放进窗口。';
        const marks = { [right]: 'in' };
        if (win.length > k) {
          const out = win.shift();
          marks[right - k] = 'out';
          note += '窗口里超过 k = ' + k + ' 个数了，最左边的 ' + out + ' 离开。';
        }
        frames.push({ cells: nums, win: [right - win.length + 1, right], ptrs: { right }, marks, vars: [['窗口里', '{' + win.join(', ') + '}']], note });
      }
      frames.push({ cells: nums, ptrs: {}, vars: [['结果', 'false']], note: '走完整个数组都没遇到，返回 false。' });
      return frames;
    },

    // 变长窗口：右端扩张，和够了就从左端收缩
    minLen(target, nums) {
      const frames = [];
      let left = 0;
      let sum = 0;
      let best = Infinity;
      const show = (b) => (b === Infinity ? '还没有' : b);
      for (let right = 0; right < nums.length; right++) {
        sum += nums[right];
        frames.push({
          cells: nums,
          win: [left, right],
          ptrs: { left, right },
          marks: { [right]: 'in' },
          vars: [['window', sum], ['best', show(best)]],
          note: '右端扩张，加进 ' + nums[right] + '：window = ' + sum + (sum >= target ? '，够 ' + target + ' 了，开始收缩。' : '，还不到 ' + target + '。'),
        });
        while (sum >= target) {
          best = Math.min(best, right - left + 1);
          const out = nums[left];
          sum -= out;
          left++;
          frames.push({
            cells: nums,
            win: [left, right],
            ptrs: { left, right },
            marks: { [left - 1]: 'out' },
            vars: [['window', sum], ['best', show(best)]],
            note: '先记下长度 ' + (right - left + 2) + '，best = ' + best + '。再从左端去掉 ' + out + '：window = ' + sum + (sum >= target ? '，还够，继续收缩。' : '，不够了，停下。'),
          });
        }
      }
      frames.push({ cells: nums, ptrs: {}, vars: [['best', show(best)]], note: best === Infinity ? '整个数组的和都不够，答案是 0。' : '右端走到头，最短的长度是 ' + best + '。' });
      return frames;
    },

    // 无重复字符的最长子串：新字符重复了，就从左边收缩到它只剩一个
    longestUnique(s) {
      const cells = [...s];
      const frames = [];
      const count = {};
      let left = 0;
      let best = 0;
      for (let right = 0; right < cells.length; right++) {
        const ch = cells[right];
        count[ch] = (count[ch] || 0) + 1;
        if (count[ch] > 1) {
          frames.push({
            cells,
            win: [left, right],
            ptrs: { left, right },
            marks: { [right]: 'hit', [cells.indexOf(ch, left)]: 'hit' },
            vars: [['best', best]],
            note: '"' + ch + '" 进来，窗口里有两个 "' + ch + '" 了，要从左边收缩。',
          });
          while (count[ch] > 1) {
            count[cells[left]]--;
            left++;
          }
        }
        const better = right - left + 1 > best;
        best = Math.max(best, right - left + 1);
        frames.push({
          cells,
          win: [left, right],
          ptrs: { left, right },
          marks: { [right]: 'in' },
          vars: [['窗口', '"' + cells.slice(left, right + 1).join('') + '"'], ['best', best]],
          note: '窗口里没有重复：长度 ' + (right - left + 1) + (better ? '，更新 best。' : '。'),
        });
      }
      return frames;
    },

    // 字母异位词：定长窗口，比较两张计数表
    anagrams(s, p) {
      const cells = [...s];
      const m = p.length;
      const need = {};
      for (const ch of p) need[ch] = (need[ch] || 0) + 1;
      const frames = [];
      const result = [];
      const fmt = (o) => Object.keys(o).filter((k) => o[k]).sort().map((k) => k + o[k]).join(' ') || '空';
      const win = {};
      for (let right = 0; right < cells.length; right++) {
        win[cells[right]] = (win[cells[right]] || 0) + 1;
        const marks = { [right]: 'in' };
        if (right >= m) {
          win[cells[right - m]]--;
          marks[right - m] = 'out';
        }
        const left = Math.max(0, right - m + 1);
        const same = right >= m - 1 && fmt(win) === fmt(need);
        if (same) result.push(left);
        if (same) for (let j = left; j <= right; j++) marks[j] = 'ok';
        frames.push({
          cells,
          win: [left, right],
          ptrs: { right },
          marks,
          vars: [['需要', fmt(need)], ['窗口', fmt(win)], ['结果', '[' + result.join(', ') + ']']],
          note: right < m - 1 ? '窗口还没满 ' + m + ' 个字符。' : same ? '两张计数表一样，' + left + ' 是一个起点。' : '计数表不一样，不是异位词。',
        });
      }
      return frames;
    },

    // 最小覆盖子串：missing 记还缺几个字符，缺 0 个时收缩
    minWindow(s, t) {
      const cells = [...s];
      const need = {};
      for (const ch of t) need[ch] = (need[ch] || 0) + 1;
      let missing = t.length;
      let left = 0;
      let best = null;
      const frames = [];
      const showBest = () => (best ? '"' + s.slice(best[0], best[0] + best[1]) + '"' : '还没有');
      for (let right = 0; right < cells.length; right++) {
        const ch = cells[right];
        const useful = (need[ch] || 0) > 0;
        if (useful) missing--;
        need[ch] = (need[ch] || 0) - 1;
        if (useful || missing === 0) {
          frames.push({
            cells,
            win: [left, right],
            ptrs: { left, right },
            marks: { [right]: useful ? 'ok' : 'in' },
            vars: [['missing', missing], ['最短', showBest()]],
            note: '"' + ch + '" 进来' + (useful ? '，正好是需要的，missing 减到 ' + missing : '，不是需要的') + (missing === 0 ? '。全都凑齐了，开始收缩。' : '。'),
          });
        }
        while (missing === 0) {
          if (!best || right - left + 1 < best[1]) best = [left, right - left + 1];
          const out = cells[left];
          need[out]++;
          const lost = need[out] > 0;
          if (lost) missing++;
          left++;
          frames.push({
            cells,
            win: [left, right],
            ptrs: { left, right },
            marks: { [left - 1]: lost ? 'hit' : 'out' },
            vars: [['missing', missing], ['最短', showBest()]],
            note: '记下 ' + showBest() + '。去掉左端的 "' + out + '"' + (lost ? '，它是需要的，missing 变成 ' + missing + '，停止收缩。' : '，用不上，继续收缩。'),
          });
        }
      }
      frames.push({ cells, ptrs: {}, vars: [['答案', showBest()]], note: '右端走到头，答案是 ' + showBest() + '。' });
      return frames;
    },
  };

  root.SW = { code, RUN, FILES, leetcode, trace };
})(typeof window !== 'undefined' ? window : globalThis);
