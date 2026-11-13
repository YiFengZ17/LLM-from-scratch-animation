/*
 * 滑动窗口 · 219 存在重复元素 II（简单，定长窗口 + 集合）
 * 写法约定见 02-p643.js。C 没有内置的哈希表，这一章顺着需要写一个最小的哈希集合。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode, trace } = root.SW;
  const { py, cppdoc, javadoc, rustdoc } = root.LessonKit;

  root.Catalog.addChapter('sliding-window', {
    id: 'sw-219',
    label: '219',
    title: '存在重复元素 II',
    summary: '窗口里放最近 k 个数，用集合回答「新来的数在不在窗口里」。',
    problem: { id: 219, level: 'easy', url: leetcode('contains-duplicate-ii') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给一个整数数组 `nums` 和一个整数 `k`。如果能找到两个不同的下标 i 和 j，使 `nums[i] == nums[j]`，并且两个下标相差不超过 k，就返回 true，否则返回 false。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`nums = [1, 2, 3, 1]`, `k = 3`', '`true`', '两个 1 的下标是 0 和 3，相差 3'],
                ['`nums = [1, 0, 1, 1]`, `k = 1`', '`true`', '下标 2 和 3 的两个 1 相差 1'],
                ['`nums = [1, 2, 3, 1, 2, 3]`, `k = 2`', '`false`', '相同的数下标都相差 3'],
              ],
            },
          },
          { list: ['`1 <= nums.length <= 10^5`', '`-10^9 <= nums[i] <= 10^9`', '`0 <= k <= 10^5`'] },
          '<a href="' + leetcode('contains-duplicate-ii') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路',
        doc: [
          '换个说法：每看到一个数，就问一句「它在**前面 k 个数**里出现过吗」。前面 k 个数，正好是一个长度为 k 的窗口。',
          '窗口里的数可能有上万个，每次挨个比太慢。我们需要一种东西，能马上回答「某个数在不在里面」——这就是**集合**（哈希集合）：放进去、拿出来、查在不在，平均都是常数时间。',
          { viz: { kind: 'array', title: '样例 1：k = 3', frames: trace.nearbyDup([1, 2, 3, 1], 3) } },
          { viz: { kind: 'array', title: '样例 3：k = 2', frames: trace.nearbyDup([1, 2, 3, 1, 2, 3], 2) } },
          '每个数进集合一次、出集合一次，时间 O(n)；集合里最多 k + 1 个数，额外空间 O(k)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收数组 `nums` 和距离 `k`，回答「有没有」，所以返回布尔值。'],
        ops: {
          python: code(['class Solution:\n    def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:', '返回值是 `bool`：只有 True 和 False 两种。']),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>', '`stdbool.h` 让 C 也能写 `bool`、`true`、`false`；`string.h` 里的 `memset` 一会儿用来清空表格。'],
            ['\n\n#define CAP 262144', 'C 没有内置的集合，我们要自己做一个。先定一个表格的容量：262144 是 2 的 18 次方，比最多 10^5 个数大得多，表格不会太挤。`#define` 给这个数起个名字。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <unordered_set>\nusing namespace std;', '这道题要用集合，C++ 的哈希集合是 `unordered_set`，引入它的头文件。'],
            ['\n\nclass Solution {\npublic:\n    bool containsNearbyDuplicate(vector<int>& nums, int k) {', '返回 `bool`：true 或 false。']
          ),
          java: code(
            ['import java.util.HashSet;\nimport java.util.Set;', '这道题要用集合。Java 的哈希集合是 `HashSet`，在 `java.util` 包里，用 `import` 引进来。'],
            ['\n\nclass Solution {\n    public boolean containsNearbyDuplicate(int[] nums, int k) {', 'Java 的布尔类型叫 `boolean`。']
          ),
          rust: code(
            ['use std::collections::HashSet;', '这道题要用集合。Rust 的哈希集合是 `HashSet`，用 `use` 把它引进来。'],
            ['\n\nstruct Solution;\n\nimpl Solution {\n    pub fn contains_nearby_duplicate(nums: Vec<i32>, k: i32) -> bool {', '返回 `bool`：true 或 false。']
          ),
        },
      },
      {
        section: '写代码',
        title: '准备一个集合当窗口',
        say: ['窗口里要放最近的 k 个数，而且要能马上回答「某个数在不在里面」。挨个比太慢，所以用集合来装窗口。'],
        ops: {
          python: code(['\n        window = set()', '用一个空集合装窗口里的数。`set()` 造一个空集合（写 `{}` 得到的是空字典，不是集合）。']),
          c: code(
            ['\n\nstatic int keys[CAP];\nstatic bool used[CAP];\nstatic bool inWindow[CAP];', '集合的做法：准备一张大表格，每个数算出一个格子号放进去。`keys` 记格子里放的是哪个数，`used` 记这个格子用过没有，`inWindow` 记这个数现在在不在窗口里。`static` 让它们只在这个文件里可见。'],
            ['\n\nstatic int slot(int key) {', '写一个函数，算出一个数该放在哪一格：算出的格子要么是空的，要么里面正好就是这个数。'],
            ['\n    unsigned int h = (unsigned int)key * 2654435761u % CAP;', '先把数打散成一个格子号：乘一个大奇数再对容量取余，相近的数会落到相隔很远的格子里。转成 `unsigned` 是为了让负数也能算，而且乘法溢出时会自动绕回去，不出错。'],
            ['\n    while (used[h] && keys[h] != key) {\n        h = (h + 1) % CAP;\n    }', '这一格被别的数占了，就往后挪一格再看，直到遇到空格子或者遇到它自己。这种做法叫线性探测。'],
            ['\n    return h;\n}', '返回找到的格子号。'],
            ['\n\nbool containsNearbyDuplicate(int* nums, int numsSize, int k) {\n    memset(used, 0, sizeof(used));', '集合准备好了，开始写题目要的函数。表格是全局的，上次调用留下的东西要先清掉：`memset` 把 `used` 整块填成 0。']
          ),
          cpp: code(['\n        unordered_set<int> window;', '用一个整数集合装窗口里的数，一开始是空的。']),
          java: code(['\n        Set<Integer> window = new HashSet<>();', '用一个 `HashSet` 装窗口里的数。集合里只能放对象，所以写 `Integer`（int 的包装类），放 int 进去时 Java 会自动包装。']),
          rust: code(
            ['\n        let k = k as usize;', '后面要用 k 算下标，先转成 `usize`。'],
            ['\n        let mut window = HashSet::new();', '用一个空的 `HashSet` 装窗口里的数。元素类型 Rust 会根据后面放进去的东西自己推断。']
          ),
        },
        sayBy: {
          python: [py('set', 'library/stdtypes.html#set-types-set-frozenset', 'A set object is an unordered collection of distinct hashable objects. Common uses include membership testing, removing duplicates from a sequence, …', '集合是由互不相同的可哈希对象组成的无序容器，常用来判断成员是否存在、给序列去重……')],
          cpp: [cppdoc('unordered_set', 'unord.set.overview', "An unordered_set is an unordered associative container that supports unique keys (an unordered_set contains at most one of each key value) and in which the elements' keys are the elements themselves.", 'unordered_set 是无序的关联容器，键是唯一的（每个键值最多出现一次），元素的键就是元素本身。')],
        },
      },
      {
        section: '写代码',
        title: '新来的数：先查，再放进窗口',
        say: [
          '右端一个一个往前走。每来一个数，第一件事是问：它在窗口里吗？在，说明前面 k 个数里有和它相同的，直接回答 true。不在，就把它放进窗口，等后面的数来查。',
          { viz: { kind: 'array', title: '样例 1：k = 3', frames: trace.nearbyDup([1, 2, 3, 1], 3) } },
        ],
        ops: {
          python: code(
            ['\n        for right, x in enumerate(nums):', '右端要一个一个往前走，而且后面既要用到这个数，也要用到它的下标（移出窗口时要用）。`enumerate` 每次同时给出下标和值。'],
            ['\n            if x in window:\n                return True', '先查：`x in window` 问集合里有没有 x。有就找到了，直接返回，后面不用再看。'],
            ['\n            window.add(x)', '没找到，就把它放进窗口，留给后面的数来查。']
          ),
          c: code(
            ['\n    for (int right = 0; right < numsSize; right++) {', '右端一个一个往前走。'],
            ['\n        int h = slot(nums[right]);', '先算出这个数在表格里的格子。'],
            ['\n        if (used[h] && inWindow[h]) {\n            return true;\n        }', '格子用过、而且这个数现在还在窗口里，说明前面 k 个数里有它，返回 true。'],
            ['\n        used[h] = true;\n        keys[h] = nums[right];\n        inWindow[h] = true;', '没找到，就把它放进这个格子，标记它在窗口里。']
          ),
          cpp: code(
            ['\n        for (int right = 0; right < (int)nums.size(); right++) {', '右端一个一个往前走。'],
            ['\n            if (window.count(nums[right])) {\n                return true;\n            }', '先查：`count` 返回集合里这个数有几个，对集合来说只会是 0 或 1，非 0 就是找到了。'],
            ['\n            window.insert(nums[right]);', '没找到，就放进窗口。']
          ),
          java: code(
            ['\n        for (int right = 0; right < nums.length; right++) {', '右端一个一个往前走。'],
            ['\n            if (!window.add(nums[right])) {\n                return true;\n            }', '「先查再放」可以一步做完：`add` 在集合里已经有这个数时什么也不做，并返回 false。所以 add 失败就说明找到了。']
          ),
          rust: code(
            ['\n        for right in 0..nums.len() {', '右端一个一个往前走。'],
            ['\n            if !window.insert(nums[right]) {\n                return true;\n            }', '「先查再放」可以一步做完：`insert` 在集合里已经有这个值时不放进去，并返回 false。所以 insert 失败就说明找到了。']
          ),
        },
        sayBy: {
          python: [py('enumerate(iterable, start=0)', 'library/functions.html#enumerate', 'Return an enumerate object. … returns a tuple containing a count (from start which defaults to 0) and the values obtained from iterating over iterable.', '返回一个枚举对象……每次给出一个元组：计数（从 start 开始，默认 0）和从可迭代对象里取到的值。')],
          java: [javadoc('Set.add(E e)', 'java/util/HashSet.html#add(E)', 'Adds the specified element to this set if it is not already present. … If this set already contains the element, the call leaves the set unchanged and returns false.', '如果集合里还没有这个元素，就把它加进去。……如果已经有了，集合不变，返回 false。')],
          rust: [rustdoc('HashSet::insert', 'collections/struct.HashSet.html#method.insert', 'Adds a value to the set. Returns whether the value was newly inserted.', '把一个值加进集合，返回它是不是新加进去的。')],
        },
      },
      {
        section: '写代码',
        title: '窗口装满了，最左边的离开',
        say: ['窗口里只能留最近的 k 个数。刚放进一个新数，如果窗口里超过 k 个了，就把最左边那个移出去。最左边那个数的下标是 right - k。'],
        ops: {
          python: code(
            ['\n            if len(window) > k:', '放进新数后，窗口里超过 k 个了吗？'],
            ['\n                window.remove(nums[right - k])', '超过了，就把最左边那个数（下标 right - k）移出集合。窗口里的数都不相同（相同的话前面已经返回了），所以移掉的正好是那一个。']
          ),
          c: code(
            ['\n        if (right >= k) {', '窗口里的数下标从 right-k 到 right，一共 k+1 个，多了一个。right 走到 k 以后，每一步都多出一个。'],
            ['\n            inWindow[slot(nums[right - k])] = false;\n        }\n    }', '把最左边那个数标记为不在窗口里。注意不能把格子清空成没用过：别的数可能是「挪过这一格」才找到自己位置的，清空了就找不到了。']
          ),
          cpp: code(
            ['\n            if ((int)window.size() > k) {', '放进新数后，窗口里超过 k 个了吗？'],
            ['\n                window.erase(nums[right - k]);\n            }\n        }', '超过了，就用 `erase` 把最左边那个数移出集合。']
          ),
          java: code(
            ['\n            if (window.size() > k) {', '放进新数后，窗口里超过 k 个了吗？'],
            ['\n                window.remove(nums[right - k]);\n            }\n        }', '超过了，就把最左边那个数移出集合。']
          ),
          rust: code(
            ['\n            if window.len() > k {', '放进新数后，窗口里超过 k 个了吗？'],
            ['\n                window.remove(&nums[right - k]);\n            }\n        }', '超过了，就把最左边那个数移出集合。`remove` 要的是值的引用，所以写 `&`。']
          ),
        },
        sayBy: {
          rust: [rustdoc('HashSet::remove', 'collections/struct.HashSet.html#method.remove', 'Removes a value from the set. Returns whether the value was present in the set.', '从集合里移除一个值，返回它原来在不在集合里。')],
        },
      },
      {
        section: '写代码',
        title: '走完都没找到',
        say: ['如果整个数组走完都没有返回 true，就说明没有符合条件的一对数。'],
        ops: {
          python: code(['\n        return False', '走到这里说明一直没找到，返回 False。']),
          c: code(['\n    return false;\n}', '走到这里说明一直没找到，返回 false。']),
          cpp: code(['\n        return false;\n    }\n};', '走到这里说明一直没找到，返回 false。']),
          java: code(['\n        return false;\n    }\n}', '走到这里说明一直没找到，返回 false。']),
          rust: code(['\n        false\n    }\n}', '走到这里说明一直没找到，返回 false。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：前两个是 true，第三个是 false。'],
        ops: {
          python: code(['\n\n\nif __name__ == "__main__":\n    print(Solution().containsNearbyDuplicate([1, 2, 3, 1], 3))\n    print(Solution().containsNearbyDuplicate([1, 0, 1, 1], 1))\n    print(Solution().containsNearbyDuplicate([1, 2, 3, 1, 2, 3], 2))', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'True', 'False'] }]),
          c: code(
            ['\n\nint main(void) {\n    int a[] = {1, 2, 3, 1}, b[] = {1, 0, 1, 1}, c[] = {1, 2, 3, 1, 2, 3};', '准备三个样例数组。'],
            ['\n    printf("%s\\n", containsNearbyDuplicate(a, 4, 3) ? "true" : "false");\n    printf("%s\\n", containsNearbyDuplicate(b, 4, 1) ? "true" : "false");\n    printf("%s\\n", containsNearbyDuplicate(c, 6, 2) ? "true" : "false");', 'printf 没有打印 bool 的格式，用 `条件 ? "true" : "false"` 换成文字，再用 `%s` 按字符串打印。'],
            ['\n    return 0;\n}']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'true', 'false'] }]),
          cpp: code(
            ['\n\nint main() {\n    vector<int> a = {1, 2, 3, 1}, b = {1, 0, 1, 1}, c = {1, 2, 3, 1, 2, 3};', '准备三个样例。'],
            ['\n    cout << boolalpha;', '`cout` 默认把 bool 打印成 1 和 0，先输出 `boolalpha`，之后就打印成 true 和 false。'],
            ['\n    cout << Solution().containsNearbyDuplicate(a, 3) << endl;\n    cout << Solution().containsNearbyDuplicate(b, 1) << endl;\n    cout << Solution().containsNearbyDuplicate(c, 2) << endl;\n    return 0;\n}']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'true', 'false'] }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Solution().containsNearbyDuplicate(new int[]{1, 2, 3, 1}, 3));\n        System.out.println(new Solution().containsNearbyDuplicate(new int[]{1, 0, 1, 1}, 1));\n        System.out.println(new Solution().containsNearbyDuplicate(new int[]{1, 2, 3, 1, 2, 3}, 2));\n    }\n}', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'true', 'false'] }]),
          rust: code(['\n\nfn main() {\n    println!("{}", Solution::contains_nearby_duplicate(vec![1, 2, 3, 1], 3));\n    println!("{}", Solution::contains_nearby_duplicate(vec![1, 0, 1, 1], 1));\n    println!("{}", Solution::contains_nearby_duplicate(vec![1, 2, 3, 1, 2, 3], 2));\n}', '用三个样例调用。']).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'true', 'false'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '窗口不一定是记一个和。这道题窗口里要回答「某个数在不在」，所以用集合来装窗口：每个数进一次、出一次，时间 O(n)，额外空间 O(k)。',
          '到这里，三道定长窗口的题都做完了。下一题的窗口长度不固定：右端扩张、左端收缩，两个端点各走各的。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
