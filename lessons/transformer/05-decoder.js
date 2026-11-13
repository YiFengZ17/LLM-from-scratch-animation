/*
 * 第 5 章：解码器
 *
 * 接着第 4 章的 model.py 往下写，代码来自 hkproj/pytorch-transformer 的 model.py。
 */
(function (root) {
  'use strict';

  const { paper } = root.LessonKit;
  const ROADMAP = root.Catalog.byId.transformer.roadmap;

  const lesson = {
    id: '05-decoder',
    title: '解码器',
    summary: '多一个交叉注意力：一边看已有的译文，一边看原句。',
    files: ['model.py', 'scratch.py'],
    docName: '前置知识.md',
    roadmap: ROADMAP,
    steps: [
      /* ============================================================ 前置知识 */
      {
        section: '前置知识',
        title: '这一章要写什么',
        doc: [
          '编码器读懂了原句，解码器负责一个词一个词地生成译文。这一章写 `DecoderBlock` 和 `Decoder`，结构和编码器很像，写法也几乎一样。',
          {
            flow: [
              { label: '已有的译文', sub: '(batch, tgt_len, 512)' },
              { label: 'DecoderBlock × N', sub: '同时看编码器输出', part: true },
              { label: 'LayerNormalization', sub: '最后再归一化一次' },
              { label: '解码器输出', sub: '(batch, tgt_len, 512)' },
            ],
          },
          '原句的长度记作 `src_len`，译文的长度记作 `tgt_len`，两者可以不一样。',
          { roadmap: { done: 7, now: 1 } },
          '前 4 页是前置知识。',
        ],
      },
      {
        section: '前置知识',
        title: '解码器层的三个子层',
        doc: [
          paper(
            '3.1 节',
            'In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack.',
            '除了编码器层里的两个子层，解码器还插入了第三个子层，对编码器的输出做多头注意力。'
          ),
          {
            table: {
              head: ['子层', 'query 来自', 'key、value 来自', '掩码'],
              rows: [
                ['1 自注意力', '译文', '译文', '`tgt_mask`：挡住后面的词'],
                ['2 交叉注意力', '译文', '编码器输出', '`src_mask`：挡住原句里补齐的位置'],
                ['3 前馈网络', '', '', ''],
              ],
            },
          },
          '每个子层外面同样套一个残差连接，所以一层解码器有三个残差连接。',
        ],
      },
      {
        section: '前置知识',
        title: '交叉注意力：译文去看原句',
        doc: [
          '交叉注意力里，query 来自解码器，key 和 value 来自编码器的输出。译文的每个位置拿着自己的问题，去原句的每个位置找相关的信息。',
          {
            table: {
              head: ['', '形状（一个头，省略 batch）'],
              rows: [
                ['Q（来自译文）', '`(tgt_len, d_k)`'],
                ['K、V（来自原句）', '`(src_len, d_k)`'],
                ['分数 Q · Kᵀ', '`(tgt_len, src_len)`'],
                ['结果', '`(tgt_len, d_k)`'],
              ],
            },
          },
          '分数矩阵是 `tgt_len` 行、`src_len` 列：第 i 行是译文第 i 个位置对原句各个位置的权重。结果的长度跟着译文走。',
          '第 3 章的多头注意力分开收 `q`、`k`、`v`，就是为了这里。',
        ],
      },
      {
        section: '前置知识',
        title: '为什么要挡住后面的词',
        doc: [
          paper(
            '3.2.3 节',
            'We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with fact that the output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i.',
            '我们还修改了解码器里的自注意力子层，不让一个位置看到它后面的位置。这个掩码，加上输出的嵌入错开了一个位置，保证了对位置 i 的预测只依赖于 i 之前已知的输出。'
          ),
          '训练时整句译文一次送进解码器，每个位置要预测下一个词：',
          {
            table: {
              head: ['位置', '0', '1', '2', '3'],
              rows: [
                ['解码器的输入', '`<s>`', 'I', 'love', 'cats'],
                ['要预测的词', 'I', 'love', 'cats', '`</s>`'],
              ],
              note: '`<s>` 和 `</s>` 是表示句子开头和结尾的特殊词。输入比答案错开一个位置。',
            },
          },
          '如果位置 1 能看到位置 2 的 love，预测就成了照抄答案。所以解码器的自注意力用下三角掩码（第 3 章前置知识第 5 页），第 i 个位置只能看第 0 到 i 个位置。',
        ],
      },

      /* ============================================================== 解码器 */
      {
        section: '解码器层',
        title: '第九个零件：外壳',
        file: 'model.py',
        say: [
          '回到 `model.py` 末尾。和编码器层相比，多传一个交叉注意力。',
          '自注意力和交叉注意力是两个独立的 `MultiHeadAttentionBlock`，各有各的参数。',
        ],
        ops: [
          { type: '\n\nclass DecoderBlock(nn.Module):', note: '第九个零件：一层解码器。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, features: int, self_attention_block: MultiHeadAttentionBlock, cross_attention_block: MultiHeadAttentionBlock, feed_forward_block: FeedForwardBlock, dropout: float) -> None:\n        super().__init__()', note: '和编码器层相比，多一个交叉注意力，所以构造参数里有三个子层。' },
          { pause: 300 },
          { type: '\n        self.self_attention_block = self_attention_block\n        self.cross_attention_block = cross_attention_block\n        self.feed_forward_block = feed_forward_block', note: '把三个子层都存下来。' },
        ],
      },
      {
        section: '解码器层',
        title: '三个残差连接',
        say: ['三个子层，所以造三个残差连接。和编码器层只差一个数字。'],
        ops: [{ type: '\n        self.residual_connections = nn.ModuleList([ResidualConnection(features, dropout) for _ in range(3)])', note: '三个子层，各要一个残差连接。' }],
      },
      {
        section: '解码器层',
        title: 'forward：自注意力',
        say: [
          '`forward` 比编码器层多收两样东西：编码器的输出，以及两种掩码。',
          '第一个子层是自注意力，q、k、v 都是 `x`，用 `tgt_mask` 挡住后面的词。',
        ],
        ops: [
          { type: '\n\n    def forward(self, x, encoder_output, src_mask, tgt_mask):', note: '`forward` 比编码器层多收两样东西：编码器的输出，以及原句和译文各自的掩码。' },
          { pause: 400 },
          { type: '\n        x = self.residual_connections[0](x, lambda x: self.self_attention_block(x, x, x, tgt_mask))', note: '第一个子层是自注意力，q、k、v 都是 x，用译文的掩码挡住后面的词。写法和编码器一样，用 lambda 包一层。' },
        ],
      },
      {
        section: '解码器层',
        title: 'forward：交叉注意力',
        say: [
          '第二个子层的 query 是 `x`，key 和 value 都是 `encoder_output`，用 `src_mask` 挡住原句里补齐的位置。',
          '写法和上一行一样，只改了注意力和参数。',
          { shape: ['(batch, tgt_len, d_model)', '(batch, tgt_len, d_model)'], label: '形状' },
        ],
        ops: [{ type: '\n        x = self.residual_connections[1](x, lambda x: self.cross_attention_block(x, encoder_output, encoder_output, src_mask))', note: '第二个子层是交叉注意力：query 来自 x，key 和 value 来自编码器的输出，用原句的掩码挡住补齐的位置。' }],
      },
      {
        section: '解码器层',
        title: 'forward：前馈网络',
        say: ['第三个子层和编码器一样，直接传前馈网络。'],
        ops: [{ type: '\n        x = self.residual_connections[2](x, self.feed_forward_block)\n        return x', note: '第三个子层是前馈网络，直接传进去，然后返回。' }],
      },
      {
        section: '解码器',
        title: '解码器：叠 N 层',
        say: [
          '和 `Encoder` 一样，只是每一层要多传编码器输出和两种掩码。',
          '最后同样补一个层归一化。',
        ],
        ops: [
          { type: '\n\nclass Decoder(nn.Module):', note: '最后把 N 层解码器叠起来。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, features: int, layers: nn.ModuleList) -> None:\n        super().__init__()\n        self.layers = layers\n        self.norm = LayerNormalization(features)', note: '和 Encoder 一样：存下各层，再准备一个最后用的层归一化。' },
          { pause: 500 },
          { type: '\n\n    def forward(self, x, encoder_output, src_mask, tgt_mask):\n        for layer in self.layers:\n            x = layer(x, encoder_output, src_mask, tgt_mask)', note: '让数据依次穿过每一层，每一层都要带上编码器输出和两种掩码。' },
          { pause: 400 },
          { type: '\n        return self.norm(x)', note: '最后归一化一次。' },
        ],
      },

      /* ============================================================ 运行验证 */
      {
        section: '运行验证',
        title: '原句和译文不一样长',
        file: 'scratch.py',
        say: [
          '清空草稿。原句 4 个位置、译文 5 个位置，故意不一样长。编码器的输出先用随机数代替。',
          '看三件事：输出形状跟着译文走；交叉注意力的权重是 5 行 4 列；一层解码器比一层编码器多一个多头注意力和一个层归一化，参数量是 3,150,336 + 1,048,576 + 1,024 = 4,199,936。',
        ],
        ops: [
          { clear: 'scratch.py' },
          { type: 'import torch\nimport torch.nn as nn\nfrom model import MultiHeadAttentionBlock, FeedForwardBlock, DecoderBlock, Decoder\n\ntorch.set_grad_enabled(False)', note: '导入解码器用到的四个零件，以及装各层用的 `torch.nn`。' },
          { pause: 400 },
          { type: '\n\nblocks = [DecoderBlock(512, MultiHeadAttentionBlock(512, 8, 0.1), MultiHeadAttentionBlock(512, 8, 0.1), FeedForwardBlock(512, 2048, 0.1), 0.1) for _ in range(2)]\ndecoder = Decoder(512, nn.ModuleList(blocks))', note: '造两层解码器：每一层都有自己的自注意力、交叉注意力和前馈网络。' },
          { pause: 400 },
          { type: '\n\nmemory = torch.randn(1, 4, 512)\ny = torch.randn(1, 5, 512)\ntgt_mask = torch.tril(torch.ones(5, 5))', note: '编码器的输出先用随机数代替，原句 4 个位置；译文 5 个位置，故意不一样长。再造一个 5 × 5 的下三角掩码。' },
          { pause: 400 },
          { type: '\nprint(decoder(y, memory, None, tgt_mask).shape)\nprint(blocks[0].cross_attention_block.attention_scores.shape)\nprint(sum(p.numel() for p in blocks[0].parameters()))', note: '看三样东西：输出形状跟着译文走；交叉注意力的权重是 5 行 4 列；一层解码器的参数量。' },
          { pause: 600 },
          { run: 'python scratch.py', output: ['torch.Size([1, 5, 512])', 'torch.Size([1, 8, 5, 4])', '4199936'] },
        ],
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这一章写完了',
        file: 'model.py',
        say: [
          '解码器完成了。它的每一层先看已有的译文，再看原句，最后过前馈网络。输出的长度跟着译文走：`(batch, tgt_len, d_model)`。',
          { roadmap: { done: 8, now: 0 } },
          '下一章写最后一个零件，再把所有零件组装成完整的 Transformer。',
        ],
      },
    ],
  };

  root.Catalog.addChapter('transformer', lesson);
})(typeof window !== 'undefined' ? window : globalThis);
