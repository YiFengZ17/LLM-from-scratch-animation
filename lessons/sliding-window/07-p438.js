/*
 * 滑动窗口 · 438 找到字符串中所有字母异位词（中等，定长窗口 + 计数表）
 * 写法约定见 02-p643.js。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { py, cdoc, javadoc } = root.LessonKit;

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-438',
    label: '438',
    title: '找到字符串中所有字母异位词',
    summary: '定长窗口里维护一整张字母计数表，和目标的计数表一样就是异位词。',
    problem: { id: 438, level: 'medium', url: leetcode('find-all-anagrams-in-a-string') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给两个字符串 `s` 和 `p`，找出 s 里所有是 p 的**异位词**的子串，返回这些子串的起始下标。异位词就是字母完全一样、只是顺序不同的字符串（包括顺序也相同的情况）。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "cbaebabacd"`, `p = "abc"`', '`[0, 6]`', '下标 0 的 "cba"、下标 6 的 "bac"'],
                ['`s = "abab"`, `p = "ab"`', '`[0, 1, 2]`', '"ab"、"ba"、"ab"'],
              ],
            },
          },
          { list: ['`1 <= s.length, p.length <= 3 * 10^4`', '`s` 和 `p` 只包含小写字母'] },
          '<a href="' + leetcode('find-all-anagrams-in-a-string') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '怎么判断两个字符串是不是异位词？不用管顺序，数一数每个字母各出现几次：26 个字母的次数全都一样，就是异位词。',
          '和 p 一样长的子串，就是一个长度为 `len(p)` 的定长窗口。给 p 数一张计数表，再给窗口维护一张计数表：右边进来一个字母，它的次数加一；左边出去一个，次数减一。每挪一格比一下两张表。',
          { viz: { kind: 'array', title: '样例 1：p = "abc"', frames: trace.anagrams('cbaebabacd', 'abc') } },
          '每挪一格要比较 26 个数，这是常数，所以时间 O(26 · n) = O(n)；两张表各 26 格，额外空间 O(1)（不算存答案的列表）。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收两个字符串，返回所有起始下标，是一个整数列表。'],
        ops: {
          python: code(['class Solution:\n    def findAnagrams(self, s: str, p: str) -> list[int]:', '返回值是整数列表 `list[int]`。']),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>', '这道题要返回一个数组，C 里要用 `malloc` 申请内存，它在 `stdlib.h`；比较两张表用的 `memcmp` 在 `string.h`。'],
            ['\n\nint* findAnagrams(char* s, char* p, int* returnSize) {', 'C 的函数没法直接返回「一个数组加它的长度」。力扣的做法是：返回数组的指针，长度通过参数 `returnSize` 指向的变量告诉调用方。']
          ),
          cpp: code(['#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> findAnagrams(string s, string p) {', '返回值是 `vector<int>`。']),
          java: code(
            ['import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.List;', '要返回一个长度事先不知道的列表，用 `ArrayList`；比较两个数组用 `Arrays.equals`。'],
            ['\n\nclass Solution {\n    public List<Integer> findAnagrams(String s, String p) {', '返回值是整数列表 `List<Integer>`。']
          ),
          rust: code(['struct Solution;\n\nimpl Solution {\n    pub fn find_anagrams(s: String, p: String) -> Vec<i32> {', '返回值是 `Vec<i32>`。']),
        },
      },
      {
        section: '写代码',
        title: '先数一数 p 里每个字母有几个',
        say: ['判断异位词要比较字母的次数，所以先给 p 数一张表：26 个格子，第 0 格记 a 有几个，第 1 格记 b 有几个，依此类推。'],
        ops: {
          python: code(
            ['\n        need = [0] * 26', '准备 26 个格子，全是 0。`[0] * 26` 把只有一个 0 的列表重复 26 次。'],
            ['\n        for ch in p:', 'p 里的字母一个个看过去。'],
            ['\n            need[ord(ch) - ord("a")] += 1', '字母要换成 0 到 25 的格子号：`ord` 给出字符的编码，a 是 97、b 是 98……减去 a 的编码，a 就是 0、b 就是 1。这个字母的格子加一。']
          ),
          c: code(
            ['\n    int n = strlen(s), m = strlen(p);', '先量出两个字符串的长度，后面多处要用。'],
            ['\n    int need[26] = {0};', '26 个格子，全是 0。'],
            ['\n    for (int i = 0; i < m; i++) {\n        need[p[i] - \'a\']++;\n    }', 'p 的字母一个个看过去。字符在 C 里就是整数，`p[i] - \'a\'` 让 a 变成 0、b 变成 1……这个字母的格子加一。']
          ),
          cpp: code(
            ['\n        vector<int> need(26, 0);', '26 个格子，全是 0。`vector<int>(26, 0)` 表示 26 个 0。'],
            ['\n        for (char c : p) {\n            need[c - \'a\']++;\n        }', '`for (char c : p)` 依次取出 p 的每个字母。`c - \'a\'` 把 a 变成 0、b 变成 1……这个字母的格子加一。']
          ),
          java: code(
            ['\n        int[] need = new int[26];', '26 个格子，Java 自动全部是 0。'],
            ['\n        for (char c : p.toCharArray()) {\n            need[c - \'a\']++;\n        }', '`toCharArray()` 把字符串变成字符数组，再一个个取出来。`c - \'a\'` 把 a 变成 0、b 变成 1……这个字母的格子加一。']
          ),
          rust: code(
            ['\n        let (s, p) = (s.as_bytes(), p.as_bytes());', '两个字符串都要按下标取字母，先都转成字节数组。用同名变量盖住原来的 String。'],
            ['\n        let mut need = [0; 26];', '26 个格子，全是 0。'],
            ['\n        for &c in p {\n            need[(c - b\'a\') as usize] += 1;\n        }', '依次取出 p 的每个字节。`b\'a\'` 是字母 a 的字节值 97，相减后 a 是 0、b 是 1……再转成 `usize` 当下标。`for &c` 里的 `&` 把取出来的引用直接拆成值。']
          ),
        },
        sayBy: {
          python: [py('ord(c)', 'library/functions.html#ord', 'Given a string representing one Unicode character, return an integer representing the Unicode code point of that character.', '给一个只含一个 Unicode 字符的字符串，返回这个字符的 Unicode 码位（一个整数）。')],
        },
      },
      {
        section: '写代码',
        title: '窗口的计数表，和存答案的地方',
        say: ['窗口也需要一张同样的表，一开始窗口是空的，全是 0。再准备一个地方存找到的起始下标。'],
        ops: {
          python: code(
            ['\n        window = [0] * 26', '窗口的计数表，一开始全是 0。'],
            ['\n        result = []', '找到的起始下标放在这个列表里。']
          ),
          c: code(
            ['\n    int window[26] = {0};', '窗口的计数表，一开始全是 0。'],
            ['\n    int* result = malloc(sizeof(int) * (n + 1));', '存答案的数组要返回给调用方，不能放在函数自己的局部变量里（函数返回后就没了），要用 `malloc` 申请一块内存。起点最多 n 个，申请 n + 1 个 int 的空间，多 1 个是为了 n 为 0 时也能申请成功。'],
            ['\n    *returnSize = 0;', '`returnSize` 指向的变量记录找到了几个，先设成 0。`*` 表示「它指向的那个变量」。']
          ),
          cpp: code(
            ['\n        vector<int> window(26, 0);', '窗口的计数表，一开始全是 0。'],
            ['\n        vector<int> result;', '找到的起始下标放在这里，一开始是空的。']
          ),
          java: code(
            ['\n        int[] window = new int[26];', '窗口的计数表，一开始全是 0。'],
            ['\n        List<Integer> result = new ArrayList<>();', '找到的起始下标放在这个列表里。']
          ),
          rust: code(
            ['\n        let mut window = [0; 26];', '窗口的计数表，一开始全是 0。'],
            ['\n        let mut result = Vec::new();', '找到的起始下标放在这里，一开始是空的。']
          ),
        },
        sayBy: {
          c: [cdoc('malloc(size_t size)', 'Basic-Allocation.html', 'This function returns a pointer to a newly allocated block size bytes long, or a null pointer (setting errno) if the block could not be allocated.', '这个函数返回一个指针，指向新申请的、长 size 个字节的内存块；申请不到时返回空指针（并设置 errno）。')],
        },
      },
      {
        section: '写代码',
        title: '右边进来一个，左边出去一个',
        say: ['窗口的长度固定是 p 的长度。右端每走一格，进来的字母次数加一；窗口超过这个长度时，最左边那个字母出去，次数减一。'],
        ops: {
          python: code(
            ['\n        for right, ch in enumerate(s):', '右端走遍 s，同时拿到下标和字母。'],
            ['\n            window[ord(ch) - ord("a")] += 1', '进来的字母，次数加一。'],
            ['\n            if right >= len(p):', '窗口从 right - len(p) + 1 到 right。right 走到 len(p) 时，窗口里第一次多出一个字母。'],
            ['\n                window[ord(s[right - len(p)]) - ord("a")] -= 1', '多出来的是最左边那个，下标 right - len(p)，它的次数减一。']
          ),
          c: code(
            ['\n    for (int right = 0; right < n; right++) {', '右端走遍 s。'],
            ['\n        window[s[right] - \'a\']++;', '进来的字母，次数加一。'],
            ['\n        if (right >= m) {\n            window[s[right - m] - \'a\']--;\n        }', 'right 走到 m 以后，窗口里多出一个字母：最左边那个（下标 right - m）出去，次数减一。']
          ),
          cpp: code(
            ['\n        int m = p.size();', 'p 的长度后面要用好几次，先存下来。'],
            ['\n        for (int right = 0; right < (int)s.size(); right++) {', '右端走遍 s。'],
            ['\n            window[s[right] - \'a\']++;', '进来的字母，次数加一。'],
            ['\n            if (right >= m) {\n                window[s[right - m] - \'a\']--;\n            }', 'right 走到 m 以后，最左边那个字母（下标 right - m）出去，次数减一。']
          ),
          java: code(
            ['\n        int m = p.length();', 'p 的长度后面要用好几次，先存下来。'],
            ['\n        for (int right = 0; right < s.length(); right++) {', '右端走遍 s。'],
            ['\n            window[s.charAt(right) - \'a\']++;', '进来的字母，次数加一。'],
            ['\n            if (right >= m) {\n                window[s.charAt(right - m) - \'a\']--;\n            }', 'right 走到 m 以后，最左边那个字母（下标 right - m）出去，次数减一。']
          ),
          rust: code(
            ['\n        let m = p.len();', 'p 的长度后面要用好几次，先存下来。'],
            ['\n        for right in 0..s.len() {', '右端走遍 s。'],
            ['\n            window[(s[right] - b\'a\') as usize] += 1;', '进来的字母，次数加一。'],
            ['\n            if right >= m {\n                window[(s[right - m] - b\'a\') as usize] -= 1;\n            }', 'right 走到 m 以后，最左边那个字母（下标 right - m）出去，次数减一。']
          ),
        },
      },
      {
        section: '写代码',
        title: '两张表一样，就记下起点',
        say: [
          '窗口挪好了，比一比两张表。26 个格子全都一样，窗口里就是 p 的一个异位词，它的起点是 right - len(p) + 1。',
          { viz: { kind: 'array', title: '样例 1：p = "abc"', frames: trace.anagrams('cbaebabacd', 'abc') } },
        ],
        ops: {
          python: code(
            ['\n            if window == need:', '两个列表可以直接用 `==` 比较：长度相同、每个位置都相等才是 True。窗口还没满时，里面的字母总数比 p 少，不可能相等，所以不用另外判断窗口满没满。'],
            ['\n                result.append(right - len(p) + 1)', '一样就把起点加进结果列表。']
          ),
          c: code(
            ['\n        if (memcmp(window, need, sizeof(need)) == 0) {', 'C 的数组不能用 `==` 比内容（那样比的是地址）。`memcmp` 逐字节比较两块内存，完全一样时返回 0。`sizeof(need)` 是整张表的字节数。'],
            ['\n            result[(*returnSize)++] = right - m + 1;\n        }\n    }', '一样就把起点放进结果数组，再把个数加一。`(*returnSize)++` 先用当前的个数当下标，然后加一。']
          ),
          cpp: code(
            ['\n            if (window == need) {', '两个 vector 可以直接用 `==` 比较：长度相同、每个元素都相等才是 true。'],
            ['\n                result.push_back(right - m + 1);\n            }\n        }', '一样就把起点加到结果末尾。']
          ),
          java: code(
            ['\n            if (Arrays.equals(window, need)) {', 'Java 的数组用 `==` 比的是是不是同一个对象，比内容要用 `Arrays.equals`。'],
            ['\n                result.add(right - m + 1);\n            }\n        }', '一样就把起点加进列表。']
          ),
          rust: code(
            ['\n            if window == need {', '两个数组可以直接用 `==` 比较每个元素。'],
            ['\n                result.push((right + 1 - m) as i32);\n            }\n        }', '一样就把起点加进结果。写成 `right + 1 - m` 而不是 `right - m + 1`：`usize` 不能是负数，先加后减更稳妥。']
          ),
        },
        sayBy: {
          c: [cdoc('memcmp(const void *a1, const void *a2, size_t size)', 'String_002fArray-Comparison.html', 'The function memcmp compares the size bytes of memory beginning at a1 against the size bytes of memory beginning at a2.', 'memcmp 比较从 a1 开始的 size 个字节和从 a2 开始的 size 个字节。')],
          java: [javadoc('Arrays.equals(int[] a, int[] a2)', 'java/util/Arrays.html#equals(int%5B%5D,int%5B%5D)', 'Returns true if the two specified arrays of ints are equal to one another. Two arrays are considered equal if both arrays contain the same number of elements, and all corresponding pairs of elements in the two arrays are equal.', '两个 int 数组相等时返回 true：元素个数相同，而且对应位置的元素都相等。')],
        },
      },
      {
        section: '写代码',
        title: '返回所有起点',
        say: ['s 走完了，结果里就是所有异位词的起点，按从小到大的顺序。'],
        ops: {
          python: code(['\n        return result', '返回结果列表。']),
          c: code(['\n    return result;\n}', '返回结果数组。用完后由调用方负责 `free` 释放。']),
          cpp: code(['\n        return result;\n    }\n};', '返回结果。']),
          java: code(['\n        return result;\n    }\n}', '返回结果列表。']),
          rust: code(['\n        result\n    }\n}', '返回结果。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：`[0, 6]` 和 `[0, 1, 2]`。打印列表的样子各语言不一样，C 和 C++ 要自己拼出方括号。'],
        ops: {
          python: code(['\n\n\nif __name__ == "__main__":\n    print(Solution().findAnagrams("cbaebabacd", "abc"))\n    print(Solution().findAnagrams("abab", "ab"))', '`print` 打印列表时自带方括号和逗号。']).concat([{ pause: 500 }, { run: RUN.python, output: ['[0, 6]', '[0, 1, 2]'] }]),
          c: code(
            ['\n\nvoid print(int* a, int size) {\n    printf("[");\n    for (int i = 0; i < size; i++) {\n        printf(i ? ", %d" : "%d", a[i]);\n    }\n    printf("]\\n");\n}', 'C 没有现成的打印数组的办法，写一个小函数：先打 `[`，第一个数前面不加逗号，其余的前面加 `, `，最后打 `]`。'],
            ['\n\nint main(void) {\n    int size;', '`size` 用来接收结果的个数，把它的地址 `&size` 传给函数。'],
            ['\n    int* r = findAnagrams("cbaebabacd", "abc", &size);\n    print(r, size);\n    free(r);', '调用、打印，然后用 `free` 还掉函数里 malloc 申请的内存。'],
            ['\n    r = findAnagrams("abab", "ab", &size);\n    print(r, size);\n    free(r);\n    return 0;\n}', '第二个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['[0, 6]', '[0, 1, 2]'] }]),
          cpp: code(
            ['\n\nvoid print(const vector<int>& v) {\n    cout << "[";\n    for (size_t i = 0; i < v.size(); i++) {\n        cout << (i ? ", " : "") << v[i];\n    }\n    cout << "]" << endl;\n}', 'cout 不能直接打印 vector，写一个小函数拼出方括号和逗号。'],
            ['\n\nint main() {\n    print(Solution().findAnagrams("cbaebabacd", "abc"));\n    print(Solution().findAnagrams("abab", "ab"));\n    return 0;\n}', '用两个样例调用并打印。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['[0, 6]', '[0, 1, 2]'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().findAnagrams("cbaebabacd", "abc"));\n        System.out.println(new Solution().findAnagrams("abab", "ab"));\n    }\n}', '`println` 打印 List 时自带方括号和逗号。']).concat([{ pause: 500 }, { run: RUN.java, output: ['[0, 6]', '[0, 1, 2]'] }]),
          rust: code(['\n\nfn main() {\n    println!("{:?}", Solution::find_anagrams("cbaebabacd".to_string(), "abc".to_string()));\n    println!("{:?}", Solution::find_anagrams("abab".to_string(), "ab".to_string()));\n}', '`{:?}` 是调试格式，打印 Vec 时自带方括号和逗号。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['[0, 6]', '[0, 1, 2]'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '窗口里维护的状态可以是一整张计数表。进来一个字母、出去一个字母，表里只改两格；每次比较 26 格是常数时间。整体时间 O(n)，额外空间 O(1)。',
          '最后一题是困难题：窗口长度不固定，要找包含另一个字符串全部字母的最短子串。会用到这道题的计数表，加上 209 的收缩方法，再多一个记「还缺几个」的变量。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
