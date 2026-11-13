/*
 * 动态规划 · 背包 · 416 分割等和子集（中等）
 * 0-1 背包：每个数只能用一次。一维表要从大往小更新，否则同一个数会被用两次。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, rustdoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-416',
    group: '背包',
    label: '416',
    title: '分割等和子集',
    summary: '能不能挑出一些数凑成总和的一半？每个数只能用一次：一维表要从大往小更新。',
    problem: { id: 416, level: 'medium', url: leetcode('partition-equal-subset-sum') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个**只包含正整数**的**非空**数组 `nums`。请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[1, 5, 11, 5]`', '`true`', '[1, 5, 5] 和 [11]'],
                ['`[1, 2, 3, 5]`', '`false`', '总和 11 是奇数，分不成两半'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 200`', '`1 <= nums[i] <= 100`'] },
          '<a href="' + leetcode('partition-equal-subset-sum') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：换一个问法',
        doc: [
          '两个子集的和相等，那每个子集的和都是总和的一半。所以问题变成：**能不能从数组里挑出一些数，正好凑成总和的一半？** 总和是奇数的话，直接不行。',
          '这又是一个背包：数是物品，总和的一半 target 是容量。和前两题不同的是，**每个数只能用一次**——这叫 0-1 背包（每个物品要么选 0 次，要么选 1 次）。',
          {
            table: {
              head: ['', '分割等和子集'],
              rows: [
                ['状态', '`dp[s]`：用已经考虑过的这些数，能不能凑出和 s（布尔值）'],
                ['转移', '新考虑一个数 x：原来就能凑出 s，或者原来能凑出 s - x、再加上 x：`dp[s] = dp[s] or dp[s - x]`'],
                ['初始值', '一个数都不选，只能凑出 0：`dp[0] = true`，其余 false'],
                ['顺序与答案', '一个数一个数地考虑；答案 `dp[target]`'],
              ],
            },
          },
          '下面每一行是「考虑完前几个数」时的表。新的一行只由上一行算出来：',
          { viz: { kind: 'grid', title: '[1, 5, 11, 5]，target = 11', frames: trace.partition([1, 5, 11, 5]) } },
          '每行只看上一行，和杨辉三角 II 一样可以压成一行原地改。而且新的 `dp[s]` 要用**上一行**的 `dp[s - x]`——在左边。所以要**从右往左**（s 从大到小）改，左边的格子还没被这个数改过。',
          '如果从左往右改会怎样？拿 `[1, 3]` 来说，target 是 2。考虑 1 时先改 `dp[1] = true`，接着改 `dp[2]` 时看 `dp[1]`——它刚被这个 1 改成 true，于是 `dp[2]` 也成了 true，等于把 1 用了两次。前两题物品能无限用，所以从小往大正好；这题只能用一次，必须从大往小。',
          '时间 O(n × target)，额外空间 O(target)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先算总和，奇数直接不行',
        say: ['函数收数组，返回能不能分。第一步算总和：是奇数就不可能平分，直接返回 false；否则目标是它的一半。'],
        ops: {
          python: code(
            ['class Solution:\n    def canPartition(self, nums: list[int]) -> bool:', '照例写类和方法，返回布尔值。'],
            ['\n        total = sum(nums)', '先算总和。'],
            ['\n        if total % 2 == 1:\n            return False', '总和是奇数，分不成两个相等的整数和。`%` 是取余数。'],
            ['\n        target = total // 2', '每个子集要凑出总和的一半。`//` 是整除，得到整数。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>', 'C 本来没有 `bool`，引入 `stdbool.h` 才能用 `bool`、`true`、`false`。'],
            ['\n\nbool canPartition(int* nums, int numsSize) {', '题目给的函数，返回布尔值。'],
            ['\n    int total = 0;\n    for (int i = 0; i < numsSize; i++) {\n        total += nums[i];\n    }', '先把所有数加起来。'],
            ['\n    if (total % 2 == 1) {\n        return false;\n    }\n    int target = total / 2;', '总和是奇数就分不成两半；否则目标是一半。两个 int 相除本来就是整除。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canPartition(vector<int>& nums) {', '照例的架子。求和的 `accumulate` 在 `numeric` 里。'],
            ['\n        int total = accumulate(nums.begin(), nums.end(), 0);', '`accumulate` 从 0 开始，把从头到尾的元素依次加上去。'],
            ['\n        if (total % 2 == 1) {\n            return false;\n        }\n        int target = total / 2;', '总和是奇数就分不成两半；否则目标是一半。']
          ),
          java: code(
            ['class Solution {\n    public boolean canPartition(int[] nums) {', '照例的架子，Java 的布尔类型叫 `boolean`。'],
            ['\n        int total = 0;\n        for (int x : nums) {\n            total += x;\n        }', '先把所有数加起来。'],
            ['\n        if (total % 2 == 1) {\n            return false;\n        }\n        int target = total / 2;', '总和是奇数就分不成两半；否则目标是一半。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn can_partition(nums: Vec<i32>) -> bool {', '照例的架子，返回 `bool`。'],
            ['\n        let total: i32 = nums.iter().sum();', '先算总和。`sum` 要知道结果类型，写明 `i32`。'],
            ['\n        if total % 2 == 1 {\n            return false;\n        }\n        let target = (total / 2) as usize;', '总和是奇数就分不成两半；否则目标是一半，要做表的下标，转成 usize。']
          ),
        },
        sayBy: {
          python: [py('sum(iterable, start=0)', 'library/functions.html#sum', 'Sums start and the items of an iterable from left to right and returns the total.', '从左到右把 start 和可迭代对象里的各项加起来，返回总和。')],
          rust: [rustdoc('Iterator::sum', 'iter/trait.Iterator.html#method.sum', 'Sums the elements of an iterator. Takes each element, adds them together, and returns the result.', '把迭代器里的元素加起来：取出每个元素相加，返回结果。')],
        },
      },
      {
        section: '写代码',
        title: '一张布尔表：一开始只能凑出 0',
        say: ['表的下标是「凑出的和」，从 0 到 target。一个数都没考虑时，只有 0 凑得出。'],
        ops: {
          python: code(
            ['\n        dp = [False] * (target + 1)', '下标 0 到 target，先全是「凑不出」。'],
            ['\n        dp[0] = True', '一个数都不选，和是 0：凑得出。']
          ),
          c: code(['\n    bool dp[10001] = {false};\n    dp[0] = true;', '数最多 200 个、每个不超过 100，总和不超过 20000，target 不超过 10000，开 10001 格，全清成 false。和 0 一定凑得出。']),
          cpp: code(['\n        vector<bool> dp(target + 1, false);\n        dp[0] = true;', '下标 0 到 target，先全是 false；和 0 一定凑得出。']),
          java: code(['\n        boolean[] dp = new boolean[target + 1];\n        dp[0] = true;', '新建的 boolean 数组每格都是 false；和 0 一定凑得出。']),
          rust: code(['\n        let mut dp = vec![false; target + 1];\n        dp[0] = true;', '下标 0 到 target，先全是 false；和 0 一定凑得出。']),
        },
      },
      {
        section: '写代码',
        title: '每个数考虑一次，从大往小改',
        say: [
          '一个数一个数地加进来。加入 x 时，每个和 s 都问一句：原来就能凑出 s 吗？或者原来能凑出 s - x，加上 x 就是 s？s 要**从大往小**走，这样看到的 dp[s - x] 还是加入 x 之前的值，x 只会被用一次。s 比 x 小时放不下 x，不用看。',
          { viz: { kind: 'grid', title: '一行一行加入新数', frames: trace.partition([1, 5, 11, 5]) } },
        ],
        ops: {
          python: code(
            ['\n        for x in nums:', '每个数考虑一次。'],
            ['\n            for s in range(target, x - 1, -1):', 's 从 target 倒着走到 x：`range` 的步长 -1 表示倒数，右端 x - 1 取不到，所以最后一个是 x。'],
            ['\n                dp[s] = dp[s] or dp[s - x]', '原来就能凑出 s，或者原来能凑出 s - x 再放上 x。因为是从大往小，dp[s - x] 还没被这个 x 改过。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {\n        int x = nums[i];', '每个数考虑一次。'],
            ['\n        for (int s = target; s >= x; s--) {', 's 从 target 往下走到 x，从大往小。'],
            ['\n            dp[s] = dp[s] || dp[s - x];\n        }\n    }', '原来就能凑出 s，或者原来能凑出 s - x 再放上 x。`||` 是「或」。']
          ),
          cpp: code(
            ['\n        for (int x : nums) {', '每个数考虑一次。'],
            ['\n            for (int s = target; s >= x; s--) {', 's 从 target 往下走到 x，从大往小。'],
            ['\n                dp[s] = dp[s] || dp[s - x];\n            }\n        }', '原来就能凑出 s，或者原来能凑出 s - x 再放上 x。']
          ),
          java: code(
            ['\n        for (int x : nums) {', '每个数考虑一次。'],
            ['\n            for (int s = target; s >= x; s--) {', 's 从 target 往下走到 x，从大往小。'],
            ['\n                dp[s] = dp[s] || dp[s - x];\n            }\n        }', '原来就能凑出 s，或者原来能凑出 s - x 再放上 x。']
          ),
          rust: code(
            ['\n        for &x in &nums {\n            let x = x as usize;', '每个数考虑一次，转成 usize 好做下标。'],
            ['\n            for s in (x..=target).rev() {', 's 从 target 往下走到 x：`(x..=target).rev()` 把这个范围倒过来。x 比 target 大时范围是空的，循环不跑。'],
            ['\n                dp[s] = dp[s] || dp[s - x];\n            }\n        }', '原来就能凑出 s，或者原来能凑出 s - x 再放上 x。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案：能不能凑出一半',
        say: ['所有数都考虑过了，看 target 那一格。'],
        ops: {
          python: code(['\n        return dp[target]', '能凑出一半，剩下的数自然是另一半。']),
          c: code(['\n    return dp[target];\n}', '能凑出一半，剩下的数自然是另一半。']),
          cpp: code(['\n        return dp[target];\n    }\n};', '能凑出一半，剩下的数自然是另一半。']),
          java: code(['\n        return dp[target];\n    }\n}', '能凑出一半，剩下的数自然是另一半。']),
          rust: code(['\n        dp[target]\n    }\n}', '能凑出一半，剩下的数自然是另一半。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，再试 [1, 3]',
        say: ['预期：true、false。再试思路里的 `[1, 3]`：总和 4、一半是 2，可 1 只能用一次，凑不出 2，应该是 false——从左往右改的写法会在这里错成 true。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().canPartition([1, 5, 11, 5]))\n    print(Solution().canPartition([1, 2, 3, 5]))\n    print(Solution().canPartition([1, 3]))', '两个样例和 `[1, 3]`。Python 的布尔值打印出来是 True、False。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'False', 'False'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    int a[] = {1, 5, 11, 5}, b[] = {1, 2, 3, 5}, c[] = {1, 3};\n    bool r[] = {canPartition(a, 4), canPartition(b, 4), canPartition(c, 2)};', '三组输入，结果先放进一个 bool 数组。'],
            ['\n    for (int k = 0; k < 3; k++) {\n        printf("%s\\n", r[k] ? "true" : "false");\n    }\n    return 0;\n}', '`printf` 没有打印布尔值的格式，用条件表达式选出 "true" 或 "false" 字符串，`%s` 打印字符串。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'false', 'false'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<int> a = {1, 5, 11, 5}, b = {1, 2, 3, 5}, c = {1, 3};\n    cout << boolalpha;', '`cout` 默认把 true 打印成 1，先输出 `boolalpha`，之后布尔值就打印成 true、false。'],
            ['\n    cout << Solution().canPartition(a) << endl << Solution().canPartition(b) << endl << Solution().canPartition(c) << endl;\n    return 0;\n}', '三组输入。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'false', 'false'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {', '写一个入口。'],
            ['\n        System.out.println(new Solution().canPartition(new int[]{1, 5, 11, 5}));\n        System.out.println(new Solution().canPartition(new int[]{1, 2, 3, 5}));\n        System.out.println(new Solution().canPartition(new int[]{1, 3}));\n    }\n}', '三组输入。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'false', 'false'] }]),
          rust: code(
            ['\n\nfn main() {', '写一个入口。'],
            ['\n    println!("{}", Solution::can_partition(vec![1, 5, 11, 5]));\n    println!("{}", Solution::can_partition(vec![1, 2, 3, 5]));\n    println!("{}", Solution::can_partition(vec![1, 3]));\n}', '三组输入。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'false', 'false'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '背包写完了',
        say: [
          '背包的表以容量为下标。物品能无限用（零钱兑换、完全平方数），容量从小往大；每个只能用一次（这题），压成一维后容量从大往小。时间 O(n × target)，额外空间 O(target)。',
          '下一个子模块「子序列与字符串」：状态又回到「以第 i 个结尾」，或者两个字符串各取一段前缀，组成一张二维表。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
