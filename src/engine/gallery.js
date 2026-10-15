/* 图鉴：人物（35）、史料档案（按章分组）、插画画廊（背景 + CG）
 * 所有权：extras。只读 VN.G.unlocked 与 window.STORY。
 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});

  var BG_LABEL = {
    bg_yudu_night: '于都河夜渡', bg_yudu_village: '于都村庄清晨', bg_mountain_pass: '赣南山路',
    bg_blockade: '封锁线碉堡', bg_xiangjiang_day: '湘江 · 白昼', bg_xiangjiang_night: '湘江 · 血战夜',
    bg_council_hall: '会议厅', bg_tongdao: '通道 · 恭城书院', bg_liping: '黎平会议',
    bg_houchang: '猴场 · 跨年夜', bg_zunyi: '遵义会议楼', bg_chishui: '赤水河', bg_tucheng: '土城',
    bg_loushanguan: '娄山关', bg_jinsha: '金沙江 · 皎平渡', bg_yihai: '彝海', bg_dadu: '大渡河 · 安顺场',
    bg_luding: '泸定桥', bg_snow_mountain: '夹金山', bg_maogong: '懋功会师', bg_grassland: '松潘草地',
    bg_lazikou: '腊子口', bg_hadapu: '哈达铺', bg_wuqi: '吴起镇', bg_huining: '会宁会师',
    bg_yanan_cave: '延安窑洞', bg_rain_march: '雨中行军', bg_camp_fire: '篝火夜营',
    bg_map_table: '指挥部 · 地图桌', bg_stretcher: '担架队'
  };
  var BG_ORDER = Object.keys(BG_LABEL);
  /* 插画 id 必须与"真正的解锁键"一致：
   *   引擎的 showCg() 走的是 unlock('cgs', <背景id>) 与 cgPath(<背景id>)，
   *   即 assets/generated/cg/<背景id>.svg（cg 复用背景 id，见 SPEC §2.1）。
   *   以前这里写的是 cg_yudu / cg_luding 这类**不存在的 id**：
   *   既永远不会被解锁（unlocked('cgs','cg_yudu') 恒为 false），
   *   真解锁了也会指向不存在的文件。所以这一节以前是死的。
   *   现在改用真实的背景 id。—— 由 root 修正 */
  var CG_LABEL = {
    bg_yudu_night: '夜渡于都河', bg_xiangjiang_night: '湘江血战', bg_xiangjiang_day: '湘江·白昼',
    bg_blockade: '突破封锁线',
    bg_tongdao: '通道转兵', bg_liping: '黎平会议', bg_houchang: '猴场跨年',
    bg_zunyi: '遵义会议', bg_chishui: '四渡赤水', bg_loushanguan: '娄山关',
    bg_jinsha: '巧渡金沙江', bg_yihai: '彝海结盟', bg_dadu: '强渡大渡河',
    bg_luding: '飞夺泸定桥', bg_snow_mountain: '翻越夹金山', bg_grassland: '过草地',
    bg_maogong: '懋功会师', bg_lazikou: '激战腊子口', bg_wuqi: '吴起镇',
    bg_huining: '三军会师'
  };

  function make(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function unlocked(kind, id) { return !!(VN.G.unlocked[kind] && VN.G.unlocked[kind][id]); }
  function order() {
    return ['mao', 'zhou', 'zhu', 'zhang_wentian', 'wang_jiaxiang', 'bogu', 'lide', 'peng', 'lin', 'nie',
      'liu_bocheng', 'chen_yun', 'he_zizhen', 'deng_yingchao', 'xu_teli', 'dong_biwu', 'lin_boqu',
      'xie_juezai', 'ye_jianying', 'zhang_guotao', 'xu_xiangqian', 'li_xiannian', 'xiao_yedan',
      'xiaoman', 'li_tiezhu', 'he_xiaomei', 'guo_daniang', 'shi_zhu', 'a_yue', 'wu_laoliu', 'san_wa',
      'soldiers', 'villagers', 'yi_people', 'narrator'];
  }
  var FACE_ORDER = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];
  var FACE_CN = { calm: '平静', stern: '肃然', smile: '含笑', sad: '悲恸', worry: '忧虑', fierce: '激愤', weak: '虚弱', dawn: '释然' };

  function chapterTitleOf(id) {
    var m = VN.manifest(id);
    return m ? ('第' + VN.numCn(m.num) + '章 · ' + m.title) : id;
  }

  /* ---------- 人物图鉴 ---------- */
  function showChars() {
    var e = VN.ui.open({ title: '人物图鉴', sub: '已相遇 ' + Object.keys(VN.G.unlocked.chars || {}).length + ' / 35' });
    var grid = make('div', 'card-grid');
    order().forEach(function (id) {
      var c = VN.CHARACTERS[id];
      if (!c) return;
      var ok = unlocked('chars', id);
      var card = make('div', 'person-card' + (ok ? '' : ' locked'));
      var face = make('div', 'pc-face' + (ok ? '' : ' unknown'));
      if (ok) {
        var img = make('img');
        img.setAttribute('alt', c.name);
        VN.setCharImage(img, id, 'calm');
        img.addEventListener('error', function () { img.style.display = 'none'; });
        face.appendChild(img);
      } else {
        face.appendChild(document.createTextNode('？'));
      }
      card.appendChild(face);
      var body = make('div', 'pc-body');
      body.appendChild(make('div', 'pc-name', ok ? c.name : '尚未相遇'));
      body.appendChild(make('div', 'pc-role', ok ? c.role : '继续行军以解锁'));
      body.appendChild(make('div', 'pc-desc', ok ? c.desc : '这一页还是空的。'));
      card.appendChild(body);
      card.addEventListener('click', function () { showCharModal(id, ok); });
      grid.appendChild(card);
    });
    e.body.appendChild(grid);
  }
  function showCharModal(id, ok) {
    var c = VN.CHARACTERS[id];
    var wrap = make('div', '');
    wrap.id = 'modal-wrap';
    var card = make('div', 'modal-card');
    var face = make('div', 'mc-face');
    var img = make('img');
    img.setAttribute('alt', c.name);
    VN.setCharImage(img, id, 'calm');
    img.addEventListener('error', function () { img.style.display = 'none'; });
    face.appendChild(img);
    card.appendChild(face);
    var body = make('div', 'mc-body');
    body.appendChild(make('h3', '', c.name));
    body.appendChild(make('div', 'mc-role', c.role));
    body.appendChild(make('div', 'mc-desc', ok ? c.desc : '（尚未相遇）'));
    if (c.quote) body.appendChild(make('div', 'mc-quote', c.quote));
    body.appendChild(make('div', 'mc-meta', '首次登场：' + chapterTitleOf(c.chapter) + '　·　情绪：'
      + FACE_ORDER.map(function (f) { return FACE_CN[f]; }).join(' / ')));
    card.appendChild(body);
    wrap.appendChild(card);
    wrap.addEventListener('click', function (ev) { if (ev.target === wrap) wrap.remove(); });
    document.getElementById('app').appendChild(wrap);
    setTimeout(function () {
      function onKey(ev) {
        if (ev.key === 'Escape') { wrap.remove(); document.removeEventListener('keydown', onKey, true); }
      }
      document.addEventListener('keydown', onKey, true);
    }, 0);
  }

  /* ---------- 史料档案 ---------- */
  function showArchives() {
    var manifest = (window.STORY && window.STORY.__manifest) || [];
    var all = [];
    manifest.forEach(function (m) {
      var st = window.STORY && window.STORY[m.id];
      (st && st.archive || []).forEach(function (a) { all.push({ m: m, a: a }); });
    });
    var unlockedCount = all.filter(function (x) { return unlocked('archives', x.a.id); }).length;
    var e = VN.ui.open({ title: '史料档案', sub: unlockedCount + ' / ' + all.length + ' 条' });
    if (!all.length) {
      e.body.appendChild(make('div', 'empty-tip', '还没有任何档案。章节写完后，这里会按章节列出每一段史实。'));
      return;
    }
    var curCh = null, list = null;
    all.forEach(function (x) {
      if (x.m.id !== curCh) {
        curCh = x.m.id;
        e.body.appendChild(make('div', 'sec-head', chapterTitleOf(x.m.id)));
        list = make('div', 'arch-list');
        e.body.appendChild(list);
      }
      var ok = unlocked('archives', x.a.id);
      var item = make('div', 'arch-item');
      var head = make('div', 'ai-head');
      head.appendChild(make('div', 'ai-title', ok ? x.a.title : '未解锁的档案'));
      if (x.a.tag) head.appendChild(make('div', 'ai-chap', x.a.tag));
      item.appendChild(head);
      item.appendChild(make('div', 'ai-text', ok ? x.a.text : '行军到这一章时自动解锁。'));
      list.appendChild(item);
    });
  }

  /* ---------- 插画画廊 ---------- */
  function showArt() {
    var e = VN.ui.open({ title: '插画画廊', sub: '背景 ' + BG_ORDER.length + '　·　插画 ' + Object.keys(CG_LABEL).length });
    e.body.appendChild(make('div', 'sec-head', '场景背景'));
    var grid = make('div', 'gallery-grid');
    BG_ORDER.forEach(function (id) {
      grid.appendChild(artTile('bgs', id, BG_LABEL[id], VN.bgPath(id)));
    });
    e.body.appendChild(grid);
    e.body.appendChild(make('div', 'sec-head', '全屏插画'));
    var grid2 = make('div', 'gallery-grid');
    Object.keys(CG_LABEL).forEach(function (id) {
      grid2.appendChild(artTile('cgs', id, CG_LABEL[id], VN.cgPath(id)));
    });
    e.body.appendChild(grid2);
  }
  function artTile(kind, id, label, src) {
    var ok = unlocked(kind, id);
    var item = make('div', 'gal-item' + (ok ? '' : ' locked'));
    if (ok) {
      var img = make('img');
      img.setAttribute('alt', label);
      img.setAttribute('src', src);
      img.addEventListener('error', function () { img.style.display = 'none'; });
      item.appendChild(img);
    } else {
      item.appendChild(document.createTextNode('？'));
    }
    item.appendChild(make('span', '', (ok ? '' : '未解锁 · ') + label));
    item.addEventListener('click', function () {
      if (!ok) { VN.toast('走到这一段时自动解锁'); return; }
      var wrap = make('div', '');
      wrap.id = 'modal-wrap';
      var img2 = make('img');
      img2.setAttribute('src', src);
      img2.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:94vw;max-height:88vh;';
      img2.addEventListener('error', function () { VN.toast('这张图还没有生成'); });
      wrap.appendChild(img2);
      wrap.addEventListener('click', function () { wrap.remove(); });
      document.getElementById('app').appendChild(wrap);
    });
    return item;
  }

  VN.gallery = { showChars: showChars, showArchives: showArchives, showArt: showArt, BG_LABEL: BG_LABEL, CG_LABEL: CG_LABEL };
})();
