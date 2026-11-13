/*
 * 动态规划 · 区间与计数 · 312 戳气球（困难）
 * 区间 DP：两端补 1，dp[l][r] 是只戳开区间 (l, r) 里的气球最多得多少分。枚举「最后一个被戳的」k。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-312',
    group: '区间与计数',
    label: '312',
    title: '戳气球',
    summary: '想「最后戳哪个」而不是「先戳哪个」：最后戳 k 时，它的邻居正好是区间两端，左右两段互不影响。',
    problem: { id: 312, level: 'hard', url: leetcode('burst-balloons') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '有 `n` 个气球，编号为 0 到 `n - 1`，每个气球上都标有一个数字，这些数字存在数组 `nums` 中。现在要求你戳破所有的气球。戳破第 i 个气球，你可以获得 `nums[i - 1] * nums[i] * nums[i + 1]` 枚硬币。这里的 i - 1 和 i + 1 代表和 i 相邻的两个气球的序号。如果 i - 1 或 i + 1 超出了数组的边界，那么就当它是一个数字为 1 的气球。求所能获得硬币的最大数量。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`[3, 1, 5, 8]`', '`167`', '依次戳 1、5、3、8：3×1×5 + 3×5×8 + 1×3×8 + 1×8×1 = 167'],
                ['`[1, 5]`', '`10`', ''],
              ],
            },
          },
          { list: ['`n == nums.length`', '`1 <= n <= 300`', '`0 <= nums[i] <= 100`'] },
          '<a href="' + leetcode('burst-balloons') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：最后戳哪一个',
        doc: [
          '先想「第一个戳哪个」：戳掉 k 以后，k 左右两边的气球变成了邻居，两边从此纠缠在一起，没法拆成两个独立的小问题。',
          '反过来想「**最后**戳哪个」。假设一段气球里最后戳的是 k：在它之前，k 左边的气球和右边的气球都已经戳完了，而且因为 k 一直在，左边那些气球的邻居从来不会越过 k 跑到右边去——**左右两段互不影响**。最后戳 k 时，它的邻居正好是这一段两端外面的那两个气球。',
          '为了让「两端外面」总是存在，先在数组两头各补一个 1：`v = [1, nums..., 1]`。然后：',
          {
            table: {
              head: ['', '戳气球'],
              rows: [
                ['状态', '`dp[l][r]`：只戳开区间 (l, r) 里的气球（不含 l 和 r），最多得多少分'],
                ['转移', '枚举最后戳的 k（l < k < r）：`dp[l][r] = max(dp[l][k] + v[l]·v[k]·v[r] + dp[k][r])`'],
                ['初始值', '相邻的 l 和 r 之间没有气球：`dp[l][l+1] = 0`'],
                ['顺序与答案', '按区间长度 r - l 从短到长填；答案 `dp[0][n+1]`，也就是戳完所有原来的气球'],
              ],
            },
          },
          '为什么按长度填？`dp[l][r]` 用到的 `dp[l][k]`、`dp[k][r]` 都比它短。长度从小到大，短的一定先算好。',
          { viz: { kind: 'grid', title: '[3, 1, 5, 8]，补 1 后是 [1, 3, 1, 5, 8, 1]', frames: trace.burst([3, 1, 5, 8]) } },
          '区间有 O(n²) 个，每个枚举 O(n) 个 k，时间 O(n³)，额外空间 O(n²)。n 最多 300，约 450 万次运算。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子：两端补 1，开一张区间表',
        say: ['函数收气球数组，返回最高分。先造出两头补了 1 的新数组 v，再开一张 N × N 的表（N 是 v 的长度），全是 0。'],
        ops: {
          python: code(
            ['class Solution:\n    def maxCoins(self, nums: list[int]) -> int:', '照例写类和方法。'],
            ['\n        v = [1] + nums + [1]\n        N = len(v)', '两头各补一个 1，戳到边上的气球时就有邻居可乘。`+` 把三个列表接在一起。'],
            ['\n        dp = [[0] * N for _ in range(N)]', 'N × N 的表，全是 0：相邻两个下标之间没有气球，dp[l][l + 1] = 0 就有了。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint maxCoins(int* nums, int numsSize) {', '题目给的函数。'],
            ['\n    int N = numsSize + 2;\n    int v[302];\n    v[0] = v[N - 1] = 1;', '两头各补一个 1，N 比原来多 2。n 最多 300，开 302 格。'],
            ['\n    for (int i = 0; i < numsSize; i++) {\n        v[i + 1] = nums[i];\n    }', '中间依次放原来的气球，下标往右挪一位。'],
            ['\n    static int dp[302][302];', '表放到静态存储区。每个用到的格子下面都会重新写。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxCoins(vector<int>& nums) {', '照例的架子。'],
            ['\n        vector<int> v = {1};\n        v.insert(v.end(), nums.begin(), nums.end());\n        v.push_back(1);', '先放一个 1，把 nums 整段插到末尾，再补一个 1。'],
            ['\n        int N = v.size();\n        vector<vector<int>> dp(N, vector<int>(N, 0));', 'N × N 的表，全是 0。']
          ),
          java: code(
            ['class Solution {\n    public int maxCoins(int[] nums) {', '照例的架子。'],
            ['\n        int N = nums.length + 2;\n        int[] v = new int[N];\n        v[0] = v[N - 1] = 1;', '两头各补一个 1。'],
            ['\n        for (int i = 0; i < nums.length; i++) {\n            v[i + 1] = nums[i];\n        }', '中间依次放原来的气球。'],
            ['\n        int[][] dp = new int[N][N];', 'N × N 的表，全是 0。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn max_coins(nums: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let mut v = vec![1];\n        v.extend(nums);\n        v.push(1);', '先放一个 1，`extend` 把 nums 的元素全接到后面，再补一个 1。'],
            ['\n        let n = v.len();\n        let mut dp = vec![vec![0; n]; n];', 'N × N 的表，全是 0。Rust 的变量名习惯小写，这里叫 n。']
          ),
        },
      },
      {
        section: '写代码',
        title: '区间从短到长，枚举最后戳的 k',
        say: [
          '三层循环：最外层是区间长度，从 2 开始（长度 1 的区间里没有气球）；第二层是左端 l，右端 r = l + 长度；最内层枚举最后戳的 k。最后戳 k 的得分：左边那段的最好成绩 + k 和两端相乘 + 右边那段的最好成绩。',
          { viz: { kind: 'grid', title: '按长度从短到长', frames: trace.burst([3, 1, 5, 8]) } },
        ],
        ops: {
          python: code(
            ['\n        for length in range(2, N):', '区间长度 r - l 从 2 到 N - 1。长度 1 的区间里没有气球，已经是 0。'],
            ['\n            for l in range(0, N - length):\n                r = l + length', '左端 l 从 0 开始，右端 r 不能超过 N - 1，所以 l 最大是 N - 1 - length。'],
            ['\n                for k in range(l + 1, r):', '(l, r) 里的每个气球都可能是最后戳的。'],
            ['\n                    dp[l][r] = max(dp[l][r], dp[l][k] + v[l] * v[k] * v[r] + dp[k][r])', '最后戳 k：左边 (l, k) 和右边 (k, r) 已经各自戳完，它们都更短，已经算好。戳 k 时邻居是 v[l] 和 v[r]。和目前最好的比，留大的。']
          ),
          c: code(
            ['\n    for (int l = 0; l + 1 < N; l++) {\n        dp[l][l + 1] = 0;\n    }', '先把相邻的两端写成 0：中间没有气球。静态数组可能留着上次调用的值，所以要写。'],
            ['\n    for (int len = 2; len < N; len++) {\n        for (int l = 0; l + len < N; l++) {\n            int r = l + len;', '区间长度从 2 开始变长；左端 l、右端 r = l + len 不能超出 N - 1。'],
            ['\n            int best = 0;\n            for (int k = l + 1; k < r; k++) {', '枚举最后戳的 k。分数都不是负数，best 从 0 开始。'],
            ['\n                int s = dp[l][k] + v[l] * v[k] * v[r] + dp[k][r];\n                if (s > best) {\n                    best = s;\n                }\n            }', '最后戳 k：左右两段各自的最好成绩，加上戳 k 的得分。'],
            ['\n            dp[l][r] = best;\n        }\n    }', '所有 k 里最好的，就是这个区间的答案。']
          ),
          cpp: code(
            ['\n        for (int len = 2; len < N; len++) {\n            for (int l = 0; l + len < N; l++) {\n                int r = l + len;', '区间长度从 2 开始变长；左端 l、右端 r = l + len。'],
            ['\n                for (int k = l + 1; k < r; k++) {', '枚举最后戳的 k。'],
            ['\n                    dp[l][r] = max(dp[l][r], dp[l][k] + v[l] * v[k] * v[r] + dp[k][r]);\n                }\n            }\n        }', '左右两段的最好成绩加上戳 k 的得分，留大的。']
          ),
          java: code(
            ['\n        for (int len = 2; len < N; len++) {\n            for (int l = 0; l + len < N; l++) {\n                int r = l + len;', '区间长度从 2 开始变长；左端 l、右端 r = l + len。'],
            ['\n                for (int k = l + 1; k < r; k++) {', '枚举最后戳的 k。'],
            ['\n                    dp[l][r] = Math.max(dp[l][r], dp[l][k] + v[l] * v[k] * v[r] + dp[k][r]);\n                }\n            }\n        }', '左右两段的最好成绩加上戳 k 的得分，留大的。']
          ),
          rust: code(
            ['\n        for len in 2..n {\n            for l in 0..n - len {\n                let r = l + len;', '区间长度从 2 开始变长；左端 l 从 0 到 n - len - 1，右端 r = l + len。'],
            ['\n                for k in l + 1..r {', '枚举最后戳的 k。'],
            ['\n                    dp[l][r] = dp[l][r].max(dp[l][k] + v[l] * v[k] * v[r] + dp[k][r]);\n                }\n            }\n        }', '左右两段的最好成绩加上戳 k 的得分，留大的。']
          ),
        },
      },
      {
        section: '写代码',
        title: '答案：整个区间',
        say: ['开区间 (0, N-1) 里正好是所有原来的气球。'],
        ops: {
          python: code(['\n        return dp[0][N - 1]', '戳完所有原来的气球的最高分。']),
          c: code(['\n    return dp[0][N - 1];\n}', '戳完所有原来的气球的最高分。']),
          cpp: code(['\n        return dp[0][N - 1];\n    }\n};', '戳完所有原来的气球的最高分。']),
          java: code(['\n        return dp[0][N - 1];\n    }\n}', '戳完所有原来的气球的最高分。']),
          rust: code(['\n        dp[0][n - 1]\n    }\n}', '戳完所有原来的气球的最高分。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用两个样例跑一遍',
        say: ['预期：167 和 10。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().maxCoins([3, 1, 5, 8]))\n    print(Solution().maxCoins([1, 5]))', '题目的两个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['167', '10'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {3, 1, 5, 8}, b[] = {1, 5};\n    printf("%d\\n%d\\n", maxCoins(a, 4), maxCoins(b, 2));\n    return 0;\n}', '题目的两个样例。']).concat([{ pause: 500 }, { run: RUN.c, output: ['167', '10'] }]),
          cpp: code(['\n\nint main() {\n    vector<int> a = {3, 1, 5, 8}, b = {1, 5};\n    cout << Solution().maxCoins(a) << endl << Solution().maxCoins(b) << endl;\n    return 0;\n}', '题目的两个样例。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['167', '10'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().maxCoins(new int[]{3, 1, 5, 8}));\n        System.out.println(new Solution().maxCoins(new int[]{1, 5}));\n    }\n}', '题目的两个样例。']).concat([{ pause: 500 }, { run: RUN.java, output: ['167', '10'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::max_coins(vec![3, 1, 5, 8]));\n    println!("{}", Solution::max_coins(vec![1, 5]));\n}', '题目的两个样例。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['167', '10'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '动态规划写完了',
        say: [
          '区间 DP 的关键是找到一个能把区间拆成两段、而且两段互不影响的「分割点」。这题的分割点是「最后戳的气球」。按区间从短到长填，时间 O(n³)。',
          '29 道题走下来，写法始终是那四步：状态、转移、初始值、顺序与答案。转移几乎总是盯住「最后一步」（或者第一步）分情况。遇到新题，先问自己：表的一格代表什么？它由哪几格算出来？',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
