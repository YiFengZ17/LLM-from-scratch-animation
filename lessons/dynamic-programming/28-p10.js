/*
 * 动态规划 · 子序列与字符串 · 10 正则表达式匹配（困难）
 * dp[i][j]：s 前 i 个字符能否被 p 前 j 个字符匹配。p 的最后一个是 * 时，分「用 0 次」和「再吃一个字符」。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-10',
    group: '子序列与字符串',
    label: '10',
    title: '正则表达式匹配',
    summary: '两个字符串的表。p 的最后一个是 * 时：x* 一次都不用（看左边两格），或者再吃掉 s 的一个字符（看上面一格）。',
    problem: { id: 10, level: 'hard', url: leetcode('regular-expression-matching') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个字符串 `s` 和一个字符规律 `p`，请你来实现一个支持 `\'.\'` 和 `\'*\'` 的正则表达式匹配：`\'.\'` 匹配任意单个字符；`\'*\'` 匹配零个或多个前面的那一个元素。所谓匹配，是要涵盖**整个**字符串 `s`，而不是部分字符串。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "aa"`, `p = "a"`', '`false`', '"a" 无法匹配整个 "aa"'],
                ['`s = "aa"`, `p = "a*"`', '`true`', 'a* 匹配两个 a'],
                ['`s = "ab"`, `p = ".*"`', '`true`', '.* 匹配任意个任意字符'],
              ],
            },
          },
          { list: ['`1 <= s.length <= 20`', '`1 <= p.length <= 20`', '`s` 只包含小写字母', '`p` 只包含小写字母，以及字符 `.` 和 `*`', '保证每次出现字符 `*` 时，前面都匹配到有效的字符'] },
          '<a href="' + leetcode('regular-expression-matching') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：看模式的最后一个字符',
        doc: [
          '两个字符串，用前缀当状态：**`dp[i][j]` 表示 s 的前 i 个字符能不能被 p 的前 j 个字符完整匹配**。先约定「对得上」：模式字符是 `.`，或者和 s 的字符相同。',
          '看 p 的最后一个字符 `p[j-1]`：',
          {
            list: [
              '**不是 `*`**：它只能匹配一个字符，必须和 s 的最后一个 `s[i-1]` 对得上，剩下两边各去掉一个：`dp[i][j] = 对得上 and dp[i-1][j-1]`。',
              '**是 `*`**：它和前面的 `x = p[j-2]` 合起来是 `x*`，有两种用法，任一种成立就行：',
            ],
          },
          {
            list: [
              '**用 0 次**：把 `x*` 整个扔掉：`dp[i][j-2]`（左边两格）。',
              '**再吃一个**：x 和 `s[i-1]` 对得上，就让 `x*` 吃掉 s 的最后一个字符，`x*` 本身还留着，下次还能接着吃：`dp[i-1][j]`（上面一格）。',
            ],
          },
          '初始值：`dp[0][0] = true`（空串匹配空模式）。第 0 行（s 是空串）不全是 false：像 `a*b*` 这样的模式能把每个 `x*` 都用 0 次，匹配空串。所以 i 要从 **0** 开始算，j 从 1 开始。',
          { viz: { kind: 'grid', title: 's = "aab"，p = "c*a*b"', frames: trace.regex('aab', 'c*a*b') } },
          '表有 (m+1) × (n+1) 格，时间和空间都是 O(m·n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和 dp[0][0] = true',
        say: ['函数收字符串和模式，返回能不能完整匹配。开 (m+1) × (n+1) 的布尔表，只有 dp[0][0] 是真。'],
        ops: {
          python: code(
            ['class Solution:\n    def isMatch(self, s: str, p: str) -> bool:', '照例写类和方法。'],
            ['\n        m, n = len(s), len(p)\n        dp = [[False] * (n + 1) for _ in range(m + 1)]\n        dp[0][0] = True', '(m+1) × (n+1) 的布尔表，空串匹配空模式。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n\nbool isMatch(char* s, char* p) {', '题目给的函数。'],
            ['\n    int m = strlen(s), n = strlen(p);\n    bool dp[21][21] = {{false}};\n    dp[0][0] = true;', '两个长度都不超过 20，开 21 × 21，全清成 false。二维数组的初始值写成两层花括号。空串匹配空模式。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isMatch(string s, string p) {', '照例的架子。'],
            ['\n        int m = s.size(), n = p.size();\n        vector<vector<bool>> dp(m + 1, vector<bool>(n + 1, false));\n        dp[0][0] = true;', '(m+1) × (n+1) 的布尔表，空串匹配空模式。']
          ),
          java: code(
            ['class Solution {\n    public boolean isMatch(String s, String p) {', '照例的架子。'],
            ['\n        int m = s.length(), n = p.length();\n        boolean[][] dp = new boolean[m + 1][n + 1];\n        dp[0][0] = true;', '(m+1) × (n+1) 的布尔表，空串匹配空模式。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn is_match(s: String, p: String) -> bool {', '照例的架子。'],
            ['\n        let (s, p) = (s.as_bytes(), p.as_bytes());\n        let (m, n) = (s.len(), p.len());\n        let mut dp = vec![vec![false; n + 1]; m + 1];\n        dp[0][0] = true;', '两个字符串都转成字节数组（同名遮蔽），开表，空串匹配空模式。']
          ),
        },
      },
      {
        section: '写代码',
        title: '先写「对得上」，再按最后一个字符分情况',
        say: [
          '「s 的第 i 个字符和模式字符 c 对得上」要用好几次，先写成一个小函数：i 不能是 0（空串没有字符），并且 c 是 . 或者和 s[i-1] 相同。然后两层循环，i 从 0 开始。',
          { viz: { kind: 'grid', title: '* 的两种用法', frames: trace.regex('aab', 'c*a*b') } },
        ],
        ops: {
          python: code(
            ['\n\n        def ok(i, c):\n            return i > 0 and (c == "." or c == s[i - 1])', '在方法里面定义一个小函数：s 的前 i 个字符里最后一个，能不能和模式字符 c 对上。它能直接读到外面的 s。'],
            ['\n\n        for i in range(m + 1):\n            for j in range(1, n + 1):', 'i 从 0 开始：s 是空串时，`a*` 这类模式也可能匹配。j 从 1 开始，空模式那一列只有 dp[0][0] 为真，已经填好了。'],
            ['\n                if p[j - 1] == "*":', '模式的最后一个字符是 *，和前一个字符 p[j - 2] 合起来是 x*。'],
            ['\n                    dp[i][j] = dp[i][j - 2] or (ok(i, p[j - 2]) and dp[i - 1][j])', '用 0 次：扔掉 x*，看 dp[i][j - 2]。再吃一个：x 对得上 s 的最后一个字符，吃掉它，x* 留着，看 dp[i - 1][j]。ok 已经保证 i > 0，所以 i - 1 不会是 -1。'],
            ['\n                else:\n                    dp[i][j] = ok(i, p[j - 1]) and dp[i - 1][j - 1]', '普通字符或 .：必须和 s 的最后一个字符对得上，然后两边各去掉一个。']
          ),
          c: code(
            ['\n    for (int i = 0; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {', 'i 从 0 开始，j 从 1 开始。'],
            ['\n            if (p[j - 1] == \'*\') {', '模式的最后一个字符是 *。'],
            ['\n                bool eat = i > 0 && (p[j - 2] == \'.\' || p[j - 2] == s[i - 1]);', 'x* 能不能再吃掉 s 的最后一个字符：s 不是空串，并且 x 是 . 或者和它相同。'],
            ['\n                dp[i][j] = dp[i][j - 2] || (eat && dp[i - 1][j]);', '用 0 次看左边两格；再吃一个看上面一格。'],
            ['\n            } else {\n                bool same = i > 0 && (p[j - 1] == \'.\' || p[j - 1] == s[i - 1]);\n                dp[i][j] = same && dp[i - 1][j - 1];\n            }\n        }\n    }', '普通字符或 .：对得上，再看两边各去掉一个。']
          ),
          cpp: code(
            ['\n        auto ok = [&](int i, char c) {\n            return i > 0 && (c == \'.\' || c == s[i - 1]);\n        };', '写一个 lambda（匿名函数）判断对不对得上。`[&]` 表示它可以直接用外面的变量，比如 s。'],
            ['\n        for (int i = 0; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {', 'i 从 0 开始，j 从 1 开始。'],
            ['\n                if (p[j - 1] == \'*\') {\n                    dp[i][j] = dp[i][j - 2] || (ok(i, p[j - 2]) && dp[i - 1][j]);', '是 *：用 0 次看左边两格；再吃一个看上面一格。'],
            ['\n                } else {\n                    dp[i][j] = ok(i, p[j - 1]) && dp[i - 1][j - 1];\n                }\n            }\n        }', '普通字符或 .：对得上，再看左上角。']
          ),
          java: code(
            ['\n        for (int i = 0; i <= m; i++) {\n            for (int j = 1; j <= n; j++) {', 'i 从 0 开始，j 从 1 开始。'],
            ['\n                if (p.charAt(j - 1) == \'*\') {', '模式的最后一个字符是 *。'],
            ['\n                    dp[i][j] = dp[i][j - 2] || (ok(s, i, p.charAt(j - 2)) && dp[i - 1][j]);', '用 0 次看左边两格；再吃一个看上面一格。「对得上」写成下面的一个小方法。'],
            ['\n                } else {\n                    dp[i][j] = ok(s, i, p.charAt(j - 1)) && dp[i - 1][j - 1];\n                }\n            }\n        }', '普通字符或 .：对得上，再看左上角。']
          ),
          rust: code(
            ['\n        let ok = |i: usize, c: u8| i > 0 && (c == b\'.\' || c == s[i - 1]);', '写一个闭包判断对不对得上：参数写在两条竖线之间，它能直接读外面的 s。'],
            ['\n        for i in 0..=m {\n            for j in 1..=n {', 'i 从 0 开始，j 从 1 开始。'],
            ['\n                dp[i][j] = if p[j - 1] == b\'*\' {\n                    dp[i][j - 2] || (ok(i, p[j - 2]) && dp[i - 1][j])', '是 *：用 0 次看左边两格；再吃一个看上面一格。`&&` 左边 ok 不成立时不会去读 dp[i - 1][j]，i = 0 时不会出现 0 - 1。'],
            ['\n                } else {\n                    ok(i, p[j - 1]) && dp[i - 1][j - 1]\n                };\n            }\n        }', '普通字符或 .：对得上，再看左上角。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案在右下角',
        say: ['完整的 s 和完整的 p，就是右下角。'],
        ops: {
          python: code(['\n        return dp[m][n]', '右下角就是答案。']),
          c: code(['\n    return dp[m][n];\n}', '右下角就是答案。']),
          cpp: code(['\n        return dp[m][n];\n    }\n};', '右下角就是答案。']),
          java: code(
            ['\n        return dp[m][n];\n    }', '右下角就是答案。'],
            ['\n\n    private boolean ok(String s, int i, char c) {\n        return i > 0 && (c == \'.\' || c == s.charAt(i - 1));\n    }\n}', '补上刚才用到的小方法：s 的前 i 个字符里最后一个，能不能和模式字符 c 对上。`private` 表示只在这个类里用。']
          ),
          rust: code(['\n        dp[m][n]\n    }\n}', '右下角就是答案。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试演示的那组',
        say: ['预期：false、true、true。再试演示里的 s = "aab"、p = "c*a*b"：c* 用 0 次，a* 吃两个 a，b 对 b，应该是 true。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for s, p in [("aa", "a"), ("aa", "a*"), ("ab", ".*"), ("aab", "c*a*b")]:\n        print(Solution().isMatch(s, p))', '四组输入。`for s, p in …` 每次把一对拆成两个变量。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['False', 'True', 'True', 'True'] }]),
          c: code(
            ['\n\nint main(void) {\n    char* cases[][2] = {{"aa", "a"}, {"aa", "a*"}, {"ab", ".*"}, {"aab", "c*a*b"}};', '写一个入口。四组输入放进一个二维数组，每组两个字符串。'],
            ['\n    for (int k = 0; k < 4; k++) {\n        printf("%s\\n", isMatch(cases[k][0], cases[k][1]) ? "true" : "false");\n    }\n    return 0;\n}', '挨个跑，按 true / false 打印。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['false', 'true', 'true', 'true'] }]),
          cpp: code(
            ['\n\nint main() {\n    vector<pair<string, string>> cases = {{"aa", "a"}, {"aa", "a*"}, {"ab", ".*"}, {"aab", "c*a*b"}};', '写一个入口。`pair` 把两个值绑成一对。'],
            ['\n    cout << boolalpha;\n    for (auto& [s, p] : cases) {\n        cout << Solution().isMatch(s, p) << endl;\n    }\n    return 0;\n}', '`auto& [s, p]` 是结构化绑定，把一对直接拆成两个名字（C++17 起）。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['false', 'true', 'true', 'true'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        String[][] cases = {{"aa", "a"}, {"aa", "a*"}, {"ab", ".*"}, {"aab", "c*a*b"}};', '写一个入口，四组输入放进二维数组。'],
            ['\n        for (String[] c : cases) {\n            System.out.println(new Solution().isMatch(c[0], c[1]));\n        }\n    }\n}', '挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['false', 'true', 'true', 'true'] }]),
          rust: code(
            ['\n\nfn main() {\n    for (s, p) in [("aa", "a"), ("aa", "a*"), ("ab", ".*"), ("aab", "c*a*b")] {\n        println!("{}", Solution::is_match(s.to_string(), p.to_string()));\n    }\n}', '四组输入挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['false', 'true', 'true', 'true'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '子序列与字符串写完了',
        say: [
          '正则匹配和编辑距离、最长公共子序列是同一张表、同一个问法：看两边的最后一个字符。* 号的两种用法分别对应「左边两格」和「上面一格」。时间和空间都是 O(m·n)。',
          '最后一个子模块「区间与计数」：一题数二叉搜索树有几种，一题戳气球，状态是一段区间，要按区间从短到长填。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
