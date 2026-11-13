/*
 * 课程脚本的公共部分：引用官方文档和论文的写法。
 * 这个文件要在各门课的脚本之前加载。
 *
 * 引用的原文必须和出处一致。PyTorch 的引文对照的是 PyTorch 源码里的文档字符串
 * （官方文档由它生成），Python 的引文对照的是 CPython 仓库里的文档源文件，
 * 论文的引文对照的是 Annotated Transformer 里逐段摘录的论文原文。
 * C、C++、Java、Rust 分别对照 glibc 手册源文件、C++ 标准草案源文件、OpenJDK 和 Rust 标准库源码里的文档注释。
 */
(function (root) {
  'use strict';

  const PYTORCH = 'https://pytorch.org/docs/stable/';
  const PYTHON = 'https://docs.python.org/3/';
  const PAPER = 'https://arxiv.org/abs/1706.03762';

  root.LessonKit = {
    // 引用 PyTorch 官方文档
    ref: (api, page, quote, zh) => ({ ref: { api, url: PYTORCH + page, source: 'PyTorch 文档', quote, zh } }),

    // 引用 Python 官方文档
    py: (api, page, quote, zh) => ({ ref: { api, url: PYTHON + page, source: 'Python 文档', quote, zh } }),

    // 引用论文《Attention Is All You Need》
    paper: (where, quote, zh) => ({ ref: { api: '论文 ' + where, url: PAPER, source: '论文原文', quote, zh } }),

    // 引用 GNU C 库手册（对照 glibc 仓库里的 manual/*.texi）
    cdoc: (api, page, quote, zh) => ({ ref: { api, url: 'https://www.gnu.org/software/libc/manual/html_node/' + page, source: 'GNU C 库手册', quote, zh } }),

    // 引用 C++ 标准草案（对照 cplusplus/draft 仓库里的源文件）
    cppdoc: (api, page, quote, zh) => ({ ref: { api, url: 'https://eel.is/c++draft/' + page, source: 'C++ 标准草案', quote, zh } }),

    // 引用 Java 官方文档（对照 OpenJDK 源码里的 Javadoc）
    javadoc: (api, page, quote, zh) => ({ ref: { api, url: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/' + page, source: 'Java 文档', quote, zh } }),

    // 引用 Rust 标准库文档（对照 rust-lang/rust 源码里的文档注释）
    rustdoc: (api, page, quote, zh) => ({ ref: { api, url: 'https://doc.rust-lang.org/std/' + page, source: 'Rust 文档', quote, zh } }),
  };
})(typeof window !== 'undefined' ? window : globalThis);
