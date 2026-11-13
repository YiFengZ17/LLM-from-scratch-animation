/*
 * 动态规划 · 股票 · 714 买卖股票的最佳时机含手续费（中等）
 * 和 122 一样，卖出时多减一笔手续费。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-714',
    group: '股票',
    label: '714',
    title: '买卖股票的最佳时机含手续费',
    summary: '和上一题只差一处：每卖出一次，再减掉一笔手续费。手续费让小的涨幅不值得交易。',
    problem: { id: 714, level: 'medium', url: leetcode('best-time-to-buy-and-sell-stock-with-transaction-fee') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个整数数组 `prices`，其中 `prices[i]` 表示第 i 天的股票价格；整数 `fee` 代表了交易股票的手续费用。你可以无限次地完成交易，但是你每笔交易都需要付手续费。如果你已经购买了一个股票，在卖出它之前你就不能再继续购买股票了。返回获得利润的最大值。',
          '注意：这里的一笔交易指买入持有并卖出股票的整个过程，每笔交易你只需要为支付一次手续费。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`prices = [1, 3, 2, 8, 4, 9]`, `fee = 2`', '`8`', '1 买 8 卖、4 买 9 卖：(8 - 1 - 2) + (9 - 4 - 2) = 8'],
                ['`prices = [1, 3, 7, 5, 10, 3]`, `fee = 3`', '`6`', '1 买 10 卖：10 - 1 - 3 = 6'],
              ],
            },
          },
          { list: ['`1 <= prices.length <= 5 * 10^4`', '`1 <= prices[i] < 5 * 10^4`', '`0 <= fee < 5 * 10^4`'] },
          '<a href="' + leetcode('best-time-to-buy-and-sell-stock-with-transaction-fee') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '状态和转移照搬上一题，一笔交易只收一次手续费，那就在**卖出**的时候扣：',
          {
            table: {
              head: ['状态', '今天怎么来'],
              rows: [
                ['持有 `hold`', '`max(hold, free - price)`'],
                ['不持有 `free`', '`max(free, hold + price - fee)`'],
              ],
            },
          },
          '看样例 1：价格从 1 涨到 3，只赚 2，扣掉手续费 2 什么都不剩；不如一直拿到 8 再卖。表里的「不持有」在第 1 天保持 0，说明这次小涨被自动放过了。',
          { viz: { kind: 'grid', title: '样例 1：fee = 2', frames: trace.stock([1, 3, 2, 8, 4, 9], 'fee', 2) } },
          '时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子和第 0 天',
        say: ['函数多收一个参数：手续费 `fee`。第 0 天和前两题一样。'],
        ops: {
          python: code(
            ['class Solution:\n    def maxProfit(self, prices: list[int], fee: int) -> int:', '题目给的方法：价格列表之外，多一个手续费 `fee`。'],
            ['\n        hold, free = -prices[0], 0', '第 0 天：买入是 `-prices[0]`，不买是 0。买入时不收手续费，留到卖出时一起扣。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint maxProfit(int* prices, int pricesSize, int fee) {', '题目给的函数：多一个手续费 `fee`。'],
            ['\n    int hold = -prices[0], free = 0;', '第 0 天：买入是 `-prices[0]`，不买是 0。手续费留到卖出时扣。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices, int fee) {', '题目给的方法：多一个手续费 `fee`。'],
            ['\n        int hold = -prices[0], free = 0;', '第 0 天：买入是 `-prices[0]`，不买是 0。手续费留到卖出时扣。']
          ),
          java: code(
            ['class Solution {\n    public int maxProfit(int[] prices, int fee) {', '题目给的方法：多一个手续费 `fee`。'],
            ['\n        int hold = -prices[0], free = 0;', '第 0 天：买入是 `-prices[0]`，不买是 0。手续费留到卖出时扣。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn max_profit(prices: Vec<i32>, fee: i32) -> i32 {', '题目给的函数：多一个手续费 `fee`。'],
            ['\n        let (mut hold, mut free) = (-prices[0], 0);', '第 0 天：买入是 `-prices[0]`，不买是 0。手续费留到卖出时扣。']
          ),
        },
      },
      {
        section: '写代码',
        title: '卖出时扣手续费',
        say: [
          '循环和上一题一模一样，只在「今天卖出」那一项后面减去 fee。',
          { viz: { kind: 'grid', title: '小涨幅被放过', frames: trace.stock([1, 3, 2, 8, 4, 9], 'fee', 2) } },
        ],
        ops: {
          python: code(
            ['\n        for p in prices[1:]:', '从第 1 天起逐天往后推。'],
            ['\n            hold, free = max(hold, free - p), max(free, hold + p - fee)', '和上一题一样同时更新两个状态，只是卖出那一项多减一个 fee：每完成一笔交易付一次。']
          ),
          c: code(
            ['\n    for (int i = 1; i < pricesSize; i++) {', '从第 1 天起逐天往后推。'],
            ['\n        int newHold = hold > free - prices[i] ? hold : free - prices[i];', '持有：继续拿着，或者用 free 买入。先用旧值算好。'],
            ['\n        int sell = hold + prices[i] - fee;', '今天卖出能得到多少：卖出价加上去，再扣掉这笔交易的手续费。单独算出来，下一行比较时清楚一些。'],
            ['\n        int newFree = free > sell ? free : sell;', '不持有：继续空仓，或者今天卖出，取大的。'],
            ['\n        hold = newHold;\n        free = newFree;\n    }', '两个新值一起换上。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)prices.size(); i++) {', '从第 1 天起逐天往后推。'],
            ['\n            int newHold = max(hold, free - prices[i]);', '持有：继续拿着，或者用 free 买入。'],
            ['\n            int newFree = max(free, hold + prices[i] - fee);', '不持有：继续空仓，或者今天卖出并扣掉手续费。'],
            ['\n            hold = newHold;\n            free = newFree;\n        }', '两个新值一起换上。']
          ),
          java: code(
            ['\n        for (int i = 1; i < prices.length; i++) {', '从第 1 天起逐天往后推。'],
            ['\n            int newHold = Math.max(hold, free - prices[i]);', '持有：继续拿着，或者用 free 买入。'],
            ['\n            int newFree = Math.max(free, hold + prices[i] - fee);', '不持有：继续空仓，或者今天卖出并扣掉手续费。'],
            ['\n            hold = newHold;\n            free = newFree;\n        }', '两个新值一起换上。']
          ),
          rust: code(
            ['\n        for &p in &prices[1..] {', '从第 1 天起逐天往后推。'],
            ['\n            (hold, free) = (hold.max(free - p), free.max(hold + p - fee));\n        }', '同时更新两个状态，卖出那一项多减一个 fee。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是不持有',
        say: ['最后一天结束时不持有。'],
        ops: {
          python: code(['\n        return free', '最后一天不持有时的最大利润。']),
          c: code(['\n    return free;\n}', '最后一天不持有时的最大利润。']),
          cpp: code(['\n        return free;\n    }\n};', '最后一天不持有时的最大利润。']),
          java: code(['\n        return free;\n    }\n}', '最后一天不持有时的最大利润。']),
          rust: code(['\n        free\n    }\n}', '最后一天不持有时的最大利润。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：8 和 6。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().maxProfit([1, 3, 2, 8, 4, 9], 2))\n    print(Solution().maxProfit([1, 3, 7, 5, 10, 3], 3))', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['8', '6'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int a[] = {1, 3, 2, 8, 4, 9}, b[] = {1, 3, 7, 5, 10, 3};\n    printf("%d\\n%d\\n", maxProfit(a, 6, 2), maxProfit(b, 6, 3));\n    return 0;\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['8', '6'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<int> a = {1, 3, 2, 8, 4, 9}, b = {1, 3, 7, 5, 10, 3};\n    cout << Solution().maxProfit(a, 2) << endl << Solution().maxProfit(b, 3) << endl;\n    return 0;\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['8', '6'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        System.out.println(new Solution().maxProfit(new int[]{1, 3, 2, 8, 4, 9}, 2));\n        System.out.println(new Solution().maxProfit(new int[]{1, 3, 7, 5, 10, 3}, 3));\n    }\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['8', '6'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{}", Solution::max_profit(vec![1, 3, 2, 8, 4, 9], 2));\n    println!("{}", Solution::max_profit(vec![1, 3, 7, 5, 10, 3], 3));\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['8', '6'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '题目多一个条件，转移就多一处修改：手续费只影响卖出那一项。时间 O(n)，额外空间 O(1)。',
          '下一题的条件是「卖出后要冷冻一天」，这会让「不持有」分成两种情况，状态从两个变成三个。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
