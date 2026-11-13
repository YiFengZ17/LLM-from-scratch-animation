/*
 * 滑动窗口 · 1876 长度为三且各字符不同的子字符串（简单，定长窗口）
 * 写法约定见 02-p643.js。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { cdoc, javadoc, rustdoc } = root.LessonKit;

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-1876',
    label: '1876',
    title: '长度为三且各字符不同的子字符串',
    summary: '窗口长度固定为 3，窗口里只有三个字符，直接两两比较。',
    problem: { id: 1876, level: 'easy', url: leetcode('substrings-of-size-three-with-distinct-characters') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '如果一个字符串里没有重复的字符，就叫它「好字符串」。给一个字符串 `s`，数一数它有多少个长度为 3 的好子字符串。同一个子串出现几次就算几次。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "xyzzaz"`', '`1`', '长度为 3 的子串有 "xyz"、"yzz"、"zza"、"zaz"，只有 "xyz" 是好的'],
                ['`s = "aababcabc"`', '`4`', '"abc"、"bca"、"cab"、"abc" 是好的'],
              ],
            },
          },
          { list: ['`1 <= s.length <= 100`', '`s` 只包含小写英文字母'] },
          '<a href="' + leetcode('substrings-of-size-three-with-distinct-characters') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '「长度为 3 的子串」就是一个宽度为 3 的窗口。让窗口从最左边开始，一格一格往右挪，每到一个位置就看看框里的三个字符是不是各不相同。',
          { viz: { kind: 'array', title: '样例 2：窗口宽度 3', frames: trace.distinct3('aababcabc') } },
          '和上一题不同，这里窗口只有 3 个字符，直接比较就行，不用像上一题那样维护一个随窗口变化的和。每挪一格做 3 次比较，时间 O(n)，额外空间 O(1)。',
          '三个字符「各不相同」要比三对：第 1 和第 2 个、第 2 和第 3 个、第 1 和第 3 个。只比相邻的两对会漏掉 "aba" 这种首尾相同的情况。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['题目给一个字符串，要我们返回一个整数：好子串的个数。照着题目的签名把架子搭出来。'],
        ops: {
          python: code(
            ['class Solution:', '还是先写力扣要求的 `Solution` 类。'],
            ['\n    def countGoodSubstrings(self, s: str) -> int:', '方法收一个字符串 `s`，返回整数个数。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <string.h>', '要打印结果，所以引入 `stdio.h`；一会儿还要量字符串的长度，`strlen` 在 `string.h` 里，也引进来。'],
            ['\n\nint countGoodSubstrings(char* s) {', 'C 里的字符串就是一串字符，用 `char*` 指向第一个字符。函数返回个数，是 `int`。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <string>\nusing namespace std;', '打印要 `iostream`，字符串要 `string`。'],
            ['\n\nclass Solution {\npublic:\n    int countGoodSubstrings(string s) {', '方法收一个 `string`，返回整数个数。']
          ),
          java: code(['class Solution {\n    public int countGoodSubstrings(String s) {', '方法收一个 `String`，返回整数个数。']),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '和上一题一样，先声明空的 `Solution`，再在 `impl` 里写函数。'],
            ['\n    pub fn count_good_substrings(s: String) -> i32 {', '函数收一个 `String`，返回 `i32` 个数。']
          ),
        },
      },
      {
        section: '写代码',
        title: '让宽度为 3 的窗口走一遍',
        say: ['要数个数，先准备一个计数器。然后让窗口从最左边开始往右走，走到哪里为止？窗口占三格，最右边那格不能越过字符串末尾——这决定了循环的边界。'],
        ops: {
          python: code(
            ['\n        count = 0', '要数个数，先准备一个从 0 开始的计数器。'],
            ['\n        for left in range(len(s) - 2):', '窗口的左端用 `left` 表示，它占 left、left+1、left+2 三格。最右那格不能超过最后一个下标 len(s)-1，所以 left 最多到 len(s)-3。`range(len(s) - 2)` 正好给出 0 到 len(s)-3；字符串短于 3 时它是空的，循环一次也不跑，结果自然是 0。']
          ),
          c: code(
            ['\n    int n = strlen(s);', '循环要知道字符串有多长。C 的字符串用一个 `\\0` 字符表示结束，自己不记长度，所以用 `strlen` 数一遍。'],
            ['\n    int count = 0;', '要数个数，先准备一个从 0 开始的计数器。'],
            ['\n    for (int left = 0; left + 2 < n; left++) {', '窗口左端 `left` 占 left、left+1、left+2 三格，最右那格 left+2 必须小于 n，这就是循环的条件。']
          ),
          cpp: code(
            ['\n        int count = 0;', '要数个数，先准备一个从 0 开始的计数器。'],
            ['\n        for (int left = 0; left + 2 < (int)s.size(); left++) {', '窗口左端 `left` 占三格，最右那格 left+2 必须在字符串里面，也就是小于 `s.size()`。']
          ),
          java: code(
            ['\n        int count = 0;', '要数个数，先准备一个从 0 开始的计数器。'],
            ['\n        for (int left = 0; left + 2 < s.length(); left++) {', '窗口左端 `left` 占三格，最右那格 left+2 必须小于字符串长度 `s.length()`。注意字符串的长度是方法 `length()`，数组才是属性 `length`。']
          ),
          rust: code(
            ['\n        let b = s.as_bytes();', 'Rust 的字符串不能直接用下标取字符，因为一个字符可能占好几个字节。这道题只有小写字母，每个正好一个字节，所以先转成字节数组，再按下标取。'],
            ['\n        let mut count = 0;', '要数个数，先准备一个从 0 开始的计数器；它要变，所以是 `mut`。'],
            ['\n        for left in 0..b.len().saturating_sub(2) {', '窗口左端最多到 len-3，所以范围是 `0..len-2`。但长度小于 2 时，`len - 2` 会算出负数，而 `usize` 不能是负的，程序会直接报错。`saturating_sub(2)` 减到 0 就停，不会出错。']
          ),
        },
        sayBy: {
          c: [cdoc('strlen(const char *s)', 'String-Length.html', 'The strlen function returns the length of the string s in bytes.', 'strlen 返回字符串 s 的长度（以字节计）。')],
          rust: [
            rustdoc('str::as_bytes', 'primitive.str.html#method.as_bytes', 'Converts a string slice to a byte slice.', '把字符串切片转换成字节切片。'),
            rustdoc('usize::saturating_sub', 'primitive.usize.html#method.saturating_sub', 'Saturating integer subtraction. Computes self - rhs, saturating at the numeric bounds instead of overflowing.', '饱和减法：计算 self - rhs，碰到数值的边界就停在边界上，而不是溢出。'),
          ],
        },
      },
      {
        section: '写代码',
        title: '看框里的三个字符是不是各不相同',
        say: [
          '窗口到了一个位置，接下来判断框里三个字符是不是两两不同。三个字符要比三对，少比一对就会漏掉 "aba" 这种首尾相同的情况。',
          { viz: { kind: 'array', title: '样例 2', frames: trace.distinct3('aababcabc') } },
        ],
        ops: {
          python: code(
            ['\n            a, b, c = s[left], s[left + 1], s[left + 2]', '先把框里的三个字符取出来，起三个短名字，后面的判断好读。Python 可以一次给几个变量赋值。'],
            ['\n            if a != b and b != c and a != c:', '三对都不相等，才算各不相同。`and` 要求两边都成立。'],
            ['\n                count += 1', '是好子串，计数加一。']
          ),
          c: code(
            ['\n        char a = s[left], b = s[left + 1], c = s[left + 2];', '先把框里的三个字符取出来，起三个短名字。`char` 是字符类型，一行里可以声明好几个同类型的变量。'],
            ['\n        if (a != b && b != c && a != c) {', '三对都不相等，才算各不相同。`&&` 表示「并且」。'],
            ['\n            count++;\n        }\n    }', '是好子串，计数加一。`count++` 就是 `count = count + 1`。']
          ),
          cpp: code(
            ['\n            char a = s[left], b = s[left + 1], c = s[left + 2];', '先把框里的三个字符取出来，起三个短名字。'],
            ['\n            if (a != b && b != c && a != c) {', '三对都不相等，才算各不相同。'],
            ['\n                count++;\n            }\n        }', '是好子串，计数加一。']
          ),
          java: code(
            ['\n            char a = s.charAt(left), b = s.charAt(left + 1), c = s.charAt(left + 2);', '先把框里的三个字符取出来。Java 的字符串不能用方括号取字符，要用 `charAt(下标)`。'],
            ['\n            if (a != b && b != c && a != c) {', '三对都不相等，才算各不相同。'],
            ['\n                count++;\n            }\n        }', '是好子串，计数加一。']
          ),
          rust: code(
            ['\n            let (x, y, z) = (b[left], b[left + 1], b[left + 2]);', '先把框里的三个字节取出来，一次绑定到三个名字上。这里不用 a、b、c，因为 `b` 已经是字节数组的名字了。'],
            ['\n            if x != y && y != z && x != z {', '三对都不相等，才算各不相同。Rust 的 if 条件不用加括号。'],
            ['\n                count += 1;\n            }\n        }', '是好子串，计数加一。']
          ),
        },
        sayBy: {
          java: [javadoc('String.charAt(int index)', 'java/lang/String.html#charAt(int)', 'Returns the char value at the specified index. An index ranges from 0 to length() - 1.', '返回指定下标处的 char 值。下标的范围是 0 到 length() - 1。')],
        },
      },
      {
        section: '写代码',
        title: '返回个数',
        say: ['窗口走完了，计数器里就是答案。'],
        ops: {
          python: code(['\n        return count', '返回数到的个数。']),
          c: code(['\n    return count;\n}', '返回数到的个数，结束函数。']),
          cpp: code(['\n        return count;\n    }\n};', '返回数到的个数。类的右花括号后面有分号。']),
          java: code(['\n        return count;\n    }\n}', '返回数到的个数。']),
          rust: code(['\n        count\n    }\n}', '最后一个表达式不加分号，就是返回值。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：`"xyzzaz"` 只有 "xyz" 是好的，得 1；`"aababcabc"` 得 4。'],
        ops: {
          python: code(['\n\n\nif __name__ == "__main__":\n    print(Solution().countGoodSubstrings("xyzzaz"))\n    print(Solution().countGoodSubstrings("aababcabc"))', '和上一题一样，用入口调用两个样例。']).concat([{ pause: 500 }, { run: RUN.python, output: ['1', '4'] }]),
          c: code(
            ['\n\nint main(void) {', '程序的入口。'],
            ['\n    printf("%d\\n", countGoodSubstrings("xyzzaz"));\n    printf("%d\\n", countGoodSubstrings("aababcabc"));', '双引号里的文字就是一个字符串，可以直接传给函数。`%d` 按整数打印。'],
            ['\n    return 0;\n}']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['1', '4'] }]),
          cpp: code(['\n\nint main() {\n    cout << Solution().countGoodSubstrings("xyzzaz") << endl;\n    cout << Solution().countGoodSubstrings("aababcabc") << endl;\n    return 0;\n}', '用两个样例调用。双引号里的文字会自动转换成 `string` 传进去。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['1', '4'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().countGoodSubstrings("xyzzaz"));\n        System.out.println(new Solution().countGoodSubstrings("aababcabc"));\n    }\n}', '和上一题一样，用 `Main` 类的入口调用两个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['1', '4'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::count_good_substrings(String::from("xyzzaz")));\n    println!("{}", Solution::count_good_substrings(String::from("aababcabc")));\n}', '函数要的是 `String`，而双引号里的文字是 `&str`，用 `String::from` 转换一下再传进去。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['1', '4'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '窗口长度固定、而且很短的时候，不用维护什么状态，每到一个位置直接检查框里的内容就行。时间 O(n)，额外空间 O(1)。',
          '下一题的窗口长度是 k，可能很大，不能每次把框里的数挨个比一遍了。这时要用一个集合记住「框里现在有哪些数」。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
