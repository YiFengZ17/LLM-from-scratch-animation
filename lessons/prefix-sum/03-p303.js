/*
 * 前缀和 · 303 区域和检索 - 数组不可变（简单）
 * 设计题：构造时算好前缀和数组，每次查询 sumRange(l, r) = pre[r+1] - pre[l]，O(1)。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { cdoc } = root.LessonKit;
  const { trace } = root.PS;

  const NUMS = [-2, 0, 3, -5, 2, -1];
  const Q = [[0, 2], [2, 5], [0, 5]];

  root.Catalog.addChapter('prefix-sum', {
    id: 'ps-303',
    label: '303',
    title: '区域和检索 - 数组不可变',
    summary: '会被问很多次区间和：构造时花 O(n) 把前缀和算好，之后每次查询只要一次减法。',
    problem: { id: 303, level: 'easy', url: leetcode('range-sum-query-immutable') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给定一个整数数组 `nums`，处理以下类型的多个查询：计算索引 `left` 和 `right`（包含 left 和 right）之间的 `nums` 元素的**和**，其中 `left <= right`。实现 `NumArray` 类：',
          {
            list: [
              '`NumArray(int[] nums)`：使用数组 `nums` 初始化对象。',
              '`int sumRange(int left, int right)`：返回数组 `nums` 中索引 `left` 和 `right` 之间的元素的总和，包含 left 和 right 两点。',
            ],
          },
          {
            table: {
              head: ['操作', '结果'],
              rows: [
                ['`NumArray([-2, 0, 3, -5, 2, -1])`', ''],
                ['`sumRange(0, 2)`', '`1`'],
                ['`sumRange(2, 5)`', '`-1`'],
                ['`sumRange(0, 5)`', '`-3`'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 10^4`', '`-10^5 <= nums[i] <= 10^5`', '`0 <= left <= right < nums.length`', '最多调用 10<sup>4</sup> 次 `sumRange`'] },
          '<a href="' + leetcode('range-sum-query-immutable') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：先算好，再查',
        doc: [
          '每次查询都从 left 加到 right，一次最多 10<sup>4</sup> 个数，查 10<sup>4</sup> 次就是 10<sup>8</sup>。数组又不会变，同样的加法被反复做了很多遍。',
          '这是一道「设计题」：对象创建时做一次准备工作，之后的每次查询都要快。准备工作就是算好**前缀和数组**：`pre[i]` 是前 i 个数的和。查询时，`nums[left..right]` 正好是「前 right+1 个」去掉「前 left 个」：',
          '`sumRange(left, right) = pre[right + 1] − pre[left]`',
          { viz: { kind: 'grid', title: '样例', frames: trace.prefix(NUMS, Q) } },
          '构造 O(n)，每次查询 O(1)；前缀和数组占 O(n) 空间。和最大 10<sup>4</sup> × 10<sup>5</sup> = 10<sup>9</sup>，int 装得下。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '类的骨架：存一个前缀和数组',
        say: ['这次不是一个函数，而是一个类：对象里存一个前缀和数组，构造时算好，查询时直接用。先把类和存数组的位置写出来。'],
        ops: {
          python: code(
            ['class NumArray:', '题目要的类叫 `NumArray`。'],
            ['\n    def __init__(self, nums: list[int]):', '构造方法：创建对象时调用，把准备工作做在这里。'],
            ['\n        self.pre = [0] * (len(nums) + 1)', '前缀和数组比 nums 多一格：`pre[0] = 0` 表示一个数都不取。存在 `self` 上，查询时才能用到。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>', '要用 `malloc` 和 `free`。'],
            ['\n\ntypedef struct {\n    int* pre;\n} NumArray;', 'C 用结构体代替类：里面只放一个指向前缀和数组的指针。'],
            ['\n\nNumArray* numArrayCreate(int* nums, int numsSize) {', '「构造」写成一个函数：申请一个对象，把准备工作做完，返回它。'],
            ['\n    NumArray* obj = malloc(sizeof(NumArray));\n    obj->pre = malloc((numsSize + 1) * sizeof(int));', '先申请对象，再给前缀和数组申请 n + 1 个 int。'],
            ['\n    obj->pre[0] = 0;', '前 0 个数的和是 0。`malloc` 来的内存里是随机内容，要自己写。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\nusing namespace std;', '要用 `vector` 和 `cout`。'],
            ['\n\nclass NumArray {\n    vector<int> pre;', '类里存一个前缀和数组，没写 `public:`，默认是私有的。'],
            ['\n\npublic:\n    NumArray(vector<int>& nums) : pre(nums.size() + 1, 0) {', '构造函数：初始化列表里把 pre 开成 n + 1 个 0，pre[0] = 0 就有了。']
          ),
          java: code(
            ['class NumArray {\n    private final int[] pre;', '类里存一个前缀和数组。`final` 表示构造时赋值以后不再换成别的数组。'],
            ['\n\n    public NumArray(int[] nums) {\n        pre = new int[nums.length + 1];', '构造方法：开 n + 1 格，新建的 int 数组全是 0，pre[0] = 0 就有了。']
          ),
          rust: code(
            ['struct NumArray {\n    pre: Vec<i32>,\n}', '结构体里存一个前缀和数组。'],
            ['\n\nimpl NumArray {\n    fn new(nums: Vec<i32>) -> Self {', '构造函数习惯叫 `new`，返回 `Self`。'],
            ['\n        let mut pre = vec![0; nums.len() + 1];', '开 n + 1 格，pre[0] = 0。']
          ),
        },
        sayBy: {
          c: [cdoc('malloc(size_t size)', 'Basic-Allocation.html', 'This function returns a pointer to a newly allocated block size bytes long, or a null pointer (setting errno) if the block could not be allocated.', '这个函数返回一个指针，指向新申请的、长 size 个字节的内存块；申请不到时返回空指针（并设置 errno）。')],
        },
      },
      {
        section: '写代码',
        title: '构造时：一遍算出前缀和',
        say: [
          '从左往右：前 i+1 个数的和，等于前 i 个数的和再加上第 i 个数。一遍就把整个前缀和数组填好。',
          { viz: { kind: 'grid', title: '填前缀和', frames: trace.prefix(NUMS, []) } },
        ],
        ops: {
          python: code(
            ['\n        for i, x in enumerate(nums):', '逐个数往前走，同时拿到下标和值。'],
            ['\n            self.pre[i + 1] = self.pre[i] + x', '前 i+1 个的和 = 前 i 个的和 + 第 i 个数。']
          ),
          c: code(
            ['\n    for (int i = 0; i < numsSize; i++) {\n        obj->pre[i + 1] = obj->pre[i] + nums[i];\n    }', '前 i+1 个的和 = 前 i 个的和 + 第 i 个数。'],
            ['\n    return obj;\n}', '准备好的对象交给调用方。']
          ),
          cpp: code(['\n        for (size_t i = 0; i < nums.size(); i++) {\n            pre[i + 1] = pre[i] + nums[i];\n        }\n    }', '前 i+1 个的和 = 前 i 个的和 + 第 i 个数。构造函数到这里结束。']),
          java: code(['\n        for (int i = 0; i < nums.length; i++) {\n            pre[i + 1] = pre[i] + nums[i];\n        }\n    }', '前 i+1 个的和 = 前 i 个的和 + 第 i 个数。构造方法到这里结束。']),
          rust: code(
            ['\n        for i in 0..nums.len() {\n            pre[i + 1] = pre[i] + nums[i];\n        }', '前 i+1 个的和 = 前 i 个的和 + 第 i 个数。'],
            ['\n        NumArray { pre }\n    }', '用算好的 pre 造出对象返回。字段名和变量名相同时，可以只写一次。']
          ),
        },
      },
      {
        section: '写代码',
        title: '查询时：一次减法',
        say: ['nums[left..right] 的和，是前 right+1 个的和，减去前 left 个的和。C 版还要再写一个释放函数，把申请的两块内存还回去。'],
        ops: {
          python: code(['\n\n    def sumRange(self, left: int, right: int) -> int:\n        return self.pre[right + 1] - self.pre[left]', '前 right+1 个去掉前 left 个，剩下的正好是下标 left 到 right。']),
          c: code(
            ['\n\nint numArraySumRange(NumArray* obj, int left, int right) {\n    return obj->pre[right + 1] - obj->pre[left];\n}', '前 right+1 个去掉前 left 个，剩下的正好是 left 到 right。'],
            ['\n\nvoid numArrayFree(NumArray* obj) {\n    free(obj->pre);\n    free(obj);\n}', '先释放对象里的数组，再释放对象本身。顺序反过来的话，释放对象后就不能再读 `obj->pre` 了。']
          ),
          cpp: code(['\n\n    int sumRange(int left, int right) {\n        return pre[right + 1] - pre[left];\n    }\n};', '前 right+1 个去掉前 left 个。类到这里写完。']),
          java: code(['\n\n    public int sumRange(int left, int right) {\n        return pre[right + 1] - pre[left];\n    }\n}', '前 right+1 个去掉前 left 个。']),
          rust: code(['\n\n    fn sum_range(&self, left: i32, right: i32) -> i32 {\n        self.pre[right as usize + 1] - self.pre[left as usize]\n    }\n}', '只读不改，用 `&self`。下标转成 usize，前 right+1 个去掉前 left 个。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '照着样例查三次',
        say: ['建一个对象，查三次。预期：1、-1、-3。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":\n    arr = NumArray([-2, 0, 3, -5, 2, -1])', '写一个入口，用样例建一个对象。'],
            ['\n    print(arr.sumRange(0, 2))\n    print(arr.sumRange(2, 5))\n    print(arr.sumRange(0, 5))', '查三次。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['1', '-1', '-3'] }]),
          c: code(
            ['\n\nint main(void) {\n    int nums[] = {-2, 0, 3, -5, 2, -1};\n    NumArray* arr = numArrayCreate(nums, 6);', '建一个对象。'],
            ['\n    printf("%d\\n", numArraySumRange(arr, 0, 2));\n    printf("%d\\n", numArraySumRange(arr, 2, 5));\n    printf("%d\\n", numArraySumRange(arr, 0, 5));', '查三次。'],
            ['\n    numArrayFree(arr);\n    return 0;\n}', '用完释放。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['1', '-1', '-3'] }]),
          cpp: code(['\n\nint main() {\n    vector<int> nums = {-2, 0, 3, -5, 2, -1};\n    NumArray arr(nums);\n    cout << arr.sumRange(0, 2) << endl << arr.sumRange(2, 5) << endl << arr.sumRange(0, 5) << endl;\n    return 0;\n}', '建一个对象，查三次。']).concat([{ pause: 500 }, { run: RUN.cpp, output: ['1', '-1', '-3'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        NumArray arr = new NumArray(new int[]{-2, 0, 3, -5, 2, -1});\n        System.out.println(arr.sumRange(0, 2));\n        System.out.println(arr.sumRange(2, 5));\n        System.out.println(arr.sumRange(0, 5));\n    }\n}', '建一个对象，查三次。']).concat([{ pause: 500 }, { run: RUN.java, output: ['1', '-1', '-3'] }]),
          rust: code(['\n\nfn main() {\n    let arr = NumArray::new(vec![-2, 0, 3, -5, 2, -1]);\n    println!("{}", arr.sum_range(0, 2));\n    println!("{}", arr.sum_range(2, 5));\n    println!("{}", arr.sum_range(0, 5));\n}', '建一个对象，查三次。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['1', '-1', '-3'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '会被反复查询的东西，先花一次时间算好存起来。前缀和数组让任意区间和都只要一次减法：构造 O(n)，查询 O(1)。',
          '下一题「和为 K 的子数组」反过来：不问某一段的和，而是问「和为 k 的段有几个」。前缀和要和哈希表配合。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
