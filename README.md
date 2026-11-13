# CPA · Code Programming Animation

看视频学编程参与感不够，跟着敲代码又没时间。CPA 取中间的路：先读几页思路，再看代码在编辑器里一个字一个字写出来，每一页由自己翻。

旁白按人思考的顺序走：每一步开头先说要解决什么；之后每写一行代码之前，旁白里先出现引出这一行的那个念头，停一下，再把这一行写出来。

在线版：<https://yifengz17.github.io/LLM-from-scratch-animation/>

## 现有课程

| 课程 | 内容 | 规模 | 语言 |
|---|---|---|---|
| 从零手写 Transformer | 嵌入、位置编码、层归一化、前馈网络、多头注意力、编码器、解码器、组装成模型 | 6 章 95 页，`model.py` 写到 241 行 | Python（PyTorch） |
| 滑动窗口 | 概念与模板，然后 643、1876、219、209、3、438、76 七道题，从简单到困难 | 8 章 69 页 | Python、C、C++、Java、Rust |
| 动态规划 | 概念（从递归到填表、四步法），然后 7 个子模块 29 道题：一维递推、子数组、股票、网格、背包、子序列与字符串、区间与计数 | 30 章 219 页 | Python、C、C++、Java、Rust |

每章最后都会真实运行一次。页面终端里的输出，全部用真实的 PyTorch、Python、gcc、g++、Java、Rust 跑过，逐行一致（41 次运行）。

后续计划（其余 15 类 LeetCode 题、Python 入门、C 语言入门、导出视频）见 [PLAN.md](PLAN.md)。

## 两套界面

| | 展厅：首页、课程页 | 工作间：编辑器 |
|---|---|---|
| 做什么 | 选课、看进度 | 看代码长出来 |
| 样子 | 固定的深色展示页，背景是按位置编码公式实时计算的点阵波纹 | VS Code 风格的编辑器，6 种风格 × 深浅两套主题 |

首页的代码样片不是手写的演示：它用编辑器的同一套引擎，重放课程里真实的几步，代码在左，思路在右。

网址：

| 网址 | 页面 |
|---|---|
| 空，或 `#home` | 首页 |
| `#transformer`、`#sliding-window` | 课程页 |
| `#transformer-3`、`#sliding-window-5` | 编辑器，某门课的第几章 |
| `#ch3` | 旧网址，自动换成 `#transformer-3` |

## 编辑器怎么用

| 操作 | 作用 |
|---|---|
| `→` / 空格 / 「继续」按钮 | 写代码页：读完旁白后开始写；打字时按一次直接看结果；写完后进入下一页。一章的最后一页进入下一章 |
| `←` | 回到上一页，在一章的第一页回到上一章 |
| `P` / 「暂停」 | 暂停或恢复：对正在打的代码和自动播放的倒计时都有效 |
| `L` / 状态栏的语言名 | 算法课程换语言：同一页的代码和思路换成那种语言的版本 |
| `T` / 调色板图标 | 选择颜色主题，`↑` `↓` 换风格、`←` `→` 换亮暗，即时预览 |
| 标题栏左边的 CPA | 回到课程页 |
| 左侧目录 | 按「章 › 小节 › 页」排列，点任意一页跳过去，右边的数字是看过了几页 |
| 旁白里的一条念头 | 鼠标移上去，编辑器里对应的那一行会亮起来 |
| 右下角「自动播放」 | 自动打字、自动翻页；页里有演示动图时，等动图播完再翻页 |

写代码页分三个阶段：先出旁白，光标停在要写的位置；读完按一下，念头和代码交替出现；写完再按一下进入下一页。行号旁的绿色标记是这一页新写的行，蓝色是改过的行，强调色是正在写的那一行。

## 目录结构

