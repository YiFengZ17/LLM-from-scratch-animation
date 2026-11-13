/*
 * 课程：从零手写 Transformer。
 * 6 章接着写同一个 model.py，后一章从前一章结束时的代码开始。
 */
(function (root) {
  'use strict';

  root.Catalog.defineCourse({
    id: 'transformer',
    board: 'dl',
    title: '从零手写 Transformer',
    eyebrow: 'PyTorch · 论文 Attention Is All You Need',
    blurb: '从一个空文件开始，6 章逐字写出完整的 Transformer：嵌入、位置编码、注意力、编码器、解码器，最后组装成模型。每个部件都引用官方文档原文，每章的输出都用真实的 PyTorch 跑过。',
    chain: true,
    source: { name: 'hkproj/pytorch-transformer', url: 'https://github.com/hkproj/pytorch-transformer' },
    stats: [
      ['6', '章'],
      ['95', '页'],
      ['241', '行代码'],
      ['13', '个类与函数'],
    ],
    // 每章小结里用 { roadmap: { done, now } } 标出进度
    roadmap: ['词嵌入', '位置编码', '层归一化', '前馈网络', '多头注意力', '残差连接', '编码器', '解码器', '输出层与组装'],
  });
})(typeof window !== 'undefined' ? window : globalThis);
