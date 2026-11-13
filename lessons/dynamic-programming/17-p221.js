/*
 * 动态规划 · 网格 · 221 最大正方形（中等）
 * dp[i][j] = 以 (i, j) 为右下角的最大正方形边长 = min(上, 左, 左上) + 1。表外垫一圈 0 省掉边界判断。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  const M1 = ['10100', '10111', '11111', '10010'];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-221',
    group: '网格',
    label: '221',
    title: '最大正方形',
    summary: '以 (i, j) 为右下角的最大正方形，边长受上、左、左上三个方向里最短的那个限制。',
    problem: { id: 221, level: 'medium', url: leetcode('maximal-square') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '在一个由 `\'0\'` 和 `\'1\'` 组成的二维矩阵内，找到只包含 `\'1\'` 的最大正方形，并返回其面积。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]`', '`4`'],
                ['`[["0","1"],["1","0"]]`', '`1`'],
                ['`[["0"]]`', '`0`'],
              ],
            },
          },
          { list: ['`1 <= m, n <= 300`', '`matrix[i][j]` 为 `\'0\'` 或 `\'1\'`'] },
          '<a href="' + leetcode('maximal-square') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：以它为右下角',
        doc: [
          '正方形可能在任何位置。和「子数组」那几题一样，先把位置固定下来：**`dp[i][j]` 表示以 (i, j) 为右下角、全是 1 的最大正方形的边长**。答案是整张表里最大的边长，再平方。',
          '如果 (i, j) 是 0，以它为右下角什么都拼不出来，`dp[i][j] = 0`。如果是 1，看它的三个邻居：上方 `dp[i-1][j]`、左方 `dp[i][j-1]`、左上 `dp[i-1][j-1]`。',
          '想要以 (i, j) 为右下角拼出边长 k 的正方形，这三个方向都得能撑起边长 k - 1 的正方形：缺了哪一个方向，大正方形就缺一块。所以边长受**最短的那个**限制：',
          '`dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1`',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.square(M1.map((r) => r.split(''))) } },
          '第一行、第一列的格子缺邻居，要单独判断。省事的做法是让表比矩阵**多一行一列**：`dp[i+1][j+1]` 对应矩阵的 (i, j)，最上面一行和最左边一列全是 0，就当作矩阵外面垫了一圈 0。这样所有格子都能用同一个公式。',
          '时间 O(m·n)，额外空间 O(m·n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和多一圈的表',
        say: ['函数收一个字符矩阵，返回面积。先开一张比矩阵多一行一列、全是 0 的表，再准备一个 best 记最大边长。'],
        ops: {
          python: code(
            ['class Solution:\n    def maximalSquare(self, matrix: list[list[str]]) -> int:', '照例写类和方法。矩阵里的元素是字符串 `"0"` 和 `"1"`。'],
            ['\n        m, n = len(matrix), len(matrix[0])', '取出行数和列数。'],
            ['\n        dp = [[0] * (n + 1) for _ in range(m + 1)]', '多一行一列，全是 0：最上面一行、最左边一列就是垫在外面的那圈 0。'],
            ['\n        best = 0', '目前见过的最大边长，矩阵全是 0 时就是 0。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint maximalSquare(char** matrix, int matrixSize, int* matrixColSize) {', '力扣的 C 签名：矩阵是字符的行指针数组，外加行数和每行的列数。'],
            ['\n    int m = matrixSize, n = matrixColSize[0];', '取出行数和列数。'],
            ['\n    int dp[301][301] = {0};', 'm、n 不超过 300，多一行一列开 301 × 301。`= {0}` 把整个数组清零：只写了第一个元素，其余的会自动补 0。'],
            ['\n    int best = 0;', '目前见过的最大边长。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maximalSquare(vector<vector<char>>& matrix) {', '照例的架子，矩阵是 `vector<vector<char>>`。测试时要用字符串造矩阵，顺便引入 `string`。'],
            ['\n        int m = matrix.size(), n = matrix[0].size();', '取出行数和列数。'],
            ['\n        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));', '多一行一列，全是 0。'],
            ['\n        int best = 0;', '目前见过的最大边长。']
          ),
          java: code(
            ['class Solution {\n    public int maximalSquare(char[][] matrix) {', '照例的架子，矩阵是 `char[][]`。'],
            ['\n        int m = matrix.length, n = matrix[0].length;', '取出行数和列数。'],
            ['\n        int[][] dp = new int[m + 1][n + 1];', '多一行一列，新建的 int 数组本来就全是 0。'],
            ['\n        int best = 0;', '目前见过的最大边长。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn maximal_square(matrix: Vec<Vec<char>>) -> i32 {', '照例的架子，矩阵是 `Vec<Vec<char>>`。'],
            ['\n        let (m, n) = (matrix.len(), matrix[0].len());', '取出行数和列数。'],
            ['\n        let mut dp = vec![vec![0; n + 1]; m + 1];', '多一行一列，全是 0。'],
            ['\n        let mut best = 0;', '目前见过的最大边长。']
          ),
        },
      },
      {
        section: '写代码',
        title: '是 1 的格子：三个邻居取最短，加一',
        say: [
          '逐格看矩阵。是 0 的格子什么都不用做，表里本来就是 0。是 1 的格子，取上、左、左上三个邻居里最小的，加一；顺手更新 best。注意下标：矩阵的 (i, j) 对应表里的 (i+1, j+1)。',
          { viz: { kind: 'grid', title: '三个邻居取最短', frames: trace.square(M1.map((r) => r.split(''))) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(m):\n            for j in range(n):', '逐格看矩阵，按行从上到下、每行从左到右，保证三个邻居都先算好。'],
            ['\n                if matrix[i][j] == "1":', '只有 1 的格子才可能当右下角。是 0 就跳过，表里留着 0。注意比较的是字符串 `"1"`，不是数字 1。'],
            ['\n                    dp[i + 1][j + 1] = min(dp[i][j + 1], dp[i + 1][j], dp[i][j]) + 1', '矩阵的 (i, j) 在表里是 (i+1, j+1)，它的上、左、左上就是 (i, j+1)、(i+1, j)、(i, j)。三个里最短的加一。`min` 可以一次比三个。'],
            ['\n                    best = max(best, dp[i + 1][j + 1])', '更新最大边长。']
          ),
          c: code(
            ['\n    for (int i = 0; i < m; i++) {\n        for (int j = 0; j < n; j++) {', '逐格看矩阵，按行从上到下、每行从左到右。'],
            ['\n            if (matrix[i][j] == \'1\') {', '只有 1 的格子才可能当右下角。比较的是字符 `\'1\'`。'],
            ['\n                int up = dp[i][j + 1], left = dp[i + 1][j], diag = dp[i][j];', '取出表里的三个邻居：矩阵 (i, j) 在表里是 (i+1, j+1)，上、左、左上分别是这三格。'],
            ['\n                int lo = up < left ? up : left;\n                if (diag < lo) {\n                    lo = diag;\n                }', '三个里找最小：先比上和左，再和左上比。'],
            ['\n                dp[i + 1][j + 1] = lo + 1;\n                if (dp[i + 1][j + 1] > best) {\n                    best = dp[i + 1][j + 1];\n                }\n            }\n        }\n    }', '最短的加一，就是以这格为右下角的最大边长；顺手更新 best。']
          ),
          cpp: code(
            ['\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {', '逐格看矩阵。'],
            ['\n                if (matrix[i][j] == \'1\') {', '只有 1 的格子才可能当右下角。'],
            ['\n                    dp[i + 1][j + 1] = min({dp[i][j + 1], dp[i + 1][j], dp[i][j]}) + 1;', '上、左、左上三个邻居里最短的加一。`min({…})` 一次比三个。'],
            ['\n                    best = max(best, dp[i + 1][j + 1]);\n                }\n            }\n        }', '更新最大边长。']
          ),
          java: code(
            ['\n        for (int i = 0; i < m; i++) {\n            for (int j = 0; j < n; j++) {', '逐格看矩阵。'],
            ['\n                if (matrix[i][j] == \'1\') {', '只有 1 的格子才可能当右下角。'],
            ['\n                    dp[i + 1][j + 1] = Math.min(Math.min(dp[i][j + 1], dp[i + 1][j]), dp[i][j]) + 1;', '上、左、左上三个邻居里最短的加一。`Math.min` 一次比两个，套两层。'],
            ['\n                    best = Math.max(best, dp[i + 1][j + 1]);\n                }\n            }\n        }', '更新最大边长。']
          ),
          rust: code(
            ['\n        for i in 0..m {\n            for j in 0..n {', '逐格看矩阵。'],
            ['\n                if matrix[i][j] == \'1\' {', '只有 1 的格子才可能当右下角。Rust 的字符字面量用单引号。'],
            ['\n                    dp[i + 1][j + 1] = dp[i][j + 1].min(dp[i + 1][j]).min(dp[i][j]) + 1;', '上、左、左上三个邻居里最短的加一，链式调用两次 `min`。'],
            ['\n                    best = best.max(dp[i + 1][j + 1]);\n                }\n            }\n        }', '更新最大边长。']
          ),
        },
      },
      {
        section: '写代码',
        title: '返回面积',
        say: ['题目要的是面积，最大边长平方一下。'],
        ops: {
          python: code(['\n        return best * best', '面积是边长的平方。']),
          c: code(['\n    return best * best;\n}', '面积是边长的平方。']),
          cpp: code(['\n        return best * best;\n    }\n};', '面积是边长的平方。']),
          java: code(['\n        return best * best;\n    }\n}', '面积是边长的平方。']),
          rust: code(['\n        best * best\n    }\n}', '面积是边长的平方。best 的类型从这里的返回类型推断成 i32。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：4、1、0。矩阵用一行行的字符串写起来最方便，各语言先把字符串拆成字符。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    a = [list("10100"), list("10111"), list("11111"), list("10010")]', '`list("10100")` 把字符串拆成一个个字符：`["1", "0", "1", "0", "0"]`，正好是题目要的一行。'],
            ['\n    print(Solution().maximalSquare(a))\n    print(Solution().maximalSquare([list("01"), list("10")]))\n    print(Solution().maximalSquare([list("0")]))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['4', '1', '0'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    char a0[] = "10100", a1[] = "10111", a2[] = "11111", a3[] = "10010";\n    char* a[] = {a0, a1, a2, a3};', 'C 的字符串本来就是字符数组，每一行直接写成字符串，再把它们放进行指针数组。'],
            ['\n    int cols[] = {5, 5, 5, 5};\n    printf("%d\\n", maximalSquare(a, 4, cols));', '4 行 5 列。'],
            ['\n    char b0[] = "01", b1[] = "10", c0[] = "0";\n    char* b[] = {b0, b1};\n    char* c[] = {c0};\n    int bc[] = {2, 2}, cc[] = {1};', '另外两个样例。'],
            ['\n    printf("%d\\n%d\\n", maximalSquare(b, 2, bc), maximalSquare(c, 1, cc));\n    return 0;\n}', '打印另外两个结果。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['4', '1', '0'] }]),
          cpp: code(
            ['\n\nvector<vector<char>> toMatrix(vector<string> rows) {\n    vector<vector<char>> m;', '写一个小工具：把几行字符串变成字符矩阵，测试时就不用一个个写字符了。'],
            ['\n    for (auto& s : rows) {\n        m.push_back(vector<char>(s.begin(), s.end()));\n    }\n    return m;\n}', '每个字符串用它的开头和结尾构造一个 `vector<char>`，就是一行。'],
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<vector<char>> a = toMatrix({"10100", "10111", "11111", "10010"}), b = toMatrix({"01", "10"}), c = toMatrix({"0"});\n    cout << Solution().maximalSquare(a) << endl << Solution().maximalSquare(b) << endl << Solution().maximalSquare(c) << endl;\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['4', '1', '0'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        char[][] a = {"10100".toCharArray(), "10111".toCharArray(), "11111".toCharArray(), "10010".toCharArray()};', '`toCharArray()` 把字符串变成字符数组，正好是一行。'],
            ['\n        System.out.println(new Solution().maximalSquare(a));\n        System.out.println(new Solution().maximalSquare(new char[][]{"01".toCharArray(), "10".toCharArray()}));\n        System.out.println(new Solution().maximalSquare(new char[][]{"0".toCharArray()}));\n    }\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['4', '1', '0'] }]),
          rust: code(
            ['\n\nfn to_matrix(rows: &[&str]) -> Vec<Vec<char>> {\n    rows.iter().map(|r| r.chars().collect()).collect()\n}', '写一个小工具：把几行字符串变成字符矩阵。`r.chars().collect()` 把一行拆成字符收集成 Vec，外层再把每行收集起来。'],
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{}", Solution::maximal_square(to_matrix(&["10100", "10111", "11111", "10010"])));\n    println!("{}", Solution::maximal_square(to_matrix(&["01", "10"])));\n    println!("{}", Solution::maximal_square(to_matrix(&["0"])));\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['4', '1', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '网格写完了',
        say: [
          '「以 (i, j) 为右下角」把位置固定下来，转移只看三个邻居；表外垫一圈 0，边界就不用单独判断了。时间和空间都是 O(m·n)。',
          '网格子模块的表都和题目的网格一一对应。下一个子模块「背包」的表不再是现成的格子：下标是「凑出的金额」或「凑出的和」，要自己想出来。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
