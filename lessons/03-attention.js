/*
 * 第 3 章：多头注意力
 *
 * 接着第 2 章的 model.py 往下写，代码来自 hkproj/pytorch-transformer 的 model.py。
 * 书写顺序按视频：先写构造和 forward 的前半段，需要注意力时回到上方补一个静态方法，再回来写完 forward。
 */
(function (root) {
  'use strict';

  const { ROADMAP, ref, py, paper } = root.LessonKit;

  const lesson = {
    id: '03-attention',
    title: '多头注意力',
    files: ['model.py', 'scratch.py'],
    docName: '前置知识.md',
    roadmap: ROADMAP,
    steps: [
      /* ============================================================ 前置知识 */
      {
        section: '前置知识',
        title: '这一章要写什么',
        doc: [
          '这一章只写一个零件 `MultiHeadAttentionBlock`。它是整个 Transformer 的核心，也是最长的一个：让每个词去看句子里的其他词，按相关程度把它们的信息汇总过来。',
          {
            flow: [
              { label: 'x', sub: '(batch, seq_len, 512)' },
              { label: 'W_q  W_k  W_v', sub: '得到 Q、K、V', part: true },
              { label: '切成 8 个头', sub: '(batch, 8, seq_len, 64)' },
              { label: '注意力', sub: '每个头各算一次', part: true },
              { label: '拼回', sub: '(batch, seq_len, 512)' },
              { label: 'W_o', sub: '混合各头', part: true },
            ],
          },
          { roadmap: { done: 4, now: 1 } },
          '前 5 页是前置知识。',
        ],
      },
      {
        section: '前置知识',
        title: '注意力在做什么',
        doc: [
          paper(
            '3.2 节',
            'An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.',
            '注意力函数可以描述为：把一个 query 和一组 key-value 对映射成一个输出，query、key、value 和输出都是向量。输出是 value 的加权和，每个 value 的权重由 query 和对应 key 的匹配程度决定。'
          ),
          '可以把它想成查资料：每个词带着一个问题（query）；每个词也贴着一个标签（key），附着一份内容（value）。问题和标签越匹配，就从那份内容里取得越多。',
          '比如「猫 追 狗」里，「追」这个词汇总信息时的权重可能是：',
          {
            table: {
              head: ['被看的词', '猫', '追', '狗'],
              rows: [['权重', '0.45', '0.15', '0.40']],
              num: [1, 2, 3],
              note: '数值仅为示意。权重加起来是 1，「追」的新向量 = 0.45 · v猫 + 0.15 · v追 + 0.40 · v狗。',
            },
          },
          'Q、K、V 由同一个输入分别乘上三个可学习的矩阵 W_q、W_k、W_v 得到。输入相同，矩阵不同，三者各司其职。',
        ],
      },
      {
        section: '前置知识',
        title: '缩放点积注意力',
        doc: [
          { formula: ['Attention(Q, K, V) = softmax( Q · Kᵀ / √d_k ) · V'] },
          '一步一步看形状（先只看一个头，省略 batch）：',
          {
            table: {
              head: ['步骤', '运算', '结果形状', '含义'],
              rows: [
                ['Q · Kᵀ', '`(seq_len, d_k)` × `(d_k, seq_len)`', '`(seq_len, seq_len)`', '第 i 行第 j 列：第 i 个词的 query 和第 j 个词的 key 有多匹配'],
                ['÷ √d_k', '', '`(seq_len, seq_len)`', '把分数缩小，原因见下'],
                ['softmax', '按行', '`(seq_len, seq_len)`', '每一行变成加起来等于 1 的权重'],
                ['× V', '`(seq_len, seq_len)` × `(seq_len, d_k)`', '`(seq_len, d_k)`', '按权重把 value 加起来'],
              ],
            },
          },
          paper(
            '3.2.1 节',
            'We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. To counteract this effect, we scale the dot products by 1/√d_k.',
            '我们推测，d_k 较大时点积的数值会变得很大，把 softmax 推到梯度极小的区域。为了抵消这个影响，我们把点积乘以 1/√d_k。'
          ),
          'softmax 把一行任意的数变成一组正数，加起来等于 1。比如 `[2, 1, 0]` 变成 `[0.665, 0.245, 0.090]`。',
          'PyTorch 里 `@` 是矩阵乘法。对更高维的张量，它只在最后两维上做矩阵乘，前面的维度（batch、头）一一对应。',
        ],
      },
      {
        section: '前置知识',
        title: '多头：把 512 维切成 8 份',
        doc: [
          paper(
            '3.2.2 节',
            'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
            '多头注意力让模型能同时关注不同位置上、不同表示子空间里的信息。'
          ),
          paper(
            '3.2.2 节',
            'In this work we employ h = 8 parallel attention layers, or heads. For each of these we use d_k = d_v = d_model/h = 64.',
            '我们使用 h = 8 个并行的注意力层，也就是 8 个头。每个头的 d_k = d_v = d_model/h = 64。'
          ),
          '代码里不建 8 套小矩阵，而是先用一个大矩阵算出完整的 Q、K、V，再把最后一维的 512 切成 8 段，每段 64，交给一个头。算完再拼回 512，乘上 W_o 混合各头的结果。',
          {
            table: {
              head: ['代码', '形状', '说明'],
              rows: [
                ['`self.w_q(q)`', '`(batch, seq_len, 512)`', '完整的 Q'],
                ['`.view(batch, seq_len, 8, 64)`', '`(batch, seq_len, 8, 64)`', '把 512 切成 8 × 64'],
                ['`.transpose(1, 2)`', '`(batch, 8, seq_len, 64)`', '把「头」挪到前面，每个头像一个独立的 batch'],
                ['注意力', '`(batch, 8, seq_len, 64)`', '8 个头同时算'],
                ['`.transpose(1, 2)`', '`(batch, seq_len, 8, 64)`', '挪回去'],
                ['`.view(batch, seq_len, 512)`', '`(batch, seq_len, 512)`', '拼回 512'],
                ['`self.w_o(x)`', '`(batch, seq_len, 512)`', '混合各头'],
              ],
            },
          },
        ],
      },
      {
        section: '前置知识',
        title: '掩码：有些位置不许看',
        doc: [
          '有两种情况要挡住一部分位置。一是一批句子长短不一，短句末尾补齐用的空白词（padding）不该被看。二是解码器生成译文时，不能偷看后面还没生成的词。',
          '做法是在 softmax 之前，把不许看的位置的分数改成一个极小的数，代码里是 -10<sup>9</sup>。e 的 -10<sup>9</sup> 次方几乎就是 0，softmax 之后这些位置的权重就是 0。',
          '挡住「后面的词」用的是下三角掩码：',
          {
            table: {
              head: ['', 'pos 0', 'pos 1', 'pos 2', 'pos 3'],
              rows: [
                ['pos 0', '1', '0', '0', '0'],
                ['pos 1', '1', '1', '0', '0'],
                ['pos 2', '1', '1', '1', '0'],
                ['pos 3', '1', '1', '1', '1'],
              ],
              num: [1, 2, 3, 4],
              note: '1 表示可以看，0 表示挡住。第 i 行只能看第 0 到 i 个位置。这一章的运行验证会用到它。',
            },
          },
          '掩码不必是 4 维的，只要形状能广播到 `(batch, h, seq_len, seq_len)` 就行。',
        ],
      },

      /* ================================================================ 构造 */
      {
        section: '构造',
        title: '第五个零件：外壳与参数',
        file: 'model.py',
        say: [
          '回到 `model.py` 末尾。多头注意力需要三个构造参数：`d_model`、头数 `h`，以及 Dropout 的比例。',
        ],
        ops: [
          { type: '\n\nclass MultiHeadAttentionBlock(nn.Module):' },
          { pause: 300 },
          { type: '\n\n    def __init__(self, d_model: int, h: int, dropout: float) -> None:\n        super().__init__()' },
          { pause: 300 },
          { type: '\n        self.d_model = d_model\n        self.h = h' },
        ],
      },
      {
        section: '构造',
        title: '先写下前提：assert',
        say: [
          py(
            'assert',
            'reference/simple_stmts.html#the-assert-statement',
            'Assert statements are a convenient way to insert debugging assertions into a program',
            '断言语句是在程序里插入调试断言的便捷方式。'
          ),
          '`d_model` 要能平均切成 `h` 份，否则每个头分不到整数个维度。先用 `assert` 把这个前提写下来：不满足时立刻报错，而不是在后面某一步报一个看不懂的形状错误。',
          '然后算出每个头的维度 `d_k`。`//` 是整数除法。',
        ],
        ops: [
          { type: '\n        assert d_model % h == 0, "d_model is not divisible by h"' },
          { pause: 400 },
          { type: '\n\n        self.d_k = d_model // h' },
        ],
      },
      {
        section: '构造',
        title: '四个矩阵',
        say: [
          ref(
            'nn.Linear(…, bias=False)',
            'generated/torch.nn.Linear.html',
            'bias: If set to False, the layer will not learn an additive bias.',
            '设为 False 时，这一层不学习加性偏置。'
          ),
          '`W_q`、`W_k`、`W_v` 把输入变成 Q、K、V，`W_o` 混合各头的输出。论文的公式里这四个都只有矩阵、没有偏置，所以传 `bias=False`。',
          '四个都是 `d_model` 到 `d_model`：先整体算，再切头。',
        ],
        ops: [
          { type: '\n        self.w_q = nn.Linear(d_model, d_model, bias=False)\n        self.w_k = nn.Linear(d_model, d_model, bias=False)\n        self.w_v = nn.Linear(d_model, d_model, bias=False)' },
          { pause: 400 },
          { type: '\n        self.w_o = nn.Linear(d_model, d_model, bias=False)\n        self.dropout = nn.Dropout(dropout)' },
        ],
      },

      /* ========================================================== 切成多个头 */
      {
        section: '切成多个头',
        title: 'forward：算出 Q、K、V',
        say: [
          '`forward` 分开收 `q`、`k`、`v` 三个输入和掩码。自注意力时三个是同一个 `x`；解码器里的交叉注意力，`k`、`v` 来自编码器，所以这里分开收。',
          '先各自乘上对应的矩阵。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n    def forward(self, q, k, v, mask):' },
          { pause: 300 },
          { type: '\n        query = self.w_q(q) # (batch, seq_len, d_model) --> (batch, seq_len, d_model)\n        key = self.w_k(k) # (batch, seq_len, d_model) --> (batch, seq_len, d_model)\n        value = self.w_v(v) # (batch, seq_len, d_model) --> (batch, seq_len, d_model)' },
        ],
      },
      {
        section: '切成多个头',
        title: 'view 和 transpose',
        say: [
          ref(
            'Tensor.view(*shape)',
            'generated/torch.Tensor.view.html',
            'Returns a new tensor with the same data as the self tensor but of a different shape.',
            '返回一个数据相同、形状不同的新张量。'
          ),
          ref(
            'Tensor.transpose(dim0, dim1)',
            'generated/torch.transpose.html',
            'Returns a tensor that is a transposed version of input. The given dimensions dim0 and dim1 are swapped.',
            '返回输入的转置：交换 dim0 和 dim1 这两个维度。'
          ),
          '按前置知识第 4 页的表：`view` 把最后一维拆成 `h × d_k`，`transpose(1, 2)` 把头这一维挪到 `seq_len` 前面。三个张量做法一样。',
          { shape: ['(batch, seq_len, d_model)', '(batch, seq_len, h, d_k)', '(batch, h, seq_len, d_k)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n        # (batch, seq_len, d_model) --> (batch, seq_len, h, d_k) --> (batch, h, seq_len, d_k)' },
          { pause: 400 },
          { type: '\n        query = query.view(query.shape[0], query.shape[1], self.h, self.d_k).transpose(1, 2)' },
          { pause: 300 },
          { type: '\n        key = key.view(key.shape[0], key.shape[1], self.h, self.d_k).transpose(1, 2)\n        value = value.view(value.shape[0], value.shape[1], self.h, self.d_k).transpose(1, 2)' },
        ],
      },

      /* ========================================================== 注意力函数 */
      {
        section: '注意力函数',
        title: '回到上方，补一个静态方法',
        say: [
          py(
            '@staticmethod',
            'library/functions.html#staticmethod',
            'Transform a method into a static method. A static method does not receive an implicit first argument.',
            '把方法变成静态方法。静态方法不会自动收到第一个参数（self）。'
          ),
          ref('torch.matmul（运算符 @）', 'generated/torch.matmul.html', 'Matrix product of two tensors.', '两个张量的矩阵乘法。'),
          '下一步要算注意力。公式是独立的一段计算，不依赖这个零件里存的东西，所以回到 `forward` 上方，把它写成静态方法。',
          '先算分数：Q 乘以 K 的转置，再除以 √d_k。`transpose(-2, -1)` 交换最后两维。',
          { shape: ['(batch, h, seq_len, d_k)', '(batch, h, seq_len, seq_len)'], label: '形状' },
        ],
        ops: [
          {
            type: '\n\n    @staticmethod\n    def attention(query, key, value, mask, dropout: nn.Dropout):',
            after: 'self.w_o = nn.Linear(d_model, d_model, bias=False)\n        self.dropout = nn.Dropout(dropout)',
          },
          { pause: 400 },
          { type: '\n        d_k = query.shape[-1]\n        # (batch, h, seq_len, d_k) --> (batch, h, seq_len, seq_len)', after: 'def attention(query, key, value, mask, dropout: nn.Dropout):' },
          { pause: 400 },
          { type: '\n        attention_scores = (query @ key.transpose(-2, -1)) / math.sqrt(d_k)', after: '# (batch, h, seq_len, d_k) --> (batch, h, seq_len, seq_len)' },
        ],
      },
      {
        section: '注意力函数',
        title: '掩码和 softmax',
        say: [
          ref(
            'Tensor.masked_fill_(mask, value)',
            'generated/torch.Tensor.masked_fill_.html',
            'Fills elements of self tensor with value where mask is True.',
            '在 mask 为 True 的位置，把张量的元素填成 value。'
          ),
          ref(
            'softmax(dim)',
            'generated/torch.nn.functional.softmax.html',
            'It is applied to all slices along dim, and will re-scale them so that the elements lie in the range [0, 1] and sum to 1.',
            '沿 dim 对每一组数分别计算，把它们缩放到 [0, 1] 之间，并且加起来等于 1。'
          ),
          '有掩码时，把 `mask == 0` 的位置填成 -10<sup>9</sup>。方法名末尾的下划线表示直接修改原张量。然后在最后一维上做 softmax，每一行变成权重。',
        ],
        ops: [
          { type: '\n        if mask is not None:\n            attention_scores.masked_fill_(mask == 0, -1e9)', after: '/ math.sqrt(d_k)' },
          { pause: 400 },
          { type: '\n        attention_scores = attention_scores.softmax(dim=-1) # (batch, h, seq_len, seq_len)', after: 'masked_fill_(mask == 0, -1e9)' },
        ],
      },
      {
        section: '注意力函数',
        title: '乘以 V，返回',
        say: [
          '权重也过一次 Dropout，再乘以 V，得到每个位置汇总后的向量。',
          '权重本身也一起返回。之后可以把它画出来，看模型在关注哪里。',
          { shape: ['(batch, h, seq_len, seq_len)', '(batch, h, seq_len, d_k)'], label: '形状' },
        ],
        ops: [
          { type: '\n        if dropout is not None:\n            attention_scores = dropout(attention_scores)', after: 'attention_scores.softmax(dim=-1) # (batch, h, seq_len, seq_len)' },
          { pause: 400 },
          { type: '\n        # (batch, h, seq_len, seq_len) --> (batch, h, seq_len, d_k)\n        return (attention_scores @ value), attention_scores', after: 'attention_scores = dropout(attention_scores)' },
        ],
      },

      /* ============================================================ 拼回各头 */
      {
        section: '拼回各头',
        title: '回到 forward，调用注意力',
        say: [
          '回到 `forward` 末尾调用刚写的静态方法，通过类名调用。',
          '权重存到 `self.attention_scores`，运行验证时会用到。',
        ],
        ops: [{ type: '\n\n        x, self.attention_scores = MultiHeadAttentionBlock.attention(query, key, value, mask, self.dropout)' }],
      },
      {
        section: '拼回各头',
        title: '拼回 d_model，乘以 W_o',
        say: [
          ref(
            'Tensor.contiguous()',
            'generated/torch.Tensor.contiguous.html',
            'Returns a contiguous in memory tensor containing the same data as self tensor.',
            '返回一个数据相同、在内存中连续存放的张量。'
          ),
          '把头挪回原位，再把 `h × d_k` 并回 `d_model`。`transpose` 之后张量在内存里不再连续排列，而 `view` 要求连续，所以中间先调用 `contiguous()`。`view` 里的 -1 表示这一维的长度由 PyTorch 自己算。',
          '最后乘上 `W_o`。',
          { shape: ['(batch, h, seq_len, d_k)', '(batch, seq_len, d_model)'], label: '形状' },
        ],
        ops: [
          { type: '\n\n        # (batch, h, seq_len, d_k) --> (batch, seq_len, h, d_k) --> (batch, seq_len, d_model)' },
          { pause: 400 },
          { type: '\n        x = x.transpose(1, 2).contiguous().view(x.shape[0], -1, self.h * self.d_k)' },
          { pause: 500 },
          { type: '\n\n        # (batch, seq_len, d_model) --> (batch, seq_len, d_model)\n        return self.w_o(x)' },
        ],
      },

      /* ============================================================ 运行验证 */
      {
        section: '运行验证',
        title: '看形状、看权重',
        file: 'scratch.py',
        say: [
          ref(
            'torch.manual_seed(seed)',
            'generated/torch.manual_seed.html',
            'Sets the seed for generating random numbers on all devices.',
            '为所有设备上的随机数生成设置种子。'
          ),
          ref(
            'torch.tril(input)',
            'generated/torch.tril.html',
            'Returns the lower triangular part of the matrix (2-D tensor) or batch of matrices input, the other elements of the result tensor out are set to 0.',
            '返回矩阵的下三角部分，其余元素设为 0。'
          ),
          '固定随机种子，每次运行结果都一样。Dropout 设成 0，权重每一行加起来才正好是 1。',
          '先不加掩码，看形状和每行之和；再加上前置知识第 5 页的下三角掩码，看权重的右上角是不是都变成了 0。',
        ],
        ops: [
          { clear: 'scratch.py' },
          { type: 'import torch\nfrom model import MultiHeadAttentionBlock\n\ntorch.set_grad_enabled(False)\ntorch.manual_seed(0)' },
          { pause: 400 },
          { type: '\n\nx = torch.randn(1, 4, 512)\nmha = MultiHeadAttentionBlock(d_model=512, h=8, dropout=0.0)\nprint(mha(x, x, x, None).shape)\nprint(mha.attention_scores.shape)\nprint(mha.attention_scores[0, 0].sum(dim=-1))' },
          { pause: 500 },
          { type: '\n\nmask = torch.tril(torch.ones(4, 4))\nmha(x, x, x, mask)\nprint(mha.attention_scores[0, 0])' },
          { pause: 600 },
          {
            run: 'python scratch.py',
            output: [
              'torch.Size([1, 4, 512])',
              'torch.Size([1, 8, 4, 4])',
              'tensor([1.0000, 1.0000, 1.0000, 1.0000])',
              'tensor([[1.0000, 0.0000, 0.0000, 0.0000],',
              '        [0.6147, 0.3853, 0.0000, 0.0000],',
              '        [0.4808, 0.2376, 0.2816, 0.0000],',
              '        [0.4354, 0.2579, 0.1475, 0.1591]])',
            ],
          },
        ],
      },

      /* ================================================================ 小结 */
      {
        section: '小结',
        title: '这一章写完了',
        file: 'model.py',
        say: [
          '`model.py` 里现在有五个零件。多头注意力的输入输出都是 `(batch, seq_len, d_model)`，中间切成 `h` 个头，每个头各算一次缩放点积注意力。',
          '运行结果里，第一个位置只能看自己，权重是 1；越往后能看的位置越多，权重分得越散。',
          { roadmap: { done: 5, now: 0 } },
          '下一章用残差连接把注意力和前馈网络串起来，组成编码器。',
        ],
      },
    ],
  };

  (root.LESSONS = root.LESSONS || []).push(lesson);
})(typeof window !== 'undefined' ? window : globalThis);