```
index.html                  页面骨架：展厅和编辑器两套外壳
css/site.css                展厅的外观
css/style.css               编辑器的外观，颜色全部用变量，由主题决定
css/viz.css                 图形演示的外观
js/themes.js                编辑器的颜色主题：6 种风格 × 深浅两套
js/catalog.js               课程目录：板块、课程、各章；多语言章节按语言取出对应版本
js/store.js                 学习进度和设置，存在浏览器里
js/highlight.js             语法高亮：Python、C、C++、Java、Rust
js/engine.js                播放引擎：把一步里的操作展开成逐字符的编辑动作，不依赖浏览器
js/viz.js                   图形演示：按帧播放的数组条（窗口、指针、变量）
js/player.js                编辑器：把引擎的状态画到页面上，处理翻页、思路流、语言切换
js/site.js                  展厅：首页和课程页
js/main.js                  路由：按网址显示展厅或编辑器
lessons/kit.js              课程脚本的公共写法：引用各语言官方文档和论文
lessons/transformer/        从零手写 Transformer（00-course.js 定义课程，01-06 是各章）
lessons/sliding-window/     滑动窗口（00-course.js 定义课程和演示的帧，01 概念，02-08 七道题）
lessons/dynamic-programming/ 动态规划（00-course.js 定义课程，00-course.js 与 00-traces.js 生成 DP 表的帧，01 概念，02-30 每题一个文件，按子模块分组）
tools/verify.mjs            校验所有课程和语言，并导出每章写完后的文件
tools/check-outputs.mjs     真实运行每章最后的终端命令，和脚本里写的输出逐行比较
tools/bundle.mjs            合并成单个 HTML 文件
tools/deploy.sh             把站点文件发布到 gh-pages 分支（GitHub Pages）
```

## 怎么写一章

内容和播放器是分开的。一门课是 `lessons/` 下的一个目录：`00-course.js` 用 `Catalog.defineCourse` 定义课程，之后每个文件用 `Catalog.addChapter` 加一章，再在 `index.html` 里各加一行 `<script>`。接续写的课程（`chain: true`，如 Transformer）后一章从前一章结束时的代码开始。

### 一页

前置知识页带 `doc`，不写代码；写代码页带 `say` 和 `ops`：

```js
{
  section: '写代码',
  title: '让窗口一格一格往右挪',
  say: ['现在让框一格一格往右挪，直到右边碰到数组末尾。每挪一格，和会怎么变？……'],
  ops: [
    { type: '\n        for right in range(k, len(nums)):', note: '框要一格一格挪，这就需要一个循环。用 `right` 表示框的右端……' },
    { type: '\n            window += nums[right] - nums[right - k]', note: '挪一格：右边进来的是 `nums[right]`，左边掉出去的是……' },
  ],
}
```

- `say` 是这一步开头的思路：要解决什么，为什么。
- 每个打字操作的 `note` 是引出这一行的念头：先说当时在想什么、为什么需要它，再补语法细节。念头出现后会按字数停顿一下，再开始打这一行。
- 念头只显示在旁白里，不写进文件，所以文件内容和真实运行的代码完全一样。

### 多种语言

算法课程在 `defineCourse` 里写 `langs`，章里随语言变化的字段写成「语言 → 值」的对象，播放器和校验工具会用 `Catalog.resolve` 取出某种语言的版本：

```js
files: { python: ['solution.py'], c: ['solution.c'], … },
ops: {
  python: code(['\n        window = sum(nums[:k])', '先算最左边这个框……']),
  c: code(['\n    int window = 0;', '要把前 k 个数加起来，先准备一个从 0 开始的累加器……']),
  …
},
sayBy: { python: [py('sum(…)', …)], rust: [rustdoc('Iterator::sum', …)] },  // 只在某种语言下出现的旁白和引用
```

`code([代码, 念头], …)` 来自 `lessons/sliding-window/00-course.js`，把一对对代码和念头写成打字操作。

### 旁白和文档里能放的东西

