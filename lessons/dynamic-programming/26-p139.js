/*
 * 动态规划 · 子序列与字符串 · 139 单词拆分（中等）
 * dp[i]：前 i 个字符能不能拆开。看最后一个单词是字典里的哪个。
 */
(function (root) {
  'use strict';

  const { code, RUN, FILES, leetcode } = root.LessonKit.algo;
  const { cdoc, javadoc } = root.LessonKit;
  const { trace } = root.DP;

  root.Catalog.addChapter('dynamic-programming', {
    id: 'dp-139',
    group: '子序列与字符串',
    label: '139',
    title: '单词拆分',
    summary: '前 i 个字符能拆开 ⇔ 有个单词正好是它的结尾，而去掉这个单词后的前缀也能拆开。',
    problem: { id: 139, level: 'medium', url: leetcode('word-break') },
    files: FILES,
    docName: '题目与思路.md',
    docKicker: '题目与思路',
    steps: [
      /* ============================================================ 题目与思路 */
      {
        section: '题目与思路',
        title: '题目',
        doc: [
          '给你一个字符串 `s` 和一个字符串列表 `wordDict` 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 `s`，则返回 `true`。注意：不要求字典中出现的单词全部都使用，并且字典中的单词可以重复使用。',
          {
            table: {
              head: ['输入', '输出', '说明'],
              rows: [
                ['`s = "leetcode"`, `wordDict = ["leet", "code"]`', '`true`', 'leet + code'],
                ['`s = "applepenapple"`, `wordDict = ["apple", "pen"]`', '`true`', 'apple + pen + apple，单词可以重复用'],
                ['`s = "catsandog"`, `wordDict = ["cats", "dog", "sand", "and", "cat"]`', '`false`', ''],
              ],
            },
          },
          { list: ['`1 <= s.length <= 300`', '`1 <= wordDict.length <= 1000`', '`1 <= wordDict[i].length <= 20`', '`s` 和 `wordDict[i]` 仅由小写英文字母组成', '`wordDict` 中的所有字符串互不相同'] },
          '<a href="' + leetcode('word-break') + '" target="_blank" rel="noopener">在力扣上打开这道题 ↗</a>',
        ],
      },
      {
        section: '题目与思路',
        title: '思路：最后一个单词是哪个',
        doc: [
          '从左往右贪心地切，会出问题：`catsandog` 先切出 `cat` 还是 `cats`，后面的结果完全不同。要把各种切法都考虑到。',
          '用前缀当状态：**`dp[i]` 表示 s 的前 i 个字符能不能拆成字典里的单词**。盯住这段前缀的**最后一个单词**：如果字典里某个单词 w 正好是前 i 个字符的结尾，并且去掉它以后剩下的前 `i - len(w)` 个字符也能拆开，那前 i 个字符就能拆开。',
          {
            table: {
              head: ['', '单词拆分'],
              rows: [
                ['状态', '`dp[i]`：前 i 个字符能不能拆开'],
                ['转移', '存在单词 w：`s` 的第 `i - len(w)` 到 `i - 1` 个字符就是 w，并且 `dp[i - len(w)]` 为真'],
                ['初始值', '`dp[0] = true`：空串什么都不用拆'],
                ['顺序与答案', 'i 从 1 到 n；答案 `dp[n]`'],
              ],
            },
          },
          { viz: { kind: 'grid', title: '"leetcode"', frames: trace.wordBreak('leetcode', ['leet', 'code']) } },
          '和零钱兑换很像：单词是「硬币」，字符串长度是「金额」，只不过硬币放进去之前还要核对字符对不对得上。每个位置把每个单词试一遍，单词最长 20，时间 O(n × 单词数 × 20)。',
        ],
      },

      /* ================================================================ 写代码 */
      {
        section: '写代码',
        title: '架子，和 dp[0] = true',
        say: ['函数收字符串和字典，返回能不能拆。表的下标是前缀长度，0 到 n；空串能拆。'],
        ops: {
          python: code(
            ['class Solution:\n    def wordBreak(self, s: str, wordDict: list[str]) -> bool:', '照例写类和方法。'],
            ['\n        n = len(s)\n        dp = [False] * (n + 1)\n        dp[0] = True', '下标是前缀长度 0 到 n，先全是 False；空串什么都不用拆，dp[0] 为真。']
          ),
          c: code(
            ['#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>', '要用 `bool`，以及 `strlen`、`strncmp` 这两个字符串函数。'],
            ['\n\nbool wordBreak(char* s, char** wordDict, int wordDictSize) {', '题目给的函数：字典是字符串指针的数组，外加单词个数。'],
            ['\n    int n = strlen(s);\n    bool dp[301] = {false};\n    dp[0] = true;', 's 最长 300，表开 301 格，全清成 false；空串能拆。']
          ),
          cpp: code(
            ['#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {', '照例的架子。'],
            ['\n        int n = s.size();\n        vector<bool> dp(n + 1, false);\n        dp[0] = true;', '下标 0 到 n，空串能拆。']
          ),
          java: code(
            ['import java.util.List;\n\nclass Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {', '照例的架子，字典是 `List<String>`，先导入 List。'],
            ['\n        int n = s.length();\n        boolean[] dp = new boolean[n + 1];\n        dp[0] = true;', '下标 0 到 n，空串能拆。']
          ),
          rust: code(
            ['struct Solution;\n\nimpl Solution {\n    pub fn word_break(s: String, word_dict: Vec<String>) -> bool {', '照例的架子。'],
            ['\n        let n = s.len();\n        let mut dp = vec![false; n + 1];\n        dp[0] = true;', '下标 0 到 n，空串能拆。题目只有小写字母，`len()` 的字节数就是字符数。']
          ),
        },
      },
      {
        section: '写代码',
        title: '每个前缀：试每个单词当最后一个',
        say: [
          '前缀长度 i 从小到大。对每个单词 w：它不能比前缀还长；去掉它后剩下的前缀要能拆；前缀的末尾要正好是 w。三个条件都满足，前 i 个字符就能拆，后面的单词也不用再试了。',
          { viz: { kind: 'grid', title: '最后一个单词', frames: trace.wordBreak('leetcode', ['leet', 'code']) } },
        ],
        ops: {
          python: code(
            ['\n        for i in range(1, n + 1):', '前缀长度从 1 到 n，用到的 dp[i - len(w)] 都更短，已经算好。'],
            ['\n            for w in wordDict:', '每个单词都试一次当最后一个。'],
            ['\n                if len(w) <= i and dp[i - len(w)] and s[i - len(w):i] == w:', '三个条件：单词不比前缀长；去掉它后的前缀能拆；前缀的最后 len(w) 个字符就是 w。`and` 从左往右检查，前面不成立就不看后面，所以切片和下标都不会越界。把最便宜的检查放在前面，也省了很多字符串比较。'],
            ['\n                    dp[i] = True\n                    break', '找到一种拆法就够了，`break` 跳出单词的循环，看下一个前缀。']
          ),
          c: code(
            ['\n    for (int i = 1; i <= n; i++) {', '前缀长度从 1 到 n。'],
            ['\n        for (int k = 0; k < wordDictSize; k++) {\n            int len = strlen(wordDict[k]);', '每个单词都试一次，先取出它的长度。'],
            ['\n            if (len <= i && dp[i - len] && strncmp(s + i - len, wordDict[k], len) == 0) {', '单词不比前缀长；去掉它后的前缀能拆；从 `s + i - len` 开始的 len 个字符和单词完全一样（`strncmp` 返回 0）。'],
            ['\n                dp[i] = true;\n                break;\n            }\n        }\n    }', '找到一种拆法就够了，跳出单词的循环。']
          ),
          cpp: code(
            ['\n        for (int i = 1; i <= n; i++) {', '前缀长度从 1 到 n。'],
            ['\n            for (const string& w : wordDict) {\n                int len = w.size();', '每个单词都试一次。`const string&` 只读、不复制。'],
            ['\n                if (len <= i && dp[i - len] && s.compare(i - len, len, w) == 0) {', '单词不比前缀长；去掉它后的前缀能拆；`s.compare(起点, 长度, w)` 拿 s 的这一段和 w 比，相同返回 0。'],
            ['\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }', '找到一种拆法就够了。']
          ),
          java: code(
            ['\n        for (int i = 1; i <= n; i++) {', '前缀长度从 1 到 n。'],
            ['\n            for (String w : wordDict) {\n                int len = w.length();', '每个单词都试一次。'],
            ['\n                if (len <= i && dp[i - len] && s.startsWith(w, i - len)) {', '单词不比前缀长；去掉它后的前缀能拆；从下标 i - len 开始，s 是不是以 w 开头。'],
            ['\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }', '找到一种拆法就够了。']
          ),
          rust: code(
            ['\n        for i in 1..=n {', '前缀长度从 1 到 n。'],
            ['\n            for w in &word_dict {\n                let len = w.len();', '每个单词都试一次，`&word_dict` 只借用、不拿走。'],
            ['\n                if len <= i && dp[i - len] && &s[i - len..i] == w.as_str() {', '单词不比前缀长；去掉它后的前缀能拆；s 的这一段切片和单词相同。两边都是 `&str` 才能直接比较。'],
            ['\n                    dp[i] = true;\n                    break;\n                }\n            }\n        }', '找到一种拆法就够了。']
          ),
        },
        sayBy: {
          c: [cdoc('strncmp(const char *s1, const char *s2, size_t size)', 'String_002fArray-Comparison.html', 'This function is the similar to strcmp, except that no more than size bytes are compared. In other words, if the two strings are the same in their first size bytes, the return value is zero.', '这个函数和 strcmp 类似，只是最多比较 size 个字节。换句话说，两个字符串的前 size 个字节相同时，返回 0。')],
          java: [javadoc('String.startsWith(String prefix, int toffset)', 'java/lang/String.html#startsWith(java.lang.String,int)', 'Tests if the substring of this string beginning at the specified index starts with the specified prefix.', '检查这个字符串从指定下标开始的子串，是否以指定的前缀开头。')],
        },
      },
      {
        section: '写代码',
        title: '答案是整个字符串那一格',
        say: ['前 n 个字符就是整个 s。'],
        ops: {
          python: code(['\n        return dp[n]', '整个字符串能不能拆。']),
          c: code(['\n    return dp[n];\n}', '整个字符串能不能拆。']),
          cpp: code(['\n        return dp[n];\n    }\n};', '整个字符串能不能拆。']),
          java: code(['\n        return dp[n];\n    }\n}', '整个字符串能不能拆。']),
          rust: code(['\n        dp[n]\n    }\n}', '整个字符串能不能拆。']),
        },
      },

      /* ============================================================== 运行验证 */
      {
        section: '运行验证',
        title: '用三个样例跑一遍',
        say: ['预期：true、true、false。'],
        ops: {
          python: code(
            ['\n\n\nif __name__ == "__main__":', '写一个入口。'],
            ['\n    print(Solution().wordBreak("leetcode", ["leet", "code"]))\n    print(Solution().wordBreak("applepenapple", ["apple", "pen"]))\n    print(Solution().wordBreak("catsandog", ["cats", "dog", "sand", "and", "cat"]))', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.python, output: ['True', 'True', 'False'] }]),
          c: code(
            ['\n\nint main(void) {', '写一个入口。'],
            ['\n    char* d1[] = {"leet", "code"};\n    char* d2[] = {"apple", "pen"};\n    char* d3[] = {"cats", "dog", "sand", "and", "cat"};', '三个字典，各是一个字符串指针数组。'],
            ['\n    bool r[] = {wordBreak("leetcode", d1, 2), wordBreak("applepenapple", d2, 2), wordBreak("catsandog", d3, 5)};\n    for (int k = 0; k < 3; k++) {\n        printf("%s\\n", r[k] ? "true" : "false");\n    }\n    return 0;\n}', '三个结果，按 true / false 打印。']
          ).concat([{ pause: 500 }, { run: RUN.c, output: ['true', 'true', 'false'] }]),
          cpp: code(
            ['\n\nint main() {', '写一个入口。'],
            ['\n    vector<string> d1 = {"leet", "code"}, d2 = {"apple", "pen"}, d3 = {"cats", "dog", "sand", "and", "cat"};\n    Solution s;\n    cout << boolalpha;', '三个字典；`boolalpha` 让布尔值打印成 true / false。'],
            ['\n    cout << s.wordBreak("leetcode", d1) << endl << s.wordBreak("applepenapple", d2) << endl << s.wordBreak("catsandog", d3) << endl;\n    return 0;\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.cpp, output: ['true', 'true', 'false'] }]),
          java: code(
            ['\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution s = new Solution();', '写一个入口。'],
            ['\n        System.out.println(s.wordBreak("leetcode", List.of("leet", "code")));\n        System.out.println(s.wordBreak("applepenapple", List.of("apple", "pen")));\n        System.out.println(s.wordBreak("catsandog", List.of("cats", "dog", "sand", "and", "cat")));\n    }\n}', '`List.of(…)` 当场造一个不可修改的列表，正好当字典用。']
          ).concat([{ pause: 500 }, { run: RUN.java, output: ['true', 'true', 'false'] }]),
          rust: code(
            ['\n\nfn words(ws: &[&str]) -> Vec<String> {\n    ws.iter().map(|w| w.to_string()).collect()\n}', '写一个小工具：把一串字面量变成 `Vec<String>`，测试时少打点字。'],
            ['\n\nfn main() {\n    println!("{}", Solution::word_break("leetcode".to_string(), words(&["leet", "code"])));\n    println!("{}", Solution::word_break("applepenapple".to_string(), words(&["apple", "pen"])));\n    println!("{}", Solution::word_break("catsandog".to_string(), words(&["cats", "dog", "sand", "and", "cat"])));\n}', '三个样例。']
          ).concat([{ pause: 500 }, { run: RUN.rust, output: ['true', 'true', 'false'] }]),
        },
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这道题写完了',
        say: [
          '又是「看最后一块」：前缀能拆，当且仅当最后一个单词对得上、前面那段也能拆。和零钱兑换的结构一模一样。',
          '最后两题是困难题。「最长有效括号」的状态回到「以第 i 个字符结尾」，难在转移要往前跳过一整段。',
        ],
      },
    ],
  });
})(typeof window !== 'undefined' ? window : globalThis);
