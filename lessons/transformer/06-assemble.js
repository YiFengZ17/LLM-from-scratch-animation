/*
 * 第 6 章：输出层与组装
 *
 * 接着第 5 章的 model.py 往下写，代码来自 hkproj/pytorch-transformer 的 model.py。
 * 原代码里 ProjectionLayer.forward 带了一个 -> None 的返回类型注解，和实际返回值不符，这里去掉了。
 */
(function (root) {
  'use strict';

  const { ref, paper } = root.LessonKit;
  const ROADMAP = root.Catalog.byId.transformer.roadmap;

  const lesson = {
    id: '06-assemble',
    title: '输出层与组装',
    summary: '写最后一个零件，再把所有零件组装成完整的模型。',
    files: ['model.py', 'scratch.py'],
    docName: '前置知识.md',
    roadmap: ROADMAP,
    steps: [
      /* ============================================================ 前置知识 */
      {
        section: '前置知识',
        title: '这一章要写什么',
        doc: [
          '零件都齐了。这一章先写最后一个零件 `ProjectionLayer`，再写 `Transformer` 把所有零件连起来，最后用函数 `build_transformer` 按超参数一次造好整个模型。',
          '完整的数据流：',
          {
            flow: [
              { label: '原句编号', sub: '(batch, src_len)' },
              { label: '嵌入 + 位置', sub: '第 1 章' },
              { label: 'Encoder', sub: '第 4 章', part: true },
              { label: '编码器输出', sub: '(batch, src_len, 512)' },
            ],
          },
          {
            flow: [
              { label: '译文编号', sub: '(batch, tgt_len)' },
              { label: '嵌入 + 位置', sub: '第 1 章' },
              { label: 'Decoder', sub: '第 5 章，同时看编码器输出', part: true },
              { label: 'ProjectionLayer', sub: '这一章', part: true },
              { label: '每个词的分数', sub: '(batch, tgt_len, vocab_size)' },
            ],
          },
          { roadmap: { done: 8, now: 1 } },
          '前 4 页是前置知识。',
        ],
      },
      {
        section: '前置知识',
        title: '输出层：给词表里每个词打分',
        doc: [
          paper(
            '3.4 节',
            'Similarly to other sequence transduction models, we use learned embeddings to convert the input tokens and output tokens to vectors of dimension d_model. We also use the usual learned linear transformation and softmax function to convert the decoder output to predicted next-token probabilities.',
            '和其他序列转换模型一样，我们用学习得到的嵌入把输入和输出的词变成 d_model 维的向量。我们也用常见的可学习线性变换和 softmax，把解码器的输出变成对下一个词的预测概率。'
          ),
          '输出层就是一个线性层：把每个位置 `d_model` 维的向量变成 `vocab_size` 个分数，分数最高的词就是模型认为最可能的下一个词。',
          { shape: ['(batch, tgt_len, d_model)', '(batch, tgt_len, vocab_size)'], label: '形状' },
          '这份代码的输出层只做线性变换，返回 softmax 之前的分数（logits）。训练时用的 `nn.CrossEntropyLoss` 会在内部做 log-softmax；生成时只需要找最大的分数，也用不到 softmax。',
        ],
      },
      {
        section: '前置知识',
        title: '为什么拆成 encode、decode、project 三步',
        doc: [
          '`Transformer` 不写一个大 `forward`，而是提供三个方法：',
          {
            table: {
              head: ['方法', '输入', '输出', '调用次数'],
              rows: [
                ['`encode`', '原句编号、`src_mask`', '编码器输出', '每句原文一次'],
                ['`decode`', '编码器输出、已有的译文、两种掩码', '解码器输出', '每生成一个词一次'],
                ['`project`', '解码器输出', '每个词的分数', '每生成一个词一次'],
              ],
            },
          },
          '生成译文时，原句只需要编码一次，结果反复交给解码器用；解码器每多生成一个词，就要带着更长的译文再跑一遍。拆开写，调用的地方就能只重复需要重复的部分。',
        ],
      },
      {
        section: '前置知识',
        title: '超参数、初始化和参数量',
        doc: [
          '`build_transformer` 的默认值就是论文里 base 模型的设置：',
          {
            table: {
              head: ['超参数', '含义', '默认值'],
              rows: [
                ['`d_model`', '每个向量的长度', '512'],
                ['`N`', '编码器、解码器各叠几层', '6'],
                ['`h`', '注意力的头数', '8'],
                ['`d_ff`', '前馈网络中间层的维度', '2048'],
                ['`dropout`', 'Dropout 的比例', '0.1'],
              ],
              num: [2],
            },
          },
          '造好之后，所有二维及以上的参数（各种矩阵）用 Xavier 均匀分布重新初始化；偏置、α 这类一维参数保持原样。这是 hkproj 和 Annotated Transformer 的做法，论文本身没有规定初始化方式。',
          '原句词表 1000、译文词表 1200 时的参数量：',
          {
            table: {
              head: ['部分', '计算', '参数'],
              rows: [
                ['原句的嵌入', '1000 × 512', '512,000'],
                ['译文的嵌入', '1200 × 512', '614,400'],
                ['编码器', '6 × 3,150,336 + 1,024', '18,903,040'],
                ['解码器', '6 × 4,199,936 + 1,024', '25,200,640'],
                ['输出层', '512 × 1200 + 1200', '615,600'],
                ['合计', '', '45,845,680'],
              ],
              num: [2],
              note: '加的 1,024 是编码器、解码器末尾那个层归一化。论文用约 37000 个词、原文译文共用的词表，base 模型约 6500 万参数。这一章的运行验证会数一遍。',
            },
          },
        ],
      },

      /* ============================================================== 输出层 */
      {
        section: '输出层',
        title: '最后一个零件',
        file: 'model.py',
        say: [
          '回到 `model.py` 末尾。输出层只有一个线性层，从 `d_model` 到 `vocab_size`。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, vocab_size)'], label: '形状' },
        ],
        ops: [
          { type: '\n\nclass ProjectionLayer(nn.Module):', note: '最后一个零件：输出层。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, d_model, vocab_size) -> None:\n        super().__init__()\n        self.proj = nn.Linear(d_model, vocab_size)', note: '它只需要一个线性层，把 d_model 维的向量变成词表大小那么多个分数。' },
          { pause: 500 },
          { type: '\n\n    def forward(self, x):\n        # (batch, seq_len, d_model) --> (batch, seq_len, vocab_size)\n        return self.proj(x)', note: '`forward` 就是把向量交给这个线性层。' },
        ],
      },

      /* ================================================================ 组装 */
      {
        section: 'Transformer',
        title: '存下所有零件',
        say: [
          '`Transformer` 自己不造零件，只把造好的零件存起来：编码器、解码器，原句和译文各一套嵌入和位置编码，再加输出层。',
          '构造参数很多，但每一行都只是存下来而已。',
        ],
        ops: [
          { type: '\n\nclass Transformer(nn.Module):', note: '现在把所有零件连起来：`Transformer`。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, encoder: Encoder, decoder: Decoder, src_embed: InputEmbeddings, tgt_embed: InputEmbeddings, src_pos: PositionalEncoding, tgt_pos: PositionalEncoding, projection_layer: ProjectionLayer) -> None:\n        super().__init__()', note: '它要用的零件全部从外面传进来：编码器、解码器，原句和译文各一套嵌入和位置编码，还有输出层。' },
          { pause: 400 },
          { type: '\n        self.encoder = encoder\n        self.decoder = decoder\n        self.src_embed = src_embed\n        self.tgt_embed = tgt_embed\n        self.src_pos = src_pos\n        self.tgt_pos = tgt_pos\n        self.projection_layer = projection_layer', note: '一个一个存下来，后面的三个方法要用。' },
        ],
      },
      {
        section: 'Transformer',
        title: 'encode：原句走一遍编码器',
        say: [
          '原句先查表，再加位置，然后交给编码器。',
          { shape: ['(batch, src_len)', '(batch, src_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def encode(self, src, src_mask):\n        # (batch, seq_len, d_model)', note: '第一个方法 encode 处理原句。先写下它最后得到的形状。' },
          { pause: 300 },
          { type: '\n        src = self.src_embed(src)\n        src = self.src_pos(src)\n        return self.encoder(src, src_mask)', note: '原句先查表变成向量，再加上位置，最后交给编码器。' },
        ],
      },
      {
        section: 'Transformer',
        title: 'decode：译文走一遍解码器',
        say: [
          '译文同样先查表、加位置，再交给解码器，同时带上编码器输出和两种掩码。',
          { shape: ['(batch, tgt_len)', '(batch, tgt_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def decode(self, encoder_output: torch.Tensor, src_mask: torch.Tensor, tgt: torch.Tensor, tgt_mask: torch.Tensor):\n        # (batch, seq_len, d_model)', note: '第二个方法 decode 处理译文。除了译文，还要编码器的输出和两种掩码。' },
          { pause: 300 },
          { type: '\n        tgt = self.tgt_embed(tgt)\n        tgt = self.tgt_pos(tgt)\n        return self.decoder(tgt, encoder_output, src_mask, tgt_mask)', note: '译文同样先查表、加位置，再交给解码器。' },
        ],
      },
      {
        section: 'Transformer',
        title: 'project：交给输出层',
        say: ['最后一步交给输出层，得到每个位置上每个词的分数。'],
        ops: [{ type: '\n\n    def project(self, x):\n        # (batch, seq_len, vocab_size)\n        return self.projection_layer(x)', note: '第三个方法 project：把解码器的输出交给输出层，得到每个位置上每个词的分数。' }],
      },

      /* ===================================================== build_transformer */
      {
        section: 'build_transformer',
        title: '嵌入和位置编码',
        say: [
          '最后写一个函数，按超参数把所有零件造出来。默认值就是前置知识第 4 页的那张表。',
          '先造原句和译文各自的嵌入和位置编码。两种语言的词表大小、句子长度都可以不同。',
        ],
        ops: [
          { type: '\n\ndef build_transformer(src_vocab_size: int, tgt_vocab_size: int, src_seq_len: int, tgt_seq_len: int, d_model: int=512, N: int=6, h: int=8, dropout: float=0.1, d_ff: int=2048) -> Transformer:', note: '最后写一个函数，按超参数把所有零件造出来。默认值就是论文 base 模型的设置。' },
          { pause: 500 },
          { type: '\n    src_embed = InputEmbeddings(d_model, src_vocab_size)\n    tgt_embed = InputEmbeddings(d_model, tgt_vocab_size)', note: '先造两种语言各自的嵌入层：两边的词表大小可以不同。' },
          { pause: 300 },
          { type: '\n\n    src_pos = PositionalEncoding(d_model, src_seq_len, dropout)\n    tgt_pos = PositionalEncoding(d_model, tgt_seq_len, dropout)', note: '再造各自的位置编码：最大长度也可以不同。' },
        ],
      },
      {
        section: 'build_transformer',
        title: 'N 层编码器',
        say: [
          '用循环造 N 层编码器。每次循环都新造一个注意力和一个前馈网络，各层的参数才互相独立。',
        ],
        ops: [
          { type: '\n\n    encoder_blocks = []\n    for _ in range(N):', note: '编码器要 N 层，用一个列表装起来，循环 N 次。' },
          { pause: 300 },
          { type: '\n        encoder_self_attention_block = MultiHeadAttentionBlock(d_model, h, dropout)\n        feed_forward_block = FeedForwardBlock(d_model, d_ff, dropout)', note: '每一层都要新造自己的注意力和前馈网络，各层的参数才互相独立。' },
          { pause: 300 },
          { type: '\n        encoder_block = EncoderBlock(d_model, encoder_self_attention_block, feed_forward_block, dropout)\n        encoder_blocks.append(encoder_block)', note: '用它们组成一层编码器，放进列表。' },
        ],
      },
      {
        section: 'build_transformer',
        title: 'N 层解码器',
        say: ['解码器同理，每层多造一个交叉注意力。'],
        ops: [
          { type: '\n\n    decoder_blocks = []\n    for _ in range(N):', note: '解码器同样要 N 层。' },
          { pause: 300 },
          { type: '\n        decoder_self_attention_block = MultiHeadAttentionBlock(d_model, h, dropout)\n        decoder_cross_attention_block = MultiHeadAttentionBlock(d_model, h, dropout)\n        feed_forward_block = FeedForwardBlock(d_model, d_ff, dropout)', note: '每一层新造自注意力、交叉注意力和前馈网络。' },
          { pause: 300 },
          { type: '\n        decoder_block = DecoderBlock(d_model, decoder_self_attention_block, decoder_cross_attention_block, feed_forward_block, dropout)\n        decoder_blocks.append(decoder_block)', note: '组成一层解码器，放进列表。' },
        ],
      },
      {
        section: 'build_transformer',
        title: '组装',
        say: [
          '把各层装进 `nn.ModuleList`，造出编码器和解码器，再造输出层，最后全部交给 `Transformer`。',
        ],
        ops: [
          { type: '\n\n    encoder = Encoder(d_model, nn.ModuleList(encoder_blocks))\n    decoder = Decoder(d_model, nn.ModuleList(decoder_blocks))', note: '各层装进 `nn.ModuleList`，造出编码器和解码器。' },
          { pause: 300 },
          { type: '\n\n    projection_layer = ProjectionLayer(d_model, tgt_vocab_size)', note: '输出层的大小是译文的词表。' },
          { pause: 300 },
          { type: '\n\n    transformer = Transformer(encoder, decoder, src_embed, tgt_embed, src_pos, tgt_pos, projection_layer)', note: '所有零件都齐了，交给 Transformer。' },
        ],
      },
      {
        section: 'build_transformer',
        title: '初始化，然后返回',
        say: [
          ref(
            'Module.parameters()',
            'generated/torch.nn.Module.html#torch.nn.Module.parameters',
            'Return an iterator over module parameters.',
            '返回一个遍历模块参数的迭代器。'
          ),
          ref(
            'nn.init.xavier_uniform_(tensor)',
            'nn.init.html#torch.nn.init.xavier_uniform_',
            'Fill the input Tensor with values using a Xavier uniform distribution.',
            '用 Xavier 均匀分布填充输入张量。'
          ),
          '遍历整个模型的参数，二维及以上的（各种矩阵）用 Xavier 均匀分布重新初始化。最后返回模型。',
        ],
        ops: [
          { type: '\n\n    for p in transformer.parameters():\n        if p.dim() > 1:\n            nn.init.xavier_uniform_(p)', note: '参数一开始的取值会影响训练。遍历所有参数，把二维以上的（也就是各种矩阵）用 Xavier 均匀分布重新初始化。' },
          { pause: 500 },
          { type: '\n\n    return transformer', note: '最后返回造好的模型。' },
        ],
      },

      /* ============================================================ 运行验证 */
      {
        section: '运行验证',
        title: '造一个完整的模型',
        file: 'scratch.py',
        say: [
          '清空草稿，造一个完整的模型。参数总量应该和前置知识第 4 页的表一致：45,845,680。',
          '再随机造一句 10 个词的原句、12 个词的译文，按 encode、decode、project 的顺序走一遍。`torch.randint` 生成指定范围内的随机整数，正好当作词的编号。',
          { shape: ['(1, 12)', '(1, 12, 1200)'], label: '预期' },
        ],
        ops: [
          { clear: 'scratch.py' },
          { type: 'import torch\nfrom model import build_transformer\n\ntorch.set_grad_enabled(False)', note: '整个模型由 build_transformer 一次造好，这次只需要导入它这一个函数。' },
          { pause: 400 },
          { type: '\n\nmodel = build_transformer(src_vocab_size=1000, tgt_vocab_size=1200, src_seq_len=10, tgt_seq_len=12)\nprint(sum(p.numel() for p in model.parameters()))', note: '造一个完整的模型，先数参数量：应该是 45,845,680。' },
          { pause: 400 },
          { type: '\n\nsrc = torch.randint(0, 1000, (1, 10))\ntgt = torch.randint(0, 1200, (1, 12))', note: '随机造一句 10 个词的原句、12 个词的译文，词的编号用 `randint` 生成。' },
          { pause: 300 },
          { type: '\nencoder_output = model.encode(src, None)\ndecoder_output = model.decode(encoder_output, None, tgt, torch.tril(torch.ones(12, 12)))', note: '按顺序走一遍：先 encode 原句，再带着编码器输出 decode 译文，译文用下三角掩码挡住后面的词。' },
          { pause: 300 },
          { type: '\nprint(encoder_output.shape)\nprint(decoder_output.shape)\nprint(model.project(decoder_output).shape)', note: '打印编码器输出、解码器输出和最终分数的形状。' },
          { pause: 600 },
          {
            run: 'python scratch.py',
            output: ['45845680', 'torch.Size([1, 10, 512])', 'torch.Size([1, 12, 512])', 'torch.Size([1, 12, 1200])'],
          },
        ],
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '整个 Transformer 写完了',
        file: 'model.py',
        say: [
          '`model.py` 从一个空文件长到了 241 行，13 个类和函数，就是论文里完整的 Transformer。',
          { roadmap: { done: 9, now: 0 } },
          '现在模型能把一句话变成每个位置上对下一个词的打分，但它的参数还是随机的。要让它真的会翻译，还需要准备数据、写训练循环，再写一个逐词生成的函数。hkproj 仓库里的 `dataset.py` 和 `train.py` 做的就是这些。',
        ],
      },
    ],
  };

  root.Catalog.addChapter('transformer', lesson);
})(typeof window !== 'undefined' ? window : globalThis);
