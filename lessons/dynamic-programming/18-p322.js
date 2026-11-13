/*
 * 动态规划 · 背包 · 322 零钱兑换（中等）
 * 背包子模块的第一题：表的下标是「要凑的金额」。dp[a] = min(dp[a - c] + 1)，凑不出用一个「不可能的大数」表示。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-322',
    group: '背包',
    label: '322',
    title: '零钱兑换',
    summary: '表的下标是要凑的金额：最后一枚硬币是哪种？dp[a] = min(dp[a - c] + 1)。凑不出的金额用一个不可能的大数表示。',
    problem: { id: 322, level: 'medium', url: leetcode('coin-change') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `coins`，表示不同面额的硬币；以及一个整数 `amount`，表示总金额。计算并返回可以凑成总金额所需的**最少的硬币个数**。如果没有任何一种硬币组合能组成总金额，返回 `-1`。你可以认为每种硬币的数量是无限的。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`coins = [1, 2, 5]`, `amount = 11`', '`3`', '11 = 5 + 5 + 1'],
                ['`coins = [2]`, `amount = 3`', '`-1`', '只有 2，凑不出奇数'],
                ['`coins = [1]`, `amount = 0`', '`0`', '什么都不用拿'],
              ],
            },
          },
          { list: ['`1 <= coins.length <= 12`', '`1 <= coins[i] <= 2^31 - 1`', '`0 <= amount <= 10^4`'] },
          '<a href="' + leetcode('coin-change') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：下标是金额',
        doc: [
          '先试试贪心：每次拿能拿的最大面额。`[1, 2, 5]` 凑 11 是 5 + 5 + 1，对了；可换成 `[1, 3, 4]` 凑 6，贪心拿 4 + 1 + 1 要 3 枚，而 3 + 3 只要 2 枚。贪心不可靠，要把所有可能都比一遍。',
          '这类题叫「背包」：有一堆物品（硬币），要装满一个容量（金额）。表的下标不再是数组位置，而是**金额本身**：',
          {
            table: {
              head: ['', '零钱兑换'],
              rows: [
                ['状态', '`dp[a]`：凑出金额 a 最少要几枚硬币'],
                ['转移', '盯住**最后一枚**硬币：如果是面额 c，前面要凑出 a - c，共 `dp[a-c] + 1` 枚。每种面额都试一遍，取最小'],
                ['初始值', '`dp[0] = 0`；其余先设成「凑不出」'],
                ['顺序与答案', 'a 从 1 填到 amount，答案是 `dp[amount]`，凑不出就返回 -1'],
              ],
            },
          },
          '「凑不出」怎么表示？硬币面额至少是 1，凑出 a 最多用 a 枚。所以 **amount + 1** 是一个不可能达到的枚数，拿它当「无穷大」：取 min 时它永远输，最后还是它就说明凑不出。用它而不用 int 的最大值，是因为 `dp[a-c] + 1` 时不会溢出。',
          { viz: { kind: 'grid', title: 'coins = [1, 2, 5]，amount = 11', frames: trace.coins([1, 2, 5], 11) } },
          '每个金额都试一遍所有面额，时间 O(amount × 硬币种数)，额外空间 O(amount)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和「凑不出」的表',
        say: ['函数收面额数组和总金额，返回最少枚数。表的下标从 0 到 amount；先全设成「不可能」的 amount + 1，再把 dp[0] 改成 0。'],
        ops: {
          python: code(
            ['class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:', '照例写类和方法：收面额列表和总金额。'],
            ['\n        INF = amount + 1', '凑出 a 最多用 a 枚 1 元硬币，所以 amount + 1 枚是不可能的，拿它表示「凑不出」。名字全大写，表示它定下来就不再改。'],
            ['\n        dp = [INF] * (amount + 1)', '下标 0 到 amount，一共 amount + 1 格，先全设成凑不出。'],
            ['\n        dp[0] = 0', '凑出 0 元不需要任何硬币。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint coinChange(int* coins, int coinsSize, int amount) {', '题目给的函数：面额数组、种数和总金额。'],
            ['\n    int INF = amount + 1;', '凑出 a 最多用 a 枚 1 元硬币，amount + 1 枚是不可能的，拿它表示「凑不出」。'],
            ['\n    int dp[10001];\n    dp[0] = 0;', 'amount 不超过 10000，下标 0 到 10000 开 10001 格。凑出 0 元不需要硬币。'],
            ['\n    for (int a = 1; a <= amount; a++) {\n        dp[a] = INF;\n    }', '其余的金额先全设成凑不出。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {', '照例的架子。'],
            ['\n        int INF = amount + 1;', 'amount + 1 枚是不可能的，拿它表示「凑不出」。'],
            ['\n        vector<int> dp(amount + 1, INF);\n        dp[0] = 0;', '先全设成凑不出，再把 dp[0] 改成 0。']
          ),
          java: code(
            ['import java.util.Arrays;\n\nclass Solution {\n    public int coinChange(int[] coins, int amount) {', '照例的架子。要用 `Arrays.fill` 填表，先导入 `Arrays`。'],
            ['\n        int INF = amount + 1;', 'amount + 1 枚是不可能的，拿它表示「凑不出」。'],
            ['\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, INF);\n        dp[0] = 0;', '开 amount + 1 格，全填成凑不出，再把 dp[0] 改成 0。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn coin_change(coins: Vec<i32>, amount: i32) -> i32 {', '照例的架子。'],
            ['\n        let amount = amount as usize;\n        let inf = amount + 1;', '金额要做下标，先转成 usize。amount + 1 枚是不可能的，拿它表示「凑不出」。'],
            ['\n        let mut dp = vec![inf; amount + 1];\n        dp[0] = 0;', '先全设成凑不出，再把 dp[0] 改成 0。']
          ),
        },
        sayBy: {
          java: [javadoc('Arrays.fill(int[] a, int val)', 'java/util/Arrays.html#fill(int%5B%5D,int)', 'Assigns the specified int value to each element of the specified array of ints.', '把指定的 int 值赋给这个 int 数组的每一个元素。')],
        },
      },
      {
        section: '写代码',
        title: '每个金额：最后一枚是哪种',
        say: [
          '金额从小到大填。对每个金额 a，把每种面额都当一次「最后一枚」：面额不超过 a 才放得下，放下以后前面要凑 a - c，那一格已经算好了。',
          { viz: { kind: 'grid', title: '最后一枚是哪种', frames: trace.coins([1, 2, 5], 11) } },
        ],
        ops: {
          python: code(
            ['\n        for a in range(1, amount + 1):', '金额从小到大：算 dp[a] 要用的 dp[a - c] 都比 a 小，已经填好了。'],
            ['\n            for c in coins:', '每种面额都试一次当最后一枚。'],
            ['\n                if c <= a:', '面额比要凑的金额还大，放不进去，跳过。'],
            ['\n                    dp[a] = min(dp[a], dp[a - c] + 1)', '最后一枚是 c：前面凑出 a - c 要 dp[a - c] 枚，再加这一枚。和目前最好的比，留小的。dp[a - c] 凑不出时是 INF，加一后更大，自然不会被选上。']
          ),
          c: code(
            ['\n    for (int a = 1; a <= amount; a++) {', '金额从小到大填。'],
            ['\n        for (int k = 0; k < coinsSize; k++) {', '每种面额都试一次当最后一枚。'],
            ['\n            int c = coins[k];\n            if (c <= a && dp[a - c] + 1 < dp[a]) {', '面额放得下，并且「前面凑 a - c，再加这一枚」比目前更少。先判断 `c <= a` 再算 `a - c`：`&&` 左边不成立就不会看右边，下标不会是负的。'],
            ['\n                dp[a] = dp[a - c] + 1;\n            }\n        }\n    }', '更少就换成它。']
          ),
          cpp: code(
            ['\n        for (int a = 1; a <= amount; a++) {', '金额从小到大填。'],
            ['\n            for (int c : coins) {', '每种面额都试一次当最后一枚。'],
            ['\n                if (c <= a) {\n                    dp[a] = min(dp[a], dp[a - c] + 1);\n                }\n            }\n        }', '放得下才试：前面凑 a - c，再加这一枚，留小的。']
          ),
          java: code(
            ['\n        for (int a = 1; a <= amount; a++) {', '金额从小到大填。'],
            ['\n            for (int c : coins) {', '每种面额都试一次当最后一枚。'],
            ['\n                if (c <= a) {\n                    dp[a] = Math.min(dp[a], dp[a - c] + 1);\n                }\n            }\n        }', '放得下才试：前面凑 a - c，再加这一枚，留小的。']
          ),
          rust: code(
            ['\n        for a in 1..=amount {', '金额从小到大填。'],
            ['\n            for &c in &coins {', '每种面额都试一次当最后一枚。'],
            ['\n                let c = c as usize;', '面额也要做下标，转成 usize。'],
            ['\n                if c <= a {\n                    dp[a] = dp[a].min(dp[a - c] + 1);\n                }\n            }\n        }', '放得下才试：前面凑 a - c，再加这一枚，留小的。']
          ),
        },
        sayBy: {
          python: [py('min(arg1, arg2)', 'library/functions.html#min', 'Return the smallest item in an iterable or the smallest of two or more arguments.', '返回可迭代对象里最小的一项，或者两个及以上参数里最小的那个。')],
          rust: [rustdoc('Ord::min', 'cmp/trait.Ord.html#method.min', 'Compares and returns the minimum of two values.', '比较两个值，返回较小的那个。')],
        },
      },
      {
        section: '写代码',
        title: '还是「不可能」就返回 -1',
        say: ['如果 dp[amount] 还是那个不可能的数，说明凑不出，按题目要求返回 -1。'],
        ops: {
          python: code(['\n        return dp[amount] if dp[amount] < INF else -1', '条件表达式：`甲 if 条件 else 乙`。比 INF 小说明真的凑出来了，返回枚数；否则返回 -1。']),
          c: code(['\n    return dp[amount] < INF ? dp[amount] : -1;\n}', '比 INF 小说明凑出来了，否则返回 -1。']),
          cpp: code(['\n        return dp[amount] < INF ? dp[amount] : -1;\n    }\n};', '比 INF 小说明凑出来了，否则返回 -1。']),
          java: code(['\n        return dp[amount] < INF ? dp[amount] : -1;\n    }\n}', '比 INF 小说明凑出来了，否则返回 -1。']),
          rust: code(['\n        if dp[amount] < inf { dp[amount] as i32 } else { -1 }\n    }\n}', '比 inf 小说明凑出来了，转回 i32 返回；否则返回 -1。`if` 表达式的值就是函数的返回值。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试一个贪心会错的',
        say: ['预期：3、-1、0。再试思路里的 `[1, 3, 4]` 凑 6：贪心得 3，正确答案是 2。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().coinChange([1, 2, 5], 11))\n    print(Solution().coinChange([2], 3))\n    print(Solution().coinChange([1], 0))', '题目的三个样例。'],
            ['\n    print(Solution().coinChange([1, 3, 4], 6))', '贪心会错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '-1', '0', '2'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int a[] = {1, 2, 5}, b[] = {2}, c[] = {1}, d[] = {1, 3, 4};', '准备四组面额。'],
            ['\n    printf("%d\\n%d\\n", coinChange(a, 3, 11), coinChange(b, 1, 3));\n    printf("%d\\n%d\\n", coinChange(c, 1, 0), coinChange(d, 3, 6));\n    return 0;\n}', '三个样例，加上贪心会错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '-1', '0', '2'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<int> a = {1, 2, 5}, b = {2}, c = {1}, d = {1, 3, 4};\n    Solution s;', '准备四组面额和一个对象。'],
            ['\n    cout << s.coinChange(a, 11) << endl << s.coinChange(b, 3) << endl;\n    cout << s.coinChange(c, 0) << endl << s.coinChange(d, 6) << endl;\n    return 0;\n}', '三个样例，加上贪心会错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '-1', '0', '2'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口，建一个对象重复用。'],
            ['\n        System.out.println(s.coinChange(new int[]{1, 2, 5}, 11));\n        System.out.println(s.coinChange(new int[]{2}, 3));\n        System.out.println(s.coinChange(new int[]{1}, 0));', '题目的三个样例。'],
            ['\n        System.out.println(s.coinChange(new int[]{1, 3, 4}, 6));\n    }\n}', '贪心会错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '-1', '0', '2'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{}", Solution::coin_change(vec![1, 2, 5], 11));\n    println!("{}", Solution::coin_change(vec![2], 3));\n    println!("{}", Solution::coin_change(vec![1], 0));', '题目的三个样例。'],
            ['\n    println!("{}", Solution::coin_change(vec![1, 3, 4], 6));\n}', '贪心会错的例子。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '-1', '0', '2'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '背包的表，下标是「容量」（这里是金额）。转移还是盯住最后一步：最后放进去的是哪种物品。凑不出用一个不可能的大数表示，取 min 时它永远输。时间 O(amount × 种数)，额外空间 O(amount)。',
          '下一题「完全平方数」换了个说法，其实是同一道题：硬币换成了 1、4、9、16……',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
