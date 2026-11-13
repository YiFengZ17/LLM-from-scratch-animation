/*
 * 动态规划 · 股票 · 121 买卖股票的最佳时机（简单）
 * 股票子模块的第一题：每天分「持有」「不持有」两种状态，逐天往后推。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  const PRICES = [7, 1, 5, 3, 6, 4];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-121',
    group: '股票',
    label: '121',
    title: '买卖股票的最佳时机',
    summary: '只能买卖一次。每天两种状态：持有、不持有，各记一个最大利润，一天一天往后推。',
    problem: { id: 121, level: 'easy', url: leetcode('best-time-to-buy-and-sell-stock') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个数组 `prices`，它的第 i 个元素 `prices[i]` 表示一支给定股票第 i 天的价格。你只能选择**某一天**买入这只股票，并选择在**未来的某一个不同的日子**卖出该股票。返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[7, 1, 5, 3, 6, 4]`', '`5`', '第 1 天以 1 买入，第 4 天以 6 卖出'],
                ['`[7, 6, 4, 3, 1]`', '`0`', '一路下跌，不交易'],
              ],
            },
          },
          { list: ['`1 <= prices.length <= 10^5`', '`0 <= prices[i] <= 10^4`'] },
          '<a href="' + leetcode('best-time-to-buy-and-sell-stock') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：每天两种状态',
        doc: [
          '最直接的想法：如果在第 i 天卖出，买入那天当然选前面价格最低的那天。所以一边往后走一边记住「目前见过的最低价」，就能算出每天卖出的最好利润。',
          '这个想法是对的，不过换一种说法，它能推广到这个子模块的全部四道题：**每天结束时，手里要么持有一股，要么不持有。** 两种状态各记一个「到今天为止的最大利润」：',
          {
            table: {
              head: ['状态', '含义', '今天怎么来'],
              rows: [
                ['持有 `hold`', '今天结束时手里有股票', '昨天就持有，今天不动；或者今天买入（只能买一次，所以本钱从 0 算）：`max(hold, -price)`'],
                ['不持有 `free`', '今天结束时手里没股票', '昨天就没有，今天不动；或者昨天持有、今天卖出：`max(free, hold + price)`'],
              ],
            },
          },
          '买入时利润减去价格，卖出时加上价格。第 0 天：买入的话 `hold = -prices[0]`，不买 `free = 0`。最后一天手里不该还有股票，答案是 `free`。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.stock(PRICES, 'once') } },
          '这里的「状态」不再是一个数，而是「第几天 + 手里有没有股票」。每天的两个状态只依赖前一天的两个状态，所以和子数组那几题一样，不用开表，两个变量往前滚就够。时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收每天的价格，返回最大利润。'],
        ops: {
          python: code(
            ['class Solution:', '照例先写 `Solution` 类。'],
            ['\n    def maxProfit(self, prices: list[int]) -> int:', '题目给的方法：收价格列表，返回最大利润。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果。'],
            ['\n\nint maxProfit(int* prices, int pricesSize) {', '题目给的函数：价格数组和天数分开传进来。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;', '要用到 `vector`、`max` 和 `cout`。'],
            ['\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {', '照例写 `Solution` 类和题目给的方法。']
          ),
          java: code(
            ['class Solution {\n    public int maxProfit(int[] prices) {', '照例写 `Solution` 类和题目给的方法：收价格数组，返回最大利润。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn max_profit(prices: Vec<i32>) -> i32 {', '题目给的函数：收 `Vec<i32>`，返回 `i32`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第 0 天的两种状态',
        say: ['先把第 0 天定下来。买了，手里有股票，利润是负的价格；没买，利润是 0。'],
        ops: {
          python: code(
            ['\n        hold = -prices[0]', '第 0 天买入：花掉 `prices[0]`，利润记作负数。'],
            ['\n        free = 0', '第 0 天不买：什么都没发生，利润 0。']
          ),
          c: code(
            ['\n    int hold = -prices[0];', '第 0 天买入：花掉 `prices[0]`，利润记作负数。'],
            ['\n    int free = 0;', '第 0 天不买：利润 0。']
          ),
          cpp: code(
            ['\n        int hold = -prices[0];', '第 0 天买入：花掉 `prices[0]`，利润记作负数。'],
            ['\n        int free = 0;', '第 0 天不买：利润 0。']
          ),
          java: code(
            ['\n        int hold = -prices[0];', '第 0 天买入：花掉 `prices[0]`，利润记作负数。'],
            ['\n        int free = 0;', '第 0 天不买：利润 0。']
          ),
          rust: code(
            ['\n        let mut hold = -prices[0];', '第 0 天买入：花掉 `prices[0]`，利润记作负数。后面每天都要更新，加 `mut`。'],
            ['\n        let mut free = 0;', '第 0 天不买：利润 0。']
          ),
        },
      },
      {
        section: '写代码',
        title: '一天一天往后推',
        say: [
          '从第 1 天起，每天把两种状态各更新一次。「不持有」可能来自昨天持有、今天卖出，所以它要用**昨天的** hold；先更新 free，再更新 hold，就不会用到今天刚改过的值。',
          { viz: { kind: 'grid', title: '每天更新两种状态', frames: trace.stock(PRICES, 'once') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, len(prices)):', '第 0 天已经定好，从第 1 天推到最后一天。'],
            ['\n            p = prices[i]', '今天的价格要用两次，起个短名字。'],
            ['\n            free = max(free, hold + p)', '今天结束时不持有：要么昨天就没有，今天不动；要么昨天持有，今天以 p 卖掉。这里的 hold 还是昨天的值。'],
            ['\n            hold = max(hold, -p)', '今天结束时持有：要么昨天就有；要么今天以 p 买入。只能买一次，买之前一定没赚过钱，所以是 `-p` 而不是 `free - p`。']
          ),
          c: code(
            ['\n    for (int i = 1; i < pricesSize; i++) {', '第 0 天已经定好，从第 1 天推到最后一天。'],
            ['\n        int p = prices[i];', '今天的价格要用两次，起个短名字。'],
            ['\n        if (hold + p > free) {\n            free = hold + p;\n        }', '不持有：昨天持有、今天卖出更赚，就换成它。这里的 hold 还是昨天的值。'],
            ['\n        if (-p > hold) {\n            hold = -p;\n        }\n    }', '持有：今天买入比一直拿着更划算，就换成今天买。只能买一次，所以本钱从 0 算：`-p`。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)prices.size(); i++) {', '从第 1 天推到最后一天。'],
            ['\n            int p = prices[i];', '今天的价格。'],
            ['\n            free = max(free, hold + p);', '不持有：昨天就没有，或者昨天持有、今天卖出。先更新它，用的是昨天的 hold。'],
            ['\n            hold = max(hold, -p);\n        }', '持有：昨天就有，或者今天买入。只能买一次，所以是 `-p`。']
          ),
          java: code(
            ['\n        for (int i = 1; i < prices.length; i++) {', '从第 1 天推到最后一天。'],
            ['\n            int p = prices[i];', '今天的价格。'],
            ['\n            free = Math.max(free, hold + p);', '不持有：昨天就没有，或者昨天持有、今天卖出。先更新它，用的是昨天的 hold。'],
            ['\n            hold = Math.max(hold, -p);\n        }', '持有：昨天就有，或者今天买入。只能买一次，所以是 `-p`。']
          ),
          rust: code(
            ['\n        for i in 1..prices.len() {', '从第 1 天推到最后一天。'],
            ['\n            let p = prices[i];', '今天的价格。'],
            ['\n            free = free.max(hold + p);', '不持有：昨天就没有，或者昨天持有、今天卖出。先更新它，用的是昨天的 hold。'],
            ['\n            hold = hold.max(-p);\n        }', '持有：昨天就有，或者今天买入。只能买一次，所以是 `-p`。']
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
        title: '答案是不持有',
        say: ['最后一天结束时，手里还拿着股票不会更赚（买了没卖，钱是负的），所以答案是 free。一路下跌时 free 一直是 0，正好就是「不交易」。'],
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
        say: ['预期：5 和 0。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().maxProfit([7, 1, 5, 3, 6, 4]))\n    print(Solution().maxProfit([7, 6, 4, 3, 1]))', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['5', '0'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    int a[] = {7, 1, 5, 3, 6, 4};\n    printf("%d\\n", maxProfit(a, 6));\n    int b[] = {7, 6, 4, 3, 1};\n    printf("%d\\n", maxProfit(b, 5));\n    return 0;\n}', '题目的两个样例，数组和天数一起传进去。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['5', '0'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    vector<int> a = {7, 1, 5, 3, 6, 4}, b = {7, 6, 4, 3, 1};\n    cout << Solution().maxProfit(a) << endl;\n    cout << Solution().maxProfit(b) << endl;\n    return 0;\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['5', '0'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        System.out.println(new Solution().maxProfit(new int[]{7, 1, 5, 3, 6, 4}));\n        System.out.println(new Solution().maxProfit(new int[]{7, 6, 4, 3, 1}));\n    }\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['5', '0'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::max_profit(vec![7, 1, 5, 3, 6, 4]));\n    println!("{}", Solution::max_profit(vec![7, 6, 4, 3, 1]));\n}', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['5', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '状态是「第几天 + 手里有没有股票」，每天由前一天的两种状态推出来。时间 O(n)，额外空间 O(1)。',
          '下一题可以买卖任意多次。只要改一个地方：买入时的本钱不再是 0，而是之前已经赚到的 free。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
