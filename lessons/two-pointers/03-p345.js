/*
 * 双指针 · 相向指针 · 345 反转字符串中的元音字母（简单）
 * 和验证回文串同一个形状：两头往中间，各自停在元音上，交换。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { rustdoc } = root.LessonKit;
  const { trace } = root.TP;

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-345',
    group: '相向指针',
    label: '345',
    title: '反转字符串中的元音字母',
    summary: '反转就是第一个和最后一个对调、第二个和倒数第二个对调……两头往中间，都停在元音上就交换。',
    problem: { id: 345, level: 'easy', url: leetcode('reverse-vowels-of-a-string') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个字符串 `s`，仅反转字符串中的所有元音字母，并返回结果字符串。元音字母包括 `\'a\'`、`\'e\'`、`\'i\'`、`\'o\'`、`\'u\'`，且可能以大小写两种形式出现不止一次。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`"IceCreAm"`', '`"AceCreIm"`', '元音依次是 I、e、e、A，反转后是 A、e、e、I'],
                ['`"leetcode"`', '`"leotcede"`', ''],
              ],
            },
          },
          { list: ['`1 <= s.length <= 3 * 10^5`', '`s` 由可打印的 ASCII 字符组成'] },
          '<a href="' + leetcode('reverse-vowels-of-a-string') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '把一串东西反转，就是第一个和最后一个对调、第二个和倒数第二个对调……一直对调到中间。这正是相向指针。',
          '这题只反转元音，辅音原地不动。那就让两个指针都**跳过辅音**：left 往右找到一个元音，right 往左找到一个元音，交换它们，再各走一步。和上一题一样，每一轮只做一件事：跳过左边、跳过右边、或者交换一对。',
          { viz: { kind: 'array', title: '"leetcode"', frames: trace.vowels('leetcode') } },
          '有些语言的字符串不能原地修改（Python、Java、Rust），要先变成字符数组，换完再拼回字符串。时间 O(n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：能改的字符数组，和「是不是元音」',
        say: ['要交换字符，先得有一个能改的字符数组；还要一个判断「是不是元音」的办法。然后两个指针放到两端。'],
        ops: {
          python: code(
            ['class Solution:\n    def reverseVowels(self, s: str) -> str:', '照例写类和方法，返回新字符串。'],
            ['\n        vowels = set("aeiouAEIOU")', '十个元音放进集合，问「是不是元音」一步就知道。'],
            ['\n        chars = list(s)', 'Python 的字符串不能改，先拆成字符列表。'],
            ['\n        left, right = 0, len(chars) - 1', '两个指针放到两端。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `bool`、`strlen` 和 `strchr`。'],
            ['\n\nstatic bool isVowel(char c) {\n    return strchr("aeiouAEIOU", c) != NULL;\n}', '判断元音的小函数：`strchr` 在字符串 "aeiouAEIOU" 里找字符 c，找到返回它的位置，找不到返回空指针。'],
            ['\n\nchar* reverseVowels(char* s) {', '题目给的函数：C 的字符串本来就能改，直接在原地交换，再把它返回。'],
            ['\n    int left = 0, right = strlen(s) - 1;', '两个指针放到两端。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <string>\n#include <utility>\nusing namespace std;', '要用 `string`，以及交换两个值的 `swap`。'],
            ['\n\nclass Solution {\npublic:\n    string reverseVowels(string s) {', '照例的架子。s 是按值传进来的副本，可以直接改。'],
            ['\n        string vowels = "aeiouAEIOU";', '十个元音，后面用 `find` 在里面找。'],
            ['\n        int left = 0, right = (int)s.size() - 1;', '两个指针放到两端。']
          ),
          java: code(
            ['class Solution {\n    public String reverseVowels(String s) {', '照例的架子。'],
            ['\n        String vowels = "aeiouAEIOU";', '十个元音，后面用 `indexOf` 在里面找。'],
            ['\n        char[] chars = s.toCharArray();', 'Java 的字符串不能改，先变成字符数组。'],
            ['\n        int left = 0, right = chars.length - 1;', '两个指针放到两端。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn reverse_vowels(s: String) -> String {', '照例的架子。'],
            ['\n        let mut b = s.into_bytes();', '`into_bytes` 把 String 交出来变成字节数组，不复制，之后就能按下标改。'],
            ['\n        let is_vowel = |c: u8| b"aeiouAEIOU".contains(&c);', '判断元音的闭包：`b"…"` 是字节串，`contains` 看 c 在不在里面。'],
            ['\n        let (mut left, mut right) = (0, b.len() - 1);', '两个指针放到两端。题目保证至少一个字符。']
          ),
        },
      },
      {
        section: '写代码',
        title: '都停在元音上，交换',
        say: [
          '和上一题同一个循环：左边不是元音就跳过，右边不是元音就跳过；两边都是元音，就交换，然后一起往中间走。',
          { viz: { kind: 'array', title: '交换元音', frames: trace.vowels('leetcode') } },
        ],
        ops: {
          python: code(
            ['\n        while left < right:', '两个指针相遇就换完了。'],
            ['\n            if chars[left] not in vowels:\n                left += 1', '左边不是元音，跳过。'],
            ['\n            elif chars[right] not in vowels:\n                right -= 1', '右边不是元音，跳过。'],
            ['\n            else:\n                chars[left], chars[right] = chars[right], chars[left]', '两边都是元音：交换。右边先把两个值都算好，再同时赋给左边，不需要临时变量。'],
            ['\n                left += 1\n                right -= 1', '这一对换完了，一起往中间走。'],
            ['\n        return "".join(chars)', '把字符列表拼回字符串。']
          ),
          c: code(
            ['\n    while (left < right) {', '两个指针相遇就换完了。'],
            ['\n        if (!isVowel(s[left])) {\n            left++;\n        } else if (!isVowel(s[right])) {\n            right--;', '左边不是元音就跳过左边，右边不是就跳过右边。'],
            ['\n        } else {\n            char tmp = s[left];\n            s[left] = s[right];\n            s[right] = tmp;', '两边都是元音：交换。C 一次只能改一个变量，先把左边的存进临时变量。'],
            ['\n            left++;\n            right--;\n        }\n    }', '换完一起往中间走。'],
            ['\n    return s;\n}', '就是原来那个字符串，已经原地改好了。']
          ),
          cpp: code(
            ['\n        while (left < right) {', '两个指针相遇就换完了。'],
            ['\n            if (vowels.find(s[left]) == string::npos) {\n                left++;', '`find` 找不到时返回 `string::npos`：左边不是元音，跳过。'],
            ['\n            } else if (vowels.find(s[right]) == string::npos) {\n                right--;', '右边不是元音，跳过。'],
            ['\n            } else {\n                swap(s[left], s[right]);\n                left++;\n                right--;\n            }\n        }\n        return s;\n    }\n};', '两边都是元音：`swap` 交换，再一起往中间走。']
          ),
          java: code(
            ['\n        while (left < right) {', '两个指针相遇就换完了。'],
            ['\n            if (vowels.indexOf(chars[left]) < 0) {\n                left++;', '`indexOf` 找不到时返回 -1：左边不是元音，跳过。'],
            ['\n            } else if (vowels.indexOf(chars[right]) < 0) {\n                right--;', '右边不是元音，跳过。'],
            ['\n            } else {\n                char tmp = chars[left];\n                chars[left] = chars[right];\n                chars[right] = tmp;\n                left++;\n                right--;\n            }\n        }', '两边都是元音：借一个临时变量交换，再一起往中间走。'],
            ['\n        return new String(chars);\n    }\n}', '用字符数组造一个新字符串返回。']
          ),
          rust: code(
            ['\n        while left < right {', '两个指针相遇就换完了。'],
            ['\n            if !is_vowel(b[left]) {\n                left += 1;\n            } else if !is_vowel(b[right]) {\n                right -= 1;', '左边不是元音就跳过左边，右边不是就跳过右边。'],
            ['\n            } else {\n                b.swap(left, right);\n                left += 1;\n                right -= 1;\n            }\n        }', '两边都是元音：`swap` 交换两个下标上的元素，再一起往中间走。'],
            ['\n        String::from_utf8(b).unwrap()\n    }\n}', '把字节数组变回 String。字节不一定是合法的 UTF-8，所以它返回 Result；这里只换了 ASCII 字符，一定合法，`unwrap` 取出来。']
          ),
        },
        sayBy: {
          rust: [rustdoc('slice::swap', 'primitive.slice.html#method.swap', 'Swaps two elements in the slice.', '交换切片里的两个元素。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：AceCreIm 和 leotcede。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().reverseVowels("IceCreAm"))\n    print(Solution().reverseVowels("leetcode"))', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['AceCreIm', 'leotcede'] }]),
          c: code(['\n\nint main(void) {\n    char a[] = "IceCreAm", b[] = "leetcode";\n    printf("%s\\n%s\\n", reverseVowels(a), reverseVowels(b));\n    return 0;\n}', '函数会原地改字符串，所以要用能改的字符数组 `char a[] = "…"`，不能直接传字面量（字面量不能改）。']).concat([{ pause: 500 }, { run: RUN.c, output: ['AceCreIm', 'leotcede'] }]),
          cpp: code(['\n\nint main() {\n    cout << Solution().reverseVowels("IceCreAm") << endl << Solution().reverseVowels("leetcode") << endl;\n    return 0;\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['AceCreIm', 'leotcede'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().reverseVowels("IceCreAm"));\n        System.out.println(new Solution().reverseVowels("leetcode"));\n    }\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['AceCreIm', 'leotcede'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::reverse_vowels("IceCreAm".to_string()));\n    println!("{}", Solution::reverse_vowels("leetcode".to_string()));\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['AceCreIm', 'leotcede'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '反转 = 两头往中间对调。只换一部分字符，就让指针跳过不换的。时间 O(n)。',
          '前两题的指针只是「对称地扫」。下一题「两数之和 II」开始真正用到双指针的威力：根据和的大小，有把握地排除一个数。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
