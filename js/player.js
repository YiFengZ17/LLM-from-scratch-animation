/*
 * 编辑器（工作间）：把播放引擎算出来的状态画到页面上，处理翻页。
 * 对外只有 Player.open(课程, 第几章) 和 Player.close()，由 js/main.js 按网址调用。
 *
 * 步骤有两种：
 *   前置知识页（step.doc）  不写代码，编辑区显示一页文档预览。
 *   写代码页（step.ops）    旁白先出现，按一下代码开始逐字符打出来。
 *
 * 写代码页有三个阶段：reading 读旁白 → typing 看代码 → done 写完。
 * 「继续」键在三个阶段分别是：开始写代码 / 直接看结果 / 下一步。
 *
 * 旁白在右侧栏，按人的思考顺序展开：每一步开头先说要解决什么；
 * 之后每写一行代码之前，先出现引出这一行的那个念头（课程脚本里操作的 note），停一下，再把代码写出来。
 * 当前这条念头高亮，编辑器里对应的那一行也标出来。这一步用到的文档引用放在最后，不打断思路。
 * 念头只显示在旁白里，不写进文件，所以文件内容和真实运行的代码完全一样。
 *
 * 算法课程每道题有五种语言，状态栏可以切换（L 键），换语言时按那种语言重新编译这门课。
 */
