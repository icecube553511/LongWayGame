/* 角色形象演进运行时数据 —— 由 tools/build-portrait-states.js 生成，请勿手改。
 *
 * 唯一来源：docs/reviews/char-progression-spec.json
 * 生成：node tools/build-portrait-states.js
 *
 * 引擎只读 chapterStates 与 beats；生成工具读 states 的 appearance_en / avoid_en / faces。
 * 人物 id 与 8 种表情仍由 SPEC.md 冻结，本文件不新增人物，也不改表情枚举。
 */
(function () {
  var G = (typeof window !== 'undefined') ? window : globalThis;
  G.ART = G.ART || {};
  G.ART.portraitStates = {
  "version": 1,
  "source": "docs/reviews/char-progression-spec.json",
  "source_sha256": "b9e1c6bb325c433a54a43c500cec6d204980d934fdfe938c26712cff76ca5a06",
  "characters": {
    "mao": {
      "name": "毛泽东",
      "stateIds": [
        "mao_ch01_ill",
        "mao_ch03_xiangjiang",
        "mao_ch04_tongdao",
        "mao_ch06_houchang",
        "mao_ch08_chishui",
        "mao_ch14_dadu",
        "mao_ch16_snow",
        "mao_ch19_wuqi",
        "mao_ch17_18_coldwet"
      ],
      "beats": []
    },
    "zhou": {
      "name": "周恩来",
      "stateIds": [
        "zhou_ch01_start",
        "zhou_ch03_xiangjiang",
        "zhou_ch04_tongdao",
        "zhou_ch06_zunyi",
        "zhou_ch08_chishui",
        "zhou_ch12_jinsha",
        "zhou_ch14_dadu",
        "zhou_ch16_snow",
        "zhou_ch19_wuqi",
        "zhou_ch17_coldwet"
      ],
      "beats": []
    },
    "zhu": {
      "name": "朱德",
      "stateIds": [
        "zhu_ch02_start",
        "zhu_ch04_tongdao",
        "zhu_ch06_zunyi",
        "zhu_ch08_tucheng",
        "zhu_ch08_nocap",
        "zhu_ch14_dadu",
        "zhu_ch16_snow",
        "zhu_ch20_huining",
        "zhu_ch17_18_coldwet"
      ],
      "beats": [
        {
          "chapter": "ch08",
          "after_text": "朱德从外面走进来，把帽子往桌上一放。",
          "portraitId": "zhu_ch08_nocap",
          "reason": "土城前沿指挥所里朱德摘帽，露出短硬灰黑发；这是 ch08 唯一明显的头部外观变化。"
        }
      ]
    },
    "zhang_wentian": {
      "name": "张闻天",
      "stateIds": [
        "zhang_wentian_ch04_tongdao",
        "zhang_wentian_ch07_zunyi",
        "zhang_wentian_ch09_late",
        "zhang_wentian_ch19_wuqi"
      ],
      "beats": []
    },
    "wang_jiaxiang": {
      "name": "王稼祥",
      "stateIds": [
        "wang_jiaxiang_ch04_stretcher",
        "wang_jiaxiang_ch07_zunyi"
      ],
      "beats": []
    },
    "bogu": {
      "name": "博古",
      "stateIds": [
        "bogu_ch02_start",
        "bogu_ch04_tongdao",
        "bogu_ch07_zunyi"
      ],
      "beats": []
    },
    "lide": {
      "name": "李德",
      "stateIds": [
        "lide_ch02_confident",
        "lide_ch04_shaken",
        "lide_ch07_zunyi"
      ],
      "beats": []
    },
    "peng": {
      "name": "彭德怀",
      "stateIds": [
        "peng_ch01_start",
        "peng_ch07_zunyi",
        "peng_ch17_late"
      ],
      "beats": []
    },
    "lin": {
      "name": "林彪",
      "stateIds": [
        "lin_ch02_start",
        "lin_ch10_loushan",
        "lin_ch18_lazikou"
      ],
      "beats": []
    },
    "nie": {
      "name": "聂荣臻",
      "stateIds": [
        "nie_ch02_start",
        "nie_ch07_zunyi",
        "nie_ch13_yihai",
        "nie_ch18_lazikou"
      ],
      "beats": []
    },
    "liu_bocheng": {
      "name": "刘伯承",
      "stateIds": [
        "liu_bocheng_ch02_start",
        "liu_bocheng_ch06_zunyi",
        "liu_bocheng_ch12_jinsha",
        "liu_bocheng_ch13_yihai",
        "liu_bocheng_ch13_necklace",
        "liu_bocheng_ch14_dadu"
      ],
      "beats": [
        {
          "chapter": "ch13",
          "after_text": "刘伯承把那串银饰戴在脖子上，扣好。",
          "portraitId": "liu_bocheng_ch13_necklace",
          "reason": "歃血后小叶丹把贴身银饰送给刘伯承；从这一拍起，银饰成为他进入彝区最明显的识别物。"
        }
      ]
    },
    "chen_yun": {
      "name": "陈云",
      "stateIds": [
        "chen_yun_ch01_start",
        "chen_yun_ch07_supply",
        "chen_yun_ch09_reorg"
      ],
      "beats": []
    },
    "he_zizhen": {
      "name": "贺子珍",
      "stateIds": [
        "he_zizhen_ch01_start",
        "he_zizhen_ch03_xiangjiang"
      ],
      "beats": []
    },
    "deng_yingchao": {
      "name": "邓颖超",
      "stateIds": [
        "deng_yingchao_ch03_ill",
        "deng_yingchao_ch04_guizhou"
      ],
      "beats": []
    },
    "xu_teli": {
      "name": "徐特立",
      "stateIds": [
        "xu_teli_ch01_start",
        "xu_teli_ch06_houchang",
        "xu_teli_ch16_snow",
        "xu_teli_ch16_bare_legs",
        "xu_teli_ch19_wuqi"
      ],
      "beats": [
        {
          "chapter": "ch16",
          "after_text": "（把自己的绑腿解下来，一圈一圈缠上去）",
          "portraitId": "xu_teli_ch16_bare_legs",
          "reason": "徐特立在雪山上把自己的绑腿解给冻伤战士，裤脚因此松开；这是 ch16 唯一明确的装备让渡。"
        }
      ]
    },
    "dong_biwu": {
      "name": "董必武",
      "stateIds": [
        "dong_biwu_ch01_start"
      ],
      "beats": []
    },
    "lin_boqu": {
      "name": "林伯渠",
      "stateIds": [
        "lin_boqu_ch01_start",
        "lin_boqu_ch09_supply",
        "lin_boqu_ch12_jinsha",
        "lin_boqu_ch16_late",
        "lin_boqu_ch17_grassland"
      ],
      "beats": []
    },
    "xie_juezai": {
      "name": "谢觉哉",
      "stateIds": [
        "xie_juezai_ch01_start",
        "xie_juezai_ch06_houchang",
        "xie_juezai_ch16_snow",
        "xie_juezai_ch17_18_coldwet"
      ],
      "beats": []
    },
    "ye_jianying": {
      "name": "叶剑英",
      "stateIds": [
        "ye_jianying_ch03_early",
        "ye_jianying_ch11_chishui",
        "ye_jianying_ch17_late"
      ],
      "beats": []
    },
    "zhang_guotao": {
      "name": "张国焘",
      "stateIds": [
        "zhang_guotao_ch17_maogong",
        "zhang_guotao_ch20_huining"
      ],
      "beats": []
    },
    "xu_xiangqian": {
      "name": "徐向前",
      "stateIds": [
        "xu_xiangqian_ch17_maogong"
      ],
      "beats": []
    },
    "li_xiannian": {
      "name": "李先念",
      "stateIds": [
        "li_xiannian_ch17_maogong"
      ],
      "beats": []
    },
    "xiao_yedan": {
      "name": "小叶丹",
      "stateIds": [
        "xiao_yedan_ch13_yihai",
        "xiao_yedan_ch13_oath"
      ],
      "beats": [
        {
          "chapter": "ch13",
          "after_text": "他伸手，从自己脖子上解下一串银饰，塞到刘伯承手里。",
          "portraitId": "xiao_yedan_ch13_oath",
          "reason": "歃血为盟后小叶丹把贴身银饰送给刘伯承；此后他的颈部不再有银项圈，怀里多了红军赠旗。"
        }
      ]
    },
    "xiaoman": {
      "name": "小满",
      "stateIds": [
        "xiaoman_ch01_departure",
        "xiaoman_ch02_rain",
        "xiaoman_ch03_xiangjiang",
        "xiaoman_ch03_binding",
        "xiaoman_ch04_walk",
        "xiaoman_ch06_supply",
        "xiaoman_ch08_chishui",
        "xiaoman_ch12_longmarch",
        "xiaoman_ch16_snow",
        "xiaoman_ch17_grassland",
        "xiaoman_ch17_pot",
        "xiaoman_ch18_lazikou",
        "xiaoman_ch19_wuqi",
        "xiaoman_ch19_cord",
        "xiaoman_ch20_huining"
      ],
      "beats": [
        {
          "chapter": "ch03",
          "after_text": "小满在江边的一块石头上，捡到一条绑腿。",
          "portraitId": "xiaoman_ch03_binding",
          "reason": "石柱留在湘江边的那条绑腿被小满捡起，随后缠在右臂上；ch03 后半段肖像应换成右臂缠布条。"
        },
        {
          "chapter": "ch17",
          "after_text": "小满把铜锅背在背上。锅很轻，因为里面什么都没有。",
          "portraitId": "xiaoman_ch17_pot",
          "reason": "李铁柱死在草地后，铜锅改由小满背；从这一拍起直到 ch18，号兵背上多了一口锅。"
        },
        {
          "chapter": "ch19",
          "after_text": "小满把那根带子缠在号管的第三节上，缠了三圈，打了个结。",
          "portraitId": "xiaoman_ch19_cord",
          "reason": "阿月临别赠麻线带，小满把它系在号管第三节；此后号上一直带着这根褪色带子。"
        }
      ]
    },
    "li_tiezhu": {
      "name": "李铁柱",
      "stateIds": [
        "li_tiezhu_ch01_start",
        "li_tiezhu_ch03_xiangjiang",
        "li_tiezhu_ch05_onepot",
        "li_tiezhu_ch06_supply",
        "li_tiezhu_ch09_longmarch",
        "li_tiezhu_ch14_wet",
        "li_tiezhu_ch16_snow",
        "li_tiezhu_ch17_grassland",
        "li_tiezhu_ch17_death"
      ],
      "beats": [
        {
          "chapter": "ch05",
          "after_text": "他把那口锅背起来，走了。",
          "portraitId": "li_tiezhu_ch05_onepot",
          "reason": "黎平轻装命令只留两口锅，李铁柱最终只背走一口带补丁的锅；其余五口留在街上，装备数量明显变化。"
        },
        {
          "chapter": "ch17",
          "after_text": "第七天早上，他没有站起来。",
          "portraitId": "li_tiezhu_ch17_death",
          "reason": "草地第七天李铁柱背靠铜锅去世，双手仍搭在锅沿；此前他一直在锅边给伤员分鱼汤。"
        }
      ]
    },
    "he_xiaomei": {
      "name": "何晓梅",
      "stateIds": [
        "he_xiaomei_ch01_start",
        "he_xiaomei_ch03_xiangjiang",
        "he_xiaomei_ch03_torn",
        "he_xiaomei_ch06_supply",
        "he_xiaomei_ch07_supply",
        "he_xiaomei_ch08_chishui",
        "he_xiaomei_ch12_longmarch",
        "he_xiaomei_ch16_snow",
        "he_xiaomei_ch19_north",
        "he_xiaomei_ch20_huining",
        "he_xiaomei_ch17_18_coldwet"
      ],
      "beats": [
        {
          "chapter": "ch03",
          "after_text": "我把自己的衬衣撕了。衬衣也只有一件。",
          "portraitId": "he_xiaomei_ch03_torn",
          "reason": "湘江后绷带用尽，何晓梅撕掉自己唯一的衬衣；围裙血污加重，军装下摆露出撕过的里布。"
        },
        {
          "chapter": "ch07",
          "after_text": "上级发了钱，要她把卫生队的药品补齐。",
          "portraitId": "he_xiaomei_ch07_supply",
          "reason": "遵义城里领到钱后补药，药箱从几乎空竭恢复为装满纸包药与绷带；这是全线少数明确的医疗补给点。"
        }
      ]
    },
    "guo_daniang": {
      "name": "郭大娘",
      "stateIds": [
        "guo_daniang_ch01_yudu",
        "guo_daniang_ch01_thimble"
      ],
      "beats": [
        {
          "chapter": "ch01",
          "after_text": "她把门板放下，从怀里摸出一样很小的东西。",
          "portraitId": "guo_daniang_ch01_thimble",
          "reason": "郭大娘放下门板、取出铜顶针递给小满；这是 ch01 情感线的核心道具变化，顶针此后跟小满走到会宁。"
        }
      ]
    },
    "shi_zhu": {
      "name": "石柱",
      "stateIds": [
        "shi_zhu_ch01_start",
        "shi_zhu_ch08_before",
        "shi_zhu_ch08_shoulder",
        "shi_zhu_ch09_wounded",
        "shi_zhu_ch14_dadu",
        "shi_zhu_ch14_leg",
        "shi_zhu_ch15_luding",
        "shi_zhu_ch15_burned"
      ],
      "beats": [
        {
          "chapter": "ch08",
          "after_text": "石柱背着两个伤员下来，自己的左肩被子弹打穿了。",
          "portraitId": "shi_zhu_ch08_shoulder",
          "reason": "青杠坡战斗中石柱左肩被打穿，左臂不能再用力；此后左肩厚布与少一条绑腿成为固定外观。"
        },
        {
          "chapter": "ch14",
          "after_text": "伤口很长，从膝盖一直划到脚踝，泡了一上午的水，皮肉翻着白。",
          "portraitId": "shi_zhu_ch14_leg",
          "reason": "强渡大渡河时石柱右腿被水中石头划开，何晓梅割开裤腿包扎；此前右腿外观完整。"
        },
        {
          "chapter": "ch15",
          "after_text": "何晓梅撕开他的衣服。前胸和两条手臂都烧伤了，皮肉粘在一起。",
          "portraitId": "shi_zhu_ch15_burned",
          "reason": "泸定桥冲火后石柱前胸与双臂烧伤，帽子和完整军装都不在了；这是他的最后形象。"
        }
      ]
    },
    "a_yue": {
      "name": "阿月",
      "stateIds": [
        "a_yue_ch04_guide",
        "a_yue_ch18_cliff",
        "a_yue_ch19_farewell"
      ],
      "beats": []
    },
    "wu_laoliu": {
      "name": "吴老六",
      "stateIds": [
        "wu_laoliu_ch01_start",
        "wu_laoliu_ch03_xiangjiang",
        "wu_laoliu_ch06_supply",
        "wu_laoliu_ch08_chishui",
        "wu_laoliu_ch10_rifle",
        "wu_laoliu_ch12_longmarch",
        "wu_laoliu_ch16_snow",
        "wu_laoliu_ch19_north",
        "wu_laoliu_ch17_18_coldwet"
      ],
      "beats": [
        {
          "chapter": "ch10",
          "after_text": "卫生员，我的枪换了。",
          "portraitId": "wu_laoliu_ch10_rifle",
          "reason": "娄山关缴获后吴老六把枪托裂开的旧枪换成黔军步枪；这是 ch10 之后最明确的随身装备变化。"
        }
      ]
    },
    "san_wa": {
      "name": "三娃",
      "stateIds": [
        "san_wa_ch01_start",
        "san_wa_ch04_cold",
        "san_wa_ch07_supply",
        "san_wa_ch09_longmarch",
        "san_wa_ch13_longmarch",
        "san_wa_ch16_snow",
        "san_wa_ch17_rope",
        "san_wa_ch18_lazikou",
        "san_wa_ch18_new_shoes",
        "san_wa_ch19_north",
        "san_wa_ch20_huining",
        "san_wa_ch17_grassland"
      ],
      "beats": [
        {
          "chapter": "ch17",
          "after_text": "他把皮带切成小段，放在锅里，加水，下面架着刚挖出来的湿草根。",
          "portraitId": "san_wa_ch17_rope",
          "reason": "三娃把唯一的皮带割下煮汤，裤腰改用草绳；从这一拍起他的腰间不再是皮带。"
        },
        {
          "chapter": "ch18",
          "after_text": "他把鞋穿上，系得很紧。系完以后，他抬头看了一眼对面的碉堡。",
          "portraitId": "san_wa_ch18_new_shoes",
          "reason": "小满把懋功会师时四方面军送的新草鞋给三娃；此前三娃脚上是补了又补的旧草鞋。"
        }
      ]
    },
    "soldiers": {
      "name": "红军战士们",
      "stateIds": [
        "soldiers_ch01_early",
        "soldiers_ch06_supply",
        "soldiers_ch09_longmarch",
        "soldiers_ch16_snow",
        "soldiers_ch20_huining",
        "soldiers_ch17_18_coldwet"
      ],
      "beats": []
    },
    "villagers": {
      "name": "乡亲们",
      "stateIds": [
        "villagers_ch01_yudu",
        "villagers_ch04_guizhou",
        "villagers_ch14_sichuan",
        "villagers_ch19_north"
      ],
      "beats": []
    },
    "yi_people": {
      "name": "彝族同胞",
      "stateIds": [
        "yi_people_ch13_yihai",
        "yi_people_ch13_freed"
      ],
      "beats": [
        {
          "chapter": "ch13",
          "after_text": "几十把铁链一起被砸断。",
          "portraitId": "yi_people_ch13_freed",
          "reason": "冕宁土牢铁链被砸断后，被关押的彝族同胞从蹲坐改为站起，脚踝木枷去除；老人把抱着的石头留在门槛上。"
        }
      ]
    },
    "narrator": {
      "name": "旁白",
      "stateIds": [
        "narrator_all"
      ],
      "beats": []
    }
  },
  "states": {
    "mao_ch01_ill": {
      "id": "mao_ch01_ill",
      "character": "mao",
      "label": "于都出发·疟疾初愈",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "exhausted",
      "outfit_cn": "灰绿旧军装，领章褪成暗红褐，帽徽只余暗色布痕；长衫式下摆，袖口磨薄，衣料洗得发白。",
      "equipment_cn": "八角帽、深色烟斗、折好的纸地图；无枪，随军担架就在附近。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 3deg",
        "gaze": "slightly_left"
      },
      "pose_cn": "半身略向前倾，左手指间夹着未点燃的烟斗，右手压住胸前的折图，肩背因久病略塌。",
      "props_cn": [
        "八角帽",
        "深色烟斗",
        "折好的纸地图"
      ],
      "faces": [
        "calm",
        "smile",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A gaunt 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair under a worn octagonal Red Army cap without a bright star, clean-shaven. Faded grey-green tunic with dull dark-red collar tabs bearing visible stitch marks, long civilian-coat hem and thin cuffs, road dust at the shoulders. He leans slightly forward, unlit briar pipe in the left hand, folded paper map under the right hand, hollow illness in the cheeks.",
      "avoid_en": "no young face, no bright red star, no clean new uniform, no extra people, no text"
    },
    "mao_ch03_xiangjiang": {
      "id": "mao_ch03_xiangjiang",
      "character": "mao",
      "label": "湘江之后·减员",
      "chapters": [
        "ch03"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "同一身灰绿军装，领口被雨水压塌，肩头有烟灰，袖口与下摆沾着江岸泥点；帽子被雨淋得变形。",
      "equipment_cn": "八角帽、未点燃的烟斗、被雨泡软的折图；无枪。",
      "head": {
        "turn": "right 10deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "双肩下沉，站在摊开的地图旁，右手按住图角，左手握烟斗却不抽，身体重量压在一条腿上。",
      "props_cn": [
        "八角帽",
        "未点燃的烟斗",
        "雨湿的纸地图"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same tall thin 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair, worn octagonal cap misshapen by rain, clean-shaven. Grey-green tunic crushed at the collar, soot on one shoulder, river mud speckled at the cuffs and long hem, dull dark-red collar tabs. Shoulders lowered over a rain-softened map, unlit pipe held loosely, head turned right and down, hollow exhaustion after the Xiang River.",
      "avoid_en": "no clean uniform, no upright heroic pose, no bright collar tabs, no smoking, no extra figures, no blood on face, no text"
    },
    "mao_ch04_tongdao": {
      "id": "mao_ch04_tongdao",
      "character": "mao",
      "label": "通道转兵·冬雨",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装外无大衣，衣肩被冬雨浸深，领章暗红发褐，下摆和袖口带泥；裤脚湿到小腿。",
      "equipment_cn": "八角帽、烟斗、铅笔、两张对折的地图；无枪。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 2deg",
        "gaze": "slightly_left"
      },
      "pose_cn": "站在木桌边，左手撑桌，右手用铅笔点着地图，肩背仍瘦，但眼神比湘江时稳定。",
      "props_cn": [
        "八角帽",
        "烟斗",
        "铅笔",
        "对折地图"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall thin 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair under a rain-dulled octagonal cap, clean-shaven. Grey-green tunic darkened at the shoulders by winter rain, dull dark-red collar tabs, muddy long hem, the tunic worn alone in the rain. Standing at a wooden table, left hand braced on the edge, right hand marking a folded map with a pencil, head turned slightly left, tired but steady gaze.",
      "avoid_en": "no overcoat, no dry clean cloth, no bright red star, no seated pose, no smile, no extra people, no text"
    },
    "mao_ch06_houchang": {
      "id": "mao_ch06_houchang",
      "character": "mao",
      "label": "猴场遵义·休整",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗过、刷过，领章仍是褪色暗红，袖口补过一小块同色布，下摆平整；没有换新衣。",
      "equipment_cn": "八角帽、烟斗、铅笔、折图；遵义会议期间手边有茶杯和纸。",
      "head": {
        "turn": "left 3deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "坐在会议桌边，背略直，左手扶茶杯，右手执铅笔压在纸上，神情克制。",
      "props_cn": [
        "八角帽",
        "烟斗",
        "铅笔",
        "折图",
        "搪瓷茶杯"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall thin 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair, octagonal cap straightened, clean-shaven. Washed grey-green tunic, faded dark-red collar tabs, one small same-colour repair at the cuff, clean long hem but old cloth. Seated at a meeting table, left hand around an enamel cup, right hand holding a pencil over paper, level gaze, composed and watchful.",
      "avoid_en": "no new uniform, no shiny boots, no smiling, no standing heroic pose, no cigarette smoke, no extra people, no text"
    },
    "mao_ch08_chishui": {
      "id": "mao_ch08_chishui",
      "character": "mao",
      "label": "赤水四渡·连续机动",
      "chapters": [
        "ch08",
        "ch09",
        "ch10",
        "ch11"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装明显旧了，左肘有深色补丁，下摆和绑腿溅满红泥，帽箍被汗浸深，领章几乎看不出红色。",
      "equipment_cn": "八角帽、烟斗、卷起的地图、铅笔；无枪，腰间旧布包。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 4deg",
        "gaze": "forward_right"
      },
      "pose_cn": "行走后站定，衣角被风掀起，右手把卷图当手杖撑着，左肩略低，脸上是连续熬夜的灰。",
      "props_cn": [
        "八角帽",
        "烟斗",
        "卷起的地图",
        "铅笔",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall thin 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair, sweat-darkened octagonal cap, clean-shaven. Worn grey-green tunic with a dark patch at the left elbow, red mud splashed across the long hem, collar tabs almost colourless. Standing after a march, coat hem lifted by wind, right hand resting on a rolled map like a walking staff, left shoulder low, grey fatigue around the eyes.",
      "avoid_en": "no clean hem, no fresh uniform, no upright parade stance, no smile, no horse, no extra figures, no text"
    },
    "mao_ch14_dadu": {
      "id": "mao_ch14_dadu",
      "character": "mao",
      "label": "大渡河边·地图与渡口",
      "chapters": [
        "ch14"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "军装褪成灰白，肩缝用深线补过，袖口磨毛，裤脚和绑腿被河水打湿，领章只剩暗色轮廓。",
      "equipment_cn": "八角帽、草纸地图、铅笔头、胸前口袋里的烟斗；手边压着一本旧书。",
      "head": {
        "turn": "left 8deg",
        "pitch": "down 7deg",
        "gaze": "down_left"
      },
      "pose_cn": "双手撑在石上的地图边缘，身体前倾，目光压在渡口位置，肩背绷紧。",
      "props_cn": [
        "八角帽",
        "草纸地图",
        "铅笔头",
        "烟斗",
        "旧书"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall thin 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair under a faded octagonal cap, clean-shaven. Tunic faded to ash grey, shoulder seam repaired with dark thread, frayed cuffs, trousers and puttees dark with river water, collar tabs only a faint outline. Both hands braced on a grass-paper map laid over stone, body leaning forward, head lowered toward the crossing, jaw tight.",
      "avoid_en": "no clean clothes, no standing tall, no bright insignia, no smile, no boat in frame, no extra people, no text"
    },
    "mao_ch16_snow": {
      "id": "mao_ch16_snow",
      "character": "mao",
      "label": "雪山草地·单衣风霜",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "单薄旧灰绿军装，腰间缠一圈粗布，八角帽和肩头落霜；没有围巾、没有厚领、没有棉衣。",
      "equipment_cn": "结霜的八角帽、紧贴胸口的折图、烟斗；无枪，脚上草鞋外缠布条。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 8deg",
        "gaze": "down"
      },
      "pose_cn": "缩着肩顶风，一只手按住帽檐，另一只手把地图压在胸前，身体微微弓起。",
      "props_cn": [
        "结霜的八角帽",
        "胸前的折图",
        "烟斗",
        "缠布条的草鞋"
      ],
      "faces": [
        "calm",
        "stern",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A gaunt 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair under a worn octagonal Red Army cap, clean-shaven. Thin single-layer grey-green tunic with dull dark-red collar tabs and a crude cloth waist wrap, no scarf and no padded collar; frost on the cap, shoulders and brows, hollow cheeks from illness and cold. One hand presses a folded map to the chest, the other holds the cap brim against the wind.",
      "avoid_en": "no scarf, no padded coat, no fur collar, no young face, no clean uniform, no bright red insignia, no snowstorm background, no extra people, no text"
    },
    "mao_ch19_wuqi": {
      "id": "mao_ch19_wuqi",
      "character": "mao",
      "label": "吴起镇·落脚陕北",
      "chapters": [
        "ch19"
      ],
      "wear": 4,
      "dirt": 2,
      "injury": "exhausted",
      "outfit_cn": "旧灰绿军装洗净、压平，领章仍是褪色暗红，袖口补丁保留，鞋面有黄土但完整；没有换新制服。",
      "equipment_cn": "八角帽、烟斗、折好的报纸、旧书《读史方舆纪要》；无枪。",
      "head": {
        "turn": "left 4deg",
        "pitch": "up 4deg",
        "gaze": "up_left"
      },
      "pose_cn": "站在黄土塬边，衣角被风掀起，左手夹烟斗，右手把报纸折进胸前口袋，肩背第一次真正舒展。",
      "props_cn": [
        "八角帽",
        "烟斗",
        "折好的报纸",
        "旧书"
      ],
      "faces": [
        "calm",
        "stern",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall thin 41-year-old man, broad forehead, deep-set eyes, centre-parted long black hair under a brushed octagonal cap, clean-shaven. Washed but faded grey-green tunic, dull dark-red collar tabs, kept cuff patch, clean long hem, cloth shoes dusty but intact. Standing on a loess ridge, coat hem lifted by wind, pipe held loosely, folded newspaper in the breast pocket, head lifted toward the northern hills, shoulders finally relaxed.",
      "avoid_en": "no new uniform, no bright insignia, no smiling broadly, no rifle, no extra people, no modern buildings, no text"
    },
    "mao_ch17_18_coldwet": {
      "id": "mao_ch17_18_coldwet",
      "character": "mao",
      "label": "草地与腊子口·冷湿单衣",
      "chapters": [
        "ch17",
        "ch18"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "同一身单薄旧军装，衣摆泥水结块，粗布腰带，八角帽被雨打塌；没有雪、没有棉衣。",
      "equipment_cn": "结霜的八角帽、紧贴胸口的折图、烟斗；无枪，脚上草鞋外缠布条。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 8deg",
        "gaze": "down"
      },
      "pose_cn": "缩着肩顶风，一只手按住帽檐，另一只手把地图压在胸前，身体微微弓起。",
      "props_cn": [
        "结霜的八角帽",
        "胸前的折图",
        "烟斗",
        "缠布条的草鞋"
      ],
      "faces": [
        "calm",
        "stern",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same gaunt 41-year-old man, long thin face, deep-set eyes, centre-parted black hair under a rain-flattened octagonal cap. Thin single-layer grey-green tunic clotted with cold mud at the hem, crude cloth waist wrap, no padded coat, no scarf, no snow and no frost. One hand holds a folded map against the chest, shoulders bent under exhaustion from the grassland and the Lazikou cliffs.",
      "avoid_en": "no snow, no frost, no padded coat, no scarf, no young face, no clean uniform, no extra people, no text"
    },
    "zhou_ch01_start": {
      "id": "zhou_ch01_start",
      "character": "zhou",
      "label": "于都出发·长期缺觉",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "exhausted",
      "outfit_cn": "整洁但洗旧的灰绿军装，左臂暗红臂章，袖口略磨；领章已褪色，腰带扣有使用痕迹。",
      "equipment_cn": "军便帽、折好的电报稿、铅笔、旧皮质地图包；无枪。",
      "head": {
        "turn": "right 8deg",
        "pitch": "level",
        "gaze": "slightly_right"
      },
      "pose_cn": "站得直，双手拿着一份电报，右手拇指压着纸边，肩略收，眼下有长期缺觉的青影。",
      "props_cn": [
        "军便帽",
        "电报稿",
        "铅笔",
        "旧皮质地图包"
      ],
      "faces": [
        "calm",
        "worry",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A lean gaunt 36-year-old man with high cheekbones, thick dark eyebrows, short black hair under a soft officer cap, clean-shaven. Neat but faded grey-green tunic with a dull red armband, worn cuffs, leather map case strap across the chest. Upright, holding a folded telegram in both hands, head turned slightly right, dark shadows under steady eyes.",
      "avoid_en": "no robust build, no smile, no new uniform, no bright red armband, no rifle, no extra people, no text"
    },
    "zhou_ch03_xiangjiang": {
      "id": "zhou_ch03_xiangjiang",
      "character": "zhou",
      "label": "湘江·三天未合眼",
      "chapters": [
        "ch03"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装肩头被雨浸透，臂章褪成暗红，领口敞开一颗扣，帽檐被雨压弯；袖口有泥。",
      "equipment_cn": "军便帽、带淡淡血迹的白手帕、电报稿、地图包、铅笔。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 5deg",
        "gaze": "down"
      },
      "pose_cn": "站着却像随时会倒下，一只手撑住地图桌边缘，另一只手攥着手帕，肩膀内收。",
      "props_cn": [
        "军便帽",
        "染血白手帕",
        "电报稿",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a rain-bent officer cap. Grey-green tunic soaked dark at the shoulders, faded red armband, collar open at one button, mud at the cuffs. Standing hollow-eyed with one hand bracing the edge of a map table, a white cotton handkerchief with a faint dark stain in the other hand, head down after three sleepless nights.",
      "avoid_en": "no clean dry uniform, no upright energetic pose, no bright armband, no smile, no visible gore, no extra people, no text"
    },
    "zhou_ch04_tongdao": {
      "id": "zhou_ch04_tongdao",
      "character": "zhou",
      "label": "通道黎平·冬雨",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装外无大衣，肩背被冬雨打湿，臂章暗红发褐，领口扣好，裤脚带泥。",
      "equipment_cn": "军便帽、地图包、电报稿、铅笔；手边一盏马灯。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 2deg",
        "gaze": "slightly_left"
      },
      "pose_cn": "站在会议桌旁，左手压着地图，右手握铅笔，身体略向桌面倾，眼神疲惫但清醒。",
      "props_cn": [
        "军便帽",
        "地图包",
        "电报稿",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "fierce",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a damp officer cap. Grey-green tunic dark at the shoulders from winter rain, worn alone, dull brown-red armband, muddy cuffs, collar buttoned. Standing at a meeting table, left hand flat on a map, right hand holding a pencil, body angled toward the table, tired but clear gaze.",
      "avoid_en": "no overcoat, no dry cloth, no bright armband, no smile, no rifle, no extra people, no text"
    },
    "zhou_ch06_zunyi": {
      "id": "zhou_ch06_zunyi",
      "character": "zhou",
      "label": "猴场遵义·洗整与自责",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装洗净压平，臂章重新缝过但仍褪色，领口整齐，袖口补过；衣料仍旧。",
      "equipment_cn": "军便帽、会议纸稿、铅笔、地图包；手边搪瓷缸。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 3deg",
        "gaze": "forward"
      },
      "pose_cn": "坐在会议桌边，双手把纸稿压在桌上，肩背略弯，嗓子哑、眼神坦然。",
      "props_cn": [
        "军便帽",
        "会议纸稿",
        "铅笔",
        "搪瓷缸"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a straightened officer cap. Washed grey-green tunic, repaired red armband, neat collar, patched cuff, still old cloth. Seated at a meeting table, both hands pressing a folded report, shoulders slightly bowed, hoarse and candid expression, eyes forward.",
      "avoid_en": "no new uniform, no bright armband, no smile, no standing salute, no rifle, no extra people, no text"
    },
    "zhou_ch08_chishui": {
      "id": "zhou_ch08_chishui",
      "character": "zhou",
      "label": "土城赤水·泥与烟",
      "chapters": [
        "ch08",
        "ch09",
        "ch10",
        "ch11"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装下摆与袖口溅满红泥，臂章褪色，肩缝磨旧，帽檐有雨痕；领口常敞开。",
      "equipment_cn": "军便帽、地图包、电报稿、铅笔；无枪。",
      "head": {
        "turn": "left 7deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "伏在地图前，右手食指沿河线移动，左手撑桌，肩背因连续机动显得更薄。",
      "props_cn": [
        "军便帽",
        "地图包",
        "电报稿",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a rain-stained officer cap. Grey-green tunic with red mud splashed across the lower sleeves and hem, faded armband, worn shoulder seam, collar open. Bent over a map, right forefinger tracing a river line, left hand braced on the table, thinner after weeks of marching and fighting.",
      "avoid_en": "no clean uniform, no upright pose, no bright armband, no smile, no rifle, no extra people, no text"
    },
    "zhou_ch12_jinsha": {
      "id": "zhou_ch12_jinsha",
      "character": "zhou",
      "label": "金沙江·咳血与九昼夜",
      "chapters": [
        "ch12"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被江风与汗水浸出盐痕，袖子卷起一道，臂章褪成近粉，裤腿湿到膝盖，领口松着。",
      "equipment_cn": "军便帽、渡江名册、铅笔、地图包；手边无马。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "一手撑膝、一手按住石岸，咳完后肩背起伏，头低着，仍不肯坐下。",
      "props_cn": [
        "军便帽",
        "渡江名册",
        "铅笔",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a salt-stained officer cap. Grey-green tunic with salt marks, one sleeve rolled, armband faded almost pink, trousers wet to the knee, collar loose. One hand braced on a knee, the other flat on stone, shoulders heaving after a quiet cough, head low, refusing to sit down.",
      "avoid_en": "no clean uniform, no upright strong pose, no bright armband, no smile, no horse, no extra people, no text"
    },
    "zhou_ch14_dadu": {
      "id": "zhou_ch14_dadu",
      "character": "zhou",
      "label": "大渡河·糖坊里的老船工",
      "chapters": [
        "ch14"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被雨水和河风压旧，臂章褪成暗褐，领口松开，袖口有泥；裤脚湿到小腿。",
      "equipment_cn": "军便帽、地图包、铅笔、电报稿；无马。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "站在糖坊木桌旁，右手压着地图，左手扶桌沿，身体略前倾，语气放缓。",
      "props_cn": [
        "军便帽",
        "地图包",
        "铅笔",
        "电报稿"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a rain-stained officer cap. Grey-green tunic worn by rain and river wind, armband faded brown, collar open, muddy cuffs, trousers wet to mid-calf. Standing at a wooden table in a sugar mill, right hand on a map, left hand on the table edge, body slightly forward, voice deliberately calm.",
      "avoid_en": "no clean uniform, no bright armband, no horse, no smile, no upright strong pose, no extra people, no text"
    },
    "zhou_ch16_snow": {
      "id": "zhou_ch16_snow",
      "character": "zhou",
      "label": "雪山草地·借毯",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "单薄灰绿军装外裹一条借来的粗灰毯，毯边磨毛，领章几乎看不见，袖口结霜，鞋面湿硬。",
      "equipment_cn": "军便帽、粗灰毯、电报稿、地图包；无枪。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 8deg",
        "gaze": "down"
      },
      "pose_cn": "缩着肩，双手把毯子在胸前拢紧，身体前倾顶风，脸被冻得发白。",
      "props_cn": [
        "军便帽",
        "粗灰毯",
        "电报稿",
        "地图包"
      ],
      "faces": [
        "calm",
        "worry",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a frosted officer cap, lips pale. Thin grey-green tunic under a borrowed rough grey blanket folded around the shoulders, frost on the brows, sleeves stiff with cold, collar tabs almost invisible. Stooped against the wind, both hands holding the blanket closed at the chest, head down, face bleached by cold.",
      "avoid_en": "no padded coat, no fur hat, no clean warm cloth, no smile, no upright pose, no horse, no extra people, no text"
    },
    "zhou_ch19_wuqi": {
      "id": "zhou_ch19_wuqi",
      "character": "zhou",
      "label": "吴起镇·洗净的旧衣",
      "chapters": [
        "ch19"
      ],
      "wear": 4,
      "dirt": 2,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装洗净，臂章补过，帽檐压平，袖口仍有补丁；布鞋带黄土，但没有破口。",
      "equipment_cn": "军便帽、折好的报纸、铅笔、地图包；无枪。",
      "head": {
        "turn": "left 5deg",
        "pitch": "up 3deg",
        "gaze": "up_left"
      },
      "pose_cn": "站直，双手把报纸展开一半，头微抬看向北边的塬，肩背仍瘦但不再塌。",
      "props_cn": [
        "军便帽",
        "报纸",
        "铅笔",
        "地图包"
      ],
      "faces": [
        "calm",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean gaunt 36-year-old man, high cheekbones, thick dark eyebrows, short black hair under a flattened officer cap. Washed grey-green tunic, repaired red armband, kept cuff patches, cloth shoes dusty but intact. Standing straight with a newspaper opened in both hands, head lifted toward the northern loess hills, thin but filled out a little.",
      "avoid_en": "no new uniform, no bright armband, no smile, no rifle, no horse, no extra people, no text"
    },
    "zhou_ch17_coldwet": {
      "id": "zhou_ch17_coldwet",
      "character": "zhou",
      "label": "草地·冷湿旧军装",
      "chapters": [
        "ch17"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "湿旧灰绿军装，袖口沾泥，臂章褪色；没有雪、没有厚毯。",
      "equipment_cn": "军便帽、粗灰毯、电报稿、地图包；无枪。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 8deg",
        "gaze": "down"
      },
      "pose_cn": "缩着肩，双手把毯子在胸前拢紧，身体前倾顶风，脸被冻得发白。",
      "props_cn": [
        "军便帽",
        "粗灰毯",
        "电报稿",
        "地图包"
      ],
      "faces": [
        "calm",
        "weak",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same gaunt man in his mid-thirties, thick dark brows, soft officer cap soaked and bent, faded red armband. Wet grey-green tunic with mud at the cuff and hem, arms holding a telegram close to the chest, no blanket over the shoulders, no frost and no snow, hollow exhaustion from the grassland.",
      "avoid_en": "no snow, no frost, no thick blanket, no padded coat, no young face, no extra people, no text"
    },
    "zhu_ch02_start": {
      "id": "zhu_ch02_start",
      "character": "zhu",
      "label": "突破封锁线·与兵同行",
      "chapters": [
        "ch02",
        "ch03"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装厚实但已旧，腰带磨亮，绑腿扎紧，肩头有一处小补丁；领章褪色。",
      "equipment_cn": "八角帽、肩背步枪、旧布包、草鞋。",
      "head": {
        "turn": "right 6deg",
        "pitch": "level",
        "gaze": "slightly_right"
      },
      "pose_cn": "宽肩站直，右手扶枪带，左手自然下垂，像随时要接过别人的担子。",
      "props_cn": [
        "八角帽",
        "步枪",
        "旧布包",
        "草鞋"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A broad-shouldered round-faced man in his late forties, wide jaw, thick neck, grey-flecked short beard, octagonal Red Army cap. Sturdy faded grey-green tunic, wide leather belt, puttees bound tight, one small shoulder repair; a rifle slung on one shoulder, right hand steadying the strap. Keep the face rounder and the shoulders heavier than the other commanders.",
      "avoid_en": "no narrow face, no thin jaw, no clean new uniform, no extra people, no text"
    },
    "zhu_ch04_tongdao": {
      "id": "zhu_ch04_tongdao",
      "character": "zhu",
      "label": "通道黎平·雨里行军",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "灰绿军装下摆被泥水打湿，腰带磨旧，帽檐被雨压弯，绑腿沾泥，肩头补丁仍在。",
      "equipment_cn": "八角帽、步枪、木棍、旧布包。",
      "head": {
        "turn": "left 8deg",
        "pitch": "down 3deg",
        "gaze": "left"
      },
      "pose_cn": "双手拄着一根木棍，肩仍端平，身体略前倾，像在雨里替队伍压住步子。",
      "props_cn": [
        "八角帽",
        "步枪",
        "木棍",
        "旧布包"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Broad-shouldered stout 48-year-old man, round face, wide jaw, grey-flecked short beard, octagonal cap crumpled by rain. Faded grey-green tunic with a muddy hem, scuffed leather belt, muddy puttees, one shoulder repair. Standing with both hands on a wooden staff, shoulders still square, body leaning slightly forward, steady gaze left.",
      "avoid_en": "no clean dry uniform, no thin frame, no smile, no horse, no extra people, no text"
    },
    "zhu_ch06_zunyi": {
      "id": "zhu_ch06_zunyi",
      "character": "zhu",
      "label": "猴场遵义·火盆边",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净刷平，腰带重新擦过，帽形端正，草鞋完整；领章仍是旧暗红。",
      "equipment_cn": "八角帽、搪瓷缸、旧布包；步枪靠在桌边。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "坐在炭盆边，背仍直，双手捧搪瓷缸，像刚从战士堆里回来。",
      "props_cn": [
        "八角帽",
        "搪瓷缸",
        "旧布包",
        "步枪"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Broad-shouldered stout 48-year-old man, round face, wide jaw, grey-flecked short beard, octagonal cap straightened. Cleaned faded grey-green tunic, belt polished by use, intact cloth shoes, dull dark-red collar tabs. Seated but straight-backed beside a charcoal basin, both hands around an enamel mug, rifle leaning within reach, calm forward gaze.",
      "avoid_en": "no new uniform, no bright insignia, no slouching, no smile, no extra people, no text"
    },
    "zhu_ch08_tucheng": {
      "id": "zhu_ch08_tucheng",
      "character": "zhu",
      "label": "土城娄山关·战尘",
      "chapters": [
        "ch08",
        "ch10"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "none",
      "outfit_cn": "灰绿军装被硝烟熏暗，袖口磨破后缠着布条，腰带刮花，绑腿糊满红泥；领章发黑。",
      "equipment_cn": "八角帽、步枪、旧布包。",
      "head": {
        "turn": "left 10deg",
        "pitch": "down 4deg",
        "gaze": "left"
      },
      "pose_cn": "身体前倾，像刚从火线下来，右手提枪，左手掸袖口的泥，肩背仍厚实。",
      "props_cn": [
        "八角帽",
        "步枪",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Broad-shouldered stout 48-year-old man, round face, wide jaw, grey-flecked short beard, octagonal cap dark with powder smoke. Grey-green tunic grimed with smoke, cuff bound with cloth, scratched belt, puttees caked in red mud, collar tabs blackened. Leaning forward as if just off the front line, rifle in one hand, the other brushing mud from a sleeve, thick shoulders still square.",
      "avoid_en": "no clean uniform, no pristine cap, no smile, no heroic pose, no horse, no extra people, no text"
    },
    "zhu_ch08_nocap": {
      "id": "zhu_ch08_nocap",
      "character": "zhu",
      "label": "土城指挥所·摘下帽子",
      "chapters": [],
      "wear": 3,
      "dirt": 4,
      "injury": "none",
      "outfit_cn": "同一身硝烟军装，八角帽已摘下放在桌上，露出短硬灰黑发；领章发黑，袖口缠布。",
      "equipment_cn": "桌上的八角帽、步枪、旧布包。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "站在桌前，帽子放在手边，右手按桌，左手扶枪带，额头露出来。",
      "props_cn": [
        "桌上的八角帽",
        "步枪",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Broad-shouldered stout 48-year-old man, round face, wide jaw, grey-flecked short beard, short stiff grey-black hair now uncovered, octagonal cap resting on the table beside him. Smoke-grimed grey-green tunic, cloth-bound cuff, scratched belt, blackened collar tabs. Standing at the table with the right hand down on it, left hand on the rifle strap, forehead bare and calm.",
      "avoid_en": "no cap on the head, no clean uniform, no smile, no horse, no extra people, no text"
    },
    "zhu_ch14_dadu": {
      "id": "zhu_ch14_dadu",
      "character": "zhu",
      "label": "大渡河岸·雨水",
      "chapters": [
        "ch14"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "none",
      "outfit_cn": "灰绿军装被雨水打深，领章褪色，袖子卷起，裤腿湿到膝盖，鞋上全是泥。",
      "equipment_cn": "八角帽、步枪（枪托点地）、旧布包。",
      "head": {
        "turn": "right 12deg",
        "pitch": "level",
        "gaze": "right"
      },
      "pose_cn": "站在河岸，步枪枪托点地，右手扶枪，左手垂下，望向对岸。",
      "props_cn": [
        "八角帽",
        "步枪",
        "旧布包"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Broad-shouldered stout 48-year-old man, round face, wide jaw, grey-flecked short beard, octagonal cap darkened by rain. Rain-darkened grey-green tunic, faded collar tabs, sleeves rolled once, trousers wet to the knee, muddy shoes. Standing at the riverbank with a rifle butt grounded, right hand on the barrel, left arm loose, looking across the water.",
      "avoid_en": "no clean uniform, no dry shoes, no smile, no horse, no boat in frame, no extra people, no text"
    },
    "zhu_ch16_snow": {
      "id": "zhu_ch16_snow",
      "character": "zhu",
      "label": "雪山草地腊子口·老总也让马",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "旧灰绿军装外缠粗绳作腰带，肩上披一条粗灰毯，胡茬和眉毛结霜，袖口冻硬；没有棉衣。",
      "equipment_cn": "八角帽、粗灰毯、步枪、旧布包；马让给伤员。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 7deg",
        "gaze": "down_left"
      },
      "pose_cn": "双手拢住毯子，步枪带压在毯外，身体顶风前倾，仍稳稳站着。",
      "props_cn": [
        "八角帽",
        "粗灰毯",
        "步枪",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Broad-shouldered stout 48-year-old man, round face, wide jaw, grey-flecked beard and brows frosted, octagonal cap snow-dusted. Thin old grey-green tunic with a rope belt, a rough grey blanket around the shoulders, rifle strap over the blanket, cuffs stiff with cold. Walking with the blanket held closed, body leaning into the wind, still planted squarely.",
      "avoid_en": "no padded coat, no fur collar, no clean cloth, no smile, no horse, no upright parade pose, no extra people, no text"
    },
    "zhu_ch20_huining": {
      "id": "zhu_ch20_huining",
      "character": "zhu",
      "label": "会宁会师·点旗",
      "chapters": [
        "ch20"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "洗净的旧灰绿军装，袖口有补丁，八角帽，黑布鞋沾黄土；没有厚呢大衣。",
      "equipment_cn": "八角帽、双手空着；无枪。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "双手在身前交握，头略低，像在迎接从城门外走进来的兄弟部队。",
      "props_cn": [
        "八角帽",
        "交握的双手"
      ],
      "faces": [
        "calm",
        "stern",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same broad, round-faced, grey-bearded commander, wide jaw, octagonal cap brushed clean. Washed faded grey-green tunic with a repaired cuff and dull collar tabs, cloth shoes dusty, no heavy greatcoat and no new uniform. Hands clasped in front, head slightly bowed toward arriving soldiers.",
      "avoid_en": "no heavy greatcoat, no new uniform, no clean parade dress, no extra people, no text"
    },
    "zhu_ch17_18_coldwet": {
      "id": "zhu_ch17_18_coldwet",
      "character": "zhu",
      "label": "草地与腊子口·冷湿旧军装",
      "chapters": [
        "ch17",
        "ch18"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "旧灰绿军装被雨泥打湿，肩背仍宽厚，八角帽湿塌；没有雪、没有厚毯。",
      "equipment_cn": "八角帽、粗灰毯、步枪、旧布包；马让给伤员。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 7deg",
        "gaze": "down_left"
      },
      "pose_cn": "双手拢住毯子，步枪带压在毯外，身体顶风前倾，仍稳稳站着。",
      "props_cn": [
        "八角帽",
        "粗灰毯",
        "步枪",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same broad, round-faced, grey-bearded commander, octagonal cap soaked and bent. Faded grey-green tunic wet and mud-clotted at the hem, rope belt, rifle strap across the shoulder, no blanket and no padded coat, no snow or frost; broad shoulders still square despite exhaustion.",
      "avoid_en": "no snow, no frost, no thick blanket, no padded coat, no clean uniform, no extra people, no text"
    },
    "zhang_wentian_ch04_tongdao": {
      "id": "zhang_wentian_ch04_tongdao",
      "character": "zhang_wentian",
      "label": "通道黎平·斯文理论家",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "深灰军装，灰色围巾紧绕脖颈，领口整齐，袖口有路尘；衣料比普通战士细。",
      "equipment_cn": "圆框眼镜、打开的笔记本、铅笔、灰围巾。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 6deg",
        "gaze": "down"
      },
      "pose_cn": "双手捧着笔记本，头略低看纸页，肩背微驼，站姿文气。",
      "props_cn": [
        "圆框眼镜",
        "笔记本",
        "铅笔",
        "灰围巾"
      ],
      "faces": [
        "calm",
        "stern",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A scholarly 34-year-old man with a long thin face, round wire-rimmed glasses, neat short black hair, clean-shaven. Dark grey tunic with a grey scarf wound close to the neck, neat collar, dry sleeves with road dust at the cuffs. Standing with an open notebook in both hands, head bent toward the page, slight scholarly stoop.",
      "avoid_en": "no army cap, no rifle, no smile, no clean spotless cloth, no extra people, no text"
    },
    "zhang_wentian_ch07_zunyi": {
      "id": "zhang_wentian_ch07_zunyi",
      "character": "zhang_wentian",
      "label": "遵义会议·反报告",
      "chapters": [
        "ch07"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "exhausted",
      "outfit_cn": "深灰军装肘部起皱，围巾松开一圈，领口仍整齐，头发被长时间戴帽压平；无帽。",
      "equipment_cn": "圆框眼镜、折好的报告、铅笔、松开的灰围巾。",
      "head": {
        "turn": "right 7deg",
        "pitch": "down 2deg",
        "gaze": "right"
      },
      "pose_cn": "坐在会议桌边，双手按住报告，身体略前倾，镜片后的目光锐利。",
      "props_cn": [
        "圆框眼镜",
        "折好的报告",
        "铅笔",
        "灰围巾"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Scholarly 34-year-old man, long thin face, round wire-rimmed glasses, neat short black hair flattened from long wear, clean-shaven. Dark grey tunic creased at the elbows, grey scarf loosened, collar still neat. Seated at a meeting table with both hands on a folded report, leaning slightly forward, sharp gaze behind the glasses.",
      "avoid_en": "no army cap, no rifle, no smile, no clean pressed uniform, no extra people, no text"
    },
    "zhang_wentian_ch09_late": {
      "id": "zhang_wentian_ch09_late",
      "character": "zhang_wentian",
      "label": "扎西整编·冬雨",
      "chapters": [
        "ch09"
      ],
      "wear": 3,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "深灰军装被冬雨压出皱，围巾潮湿，裤脚沾泥，袖口有墨迹；无帽。",
      "equipment_cn": "圆框眼镜、笔记本、铅笔、湿灰围巾。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在漏雨的屋檐下，把笔记本贴在胸前挡雨，肩背缩起。",
      "props_cn": [
        "圆框眼镜",
        "笔记本",
        "铅笔",
        "湿灰围巾"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Scholarly 34-year-old man, long thin face, round wire-rimmed glasses, short black hair, clean-shaven. Dark grey tunic rain-wrinkled, damp grey scarf, muddy trousers below the knee, ink at one cuff. Standing under a leaking eave, notebook held close against the rain, shoulders drawn in, gaze down-left.",
      "avoid_en": "no army cap, no rifle, no smile, no dry clean cloth, no extra people, no text"
    },
    "zhang_wentian_ch19_wuqi": {
      "id": "zhang_wentian_ch19_wuqi",
      "character": "zhang_wentian",
      "label": "哈达铺吴起·读到陕北",
      "chapters": [
        "ch19"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "深灰军装洗净，灰围巾干净但薄，眼镜一条腿用细线修过，袖口仍有旧皱。",
      "equipment_cn": "圆框眼镜、折好的报纸、笔记本、铅笔。",
      "head": {
        "turn": "right 4deg",
        "pitch": "up 2deg",
        "gaze": "forward"
      },
      "pose_cn": "一手拿报纸，一手扶镜架，头微抬看向北边，神情难得松下来。",
      "props_cn": [
        "圆框眼镜",
        "报纸",
        "笔记本",
        "铅笔"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Scholarly 34-year-old man, long thin face, round wire-rimmed glasses with one hinge repaired by fine thread, neat short black hair, clean-shaven. Washed dark grey tunic, clean thin grey scarf, softened creases at the cuffs. Newspaper in one hand, the other touching the spectacle frame, head slightly lifted toward the north, rare ease in the face.",
      "avoid_en": "no army cap, no rifle, no broad smile, no new uniform, no extra people, no text"
    },
    "wang_jiaxiang_ch04_stretcher": {
      "id": "wang_jiaxiang_ch04_stretcher",
      "character": "wang_jiaxiang",
      "label": "通道黎平·担架上的重伤",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "stretcher",
      "outfit_cn": "灰绿军装松垮地盖在腹部厚绷带上，领口微开，腿上盖一条折起的灰毯；面色苍白。",
      "equipment_cn": "担架、腹部厚绷带、折起的灰毯、笔记本。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 4deg",
        "gaze": "left"
      },
      "pose_cn": "在担架上半坐起，一只手压住毯边，另一只手把笔记本搁在膝上，肩背靠住担架杆。",
      "props_cn": [
        "担架",
        "腹部绷带",
        "灰毯",
        "笔记本"
      ],
      "faces": [
        "calm",
        "stern",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin pale 28-year-old man with hollow cheeks, short black hair, clean-shaven, grey-green tunic loose over a thick abdominal bandage, collar slightly open. Propped half upright on a carrying stretcher, a folded grey blanket over the legs, one hand holding the blanket edge, the other steadying a notebook on one knee, gaze left.",
      "avoid_en": "no standing, no rifle, no healthy colour, no smile, no clean uniform, no extra people, no text"
    },
    "wang_jiaxiang_ch07_zunyi": {
      "id": "wang_jiaxiang_ch07_zunyi",
      "character": "wang_jiaxiang",
      "label": "遵义会议·第一个提议",
      "chapters": [
        "ch07"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "stretcher",
      "outfit_cn": "灰绿军装下的腹部绷带更厚，脸比通道时更瘦，领口敞开，毯子折在腰间。",
      "equipment_cn": "担架、腹部绷带、笔记本、折起的灰毯。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward_right"
      },
      "pose_cn": "在担架上坐得更高，双手扶着担架边，头抬起，说话时目光直视前方。",
      "props_cn": [
        "担架",
        "腹部绷带",
        "笔记本",
        "灰毯"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin pale 28-year-old man, hollow cheeks, short black hair, grey-green tunic over a fresh bulky abdominal bandage, blanket folded at the waist, face thinner than before. Propped higher on the stretcher, both hands on its side rails, head lifted, gaze forward-right, speaking with quiet force.",
      "avoid_en": "no standing, no rifle, no healthy glow, no smile, no clean uniform, no extra people, no text"
    },
    "bogu_ch02_start": {
      "id": "bogu_ch02_start",
      "character": "bogu",
      "label": "出发初期·书生气",
      "chapters": [
        "ch02"
      ],
      "wear": 0,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "深蓝灰中山装（非军装），领口扣齐，袖线笔直，皮鞋有路尘；衣料比部队整齐。",
      "equipment_cn": "圆框眼镜、抱在胸前的小手风琴、腋下夹着一本书。",
      "head": {
        "turn": "right 6deg",
        "pitch": "up 2deg",
        "gaze": "forward"
      },
      "pose_cn": "站直，双手抱着小手风琴，头略抬，神情自信，书生气明显。",
      "props_cn": [
        "圆框眼镜",
        "小手风琴",
        "书"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A young 27-year-old man with a round face, round wire-rimmed glasses, short black hair, clean-shaven. Neat dark blue-grey Zhongshan suit with a civilian cut, collar buttoned, straight sleeves, leather shoes lightly dusted. Standing with a small accordion held at the chest, a book under one arm, head slightly lifted, confident and bookish.",
      "avoid_en": "no military tunic, no octagonal cap, no rifle, no smile broadly, no dirty clothes, no extra people, no text"
    },
    "bogu_ch04_tongdao": {
      "id": "bogu_ch04_tongdao",
      "character": "bogu",
      "label": "通道争论·书卷与犹疑",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "深蓝灰中山装被冬雨打湿起皱，领口松开一颗扣，皮鞋溅泥，袖口有墨迹。",
      "equipment_cn": "圆框眼镜、合上的小手风琴、折起的文件。",
      "head": {
        "turn": "left 8deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "坐在木箱边，手风琴合着放在膝旁，双手松垂在膝上，肩背内收。",
      "props_cn": [
        "圆框眼镜",
        "小手风琴",
        "折起的文件"
      ],
      "faces": [
        "calm",
        "sad",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Young 27-year-old man, round face, round wire-rimmed glasses, short black hair. Dark blue-grey Zhongshan suit wrinkled and rain-spotted, collar open at one button, leather shoes scuffed and mud-stained, ink at one cuff. Sitting on a packing crate, closed accordion beside his knees, hands loose on his thighs, shoulders drawn in, gaze down-left.",
      "avoid_en": "no military uniform, no octagonal cap, no rifle, no confident smile, no clean suit, no extra people, no text"
    },
    "bogu_ch07_zunyi": {
      "id": "bogu_ch07_zunyi",
      "character": "bogu",
      "label": "遵义会议·承认失败",
      "chapters": [
        "ch07"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "exhausted",
      "outfit_cn": "深蓝灰中山装肘部起皱，领口松着，脸色发白，眼镜后的眼睛疲惫；衣料仍比军装整齐。",
      "equipment_cn": "圆框眼镜、折起的报告、无手风琴。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "坐在会议桌边，双手交握放在报告上，头低着，肩背塌下去。",
      "props_cn": [
        "圆框眼镜",
        "折起的报告"
      ],
      "faces": [
        "calm",
        "sad",
        "worry",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Young 27-year-old man, round face, round wire-rimmed glasses, short black hair, pale and hollow around the eyes. Creased dark blue-grey Zhongshan suit, collar open, still better cut than army cloth. Seated at a meeting table, hands clasped over a folded report, head lowered, shoulders collapsed, the look of a man admitting failure.",
      "avoid_en": "no military uniform, no octagonal cap, no accordion, no rifle, no smile, no upright pose, no extra people, no text"
    },
    "lide_ch02_confident": {
      "id": "lide_ch02_confident",
      "character": "lide",
      "label": "出发初期·地图与条令",
      "chapters": [
        "ch02"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "土黄军呢大衣，衣料明显不同于红军灰绿军装，领口扣严，袖口有皮革护边；无帽。",
      "equipment_cn": "地图筒、望远镜、皮包；无步枪。",
      "head": {
        "turn": "left 4deg",
        "pitch": "up 2deg",
        "gaze": "forward"
      },
      "pose_cn": "站得笔直，一手夹地图筒，一手拿望远镜，下巴略抬，神情固执。",
      "props_cn": [
        "地图筒",
        "望远镜",
        "皮包"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A tall 34-year-old European man with pale skin, high nose, deep-set eyes, light brown short hair uncovered, clean-shaven. Tan wool military overcoat with leather-trimmed cuffs, collar buttoned, clearly different from the grey-green Red Army uniform. Standing stiffly upright, map tube under one arm, binoculars in the other hand, chin slightly lifted, stubborn expression.",
      "avoid_en": "no octagonal cap, no grey-green tunic, no rifle, no smile, no Chinese facial features, no extra people, no text"
    },
    "lide_ch04_shaken": {
      "id": "lide_ch04_shaken",
      "character": "lide",
      "label": "通道黎平·地图合上",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "土黄军呢大衣被冬雨打湿，衣摆有泥点，领口仍扣严，袖口皮革磨旧；无帽。",
      "equipment_cn": "地图筒、叠得整齐的地图、望远镜、皮包。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "坐或半坐在椅边，双手把地图叠得很整齐，肩背僵直，神情由固执转为疲惫。",
      "props_cn": [
        "地图筒",
        "叠好的地图",
        "望远镜",
        "皮包"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 34-year-old European man, pale skin, high nose, deep-set eyes, light brown short hair uncovered. Tan wool overcoat damp with winter rain, muddy hem, collar still buttoned, leather cuffs worn. Sitting at the edge of a chair, folding a map with precise, stiff hands, shoulders rigid, stubbornness giving way to fatigue.",
      "avoid_en": "no octagonal cap, no grey-green uniform, no rifle, no smile, no relaxed posture, no extra people, no text"
    },
    "lide_ch07_zunyi": {
      "id": "lide_ch07_zunyi",
      "character": "lide",
      "label": "遵义会议·沉默",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 3,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "土黄军呢大衣肩头磨旧，衣摆有泥，领口终于松开一颗扣，袖口皮革起毛；无帽。",
      "equipment_cn": "地图筒、皮包、望远镜；地图不再摊开。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 7deg",
        "gaze": "down"
      },
      "pose_cn": "坐着，双手放在膝上，地图筒立在腿边，头低着，不再争辩。",
      "props_cn": [
        "地图筒",
        "皮包",
        "望远镜"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 34-year-old European man, pale skin, high nose, deep-set eyes, light brown short hair uncovered, face drawn. Tan wool overcoat worn at the shoulders, muddy hem, collar finally open at one button, leather cuffs frayed. Seated with hands on his knees, map tube upright beside his leg, head lowered, silent and withdrawn from the argument.",
      "avoid_en": "no octagonal cap, no grey-green uniform, no rifle, no smile, no open map, no extra people, no text"
    },
    "peng_ch01_start": {
      "id": "peng_ch01_start",
      "character": "peng",
      "label": "于都出发·憋着的火",
      "chapters": [
        "ch01",
        "ch02",
        "ch03"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装扎着宽武装带，肩背厚实，袖口磨旧，领章褪色；衣料结实。",
      "equipment_cn": "八角帽、望远镜、手枪、武装带。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "left"
      },
      "pose_cn": "站得很稳，右手握望远镜，左手压在武装带上，方脸绷紧，下颌前突。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "手枪"
      ],
      "faces": [
        "calm",
        "stern",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A stout 36-year-old man with a square face, heavy dark brows, protruding jaw, short stiff black hair under an octagonal cap, clean-shaven. Sturdy grey-green tunic with a wide field belt, worn cuffs, faded collar tabs. Standing squarely, binoculars in the right hand, left hand pressed to the belt, jaw tight, barely contained anger.",
      "avoid_en": "no thin build, no smile, no clean new uniform, no rifle, no extra people, no text"
    },
    "peng_ch07_zunyi": {
      "id": "peng_ch07_zunyi",
      "character": "peng",
      "label": "遵义会议·三军团的家底",
      "chapters": [
        "ch07",
        "ch08",
        "ch09",
        "ch10"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被硝烟和红泥压旧，武装带刮花，袖口磨破，领章发黑；裤脚泥重。",
      "equipment_cn": "八角帽、望远镜、手枪、武装带。",
      "head": {
        "turn": "right 8deg",
        "pitch": "down 4deg",
        "gaze": "right"
      },
      "pose_cn": "身体前倾，右手握望远镜，左手撑在桌沿，肩背像压着一整条战线。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "手枪"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 36-year-old man, square face, heavy brows, protruding jaw, short stiff hair under a smoke-darkened octagonal cap. Grey-green tunic worn by powder smoke and red mud, scratched field belt, frayed cuffs, blackened collar tabs. Leaning forward, binoculars in the right hand, left hand braced on a table edge, shoulders carrying the weight of a whole front.",
      "avoid_en": "no clean uniform, no smile, no upright parade pose, no rifle, no extra people, no text"
    },
    "peng_ch17_late": {
      "id": "peng_ch17_late",
      "character": "peng",
      "label": "草地之后·清点人数",
      "chapters": [
        "ch17",
        "ch18",
        "ch19"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装更旧，肩头磨薄，武装带松了一孔，袖口破口露线，胡茬发灰；没有换新衣。",
      "equipment_cn": "八角帽、望远镜、手枪、武装带。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在路边，双手垂着，头略低，像刚数完一遍人又数了一遍。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "手枪"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout but thinner 36-year-old man, square face, heavy brows, grey stubble, protruding jaw, worn octagonal cap. Grey-green tunic worn thin at the shoulders, field belt loosened one notch, frayed cuff, the same patched tunic. Standing at the roadside with hands hanging, head slightly bowed, as if counting the survivors a second time.",
      "avoid_en": "no clean uniform, no smile, no upright heroic pose, no rifle, no extra people, no text"
    },
    "lin_ch02_start": {
      "id": "lin_ch02_start",
      "character": "lin",
      "label": "出发初期·沉默的军团长",
      "chapters": [
        "ch02",
        "ch03"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装干净整齐，绑腿扎得平直，领章褪色，帽形端正；在一路泥泞里显得克制。",
      "equipment_cn": "八角帽、望远镜、地图包；无步枪。",
      "head": {
        "turn": "left 3deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站得笔直，双手垂在身侧，望远镜挂在胸前，几乎不动。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A young lean man in his late twenties, narrower pointed jaw, thin brows, sharper younger eyes than Zhou Enlai, short black hair under a neat octagonal cap. Clean grey-green tunic, collar tabs straight, belt tight, puttees evenly bound; standing very straight, binoculars at the waist.",
      "avoid_en": "no thick eyebrows, no gaunt middle-aged face, no Zhou Enlai likeness, no extra people, no text"
    },
    "lin_ch10_loushan": {
      "id": "lin_ch10_loushan",
      "character": "lin",
      "label": "娄山关·仰攻",
      "chapters": [
        "ch10"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "灰绿军装下摆和绑腿溅泥，袖口仍整齐，领章褪色，帽檐有雨痕。",
      "equipment_cn": "八角帽、望远镜、地图包。",
      "head": {
        "turn": "right 6deg",
        "pitch": "up 3deg",
        "gaze": "up_right"
      },
      "pose_cn": "抬头看关隘石峰，右手握望远镜，肩背笔直，神情冷静。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "地图包"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin young 27-year-old man, narrow face, short black hair under a rain-stained octagonal cap, clean-shaven. Grey-green tunic splashed with mud at the hem and puttees, cuffs still orderly, faded collar tabs. Head lifted toward a stone pass, binoculars in the right hand, back straight, cold calm gaze up-right.",
      "avoid_en": "no smile, no clean boots, no rifle, no dramatic gesture, no extra people, no text"
    },
    "lin_ch18_lazikou": {
      "id": "lin_ch18_lazikou",
      "character": "lin",
      "label": "腊子口·看石壁",
      "chapters": [
        "ch18"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "none",
      "outfit_cn": "灰绿军装肩头有灰，袖口磨旧，绑腿沾黄土，领章几乎看不出颜色；帽檐压低。",
      "equipment_cn": "八角帽、望远镜、地图包。",
      "head": {
        "turn": "left 8deg",
        "pitch": "up 5deg",
        "gaze": "up_left"
      },
      "pose_cn": "仰头看右侧石壁，右手握望远镜，左手贴在地图包上，站姿仍直。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "地图包"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin young 27-year-old man, narrow face, short black hair under a low-pulled octagonal cap, clean-shaven. Grey-green tunic dusted at the shoulders, worn cuffs, puttees stained with yellow earth, collar tabs almost colourless. Looking up at a sheer cliff, binoculars in the right hand, left hand on the map case, still standing very straight.",
      "avoid_en": "no smile, no clean uniform, no rifle, no slouching, no extra people, no text"
    },
    "nie_ch02_start": {
      "id": "nie_ch02_start",
      "character": "nie",
      "label": "突破封锁线·政委",
      "chapters": [
        "ch02",
        "ch03"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装周正，左臂政委暗红臂章，领口扣好，袖口磨旧；帽形端正。",
      "equipment_cn": "八角帽、笔记本、铅笔、地图包。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站直，双手把笔记本抱在胸前，肩平，神情稳重。",
      "props_cn": [
        "八角帽",
        "笔记本",
        "铅笔",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A steady square-faced political commissar in his mid-thirties, short hair, clear narrowed eyes without glasses, octagonal cap, clean red armband and grey-green tunic, notebook in the breast pocket. Standing with a notebook open in one hand, the other at his side; deliberately distinct from the round-glasses intellectual Zhang Wentian.",
      "avoid_en": "no round glasses, no wire rims, no thin scholarly face, no extra people, no text"
    },
    "nie_ch07_zunyi": {
      "id": "nie_ch07_zunyi",
      "character": "nie",
      "label": "遵义会议·一军团同意",
      "chapters": [
        "ch07"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，政委臂章重新缝正，领口整齐，帽檐刷净；仍是旧布。",
      "equipment_cn": "八角帽、笔记本、铅笔。",
      "head": {
        "turn": "left 3deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "坐在会议桌边，双手交叠放在笔记本上，肩背平直。",
      "props_cn": [
        "八角帽",
        "笔记本",
        "铅笔"
      ],
      "faces": [
        "calm",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Normal-built 35-year-old man, square steady face, short black hair under a brushed octagonal cap, clean-shaven. Washed grey-green tunic, political-commissar armband resewn straight, neat collar, old but clean cloth. Seated at a meeting table with both hands folded on a notebook, shoulders level, composed.",
      "avoid_en": "no rifle, no bright new armband, no smile, no slouching, no extra people, no text"
    },
    "nie_ch13_yihai": {
      "id": "nie_ch13_yihai",
      "character": "nie",
      "label": "彝海·不许开枪",
      "chapters": [
        "ch13"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "灰绿军装被山路灰土压旧，政委臂章褪色，领口仍扣好，绑腿沾泥。",
      "equipment_cn": "八角帽、笔记本、地图包；枪背在身后，不端在手里。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 2deg",
        "gaze": "right"
      },
      "pose_cn": "站直，双手垂在身前，刻意不碰枪，肩背稳定。",
      "props_cn": [
        "八角帽",
        "笔记本",
        "地图包",
        "背后的枪"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Normal-built 35-year-old man, square steady face, short black hair under a dusty octagonal cap, clean-shaven. Grey-green tunic dulled by mountain dust, faded commissar armband, collar still buttoned, muddy puttees. Standing with both hands loose in front, deliberately away from the rifle slung behind him, shoulders steady and non-threatening.",
      "avoid_en": "no raised weapon, no aggressive posture, no smile, no clean uniform, no extra people, no text"
    },
    "nie_ch18_lazikou": {
      "id": "nie_ch18_lazikou",
      "character": "nie",
      "label": "腊子口·找路",
      "chapters": [
        "ch18"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被雨和黄土压旧，臂章褪成暗褐，袖口磨破，帽檐压弯，绑腿泥重。",
      "equipment_cn": "八角帽、地图包、笔记本、铅笔。",
      "head": {
        "turn": "left 7deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "伏在地图上，右手执铅笔，左手压着图角，眉头紧锁。",
      "props_cn": [
        "八角帽",
        "地图包",
        "笔记本",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Normal-built 35-year-old man, square face hollowed by fatigue, short black hair under a bent octagonal cap. Grey-green tunic worn by rain and yellow dust, armband faded to dull brown, frayed cuffs, muddy puttees. Bent over a map, pencil in the right hand, left hand holding the corner down, brow furrowed, searching for a route.",
      "avoid_en": "no clean uniform, no rifle in hand, no smile, no upright pose, no extra people, no text"
    },
    "liu_bocheng_ch02_start": {
      "id": "liu_bocheng_ch02_start",
      "character": "liu_bocheng",
      "label": "突破封锁线·总参谋长",
      "chapters": [
        "ch02",
        "ch03"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装周正，领口扣好，右眼黑色眼罩，袖口磨旧，绑腿扎紧；衣料洗得发白。",
      "equipment_cn": "军便帽、望远镜、地图包、红旗卷在臂下。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "站得挺拔，右手握望远镜，左臂夹着地图包，独眼目光稳定。",
      "props_cn": [
        "军便帽",
        "黑色眼罩",
        "望远镜",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. An upright 42-year-old man with short black hair under a soft officer cap, a black eye patch over the right eye, clean-shaven, calm single-eyed gaze. Neat faded grey-green tunic, collar buttoned, worn cuffs, tightly bound puttees. Standing tall, binoculars in the right hand, map case under the left arm, steady and unhurried.",
      "avoid_en": "no two visible eyes, no eye patch removed, no rifle, no smile, no clean new uniform, no extra people, no text"
    },
    "liu_bocheng_ch06_zunyi": {
      "id": "liu_bocheng_ch06_zunyi",
      "character": "liu_bocheng",
      "label": "乌江之前·渡江司令",
      "chapters": [
        "ch06",
        "ch07",
        "ch08",
        "ch09"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装被雨和泥压旧，领口仍扣好，右眼眼罩边缘磨白，袖口有泥点。",
      "equipment_cn": "军便帽、望远镜、地图包、铅笔。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "俯身看地图，右手执铅笔在图上画圈，左臂压住图角。",
      "props_cn": [
        "军便帽",
        "黑色眼罩",
        "望远镜",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Upright 42-year-old man, short black hair under a rain-stained officer cap, black eye patch over the right eye, clean-shaven. Grey-green tunic dulled by rain and mud, collar still buttoned, eye-patch edge worn pale, muddy cuffs. Bent over a map, pencil in the right hand drawing a circle, left arm holding the corner down, focused downward gaze.",
      "avoid_en": "no two visible eyes, no eye patch removed, no clean uniform, no rifle, no smile, no extra people, no text"
    },
    "liu_bocheng_ch12_jinsha": {
      "id": "liu_bocheng_ch12_jinsha",
      "character": "liu_bocheng",
      "label": "金沙江·九天九夜",
      "chapters": [
        "ch11",
        "ch12"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装被江风与汗水浸旧，眼罩边缘磨白，袖口卷起，裤腿湿到小腿，领口松开。",
      "equipment_cn": "军便帽、渡江名册、望远镜、地图包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在渡口，一手压着名册，一手扶帽檐，身体前倾看江面。",
      "props_cn": [
        "军便帽",
        "黑色眼罩",
        "渡江名册",
        "望远镜"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Upright 42-year-old man grown leaner, short black hair under a salt-stained officer cap, black eye patch over the right eye, clean-shaven. Grey-green tunic stiffened by river wind and sweat, eye-patch edge pale, sleeves rolled, trousers wet to mid-calf, collar open. Standing at the ferry, one hand on a crossing manifest, the other touching the cap brim, body angled toward the water.",
      "avoid_en": "no two visible eyes, no eye patch removed, no clean uniform, no rifle, no smile, no extra people, no text"
    },
    "liu_bocheng_ch13_yihai": {
      "id": "liu_bocheng_ch13_yihai",
      "character": "liu_bocheng",
      "label": "彝海结盟·银饰与旗",
      "chapters": [
        "ch13"
      ],
      "wear": 3,
      "dirt": 3,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装仍是旧布，领口扣好，右眼黑眼罩；脖子上没有额外饰物。",
      "equipment_cn": "军便帽、手枪（准备赠小叶丹）、红旗。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站直，右手拿着一支手枪，左手扶着红旗，独眼平视。",
      "props_cn": [
        "军便帽",
        "黑色眼罩",
        "手枪",
        "红旗"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Upright 42-year-old man, short black hair under an officer cap, black eye patch over the right eye, clean-shaven. Old grey-green tunic, collar buttoned and plain. Standing straight with a pistol in the right hand and a folded red flag under the left, single eye level, grave and calm.",
      "avoid_en": "no two visible eyes, no eye patch removed, no rifle, no smile, no clean new uniform, no extra people, no text"
    },
    "liu_bocheng_ch13_necklace": {
      "id": "liu_bocheng_ch13_necklace",
      "character": "liu_bocheng",
      "label": "彝海结盟·戴上银饰",
      "chapters": [],
      "wear": 3,
      "dirt": 3,
      "injury": "old_wound",
      "outfit_cn": "同一身旧灰绿军装，领口外多了一串彝族银饰，银片压在胸前；右眼黑眼罩。",
      "equipment_cn": "军便帽、彝族银饰、红旗（已赠小叶丹，手上空出）。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 2deg",
        "gaze": "forward"
      },
      "pose_cn": "站直，右手轻按胸前的银饰，左手垂着，独眼平视前方。",
      "props_cn": [
        "军便帽",
        "黑色眼罩",
        "彝族银饰"
      ],
      "faces": [
        "calm",
        "stern"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Upright 42-year-old man, short black hair under an officer cap, black eye patch over the right eye, clean-shaven. Old grey-green tunic with a Yi silver neck ornament now hanging outside the collar, silver plates resting on the chest. Standing straight, right hand lightly touching the silver, left arm loose, single eye level and grave.",
      "avoid_en": "no two visible eyes, no eye patch removed, no bare neck, no rifle, no smile, no extra people, no text"
    },
    "liu_bocheng_ch14_dadu": {
      "id": "liu_bocheng_ch14_dadu",
      "character": "liu_bocheng",
      "label": "大渡河·石达开的旧路",
      "chapters": [
        "ch14"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装被河边湿气压旧，眼罩边缘磨白，袖口有泥，领口仍扣好；银饰收在衣内。",
      "equipment_cn": "军便帽、望远镜、地图包、旧书《读史方舆纪要》。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在地图桌旁，一手压着旧书，一手指着河线，肩背挺直。",
      "props_cn": [
        "军便帽",
        "黑色眼罩",
        "望远镜",
        "旧书"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Upright 42-year-old man, short black hair under a damp officer cap, black eye patch over the right eye, clean-shaven. Grey-green tunic darkened by river damp, eye-patch edge pale, muddy cuffs, collar buttoned. Standing at a map table, one hand on an old book, the other tracing the river line, back straight, gaze down-left.",
      "avoid_en": "no two visible eyes, no eye patch removed, no rifle, no smile, no clean uniform, no extra people, no text"
    },
    "chen_yun_ch01_start": {
      "id": "chen_yun_ch01_start",
      "character": "chen_yun",
      "label": "于都出发·编制与家当",
      "chapters": [
        "ch01"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装周正，领口扣好，袖口略磨，腰带上挂着一只旧皮包；衣料洗得发白。",
      "equipment_cn": "军便帽、旧皮质公文包、账本、钢笔、编制表。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "左手提着旧皮包，右手翻开账本，头略低看数字，肩背清瘦。",
      "props_cn": [
        "军便帽",
        "旧皮质公文包",
        "账本",
        "钢笔"
      ],
      "faces": [
        "calm",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin scholarly 29-year-old man with a narrow face, short black hair under a soft officer cap, clean-shaven. Neat faded grey-green tunic, collar buttoned, slightly worn cuffs, an old leather briefcase hanging at his side. Left hand on the briefcase, right hand opening a ledger, head bent toward the figures, lean and precise.",
      "avoid_en": "no rifle, no smile, no new uniform, no round glasses, no extra people, no text"
    },
    "chen_yun_ch07_supply": {
      "id": "chen_yun_ch07_supply",
      "character": "chen_yun",
      "label": "遵义·重核家当",
      "chapters": [
        "ch07"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，领口整齐，皮包擦过但仍旧，袖口有墨迹。",
      "equipment_cn": "军便帽、旧皮质公文包、账本、钢笔、核过的编制表。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "坐在桌边，双手把账本压平，钢笔夹在指间，神情专注。",
      "props_cn": [
        "军便帽",
        "旧皮质公文包",
        "账本",
        "钢笔"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin scholarly 29-year-old man, narrow face, short black hair under a neat officer cap, clean-shaven. Washed grey-green tunic, neat collar, wiped but old leather briefcase, ink at one cuff. Seated at a table, both hands flattening a ledger, pen between his fingers, precise downward focus.",
      "avoid_en": "no rifle, no smile, no new uniform, no round glasses, no extra people, no text"
    },
    "chen_yun_ch09_reorg": {
      "id": "chen_yun_ch09_reorg",
      "character": "chen_yun",
      "label": "扎西整编·放下账本",
      "chapters": [
        "ch09"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "灰绿军装被冬雨压旧，领口仍扣好，袖口有泥，皮包边角磨白。",
      "equipment_cn": "军便帽、旧皮质公文包、整编方案、钢笔。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "站在桌边，一手按着整编方案，一手把旧印章推向桌角，肩背清瘦而直。",
      "props_cn": [
        "军便帽",
        "旧皮质公文包",
        "整编方案",
        "钢笔"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin scholarly 29-year-old man, narrow face, short black hair under a damp officer cap, clean-shaven. Grey-green tunic dulled by winter rain, collar still buttoned, muddy cuffs, briefcase corners worn pale. Standing at a table, one hand on a reorganization plan, the other pushing an old seal toward the corner, lean and straight-backed.",
      "avoid_en": "no rifle, no smile, no clean uniform, no round glasses, no extra people, no text"
    },
    "he_zizhen_ch01_start": {
      "id": "he_zizhen_ch01_start",
      "character": "he_zizhen",
      "label": "于都出发·双枪女战士",
      "chapters": [
        "ch01"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装束腰，齐肩短发不戴军帽，腰间两只手枪枪套，绑腿扎紧；衣料洗旧。",
      "equipment_cn": "双枪枪套、药包、担架边的毯子。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 2deg",
        "gaze": "left"
      },
      "pose_cn": "站在担架旁，右手自然垂在枪套上，左手扶着担架杆，肩背清瘦。",
      "props_cn": [
        "双枪枪套",
        "药包",
        "担架"
      ],
      "faces": [
        "calm",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin 24-year-old woman with shoulder-length short black hair uncovered, a narrow weathered face, dark eyes. Belted grey-green tunic, two pistol holsters at the waist, tightly bound puttees, faded cloth. Standing beside a stretcher, right hand resting near a holster, left hand on the stretcher rail, lean and watchful.",
      "avoid_en": "no military cap, no long braid, no rifle, no smile, no clean new uniform, no male face, no extra people, no text"
    },
    "he_zizhen_ch03_xiangjiang": {
      "id": "he_zizhen_ch03_xiangjiang",
      "character": "he_zizhen",
      "label": "湘江·血与三天三夜",
      "chapters": [
        "ch03"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装肩头被雨打湿，束腰布带沾泥，双枪枪套磨旧，短发被雨压在脸侧；没有新增外伤。",
      "equipment_cn": "双枪枪套、药包、染血的白手帕（替周恩来拿着）。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 4deg",
        "gaze": "down_right"
      },
      "pose_cn": "站在渡口边，右手攥着手帕，左手按着枪套，肩背绷紧，眼睛熬得发红。",
      "props_cn": [
        "双枪枪套",
        "药包",
        "染血白手帕"
      ],
      "faces": [
        "calm",
        "sad",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 24-year-old woman, shoulder-length short black hair flattened by rain, uncovered, dark tired eyes. Grey-green belted tunic soaked at the shoulders, muddy waist sash, worn twin pistol holsters, faded cloth. Standing at the ferry, a blood-flecked white handkerchief clenched in the right hand, left hand on a holster, shoulders tight, her own body unmarked by fresh wounds.",
      "avoid_en": "no military cap, no long braid, no rifle, no new wound on her, no smile, no clean uniform, no male face, no extra people, no text"
    },
    "deng_yingchao_ch03_ill": {
      "id": "deng_yingchao_ch03_ill",
      "character": "deng_yingchao",
      "label": "湘江夜渡·咳着护孩子",
      "chapters": [
        "ch03"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装外绕一条灰围巾，领口扣好，袖口磨旧，裤脚被江水打湿；衣料洗得发白。",
      "equipment_cn": "灰围巾、针线包、一只装孩子衣物的小布包。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "微微弓着背，双手把围巾按在胸前，像刚咳过，仍站在桥边看着孩子。",
      "props_cn": [
        "灰围巾",
        "针线包",
        "小布包"
      ],
      "faces": [
        "calm",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin 30-year-old woman with short curly black hair gathered low, a gentle weathered face, hair uncovered. Faded grey-green tunic with a grey scarf around the neck, collar buttoned, worn cuffs, trousers wet at the hem. Slightly stooped, both hands pressing the scarf to her chest as if just after a cough, eyes down-left toward children off frame.",
      "avoid_en": "no military cap, no long braid, no rifle, no healthy flush, no smile, no clean uniform, no male face, no extra people, no text"
    },
    "deng_yingchao_ch04_guizhou": {
      "id": "deng_yingchao_ch04_guizhou",
      "character": "deng_yingchao",
      "label": "通道之后·问路",
      "chapters": [
        "ch04"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装稍作整理，灰围巾仍是旧的，领口整齐，袖口补过；脸上仍有病后的苍白。",
      "equipment_cn": "灰围巾、针线包、小布包。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward_right"
      },
      "pose_cn": "坐在火堆边，双手放在膝上，身体略前倾，温和地看着对面的老乡。",
      "props_cn": [
        "灰围巾",
        "针线包",
        "小布包"
      ],
      "faces": [
        "calm",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 30-year-old woman, short curly black hair gathered low, gentle face still pale after illness, hair uncovered. Neatly settled faded grey-green tunic, old grey scarf, patched cuff. Seated by a fire, hands on her knees, leaning slightly toward someone off frame, calm attentive gaze forward-right.",
      "avoid_en": "no military cap, no long braid, no rifle, no healthy flush, no smile broadly, no clean new uniform, no male face, no extra people, no text"
    },
    "xu_teli_ch01_start": {
      "id": "xu_teli_ch01_start",
      "character": "xu_teli",
      "label": "于都出发·五老之一",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装外套一件长衫式罩衫，衣摆盖过胯部，袖口宽大；领口扣好，鞋是旧布鞋。",
      "equipment_cn": "圆框眼镜、木棍、马灯（夜里）、旧布包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "身体明显驼背，右手拄木棍，左手提着布包，头略低，步子慢但稳。",
      "props_cn": [
        "圆框眼镜",
        "木棍",
        "马灯",
        "旧布包"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin 57-year-old man with white hair, round wire-rimmed glasses, sparse white stubble, deep stoop, weathered gentle face. Grey-green tunic under a long scholar-gown overshirt with a wide hem and loose cuffs, old cloth shoes. Right hand on a wooden staff, left hand carrying a cloth bag, head slightly down, slow but steady.",
      "avoid_en": "no black hair, no military cap, no rifle, no upright young posture, no smile broadly, no clean new gown, no extra people, no text"
    },
    "xu_teli_ch06_houchang": {
      "id": "xu_teli_ch06_houchang",
      "character": "xu_teli",
      "label": "猴场·墙上的字",
      "chapters": [
        "ch06"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "old_wound",
      "outfit_cn": "长衫罩衫洗过，袖口和手上沾着白石灰，衣摆仍有旧褶；领口整齐。",
      "equipment_cn": "圆框眼镜、木棍、石灰刷、旧布包。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "微微弯腰看墙根，右手拿刷子，左手扶膝，驼背明显。",
      "props_cn": [
        "圆框眼镜",
        "木棍",
        "石灰刷",
        "旧布包"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 57-year-old man, white hair, round wire-rimmed glasses, sparse white stubble, pronounced stoop. Washed long scholar-gown overshirt over a grey-green tunic, white lime on the cuffs and hands, old creases at the hem. Bent toward a wall, lime brush in the right hand, left hand on one knee, kindly and focused.",
      "avoid_en": "no military cap, no rifle, no black hair, no upright posture, no clean hands, no extra people, no text"
    },
    "xu_teli_ch16_snow": {
      "id": "xu_teli_ch16_snow",
      "character": "xu_teli",
      "label": "夹金山·把绑腿给别人",
      "chapters": [
        "ch16"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "灰绿军装外的长衫罩衫被风雪打硬，衣摆结霜，裤脚仍扎着绑腿；白须结霜。",
      "equipment_cn": "圆框眼镜、木棍、旧布包、绑腿；无马。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "拄木棍站在雪里，身体前倾，绑腿仍扎着，仍不肯抓别人的背包带。",
      "props_cn": [
        "圆框眼镜",
        "木棍",
        "旧布包",
        "绑腿"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 57-year-old man, white hair and beard crusted with frost, round wire-rimmed glasses fogged at the edge, deep stoop. Grey-green tunic under a stiff frozen scholar-gown overshirt, hem frosted, puttees still bound at the ankles. Standing on snow with a wooden staff, body leaning forward, refusing to hold anyone else’s pack strap.",
      "avoid_en": "no military cap, no horse, no rifle, no upright posture, no smile, no warm coat, no extra people, no text"
    },
    "xu_teli_ch16_bare_legs": {
      "id": "xu_teli_ch16_bare_legs",
      "character": "xu_teli",
      "label": "夹金山·绑腿给了冻伤的人",
      "chapters": [],
      "wear": 4,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "同一身结霜长衫罩衫，绑腿已经解下，裤脚松着，雪灌进鞋口；白须结霜。",
      "equipment_cn": "圆框眼镜、木棍、旧布包；绑腿已不在。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "拄木棍站在雪里，裤脚被风吹开，身体前倾，仍自己走。",
      "props_cn": [
        "圆框眼镜",
        "木棍",
        "旧布包"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 57-year-old man, white hair and beard frosted, round wire-rimmed glasses, deep stoop. Frozen scholar-gown overshirt over grey-green tunic, hem crusted with ice, trousers loose at the ankles, snow gathering at the shoe tops. Standing with a wooden staff, body leaning into the wind, still walking on his own.",
      "avoid_en": "no puttees, no military cap, no horse, no rifle, no upright posture, no warm coat, no extra people, no text"
    },
    "xu_teli_ch19_wuqi": {
      "id": "xu_teli_ch19_wuqi",
      "character": "xu_teli",
      "label": "哈达铺·黑板上的陕北",
      "chapters": [
        "ch19"
      ],
      "wear": 4,
      "dirt": 2,
      "injury": "old_wound",
      "outfit_cn": "长衫罩衫洗净，袖口有粉笔灰，衣摆仍旧；领口整齐，白须修过。",
      "equipment_cn": "圆框眼镜、木棍、半截粉笔、旧布包。",
      "head": {
        "turn": "right 3deg",
        "pitch": "up 2deg",
        "gaze": "forward"
      },
      "pose_cn": "站在黑板前，右手拿粉笔，左手扶木棍，头微抬，神情舒展。",
      "props_cn": [
        "圆框眼镜",
        "木棍",
        "半截粉笔",
        "旧布包"
      ],
      "faces": [
        "calm",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 57-year-old man, white hair and trimmed white beard, round wire-rimmed glasses, deep stoop. Washed long scholar-gown overshirt over faded grey-green tunic, chalk dust at the cuffs, old hem. Standing before a blackboard, chalk in the right hand, left hand on a wooden staff, head slightly lifted, quietly pleased.",
      "avoid_en": "no military cap, no rifle, no black hair, no upright young posture, no broad grin, no clean new gown, no extra people, no text"
    },
    "dong_biwu_ch01_start": {
      "id": "dong_biwu_ch01_start",
      "character": "dong_biwu",
      "label": "于都出发·温和老者",
      "chapters": [
        "ch01"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，领口扣好，袖口磨旧，衣摆平整；没有长衫罩袍。",
      "equipment_cn": "旧布包、书、卷宗。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "站着，双手捧着一本书，头略低，肩背微弯，神态温和。",
      "props_cn": [
        "书",
        "卷宗",
        "旧布包"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A gently weathered 48-year-old man with short grey-white hair, a thin kind face, clean-shaven, head bare. Clean faded grey-green tunic, collar buttoned, worn cuffs, plain hem. Standing with a book held in both hands, head slightly bowed toward the page, mild and unhurried.",
      "avoid_en": "no military cap, no rifle, no long white beard, no glasses, no smile broadly, no new uniform, no extra people, no text"
    },
    "lin_boqu_ch01_start": {
      "id": "lin_boqu_ch01_start",
      "character": "lin_boqu",
      "label": "于都出发·管粮的人",
      "chapters": [
        "ch01"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗旧，领口扣好，袖口磨薄，腰间挂着一只旧布粮袋；眼镜腿用线绑过。",
      "equipment_cn": "眼镜、粮袋、账本、算盘、铅笔。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "站着，左手压着粮袋口，右手翻账本，头低着算数，肩背微驼。",
      "props_cn": [
        "眼镜",
        "粮袋",
        "账本",
        "算盘"
      ],
      "faces": [
        "calm",
        "stern",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A weathered 48-year-old man with short grey-white hair, wire-rimmed glasses with one leg tied by thread, a thin worried face, clean-shaven. Faded grey-green tunic, worn cuffs, an old cloth grain sack hanging at his side. Left hand holding the sack mouth, right hand turning a ledger, head bent over the figures, slight stoop.",
      "avoid_en": "no military cap, no rifle, no long beard, no smile, no clean new uniform, no extra people, no text"
    },
    "lin_boqu_ch09_supply": {
      "id": "lin_boqu_ch09_supply",
      "character": "lin_boqu",
      "label": "扎西整编·账本与草鞋",
      "chapters": [
        "ch09"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被冬雨压旧，粮袋瘪了一半，袖口有泥，眼镜片上有一层水汽。",
      "equipment_cn": "眼镜、半袋粮、账本、钢笔、草鞋登记册。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在桌边，一手按账本，一手把草鞋登记册推到面前，眉头紧锁。",
      "props_cn": [
        "眼镜",
        "半袋粮",
        "账本",
        "草鞋登记册"
      ],
      "faces": [
        "calm",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Weathered 48-year-old man, short grey-white hair, misted wire-rimmed glasses, thin worried face. Grey-green tunic dulled by winter rain, grain sack half empty at his side, muddy cuffs. Standing at a table, one hand on a ledger, the other pulling a straw-sandal registry closer, brow tight over the numbers.",
      "avoid_en": "no military cap, no rifle, no smile, no clean uniform, no full grain sack, no extra people, no text"
    },
    "lin_boqu_ch12_jinsha": {
      "id": "lin_boqu_ch12_jinsha",
      "character": "lin_boqu",
      "label": "金沙江·钱不够了",
      "chapters": [
        "ch12"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被江风与汗压旧，粮袋几乎空了，袖口磨破，领口松开，眼镜片上全是水汽。",
      "equipment_cn": "眼镜、空粮袋、账本、铅笔、钱袋。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "站在渡口边，一手提空粮袋，一手翻钱袋，肩背塌着，像在算最后一笔账。",
      "props_cn": [
        "眼镜",
        "空粮袋",
        "账本",
        "钱袋"
      ],
      "faces": [
        "calm",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Weathered 48-year-old man, short grey-white hair, fogged wire-rimmed glasses, hollow cheeks. Grey-green tunic stiffened by river wind and sweat, grain sack hanging empty, frayed cuffs, collar open. Standing at the ferry, one hand holding the empty sack, the other turning a small money pouch, shoulders sagging over the last accounts.",
      "avoid_en": "no military cap, no rifle, no smile, no full grain sack, no clean uniform, no extra people, no text"
    },
    "lin_boqu_ch16_late": {
      "id": "lin_boqu_ch16_late",
      "character": "lin_boqu",
      "label": "雪山草地·四两米",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "灰绿军装单薄结霜，粮袋瘪得贴在身上，袖口冻硬，领口扣紧；没有棉衣。",
      "equipment_cn": "结霜的眼镜、空粮袋、账本、铅笔。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "缩着肩，双手把空粮袋按在胸前，头低着，眼镜上结着霜。",
      "props_cn": [
        "结霜的眼镜",
        "空粮袋",
        "账本",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Weathered 48-year-old man, short grey-white hair frosted, wire-rimmed glasses rimmed with ice, hollow face. Thin grey-green tunic crusted at the shoulders, empty grain sack pressed flat against his body, stiff cuffs, a single layer of cloth. Hunched with both hands on the empty sack, head bowed, breath visible in the cold.",
      "avoid_en": "no padded coat, no full grain sack, no military cap, no rifle, no smile, no warm colour, no extra people, no text"
    },
    "lin_boqu_ch17_grassland": {
      "id": "lin_boqu_ch17_grassland",
      "character": "lin_boqu",
      "label": "草地·空粮袋与账本",
      "chapters": [
        "ch17"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "旧军装、空粮袋、油布包账本，衣摆泥水；没有雪。",
      "equipment_cn": "结霜的眼镜、空粮袋、账本、铅笔。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "缩着肩，双手把空粮袋按在胸前，头低着，眼镜上结着霜。",
      "props_cn": [
        "结霜的眼镜",
        "空粮袋",
        "账本",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same elderly quartermaster, short grey hair, glasses, faded grey-green tunic. The grain sack is empty and folded over one shoulder, the ledger wrapped in oilcloth and held against the chest, abacus at the belt. Cold mud at the hem, no snow and no frost, shoulders bent with hunger and exhaustion.",
      "avoid_en": "no snow, no frost, no full grain sack, no padded coat, no clean uniform, no extra people, no text"
    },
    "xie_juezai_ch01_start": {
      "id": "xie_juezai_ch01_start",
      "character": "xie_juezai",
      "label": "于都出发·日记",
      "chapters": [
        "ch01",
        "ch02",
        "ch03",
        "ch04",
        "ch05"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装洗旧，领口扣好，袖口磨薄，衣摆有路尘；全白须发，长须垂到胸前。",
      "equipment_cn": "拐棍、日记本、铅笔、小布包。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 4deg",
        "gaze": "down_right"
      },
      "pose_cn": "右手拄拐棍，左手把日记本抱在胸前，身体略驼，神情温和。",
      "props_cn": [
        "拐棍",
        "日记本",
        "铅笔",
        "小布包"
      ],
      "faces": [
        "calm",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 50-year-old man with all-white hair and a long white beard, a weathered gentle face, clean-shaven upper lip, head bare. Faded grey-green tunic, collar buttoned, worn cuffs, road dust at the hem. Right hand on a wooden cane, left arm holding a diary against the chest, slight stoop, calm gaze down-right.",
      "avoid_en": "no black hair, no military cap, no rifle, no clean new uniform, no broad smile, no extra people, no text"
    },
    "xie_juezai_ch06_houchang": {
      "id": "xie_juezai_ch06_houchang",
      "character": "xie_juezai",
      "label": "猴场·分粮与记录",
      "chapters": [
        "ch06"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，白须梳理过，袖口沾着一点仓谷灰，衣摆整齐。",
      "equipment_cn": "拐棍、日记本、铅笔、木牌。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在谷担旁，一手拄拐棍，一手在木牌上写字，身体微弯。",
      "props_cn": [
        "拐棍",
        "日记本",
        "铅笔",
        "木牌"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 50-year-old man with all-white hair and long white beard, combed, weathered kind face, head bare. Washed grey-green tunic, a little grain dust at the cuffs, neat hem. Standing beside grain baskets, one hand on a cane, the other writing on a wooden tag, body slightly bent, patient and exact.",
      "avoid_en": "no black hair, no military cap, no rifle, no smile broadly, no new uniform, no extra people, no text"
    },
    "xie_juezai_ch16_snow": {
      "id": "xie_juezai_ch16_snow",
      "character": "xie_juezai",
      "label": "雪山腊子口·姓名待查",
      "chapters": [
        "ch16"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "薄灰绿军装领口，外面一件薄旧长衫，衣摆被风撕开，无毛边；白须结霜，日记用油布包着。",
      "equipment_cn": "拐棍、冻硬的日记本、铅笔；无枪。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "拄拐棍站在雪里，另一只手把日记本按在胸前，白须低垂，身体前倾。",
      "props_cn": [
        "拐棍",
        "日记本",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Elderly man around fifty, full white beard and white hair, round glasses. Thin grey-green military collar visible under a thin torn scholar gown, wind-slashed hem, no fur cuffs and no padded robe. Frost on the white beard, shoulders and brows; a diary wrapped in oilcloth held against the chest, wooden staff in the other hand.",
      "avoid_en": "no fur, no thick gown, no padded coat, no clean diary, no warm room, no extra people, no text"
    },
    "xie_juezai_ch17_18_coldwet": {
      "id": "xie_juezai_ch17_18_coldwet",
      "character": "xie_juezai",
      "label": "草地与腊子口·冷湿薄长衫",
      "chapters": [
        "ch17",
        "ch18"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "薄灰绿军装领口，外面套一件被雨打湿的薄旧长衫，衣摆有风撕口；白须湿冷，无毛边。",
      "equipment_cn": "拐棍、冻硬的日记本、铅笔；无枪。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "拄拐棍站在雪里，另一只手把日记本按在胸前，白须低垂，身体前倾。",
      "props_cn": [
        "拐棍",
        "日记本",
        "铅笔"
      ],
      "faces": [
        "calm",
        "stern",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Elderly man around fifty, full white beard and white hair wet with cold rain, round glasses. Thin grey-green military collar under a thin torn scholar gown, wind-slashed hem, no fur and no padding. He holds an oilcloth-wrapped diary against the chest and a wooden staff; no snow and no frost.",
      "avoid_en": "no snow, no frost, no fur, no thick gown, no clean diary, no padded coat, no extra people, no text"
    },
    "ye_jianying_ch03_early": {
      "id": "ye_jianying_ch03_early",
      "character": "ye_jianying",
      "label": "湘江之后·断了的电报",
      "chapters": [
        "ch03",
        "ch04"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被冬雨压旧，参谋臂章褪色，领口扣好，袖口有墨迹；帽形端正。",
      "equipment_cn": "军便帽、电报稿、铅笔、地图包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "站着，双手拿着一封电报，肩背略沉，眼神疲惫但锐利。",
      "props_cn": [
        "军便帽",
        "电报稿",
        "铅笔",
        "地图包"
      ],
      "faces": [
        "calm",
        "stern",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A lean 37-year-old man with a sharp face, short black hair under a neat officer cap, clean-shaven. Grey-green tunic dulled by winter rain, faded staff armband, collar buttoned, ink at one cuff. Standing with a telegram in both hands, shoulders slightly lowered, tired but sharp gaze down-left.",
      "avoid_en": "no rifle, no smile, no clean uniform, no bright armband, no extra people, no text"
    },
    "ye_jianying_ch11_chishui": {
      "id": "ye_jianying_ch11_chishui",
      "character": "ye_jianying",
      "label": "赤水·译电与假番号",
      "chapters": [
        "ch11",
        "ch15"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被雨和泥压旧，参谋臂章磨白，袖口卷起，领口松开一颗扣；帽檐有雨痕。",
      "equipment_cn": "军便帽、电报稿、铅笔、地图包、译电纸。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "伏在桌前译电，右手执铅笔，左手压着电报，肩背前倾，嘴角有一点笑意。",
      "props_cn": [
        "军便帽",
        "电报稿",
        "铅笔",
        "译电纸"
      ],
      "faces": [
        "calm",
        "stern",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean 37-year-old man, sharp face, short black hair under a rain-stained officer cap. Grey-green tunic worn by rain and mud, staff armband faded pale, sleeves rolled, collar open at one button. Bent over a table decoding a telegram, pencil in the right hand, left hand holding the paper down, a faint satisfied curl at the corner of the mouth.",
      "avoid_en": "no rifle, no broad smile, no clean uniform, no bright armband, no extra people, no text"
    },
    "ye_jianying_ch17_late": {
      "id": "ye_jianying_ch17_late",
      "character": "ye_jianying",
      "label": "草地之后·纸上的事",
      "chapters": [
        "ch17"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装更旧，肩头磨薄，参谋臂章几乎看不出颜色，袖口破口，帽檐压弯。",
      "equipment_cn": "军便帽、电报稿、铅笔、地图包。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "抱着电报快步走，头略低，肩背收紧，像被纸上的事压着。",
      "props_cn": [
        "军便帽",
        "电报稿",
        "铅笔",
        "地图包"
      ],
      "faces": [
        "calm",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Lean 37-year-old man grown gaunter, sharp face, short black hair under a bent officer cap. Grey-green tunic worn thin at the shoulders, staff armband almost colourless, frayed cuffs. Walking with a telegram held against his chest, head slightly down, shoulders tight, as if carrying news too heavy for paper.",
      "avoid_en": "no rifle, no smile, no clean uniform, no bright armband, no extra people, no text"
    },
    "zhang_guotao_ch17_maogong": {
      "id": "zhang_guotao_ch17_maogong",
      "character": "zhang_guotao",
      "label": "懋功·讲究的呢军装",
      "chapters": [
        "ch17"
      ],
      "wear": 0,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "深灰呢军装，质料明显好于一方面军，领口扣严，袖线挺括；军便帽端正，腰间挂怀表。",
      "equipment_cn": "军便帽、怀表、手枪、皮包。",
      "head": {
        "turn": "right 5deg",
        "pitch": "up 3deg",
        "gaze": "forward_right"
      },
      "pose_cn": "站得直，体胖肩宽，右手按着怀表链，下巴略抬，神情强势。",
      "props_cn": [
        "军便帽",
        "怀表",
        "手枪",
        "皮包"
      ],
      "faces": [
        "calm",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A stout 37-year-old man with a wide face, thick jaw, short black hair under a neat officer cap, clean-shaven. Better-quality dark grey wool tunic, collar buttoned, crisp sleeves, pocket watch chain at the belt, pistol holster. Standing broad and straight, right hand on the watch chain, chin slightly lifted, forceful expression.",
      "avoid_en": "no thin build, no ragged uniform, no smile, no rifle, no extra people, no text"
    },
    "zhang_guotao_ch20_huining": {
      "id": "zhang_guotao_ch20_huining",
      "character": "zhang_guotao",
      "label": "会宁·瘦了，衣服仍整齐",
      "chapters": [
        "ch20"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "exhausted",
      "outfit_cn": "深灰呢军装仍整齐，肩线比一年前松，脸瘦了一圈；领口扣好，怀表还在。",
      "equipment_cn": "军便帽、怀表、皮包；无手枪。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在院子角落，双手垂着，肩背不再挺得那么满，头略低。",
      "props_cn": [
        "军便帽",
        "怀表",
        "皮包"
      ],
      "faces": [
        "calm",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 37-year-old man still broad but visibly thinner, wide face narrowed, thick jaw, short black hair under a neat officer cap. Dark grey wool tunic still orderly but looser at the shoulders, collar buttoned, pocket watch at the belt, hands empty. Standing in a courtyard corner with hands hanging, shoulders softened, head slightly lowered.",
      "avoid_en": "no pistol, no smile, no ragged uniform, no thin youthful face, no extra people, no text"
    },
    "xu_xiangqian_ch17_maogong": {
      "id": "xu_xiangqian_ch17_maogong",
      "character": "xu_xiangqian",
      "label": "懋功会师·宽厚",
      "chapters": [
        "ch17"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装厚实，领口扣好，八角帽上有红四方面军标识（与一方面军略有区别），袖口磨旧。",
      "equipment_cn": "八角帽、望远镜、旧布包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 2deg",
        "gaze": "left"
      },
      "pose_cn": "站得宽厚敦实，双手垂在身前，头略低，神情难过而克制。",
      "props_cn": [
        "八角帽",
        "望远镜",
        "旧布包"
      ],
      "faces": [
        "calm",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A broad honest-faced man in his early thirties, stout build, short hair. A distinct Fourth Front Army red cap badge and collar mark, grey-green tunic, leather belt, binoculars at the chest, hands relaxed. The Fourth Front Army insignia must be readable and different from a First Front Army officer.",
      "avoid_en": "no plain cap, no First Front Army-only collar tabs, no thin build, no extra people, no text"
    },
    "li_xiannian_ch17_maogong": {
      "id": "li_xiannian_ch17_maogong",
      "character": "li_xiannian",
      "label": "懋功·送来的新草鞋",
      "chapters": [
        "ch17"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装洗旧但整齐，领口扣好，袖口磨薄；八角帽端正，绑腿扎紧。",
      "equipment_cn": "八角帽、步枪、一串新麻绳草鞋。",
      "head": {
        "turn": "right 6deg",
        "pitch": "level",
        "gaze": "right"
      },
      "pose_cn": "站着，右手提着一串新草鞋递出去，左手扶枪带，下颌线硬，神情爽利。",
      "props_cn": [
        "八角帽",
        "步枪",
        "新草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin, hard-jawed 25-year-old man with short black hair under a neat octagonal cap, clean-shaven, clear direct eyes. Faded but orderly grey-green tunic, worn cuffs, tightly bound puttees. Standing with a bundle of new hemp-rope straw sandals held out in the right hand, left hand on a rifle strap, open and energetic.",
      "avoid_en": "no smile broadly, no ragged uniform, no clean new tunic, no extra people, no text"
    },
    "xiao_yedan_ch13_yihai": {
      "id": "xiao_yedan_ch13_yihai",
      "character": "xiao_yedan",
      "label": "彝海·黑帕银饰",
      "chapters": [
        "ch13"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "深蓝黑查尔瓦披毡，黑布缠头，颈间银项圈与银饰，腰间佩刀；衣料厚实，边缘有山路灰。",
      "equipment_cn": "黑布头帕、银项圈、彝族佩刀、披毡。",
      "head": {
        "turn": "left 6deg",
        "pitch": "up 2deg",
        "gaze": "forward_left"
      },
      "pose_cn": "站得短而宽，右手按刀柄，左手自然垂着，头略抬，目光直接。",
      "props_cn": [
        "黑布头帕",
        "银项圈",
        "彝族佩刀",
        "查尔瓦披毡"
      ],
      "faces": [
        "calm",
        "stern",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A short, broad Yi man in his thirties with a weathered face, black cloth turban wrapped around the head, silver neck ring and silver ornaments, dark eyes. Heavy dark indigo felt cloak, mountain dust at the edges, a Yi sword at the waist. Standing with the right hand on the sword hilt, left arm loose, chin slightly lifted, direct gaze forward-left.",
      "avoid_en": "no Han military uniform, no octagonal cap, no rifle, no smile broadly, no clean new cloak, no extra people, no text"
    },
    "xiao_yedan_ch13_oath": {
      "id": "xiao_yedan_ch13_oath",
      "character": "xiao_yedan",
      "label": "歃血之后·银饰已赠",
      "chapters": [],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "同一身深蓝黑查尔瓦披毡与黑布头帕，颈间银项圈已解下，领口空着；腰间佩刀仍在。",
      "equipment_cn": "黑布头帕、彝族佩刀、查尔瓦披毡、卷起的红旗。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 2deg",
        "gaze": "forward"
      },
      "pose_cn": "站直，右手把红旗卷抱在胸前，左手垂着，脖子上的银饰已经不见。",
      "props_cn": [
        "黑布头帕",
        "彝族佩刀",
        "红旗"
      ],
      "faces": [
        "calm",
        "stern",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Short broad Yi man in his thirties, weathered face, black cloth turban, dark indigo felt cloak, a Yi sword at the waist. The silver neck ring and neck ornaments are gone, leaving the collar bare. Standing straight with a rolled red flag held against the chest in the right hand, left arm loose, steady forward gaze.",
      "avoid_en": "no silver necklace, no silver neck ring, no Han uniform, no rifle, no smile, no extra people, no text"
    },
    "xiaoman_ch01_departure": {
      "id": "xiaoman_ch01_departure",
      "character": "xiaoman",
      "label": "于都出发·吹不响的号",
      "chapters": [
        "ch01"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "不合身的灰蓝军装，肩线偏宽、袖子偏长，领章褪色；八角帽大一号，帽檐压到眉；绑腿松，草鞋新编。",
      "equipment_cn": "黄铜军号斜挎在身侧，旧帆布号带，小挎包，贴身口袋里有一枚铜顶针。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 2deg",
        "gaze": "forward_left"
      },
      "pose_cn": "站直，肩略收，右手扶着号带，左手自然垂着，脸上是想吹又不敢吹的拘谨。",
      "props_cn": [
        "黄铜军号",
        "旧帆布号带",
        "小挎包",
        "铜顶针"
      ],
      "faces": [
        "calm",
        "sad",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A fifteen-year-old Chinese bugler with Sanwa-like child proportions: small and slightly undernourished, large head relative to the body, narrow shoulders, round soft cheeks and a soft rounded chin with a gently curved jawline rather than a pointed V-shaped jaw, large clear eyes, and two clearly separate thin natural eyebrows with a clean gap at the bridge of the nose. No unibrow, no heavy inward-slanting angry eyebrows. An oversized faded blue-grey tunic with drooping shoulder seams and sleeves covering half the hands, dull red collar tabs, an octagonal cap one size too large with the brim pressed to the eyebrows, loose puttees and new straw sandals. Brass bugle on an olive canvas strap at his side, small satchel, one neat sleeve patch; posture upright but hesitant.",
      "avoid_en": "no pointed chin, no sharp V-shaped jaw, no unibrow, no joined eyebrows, no heavy angry eyebrows, no adult proportions, no fitted uniform, no small cap, no rifle, no extra people, no text"
    },
    "xiaoman_ch02_rain": {
      "id": "xiaoman_ch02_rain",
      "character": "xiaoman",
      "label": "雨里行军·第三双草鞋",
      "chapters": [
        "ch02"
      ],
      "wear": 1,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰蓝军装被雨打湿，下摆和绑腿溅泥，袖口仍长；八角帽檐滴水，草鞋磨薄但还完整。",
      "equipment_cn": "黄铜军号斜挎，旧帆布号带，小挎包；背包上挂着备用草鞋。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 4deg",
        "gaze": "down_right"
      },
      "pose_cn": "站在泥路边，肩膀被雨压得略塌，右手扶号，左手把帽檐往下拉。",
      "props_cn": [
        "黄铜军号",
        "旧帆布号带",
        "小挎包",
        "备用草鞋"
      ],
      "faces": [
        "calm",
        "worry",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under an oversized octagonal cap dripping rain. Oversized blue-grey tunic wet through, muddy hem and puttees, sleeves still too long. Standing at a muddy road edge, shoulders pressed down by rain, right hand on a brass bugle, left hand pulling the cap brim lower, tired but steady.",
      "avoid_en": "no dry uniform, no adult proportions, no clean shoes, no rifle, no smile, no extra people, no text"
    },
    "xiaoman_ch03_xiangjiang": {
      "id": "xiaoman_ch03_xiangjiang",
      "character": "xiaoman",
      "label": "湘江·江边捡到绑腿",
      "chapters": [
        "ch03"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰蓝军装下摆被江水浸深，泥到绑腿，袖口湿硬，帽檐被雨压平；右臂尚未缠布条。",
      "equipment_cn": "黄铜军号斜挎，旧帆布号带，背包里十双草鞋只剩一双穿过，手里攥着一条沾泥绑腿。",
      "head": {
        "turn": "left 6deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在江边石头上，右手攥着一条绑腿，左手压着号，肩背垮下来，嘴唇紧抿。",
      "props_cn": [
        "黄铜军号",
        "沾泥绑腿",
        "十双草鞋",
        "小挎包"
      ],
      "faces": [
        "calm",
        "sad",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under a flattened wet octagonal cap. Oversized blue-grey tunic soaked dark at the hem, mud up the puttees, stiff wet cuffs, right sleeve uncovered by cloth. Standing on a river stone, a mud-stained puttee clenched in the right hand, left hand pressing the brass bugle, shoulders collapsed, lips tight.",
      "avoid_en": "no right-arm binding yet, no clean uniform, no rifle, no smile, no extra people, no visible gore, no text"
    },
    "xiaoman_ch03_binding": {
      "id": "xiaoman_ch03_binding",
      "character": "xiaoman",
      "label": "湘江之后·右臂缠绑腿",
      "chapters": [],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "同一身湿透的灰蓝军装，右臂上多了一圈缠得很紧的旧绑腿，布结打得难看；袖口仍在布条下。",
      "equipment_cn": "黄铜军号斜挎，旧帆布号带，右臂旧绑腿，背包底层收着其余草鞋。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 8deg",
        "gaze": "down"
      },
      "pose_cn": "站直一点，右手按住右臂上的布结，左手托着号，头低着。",
      "props_cn": [
        "黄铜军号",
        "右臂旧绑腿",
        "十双草鞋",
        "小挎包"
      ],
      "faces": [
        "calm",
        "sad",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under a wet flattened octagonal cap. Oversized blue-grey tunic still soaked and muddy, a narrow old puttee wrapped tightly around the right upper arm, its knot clumsy and dark. Right hand pressing the cloth knot, left hand supporting the brass bugle, head bowed, jaw set against grief.",
      "avoid_en": "no bare right arm, no clean uniform, no rifle, no tears, no extra people, no text"
    },
    "xiaoman_ch04_walk": {
      "id": "xiaoman_ch04_walk",
      "character": "xiaoman",
      "label": "通道黎平·臂上的布条",
      "chapters": [
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰蓝军装泥点干了，袖口和衣摆发硬，右臂仍缠着那条旧绑腿，帽檐压得更低。",
      "equipment_cn": "黄铜军号斜挎，右臂旧绑腿，小挎包；轻装后背包变薄。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在湿泥路边，右手扶着号带，左手把背包带往上提，肩背比湘江时直了一点。",
      "props_cn": [
        "黄铜军号",
        "右臂旧绑腿",
        "变薄的背包"
      ],
      "faces": [
        "calm",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under an oversized cap pulled low. Oversized blue-grey tunic with dried mud at the hem, stiff cuffs, the same old puttee still wrapped around the right upper arm. Standing at a wet road edge, right hand on the bugle strap, left hand hitching up a thinner pack, shoulders a little straighter.",
      "avoid_en": "no clean uniform, no bare right arm, no rifle, no smile, no extra people, no text"
    },
    "xiaoman_ch06_supply": {
      "id": "xiaoman_ch06_supply",
      "character": "xiaoman",
      "label": "猴场遵义·洗整与补给",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰蓝军装洗过、补过，右袖补丁压住原来的旧布条，绑腿重新扎紧，草鞋换过；帽子仍大。",
      "equipment_cn": "黄铜军号擦亮，旧帆布号带，小挎包，贴身口袋里的铜顶针和家信。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward_right"
      },
      "pose_cn": "坐在火边，双手把号横在膝上擦，肩背放松，脸终于有点少年气。",
      "props_cn": [
        "黄铜军号",
        "旧帆布号带",
        "小挎包",
        "铜顶针",
        "家信"
      ],
      "faces": [
        "calm",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under an oversized octagonal cap. Washed and patched blue-grey tunic, a neat patch over the right sleeve, puttees rebound, newer straw sandals. Seated by a fire, both hands wiping the brass bugle across his knees, shoulders relaxed, a little boyish ease returning.",
      "avoid_en": "no oversized dirty sleeves, no rifle, no broad grin, no new fitted uniform, no extra people, no text"
    },
    "xiaoman_ch08_chishui": {
      "id": "xiaoman_ch08_chishui",
      "character": "xiaoman",
      "label": "赤水四渡·红泥与号",
      "chapters": [
        "ch08",
        "ch09",
        "ch10",
        "ch11"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰蓝军装明显褪色，右袖补丁还在，下摆和绑腿全是红泥，草鞋湿了又干，帽檐磨毛。",
      "equipment_cn": "黄铜军号（号管上开始刻河数），旧帆布号带，小挎包，石柱留下的布包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "forward_left"
      },
      "pose_cn": "站定，右手提号，左手按住胸前的布包，肩背薄了，眼神比出发时硬。",
      "props_cn": [
        "黄铜军号",
        "旧帆布号带",
        "石柱的布包",
        "小挎包"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under a worn oversized cap. Faded blue-grey tunic with a kept patch on the right sleeve, red mud across the hem and puttees, straw sandals dried stiff. Standing with the brass bugle in the right hand, left hand pressing a small cloth bundle at the chest, thinner and harder-eyed than at departure.",
      "avoid_en": "no clean uniform, no rifle, no smile, no new cap, no extra people, no text"
    },
    "xiaoman_ch12_longmarch": {
      "id": "xiaoman_ch12_longmarch",
      "character": "xiaoman",
      "label": "金沙江到泸定·草鞋与血泡",
      "chapters": [
        "ch12",
        "ch13",
        "ch14",
        "ch15"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰蓝军装褪成灰白，袖口磨破，右袖补丁开线，绑腿松了又扎，草鞋只剩一只完整、一只补过。",
      "equipment_cn": "黄铜军号，旧帆布号带，石柱的布包，郭大娘的铜顶针（ch14 暂交三娃）。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "走路后站定，右手扶号，左手按着胸口口袋，肩背前倾，脚上明显吃痛。",
      "props_cn": [
        "黄铜军号",
        "石柱的布包",
        "铜顶针",
        "补过的草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under a faded oversized cap. Blue-grey tunic faded to grey, frayed cuffs, the right sleeve patch coming loose, puttees retied, one intact straw sandal and one repaired with cord. Standing after a march, right hand on the bugle, left hand over a breast pocket, shoulders forward, pain visible around the eyes.",
      "avoid_en": "no clean uniform, no rifle, no smile, no new shoes, no extra people, no text"
    },
    "xiaoman_ch16_snow": {
      "id": "xiaoman_ch16_snow",
      "character": "xiaoman",
      "label": "夹金山·号冻住了",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "单薄灰蓝军装，袖口和衣摆结霜，草鞋外缠着布条和稻草，帽檐压到眉，睫毛结冰；没有棉衣。",
      "equipment_cn": "黄铜军号贴胸揣着，旧帆布号带，石柱的布包，空挎包。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 5deg",
        "gaze": "down"
      },
      "pose_cn": "缩着肩，双手把号按在胸口，身体顶风前倾，嘴唇冻得发白。",
      "props_cn": [
        "黄铜军号",
        "缠布条的草鞋",
        "石柱的布包",
        "结霜的八角帽"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under an oversized cap crusted with frost, eyelashes icy. Thin blue-grey tunic frosted at the cuffs and hem, a single layer of cloth, straw sandals wrapped in cloth strips and straw. Hunched, both hands pressing the brass bugle to his chest, body leaning into the wind, lips pale.",
      "avoid_en": "no padded coat, no fur hat, no warm colour, no rifle, no smile, no clean cloth, no extra people, no text"
    },
    "xiaoman_ch17_grassland": {
      "id": "xiaoman_ch17_grassland",
      "character": "xiaoman",
      "label": "草地·李班长还在",
      "chapters": [
        "ch17"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "过大旧军装被泥水浸透，草绳腰带，脸颊凹陷、嘴唇裂开；没有雪，也还没有接手铜锅。",
      "equipment_cn": "黄铜军号，旧帆布号带，石柱的布包，空挎包。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "站在泥水里，右手扶号，左手按着胸前的布包，肩背瘦得突出，身体微微前倾。",
      "props_cn": [
        "黄铜军号",
        "石柱的布包",
        "草绳腰带"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same fifteen-year-old bugler, starved and hollow-cheeked: sunken eyes, cracked lips, sharp jaw under an oversized muddy cap. Oversized grey-green tunic soaked with cold mud, sleeves too long, straw-rope belt, small satchel, brass bugle held against the chest; no cooking pot yet, no snow and no frost. Keep his identity but show hunger and exhaustion.",
      "avoid_en": "no healthy round cheeks, no copper pot, no snow, no frost, no clean uniform, no extra people, no text"
    },
    "xiaoman_ch17_pot": {
      "id": "xiaoman_ch17_pot",
      "character": "xiaoman",
      "label": "草地·背上多了一口锅",
      "chapters": [],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "同一身湿泥军装，肩背被锅带勒得更低，腰间草绳不变。",
      "equipment_cn": "黄铜军号，旧帆布号带，背上李铁柱的铜锅，石柱的布包。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "背着铜锅站定，肩被锅带勒低，右手扶锅沿，左手按号，身体明显瘦了一圈。",
      "props_cn": [
        "黄铜军号",
        "铜锅",
        "石柱的布包",
        "草绳腰带"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, gaunt face, short black hair under a soft collapsed cap. Blue-grey tunic smeared with black mud to the chest, torn cuffs, puttees and sandals soaked dark, a straw rope at the waist. Standing under the weight of a copper cooking pot strapped to his back, right hand on the pot rim, left hand on the bugle, shoulders dragged low.",
      "avoid_en": "no clean uniform, no padded coat, no rifle, no smile, no full cheeks, no extra people, no text"
    },
    "xiaoman_ch18_lazikou": {
      "id": "xiaoman_ch18_lazikou",
      "character": "xiaoman",
      "label": "腊子口·桥头的号",
      "chapters": [
        "ch18"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "bandaged",
      "outfit_cn": "灰蓝军装仍旧单薄，肩头有黄土，袖口破口，左臂新缠一圈白布，血从布边渗出；号身多了两个凹痕。",
      "equipment_cn": "黄铜军号（号管凹痕、缠麻线），背上铜锅，石柱的布包。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "站在桥头石后，右手举号，左臂垂着，身体半侧向峡谷，脸上有黑灰。",
      "props_cn": [
        "黄铜军号",
        "铜锅",
        "石柱的布包",
        "左臂白布"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, gaunt soot-smudged face, short black hair under a worn cap. Thin blue-grey tunic with yellow dust at the shoulders and torn cuffs, a fresh white cloth wrapped around the left arm with a little blood at the edge. Standing behind a bridge stone, right hand raising the brass bugle, left arm hanging, body half turned toward the gorge.",
      "avoid_en": "no clean uniform, no padded coat, no rifle, no smile, no extra people, no visible gore, no text"
    },
    "xiaoman_ch19_wuqi": {
      "id": "xiaoman_ch19_wuqi",
      "character": "xiaoman",
      "label": "哈达铺吴起·黑布鞋",
      "chapters": [
        "ch19"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰蓝军装洗过，袖口补好，绑腿重新扎紧，脚上换成新买的黑布鞋；帽子仍大，但戴正了。",
      "equipment_cn": "黄铜军号擦亮，旧帆布号带，石柱的布包，郭大娘的铜顶针分别放在左右口袋。",
      "head": {
        "turn": "right 4deg",
        "pitch": "up 3deg",
        "gaze": "forward_right"
      },
      "pose_cn": "站在黄土塬边，右手提号，左手按着口袋，肩背第一次松下来。",
      "props_cn": [
        "黄铜军号",
        "黑布鞋",
        "石柱的布包",
        "铜顶针"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, still large-headed, thin face filled out a little, short black hair under a straightened oversized cap. Washed blue-grey tunic, repaired cuffs, puttees rebound, new black cloth shoes. Standing at the edge of a loess plateau, brass bugle in the right hand, left hand over a pocket, shoulders relaxed for the first time.",
      "avoid_en": "no straw sandals, no dirty uniform, no rifle, no broad grin, no extra people, no text"
    },
    "xiaoman_ch19_cord": {
      "id": "xiaoman_ch19_cord",
      "character": "xiaoman",
      "label": "哈达铺·号上的麻线带",
      "chapters": [],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "同一身洗净的灰蓝军装与黑布鞋，帽檐戴正；无新增衣物。",
      "equipment_cn": "黄铜军号，号管第三节缠着阿月给的深色麻线带，旧帆布号带，左右口袋分装布包与顶针。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "低头把号管上的麻线带打结，右手捏着线头，左手托号。",
      "props_cn": [
        "黄铜军号",
        "深色麻线带",
        "石柱的布包",
        "铜顶针"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, shortest build, large head, thin face, short black hair under a straightened oversized cap. Washed blue-grey tunic, repaired cuffs, black cloth shoes. Holding the brass bugle with the left hand while tying a dark braided cord around the third section of the tube with the right, head bent to the knot, quiet concentration.",
      "avoid_en": "no straw sandals, no rifle, no smile, no clean new uniform, no extra people, no text"
    },
    "xiaoman_ch20_huining": {
      "id": "xiaoman_ch20_huining",
      "character": "xiaoman",
      "label": "会宁·十七岁的号长",
      "chapters": [
        "ch20"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "十七岁，个子长高，旧灰绿军装终于合身；肩部有补丁，黑布鞋，号管缠旧麻线带。",
      "equipment_cn": "黄铜军号（号管第三节缠旧麻线带，带子褪色），旧帆布号带，石柱的布包。",
      "head": {
        "turn": "right 3deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站直，个头比两年前高了半头，右手提号，左手自然垂着，肩背打开。",
      "props_cn": [
        "黄铜军号",
        "旧麻线带",
        "石柱的布包",
        "黑布鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A seventeen-year-old young man, clearly taller and leaner than the boy at the start, long mature jaw, tired steady eyes, short black hair under a faded repaired octagonal cap. Grey-green tunic now fits his shoulders and sleeve length, one repaired shoulder tear, scuffed belt, black cloth shoes dusty. Brass bugle held in both hands, dented but polished, a dark cord wrapped three times around the third joint. No child face, no oversized uniform.",
      "avoid_en": "no child face, no oversized uniform, no new bright uniform, no rifle, no extra people, no text"
    },
    "li_tiezhu_ch01_start": {
      "id": "li_tiezhu_ch01_start",
      "character": "li_tiezhu",
      "label": "于都出发·背锅的炊事班长",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿旧军装，外系一条油布围裙，袖口卷到小臂；头上绑一条旧布头巾，无帽。",
      "equipment_cn": "背上的铜锅、锅铲、盐罐、旧布粮袋。",
      "head": {
        "turn": "right 5deg",
        "pitch": "level",
        "gaze": "slightly_right"
      },
      "pose_cn": "站得宽厚，右手扶锅带，左手拿锅铲，脸上是憨厚的笑。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "盐罐",
        "旧布粮袋"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A stout 40-year-old man with a broad honest face, short black hair tied with a cloth headband, head bare, thick stubble. Faded grey-green tunic under a dark oilcloth apron, sleeves rolled to the forearms. Standing with a copper cooking pot strapped to his back, right hand on the pot strap, left hand holding a ladle, warm steady gaze.",
      "avoid_en": "no military cap, no rifle, no thin build, no clean apron, no extra people, no text"
    },
    "li_tiezhu_ch03_xiangjiang": {
      "id": "li_tiezhu_ch03_xiangjiang",
      "character": "li_tiezhu",
      "label": "湘江之后·锅里只有水",
      "chapters": [
        "ch03",
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装和油布围裙被雨水、泥浆压旧，袖口有烟灰，头巾湿塌；领口松开。",
      "equipment_cn": "铜锅（锅里只有水）、锅铲、盐罐几乎空、旧粮袋。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲在灶边，一手扶锅沿，一手拿勺，肩背塌着，眼睛看着锅底。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "空盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man, broad honest face hollowed by fatigue, short black hair under a wet cloth headband, head bare. Grey-green tunic and oilcloth apron grimed with rain and mud, soot at the cuffs, collar open. Squatting beside a stove, one hand on the copper pot rim, the other holding a ladle, shoulders slumped, eyes on the empty bottom of the pot.",
      "avoid_en": "no military cap, no rifle, no full pot, no smile, no clean apron, no extra people, no text"
    },
    "li_tiezhu_ch05_onepot": {
      "id": "li_tiezhu_ch05_onepot",
      "character": "li_tiezhu",
      "label": "黎平轻装·只留一口锅",
      "chapters": [],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "同一身旧军装与油布围裙，肩上的锅带压得更深；其余五口锅已留在黎平街上。",
      "equipment_cn": "一口带补丁的铜锅、锅铲、空盐罐、旧粮袋。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "把唯一留下的锅重新背好，右手拉紧锅带，左手摸着锅底补丁。",
      "props_cn": [
        "带补丁的铜锅",
        "锅铲",
        "空盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "sad"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man, broad tired face, short black hair under a damp cloth headband, head bare. Grey-green tunic and oilcloth apron worn and muddy. One patched copper pot strapped to his back, the strap cutting deep into the shoulder, right hand pulling it tight, left hand touching the patch on the pot bottom, expression grieved but resolute.",
      "avoid_en": "no military cap, no rifle, no second pot, no smile, no clean apron, no extra people, no text"
    },
    "li_tiezhu_ch06_supply": {
      "id": "li_tiezhu_ch06_supply",
      "character": "li_tiezhu",
      "label": "猴场遵义·锅里终于有油",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗过，油布围裙擦净，头巾重新扎好，袖口卷起；衣料仍旧。",
      "equipment_cn": "铜锅（有肉有米）、锅铲、盐罐半满、旧粮袋。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "站在锅边，右手拿勺搅动，左手扶锅沿，脸上是压不住的笑。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "半满盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man, broad face softened by a rare meal, short black hair under a retied cloth headband, head bare. Washed grey-green tunic, wiped oilcloth apron, sleeves rolled, old but clean cloth. Standing at the pot, right hand stirring with a ladle, left hand on the rim, a broad barely contained smile.",
      "avoid_en": "no military cap, no rifle, no empty pot, no clean new uniform, no extra people, no text"
    },
    "li_tiezhu_ch09_longmarch": {
      "id": "li_tiezhu_ch09_longmarch",
      "character": "li_tiezhu",
      "label": "赤水金沙·锅顶在头上",
      "chapters": [
        "ch09",
        "ch10",
        "ch11",
        "ch12"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被红泥和江水压旧，油布围裙裂了一道口，头巾褪色，袖口磨破。",
      "equipment_cn": "铜锅（有半袋米时顶在头上过河）、锅铲、盐罐、旧粮袋。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "双手扶住顶在头上的锅，身体微歪，肩背被锅压得前倾，脸上仍是憨劲。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man, broad face weathered and leaner, short black hair under a faded cloth headband, head bare. Grey-green tunic worn by red mud and river water, oilcloth apron split at one edge, frayed cuffs. Both hands steadying the copper pot balanced on his head, body tilted slightly, shoulders bowed under the weight, still dogged.",
      "avoid_en": "no military cap, no rifle, no clean apron, no smile broadly, no extra people, no text"
    },
    "li_tiezhu_ch14_wet": {
      "id": "li_tiezhu_ch14_wet",
      "character": "li_tiezhu",
      "label": "大渡河泸定·手在抖",
      "chapters": [
        "ch14",
        "ch15"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被雨水和河水泡旧，油布围裙发硬，头巾湿塌，袖口破口；鞋上全是泥。",
      "equipment_cn": "铜锅（背在背上，锅底发烫）、锅铲、盐罐、旧粮袋。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "双手端锅，手腕发抖，肩背被锅压弯，脸被烟火熏得发灰。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man, broad face grey with smoke and fatigue, short black hair under a soaked cloth headband, head bare. Grey-green tunic stiff with rain and river water, oilcloth apron hardened, frayed cuffs, muddy shoes. Both hands holding the copper pot, wrists trembling, shoulders bent under its weight, eyes down-left.",
      "avoid_en": "no military cap, no rifle, no clean apron, no smile, no steady heroic pose, no extra people, no text"
    },
    "li_tiezhu_ch16_snow": {
      "id": "li_tiezhu_ch16_snow",
      "character": "li_tiezhu",
      "label": "夹金山·锅冻住了",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "湿冷灰绿军装、冻硬油布围裙、结霜头巾；铜锅抱在胸前，锅沿有冰，帽肩落雪。",
      "equipment_cn": "铜锅（锅沿结冰）、锅铲、空盐罐、旧粮袋。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "把锅抱在胸前，双手拢着锅沿，身体缩成一团，嘴唇发白。",
      "props_cn": [
        "结冰的铜锅",
        "锅铲",
        "空盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "worry",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout weathered cook around forty, round face, dark stubble, frost-crusted cloth headband. Wet grey-green tunic under a frozen stiff oilcloth apron, cracked hands. He hugs a bronze cooking pot against his chest, frost and ice on the pot rim, snow on headband and shoulders, no padded coat.",
      "avoid_en": "no clean apron, no warm room, no padded coat, no extra people, no text"
    },
    "li_tiezhu_ch17_grassland": {
      "id": "li_tiezhu_ch17_grassland",
      "character": "li_tiezhu",
      "label": "草地·最后一锅鱼汤",
      "chapters": [
        "ch17"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装湿泥糊到胸口，油布围裙发黑，头巾松脱，脸颊深陷，手背青筋凸起。",
      "equipment_cn": "铜锅（锅底擦得发亮）、锅铲、空盐罐、旧粮袋。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 8deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲在锅边，右手拿勺搅汤，左手扶着锅沿，肩背瘦得撑不住衣服。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "空盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man reduced to skin and bone, cheeks deeply hollow, short black hair under a loosened muddy headband, head bare. Grey-green tunic smeared with black mud to the chest, oilcloth apron blackened, hands bony with raised veins. Squatting beside the copper pot, right hand stirring with a ladle, left hand on the rim, shoulders too thin for the tunic, eyes fixed on the thin fish soup.",
      "avoid_en": "no healthy weight, no clean cloth, no military cap, no rifle, no smile, no extra people, no text"
    },
    "li_tiezhu_ch17_death": {
      "id": "li_tiezhu_ch17_death",
      "character": "li_tiezhu",
      "label": "草地第七天·背靠铜锅",
      "chapters": [],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "同一身湿泥军装与发黑围裙，头巾松脱，脸颊深陷，双手仍搭在锅沿上。",
      "equipment_cn": "铜锅（锅底干净发亮）、锅铲、空盐罐、旧粮袋。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 8deg",
        "gaze": "none"
      },
      "pose_cn": "背靠铜锅坐着，眼睛闭着，双手搭在锅沿上，像只是睡着了。",
      "props_cn": [
        "铜锅",
        "锅铲",
        "空盐罐",
        "旧粮袋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Stout 40-year-old man reduced to skin and bone, cheeks deeply hollow, short black hair under a loosened muddy headband, head bare. Grey-green tunic smeared with black mud to the chest, oilcloth apron blackened, hands bony with raised veins. Sitting back against the copper pot, eyes closed, both hands still resting on its rim, the polished pot bottom catching the light.",
      "avoid_en": "no healthy weight, no clean cloth, no military cap, no rifle, no smile, no extra people, no text"
    },
    "he_xiaomei_ch01_start": {
      "id": "he_xiaomei_ch01_start",
      "character": "he_xiaomei",
      "label": "于都出发·白围裙卫生员",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 1,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装束腰，外系白围裙，左臂红十字臂章，头戴白色护士帽，短发掖在帽后；衣料洗得发白。",
      "equipment_cn": "药箱、绷带卷、盐水瓶、登记本。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "站着，双手把绷带卷得很紧，肩背清瘦，神情专注。",
      "props_cn": [
        "白色护士帽",
        "红十字臂章",
        "药箱",
        "绷带卷"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A thin 19-year-old woman with short black hair tucked under a white nurse cap, a narrow youthful face, clear tired eyes, red cross armband on the left sleeve. Belted faded grey-green tunic with a clean white apron. Standing with both hands rolling a bandage tight, shoulders lean, focused downward gaze.",
      "avoid_en": "no male face, no long loose hair, no rifle, no smile broadly, no bloody apron, no extra people, no text"
    },
    "he_xiaomei_ch03_xiangjiang": {
      "id": "he_xiaomei_ch03_xiangjiang",
      "character": "he_xiaomei",
      "label": "湘江·撕掉最后一件衬衣",
      "chapters": [
        "ch03",
        "ch04",
        "ch05"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "白围裙前襟被血和泥染成暗红，袖口湿硬，护士帽歪着，军装领口松开；衬衣仍在，但已被血污浸到。",
      "equipment_cn": "药箱、所剩无几的绷带、盐水瓶、夹着名字纸页的登记本。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "跪在担架旁，双手按住伤员胸口，肩背绷紧，脸侧沾着泥点。",
      "props_cn": [
        "药箱",
        "空绷带卷",
        "盐水瓶",
        "登记本"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair under a crooked white nurse cap, young face grimed with mud, red cross armband dulled. White apron stained dark red at the front, stiff wet cuffs, tunic collar open, undershirt darkened with blood. Kneeling beside a folded stretcher, both bloodied hands pressing a wadded bandage against her own apron, shoulders rigid, jaw set.",
      "avoid_en": "no clean white apron, no male face, no rifle, no smile, no visible gore beyond stains, no extra people, no text"
    },
    "he_xiaomei_ch03_torn": {
      "id": "he_xiaomei_ch03_torn",
      "character": "he_xiaomei",
      "label": "湘江之后·衬衣也只剩一件",
      "chapters": [],
      "wear": 2,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "同一身血泥围裙，衬衣被撕去一大截，军装下摆露出粗糙的里布；护士帽仍歪着。",
      "equipment_cn": "药箱（夹层塞着写满名字的纸）、空绷带卷、盐水瓶。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 6deg",
        "gaze": "down"
      },
      "pose_cn": "把空绷带卷放下，双手在围裙上擦了两下，头低着，眼睛红。",
      "props_cn": [
        "药箱",
        "空绷带卷",
        "写满名字的纸"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "fierce",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair under a crooked white cap, face smudged with mud and grief. Blood-and-mud stained white apron, tunic hem showing a torn rough underlayer where her shirt was ripped away, empty bandage roll in one hand. Both hands wiped on the apron, head bowed, eyes red but dry.",
      "avoid_en": "no intact undershirt, no clean apron, no male face, no rifle, no tears running, no extra people, no text"
    },
    "he_xiaomei_ch06_supply": {
      "id": "he_xiaomei_ch06_supply",
      "character": "he_xiaomei",
      "label": "猴场·洗净的围裙，空药箱",
      "chapters": [
        "ch06"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "白围裙洗过但仍留下洗不掉的淡红痕，军装洗净，护士帽戴正，袖口补过；没有新军装。",
      "equipment_cn": "药箱里只剩少量纸包药、一卷绷带、盐水瓶、登记本。",
      "head": {
        "turn": "left 3deg",
        "pitch": "down 2deg",
        "gaze": "down_left"
      },
      "pose_cn": "坐在药箱旁清点所剩不多的药品，双手把最后一卷绷带放好，肩背放松但眉头未展。",
      "props_cn": [
        "药箱",
        "少量纸包药",
        "一卷绷带",
        "登记本"
      ],
      "faces": [
        "calm",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair under a straightened white nurse cap, young face washed clean, faded red cross armband. Washed white apron with faint permanent pink stains, neat patched cuffs, old cloth. Seated beside an open medicine box that holds only a few paper packets and one bandage roll, hands carefully closing the lid, shoulders relaxed but brow still tight.",
      "avoid_en": "no new uniform, no clean spotless apron, no male face, no rifle, no broad smile, no extra people, no text"
    },
    "he_xiaomei_ch07_supply": {
      "id": "he_xiaomei_ch07_supply",
      "character": "he_xiaomei",
      "label": "遵义·药品补齐",
      "chapters": [
        "ch07"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "白围裙洗净，军装领口整齐，护士帽戴正，袖口补过；药箱重新装满。",
      "equipment_cn": "药箱装满纸包药、绷带卷、盐水瓶、登记本。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "坐在药箱旁，把新买的药一包包码进箱里，肩背放松，神情专注。",
      "props_cn": [
        "药箱",
        "纸包药",
        "绷带卷",
        "登记本"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair under a neat white nurse cap, young face clean, repaired red cross armband. Washed white apron with faint old stains, patched cuffs. Seated beside a medicine box refilled with paper packets and fresh bandage rolls, both hands stacking them in order, shoulders relaxed, quiet concentration.",
      "avoid_en": "no new uniform, no clean spotless apron, no male face, no rifle, no broad smile, no extra people, no text"
    },
    "he_xiaomei_ch08_chishui": {
      "id": "he_xiaomei_ch08_chishui",
      "character": "he_xiaomei",
      "label": "土城赤水·只有三卷纱布",
      "chapters": [
        "ch08",
        "ch09",
        "ch10",
        "ch11"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "白围裙被血、泥和菜籽油染成灰褐，护士帽歪着，军装袖口湿硬，头发上沾着泥。",
      "equipment_cn": "药箱、仅剩三卷纱布、盐水瓶、夹着名字纸页的登记本。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 4deg",
        "gaze": "down_right"
      },
      "pose_cn": "跪在榨油坊地上，双手按住伤员腹部，肩背前压，脸侧全是泥。",
      "props_cn": [
        "药箱",
        "三卷纱布",
        "盐水瓶",
        "登记本"
      ],
      "faces": [
        "calm",
        "sad",
        "worry",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair muddy at the edges, white nurse cap askew, young face streaked with mud, red cross armband dull. White apron stained grey-brown with blood, mud and oil, stiff wet cuffs. Kneeling on an oil-press floor, both hands wrapping a bloodstained bandage around a folded cloth pad, shoulders driving forward, jaw clenched.",
      "avoid_en": "no clean apron, no male face, no rifle, no smile, no visible gore beyond stains, no extra people, no text"
    },
    "he_xiaomei_ch12_longmarch": {
      "id": "he_xiaomei_ch12_longmarch",
      "character": "he_xiaomei",
      "label": "金沙江泸定·只剩盐水",
      "chapters": [
        "ch12",
        "ch13",
        "ch14",
        "ch15"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "白围裙已经洗成灰白，前襟有洗不掉的暗红，护士帽边磨破，军装袖口撕裂，头发被汗黏在脸侧。",
      "equipment_cn": "药箱用绑腿绑在腰上，空药瓶、盐水碗、所剩无几的布条。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲在担架边，双手用盐水洗伤口，肩背瘦得突出，脸贴近伤员。",
      "props_cn": [
        "药箱",
        "盐水碗",
        "空药瓶",
        "布条"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair stuck to one cheek with sweat, worn white nurse cap, hollow young face, faded red cross armband. Apron washed to grey with an indelible dark red front, torn tunic cuffs. Medicine box lashed to her waist with a puttee, both hands cleaning a wound with salt water, shoulders sharp with fatigue.",
      "avoid_en": "no clean apron, no full medicine box, no male face, no rifle, no smile, no extra people, no text"
    },
    "he_xiaomei_ch16_snow": {
      "id": "he_xiaomei_ch16_snow",
      "character": "he_xiaomei",
      "label": "雪山腊子口·用体温救脚",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "frost",
      "outfit_cn": "单薄灰绿军装和白围裙，围裙冻硬、沾霜；护士帽结霜，药箱抱在怀里，没有棉衣。",
      "equipment_cn": "药箱、空药瓶、盐水碗、撕成条的衣角。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "跪在雪地里，双手把伤员的脚抱进怀里，肩背弓起，牙关打颤。",
      "props_cn": [
        "药箱",
        "空药瓶",
        "盐水碗",
        "撕条衣角"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry",
        "fierce",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same young woman nurse, short bob, thin grey-green tunic and white apron gone stiff with frost, white nurse cap and faded red-cross armband crusted with ice. No padded coat, no scarf, no fur. She holds an almost empty medicine box against her body and a frozen bandage in one hand, frost on brows and cap, a frostbitten foot held against her chest.",
      "avoid_en": "no padded coat, no thick clothing, no scarf, no male face, no clean apron, no warm light, no extra people, no text"
    },
    "he_xiaomei_ch19_north": {
      "id": "he_xiaomei_ch19_north",
      "character": "he_xiaomei",
      "label": "吴起镇·手不再抖",
      "chapters": [
        "ch19"
      ],
      "wear": 4,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，白围裙重新浆过但仍发灰，护士帽戴正，袖口补好；没有新制服。",
      "equipment_cn": "药箱、洗得发灰的绷带、登记本、盐水瓶。",
      "head": {
        "turn": "left 3deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "站在窑洞前，双手把洗好的绷带卷起来，动作稳，肩背直。",
      "props_cn": [
        "药箱",
        "灰白绷带",
        "登记本",
        "盐水瓶"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman, short black hair under a straight white nurse cap, young face weathered but calm, red cross armband repaired. Washed grey-green tunic, re-starched but greyish white apron, patched cuffs. Standing before a cave dwelling, both hands rolling clean grey-white bandages with steady movements, shoulders straight.",
      "avoid_en": "no new uniform, no spotless white apron, no male face, no rifle, no broad smile, no extra people, no text"
    },
    "he_xiaomei_ch20_huining": {
      "id": "he_xiaomei_ch20_huining",
      "character": "he_xiaomei",
      "label": "会宁·两年后的军医",
      "chapters": [
        "ch20"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "灰绿军装洗得干净，白围裙平整，红十字臂章重新缝过，护士帽端正；袖口有细细的补线。",
      "equipment_cn": "药箱、叠好的灰白绷带、盐水瓶、登记本。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 4deg",
        "gaze": "down_right"
      },
      "pose_cn": "坐在火堆边给伤员换药，双手极稳，肩背放松，脸上有淡淡的笑。",
      "props_cn": [
        "药箱",
        "灰白绷带",
        "盐水瓶",
        "登记本"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Thin 19-year-old woman grown into a steadier presence, short black hair under a neat white nurse cap, weathered young face, repaired red cross armband. Clean grey-green tunic, flat white apron, fine mended lines at the cuffs. Seated by a fire changing a dressing, both hands very steady, shoulders relaxed, a faint warm smile.",
      "avoid_en": "no new uniform, no male face, no rifle, no broad grin, no bloody apron, no extra people, no text"
    },
    "he_xiaomei_ch17_18_coldwet": {
      "id": "he_xiaomei_ch17_18_coldwet",
      "character": "he_xiaomei",
      "label": "草地与腊子口·冷湿围裙",
      "chapters": [
        "ch17",
        "ch18"
      ],
      "wear": 5,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "单薄灰绿军装，白围裙被泥水打湿发硬，护士帽压皱，药箱几乎空了；没有棉衣和雪。",
      "equipment_cn": "药箱、空药瓶、盐水碗、撕成条的衣角。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "跪在雪地里，双手把伤员的脚抱进怀里，肩背弓起，牙关打颤。",
      "props_cn": [
        "药箱",
        "空药瓶",
        "盐水碗",
        "撕条衣角"
      ],
      "faces": [
        "calm",
        "stern",
        "worry",
        "fierce",
        "sad",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same young woman nurse, short bob, creased white nurse cap and faded red-cross armband. Thin grey-green tunic under a mud-wet white apron gone stiff, no padded coat, no scarf, no snow and no frost. The medicine box is nearly empty; one hand holds a scrap of bandage, the other braces a patient out of frame.",
      "avoid_en": "no snow, no frost, no padded coat, no thick clothing, no male face, no clean apron, no extra people, no text"
    },
    "guo_daniang_ch01_yudu": {
      "id": "guo_daniang_ch01_yudu",
      "character": "guo_daniang",
      "label": "于都河畔·拆门板的人",
      "chapters": [
        "ch01"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "蓝色粗布大襟衫，外系深色围裙，袖口卷到小臂；花白头发挽髻，包一条蓝布头巾，脚穿旧布鞋。",
      "equipment_cn": "一块带灶烟黑印的门板、针线篮、铜顶针、给儿子的草鞋。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "抱着门板站在河边，肩背因年纪略弯，手上还沾着灶灰，眼神温和而硬。",
      "props_cn": [
        "门板",
        "铜顶针",
        "针线篮",
        "草鞋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 50-something Jiangxi village woman with a weathered square face, white-streaked hair in a bun under a blue cloth headscarf, deep smile lines, a bare weathered face. Blue coarse-cloth front-opening jacket, dark apron, sleeves rolled to the forearms, old cloth shoes. Holding a door plank darkened by stove smoke against her side, a small brass thimble in one hand, stooped but sturdy.",
      "avoid_en": "no military uniform, no young face, no rifle, no modern clothing, no clean hands, no extra people, no text"
    },
    "guo_daniang_ch01_thimble": {
      "id": "guo_daniang_ch01_thimble",
      "character": "guo_daniang",
      "label": "于都河畔·递出顶针",
      "chapters": [],
      "wear": 2,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "同一身蓝布大襟衫与深色围裙，袖口沾着灶灰；门板已放在脚边。",
      "equipment_cn": "门板靠在腿边，右手捏着一枚磨亮的铜顶针，左手还拿着针线。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "微微弯腰，把铜顶针递向前，另一只手护着针线，眼神认真。",
      "props_cn": [
        "铜顶针",
        "门板",
        "针线"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 50-something Jiangxi village woman, weathered square face, white-streaked bun under a blue cloth headscarf, blue coarse-cloth jacket and dark apron. The smoke-darkened door plank rests against her leg. Slightly bent forward, offering a small polished brass thimble with her right hand, needle and thread held in the left, expression grave and tender.",
      "avoid_en": "no military uniform, no young face, no rifle, no clean hands, no extra people, no text"
    },
    "shi_zhu_ch01_start": {
      "id": "shi_zhu_ch01_start",
      "character": "shi_zhu",
      "label": "于都出发·编草鞋的兄长",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装合身，领章褪色，绑腿扎紧，草鞋结实；肩背宽，袖口卷到小臂。",
      "equipment_cn": "八角帽、肩扛红旗、步枪、腰间草绳与备用草鞋。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲着编草鞋，膝盖上摊着三股草，右手压紧最里面一股，头低着。",
      "props_cn": [
        "八角帽",
        "红旗",
        "步枪",
        "草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A tall 22-year-old Jiangxi soldier with a broad honest face, short black hair under an octagonal cap, clean-shaven, sun-darkened skin. Fitted faded grey-green tunic, faded collar tabs, tight puttees, sturdy straw sandals, sleeves rolled to the forearms. Squatting with three strands of straw on one knee, right hand pressing the innermost strand tight, head bent to the work, red flag and rifle close at hand.",
      "avoid_en": "no thin build, no clean new uniform, no smile broadly, no extra people, no text"
    },
    "shi_zhu_ch08_before": {
      "id": "shi_zhu_ch08_before",
      "character": "shi_zhu",
      "label": "土城·守土坎之前",
      "chapters": [
        "ch08"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "none",
      "outfit_cn": "灰绿军装被红泥糊到膝盖，袖口湿硬，领章褪色，绑腿扎紧，草鞋带泥。",
      "equipment_cn": "八角帽、步枪、红旗卷在背包上、腰间草绳。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站得直，右手握枪，左手把红旗往肩上提了提，脸上带一点笑。",
      "props_cn": [
        "八角帽",
        "步枪",
        "红旗"
      ],
      "faces": [
        "calm",
        "smile",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 22-year-old soldier, broad honest face, short black hair under an octagonal cap, sun-darkened skin. Grey-green tunic with red mud to the knees, stiff wet cuffs, faded collar tabs, tight puttees, muddy straw sandals. Standing straight, right hand on a rifle, left hand hitching a red flag higher on his shoulder, a faint confident half-smile.",
      "avoid_en": "no clean uniform, no shoulder wound yet, no extra people, no text"
    },
    "shi_zhu_ch08_shoulder": {
      "id": "shi_zhu_ch08_shoulder",
      "character": "shi_zhu",
      "label": "土城·左肩被打穿",
      "chapters": [],
      "wear": 3,
      "dirt": 4,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装左肩被血浸透，临时白布缠得很厚，布面发黑发硬；左裤腿少了一条绑腿。",
      "equipment_cn": "八角帽、步枪（右手提着）、红旗、草绳。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 6deg",
        "gaze": "down_left"
      },
      "pose_cn": "半侧着身，左臂垂着不敢动，右手提枪，脸因失血发白。",
      "props_cn": [
        "八角帽",
        "步枪",
        "红旗",
        "左肩白布"
      ],
      "faces": [
        "calm",
        "smile",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 22-year-old soldier, broad face pale from blood loss, short black hair under a mud-stained octagonal cap. Grey-green tunic soaked dark at the left shoulder, a thick rough white bandage hardened with blood, one puttee missing from the left leg. Turned half away, left arm hanging still, right hand holding the rifle, jaw tight against pain.",
      "avoid_en": "no clean shoulder, no symmetrical puttees, no smile, no extra people, no visible gore beyond the bandage, no text"
    },
    "shi_zhu_ch09_wounded": {
      "id": "shi_zhu_ch09_wounded",
      "character": "shi_zhu",
      "label": "扎西到赤水·带伤的旗手",
      "chapters": [
        "ch09",
        "ch10",
        "ch11",
        "ch13"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装左肩仍缠厚布，布边发黑，左袖空荡地垂着；下摆和绑腿沾红泥，草鞋旧。",
      "equipment_cn": "八角帽、步枪（右手）、红旗、草绳。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 3deg",
        "gaze": "forward_right"
      },
      "pose_cn": "站直，左手护着肩，右手扶旗杆，肩背因伤略偏，仍不肯弯腰。",
      "props_cn": [
        "八角帽",
        "步枪",
        "红旗",
        "左肩厚布"
      ],
      "faces": [
        "calm",
        "smile",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 22-year-old soldier, broad face weathered and thinner, short black hair under a worn octagonal cap. Grey-green tunic with a thick dark-edged bandage at the left shoulder, left sleeve hanging empty, red mud at the hem and puttees. Standing upright with the left hand guarding the shoulder, right hand on a flag pole, body slightly skewed by pain but unbowed.",
      "avoid_en": "no healed shoulder, no clean bandage, no smile broadly, no extra people, no text"
    },
    "shi_zhu_ch14_dadu": {
      "id": "shi_zhu_ch14_dadu",
      "character": "shi_zhu",
      "label": "大渡河·先上船",
      "chapters": [
        "ch14"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装被河水打湿，左肩旧布仍在，裤脚湿到膝，右腿尚未包扎；草鞋泡软。",
      "equipment_cn": "八角帽、步枪、红旗、贴身布包（母亲的头发）。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "站在船边，右手扶枪，左手压着胸口布包，身体前倾准备上船。",
      "props_cn": [
        "八角帽",
        "步枪",
        "红旗",
        "贴身布包"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "fierce",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 22-year-old soldier, broad face wet with river spray, short black hair under a soaked octagonal cap. Grey-green tunic dark with water, old bandage still at the left shoulder, trousers wet to the knee, right leg not yet bandaged, soft straw sandals. Standing at the boat edge, right hand on the rifle, left hand pressing a small cloth bundle to the chest, body angled forward.",
      "avoid_en": "no dry uniform, no right-leg bandage yet, no smile, no extra people, no text"
    },
    "shi_zhu_ch14_leg": {
      "id": "shi_zhu_ch14_leg",
      "character": "shi_zhu",
      "label": "大渡河·右腿被石头划开",
      "chapters": [],
      "wear": 3,
      "dirt": 4,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装湿透，右裤腿从膝盖到脚踝被割开，露出缠着白布的腿；左肩旧布仍在。",
      "equipment_cn": "八角帽、步枪、红旗、右腿白布。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "坐着，右手撑膝，左腿伸直，右腿裤管割开，牙关咬着。",
      "props_cn": [
        "八角帽",
        "步枪",
        "红旗",
        "右腿白布"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "fierce",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 22-year-old soldier, broad face pale, short black hair under a wet octagonal cap. Soaked grey-green tunic, old left-shoulder bandage, right trouser leg cut open from knee to ankle, a white cloth wrapped around the lower leg. Seated with the right hand braced on one knee, right leg extended, teeth clenched, rifle and red flag beside him.",
      "avoid_en": "no intact right trouser leg, no clean bandage, no smile, no extra people, no visible gore, no text"
    },
    "shi_zhu_ch15_luding": {
      "id": "shi_zhu_ch15_luding",
      "character": "shi_zhu",
      "label": "泸定桥·二十二分之一",
      "chapters": [
        "ch15"
      ],
      "wear": 4,
      "dirt": 5,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装被火燎出焦痕，左肩旧布和右腿白布都在，袖口卷两圈，草鞋带系得很紧。",
      "equipment_cn": "八角帽、步枪、子弹袋挪到胸前、红旗、小指上的铜顶针。",
      "head": {
        "turn": "left 3deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站在桥头，右手握枪，左手扶铁索，身体前倾，脸上是决绝的平静。",
      "props_cn": [
        "八角帽",
        "步枪",
        "红旗",
        "铜顶针"
      ],
      "faces": [
        "calm",
        "smile",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Tall 22-year-old soldier, broad face soot-streaked, short black hair under a scorched octagonal cap. Grey-green tunic with burn marks, old left-shoulder bandage and right-leg white cloth, sleeves rolled twice, straw sandals tied tight. Standing at a bridgehead, right hand on the rifle, left hand gripping an iron chain, body forward, calm resolve.",
      "avoid_en": "no clean uniform, no unburned cloth, no smile, no extra people, no text"
    },
    "shi_zhu_ch15_burned": {
      "id": "shi_zhu_ch15_burned",
      "character": "shi_zhu",
      "label": "泸定桥·火里出来的人",
      "chapters": [],
      "wear": 5,
      "dirt": 5,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装前襟和两袖烧穿，衣料粘着焦黑皮肉，胸口和手臂缠着仓促裹上的白布，布很快被血浸透。",
      "equipment_cn": "八角帽不见了，步枪靠在墙边，红旗卷在身侧，小指上仍套着铜顶针。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 8deg",
        "gaze": "down_right"
      },
      "pose_cn": "靠在墙角坐着，右手抬到一半落下，头低着，呼吸很浅。",
      "props_cn": [
        "步枪",
        "红旗",
        "铜顶针",
        "烧焦的军装"
      ],
      "faces": [
        "calm",
        "smile",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same tall Jiangxi soldier, face blackened with soot, tunic torn open. Clearly visible scorched red burns across the exposed chest and both forearms, rough white bandages at the edges, burns readable but not graphic gore. A burned red flag staff in one hand and rifle in the other, hair singed, no cap. Lift the exposure enough that the burns and face are readable.",
      "avoid_en": "no clean face, no intact tunic, no invisible burns, no graphic gore, no excessive blood, no extra people, no text"
    },
    "a_yue_ch04_guide": {
      "id": "a_yue_ch04_guide",
      "character": "a_yue",
      "label": "湘黔边界·苗族向导",
      "chapters": [
        "ch04"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "苗族靛蓝百褶裙，蓝色粗布上衣，银片头饰与银项圈，黑发盘髻；背篓，脚穿自己编的草鞋。",
      "equipment_cn": "银片头饰、银项圈、竹背篓、柴刀、草鞋。",
      "head": {
        "turn": "left 5deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "站得轻巧，右手扶背篓带，左手自然垂着，头略偏，眼神清亮。",
      "props_cn": [
        "银片头饰",
        "银项圈",
        "竹背篓",
        "柴刀"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A small 16-year-old Miao girl with a clear weathered face, black hair coiled under a silver headdress, silver neck ring, dark eyes. Indigo pleated skirt, blue coarse-cloth jacket, silver ornaments catching the light, straw sandals she made herself, a bamboo back basket on her shoulder. Standing lightly, right hand on the basket strap, head slightly tilted, bright direct gaze.",
      "avoid_en": "no Han military uniform, no octagonal cap, no rifle, no modern clothing, no heavy makeup, no extra people, no text"
    },
    "a_yue_ch18_cliff": {
      "id": "a_yue_ch18_cliff",
      "character": "a_yue",
      "label": "腊子口·带路上绝壁",
      "chapters": [
        "ch18"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "蓝色粗布上衣外罩靛蓝短褂，百褶裙下摆沾黄土，银片头饰仍在，草鞋磨薄；腰间盘着一捆麻绳。",
      "equipment_cn": "银片头饰、银项圈、麻绳、柴刀、草鞋。",
      "head": {
        "turn": "right 4deg",
        "pitch": "up 6deg",
        "gaze": "up_right"
      },
      "pose_cn": "仰头看石壁，右手抓着麻绳，左手扶着岩缝，身体微微前倾。",
      "props_cn": [
        "银片头饰",
        "银项圈",
        "麻绳",
        "柴刀"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Small 16-year-old Miao girl, clear weathered face, black hair coiled under a silver headdress, silver neck ring, dark eyes. Indigo short over-jacket and pleated skirt dusted with yellow earth, straw sandals worn thin, a coil of hemp rope at her waist. Head tilted up toward a cliff, right hand gripping the rope, left hand braced in a rock seam, body leaning forward.",
      "avoid_en": "no Han uniform, no octagonal cap, no rifle, no clean skirt, no smile, no extra people, no text"
    },
    "a_yue_ch19_farewell": {
      "id": "a_yue_ch19_farewell",
      "character": "a_yue",
      "label": "哈达铺·回腊子口",
      "chapters": [
        "ch19"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "蓝色粗布上衣洗过，百褶裙仍有黄土痕，银片头饰与银项圈戴正；肩上扛一根比人高的木棍，棍上刻着攀崖留下的几道痕。",
      "equipment_cn": "银片头饰、银项圈、刻痕木棍、竹背篓、一小块深色麻线带。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 2deg",
        "gaze": "forward_left"
      },
      "pose_cn": "站在老槐树下，右手扶木棍，左手把麻线带递出去，肩上背篓略沉。",
      "props_cn": [
        "银片头饰",
        "银项圈",
        "刻痕木棍",
        "竹背篓",
        "深色麻线带"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Small 16-year-old Miao girl, clear weathered face, black hair coiled under a silver headdress, silver neck ring. Washed blue coarse-cloth jacket, indigo pleated skirt with yellow earth at the hem, straw sandals, bamboo back basket. A tall wooden staff with carved climbing notches rests under her right hand, while the left hand offers a small dark braided cord, quiet farewell in her eyes.",
      "avoid_en": "no Han uniform, no octagonal cap, no rifle, no clean skirt, no broad smile, no extra people, no text"
    },
    "wu_laoliu_ch01_start": {
      "id": "wu_laoliu_ch01_start",
      "character": "wu_laoliu",
      "label": "于都出发·老兵班长",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装洗旧，肘部与肩头有补丁，领章褪色；八角帽破旧，帽檐压得低；绑腿扎紧，草鞋旧。",
      "equipment_cn": "破旧八角帽、步枪、烟袋、旧布包。",
      "head": {
        "turn": "right 5deg",
        "pitch": "level",
        "gaze": "slightly_right"
      },
      "pose_cn": "站得稳，右手提枪，左手捏着烟袋，脸上一道旧疤，眼神有点怪话人的味道。",
      "props_cn": [
        "破旧八角帽",
        "步枪",
        "烟袋",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 35-year-old veteran with a weathered square face, an old pale scar across one cheek, short black stubble, a worn octagonal cap pulled low. Faded grey-green tunic with patches at the elbow and shoulder, faded collar tabs, tight puttees, old straw sandals. Standing steady, rifle in the right hand, pipe in the left, wry knowing gaze.",
      "avoid_en": "no young smooth face, no clean new uniform, no smile broadly, no extra people, no text"
    },
    "wu_laoliu_ch03_xiangjiang": {
      "id": "wu_laoliu_ch03_xiangjiang",
      "character": "wu_laoliu",
      "label": "湘江·点名",
      "chapters": [
        "ch03",
        "ch04",
        "ch05"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装被雨水和血泥压旧，补丁边缘磨白，领口松开，帽檐滴水，绑腿泥重。",
      "equipment_cn": "破旧八角帽、步枪、烟袋、旧布包。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "站着点名，右手拿花名册，左手握枪带，肩背塌着，脸绷得很紧。",
      "props_cn": [
        "破旧八角帽",
        "花名册",
        "步枪",
        "烟袋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran, scarred weathered face hollowed by grief, short black stubble, dripping worn octagonal cap. Grey-green tunic worn by rain and bloodstained mud, patch edges pale, collar open, muddy puttees. Standing with a roster in the right hand, left hand on the rifle strap, shoulders slumped, jaw clamped tight.",
      "avoid_en": "no clean uniform, no smile, no upright parade pose, no extra people, no visible gore, no text"
    },
    "wu_laoliu_ch06_supply": {
      "id": "wu_laoliu_ch06_supply",
      "character": "wu_laoliu",
      "label": "猴场遵义·洗净的补丁",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装洗过，补丁仍在但干净，八角帽刷过，绑腿重新扎紧，草鞋换过。",
      "equipment_cn": "八角帽、旧步枪、烟袋、旧布包。",
      "head": {
        "turn": "right 3deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "蹲在门槛上抽烟袋，右手扶枪，左手托烟袋，脸上松了一点。",
      "props_cn": [
        "八角帽",
        "旧步枪",
        "烟袋",
        "旧布包"
      ],
      "faces": [
        "calm",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran, scarred weathered face, short black stubble, brushed octagonal cap. Washed grey-green tunic with clean patches, faded collar tabs, rebound puttees, newer straw sandals. Squatting on a doorstep with a pipe, right hand on the rifle, left hand cupping the pipe, a little of the old wry ease back.",
      "avoid_en": "no new uniform, no clean spotless cloth, no smile broadly, no extra people, no text"
    },
    "wu_laoliu_ch08_chishui": {
      "id": "wu_laoliu_ch08_chishui",
      "character": "wu_laoliu",
      "label": "赤水四渡·旧枪换新枪",
      "chapters": [
        "ch08",
        "ch09",
        "ch10",
        "ch11"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装被红泥和硝烟压旧，补丁边缘起毛，领口松开，帽檐压弯，绑腿泥重。",
      "equipment_cn": "八角帽、步枪（ch10 起换成缴获的黔军步枪）、烟袋、旧布包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "站着，右手掂着步枪，左手捏烟袋，肩背略前倾，脸上有连战的灰。",
      "props_cn": [
        "八角帽",
        "步枪",
        "烟袋",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "worry",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran, scarred weathered face grey with powder smoke, short black stubble, bent octagonal cap. Grey-green tunic worn by red mud and smoke, patch edges frayed, collar open, muddy puttees. Standing with a rifle weighed in the right hand, pipe in the left, shoulders slightly forward, the look of weeks of marching and fighting.",
      "avoid_en": "no clean uniform, no smile, no upright parade pose, no extra people, no text"
    },
    "wu_laoliu_ch10_rifle": {
      "id": "wu_laoliu_ch10_rifle",
      "character": "wu_laoliu",
      "label": "娄山关之后·缴获的黔军步枪",
      "chapters": [],
      "wear": 3,
      "dirt": 4,
      "injury": "old_wound",
      "outfit_cn": "同一身红泥军装，补丁与泥点未变；手里换成一支枪托完好的黔军步枪。",
      "equipment_cn": "八角帽、缴获的黔军步枪（深色木托）、烟袋、旧布包。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 2deg",
        "gaze": "down_right"
      },
      "pose_cn": "右手把新枪掂了掂，左手扶枪带，嘴角有一点老兵式的满意。",
      "props_cn": [
        "八角帽",
        "黔军步枪",
        "烟袋",
        "旧布包"
      ],
      "faces": [
        "calm",
        "stern",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran, scarred weathered face, short black stubble, worn octagonal cap. Grey-green tunic still muddy and patched. He weighs a captured Guizhou-army rifle in the right hand, dark wooden stock intact, left hand on the sling, a faint veteran’s satisfaction at the mouth.",
      "avoid_en": "no old cracked rifle, no clean uniform, no broad grin, no extra people, no text"
    },
    "wu_laoliu_ch12_longmarch": {
      "id": "wu_laoliu_ch12_longmarch",
      "character": "wu_laoliu",
      "label": "金沙江泸定·鞋底磨穿",
      "chapters": [
        "ch12",
        "ch13",
        "ch14",
        "ch15"
      ],
      "wear": 4,
      "dirt": 5,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装被江水和红泥反复浸透，补丁发黑，帽檐软塌，裤脚破口，草鞋底磨穿。",
      "equipment_cn": "八角帽、黔军步枪、烟袋、旧布包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 5deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲下看鞋底，右手翻鞋，左手扶枪，肩背瘦了一圈。",
      "props_cn": [
        "八角帽",
        "步枪",
        "烟袋",
        "磨穿的草鞋"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "worry",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran grown leaner, scarred weathered face, short black stubble, soft collapsed octagonal cap. Grey-green tunic repeatedly soaked by river water and red mud, patches blackened, torn trouser cuffs, straw sandals worn through at the soles. Squatting to inspect a sole, rifle braced against one arm, pipe tucked at the belt.",
      "avoid_en": "no clean uniform, no intact sandals, no smile, no upright pose, no extra people, no text"
    },
    "wu_laoliu_ch16_snow": {
      "id": "wu_laoliu_ch16_snow",
      "character": "wu_laoliu",
      "label": "雪山草地腊子口·老兵也老了",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "frost",
      "outfit_cn": "灰绿军装单薄结霜，补丁冻硬，帽檐结冰，绑腿解下接成攀崖绳，裤脚松散；胡茬花白。",
      "equipment_cn": "结霜的八角帽、步枪、烟袋、草绳。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "站得仍稳，右手扶枪，左手把草绳往腰上绕，肩背被风雪压弯。",
      "props_cn": [
        "结霜的八角帽",
        "步枪",
        "烟袋",
        "草绳"
      ],
      "faces": [
        "calm",
        "stern",
        "smile",
        "sad",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran aged by the road, scarred face gaunt, stubble flecked grey, frost-rimmed octagonal cap. Thin grey-green tunic with frozen patches, puttees braided into rope, trousers loose at the ankles, a single layer of cloth. Standing squarely with the rifle in the right hand, left hand coiling rope at his waist, shoulders bowed by wind and snow.",
      "avoid_en": "no padded coat, no clean uniform, no smile, no upright young posture, no extra people, no text"
    },
    "wu_laoliu_ch19_north": {
      "id": "wu_laoliu_ch19_north",
      "character": "wu_laoliu",
      "label": "吴起会宁·替全班尝一口",
      "chapters": [
        "ch19",
        "ch20"
      ],
      "wear": 4,
      "dirt": 2,
      "injury": "old_wound",
      "outfit_cn": "灰绿军装洗净，补丁仍在，帽檐刷净，草鞋换成布鞋但仍旧；领章褪色。",
      "equipment_cn": "八角帽、步枪、烟袋、旧布包。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "站着，右手拿着黄米馍馍，左手把一小块放在石头上，头略低。",
      "props_cn": [
        "八角帽",
        "步枪",
        "烟袋",
        "黄米馍馍"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 35-year-old veteran, scarred weathered face washed clean, short grey-flecked stubble, brushed octagonal cap. Washed grey-green tunic with kept patches, faded collar tabs, old cloth shoes with dust. Standing with a yellow-millet bun in the right hand, left hand placing a small piece on a stone, head slightly bowed, grief held in check.",
      "avoid_en": "no new uniform, no clean spotless cloth, no broad grin, no extra people, no text"
    },
    "wu_laoliu_ch17_18_coldwet": {
      "id": "wu_laoliu_ch17_18_coldwet",
      "character": "wu_laoliu",
      "label": "草地与腊子口·冷湿破军装",
      "chapters": [
        "ch17",
        "ch18"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "旧军装补丁被雨泥浸透，草绳腰带，八角帽破边；枪作拐，无雪无霜。",
      "equipment_cn": "结霜的八角帽、步枪、烟袋、草绳。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 7deg",
        "gaze": "down_right"
      },
      "pose_cn": "站得仍稳，右手扶枪，左手把草绳往腰上绕，肩背被风雪压弯。",
      "props_cn": [
        "结霜的八角帽",
        "步枪",
        "烟袋",
        "草绳"
      ],
      "faces": [
        "calm",
        "stern",
        "dawn",
        "sad",
        "fierce",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. Weathered veteran in his mid-thirties, old cheek scar, rough stubble, frayed octagonal cap. Patched grey-green tunic soaked with cold mud, rope belt, repaired rifle sling, pipe empty. He leans on the rifle like a crutch, no snow, no frost, no padded coat, no thick blanket.",
      "avoid_en": "no snow, no frost, no padded coat, no thick blanket, no clean uniform, no extra people, no text"
    },
    "san_wa_ch01_start": {
      "id": "san_wa_ch01_start",
      "character": "san_wa",
      "label": "于都出发·最小的红小鬼",
      "chapters": [
        "ch01",
        "ch02",
        "ch03"
      ],
      "wear": 1,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装明显偏大，袖子卷了好几道，领口松；八角帽太大，盖住耳朵；光脚或穿破草鞋。",
      "equipment_cn": "过大的八角帽、小挎包、半块红薯；没有枪。",
      "head": {
        "turn": "right 5deg",
        "pitch": "up 3deg",
        "gaze": "forward_right"
      },
      "pose_cn": "站得瘦小，双手抓着挎包带，头略抬看人，脸上有点怯又有点笑。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "半块红薯"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "weak"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 13-year-old boy, the smallest and thinnest in the unit, messy black hair under an oversized octagonal cap that covers his ears, a narrow hungry face, wide eyes. Oversized grey-green tunic with sleeves rolled several times, loose collar, bare feet or broken straw sandals, a small satchel. Standing small and slight, both hands on the satchel strap, chin lifted, shy but hopeful.",
      "avoid_en": "no adult build, no fitted uniform, no rifle, no boots, no clean face, no extra people, no text"
    },
    "san_wa_ch04_cold": {
      "id": "san_wa_ch04_cold",
      "character": "san_wa",
      "label": "通道冬雨·帽子盖住耳朵",
      "chapters": [
        "ch04"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装被雨打湿，袖子仍卷着，裤脚泥湿，草鞋破口；帽子被小满往下拉，盖住耳朵。",
      "equipment_cn": "过大的八角帽、小挎包、破草鞋。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "缩着肩，双手抱臂，帽檐压到眼睛，嘴唇发白。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "破草鞋"
      ],
      "faces": [
        "calm",
        "sad",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest build, thin face pale with cold, messy black hair under an oversized cap pulled down over his ears. Wet oversized grey-green tunic, sleeves still rolled, muddy trousers, broken straw sandals. Shoulders hunched, both arms hugged across his chest, cap brim at his eyes, lips bloodless.",
      "avoid_en": "no adult build, no warm coat, no rifle, no boots, no smile, no extra people, no text"
    },
    "san_wa_ch07_supply": {
      "id": "san_wa_ch07_supply",
      "character": "san_wa",
      "label": "遵义·有热饭的几天",
      "chapters": [
        "ch07"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装洗过，袖子仍卷着，帽子戴正但依旧大；草鞋换过，脚上还有旧裂口。",
      "equipment_cn": "过大的八角帽、小挎包、新草鞋。",
      "head": {
        "turn": "right 4deg",
        "pitch": "level",
        "gaze": "forward_right"
      },
      "pose_cn": "坐在火边，双手捧碗，肩背放松，脸上有了血色。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "搪瓷碗"
      ],
      "faces": [
        "calm",
        "sad",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest build, thin face with a little colour back, messy black hair under a straightened oversized cap. Washed oversized grey-green tunic, sleeves rolled, newer straw sandals, old cracks still visible on the feet. Seated by a fire holding an enamel bowl with both hands, shoulders relaxed, a small pleased expression.",
      "avoid_en": "no adult build, no fitted uniform, no rifle, no boots, no broad grin, no extra people, no text"
    },
    "san_wa_ch09_longmarch": {
      "id": "san_wa_ch09_longmarch",
      "character": "san_wa",
      "label": "赤水金沙·冻脚与丢鞋",
      "chapters": [
        "ch09",
        "ch10",
        "ch11",
        "ch12"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装褪色，袖子卷着，裤脚泥硬，草鞋只剩一只完整、一只用麻绳绑着；帽檐磨毛。",
      "equipment_cn": "过大的八角帽、小挎包、麻绳绑着的破草鞋。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "坐在泥路边，双手搓着一只冻脚，肩背缩起，眼睛发红。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "麻绳草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest build, thin face pinched with cold, messy black hair under a worn oversized cap. Faded oversized grey-green tunic, sleeves rolled, muddy trousers, one intact straw sandal and one sole lashed on with hemp rope. Sitting at the muddy roadside rubbing a frostbitten foot, shoulders curled, eyes red.",
      "avoid_en": "no adult build, no warm shoes, no rifle, no smile, no clean uniform, no extra people, no text"
    },
    "san_wa_ch13_longmarch": {
      "id": "san_wa_ch13_longmarch",
      "character": "san_wa",
      "label": "彝海到泸定·更瘦了",
      "chapters": [
        "ch13",
        "ch14",
        "ch15"
      ],
      "wear": 4,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "灰绿军装更旧，袖子卷到肘上，裤脚破口，草鞋补过；帽子仍大，脸更瘦。",
      "equipment_cn": "过大的八角帽、小挎包、补过的草鞋；在泸定桥头没有枪。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "站着，双手抓着挎包带，肩背单薄，眼神有点怕但没退。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "补过的草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest build, thinner face, messy black hair under an oversized worn cap. Faded grey-green tunic with sleeves rolled to the elbows, torn trouser cuffs, repaired straw sandals. Standing with both hands on the satchel strap, narrow shoulders, frightened but not retreating.",
      "avoid_en": "no adult build, no rifle, no boots, no clean uniform, no smile, no extra people, no text"
    },
    "san_wa_ch16_snow": {
      "id": "san_wa_ch16_snow",
      "character": "san_wa",
      "label": "雪山草地·割皮带",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "frost",
      "outfit_cn": "灰绿军装单薄结霜，袖子卷着，裤脚用草绳系住，草鞋缠布条；腰带在草地被割去煮汤，改用草绳。",
      "equipment_cn": "过大的八角帽、小挎包、草绳腰带、割短的皮带。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 7deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲在锅边，双手捧着一小段煮软的皮带，肩背缩成一团。",
      "props_cn": [
        "过大的八角帽",
        "草绳腰带",
        "割短的皮带",
        "小挎包"
      ],
      "faces": [
        "calm",
        "smile",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest and thinnest, face hollow and frostbitten, messy black hair under a frost-rimmed oversized cap. Thin grey-green tunic, sleeves rolled, trousers tied at the ankles with straw rope, straw sandals wrapped in cloth. Squatting by a pot, both hands holding a short softened strip of leather, body curled small around it.",
      "avoid_en": "no padded coat, no leather belt at the waist, no rifle, no smile, no healthy weight, no extra people, no text"
    },
    "san_wa_ch17_rope": {
      "id": "san_wa_ch17_rope",
      "character": "san_wa",
      "label": "草地第八天·草绳系裤",
      "chapters": [],
      "wear": 5,
      "dirt": 5,
      "injury": "frost",
      "outfit_cn": "同一身结霜军装，腰间皮带已经割掉，换成一根草绳；裤腰用草绳系着，结打得很粗。",
      "equipment_cn": "过大的八角帽、草绳腰带、空小挎包、割短的皮带段。",
      "head": {
        "turn": "right 3deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "低头把草绳在腰间打了个结，双手冻得发红，肩背缩着。",
      "props_cn": [
        "过大的八角帽",
        "草绳腰带",
        "割短的皮带"
      ],
      "faces": [
        "calm",
        "smile",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest and thinnest, hollow frostbitten face, messy black hair under an oversized frosted cap. Thin grey-green tunic, trousers held by a rough straw rope at the waist, the knot thick and clumsy. Head bent to the rope, hands red with cold, shoulders curled.",
      "avoid_en": "no leather belt, no padded coat, no rifle, no smile, no extra people, no text"
    },
    "san_wa_ch18_lazikou": {
      "id": "san_wa_ch18_lazikou",
      "character": "san_wa",
      "label": "腊子口·手脚都磨破",
      "chapters": [
        "ch18"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "bandaged",
      "outfit_cn": "灰绿军装被黄土和黑灰糊旧，袖口破口，裤脚草绳还在；十个指头六个磨掉皮，裹着布条。",
      "equipment_cn": "过大的八角帽、草绳腰带、半截手榴弹拉线、小挎包。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "坐在石头上，双手藏在膝间，脸上全是黑灰，眼睛很亮。",
      "props_cn": [
        "过大的八角帽",
        "草绳腰带",
        "半截拉线",
        "裹布的手"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest build, face blackened with soot and powder, messy hair under an oversized cap, bright eyes. Grey-green tunic grimed with yellow dust and smoke, torn cuffs, straw rope at the waist, six fingertips wrapped in cloth strips. Sitting on a stone with both hands tucked between his knees, exhausted but alert.",
      "avoid_en": "no clean face, no intact fingertips, no rifle, no smile broadly, no extra people, no text"
    },
    "san_wa_ch18_new_shoes": {
      "id": "san_wa_ch18_new_shoes",
      "character": "san_wa",
      "label": "腊子口·换上懋功的新草鞋",
      "chapters": [],
      "wear": 5,
      "dirt": 5,
      "injury": "bandaged",
      "outfit_cn": "同一身黄土军装，脚上换成一双麻绳编得结实的新草鞋，鞋带系得很紧。",
      "equipment_cn": "过大的八角帽、草绳腰带、懋功新草鞋、小挎包。",
      "head": {
        "turn": "right 3deg",
        "pitch": "up 2deg",
        "gaze": "forward"
      },
      "pose_cn": "坐着把新鞋带系紧，系完抬头看向对面碉堡，脸上有黑灰。",
      "props_cn": [
        "过大的八角帽",
        "草绳腰带",
        "新麻绳草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. 13-year-old boy, smallest build, soot-smudged face, messy hair under an oversized cap. Grey-green tunic dirty with yellow dust, straw rope at the waist, and a new pair of tightly woven hemp-rope straw sandals, laces pulled firm. Seated after tying them, head lifting toward a concrete pillbox off frame, tired eyes steady.",
      "avoid_en": "no old broken sandals, no clean uniform, no rifle, no smile, no extra people, no text"
    },
    "san_wa_ch19_north": {
      "id": "san_wa_ch19_north",
      "character": "san_wa",
      "label": "哈达铺·一只新布鞋",
      "chapters": [
        "ch19"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，袖子不再卷得那么高，腰间仍是草绳但系得整齐；脚上一只新黑布鞋、一只旧草鞋。",
      "equipment_cn": "过大的八角帽、小挎包、一只新黑布鞋、一只旧草鞋。",
      "head": {
        "turn": "left 4deg",
        "pitch": "up 3deg",
        "gaze": "forward_left"
      },
      "pose_cn": "站着，一只脚穿新鞋一只脚穿草鞋，低头看鞋，脸上有点舍不得的笑。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "新黑布鞋",
        "旧草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 14-year-old boy, still short and slight, roundish face beginning to lengthen, messy black hair under an oversized cap that still sits low. Washed grey-green tunic, sleeves rolled less, straw rope belt neat, one new black cloth shoe on one foot and one old straw sandal on the other. He looks down at the mismatched shoes with a reluctant, pleased smile.",
      "avoid_en": "no adult height, no fitted cap, no rifle, no clean new uniform, no extra people, no text"
    },
    "san_wa_ch20_huining": {
      "id": "san_wa_ch20_huining",
      "character": "san_wa",
      "label": "会宁·十五岁，旧布鞋留一只",
      "chapters": [
        "ch20"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰绿军装洗净，袖子卷得少了，腰间仍是草绳；脚上一双旧布鞋，其中一只已经穿烂、被他收在怀里。",
      "equipment_cn": "过大的八角帽、小挎包、一双旧布鞋、一只穿烂的旧布鞋。",
      "head": {
        "turn": "right 3deg",
        "pitch": "level",
        "gaze": "forward"
      },
      "pose_cn": "站在火堆边，右手从怀里摸出那只穿烂的旧布鞋，低头看，脸上带笑。",
      "props_cn": [
        "过大的八角帽",
        "小挎包",
        "旧布鞋"
      ],
      "faces": [
        "calm",
        "smile"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A 15-year-old boy, still short but with a longer, less round face, messy black hair under an oversized cap. Washed grey-green tunic, sleeves rolled less, straw rope belt neat, a worn pair of cloth shoes on his feet. He holds one worn-out old cloth shoe in his hand, looking down at it with a soft smile.",
      "avoid_en": "no adult height, no fitted cap, no rifle, no clean new uniform, no extra people, no text"
    },
    "san_wa_ch17_grassland": {
      "id": "san_wa_ch17_grassland",
      "character": "san_wa",
      "label": "草地·冷湿与饥饿",
      "chapters": [
        "ch17"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "过大旧军装被泥水浸透，袖子卷起，草绳腰带，草鞋包布；没有雪和锅。",
      "equipment_cn": "过大的八角帽、小挎包、草绳腰带、割短的皮带。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 7deg",
        "gaze": "down_left"
      },
      "pose_cn": "蹲在锅边，双手捧着一小段煮软的皮带，肩背缩成一团。",
      "props_cn": [
        "过大的八角帽",
        "草绳腰带",
        "割短的皮带",
        "小挎包"
      ],
      "faces": [
        "calm",
        "weak",
        "smile",
        "worry",
        "dawn"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. The same small thin thirteen-year-old boy, oversized octagonal cap, messy black hair. Oversized grey-green tunic soaked and mud-stained, sleeves rolled, rope belt, cloth-wrapped feet, hollow cheeks and exhausted eyes from the grassland. No snow, no frost, no cooking pot, no padded coat.",
      "avoid_en": "no snow, no frost, no cooking pot, no padded coat, no clean uniform, no extra people, no text"
    },
    "soldiers_ch01_early": {
      "id": "soldiers_ch01_early",
      "character": "soldiers",
      "label": "出发初期·三个人三种旧",
      "chapters": [
        "ch01",
        "ch02",
        "ch03",
        "ch04"
      ],
      "wear": 2,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "三名红军战士并排：一人高瘦、军装肩头补过；一人矮壮、绑腿泥重；一人年轻、帽子略大。三人磨损程度不同。",
      "equipment_cn": "八角帽、步枪、弹药带、草鞋；一人背着旧布包。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "三人并排站立，一人扶枪带，一人双手垂着，一人把帽檐压低，姿态各不相同。",
      "props_cn": [
        "八角帽",
        "步枪",
        "弹药带",
        "草鞋"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Three Red Army soldiers in a tight staggered row, 600x900 half-body group portrait, transparent background, low-poly faceted planes, hard light from upper left. All three full heads, shoulders, chests, arms and held rifles are completely inside the image with clear margins; nobody is clipped by any edge. Make the group larger in frame and tightly overlapping shoulder to shoulder: one tall lean soldier with a sleeve patch at the left rear, one short broad soldier in the center foreground, one younger soldier at the right rear. Every face is fully visible; their heights, ages, face shapes and degrees of uniform wear differ. Exactly three people, no fourth person.",
      "avoid_en": "no cropped head, no cropped shoulder, no half-visible person, no figures touching the canvas edge, no fourth person, no identical faces, no tiny distant group, no text"
    },
    "soldiers_ch06_supply": {
      "id": "soldiers_ch06_supply",
      "character": "soldiers",
      "label": "猴场遵义·洗净与补鞋",
      "chapters": [
        "ch06",
        "ch07"
      ],
      "wear": 2,
      "dirt": 1,
      "injury": "none",
      "outfit_cn": "三名战士的军装都洗过，补丁仍在但干净；一人换了新草鞋，一人袖口补过，一人帽檐刷净。磨损仍旧各不相同。",
      "equipment_cn": "八角帽、步枪、弹药带、新草鞋。",
      "head": {
        "turn": "right 5deg",
        "pitch": "level",
        "gaze": "forward_right"
      },
      "pose_cn": "三人坐着补鞋、擦枪、写家信，各自低头做不同的事。",
      "props_cn": [
        "八角帽",
        "步枪",
        "新草鞋",
        "家信"
      ],
      "faces": [
        "calm",
        "smile",
        "worry",
        "weak",
        "dawn"
      ],
      "appearance_en": "Three Red Army soldiers seated together, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct men: a lean older one mending a shoe, a broad one cleaning a rifle, a young one writing a letter. Washed grey-green tunics with kept patches, one new pair of straw sandals, one repaired cuff, one brushed cap. Different faces, ages and wear levels, quiet rest after a long march.",
      "avoid_en": "no identical faces, no identical uniforms, no three clones, no clean new tunics, no text"
    },
    "soldiers_ch09_longmarch": {
      "id": "soldiers_ch09_longmarch",
      "character": "soldiers",
      "label": "赤水金沙·泥与汗",
      "chapters": [
        "ch09",
        "ch10",
        "ch11",
        "ch12"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "exhausted",
      "outfit_cn": "三名战士的红泥、汗渍和破口各不相同：一人袖口撕裂，一人绑腿用麻绳加固，一人帽子被雨压塌。",
      "equipment_cn": "八角帽、步枪、弹药带、补过的草鞋。",
      "head": {
        "turn": "left 5deg",
        "pitch": "down 3deg",
        "gaze": "down_left"
      },
      "pose_cn": "三人行军后站定，一人拄枪，一人扶帽，一人低头看脚，肩背都疲惫。",
      "props_cn": [
        "八角帽",
        "步枪",
        "弹药带",
        "麻绳绑腿"
      ],
      "faces": [
        "calm",
        "fierce",
        "dawn"
      ],
      "appearance_en": "Three Red Army soldiers halted after a march, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct men with different red mud patterns and damage: one torn cuff, one puttee reinforced with hemp cord, one rain-collapsed cap. Grey-green tunics faded and dirty, ammunition pouches, repaired straw sandals, one soldier leaning on a rifle, one holding his cap, one looking down at his feet.",
      "avoid_en": "no identical faces, no identical uniforms, no three clones, no clean clothes, no text"
    },
    "soldiers_ch16_snow": {
      "id": "soldiers_ch16_snow",
      "character": "soldiers",
      "label": "雪山草地腊子口·冻伤与绷带",
      "chapters": [
        "ch16"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "frost",
      "outfit_cn": "三名战士单衣结霜，磨损各不相同：一人肩上披破毯，一人手指缠布，一人裤脚用草绳扎住；都没有棉衣。",
      "equipment_cn": "八角帽、步枪、破毯、草绳、绷带。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "三人挤在一起顶风，一人扶伤员，一人抱枪，一人把破毯往同伴肩上拉。",
      "props_cn": [
        "八角帽",
        "步枪",
        "破毯",
        "绷带"
      ],
      "faces": [
        "calm",
        "sad",
        "worry",
        "fierce",
        "weak",
        "dawn"
      ],
      "appearance_en": "Three Red Army soldiers pressed together against the wind, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct frostbitten men in thin frosted tunics of a single layer: one with a torn blanket over the shoulders, one with cloth-wrapped fingers, one with trousers tied at the ankles by straw rope. Rifles, rough bandages, different gaunt faces, one steadying a comrade.",
      "avoid_en": "no padded coats, no identical faces, no three clones, no clean cloth, no text"
    },
    "soldiers_ch20_huining": {
      "id": "soldiers_ch20_huining",
      "character": "soldiers",
      "label": "会宁·两双不同的鞋",
      "chapters": [
        "ch20"
      ],
      "wear": 3,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "三名战士军装洗净但仍是旧布，一人领到毛袜，一人穿新布鞋，一人仍穿草鞋；磨损与补给状态不同。",
      "equipment_cn": "八角帽、步枪、毛袜、布鞋或草鞋。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "三人站在会师人群中，一人把毛袜贴在脸上，一人低头看鞋，一人抬手挥帽。",
      "props_cn": [
        "八角帽",
        "步枪",
        "毛袜",
        "布鞋"
      ],
      "faces": [
        "calm"
      ],
      "appearance_en": "Three Red Army soldiers in a meeting crowd, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct men with washed but old grey-green tunics: one holding knitted wool socks to his cheek, one looking down at new cloth shoes, one waving his cap. Different faces, ages and wear, rifles slung, a mix of straw sandals, cloth shoes and wool socks.",
      "avoid_en": "no identical faces, no three clones, no new uniforms, no modern clothing, no text"
    },
    "soldiers_ch17_18_coldwet": {
      "id": "soldiers_ch17_18_coldwet",
      "character": "soldiers",
      "label": "草地与腊子口·冷湿三人组",
      "chapters": [
        "ch17",
        "ch18"
      ],
      "wear": 5,
      "dirt": 5,
      "injury": "exhausted",
      "outfit_cn": "三名战士的旧军装都被泥水浸透，磨损位置不同；没有积雪和厚毯。",
      "equipment_cn": "八角帽、步枪、破毯、草绳、绷带。",
      "head": {
        "turn": "right 4deg",
        "pitch": "down 6deg",
        "gaze": "down_right"
      },
      "pose_cn": "三人挤在一起顶风，一人扶伤员，一人抱枪，一人把破毯往同伴肩上拉。",
      "props_cn": [
        "八角帽",
        "步枪",
        "破毯",
        "绷带"
      ],
      "faces": [
        "calm",
        "dawn",
        "fierce",
        "weak",
        "sad",
        "worry"
      ],
      "appearance_en": "Three Red Army soldiers standing shoulder to shoulder, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Clearly different men: tall and lean with a shoulder patch, short and broad with mud-caked puttees, young with an oversized cap. All three tunics are soaked with cold mud, torn at different seams, no snow and no frost, no blankets and no padded coats. Rifles and packs differ; exhaustion is shared but their faces and builds remain distinct.",
      "avoid_en": "no snow, no frost, no thick blankets, no padded coats, no identical faces, no fourth person, no text"
    },
    "villagers_ch01_yudu": {
      "id": "villagers_ch01_yudu",
      "character": "villagers",
      "label": "于都·白墙黑瓦下的三个人",
      "chapters": [
        "ch01",
        "ch02"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "三名江西乡亲：老人戴深色头巾、穿土黄粗布衫、拄拐；中年妇女穿蓝布大襟衫、系围裙；孩子穿改小的旧衣。",
      "equipment_cn": "拐棍、竹篮、门板、草鞋。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "三人站在河边，老人扶拐，妇女抱着竹篮，孩子躲在妇女身后。",
      "props_cn": [
        "拐棍",
        "竹篮",
        "门板",
        "草鞋"
      ],
      "faces": [
        "calm",
        "sad",
        "worry",
        "dawn"
      ],
      "appearance_en": "Three Jiangxi villagers standing together, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Clearly different people: an old man with a dark headwrap, ochre coarse jacket and cane; a middle-aged woman in a blue front-opening jacket and apron; a small child in a cut-down old coat. Straw sandals, a bamboo basket, a door plank nearby, riverbank dust, three distinct faces and ages.",
      "avoid_en": "no identical faces, no three clones, no military uniform, no modern clothing, no text"
    },
    "villagers_ch04_guizhou": {
      "id": "villagers_ch04_guizhou",
      "character": "villagers",
      "label": "黔滇山村·补丁与靛蓝",
      "chapters": [
        "ch04",
        "ch06",
        "ch07",
        "ch08",
        "ch09",
        "ch11",
        "ch12"
      ],
      "wear": 3,
      "dirt": 3,
      "injury": "none",
      "outfit_cn": "三名贵州/云南乡亲：老人头巾换成深靛蓝布，妇女蓝布衫补丁更多，孩子衣短了一截；衣料粗粝，草鞋旧。",
      "equipment_cn": "拐棍、竹篮、背篓、柴刀。",
      "head": {
        "turn": "left 4deg",
        "pitch": "down 4deg",
        "gaze": "down_left"
      },
      "pose_cn": "三人站在山寨路边，老人扶拐，妇女背竹篓，孩子抓着妇女衣角。",
      "props_cn": [
        "拐棍",
        "背篓",
        "柴刀",
        "草鞋"
      ],
      "faces": [
        "calm",
        "smile",
        "sad",
        "worry",
        "dawn"
      ],
      "appearance_en": "Three Guizhou-Yunnan mountain villagers, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct people: an old man with a deep indigo headwrap and cane, a woman in a patched blue jacket with a bamboo back basket, a child in a too-short coarse coat clutching her hem. Rough cloth, straw sandals, a small sickle at the basket, mountain dust and different faces.",
      "avoid_en": "no identical faces, no three clones, no military uniform, no clean modern clothing, no text"
    },
    "villagers_ch14_sichuan": {
      "id": "villagers_ch14_sichuan",
      "character": "villagers",
      "label": "川西北·蓑衣与湿衣",
      "chapters": [
        "ch14",
        "ch15",
        "ch16"
      ],
      "wear": 3,
      "dirt": 4,
      "injury": "none",
      "outfit_cn": "三名川西北乡亲：老人披破蓑衣、戴斗笠，妇女蓝布衫外罩旧围裙，孩子裹着过大的旧衣；衣摆湿重。",
      "equipment_cn": "斗笠、蓑衣、竹篮、拐棍。",
      "head": {
        "turn": "right 5deg",
        "pitch": "down 3deg",
        "gaze": "down_right"
      },
      "pose_cn": "三人站在雨里，老人压着斗笠，妇女把竹篮抱在胸前，孩子缩在蓑衣下。",
      "props_cn": [
        "斗笠",
        "蓑衣",
        "竹篮",
        "拐棍"
      ],
      "faces": [
        "calm",
        "stern",
        "sad",
        "worry"
      ],
      "appearance_en": "Three Sichuan-border villagers in rain, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct people: an old man under a torn straw rain cape and bamboo hat, a woman in a blue jacket and old apron holding a basket, a child wrapped in an oversized old coat. Wet heavy hems, straw sandals, rain-darkened cloth, different weathered faces.",
      "avoid_en": "no identical faces, no three clones, no military uniform, no clean dry clothing, no text"
    },
    "villagers_ch19_north": {
      "id": "villagers_ch19_north",
      "character": "villagers",
      "label": "陕北·白羊肚手巾与热馍",
      "chapters": [
        "ch19",
        "ch20"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "三名陕北乡亲：老人头扎白羊肚手巾、穿深色棉袄，妇女穿蓝布棉袄、系围裙，孩子戴毛线帽、穿厚棉裤；衣上有黄土但暖和。",
      "equipment_cn": "白羊肚手巾、柳条筐、黄米馍馍、毛线针。",
      "head": {
        "turn": "left 3deg",
        "pitch": "up 2deg",
        "gaze": "forward_left"
      },
      "pose_cn": "三人站在城门口，老人提着柳条筐，妇女把热馍馍递出去，孩子仰头看。",
      "props_cn": [
        "白羊肚手巾",
        "柳条筐",
        "黄米馍馍",
        "毛线针"
      ],
      "faces": [
        "calm",
        "smile",
        "sad"
      ],
      "appearance_en": "Three northern Shaanxi villagers at a town gate, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Three distinct people: an old man with a white sheepskin towel wrapped around his head and a dark padded jacket, a woman in a blue padded jacket and apron, a child in a wool hat and thick padded trousers. A willow basket of warm yellow-millet buns, knitting needles, yellow earth dust on warm clothing, kind weathered faces.",
      "avoid_en": "no identical faces, no three clones, no thin summer clothing, no military uniform, no modern clothing, no text"
    },
    "yi_people_ch13_yihai": {
      "id": "yi_people_ch13_yihai",
      "character": "yi_people",
      "label": "冕宁土牢·被关押的人",
      "chapters": [
        "ch13"
      ],
      "wear": 2,
      "dirt": 4,
      "injury": "old_wound",
      "outfit_cn": "三名彝族同胞：一人年老、长发遮脸、披毡破烂；一人年轻、黑布头帕歪斜；一人高瘦、赤脚，脚踝有木枷磨痕。衣上湿泥与稻草。",
      "equipment_cn": "破披毡、黑布头帕、银饰残片、稻草。",
      "head": {
        "turn": "right 6deg",
        "pitch": "down 5deg",
        "gaze": "down_right"
      },
      "pose_cn": "三人蹲在土牢墙根，老人抱着一块石头，年轻人扶着墙，高瘦者赤脚站着。",
      "props_cn": [
        "破披毡",
        "黑布头帕",
        "银饰残片",
        "石头"
      ],
      "faces": [
        "calm",
        "sad"
      ],
      "appearance_en": "Three Yi people in a earthen jail, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. Clearly different people: an old man with long matted hair and a torn dark indigo felt cloak, a younger man with a crooked black turban, a tall thin man barefoot with shackle marks at the ankles. Wet mud and straw on their clothes, faded silver ornaments, one old man clutching a stone, three distinct gaunt faces.",
      "avoid_en": "no identical faces, no three clones, no Han military uniform, no clean clothing, no extra people, no text"
    },
    "yi_people_ch13_freed": {
      "id": "yi_people_ch13_freed",
      "character": "yi_people",
      "label": "铁链砸断之后·站起来的人",
      "chapters": [],
      "wear": 2,
      "dirt": 3,
      "injury": "old_wound",
      "outfit_cn": "同一批彝族同胞，披毡重新拢起，头帕扶正，脚踝木枷已去但磨痕仍在；老人把石头留在门槛上。",
      "equipment_cn": "破披毡、黑布头帕、银饰残片。",
      "head": {
        "turn": "left 4deg",
        "pitch": "level",
        "gaze": "forward_left"
      },
      "pose_cn": "三人站起来，老人空着手，年轻人扶着门框，高瘦者第一次抬头看门外。",
      "props_cn": [
        "破披毡",
        "黑布头帕",
        "银饰残片"
      ],
      "faces": [
        "calm",
        "sad"
      ],
      "appearance_en": "The same three Yi people standing free, 600x900 half-body group, transparent background, low-poly faceted planes, hard light from upper left. An old man with long hair and torn indigo cloak now empty-handed, a younger man with a straightened black turban, a tall thin man with shackle marks on free ankles, all three standing. Cloaks gathered, heads lifted toward the door, dirt and straw still on their clothes, cautious hope on three distinct faces.",
      "avoid_en": "no shackles, no identical faces, no three clones, no Han uniform, no clean clothing, no text"
    },
    "narrator_all": {
      "id": "narrator_all",
      "character": "narrator",
      "label": "历史风尘中的无名背影",
      "chapters": [
        "ch01",
        "ch02",
        "ch03",
        "ch04",
        "ch05",
        "ch06",
        "ch07",
        "ch08",
        "ch09",
        "ch10",
        "ch11",
        "ch12",
        "ch13",
        "ch14",
        "ch15",
        "ch16",
        "ch17",
        "ch18",
        "ch19",
        "ch20"
      ],
      "wear": 2,
      "dirt": 2,
      "injury": "none",
      "outfit_cn": "灰色长衫，衣摆向下化为层层尘土色的刻面；深兜帽遮住整张脸，没有五官、领章或任何军队标识。",
      "equipment_cn": "深兜帽、灰色长衫；无手持物。",
      "head": {
        "turn": "center",
        "pitch": "down 2deg",
        "gaze": "none"
      },
      "pose_cn": "双肩平齐，双手拢在袖中，站姿安静，像从历史风尘里看过来的一个背影。",
      "props_cn": [
        "深兜帽",
        "灰色长衫"
      ],
      "faces": [
        "calm",
        "sad",
        "fierce"
      ],
      "appearance_en": "Single figure, 600x900 half-body bust, transparent background, low-poly faceted planes, hard light from upper left. A faceless abstract figure in a plain grey long gown that breaks into layered dust-grey facets at the hem, the face completely hidden under a deep hood. The hood conceals the whole face; the gown is plain and unmarked; both hands rest hidden in the sleeves; shoulders level, still and impersonal like a figure seen through historical dust.",
      "avoid_en": "no face, no eyes, no mouth, no military uniform, no rifle, no specific historical person, no text"
    }
  },
  "chapterStates": {
    "ch01": {
      "mao": "mao_ch01_ill",
      "zhou": "zhou_ch01_start",
      "peng": "peng_ch01_start",
      "chen_yun": "chen_yun_ch01_start",
      "he_zizhen": "he_zizhen_ch01_start",
      "xu_teli": "xu_teli_ch01_start",
      "dong_biwu": "dong_biwu_ch01_start",
      "lin_boqu": "lin_boqu_ch01_start",
      "xie_juezai": "xie_juezai_ch01_start",
      "xiaoman": "xiaoman_ch01_departure",
      "li_tiezhu": "li_tiezhu_ch01_start",
      "he_xiaomei": "he_xiaomei_ch01_start",
      "guo_daniang": "guo_daniang_ch01_yudu",
      "shi_zhu": "shi_zhu_ch01_start",
      "wu_laoliu": "wu_laoliu_ch01_start",
      "san_wa": "san_wa_ch01_start",
      "soldiers": "soldiers_ch01_early",
      "villagers": "villagers_ch01_yudu",
      "narrator": "narrator_all"
    },
    "ch02": {
      "mao": "mao_ch01_ill",
      "zhou": "zhou_ch01_start",
      "zhu": "zhu_ch02_start",
      "bogu": "bogu_ch02_start",
      "lide": "lide_ch02_confident",
      "peng": "peng_ch01_start",
      "lin": "lin_ch02_start",
      "nie": "nie_ch02_start",
      "liu_bocheng": "liu_bocheng_ch02_start",
      "xu_teli": "xu_teli_ch01_start",
      "xie_juezai": "xie_juezai_ch01_start",
      "xiaoman": "xiaoman_ch02_rain",
      "li_tiezhu": "li_tiezhu_ch01_start",
      "he_xiaomei": "he_xiaomei_ch01_start",
      "shi_zhu": "shi_zhu_ch01_start",
      "wu_laoliu": "wu_laoliu_ch01_start",
      "san_wa": "san_wa_ch01_start",
      "soldiers": "soldiers_ch01_early",
      "villagers": "villagers_ch01_yudu",
      "narrator": "narrator_all"
    },
    "ch03": {
      "mao": "mao_ch03_xiangjiang",
      "zhou": "zhou_ch03_xiangjiang",
      "zhu": "zhu_ch02_start",
      "peng": "peng_ch01_start",
      "lin": "lin_ch02_start",
      "nie": "nie_ch02_start",
      "liu_bocheng": "liu_bocheng_ch02_start",
      "he_zizhen": "he_zizhen_ch03_xiangjiang",
      "deng_yingchao": "deng_yingchao_ch03_ill",
      "xie_juezai": "xie_juezai_ch01_start",
      "ye_jianying": "ye_jianying_ch03_early",
      "xiaoman": "xiaoman_ch03_xiangjiang",
      "li_tiezhu": "li_tiezhu_ch03_xiangjiang",
      "he_xiaomei": "he_xiaomei_ch03_xiangjiang",
      "wu_laoliu": "wu_laoliu_ch03_xiangjiang",
      "san_wa": "san_wa_ch01_start",
      "soldiers": "soldiers_ch01_early",
      "narrator": "narrator_all"
    },
    "ch04": {
      "mao": "mao_ch04_tongdao",
      "zhou": "zhou_ch04_tongdao",
      "zhu": "zhu_ch04_tongdao",
      "zhang_wentian": "zhang_wentian_ch04_tongdao",
      "wang_jiaxiang": "wang_jiaxiang_ch04_stretcher",
      "bogu": "bogu_ch04_tongdao",
      "lide": "lide_ch04_shaken",
      "deng_yingchao": "deng_yingchao_ch04_guizhou",
      "xie_juezai": "xie_juezai_ch01_start",
      "ye_jianying": "ye_jianying_ch03_early",
      "xiaoman": "xiaoman_ch04_walk",
      "li_tiezhu": "li_tiezhu_ch03_xiangjiang",
      "he_xiaomei": "he_xiaomei_ch03_xiangjiang",
      "a_yue": "a_yue_ch04_guide",
      "wu_laoliu": "wu_laoliu_ch03_xiangjiang",
      "san_wa": "san_wa_ch04_cold",
      "soldiers": "soldiers_ch01_early",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch05": {
      "mao": "mao_ch04_tongdao",
      "zhou": "zhou_ch04_tongdao",
      "zhu": "zhu_ch04_tongdao",
      "zhang_wentian": "zhang_wentian_ch04_tongdao",
      "wang_jiaxiang": "wang_jiaxiang_ch04_stretcher",
      "bogu": "bogu_ch04_tongdao",
      "lide": "lide_ch04_shaken",
      "xie_juezai": "xie_juezai_ch01_start",
      "xiaoman": "xiaoman_ch04_walk",
      "li_tiezhu": "li_tiezhu_ch03_xiangjiang",
      "he_xiaomei": "he_xiaomei_ch03_xiangjiang",
      "wu_laoliu": "wu_laoliu_ch03_xiangjiang",
      "narrator": "narrator_all"
    },
    "ch06": {
      "mao": "mao_ch06_houchang",
      "zhou": "zhou_ch06_zunyi",
      "zhu": "zhu_ch06_zunyi",
      "lide": "lide_ch07_zunyi",
      "liu_bocheng": "liu_bocheng_ch06_zunyi",
      "xu_teli": "xu_teli_ch06_houchang",
      "xie_juezai": "xie_juezai_ch06_houchang",
      "xiaoman": "xiaoman_ch06_supply",
      "li_tiezhu": "li_tiezhu_ch06_supply",
      "he_xiaomei": "he_xiaomei_ch06_supply",
      "wu_laoliu": "wu_laoliu_ch06_supply",
      "soldiers": "soldiers_ch06_supply",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch07": {
      "mao": "mao_ch06_houchang",
      "zhou": "zhou_ch06_zunyi",
      "zhu": "zhu_ch06_zunyi",
      "zhang_wentian": "zhang_wentian_ch07_zunyi",
      "wang_jiaxiang": "wang_jiaxiang_ch07_zunyi",
      "bogu": "bogu_ch07_zunyi",
      "lide": "lide_ch07_zunyi",
      "peng": "peng_ch07_zunyi",
      "nie": "nie_ch07_zunyi",
      "liu_bocheng": "liu_bocheng_ch06_zunyi",
      "chen_yun": "chen_yun_ch07_supply",
      "xiaoman": "xiaoman_ch06_supply",
      "li_tiezhu": "li_tiezhu_ch06_supply",
      "he_xiaomei": "he_xiaomei_ch07_supply",
      "wu_laoliu": "wu_laoliu_ch06_supply",
      "san_wa": "san_wa_ch07_supply",
      "soldiers": "soldiers_ch06_supply",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch08": {
      "mao": "mao_ch08_chishui",
      "zhou": "zhou_ch08_chishui",
      "zhu": "zhu_ch08_tucheng",
      "peng": "peng_ch07_zunyi",
      "liu_bocheng": "liu_bocheng_ch06_zunyi",
      "xiaoman": "xiaoman_ch08_chishui",
      "he_xiaomei": "he_xiaomei_ch08_chishui",
      "shi_zhu": "shi_zhu_ch08_before",
      "wu_laoliu": "wu_laoliu_ch08_chishui",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch09": {
      "mao": "mao_ch08_chishui",
      "zhou": "zhou_ch08_chishui",
      "zhang_wentian": "zhang_wentian_ch09_late",
      "peng": "peng_ch07_zunyi",
      "liu_bocheng": "liu_bocheng_ch06_zunyi",
      "chen_yun": "chen_yun_ch09_reorg",
      "lin_boqu": "lin_boqu_ch09_supply",
      "xiaoman": "xiaoman_ch08_chishui",
      "li_tiezhu": "li_tiezhu_ch09_longmarch",
      "he_xiaomei": "he_xiaomei_ch08_chishui",
      "shi_zhu": "shi_zhu_ch09_wounded",
      "wu_laoliu": "wu_laoliu_ch08_chishui",
      "san_wa": "san_wa_ch09_longmarch",
      "soldiers": "soldiers_ch09_longmarch",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch10": {
      "mao": "mao_ch08_chishui",
      "zhou": "zhou_ch08_chishui",
      "zhu": "zhu_ch08_tucheng",
      "peng": "peng_ch07_zunyi",
      "lin": "lin_ch10_loushan",
      "xiaoman": "xiaoman_ch08_chishui",
      "li_tiezhu": "li_tiezhu_ch09_longmarch",
      "he_xiaomei": "he_xiaomei_ch08_chishui",
      "shi_zhu": "shi_zhu_ch09_wounded",
      "wu_laoliu": "wu_laoliu_ch08_chishui",
      "san_wa": "san_wa_ch09_longmarch",
      "soldiers": "soldiers_ch09_longmarch",
      "narrator": "narrator_all"
    },
    "ch11": {
      "mao": "mao_ch08_chishui",
      "zhou": "zhou_ch08_chishui",
      "liu_bocheng": "liu_bocheng_ch12_jinsha",
      "ye_jianying": "ye_jianying_ch11_chishui",
      "xiaoman": "xiaoman_ch08_chishui",
      "li_tiezhu": "li_tiezhu_ch09_longmarch",
      "he_xiaomei": "he_xiaomei_ch08_chishui",
      "shi_zhu": "shi_zhu_ch09_wounded",
      "wu_laoliu": "wu_laoliu_ch08_chishui",
      "san_wa": "san_wa_ch09_longmarch",
      "soldiers": "soldiers_ch09_longmarch",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch14": {
      "mao": "mao_ch14_dadu",
      "zhou": "zhou_ch14_dadu",
      "zhu": "zhu_ch14_dadu",
      "liu_bocheng": "liu_bocheng_ch14_dadu",
      "xiaoman": "xiaoman_ch12_longmarch",
      "li_tiezhu": "li_tiezhu_ch14_wet",
      "he_xiaomei": "he_xiaomei_ch12_longmarch",
      "shi_zhu": "shi_zhu_ch14_dadu",
      "wu_laoliu": "wu_laoliu_ch12_longmarch",
      "san_wa": "san_wa_ch13_longmarch",
      "villagers": "villagers_ch14_sichuan",
      "narrator": "narrator_all"
    },
    "ch16": {
      "mao": "mao_ch16_snow",
      "zhou": "zhou_ch16_snow",
      "zhu": "zhu_ch16_snow",
      "xu_teli": "xu_teli_ch16_snow",
      "lin_boqu": "lin_boqu_ch16_late",
      "xie_juezai": "xie_juezai_ch16_snow",
      "xiaoman": "xiaoman_ch16_snow",
      "li_tiezhu": "li_tiezhu_ch16_snow",
      "he_xiaomei": "he_xiaomei_ch16_snow",
      "wu_laoliu": "wu_laoliu_ch16_snow",
      "san_wa": "san_wa_ch16_snow",
      "soldiers": "soldiers_ch16_snow",
      "villagers": "villagers_ch14_sichuan",
      "narrator": "narrator_all"
    },
    "ch17": {
      "mao": "mao_ch17_18_coldwet",
      "zhou": "zhou_ch17_coldwet",
      "zhu": "zhu_ch17_18_coldwet",
      "peng": "peng_ch17_late",
      "lin_boqu": "lin_boqu_ch17_grassland",
      "xie_juezai": "xie_juezai_ch17_18_coldwet",
      "ye_jianying": "ye_jianying_ch17_late",
      "zhang_guotao": "zhang_guotao_ch17_maogong",
      "xu_xiangqian": "xu_xiangqian_ch17_maogong",
      "li_xiannian": "li_xiannian_ch17_maogong",
      "xiaoman": "xiaoman_ch17_grassland",
      "li_tiezhu": "li_tiezhu_ch17_grassland",
      "he_xiaomei": "he_xiaomei_ch17_18_coldwet",
      "wu_laoliu": "wu_laoliu_ch17_18_coldwet",
      "san_wa": "san_wa_ch17_grassland",
      "soldiers": "soldiers_ch17_18_coldwet",
      "narrator": "narrator_all"
    },
    "ch18": {
      "mao": "mao_ch17_18_coldwet",
      "zhu": "zhu_ch17_18_coldwet",
      "peng": "peng_ch17_late",
      "lin": "lin_ch18_lazikou",
      "nie": "nie_ch18_lazikou",
      "xie_juezai": "xie_juezai_ch17_18_coldwet",
      "xiaoman": "xiaoman_ch18_lazikou",
      "he_xiaomei": "he_xiaomei_ch17_18_coldwet",
      "a_yue": "a_yue_ch18_cliff",
      "wu_laoliu": "wu_laoliu_ch17_18_coldwet",
      "san_wa": "san_wa_ch18_lazikou",
      "soldiers": "soldiers_ch17_18_coldwet",
      "narrator": "narrator_all"
    },
    "ch19": {
      "mao": "mao_ch19_wuqi",
      "zhou": "zhou_ch19_wuqi",
      "zhang_wentian": "zhang_wentian_ch19_wuqi",
      "peng": "peng_ch17_late",
      "xu_teli": "xu_teli_ch19_wuqi",
      "xiaoman": "xiaoman_ch19_wuqi",
      "he_xiaomei": "he_xiaomei_ch19_north",
      "a_yue": "a_yue_ch19_farewell",
      "wu_laoliu": "wu_laoliu_ch19_north",
      "san_wa": "san_wa_ch19_north",
      "villagers": "villagers_ch19_north",
      "narrator": "narrator_all"
    },
    "ch12": {
      "zhou": "zhou_ch12_jinsha",
      "liu_bocheng": "liu_bocheng_ch12_jinsha",
      "lin_boqu": "lin_boqu_ch12_jinsha",
      "xiaoman": "xiaoman_ch12_longmarch",
      "li_tiezhu": "li_tiezhu_ch09_longmarch",
      "he_xiaomei": "he_xiaomei_ch12_longmarch",
      "wu_laoliu": "wu_laoliu_ch12_longmarch",
      "san_wa": "san_wa_ch09_longmarch",
      "soldiers": "soldiers_ch09_longmarch",
      "villagers": "villagers_ch04_guizhou",
      "narrator": "narrator_all"
    },
    "ch20": {
      "zhu": "zhu_ch20_huining",
      "zhang_guotao": "zhang_guotao_ch20_huining",
      "xiaoman": "xiaoman_ch20_huining",
      "he_xiaomei": "he_xiaomei_ch20_huining",
      "wu_laoliu": "wu_laoliu_ch19_north",
      "san_wa": "san_wa_ch20_huining",
      "soldiers": "soldiers_ch20_huining",
      "villagers": "villagers_ch19_north",
      "narrator": "narrator_all"
    },
    "ch13": {
      "nie": "nie_ch13_yihai",
      "liu_bocheng": "liu_bocheng_ch13_yihai",
      "xiao_yedan": "xiao_yedan_ch13_yihai",
      "xiaoman": "xiaoman_ch12_longmarch",
      "he_xiaomei": "he_xiaomei_ch12_longmarch",
      "shi_zhu": "shi_zhu_ch09_wounded",
      "wu_laoliu": "wu_laoliu_ch12_longmarch",
      "san_wa": "san_wa_ch13_longmarch",
      "yi_people": "yi_people_ch13_yihai",
      "narrator": "narrator_all"
    },
    "ch15": {
      "ye_jianying": "ye_jianying_ch11_chishui",
      "xiaoman": "xiaoman_ch12_longmarch",
      "li_tiezhu": "li_tiezhu_ch14_wet",
      "he_xiaomei": "he_xiaomei_ch12_longmarch",
      "shi_zhu": "shi_zhu_ch15_luding",
      "wu_laoliu": "wu_laoliu_ch12_longmarch",
      "san_wa": "san_wa_ch13_longmarch",
      "villagers": "villagers_ch14_sichuan",
      "narrator": "narrator_all"
    }
  },
  "beats": [
    {
      "character": "zhu",
      "chapter": "ch08",
      "after_text": "朱德从外面走进来，把帽子往桌上一放。",
      "portraitId": "zhu_ch08_nocap"
    },
    {
      "character": "liu_bocheng",
      "chapter": "ch13",
      "after_text": "刘伯承把那串银饰戴在脖子上，扣好。",
      "portraitId": "liu_bocheng_ch13_necklace"
    },
    {
      "character": "xu_teli",
      "chapter": "ch16",
      "after_text": "（把自己的绑腿解下来，一圈一圈缠上去）",
      "portraitId": "xu_teli_ch16_bare_legs"
    },
    {
      "character": "xiao_yedan",
      "chapter": "ch13",
      "after_text": "他伸手，从自己脖子上解下一串银饰，塞到刘伯承手里。",
      "portraitId": "xiao_yedan_ch13_oath"
    },
    {
      "character": "xiaoman",
      "chapter": "ch03",
      "after_text": "小满在江边的一块石头上，捡到一条绑腿。",
      "portraitId": "xiaoman_ch03_binding"
    },
    {
      "character": "xiaoman",
      "chapter": "ch17",
      "after_text": "小满把铜锅背在背上。锅很轻，因为里面什么都没有。",
      "portraitId": "xiaoman_ch17_pot"
    },
    {
      "character": "xiaoman",
      "chapter": "ch19",
      "after_text": "小满把那根带子缠在号管的第三节上，缠了三圈，打了个结。",
      "portraitId": "xiaoman_ch19_cord"
    },
    {
      "character": "li_tiezhu",
      "chapter": "ch05",
      "after_text": "他把那口锅背起来，走了。",
      "portraitId": "li_tiezhu_ch05_onepot"
    },
    {
      "character": "li_tiezhu",
      "chapter": "ch17",
      "after_text": "第七天早上，他没有站起来。",
      "portraitId": "li_tiezhu_ch17_death"
    },
    {
      "character": "he_xiaomei",
      "chapter": "ch03",
      "after_text": "我把自己的衬衣撕了。衬衣也只有一件。",
      "portraitId": "he_xiaomei_ch03_torn"
    },
    {
      "character": "he_xiaomei",
      "chapter": "ch07",
      "after_text": "上级发了钱，要她把卫生队的药品补齐。",
      "portraitId": "he_xiaomei_ch07_supply"
    },
    {
      "character": "guo_daniang",
      "chapter": "ch01",
      "after_text": "她把门板放下，从怀里摸出一样很小的东西。",
      "portraitId": "guo_daniang_ch01_thimble"
    },
    {
      "character": "shi_zhu",
      "chapter": "ch08",
      "after_text": "石柱背着两个伤员下来，自己的左肩被子弹打穿了。",
      "portraitId": "shi_zhu_ch08_shoulder"
    },
    {
      "character": "shi_zhu",
      "chapter": "ch14",
      "after_text": "伤口很长，从膝盖一直划到脚踝，泡了一上午的水，皮肉翻着白。",
      "portraitId": "shi_zhu_ch14_leg"
    },
    {
      "character": "shi_zhu",
      "chapter": "ch15",
      "after_text": "何晓梅撕开他的衣服。前胸和两条手臂都烧伤了，皮肉粘在一起。",
      "portraitId": "shi_zhu_ch15_burned"
    },
    {
      "character": "wu_laoliu",
      "chapter": "ch10",
      "after_text": "卫生员，我的枪换了。",
      "portraitId": "wu_laoliu_ch10_rifle"
    },
    {
      "character": "san_wa",
      "chapter": "ch17",
      "after_text": "他把皮带切成小段，放在锅里，加水，下面架着刚挖出来的湿草根。",
      "portraitId": "san_wa_ch17_rope"
    },
    {
      "character": "san_wa",
      "chapter": "ch18",
      "after_text": "他把鞋穿上，系得很紧。系完以后，他抬头看了一眼对面的碉堡。",
      "portraitId": "san_wa_ch18_new_shoes"
    },
    {
      "character": "yi_people",
      "chapter": "ch13",
      "after_text": "几十把铁链一起被砸断。",
      "portraitId": "yi_people_ch13_freed"
    }
  ]
};
})();
