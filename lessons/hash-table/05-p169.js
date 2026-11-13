/*
 * 哈希表与数组 · 169 多数元素（简单）
 * 先想到用哈希表数次数（O(n) 空间），再追问能不能不用额外空间：两两抵消的投票法。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.HT;

  const NUMS = [2, 2, 1, 1, 1, 2, 2];

  // 思路页里展示的计数写法（没有开额外空间限制时最自然的做法）
  const COUNTING = {
    python: [
      'cnt = {}',
      'for x in nums:',
      '    cnt[x] = cnt.get(x, 0) + 1',
      '    if cnt[x] > len(nums) // 2:',
      '        return x',
    ].join('\n'),
    c: '// C 要先自己写一个哈希表（见上一题），这里略过',
    cpp: [
      'unordered_map<int, int> cnt;',
      'for (int x : nums) {',
      '    if (++cnt[x] > (int)nums.size() / 2) {',
      '        return x;',
      '    }',
      '}',
    ].join('\n'),
    java: [
      'Map<Integer, Integer> cnt = new HashMap<>();',
      'for (int x : nums) {',
      '    cnt.put(x, cnt.getOrDefault(x, 0) + 1);',
      '    if (cnt.get(x) > nums.length / 2) {',
      '        return x;',
      '    }',
      '}',
    ].join('\n'),
    rust: [
      'let mut cnt = HashMap::new();',
      'for &x in &nums {',
      '    let c = cnt.entry(x).or_insert(0);',
      '    *c += 1;',
      '    if *c > nums.len() / 2 {',
      '        return x;',
      '    }',
      '}',
    ].join('\n'),
  };

  root.Catalog.addChapter('hash-table', {
    id: 'ht-169',
    label: '169',
    title: '多数元素',
    summary: '用哈希表数次数是 O(n) 空间；投票法让不同的数两两抵消，多数元素一定能活到最后，只要两个变量。',
    problem: { id: 169, level: 'easy', url: leetcode('majority-element') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个大小为 n 的数组 `nums`，返回其中的多数元素。多数元素是指在数组中出现次数**大于** ⌊n/2⌋ 的元素。你可以假设数组是非空的，并且给定的数组总是存在多数元素。',
          '进阶：尝试设计时间复杂度为 O(n)、空间复杂度为 O(1) 的算法解决此问题。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[3, 2, 3]`', '`3`'],
                ['`[2, 2, 1, 1, 1, 2, 2]`', '`2`'],
              ],
            },
          },
          { list: ['`n == nums.length`', '`1 <= n <= 5 * 10^4`', '`-10^9 <= nums[i] <= 10^9`'] },
          '<a href="' + leetcode('majority-element') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路一：数次数',
        doc: [
          '最直接的想法：数一数每个数出现了几次，谁超过一半就是谁。数的范围是 ±10<sup>9</sup>，开不了那么大的数组，用哈希表当计数表：键是数，值是次数。',
          { code: COUNTING },
          '时间 O(n)，但表里可能存进很多不同的数，额外空间 O(n)。题目的进阶要求 O(1) 空间——只能用几个变量。还能更省吗？',
        ],
      },
      {
        section: '题目与思路',
        title: '思路二：两两抵消',
        doc: [
          '想象一场投票：每次拿出两个**不同**的数，让它们同归于尽。多数元素的个数超过一半，就算每一个都被别的数抵消，别的数也不够用——**最后剩下来的一定是它**。',
          '写成代码只要两个变量：「候选人」和「票数」。从左往右看：',
          {
            list: [
              '票数是 0：没有候选人，当前这个数当候选人。',
              '和候选人相同：票数加一。',
              '和候选人不同：两者抵消，票数减一。',
            ],
          },
          { viz: { kind: 'array', title: '样例 2', frames: trace.vote(NUMS) } },
          '票数减到 0 时，前面那一段里候选人和别的数正好一对对抵消光了，扔掉这一段，多数元素在剩下的部分里仍然超过一半。所以最后留下的候选人就是答案。',
          '一遍扫描，时间 O(n)；只用两个变量，额外空间 O(1)。这个方法叫 Boyer–Moore 投票算法。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，候选人和票数',
        say: ['函数收数组，返回多数元素。按投票法，只需要两个变量：候选人和票数，票数从 0 开始。'],
        ops: {
          python: code(
            ['class Solution:\n    def majorityElement(self, nums: list[int]) -> int:', '照例写类和方法。'],
            ['\n        candidate, count = None, 0', '一开始还没有候选人，用 `None` 表示；票数 0。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint majorityElement(int* nums, int numsSize) {', '题目给的函数。'],
            ['\n    int candidate = 0, count = 0;', '候选人先随便给个 0：票数是 0 时，第一个数就会把它换掉。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int majorityElement(vector<int>& nums) {', '照例的架子。'],
            ['\n        int candidate = 0, count = 0;', '候选人先随便给个 0，票数 0 时会被第一个数换掉。']
          ),
          java: code(
            ['class Solution {\n    public int majorityElement(int[] nums) {', '照例的架子。'],
            ['\n        int candidate = 0, count = 0;', '候选人先随便给个 0，票数 0 时会被第一个数换掉。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn majority_element(nums: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let (mut candidate, mut count) = (0, 0);', '候选人先随便给个 0，票数 0 时会被第一个数换掉。']
          ),
        },
      },
      {
        section: '写代码',
        title: '一个个投票',
        say: [
          '从左往右看每个数。票数是 0 就让它当候选人；然后和候选人相同加一票，不同减一票。',
          { viz: { kind: 'array', title: '投票', frames: trace.vote(NUMS) } },
        ],
        ops: {
          python: code(
            ['\n        for x in nums:', '每个数投一次票。'],
            ['\n            if count == 0:\n                candidate = x', '票数是 0：前面的都抵消光了，没有候选人，让 x 当候选人。'],
            ['\n            count += 1 if x == candidate else -1', '和候选人相同加一，不同减一。`甲 if 条件 else 乙` 是条件表达式。刚当上候选人的 x 和自己相同，所以会得到 1 票。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {', '每个数投一次票。'],
            ['\n        if (count == 0) {\n            candidate = nums[i];\n        }', '票数是 0：没有候选人，让当前的数当候选人。'],
            ['\n        count += nums[i] == candidate ? 1 : -1;\n    }', '和候选人相同加一，不同减一。']
          ),
          cpp: code(
            ['\n        for (int x : nums) {', '每个数投一次票。'],
            ['\n            if (count == 0) {\n                candidate = x;\n            }', '票数是 0：让 x 当候选人。'],
            ['\n            count += x == candidate ? 1 : -1;\n        }', '和候选人相同加一，不同减一。']
          ),
          java: code(
            ['\n        for (int x : nums) {', '每个数投一次票。'],
            ['\n            if (count == 0) {\n                candidate = x;\n            }', '票数是 0：让 x 当候选人。'],
            ['\n            count += x == candidate ? 1 : -1;\n        }', '和候选人相同加一，不同减一。']
          ),
          rust: code(
            ['\n        for &x in &nums {', '每个数投一次票。'],
            ['\n            if count == 0 {\n                candidate = x;\n            }', '票数是 0：让 x 当候选人。'],
            ['\n            count += if x == candidate { 1 } else { -1 };\n        }', 'Rust 没有 `? :`，用 `if` 表达式代替：相同加一，不同减一。']
          ),
        },
      },
      {
        section: '写代码',
        title: '留下来的就是答案',
        say: ['走完一遍，候选人就是多数元素。题目保证一定存在，不用再数一遍确认。'],
        ops: {
          python: code(['\n        return candidate', '活到最后的候选人。']),
          c: code(['\n    return candidate;\n}', '活到最后的候选人。']),
          cpp: code(['\n        return candidate;\n    }\n};', '活到最后的候选人。']),
          java: code(['\n        return candidate;\n    }\n}', '活到最后的候选人。']),
          rust: code(['\n        candidate\n    }\n}', '活到最后的候选人。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试一个',
        say: ['预期：3 和 2。再试 `[1, 1, 2, 3, 1]`：1 出现 3 次，超过一半，应该得 1。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[3, 2, 3], [2, 2, 1, 1, 1, 2, 2], [1, 1, 2, 3, 1]]:\n        print(Solution().majorityElement(nums))', '三组输入挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['3', '2', '1'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {3, 2, 3}, b[] = {2, 2, 1, 1, 1, 2, 2}, c[] = {1, 1, 2, 3, 1};\n    printf("%d\\n%d\\n%d\\n", majorityElement(a, 3), majorityElement(b, 7), majorityElement(c, 5));\n    return 0;\n}', '三组输入。']).concat([{ pause: 500 }, { run: RUN.c, output: ['3', '2', '1'] }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{3, 2, 3}, {2, 2, 1, 1, 1, 2, 2}, {1, 1, 2, 3, 1}};\n    for (auto& nums : cases) {\n        cout << Solution().majorityElement(nums) << endl;\n    }\n    return 0;\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['3', '2', '1'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{3, 2, 3}, {2, 2, 1, 1, 1, 2, 2}, {1, 1, 2, 3, 1}};\n        for (int[] nums : cases) {\n            System.out.println(new Solution().majorityElement(nums));\n        }\n    }\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['3', '2', '1'] }]),
          rust: code(['\n\nfn main() {\n    for nums in [vec![3, 2, 3], vec![2, 2, 1, 1, 1, 2, 2], vec![1, 1, 2, 3, 1]] {\n        println!("{}", Solution::majority_element(nums));\n    }\n}', '三组输入挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['3', '2', '1'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '先想到哈希表计数（O(n) 空间），再追问能不能更省：利用「超过一半」这个条件，两两抵消，只要两个变量。时间 O(n)，额外空间 O(1)。',
          '下一题也要求不开额外空间，但办法不同：数都在 1 到 n 之间，就把数组自己当成记号板。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
