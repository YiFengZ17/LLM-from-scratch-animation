/*
 * 读者的设置和学习进度，存在浏览器的 localStorage 里。编辑器和首页共用这一份。
 *
 *   speed     打字速度
 *   lang      算法题用哪种语言
 *   progress  每门课的进度：{ 课程: { chapter: 上次在第几章, steps: { 章: 上次停在第几页 }, seen: { 章: 最远看到第几页 } } }
 *
 * 存不了（隐私模式、被浏览器禁止）也不影响使用，只是下次打开不记得。
 */
(function (root) {
  'use strict';

  const KEY = 'cpa-v1';
  const OLD_KEY = 'transformer-typing-v3'; // 改名为 CPA 之前，只有 Transformer 一门课时的进度

  const defaults = () => ({ speed: 1, lang: 'python', progress: {} });

  function load() {
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      /* 读不到就用默认值 */
    }
    data = Object.assign(defaults(), data || {});
    if (!data.progress.transformer) {
      try {
        const old = JSON.parse(localStorage.getItem(OLD_KEY));
        if (old && old.steps) {
          data.progress.transformer = { chapter: old.chapter | 0, steps: old.steps, seen: old.seen || {} };
          if (old.speed) data.speed = old.speed;
        }
      } catch (e) {
        /* 没有旧进度 */
      }
    }
    return data;
  }

  const data = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* 存不了也不影响使用 */
    }
  }

  function course(id) {
    return data.progress[id] || (data.progress[id] = { chapter: 0, steps: {}, seen: {} });
  }

  // 一门课看过了几页（按每章最远看到的位置算）
  function seenPages(c) {
    const p = data.progress[c.id];
    if (!p) return 0;
    return c.chapters.reduce((n, ch) => n + Math.min(ch.steps.length, (typeof p.seen[ch.id] === 'number' ? p.seen[ch.id] : -1) + 1), 0);
  }

  // 某一章看过了几页
  function seenInChapter(courseId, chapter) {
    const p = data.progress[courseId];
    const s = p && typeof p.seen[chapter.id] === 'number' ? p.seen[chapter.id] : -1;
    return Math.min(chapter.steps.length, s + 1);
  }

  root.Store = { data, save, course, seenPages, seenInChapter };
})(typeof window !== 'undefined' ? window : globalThis);
