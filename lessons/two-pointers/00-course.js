/*
 * 课程：双指针（LeetCode 题单第 2 类，11 题）。
 * 三个子模块：相向指针、同向指针、快慢指针（章的 group 字段）。
 *
 * root.TP.trace.*：图形演示的帧。每个函数在样例输入上真的跑一遍，每移动一次指针记一帧。
 */
(function (root) {
  'use strict';

  root.Catalog.defineCourse({
    id: 'two-pointers',
    board: 'algo',
    title: '双指针',
    eyebrow: 'LeetCode 题单 · 第 2 类 · 11 题',
    blurb: '两层循环试遍所有组合太慢。用两个下标，每一步根据当前看到的情况，有把握地排除一大片不可能的答案，只走一遍。分成三种：从两头往中间走的相向指针、一前一后的同向指针、一快一慢的快慢指针。',
    langs: ['python', 'c', 'cpp', 'java', 'rust'],
    stats: [
      ['11', '道题'],
      ['6/4/1', '简单/中等/困难'],
      ['3', '种指针'],
    ],
  });

  const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);
  const isAlnum = (c) => /[A-Za-z0-9]/.test(c);
  const VOWELS = 'aeiouAEIOU';

  const trace = {
    // 125：两头往中间，跳过不是字母数字的字符，比较小写
    palin(s) {
      const cells = s.split('').map((c) => (c === ' ' ? '␣' : c));
      let l = 0;
      let r = s.length - 1;
      const frames = [];
      const ok = {};
      while (l < r) {
        if (!isAlnum(s[l])) {
          frames.push({ cells, ptrs: { l, r }, marks: Object.assign({}, ok, { [l]: 'out' }), vars: [], note: '「' + cells[l] + '」不是字母或数字，left 跳过它。' });
          l++;
          continue;
        }
        if (!isAlnum(s[r])) {
          frames.push({ cells, ptrs: { l, r }, marks: Object.assign({}, ok, { [r]: 'out' }), vars: [], note: '「' + cells[r] + '」不是字母或数字，right 跳过它。' });
          r--;
          continue;
        }
        const a = s[l].toLowerCase();
        const b = s[r].toLowerCase();
        if (a !== b) {
          frames.push({ cells, ptrs: { l, r }, marks: Object.assign({}, ok, { [l]: 'hit', [r]: 'hit' }), vars: [['结果', 'false']], note: a + ' ≠ ' + b + '：对称位置不一样，不是回文。' });
          return frames;
        }
        ok[l] = 'ok';
        ok[r] = 'ok';
        frames.push({ cells, ptrs: { l, r }, marks: Object.assign({}, ok), vars: [], note: '都换成小写比较：' + a + ' = ' + b + '。两个指针各往中间走一步。' });
        l++;
        r--;
      }
      frames.push({ cells, ptrs: {}, marks: ok, vars: [['结果', 'true']], note: '两个指针相遇，每一对都相同：是回文。' });
      return frames;
    },

    // 345：两头往中间，各自停在元音上，交换
    vowels(s) {
      const a = s.split('');
      let l = 0;
      let r = a.length - 1;
      const frames = [{ cells: a.slice(), ptrs: { l, r }, vars: [], note: 'left 从左往右找元音，right 从右往左找元音。' }];
      while (l < r) {
        while (l < r && !VOWELS.includes(a[l])) l++;
        while (l < r && !VOWELS.includes(a[r])) r--;
        if (l >= r) break;
        frames.push({ cells: a.slice(), ptrs: { l, r }, marks: { [l]: 'hit', [r]: 'hit' }, vars: [], note: '两边都停在元音上：' + a[l] + ' 和 ' + a[r] + '。交换它们。' });
        [a[l], a[r]] = [a[r], a[l]];
        frames.push({ cells: a.slice(), ptrs: { l, r }, marks: { [l]: 'ok', [r]: 'ok' }, vars: [], note: '交换完，两个指针各往中间走一步，接着找。' });
        l++;
        r--;
      }
      frames.push({ cells: a.slice(), ptrs: {}, vars: [['结果', a.join('')]], note: '两个指针相遇，元音都换过了：' + a.join('') + '。' });
      return frames;
    },

    // LCR 006：有序数组，两头往中间，和大了右边左移，小了左边右移
    sortedTwo(nums, target) {
      let l = 0;
      let r = nums.length - 1;
      const frames = [];
      while (l < r) {
        const sum = nums[l] + nums[r];
        if (sum === target) {
          frames.push({ cells: nums, ptrs: { l, r }, marks: { [l]: 'ok', [r]: 'ok' }, vars: [['sum', sum], ['target', target]], note: nums[l] + ' + ' + nums[r] + ' = ' + sum + '，正好等于 target：答案 [' + l + ', ' + r + ']。' });
          return frames;
        }
        if (sum > target) {
          frames.push({ cells: nums, ptrs: { l, r }, marks: { [r]: 'out' }, vars: [['sum', sum], ['target', target]], note: nums[l] + ' + ' + nums[r] + ' = ' + sum + ' 大了。' + nums[r] + ' 配最小的数都嫌大，配谁都大，排除它：right 左移。' });
          r--;
        } else {
          frames.push({ cells: nums, ptrs: { l, r }, marks: { [l]: 'out' }, vars: [['sum', sum], ['target', target]], note: nums[l] + ' + ' + nums[r] + ' = ' + sum + ' 小了。' + nums[l] + ' 配最大的数都嫌小，配谁都小，排除它：left 右移。' });
          l++;
        }
      }
      return frames;
    },

    // 11：两头往中间，每次移动矮的那一边
    container(h) {
      let l = 0;
      let r = h.length - 1;
      let best = 0;
      const frames = [];
      while (l < r) {
        const area = Math.min(h[l], h[r]) * (r - l);
        best = Math.max(best, area);
        const moveLeft = h[l] < h[r];
        frames.push({
          cells: h, win: [l, r], ptrs: { l, r }, marks: { [moveLeft ? l : r]: 'out' }, vars: [['面积', area], ['best', best]],
          note: '宽 ' + (r - l) + '，高取矮的 ' + Math.min(h[l], h[r]) + '，面积 ' + area + '。' + (moveLeft ? '左边矮' : '右边不比左边高') + '：它和谁配都不会更大了，排除它，' + (moveLeft ? 'left 右移。' : 'right 左移。'),
        });
        if (moveLeft) l++;
        else r--;
      }
      frames.push({ cells: h, ptrs: {}, vars: [['best', best]], note: '两个指针相遇，最大的面积是 ' + best + '。' });
      return frames;
    },

    // 15：排好序，固定 i，后面用相向指针找两数之和 = -nums[i]
    threeSum(input) {
      const nums = input.slice().sort((x, y) => x - y);
      const n = nums.length;
      const found = [];
      const frames = [{ cells: nums, ptrs: {}, vars: [], note: '先排序：' + nums.join(', ') + '。排好序才能用相向指针，也方便跳过重复。' }];
      for (let i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) {
          frames.push({ cells: nums, ptrs: { i }, marks: { [i]: 'out' }, vars: [['找到', found.length ? found.map((t) => '[' + t.join(',') + ']').join(' ') : '无']], note: nums[i] + ' 和上一个 i 一样，再找一遍只会找到重复的三元组，跳过。' });
          continue;
        }
        let l = i + 1;
        let r = n - 1;
        while (l < r) {
          const sum = nums[i] + nums[l] + nums[r];
          if (sum === 0) {
            found.push([nums[i], nums[l], nums[r]]);
            frames.push({ cells: nums, ptrs: { i, l, r }, marks: { [i]: 'in', [l]: 'ok', [r]: 'ok' }, vars: [['和', sum], ['找到', found.map((t) => '[' + t.join(',') + ']').join(' ')]], note: nums[i] + ' + ' + nums[l] + ' + ' + nums[r] + ' = 0，记下。left、right 都往中间走，并跳过和刚才相同的数。' });
            l++;
            r--;
            while (l < r && nums[l] === nums[l - 1]) l++;
            while (l < r && nums[r] === nums[r + 1]) r--;
          } else {
            frames.push({ cells: nums, ptrs: { i, l, r }, marks: { [i]: 'in', [sum > 0 ? r : l]: 'out' }, vars: [['和', sum], ['找到', found.length ? found.map((t) => '[' + t.join(',') + ']').join(' ') : '无']], note: nums[i] + ' + ' + nums[l] + ' + ' + nums[r] + ' = ' + sum + (sum > 0 ? '，大了：right 左移。' : '，小了：left 右移。') });
            if (sum > 0) r--;
            else l++;
          }
        }
      }
      frames.push({ cells: nums, ptrs: {}, vars: [['找到', found.length ? found.map((t) => '[' + t.join(',') + ']').join(' ') : '无']], note: 'i 走完了，一共找到 ' + found.length + ' 个三元组。' });
      return frames;
    },

    // 42：两头往中间，矮的一边的水位由它那边的最高柱子决定
    trap(h) {
      let l = 0;
      let r = h.length - 1;
      let lmax = 0;
      let rmax = 0;
      let water = 0;
      const frames = [];
      while (l < r) {
        if (h[l] < h[r]) {
          lmax = Math.max(lmax, h[l]);
          const add = lmax - h[l];
          water += add;
          frames.push({ cells: h, ptrs: { l, r }, marks: { [l]: add ? 'in' : 'out' }, vars: [['leftMax', lmax], ['rightMax', rmax], ['水', water]], note: '左边矮（' + h[l] + ' < ' + h[r] + '）：右边至少有 ' + h[r] + ' 挡着，这一格的水位只看 leftMax = ' + lmax + '，能存 ' + add + '。left 右移。' });
          l++;
        } else {
          rmax = Math.max(rmax, h[r]);
          const add = rmax - h[r];
          water += add;
          frames.push({ cells: h, ptrs: { l, r }, marks: { [r]: add ? 'in' : 'out' }, vars: [['leftMax', lmax], ['rightMax', rmax], ['水', water]], note: '右边不比左边高：左边至少有 ' + h[l] + ' 挡着，这一格的水位只看 rightMax = ' + rmax + '，能存 ' + add + '。right 左移。' });
          r--;
        }
      }
      frames.push({ cells: h, ptrs: {}, vars: [['水', water]], note: '两个指针相遇，一共存 ' + water + ' 格水。' });
      return frames;
    },

    // 283：write 指着下一个非零数该放的位置，read 往前读
    moveZeroes(input) {
      const a = input.slice();
      let w = 0;
      const frames = [{ cells: a.slice(), ptrs: { write: 0, read: 0 }, vars: [], note: 'write 指着下一个非零数该放的位置，read 逐个往前读。' }];
      for (let r = 0; r < a.length; r++) {
        if (a[r] !== 0) {
          [a[w], a[r]] = [a[r], a[w]];
          frames.push({ cells: a.slice(), ptrs: { write: w, read: r }, marks: { [w]: 'ok' }, vars: [], note: '读到非零的 ' + a[w] + '：和 write 位置交换，write 前进一格。' + (w === r ? '（write 和 read 在同一格，交换不变。）' : '') });
          w++;
        } else {
          frames.push({ cells: a.slice(), ptrs: { write: w, read: r }, marks: { [r]: 'out' }, vars: [], note: '读到 0：什么都不做，read 继续往前，write 留在原地等下一个非零数。' });
        }
      }
      frames.push({ cells: a.slice(), ptrs: {}, vars: [], note: '读完了：非零数都按原顺序挪到了前面，0 都到了后面。' });
      return frames;
    },

    // 392：j 走 t，碰到 s[i] 就让 i 前进
    subseq(s, t) {
      let i = 0;
      const ok = {};
      const frames = [];
      for (let j = 0; j < t.length; j++) {
        if (i < s.length && t[j] === s[i]) {
          ok[j] = 'ok';
          frames.push({ cells: t.split(''), ptrs: { j }, marks: Object.assign({}, ok), vars: [['s', s], ['i', i + 1]], note: 't[' + j + '] = ' + t[j] + '，正是 s 要找的第 ' + (i + 1) + ' 个字符：匹配上，i 前进。' });
          i++;
        } else {
          frames.push({ cells: t.split(''), ptrs: { j }, marks: Object.assign({}, ok, { [j]: 'out' }), vars: [['s', s], ['i', i]], note: i < s.length ? 't[' + j + '] = ' + t[j] + ' 不是要找的 ' + s[i] + '，跳过。' : 's 已经找全了，后面的随便。' });
        }
      }
      frames.push({ cells: t.split(''), ptrs: {}, marks: ok, vars: [['结果', i === s.length ? 'true' : 'false']], note: i === s.length ? 's 的每个字符都按顺序找到了：是子序列。' : 't 走完了，s 还差 ' + s.slice(i) + '：不是子序列。' });
      return frames;
    },

    // 844：从后往前，跳过被退格删掉的字符，逐个比较留下的字符
    backspace(s, t) {
      const cells = s.split('').concat(['|'], t.split(''));
      const off = s.length + 1;
      let i = s.length - 1;
      let j = t.length - 1;
      const frames = [];
      const skipTo = (str, k, who) => {
        let skip = 0;
        while (k >= 0) {
          if (str[k] === '#') {
            skip++;
            frames.push({ cells, ptrs: { i: who === 'i' ? k : Math.max(i, 0), j: off + (who === 'j' ? k : Math.max(j, 0)) }, marks: { [who === 'i' ? k : off + k]: 'out' }, vars: [['skip', skip]], note: '是 #：前面要删掉一个字符，skip 加一。' });
          } else if (skip > 0) {
            skip--;
            frames.push({ cells, ptrs: { i: who === 'i' ? k : Math.max(i, 0), j: off + (who === 'j' ? k : Math.max(j, 0)) }, marks: { [who === 'i' ? k : off + k]: 'out' }, vars: [['skip', skip]], note: '「' + str[k] + '」被后面的 # 删掉了，跳过，skip 减一。' });
          } else break;
          k--;
        }
        return k;
      };
      for (;;) {
        i = skipTo(s, i, 'i');
        j = skipTo(t, j, 'j');
        if (i < 0 || j < 0) {
          const res = i < 0 && j < 0;
          frames.push({ cells, ptrs: {}, vars: [['结果', String(res)]], note: res ? '两边同时没有字符了，前面每一对都相同：true。' : '一边没字符了，另一边还有：false。' });
          return frames;
        }
        if (s[i] !== t[j]) {
          frames.push({ cells, ptrs: { i, j: off + j }, marks: { [i]: 'hit', [off + j]: 'hit' }, vars: [['结果', 'false']], note: '留下的字符 ' + s[i] + ' ≠ ' + t[j] + '：false。' });
          return frames;
        }
        frames.push({ cells, ptrs: { i, j: off + j }, marks: { [i]: 'ok', [off + j]: 'ok' }, vars: [], note: '两边留下的字符都是 ' + s[i] + '，相同。两个指针都往左走。' });
        i--;
        j--;
      }
    },

    // 75：荷兰国旗，low 左边全是 0，high 右边全是 2
    colors(input) {
      const a = input.slice();
      let low = 0;
      let mid = 0;
      let high = a.length - 1;
      const frames = [{ cells: a.slice(), ptrs: { low, mid, high }, vars: [], note: '约定：low 左边都是 0，high 右边都是 2，low 到 mid 之间都是 1。mid 去看还没分类的数。' }];
      while (mid <= high) {
        const x = a[mid];
        if (x === 0) {
          [a[low], a[mid]] = [a[mid], a[low]];
          frames.push({ cells: a.slice(), ptrs: { low, mid, high }, marks: { [low]: 'ok' }, vars: [], note: '看到 0：和 low 交换，放进左边的 0 区。low、mid 都前进。' });
          low++;
          mid++;
        } else if (x === 1) {
          frames.push({ cells: a.slice(), ptrs: { low, mid, high }, marks: { [mid]: 'in' }, vars: [], note: '看到 1：它本来就该在中间，mid 前进。' });
          mid++;
        } else {
          [a[mid], a[high]] = [a[high], a[mid]];
          frames.push({ cells: a.slice(), ptrs: { low, mid, high }, marks: { [high]: 'ok' }, vars: [], note: '看到 2：和 high 交换，放进右边的 2 区，high 后退。换过来的数还没看过，mid 不动。' });
          high--;
        }
      }
      frames.push({ cells: a.slice(), ptrs: {}, vars: [], note: 'mid 越过了 high，所有数都分好了。' });
      return frames;
    },

    // 287：把 i → nums[i] 看成链表，用快慢指针找环的入口
    floyd(nums) {
      const frames = [];
      let slow = nums[0];
      let fast = nums[nums[0]];
      frames.push({ cells: nums, ptrs: { slow, fast }, vars: [['阶段', '一：找相遇点']], note: '从下标 0 出发：slow 走一步到 ' + slow + '，fast 走两步到 ' + fast + '。「走一步」就是从下标 i 跳到 nums[i]。' });
      while (slow !== fast) {
        slow = nums[slow];
        fast = nums[nums[fast]];
        frames.push({ cells: nums, ptrs: { slow, fast }, vars: [['阶段', '一：找相遇点']], note: slow === fast ? 'slow 和 fast 在下标 ' + slow + ' 相遇：一定有环。' : 'slow 走一步到 ' + slow + '，fast 走两步到 ' + fast + '。' });
      }
      let p = 0;
      frames.push({ cells: nums, ptrs: { p, slow }, vars: [['阶段', '二：找入口']], note: '再派一个指针 p 从起点 0 出发，和 slow 每次都只走一步。' });
      while (p !== slow) {
        p = nums[p];
        slow = nums[slow];
        frames.push({ cells: nums, ptrs: { p, slow }, marks: p === slow ? { [p]: 'hit' } : {}, vars: [['阶段', '二：找入口']], note: p === slow ? '两者在 ' + p + ' 相遇：这就是环的入口，也就是重复的数。' : 'p 走到 ' + p + '，slow 走到 ' + slow + '。' });
      }
      return frames;
    },
  };

  root.TP = { trace, range };
})(typeof window !== 'undefined' ? window : globalThis);
