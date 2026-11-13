/*
 * 动态规划 · 一维递推 · 198 打家劫舍（中等）
 * 第一道要自己想转移的题：盯住最后一间房，偷还是不偷，两种情况取大的。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-198',
    group: '一维递推',
    label: '198',
    title: '打家劫舍',
    summary: '自己想转移：最后一间房偷或不偷，偷就不能碰前一间。dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])。',
    problem: { id: 198, level: 'medium', url: leetcode('house-robber') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，**如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警**。',
          '给定一个代表每个房屋存放金额的非负整数数组，计算你不触动警报装置的情况下，一夜之内能够偷窃到的最高金额。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[1, 2, 3, 1]`', '`4`', '偷第 1 间和第 3 间：1 + 3 = 4'],
                ['`[2, 7, 9, 3, 1]`', '`12`', '偷第 1、3、5 间：2 + 9 + 1 = 12'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 100`', '`0 <= nums[i] <= 400`'] },
          '<a href="' + leetcode('house-robber') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '一个自然的想法是「隔一间偷一间」，但它不一定对：`[2, 1, 1, 9]` 隔一间偷最多是 2 + 1 或 1 + 9，而偷第 1 间和第 4 间能得 11。要考虑的组合太多，挨个试是 2<sup>n</sup> 种。',
          '换成动态规划的问法。**状态**：`dp[i]` 表示只看前 i 间房，最多能偷多少。**转移**：盯住这 i 间里的最后一间（第 i 间，金额是 `nums[i-1]`），只有两种选择：',
          {
            list: [
              '**不偷**第 i 间：那前 i - 1 间随便怎么偷都行，最多是 `dp[i-1]`。',
              '**偷**第 i 间：第 i - 1 间就不能碰了，前 i - 2 间随便偷，最多是 `dp[i-2] + nums[i-1]`。',
            ],
          },
          '两种选择取大的：`dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])`。**初始值**：一间都没有时偷 0，`dp[0] = 0`；只有第 1 间时就偷它，`dp[1] = nums[0]`。答案是 `dp[n]`。',
          { viz: { kind: 'grid', title: '样例 2：[2, 7, 9, 3, 1]', frames: trace.rob([2, 7, 9, 3, 1]) } },
          '表的第 i 格对应「前 i 间」，比房子多一格。这样第 0 格可以表示「一间都没有」，转移里就不用为最前面两间单独写判断。代价是房子的下标要减一：第 i 间的金额是 `nums[i-1]`。',
          '时间 O(n)，额外空间 O(n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收每间房的金额，返回最多能偷多少。和上一题一样，先取出房子的数量 n，后面开表要用。'],
        ops: {
          python: code(
            ['class Solution:', '先写 `Solution` 类。'],
            ['\n    def rob(self, nums: list[int]) -> int:', '题目给的方法：收一个整数列表，返回一个整数。'],
            ['\n        n = len(nums)', '一共 n 间房，表要开 n + 1 格，先取出来。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果，先引进标准输入输出库。'],
            ['\n\nint rob(int* nums, int numsSize) {', '题目给的函数：数组和它的长度分开传进来。'],
            ['\n    int n = numsSize;', '一共 n 间房，起个短名字。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;', '要用到 `vector` 开表、`max` 取大的、`cout` 打印。'],
            ['\n\nclass Solution {\npublic:', '先写 `Solution` 类。'],
            ['\n    int rob(vector<int>& nums) {', '题目给的函数：收一个整数数组的引用，返回一个整数。'],
            ['\n        int n = nums.size();', '一共 n 间房，先取出来。']
          ),
          java: code(
            ['class Solution {', '先写 `Solution` 类。'],
            ['\n    public int rob(int[] nums) {', '题目给的方法：收一个整数数组，返回一个整数。'],
            ['\n        int n = nums.length;', '一共 n 间房，先取出来。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn rob(nums: Vec<i32>) -> i32 {', '题目给的函数：收一个 `Vec<i32>`，返回 `i32`。'],
            ['\n        let n = nums.len();', '一共 n 间房，`len()` 返回 `usize`，可以直接用来开表和做下标。']
          ),
        },
      },
      {
        section: '写代码',
        title: '开表，填好前两格',
        say: ['`dp[i]` 是「前 i 间最多偷多少」，i 从 0 到 n，一共 n + 1 格。第 0 格是一间都没有，偷 0；第 1 格只有第一间房，当然偷它。题目保证至少有一间房，所以 `nums[0]` 一定存在。'],
        ops: {
          python: code(
            ['\n        dp = [0] * (n + 1)', '开 n + 1 格，每格先填 0。dp[0] = 0（一间都没有，偷 0）这一行就顺便填好了。'],
            ['\n        dp[1] = nums[0]', '只有第一间房时，偷它最划算：金额都不是负数，偷总比不偷强。']
          ),
          c: code(
            ['\n    int dp[101];', '房子最多 100 间，表要放下 dp[0] 到 dp[100]，开 101 格。'],
            ['\n    dp[0] = 0;', '一间都没有，偷 0。C 的局部数组不会自动清零，要自己写。'],
            ['\n    dp[1] = nums[0];', '只有第一间房时，偷它最划算。']
          ),
          cpp: code(
            ['\n        vector<int> dp(n + 1);', '开 n + 1 格，每格一开始都是 0，dp[0] = 0 就有了。'],
            ['\n        dp[1] = nums[0];', '只有第一间房时，偷它最划算。']
          ),
          java: code(
            ['\n        int[] dp = new int[n + 1];', '开 n + 1 格，每格一开始都是 0，dp[0] = 0 就有了。'],
            ['\n        dp[1] = nums[0];', '只有第一间房时，偷它最划算。']
          ),
          rust: code(
            ['\n        let mut dp = vec![0; n + 1];', '开 n + 1 格，每格都是 0，dp[0] = 0 就有了。'],
            ['\n        dp[1] = nums[0];', '只有第一间房时，偷它最划算。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第 i 间：偷，还是不偷',
        say: [
          '从第 2 间开始，每一间都面对同一个选择。不偷它，前面的成果原封不动，是 `dp[i-1]`；偷它，前一间就不能偷，只能接在 `dp[i-2]` 后面，再加上这间的钱。两种都算出来，取大的。',
          { viz: { kind: 'grid', title: '偷还是不偷', frames: trace.rob([2, 7, 9, 3, 1]) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(2, n + 1):', '从第 2 间一直考虑到第 n 间，右端写 n + 1。只有一间房时这个范围是空的，循环不跑，答案就是 dp[1]。'],
            ['\n            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])', '不偷第 i 间：`dp[i - 1]`。偷第 i 间：前一间不能偷，所以是 `dp[i - 2]` 加上它的金额。表比房子多一格，第 i 间的金额是 `nums[i - 1]`。`max` 取大的。']
          ),
          c: code(
            ['\n    for (int i = 2; i <= n; i++) {', '从第 2 间一直考虑到第 n 间。只有一间房时循环不跑。'],
            ['\n        int skip = dp[i - 1];', '不偷第 i 间：前 i - 1 间的最好成绩原封不动。'],
            ['\n        int take = dp[i - 2] + nums[i - 1];', '偷第 i 间：前一间不能偷，接在 `dp[i - 2]` 后面，加上它的金额。表比房子多一格，第 i 间的金额是 `nums[i - 1]`。'],
            ['\n        dp[i] = skip > take ? skip : take;\n    }', '两种选择取大的，用条件表达式写。']
          ),
          cpp: code(
            ['\n        for (int i = 2; i <= n; i++) {', '从第 2 间一直考虑到第 n 间。'],
            ['\n            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1]);\n        }', '不偷：`dp[i - 1]`；偷：`dp[i - 2]` 加上第 i 间的金额 `nums[i - 1]`。`max` 取大的。']
          ),
          java: code(
            ['\n        for (int i = 2; i <= n; i++) {', '从第 2 间一直考虑到第 n 间。'],
            ['\n            dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1]);\n        }', '不偷：`dp[i - 1]`；偷：`dp[i - 2]` 加上第 i 间的金额 `nums[i - 1]`。`Math.max` 取大的。']
          ),
          rust: code(
            ['\n        for i in 2..=n {', '从第 2 间一直考虑到第 n 间。'],
            ['\n            dp[i] = dp[i - 1].max(dp[i - 2] + nums[i - 1]);\n        }', '不偷：`dp[i - 1]`；偷：`dp[i - 2]` 加上第 i 间的金额 `nums[i - 1]`。`.max` 取大的。']
          ),
        },
        sayBy: {
          python: [py('max(arg1, arg2)', 'library/functions.html#max', 'Return the largest item in an iterable or the largest of two or more arguments.', '返回可迭代对象里最大的一项，或者两个及以上参数里最大的那个。')],
          java: [javadoc('Math.max(int a, int b)', 'java/lang/Math.html#max(int,int)', 'Returns the greater of two int values.', '返回两个 int 值里较大的那个。')],
          rust: [rustdoc('Ord::max', 'cmp/trait.Ord.html#method.max', 'Compares and returns the maximum of two values.', '比较两个值，返回较大的那个。')],
        },
      },
      {
        section: '写代码',
        title: '答案是最后一格',
        say: ['所有房子都考虑过了。按状态的定义，「前 n 间最多偷多少」就是 `dp[n]`。'],
        ops: {
          python: code(['\n        return dp[n]', '前 n 间，也就是所有房子，最多能偷 `dp[n]`。']),
          c: code(['\n    return dp[n];\n}', '前 n 间，也就是所有房子，最多能偷 `dp[n]`。']),
          cpp: code(['\n        return dp[n];\n    }\n};', '所有房子最多能偷 `dp[n]`。']),
          java: code(['\n        return dp[n];\n    }\n}', '所有房子最多能偷 `dp[n]`。']),
          rust: code(['\n        dp[n]\n    }\n}', '所有房子最多能偷 `dp[n]`，作为最后一个表达式返回。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试一个反例',
        say: ['预期：两个样例分别是 4 和 12。再试思路里那个让「隔一间偷一间」失败的 `[2, 1, 1, 9]`，应该得 11。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().rob([1, 2, 3, 1]))\n    print(Solution().rob([2, 7, 9, 3, 1]))', '题目的两个样例。'],
            ['\n    print(Solution().rob([2, 1, 1, 9]))', '「隔一间偷一间」会出错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['4', '12', '11'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    int a[] = {1, 2, 3, 1};\n    printf("%d\\n", rob(a, 4));\n    int b[] = {2, 7, 9, 3, 1};\n    printf("%d\\n", rob(b, 5));', '题目的两个样例，把数组和长度一起传进去。'],
            ['\n    int c[] = {2, 1, 1, 9};\n    printf("%d\\n", rob(c, 4));\n    return 0;\n}', '「隔一间偷一间」会出错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['4', '12', '11'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    vector<int> a = {1, 2, 3, 1}, b = {2, 7, 9, 3, 1};\n    cout << Solution().rob(a) << endl;\n    cout << Solution().rob(b) << endl;', '题目的两个样例。'],
            ['\n    vector<int> c = {2, 1, 1, 9};\n    cout << Solution().rob(c) << endl;\n    return 0;\n}', '「隔一间偷一间」会出错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['4', '12', '11'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        System.out.println(new Solution().rob(new int[]{1, 2, 3, 1}));\n        System.out.println(new Solution().rob(new int[]{2, 7, 9, 3, 1}));', '题目的两个样例。'],
            ['\n        System.out.println(new Solution().rob(new int[]{2, 1, 1, 9}));\n    }\n}', '「隔一间偷一间」会出错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['4', '12', '11'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::rob(vec![1, 2, 3, 1]));\n    println!("{}", Solution::rob(vec![2, 7, 9, 3, 1]));', '题目的两个样例。'],
            ['\n    println!("{}", Solution::rob(vec![2, 1, 1, 9]));\n}', '「隔一间偷一间」会出错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['4', '12', '11'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '一维递推写完了',
        say: [
          '这道题的转移是自己想出来的：盯住最后一间房，按「偷 / 不偷」分两种情况，各自变成一个更小的问题。时间 O(n)，额外空间 O(n)；转移只看前两格，也可以像泰波那契那样只留两个变量。',
          '一维递推的四道题，状态都是「前 i 个 / 走到第 i 级」，答案在最后一格。下一个子模块「子数组」换一种状态：「以第 i 个数结尾的……」，答案要在整张表里找。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
