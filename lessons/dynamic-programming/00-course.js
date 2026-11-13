/*
 * 课程：动态规划（LeetCode 题单第 13 类，29 题）。
 * 按子模块组织（章的 group 字段）：先一章概念，再「一维递推」「子数组」……陆续上线。
 *
 * root.DP.trace.*：图形演示的帧。每个函数在样例输入上真的把 DP 表填一遍，每填一格记一帧：
 * 正在算的格子、它依赖的格子、取 max/min 时赢的那一边，都标出来。
 */
(function (root) {
  'use strict';

  root.Catalog.defineCourse({
    id: 'dynamic-programming',
    board: 'algo',
    title: '动态规划',
    eyebrow: 'LeetCode 题单 · 第 13 类 · 29 题',
    blurb: '从一个会重复计算的递归出发，想清楚「把算过的记下来」，再学会写动态规划的四步：状态、转移、初始值、计算顺序。29 道题分成 7 个子模块，每道题都能在 Python、C、C++、Java、Rust 之间切换，子模块陆续上线。',
    langs: ['python', 'c', 'cpp', 'java', 'rust'],
    stats: [
      ['7', '个子模块'],
      ['29', '道题'],
      ['5', '种语言'],
      ['7/19/3', '简单/中等/困难'],
    ],
  });

  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
  const blank = (n) => Array.from({ length: n }, () => null);

  const trace = {
    // 爬楼梯：dp[i] = dp[i-1] + dp[i-2]
    climb(n) {
      const dp = blank(n + 1);
      dp[0] = 1;
      dp[1] = 1;
      const cols = range(0, n + 1);
      const frames = [{ rows: ['dp'], cols, cells: [dp.slice()], cur: null, deps: [], note: '先填两个起点：站在地面（第 0 级）有 1 种走法，走到第 1 级也只有 1 种。', vars: [] }];
      for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
        frames.push({
          rows: ['dp'],
          cols,
          cells: [dp.slice()],
          cur: [0, i],
          deps: [[0, i - 1], [0, i - 2]],
          vars: [['dp[' + i + ']', dp[i]]],
          note: '到第 ' + i + ' 级，最后一步要么从第 ' + (i - 1) + ' 级跨 1 级，要么从第 ' + (i - 2) + ' 级跨 2 级：dp[' + i + '] = ' + dp[i - 1] + ' + ' + dp[i - 2] + ' = ' + dp[i] + '。',
        });
      }
      frames.push({ rows: ['dp'], cols, cells: [dp.slice()], cur: null, deps: [], picks: [[0, n]], vars: [['答案', dp[n]]], note: '表填完了，答案就是最后一格 dp[' + n + '] = ' + dp[n] + '。' });
      return frames;
    },

    // 最小花费爬楼梯：dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])
    minCost(cost) {
      const n = cost.length;
      const dp = blank(n + 1);
      dp[0] = 0;
      dp[1] = 0;
      const cols = range(0, n).map(String).concat(['顶']);
      const top = cost.concat([null]);
      const frames = [{ rows: ['cost', 'dp'], cols, cells: [top, dp.slice()], deps: [], note: '可以从第 0 级或第 1 级出发，站上去不花钱：dp[0] = dp[1] = 0。', vars: [] }];
      for (let i = 2; i <= n; i++) {
        const a = dp[i - 1] + cost[i - 1];
        const b = dp[i - 2] + cost[i - 2];
        dp[i] = Math.min(a, b);
        const fromOne = a <= b;
        frames.push({
          rows: ['cost', 'dp'],
          cols,
          cells: [top, dp.slice()],
          cur: [1, i],
          deps: [[1, i - 1], [0, i - 1], [1, i - 2], [0, i - 2]],
          picks: fromOne ? [[1, i - 1], [0, i - 1]] : [[1, i - 2], [0, i - 2]],
          vars: [['从 ' + (i - 1) + ' 上来', a], ['从 ' + (i - 2) + ' 上来', b]],
          note: '到' + (i === n ? '楼顶' : '第 ' + i + ' 级') + '：从 ' + (i - 1) + ' 上来要 ' + dp[i - 1] + ' + ' + cost[i - 1] + ' = ' + a + '，从 ' + (i - 2) + ' 上来要 ' + dp[i - 2] + ' + ' + cost[i - 2] + ' = ' + b + '，取小的 ' + dp[i] + '。',
        });
      }
      frames.push({ rows: ['cost', 'dp'], cols, cells: [top, dp.slice()], picks: [[1, n]], vars: [['答案', dp[n]]], note: '到楼顶的最小花费是 ' + dp[n] + '。' });
      return frames;
    },

    // 泰波那契：每个数是前三个数之和，只需要记住最后三个
    trib(n) {
      const t = blank(n + 1);
      t[0] = 0;
      if (n >= 1) t[1] = 1;
      if (n >= 2) t[2] = 1;
      const cols = range(0, n + 1);
      const frames = [{ rows: ['T'], cols, cells: [t.slice()], deps: [], vars: [['a', 0], ['b', 1], ['c', 1]], note: '前三个数题目直接给了：T0 = 0，T1 = 1，T2 = 1。用 a、b、c 记住最后三个。' }];
      for (let i = 3; i <= n; i++) {
        t[i] = t[i - 1] + t[i - 2] + t[i - 3];
        frames.push({
          rows: ['T'],
          cols,
          cells: [t.slice()],
          cur: [0, i],
          deps: [[0, i - 1], [0, i - 2], [0, i - 3]],
          vars: [['a', t[i - 2]], ['b', t[i - 1]], ['c', t[i]]],
          note: 'T' + i + ' = ' + t[i - 3] + ' + ' + t[i - 2] + ' + ' + t[i - 1] + ' = ' + t[i] + '。之后 T' + (i - 3) + ' 再也用不到了，三个变量整体往右挪一格。',
        });
      }
      return frames;
    },

    // 打家劫舍：dp[i] = 前 i 间房最多偷多少 = max(dp[i-1], dp[i-2] + nums[i-1])
    rob(nums) {
      const n = nums.length;
      const dp = blank(n + 1);
      dp[0] = 0;
      dp[1] = nums[0];
      const cols = range(0, n + 1);
      const house = [null].concat(nums);
      const frames = [{ rows: ['nums', 'dp'], cols, cells: [house, dp.slice()], deps: [], note: '一间房都没有，偷 0；只有第 1 间，就偷它：dp[1] = ' + nums[0] + '。第 i 列的房子和 dp[i] 对齐。', vars: [] }];
      for (let i = 2; i <= n; i++) {
        const skip = dp[i - 1];
        const take = dp[i - 2] + nums[i - 1];
        dp[i] = Math.max(skip, take);
        frames.push({
          rows: ['nums', 'dp'],
          cols,
          cells: [house, dp.slice()],
          cur: [1, i],
          deps: [[1, i - 1], [1, i - 2], [0, i]],
          picks: take > skip ? [[1, i - 2], [0, i]] : [[1, i - 1]],
          vars: [['不偷第 ' + i + ' 间', skip], ['偷第 ' + i + ' 间', take]],
          note: '第 ' + i + ' 间：不偷，就是前 ' + (i - 1) + ' 间的 ' + skip + '；偷，前一间不能偷，' + dp[i - 2] + ' + ' + nums[i - 1] + ' = ' + take + '。取大的 ' + dp[i] + '。',
        });
      }
      frames.push({ rows: ['nums', 'dp'], cols, cells: [house, dp.slice()], picks: [[1, n]], vars: [['答案', dp[n]]], note: '所有房子都考虑过了，最多偷 ' + dp[n] + '。' });
      return frames;
    },

    // 最大子数组和：dp[i] = 以 nums[i] 结尾的最大和 = max(nums[i], dp[i-1] + nums[i])
    maxSub(nums) {
      const n = nums.length;
      const dp = blank(n);
      dp[0] = nums[0];
      let best = dp[0];
      const cols = range(0, n);
      const frames = [{ rows: ['nums', 'dp'], cols, cells: [nums, dp.slice()], cur: [1, 0], deps: [[0, 0]], vars: [['best', best]], note: '以第 0 个数结尾的子数组只有它自己：dp[0] = ' + nums[0] + '。' }];
      for (let i = 1; i < n; i++) {
        const join = dp[i - 1] + nums[i];
        dp[i] = Math.max(nums[i], join);
        best = Math.max(best, dp[i]);
        frames.push({
          rows: ['nums', 'dp'],
          cols,
          cells: [nums, dp.slice()],
          cur: [1, i],
          deps: [[1, i - 1], [0, i]],
          picks: join >= nums[i] ? [[1, i - 1], [0, i]] : [[0, i]],
          vars: [['best', best]],
          note: join >= nums[i]
            ? '接在前面：' + dp[i - 1] + ' + ' + nums[i] + ' = ' + join + '，比单独的 ' + nums[i] + ' 大，接上。'
            : '前面的和是 ' + dp[i - 1] + '，接上反而变小，不如从 ' + nums[i] + ' 重新开始。',
        });
      }
      frames.push({ rows: ['nums', 'dp'], cols, cells: [nums, dp.slice()], picks: [[1, dp.indexOf(best)]], vars: [['答案', best]], note: '答案不一定在最后一格，而是整行里最大的那一格：' + best + '。' });
      return frames;
    },

    // 最长连续递增序列：dp[i] = 以 nums[i] 结尾的最长连续递增长度
    lcis(nums) {
      const n = nums.length;
      const dp = blank(n);
      dp[0] = 1;
      let best = 1;
      const cols = range(0, n);
      const frames = [{ rows: ['nums', 'dp'], cols, cells: [nums, dp.slice()], cur: [1, 0], deps: [], vars: [['best', best]], note: '只看第 0 个数，长度是 1。' }];
      for (let i = 1; i < n; i++) {
        const up = nums[i] > nums[i - 1];
        dp[i] = up ? dp[i - 1] + 1 : 1;
        best = Math.max(best, dp[i]);
        frames.push({
          rows: ['nums', 'dp'],
          cols,
          cells: [nums, dp.slice()],
          cur: [1, i],
          deps: up ? [[0, i - 1], [0, i], [1, i - 1]] : [[0, i - 1], [0, i]],
          vars: [['best', best]],
          note: up ? nums[i] + ' > ' + nums[i - 1] + '，接得上：dp[' + i + '] = ' + dp[i - 1] + ' + 1 = ' + dp[i] + '。' : nums[i] + ' 不比 ' + nums[i - 1] + ' 大，断了，从 1 重新数。',
        });
      }
      return frames;
    },

    // 乘积最大子数组：同时记以 nums[i] 结尾的最大积和最小积
    maxProduct(nums) {
      const n = nums.length;
      const hi = blank(n);
      const lo = blank(n);
      hi[0] = lo[0] = nums[0];
      let best = nums[0];
      const cols = range(0, n);
      const frames = [{ rows: ['nums', 'max', 'min'], cols, cells: [nums, hi.slice(), lo.slice()], cur: [1, 0], deps: [[0, 0]], vars: [['best', best]], note: '以第 0 个数结尾，最大积和最小积都是它自己。' }];
      for (let i = 1; i < n; i++) {
        const x = nums[i];
        const c = [x, hi[i - 1] * x, lo[i - 1] * x];
        hi[i] = Math.max(...c);
        lo[i] = Math.min(...c);
        best = Math.max(best, hi[i]);
        frames.push({
          rows: ['nums', 'max', 'min'],
          cols,
          cells: [nums, hi.slice(), lo.slice()],
          cur: [1, i],
          deps: [[0, i], [1, i - 1], [2, i - 1]],
          vars: [['候选', c.join(', ')], ['best', best]],
          note: '三个候选：' + x + ' 自己、上一个最大积 × ' + x + ' = ' + c[1] + '、上一个最小积 × ' + x + ' = ' + c[2] + '。最大的 ' + hi[i] + ' 记进 max，最小的 ' + lo[i] + ' 记进 min。' + (x < 0 ? '乘上负数，大小正好对调。' : ''),
        });
      }
      return frames;
    },
  };

  root.DP = { trace };
})(typeof window !== 'undefined' ? window : globalThis);
