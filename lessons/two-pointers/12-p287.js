/*
 * 双指针 · 快慢指针 · 287 寻找重复数（中等）
 * 把 i → nums[i] 看成链表。重复的数就是环的入口。快慢指针先找相遇点，再从起点和相遇点同速走，相遇处就是入口。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.TP;

  const NUMS = [1, 3, 4, 2, 2];

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-287',
    group: '快慢指针',
    label: '287',
    title: '寻找重复数',
    summary: '把「下标 i 指向 nums[i]」看成一条链，重复的数让两个下标指向同一处，链上就有了环。快慢指针找到环的入口，就是重复的数。',
    problem: { id: 287, level: 'medium', url: leetcode('find-the-duplicate-number') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个包含 n + 1 个整数的数组 `nums`，其数字都在 `[1, n]` 范围内（包括 1 和 n），可知至少存在一个重复的整数。假设 `nums` 只有**一个重复的整数**，返回这个重复的数。你设计的解决方案必须**不修改**数组 `nums` 且只用常量级 O(1) 的额外空间。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`[1, 3, 4, 2, 2]`', '`2`'],
                ['`[3, 1, 3, 4, 2]`', '`3`'],
                ['`[3, 3, 3, 3, 3]`', '`3`'],
              ],
            },
          },
          { list: ['`1 <= n <= 10^5`', '`nums.length == n + 1`', '`1 <= nums[i] <= n`', '`nums` 中只有一个整数出现两次或多次，其余整数均只出现一次'] },
          '<a href="' + leetcode('find-the-duplicate-number') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路一：把数组看成一条链',
        doc: [
          '哈希集合一扫就能找到重复的数，但要 O(n) 空间；排序要改数组；448 题的原地标记也要改数组。这三条路都被题目堵死了。',
          '换个角度看这个数组：把每个下标 i 想成一个点，从点 i 连一条箭头指向点 `nums[i]`。以 `[1, 3, 4, 2, 2]` 为例：',
          '`0 → 1 → 3 → 2 → 4 → 2 → 4 → …`',
          {
            list: [
              '数都在 1 到 n 之间，没有箭头指向 0，所以 0 是起点，从它出发能一直走下去，永远不会走出数组。',
              '一共 n + 1 个点，一直走下去一定会走回走过的点——链上有一个**环**。',
              '环的**入口**有两个箭头指进来（一个来自环外，一个来自环里），也就是有两个下标的值都等于它。**入口就是那个重复的数**。',
            ],
          },
          '所以问题变成了：在一条带环的链上，找环的入口。不改数组，只用几个变量——这正是快慢指针擅长的。',
        ],
      },
      {
        section: '题目与思路',
        title: '思路二：快慢指针找环的入口',
        doc: [
          '**第一阶段**：slow 每次走一步（`slow = nums[slow]`），fast 每次走两步。进了环以后，fast 每一轮都比 slow 多走一步，相当于从后面一格一格追上来，迟早相遇。',
          '**第二阶段**：再派一个指针 p 从起点 0 出发，和 slow 每次都只走一步，它俩相遇的地方就是环的入口。',
          '为什么？设起点到入口有 a 步。相遇时 slow 走了 k 步，fast 走了 2k 步，fast 多走的 k 步全在环里绕圈，所以 **k 是环长的整数倍**。现在 p 从起点走 a 步到达入口；slow 已经走了 k 步，再走 a 步一共走了 k + a 步——相当于从起点先走 a 步到入口，再在环上绕了整数圈，也停在入口。两者同时到达入口，在那里相遇。',
          { viz: { kind: 'array', title: '[1, 3, 4, 2, 2]：指针的位置是下标', frames: trace.floyd(NUMS) } },
          '两个阶段都是 O(n) 步，时间 O(n)；只用了几个变量，额外空间 O(1)，也没有改数组。这个方法叫 Floyd 判圈算法，链表模块里还会用到它。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '第一阶段：快慢指针找相遇点',
        say: ['两个指针都从起点 0 出发。「走一步」就是从下标 i 跳到 nums[i]。slow 每轮走一步，fast 每轮走两步，直到它们落在同一个下标上。'],
        ops: {
          python: code(
            ['class Solution:\n    def findDuplicate(self, nums: list[int]) -> int:', '照例写类和方法。'],
            ['\n        slow = fast = 0', '两个指针都从起点 0 出发。'],
            ['\n        while True:\n            slow = nums[slow]\n            fast = nums[nums[fast]]', '先走再判断：slow 走一步，fast 连走两步。一开始两者都在 0，如果先判断就会立刻以为已经相遇了。'],
            ['\n            if slow == fast:\n                break', '落在同一个下标上：相遇了，第一阶段结束。']
          ),
          c: code(
            ['#include <stdio.h>\n\nint findDuplicate(int* nums, int numsSize) {', '题目给的函数。numsSize 这里用不到。'],
            ['\n    int slow = 0, fast = 0;', '两个指针都从起点 0 出发。'],
            ['\n    do {\n        slow = nums[slow];\n        fast = nums[nums[fast]];\n    } while (slow != fast);', '`do … while` 先执行一次再判断：一开始两者都在 0，要先走起来才能比。slow 走一步，fast 走两步，直到相遇。'],
            ['\n    (void)numsSize;', '告诉编译器这个参数是故意不用的，免得它警告「参数没用到」。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findDuplicate(vector<int>& nums) {', '照例的架子。'],
            ['\n        int slow = 0, fast = 0;', '两个指针都从起点 0 出发。'],
            ['\n        do {\n            slow = nums[slow];\n            fast = nums[nums[fast]];\n        } while (slow != fast);', '先走再判断：slow 走一步，fast 走两步，直到相遇。']
          ),
          java: code(
            ['class Solution {\n    public int findDuplicate(int[] nums) {', '照例的架子。'],
            ['\n        int slow = 0, fast = 0;', '两个指针都从起点 0 出发。'],
            ['\n        do {\n            slow = nums[slow];\n            fast = nums[nums[fast]];\n        } while (slow != fast);', '先走再判断：slow 走一步，fast 走两步，直到相遇。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn find_duplicate(nums: Vec<i32>) -> i32 {', '照例的架子。'],
            ['\n        let next = |i: usize| nums[i] as usize;', '「走一步」写成一个闭包：从下标 i 跳到 nums[i]，转成 usize 当下一个下标。'],
            ['\n        let (mut slow, mut fast) = (0, 0);', '两个指针都从起点 0 出发。'],
            ['\n        loop {\n            slow = next(slow);\n            fast = next(next(fast));\n            if slow == fast {\n                break;\n            }\n        }', 'Rust 没有 do-while，用 `loop` 加 `break`：先走再判断，相遇就跳出。']
          ),
        },
      },
      {
        section: '写代码',
        title: '第二阶段：同速走，相遇处就是入口',
        say: [
          '派一个指针 p 从起点 0 出发，和 slow 每次都只走一步。它们相遇的下标就是环的入口，也就是重复的数。',
          { viz: { kind: 'array', title: '两个阶段', frames: trace.floyd(NUMS) } },
        ],
        ops: {
          python: code(
            ['\n        p = 0', '新指针从起点出发。'],
            ['\n        while p != slow:\n            p = nums[p]\n            slow = nums[slow]', '两个都每次走一步，直到相遇。'],
            ['\n        return p', '相遇的下标就是环的入口，也就是重复的数。']
          ),
          c: code(
            ['\n    int p = 0;\n    while (p != slow) {\n        p = nums[p];\n        slow = nums[slow];\n    }', '新指针从起点出发，和 slow 同速走到相遇。'],
            ['\n    return p;\n}', '相遇处就是重复的数。']
          ),
          cpp: code(
            ['\n        int p = 0;\n        while (p != slow) {\n            p = nums[p];\n            slow = nums[slow];\n        }', '新指针从起点出发，和 slow 同速走到相遇。'],
            ['\n        return p;\n    }\n};', '相遇处就是重复的数。']
          ),
          java: code(
            ['\n        int p = 0;\n        while (p != slow) {\n            p = nums[p];\n            slow = nums[slow];\n        }', '新指针从起点出发，和 slow 同速走到相遇。'],
            ['\n        return p;\n    }\n}', '相遇处就是重复的数。']
          ),
          rust: code(
            ['\n        let mut p = 0;\n        while p != slow {\n            p = next(p);\n            slow = next(slow);\n        }', '新指针从起点出发，和 slow 同速走到相遇。'],
            ['\n        p as i32\n    }\n}', '相遇处就是重复的数，转回 i32 返回。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：2、3、3。第三个样例全是 3，环就是 3 自己指向自己。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for nums in [[1, 3, 4, 2, 2], [3, 1, 3, 4, 2], [3, 3, 3, 3, 3]]:\n        print(Solution().findDuplicate(nums))', '三个样例挨个跑。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['2', '3', '3'] }]),
          c: code(['\n\nint main(void) {\n    int a[] = {1, 3, 4, 2, 2}, b[] = {3, 1, 3, 4, 2}, c[] = {3, 3, 3, 3, 3};\n    printf("%d\\n%d\\n%d\\n", findDuplicate(a, 5), findDuplicate(b, 5), findDuplicate(c, 5));\n    return 0;\n}', '三个样例。']).concat([{ pause: 500 }, { run: RUN.c, output: ['2', '3', '3'] }]),
          cpp: code(['\n\nint main() {\n    vector<vector<int>> cases = {{1, 3, 4, 2, 2}, {3, 1, 3, 4, 2}, {3, 3, 3, 3, 3}};\n    for (auto& nums : cases) {\n        cout << Solution().findDuplicate(nums) << endl;\n    }\n    return 0;\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['2', '3', '3'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        int[][] cases = {{1, 3, 4, 2, 2}, {3, 1, 3, 4, 2}, {3, 3, 3, 3, 3}};\n        for (int[] nums : cases) {\n            System.out.println(new Solution().findDuplicate(nums));\n        }\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.java, output: ['2', '3', '3'] }]),
          rust: code(['\n\nfn main() {\n    for nums in [vec![1, 3, 4, 2, 2], vec![3, 1, 3, 4, 2], vec![3, 3, 3, 3, 3]] {\n        println!("{}", Solution::find_duplicate(nums));\n    }\n}', '三个样例挨个跑。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['2', '3', '3'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '双指针写完了',
        say: [
          '换一种眼光看数组：下标指向值，就成了一条链；重复的数就是环的入口。快慢指针先相遇、再同速找入口。时间 O(n)，额外空间 O(1)，不改数组。',
          '回顾这个模块：相向指针靠「排除一边」，同向指针靠「读写分工、守住区域约定」，快慢指针靠「快的一定追上慢的」。三种指针都只往一个方向走，所以都是 O(n)。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
