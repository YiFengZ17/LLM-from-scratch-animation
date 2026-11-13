/*
 * 动态规划 · 子数组 · 53 最大子数组和（中等）
 * 新的状态：「以第 i 个数结尾的……」。答案不在最后一格，而是整张表里最大的那格。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  const NUMS = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-53',
    group: '子数组',
    label: '53',
    title: '最大子数组和',
    summary: '状态换成「以 nums[i] 结尾的最大和」：前面的和是正的就接上，否则重新开始。',
    problem: { id: 53, level: 'medium', url: leetcode('maximum-subarray') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `nums`，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[-2, 1, -3, 4, -1, 2, 1, -5, 4]`', '`6`', '`[4, -1, 2, 1]` 的和最大'],
                ['`[1]`', '`1`', ''],
                ['`[5, 4, -1, 7, 8]`', '`23`', '整个数组'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 10^5`', '`-10^4 <= nums[i] <= 10^4`'] },
          '<a href="' + leetcode('maximum-subarray') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '能不能照上一个子模块的样子，设 `dp[i]` 为「前 i 个数里的最大子数组和」？试着写转移就会卡住：知道了前 i - 1 个数里最好的一段，第 i 个数能不能接上去？不知道——那一段不一定紧挨着第 i 个数。',
          '卡住的原因是状态里缺了「这一段在哪里结束」。那就把它加进状态里：**`dp[i]` 表示以 `nums[i]` 结尾的子数组里，最大的和**。这一段必须包含 `nums[i]`，而且到 i 为止。',
          '现在盯住最后一个数 `nums[i]`，它只有两种选择：',
          {
            list: [
              '**接在前面那段后面**：前面那段也必须以 `nums[i-1]` 结尾，最大是 `dp[i-1]`，接上后是 `dp[i-1] + nums[i]`。',
              '**自己单独开一段**：和就是 `nums[i]`。',
            ],
          },
          '取大的：`dp[i] = max(nums[i], dp[i-1] + nums[i])`。换句话说：前面的和是正的就接上，是负的就扔掉、从自己重新开始。初始值 `dp[0] = nums[0]`。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.maxSub(NUMS) } },
          '最大的那一段可能在任何位置结束，所以**答案是整张表里最大的那格**，不是最后一格。',
          '再看转移：`dp[i]` 只用到 `dp[i-1]`。泰波那契那题学过，这时不用开整张表，一个变量 `cur` 记住上一格就够，再用 `best` 记住见过的最大值。时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一个整数数组，返回最大的子数组和。和最多是 10<sup>5</sup> × 10<sup>4</sup> = 10<sup>9</sup>，还在 32 位整数的范围里。'],
        ops: {
          python: code(
            ['class Solution:', '先写 `Solution` 类。'],
            ['\n    def maxSubArray(self, nums: list[int]) -> int:', '题目给的方法：收一个整数列表，返回一个整数。']
          ),
          c: code(
            ['#include <stdio.h>', '最后要用 `printf` 打印结果，先引进标准输入输出库。'],
            ['\n\nint maxSubArray(int* nums, int numsSize) {', '题目给的函数：数组和它的长度分开传进来。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;', '要用到 `vector`、`max` 和 `cout`。'],
            ['\n\nclass Solution {\npublic:', '先写 `Solution` 类。'],
            ['\n    int maxSubArray(vector<int>& nums) {', '题目给的函数：收一个整数数组的引用，返回一个整数。']
          ),
          java: code(
            ['class Solution {', '先写 `Solution` 类。'],
            ['\n    public int maxSubArray(int[] nums) {', '题目给的方法：收一个整数数组，返回一个整数。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn max_sub_array(nums: Vec<i32>) -> i32 {', '题目给的函数：收一个 `Vec<i32>`，返回 `i32`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '从第一个数出发',
        say: ['`dp[i]` 只依赖 `dp[i-1]`，所以用一个变量 `cur` 代替整张表，它始终表示「以当前这个数结尾的最大和」。还要一个 `best` 记住一路上见过的最大的 `cur`。一开始只看第一个数：以它结尾的段只有它自己，两个变量都等于 `nums[0]`。'],
        ops: {
          python: code(
            ['\n        cur = nums[0]', '以第 0 个数结尾的段只有它自己，所以 cur 从 `nums[0]` 开始。不能从 0 开始：数组可能全是负数，那样 0 就成了一个不存在的「和」。'],
            ['\n        best = cur', '到现在只见过这一段，最大的就是它。']
          ),
          c: code(
            ['\n    int cur = nums[0];', '以第 0 个数结尾的段只有它自己，cur 从 `nums[0]` 开始。不能从 0 开始：数组可能全是负数。'],
            ['\n    int best = cur;', '到现在只见过这一段，最大的就是它。']
          ),
          cpp: code(
            ['\n        int cur = nums[0];', '以第 0 个数结尾的段只有它自己，cur 从 `nums[0]` 开始。不能从 0 开始：数组可能全是负数。'],
            ['\n        int best = cur;', '到现在只见过这一段，最大的就是它。']
          ),
          java: code(
            ['\n        int cur = nums[0];', '以第 0 个数结尾的段只有它自己，cur 从 `nums[0]` 开始。不能从 0 开始：数组可能全是负数。'],
            ['\n        int best = cur;', '到现在只见过这一段，最大的就是它。']
          ),
          rust: code(
            ['\n        let mut cur = nums[0];', '以第 0 个数结尾的段只有它自己，cur 从 `nums[0]` 开始。不能从 0 开始：数组可能全是负数。'],
            ['\n        let mut best = cur;', '到现在只见过这一段，最大的就是它。两个变量后面都要改，所以加 `mut`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '每个数：接上，还是重新开始',
        say: [
          '从第二个数开始，每个数都面对同一个选择：接在前面那段后面，还是自己重新开一段？前面那段的和 `cur` 是正的，接上只会更大；是负的，就是拖累，不如扔掉。算完新的 `cur`，顺手跟 `best` 比一比。',
          { viz: { kind: 'grid', title: '接上还是重新开始', frames: trace.maxSub(NUMS) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, len(nums)):', '第 0 个数已经处理过了，从第 1 个数一直看到最后一个。'],
            ['\n            cur = max(nums[i], cur + nums[i])', '两种选择：自己单独开一段，和是 `nums[i]`；接在前面那段后面，和是 `cur + nums[i]`。取大的，就是以 `nums[i]` 结尾的最大和。右边用的 `cur` 还是上一个数的值，算完才被换掉。'],
            ['\n            best = max(best, cur)', '最大的那段可能在任何位置结束，所以每算出一个 cur 都要跟 best 比一比。']
          ),
          c: code(
            ['\n    for (int i = 1; i < numsSize; i++) {', '第 0 个数已经处理过了，从第 1 个数一直看到最后一个。'],
            ['\n        if (cur > 0) {\n            cur += nums[i];', '前面那段的和是正的，接上只会更大：把 `nums[i]` 加进去。'],
            ['\n        } else {\n            cur = nums[i];\n        }', '前面那段的和不是正的，接上只会拖累，干脆从 `nums[i]` 重新开始。这两个分支合起来，就是 `max(nums[i], cur + nums[i])`。'],
            ['\n        if (cur > best) {\n            best = cur;\n        }\n    }', '最大的那段可能在任何位置结束，所以每个 cur 都要跟 best 比一比。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i < (int)nums.size(); i++) {', '从第 1 个数一直看到最后一个。`size()` 是无符号数，先转成 int 再和 i 比较，免得编译器警告。'],
            ['\n            cur = max(nums[i], cur + nums[i]);', '自己单独开一段，和是 `nums[i]`；接在前面那段后面，和是 `cur + nums[i]`。取大的。'],
            ['\n            best = max(best, cur);\n        }', '最大的那段可能在任何位置结束，每个 cur 都要跟 best 比一比。']
          ),
          java: code(
            ['\n        for (int i = 1; i < nums.length; i++) {', '第 0 个数已经处理过了，从第 1 个数一直看到最后一个。'],
            ['\n            cur = Math.max(nums[i], cur + nums[i]);', '自己单独开一段，和是 `nums[i]`；接在前面那段后面，和是 `cur + nums[i]`。取大的。'],
            ['\n            best = Math.max(best, cur);\n        }', '最大的那段可能在任何位置结束，每个 cur 都要跟 best 比一比。']
          ),
          rust: code(
            ['\n        for i in 1..nums.len() {', '第 0 个数已经处理过了，从第 1 个数一直看到最后一个。'],
            ['\n            cur = nums[i].max(cur + nums[i]);', '自己单独开一段，和是 `nums[i]`；接在前面那段后面，和是 `cur + nums[i]`。取大的。'],
            ['\n            best = best.max(cur);\n        }', '最大的那段可能在任何位置结束，每个 cur 都要跟 best 比一比。']
          ),
        },
        sayBy: {
          python: [py('max(arg1, arg2)', 'library/functions.html#max', 'Return the largest item in an iterable or the largest of two or more arguments.', '返回可迭代对象里最大的一项，或者两个及以上参数里最大的那个。')],
          java: [javadoc('Math.max(int a, int b)', 'java/lang/Math.html#max(int,int)', 'Returns the greater of two int values.', '返回两个 int 值里较大的那个。')],
          rust: [rustdoc('Ord::max', 'cmp/trait.Ord.html#method.max', 'Compares and returns the maximum of two values.', '比较两个值，返回较大的那个。')],
        },
      },
      {
        section: '写代码',
        title: '答案是 best',
        say: ['所有结尾位置都看过了，`best` 就是其中最大的那个和。'],
        ops: {
          python: code(['\n        return best', '返回 best，而不是 cur：cur 只是「以最后一个数结尾」的最大和，最好的那段不一定在最后结束。']),
          c: code(['\n    return best;\n}', '返回 best，而不是 cur：最好的那段不一定在最后结束。']),
          cpp: code(['\n        return best;\n    }\n};', '返回 best，而不是 cur：最好的那段不一定在最后结束。']),
          java: code(['\n        return best;\n    }\n}', '返回 best，而不是 cur：最好的那段不一定在最后结束。']),
          rust: code(['\n        best\n    }\n}', '返回 best，而不是 cur：最好的那段不一定在最后结束。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：6、1、23。再加一个全是负数的 `[-3, -1, -2]`，检验 cur 从 `nums[0]` 开始是对的：应该得 -1，而不是 0。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))\n    print(Solution().maxSubArray([1]))\n    print(Solution().maxSubArray([5, 4, -1, 7, 8]))', '题目的三个样例。'],
            ['\n    print(Solution().maxSubArray([-3, -1, -2]))', '全是负数的情况。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['6', '1', '23', '-1'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口来调用刚写的函数。'],
            ['\n    int a[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n    printf("%d\\n", maxSubArray(a, 9));', '第一个样例有 9 个数。'],
            ['\n    int b[] = {1};\n    printf("%d\\n", maxSubArray(b, 1));\n    int c[] = {5, 4, -1, 7, 8};\n    printf("%d\\n", maxSubArray(c, 5));', '另外两个样例。'],
            ['\n    int d[] = {-3, -1, -2};\n    printf("%d\\n", maxSubArray(d, 3));\n    return 0;\n}', '全是负数的情况。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['6', '1', '23', '-1'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口来调用刚写的方法。'],
            ['\n    vector<int> a = {-2, 1, -3, 4, -1, 2, 1, -5, 4}, b = {1}, c = {5, 4, -1, 7, 8};', '准备题目的三个样例。'],
            ['\n    cout << Solution().maxSubArray(a) << endl;\n    cout << Solution().maxSubArray(b) << endl;\n    cout << Solution().maxSubArray(c) << endl;', '逐个跑一遍。'],
            ['\n    vector<int> d = {-3, -1, -2};\n    cout << Solution().maxSubArray(d) << endl;\n    return 0;\n}', '全是负数的情况。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['6', '1', '23', '-1'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口来调用刚写的方法。'],
            ['\n        Solution s = new Solution();', '这次要调用好几次，先建一个对象 `s`，后面重复用它。'],
            ['\n        System.out.println(s.maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}));\n        System.out.println(s.maxSubArray(new int[]{1}));\n        System.out.println(s.maxSubArray(new int[]{5, 4, -1, 7, 8}));', '题目的三个样例。'],
            ['\n        System.out.println(s.maxSubArray(new int[]{-3, -1, -2}));\n    }\n}', '全是负数的情况。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['6', '1', '23', '-1'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口来调用刚写的函数。'],
            ['\n    println!("{}", Solution::max_sub_array(vec![-2, 1, -3, 4, -1, 2, 1, -5, 4]));\n    println!("{}", Solution::max_sub_array(vec![1]));\n    println!("{}", Solution::max_sub_array(vec![5, 4, -1, 7, 8]));', '题目的三个样例。'],
            ['\n    println!("{}", Solution::max_sub_array(vec![-3, -1, -2]));\n}', '全是负数的情况。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['6', '1', '23', '-1'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '「前 i 个数里最好的」写不出转移时，换成「以第 i 个数结尾的最好的」，往往就能写了：结尾固定了，前一段也必须以 i - 1 结尾，两者自然接得上。代价是答案要在所有结尾位置里取最大。时间 O(n)，额外空间 O(1)。',
          '下一题「最长连续递增序列」用同样的状态，转移更简单：能接上就加一，接不上就从 1 重新数。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
