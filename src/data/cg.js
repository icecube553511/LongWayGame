/* CG（全屏插画）注册表 —— 所有权：root 冻结 schema，内容由 cg-story-audit 填写。
 *
 * 一张 CG = 一个「重要事件」时刻：玩家走到那一步时，画面切到全屏插画 + 一句图注。
 * 与背景（bg_*）的区别：背景是舞台，CG 是「这一刻值得停一下」的那张画。
 *
 * 字段：
 *   id        必填，`cg_` 前缀，全剧唯一；剧本 `{t:'cg', id}` 用的就是它，画廊按它解锁
 *   ch        所属章节 id（'ch01'…'ch20'），用于画廊分组与校验
 *   title     画廊里的中文标题（≤10 字）
 *   anchor    对应的原有 `cg` 步骤用的背景 id（改剧本时可对照，允许为空）
 *   caption   屏幕上打在 CG 上的图注：一句史实/情绪落点，≤36 汉字，无引号、无感叹号
 *   prompt_en 给绘图模型的英文场景描述（构图、主体、光线、情绪），3–6 句，直接拼进提示词
 *   prompt_cn 同一场景的中文说明（给人读）
 *   must      必须出现在画面里的元素（英文短词），工具会拼成 "must include: …"
 *   avoid     禁止出现的元素（英文短词），默认已含 text/watermark，这里写场景特有的
 *   motion    动效：'zoom-in'（默认）/ 'pan-left' / 'pan-right' / 'still'
 *   priority  'P0' = 本章必做；'P1' = 有预算再做
 */
/* 消费方与拼词规则（tools/cg-art.js 的 promptFor()；改提示词前先对齐这一节）：
 *   prompt_en 只写「画面」本身，不要重复风格头。工具按下面的顺序拼成最终提示词：
 *     ① STYLE      —— 低多边形块面、固定配色、单一左上光源（统一由工具提供）
 *     ② prompt_en
 *     ③ 'The composition must clearly show: ' + must.join('; ') + '.'
 *     ④ COMPOSITION—— 16:9、地平线在下三分之一、三层景深、红军装具（统一由工具提供）
 *     ⑤ 'AVOID: ' + AVOID_BASE.concat(avoid).join(', ') + '.'
 *   因此：
 *     · prompt_en 里不要写禁令（text / watermark / 现代物件…），写进 avoid 才生效；
 *     · avoid 只写「本场景特有」的禁令，且不要与 AVOID_BASE 重复
 *       （text/letters/chinese characters/watermark/gore/anime/blur/
 *        people staring at the camera 等已含）；
 *     · must 用英文短名词短语，工具会用 '; ' 拼成一句话，建议 4–7 条；
 *     · caption 是剧本没写 text 时的兜底图注（engine.js:926），≤36 汉字、无引号、无感叹号。
 */
