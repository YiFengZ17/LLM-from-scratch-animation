/*
 * 第 4 章：残差连接与编码器
 *
 * 接着第 3 章的 model.py 往下写，代码来自 hkproj/pytorch-transformer 的 model.py。
 */
(function (root) {
  'use strict';

  const { ref, py, paper } = root.LessonKit;
  const ROADMAP = root.Catalog.byId.transformer.roadmap;

  const lesson = {
    id: '04-encoder',
    title: '残差连接与编码器',
    summary: '用残差连接把注意力和前馈网络串起来，叠成编码器。',
    files: ['model.py', 'scratch.py'],
    docName: '前置知识.md',
    roadmap: ROADMAP,
    steps: [
      /* ============================================================ 前置知识 */
      {
        section: '前置知识',
        title: '这一章要写什么',
        doc: [
          '前面写好的零件都是单独的。这一章写三个零件，把它们组装成编码器：',
          {
            list: [
              '`ResidualConnection`：给一个子层套上残差连接和层归一化',
              '`EncoderBlock`：一层编码器，由自注意力和前馈网络两个子层组成',
              '`Encoder`：把 N 层编码器叠起来',
            ],
          },
          {
            flow: [
              { label: '带位置的词向量', sub: '(batch, seq_len, 512)' },
              { label: 'EncoderBlock × N', sub: '自注意力 + 前馈网络', part: true },
              { label: 'LayerNormalization', sub: '最后再归一化一次' },
              { label: '编码器输出', sub: '(batch, seq_len, 512)' },
            ],
          },
          { roadmap: { done: 5, now: 2 } },
          '前 5 页是前置知识。',
        ],
      },
      {
        section: '前置知识',
        title: '残差连接',
        doc: [
          paper(
            '3.1 节',
            'We employ a residual connection around each of the two sub-layers, followed by layer normalization. That is, the output of each sub-layer is LayerNorm(x + Sublayer(x)), where Sublayer(x) is the function implemented by the sub-layer itself.',
            '我们在两个子层外面各加一个残差连接，随后做层归一化。也就是说，每个子层的输出是 LayerNorm(x + Sublayer(x))，其中 Sublayer(x) 是子层本身实现的函数。'
          ),
          '残差连接就是把子层的输入直接加到它的输出上：`x + Sublayer(x)`。子层只需要学「在 x 的基础上改多少」。层数很多时，梯度也能沿着这条直通的加法传回前面，不容易消失。',
          '层归一化放在哪里，有两种写法：',
          {
            table: {
              head: ['写法', '公式', '说明'],
              rows: [
                ['Post-LN（论文）', '`LayerNorm(x + Dropout(Sublayer(x)))`', '先相加，再归一化'],
                ['Pre-LN（本代码）', '`x + Dropout(Sublayer(LayerNorm(x)))`', '先归一化再进子层，加法那条路上不做任何处理'],
              ],
            },
          },
          '这份代码用的是 Pre-LN，Annotated Transformer 等很多实现也这样写，训练通常更稳定。代价是最后一层的输出没有经过归一化，所以编码器末尾要再补一个层归一化。',
        ],
      },
      {
        section: '前置知识',
        title: '一层编码器',
        doc: [
          paper(
            '3.1 节',
            'Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network.',
            '每一层有两个子层。第一个是多头自注意力，第二个是一个简单的、逐位置的全连接前馈网络。'
          ),
          '「自注意力」的意思是 query、key、value 都来自同一个输入 `x`：句子里的词互相看。',
          {
            table: {
              head: ['子层', '做什么', '外面的残差连接'],
              rows: [
                ['1', '多头自注意力，`q = k = v = x`，用 `src_mask` 挡住补齐的位置', '`residual_connections[0]`'],
                ['2', '前馈网络', '`residual_connections[1]`'],
              ],
            },
          },
          '两个子层的输入输出都是 `(batch, seq_len, d_model)`，所以一层编码器也不改变形状。',
        ],
      },
      {
        section: '前置知识',
        title: '叠 N 层',
        doc: [
          paper('3.1 节', 'The encoder is composed of a stack of N = 6 identical layers.', '编码器由 N = 6 个相同的层堆叠而成。'),
          '6 层结构相同，但各有各的参数，不是同一层重复用 6 次。数据依次穿过每一层，形状始终是 `(batch, seq_len, d_model)`。',
          '一层编码器有多少参数：',
          {
            table: {
              head: ['部分', '计算', '参数'],
              rows: [
                ['多头注意力', '4 × 512 × 512', '1,048,576'],
                ['前馈网络', '见第 2 章', '2,099,712'],
                ['两个层归一化', '2 × (512 + 512)', '2,048'],
                ['合计', '', '3,150,336'],
              ],
              num: [2],
              note: '这一章的运行验证会数一遍。',
            },
          },
        ],
      },
      {
        section: '前置知识',
        title: '两个写法：lambda 和 ModuleList',
        doc: [
          '残差连接要接收「子层」本身：它的 `forward(x, sublayer)` 里会调用 `sublayer(...)`。前馈网络只收一个输入，直接传进去就行；可注意力要 `q, k, v, mask` 四个参数。',
          py(
            'lambda',
            'reference/expressions.html#lambda',
            'Lambda expressions (sometimes called lambda forms) are used to create anonymous functions.',
            'lambda 表达式（有时也叫 lambda 形式）用来创建匿名函数。'
          ),
          { code: 'lambda x: self.self_attention_block(x, x, x, src_mask)' },
          '这样就把注意力包成了一个只收 `x` 的小函数。残差连接调用它时，它再把 `x` 同时当作 q、k、v 传给注意力。',
          ref(
            'nn.ModuleList(modules)',
            'generated/torch.nn.ModuleList.html',
            'Holds submodules in a list. ModuleList can be indexed like a regular Python list, but modules it contains are properly registered, and will be visible by all Module methods.',
            '把子模块放在一个列表里。它可以像普通 Python 列表一样按下标取用，但里面的模块会被正确登记，所有 Module 的方法都能看到它们。'
          ),
          '零件如果放进普通的 Python 列表，PyTorch 不知道它们存在：`parameters()` 找不到里面的参数，模型搬到显卡上时它们也不会跟着走。所以一组零件要用 `nn.ModuleList` 装。',
        ],
      },

      /* ============================================================ 残差连接 */
      {
        section: '残差连接',
        title: '第六个零件：外壳',
        file: 'model.py',
        say: [
          '回到 `model.py` 末尾。残差连接里有一次 Dropout 和一个层归一化，构造参数 `features` 就是 `d_model`。',
          '这里第一次用到自己写的零件来造新零件：`LayerNormalization` 是第 2 章写的。',
        ],
        ops: [
          { type: '\n\nclass ResidualConnection(nn.Module):', note: '第六个零件：残差连接，它要包在每个子层外面。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, features: int, dropout: float) -> None:\n        super().__init__()', note: '它里面有一个层归一化和一个 Dropout，所以要知道向量长度和 Dropout 的比例。' },
          { pause: 300 },
          { type: '\n        self.dropout = nn.Dropout(dropout)\n        self.norm = LayerNormalization(features)', note: '把两样东西造好：Dropout，和第 2 章写的层归一化。' },
        ],
      },
      {
        section: '残差连接',
        title: 'forward：Pre-LN 的顺序',
        say: [
          '按 Pre-LN 的顺序，从里往外读：先归一化，再进子层，再 Dropout，最后加回 `x`。',
          '`sublayer` 是传进来的函数。这个零件不关心它具体是注意力还是前馈网络。',
          { formula: ['x + Dropout(Sublayer(LayerNorm(x)))'] },
        ],
        ops: [
          { type: '\n\n    def forward(self, x, sublayer):', note: '`forward` 除了 x，还收一个子层。残差连接不关心子层具体是什么，只负责把它包起来。' },
          { pause: 400 },
          { type: '\n        return x + self.dropout(sublayer(self.norm(x)))', note: '按 Pre-LN 的顺序从里往外：先归一化，再进子层，再 Dropout，最后加回原来的 x。' },
        ],
      },

      /* ============================================================== 编码器 */
      {
        section: '编码器',
        title: '一层编码器：外壳',
        say: [
          '一层编码器由一个自注意力和一个前馈网络组成。这两个零件在外面造好再传进来；以后想换成别的结构，只改组装的地方就行。',
          '参数的类型注解写的正是前两章的零件。',
        ],
        ops: [
          { type: '\n\nclass EncoderBlock(nn.Module):', note: '第七个零件：一层编码器。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, features: int, self_attention_block: MultiHeadAttentionBlock, feed_forward_block: FeedForwardBlock, dropout: float) -> None:\n        super().__init__()', note: '一层编码器由一个自注意力和一个前馈网络组成。这两个零件在外面造好再传进来，所以构造参数里有它们。' },
          { pause: 300 },
          { type: '\n        self.self_attention_block = self_attention_block\n        self.feed_forward_block = feed_forward_block', note: '把传进来的两个子层存下来。' },
        ],
      },
      {
        section: '编码器',
        title: '两个残差连接：nn.ModuleList',
        say: [
          ref(
            'nn.ModuleList(modules)',
            'generated/torch.nn.ModuleList.html',
            'Holds submodules in a list.',
            '把子模块放在一个列表里。'
          ),
          '两个子层各要一个残差连接。用列表推导式造两个，装进 `nn.ModuleList`（前置知识第 5 页）。',
        ],
        ops: [{ type: '\n        self.residual_connections = nn.ModuleList([ResidualConnection(features, dropout) for _ in range(2)])', note: '两个子层各要一个残差连接。造两个装进 `nn.ModuleList`，它们的参数才能被 PyTorch 找到。' }],
      },
      {
        section: '编码器',
        title: 'forward：两个子层',
        say: [
          py(
            'lambda',
            'reference/expressions.html#lambda',
            'Lambda expressions (sometimes called lambda forms) are used to create anonymous functions.',
            'lambda 表达式用来创建匿名函数。'
          ),
          '第一个子层是自注意力，用 `lambda` 包成只收 `x` 的函数；第二个子层是前馈网络，直接传进去。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def forward(self, x, src_mask):', note: '`forward` 收输入和原句的掩码。' },
          { pause: 400 },
          { type: '\n        x = self.residual_connections[0](x, lambda x: self.self_attention_block(x, x, x, src_mask))', note: '第一个子层是自注意力。可残差连接只会把 x 一个参数传给子层，而注意力要 q、k、v 和掩码。用 lambda 包一层：收一个 x，再把它同时当作 q、k、v 传进去。' },
          { pause: 400 },
          { type: '\n        x = self.residual_connections[1](x, self.feed_forward_block)\n        return x', note: '第二个子层是前馈网络，它本来就只收一个输入，直接传进去。然后返回。' },
        ],
      },
      {
        section: '编码器',
        title: '编码器：叠 N 层',
        say: [
          '`Encoder` 收一组已经造好的层，在 `forward` 里让数据依次穿过。',
          '因为用的是 Pre-LN，最后补一个层归一化（前置知识第 2 页）。',
        ],
        ops: [
          { type: '\n\nclass Encoder(nn.Module):', note: '下一个零件：把 N 层编码器叠起来。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, features: int, layers: nn.ModuleList) -> None:\n        super().__init__()\n        self.layers = layers\n        self.norm = LayerNormalization(features)', note: '它收一组造好的层，存下来；因为用的是 Pre-LN，最后一层的输出没有归一化过，所以再准备一个层归一化。' },
          { pause: 500 },
          { type: '\n\n    def forward(self, x, mask):\n        for layer in self.layers:\n            x = layer(x, mask)', note: '`forward` 里让数据依次穿过每一层，上一层的输出就是下一层的输入。' },
          { pause: 400 },
          { type: '\n        return self.norm(x)', note: '全部穿过之后，再做最后一次归一化。' },
        ],
      },

      /* ============================================================ 运行验证 */
      {
        section: '运行验证',
        title: '叠两层试一下',
        file: 'scratch.py',
        say: [
          '清空草稿，叠两层编码器试一下。这次要用 `nn.ModuleList`，所以多导入一个 `torch.nn`。',
          '看两件事：输出形状不变；一层编码器的参数量和前置知识第 4 页的表一致，是 3,150,336。',
        ],
        ops: [
          { clear: 'scratch.py' },
          { type: 'import torch\nimport torch.nn as nn\nfrom model import MultiHeadAttentionBlock, FeedForwardBlock, EncoderBlock, Encoder\n\ntorch.set_grad_enabled(False)', note: '导入编码器用到的四个零件。等会儿要把两层装进 `nn.ModuleList`，所以还要导入 `torch.nn`。' },
          { pause: 400 },
          { type: '\n\nblocks = [EncoderBlock(512, MultiHeadAttentionBlock(512, 8, 0.1), FeedForwardBlock(512, 2048, 0.1), 0.1) for _ in range(2)]\nencoder = Encoder(512, nn.ModuleList(blocks))', note: '造两层编码器：每一层都新造自己的注意力和前馈网络，然后叠成编码器。' },
          { pause: 400 },
          { type: '\n\nx = torch.randn(1, 4, 512)\nprint(encoder(x, None).shape)\nprint(sum(p.numel() for p in blocks[0].parameters()))', note: '看输出形状是不是不变，再数一层编码器的参数量，应该是 3,150,336。' },
          { pause: 600 },
          { run: 'python scratch.py', output: ['torch.Size([1, 4, 512])', '3150336'] },
        ],
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这一章写完了',
        file: 'model.py',
        say: [
          '编码器完成了。一句话经过嵌入、位置编码，再穿过 N 层「自注意力 + 前馈网络」，每个词的向量里都汇总了整句话的信息。形状始终是 `(batch, seq_len, d_model)`。',
          { roadmap: { done: 7, now: 0 } },
          '下一章写解码器。它比编码器多一个子层，用来看编码器的输出。',
        ],
      },
    ],
  };

  root.Catalog.addChapter('transformer', lesson);
})(typeof window !== 'undefined' ? window : globalThis);
