/*
 * 播放器：把引擎算出来的状态画到页面上，并处理翻页。
 *
 * 步骤有两种：
 *   前置知识页（step.doc）  不写代码，编辑区显示一页文档预览，右侧是前置知识的清单。
 *   写代码页（step.ops）    右侧是旁白，编辑区里代码逐字符打出来。
 *
 * 写代码页有三个阶段：
 *   reading  旁白已经出现，光标停在要写代码的位置，等读者读完
 *   typing   代码正在一个字一个字打出来
 *   done     这一步写完了
 * 「继续」键在三个阶段分别是：开始写代码 / 直接看结果 / 下一步。
 * 这样旁白和打字不会同时抢注意力：先读，再看。
 */
(function () {
  'use strict';

  const E = window.Engine;
  const H = window.Highlight;
  const TH = window.Themes;
  const $ = (id) => document.getElementById(id);

  const el = {
    app: $('app'),
    chapter: $('chapter-name'),
    progress: $('progress'),
    outline: $('outline'),
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
    phases: $('phases'),
    back: $('btn-back'),
    pause: $('btn-pause'),
    go: $('btn-go'),
    goLabel: $('btn-go-label'),
    fill: $('btn-fill'),
    statusFile: $('status-file'),
    statusPos: $('status-pos'),
    statusLang: $('status-lang'),
    speed: $('btn-speed'),
    auto: $('btn-auto'),
    themeName: $('btn-theme-name'),
    quick: $('quick'),
    quickList: $('quick-list'),
    quickMode: $('quick-mode'),
  };

  const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
  const STORE_KEY = 'transformer-typing-v2';
  const DOC = '@doc'; // 文档预览标签页的内部名字

  // 自动播放时每一页停多久（毫秒），想调节奏改这里。
  // 旁白又短又简单的页停 simple；其余的页停 normal，引用多或文字长再加一点，最多 max。
  const PACE = {
    simple: 2000,
    normal: 5000,
    extra: 1000, // 每多一条引用、或文字偏长，各加这么多
    max: 7000,
    doc: 10000, // 前置知识页内容多，单独给一个时间
    afterTyping: 2000, // 代码打完后，停一下再翻页
  };
  const SIMPLE_MAX_CHARS = 60; // 旁白不超过这么多字、且没有引用和公式，算「短而简单」
  const LONG_CHARS = 120;

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia ? window.matchMedia('(max-width: 1120px)') : { matches: false };

  const lesson = window.LESSONS[0];
  const steps = lesson.steps;
  const docSteps = steps.map((s, i) => (s.doc ? i : -1)).filter((i) => i >= 0);

  let compiled;
  try {
    compiled = E.compile(lesson);
  } catch (err) {
    el.narrTitle.textContent = '课程脚本有错误';
    el.narrBody.innerHTML = '<div class="error"></div>';
    el.narrBody.firstChild.textContent = err.message;
    return;
  }

  const prefs = Object.assign({ speed: 1, step: 0 }, loadPrefs());
  if (!SPEEDS.includes(prefs.speed)) prefs.speed = 1;
  prefs.auto = false; // 自动播放每次打开都从「关」开始，免得页面自己动起来

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
  let mini = null; // 小地图上一次画的内容，换主题或改窗口大小时重画

  /* ------------------------------------------------------------ 小工具 */

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function savePrefs() {
    prefs.step = index;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ speed: prefs.speed, step: prefs.step }));
    } catch (e) {
      /* 存不了也不影响使用 */
    }
  }

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);

  // 简易标记：`代码`、**加粗**，其余 HTML 原样保留
  function md(s) {
    return String(s)
      .split('`')
      .map((part, i) => (i % 2 ? '<code>' + esc(part) + '</code>' : part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')))
      .join('');
  }

  // 自动播放时这一页的旁白该停多久：看长度，也看难度（有没有引用、公式这类要慢读的东西）。
  // 个别页想单独指定，可以在脚本里给这一步写 read: 秒数。
  function readingMs(step) {
    if (step.read) return step.read * 1000;
    if (step.doc) return PACE.doc;
    const say = step.say || [];
    const refs = say.filter((b) => b.ref).length;
    const hard = refs > 0 || say.some((b) => b.formula || b.table || b.code);
    const chars = say.reduce((n, b) => (typeof b === 'string' ? n + b.replace(/<[^>]+>|[`*]/g, '').length : n), 0);
    if (!hard && chars <= SIMPLE_MAX_CHARS) return PACE.simple;
    const extra = Math.max(0, refs - 1) + (chars > LONG_CHARS ? 1 : 0);
    return Math.min(PACE.max, PACE.normal + extra * PACE.extra);
  }

  const FILE_ICON =
    '<svg class="file-icon%CLS%" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2H4v12h8V4.500L9.500 2z"/><path d="M9.500 2v2.500H12"/></svg>';
  const fileIcon = (name) => FILE_ICON.replace('%CLS%', name === DOC || /\.md$/.test(name) ? ' is-md' : '');

  /* ------------------------------------------------- 文字块（旁白与文档共用） */

  function codeHTML(src) {
    return H.tokenize(src)
      .map((line) => line.map((t) => (t.c ? '<span class="t-' + t.c + '">' + esc(t.t) + '</span>' : esc(t.t))).join(''))
      .join('\n');
  }

  function blockHTML(item) {
    if (typeof item === 'string') return '<p>' + md(item) + '</p>';

    if (item.ref) {
      const r = item.ref;
      return (
        '<figure class="ref"><figcaption class="ref-head"><code>' + esc(r.api) + '</code>' +
        '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.source) + ' ↗</a></figcaption>' +
        '<blockquote lang="en">' + esc(r.quote) + '</blockquote>' +
        '<p class="ref-zh">' + md(r.zh) + '</p></figure>'
      );
    }

    if (item.shape) {
      const chips = item.shape.map((s) => '<code>' + esc(s) + '</code>').join('<span class="shape-arrow" aria-label="变成">→</span>');
      return '<div class="shape"><span class="shape-label">' + esc(item.label || '形状') + '</span>' + chips + '</div>';
    }

    if (item.formula) {
      return '<div class="formula">' + item.formula.map((f) => '<div>' + f + '</div>').join('') + '</div>';
    }

    if (item.list) {
      return '<ul>' + item.list.map((s) => '<li>' + md(s) + '</li>').join('') + '</ul>';
    }

    if (item.code) {
      return '<pre><code>' + codeHTML(item.code) + '</code></pre>';
    }

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
      const items = lesson.roadmap.map((name, i) => {
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
    el.narrCount.textContent = index + 1 + ' / ' + steps.length;
    el.narrSection.textContent = step.section;

    if (step.doc) {
      // 前置知识页：内容在左边的文档里，这里只放清单，告诉读者一共几件事、现在在哪
      el.narrTitle.textContent = '写代码之前，先弄懂这 ' + docSteps.length + ' 件事';
      const items = docSteps.map((i) => {
        const seen = i < index ? ' class="is-seen"' : '';
        const cur = i === index ? ' aria-current="step"' : '';
        return '<li' + seen + '><button type="button" data-step="' + i + '"' + cur + '>' + esc(steps[i].title) + '</button></li>';
      });
      el.narrBody.innerHTML = '<ol class="klist">' + items.join('') + '</ol>';
    } else {
      el.narrTitle.textContent = step.title;
      el.narrBody.innerHTML = (step.say || []).map(blockHTML).join('');
    }
    el.narrScroll.scrollTop = 0;
  }

  /* -------------------------------------------------------------- 目录 */

  function buildOutline() {
    const groups = [];
    steps.forEach((step, i) => {
      const last = groups[groups.length - 1];
      if (last && last.name === step.section) last.items.push(i);
      else groups.push({ name: step.section, items: [i] });
    });
    el.outline.innerHTML = groups
      .map((g, k) => {
        const items = g.items.map((i) => '<li><button class="outline-step" type="button" data-step="' + i + '">' + esc(steps[i].title) + '</button></li>');
        return (
          '<li><button class="outline-section" type="button" aria-expanded="true" aria-controls="sec-' + k + '">' +
          esc(g.name) + '<span class="outline-count" data-from="' + g.items[0] + '" data-size="' + g.items.length + '"></span></button>' +
          '<ol id="sec-' + k + '">' + items.join('') + '</ol></li>'
        );
      })
      .join('');
  }

  function renderOutline() {
    el.outline.querySelectorAll('[data-step]').forEach((b) => {
      const i = Number(b.dataset.step);
      b.classList.toggle('is-seen', i < index);
      if (i === index) {
        b.setAttribute('aria-current', 'step');
        // 当前页所在的小节如果被折叠了，展开它
        const list = b.closest('ol');
        if (list.hidden) {
          list.hidden = false;
          list.previousElementSibling.setAttribute('aria-expanded', 'true');
        }
        // 只在目录自己的滚动区里滚动，不带动整个页面
        const top = b.offsetTop - el.sidebar.offsetTop;
        const view = el.sidebar;
        if (top < view.scrollTop + 40 || top > view.scrollTop + view.clientHeight - 60) {
          view.scrollTop = Math.max(0, top - view.clientHeight / 2);
        }
      } else {
        b.removeAttribute('aria-current');
      }
    });
    // 每个小节读完了几页
    el.outline.querySelectorAll('.outline-count').forEach((c) => {
      const from = Number(c.dataset.from);
      const size = Number(c.dataset.size);
      c.textContent = Math.min(size, Math.max(0, index - from + 1)) + '/' + size;
    });
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
    return steps[index].doc ? DOC : state.active;
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
      el.statusFile.textContent = lesson.docName;
      el.statusPos.textContent = '预览';
      el.statusLang.textContent = 'Markdown';
      return;
    }

    const text = state.files[name] || '';
    const isActive = name === state.active;
    const cursor = isActive ? state.cursor[name] : -1;
    const sel = state.sel && state.sel.file === name ? state.sel : null;
    const marks = state.marks[name] || [];
    const tokens = H.tokenize(text);
    const rawLines = text.split('\n');
    const indents = rawLines.map((raw) => raw.length - raw.trimStart().length);

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
    el.statusLang.textContent = '空格: 4　UTF-8　Python';

    renderCrumbs(name, rawLines, isActive ? curLine : -1);
    followCursor(instant);
    mini = { tokens, flags, curLine: isActive ? curLine : -1 };
    drawMinimap();
  }

  // 路径栏：文件 › 类 › 方法，告诉读者光标现在在哪个类、哪个方法里
  function renderCrumbs(name, lines, curLine) {
    const parts = ['<span class="crumb">' + fileIcon(name) + esc(name === DOC ? lesson.docName : name) + '</span>'];
    if (name === DOC) {
      const onDocStep = steps[index].doc && !peek;
      parts.push('<span class="crumb">' + esc(onDocStep ? steps[index].title : '全部') + '</span>');
    } else if (lines && curLine >= 0) {
      // 从光标所在的行往上找：缩进比它浅的 class / def，就是包住它的那一层
      const scope = (line) => /^(\s*)(class|def)\s+(\w+)/.exec(line);
      const found = [];
      const here = lines[curLine];
      let limit = here.length - here.trimStart().length;
      const own = scope(here);
      if (own) found.unshift({ kind: own[2], name: own[3] });
      for (let i = curLine - 1; i >= 0 && limit > 0; i--) {
        const m = scope(lines[i]);
        if (!m || m[1].length >= limit) continue;
        found.unshift({ kind: m[2], name: m[3] });
        limit = m[1].length;
      }
      for (const f of found) {
        parts.push('<span class="crumb"><span class="sym' + (f.kind === 'def' ? ' is-fn' : '') + '"></span>' + esc(f.name) + '</span>');
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
    const key = onDocStep ? 'step:' + index : 'all';
    if (docShown === key) return;
    docShown = key;

    const pages = onDocStep ? [index] : docSteps;
    el.doc.innerHTML = pages
      .map((i) => {
        const n = docSteps.indexOf(i) + 1;
        const kicker = '前置知识 ' + String(n).padStart(2, '0') + ' / ' + String(docSteps.length).padStart(2, '0');
        return '<section class="doc-page"><div class="doc-kicker">' + kicker + '</div><h2>' + esc(steps[i].title) + '</h2>' + steps[i].doc.map(blockHTML).join('') + '</section>';
      })
      .join('');
    el.doc.classList.toggle('is-fresh', onDocStep);
    el.doc.scrollTop = 0;
    drawFigures();
  }

  // 让光标所在的行保持在视野中间偏上的位置
  function followCursor(instant) {
    const cur = el.code.querySelector('.cur');
    if (!cur) return;
    const view = el.code;
    // 光标的位置 = 它所在那一行的位置 + 它在行内（折行后）的位置
    const y = cur.closest('.line').offsetTop + cur.offsetTop;
    const h = view.clientHeight;
    if (y < view.scrollTop + h * 0.12 || y > view.scrollTop + h * 0.68) {
      view.scrollTo({ top: Math.max(0, y - h * 0.4), behavior: instant || reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function renderTabs(shown) {
    const names = docSteps.length ? [DOC].concat(state.order) : state.order;
    const dirty = phase === 'typing' ? state.active : null;
    const html = names
      .map((n) => {
        const label = n === DOC ? lesson.docName : n;
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

  function renderControls() {
    const step = steps[index];
    const last = index === steps.length - 1;
    const nextIsCode = !last && step.doc && !steps[index + 1].doc;
    el.back.disabled = index === 0;
    el.go.dataset.phase = phase;
    el.goLabel.textContent =
      phase === 'reading' ? '开始写代码' : phase === 'typing' ? '直接看结果' : last ? '从头再看' : nextIsCode ? '开始写代码' : '下一步';
    el.pause.disabled = !canPause();
    el.pause.textContent = paused ? '恢复' : '暂停';
    el.pause.setAttribute('aria-pressed', String(paused));
    el.speed.textContent = '打字速度 ' + prefs.speed + '×';
    el.auto.textContent = '自动播放 ' + (prefs.auto ? '开' : '关');
    el.auto.setAttribute('aria-pressed', String(prefs.auto));

    // 三段进度条只在要写代码的页上出现
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

  function renderAll(instant) {
    el.chapter.textContent = '第 1 章　' + lesson.title;
    el.progress.style.width = ((index + 1) / steps.length) * 100 + '%';
    el.app.classList.toggle('is-doc-step', Boolean(steps[index].doc));
    renderEditor(instant);
    renderTerminal();
    renderControls();
  }

  /* -------------------------------------------------------------- 流程 */

  function resetFill() {
    el.fill.style.transition = 'none';
    el.fill.style.transform = 'scaleX(0)';
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
    el.fill.style.transition = 'none';
    el.fill.style.transform = 'scaleX(' + done + ')';
    void el.fill.offsetWidth;
    el.fill.style.transition = 'transform ' + pending.left + 'ms linear';
    el.fill.style.transform = 'scaleX(1)';
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
        el.fill.style.transition = 'none';
        el.fill.style.transform = 'scaleX(' + (1 - pending.left / pending.total) + ')';
      }
    } else if (pending) {
      runWait();
    } else if (phase === 'typing') {
      tick();
    }
    el.code.classList.toggle('is-idle', phase !== 'typing' || paused);
    renderControls();
  }

  function scheduleAuto() {
    if (!prefs.auto) return;
    const step = steps[index];
    if (phase === 'reading') {
      wait(readingMs(step), startTyping);
    } else if (phase === 'done' && index < steps.length - 1) {
      const typed = (step.ops || []).length > 0;
      wait(typed ? PACE.afterTyping : readingMs(step), advance);
    }
    renderControls();
  }

  // mode = 'play'：从上一步的结果出发，准备播放这一步
  // mode = 'show'：直接显示这一步写完后的样子（后退、目录跳转、恢复进度）
  function enter(i, mode) {
    stopTimers();
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
    timer = setTimeout(tick, r.value / prefs.speed);
  }

  function finish() {
    stopTimers();
    gen = null;
    state = E.clone(compiled.after[index]);
    phase = 'done';
    renderAll(false);
    scheduleAuto();
  }

  function advance() {
    if (phase === 'reading') startTyping();
    else if (phase === 'typing') finish();
    else if (index < steps.length - 1) enter(index + 1, 'play');
    else enter(0, 'play');
  }

  function back() {
    if (index > 0) enter(index - 1, 'show');
  }

  /* ---------------------------------------------------------- 主题选择 */

  // 打开时记下原来的选择：上下键和鼠标悬停只是预览，回车或点击才算数，Esc 恢复原样
  let quick = null; // { style, mode, original }

  const SWATCH_KEYS = ['s-kw', 's-fn', 's-cls', 's-str', 's-num'];

  function renderQuick() {
    const mode = TH.resolved(quick.mode);
    el.quickList.innerHTML = TH.families
      .map((f) => {
        const s = f[mode];
        const dots = SWATCH_KEYS.map((k) => '<i style="background:' + s.t[k] + '"></i>').join('');
        const on = f.id === quick.style;
        return (
          '<li role="presentation"><button class="quick-item" type="button" role="option" data-style="' + f.id + '" aria-selected="' + on + '">' +
          '<span class="quick-check">' + (f.id === quick.original.style ? '✓' : '') + '</span>' +
          '<span class="quick-name">' + esc(f.name) + '</span>' +
          '<span class="quick-variant">' + esc(f.dark.name + ' · ' + f.light.name) + '</span>' +
          '<span class="swatch" style="background:' + s.t.ed + '">' + dots + '</span></button></li>'
        );
      })
      .join('');
    el.quickMode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === quick.mode)));
  }

  function previewQuick(style, mode) {
    quick.style = style || quick.style;
    quick.mode = mode || quick.mode;
    TH.set(quick.style, quick.mode, false);
    renderQuick();
  }

  function openQuick() {
    if (quick) return;
    const now = TH.get();
    quick = { style: now.style, mode: now.mode, original: now };
    el.quick.hidden = false;
    renderQuick();
    const on = el.quickList.querySelector('[aria-selected="true"]');
    if (on) on.focus({ preventScroll: true });
  }

  function closeQuick(commit) {
    if (!quick) return;
    if (commit) TH.set(quick.style, quick.mode, true);
    else TH.set(quick.original.style, quick.original.mode, false);
    quick = null;
    el.quick.hidden = true;
  }

  function moveQuick(delta) {
    const ids = TH.families.map((f) => f.id);
    const at = (ids.indexOf(quick.style) + delta + ids.length) % ids.length;
    previewQuick(ids[at]);
    const on = el.quickList.querySelector('[aria-selected="true"]');
    if (on) on.focus({ preventScroll: true });
  }

  /* -------------------------------------------------------------- 事件 */

  el.go.addEventListener('click', advance);
  el.back.addEventListener('click', back);
  el.pause.addEventListener('click', togglePause);

  // 目录和前置知识清单里的条目都带 data-step，点了就跳过去
  function jump(e) {
    const b = e.target.closest('[data-step]');
    if (!b) return;
    enter(Number(b.dataset.step), 'show');
    setDrawer(false);
  }
  el.narrBody.addEventListener('click', jump);
  el.outline.addEventListener('click', (e) => {
    const head = e.target.closest('.outline-section');
    if (!head) return jump(e);
    const list = head.nextElementSibling;
    list.hidden = !list.hidden;
    head.setAttribute('aria-expanded', String(!list.hidden));
  });

  el.speed.addEventListener('click', () => {
    prefs.speed = SPEEDS[(SPEEDS.indexOf(prefs.speed) + 1) % SPEEDS.length];
    renderControls();
    savePrefs();
  });

  el.auto.addEventListener('click', () => {
    prefs.auto = !prefs.auto;
    stopWait();
    if (phase !== 'typing') paused = false;
    renderControls();
    scheduleAuto();
  });

  function showTab(name) {
    if (phase === 'typing') return;
    const home = steps[index].doc ? DOC : state.active;
    peek = name === home ? null : name;
    renderEditor(true);
    renderTerminal();
  }

  el.tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-file]');
    if (b) showTab(b.dataset.file);
  });

  // 活动栏的「书」：随时打开前置知识，再点一次回到代码
  el.btnNotes.addEventListener('click', () => {
    if (steps[index].doc) return;
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
      else openQuick();
    })
  );
  el.quickList.addEventListener('mouseover', (e) => {
    const b = e.target.closest('[data-style]');
    if (b && b.dataset.style !== quick.style) previewQuick(b.dataset.style);
  });
  el.quickList.addEventListener('click', (e) => {
    const b = e.target.closest('[data-style]');
    if (!b) return;
    previewQuick(b.dataset.style);
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
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (quick) {
      if (e.key === 'Escape') closeQuick(false);
      else if (e.key === 'Enter') closeQuick(true);
      else if (e.key === 'ArrowDown') moveQuick(1);
      else if (e.key === 'ArrowUp') moveQuick(-1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const modes = ['dark', 'light', 'auto'];
        previewQuick(null, modes[(modes.indexOf(quick.mode) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]);
      } else return;
      e.preventDefault();
      return;
    }

    const onControl = e.target instanceof HTMLElement && e.target.closest('button, a');
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      advance();
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (onControl) return; // 交给按钮或链接自己处理，免得触发两次
      e.preventDefault();
      advance();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      back();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePause();
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      openQuick();
    } else if (e.key === 'Escape') {
      setDrawer(false);
    }
  });

  el.code.addEventListener('scroll', updateMiniView, { passive: true });
  window.addEventListener('resize', drawMinimap);

  TH.onChange(() => {
    renderTheme();
    drawMinimap();
    drawFigures();
  });

  /* -------------------------------------------------------------- 启动 */

  buildOutline();
  renderTheme();
  const start = Math.min(Math.max(0, prefs.step | 0), steps.length - 1);
  enter(start, start === 0 ? 'play' : 'show');
})();
