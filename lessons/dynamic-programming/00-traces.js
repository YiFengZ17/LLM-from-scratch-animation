/*
 * 动态规划 · 后五个子模块的图形演示帧（接在 00-course.js 定义的 root.DP.trace 上）。
 * 和前面一样：每个函数在样例输入上真的把表填一遍，每填一格（或一行）记一帧。
 * 布尔值的格子显示 T / F。
 */
(function (root) {
  'use strict';

  const trace = root.DP.trace;
  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
  const blank = (n) => Array.from({ length: n }, () => null);
  const table = (r, c) => Array.from({ length: r }, () => blank(c));
  const copy = (t) => t.map((row) => row.slice());
  const TF = (b) => (b ? 'T' : 'F');

  /* ================================================================ 股票 */

  // mode: once（只能买卖一次）、many（不限次数）、fee（每笔交易付手续费）、cool（卖出后冷冻一天）
  trace.stock = function (prices, mode, fee) {
    const n = prices.length;
    const cols = range(0, n);
    const cool = mode === 'cool';
    const rows = cool ? ['价格', '持有', '刚卖出', '空闲'] : ['价格', '持有', '不持有'];
    const st = rows.slice(1).map(() => blank(n));
    st[0][0] = -prices[0];
    st[1][0] = 0;
    if (cool) st[2][0] = 0;
    const cells = () => [prices].concat(st.map((r) => r.slice()));
    const frames = [{
      rows, cols, cells: cells(), cur: [1, 0], deps: [[0, 0]], vars: [['持有', st[0][0]], [cool ? '空闲' : '不持有', 0]],
      note: '第 0 天：买入就是花掉 ' + prices[0] + '，持有时的利润记作 ' + -prices[0] + '；不买，利润是 0。',
    }];
    for (let i = 1; i < n; i++) {
      const p = prices[i];
      if (!cool) {
        const h = st[0][i - 1];
        const f = st[1][i - 1];
        const buyFrom = mode === 'once' ? 0 : f;
        const buy = buyFrom - p;
        const sell = h + p - (mode === 'fee' ? fee : 0);
        st[0][i] = Math.max(h, buy);
        st[1][i] = Math.max(f, sell);
        frames.push({
          rows, cols, cells: cells(), cur: [1, i],
          deps: [[0, i], [1, i - 1], [2, i - 1]],
          picks: [h >= buy ? [1, i - 1] : [2, i - 1], f >= sell ? [2, i - 1] : [1, i - 1]],
          vars: [['持有', st[0][i]], ['不持有', st[1][i]]],
          note: '价格 ' + p + '。持有：继续拿着 ' + h + '，或今天买入 ' + (mode === 'once' ? '0' : f) + ' − ' + p + ' = ' + buy + '，取 ' + st[0][i] + '。' +
            '不持有：继续空仓 ' + f + '，或今天卖出 ' + h + ' + ' + p + (mode === 'fee' ? ' − ' + fee : '') + ' = ' + sell + '，取 ' + st[1][i] + '。',
        });
      } else {
        const h = st[0][i - 1];
        const s = st[1][i - 1];
        const r = st[2][i - 1];
        st[0][i] = Math.max(h, r - p);
        st[1][i] = h + p;
        st[2][i] = Math.max(r, s);
        frames.push({
          rows, cols, cells: cells(), cur: [1, i],
          deps: [[0, i], [1, i - 1], [2, i - 1], [3, i - 1]],
          vars: [['持有', st[0][i]], ['刚卖出', st[1][i]], ['空闲', st[2][i]]],
          note: '价格 ' + p + '。持有：继续拿着 ' + h + '，或从「空闲」买入 ' + r + ' − ' + p + ' = ' + (r - p) + '，取 ' + st[0][i] + '。' +
            '刚卖出：只能是昨天持有、今天卖：' + h + ' + ' + p + ' = ' + st[1][i] + '。空闲：昨天就空闲 ' + r + '，或昨天刚卖、今天冷冻 ' + s + '，取 ' + st[2][i] + '。',
        });
      }
    }
    const last = n - 1;
    const ans = cool ? Math.max(st[1][last], st[2][last]) : st[1][last];
    frames.push({
      rows, cols, cells: cells(), picks: cool ? [[2, last], [3, last]] : [[2, last]], vars: [['答案', ans]],
      note: cool ? '最后一天手里不能还拿着股票：答案是「刚卖出」和「空闲」里大的那个，' + ans + '。' : '最后一天手里不该再拿着股票，答案是「不持有」那一格：' + ans + '。',
    });
    return frames;
  };

  /* ================================================================ 网格 */

  // 杨辉三角：两端是 1，中间每个数是左上和正上方两数之和
  trace.pascal = function (numRows) {
    const t = table(numRows, numRows);
    const rows = range(0, numRows);
    const frames = [];
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j <= i; j++) {
        if (j === 0 || j === i) {
          t[i][j] = 1;
          frames.push({ rows, cols: rows, cells: copy(t), cur: [i, j], deps: [], vars: [['行', i], ['列', j]], note: '第 ' + i + ' 行的' + (j === 0 ? '第一个' : '最后一个') + '数：两端都是 1。' });
        } else {
          t[i][j] = t[i - 1][j - 1] + t[i - 1][j];
          frames.push({
            rows, cols: rows, cells: copy(t), cur: [i, j], deps: [[i - 1, j - 1], [i - 1, j]], vars: [['行', i], ['列', j]],
            note: '上一行挨着的两个数相加：' + t[i - 1][j - 1] + ' + ' + t[i - 1][j] + ' = ' + t[i][j] + '。',
          });
        }
      }
    }
    return frames;
  };

  // 杨辉三角 II：只用一行，从右往左原地更新
  trace.pascalRow = function (rowIndex) {
    const row = blank(rowIndex + 1);
    row[0] = 1;
    const cols = range(0, rowIndex + 1);
    const frames = [{ rows: ['row'], cols, cells: [row.slice()], cur: [0, 0], deps: [], vars: [['第几行', 0]], note: '第 0 行只有一个 1。' }];
    for (let i = 1; i <= rowIndex; i++) {
      row[i] = 1;
      frames.push({ rows: ['row'], cols, cells: [row.slice()], cur: [0, i], deps: [], vars: [['第几行', i]], note: '变成第 ' + i + ' 行：先在末尾补一个 1。' });
      for (let j = i - 1; j >= 1; j--) {
        const old = row[j];
        row[j] += row[j - 1];
        frames.push({
          rows: ['row'], cols, cells: [row.slice()], cur: [0, j], deps: [[0, j - 1]], vars: [['第几行', i], ['j', j]],
          note: 'row[' + j + '] 加上它左边的数：' + old + ' + ' + row[j - 1] + ' = ' + row[j] + '。从右往左改，左边那个还是上一行的值。',
        });
      }
    }
    return frames;
  };

  // 不同路径：每格 = 上面一格 + 左边一格
  trace.paths = function (m, n) {
    const t = table(m, n);
    for (let i = 0; i < m; i++) t[i][0] = 1;
    for (let j = 0; j < n; j++) t[0][j] = 1;
    const rows = range(0, m);
    const cols = range(0, n);
    const frames = [{ rows, cols, cells: copy(t), deps: [], vars: [], note: '第一行只能一直往右走，第一列只能一直往下走，都只有 1 条路。' }];
    for (let i = 1; i < m; i++) {
      for (let j = 1; j < n; j++) {
        t[i][j] = t[i - 1][j] + t[i][j - 1];
        frames.push({ rows, cols, cells: copy(t), cur: [i, j], deps: [[i - 1, j], [i, j - 1]], vars: [['dp[' + i + '][' + j + ']', t[i][j]]], note: '最后一步从上面下来（' + t[i - 1][j] + ' 条）或从左边过来（' + t[i][j - 1] + ' 条）：共 ' + t[i][j] + ' 条。' });
      }
    }
    frames.push({ rows, cols, cells: copy(t), picks: [[m - 1, n - 1]], vars: [['答案', t[m - 1][n - 1]]], note: '右下角就是答案：' + t[m - 1][n - 1] + ' 条路。' });
    return frames;
  };

  // 最小路径和：每格 = grid 值 + min(上面, 左边)
  trace.minPath = function (grid) {
    const m = grid.length;
    const n = grid[0].length;
    const t = table(m, n);
    const rows = range(0, m);
    const cols = range(0, n);
    const frames = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const g = grid[i][j];
        if (i === 0 && j === 0) {
          t[0][0] = g;
          frames.push({ rows, cols, cells: copy(t), cur: [0, 0], deps: [], vars: [['grid', g]], note: '起点只有它自己：' + g + '。' });
        } else if (i === 0 || j === 0) {
          const from = i === 0 ? [0, j - 1] : [i - 1, 0];
          t[i][j] = t[from[0]][from[1]] + g;
          frames.push({ rows, cols, cells: copy(t), cur: [i, j], deps: [from], vars: [['grid', g]], note: (i === 0 ? '第一行只能从左边来' : '第一列只能从上面来') + '：' + t[from[0]][from[1]] + ' + ' + g + ' = ' + t[i][j] + '。' });
        } else {
          const up = t[i - 1][j];
          const left = t[i][j - 1];
          t[i][j] = Math.min(up, left) + g;
          frames.push({
            rows, cols, cells: copy(t), cur: [i, j], deps: [[i - 1, j], [i, j - 1]], picks: [up <= left ? [i - 1, j] : [i, j - 1]], vars: [['grid', g]],
            note: '从上面来要 ' + up + '，从左边来要 ' + left + '，取小的再加上这格的 ' + g + '：' + t[i][j] + '。',
          });
        }
      }
    }
    frames.push({ rows, cols, cells: copy(t), picks: [[m - 1, n - 1]], vars: [['答案', t[m - 1][n - 1]]], note: '右下角就是最小路径和：' + t[m - 1][n - 1] + '。' });
    return frames;
  };

  // 最大正方形：以 (i, j) 为右下角的最大正方形边长 = min(上, 左, 左上) + 1
  trace.square = function (matrix) {
    const m = matrix.length;
    const n = matrix[0].length;
    const t = table(m, n);
    const rows = range(0, m);
    const cols = range(0, n);
    let best = 0;
    const frames = [];
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] === '0') {
          t[i][j] = 0;
          frames.push({ rows, cols, cells: copy(t), cur: [i, j], deps: [], vars: [['best', best]], note: '这格是 0，不能当正方形的右下角：0。' });
        } else if (i === 0 || j === 0) {
          t[i][j] = 1;
          best = Math.max(best, 1);
          frames.push({ rows, cols, cells: copy(t), cur: [i, j], deps: [], vars: [['best', best]], note: '贴着上边或左边的 1，最多只能是边长 1 的正方形。' });
        } else {
          const a = t[i - 1][j];
          const b = t[i][j - 1];
          const c = t[i - 1][j - 1];
          const lo = Math.min(a, b, c);
          t[i][j] = lo + 1;
          best = Math.max(best, t[i][j]);
          const pick = a === lo ? [i - 1, j] : b === lo ? [i, j - 1] : [i - 1, j - 1];
          frames.push({
            rows, cols, cells: copy(t), cur: [i, j], deps: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], picks: [pick], vars: [['best', best]],
            note: '上 ' + a + '、左 ' + b + '、左上 ' + c + '，最短的是 ' + lo + '，这格能撑起边长 ' + t[i][j] + ' 的正方形。',
          });
        }
      }
    }
    frames.push({ rows, cols, cells: copy(t), vars: [['最大边长', best], ['面积', best * best]], note: '整张表里最大的边长是 ' + best + '，面积是 ' + best * best + '。' });
    return frames;
  };

  /* ================================================================ 背包 */

  // 凑硬币：dp[a] = 凑出 a 最少要几枚，凑不出显示 ∞
  trace.coins = function (coins, amount, label) {
    const INF = Infinity;
    const dp = blank(amount + 1);
    dp[0] = 0;
    const show = () => [dp.map((v) => (v === INF ? '∞' : v))];
    const cols = range(0, amount + 1);
    const name = label || '硬币';
    const frames = [{ rows: ['dp'], cols, cells: show(), cur: [0, 0], deps: [], vars: [[name, coins.join(', ')]], note: '凑出 0 不需要任何' + name + '：dp[0] = 0。' }];
    for (let a = 1; a <= amount; a++) {
      let best = INF;
      let arg = -1;
      const deps = [];
      const parts = [];
      for (const c of coins) {
        if (c > a) continue;
        deps.push([0, a - c]);
        const v = dp[a - c] + 1;
        parts.push((dp[a - c] === INF ? '∞' : dp[a - c]) + ' + 1');
        if (v < best) {
          best = v;
          arg = a - c;
        }
      }
      dp[a] = best;
      frames.push({
        rows: ['dp'], cols, cells: show(), cur: [0, a], deps, picks: arg >= 0 && best !== INF ? [[0, arg]] : [],
        vars: [['dp[' + a + ']', best === INF ? '∞' : best]],
        note: '凑 ' + a + '：最后一' + (label ? '个' : '枚') + '可以是 ' + coins.filter((c) => c <= a).join('、') + '，候选 ' + parts.join('、') + '，取最小' + (best === INF ? '，还是凑不出：∞。' : ' ' + best + '。'),
      });
    }
    return frames;
  };

  // 分割等和子集：一行代表「考虑了前几个数」，每格表示能不能凑出这个和
  trace.partition = function (nums) {
    const target = nums.reduce((a, b) => a + b, 0) / 2;
    const cols = range(0, target + 1);
    const rows = ['起点'].concat(nums.map((x, k) => '第 ' + (k + 1) + ' 个（' + x + '）'));
    const t = table(rows.length, target + 1);
    const dp = blank(target + 1).map((_, s) => s === 0);
    t[0] = dp.map(TF);
    const frames = [{ rows, cols, cells: copy(t), deps: [], picks: [[0, 0]], vars: [['目标', target]], note: '一个数都不选，只能凑出 0。' }];
    nums.forEach((x, k) => {
      const deps = [];
      const picks = [];
      for (let s = target; s >= x; s--) {
        if (!dp[s] && dp[s - x]) {
          dp[s] = true;
          deps.push([k, s - x]);
          picks.push([k + 1, s]);
        }
      }
      t[k + 1] = dp.map(TF);
      frames.push({
        rows, cols, cells: copy(t), deps, picks, vars: [['目标', target], ['能凑出', TF(dp[target])]],
        note: '加入 ' + x + '：原来能凑出的每个和 s，现在也能凑出 s + ' + x + (picks.length ? '，新凑出 ' + picks.map((p) => p[1]).join('、') + '。' : '，但没有新凑出的和。'),
      });
    });
    return frames;
  };

  /* ================================================================ 子序列与字符串 */

  // 最长递增子序列：dp[i] = 以 nums[i] 结尾的最长长度
  trace.lis = function (nums) {
    const n = nums.length;
    const dp = blank(n);
    const cols = range(0, n);
    let best = 0;
    const frames = [];
    for (let i = 0; i < n; i++) {
      dp[i] = 1;
      let arg = -1;
      const deps = [];
      for (let j = 0; j < i; j++) {
        if (nums[j] < nums[i]) {
          deps.push([1, j]);
          if (dp[j] + 1 > dp[i]) {
            dp[i] = dp[j] + 1;
            arg = j;
          }
        }
      }
      best = Math.max(best, dp[i]);
      frames.push({
        rows: ['nums', 'dp'], cols, cells: [nums, dp.slice()], cur: [1, i], deps: deps.concat([[0, i]]), picks: arg >= 0 ? [[1, arg]] : [], vars: [['best', best]],
        note: deps.length
          ? '前面比 ' + nums[i] + ' 小的数有 ' + deps.length + ' 个，接在 dp 最大的那个（下标 ' + arg + '）后面：' + dp[arg] + ' + 1 = ' + dp[i] + '。'
          : '前面没有比 ' + nums[i] + ' 小的数，它只能自己开头：1。',
      });
    }
    return frames;
  };

  // 两个字符串的表：行是 a 的前缀，列是 b 的前缀，第 0 行第 0 列是空串
  function twoStrings(a, b, init, step) {
    const m = a.length;
    const n = b.length;
    const t = table(m + 1, n + 1);
    const rows = ['∅'].concat(a.split(''));
    const cols = ['∅'].concat(b.split(''));
    init(t, m, n);
    const frames = [{ rows, cols, cells: copy(t), deps: [], vars: [], note: init.note }];
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const f = step(t, i, j);
        frames.push(Object.assign({ rows, cols, cells: copy(t), cur: [i, j] }, f));
      }
    }
    frames.push({ rows, cols, cells: copy(t), picks: [[m, n]], vars: [['答案', t[m][n]]], note: '右下角就是两个完整字符串的答案：' + t[m][n] + '。' });
    return frames;
  }

  trace.lcs = function (a, b) {
    const init = (t, m, n) => {
      for (let i = 0; i <= m; i++) t[i][0] = 0;
      for (let j = 0; j <= n; j++) t[0][j] = 0;
    };
    init.note = '任何字符串和空串的公共子序列长度都是 0：第 0 行、第 0 列全是 0。';
    return twoStrings(a, b, init, (t, i, j) => {
      const x = a[i - 1];
      const y = b[j - 1];
      if (x === y) {
        t[i][j] = t[i - 1][j - 1] + 1;
        return { deps: [[i - 1, j - 1]], picks: [[i - 1, j - 1]], vars: [['a[' + (i - 1) + ']', x], ['b[' + (j - 1) + ']', y]], note: '最后一个字符都是 ' + x + '，一起放进公共子序列：左上角 ' + t[i - 1][j - 1] + ' + 1 = ' + t[i][j] + '。' };
      }
      t[i][j] = Math.max(t[i - 1][j], t[i][j - 1]);
      return {
        deps: [[i - 1, j], [i, j - 1]], picks: [t[i - 1][j] >= t[i][j - 1] ? [i - 1, j] : [i, j - 1]], vars: [['a[' + (i - 1) + ']', x], ['b[' + (j - 1) + ']', y]],
        note: x + ' ≠ ' + y + '，至少有一个用不上：扔掉 a 的最后一个得 ' + t[i - 1][j] + '，扔掉 b 的最后一个得 ' + t[i][j - 1] + '，取大的 ' + t[i][j] + '。',
      };
    });
  };

  trace.edit = function (a, b) {
    const init = (t, m, n) => {
      for (let i = 0; i <= m; i++) t[i][0] = i;
      for (let j = 0; j <= n; j++) t[0][j] = j;
    };
    init.note = '变成空串要删掉所有字符，从空串变出来要插入所有字符：第 0 列是 i，第 0 行是 j。';
    return twoStrings(a, b, init, (t, i, j) => {
      const x = a[i - 1];
      const y = b[j - 1];
      if (x === y) {
        t[i][j] = t[i - 1][j - 1];
        return { deps: [[i - 1, j - 1]], picks: [[i - 1, j - 1]], vars: [['a[' + (i - 1) + ']', x], ['b[' + (j - 1) + ']', y]], note: '最后一个字符一样（' + x + '），不用动它：等于左上角 ' + t[i][j] + '。' };
      }
      const del = t[i - 1][j];
      const ins = t[i][j - 1];
      const rep = t[i - 1][j - 1];
      const lo = Math.min(del, ins, rep);
      t[i][j] = lo + 1;
      const pick = rep === lo ? [i - 1, j - 1] : del === lo ? [i - 1, j] : [i, j - 1];
      return {
        deps: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], picks: [pick], vars: [['a[' + (i - 1) + ']', x], ['b[' + (j - 1) + ']', y]],
        note: x + ' ≠ ' + y + '：删除（上 ' + del + '）、插入（左 ' + ins + '）、替换（左上 ' + rep + '），最便宜的 ' + lo + ' 再加这一步：' + t[i][j] + '。',
      };
    });
  };

  // 回文子串：dp[i][j] 表示 s[i..j] 是不是回文。i 从右往左，j 从 i 往右
  trace.pal = function (s, mode) {
    const n = s.length;
    const t = table(n, n);
    const labels = s.split('').map((ch, k) => k + ' ' + ch);
    let count = 0;
    let bestI = 0;
    let bestLen = 1;
    const frames = [];
    for (let i = n - 1; i >= 0; i--) {
      for (let j = i; j < n; j++) {
        const same = s[i] === s[j];
        const inner = j - i < 2 || t[i + 1][j - 1] === 'T';
        const ok = same && inner;
        t[i][j] = TF(ok);
        if (ok) {
          count++;
          if (j - i + 1 > bestLen) {
            bestLen = j - i + 1;
            bestI = i;
          }
        }
        const deps = same && j - i >= 2 ? [[i + 1, j - 1]] : [];
        const piece = s.slice(i, j + 1);
        let why;
        if (!same) why = '两端 ' + s[i] + ' ≠ ' + s[j] + '，不是回文。';
        else if (j - i < 2) why = j === i ? '单个字符 ' + piece + ' 一定是回文。' : '两个相同字符 ' + piece + ' 是回文。';
        else why = '两端都是 ' + s[i] + '，要看里面的 ' + s.slice(i + 1, j) + '（左下角那格）：' + (ok ? '是回文，所以 ' + piece + ' 也是。' : '不是，所以 ' + piece + ' 也不是。');
        frames.push({
          rows: labels, cols: labels, cells: copy(t), cur: [i, j], deps,
          vars: mode === 'longest' ? [['最长', s.slice(bestI, bestI + bestLen)]] : [['回文个数', count]],
          note: why,
        });
      }
    }
    return frames;
  };

  // 单词拆分：dp[i] 表示前 i 个字符能不能拆成字典里的单词
  trace.wordBreak = function (s, words) {
    const n = s.length;
    const dp = blank(n + 1);
    dp[0] = 'T';
    const cols = range(0, n + 1);
    const chars = [null].concat(s.split(''));
    const frames = [{ rows: ['s', 'dp'], cols, cells: [chars, dp.slice()], cur: [1, 0], deps: [], vars: [], note: '前 0 个字符是空串，什么都不用拆：dp[0] = T。第 i 列的字符是前缀的最后一个字符。' }];
    for (let i = 1; i <= n; i++) {
      let hit = null;
      for (const w of words) {
        if (w.length <= i && dp[i - w.length] === 'T' && s.slice(i - w.length, i) === w) {
          hit = w;
          break;
        }
      }
      dp[i] = TF(hit);
      frames.push({
        rows: ['s', 'dp'], cols, cells: [chars, dp.slice()], cur: [1, i],
        deps: hit ? [[1, i - hit.length]].concat(range(i - hit.length + 1, i + 1).map((c) => [0, c])) : [],
        vars: [['前缀', s.slice(0, i)]],
        note: hit ? '最后一个单词是 ' + hit + '，它前面的 ' + (s.slice(0, i - hit.length) || '空串') + ' 能拆（dp[' + (i - hit.length) + '] = T），所以能拆。' : '没有哪个单词既能放在末尾、前面又能拆开：F。',
      });
    }
    return frames;
  };

  // 最长有效括号：dp[i] 表示以 s[i] 结尾的最长有效括号子串长度
  trace.parens = function (s) {
    const n = s.length;
    const dp = blank(n);
    const cols = range(0, n);
    let best = 0;
    const frames = [];
    for (let i = 0; i < n; i++) {
      let deps = [];
      let note;
      dp[i] = 0;
      if (s[i] === '(') {
        note = '以 ( 结尾的不可能是有效括号：0。';
      } else if (i >= 1 && s[i - 1] === '(') {
        dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
        deps = [[0, i - 1]].concat(i >= 2 ? [[1, i - 2]] : []);
        note = '前一个正好是 (，配成一对 ()，再接上它前面那段 ' + (i >= 2 ? dp[i - 2] : 0) + '：' + dp[i] + '。';
      } else if (i >= 1 && dp[i - 1] > 0 && i - dp[i - 1] - 1 >= 0 && s[i - dp[i - 1] - 1] === '(') {
        const k = i - dp[i - 1] - 1;
        const before = k >= 1 ? dp[k - 1] : 0;
        dp[i] = dp[i - 1] + 2 + before;
        deps = [[1, i - 1], [0, k]].concat(k >= 1 ? [[1, k - 1]] : []);
        note = '前一个是 )，跳过它那段 ' + dp[i - 1] + ' 个字符，正好碰到 ( 和这个 ) 配对：' + dp[i - 1] + ' + 2，再接上更前面的 ' + before + '，得 ' + dp[i] + '。';
      } else {
        note = '这个 ) 找不到能配对的 (：0。';
      }
      best = Math.max(best, dp[i]);
      frames.push({ rows: ['s', 'dp'], cols, cells: [s.split(''), dp.slice()], cur: [1, i], deps, vars: [['best', best]], note });
    }
    return frames;
  };

  // 正则表达式匹配：dp[i][j] 表示 s 的前 i 个字符能不能被 p 的前 j 个字符匹配
  trace.regex = function (s, p) {
    const m = s.length;
    const n = p.length;
    const t = table(m + 1, n + 1);
    const rows = ['∅'].concat(s.split(''));
    const cols = ['∅'].concat(p.split(''));
    const eq = (i, j) => p[j - 1] === '.' || p[j - 1] === s[i - 1];
    const ok = (i, j) => t[i][j] === 'T';
    t[0][0] = 'T';
    const frames = [{ rows, cols, cells: copy(t), cur: [0, 0], deps: [], vars: [], note: '空串匹配空模式：T。' }];
    for (let i = 0; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        let v;
        let deps;
        let note;
        if (p[j - 1] === '*') {
          const zero = ok(i, j - 2);
          const more = i > 0 && eq(i, j - 1) && ok(i - 1, j);
          v = zero || more;
          deps = [[i, j - 2]].concat(i > 0 && eq(i, j - 1) ? [[i - 1, j]] : []);
          note = p[j - 2] + '* 可以一个都不要（看左边两格：' + TF(zero) + '）' + (i > 0 ? (eq(i, j - 1) ? '，也可以再吃掉一个 ' + s[i - 1] + '（看上面一格：' + TF(ok(i - 1, j)) + '）' : '，' + s[i - 1] + ' 和 ' + p[j - 2] + ' 对不上，不能多吃') : '') + '：' + TF(v) + '。';
        } else {
          v = i > 0 && eq(i, j) && ok(i - 1, j - 1);
          deps = i > 0 ? [[i - 1, j - 1]] : [];
          note = i === 0 ? '空串对不上非空的字符 ' + p[j - 1] + '：F。' : (eq(i, j) ? s[i - 1] + ' 和 ' + p[j - 1] + ' 对得上，看左上角：' + TF(v) + '。' : s[i - 1] + ' 和 ' + p[j - 1] + ' 对不上：F。');
        }
        t[i][j] = TF(v);
        frames.push({ rows, cols, cells: copy(t), cur: [i, j], deps, vars: [], note });
      }
      if (i === 0) {
        for (let r = 1; r <= m; r++) t[r][0] = 'F';
        frames.push({ rows, cols, cells: copy(t), deps: [], vars: [], note: '空模式匹配不了非空的字符串：第 0 列下面全是 F。' });
      }
    }
    frames.push({ rows, cols, cells: copy(t), picks: [[m, n]], vars: [['答案', t[m][n]]], note: '右下角就是答案：' + t[m][n] + '。' });
    return frames;
  };

  /* ================================================================ 区间与计数 */

  // 不同的二叉搜索树：G[i] = Σ G[左边几个] × G[右边几个]
  trace.trees = function (n) {
    const g = blank(n + 1);
    g[0] = 1;
    g[1] = 1;
    const cols = range(0, n + 1);
    const frames = [{ rows: ['G'], cols, cells: [g.slice()], deps: [], vars: [], note: '0 个数只有一种（空树），1 个数也只有一种：G[0] = G[1] = 1。' }];
    for (let i = 2; i <= n; i++) {
      let sum = 0;
      const parts = [];
      for (let r = 1; r <= i; r++) {
        sum += g[r - 1] * g[i - r];
        parts.push(g[r - 1] + '×' + g[i - r]);
      }
      g[i] = sum;
      frames.push({ rows: ['G'], cols, cells: [g.slice()], cur: [0, i], deps: range(0, i).map((c) => [0, c]), vars: [['G[' + i + ']', sum]], note: i + ' 个数轮流当根，左右两边的个数分别是 (0, ' + (i - 1) + ') … (' + (i - 1) + ', 0)：' + parts.join(' + ') + ' = ' + sum + '。' });
    }
    return frames;
  };

  // 戳气球：两端补 1，dp[l][r] 是只戳开区间 (l, r) 里的气球最多得多少分
  trace.burst = function (nums) {
    const v = [1].concat(nums, [1]);
    const N = v.length;
    const t = table(N, N);
    const labels = v.map((x, k) => k + '（' + x + '）');
    for (let l = 0; l + 1 < N; l++) t[l][l + 1] = 0;
    const frames = [{ rows: labels, cols: labels, cells: copy(t), deps: [], vars: [], note: '两端补上 1。相邻的两个下标之间没有气球，得 0 分。' }];
    for (let len = 2; len < N; len++) {
      for (let l = 0; l + len < N; l++) {
        const r = l + len;
        let best = -1;
        let arg = -1;
        for (let k = l + 1; k < r; k++) {
          const s = t[l][k] + v[l] * v[k] * v[r] + t[k][r];
          if (s > best) {
            best = s;
            arg = k;
          }
        }
        t[l][r] = best;
        frames.push({
          rows: labels, cols: labels, cells: copy(t), cur: [l, r], deps: [[l, arg], [arg, r]], picks: [[l, arg], [arg, r]], vars: [['最后戳', '下标 ' + arg]],
          note: '区间 (' + l + ', ' + r + ') 里最后戳下标 ' + arg + '：' + t[l][arg] + ' + ' + v[l] + '×' + v[arg] + '×' + v[r] + ' + ' + t[arg][r] + ' = ' + best + '，是所有选择里最大的。',
        });
      }
    }
    frames.push({ rows: labels, cols: labels, cells: copy(t), picks: [[0, N - 1]], vars: [['答案', t[0][N - 1]]], note: '右上角 dp[0][' + (N - 1) + '] 就是戳完所有气球的最高分：' + t[0][N - 1] + '。' });
    return frames;
  };
})(typeof window !== 'undefined' ? window : globalThis);
