/*
 * 播放器：把引擎算出来的状态画到页面上，并处理翻页。
 *
 * 一页（一步）有三个阶段：
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
  const $ = (id) => document.getElementById(id);

  const el = {
    app: $('app'),
    chapter: $('chapter-name'),
    count: $('step-count'),
    outline: $('outline'),
    sidebar: $('sidebar'),
    scrim: $('scrim'),
    btnOutline: $('btn-outline'),
    tabs: $('tabs'),
    code: $('code'),
    terminal: $('terminal'),
    termBody: $('term-body'),
    narrScroll: $('narr-scroll'),
    narrSection: $('narr-section'),
    narrCount: $('narr-count'),
    narrTitle: $('narr-title'),
    narrBody: $('narr-body'),
    back: $('btn-back'),
    go: $('btn-go'),
    goLabel: $('btn-go-label'),
    fill: $('btn-fill'),
    statusFile: $('status-file'),
    statusPos: $('status-pos'),
    speed: $('btn-speed'),
    auto: $('btn-auto'),
  };

  const SPEEDS = [0.5, 0.75, 1, 1.5, 2];
  const STORE_KEY = 'transformer-typing-v1';
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lesson = window.LESSONS[0];
  const steps = lesson.steps;

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
  prefs.auto = false; // 自动播放每次打开都从「关」开始，免得页面自己动起来吓人一跳

  let index = 0;
  let state = null;
  let gen = null;
  let phase = 'done';
  let timer = null; // 打字的定时器
  let waitTimer = null; // 自动播放的等待定时器
  let peek = null; // 读者点了别的文件标签，临时查看
  let lineCache = [];

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
      localStorage.setItem(STORE_KEY, JSON.stringify(prefs));
    } catch (e) {
      /* 存不了也不影响使用 */
    }
  }

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ESC[c]);

  // 旁白的简易标记：`代码`、**加粗**，其余 HTML 原样保留
  function md(s) {
    return s
      .split('`')
      .map((part, i) => (i % 2 ? '<code>' + esc(part) + '</code>' : part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')))
      .join('');
  }

  function plainLength(step) {
    let n = 0;
    for (const item of step.say || []) {
      if (typeof item === 'string') n += item.replace(/<[^>]+>|[`*]/g, '').length;
      else if (item.formula) n += 30;
      else n += 12;
    }
    return n;
  }

  /* -------------------------------------------------------------- 旁白 */

  function blockHTML(item) {
    if (typeof item === 'string') return '<p>' + md(item) + '</p>';

    if (item.shape) {
      const chips = item.shape.map((s) => '<code>' + esc(s) + '</code>').join('<span class="shape-arrow" aria-label="变成">→</span>');
      return '<div class="shape"><span class="shape-label">' + esc(item.label || '形状') + '</span>' + chips + '</div>';
    }

    if (item.formula) {
      return '<div class="formula">' + item.formula.map((f) => '<div>' + f + '</div>').join('') + '</div>';
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

  function renderNarration() {
    const step = steps[index];
    const count = index + 1 + ' / ' + steps.length;
    el.narrSection.textContent = step.section;
    el.narrCount.textContent = count;
    el.count.textContent = count;
    el.narrTitle.textContent = step.title;
    el.narrBody.innerHTML = (step.say || []).map(blockHTML).join('');
    el.narrScroll.scrollTop = 0;
  }

  /* -------------------------------------------------------------- 目录 */

  function buildOutline() {
    let html = '';
    let section = null;
    steps.forEach((step, i) => {
      if (step.section !== section) {
        if (section !== null) html += '</ol></li>';
        section = step.section;
        html += '<li><div class="outline-section">' + esc(section) + '</div><ol>';
      }
      html += '<li><button class="outline-step" type="button" data-step="' + i + '">' + esc(step.title) + '</button></li>';
    });
    el.outline.innerHTML = html + '</ol></li>';
    el.outline.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      enter(Number(b.dataset.step), 'show');
      setOutlineOpen(false);
    });
  }

  function renderOutline() {
    el.outline.querySelectorAll('[data-step]').forEach((b) => {
      const i = Number(b.dataset.step);
      b.classList.toggle('is-seen', i < index);
      if (i === index) {
        b.setAttribute('aria-current', 'step');
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
  }

  function setOutlineOpen(open) {
    el.app.classList.toggle('is-outline-open', open);
    el.btnOutline.setAttribute('aria-expanded', String(open));
  }

  /* ------------------------------------------------------------ 编辑器 */

  const CURSOR = '<span class="cur"></span>';

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
        const cls = (tok.c ? 't-' + tok.c : '') + (selected ? ' sel' : '');
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
    const name = peek || state.active;
    const text = state.files[name] || '';
    const isActive = name === state.active;
    const cursor = isActive ? state.cursor[name] : -1;
    const sel = state.sel && state.sel.file === name ? state.sel : null;
    const marks = state.marks[name] || [];
    const tokens = H.tokenize(text);
    const rawLines = text.split('\n');

    let offset = 0;
    let curLine = 0;
    let curCol = 0;
    const next = [];

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
      if (hasCursor) cls += ' is-cur';
      const indent = raw.length - raw.trimStart().length;
      if (raw.length) {
        for (const [s, e] of marks) {
          if (s < le && e > ls) {
            cls += s <= ls + indent && e >= le ? ' is-add' : ' is-mod';
            break;
          }
        }
      }

      const body = lineHTML(
        tokens[i] || [],
        hasCursor ? cursor - ls : -1,
        sel ? Math.max(sel.from, ls) - ls : 0,
        sel ? Math.min(sel.to, le) - ls : 0
      );
      next.push('<div class="' + cls + '"><span class="ln">' + (i + 1) + '</span><span class="lc" style="--ind:' + indent + '">' + body + '</span></div>');
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

    el.code.classList.toggle('is-idle', phase !== 'typing');
    el.statusFile.textContent = name;
    el.statusPos.textContent = isActive ? '行 ' + (curLine + 1) + '，列 ' + (curCol + 1) : '';

    renderTabs(name);
    followCursor(instant);
  }

  // 让光标所在的行保持在视野中间偏上的位置
  function followCursor(instant) {
    const cur = el.code.querySelector('.cur');
    if (!cur) return;
    const view = el.code;
    const y = cur.offsetTop;
    const h = view.clientHeight;
    if (y < view.scrollTop + h * 0.12 || y > view.scrollTop + h * 0.68) {
      view.scrollTo({ top: Math.max(0, y - h * 0.4), behavior: instant || reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function renderTabs(shown) {
    const html = state.order
      .map((n) => '<button class="tab" type="button" role="tab" data-file="' + esc(n) + '" aria-selected="' + (n === shown) + '">' + esc(n) + '</button>')
      .join('');
    if (el.tabs.dataset.html !== html) {
      el.tabs.innerHTML = html;
      el.tabs.dataset.html = html;
    }
  }

  function renderTerminal() {
    const t = state.term;
    el.terminal.hidden = !t;
    if (!t) return;
    let html = '<div><span class="term-prompt">$ </span>' + esc(t.cmd) + (t.lines.length || t.done ? '' : CURSOR) + '</div>';
    for (const line of t.lines) html += '<div class="term-out">' + esc(line) + '</div>';
    el.termBody.innerHTML = html;
    el.terminal.scrollTop = el.terminal.scrollHeight;
  }

  /* -------------------------------------------------------------- 控件 */

  function renderControls() {
    const last = index === steps.length - 1;
    el.back.disabled = index === 0;
    el.go.dataset.phase = phase;
    el.goLabel.textContent = phase === 'reading' ? '开始写代码' : phase === 'typing' ? '直接看结果' : last ? '从头再看' : '下一步';
    el.speed.textContent = '打字速度 ' + prefs.speed + '×';
    el.auto.textContent = '自动播放 ' + (prefs.auto ? '开' : '关');
    el.auto.setAttribute('aria-pressed', String(prefs.auto));
  }

  function renderAll(instant) {
    el.chapter.textContent = '第 1 章　' + lesson.title;
    renderEditor(instant);
    renderTerminal();
    renderControls();
  }

  /* -------------------------------------------------------------- 流程 */

  function stopTimers() {
    clearTimeout(timer);
    clearTimeout(waitTimer);
    timer = waitTimer = null;
    el.fill.style.transition = 'none';
    el.fill.style.transform = 'scaleX(0)';
  }

  // 自动播放时的等待：按钮上有一条进度，走完就执行 then
  function wait(ms, then) {
    clearTimeout(waitTimer);
    el.fill.style.transition = 'none';
    el.fill.style.transform = 'scaleX(0)';
    void el.fill.offsetWidth;
    el.fill.style.transition = 'transform ' + ms + 'ms linear';
    el.fill.style.transform = 'scaleX(1)';
    waitTimer = setTimeout(then, ms);
  }

  function scheduleAuto() {
    if (!prefs.auto) return;
    if (phase === 'reading') {
      // 按旁白的字数估一个阅读时间，大约每秒 7 个字
      wait(Math.min(24000, Math.max(3500, plainLength(steps[index]) * 140)), startTyping);
    } else if (phase === 'done' && index < steps.length - 1) {
      const hasCode = (steps[index].ops || []).length > 0;
      wait(hasCode ? 2600 : Math.min(24000, Math.max(3500, plainLength(steps[index]) * 140)), advance);
    }
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

  /* -------------------------------------------------------------- 事件 */

  el.go.addEventListener('click', advance);
  el.back.addEventListener('click', back);

  el.speed.addEventListener('click', () => {
    prefs.speed = SPEEDS[(SPEEDS.indexOf(prefs.speed) + 1) % SPEEDS.length];
    renderControls();
    savePrefs();
  });

  el.auto.addEventListener('click', () => {
    prefs.auto = !prefs.auto;
    if (phase !== 'typing') {
      clearTimeout(waitTimer);
      el.fill.style.transition = 'none';
      el.fill.style.transform = 'scaleX(0)';
    }
    renderControls();
    savePrefs();
    scheduleAuto();
  });

  el.tabs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-file]');
    if (!b || phase === 'typing') return;
    peek = b.dataset.file === state.active ? null : b.dataset.file;
    renderEditor(true);
  });

  el.btnOutline.addEventListener('click', () => setOutlineOpen(!el.app.classList.contains('is-outline-open')));
  el.scrim.addEventListener('click', () => setOutlineOpen(false));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const onButton = e.target instanceof HTMLElement && e.target.closest('button');
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      advance();
    } else if (e.key === ' ' || e.key === 'Enter') {
      if (onButton) return; // 交给按钮自己处理，免得触发两次
      e.preventDefault();
      advance();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      back();
    } else if (e.key === 'Escape') {
      setOutlineOpen(false);
    }
  });

  /* -------------------------------------------------------------- 启动 */

  buildOutline();
  const start = Math.min(Math.max(0, prefs.step | 0), steps.length - 1);
  enter(start, start === 0 ? 'play' : 'show');
})();
