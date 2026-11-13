/*
 * 双指针 · 相向指针 · 42 接雨水（困难）
 * 每格的水 = min(左边最高, 右边最高) - 自己的高度。相向指针：矮的一边，水位只由它那边的最高决定。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.TP;

  const H = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-42',
    group: '相向指针',
    label: '42',
    title: '接雨水',
    summary: '每格的水位由左右两边最高的柱子里矮的那个决定。哪边的指针指着更矮的柱子，那一格的水位就只看那一边的最高。',
    problem: { id: 42, level: 'hard', url: leetcode('trapping-rain-water') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]`', '`6`'],
                ['`[4, 2, 0, 3, 2, 5]`', '`9`'],
              ],
            },
          },
          { list: ['`n == height.length`', '`1 <= n <= 2 * 10^4`', '`0 <= height[i] <= 10^5`'] },
          '<a href="' + leetcode('trapping-rain-water') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路一：一格一格地算',
        doc: [
          '先只看一格 i：它上面能存多少水？水会从矮的那边流走，所以水位是**左边最高的柱子**和**右边最高的柱子**里矮的那个（都包括它自己）：',
          '`水[i] = min(左边最高, 右边最高) - height[i]`',
          '对每一格都往左、往右各扫一遍找最高，是 O(n²)。也可以先从左往右算出每格的「左边最高」，从右往左算出「右边最高」，存在两个数组里，O(n) 时间、O(n) 空间——这已经是一种动态规划了。',
          '能不能连这两个数组都省掉？',
        ],
      },
      {
        section: '题目与思路',
        title: '思路二：相向指针',
        doc: [
          'left、right 从两端往中间走，`leftMax` 记 left 走过的部分里最高的柱子，`rightMax` 记 right 走过的部分里最高的。',
          '假设 `height[left] < height[right]`。left 这一格的水位是 `min(左边最高, 右边最高)`：',
          {
            list: [
              '**左边最高**就是 leftMax，left 左边全都走过了，一清二楚。',
              '**右边最高**我们并不全知道，但它至少有 `height[right]` 这么高。而 leftMax 一定比右边的某根柱子矮——leftMax 那根柱子当初被 left 走过，正是因为它比当时 right 指的柱子矮，而那根柱子还在 left 的右边。所以右边最高一定比 leftMax 高。',
            ],
          },
          '于是这一格的水位就是 leftMax，水量是 `leftMax - height[left]`，算完 left 右移。反过来 right 那边矮时同理。',
          { viz: { kind: 'array', title: '样例 1', frames: trace.trap(H) } },
          '一遍扫描，时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：两个指针和两边的最高',
        say: ['函数收高度数组，返回总水量。两个指针放到两端，两边的最高柱子先记 0，水量从 0 开始累加。'],
        ops: {
          python: code(
            ['class Solution:\n    def trap(self, height: list[int]) -> int:', '照例写类和方法。'],
            ['\n        left, right = 0, len(height) - 1', '两个指针放到两端。'],
            ['\n        left_max = right_max = 0\n        water = 0', '两边走过的部分里最高的柱子，以及总水量。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint trap(int* height, int heightSize) {', '题目给的函数。'],
            ['\n    int left = 0, right = heightSize - 1;\n    int leftMax = 0, rightMax = 0, water = 0;', '两个指针放到两端；两边的最高柱子和总水量。水量最多约 2×10<sup>4</sup> × 10<sup>5</sup> = 2×10<sup>9</sup>，刚好在 int 范围里（实际远到不了）。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {', '照例的架子。'],
            ['\n        int left = 0, right = (int)height.size() - 1;\n        int leftMax = 0, rightMax = 0, water = 0;', '两个指针放到两端；两边的最高柱子和总水量。']
          ),
          java: code(
            ['class Solution {\n    public int trap(int[] height) {', '照例的架子。'],
            ['\n        int left = 0, right = height.length - 1;\n        int leftMax = 0, rightMax = 0, water = 0;', '两个指针放到两端；两边的最高柱子和总水量。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn trap(height: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let (mut left, mut right) = (0, height.len() - 1);\n        let (mut left_max, mut right_max, mut water) = (0, 0, 0);', '两个指针放到两端；两边的最高柱子和总水量。题目保证至少一根柱子。']
          ),
        },
      },
      {
        section: '写代码',
        title: '矮的一边：水位就是它那边的最高',
        say: [
          '每一轮比较两端的柱子。左边矮，左边这一格的水位就是 leftMax：先用这根柱子更新 leftMax，再加上 leftMax 减去它的高度，left 右移。右边矮（或一样高）时对称地处理右边。',
          { viz: { kind: 'array', title: '处理矮的一边', frames: trace.trap(H) } },
        ],
        ops: {
          python: code(
            ['\n        while left < right:', '两个指针相遇时，最高的那根柱子上不会有水，停下。'],
            ['\n            if height[left] < height[right]:', '左边矮：左边这一格的水位只看 left_max。'],
            ['\n                left_max = max(left_max, height[left])', '先把这根柱子算进 left_max：如果它就是最高的，水位等于它自己，存 0。'],
            ['\n                water += left_max - height[left]\n                left += 1', '水位减去柱子高度，就是这一格的水；然后 left 右移。'],
            ['\n            else:\n                right_max = max(right_max, height[right])\n                water += right_max - height[right]\n                right -= 1', '右边矮（或一样高）：对称地处理右边这一格。'],
            ['\n        return water', '总水量。']
          ),
          c: code(
            ['\n    while (left < right) {', '两个指针相遇时停下。'],
            ['\n        if (height[left] < height[right]) {', '左边矮：水位只看 leftMax。'],
            ['\n            if (height[left] > leftMax) {\n                leftMax = height[left];\n            }', '先把这根柱子算进 leftMax。'],
            ['\n            water += leftMax - height[left];\n            left++;', '这一格的水，然后 left 右移。'],
            ['\n        } else {\n            if (height[right] > rightMax) {\n                rightMax = height[right];\n            }\n            water += rightMax - height[right];\n            right--;\n        }\n    }', '右边矮（或一样高）：对称地处理右边。'],
            ['\n    return water;\n}', '总水量。']
          ),
          cpp: code(
            ['\n        while (left < right) {', '两个指针相遇时停下。'],
            ['\n            if (height[left] < height[right]) {\n                leftMax = max(leftMax, height[left]);\n                water += leftMax - height[left];\n                left++;', '左边矮：更新 leftMax，加上这一格的水，left 右移。'],
            ['\n            } else {\n                rightMax = max(rightMax, height[right]);\n                water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n};', '右边矮（或一样高）：对称地处理右边。']
          ),
          java: code(
            ['\n        while (left < right) {', '两个指针相遇时停下。'],
            ['\n            if (height[left] < height[right]) {\n                leftMax = Math.max(leftMax, height[left]);\n                water += leftMax - height[left];\n                left++;', '左边矮：更新 leftMax，加上这一格的水，left 右移。'],
            ['\n            } else {\n                rightMax = Math.max(rightMax, height[right]);\n                water += rightMax - height[right];\n                right--;\n            }\n        }\n        return water;\n    }\n}', '右边矮（或一样高）：对称地处理右边。']
          ),
          rust: code(
            ['\n        while left < right {', '两个指针相遇时停下。'],
            ['\n            if height[left] < height[right] {\n                left_max = left_max.max(height[left]);\n                water += left_max - height[left];\n                left += 1;', '左边矮：更新 left_max，加上这一格的水，left 右移。'],
            ['\n            } else {\n                right_max = right_max.max(height[right]);\n                water += right_max - height[right];\n                right -= 1;\n            }\n        }\n        water\n    }\n}', '右边矮（或一样高）：对称地处理右边。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：6 和 9。再试只有一根柱子 `[5]`：存不了水，0。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for h in [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], [4, 2, 0, 3, 2, 5], [5]]:\n        print(Solution().trap(h))', '两个样例和一根柱子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['6', '9', '0'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, b[] = {4, 2, 0, 3, 2, 5}, c[] = {5};\n    printf("%d\\n%d\\n%d\\n", trap(a, 12), trap(b, 6), trap(c, 1));\n    return 0;\n}', '两个样例和一根柱子。']).concat([{ pause: 500 }, { run: RUN.c, output: ['6', '9', '0'] }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, {4, 2, 0, 3, 2, 5}, {5}};\n    for (auto& h : cases) {\n        cout << Solution().trap(h) << endl;\n    }\n    return 0;\n}', '两个样例和一根柱子。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['6', '9', '0'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, {4, 2, 0, 3, 2, 5}, {5}};\n        for (int[] h : cases) {\n            System.out.println(new Solution().trap(h));\n        }\n    }\n}', '两个样例和一根柱子。']).concat([{ pause: 500 }, { run: RUN.java, output: ['6', '9', '0'] }]),
          rust: code(['\n\nfn main() {\n    for h in [vec![0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1], vec![4, 2, 0, 3, 2, 5], vec![5]] {\n        println!("{}", Solution::trap(h));\n    }\n}', '两个样例和一根柱子。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['6', '9', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '相向指针写完了',
        say: [
          '接雨水的关键是想清楚「矮的一边，水位只由它那边的最高决定」。相向指针把 O(n) 的两个辅助数组省成了两个变量。时间 O(n)，额外空间 O(1)。',
          '相向指针的六道题都在问同一个问题：这一步可以放心地排除哪一边？下一个子模块「同向指针」换一种走法：两个指针一前一后，都往同一个方向走。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
