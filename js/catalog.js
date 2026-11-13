/*
 * 课程目录：网站上有哪些板块、哪些课程，每门课有哪些章。
 *
 * 课程脚本（lessons/ 下的文件）用 Catalog.addChapter 把自己登记到某门课里；
 * 首页、课程页、编辑器和校验工具都从这里读数据。
 *
 * 算法课程一道题有五种语言的写法。课程脚本里，随语言变化的字段写成「语言 → 值」的对象，
 * 用 Catalog.resolve(章, 语言) 取出某一种语言的版本，交给播放引擎。
 */
(function (root) {
  'use strict';

  // 支持的编程语言。comment 是这种语言的单行注释符号，「注释」旁白模式会用它。
  const LANGS = {
    python: { id: 'python', name: 'Python', file: 'solution.py', comment: '#' },
    c: { id: 'c', name: 'C', file: 'solution.c', comment: '//' },
    cpp: { id: 'cpp', name: 'C++', file: 'solution.cpp', comment: '//' },
    java: { id: 'java', name: 'Java', file: 'Main.java', comment: '//' },
    rust: { id: 'rust', name: 'Rust', file: 'main.rs', comment: '//' },
  };
  const LANG_IDS = Object.keys(LANGS);

  // 由文件名判断语言，语法高亮和注释符号都按它来
  function langOfFile(name) {
    const ext = (/\.(\w+)$/.exec(name || '') || [])[1];
    return { py: 'python', c: 'c', h: 'c', cpp: 'cpp', cc: 'cpp', java: 'java', rs: 'rust', md: 'md' }[ext] || 'python';
  }

  const BOARDS = [
    { id: 'dl', name: '深度学习', blurb: '从一个空文件开始，逐字写出完整的模型。' },
    { id: 'algo', name: '算法题', blurb: 'The-Summer-of-2026 题单：195 题，按解法分成 16 类。每道题五种语言可选。' },
    { id: 'lang', name: '语言入门', blurb: '每章一个知识点，用一道简单题演示怎么用。' },
  ];

  // 题单里的 16 类：题数和简单、中等、困难的分布按题单原样统计。course 是已经做好的课程。
  const TOPICS = [
    { name: '哈希表与数组', easy: 7, medium: 2, hard: 0 },
    { name: '双指针', easy: 6, medium: 4, hard: 1 },
    { name: '滑动窗口', easy: 3, medium: 3, hard: 1, course: 'sliding-window' },
    { name: '前缀和与前后缀分解', easy: 2, medium: 2, hard: 0 },
    { name: '二分查找', easy: 7, medium: 4, hard: 1 },
    { name: '栈、队列与单调栈', easy: 5, medium: 3, hard: 3 },
    { name: '链表与缓存设计', easy: 8, medium: 6, hard: 0 },
    { name: '二叉树与二叉搜索树', easy: 21, medium: 9, hard: 2 },
    { name: '堆与优先队列', easy: 3, medium: 4, hard: 1 },
    { name: '图论', easy: 5, medium: 7, hard: 0 },
    { name: 'Trie 前缀树', easy: 0, medium: 1, hard: 0 },
    { name: '回溯与枚举', easy: 2, medium: 8, hard: 1 },
    { name: '动态规划', easy: 7, medium: 19, hard: 3, next: true },
    { name: '贪心、排序与区间', easy: 9, medium: 6, hard: 0 },
    { name: '字符串与模拟', easy: 4, medium: 2, hard: 0 },
    { name: '数学与位运算', easy: 13, medium: 0, hard: 0 },
  ];

  // 还在规划中的课程，只在首页上展示
  const PLANNED = [
    {
      id: 'python-intro',
      board: 'lang',
      title: 'Python 入门',
      blurb: '每章一个知识点，用一道简单题演示怎么用。学完可以直接接上算法题。',
      chapters: ['变量与字符串', '条件与循环', '列表与切片', '字符串方法', '字典与集合', '函数与递归', '类与对象', '常用标准库'],
    },
    {
      id: 'c-intro',
      board: 'lang',
      title: 'C 语言入门',
      blurb: '从 gcc 编译第一行代码开始，到指针、结构体、动态内存，最后亲手写一个链表。',
      chapters: ['编译与运行', '变量与运算', '条件与循环', '数组', '函数', '指针', '字符串', '结构体', 'malloc 与 free', '链表'],
    },
  ];

  const courses = [];
  const byId = {};

  function defineCourse(meta) {
    const course = Object.assign({ chapters: [], langs: null, chain: false }, meta);
    courses.push(course);
    byId[course.id] = course;
    return course;
  }

  function addChapter(courseId, lesson) {
    const course = byId[courseId];
    if (!course) throw new Error('还没有定义课程：' + courseId);
    course.chapters.push(lesson);
  }

  // 取某个值在这种语言下的版本：值是「语言 → 值」的对象时取对应的一项，否则原样返回
  function pick(value, lang) {
    if (value && typeof value === 'object' && !Array.isArray(value) && lang && LANG_IDS.some((id) => id in value)) {
      return value[lang];
    }
    return value;
  }

  // 一章在某种语言下的样子：文件、每一步的代码操作和旁白都换成这种语言的版本
  function resolve(lesson, lang) {
    const docBlock = (b) => (b && typeof b === 'object' && b.code ? Object.assign({}, b, { code: pick(b.code, lang) }) : b);
    return Object.assign({}, lesson, {
      lang: lang || null,
      files: pick(lesson.files, lang) || [],
      steps: lesson.steps.map((s) => {
        const say = (s.say || []).concat(pick(s.sayBy, lang) || []);
        return Object.assign({}, s, {
          file: pick(s.file, lang),
          ops: pick(s.ops, lang),
          say: say.map(docBlock),
          doc: s.doc ? s.doc.map(docBlock) : s.doc,
        });
      }),
    });
  }

  // 一门课一共多少页
  const pageCount = (course) => course.chapters.reduce((n, ch) => n + ch.steps.length, 0);

  root.Catalog = {
    LANGS,
    LANG_IDS,
    BOARDS,
    TOPICS,
    PLANNED,
    courses,
    byId,
    langOfFile,
    defineCourse,
    addChapter,
    pick,
    resolve,
    pageCount,
  };
})(typeof window !== 'undefined' ? window : globalThis);
