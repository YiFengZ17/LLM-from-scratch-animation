/*
 * 双指针 · 相向指针 · 15 三数之和（中等）
 * 排序；固定第一个数 nums[i]，后面就是「有序数组里找两数之和 = -nums[i]」。难点是去重。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { cdoc } = root.LessonKit;
  const { trace } = root.TP;

  const OUT = ['[[-1, -1, 2], [-1, 0, 1]]', '[]', '[[0, 0, 0]]'];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-15',
    group: '相向指针',
    label: '15',
    title: '三数之和',
    summary: '排序后固定第一个数，剩下两个数就是有序数组上的两数之和。相同的数只当一次「第一个数」，找到后跳过相同的数，就不会重复。',
    problem: { id: 15, level: 'medium', url: leetcode('3sum') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]` 满足 `i != j`、`i != k` 且 `j != k`，同时还满足 `nums[i] + nums[j] + nums[k] == 0`。请你返回所有和为 0 且**不重复**的三元组。答案中不可以包含重复的三元组。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[-1, 0, 1, 2, -1, -4]`', '`[[-1, -1, 2], [-1, 0, 1]]`'],
                ['`[0, 1, 1]`', '`[]`'],
                ['`[0, 0, 0]`', '`[[0, 0, 0]]`'],
              ],
            },
          },
          { list: ['`3 <= nums.length <= 3000`', '`-10^5 <= nums[i] <= 10^5`'] },
          '<a href="' + leetcode('3sum') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：固定一个，剩下两个用相向指针',
        doc: [
          '三层循环是 O(n³)，n = 3000 时约 45 亿次，太慢。',
          '先**排序**。然后枚举三元组里最小的那个数 `nums[i]`，剩下两个数要在 i 右边找，和为 `-nums[i]`——这就是上一节的「有序数组两数之和」，用相向指针 O(n) 就能找完。总共 O(n²)。',
          '这题的难点是**不能有重复的三元组**。排好序以后，重复只可能来自相同的数被当成同一个位置用了两次：',
          {
            list: [
              '**第一个数**：`nums[i]` 和上一个 `nums[i-1]` 相同，它能找到的三元组上一轮已经都找过了，跳过。',
              '**后两个数**：找到一组以后，left 右移、right 左移，再跳过和刚才相同的数，免得同一组再记一次。',
            ],
          },
          { viz: { kind: 'array', title: '样例 1（排序后）', frames: trace.threeSum([-1, 0, 1, 2, -1, -4]) } },
          '排序 O(n log n)，枚举加双指针 O(n²)，总时间 O(n²)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，先排序',
        say: ['函数收数组，返回所有三元组。第一步排序：有序才能用相向指针，相同的数也会挨在一起，方便跳过。'],
        ops: {
          python: code(
            ['class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:', '照例写类和方法。'],
            ['\n        nums.sort()', '原地排序。'],
            ['\n        n = len(nums)\n        res = []', 'res 收集找到的三元组。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '要用 `qsort`、`malloc`、`realloc`。'],
            ['\n\nstatic int cmp(const void* a, const void* b) {\n    int x = *(const int*)a, y = *(const int*)b;\n    return (x > y) - (x < y);\n}', '给 qsort 的比较函数：小的排前面。'],
            ['\n\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {', '力扣的 C 签名：返回「三元组的数组」，个数和每组长度（都是 3）通过两个指针写回。'],
            ['\n    qsort(nums, numsSize, sizeof(int), cmp);', '原地排序。'],
            ['\n    int cap = 16, count = 0;\n    int** res = malloc(cap * sizeof(int*));', '事先不知道会找到几组，先申请 16 个位置；cap 是容量，count 是已经放了几组。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {', '照例的架子。'],
            ['\n        sort(nums.begin(), nums.end());\n        int n = nums.size();\n        vector<vector<int>> res;', '排序；res 收集三元组。']
          ),
          java: code(
            ['import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.List;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {', '照例的架子。'],
            ['\n        Arrays.sort(nums);\n        int n = nums.length;\n        List<List<Integer>> res = new ArrayList<>();', '排序；res 收集三元组。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn three_sum(mut nums: Vec<i32>) -> Vec<Vec<i32>> {', '要排序，参数前加 `mut`。'],
            ['\n        nums.sort();\n        let n = nums.len();\n        let mut res = Vec::new();', '排序；res 收集三元组。']
          ),
        },
        sayBy: {
          c: [cdoc('realloc(void *ptr, size_t newsize)', 'Changing-Block-Size.html', 'The realloc function changes the size of the block whose address is ptr to be newsize.', 'realloc 把地址为 ptr 的内存块的大小改成 newsize。')],
        },
      },
      {
        section: '写代码',
        title: '固定第一个数，跳过重复的',
        say: ['i 从左往右当三元组的第一个数。后面至少要留两个位置给 left 和 right，所以 i 最多到 n - 3。和上一个 i 相同的数，能找到的组上一轮都找过了，直接跳过。'],
        ops: {
          python: code(
            ['\n        for i in range(n - 2):', 'i 从 0 到 n - 3，后面留两个位置。'],
            ['\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue', '和上一个 i 一样的数，跳过。`continue` 直接进入下一轮。'],
            ['\n            left, right = i + 1, n - 1', '剩下两个数在 i 右边找：left 从 i 的下一个开始，right 从最后一个开始。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize - 2; i++) {', 'i 从 0 到 n - 3。'],
            ['\n        if (i > 0 && nums[i] == nums[i - 1]) {\n            continue;\n        }', '和上一个 i 一样的数，跳过。'],
            ['\n        int left = i + 1, right = numsSize - 1;', '剩下两个数在 i 右边找。']
          ),
          cpp: code(
            ['\n        for (int i = 0; i < n - 2; i++) {', 'i 从 0 到 n - 3。'],
            ['\n            if (i > 0 && nums[i] == nums[i - 1]) {\n                continue;\n            }', '和上一个 i 一样的数，跳过。'],
            ['\n            int left = i + 1, right = n - 1;', '剩下两个数在 i 右边找。']
          ),
          java: code(
            ['\n        for (int i = 0; i < n - 2; i++) {', 'i 从 0 到 n - 3。'],
            ['\n            if (i > 0 && nums[i] == nums[i - 1]) {\n                continue;\n            }', '和上一个 i 一样的数，跳过。'],
            ['\n            int left = i + 1, right = n - 1;', '剩下两个数在 i 右边找。']
          ),
          rust: code(
            ['\n        for i in 0..n - 2 {', 'i 从 0 到 n - 3。题目保证至少 3 个数，`n - 2` 不会减出负数。'],
            ['\n            if i > 0 && nums[i] == nums[i - 1] {\n                continue;\n            }', '和上一个 i 一样的数，跳过。'],
            ['\n            let (mut left, mut right) = (i + 1, n - 1);', '剩下两个数在 i 右边找。']
          ),
        },
      },
      {
        section: '写代码',
        title: '剩下两个数：有序两数之和',
        say: [
          '这一段就是上一节的有序两数之和，目标是三数之和为 0。和大了 right 左移，小了 left 右移。正好为 0 时记下，然后两边各走一步，并跳过和刚才相同的数。',
          { viz: { kind: 'array', title: '固定 i，相向找另外两个', frames: trace.threeSum([-1, 0, 1, 2, -1, -4]) } },
        ],
        ops: {
          python: code(
            ['\n            while left < right:\n                s = nums[i] + nums[left] + nums[right]', '三个数的和。'],
            ['\n                if s == 0:\n                    res.append([nums[i], nums[left], nums[right]])', '正好为 0：记下这一组。'],
            ['\n                    left += 1\n                    right -= 1', '两边各走一步，找下一组。'],
            ['\n                    while left < right and nums[left] == nums[left - 1]:\n                        left += 1', 'left 新指的数和刚用过的一样，就会组成同样的三元组，跳过。'],
            ['\n                    while left < right and nums[right] == nums[right + 1]:\n                        right -= 1', 'right 那边同理。'],
            ['\n                elif s > 0:\n                    right -= 1\n                else:\n                    left += 1', '大了，排除右端；小了，排除左端。'],
            ['\n        return res', '所有不重复的三元组。']
          ),
          c: code(
            ['\n        while (left < right) {\n            int s = nums[i] + nums[left] + nums[right];', '三个数的和，最大 3×10<sup>5</sup>，不会溢出。'],
            ['\n            if (s == 0) {\n                if (count == cap) {\n                    cap *= 2;\n                    res = realloc(res, cap * sizeof(int*));\n                }', '要记下一组了。位置用完的话，用 `realloc` 把容量翻倍：它会在需要时把旧内容搬到新地方。'],
            ['\n                res[count] = malloc(3 * sizeof(int));\n                res[count][0] = nums[i];\n                res[count][1] = nums[left];\n                res[count][2] = nums[right];\n                count++;', '给这一组申请 3 个 int，填进去。'],
            ['\n                left++;\n                right--;\n                while (left < right && nums[left] == nums[left - 1]) {\n                    left++;\n                }\n                while (left < right && nums[right] == nums[right + 1]) {\n                    right--;\n                }', '两边各走一步，再跳过和刚才相同的数。'],
            ['\n            } else if (s > 0) {\n                right--;\n            } else {\n                left++;\n            }\n        }\n    }', '大了排除右端，小了排除左端。'],
            ['\n    *returnSize = count;\n    *returnColumnSizes = malloc(count * sizeof(int));\n    for (int k = 0; k < count; k++) {\n        (*returnColumnSizes)[k] = 3;\n    }\n    return res;\n}', '写回组数，再给每组登记长度 3。']
          ),
          cpp: code(
            ['\n            while (left < right) {\n                int s = nums[i] + nums[left] + nums[right];', '三个数的和。'],
            ['\n                if (s == 0) {\n                    res.push_back({nums[i], nums[left], nums[right]});', '正好为 0：记下这一组，花括号当场组成一个 vector。'],
            ['\n                    left++;\n                    right--;\n                    while (left < right && nums[left] == nums[left - 1]) {\n                        left++;\n                    }\n                    while (left < right && nums[right] == nums[right + 1]) {\n                        right--;\n                    }', '两边各走一步，再跳过和刚才相同的数。'],
            ['\n                } else if (s > 0) {\n                    right--;\n                } else {\n                    left++;\n                }\n            }\n        }\n        return res;\n    }\n};', '大了排除右端，小了排除左端。']
          ),
          java: code(
            ['\n            while (left < right) {\n                int s = nums[i] + nums[left] + nums[right];', '三个数的和。'],
            ['\n                if (s == 0) {\n                    res.add(List.of(nums[i], nums[left], nums[right]));', '正好为 0：`List.of` 当场造一个三元组，记下。'],
            ['\n                    left++;\n                    right--;\n                    while (left < right && nums[left] == nums[left - 1]) {\n                        left++;\n                    }\n                    while (left < right && nums[right] == nums[right + 1]) {\n                        right--;\n                    }', '两边各走一步，再跳过和刚才相同的数。'],
            ['\n                } else if (s > 0) {\n                    right--;\n                } else {\n                    left++;\n                }\n            }\n        }\n        return res;\n    }\n}', '大了排除右端，小了排除左端。']
          ),
          rust: code(
            ['\n            while left < right {\n                let s = nums[i] + nums[left] + nums[right];', '三个数的和。'],
            ['\n                if s == 0 {\n                    res.push(vec![nums[i], nums[left], nums[right]]);', '正好为 0：记下这一组。'],
            ['\n                    left += 1;\n                    right -= 1;\n                    while left < right && nums[left] == nums[left - 1] {\n                        left += 1;\n                    }\n                    while left < right && nums[right] == nums[right + 1] {\n                        right -= 1;\n                    }', '两边各走一步，再跳过和刚才相同的数。'],
            ['\n                } else if s > 0 {\n                    right -= 1;\n                } else {\n                    left += 1;\n                }\n            }\n        }\n        res\n    }\n}', '大了排除右端，小了排除左端。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：[[-1, -1, 2], [-1, 0, 1]]、[]、[[0, 0, 0]]。第三个样例全是 0，检验去重：只能有一组。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[-1, 0, 1, 2, -1, -4], [0, 1, 1], [0, 0, 0]]:\n        print(Solution().threeSum(nums))', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* nums, int n) {\n    int count, *cols;\n    int** res = threeSum(nums, n, &count, &cols);', '一个小函数：调用后按 `[[-1, -1, 2], …]` 的格式打印。'],
            ['\n    printf("[");\n    for (int k = 0; k < count; k++) {\n        printf("%s[%d, %d, %d]", k > 0 ? ", " : "", res[k][0], res[k][1], res[k][2]);\n        free(res[k]);\n    }\n    printf("]\\n");', '逐组打印，组和组之间加逗号；每组打印完就释放。'],
            ['\n    free(res);\n    free(cols);\n}', '最后释放外层数组和长度数组。'],
            ['\n\nint main(void) {\n    int a[] = {-1, 0, 1, 2, -1, -4}, b[] = {0, 1, 1}, c[] = {0, 0, 0};\n    show(a, 6);\n    show(b, 3);\n    show(c, 3);\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(
            ['\n\nint main() {\n    vector<vector<int>> cases = {{-1, 0, 1, 2, -1, -4}, {0, 1, 1}, {0, 0, 0}};', '三组输入。'],
            ['\n    for (auto& nums : cases) {\n        vector<vector<int>> res = Solution().threeSum(nums);\n        cout << "[";\n        for (size_t k = 0; k < res.size(); k++) {\n            cout << (k > 0 ? ", " : "") << "[" << res[k][0] << ", " << res[k][1] << ", " << res[k][2] << "]";\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '逐组打印成 `[[-1, -1, 2], …]` 的样子。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{-1, 0, 1, 2, -1, -4}, {0, 1, 1}, {0, 0, 0}};\n        for (int[] nums : cases) {\n            System.out.println(new Solution().threeSum(nums));\n        }\n    }\n}', '三个样例挨个跑，List 直接打印就是 `[[-1, -1, 2], …]` 的样子。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    for nums in [vec![-1, 0, 1, 2, -1, -4], vec![0, 1, 1], vec![0, 0, 0]] {\n        println!("{:?}", Solution::three_sum(nums));\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '多一个数，就多一层枚举：固定第一个，剩下的交给相向指针。去重靠排序：相同的数挨在一起，跳过即可。时间 O(n²)。',
          '下一题「接雨水」是这个子模块的困难题：每一格能存多少水，取决于它左右两边最高的柱子，而相向指针能在一遍里把它们都算出来。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
