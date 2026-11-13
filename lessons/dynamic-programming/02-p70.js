/*
 * 动态规划 · 一维递推 · 70 爬楼梯（简单）
 *
 * 这个模块的写法和滑动窗口一样：code([代码, 念头], ...)，念头先说为什么要写这一行，再说语法。
 * 第一道题的念头最细：开表、初始值、循环范围都讲一遍，后面的题只讲新出现的东西。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cppdoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-70',
    group: '一维递推',
    label: '70',
    title: '爬楼梯',
    summary: '动态规划的第一题：开一张表，从小往大填，dp[i] = dp[i-1] + dp[i-2]。',
    problem: { id: 70, level: 'easy', url: leetcode('climbing-stairs') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '假设你正在爬楼梯，需要 n 阶才能到达楼顶。每次可以爬 1 或 2 个台阶。有多少种不同的方法可以爬到楼顶？',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`n = 2`', '`2`', '1 + 1，或者直接 2'],
                ['`n = 3`', '`3`', '1 + 1 + 1、1 + 2、2 + 1'],
              ],
            },
          },
          { list: ['`1 <= n <= 45`'] },
          '<a href="' + leetcode('climbing-stairs') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '概念章里已经推过这道题，这里按四步法再整理一遍：',
          {
            table: {
              head: ['', '爬楼梯'],
              rows: [
                ['状态', '`dp[i]`：走到第 i 级有多少种走法'],
                ['转移', '最后一步要么从 i-1 跨 1 级，要么从 i-2 跨 2 级：`dp[i] = dp[i-1] + dp[i-2]`'],
                ['初始值', '`dp[0] = 1`（站在地面不动，算 1 种），`dp[1] = 1`'],
                ['顺序与答案', 'i 从 2 填到 n，答案是 `dp[n]`'],
              ],
            },
          },
          '为什么 `dp[0]` 是 1 而不是 0？可以用 `dp[2]` 检验：走到第 2 级有「1 + 1」和「2」两种，而 `dp[2] = dp[1] + dp[0]`，只有 `dp[0] = 1` 才对得上。',
          { viz: { kind: 'grid', title: 'n = 5', frames: trace.climb(5) } },
          {
            table: {
              head: ['', '时间', '额外空间'],
              rows: [
                ['直接递归', '约 O(1.6ⁿ)', 'O(n)（递归的深度）'],
                ['填表', 'O(n)', 'O(n)'],
              ],
            },
          },
          '代码分四步写：函数签名、开表和初始值、循环填表、返回答案。最后用样例跑一遍。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['题目要一个函数：给楼梯的级数 n，返回一共有多少种走法，输入输出都是整数。先照着题目把函数的样子搭出来。'],
        ops: {
          python: code(
            ['class Solution:', '力扣要求把解法放进 `Solution` 类里，评测时会创建这个类、调用里面的方法。先写类。'],
            ['\n    def climbStairs(self, n: int) -> int:', '题目给的方法叫 `climbStairs`：收一个整数 n，返回一个整数。`self` 是方法固定的第一个参数；`: int`、`-> int` 是类型注解，只写给人看。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要把结果打印出来看，`printf` 在标准输入输出库里，先引进来。'],
            ['\n\nint climbStairs(int n) {', '题目给的函数：收一个 int，返回一个 int。答案最大是 n = 45 时的 1836311903，没超过 int 的上限 2147483647，用 int 装得下。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>', '先想好要用到的工具：打印要 `iostream`，表要用 `vector`，因为它的长度可以按 n 现开。'],
            ['\nusing namespace std;', '写上这一行，后面就能直接写 `vector`、`cout`，不用每次加 `std::`。'],
            ['\n\nclass Solution {\npublic:', '力扣要求把解法放进 `Solution` 类里，`public:` 让下面的方法能从外面调用。'],
            ['\n    int climbStairs(int n) {', '题目给的函数：收一个 int，返回一个 int。答案最大是 1836311903，int 装得下。']
          ),
          java: code(
            ['class Solution {', '力扣要求把解法放进 `Solution` 类里，先写类。'],
            ['\n    public int climbStairs(int n) {', '题目给的方法：收一个 int，返回一个 int。答案最大是 1836311903，int 装得下。']
          ),
          rust: code(
            ['struct Solution;', '本地运行要自己先声明一个空的 `Solution` 结构体，力扣评测时它已经有了。'],
            ['\n\nimpl Solution {', '属于 `Solution` 的函数放在 `impl` 块里。'],
            ['\n    pub fn climb_stairs(n: i32) -> i32 {', '题目给的函数：收一个 `i32`，返回一个 `i32`。Rust 的函数名用小写加下划线。']
          ),
        },
      },
      {
        section: '写代码',
        title: '开一张表，填好起点',
        say: ['状态已经想好了：`dp[i]` 是走到第 i 级的走法数。我们最后要读 `dp[n]`，所以表的下标要能取到 n——从 0 到 n，一共 n + 1 格。表开好以后，先把两个起点填上。'],
        ops: {
          python: code(
            ['\n        dp = [0] * (n + 1)', '要一张能放下 dp[0] 到 dp[n] 的表，一共 n + 1 格。每格先填 0 占位，后面一格一格改成真正的值。`[0] * (n + 1)` 把只有一个 0 的列表重复 n + 1 次，得到 n + 1 个 0。'],
            ['\n        dp[0] = 1', '第一个起点：站在地面上不动，算 1 种走法。它不是真的「一种爬法」，而是为了让 dp[2] = dp[1] + dp[0] 算出正确的 2。'],
            ['\n        dp[1] = 1', '第二个起点：走到第 1 级只能跨 1 级，只有 1 种。n 最小是 1，所以 dp[1] 这一格一定存在，不会越界。']
          ),
          c: code(
            ['\n    int dp[46];', 'C 的数组长度一般在写代码时就定死。题目保证 n 不超过 45，表最多用到 dp[45]，开 46 格一定够。'],
            ['\n    dp[0] = 1;', '第一个起点：站在地面上不动，算 1 种走法。这样 dp[2] = dp[1] + dp[0] 才能算出正确的 2。C 的局部数组不会自动清零，所以每一格在读之前都要先写进去——后面的循环会把 dp[2] 到 dp[n] 都写一遍。'],
            ['\n    dp[1] = 1;', '第二个起点：走到第 1 级只有 1 种走法。']
          ),
          cpp: code(
            ['\n        vector<int> dp(n + 1);', '要一张能放下 dp[0] 到 dp[n] 的表，一共 n + 1 格。`vector<int> dp(n + 1)` 按 n 的大小现开 n + 1 格，int 元素一开始都是 0。'],
            ['\n        dp[0] = 1;', '第一个起点：站在地面上不动，算 1 种走法。这样 dp[2] = dp[1] + dp[0] 才能算出正确的 2。'],
            ['\n        dp[1] = 1;', '第二个起点：走到第 1 级只有 1 种走法。']
          ),
          java: code(
            ['\n        int[] dp = new int[n + 1];', '要一张能放下 dp[0] 到 dp[n] 的表，一共 n + 1 格。`new int[n + 1]` 开 n + 1 格，Java 新建的 int 数组每格都是 0。'],
            ['\n        dp[0] = 1;', '第一个起点：站在地面上不动，算 1 种走法。这样 dp[2] = dp[1] + dp[0] 才能算出正确的 2。'],
            ['\n        dp[1] = 1;', '第二个起点：走到第 1 级只有 1 种走法。']
          ),
          rust: code(
            ['\n        let n = n as usize;', '后面要拿 n 做下标、定表的长度，而 Rust 的下标必须是 `usize`。先转换一次，用同名的新变量盖住旧的。'],
            ['\n        let mut dp = vec![0; n + 1];', '要一张能放下 dp[0] 到 dp[n] 的表，一共 n + 1 格。`vec![0; n + 1]` 造一个有 n + 1 个 0 的 Vec。之后要往里写值，所以加 `mut`。'],
            ['\n        dp[0] = 1;', '第一个起点：站在地面上不动，算 1 种走法。这样 dp[2] = dp[1] + dp[0] 才能算出正确的 2。'],
            ['\n        dp[1] = 1;', '第二个起点：走到第 1 级只有 1 种走法。']
          ),
        },
        sayBy: {
          python: [py('s * n', 'library/stdtypes.html#common-sequence-operations', 'equivalent to adding s to itself n times', '相当于把 s 自己加 n 次。')],
          cpp: [cppdoc('vector(size_type n)', 'vector.cons', 'Constructs a vector with n default-inserted elements using the specified allocator.', '用指定的分配器构造一个含 n 个默认插入元素的 vector。')],
          rust: [rustdoc('vec!', 'macro.vec.html', 'Creates a Vec containing the arguments.', '创建一个包含这些参数的 Vec。')],
        },
      },
      {
        section: '写代码',
        title: '从第 2 格填到第 n 格',
        say: [
          '起点有了，剩下的格子用转移一格一格算。按什么顺序填？`dp[i]` 要用 `dp[i-1]` 和 `dp[i-2]`，它们都在 i 的左边，所以从左往右填，填到 i 的时候要用的格子早就好了。',
          { viz: { kind: 'grid', title: '从左往右填', frames: trace.climb(5) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(2, n + 1):', '第 2 格到第 n 格，每一格做的事都一样，所以用循环。`range(2, n + 1)` 给出 2, 3, …, n：右端的 n + 1 取不到，所以要写 n + 1 才能填到第 n 格。n = 1 时这个范围是空的，循环一次都不跑，正好。'],
            ['\n            dp[i] = dp[i - 1] + dp[i - 2]', '走到第 i 级，最后一步要么从 i - 1 跨 1 级，要么从 i - 2 跨 2 级。这两类走法不会重复，所以把两边的种数加起来。']
          ),
          c: code(
            ['\n    for (int i = 2; i <= n; i++) {', '第 2 格到第 n 格，每一格做的事都一样，所以用循环。`i <= n` 带等号，才能填到第 n 格。n = 1 时条件一开始就不成立，循环一次都不跑。'],
            ['\n        dp[i] = dp[i - 1] + dp[i - 2];\n    }', '走到第 i 级，最后一步要么从 i - 1 跨 1 级，要么从 i - 2 跨 2 级。两类走法不重复，种数相加。']
          ),
          cpp: code(
            ['\n        for (int i = 2; i <= n; i++) {', '第 2 格到第 n 格，每一格做的事都一样，所以用循环。`i <= n` 带等号，才能填到第 n 格。'],
            ['\n            dp[i] = dp[i - 1] + dp[i - 2];\n        }', '最后一步要么从 i - 1 跨 1 级，要么从 i - 2 跨 2 级。两类走法不重复，种数相加。']
          ),
          java: code(
            ['\n        for (int i = 2; i <= n; i++) {', '第 2 格到第 n 格，每一格做的事都一样，所以用循环。`i <= n` 带等号，才能填到第 n 格。'],
            ['\n            dp[i] = dp[i - 1] + dp[i - 2];\n        }', '最后一步要么从 i - 1 跨 1 级，要么从 i - 2 跨 2 级。两类走法不重复，种数相加。']
          ),
          rust: code(
            ['\n        for i in 2..=n {', '第 2 格到第 n 格，每一格做的事都一样，所以用循环。`2..=n` 是包含 n 的范围；只写 `2..n` 会漏掉第 n 格。'],
            ['\n            dp[i] = dp[i - 1] + dp[i - 2];\n        }', '最后一步要么从 i - 1 跨 1 级，要么从 i - 2 跨 2 级。两类走法不重复，种数相加。']
          ),
        },
        sayBy: {
          python: [py('range(start, stop)', 'library/stdtypes.html#ranges', 'The range type represents an immutable sequence of numbers and is commonly used for looping a specific number of times in for loops.', 'range 表示一串不可变的数，常用在 for 循环里循环指定的次数。')],
        },
      },
      {
        section: '写代码',
        title: '答案在最后一格',
        say: ['表填满了。我们要的是走到第 n 级的走法数，按状态的定义，它就在最后一格 `dp[n]`。'],
        ops: {
          python: code(['\n        return dp[n]', '按状态的定义，`dp[n]` 就是走到第 n 级的走法数，直接返回。']),
          c: code(['\n    return dp[n];\n}', '按状态的定义，`dp[n]` 就是走到第 n 级的走法数，直接返回。最后的 `}` 结束函数。']),
          cpp: code(['\n        return dp[n];\n    }\n};', '按状态的定义，`dp[n]` 就是答案。类的右花括号后面要有分号。']),
          java: code(['\n        return dp[n];\n    }\n}', '按状态的定义，`dp[n]` 就是答案，直接返回。']),
          rust: code(['\n        dp[n]\n    }\n}', '按状态的定义，`dp[n]` 就是答案。函数最后一个表达式不加分号，它的值就是返回值。题目要的是 i32，而 `vec![0; n + 1]` 里的数没写类型，Rust 会根据这里的返回类型推断出它们是 i32。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试 n = 45',
        say: ['用两个样例验证：n = 2 应该是 2，n = 3 应该是 3。再试一下最大的 n = 45：直接递归要调用 36 亿次函数，填表只要循环 44 次，应该瞬间出结果 1836311903。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '需要一个入口来调用刚写的方法。直接运行这个文件时，才执行下面的测试。'],
            ['\n    print(Solution().climbStairs(2))\n    print(Solution().climbStairs(3))', '先跑题目的两个样例。'],
            ['\n    print(Solution().climbStairs(45))', '再试最大的 n，看看填表有多快。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['2', '3', '1836311903'] }]),
          c: code(
            ['\n\nint main(void) {', '需要一个入口来调用刚写的函数，C 程序从 `main` 开始执行。'],
            ['\n    printf("%d\\n", climbStairs(2));\n    printf("%d\\n", climbStairs(3));', '先跑题目的两个样例。`%d` 按十进制整数打印，`\\n` 换行。'],
            ['\n    printf("%d\\n", climbStairs(45));', '再试最大的 n，看看填表有多快。'],
            ['\n    return 0;\n}', '`main` 返回 0，表示程序正常结束。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['2', '3', '1836311903'] }]),
          cpp: code(
            ['\n\nint main() {', '需要一个入口来调用刚写的方法，程序从 `main` 开始执行。'],
            ['\n    cout << Solution().climbStairs(2) << endl;\n    cout << Solution().climbStairs(3) << endl;', '先跑题目的两个样例：`Solution()` 创建一个临时对象，调用它的方法，`cout` 打印。'],
            ['\n    cout << Solution().climbStairs(45) << endl;', '再试最大的 n。'],
            ['\n    return 0;\n}']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['2', '3', '1836311903'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '需要一个入口来调用刚写的方法。Java 的入口放在和文件同名的 `Main` 类里。'],
            ['\n        System.out.println(new Solution().climbStairs(2));\n        System.out.println(new Solution().climbStairs(3));', '先跑题目的两个样例。'],
            ['\n        System.out.println(new Solution().climbStairs(45));\n    }\n}', '再试最大的 n。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['2', '3', '1836311903'] }]),
          rust: code(
            ['\n\nfn main() {', '需要一个入口来调用刚写的函数，程序从 `main` 开始执行。'],
            ['\n    println!("{}", Solution::climb_stairs(2));\n    println!("{}", Solution::climb_stairs(3));', '先跑题目的两个样例。函数没有 `self` 参数，用 `Solution::` 加函数名调用。'],
            ['\n    println!("{}", Solution::climb_stairs(45));\n}', '再试最大的 n。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['2', '3', '1836311903'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '整道题的核心就一行：`dp[i] = dp[i-1] + dp[i-2]`。表有 n + 1 格，每格算一次，时间 O(n)，额外空间 O(n)。',
          '回头看四步：状态「走到第 i 级的走法数」、转移「看最后一步」、初始值「dp[0] = dp[1] = 1」、顺序「从左往右」。下一题还是爬楼梯，但每级台阶要收费，问的变成了「最少花多少钱」：加法换成了取最小值。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
