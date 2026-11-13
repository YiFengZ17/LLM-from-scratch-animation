/*
 * 动态规划 · 子序列与字符串 · 300 最长递增子序列（中等）
 * 子序列不要求连续：dp[i] 以 nums[i] 结尾，要往前看所有比它小的数，O(n²)。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  const NUMS = [10, 9, 2, 5, 3, 7, 101, 18];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-300',
    group: '子序列与字符串',
    label: '300',
    title: '最长递增子序列',
    summary: '子序列可以跳着选：以 nums[i] 结尾时，前一个数可能是前面任何一个比它小的数，都看一遍。',
    problem: { id: 300, level: 'medium', url: leetcode('longest-increasing-subsequence') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `nums`，找到其中最长严格递增子序列的长度。子序列是由数组派生而来的序列，删除（或不删除）数组中的元素而不改变其余元素的顺序。例如，`[3, 6, 2, 7]` 是数组 `[0, 3, 1, 6, 2, 2, 7]` 的子序列。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[10, 9, 2, 5, 3, 7, 101, 18]`', '`4`', '比如 [2, 3, 7, 101]'],
                ['`[0, 1, 0, 3, 2, 3]`', '`4`', '[0, 1, 2, 3]'],
                ['`[7, 7, 7, 7, 7, 7, 7]`', '`1`', '相等不算递增'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 2500`', '`-10^4 <= nums[i] <= 10^4`'] },
          '<a href="' + leetcode('longest-increasing-subsequence') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：前一个数可能在任何地方',
        doc: [
          '这一题和「最长连续递增序列」（674）只差两个字：**不要求连续**。子序列可以跳着选，只要保持原来的先后顺序。',
          '状态照搬 674：**`dp[i]` 是以 `nums[i]` 结尾的最长递增子序列的长度**。转移时盯住 `nums[i]` 前面那个数：674 要求连续，前一个数只能是 `nums[i-1]`；这题可以跳着选，前一个数可以是**前面任何一个比 `nums[i]` 小的数** `nums[j]`。每个这样的 j 都试一遍，接在最长的那个后面：',
          '`dp[i] = max(dp[j] + 1)`，j < i 且 `nums[j] < nums[i]`；一个都没有时 `dp[i] = 1`（自己开头）。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.lis(NUMS) } },
          '答案是整张表里最大的那格。每个 i 都往前看一遍，时间 O(n²)，n 不超过 2500，够用。（还有一种 O(n log n) 的做法，要用到二分查找，留到二分查找模块。）',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和全是 1 的表',
        say: ['函数收数组，返回长度。每个数至少能自己组成长度 1 的子序列，所以表先全填 1。'],
        ops: {
          python: code(
            ['class Solution:\n    def lengthOfLIS(self, nums: list[int]) -> int:', '照例写类和方法。LIS 是「最长递增子序列」的英文缩写。'],
            ['\n        n = len(nums)\n        dp = [1] * n', '每个数自己就是一个长度为 1 的递增子序列，先全填 1。'],
            ['\n        best = 1', '目前最长的长度，至少是 1。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint lengthOfLIS(int* nums, int numsSize) {', '题目给的函数。'],
            ['\n    int dp[2500];\n    int best = 1;', '数组最多 2500 个数，表开 2500 格。目前最长的长度至少是 1。每格的初值放到下面的循环里设。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {', '照例的架子。'],
            ['\n        int n = nums.size();\n        vector<int> dp(n, 1);\n        int best = 1;', '每个数自己就是长度 1，表先全填 1；目前最长至少是 1。']
          ),
          java: code(
            ['class Solution {\n    public int lengthOfLIS(int[] nums) {', '照例的架子。'],
            ['\n        int n = nums.length;\n        int[] dp = new int[n];\n        java.util.Arrays.fill(dp, 1);\n        int best = 1;', '每个数自己就是长度 1，表先全填 1；目前最长至少是 1。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn length_of_lis(nums: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let n = nums.len();\n        let mut dp = vec![1; n];\n        let mut best = 1;', '每个数自己就是长度 1，表先全填 1；目前最长至少是 1。']
          ),
        },
      },
      {
        section: '写代码',
        title: '往前找所有能接上的数',
        say: [
          '对每个 i，把它前面的数挨个看一遍：比 nums[i] 小的 nums[j]，nums[i] 就能接在以它结尾的子序列后面，长度是 dp[j] + 1。所有能接的里面取最长的。',
          { viz: { kind: 'grid', title: '往前看所有更小的数', frames: trace.lis(NUMS) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(n):', '外层：依次算以每个数结尾的最长长度。'],
            ['\n            for j in range(i):', '内层：看 i 前面的每一个数 j = 0 … i - 1，它们的 dp 都已经算好了。'],
            ['\n                if nums[j] < nums[i]:', '严格递增：nums[j] 比 nums[i] 小，nums[i] 才能接在它后面。'],
            ['\n                    dp[i] = max(dp[i], dp[j] + 1)', '接在以 nums[j] 结尾的子序列后面，长度加一。和目前最好的比，留大的。'],
            ['\n            best = max(best, dp[i])', '以 nums[i] 结尾的最长长度定下来了，更新全局最长。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {\n        dp[i] = 1;', '外层：依次算以每个数结尾的最长长度。先设成 1：自己单独一个。'],
            ['\n        for (int j = 0; j < i; j++) {', '内层：看 i 前面的每一个数。'],
            ['\n            if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {\n                dp[i] = dp[j] + 1;\n            }\n        }', '比 nums[i] 小，就能接在它后面；接上以后更长就换成它。'],
            ['\n        if (dp[i] > best) {\n            best = dp[i];\n        }\n    }', '更新全局最长。']
          ),
          cpp: code(
            ['\n        for (int i = 0; i < n; i++) {', '外层：依次算以每个数结尾的最长长度。'],
            ['\n            for (int j = 0; j < i; j++) {', '内层：看 i 前面的每一个数。'],
            ['\n                if (nums[j] < nums[i]) {\n                    dp[i] = max(dp[i], dp[j] + 1);\n                }\n            }', '比 nums[i] 小，就接在它后面试试，留更长的。'],
            ['\n            best = max(best, dp[i]);\n        }', '更新全局最长。']
          ),
          java: code(
            ['\n        for (int i = 0; i < n; i++) {', '外层：依次算以每个数结尾的最长长度。'],
            ['\n            for (int j = 0; j < i; j++) {', '内层：看 i 前面的每一个数。'],
            ['\n                if (nums[j] < nums[i]) {\n                    dp[i] = Math.max(dp[i], dp[j] + 1);\n                }\n            }', '比 nums[i] 小，就接在它后面试试，留更长的。'],
            ['\n            best = Math.max(best, dp[i]);\n        }', '更新全局最长。']
          ),
          rust: code(
            ['\n        for i in 0..n {', '外层：依次算以每个数结尾的最长长度。'],
            ['\n            for j in 0..i {', '内层：看 i 前面的每一个数。'],
            ['\n                if nums[j] < nums[i] {\n                    dp[i] = dp[i].max(dp[j] + 1);\n                }\n            }', '比 nums[i] 小，就接在它后面试试，留更长的。'],
            ['\n            best = best.max(dp[i]);\n        }', '更新全局最长。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是 best',
        say: ['最长的子序列可能在任何位置结束，所以返回一路记下的 best。'],
        ops: {
          python: code(['\n        return best', '所有结尾位置里最长的。']),
          c: code(['\n    return best;\n}', '所有结尾位置里最长的。']),
          cpp: code(['\n        return best;\n    }\n};', '所有结尾位置里最长的。']),
          java: code(['\n        return best;\n    }\n}', '所有结尾位置里最长的。']),
          rust: code(['\n        best\n    }\n}', '所有结尾位置里最长的。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：4、4、1。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[10, 9, 2, 5, 3, 7, 101, 18], [0, 1, 0, 3, 2, 3], [7, 7, 7, 7, 7, 7, 7]]:\n        print(Solution().lengthOfLIS(nums))', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['4', '4', '1'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int a[] = {10, 9, 2, 5, 3, 7, 101, 18}, b[] = {0, 1, 0, 3, 2, 3}, c[] = {7, 7, 7, 7, 7, 7, 7};\n    printf("%d\\n%d\\n%d\\n", lengthOfLIS(a, 8), lengthOfLIS(b, 6), lengthOfLIS(c, 7));\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['4', '4', '1'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<vector<int>> cases = {{10, 9, 2, 5, 3, 7, 101, 18}, {0, 1, 0, 3, 2, 3}, {7, 7, 7, 7, 7, 7, 7}};\n    for (auto& nums : cases) {\n        cout << Solution().lengthOfLIS(nums) << endl;\n    }\n    return 0;\n}', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['4', '4', '1'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        int[][] cases = {{10, 9, 2, 5, 3, 7, 101, 18}, {0, 1, 0, 3, 2, 3}, {7, 7, 7, 7, 7, 7, 7}};\n        for (int[] nums : cases) {\n            System.out.println(new Solution().lengthOfLIS(nums));\n        }\n    }\n}', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['4', '4', '1'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    for nums in [vec![10, 9, 2, 5, 3, 7, 101, 18], vec![0, 1, 0, 3, 2, 3], vec![7, 7, 7, 7, 7, 7, 7]] {\n        println!("{}", Solution::length_of_lis(nums));\n    }\n}', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['4', '4', '1'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '从子数组到子序列，状态不变（以 i 结尾），转移从「只看前一个」变成「看前面所有」，时间也从 O(n) 变成 O(n²)。',
          '下一题有两个字符串。状态要同时说清楚两边各看到哪里，表就变成了二维：行是第一个字符串的前缀，列是第二个的前缀。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
