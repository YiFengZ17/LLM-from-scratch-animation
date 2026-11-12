/*
 * 颜色主题。
 *
 * 两个互相独立的选择：
 *   风格（style）：VS Code、GitHub、One、Solarized、Tokyo Night、Catppuccin
 *   亮暗（mode） ：dark / light / auto（跟随系统）
 * 每种风格都有深色和浅色两套配色，配色参照同名的编辑器主题。
 *
 * 一套配色就是一组 CSS 变量，切换时直接写到 <html> 上。
 * 这个文件在页面内容之前加载，所以第一帧就是读者上次选的主题。
 */
(function (root) {
  'use strict';

  const KEYS = [
    // 窗口
    'titlebar', 'titlebar-fg', 'activity', 'activity-fg', 'side', 'ed', 'tabs', 'tab-idle', 'tab-line', 'status', 'status-fg',
    // 文字与线条
    'fg', 'strong', 'muted', 'rule', 'accent', 'btn', 'btn-fg', 'active', 'active-fg', 'widget',
    // 编辑器
    'cursor', 'sel', 'line-hl', 'ln', 'ln-active', 'code', 'inline', 'added', 'changed',
    // 语法
    's-kw', 's-kw2', 's-fn', 's-cls', 's-str', 's-num', 's-com', 's-var', 's-prop', 's-self', 's-op',
    // 图表里的暖色和冷色
    'warm', 'cool',
  ];

  // 按 KEYS 的顺序写一串颜色
  const skin = (name, italic, colors) => {
    const list = colors.trim().split(/\s+/);
    if (list.length !== KEYS.length) throw new Error('主题 ' + name + ' 的颜色数量不对：' + list.length);
    const t = {};
    KEYS.forEach((k, i) => (t[k] = list[i]));
    return { name, italic, t };
  };

  const families = [
    {
      id: 'vscode',
      name: 'VS Code',
      dark: skin('Dark+', false, `
        #3c3c3c #cccccc #333333 #ffffff #252526 #1e1e1e #252526 #2d2d2d transparent #007acc #ffffff
        #cccccc #e7e7e7 #969696 #333333 #3794ff #0e639c #ffffff #094771 #ffffff #252526
        #aeafad #264f78 #282828 #858585 #c6c6c6 #d4d4d4 #d7ba7d #2ea043 #1b81a8
        #c586c0 #569cd6 #dcdcaa #4ec9b0 #ce9178 #b5cea8 #6a9955 #9cdcfe #9cdcfe #569cd6 #d4d4d4
        #ce9178 #569cd6`),
      light: skin('Light+', false, `
        #dddddd #333333 #2c2c2c #ffffff #f3f3f3 #ffffff #f3f3f3 #ececec transparent #007acc #ffffff
        #3b3b3b #1f1f1f #6c6c6c #e0e0e0 #006ab1 #007acc #ffffff #0060c0 #ffffff #f3f3f3
        #000000 #add6ff #f5f5f5 #237893 #0b216f #000000 #a31515 #2da44e #2090d3
        #af00db #0000ff #795e26 #267f99 #a31515 #098658 #008000 #001080 #001080 #0000ff #000000
        #c4501b #1f6fd0`),
    },
    {
      id: 'github',
      name: 'GitHub',
      dark: skin('GitHub Dark', false, `
        #010409 #c9d1d9 #0d1117 #e6edf3 #010409 #0d1117 #010409 #010409 #f78166 #0d1117 #c9d1d9
        #c9d1d9 #f0f6fc #8b949e #30363d #58a6ff #238636 #ffffff #2b3139 #f0f6fc #161b22
        #58a6ff #234a7d #161b22 #6e7681 #e6edf3 #e6edf3 #79c0ff #3fb950 #d29922
        #ff7b72 #ff7b72 #d2a8ff #ffa657 #a5d6ff #79c0ff #8b949e #e6edf3 #79c0ff #79c0ff #ff7b72
        #ffa657 #58a6ff`),
      light: skin('GitHub Light', false, `
        #f6f8fa #1f2328 #f6f8fa #1f2328 #f6f8fa #ffffff #f6f8fa #f6f8fa #fd8c73 #f6f8fa #57606a
        #24292f #1f2328 #656d76 #d0d7de #0969da #1f883d #ffffff #e4e8ec #1f2328 #ffffff
        #0969da #bbdfff #f3f5f7 #8c959f #1f2328 #1f2328 #0550ae #1a7f37 #9a6700
        #cf222e #cf222e #8250df #953800 #0a3069 #0550ae #6e7781 #1f2328 #0550ae #0550ae #cf222e
        #bc4c00 #0969da`),
    },
    {
      id: 'one',
      name: 'One',
      dark: skin('One Dark Pro', true, `
        #21252b #9da5b4 #282c34 #d7dae0 #21252b #282c34 #21252b #21252b transparent #21252b #9da5b4
        #abb2bf #d7dae0 #7f848e #181a1f #528bff #4d78cc #ffffff #2c313a #d7dae0 #21252b
        #528bff #3e4451 #2c313c #5c6370 #abb2bf #abb2bf #e5c07b #98c379 #61afef
        #c678dd #c678dd #61afef #e5c07b #98c379 #d19a66 #7f848e #abb2bf #e06c75 #e5c07b #56b6c2
        #d19a66 #61afef`),
      light: skin('One Light', true, `
        #eaeaeb #383a42 #fafafa #383a42 #eaeaeb #fafafa #eaeaeb #eaeaeb transparent #eaeaeb #424243
        #383a42 #232324 #696c77 #dbdbdc #526fff #5871ef #ffffff #dbdbdc #232324 #f2f2f2
        #526fff #d7d8dc #f0f0f1 #9d9d9f #383a42 #383a42 #986801 #50a14f #4078f2
        #a626a4 #a626a4 #4078f2 #c18401 #50a14f #986801 #7f8189 #383a42 #e45649 #c18401 #0184bc
        #e45649 #4078f2`),
    },
    {
      id: 'solarized',
      name: 'Solarized',
      dark: skin('Solarized Dark', true, `
        #002c39 #93a1a1 #003847 #93a1a1 #00212b #002b36 #004052 #004052 transparent #00212b #93a1a1
        #93a1a1 #eee8d5 #6c8289 #073642 #2aa198 #2aa198 #002b36 #005a6f #eee8d5 #00212b
        #839496 #274642 #073642 #586e75 #93a1a1 #839496 #b58900 #859900 #268bd2
        #859900 #93a1a1 #268bd2 #cb4b16 #2aa198 #d33682 #657b83 #839496 #839496 #268bd2 #859900
        #cb4b16 #268bd2`),
      light: skin('Solarized Light', true, `
        #eee8d5 #586e75 #ddd6c1 #584c27 #eee8d5 #fdf6e3 #d9d2c2 #d3cbb7 transparent #eee8d5 #586e75
        #586e75 #073642 #63797f #ddd6c1 #268bd2 #2aa198 #002b36 #dfca88 #073642 #eee8d5
        #657b83 #e3dcc6 #eee8d5 #93a1a1 #586e75 #657b83 #cb4b16 #859900 #268bd2
        #859900 #586e75 #268bd2 #cb4b16 #2aa198 #d33682 #839496 #657b83 #657b83 #268bd2 #859900
        #cb4b16 #268bd2`),
    },
    {
      id: 'tokyo',
      name: 'Tokyo Night',
      dark: skin('Tokyo Night', true, `
        #16161e #787c99 #16161e #a9b1d6 #16161e #1a1b26 #16161e #16161e #3d59a1 #16161e #787c99
        #a9b1d6 #c0caf5 #787c99 #101014 #7aa2f7 #3d59a1 #ffffff #202330 #c0caf5 #1f2335
        #c0caf5 #283457 #1e202e #565c7e #737aa2 #a9b1d6 #7dcfff #449dab #6183bb
        #bb9af7 #bb9af7 #7aa2f7 #2ac3de #9ece6a #ff9e64 #6b74a3 #c0caf5 #7dcfff #f7768e #89ddff
        #ff9e64 #7aa2f7`),
      light: skin('Tokyo Night Light', true, `
        #d6d8df #363c4d #d6d8df #363c4d #d6d8df #e6e7ed #d6d8df #d6d8df #2959aa #d6d8df #363c4d
        #343b59 #23283d #5f6272 #c1c2c7 #2959aa #2959aa #ffffff #c5c7d0 #23283d #dcdee3
        #363c4d #c9cce0 #dcdee3 #8a8d99 #40434f #343b58 #0f4b6e #33635c #2959aa
        #65359d #65359d #2959aa #0f4b6e #385f0d #965027 #7a7d87 #343b58 #006c86 #8c4351 #006c86
        #965027 #2959aa`),
    },
    {
      id: 'catppuccin',
      name: 'Catppuccin',
      dark: skin('Catppuccin Mocha', true, `
        #181825 #cdd6f4 #11111b #cdd6f4 #181825 #1e1e2e #181825 #181825 #cba6f7 #11111b #cdd6f4
        #bac2de #cdd6f4 #7f849c #313244 #cba6f7 #cba6f7 #11111b #313244 #cdd6f4 #181825
        #f5e0dc #414459 #2a2b3c #7f849c #b4befe #cdd6f4 #fab387 #a6e3a1 #f9e2af
        #cba6f7 #cba6f7 #89b4fa #f9e2af #a6e3a1 #fab387 #9399b2 #cdd6f4 #b4befe #f38ba8 #89dceb
        #fab387 #89b4fa`),
      light: skin('Catppuccin Latte', true, `
        #e6e9ef #4c4f69 #dce0e8 #4c4f69 #e6e9ef #eff1f5 #e6e9ef #e6e9ef #8839ef #dce0e8 #4c4f69
        #5c5f77 #4c4f69 #6c6f85 #ccd0da #8839ef #8839ef #eff1f5 #ccd0da #4c4f69 #e6e9ef
        #dc8a78 #c5c9d6 #e3e6ed #8c8fa1 #7287fd #4c4f69 #fe640b #40a02b #df8e1d
        #8839ef #8839ef #1e66f5 #df8e1d #40a02b #fe640b #7c7f93 #4c4f69 #7287fd #d20f39 #04a5e5
        #fe640b #1e66f5`),
    },
  ];

  const STORE_KEY = 'transformer-typing-theme';
  const hasDOM = typeof document !== 'undefined';
  const media = hasDOM && root.matchMedia ? root.matchMedia('(prefers-color-scheme: light)') : null;
  const listeners = [];

  let choice = { style: 'vscode', mode: 'dark' };
  if (hasDOM) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (saved && families.some((f) => f.id === saved.style) && ['dark', 'light', 'auto'].includes(saved.mode)) choice = saved;
    } catch (e) {
      /* 读不到就用默认主题 */
    }
  }

  // 「跟随系统」时：宿主页面明确指定了亮暗就听它的，否则看系统设置
  function resolved(mode) {
    const m = mode || choice.mode;
    if (m !== 'auto') return m;
    const host = hasDOM ? document.documentElement.getAttribute('data-theme') : null;
    if (host === 'dark' || host === 'light') return host;
    return media && media.matches ? 'light' : 'dark';
  }

  const family = (id) => families.find((f) => f.id === (id || choice.style));
  const current = () => family()[resolved()];

  function apply(animate) {
    if (!hasDOM) return;
    const el = document.documentElement;
    const mode = resolved();
    const s = current();
    if (animate) {
      el.classList.add('theme-fade');
      clearTimeout(apply.timer);
      apply.timer = setTimeout(() => el.classList.remove('theme-fade'), 320);
    }
    for (const k of KEYS) el.style.setProperty('--' + k, s.t[k]);
    el.style.setProperty('--com-style', s.italic ? 'italic' : 'normal');
    el.style.setProperty('--shadow', mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(30, 35, 50, 0.2)');
    el.style.colorScheme = mode;
    el.dataset.mode = mode;
    listeners.forEach((fn) => fn());
  }

  // save 为 false 时只是预览，不记住
  function set(style, mode, save) {
    choice = { style: style || choice.style, mode: mode || choice.mode };
    if (save !== false) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(choice));
      } catch (e) {
        /* 存不了也不影响使用 */
      }
    }
    apply(true);
  }

  if (hasDOM) {
    apply(false);
    const follow = () => choice.mode === 'auto' && apply(true);
    if (media && media.addEventListener) media.addEventListener('change', follow);
    if (root.MutationObserver) new MutationObserver(follow).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  root.Themes = {
    families,
    keys: KEYS,
    get: () => ({ style: choice.style, mode: choice.mode }),
    set,
    resolved,
    family,
    current,
    onChange: (fn) => listeners.push(fn),
  };
})(typeof window !== 'undefined' ? window : globalThis);
