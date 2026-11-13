/*
 * 动态规划 · 网格 · 62 不同路径（中等）
 * 真正的网格 DP：每格 = 上面一格 + 左边一格。第一行、第一列都是 1。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cppdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-62',
    group: '网格',
    label: '62',
    title: '不同路径',
    summary: '只能向右或向下走：最后一步从上面来或从左边来，dp[i][j] = dp[i-1][j] + dp[i][j-1]。',
    problem: { id: 62, level: 'medium', url: leetcode('unique-paths') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '一个机器人位于一个 `m x n` 网格的左上角。机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角。问总共有多少条不同的路径？',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`m = 3`, `n = 7`', '`28`', ''],
                ['`m = 3`, `n = 2`', '`3`', '右下下、下右下、下下右'],
              ],
            },
          },
          { list: ['`1 <= m, n <= 100`', '题目数据保证答案小于等于 `2 * 10^9`'] },
          '<a href="' + leetcode('unique-paths') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '还是盯住最后一步。走到格子 (i, j) 的最后一步，要么从**上面** (i-1, j) 往下走一步，要么从**左边** (i, j-1) 往右走一步。两类路径不重复，条数相加：',
          {
            table: {
              head: ['', '不同路径'],
              rows: [
                ['状态', '`dp[i][j]`：从左上角走到 (i, j) 有几条路'],
                ['转移', '`dp[i][j] = dp[i-1][j] + dp[i][j-1]`'],
                ['初始值', '第一行只能一路向右，第一列只能一路向下，都是 1'],
                ['顺序与答案', '一行一行、每行从左往右填，填到 (i, j) 时上面和左边都已经填好；答案是右下角 `dp[m-1][n-1]`'],
              ],
            },
          },
          '这和爬楼梯是同一个想法，只是「前一步」从一维的两级台阶变成了二维的两个方向。',
          { viz: { kind: 'grid', title: 'm = 3, n = 7', frames: trace.paths(3, 7) } },
          '时间 O(m·n)，额外空间 O(m·n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收网格的行数 m 和列数 n，返回路径条数。题目保证答案不超过 2 × 10<sup>9</sup>，比 int 的上限 2147483647 小，用 int 够。'],
        ops: {
          python: code(['class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:', '照例写类和方法：收 m 和 n，返回条数。']),
          c: code(['#include <stdio.h>\n\nint uniquePaths(int m, int n) {', '题目给的函数。']),
          cpp: code(['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int uniquePaths(int m, int n) {', '照例的架子。']),
          java: code(['class Solution {\n    public int uniquePaths(int m, int n) {', '照例的架子。']),
          rust: code(['struct Solution;\n\nimpl Solution {\n    pub fn unique_paths(m: i32, n: i32) -> i32 {', '照例的架子。']),
        },
      },
      {
        section: '写代码',
        title: '开一张 m × n 的表，先全填 1',
        say: ['表和网格一样大：m 行 n 列。第一行和第一列都是 1，不如干脆**整张表先全填 1**：第一行第一列就对了，其余的格子马上会被转移覆盖掉。'],
        ops: {
          python: code(['\n        dp = [[1] * n for _ in range(m)]', '要 m 行、每行 n 个 1。外面这层是列表推导式：`for _ in range(m)` 跑 m 次，每次都**新造**一个 `[1] * n`。不能写成 `[[1] * n] * m`——那样 m 行其实是同一个列表，改一格，整列都跟着变。']),
          c: code(
            ['\n    int dp[100][100];', 'm、n 都不超过 100，开一个 100 × 100 的二维数组就够。`dp[i][j]` 是第 i 行第 j 列。'],
            ['\n    for (int i = 0; i < m; i++) {\n        for (int j = 0; j < n; j++) {\n            dp[i][j] = 1;\n        }\n    }', '两层循环把用到的 m × n 格全填 1。C 的局部数组不会自动初始化，必须自己填。']
          ),
          cpp: code(['\n        vector<vector<int>> dp(m, vector<int>(n, 1));', '要 m 行、每行 n 个 1：外层 vector 有 m 个元素，每个元素都是 `vector<int>(n, 1)` 的一份副本。']),
          java: code(
            ['\n        int[][] dp = new int[m][n];', '`new int[m][n]` 开一个 m 行 n 列的二维数组，每格都是 0。'],
            ['\n        for (int[] row : dp) {\n            java.util.Arrays.fill(row, 1);\n        }', '再把每一行都填成 1。`Arrays.fill` 把一个数组的每个元素设成同一个值；这里只用一次，直接写全名，不另外 import。']
          ),
          rust: code(
            ['\n        let (m, n) = (m as usize, n as usize);', 'm、n 要拿来做下标和定大小，先转成 usize。'],
            ['\n        let mut dp = vec![vec![1; n]; m];', '要 m 行、每行 n 个 1。外层 `vec![…; m]` 会把里面的 `vec![1; n]` 复制 m 份，每份都是独立的。']
          ),
        },
        sayBy: {
          python: [py('如何创建多维列表', 'faq/programming.html#how-do-i-create-a-multidimensional-list', 'The reason is that replicating a list with * doesn\'t create copies, it only creates references to the existing objects.', '原因是用 * 复制列表并不会创建副本，只会创建指向现有对象的引用。')],
          cpp: [cppdoc('vector(size_type n, const T& value)', 'vector.cons', 'Constructs a vector with n copies of value, using the specified allocator.', '用指定的分配器构造一个 vector，里面是 value 的 n 个副本。')],
        },
      },
      {
        section: '写代码',
        title: '每格 = 上面 + 左边',
        say: [
          '第一行、第一列已经是 1 了，从 (1, 1) 开始填。一行一行往下，每行从左往右：这样填到 (i, j) 时，上面和左边都已经算好。',
          { viz: { kind: 'grid', title: '上面 + 左边', frames: trace.paths(3, 7) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, m):\n            for j in range(1, n):', '两层循环：外层一行一行往下，内层每行从左往右。都从 1 开始，跳过第一行和第一列。'],
            ['\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]', '最后一步从上面来，或者从左边来，条数相加。']
          ),
          c: code(
            ['\n    for (int i = 1; i < m; i++) {\n        for (int j = 1; j < n; j++) {', '两层循环：一行一行往下，每行从左往右，都从 1 开始。'],
            ['\n            dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n        }\n    }', '从上面来的条数加上从左边来的条数。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {', '两层循环，都从 1 开始，跳过第一行和第一列。'],
            ['\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n            }\n        }', '从上面来的条数加上从左边来的条数。']
          ),
          java: code(
            ['\n        for (int i = 1; i < m; i++) {\n            for (int j = 1; j < n; j++) {', '两层循环，都从 1 开始，跳过第一行和第一列。'],
            ['\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n            }\n        }', '从上面来的条数加上从左边来的条数。']
          ),
          rust: code(
            ['\n        for i in 1..m {\n            for j in 1..n {', '两层循环，都从 1 开始，跳过第一行和第一列。'],
            ['\n                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n            }\n        }', '从上面来的条数加上从左边来的条数。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案在右下角',
        say: ['终点是右下角 (m-1, n-1)。'],
        ops: {
          python: code(['\n        return dp[m - 1][n - 1]', '右下角就是走到终点的路径条数。']),
          c: code(['\n    return dp[m - 1][n - 1];\n}', '右下角就是走到终点的路径条数。']),
          cpp: code(['\n        return dp[m - 1][n - 1];\n    }\n};', '右下角就是答案。']),
          java: code(['\n        return dp[m - 1][n - 1];\n    }\n}', '右下角就是答案。']),
          rust: code(['\n        dp[m - 1][n - 1]\n    }\n}', '右下角就是答案。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试 10 × 10',
        say: ['预期：28 和 3。再试 10 × 10 的网格：要走 9 步右、9 步下，共 18 步里选 9 步向右，C(18, 9) = 48620。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().uniquePaths(3, 7))\n    print(Solution().uniquePaths(3, 2))\n    print(Solution().uniquePaths(10, 10))', '两个样例和一个 10 × 10。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['28', '3', '48620'] }]),
          c: code(['\n\nint main(void) {\n    printf("%d\\n%d\\n%d\\n", uniquePaths(3, 7), uniquePaths(3, 2), uniquePaths(10, 10));\n    return 0;\n}', '两个样例和一个 10 × 10。']).concat([{ pause: 500 }, { run: RUN.c, output: ['28', '3', '48620'] }]),
          cpp: code(['\n\nint main() {\n    Solution s;\n    cout << s.uniquePaths(3, 7) << endl << s.uniquePaths(3, 2) << endl << s.uniquePaths(10, 10) << endl;\n    return 0;\n}', '建一个对象 `s` 重复用，跑两个样例和一个 10 × 10。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['28', '3', '48620'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();\n        System.out.println(s.uniquePaths(3, 7));\n        System.out.println(s.uniquePaths(3, 2));\n        System.out.println(s.uniquePaths(10, 10));\n    }\n}', '两个样例和一个 10 × 10。']).concat([{ pause: 500 }, { run: RUN.java, output: ['28', '3', '48620'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::unique_paths(3, 7));\n    println!("{}", Solution::unique_paths(3, 2));\n    println!("{}", Solution::unique_paths(10, 10));\n}', '两个样例和一个 10 × 10。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['28', '3', '48620'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '二维网格的转移：最后一步从上面来或从左边来。按行从上到下、每行从左到右填，依赖的格子总是先算好。时间和空间都是 O(m·n)；和杨辉三角 II 一样，也能压成一行。',
          '下一题每个格子有了数字，问的从「几条路」变成「路上的数加起来最小是多少」：加法又换成了 min。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
