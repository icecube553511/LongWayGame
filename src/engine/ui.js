/* 界面层：标题画面、章节选择、回想、存档、设置、系统菜单、结算
 * 所有权：engine。画廊/图鉴/档案在 src/engine/gallery.js。
 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});
  var el, ov, ovTarget, stack = [];

  function $(id) { return document.getElementById(id); }
  function make(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  el = make;

  /* 章末卡与结算页是 sticky 覆盖层：引擎的全局 keydown 会吞掉除 Esc 之外的所有键。
   * 所以这里自己接一次 Space / Enter，让键盘玩家也能往下走。
   * 离场时必须解绑，否则这个监听会一直吞掉后续章节的空格键。 */
  function bindPrimaryKey(fn) {
    function onKey(ev) {
      if (ev.key !== ' ' && ev.key !== 'Enter') return;
      ev.preventDefault();
      unbind();
      fn();
    }
    function unbind() { document.removeEventListener('keydown', onKey, true); }
    document.addEventListener('keydown', onKey, true);
    return unbind;
  }

  function manifest() { return (window.STORY && window.STORY.__manifest) || []; }
  function chapterArr() {
    return manifest().map(function (m) {
      return { meta: m, story: (window.STORY && window.STORY[m.id]) || null };
    });
  }
  function progressOf(id) { return VN.G.progress[id] || null; }

  /* ---------- 覆盖层栈 ---------- */
  function open(opts) {
    opts = opts || {};
    if (!ovTarget) ovTarget = $('overlay');
    ovTarget.classList.remove('hidden');
    var root = make('div', 'ov' + (opts.cls ? ' ' + opts.cls : ''));
    var head = make('div', 'ov-head');
    var title = make('div', 'ov-title serif', opts.title || '');
    head.appendChild(title);
    if (opts.sub) head.appendChild(make('div', 'ov-sub', opts.sub));
    if (!opts.noClose) {
      var close = make('button', 'ov-close', opts.closeText || '返回  ESC');
      close.addEventListener('click', function () { closeTop(); });
      head.appendChild(close);
    }
    root.appendChild(head);
    var body = make('div', 'ov-body');
    root.appendChild(body);
    ovTarget.appendChild(root);
    var entry = { root: root, body: body, sticky: !!opts.sticky, onClose: opts.onClose || null, kind: opts.kind || 'menu' };
    stack.push(entry);
    if (VN.setOverlayOpen) VN.setOverlayOpen(true);
    return entry;
  }
  function closeTop() {
    var top = stack[stack.length - 1];
    if (!top || top.sticky) return;
    stack.pop();
    if (top.root.parentNode) top.root.parentNode.removeChild(top.root);
    if (top.onClose) top.onClose();
    if (!stack.length && ovTarget) ovTarget.classList.add('hidden');
    if (VN.setOverlayOpen) VN.setOverlayOpen(stack.length > 0);
    if (VN.audio && VN.audio.sfx) VN.audio.sfx('click');
  }
  function closeAll() {
    var closing = stack;
    stack = [];
    closing.forEach(function (s) {
      if (s.root.parentNode) s.root.parentNode.removeChild(s.root);
      /* 覆盖层被整体关掉时（例如引擎直接 VN.start 下一章）也必须走一遍 onClose，
       * 否则在 onClose 里解绑键盘监听的覆盖层会留下悬挂监听，
       * 之后那个监听还会继续吞掉空格并重启章节。 */
      if (s.onClose) { try { s.onClose(); } catch (e) { /* 清理失败不该拖垮界面 */ } }
    });
    if (ovTarget) ovTarget.classList.add('hidden');
    if (VN.setOverlayOpen) VN.setOverlayOpen(false);
  }
  function isModalOpen() { return stack.length > 0; }

  /* ---------- 标题画面 ---------- */
  function showTitle() {
    closeAll();
    var entry = open({ title: '', noClose: true, sticky: true, cls: 'title-screen', kind: 'title' });
    var root = entry.root;
    entry.body.style.padding = '0';
    entry.body.style.overflow = 'hidden';
    var headEl = root.querySelector('.ov-head');
    if (headEl) headEl.style.display = 'none';
    /* 标题画面装饰：用美术构建产物里实际存在的几何母题拼出远景（缺图自动隐藏） */
    [['vignette_soft', 'tl-vig'], ['cloud_motif', 'tl-cloud'], ['mountain_motif', 'tl-mountain']]
      .forEach(function (pair) {
        var im = make('img', pair[1]);
        im.setAttribute('alt', '');
        im.setAttribute('src', VN.uiPath(pair[0]));
        im.addEventListener('error', function () { im.style.display = 'none'; });
        root.appendChild(im);
      });
    root.appendChild(make('div', 'title-scrim'));
    var inner = make('div', 'title-inner');
    var left = make('div', 'title-left');
    var h1 = make('div', 'game-title');
    h1.appendChild(document.createTextNode('长征'));
    var acc = make('span', 'accent', '·');
    h1.appendChild(acc);
    h1.appendChild(document.createTextNode('万水千山'));
    left.appendChild(h1);
    left.appendChild(make('div', 'game-sub', '立体几何风格视觉小说 · 二十章'));
    left.appendChild(make('div', 'game-line',
      '一九三四年十月，江西于都。八万六千人从五座浮桥上走过一条河，没有人知道要走多远，也没有人知道还有多少人能回来。'
      + '接下来的一年里，他们翻过十八座山脉、渡过二十四条大河，走过荒无人烟的草地，最后在陕北的冬天里停下脚。'));
    inner.appendChild(left);

    var right = make('div', 'title-right');
    var hasProgress = VN.hasAnyProgress() || Object.keys(VN.G.progress || {}).length > 0;
    function item(label, note, fn, disabled) {
      var b = make('button', 'menu-item');
      b.appendChild(document.createTextNode(label));
      if (note) {
        var n = make('span', 'mi-note', note);
        b.appendChild(n);
      }
      if (disabled) { b.disabled = true; b.style.opacity = '.38'; b.style.cursor = 'not-allowed'; }
      else b.addEventListener('click', function () { if (VN.audio && VN.audio.sfx) VN.audio.sfx('page'); fn(); });
      right.appendChild(b);
      return b;
    }
    var doneCount = Object.keys(VN.G.progress || {}).filter(function (k) { return VN.G.progress[k].done; }).length;
    /* 「继续征途」要具体到停在哪一章哪一步。
     * 原先只写「已走 N 章」，玩家点下去之前根本不知道会回到哪里。 */
    function continueNote() {
      var d = VN.save.readAuto();
      if (!d || !d.chapter) {
        var slots = VN.save.listSlots().filter(function (s) { return !!s.data; });
        slots.sort(function (a, b) { return (b.data.ts || 0) - (a.data.ts || 0); });
        d = slots.length ? slots[0].data : null;
      }
      if (!d || !d.chapter) return doneCount ? '已走 ' + doneCount + ' 章' : '';
      var m = VN.manifest(d.chapter);
      var total = VN.chapterLength ? VN.chapterLength(d.chapter) : 0;
      var i = (d.path && d.path[0] && d.path[0].i) || 0;
      var s = m ? ('第' + VN.numCn(m.num) + '章 · ' + m.title) : String(d.chapter);
      if (total) s += '　上次停在 ' + i + ' / ' + total + ' 步';
      return s;
    }
    var contNote = continueNote();
    item('开始新的征途', '', function () {
      closeAll();
      VN.start(manifest()[0].id, { fresh: true });
      if (VN.audio) { VN.audio.init(); VN.audio.bgm('departure', { ms: 1200 }); }
    });
    item('继续征途', '', function () {
      closeAll();
      if (!VN.continueGame()) {
        var pending = chapterArr().filter(function (c) { return !(progressOf(c.meta.id) || {}).done; })[0];
        VN.start(pending ? pending.meta.id : manifest()[0].id, {});
      }
      if (VN.audio) VN.audio.init();
    }, !hasProgress);
    if (contNote) right.appendChild(make('div', 'continue-hint', contNote));
    item('章节选择', '', showChapterSelect);
    item('人物图鉴', '35 人', function () { VN.gallery.showChars(); });
    item('史料档案', '', function () { VN.gallery.showArchives(); });
    item('插画画廊', '', function () { VN.gallery.showArt(); });
    item('设置', '', showSettings);
    item('关于本作', '', showAbout);
    inner.appendChild(right);
    root.appendChild(inner);
    root.appendChild(make('div', 'title-foot',
      '制作 · Martin　|　根据历史事实编写 · 会议结论与人物结局均与史实一致 · 鼠标左键 / 空格 推进对白'));
  }

  /* ---------- 关于 ---------- */
  function showAbout() {
    var e = open({ title: '关于本作', sub: '长征 · 万水千山' });
    var b = e.body;
    [
      ['制作', 'Martin'],
      ['体例', '二十章视觉小说。以一名十五岁司号员的视角，从一九三四年十月江西于都出发，走到一九三六年十月甘肃会宁。'],
      ['艺术', '全部背景、立绘与插画都是程序生成的低多边形（low-poly）立体几何图形，无外部素材、无网络请求、无第三方依赖。'],
      ['文本', '人物对白为文学创作，但日期、番号、地名、会议结论、牺牲与结局均与史实一致。博古、李德、张国焘等人的局限被如实写出，不作丑化。'],
      ['数值', '士气、信任、信念三项贯穿全剧。它们不影响历史走向，但会影响尾声里那句话的分量。'],
      ['操作', '空格 / 回车 / 左键推进；1—4 选择选项；A 自动；S 或按住 Ctrl 快进；L 回想；H 隐藏界面；Esc 系统菜单。']
    ].forEach(function (row) {
      var r = make('div', 'arch-item');
      var h = make('div', 'ai-head');
      h.appendChild(make('div', 'ai-title', row[0]));
      var t = make('div', 'ai-text', row[1]);
      r.appendChild(h); r.appendChild(t);
      b.appendChild(r);
    });
  }

  /* ---------- 章节选择 ---------- */
  function showChapterSelect() {
    var e = open({ title: '章节选择', sub: '共 ' + manifest().length + ' 章' });
    var grid = make('div', 'chap-grid');
    chapterArr().forEach(function (c) {
      var m = c.meta;
      var unlocked = VN.isUnlockedChapter(m.id);
      var prog = progressOf(m.id) || {};
      var written = !!(c.story && c.story.steps);
      var card = make('button', 'chap-card' + (unlocked ? '' : ' locked') + (prog.done ? ' done' : ''));
      card.appendChild(make('div', 'chap-num', '第' + VN.numCn(m.num) + '章'));
      card.appendChild(make('div', 'chap-name', m.title));
      card.appendChild(make('div', 'chap-meta', m.date + '　' + m.place));
      card.appendChild(make('div', 'chap-sum', (c.story && c.story.summary) || '（待编写）'));
      if (prog.done) {
        card.appendChild(make('div', 'adv', '已完成'));
      } else if (written && unlocked) {
        card.appendChild(make('div', 'adv', '可开始'));
      }
      if (unlocked) {
        card.addEventListener('click', function () {
          closeAll();
          VN.start(m.id, {});
          if (VN.audio) { VN.audio.init(); }
        });
      }
      grid.appendChild(card);
    });
    e.body.appendChild(grid);
  }

  /* ---------- 回想 ---------- */
  function showHistory() {
    var e = open({ title: '回想', sub: VN.state.title || '' });
    var list = make('div', 'hist-list');
    var h = VN.state.history || [];
    if (!h.length) {
      list.appendChild(make('div', 'hist-empty', '还没有可以回想的话。'));
    } else {
      h.forEach(function (row) {
        var r = make('div', 'hist-row' + (row.kind === 'narr' ? ' narr' : ''));
        if (row.name) r.appendChild(make('div', 'hr-who', row.name));
        r.appendChild(make('div', 'hr-text', row.text));
        list.appendChild(r);
      });
    }
    e.body.appendChild(list);
    setTimeout(function () { e.body.scrollTop = e.body.scrollHeight; }, 0);
  }

  /* ---------- 存读档 ---------- */
  function showSlots(mode) {
    var e = open({ title: mode === 'save' ? '存档' : '读档', sub: '六个行军袋 + 一个自动存档' });
    var grid = make('div', 'slot-grid');
    var slots = VN.save.listSlots();
    if (mode === 'load') {
      var auto = VN.save.readAuto();
      if (auto) slots = [{ slot: 'auto', data: auto }].concat(slots);
    }
    slots.forEach(function (s) {
      var data = s.data;
      var card = make('button', 'slot-card');
      var head = make('div', 'sc-head');
      head.appendChild(make('span', '', s.slot === 'auto' ? '自动存档' : '第 ' + s.slot + ' 号'));
      head.appendChild(make('span', '', data ? timeStr(data.ts) : '空'));
      card.appendChild(head);
      if (data) {
        card.appendChild(make('div', 'sc-title', '第' + VN.numCn((VN.manifest(data.chapter) || {}).num || 0) + '章 · ' + (data.title || '')));
        var meta = make('div', 'sc-meta');
        meta.appendChild(document.createTextNode('士气 ' + data.morale + '　信任 ' + data.trust + '　信念 ' + data.hope));
        if (data.preview) {
          meta.appendChild(document.createElement('br'));
          meta.appendChild(document.createTextNode(data.preview));
        }
        card.appendChild(meta);
      } else {
        card.appendChild(make('div', 'sc-empty', '—— 空 ——'));
      }
      card.addEventListener('click', function () {
        if (mode === 'save') {
          if (s.slot === 'auto') return;
          VN.doSave(s.slot);
          closeAll();
        } else {
          if (!data) { VN.toast('这一格还是空的'); return; }
          closeAll();
          VN.doLoad(data);
        }
      });
      grid.appendChild(card);
    });
    e.body.appendChild(grid);
    if (mode === 'save') {
      e.body.appendChild(make('div', 'empty-tip', '提示：存档只保存在本机浏览器里（localStorage）。清空浏览器数据会一并清空。'));
    }
  }
  function timeStr(ts) {
    if (!ts) return '';
    var d = new Date(ts);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------- 设置 ---------- */
  /* 设置里的彩蛋口令：输入正确并确认，解锁全部章节。 */
  var EGG_PASSWORD = 'icecube is cute';
  function showSettings() {
    var e = open({ title: '设置', sub: '' });
    var b = e.body;
    function seg(label, key, values, labels) {
      var row = make('div', 'set-row');
      row.appendChild(make('div', 'set-label', label));
      var box = make('div', 'seg');
      values.forEach(function (v, i) {
        var btn = make('button', VN.settings[key] === v ? 'on' : '', labels[i]);
        btn.addEventListener('click', function () {
          VN.settings[key] = v;
          VN.persist();
          Array.prototype.forEach.call(box.children, function (c) { c.classList.remove('on'); });
          btn.classList.add('on');
          if (key === 'bgm' && VN.audio) VN.audio.setVolume({ bgm: v / 100 });
        });
        box.appendChild(btn);
      });
      row.appendChild(box);
      b.appendChild(row);
    }
    seg('文字速度', 'textSpeed', ['slow', 'normal', 'fast', 'instant'], ['慢', '普通', '快', '瞬间']);
    seg('自动播放间隔', 'autoSpeed', ['slow', 'normal', 'fast'], ['长', '普通', '短']);

    function slider(label, key, onChange) {
      var row = make('div', 'set-row');
      row.appendChild(make('div', 'set-label', label));
      var input = document.createElement('input');
      input.type = 'range';
      input.min = '0'; input.max = '100';
      input.value = String(VN.settings[key]);
      input.style.width = 'calc(320 * var(--u))';
      var val = make('div', 'set-hint', String(VN.settings[key]));
      input.addEventListener('input', function () {
        VN.settings[key] = parseInt(input.value, 10);
        val.textContent = input.value;
        VN.persist();
        if (onChange) onChange();
      });
      row.appendChild(input);
      row.appendChild(val);
      b.appendChild(row);
    }
    slider('音乐音量', 'bgm', function () { if (VN.audio) VN.audio.setVolume({ bgm: VN.settings.bgm / 100 }); });
    slider('音效音量', 'sfx', function () { if (VN.audio) VN.audio.setVolume({ sfx: VN.settings.sfx / 100 }); });

    var rowFs = make('div', 'set-row');
    rowFs.appendChild(make('div', 'set-label', '全屏'));
    var fsBtn = make('button', 'ov-close', document.fullscreenElement ? '退出全屏' : '进入全屏');
    fsBtn.addEventListener('click', function () {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    });
    rowFs.appendChild(fsBtn);
    b.appendChild(rowFs);

    var rowEgg = make('div', 'set-row');
    rowEgg.appendChild(make('div', 'set-label', '冰冰冰'));
    var eggBox = make('div', 'set-egg');
    var eggInput = document.createElement('input');
    eggInput.type = 'text';
    eggInput.className = 'set-input';
    eggInput.setAttribute('autocomplete', 'off');
    eggInput.setAttribute('spellcheck', 'false');
    eggInput.setAttribute('placeholder', '口令');
    function tryEgg() {
      var v = String(eggInput.value || '').trim().toLowerCase();
      if (!v) return;
      if (v !== EGG_PASSWORD) { VN.toast('口令不对'); return; }
      /* 章节、人物图鉴、史料档案、插画画廊一起解锁，并放开倒退播放。 */
      VN.unlockEverything();
      eggInput.value = '';
      VN.toast('解锁全部章节');
    }
    eggInput.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Enter') return;
      ev.preventDefault();
      ev.stopPropagation();
      tryEgg();
    });
    var eggBtn = make('button', 'ov-close', '确认');
    eggBtn.addEventListener('click', tryEgg);
    eggBox.appendChild(eggInput);
    eggBox.appendChild(eggBtn);
    rowEgg.appendChild(eggBox);
    b.appendChild(rowEgg);

    var row2 = make('div', 'set-row');
    row2.appendChild(make('div', 'set-label', '重置全部进度'));
    var danger = make('button', 'btn-danger', '清除存档与解锁');
    danger.addEventListener('click', function () {
      if (!window.confirm('确定要清除全部进度、解锁与设置吗？此操作不可撤销。')) return;
      VN.save.wipe();
      VN.G = window.VN.G = {
        v: 1, settings: { textSpeed: 'normal', autoSpeed: 'normal', bgm: 55, sfx: 65 },
        run: { morale: 60, trust: 50, hope: 55, flags: {}, records: {} },
        progress: {}, unlocked: { chars: {}, archives: {}, cgs: {}, bgs: {} }, startedAt: Date.now()
      };
      VN.settings = VN.G.settings;
      VN.persist();
      VN.toast('进度已重置');
      closeAll();
      showTitle();
    });
    row2.appendChild(danger);
    b.appendChild(row2);

    b.appendChild(make('div', 'empty-tip',
      '本作无网络请求、无外部素材、无统计上报。所有几何图形由 tools/build-art.js 程序生成；所有存档仅保存在本机。'));
  }

  /* ---------- 系统菜单（游戏中 Esc） ---------- */
  function showSystem() {
    if (VN.state.choice) return;
    var e = open({ title: '系统', sub: VN.state.title || '', cls: 'sys-menu', noClose: true });
    var b = e.body;
    var list = make('div', 'title-right');
    list.style.width = '100%';
    list.style.maxWidth = 'calc(520 * var(--u))';
    function item(label, fn, note) {
      var btn = make('button', 'menu-item');
      btn.appendChild(document.createTextNode(label));
      if (note) btn.appendChild(make('span', 'mi-note', note));
      btn.addEventListener('click', fn);
      list.appendChild(btn);
    }
    item('继续行军', function () { closeAll(); });
    item('存档', function () { showSlots('save'); });
    item('读档', function () { showSlots('load'); });
    item('回想', function () { showHistory(); });
    item('人物图鉴', function () { VN.gallery.showChars(); });
    item('史料档案', function () { VN.gallery.showArchives(); });
    item('插画画廊', function () { VN.gallery.showArt(); });
    item('设置', function () { showSettings(); });
    item('回到标题画面', function () {
      if (VN.state.running) VN.autosave();
      VN.state.running = false;
      closeAll();
      if (VN.audio) VN.audio.stopBgm({ ms: 600 });
      showTitle();
    });
    b.appendChild(list);
  }

  /* ---------- 章末过场 ---------- */
  function chapterEndCard(fromM, toM, cb) {
    closeAll();
    var unbindCard = null;
    var entry = open({
      title: '', noClose: true, sticky: true, cls: 'result-screen', kind: 'chapterend',
      /* 这张卡不靠定时器推进，而是等玩家点「继续行军」或按空格。
       * 一旦它被别处（例如程序化 VN.start）关掉，也要把键盘监听解绑。 */
      onClose: function () { if (unbindCard) unbindCard(); }
    });
    var root = entry.root;
    var headEl = root.querySelector('.ov-head');
    if (headEl) headEl.style.display = 'none';
    entry.body.innerHTML = '';
    entry.body.appendChild(make('div', 'rs-rank', '第' + VN.numCn(fromM.num) + '章 完'));
    entry.body.appendChild(make('div', 'rs-text', '《' + fromM.title + '》　' + fromM.date + '　' + fromM.place));
    var stats = make('div', 'rs-stats');
    [['士气', VN.state.morale], ['信任', VN.state.trust], ['信念', VN.state.hope]].forEach(function (p) {
      var s = make('div', 'rs-stat');
      s.appendChild(make('b', '', String(p[1])));
      s.appendChild(make('span', '', p[0]));
      stats.appendChild(s);
    });
    entry.body.appendChild(stats);
    var next = make('div', 'rs-text', '下一章：' + toM.title + '　' + toM.date + '　' + toM.place);
    entry.body.appendChild(next);
    var go = make('button', 'menu-item');
    go.style.maxWidth = 'calc(420 * var(--u))';
    go.style.marginTop = 'calc(30 * var(--u))';
    go.textContent = '继续行军　▸';
    /* 原先这里 4.2 秒后自动进入下一章 —— 玩家连三个数值都没看清就被推走了。
     * 章末是整章唯一能让玩家喘口气、回看一下的地方，改成必须点击。 */
    var done = false;
    function proceed() {
      if (done) return;
      done = true;
      if (unbindCard) unbindCard();
      closeAll();
      cb();
    }
    unbindCard = bindPrimaryKey(proceed);
    go.addEventListener('click', proceed);
    entry.body.appendChild(go);
  }

  /* ---------- 结局结算 ---------- */
  function showResult() {
    closeAll();
    var avg = Math.round((VN.state.morale + VN.state.trust + VN.state.hope) / 3);
    var rank, text;
    if (avg >= 75) {
      rank = '钢铁洪流';
      text = '一九三六年十月，甘肃会宁。三个方面军的人挤在同一条街上，谁也不认得谁，谁都在笑。'
        + '两年，十余省，翻过十八座大山，渡过二十四条大河，最后走到这里的人，比出发时少了许多。'
        + '可这支队伍已经不可能被打散了。他们学会了在最坏的时候，把最后一口干粮递给旁边的人。';
    } else if (avg >= 60) {
      rank = '星火燎原';
      text = '一九三六年十月，甘肃会宁。会师的号声吹响的时候，很多人坐在地上就哭了。'
        + '他们记不住自己走了多少里路，只记得哪一天谁没能跟着走。'
        + '后来的人接着往前走，把他们的那一段也走完了。';
    } else {
      rank = '血染征途';
      text = '一九三六年十月，甘肃会宁。活着走到这里的人，替死去的人看见了这一天。'
        + '队伍比出发时小得多，可它还在。它翻过山，涉过水，走过没有人烟的地方，'
        + '最后在一片黄土坡上停住，把红旗插在了城楼上。';
    }
    var unbindResult = null;
    var entry = open({
      title: '', noClose: true, sticky: true, cls: 'result-screen', kind: 'result',
      onClose: function () { if (unbindResult) unbindResult(); }
    });
    var root = entry.root;
    var headEl = root.querySelector('.ov-head');
    if (headEl) headEl.style.display = 'none';
    entry.body.innerHTML = '';
    entry.body.appendChild(make('div', 'rs-rank', rank));
    entry.body.appendChild(make('div', 'rs-text', text));
    var stats = make('div', 'rs-stats');
    var doneChapters = Object.keys(VN.G.progress || {}).filter(function (k) { return VN.G.progress[k].done; }).length;
    var charsUnlocked = Object.keys(VN.G.unlocked.chars || {}).length;
    var archUnlocked = Object.keys(VN.G.unlocked.archives || {}).length;
    var cgUnlocked = Object.keys(VN.G.unlocked.cgs || {}).length + Object.keys(VN.G.unlocked.bgs || {}).length;
    [['走过的章节', doneChapters], ['相遇的人物', charsUnlocked], ['史料档案', archUnlocked], ['解锁插画', cgUnlocked],
      ['士气', VN.state.morale], ['信任', VN.state.trust], ['信念', VN.state.hope]].forEach(function (p) {
      var s = make('div', 'rs-stat');
      s.appendChild(make('b', '', String(p[1])));
      s.appendChild(make('span', '', p[0]));
      stats.appendChild(s);
    });
    entry.body.appendChild(stats);
    var again = make('button', 'menu-item');
    again.style.maxWidth = 'calc(420 * var(--u))';
    again.style.marginTop = 'calc(36 * var(--u))';
    again.textContent = '回到标题画面';
    var left = false;
    function backToTitle() {
      if (left) return;
      left = true;
      if (unbindResult) unbindResult();
      closeAll();
      showTitle();
    }
    unbindResult = bindPrimaryKey(backToTitle);
    again.addEventListener('click', backToTitle);
    entry.body.appendChild(again);
    if (VN.audio) VN.audio.bgm('victory', { ms: 1600 });
  }

  /* ---------- 错误提示 ---------- */
  function error(msg) {
    var e = open({ title: '无法开始', sub: '' });
    e.body.appendChild(make('div', 'arch-item', ''));
    var box = e.body.lastChild;
    box.textContent = msg;
    var tip = make('div', 'empty-tip', '如果是缺少章节文件，请等待对应章节写完后重试（章节清单见 src/story/manifest.js）。');
    e.body.appendChild(tip);
    var back = make('button', 'menu-item');
    back.style.maxWidth = 'calc(420 * var(--u))';
    back.style.marginTop = 'calc(24 * var(--u))';
    back.textContent = '返回标题画面';
    back.addEventListener('click', function () { closeAll(); showTitle(); });
    e.body.appendChild(back);
  }

  VN.ui = {
    init: function () { ovTarget = $('overlay'); },
    showTitle: showTitle,
    showChapterSelect: showChapterSelect,
    showHistory: showHistory,
    showSlots: showSlots,
    showSettings: showSettings,
    showSystem: showSystem,
    showAbout: showAbout,
    showResult: showResult,
    chapterEndCard: chapterEndCard,
    error: error,
    open: open,
    closeTop: closeTop,
    closeAll: closeAll,
    isModalOpen: isModalOpen,
    stackDepth: function () { return stack.length; }
  };
})();
