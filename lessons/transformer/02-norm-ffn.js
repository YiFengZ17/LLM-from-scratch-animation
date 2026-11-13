/*
 * 第 2 章：层归一化与前馈网络
 *
 * 接着第 1 章的 model.py 往下写，代码来自 hkproj/pytorch-transformer 的 model.py。
 * 写法约定见 lessons/01-embeddings.js 开头。
 */
(function (root) {
  'use strict';

  const { ref, paper } = root.LessonKit;
  const ROADMAP = root.Catalog.byId.transformer.roadmap;

  const lesson = {
    id: '02-norm-ffn',
    title: '层归一化与前馈网络',
    summary: '把每个向量拉回同一尺度；每个位置各自做一次「放大、激活、缩回」。',
    files: ['model.py', 'scratch.py'],
    docName: '前置知识.md',
    roadmap: ROADMAP,
    steps: [
      /* ============================================================ 前置知识 */
      {
        section: '前置知识',
        title: '这一章要写什么',
        doc: [
          '上一章的两个零件把一句话变成了 `(batch, seq_len, d_model)` 的向量。这一章再写两个零件，它们都不改变形状，是后面编码器和解码器里反复用到的基础件。',
          {
            flow: [
              { label: '向量', sub: '(batch, seq_len, 512)' },
              { label: 'LayerNormalization', sub: '每个向量各自归一化', part: true },
              { label: '向量', sub: '(batch, seq_len, 512)' },
            ],
          },
          {
            flow: [
              { label: '向量', sub: '(batch, seq_len, 512)' },
              { label: 'FeedForwardBlock', sub: '放大、激活、缩回', part: true },
              { label: '向量', sub: '(batch, seq_len, 512)' },
            ],
          },
          { roadmap: { done: 2, now: 2 } },
          '前 4 页是前置知识，之后开始写代码。',
        ],
      },
      {
        section: '前置知识',
        title: '层归一化：把每个向量拉回同一尺度',
        doc: [
          '数据经过一层层计算，向量里的数可能越来越大，也可能越来越小，后面的层就很难学。层归一化的做法是：对每个词的向量，单独算出它这 `d_model` 个数的平均值和标准差，减去平均值，再除以标准差。',
          { formula: ['LayerNorm(x) = α · (x − mean) / (std + ε) + bias'] },
          '平均值和标准差是在最后一维上算的，也就是一个词向量自己的 512 个数之间。不同的词、不同的句子互不影响。',
          '用 4 个数的小向量走一遍：',
          {
            table: {
              head: ['', '第 0 个', '第 1 个', '第 2 个', '第 3 个'],
              rows: [
                ['x', '1', '2', '3', '4'],
                ['x − mean', '-1.5', '-0.5', '0.5', '1.5'],
                ['÷ std', '-1.162', '-0.387', '0.387', '1.162'],
              ],
              num: [1, 2, 3, 4],
              note: 'mean = 2.5，std = √(5/3) ≈ 1.291。PyTorch 的 std 默认除以 N − 1 而不是 N。这一章的运行验证会用到这个例子。',
            },
          },
          '处理之后，这个向量的平均值是 0，标准差是 1。',
        ],
      },
      {
        section: '前置知识',
        title: '可学习的缩放和平移',
        doc: [
          '归一化之后，每个向量的平均值都是 0、标准差都是 1。这未必是后面的层最想要的分布，所以再给每一维配一个可学习的缩放 α 和平移 bias，让模型自己决定要不要、要多少回到原来的尺度。',
          {
            list: [
              '**α**：长度为 `d_model`，初始全是 1',
              '**bias**：长度为 `d_model`，初始全是 0',
              '**ε**：很小的常数 10<sup>-6</sup>，防止标准差接近 0 时除出一个巨大的数',
            ],
          },
          '初始时 α = 1、bias = 0，层归一化就是纯粹的标准化。训练过程中它们会被调整。',
          'α 和 bias 要训练，所以它们是**参数**；上一章的位置表不训练，是 **buffer**。',
        ],
      },
      {
        section: '前置知识',
        title: '前馈网络：每个位置各自过两层全连接',
        doc: [
          paper(
            '3.3 节',
            'In addition to attention sub-layers, each of the layers in our encoder and decoder contains a fully connected feed-forward network, which is applied to each position separately and identically. This consists of two linear transformations with a ReLU activation in between.',
            '除了注意力子层，编码器和解码器的每一层还包含一个全连接前馈网络，它对每个位置分别、以相同的方式作用。它由两次线性变换组成，中间夹一个 ReLU 激活。'
          ),
          { formula: ['FFN(x) = max(0, x·W₁ + b₁)·W₂ + b₂'] },
          '`max(0, …)` 就是 ReLU：负数变成 0，正数原样保留。比如 `[-2, 0.5, 3]` 变成 `[0, 0.5, 3]`。',
          paper(
            '3.3 节',
            'The dimensionality of input and output is d_model = 512, and the inner-layer has dimensionality d_ff = 2048.',
            '输入和输出的维度是 d_model = 512，中间层的维度是 d_ff = 2048。'
          ),
          {
            table: {
              head: ['步骤', '结果形状', '参数'],
              rows: [
                ['第一次线性变换 W₁、b₁', '`(batch, seq_len, 2048)`', '512 × 2048 + 2048 = 1,050,624'],
                ['ReLU', '`(batch, seq_len, 2048)`', '无'],
                ['第二次线性变换 W₂、b₂', '`(batch, seq_len, 512)`', '2048 × 512 + 512 = 1,049,088'],
              ],
              note: '合计 2,099,712 个参数。这一章的运行验证会数一遍。',
            },
          },
        ],
      },

      /* ============================================================ 层归一化 */
      {
        section: '层归一化',
        title: '第三个零件：外壳与参数',
        file: 'model.py',
        say: [
          '回到 `model.py` 末尾，按骨架写层归一化。',
          '构造参数 `features` 是向量的长度，也就是 `d_model`。`eps` 给一个默认值 10<sup>-6</sup>。',
        ],
        ops: [
          { type: '\n\nclass LayerNormalization(nn.Module):', note: '第三个零件：层归一化。还是先继承 `nn.Module`。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, features: int, eps: float = 10**-6) -> None:\n        super().__init__()', note: '它要知道每个向量有多长（`features`），还要一个防止除以 0 的小数 `eps`，默认给 10⁻⁶。' },
        ],
      },
      {
        section: '层归一化',
        title: 'α 和 bias：nn.Parameter',
        say: [
          ref(
            'nn.Parameter(data)',
            'generated/torch.nn.parameter.Parameter.html',
            'A kind of Tensor that is to be considered a module parameter.',
            '一种会被当作模块参数的张量。'
          ),
          ref(
            'torch.ones(*size)',
            'generated/torch.ones.html',
            'Returns a tensor filled with the scalar value 1, with the shape defined by the variable argument size.',
            '返回一个全为 1 的张量，形状由参数 size 指定。'
          ),
          '`eps` 直接存下来。α 初始全 1、bias 初始全 0，用 `nn.Parameter` 包起来，它们就会被登记为参数，训练时会被更新。',
        ],
        ops: [
          { type: '\n        self.eps = eps', note: '`eps` 先存下来，公式里要用。' },
          { pause: 300 },
          { type: '\n        self.alpha = nn.Parameter(torch.ones(features))\n        self.bias = nn.Parameter(torch.zeros(features))', note: '归一化之后还要可学习的缩放和平移：缩放 α 一开始全是 1，平移 bias 一开始全是 0。它们要参与训练，所以用 `nn.Parameter` 包起来。' },
        ],
      },
      {
        section: '层归一化',
        title: 'forward：平均值和标准差',
        say: [
          ref(
            'Tensor.mean(dim, keepdim)',
            'generated/torch.mean.html',
            'Returns the mean value of each row of the input tensor in the given dimension dim.',
            '返回输入张量在指定维度 dim 上每一行的平均值。'
          ),
          ref(
            'Tensor.std(dim, keepdim)',
            'generated/torch.std.html',
            'Calculates the standard deviation over the dimensions specified by dim.',
            '在 dim 指定的维度上计算标准差。'
          ),
          '`dim=-1` 是最后一维。`keepdim=True` 保留被求平均的那一维，长度变成 1，下一行才能和 `x` 广播相减。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, 1)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def forward(self, x):\n        # x: (batch, seq_len, hidden_size)', note: '`forward` 里套公式。先写下输入的形状。' },
          { pause: 400 },
          { type: '\n        mean = x.mean(dim=-1, keepdim=True) # (batch, seq_len, 1)', note: '公式要的第一样东西是平均值：每个向量自己那 d_model 个数的平均，所以在最后一维上算；`keepdim=True` 保留这一维，下面才能和 x 直接相减。' },
          { pause: 300 },
          { type: '\n        std = x.std(dim=-1, keepdim=True) # (batch, seq_len, 1)', note: '第二样是标准差，同样在最后一维上算、保留维度。' },
        ],
      },
      {
        section: '层归一化',
        title: '套用公式',
        say: [
          '按前置知识里的公式写出来。减 `mean`、除以 `std + self.eps` 都靠广播，`(batch, seq_len, 1)` 扩展到 `(batch, seq_len, d_model)`。',
          '乘 `self.alpha`、加 `self.bias` 也是广播：它们的长度 `d_model` 对上最后一维。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [{ type: '\n        return self.alpha * (x - mean) / (std + self.eps) + self.bias', note: '原料齐了，照公式写出来：减去平均值，除以（标准差加 eps），再乘 α、加 bias。' }],
      },

      /* ============================================================ 前馈网络 */
      {
        section: '前馈网络',
        title: '第四个零件：两次线性变换',
        say: [
          ref(
            'nn.Linear(in_features, out_features)',
            'generated/torch.nn.Linear.html',
            'Applies an affine linear transformation to the incoming data: y = xA^T + b.',
            '对输入做一次仿射线性变换：y = xAᵀ + b。'
          ),
          '两次线性变换各用一个 `nn.Linear`：第一个把 `d_model` 放大到 `d_ff`，第二个再变回 `d_model`。按数据经过的顺序写：放大、Dropout、缩回。',
        ],
        ops: [
          { type: '\n\nclass FeedForwardBlock(nn.Module):', note: '第四个零件：前馈网络。' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, d_model: int, d_ff: int, dropout: float) -> None:\n        super().__init__()', note: '它要知道输入输出的长度 d_model、中间放大到多长 d_ff，以及 Dropout 的比例。' },
          { pause: 400 },
          { type: '\n        self.linear_1 = nn.Linear(d_model, d_ff)\n        self.dropout = nn.Dropout(dropout)\n        self.linear_2 = nn.Linear(d_ff, d_model)', note: '按数据经过的顺序把零件造好：先放大（d_model → d_ff），中间一个 Dropout，再缩回（d_ff → d_model）。' },
        ],
      },
      {
        section: '前馈网络',
        title: 'forward：从里往外写',
        say: [
          ref(
            'torch.relu(input)',
            'generated/torch.nn.functional.relu.html',
            'Applies the rectified linear unit function element-wise.',
            '对每个元素分别应用 ReLU 函数。'
          ),
          '数据先过 `linear_1`，所以先写最里面这一层，再一层层往外包：ReLU、Dropout，最后是 `linear_2`。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, d_ff)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def forward(self, x):\n        # (batch, seq_len, d_model) --> (batch, seq_len, d_ff) --> (batch, seq_len, d_model)', note: '`forward` 先写下形状的变化：d_model 放大到 d_ff，再变回 d_model。' },
          { pause: 400 },
          { type: '\n        return self.linear_1(x)', note: '数据第一个经过的是 `linear_1`，先把最里面这一层写出来。' },
          { pause: 500 },
          { type: 'torch.relu(', before: 'self.linear_1(x)', note: '放大之后要过 ReLU，在它外面包一层 `torch.relu(`。' },
          { type: ')', after: 'torch.relu(self.linear_1(x)', note: '把括号补上。' },
          { pause: 400 },
          { type: 'self.dropout(', before: 'torch.relu(self.linear_1(x))', note: 'ReLU 之后是 Dropout，再往外包一层。' },
          { type: ')', after: 'self.dropout(torch.relu(self.linear_1(x))', note: '补上括号。' },
          { pause: 400 },
          { type: 'self.linear_2(', before: 'self.dropout(torch.relu(self.linear_1(x)))', note: '最后缩回 d_model：最外面包上 `linear_2`。' },
          { type: ')', after: 'self.linear_2(self.dropout(torch.relu(self.linear_1(x)))', note: '补上最后一个括号。整行从里往外读，正好是数据流过的顺序。' },
        ],
      },

      /* ============================================================ 运行验证 */
      {
        section: '运行验证',
        title: '两个零件一起验证',
        file: 'scratch.py',
        say: [
          ref(
            'torch.set_grad_enabled(mode)',
            'generated/torch.autograd.grad_mode.set_grad_enabled.html',
            'Context-manager that sets gradient calculation on or off. … It can be used as a context-manager or as a function.',
            '开关梯度计算的上下文管理器。……既可以当上下文管理器用，也可以当函数直接调用。'
          ),
          '清空草稿文件，重写这一章的测试。草稿里只做前向计算，用不到梯度，开头关掉它，打印出来的张量就不会带上求导的信息。',
          '层归一化用前置知识里那个手算的例子，应该得到 `[-1.162, -0.387, 0.387, 1.162]`。前馈网络看形状和参数量：`parameters()` 依次给出每个参数，`numel()` 是一个张量里数的个数，加起来应该是 2,099,712。',
        ],
        ops: [
          { clear: 'scratch.py' },
          { type: 'import torch\nfrom model import LayerNormalization, FeedForwardBlock\n\ntorch.set_grad_enabled(False)', note: '导入这一章的两个零件。测试只做前向计算，用不到梯度，所以紧接着把梯度关掉。' },
          { pause: 400 },
          { type: '\n\nx = torch.tensor([[[1., 2., 3., 4.]]])\nnorm = LayerNormalization(features=4)\nprint(norm(x))', note: '层归一化用前置知识里手算过的例子 [1, 2, 3, 4]，看输出是不是 [-1.162, -0.387, 0.387, 1.162]。' },
          { pause: 400 },
          { type: '\n\nffn = FeedForwardBlock(d_model=512, d_ff=2048, dropout=0.1)\ny = torch.randn(1, 3, 512)\nprint(ffn(y).shape)\nprint(sum(p.numel() for p in ffn.parameters()))', note: '前馈网络看两件事：形状不变；参数量和前置知识里的表一致，应该是 2,099,712。' },
          { pause: 600 },
          {
            run: 'python scratch.py',
            output: ['tensor([[[-1.1619, -0.3873,  0.3873,  1.1619]]])', 'torch.Size([1, 3, 512])', '2099712'],
          },
        ],
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这一章写完了',
        file: 'model.py',
        say: [
          '`model.py` 里现在有四个零件。这一章的两个都不改变形状：层归一化把每个向量拉回同一尺度，前馈网络对每个位置各自做一次「放大、激活、缩回」。',
          { roadmap: { done: 4, now: 0 } },
          '下一章写 Transformer 的核心：多头注意力。',
        ],
      },
    ],
  };

  root.Catalog.addChapter('transformer', lesson);
})(typeof window !== 'undefined' ? window : globalThis);
