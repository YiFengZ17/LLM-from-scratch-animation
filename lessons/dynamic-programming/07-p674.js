/*
 * 动态规划 · 子数组 · 674 最长连续递增序列（简单）
 * 和 53 同一个状态：以 nums[i] 结尾的最长连续递增长度。能接上加一，接不上从 1 重新数。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-674',
    group: '子数组',
    label: '674',
    title: '最长连续递增序列',
    summary: '以 nums[i] 结尾的连续递增长度：比前一个大就接上加一，否则从 1 重新数。',
    problem: { id: 674, level: 'easy', url: leetcode('longest-continuous-increasing-subsequence') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个未经排序的整数数组，找到最长且**连续递增的子序列**，并返回该序列的长度。连续递增要求每个数都**严格大于**它前面的数。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[1, 3, 5, 4, 7]`', '`3`', '`[1, 3, 5]`；`[1, 3, 5, 7]` 不连续，4 把它隔开了'],
                ['`[2, 2, 2, 2, 2]`', '`1`', '相等不算递增'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 10^4`', '`-10^9 <= nums[i] <= 10^9`'] },
          '<a href="' + leetcode('longest-continuous-increasing-subsequence') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '这里的「子序列」要求连续，其实就是子数组。照上一题的办法，状态定成：**`dp[i]` 是以 `nums[i]` 结尾的最长连续递增段的长度**。',
          '盯住最后一个数 `nums[i]`：它能不能接在以 `nums[i-1]` 结尾的那段后面，只看它和前一个数：',
          {
            list: [
              '`nums[i] > nums[i-1]`：接得上，`dp[i] = dp[i-1] + 1`。',
              '否则：断了，`nums[i]` 只能自己开一段，`dp[i] = 1`。',
            ],
          },
          '初始值 `dp[0] = 1`，答案是整张表里最大的那格。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.lcis([1, 3, 5, 4, 7]) } },
          '`dp[i]` 只用到 `dp[i-1]`，所以和上一题一样，用一个变量 `cur` 加一个 `best` 就够。时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一个整数数组，返回最长连续递增段的长度。'],
        ops: {
          python: code(
            ['class Solution:', '先写 `Solution` 类。'],
            ['\n    def findLengthOfLCIS(self, nums: list[int]) -> int:', '题目给的方法名是 `findLengthOfLCIS`，LCIS 是「最长连续递增子序列」的英文缩写。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果，先引进标准输入输出库。'],
            ['\n\nint findLengthOfLCIS(int* nums, int numsSize) {', '题目给的函数，LCIS 是「最长连续递增子序列」的英文缩写。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;', '要用到 `vector`、`max` 和 `cout`。'],
            ['\n\nclass Solution {\npublic:', '先写 `Solution` 类。'],
            ['\n    int findLengthOfLCIS(vector<int>& nums) {', '题目给的函数，LCIS 是「最长连续递增子序列」的英文缩写。']
          ),
          java: code(
            ['class Solution {', '先写 `Solution` 类。'],
            ['\n    public int findLengthOfLCIS(int[] nums) {', '题目给的方法，LCIS 是「最长连续递增子序列」的英文缩写。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn find_length_of_lcis(nums: Vec<i32>) -> i32 {', '题目给的函数：收一个 `Vec<i32>`，返回长度 `i32`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第一个数，长度是 1',
        say: ['只看第一个数时，以它结尾的递增段就是它自己，长度 1。`cur` 记以当前数结尾的长度，`best` 记见过的最长，一开始都是 1。'],
        ops: {
          python: code(['\n        cur = best = 1', '以第一个数结尾的段长度是 1，目前最长的也是 1。Python 可以用连等号一次给两个变量同一个值。']),
          c: code(['\n    int cur = 1, best = 1;', '以第一个数结尾的段长度是 1，目前最长的也是 1。']),
          cpp: code(['\n        int cur = 1, best = 1;', '以第一个数结尾的段长度是 1，目前最长的也是 1。']),
          java: code(['\n        int cur = 1, best = 1;', '以第一个数结尾的段长度是 1，目前最长的也是 1。']),
          rust: code(['\n        let (mut cur, mut best) = (1, 1);', '以第一个数结尾的段长度是 1，目前最长的也是 1。两个都要改，都加 `mut`。']),
        },
      },
      {
        section: '写代码',
        title: '接得上就加一，接不上从 1 数',
        say: [
          '从第二个数开始，每个数只问一件事：比前一个数大吗？大就接在后面，段长加一；不大就断了，从自己重新数起。每次更新完 `cur`，跟 `best` 比一比。',
          { viz: { kind: 'grid', title: '能不能接上', frames: trace.lcis([1, 3, 5, 4, 7]) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, len(nums)):', '每个数都要和它前一个数比，所以从第 1 个数开始，第 0 个前面没有数。'],
            ['\n            if nums[i] > nums[i - 1]:\n                cur += 1', '比前一个数大，能接在以前一个数结尾的那段后面，长度加一。'],
            ['\n            else:\n                cur = 1', '不比前一个数大（相等也不行，题目要严格递增），段断了，从自己重新数，长度回到 1。'],
            ['\n            best = max(best, cur)', '最长的那段可能在任何位置结束，每次都要比一比。']
          ),
          c: code(
            ['\n    for (int i = 1; i < numsSize; i++) {', '每个数都要和它前一个数比，所以从第 1 个数开始。'],
            ['\n        if (nums[i] > nums[i - 1]) {\n            cur++;', '比前一个数大，能接上，长度加一。'],
            ['\n        } else {\n            cur = 1;\n        }', '不比前一个数大（相等也不行），段断了，从 1 重新数。'],
            ['\n        if (cur > best) {\n            best = cur;\n        }\n    }', '最长的那段可能在任何位置结束，每次都要比一比。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)nums.size(); i++) {', '每个数都要和它前一个数比，所以从第 1 个数开始。'],
            ['\n            if (nums[i] > nums[i - 1]) {\n                cur++;', '比前一个数大，能接上，长度加一。'],
            ['\n            } else {\n                cur = 1;\n            }', '不比前一个数大（相等也不行），段断了，从 1 重新数。'],
            ['\n            best = max(best, cur);\n        }', '最长的那段可能在任何位置结束，每次都要比一比。']
          ),
          java: code(
            ['\n        for (int i = 1; i < nums.length; i++) {', '每个数都要和它前一个数比，所以从第 1 个数开始。'],
            ['\n            if (nums[i] > nums[i - 1]) {\n                cur++;', '比前一个数大，能接上，长度加一。'],
            ['\n            } else {\n                cur = 1;\n            }', '不比前一个数大（相等也不行），段断了，从 1 重新数。'],
            ['\n            best = Math.max(best, cur);\n        }', '最长的那段可能在任何位置结束，每次都要比一比。']
          ),
          rust: code(
            ['\n        for i in 1..nums.len() {', '每个数都要和它前一个数比，所以从第 1 个数开始。'],
            ['\n            if nums[i] > nums[i - 1] {\n                cur += 1;', '比前一个数大，能接上，长度加一。Rust 没有 `++`，写 `+= 1`。'],
            ['\n            } else {\n                cur = 1;\n            }', '不比前一个数大（相等也不行），段断了，从 1 重新数。'],
            ['\n            best = best.max(cur);\n        }', '最长的那段可能在任何位置结束，每次都要比一比。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是 best',
        say: ['每个结尾位置都看过了，`best` 就是最长的那段。'],
        ops: {
          python: code(['\n        return best', '返回 best：最长的那段不一定在数组末尾结束。']),
          c: code(['\n    return best;\n}', '返回 best：最长的那段不一定在数组末尾结束。']),
          cpp: code(['\n        return best;\n    }\n};', '返回 best：最长的那段不一定在数组末尾结束。']),
          java: code(['\n        return best;\n    }\n}', '返回 best：最长的那段不一定在数组末尾结束。']),
          rust: code(['\n        best\n    }\n}', '返回 best：最长的那段不一定在数组末尾结束。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：3 和 1。再加一个最长段在开头、后面越来越短的 `[1, 2, 3, 4, 1, 2]`，检验返回的是 best 而不是 cur：应该得 4。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().findLengthOfLCIS([1, 3, 5, 4, 7]))\n    print(Solution().findLengthOfLCIS([2, 2, 2, 2, 2]))', '题目的两个样例。'],
            ['\n    print(Solution().findLengthOfLCIS([1, 2, 3, 4, 1, 2]))', '最长段在开头的情况。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '1', '4'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    int a[] = {1, 3, 5, 4, 7};\n    printf("%d\\n", findLengthOfLCIS(a, 5));\n    int b[] = {2, 2, 2, 2, 2};\n    printf("%d\\n", findLengthOfLCIS(b, 5));', '题目的两个样例。'],
            ['\n    int c[] = {1, 2, 3, 4, 1, 2};\n    printf("%d\\n", findLengthOfLCIS(c, 6));\n    return 0;\n}', '最长段在开头的情况。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '1', '4'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    vector<int> a = {1, 3, 5, 4, 7}, b = {2, 2, 2, 2, 2};\n    cout << Solution().findLengthOfLCIS(a) << endl;\n    cout << Solution().findLengthOfLCIS(b) << endl;', '题目的两个样例。'],
            ['\n    vector<int> c = {1, 2, 3, 4, 1, 2};\n    cout << Solution().findLengthOfLCIS(c) << endl;\n    return 0;\n}', '最长段在开头的情况。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '1', '4'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        Solution s = new Solution();\n        System.out.println(s.findLengthOfLCIS(new int[]{1, 3, 5, 4, 7}));\n        System.out.println(s.findLengthOfLCIS(new int[]{2, 2, 2, 2, 2}));', '建一个对象重复用，跑题目的两个样例。'],
            ['\n        System.out.println(s.findLengthOfLCIS(new int[]{1, 2, 3, 4, 1, 2}));\n    }\n}', '最长段在开头的情况。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '1', '4'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::find_length_of_lcis(vec![1, 3, 5, 4, 7]));\n    println!("{}", Solution::find_length_of_lcis(vec![2, 2, 2, 2, 2]));', '题目的两个样例。'],
            ['\n    println!("{}", Solution::find_length_of_lcis(vec![1, 2, 3, 4, 1, 2]));\n}', '最长段在开头的情况。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '1', '4'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '还是「以第 i 个数结尾」的状态，转移只看它和前一个数的关系。时间 O(n)，额外空间 O(1)。',
          '下一题「乘积最大子数组」看起来和 53 题只差一个字，却多了一个麻烦：负数乘负数会变成正数，只记最大值不够了。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
