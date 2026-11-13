/*
 * 动态规划 · 子序列与字符串 · 32 最长有效括号（困难）
 * dp[i]：以 s[i] 结尾的最长有效括号子串长度。s[i] 是 ')' 时分两种情况，第二种要跳过前面一整段。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-32',
    group: '子序列与字符串',
    label: '32',
    title: '最长有效括号',
    summary: '以 s[i] 结尾：前一个是 ( 就直接配对；前一个是 ) 就跳过它那一整段，看再前面那个能不能配对。',
    problem: { id: 32, level: 'hard', url: leetcode('longest-valid-parentheses') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个只包含 `\'(\'` 和 `\')\'` 的字符串，找出最长有效（格式正确且连续）括号子串的长度。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"(()"`', '`2`', '"()"'],
                ['`")()())"`', '`4`', '"()()"'],
                ['`""`', '`0`', ''],
              ],
            },
          },
          { list: ['`0 <= s.length <= 3 * 10^4`', '`s[i]` 为 `\'(\'` 或 `\')\'`'] },
          '<a href="' + leetcode('longest-valid-parentheses') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：以 s[i] 结尾',
        doc: [
          '要找的是连续的一段，照「子数组」的办法：**`dp[i]` 是以 `s[i]` 结尾的最长有效括号子串的长度**。答案是整张表里最大的。',
          '有效括号不可能以 `(` 结尾，所以 `s[i] == \'(\'` 时 `dp[i] = 0`。`s[i] == \')\'` 时，要给它找一个配对的 `(`，看它前一个字符：',
          {
            list: [
              '**前一个是 `(`**，形如 `……()`：正好配成一对，长度 2，再接上 `()` 前面那段：`dp[i] = dp[i-2] + 2`。',
              '**前一个是 `)`**，形如 `……((……))`：前一个 `)` 自己结尾的那段有效子串长 `dp[i-1]`，和 s[i] 配对的 `(` 只可能在这段**前面紧挨着**的位置 `k = i - dp[i-1] - 1`。如果 `s[k]` 是 `(`，就配成了：中间那段加上这一对，再接上 k 前面那段：`dp[i] = dp[i-1] + 2 + dp[k-1]`。',
            ],
          },
          '两种情况都别忘了「再接上前面那段」：`()()` 的第二对，要和第一对连起来才是 4。',
          { viz: { kind: 'grid', title: '")()())"', frames: trace.parens(')()())') } },
          { viz: { kind: 'grid', title: '"()(())"：跳过中间一整段', frames: trace.parens('()(())') } },
          '下标 i - 2、k、k - 1 都可能小于 0，用之前要先判断。时间 O(n)，额外空间 O(n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，全是 0 的表',
        say: ['函数收括号串，返回最长长度。表先全是 0：以 ( 结尾的格子就一直是 0，不用再管。'],
        ops: {
          python: code(
            ['class Solution:\n    def longestValidParentheses(self, s: str) -> int:', '照例写类和方法。'],
            ['\n        n = len(s)\n        dp = [0] * n\n        best = 0', '表先全是 0，best 记最长。空串时表是空的，答案是 0。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <string.h>\n\nint longestValidParentheses(char* s) {', '题目给的函数，要用 `strlen`。'],
            ['\n    int n = strlen(s);\n    static int dp[30000];\n    int best = 0;', '长度最多 3 万，表放到静态存储区。每一格下面都会先写成 0，不受上次调用影响。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestValidParentheses(string s) {', '照例的架子。'],
            ['\n        int n = s.size();\n        vector<int> dp(n, 0);\n        int best = 0;', '表先全是 0，best 记最长。']
          ),
          java: code(
            ['class Solution {\n    public int longestValidParentheses(String s) {', '照例的架子。'],
            ['\n        int n = s.length();\n        int[] dp = new int[n];\n        int best = 0;', '表先全是 0，best 记最长。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn longest_valid_parentheses(s: String) -> i32 {', '照例的架子。'],
            ['\n        let b = s.as_bytes();\n        let n = b.len();\n        let mut dp = vec![0; n];\n        let mut best = 0;', '转成字节数组；表先全是 0，best 记最长。']
          ),
        },
      },
      {
        section: '写代码',
        title: '以 ) 结尾时，找和它配对的 (',
        say: [
          '从第 1 个字符开始（第 0 个一定是 0）。只处理 ) ：前一个是 ( 就直接配对；前一个是 ) 就跳过它结尾的那一整段，看段前面那个字符能不能配对。两种情况都再接上更前面的一段。',
          { viz: { kind: 'grid', title: '跳过中间一整段', frames: trace.parens('()(())') } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, n):', '第 0 个字符前面没东西，以它结尾不可能有效，从 1 开始。'],
            ['\n            if s[i] == ")":', '只有以 ) 结尾才可能有效，( 的格子保持 0。'],
            ['\n                if s[i - 1] == "(":', '情况一：前一个就是 (，形如 `……()`。'],
            ['\n                    dp[i] = (dp[i - 2] if i >= 2 else 0) + 2', '配成一对，长度 2，再接上它前面那段 dp[i - 2]。i = 1 时前面没有字符，接上 0。'],
            ['\n                else:\n                    k = i - dp[i - 1] - 1', '情况二：前一个是 )，它结尾的有效段长 dp[i - 1]。跳过这一整段，和 s[i] 配对的 ( 只能在 k = i - dp[i - 1] - 1。'],
            ['\n                    if k >= 0 and s[k] == "(":', 'k 要在字符串里，并且那个字符正好是 (。先判断 k >= 0：Python 里负下标不会报错，而是从末尾倒着数，会悄悄算错。'],
            ['\n                        dp[i] = dp[i - 1] + 2 + (dp[k - 1] if k >= 1 else 0)', '中间那段，加上 s[k] 和 s[i] 这一对，再接上 k 前面那段。'],
            ['\n                best = max(best, dp[i])', '更新最长。']
          ),
          c: code(
            ['\n    for (int i = 0; i < n; i++) {\n        dp[i] = 0;', '每一格先写成 0。第 0 格就停在 0，其余的下面看情况改。'],
            ['\n        if (i >= 1 && s[i] == \')\') {', '只有以 ) 结尾、并且前面有字符，才可能有效。'],
            ['\n            if (s[i - 1] == \'(\') {\n                dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;', '情况一：前一个是 (，配成一对，再接上前面那段。'],
            ['\n            } else {\n                int k = i - dp[i - 1] - 1;', '情况二：跳过前一个 ) 结尾的整段，找到可能配对的位置 k。'],
            ['\n                if (k >= 0 && s[k] == \'(\') {\n                    dp[i] = dp[i - 1] + 2 + (k >= 1 ? dp[k - 1] : 0);\n                }\n            }', 'k 在字符串里、正好是 (：中间那段加上这一对，再接上 k 前面那段。'],
            ['\n            if (dp[i] > best) {\n                best = dp[i];\n            }\n        }\n    }', '更新最长。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < n; i++) {', '从第 1 个字符开始。'],
            ['\n            if (s[i] == \')\') {', '只有以 ) 结尾才可能有效。'],
            ['\n                if (s[i - 1] == \'(\') {\n                    dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;', '情况一：前一个是 (，配成一对，再接上前面那段。'],
            ['\n                } else {\n                    int k = i - dp[i - 1] - 1;\n                    if (k >= 0 && s[k] == \'(\') {\n                        dp[i] = dp[i - 1] + 2 + (k >= 1 ? dp[k - 1] : 0);\n                    }\n                }', '情况二：跳过前一个 ) 结尾的整段，看 k 处能不能配对；能的话中间那段加这一对，再接上前面那段。'],
            ['\n                best = max(best, dp[i]);\n            }\n        }', '更新最长。']
          ),
          java: code(
            ['\n        for (int i = 1; i < n; i++) {', '从第 1 个字符开始。'],
            ['\n            if (s.charAt(i) == \')\') {', '只有以 ) 结尾才可能有效。'],
            ['\n                if (s.charAt(i - 1) == \'(\') {\n                    dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;', '情况一：前一个是 (，配成一对，再接上前面那段。'],
            ['\n                } else {\n                    int k = i - dp[i - 1] - 1;\n                    if (k >= 0 && s.charAt(k) == \'(\') {\n                        dp[i] = dp[i - 1] + 2 + (k >= 1 ? dp[k - 1] : 0);\n                    }\n                }', '情况二：跳过前一个 ) 结尾的整段，看 k 处能不能配对。'],
            ['\n                best = Math.max(best, dp[i]);\n            }\n        }', '更新最长。']
          ),
          rust: code(
            ['\n        for i in 1..n {', '从第 1 个字符开始。'],
            ['\n            if b[i] == b\')\' {', '只有以 ) 结尾才可能有效。`b\')\'` 是一个字节字面量，和字节数组里的元素同类型。'],
            ['\n                if b[i - 1] == b\'(\' {\n                    dp[i] = if i >= 2 { dp[i - 2] } else { 0 } + 2;', '情况一：前一个是 (，配成一对，再接上前面那段。'],
            ['\n                } else if dp[i - 1] + 1 <= i && b[i - dp[i - 1] - 1] == b\'(\' {', '情况二：k = i - dp[i - 1] - 1。usize 不能是负数，算出负数会直接出错，所以先判断 `dp[i - 1] + 1 <= i`（也就是 k >= 0），再去读 b[k]。'],
            ['\n                    let k = i - dp[i - 1] - 1;\n                    dp[i] = dp[i - 1] + 2 + if k >= 1 { dp[k - 1] } else { 0 };\n                }', '能配对：中间那段加上这一对，再接上 k 前面那段。'],
            ['\n                best = best.max(dp[i]);\n            }\n        }', '更新最长。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案是 best',
        say: ['最长的有效段可能在任何位置结束。'],
        ops: {
          python: code(['\n        return best', '所有结尾位置里最长的。']),
          c: code(['\n    return best;\n}', '所有结尾位置里最长的。']),
          cpp: code(['\n        return best;\n    }\n};', '所有结尾位置里最长的。']),
          java: code(['\n        return best;\n    }\n}', '所有结尾位置里最长的。']),
          rust: code(['\n        best as i32\n    }\n}', '表里是 usize，转回 i32 返回。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试嵌套的',
        say: ['预期：2、4、0。再试演示里的 "()(())"：情况二跳过中间的 "()"，再接上开头的 "()"，得 6。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for s in ["(()", ")()())", "", "()(())"]:\n        print(Solution().longestValidParentheses(s))', '三个样例和一个嵌套的例子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['2', '4', '0', '6'] }]),
          c: code(['\n\nint main(void) {\n    char* cases[] = {"(()", ")()())", "", "()(())"};\n    for (int k = 0; k < 4; k++) {\n        printf("%d\\n", longestValidParentheses(cases[k]));\n    }\n    return 0;\n}', '三个样例和一个嵌套的例子。']).concat([{ pause: 500 }, { run: RUN.c, output: ['2', '4', '0', '6'] }]),
          cpp: code(['\n\nint main() {\n    for (string s : {"(()", ")()())", "", "()(())"}) {\n        cout << Solution().longestValidParentheses(s) << endl;\n    }\n    return 0;\n}', '三个样例和一个嵌套的例子。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['2', '4', '0', '6'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (String s : new String[]{"(()", ")()())", "", "()(())"}) {\n            System.out.println(new Solution().longestValidParentheses(s));\n        }\n    }\n}', '三个样例和一个嵌套的例子。']).concat([{ pause: 500 }, { run: RUN.java, output: ['2', '4', '0', '6'] }]),
          rust: code(['\n\nfn main() {\n    for s in ["(()", ")()())", "", "()(())"] {\n        println!("{}", Solution::longest_valid_parentheses(s.to_string()));\n    }\n}', '三个样例和一个嵌套的例子。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['2', '4', '0', '6'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '状态是熟悉的「以 i 结尾」，难点在转移：前一格的值告诉我们它那段有多长，于是能一步跳到可能配对的位置。时间 O(n)，额外空间 O(n)。',
          '最后一题「正则表达式匹配」又是两个字符串的二维表，难在 * 号：它可以让前面的字符出现 0 次或很多次。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
