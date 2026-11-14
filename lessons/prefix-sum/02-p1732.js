/*
 * 前缀和 · 1732 找到最高海拔（简单）
 * 每个点的海拔 = 前面所有净增量的累加，也就是前缀和。边加边记最高的，不用存整个数组。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.PS;

  root.Catalog.addChapter('prefix-sum', {
    id: 'ps-1732',
    label: '1732',
    title: '找到最高海拔',
    summary: '每个点的海拔就是前面所有净增量的累加——最朴素的前缀和。一路累加，记下最高的。',
    problem: { id: 1732, level: 'easy', url: leetcode('find-the-highest-altitude') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '有一个自行车手打算进行一场公路骑行，这条路线总共由 n + 1 个不同海拔的点组成。自行车手从海拔为 0 的点 0 开始骑行。给你一个长度为 n 的整数数组 `gain`，其中 `gain[i]` 是点 i 和点 i + 1 的**净海拔高度差**（0 <= i < n）。请你返回**最高点的海拔**。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[-5, 1, 5, 0, -7]`', '`1`', '海拔依次是 0, -5, -4, 1, 1, -6，最高是 1'],
                ['`[-4, -3, -2, -1, 4, 3, 2]`', '`0`', '一直在 0 以下，最高的是起点 0'],
              ],
            },
          },
          { list: ['`n == gain.length`', '`1 <= n <= 100`', '`-100 <= gain[i] <= 100`'] },
          '<a href="' + leetcode('find-the-highest-altitude') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：一路累加',
        doc: [
          '点 0 的海拔是 0；点 1 的海拔是 `0 + gain[0]`；点 2 是 `0 + gain[0] + gain[1]`……**点 i 的海拔就是 gain 的前 i 个数之和**，也就是前缀和。',
          '算点 i 的海拔，不用从头再加：它等于点 i - 1 的海拔再加上 `gain[i-1]`。所以从左往右一路累加，就能依次得到每个点的海拔。',
          { viz: { kind: 'grid', title: '样例 1', frames: trace.altitude([-5, 1, 5, 0, -7]) } },
          '题目只要最高的海拔，那就不用把每个点都存下来：一个变量记当前海拔，一个变量记见过的最高。注意起点 0 也算一个点——样例 2 里一路下坡，最高的就是起点。',
          '一遍扫描，时间 O(n)，额外空间 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：当前海拔和最高海拔',
        say: ['函数收净增量数组，返回最高海拔。从起点出发，当前海拔是 0；起点也是一个点，所以目前最高的也是 0。'],
        ops: {
          python: code(
            ['class Solution:', '力扣要求把解法放进 `Solution` 类里。'],
            ['\n    def largestAltitude(self, gain: list[int]) -> int:', '题目给的方法：收净增量列表，返回整数。'],
            ['\n        altitude = best = 0', '当前海拔和最高海拔都从起点的 0 开始。不从负无穷开始，因为起点本身就算一个点。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint largestAltitude(int* gain, int gainSize) {', '题目给的函数。'],
            ['\n    int altitude = 0, best = 0;', '当前海拔和最高海拔都从起点的 0 开始。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int largestAltitude(vector<int>& gain) {', '照例写类和方法，要用 `max`。'],
            ['\n        int altitude = 0, best = 0;', '当前海拔和最高海拔都从起点的 0 开始。']
          ),
          java: code(
            ['class Solution {\n    public int largestAltitude(int[] gain) {', '照例写类和方法。'],
            ['\n        int altitude = 0, best = 0;', '当前海拔和最高海拔都从起点的 0 开始。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn largest_altitude(gain: Vec<i32>) -> i32 {', '照例写结构体和函数。'],
            ['\n        let (mut altitude, mut best) = (0, 0);', '当前海拔和最高海拔都从起点的 0 开始。']
          ),
        },
      },
      {
        section: '写代码',
        title: '一路累加，记下最高',
        say: [
          '每走一段路，当前海拔加上这一段的净增量，就到了下一个点；再和最高海拔比一比。',
          { viz: { kind: 'grid', title: '累加', frames: trace.altitude([-5, 1, 5, 0, -7]) } },
        ],
        ops: {
          python: code(
            ['\n        for g in gain:', '一段一段往前骑。'],
            ['\n            altitude += g', '到下一个点：海拔加上这一段的净增量。这就是前缀和一步步累加的样子。'],
            ['\n            best = max(best, altitude)', '和见过的最高海拔比，留下大的。'],
            ['\n        return best', '最高点的海拔。']
          ),
          c: code(
            ['\n    for (int i = 0; i < gainSize; i++) {', '一段一段往前骑。'],
            ['\n        altitude += gain[i];', '到下一个点：海拔加上这一段的净增量。'],
            ['\n        if (altitude > best) {\n            best = altitude;\n        }\n    }', '比见过的最高还高，就记下来。'],
            ['\n    return best;\n}', '最高点的海拔。']
          ),
          cpp: code(
            ['\n        for (int g : gain) {', '一段一段往前骑。'],
            ['\n            altitude += g;\n            best = max(best, altitude);\n        }', '海拔加上净增量，再和最高的比。'],
            ['\n        return best;\n    }\n};', '最高点的海拔。']
          ),
          java: code(
            ['\n        for (int g : gain) {', '一段一段往前骑。'],
            ['\n            altitude += g;\n            best = Math.max(best, altitude);\n        }', '海拔加上净增量，再和最高的比。'],
            ['\n        return best;\n    }\n}', '最高点的海拔。']
          ),
          rust: code(
            ['\n        for g in gain {', '一段一段往前骑。'],
            ['\n            altitude += g;\n            best = best.max(altitude);\n        }', '海拔加上净增量，再和最高的比。'],
            ['\n        best\n    }\n}', '最高点的海拔。']
          ),
        },
        sayBy: {
          python: [py('max(arg1, arg2)', 'library/functions.html#max', 'Return the largest item in an iterable or the largest of two or more arguments.', '返回可迭代对象里最大的一项，或者两个及以上参数里最大的那个。')],
          java: [javadoc('Math.max(int a, int b)', 'java/lang/Math.html#max(int,int)', 'Returns the greater of two int values.', '返回两个 int 值里较大的那个。')],
          rust: [rustdoc('Ord::max', 'cmp/trait.Ord.html#method.max', 'Compares and returns the maximum of two values.', '比较两个值，返回较大的那个。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：1 和 0。第二个样例一路下坡，检验起点 0 也算数。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().largestAltitude([-5, 1, 5, 0, -7]))\n    print(Solution().largestAltitude([-4, -3, -2, -1, 4, 3, 2]))', '两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['1', '0'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {-5, 1, 5, 0, -7}, b[] = {-4, -3, -2, -1, 4, 3, 2};\n    printf("%d\\n%d\\n", largestAltitude(a, 5), largestAltitude(b, 7));\n    return 0;\n}', '两个样例，数组和长度一起传进去。']).concat([{ pause: 500 }, { run: RUN.c, output: ['1', '0'] }]),
          cpp: code(['\n\nint main() {\n    vector<int> a = {-5, 1, 5, 0, -7}, b = {-4, -3, -2, -1, 4, 3, 2};\n    cout << Solution().largestAltitude(a) << endl << Solution().largestAltitude(b) << endl;\n    return 0;\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['1', '0'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().largestAltitude(new int[]{-5, 1, 5, 0, -7}));\n        System.out.println(new Solution().largestAltitude(new int[]{-4, -3, -2, -1, 4, 3, 2}));\n    }\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['1', '0'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::largest_altitude(vec![-5, 1, 5, 0, -7]));\n    println!("{}", Solution::largest_altitude(vec![-4, -3, -2, -1, 4, 3, 2]));\n}', '两个样例。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['1', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '每个点的海拔就是前缀和：上一个值加上这一项。只要最大值，就边加边比，不用存下来。时间 O(n)，额外空间 O(1)。',
          '下一题要回答很多次「某一段的和」，那就得把前缀和都存成一个数组，任何一段都用两个前缀相减。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
