/*
 * 动态规划 · 子数组 · 152 乘积最大子数组（中等）
 * 乘上负数，最大和最小会对调，所以同时记两个状态：以 nums[i] 结尾的最大积和最小积。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cppdoc, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-152',
    group: '子数组',
    label: '152',
    title: '乘积最大子数组',
    summary: '负数会让最大变最小、最小变最大，所以同时记以 nums[i] 结尾的最大积和最小积。',
    problem: { id: 152, level: 'medium', url: leetcode('maximum-product-subarray') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `nums`，请你找出数组中乘积最大的非空连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[2, 3, -2, 4]`', '`6`', '`[2, 3]` 的乘积最大'],
                ['`[-2, 0, -1]`', '`0`', '`[-2, -1]` 不连续，不能选'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 2 * 10^4`', '`-10 <= nums[i] <= 10`', '答案保证在 32 位整数范围内'] },
          '<a href="' + leetcode('maximum-product-subarray') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '先照搬 53 题：设 `hi[i]` 为以 `nums[i]` 结尾的最大乘积，转移写成 `max(nums[i], hi[i-1] × nums[i])`。拿 `[-2, 3, -4]` 试一下：hi 依次是 -2、3、-4，答案得 3。可正确答案是整个数组：(-2) × 3 × (-4) = 24。',
          '错在哪？以 3 结尾时，最大积是 3，但**最小积**是 -6。下一个数是 -4，负数乘负数，最小的 -6 一下子变成了最大的 24。只记最大值，就把这个可能扔掉了。',
          '所以同时记两个状态：`hi[i]` 是以 `nums[i]` 结尾的**最大**乘积，`lo[i]` 是**最小**乘积。以 `nums[i]` 结尾的段，乘积只可能来自三个候选：',
          {
            list: [
              '`nums[i]` 自己单独一段；',
              '接在最大积那段后面：`hi[i-1] × nums[i]`；',
              '接在最小积那段后面：`lo[i-1] × nums[i]`。',
            ],
          },
          '三个候选里最大的是 `hi[i]`，最小的是 `lo[i]`。答案是所有 `hi[i]` 里最大的。',
          { viz: { kind: 'grid', title: '[-2, 3, -4]', frames: trace.maxProduct([-2, 3, -4]) } },
          { viz: { kind: 'grid', title: '样例 1：[2, 3, -2, 4]', frames: trace.maxProduct([2, 3, -2, 4]) } },
          '和前两题一样，每格只看前一格，用 `hi`、`lo`、`best` 三个变量就够。时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一个整数数组，返回最大乘积。题目只保证**答案**在 32 位范围内，中间的最小积在乘的过程中有可能超出。所以在要指定整数大小的语言里，中间结果用 64 位整数存，最后再转回 32 位返回。'],
        ops: {
          python: code(
            ['class Solution:', '先写 `Solution` 类。'],
            ['\n    def maxProduct(self, nums: list[int]) -> int:', '题目给的方法：收一个整数列表，返回一个整数。Python 的整数没有大小上限，不用担心溢出。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果，先引进标准输入输出库。'],
            ['\n\nint maxProduct(int* nums, int numsSize) {', '题目给的函数：返回值是 int，中间结果我们自己用 64 位存。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;', '要用到 `vector`、`max`、`min` 和 `cout`。'],
            ['\n\nclass Solution {\npublic:', '先写 `Solution` 类。'],
            ['\n    int maxProduct(vector<int>& nums) {', '题目给的函数：返回值是 int，中间结果我们自己用 64 位存。']
          ),
          java: code(
            ['class Solution {', '先写 `Solution` 类。'],
            ['\n    public int maxProduct(int[] nums) {', '题目给的方法：返回值是 int，中间结果我们自己用 64 位的 long 存。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn max_product(nums: Vec<i32>) -> i32 {', '题目给的函数：返回值是 `i32`，中间结果我们自己用 64 位的 `i64` 存。']
          ),
        },
      },
      {
        section: '写代码',
        title: '三个变量从第一个数出发',
        say: ['只看第一个数时，以它结尾的段只有它自己：最大积、最小积、目前最好的答案，都是 `nums[0]`。'],
        ops: {
          python: code(['\n        hi = lo = best = nums[0]', '以第 0 个数结尾的段只有它自己，所以最大积 `hi`、最小积 `lo` 和答案 `best` 都从 `nums[0]` 开始。连等号一次给三个变量同一个值。']),
          c: code(['\n    long long hi = nums[0], lo = nums[0], best = nums[0];', '最大积 `hi`、最小积 `lo`、答案 `best` 都从 `nums[0]` 开始。用 `long long` 存，它至少有 64 位，乘的过程中不会溢出。']),
          cpp: code(['\n        long long hi = nums[0], lo = nums[0], best = nums[0];', '最大积 `hi`、最小积 `lo`、答案 `best` 都从 `nums[0]` 开始。用 64 位的 `long long` 存，乘的过程中不会溢出。']),
          java: code(['\n        long hi = nums[0], lo = nums[0], best = nums[0];', '最大积 `hi`、最小积 `lo`、答案 `best` 都从 `nums[0]` 开始。Java 的 `long` 是 64 位，int 赋给它会自动变宽。']),
          rust: code(['\n        let (mut hi, mut lo, mut best) = (nums[0] as i64, nums[0] as i64, nums[0] as i64);', '最大积 `hi`、最小积 `lo`、答案 `best` 都从 `nums[0]` 开始。Rust 不会自动把 i32 变成 i64，要用 `as i64` 显式转换。']),
        },
      },
      {
        section: '写代码',
        title: '三个候选，最大的和最小的都留下',
        say: [
          '从第二个数开始，以它结尾的乘积有三个候选：它自己、接在最大积后面、接在最小积后面。三个都算出来，最大的给 `hi`，最小的给 `lo`。注意两个新值都要用**更新之前**的 hi 和 lo 来算。',
          { viz: { kind: 'grid', title: '负数让大小对调', frames: trace.maxProduct([-2, 3, -4]) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, len(nums)):', '第 0 个数处理过了，从第 1 个数看到最后一个。'],
            ['\n            x = nums[i]', '当前这个数要用好几次，起个短名字。'],
            ['\n            candidates = (x, hi * x, lo * x)', '三个候选：自己单独一段、接在最大积后面、接在最小积后面。先把它们一起算好放进元组，这时 hi 和 lo 都还是上一个数的值。'],
            ['\n            hi = max(candidates)\n            lo = min(candidates)', '候选里最大的是新的最大积，最小的是新的最小积。因为候选已经提前算好，先改 hi 不会影响 lo 的计算。'],
            ['\n            best = max(best, hi)', '最大积的那段可能在任何位置结束，每次都和 best 比一比。']
          ),
          c: code(
            ['\n    for (int i = 1; i < numsSize; i++) {', '第 0 个数处理过了，从第 1 个数看到最后一个。'],
            ['\n        long long x = nums[i];', '当前这个数要用好几次，先放进一个 64 位变量。这样下面的乘法都在 64 位里做。'],
            ['\n        long long p = hi * x, q = lo * x;', '先用旧的 hi 和 lo 把两个乘积算好：p 是接在最大积后面，q 是接在最小积后面。要是边算边改 hi，算 lo 时就用错了值。'],
            ['\n        hi = x;\n        if (p > hi) hi = p;\n        if (q > hi) hi = q;', '在 x、p、q 三个候选里找最大的：先假设是 x，遇到更大的就换。if 后面只有一条语句时可以不写花括号。'],
            ['\n        lo = x;\n        if (p < lo) lo = p;\n        if (q < lo) lo = q;', '同样的办法找最小的。'],
            ['\n        if (hi > best) best = hi;\n    }', '最大积的那段可能在任何位置结束，每次都和 best 比一比。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)nums.size(); i++) {', '第 0 个数处理过了，从第 1 个数看到最后一个。'],
            ['\n            long long x = nums[i];', '当前这个数放进 64 位变量，下面的乘法都在 64 位里做。'],
            ['\n            long long p = hi * x, q = lo * x;', '先用旧的 hi 和 lo 把两个乘积算好，免得改了 hi 再算 lo 时用错值。'],
            ['\n            hi = max({x, p, q});\n            lo = min({x, p, q});', '三个候选里最大的给 hi，最小的给 lo。`max` 和 `min` 可以收一个花括号列表，一次比好几个。'],
            ['\n            best = max(best, hi);\n        }', '每次都和 best 比一比。']
          ),
          java: code(
            ['\n        for (int i = 1; i < nums.length; i++) {', '第 0 个数处理过了，从第 1 个数看到最后一个。'],
            ['\n            long x = nums[i];', '当前这个数放进 long，下面的乘法都在 64 位里做。'],
            ['\n            long p = hi * x, q = lo * x;', '先用旧的 hi 和 lo 把两个乘积算好，免得改了 hi 再算 lo 时用错值。'],
            ['\n            hi = Math.max(x, Math.max(p, q));\n            lo = Math.min(x, Math.min(p, q));', '`Math.max` 一次只比两个，三个数就套两层：先比 p 和 q，再和 x 比。最小值同理。'],
            ['\n            best = Math.max(best, hi);\n        }', '每次都和 best 比一比。']
          ),
          rust: code(
            ['\n        for i in 1..nums.len() {', '第 0 个数处理过了，从第 1 个数看到最后一个。'],
            ['\n            let x = nums[i] as i64;', '当前这个数转成 i64，下面的乘法都在 64 位里做。'],
            ['\n            let (p, q) = (hi * x, lo * x);', '先用旧的 hi 和 lo 把两个乘积算好，免得改了 hi 再算 lo 时用错值。'],
            ['\n            hi = x.max(p).max(q);\n            lo = x.min(p).min(q);', '三个候选里找最大：x 先和 p 比，结果再和 q 比，链式调用两次 `max`。最小值同理。'],
            ['\n            best = best.max(hi);\n        }', '每次都和 best 比一比。']
          ),
        },
        sayBy: {
          python: [py('min(arg1, arg2)', 'library/functions.html#min', 'Return the smallest item in an iterable or the smallest of two or more arguments.', '返回可迭代对象里最小的一项，或者两个及以上参数里最小的那个。')],
          cpp: [cppdoc('max(initializer_list<T> r)', 'alg.min.max', 'The largest value in the input range. Returns a copy of the leftmost element when several elements are equivalent to the largest.', '（返回值是）输入范围里最大的值；有几个元素同样最大时，返回最左边那个的副本。')],
          java: [javadoc('Math.max(long a, long b)', 'java/lang/Math.html#max(long,long)', 'Returns the greater of two long values.', '返回两个 long 值里较大的那个。')],
          rust: [rustdoc('Ord::min', 'cmp/trait.Ord.html#method.min', 'Compares and returns the minimum of two values.', '比较两个值，返回较小的那个。')],
        },
      },
      {
        section: '写代码',
        title: '把答案转回 32 位',
        say: ['`best` 就是所有结尾位置里最大的乘积。题目保证它在 32 位范围内，转回题目要的类型返回。'],
        ops: {
          python: code(['\n        return best', 'best 就是答案。Python 的整数不分大小，直接返回。']),
          c: code(['\n    return (int)best;\n}', '题目保证答案在 int 范围里，用 `(int)` 转回去返回。']),
          cpp: code(['\n        return (int)best;\n    }\n};', '题目保证答案在 int 范围里，用 `(int)` 转回去返回。']),
          java: code(['\n        return (int) best;\n    }\n}', 'long 变回 int 可能丢数据，Java 要求写明 `(int)` 才肯转。题目保证答案在 int 范围里，这里是安全的。']),
          rust: code(['\n        best as i32\n    }\n}', '题目保证答案在 i32 范围里，用 `as i32` 转回去，作为最后一个表达式返回。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试负负得正',
        say: ['预期：两个样例分别是 6 和 0。再试思路里那个只记最大值会出错的 `[-2, 3, -4]`，应该得 24。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().maxProduct([2, 3, -2, 4]))\n    print(Solution().maxProduct([-2, 0, -1]))', '题目的两个样例。'],
            ['\n    print(Solution().maxProduct([-2, 3, -4]))', '负负得正的例子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['6', '0', '24'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    int a[] = {2, 3, -2, 4};\n    printf("%d\\n", maxProduct(a, 4));\n    int b[] = {-2, 0, -1};\n    printf("%d\\n", maxProduct(b, 3));', '题目的两个样例。'],
            ['\n    int c[] = {-2, 3, -4};\n    printf("%d\\n", maxProduct(c, 3));\n    return 0;\n}', '负负得正的例子。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['6', '0', '24'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    vector<int> a = {2, 3, -2, 4}, b = {-2, 0, -1};\n    cout << Solution().maxProduct(a) << endl;\n    cout << Solution().maxProduct(b) << endl;', '题目的两个样例。'],
            ['\n    vector<int> c = {-2, 3, -4};\n    cout << Solution().maxProduct(c) << endl;\n    return 0;\n}', '负负得正的例子。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['6', '0', '24'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        Solution s = new Solution();\n        System.out.println(s.maxProduct(new int[]{2, 3, -2, 4}));\n        System.out.println(s.maxProduct(new int[]{-2, 0, -1}));', '建一个对象重复用，跑题目的两个样例。'],
            ['\n        System.out.println(s.maxProduct(new int[]{-2, 3, -4}));\n    }\n}', '负负得正的例子。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['6', '0', '24'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::max_product(vec![2, 3, -2, 4]));\n    println!("{}", Solution::max_product(vec![-2, 0, -1]));', '题目的两个样例。'],
            ['\n    println!("{}", Solution::max_product(vec![-2, 3, -4]));\n}', '负负得正的例子。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['6', '0', '24'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '子数组写完了',
        say: [
          '一个状态不够推出下一步时，就多记一个：这道题同时记最大积和最小积，因为乘上负数两者会对调。时间 O(n)，额外空间 O(1)。',
          '子数组这三题的状态都是「以第 i 个数结尾」，答案在所有结尾位置里取最好。下一个子模块「股票」会把这个想法再推一步：每一天分「手里有股票」和「手里没股票」两种状态。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