| 写法 | 含义 |
|---|---|
| `'一段文字'` | 段落。用反引号标代码、双星号加粗 |
| `ref(…)`、`py(…)`、`paper(…)` | 引用 PyTorch 文档、Python 文档、论文 |
| `cdoc(…)`、`cppdoc(…)`、`javadoc(…)`、`rustdoc(…)` | 引用 GNU C 库手册、C++ 标准草案、Java 文档、Rust 文档 |
| `{ viz: { kind: 'array', title, frames } }` | 图形演示：数组条，按帧播放。帧由 `SW.trace.*` 这类函数在样例上真的跑一遍算法生成 |
| `{ shape: ['(a, b)', '(a, b, c)'], label }` | 形状变化 |
| `{ formula: ['一行', …] }` | 公式 |
| `{ table: { head, rows, num, note } }` | 表格，`num` 是右对齐的数字列 |
| `{ list: ['一项', …] }` | 列表 |
| `{ code: '…' }` 或 `{ code: { python: '…', c: '…' } }` | 带高亮的代码块，可以按语言给不同的版本 |
| `{ flow: [{ label, sub, part }, …] }` | 数据流图 |
| `{ roadmap: { done, now } }` | 课程路线图 |

写代码页里的引用会集中放在旁白最后的「这一步用到的文档」里，不打断思路。引用的原文必须和出处一致，现有的引文都核对过：PyTorch 对照源码里的文档字符串，Python 对照 CPython 的文档源文件，C 对照 glibc 手册源文件，C++ 对照 C++ 标准草案，Java 对照 OpenJDK 源码里的 Javadoc，Rust 对照标准库源码里的文档注释，论文对照 Annotated Transformer 逐段摘录的原文。

### 打字操作

| 操作 | 含义 |
|---|---|
| `{ type: '文本', note }` | 在文件末尾打字 |
| `{ type: '文本', after: '锚点', note }` | 在锚点文本之后打字（回头补代码） |
| `{ type: '文本', before: '锚点', note }` | 在锚点文本之前打字 |
| `{ replace: '旧文本', with: '新文本', note }` | 选中旧文本，删掉，打新文本 |
| `{ remove: '文本' }` | 选中并删掉 |
| `{ clear: '文件名' }` | 全选这个文件并删掉，准备重写 |
| `{ run: '命令', output: ['一行', …] }` | 在终端里运行并显示输出 |
| `{ pause: 毫秒 }` | 停一下 |

锚点文本必须在文件里恰好出现一次，写错了页面加载时会直接报出是哪一步。

### 校验

```bash
node tools/verify.mjs /tmp/out
```

把每门课的每种语言都逐格播放一遍，确认播放的结果和直接跳转的结果一致、语法高亮和源码对得上，并把每章写完后的文件导出到 `/tmp/out/课程/[语言/]章/`。

```bash
node tools/check-outputs.mjs /tmp/out python3
```

在每章导出的目录里执行脚本里写的终端命令（`python3`、`gcc`、`g++`、`javac`、`rustc`），和脚本里写的输出逐行比较。第二个参数是 Python 解释器，Transformer 课程需要装好 PyTorch。第三个参数可选，只核对 id 以它开头的章，比如 `dp-1143`。

## 以后的方向

引擎不碰页面也不计时，只负责产出「下一个编辑动作，以及之后该停多久」，打字节奏用固定种子的随机数生成，重复播放完全一致。所以换一种驱动方式，就能按固定帧率逐帧截图，合成教学视频。

## 内容来源

- Transformer 的代码来自 [hkproj/pytorch-transformer](https://github.com/hkproj/pytorch-transformer) 的 `model.py`，书写顺序参考 Umar Jamil 的视频 [Coding a Transformer from scratch on PyTorch](https://www.youtube.com/watch?v=ISNdQcPhsts)：类按视频里写的先后排列。和原文件相比有几处小调整：
  - 说明性的英文注释不保留，只保留标注张量形状的注释；
  - 关键字参数两边的空格按 PEP 8 去掉（如 `dim=-1`），`ResidualConnection` 多出的一层缩进改成标准的 4 格；
  - `ProjectionLayer.forward` 上和返回值不符的 `-> None` 注解去掉了。
- 滑动窗口和动态规划的题目来自题单 [The-Summer-of-2026 · Leetcode_sheet.md](https://github.com/YiFengZ17/The-Summer-of-2026/blob/main/Leetcode_sheet.md)，题意用自己的话转述，样例和数据范围与力扣一致。
- 部件和函数的说明引用自各语言的官方文档和论文 [Attention Is All You Need](https://arxiv.org/abs/1706.03762)。
