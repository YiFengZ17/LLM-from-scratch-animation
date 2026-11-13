/*
 * 动态规划 · 股票 · 122 买卖股票的最佳时机 II（中等）
 * 可以买卖任意多次：买入时的本钱换成之前已经赚到的 free。两个状态互相依赖，要用旧值同时更新。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  const PRICES = [7, 1, 5, 3, 6, 4];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-122',
    group: '股票',
    label: '122',
    title: '买卖股票的最佳时机 II',
    summary: '不限交易次数：买入时从已经赚到的钱里出。持有和不持有互相依赖，要用昨天的值同时更新。',
    problem: { id: 122, level: 'medium', url: leetcode('best-time-to-buy-and-sell-stock-ii') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `prices`，其中 `prices[i]` 表示某支股票第 i 天的价格。在每一天，你可以决定是否购买和/或出售股票。你在任何时候**最多**只能持有**一股**股票。你也可以先购买，然后在**同一天**出售。返回你能获得的**最大**利润。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[7, 1, 5, 3, 6, 4]`', '`7`', '1 买 5 卖赚 4，3 买 6 卖赚 3'],
                ['`[1, 2, 3, 4, 5]`', '`4`', '1 买 5 卖'],
                ['`[7, 6, 4, 3, 1]`', '`0`', '不交易'],
              ],
            },
          },
          { list: ['`1 <= prices.length <= 3 * 10^4`', '`0 <= prices[i] <= 10^4`'] },
          '<a href="' + leetcode('best-time-to-buy-and-sell-stock-ii') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '状态还是那两个：每天结束时**持有**或**不持有**。和上一题比，只有「今天买入」变了：上一题只能买一次，买之前一定没赚过钱，本钱从 0 算；这题可以反复买卖，买入前手里可能已经赚了 `free`，所以买入后是 `free - price`。',
          {
            table: {
              head: ['状态', '今天怎么来'],
              rows: [
                ['持有 `hold`', '`max(hold, free - price)`：继续拿着，或者用之前赚的钱今天买入'],
                ['不持有 `free`', '`max(free, hold + price)`：继续空仓，或者今天卖出'],
              ],
            },
          },
          '现在两个新值都要用对方**昨天**的值：新的 hold 要用昨天的 free，新的 free 要用昨天的 hold。不管先更新哪个，另一个都会用到改过的值——这和泰波那契那题挪变量是同一个问题，解决办法也一样：先用旧值把两个新值都算好，再一起换上。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.stock(PRICES, 'many') } },
          '时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子和第 0 天',
        say: ['函数的样子和上一题一样。第 0 天也一样：买入是 `-prices[0]`，不买是 0。'],
        ops: {
          python: code(
            ['class Solution:\n    def maxProfit(self, prices: list[int]) -> int:', '和上一题同名的方法：收价格列表，返回最大利润。'],
            ['\n        hold, free = -prices[0], 0', '第 0 天：买入的话利润是 `-prices[0]`，不买是 0。一行同时给两个变量赋值。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint maxProfit(int* prices, int pricesSize) {', '和上一题同样的函数签名。'],
            ['\n    int hold = -prices[0], free = 0;', '第 0 天：买入的话利润是 `-prices[0]`，不买是 0。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {', '和上一题同样的架子。'],
            ['\n        int hold = -prices[0], free = 0;', '第 0 天：买入的话利润是 `-prices[0]`，不买是 0。']
          ),
          java: code(
            ['class Solution {\n    public int maxProfit(int[] prices) {', '和上一题同样的架子。'],
            ['\n        int hold = -prices[0], free = 0;', '第 0 天：买入的话利润是 `-prices[0]`，不买是 0。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn max_profit(prices: Vec<i32>) -> i32 {', '和上一题同样的架子。'],
            ['\n        let (mut hold, mut free) = (-prices[0], 0);', '第 0 天：买入的话利润是 `-prices[0]`，不买是 0。']
          ),
        },
      },
      {
        section: '写代码',
        title: '用昨天的值，同时更新两个状态',
        say: [
          '每天两个状态都要更新，而它们互相要用对方昨天的值。所以先用旧的 hold 和 free 把两个新值都算出来，再一起换上。',
          { viz: { kind: 'grid', title: '两个状态互相依赖', frames: trace.stock(PRICES, 'many') } },
        ],
        ops: {
          python: code(
            ['\n        for p in prices[1:]:', '从第 1 天起逐天往后推。这次只用到价格、用不到下标，直接遍历 `prices[1:]` 这个切片，`p` 就是每天的价格。'],
            ['\n            hold, free = max(hold, free - p), max(free, hold + p)', '右边两个新值先用旧的 hold、free 一起算好，再同时赋给左边——和泰波那契那题挪三个变量是同一个写法。持有：继续拿着，或者用之前赚的 free 买入；不持有：继续空仓，或者今天卖出。']
          ),
          c: code(
            ['\n    for (int i = 1; i < pricesSize; i++) {', '从第 1 天起逐天往后推。'],
            ['\n        int newHold = hold > free - prices[i] ? hold : free - prices[i];', '先用旧值算新的持有：继续拿着，或者用之前赚的 free 今天买入，取大的。算好先放在 `newHold` 里，不急着改 hold。'],
            ['\n        int newFree = free > hold + prices[i] ? free : hold + prices[i];', '再用旧值算新的不持有：继续空仓，或者今天卖出。这时 hold 还是昨天的值。'],
            ['\n        hold = newHold;\n        free = newFree;\n    }', '两个新值都算好了，一起换上。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)prices.size(); i++) {', '从第 1 天起逐天往后推。'],
            ['\n            int newHold = max(hold, free - prices[i]);', '先用旧值算新的持有：继续拿着，或者用之前赚的 free 今天买入。'],
            ['\n            int newFree = max(free, hold + prices[i]);', '再用旧值算新的不持有：继续空仓，或者今天卖出。'],
            ['\n            hold = newHold;\n            free = newFree;\n        }', '两个新值都算好了，一起换上。']
          ),
          java: code(
            ['\n        for (int i = 1; i < prices.length; i++) {', '从第 1 天起逐天往后推。'],
            ['\n            int newHold = Math.max(hold, free - prices[i]);', '先用旧值算新的持有：继续拿着，或者用之前赚的 free 今天买入。'],
            ['\n            int newFree = Math.max(free, hold + prices[i]);', '再用旧值算新的不持有：继续空仓，或者今天卖出。'],
            ['\n            hold = newHold;\n            free = newFree;\n        }', '两个新值都算好了，一起换上。']
          ),
          rust: code(
            ['\n        for &p in &prices[1..] {', '从第 1 天起逐天往后推。`&prices[1..]` 借用从第 1 个开始的切片；元素是引用，写成 `&p` 就直接拿到里面的数。'],
            ['\n            (hold, free) = (hold.max(free - p), free.max(hold + p));\n        }', '右边的元组先用旧值把两个新值都算好，再整体赋给左边。持有：继续拿着，或者用之前赚的 free 买入；不持有：继续空仓，或者今天卖出。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是不持有',
        say: ['和上一题一样，最后一天结束时不持有才是最好的。'],
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
        title: '用三个样例跑一遍',
        say: ['预期：7、4、0。第一个样例和上一题一样，可以交易多次后从 5 变成了 7。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().maxProfit([7, 1, 5, 3, 6, 4]))\n    print(Solution().maxProfit([1, 2, 3, 4, 5]))\n    print(Solution().maxProfit([7, 6, 4, 3, 1]))', '题目的三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['7', '4', '0'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int a[] = {7, 1, 5, 3, 6, 4}, b[] = {1, 2, 3, 4, 5}, c[] = {7, 6, 4, 3, 1};', '准备三个样例。同一类型的几个数组可以在一行里声明。'],
            ['\n    printf("%d\\n%d\\n%d\\n", maxProfit(a, 6), maxProfit(b, 5), maxProfit(c, 5));\n    return 0;\n}', '一个 `printf` 打印三个结果，每个 `%d` 依次对应后面的一个值。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['7', '4', '0'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<int> a = {7, 1, 5, 3, 6, 4}, b = {1, 2, 3, 4, 5}, c = {7, 6, 4, 3, 1};\n    cout << Solution().maxProfit(a) << endl << Solution().maxProfit(b) << endl << Solution().maxProfit(c) << endl;\n    return 0;\n}', '三个样例。`<<` 可以一直接下去，依次输出。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['7', '4', '0'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口，建一个对象重复用。'],
            ['\n        System.out.println(s.maxProfit(new int[]{7, 1, 5, 3, 6, 4}));\n        System.out.println(s.maxProfit(new int[]{1, 2, 3, 4, 5}));\n        System.out.println(s.maxProfit(new int[]{7, 6, 4, 3, 1}));\n    }\n}', '题目的三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['7', '4', '0'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{}", Solution::max_profit(vec![7, 1, 5, 3, 6, 4]));\n    println!("{}", Solution::max_profit(vec![1, 2, 3, 4, 5]));\n    println!("{}", Solution::max_profit(vec![7, 6, 4, 3, 1]));\n}', '题目的三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['7', '4', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '和上一题相比只改了一处：买入时从 free 里出钱。两个状态互相依赖，所以要先用旧值把新值都算好，再一起换上。时间 O(n)，额外空间 O(1)。',
          '下一题每笔交易要付手续费，只需要在卖出时再减掉一笔钱。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
