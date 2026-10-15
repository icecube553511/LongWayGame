/* 人物元数据 —— 文件所有权：root（冻结）。
 * 剧本、图鉴、引擎都从这里取显示名与简介。**不得新增/改名 id**（见 SPEC 3.1）。
 * 立绘绘制由 art/portraits_*.js 提供：window.ART.portraits[id](face) -> SVG 字符串。
 */
(function () {
  var G = (typeof window !== 'undefined') ? window : globalThis;
  G.ART = G.ART || {};

  var FULL = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];
  var CROWD = ['calm', 'fierce', 'sad'];

  var C = [
    /* ---- 历史人物 ---- */
    { id: 'mao', name: '毛泽东', role: '中华苏维埃共和国中央执行委员会主席', first: 'ch01', faces: FULL,
      bio: '时年四十一岁。第五次反「围剿」后被排挤出军事指挥核心，疟疾初愈，随军转移。沉默多于争辩，谈军事时锋利。爱抽烟、看书、写诗。' },
    { id: 'zhou', name: '周恩来', role: '中革军委副主席、红军总政委', first: 'ch01', faces: FULL,
      bio: '时年三十六岁。事必躬亲，常说「我来想办法」。长征途中因劳累与肝病日渐消瘦。会议上敢担责，也敢拍桌子。' },
    { id: 'zhu', name: '朱德', role: '红军总司令', first: 'ch02', faces: FULL,
      bio: '时年四十八岁。忠厚长者，宽厚的四川口音。总是和战士在一起：背枪、挑粮、烧火。危急时亲上前线。' },
    { id: 'zhang_wentian', name: '张闻天', role: '中央政治局常委', first: 'ch04', faces: FULL,
      bio: '时年三十四岁。理论家，斯文，戴眼镜。从支持博古到公开批评，这个转折很沉痛。讲话有条理，书面气重。' },
    { id: 'wang_jiaxiang', name: '王稼祥', role: '中革军委副主席、总政治部主任', first: 'ch04', faces: FULL,
      bio: '时年二十八岁。腹部重伤未愈，长期躺在担架上。寡言，但每句都重。' },
    { id: 'bogu', name: '博古', role: '临时中央总负责人', first: 'ch02', faces: FULL,
      bio: '时年二十七岁。说理流利，失败后苦闷自责。有书卷气，会拉手风琴。承认错误的过程很艰难。' },
    { id: 'lide', name: '李德', role: '共产国际军事顾问', first: 'ch02', faces: FULL,
      bio: '时年三十四岁，德国人。固执，只相信地图与条令，中文很差，要靠翻译。到最后仍不肯认错，但逐渐沉默。' },
    { id: 'peng', name: '彭德怀', role: '红三军团长', first: 'ch01', faces: FULL,
      bio: '时年三十六岁。猛将，直率暴烈。对战士极好，对错误的指挥绝不容忍。' },
    { id: 'lin', name: '林彪', role: '红一军团长', first: 'ch02', faces: FULL,
      bio: '时年二十七岁。沉默寡言，只谈军事。' },
    { id: 'nie', name: '聂荣臻', role: '红一军团政委', first: 'ch02', faces: FULL,
      bio: '时年三十五岁。稳重，善于做思想工作。先遣队政委，彝海结盟的亲历者。' },
    { id: 'liu_bocheng', name: '刘伯承', role: '红军总参谋长', first: 'ch02', faces: FULL,
      bio: '时年四十二岁。人称「军神」，右眼摘除，戴眼镜。说话不急不缓。渡江司令、彝海结盟的主角。' },
    { id: 'chen_yun', name: '陈云', role: '中央政治局常委', first: 'ch01', faces: FULL,
      bio: '时年二十九岁。沉稳细致，负责组织与后勤。' },
    { id: 'he_zizhen', name: '贺子珍', role: '红军干部、毛泽东夫人', first: 'ch01', faces: FULL,
      bio: '时年二十四岁。双枪女战士。湘江负伤，后又在盘县被炸伤。坚韧，极少抱怨。' },
    { id: 'deng_yingchao', name: '邓颖超', role: '中央机关干部、周恩来夫人', first: 'ch03', faces: FULL,
      bio: '时年三十岁。患肺病，常咳。做妇女与群众工作，善于倾听。' },
    { id: 'xu_teli', name: '徐特立', role: '苏维埃大学副校长、「长征五老」之一', first: 'ch01', faces: FULL,
      bio: '时年五十七岁。毛泽东的老师。拄着木棍走路，把马让给伤员。乐天，爱讲笑话。' },
    { id: 'dong_biwu', name: '董必武', role: '中央党校校长、「长征五老」之一', first: 'ch01', faces: FULL,
      bio: '时年四十八岁。沉稳温和。' },
    { id: 'lin_boqu', name: '林伯渠', role: '总供给部部长、「长征五老」之一', first: 'ch01', faces: FULL,
      bio: '时年四十八岁。管着全军的粮食，手不离账本。' },
    { id: 'xie_juezai', name: '谢觉哉', role: '中央政府秘书长、「长征五老」之一', first: 'ch01', faces: FULL,
      bio: '时年五十岁。须发花白，一路走一路记。' },
    { id: 'ye_jianying', name: '叶剑英', role: '红军前敌总指挥部参谋长', first: 'ch03', faces: FULL,
      bio: '时年三十七岁。机敏果决，长征中数次在关键处保住了中央。' },
    { id: 'zhang_guotao', name: '张国焘', role: '西北革命军事委员会主席、红四方面军领导人', first: 'ch17', faces: FULL,
      bio: '时年三十七岁。体胖，口才极好，权欲重。北上与南下之争的另一方。' },
    { id: 'xu_xiangqian', name: '徐向前', role: '红四方面军总指挥', first: 'ch17', faces: FULL,
      bio: '时年三十三岁。宽厚善战。说过「哪有红军打红军的道理」。' },
    { id: 'li_xiannian', name: '李先念', role: '红三十军政委', first: 'ch17', faces: FULL,
      bio: '时年二十五岁。坚毅。率部策应，迎接中央红军。' },
    { id: 'xiao_yedan', name: '小叶丹', role: '彝族果基家支首领', first: 'ch13', faces: FULL,
      bio: '三十余岁。豪爽讲义气，信守盟约。与刘伯承在彝海边结为兄弟。' },

    /* ---- 虚构人物（情感主线） ---- */
    { id: 'xiaoman', name: '小满', role: '红小鬼·司号员', first: 'ch01', faces: FULL,
      bio: '十五岁。全剧的视角人物。出发时连号都吹不响；会宁会师时，他吹响了全剧最后一个音。' },
    { id: 'li_tiezhu', name: '李铁柱', role: '炊事班长', first: 'ch01', faces: FULL,
      bio: '四十岁。背上永远背着一口铜锅。总把最后一口留给伤员。' },
    { id: 'he_xiaomei', name: '何晓梅', role: '红军卫生员', first: 'ch01', faces: FULL,
      bio: '十九岁，江西人。从怕血到能按住伤口缝合。雪山上用身体暖冻伤的战士。' },
    { id: 'guo_daniang', name: '郭大娘', role: '于都船工家属', first: 'ch01', faces: FULL,
      bio: '五十余岁。拆下自己寿材的门板架浮桥。把一枚铜顶针交给小满，说「到了北边，还我」。' },
    { id: 'shi_zhu', name: '石柱', role: '红一军团战士', first: 'ch01', faces: FULL,
      bio: '二十二岁，江西人。小满的同乡兄长。' },
    { id: 'a_yue', name: '阿月', role: '苗族向导', first: 'ch04', faces: FULL,
      bio: '十六岁。沉默，会唱山歌。腊子口攀上绝壁的带路人。' },
    { id: 'wu_laoliu', name: '吴老六', role: '红军班长（原排长）', first: 'ch01', faces: FULL,
      bio: '三十五岁。整编后从排长变成班长，反而高兴：「离敌人近点。」讲究实际，爱说怪话。' },
    { id: 'san_wa', name: '三娃', role: '红小鬼', first: 'ch01', faces: FULL,
      bio: '十三岁。队伍里最小的一个。爱哭，也爱笑。' },

    /* ---- 群众 ---- */
    { id: 'soldiers', name: '红军战士们', role: '群众', first: 'ch02', faces: CROWD,
      bio: '他们大多没有留下姓名。' },
    { id: 'villagers', name: '乡亲们', role: '群众', first: 'ch01', faces: CROWD,
      bio: '于都河两岸的百姓。拆门板、架浮桥、送子送郎。' },
    { id: 'yi_people', name: '彝族同胞', role: '群众', first: 'ch13', faces: CROWD,
      bio: '冕宁一带的彝民。' },
    { id: 'narrator', name: '旁白', role: '叙述者', first: 'ch01', faces: CROWD,
      bio: '不带姓名的声音。' }
  ];

  G.ART.characters = {};
  G.ART.charactersById = {};
  C.forEach(function (c) { G.ART.characters[c.id] = c; G.ART.charactersById[c.id] = c; });
  G.ART.charactersList = C;

  if (typeof module === 'object' && module.exports) module.exports = G.ART.characters;
})();
