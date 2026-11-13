/*
 * 哈希表与数组 · 49 字母异位词分组（中等）
 * 钥匙：把单词的字母排好序。异位词的钥匙相同，用哈希表「钥匙 → 组号」把它们放进同一组。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { trace } = root.HT;

  const STRS = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'];
  const OUT = ['eat tea ate', 'tan nat', 'bat', 'a'];

  root.Catalog.addChapter('hash-table', {
    id: 'ht-49',
    label: '49',
    title: '字母异位词分组',
    summary: '给每个单词配一把钥匙：字母排好序。钥匙相同的就是异位词，用哈希表「钥匙 → 组号」分组。',
    problem: { id: 49, level: 'medium', url: leetcode('group-anagrams') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个字符串数组，请你将**字母异位词**组合在一起。可以按任意顺序返回结果列表。字母异位词是由重新排列源单词的所有字母得到的一个新单词。',
          {
            table: {
              head: ['输入', '输出'],
              rows: [
                ['`["eat", "tea", "tan", "ate", "nat", "bat"]`', '`[["bat"], ["nat", "tan"], ["ate", "eat", "tea"]]`'],
                ['`[""]`', '`[[""]]`'],
                ['`["a"]`', '`[["a"]]`'],
              ],
            },
          },
          { list: ['`1 <= strs.length <= 10^4`', '`0 <= strs[i].length <= 100`', '`strs[i]` 仅包含小写字母'] },
          '<a href="' + leetcode('group-anagrams') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：给每个单词配一把钥匙',
        doc: [
          '两两比较是不是异位词，要比 n² 对。换个想法：**给每个单词算一个「钥匙」，异位词的钥匙一样，不是异位词的钥匙不一样。** 然后按钥匙分组就行。',
          '什么能当钥匙？异位词的字母完全相同，只是顺序不同。那就把字母**排好序**：eat、tea、ate 排序后都是 aet，tan、nat 都是 ant。',
          '按钥匙分组，用哈希表：键是钥匙，值是这一组的编号。走到一个单词，算出钥匙，查表——',
          {
            list: [
              '表里没有：这是一个新组，编一个新号，开一个新的空组。',
              '表里有：放进那一组。',
            ],
          },
          '为什么值存「组号」，而不是直接把组存进表里？哈希表不记顺序，直接遍历它得到的组顺序是乱的。另外用一个列表按出现顺序放组，结果的顺序就是确定的：第一个单词所在的组排第一。',
          { viz: { kind: 'array', title: '样例 1', frames: trace.anagram(STRS) } },
          '设单词最长 k，每个单词排序 O(k log k)，总时间 O(n·k log k)；表和分组共 O(n·k) 空间。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '先搭好函数的架子',
        say: ['函数收一组单词，返回分好的组。C 版要自己写一个以字符串为键的哈希表：哈希函数把整个字符串算成一个数，比较键用 `strcmp`。'],
        ops: {
          python: code(['class Solution:\n    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:', '照例写类和方法：返回「字符串列表的列表」。']),
          c: code(
            ['#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>', '要用 `malloc`、`qsort`，以及字符串函数 `strlen`、`strcpy`、`strcmp`。'],
            ['\n\n#define CAP 32768\n\ntypedef struct {\n    char* key;\n    int group;\n} Slot;\n\nstatic Slot table[CAP];', '表的格子：键是钥匙字符串，值是组号。单词最多 10<sup>4</sup> 个，格子开 32768。`key` 是空指针表示这格没人用。'],
            ['\n\nstatic int slotOf(const char* key) {\n    unsigned h = 0;\n    for (const char* p = key; *p; p++) {\n        h = h * 31 + (unsigned char)*p;\n    }\n    h %= CAP;', '字符串的哈希函数：从左到右，每次把前面的结果乘 31 再加上当前字符。这样字母相同但顺序不同的字符串也会算出不同的数。用无符号数，溢出时自动绕回，不会出错。'],
            ['\n    while (table[h].key && strcmp(table[h].key, key) != 0) {\n        h = (h + 1) % CAP;\n    }\n    return h;\n}', '和前面的整数表一样：这格被别的钥匙占了就看下一格。字符串要用 `strcmp` 比内容，`==` 只会比两个指针是不是同一个地址。'],
            ['\n\nstatic int cmpChar(const void* a, const void* b) {\n    return *(const char*)a - *(const char*)b;\n}', '给 `qsort` 的比较函数：比较两个字符。字符的值很小，直接相减不会溢出。'],
            ['\n\nchar*** groupAnagrams(char** strs, int strsSize, int* returnSize, int** returnColumnSizes) {\n    memset(table, 0, sizeof(table));', '力扣规定的签名：返回「组的数组」，每组是字符串指针的数组；组数和每组的大小通过两个指针写回。表是静态的，先清空。']
          ),
          cpp: code(['#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {', '照例的架子，返回 `vector<vector<string>>`。']),
          java: code(['import java.util.ArrayList;\nimport java.util.Arrays;\nimport java.util.HashMap;\nimport java.util.List;\nimport java.util.Map;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {', '照例的架子，返回 `List<List<String>>`。']),
          rust: code(['use std::collections::HashMap;\n\nstruct Solution;\n\nimpl Solution {\n    pub fn group_anagrams(strs: Vec<String>) -> Vec<Vec<String>> {', '照例的架子，返回 `Vec<Vec<String>>`。']),
        },
      },
      {
        section: '写代码',
        title: '一张「钥匙 → 组号」的表，和按顺序放的组',
        say: ['准备两样东西：哈希表记每把钥匙对应第几组；一个列表按出现顺序放各组。C 要先数清楚每组多大才能申请空间，所以先记下每个单词属于哪一组。'],
        ops: {
          python: code(['\n        index = {}\n        groups = []', '`index`：钥匙 → 组号。`groups`：第 0 组、第 1 组……按出现的顺序放。']),
          c: code(['\n    int* groupOf = malloc(strsSize * sizeof(int));\n    int* sizes = calloc(strsSize, sizeof(int));\n    int groups = 0;', '`groupOf[i]` 记第 i 个单词在哪一组；`sizes[g]` 记第 g 组有几个，组数最多和单词数一样多，`calloc` 申请时顺便清零；`groups` 是已经开了几组。']),
          cpp: code(['\n        unordered_map<string, int> index;\n        vector<vector<string>> groups;', '`index`：钥匙 → 组号。`groups`：按出现顺序放的各组。']),
          java: code(['\n        Map<String, Integer> index = new HashMap<>();\n        List<List<String>> groups = new ArrayList<>();', '`index`：钥匙 → 组号。`groups`：按出现顺序放的各组。']),
          rust: code(['\n        let mut index: HashMap<String, usize> = HashMap::new();\n        let mut groups: Vec<Vec<String>> = Vec::new();', '`index`：钥匙 → 组号。`groups`：按出现顺序放的各组。']),
        },
      },
      {
        section: '写代码',
        title: '算钥匙，查表，放进组',
        say: [
          '逐个单词：先把字母排好序得到钥匙；表里没有这把钥匙，就开一个新组、记下组号；最后把单词放进它的组。',
          { viz: { kind: 'array', title: '按钥匙分组', frames: trace.anagram(STRS) } },
        ],
        ops: {
          python: code(
            ['\n        for s in strs:', '逐个单词。'],
            ['\n            key = "".join(sorted(s))', '`sorted(s)` 把单词的字母排好序，得到一个字符列表；`"".join` 把它们重新接成字符串，就是钥匙。'],
            ['\n            if key not in index:\n                index[key] = len(groups)\n                groups.append([])', '新钥匙：组号就是现在已有的组数，再开一个空组。'],
            ['\n            groups[index[key]].append(s)', '查出组号，把原来的单词放进那一组。'],
            ['\n        return groups', '按出现顺序排好的各组。']
          ),
          c: code(
            ['\n    for (int i = 0; i < strsSize; i++) {\n        char* key = malloc(strlen(strs[i]) + 1);\n        strcpy(key, strs[i]);', '逐个单词。钥匙要排序，不能改原来的单词，先复制一份：长度加一是为了结尾的 `\\0`。'],
            ['\n        qsort(key, strlen(key), 1, cmpChar);', '把副本的字母排序：每个元素是一个字符，大小 1。'],
            ['\n        int s = slotOf(key);\n        if (table[s].key == NULL) {\n            table[s].key = key;\n            table[s].group = groups++;', '新钥匙：放进表里（表接管这份字符串），编下一个组号。'],
            ['\n        } else {\n            free(key);\n        }', '已经有了：这份副本用不上，释放掉。'],
            ['\n        groupOf[i] = table[s].group;\n        sizes[groupOf[i]]++;\n    }', '记下这个单词属于哪一组，那一组的人数加一。'],
            ['\n    char*** res = malloc(groups * sizeof(char**));\n    for (int g = 0; g < groups; g++) {\n        res[g] = malloc(sizes[g] * sizeof(char*));\n        sizes[g] = 0;\n    }', '现在知道每组多大了，给每组申请空间。顺手把 sizes 清零，下面一边放一边重新数，当作「这一组放到第几个了」。'],
            ['\n    for (int i = 0; i < strsSize; i++) {\n        int g = groupOf[i];\n        res[g][sizes[g]++] = strs[i];\n    }', '按原来的顺序，把每个单词放进它的组。放完 sizes 又恢复成了每组的人数。'],
            ['\n    for (int h = 0; h < CAP; h++) {\n        free(table[h].key);\n    }\n    free(groupOf);', '表里的钥匙和 groupOf 都用完了，释放。`free` 一个空指针什么都不做，不用判断。'],
            ['\n    *returnSize = groups;\n    *returnColumnSizes = sizes;\n    return res;\n}', '写回组数和每组大小，返回结果。']
          ),
          cpp: code(
            ['\n        for (string& s : strs) {', '逐个单词，`string&` 不复制。'],
            ['\n            string key = s;\n            sort(key.begin(), key.end());', '复制一份再把字母排好序，就是钥匙。'],
            ['\n            if (!index.count(key)) {\n                index[key] = groups.size();\n                groups.push_back({});\n            }', '新钥匙：组号是现在的组数，再开一个空组。'],
            ['\n            groups[index[key]].push_back(s);\n        }\n        return groups;\n    }\n};', '把单词放进它的组。']
          ),
          java: code(
            ['\n        for (String s : strs) {', '逐个单词。'],
            ['\n            char[] chars = s.toCharArray();\n            Arrays.sort(chars);\n            String key = new String(chars);', 'Java 的字符串不能改，先变成字符数组，排好序，再拼回字符串当钥匙。'],
            ['\n            if (!index.containsKey(key)) {\n                index.put(key, groups.size());\n                groups.add(new ArrayList<>());\n            }', '新钥匙：组号是现在的组数，再开一个空组。'],
            ['\n            groups.get(index.get(key)).add(s);\n        }\n        return groups;\n    }\n}', '把单词放进它的组。']
          ),
          rust: code(
            ['\n        for s in strs {', '逐个单词。这样写会把每个 String 从 strs 里拿出来（转移所有权），正好可以直接放进组里，不用复制。'],
            ['\n            let mut chars: Vec<char> = s.chars().collect();\n            chars.sort();\n            let key: String = chars.into_iter().collect();', '把字母拆成字符数组，排好序，再收集回一个 String，就是钥匙。'],
            ['\n            let g = if let Some(&g) = index.get(&key) {\n                g', '表里有这把钥匙：取出它的组号。'],
            ['\n            } else {\n                index.insert(key, groups.len());\n                groups.push(Vec::new());\n                groups.len() - 1\n            };', '没有：组号是现在的组数，记进表，再开一个空组。整个 `if` 表达式的值就是组号 g。'],
            ['\n            groups[g].push(s);\n        }\n        groups\n    }\n}', '把单词放进它的组。']
          ),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '跑样例，每组一行',
        say: ['每组打印成一行，组里的单词用空格隔开。预期：eat tea ate / tan nat / bat，然后是第二个样例的 a。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    for strs in [["eat", "tea", "tan", "ate", "nat", "bat"], ["a"]]:\n        for g in Solution().groupAnagrams(strs):\n            print(" ".join(g))', '两组输入，每组用空格连起来打印成一行。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: OUT }]),
          c: code(
            ['\n\nvoid show(char** strs, int n) {\n    int groups, *sizes;\n    char*** res = groupAnagrams(strs, n, &groups, &sizes);', '写一个小函数：调用题目的函数，拿到组数和每组大小。'],
            ['\n    for (int g = 0; g < groups; g++) {\n        for (int k = 0; k < sizes[g]; k++) {\n            printf(k > 0 ? " %s" : "%s", res[g][k]);\n        }\n        printf("\\n");\n        free(res[g]);\n    }\n    free(res);\n    free(sizes);\n}', '每组一行，单词之间加空格；打印完把申请的内存都释放。组里的字符串指向原来的单词，不归我们释放。'],
            ['\n\nint main(void) {\n    char* a[] = {"eat", "tea", "tan", "ate", "nat", "bat"};\n    char* b[] = {"a"};\n    show(a, 6);\n    show(b, 1);\n    return 0;\n}', '两组输入。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: OUT }]),
          cpp: code(
            ['\n\nint main() {\n    vector<vector<string>> cases = {{"eat", "tea", "tan", "ate", "nat", "bat"}, {"a"}};', '两组输入。'],
            ['\n    for (auto& strs : cases) {\n        for (auto& g : Solution().groupAnagrams(strs)) {\n            for (size_t k = 0; k < g.size(); k++) {\n                cout << (k > 0 ? " " : "") << g[k];\n            }\n            cout << endl;\n        }\n    }\n    return 0;\n}', '每组一行，单词之间加空格。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: OUT }]),
          java: code(['\n\npublic class Main {\n    public static void main(String[] args) {\n        String[][] cases = {{"eat", "tea", "tan", "ate", "nat", "bat"}, {"a"}};\n        for (String[] strs : cases) {\n            for (List<String> g : new Solution().groupAnagrams(strs)) {\n                System.out.println(String.join(" ", g));\n            }\n        }\n    }\n}', '两组输入，`String.join` 用空格把一组连成一行。']).concat([{ pause: 500 }, { run: RUN.java, output: OUT }]),
          rust: code(['\n\nfn main() {\n    for strs in [vec!["eat", "tea", "tan", "ate", "nat", "bat"], vec!["a"]] {\n        let strs: Vec<String> = strs.iter().map(|s| s.to_string()).collect();\n        for g in Solution::group_anagrams(strs) {\n            println!("{}", g.join(" "));\n        }\n    }\n}', '两组输入，先把字面量变成 String；每组用空格连成一行。']).concat([{ pause: 500 }, { run: RUN.rust, output: OUT }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '分组题的套路：想一把「同组相同、异组不同」的钥匙，用哈希表从钥匙找到组。另外用列表按出现顺序放组，结果顺序就是确定的。时间 O(n·k log k)。',
          '下一题「最长连续序列」用的是哈希集合：只关心「某个数在不在」。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
