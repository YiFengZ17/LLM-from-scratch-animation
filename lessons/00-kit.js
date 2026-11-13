/*
 * 课程脚本的公共部分：路线图，以及引用官方文档和论文的写法。
 * 这个文件要在各章之前加载。
 *
 * 引用的原文必须和出处一致。PyTorch 的引文对照的是 PyTorch 源码里的文档字符串
 * （官方文档由它生成），Python 的引文对照的是 CPython 仓库里的文档源文件，
 * 论文的引文对照的是 Annotated Transformer 里逐段摘录的论文原文。
 */
(function (root) {
  'use strict';

  const PYTORCH = 'https://pytorch.org/docs/stable/';
  const PYTHON = 'https://docs.python.org/3/';
  const PAPER = 'https://arxiv.org/abs/1706.03762';

  root.LessonKit = {
    // 整个 Transformer 课程的路线图，每章小结里用 { roadmap: { done, now } } 标出进度
    ROADMAP: ['词嵌入', '位置编码', '层归一化', '前馈网络', '多头注意力', '残差连接', '编码器', '解码器', '输出层与组装'],

    // 引用 PyTorch 官方文档
    ref: (api, page, quote, zh) => ({ ref: { api, url: PYTORCH + page, source: 'PyTorch 文档', quote, zh } }),

    // 引用 Python 官方文档
    py: (api, page, quote, zh) => ({ ref: { api, url: PYTHON + page, source: 'Python 文档', quote, zh } }),

    // 引用论文《Attention Is All You Need》
    paper: (where, quote, zh) => ({ ref: { api: '论文 ' + where, url: PAPER, source: '论文原文', quote, zh } }),
  };
})(typeof window !== 'undefined' ? window : globalThis);
