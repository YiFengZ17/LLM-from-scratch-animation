/*
 * 哈希表与数组 · 1431 拥有最多糖果的孩子（简单）
 * 数组热身：第一遍找最大值，第二遍逐个比较。顺便学会各语言怎么返回一个布尔数组。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cdoc } = root.LessonKit;
  const { trace } = root.HT;

  const OUT = {
    python: ['[True, True, True, False, True]', '[True, False, False, False, False]', '[True, False, True]'],
    other: ['[true, true, true, false, true]', '[true, false, false, false, false]', '[true, false, true]'],
  };

  root.Catalog.addChapter('hash-table', {
    id: 'ht-1431',
    label: '1431',
    title: '拥有最多糖果的孩子',
    summary: '数组热身：第一遍找出最多的糖果数，第二遍逐个看「加上额外的糖果够不够」。',
    problem: { id: 1431, level: 'easy', url: leetcode('kids-with-the-greatest-number-of-candies') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '有 n 个有糖果的孩子。给你一个数组 `candies`，其中 `candies[i]` 代表第 i 个孩子拥有的糖果数目，和一个整数 `extraCandies` 表示你所有的额外糖果的数量。返回一个长度为 n 的布尔数组 `result`：如果把所有的 `extraCandies` 给第 i 个孩子之后，他会拥有所有孩子中**最多**的糖果，那么 `result[i]` 为 `true`，否则为 `false`。注意，允许有多个孩子同时拥有最多的糖果数目。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`candies = [2, 3, 5, 1, 3]`, `extraCandies = 3`', '`[true, true, true, false, true]`'],
                ['`candies = [4, 2, 1, 1, 2]`, `extraCandies = 1`', '`[true, false, false, false, false]`'],
                ['`candies = [12, 1, 12]`, `extraCandies = 10`', '`[true, false, true]`'],
              ],
            },
          },
          { list: ['`n == candies.length`，`2 <= n <= 100`', '`1 <= candies[i] <= 100`', '`1 <= extraCandies <= 50`'] },
          '<a href="' + leetcode('kids-with-the-greatest-number-of-candies') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '把额外的糖果全给第 i 个孩子，别人的糖果数都没变。所以他能不能成为最多的，只要和**原来的最大值**比：`candies[i] + extraCandies >= 最大值`。（等于也算，题目允许并列最多。）',
          '直接的写法是对每个孩子都把所有人扫一遍找最大值，要 n² 次。但最大值对每个孩子都一样，**先算一次记下来**，之后每个孩子只比一次：',
          { viz: { kind: 'array', title: '样例 1：extraCandies = 3', frames: trace.candies([2, 3, 5, 1, 3], 3) } },
          '两遍扫描，时间 O(n)。这道题的另一个看点是返回值：要返回一个布尔数组，五种语言的写法各不相同。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收糖果数组和额外的糖果数，返回一个布尔数组：每个孩子一个 true 或 false。'],
        ops: {
          python: code(
            ['class Solution:', '力扣要求把解法放进 `Solution` 类里，先写类。'],
            ['\n    def kidsWithCandies(self, candies: list[int], extraCandies: int) -> list[bool]:', '题目给的方法：返回类型 `list[bool]` 是一个布尔值的列表。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>', '要用 `printf` 打印、`malloc` 申请返回的数组、`bool` 类型，先引入这三个头文件。'],
            ['\n\nbool* kidsWithCandies(int* candies, int candiesSize, int extraCandies, int* returnSize) {', '力扣规定的 C 签名：返回一个 bool 数组的指针。C 的数组不记长度，所以长度通过 `returnSize` 这个指针写回给调用方。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;', '要用 `vector`、找最大值的 `max_element` 和 `cout`。'],
            ['\n\nclass Solution {\npublic:\n    vector<bool> kidsWithCandies(vector<int>& candies, int extraCandies) {', '先写 `Solution` 类，方法返回 `vector<bool>`。']
          ),
          java: code(
            ['import java.util.ArrayList;\nimport java.util.List;', '返回值是 `List<Boolean>`，要用 List 和 ArrayList，先导入。'],
            ['\n\nclass Solution {\n    public List<Boolean> kidsWithCandies(int[] candies, int extraCandies) {', '先写 `Solution` 类。泛型里不能写基本类型 boolean，要写它的包装类 `Boolean`。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {', '本地运行要先声明 `Solution`，再在 `impl` 块里写函数。'],
            ['\n    pub fn kids_with_candies(candies: Vec<i32>, extra_candies: i32) -> Vec<bool> {', '题目给的函数：返回 `Vec<bool>`。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第一遍：找最大值',
        say: ['每个孩子都要和同一个最大值比，所以先把最大值算出来存好。'],
        ops: {
          python: code(['\n        most = max(candies)', '`max` 把整个列表看一遍，返回最大的那个，就是第一遍扫描。起名 `most` 而不是 `max`，免得盖住内置函数。']),
          c: code(
            ['\n    int most = candies[0];', '先拿第一个孩子的糖果数当最大值。'],
            ['\n    for (int i = 1; i < candiesSize; i++) {\n        if (candies[i] > most) {\n            most = candies[i];\n        }\n    }', '再看剩下的每个孩子，比目前的最大值大就换成他的。']
          ),
          cpp: code(['\n        int most = *max_element(candies.begin(), candies.end());', '`max_element` 在开头到结尾之间找最大的元素，返回指向它的迭代器，前面加 `*` 取出值。']),
          java: code(
            ['\n        int most = candies[0];', '先拿第一个孩子的糖果数当最大值。'],
            ['\n        for (int c : candies) {\n            most = Math.max(most, c);\n        }', '再把每个孩子都看一遍，留下大的。']
          ),
          rust: code(['\n        let most = *candies.iter().max().unwrap();', '`iter().max()` 找最大的元素。数组可能是空的，所以它返回的是 `Option`：有值是 `Some`，空数组是 `None`。题目保证至少两个孩子，用 `unwrap()` 直接取出来，再用 `*` 从引用里拿出数。']),
        },
        sayBy: {
          python: [py('max(iterable)', 'library/functions.html#max', 'Return the largest item in an iterable or the largest of two or more arguments.', '返回可迭代对象里最大的一项，或者两个及以上参数里最大的那个。')],
        },
      },
      {
        section: '写代码',
        title: '第二遍：每个孩子比一次',
        say: [
          '有了最大值，每个孩子只要算一下：加上额外的糖果以后，到没到最大值。每个孩子得出一个 true 或 false，按顺序放进结果里。',
          { viz: { kind: 'array', title: '第二遍', frames: trace.candies([2, 3, 5, 1, 3], 3).slice(5) } },
        ],
        ops: {
          python: code(['\n        return [c + extraCandies >= most for c in candies]', '列表推导式：对 candies 里的每个 c，算出 `c + extraCandies >= most` 这个比较的结果，收集成一个新列表。比较本身就是布尔值，不用再写 if。']),
          c: code(
            ['\n    bool* res = malloc(candiesSize * sizeof(bool));\n    *returnSize = candiesSize;', '结果数组要在函数结束后还能用，所以用 `malloc` 申请，长度和孩子数一样，并把长度写回去。'],
            ['\n    for (int i = 0; i < candiesSize; i++) {\n        res[i] = candies[i] + extraCandies >= most;\n    }', '每个孩子比一次，比较的结果直接存进去。'],
            ['\n    return res;\n}', '返回结果数组，用完由调用方释放。']
          ),
          cpp: code(
            ['\n        vector<bool> res;', '结果先空着。'],
            ['\n        for (int c : candies) {\n            res.push_back(c + extraCandies >= most);\n        }', '每个孩子比一次，结果放到末尾。'],
            ['\n        return res;\n    }\n};', '返回结果。']
          ),
          java: code(
            ['\n        List<Boolean> res = new ArrayList<>();', '结果先空着。'],
            ['\n        for (int c : candies) {\n            res.add(c + extraCandies >= most);\n        }', '每个孩子比一次，结果加到末尾。boolean 会自动装箱成 Boolean。'],
            ['\n        return res;\n    }\n}', '返回结果。']
          ),
          rust: code(['\n        candies.iter().map(|&c| c + extra_candies >= most).collect()\n    }\n}', '`map` 把每个糖果数换成比较的结果，`collect` 收集成返回类型 `Vec<bool>`。`|&c|` 是闭包的参数，`&` 把引用里的数直接拆出来。']),
        },
        sayBy: {
          c: [cdoc('malloc(size_t size)', 'Basic-Allocation.html', 'This function returns a pointer to a newly allocated block size bytes long, or a null pointer (setting errno) if the block could not be allocated.', '这个函数返回一个指针，指向新申请的、长 size 个字节的内存块；申请不到时返回空指针（并设置 errno）。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['三个样例，打印成 `[true, false, …]` 的样子。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口来调用刚写的方法。'],
            ['\n    print(Solution().kidsWithCandies([2, 3, 5, 1, 3], 3))\n    print(Solution().kidsWithCandies([4, 2, 1, 1, 2], 1))\n    print(Solution().kidsWithCandies([12, 1, 12], 10))', '三个样例。Python 的布尔值打印出来首字母大写。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT.python }]),
          c: code(
            ['\n\nvoid show(int* candies, int n, int extra) {', '三个样例都要按 `[true, …]` 的格式打印，写一个小函数来做。'],
            ['\n    int size;\n    bool* res = kidsWithCandies(candies, n, extra, &size);', '调用题目的函数，长度写进 size。'],
            ['\n    printf("[");\n    for (int i = 0; i < size; i++) {\n        printf("%s%s", i > 0 ? ", " : "", res[i] ? "true" : "false");\n    }\n    printf("]\\n");', '逐个打印，第一个前面不加逗号。`printf` 没有布尔值的格式，就选出 "true" 或 "false" 字符串用 `%s` 打印。'],
            ['\n    free(res);\n}', '结果数组用完释放。'],
            ['\n\nint main(void) {\n    int a[] = {2, 3, 5, 1, 3}, b[] = {4, 2, 1, 1, 2}, c[] = {12, 1, 12};\n    show(a, 5, 3);\n    show(b, 5, 1);\n    show(c, 3, 10);\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT.other }]),
          cpp: code(
            ['\n\nvoid show(vector<int> candies, int extra) {\n    vector<bool> res = Solution().kidsWithCandies(candies, extra);', '写一个小函数按 `[true, …]` 的格式打印。'],
            ['\n    cout << "[";\n    for (size_t i = 0; i < res.size(); i++) {\n        cout << (i > 0 ? ", " : "") << (res[i] ? "true" : "false");\n    }\n    cout << "]" << endl;\n}', '逐个打印，第一个前面不加逗号。'],
            ['\n\nint main() {\n    show({2, 3, 5, 1, 3}, 3);\n    show({4, 2, 1, 1, 2}, 1);\n    show({12, 1, 12}, 10);\n    return 0;\n}', '三个样例。花括号列表会自动变成 vector。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT.other }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口。'],
            ['\n        System.out.println(s.kidsWithCandies(new int[]{2, 3, 5, 1, 3}, 3));\n        System.out.println(s.kidsWithCandies(new int[]{4, 2, 1, 1, 2}, 1));\n        System.out.println(s.kidsWithCandies(new int[]{12, 1, 12}, 10));\n    }\n}', '三个样例。List 直接打印就是 `[true, …]` 的样子。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: OUT.other }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{:?}", Solution::kids_with_candies(vec![2, 3, 5, 1, 3], 3));\n    println!("{:?}", Solution::kids_with_candies(vec![4, 2, 1, 1, 2], 1));\n    println!("{:?}", Solution::kids_with_candies(vec![12, 1, 12], 10));\n}', '三个样例，`{:?}` 用调试格式打印整个 Vec。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: OUT.other }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '「对每个元素都要用到的东西」，先算一次存起来。两遍扫描，时间 O(n)。',
          '下一题「赎金信」开始数东西：每个字母有几个。字母只有 26 个，一个长 26 的数组就是一张哈希表。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
