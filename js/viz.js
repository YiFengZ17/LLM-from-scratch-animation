/*
 * 图形演示：按帧播放的小动画，用来演示算法在样例上一步步怎么走。
 *
 * 课程脚本里写成一个块：
 *   { viz: { kind: 'array', title: '标题', frames: [帧, 帧, ...] } }
 * 帧通常不手写，而是由一个小函数在样例输入上真的跑一遍算法生成（见 lessons/sliding-window/00-course.js）。
 *
 * 数组条（kind: 'array'）的一帧：
 *   cells  格子里的值（数字或字符）
 *   win    窗口 [左端, 右端]，两端都包含；没有窗口时省略
 *   ptrs   指针 { 名字: 下标 }，画在格子下方
 *   marks  { 下标: 'in' | 'out' | 'hit' | 'ok' }：刚进窗口、刚出窗口、出问题的、符合条件的
 *   vars   右侧的变量 [[名字, 值], ...]
 *   note   这一帧的说明，可以用 `代码` 标记
 *
 * DP 表（kind: 'grid'）的一帧：
 *   rows   每一行的名字，比如 ['nums', 'dp']
 *   cols   每一列的名字，通常是下标
 *   cells  二维数组 cells[行][列]，还没算出来的格子写 null
 *   cur    正在算的格子 [行, 列]
 *   deps   它依赖的格子 [[行, 列], ...]
 *   picks  被选中的格子（比如取 max 时赢的那一边）
 *   vars、note  同上
 *
 * 块的 HTML 由 Viz.html 生成，挂到页面上之后调用 Viz.mount(容器) 让按钮生效。
 * 帧之间只改类名和 CSS 变量，窗口和指针的移动由 CSS 过渡完成。
 */
