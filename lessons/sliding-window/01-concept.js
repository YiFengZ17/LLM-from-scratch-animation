/*
 * 滑动窗口 · 概念：这一章只有前置知识页，不写代码。
 * 两个模板按读者选的语言显示（code 写成「语言 → 代码」的对象）。
 */
(function (root) {
  'use strict';

  const { trace } = root.SW;

  // 定长窗口模板：add、remove 和更新答案代表具体题目里要做的事
  const FIXED = {
    python: [
      'for right in range(len(nums)):',
      '    add(nums[right])              # 右端进来一个',
      '    if right >= k:',
      '        remove(nums[right - k])   # 左端出去一个',
      '    if right >= k - 1:',
      '        update_answer()           # 窗口满 k 个时，看一看答案',
    ].join('\n'),
    c: [
      'for (int right = 0; right < n; right++) {',
      '    add(nums[right]);              // 右端进来一个',
      '    if (right >= k) {',
      '        remove(nums[right - k]);   // 左端出去一个',
      '    }',
      '    if (right >= k - 1) {',
      '        update_answer();           // 窗口满 k 个时，看一看答案',
      '    }',
      '}',
    ].join('\n'),
    rust: [
      'for right in 0..nums.len() {',
      '    add(nums[right]);              // 右端进来一个',
      '    if right >= k {',
      '        remove(nums[right - k]);   // 左端出去一个',
      '    }',
      '    if right + 1 >= k {',
      '        update_answer();           // 窗口满 k 个时，看一看答案',
      '    }',
      '}',
    ].join('\n'),
  };
  FIXED.cpp = FIXED.c;
  FIXED.java = FIXED.c.replace('int n', 'int n');

  // 变长窗口模板（求最短）：满足条件就收缩
  const SHORTEST = {
    python: [
      'left = 0',
      'for right in range(len(nums)):',
      '    add(nums[right])              # 右端进来一个',
      '    while ok():                   # 窗口满足条件时',
      '        ans = min(ans, right - left + 1)',
      '        remove(nums[left])        # 左端出去一个',
      '        left += 1',
    ].join('\n'),
    c: [
      'int left = 0;',
      'for (int right = 0; right < n; right++) {',
      '    add(nums[right]);              // 右端进来一个',
      '    while (ok()) {                 // 窗口满足条件时',
      '        ans = min(ans, right - left + 1);',
      '        remove(nums[left]);        // 左端出去一个',
      '        left++;',
      '    }',
      '}',
    ].join('\n'),
    java: [
      'int left = 0;',
      'for (int right = 0; right < n; right++) {',
      '    add(nums[right]);              // 右端进来一个',
      '    while (ok()) {                 // 窗口满足条件时',
      '        ans = Math.min(ans, right - left + 1);',
      '        remove(nums[left]);        // 左端出去一个',
      '        left++;',
      '    }',
      '}',
    ].join('\n'),
    rust: [
      'let mut left = 0;',
      'for right in 0..nums.len() {',
      '    add(nums[right]);              // 右端进来一个',
      '    while ok() {                   // 窗口满足条件时',
      '        ans = ans.min(right - left + 1);',
      '        remove(nums[left]);        // 左端出去一个',
      '        left += 1;',
      '    }',
      '}',
    ].join('\n'),
  };
  SHORTEST.cpp = SHORTEST.c;

  // 变长窗口模板（求最长）：不满足条件就收缩
  const LONGEST = {
    python: [
      'left = 0',
      'for right in range(len(nums)):',
      '    add(nums[right])',
      '    while not ok():               # 窗口不满足条件时，收缩到满足为止',
      '        remove(nums[left])',
      '        left += 1',
      '    ans = max(ans, right - left + 1)',
    ].join('\n'),
    c: [
      'int left = 0;',
      'for (int right = 0; right < n; right++) {',
      '    add(nums[right]);',
      '    while (!ok()) {                // 窗口不满足条件时，收缩到满足为止',
      '        remove(nums[left]);',
      '        left++;',
      '    }',
      '    ans = max(ans, right - left + 1);',
      '}',
    ].join('\n'),
    java: [
      'int left = 0;',
      'for (int right = 0; right < n; right++) {',
      '    add(nums[right]);',
      '    while (!ok()) {                // 窗口不满足条件时，收缩到满足为止',
      '        remove(nums[left]);',
      '        left++;',
      '    }',
      '    ans = Math.max(ans, right - left + 1);',
      '}',
    ].join('\n'),
    rust: [
      'let mut left = 0;',
      'for right in 0..nums.len() {',
      '    add(nums[right]);',
      '    while !ok() {                  // 窗口不满足条件时，收缩到满足为止',
      '        remove(nums[left]);',
      '        left += 1;',
      '    }',
      '    ans = ans.max(right - left + 1);',
      '}',
    ].join('\n'),
  };
  LONGEST.cpp = LONGEST.c;

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-concept',
    label: '概念',
    title: '滑动窗口是什么',
    summary: '暴力解为什么慢；定长窗口和变长窗口两个模板；为什么整体只要 O(n)。',
    files: [],
    docName: '概念.md',
    docKicker: '概念',
    steps: [
      {
        section: '概念',
        title: '这个模块讲什么',
        doc: [
          '这个模块的 7 道题有一个共同点：答案是数组或字符串里**连续的一段**，比如「长度为 k 的子数组」「不含重复字符的子串」。滑动窗口就是用两个下标框住这一段，让它在数组上一格一格地移动。',
          {
            table: {
              head: ['顺序', '题目', '难度', '窗口', '窗口里要维护什么'],
              rows: [
                ['1', '643 子数组最大平均数 I', '简单', '定长', '窗口里数的和'],
                ['2', '1876 长度为三且各字符不同的子字符串', '简单', '定长', '窗口里的 3 个字符'],
                ['3', '219 存在重复元素 II', '简单', '定长', '窗口里有哪些数（集合）'],
                ['4', '209 长度最小的子数组', '中等', '变长', '窗口里数的和'],
                ['5', '3 无重复字符的最长子串', '中等', '变长', '每个字符出现几次'],
                ['6', '438 找到字符串中所有字母异位词', '中等', '定长', '每个字母出现几次'],
                ['7', '76 最小覆盖子串', '困难', '变长', '还缺几个字符'],
              ],
            },
          },
          '每道题都可以用五种语言写：编辑器右下角的状态栏显示当前语言，点它或按 `L` 切换。旁白可以放在右侧，也可以按 `N` 换成注释，穿插在代码行之间。',
          '这一章只有 5 页概念，不写代码。',
        ],
      },
      {
        section: '概念',
        title: '连续的一段，和暴力解的问题',
        doc: [
          '以第一道题为例：数组 `[1, 12, -5, -6, 50, 3]`，要找长度为 4 的连续一段，使它的和最大。',
          '最直接的办法是把每一段都单独加一遍。长度为 4 的段一共有 3 个，每段要做 4 次加法：',
          { viz: { kind: 'array', title: '暴力：每个窗口都从头加一遍', frames: trace.brute([1, 12, -5, -6, 50, 3], 4) } },
          '仔细看相邻的两个窗口：`[1, 12, -5, -6]` 和 `[12, -5, -6, 50]` 有 3 个数是一样的，暴力解把它们重复加了一遍。数组长度是 n、窗口长度是 k 时，暴力解大约要做 n × k 次加法。题目里 n 可以到 10<sup>5</sup>，k 也可以到 10<sup>5</sup>，这就是 10<sup>10</sup> 量级，肯定超时。',
        ],
      },
      {
        section: '概念',
        title: '定长窗口：进一个，出一个',
        doc: [
          '窗口右移一格时，只有两个数发生了变化：右边进来一个，左边出去一个。所以不用重新加，只要在原来的和上**加一个、减一个**：',
          { viz: { kind: 'array', title: '定长窗口：k = 4', frames: trace.fixedSum([1, 12, -5, -6, 50, 3], 4) } },
          '每个数只进窗口一次、出窗口一次，总共做的事和 n 成正比。定长窗口的写法几乎都是这个样子：',
          { code: FIXED },
          '`add`、`remove`、`update_answer` 代表具体题目里要做的事：可能是加减一个数，可能是改一张计数表。',
        ],
      },
      {
        section: '概念',
        title: '变长窗口：右端扩张，左端收缩',
        doc: [
          '有些题的窗口长度不固定，比如「和至少为 7 的最短子数组」。这时两个端点各走各的：右端每次往右走一格，把新数加进来；一旦窗口满足条件，就从左端收缩，边缩边记答案，直到不满足为止。',
          { viz: { kind: 'array', title: '变长窗口：和 ≥ 7 的最短子数组', frames: trace.minLen(7, [2, 3, 1, 2, 4, 3]) } },
          '求**最短**时，满足条件就收缩：',
          { code: SHORTEST },
          '求**最长**时反过来，不满足条件才收缩，收缩完再记答案：',
          { code: LONGEST },
        ],
      },
      {
        section: '概念',
        title: '为什么只要 O(n)，什么时候能用',
        doc: [
          '变长窗口里有两层循环，看起来像 O(n²)，其实不是：`left` 只往右走、从不回头，整个过程中最多走 n 步；`right` 也最多走 n 步。所以里面那个 `while` 加起来一共最多执行 n 次，总时间是 O(n)。',
          '滑动窗口能用，靠的是一个前提：**窗口变大，条件只会更容易满足（或更难满足），不会忽好忽坏。** 比如数组里都是正数时，窗口越长和越大。正是因为这样，收缩到不满足时就可以放心停下，右端再往前走。',
          {
            list: [
              '数组里有负数、要求「和恰好等于 k」：窗口变大和不一定变大，不能直接用滑动窗口，要换成前缀和（题单第 4 类）。',
              '答案不是连续的一段（比如子序列）：也不能用滑动窗口。',
            ],
          },
          '接下来按顺序做 7 道题：先用两道简单题熟悉定长窗口，再做变长窗口，最后是困难题「最小覆盖子串」。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
