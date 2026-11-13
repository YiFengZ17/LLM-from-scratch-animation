/*
 * 滑动窗口 · 76 最小覆盖子串（困难，变长窗口：求最短 + 「还缺几个」计数）
 * 写法约定见 02-p643.js。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { javadoc } = root.LessonKit;

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-76',
    label: '76',
    title: '最小覆盖子串',
    summary: '困难题：用一个数记「还缺几个字母」，凑齐了就收缩，边缩边记最短的子串。',
    problem: { id: 76, level: 'hard', url: leetcode('minimum-window-substring') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给两个字符串 `s` 和 `t`，在 s 里找出**包含 t 的所有字符**的最短子串，返回这个子串；找不到就返回空字符串。t 里重复的字符，子串里也要有同样多个。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "ADOBECODEBANC"`, `t = "ABC"`', '`"BANC"`', '包含 A、B、C 的最短子串'],
                ['`s = "a"`, `t = "a"`', '`"a"`', '整个 s 就是'],
                ['`s = "a"`, `t = "aa"`', '`""`', 't 要两个 a，s 只有一个'],
              ],
            },
          },
          { list: ['`1 <= s.length, t.length <= 10^5`', '`s` 和 `t` 由英文字母组成'] },
          '<a href="' + leetcode('minimum-window-substring') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '这是「求最短」的变长窗口，和 209 一样：右端扩张，窗口**满足条件**就收缩，收缩前记答案。这里的条件是「窗口包含了 t 的所有字符」。',
          '怎么快速判断窗口凑齐了？用一张表 `need` 记「t 的每个字符，窗口还欠几个」：一开始就是 t 里每个字符的个数。窗口每进来一个字符，它欠的数减一；减到负数说明这个字符多了，用不上。',
          '每次都检查整张表太慢，再用一个数 `missing` 记「一共还缺几个字符」，一开始是 t 的长度。进来的字符如果正好是欠着的（减之前大于 0），missing 减一。missing 变成 0，就是凑齐了。',
          { viz: { kind: 'array', title: '样例 1：t = "ABC"', frames: trace.minWindow('ADOBECODEBANC', 'ABC') } },
          '收缩时反过来：去掉的字符欠的数加一；加完大于 0，说明去掉的是一个必需的字符，missing 加一，窗口不再满足，停止收缩。',
          '左右端点各走最多 n 步，时间 O(n)；表的大小只和字符种类有关，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收两个字符串，返回一个字符串：最短的覆盖子串。'],
        ops: {
          python: code(['class Solution:\n    def minWindow(self, s: str, t: str) -> str:', '收两个字符串，返回字符串。']),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>', '最后要返回一个新的字符串，需要 `malloc` 申请内存；复制字符要用 `memcpy`。'],
            ['\n\nchar* minWindow(char* s, char* t) {', '返回一个字符串，就是返回 `char*`。']
          ),
          cpp: code(['#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string minWindow(string s, string t) {', '收两个字符串，返回字符串。']),
          java: code(['class Solution {\n    public String minWindow(String s, String t) {', '收两个字符串，返回字符串。']),
          rust: code(['struct Solution;\n\nimpl Solution {\n    pub fn min_window(s: String, t: String) -> String {', '收两个 `String`，返回 `String`。']),
        },
      },
      {
        section: '写代码',
        title: '记下 t 里每个字符欠几个',
        say: ['先给 t 数一张表：每个字符欠几个。再用 missing 记一共还缺几个——一开始窗口是空的，缺的正好是 t 的全部字符。'],
        ops: {
          python: code(
            ['\n        need = {}', '用字典当表：键是字符，值是窗口还欠它几个。'],
            ['\n        for ch in t:\n            need[ch] = need.get(ch, 0) + 1', 't 的字符一个个看过去，欠的数加一。字符第一次出现时还不在字典里，`get(ch, 0)` 给出 0。'],
            ['\n        missing = len(t)', '一共还缺几个字符：一开始就是 t 的长度。']
          ),
          c: code(
            ['\n    int need[128] = {0};', '用长度 128 的数组当表，下标是字符的 ASCII 码，值是窗口还欠它几个。'],
            ['\n    int missing = 0;', '一共还缺几个字符，一会儿边数边加。'],
            ['\n    for (int i = 0; t[i] != \'\\0\'; i++) {\n        need[(unsigned char)t[i]]++;\n        missing++;\n    }', 't 的字符一个个看过去：这个字符欠的数加一，总共缺的数也加一。拿字符当下标前转成 `unsigned char`，保证编号不小于 0。走到 `\\0` 就是字符串结束。']
          ),
          cpp: code(
            ['\n        int need[128] = {0};', '用长度 128 的数组当表，下标是字符的 ASCII 码，值是窗口还欠它几个。'],
            ['\n        for (unsigned char c : t) {\n            need[c]++;\n        }', 't 的字符一个个看过去，欠的数加一。取出来时就存成 `unsigned char`，保证当下标的编号不小于 0。'],
            ['\n        int missing = t.size();', '一共还缺几个字符：一开始就是 t 的长度。']
          ),
          java: code(
            ['\n        int[] need = new int[128];', '用长度 128 的数组当表，下标是字符的 ASCII 码，值是窗口还欠它几个。'],
            ['\n        for (char c : t.toCharArray()) {\n            need[c]++;\n        }', 't 的字符一个个看过去，欠的数加一。'],
            ['\n        int missing = t.length();', '一共还缺几个字符：一开始就是 t 的长度。']
          ),
          rust: code(
            ['\n        let (b, t) = (s.as_bytes(), t.as_bytes());', '两个字符串都要按下标取字符，先转成字节数组。s 后面还要用来截取答案，所以 s 的字节数组叫 `b`，不盖住 s。'],
            ['\n        let mut need = [0i32; 128];', '用长度 128 的数组当表，值是窗口还欠几个，会减到负数，所以明确写成 `i32`（`0i32`）。'],
            ['\n        for &c in t {\n            need[c as usize] += 1;\n        }', 't 的字符一个个看过去，欠的数加一。'],
            ['\n        let mut missing = t.len();', '一共还缺几个字符：一开始就是 t 的长度。']
          ),
        },
      },
      {
        section: '写代码',
        title: '窗口左端，和目前最短的答案',
        say: ['还要记住窗口的左端，以及目前找到的最短子串在哪：用起点和长度两个数来记，最后再截取出来。'],
        ops: {
          python: code(
            ['\n        left = 0', '窗口的左端。'],
            ['\n        best_start, best_len = 0, len(s) + 1', '最短子串的起点和长度。长度先设成一个不可能的值：比 s 还长 1，最后看它有没有被改过。']
          ),
          c: code(
            ['\n    int n = strlen(s);', 's 的长度，循环和最后的判断都要用。'],
            ['\n    int left = 0, bestStart = 0, bestLen = n + 1;', '窗口的左端，以及最短子串的起点和长度。长度先设成比 s 还长 1 的不可能值。']
          ),
          cpp: code(
            ['\n        int n = s.size();', 's 的长度，后面要用好几次。'],
            ['\n        int left = 0, bestStart = 0, bestLen = n + 1;', '窗口的左端，以及最短子串的起点和长度。长度先设成比 s 还长 1 的不可能值。']
          ),
          java: code(
            ['\n        int n = s.length();', 's 的长度，后面要用好几次。'],
            ['\n        int left = 0, bestStart = 0, bestLen = n + 1;', '窗口的左端，以及最短子串的起点和长度。长度先设成比 s 还长 1 的不可能值。']
          ),
          rust: code(
            ['\n        let mut left = 0;', '窗口的左端。'],
            ['\n        let (mut best_start, mut best_len) = (0, b.len() + 1);', '最短子串的起点和长度。长度先设成比 s 还长 1 的不可能值。']
          ),
        },
      },
      {
        section: '写代码',
        title: '右端扩张：进来的字符是不是欠着的',
        say: ['右端每走一格，进来一个字符。如果它正好是窗口欠着的，missing 减一；不管欠不欠，这个字符欠的数都减一（减成负数表示多了）。'],
        ops: {
          python: code(
            ['\n        for right, ch in enumerate(s):', '右端走遍 s。'],
            ['\n            if need.get(ch, 0) > 0:\n                missing -= 1', '这个字符还欠着（大于 0），它进来就补上了一个缺口，总共缺的数减一。不在 t 里的字符 `get` 得 0，不算。'],
            ['\n            need[ch] = need.get(ch, 0) - 1', '它欠的数减一。原来是 0 的会变成 -1，表示窗口里多了一个用不上的。']
          ),
          c: code(
            ['\n    for (int right = 0; right < n; right++) {', '右端走遍 s。'],
            ['\n        unsigned char c = s[right];', '取出进来的字符，存成 `unsigned char` 当下标用。'],
            ['\n        if (need[c] > 0) {\n            missing--;\n        }', '这个字符还欠着，它进来就补上了一个缺口，总共缺的数减一。'],
            ['\n        need[c]--;', '它欠的数减一，可以减成负数。']
          ),
          cpp: code(
            ['\n        for (int right = 0; right < n; right++) {', '右端走遍 s。'],
            ['\n            unsigned char c = s[right];', '取出进来的字符，存成 `unsigned char` 当下标用。'],
            ['\n            if (need[c] > 0) {\n                missing--;\n            }', '这个字符还欠着，它进来就补上了一个缺口，总共缺的数减一。'],
            ['\n            need[c]--;', '它欠的数减一，可以减成负数。']
          ),
          java: code(
            ['\n        for (int right = 0; right < n; right++) {', '右端走遍 s。'],
            ['\n            char c = s.charAt(right);', '取出进来的字符。'],
            ['\n            if (need[c] > 0) {\n                missing--;\n            }', '这个字符还欠着，它进来就补上了一个缺口，总共缺的数减一。'],
            ['\n            need[c]--;', '它欠的数减一，可以减成负数。']
          ),
          rust: code(
            ['\n        for right in 0..b.len() {', '右端走遍 s。'],
            ['\n            let c = b[right] as usize;', '取出进来的字符，直接转成下标用。'],
            ['\n            if need[c] > 0 {\n                missing -= 1;\n            }', '这个字符还欠着，它进来就补上了一个缺口，总共缺的数减一。'],
            ['\n            need[c] -= 1;', '它欠的数减一，可以减成负数。']
          ),
        },
      },
      {
        section: '写代码',
        title: '凑齐了：记答案，再从左边收缩',
        say: [
          'missing 变成 0，窗口就包含了 t 的全部字符。和 209 一样，先记下答案，再试着从左边去掉一个字符，看是不是还凑齐着。',
          '去掉的字符欠的数加一。加完如果大于 0，说明去掉的是一个必需的字符，又缺了一个，missing 加一，循环就会停下。',
          { viz: { kind: 'array', title: '样例 1：t = "ABC"', frames: trace.minWindow('ADOBECODEBANC', 'ABC') } },
        ],
        ops: {
          python: code(
            ['\n            while missing == 0:', '凑齐了就收缩，一直缩到又缺了为止。'],
            ['\n                if right - left + 1 < best_len:\n                    best_start, best_len = left, right - left + 1', '先记答案：这个窗口比目前最短的还短，就记下它的起点和长度。'],
            ['\n                need[s[left]] += 1', '去掉最左边的字符：它欠的数加一。'],
            ['\n                if need[s[left]] > 0:\n                    missing += 1', '加完大于 0，说明去掉的是必需的字符，又缺了一个。'],
            ['\n                left += 1', '左端往右挪一格。']
          ),
          c: code(
            ['\n        while (missing == 0) {', '凑齐了就收缩，一直缩到又缺了为止。'],
            ['\n            if (right - left + 1 < bestLen) {\n                bestStart = left;\n                bestLen = right - left + 1;\n            }', '先记答案：比目前最短的还短，就记下起点和长度。'],
            ['\n            unsigned char out = s[left];\n            need[out]++;', '去掉最左边的字符：它欠的数加一。'],
            ['\n            if (need[out] > 0) {\n                missing++;\n            }', '加完大于 0，说明去掉的是必需的字符，又缺了一个。'],
            ['\n            left++;\n        }\n    }', '左端往右挪一格。']
          ),
          cpp: code(
            ['\n            while (missing == 0) {', '凑齐了就收缩，一直缩到又缺了为止。'],
            ['\n                if (right - left + 1 < bestLen) {\n                    bestStart = left;\n                    bestLen = right - left + 1;\n                }', '先记答案：比目前最短的还短，就记下起点和长度。'],
            ['\n                if (++need[(unsigned char)s[left]] > 0) {\n                    missing++;\n                }', '去掉最左边的字符：`++need[…]` 先把它欠的数加一，再拿加完的值去比较。大于 0 说明去掉的是必需的字符，又缺了一个。'],
            ['\n                left++;\n            }\n        }', '左端往右挪一格。']
          ),
          java: code(
            ['\n            while (missing == 0) {', '凑齐了就收缩，一直缩到又缺了为止。'],
            ['\n                if (right - left + 1 < bestLen) {\n                    bestStart = left;\n                    bestLen = right - left + 1;\n                }', '先记答案：比目前最短的还短，就记下起点和长度。'],
            ['\n                if (++need[s.charAt(left)] > 0) {\n                    missing++;\n                }', '去掉最左边的字符：先把它欠的数加一，再拿加完的值去比较。大于 0 说明去掉的是必需的字符，又缺了一个。'],
            ['\n                left++;\n            }\n        }', '左端往右挪一格。']
          ),
          rust: code(
            ['\n            while missing == 0 {', '凑齐了就收缩，一直缩到又缺了为止。'],
            ['\n                if right - left + 1 < best_len {\n                    best_start = left;\n                    best_len = right - left + 1;\n                }', '先记答案：比目前最短的还短，就记下起点和长度。'],
            ['\n                let out = b[left] as usize;\n                need[out] += 1;', '去掉最左边的字符：它欠的数加一。'],
            ['\n                if need[out] > 0 {\n                    missing += 1;\n                }', '加完大于 0，说明去掉的是必需的字符，又缺了一个。'],
            ['\n                left += 1;\n            }\n        }', '左端往右挪一格。']
          ),
        },
      },
      {
        section: '写代码',
        title: '截取出最短的子串',
        say: ['右端走到头了。best_len 如果还是那个不可能的值，说明从来没凑齐过，返回空字符串；否则按记下的起点和长度，把子串截取出来。'],
        ops: {
          python: code(['\n        return "" if best_len > len(s) else s[best_start:best_start + best_len]', '没找到返回空串；找到了用切片截出来，`s[a:b]` 取下标 a 到 b-1。']),
          c: code(
            ['\n    if (bestLen > n) {\n        bestLen = 0;\n    }', '没找到时，答案是空字符串，长度当作 0。'],
            ['\n    char* result = malloc(bestLen + 1);', '申请一块内存放答案：字符串末尾还要放一个 `\\0`，所以多申请 1 个字节。'],
            ['\n    memcpy(result, s + bestStart, bestLen);', '把 s 里从 bestStart 开始的 bestLen 个字符复制过来。`s + bestStart` 是指向第 bestStart 个字符的指针。'],
            ['\n    result[bestLen] = \'\\0\';\n    return result;\n}', '在末尾放上 `\\0` 表示字符串结束，再返回。']
          ),
          cpp: code(['\n        return bestLen > n ? "" : s.substr(bestStart, bestLen);\n    }\n};', '没找到返回空串；找到了用 `substr(起点, 长度)` 截出来。']),
          java: code(['\n        return bestLen > n ? "" : s.substring(bestStart, bestStart + bestLen);\n    }\n}', '没找到返回空串；找到了用 `substring(起点, 终点)` 截出来，终点那个字符不包括在内。']),
          rust: code(['\n        if best_len > b.len() {\n            String::new()\n        } else {\n            s[best_start..best_start + best_len].to_string()\n        }\n    }\n}', '没找到返回空的 `String`；找到了截出这一段（字母都是一个字节，按字节下标切是安全的），再转成 `String`。']),
        },
        sayBy: {
          java: [javadoc('String.substring(int beginIndex, int endIndex)', 'java/lang/String.html#substring(int,int)', 'Returns a string that is a substring of this string. The substring begins at the specified beginIndex and extends to the character at index endIndex - 1.', '返回这个字符串的一个子串：从 beginIndex 开始，到下标 endIndex - 1 的字符为止。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期："BANC"、"a"、空字符串。打印时两边加上引号，空字符串才看得出来。'],
        ops: {
          python: code(['\n\n\nif __name__ == "__main__":\n    for s, t in [("ADOBECODEBANC", "ABC"), ("a", "a"), ("a", "aa")]:\n        print(\'"\' + Solution().minWindow(s, t) + \'"\')', '三组样例放进列表，每次取出一对 (s, t)。结果两边拼上引号再打印。']).concat([{ pause: 500 }, { run: RUN.python, output: ['"BANC"', '"a"', '""'] }]),
          c: code(
            ['\n\nint main(void) {\n    char* tests[][2] = {{"ADOBECODEBANC", "ABC"}, {"a", "a"}, {"a", "aa"}};', '三组样例放进一个二维数组，每组两个字符串。'],
            ['\n    for (int i = 0; i < 3; i++) {\n        char* r = minWindow(tests[i][0], tests[i][1]);\n        printf("\\"%s\\"\\n", r);\n        free(r);\n    }\n    return 0;\n}', '依次调用并打印，`\\"` 是字符串里的双引号。打印完用 `free` 还掉申请的内存。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['"BANC"', '"a"', '""'] }]),
          cpp: code(['\n\nint main() {\n    string tests[][2] = {{"ADOBECODEBANC", "ABC"}, {"a", "a"}, {"a", "aa"}};\n    for (auto& test : tests) {\n        cout << \'"\' << Solution().minWindow(test[0], test[1]) << \'"\' << endl;\n    }\n    return 0;\n}', '三组样例放进数组，`for (auto& test : tests)` 依次取出每一组。结果两边加上引号打印。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['"BANC"', '"a"', '""'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        String[][] tests = {{"ADOBECODEBANC", "ABC"}, {"a", "a"}, {"a", "aa"}};\n        for (String[] test : tests) {\n            System.out.println("\\"" + new Solution().minWindow(test[0], test[1]) + "\\"");\n        }\n    }\n}', '三组样例放进二维数组，依次取出每一组调用。结果两边拼上引号打印。']).concat([{ pause: 500 }, { run: RUN.java, output: ['"BANC"', '"a"', '""'] }]),
          rust: code(['\n\nfn main() {\n    for (s, t) in [("ADOBECODEBANC", "ABC"), ("a", "a"), ("a", "aa")] {\n        println!("{:?}", Solution::min_window(s.to_string(), t.to_string()));\n    }\n}', '依次取出每一组 (s, t)。`{:?}` 打印字符串时会自带双引号。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['"BANC"', '"a"', '""'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这个模块写完了',
        say: [
          '困难题拆开看，就是 209 的「满足就收缩」加上 438 的计数表，再多一个 `missing` 把「凑齐没有」变成 O(1) 的判断。时间 O(n)，额外空间 O(1)。',
          '回头看这 7 道题，滑动窗口要想清楚的始终是三件事：窗口里维护什么（和、集合、计数表、还缺几个），什么时候扩张，什么时候收缩。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