(function (root) {
  'use strict';

  const specs = new Map(); // 编号 → 演示的定义
  let nextId = 1;
  const STEP_MS = 1300; // 自动播放时每帧停多久

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESC[c]);
  const md = (s) =>
    String(s)
      .split('`')
      .map((part, i) => (i % 2 ? '<code>' + esc(part) + '</code>' : esc(part)))
      .join('');

  function framesOf(spec) {
    return spec.frames || [];
  }

  // 自动播放整段演示需要多久
  function duration(spec) {
    return framesOf(spec).length * STEP_MS;
  }

  function html(spec, size) {
    const id = nextId++;
    specs.set(id, spec);
    const frames = framesOf(spec);
    let stage;
    let style;
    if (spec.kind === 'grid') {
      // 表格：左上角空着，第一行是列名，第一列是行名
      const first = frames[0];
      const nr = first.rows.length;
      const nc = first.cols.length;
      let cells = '<span class="viz-gh"></span>' + first.cols.map((c) => '<span class="viz-gh">' + esc(c) + '</span>').join('');
      for (let r = 0; r < nr; r++) {
        cells += '<span class="viz-gr">' + esc(first.rows[r]) + '</span>';
        for (let c = 0; c < nc; c++) cells += '<span class="viz-gc" data-r="' + r + '" data-c="' + c + '"><b></b></span>';
      }
      stage = '<div class="viz-stage"><div class="viz-grid" aria-hidden="true">' + cells + '</div></div>';
      style = '--n:' + (nc + 1) + ';--cols:' + nc;
    } else {
      const n = Math.max(...frames.map((f) => (f.cells || []).length), 1);
      const cells = Array.from({ length: n }, (_, i) => '<div class="viz-cell" data-i="' + i + '"><span></span></div>').join('');
      const idx = Array.from({ length: n }, (_, i) => '<span>' + i + '</span>').join('');
      stage =
        '<div class="viz-stage">' +
        '<div class="viz-row"><div class="viz-win" aria-hidden="true"></div>' + cells + '</div>' +
        '<div class="viz-idx" aria-hidden="true">' + idx + '</div>' +
        '<div class="viz-ptrs" aria-hidden="true"></div></div>';
      style = '--n:' + n;
    }
    return (
      '<figure class="viz viz-' + (size || 'large') + (spec.kind === 'grid' ? ' viz-is-grid' : '') + '" data-viz="' + id + '" style="' + style + '">' +
      '<figcaption class="viz-head"><span class="viz-title">' + esc(spec.title || '演示') + '</span>' +
      '<span class="viz-count" aria-live="polite"></span></figcaption>' +
      '<div class="viz-body">' + stage +
      '<dl class="viz-vars"></dl></div>' +
      '<p class="viz-note"></p>' +
      '<div class="viz-ctrl">' +
      '<button type="button" data-act="first" aria-label="第一帧">⏮</button>' +
      '<button type="button" data-act="prev" aria-label="上一帧">◀</button>' +
      '<button type="button" data-act="play" class="viz-play" aria-label="播放">播放</button>' +
      '<button type="button" data-act="next" aria-label="下一帧">▶</button>' +
      '<span class="viz-bar"><i></i></span></div>' +
      '</figure>'
    );
  }

  // DP 表的一帧：填上已经算出来的值，标出正在算的格子和它依赖的格子
  function showGrid(fig, f, prev) {
    const has = (list, r, c) => (list || []).some((p) => p[0] === r && p[1] === c);
    fig.querySelectorAll('.viz-gc').forEach((cell) => {
      const r = Number(cell.dataset.r);
      const c = Number(cell.dataset.c);
      const v = f.cells[r] ? f.cells[r][c] : null;
      const before = prev && prev.cells[r] ? prev.cells[r][c] : null;
      const filled = v !== null && v !== undefined && v !== '';
      cell.querySelector('b').textContent = filled ? String(v) : '';
      let cls = 'viz-gc' + (filled ? ' is-filled' : '');
      if (f.cur && f.cur[0] === r && f.cur[1] === c) cls += ' is-cur';
      if (has(f.deps, r, c)) cls += ' is-dep';
      if (has(f.picks, r, c)) cls += ' is-pick';
      if (filled && String(v) !== String(before)) cls += ' is-new';
      cell.className = cls;
    });
  }

  // 把第 k 帧画到 fig 上
  function show(fig, k) {
    const spec = specs.get(Number(fig.dataset.viz));
    const frames = framesOf(spec);
    k = Math.max(0, Math.min(frames.length - 1, k));
    const prevK = Number(fig.dataset.frame);
    fig.dataset.frame = k;
    const f = frames[k];
    if (spec.kind === 'grid') {
      // 只有往后走一帧时才让新填的格子闪一下，跳着看时不闪
      showGrid(fig, f, prevK === k - 1 ? frames[prevK] : f);
      showCommon(fig, f, k, frames.length);
      return;
    }
    const cells = f.cells || [];

    fig.querySelectorAll('.viz-cell').forEach((c, i) => {
      const has = i < cells.length;
      c.querySelector('span').textContent = has ? String(cells[i]) : '';
      c.className = 'viz-cell' + (has ? '' : ' is-empty') + (f.win && i >= f.win[0] && i <= f.win[1] ? ' is-win' : '') + (f.marks && f.marks[i] ? ' is-' + f.marks[i] : '');
    });

    const win = fig.querySelector('.viz-win');
    if (f.win && f.win[1] >= f.win[0]) {
      fig.style.setProperty('--l', f.win[0]);
      fig.style.setProperty('--w', f.win[1] - f.win[0] + 1);
      win.classList.remove('is-hidden');
    } else {
      if (f.win) fig.style.setProperty('--l', f.win[0]);
      fig.style.setProperty('--w', 0);
      win.classList.add('is-hidden');
    }

    // 指针：同一个格子下的多个指针往下错开
    const ptrs = fig.querySelector('.viz-ptrs');
    const entries = Object.entries(f.ptrs || {});
    const seen = {};
    const html = entries
      .map(([name, i]) => {
        const row = (seen[i] = (seen[i] || 0) + 1) - 1;
        return '<span class="viz-ptr" data-name="' + esc(name) + '" style="--i:' + i + ';--row:' + row + '">▲<b>' + esc(name) + '</b></span>';
      })
      .join('');
    // 指针名字不变时只改位置，这样能看到它们滑过去
    const old = [...ptrs.children].map((p) => p.dataset.name).join(',');
    if (old === entries.map((e) => e[0]).join(',')) {
      [...ptrs.children].forEach((p, j) => {
        const [, i] = entries[j];
        const row = entries.slice(0, j).filter((e) => e[1] === i).length;
        p.style.setProperty('--i', i);
        p.style.setProperty('--row', row);
      });
    } else {
      ptrs.innerHTML = html;
    }
    fig.style.setProperty('--rows', Math.max(1, ...Object.values(seen)));
    showCommon(fig, f, k, frames.length);
  }

  // 两种画法共用的部分：变量、说明、帧号、按钮
  function showCommon(fig, f, k, total) {
    fig.querySelector('.viz-vars').innerHTML = (f.vars || []).map(([name, v]) => '<div><dt>' + esc(name) + '</dt><dd>' + esc(v) + '</dd></div>').join('');
    fig.querySelector('.viz-note').innerHTML = md(f.note || '');
    fig.querySelector('.viz-count').textContent = k + 1 + ' / ' + total;
    fig.querySelector('.viz-bar i').style.width = ((k + 1) / total) * 100 + '%';
    fig.querySelector('[data-act="prev"]').disabled = k === 0;
    fig.querySelector('[data-act="first"]').disabled = k === 0;
    fig.querySelector('[data-act="next"]').disabled = k === total - 1;
  }

  function stop(fig) {
    clearTimeout(fig._timer);
    fig._timer = null;
    fig.classList.remove('is-playing');
    const b = fig.querySelector('.viz-play');
    b.textContent = '播放';
    b.setAttribute('aria-label', '播放');
  }

  // 从当前帧（在最后一帧时从头）自动往后播，播完停下
  function play(fig) {
    const total = framesOf(specs.get(Number(fig.dataset.viz))).length;
    let k = Number(fig.dataset.frame || 0);
    if (k >= total - 1) {
      k = 0;
      show(fig, 0);
    }
    fig.classList.add('is-playing');
    const b = fig.querySelector('.viz-play');
    b.textContent = '暂停';
    b.setAttribute('aria-label', '暂停');
    const tick = () => {
      k++;
      if (k >= total) return stop(fig);
      show(fig, k);
      fig._timer = setTimeout(tick, STEP_MS);
    };
    fig._timer = setTimeout(tick, STEP_MS);
  }

  function mount(container) {
    container.querySelectorAll('.viz[data-viz]').forEach((fig) => {
      if (fig._mounted) return;
      fig._mounted = true;
      show(fig, 0);
      fig.querySelector('.viz-ctrl').addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const k = Number(fig.dataset.frame || 0);
        const act = b.dataset.act;
        if (act === 'play') return fig.classList.contains('is-playing') ? stop(fig) : play(fig);
        stop(fig);
        show(fig, act === 'first' ? 0 : act === 'prev' ? k - 1 : k + 1);
      });
    });
  }

  // 自动播放模式：容器里的演示从头播一遍
  function autoplay(container) {
    container.querySelectorAll('.viz[data-viz]').forEach((fig) => {
      stop(fig);
      show(fig, 0);
      play(fig);
    });
  }

  function stopAll(container) {
    container.querySelectorAll('.viz.is-playing').forEach(stop);
  }

  // 一组块里所有演示加起来要播多久
  function durationOf(blocks) {
    return (blocks || []).reduce((ms, b) => ms + (b && b.viz ? duration(b.viz) : 0), 0);
  }

  root.Viz = { html, mount, autoplay, stopAll, duration, durationOf, STEP_MS };
})(typeof window !== 'undefined' ? window : globalThis);
