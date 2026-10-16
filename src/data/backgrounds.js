/* 背景 / CG / 音频 / 表情 元数据 —— 文件所有权：root（冻结）。
 * id 表与 SPEC 4.1 完全一致，**不得新增/改名**。
 * 绘制由 art/scenes_*.js 提供：window.ART.scenes[id]() -> SVG 字符串（1920×1080 完整文档）。
 * CG 由 window.ART.cg[id]() 提供（可选）；缺失时由 build-art 用背景加强版兜底。
 */
(function () {
  var G = (typeof window !== 'undefined') ? window : globalThis;
  G.ART = G.ART || {};

  var B = [
    { id: 'bg_yudu_night',     name: '于都河夜渡',   usedIn: 'ch01', hint: '夜色河面、五座浮桥、两岸火把、远山剪影、送别的百姓' },
    { id: 'bg_yudu_village',   name: '于都村庄清晨', usedIn: 'ch01', hint: '白墙黑瓦、老樟树、晨雾、石板路、井台' },
    { id: 'bg_mountain_pass',  name: '赣南山路',     usedIn: 'ch02', hint: '丘陵、石阶、竹林、窄田埂' },
    { id: 'bg_blockade',       name: '封锁线碉堡',   usedIn: 'ch02', hint: '碉堡、铁丝网、山脊、探照灯' },
    { id: 'bg_xiangjiang_day', name: '湘江·白昼',   usedIn: 'ch03', hint: '宽阔江面、浮桥、对岸、阴沉天' },
    { id: 'bg_xiangjiang_night', name: '湘江·血战夜', usedIn: 'ch03', hint: '火光、浓烟、被染红的江水倒影、浮桥残段' },
    { id: 'bg_council_hall',   name: '会议厅·通用', usedIn: 'ch04', hint: '木桌、马灯、长凳、墙上挂图' },
    { id: 'bg_tongdao',        name: '通道·恭城书院', usedIn: 'ch04', hint: '书院、窗棂、冬雨、天井' },
    { id: 'bg_liping',         name: '黎平会议',     usedIn: 'ch05', hint: '木楼、火塘、木板墙' },
    { id: 'bg_houchang',       name: '猴场·跨年夜', usedIn: 'ch06', hint: '庭院、爆竹红屑、薄雪、门灯' },
    { id: 'bg_zunyi',          name: '遵义会议楼',   usedIn: 'ch07', hint: '回廊、红漆木楼、炭盆、青瓦' },
    { id: 'bg_chishui',        name: '赤水河',       usedIn: 'ch08', hint: '峡谷、红褐色河水、渡口石阶' },
    { id: 'bg_tucheng',        name: '土城',         usedIn: 'ch08', hint: '土墙、窄街、硝烟、残破门板' },
    { id: 'bg_loushanguan',    name: '娄山关',       usedIn: 'ch10', hint: '关隘、石峰、云海、夕阳' },
    { id: 'bg_jinsha',         name: '金沙江·皎平渡', usedIn: 'ch12', hint: '深切峡谷、渡口、木船、对岸绝壁' },
    { id: 'bg_yihai',          name: '彝海',         usedIn: 'ch13', hint: '高山湖泊、松林、火把、远山' },
    { id: 'bg_dadu',           name: '大渡河·安顺场', usedIn: 'ch14', hint: '激流、渡船、崖壁、乱石滩' },
    { id: 'bg_luding',         name: '泸定桥',       usedIn: 'ch15', hint: '十三根铁索、被抽掉的桥板、急流、对岸桥楼' },
    { id: 'bg_snow_mountain',  name: '夹金山',       usedIn: 'ch16', hint: '雪脊、冰川裂隙、垭口、灰白天光' },
    { id: 'bg_maogong',        name: '懋功会师',     usedIn: 'ch17', hint: '山城、层叠屋顶、会师旗队' },
    { id: 'bg_grassland',      name: '松潘草地',     usedIn: 'ch17', hint: '无边沼泽、水洼、枯草、阴沉天空' },
    { id: 'bg_lazikou',        name: '腊子口',       usedIn: 'ch18', hint: '一线天、两侧绝壁、谷底木桥、碉堡' },
    { id: 'bg_hadapu',         name: '哈达铺',       usedIn: 'ch19', hint: '小镇、店铺、布幌、报纸摊' },
    { id: 'bg_wuqi',           name: '吴起镇',       usedIn: 'ch19', hint: '黄土塬、窑洞、红旗、枣树' },
    { id: 'bg_huining',        name: '会宁会师',     usedIn: 'ch20', hint: '城楼、三军旗、人海、黄土城墙' },
    { id: 'bg_yanan_cave',     name: '延安窑洞',     usedIn: 'ch20', hint: '窑洞、油灯、地图、木桌' },
    { id: 'bg_rain_march',     name: '雨中行军',     usedIn: 'ch02', hint: '泥路、蓑衣、雨幕、队伍剪影' },
    { id: 'bg_camp_fire',      name: '篝火夜营',     usedIn: 'ch01', hint: '草地、火堆、围坐的剪影、星空' },
    { id: 'bg_map_table',      name: '指挥部·地图桌', usedIn: 'ch07', hint: '作战地图、蜡烛、铅笔、电话机、马灯' },
    { id: 'bg_stretcher',      name: '担架队',       usedIn: 'ch01', hint: '竹林小径、两副担架、抬担架的战士' },
    /* 叙事画面（不是景）：第三章脚山铺阵地上「每人三发」那段对话。
       纯黑底 + 弹药；三张画面里子弹的位置完全一致，少的只是被打出去的那一发。
       —— 由 root 按用户要求追加（画在 art/scenes_bullets.js）

       noBitmap:true —— 这四张**不出 AI 位图**，只用 art/scenes_bullets.js 的程序化 SVG。
       理由：它们的三条硬要求（三张里子弹位置完全一致、纯黑底、画面里只有子弹）是
       跨图不变式，生成式出图保证不了「位置不变、只少一颗」；`bg_black` 更是一整片纯黑，
       出图没有意义。引擎的 bgCandidates() 按这个字段跳过 .png，直接走 .svg，
       避免每次切到这几张都白请求一次 404。清单的对应条目见 src/data/bgart.js。 */
    { id: 'bg_bullets_3',      name: '三发子弹',     usedIn: 'ch03', noBitmap: true, hint: '纯黑底、三颗立着的步枪弹，只有子弹是主体' },
    { id: 'bg_bullets_2',      name: '三发子弹·二', usedIn: 'ch03', noBitmap: true, hint: '同上，左侧一发已打出去（位置不变，只是少一颗）' },
    { id: 'bg_bullets_1',      name: '三发子弹·一', usedIn: 'ch03', noBitmap: true, hint: '只剩正中那一发：第三发，留给自己的那一发' },
    { id: 'bg_black',          name: '全黑',         usedIn: 'ch03', noBitmap: true, hint: '纯黑一屏：最后一发「留给自己」时硬切到这里' }
  ];

  G.ART.backgrounds = {};
  G.ART.backgroundsList = B;
  B.forEach(function (b) { G.ART.backgrounds[b.id] = b; });

  /* 音频 id 表（SPEC 5） */
  G.ART.audioIds = {
    bgm: ['departure', 'march', 'tense', 'battle', 'grief', 'hope', 'victory', 'night', 'river', 'snow', 'grassland', 'council'],
    sfx: ['gunfire', 'distant_gun', 'shell', 'horse', 'water', 'bell', 'paper', 'footsteps', 'wind', 'thunder', 'horn', 'cheer', 'click', 'page',
      'vertigo']
  };

  /* 表情枚举（SPEC 3.2） */
  G.ART.faces = ['calm', 'stern', 'smile', 'sad', 'worry', 'fierce', 'weak', 'dawn'];
  G.ART.crowdFaces = ['calm', 'fierce', 'sad'];

  /* UI 装饰 id 表（build-art 会为每个 key 生成 assets/generated/ui/<key>.svg） */
  G.ART.uiIds = [
    'title_frame', 'divider', 'star_badge', 'ribbon_chapter', 'btn_plate',
    'mountain_motif', 'cloud_motif', 'paper_grain', 'vignette_soft', 'seal_red',
    'slot_frame', 'arrow_next', 'lock_icon', 'bar_morale', 'bar_trust', 'bar_hope'
  ];

  if (typeof module === 'object' && module.exports) module.exports = G.ART.backgrounds;
})();
