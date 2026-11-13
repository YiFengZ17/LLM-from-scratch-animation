/*
 * 滑动窗口 · 209 长度最小的子数组（中等，变长窗口：求最短）
 * 写法约定见 02-p643.js。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { py } = root.LessonKit;

  const NUMS = [2, 3, 1, 2, 4, 3];

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-209',
    label: '209',
    title: '长度最小的子数组',
    summary: '第一道变长窗口：右端扩张，和够了就从左端收缩，边缩边记最短长度。',
    problem: { id: 209, level: 'medium', url: leetcode('minimum-size-subarray-sum') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给一个正整数数组 `nums` 和一个正整数 `target`，找出和大于等于 target 的最短连续子数组，返回它的长度。找不到就返回 0。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`target = 7`, `nums = [2, 3, 1, 2, 4, 3]`', '`2`', '`[4, 3]` 的和是 7，长度 2'],
                ['`target = 4`, `nums = [1, 4, 4]`', '`1`', '`[4]` 自己就够了'],
                ['`target = 11`, `nums = [1, 1, 1, 1, 1, 1, 1, 1]`', '`0`', '全部加起来才 8'],
              ],
            },
          },
          { list: ['`1 <= target <= 10^9`', '`1 <= nums.length <= 10^5`', '`1 <= nums[i] <= 10^4`'] },
          '<a href="' + leetcode('minimum-size-subarray-sum') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '这次窗口的长度不固定。想一想窗口变长、变短时和怎么变：数组里**都是正数**，所以窗口往右多包一个数，和一定变大；左边少一个数，和一定变小。',
          '于是两个端点可以各走各的：右端一格一格往右扩张，把数加进来；一旦和够了 target，这个窗口就是一个候选答案——记下它的长度，再试着从左边去掉一个数，看还够不够。够就继续缩、继续记；不够了就停下，让右端接着扩张。',
          { viz: { kind: 'array', title: '样例 1：target = 7', frames: trace.minLen(7, NUMS) } },
          '`left` 和 `right` 都只往右走、从不回头，各走最多 n 步，时间 O(n)；只用了几个变量，额外空间 O(1)。',
          '为什么能放心停下？因为都是正数：缩到不够了，再缩只会更不够，没必要再看；而且之后右端变大，左端也不需要退回去。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收目标值 `target` 和数组 `nums`，返回最短长度（整数）。注意参数顺序：target 在前。'],
        ops: {
          python: code(['class Solution:\n    def minSubArrayLen(self, target: int, nums: list[int]) -> int:', '照题目的签名写：target 在前，nums 在后，返回整数。']),
          c: code(['#include <stdio.h>\n\nint minSubArrayLen(int target, int* nums, int numsSize) {', '照题目的签名写：target、数组指针、数组长度，返回整数。']),
          cpp: code(['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minSubArrayLen(int target, vector<int>& nums) {', '照题目的签名写：target 在前，nums 在后，返回整数。`algorithm` 里的 `min` 一会儿要用。']),
          java: code(['class Solution {\n    public int minSubArrayLen(int target, int[] nums) {', '照题目的签名写：target 在前，nums 在后，返回整数。']),
          rust: code(['struct Solution;\n\nimpl Solution {\n    pub fn min_sub_array_len(target: i32, nums: Vec<i32>) -> i32 {', '照题目的签名写：target 在前，nums 在后，返回 `i32`。']),
        },
      },
      {
        section: '写代码',
        title: '两个端点，一个和，一个答案',
        say: ['先想清楚要记住哪几样东西：窗口的左端在哪（右端交给循环）；窗口里的和是多少；目前找到的最短长度是多少。'],
        ops: {
          python: code(
            ['\n        left = 0', '窗口的左端，一开始在最左边。右端一会儿由循环来管。'],
            ['\n        window = 0', '窗口里数的和。一开始窗口是空的，和是 0。'],
            ['\n        best = len(nums) + 1', '目前找到的最短长度。一开始还一个都没找到，给它一个不可能的值：比整个数组还长 1。最后看它有没有被改过，就知道找没找到。']
          ),
          c: code(
            ['\n    int left = 0;', '窗口的左端，一开始在最左边。'],
            ['\n    int window = 0;', '窗口里数的和，一开始是 0。'],
            ['\n    int best = numsSize + 1;', '目前找到的最短长度。一开始还没找到，先给一个不可能的值：比整个数组还长 1。']
          ),
          cpp: code(
            ['\n        int left = 0;', '窗口的左端，一开始在最左边。'],
            ['\n        int window = 0;', '窗口里数的和，一开始是 0。'],
            ['\n        int best = (int)nums.size() + 1;', '目前找到的最短长度。一开始还没找到，先给一个不可能的值：比整个数组还长 1。']
          ),
          java: code(
            ['\n        int left = 0;', '窗口的左端，一开始在最左边。'],
            ['\n        int window = 0;', '窗口里数的和，一开始是 0。'],
            ['\n        int best = nums.length + 1;', '目前找到的最短长度。一开始还没找到，先给一个不可能的值：比整个数组还长 1。']
          ),
          rust: code(
            ['\n        let mut left = 0;', '窗口的左端，一开始在最左边。它会往右移，所以是 `mut`。'],
            ['\n        let mut window = 0;', '窗口里数的和，一开始是 0。'],
            ['\n        let mut best = nums.len() + 1;', '目前找到的最短长度。一开始还没找到，先给一个不可能的值：比整个数组还长 1。它是长度，用 `usize`，和下标的类型一样。']
          ),
        },
      },
      {
        section: '写代码',
        title: '右端一格一格扩张',
        say: ['右端从最左边开始，每次往右多包一个数，把它加进和里。这是外层的循环。'],
        ops: {
          python: code(
            ['\n        for right in range(len(nums)):', '右端要走遍整个数组，一个循环：`right` 从 0 到最后一个下标。'],
            ['\n            window += nums[right]', '右端多包进来一个数，把它加进和里。']
          ),
          c: code(
            ['\n    for (int right = 0; right < numsSize; right++) {', '右端要走遍整个数组，一个循环。'],
            ['\n        window += nums[right];', '右端多包进来一个数，把它加进和里。']
          ),
          cpp: code(
            ['\n        for (int right = 0; right < (int)nums.size(); right++) {', '右端要走遍整个数组，一个循环。'],
            ['\n            window += nums[right];', '右端多包进来一个数，把它加进和里。']
          ),
          java: code(
            ['\n        for (int right = 0; right < nums.length; right++) {', '右端要走遍整个数组，一个循环。'],
            ['\n            window += nums[right];', '右端多包进来一个数，把它加进和里。']
          ),
          rust: code(
            ['\n        for right in 0..nums.len() {', '右端要走遍整个数组，一个循环。'],
            ['\n            window += nums[right];', '右端多包进来一个数，把它加进和里。window 的类型这时就定下来了：和 nums 的元素一样是 `i32`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '和够了，就从左端收缩',
        say: [
          '加进一个数后，和可能够 target 了。够了，眼前这个窗口就是一个候选答案，先记下它的长度；再试着从左边去掉一个数，看是不是还够——还够的话，就得到了一个更短的窗口。',
          { viz: { kind: 'array', title: '样例 1：target = 7', frames: trace.minLen(7, NUMS) } },
        ],
        ops: {
          python: code(
            ['\n            while window >= target:', '为什么用 `while` 不用 `if`：去掉一个数之后可能还够，要一直缩到不够为止，每缩一次都可能找到更短的。'],
            ['\n                best = min(best, right - left + 1)', '和够了，先记下这个窗口的长度。窗口从 left 到 right，两头都算，长度是 right - left + 1。`min` 留下短的那个。'],
            ['\n                window -= nums[left]', '再试着把最左边的数去掉：从和里减掉它。'],
            ['\n                left += 1', '左端往右挪一格。回到 while 的条件再检查一次：还够就接着缩。']
          ),
          c: code(
            ['\n        while (window >= target) {', '为什么用 `while` 不用 `if`：去掉一个数之后可能还够，要一直缩到不够为止。'],
            ['\n            if (right - left + 1 < best) {\n                best = right - left + 1;\n            }', '和够了，先记下这个窗口的长度 right - left + 1，比目前的最短还短就换掉。'],
            ['\n            window -= nums[left];', '再试着把最左边的数去掉：从和里减掉它。'],
            ['\n            left++;\n        }\n    }', '左端往右挪一格，回到 while 的条件再检查。']
          ),
          cpp: code(
            ['\n            while (window >= target) {', '为什么用 `while` 不用 `if`：去掉一个数之后可能还够，要一直缩到不够为止。'],
            ['\n                best = min(best, right - left + 1);', '和够了，先记下这个窗口的长度，`min` 留下短的。'],
            ['\n                window -= nums[left];', '再试着把最左边的数去掉。'],
            ['\n                left++;\n            }\n        }', '左端往右挪一格，回到 while 的条件再检查。']
          ),
          java: code(
            ['\n            while (window >= target) {', '为什么用 `while` 不用 `if`：去掉一个数之后可能还够，要一直缩到不够为止。'],
            ['\n                best = Math.min(best, right - left + 1);', '和够了，先记下这个窗口的长度，`Math.min` 留下短的。'],
            ['\n                window -= nums[left];', '再试着把最左边的数去掉。'],
            ['\n                left++;\n            }\n        }', '左端往右挪一格，回到 while 的条件再检查。']
          ),
          rust: code(
            ['\n            while window >= target {', '为什么用 `while` 不用 `if`：去掉一个数之后可能还够，要一直缩到不够为止。'],
            ['\n                best = best.min(right - left + 1);', '和够了，先记下这个窗口的长度，`min` 留下短的。right、left 都是 `usize`，算出的长度也是。'],
            ['\n                window -= nums[left];', '再试着把最左边的数去掉。'],
            ['\n                left += 1;\n            }\n        }', '左端往右挪一格，回到 while 的条件再检查。']
          ),
        },
        sayBy: {
          python: [py('min(arg1, arg2)', 'library/functions.html#min', 'Return the smallest item in an iterable or the smallest of two or more arguments.', '返回可迭代对象里最小的一项，或者两个及以上参数里最小的那个。')],
        },
      },
      {
        section: '写代码',
        title: '没找到就返回 0',
        say: ['右端走到头了。best 如果还是一开始那个「不可能的值」，说明从来没有够过 target，按题目要求返回 0。'],
        ops: {
          python: code(['\n        return best if best <= len(nums) else 0', '`A if 条件 else B` 是 Python 的条件表达式：条件成立取 A，否则取 B。best 被改过就返回它，没改过返回 0。']),
          c: code(['\n    return best <= numsSize ? best : 0;\n}', '`条件 ? A : B`：条件成立取 A，否则取 B。best 被改过就返回它，没改过返回 0。']),
          cpp: code(['\n        return best <= (int)nums.size() ? best : 0;\n    }\n};', 'best 被改过就返回它，没改过返回 0。']),
          java: code(['\n        return best <= nums.length ? best : 0;\n    }\n}', 'best 被改过就返回它，没改过返回 0。']),
          rust: code(['\n        if best > nums.len() { 0 } else { best as i32 }\n    }\n}', 'Rust 的 if 本身就有值，可以直接当返回值。best 没被改过返回 0，否则把 `usize` 转成题目要的 `i32`。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：2、1、0。第三个样例全部加起来都不够，正好检验「没找到返回 0」。'],
        ops: {
          python: code(['\n\n\nif __name__ == "__main__":\n    print(Solution().minSubArrayLen(7, [2, 3, 1, 2, 4, 3]))\n    print(Solution().minSubArrayLen(4, [1, 4, 4]))\n    print(Solution().minSubArrayLen(11, [1, 1, 1, 1, 1, 1, 1, 1]))', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.python, output: ['2', '1', '0'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {2, 3, 1, 2, 4, 3}, b[] = {1, 4, 4}, c[] = {1, 1, 1, 1, 1, 1, 1, 1};\n    printf("%d\\n", minSubArrayLen(7, a, 6));\n    printf("%d\\n", minSubArrayLen(4, b, 3));\n    printf("%d\\n", minSubArrayLen(11, c, 8));\n    return 0;\n}', '用三个样例调用，`%d` 按整数打印。']).concat([{ pause: 500 }, { run: RUN.c, output: ['2', '1', '0'] }]),
          cpp: code(['\n\nint main() {\n    vector<int> a = {2, 3, 1, 2, 4, 3}, b = {1, 4, 4}, c = {1, 1, 1, 1, 1, 1, 1, 1};\n    cout << Solution().minSubArrayLen(7, a) << endl;\n    cout << Solution().minSubArrayLen(4, b) << endl;\n    cout << Solution().minSubArrayLen(11, c) << endl;\n    return 0;\n}', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['2', '1', '0'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().minSubArrayLen(7, new int[]{2, 3, 1, 2, 4, 3}));\n        System.out.println(new Solution().minSubArrayLen(4, new int[]{1, 4, 4}));\n        System.out.println(new Solution().minSubArrayLen(11, new int[]{1, 1, 1, 1, 1, 1, 1, 1}));\n    }\n}', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.java, output: ['2', '1', '0'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::min_sub_array_len(7, vec![2, 3, 1, 2, 4, 3]));\n    println!("{}", Solution::min_sub_array_len(4, vec![1, 4, 4]));\n    println!("{}", Solution::min_sub_array_len(11, vec![1, 1, 1, 1, 1, 1, 1, 1]));\n}', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['2', '1', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '变长窗口求最短的写法：外层 for 让右端扩张，里层 while 在「满足条件」时收缩，收缩前记答案。左右端点都只往右走，时间 O(n)，额外空间 O(1)。',
          '下一题反过来求**最长**：窗口出问题（有重复字符）时才收缩，收缩完再记答案。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
