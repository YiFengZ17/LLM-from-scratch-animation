/*
 * 双指针 · 同向指针 · 392 判断子序列（简单）
 * i 走 s，j 走 t。t[j] 和 s[i] 相同，i 才前进。t 走完时 i 走完了 s，就是子序列。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.TP;

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-392',
    group: '同向指针',
    label: '392',
    title: '判断子序列',
    summary: '两个指针分别走在 s 和 t 上：t 里遇到 s 要找的下一个字符，就让 s 的指针前进。能匹配就早点匹配，不会更差。',
    problem: { id: 392, level: 'easy', url: leetcode('is-subsequence') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定字符串 `s` 和 `t`，判断 `s` 是否为 `t` 的子序列。字符串的一个子序列是原始字符串删除一些（也可以不删除）字符而不改变剩余字符相对位置形成的新字符串。（例如，"ace" 是 "abcde" 的一个子序列，而 "aec" 不是）。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`s = "abc"`, `t = "ahbgdc"`', '`true`'],
                ['`s = "axc"`, `t = "ahbgdc"`', '`false`'],
              ],
            },
          },
          { list: ['`0 <= s.length <= 100`', '`0 <= t.length <= 10^4`', '两个字符串都只由小写字符组成'] },
          '<a href="' + leetcode('is-subsequence') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：能早匹配就早匹配',
        doc: [
          '要在 t 里按顺序找到 s 的每一个字符。i 指着 s 里「下一个要找的字符」，j 在 t 上从左往右走：',
          {
            list: [
              '`t[j] == s[i]`：找到了，i 前进，接着找 s 的下一个字符。',
              '不相同：这个 t[j] 用不上，跳过。',
            ],
          },
          '有一个问题值得想一下：如果 t 后面还有一个同样的字符，现在就用掉 t[j]，会不会吃亏？不会——用前面这个匹配，后面剩下的 t 更长，能找到的只会更多。所以**能匹配就马上匹配**。',
          { viz: { kind: 'array', title: 's = "abc"，t = "ahbgdc"', frames: trace.subseq('abc', 'ahbgdc') } },
          't 走完时，如果 i 已经走完了 s，s 就是子序列。j 走 t 一遍，时间 O(|t|)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：s 上的指针',
        say: ['函数收 s 和 t，返回布尔值。i 是 s 上的指针，从 0 开始；t 上的指针交给循环。'],
        ops: {
          python: code(
            ['class Solution:\n    def isSubsequence(self, s: str, t: str) -> bool:', '照例写类和方法。'],
            ['\n        i = 0', 's 里下一个要找的字符。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n\nbool isSubsequence(char* s, char* t) {', '题目给的函数。'],
            ['\n    int i = 0;', 's 里下一个要找的字符。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isSubsequence(string s, string t) {', '照例的架子。'],
            ['\n        size_t i = 0;', 's 里下一个要找的字符。和 `s.size()` 比较，用同样的无符号类型 `size_t`。']
          ),
          java: code(
            ['class Solution {\n    public boolean isSubsequence(String s, String t) {', '照例的架子。'],
            ['\n        int i = 0;', 's 里下一个要找的字符。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn is_subsequence(s: String, t: String) -> bool {', '照例的架子。'],
            ['\n        let s = s.as_bytes();\n        let mut i = 0;', 's 转成字节数组好按下标取；i 是 s 里下一个要找的字符。']
          ),
        },
      },
      {
        section: '写代码',
        title: 't 上逐个走，匹配上 i 才前进',
        say: [
          '逐个看 t 的字符。s 还没找完、并且这个字符正是 s 要找的，i 就前进。最后看 i 有没有走到 s 的末尾。',
          { viz: { kind: 'array', title: '两个串上的指针', frames: trace.subseq('abc', 'ahbgdc') } },
        ],
        ops: {
          python: code(
            ['\n        for ch in t:', 'j 在 t 上逐个走，这里直接拿字符 ch。'],
            ['\n            if i < len(s) and s[i] == ch:\n                i += 1', 's 还没找完，并且 ch 正是要找的字符：匹配上，i 前进。先判断 `i < len(s)`，免得 s 找完以后越界。'],
            ['\n        return i == len(s)', 'i 走完了 s，说明每个字符都按顺序找到了。']
          ),
          c: code(
            ['\n    for (char* p = t; *p; p++) {', 'p 在 t 上逐个走，到结尾的 `\\0` 停下。'],
            ['\n        if (s[i] != \'\\0\' && s[i] == *p) {\n            i++;\n        }\n    }', 's 还没走到结尾、并且字符相同：i 前进。C 的字符串以 `\\0` 结尾，用它判断 s 有没有找完，不用先求长度。'],
            ['\n    return s[i] == \'\\0\';\n}', 'i 走到了 s 的结尾，就是子序列。']
          ),
          cpp: code(
            ['\n        for (char c : t) {', '逐个看 t 的字符。'],
            ['\n            if (i < s.size() && s[i] == c) {\n                i++;\n            }\n        }', 's 还没找完、并且字符相同：i 前进。'],
            ['\n        return i == s.size();\n    }\n};', 'i 走完了 s，就是子序列。']
          ),
          java: code(
            ['\n        for (int j = 0; j < t.length(); j++) {', 'j 在 t 上逐个走。'],
            ['\n            if (i < s.length() && s.charAt(i) == t.charAt(j)) {\n                i++;\n            }\n        }', 's 还没找完、并且字符相同：i 前进。'],
            ['\n        return i == s.length();\n    }\n}', 'i 走完了 s，就是子序列。']
          ),
          rust: code(
            ['\n        for &c in t.as_bytes() {', '逐个看 t 的字节。'],
            ['\n            if i < s.len() && s[i] == c {\n                i += 1;\n            }\n        }', 's 还没找完、并且字符相同：i 前进。'],
            ['\n        i == s.len()\n    }\n}', 'i 走完了 s，就是子序列。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试空串',
        say: ['预期：true、false。再试 s 是空串：空串是任何字符串的子序列，true。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().isSubsequence("abc", "ahbgdc"))\n    print(Solution().isSubsequence("axc", "ahbgdc"))\n    print(Solution().isSubsequence("", "abc"))', '两个样例和一个空串。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'False', 'True'] }]),
          c: code(['\n\nint main(void) {\n    bool r[] = {isSubsequence("abc", "ahbgdc"), isSubsequence("axc", "ahbgdc"), isSubsequence("", "abc")};\n    for (int k = 0; k < 3; k++) {\n        printf("%s\\n", r[k] ? "true" : "false");\n    }\n    return 0;\n}', '两个样例和一个空串，按 true / false 打印。']).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'false', 'true'] }]),
          cpp: code(['\n\nint main() {\n    Solution sol;\n    cout << boolalpha << sol.isSubsequence("abc", "ahbgdc") << endl << sol.isSubsequence("axc", "ahbgdc") << endl << sol.isSubsequence("", "abc") << endl;\n    return 0;\n}', '两个样例和一个空串。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'false', 'true'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println(sol.isSubsequence("abc", "ahbgdc"));\n        System.out.println(sol.isSubsequence("axc", "ahbgdc"));\n        System.out.println(sol.isSubsequence("", "abc"));\n    }\n}', '两个样例和一个空串。']).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'false', 'true'] }]),
          rust: code(['\n\nfn main() {\n    for (s, t) in [("abc", "ahbgdc"), ("axc", "ahbgdc"), ("", "abc")] {\n        println!("{}", Solution::is_subsequence(s.to_string(), t.to_string()));\n    }\n}', '两个样例和一个空串。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'false', 'true'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '两个指针走在两个串上，一个每步都走，一个匹配上才走。「能早匹配就早匹配」保证了不会错过。时间 O(|t|)，额外空间 O(1)。',
          '下一题「比较含退格的字符串」也是两个串上各一个指针，不过要从后往前走：退格只会影响它前面的字符。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
