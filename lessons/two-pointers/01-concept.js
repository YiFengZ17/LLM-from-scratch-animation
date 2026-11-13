/*
 * 双指针 · 概念：只有前置知识页，不写代码。
 * 核心是「排除」：每移动一次指针，就有把握地扔掉一批不可能的答案。三种指针各配一个模板。
 */
(function (root) {
  'use strict';

  const { trace } = root.TP;

  const OPPOSITE = {
    python: [
      'left, right = 0, len(nums) - 1',
      'while left < right:',
      '    if 找到了(left, right):',
      '        return ...',
      '    elif 左边那个不可能再有用:',
      '        left += 1          # 排除左边',
      '    else:',
      '        right -= 1         # 排除右边',
    ].join('\n'),
    c: [
      'int left = 0, right = n - 1;',
      'while (left < right) {',
      '    if (找到了(left, right)) {',
      '        return ...;',
      '    } else if (左边那个不可能再有用) {',
      '        left++;            // 排除左边',
      '    } else {',
      '        right--;           // 排除右边',
      '    }',
      '}',
    ].join('\n'),
    rust: [
      'let (mut left, mut right) = (0, nums.len() - 1);',
      'while left < right {',
      '    if 找到了(left, right) {',
      '        return ...;',
      '    } else if 左边那个不可能再有用 {',
      '        left += 1;         // 排除左边',
      '    } else {',
      '        right -= 1;        // 排除右边',
      '    }',
      '}',
    ].join('\n'),
  };
  OPPOSITE.cpp = OPPOSITE.c;
  OPPOSITE.java = OPPOSITE.c;

  const SAME = {
    python: [
      'write = 0',
      'for read in range(len(nums)):',
      '    if 要留下(nums[read]):',
      '        nums[write] = nums[read]   # 留下的数依次放到前面',
      '        write += 1',
      '# nums[0:write] 就是留下来的部分',
    ].join('\n'),
    c: [
      'int write = 0;',
      'for (int read = 0; read < n; read++) {',
      '    if (要留下(nums[read])) {',
      '        nums[write] = nums[read];  // 留下的数依次放到前面',
      '        write++;',
      '    }',
      '}',
      '// nums[0..write-1] 就是留下来的部分',
    ].join('\n'),
    rust: [
      'let mut write = 0;',
      'for read in 0..nums.len() {',
      '    if 要留下(nums[read]) {',
      '        nums[write] = nums[read];  // 留下的数依次放到前面',
      '        write += 1;',
      '    }',
      '}',
      '// nums[..write] 就是留下来的部分',
    ].join('\n'),
  };
  SAME.cpp = SAME.c;
  SAME.java = SAME.c;

  root.Catalog.addChapter('two-pointers', {
    id: 'tp-concept',
    group: '入门',
    label: '概念',
    title: '双指针为什么快',
    summary: '每移动一次指针，就排除一批不可能的答案；相向、同向、快慢三种指针的模板。',
    files: [],
    docName: '概念.md',
    docKicker: '概念',
    steps: [
      {
        section: '概念',
        title: '这个模块讲什么',
        doc: [
          '双指针是用两个下标同时在数组（或字符串、链表）上移动。按两个指针怎么走，这个模块的 11 道题分成三组：',
          {
            table: {
              head: ['子模块', '题目', '两个指针怎么走'],
              rows: [
                ['相向指针', '125 → 345 → LCR 006 → 11 → 15 → 42', '一个从左端、一个从右端，往中间走，相遇就停'],
                ['同向指针', '283 → 392 → 844 → 75', '都从左往右（或都从右往左），一个读、一个写，或者各走各的串'],
                ['快慢指针', '287', '同一个起点，一个每次走一步、一个每次走两步'],
              ],
            },
          },
          '每道题都可以用五种语言写，编辑器右下角的状态栏显示当前语言，点它或按 `L` 切换。',
        ],
      },
      {
        section: '概念',
        title: '快在哪里：每一步都排除一批',
        doc: [
          '以 LCR 006 为例：在**有序**数组 `[1, 2, 4, 6, 10]` 里找两个数，和为 8。两层循环把每一对都试一遍，是 n²/2 对。',
          '双指针的想法：left 指最小的数，right 指最大的数，看它俩的和——',
          {
            list: [
              '**和大了**：right 指的数和最小的数配都嫌大，和其他任何数配只会更大。这个数不可能是答案，**排除它**，right 左移。',
              '**和小了**：left 指的数和最大的数配都嫌小，和谁配都小，**排除它**，left 右移。',
            ],
          },
          { viz: { kind: 'array', title: '有序数组，和为 8', frames: trace.sortedTwo([1, 2, 4, 6, 10], 8) } },
          '每看一次，就有一个数被整个排除——它和剩下所有数的配对都不用再试了。所以最多走 n 步，O(n)。',
          '**双指针的关键不是「两个指针」，而是「为什么可以放心地排除」**。每道题的思路页都会先把这个理由想清楚，代码反而很短。',
        ],
      },
      {
        section: '概念',
        title: '相向指针',
        doc: [
          '两个指针从两端出发，往中间走，相遇就结束。每一步根据当前两端的情况，决定排除左边还是右边：',
          { code: OPPOSITE },
          '回文判断（两端对称比较）、有序数组找两数之和、盛水最多的容器、接雨水，都是这个形状。难点在想清楚「什么时候可以排除哪一边」。',
        ],
      },
      {
        section: '概念',
        title: '同向指针',
        doc: [
          '两个指针都从左往右走，但速度不同。最常见的是「读写指针」：read 逐个读，遇到要留下的数，就写到 write 的位置，write 前进一格。这样能**原地**把要留下的数挤到数组前面，不用开新数组：',
          { code: SAME },
          '移动零、颜色分类都是在原地整理数组。还有一种是两个指针各走各的串，比如判断子序列：一个指针走 s，一个走 t，匹配上了 s 的指针才前进。',
        ],
      },
      {
        section: '概念',
        title: '快慢指针',
        doc: [
          '两个指针从同一个地方出发，慢的每次走一步，快的每次走两步。如果路上有环，快指针迟早会从后面追上慢指针——就像操场跑圈，跑得快的人一定会套圈。',
          '287 题「寻找重复数」会把数组看成一条链：从下标 i 跳到 `nums[i]`。有重复的数，就意味着有两个下标跳到同一个地方，链上就出现了环。用快慢指针找到环的入口，就是重复的数。',
          '这三种指针的共同点：每个指针都只往一个方向走，不回头，所以总步数是 O(n)。接下来先做相向指针，从最简单的「验证回文串」开始。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
