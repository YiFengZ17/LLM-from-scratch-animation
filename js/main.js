/*
 * 路由：按网址决定显示展厅（首页、课程页）还是工作间（编辑器）。
 *
 *   空、#home              首页
 *   #transformer           课程页
 *   #transformer-3         编辑器，第 3 章
 *   #ch3                   旧网址，换成 #transformer-3
 *
 * 浏览器支持 View Transitions 时，页面之间用它过渡；不支持就直接切换。
 */
(function () {
  'use strict';

  const C = window.Catalog;
  const site = document.getElementById('site');
  const app = document.getElementById('app');

  function parse(hash) {
    let h = decodeURIComponent(hash.replace(/^#/, ''));
    const old = /^ch(\d+)$/.exec(h);
    if (old) {
      h = 'transformer-' + old[1];
      try {
        history.replaceState(null, '', '#' + h);
      } catch (e) {
        /* 改不了网址也照样打开 */
      }
    }
    const m = /^(.+)-(\d+)$/.exec(h);
    if (m && C.byId[m[1]] && C.byId[m[1]].chapters.length) return { view: 'editor', course: m[1], chapter: Number(m[2]) - 1 };
    if (C.byId[h] && C.byId[h].chapters.length) return { view: 'course', course: h };
    return { view: 'home' };
  }

  let current = null;

  function show(route) {
    const inSite = route.view !== 'editor';
    document.documentElement.classList.toggle('in-site', inSite);
    if (inSite) {
      if (window.Player.isOpen) window.Player.close();
      app.hidden = true;
      site.hidden = false;
      if (route.view === 'course') window.Site.course(route.course);
      else window.Site.home();
      if (route.view === 'home' && current && current.view !== 'home') window.scrollTo(0, 0);
    } else {
      window.Site.hide();
      site.hidden = true;
      site.innerHTML = '';
      window.Player.open(route.course, route.chapter);
      document.title = C.byId[route.course].title + ' · CPA';
    }
    current = route;
  }

  function route() {
    const next = parse(location.hash);
    // 编辑器里换章由编辑器自己处理，不用整页过渡
    if (current && current.view === 'editor' && next.view === 'editor' && current.course === next.course) {
      window.Player.open(next.course, next.chapter);
      current = next;
      return;
    }
    const swap = () => show(next);
    if (current && document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.startViewTransition(swap);
    } else {
      swap();
    }
  }

  window.addEventListener('hashchange', route);
  route();
})();
