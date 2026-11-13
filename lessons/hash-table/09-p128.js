/*
 * 哈希表与数组 · 128 最长连续序列（中等）
 * 所有数放进哈希集合。只从「一段的开头」（x - 1 不在集合里）往上数，每个数最多被数一次，O(n)。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cppdoc, rustdoc } = root.LessonKit;
  const { trace } = root.HT;

  const NUMS = [100, 4, 200, 1, 3, 2];

  root.Catalog.addChapter('hash-table', {
    id: 'ht-128',
    label: '128',
    title: '最长连续序列',
    summary: '数放进集合，「在不在」一步就能问。只从一段的开头往上数，每个数最多被数一次，整体 O(n)。',
    problem: { id: 128, level: 'medium', url: leetcode('longest-consecutive-sequence') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个未排序的整数数组 `nums`，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。请你设计并实现时间复杂度为 O(n) 的算法解决此问题。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[100, 4, 200, 1, 3, 2]`', '`4`', '1, 2, 3, 4'],
                ['`[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]`', '`9`', '0 到 8'],
                ['`[1, 0, 1, 2]`', '`3`', '0, 1, 2'],
              ],
            },
          },
          { list: ['`0 <= nums.length <= 10^5`', '`-10^9 <= nums[i] <= 10^9`'] },
          '<a href="' + leetcode('longest-consecutive-sequence') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：只从开头数',
        doc: [
          '排个序再数连续的段，要 O(n log n)，题目要求 O(n)。',
          '换个做法：把所有数放进**哈希集合**，之后问「某个数在不在」只要 O(1)。对每个数 x，就能一直问 x+1 在不在、x+2 在不在……数出从 x 开始的一段有多长。',
          '但如果每个数都这样往上数，一段 1、2、3、4 会从 1 数一遍、从 2 数一遍、从 3 数一遍……又变成 O(n²)。关键的一步：**只从一段的开头开始数**。x 是开头，当且仅当 **x - 1 不在集合里**；否则 x 一定会在从开头数的时候被数到，跳过它。',
          { viz: { kind: 'array', title: '样例 1', frames: trace.consecutive(NUMS) } },
          '每一段只从开头数一次，每个数最多被「往上数」碰到一次，总时间 O(n)；集合占 O(n) 空间。还有一个细节：遍历的是**集合**而不是原数组，重复的数只看一次。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，把所有数放进集合',
        say: ['函数收数组，返回最长长度。第一步把所有数放进哈希集合。C 版的集合只要键、不要值，格子里放「数」和「用了没有」。'],
        ops: {
          python: code(
            ['class Solution:\n    def longestConsecutive(self, nums: list[int]) -> int:', '照例写类和方法。'],
            ['\n        seen = set(nums)', '`set(nums)` 把所有数放进集合，重复的只留一个。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `bool` 和 `memset`。'],
            ['\n\n#define CAP 262144\n\ntypedef struct {\n    int key;\n    bool used;\n} Slot;\n\nstatic Slot table[CAP];', '集合的格子只放数和「用了没有」。数最多 10<sup>5</sup> 个，格子开 2<sup>18</sup>。'],
            ['\n\nstatic int slotOf(int key) {\n    int h = ((key % CAP) + CAP) % CAP;\n    while (table[h].used && table[h].key != key) {\n        h = (h + 1) % CAP;\n    }\n    return h;\n}', '和前几题一样的找格子函数。'],
            ['\n\nstatic bool has(int key) {\n    return table[slotOf(key)].used;\n}', '「在不在」要问很多次，包成一个小函数：找到的格子被用着，就是在。'],
            ['\n\nint longestConsecutive(int* nums, int numsSize) {\n    memset(table, 0, sizeof(table));', '题目给的函数。表是静态的，先清空。'],
            ['\n    for (int i = 0; i < numsSize; i++) {\n        int s = slotOf(nums[i]);\n        table[s].used = true;\n        table[s].key = nums[i];\n    }', '所有数放进集合。重复的数会找到同一格，再写一遍没关系。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <unordered_set>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestConsecutive(vector<int>& nums) {', '照例的架子，要用 `unordered_set` 和 `max`。'],
            ['\n        unordered_set<int> seen(nums.begin(), nums.end());', '用整个数组构造集合，重复的只留一个。']
          ),
          java: code(
            ['import java.util.HashSet;\nimport java.util.Set;\n\nclass Solution {\n    public int longestConsecutive(int[] nums) {', '照例的架子，要用 `HashSet`。'],
            ['\n        Set<Integer> seen = new HashSet<>();\n        for (int x : nums) {\n            seen.add(x);\n        }', '所有数放进集合，重复的只留一个。']
          ),
          rust: code(
            ['use std::collections::HashSet;\n\nstruct Solution;\n\nimpl Solution {\n    pub fn longest_consecutive(nums: Vec<i32>) -> i32 {', '照例的架子，要用 `HashSet`。'],
            ['\n        let seen: HashSet<i32> = nums.into_iter().collect();', '`into_iter()` 逐个拿出数，`collect` 收集成集合，重复的只留一个。']
          ),
        },
        sayBy: {
          python: [py('set', 'library/stdtypes.html#set-types-set-frozenset', 'A set object is an unordered collection of distinct hashable objects. Common uses include membership testing, removing duplicates from a sequence, …', '集合是由互不相同的可哈希对象组成的无序容器，常用来判断成员是否存在、给序列去重……')],
          cpp: [cppdoc('unordered_set', 'unord.set.overview', "An unordered_set is an unordered associative container that supports unique keys (an unordered_set contains at most one of each key value) and in which the elements' keys are the elements themselves.", 'unordered_set 是无序的关联容器，键是唯一的（每个键值最多出现一次），元素的键就是元素本身。')],
        },
      },
      {
        section: '写代码',
        title: '只从开头往上数',
        say: [
          '遍历集合里的每个数 x。x - 1 也在集合里，说明 x 不是开头，跳过。是开头的话，就一直问 x + 1、x + 2……在不在，数到断为止，更新最长长度。',
          { viz: { kind: 'array', title: '只从开头数', frames: trace.consecutive(NUMS) } },
        ],
        ops: {
          python: code(
            ['\n        best = 0', '最长长度。空数组时就是 0。'],
            ['\n        for x in seen:', '遍历集合，重复的数只看一次。'],
            ['\n            if x - 1 not in seen:', 'x - 1 不在集合里，x 才是一段的开头。'],
            ['\n                y = x\n                while y + 1 in seen:\n                    y += 1', '从 x 往上数：只要下一个数在，就继续。循环结束时 y 是这一段的结尾。'],
            ['\n                best = max(best, y - x + 1)', '这一段从 x 到 y，长度 y - x + 1。'],
            ['\n        return best', '最长的一段。']
          ),
          c: code(
            ['\n    int best = 0;', '最长长度。'],
            ['\n    for (int h = 0; h < CAP; h++) {\n        if (!table[h].used) {\n            continue;\n        }\n        int x = table[h].key;', '遍历集合：把表的每一格都看一遍，用着的格子里就是集合里的一个数。重复的数只占一格，只看一次。'],
            ['\n        if (has(x - 1)) {\n            continue;\n        }', 'x - 1 在集合里，x 不是开头，跳过。'],
            ['\n        int y = x;\n        while (has(y + 1)) {\n            y++;\n        }', '从 x 往上数到断为止。'],
            ['\n        if (y - x + 1 > best) {\n            best = y - x + 1;\n        }\n    }\n    return best;\n}', '更新最长长度。']
          ),
          cpp: code(
            ['\n        int best = 0;\n        for (int x : seen) {', '遍历集合。'],
            ['\n            if (!seen.count(x - 1)) {', 'x - 1 不在集合里，x 才是开头。'],
            ['\n                int y = x;\n                while (seen.count(y + 1)) {\n                    y++;\n                }', '从 x 往上数到断为止。'],
            ['\n                best = max(best, y - x + 1);\n            }\n        }\n        return best;\n    }\n};', '更新最长长度。']
          ),
          java: code(
            ['\n        int best = 0;\n        for (int x : seen) {', '遍历集合。'],
            ['\n            if (!seen.contains(x - 1)) {', 'x - 1 不在集合里，x 才是开头。'],
            ['\n                int y = x;\n                while (seen.contains(y + 1)) {\n                    y++;\n                }', '从 x 往上数到断为止。'],
            ['\n                best = Math.max(best, y - x + 1);\n            }\n        }\n        return best;\n    }\n}', '更新最长长度。']
          ),
          rust: code(
            ['\n        let mut best = 0;\n        for &x in &seen {', '遍历集合。'],
            ['\n            if !seen.contains(&(x - 1)) {', 'x - 1 不在集合里，x 才是开头。`contains` 要的是引用，所以写 `&(x - 1)`。'],
            ['\n                let mut y = x;\n                while seen.contains(&(y + 1)) {\n                    y += 1;\n                }', '从 x 往上数到断为止。'],
            ['\n                best = best.max(y - x + 1);\n            }\n        }\n        best\n    }\n}', '更新最长长度。']
          ),
        },
        sayBy: {
          rust: [rustdoc('HashSet::contains', 'collections/struct.HashSet.html#method.contains', 'Returns true if the set contains a value.', '如果集合里有这个值，返回 true。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试空数组',
        say: ['预期：4、9、3。再试空数组，应该是 0。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[100, 4, 200, 1, 3, 2], [0, 3, 7, 2, 5, 8, 4, 6, 0, 1], [1, 0, 1, 2], []]:\n        print(Solution().longestConsecutive(nums))', '三个样例和一个空数组。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['4', '9', '3', '0'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {100, 4, 200, 1, 3, 2}, b[] = {0, 3, 7, 2, 5, 8, 4, 6, 0, 1}, c[] = {1, 0, 1, 2};\n    printf("%d\\n%d\\n%d\\n", longestConsecutive(a, 6), longestConsecutive(b, 10), longestConsecutive(c, 4));\n    printf("%d\\n", longestConsecutive(NULL, 0));\n    return 0;\n}', '三个样例；空数组传一个空指针、长度 0。']).concat([{ pause: 500 }, { run: RUN.c, output: ['4', '9', '3', '0'] }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{100, 4, 200, 1, 3, 2}, {0, 3, 7, 2, 5, 8, 4, 6, 0, 1}, {1, 0, 1, 2}, {}};\n    for (auto& nums : cases) {\n        cout << Solution().longestConsecutive(nums) << endl;\n    }\n    return 0;\n}', '三个样例和一个空数组。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['4', '9', '3', '0'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{100, 4, 200, 1, 3, 2}, {0, 3, 7, 2, 5, 8, 4, 6, 0, 1}, {1, 0, 1, 2}, {}};\n        for (int[] nums : cases) {\n            System.out.println(new Solution().longestConsecutive(nums));\n        }\n    }\n}', '三个样例和一个空数组。']).concat([{ pause: 500 }, { run: RUN.java, output: ['4', '9', '3', '0'] }]),
          rust: code(['\n\nfn main() {\n    for nums in [vec![100, 4, 200, 1, 3, 2], vec![0, 3, 7, 2, 5, 8, 4, 6, 0, 1], vec![1, 0, 1, 2], vec![]] {\n        println!("{}", Solution::longest_consecutive(nums));\n    }\n}', '三个样例和一个空数组。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['4', '9', '3', '0'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '哈希集合让「在不在」变成 O(1)；「只从开头数」保证每个数只被数一次。两者合起来才是 O(n)。',
          '前面每道题都在用哈希表。最后一题「设计哈希集合」，自己动手实现一个：桶、哈希函数、冲突、删除，全部写出来。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
