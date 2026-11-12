/*
 * 第 1 章：词嵌入与位置编码
 *
 * 代码来自 hkproj/pytorch-transformer 的 model.py（Umar Jamil 的视频
 * 「Coding a Transformer from scratch on PyTorch」），顺序按视频里的书写顺序，
 * 说明性的英文注释改由旁白来讲，只保留标注张量形状的注释。
 *
 * 写法约定：
 *   - 每一步是一个「思路步」：say 是旁白，ops 是这一步对代码做的事（格式见 js/engine.js）。
 *   - 打字的文本以换行开头、不以换行结尾，这样光标总是停在刚写完的那一行末尾。
 *   - 旁白里用 `反引号` 标代码，用 **双星号** 加粗，也可以直接写 <sup> 之类的 HTML。
 */
(function (root) {
  'use strict';

  const ROADMAP = ['词嵌入', '位置编码', '层归一化', '前馈网络', '多头注意力', '残差连接', '编码器', '解码器', '输出层与组装'];

  const lesson = {
    id: '01-embeddings',
    title: '词嵌入与位置编码',
    files: ['model.py', 'scratch.py'],
    roadmap: ROADMAP,
    steps: [
      /* ---------------------------------------------------------------- 开场 */
      {
        section: '开场',
        title: '从一个空文件开始',
        say: [
          '左边是一个空的 `model.py`。接下来我们会在这个文件里，一行一行写出论文《Attention Is All You Need》里的 Transformer。',
          '你不用动手敲。每翻一页，右边这一栏先告诉你这一步在想什么，然后代码会自己一个字一个字打出来。读旁白的时候可以先猜一猜：下一行会写什么？',
          '这一章只做最前面的两件事：把词变成向量，再告诉模型每个词排在第几位。',
          { roadmap: { done: 0, now: 2 } },
          '按键盘的 → 或空格继续，按 ← 回到上一步。',
        ],
      },
      {
        section: '开场',
        title: '先把工具拿出来',
        say: [
          '动手之前先导入 PyTorch。`torch` 负责张量运算，张量可以理解成能放到显卡上计算的多维数组。',
          '`torch.nn` 是一个零件库，线性层、嵌入表、Dropout 这些现成的积木都在里面。它用得太频繁，大家习惯给它起个短名字 `nn`。',
        ],
        ops: [{ type: 'import torch\nimport torch.nn as nn' }],
      },

      /* -------------------------------------------------------------- 词嵌入 */
      {
        section: '词嵌入',
        title: '模型不认识字',
        say: [
          '一句话在进入模型之前，已经被切成了一个个词（准确的叫法是 token），每个词又换成了它在词表里的编号。比如「我 爱 猫」可能变成 `[5, 2, 9]`。',
          '可是编号只是门牌号。9 并不比 5 大，从编号里也看不出「猫」和「狗」比「猫」和「桌子」更接近。模型需要一种能表达含义的东西。',
          '办法是给每个词配一个向量，也就是一串数字，让含义相近的词拥有相近的向量。负责做这个转换的零件，我们给它起名 `InputEmbeddings`。',
          '括号里的 `nn.Module` 是 PyTorch 所有零件的基类。继承它之后，零件里需要训练的参数会被自动登记，训练时才找得到它们。',
        ],
        ops: [{ type: '\n\nclass InputEmbeddings(nn.Module):' }],
      },
      {
        section: '词嵌入',
        title: '造这个零件需要知道什么',
        say: [
          '`__init__` 是造零件的地方。动手前先问自己：要造一张「词到向量」的对照表，我得知道哪些数？',
          '两个就够。`vocab_size` 是词表里一共有多少个词，`d_model` 是每个词用多长的向量来表示。论文里 `d_model` 取 512。',
          '`super().__init__()` 是固定的开场，它让 `nn.Module` 先把自己内部的登记簿准备好。漏了这一行，后面往零件里放任何东西都会报错。',
        ],
        ops: [{ type: '\n\n    def __init__(self, d_model: int, vocab_size: int) -> None:\n        super().__init__()' }],
      },
      {
        section: '词嵌入',
        title: '一张可以学习的大表',
        say: [
          '先把两个数记在自己身上，`d_model` 待会儿还要用。',
          '真正干活的是 `nn.Embedding`。它就是一张表，有 `vocab_size` 行、`d_model` 列。给它编号 9，它就把第 9 行取出来还给你。',
          '这张表刚建好时填的是随机数。训练过程中这些数会被一点点调整，词的「含义」就是这样学出来的。',
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
        title: '数据流过时发生什么',
        say: [
          '`__init__` 负责造，`forward` 负责用。数据流过这个零件时要做什么，就写在这里。',
          '`x` 是一批句子的编号。`batch` 是一次送进来几句话，`seq_len` 是每句话有几个词。',
          '每个编号都换成一个长度为 `d_model` 的向量，所以输出比输入多出一维。注释记下的就是这个形状变化。写 Transformer 时一直盯着形状，是最不容易迷路的办法。',
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
        title: '论文里的一个小细节',
        say: [
          '到这里功能已经对了。不过论文 3.4 节还有一句话：嵌入层的输出要乘以 √d_model。所以回到刚才那一行，在后面补上。',
          '为什么要放大？一种常见的解释是，下一步要往词向量上加位置信息，那些数都在 -1 到 1 之间。先把词向量放大 √512 ≈ 22.6 倍，相加之后词本身的含义仍然占主导，不会被位置信息盖住。',
        ],
        ops: [{ type: ' * math.sqrt(self.d_model)', after: 'return self.embedding(x)' }],
      },
      {
        section: '词嵌入',
        title: '等一下，math 还没导入',
        say: [
          '刚才用了 `math.sqrt`，可文件开头并没有导入 `math`，现在运行会报 `NameError`。',
          '回到文件顶部补上。真实写代码就是这样，很少能一遍从上写到下，都是用到什么再回头补什么。',
        ],
        ops: [{ type: '\nimport math', after: 'import torch.nn as nn' }],
      },
      {
        section: '词嵌入',
        title: '写完一个零件，马上试一下',
        file: 'scratch.py',
        say: [
          '别等全部写完再运行。每做好一个零件就单独试一下，出了问题也知道该查哪里。我们新开一个草稿文件 `scratch.py`。',
          '`x` 就是前面那句「我 爱 猫」的编号。注意它有两层方括号：外层表示这一批里有 1 句话，内层是这句话的 3 个词。',
          '运行之前先预测：`x` 的形状是 `(1, 3)`，经过嵌入后每个编号变成一个 512 维的向量，应该是 `(1, 3, 512)`。看看终端的输出是不是这样。',
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

      /* ------------------------------------------------------------ 位置编码 */
      {
        section: '位置编码',
        title: '同样的词，不同的顺序',
        file: 'model.py',
        say: [
          '现在每个词都有了表示含义的向量。但还有一个问题：「猫追狗」和「狗追猫」用的是完全相同的三个词，意思却相反。',
          'Transformer 的核心部件叫注意力机制，它是同时看整句话里所有词的。它不像人读书那样从左读到右，所以天生分不清谁在前、谁在后。',
          '顺序信息得由我们亲手放进去。做法很直接：给每个位置也准备一个长度为 `d_model` 的向量，加到那个位置的词向量上。这样同一个「猫」出现在第 1 位和第 3 位时，向量就不一样了。',
          '回到 `model.py`，开始写第二个零件。',
        ],
        ops: [{ type: '\n\nclass PositionalEncoding(nn.Module):' }],
      },
      {
        section: '位置编码',
        title: '这个零件又需要知道什么',
        say: [
          '还是先问：造它需要哪些数？',
          '`d_model` 是位置向量的长度。它必须和词向量一样长，否则两者加不到一起。`seq_len` 是句子的最大长度，我们要为每一个可能出现的位置都准备一个向量。',
          '第三个参数 `dropout` 先放着，下一页再说。',
        ],
        ops: [
          { type: '\n\n    def __init__(self, d_model: int, seq_len: int, dropout: float) -> None:\n        super().__init__()' },
          { pause: 300 },
          { type: '\n        self.d_model = d_model\n        self.seq_len = seq_len' },
        ],
      },
      {
        section: '位置编码',
        title: 'Dropout：故意丢掉一些',
        say: [
          '`nn.Dropout` 在训练时会随机把一部分数字变成 0。比例由参数决定，传 0.1 就是丢掉一成。',
          '这听起来像在搞破坏，其实是为了不让模型过度依赖某几个数字。少了谁都得能干活，学到的东西才稳。这是防止模型死记硬背训练数据的常用手段。',
          '论文在词向量加上位置编码之后用了一次 Dropout，所以我们在这里先把它造好。',
        ],
        ops: [{ type: '\n        self.dropout = nn.Dropout(dropout)' }],
      },
      {
        section: '位置编码',
        title: '先准备一张空表',
        say: [
          '我们要的东西可以想象成一张表：每个位置占一行，每行有 `d_model` 个数。第 0 行是第 0 个位置的向量，第 1 行是第 1 个位置的，依此类推。',
          '先用 `torch.zeros` 造一张全是 0 的空表。名字 `pe` 是 positional encoding 的缩写。接下来的几步都是在往这张表里填数。',
          { shape: ['(seq_len, d_model)'], label: 'pe' },
        ],
        ops: [{ type: '\n        pe = torch.zeros(seq_len, d_model) # (seq_len, d_model)' }],
      },
      {
        section: '位置编码',
        title: '往表里填什么',
        say: [
          '填什么数才能代表「位置」？最朴素的想法是直接填 0、1、2、3。但句子一长，数就变得很大，会把词向量里的含义压过去。',
          '论文给的配方是正弦和余弦：',
          {
            formula: [
              'PE(pos, 2i) = sin( pos / 10000<sup>2i/d_model</sup> )',
              'PE(pos, 2i+1) = cos( pos / 10000<sup>2i/d_model</sup> )',
            ],
          },
          '`pos` 是行号，也就是第几个位置。`2i` 和 `2i+1` 是列号，偶数列用 sin，奇数列用 cos。',
          '可以把每一列想成一个波。靠前的列波动得快，靠后的列波动得慢，就像钟表的秒针、分针和时针。只看一根针分不清时间，三根合起来，每个时刻的读数都是唯一的。位置编码也一样，它给每个位置一组独一无二、又都落在 -1 到 1 之间的数。',
        ],
      },
      {
        section: '位置编码',
        title: '第一种原料：位置',
        say: [
          '把公式拆开看，原料只有两种：分子上的 `pos`，和分母上那个随列号变化的数。我们一种一种准备。',
          '`pos` 就是 0、1、2，一直到 `seq_len - 1`。`torch.arange` 可以直接生成这串数。',
          '后面的 `unsqueeze(1)` 把这串数从横着的一行变成竖着的一列。为什么要竖起来？先留个悬念，两页之后你会看到它的用处。',
          { shape: ['(seq_len,)', '(seq_len, 1)'], label: '形状' },
        ],
        ops: [{ type: '\n        position = torch.arange(0, seq_len, dtype=torch.float).unsqueeze(1) # (seq_len, 1)' }],
      },
      {
        section: '位置编码',
        title: '第二种原料：分母',
        say: [
          '接着是分母 10000<sup>2i/d_model</sup>。`torch.arange(0, d_model, 2)` 生成 0、2、4……正好就是公式里的 `2i`。',
          '这行代码没有直接算 10000 的幂，而是绕了一下：先取对数，再取指数。依据是 a<sup>b</sup> = e<sup>b·ln a</sup>，结果完全相同，只是这样算在数值上更稳定。',
          { formula: ['div_term = e<sup>2i · (−ln 10000 / d_model)</sup>', '         = 1 / 10000<sup>2i/d_model</sup>'] },
          '留意 `math.log` 前面的负号。有了它，`div_term` 算出来的其实是分母的倒数，所以下一步会用乘法代替除法。sin 和 cos 共用同一组分母，因此只需要 `d_model / 2` 个。',
        ],
        ops: [{ type: '\n        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)) # (d_model / 2)' }],
      },
      {
        section: '位置编码',
        title: '填偶数列',
        say: [
          '原料齐了。`position` 是竖着的一列，`div_term` 是横着的一行。',
          '一列乘一行，PyTorch 会自动把它们扩展成一张表，表里的每一格是「某个位置 × 某个频率」。这种自动扩展叫**广播**。前面把 `position` 竖起来，就是为了这一刻。',
          { shape: ['(seq_len, 1) × (d_model/2,)', '(seq_len, d_model/2)'], label: '广播' },
          '对整张表取 sin，再放进 `pe` 的偶数列。`0::2` 的意思是从第 0 列开始，每隔一列取一次。',
        ],
        ops: [{ type: '\n        pe[:, 0::2] = torch.sin(position * div_term)' }],
      },
      {
        section: '位置编码',
        title: '填奇数列',
        say: [
          '奇数列同理，只是换成 cos。`1::2` 表示从第 1 列开始，每隔一列取一次。',
          '到这里整张表就填满了。任取一行，都是那个位置专属的一组数。',
        ],
        ops: [{ type: '\n        pe[:, 1::2] = torch.cos(position * div_term)' }],
      },
      {
        section: '位置编码',
        title: '给这张表加一维',
        say: [
          '表的形状是 `(seq_len, d_model)`，可它要加到的词向量是 `(batch, seq_len, d_model)`，前面多一个 batch 维。',
          '用 `unsqueeze(0)` 在最前面补一个长度为 1 的维度。相加时，这个 1 会被广播到这一批的每一句话上。也就是说，不管一批里有多少句话，大家共用同一张位置表。',
          { shape: ['(seq_len, d_model)', '(1, seq_len, d_model)'], label: '形状' },
        ],
        ops: [{ type: '\n        pe = pe.unsqueeze(0) # (1, seq_len, d_model)' }],
      },
      {
        section: '位置编码',
        title: '它属于模型，但不用学',
        say: [
          '这张表是按公式算出来的，训练时不需要更新，所以它不算参数。',
          '但它又确实是模型的一部分。保存模型时要一起存下来，把模型搬到显卡上时它也得跟着搬。',
          '`register_buffer` 就是为这种情况准备的。登记之后可以用 `self.pe` 访问它，它会跟着模型走，而优化器不会去动它。',
        ],
        ops: [{ type: "\n        self.register_buffer('pe', pe)" }],
      },
      {
        section: '位置编码',
        title: '把位置加到词向量上',
        say: [
          '最后写 `forward`。这里的 `x` 是上一个零件输出的词向量。',
          '位置表是按最大长度 `seq_len` 准备的，但眼前这批句子可能没那么长。`x.shape[1]` 是这批句子的实际长度，`:x.shape[1]` 就是只取表里用得上的前几行。',
          '`requires_grad_(False)` 再明确一次：这部分不需要计算梯度。加完之后过一遍 Dropout 再返回。整个过程形状不变，变的是每个向量里多了位置信息。',
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
        title: '再试一下',
        file: 'scratch.py',
        say: [
          '回到草稿文件。先在导入那一行补上新零件的名字，再把刚才的词向量送进去。',
          '先预测：位置编码不改变形状，所以第三行输出应该还是 `(1, 3, 512)`。',
          '最后一行打印位置表第 0 行的前 4 个数。位置是 0，公式里的分子就是 0，而 sin(0) = 0、cos(0) = 1，所以应该看到 0 和 1 交替出现。',
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

      /* ---------------------------------------------------------------- 小结 */
      {
        section: '小结',
        title: '这一章做了什么',
        file: 'model.py',
        say: [
          '回头看一眼 `model.py`，现在里面有两个零件。',
          '`InputEmbeddings` 把每个词的编号换成一个表示含义的向量。`PositionalEncoding` 再往上加一个表示位置的向量。',
          '一句话走到这里，形状从 `(batch, seq_len)` 变成了 `(batch, seq_len, d_model)`。后面所有的零件，接收和输出的都是这个形状。',
          { roadmap: { done: 2, now: 0 } },
          '这是演示版的第一章，后面的章节还在制作中。',
        ],
      },
    ],
  };

  (root.LESSONS = root.LESSONS || []).push(lesson);
})(typeof window !== 'undefined' ? window : globalThis);
