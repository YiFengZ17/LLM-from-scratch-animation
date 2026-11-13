/*
 * 双指针 · 同向指针 · 75 颜色分类（中等）
 * 荷兰国旗：low 左边全是 0，high 右边全是 2，mid 去看还没分类的数。一遍扫完。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.TP;

  const OUT = ['[0, 0, 1, 1, 2, 2]', '[0, 1, 2]'];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-75',
    group: '同向指针',
    label: '75',
    title: '颜色分类',
    summary: '三个指针把数组分成四段：0、1、还没看、2。mid 看到 0 就换到左边，看到 2 就换到右边，一遍扫完。',
    problem: { id: 75, level: 'medium', url: leetcode('sort-colors') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个包含红色、白色和蓝色、共 n 个元素的数组 `nums`，**原地**对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。我们使用整数 0、1 和 2 分别表示红色、白色和蓝色。必须在不使用库内置的 sort 函数的情况下解决这个问题。',
          '进阶：你能想出一个仅使用常数空间的一趟扫描算法吗？',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[2, 0, 2, 1, 1, 0]`', '`[0, 0, 1, 1, 2, 2]`'],
                ['`[2, 0, 1]`', '`[0, 1, 2]`'],
              ],
            },
          },
          { list: ['`n == nums.length`', '`1 <= n <= 300`', '`nums[i]` 为 0、1 或 2'] },
          '<a href="' + leetcode('sort-colors') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：三个指针，四段区域',
        doc: [
          '先数一数 0、1、2 各有几个，再按个数重写数组，要扫两遍。进阶要求一遍：边看边放。',
          '用三个指针把数组分成四段，并一直保持这个约定：',
          {
            table: {
              head: ['区间', '里面是什么'],
              rows: [
                ['`[0, low)`', '全是 0'],
                ['`[low, mid)`', '全是 1'],
                ['`[mid, high]`', '还没看过'],
                ['`(high, n)`', '全是 2'],
              ],
            },
          },
          'mid 每次看一个还没看过的数：',
          {
            list: [
              '**0**：和 low 交换，放进 0 区。换过来的一定是 1（来自 1 区），所以 low、mid 都前进。',
              '**1**：本来就该在中间，mid 前进。',
              '**2**：和 high 交换，放进 2 区，high 后退。换过来的数**还没看过**，所以 mid 不动，下一轮再看它。',
            ],
          },
          { viz: { kind: 'array', title: '样例 1', frames: trace.colors([2, 0, 2, 1, 1, 0]) } },
          'mid 越过 high，「还没看过」的区间就空了，分类完成。每一步要么 mid 前进、要么 high 后退，一共 n 步，时间 O(n)，额外空间 O(1)。这个方法叫「荷兰国旗问题」，因为荷兰国旗正好是三色横条。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：三个指针',
        say: ['函数直接改数组。一开始全都还没看过：low 和 mid 在最左边，high 在最右边。'],
        ops: {
          python: code(
            ['class Solution:\n    def sortColors(self, nums: list[int]) -> None:', '照例写类和方法，原地修改，不返回值。'],
            ['\n        low, mid, high = 0, 0, len(nums) - 1', '0 区和 1 区一开始都是空的，所以 low、mid 都在 0；high 在最后一个，2 区也是空的。']
          ),
          c: code(
            ['#include <stdio.h>\n\nvoid sortColors(int* nums, int numsSize) {', '题目给的函数。'],
            ['\n    int low = 0, mid = 0, high = numsSize - 1;', '0 区、1 区、2 区一开始都是空的。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <utility>\nusing namespace std;\n\nclass Solution {\npublic:\n    void sortColors(vector<int>& nums) {', '照例的架子。'],
            ['\n        int low = 0, mid = 0, high = (int)nums.size() - 1;', '0 区、1 区、2 区一开始都是空的。']
          ),
          java: code(
            ['class Solution {\n    public void sortColors(int[] nums) {', '照例的架子。'],
            ['\n        int low = 0, mid = 0, high = nums.length - 1;', '0 区、1 区、2 区一开始都是空的。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn sort_colors(nums: &mut Vec<i32>) {', '借来可修改的数组。'],
            ['\n        let (mut low, mut mid, mut high) = (0usize, 0usize, nums.len() as isize - 1);', 'high 会减到 -1（比如数组是 [2]），usize 装不下负数，所以 high 用有符号的 isize，用作下标时再转。']
          ),
        },
      },
      {
        section: '写代码',
        title: 'mid 看一个数，放到它该去的区',
        say: [
          '只要还有没看过的数（mid 不超过 high），就看 mid 指的数：0 换到左边，两个指针都前进；1 留下，mid 前进；2 换到右边，high 后退，mid 留在原地再看换过来的数。',
          { viz: { kind: 'array', title: '三个指针', frames: trace.colors([2, 0, 2, 1, 1, 0]) } },
        ],
        ops: {
          python: code(
            ['\n        while mid <= high:', '`[mid, high]` 不是空的，就还有没看过的数。'],
            ['\n            if nums[mid] == 0:\n                nums[low], nums[mid] = nums[mid], nums[low]\n                low += 1\n                mid += 1', '0：和 low 交换放进 0 区。换过来的是 1，已经看过，两个指针都前进。'],
            ['\n            elif nums[mid] == 1:\n                mid += 1', '1：本来就该在中间。'],
            ['\n            else:\n                nums[mid], nums[high] = nums[high], nums[mid]\n                high -= 1', '2：和 high 交换放进 2 区，high 后退。换过来的数还没看过，mid 不动。']
          ),
          c: code(
            ['\n    while (mid <= high) {', '还有没看过的数。'],
            ['\n        if (nums[mid] == 0) {\n            nums[mid] = nums[low];\n            nums[low] = 0;\n            low++;\n            mid++;', '0：交换到 low。知道 mid 这里是 0，交换可以写成两次赋值：把 low 的数搬过来，再把 low 写成 0。'],
            ['\n        } else if (nums[mid] == 1) {\n            mid++;', '1：留在中间。'],
            ['\n        } else {\n            nums[mid] = nums[high];\n            nums[high] = 2;\n            high--;\n        }\n    }\n}', '2：同样两次赋值完成交换，high 后退，mid 不动。']
          ),
          cpp: code(
            ['\n        while (mid <= high) {', '还有没看过的数。'],
            ['\n            if (nums[mid] == 0) {\n                swap(nums[low++], nums[mid++]);', '0：交换到 low。`low++` 先用旧值做下标、再加一，一行完成交换和前进。'],
            ['\n            } else if (nums[mid] == 1) {\n                mid++;', '1：留在中间。'],
            ['\n            } else {\n                swap(nums[mid], nums[high--]);\n            }\n        }\n    }\n};', '2：交换到 high，high 后退，mid 不动。']
          ),
          java: code(
            ['\n        while (mid <= high) {', '还有没看过的数。'],
            ['\n            if (nums[mid] == 0) {\n                nums[mid] = nums[low];\n                nums[low] = 0;\n                low++;\n                mid++;', '0：把 low 的数搬过来，low 写成 0，两个指针前进。'],
            ['\n            } else if (nums[mid] == 1) {\n                mid++;', '1：留在中间。'],
            ['\n            } else {\n                nums[mid] = nums[high];\n                nums[high] = 2;\n                high--;\n            }\n        }\n    }\n}', '2：把 high 的数搬过来，high 写成 2，high 后退，mid 不动。']
          ),
          rust: code(
            ['\n        while (mid as isize) <= high {', '还有没看过的数。比较时把 mid 也转成 isize；`as` 后面紧跟 `<` 会被当成泛型的尖括号，所以要加括号。'],
            ['\n            if nums[mid] == 0 {\n                nums.swap(low, mid);\n                low += 1;\n                mid += 1;', '0：交换到 low，两个指针前进。'],
            ['\n            } else if nums[mid] == 1 {\n                mid += 1;', '1：留在中间。'],
            ['\n            } else {\n                nums.swap(mid, high as usize);\n                high -= 1;\n            }\n        }\n    }\n}', '2：交换到 high，high 后退，mid 不动。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['调用完打印改好的数组。预期：[0, 0, 1, 1, 2, 2] 和 [0, 1, 2]。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[2, 0, 2, 1, 1, 0], [2, 0, 1]]:\n        Solution().sortColors(nums)\n        print(nums)', '调用完直接打印。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* nums, int n) {\n    sortColors(nums, n);\n    printf("[");\n    for (int i = 0; i < n; i++) {\n        printf(i > 0 ? ", %d" : "%d", nums[i]);\n    }\n    printf("]\\n");\n}', '一个小函数：调用后按 `[0, 1, 2]` 的格式打印。'],
            ['\n\nint main(void) {\n    int a[] = {2, 0, 2, 1, 1, 0}, b[] = {2, 0, 1};\n    show(a, 6);\n    show(b, 3);\n    return 0;\n}', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{2, 0, 2, 1, 1, 0}, {2, 0, 1}};\n    for (auto& nums : cases) {\n        Solution().sortColors(nums);\n        cout << "[";\n        for (size_t i = 0; i < nums.size(); i++) {\n            cout << (i > 0 ? ", " : "") << nums[i];\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '逐组调用再打印。']).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{2, 0, 2, 1, 1, 0}, {2, 0, 1}};\n        for (int[] nums : cases) {\n            new Solution().sortColors(nums);\n            System.out.println(java.util.Arrays.toString(nums));\n        }\n    }\n}', '逐组调用再打印。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    for mut nums in [vec![2, 0, 2, 1, 1, 0], vec![2, 0, 1]] {\n        Solution::sort_colors(&mut nums);\n        println!("{:?}", nums);\n    }\n}', '逐组调用再打印。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '同向指针写完了',
        say: [
          '用指针划分区域、并始终守住「每个区域里是什么」这个约定，是原地整理数组的通用办法。交换后要想清楚：换过来的数看过没有。时间 O(n)，额外空间 O(1)。',
          '最后一个子模块「快慢指针」只有一题「寻找重复数」：把数组看成一条链，用一快一慢两个指针找环。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
