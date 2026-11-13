/*
 * 双指针 · 同向指针 · 844 比较含退格的字符串（简单）
 * 从后往前：# 只会删掉它前面的字符。两个指针各自跳过被删的字符，逐个比较留下来的字符。O(1) 空间。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.TP;

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-844',
    group: '同向指针',
    label: '844',
    title: '比较含退格的字符串',
    summary: '退格只影响它前面的字符，所以从后往前走：记着还要删几个，跳过被删的，逐个比较留下来的字符。',
    problem: { id: 844, level: 'easy', url: leetcode('backspace-string-compare') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定 `s` 和 `t` 两个字符串，当它们分别被输入到空白的文本编辑器后，如果两者相等，返回 `true`。`#` 代表退格字符。注意：如果对空文本输入退格字符，文本继续为空。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "ab#c"`, `t = "ad#c"`', '`true`', '都变成 "ac"'],
                ['`s = "ab##"`, `t = "c#d#"`', '`true`', '都变成 ""'],
                ['`s = "a#c"`, `t = "b"`', '`false`', '"c" 和 "b"'],
              ],
            },
          },
          { list: ['`1 <= s.length, t.length <= 200`', '`s` 和 `t` 只含有小写字母以及字符 `#`', '进阶：你可以用 O(n) 的时间复杂度和 O(1) 的空间复杂度解决该问题吗？'] },
          '<a href="' + leetcode('backspace-string-compare') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：从后往前',
        doc: [
          '直接的做法是模拟打字：用一个栈，遇到字母压进去，遇到 # 弹出一个，最后比较两个栈。这要 O(n) 的额外空间。',
          '要做到 O(1) 空间，就不能把打完的结果存下来，只能边走边比。从前往后不行：读到一个字母时，不知道后面会不会有 # 把它删掉。但**从后往前**就清楚了：# 只影响它前面的字符，所以先看到 #，就知道前面要删几个。',
          '每个串一个指针，从末尾往前走，用 `skip` 记着「前面还要删几个」：',
          {
            list: [
              '遇到 #：skip 加一，跳过。',
              '遇到字母且 skip > 0：它被删了，skip 减一，跳过。',
              '遇到字母且 skip = 0：它会留下来，停在这里。',
            ],
          },
          '两个指针都停在各自「从后往前数下一个留下来的字符」上，比较它俩：不同就是 false；相同就各往前一格，继续。有一边已经没有字符了，就看另一边是不是也没有了。',
          { viz: { kind: 'array', title: 's = "ab#c"（左），t = "ad#c"（右）', frames: trace.backspace('ab#c', 'ad#c') } },
          '每个字符最多被看一次，时间 O(m + n)，额外空间 O(1)。「跳到下一个留下来的字符」两个串都要用，写成一个小函数。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '小函数：往前找下一个留下来的字符',
        say: ['先写一个两边都要用的小函数：从下标 k 开始往前走，跳过 # 和被它删掉的字符，返回下一个会留下来的字符的下标；前面一个都不剩了就返回 -1。'],
        ops: {
          python: code(
            ['class Solution:', '照例先写类。'],
            ['\n    def prev(self, st: str, k: int) -> int:', '小方法：在 st 里从 k 往前找下一个留下来的字符。'],
            ['\n        skip = 0', '前面还要删几个字符。'],
            ['\n        while k >= 0:', '往前走，走出开头就停。'],
            ['\n            if st[k] == "#":\n                skip += 1', '是 #：前面要多删一个。'],
            ['\n            elif skip > 0:\n                skip -= 1', '是字母，但被后面的 # 删掉了：用掉一次删除。'],
            ['\n            else:\n                return k', '是字母，也没人删它：这就是下一个留下来的字符。'],
            ['\n            k -= 1\n        return -1', '前面已经一个都不剩了。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `bool` 和 `strlen`。'],
            ['\n\nstatic int prev(const char* st, int k) {', '小函数：在 st 里从 k 往前找下一个留下来的字符。'],
            ['\n    int skip = 0;\n    while (k >= 0) {', '前面还要删几个；往前走，走出开头就停。'],
            ['\n        if (st[k] == \'#\') {\n            skip++;\n        } else if (skip > 0) {\n            skip--;\n        } else {\n            return k;\n        }', '是 # 就多删一个；被删的字母用掉一次删除；没人删的字母就是答案。'],
            ['\n        k--;\n    }\n    return -1;\n}', '前面一个都不剩了。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {', '照例先写类。'],
            ['\n    int prev(const string& st, int k) {', '小函数放在类里，不写 `public:` 时默认是私有的，只给类自己用。'],
            ['\n        int skip = 0;\n        while (k >= 0) {', '前面还要删几个；往前走，走出开头就停。'],
            ['\n            if (st[k] == \'#\') {\n                skip++;\n            } else if (skip > 0) {\n                skip--;\n            } else {\n                return k;\n            }', '是 # 就多删一个；被删的字母用掉一次删除；没人删的字母就是答案。'],
            ['\n            k--;\n        }\n        return -1;\n    }', '前面一个都不剩了。']
          ),
          java: code(
            ['class Solution {', '照例先写类。'],
            ['\n    private int prev(String st, int k) {', '小方法，`private` 只给类自己用。'],
            ['\n        int skip = 0;\n        while (k >= 0) {', '前面还要删几个；往前走，走出开头就停。'],
            ['\n            if (st.charAt(k) == \'#\') {\n                skip++;\n            } else if (skip > 0) {\n                skip--;\n            } else {\n                return k;\n            }', '是 # 就多删一个；被删的字母用掉一次删除；没人删的字母就是答案。'],
            ['\n            k--;\n        }\n        return -1;\n    }', '前面一个都不剩了。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '照例先写结构体。'],
            ['\n    fn prev(st: &[u8], mut k: isize) -> isize {', '小函数：下标会走到 -1，所以用有符号的 `isize`，用的时候再转成 usize。'],
            ['\n        let mut skip = 0;\n        while k >= 0 {', '前面还要删几个；往前走，走出开头就停。'],
            ['\n            if st[k as usize] == b\'#\' {\n                skip += 1;\n            } else if skip > 0 {\n                skip -= 1;\n            } else {\n                return k;\n            }', '是 # 就多删一个；被删的字母用掉一次删除；没人删的字母就是答案。'],
            ['\n            k -= 1;\n        }\n        -1\n    }', '前面一个都不剩了。']
          ),
        },
      },
      {
        section: '写代码',
        title: '两个指针从后往前，逐个比较',
        say: [
          '两个指针从各自的末尾出发。每一轮先让它们各自跳到下一个留下来的字符：有一边没字符了，就看两边是不是同时没了；都有，就比较，不同返回 false，相同各往前一格。',
          { viz: { kind: 'array', title: '从后往前比较', frames: trace.backspace('ab#c', 'ad#c') } },
        ],
        ops: {
          python: code(
            ['\n\n    def backspaceCompare(self, s: str, t: str) -> bool:\n        i, j = len(s) - 1, len(t) - 1', '题目给的方法。两个指针从各自的末尾出发。'],
            ['\n        while True:\n            i = self.prev(s, i)\n            j = self.prev(t, j)', '一直循环，每一轮先让两个指针都跳到下一个留下来的字符。'],
            ['\n            if i < 0 or j < 0:\n                return i < 0 and j < 0', '有一边没字符了：只有两边同时没了才相等。'],
            ['\n            if s[i] != t[j]:\n                return False', '留下来的字符不同，打出来的结果就不同。'],
            ['\n            i -= 1\n            j -= 1', '这一对相同，各往前一格，继续比。']
          ),
          c: code(
            ['\n\nbool backspaceCompare(char* s, char* t) {\n    int i = strlen(s) - 1, j = strlen(t) - 1;', '题目给的函数。两个指针从各自的末尾出发。'],
            ['\n    while (true) {\n        i = prev(s, i);\n        j = prev(t, j);', '每一轮先跳到下一个留下来的字符。'],
            ['\n        if (i < 0 || j < 0) {\n            return i < 0 && j < 0;\n        }', '有一边没字符了：两边同时没了才相等。'],
            ['\n        if (s[i] != t[j]) {\n            return false;\n        }\n        i--;\n        j--;\n    }\n}', '不同就是 false；相同各往前一格。']
          ),
          cpp: code(
            ['\n\npublic:\n    bool backspaceCompare(string s, string t) {\n        int i = (int)s.size() - 1, j = (int)t.size() - 1;', '题目给的方法放在 `public:` 下面。两个指针从各自的末尾出发。'],
            ['\n        while (true) {\n            i = prev(s, i);\n            j = prev(t, j);', '每一轮先跳到下一个留下来的字符。'],
            ['\n            if (i < 0 || j < 0) {\n                return i < 0 && j < 0;\n            }', '有一边没字符了：两边同时没了才相等。'],
            ['\n            if (s[i] != t[j]) {\n                return false;\n            }\n            i--;\n            j--;\n        }\n    }\n};', '不同就是 false；相同各往前一格。']
          ),
          java: code(
            ['\n\n    public boolean backspaceCompare(String s, String t) {\n        int i = s.length() - 1, j = t.length() - 1;', '题目给的方法。两个指针从各自的末尾出发。'],
            ['\n        while (true) {\n            i = prev(s, i);\n            j = prev(t, j);', '每一轮先跳到下一个留下来的字符。'],
            ['\n            if (i < 0 || j < 0) {\n                return i < 0 && j < 0;\n            }', '有一边没字符了：两边同时没了才相等。'],
            ['\n            if (s.charAt(i) != t.charAt(j)) {\n                return false;\n            }\n            i--;\n            j--;\n        }\n    }\n}', '不同就是 false；相同各往前一格。']
          ),
          rust: code(
            ['\n\n    pub fn backspace_compare(s: String, t: String) -> bool {\n        let (s, t) = (s.as_bytes(), t.as_bytes());\n        let (mut i, mut j) = (s.len() as isize - 1, t.len() as isize - 1);', '题目给的函数。转成字节数组；两个指针从各自的末尾出发，用 isize。'],
            ['\n        loop {\n            i = Self::prev(s, i);\n            j = Self::prev(t, j);', '`loop` 是无限循环。每一轮先跳到下一个留下来的字符；`Self::prev` 调用同一个 impl 里的函数。'],
            ['\n            if i < 0 || j < 0 {\n                return i < 0 && j < 0;\n            }', '有一边没字符了：两边同时没了才相等。'],
            ['\n            if s[i as usize] != t[j as usize] {\n                return false;\n            }\n            i -= 1;\n            j -= 1;\n        }\n    }\n}', '不同就是 false；相同各往前一格。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：true、true、false。第二个样例两边都退格到空，检验「同时没了」的判断。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for s, t in [("ab#c", "ad#c"), ("ab##", "c#d#"), ("a#c", "b")]:\n        print(Solution().backspaceCompare(s, t))', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'True', 'False'] }]),
          c: code(['\n\nint main(void) {\n    bool r[] = {backspaceCompare("ab#c", "ad#c"), backspaceCompare("ab##", "c#d#"), backspaceCompare("a#c", "b")};\n    for (int k = 0; k < 3; k++) {\n        printf("%s\\n", r[k] ? "true" : "false");\n    }\n    return 0;\n}', '三个样例，按 true / false 打印。']).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'true', 'false'] }]),
          cpp: code(['\n\nint main() {\n    Solution sol;\n    cout << boolalpha << sol.backspaceCompare("ab#c", "ad#c") << endl << sol.backspaceCompare("ab##", "c#d#") << endl << sol.backspaceCompare("a#c", "b") << endl;\n    return 0;\n}', '三个样例。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'true', 'false'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        System.out.println(sol.backspaceCompare("ab#c", "ad#c"));\n        System.out.println(sol.backspaceCompare("ab##", "c#d#"));\n        System.out.println(sol.backspaceCompare("a#c", "b"));\n    }\n}', '三个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'true', 'false'] }]),
          rust: code(['\n\nfn main() {\n    for (s, t) in [("ab#c", "ad#c"), ("ab##", "c#d#"), ("a#c", "b")] {\n        println!("{}", Solution::backspace_compare(s.to_string(), t.to_string()));\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'true', 'false'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '选对方向很重要：退格影响的是前面的字符，从后往前走就能边走边确定哪些字符留下来。时间 O(m + n)，额外空间 O(1)。',
          '下一题「颜色分类」用三个指针，把数组原地分成三段。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
