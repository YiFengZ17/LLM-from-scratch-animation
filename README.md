# 从零手写 Transformer：翻页看代码

看视频学 Transformer 参与感不够，跟着敲代码又没时间。这个项目取中间的路：
页面是一个 VS Code 样子的编辑器，每翻一页，代码一个字符一个字符打出来，旁白在一旁说明。
节奏由读者控制，可以前翻、后翻、按目录跳转。

目前是演示版，只有第 1 章（词嵌入与位置编码，25 页）。

## 一章的结构

每一章分两段，概念和写代码分开：

1. **前置知识页**：不写代码。编辑区打开一个「前置知识.md」的预览，一页讲一件事，把这一章用到的概念讲完。
2. **写代码页**：旁白只讲两件事：用到的部件是什么（引用 PyTorch 官方文档或论文的原文，附中文和链接），
   以及为什么这样写、为什么按这个顺序写。概念不在这里重复，需要时点「前置知识.md」标签回去查。

## 怎么看

在线版：<https://yifengz17.github.io/LLM-from-scratch-animation/>

也可以直接用浏览器打开 `index.html`，不需要安装任何东西，也不需要联网。

| 操作 | 作用 |
|---|---|
| `→` / 空格 / 「继续」按钮 | 写代码页：读完旁白后开始写；打字时按一次直接看结果；写完后进入下一页 |
| `←` | 回到上一页 |
| 左侧目录 | 跳到任意一页；小节可以折叠，最左边的文件图标可以收起整个目录 |
| 标签页 / 活动栏的书本图标 | 临时查看另一个文件，或回看前置知识 |
| 右下角「打字速度」 | 在 0.5× 到 2× 之间切换 |
| 右下角「自动播放」 | 自动打字、自动翻页。旁白短而简单的页停 2 秒，其余停 5 秒左右，前置知识页停 10 秒 |
| 「暂停」按钮 / `P` | 暂停或恢复：对正在打的代码和自动播放的倒计时都有效 |
| 调色板图标 / 右下角主题名 / `T` | 选择颜色主题（见下） |
| 标题栏右侧的月亮/太阳 | 在深色和浅色之间切换 |

写代码页分三个阶段：先出旁白，光标停在要写的位置；读完按一下，代码开始打；打完再按一下进入下一页。
这样旁白和打字不会同时抢注意力。行号旁的绿色标记是这一页新写的行，蓝色是这一页改过的行。

## 颜色主题

风格和亮暗是两个独立的选择：

- **风格**：VS Code、GitHub、One、Solarized、Tokyo Night、Catppuccin，配色参照同名的编辑器主题。
- **亮暗**：深色、浅色、跟随系统。每种风格都有深浅两套。

按 `T` 打开选择框，`↑` `↓` 换风格、`←` `→` 换亮暗，都是即时预览；`Enter` 确定，`Esc` 恢复原样。
选择会记在浏览器里，下次打开还是上次的主题。默认是 VS Code 深色。

主题定义在 `js/themes.js`，一套配色是一行行颜色值，按文件开头 `KEYS` 的顺序排列。加一种新风格只需要照着加一组深色和浅色。

## 目录结构

```
index.html              页面骨架
css/style.css           外观。颜色全部用变量，由主题决定
js/themes.js            颜色主题：6 种风格 × 深浅两套
js/highlight.js         Python 语法高亮
js/engine.js            播放引擎：把一步里的操作展开成逐字符的编辑动作，不依赖浏览器
js/player.js            播放器：把引擎的状态画到页面上，处理翻页
lessons/01-embeddings.js  第 1 章的脚本：前置知识、每一步的旁白和代码操作
tools/verify.mjs        校验脚本，并导出写完后的文件
tools/bundle.mjs        合并成单个 HTML 文件
tools/deploy.sh         把站点文件发布到 gh-pages 分支（GitHub Pages）
```

## 怎么写新的一章

内容和播放器是分开的。新的一章就是 `lessons/` 下的一个脚本文件，再在 `index.html` 里加一行 `<script>`。

前置知识页带 `doc`：

```js
{
  section: '前置知识',
  title: '词嵌入：把编号换成向量',
  doc: [
    '句子进入模型之前，已经被切成一个个词……',
    { table: { head: ['词', '编号'], rows: [['我', '5'], ['爱', '2']], note: '数值仅为示意。' } },
  ],
}
```

