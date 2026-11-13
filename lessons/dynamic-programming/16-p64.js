/*
 * 动态规划 · 网格 · 64 最小路径和（中等）
 * 和不同路径同一个形状：每格 = 自己的数 + min(上面, 左边)。第一行、第一列只有一条来路。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  const GRID = [[1, 3, 1], [1, 5, 1], [4, 2, 1]];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-64',
    group: '网格',
    label: '64',
    title: '最小路径和',
    summary: '每格 = 自己的数 + min(上面, 左边)。第一行、第一列只有一条来路，要单独处理。',
    problem: { id: 64, level: 'medium', url: leetcode('minimum-path-sum') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个包含非负整数的 `m x n` 网格 `grid`，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。说明：每次只能向下或者向右移动一步。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[[1,3,1],[1,5,1],[4,2,1]]`', '`7`', '1 → 3 → 1 → 1 → 1'],
                ['`[[1,2,3],[4,5,6]]`', '`12`', '1 → 2 → 3 → 6'],
              ],
            },
          },
          { list: ['`1 <= m, n <= 200`', '`0 <= grid[i][j] <= 200`'] },
          '<a href="' + leetcode('minimum-path-sum') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '和上一题同一个形状：走到 (i, j) 的最后一步从上面或左边来。上一题数条数，两边相加；这题求最小和，两边取小的，再加上这格自己的数：',
          {
            table: {
              head: ['', '最小路径和'],
              rows: [
                ['状态', '`dp[i][j]`：从左上角走到 (i, j)，路上的数加起来最小是多少（包括这格自己）'],
                ['转移', '`dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]`'],
                ['初始值', '`dp[0][0] = grid[0][0]`；第一行只能从左边来，第一列只能从上面来'],
                ['顺序与答案', '按行从上到下、每行从左到右；答案是右下角'],
              ],
            },
          },
          '第一行、第一列不能再整片填 1 了：它们的值要沿着唯一的来路累加。所以循环里分四种情况：起点、第一行、第一列、其余格子。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.minPath(GRID) } },
          '时间 O(m·n)，额外空间 O(m·n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，取出行数和列数',
        say: ['函数收一个二维网格，返回最小和。先取出行数 m 和列数 n，开一张和网格一样大的表。'],
        ops: {
          python: code(
            ['class Solution:\n    def minPathSum(self, grid: list[list[int]]) -> int:', '照例写类和方法：收二维列表，返回整数。'],
            ['\n        m, n = len(grid), len(grid[0])', '行数是外层列表的长度，列数是第一行的长度。'],
            ['\n        dp = [[0] * n for _ in range(m)]', '和网格一样大的表，每行单独新造，先填 0 占位。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint minPathSum(int** grid, int gridSize, int* gridColSize) {', '力扣的 C 签名：网格是行指针数组，`gridSize` 是行数，`gridColSize` 是每行的列数。'],
            ['\n    int m = gridSize, n = gridColSize[0];', '取出行数和列数，每行一样长，看第一行就行。'],
            ['\n    int dp[200][200];', 'm、n 都不超过 200，开 200 × 200 的表。下面每格都会写到，不用先初始化。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minPathSum(vector<vector<int>>& grid) {', '照例的架子，网格是 `vector<vector<int>>`。'],
            ['\n        int m = grid.size(), n = grid[0].size();', '取出行数和列数。'],
            ['\n        vector<vector<int>> dp(m, vector<int>(n));', '和网格一样大的表。']
          ),
          java: code(
            ['class Solution {\n    public int minPathSum(int[][] grid) {', '照例的架子，网格是二维数组。'],
            ['\n        int m = grid.length, n = grid[0].length;', '取出行数和列数。'],
            ['\n        int[][] dp = new int[m][n];', '和网格一样大的表。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn min_path_sum(grid: Vec<Vec<i32>>) -> i32 {', '照例的架子，网格是 `Vec<Vec<i32>>`。'],
            ['\n        let (m, n) = (grid.len(), grid[0].len());', '取出行数和列数，`len()` 返回的就是 usize。'],
            ['\n        let mut dp = vec![vec![0; n]; m];', '和网格一样大的表。']
          ),
        },
      },
      {
        section: '写代码',
        title: '四种格子，各有来路',
        say: [
          '逐格填表。起点只有自己；第一行的格子只能从左边来；第一列的格子只能从上面来；其余的格子两条来路取小的。四种情况都要加上这格自己的数。',
          { viz: { kind: 'grid', title: '取小的那条来路', frames: trace.minPath(GRID) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(m):\n            for j in range(n):', '这次第一行、第一列也要在循环里算，所以两层循环都从 0 开始。'],
            ['\n                if i == 0 and j == 0:\n                    dp[i][j] = grid[0][0]', '起点：路上只有它自己。'],
            ['\n                elif i == 0:\n                    dp[i][j] = dp[i][j - 1] + grid[i][j]', '第一行：上面没有格子，只能从左边来。'],
            ['\n                elif j == 0:\n                    dp[i][j] = dp[i - 1][j] + grid[i][j]', '第一列：左边没有格子，只能从上面来。'],
            ['\n                else:\n                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j]', '其余格子：从上面来和从左边来，取小的，再加上这格自己。']
          ),
          c: code(
            ['\n    for (int i = 0; i < m; i++) {\n        for (int j = 0; j < n; j++) {', '两层循环都从 0 开始，第一行、第一列也在循环里算。'],
            ['\n            if (i == 0 && j == 0) {\n                dp[i][j] = grid[0][0];', '起点：路上只有它自己。'],
            ['\n            } else if (i == 0) {\n                dp[i][j] = dp[i][j - 1] + grid[i][j];', '第一行：只能从左边来。'],
            ['\n            } else if (j == 0) {\n                dp[i][j] = dp[i - 1][j] + grid[i][j];', '第一列：只能从上面来。'],
            ['\n            } else {\n                int up = dp[i - 1][j], left = dp[i][j - 1];\n                dp[i][j] = (up < left ? up : left) + grid[i][j];\n            }\n        }\n    }', '其余格子：上面和左边取小的，再加上这格自己。']
          ),
          cpp: code(
            ['\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {', '两层循环都从 0 开始。'],
            ['\n                if (i == 0 && j == 0) {\n                    dp[i][j] = grid[0][0];', '起点：只有它自己。'],
            ['\n                } else if (i == 0) {\n                    dp[i][j] = dp[i][j - 1] + grid[i][j];', '第一行：只能从左边来。'],
            ['\n                } else if (j == 0) {\n                    dp[i][j] = dp[i - 1][j] + grid[i][j];', '第一列：只能从上面来。'],
            ['\n                } else {\n                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];\n                }\n            }\n        }', '其余格子：上面和左边取小的，再加上这格自己。']
          ),
          java: code(
            ['\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {', '两层循环都从 0 开始。'],
            ['\n                if (i == 0 && j == 0) {\n                    dp[i][j] = grid[0][0];', '起点：只有它自己。'],
            ['\n                } else if (i == 0) {\n                    dp[i][j] = dp[i][j - 1] + grid[i][j];', '第一行：只能从左边来。'],
            ['\n                } else if (j == 0) {\n                    dp[i][j] = dp[i - 1][j] + grid[i][j];', '第一列：只能从上面来。'],
            ['\n                } else {\n                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1]) + grid[i][j];\n                }\n            }\n        }', '其余格子：上面和左边取小的，再加上这格自己。']
          ),
          rust: code(
            ['\n        for i in 0..m {\n            for j in 0..n {', '两层循环都从 0 开始。'],
            ['\n                dp[i][j] = grid[i][j] + if i == 0 && j == 0 {\n                    0', '四种情况都要加上这格自己的数，那就把它提到前面，后面用 `if` 表达式选出「来路上的最小和」。Rust 的 `if` 能当值用。起点没有来路，加 0。'],
            ['\n                } else if i == 0 {\n                    dp[i][j - 1]', '第一行：只能从左边来。'],
            ['\n                } else if j == 0 {\n                    dp[i - 1][j]', '第一列：只能从上面来。'],
            ['\n                } else {\n                    dp[i - 1][j].min(dp[i][j - 1])\n                };\n            }\n        }', '其余格子：上面和左边取小的。整个 `if` 表达式的值加上 grid[i][j]，就是这一格。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案在右下角',
        say: ['右下角就是走到终点的最小路径和。'],
        ops: {
          python: code(['\n        return dp[m - 1][n - 1]', '右下角就是答案。']),
          c: code(['\n    return dp[m - 1][n - 1];\n}', '右下角就是答案。']),
          cpp: code(['\n        return dp[m - 1][n - 1];\n    }\n};', '右下角就是答案。']),
          java: code(['\n        return dp[m - 1][n - 1];\n    }\n}', '右下角就是答案。']),
          rust: code(['\n        dp[m - 1][n - 1]\n    }\n}', '右下角就是答案。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：7 和 12。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().minPathSum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))\n    print(Solution().minPathSum([[1, 2, 3], [4, 5, 6]]))', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['7', '12'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int r0[] = {1, 3, 1}, r1[] = {1, 5, 1}, r2[] = {4, 2, 1};\n    int* g[] = {r0, r1, r2};', '函数要的是「行指针数组」，所以先把每一行写成一个数组，再把它们的首地址放进 `g`。'],
            ['\n    int cols[] = {3, 3, 3};\n    printf("%d\\n", minPathSum(g, 3, cols));', '每行 3 列，一共 3 行。'],
            ['\n    int s0[] = {1, 2, 3}, s1[] = {4, 5, 6};\n    int* h[] = {s0, s1};\n    printf("%d\\n", minPathSum(h, 2, cols));\n    return 0;\n}', '第二个样例 2 行 3 列，列数数组可以接着用。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['7', '12'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<vector<int>> a = {{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}, b = {{1, 2, 3}, {4, 5, 6}};\n    cout << Solution().minPathSum(a) << endl << Solution().minPathSum(b) << endl;\n    return 0;\n}', '二维 vector 可以用嵌套的花括号直接写出来。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['7', '12'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        System.out.println(new Solution().minPathSum(new int[][]{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}));\n        System.out.println(new Solution().minPathSum(new int[][]{{1, 2, 3}, {4, 5, 6}}));\n    }\n}', '`new int[][]{…}` 用嵌套的花括号当场造一个二维数组。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['7', '12'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{}", Solution::min_path_sum(vec![vec![1, 3, 1], vec![1, 5, 1], vec![4, 2, 1]]));\n    println!("{}", Solution::min_path_sum(vec![vec![1, 2, 3], vec![4, 5, 6]]));\n}', '`vec!` 里面再套 `vec!`，就是二维的 Vec。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['7', '12'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '还是「上面或左边」，求最小和就取 min 再加自己。边界（第一行、第一列）只有一条来路，要单独处理。时间和空间都是 O(m·n)。',
          '下一题「最大正方形」每格要看三个邻居：上、左、左上。我们会用一个小技巧——表外面多垫一圈 0——把边界的判断省掉。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
