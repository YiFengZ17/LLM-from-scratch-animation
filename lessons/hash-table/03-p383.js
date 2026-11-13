/*
 * 哈希表与数组 · 383 赎金信（简单）
 * 计数：杂志里每个字母有几个，用一个长 26 的数组当哈希表。再按信里的字母一个个用掉。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py } = root.LessonKit;
  const { trace } = root.HT;

  root.Catalog.addChapter('hash-table', {
    id: 'ht-383',
    label: '383',
    title: '赎金信',
    summary: '先数杂志里每个字母有几个，再按信里的字母一个个用掉；哪个减成负数就是不够。字母只有 26 个，数组就是哈希表。',
    problem: { id: 383, level: 'easy', url: leetcode('ransom-note') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你两个字符串：`ransomNote` 和 `magazine`，判断 `ransomNote` 能不能由 `magazine` 里面的字符构成。如果可以，返回 `true`；否则返回 `false`。`magazine` 中的每个字符只能在 `ransomNote` 中使用一次。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`ransomNote = "a"`, `magazine = "b"`', '`false`', '杂志里没有 a'],
                ['`ransomNote = "aa"`, `magazine = "ab"`', '`false`', '杂志里只有一个 a'],
                ['`ransomNote = "aa"`, `magazine = "aab"`', '`true`', ''],
              ],
            },
          },
          { list: ['`1 <= ransomNote.length, magazine.length <= 10^5`', '`ransomNote` 和 `magazine` 由小写英文字母组成'] },
          '<a href="' + leetcode('ransom-note') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：数一数每个字母有几个',
        doc: [
          '想象把杂志剪成一个个字母，按字母分成 26 堆。写信时每用一个字母，就从对应的那堆里拿走一个。哪堆不够拿了，就写不成。',
          '「每堆有几个」就是一张计数表：键是字母，值是个数。键只有 26 种小写字母，用一个长 26 的数组就行，`a` 在第 0 格、`b` 在第 1 格……字母减去 `\'a\'` 就是它的格子号。',
          { viz: { kind: 'grid', title: 'ransomNote = "aa"，magazine = "aab"', frames: trace.ransom('aa', 'aab') } },
          { viz: { kind: 'grid', title: 'ransomNote = "aa"，magazine = "ab"', frames: trace.ransom('aa', 'ab') } },
          '两个字符串各扫一遍，时间 O(m + n)；计数数组固定 26 格，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和 26 个计数器',
        say: ['函数收两个字符串，返回能不能写成。先准备 26 个从 0 开始的计数器。'],
        ops: {
          python: code(
            ['class Solution:\n    def canConstruct(self, ransomNote: str, magazine: str) -> bool:', '照例写类和方法，返回布尔值。'],
            ['\n        cnt = [0] * 26', '26 个字母，每个一个计数器，先全是 0。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>', '要用 `printf` 和 `bool`。'],
            ['\n\nbool canConstruct(char* ransomNote, char* magazine) {', '题目给的函数：两个字符串，返回布尔值。'],
            ['\n    int cnt[26] = {0};', '26 个计数器。`= {0}` 让整个数组都从 0 开始。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canConstruct(string ransomNote, string magazine) {', '照例的架子。'],
            ['\n        int cnt[26] = {0};', '26 个计数器，全从 0 开始。']
          ),
          java: code(
            ['class Solution {\n    public boolean canConstruct(String ransomNote, String magazine) {', '照例的架子。'],
            ['\n        int[] cnt = new int[26];', '26 个计数器，新建的 int 数组每格都是 0。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn can_construct(ransom_note: String, magazine: String) -> bool {', '照例的架子。'],
            ['\n        let mut cnt = [0i32; 26];', '26 个计数器。后面要减到负数来判断不够，所以写明是有符号的 `i32`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '数杂志里的字母',
        say: ['把杂志从头到尾过一遍，每个字母让它的计数器加一。字母减去 a，就是它的格子号。'],
        ops: {
          python: code(['\n        for ch in magazine:\n            cnt[ord(ch) - ord("a")] += 1', '逐个字符看。`ord` 取字符的编码，小写字母的编码是连续的，减去 a 的编码，就得到 0 到 25。']),
          c: code(['\n    for (char* p = magazine; *p; p++) {\n        cnt[*p - \'a\']++;\n    }', '用指针 p 从字符串开头往后走，`*p` 是当前字符；碰到结尾的 `\\0` 时 `*p` 为 0，循环停下。C 的字符本身就是数，直接减 \'a\' 得到格子号。']),
          cpp: code(['\n        for (char ch : magazine) {\n            cnt[ch - \'a\']++;\n        }', '范围 for 逐个取出字符，减 \'a\' 得到格子号，计数加一。']),
          java: code(['\n        for (char ch : magazine.toCharArray()) {\n            cnt[ch - \'a\']++;\n        }', '`toCharArray()` 把字符串变成字符数组，逐个取出，减 \'a\' 得到格子号。']),
          rust: code(['\n        for b in magazine.bytes() {\n            cnt[(b - b\'a\') as usize] += 1;\n        }', '`bytes()` 逐个取出字节（小写字母各占一个字节），减去 `b\'a\'` 得到 0 到 25，转成 usize 当下标。']),
        },
        sayBy: {
          python: [py('ord(c)', 'library/functions.html#ord', 'Given a string representing one Unicode character, return an integer representing the Unicode code point of that character.', '给一个只含一个 Unicode 字符的字符串，返回这个字符的 Unicode 码位（一个整数）。')],
        },
      },
      {
        section: '写代码',
        title: '按信里的字母一个个用掉',
        say: [
          '再把信过一遍，每个字母从对应的堆里拿走一个。拿完如果变成了负数，说明杂志里这个字母不够，马上返回 false。信写完都没出问题，就返回 true。',
          { viz: { kind: 'grid', title: '用到不够为止', frames: trace.ransom('aa', 'ab') } },
        ],
        ops: {
          python: code(
            ['\n        for ch in ransomNote:', '逐个看信里的字母。'],
            ['\n            i = ord(ch) - ord("a")\n            cnt[i] -= 1', '算出格子号，拿走一个。'],
            ['\n            if cnt[i] < 0:\n                return False', '拿成负数了：杂志里这个字母不够，写不成，后面不用再看。'],
            ['\n        return True', '信里每个字母都拿到了。']
          ),
          c: code(
            ['\n    for (char* p = ransomNote; *p; p++) {', '逐个看信里的字母。'],
            ['\n        if (--cnt[*p - \'a\'] < 0) {\n            return false;\n        }\n    }', '`--cnt[…]` 先减一再拿来比较：拿走一个以后变成负数，就是不够。'],
            ['\n    return true;\n}', '信里每个字母都拿到了。']
          ),
          cpp: code(
            ['\n        for (char ch : ransomNote) {', '逐个看信里的字母。'],
            ['\n            if (--cnt[ch - \'a\'] < 0) {\n                return false;\n            }\n        }', '先减一，再看是不是变成了负数。'],
            ['\n        return true;\n    }\n};', '信里每个字母都拿到了。']
          ),
          java: code(
            ['\n        for (char ch : ransomNote.toCharArray()) {', '逐个看信里的字母。'],
            ['\n            if (--cnt[ch - \'a\'] < 0) {\n                return false;\n            }\n        }', '先减一，再看是不是变成了负数。'],
            ['\n        return true;\n    }\n}', '信里每个字母都拿到了。']
          ),
          rust: code(
            ['\n        for b in ransom_note.bytes() {\n            let i = (b - b\'a\') as usize;', '逐个看信里的字母，算出格子号。'],
            ['\n            cnt[i] -= 1;\n            if cnt[i] < 0 {\n                return false;\n            }\n        }', 'Rust 没有 `--`，先减一，再看是不是变成了负数。'],
            ['\n        true\n    }\n}', '信里每个字母都拿到了，最后一个表达式就是返回值。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：false、false、true。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().canConstruct("a", "b"))\n    print(Solution().canConstruct("aa", "ab"))\n    print(Solution().canConstruct("aa", "aab"))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['False', 'False', 'True'] }]),
          c: code(
            ['\n\nint main(void) {\n    bool r[] = {canConstruct("a", "b"), canConstruct("aa", "ab"), canConstruct("aa", "aab")};', '写一个入口，三个结果放进数组。'],
            ['\n    for (int k = 0; k < 3; k++) {\n        printf("%s\\n", r[k] ? "true" : "false");\n    }\n    return 0;\n}', '按 true / false 打印。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['false', 'false', 'true'] }]),
          cpp: code(['\n\nint main() {\n    Solution s;\n    cout << boolalpha << s.canConstruct("a", "b") << endl << s.canConstruct("aa", "ab") << endl << s.canConstruct("aa", "aab") << endl;\n    return 0;\n}', '`boolalpha` 让布尔值打印成 true / false。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['false', 'false', 'true'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();\n        System.out.println(s.canConstruct("a", "b"));\n        System.out.println(s.canConstruct("aa", "ab"));\n        System.out.println(s.canConstruct("aa", "aab"));\n    }\n}', '三个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['false', 'false', 'true'] }]),
          rust: code(['\n\nfn main() {\n    for (note, mag) in [("a", "b"), ("aa", "ab"), ("aa", "aab")] {\n        println!("{}", Solution::can_construct(note.to_string(), mag.to_string()));\n    }\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['false', 'false', 'true'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '计数表的键是字母，范围只有 26 个，数组就是一张没有冲突的哈希表。时间 O(m + n)，额外空间 O(1)。',
          '下一题「两数之和」的键是 ±10<sup>9</sup> 范围里的整数，开不出这么大的数组，就要用真正的哈希表了。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