写代码页带 `say` 和 `ops`：

```js
{
  section: '词嵌入',
  title: '回到这一行，补上缩放',
  say: [
    paper('3.4 节', 'In the embedding layers, we multiply those weights by √d_model.', '在嵌入层里……'),
    '查表已经写对了，再回到 `return` 这一行，把论文要求的缩放补在后面。',
  ],
  ops: [
    // 回到已有的那一行，在后面补代码
    { type: ' * math.sqrt(self.d_model)', after: 'return self.embedding(x)' },
  ],
}
```

`doc` 和 `say` 里可以放的内容：

| 写法 | 含义 |
|---|---|
| `'一段文字'` | 段落。用反引号标代码、双星号加粗 |
| `ref(名称, 文档页, 原文, 中文)` | 引用 PyTorch 官方文档 |
| `paper(章节, 原文, 中文)` | 引用论文《Attention Is All You Need》 |
| `{ shape: ['(a, b)', '(a, b, c)'], label }` | 形状变化 |
| `{ formula: ['一行', ...] }` | 公式 |
| `{ table: { head, rows, num, note } }` | 表格，`num` 是右对齐的数字列 |
| `{ list: ['一项', ...] }` | 列表 |
| `{ code: '...' }` | 带高亮的代码块 |
| `{ flow: [{ label, sub, part }, ...] }` | 数据流图，`part: true` 的节点是要写的零件 |
| `{ figure: 'pe-heatmap', note }` | 位置编码热力图，按公式现算，颜色跟随主题 |
| `{ roadmap: { done, now } }` | 路线图 |

引用的原文必须和官方文档一致。本章的引用都对照过 PyTorch 源码里的文档字符串（官方文档由它生成）。

`ops` 里可以写的操作：

| 操作 | 含义 |
|---|---|
| `{ type: '文本' }` | 在文件末尾打字 |
| `{ type: '文本', after: '锚点' }` | 在锚点文本之后打字 |
| `{ type: '文本', before: '锚点' }` | 在锚点文本之前打字 |
| `{ replace: '旧文本', with: '新文本' }` | 选中旧文本，删掉，打新文本 |
| `{ remove: '文本' }` | 选中并删掉 |
| `{ run: '命令', output: ['一行', ...] }` | 在终端里运行并显示输出 |
| `{ pause: 毫秒 }` | 停一下 |

每个操作可以带 `file: '文件名'`，一步也可以带 `file` 表示这一步在哪个文件里进行。
锚点文本必须在文件里恰好出现一次，写错了页面加载时会直接报出是哪一步。

自动播放的停留时间由 `js/player.js` 开头的 `PACE` 决定，按旁白的长度和难度（有没有引用、公式）分档。
个别页想单独指定，给这一步加 `read: 秒数`。

写完之后跑一遍校验：

```bash
node tools/verify.mjs /tmp/out
```

它会把每一步都执行一遍，确认逐字符播放的结果和直接跳转的结果一致，并把写完后的文件导出到指定目录，
方便拿去用真的 PyTorch 运行，核对终端输出。

## 以后的方向

引擎（`js/engine.js`）不碰页面也不计时，只负责产出「下一个编辑动作，以及之后该停多久」。
所以换一种驱动方式就能做别的形态：接上后端做成动态网页，或者按固定帧率逐帧截图合成教学视频。
每一步的打字节奏用固定种子的随机数生成，重复播放的结果完全一致。

## 内容来源

- 第 1 章的代码来自 [hkproj/pytorch-transformer](https://github.com/hkproj/pytorch-transformer) 的 `model.py`，
  书写顺序参考 Umar Jamil 的视频 [Coding a Transformer from scratch on PyTorch](https://www.youtube.com/watch?v=ISNdQcPhsts)。
  说明性的英文注释不保留，只保留标注张量形状的注释。
- 部件说明引用自 [PyTorch 官方文档](https://pytorch.org/docs/stable/) 和论文 [Attention Is All You Need](https://arxiv.org/abs/1706.03762)。
- 后续计划参考 [rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch) 做 GPT 一线的内容。
