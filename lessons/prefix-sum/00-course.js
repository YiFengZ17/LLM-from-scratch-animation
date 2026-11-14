/*
 * 课程：前缀和与前后缀分解（LeetCode 题单第 4 类，4 题）。
 *
 * root.PS.trace.*：图形演示的帧。每个函数在样例输入上真的算一遍，每算一格记一帧。
 */
(function (root) {
  'use strict';

  root.Catalog.defineCourse({
    id: 'prefix-sum',
    board: 'algo',
    title: '前缀和与前后缀分解',
    eyebrow: 'LeetCode 题单 · 第 4 类 · 4 题',
    blurb: '反复求「一段的和」「除自己以外的积」时，每次都从头算一遍太慢。先把「从开头到这里」的累计结果存下来，任何一段的和就只要一次减法；「除自己以外」就拆成「左边的」和「右边的」。',
    langs: ['python', 'c', 'cpp', 'java', 'rust'],
    stats: [
      ['4', '道题'],
      ['2/2', '简单/中等'],
      ['5', '种语言'],
    ],
  });

  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
  const blank = (n) => Array.from({ length: n }, () => null);
  const showMap = (m) => '{' + Array.from(m, ([k, v]) => k + ': ' + v).join(', ') + '}';

  const trace = {
    // 1732：海拔是一路累加的净增量，记下最高的
    altitude(gain) {
      const n = gain.length;
      const alt = blank(n + 1);
      alt[0] = 0;
      let best = 0;
      const rows = ['gain', '海拔'];
      const cols = range(0, n + 1);
      const g = [null].concat(gain);
      const frames = [{ rows, cols, cells: [g, alt.slice()], cur: [1, 0], deps: [], vars: [['best', best]], note: '起点海拔是 0。第 i 段路程的净增量画在第 i 列，和走完它以后的海拔对齐。' }];
      for (let i = 1; i <= n; i++) {
        alt[i] = alt[i - 1] + gain[i - 1];
        best = Math.max(best, alt[i]);
        frames.push({ rows, cols, cells: [g, alt.slice()], cur: [1, i], deps: [[1, i - 1], [0, i]], vars: [['best', best]], note: '上一个点的海拔 ' + alt[i - 1] + '，加上这一段的净增量 ' + gain[i - 1] + '，是 ' + alt[i] + '。' });
      }
      frames.push({ rows, cols, cells: [g, alt.slice()], picks: [[1, alt.indexOf(best)]], vars: [['答案', best]], note: '所有点里最高的海拔是 ' + best + '。' });
      return frames;
    },

    // 303：pre[i] 是前 i 个数的和；区间 [l, r] 的和 = pre[r+1] - pre[l]
    prefix(nums, queries) {
      const n = nums.length;
      const pre = blank(n + 1);
      pre[0] = 0;
      const rows = ['nums', 'pre'];
      const cols = range(0, n + 1);
      const top = nums.concat([null]);
      const frames = [{ rows, cols, cells: [top, pre.slice()], cur: [1, 0], deps: [], vars: [], note: 'pre[i] 表示前 i 个数的和。前 0 个数的和是 0。' }];
      for (let i = 0; i < n; i++) {
        pre[i + 1] = pre[i] + nums[i];
        frames.push({ rows, cols, cells: [top, pre.slice()], cur: [1, i + 1], deps: [[1, i], [0, i]], vars: [], note: 'pre[' + (i + 1) + '] = pre[' + i + '] + nums[' + i + '] = ' + pre[i] + ' + ' + nums[i] + ' = ' + pre[i + 1] + '。' });
      }
      for (const [l, r] of queries) {
        const s = pre[r + 1] - pre[l];
        frames.push({
          rows, cols, cells: [top, pre.slice()], deps: range(l, r + 1).map((c) => [0, c]), picks: [[1, r + 1], [1, l]], vars: [['sumRange(' + l + ', ' + r + ')', s]],
          note: 'nums[' + l + '..' + r + '] 的和 = 前 ' + (r + 1) + ' 个的和 − 前 ' + l + ' 个的和 = pre[' + (r + 1) + '] − pre[' + l + '] = ' + pre[r + 1] + ' − ' + pre[l] + ' = ' + s + '。只要一次减法。',
        });
      }
      return frames;
    },

    // 560：边走边算前缀和，查表里有几个「pre - k」
    subK(nums, k) {
      const cnt = new Map([[0, 1]]);
      let pre = 0;
      let ans = 0;
      const frames = [{ cells: nums, ptrs: {}, vars: [['pre', 0], ['表', showMap(cnt)], ['个数', 0]], note: '表里记「某个前缀和出现过几次」。空前缀的和是 0，先记一次。' }];
      nums.forEach((x, j) => {
        pre += x;
        const need = pre - k;
        const c = cnt.get(need) || 0;
        ans += c;
        cnt.set(pre, (cnt.get(pre) || 0) + 1);
        frames.push({
          cells: nums, ptrs: { j }, marks: { [j]: c ? 'ok' : 'in' }, vars: [['pre', pre], ['找 pre − k', need], ['表', showMap(cnt)], ['个数', ans]],
          note: '前缀和 ' + pre + '。以这里结尾、和为 ' + k + ' 的子数组，开头前面的前缀和必须是 ' + pre + ' − ' + k + ' = ' + need + '：表里有 ' + c + ' 个' + (c ? '，个数加 ' + c + '。' : '。') + '再把 ' + pre + ' 记进表。',
        });
      });
      frames.push({ cells: nums, ptrs: {}, vars: [['答案', ans]], note: '一共 ' + ans + ' 个和为 ' + k + ' 的子数组。' });
      return frames;
    },

    // 238：答案 = 左边的积 × 右边的积
    product(nums) {
      const n = nums.length;
      const left = blank(n);
      const right = blank(n);
      const ans = blank(n);
      const rows = ['nums', '左边的积', '右边的积', '答案'];
      const cols = range(0, n);
      const cells = () => [nums, left.slice(), right.slice(), ans.slice()];
      const frames = [];
      left[0] = 1;
      frames.push({ rows, cols, cells: cells(), cur: [1, 0], deps: [], vars: [], note: '第 0 个数左边什么都没有，乘积记作 1（乘 1 不改变结果）。' });
      for (let i = 1; i < n; i++) {
        left[i] = left[i - 1] * nums[i - 1];
        frames.push({ rows, cols, cells: cells(), cur: [1, i], deps: [[1, i - 1], [0, i - 1]], vars: [], note: '左边的积从左往右推：前一格的左边积 ' + left[i - 1] + ' 再乘上前一个数 ' + nums[i - 1] + '，得 ' + left[i] + '。' });
      }
      right[n - 1] = 1;
      ans[n - 1] = left[n - 1];
      frames.push({ rows, cols, cells: cells(), cur: [3, n - 1], deps: [[1, n - 1], [2, n - 1]], vars: [], note: '最后一个数右边什么都没有，右边积是 1。答案 = 左边积 × 右边积 = ' + ans[n - 1] + '。' });
      for (let i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] * nums[i + 1];
        ans[i] = left[i] * right[i];
        frames.push({ rows, cols, cells: cells(), cur: [3, i], deps: [[1, i], [2, i]], vars: [], note: '右边的积从右往左推：' + right[i + 1] + ' × ' + nums[i + 1] + ' = ' + right[i] + '。答案 = ' + left[i] + ' × ' + right[i] + ' = ' + ans[i] + '。' });
      }
      return frames;
    },
  };

  root.PS = { trace };
})(typeof window !== 'undefined' ? window : globalThis);
