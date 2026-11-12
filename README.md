# 从零手写 Transformer：翻页看代码

看视频学 Transformer 参与感不够，跟着敲代码又没时间。这个项目取中间的路：
页面就是一个编辑器，每翻一页，旁白先讲这一步在想什么，然后代码一个字符一个字符打出来。
节奏由读者控制，可以前翻、后翻、按目录跳转。

目前是演示版，只有第 1 章（词嵌入与位置编码，23 步）。

## 怎么看

直接用浏览器打开 `index.html` 就行，不需要安装任何东西，也不需要联网。

| 操作 | 作用 |
|---|---|
| `→` / 空格 / 「继续」按钮 | 读完旁白后开始写代码；打字时按一次直接看结果；写完后进入下一步 |
| `←` | 回到上一步 |
| 左侧目录 | 跳到任意一步 |
| 文件标签 | 临时查看另一个文件 |
| 右下角「打字速度」 | 在 0.5× 到 2× 之间切换 |
| 右下角「自动播放」 | 按旁白字数留出阅读时间，自动打字、自动翻页 |

每一页分三个阶段：先出旁白，光标停在要写的位置；读完按一下，代码开始打；打完再按一下进入下一页。
这样旁白和打字不会同时抢注意力。行号旁的绿色标记是这一步新写的行，黄色是这一步改过的行。

## 目录结构

```
index.html              页面骨架
css/style.css           编辑器外观（深色、浅色两套）
js/highlight.js         Python 语法高亮
js/engine.js            播放引擎：把一步里的操作展开成逐字符的编辑动作，不依赖浏览器
js/player.js            播放器：把引擎的状态画到页面上，处理翻页
lessons/01-embeddings.js  第 1 章的脚本：每一步的旁白和代码操作
tools/verify.mjs        校验脚本，并导出写完后的文件
tools/bundle.mjs        合并成单个 HTML 文件
```

## 怎么写新的一章

内容和播放器是分开的。新的一章就是 `lessons/` 下的一个脚本文件，再在 `index.html` 里加一行 `<script>`。
一步长这样：

```js
{
  section: '词嵌入',
  title: '论文里的一个小细节',
  say: [
    '到这里功能已经对了。不过论文 3.4 节还有一句话……',
    { shape: ['(batch, seq_len)', '(batch, seq_len, d_model)'] },
  ],
  ops: [
    // 回到已有的那一行，在后面补代码
    { type: ' * math.sqrt(self.d_model)', after: 'return self.embedding(x)' },
  ],
}
```

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

`say` 里字符串是一段旁白，用反引号标代码、双星号加粗；对象是特殊块：`shape`（形状变化）、`formula`（公式）、`roadmap`（路线图）。

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
  说明性的英文注释改由旁白来讲，只保留标注张量形状的注释。
- 后续计划参考 [rasbt/LLMs-from-scratch](https://github.com/rasbt/LLMs-from-scratch) 做 GPT 一线的内容。
