/*
 * 动态规划 · 子序列与字符串 · 5 最长回文子串（中等）
 * 和 647 同一张表，记下最长的回文段的起点和长度，最后截出来。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { cdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-5',
    group: '子序列与字符串',
    label: '5',
    title: '最长回文子串',
    summary: '和回文子串同一张表：不数个数，改成记下最长那段的起点和长度，最后把它截出来。',
    problem: { id: 5, level: 'medium', url: leetcode('longest-palindromic-substring') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个字符串 `s`，找到 `s` 中最长的回文子串。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"babad"`', '`"bab"`', '"aba" 同样是符合题意的答案'],
                ['`"cbbd"`', '`"bb"`', ''],
              ],
            },
          },
          { list: ['`1 <= s.length <= 1000`', '`s` 仅由数字和英文字母组成'] },
          '<a href="' + leetcode('longest-palindromic-substring') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '上一题已经能判断每一段 `s[i..j]` 是不是回文，表和填的顺序完全照搬。这题只是把「数个数」换成「记最长」：每遇到一个回文段，就看它的长度 `j - i + 1` 是不是比目前最长的还长，是的话记下起点和长度。最后按起点和长度把子串截出来返回。',
          { viz: { kind: 'grid', title: '"babad"', frames: trace.pal('babad', 'longest') } },
          '样例 1 有两个长度 3 的回文：「bab」和「aba」，题目说哪个都对。我们的 i 是从右往左走的，先遇到 i = 1 的「aba」；后面 i = 0 的「bab」一样长，不比它长，不替换。所以程序会输出 aba。',
          '时间和空间都是 O(n²)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：表，以及最长那段的起点和长度',
        say: ['函数收字符串，返回最长的回文子串。表和上一题一样；计数器换成两个变量：最长那段的起点 start 和长度 best。任何单个字符都是回文，所以 best 至少是 1。'],
        ops: {
          python: code(
            ['class Solution:\n    def longestPalindrome(self, s: str) -> str:', '照例写类和方法，这次返回字符串。'],
            ['\n        n = len(s)\n        dp = [[False] * n for _ in range(n)]', '和上一题一样的布尔表。'],
            ['\n        start, best = 0, 1', '最长回文段的起点和长度。单个字符一定是回文，所以先记 s[0] 这一段。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>', '这次要返回一个新字符串：`malloc` 申请内存，`memcpy` 复制字符。'],
            ['\n\nchar* longestPalindrome(char* s) {', '题目给的函数：返回一个字符串（字符指针）。'],
            ['\n    int n = strlen(s);\n    static bool dp[1000][1000];', '和上一题一样，表放到静态存储区。'],
            ['\n    int start = 0, best = 1;', '最长回文段的起点和长度，单个字符一定是回文。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string longestPalindrome(string s) {', '照例的架子，返回 `string`。'],
            ['\n        int n = s.size();\n        vector<vector<bool>> dp(n, vector<bool>(n, false));', '和上一题一样的布尔表。'],
            ['\n        int start = 0, best = 1;', '最长回文段的起点和长度。']
          ),
          java: code(
            ['class Solution {\n    public String longestPalindrome(String s) {', '照例的架子，返回 `String`。'],
            ['\n        int n = s.length();\n        boolean[][] dp = new boolean[n][n];', '和上一题一样的布尔表。'],
            ['\n        int start = 0, best = 1;', '最长回文段的起点和长度。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn longest_palindrome(s: String) -> String {', '照例的架子，返回 `String`。'],
            ['\n        let b = s.as_bytes();\n        let n = b.len();\n        let mut dp = vec![vec![false; n]; n];', '转成字节数组，开布尔表。题目只有数字和英文字母，一个字符一个字节。'],
            ['\n        let (mut start, mut best) = (0, 1);', '最长回文段的起点和长度。']
          ),
        },
      },
      {
        section: '写代码',
        title: '同样的顺序填表，遇到更长的就记下',
        say: [
          '填表的两层循环和判断照抄上一题。是回文时，不再计数，而是比较长度：比目前最长的还长，就记下这一段。',
          { viz: { kind: 'grid', title: '记下最长的那段', frames: trace.pal('babad', 'longest') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(n - 1, -1, -1):\n            for j in range(i, n):', 'i 从下往上，j 从 i 往右，和上一题一样。'],
            ['\n                dp[i][j] = s[i] == s[j] and (j - i < 2 or dp[i + 1][j - 1])', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if dp[i][j] and j - i + 1 > best:\n                    start, best = i, j - i + 1', '是回文、而且比目前最长的还长，就记下它的起点和长度。用 `>` 而不是 `>=`：一样长时保留先找到的那段。']
          ),
          c: code(
            ['\n    for (int i = n - 1; i >= 0; i--) {\n        for (int j = i; j < n; j++) {', 'i 从下往上，j 从 i 往右。'],
            ['\n            dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n            if (dp[i][j] && j - i + 1 > best) {\n                start = i;\n                best = j - i + 1;\n            }\n        }\n    }', '更长的回文段，记下起点和长度。']
          ),
          cpp: code(
            ['\n        for (int i = n - 1; i >= 0; i--) {\n            for (int j = i; j < n; j++) {', 'i 从下往上，j 从 i 往右。'],
            ['\n                dp[i][j] = s[i] == s[j] && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if (dp[i][j] && j - i + 1 > best) {\n                    start = i;\n                    best = j - i + 1;\n                }\n            }\n        }', '更长的回文段，记下起点和长度。']
          ),
          java: code(
            ['\n        for (int i = n - 1; i >= 0; i--) {\n            for (int j = i; j < n; j++) {', 'i 从下往上，j 从 i 往右。'],
            ['\n                dp[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if (dp[i][j] && j - i + 1 > best) {\n                    start = i;\n                    best = j - i + 1;\n                }\n            }\n        }', '更长的回文段，记下起点和长度。']
          ),
          rust: code(
            ['\n        for i in (0..n).rev() {\n            for j in i..n {', 'i 从下往上，j 从 i 往右。'],
            ['\n                dp[i][j] = b[i] == b[j] && (j - i < 2 || dp[i + 1][j - 1]);', '两端相同，并且没有里面、或者里面是回文。'],
            ['\n                if dp[i][j] && j - i + 1 > best {\n                    start = i;\n                    best = j - i + 1;\n                }\n            }\n        }', '更长的回文段，记下起点和长度。']
          ),
        },
      },
      {
        section: '写代码',
        title: '把最长那段截出来',
        say: ['知道了起点和长度，从 s 里截出这一段返回。'],
        ops: {
          python: code(['\n        return s[start:start + best]', '切片取下标 start 到 start + best - 1，右端不含。']),
          c: code(
            ['\n    char* res = malloc(best + 1);', 'C 要自己准备返回的字符串：best 个字符，再加一个结尾的 `\\0`。函数结束后局部数组就没了，所以必须用 `malloc`。'],
            ['\n    memcpy(res, s + start, best);', '从 s 的第 start 个字符开始，复制 best 个字节过去。`s + start` 是指向第 start 个字符的指针。'],
            ['\n    res[best] = \'\\0\';\n    return res;\n}', '末尾补上字符串结束标记 `\\0`，再返回。']
          ),
          cpp: code(['\n        return s.substr(start, best);\n    }\n};', '`substr(起点, 长度)` 截出这一段。']),
          java: code(['\n        return s.substring(start, start + best);\n    }\n}', '`substring(开始, 结束)` 截出下标 start 到 start + best - 1，结束位置不含。']),
          rust: code(['\n        s[start..start + best].to_string()\n    }\n}', '`s[start..start + best]` 是这一段的切片，`to_string()` 复制成新的 String 返回。']),
        },
        sayBy: {
          c: [
            cdoc('malloc(size_t size)', 'Basic-Allocation.html', 'This function returns a pointer to a newly allocated block size bytes long, or a null pointer (setting errno) if the block could not be allocated.', '这个函数返回一个指针，指向新申请的、长 size 个字节的内存块；申请不到时返回空指针（并设置 errno）。'),
            cdoc('memcpy(void *to, const void *from, size_t size)', 'Copying-Strings-and-Arrays.html', 'The memcpy function copies size bytes from the object beginning at from into the object beginning at to.', 'memcpy 从 from 开始的对象复制 size 个字节，放到从 to 开始的对象里。'),
          ],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：第一个输出 aba（bab 也对，原因在思路页说过），第二个输出 bb。再试 "a"，应该就是它自己。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for s in ["babad", "cbbd", "a"]:\n        print(Solution().longestPalindrome(s))', '三个字符串挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['aba', 'bb', 'a'] }]),
          c: code(
            ['\n\nint main(void) {\n    char* cases[] = {"babad", "cbbd", "a"};', '写一个入口，三个字符串放进数组。'],
            ['\n    for (int k = 0; k < 3; k++) {\n        char* res = longestPalindrome(cases[k]);\n        printf("%s\\n", res);\n        free(res);\n    }\n    return 0;\n}', '挨个跑，`%s` 打印字符串。返回的字符串是 `malloc` 来的，打印完释放。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['aba', 'bb', 'a'] }]),
          cpp: code(['\n\nint main() {\n    for (string s : {"babad", "cbbd", "a"}) {\n        cout << Solution().longestPalindrome(s) << endl;\n    }\n    return 0;\n}', '三个字符串挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['aba', 'bb', 'a'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (String s : new String[]{"babad", "cbbd", "a"}) {\n            System.out.println(new Solution().longestPalindrome(s));\n        }\n    }\n}', '三个字符串挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['aba', 'bb', 'a'] }]),
          rust: code(['\n\nfn main() {\n    for s in ["babad", "cbbd", "a"] {\n        println!("{}", Solution::longest_palindrome(s.to_string()));\n    }\n}', '三个字符串挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['aba', 'bb', 'a'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '同一张区间表，问题从「有几个」换成「最长是哪个」，只改了循环里的一句话。时间和空间都是 O(n²)。',
          '下一题「单词拆分」回到一维的表：`dp[i]` 表示前 i 个字符能不能拆开，转移时看最后一个单词是哪个。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
