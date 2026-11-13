/*
 * 滑动窗口 · 3 无重复字符的最长子串（中等，变长窗口：求最长）
 * 写法约定见 02-p643.js。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { py } = root.LessonKit;

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-3',
    label: '3',
    title: '无重复字符的最长子串',
    summary: '求最长：窗口里出现重复字符时才收缩，收缩完再记长度。',
    problem: { id: 3, level: 'medium', url: leetcode('longest-substring-without-repeating-characters') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给一个字符串 `s`，找出其中不含重复字符的最长子串，返回它的长度。子串必须是连续的一段。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "abcabcbb"`', '`3`', '最长的是 "abc"'],
                ['`s = "bbbbb"`', '`1`', '最长的是 "b"'],
                ['`s = "pwwkew"`', '`3`', '最长的是 "wke"。"pwke" 不连续，是子序列不是子串'],
              ],
            },
          },
          { list: ['`0 <= s.length <= 5 * 10^4`', '`s` 由英文字母、数字、符号和空格组成'] },
          '<a href="' + leetcode('longest-substring-without-repeating-characters') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '还是让右端一格一格往右扩张。窗口里没有重复字符的时候，它就是一个合格的子串，记下长度；一旦新进来的字符和窗口里的重复了，就从左边收缩，直到那个重复的字符只剩一个。',
          '和上一题正好反过来：上一题求最短，**满足**条件就收缩；这一题求最长，**不满足**条件才收缩，缩到满足了再记答案。',
          '怎么知道「窗口里有没有重复」？给每个字符记一个次数：它在窗口里出现了几次。新字符进来，它的次数从 1 变成 2，就是重复了；左端每去掉一个字符，它的次数减一。',
          { viz: { kind: 'array', title: '样例 1："abcabcbb"', frames: trace.longestUnique('abcabcbb') } },
          '左右端点都只往右走，时间 O(n)。计数表的大小只和字符种类有关（最多 128 种），额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一个字符串，返回最长长度。'],
        ops: {
          python: code(['class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:', '照题目的签名写：收字符串，返回整数。']),
          c: code(['#include <stdio.h>\n\nint lengthOfLongestSubstring(char* s) {', '照题目的签名写：收字符串（`char*`），返回整数。']),
          cpp: code(['#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {', '照题目的签名写：收字符串，返回整数。']),
          java: code(['class Solution {\n    public int lengthOfLongestSubstring(String s) {', '照题目的签名写：收字符串，返回整数。']),
          rust: code(['struct Solution;\n\nimpl Solution {\n    pub fn length_of_longest_substring(s: String) -> i32 {', '照题目的签名写：收字符串，返回 `i32`。']),
        },
      },
      {
        section: '写代码',
        title: '一张计数表，记每个字符出现几次',
        say: ['要随时知道「窗口里有没有重复」，就给每个字符记一个次数。再加上窗口的左端和目前最长的长度，一共三样东西。'],
        ops: {
          python: code(
            ['\n        count = {}', '用一个字典当计数表：键是字符，值是它在窗口里出现的次数。一开始窗口是空的，字典也是空的。'],
            ['\n        left = 0', '窗口的左端，从最左边开始。'],
            ['\n        best = 0', '目前找到的最长长度。空字符串的答案就是 0，所以从 0 开始正好。']
          ),
          c: code(
            ['\n    int count[128] = {0};', '计数表用一个长度 128 的数组：字符在 C 里就是一个小整数（ASCII 码，0 到 127），可以直接当下标。`= {0}` 把所有格子都设成 0。'],
            ['\n    int left = 0;', '窗口的左端，从最左边开始。'],
            ['\n    int best = 0;', '目前找到的最长长度，从 0 开始。']
          ),
          cpp: code(
            ['\n        int count[128] = {0};', '计数表用一个长度 128 的数组：字符本身就是 0 到 127 的整数（ASCII 码），可以直接当下标。全部设成 0。'],
            ['\n        int left = 0;', '窗口的左端，从最左边开始。'],
            ['\n        int best = 0;', '目前找到的最长长度，从 0 开始。']
          ),
          java: code(
            ['\n        int[] count = new int[128];', '计数表用一个长度 128 的数组，下标就是字符的 ASCII 码。Java 新建的 int 数组每一格自动是 0。'],
            ['\n        int left = 0;', '窗口的左端，从最左边开始。'],
            ['\n        int best = 0;', '目前找到的最长长度，从 0 开始。']
          ),
          rust: code(
            ['\n        let b = s.as_bytes();', '按下标取字符，先转成字节数组。'],
            ['\n        let mut count = [0; 128];', '计数表用一个长度 128 的数组，`[0; 128]` 表示 128 个 0。下标是字符的 ASCII 码。'],
            ['\n        let mut left = 0;', '窗口的左端，从最左边开始。'],
            ['\n        let mut best = 0;', '目前找到的最长长度，从 0 开始。']
          ),
        },
      },
      {
        section: '写代码',
        title: '右端扩张，记下新字符的次数',
        say: ['右端一格一格往右走，每次把新字符放进窗口：它的次数加一。'],
        ops: {
          python: code(
            ['\n        for right, ch in enumerate(s):', '右端走遍整个字符串。后面既要用字符本身，也要用它的位置算长度，所以用 `enumerate` 同时拿到下标和字符。'],
            ['\n            count[ch] = count.get(ch, 0) + 1', '新字符的次数加一。它可能还不在字典里，直接写 `count[ch] += 1` 会报错；`count.get(ch, 0)` 在没有时返回 0。']
          ),
          c: code(
            ['\n    for (int right = 0; s[right] != \'\\0\'; right++) {', '右端走遍整个字符串。C 的字符串以 `\\0` 结尾，走到它就停，不用事先量长度。'],
            ['\n        unsigned char c = s[right];', '先把新字符取出来，后面要用好几次。拿字符当数组下标，必须保证它是不小于 0 的编号，所以存成 `unsigned char`（无符号）。'],
            ['\n        count[c]++;', '新字符的次数加一。']
          ),
          cpp: code(
            ['\n        for (int right = 0; right < (int)s.size(); right++) {', '右端走遍整个字符串。'],
            ['\n            unsigned char c = s[right];', '先把新字符取出来，后面要用好几次。拿字符当数组下标，必须保证它是不小于 0 的编号，所以存成 `unsigned char`。'],
            ['\n            count[c]++;', '新字符的次数加一。']
          ),
          java: code(
            ['\n        for (int right = 0; right < s.length(); right++) {', '右端走遍整个字符串。'],
            ['\n            char c = s.charAt(right);', '先取出新字符，后面要用好几次。'],
            ['\n            count[c]++;', '它的次数加一。char 当下标时会自动变成整数。']
          ),
          rust: code(
            ['\n        for right in 0..b.len() {', '右端走遍整个字符串。'],
            ['\n            count[b[right] as usize] += 1;', '新字符的次数加一。数组下标必须是 `usize`，字节是 `u8`，所以用 `as usize` 转一下。']
          ),
        },
        sayBy: {
          python: [py('dict.get(key, default=None)', 'library/stdtypes.html#dict.get', 'Return the value for key if key is in the dictionary, else default.', '键在字典里就返回它的值，否则返回 default。')],
        },
      },
      {
        section: '写代码',
        title: '重复了，就从左端收缩',
        say: [
          '新字符放进去后，它的次数如果大于 1，说明窗口里出现了重复。这时从左边一个一个去掉字符，直到这个字符只剩一个为止。',
          { viz: { kind: 'array', title: '样例 3："pwwkew"', frames: trace.longestUnique('pwwkew') } },
        ],
        ops: {
          python: code(
            ['\n            while count[ch] > 1:', '重复的一定是刚进来的这个字符（之前的窗口没有重复）。只要它还多于一个，就继续收缩。用 `while`，因为可能要去掉好几个字符才轮到那个重复的。'],
            ['\n                count[s[left]] -= 1', '去掉最左边的字符：它的次数减一。'],
            ['\n                left += 1', '左端往右挪一格。']
          ),
          c: code(
            ['\n        while (count[c] > 1) {', '重复的一定是刚进来的字符 c。只要它还多于一个，就继续收缩。'],
            ['\n            count[(unsigned char)s[left]]--;', '去掉最左边的字符：它的次数减一。同样转成 `unsigned char` 再当下标。'],
            ['\n            left++;\n        }', '左端往右挪一格。']
          ),
          cpp: code(
            ['\n            while (count[c] > 1) {', '重复的一定是刚进来的字符 c。只要它还多于一个，就继续收缩。'],
            ['\n                count[(unsigned char)s[left]]--;', '去掉最左边的字符：它的次数减一。'],
            ['\n                left++;\n            }', '左端往右挪一格。']
          ),
          java: code(
            ['\n            while (count[c] > 1) {', '重复的一定是刚进来的字符 c。只要它还多于一个，就继续收缩。'],
            ['\n                count[s.charAt(left)]--;', '去掉最左边的字符：它的次数减一。'],
            ['\n                left++;\n            }', '左端往右挪一格。']
          ),
          rust: code(
            ['\n            while count[b[right] as usize] > 1 {', '重复的一定是刚进来的字符。只要它还多于一个，就继续收缩。'],
            ['\n                count[b[left] as usize] -= 1;', '去掉最左边的字符：它的次数减一。'],
            ['\n                left += 1;\n            }', '左端往右挪一格。']
          ),
        },
      },
      {
        section: '写代码',
        title: '窗口没有重复了，记下长度',
        say: ['走到这里，窗口里一定没有重复字符，它是一个合格的子串。比一比它是不是目前最长的。'],
        ops: {
          python: code(['\n            best = max(best, right - left + 1)', '窗口从 left 到 right，长度 right - left + 1。比目前最长的还长就换掉。']),
          c: code(['\n        if (right - left + 1 > best) {\n            best = right - left + 1;\n        }\n    }', '窗口长度 right - left + 1，比目前最长的还长就换掉。']),
          cpp: code(['\n            best = max(best, right - left + 1);\n        }', '窗口长度 right - left + 1，`max` 留下长的。']),
          java: code(['\n            best = Math.max(best, right - left + 1);\n        }', '窗口长度 right - left + 1，`Math.max` 留下长的。']),
          rust: code(['\n            best = best.max(right - left + 1);\n        }', '窗口长度 right - left + 1，留下长的。']),
        },
      },
      {
        section: '写代码',
        title: '返回最长长度',
        say: ['右端走到头，best 就是答案。'],
        ops: {
          python: code(['\n        return best', '返回最长长度。']),
          c: code(['\n    return best;\n}', '返回最长长度。']),
          cpp: code(['\n        return best;\n    }\n};', '返回最长长度。']),
          java: code(['\n        return best;\n    }\n}', '返回最长长度。']),
          rust: code(['\n        best as i32\n    }\n}', 'best 是 `usize`，转成题目要的 `i32` 返回。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：3、1、3。第三个样例 "pwwkew" 最能检验收缩：遇到第二个 w 时，左端要一口气跳过 "pw"。'],
        ops: {
          python: code(['\n\n\nif __name__ == "__main__":\n    for s in ["abcabcbb", "bbbbb", "pwwkew"]:\n        print(Solution().lengthOfLongestSubstring(s))', '三个样例放进一个列表，用循环一个个调用。']).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '1', '3'] }]),
          c: code(['\n\nint main(void) {\n    printf("%d\\n", lengthOfLongestSubstring("abcabcbb"));\n    printf("%d\\n", lengthOfLongestSubstring("bbbbb"));\n    printf("%d\\n", lengthOfLongestSubstring("pwwkew"));\n    return 0;\n}', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '1', '3'] }]),
          cpp: code(['\n\nint main() {\n    for (string s : {"abcabcbb", "bbbbb", "pwwkew"}) {\n        cout << Solution().lengthOfLongestSubstring(s) << endl;\n    }\n    return 0;\n}', '`for (string s : {…})` 依次取出花括号里的每个样例，用循环调用。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '1', '3'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (String s : new String[]{"abcabcbb", "bbbbb", "pwwkew"}) {\n            System.out.println(new Solution().lengthOfLongestSubstring(s));\n        }\n    }\n}', '把三个样例放进数组，用 `for (String s : 数组)` 依次取出来调用。']).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '1', '3'] }]),
          rust: code(['\n\nfn main() {\n    for s in ["abcabcbb", "bbbbb", "pwwkew"] {\n        println!("{}", Solution::length_of_longest_substring(s.to_string()));\n    }\n}', '依次取出三个样例。它们是 `&str`，用 `to_string()` 转成函数要的 `String`。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '1', '3'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '求最长的变长窗口：右端扩张后，如果窗口不合格就收缩到合格，然后记答案。和 209 对照着看，区别只在 while 的条件和记答案的位置。',
          '下一题又回到定长窗口，但窗口里要维护的是一整张计数表：判断窗口里的字母是不是正好是另一个字符串的重新排列。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
