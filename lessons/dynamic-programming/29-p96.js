/*
 * 动态规划 · 区间与计数 · 96 不同的二叉搜索树（中等）
 * 计数 DP：轮流让每个数当根，左右两边各自是一个更小的同类问题，种数相乘再相加。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-96',
    group: '区间与计数',
    label: '96',
    title: '不同的二叉搜索树',
    summary: '轮流让每个数当根：左边 j-1 个数、右边 i-j 个数各自组成二叉搜索树，种数相乘，再对所有根求和。',
    problem: { id: 96, level: 'medium', url: leetcode('unique-binary-search-trees') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数 `n`，求恰由 `n` 个节点组成且节点值从 1 到 `n` 互不相同的**二叉搜索树**有多少种？返回满足题意的二叉搜索树的种数。',
          '二叉搜索树：每个节点左子树里的值都比它小，右子树里的值都比它大。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`n = 3`', '`5`'],
                ['`n = 1`', '`1`'],
              ],
            },
          },
          { list: ['`1 <= n <= 19`'] },
          '<a href="' + leetcode('unique-binary-search-trees') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：谁当根',
        doc: [
          '这次「最后一步」换成「第一步」：**先选根**。假设 1 到 i 里选 j 当根，二叉搜索树的规则决定了：比 j 小的 1 到 j-1 全在左子树，比 j 大的 j+1 到 i 全在右子树。',
          '左子树是 j - 1 个数组成的二叉搜索树，右子树是 i - j 个数组成的。左边每一种都能配右边每一种，所以以 j 为根一共 `左边种数 × 右边种数` 种。',
          '关键的观察：**种数只和数的个数有关**，和具体是哪些数无关。4、5、6 能组成的形状和 1、2、3 一模一样。所以状态只要一个数：',
          {
            table: {
              head: ['', '不同的二叉搜索树'],
              rows: [
                ['状态', '`G[i]`：i 个不同的数能组成几种二叉搜索树'],
                ['转移', '根 j 从 1 试到 i：`G[i] = Σ G[j-1] × G[i-j]`'],
                ['初始值', '`G[0] = 1`（空树也算一种，乘法里才不会变成 0），`G[1] = 1`'],
                ['顺序与答案', 'i 从 2 到 n，答案 `G[n]`'],
              ],
            },
          },
          { viz: { kind: 'grid', title: 'n = 5', frames: trace.trees(5) } },
          '每个 i 试 i 个根，时间 O(n²)，额外空间 O(n)。n 最大 19，答案 1767263190，还在 int 的范围里。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和两个起点',
        say: ['函数收 n，返回种数。表的下标是「几个数」，0 到 n。空树算一种，一个数也只有一种。'],
        ops: {
          python: code(
            ['class Solution:\n    def numTrees(self, n: int) -> int:', '照例写类和方法。'],
            ['\n        g = [0] * (n + 1)', '下标 0 到 n，先全是 0，后面一个个累加。'],
            ['\n        g[0] = g[1] = 1', '0 个数：只有空树一种。它必须是 1 而不是 0，否则某一边为空时，乘出来整个就是 0 了。1 个数：只有一种。n 至少是 1，所以 g[1] 一定存在。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint numTrees(int n) {', '题目给的函数。'],
            ['\n    int g[20];\n    g[0] = g[1] = 1;', 'n 不超过 19，开 20 格。0 个数只有空树一种，必须是 1，否则乘法会变成 0；1 个数也只有一种。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numTrees(int n) {', '照例的架子。'],
            ['\n        vector<int> g(n + 1, 0);\n        g[0] = g[1] = 1;', '下标 0 到 n。空树算一种，必须是 1；一个数也只有一种。']
          ),
          java: code(
            ['class Solution {\n    public int numTrees(int n) {', '照例的架子。'],
            ['\n        int[] g = new int[n + 1];\n        g[0] = g[1] = 1;', '下标 0 到 n。空树算一种，必须是 1；一个数也只有一种。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn num_trees(n: i32) -> i32 {', '照例的架子。'],
            ['\n        let n = n as usize;\n        let mut g = vec![0; n + 1];\n        g[0] = 1;\n        g[1] = 1;', '下标 0 到 n。空树算一种，必须是 1；一个数也只有一种。Rust 不支持连等号赋值，分两行写。']
          ),
        },
      },
      {
        section: '写代码',
        title: '每个数轮流当根，左右相乘再相加',
        say: [
          '个数 i 从 2 到 n。对每个 i，根 j 从 1 试到 i：左边 j - 1 个数，右边 i - j 个数，两边的种数都比 i 小、已经算好，相乘后加进 G[i]。',
          { viz: { kind: 'grid', title: '左右相乘再相加', frames: trace.trees(5) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(2, n + 1):', 'i 个数，从 2 算到 n。'],
            ['\n            for j in range(1, i + 1):', '1 到 i 里的每个数 j，轮流当根。'],
            ['\n                g[i] += g[j - 1] * g[i - j]', '左边 j - 1 个数、右边 i - j 个数，两边的每种形状都能搭配，种数相乘。所有根的结果加起来。']
          ),
          c: code(
            ['\n    for (int i = 2; i <= n; i++) {\n        g[i] = 0;', 'i 个数，从 2 算到 n。C 的数组没有自动清零，先把要累加的格子设成 0。'],
            ['\n        for (int j = 1; j <= i; j++) {', '1 到 i 里的每个数 j，轮流当根。'],
            ['\n            g[i] += g[j - 1] * g[i - j];\n        }\n    }', '左边 j - 1 个、右边 i - j 个，种数相乘，加起来。']
          ),
          cpp: code(
            ['\n        for (int i = 2; i <= n; i++) {', 'i 个数，从 2 算到 n。'],
            ['\n            for (int j = 1; j <= i; j++) {\n                g[i] += g[j - 1] * g[i - j];\n            }\n        }', '每个 j 轮流当根：左边 j - 1 个、右边 i - j 个，种数相乘，加起来。']
          ),
          java: code(
            ['\n        for (int i = 2; i <= n; i++) {', 'i 个数，从 2 算到 n。'],
            ['\n            for (int j = 1; j <= i; j++) {\n                g[i] += g[j - 1] * g[i - j];\n            }\n        }', '每个 j 轮流当根：左边 j - 1 个、右边 i - j 个，种数相乘，加起来。']
          ),
          rust: code(
            ['\n        for i in 2..=n {', 'i 个数，从 2 算到 n。'],
            ['\n            for j in 1..=i {\n                g[i] += g[j - 1] * g[i - j];\n            }\n        }', '每个 j 轮流当根：左边 j - 1 个、右边 i - j 个，种数相乘，加起来。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是 G[n]',
        say: ['n 个数能组成的种数。'],
        ops: {
          python: code(['\n        return g[n]', 'n 个数的种数。']),
          c: code(['\n    return g[n];\n}', 'n 个数的种数。']),
          cpp: code(['\n        return g[n];\n    }\n};', 'n 个数的种数。']),
          java: code(['\n        return g[n];\n    }\n}', 'n 个数的种数。']),
          rust: code(['\n        g[n]\n    }\n}', 'n 个数的种数。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试最大的 19',
        say: ['预期：3 是 5，1 是 1。再试最大的 n = 19，应该是 1767263190。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for n in [3, 1, 19]:\n        print(Solution().numTrees(n))', '两个样例和最大的 n。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['5', '1', '1767263190'] }]),
          c: code(['\n\nint main(void) {\n    printf("%d\\n%d\\n%d\\n", numTrees(3), numTrees(1), numTrees(19));\n    return 0;\n}', '两个样例和最大的 n。']).concat([{ pause: 500 }, { run: RUN.c, output: ['5', '1', '1767263190'] }]),
          cpp: code(['\n\nint main() {\n    for (int n : {3, 1, 19}) {\n        cout << Solution().numTrees(n) << endl;\n    }\n    return 0;\n}', '两个样例和最大的 n。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['5', '1', '1767263190'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (int n : new int[]{3, 1, 19}) {\n            System.out.println(new Solution().numTrees(n));\n        }\n    }\n}', '两个样例和最大的 n。']).concat([{ pause: 500 }, { run: RUN.java, output: ['5', '1', '1767263190'] }]),
          rust: code(['\n\nfn main() {\n    for n in [3, 1, 19] {\n        println!("{}", Solution::num_trees(n));\n    }\n}', '两个样例和最大的 n。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['5', '1', '1767263190'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '计数题的转移是「分情况，每种情况里左右独立，种数相乘，再把各种情况相加」。状态能只用「个数」，是因为种数只和个数有关。时间 O(n²)。',
          '最后一题「戳气球」是真正的区间 DP：状态是一段区间 [l, r]，要按区间从短到长填。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
