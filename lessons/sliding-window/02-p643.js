/*
 * 滑动窗口 · 643 子数组最大平均数 I（简单，定长窗口）
 *
 * 写法约定（这个模块的每道题都一样）：
 *   - ops、sayBy 写成「语言 → 值」的对象，五种语言各写一份。
 *   - code([代码, 说明], ...)：说明是这一行为什么这样写、用到了什么语法，
 *     会以注释的样子出现在这一行上方。say 是这一步开始前的思路提示，几种语言共用。
 *   - 第一道题的说明最细：入口函数、打印、类型转换这些写法都在这里讲一次，后面的题只提新出现的写法。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { py, cppdoc, javadoc, rustdoc } = root.LessonKit;

  const NUMS = [1, 12, -5, -6, 50, 3];

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-643',
    label: '643',
    title: '子数组最大平均数 I',
    summary: '定长窗口的第一题：窗口右移时加一个、减一个，和不用从头算。',
    problem: { id: 643, level: 'easy', url: leetcode('maximum-average-subarray-i') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给一个整数数组 `nums` 和一个整数 `k`，在所有长度为 k 的连续子数组里，找出平均数最大的那一个，返回这个最大平均数。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`nums = [1, 12, -5, -6, 50, 3]`, `k = 4`', '`12.75`', '`[12, -5, -6, 50]` 的平均数最大：51 / 4 = 12.75'],
                ['`nums = [5]`, `k = 1`', '`5.0`', '只有一个窗口'],
              ],
            },
          },
          {
            list: [
              '`n == nums.length`',
              '`1 <= k <= n <= 10^5`',
              '`-10^4 <= nums[i] <= 10^4`',
            ],
          },
          '<a href="' + leetcode('maximum-average-subarray-i') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '长度固定为 k，所以平均数最大的窗口，就是**和**最大的窗口。全程只比较和，最后除一次 k。',
          '暴力解把每个窗口单独加一遍，要做 n × k 次加法。概念章里说过，窗口右移一格只有两个数变了：进来一个、出去一个。所以先算出第一个窗口的和，之后每一步加上进来的、减去出去的：',
          { viz: { kind: 'array', title: '样例 1：k = 4', frames: trace.fixedSum(NUMS, 4) } },
          {
            table: {
              head: ['', '时间', '额外空间'],
              rows: [
                ['暴力', 'O(n · k)', 'O(1)'],
                ['滑动窗口', 'O(n)', 'O(1)'],
              ],
            },
          },
          '代码分四步写：函数签名、第一个窗口、窗口右移、返回结果。最后写一个入口，用两个样例跑一遍。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['动手之前先想清楚：题目要我们写一个函数，给它数组 `nums` 和窗口长度 `k`，它返回最大的平均数。函数长什么样题目已经规定好了，先照着把架子搭出来，里面再慢慢填。'],
        ops: {
          python: code(
            ['class Solution:', '力扣要求把解法放进一个叫 `Solution` 的类里，评测时它会创建这个类、调用里面的方法。所以先写类。'],
            ['\n    def findMaxAverage(self, nums: list[int], k: int) -> float:', '题目给的方法叫 `findMaxAverage`：收一个整数列表和一个整数，返回一个小数。`self` 是 Python 方法固定的第一个参数，指对象本身；`list[int]`、`-> float` 是类型注解，只写给人看，运行时不检查。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要把结果打印出来看，打印用的 `printf` 在标准输入输出库里，先用 `#include` 把它引进来。'],
            ['\n\ndouble findMaxAverage(int* nums, int numsSize, int k) {', '题目给的函数收三样东西。C 的数组不记得自己有多长，所以长度 `numsSize` 要单独传进来；`int* nums` 是指向第一个元素的指针，用起来和数组一样写 `nums[i]`。平均数是小数，所以返回 `double`。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>', '先想好要用到哪些工具：打印要 `iostream`，数组要 `vector`，比大小的 `max` 在 `algorithm` 里。'],
            ['\nusing namespace std;', '标准库的名字都在 `std` 里。写上这一行，后面就能直接写 `vector`、`cout`，不用每次写 `std::`。'],
            ['\n\nclass Solution {\npublic:', '力扣要求把解法放进 `Solution` 类里。`public:` 让下面的方法能从类外面调用。'],
            ['\n    double findMaxAverage(vector<int>& nums, int k) {', '题目给的函数：收一个整数数组和 k，返回小数。`vector<int>&` 里的 `&` 表示引用，直接用调用方那个数组，不复制一份。']
          ),
          java: code(
            ['class Solution {', '力扣要求把解法放进 `Solution` 类里，先写类。'],
            ['\n    public double findMaxAverage(int[] nums, int k) {', '题目给的方法：收一个整数数组和 k，返回小数。Java 的数组自己记得长度，后面用 `nums.length` 取。']
          ),
          rust: code(
            ['struct Solution;', '力扣的 Rust 题解写在 `impl Solution` 里，评测时这个结构体已经声明好了。我们在本地运行，得自己先声明一个空的。'],
            ['\n\nimpl Solution {', '`impl` 块里放属于 `Solution` 的函数。'],
            ['\n    pub fn find_max_average(nums: Vec<i32>, k: i32) -> f64 {', '题目给的函数：收一个整数数组 `Vec<i32>` 和 k，返回 64 位小数 `f64`。Rust 的函数名用小写加下划线；`pub` 让外面可以调用。']
          ),
        },
        sayBy: {
          cpp: [cppdoc('vector', 'vector.overview', 'A vector is a sequence container that supports (amortized) constant time insert and erase operations at the end; insert and erase in the middle take linear time.', 'vector 是一种序列容器：在末尾插入和删除是（均摊）常数时间，在中间插入和删除是线性时间。')],
        },
      },
      {
        section: '写代码',
        title: '最左边的第一个窗口',
        say: ['怎么比较所有窗口？想象一个宽度正好是 k 的框，先放在数组最左边。这个框里的和，只能老老实实加一次——它是后面所有计算的起点。'],
        ops: {
          python: code(
            ['\n        window = sum(nums[:k])', '先算最左边这个框：取出前 k 个数，加起来。`nums[:k]` 是切片，取下标 0 到 k-1；`sum` 求和。用 `window` 记住「当前框里的和」。'],
            ['\n        best = window', '到现在只见过这一个框，最好的就是它。先记成 `best`，后面遇到更大的再换。']
          ),
          c: code(
            ['\n    int window = 0;', '要把前 k 个数加起来，先准备一个从 0 开始的累加器。C 的局部变量不会自动清零，里面可能是任意的旧数据，所以必须写 `= 0`。'],
            ['\n    for (int i = 0; i < k; i++) {', 'C 没有现成的求和函数，那就自己用循环一个个加：`i` 从 0 走到 k-1，`i++` 表示每轮加一。'],
            ['\n        window += nums[i];\n    }', '每一轮把第 i 个数加进累加器。`+=` 就是「在原来的基础上加」。'],
            ['\n    int best = window;', '到现在只见过这一个框，最好的就是它，先记下来。']
          ),
          cpp: code(
            ['\n        int window = 0;', '要把前 k 个数加起来，先准备一个从 0 开始的累加器。'],
            ['\n        for (int i = 0; i < k; i++) {\n            window += nums[i];\n        }', '用循环把前 k 个数一个个加进去：`i` 从 0 走到 k-1。'],
            ['\n        int best = window;', '到现在只见过这一个框，最好的就是它，先记下来。']
          ),
          java: code(
            ['\n        int window = 0;', '要把前 k 个数加起来，先准备一个从 0 开始的累加器。Java 要求局部变量先赋值才能用。'],
            ['\n        for (int i = 0; i < k; i++) {\n            window += nums[i];\n        }', '用循环把前 k 个数一个个加进去：`i` 从 0 走到 k-1。'],
            ['\n        int best = window;', '到现在只见过这一个框，最好的就是它，先记下来。']
          ),
          rust: code(
            ['\n        let k = k as usize;', '后面要拿 k 去做下标，而 Rust 规定下标必须是 `usize` 类型，题目给的却是 `i32`。先转换一次，用同名的新变量盖住旧的，这叫遮蔽（shadowing）。'],
            ['\n        let mut window: i32 = nums[..k].iter().sum();', '算最左边这个框：`nums[..k]` 取出前 k 个数，`.iter().sum()` 把它们加起来。`sum` 要知道结果是什么类型，所以写明 `: i32`。框会移动、和会变，所以加 `mut`（Rust 的变量默认不能改）。'],
            ['\n        let mut best = window;', '到现在只见过这一个框，最好的就是它，先记下来。']
          ),
        },
        sayBy: {
          python: [
            py('sum(iterable, start=0)', 'library/functions.html#sum', 'Sums start and the items of an iterable from left to right and returns the total.', '从左到右把 start 和可迭代对象里的各项加起来，返回总和。'),
            py('切片 s[i:j]', 'library/stdtypes.html#common-sequence-operations', 'The slice of s from i to j is defined as the sequence of items with index k such that i <= k < j.', '从 i 到 j 的切片，是下标 k 满足 i <= k < j 的那些元素。'),
          ],
          rust: [rustdoc('Iterator::sum', 'iter/trait.Iterator.html#method.sum', 'Sums the elements of an iterator. Takes each element, adds them together, and returns the result.', '把迭代器里的元素加起来：取出每个元素相加，返回结果。')],
        },
      },
      {
        section: '写代码',
        title: '让窗口一格一格往右挪',
        say: [
          '现在让框一格一格往右挪，直到右边碰到数组末尾。每挪一格，和会怎么变？只有两个数变了：右边新进来一个，左边掉出去一个。所以不用重新加 k 个数，改两处就够了。',
          { viz: { kind: 'array', title: '每挪一格只改两处', frames: trace.fixedSum(NUMS, 4) } },
        ],
        ops: {
          python: code(
            ['\n        for right in range(k, len(nums)):', '框要一格一格挪，这就需要一个循环。用 `right` 表示框的右端：第一个框的右端在 k-1，挪一格后在 k，一直挪到最后一个下标。`range(k, len(nums))` 正好给出 k 到 len(nums)-1，不含 len(nums)。'],
            ['\n            window += nums[right] - nums[right - k]', '挪一格：右边进来的是 `nums[right]`；左边掉出去的是框原来最左边那个数，下标是 `right - k`。加上进来的，减去出去的。'],
            ['\n            best = max(best, window)', '新框的和有了，跟目前最好的比一比，大的留下。']
          ),
          c: code(
            ['\n    for (int right = k; right < numsSize; right++) {', '框要一格一格挪，需要一个循环。`right` 表示框的右端，从下标 k 开始，一直挪到最后一个下标 `numsSize - 1`。'],
            ['\n        window += nums[right] - nums[right - k];', '挪一格：右边进来 `nums[right]`，左边掉出去 `nums[right - k]`。加上进来的，减去出去的。题目保证和不会超出 int 的范围。'],
            ['\n        if (window > best) {\n            best = window;\n        }\n    }', '新框的和跟目前最好的比一比。C 标准库没有比较两个 int 的 max 函数，就自己写一个 if：更大就记下来。']
          ),
          cpp: code(
            ['\n        for (int right = k; right < (int)nums.size(); right++) {', '框要一格一格挪，需要一个循环，`right` 是框的右端，从 k 挪到最后。`nums.size()` 返回的是无符号整数，跟有符号的 `right` 比较会有警告，先用 `(int)` 转一下。'],
            ['\n            window += nums[right] - nums[right - k];', '挪一格：右边进来 `nums[right]`，左边掉出去 `nums[right - k]`。'],
            ['\n            best = max(best, window);\n        }', '新框的和跟目前最好的比一比，`max` 留下大的那个。']
          ),
          java: code(
            ['\n        for (int right = k; right < nums.length; right++) {', '框要一格一格挪，需要一个循环，`right` 是框的右端，从 k 挪到最后一个下标 `nums.length - 1`。'],
            ['\n            window += nums[right] - nums[right - k];', '挪一格：右边进来 `nums[right]`，左边掉出去 `nums[right - k]`。'],
            ['\n            best = Math.max(best, window);\n        }', '新框的和跟目前最好的比一比，`Math.max` 留下大的那个。']
          ),
          rust: code(
            ['\n        for right in k..nums.len() {', '框要一格一格挪，需要一个循环，`right` 是框的右端。`k..nums.len()` 是从 k 到 nums.len()-1 的范围，不含右端。'],
            ['\n            window += nums[right] - nums[right - k];', '挪一格：右边进来 `nums[right]`，左边掉出去 `nums[right - k]`。'],
            ['\n            best = best.max(window);\n        }', '新框的和跟目前最好的比一比，`best.max(window)` 留下大的那个。']
          ),
        },
        sayBy: {
          python: [
            py('range(start, stop)', 'library/stdtypes.html#ranges', 'The range type represents an immutable sequence of numbers and is commonly used for looping a specific number of times in for loops.', 'range 表示一串不可变的数，常用在 for 循环里循环指定的次数。'),
            py('max(arg1, arg2)', 'library/functions.html#max', 'Return the largest item in an iterable or the largest of two or more arguments.', '返回可迭代对象里最大的一项，或者两个及以上参数里最大的那个。'),
          ],
          java: [javadoc('Math.max(int a, int b)', 'java/lang/Math.html#max(int,int)', 'Returns the greater of two int values.', '返回两个 int 值里较大的那个。')],
          rust: [rustdoc('Ord::max', 'cmp/trait.Ord.html#method.max', 'Compares and returns the maximum of two values.', '比较两个值，返回较大的那个。')],
        },
      },
      {
        section: '写代码',
        title: '把最大的和换成平均数',
        say: ['框挪到头了，最大的和就在 `best` 里。题目要的是平均数：每个框长度都是 k，和最大的平均数也最大，所以最后除一次 k 就行。'],
        ops: {
          python: code(['\n        return best / k', '把最大的和除以 k。Python 3 的 `/` 总是得到小数，51 / 4 得 12.75；要整除才写 `//`。']),
          c: code(['\n    return (double)best / k;\n}', '把最大的和除以 k。小心：C 里两个 int 相除会直接丢掉小数，51 / 4 得 12。所以先用 `(double)` 把 best 变成小数再除。最后的 `}` 结束函数。']),
          cpp: code(['\n        return (double)best / k;\n    }\n};', '把最大的和除以 k。和 C 一样，两个 int 相除会丢掉小数，先转成 double。类的右花括号后面别忘了分号。']),
          java: code(['\n        return (double) best / k;\n    }\n}', '把最大的和除以 k。两个 int 相除会丢掉小数，先把 best 转成 double。']),
          rust: code(['\n        best as f64 / k as f64\n    }\n}', '把最大的和除以 k。Rust 不会自动转换数字类型，两边都用 `as f64` 变成小数再除。函数最后一个表达式不加分号，它的值就是返回值。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['写完了，用题目的两个样例验证。先想好预期：第一个应该是 12.75；第二个数组只有一个数，平均数就是 5。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '需要一个入口来调用刚写的方法。这一行判断「是不是直接运行这个文件」：是的话才执行下面的测试，别人导入这个文件时不会执行。'],
            ['\n    print(Solution().findMaxAverage([1, 12, -5, -6, 50, 3], 4))', '先创建一个 `Solution` 对象，用第一个样例调用它，把结果打印出来。'],
            ['\n    print(Solution().findMaxAverage([5], 1))', '再试第二个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['12.75', '5.0'] }]),
          c: code(
            ['\n\nint main(void) {', '需要一个入口来调用刚写的函数。C 程序从 `main` 开始执行，`void` 表示它不收参数。'],
            ['\n    int a[] = {1, 12, -5, -6, 50, 3};', '准备第一个样例。`int a[] = {…}` 方括号里不写长度，编译器会自己数出是 6 个。'],
            ['\n    printf("%.5f\\n", findMaxAverage(a, 6, 4));', '调用函数，把结果打印出来。`%.5f` 表示打印保留 5 位的小数，`\\n` 换行。'],
            ['\n    int b[] = {5};\n    printf("%.5f\\n", findMaxAverage(b, 1, 1));', '再试第二个样例。'],
            ['\n    return 0;\n}', '`main` 返回 0，告诉系统程序正常结束。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['12.75000', '5.00000'] }]),
          cpp: code(
            ['\n\nint main() {', '需要一个入口来调用刚写的方法，程序从 `main` 开始执行。'],
            ['\n    vector<int> a = {1, 12, -5, -6, 50, 3};', '准备第一个样例，用花括号列表初始化一个 vector。'],
            ['\n    cout << Solution().findMaxAverage(a, 4) << endl;', '`Solution()` 创建一个临时对象，调用它的方法；`cout << …` 把结果输出到屏幕，`endl` 换行。'],
            ['\n    vector<int> b = {5};\n    cout << Solution().findMaxAverage(b, 1) << endl;', '再试第二个样例。'],
            ['\n    return 0;\n}']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['12.75', '5'] }]),
          java: code(
            ['\n\npublic class Main {', '需要一个入口来调用刚写的方法。Java 的入口要放在一个类里，而 public 类的名字必须和文件名一样，所以叫 `Main`。'],
            ['\n    public static void main(String[] args) {', '这就是程序的入口。`static` 表示不用先创建 Main 对象就能运行它。'],
            ['\n        System.out.println(new Solution().findMaxAverage(new int[]{1, 12, -5, -6, 50, 3}, 4));', '用第一个样例调用：`new Solution()` 创建对象，`new int[]{…}` 当场造一个数组，`System.out.println` 打印并换行。'],
            ['\n        System.out.println(new Solution().findMaxAverage(new int[]{5}, 1));\n    }\n}', '再试第二个样例。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['12.75', '5.0'] }]),
          rust: code(
            ['\n\nfn main() {', '需要一个入口来调用刚写的函数，程序从 `main` 开始执行。'],
            ['\n    println!("{}", Solution::find_max_average(vec![1, 12, -5, -6, 50, 3], 4));', '用第一个样例调用。`vec![…]` 当场造一个 Vec；函数没有 `self` 参数，用 `Solution::` 加函数名来调用。`println!` 打印，`{}` 是要填进去的值。'],
            ['\n    println!("{}", Solution::find_max_average(vec![5], 1));\n}', '再试第二个样例。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['12.75', '5'] }]),
        },
        sayBy: {
          python: ['Python 打印小数时至少带一位小数，所以第二个显示成 5.0。'],
          c: ['`%.5f` 固定打印 5 位小数，所以是 12.75000 和 5.00000。'],
          cpp: ['`cout` 打印小数时会去掉末尾多余的 0，所以第二个显示成 5。'],
          java: ['Java 打印 double 时至少带一位小数，所以第二个显示成 5.0。'],
          rust: ['Rust 打印小数时会去掉多余的 .0，所以第二个显示成 5。'],
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '定长窗口的核心就一行：`window += nums[right] - nums[right - k]`。每个数进窗口一次、出窗口一次，时间 O(n)；只用了几个变量，额外空间 O(1)。',
          '下一题同样是定长窗口，长度固定为 3，但窗口里要看的不是和，而是三个字符是否各不相同。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
