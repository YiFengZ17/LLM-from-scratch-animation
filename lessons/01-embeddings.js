/*
 * 第 1 章：词嵌入与位置编码
 *
 * 代码来自 hkproj/pytorch-transformer 的 model.py（Umar Jamil 的视频
 * 「Coding a Transformer from scratch on PyTorch」），顺序按视频里的书写顺序，
 * 说明性的英文注释不保留，只保留标注张量形状的注释。
 *
 * 一章分两段：
 *   1. 前置知识页（带 doc 的步骤）：不写代码，在编辑区以文档的形式把概念讲完。
 *   2. 写代码页（带 ops 的步骤）：旁白只讲两件事——用到的部件是什么（引用官方文档原文），
 *      以及为什么这样写、为什么按这个顺序写。概念不在这里重复。
 *
 * 写法约定：
 *   - ops 的格式见 js/engine.js。打字的文本以换行开头、不以换行结尾。
 *   - 文字里用 `反引号` 标代码，用 **双星号** 加粗，也可以直接写 <sup> 之类的 HTML。
 *   - 引用官方文档用 ref(...)，原文必须和文档一致，改动前先去文档核对。
 */
(function (root) {
  'use strict';

  const ROADMAP = ['词嵌入', '位置编码', '层归一化', '前馈网络', '多头注意力', '残差连接', '编码器', '解码器', '输出层与组装'];

  const DOCS = 'https://pytorch.org/docs/stable/';
  const PAPER = 'https://arxiv.org/abs/1706.03762';

  // 引用 PyTorch 官方文档
  const ref = (api, page, quote, zh) => ({ ref: { api, url: DOCS + page, source: 'PyTorch 文档', quote, zh } });
  // 引用论文《Attention Is All You Need》
  const paper = (where, quote, zh) => ({ ref: { api: '论文 ' + where, url: PAPER, source: '论文原文', quote, zh } });

  const lesson = {
    id: '01-embeddings',
    title: '词嵌入与位置编码',
    files: ['model.py', 'scratch.py'],
    docName: '前置知识.md',
    roadmap: ROADMAP,
    steps: [
      /* ============================================================ 前置知识 */
      {
        section: '前置知识',
        title: '这一章要写什么',
        doc: [
          '这一章在 `model.py` 里写两个零件：`InputEmbeddings` 和 `PositionalEncoding`。它们是 Transformer 的入口，一句话先经过它们，才交给后面的注意力层。',
          {
            table: {
              head: ['阶段', '数据是什么', '形状'],
              rows: [
                ['输入', '每个词在词表里的编号', '`(batch, seq_len)`'],
                ['经过 `InputEmbeddings`', '每个词变成一个表示含义的向量', '`(batch, seq_len, d_model)`'],
                ['经过 `PositionalEncoding`', '向量里加进了位置信息', '`(batch, seq_len, d_model)`'],
              ],
            },
          },
          {
            list: [
              '`batch`：一次送进模型几句话',
              '`seq_len`：每句话有几个词',
              '`d_model`：每个词的向量有多长，论文取 512',
            ],
          },
          { roadmap: { done: 0, now: 2 } },
          '前 6 页是前置知识，不写代码。之后开始写，那时旁白只讲每个部件的作用和书写顺序。按 `→` 或空格翻页，`←` 返回。',
        ],
      },
      {
        section: '前置知识',
        title: '词嵌入：把编号换成向量',
        doc: [
          '句子进入模型之前，已经被切成一个个词（token），每个词换成了它在词表里的编号。编号只是代号：9 不比 5 大，也看不出哪两个词意思相近。',
          '词嵌入给每个词配一个长度为 `d_model` 的向量。所有词的向量排成一张表，`vocab_size` 行、`d_model` 列。拿编号去查表，取出对应的那一行。',
          {
            table: {
              head: ['词', '编号', '查表得到的向量（共 d_model 个数）'],
              rows: [
                ['我', '5', '`[ 0.21, -1.30,  0.07, … ]`'],
                ['爱', '2', '`[-0.58,  0.44,  1.12, … ]`'],
                ['猫', '9', '`[ 0.93,  0.02, -0.76, … ]`'],
              ],
              note: '数值仅为示意。',
            },
          },
          '表里的数一开始是随机的。训练时它们被逐步调整，含义相近的词会得到相近的向量。',
          '论文 3.4 节还规定，查表的结果要再乘以 √d_model（512 时约为 22.6）。常见的解释是让词向量的数值明显大于随后加上去的位置编码。',
        ],
      },
      {
        section: '前置知识',
        title: '为什么要告诉模型位置',
        doc: [
          '「猫追狗」和「狗追猫」用的词完全相同，意思相反。注意力机制同时看整句话里的所有词，本身不区分先后，所以顺序信息必须显式地放进输入里。',
          '做法是为每个位置准备一个同样长度为 `d_model` 的向量，加到那个位置的词向量上。',
          {
            table: {
              head: ['位置', '词向量', '', '位置向量', '', '送入模型的向量'],
              rows: [
                ['0', '「猫」的向量', '+', '位置 0 的向量', '=', '在第 0 位的「猫」'],
                ['1', '「追」的向量', '+', '位置 1 的向量', '=', '在第 1 位的「追」'],
                ['2', '「狗」的向量', '+', '位置 2 的向量', '=', '在第 2 位的「狗」'],
              ],
            },
          },
          '位置向量也排成一张表，`seq_len` 行、`d_model` 列，第 k 行是位置 k 的向量。这张表按公式直接算出来，不参与训练。',
        ],
      },
      {
        section: '前置知识',
        title: '位置表里填什么数',
        doc: [
          '论文用正弦和余弦来填这张表：',
          {
            formula: [
              'PE(pos, 2i)   = sin( pos / 10000<sup>2i/d_model</sup> )',
              'PE(pos, 2i+1) = cos( pos / 10000<sup>2i/d_model</sup> )',
            ],
          },
          '`pos` 是行号，即第几个位置。`2i` 和 `2i+1` 是列号：偶数列用 sin，奇数列用 cos，相邻的两列共用一个分母。',
          {
            table: {
              head: ['pos', '第 0 列 sin', '第 1 列 cos', '第 2 列 sin', '第 3 列 cos', '…'],
              rows: [
                ['0', '0.000', '1.000', '0.000', '1.000', '…'],
                ['1', '0.841', '0.540', '0.822', '0.570', '…'],
                ['2', '0.909', '-0.416', '0.936', '-0.351', '…'],
                ['3', '0.141', '-0.990', '0.245', '-0.970', '…'],
              ],
              num: [0, 1, 2, 3, 4],
              note: 'd_model = 512 时位置表的左上角。',
            },
          },
          '列号越大，分母越大，那一列随位置变化得越慢，就像秒针、分针和时针。各列合在一起，每个位置都得到一组独有的数，而且都在 -1 到 1 之间。',
          '代码里不直接算 10000 的幂，而是用等价的指数形式，数值上更稳定。它算出的是分母的倒数，所以代码里用乘法：',
          { formula: ['1 / 10000<sup>2i/d_model</sup> = exp( 2i · (−ln 10000 / d_model) )'] },
        ],
      },
      {
        section: '前置知识',
        title: 'PyTorch 里一个零件怎么写',
        doc: [
          'PyTorch 里的每个零件都是一个继承 `nn.Module` 的类，固定由两部分组成：',
          {
            code: [
              'class MyPart(nn.Module):',
              '',
              '    def __init__(self, ...):',
              '        super().__init__()   # 必须最先调用',
              '        ...                  # 造：准备这个零件要用到的东西',
              '',
              '    def forward(self, x):',
              '        ...                  # 用：数据 x 流过时做什么',
              '        return x',
            ].join('\n'),
          },
          '零件里的张量分两种：',
          {
            list: [
              '**参数**：训练时会被更新，比如词嵌入那张表。',
              '**buffer**：不更新，但随模型一起保存、一起搬到显卡上，比如位置表。',
            ],
          },
          '这一章的两个零件都按这个骨架写：先 `__init__`，再 `forward`。',
        ],
      },
      {
        section: '前置知识',
        title: '广播：形状不同也能运算',
        doc: [
          '两个张量形状不同时，PyTorch 会把长度为 1 的维度自动扩展到和对方一致，再逐个元素运算。这叫广播。',
          ref(
            '广播语义',
            'notes/broadcasting.html',
            'In short, if a PyTorch operation supports broadcast, then its Tensor arguments can be automatically expanded to be of equal sizes (without making copies of the data).',
            '简单说，如果一个运算支持广播，它的张量参数会被自动扩展成相同的大小（不复制数据）。'
          ),
          '这一章用到两次：',
          {
            table: {
              head: ['用在哪里', '运算', '结果的形状'],
              rows: [
                ['算位置表', '`(seq_len, 1)` × `(d_model/2,)`', '`(seq_len, d_model/2)`'],
                ['把位置加到词向量上', '`(batch, seq_len, d_model)` + `(1, seq_len, d_model)`', '`(batch, seq_len, d_model)`'],
              ],
            },
          },
          '第一次是一列乘一行，得到每个位置和每个频率的组合：',
          {
            table: {
              head: ['', 'w₀', 'w₁', 'w₂'],
              rows: [
                ['pos = 0', '0 · w₀', '0 · w₁', '0 · w₂'],
                ['pos = 1', '1 · w₀', '1 · w₁', '1 · w₂'],
                ['pos = 2', '2 · w₀', '2 · w₁', '2 · w₂'],
              ],
              note: 'w 是上一页算出的分母的倒数。',
            },
          },
          '前置知识到这里结束，下一页开始写代码。写的过程中可以随时点上方的「前置知识.md」标签回来查。',
        ],
      },

      /* ============================================================== 词嵌入 */
      {
        section: '词嵌入',
        title: '导入',
        say: ['从空文件开始，先导入 PyTorch。后面所有零件都从 `torch.nn` 里取，按惯例简写成 `nn`。'],
        ops: [{ type: 'import torch\nimport torch.nn as nn' }],
      },
      {
        section: '词嵌入',
        title: '第一个零件的外壳',
        say: [
          ref('nn.Module', 'generated/torch.nn.Module.html', 'Base class for all neural network modules. Your models should also subclass this class.', '所有神经网络模块的基类。你自己的模型也应该继承它。'),
          '按骨架，先写类名并继承 `nn.Module`。',
        ],
        ops: [{ type: '\n\nclass InputEmbeddings(nn.Module):' }],
      },
      {
        section: '词嵌入',
        title: '__init__ 要哪些参数',
        say: [
          '要建一张 `vocab_size` 行、`d_model` 列的表，需要的就是这两个数，所以它们是构造参数。',
          ref(
            'nn.Module',
            'generated/torch.nn.Module.html',
            'an __init__() call to the parent class must be made before assignment on the child.',
            '给子类的属性赋值之前，必须先调用父类的 __init__()。'
          ),
          '所以 `super().__init__()` 写在第一行。',
        ],
        ops: [{ type: '\n\n    def __init__(self, d_model: int, vocab_size: int) -> None:\n        super().__init__()' }],
      },
      {
        section: '词嵌入',
        title: '建表：nn.Embedding',
        say: [
          ref(
            'nn.Embedding(num_embeddings, embedding_dim)',
            'generated/torch.nn.Embedding.html',
            'A simple lookup table that stores embeddings of a fixed dictionary and size.',
            '一张简单的查找表，存放固定词典大小、固定长度的嵌入向量。'
          ),
          '先把两个参数存下来，`d_model` 在 `forward` 里还要用。再建表：第一个参数是行数，传词表大小；第二个是每行的长度，传 `d_model`。',
          { shape: ['(vocab_size, d_model)'], label: '嵌入表' },
        ],
        ops: [
          { type: '\n        self.d_model = d_model\n        self.vocab_size = vocab_size' },
          { pause: 500 },
          { type: '\n        self.embedding = nn.Embedding(vocab_size, d_model)' },
        ],
      },
      {
        section: '词嵌入',
        title: 'forward：查表',
        say: [
          '先写一行注释，把输入和输出的形状定下来，再写实现。',
          '查表就是把编号交给 `self.embedding`。每个编号换成一个向量，所以输出多出一维。',
          { shape: ['(batch, seq_len)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def forward(self, x):\n        # (batch, seq_len) --> (batch, seq_len, d_model)' },
          { pause: 400 },
          { type: '\n        return self.embedding(x)' },
        ],
      },
      {
        section: '词嵌入',
        title: '回到这一行，补上缩放',
        say: [
          paper('3.4 节', 'In the embedding layers, we multiply those weights by √d_model.', '在嵌入层里，我们把这些权重乘以 √d_model。'),
          '查表已经写对了，再回到 `return` 这一行，把论文要求的缩放补在后面。',
        ],
        ops: [{ type: ' * math.sqrt(self.d_model)', after: 'return self.embedding(x)' }],
      },
      {
        section: '词嵌入',
        title: '回到顶部，补上 import',
        say: ['上一步用了 `math.sqrt`，但文件开头还没有导入 `math`。回到顶部补上。'],
        ops: [{ type: '\nimport math', after: 'import torch.nn as nn' }],
      },
      {
        section: '词嵌入',
        title: '运行验证',
        file: 'scratch.py',
        say: [
          '零件写完就单独跑一下。新建草稿文件 `scratch.py`，造一句 3 个词的输入：外层方括号是 1 句话，内层是 3 个编号。',
          { shape: ['(1, 3)', '(1, 3, 512)'], label: '预期' },
        ],
        ops: [
          { type: 'import torch\nfrom model import InputEmbeddings' },
          { pause: 300 },
          { type: '\n\nx = torch.tensor([[5, 2, 9]])\nembed = InputEmbeddings(d_model=512, vocab_size=1000)' },
          { pause: 300 },
          { type: '\n\nprint(x.shape)\nprint(embed(x).shape)' },
          { pause: 600 },
          { run: 'python scratch.py', output: ['torch.Size([1, 3])', 'torch.Size([1, 3, 512])'] },
        ],
      },

      /* ============================================================ 位置编码 */
      {
        section: '位置编码',
        title: '第二个零件：外壳与参数',
        file: 'model.py',
        say: [
          '回到 `model.py`，接在后面写第二个零件，骨架相同。',
          '它要建一张 `seq_len` 行、`d_model` 列的位置表，论文还要求在这里用一次 Dropout，所以构造参数是这三个。',
        ],
        ops: [
          { type: '\n\nclass PositionalEncoding(nn.Module):' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, d_model: int, seq_len: int, dropout: float) -> None:\n        super().__init__()' },
          { pause: 300 },
          { type: '\n        self.d_model = d_model\n        self.seq_len = seq_len' },
        ],
      },
      {
        section: '位置编码',
        title: 'nn.Dropout',
        say: [
          ref(
            'nn.Dropout(p)',
            'generated/torch.nn.Dropout.html',
            'During training, randomly zeroes some of the elements of the input tensor with probability p.',
            '训练时，以概率 p 随机把输入张量里的一部分元素置零。'
          ),
          paper(
            '5.4 节',
            'we apply dropout to the sums of the embeddings and the positional encodings',
            '我们对嵌入与位置编码相加的结果使用 dropout。'
          ),
          '先在 `__init__` 里把它建好，`forward` 里再用。',
        ],
        ops: [{ type: '\n        self.dropout = nn.Dropout(dropout)' }],
      },
      {
        section: '位置编码',
        title: '先建一张空表',
        say: [
          ref(
            'torch.zeros(*size)',
            'generated/torch.zeros.html',
            'Returns a tensor filled with the scalar value 0, with the shape defined by the variable argument size.',
            '返回一个全为 0 的张量，形状由参数 size 指定。'
          ),
          '位置表先建成全 0，后面分两次把 sin 和 cos 填进去。`pe` 是 positional encoding 的缩写。',
          { shape: ['(seq_len, d_model)'], label: 'pe' },
        ],
        ops: [{ type: '\n        pe = torch.zeros(seq_len, d_model) # (seq_len, d_model)' }],
      },
      {
        section: '位置编码',
        title: '公式里的 pos',
        say: [
          ref(
            'torch.arange(start, end, step)',
            'generated/torch.arange.html',
            'Returns a 1-D tensor … with values from the interval [start, end) taken with common difference step beginning from start.',
            '返回一维张量，取值从 start 开始、间隔为 step、落在 [start, end) 区间内。'
          ),
          ref(
            'Tensor.unsqueeze(dim)',
            'generated/torch.unsqueeze.html',
            'Returns a new tensor with a dimension of size one inserted at the specified position.',
            '返回一个新张量，在指定位置插入一个长度为 1 的维度。'
          ),
          '`arange` 生成 0 到 `seq_len - 1`，`unsqueeze(1)` 把它变成一列，为后面的广播做准备。',
          { shape: ['(seq_len,)', '(seq_len, 1)'], label: '形状' },
        ],
        ops: [{ type: '\n        position = torch.arange(0, seq_len, dtype=torch.float).unsqueeze(1) # (seq_len, 1)' }],
      },
      {
        section: '位置编码',
        title: '公式里的分母',
        say: [
          ref(
            'torch.exp(input)',
            'generated/torch.exp.html',
            'Returns a new tensor with the exponential of the elements of the input tensor input.',
            '返回一个新张量，元素是输入各元素的指数 e<sup>x</sup>。'
          ),
          '按前置知识里的换算，把分母的倒数写成 `exp` 的形式。步长为 2 的 `arange` 就是公式里的 `2i`，所以结果的长度是 `d_model / 2`。',
          { shape: ['(d_model/2,)'], label: 'div_term' },
        ],
        ops: [{ type: '\n        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)) # (d_model / 2)' }],
      },
      {
        section: '位置编码',
        title: '填入 sin 和 cos',
        say: [
          ref(
            'torch.sin(input)',
            'generated/torch.sin.html',
            'Returns a new tensor with the sine of the elements in the input tensor, where each value in this input tensor is in radians.',
            '返回一个新张量，元素是输入各元素的正弦值，输入以弧度为单位。'
          ),
          '`position * div_term` 是一列乘一行，广播成一张表。',
          { shape: ['(seq_len, 1) × (d_model/2,)', '(seq_len, d_model/2)'], label: '广播' },
          '`0::2` 选出偶数列，填 sin；`1::2` 选出奇数列，填 cos。',
        ],
        ops: [
          { type: '\n        pe[:, 0::2] = torch.sin(position * div_term)' },
          { pause: 500 },
          { type: '\n        pe[:, 1::2] = torch.cos(position * div_term)' },
        ],
      },
      {
        section: '位置编码',
        title: '补一个 batch 维',
        say: [
          '词向量的形状是 `(batch, seq_len, d_model)`。给位置表在最前面补一个长度为 1 的维度，相加时它就能广播到一批里的每一句话。',
          { shape: ['(seq_len, d_model)', '(1, seq_len, d_model)'], label: '形状' },
        ],
        ops: [{ type: '\n        pe = pe.unsqueeze(0) # (1, seq_len, d_model)' }],
      },
      {
        section: '位置编码',
        title: '登记为 buffer',
        say: [
          ref(
            'Module.register_buffer(name, tensor)',
            'generated/torch.nn.Module.html#torch.nn.Module.register_buffer',
            'This is typically used to register a buffer that should not be considered a model parameter. … Buffers, by default, are persistent and will be saved alongside parameters.',
            '通常用来登记不应算作模型参数的 buffer。……buffer 默认是持久的，会和参数一起保存。'
          ),
          '`pe` 是算出来的，不需要训练，但要跟着模型走，所以登记为 buffer。登记之后用 `self.pe` 访问。',
        ],
        ops: [{ type: "\n        self.register_buffer('pe', pe)" }],
      },
      {
        section: '位置编码',
        title: 'forward：加上位置',
        say: [
          ref(
            'Tensor.requires_grad_(requires_grad)',
            'generated/torch.Tensor.requires_grad_.html',
            "Change if autograd should record operations on this tensor: sets this tensor's requires_grad attribute in-place. Returns this tensor.",
            '设置 autograd 是否记录这个张量上的运算：原地修改它的 requires_grad 属性，并返回这个张量。'
          ),
          '位置表按最大长度 `seq_len` 建的，这批句子可能更短，所以只取前 `x.shape[1]` 行。传 `False` 表示位置表不参与求导。相加之后过 Dropout，形状不变。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def forward(self, x):\n        x = x + (self.pe[:, :x.shape[1], :]).requires_grad_(False) # (batch, seq_len, d_model)' },
          { pause: 600 },
          { type: '\n        return self.dropout(x)' },
        ],
      },
      {
        section: '位置编码',
        title: '运行验证',
        file: 'scratch.py',
        say: [
          '回到 `scratch.py`。先在导入那一行补上新零件的名字，再把词向量送进去。',
          { shape: ['(1, 3, 512)', '(1, 3, 512)'], label: '预期' },
          '最后一行打印位置 0 的前 4 个数。按公式是 sin(0)、cos(0) 交替，应该是 0、1、0、1，和前置知识里那张表的第一行一致。',
        ],
        ops: [
          { type: ', PositionalEncoding', after: 'from model import InputEmbeddings' },
          { pause: 400 },
          { type: '\n\npos = PositionalEncoding(d_model=512, seq_len=100, dropout=0.1)\nprint(pos(embed(x)).shape)\nprint(pos.pe[0, 0, :4])' },
          { pause: 600 },
          {
            run: 'python scratch.py',
            output: ['torch.Size([1, 3])', 'torch.Size([1, 3, 512])', 'torch.Size([1, 3, 512])', 'tensor([0., 1., 0., 1.])'],
          },
        ],
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这一章写完了',
        file: 'model.py',
        say: [
          '`model.py` 里现在有两个零件。一句话经过它们，形状从 `(batch, seq_len)` 变成 `(batch, seq_len, d_model)`，后面所有零件接收和输出的都是这个形状。',
          { roadmap: { done: 2, now: 0 } },
          '这是演示版的第一章，后面的章节还在制作中。',
        ],
      },
    ],
  };

  (root.LESSONS = root.LESSONS || []).push(lesson);
})(typeof window !== 'undefined' ? window : globalThis);
