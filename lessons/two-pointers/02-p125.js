/*
 * 双指针 · 相向指针 · 125 验证回文串（简单）
 * 两头往中间比；不是字母数字的字符直接跳过，比较时统一成小写。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cdoc, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.TP;

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-125',
    group: '相向指针',
    label: '125',
    title: '验证回文串',
    summary: '回文就是对称：一个指针从左、一个从右，往中间比。遇到标点空格就跳过，比较时统一成小写。',
    problem: { id: 125, level: 'easy', url: leetcode('valid-palindrome') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '如果在将所有大写字符转换为小写字符、并移除所有非字母数字字符之后，短语正着读和反着读都一样，则可以认为该短语是一个**回文串**。字母和数字都属于字母数字字符。给你一个字符串 `s`，如果它是回文串，返回 `true`；否则，返回 `false`。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"A man, a plan, a canal: Panama"`', '`true`', '整理后是 "amanaplanacanalpanama"'],
                ['`"race a car"`', '`false`', '整理后是 "raceacar"'],
                ['`" "`', '`true`', '整理后是空串，空串是回文'],
              ],
            },
          },
          { list: ['`1 <= s.length <= 2 * 10^5`', '`s` 仅由可打印的 ASCII 字符组成'] },
          '<a href="' + leetcode('valid-palindrome') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：两头往中间比',
        doc: [
          '最直接的做法：先造一个新字符串，只留下字母数字并换成小写，再看它和反过来的自己是否相同。这要额外 O(n) 的空间。',
          '回文的意思是**对称**：第一个和最后一个相同，第二个和倒数第二个相同……所以用两个指针，left 从左端、right 从右端，一对一对往中间比，不用造新字符串：',
          {
            list: [
              'left 指的不是字母数字：跳过它，left 右移。',
              'right 指的不是字母数字：跳过它，right 左移。',
              '两个都是：换成小写比较。不同就不是回文；相同就各往中间走一步。',
            ],
          },
          { viz: { kind: 'array', title: '"Taco cat!"', frames: trace.palin('Taco cat!') } },
          { viz: { kind: 'array', title: '"race a car"', frames: trace.palin('race a car') } },
          '两个指针加起来最多走 n 步，时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，两个指针放到两端',
        say: ['函数收字符串，返回是不是回文。两个指针一个放在开头，一个放在结尾。'],
        ops: {
          python: code(
            ['class Solution:', '力扣要求把解法放进 `Solution` 类里。'],
            ['\n    def isPalindrome(self, s: str) -> bool:', '题目给的方法：收字符串，返回布尔值。'],
            ['\n        left, right = 0, len(s) - 1', 'left 指第一个字符，right 指最后一个字符。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n#include <ctype.h>', '要用 `bool`、`strlen`，以及判断和转换字符的 `isalnum`、`tolower`，它们在 `ctype.h` 里。'],
            ['\n\nbool isPalindrome(char* s) {', '题目给的函数。'],
            ['\n    int left = 0, right = strlen(s) - 1;', 'left 指第一个字符，right 指最后一个字符。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;', '要用 `string`，以及 `cctype` 里的 `isalnum`、`tolower`。'],
            ['\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {', '照例写类和方法。'],
            ['\n        int left = 0, right = (int)s.size() - 1;', 'left 指第一个字符，right 指最后一个。`size()` 是无符号数，先转成 int 再减一，免得和有符号数混用。']
          ),
          java: code(
            ['class Solution {\n    public boolean isPalindrome(String s) {', '照例写类和方法。'],
            ['\n        int left = 0, right = s.length() - 1;', 'left 指第一个字符，right 指最后一个字符。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn is_palindrome(s: String) -> bool {', '照例写结构体和函数。'],
            ['\n        let b = s.as_bytes();', '题目说只有 ASCII 字符，每个字符一个字节，转成字节数组就能按下标取。'],
            ['\n        let (mut left, mut right) = (0, b.len() - 1);', 'left 指第一个，right 指最后一个。题目保证至少一个字符，`len() - 1` 不会变成负数（usize 不能是负数，减过头会出错）。']
          ),
        },
      },
      {
        section: '写代码',
        title: '跳过、比较、往中间走',
        say: [
          '只要两个指针还没相遇，就看一眼两边：不是字母数字的先跳过；两边都是了，再换成小写比较。不同直接返回 false，相同就一起往中间走。',
          { viz: { kind: 'array', title: '两头往中间', frames: trace.palin('Taco cat!') } },
        ],
        ops: {
          python: code(
            ['\n        while left < right:', '两个指针相遇（或交错）时就比完了。只剩一个字符时不用比，它和自己对称。'],
            ['\n            if not s[left].isalnum():\n                left += 1', '左边不是字母数字，跳过它。这一轮只做这一件事，下一轮再重新看。'],
            ['\n            elif not s[right].isalnum():\n                right -= 1', '右边不是字母数字，跳过它。'],
            ['\n            elif s[left].lower() != s[right].lower():\n                return False', '两边都是字母数字了：换成小写比较，不同就不是回文。'],
            ['\n            else:\n                left += 1\n                right -= 1', '相同：这一对比完了，两个指针都往中间走。'],
            ['\n        return True', '每一对都相同，是回文。']
          ),
          c: code(
            ['\n    while (left < right) {', '两个指针还没相遇，就继续比。'],
            ['\n        if (!isalnum((unsigned char)s[left])) {\n            left++;', '左边不是字母数字，跳过。`isalnum` 要求参数是 unsigned char 范围的值，先转一下更安全。'],
            ['\n        } else if (!isalnum((unsigned char)s[right])) {\n            right--;', '右边不是字母数字，跳过。'],
            ['\n        } else if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {\n            return false;', '两边都是字母数字：换成小写比较，不同就不是回文。'],
            ['\n        } else {\n            left++;\n            right--;\n        }\n    }', '相同：两个指针都往中间走。'],
            ['\n    return true;\n}', '每一对都相同，是回文。']
          ),
          cpp: code(
            ['\n        while (left < right) {', '两个指针还没相遇，就继续比。'],
            ['\n            if (!isalnum((unsigned char)s[left])) {\n                left++;', '左边不是字母数字，跳过。'],
            ['\n            } else if (!isalnum((unsigned char)s[right])) {\n                right--;', '右边不是字母数字，跳过。'],
            ['\n            } else if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) {\n                return false;', '换成小写比较，不同就不是回文。'],
            ['\n            } else {\n                left++;\n                right--;\n            }\n        }\n        return true;\n    }\n};', '相同就往中间走；比完了都相同，是回文。']
          ),
          java: code(
            ['\n        while (left < right) {', '两个指针还没相遇，就继续比。'],
            ['\n            char a = s.charAt(left), b = s.charAt(right);', '取出两端的字符。'],
            ['\n            if (!Character.isLetterOrDigit(a)) {\n                left++;', '左边不是字母或数字，跳过。'],
            ['\n            } else if (!Character.isLetterOrDigit(b)) {\n                right--;', '右边不是字母或数字，跳过。'],
            ['\n            } else if (Character.toLowerCase(a) != Character.toLowerCase(b)) {\n                return false;', '换成小写比较，不同就不是回文。'],
            ['\n            } else {\n                left++;\n                right--;\n            }\n        }\n        return true;\n    }\n}', '相同就往中间走；比完了都相同，是回文。']
          ),
          rust: code(
            ['\n        while left < right {', '两个指针还没相遇，就继续比。'],
            ['\n            if !b[left].is_ascii_alphanumeric() {\n                left += 1;', '左边不是字母数字，跳过。'],
            ['\n            } else if !b[right].is_ascii_alphanumeric() {\n                right -= 1;', '右边不是字母数字，跳过。left < right 说明 right 至少是 1，减一不会出错。'],
            ['\n            } else if b[left].to_ascii_lowercase() != b[right].to_ascii_lowercase() {\n                return false;', '换成小写比较，不同就不是回文。'],
            ['\n            } else {\n                left += 1;\n                right -= 1;\n            }\n        }\n        true\n    }\n}', '相同就往中间走；比完了都相同，是回文。']
          ),
        },
        sayBy: {
          python: [py('str.isalnum()', 'library/stdtypes.html#str.isalnum', 'Return True if all characters in the string are alphanumeric and there is at least one character, False otherwise.', '如果字符串里所有字符都是字母或数字、并且至少有一个字符，返回 True，否则返回 False。')],
          c: [
            cdoc('isalnum(int c)', 'Classification-of-Characters.html', 'Returns true if c is an alphanumeric character (a letter or number); in other words, if either isalpha or isdigit is true of a character, then isalnum is also true.', '如果 c 是字母或数字，返回真；也就是说，只要 isalpha 或 isdigit 对它成立，isalnum 就成立。'),
            cdoc('tolower(int c)', 'Case-Conversion.html', 'If c is an upper-case letter, tolower returns the corresponding lower-case letter. If c is not an upper-case letter, c is returned unchanged.', '如果 c 是大写字母，tolower 返回对应的小写字母；不是大写字母就原样返回。'),
          ],
          java: [javadoc('Character.isLetterOrDigit(char ch)', 'java/lang/Character.html#isLetterOrDigit(char)', 'Determines if the specified character is a letter or digit.', '判断指定的字符是不是字母或数字。')],
          rust: [rustdoc('u8::is_ascii_alphanumeric', 'primitive.u8.html#method.is_ascii_alphanumeric', "Checks if the value is an ASCII alphanumeric character: U+0041 'A' ..= U+005A 'Z', or U+0061 'a' ..= U+007A 'z', or U+0030 '0' ..= U+0039 '9'.", '检查这个值是不是 ASCII 字母或数字：A 到 Z、a 到 z、0 到 9。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：true、false、true。第三个只有一个空格，整理后是空串，算回文。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    for s in ["A man, a plan, a canal: Panama", "race a car", " "]:\n        print(Solution().isPalindrome(s))', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'False', 'True'] }]),
          c: code(['\n\nint main(void) {\n    char* cases[] = {"A man, a plan, a canal: Panama", "race a car", " "};\n    for (int k = 0; k < 3; k++) {\n        printf("%s\\n", isPalindrome(cases[k]) ? "true" : "false");\n    }\n    return 0;\n}', '三个样例挨个跑，按 true / false 打印。']).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'false', 'true'] }]),
          cpp: code(['\n\nint main() {\n    cout << boolalpha;\n    for (string s : {"A man, a plan, a canal: Panama", "race a car", " "}) {\n        cout << Solution().isPalindrome(s) << endl;\n    }\n    return 0;\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'false', 'true'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        for (String s : new String[]{"A man, a plan, a canal: Panama", "race a car", " "}) {\n            System.out.println(new Solution().isPalindrome(s));\n        }\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'false', 'true'] }]),
          rust: code(['\n\nfn main() {\n    for s in ["A man, a plan, a canal: Panama", "race a car", " "] {\n        println!("{}", Solution::is_palindrome(s.to_string()));\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'false', 'true'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '回文就是对称，相向指针从两端一对对往中间比。每一轮只做一件事（跳过左边、跳过右边、或者比较一对），代码最不容易错。时间 O(n)，额外空间 O(1)。',
          '下一题「反转字符串中的元音字母」也是两头往中间，不过不是比较，而是交换。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
