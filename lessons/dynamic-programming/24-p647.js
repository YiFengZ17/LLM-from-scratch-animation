/*
 * 动态规划 · 子序列与字符串 · 647 回文子串（中等）
 * 区间表：dp[i][j] 表示 s[i..j] 是不是回文。依赖左下角，所以 i 从大到小、j 从小到大。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-647',
    group: '子序列与字符串',
    label: '647',
    title: '回文子串',
    summary: '一段是回文 ⇔ 两端相同、里面也是回文。表的格子代表一段区间，依赖左下角，所以 i 要倒着走。',
    problem: { id: 647, level: 'medium', url: leetcode('palindromic-substrings') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个字符串 `s`，请你统计并返回这个字符串中**回文子串**的数目。回文字符串是正着读和倒过来读一样的字符串。子字符串是字符串中由连续字符组成的一个序列。具有不同开始位置或结束位置的子串，即使是由相同的字符组成，也会被视作不同的子串。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"abc"`', '`3`', '"a"、"b"、"c"'],
                ['`"aaa"`', '`6`', '三个 "a"、两个 "aa"、一个 "aaa"'],
              ],
            },
          },
          { list: ['`1 <= s.length <= 1000`', '`s` 由小写英文字母组成'] },
          '<a href="' + leetcode('palindromic-substrings') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：一段区间是不是回文',
        doc: [
          '子串由起点 i 和终点 j 决定，一共 n(n+1)/2 个。逐个从两头往中间比，每个要 O(n)，总共 O(n³)，太慢。',
          '注意到：**`s[i..j]` 是回文，当且仅当两端 `s[i] == s[j]`，并且里面的 `s[i+1..j-1]` 也是回文。** 里面那段的答案，算过就别再算——这就是动态规划。',
          {
            table: {
              head: ['', '回文子串'],
              rows: [
                ['状态', '`dp[i][j]`：`s[i..j]`（包括两端）是不是回文，只用 i ≤ j 的那一半'],
                ['转移', '`dp[i][j] = s[i] == s[j] and (j - i < 2 or dp[i+1][j-1])`'],
                ['初始值', '长度 1、2 的段没有「里面」：只看两端是否相同，转移里的 `j - i < 2` 已经包含了'],
                ['顺序与答案', '见下；答案是 true 的格子个数'],
              ],
            },
          },
          '**填的顺序**是这道题的关键。`dp[i][j]` 依赖 `dp[i+1][j-1]`，在它的**左下方**：行号更大、列号更小。所以行要**从下往上**（i 从 n-1 减到 0），每行里列从左往右（j 从 i 加到 n-1）。这样算到 (i, j) 时，下面一行早就填好了。',
          { viz: { kind: 'grid', title: '"aaa"', frames: trace.pal('aaa') } },
          '表有 n² 格，时间和空间都是 O(n²)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，一张布尔表和计数器',
        say: ['函数收字符串，返回回文子串的个数。开一张 n × n 的布尔表，再准备一个计数器。'],
        ops: {
          python: code(
            ['class Solution:\n    def countSubstrings(self, s: str) -> int:', '照例写类和方法。'],
            ['\n        n = len(s)\n        dp = [[False] * n for _ in range(n)]', 'n × n 的布尔表，先全是 False。'],
            ['\n        count = 0', '回文子串的个数。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n\nint countSubstrings(char* s) {', '要用 `bool` 和 `strlen`。'],
            ['\n    int n = strlen(s);\n    static bool dp[1000][1000];', 'n 不超过 1000，表有一百万格，放到静态存储区。下面用到的每一格都会重新写，不受上次调用的影响。'],
            ['\n    int count = 0;', '回文子串的个数。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int countSubstrings(string s) {', '照例的架子。'],
            ['\n        int n = s.size();\n        vector<vector<bool>> dp(n, vector<bool>(n, false));', 'n × n 的布尔表。'],
            ['\n        int count = 0;', '回文子串的个数。']
          ),
          java: code(
            ['class Solution {\n    public int countSubstrings(String s) {', '照例的架子。'],
            ['\n        int n = s.length();\n        boolean[][] dp = new boolean[n][n];', 'n × n 的布尔表，新建时全是 false。'],
            ['\n        int count = 0;', '回文子串的个数。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn count_substrings(s: String) -> i32 {', '照例的架子。'],
            ['\n        let b = s.as_bytes();\n        let n = b.len();\n        let mut dp = vec![vec![false; n]; n];', '转成字节数组，开 n × n 的布尔表。'],
            ['\n        let mut count = 0;', '回文子串的个数。']
          ),
        },
      },
      {
        section: '写代码',
        title: 'i 从下往上，j 从左往右',
        say: [
          '外层 i 倒着走、内层 j 从 i 往右走，保证左下角先算好。每格的判断：两端相同，并且要么这段短到没有「里面」（长度 1 或 2），要么里面那段是回文。是回文就计数。',
          { viz: { kind: 'grid', title: '依赖左下角', frames: trace.pal('aaa') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(n - 1, -1, -1):', 'i 从 n - 1 倒着走到 0：`range(n - 1, -1, -1)` 的右端 -1 取不到，最后一个正好是 0。'],
            ['\n            for j in range(i, n):', 'j 从 i 开始往右，只看 i ≤ j 的那一半。'],
            ['\n                dp[i][j] = s[i] == s[j] and (j - i < 2 or dp[i + 1][j - 1])', '两端相同，并且：长度不超过 2（没有里面），或者里面那段是回文。`or` 左边成立时就不会去看右边，所以 j - i < 2 时不会越界去读 dp[i + 1][j - 1]。'],
            ['\n                if dp[i][j]:\n                    count += 1', '是回文就计数。']
          ),
          c: code(
            ['\n    for (int i = n - 1; i >= 0; i--) {', 'i 从 n - 1 倒着走到 0。'],
            ['\n        for (int j = i; j < n; j++) {', 'j 从 i 开始往右。'],
            ['\n            dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。不是回文时这一格也被写成 false，所以上次调用留下的值不会混进来。'],
            ['\n            if (dp[i][j]) {\n                count++;\n            }\n        }\n    }', '是回文就计数。']
          ),
          cpp: code(
            ['\n        for (int i = n - 1; i >= 0; i--) {', 'i 从 n - 1 倒着走到 0。'],
            ['\n            for (int j = i; j < n; j++) {', 'j 从 i 开始往右。'],
            ['\n                dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if (dp[i][j]) {\n                    count++;\n                }\n            }\n        }', '是回文就计数。']
          ),
          java: code(
            ['\n        for (int i = n - 1; i >= 0; i--) {', 'i 从 n - 1 倒着走到 0。'],
            ['\n            for (int j = i; j < n; j++) {', 'j 从 i 开始往右。'],
            ['\n                dp[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if (dp[i][j]) {\n                    count++;\n                }\n            }\n        }', '是回文就计数。']
          ),
          rust: code(
            ['\n        for i in (0..n).rev() {', 'i 从 n - 1 倒着走到 0。'],
            ['\n            for j in i..n {', 'j 从 i 开始往右。'],
            ['\n                dp[i][j] = b[i] == b[j] && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if dp[i][j] {\n                    count += 1;\n                }\n            }\n        }', '是回文就计数。']
          ),
        },
      },
      {
        section: '写代码',
        title: '返回个数',
        say: ['每个回文子串都数过一次了。'],
        ops: {
          python: code(['\n        return count', '回文子串的总数。']),
          c: code(['\n    return count;\n}', '回文子串的总数。']),
          cpp: code(['\n        return count;\n    }\n};', '回文子串的总数。']),
          java: code(['\n        return count;\n    }\n}', '回文子串的总数。']),
          rust: code(['\n        count\n    }\n}', '回文子串的总数。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试一个',
        say: ['预期：3 和 6。再试 "abba"：4 个单字符、"bb"、"abba"，共 6 个。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for s in ["abc", "aaa", "abba"]:\n        print(Solution().countSubstrings(s))', '三个字符串挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '6', '6'] }]),
          c: code(['\n\nint main(void) {\n    printf("%d\\n%d\\n%d\\n", countSubstrings("abc"), countSubstrings("aaa"), countSubstrings("abba"));\n    return 0;\n}', '三个字符串。']).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '6', '6'] }]),
          cpp: code(['\n\nint main() {\n    for (string s : {"abc", "aaa", "abba"}) {\n        cout << Solution().countSubstrings(s) << endl;\n    }\n    return 0;\n}', '三个字符串挨个跑，每个字面量先变成 `string` 再交给函数。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '6', '6'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (String s : new String[]{"abc", "aaa", "abba"}) {\n            System.out.println(new Solution().countSubstrings(s));\n        }\n    }\n}', '三个字符串挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '6', '6'] }]),
          rust: code(['\n\nfn main() {\n    for s in ["abc", "aaa", "abba"] {\n        println!("{}", Solution::count_substrings(s.to_string()));\n    }\n}', '三个字符串挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '6', '6'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '区间表的格子代表一段 `[i, j]`，转移从更短的里层区间来。填的顺序由依赖的方向决定：依赖左下角，就让 i 从下往上。时间和空间都是 O(n²)。',
          '下一题「最长回文子串」用的是同一张表，只是不数个数，而是记下最长的那一段。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