(function () {
  'use strict';

  const E = window.Engine;
  const H = window.Highlight;
  const TH = window.Themes;
  const C = window.Catalog;
  const V = window.Viz;
  const S = window.Store;
  const $ = (id) => document.getElementById(id);

  const el = {
    app: $('app'),
    courseName: $('course-name'),
    chapter: $('chapter-name'),
    btnCourse: $('btn-course'),
    progress: $('progress'),
    outline: $('outline'),
    sideLabel: $('side-label'),
    sidebar: $('sidebar'),
    scrim: $('scrim'),
    btnOutline: $('btn-outline'),
    btnExplorer: $('btn-explorer'),
    btnNotes: $('btn-notes'),
    btnMode: $('btn-mode'),
    tabs: $('tabs'),
    crumbs: $('crumbs'),
    codeWrap: $('code-wrap'),
    code: $('code'),
    minimap: $('minimap'),
    miniCanvas: $('minimap-canvas'),
    miniView: $('minimap-view'),
    doc: $('doc'),
    terminal: $('terminal'),
    termBody: $('term-body'),
    narrScroll: $('narr-scroll'),
    narrSection: $('narr-section'),
    narrCount: $('narr-count'),
    narrTitle: $('narr-title'),
    narrBody: $('narr-body'),
    thoughts: $('thoughts'),
    refs: $('refs'),
    phases: $('phases'),
    back: $('btn-back'),
    pause: $('btn-pause'),
    go: $('btn-go'),
    goLabel: $('btn-go-label'),
    fill: $('btn-fill'),
    statusFile: $('status-file'),
    statusPos: $('status-pos'),
    statusLang: $('status-lang'),
    lang: $('btn-lang'),
    speed: $('btn-speed'),
    auto: $('btn-auto'),
    themeName: $('btn-theme-name'),
    quick: $('quick'),
    quickTitle: $('quick-title'),
    quickList: $('quick-list'),
    quickMode: $('quick-mode'),
    quickFoot: $('quick-foot'),
  };

  const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
  const DOC = '@doc'; // 文档预览标签页的内部名字

  // 自动播放时每一页停多久（毫秒），想调节奏改这里。
  // 旁白又短又简单的页停 simple；其余的页停 normal，引用多或文字长再加一点，最多 max。
  // 页里有图形演示时，等演示播完再加 afterViz。
  const PACE = {
    simple: 2000,
    normal: 5000,
    extra: 1000, // 每多一条引用、或文字偏长，各加这么多
    max: 7000,
    doc: 10000, // 前置知识页内容多，单独给一个时间
    afterTyping: 2000, // 代码打完后，停一下再翻页
    afterViz: 1500,
  };
  const SIMPLE_MAX_CHARS = 60; // 旁白不超过这么多字、且没有引用和公式，算「短而简单」
  const LONG_CHARS = 120;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia ? window.matchMedia('(max-width: 1120px)') : { matches: false };

  const prefs = S.data;
  if (!SPEEDS.includes(prefs.speed)) prefs.speed = 1;
  if (!C.LANGS[prefs.lang]) prefs.lang = 'python';
  let auto = false; // 自动播放每次打开都从「关」开始，免得页面自己动起来

  /* ----------------------------------------------------------- 当前状态 */

  let course = null; // 当前课程
  let lang = null; // 当前语言（只有算法课程有）
  let chapters = []; // 按当前语言取好的各章
  let compiledAll = []; // 各章编译结果
  const cache = new Map(); // 「课程:语言」→ { chapters, compiledAll }，换语言来回切时不用重算

  let ci = 0;
  let lesson = null;
  let steps = [];
  let docSteps = [];
  let compiled = null;

  let index = 0;
  let state = null;
  let gen = null;
  let phase = 'done';
  let timer = null; // 打字的定时器
  let waitTimer = null; // 自动播放的等待定时器
  let pending = null; // 正在进行的等待：{ then, total, left, started }
  let paused = false;
  let peek = null; // 读者点了别的标签页，临时查看
  let lineCache = [];
  let docShown = null;
  let mini = null; // 小地图上一次画的内容
  let thoughtKey = ''; // 旁白里的思路已经画到哪一条（避免每打一个字都重画）
  let isOpen = false;

  /* ------------------------------------------------------------ 小工具 */

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
  const pad2 = (n) => String(n).padStart(2, '0');

  // 简易标记：`代码`、**加粗**，其余 HTML 原样保留
  function md(s) {
    return String(s)
      .split('`')
      .map((part, i) => (i % 2 ? '<code>' + esc(part) + '</code>' : part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')))
      .join('');
  }

  const progressOf = () => S.course(course.id);

  // 某一章最远看到了第几页（没看过是 -1）
  function seenOf(c) {
    const saved = progressOf().seen[chapters[c].id];
    const n = typeof saved === 'number' ? saved : -1;
    return c === ci ? Math.max(n, index) : n;
  }

  function savePrefs() {
    if (course && lesson) {
      const p = progressOf();
      p.chapter = ci;
      p.steps[lesson.id] = index;
      p.seen[lesson.id] = Math.max(seenOf(ci), index);
      prefs.last = { course: course.id, chapter: ci };
    }
    S.save();
  }

  // 一章在章节列表里的叫法：Transformer 是「第 3 章」，算法题是题号
  const chapterLabel = (c) => chapters[c].label || '第 ' + (c + 1) + ' 章';

  // 自动播放时这一页的旁白该停多久：看长度，也看难度（有没有引用、公式这类要慢读的东西）。
  // 个别页想单独指定，可以在脚本里给这一步写 read: 秒数。
  function readingMs(step) {
    if (step.read) return step.read * 1000;
    const viz = V.durationOf(step.doc || step.say);
    if (step.doc) return Math.max(PACE.doc, viz + PACE.afterViz);
    const say = step.say || [];
    const refs = say.filter((b) => b.ref).length;
    const hard = refs > 0 || say.some((b) => b.formula || b.table || b.code || b.viz);
    const chars = say.reduce((n, b) => (typeof b === 'string' ? n + b.replace(/<[^>]+>|[`*]/g, '').length : n), 0);
    let ms = PACE.simple;
    if (hard || chars > SIMPLE_MAX_CHARS) {
      const extra = Math.max(0, refs - 1) + (chars > LONG_CHARS ? 1 : 0);
      ms = Math.min(PACE.max, PACE.normal + extra * PACE.extra);
    }
    return viz ? Math.max(ms, viz + PACE.afterViz) : ms;
  }

  const FILE_ICON =
    '<svg class="file-icon%CLS%" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2H4v12h8V4.5L9.5 2z"/><path d="M9.5 2v2.5H12"/></svg>';
  const fileIcon = (name) => FILE_ICON.replace('%CLS%', ' is-' + (name === DOC ? 'md' : C.langOfFile(name)));
  const LANG_LABEL = { python: 'Python', c: 'C', cpp: 'C++', java: 'Java', rust: 'Rust', md: 'Markdown' };

  /* ------------------------------------------------- 文字块（旁白与文档共用） */

  function codeHTML(src, language) {
    return H.tokenize(src, language)
      .map((line) => line.map((t) => (t.c && t.c !== 'pun' ? '<span class="t-' + t.c + '">' + esc(t.t) + '</span>' : esc(t.t))).join(''))
      .join('\n');
  }

  function refHTML(r) {
    return (
      '<figure class="ref"><figcaption class="ref-head"><code>' + esc(r.api) + '</code>' +
      '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.source) + ' ↗</a></figcaption>' +
      '<blockquote lang="en">' + esc(r.quote) + '</blockquote>' +
      '<p class="ref-zh">' + md(r.zh) + '</p></figure>'
    );
  }

  // size：'large' 用在文档页，'small' 用在旁白里
  function blockHTML(item, size) {
    if (typeof item === 'string') return '<p>' + md(item) + '</p>';
    if (item.ref) return refHTML(item.ref);
    if (item.viz) return V.html(item.viz, size || 'large');

    if (item.shape) {
      const chips = item.shape.map((s) => '<code>' + esc(s) + '</code>').join('<span class="shape-arrow" aria-label="变成">→</span>');
      return '<div class="shape"><span class="shape-label">' + esc(item.label || '形状') + '</span>' + chips + '</div>';
    }

    if (item.formula) return '<div class="formula">' + item.formula.map((f) => '<div>' + f + '</div>').join('') + '</div>';
    if (item.list) return '<ul>' + item.list.map((s) => '<li>' + md(s) + '</li>').join('') + '</ul>';
    if (item.code) return '<pre><code>' + codeHTML(item.code, item.lang || lang || 'python') + '</code></pre>';

    if (item.flow) {
      const nodes = item.flow.map(
        (n) => '<li><div class="flow-node' + (n.part ? ' is-part' : '') + '"><b>' + esc(n.label) + '</b><small>' + esc(n.sub) + '</small></div></li>'
      );
      return '<ol class="flow">' + nodes.join('') + '</ol>';
    }

    if (item.figure === 'pe-heatmap') {
      return (
        '<figure class="fig"><div class="fig-plot">' +
        '<div class="fig-y"><span>pos 0</span><span>' + (PE_ROWS - 1) + '</span></div>' +
        '<canvas data-fig="pe" width="' + PE_COLS + '" height="' + PE_ROWS + '" role="img" aria-label="位置编码热力图"></canvas>' +
        '<div class="fig-x"><span>第 0 列</span><span>第 ' + (PE_COLS - 1) + ' 列</span></div></div>' +
        '<div class="fig-legend"><span>-1</span><i></i><span>+1</span></div>' +
        (item.note ? '<p class="doc-note">' + md(item.note) + '</p>' : '') +
        '</figure>'
      );
    }

    if (item.table) {
      const t = item.table;
      const num = (i) => ((t.num || []).includes(i) ? ' class="num"' : '');
      let html = '<div class="table-wrap"><table><thead><tr>';
      html += t.head.map((h, i) => '<th' + num(i) + '>' + md(h) + '</th>').join('');
      html += '</tr></thead><tbody>';
      for (const row of t.rows) html += '<tr>' + row.map((c, i) => '<td' + num(i) + '>' + md(c) + '</td>').join('') + '</tr>';
      html += '</tbody></table></div>';
      if (t.note) html += '<p class="doc-note">' + md(t.note) + '</p>';
      return html;
    }

    if (item.roadmap) {
      const { done, now } = item.roadmap;
      const items = (lesson.roadmap || []).map((name, i) => {
        if (i < done) return '<li class="is-done">' + esc(name) + '<small>已完成</small></li>';
        if (i < done + now) return '<li class="is-now">' + esc(name) + '<small>本章</small></li>';
        if (now === 0 && i === done) return '<li>' + esc(name) + '<small>下一章</small></li>';
        return '<li>' + esc(name) + '</li>';
      });
      return '<ol class="roadmap">' + items.join('') + '</ol>';
    }

    return '';
  }

  /* ---------------------------------------------------- 位置编码热力图 */

  const PE_ROWS = 50; // 画前 50 个位置
  const PE_COLS = 512; // d_model = 512，每一列一个像素

  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

  // 按论文的公式算出位置表，每个数画成一个像素：正数偏暖色，负数偏冷色，0 是编辑器底色
  function drawFigures() {
    const t = TH.current().t;
    const bg = hexToRgb(t.ed);
    const warm = hexToRgb(t.warm);
    const cool = hexToRgb(t.cool);
    el.doc.querySelectorAll('canvas[data-fig="pe"]').forEach((cv) => {
      const ctx = cv.getContext('2d');
      const img = ctx.createImageData(PE_COLS, PE_ROWS);
      for (let pos = 0; pos < PE_ROWS; pos++) {
        for (let col = 0; col < PE_COLS; col++) {
          const w = Math.exp((col - (col % 2)) * (-Math.log(10000) / PE_COLS));
          const v = col % 2 ? Math.cos(pos * w) : Math.sin(pos * w);
          const to = v >= 0 ? warm : cool;
          const a = Math.abs(v);
          const o = (pos * PE_COLS + col) * 4;
          for (let k = 0; k < 3; k++) img.data[o + k] = Math.round(bg[k] + (to[k] - bg[k]) * a);
          img.data[o + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    });
  }

  /* -------------------------------------------------------------- 旁白 */

  function renderNarration() {
    const step = steps[index];
    el.narrCount.textContent = chapterLabel(ci) + ' · ' + (index + 1) + ' / ' + steps.length;
    el.narrSection.textContent = step.section;
    V.stopAll(el.narrBody);

    if (step.doc) {
      // 前置知识页：内容在左边的文档里，这里只放清单，告诉读者一共几件事、现在在哪
      el.narrTitle.textContent = '写代码之前，先弄懂这 ' + docSteps.length + ' 件事';
      const items = docSteps.map((i) => {
        const seen = i < index ? ' class="is-seen"' : '';
        const cur = i === index ? ' aria-current="step"' : '';
        return '<li' + seen + '><button type="button" data-step="' + ci + ':' + i + '"' + cur + '>' + esc(steps[i].title) + '</button></li>';
      });
      el.narrBody.innerHTML = '<ol class="klist">' + items.join('') + '</ol>';
      el.refs.hidden = true;
    } else {
      el.narrTitle.textContent = step.title;
      const say = step.say || [];
      el.narrBody.innerHTML = say.filter((b) => !b.ref).map((b) => blockHTML(b, 'small')).join('');
      const refs = say.filter((b) => b.ref);
      el.refs.hidden = !refs.length;
      el.refs.innerHTML = refs.length ? '<h2 class="refs-head">这一步用到的文档</h2>' + refs.map((b) => blockHTML(b)).join('') : '';
      V.mount(el.narrBody);
    }
    el.narrScroll.scrollTop = 0;
    thoughtKey = '';
    renderThoughts();
  }

  // 这一步里已经出现的念头，以及每条念头对应文件里的第几行
  function thoughtList() {
    return (state && state.notes ? state.notes : [])
      .filter((n) => n.kind === 'note')
      .map((n) => ({ text: n.text, file: n.file, line: state.files[n.file].slice(0, n.pos).split('\n').length - 1 }));
  }

  // 思路流：随打字一条条出现。正在写的那一条高亮，写过的留在上面
  function renderThoughts() {
    const list = thoughtList();
    const typing = phase === 'typing';
    const key = list.length + ':' + typing + ':' + list.map((t) => t.line).join(',');
    if (key === thoughtKey) return;
    const grew = list.length > thoughtKey.split(':')[0] * 1;
    thoughtKey = key;
    el.thoughts.hidden = !list.length;
    el.thoughts.innerHTML = list
      .map((t, k) => {
        const now = typing && k === list.length - 1;
        return (
          '<li class="thought' + (now ? ' is-now' : '') + '" data-file="' + esc(t.file) + '" data-line="' + t.line + '">' +
          '<p>' + md(t.text) + '</p><span class="thought-ln">' + esc(t.file) + ' · 第 ' + (t.line + 1) + ' 行</span></li>'
        );
      })
      .join('');
    // 新的一条出现时，旁白栏滚到它
    const last = el.thoughts.lastElementChild;
    if (last && typing && grew) {
      const top = last.offsetTop - el.narrScroll.offsetTop;
      if (top + last.offsetHeight > el.narrScroll.scrollTop + el.narrScroll.clientHeight - 24) {
        el.narrScroll.scrollTo({ top: top - el.narrScroll.clientHeight * 0.35, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    }
  }

  /* -------------------------------------------------------------- 目录 */

  // 目录分三层：章 › 小节 › 页。按钮上的 data-step 是「章:页」
  function buildOutline() {
    el.sideLabel.textContent = course.title;
    el.outline.innerHTML = chapters
      .map((ch, c) => {
        const groups = [];
        ch.steps.forEach((step, i) => {
          const last = groups[groups.length - 1];
          if (last && last.name === step.section) last.items.push(i);
          else groups.push({ name: step.section, items: [i] });
        });
        const sections = groups.map((g, k) => {
          const id = 'ol-' + c + '-' + k;
          const items = g.items.map(
            (i) => '<li><button class="outline-step" type="button" data-step="' + c + ':' + i + '">' + esc(ch.steps[i].title) + '</button></li>'
          );
          return (
            '<li><button class="outline-section" type="button" aria-expanded="true" aria-controls="' + id + '">' +
            '<span class="outline-name">' + esc(g.name) + '</span>' +
            '<span class="outline-count" data-ch="' + c + '" data-from="' + g.items[0] + '" data-size="' + g.items.length + '"></span></button>' +
            '<ol id="' + id + '">' + items.join('') + '</ol></li>'
          );
        });
        const num = ch.label || pad2(c + 1);
        return (
          '<li><button class="outline-chapter" type="button" aria-expanded="false" aria-controls="ol-' + c + '" data-chapter="' + c + '">' +
          '<span class="outline-num">' + esc(num) + '</span><span class="outline-name">' + esc(ch.title) + '</span>' +
          '<span class="outline-count" data-ch="' + c + '" data-from="0" data-size="' + ch.steps.length + '"></span></button>' +
          '<ol id="ol-' + c + '" hidden>' + sections.join('') + '</ol></li>'
        );
      })
      .join('');
  }

  function setFolder(button, open) {
    const list = button.nextElementSibling;
    list.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  }

  // 只展开当前这一章，其余各章收起
  function focusChapterInOutline() {
    el.outline.querySelectorAll('.outline-chapter').forEach((b) => setFolder(b, Number(b.dataset.chapter) === ci));
  }

  function renderOutline() {
    el.outline.querySelectorAll('[data-step]').forEach((b) => {
      const [c, i] = b.dataset.step.split(':').map(Number);
      const current = c === ci && i === index;
      b.classList.toggle('is-seen', !current && i <= seenOf(c));
      if (current) {
        b.setAttribute('aria-current', 'step');
        const section = b.closest('ol');
        if (section.hidden) setFolder(section.previousElementSibling, true);
        const chapter = section.parentElement.closest('ol');
        if (chapter.hidden) setFolder(chapter.previousElementSibling, true);
        // 只在目录自己的滚动区里滚动，不带动整个页面
        const top = b.getBoundingClientRect().top - el.sidebar.getBoundingClientRect().top + el.sidebar.scrollTop;
        const view = el.sidebar;
        if (top < view.scrollTop + 40 || top > view.scrollTop + view.clientHeight - 60) {
          view.scrollTop = Math.max(0, top - view.clientHeight / 2);
        }
      } else {
        b.removeAttribute('aria-current');
      }
    });
    el.outline.querySelectorAll('.outline-count').forEach((n) => {
      const from = Number(n.dataset.from);
      const size = Number(n.dataset.size);
      const seen = seenOf(Number(n.dataset.ch));
      n.textContent = Math.min(size, Math.max(0, seen - from + 1)) + '/' + size;
    });
    el.outline.querySelectorAll('.outline-chapter').forEach((b) => b.classList.toggle('is-current', Number(b.dataset.chapter) === ci));
  }

  function toggleOutline() {
    if (narrow.matches) {
      setDrawer(!el.app.classList.contains('is-outline-open'));
    } else {
      const closed = el.app.classList.toggle('is-side-closed');
      el.btnExplorer.setAttribute('aria-pressed', String(!closed));
      drawMinimap();
    }
  }

  function setDrawer(open) {
    el.app.classList.toggle('is-outline-open', open);
    el.btnOutline.setAttribute('aria-expanded', String(open));
  }

  /* ------------------------------------------------------------ 编辑区 */

  const CURSOR = '<span class="cur"></span>';

  // 当前编辑区该显示什么：文档预览，还是某个代码文件
  function shownName() {
    if (peek) return peek;
    return steps[index].doc || !state.active ? DOC : state.active;
  }

  // 把一行的 token 拼成 HTML，同时在指定的列插入光标、给选中的范围加底色
  function lineHTML(tokens, cur, selA, selB) {
    let col = 0;
    let out = '';
    for (const tok of tokens) {
      const end = col + tok.t.length;
      const cuts = [cur, selA, selB].filter((p) => p > col && p < end).sort((a, b) => a - b);
      cuts.push(end);
      let a = col;
      for (const b of cuts) {
        if (b === a) continue;
        if (cur === a) out += CURSOR;
        const selected = selA < selB && a >= selA && b <= selB;
        const cls = (tok.c && tok.c !== 'pun' ? 't-' + tok.c : '') + (selected ? ' sel' : '');
        const text = esc(tok.t.slice(a - col, b - col));
        out += cls ? '<span class="' + cls.trim() + '">' + text + '</span>' : text;
        a = b;
      }
      col = end;
    }
    if (cur === col) out += CURSOR;
    return out;
  }

  function renderEditor(instant) {
    const name = shownName();
    const isDoc = name === DOC;
    el.codeWrap.hidden = isDoc;
    el.doc.hidden = !isDoc;
    el.btnNotes.setAttribute('aria-pressed', String(isDoc));
    renderTabs(name);

    if (isDoc) {
      renderDoc();
      renderCrumbs(name, null, 0);
      el.statusFile.textContent = lesson.docName || '前置知识.md';
      el.statusPos.textContent = '预览';
      el.statusLang.textContent = 'Markdown';
      return;
    }

    const language = C.langOfFile(name);
    const text = state.files[name] || '';
    const isActive = name === state.active;
    const cursor = isActive ? state.cursor[name] : -1;
    const sel = state.sel && state.sel.file === name ? state.sel : null;
    const marks = state.marks[name] || [];
    const tokens = H.tokenize(text, language);
    const rawLines = text.split('\n');
    const indents = rawLines.map((raw) => raw.length - raw.trimStart().length);

    // 正在写的那一条念头对应的行，左边标一条强调色
    const thoughts = thoughtList();
    const thinking = phase === 'typing' && thoughts.length && thoughts[thoughts.length - 1].file === name ? thoughts[thoughts.length - 1].line : -1;

    // 缩进参考线画到哪：空行没有缩进，取上下最近的非空行里较浅的那个，参考线才不会断
    const guides = indents.slice();
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].trim()) continue;
      let up = i - 1;
      let down = i + 1;
      while (up >= 0 && !rawLines[up].trim()) up--;
      while (down < rawLines.length && !rawLines[down].trim()) down++;
      const a = up >= 0 ? indents[up] : 0;
      const b = down < rawLines.length ? indents[down] : 0;
      guides[i] = Math.max(indents[i], Math.min(a, b));
    }

    let offset = 0;
    let curLine = 0;
    let curCol = 0;
    const next = [];
    const flags = [];

    for (let i = 0; i < rawLines.length; i++) {
      const raw = rawLines[i];
      const ls = offset;
      const le = offset + raw.length;
      const hasCursor = cursor >= ls && cursor <= le;
      if (hasCursor) {
        curLine = i;
        curCol = cursor - ls;
      }

      let cls = 'line';
      let flag = '';
      if (hasCursor) cls += ' is-cur';
      if (i === thinking) cls += ' is-thought';
      if (raw.length) {
        for (const [s, e] of marks) {
          if (s < le && e > ls) {
            flag = s <= ls + indents[i] && e >= le ? 'add' : 'mod';
            cls += ' is-' + flag;
            break;
          }
        }
      }
      flags.push(flag);

      const body = lineHTML(
        tokens[i] || [],
        hasCursor ? cursor - ls : -1,
        sel ? Math.max(sel.from, ls) - ls : 0,
        sel ? Math.min(sel.to, le) - ls : 0
      );
      next.push(
        '<div class="' + cls + '"><span class="ln">' + (i + 1) + '</span>' +
        '<span class="lc" style="--ind:' + indents[i] + ';--gi:' + guides[i] + '">' + body + '</span></div>'
      );
      offset = le + 1;
    }

    // 只更新发生变化的行，打字时每次通常只动一行
    const kids = el.code.children;
    for (let i = 0; i < next.length; i++) {
      if (lineCache[i] === next[i]) continue;
      if (i < kids.length) kids[i].outerHTML = next[i];
      else el.code.insertAdjacentHTML('beforeend', next[i]);
    }
    while (el.code.children.length > next.length) el.code.lastElementChild.remove();
    lineCache = next;

    el.code.classList.toggle('is-idle', phase !== 'typing' || paused);
    el.statusFile.textContent = name;
    el.statusPos.textContent = isActive ? '行 ' + (curLine + 1) + '，列 ' + (curCol + 1) : '';
    el.statusLang.textContent = '空格: 4　UTF-8　' + (LANG_LABEL[language] || 'Python');

    renderCrumbs(name, rawLines, isActive ? curLine : -1);
    followCursor(instant);
    mini = { tokens, flags, curLine: isActive ? curLine : -1 };
    drawMinimap();
  }

  // 路径栏：文件 › 类 › 函数，告诉读者光标现在在哪个类、哪个函数里
  const SCOPES = {
    python: /^(\s*)(class|def)\s+(\w+)/,
    rust: /^(\s*)(?:pub(?:\([^)]*\))?\s+)?(impl|fn|struct|mod)\s+(?:<[^>]*>\s*)?(\w+)/,
    java: /^(\s*)(?:(?:public|private|protected|static|final|abstract)\s+)*(class|interface)\s+(\w+)|^(\s*)(?:(?:public|private|protected|static|final)\s+)+[\w<>\[\], ]+\s+(\w+)\s*\(/,
    c: /^(\s*)(?!(?:if|for|while|switch|return|else)\b)[A-Za-z_][\w \t*]*?\s\**(\w+)\s*\([^;]*$/,
  };
  SCOPES.cpp = /^(\s*)(?:(class|struct)\s+(\w+)|(?!(?:if|for|while|switch|return|else)\b)[A-Za-z_][\w:<>,& \t*]*?\s[\*&]*(\w+)\s*\([^;]*$)/;

  function scopeAt(line, language) {
    const re = SCOPES[language] || SCOPES.python;
    const m = re.exec(line);
    if (!m) return null;
    if (language === 'python' || language === 'rust') return { ind: m[1].length, kind: m[2] === 'def' || m[2] === 'fn' ? 'fn' : 'cls', name: m[3] };
    if (language === 'java') return m[3] ? { ind: m[1].length, kind: 'cls', name: m[3] } : { ind: m[4].length, kind: 'fn', name: m[5] };
    if (language === 'cpp') return m[3] ? { ind: m[1].length, kind: 'cls', name: m[3] } : { ind: m[1].length, kind: 'fn', name: m[4] };
    return { ind: m[1].length, kind: 'fn', name: m[2] };
  }

  function renderCrumbs(name, lines, curLine) {
    const parts = ['<span class="crumb">' + fileIcon(name) + esc(name === DOC ? lesson.docName || '前置知识.md' : name) + '</span>'];
    if (name === DOC) {
      const onDocStep = steps[index].doc && !peek;
      parts.push('<span class="crumb">' + esc(onDocStep ? steps[index].title : '全部') + '</span>');
    } else if (lines && curLine >= 0) {
      // 从光标所在的行往上找：缩进比它浅的类或函数，就是包住它的那一层
      const language = C.langOfFile(name);
      const found = [];
      const here = lines[curLine];
      let limit = here.length - here.trimStart().length;
      const own = scopeAt(here, language);
      if (own) found.unshift(own);
      for (let i = curLine - 1; i >= 0 && limit > 0; i--) {
        const m = scopeAt(lines[i], language);
        if (!m || m.ind >= limit) continue;
        found.unshift(m);
        limit = m.ind;
      }
      for (const f of found) {
        parts.push('<span class="crumb"><span class="sym' + (f.kind === 'fn' ? ' is-fn' : '') + '"></span>' + esc(f.name) + '</span>');
      }
    }
    const html = parts.join('');
    if (el.crumbs.dataset.html !== html) {
      el.crumbs.innerHTML = html;
      el.crumbs.dataset.html = html;
    }
  }

  // 前置知识页只显示当前这一页；写代码时点标签回来查，则把所有页连起来显示
  function renderDoc() {
    const onDocStep = Boolean(steps[index].doc) && !peek;
    const key = course.id + ':' + lang + ':' + ci + ':' + (onDocStep ? index : 'all');
    if (docShown === key) return;
    docShown = key;
    V.stopAll(el.doc);

    const pages = onDocStep ? [index] : docSteps;
    el.doc.innerHTML = pages
      .map((i) => {
        const n = docSteps.indexOf(i) + 1;
        const kicker = esc(lesson.docKicker || '前置知识') + ' ' + pad2(n) + ' / ' + pad2(docSteps.length);
        return '<section class="doc-page"><div class="doc-kicker">' + kicker + '</div><h2>' + esc(steps[i].title) + '</h2>' + steps[i].doc.map((b) => blockHTML(b, 'large')).join('') + '</section>';
      })
      .join('');
    el.doc.classList.toggle('is-fresh', onDocStep);
    el.doc.scrollTop = 0;
    drawFigures();
    V.mount(el.doc);
  }

  // 让光标所在的行保持在视野中间偏上的位置
  function followCursor(instant) {
    const cur = el.code.querySelector('.cur');
    if (!cur) return;
    const view = el.code;
    const y = cur.closest('.line').offsetTop + cur.offsetTop;
    const h = view.clientHeight;
    if (y < view.scrollTop + h * 0.12 || y > view.scrollTop + h * 0.68) {
      view.scrollTo({ top: Math.max(0, y - h * 0.4), behavior: instant || reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function renderTabs(shown) {
    const names = (docSteps.length ? [DOC] : []).concat(state.order);
    const dirty = phase === 'typing' ? state.active : null;
    const html = names
      .map((n) => {
        const label = n === DOC ? lesson.docName || '前置知识.md' : n;
        return (
          '<button class="tab' + (n === dirty ? ' is-dirty' : '') + '" type="button" role="tab" data-file="' + esc(n) + '" aria-selected="' + (n === shown) + '">' +
          fileIcon(n) + '<span>' + esc(label) + '</span><span class="tab-dot"></span></button>'
        );
      })
      .join('');
    if (el.tabs.dataset.html !== html) {
      el.tabs.innerHTML = html;
      el.tabs.dataset.html = html;
    }
  }

  function renderTerminal() {
    const t = shownName() === DOC ? null : state.term;
    el.terminal.hidden = !t;
    if (!t) return;
    let html = '<div><span class="term-prompt">$ </span>' + esc(t.cmd) + (t.lines.length || t.done ? '' : CURSOR) + '</div>';
    for (const line of t.lines) html += '<div>' + esc(line) + '</div>';
    el.termBody.innerHTML = html;
    el.terminal.scrollTop = el.terminal.scrollHeight;
  }

  /* ------------------------------------------------------------ 小地图 */

  const MINI_LINE = 3; // 小地图上每行代码占 3 像素高（2 像素字 + 1 像素间隔）
  const MINI_CHAR = 1.15;
  const MINI_PAD = 6;

  function drawMinimap() {
    if (!mini || el.minimap.offsetParent === null) return;
    const t = TH.current().t;
    const w = el.minimap.clientWidth;
    const h = el.minimap.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    const cv = el.miniCanvas;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    mini.tokens.forEach((line, i) => {
      const y = MINI_PAD + i * MINI_LINE;
      if (mini.flags[i]) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = mini.flags[i] === 'add' ? t.added : t.changed;
        ctx.fillRect(0, y, 2, 2);
      }
      let col = 0;
      ctx.globalAlpha = 0.72;
      for (const tok of line) {
        if (tok.c) {
          ctx.fillStyle = tok.c === 'pun' ? t.code : t['s-' + tok.c] || t.code;
          ctx.fillRect(MINI_PAD + col * MINI_CHAR, y, Math.max(1, tok.t.length * MINI_CHAR), 2);
        }
        col += tok.t.length;
      }
    });
    ctx.globalAlpha = 1;
    updateMiniView();
  }

  // 小地图上的半透明滑块：编辑区当前看到的是整份代码的哪一段
  function updateMiniView() {
    if (!mini || el.minimap.offsetParent === null) return;
    const view = el.code;
    const pad = parseFloat(getComputedStyle(view).paddingBottom) || 0;
    const content = Math.max(1, view.scrollHeight - pad);
    const miniH = mini.tokens.length * MINI_LINE;
    const top = MINI_PAD + (view.scrollTop / content) * miniH;
    const height = Math.min(el.minimap.clientHeight - top, (view.clientHeight / content) * miniH);
    el.miniView.style.top = top + 'px';
    el.miniView.style.height = Math.max(12, height) + 'px';
  }

  /* -------------------------------------------------------------- 控件 */

  function goLabel() {
    const step = steps[index];
    const last = index === steps.length - 1;
    const lastChapter = ci === chapters.length - 1;
    const nextIsCode = !last && step.doc && !steps[index + 1].doc;
    if (phase === 'reading') return '开始写代码';
    if (phase === 'typing') return '直接看结果';
    if (last) return lastChapter ? '回到课程页' : '进入' + (chapters[ci + 1].label ? ' ' + chapters[ci + 1].label : '第 ' + (ci + 2) + ' 章');
    return nextIsCode ? '开始写代码' : '下一步';
  }

  function renderControls() {
    const step = steps[index];
    const label = goLabel();
    el.back.disabled = index === 0 && ci === 0;
    el.go.dataset.phase = phase;
    el.goLabel.textContent = label;
    el.pause.disabled = !canPause();
    el.pause.textContent = paused ? '恢复' : '暂停';
    el.pause.setAttribute('aria-pressed', String(paused));
    el.speed.textContent = '打字速度 ' + prefs.speed + '×';
    el.auto.textContent = '自动播放 ' + (auto ? '开' : '关');
    el.auto.setAttribute('aria-pressed', String(auto));

    // 三段进度只在要写代码的页上出现
    const typed = (step.ops || []).length > 0;
    el.phases.hidden = !typed;
    const order = ['reading', 'typing', 'done'];
    el.phases.querySelectorAll('li').forEach((li) => {
      const at = order.indexOf(li.dataset.phase);
      const now = order.indexOf(phase);
      li.classList.toggle('is-now', at === now);
      li.classList.toggle('is-past', at < now);
    });
  }

  function renderTheme() {
    el.themeName.textContent = TH.current().name;
    el.btnMode.setAttribute('aria-label', TH.resolved() === 'dark' ? '切换到浅色' : '切换到深色');
  }

  function renderLangButton() {
    el.lang.hidden = !course.langs;
    if (course.langs) el.lang.textContent = C.LANGS[lang].name;
  }

  function renderAll(instant) {
    el.courseName.textContent = course.title;
    el.chapter.textContent = chapterLabel(ci) + '　' + lesson.title;
    el.btnCourse.href = '#' + course.id;
    el.progress.style.width = ((index + 1) / steps.length) * 100 + '%';
    el.app.classList.toggle('is-doc-step', Boolean(steps[index].doc));
    renderEditor(instant);
    renderTerminal();
    renderControls();
  }

  /* -------------------------------------------------------------- 流程 */

  function resetFill() {
    [el.fill].forEach((f) => {
      f.style.transition = 'none';
      f.style.transform = 'scaleX(0)';
    });
  }

  function stopWait() {
    clearTimeout(waitTimer);
    waitTimer = null;
    pending = null;
    resetFill();
  }

  function stopTimers() {
    clearTimeout(timer);
    timer = null;
    stopWait();
    paused = false;
  }

  // 自动播放时的等待：按钮上有一条进度，走完就执行 then
  function wait(ms, then) {
    stopWait();
    pending = { then, total: ms, left: ms, started: 0 };
    runWait();
  }

  // 开始（或在暂停后接着）走完剩下的等待时间
  function runWait() {
    const done = 1 - pending.left / pending.total;
    [el.fill].forEach((f) => {
      f.style.transition = 'none';
      f.style.transform = 'scaleX(' + done + ')';
      void f.offsetWidth;
      f.style.transition = 'transform ' + pending.left + 'ms linear';
      f.style.transform = 'scaleX(1)';
    });
    pending.started = performance.now();
    waitTimer = setTimeout(() => {
      const then = pending.then;
      stopWait();
      then();
    }, pending.left);
  }

  // 暂停对两件事有效：正在打字，或自动播放正在倒计时
  function canPause() {
    return paused || phase === 'typing' || pending !== null;
  }

  function togglePause() {
    if (!canPause()) return;
    paused = !paused;
    if (paused) {
      clearTimeout(timer);
      timer = null;
      if (pending) {
        clearTimeout(waitTimer);
        waitTimer = null;
        pending.left = Math.max(0, pending.left - (performance.now() - pending.started));
        [el.fill].forEach((f) => {
          f.style.transition = 'none';
          f.style.transform = 'scaleX(' + (1 - pending.left / pending.total) + ')';
        });
      }
    } else if (pending) {
      runWait();
    } else if (phase === 'typing') {
      tick();
    }
    el.code.classList.toggle('is-idle', phase !== 'typing' || paused);
    renderControls();
  }

  // 自动播放：演示图跟着自动走一遍，等它播完再翻页
  function scheduleAuto() {
    if (!auto) return;
    const step = steps[index];
    if (phase === 'reading') {
      V.autoplay(el.narrBody);
      wait(readingMs(step), startTyping);
    } else if (phase === 'done' && !(index === steps.length - 1 && ci === chapters.length - 1)) {
      const typed = (step.ops || []).length > 0;
      if (!typed) V.autoplay(step.doc ? el.doc : el.narrBody);
      wait(typed ? PACE.afterTyping : readingMs(step), advance);
    }
    renderControls();
  }

  // 按当前语言取出这门课的各章并编译（结果缓存起来）
  function loadCourse(c, language) {
    const key = c.id + ':' + (language || '');
    if (!cache.has(key)) {
      const list = [];
      const out = [];
      let previous = null;
      for (const ch of c.chapters) {
        const resolved = C.resolve(ch, language);
        const comp = E.compile(resolved, c.chain ? previous : null);
        previous = comp.after[comp.after.length - 1];
        list.push(resolved);
        out.push(comp);
      }
      cache.set(key, { chapters: list, compiledAll: out });
    }
    const got = cache.get(key);
    course = c;
    lang = language;
    chapters = got.chapters;
    compiledAll = got.compiledAll;
    buildOutline();
  }

  // 换到第 c 章：之后的 steps、compiled 等都指向这一章
  function useChapter(c) {
    ci = c;
    lesson = chapters[c];
    steps = lesson.steps;
    docSteps = steps.map((s, i) => (s.doc ? i : -1)).filter((i) => i >= 0);
    compiled = compiledAll[c];
    docShown = null;
    lineCache = [];
    el.code.innerHTML = '';
    focusChapterInOutline();
    try {
      history.replaceState(null, '', '#' + course.id + '-' + (c + 1));
    } catch (e) {
      /* 改不了网址也不影响使用 */
    }
  }

  // mode = 'play'：从上一步的结果出发，准备播放这一步
  // mode = 'show'：直接显示这一步写完后的样子（后退、目录跳转、恢复进度）
  function enter(c, i, mode) {
    stopTimers();
    if (c !== ci || !compiled) useChapter(c);
    index = i;
    peek = null;
    gen = null;

    if (mode === 'play') {
      state = E.clone(i === 0 ? compiled.initial : compiled.after[i - 1]);
      gen = E.runStep(state, steps[i], E.rng(i + 1));
      // 先走第一格：把光标移到要写的位置，然后停下来等读者
      if (gen.next().done) {
        gen = null;
        phase = 'done';
      } else {
        phase = 'reading';
      }
    } else {
      state = E.clone(compiled.after[i]);
      phase = 'done';
    }

    lineCache = [];
    el.code.innerHTML = '';
    renderNarration();
    renderOutline();
    renderAll(true);
    savePrefs();
    if (mode === 'play') scheduleAuto();
  }

  function startTyping() {
    stopTimers();
    peek = null;
    phase = 'typing';
    renderControls();
    tick();
  }

  function tick() {
    const r = gen.next();
    if (r.done) {
      finish();
      return;
    }
    renderEditor(false);
    renderTerminal();
    renderThoughts();
    timer = setTimeout(tick, r.value / prefs.speed);
  }

  function finish() {
    stopTimers();
    gen = null;
    state = E.clone(compiled.after[index]);
    phase = 'done';
    renderAll(false);
    renderThoughts();
    scheduleAuto();
  }

  function advance() {
    if (phase === 'reading') startTyping();
    else if (phase === 'typing') finish();
    else if (index < steps.length - 1) enter(ci, index + 1, 'play');
    else if (ci < chapters.length - 1) enter(ci + 1, 0, 'play');
    else location.hash = '#' + course.id;
  }

  function back() {
    if (index > 0) enter(ci, index - 1, 'show');
    else if (ci > 0) enter(ci - 1, chapters[ci - 1].steps.length - 1, 'show');
  }

  // 换语言：按新语言重新取这门课，停在同一章的同一页
  function setLang(next) {
    if (!course.langs || next === lang) return;
    prefs.lang = next;
    S.save();
    const keepChapter = ci;
    const keepIndex = index;
    loadCourse(course, next);
    compiled = null;
    enter(keepChapter, keepIndex, 'show');
    renderLangButton();
  }

  /* ------------------------------------------------- 快速选择：主题和语言 */

  // 打开时记下原来的选择：上下键和鼠标悬停只是预览，回车或点击才算数，Esc 恢复原样
  let quick = null; // { kind: 'theme' | 'lang', value, mode, original }

  const SWATCH_KEYS = ['s-kw', 's-fn', 's-cls', 's-str', 's-num'];

  function quickItems() {
    if (quick.kind === 'lang') return course.langs.map((id) => ({ id, label: C.LANGS[id].name, detail: C.LANGS[id].file }));
    const mode = TH.resolved(quick.mode);
    return TH.families.map((f) => ({
      id: f.id,
      label: f.name,
      detail: f.dark.name + ' · ' + f.light.name,
      swatch: '<span class="swatch" style="background:' + f[mode].t.ed + '">' + SWATCH_KEYS.map((k) => '<i style="background:' + f[mode].t[k] + '"></i>').join('') + '</span>',
    }));
  }

  function renderQuick() {
    const original = quick.kind === 'lang' ? quick.original : quick.original.style;
    el.quickTitle.textContent = quick.kind === 'lang' ? '题解语言' : '颜色主题';
    el.quickMode.hidden = quick.kind !== 'theme';
    el.quickFoot.innerHTML =
      quick.kind === 'lang'
        ? '<span><kbd>↑</kbd><kbd>↓</kbd>选择</span><span><kbd>Enter</kbd>确定</span><span><kbd>Esc</kbd>取消</span>'
        : '<span><kbd>↑</kbd><kbd>↓</kbd>换风格</span><span><kbd>←</kbd><kbd>→</kbd>换亮暗</span><span><kbd>Enter</kbd>确定</span><span><kbd>Esc</kbd>取消</span>';
    el.quickList.innerHTML = quickItems()
      .map(
        (it) =>
          '<li role="presentation"><button class="quick-item" type="button" role="option" data-id="' + it.id + '" aria-selected="' + (it.id === quick.value) + '">' +
          '<span class="quick-check">' + (it.id === original ? '✓' : '') + '</span>' +
          '<span class="quick-name">' + esc(it.label) + '</span>' +
          '<span class="quick-variant">' + esc(it.detail) + '</span>' + (it.swatch || '') + '</button></li>'
      )
      .join('');
    if (quick.kind === 'theme') el.quickMode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === quick.mode)));
  }

  function previewQuick(value, mode) {
    quick.value = value || quick.value;
    if (quick.kind === 'theme') {
      quick.mode = mode || quick.mode;
      TH.set(quick.value, quick.mode, false);
    }
    renderQuick();
  }

  function openQuick(kind) {
    if (quick) return;
    if (kind === 'lang' && !course.langs) return;
    if (kind === 'theme') {
      const now = TH.get();
      quick = { kind, value: now.style, mode: now.mode, original: now };
    } else {
      quick = { kind, value: lang, original: lang };
    }
    el.quick.hidden = false;
    renderQuick();
    const on = el.quickList.querySelector('[aria-selected="true"]');
    if (on) on.focus({ preventScroll: true });
  }

  function closeQuick(commit) {
    if (!quick) return;
    const q = quick;
    quick = null;
    el.quick.hidden = true;
    if (q.kind === 'theme') {
      if (commit) TH.set(q.value, q.mode, true);
      else TH.set(q.original.style, q.original.mode, false);
    } else if (commit) {
      setLang(q.value);
    }
  }

  function moveQuick(delta) {
    const ids = quickItems().map((it) => it.id);
    const at = (ids.indexOf(quick.value) + delta + ids.length) % ids.length;
    previewQuick(ids[at]);
    const on = el.quickList.querySelector('[aria-selected="true"]');
    if (on) on.focus({ preventScroll: true });
  }

  /* -------------------------------------------------------------- 事件 */

  el.go.addEventListener('click', advance);
  el.back.addEventListener('click', back);
  el.pause.addEventListener('click', togglePause);

  // 鼠标移到某一条念头上，编辑器里对应的那一行也亮起来
  el.thoughts.addEventListener('mouseover', (e) => {
    const t = e.target.closest('.thought');
    el.code.querySelectorAll('.line.is-hover').forEach((l) => l.classList.remove('is-hover'));
    if (!t || t.dataset.file !== shownName()) return;
    const row = el.code.children[Number(t.dataset.line)];
    if (row) row.classList.add('is-hover');
  });
  el.thoughts.addEventListener('mouseleave', () => {
    el.code.querySelectorAll('.line.is-hover').forEach((l) => l.classList.remove('is-hover'));
  });

  // 目录和前置知识清单里的条目都带 data-step，点了就跳过去
  function jump(e) {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    const [c, i] = b.dataset.step.split(':').map(Number);
    enter(c, i, 'show');
    setDrawer(false);
  }
  el.narrBody.addEventListener('click', jump);
  el.outline.addEventListener('click', (e) => {
    const head = e.target.closest('.outline-chapter, .outline-section');
    if (!head) return jump(e);
    setFolder(head, head.nextElementSibling.hidden);
  });

  el.speed.addEventListener('click', () => {
    prefs.speed = SPEEDS[(SPEEDS.indexOf(prefs.speed) + 1) % SPEEDS.length];
    renderControls();
    S.save();
  });

  el.auto.addEventListener('click', () => {
    auto = !auto;
    stopWait();
    if (phase !== 'typing') paused = false;
    renderControls();
    scheduleAuto();
  });

  function showTab(name) {
    if (phase === 'typing') return;
    const home = steps[index].doc ? DOC : state.active;
    peek = name === home ? null : name;
    lineCache = [];
    el.code.innerHTML = '';
    renderEditor(true);
    renderTerminal();
  }

  el.tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-file]');
    if (b) showTab(b.dataset.file);
  });

  // 活动栏的「书」：随时打开前置知识，再点一次回到代码
  el.btnNotes.addEventListener('click', () => {
    if (steps[index].doc || !docSteps.length) return;
    showTab(shownName() === DOC ? state.active : DOC);
  });

  el.btnOutline.addEventListener('click', toggleOutline);
  el.btnExplorer.addEventListener('click', toggleOutline);
  el.scrim.addEventListener('click', () => setDrawer(false));

  el.btnMode.addEventListener('click', () => {
    closeQuick(false);
    TH.set(null, TH.resolved() === 'dark' ? 'light' : 'dark', true);
  });
  [$('btn-theme'), $('btn-theme-top'), el.themeName].forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (quick) closeQuick(false);
      else openQuick('theme');
    })
  );
  el.lang.addEventListener('click', (e) => {
    e.stopPropagation();
    if (quick) closeQuick(false);
    else openQuick('lang');
  });
  el.quickList.addEventListener('mouseover', (e) => {
    const b = e.target.closest('[data-id]');
    if (b && quick.kind === 'theme' && b.dataset.id !== quick.value) previewQuick(b.dataset.id);
  });
  el.quickList.addEventListener('click', (e) => {
    const b = e.target.closest('[data-id]');
    if (!b) return;
    previewQuick(b.dataset.id);
    closeQuick(true);
  });
  el.quickMode.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (b) previewQuick(null, b.dataset.mode);
  });
  document.addEventListener('click', (e) => {
    if (quick && !el.quick.contains(e.target)) closeQuick(false);
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen || e.metaKey || e.ctrlKey || e.altKey) return;

    if (quick) {
      if (e.key === 'Escape') closeQuick(false);
      else if (e.key === 'Enter') closeQuick(true);
      else if (e.key === 'ArrowDown') moveQuick(1);
      else if (e.key === 'ArrowUp') moveQuick(-1);
      else if (quick.kind === 'theme' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const modes = ['dark', 'light', 'auto'];
        previewQuick(null, modes[(modes.indexOf(quick.mode) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]);
      } else return;
      e.preventDefault();
      return;
    }

    const onControl = e.target instanceof HTMLElement && e.target.closest('button, a');
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === 'ArrowRight' || key === 'PageDown') {
      e.preventDefault();
      advance();
    } else if (key === ' ' || key === 'Enter') {
      if (onControl) return; // 交给按钮或链接自己处理，免得触发两次
      e.preventDefault();
      advance();
    } else if (key === 'ArrowLeft' || key === 'PageUp') {
      e.preventDefault();
      back();
    } else if (key === 'p') {
      e.preventDefault();
      togglePause();
    } else if (key === 't') {
      e.preventDefault();
      openQuick('theme');
    } else if (key === 'l') {
      e.preventDefault();
      openQuick('lang');
    } else if (key === 'Escape') {
      setDrawer(false);
    }
  });

  el.code.addEventListener('scroll', updateMiniView, { passive: true });
  window.addEventListener('resize', () => {
    if (isOpen) drawMinimap();
  });
  TH.onChange(() => {
    renderTheme();
    if (!isOpen) return;
    drawMinimap();
    drawFigures();
  });

  /* ------------------------------------------------------------ 对外接口 */

  // 打开某门课的第 c 章（从 0 数）。不给 c 就回到上次停下的那一章
  function open(courseId, c) {
    const target = C.byId[courseId];
    if (!target || !target.chapters.length) return false;
    const language = target.langs ? (target.langs.includes(prefs.lang) ? prefs.lang : target.langs[0]) : null;
    if (!course || course.id !== target.id || lang !== language) {
      loadCourse(target, language);
      compiled = null;
    }
    const p = S.course(target.id);
    if (c == null || c < 0 || c >= chapters.length) c = Math.min(Math.max(0, p.chapter | 0), chapters.length - 1);
    const saved = p.steps[chapters[c].id];
    const i = typeof saved === 'number' ? Math.min(Math.max(0, saved), chapters[c].steps.length - 1) : 0;
    isOpen = true;
    el.app.hidden = false;
    renderTheme();
    renderLangButton();
    if (c !== ci || !compiled || lesson !== chapters[c]) compiled = null;
    enter(c, i, i === 0 ? 'play' : 'show');
    return true;
  }

  function close() {
    if (!isOpen) return;
    stopTimers();
    closeQuick(false);
    V.stopAll(el.app);
    isOpen = false;
    el.app.hidden = true;
  }

  window.Player = {
    open,
    close,
    get isOpen() {
      return isOpen;
    },
    get current() {
      return course ? { course: course.id, chapter: ci } : null;
    },
  };
})();
