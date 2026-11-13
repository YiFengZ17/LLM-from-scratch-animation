/*
 * 动态规划 · 网格 · 118 杨辉三角（简单）
 * 网格子模块的第一题：表变成二维，每个数由上一行的两个数算出来。返回整个三角形。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cdoc, cppdoc, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  const OUT = ['[1]', '[1, 1]', '[1, 2, 1]', '[1, 3, 3, 1]', '[1, 4, 6, 4, 1]'];

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-118',
    group: '网格',
    label: '118',
    title: '杨辉三角',
    summary: '表变成二维：第 i 行第 j 个数 = 上一行第 j-1 个 + 第 j 个。顺便学会在各语言里造「列表的列表」。',
    problem: { id: 118, level: 'easy', url: leetcode('pascals-triangle') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个非负整数 `numRows`，生成「杨辉三角」的前 `numRows` 行。在「杨辉三角」中，每个数是它左上方和右上方的数的和。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`numRows = 5`', '`[[1], [1,1], [1,2,1], [1,3,3,1], [1,4,6,4,1]]`'],
                ['`numRows = 1`', '`[[1]]`'],
              ],
            },
          },
          { list: ['`1 <= numRows <= 30`'] },
          '<a href="' + leetcode('pascals-triangle') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：第一张二维的表',
        doc: [
          '把三角形左对齐，就是一张二维的表：第 i 行有 i + 1 个数。题目已经把四步说完了：',
          {
            table: {
              head: ['', '杨辉三角'],
              rows: [
                ['状态', '`row[i][j]`：第 i 行第 j 个数（都从 0 数）'],
                ['转移', '左对齐以后，「左上方和右上方」变成了正上方一行的第 j - 1 个和第 j 个：`row[i][j] = row[i-1][j-1] + row[i-1][j]`'],
                ['初始值', '每行两端（j = 0 和 j = i）都是 1'],
                ['顺序与答案', '一行一行从上往下填，每行从左往右；答案是整张表'],
              ],
            },
          },
          { viz: { kind: 'grid', title: 'numRows = 5', frames: trace.pascal(5) } },
          '这道题的难点不在转移，而在**造一张二维的表**：每种语言里「列表的列表」写法都不一样。C 还要按题目的约定，把每行的长度一起交回去。',
          '一共 1 + 2 + … + n 个数，时间 O(n²)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收行数，返回整个三角形：一个「每个元素又是一个列表」的列表。'],
        ops: {
          python: code(
            ['class Solution:', '照例先写类。'],
            ['\n    def generate(self, numRows: int) -> list[list[int]]:', '返回类型 `list[list[int]]`：外层列表里每个元素是一行，每行是一个整数列表。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '每行的长度不一样，只能运行时按需申请内存，`malloc` 和 `free` 在 `stdlib.h` 里。'],
            ['\n\nint** generate(int numRows, int* returnSize, int** returnColumnSizes) {', '力扣规定的 C 签名：返回 `int**`，也就是「每个元素指向一行」的指针数组。C 的数组不记长度，所以还要通过两个指针参数把行数和每行的长度交给调用方。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;', '要用 `vector` 和 `cout`。'],
            ['\n\nclass Solution {\npublic:\n    vector<vector<int>> generate(int numRows) {', '返回类型 `vector<vector<int>>`：每个元素又是一个 `vector<int>`，也就是一行。']
          ),
          java: code(
            ['import java.util.ArrayList;\nimport java.util.List;', '返回值是「列表的列表」，要用 `List` 接口和它最常用的实现 `ArrayList`，先导入。'],
            ['\n\nclass Solution {\n    public List<List<Integer>> generate(int numRows) {', '返回类型 `List<List<Integer>>`。泛型里不能写基本类型 int，要写它的包装类 `Integer`。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '先声明 `Solution`。'],
            ['\n    pub fn generate(num_rows: i32) -> Vec<Vec<i32>> {', '返回类型 `Vec<Vec<i32>>`：每个元素是一行 `Vec<i32>`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '准备装三角形的外层列表',
        say: ['先准备一个空的外层列表，算好一行就往里放一行。C 的话要先按行数申请好放「行指针」的空间，并把行数和每行长度登记好。'],
        ops: {
          python: code(['\n        rows = []', '外层列表先空着，每算好一行就追加进去。']),
          c: code(
            ['\n    int** rows = malloc(numRows * sizeof(int*));', '一共 numRows 行，每行用一个 `int*` 指着。先申请能放 numRows 个指针的空间：`sizeof(int*)` 是一个指针占几个字节。'],
            ['\n    *returnSize = numRows;', '告诉调用方一共几行：通过指针参数写回去。'],
            ['\n    *returnColumnSizes = malloc(numRows * sizeof(int));', '还要告诉调用方每行有几个数：申请一个长 numRows 的 int 数组，存进调用方给的指针里，下面逐行填。']
          ),
          cpp: code(['\n        vector<vector<int>> rows;', '外层 vector 先空着，每算好一行就放进去。']),
          java: code(['\n        List<List<Integer>> rows = new ArrayList<>();', '外层列表先空着。`new ArrayList<>()` 的尖括号里不用再写类型，编译器从左边推断。']),
          rust: code(['\n        let mut rows: Vec<Vec<i32>> = Vec::new();', '外层 Vec 先空着。后面要往里放行，加 `mut`；空的 Vec 看不出元素类型，所以写明。']),
        },
        sayBy: {
          c: [cdoc('malloc(size_t size)', 'Basic-Allocation.html', 'This function returns a pointer to a newly allocated block size bytes long, or a null pointer (setting errno) if the block could not be allocated.', '这个函数返回一个指针，指向新申请的、长 size 个字节的内存块；申请不到时返回空指针（并设置 errno）。')],
        },
      },
      {
        section: '写代码',
        title: '一行一行往下算',
        say: [
          '第 i 行有 i + 1 个数。先把整行都当成 1 造出来——两端本来就是 1；再把中间的数（j 从 1 到 i - 1）用上一行的两个数改掉。算好的行放进外层列表，下一行就能用它了。',
          { viz: { kind: 'grid', title: '从上往下填', frames: trace.pascal(5) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(numRows):', '一行一行从上往下算，i 从 0 到 numRows - 1。'],
            ['\n            row = [1] * (i + 1)', '第 i 行有 i + 1 个数，先全填 1：两端就不用再管了。'],
            ['\n            for j in range(1, i):', '中间的数是 j = 1 到 i - 1。第 0 行和第 1 行没有中间的数，这个范围是空的，循环不跑。'],
            ['\n                row[j] = rows[i - 1][j - 1] + rows[i - 1][j]', '上一行已经放进 rows 了，取它挨着的两个数相加。`rows[i - 1][j]` 先取出第 i - 1 行，再取那一行的第 j 个。'],
            ['\n            rows.append(row)', '这一行算好了，追加到外层列表末尾，下一行就能用它。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numRows; i++) {', '一行一行从上往下算。'],
            ['\n        rows[i] = malloc((i + 1) * sizeof(int));', '第 i 行有 i + 1 个数，给它申请空间，让 `rows[i]` 指着。'],
            ['\n        (*returnColumnSizes)[i] = i + 1;', '登记这一行的长度。`*returnColumnSizes` 是刚才申请的长度数组，要先加括号解引用，再取第 i 个。'],
            ['\n        rows[i][0] = rows[i][i] = 1;', '两端都是 1。连等号从右往左赋值。i = 0 时两端是同一格，也没问题。'],
            ['\n        for (int j = 1; j < i; j++) {\n            rows[i][j] = rows[i - 1][j - 1] + rows[i - 1][j];\n        }\n    }', '中间的数 j = 1 到 i - 1：上一行挨着的两个数相加。']
          ),
          cpp: code(
            ['\n        for (int i = 0; i < numRows; i++) {', '一行一行从上往下算。'],
            ['\n            vector<int> row(i + 1, 1);', '第 i 行有 i + 1 个数，`row(i + 1, 1)` 造出 i + 1 个 1：两端就不用再管了。'],
            ['\n            for (int j = 1; j < i; j++) {\n                row[j] = rows[i - 1][j - 1] + rows[i - 1][j];\n            }', '中间的数 j = 1 到 i - 1：上一行挨着的两个数相加。'],
            ['\n            rows.push_back(row);\n        }', '这一行算好了，放到外层 vector 末尾。']
          ),
          java: code(
            ['\n        for (int i = 0; i < numRows; i++) {', '一行一行从上往下算。'],
            ['\n            List<Integer> row = new ArrayList<>();', '新的一行，先空着，从左往右一个个加进去。'],
            ['\n            for (int j = 0; j <= i; j++) {', '第 i 行有 i + 1 个数，j 从 0 到 i。'],
            ['\n                if (j == 0 || j == i) {\n                    row.add(1);', '两端放 1。'],
            ['\n                } else {\n                    row.add(rows.get(i - 1).get(j - 1) + rows.get(i - 1).get(j));\n                }\n            }', '中间的数：上一行挨着的两个数相加。`List` 不能用方括号取元素，要用 `get`；取出来的 Integer 相加时会自动变回 int。'],
            ['\n            rows.add(row);\n        }', '这一行算好了，加到外层列表末尾。']
          ),
          rust: code(
            ['\n        for i in 0..num_rows as usize {', '一行一行从上往下算。下标要用 usize，把 num_rows 转一下。`as` 比 `..` 先算，所以不用加括号。'],
            ['\n            let mut row = vec![1; i + 1];', '第 i 行有 i + 1 个数，先全填 1。'],
            ['\n            for j in 1..i {\n                row[j] = rows[i - 1][j - 1] + rows[i - 1][j];\n            }', '中间的数 j = 1 到 i - 1：上一行挨着的两个数相加。'],
            ['\n            rows.push(row);\n        }', '这一行放进外层 Vec。放进去以后 row 的所有权就交给了 rows，下一轮再新建一个。']
          ),
        },
        sayBy: {
          python: [py('s.append(x)', 'library/stdtypes.html#mutable-sequence-types', 'appends x to the end of the sequence (same as s[len(s):len(s)] = [x])', '把 x 追加到序列末尾（等同于 s[len(s):len(s)] = [x]）。')],
          cpp: [cppdoc('a.push_back(t)', 'sequence.reqmts', 'Appends a copy of t.', '在末尾追加 t 的一个副本。')],
          java: [javadoc('List.add(E e)', 'java/util/List.html#add(E)', 'Appends the specified element to the end of this list (optional operation).', '把指定元素追加到这个列表的末尾（可选操作）。')],
          rust: [rustdoc('Vec::push', 'vec/struct.Vec.html#method.push', 'Appends an element to the back of a collection.', '在集合的末尾追加一个元素。')],
        },
      },
      {
        section: '写代码',
        title: '返回整个三角形',
        say: ['所有行都算好了，把外层列表交回去。'],
        ops: {
          python: code(['\n        return rows', '返回整个三角形。']),
          c: code(['\n    return rows;\n}', '返回行指针数组。内存由调用方用完后释放。']),
          cpp: code(['\n        return rows;\n    }\n};', '返回整个三角形。']),
          java: code(['\n        return rows;\n    }\n}', '返回整个三角形。']),
          rust: code(['\n        rows\n    }\n}', '返回整个三角形。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '打印前 5 行',
        say: ['用 numRows = 5 跑一遍，每行打印成 `[1, 2, 1]` 的样子，应该和题目的样例一样。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for row in Solution().generate(5):\n        print(row)', '逐行打印。`print` 一个列表，打出来就是 `[1, 2, 1]` 的样子。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int size, *cols;\n    int** rows = generate(5, &size, &cols);', '准备两个变量接收行数和每行长度，把它们的地址传进去，函数会往里写。'],
            ['\n    for (int i = 0; i < size; i++) {\n        printf("[");', '逐行打印，先打左括号。'],
            ['\n        for (int j = 0; j < cols[i]; j++) {\n            if (j > 0) {\n                printf(", ");\n            }\n            printf("%d", rows[i][j]);\n        }', '打印这一行的每个数，从第二个起前面加逗号。'],
            ['\n        printf("]\\n");\n        free(rows[i]);\n    }', '打完右括号换行。这一行用完了，把它的内存还回去。'],
            ['\n    free(rows);\n    free(cols);\n    return 0;\n}', '最后把行指针数组和长度数组也释放掉：`malloc` 来的内存都要 `free`。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    for (auto& row : Solution().generate(5)) {\n        cout << "[";', '逐行打印。范围 for 依次取出每一行，`auto&` 让编译器推断类型并且不复制。'],
            ['\n        for (size_t j = 0; j < row.size(); j++) {\n            cout << (j > 0 ? ", " : "") << row[j];\n        }\n        cout << "]" << endl;\n    }', '每个数前面，从第二个起加逗号。`size_t` 和 `row.size()` 同是无符号类型，比较时不会有警告。'],
            ['\n    return 0;\n}']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        for (List<Integer> row : new Solution().generate(5)) {\n            System.out.println(row);\n        }\n    }\n}', '逐行打印。`println` 一个 List，打出来就是 `[1, 2, 1]` 的样子。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    for row in Solution::generate(5) {\n        println!("{:?}", row);\n    }\n}', '逐行打印。`{:?}` 是调试格式，打印 Vec 就是 `[1, 2, 1]` 的样子。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '第一张二维的表：每格只看上一行的两格，一行一行往下填。时间 O(n²)。',
          '下一题只要三角形的某一行。上一行用完就没用了，能不能只留一行、原地改出下一行？可以，但要注意改的方向。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