(function () {
  var G = (typeof window !== 'undefined') ? window : globalThis;
  G.ART = G.ART || {};

  var CG = [
    /* ---------- 第一章起：既定 24 处 ---------- */
    { id: 'cg_yudu_night',      ch: 'ch01', title: '夜渡于都河',   anchor: 'bg_yudu_night',      motion: 'zoom-in',  priority: 'P0',
      caption: '一九三四年十月十七日。河上没有一支火把。',
      prompt_en: 'A wide dark river in southern China at night in October 1934. Five low pontoon bridges built of mismatched household door panels and rough planks cross the black water, and a column of tiny soldiers walks them in single file, end to end, without one torch burning. The only light is a cold sheen on the wet planks and a faint reflection sliding across the river, and the near bank is crowded with silent villagers who carry no lamp. Low dark mountain ridges close the horizon in flat shapes.',
      prompt_cn: '一九三四年十月十七日夜，于都河。五座用各家各户门板与糙木板搭成的低浮桥横在黑水上，队伍一个接一个地过，没有一支火把。光只有湿桥板上的一层冷反光和河面上游动的暗影；近岸挤着沉默的乡亲，谁也没提灯。远处是低矮的赣南山脊剪影。',
      must: ['five pontoon bridges built of household door panels','column of tiny soldiers crossing in single file at night','black water with faint cold reflections','silent villagers with no lamps on the near bank','low dark mountain ridges on the horizon'],
      avoid: ['torches','campfires','daylight','warm firelight'] },
    { id: 'cg_blockade',        ch: 'ch02', title: '突破封锁线',   anchor: 'bg_blockade',        motion: 'pan-right', priority: 'P0',
      caption: '碉堡连着碉堡，队伍还是从口子里挤了过去。',
      prompt_en: 'A fortified ridge in southern China at dusk in November 1934. A chain of low concrete pillboxes runs along the crest, strung together with barbed wire and scattered iron caltrops, while a pale searchlight cone sweeps slowly across the slope. In the middle of the ridge a single gap has been torn open through the wire, and a narrow column of tiny soldiers squeezes through it in single file along a dirt cut. Dust and thin smoke hang over the wire, and a dull orange glow shows behind the fortifications where the ground still burns.',
      prompt_cn: '一九三四年十一月，赣南的一条设防山脊，黄昏。山脊上一座接一座低矮的混凝土碉堡，铁丝网把它们串起来，坡上散着铁蒺藜，一道惨白的探照灯光慢慢扫过。阵线正中被打出一道口子，队伍在土沟里拉成一条线，从口子里挤过去。铁丝网上挂着土和薄烟，工事背后透出地面还在烧的暗橙光。',
      must: ['chain of low concrete pillboxes along a ridge crest','barbed wire with scattered iron caltrops','pale searchlight cone sweeping the slope','one narrow gap torn in the wire','column of tiny soldiers squeezing through the gap'],
      avoid: ['armoured vehicles','aircraft','clear blue sky'] },
    { id: 'cg_xiangjiang_day',  ch: 'ch03', title: '湘江·强渡',   anchor: 'bg_xiangjiang_day',  motion: 'pan-left',  priority: 'P0',
      caption: '十一月二十七日，白昼。江面上架起了浮桥。',
      prompt_en: 'A broad river crossing in Guangxi, China, in the flat grey light of a late November day in 1934. A long pontoon bridge of wooden boats and planks lies across the pale water, packed with a slow column of tiny soldiers, mules, stretchers and heavy boxed equipment. The far bank is a flat mud shore with low scrub and no trees, and low clouds press down onto the water. Drifting smoke and a few shell splashes mark the far end of the bridge.',
      prompt_cn: '一九三四年十一月二十七日白昼，广西湘江。一条由木船和木板架成的长浮桥横在浅色的江面上，桥上挤着缓慢移动的队伍：人、骡马、担架、成箱的辎重。对岸是平缓的滩涂和低矮灌木，没有树，云压在水面上。桥的远端飘着烟，有几处炮弹炸起的水柱。',
      must: ['long pontoon bridge of wooden boats and planks across a wide river','crowded column of tiny soldiers with mules, stretchers and boxed equipment','flat muddy far bank with low scrub','low heavy clouds over pale water','drifting smoke at the far end of the bridge'],
      avoid: ['bright sunshine','dense tropical forest','modern bridges'] },
    { id: 'cg_xiangjiang_night', ch: 'ch03', title: '湘江血战夜',  anchor: 'bg_xiangjiang_night', motion: 'zoom-in',  priority: 'P0',
      caption: '水是红的。没有人停。',
      prompt_en: 'A river at night in Guangxi, China, in late November 1934. The far bank is on fire: a tall column of smoke rises into the dark and pools of firelight spill across the water, staining the ripples a restrained dull red. On a battered pontoon bridge built from broken door panels, a thin column of tiny soldiers keeps crossing without stopping, a few of them pressing small bundles against their chests. Ash drifts in the air, and the near bank is dark and crowded with waiting shapes.',
      prompt_cn: '一九三四年十一月末的夜晚，广西湘江。对岸在烧：烟柱竖进黑天，火光一片片摊在水面上，把水波染成克制的暗红。用破门板拼成的浮桥上，一条细线似的队伍没有停，有人把小小的包袱按在胸前。空气里飘着灰。近岸很暗，挤着等待的人影。',
      must: ['night river crossing','tall smoke column rising from a burning far bank','restrained dull red firelight on dark ripples','pontoon bridge built from broken door panels','column of tiny soldiers still crossing without stopping'],
      avoid: ['bright daylight','blood covering the water','fire covering the whole frame'] },
    /* 炸断浮桥这一刻专门要一张画（ch03，落点在 steps[135]「浮桥断了一节」）。
       史料与本章档案 a_xiangjiang_bridge 都写着：浮桥被炸断后，站在船上的战士跳进初冬的江水，
       **用手与肩膀托住桥板，让队伍从上面走过去**。画的就是这个「人托着人」。
       动效用 impact（进场即爆炸冲击的那一下，再缓慢沉下来），与紧随其后的
       「补桥！」「我托得住！」接成一拍。—— 由 root 按用户要求追加 */
    { id: 'cg_xiangjiang_hands', ch: 'ch03', title: '人托着桥板', anchor: 'bg_xiangjiang_night', motion: 'impact', priority: 'P0',
      caption: '浮桥断了一节。人站在水里，用手托着桥板。',
      prompt_en: 'A broken pontoon bridge at night on a wide Chinese river in November 1934. A gap has been blown open in the middle of the span and the wrecked end sags into the black water, planks and ropes trailing. In the gap, chest-deep in the freezing river, a line of soldiers stands with hands and shoulders pressed up under the bridge planks, holding the roadway level so the column can keep walking across above their heads. Water streams off their caps and shoulders. Torchlight and the glow of a distant burning shore pick out the men in the water only as small dark shapes. The column above them keeps moving, bundles and stretchers included, without stopping.',
      prompt_cn: '一九三四年十一月，夜，宽阔的江面上一条被炸断的浮桥：桥身中段炸开一个缺口，断口垂进黑水，木板与绳索漂着。缺口处，一排战士站在齐胸深的冷水中，用手与肩膀从下面顶住桥板，把桥面托平，让队伍从他们头顶上继续走。水从他们的帽檐和肩头往下淌。火把光与远处燃烧的岸只把水里这些人的脸和手照成小小的暗色形状。上面的人不停，挑着担子、抬着担架照样过。',
      must: ['pontoon bridge with a blown gap in the middle','soldiers standing chest-deep in the cold river','hands and shoulders pressed up under the plank roadway','column still walking across above them','night, torchlight, black water'],
      avoid: ['bright daylight','heroic close-up face','vivid orange fire','blood covering the water'] },
    { id: 'cg_tongdao',         ch: 'ch04', title: '通道转兵',     anchor: 'bg_tongdao',         motion: 'still',    priority: 'P0',
      caption: '两张地图，摊在同一张桌子上。',
      prompt_en: 'A small timber room inside an old Chinese academy in Hunan, in December 1934, in the evening. Two large military maps lie spread and slightly overlapping on one dark wooden table, their surfaces carrying hand-drawn river lines and arrows. A low stone fire pit in the corner gives weak orange light, and a paper lantern hangs from a rafter above. Through the lattice window, cold winter rain falls into the courtyard, where a cooking pot steams over wet firewood. Warm brown interior values sit against the cold blue-grey rain outside.',
      prompt_cn: '一九三四年十二月的一个晚上，湖南通道恭城书院的一间小木屋。两张大地图摊在同一张深色木桌上，边角压在一起，图面有手画的河线与箭头。屋角的石砌火塘烧着微弱的橙光，梁上挂一盏纸灯。窗棂外的天井落着冬雨，湿柴上的锅冒着白气。屋里偏暖褐，屋外是冷灰蓝。',
      must: ['two overlapping military maps on one dark wooden table','hand-drawn river lines and arrows on the maps','low stone fire pit with weak fire','lattice window with winter rain outside','cooking pot steaming over wet firewood in the courtyard'],
      avoid: ['electric lamps','modern furniture','vivid saturated colour'] },
    { id: 'cg_liping',          ch: 'ch05', title: '黎平会议',     anchor: 'bg_liping',          motion: 'zoom-in',  priority: 'P0',
      caption: '路要往哪边走，得当面说出来。',
      prompt_en: 'A low wooden meeting house in a wet mountain town in Guizhou, China, at night in December 1934. A fire pit burns at the centre of the plank floor and throws warm light across a bare table carrying maps, cups and folded paper, where seated figures face one another in a hard argument. Through the open doorway the dark stilt houses and the misty river valley stand in cold blue rain-light. Steam and tobacco smoke gather among the rafters, and the corners of the room stay deep in shadow.',
      prompt_cn: '一九三四年十二月的一个夜晚，贵州黎平一间低矮的木楼。火塘烧在木板地的中央，把暖光摊在桌上：地图、搪瓷缸、折起的纸，几个人对坐着争得很硬。敞开的门外，吊脚楼和雾里的河谷是冷的蓝雨光。白汽和烟聚在梁下，屋角留着很深的暗部。',
      must: ['fire pit burning on a plank floor','bare table with maps, cups and folded paper','seated figures facing one another across the table','open doorway onto dark stilt houses and misty rain','deep shadow in the corners of the room'],
      avoid: ['electric light','modern meeting room','even flat lighting'] },
    { id: 'cg_houchang',        ch: 'ch06', title: '猴场跨年',     anchor: 'bg_houchang',        motion: 'pan-left', priority: 'P0',
      caption: '一九三五年一月一日。过了年，就过江。',
      prompt_en: 'A small town courtyard in Guizhou, China, at dusk on New Year Day 1935. Thin snow falls onto flagstones already scattered with small red firecracker paper and a drift of red dust, and red couplet paper is pasted beside a wooden doorway where two paper lanterns hang under the eaves. In the middle of the courtyard a big iron pot steams over a fire while a queue of tiny soldiers waits with bowls in their hands. Beyond the gate, the dark gorge of a river closes the view.',
      prompt_cn: '一九三五年元旦的黄昏，贵州猴场的一处庭院。薄雪落下来，青石板上已经散着一层红色爆竹纸屑和红灰；木门边贴着红纸对联，檐下挂着两盏纸灯笼。院子正中一口大铁锅架在火上冒白汽，一小队战士端着碗排队。门外是暗下来的江峡。',
      must: ['snowy courtyard with scattered red firecracker paper','red couplet paper beside a wooden doorway','two paper lanterns under the eaves','big iron pot steaming over a fire','queue of tiny soldiers waiting with bowls'],
      avoid: ['electric lights','modern clothing','lush green summer foliage'] },
    { id: 'cg_zunyi',           ch: 'ch07', title: '遵义会议',     anchor: 'bg_zunyi',           motion: 'zoom-in',  priority: 'P0',
      caption: '楼上散了会，楼下的人都在等。',
      prompt_en: 'The wooden gallery of a two-storey red-lacquered town house in Zunyi, Guizhou, China, at dawn in January 1935. Cold blue morning light lies over tiled roofs and frost, and behind an open door a charcoal brazier still glows dull orange in the room where the meeting was held. On the gallery a single officer reads aloud from one sheet of paper, while in the stone courtyard below a loose crowd of tiny soldiers in grey uniforms stands and listens with faces lifted. Thin mist hangs between the buildings.',
      prompt_cn: '一九三五年一月十七日拂晓，贵州遵义一栋两层的红漆木楼。冷蓝的晨光铺在青瓦和霜上；开会那间屋子的门开着，里头炭盆还亮着暗橙。木回廊上一个人捧着单页的纸在念，楼下石砌天井里站着一片灰衣的人，仰着头听。屋舍之间挂着薄雾。',
      must: ['red-lacquered wooden gallery of a two-storey town house','charcoal brazier glowing behind an open door','officer reading from one sheet of paper on the gallery','crowd of tiny soldiers listening in the courtyard below','cold dawn light with frost and thin mist'],
      avoid: ['modern buildings','electric light','busy street scene'] },
    { id: 'cg_chishui_first',   ch: 'ch08', title: '一渡赤水',     anchor: 'bg_chishui',         motion: 'pan-right', priority: 'P0',
      caption: '赤水河。第一次往西。',
      prompt_en: 'A narrow gorge in northern Guizhou, China, before dawn in January 1935, with rain falling. A pontoon bridge of door panels, small boats and bamboo poles spans the fast red-brown water, and a thin line of tiny soldiers crosses it in the dark without one torch or fire. Rain blurs the far bank and the wet rock walls of the gorge glisten with a faint sheen. Behind the column a few figures work at the planks, easing door panels back into the current.',
      prompt_cn: '一九三五年一月二十九日凌晨，川黔边界的赤水河峡谷，下着雨。门板、小木船和竹竿拼成的浮桥横在湍急的红褐色水上，一条细线似的队伍摸黑过河，没有一支火把，没有一堆火。雨把对岸糊掉，湿岩壁泛着一层薄光。队伍后面有几个人在弄桥板，把门板一块块推回水里。',
      must: ['pontoon bridge of door panels and small boats across fast water','red-brown river inside a steep wet gorge','thin line of tiny soldiers crossing in rain with no torches','figures easing door panels back into the current','rain haze over the whole scene'],
      avoid: ['torches','bright daylight','motorboats'] },
    { id: 'cg_zhaxi',           ch: 'ch09', title: '扎西整编',     anchor: 'bg_chishui',         motion: 'still',    priority: 'P0',
      caption: '赤水河。一月往西，二月往东。同一条河，第二次过。',
      prompt_en: 'A red-brown river gorge in Yunnan, China, in February 1935, late in the afternoon. The same fast river runs between high rock walls, but the crossing now goes the other way: a much lighter column of tiny soldiers moves east across a pontoon bridge, carrying rifles and rolled bedding, with no heavy equipment left anywhere on the bank. In the near foreground one small soldier carries a brass bugle on his shoulder, and a discarded empty box lies on the stones behind him. Sunlight only grazes the cliff tops while the gorge itself stays in cold shadow.',
      prompt_cn: '一九三五年二月的一个下午偏晚，云南的赤水河峡谷。同一条急流仍在高岩壁之间，但方向反了：一支轻得多的队伍踩着浮桥往东，背枪和铺盖，岸上再没有笨重辎重。近景一个瘦小的身影肩上挂着铜号，身后的石头上丢着一只空箱。阳光只擦到崖顶，谷里全是冷影。',
      must: ['red-brown river between high rock walls','light column of tiny soldiers crossing eastward','single brass bugle carried by a small soldier in the foreground','discarded empty box on the stones','sunlit cliff tops above a shadowed gorge'],
      avoid: ['heavy artillery','large crowds','dense forest'] },
    { id: 'cg_loushanguan',     ch: 'ch10', title: '娄山关大捷',   anchor: 'bg_loushanguan',     motion: 'zoom-in',  priority: 'P0',
      caption: '娄山关。雄关漫道真如铁，而今迈步从头越。',
      prompt_en: 'A narrow stone pass high in the mountains of Guizhou, China, at sunset in late February 1935. Jagged grey stone peaks stand above a slow sea of cloud that fills the valley, and the pass itself is a broken stone stairway between rock walls. On the highest rock outcrop a small soldier plants a plain red flag that snaps sideways in the wind. Thin pines cling to the cliff, and spent smoke still drifts along the steps below.',
      prompt_cn: '一九三五年二月末的黄昏，贵州娄山关。尖锐的灰色石峰立在把谷底填平的云海上，关口是岩壁之间一段破损的石阶。最高的那块岩石上，一个小战士把一面没有字的红旗插上去，旗子被风扯得横过来。崖上挂着几棵细松，下面的石阶边还飘着残烟。',
      must: ['jagged grey stone peaks above a sea of cloud','narrow stone pass with a broken stairway','plain red flag planted on a rock outcrop by a small soldier','thin pines clinging to the cliff','low warm sunset light on the peaks'],
      avoid: ['writing or markings on the flag','modern structures','lush green summer foliage'] },
    { id: 'cg_chishui_fourth',  ch: 'ch11', title: '四渡赤水',     anchor: 'bg_chishui',         motion: 'pan-left', priority: 'P0',
      caption: '赤水河。一个月，四回。地图上是折线，脚下是血泡。',
      prompt_en: 'A deep red-brown river gorge at night in March 1935, seen from above. The river doubles back through the landscape so that it appears twice, and at two separate bends pontoon bridges carry lines of tiny soldiers crossing in the dark. On a rock ledge in the near foreground a small soldier sits and cuts a notch into a brass bugle with a knife, three notches already visible on the metal. No fire is lit anywhere along the water.',
      prompt_cn: '一九三五年三月的夜，一条折返回头的赤水河峡谷，俯瞰。河在画面里绕出两道弯，两处不同的河湾上各有一座浮桥，桥上都是摸黑过河的小小身影。近景的一块岩石上，一个小战士坐着，拿刀在铜号上刻痕，金属上已经有三道。沿岸没有一点火。',
      must: ['red-brown river doubling back through a dark gorge','two pontoon bridges with lines of tiny soldiers crossing','small soldier cutting a notch into a brass bugle on a rock ledge','cold blue-black night with no fire'],
      avoid: ['torches','bright daylight','large figures in the foreground'] },
    { id: 'cg_jinsha',          ch: 'ch12', title: '巧渡金沙江',   anchor: 'bg_jinsha',          motion: 'pan-right', priority: 'P0',
      caption: '金沙江皎平渡。七条木船，三十六个船工，九天九夜。',
      prompt_en: 'A deep gorge on the Jinsha River in Yunnan, China, at night in May 1935. Steep bare cliffs fall to black water and a small stone ferry landing, where torchlight throws long warm streaks across the current. Seven small wooden boats cross the river one behind another, each packed with tiny soldiers, while rope and plank ramps lead up the rock face. Boatmen stand at the oars of a moored boat in the near foreground, and a small soldier beside them tips an empty canteen over the water.',
      prompt_cn: '一九三五年五月的夜里，云南金沙江皎平渡。陡峭的裸岩直落进黑水和一处石砌渡口，火把把暖色的长条光斑摊在水流上。七条小木船一条跟着一条过江，每条船都挤着人；岩壁上挂着绳子和跳板。近景里船工扶着靠在岸边的船桨，旁边一个瘦小的战士把空水壶倒过来对着江面。',
      must: ['deep gorge with steep bare cliffs above black water','stone ferry landing lit by torches','seven small wooden boats crossing at night','boatmen standing at the oars','small soldier tipping an empty canteen over the water'],
      avoid: ['daylight','modern engines','large steamboats'] },
    { id: 'cg_yihai',           ch: 'ch13', title: '彝海结盟',     anchor: 'bg_yihai',           motion: 'zoom-in',  priority: 'P0',
      caption: '彝海的水面很静。两个人分喝了一碗酒。',
      prompt_en: 'A still alpine lake ringed by dark pines in western Sichuan, China, at dusk in May 1935. Two figures kneel facing each other on the stony shore and share one bowl between them: one wears a plain grey uniform and an eye patch, the other a deep blue felt cloak with a black head wrap and silver ornaments. Torches stand in the ground behind them, their reflections lying unbroken on the glassy water. A ring of cloaked figures and grey soldiers watches from a little distance, and faint snow ridges close the far shore.',
      prompt_cn: '一九三五年五月的黄昏，川西彝海边。深色松林围着一片静水，两个身影在石岸边相对跪坐，共饮一只碗：一个穿灰军装、戴眼罩，另一个裹深蓝披毡，头缠黑帕，佩着银饰。身后插着火把，倒影在水面上一动不动。稍远处站着一圈披毡的人和灰衣战士，对岸有淡淡的雪山脊线。',
      must: ['still alpine lake ringed by dark pines','two kneeling figures sharing one bowl on the shore','figure in a deep blue felt cloak with black head wrap and silver ornaments','torch reflections lying unbroken on glassy water','ring of watching figures at a distance'],
      avoid: ['modern clothing','daylight','writing on cloth'] },
    { id: 'cg_dadu',            ch: 'ch14', title: '强渡大渡河',   anchor: 'bg_dadu',            motion: 'pan-right', priority: 'P0',
      caption: '一条船，十七个人，一条不能回头的河。',
      prompt_en: 'A violent river between high rock walls in western Sichuan, China, in the morning of May 1935. White water tears around boulders in the middle of the current and spray hangs over the surface. One small wooden boat crosses toward the far bank, packed with crouching soldiers and bending oars, while on the near shore a machine gun on a tripod and a single mortar sit in a cut in the bank with muzzle smoke still drifting from them. A low stone blockhouse waits under a bare cliff on the far side.',
      prompt_cn: '一九三五年五月的上午，川西大渡河。白浪在河心的巨石上炸开，水雾浮在水面上。一条小木船朝对岸去，船上挤着伏低的身影，桨被压得弯；近岸的土坎里架着一挺机枪和一门迫击炮，炮口还飘着一缕烟。对岸的裸崖下是一座低矮的石碉堡。',
      must: ['violent white rapids and hanging spray','single small wooden boat packed with crouching soldiers','machine gun on a tripod and a single mortar in a cut in the near bank','low stone blockhouse under a bare cliff on the far bank'],
      avoid: ['modern boats','bridges','bright sunshine'] },
    /* 赵章成的第三发炮弹 —— 强渡大渡河真正的关键一炮（ch14[186]「第三发，从碉堡的枪眼里进去了。」，
       紧接着 187 就是 shake）。图注用原文，动效 impact。—— 由 root 按用户要求追加 */
    { id: 'cg_dadu_third_shell', ch: 'ch14', title: '第三发炮弹',  anchor: 'bg_dadu',           motion: 'impact',   priority: 'P0',
      caption: '第三发，从碉堡的枪眼里进去了。',
      prompt_en: 'The Dadu River at Anshun Chang, Sichuan, China, May 1935, in the morning. On the near bank a single small mortar stands on an earth ledge with its muzzle smoke still drifting and the two-man crew crouched behind it looking across. Across the wide grey river, on the far cliff, sits a blockhouse with three dark embrasures; the third shell has just gone into the middle one, and a tight knot of smoke and dull orange fire is breaking out of that slit while the other two stay black. In midstream, small and low, a single wooden boat with a dozen and a half men crouched inside fights the current.',
      prompt_cn: '一九三五年五月，上午，四川安顺场大渡河。近岸土坎上架着一门小迫击炮，炮口的烟还没散，两个炮手蹲在炮后朝对岸看。宽阔的灰江对岸、崖壁上有一座碉堡，三个枪眼黑着；第三发刚刚打进中间那一个，一股紧实的烟与暗橙火光正从那个枪眼里鼓出来，另两个仍然黑着。江心偏下，一条很小的木船逆着水，船里蹲着十几个人。',
      must: ['small mortar with drifting muzzle smoke on the near bank','blockhouse on the far cliff with three dark embrasures','smoke and dull orange fire bursting from the middle embrasure','single small wooden boat fighting the current midstream','wide grey river'],
      avoid: ['bright saturated colour','heroic close-up face','modern weapons','a bridge across the river'] },
    { id: 'cg_luding_race',     ch: 'ch15', title: '奔袭泸定',     anchor: 'bg_luding',          motion: 'pan-left', priority: 'P0',
      caption: '十三根铁索，横在一条发怒的河上。',
      prompt_en: 'An iron chain suspension bridge over a violent river in western Sichuan, China, in the morning of May 1935. Thirteen bare iron chains span the gorge and almost all of the wooden deck planks have been removed, leaving a few only near the eastern bridgehead; the chains sag over white water that breaks on rocks far below. A square stone bridge tower stands at each end beneath steep cliffs. In the foreground a few soldiers crouch behind a rock at the western bridgehead and look along the chains.',
      prompt_cn: '一九三五年五月的上午，川西泸定桥。十三根赤裸的铁索横跨峡谷，桥板几乎被抽光，只在东岸桥头剩着几块；铁索下面是很深的白浪在礁石上炸开。两头各有一座方形石桥楼，头上是陡崖。近景的岩石后伏着几个人，正顺着铁索望向对岸。',
      must: ['thirteen bare iron chains spanning a gorge','missing wooden planks with only a few left near one bridgehead','square stone bridge towers at both ends under steep cliffs','white rapids breaking on rocks far below','crouching soldiers looking along the chains'],
      avoid: ['intact plank roadway','modern suspension bridge','bright blue sky'] },
    { id: 'cg_luding_bridge',   ch: 'ch15', title: '铁索夺桥',     anchor: 'bg_luding',          motion: 'zoom-in',  priority: 'P0',
      caption: '火里有人冲过去了。',
      prompt_en: 'The eastern bridgehead of an iron chain bridge, burning, in western Sichuan, China, in the afternoon of May 1935. Fire and black smoke pour out of the stone bridge tower and the nearest iron chains glow dull red where the flames reach them, while burning fragments of plank drop away into the gorge below. Along the chains a line of soldiers crawls forward through the smoke toward the fire, the leading figure half swallowed by the blaze. Far below, the river runs white between black rocks.',
      prompt_cn: '一九三五年五月的下午，泸定桥东岸桥头。桥楼里喷出火和黑烟，最靠里的铁索被烧成暗红，烧断的木板碎片往峡谷里掉。铁索上一条线似的向前爬，最前面的人半截身子已经进了火里。脚下很深的河在黑色的岩石间撞成白色。',
      must: ['burning stone bridge tower with black smoke','iron chains glowing dull red from the flames','soldiers crawling along the chains toward the fire','burning plank fragments dropping into the gorge','white rapids far below between black rocks'],
      avoid: ['intact bridge deck','daylight blue sky','flames covering the whole frame'] },
    { id: 'cg_snow_mountain',   ch: 'ch16', title: '翻越夹金山',   anchor: 'bg_snow_mountain',   motion: 'zoom-in',  priority: 'P0',
      caption: '四千余米。风把话都吹回去了。',
      prompt_en: 'The upper slope of a high snow mountain in Sichuan, China, in June 1935. Wind drives loose snow sideways across a bare white ridge, and a single long file of tiny soldiers climbs the steep face, roped together and bent forward, their head disappearing into the cloud above while the tail is still among dark pines far below. A rock cairn and a few dead grasses stand on the ridgeline, and nothing else grows at this height. The whole scene is near-monochrome white and cold grey with small dark figures.',
      prompt_cn: '一九三五年六月，川西夹金山的高处。风把浮雪横着刮过裸露的白色山脊，一条很长的队伍用绳子连成一串往上爬，弓着身子：头已经进了云里，尾还在很下面的深色松林里。山脊上只有一堆石块和几丛枯草，这个高度不长别的。整体近乎只有白和冷灰，人物是小小的深色点。',
      must: ['long single file of tiny soldiers roped together climbing a snow ridge','driven snow and cloud swallowing the head of the column','dark pines far below at the tail of the column','rock cairn and dead grass on the ridgeline','near-monochrome white and cold grey palette'],
      avoid: ['sunny blue sky','ski equipment','warm golden light'] },
    { id: 'cg_maogong',         ch: 'ch17', title: '懋功会师',     anchor: 'bg_maogong',         motion: 'pan-right', priority: 'P0',
      caption: '两支穿一样灰布单衣的队伍，在同一条山沟里看见了对方。',
      prompt_en: 'A narrow mountain gully in western Sichuan, China, in the morning of June 1935. Two columns of tiny soldiers in identical faded grey uniforms and octagonal caps meet head on along a stony track between low ridges, stopped close enough to touch, with thin morning mist lying in the gully. In the front rank one soldier pours salt from a cloth bag into the open palm of another, while both look down at the ruined feet of the other in straw sandals. Soft overcast light, muted grey-green and ochre, no hard shadow.',
      prompt_cn: '一九三五年六月的一个早晨，川西的一条山沟。两支穿一样褪色灰军装、戴一样八角帽的队伍在低矮山梁之间的碎石道上迎面走拢，近得几乎碰到；沟里浮着薄薄的晨雾。前排一个战士把布袋里的盐倒进另一个摊开的手掌，两人都低头看对方草鞋里的烂脚。天光很软，灰绿与赭黄，没有硬影。',
      must: ['two columns of tiny soldiers meeting head on in a stony gully','identical faded grey uniforms and octagonal caps','soldier pouring salt into another soldier open palm','ruined feet in straw sandals','thin morning mist between low ridges'],
      avoid: ['modern uniforms','vehicles','writing on cloth'] },
    { id: 'cg_grassland',       ch: 'ch17', title: '过草地',       anchor: 'bg_grassland',       motion: 'pan-left', priority: 'P0',
      caption: '草下面是黑泥，黑泥下面是没有底的沼泽。',
      prompt_en: 'An endless waterlogged grassland in north-western Sichuan, China, in August 1935 under a low grey sky. Standing water and black peat pools break the flat plain everywhere, and a single long file of tiny soldiers winds across it on a track that never runs straight, clothing dark with rain. Mist and drizzle flatten the horizon, with no tree, no building and no road anywhere. In the middle distance one figure has sunk to the knees and two others reach out to him with a strip of cloth.',
      prompt_cn: '一九三五年八月，川西北一片看不到边的草地，天压得很低。到处都是积水和黑色的泥炭水洼，一条很长的队伍在永不走直的道上绕过去，衣服被雨泡得发暗。雾和细雨把地平线压平，没有树，没有房子，没有路。中景里有人陷到膝盖，另两个人把一条布带递过去。',
      must: ['endless waterlogged grassland with standing water and black peat pools','long single file of tiny soldiers on a winding track','figure sunk to the knees with others reaching a strip of cloth to him','low grey sky with mist and drizzle','no trees and no buildings anywhere'],
      avoid: ['mountains on the horizon','trees','warm sunlight'] },
    { id: 'cg_lazikou',         ch: 'ch18', title: '激战腊子口',   anchor: 'bg_lazikou',         motion: 'zoom-in',  priority: 'P0',
      caption: '绝壁之间，只剩一道口子。',
      prompt_en: 'A narrow slot canyon in Gansu, China, at dawn in September 1935. Vertical bare cliffs rise on both sides so that only a thin strip of pale sky shows between them, and at the bottom a small wooden bridge crosses a white stream before a squat stone blockhouse with firing slits that blocks the gorge completely. On the rock faces above, a few tiny climbers work their way up the ledges, almost lost against the stone, while soldiers crouch behind boulders at the bridgehead below.',
      prompt_cn: '一九三五年九月的拂晓，甘肃腊子口。两侧竖直的裸岩把天挤成一条窄缝；谷底一条小木桥跨过白水，桥那面是一座带枪眼、把峡谷完全堵死的低矮石碉堡。上面岩壁上几个很小的人影正顺着石棱往上挪，几乎和石头分不出来；桥头下面有人伏在巨石后。',
      must: ['narrow slot canyon with vertical bare cliffs','thin strip of pale sky between the cliffs','small wooden bridge over a white stream','squat stone blockhouse blocking the gorge','tiny climbers working up the cliff face above the bridgehead'],
      avoid: ['wide open valley','trees inside the canyon','bright direct sunlight'] },
    /* 腊子口夜袭炸碉堡 —— 全章真正的转折（ch18[184]「石壁顶上，一捆手榴弹掉进了碉堡的射击孔」，
       紧随其后那句「轰的一声，火光从碉堡里冒出来」就是图注）。
       动效 impact：进场那一抖就是爆炸本身。—— 由 root 按用户要求追加（其余爆炸/强攻场景配 impact） */
    { id: 'cg_lazikou_raid',    ch: 'ch18', title: '夜袭碉堡',     anchor: 'bg_lazikou',         motion: 'impact',   priority: 'P0',
      caption: '轰的一声，火光从碉堡里冒出来。',
      prompt_en: 'A narrow limestone gorge at night in Gansu, China, September 1935. High on the right-hand cliff two tiny soldiers cling to the rock face, one leaning out to drop a bundled cluster of grenades straight down into the embrasure of a blockhouse built into the opposite wall. The bundle has just gone in: a hard burst of orange light and grey smoke blows out through the firing slit and lights the wet rock and the men above it. Far below on a wooden bridge a thin line of soldiers is still charging forward, their muzzle flashes small and white. Everything else is cold night blue.',
      prompt_cn: '一九三五年九月，夜，一条石灰岩峡谷。右侧绝壁上，两个很小的战士扒着岩面，其中一个探出身，把一捆集束手榴弹直直丢进对面碉堡的射击孔。刚刚丢进去：射击孔里炸出一团硬邦邦的橙光与灰烟，照亮湿岩石和上方那两个人。谷底木桥上，一条细线似的队伍还在往上冲，枪口的白光是小小的点。其余都是冷的夜蓝。',
      must: ['two tiny soldiers clinging to the cliff face above', 'bundled grenades dropping into the blockhouse embrasure', 'hard burst of orange light and grey smoke out of the firing slit', 'narrow limestone gorge at night', 'thin line of soldiers charging on the wooden bridge below'],
      avoid: ['bright daylight','heroic close-up face','vivid saturated orange filling the frame','gore'] },
    { id: 'cg_wuqi',            ch: 'ch19', title: '吴起镇',       anchor: 'bg_wuqi',            motion: 'zoom-in',  priority: 'P0',
      caption: '窑洞的墙上写着红军的字。他们到家了。',
      prompt_en: 'A loess plateau in northern Shaanxi, China, in the late afternoon of October 1935. Rounded yellow-brown earth ridges and deep gullies stretch to the horizon, with rows of arched cave dwellings cut into a slope and a plain red flag on a pole standing among them; worn painted slogan marks cover the plastered wall beside one arched doorway, their brush strokes faded into illegible shapes. Along the rim of the plateau in the foreground a whole column of tiny soldiers has stopped and sat down, rifles across their knees and faces turned toward the dwellings, while a peasant with a white cloth around his head stands holding a willow basket. Low warm ochre light lies on the ridges and cold blue shadow fills the gullies.',
      prompt_cn: '一九三五年十月，陕北黄土塬，下午偏晚。起伏的黄褐色土塬和深沟一直铺到天边，坡上凿着一排排拱形窑洞，中间竖着一面没有字的红旗；一个窑洞门口的墙上刷着大字标语。近景的塬边上，一整个队伍停下来坐着，枪横在膝上，脸朝着那几孔窑洞；一位头扎白羊肚手巾的老乡提着一只柳条筐站在旁边。低斜的暖赭光落在塬上，沟里是冷蓝的影。',
      must: ['rounded loess ridges and deep gullies','rows of arched cave dwellings cut into a slope','plain red flag on a pole among the dwellings','worn painted slogan marks on a plastered wall, brush strokes faded illegible','whole column of tiny soldiers sitting down along the plateau rim','peasant with a white head cloth holding a willow basket'],
      avoid: ['modern buildings','green forest','electric light','readable characters on the wall'] },
    { id: 'cg_huining',         ch: 'ch20', title: '三军会师',     anchor: 'bg_huining',         motion: 'zoom-in',  priority: 'P0',
      caption: '两支走了两年的队伍，在同一个下午看见了对方。',
      prompt_en: 'The walled town of Huining in Gansu, China, on an afternoon in October 1936. A tall brick city gate tower stands on a packed-earth plain with several plain red flags on long poles rising in front of it, and a dense crowd of tiny soldiers in ragged grey and blue uniforms fills the ground between the gate and the foreground. A second column arrives from the south in a long line, some carrying rifles and others carrying cooking pots, door panels, folded stretchers, coils of rope and spades. Warm dust hangs in the low sunlight above the crowd.',
      prompt_cn: '一九三六年十月的一个下午，甘肃会宁。高大的砖砌城楼立在夯土塬上，楼前竖着几面没有字的红旗；从城门到近景之间挤满了穿破旧灰蓝军装的小小身影。另一支队伍从南边成一条长线走过来，有人扛枪，有人扛铜锅、门板、捆起的担架、绳子和铁锹。低斜的太阳照着人群上方浮起的一片暖尘。',
      must: ['tall brick city gate tower on a packed-earth plain','several plain red flags on long poles','dense crowd of tiny soldiers in ragged grey and blue uniforms','second column arriving with cooking pots, door panels, stretchers, rope and spades','warm dust in low afternoon sunlight'],
      avoid: ['modern city','vehicles','writing on the flags'] },
    { id: 'cg_yudu_return',     ch: 'ch20', title: '回望于都河',   anchor: 'bg_yudu_night',      motion: 'still',    priority: 'P0',
      caption: '一九三四年十月，于都河。一个十五岁的号手举起了他的号。',
      prompt_en: 'The Yudu river at dusk in October 1934, seen as a distant memory image. Five pontoon bridges built of household door panels lie across the darkening water, one of the panels still blackened with cooking smoke, and behind them a long column of tiny soldiers waits in the gloom. On the near bank a single small boy soldier stands alone at the waterline and lifts a brass bugle to his mouth. One faint light opens over the water in answer, and the edges of the scene fade softly into blue-grey haze.',
      prompt_cn: '一九三四年十月的黄昏，于都河，回忆里的画面。五座用各家门板搭成的浮桥横在暗下来的河面上，其中一块门板还留着灶烟的黑印；桥后是一片在暮色里等待的队伍。近岸只有一个瘦小的少年司号员站在水边，把铜号举到嘴边。水面上方亮起一点很淡的回应之光，画面边缘柔和地化进蓝灰的雾里。',
      must: ['five pontoon bridges built of household door panels at dusk','door panel blackened with cooking smoke','small boy soldier lifting a brass bugle at the waterline','long column of tiny soldiers waiting behind him','single faint light opening over the water'],
      avoid: ['torches','bright daylight','crowd surrounding the boy'] },

    /* ---------- 候选补充：情感线索 / 次要战役（审稿后按需启用） ---------- */
    { id: 'cg_xiaoman_horn',    ch: 'ch01', title: '小满的军号',   anchor: '', motion: 'still',    priority: 'P1',
      caption: '他把号举起来，手是抖的。',
      prompt_en: 'A riverbank at dusk in southern China in October 1934, just before a night crossing. In the near foreground a single small boy soldier raises a battered brass bugle to his mouth, his thin shoulders squared and his uniform plainly too large for him. Behind him a long column of tiny soldiers waits in the gloom, and dark water with pontoon bridges stretches beyond them. An older soldier with a weathered face stands close at his side. Cold blue evening light with one warm glint on the brass of the horn.',
      prompt_cn: '一九三四年十月，于都河边的黄昏，夜渡之前。近景只有一个瘦小的少年司号员，把一支磨旧的黄铜军号举到嘴边，肩很窄，军装明显偏大。他身后是暮色里等待的队伍，再远是黑水和浮桥。旁边站着一个满脸风霜的老兵。冷蓝的暮色里，只有铜号上一点暖反光。',
      must: ['small boy soldier raising a battered brass bugle','uniform plainly too large for the boy','long waiting column of tiny soldiers behind him','dark river with pontoon bridges in the distance','older weathered soldier standing at his side'],
      avoid: ['bright daylight','modern instruments','large figures crowding the foreground'] },
    { id: 'cg_guo_daniang_door', ch: 'ch01', title: '门板桥',      anchor: '', motion: 'still',    priority: 'P1',
      caption: '各家各户拆下门板，往河边去。',
      prompt_en: 'A village lane at the edge of a southern Chinese river town at dusk in October 1934. An elderly woman in a blue cloth jacket and a dark apron carries a heavy wooden door panel on her shoulder toward the water, and the panel is blackened with years of cooking smoke. Other villagers carry boards and bed frames along the same road toward the river, where wooden pontoons are being lashed together. Low whitewashed walls and a large camphor tree frame the lane, and the river lies flat and grey beyond.',
      prompt_cn: '一九三四年十月，于都城外的一条村巷，黄昏。一位穿蓝布大襟衫、系深色围裙的老妇人肩扛一块沉重的门板朝水边去，门板被多年灶烟熏得发黑。同一条路上，其他乡亲扛着木板和床板往河边走，河上正在绑扎浮桥。近处是矮白墙和一棵大樟树，再远是平而且灰的河面。',
      must: ['elderly village woman carrying a wooden door panel on her shoulder','door panel blackened with cooking smoke','villagers carrying boards and bed frames toward the river','low whitewashed walls and a large camphor tree','wooden pontoons being lashed together at the river'],
      avoid: ['electric lights','motor vehicles','bright noon light'] },
    /* 落点由 root 裁定：王稼祥躺担架、两人一路谈的戏在 ch05（ch03 全章没有他出场，
       挂在 ch03 会让画廊把这张图归错章）。anchor 仍是 bg_stretcher，ch05 也在用这个背景。 */
    { id: 'cg_stretcher',       ch: 'ch05', title: '担架上的王稼祥', anchor: 'bg_stretcher', motion: 'zoom-in', priority: 'P1',
      caption: '担架一颠一颠地走，两个人一路谈。',
      prompt_en: 'A narrow bamboo path in a southern Chinese mountain in the winter of 1934 to 1935, with the rain just clearing. Two stretchers are carried along the path a few paces apart: on the first a thin pale young officer lies with his abdomen bound in cloth, on the second a taller figure lies under a blanket with one hand showing outside it. Bamboo leans over the path and the bearers walk with the poles held steady. Cold wet grey-green light with no sun, and the path running out of frame.',
      prompt_cn: '一九三四年冬至一九三五年的一个冬天，赣南/湘西南的一条竹林小径，雨刚停。两副担架隔着几步先后抬过来：前面一副上躺着一个清瘦苍白的年轻干部，腹部缠着布；后面一副上的人盖着毯子，露出一只手。竹子斜垂在路上，抬担架的人把担架杆端得很稳。冷湿的灰绿光，没有太阳，小径从画面里伸出去。',
      must: ['two stretchers carried along a bamboo path a few paces apart','thin pale officer on the first stretcher with his abdomen bound in cloth','second stretcher with a figure under a blanket and one hand showing','bamboo leaning over the wet path','stretcher bearers walking with the poles held steady'],
      avoid: ['modern medical equipment','bright sunshine','visible wounds'] },
    { id: 'cg_tucheng',         ch: 'ch08', title: '土城恶战',     anchor: 'bg_tucheng',         motion: 'zoom-in',  priority: 'P1',
      caption: '土城的人扛着自家的门板来抬伤员。',
      prompt_en: 'A mud-walled town street in Guizhou, China, in January 1935, filled with powder smoke. The street is narrow, its earth walls pitted with bullet marks and its doorways broken, and smoke drifts low between the buildings. Townspeople carry a door panel as an improvised stretcher along the street while soldiers in faded grey uniforms crouch against the walls, and a wounded man lies on the panel. Muted ochre earth and grey smoke, with one dull orange glow at the far end of the street.',
      prompt_cn: '一九三五年一月，贵州土城的一条土墙街道，满是硝烟。街很窄，土墙上密布弹痕，门框都坏了，烟低低地飘在屋舍之间。镇上的乡亲用一块门板当担架，抬着人从街上过去；穿褪色灰军装的战士贴着墙伏低；门板上躺着一个伤员。土墙是闷赭色，烟是灰的，街的尽头上有一点暗橙的火光。',
      must: ['narrow mud-walled town street filled with powder smoke','earth walls pitted with bullet marks and broken doorways','townspeople carrying a door panel as an improvised stretcher','wounded man lying on the door panel','soldiers crouching against the walls'],
      avoid: ['modern buildings','vehicles','vivid saturated colour'] },
    { id: 'cg_camp_fire',       ch: 'ch17', title: '篝火夜营',     anchor: 'bg_camp_fire',       motion: 'still',    priority: 'P1',
      caption: '雨落在没有树的地方，人背靠着人。',
      prompt_en: 'A wet night on a treeless grassland in north-western Sichuan, China, in August 1935. Rain falls steadily into standing water and small circles of tiny soldiers sit on the ground back to back, heads down and shoulders pressed together under soaked cloth, with no tree and no shelter of any kind. In the middle of one circle a small low fire struggles under a coat propped on sticks, giving one pool of dull orange light and a thread of smoke, with a cooking pot set beside it. Everything else is near-black water, mud and rain haze.',
      prompt_cn: '一九三五年八月，川西北没有树的草地的雨夜。雨不停地下进积水里，一小圈一小圈的人背靠背坐在地上，低着头，肩膀挤在一起，衣服全湿透了；周围没有一棵树，没有任何遮拦。其中一圈的中间有一小堆火，用支起的衣服挡着雨，摊出一小片暗橙的光和一线烟，火边放着一口锅。其余全是近黑的水、泥和雨雾。',
      must: ['circles of tiny soldiers sitting back to back in steady rain','small low fire propped under a coat with a cooking pot beside it','waterlogged treeless grassland at night with no shelter','single dull orange pool of light in a dark wet plain'],
      avoid: ['large bonfire','dry ground','clear starry sky'] },
    /* 落点与图注由 root 裁定：接在 ch19「那一摞报纸摊在一张八仙桌上」之后。
       原图注「一张旧报纸，折得很小，塞进口袋。」是本章后面另一句（把报纸折起来收好），
       而画面画的是一群人围着桌子看报 —— 图注与画面不是同一件事，故按画面改写。 */
    /* priority 仍是契约里的 P1（docs/CG_DESIGN.md §1：30 条 = 24 P0 + 6 P1）。
       并行推进的那次改动一度把它提成 P0；`/root` 改回 P1 —— 优先级记的是"剧情落点审查
       当初排的批次"，而"这张图已经启用"由剧本里有没有 cg 步表达（ch19 已有），
       check.js 的引用判定现在对 P0/P1 一视同仁，所以两件事不必混在一个字段里。 */
    { id: 'cg_hadapu_paper',    ch: 'ch19', title: '哈达铺的报纸', anchor: 'bg_hadapu',          motion: 'zoom-in',  priority: 'P1',
      caption: '一摞报纸摊在桌上。认得出的那几行，最要紧。',
      prompt_en: 'A small town shop room in Gansu, China, in September 1935, in the afternoon. A stack of old newspapers is spread across a square wooden table, some pages torn at the corners and one stained and warped by water, and a few men lean over the table reading them. One figure holds a single page up against the light from a papered window and studies its corner, where the print is a dense grey texture of tiny illegible columns. The room is plain, with a wooden counter and a faded blank metal sign board fixed outside the window, and everything else is quiet.',
      prompt_cn: '一九三五年九月的一个下午，甘肃哈达铺镇上的一间铺面。一摞旧报纸摊在方木桌上，有的边角被老鼠咬过，有的被雨水泡得发皱；几个人俯在桌上看。一个人把一张报纸举到纸窗透进来的光里，仔细看边角上的铅字。屋子很素，有一张木柜台，窗外墙上钉着一块褪色的铁皮牌子，其余都很安静。',
      must: ['stack of old newspapers spread across a square wooden table','newspaper pages torn at the corners and warped by water','figure holding one page up against the light of a papered window','few men leaning over the table reading','plain room with a wooden counter'],
      avoid: ['electric lights','modern furniture','colour newspapers with photographs','legible print','readable headlines'] }
  ];

  G.ART.cgList = CG;
  G.ART.cgById = {};
  CG.forEach(function (c) { G.ART.cgById[c.id] = c; });

  if (typeof module === 'object' && module.exports) module.exports = CG;
})();
