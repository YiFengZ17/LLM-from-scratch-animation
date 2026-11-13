/*
 * 动态规划 · 背包 · 279 完全平方数（中等）
 * 换了说法的零钱兑换：硬币是 1、4、9、16……，每种无限个。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-279',
    group: '背包',
    label: '279',
    title: '完全平方数',
    summary: '把 1、4、9、16……当成硬币，就是上一题：dp[i] = min(dp[i - j²] + 1)。',
    problem: { id: 279, level: 'medium', url: leetcode('perfect-squares') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数 `n`，返回和为 `n` 的完全平方数的最少数量。完全平方数是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`n = 12`', '`3`', '12 = 4 + 4 + 4'],
                ['`n = 13`', '`2`', '13 = 4 + 9'],
              ],
            },
          },
          { list: ['`1 <= n <= 10^4`'] },
          '<a href="' + leetcode('perfect-squares') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：它就是零钱兑换',
        doc: [
          '换个说法读题：有面额为 1、4、9、16……的硬币，每种无限个，凑出 n 最少要几枚？这正是上一题，只是「面额」要自己生成：所有不超过 n 的平方数。',
          {
            table: {
              head: ['', '完全平方数'],
              rows: [
                ['状态', '`dp[i]`：凑出 i 最少要几个平方数'],
                ['转移', '最后一个平方数是 j²：`dp[i] = min(dp[i - j²] + 1)`，j 从 1 试到 j² 不超过 i'],
                ['初始值', '`dp[0] = 0`'],
                ['顺序与答案', 'i 从 1 填到 n，答案 `dp[n]`'],
              ],
            },
          },
          '和上一题有一点不同：1 永远是平方数，所以任何 i 都凑得出来，最坏就是 i 个 1。所以不需要「不可能」的数，把 `dp[i]` 的初值设成 i 就行。',
          { viz: { kind: 'grid', title: 'n = 12', frames: trace.coins([1, 4, 9], 12, '平方数') } },
          '对每个 i，j 最多试到 √i，时间 O(n√n)，额外空间 O(n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子和表',
        say: ['函数收 n，返回最少个数。表的下标从 0 到 n，dp[0] = 0。'],
        ops: {
          python: code(
            ['class Solution:\n    def numSquares(self, n: int) -> int:', '照例写类和方法。'],
            ['\n        dp = [0] * (n + 1)', '下标 0 到 n。dp[0] = 0 已经有了，其余的下面逐个算。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint numSquares(int n) {', '题目给的函数。'],
            ['\n    int dp[10001];\n    dp[0] = 0;', 'n 不超过 10000，开 10001 格。凑出 0 不需要任何平方数。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numSquares(int n) {', '照例的架子。'],
            ['\n        vector<int> dp(n + 1, 0);', '下标 0 到 n，先全是 0，dp[0] = 0 就有了。']
          ),
          java: code(
            ['class Solution {\n    public int numSquares(int n) {', '照例的架子。'],
            ['\n        int[] dp = new int[n + 1];', '下标 0 到 n，新建时全是 0，dp[0] = 0 就有了。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn num_squares(n: i32) -> i32 {', '照例的架子。'],
            ['\n        let n = n as usize;\n        let mut dp = vec![0; n + 1];', 'n 要做下标，先转成 usize。下标 0 到 n，dp[0] = 0 就有了。']
          ),
        },
      },
      {
        section: '写代码',
        title: '最后一个平方数是哪个',
        say: [
          'i 从小到大。先把 dp[i] 设成 i：全用 1 一定凑得出，这是最坏情况。再让 j 从 1 开始往上试，只要 j² 不超过 i，就看「最后一个是 j²」能不能更少。',
          { viz: { kind: 'grid', title: '平方数当硬币', frames: trace.coins([1, 4, 9], 12, '平方数') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, n + 1):', 'i 从小到大，用到的 dp[i - j²] 都已经算好。'],
            ['\n            dp[i] = i', '最坏情况：i 个 1 相加。先拿它当目前的答案。'],
            ['\n            j = 1\n            while j * j <= i:', '要试所有不超过 i 的平方数，但事先不知道有几个，所以用 `while`：只要 j² 还不超过 i 就继续。'],
            ['\n                dp[i] = min(dp[i], dp[i - j * j] + 1)', '最后一个是 j²：前面凑 i - j²，再加这一个。留小的。'],
            ['\n                j += 1', '试下一个平方数。别忘了这一行，否则 `while` 永远停不下来。']
          ),
          c: code(
            ['\n    for (int i = 1; i <= n; i++) {', 'i 从小到大。'],
            ['\n        dp[i] = i;', '最坏情况：i 个 1 相加。'],
            ['\n        for (int j = 1; j * j <= i; j++) {', '试所有不超过 i 的平方数。`for` 的条件不一定要和 j 的上限直接比，`j * j <= i` 也可以。'],
            ['\n            if (dp[i - j * j] + 1 < dp[i]) {\n                dp[i] = dp[i - j * j] + 1;\n            }\n        }\n    }', '最后一个是 j²：前面凑 i - j²，再加这一个。更少就换。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i <= n; i++) {', 'i 从小到大。'],
            ['\n            dp[i] = i;', '最坏情况：i 个 1 相加。'],
            ['\n            for (int j = 1; j * j <= i; j++) {\n                dp[i] = min(dp[i], dp[i - j * j] + 1);\n            }\n        }', '试所有不超过 i 的平方数 j²：前面凑 i - j²，再加这一个，留小的。']
          ),
          java: code(
            ['\n        for (int i = 1; i <= n; i++) {', 'i 从小到大。'],
            ['\n            dp[i] = i;', '最坏情况：i 个 1 相加。'],
            ['\n            for (int j = 1; j * j <= i; j++) {\n                dp[i] = Math.min(dp[i], dp[i - j * j] + 1);\n            }\n        }', '试所有不超过 i 的平方数 j²：前面凑 i - j²，再加这一个，留小的。']
          ),
          rust: code(
            ['\n        for i in 1..=n {', 'i 从小到大。'],
            ['\n            dp[i] = i;', '最坏情况：i 个 1 相加。'],
            ['\n            let mut j = 1;\n            while j * j <= i {', '试所有不超过 i 的平方数，事先不知道几个，用 `while`。'],
            ['\n                dp[i] = dp[i].min(dp[i - j * j] + 1);\n                j += 1;\n            }\n        }', '最后一个是 j²：前面凑 i - j²，再加这一个，留小的。然后试下一个。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是 dp[n]',
        say: ['n 一定凑得出，直接返回。'],
        ops: {
          python: code(['\n        return dp[n]', '凑出 n 最少要几个平方数。']),
          c: code(['\n    return dp[n];\n}', '凑出 n 最少要几个平方数。']),
          cpp: code(['\n        return dp[n];\n    }\n};', '凑出 n 最少要几个平方数。']),
          java: code(['\n        return dp[n];\n    }\n}', '凑出 n 最少要几个平方数。']),
          rust: code(['\n        dp[n] as i32\n    }\n}', '表里存的是 usize（因为初值是 i），转回 i32 返回。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试两个',
        say: ['预期：12 是 3，13 是 2。再试 1（本身就是平方数，得 1）和 7（7 = 4 + 1 + 1 + 1，得 4）。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for n in [12, 13, 1, 7]:\n        print(Solution().numSquares(n))', '四个数挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '2', '1', '4'] }]),
          c: code(['\n\nint main(void) {\n    int ns[] = {12, 13, 1, 7};\n    for (int k = 0; k < 4; k++) {\n        printf("%d\\n", numSquares(ns[k]));\n    }\n    return 0;\n}', '四个数挨个跑。']).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '2', '1', '4'] }]),
          cpp: code(['\n\nint main() {\n    for (int n : {12, 13, 1, 7}) {\n        cout << Solution().numSquares(n) << endl;\n    }\n    return 0;\n}', '四个数挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '2', '1', '4'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (int n : new int[]{12, 13, 1, 7}) {\n            System.out.println(new Solution().numSquares(n));\n        }\n    }\n}', '四个数挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '2', '1', '4'] }]),
          rust: code(['\n\nfn main() {\n    for n in [12, 13, 1, 7] {\n        println!("{}", Solution::num_squares(n));\n    }\n}', '四个数挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '2', '1', '4'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '读题时先想「它像哪道做过的题」：平方数就是硬币，题目就变成了零钱兑换。时间 O(n√n)，额外空间 O(n)。',
          '前两题的物品都能无限次使用。下一题「分割等和子集」里每个数**只能用一次**，表的填法要倒过来——就像杨辉三角 II 那样。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
