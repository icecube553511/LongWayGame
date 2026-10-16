/* 《长征·万水千山》引擎核心
 * 所有权：engine。职责：状态机、剧本解释器、画面渲染、输入、存档时序。
 * 公开 API：window.VN.start / VN.jump / VN.state / VN.save / VN.settings / VN.CHARACTERS
 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});
  window.STORY = window.STORY || {};

  /* ===== 0. 常量与工具 ===== */
  var FACES = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];
  var FOLDER = { bg: 'bg', char: 'chars', cg: 'cg', ui: 'ui' };

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function manifestList() { return (window.STORY && window.STORY.__manifest) || []; }
  function asset(kind, name) { return 'assets/generated/' + (FOLDER[kind] || kind) + '/' + name + '.svg'; }
  /* 背景两种来源（与立绘、插画同一套思路）：
   *   ① assets/generated/bg/{id}.png  —— AI 出的整屏位图（首选，见 src/data/bgart.js 与 tools/bg-art.js）
   *   ② assets/generated/bg/{id}.svg  —— art/scenes*.js 烘焙的矢量背景（兜底）
   * src/data/backgrounds.js 里标了 noBitmap 的四张叙事画面（三发子弹×3、全黑）不出位图，
   * 直接走 ② —— 否则每次切到它们都要白请求一次 404。
   * 逐级回退在 setBg() 里用 probe.onerror 走：png 加载失败就换 svg，两个都没有才保留上一张。 */
  function bgNoBitmap(id) {
    var b = window.ART && window.ART.backgrounds && window.ART.backgrounds[id];
    return !!(b && b.noBitmap);
  }
  function bgCandidates(id) {
    if (!id) return [];
    var base = 'assets/generated/' + FOLDER.bg + '/' + id;
    var exts = bgNoBitmap(id) ? ['.svg'] : ['.png', '.svg'];
    return exts.map(function (e) { return base + e; });
  }
  function bgPath(id) { return bgCandidates(id)[0] || ''; }
  /* 全屏插画（CG）的路径解析。三种来源按顺序尝试：
   *   ① assets/generated/cg/{cgId}.png  —— NekoGptImage 出的位图（SPEC §4.3，首选）
   *   ② assets/generated/cg/{cgId}.svg  —— 同名的矢量插画（若有人手工补）
   *   ③ assets/generated/cg/{anchorBgId}.svg —— build-art 烘焙的「同场景加强版插画」兜底，
   *      所以哪怕某张 CG 还没生成出来，玩家看到的仍然是一张插画，而不是空白或普通背景。
   * 老剧本写的 `{t:'cg', id:'bg_xxx'}`（cg 复用背景 id 的年代）继续按老规则解析。 */
  function cgEntry(id) {
    return (window.ART && window.ART.cgById && window.ART.cgById[id]) || null;
  }
  function cgCandidates(id) {
    if (!id) return [];
    var base = 'assets/generated/' + FOLDER.cg + '/';
    var entry = cgEntry(id);
    var list = [base + id + '.png', base + id + '.svg'];
    if (entry && entry.anchor) list.push(base + entry.anchor + '.svg');
    return list.filter(function (p, i, a) { return a.indexOf(p) === i; });
  }
  function cgPath(id) { return cgCandidates(id)[0] || ''; }
  /* 立绘两种来源：NekoGptImage 生成的 600×900 PNG（首选），
   * 以及 art/portraits_root.js 烘焙的矢量 SVG（兜底）。
   * 这样任何一张 PNG 缺失或加载失败时，游戏仍然显示得出人。 */
  var CHAR_EXT = ['.png', '.svg'];
  function charPaths(who, face) {
    var base = 'assets/generated/' + FOLDER.char + '/' + who + '_' + (face || 'calm');
    return CHAR_EXT.map(function (e) { return base + e; });
  }
  function charPath(who, face) { return charPaths(who, face)[0]; }
  function uiPath(name) { return asset('ui', name); }

  /* ===== 1. 人物表（SPEC §3.1 固定 35 个 id） ===== */
  VN.CHARACTERS = {
    mao: { name: '毛泽东', role: '中央政治局委员', chapter: 'ch01',
      desc: '诗人气质的军事家。第五次反"围剿"后被排挤出军事指挥核心，长征初期沉默多于争辩。他习惯把地图摊在膝盖上，用铅笔把敌人兵力画成一个个圈，说"打得赢就打，打不赢就走"。',
      quote: '「路是脚走出来的；地图上的路，是别人画的。」' },
    zhou: { name: '周恩来', role: '中央政治局常委 · 军委副主席', chapter: 'ch01',
      desc: '事必躬亲，常说"我来想办法"。长征途中因劳累与肝病日渐消瘦，在担架上、电话机旁、渡口的木船上都能睡着。会议上他肯担责，也敢拍桌子。',
      quote: '「仗打成这样，首先是我这个当家的没有当好。」' },
    zhu: { name: '朱德', role: '红军总司令', chapter: 'ch02',
      desc: '宽厚的四川口音，永远是队伍里年纪最长、背枪最直的一个。他挑粮、烧火、替战士扛枪，危急时亲上前线。战士说：只要总司令还在队伍里走，我们就走得下去。',
      quote: '「我不走，你们谁也别怕。」' },
    zhang_wentian: { name: '张闻天', role: '中央政治局常委', chapter: 'ch04',
      desc: '戴眼镜的理论家，讲话有条理、书面气重。从支持博古到公开批评，这个转折对他自己也是沉痛的。他作"反报告"的那一夜，炭盆里的火一直在响。',
      quote: '「讲道理的人，最怕的是道理讲不通的地方。」' },
    wang_jiaxiang: { name: '王稼祥', role: '中央政治局候补委员', chapter: 'ch04',
      desc: '腹部重伤未愈，长期躺在担架上随军。寡言，但每句话都重。遵义会议上，他是第一个明确提议把军事指挥权交给毛泽东的人。',
      quote: '「我躺在担架上想了一路：再这么打，就到不了目的地。」' },
    bogu: { name: '博古', role: '临时中央负责人', chapter: 'ch02',
      desc: '二十七岁，说理流利，会拉手风琴。承认错误的过程对他极其艰难。他不是不想把队伍带好，只是把书上的战法当成了地上的战场。',
      quote: '「我讲的是原则。可原则救不了湘江边那些人的命。」' },
    lide: { name: '李德', role: '共产国际军事顾问', chapter: 'ch02',
      desc: '德国人，只相信地图与条令，中文很差，说话常由伍修权翻译。到最后他仍不肯认错，但话越来越少，只是把地图叠起来，叠得很整齐。',
      quote: '「这是命令。命令应当被执行。」' },
    peng: { name: '彭德怀', role: '红三军团军团长', chapter: 'ch01',
      desc: '猛将，直率暴烈，对战士却极好。他说过"崽卖爷田心不痛"，也说过"打得不好，我们对不起牺牲的同志"。他的军团总在最难的位置上。',
      quote: '「我的兵不是数字。一个连剩三个人，那也是人。」' },
    lin: { name: '林彪', role: '红一军团军团长', chapter: 'ch02',
      desc: '年轻的红一军团长，沉默寡言，只谈军事。他很少在会上发言，但一旦开口，讲的全是地形、路程与火力。',
      quote: '「一天一百二十里。多算一步，少死一千人。」' },
    nie: { name: '聂荣臻', role: '红一军团政委', chapter: 'ch02',
      desc: '稳重，善于做思想工作。他知道队伍最怕的不是打仗，而是打了败仗之后，没人告诉战士们为什么。',
      quote: '「把话讲透，比把枪发够更要紧。」' },
    liu_bocheng: { name: '刘伯承', role: '红军总参谋长', chapter: 'ch02',
      desc: '被称为"军神"，右眼在早年战争中摘除。说话不急不缓，是彝海结盟的主角。他懂地图，也懂人，懂得什么时候该把枪放下。',
      quote: '「我们是来借路的，不是来抢路的。」' },
    chen_yun: { name: '陈云', role: '中央政治局常委', chapter: 'ch01',
      desc: '沉稳细致，负责组织与后勤，管的是全军的吃穿与编制。他把每一份电报、每一张数字都记得清楚。',
      quote: '「数字不会骗人；骗人的是报数字的人。」' },
    he_zizhen: { name: '贺子珍', role: '双枪女战士', chapter: 'ch01',
      desc: '毛泽东的妻子，也是从井冈山走出来的战士。湘江负伤，后来在盘县又被炸伤，身上留了十七处弹片。她极少抱怨，只在夜里给人包扎时哼江西小调。',
      quote: '「看我也不能替你把脚上的泡走掉。看路。」' },
    deng_yingchao: { name: '邓颖超', role: '妇女与群众工作负责人', chapter: 'ch03',
      desc: '周恩来的妻子，患肺病，常在夜里咳。她善于倾听，能站在村口和老百姓说半天话，把队伍的难处和老百姓的难处都说透。',
      quote: '「我们自己也是从家里出来的。别把老乡当外人。」' },
    xu_teli: { name: '徐特立', role: '"长征五老"之一', chapter: 'ch01',
      desc: '五十七岁，毛泽东的老师。拄一根木棍走路，把马让给伤员。爱讲笑话，说"我这一辈子走的路，比不上在苏区读的书多，现在补上了"。',
      quote: '「我走得慢，但我没有一步是白走的。」' },
    dong_biwu: { name: '董必武', role: '"长征五老"之一', chapter: 'ch01',
      desc: '沉稳温和，队伍里最有耐心的长者。他总在队伍最后面，陪着走得最慢的人，因为"后面的路，也得有人走"。',
      quote: '「走到最后的人，才是真正的先头部队。」' },
    lin_boqu: { name: '林伯渠', role: '总供给部部长', chapter: 'ch01',
      desc: '手不离账本，管着全军的粮食。随身带一杆秤和一支秃铅笔，写下的每一笔都要问一句：还有多少人在等着吃。',
      quote: '「今天的账，明天算的是命。」' },
    xie_juezai: { name: '谢觉哉', role: '"长征五老"之一', chapter: 'ch01',
      desc: '须发花白，一路上写日记。他的日记里不写胜负，写的是天气、路、脚上的草鞋，和谁今天没能说上话。',
      quote: '「记下来。将来总有人想知道，这天是什么样子的。」' },
    ye_jianying: { name: '叶剑英', role: '红军副总参谋长', chapter: 'ch03',
      desc: '机敏、果断。他管着最机密的电报，也最清楚队伍内部的裂隙。关键时刻，他做过的某些决定让中央转危为安。',
      quote: '「电报是纸。纸后面是人。」' },
    zhang_guotao: { name: '张国焘', role: '红四方面军领导人', chapter: 'ch17',
      desc: '体胖，口才极好，权欲重。他确实带出过一支能打的部队，也确实在会师后把分歧摆上了台面。历史对他的结论是清楚的。',
      quote: '「队伍是我的。我有八万人。」' },
    xu_xiangqian: { name: '徐向前', role: '红四方面军总指挥', chapter: 'ch17',
      desc: '宽厚善战。会师后他说过一句很短的话，那句话让很多人记了一辈子——"哪有红军打红军的道理"。',
      quote: '「枪口朝前，是对着敌人的。」' },
    li_xiannian: { name: '李先念', role: '红三十军政委', chapter: 'ch17',
      desc: '坚毅，年轻，能打硬仗。翻过雪山与草地之后，他带着队伍还能跑得动，是红四方面军里最能走的人之一。',
      quote: '「粮食不够，腿要够。」' },
    xiao_yedan: { name: '小叶丹', role: '彝族果基家支首领', chapter: 'ch13',
      desc: '豪爽讲义气，信守盟约。他在彝海边与刘伯承歃血为盟，从此把红军的旗子当成自家旗子，直到生命结束。',
      quote: '「你说的话，就是石头上的字。」' },
    xiaoman: { name: '小满', role: '红小鬼 · 司号员', chapter: 'ch01',
      desc: '十五岁，全剧的视角人物。出发时连号都吹不响，被班长骂过"吹得像牛叫"。他一路上学会的不是怎么牺牲，而是怎么把号吹响。',
      quote: '「号一响，就得往前走。往哪走，不用我想。」' },
    li_tiezhu: { name: '李铁柱', role: '炊事班长', chapter: 'ch01',
      desc: '四十岁，背上一口铜锅，锅底磨得发亮。他读过几年私塾，总说"人是铁饭是钢"。他把最后一口给伤员，自己嚼野草。',
      quote: '「锅里没了，我再想办法。你们先吃。」' },
    he_xiaomei: { name: '何晓梅', role: '女卫生员', chapter: 'ch01',
      desc: '十九岁，江西兴国人，与李铁柱是同乡。第一次上战场时怕血，后来能按住伤口缝合。她记得每一个被她送走的人的名字。',
      quote: '「你不要看我的手，看我的眼睛。我不会让你死。」' },
    guo_daniang: { name: '郭大娘', role: '于都船工家属', chapter: 'ch01',
      desc: '五十多岁，拆下自己寿材的门板架浮桥。儿子郭水生随军北上。她把一枚铜顶针塞给小满，说"到了北边，还我"。',
      quote: '「门板拆了能再做。你们要回来。」' },
    shi_zhu: { name: '石柱', role: '江西籍战士', chapter: 'ch01',
      desc: '二十二岁，小满的同乡兄长，班里最会打草鞋的人。他说等走完这一路，要带小满回兴国看看自家的田。',
      quote: '「鞋破了就编，路走错了就回头。别站着不动。」' },
    a_yue: { name: '阿月', role: '苗族女向导', chapter: 'ch04',
      desc: '十六岁，沉默，会唱山歌。她带过红军翻腊子口的绝壁，也带过他们过苗寨。她唱歌时不看人，只看山谷。',
      quote: '「山是我家的。跟着我走。」' },
    wu_laoliu: { name: '吴老六', role: '老兵', chapter: 'ch01',
      desc: '三十五岁，从排长缩编成班长，反而高兴：离敌人近点。讲究实际，爱说怪话，是最早相信毛泽东能带大家走出去的人。',
      quote: '「枪少不要紧，会走就行。咱们现在最会走。」' },
    san_wa: { name: '三娃', role: '红小鬼', chapter: 'ch01',
      desc: '十三岁，队伍里最小的一个。爱哭，也爱笑。他记不住番号，却记得住每一个给过他半块干粮的人。',
      quote: '「我不累。我就是有点想我娘做的红薯。」' },
    soldiers: { name: '红军战士们', role: '集体', chapter: 'ch02',
      desc: '他们没有名字。但每一个渡口、每一座山口、每一片草地上，都是他们。', quote: '「走！」' },
    villagers: { name: '乡亲们', role: '集体', chapter: 'ch01',
      desc: '门板、草鞋、炒米、咸菜，还有不肯说出口的告别。', quote: '「红军同志，一路平安。」' },
    yi_people: { name: '彝族同胞', role: '集体', chapter: 'ch13',
      desc: '被历史与官军伤过很多次，所以他们先举起刀，然后才愿意听你说话。', quote: '「你再说一遍：你叫什么名字？」' },
    narrator: { name: '旁白', role: '时代旁白', chapter: 'ch01', desc: '不显示姓名条的那支笔。', quote: '' }
  };
  function charName(id) { var c = VN.CHARACTERS[id]; return c ? c.name : (id || ''); }

  /* 与 root 冻结的 src/data/characters.js 合并：以数据表为准，引擎内置表作为兜底。
   * 这样图鉴、档案与立绘共用同一份显示名、职务与简介。 */
  (function mergeArtData() {
    var ART = window.ART;
    if (!ART || !ART.charactersById) return;
    Object.keys(ART.charactersById).forEach(function (id) {
      var src = ART.charactersById[id];
      if (!src) return;
      var dst = VN.CHARACTERS[id] || (VN.CHARACTERS[id] = {});
      if (src.name) dst.name = src.name;
      if (src.role) dst.role = src.role;
      if (src.bio) dst.desc = src.bio;
      if (src.first) dst.chapter = src.first;
      if (src.faces) dst.faces = src.faces;
    });
    VN.ART_DATA = true;
  })();

  /* ===== 2. 全局状态与设置 ===== */
  var DEFAULT_SETTINGS = { textSpeed: 'normal', autoSpeed: 'normal', bgm: 55, sfx: 65 };
  var SPEED = { slow: 42, normal: 22, fast: 10, instant: 0 };
  var AUTO = { slow: 2600, normal: 1500, fast: 850 };
  function freshGlobal() {
    return {
      v: 1,
      settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
      run: { morale: 60, trust: 50, hope: 55, flags: {}, records: {} },
      progress: {},
      unlocked: { chars: {}, archives: {}, cgs: {}, bgs: {} },
      /* 已读集合：{ 章id: { '步指纹': 1 } }。
       * 用于「只快进已读」——没有它，二周目想跳过熟悉的部分就会把没读的一起冲掉。
       * 指纹取自步内容而不是步号，所以剧情被编辑过也不会整章失效（见 stepKey）。 */
      read: {},
      startedAt: Date.now()
    };
  }
  VN.G = VN.save.global() || freshGlobal();
  (function migrate() {
    var g = VN.G;
    g.settings = g.settings || JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    Object.keys(DEFAULT_SETTINGS).forEach(function (k) {
      if (g.settings[k] === undefined) g.settings[k] = DEFAULT_SETTINGS[k];
    });
    g.run = g.run || { morale: 60, trust: 50, hope: 55, flags: {}, records: {} };
    g.progress = g.progress || {};
    g.unlocked = g.unlocked || { chars: {}, archives: {}, cgs: {}, bgs: {} };
    ['chars', 'archives', 'cgs', 'bgs'].forEach(function (k) { if (!g.unlocked[k]) g.unlocked[k] = {}; });
    if (!g.read || typeof g.read !== 'object') g.read = {};
  })();
  VN.settings = VN.G.settings;
  VN.persist = function () { VN.save.putGlobal(VN.G); };

  /* ===== 3. 运行时状态 ===== */
  VN.state = {
    chapter: null, frames: [], morale: 60, trust: 50, hope: 55,
    flags: {}, records: {}, history: [], weather: null,
    waiting: false, typing: false, choice: false, choiceIndex: 0,
    running: false, hideUI: false, blockKind: null, title: ''
  };

  /* ===== 4. DOM ===== */
  var D = {};
  function cacheDom() {
    D.stage = $('stage');
    D.bgA = $('bg-a'); D.bgB = $('bg-b');
    D.cgLayer = $('cg-layer'); D.cgImg = $('cg-img');
    D.slots = {
      left: document.querySelector('#char-layer .slot[data-slot="left"]'),
      center: document.querySelector('#char-layer .slot[data-slot="center"]'),
      right: document.querySelector('#char-layer .slot[data-slot="right"]')
    };
    Object.keys(D.slots).forEach(function (k) { if (D.slots[k]) D.slots[k].dataset.empty = '1'; });
    D.dialogue = $('dialogue');
    D.namePlate = $('name-plate');
    D.nameText = $('name-text');
    D.textMain = $('text-main');
    D.textCaret = $('text-caret');
    D.nextArrow = $('next-arrow');
    D.choiceLayer = $('choice-layer');
    D.choicePrompt = $('choice-prompt');
    D.choiceList = $('choice-list');
    D.titlecard = $('titlecard');
    D.tcText = D.titlecard.querySelector('.tc-text');
    D.tcSub = D.titlecard.querySelector('.tc-sub');
    D.noteLayer = $('note-layer');
    D.noteText = $('note-text');
    D.chapterTagText = $('chapter-tag-text');
    D.meters = {};
    Array.prototype.forEach.call(document.querySelectorAll('.meter'), function (m) {
      /* 「人话翻译」行由引擎注入，index.html 不必改结构；已存在就复用。 */
      var note = m.querySelector('.meter-note');
      if (!note) { note = el('span', 'meter-note'); m.appendChild(note); }
      D.meters[m.dataset.k] = {
        root: m, fill: m.querySelector('i'), val: m.querySelector('.meter-val'), note: note
      };
    });
    D.quickbar = $('quickbar');
    D.toastLayer = $('toast-layer');
    D.cgCaption = $('cg-caption');
    D.loading = $('loading');
    D.overlay = $('overlay');
    D.fxFlash = $('fx-flash');
    D.fxFade = $('fx-fade');
    D.canvas = $('fx-canvas');
  }

  function fitUnit() {
    var u = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    if (!isFinite(u) || u <= 0) u = 1;
    document.documentElement.style.setProperty('--u', u + 'px');
  }

  /* ===== 5. 背景 ===== */
  var bgFrontIsA = true;
  /* 尚未执行的「熄灭旧前景」定时器句柄。
   * 【已修复的 bug】原来这里不保存句柄，于是当两次背景切换间隔 < 660ms 时
   * （快进 / 自动播放 / 玩家长按空格时经常发生），前一次切换排定的定时器会在
   * 后一次切换**刚把新图层淡入之后**才执行，把那一层重新熄灭：两层同时
   * opacity:0，画面变成没有背景的纯黑，直到下一次 bg 切换才恢复。
   * 修法：开始新切换前先取消上一次尚未执行的熄灭定时器，并加一道
   * 「待熄灭的那层如果已经重新成为前景，就别再动它」的保护。
   * —— 由 root 修复（用 tools/e2e-steps.js 复现并验证） */
  var bgCleanupTimer = 0;
  function setBg(id, fx, opts) {
    opts = opts || {};
    if (!D.bgA) return;
    /* 新的背景一上来，舞台上的插画就该退场了（它是舞台底层，不是常驻图层）。 */
    if (D.cgLayer && !D.cgLayer.classList.contains('hidden')) hideCg(false);
    var cands = opts.full ? cgCandidates(id) : bgCandidates(id);
    var front = bgFrontIsA ? D.bgA : D.bgB;
    var back = bgFrontIsA ? D.bgB : D.bgA;
    if (!cands.length) {
      front.classList.remove('on');
      D.bgA.classList.remove('on');
      D.bgB.classList.remove('on');
      return;
    }
    /* 前台那层已经显示的就是这个 id 的某一条候选（位图或矢量），不用再切一次。 */
    if (front.classList.contains('on') && cands.indexOf(front.getAttribute('src')) >= 0) return;
    clearTimeout(bgCleanupTimer);
    bgCleanupTimer = 0;
    /* 转场时长：优先用剧本给的 ms，其次按 fx 给默认值。
     *   dissolve —— 长一点的缓入缓出交叉溶解（默认 1100ms）
     *   fade     —— 常规淡入（默认 620ms，与 css 的默认 transition 一致）
     * 以前这两个值渲染结果完全一样（engine.js 里连 'dissolve' 字符串都没有），
     * 作者写的 106 处 ms 也全部被丢弃。—— 由 root 修复 */
    var dur = Math.max(0, (opts.ms | 0) || (fx === 'dissolve' ? 1100 : 620));
    var probe = new Image();
    probe.onload = function () {
      back.setAttribute('src', probe.src);
      back.classList.remove('slow-zoom');
      back.style.transitionDuration = dur + 'ms';
      back.style.transitionTimingFunction = (fx === 'dissolve') ? 'cubic-bezier(.4,0,.6,1)' : '';
      void back.offsetWidth;
      if (fx === 'cut' || fx === 'black') {
        back.style.transition = 'none';
        setTimeout(function () { back.style.transition = ''; }, 40);
      }
      back.classList.add('on');
      if (fx === 'flash') { applyFx('flash', 90); }
      if (opts.zoom !== false) back.classList.add('slow-zoom');
      bgFrontIsA = !bgFrontIsA;
      var dying = front;
      bgCleanupTimer = setTimeout(function () {
        bgCleanupTimer = 0;
        /* 这一层若在等待期间又变成了当前前景，说明它已被新的切换重新启用，不能再熄灭它 */
        if (dying === (bgFrontIsA ? D.bgA : D.bgB)) return;
        dying.classList.remove('on', 'slow-zoom');
        /* 用完把内联时长清掉，避免影响后续没有 ms 的切换 */
        dying.style.transitionDuration = '';
        dying.style.transitionTimingFunction = '';
      }, (fx === 'cut' || fx === 'black') ? 0 : dur + 60);
      unlock('bgs', id);
    };
    /* 候选逐级回退：位图缺失/加载失败 → 同名矢量；全部失败才静默保留上一张背景。 */
    var ci = 0;
    probe.onerror = function () {
      ci++;
      if (ci < cands.length) probe.src = cands[ci];
    };
    probe.src = cands[0];
  }

  /* ===== 6. 立绘 ===== */
  function slotOf(who, slot) {
    if (slot && D.slots[slot]) return D.slots[slot];
    var found = null;
    Object.keys(D.slots).forEach(function (k) {
      if (D.slots[k] && D.slots[k].dataset.who === who && D.slots[k].dataset.empty !== '1') found = D.slots[k];
    });
    if (found) return found;
    var occupied = {};
    Object.keys(D.slots).forEach(function (k) {
      if (D.slots[k] && D.slots[k].dataset.empty !== '1') occupied[k] = 1;
    });
    if (!occupied.center) return D.slots.center;
    if (!occupied.left) return D.slots.left;
    if (!occupied.right) return D.slots.right;
    return D.slots.center;
  }

  /* ===== 6.1 立绘的两条不变式（由 root 补） =====
   * 【修复的 bug 1】同一个角色同时出现在两个槽位。
   *   slotOf(who, slot) 在剧本显式写了 slot 时会无条件采用该槽，于是
   *   「人已经在左槽，又被 show 到右槽」就变成同屏两张一样的脸。
   *   现在 showChar 上屏前先把该角色的其它槽位收掉，等于"挪过去"。
   * 【修复的 bug 2】说话的人不在台上（只闻其声、不见其人）。
   *   say/think 原来只在带 face 时才让说话人登场；而 SPEC §3.2 允许
   *   "face 与上一次相同可省略"，作者省略 face 时，只要这一幕里他没被
   *   show 过，姓名条就会配着一张空舞台。现在 say/think 会兜底把人补上场，
   *   表情沿用他本章最近一次用过的表情（没有就用 calm）。
   *   群众 id（战士/乡亲/彝族同胞/旁白）不在此列：它们是"声音"，本来就允许离场。
   * 复现与复验：tools/qa-consistency.js（全剧扫描说话人是否在台上）。
   * —— 由 root 修复 */
  var CROWD_IDS = { soldiers: 1, villagers: 1, yi_people: 1, narrator: 1 };
  var charFace = {};                       /* 本章每个角色最近一次用过的表情 */
  function onStageSlotOf(who) {
    var hit = null;
    Object.keys(D.slots).forEach(function (k) {
      var s = D.slots[k];
      if (s && s.dataset.who === who && s.dataset.empty !== '1') hit = s;
    });
    return hit;
  }
  function ensureOnStage(who) {
    if (!who || CROWD_IDS[who]) return;
    if (!VN.CHARACTERS[who]) return;       /* 未知 id 交给 tools/lint-story.js 报错 */
    if (onStageSlotOf(who)) return;
    showChar(who, charFace[who] || 'calm', null, 'fadein');
  }
  function showChar(who, face, slot, fx) {
    if (!who) return;
    face = FACES.indexOf(face) >= 0 ? face : 'calm';
    charFace[who] = face;
    var s = slotOf(who, slot);
    if (!s) return;
    var img = s.querySelector('img');
    var paths = charPaths(who, face);
    if (s.dataset.who === who && s.dataset.face === face && s.classList.contains('on')) return;
    var probe = new Image();
    var tryIndex = 0;
    probe.onload = function () {
      img.setAttribute('src', probe.src);
      hideChar(who, s);                    /* 同一个人只留一个槽 */
      s.dataset.who = who;
      s.dataset.face = face;
      s.dataset.empty = '0';
      s.classList.remove('leaving');
      s.classList.add('on');
      if (fx === 'pop') { s.classList.add('pop'); requestAnimationFrame(function () { s.classList.remove('pop'); }); }
      else if (fx !== 'fadein') { s.classList.add('slidein'); requestAnimationFrame(function () { s.classList.remove('slidein'); }); }
      unlock('chars', who);
    };
    probe.onerror = function () {
      /* 首选格式缺失时依次回退；全部失败则静默不显示 */
      tryIndex++;
      if (tryIndex < paths.length) probe.src = paths[tryIndex];
    };
    probe.src = paths[tryIndex];
  }
  function hideChar(who, except) {
    Object.keys(D.slots).forEach(function (k) {
      var s = D.slots[k];
      if (!s || s === except) return;
      if (who && s.dataset.who !== who) return;
      s.classList.add('leaving');
      s.classList.remove('on');
      s.dataset.empty = '1';
      s.dataset.who = '';
      setTimeout(function () { s.classList.remove('leaving'); }, 420);
    });
  }
  function clearChars() { hideChar(null); }
  function highlight(who) {
    Object.keys(D.slots).forEach(function (k) {
      var s = D.slots[k];
      if (!s || s.dataset.empty === '1') return;
      s.classList.toggle('talking', !!who && s.dataset.who === who);
      s.classList.toggle('dim', !!who && s.dataset.who !== who);
    });
  }

  /* ===== 7. 天气与特效 ===== */
  var particles = { mode: null, items: [], t: 0, raf: 0, W: 0, H: 0, dpr: 1 };
  function fxResize() {
    if (!D.canvas) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    particles.dpr = dpr;
    particles.W = D.canvas.width = Math.floor(window.innerWidth * dpr);
    particles.H = D.canvas.height = Math.floor(window.innerHeight * dpr);
  }
  function weatherSeed(mode) {
    var n = mode === 'rain' ? 240 : mode === 'snow' ? 190 : mode === 'ash' ? 120 : 200;
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({
        x: Math.random(), y: Math.random(),
        v: 0.4 + Math.random() * (mode === 'rain' ? 1.5 : 0.7),
        s: Math.random(), w: 0.5 + Math.random()
      });
    }
    return arr;
  }
  function setWeather(mode) {
    if (particles.mode === mode) return;
    particles.mode = mode;
    particles.items = mode ? weatherSeed(mode) : [];
    if (!mode) {
      if (particles.raf) cancelAnimationFrame(particles.raf);
      particles.raf = 0;
      if (D.canvas && D.canvas.getContext) {
        D.canvas.getContext('2d').clearRect(0, 0, particles.W, particles.H);
      }
      return;
    }
    if (!particles.raf) { particles.t = 0; particles.raf = requestAnimationFrame(drawWeather); }
  }
  function drawWeather() {
    var ctx = D.canvas.getContext('2d');
    var W = particles.W, H = particles.H, dpr = particles.dpr, m = particles.mode;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.items.length; i++) {
      var p = particles.items[i];
      p.y += p.v * (0.0022 + 0.003 * p.s) * (m === 'rain' ? 3.4 : 1);
      p.x += (m === 'rain' ? -0.0012 : 0.0007 * Math.sin((particles.t / 60) + p.s * 9));
      if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
      if (m === 'rain') {
        ctx.strokeStyle = 'rgba(174,196,220,' + (0.16 + 0.24 * p.w) + ')';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(p.x * W, p.y * H);
        ctx.lineTo(p.x * W - 7 * dpr, p.y * H + 46 * dpr * p.v);
        ctx.stroke();
      } else if (m === 'snow') {
        ctx.fillStyle = 'rgba(238,246,252,' + (0.35 + 0.5 * p.w) + ')';
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, (0.9 + 2.1 * p.s) * dpr, 0, 6.2832);
        ctx.fill();
      } else if (m === 'ash') {
        ctx.fillStyle = 'rgba(190,186,176,' + (0.2 + 0.4 * p.w) + ')';
        ctx.fillRect(p.x * W, p.y * H, 1.6 * dpr, 1.6 * dpr);
      } else if (m === 'star') {
        var tw = 0.35 + 0.65 * Math.abs(Math.sin(particles.t / 90 + p.s * 12));
        ctx.fillStyle = 'rgba(255,240,208,' + (0.25 + 0.6 * tw) + ')';
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H * 0.62, (0.7 + 1.5 * p.s) * dpr, 0, 6.2832);
        ctx.fill();
      }
    }
    particles.t += 1;
    particles.raf = requestAnimationFrame(drawWeather);
  }
  function applyFx(kind, ms) {
    if (kind === 'rain' || kind === 'snow' || kind === 'ash' || kind === 'star') { setWeather(kind); return; }
    if (kind === 'flash') {
      D.fxFlash.classList.add('hit');
      setTimeout(function () { D.fxFlash.classList.remove('hit'); }, ms || 90);
      return;
    }
    if (kind === 'shake') {
      D.stage.classList.add('shake');
      setTimeout(function () { D.stage.classList.remove('shake'); }, ms || 460);
      return;
    }
    if (kind === 'fadeout') { D.fxFade.classList.add('on'); return; }
    if (kind === 'fadein') { D.fxFade.classList.remove('on'); return; }
    if (kind === 'blood') {
      D.fxFlash.style.background = 'rgba(140,31,34,.85)';
      D.fxFlash.classList.add('hit');
      setTimeout(function () {
        D.fxFlash.classList.remove('hit');
        setTimeout(function () { D.fxFlash.style.background = '#fff'; }, 300);
      }, ms || 140);
      return;
    }
  }

  /* ===== 8. 打字机 ===== */
  var typeTimer = 0, typeFull = '', typePos = 0, typeDone = null;
  function typeText(target, text, speed, onDone) {
    clearTimeout(typeTimer);
    typeFull = text; typePos = 0; typeDone = onDone || null;
    if (speed <= 0) {
      target.textContent = text;
      VN.state.typing = false;
      D.dialogue.classList.remove('typing');
      if (typeDone) { var f = typeDone; typeDone = null; f(); }
      return;
    }
    VN.state.typing = true;
    D.dialogue.classList.add('typing');
    target.textContent = '';
    var step = function () {
      typePos += 1;
      target.textContent = typeFull.slice(0, typePos);
      if (typePos >= typeFull.length) {
        VN.state.typing = false;
        D.dialogue.classList.remove('typing');
        var cb = typeDone; typeDone = null;
        if (cb) cb();
        return;
      }
      typeTimer = setTimeout(step, speed);
    };
    typeTimer = setTimeout(step, speed);
  }
  function finishTyping() {
    if (!VN.state.typing) return false;
    clearTimeout(typeTimer);
    D.textMain.textContent = typeFull;
    VN.state.typing = false;
    D.dialogue.classList.remove('typing');
    var cb = typeDone; typeDone = null;
    if (cb) cb();
    return true;
  }

  /* ===== 9. 对白 ===== */
  function showDialogue(kind, who, text, note) {
    var speed = SPEED[VN.settings.textSpeed];
    if (speed === undefined) speed = SPEED.normal;
    D.dialogue.classList.remove('hidden', 'narr', 'think');
    if (kind === 'narr') {
      D.dialogue.classList.add('narr');
      D.namePlate.classList.add('hidden');
    } else if (kind === 'think') {
      D.dialogue.classList.add('think');
      D.namePlate.classList.remove('hidden', 'narr');
      D.nameText.textContent = charName(who) + '（心）';
      text = '（' + text + '）';
    } else {
      D.namePlate.classList.remove('hidden', 'narr');
      D.nameText.textContent = charName(who);
    }
    setNote(note);
    highlight(kind === 'narr' ? null : who);
    if (kind !== 'narr' && who) unlock('chars', who);
    VN.state.history.push({ kind: kind, who: who || '', name: kind === 'narr' ? '' : charName(who), text: text });
    if (VN.state.history.length > 800) VN.state.history.shift();
    D.nextArrow.classList.remove('on');
    typeText(D.textMain, text, speed, function () {
      if (!VN.state.choice) D.nextArrow.classList.add('on');
      if (autoOn) scheduleAuto();
    });
  }
  function setNote(note) {
    if (note) {
      D.noteText.textContent = note;
      D.noteLayer.classList.remove('hidden');
      requestAnimationFrame(function () { D.noteLayer.classList.add('on'); });
    } else {
      D.noteLayer.classList.remove('on');
      D.noteLayer.classList.add('hidden');
    }
  }

  /* ===== 10. 标题卡 / CG / 解锁 / 提示 ===== */
  var cardTimer = 0;
  function showTitleCard(text, sub, ms, onEnd) {
    clearTimeout(cardTimer);
    D.tcText.textContent = text || '';
    D.tcSub.textContent = sub || '';
    D.titlecard.classList.remove('hidden');
    requestAnimationFrame(function () { D.titlecard.classList.add('on'); });
    cardTimer = setTimeout(function () {
      D.titlecard.classList.remove('on');
      setTimeout(function () { D.titlecard.classList.add('hidden'); }, 760);
      if (onEnd) onEnd();
    }, ms || 2400);
  }
  /* ---- 全屏插画（重要事件 CG）----
   * 与老实现（把插画直接当背景 setBg 进去）的区别：
   *   ① 位图和矢量两种来源都认，缺图时按 cgCandidates() 逐级回退，不会留白；
   *   ② 画面上多一层「慢速推近 / 横移」的运镜（ken-burns），一静到底的图也有呼吸；
   *   ③ 图注逐字打出来，而不是整块淡入——玩家的视线有个落点；
   *   ④ 它是舞台底层，立绘/特效/暗角照旧叠在上面，直到下一次 bg 步骤才退场，
   *      所以 `cg` 后面紧跟的 `narr` / `say` 仍然停在这张插画上（老剧本的观感不变）。 */
  var cgTimer = 0, cgTypeTimer = 0, cgHideTimer = 0, cgSeq = 0;
  /* 'impact' 是给炮击/爆炸/撞击那一刻用的：进场先抖一下再沉下来（见 css 的 cgImpact）。 */
  var CG_MOTIONS = { 'zoom-in': 1, 'pan-left': 1, 'pan-right': 1, 'still': 1, 'impact': 1 };

  function hideCg(immediate) {
    if (!D.cgLayer) return;
    /* 作废"在飞的"这一次插画：迟到的 onload 与迟到的 rAF 都不许再把图或 .on 贴回来。
       没有这一步会出现两种真实的坏状态（都实测到过）：
         · 位图解码比剧本推进慢时，paint() 的 rAF 在 hideCg() 之后才跑 ——
           图层被"点亮"了，可 src 已被清掉，屏幕上是空的（探针读到 cg-layer:ON:-）。
         · 更早一次 CG 的 onload 迟到，会把已经退场的旧插画重新按回台上。 */
    cgSeq++;
    clearTimeout(cgHideTimer);
    clearInterval(cgTypeTimer);
    D.cgCaption.classList.remove('on');
    cgHideTimer = setTimeout(function () {
      D.cgLayer.classList.remove('on');
      D.cgLayer.classList.add('hidden');
      D.cgImg.removeAttribute('src');
      D.cgCaption.classList.add('hidden');
    }, immediate ? 0 : 420);
    if (immediate) { D.cgLayer.classList.remove('on'); D.cgLayer.classList.add('hidden'); D.cgImg.removeAttribute('src'); }
  }

  function cgCaptionType(text, ms) {
    clearInterval(cgTypeTimer);
    if (!text) { D.cgCaption.classList.add('hidden'); return; }
    D.cgCaption.textContent = '';
    D.cgCaption.classList.remove('hidden');
    void D.cgCaption.offsetWidth;
    D.cgCaption.classList.add('on');
    /* 打字速度跟着停留时长走：图停得久就慢慢打，短促的一击就快些，
       但始终保证全句在图还在的时候读完。 */
    var step = Math.max(34, Math.min(120, Math.round((ms || 4200) * 0.55 / Math.max(6, text.length))));
    var i = 0;
    cgTypeTimer = setInterval(function () {
      i++;
      D.cgCaption.textContent = text.slice(0, i);
      if (i >= text.length) clearInterval(cgTypeTimer);
    }, step);
  }

  function showCg(id, text, ms, onEnd, opts) {
    opts = opts || {};
    ms = ms || 4200;
    if (!D.cgLayer || !D.cgImg) { if (onEnd) setTimeout(onEnd, ms); return; }
    var seq = ++cgSeq;
    var cands = cgCandidates(id);
    var motion = CG_MOTIONS[opts.motion] ? opts.motion : 'zoom-in';
    var i = 0;
    function reveal() {
      D.cgLayer.classList.remove('hidden');
      /* 强制回流，让 0 → 1 的淡入真的从 0 开始（与引擎其它地方同一手法）。
         然后**同步**点亮。原来这里把 classList.add('on') 放在 requestAnimationFrame 里：
         rAF 在两种真实场景下根本不跑 —— ①无头浏览器/探针里帧调度被饿死；
         ②玩家把标签页切到后台时浏览器会暂停渲染。结果是「图已经拿到、src 也对，
         但 cg-layer 永远停在 opacity:0」——插画整段消失，而引擎一切"正常"。
         实测复现：ch15 的泸定桥插画，cg-img.src = cg/cg_luding_race.png、complete=true，
         而 #cg-layer 的 className 为空、getComputedStyle().opacity = 0。
         —— 由 root 改成同步点亮（rAF 保留为幂等的兜底）。 */
      void D.cgLayer.offsetWidth;
      D.cgLayer.classList.add('on');
      requestAnimationFrame(function () { if (seq === cgSeq) D.cgLayer.classList.add('on'); });
    }
    /* 直接在可见的 <img> 上换源，借它的 onload / onerror 逐级回退 ——
       不再用"替身探针"预加载：那是个游离的 Image，1.4MB 的位图解码要上百毫秒，
       它可能在加载完成前就被回收，于是 onload 永不触发、插画永远不上屏
       （实测：ch01 的 CG 列由 1 变 0，而 cg-layer 停在"亮了但没有图"的状态）。 */
    function trySrc() {
      if (seq !== cgSeq) return;
      if (i >= cands.length) { advise('CG 没有可用的图：' + id); hideCg(true); return; }
      D.cgImg.onload = function () {
        if (seq !== cgSeq) return;
        clearTimeout(cgHideTimer);
        D.cgImg.className = '';
        void D.cgImg.offsetWidth;               /* 强制回流，让同类运镜也能重新播一遍 */
        D.cgImg.className = 'm-' + motion;
        D.cgImg.style.animationDuration = Math.max(2600, ms) + 'ms';
        reveal();
      };
      D.cgImg.onerror = function () { if (seq !== cgSeq) return; i++; trySrc(); };
      D.cgImg.setAttribute('src', cands[i]);
    }
    trySrc();
    unlock('cgs', id);
    cgCaptionType(text, ms);
    clearTimeout(cgTimer);
    cgTimer = setTimeout(function () { if (onEnd) onEnd(); }, ms);
  }
  function unlock(kind, id) {
    if (!id) return;
    var bucket = VN.G.unlocked[kind];
    if (!bucket || bucket[id]) return;
    bucket[id] = 1;
    VN.persist();
    if (kind === 'chars') toast('人物图鉴 · ' + charName(id));
  }
  function unlockArchive(entry) {
    if (!entry || !entry.id) return;
    if (VN.G.unlocked.archives[entry.id]) return;
    VN.G.unlocked.archives[entry.id] = 1;
    VN.persist();
    toast('史料档案 · ' + entry.title);
  }
  function toast(msg, cls, ms) {
    if (!D.toastLayer) return;
    var t = el('div', 'toast' + (cls ? ' ' + cls : ''), msg);
    D.toastLayer.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, ms || 3200);
  }

  /* ===== 11. HUD ===== */
  /* 三条数值的「人话翻译」。数值本身玩家读不出意义，给一句状态描述才知道自己在乎什么。
   * 区间划分与 docs/PLAYABILITY-REVIEW.md 轴 A1 一致：≥75 / 45–74 / ≤44。 */
  var METER_NOTE = {
    morale: ['队伍还愿意跟着走', '走得动，但没人说话', '掉队的比说话的多'],
    trust: ['有话肯当面说', '有话说一半', '各走各的'],
    hope: ['知道为什么走', '只知道往哪走', '只是在走']
  };
  function syncMeters(flash) {
    ['morale', 'trust', 'hope'].forEach(function (k) {
      var m = D.meters[k];
      if (!m) return;
      var v = clamp(VN.state[k] | 0, 0, 100);
      m.fill.style.width = v + '%';
      m.val.textContent = v;
      if (m.note) {
        var band = v >= 75 ? 0 : (v >= 45 ? 1 : 2);
        var txt = (METER_NOTE[k] || [])[band] || '';
        if (m.note.textContent !== txt) m.note.textContent = txt;
        if (m.note.dataset.band !== String(band)) m.note.dataset.band = String(band);
      }
      if (flash) {
        m.root.classList.add('flash');
        setTimeout(function () { m.root.classList.remove('flash'); }, 430);
      }
    });
  }
  function setChapterTag(text) { if (D.chapterTagText) D.chapterTagText.textContent = text || ''; }

  /* ===== 12. 变量与条件 ===== */
  function getVar(path) {
    if (!path) return undefined;
    var parts = String(path).split('.');
    if (parts[0] === 'flag') return VN.state.flags[parts.slice(1).join('.')];
    if (parts[0] === 'rec') return VN.state.records[parts.slice(1).join('.')];
    if (parts.length === 1) return VN.state[parts[0]];
    return undefined;
  }
  function applyOp(cur, op, value, isFlag) {
    if (op === '=' || op === undefined) return value;
    var n = (typeof cur === 'number') ? cur : (isFlag ? 0 : 0);
    var v = (typeof value === 'number') ? value : 0;
    if (op === '+=') return n + v;
    if (op === '-=') return n - v;
    if (op === 'max') return Math.max(n, v);
    if (op === 'min') return Math.min(n, v);
    return value;
  }
  function setVar(path, op, value) {
    if (!path) return;
    var parts = String(path).split('.');
    if (parts[0] === 'flag') {
      var key = parts.slice(1).join('.');
      VN.state.flags[key] = applyOp(VN.state.flags[key], op, value, true);
      return;
    }
    if (parts[0] === 'rec') { VN.state.records[parts.slice(1).join('.')] = value; return; }
    if (parts.length === 1) {
      if (parts[0] === 'morale' || parts[0] === 'trust' || parts[0] === 'hope') {
        VN.state[parts[0]] = clamp(applyOp(VN.state[parts[0]], op, value, false), 0, 100);
        syncMeters(true);
      } else {
        VN.state[parts[0]] = applyOp(VN.state[parts[0]], op, value, false);
      }
    }
  }
  function evalCond(cond) {
    if (!cond) return true;
    if (cond.all) return cond.all.every(evalCond);
    if (cond.any) return cond.any.some(evalCond);
    if (cond.not) return !evalCond(cond.not);
    var a = getVar(cond.var), b = cond.value, op = cond.op || '=';
    switch (op) {
      case '=': return a === b || String(a) === String(b);
      case '!=': return !(a === b || String(a) === String(b));
      case '>': return Number(a) > Number(b);
      case '>=': return Number(a) >= Number(b);
      case '<': return Number(a) < Number(b);
      case '<=': return Number(a) <= Number(b);
    }
    return false;
  }

  /* ===== 13. 剧本解释器 ===== */
  var autoOn = false, skipOn = false, skipMode = 'all', autoTimer = 0, skipTimer = 0;
  var currentChapter = null, currentChoiceStep = null;
  /* 当前正停在屏幕上的「内容步」（对白 / 旁白 / 独白 / 插画 / 标题卡）。
   * 「只快进已读」靠它判断这一屏玩家到底看过没有。 */
  var curGateStep = null;
  var readDirty = false;

  /* ---- 已读指纹 ----
   * 用「步类型 + 说话人 + 正文前 12 字」当指纹，而不是用步号：
   * 剧情被编辑（增删步骤）时，只有被改到的那几句会失效，不会整章作废。 */
  function stepKey(s) {
    if (!s) return '';
    var body = s.text || s.prompt || '';
    return s.t + '|' + (s.who || '') + '|' + body.slice(0, 12);
  }
  function isRead(s) {
    if (!s || !VN.state.chapter) return false;
    var b = VN.G.read && VN.G.read[VN.state.chapter];
    return !!(b && b[stepKey(s)]);
  }
  function markRead(s) {
    if (!s || !VN.state.chapter) return;
    if (!VN.G.read) VN.G.read = {};
    var b = VN.G.read[VN.state.chapter] || (VN.G.read[VN.state.chapter] = {});
    var key = stepKey(s);
    if (!b[key]) { b[key] = 1; readDirty = true; }
  }
  /* 逐句写 localStorage 太重，攒到自动存档点再落盘（见 autosaveTick / endChapter）。 */
  function flushRead() {
    if (!readDirty) return;
    readDirty = false;
    VN.persist();
  }

  /* ===== 13.2 倒退播放 =====
   * 口令解锁的能力：在游戏里往回退若干行，重新看一遍。
   *
   * 为什么是「快照 + 直接还原画面」而不是「回到前面再放一遍」：
   * 剧本里的 set 大多是 += / -=，重放会把数值叠第二遍；所以只能把
   * 那一刻的状态整份取回来。画面（背景 / 立绘 / 天气 / 插画）同样要一起还原，
   * 因为倒退之后 run() 只会重新执行**当前这一行**，不会重跑它前面那些 bg/show。
   *
   * 记的是「步下标」而不是剧本数组的引用，章节文件被改过也不会把帧栈指飞。 */
  var REWIND_MAX = 60;
  var REWIND_KINDS = { say: 1, narr: 1, think: 1, cg: 1, title: 1 };
  var rewindBuf = [];
  var suppressRecord = false;             /* applyRewind 之后重放当前行，不许再记一遍 */
  function copyMap(o) {
    var r = {};
    if (o) Object.keys(o).forEach(function (k) { r[k] = o[k]; });
    return r;
  }
  function captureVisual() {
    var front = bgFrontIsA ? D.bgA : D.bgB;
    var chars = [];
    Object.keys(D.slots).forEach(function (k) {
      var s = D.slots[k];
      if (!s || s.dataset.empty === '1' || !s.dataset.who) return;
      chars.push({ slot: k, who: s.dataset.who, face: s.dataset.face || 'calm' });
    });
    return { bg: front ? (front.getAttribute('src') || '') : '', chars: chars };
  }
  function restoreVisual(v) {
    if (!v) return;
    hideCg(true);                          /* 插画是覆盖层；要显示的那一步会自己再点亮 */
    var front = bgFrontIsA ? D.bgA : D.bgB;
    var back = bgFrontIsA ? D.bgB : D.bgA;
    if (front && v.bg) {
      if (front.getAttribute('src') !== v.bg) front.setAttribute('src', v.bg);
      front.style.transition = 'none';
      front.classList.add('on');
      front.classList.remove('slow-zoom');
      void front.offsetWidth;
      front.style.transition = '';
    }
    if (back) back.classList.remove('on', 'slow-zoom');
    clearChars();
    (v.chars || []).forEach(function (c) { showChar(c.who, c.face, c.slot, 'fadein'); });
    setWeather(VN.state.weather || null);
  }
  function recordRewind(f, s) {
    if (!VN.G.unlockAll || !REWIND_KINDS[s.t]) return;
    if (suppressRecord) { suppressRecord = false; return; }
    var path = VN.state.frames.map(function (fr) { return { i: fr.i, kind: fr.kind }; });
    path[path.length - 1].i = f.i - 1;     /* run() 已经 f.i++ 过，当前这一步在 i-1 */
    rewindBuf.push({
      ch: VN.state.chapter,
      path: path,
      morale: VN.state.morale, trust: VN.state.trust, hope: VN.state.hope,
      flags: copyMap(VN.state.flags),
      records: copyMap(VN.state.records),
      face: copyMap(charFace),
      histLen: VN.state.history.length,
      weather: VN.state.weather,
      visual: captureVisual()
    });
    if (rewindBuf.length > REWIND_MAX) rewindBuf.shift();
  }
  /* 把「每帧的下标」还原成真正的帧栈。存档与倒退播放共用这一份实现。
   * 越界一律丢弃该层，绝不夹取 —— 夹取会把玩家送进错误的分支。 */
  function buildFrames(ch, m, path) {
    var baseSteps = chapterSteps(ch, m);
    var first = path && path[0] ? path[0].i : 0;
    var bad = false;
    if (!(first >= 0) || first >= baseSteps.length) { first = 0; bad = true; }
    var frames = [{ steps: baseSteps, i: first, kind: 'then' }];
    for (var d = 1; d < (path ? path.length : 0); d++) {
      var prev = frames[d - 1];
      var ifStep = prev.steps[prev.i - 1];
      if (!ifStep || ifStep.t !== 'if') break;
      var isElse = path[d].kind === 'else';
      var arr = isElse ? ifStep.else : ifStep.then;
      if (!arr) break;
      var sub = path[d].i || 0;
      if (!(sub >= 0) || sub >= arr.length) break;
      frames.push({ steps: arr, i: sub, kind: isElse ? 'else' : 'then' });
    }
    return { frames: frames, bad: bad };
  }
  function applyRewind(e) {
    var m = VN.manifest(e.ch);
    var ch = window.STORY && window.STORY[e.ch];
    if (!m || !ch || !ch.steps) return false;
    if (VN.state.chapter !== e.ch) {
      currentChapter = ch;
      VN.state.chapter = e.ch;
      VN.state.title = m.title;
      setChapterTag(chapterTagText(m));
      preloadChapter(ch);
      if (VN.audio) { if (ch.bgm) VN.audio.bgm(ch.bgm, { ms: 400 }); else VN.audio.stopBgm({ ms: 400 }); }
    }
    VN.state.frames = buildFrames(ch, m, e.path).frames;
    VN.state.morale = e.morale; VN.state.trust = e.trust; VN.state.hope = e.hope;
    VN.state.flags = copyMap(e.flags);
    VN.state.records = copyMap(e.records);
    VN.state.history = VN.state.history.slice(0, e.histLen);
    VN.state.weather = e.weather;
    VN.state.running = true;
    VN.state.choice = false;
    VN.state.waiting = false;
    VN.state.blockKind = null;
    charFace = copyMap(e.face);
    if (VN.state.typing) { clearTimeout(typeTimer); typeDone = null; VN.state.typing = false; D.dialogue.classList.remove('typing'); }
    clearTimeout(autoTimer);
    D.choiceLayer.classList.add('hidden');
    setNote(null);
    restoreVisual(e.visual);
    syncMeters(false);
    suppressRecord = true;
    run();                                 /* 重新执行当前这一行，把它显示回来 */
    return true;
  }
  VN.canRewind = function () { return !!(VN.G.unlockAll && rewindBuf.length > 1); };
  VN.rewindDepth = function () { return VN.G.unlockAll ? rewindBuf.length : 0; };
  VN.rewind = function (n) {
    if (!VN.G.unlockAll) { toast('这一章没有开通倒退播放'); return false; }
    if (!VN.state.running || VN.state.choice) return false;
    n = Math.max(1, n | 0);
    var moved = 0;
    while (moved < n && rewindBuf.length > 1) { rewindBuf.pop(); moved++; }
    if (!moved) { toast('已经退到这一章的开头了', 'warn', 2200); return false; }
    return applyRewind(rewindBuf[rewindBuf.length - 1]);
  };
  function topFrame() { return VN.state.frames[VN.state.frames.length - 1]; }
  function isTopLevel() { return VN.state.frames.length <= 1; }
  function block(kind, ms) {
    VN.state.waiting = true;
    VN.state.blockKind = kind;
    if (ms) {
      setTimeout(function () {
        if (VN.state.waiting && VN.state.blockKind === kind) advance();
      }, ms);
    }
  }
  function unblock() { VN.state.waiting = false; VN.state.blockKind = null; }
  function scheduleAuto() {
    if (!autoOn) return;
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () { if (autoOn) advance(); }, AUTO[VN.settings.autoSpeed] || AUTO.normal);
  }
  function indexOfLabel(steps, name) {
    for (var i = 0; i < steps.length; i++) {
      if (steps[i] && steps[i].t === 'label' && steps[i].name === name) return i;
    }
    return -1;
  }
  function findArchive(id) {
    if (!currentChapter || !currentChapter.archive) return null;
    for (var i = 0; i < currentChapter.archive.length; i++) {
      if (currentChapter.archive[i].id === id) return currentChapter.archive[i];
    }
    return null;
  }
  function advise(msg) { if (window.console && console.warn) console.warn('[VN] ' + msg); }

  function exec(s) {
    /* 每执行一步先清空「停在屏幕上的内容步」；只有下面的内容步会重新填上它。 */
    curGateStep = null;
    switch (s.t) {
      /* 把 s.ms 传下去：SPEC §2.1 允许 bg 带 ms（全剧有 106 处作者写了，
         取值 600–1400ms），但引擎原先直接把 ms 丢掉，所有转场一律 620ms。
         —— 由 root 修复（tools/e2e-steps.js 可复现） */
      case 'bg': setBg(s.id, s.fx || 'fade', { ms: s.ms }); return false;
      case 'show': showChar(s.who, s.face, s.slot, s.fx); return false;
      case 'hide': hideChar(s.who); return false;
      case 'clear': clearChars(); return false;
      case 'fx':
        if (s.kind === 'rain' || s.kind === 'snow' || s.kind === 'ash' || s.kind === 'star') VN.state.weather = s.kind;
        applyFx(s.kind, s.ms);
        return false;
      case 'bgm':
        if (VN.audio) { if (s.stop) VN.audio.stopBgm({ ms: s.ms || 900 }); else VN.audio.bgm(s.id, { ms: s.ms || 900 }); }
        return false;
      case 'sfx':
        if (VN.audio) VN.audio.sfx(s.id);
        return false;
      case 'set': setVar(s.var, s.op, s.value); return false;
      case 'label': return false;
      case 'goto': {
        var f = topFrame();
        var idx = indexOfLabel(f.steps, s.target);
        if (idx < 0) idx = indexOfLabel(currentChapter.steps, s.target);
        if (idx >= 0) f.i = idx + 1; else advise('goto 目标不存在：' + s.target);
        return false;
      }
      case 'unlock':
        if (s.kind === 'char') unlock('chars', s.id);
        else if (s.kind === 'cg') unlock('cgs', s.id);
        else if (s.kind === 'archive') unlockArchive(findArchive(s.id));
        return false;
      case 'if': {
        /* kind 必须记下来：存档与倒退播放在还原帧栈时，要凭它决定回哪一支。
           原先帧里没有这一位，于是"在 else 支里存档、读档后却进了 then 支"。 */
        var chose = evalCond(s.cond);
        var branch = chose ? s.then : s.else;
        if (branch && branch.length) VN.state.frames.push({ steps: branch, i: 0, kind: chose ? 'then' : 'else' });
        return false;
      }
      case 'wait':
        block('wait', Math.max(0, s.ms | 0));
        return true;
      case 'title':
        block('title', 2400);
        curGateStep = s; markRead(s);
        showTitleCard(s.text, s.sub, 2400, function () { if (VN.state.blockKind === 'title') advance(); });
        return true;
      case 'note':
        setNote(s.text);
        return false;
      case 'cg':
        /* 停留时长：剧本写了 ms 就用它；否则查 CG 表里的条目（默认 4400ms，
           比老实现的 3200ms 长一点——插画值得多看一秒）。图注默认取表里的
           caption，剧本里的 text 优先。 */
        var cgInfo = cgEntry(s.id);
        var cgMs = s.ms || 4400;
        var cgText = (s.text != null) ? s.text : (cgInfo ? cgInfo.caption : '');
        block('cg', cgMs);
        curGateStep = s; markRead(s);
        showCg(s.id, cgText, cgMs, function () { if (VN.state.blockKind === 'cg') advance(); },
          { motion: s.motion || (cgInfo ? cgInfo.motion : '') });
        return true;
      case 'narr':
        curGateStep = s; markRead(s);
        showDialogue('narr', null, s.text, s.note);
        block('text');
        return true;
      case 'think':
        curGateStep = s; markRead(s);
        if (s.noPortrait) hideChar(s.who); else ensureOnStage(s.who);
        showDialogue('think', s.who, s.text, s.note);
        block('text');
        return true;
      case 'say':
        curGateStep = s; markRead(s);
        /* noPortrait: 这一句不要立绘。
         * 引擎有条不变式「说话的人必须在台上」（否则姓名条会配一张空舞台），
         * 但有些叙事画面要的恰恰是「画面里只有那个东西」——
         * 例：第三章「每人三发」那段，主体必须只是三颗子弹，不能被立绘压在中间。
         * 这类写法必须显式声明（不是靠画面类型猜），所以给内容侧一个开关。
         * —— 由 root 追加（SPEC §2.1 同步登记） */
        if (s.noPortrait) hideChar(s.who);
        else if (s.face) showChar(s.who, s.face, s.slot);
        /* 没写 face 时按 SPEC 的本意是"沿用上一次的表情"，但前提是人得在台上：
           这一幕没 show 过他，就兜底补上场，否则姓名条会配一张空舞台。 */
        else ensureOnStage(s.who);
        showDialogue('say', s.who, s.text, s.note);
        block('text');
        return true;
      case 'choice':
        currentChoiceStep = s;
        showChoice(s);
        return true;
      case 'end':
        endChapter(s.next);
        return true;
      default:
        advise('未知 step 类型：' + s.t);
        return false;
    }
  }

  function run() {
    if (!VN.state.running) return;
    var guard = 0;
    while (guard++ < 6000) {
      var f = topFrame();
      if (!f) { endChapter(null); return; }
      if (f.i >= f.steps.length) {
        VN.state.frames.pop();
        if (!VN.state.frames.length) { endChapter(null); return; }
        continue;
      }
      var s = f.steps[f.i++];
      if (!s) continue;
      autosaveTick();
      /* 记在 exec 之前：要的是「这一行显示之前」的状态，
         以后退回来才能把它原样再显示一遍。 */
      recordRewind(f, s);
      if (exec(s)) return;
    }
    advise('单帧执行步数超限，可能存在死循环');
  }
  function advance() {
    if (!VN.state.running) return;
    if (VN.state.choice) return;
    if (finishTyping()) return;
    unblock();
    clearTimeout(autoTimer);
    run();
  }
  var lastAdvance = 0;
  function userAdvance() {
    var t = nowMs();
    if (t - lastAdvance < 60) return;
    lastAdvance = t;
    if (VN.state.hideUI) { toggleUI(); return; }
    advance();
  }

  /* ===== 14. 选项 ===== */
  function showChoice(s) {
    VN.state.choice = true;
    VN.state.waiting = true;
    VN.state.blockKind = 'choice';
    VN.state.choiceIndex = 0;
    D.choiceLayer.classList.remove('hidden');
    D.choicePrompt.textContent = s.prompt || '';
    D.choicePrompt.classList.toggle('hidden', !s.prompt);
    D.choiceList.innerHTML = '';
    var opts = s.options || [];
    opts.forEach(function (o, i) {
      var b = el('button', 'choice-btn');
      b.appendChild(el('span', 'choice-key', String(i + 1)));
      b.appendChild(el('span', 'choice-text', o.text));
      if (o.tag) b.appendChild(el('span', 'choice-tag', o.tag));
      b.addEventListener('click', function (e) { e.stopPropagation(); pickChoice(s, i); });
      b.addEventListener('mouseenter', function () {
        VN.state.choiceIndex = i;
        Array.prototype.forEach.call(D.choiceList.children, function (c) { c.classList.remove('sel'); });
        b.classList.add('sel');
      });
      D.choiceList.appendChild(b);
    });
    if (D.choiceList.firstChild) D.choiceList.firstChild.classList.add('sel');
  }
  function pickChoice(s, i) {
    if (!VN.state.choice) return;
    var o = (s.options || [])[i];
    if (!o) return;
    VN.state.choice = false;
    D.choiceLayer.classList.add('hidden');
    curGateStep = null;
    /* 选了之后必须让玩家看见发生了什么。
     * 原先的反馈只有数值条闪 430ms，玩家根本对不上刚才那一下点的是什么。 */
    var before = { morale: VN.state.morale, trust: VN.state.trust, hope: VN.state.hope };
    if (o.set) {
      (Array.isArray(o.set) ? o.set : [o.set]).forEach(function (ss) { setVar(ss.var, ss.op, ss.value); });
    }
    var delta = [];
    [['morale', '士气'], ['trust', '信任'], ['hope', '信念']].forEach(function (p) {
      var d = (VN.state[p[0]] | 0) - (before[p[0]] | 0);
      if (d) delta.push(p[1] + ' ' + (d > 0 ? '+' : '−') + Math.abs(d));
    });
    if (delta.length) toast(delta.join('　'), 'delta', 2800);
    if (o.record) VN.state.records[o.record] = 1;
    VN.state.history.push({ kind: 'choice', who: '', name: '', text: '▸ ' + o.text });
    unblock();
    if (o.goto) {
      var f = topFrame();
      var idx = indexOfLabel(f.steps, o.goto);
      if (idx < 0 && currentChapter) idx = indexOfLabel(currentChapter.steps, o.goto);
      if (idx >= 0) f.i = idx + 1; else advise('choice.goto 目标不存在：' + o.goto);
    }
    if (autoOn) scheduleAuto();
    run();
  }
  function moveChoice(d) {
    if (!VN.state.choice) return;
    var n = D.choiceList.children.length;
    if (!n) return;
    VN.state.choiceIndex = (VN.state.choiceIndex + d + n) % n;
    Array.prototype.forEach.call(D.choiceList.children, function (c, i) {
      c.classList.toggle('sel', i === VN.state.choiceIndex);
    });
  }

  /* ===== 15. 章节流程 ===== */
  VN.manifest = function (id) {
    var m = manifestList();
    for (var i = 0; i < m.length; i++) if (m[i].id === id) return m[i];
    return null;
  };
  function nextChapterId(id) {
    var m = manifestList();
    for (var i = 0; i < m.length; i++) if (m[i].id === id) return (m[i + 1] && m[i + 1].id) || null;
    return null;
  }
  VN.isUnlockedChapter = function (id) {
    var m = manifestList();
    if (!m.length) return false;
    /* 设置里的口令彩蛋：通关一次后仍想跳着看，或纯粹不想被章节锁挡住。
     * 只影响「能不能进」，不伪造 progress，所以结算页的「走过的章节」不会被灌水。 */
    if (VN.G.unlockAll) return true;
    if (m[0].id === id) return true;
    if (VN.G.progress[id]) return true;
    var prev = null;
    for (var i = 0; i < m.length; i++) { if (m[i].id === id) { prev = m[i - 1]; break; } }
    return !!(prev && VN.G.progress[prev.id] && VN.G.progress[prev.id].done);
  };
  function syncRewindUI() {
    if (D.stage) D.stage.classList.toggle('rewind-on', !!VN.G.unlockAll);
  }
  /* 口令解锁：把还没解锁的东西一次性全部打开 —— 章节、人物图鉴、史料档案、
   * 插画画廊（背景 + 全屏插画），并放开倒退播放。
   * 只写解锁位，不碰 progress：章节选择里不会冒出不存在的「已完成」，
   * 终章结算页的「走过的章节」也不会被灌水。 */
  VN.unlockEverything = function () {
    VN.G.unlockAll = true;
    var g = VN.G.unlocked;
    Object.keys(VN.CHARACTERS || {}).forEach(function (id) { g.chars[id] = 1; });
    var bgs = (window.ART && window.ART.backgroundsList) || [];
    bgs.forEach(function (b) { g.bgs[b.id] = 1; });
    /* CG 有自己的 id 体系（src/data/cg.js 的 ART.cgList，cg_* 前缀），
     * 不是背景 id。按画廊真正列出的那份清单来填，否则会出现
     * 「口令解了、画廊还是锁着」的空档。 */
    var cgs = (window.ART && window.ART.cgList) || [];
    cgs.forEach(function (c) { if (c && c.id) g.cgs[c.id] = 1; });
    if (window.ART && window.ART.cgById) {
      Object.keys(window.ART.cgById).forEach(function (id) { g.cgs[id] = 1; });
    }
    /* 老剧本里仍沿用背景 id 的 cg 步骤也一并留着，免得留下"解锁了却没有条目"的死键。 */
    bgs.forEach(function (b) { g.cgs[b.id] = 1; });
    var st = window.STORY || {};
    Object.keys(st).forEach(function (k) {
      var ch = st[k];
      if (!ch || !ch.archive) return;
      ch.archive.forEach(function (a) { if (a && a.id) g.archives[a.id] = 1; });
    });
    syncRewindUI();
    VN.persist();
    return true;
  };
  function numCn(n) {
    var cn = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (n <= 10) return cn[n] || String(n);
    if (n < 20) return '十' + cn[n - 10];
    return String(n);
  }
  VN.numCn = numCn;
  function chapterTagText(m) {
    return '第' + numCn(m.num) + '章 · ' + m.title + '　' + m.date + '　' + m.place;
  }
  function chapterSteps(ch, m) {
    var steps = ch.steps.slice();
    if (ch.titleCard) {
      steps = [{
        t: 'title',
        text: ch.titleCard.sub || m.title,
        sub: (ch.titleCard.date || m.date) + '　' + (ch.titleCard.place || m.place)
      }].concat(steps);
    }
    return steps;
  }
  /* 某章顶层步数（含开场标题卡）。标题画面用它显示「上次停在 i / 总数」。 */
  VN.chapterLength = function (id) {
    var m = VN.manifest(id);
    var ch = window.STORY && window.STORY[id];
    if (!m || !ch || !ch.steps) return 0;
    return chapterSteps(ch, m).length;
  };

  VN.start = function (id, opts) {
    opts = opts || {};
    var m = VN.manifest(id);
    var ch = window.STORY && window.STORY[id];
    if (!m) { if (VN.ui) VN.ui.error('章节 ' + id + ' 不在章节清单里。'); return; }
    if (!ch || !ch.steps) {
      if (VN.ui) VN.ui.error('这一章还没有写出来：' + m.title + '\n（' + m.file + '）');
      return;
    }
    if (VN.ui) VN.ui.closeAll();
    currentChapter = ch;
    VN.state.chapter = id;
    VN.state.title = m.title;
    VN.state.history = [];
    VN.state.weather = null;
    VN.state.running = true;
    VN.state.waiting = false;
    VN.state.choice = false;
    VN.state.hideUI = false;
    setWeather(null);
    clearChars();
    hideCg(true);                           /* 新章节开场不该残留上一章的插画 */
    charFace = {};                          /* 表情记忆按章重置 */
    rewindBuf.length = 0;                   /* 倒退不跨章 */
    suppressRecord = false;
    setNote(null);
    D.dialogue.classList.add('hidden');
    D.choiceLayer.classList.add('hidden');
    D.fxFlash.classList.remove('hit');
    D.fxFade.classList.remove('on');
    D.stage.classList.remove('ui-hidden');
    if (opts.fresh) {
      VN.state.morale = 60; VN.state.trust = 50; VN.state.hope = 55;
      VN.state.flags = {}; VN.state.records = {};
      VN.G.run = { morale: 60, trust: 50, hope: 55, flags: {}, records: {} };
      VN.persist();
    } else {
      VN.state.morale = VN.G.run.morale;
      VN.state.trust = VN.G.run.trust;
      VN.state.hope = VN.G.run.hope;
      VN.state.flags = JSON.parse(JSON.stringify(VN.G.run.flags || {}));
      VN.state.records = JSON.parse(JSON.stringify(VN.G.run.records || {}));
    }
    syncMeters(false);
    setChapterTag(chapterTagText(m));
    VN.state.frames = [{ steps: chapterSteps(ch, m), i: 0 }];
    if (VN.audio) { if (ch.bgm) VN.audio.bgm(ch.bgm, { ms: 1200 }); else VN.audio.stopBgm({ ms: 600 }); }
    preloadChapter(ch);
    run();
  };
  VN.jump = function (id) { VN.start(id, {}); };

  function endChapter(next) {
    /* 章末必须收掉快进：原先快进定时器在章节结束后仍在跑，
     * 而章末卡 4.2 秒后会自动开局下一章 —— 两者一叠，按住 Ctrl 就能冲穿全剧。 */
    setSkip(false);
    flushRead();
    curGateStep = null;
    VN.state.running = false;
    VN.state.waiting = false;
    VN.state.frames = [];
    VN.G.run.morale = VN.state.morale;
    VN.G.run.trust = VN.state.trust;
    VN.G.run.hope = VN.state.hope;
    VN.G.run.flags = VN.state.flags;
    VN.G.run.records = VN.state.records;
    var id = VN.state.chapter;
    /* 本章史料档案随章节完成自动入库 */
    if (currentChapter && currentChapter.archive) {
      currentChapter.archive.forEach(function (a) { unlockArchive(a); });
    }
    VN.G.progress[id] = { done: true, step: 0, ts: Date.now(), title: VN.state.title };
    VN.persist();
    VN.save.writeAuto(snapshot());
    var nid = next || nextChapterId(id);
    if (nid && window.STORY[nid] && window.STORY[nid].steps) {
      if (VN.ui) {
        VN.ui.chapterEndCard(VN.manifest(id), VN.manifest(nid), function () { VN.start(nid, {}); });
      } else {
        VN.start(nid, {});
      }
    } else if (nid) {
      /* 下一章尚未写完：向前找到第一个可以播放的章节跳过去，保证剧情链仍能一路走到底 */
      var skipped = [];
      var probe = nid;
      while (probe && !(window.STORY[probe] && window.STORY[probe].steps)) {
        skipped.push(((VN.manifest(probe) || {}).title) || probe);
        probe = nextChapterId(probe);
      }
      if (probe) {
        toast('以下章节尚未完成，已跳过：' + skipped.join('、'));
        var target = probe;
        if (VN.ui) VN.ui.chapterEndCard(VN.manifest(id), VN.manifest(target), function () { VN.start(target, {}); });
        else VN.start(target, {});
      } else if (VN.ui) {
        VN.ui.error('后面的章节还没有写出来（缺：' + skipped.join('、') + '）。');
      }
    } else {
      if (VN.ui) VN.ui.showResult();
    }
  }
  VN.endChapter = endChapter;
  VN.nextChapterId = nextChapterId;

  function preloadChapter(ch) {
    var seen = {};
    function grab(path) {
      if (!path || seen[path]) return;
      seen[path] = 1;
      var im = new Image();
      im.src = path;
    }
    (function walk(steps) {
      (steps || []).forEach(function (s) {
        if (!s) return;
        /* cg 步骤显示的是 cg/ 目录下的图（cgPath），不是 bg/ 下的图；
           原先把 cg 也按 bgPath 预载，等于预载了一张永远不会显示的图，
           而真正要显示的插画没被预载。—— 由 root 修正 */
        if (s.t === 'bg') grab(bgPath(s.id));
        /* 插画按候选链逐张预载：位图命中时后面的矢量不会真的去取（浏览器只在
           真正赋值给 <img> 时才会请求），所以这里只预载「最可能出现的两级」。 */
        if (s.t === 'cg') cgCandidates(s.id).slice(0, 2).forEach(grab);
        if (s.t === 'show') grab(charPath(s.who, s.face || 'calm'));
        if (s.t === 'say' && s.face) grab(charPath(s.who, s.face));
        if (s.t === 'if') { walk(s.then); walk(s.else); }
      });
    })(ch.steps);
  }

  /* ===== 16. 存档 ===== */
  function snapshot() {
    return {
      v: 1,
      chapter: VN.state.chapter,
      title: VN.state.title,
      path: VN.state.frames.map(function (f) { return { i: f.i, kind: f.kind }; }),
      morale: VN.state.morale, trust: VN.state.trust, hope: VN.state.hope,
      flags: VN.state.flags,
      records: VN.state.records,
      history: VN.state.history.slice(-160),
      weather: VN.state.weather,
      ts: Date.now(),
      preview: lastLines(2)
    };
  }
  function lastLines(n) {
    var h = VN.state.history.filter(function (x) { return x.kind !== 'choice'; });
    return h.slice(-n).map(function (x) { return (x.name ? x.name + '：' : '') + x.text; }).join('\n').slice(0, 120);
  }
  VN.snapshot = snapshot;
  VN.doSave = function (slot) {
    if (!VN.state.chapter) { toast('还没有开始行军，无法存档'); return false; }
    var ok = VN.save.writeSlot(slot, snapshot());
    toast(ok ? '已存入第 ' + slot + ' 号行军袋' : '存档失败：浏览器不允许本地存储');
    return ok;
  };
  VN.doLoad = function (obj) {
    if (!obj || !obj.chapter) return false;
    var m = VN.manifest(obj.chapter);
    var ch = window.STORY && window.STORY[obj.chapter];
    if (!m || !ch || !ch.steps) { toast('这份存档对应的章节还没有写出来'); return false; }
    if (VN.ui) VN.ui.closeAll();
    currentChapter = ch;
    VN.state.chapter = obj.chapter;
    VN.state.title = obj.title || m.title;
    VN.state.morale = obj.morale; VN.state.trust = obj.trust; VN.state.hope = obj.hope;
    VN.state.flags = obj.flags || {};
    VN.state.records = obj.records || {};
    VN.state.history = obj.history || [];
    VN.state.running = true;
    VN.state.waiting = false;
    VN.state.choice = false;
    VN.state.hideUI = false;
    VN.state.weather = obj.weather || null;
    clearChars();
    hideCg(true);
    D.choiceLayer.classList.add('hidden');
    D.dialogue.classList.add('hidden');
    D.fxFade.classList.remove('on');
    D.stage.classList.remove('ui-hidden');
    setWeather(VN.state.weather);
    syncMeters(false);
    setChapterTag(chapterTagText(m));
    var path = obj.path || [{ i: 0 }];
    /* R2-E01：越界存档兜底。存档里记的是**绝对步号**，而剧情编辑可能删掉步骤
       （例如 R1-Q05 从 8 章删了 27 个 note 步），于是旧存档的步号会越过本章末尾。
       run() 的语义是"某帧的 i 越界即该帧结束"，一旦越界就会把帧弹空并立即 endChapter，
       读档的玩家于是被弹回章节结算而不是回到进度。buildFrames 把越界进度落回本章开头，
       这里负责明确告诉玩家，避免静默损坏。
       帧栈的构造与倒退播放共用 buildFrames（见 13.2）。 */
    var built = buildFrames(ch, m, path);
    if (built.bad) toast('这份存档的进度已经失效，已从本章开头继续');
    VN.state.frames = built.frames;
    rewindBuf.length = 0;
    suppressRecord = false;
    VN.G.run = {
      morale: VN.state.morale, trust: VN.state.trust, hope: VN.state.hope,
      flags: VN.state.flags, records: VN.state.records
    };
    VN.persist();
    if (VN.audio && ch.bgm) VN.audio.bgm(ch.bgm, { ms: 600 });
    preloadChapter(ch);
    run();
    toast('从' + m.title + '继续');
    return true;
  };
  VN.continueGame = function () {
    var auto = VN.save.readAuto();
    if (auto && VN.doLoad(auto)) return true;
    var slots = VN.save.listSlots().filter(function (s) { return s.data; });
    slots.sort(function (a, b) { return (b.data.ts || 0) - (a.data.ts || 0); });
    if (slots.length && VN.doLoad(slots[0].data)) return true;
    return false;
  };
  var lastAutosaveIdx = -1;
  function autosaveTick() {
    if (!VN.state.running || !isTopLevel()) return;
    var f = topFrame();
    if (!f) return;
    if (f.i % 14 === 0 && f.i !== lastAutosaveIdx) {
      lastAutosaveIdx = f.i;
      /* 已读集合比自动存档大一个量级（20 章 × 200+ 条），逐次落盘会把
       * JSON.stringify 变成热路径，拖慢整页、也会让依赖时序的检查器误判。
       * 每 10 次自动存档落一次，章末与关页时再各补一次。 */
      if (f.i % 140 === 0) flushRead();
      VN.save.writeAuto(snapshot());
      if (VN.state.chapter) {
        var p = VN.G.progress[VN.state.chapter] || {};
        p.step = Math.max(p.step || 0, f.i);
        VN.G.progress[VN.state.chapter] = p;
      }
    }
  }
  VN.autosave = function () { VN.save.writeAuto(snapshot()); };
  VN.hasAnyProgress = function () {
    if (VN.save.readAuto()) return true;
    return VN.save.listSlots().some(function (s) { return !!s.data; });
  };

  /* ===== 17. 输入 ===== */
  var skipHeld = false;
  /* 两种快进，语义不同：
   *   'all'      —— 一路推进到「下一个选项」（跳的是对白，结构内容全保留）
   *   'readonly' —— 只跳已读段落，遇到没读过的内容立刻停下（二周目专用）
   * 两者都在到达选项或章节结束时自动关闭。原先的快进没有已读判定、也不在章末停止，
   * 一次误触 S 就可能丢掉整章、甚至一路冲穿全剧。 */
  function skipButton() {
    return D.quickbar && D.quickbar.querySelector('[data-act="skip"]');
  }
  function renderSkipButton() {
    var b = skipButton();
    if (!b) return;
    var ro = skipOn && skipMode === 'readonly';
    b.classList.toggle('active', skipOn);
    b.textContent = ro ? '跳已读' : '快进';
    b.title = ro
      ? '正在只跳已读（按住 Ctrl）—— 遇到没读过的内容会停下'
      : '跳到下一个选项（S）；按住 Ctrl 只跳已读';
  }
  function setSkip(on, mode) {
    if (on && mode) skipMode = mode;
    if (skipOn === on) { renderSkipButton(); return; }
    skipOn = on;
    renderSkipButton();
    clearInterval(skipTimer);
    if (on) skipTimer = setInterval(skipTick, 26);
  }
  function skipTick() {
    if (!VN.state.running) { setSkip(false); return; }
    if (VN.ui && VN.ui.isModalOpen()) return;   /* 菜单开着就先不推进，关掉再继续 */
    if (VN.state.choice) { setSkip(false); return; }
    if (skipMode === 'readonly' && curGateStep && !isRead(curGateStep)) {
      setSkip(false);
      toast('这里你还没读过 —— 已停下', 'warn', 2600);
      return;
    }
    advance();
  }
  function setAuto(on) {
    autoOn = on;
    var b = D.quickbar && D.quickbar.querySelector('[data-act="auto"]');
    if (b) b.classList.toggle('active', on);
    if (on) { if (!VN.state.typing) scheduleAuto(); } else clearTimeout(autoTimer);
  }
  VN.setAuto = setAuto;
  VN.setSkip = setSkip;
  VN.isAuto = function () { return autoOn; };
  VN.isSkip = function () { return skipOn; };
  function toggleUI() {
    VN.state.hideUI = !VN.state.hideUI;
    D.stage.classList.toggle('ui-hidden', VN.state.hideUI);
  }
  VN.toggleUI = toggleUI;
  VN.setOverlayOpen = function (open) {
    if (D.stage) D.stage.classList.toggle('overlay-open', !!open);
  };
  VN.advance = advance;
  VN.topFrame = topFrame;

  function bindInput() {
    D.stage.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && (t.closest('#quickbar') || t.closest('#choice-layer') || t.closest('#overlay') || t.closest('button'))) return;
      userAdvance();
    });
    D.quickbar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.qbtn') : null;
      if (!b) return;
      e.stopPropagation();
      var act = b.dataset.act;
      if (act === 'auto') setAuto(!autoOn);
      else if (act === 'skip') setSkip(!skipOn, 'all');
      else if (act === 'rewind') VN.rewind(1);
      else if (act === 'history') VN.ui.showHistory();
      else if (act === 'save') VN.ui.showSlots('save');
      else if (act === 'settings') VN.ui.showSettings();
      else if (act === 'hide') toggleUI();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Control') { if (!skipHeld) { skipHeld = true; setSkip(true, 'readonly'); } return; }
      if (VN.ui && VN.ui.isModalOpen()) {
        if (e.key === 'Escape') { VN.ui.closeTop(); e.preventDefault(); }
        return;
      }
      if (VN.state.choice) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { moveChoice(-1); e.preventDefault(); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { moveChoice(1); e.preventDefault(); }
        else if (e.key >= '1' && e.key <= '4') {
          var i = parseInt(e.key, 10) - 1;
          if (i < D.choiceList.children.length) pickChoice(currentChoiceStep, i);
          e.preventDefault();
        } else if (e.key === 'Enter') {
          var cur = D.choiceList.children[VN.state.choiceIndex];
          if (cur) cur.click();
          e.preventDefault();
        }
        return;
      }
      switch (e.key) {
        case ' ': case 'Enter': userAdvance(); e.preventDefault(); break;
        case 'Escape': VN.ui.showSystem(); e.preventDefault(); break;
        case 'h': case 'H': toggleUI(); break;
        case 'a': case 'A': setAuto(!autoOn); break;
        case 's': case 'S': setSkip(!skipOn, 'all'); break;
        /* 倒退播放（口令解锁）。菜单开着时上面已经 return，所以在口令输入框里
           按退格仍然是正常删字，不会被这里抢走。 */
        case 'Backspace': VN.rewind(1); e.preventDefault(); break;
        case 'l': case 'L': VN.ui.showHistory(); break;
        case 'Tab': VN.ui.showSettings(); e.preventDefault(); break;
      }
    });
    document.addEventListener('keyup', function (e) {
      if (e.key === 'Control' && skipHeld) { skipHeld = false; setSkip(false); }
    });
    window.addEventListener('resize', function () { fitUnit(); fxResize(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        setSkip(false);
        if (VN.audio && VN.audio.duck) VN.audio.duck(true);
      } else if (VN.audio && VN.audio.duck) {
        VN.audio.duck(false);
      }
    });
    window.addEventListener('beforeunload', function () {
      flushRead();
      if (VN.state.running) VN.autosave();
    });
  }

  /* ===== 18. 启动 ===== */
  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () { resolve(false); };
      document.body.appendChild(s);
    });
  }
  async function boot() {
    cacheDom();
    fitUnit();
    fxResize();
    bindInput();
    syncMeters(false);
    if (VN.ui) VN.ui.init();
    var m = manifestList();
    var missing = [];
    for (var i = 0; i < m.length; i++) {
      /* index.html 已经静态加载过全部章节；已经注册过的不要再注入一次，
         否则每个章节 IIFE 会被解析并执行两遍（20 章约 633 KB 白做功）。
         只有真的缺了这一章时才走动态注入 + 缺章登记。 */
      if (window.STORY[m[i].id]) continue;
      var ok = await loadScript(m[i].file);
      if (!ok || !window.STORY[m[i].id]) missing.push(m[i].id);
    }
    VN.missingChapters = missing;
    /* 口令已开过：补齐图鉴 / 档案 / 插画的解锁位（旧版本只解锁了章节），
       并让「倒退」按钮出现在快捷条上。 */
    if (VN.G.unlockAll) VN.unlockEverything();
    syncRewindUI();
    if (D.loading) {
      D.loading.classList.add('gone');
      setTimeout(function () { D.loading.classList.add('hidden'); }, 640);
    }
    if (VN.ui) VN.ui.showTitle();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  VN.uiPath = uiPath;
  VN.bgPath = bgPath;
  /* 画廊与探针要按候选列表逐级回退地取背景（见 gallery.js 的 artTile） */
  VN.bgCandidates = bgCandidates;
  VN.cgPath = cgPath;
  VN.cgCandidates = cgCandidates;
  VN.charPath = charPath;
  VN.charPaths = charPaths;
  /* 把立绘挂到一个 <img> 上，PNG 失败自动回退 SVG */
  VN.setCharImage = function (img, who, face) {
    var paths = charPaths(who, face), i = 0;
    img.addEventListener('error', function onerr() {
      i++;
      if (i < paths.length) img.setAttribute('src', paths[i]);
      else img.removeEventListener('error', onerr);
    });
    img.setAttribute('src', paths[0]);
    return paths[0];
  };
  VN.asset = asset;
  VN.toast = toast;
  VN.charName = charName;
  VN.FACES = FACES;
})();
