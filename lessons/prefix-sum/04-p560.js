/*
 * 前缀和 · 560 和为 K 的子数组（中等）
 * 子数组和 = 两个前缀和之差。走到每个位置，查表里有几个前缀和等于 pre - k。数里有负数，滑动窗口不能用。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.PS;

  root.Catalog.addChapter('prefix-sum', {
    id: 'ps-560',
    label: '560',
    title: '和为 K 的子数组',
    summary: '和为 k 的一段，就是两个前缀和相差 k。边走边把前缀和记进哈希表，走到每个位置查一下「pre − k」出现过几次。',
    problem: { id: 560, level: 'medium', url: leetcode('subarray-sum-equals-k') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个整数数组 `nums` 和一个整数 `k`，请你统计并返回该数组中**和为 k 的子数组的个数**。子数组是数组中元素的连续非空序列。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`nums = [1, 1, 1]`, `k = 2`', '`2`', '[1, 1] 出现在两个位置'],
                ['`nums = [1, 2, 3]`, `k = 3`', '`2`', '[1, 2] 和 [3]'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 2 * 10^4`', '`-1000 <= nums[i] <= 1000`', '`-10^7 <= k <= 10^7`'] },
          '<a href="' + leetcode('subarray-sum-equals-k') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：两个前缀和相差 k',
        doc: [
          '先想滑动窗口：窗口里的和大了就缩左边，小了就扩右边。可这题**有负数**，窗口变大和不一定变大，「和大了就缩」不再成立，滑动窗口用不了。',
          '用前缀和：`pre[j]` 是前 j 个数的和。一段 `nums[i..j-1]` 的和是 `pre[j] − pre[i]`。要它等于 k，就是：',
          '`pre[i] = pre[j] − k`',
          '所以从左往右走，每走到一个位置，算出当前前缀和 pre，然后问：**前面有几个前缀和正好等于 pre − k？** 每有一个，就有一段以这里结尾、和为 k 的子数组。',
          '「前面有几个等于某个值」用哈希表：键是前缀和，值是它出现了几次。一开始表里就要有 `{0: 1}`——空前缀的和是 0，这样从开头算起的子数组也能被数到。',
          { viz: { kind: 'array', title: 'nums = [1, -1, 0]，k = 0', frames: trace.subK([1, -1, 0], 0) } },
          '每个位置查一次、记一次，都是 O(1)，总时间 O(n)；表里最多 n + 1 个前缀和，额外空间 O(n)。注意先查后记：当前的前缀和不能和自己配成一段（那是一段空的子数组）。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：前缀和计数表',
        say: ['函数收数组和 k，返回个数。要一张「前缀和 → 出现次数」的表，一开始放进空前缀的 0；再准备当前前缀和与答案。C 版照哈希表模块的写法，自己写一个开放寻址的表。'],
        ops: {
          python: code(
            ['class Solution:\n    def subarraySum(self, nums: list[int], k: int) -> int:', '照例写类和方法。'],
            ['\n        cnt = {0: 1}', '前缀和 → 出现次数。空前缀的和是 0，先记一次，从开头算起的子数组才能被数到。'],
            ['\n        pre = ans = 0', '当前的前缀和，以及答案。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `bool` 和清空表用的 `memset`。'],
            ['\n\n#define CAP 65536\n\ntypedef struct {\n    int key;\n    int val;\n    bool used;\n} Slot;\n\nstatic Slot table[CAP];', '哈希表的格子：键是前缀和，值是次数。前缀和最多 n + 1 = 20001 种，格子开 2<sup>16</sup>，多一倍以上。'],
            ['\n\nstatic int slotOf(int key) {\n    int h = ((key % CAP) + CAP) % CAP;\n    while (table[h].used && table[h].key != key) {\n        h = (h + 1) % CAP;\n    }\n    return h;\n}', '和哈希表模块一样：取余数定起点，被别的键占了就看下一格。'],
            ['\n\nint subarraySum(int* nums, int numsSize, int k) {\n    memset(table, 0, sizeof(table));', '题目给的函数。表是静态的，先清空。'],
            ['\n    int s = slotOf(0);\n    table[s].used = true;\n    table[s].key = 0;\n    table[s].val = 1;', '空前缀的和 0 先记一次。'],
            ['\n    int pre = 0, ans = 0;', '当前的前缀和，以及答案。前缀和最大 2×10<sup>4</sup> × 1000 = 2×10<sup>7</sup>，int 装得下。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    int subarraySum(vector<int>& nums, int k) {', '照例的架子，要用 `unordered_map`。'],
            ['\n        unordered_map<int, int> cnt;\n        cnt[0] = 1;', '前缀和 → 出现次数，空前缀的 0 先记一次。'],
            ['\n        int pre = 0, ans = 0;', '当前的前缀和，以及答案。']
          ),
          java: code(
            ['import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int subarraySum(int[] nums, int k) {', '照例的架子，要用 `HashMap`。'],
            ['\n        Map<Integer, Integer> cnt = new HashMap<>();\n        cnt.put(0, 1);', '前缀和 → 出现次数，空前缀的 0 先记一次。'],
            ['\n        int pre = 0, ans = 0;', '当前的前缀和，以及答案。']
          ),
          rust: code(
            ['use std::collections::HashMap;\n\nstruct Solution;\n\nimpl Solution {\n    pub fn subarray_sum(nums: Vec<i32>, k: i32) -> i32 {', '照例的架子，要用 `HashMap`。'],
            ['\n        let mut cnt = HashMap::new();\n        cnt.insert(0, 1);', '前缀和 → 出现次数，空前缀的 0 先记一次。'],
            ['\n        let (mut pre, mut ans) = (0, 0);', '当前的前缀和，以及答案。']
          ),
        },
      },
      {
        section: '写代码',
        title: '每走一步：先查 pre − k，再记下 pre',
        say: [
          '从左往右，每加进一个数就得到新的前缀和 pre。先查表里有几个 pre − k，加进答案；再把 pre 自己记进表，留给后面的位置用。',
          { viz: { kind: 'array', title: '先查后记', frames: trace.subK([1, 1, 1], 2) } },
        ],
        ops: {
          python: code(
            ['\n        for x in nums:', '逐个数往前走。'],
            ['\n            pre += x', '前缀和加上这个数。'],
            ['\n            ans += cnt.get(pre - k, 0)', '前面有几个前缀和等于 pre − k，就有几段以这里结尾、和为 k 的子数组。`get` 的第二个参数是找不到时的默认值，没有就当 0 个。'],
            ['\n            cnt[pre] = cnt.get(pre, 0) + 1', '再把当前前缀和记进表：原来的次数（没有就是 0）加一。'],
            ['\n        return ans', '和为 k 的子数组个数。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {\n        pre += nums[i];', '逐个数往前走，前缀和加上它。'],
            ['\n        s = slotOf(pre - k);\n        if (table[s].used) {\n            ans += table[s].val;\n        }', '查 pre − k：格子被用着，说明出现过，加上它的次数。'],
            ['\n        s = slotOf(pre);\n        if (!table[s].used) {\n            table[s].used = true;\n            table[s].key = pre;\n            table[s].val = 0;\n        }\n        table[s].val++;\n    }', '再记下 pre：第一次见到就先占好格子、次数从 0 开始，然后次数加一。'],
            ['\n    return ans;\n}', '和为 k 的子数组个数。']
          ),
          cpp: code(
            ['\n        for (int x : nums) {\n            pre += x;', '逐个数往前走，前缀和加上它。'],
            ['\n            if (cnt.count(pre - k)) {\n                ans += cnt[pre - k];\n            }', '表里有 pre − k，就加上它出现的次数。先用 `count` 判断，免得 `cnt[…]` 顺手插进一个 0。'],
            ['\n            cnt[pre]++;\n        }\n        return ans;\n    }\n};', '再记下 pre：`cnt[pre]` 不存在时会先变成 0，再加一。']
          ),
          java: code(
            ['\n        for (int x : nums) {\n            pre += x;', '逐个数往前走，前缀和加上它。'],
            ['\n            ans += cnt.getOrDefault(pre - k, 0);', '`getOrDefault`：表里有就取次数，没有就当 0。'],
            ['\n            cnt.put(pre, cnt.getOrDefault(pre, 0) + 1);\n        }\n        return ans;\n    }\n}', '再记下 pre：原来的次数加一放回去。']
          ),
          rust: code(
            ['\n        for x in nums {\n            pre += x;', '逐个数往前走，前缀和加上它。'],
            ['\n            if let Some(&c) = cnt.get(&(pre - k)) {\n                ans += c;\n            }', '表里有 pre − k，就加上它出现的次数。'],
            ['\n            *cnt.entry(pre).or_insert(0) += 1;\n        }\n        ans\n    }\n}', '再记下 pre：`entry(pre).or_insert(0)` 拿到这个键的次数（没有就先放 0），返回的是可修改的引用，`*` 解开它再加一。']
          ),
        },
        sayBy: {
          python: [py('dict.get(key, default=None)', 'library/stdtypes.html#dict.get', 'Return the value for key if key is in the dictionary, else default.', '如果 key 在字典里，返回它对应的值，否则返回 default。')],
          java: [javadoc('Map.getOrDefault(Object key, V defaultValue)', 'java/util/Map.html#getOrDefault(java.lang.Object,V)', 'Returns the value to which the specified key is mapped, or defaultValue if this map contains no mapping for the key.', '返回指定键映射到的值；如果没有这个键，返回 defaultValue。')],
          rust: [rustdoc('Entry::or_insert', 'collections/hash_map/enum.Entry.html#method.or_insert', 'Ensures a value is in the entry by inserting the default if empty, and returns a mutable reference to the value in the entry.', '如果这个位置是空的，就放进默认值，保证里面有值；返回这个值的可修改引用。')],
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试有负数的',
        say: ['预期：2 和 2。再试 `[1, -1, 0]`、k = 0：[1, -1]、[0]、[1, -1, 0] 三段，应该是 3——这正是滑动窗口处理不了的情况。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().subarraySum([1, 1, 1], 2))\n    print(Solution().subarraySum([1, 2, 3], 3))\n    print(Solution().subarraySum([1, -1, 0], 0))', '两个样例和一个有负数的。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['2', '2', '3'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {1, 1, 1}, b[] = {1, 2, 3}, c[] = {1, -1, 0};\n    printf("%d\\n%d\\n%d\\n", subarraySum(a, 3, 2), subarraySum(b, 3, 3), subarraySum(c, 3, 0));\n    return 0;\n}', '两个样例和一个有负数的。']).concat([{ pause: 500 }, { run: RUN.c, output: ['2', '2', '3'] }]),
          cpp: code(['\n\nint main() {\n    vector<int> a = {1, 1, 1}, b = {1, 2, 3}, c = {1, -1, 0};\n    cout << Solution().subarraySum(a, 2) << endl << Solution().subarraySum(b, 3) << endl << Solution().subarraySum(c, 0) << endl;\n    return 0;\n}', '两个样例和一个有负数的。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['2', '2', '3'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();\n        System.out.println(s.subarraySum(new int[]{1, 1, 1}, 2));\n        System.out.println(s.subarraySum(new int[]{1, 2, 3}, 3));\n        System.out.println(s.subarraySum(new int[]{1, -1, 0}, 0));\n    }\n}', '两个样例和一个有负数的。']).concat([{ pause: 500 }, { run: RUN.java, output: ['2', '2', '3'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::subarray_sum(vec![1, 1, 1], 2));\n    println!("{}", Solution::subarray_sum(vec![1, 2, 3], 3));\n    println!("{}", Solution::subarray_sum(vec![1, -1, 0], 0));\n}', '两个样例和一个有负数的。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['2', '2', '3'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '「和为 k 的一段」变成「两个前缀和相差 k」，再用哈希表数「前面出现过几次」。有负数也不怕。时间 O(n)，额外空间 O(n)。',
          '最后一题「除了自身以外数组的乘积」换一个方向：不是两个前缀相减，而是把左边的前缀和右边的后缀拼起来。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
