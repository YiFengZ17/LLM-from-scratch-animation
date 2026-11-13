/*
 * 双指针 · 相向指针 · LCR 006 两数之和 II - 输入有序数组（简单）
 * 有序数组：和大了，右端的数和谁配都大，排除它；和小了，左端的数和谁配都小，排除它。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.TP;

  const OUT = ['[1, 3]', '[0, 2]', '[0, 1]'];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-lcr006',
    group: '相向指针',
    label: 'LCR006',
    title: '两数之和 II - 输入有序数组',
    summary: '数组有序时不用哈希表：和大了就排除右端的数，和小了就排除左端的数，每步排除一个。',
    problem: { id: 'LCR 006', level: 'easy', url: leetcode('kLl5u1') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个已按照**升序排列**的整数数组 `numbers`，请你从数组中找出两个数满足相加之和等于目标数 `target`。函数应该以长度为 2 的整数数组的形式返回这两个数的下标值。`numbers` 的下标**从 0 开始计数**。假设数组中存在且只存在一对符合条件的数字，同时一个数字不能使用两次。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`numbers = [1, 2, 4, 6, 10]`, `target = 8`', '`[1, 3]`', '2 + 6 = 8'],
                ['`numbers = [2, 3, 4]`, `target = 6`', '`[0, 2]`', ''],
                ['`numbers = [-1, 0]`, `target = -1`', '`[0, 1]`', ''],
              ],
            },
          },
          { list: ['`2 <= numbers.length <= 3 * 10^4`', '`-1000 <= numbers[i] <= 1000`', '`numbers` 按递增顺序排列', '`-1000 <= target <= 1000`', '仅存在一个有效答案'] },
          '<a href="' + leetcode('kLl5u1') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：每一步排除一个数',
        doc: [
          '哈希表模块的「两数之和」可以直接用，O(n) 时间、O(n) 空间。但这次数组**有序**，可以连哈希表都不用。',
          'left 指最小的数，right 指最大的数，看它们的和 sum：',
          {
            list: [
              '`sum == target`：找到了。',
              '`sum > target`：`numbers[right]` 和最小的数配都嫌大，和 left 右边任何一个数配只会更大。它不可能在答案里，**排除**，right 左移。',
              '`sum < target`：`numbers[left]` 和最大的数配都嫌小，和谁配都小，**排除**，left 右移。',
            ],
          },
          { viz: { kind: 'array', title: '样例 1：target = 8', frames: trace.sortedTwo([1, 2, 4, 6, 10], 8) } },
          '每一步排除一个数，最多 n 步，时间 O(n)，额外空间 O(1)。「有序」是这个排除能成立的前提：没排序的数组，右端的数不一定最大，就不能这样排除。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，两个指针放到两端',
        say: ['函数收有序数组和目标值，返回两个下标。left 放在最小的数上，right 放在最大的数上。'],
        ops: {
          python: code(
            ['class Solution:\n    def twoSum(self, numbers: list[int], target: int) -> list[int]:', '照例写类和方法。'],
            ['\n        left, right = 0, len(numbers) - 1', 'left 指最小的数，right 指最大的数。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '要用 `printf` 和 `malloc`。'],
            ['\n\nint* twoSum(int* numbers, int numbersSize, int target, int* returnSize) {', '力扣的 C 签名：返回数组指针，长度通过 `returnSize` 写回。'],
            ['\n    int* ans = malloc(2 * sizeof(int));\n    *returnSize = 2;', '先准备装答案的两个格子。'],
            ['\n    int left = 0, right = numbersSize - 1;', 'left 指最小的数，right 指最大的数。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {', '照例的架子。'],
            ['\n        int left = 0, right = (int)numbers.size() - 1;', 'left 指最小的数，right 指最大的数。']
          ),
          java: code(
            ['class Solution {\n    public int[] twoSum(int[] numbers, int target) {', '照例的架子。'],
            ['\n        int left = 0, right = numbers.length - 1;', 'left 指最小的数，right 指最大的数。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn two_sum(numbers: Vec<i32>, target: i32) -> Vec<i32> {', '照例的架子。'],
            ['\n        let (mut left, mut right) = (0, numbers.len() - 1);', 'left 指最小的数，right 指最大的数。题目保证至少两个数。']
          ),
        },
      },
      {
        section: '写代码',
        title: '和大了排除右边，小了排除左边',
        say: [
          '每一轮看两端的和：正好就返回；大了，右端的数和谁配都大，排除它；小了，左端的数和谁配都小，排除它。',
          { viz: { kind: 'array', title: '每步排除一个', frames: trace.sortedTwo([1, 2, 4, 6, 10], 8) } },
        ],
        ops: {
          python: code(
            ['\n        while left < right:', '题目保证有答案，两个指针相遇之前一定会找到。'],
            ['\n            s = numbers[left] + numbers[right]', '两端的和。'],
            ['\n            if s == target:\n                return [left, right]', '正好：返回两个下标。'],
            ['\n            elif s > target:\n                right -= 1', '大了：右端的数和最小的数配都嫌大，排除它。'],
            ['\n            else:\n                left += 1', '小了：左端的数和最大的数配都嫌小，排除它。'],
            ['\n        return []', '走不到这里，写上让每条路都有返回值。']
          ),
          c: code(
            ['\n    while (left < right) {\n        int s = numbers[left] + numbers[right];', '两端的和。数都在 ±1000 以内，不会溢出。'],
            ['\n        if (s == target) {\n            ans[0] = left;\n            ans[1] = right;\n            return ans;', '正好：填上两个下标返回。'],
            ['\n        } else if (s > target) {\n            right--;', '大了：排除右端的数。'],
            ['\n        } else {\n            left++;\n        }\n    }', '小了：排除左端的数。'],
            ['\n    *returnSize = 0;\n    return ans;\n}', '走不到这里。']
          ),
          cpp: code(
            ['\n        while (left < right) {\n            int s = numbers[left] + numbers[right];', '两端的和。'],
            ['\n            if (s == target) {\n                return {left, right};\n            } else if (s > target) {\n                right--;\n            } else {\n                left++;\n            }\n        }', '正好就返回；大了排除右端；小了排除左端。'],
            ['\n        return {};\n    }\n};', '走不到这里。']
          ),
          java: code(
            ['\n        while (left < right) {\n            int s = numbers[left] + numbers[right];', '两端的和。'],
            ['\n            if (s == target) {\n                return new int[]{left, right};\n            } else if (s > target) {\n                right--;\n            } else {\n                left++;\n            }\n        }', '正好就返回；大了排除右端；小了排除左端。'],
            ['\n        return new int[0];\n    }\n}', '走不到这里。']
          ),
          rust: code(
            ['\n        while left < right {\n            let s = numbers[left] + numbers[right];', '两端的和。'],
            ['\n            if s == target {\n                return vec![left as i32, right as i32];\n            } else if s > target {\n                right -= 1;\n            } else {\n                left += 1;\n            }\n        }', '正好就返回（下标转成 i32）；大了排除右端；小了排除左端。'],
            ['\n        vec![]\n    }\n}', '走不到这里。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：[1, 3]、[0, 2]、[0, 1]。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().twoSum([1, 2, 4, 6, 10], 8))\n    print(Solution().twoSum([2, 3, 4], 6))\n    print(Solution().twoSum([-1, 0], -1))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* nums, int n, int target) {\n    int size;\n    int* ans = twoSum(nums, n, target, &size);\n    printf("[%d, %d]\\n", ans[0], ans[1]);\n    free(ans);\n}', '一个小函数：调用后按 `[1, 3]` 的格式打印，用完释放。'],
            ['\n\nint main(void) {\n    int a[] = {1, 2, 4, 6, 10}, b[] = {2, 3, 4}, c[] = {-1, 0};\n    show(a, 5, 8);\n    show(b, 3, 6);\n    show(c, 2, -1);\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{1, 2, 4, 6, 10}, {2, 3, 4}, {-1, 0}};\n    int targets[] = {8, 6, -1};\n    for (int k = 0; k < 3; k++) {\n        vector<int> ans = Solution().twoSum(cases[k], targets[k]);\n        cout << "[" << ans[0] << ", " << ans[1] << "]" << endl;\n    }\n    return 0;\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();\n        System.out.println(java.util.Arrays.toString(s.twoSum(new int[]{1, 2, 4, 6, 10}, 8)));\n        System.out.println(java.util.Arrays.toString(s.twoSum(new int[]{2, 3, 4}, 6)));\n        System.out.println(java.util.Arrays.toString(s.twoSum(new int[]{-1, 0}, -1)));\n    }\n}', '三个样例，`Arrays.toString` 把数组变成 `[1, 3]` 的样子。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    println!("{:?}", Solution::two_sum(vec![1, 2, 4, 6, 10], 8));\n    println!("{:?}", Solution::two_sum(vec![2, 3, 4], 6));\n    println!("{:?}", Solution::two_sum(vec![-1, 0], -1));\n}', '三个样例。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '有序数组上的相向指针：每一步根据和的大小排除一个数。时间 O(n)，额外空间 O(1)，比哈希表更省。',
          '下一题「盛最多水的容器」没有排序，但仍然能找到一个「可以放心排除」的理由：矮的那一边。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
