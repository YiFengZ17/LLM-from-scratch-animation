/*
 * 哈希表与数组 · 448 找到所有数组中消失的数字（简单）
 * 原地标记：数都在 1..n，见过 x 就把第 x-1 格变成负数。数组自己就是一张「见过没有」的表。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.HT;

  const NUMS = [4, 3, 2, 7, 8, 2, 3, 1];

  root.Catalog.addChapter('hash-table', {
    id: 'ht-448',
    label: '448',
    title: '找到所有数组中消失的数字',
    summary: '不开额外空间：见过 x，就把第 x-1 格的数变成负数。最后还是正数的格子，对应的数就没出现过。',
    problem: { id: 448, level: 'easy', url: leetcode('find-all-numbers-disappeared-in-an-array') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个含 n 个整数的数组 `nums`，其中 `nums[i]` 在区间 `[1, n]` 内。请你找出所有在 `[1, n]` 范围内但没有出现在 `nums` 中的数字，并以数组的形式返回结果。',
          '进阶：你能在不使用额外空间且时间复杂度为 O(n) 的情况下解决这个问题吗？你可以假定返回的数组不算在额外空间内。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[4, 3, 2, 7, 8, 2, 3, 1]`', '`[5, 6]`'],
                ['`[1, 1]`', '`[2]`'],
              ],
            },
          },
          { list: ['`n == nums.length`', '`1 <= n <= 10^5`', '`1 <= nums[i] <= n`'] },
          '<a href="' + leetcode('find-all-numbers-disappeared-in-an-array') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：把数组当记号板',
        doc: [
          '先想最自然的做法：开一张「见过没有」的表，把每个数记一下，再看 1 到 n 里哪些没被记过。数都在 1 到 n 之间，这张表用一个长 n 的布尔数组就行，第 x - 1 格表示「x 见过没有」。',
          '进阶要求不开额外的数组。注意到：**原数组正好也是长 n，下标正好是 0 到 n - 1**。能不能把记号直接做在原数组上？需要一种记号，既能表示「见过」，又不弄丢那一格原来的数（它还要被读到）。',
          '办法是**变成负数**：见过 x，就把第 x - 1 格的数变成负的。原来的数都是正数，变负就是记号；要读原来的数时取绝对值，什么都没丢。',
          { viz: { kind: 'array', title: '样例 1', frames: trace.missing(NUMS) } },
          '标完以后，还是正数的格子 i，说明从来没有哪个数让它变负，也就是 i + 1 没出现过。两遍扫描，时间 O(n)；除了返回的结果，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收数组，返回消失的数。待会儿要直接改原数组。'],
        ops: {
          python: code(['class Solution:\n    def findDisappearedNumbers(self, nums: list[int]) -> list[int]:', '照例写类和方法。']),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '要用 `printf`，以及 `malloc` 和取绝对值的 `abs`，它们在 `stdlib.h` 里。'],
            ['\n\nint* findDisappearedNumbers(int* nums, int numsSize, int* returnSize) {', '力扣规定的 C 签名：返回数组指针，长度通过 `returnSize` 写回。']
          ),
          cpp: code(['#include <iostream>\n#include <vector>\n#include <cstdlib>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> findDisappearedNumbers(vector<int>& nums) {', '照例的架子。取绝对值的 `abs` 在 `cstdlib` 里。参数是引用，可以直接改调用方的数组。']),
          java: code(['import java.util.ArrayList;\nimport java.util.List;\n\nclass Solution {\n    public List<Integer> findDisappearedNumbers(int[] nums) {', '照例的架子，返回 `List<Integer>`。']),
          rust: code(['struct Solution;\n\nimpl Solution {\n    pub fn find_disappeared_numbers(mut nums: Vec<i32>) -> Vec<i32> {', '要改 nums，就在参数名前加 `mut`。函数拿到的是这个 Vec 的所有权，改它不影响调用方，签名对外也还是 `Vec<i32>`。']),
        },
      },
      {
        section: '写代码',
        title: '第一遍：见过 x，就把第 x-1 格变负',
        say: [
          '逐个读数。读到的数可能已经被别人标成了负数，所以先取绝对值才是它原来的值 x。然后把第 x - 1 格变成负数；已经是负的就不要再变，否则负负得正，记号就没了。',
          { viz: { kind: 'array', title: '做记号', frames: trace.missing(NUMS) } },
        ],
        ops: {
          python: code(
            ['\n        for x in nums:', '逐个读数。'],
            ['\n            i = abs(x) - 1', 'x 可能已经被标成负数，取绝对值才是原来的数；它对应的格子是第 abs(x) - 1 格。'],
            ['\n            nums[i] = -abs(nums[i])', '把那一格变成负数：先取绝对值再加负号，不管它原来是正是负，结果都是负的，不会被「负负得正」弄丢。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {', '逐个读数。'],
            ['\n        int j = abs(nums[i]) - 1;', '取绝对值才是原来的数，它对应第 j 格。'],
            ['\n        if (nums[j] > 0) {\n            nums[j] = -nums[j];\n        }\n    }', '还是正数才变负；已经是负的说明之前就见过了，别再动。']
          ),
          cpp: code(
            ['\n        for (int x : nums) {', '逐个读数。这里 x 是复制出来的值，下面改的是 nums 里别的格子，不冲突。'],
            ['\n            int j = abs(x) - 1;', '取绝对值才是原来的数，它对应第 j 格。'],
            ['\n            if (nums[j] > 0) {\n                nums[j] = -nums[j];\n            }\n        }', '还是正数才变负。']
          ),
          java: code(
            ['\n        for (int i = 0; i < nums.length; i++) {', '逐个读数。'],
            ['\n            int j = Math.abs(nums[i]) - 1;', '取绝对值才是原来的数，它对应第 j 格。'],
            ['\n            if (nums[j] > 0) {\n                nums[j] = -nums[j];\n            }\n        }', '还是正数才变负。']
          ),
          rust: code(
            ['\n        for i in 0..nums.len() {', '逐个读数。要一边读一边改同一个 Vec，用下标循环，不用 `for x in &nums`——借用规则不允许一边借着读、一边改。'],
            ['\n            let j = (nums[i].abs() - 1) as usize;', '取绝对值才是原来的数，它对应第 j 格，转成 usize 当下标。'],
            ['\n            if nums[j] > 0 {\n                nums[j] = -nums[j];\n            }\n        }', '还是正数才变负。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第二遍：还是正数的格子',
        say: ['再扫一遍：第 i 格还是正数，说明没有哪个数让它变负，也就是 i + 1 没出现过，放进结果。'],
        ops: {
          python: code(['\n        return [i + 1 for i in range(len(nums)) if nums[i] > 0]', '列表推导式可以带条件：只留下 `nums[i] > 0` 的那些 i，把 i + 1 收集起来。']),
          c: code(
            ['\n    int* res = malloc(numsSize * sizeof(int));\n    int k = 0;', '结果最多 n 个，先按 n 申请。k 记已经放了几个。'],
            ['\n    for (int i = 0; i < numsSize; i++) {\n        if (nums[i] > 0) {\n            res[k++] = i + 1;\n        }\n    }', '还是正数的格子，对应的 i + 1 放进结果。`res[k++]` 先用 k 当下标，再把 k 加一。'],
            ['\n    *returnSize = k;\n    return res;\n}', '告诉调用方实际有几个。']
          ),
          cpp: code(['\n        vector<int> res;\n        for (int i = 0; i < (int)nums.size(); i++) {\n            if (nums[i] > 0) {\n                res.push_back(i + 1);\n            }\n        }\n        return res;\n    }\n};', '还是正数的格子，对应的 i + 1 放进结果。']),
          java: code(['\n        List<Integer> res = new ArrayList<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] > 0) {\n                res.add(i + 1);\n            }\n        }\n        return res;\n    }\n}', '还是正数的格子，对应的 i + 1 放进结果。']),
          rust: code(['\n        (0..nums.len()).filter(|&i| nums[i] > 0).map(|i| i as i32 + 1).collect()\n    }\n}', '`filter` 留下还是正数的下标，`map` 把下标换成 i + 1，`collect` 收集成 Vec。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：[5, 6] 和 [2]。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().findDisappearedNumbers([4, 3, 2, 7, 8, 2, 3, 1]))\n    print(Solution().findDisappearedNumbers([1, 1]))', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['[5, 6]', '[2]'] }]),
          c: code(
            ['\n\nvoid show(int* nums, int n) {\n    int size;\n    int* res = findDisappearedNumbers(nums, n, &size);', '写一个小函数：调用题目的函数，再按 `[5, 6]` 的格式打印。'],
            ['\n    printf("[");\n    for (int i = 0; i < size; i++) {\n        printf(i > 0 ? ", %d" : "%d", res[i]);\n    }\n    printf("]\\n");\n    free(res);\n}', '第一个数前面不加逗号；用完释放。'],
            ['\n\nint main(void) {\n    int a[] = {4, 3, 2, 7, 8, 2, 3, 1}, b[] = {1, 1};\n    show(a, 8);\n    show(b, 2);\n    return 0;\n}', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['[5, 6]', '[2]'] }]),
          cpp: code(
            ['\n\nint main() {\n    vector<vector<int>> cases = {{4, 3, 2, 7, 8, 2, 3, 1}, {1, 1}};', '两组输入。'],
            ['\n    for (auto& nums : cases) {\n        vector<int> res = Solution().findDisappearedNumbers(nums);\n        cout << "[";\n        for (size_t i = 0; i < res.size(); i++) {\n            cout << (i > 0 ? ", " : "") << res[i];\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '逐组跑，按 `[5, 6]` 的格式打印。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['[5, 6]', '[2]'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().findDisappearedNumbers(new int[]{4, 3, 2, 7, 8, 2, 3, 1}));\n        System.out.println(new Solution().findDisappearedNumbers(new int[]{1, 1}));\n    }\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['[5, 6]', '[2]'] }]),
          rust: code(['\n\nfn main() {\n    println!("{:?}", Solution::find_disappeared_numbers(vec![4, 3, 2, 7, 8, 2, 3, 1]));\n    println!("{:?}", Solution::find_disappeared_numbers(vec![1, 1]));\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['[5, 6]', '[2]'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '值的范围正好是 1 到 n，就能把数组下标当成哈希表的桶：用正负号当「见过没有」的记号，原来的数取绝对值就能复原。时间 O(n)，额外空间 O(1)。',
          '下一题「数组序号转换」：先排序，再用哈希表记下每个数的序号。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
