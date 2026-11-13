/*
 * 动态规划 · 一维递推 · 1137 第 N 个泰波那契数（简单）
 * 转移只看前三格，所以不开表，用三个变量滚动——概念章最后一页的写法第一次正式用上。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-1137',
    group: '一维递推',
    label: '1137',
    title: '第 N 个泰波那契数',
    summary: '每个数是前三个数之和。只需要记住最后三个，用三个变量滚动，额外空间 O(1)。',
    problem: { id: 1137, level: 'easy', url: leetcode('n-th-tribonacci-number') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '泰波那契序列 T<sub>n</sub> 定义如下：T<sub>0</sub> = 0，T<sub>1</sub> = 1，T<sub>2</sub> = 1，且在 n >= 0 的条件下 T<sub>n+3</sub> = T<sub>n</sub> + T<sub>n+1</sub> + T<sub>n+2</sub>。给你整数 n，请返回第 n 个泰波那契数 T<sub>n</sub> 的值。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`n = 4`', '`4`', 'T3 = 0 + 1 + 1 = 2，T4 = 1 + 1 + 2 = 4'],
                ['`n = 25`', '`1389537`', ''],
              ],
            },
          },
          { list: ['`0 <= n <= 37`', '答案保证是一个 32 位整数，即 `answer <= 2^31 - 1`'] },
          '<a href="' + leetcode('n-th-tribonacci-number') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '这道题连四步都替我们想好了：状态是 T<sub>i</sub>，转移是前三个数相加，初始值是 T<sub>0</sub>、T<sub>1</sub>、T<sub>2</sub>，从小往大算，答案是 T<sub>n</sub>。照爬楼梯的写法开一张 n + 1 格的表，完全可以。',
          '但看一眼转移：算 T<sub>i</sub> 只用到它左边紧挨着的三格。算完 T<sub>i</sub>，最左边那格就再也用不到了。所以不用整张表，**三个变量 a、b、c 记住最后三格**，每算出一个新数，三个变量整体往右挪一格：',
          { viz: { kind: 'grid', title: 'n = 7', frames: trace.trib(7) } },
          {
            table: {
              head: ['', '时间', '额外空间'],
              rows: [
                ['开整张表', 'O(n)', 'O(n)'],
                ['三个变量滚动', 'O(n)', 'O(1)'],
              ],
            },
          },
          '挪的时候有一个坑：新数要用**旧的** a、b、c 来算。如果先把 a 改成 b，再算 a + b + c，用到的就是改过的 a，结果就错了。写代码时会看到每种语言怎么避开它。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一个整数 n，返回第 n 个泰波那契数。答案保证不超过 2<sup>31</sup> - 1，用普通的 32 位整数就够。'],
        ops: {
          python: code(
            ['class Solution:', '先写 `Solution` 类。'],
            ['\n    def tribonacci(self, n: int) -> int:', '题目给的方法：收一个整数，返回一个整数。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果，先引进标准输入输出库。'],
            ['\n\nint tribonacci(int n) {', '题目给的函数：收一个 int，返回一个 int。']
          ),
          cpp: code(
            ['#include <iostream>\nusing namespace std;', '这道题不开表，用不着 `vector`，只要打印用的 `iostream`。'],
            ['\n\nclass Solution {\npublic:', '先写 `Solution` 类。'],
            ['\n    int tribonacci(int n) {', '题目给的函数：收一个 int，返回一个 int。']
          ),
          java: code(
            ['class Solution {', '先写 `Solution` 类。'],
            ['\n    public int tribonacci(int n) {', '题目给的方法：收一个 int，返回一个 int。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn tribonacci(n: i32) -> i32 {', '题目给的函数：收一个 `i32`，返回一个 `i32`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '先处理 n = 0，再记住前三个数',
        say: ['三个变量一开始放 T0、T1、T2，也就是 0、1、1。之后每挪一次，c 就是最新算出的那个数。n = 1 或 2 时一次都不用挪，答案正好就是 c = 1；只有 n = 0 时答案是 a 而不是 c，所以先把它单独拿出来。'],
        ops: {
          python: code(
            ['\n        if n == 0:\n            return 0', 'n = 0 是唯一一个答案不在 c 里的情况，一开始就直接返回 T0 = 0。'],
            ['\n        a, b, c = 0, 1, 1', '三个变量依次记住 T0、T1、T2。Python 可以一行同时给三个变量赋值：右边的三个值按顺序给左边的三个名字。']
          ),
          c: code(
            ['\n    if (n == 0) {\n        return 0;\n    }', 'n = 0 是唯一一个答案不在 c 里的情况，一开始就直接返回 T0 = 0。'],
            ['\n    int a = 0, b = 1, c = 1;', '三个变量依次记住 T0、T1、T2。同一种类型的几个变量可以在一行里用逗号隔开声明。']
          ),
          cpp: code(
            ['\n        if (n == 0) {\n            return 0;\n        }', 'n = 0 是唯一一个答案不在 c 里的情况，一开始就直接返回 T0 = 0。'],
            ['\n        int a = 0, b = 1, c = 1;', '三个变量依次记住 T0、T1、T2。']
          ),
          java: code(
            ['\n        if (n == 0) {\n            return 0;\n        }', 'n = 0 是唯一一个答案不在 c 里的情况，一开始就直接返回 T0 = 0。'],
            ['\n        int a = 0, b = 1, c = 1;', '三个变量依次记住 T0、T1、T2。']
          ),
          rust: code(
            ['\n        if n == 0 {\n            return 0;\n        }', 'n = 0 是唯一一个答案不在 c 里的情况，一开始就直接返回 T0 = 0。函数中途提前返回要写 `return`。'],
            ['\n        let (mut a, mut b, mut c) = (0, 1, 1);', '三个变量依次记住 T0、T1、T2。用元组一次声明三个，后面要改它们，所以每个都加 `mut`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '一步一步往右挪',
        say: [
          '从 T3 算到 Tn，每算一个新数，三个变量整体往右挪一格：a 换成原来的 b，b 换成原来的 c，c 换成三个数的和。关键是三个新值都要用**挪之前**的 a、b、c 来算。',
          { viz: { kind: 'grid', title: '三个变量往右挪', frames: trace.trib(7) } },
        ],
        ops: {
          python: code(
            ['\n        for _ in range(3, n + 1):', '要从 T3 一直算到 Tn，一共算 n - 2 个新数，用循环。循环变量在循环体里用不到，就叫 `_`，告诉读代码的人「这个值不重要」。'],
            ['\n            a, b, c = b, c, a + b + c', '三个变量一起往右挪。Python 会**先**把右边三个值都算出来，**再**依次赋给左边，所以 `a + b + c` 用到的是挪之前的旧值，不会出错。']
          ),
          c: code(
            ['\n    for (int i = 3; i <= n; i++) {', '要从 T3 一直算到 Tn，用循环，`i <= n` 带等号才能算到 Tn。'],
            ['\n        int next = a + b + c;', 'C 没法一行同时给三个变量赋值，只能一个一个改。所以先用旧的 a、b、c 把新数算好，存进临时变量 `next`，免得后面改了 a 以后再算就错了。'],
            ['\n        a = b;\n        b = c;\n        c = next;\n    }', '新数有了，再依次往右挪：a 拿 b 的值，b 拿 c 的值，c 拿新数。顺序不能反：先改 b 的话，a 就拿不到旧的 b 了。']
          ),
          cpp: code(
            ['\n        for (int i = 3; i <= n; i++) {', '要从 T3 一直算到 Tn，用循环，`i <= n` 带等号。'],
            ['\n            int next = a + b + c;', '只能一个一个改变量，所以先用旧的 a、b、c 把新数算好，存进 `next`。'],
            ['\n            a = b;\n            b = c;\n            c = next;\n        }', '再依次往右挪：a 拿 b，b 拿 c，c 拿新数。顺序不能反。']
          ),
          java: code(
            ['\n        for (int i = 3; i <= n; i++) {', '要从 T3 一直算到 Tn，用循环，`i <= n` 带等号。'],
            ['\n            int next = a + b + c;', 'Java 也只能一个一个改变量，所以先用旧的 a、b、c 把新数算好，存进 `next`。'],
            ['\n            a = b;\n            b = c;\n            c = next;\n        }', '再依次往右挪：a 拿 b，b 拿 c，c 拿新数。顺序不能反。']
          ),
          rust: code(
            ['\n        for _ in 3..=n {', '要从 T3 一直算到 Tn，用包含 n 的范围 `3..=n`。循环变量用不到，写成 `_`。'],
            ['\n            (a, b, c) = (b, c, a + b + c);\n        }', '三个变量一起往右挪。右边的元组先用旧值算好，再整体赋给左边，所以不会用到改过的值。这种写法叫解构赋值。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案在 c 里',
        say: ['循环结束时，c 刚好是最后算出来的 Tn。'],
        ops: {
          python: code(['\n        return c', '最后一次挪完，c 就是 Tn。n 是 1 或 2 时循环没跑，c 还是一开始的 1，也对。']),
          c: code(['\n    return c;\n}', '最后一次挪完，c 就是 Tn。n 是 1 或 2 时循环没跑，c 还是 1，也对。']),
          cpp: code(['\n        return c;\n    }\n};', '最后一次挪完，c 就是 Tn。n 是 1 或 2 时循环没跑，c 还是 1，也对。']),
          java: code(['\n        return c;\n    }\n}', '最后一次挪完，c 就是 Tn。n 是 1 或 2 时循环没跑，c 还是 1，也对。']),
          rust: code(['\n        c\n    }\n}', '最后一次挪完，c 就是 Tn，作为最后一个表达式返回。n 是 1 或 2 时循环没跑，c 还是 1，也对。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，也试试 n = 0',
        say: ['预期：n = 4 得 4，n = 25 得 1389537。再试一下单独处理过的 n = 0，应该得 0。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().tribonacci(4))\n    print(Solution().tribonacci(25))', '题目的两个样例。'],
            ['\n    print(Solution().tribonacci(0))', '再试单独处理过的 n = 0。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['4', '1389537', '0'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    printf("%d\\n", tribonacci(4));\n    printf("%d\\n", tribonacci(25));', '题目的两个样例。'],
            ['\n    printf("%d\\n", tribonacci(0));\n    return 0;\n}', '再试单独处理过的 n = 0。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['4', '1389537', '0'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    cout << Solution().tribonacci(4) << endl;\n    cout << Solution().tribonacci(25) << endl;', '题目的两个样例。'],
            ['\n    cout << Solution().tribonacci(0) << endl;\n    return 0;\n}', '再试单独处理过的 n = 0。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['4', '1389537', '0'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        System.out.println(new Solution().tribonacci(4));\n        System.out.println(new Solution().tribonacci(25));', '题目的两个样例。'],
            ['\n        System.out.println(new Solution().tribonacci(0));\n    }\n}', '再试单独处理过的 n = 0。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['4', '1389537', '0'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::tribonacci(4));\n    println!("{}", Solution::tribonacci(25));', '题目的两个样例。'],
            ['\n    println!("{}", Solution::tribonacci(0));\n}', '再试单独处理过的 n = 0。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['4', '1389537', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '转移只看最后几格时，就不用开整张表，几个变量滚动着往前挪就够。时间 O(n)，额外空间 O(1)。挪的时候记住：新值要用挪之前的旧值算。',
          '前三题的转移都是现成的公式。下一题打家劫舍要自己想转移：每间房「偷」还是「不偷」，两种选择各算一遍，取大的。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
