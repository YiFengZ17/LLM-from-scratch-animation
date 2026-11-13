/*
 * 展厅：首页和课程页。内容全部从课程目录（js/catalog.js）和学习进度（js/store.js）生成。
 * 对外是 Site.home() 和 Site.course(课程)，由 js/main.js 按网址调用。
 *
 * 首屏右侧的代码样片不是手写的演示：它用编辑器的同一套引擎，重放课程里真实的几步。
 * 和编辑器一样，代码在左，思路在右：先出现一个念头，再写出对应的那一行。
 */
(function () {
  'use strict';

  const C = window.Catalog;
  const E = window.Engine;
  const H = window.Highlight;
  const S = window.Store;
  const V = window.Viz;
  const root = document.getElementById('site');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
  const pad2 = (n) => String(n).padStart(2, '0');
  const plain = (s) => String(s).replace(/<[^>]+>|\*\*/g, '').replace(/`/g, '');

  const LEVEL = { easy: '简单', medium: '中等', hard: '困难' };

  let cleanup = []; // 离开页面时要停掉的动画

  function stopAll() {
    cleanup.forEach((fn) => fn());
    cleanup = [];
  }

  /* ------------------------------------------------------------ 公共部分 */

  function nav(back) {
    return (
      '<nav class="nav wrap" aria-label="主导航">' +
      '<a class="logo" href="#home" aria-label="CPA 首页"><b>CPA</b><i></i><span>Code Programming Animation</span></a>' +
      '<div class="nav-links">' +
      (back ? '<a class="keep" href="#home">全部课程</a>' : '<a href="#boards">课程</a><a href="#algo">题单</a>') +
      '<a href="https://github.com/YiFengZ17/LLM-from-scratch-animation/blob/claude/funny-dijkstra-g78rhj/PLAN.md" target="_blank" rel="noopener">计划</a>' +
      '<a class="keep" href="https://github.com/YiFengZ17/LLM-from-scratch-animation" target="_blank" rel="noopener">GitHub ↗</a>' +
      '</div></nav>'
    );
  }

  function footer() {
    return (
      '<footer class="wrap foot"><span>CPA · Code Programming Animation</span>' +
      '<nav aria-label="来源">' +
      '<a href="https://github.com/hkproj/pytorch-transformer" target="_blank" rel="noopener">hkproj/pytorch-transformer</a>' +
      '<a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">Attention Is All You Need</a>' +
      '<a href="https://github.com/YiFengZ17/The-Summer-of-2026/blob/main/Leetcode_sheet.md" target="_blank" rel="noopener">LeetCode 题单</a>' +
      '<a href="https://github.com/YiFengZ17/LLM-from-scratch-animation" target="_blank" rel="noopener">本项目</a>' +
      '</nav></footer>'
    );
  }

  function langPicker(id) {
    return (
      '<div class="langs" role="group" aria-label="题解语言" id="' + id + '">' +
      C.LANG_IDS.map((l) => '<button type="button" data-lang="' + l + '" aria-pressed="' + (S.data.lang === l) + '">' + esc(C.LANGS[l].name) + '</button>').join('') +
      '</div>'
    );
  }

  function bindLangPicker(id) {
    const box = document.getElementById(id);
    if (!box) return;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (!b) return;
      S.data.lang = b.dataset.lang;
      S.save();
      box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
  }

  // 全站一共引用了多少处原文、核对过多少次运行
  function proofNumbers() {
    let refs = 0;
    let runs = 0;
    const countRefs = (blocks) => (blocks || []).forEach((b) => b && b.ref && refs++);
    for (const course of C.courses) {
      for (const ch of course.chapters) {
        for (const step of ch.steps) {
          countRefs(step.say);
          countRefs(step.doc);
          if (step.sayBy) Object.values(step.sayBy).forEach(countRefs);
        }
        const hasRun = (ops) => (ops || []).some((o) => o.run);
        const runLangs = course.langs ? course.langs.filter((l) => ch.steps.some((s) => hasRun(C.pick(s.ops, l)))) : ch.steps.some((s) => hasRun(s.ops)) ? [null] : [];
        runs += runLangs.length;
      }
    }
    return { refs, runs };
  }

  /* -------------------------------------------- 背景：位置编码点阵 */

  // 每个点就是位置表里的一个数：列是维度，行是位置。正值画暖色，负值画冷色，越接近 ±1 越大越亮。
  // 位置随时间增加，波纹就向上流动；鼠标左右移动会让它稍微快一点或慢一点。
  function startField(cv) {
    const ctx = cv.getContext('2d');
    const GAP = 18;
    let W = 0;
    let H2 = 0;
    let t = 7.3;
    let drift = 0;
    let visible = true;
    let raf = 0;
    let last = 0;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth;
      H2 = cv.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H2 * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H2);
      const cols = Math.ceil(W / GAP);
      const rows = Math.ceil(H2 / GAP);
      const D = 96; // 把画面宽度当作 d_model = 96 来算频率
      for (let c = 0; c < cols; c++) {
        const dim = (cols - 1 - c) % D; // 最右边频率最高、条纹最密
        const w = Math.exp(-(dim - (dim % 2)) * (Math.log(10000) / D));
        for (let r = 0; r < rows; r++) {
          const pos = (r * 0.42 + t) * 3;
          const v = dim % 2 ? Math.cos(pos * w) : Math.sin(pos * w);
          const a = Math.abs(v);
          if (a < 0.12) continue;
          ctx.globalAlpha = 0.08 + a * 0.42;
          ctx.fillStyle = v > 0 ? '#ffb36b' : '#6aa8ff';
          ctx.beginPath();
          ctx.arc(c * GAP + GAP / 2, r * GAP + GAP / 2, 0.5 + a * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (visible) {
        t += Math.min(64, now - last || 16) * 0.00012 * (1 + drift);
        if (now - last > 33) {
          draw();
          last = now;
        }
      }
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      resize();
      draw();
    };
    const onMove = (e) => (drift = (e.clientX / window.innerWidth - 0.5) * 1.6);
    const io = new IntersectionObserver((entries) => (visible = entries[0].isIntersecting));
    io.observe(cv);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove);
    resize();
    draw();
    if (!reduced) raf = requestAnimationFrame(loop);

    cleanup.push(() => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
    });
  }

  /* ------------------------------------------------------------ 代码样片 */

  // 样片依次重放这些真实的步骤（课程、语言、第几章、哪几页，都从 0 数）。课程还没做好的段落自动跳过。
  const SPECIMEN = [
    { course: 'sliding-window', lang: 'rust', chapter: 4, steps: 'code' },
    { course: 'transformer', chapter: 1, steps: [6, 7] },
    { course: 'sliding-window', lang: 'cpp', chapter: 5, steps: 'code' },
    { course: 'sliding-window', lang: 'java', chapter: 1, steps: 'code' },
  ];

  // 把高亮类别换成展厅的颜色类
  const SHORT = { kw: 'k', kw2: 'k', self: 'k', fn: 'f', cls: 't', str: 's', num: 'n', com: 'c' };

  function prepareSpecimen() {
    const out = [];
    for (const seg of SPECIMEN) {
      const course = C.byId[seg.course];
      if (!course || course.chapters.length <= seg.chapter) continue;
      const lang = course.langs ? seg.lang : null;
      let previous = null;
      let compiled = null;
      let lesson = null;
      for (let c = 0; c <= seg.chapter; c++) {
        if (!course.chain && c < seg.chapter) continue;
        lesson = C.resolve(course.chapters[c], lang);
        compiled = E.compile(lesson, course.chain ? previous : null);
        previous = compiled.after[compiled.after.length - 1];
      }
      // 'code'：这一章里所有写代码、但不是运行验证的页
      const steps =
        seg.steps === 'code'
          ? lesson.steps.map((s, i) => (s.ops && s.ops.length && !s.ops.some((o) => o.run || o.clear) ? i : -1)).filter((i) => i >= 0)
          : seg.steps;
      if (!steps.length) continue;
      const label = course.title + (lesson.label ? ' · ' + lesson.label + ' ' + lesson.title : ' · ' + lesson.title) + (lang ? ' · ' + C.LANGS[lang].name : '');
      out.push({ lesson, compiled, steps, label });
    }
    return out;
  }

  function startSpecimen(fig) {
    const segs = prepareSpecimen();
    if (!segs.length) return;
    const code = fig.querySelector('.spec-code');
    const sayBox = fig.querySelector('.spec-say');
    const file = fig.querySelector('.spec-file');
    const label = fig.querySelector('.spec-course');
    const bar = fig.querySelector('.spec-progress');
    let timer = 0;
    let si = 0;
    let sayKey = '';

    // 代码：只画光标附近的一段，像编辑器自动滚动那样；正在写的那一行左边标一条
    function renderCode(state, thoughtLine) {
      const name = state.active;
      const text = state.files[name] || '';
      const lines = H.tokenize(text, C.langOfFile(name));
      const raw = text.split('\n');
      const cursor = state.cursor[name];
      const curLine = text.slice(0, cursor).split('\n').length - 1;
      const curCol = cursor - (text.lastIndexOf('\n', cursor - 1) + 1);
      const from = Math.max(0, Math.min(curLine - 10, raw.length - 20));
      const to = Math.min(raw.length, from + 20);
      const rows = [];
      for (let i = from; i < to; i++) {
        let col = 0;
        let html = '';
        for (const tok of lines[i] || []) {
          const end = col + tok.t.length;
          const cls = SHORT[tok.c];
          const wrap = (t) => (cls ? '<span class="' + cls + '">' + esc(t) + '</span>' : esc(t));
          if (i === curLine && curCol > col && curCol < end) {
            html += wrap(tok.t.slice(0, curCol - col)) + '<span class="caret"></span>' + wrap(tok.t.slice(curCol - col));
          } else {
            if (i === curLine && curCol === col) html += '<span class="caret"></span>';
            html += wrap(tok.t);
          }
          col = end;
        }
        if (i === curLine && curCol === col) html += '<span class="caret"></span>';
        const cls = 'spec-line' + (i === curLine ? ' is-cur' : '') + (i === thoughtLine ? ' is-thought' : '');
        rows.push('<div class="' + cls + '"><span class="ln">' + (i + 1) + '</span><span>' + html + '</span></div>');
      }
      code.innerHTML = rows.join('');
    }

    // 思路：这一步的标题和开头一句，下面是逐行出现的念头
    function renderSay(step, state) {
      const notes = (state.notes || []).filter((n) => n.kind === 'note');
      const key = step.title + ':' + notes.length;
      if (key === sayKey) return;
      sayKey = key;
      const intro = (step.say || []).find((b) => typeof b === 'string');
      sayBox.innerHTML =
        '<div class="spec-say-title">' + esc(step.title) + '</div>' +
        (intro ? '<p class="spec-say-intro">' + esc(plain(intro)) + '</p>' : '') +
        '<ol>' + notes.map((n, k) => '<li' + (k === notes.length - 1 ? ' class="is-now"' : '') + '>' + esc(plain(n.text)) + '</li>').join('') + '</ol>';
      const now = sayBox.querySelector('.is-now');
      if (now) sayBox.scrollTop = Math.max(0, now.offsetTop - sayBox.clientHeight * 0.4);
    }

    function render(step, state, progress) {
      const notes = (state.notes || []).filter((n) => n.kind === 'note');
      const last = notes[notes.length - 1];
      const thoughtLine = last && last.file === state.active ? state.files[last.file].slice(0, last.pos).split('\n').length - 1 : -1;
      renderCode(state, thoughtLine);
      renderSay(step, state);
      bar.style.width = progress * 100 + '%';
    }

    function playSegment() {
      const seg = segs[si];
      label.textContent = seg.label;
      let k = 0;
      const total = seg.steps.length;

      function playStep() {
        const i = seg.steps[k];
        const step = seg.lesson.steps[i];
        const state = E.clone(i === 0 ? seg.compiled.initial : seg.compiled.after[i - 1]);
        const gen = E.runStep(state, step, E.rng(i + 1));
        gen.next(); // 光标先移到要写的位置
        file.textContent = state.active;
        render(step, state, k / total);
        const tick = () => {
          const r = gen.next();
          if (r.done) {
            k++;
            if (k < total) timer = setTimeout(playStep, 1400);
            else
              timer = setTimeout(() => {
                si = (si + 1) % segs.length;
                playSegment();
              }, 2800);
            return;
          }
          render(step, state, (k + 0.5) / total);
          timer = setTimeout(tick, Math.min(1600, r.value * 0.42));
        };
        timer = setTimeout(tick, reduced ? 0 : 1800);
      }

      if (reduced) {
        // 不播放动画：直接显示这一段写完后的样子
        const i = seg.steps[seg.steps.length - 1];
        const state = E.clone(seg.compiled.after[i]);
        file.textContent = state.active;
        render(seg.lesson.steps[i], state, 1);
        return;
      }
      playStep();
    }

    playSegment();
    cleanup.push(() => clearTimeout(timer));
  }

  /* ---------------------------------------------------------------- 首页 */

  function lastVisit() {
    const last = S.data.last;
    if (!last || !C.byId[last.course]) return null;
    const course = C.byId[last.course];
    const ch = course.chapters[last.chapter];
    if (!ch) return null;
    return { href: '#' + course.id + '-' + (last.chapter + 1), text: (ch.label ? ch.label + ' ' : '第 ' + (last.chapter + 1) + ' 章 ') + ch.title, course };
  }

  function transformerCard(course) {
    const seen = (i) => S.seenInChapter(course.id, course.chapters[i]) / course.chapters[i].steps.length;
    const layer = (i, name) =>
      '<a class="layer" href="#' + course.id + '-' + (i + 1) + '" style="--p:' + seen(i).toFixed(3) + '"><span class="mono">' + pad2(i + 1) + '</span>' + esc(name) +
      '<small>' + course.chapters[i].steps.length + ' 页</small></a>';
    const n = course.chapters.length;
    const titles = course.chapters.map((c) => c.title);
    const stack =
      n >= 6
        ? layer(0, titles[0]) + layer(1, titles[1]) + layer(2, titles[2]) +
          '<div class="layer-pair">' + layer(3, '编码器') + layer(4, '解码器') + '</div>' + layer(5, titles[5])
        : titles.map((t, i) => layer(i, t)).join('');
    return (
      '<article class="feature"><div>' +
      '<div class="eyebrow">' + esc(course.eyebrow || '') + '</div>' +
      '<h4>' + esc(course.title) + '</h4><p>' + esc(course.blurb) + '</p>' +
      '<div class="stats">' + (course.stats || []).map(([v, k]) => '<div class="stat"><b>' + esc(v) + '</b><span>' + esc(k) + '</span></div>').join('') + '</div>' +
      '<a class="s-btn s-btn-primary" href="#' + course.id + '">进入课程 →</a></div>' +
      '<div class="stack" aria-label="各章从下往上叠成模型"><div class="layer-label">↑ 数据从下往上流</div>' + stack + '</div>' +
      '</article>'
    );
  }

  function topicTiles() {
    return C.TOPICS.map((t, i) => {
      const course = t.course && C.byId[t.course] && C.byId[t.course].chapters.length ? C.byId[t.course] : null;
      const chip = course ? '<span class="chip is-live">已上线</span>' : t.next ? '<span class="chip is-next">下一个</span>' : '<span>规划中</span>';
      const cls = course ? 'tile is-live' : t.next ? 'tile is-next' : 'tile';
      const seg = (n, c) => (n ? '<span class="' + c + '" style="flex:' + n + '"></span>' : '');
      const inner =
        '<div class="tile-top"><span>' + pad2(i + 1) + '</span>' + chip + '</div>' +
        '<div class="tile-name">' + esc(t.name) + '</div>' +
        '<div class="tile-foot"><div class="tile-bar" aria-hidden="true">' + seg(t.easy, 'e') + seg(t.medium, 'm') + seg(t.hard, 'h') + '</div>' +
        '<div class="tile-count">' + (t.easy + t.medium + t.hard) + ' 题' + (t.hard ? ' · ' + t.hard + ' 困难' : '') + '</div></div>';
      return course ? '<a class="' + cls + '" href="#' + course.id + '">' + inner + '</a>' : '<div class="' + cls + '">' + inner + '</div>';
    }).join('');
  }

  function plannedCards() {
    const teaser = {
      'python-intro':
        '<span class="k">def</span> <span class="f">kidsWithCandies</span>(candies, extra):\n    best = <span class="f">max</span>(candies)\n    <span class="k">return</span> [c + extra >= best <span class="k">for</span> c <span class="k">in</span> candies]',
      'c-intro':
        '<span class="t">struct</span> <span class="t">ListNode</span> *<span class="f">reverseList</span>(<span class="t">struct</span> <span class="t">ListNode</span> *head) {\n    <span class="t">struct</span> <span class="t">ListNode</span> *prev = <span class="k">NULL</span>;\n    <span class="k">while</span> (head) { ... }',
    };
    return C.PLANNED.filter((p) => p.board === 'lang')
      .map(
        (p) =>
          '<article class="course-card"><div class="course-top"><h4>' + esc(p.title) + '</h4><span class="chip is-next">' + p.chapters.length + ' 章 · 规划中</span></div>' +
          '<p>' + esc(p.blurb) + '</p><pre>' + (teaser[p.id] || '') + '</pre>' +
          '<ol>' + p.chapters.map((c) => '<li>' + esc(c) + '</li>').join('') + '</ol></article>'
      )
      .join('');
  }

  function home() {
    stopAll();
    document.title = 'CPA · Code Programming Animation';
    const transformer = C.byId.transformer;
    const algo = C.courses.filter((c) => c.board === 'algo');
    const last = lastVisit();
    const proof = proofNumbers();
    const totals = C.TOPICS.reduce((a, t) => [a[0] + t.easy, a[1] + t.medium, a[2] + t.hard], [0, 0, 0]);

    root.innerHTML =
      '<header class="hero"><canvas id="field" aria-hidden="true"></canvas>' +
      nav(false) +
      '<div class="wrap"><div class="hero-grid" id="top"><div>' +
      '<div class="eyebrow">Code Programming Animation</div>' +
      '<h1><span>看代码，</span><b>一个字一个字</b><b class="end">长出来</b></h1>' +
      '<p class="lede">先读几页思路，再看代码在编辑器里逐字写出，每一页由你翻。旁白按人思考的顺序走：先想到要做什么，再落下这一行代码。从零手写 Transformer，LeetCode 题单逐类精讲，算法题可选五种语言。</p>' +
      '<div class="cta">' +
      (last
        ? '<a class="s-btn s-btn-primary" href="' + last.href + '">继续：' + esc(last.text) + ' →</a><a class="s-btn s-btn-ghost" href="#' + transformer.id + '">从 Transformer 开始</a>'
        : '<a class="s-btn s-btn-primary" href="#' + transformer.id + '">从 Transformer 开始 →</a>' +
          (algo.length ? '<a class="s-btn s-btn-ghost" href="#' + algo[0].id + '">先做算法题 <small>' + esc(algo[0].title) + '</small></a>' : '')) +
      '</div>' +
      '<div class="hero-meta"><span>' + C.courses.length + ' 门课 · ' + C.courses.reduce((n, c) => n + C.pageCount(c), 0) + ' 页</span><span>Python · C · C++ · Java · Rust</span><span>输出全部真实运行</span></div>' +
      '</div>' +
      '<figure class="specimen" aria-label="代码样片：重放课程里真实的几步">' +
      '<figcaption class="spec-bar"><span class="spec-file"></span><span class="spec-course"></span></figcaption>' +
      '<div class="spec-body"><div class="spec-code"></div><div class="spec-say" aria-label="思路"></div></div><div class="spec-progress"></div></figure>' +
      '</div></div></header>' +
      '<main>' +
      '<section class="section wrap" aria-labelledby="how-title"><div class="section-head"><div><div class="eyebrow">怎么学</div><h2 id="how-title">每一页，三件事</h2></div>' +
      '<p>概念和代码分开讲。写代码时，旁白先说出下一个念头，代码再跟着落下来：为什么需要这个循环、这一行在维护什么、用到了什么语法。</p></div>' +
      '<div class="steps">' +
      '<div class="step"><div class="step-no">01</div><h3>读思路</h3><p>前置知识页先把要用的概念讲完，配公式、表格和动图演示。</p>' +
      '<div class="mini"><div class="kick">前置知识 03 / 05</div><div class="s-formula">softmax( Q·Kᵀ / √d_k ) · V</div><div class="bar"></div><div class="bar"></div></div></div>' +
      '<div class="step"><div class="step-no">02</div><h3>看代码长出来</h3><p>旁白先说出下一个念头，代码再跟着一个字一个字写出来。</p>' +
      '<div class="mini"><span class="note">窗口要一格一格往右挪……</span>\n<span class="k">for</span> right <span class="k">in</span> <span class="f">range</span>(k, <span class="f">len</span>(nums)):\n<span class="note">右边进来一个，左边出去一个……</span>\n    <span class="typing">window += nums[right]</span><span class="caret"></span></div></div>' +
      '<div class="step"><div class="step-no">03</div><h3>跑一遍</h3><p>每章最后真实运行一次。页面上的输出，和真实运行的结果逐行一致。</p>' +
      '<div class="mini"><span class="ok">$</span> python3 solution.py\n<span style="color: var(--text)">12.75</span>\n<span style="color: var(--text)">5.0</span>\n<span class="ok">✓ 与真实运行一致</span></div></div>' +
      '</div></section>' +
      '<section class="section wrap" id="boards" aria-labelledby="boards-title"><div class="section-head"><div><div class="eyebrow">板块</div><h2 id="boards-title">选一条路开始</h2></div>' +
      '<p>三个板块各自独立，可以从任何一个开始。学到哪里，回来时这里会点亮。</p></div>' +
      '<div class="board"><div class="board-head"><h3>深度学习</h3><span class="mono">1 门课</span><span class="spacer"></span><span class="mono">已完成</span></div>' +
      transformerCard(transformer) + '</div>' +
      '<div class="board" id="algo"><div class="board-head"><h3>算法题</h3><span class="mono">The-Summer-of-2026 题单</span><span class="spacer"></span>' + langPicker('home-langs') + '</div>' +
      '<div class="totals"><div class="mono" style="font-size: 13px; color: var(--text-2)">195 题 · 16 类</div>' +
      '<div class="totals-bar" aria-hidden="true"><span class="e" style="flex: ' + totals[0] + '"></span><span class="m" style="flex: ' + totals[1] + '"></span><span class="h" style="flex: ' + totals[2] + '"></span></div>' +
      '<div class="legend"><span><i class="e"></i>简单 ' + totals[0] + '</span><span><i class="m"></i>中等 ' + totals[1] + '</span><span><i class="h"></i>困难 ' + totals[2] + '</span></div></div>' +
      '<div class="map">' + topicTiles() + '</div></div>' +
      '<div class="board"><div class="board-head"><h3>语言入门</h3><span class="mono">2 门课</span><span class="spacer"></span><span class="mono">规划中</span></div>' +
      '<div class="pair">' + plannedCards() + '</div></div>' +
      '</section>' +
      '<section class="section wrap" aria-labelledby="proof-title"><div class="section-head"><div><div class="eyebrow">核对</div><h2 id="proof-title">每一行都核对过</h2></div>' +
      '<p>教程里最怕的是讲错。这里引用的每一句文档、显示的每一行输出，都对照过出处。</p></div>' +
      '<div class="proof">' +
      '<div><b>' + proof.refs + '<small>处</small></b><p>引文逐字对照官方文档的源文件、语言标准和论文原文，附中文和链接。</p></div>' +
      '<div><b>' + proof.runs + '<small>次</small></b><p>终端里的每一次运行，都在真实的 Python、gcc、g++、Java、Rust 和 PyTorch 上跑过，逐行一致。</p></div>' +
      '<div><b>241<small>行</small></b><p>Transformer 的代码出自开源实现 hkproj/pytorch-transformer，改动处逐条注明。</p></div>' +
      '</div></section>' +
      '</main>' + footer();

    bindLangPicker('home-langs');
    startField(document.getElementById('field'));
    startSpecimen(root.querySelector('.specimen'));
  }

  /* -------------------------------------------------------------- 课程页 */

  function course(id) {
    stopAll();
    const c = C.byId[id];
    document.title = c.title + ' · CPA';
    const board = C.BOARDS.find((b) => b.id === c.board);
    const p = S.course(c.id);
    const total = C.pageCount(c);
    const seen = S.seenPages(c);
    const started = seen > 0;
    const resume = Math.min(Math.max(0, p.chapter | 0), c.chapters.length - 1);
    const label = (ch, i) => (ch.label ? ch.label : pad2(i + 1));

    const rows = c.chapters
      .map((ch, i) => {
        const s = S.seenInChapter(c.id, ch);
        const done = s >= ch.steps.length;
        const level = ch.problem ? '<span class="level is-' + ch.problem.level + '">' + LEVEL[ch.problem.level] + '</span>' : '';
        return (
          '<li><a class="chapter-row' + (done ? ' is-done' : '') + (started && i === resume ? ' is-last' : '') + '" href="#' + c.id + '-' + (i + 1) + '">' +
          '<span class="num">' + esc(label(ch, i)) + '</span>' +
          '<div><h3>' + esc(ch.title) + level + '</h3><p>' + esc(ch.summary || '') + '</p></div>' +
          '<div class="chapter-meta"><span>' + ch.steps.length + ' 页' + (s ? ' · 看过 ' + s : '') + '</span>' +
          '<div class="c-progress-bar"><i style="width:' + ((s / ch.steps.length) * 100).toFixed(1) + '%"></i></div></div>' +
          '<span class="go" aria-hidden="true">→</span></a></li>'
        );
      })
      .join('');

    const resumeCh = c.chapters[resume];
    const primary = started
      ? '<a class="s-btn s-btn-primary" href="#' + c.id + '-' + (resume + 1) + '">继续：' + esc(label(resumeCh, resume) + ' ' + resumeCh.title) + ' →</a>' +
        '<a class="s-btn s-btn-ghost" href="#' + c.id + '-1">从头开始</a>'
      : '<a class="s-btn s-btn-primary" href="#' + c.id + '-1">开始第一章 →</a>';

    root.innerHTML =
      '<header class="c-hero">' + nav(true) +
      '<div class="wrap"><a class="crumb-back" href="#home">← ' + esc(board ? board.name : '全部课程') + '</a>' +
      '<div class="c-grid"><div>' +
      '<div class="eyebrow">' + esc(c.eyebrow || (board ? board.name : '')) + '</div>' +
      '<h1>' + esc(c.title) + '</h1><p class="lede">' + esc(c.blurb) + '</p>' +
      '<div class="cta">' + primary + '</div></div>' +
      '<div class="c-side">' +
      '<div class="stats">' + (c.stats || [[String(c.chapters.length), '章'], [String(total), '页']]).map(([v, k]) => '<div class="stat"><b>' + esc(v) + '</b><span>' + esc(k) + '</span></div>').join('') + '</div>' +
      '<div class="c-progress"><div class="c-progress-top"><span>学习进度</span><span>' + seen + ' / ' + total + ' 页</span></div>' +
      '<div class="c-progress-bar"><i style="width:' + ((seen / total) * 100).toFixed(1) + '%"></i></div></div>' +
      (c.langs ? '<div class="c-lang"><span>题解语言</span>' + langPicker('course-langs') + '</div>' : '') +
      (c.source ? '<div class="c-lang"><span>代码来源</span><a href="' + esc(c.source.url) + '" target="_blank" rel="noopener" class="mono">' + esc(c.source.name) + ' ↗</a></div>' : '') +
      '</div></div></div></header>' +
      '<main class="section wrap" style="padding-top: 64px">' +
      '<div class="section-head"><div><div class="eyebrow">目录</div><h2>' + c.chapters.length + (c.board === 'algo' ? ' 章' : ' 章') + '</h2></div>' +
      '<p>' + esc(c.board === 'algo' ? '先读第一章的概念和模板，再按顺序做题，从简单到困难。每道题都可以在编辑器里随时换语言。' : '后一章接着前一章写完的代码继续写，建议按顺序读。') + '</p></div>' +
      '<ol class="timeline">' + rows + '</ol></main>' + footer();

    bindLangPicker('course-langs');
    window.scrollTo(0, 0);
  }

  window.Site = {
    home,
    course,
    hide: stopAll,
  };
})();
