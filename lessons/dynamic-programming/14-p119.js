/*
 * 动态规划 · 网格 · 119 杨辉三角 II（简单）
 * 只要某一行：用一行原地改出下一行。要从右往左改，否则会用到刚改过的值。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py } = root.LessonKit;
  const { trace } = root.DP;

  const OUT = ['[1, 3, 3, 1]', '[1]', '[1, 1]', '[1, 4, 6, 4, 1]'];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-119',
    group: '网格',
    label: '119',
    title: '杨辉三角 II',
    summary: '只留一行，原地改出下一行。从右往左改，左边的数才还是上一行的值。',
    problem: { id: 119, level: 'easy', url: leetcode('pascals-triangle-ii') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个非负索引 `rowIndex`，返回「杨辉三角」的第 `rowIndex` 行（从 0 数）。进阶：你可以优化你的算法到 O(rowIndex) 空间复杂度吗？',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`rowIndex = 3`', '`[1, 3, 3, 1]`'],
                ['`rowIndex = 0`', '`[1]`'],
                ['`rowIndex = 1`', '`[1, 1]`'],
              ],
            },
          },
          { list: ['`0 <= rowIndex <= 33`'] },
          '<a href="' + leetcode('pascals-triangle-ii') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：一行原地滚动',
        doc: [
          '照上一题把整个三角形算出来，再取最后一行，当然可以。但算第 i 行只用到第 i - 1 行，更早的行都没用了。所以只留**一行**，在它上面原地改出下一行：末尾先补一个 1，再把中间的每个数加上它左边的数。',
          '改的方向很关键。新的 `row[j]` 要用上一行的 `row[j-1]` 和 `row[j]`：',
          {
            list: [
              '**从左往右**改：改 `row[j]` 时，`row[j-1]` 已经被改成了新值，加错了。',
              '**从右往左**改：改 `row[j]` 时，左边的 `row[j-1]` 还没动，还是上一行的值。',
            ],
          },
          { viz: { kind: 'grid', title: 'rowIndex = 4', frames: trace.pascalRow(4) } },
          '只用一个长 rowIndex + 1 的数组，额外空间 O(n)，时间 O(n²)。「倒着改，才能用上旧值」这一招，背包子模块里还会再见到。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和第 0 行',
        say: ['函数收行号，返回那一行。先从第 0 行 `[1]` 开始。'],
        ops: {
          python: code(
            ['class Solution:\n    def getRow(self, rowIndex: int) -> list[int]:', '照例写类和方法：收行号，返回一行整数。'],
            ['\n        row = [1]', '从第 0 行开始，它只有一个 1。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '要用 `malloc` 申请返回的数组。'],
            ['\n\nint* getRow(int rowIndex, int* returnSize) {', '力扣规定的签名：返回数组的指针，长度通过 `returnSize` 交回去。'],
            ['\n    int* row = malloc((rowIndex + 1) * sizeof(int));\n    *returnSize = rowIndex + 1;', '最后一行有 rowIndex + 1 个数，一次申请够，之后原地改。顺便把长度告诉调用方。'],
            ['\n    row[0] = 1;', '从第 0 行开始：只有一个 1。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> getRow(int rowIndex) {', '照例的架子：收行号，返回 `vector<int>`。'],
            ['\n        vector<int> row = {1};', '从第 0 行开始，它只有一个 1。']
          ),
          java: code(
            ['import java.util.ArrayList;\nimport java.util.List;\n\nclass Solution {\n    public List<Integer> getRow(int rowIndex) {', '照例的架子：返回 `List<Integer>`，先导入 List 和 ArrayList。'],
            ['\n        List<Integer> row = new ArrayList<>();\n        row.add(1);', '从第 0 行开始，它只有一个 1。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn get_row(row_index: i32) -> Vec<i32> {', '照例的架子：返回一行 `Vec<i32>`。'],
            ['\n        let mut row = vec![1];', '从第 0 行开始，它只有一个 1。']
          ),
        },
      },
      {
        section: '写代码',
        title: '补一个 1，再从右往左改',
        say: [
          '从第 1 行一直变到第 rowIndex 行。每次变一行：末尾补一个 1，然后中间的数从右往左，各自加上左边的数。',
          { viz: { kind: 'grid', title: '从右往左改', frames: trace.pascalRow(4) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, rowIndex + 1):', '要把这一行依次变成第 1 行、第 2 行……一直到第 rowIndex 行。'],
            ['\n            row.append(1)', '第 i 行比上一行多一个数，末尾那个是 1。'],
            ['\n            for j in range(i - 1, 0, -1):', '中间的数是下标 1 到 i - 1，要从右往左改。`range` 的第三个参数是步长，-1 表示倒着数：i - 1, i - 2, …, 1，右端 0 取不到。'],
            ['\n                row[j] += row[j - 1]', '加上左边的数。因为是从右往左，左边那个还没改，还是上一行的值。']
          ),
          c: code(
            ['\n    for (int i = 1; i <= rowIndex; i++) {', '依次变成第 1 行、第 2 行……一直到第 rowIndex 行。'],
            ['\n        row[i] = 1;', '第 i 行末尾补一个 1。空间一开始就申请够了，直接写进去。'],
            ['\n        for (int j = i - 1; j >= 1; j--) {', '中间的数从右往左改：j 从 i - 1 减到 1。'],
            ['\n            row[j] += row[j - 1];\n        }\n    }', '加上左边的数，左边那个还是上一行的值。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i <= rowIndex; i++) {', '依次变成第 1 行……一直到第 rowIndex 行。'],
            ['\n            row.push_back(1);', '末尾补一个 1。'],
            ['\n            for (int j = i - 1; j >= 1; j--) {\n                row[j] += row[j - 1];\n            }\n        }', '中间的数从右往左，各自加上左边的数，左边那个还是上一行的值。']
          ),
          java: code(
            ['\n        for (int i = 1; i <= rowIndex; i++) {', '依次变成第 1 行……一直到第 rowIndex 行。'],
            ['\n            row.add(1);', '末尾补一个 1。'],
            ['\n            for (int j = i - 1; j >= 1; j--) {\n                row.set(j, row.get(j) + row.get(j - 1));\n            }\n        }', '中间的数从右往左，各自加上左边的数。List 改元素要用 `set(下标, 新值)`。']
          ),
          rust: code(
            ['\n        for i in 1..=row_index as usize {', '依次变成第 1 行……一直到第 rowIndex 行，转成 usize 好做下标。'],
            ['\n            row.push(1);', '末尾补一个 1。'],
            ['\n            for j in (1..i).rev() {\n                row[j] += row[j - 1];\n            }\n        }', '中间的数从右往左：`(1..i).rev()` 把 1 到 i - 1 倒过来。各自加上左边的数。']
          ),
        },
        sayBy: {
          python: [py('range(start, stop, step)', 'library/stdtypes.html#ranges', 'For a negative step, the contents of the range are still determined by the formula r[i] = start + step*i, but the constraints are i >= 0 and r[i] > stop.', '步长为负时，range 的内容仍由 r[i] = start + step*i 决定，但条件是 i >= 0 且 r[i] > stop。')],
        },
      },
      {
        section: '写代码',
        title: '返回这一行',
        say: ['循环结束时，这一行已经变成了第 rowIndex 行。'],
        ops: {
          python: code(['\n        return row', '返回第 rowIndex 行。']),
          c: code(['\n    return row;\n}', '返回第 rowIndex 行。']),
          cpp: code(['\n        return row;\n    }\n};', '返回第 rowIndex 行。']),
          java: code(['\n        return row;\n    }\n}', '返回第 rowIndex 行。']),
          rust: code(['\n        row\n    }\n}', '返回第 rowIndex 行。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试第 4 行',
        say: ['三个样例，再加上演示里的第 4 行 `[1, 4, 6, 4, 1]`。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for k in [3, 0, 1, 4]:\n        print(Solution().getRow(k))', '四个行号挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nint main(void) {\n    int ks[] = {3, 0, 1, 4};', '写一个入口，四个行号放进数组。'],
            ['\n    for (int t = 0; t < 4; t++) {\n        int size;\n        int* row = getRow(ks[t], &size);', '挨个调用，长度写进 size。'],
            ['\n        printf("[");\n        for (int j = 0; j < size; j++) {\n            printf(j > 0 ? ", %d" : "%d", row[j]);\n        }\n        printf("]\\n");', '按 `[1, 3, 3, 1]` 的样子打印：第一个数前面不加逗号，用条件表达式在两种格式里选一个。'],
            ['\n        free(row);\n    }\n    return 0;\n}', '用完释放。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(
            ['\n\nint main() {\n    for (int k : {3, 0, 1, 4}) {', '写一个入口，四个行号挨个跑。'],
            ['\n        vector<int> row = Solution().getRow(k);\n        cout << "[";\n        for (size_t j = 0; j < row.size(); j++) {\n            cout << (j > 0 ? ", " : "") << row[j];\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '按 `[1, 3, 3, 1]` 的样子打印。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        for (int k : new int[]{3, 0, 1, 4}) {\n            System.out.println(new Solution().getRow(k));\n        }\n    }\n}', '四个行号挨个跑，List 直接打印就是 `[1, 3, 3, 1]` 的样子。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    for k in [3, 0, 1, 4] {\n        println!("{:?}", Solution::get_row(k));\n    }\n}', '四个行号挨个跑，用调试格式打印。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '二维的表，如果每行只看上一行，就能压成一行原地滚动。要点是改的方向：新值用到左边的旧值，就从右往左改。时间 O(n²)，额外空间 O(n)。',
          '下一题「不同路径」的每格看上面和左边，是真正的网格。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
