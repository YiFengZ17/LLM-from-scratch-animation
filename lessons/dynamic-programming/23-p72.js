/*
 * 动态规划 · 子序列与字符串 · 72 编辑距离（中等）
 * 和 1143 同一张表：最后一个字符不同时，删除、插入、替换三选一，取最便宜的。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-72',
    group: '子序列与字符串',
    label: '72',
    title: '编辑距离',
    summary: '和最长公共子序列同一张表。最后一个字符相同就不用动；不同就在删除、插入、替换里挑最便宜的。',
    problem: { id: 72, level: 'medium', url: leetcode('edit-distance') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你两个单词 `word1` 和 `word2`，请返回将 `word1` 转换成 `word2` 所使用的最少操作数。你可以对一个单词进行如下三种操作：插入一个字符、删除一个字符、替换一个字符。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"horse"`, `"ros"`', '`3`', 'h 换成 r，删掉 r，删掉 e'],
                ['`"intention"`, `"execution"`', '`5`', ''],
              ],
            },
          },
          { list: ['`0 <= word1.length, word2.length <= 500`', '两个单词都由小写英文字母组成'] },
          '<a href="' + leetcode('edit-distance') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：最后一个字符怎么处理',
        doc: [
          '表和上一题一样：**`dp[i][j]` 是把 word1 的前 i 个字符变成 word2 的前 j 个字符，最少要几步**。',
          '还是看两边的最后一个字符。**相同**：它不用动，`dp[i][j] = dp[i-1][j-1]`。**不同**：总得对它做点什么，三种选择，每种都把问题变小一点：',
          {
            table: {
              head: ['操作', '做完以后剩下的问题', '查哪一格'],
              rows: [
                ['删掉 word1 的最后一个字符', 'word1 前 i-1 个 → word2 前 j 个', '上 `dp[i-1][j]`'],
                ['在 word1 末尾插入 word2 的最后一个字符', '两边的这个字符对上了，剩 word1 前 i 个 → word2 前 j-1 个', '左 `dp[i][j-1]`'],
                ['把 word1 的最后一个替换成 word2 的', '两边各去掉最后一个', '左上 `dp[i-1][j-1]`'],
              ],
            },
          },
          '三者取最小，再加上这一步：`dp[i][j] = min(上, 左, 左上) + 1`。',
          '初始值：把前 i 个字符变成空串，要删 i 次，`dp[i][0] = i`；把空串变成前 j 个字符，要插入 j 次，`dp[0][j] = j`。答案在右下角。',
          { viz: { kind: 'grid', title: '"horse" → "ros"', frames: trace.edit('horse', 'ros') } },
          '时间和空间都是 O(m·n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和第 0 行第 0 列',
        say: ['函数收两个单词，返回最少步数。开 (m+1) × (n+1) 的表，第 0 列是 i（全删掉），第 0 行是 j（全插进来）。'],
        ops: {
          python: code(
            ['class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:', '照例写类和方法。'],
            ['\n        m, n = len(word1), len(word2)\n        dp = [[0] * (n + 1) for _ in range(m + 1)]', '和上一题一样大的表。'],
            ['\n        for i in range(m + 1):\n            dp[i][0] = i', '前 i 个字符变成空串：删 i 次。'],
            ['\n        for j in range(n + 1):\n            dp[0][j] = j', '空串变成前 j 个字符：插入 j 次。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <string.h>\n\nint minDistance(char* word1, char* word2) {', '题目给的函数，要用 `strlen`。'],
            ['\n    int m = strlen(word1), n = strlen(word2);\n    static int dp[501][501];', '长度不超过 500。表约 1 MB，和上一题一样放到静态存储区，用到的格子下面都会重新写。'],
            ['\n    for (int i = 0; i <= m; i++) {\n        dp[i][0] = i;\n    }', '前 i 个字符变成空串：删 i 次。'],
            ['\n    for (int j = 0; j <= n; j++) {\n        dp[0][j] = j;\n    }', '空串变成前 j 个字符：插入 j 次。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minDistance(string word1, string word2) {', '照例的架子。'],
            ['\n        int m = word1.size(), n = word2.size();\n        vector<vector<int>> dp(m + 1, vector<int>(n + 1));', '和上一题一样大的表。'],
            ['\n        for (int i = 0; i <= m; i++) {\n            dp[i][0] = i;\n        }\n        for (int j = 0; j <= n; j++) {\n            dp[0][j] = j;\n        }', '第 0 列：删 i 次；第 0 行：插入 j 次。']
          ),
          java: code(
            ['class Solution {\n    public int minDistance(String word1, String word2) {', '照例的架子。'],
            ['\n        int m = word1.length(), n = word2.length();\n        int[][] dp = new int[m + 1][n + 1];', '和上一题一样大的表。'],
            ['\n        for (int i = 0; i <= m; i++) {\n            dp[i][0] = i;\n        }\n        for (int j = 0; j <= n; j++) {\n            dp[0][j] = j;\n        }', '第 0 列：删 i 次；第 0 行：插入 j 次。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn min_distance(word1: String, word2: String) -> i32 {', '照例的架子。'],
            ['\n        let (a, b) = (word1.as_bytes(), word2.as_bytes());\n        let (m, n) = (a.len(), b.len());\n        let mut dp = vec![vec![0; n + 1]; m + 1];', '转成字节数组好按下标比较，再开表。'],
            ['\n        for i in 0..=m {\n            dp[i][0] = i;\n        }\n        for j in 0..=n {\n            dp[0][j] = j;\n        }', '第 0 列：删 i 次；第 0 行：插入 j 次。表里的数从这里推断成 usize。']
          ),
        },
      },
      {
        section: '写代码',
        title: '相同不动，不同三选一',
        say: [
          '逐格填。最后一个字符相同，照抄左上角；不同，就在上（删除）、左（插入）、左上（替换）里挑最小的，再加这一步。',
          { viz: { kind: 'grid', title: '删除、插入、替换', frames: trace.edit('horse', 'ros') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):', '从 (1, 1) 开始逐格填。'],
            ['\n                if word1[i - 1] == word2[j - 1]:\n                    dp[i][j] = dp[i - 1][j - 1]', '最后一个字符相同：不用动它，剩下的问题是两边各去掉它，就是左上角。'],
            ['\n                else:\n                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1', '不同：删除看上面、插入看左边、替换看左上，挑最便宜的，再加上这一步。']
          ),
          c: code(
            ['\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {', '从 (1, 1) 开始逐格填。'],
            ['\n            if (word1[i - 1] == word2[j - 1]) {\n                dp[i][j] = dp[i - 1][j - 1];', '最后一个字符相同：照抄左上角。'],
            ['\n            } else {\n                int lo = dp[i - 1][j] < dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];', '不同：先在删除（上）和插入（左）里挑小的。'],
            ['\n                if (dp[i - 1][j - 1] < lo) {\n                    lo = dp[i - 1][j - 1];\n                }\n                dp[i][j] = lo + 1;\n            }\n        }\n    }', '再和替换（左上）比，最便宜的加上这一步。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {', '从 (1, 1) 开始逐格填。'],
            ['\n                if (word1[i - 1] == word2[j - 1]) {\n                    dp[i][j] = dp[i - 1][j - 1];', '最后一个字符相同：照抄左上角。'],
            ['\n                } else {\n                    dp[i][j] = min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]}) + 1;\n                }\n            }\n        }', '不同：上、左、左上三个里最小的，加上这一步。']
          ),
          java: code(
            ['\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {', '从 (1, 1) 开始逐格填。'],
            ['\n                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1];', '最后一个字符相同：照抄左上角。'],
            ['\n                } else {\n                    dp[i][j] = Math.min(Math.min(dp[i - 1][j], dp[i][j - 1]), dp[i - 1][j - 1]) + 1;\n                }\n            }\n        }', '不同：上、左、左上三个里最小的，加上这一步。']
          ),
          rust: code(
            ['\n        for i in 1..=m {\n            for j in 1..=n {', '从 (1, 1) 开始逐格填。'],
            ['\n                dp[i][j] = if a[i - 1] == b[j - 1] {\n                    dp[i - 1][j - 1]', '最后一个字符相同：照抄左上角。'],
            ['\n                } else {\n                    dp[i - 1][j].min(dp[i][j - 1]).min(dp[i - 1][j - 1]) + 1\n                };\n            }\n        }', '不同：上、左、左上三个里最小的，加上这一步。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案在右下角',
        say: ['把整个 word1 变成整个 word2，就是右下角。'],
        ops: {
          python: code(['\n        return dp[m][n]', '右下角就是答案。']),
          c: code(['\n    return dp[m][n];\n}', '右下角就是答案。']),
          cpp: code(['\n        return dp[m][n];\n    }\n};', '右下角就是答案。']),
          java: code(['\n        return dp[m][n];\n    }\n}', '右下角就是答案。']),
          rust: code(['\n        dp[m][n] as i32\n    }\n}', '表里是 usize，转回 i32 返回。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试空串',
        say: ['预期：3 和 5。再试 word1 为空、word2 是 "abc"：只能插入 3 次，得 3。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().minDistance("horse", "ros"))\n    print(Solution().minDistance("intention", "execution"))\n    print(Solution().minDistance("", "abc"))', '两个样例和一个空串。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '5', '3'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    printf("%d\\n", minDistance("horse", "ros"));\n    printf("%d\\n", minDistance("intention", "execution"));\n    printf("%d\\n", minDistance("", "abc"));\n    return 0;\n}', '两个样例和一个空串。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '5', '3'] }]),
          cpp: code(
            ['\n\nint main() {\n    Solution s;', '写一个入口。'],
            ['\n    cout << s.minDistance("horse", "ros") << endl << s.minDistance("intention", "execution") << endl << s.minDistance("", "abc") << endl;\n    return 0;\n}', '两个样例和一个空串。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '5', '3'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口。'],
            ['\n        System.out.println(s.minDistance("horse", "ros"));\n        System.out.println(s.minDistance("intention", "execution"));\n        System.out.println(s.minDistance("", "abc"));\n    }\n}', '两个样例和一个空串。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '5', '3'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    for (a, b) in [("horse", "ros"), ("intention", "execution"), ("", "abc")] {\n        println!("{}", Solution::min_distance(a.to_string(), b.to_string()));\n    }\n}', '两个样例和一个空串。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '5', '3'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '编辑距离和最长公共子序列共用一张表、一个思路：看两边的最后一个字符。区别只在「不同」时有几种做法、取 max 还是 min。时间和空间都是 O(m·n)。',
          '接下来两题只有一个字符串，但表还是二维的：`dp[i][j]` 表示 s 从第 i 个到第 j 个字符这一段。这种「一段区间」的表，填的顺序要格外小心。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
