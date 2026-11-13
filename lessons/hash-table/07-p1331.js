/*
 * 哈希表与数组 · 1331 数组序号转换（简单）
 * 排好序，从小到大给不同的数编号，存进「数 → 序号」的哈希表；再按原来的顺序查表。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cdoc, javadoc } = root.LessonKit;
  const { trace } = root.HT;

  const OUT = ['[4, 1, 2, 3]', '[1, 1, 1]', '[5, 3, 4, 2, 8, 6, 7, 1, 3]'];

  root.Catalog.addChapter('hash-table', {
    id: 'ht-1331',
    label: '1331',
    title: '数组序号转换',
    summary: '排好序以后，序号就是从小到大数到第几个不同的数。把「数 → 序号」记进哈希表，再按原顺序查表。',
    problem: { id: 1331, level: 'easy', url: leetcode('rank-transform-of-an-array') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `arr`，请你将数组中的每个元素替换为它们排序后的序号。序号代表了一个元素有多大，规则如下：序号从 1 开始编号；一个元素越大，那么序号越大；如果两个元素相等，那么它们的序号相同；每个数字的序号都应该尽可能地小。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[40, 10, 20, 30]`', '`[4, 1, 2, 3]`'],
                ['`[100, 100, 100]`', '`[1, 1, 1]`'],
                ['`[37, 12, 28, 9, 100, 56, 80, 5, 12]`', '`[5, 3, 4, 2, 8, 6, 7, 1, 3]`'],
              ],
            },
          },
          { list: ['`0 <= arr.length <= 10^5`', '`-10^9 <= arr[i] <= 10^9`'] },
          '<a href="' + leetcode('rank-transform-of-an-array') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：排序 + 查表',
        doc: [
          '一个数的序号是多少？就是「比它小的**不同**的数有几个，再加一」。对每个数都去数一遍要 O(n²)。',
          '先**排序**：排好以后从左往右走，遇到一个没见过的数，序号就是目前编过的号数加一；遇到一样的数，序号不变。这样每个不同的数都拿到了自己的序号。',
          '但答案要按**原来的顺序**给出。所以编号时把「数 → 序号」记进哈希表，最后按原数组的顺序，一个个去表里查。',
          { viz: { kind: 'grid', title: '样例 3', frames: trace.rank([37, 12, 28, 9, 100, 56, 80, 5, 12]) } },
          '排序 O(n log n)，编号和查表各 O(n)，总时间 O(n log n)；排序的副本和哈希表各占 O(n) 空间。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收数组，返回同样长的序号数组。C 版和两数之和一样，先写一个最小的哈希表；数最多 10<sup>5</sup> 个，格子开到 2<sup>18</sup>。'],
        ops: {
          python: code(['class Solution:\n    def arrayRankTransform(self, arr: list[int]) -> list[int]:', '照例写类和方法。']),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `qsort`、`malloc`、`bool`，以及 `memset`、`memcpy`。'],
            ['\n\n#define CAP 262144\n\ntypedef struct {\n    int key;\n    int val;\n    bool used;\n} Slot;\n\nstatic Slot table[CAP];', '和两数之和一样的表：键是数，值是序号。数最多 10<sup>5</sup> 个，格子开 2<sup>18</sup> = 262144，多一倍以上。'],
            ['\n\nstatic int slotOf(int key) {\n    int h = ((key % CAP) + CAP) % CAP;\n    while (table[h].used && table[h].key != key) {\n        h = (h + 1) % CAP;\n    }\n    return h;\n}', '和两数之和一样：取余数定起点，被别的键占了就看下一格，返回键所在或该放的格子。'],
            ['\n\nstatic int cmp(const void* a, const void* b) {', '`qsort` 不知道怎么比较两个元素，要我们给它一个比较函数：参数是指向两个元素的指针。'],
            ['\n    int x = *(const int*)a, y = *(const int*)b;\n    return (x > y) - (x < y);\n}', '先把指针转回 int 指针再取值。x 小返回 -1，相等返回 0，x 大返回 1。不写 `x - y`：两个大数相减可能溢出。'],
            ['\n\nint* arrayRankTransform(int* arr, int arrSize, int* returnSize) {\n    memset(table, 0, sizeof(table));', '力扣规定的签名。表是静态的，先清空。']
          ),
          cpp: code(['#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> arrayRankTransform(vector<int>& arr) {', '照例的架子，要用 `sort` 和 `unordered_map`。']),
          java: code(['import java.util.Arrays;\nimport java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] arrayRankTransform(int[] arr) {', '照例的架子，要用 `Arrays.sort` 和 `HashMap`。']),
          rust: code(['use std::collections::HashMap;\n\nstruct Solution;\n\nimpl Solution {\n    pub fn array_rank_transform(arr: Vec<i32>) -> Vec<i32> {', '照例的架子，要用 `HashMap`。']),
        },
        sayBy: {
          c: [cdoc('qsort(void *array, size_t count, size_t size, comparison_fn_t compare)', 'Array-Sort-Function.html', 'The qsort function sorts the array array. The array contains count elements, each of which is of size size.', 'qsort 对数组 array 排序。数组有 count 个元素，每个元素大小为 size。')],
        },
      },
      {
        section: '写代码',
        title: '排好序，给不同的数从小到大编号',
        say: [
          '原数组还要按原顺序用，所以排序的是一份副本。从小到大走一遍：没编过号的数，序号是「已经编过的个数 + 1」；编过的就跳过——相等的数序号相同。',
          { viz: { kind: 'grid', title: '编号', frames: trace.rank([37, 12, 28, 9, 100, 56, 80, 5, 12]).slice(0, 10) } },
        ],
        ops: {
          python: code(
            ['\n        rank = {}', '「数 → 序号」的表。'],
            ['\n        for x in sorted(arr):', '`sorted` 返回一个排好序的新列表，原来的 arr 不变。'],
            ['\n            if x not in rank:\n                rank[x] = len(rank) + 1', '第一次见到 x：表里已经有几个数，它就排在它们后面，序号是个数加一。见过的就不再编号。']
          ),
          c: code(
            ['\n    int* sorted = malloc(arrSize * sizeof(int));\n    memcpy(sorted, arr, arrSize * sizeof(int));', '复制一份：申请同样大的空间，把 arr 的字节整段复制过去。'],
            ['\n    qsort(sorted, arrSize, sizeof(int), cmp);', '对副本排序：告诉 qsort 数组在哪、几个元素、每个多大、怎么比较。'],
            ['\n    int count = 0;\n    for (int i = 0; i < arrSize; i++) {\n        int s = slotOf(sorted[i]);', '从小到大走，count 记已经编了几个号。先找这个数在表里的格子。'],
            ['\n        if (!table[s].used) {\n            table[s].used = true;\n            table[s].key = sorted[i];\n            table[s].val = ++count;\n        }\n    }', '格子是空的，说明第一次见到：编下一个号。`++count` 先加一再用。']
          ),
          cpp: code(
            ['\n        vector<int> sorted = arr;\n        sort(sorted.begin(), sorted.end());', '复制一份再排序：vector 赋值就是整份复制。'],
            ['\n        unordered_map<int, int> rank;', '「数 → 序号」的表。'],
            ['\n        for (int x : sorted) {\n            if (!rank.count(x)) {\n                int r = rank.size() + 1;\n                rank[x] = r;\n            }\n        }', '第一次见到 x：序号是表里已有的个数加一。先算好 r 再放进去——`rank[x]` 这一下就会把 x 加进表，表的大小会变。']
          ),
          java: code(
            ['\n        int[] sorted = arr.clone();\n        Arrays.sort(sorted);', '`clone` 复制一份数组，再排序。'],
            ['\n        Map<Integer, Integer> rank = new HashMap<>();', '「数 → 序号」的表。'],
            ['\n        for (int x : sorted) {\n            rank.putIfAbsent(x, rank.size() + 1);\n        }', '`putIfAbsent`：表里还没有 x 才放进去。参数在调用之前就算好了，所以 `rank.size() + 1` 是放进去之前的个数加一。']
          ),
          rust: code(
            ['\n        let mut sorted = arr.clone();\n        sorted.sort();', '复制一份再排序。'],
            ['\n        let mut rank = HashMap::new();', '「数 → 序号」的表。'],
            ['\n        for &x in &sorted {\n            let r = rank.len() as i32 + 1;\n            rank.entry(x).or_insert(r);\n        }', '`entry(x).or_insert(r)`：表里还没有 x 才放进 r，有了就不动。r 在放之前算好。']
          ),
        },
        sayBy: {
          python: [py('sorted(iterable)', 'library/functions.html#sorted', 'Return a new sorted list from the items in iterable.', '用可迭代对象里的元素返回一个新的、排好序的列表。')],
          java: [javadoc('Arrays.sort(int[] a)', 'java/util/Arrays.html#sort(int%5B%5D)', 'Sorts the specified array into ascending numerical order.', '把指定的数组按数值升序排好。')],
        },
      },
      {
        section: '写代码',
        title: '按原顺序查表',
        say: ['每个不同的数都有序号了。按原数组的顺序，一个个去表里查。'],
        ops: {
          python: code(['\n        return [rank[x] for x in arr]', '对原数组里的每个 x 查表，收集成新列表。']),
          c: code(
            ['\n    int* res = malloc(arrSize * sizeof(int));\n    for (int i = 0; i < arrSize; i++) {\n        res[i] = table[slotOf(arr[i])].val;\n    }', '对原数组里的每个数查表。'],
            ['\n    free(sorted);\n    *returnSize = arrSize;\n    return res;\n}', '副本用完了，释放；返回结果。']
          ),
          cpp: code(['\n        vector<int> res;\n        for (int x : arr) {\n            res.push_back(rank[x]);\n        }\n        return res;\n    }\n};', '对原数组里的每个数查表。']),
          java: code(['\n        int[] res = new int[arr.length];\n        for (int i = 0; i < arr.length; i++) {\n            res[i] = rank.get(arr[i]);\n        }\n        return res;\n    }\n}', '对原数组里的每个数查表。']),
          rust: code(['\n        arr.iter().map(|x| rank[x]).collect()\n    }\n}', '对原数组里的每个数查表：`rank[x]` 用键直接取值，键不在表里会报错，这里一定在。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['三个样例，第二个全是相同的数，序号都是 1。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().arrayRankTransform([40, 10, 20, 30]))\n    print(Solution().arrayRankTransform([100, 100, 100]))\n    print(Solution().arrayRankTransform([37, 12, 28, 9, 100, 56, 80, 5, 12]))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* arr, int n) {\n    int size;\n    int* res = arrayRankTransform(arr, n, &size);', '写一个小函数，调用后按 `[4, 1, 2, 3]` 的格式打印。'],
            ['\n    printf("[");\n    for (int i = 0; i < size; i++) {\n        printf(i > 0 ? ", %d" : "%d", res[i]);\n    }\n    printf("]\\n");\n    free(res);\n}', '第一个数前面不加逗号；用完释放。'],
            ['\n\nint main(void) {\n    int a[] = {40, 10, 20, 30}, b[] = {100, 100, 100}, c[] = {37, 12, 28, 9, 100, 56, 80, 5, 12};\n    show(a, 4);\n    show(b, 3);\n    show(c, 9);\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{40, 10, 20, 30}, {100, 100, 100}, {37, 12, 28, 9, 100, 56, 80, 5, 12}};\n    for (auto& arr : cases) {\n        vector<int> res = Solution().arrayRankTransform(arr);\n        cout << "[";\n        for (size_t i = 0; i < res.size(); i++) {\n            cout << (i > 0 ? ", " : "") << res[i];\n        }\n        cout << "]" << endl;\n    }\n    return 0;\n}', '三个样例挨个跑，按 `[4, 1, 2, 3]` 的格式打印。']).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{40, 10, 20, 30}, {100, 100, 100}, {37, 12, 28, 9, 100, 56, 80, 5, 12}};\n        for (int[] arr : cases) {\n            System.out.println(Arrays.toString(new Solution().arrayRankTransform(arr)));\n        }\n    }\n}', '三个样例挨个跑。`Arrays` 文件开头已经导入了。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    for arr in [vec![40, 10, 20, 30], vec![100, 100, 100], vec![37, 12, 28, 9, 100, 56, 80, 5, 12]] {\n        println!("{:?}", Solution::array_rank_transform(arr));\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '排序决定了序号，哈希表把序号带回原来的位置。时间 O(n log n)，额外空间 O(n)。',
          '下一题「字母异位词分组」也要先找到一把「钥匙」：字母相同的单词，排好序以后完全一样，就拿它当哈希表的键来分组。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
