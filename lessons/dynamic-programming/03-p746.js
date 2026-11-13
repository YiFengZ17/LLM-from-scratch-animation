/*
 * 动态规划 · 一维递推 · 746 使用最小花费爬楼梯（简单）
 * 和爬楼梯同一个形状，只是「种数相加」换成「花费取最小」。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-746',
    group: '一维递推',
    label: '746',
    title: '使用最小花费爬楼梯',
    summary: '同一个形状换一种问法：两条路各算一个花费，取小的。注意楼顶在最后一级台阶的上面。',
    problem: { id: 746, level: 'easy', url: leetcode('min-cost-climbing-stairs') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `cost`，其中 `cost[i]` 是从楼梯第 i 个台阶向上爬需要支付的费用。一旦支付此费用，即可选择向上爬一个或者两个台阶。',
          '你可以选择从下标为 0 或下标为 1 的台阶开始爬楼梯。请你计算并返回达到楼梯顶部的最低花费。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`cost = [10, 15, 20]`', '`15`', '从下标 1 出发，付 15，跨 2 级到楼顶'],
                ['`cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]`', '`6`', '一路踩着花费为 1 的台阶走'],
              ],
            },
          },
          { list: ['`2 <= cost.length <= 1000`', '`0 <= cost[i] <= 999`'] },
          '<a href="' + leetcode('min-cost-climbing-stairs') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '先弄清楚「楼顶」在哪：台阶下标是 0 到 n - 1，楼顶在最后一级的**上面**，可以把它看成下标 n。所以要算的是「走到第 n 级」的最小花费。',
          '还是盯住最后一步：走到第 i 级，要么从第 i - 1 级跨上来，付 `cost[i-1]`；要么从第 i - 2 级跨上来，付 `cost[i-2]`。哪条路便宜走哪条。',
          {
            table: {
              head: ['', '最小花费爬楼梯'],
              rows: [
                ['状态', '`dp[i]`：走到第 i 级（还没付这一级的钱）最少花多少'],
                ['转移', '`dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])`'],
                ['初始值', '可以直接站在第 0 级或第 1 级：`dp[0] = dp[1] = 0`'],
                ['顺序与答案', 'i 从 2 填到 n，答案是 `dp[n]`'],
              ],
            },
          },
          '和爬楼梯比，只换了两处：初始值从 1 变成 0（站上去不花钱），转移从「相加」变成「取最小」。数种数用加法，求最优用 min 或 max，这是动态规划里最常见的两种转移。',
          { viz: { kind: 'grid', title: '样例 1：cost = [10, 15, 20]', frames: trace.minCost([10, 15, 20]) } },
          '时间 O(n)，额外空间 O(n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一个花费数组，返回最小花费。写表之前要知道表有多长，所以一进来先取出台阶数 n。'],
        ops: {
          python: code(
            ['class Solution:', '和上一题一样，先写 `Solution` 类。'],
            ['\n    def minCostClimbingStairs(self, cost: list[int]) -> int:', '题目给的方法：收一个整数列表 `cost`，返回一个整数。'],
            ['\n        n = len(cost)', '一共 n 级台阶，楼顶是第 n 级。后面开表、定循环范围都要用到它，先取出来。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果，先引进标准输入输出库。'],
            ['\n\nint minCostClimbingStairs(int* cost, int costSize) {', '题目给的函数：C 的数组不记得自己的长度，所以台阶数 `costSize` 单独传进来。'],
            ['\n    int n = costSize;', '一共 n 级台阶，楼顶是第 n 级。起个短一点的名字，后面写起来清楚。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>', '这次要取两个数里小的那个，`min` 在 `algorithm` 里，一起引进来。'],
            ['\nusing namespace std;\n\nclass Solution {\npublic:', '和上一题一样：省掉 `std::` 前缀，再写 `Solution` 类。'],
            ['\n    int minCostClimbingStairs(vector<int>& cost) {', '题目给的函数：收一个整数数组的引用，返回一个整数。'],
            ['\n        int n = cost.size();', '一共 n 级台阶，楼顶是第 n 级，先取出来。']
          ),
          java: code(
            ['class Solution {', '先写 `Solution` 类。'],
            ['\n    public int minCostClimbingStairs(int[] cost) {', '题目给的方法：收一个整数数组，返回一个整数。'],
            ['\n        int n = cost.length;', '一共 n 级台阶，楼顶是第 n 级，先取出来。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '和上一题一样：先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn min_cost_climbing_stairs(cost: Vec<i32>) -> i32 {', '题目给的函数：收一个 `Vec<i32>`，返回 `i32`。'],
            ['\n        let n = cost.len();', '一共 n 级台阶，楼顶是第 n 级。`len()` 返回的正好是 `usize`，可以直接拿来做下标。']
          ),
        },
      },
      {
        section: '写代码',
        title: '开表：两个起点都不花钱',
        say: ['楼顶是第 n 级，表要能放下 dp[0] 到 dp[n]，一共 n + 1 格——比台阶数多一格，多出来的就是楼顶。题目说可以从第 0 级或第 1 级出发，站上去还没付钱，所以这两格都是 0。'],
        ops: {
          python: code(['\n        dp = [0] * (n + 1)', '开 n + 1 格，最后一格代表楼顶。每格先填 0。dp[0] 和 dp[1] 本来就该是 0（站上去不花钱），这一行顺便把它们也填好了。']),
          c: code(
            ['\n    int dp[1001];', '台阶最多 1000 级，表要放下 dp[0] 到 dp[1000]，开 1001 格。'],
            ['\n    dp[0] = 0;\n    dp[1] = 0;', '两个起点都不花钱。C 的局部数组不会自动清零，起点必须自己写。']
          ),
          cpp: code(['\n        vector<int> dp(n + 1);', '开 n + 1 格，最后一格代表楼顶。int 元素一开始都是 0，正好就是两个起点的值。']),
          java: code(['\n        int[] dp = new int[n + 1];', '开 n + 1 格，最后一格代表楼顶。新建的 int 数组每格都是 0，正好就是两个起点的值。']),
          rust: code(['\n        let mut dp = vec![0; n + 1];', '开 n + 1 格，最后一格代表楼顶。每格都是 0，正好就是两个起点的值。']),
        },
      },
      {
        section: '写代码',
        title: '两条路，取便宜的那条',
        say: [
          '从第 2 格填到楼顶。每一格都问同一个问题：从下面一级上来便宜，还是从下面两级上来便宜？两条路的花费都是「走到出发那级的最小花费 + 出发那级的过路费」。',
          { viz: { kind: 'grid', title: '样例 2', frames: trace.minCost([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(2, n + 1):', '要一直填到楼顶那一格，也就是第 n 格，所以右端写 n + 1。'],
            ['\n            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])', '两条路：从 i - 1 跨上来，要先走到 i - 1（`dp[i - 1]`），再付这一级的过路费 `cost[i - 1]`；从 i - 2 跨上来同理。`min` 取便宜的那条。']
          ),
          c: code(
            ['\n    for (int i = 2; i <= n; i++) {', '要一直填到楼顶那一格，所以 `i <= n` 带等号。'],
            ['\n        int one = dp[i - 1] + cost[i - 1];', '第一条路：先走到 i - 1，再付那一级的过路费，跨 1 级上来。'],
            ['\n        int two = dp[i - 2] + cost[i - 2];', '第二条路：先走到 i - 2，再付那一级的过路费，跨 2 级上来。'],
            ['\n        dp[i] = one < two ? one : two;\n    }', '取便宜的那条。C 标准库没有比较两个 int 的 min，用条件表达式：`条件 ? 甲 : 乙`，条件成立取甲，否则取乙。']
          ),
          cpp: code(
            ['\n        for (int i = 2; i <= n; i++) {', '要一直填到楼顶那一格，所以 `i <= n` 带等号。'],
            ['\n            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);\n        }', '两条路：先走到 i - 1 再付 `cost[i - 1]`，或者先走到 i - 2 再付 `cost[i - 2]`。`min` 取便宜的那条。']
          ),
          java: code(
            ['\n        for (int i = 2; i <= n; i++) {', '要一直填到楼顶那一格，所以 `i <= n` 带等号。'],
            ['\n            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);\n        }', '两条路：先走到 i - 1 再付 `cost[i - 1]`，或者先走到 i - 2 再付 `cost[i - 2]`。`Math.min` 取便宜的那条。']
          ),
          rust: code(
            ['\n        for i in 2..=n {', '要一直填到楼顶那一格，用包含 n 的范围 `2..=n`。'],
            ['\n            dp[i] = (dp[i - 1] + cost[i - 1]).min(dp[i - 2] + cost[i - 2]);\n        }', '两条路：先走到 i - 1 再付 `cost[i - 1]`，或者先走到 i - 2 再付 `cost[i - 2]`。`甲.min(乙)` 取便宜的那条。']
          ),
        },
        sayBy: {
          python: [py('min(arg1, arg2)', 'library/functions.html#min', 'Return the smallest item in an iterable or the smallest of two or more arguments.', '返回可迭代对象里最小的一项，或者两个及以上参数里最小的那个。')],
          java: [javadoc('Math.min(int a, int b)', 'java/lang/Math.html#min(int,int)', 'Returns the smaller of two int values.', '返回两个 int 值里较小的那个。')],
          rust: [rustdoc('Ord::min', 'cmp/trait.Ord.html#method.min', 'Compares and returns the minimum of two values.', '比较两个值，返回较小的那个。')],
        },
      },
      {
        section: '写代码',
        title: '答案是楼顶那一格',
        say: ['楼顶就是第 n 格，它里面存的就是走到楼顶的最小花费。'],
        ops: {
          python: code(['\n        return dp[n]', '`dp[n]` 是走到楼顶的最小花费。注意不是 `dp[n - 1]`：那只是最后一级台阶，还没到顶。']),
          c: code(['\n    return dp[n];\n}', '`dp[n]` 是走到楼顶的最小花费。注意不是 `dp[n - 1]`：那只是最后一级台阶。']),
          cpp: code(['\n        return dp[n];\n    }\n};', '`dp[n]` 是走到楼顶的最小花费，不是 `dp[n - 1]`。']),
          java: code(['\n        return dp[n];\n    }\n}', '`dp[n]` 是走到楼顶的最小花费，不是 `dp[n - 1]`。']),
          rust: code(['\n        dp[n]\n    }\n}', '`dp[n]` 是走到楼顶的最小花费，不是 `dp[n - 1]`。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：第一个样例 15，第二个样例 6。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().minCostClimbingStairs([10, 15, 20]))', '第一个样例，预期 15。'],
            ['\n    print(Solution().minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]))', '第二个样例，预期 6。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['15', '6'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    int a[] = {10, 15, 20};\n    printf("%d\\n", minCostClimbingStairs(a, 3));', '先准备第一个样例，把数组和它的长度 3 一起传进去。'],
            ['\n    int b[] = {1, 100, 1, 1, 1, 100, 1, 1, 100, 1};\n    printf("%d\\n", minCostClimbingStairs(b, 10));', '第二个样例有 10 个数。'],
            ['\n    return 0;\n}', '`main` 返回 0，程序正常结束。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['15', '6'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    vector<int> a = {10, 15, 20};\n    cout << Solution().minCostClimbingStairs(a) << endl;', '第一个样例，预期 15。'],
            ['\n    vector<int> b = {1, 100, 1, 1, 1, 100, 1, 1, 100, 1};\n    cout << Solution().minCostClimbingStairs(b) << endl;', '第二个样例，预期 6。'],
            ['\n    return 0;\n}', '`main` 返回 0，程序正常结束。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['15', '6'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        System.out.println(new Solution().minCostClimbingStairs(new int[]{10, 15, 20}));', '第一个样例，预期 15。'],
            ['\n        System.out.println(new Solution().minCostClimbingStairs(new int[]{1, 100, 1, 1, 1, 100, 1, 1, 100, 1}));\n    }\n}', '第二个样例，预期 6。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['15', '6'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::min_cost_climbing_stairs(vec![10, 15, 20]));', '第一个样例，预期 15。'],
            ['\n    println!("{}", Solution::min_cost_climbing_stairs(vec![1, 100, 1, 1, 1, 100, 1, 1, 100, 1]));\n}', '第二个样例，预期 6。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['15', '6'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '和爬楼梯相比，只改了初始值和转移里的运算：数种数用加法，求最小花费用 min。两道题的时间和空间都是 O(n)。',
          '这两道题的转移都只看前两格。下一题泰波那契要看前三格，我们顺便把「只留最后几格」的写法用上，把额外空间降到 O(1)。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
