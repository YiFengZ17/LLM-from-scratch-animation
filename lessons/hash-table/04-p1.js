/*
 * 哈希表与数组 · 1 两数之和（简单）
 * 边走边记：走到 x 时问「target - x 见过没有」，见过就找到了；没见过就把 x → 下标记进表。
 * C 没有哈希表，这里用开放寻址自己写一个最小的。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cdoc, cppdoc, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.HT;

  const OUT = ['[0, 1]', '[1, 2]', '[0, 1]'];

  root.Catalog.addChapter('hash-table', {
    id: 'ht-1',
    label: '1',
    title: '两数之和',
    summary: '边走边记：走到 x 时问「target − x 见过没有」。哈希表把「见过没有」从 O(n) 变成 O(1)。',
    problem: { id: 1, level: 'easy', url: leetcode('two-sum') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出**和为目标值** `target` 的那**两个**整数，并返回它们的数组下标。你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。你可以按任意顺序返回答案。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`nums = [2, 7, 11, 15]`, `target = 9`', '`[0, 1]`', '2 + 7 = 9'],
                ['`nums = [3, 2, 4]`, `target = 6`', '`[1, 2]`', '2 + 4 = 6'],
                ['`nums = [3, 3]`, `target = 6`', '`[0, 1]`', ''],
              ],
            },
          },
          { list: ['`2 <= nums.length <= 10^4`', '`-10^9 <= nums[i] <= 10^9`', '`-10^9 <= target <= 10^9`', '只会存在一个有效答案'] },
          '<a href="' + leetcode('two-sum') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：边走边记',
        doc: [
          '两层循环试每一对，要 n² / 2 次。换个问法：走到 `nums[i] = x` 时，和它凑成 target 的另一个数一定是 `target - x`。所以只要问：**`target - x` 在前面出现过吗？在哪？**',
          '这正是哈希表擅长的问题。从左往右走，每走过一个数，就把「这个数 → 它的下标」记进表里。走到 x 时先查表：',
          {
            list: [
              '表里有 `target - x`：找到了，它的下标和 i 就是答案。',
              '没有：把 x → i 记进表，留给后面的数来找。',
            ],
          },
          '为什么先查后记？如果先把 x 记进去再查，x 可能找到它自己（比如 target = 6、x = 3），违反了「不能用两次相同的元素」。',
          { viz: { kind: 'array', title: '样例 2：target = 6', frames: trace.twoSum([3, 2, 4], 6) } },
          '每个数查一次、记一次，都是 O(1)，总时间 O(n)；表里最多 n 个数，额外空间 O(n)。顺便一提：target - x 最大是 10<sup>9</sup> - (-10<sup>9</sup>) = 2×10<sup>9</sup>，还在 32 位整数的范围（约 ±2.147×10<sup>9</sup>）里，不会溢出。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: [
          '函数收数组和目标值，返回两个下标。C 没有现成的哈希表，所以 C 版先花几行写一个最小的：一排格子，每格能放一个「键 → 值」；算出的格子被别的键占了，就看下一格（开放寻址）。',
        ],
        ops: {
          python: code(
            ['class Solution:', '力扣要求把解法放进 `Solution` 类里。'],
            ['\n    def twoSum(self, nums: list[int], target: int) -> list[int]:', '题目给的方法：返回两个下标组成的列表。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `printf`、`malloc`、`bool`，以及清空表用的 `memset`。'],
            ['\n\n#define CAP 32768', '表的格子数。数最多 10<sup>4</sup> 个，格子要比它多一倍以上，冲突才少。取 2<sup>15</sup> = 32768。'],
            ['\n\ntypedef struct {\n    int key;\n    int val;\n    bool used;\n} Slot;', '一个格子放三样东西：键（数组里的数）、值（它的下标）、这格有没有被用过。`typedef` 给这个结构体起名叫 `Slot`。'],
            ['\n\nstatic Slot table[CAP];', '整张表。3 万多个格子放在静态存储区；`static` 表示只在这个文件里用。'],
            ['\n\nstatic int slotOf(int key) {', '核心的小函数：给一个键，返回它所在的格子；如果表里没有它，返回它该放的那个空格子。查和放都用它。'],
            ['\n    int h = ((key % CAP) + CAP) % CAP;', '哈希函数：取余数决定从哪一格开始找。C 里负数取余还是负数，先加一个 CAP 再取一次余，保证落在 0 到 CAP - 1。'],
            ['\n    while (table[h].used && table[h].key != key) {\n        h = (h + 1) % CAP;\n    }', '这格被别的键占了，就看下一格，到末尾再绕回开头。碰到空格子（没这个键）或者正好是这个键，就停下。'],
            ['\n    return h;\n}', '返回停下的格子。'],
            ['\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {', '力扣规定的 C 签名：返回数组指针，长度通过 `returnSize` 写回。'],
            ['\n    memset(table, 0, sizeof(table));', '表是静态的，上次调用留下的东西还在，先把所有字节清零：`used` 都变成 false。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;', '要用 `vector`、`cout`，以及哈希表 `unordered_map`。'],
            ['\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {', '题目给的方法：返回两个下标。']
          ),
          java: code(
            ['import java.util.HashMap;\nimport java.util.Map;', '要用哈希表 `HashMap`，先导入。'],
            ['\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {', '题目给的方法：返回两个下标组成的数组。']
          ),
          rust: code(
            ['use std::collections::HashMap;', 'Rust 的哈希表在标准库的 `collections` 里，用 `use` 引进来。'],
            ['\n\nstruct Solution;\n\nimpl Solution {\n    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {', '题目给的函数：返回两个下标组成的 `Vec<i32>`。']
          ),
        },
        sayBy: {
          c: [cdoc('memset(void *block, int c, size_t size)', 'Copying-Strings-and-Arrays.html', 'This function copies the value of c (converted to an unsigned char) into each of the first size bytes of the object beginning at block. It returns the value of block.', '这个函数把 c（转换成 unsigned char）复制到从 block 开始的对象的前 size 个字节里，返回 block。')],
        },
      },
      {
        section: '写代码',
        title: '准备一张「数 → 下标」的表',
        say: ['表的键是走过的数，值是它的下标。一开始一个数都没走过，表是空的。'],
        ops: {
          python: code(['\n        seen = {}', '空字典：键是走过的数，值是它的下标。']),
          c: code(['\n    int* ans = malloc(2 * sizeof(int));\n    *returnSize = 2;', 'C 的表已经清空了，这里先准备装答案的数组：两个下标，用 `malloc` 申请。']),
          cpp: code(['\n        unordered_map<int, int> seen;', '空的哈希表：键是走过的数，值是它的下标，都是 int。']),
          java: code(['\n        Map<Integer, Integer> seen = new HashMap<>();', '空的哈希表：键是走过的数，值是它的下标。泛型里写包装类 `Integer`。']),
          rust: code(['\n        let mut seen = HashMap::new();', '空的哈希表。键和值的类型不用写，Rust 会从后面怎么用推断出来。后面要往里放东西，加 `mut`。']),
        },
        sayBy: {
          python: [py('dict', 'library/stdtypes.html#mapping-types-dict', 'A mapping object maps hashable values to arbitrary objects.', '映射对象把可哈希的值映射到任意对象。')],
          cpp: [cppdoc('unordered_map', 'unord.map.overview', 'An unordered_map is an unordered associative container that supports unique keys (an unordered_map contains at most one of each key value) and that associates values of another type mapped_type with the keys.', 'unordered_map 是无序的关联容器，键唯一（每个键值最多出现一次），并给每个键关联一个 mapped_type 类型的值。')],
          java: [javadoc('HashMap', 'java/util/HashMap.html', 'Hash table based implementation of the Map interface.', '基于哈希表的 Map 接口实现。')],
        },
      },
      {
        section: '写代码',
        title: '走到 x：先查 target − x，再记下 x',
        say: [
          '从左往右走。走到 x 时，先问表里有没有 `target - x`：有，就把它的下标和 i 交回去；没有，把 x 和它的下标记进表，继续往后走。先查后记，x 就不会和自己配对。',
          { viz: { kind: 'array', title: '先查后记', frames: trace.twoSum([3, 2, 4], 6) } },
        ],
        ops: {
          python: code(
            ['\n        for i, x in enumerate(nums):', '既要数 x，又要它的下标 i，`enumerate` 一次把两个都给出来。'],
            ['\n            need = target - x', '和 x 凑成 target 的另一个数。'],
            ['\n            if need in seen:\n                return [seen[need], i]', '`in` 问字典里有没有这个键，平均一步就能回答。有，就把它记下的下标和 i 一起返回。'],
            ['\n            seen[x] = i', '没找到：把 x → i 记进表，留给后面的数来找。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {', '从左往右走。'],
            ['\n        int s = slotOf(target - nums[i]);', '去表里找 target - nums[i]。slotOf 返回它所在的格子，或者「它本该在」的空格子。'],
            ['\n        if (table[s].used) {\n            ans[0] = table[s].val;\n            ans[1] = i;\n            return ans;\n        }', '格子被用着，说明找到了这个键：它的下标和 i 就是答案。'],
            ['\n        s = slotOf(nums[i]);\n        table[s].used = true;\n        table[s].key = nums[i];\n        table[s].val = i;\n    }', '没找到：把 nums[i] → i 放进表。先用 slotOf 找到它该放的格子，再把三样东西写进去。']
          ),
          cpp: code(
            ['\n        for (int i = 0; i < (int)nums.size(); i++) {', '从左往右走。'],
            ['\n            int need = target - nums[i];', '和 nums[i] 凑成 target 的另一个数。'],
            ['\n            if (seen.count(need)) {\n                return {seen[need], i};\n            }', '`count` 返回这个键有几个（0 或 1），不是 0 就是找到了。返回时花括号会自动变成 vector。'],
            ['\n            seen[nums[i]] = i;\n        }', '没找到：把 nums[i] → i 记进表。']
          ),
          java: code(
            ['\n        for (int i = 0; i < nums.length; i++) {', '从左往右走。'],
            ['\n            int need = target - nums[i];', '和 nums[i] 凑成 target 的另一个数。'],
            ['\n            if (seen.containsKey(need)) {\n                return new int[]{seen.get(need), i};\n            }', '`containsKey` 问表里有没有这个键；有，就用 `get` 取出它的下标，和 i 一起返回。'],
            ['\n            seen.put(nums[i], i);\n        }', '没找到：`put` 把 nums[i] → i 放进表。']
          ),
          rust: code(
            ['\n        for (i, &x) in nums.iter().enumerate() {', '`enumerate` 同时给出下标 i 和元素；元素是引用，写成 `&x` 直接拿到数。'],
            ['\n            if let Some(&j) = seen.get(&(target - x)) {\n                return vec![j as i32, i as i32];\n            }', '`get` 查键，找到返回 `Some(值的引用)`，找不到返回 `None`。`if let` 只在是 Some 时进去，顺便把下标拆成 j。下标是 usize，返回前转成 i32。'],
            ['\n            seen.insert(x, i);\n        }', '没找到：把 x → i 放进表。到这里 Rust 就知道了表的键是 i32、值是 usize。']
          ),
        },
        sayBy: {
          python: [py('key in d', 'library/stdtypes.html#mapping-types-dict', 'Return True if d has a key key, else False.', '如果 d 里有键 key，返回 True，否则返回 False。')],
          java: [javadoc('Map.containsKey(Object key)', 'java/util/HashMap.html#containsKey(java.lang.Object)', 'Returns true if this map contains a mapping for the specified key.', '如果这个映射里有指定键的映射，返回 true。')],
          rust: [rustdoc('HashMap::get', 'collections/struct.HashMap.html#method.get', 'Returns a reference to the value corresponding to the key.', '返回这个键对应的值的引用。')],
        },
      },
      {
        section: '写代码',
        title: '收尾：没找到的情况',
        say: ['题目保证一定有答案，循环里一定会返回。但函数最后还是要有一个返回值，编译器才放心——返回一个空的。'],
        ops: {
          python: code(['\n        return []', '题目保证有答案，走不到这里；写上空列表，函数的每条路都有返回值。']),
          c: code(['\n    *returnSize = 0;\n    return ans;\n}', '走不到这里；如果真的没找到，告诉调用方长度是 0。']),
          cpp: code(['\n        return {};\n    }\n};', '走不到这里；返回空的 vector。']),
          java: code(['\n        return new int[0];\n    }\n}', '走不到这里；返回长度 0 的数组。']),
          rust: code(['\n        vec![]\n    }\n}', '走不到这里；返回空的 Vec。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：[0, 1]、[1, 2]、[0, 1]。第三个样例两个数相同，检验先查后记是对的。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().twoSum([2, 7, 11, 15], 9))\n    print(Solution().twoSum([3, 2, 4], 6))\n    print(Solution().twoSum([3, 3], 6))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(int* nums, int n, int target) {\n    int size;\n    int* ans = twoSum(nums, n, target, &size);', '写一个小函数：调用题目的函数，再按 `[0, 1]` 的格式打印。'],
            ['\n    printf("[%d, %d]\\n", ans[0], ans[1]);\n    free(ans);\n}', '打印两个下标，用完释放。'],
            ['\n\nint main(void) {\n    int a[] = {2, 7, 11, 15}, b[] = {3, 2, 4}, c[] = {3, 3};\n    show(a, 4, 9);\n    show(b, 3, 6);\n    show(c, 2, 6);\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(
            ['\n\nint main() {\n    vector<vector<int>> cases = {{2, 7, 11, 15}, {3, 2, 4}, {3, 3}};\n    int targets[] = {9, 6, 6};', '三组数组和目标值。'],
            ['\n    for (int k = 0; k < 3; k++) {\n        vector<int> ans = Solution().twoSum(cases[k], targets[k]);\n        cout << "[" << ans[0] << ", " << ans[1] << "]" << endl;\n    }\n    return 0;\n}', '逐个跑，按 `[0, 1]` 的格式打印。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口。'],
            ['\n        System.out.println(java.util.Arrays.toString(s.twoSum(new int[]{2, 7, 11, 15}, 9)));\n        System.out.println(java.util.Arrays.toString(s.twoSum(new int[]{3, 2, 4}, 6)));\n        System.out.println(java.util.Arrays.toString(s.twoSum(new int[]{3, 3}, 6)));\n    }\n}', '直接打印数组只会打出一串地址，`Arrays.toString` 把它变成 `[0, 1]` 这样的字符串。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(
            ['\n\nfn main() {\n    println!("{:?}", Solution::two_sum(vec![2, 7, 11, 15], 9));\n    println!("{:?}", Solution::two_sum(vec![3, 2, 4], 6));\n    println!("{:?}", Solution::two_sum(vec![3, 3], 6));\n}', '三个样例，用调试格式打印 Vec。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '把「找一个数」换成「查一下表」：边走边记，走到 x 时问 target − x 见过没有。时间 O(n)，额外空间 O(n)。C 版顺便写出了一个最小的哈希表：取余数定起点，被占了就看下一格。',
          '下一题「多数元素」先用哈希表数次数，再看一个连哈希表都不用的巧办法。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
