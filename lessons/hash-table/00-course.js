/*
 * 课程：哈希表与数组（LeetCode 题单第 1 类，9 题）。
 *
 * root.HT.trace.*：图形演示的帧。每个函数在样例输入上真的跑一遍算法，每一步记一帧。
 * 哈希表里存了什么，放在右侧的变量里显示。
 */
(function (root) {
  'use strict';

  root.Catalog.defineCourse({
    id: 'hash-table',
    board: 'algo',
    title: '哈希表与数组',
    eyebrow: 'LeetCode 题单 · 第 1 类 · 9 题',
    blurb: '「这个数见过没有？」「它出现了几次？」挨个找要 O(n)，哈希表一步就能回答。先弄懂哈希表怎么做到的，再用它做查找、计数、分组；也学会在只能用原数组的时候，把记号直接做在数组里。最后亲手实现一个哈希集合。',
    langs: ['python', 'c', 'cpp', 'java', 'rust'],
    stats: [
      ['9', '道题'],
      ['7/2', '简单/中等'],
      ['5', '种语言'],
    ],
  });

  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
  const blank = (n) => Array.from({ length: n }, () => null);
  // 把一个 Map 写成 {键: 值, …} 的样子放进变量栏
  const showMap = (m) => '{' + Array.from(m, ([k, v]) => k + ': ' + v).join(', ') + '}';
  const showSet = (s) => '{' + Array.from(s).join(', ') + '}';

  const trace = {
    // 1431：先找最大值，再逐个比较
    candies(candies, extra) {
      const frames = [];
      let max = candies[0];
      frames.push({ cells: candies, ptrs: { i: 0 }, marks: { 0: 'in' }, vars: [['max', max]], note: '第一遍：找出现在最多的糖果数。先拿第一个孩子的 ' + max + ' 当最大值。' });
      for (let i = 1; i < candies.length; i++) {
        const bigger = candies[i] > max;
        if (bigger) max = candies[i];
        frames.push({ cells: candies, ptrs: { i }, marks: { [i]: bigger ? 'in' : 'out' }, vars: [['max', max]], note: candies[i] + (bigger ? ' 比目前的最大值大，换成它。' : ' 不比 ' + max + ' 大，跳过。') });
      }
      const marks = {};
      for (let i = 0; i < candies.length; i++) {
        const ok = candies[i] + extra >= max;
        marks[i] = ok ? 'ok' : 'hit';
        frames.push({ cells: candies, ptrs: { i }, marks: Object.assign({}, marks), vars: [['max', max], ['extra', extra]], note: '第二遍：' + candies[i] + ' + ' + extra + ' = ' + (candies[i] + extra) + (ok ? ' ≥ ' + max + '，能成为最多的：true。' : ' < ' + max + '，不能：false。') });
      }
      return frames;
    },

    // 383：数杂志里每个字母有几个，再一个个用掉
    ransom(note, magazine) {
      const letters = Array.from(new Set((magazine + note).split(''))).sort();
      const cnt = Object.fromEntries(letters.map((c) => [c, 0]));
      const rows = ['剩余'];
      const cells = () => [letters.map((c) => cnt[c])];
      const frames = [{ rows, cols: letters, cells: cells(), deps: [], vars: [['magazine', magazine], ['ransomNote', note]], note: '26 个字母各准备一个计数器，先全是 0（这里只画出用到的几个）。' }];
      for (const ch of magazine) {
        cnt[ch]++;
        frames.push({ rows, cols: letters, cells: cells(), cur: [0, letters.indexOf(ch)], deps: [], vars: [['读到', ch]], note: '杂志里有一个 ' + ch + '：它的计数加一。' });
      }
      for (const ch of note) {
        cnt[ch]--;
        const bad = cnt[ch] < 0;
        frames.push({
          rows, cols: letters, cells: cells(), cur: [0, letters.indexOf(ch)], deps: [], picks: bad ? [[0, letters.indexOf(ch)]] : [], vars: [['要用', ch]],
          note: '信里要一个 ' + ch + '：计数减一' + (bad ? '，变成负数了——杂志里的 ' + ch + ' 不够，返回 false。' : '，还剩 ' + cnt[ch] + ' 个。'),
        });
        if (bad) return frames;
      }
      frames.push({ rows, cols: letters, cells: cells(), deps: [], vars: [['结果', 'true']], note: '信里的字母都用完了，没有哪个不够：返回 true。' });
      return frames;
    },

    // 1：边走边查「另一半」在不在表里
    twoSum(nums, target) {
      const seen = new Map();
      const frames = [];
      for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) {
          const j = seen.get(need);
          frames.push({ cells: nums, ptrs: { i }, marks: { [i]: 'ok', [j]: 'ok' }, vars: [['need', need], ['表', showMap(seen)]], note: '要找 ' + target + ' − ' + nums[i] + ' = ' + need + '：表里有，它在下标 ' + j + '。答案 [' + j + ', ' + i + ']。' });
          return frames;
        }
        seen.set(nums[i], i);
        frames.push({ cells: nums, ptrs: { i }, marks: { [i]: 'in' }, vars: [['need', need], ['表', showMap(seen)]], note: '要找 ' + target + ' − ' + nums[i] + ' = ' + need + '：表里没有。把 ' + nums[i] + ' → ' + i + ' 记进表，留给后面的数来找。' });
      }
      return frames;
    },

    // 169：投票，候选人和票数
    vote(nums) {
      let cand = null;
      let count = 0;
      const frames = [];
      for (let i = 0; i < nums.length; i++) {
        const x = nums[i];
        let note;
        if (count === 0) {
          cand = x;
          count = 1;
          note = '票数是 0：' + x + ' 当新的候选人，票数 1。';
        } else if (x === cand) {
          count++;
          note = x + ' 和候选人相同：票数加一，现在 ' + count + '。';
        } else {
          count--;
          note = x + ' 和候选人 ' + cand + ' 不同，互相抵消：票数减一，现在 ' + count + '。';
        }
        frames.push({ cells: nums, ptrs: { i }, marks: { [i]: x === cand ? 'in' : 'out' }, vars: [['候选人', cand], ['票数', count]], note });
      }
      frames.push({ cells: nums, ptrs: {}, vars: [['答案', cand]], note: '走完一遍，留下来的候选人 ' + cand + ' 就是多数元素。' });
      return frames;
    },

    // 448：把「见过 x」记成「第 x-1 格变成负数」
    missing(nums) {
      const a = nums.slice();
      const frames = [{ cells: a.slice(), ptrs: {}, vars: [], note: '数都在 1 到 n 之间，正好对应下标 0 到 n-1。见过 x，就把下标 x - 1 的数变成负的，当作记号。' }];
      for (let i = 0; i < a.length; i++) {
        const x = Math.abs(a[i]);
        a[x - 1] = -Math.abs(a[x - 1]);
        frames.push({ cells: a.slice(), ptrs: { i }, marks: { [x - 1]: 'hit' }, vars: [['x', x]], note: '读到 ' + x + (a[i] < 0 && i !== x - 1 ? '（它自己已经被标成负数了，取绝对值）' : '') + '：把下标 ' + (x - 1) + ' 标成负数。' });
      }
      const marks = {};
      const ans = [];
      a.forEach((v, i) => {
        if (v > 0) {
          marks[i] = 'ok';
          ans.push(i + 1);
        }
      });
      frames.push({ cells: a.slice(), ptrs: {}, marks, vars: [['答案', '[' + ans.join(', ') + ']']], note: '还是正数的格子，说明对应的数从来没出现过：下标 ' + Object.keys(marks).join('、') + '，也就是 ' + ans.join('、') + '。' });
      return frames;
    },

    // 1331：排好序，从小到大给不同的数编号，再查表
    rank(arr) {
      const n = arr.length;
      const sorted = arr.slice().sort((x, y) => x - y);
      const ranks = new Map();
      const rankRow = blank(n);
      const ans = blank(n);
      const rows = ['arr', '排序后', '序号', '答案'];
      const cols = range(0, n);
      const cells = () => [arr, sorted, rankRow.slice(), ans.slice()];
      const frames = [{ rows, cols, cells: cells(), deps: [], vars: [], note: '先复制一份排好序：小的在前，序号就从左往右数。' }];
      sorted.forEach((x, k) => {
        const fresh = !ranks.has(x);
        if (fresh) ranks.set(x, ranks.size + 1);
        rankRow[k] = ranks.get(x);
        frames.push({ rows, cols, cells: cells(), cur: [2, k], deps: [[1, k]], vars: [['表', showMap(ranks)]], note: fresh ? x + ' 第一次出现，序号是表里已有的个数加一：' + ranks.get(x) + '。' : x + ' 已经有序号了，和前面那个一样，不再编新号。' });
      });
      arr.forEach((x, i) => {
        ans[i] = ranks.get(x);
        frames.push({ rows, cols, cells: cells(), cur: [3, i], deps: [[0, i]], vars: [['表', showMap(ranks)]], note: '按原来的顺序查表：' + x + ' 的序号是 ' + ans[i] + '。' });
      });
      return frames;
    },

    // 49：排序后的字母当钥匙，同一把钥匙放一组
    anagram(strs) {
      const index = new Map();
      const groups = [];
      const frames = [];
      strs.forEach((s, i) => {
        const key = s.split('').sort().join('');
        const fresh = !index.has(key);
        if (fresh) {
          index.set(key, groups.length);
          groups.push([]);
        }
        groups[index.get(key)].push(s);
        frames.push({
          cells: strs, ptrs: { i }, marks: { [i]: fresh ? 'in' : 'ok' }, vars: [['key', key], ['分组', groups.map((g) => g.join(' ')).join(' | ')]],
          note: s + ' 的字母排好序是 ' + key + '。' + (fresh ? '这把钥匙第一次出现，开一个新组。' : '表里已经有这把钥匙，放进第 ' + (index.get(key) + 1) + ' 组。'),
        });
      });
      return frames;
    },

    // 128：只从序列的开头往上数
    consecutive(nums) {
      const set = new Set(nums);
      const done = new Set();
      let best = 0;
      const frames = [{ cells: nums, ptrs: {}, vars: [['集合', showSet(set)]], note: '先把所有数放进集合，之后问「某个数在不在」只要 O(1)。' }];
      nums.forEach((x, i) => {
        if (done.has(x)) return;
        done.add(x);
        if (set.has(x - 1)) {
          frames.push({ cells: nums, ptrs: { i }, marks: { [i]: 'out' }, vars: [['best', best]], note: x - 1 + ' 也在集合里，所以 ' + x + ' 不是一段的开头。跳过，等从开头数的时候自然会数到它。' });
          return;
        }
        let y = x;
        while (set.has(y + 1)) y++;
        best = Math.max(best, y - x + 1);
        const marks = {};
        nums.forEach((v, k) => {
          if (v >= x && v <= y) marks[k] = 'ok';
        });
        frames.push({ cells: nums, ptrs: { i }, marks, vars: [['best', best]], note: x - 1 + ' 不在集合里，' + x + ' 是开头。往上数 ' + x + (y > x ? '、' + (x + 1) + (y > x + 1 ? '…' + y : '') : '') + '，长度 ' + (y - x + 1) + '。' });
      });
      frames.push({ cells: nums, ptrs: {}, vars: [['答案', best]], note: '每一段都只从开头数了一遍，最长的一段长 ' + best + '。' });
      return frames;
    },

    // 705：拉链法，每个桶是一串
    buckets(base, ops) {
      const width = 4;
      const b = Array.from({ length: base }, () => []);
      const rows = range(0, base).map((k) => '桶 ' + k);
      const cols = range(0, width).map((k) => '#' + k);
      const cells = () => b.map((list) => range(0, width).map((k) => (k < list.length ? list[k] : null)));
      const frames = [{ rows, cols, cells: cells(), deps: [], vars: [['桶数', base]], note: '准备 ' + base + ' 个空桶。一个数放进第「数 % ' + base + '」号桶。' }];
      for (const [op, key] of ops) {
        const h = key % base;
        const list = b[h];
        const at = list.indexOf(key);
        let note;
        let res = '';
        if (op === 'add') {
          if (at < 0) list.push(key);
          note = 'add(' + key + ')：' + key + ' % ' + base + ' = ' + h + '，去 ' + h + ' 号桶。' + (at < 0 ? (list.length > 1 ? '桶里已经有别的数了（冲突），接在后面。' : '放进去。') : '已经有了，不重复放。');
        } else if (op === 'remove') {
          if (at >= 0) list.splice(at, 1);
          note = 'remove(' + key + ')：去 ' + h + ' 号桶找，' + (at >= 0 ? '找到了，拿掉。' : '没有，什么都不做。');
        } else {
          res = at >= 0 ? 'true' : 'false';
          note = 'contains(' + key + ')：只翻 ' + h + ' 号桶，' + (at >= 0 ? '找到了：true。' : '没有：false。');
        }
        const pos = list.indexOf(key);
        frames.push({ rows, cols, cells: cells(), cur: pos >= 0 ? [h, pos] : null, deps: range(0, list.length).map((k) => [h, k]), vars: [['桶号', h]].concat(res ? [['结果', res]] : []), note });
      }
      return frames;
    },
  };

  root.HT = { trace };
})(typeof window !== 'undefined' ? window : globalThis);
