/*
 * 双指针 · 同向指针 · 283 移动零（简单）
 * 读写指针：read 逐个读，非零数交换到 write 的位置，write 前进。原地、保持顺序。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { rustdoc } = root.LessonKit;
  const { trace } = root.TP;

  const OUT = ['[1, 3, 12, 0, 0]', '[0]', '[1, 2, 3]'];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-283',
    group: '同向指针',
    label: '283',
    title: '移动零',
    summary: '读写指针：read 逐个读，遇到非零数就换到 write 的位置，write 前进一格。非零数按原顺序挤到前面，0 自然落到后面。',
    problem: { id: 283, level: 'easy', url: leetcode('move-zeroes') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个数组 `nums`，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。请注意，必须在不复制数组的情况下原地对数组进行操作。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[0, 1, 0, 3, 12]`', '`[1, 3, 12, 0, 0]`'],
                ['`[0]`', '`[0]`'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 10^4`', '`-2^31 <= nums[i] <= 2^31 - 1`'] },
          '<a href="' + leetcode('move-zeroes') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：读写指针',
        doc: [
          '如果可以开新数组，很简单：先把非零数按顺序抄过去，后面补 0。题目要求**原地**，那就把「新数组」直接写在原数组的前面——这就是概念章里的读写指针：',
          {
            list: [
              '`read` 从左往右逐个读。',
              '`write` 指着「下一个非零数该放的位置」。它左边全是已经排好的非零数。',
              '读到非零数：把它和 write 位置的数**交换**，write 前进一格。读到 0：什么都不做。',
            ],
          },
          '为什么是交换而不是直接覆盖？交换会把 write 位置原来的数（一定是 0，或者就是它自己）换到后面，0 就自然跟着往后走，读完时全部落在末尾，不用再补。',
          { viz: { kind: 'array', title: '样例 1', frames: trace.moveZeroes([0, 1, 0, 3, 12]) } },
          '一遍扫描，时间 O(n)，额外空间 O(1)。非零数是按读到的顺序依次放下的，相对顺序不变。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数直接改传进来的数组，不返回东西。write 从 0 开始：一开始一个非零数都还没放。'],
        ops: {
          python: code(
            ['class Solution:\n    def moveZeroes(self, nums: list[int]) -> None:', '照例写类和方法。`-> None` 表示不返回值，结果直接改在 nums 上。'],
            ['\n        write = 0', '下一个非零数该放的位置。']
          ),
          c: code(
            ['#include <stdio.h>\n\nvoid moveZeroes(int* nums, int numsSize) {', '题目给的函数：`void` 表示不返回值，直接改指针指着的数组。'],
            ['\n    int write = 0;', '下一个非零数该放的位置。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <utility>\nusing namespace std;\n\nclass Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {', '照例的架子。参数是引用，改的就是调用方的数组。'],
            ['\n        int write = 0;', '下一个非零数该放的位置。']
          ),
          java: code(
            ['class Solution {\n    public void moveZeroes(int[] nums) {', '照例的架子。Java 的数组传进来的是同一个数组，改它调用方也能看到。'],
            ['\n        int write = 0;', '下一个非零数该放的位置。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn move_zeroes(nums: &mut Vec<i32>) {', '参数是 `&mut Vec<i32>`：借来一个可以修改的数组，改完调用方就能看到。'],
            ['\n        let mut write = 0;', '下一个非零数该放的位置。']
          ),
        },
      },
      {
        section: '写代码',
        title: 'read 逐个读，非零就换到 write',
        say: [
          'read 从头读到尾。读到非零数，就和 write 位置的数交换，write 前进；读到 0 就跳过。',
          { viz: { kind: 'array', title: '读写指针', frames: trace.moveZeroes([0, 1, 0, 3, 12]) } },
        ],
        ops: {
          python: code(
            ['\n        for read in range(len(nums)):', 'read 从头读到尾。'],
            ['\n            if nums[read] != 0:', '只关心非零数。'],
            ['\n                nums[write], nums[read] = nums[read], nums[write]', '交换：非零数放到 write 的位置，那里原来的数换到 read 的位置。'],
            ['\n                write += 1', '前面又多排好了一个非零数。']
          ),
          c: code(
            ['\n    for (int read = 0; read < numsSize; read++) {', 'read 从头读到尾。'],
            ['\n        if (nums[read] != 0) {', '只关心非零数。'],
            ['\n            int tmp = nums[write];\n            nums[write] = nums[read];\n            nums[read] = tmp;', '借一个临时变量交换两个位置。'],
            ['\n            write++;\n        }\n    }\n}', '前面又多排好了一个非零数。']
          ),
          cpp: code(
            ['\n        for (int read = 0; read < (int)nums.size(); read++) {', 'read 从头读到尾。'],
            ['\n            if (nums[read] != 0) {\n                swap(nums[write], nums[read]);\n                write++;\n            }\n        }\n    }\n};', '非零数：交换到 write 的位置，write 前进。']
          ),
          java: code(
            ['\n        for (int read = 0; read < nums.length; read++) {', 'read 从头读到尾。'],
            ['\n            if (nums[read] != 0) {\n                int tmp = nums[write];\n                nums[write] = nums[read];\n                nums[read] = tmp;\n                write++;\n            }\n        }\n    }\n}', '非零数：借临时变量交换到 write 的位置，write 前进。']
          ),
          rust: code(
            ['\n        for read in 0..nums.len() {', 'read 从头读到尾。'],
            ['\n            if nums[read] != 0 {\n                nums.swap(write, read);\n                write += 1;\n            }\n        }\n    }\n}', '非零数：`swap` 交换到 write 的位置，write 前进。']
          ),
        },
        sayBy: {
          rust: [rustdoc('slice::swap', 'primitive.slice.html#method.swap', 'Swaps two elements in the slice.', '交换切片里的两个元素。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试没有 0 的',
        say: ['函数改的是原数组，调用完把数组打印出来。预期：[1, 3, 12, 0, 0]、[0]，再试一个没有 0 的 [1, 2, 3]，应该不变。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[0, 1, 0, 3, 12], [0], [1, 2, 3]]:\n        Solution().moveZeroes(nums)\n        print(nums)', '调用完，nums 已经被改好了，直接打印。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* nums, int n) {\n    moveZeroes(nums, n);', '一个小函数：先调用，再打印改好的数组。'],
            ['\n    printf("[");\n    for (int i = 0; i < n; i++) {\n        printf(i > 0 ? ", %d" : "%d", nums[i]);\n    }\n    printf("]\\n");\n}', '按 `[1, 3, 12, 0, 0]` 的格式打印。'],
            ['\n\nint main(void) {\n    int a[] = {0, 1, 0, 3, 12}, b[] = {0}, c[] = {1, 2, 3};\n    show(a, 5);\n    show(b, 1);\n    show(c, 3);\n    return 0;\n}', '三组输入。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{0, 1, 0, 3, 12}, {0}, {1, 2, 3}};\n    for (auto& nums : cases) {\n        Solution().moveZeroes(nums);\n        cout << "[";\n        for (size_t i = 0; i < nums.size(); i++) {\n            cout << (i > 0 ? ", " : "") << nums[i];\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '逐组调用，再打印改好的数组。`auto&` 让改动作用在 cases 里的那一组上。']).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{0, 1, 0, 3, 12}, {0}, {1, 2, 3}};\n        for (int[] nums : cases) {\n            new Solution().moveZeroes(nums);\n            System.out.println(java.util.Arrays.toString(nums));\n        }\n    }\n}', '逐组调用，再打印改好的数组。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    for mut nums in [vec![0, 1, 0, 3, 12], vec![0], vec![1, 2, 3]] {\n        Solution::move_zeroes(&mut nums);\n        println!("{:?}", nums);\n    }\n}', '`mut nums` 让循环变量可改，`&mut nums` 把它借给函数修改，之后再打印。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '读写指针：read 负责看，write 负责放，原地完成「过滤并保持顺序」。时间 O(n)，额外空间 O(1)。',
          '下一题「判断子序列」也是两个同向的指针，但它们走在两个不同的字符串上。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
