/*
 * 双指针 · 相向指针 · 11 盛最多水的容器（中等）
 * 两端开始，每次移动矮的那一边：矮的一边和谁配都不会更大了，排除它。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.TP;

  const H = [1, 8, 6, 2, 5, 4, 8, 3, 7];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-11',
    group: '相向指针',
    label: '11',
    title: '盛最多水的容器',
    summary: '面积由矮的那一边和宽度决定。从最宽开始，每次排除矮的那一边：它和谁配都只会更窄、不会更高。',
    problem: { id: 11, level: 'medium', url: leetcode('container-with-most-water') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个长度为 n 的整数数组 `height`。有 n 条垂线，第 i 条线的两个端点是 `(i, 0)` 和 `(i, height[i])`。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。返回容器可以储存的最大水量。说明：你不能倾斜容器。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[1, 8, 6, 2, 5, 4, 8, 3, 7]`', '`49`', '下标 1 和 8：宽 7，高 min(8, 7) = 7'],
                ['`[1, 1]`', '`1`', ''],
              ],
            },
          },
          { list: ['`n == height.length`', '`2 <= n <= 10^5`', '`0 <= height[i] <= 10^4`'] },
          '<a href="' + leetcode('container-with-most-water') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：排除矮的那一边',
        doc: [
          '选两条线 left、right，能装的水 = **宽** × **高** = `(right - left) × min(height[left], height[right])`。水位由**矮的那条线**决定，高的那条再高也没用。每一对都试一遍是 O(n²)，n 到 10<sup>5</sup> 太慢。',
          '从最宽的一对开始：left = 0，right = n - 1。假设左边矮。想一想：**左边这条线还能和别的线组成更大的容器吗？**',
          {
            list: [
              '它和 left、right 之间的任何一条线配，**宽度更小**；',
              '高度取两者里矮的，**不会超过它自己**——而它现在已经是这一对里矮的那个了。',
            ],
          },
          '宽变小、高不变大，面积不可能更大。所以左边这条线可以**放心排除**，left 右移。右边矮时同理，right 左移。一样高时排除哪边都可以。',
          { viz: { kind: 'array', title: '样例 1', frames: trace.container(H) } },
          '每一步排除一条线，最多 n 步，时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：从最宽的一对开始',
        say: ['函数收高度数组，返回最大水量。两个指针放到两端，从最宽的容器开始；再准备一个 best 记最大值。'],
        ops: {
          python: code(
            ['class Solution:\n    def maxArea(self, height: list[int]) -> int:', '照例写类和方法。'],
            ['\n        left, right = 0, len(height) - 1\n        best = 0', '从最宽的一对开始；best 记见过的最大水量。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint maxArea(int* height, int heightSize) {', '题目给的函数。'],
            ['\n    int left = 0, right = heightSize - 1, best = 0;', '从最宽的一对开始；best 记最大水量。面积最大 10<sup>4</sup> × 10<sup>5</sup> = 10<sup>9</sup>，int 装得下。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {', '照例的架子，要用 `min` 和 `max`。'],
            ['\n        int left = 0, right = (int)height.size() - 1, best = 0;', '从最宽的一对开始；best 记最大水量。']
          ),
          java: code(
            ['class Solution {\n    public int maxArea(int[] height) {', '照例的架子。'],
            ['\n        int left = 0, right = height.length - 1, best = 0;', '从最宽的一对开始；best 记最大水量。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn max_area(height: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let (mut left, mut right, mut best) = (0, height.len() - 1, 0);', '从最宽的一对开始；best 记最大水量。']
          ),
        },
      },
      {
        section: '写代码',
        title: '算面积，再排除矮的一边',
        say: [
          '每一轮先算当前这一对的面积，更新 best；然后排除矮的那条线——它和剩下谁配都不会更大。',
          { viz: { kind: 'array', title: '排除矮的一边', frames: trace.container(H) } },
        ],
        ops: {
          python: code(
            ['\n        while left < right:', '两条线相遇就没有容器了。'],
            ['\n            area = min(height[left], height[right]) * (right - left)', '高取矮的那条，宽是两条线的距离。'],
            ['\n            best = max(best, area)', '更新最大值。'],
            ['\n            if height[left] < height[right]:\n                left += 1', '左边矮：它和谁配都只会更窄、不会更高，排除它。'],
            ['\n            else:\n                right -= 1', '右边矮（或一样高）：排除右边。'],
            ['\n        return best', '最大水量。']
          ),
          c: code(
            ['\n    while (left < right) {', '两条线相遇就没有容器了。'],
            ['\n        int h = height[left] < height[right] ? height[left] : height[right];', '高取矮的那条。'],
            ['\n        int area = h * (right - left);\n        if (area > best) {\n            best = area;\n        }', '面积 = 高 × 宽，更新最大值。'],
            ['\n        if (height[left] < height[right]) {\n            left++;\n        } else {\n            right--;\n        }\n    }', '排除矮的那一边。'],
            ['\n    return best;\n}', '最大水量。']
          ),
          cpp: code(
            ['\n        while (left < right) {', '两条线相遇就没有容器了。'],
            ['\n            best = max(best, min(height[left], height[right]) * (right - left));', '高取矮的那条，乘以宽，更新最大值。'],
            ['\n            if (height[left] < height[right]) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return best;\n    }\n};', '排除矮的那一边。']
          ),
          java: code(
            ['\n        while (left < right) {', '两条线相遇就没有容器了。'],
            ['\n            best = Math.max(best, Math.min(height[left], height[right]) * (right - left));', '高取矮的那条，乘以宽，更新最大值。'],
            ['\n            if (height[left] < height[right]) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return best;\n    }\n}', '排除矮的那一边。']
          ),
          rust: code(
            ['\n        while left < right {', '两条线相遇就没有容器了。'],
            ['\n            let area = height[left].min(height[right]) * (right - left) as i32;', '高取矮的那条，乘以宽。宽是 usize，转成 i32 才能和高相乘。'],
            ['\n            best = best.max(area);', '更新最大值。'],
            ['\n            if height[left] < height[right] {\n                left += 1;\n            } else {\n                right -= 1;\n            }\n        }\n        best\n    }\n}', '排除矮的那一边。']
          ),
        },
        sayBy: {
          python: [py('min(arg1, arg2)', 'library/functions.html#min', 'Return the smallest item in an iterable or the smallest of two or more arguments.', '返回可迭代对象里最小的一项，或者两个及以上参数里最小的那个。')],
          java: [javadoc('Math.min(int a, int b)', 'java/lang/Math.html#min(int,int)', 'Returns the smaller of two int values.', '返回两个 int 值里较小的那个。')],
          rust: [rustdoc('Ord::min', 'cmp/trait.Ord.html#method.min', 'Compares and returns the minimum of two values.', '比较两个值，返回较小的那个。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试一个',
        say: ['预期：49 和 1。再试 `[4, 3, 2, 1, 4]`：两端都是 4，宽 4，面积 16。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for h in [[1, 8, 6, 2, 5, 4, 8, 3, 7], [1, 1], [4, 3, 2, 1, 4]]:\n        print(Solution().maxArea(h))', '三组输入挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['49', '1', '16'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {1, 8, 6, 2, 5, 4, 8, 3, 7}, b[] = {1, 1}, c[] = {4, 3, 2, 1, 4};\n    printf("%d\\n%d\\n%d\\n", maxArea(a, 9), maxArea(b, 2), maxArea(c, 5));\n    return 0;\n}', '三组输入。']).concat([{ pause: 500 }, { run: RUN.c, output: ['49', '1', '16'] }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{1, 8, 6, 2, 5, 4, 8, 3, 7}, {1, 1}, {4, 3, 2, 1, 4}};\n    for (auto& h : cases) {\n        cout << Solution().maxArea(h) << endl;\n    }\n    return 0;\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['49', '1', '16'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{1, 8, 6, 2, 5, 4, 8, 3, 7}, {1, 1}, {4, 3, 2, 1, 4}};\n        for (int[] h : cases) {\n            System.out.println(new Solution().maxArea(h));\n        }\n    }\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['49', '1', '16'] }]),
          rust: code(['\n\nfn main() {\n    for h in [vec![1, 8, 6, 2, 5, 4, 8, 3, 7], vec![1, 1], vec![4, 3, 2, 1, 4]] {\n        println!("{}", Solution::max_area(h));\n    }\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['49', '1', '16'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '没有排序也能用相向指针，只要找到「可以放心排除」的理由：矮的一边和谁配都更窄、不会更高。时间 O(n)，额外空间 O(1)。',
          '下一题「三数之和」先排序，再固定一个数，剩下两个数就变成了有序数组上的两数之和。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
