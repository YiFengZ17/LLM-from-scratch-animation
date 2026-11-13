/*
 * 哈希表与数组 · 705 设计哈希集合（简单）
 * 亲手实现：769 个桶，哈希函数取余数，冲突的数在同一个桶里排成一串（拉链法），支持删除。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { py, cppdoc, javadoc, rustdoc } = root.LessonKit;
  const { trace } = root.HT;

  const OPS = [['add', 1], ['add', 2], ['contains', 1], ['contains', 3], ['add', 2], ['contains', 2], ['remove', 2], ['contains', 2], ['add', 6], ['remove', 1], ['contains', 6]];

  root.Catalog.addChapter('hash-table', {
    id: 'ht-705',
    label: '705',
    title: '设计哈希集合',
    summary: '不用任何现成的哈希表，自己写一个：一排桶、取余数的哈希函数、冲突时在桶里排成一串，增删查都只翻一个桶。',
    problem: { id: 705, level: 'easy', url: leetcode('design-hashset') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '**不使用任何内建的哈希表库**设计一个哈希集合（HashSet）。实现 `MyHashSet` 类：',
          {
            list: [
              '`void add(key)`：向哈希集合中插入值 key。',
              '`bool contains(key)`：返回哈希集合中是否存在这个值 key。',
              '`void remove(key)`：将给定值 key 从哈希集合中删除。如果哈希集合中没有这个值，什么也不做。',
            ],
          },
          {
            table: {
              head: ['操作', '结果'],
              rows: [
                ['`add(1)`、`add(2)`', ''],
                ['`contains(1)`', '`true`'],
                ['`contains(3)`', '`false`'],
                ['`add(2)`', '已经有了，不变'],
                ['`contains(2)`', '`true`'],
                ['`remove(2)`', ''],
                ['`contains(2)`', '`false`'],
              ],
            },
          },
          { list: ['`0 <= key <= 10^6`', '最多调用 10<sup>4</sup> 次 `add`、`remove` 和 `contains`'] },
          '<a href="' + leetcode('design-hashset') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：桶 + 拉链',
        doc: [
          'key 只到 10<sup>6</sup>，开一个 10<sup>6</sup> + 1 格的布尔数组也能过。但那是「键的范围小」时的做法；这道题想让我们实现真正的哈希表：**格子数远小于键的范围**，靠哈希函数把键分散开。',
          '按概念章讲的拉链法：',
          {
            list: [
              '准备 **769 个桶**，每个桶是一串（一开始是空的）。',
              '**哈希函数**：key 放进第 `key % 769` 号桶。',
              '`add`：去它的桶，桶里没有它才放进去（集合里不能重复）。',
              '`contains`：只翻它的那一个桶。',
              '`remove`：去它的桶，找到就拿掉。',
            ],
          },
          '为什么是 769？桶数取一个质数，取余数时分得更均匀：如果键都是某个数的倍数，而桶数也是它的倍数，键就会挤在少数几个桶里。最多 10<sup>4</sup> 个数分到 769 个桶，平均每桶十几个，翻一个桶很快。',
          { viz: { kind: 'grid', title: '用 5 个桶演示', frames: trace.buckets(5, OPS) } },
          '每个操作只翻一个桶，平均 O(n / 桶数)。真正的哈希表还会在数变多时自动加桶，让每个桶始终很短，这样平均是 O(1)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '一排空桶',
        say: ['先把集合的「骨架」搭出来：桶的个数定成 769，每个桶一开始都是空的一串。'],
        ops: {
          python: code(
            ['class MyHashSet:', '题目要的类叫 `MyHashSet`。'],
            ['\n    def __init__(self):', '`__init__` 是构造方法，创建对象时自动调用，在这里把桶准备好。'],
            ['\n        self.base = 769', '桶的个数，取一个质数。存在 `self` 上，其他方法也能用。'],
            ['\n        self.buckets = [[] for _ in range(self.base)]', '769 个空列表，每个是一个桶。要用列表推导式，让每个桶都是**新的**空列表；写成 `[[]] * 769` 的话，769 个桶其实是同一个列表。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <stdbool.h>', '要用 `malloc`、`free` 和 `bool`。'],
            ['\n\n#define BASE 769', '桶的个数，取一个质数。'],
            ['\n\ntypedef struct Node {\n    int key;\n    struct Node* next;\n} Node;', 'C 没有现成的「一串」，用链表：每个节点放一个数，再指向同一个桶里的下一个节点。结构体里要指向自己的类型，所以先写 `struct Node`。'],
            ['\n\ntypedef struct {\n    Node* heads[BASE];\n} MyHashSet;', '集合本身就是 769 个链表的头指针。头指针是空的，就是空桶。'],
            ['\n\nMyHashSet* myHashSetCreate(void) {\n    MyHashSet* obj = malloc(sizeof(MyHashSet));', '力扣的 C 版用一组函数代替类：先写「创建」，申请一个集合的空间。'],
            ['\n    for (int i = 0; i < BASE; i++) {\n        obj->heads[i] = NULL;\n    }\n    return obj;\n}', '`malloc` 来的内存里是随机内容，每个桶都要设成空指针。`obj->heads` 是「obj 指向的那个结构体的 heads」。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <list>\n#include <algorithm>\nusing namespace std;', '每个桶用标准库的链表 `list`，查找用 `algorithm` 里的 `find`。'],
            ['\n\nclass MyHashSet {\n    static constexpr int BASE = 769;\n    vector<list<int>> buckets;', '桶的个数是一个类里的常量；`buckets` 是 769 个链表。类里不写 `public:` 的部分默认是私有的，外面看不到。'],
            ['\n\npublic:\n    MyHashSet() : buckets(BASE) {}', '构造函数：冒号后面是初始化列表，让 buckets 一开始就有 BASE 个空链表。']
          ),
          java: code(
            ['import java.util.ArrayList;\nimport java.util.LinkedList;\nimport java.util.List;', '要用 List、ArrayList 和链表 LinkedList。'],
            ['\n\nclass MyHashSet {\n    private static final int BASE = 769;\n    private final List<List<Integer>> buckets = new ArrayList<>();', '桶的个数是常量（`static final`）；`buckets` 是桶的列表，每个桶又是一个列表。'],
            ['\n\n    public MyHashSet() {\n        for (int i = 0; i < BASE; i++) {\n            buckets.add(new LinkedList<>());\n        }\n    }', '构造方法：放进 769 个空链表当桶。']
          ),
          rust: code(
            ['const BASE: usize = 769;', '桶的个数，写成常量。要拿它做下标，用 usize。'],
            ['\n\nstruct MyHashSet {\n    buckets: Vec<Vec<i32>>,\n}', '集合里只有一样东西：桶的列表，每个桶是一个 Vec。'],
            ['\n\nimpl MyHashSet {\n    fn new() -> Self {\n        MyHashSet { buckets: vec![Vec::new(); BASE] }\n    }', '构造函数习惯叫 `new`，返回 `Self` 也就是 MyHashSet。`vec![Vec::new(); BASE]` 复制出 769 个各自独立的空 Vec。']
          ),
        },
      },
      {
        section: '写代码',
        title: 'contains：只翻一个桶',
        say: ['查找最简单：用哈希函数算出桶号，只在这个桶里找。其他操作也要先找，所以先写它。'],
        ops: {
          python: code(['\n\n    def contains(self, key: int) -> bool:\n        return key in self.buckets[key % self.base]', '算出桶号 `key % 769`，只问这一个桶里有没有 key。桶很短，`in` 挨个比也很快。']),
          c: code(
            ['\n\nbool myHashSetContains(MyHashSet* obj, int key) {', 'C 的函数要先定义再使用；add 要用到「查」，所以先写它。'],
            ['\n    for (Node* p = obj->heads[key % BASE]; p; p = p->next) {', '从这个桶的头节点开始，顺着 next 一个个往后走，走到空指针就是到头了。'],
            ['\n        if (p->key == key) {\n            return true;\n        }\n    }\n    return false;\n}', '找到就是有；整串都没有就是没有。']
          ),
          cpp: code(['\n\n    bool contains(int key) {\n        auto& b = buckets[key % BASE];\n        return find(b.begin(), b.end(), key) != b.end();\n    }', '取出 key 的桶（`auto&` 是引用，不复制）。`find` 在开头到结尾之间找 key，找不到会返回 `end()`。']),
          java: code(['\n\n    public boolean contains(int key) {\n        return buckets.get(key % BASE).contains(key);\n    }', '取出 key 的桶，问它里面有没有 key。']),
          rust: code(['\n\n    fn contains(&self, key: i32) -> bool {\n        self.buckets[key as usize % BASE].contains(&key)\n    }', '只读不改，参数写 `&self`。key 转成 usize 再取余数得到桶号，问这个桶里有没有。']),
        },
      },
      {
        section: '写代码',
        title: 'add：桶里没有才放',
        say: [
          '放进去之前先看桶里有没有，集合里不能有重复的数。没有才放进它的桶。',
          { viz: { kind: 'grid', title: 'add 和冲突', frames: trace.buckets(5, OPS).slice(0, 3) } },
        ],
        ops: {
          python: code(['\n\n    def add(self, key: int) -> None:\n        bucket = self.buckets[key % self.base]\n        if key not in bucket:\n            bucket.append(key)', '取出它的桶；桶里没有才追加到末尾。`bucket` 和 self.buckets 里那个桶是同一个列表，改它就是改桶。']),
          c: code(
            ['\n\nvoid myHashSetAdd(MyHashSet* obj, int key) {\n    if (myHashSetContains(obj, key)) {\n        return;\n    }', '已经有了，什么都不做。'],
            ['\n    Node* node = malloc(sizeof(Node));\n    node->key = key;', '申请一个新节点，放进这个数。'],
            ['\n    node->next = obj->heads[key % BASE];\n    obj->heads[key % BASE] = node;\n}', '插到这串的最前面：新节点指向原来的头，再让它当新的头。插在前面不用走到末尾，一步就完。']
          ),
          cpp: code(['\n\n    void add(int key) {\n        if (!contains(key)) {\n            buckets[key % BASE].push_back(key);\n        }\n    }', '桶里没有才放到末尾。']),
          java: code(['\n\n    public void add(int key) {\n        if (!contains(key)) {\n            buckets.get(key % BASE).add(key);\n        }\n    }', '桶里没有才放到末尾。']),
          rust: code(['\n\n    fn add(&mut self, key: i32) {\n        if !self.contains(key) {\n            self.buckets[key as usize % BASE].push(key);\n        }\n    }', '要改集合，参数写 `&mut self`。桶里没有才放到末尾。']),
        },
      },
      {
        section: '写代码',
        title: 'remove：找到就拿掉',
        say: ['去它的桶里找，找到就拿掉；没有就什么都不做。C 的链表要多想一步：拿掉一个节点，要让它前面那个节点直接指向它后面那个；C 还要再补一个释放整个集合的函数。'],
        ops: {
          python: code(['\n\n    def remove(self, key: int) -> None:\n        bucket = self.buckets[key % self.base]\n        if key in bucket:\n            bucket.remove(key)', '桶里有才删：列表的 `remove` 删掉第一个等于 key 的元素；没有就调用会报错，所以先判断。']),
          c: code(
            ['\n\nvoid myHashSetRemove(MyHashSet* obj, int key) {\n    Node* prev = NULL;\n    Node* cur = obj->heads[key % BASE];', '顺着这个桶走，`cur` 是当前节点，`prev` 记它前面那个，删除时要用。'],
            ['\n    while (cur && cur->key != key) {\n        prev = cur;\n        cur = cur->next;\n    }', '一直往后走，直到找到 key 或者走到头。'],
            ['\n    if (!cur) {\n        return;\n    }', '走到头也没找到，什么都不做。'],
            ['\n    if (prev) {\n        prev->next = cur->next;\n    } else {\n        obj->heads[key % BASE] = cur->next;\n    }', '让前一个节点跳过 cur，直接指向 cur 后面的节点；如果 cur 就是头节点，那就让头变成它后面那个。'],
            ['\n    free(cur);\n}', 'cur 已经从链上摘下来了，把它的内存还回去。'],
            ['\n\nvoid myHashSetFree(MyHashSet* obj) {\n    for (int i = 0; i < BASE; i++) {\n        Node* p = obj->heads[i];', 'C 的集合和节点都是 `malloc` 来的，力扣还要求写一个释放函数。其他语言会自动回收，不用写。逐个桶释放。'],
            ['\n        while (p) {\n            Node* next = p->next;\n            free(p);\n            p = next;\n        }\n    }', '先记住下一个节点，再释放当前节点：释放以后就不能再读 `p->next` 了。'],
            ['\n    free(obj);\n}', '最后释放集合本身。']
          ),
          cpp: code(['\n\n    void remove(int key) {\n        buckets[key % BASE].remove(key);\n    }\n};', '`list` 的 `remove` 删掉所有等于 key 的元素，没有就什么都不做。类到这里写完，右花括号后加分号。']),
          java: code(['\n\n    public void remove(int key) {\n        buckets.get(key % BASE).remove(Integer.valueOf(key));\n    }\n}', '小心：`List` 有两个 remove，`remove(int)` 是按**下标**删，`remove(Object)` 才是按**值**删。直接传 int 会被当成下标，所以先用 `Integer.valueOf` 把它变成对象。']),
          rust: code(['\n\n    fn remove(&mut self, key: i32) {\n        let b = &mut self.buckets[key as usize % BASE];\n        if let Some(p) = b.iter().position(|&k| k == key) {\n            b.swap_remove(p);\n        }\n    }\n}', '`position` 找到 key 在桶里的位置；找到了，`swap_remove` 用最后一个元素填上它的位置，不用把后面的都往前挪。桶里的顺序不重要，这样更快。']),
        },
        sayBy: {
          python: [py('s.remove(x)', 'library/stdtypes.html#mutable-sequence-types', 'removes the first item from s where s[i] is equal to x', '删掉 s 里第一个等于 x 的元素。')],
          cpp: [cppdoc('list::remove(const T& value)', 'list.ops', 'Erases all the elements in the list referred to by a list iterator i for which the following conditions hold: *i == value, pred(*i) != false.', '删除链表里满足条件的所有元素：迭代器 i 指向的元素 *i == value（remove），或 pred(*i) 不为 false（remove_if）。')],
          java: [javadoc('List.remove(Object o)', 'java/util/List.html#remove(java.lang.Object)', 'Removes the first occurrence of the specified element from this list, if it is present (optional operation).', '如果列表里有指定的元素，删掉它第一次出现的那一个（可选操作）。')],
          rust: [rustdoc('Vec::swap_remove', 'vec/struct.Vec.html#method.swap_remove', 'Removes an element from the vector and returns it. The removed element is replaced by the last element of the vector.', '从 Vec 里删掉一个元素并返回它。被删的位置由最后一个元素填上。')],
        },
      },
      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '照着样例操作一遍',
        say: ['按题目的样例依次操作，打印每次 contains 的结果：true、false、true、false。再加一组冲突的：5 和 774 除以 769 都余 5，放在同一个桶里；删掉 5 以后，774 应该还在：true。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":\n    s = MyHashSet()', '写一个入口，创建一个集合。'],
            ['\n    s.add(1)\n    s.add(2)\n    print(s.contains(1))\n    print(s.contains(3))', '题目样例的前半。'],
            ['\n    s.add(2)\n    print(s.contains(2))\n    s.remove(2)\n    print(s.contains(2))', '重复放 2 不会出错；删掉以后就没了。'],
            ['\n    s.add(5)\n    s.add(774)\n    s.remove(5)\n    print(s.contains(774))', '5 和 774 在同一个桶里，删掉 5 不能连累 774。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'False', 'True', 'False', 'True'] }]),
          c: code(
            ['\n\nvoid show(bool b) {\n    printf("%s\\n", b ? "true" : "false");\n}', '一个小函数：按 true / false 打印。'],
            ['\n\nint main(void) {\n    MyHashSet* s = myHashSetCreate();', '创建一个集合。'],
            ['\n    myHashSetAdd(s, 1);\n    myHashSetAdd(s, 2);\n    show(myHashSetContains(s, 1));\n    show(myHashSetContains(s, 3));', '题目样例的前半。'],
            ['\n    myHashSetAdd(s, 2);\n    show(myHashSetContains(s, 2));\n    myHashSetRemove(s, 2);\n    show(myHashSetContains(s, 2));', '重复放 2；删掉以后就没了。'],
            ['\n    myHashSetAdd(s, 5);\n    myHashSetAdd(s, 774);\n    myHashSetRemove(s, 5);\n    show(myHashSetContains(s, 774));', '同一个桶里的两个数，删掉一个，另一个还在。'],
            ['\n    myHashSetFree(s);\n    return 0;\n}', '用完释放。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'false', 'true', 'false', 'true'] }]),
          cpp: code(
            ['\n\nint main() {\n    MyHashSet s;\n    cout << boolalpha;', '创建一个集合；`boolalpha` 让布尔值打印成 true / false。'],
            ['\n    s.add(1);\n    s.add(2);\n    cout << s.contains(1) << endl << s.contains(3) << endl;', '题目样例的前半。'],
            ['\n    s.add(2);\n    cout << s.contains(2) << endl;\n    s.remove(2);\n    cout << s.contains(2) << endl;', '重复放 2；删掉以后就没了。'],
            ['\n    s.add(5);\n    s.add(774);\n    s.remove(5);\n    cout << s.contains(774) << endl;\n    return 0;\n}', '同一个桶里的两个数，删掉一个，另一个还在。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'false', 'true', 'false', 'true'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        MyHashSet s = new MyHashSet();', '创建一个集合。'],
            ['\n        s.add(1);\n        s.add(2);\n        System.out.println(s.contains(1));\n        System.out.println(s.contains(3));', '题目样例的前半。'],
            ['\n        s.add(2);\n        System.out.println(s.contains(2));\n        s.remove(2);\n        System.out.println(s.contains(2));', '重复放 2；删掉以后就没了。'],
            ['\n        s.add(5);\n        s.add(774);\n        s.remove(5);\n        System.out.println(s.contains(774));\n    }\n}', '同一个桶里的两个数，删掉一个，另一个还在。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'false', 'true', 'false', 'true'] }]),
          rust: code(
            ['\n\nfn main() {\n    let mut s = MyHashSet::new();', '创建一个集合，要往里放东西，加 `mut`。'],
            ['\n    s.add(1);\n    s.add(2);\n    println!("{}", s.contains(1));\n    println!("{}", s.contains(3));', '题目样例的前半。'],
            ['\n    s.add(2);\n    println!("{}", s.contains(2));\n    s.remove(2);\n    println!("{}", s.contains(2));', '重复放 2；删掉以后就没了。'],
            ['\n    s.add(5);\n    s.add(774);\n    s.remove(5);\n    println!("{}", s.contains(774));\n}', '同一个桶里的两个数，删掉一个，另一个还在。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'false', 'true', 'false', 'true'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '哈希表与数组写完了',
        say: [
          '哈希表的三样东西都亲手写过了：桶、哈希函数、冲突处理。每个操作只翻一个桶，桶够多、够短，就是平均 O(1)。',
          '回顾这个模块：键的范围小时用数组（计数、原地标记），范围大时用哈希表（查找、计数、分组、去重）。遇到「见过没有」「出现几次」「属于哪一组」，先想到它们。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
