/*
 * 动态规划 · 子序列与字符串 · 1143 最长公共子序列（中等）
 * 两个字符串的表：dp[i][j] 是 text1 前 i 个字符和 text2 前 j 个字符的答案。看两边最后一个字符。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { cdoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-1143',
    group: '子序列与字符串',
    label: '1143',
    title: '最长公共子序列',
    summary: '两个字符串各取一段前缀，组成二维表。最后一个字符相同就一起用上，不同就扔掉一边。',
    problem: { id: 1143, level: 'medium', url: leetcode('longest-common-subsequence') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定两个字符串 `text1` 和 `text2`，返回这两个字符串的最长公共子序列的长度。如果不存在公共子序列，返回 0。两个字符串的公共子序列是这两个字符串所共同拥有的子序列。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"abcde"`, `"ace"`', '`3`', '"ace"'],
                ['`"abc"`, `"abc"`', '`3`', '"abc"'],
                ['`"abc"`, `"def"`', '`0`', '没有公共字符'],
              ],
            },
          },
          { list: ['`1 <= text1.length, text2.length <= 1000`', '两个字符串都只由小写英文字母组成'] },
          '<a href="' + leetcode('longest-common-subsequence') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：两边各取一段前缀',
        doc: [
          '有两个字符串，状态就要同时说清楚两边：**`dp[i][j]` 是 text1 的前 i 个字符和 text2 的前 j 个字符的最长公共子序列长度**。i、j 从 0 开始，0 表示空串。',
          '转移盯住两边的**最后一个字符** `text1[i-1]` 和 `text2[j-1]`：',
          {
            list: [
              '**相同**：这个字符可以放进公共子序列的末尾，剩下的是两边各去掉最后一个字符：`dp[i][j] = dp[i-1][j-1] + 1`。',
              '**不同**：它俩不可能都被用上，至少有一个是多余的。扔掉 text1 的最后一个是 `dp[i-1][j]`，扔掉 text2 的是 `dp[i][j-1]`，取大的。',
            ],
          },
          '初始值：任何字符串和空串的公共子序列都是空的，第 0 行、第 0 列全是 0。按行从上到下、每行从左到右填，左上、上、左三格都会先算好。答案是右下角 `dp[m][n]`。',
          { viz: { kind: 'grid', title: '"abcde" 和 "ace"', frames: trace.lcs('abcde', 'ace') } },
          '表有 (m+1) × (n+1) 格，时间和空间都是 O(m·n)。下标用「前 i 个」而不是「第 i 个」，就是为了让第 0 行、第 0 列能表示空串，不用单独处理边界。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和多一行一列的表',
        say: ['函数收两个字符串，返回长度。表比两个字符串的长度各多一：第 0 行、第 0 列代表空串，全是 0。'],
        ops: {
          python: code(
            ['class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:', '照例写类和方法。'],
            ['\n        m, n = len(text1), len(text2)', '两个字符串的长度。'],
            ['\n        dp = [[0] * (n + 1) for _ in range(m + 1)]', '(m+1) 行、(n+1) 列，全是 0。第 0 行、第 0 列就这样定好了。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <string.h>', '要用 `strlen` 求字符串长度，它在 `string.h` 里。'],
            ['\n\nint longestCommonSubsequence(char* text1, char* text2) {', '题目给的函数。'],
            ['\n    int m = strlen(text1), n = strlen(text2);', 'C 的字符串以 `\\0` 结尾，不记长度，用 `strlen` 数出来。'],
            ['\n    static int dp[1001][1001];', '最大 1001 × 1001 个 int，大约 4 MB。函数里的普通局部变量放在栈上，栈一般只有几 MB，可能装不下；加 `static` 让它放到静态存储区。代价是它在多次调用之间共用，所以下面要把用到的格子都重新写一遍。'],
            ['\n    for (int i = 0; i <= m; i++) {\n        dp[i][0] = 0;\n    }\n    for (int j = 0; j <= n; j++) {\n        dp[0][j] = 0;\n    }', '第 0 列和第 0 行代表空串，都是 0。其余格子循环里都会写到。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {', '照例的架子，参数是两个 `string`。'],
            ['\n        int m = text1.size(), n = text2.size();', '两个字符串的长度。'],
            ['\n        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));', '(m+1) 行、(n+1) 列，全是 0。']
          ),
          java: code(
            ['class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {', '照例的架子。'],
            ['\n        int m = text1.length(), n = text2.length();', '两个字符串的长度。Java 的字符串用方法 `length()`，数组用属性 `length`。'],
            ['\n        int[][] dp = new int[m + 1][n + 1];', '(m+1) 行、(n+1) 列，新建时全是 0。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn longest_common_subsequence(text1: String, text2: String) -> i32 {', '照例的架子，参数是两个 `String`。'],
            ['\n        let (a, b) = (text1.as_bytes(), text2.as_bytes());', 'Rust 的字符串不能直接用下标取字符。题目只有小写字母，每个字符正好一个字节，转成字节数组就能按下标比较。'],
            ['\n        let (m, n) = (a.len(), b.len());\n        let mut dp = vec![vec![0; n + 1]; m + 1];', '(m+1) 行、(n+1) 列，全是 0。']
          ),
        },
        sayBy: {
          c: [cdoc('strlen(const char *s)', 'String-Length.html', 'The strlen function returns the length of the string s in bytes.', 'strlen 返回字符串 s 的长度（以字节计）。')],
          rust: [rustdoc('str::as_bytes', 'primitive.str.html#method.as_bytes', 'Converts a string slice to a byte slice.', '把字符串切片转换成字节切片。')],
        },
      },
      {
        section: '写代码',
        title: '看两边的最后一个字符',
        say: [
          '从 (1, 1) 开始逐格填。前 i 个字符的最后一个是下标 i - 1，所以比较的是 `text1[i-1]` 和 `text2[j-1]`。相同就从左上角加一，不同就从上面和左边取大的。',
          { viz: { kind: 'grid', title: '相同走对角，不同取上或左', frames: trace.lcs('abcde', 'ace') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, m + 1):\n            for j in range(1, n + 1):', '两层循环，i、j 都从 1 开始：第 0 行、第 0 列已经是 0 了。'],
            ['\n                if text1[i - 1] == text2[j - 1]:', '前 i 个字符的最后一个是 `text1[i - 1]`，和 text2 前 j 个的最后一个比。'],
            ['\n                    dp[i][j] = dp[i - 1][j - 1] + 1', '相同：这个字符一起放进公共子序列，两边各去掉它，剩下的答案在左上角，再加一。'],
            ['\n                else:\n                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])', '不同：至少有一个用不上。扔掉 text1 的最后一个看上面，扔掉 text2 的看左边，取大的。']
          ),
          c: code(
            ['\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {', '两层循环，i、j 都从 1 开始。'],
            ['\n            if (text1[i - 1] == text2[j - 1]) {\n                dp[i][j] = dp[i - 1][j - 1] + 1;', '最后一个字符相同：一起用上，左上角加一。'],
            ['\n            } else {\n                dp[i][j] = dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];\n            }\n        }\n    }', '不同：扔掉一边，上面和左边取大的。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {', '两层循环，i、j 都从 1 开始。'],
            ['\n                if (text1[i - 1] == text2[j - 1]) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;', '最后一个字符相同：左上角加一。'],
            ['\n                } else {\n                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }', '不同：上面和左边取大的。']
          ),
          java: code(
            ['\n        for (int i = 1; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {', '两层循环，i、j 都从 1 开始。'],
            ['\n                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {\n                    dp[i][j] = dp[i - 1][j - 1] + 1;', '最后一个字符相同：左上角加一。Java 的字符串用 `charAt` 取字符。'],
            ['\n                } else {\n                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n                }\n            }\n        }', '不同：上面和左边取大的。']
          ),
          rust: code(
            ['\n        for i in 1..=m {\n            for j in 1..=n {', '两层循环，i、j 都从 1 开始。'],
            ['\n                dp[i][j] = if a[i - 1] == b[j - 1] {\n                    dp[i - 1][j - 1] + 1', '用 `if` 表达式直接算出这一格。最后一个字符相同：左上角加一。'],
            ['\n                } else {\n                    dp[i - 1][j].max(dp[i][j - 1])\n                };\n            }\n        }', '不同：上面和左边取大的。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案在右下角',
        say: ['两个完整的字符串，就是前 m 个和前 n 个。'],
        ops: {
          python: code(['\n        return dp[m][n]', '右下角就是答案。']),
          c: code(['\n    return dp[m][n];\n}', '右下角就是答案。']),
          cpp: code(['\n        return dp[m][n];\n    }\n};', '右下角就是答案。']),
          java: code(['\n        return dp[m][n];\n    }\n}', '右下角就是答案。']),
          rust: code(['\n        dp[m][n]\n    }\n}', '右下角就是答案。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：3、3、0。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().longestCommonSubsequence("abcde", "ace"))\n    print(Solution().longestCommonSubsequence("abc", "abc"))\n    print(Solution().longestCommonSubsequence("abc", "def"))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '3', '0'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    printf("%d\\n", longestCommonSubsequence("abcde", "ace"));\n    printf("%d\\n", longestCommonSubsequence("abc", "abc"));\n    printf("%d\\n", longestCommonSubsequence("abc", "def"));\n    return 0;\n}', '三个样例，字符串字面量可以直接传给 `char*` 参数（函数里只读不改）。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '3', '0'] }]),
          cpp: code(
            ['\n\nint main() {\n    Solution s;', '写一个入口。'],
            ['\n    cout << s.longestCommonSubsequence("abcde", "ace") << endl;\n    cout << s.longestCommonSubsequence("abc", "abc") << endl;\n    cout << s.longestCommonSubsequence("abc", "def") << endl;\n    return 0;\n}', '三个样例，字符串字面量会自动变成 `string`。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '3', '0'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口。'],
            ['\n        System.out.println(s.longestCommonSubsequence("abcde", "ace"));\n        System.out.println(s.longestCommonSubsequence("abc", "abc"));\n        System.out.println(s.longestCommonSubsequence("abc", "def"));\n    }\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '3', '0'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    for (a, b) in [("abcde", "ace"), ("abc", "abc"), ("abc", "def")] {\n        println!("{}", Solution::longest_common_subsequence(a.to_string(), b.to_string()));\n    }\n}', '三组字符串放进数组挨个跑。函数要的是 `String`，用 `to_string()` 把字面量变成 String。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '3', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '两个字符串的题，状态是「两边各取前缀」，转移看两边的最后一个字符：相同走对角线，不同扔掉一边。第 0 行、第 0 列代表空串。时间和空间都是 O(m·n)。',
          '下一题「编辑距离」用的是完全相同的表，只是最后一个字符不同时，有删除、插入、替换三种做法。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
