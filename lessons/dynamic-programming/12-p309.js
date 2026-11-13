/*
 * 动态规划 · 股票 · 309 买卖股票的最佳时机含冷冻期（中等）
 * 卖出后第二天不能买：「不持有」拆成「刚卖出」和「空闲」，一共三个状态。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  const PRICES = [1, 2, 3, 0, 2];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-309',
    group: '股票',
    label: '309',
    title: '买卖股票的最佳时机含冷冻期',
    summary: '卖出后冷冻一天：把「不持有」拆成「刚卖出」和「空闲」，三个状态互相转移。',
    problem: { id: 309, level: 'medium', url: leetcode('best-time-to-buy-and-sell-stock-with-cooldown') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个整数数组 `prices`，其中第 `prices[i]` 表示第 i 天的股票价格。设计一个算法计算出最大利润。在满足以下约束条件下，你可以尽可能地完成更多的交易（多次买卖一支股票）：卖出股票后，你无法在第二天买入股票（即冷冻期为 1 天）。你不能同时参与多笔交易（你必须在再次购买前出售掉之前的股票）。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[1, 2, 3, 0, 2]`', '`3`', '买、卖、冷冻、买、卖：(3 - 1) + (2 - 0) = 3'],
                ['`[1]`', '`0`', ''],
              ],
            },
          },
          { list: ['`1 <= prices.length <= 5000`', '`0 <= prices[i] <= 1000`'] },
          '<a href="' + leetcode('best-time-to-buy-and-sell-stock-with-cooldown') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：两个状态不够了',
        doc: [
          '先试着照搬 122 题：持有时可以「用 free 今天买入」。可冷冻期说，**昨天刚卖出的话今天不能买**。只看 free 这一个数，分不出它是「昨天刚卖」还是「早就空仓了」——状态里缺了信息。',
          '跟 152 题一样，缺什么就把它加进状态里：把「不持有」拆成两种。现在每天有三个状态：',
          {
            table: {
              head: ['状态', '含义', '今天怎么来'],
              rows: [
                ['持有 `hold`', '手里有股票', '昨天就持有；或者昨天空闲、今天买入：`max(hold, rest - price)`'],
                ['刚卖出 `sold`', '今天刚卖掉，明天冷冻', '只能是昨天持有、今天卖出：`hold + price`'],
                ['空闲 `rest`', '手里没股票，明天可以买', '昨天就空闲；或者昨天刚卖、今天冷冻：`max(rest, sold)`'],
              ],
            },
          },
          '买入只能从「空闲」来，冷冻期就自动满足了：刚卖出的那天要先变成空闲，才能再买。第 0 天：`hold = -prices[0]`，`sold = 0`，`rest = 0`（第 0 天不可能卖出，记 0 不会让结果变大）。答案是最后一天 `sold` 和 `rest` 里大的那个。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.stock(PRICES, 'cool') } },
          '三个新值都要用昨天的旧值算，所以还是先算好、再一起换上。时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子和第 0 天的三个状态',
        say: ['函数的样子和 122 题一样。第 0 天三个状态：买入是 `-prices[0]`，另外两个都是 0。'],
        ops: {
          python: code(
            ['class Solution:\n    def maxProfit(self, prices: list[int]) -> int:', '照例写类和方法：收价格列表，返回最大利润。'],
            ['\n        hold, sold, rest = -prices[0], 0, 0', '第 0 天：买入的话是 `-prices[0]`；第 0 天不可能真的卖出，sold 记 0 不会让结果变大；空闲是 0。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint maxProfit(int* prices, int pricesSize) {', '照例的函数签名。'],
            ['\n    int hold = -prices[0], sold = 0, rest = 0;', '第 0 天：买入是 `-prices[0]`；sold 记 0 不会让结果变大；空闲是 0。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {', '照例的架子。'],
            ['\n        int hold = -prices[0], sold = 0, rest = 0;', '第 0 天：买入是 `-prices[0]`；sold 记 0 不会让结果变大；空闲是 0。']
          ),
          java: code(
            ['class Solution {\n    public int maxProfit(int[] prices) {', '照例的架子。'],
            ['\n        int hold = -prices[0], sold = 0, rest = 0;', '第 0 天：买入是 `-prices[0]`；sold 记 0 不会让结果变大；空闲是 0。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn max_profit(prices: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let (mut hold, mut sold, mut rest) = (-prices[0], 0, 0);', '第 0 天：买入是 `-prices[0]`；sold 记 0 不会让结果变大；空闲是 0。']
          ),
        },
      },
      {
        section: '写代码',
        title: '三个状态一起往后推',
        say: [
          '每天按表里的三条转移各算一个新值，全都用昨天的旧值。重点是持有那一条：买入只能从「空闲」来，不能从「刚卖出」来。',
          { viz: { kind: 'grid', title: '三个状态', frames: trace.stock(PRICES, 'cool') } },
        ],
        ops: {
          python: code(
            ['\n        for p in prices[1:]:', '从第 1 天起逐天往后推。'],
            ['\n            hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)', '三个新值先用旧值一起算好，再同时赋值。持有：继续拿着，或者从空闲买入（冷冻期由此保证）；刚卖出：昨天持有、今天卖；空闲：昨天就空闲，或者昨天刚卖、今天冷冻。']
          ),
          c: code(
            ['\n    for (int i = 1; i < pricesSize; i++) {', '从第 1 天起逐天往后推。'],
            ['\n        int newHold = hold > rest - prices[i] ? hold : rest - prices[i];', '持有：继续拿着，或者从空闲买入。只能从空闲买，冷冻期就满足了。'],
            ['\n        int newSold = hold + prices[i];', '刚卖出：只有一种来路，昨天持有、今天卖掉。'],
            ['\n        int newRest = rest > sold ? rest : sold;', '空闲：昨天就空闲，或者昨天刚卖、今天是冷冻期。'],
            ['\n        hold = newHold;\n        sold = newSold;\n        rest = newRest;\n    }', '三个新值都是用旧值算的，现在一起换上。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)prices.size(); i++) {', '从第 1 天起逐天往后推。'],
            ['\n            int newHold = max(hold, rest - prices[i]);', '持有：继续拿着，或者从空闲买入。'],
            ['\n            int newSold = hold + prices[i];', '刚卖出：昨天持有、今天卖掉。'],
            ['\n            int newRest = max(rest, sold);', '空闲：昨天就空闲，或者昨天刚卖、今天冷冻。'],
            ['\n            hold = newHold;\n            sold = newSold;\n            rest = newRest;\n        }', '三个新值一起换上。']
          ),
          java: code(
            ['\n        for (int i = 1; i < prices.length; i++) {', '从第 1 天起逐天往后推。'],
            ['\n            int newHold = Math.max(hold, rest - prices[i]);', '持有：继续拿着，或者从空闲买入。'],
            ['\n            int newSold = hold + prices[i];', '刚卖出：昨天持有、今天卖掉。'],
            ['\n            int newRest = Math.max(rest, sold);', '空闲：昨天就空闲，或者昨天刚卖、今天冷冻。'],
            ['\n            hold = newHold;\n            sold = newSold;\n            rest = newRest;\n        }', '三个新值一起换上。']
          ),
          rust: code(
            ['\n        for &p in &prices[1..] {', '从第 1 天起逐天往后推。'],
            ['\n            (hold, sold, rest) = (hold.max(rest - p), hold + p, rest.max(sold));\n        }', '三个新值先用旧值算好，再整体赋值。持有从空闲买入；刚卖出来自昨天持有；空闲来自昨天空闲或昨天刚卖。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案：刚卖出或空闲',
        say: ['最后一天结束时手里不该有股票，可能刚卖出，也可能早就空闲了，两者取大的。'],
        ops: {
          python: code(['\n        return max(sold, rest)', '不持有的两种情况取大的。']),
          c: code(['\n    return sold > rest ? sold : rest;\n}', '不持有的两种情况取大的。']),
          cpp: code(['\n        return max(sold, rest);\n    }\n};', '不持有的两种情况取大的。']),
          java: code(['\n        return Math.max(sold, rest);\n    }\n}', '不持有的两种情况取大的。']),
          rust: code(['\n        sold.max(rest)\n    }\n}', '不持有的两种情况取大的。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再和不冷冻比一比',
        say: ['预期：3 和 0。再试 `[1, 2, 4]`：不冷冻时可以 1 买 2 卖、2 买 4 卖，也就是一路拿着，同样得 3；这里应该也是 3。另一个 `[1, 4, 2, 5]`：不冷冻能得 3 + 3 = 6，有冷冻期卖在 4 之后第二天不能买 2，只能 1 买 5 卖，得 4。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().maxProfit([1, 2, 3, 0, 2]))\n    print(Solution().maxProfit([1]))', '题目的两个样例。'],
            ['\n    print(Solution().maxProfit([1, 2, 4]))\n    print(Solution().maxProfit([1, 4, 2, 5]))', '两个对比的例子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '0', '3', '4'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int a[] = {1, 2, 3, 0, 2}, b[] = {1}, c[] = {1, 2, 4}, d[] = {1, 4, 2, 5};', '两个样例加两个对比的例子。'],
            ['\n    printf("%d\\n%d\\n", maxProfit(a, 5), maxProfit(b, 1));\n    printf("%d\\n%d\\n", maxProfit(c, 3), maxProfit(d, 4));\n    return 0;\n}', '逐个打印结果。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '0', '3', '4'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<vector<int>> cases = {{1, 2, 3, 0, 2}, {1}, {1, 2, 4}, {1, 4, 2, 5}};', '四组输入放进一个「数组的数组」里，下面用一个循环挨个跑。'],
            ['\n    for (auto& prices : cases) {\n        cout << Solution().maxProfit(prices) << endl;\n    }\n    return 0;\n}', '范围 for 循环：`prices` 依次是 cases 里的每一组；`auto&` 让编译器推断类型，并且不复制。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '0', '3', '4'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        int[][] cases = {{1, 2, 3, 0, 2}, {1}, {1, 2, 4}, {1, 4, 2, 5}};', '四组输入放进一个二维数组。'],
            ['\n        for (int[] prices : cases) {\n            System.out.println(new Solution().maxProfit(prices));\n        }\n    }\n}', '增强 for 循环：`prices` 依次是每一组输入。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '0', '3', '4'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    for prices in [vec![1, 2, 3, 0, 2], vec![1], vec![1, 2, 4], vec![1, 4, 2, 5]] {\n        println!("{}", Solution::max_profit(prices));\n    }\n}', '四组输入放进一个数组，循环依次取出，交给函数。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '0', '3', '4'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '股票写完了',
        say: [
          '四道股票题用的是同一套方法：把「每天结束时的情况」列成几个状态，写出每个状态从前一天哪些状态来。题目加一个条件，就改一条转移或者多拆一个状态。时间都是 O(n)，额外空间 O(1)。',
          '到这里，表都还是一行（或者几行并排的一维）。下一个子模块「网格」，表真正变成二维：每格看上面和左边。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
