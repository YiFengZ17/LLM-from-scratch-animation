/*
 * 前缀和 · 238 除了自身以外数组的乘积（中等）
 * 前后缀分解：答案 = 左边的积 × 右边的积。左边的积直接存在答案数组里，右边的积用一个变量从右往左滚。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.PS;

  const OUT = ['[24, 12, 8, 6]', '[0, 0, 9, 0, 0]'];

  root.Catalog.addChapter('prefix-sum', {
    id: 'ps-238',
    label: '238',
    title: '除了自身以外数组的乘积',
    summary: '不能用除法：除了自己以外 = 左边的 × 右边的。左边的积存在答案里，右边的积从右往左用一个变量滚，额外空间 O(1)。',
    problem: { id: 238, level: 'medium', url: leetcode('product-of-array-except-self') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `nums`，返回数组 `answer`，其中 `answer[i]` 等于 `nums` 中除 `nums[i]` 之外其余各元素的乘积。题目数据保证数组 `nums` 之中任意元素的全部前缀元素和后缀的乘积都在 32 位整数范围内。请**不要使用除法**，且在 O(n) 时间复杂度内完成此题。',
          '进阶：你可以在 O(1) 的额外空间复杂度内完成这个题目吗？（出于对空间复杂度分析的目的，输出数组不被视为额外空间。）',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[1, 2, 3, 4]`', '`[24, 12, 8, 6]`'],
                ['`[-1, 1, 0, -3, 3]`', '`[0, 0, 9, 0, 0]`'],
              ],
            },
          },
          { list: ['`2 <= nums.length <= 10^5`', '`-30 <= nums[i] <= 30`'] },
          '<a href="' + leetcode('product-of-array-except-self') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：左边的 × 右边的',
        doc: [
          '能用除法的话，全部乘起来再除以 nums[i] 就行。可题目不让用除法，而且数里有 0 时除法也行不通（样例 2）。',
          '「除了 nums[i] 以外的所有数」正好分成两部分：**它左边的**和**它右边的**。所以：',
          '`answer[i] = (nums[0] × … × nums[i−1]) × (nums[i+1] × … × nums[n−1])`',
          '左边的积从左往右推：第 i 个的左边积 = 第 i−1 个的左边积 × nums[i−1]。右边的积从右往左推，同理。最左边的「左边积」和最右边的「右边积」什么都没乘，记作 1。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.product([1, 2, 3, 4]) } },
          '进阶要求 O(1) 额外空间（输出数组不算）：**左边积直接存进答案数组**；第二遍从右往左时，右边积只用一个变量 `right` 一路乘过来，每到一格就乘进答案里。两遍扫描，时间 O(n)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '第一遍：左边的积存进答案',
        say: ['先准备长度为 n 的答案数组。第 0 个数左边什么都没有，左边积是 1；之后每一格的左边积 = 前一格的左边积 × 前一个数。'],
        ops: {
          python: code(
            ['class Solution:\n    def productExceptSelf(self, nums: list[int]) -> list[int]:', '照例写类和方法。'],
            ['\n        n = len(nums)\n        ans = [1] * n', '答案数组先全填 1：ans[0] 的左边积就是 1。'],
            ['\n        for i in range(1, n):\n            ans[i] = ans[i - 1] * nums[i - 1]', '从左往右：第 i 个的左边积 = 第 i−1 个的左边积 × nums[i−1]。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '要用 `malloc` 申请答案数组。'],
            ['\n\nint* productExceptSelf(int* nums, int numsSize, int* returnSize) {', '力扣的 C 签名：返回数组指针，长度通过 `returnSize` 写回。'],
            ['\n    int* ans = malloc(numsSize * sizeof(int));\n    *returnSize = numsSize;', '答案和输入一样长。'],
            ['\n    ans[0] = 1;\n    for (int i = 1; i < numsSize; i++) {\n        ans[i] = ans[i - 1] * nums[i - 1];\n    }', '第 0 个的左边积是 1；之后每一格 = 前一格的左边积 × 前一个数。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {', '照例的架子。'],
            ['\n        int n = nums.size();\n        vector<int> ans(n, 1);', '答案数组先全填 1：ans[0] 的左边积就是 1。'],
            ['\n        for (int i = 1; i < n; i++) {\n            ans[i] = ans[i - 1] * nums[i - 1];\n        }', '从左往右算左边积。']
          ),
          java: code(
            ['class Solution {\n    public int[] productExceptSelf(int[] nums) {', '照例的架子。'],
            ['\n        int n = nums.length;\n        int[] ans = new int[n];\n        ans[0] = 1;', '答案数组；第 0 个的左边积是 1。'],
            ['\n        for (int i = 1; i < n; i++) {\n            ans[i] = ans[i - 1] * nums[i - 1];\n        }', '从左往右算左边积。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn product_except_self(nums: Vec<i32>) -> Vec<i32> {', '照例的架子。'],
            ['\n        let n = nums.len();\n        let mut ans = vec![1; n];', '答案数组先全填 1：ans[0] 的左边积就是 1。'],
            ['\n        for i in 1..n {\n            ans[i] = ans[i - 1] * nums[i - 1];\n        }', '从左往右算左边积。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第二遍：右边的积一路乘过来',
        say: [
          '最后一个数右边什么都没有，右边积是 1，它的答案就是左边积，不用动。从倒数第二个开始往左：右边积先乘上它右边那个数，再乘进答案。',
          { viz: { kind: 'grid', title: '右边积从右往左', frames: trace.product([-1, 1, 0, -3, 3]) } },
        ],
        ops: {
          python: code(
            ['\n        right = 1', '右边的积，最右边是 1。'],
            ['\n        for i in range(n - 2, -1, -1):', '从倒数第二个往左走到 0。最后一个的右边积是 1，答案不变，跳过它。'],
            ['\n            right *= nums[i + 1]', '第 i 个的右边积 = 第 i+1 个的右边积 × nums[i+1]。先乘上，再用。这样整个数组的积从来不用算出来，也就不会超出范围。'],
            ['\n            ans[i] *= right', 'ans[i] 里存着左边积，乘上右边积，就是答案。'],
            ['\n        return ans', '每一格都是左边积 × 右边积。']
          ),
          c: code(
            ['\n    int right = 1;\n    for (int i = numsSize - 2; i >= 0; i--) {', '右边的积从 1 开始；从倒数第二个往左走。'],
            ['\n        right *= nums[i + 1];\n        ans[i] *= right;\n    }', '先把右边积乘上右边那个数，再乘进答案。'],
            ['\n    return ans;\n}', '每一格都是左边积 × 右边积。']
          ),
          cpp: code(
            ['\n        int right = 1;\n        for (int i = n - 2; i >= 0; i--) {', '右边的积从 1 开始；从倒数第二个往左走。'],
            ['\n            right *= nums[i + 1];\n            ans[i] *= right;\n        }\n        return ans;\n    }\n};', '先把右边积乘上右边那个数，再乘进答案。']
          ),
          java: code(
            ['\n        int right = 1;\n        for (int i = n - 2; i >= 0; i--) {', '右边的积从 1 开始；从倒数第二个往左走。'],
            ['\n            right *= nums[i + 1];\n            ans[i] *= right;\n        }\n        return ans;\n    }\n}', '先把右边积乘上右边那个数，再乘进答案。']
          ),
          rust: code(
            ['\n        let mut right = 1;\n        for i in (0..n - 1).rev() {', '右边的积从 1 开始；`(0..n - 1).rev()` 是 n−2 倒数到 0。题目保证至少两个数，`n - 1` 不会出错。'],
            ['\n            right *= nums[i + 1];\n            ans[i] *= right;\n        }\n        ans\n    }\n}', '先把右边积乘上右边那个数，再乘进答案。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：[24, 12, 8, 6] 和 [0, 0, 9, 0, 0]。第二个样例有 0，正好说明为什么不能靠除法。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().productExceptSelf([1, 2, 3, 4]))\n    print(Solution().productExceptSelf([-1, 1, 0, -3, 3]))', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* nums, int n) {\n    int size;\n    int* ans = productExceptSelf(nums, n, &size);', '一个小函数：调用后按 `[24, 12, 8, 6]` 的格式打印。'],
            ['\n    printf("[");\n    for (int i = 0; i < size; i++) {\n        printf(i > 0 ? ", %d" : "%d", ans[i]);\n    }\n    printf("]\\n");\n    free(ans);\n}', '逐个打印，用完释放。'],
            ['\n\nint main(void) {\n    int a[] = {1, 2, 3, 4}, b[] = {-1, 1, 0, -3, 3};\n    show(a, 4);\n    show(b, 5);\n    return 0;\n}', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{1, 2, 3, 4}, {-1, 1, 0, -3, 3}};\n    for (auto& nums : cases) {\n        vector<int> ans = Solution().productExceptSelf(nums);\n        cout << "[";\n        for (size_t i = 0; i < ans.size(); i++) {\n            cout << (i > 0 ? ", " : "") << ans[i];\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '两个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(java.util.Arrays.toString(new Solution().productExceptSelf(new int[]{1, 2, 3, 4})));\n        System.out.println(java.util.Arrays.toString(new Solution().productExceptSelf(new int[]{-1, 1, 0, -3, 3})));\n    }\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    println!("{:?}", Solution::product_except_self(vec![1, 2, 3, 4]));\n    println!("{:?}", Solution::product_except_self(vec![-1, 1, 0, -3, 3]));\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '前缀和写完了',
        say: [
          '「除了自己以外」拆成左边和右边，两遍扫描各算一半。左边的存在答案里，右边的用一个变量滚，额外空间 O(1)。',
          '回顾这个模块：一路累加是前缀和；区间和是两个前缀相减；数「和为 k 的段」是前缀和配哈希表；「除自己以外」是前缀配后缀。共同点都是把会被反复用到的累计结果先算好。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
