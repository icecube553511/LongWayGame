/* 背景（bg_*）位图提示词注册表 —— 所有权：root 冻结 schema，内容由 root 维护。
 *
 * 这一张表是「场景背景重新出图」工程的唯一提示词来源（对应 tools/bg-art.js）。
 * 与 src/data/cg.js（重要事件插画）的分工：
 *   · cg.js   —— 「这一刻值得停一下」的那张画，独立构图 + 电影画框 + 图注；
 *   · bgart.js—— 舞台本身：整屏 16:9，玩家看到的每一句对白都压在这张图上，
 *                 立绘（600×900）与对话框叠在它上面，所以构图必须给人物留位置。
 *
 * 字段：
 *   id        必填，必须是 src/data/backgrounds.js 里已有的 bg_* id（id 表冻结，不得新增改名）
 *   ch        该场景首次出现的章节 id，供画廊/校验分组
 *   name      中文名（与 backgrounds.js 的 name 对齐）
 *   prompt_en 给绘图模型的英文场景描述（画面本身：地点、时间、天气、光线、主体、前景）
 *   prompt_cn 同一场景的中文说明（给人读，样式与 cg.js 一致）
 *   must      必须出现在画面里的元素（英文短名词短语），工具拼成 "The composition must clearly show: …"
 *   crowd     可选。画面里有人群时写「这群人在做什么」，工具会据此拼出「群像每人必须不同」的硬要求
 *   avoid     本场景特有的禁令（英文短词），工具会拼进 AVOID；text/watermark/anime 等已在公共禁忌里
 *
 * 拼词顺序与公共块见 tools/bg-art.js 的 promptFor()：STYLE → prompt_en → must → crowd → COMPOSITION → LIGHTING → AVOID。
 * 因此 prompt_en 里不要重复写风格、不要写禁令、不要写"必须出现"清单。
 *
 * 运行时不加载本文件（同 art/*.js 的定位）：只有生成工具与 tools/check.js 读它。
 */
(function () {
  var G = (typeof window !== 'undefined') ? window : globalThis;
  G.ART = G.ART || {};

  var BG_ART = [
    /* ================= 第一章 于都河畔 ================= */
    {
      id: 'bg_yudu_night', ch: 'ch01', name: '于都河夜渡',
      prompt_en: 'A wide river in southern Jiangxi at night in October 1934. Five low pontoon bridges lie across the black water side by side, each built from mismatched household door panels, bed boards and wooden planks of different widths and greys, lashed to small wooden boats. A column of tiny soldiers walks the bridges in single file, end to end and close together, and not one torch or lamp is burning anywhere. The water carries only a cold faint sheen and a thin reflection of the low moon above the ridge line. On the near bank a throng of villagers stands still and silent, watching the bridges with bundles and children in their arms, and behind them the dark roofs of the village and low mountain ridges close the horizon.',
      prompt_cn: '一九三四年十月，赣南于都河，夜里。五座低矮的浮桥并排横在黑水上，桥板是各家各户的门板、床板与木板拼的，宽窄新旧都不一样，下面系着小木船。队伍在桥上拉成一条细线，一个接一个，没有一支火把、没有一盏灯。水面上只有一层冷光和一缕低月的反照。近岸站着黑压压的乡亲，抱着包袱和孩子，不出声地看着桥上；身后是村子的深色屋脊与低矮的山脊线。',
      must: ['five parallel pontoon bridges built from mismatched door panels and planks',
        'single-file column of tiny soldiers walking the bridges end to end',
        'black water with only a cold faint sheen',
        'throng of villagers standing silent on the near bank',
        'dark village roofs on the far bank', 'low mountain ridges closing the horizon'],
      crowd: 'a column of soldiers crossing the bridges and a throng of villagers standing on the near bank',
      avoid: ['torches', 'lanterns', 'campfires', 'warm firelight', 'daylight', 'electric lights']
    },
    {
      id: 'bg_yudu_village', ch: 'ch01', name: '于都村庄清晨',
      prompt_en: 'The entrance of a village in southern Jiangxi in the autumn of 1934, early in the morning. A huge old camphor tree stands at the head of a stone-paved lane, its trunk broad and its canopy flat, and behind it low whitewashed farmhouses with dark curved tile roofs are half dissolved in thin morning mist. A stone well platform with a wooden bucket sits at the bend of the lane, terraced rice fields and bamboo clumps spread behind the roofs. An old woman in a blue cloth headscarf sits on a low stone under the tree mending the sole of a cloth shoe, children crouch at the edge of the lane watching her, and a few soldiers rest along the low wall with their packs and rifles set on the ground beside them.',
      prompt_cn: '一九三四年秋，赣南村落口，清晨。村口一株巨大的老樟树，树干很粗、树冠是平的；树后是白墙黑瓦的农舍，半浸在薄薄的晨雾里。巷子拐角有一个石砌井台和一只木桶，屋脊后面是梯田与竹丛。树下石头上坐着一位戴蓝布头巾的老妇人，正在纳鞋底；巷子边蹲着几个孩子看她；一段矮墙边坐着几个歇脚的战士，背囊和步枪放在地上。',
      must: ['huge old camphor tree at the village entrance',
        'whitewashed houses with dark curved tile roofs',
        'stone-paved lane with a stone well platform',
        'thin morning mist over terraced rice fields and bamboo',
        'an old woman mending a cloth shoe sole under the tree'],
      crowd: 'an old woman seated under the tree, children crouching at the edge of the lane, and a few resting soldiers',
      avoid: ['snow', 'night sky', 'motor vehicles', 'shop signage']
    },
    {
      id: 'bg_camp_fire', ch: 'ch01', name: '篝火夜营',
      prompt_en: 'A night camp on open grass in southern China in October 1934. One fire burns in the middle of the picture with a bronze cooking pot hanging over it on an iron tripod, throwing the only warm light onto the ground, and a ring of soldiers sit and crouch around it with their backs to the viewer, rifles laid across their knees, several of them mending cloth and shoes by the firelight. Beyond the fire the ground falls away into darkness, with a low bank of reeds and a few dark hills under a sky full of stars.',
      prompt_cn: '一九三四年十月，赣南野地夜营。画面正中一堆篝火，三脚铁架上吊着一口铜锅，这是画面里唯一一处暖光。一圈战士背对镜头围着火坐、蹲，步枪横在膝上，有几个人就着火光补衣服、补鞋。火堆之外地面没入黑暗，远处是一道低矮的芦苇和一列黑山，头顶是密密的星。',
      must: ['one campfire with a bronze cooking pot on an iron tripod',
        'ring of soldiers sitting and crouching around the fire, seen from behind',
        'rifles laid across knees and mending in hand',
        'dark ground falling away beyond the fire',
        'a low reed bank and dark hills under a starry sky'],
      crowd: 'a ring of soldiers sitting and crouching around the campfire, seen from behind',
      avoid: ['buildings', 'tents with poles', 'electric lights', 'bright background']
    },
    {
      id: 'bg_stretcher', ch: 'ch01', name: '担架队',
      prompt_en: 'A bamboo forest path in southern China on an October afternoon in 1934, in dappled sunlight. Tall bamboo stands close on both sides of a narrow earth track, with moss-covered stones and fallen leaves underfoot, and light falls through the leaves in hard flat patches on the ground. Two canvas stretchers are carried away from the viewer along the track, each lifted at both ends by a bearer, and on the nearer stretcher one wounded man lies under a grey blanket with a single bare arm hanging out over the side. Straw sandals, a rolled blanket and a wooden carrying pole lie at the edge of the path.',
      prompt_cn: '一九三四年十月下午，赣南竹林小径，斑驳日光。窄土路两侧立着高高的竹子，路上有长满青苔的石头和落叶，阳光穿过竹叶在地上落成一块块硬边的亮斑。两副帆布担架沿着小径往画面深处抬，每副前后各一人；近处那副担架上躺着一名伤员，盖着灰毯，一条光着的手臂垂在担架外侧。路边散着草鞋、卷起的毯子和一根木杠。',
      must: ['narrow earth track through tall bamboo',
        'hard flat patches of sunlight on the ground',
        'two canvas stretchers carried away from the viewer',
        'wounded man under a grey blanket with one bare arm hanging out',
        'straw sandals and a wooden carrying pole at the edge of the path'],
      crowd: 'four stretcher bearers carrying two stretchers along the path, seen mostly from behind',
      avoid: ['snow', 'wide road', 'vehicles', 'large crowd']
    },

    /* ================= 第二章 突破封锁线 ================= */
    {
      id: 'bg_mountain_pass', ch: 'ch02', name: '赣南山路',
      prompt_en: 'A mountain trail in southern China in the flat grey light of an overcast autumn day. Layered hills recede in washed-out steps, a narrow staircase of worn stone slabs climbs the ridge in switchbacks, and dense bamboo groves crowd the path on both sides above shallow terraced fields that follow the contours of the slope. Thin mist hangs in the folds of the hills between the ridges, and a long single-file column of tiny soldiers winds up the staircase and over the crest, spaced far apart, several of them carrying loads on shoulder poles.',
      prompt_cn: '南方山道，阴天，灰而平的光。层层丘陵一层比一层淡地退到远处；一道窄窄的石板阶沿山脊折着往上；石阶两侧是密竹，竹子下面是顺着山坡走的浅梯田。山坳里挂着薄雾。一列很长的队伍拉着单行从石阶往上走，人和人隔得很远，其中有几个人用挑子挑着东西。',
      must: ['layered hills receding in washed-out steps',
        'narrow stone-slab staircase climbing the ridge in switchbacks',
        'dense bamboo groves on both sides of the path',
        'shallow terraced fields following the slope',
        'long single-file column of tiny soldiers winding up the staircase'],
      crowd: 'the long single-file column of soldiers on the staircase',
      avoid: ['snow', 'desert', 'motor road', 'modern signage']
    },
    {
      id: 'bg_blockade', ch: 'ch02', name: '封锁线碉堡',
      prompt_en: 'A fortified ridge crest in Hunan at dusk in November 1934. A chain of low square concrete pillboxes runs along the skyline, each with a dark machine-gun loophole, linked by double rows of barbed wire strung on wooden posts, with iron caltrops scattered across the slope in front of them. One narrow gap has been torn open through the wire in the middle of the line, with dirt and cut wire still scattered around it, and a thin column of tiny soldiers squeezes through that gap in single file along a shallow cut. A pale searchlight cone sweeps across the wire from the left, dust and thin smoke hang over the slope, and a dull orange glow of burning ground shows behind the fortifications.',
      prompt_cn: '一九三四年十一月，湘南设防山脊，黄昏。山脊线上排着一串低矮的方形混凝土碉堡，每个碉堡上有一个黑洞洞的机枪射孔，碉堡之间是桩子上拉的双层铁丝网，坡前散着铁蒺藜。阵线正中被打出一道窄口子，土和剪断的铁丝还散在口子边上，一列很细的队伍正沿着浅沟从口子里挤过去。一道惨白的探照灯锥体从左往右扫过铁丝网，坡上飘着尘土和薄烟，工事背后透出地面在烧的暗橙光。',
      must: ['chain of low square concrete pillboxes along a ridge crest',
        'double rows of barbed wire on wooden posts with scattered iron caltrops',
        'one narrow gap torn open through the wire',
        'thin column of tiny soldiers squeezing through the gap in single file',
        'pale searchlight cone sweeping across the wire'],
      crowd: 'a thin column of soldiers squeezing through the gap in the wire',
      avoid: ['tanks', 'aircraft', 'clear blue sky', 'modern buildings']
    },
    {
      id: 'bg_rain_march', ch: 'ch02', name: '雨中行军',
      prompt_en: 'A red clay mountain road in southern China in the rain, seen from the roadside. The track is churned into deep ruts filled with water and climbs away along the flank of a wooded ridge where bamboo and thin pines stand in the mist. Rain falls in visible slanted streaks and stands in sheets on the ground, and a long column of soldiers files along the road bent into their straw rain capes, spaced out one behind another, some with rifles and packs, some leaning on sticks.',
      prompt_cn: '南方红泥山路，雨中，从路边看过去。路面被踩出深深的泥沟，沟里积着水，路顺着长满竹子和薄松的山腰往上盘，山腰浸在雾里。雨是有形的斜线，地上摊着一层水。一列很长的队伍沿着路走，人人披着蓑衣，一个个隔开，有人背着枪和包，有人拄着棍子。',
      must: ['deep water-filled ruts in a red clay road',
        'long column of soldiers in straw rain capes',
        'visible slanted rain streaks and standing water',
        'bamboo and thin pines in mist on the ridge flank',
        'leaning sticks and shoulder-borne loads in the column'],
      crowd: 'the long column of soldiers in straw rain capes filing along the road',
      avoid: ['sunshine', 'snow', 'paved road', 'vehicles']
    },

    /* ================= 第三章 湘江血战 ================= */
    {
      id: 'bg_xiangjiang_day', ch: 'ch03', name: '湘江·白昼',
      prompt_en: 'A very broad river in Guangxi on a late November day in 1934 under flat heavy cloud. A long pontoon bridge made of wooden boats and rough planks crosses the pale grey water, and a slow dense column moves over it: soldiers in single file, mules with loads, stretcher parties, and men carrying wooden boxes and disassembled machinery on poles. The far bank is a flat muddy shore with low scrub and a few bare trees, low cloud presses down onto the water, thin smoke drifts at the far end of the bridge and two white shell splashes stand in the river beside it.',
      prompt_cn: '一九三四年十一月末，广西湘江，平厚的阴云下。一条由木船和糙木板架成的长浮桥横在浅灰色江面上，桥上挤着缓慢移动的密集队伍：单行的兵、驮着东西的骡马、抬担架的人、用杠子抬着木箱和拆开机器的运输员。对岸是平缓的泥滩、低矮灌木和几棵光树；云压到水面上；桥的远端飘着薄烟，桥边立着两根炮弹炸起的水柱。',
      must: ['long pontoon bridge of wooden boats and rough planks across a very broad river',
        'dense slow column on the bridge with soldiers, loaded mules and stretcher parties',
        'men carrying wooden boxes and disassembled machinery on poles',
        'flat muddy far bank with low scrub and bare trees',
        'low heavy cloud pressing onto the water and two white shell splashes'],
      crowd: 'several hundred soldiers, mule drivers, stretcher bearers and carriers crowded onto the bridge',
      avoid: ['bright sunshine', 'dense tropical jungle', 'modern bridge']
    },
    {
      id: 'bg_xiangjiang_night', ch: 'ch03', name: '湘江·血战夜',
      prompt_en: 'A wide river in Guangxi at night in late November 1934. The far bank is burning: one tall column of smoke and a band of firelight rise into the dark and spill a restrained dull red sheen across the black ripples, while the near side of the water stays almost unlit. The pontoon bridge is damaged, one span of planks torn away and left hanging from ropes, and a thin line of tiny soldiers keeps crossing it without stopping, several of them carrying small bundles pressed against their chests. Ash and burnt paper drift in the air, and broken planks, straw capes and a sandal float on the water near the near bank.',
      prompt_cn: '一九三四年十一月末，广西湘江，夜里。对岸在烧：一根高高的烟柱和一带火光升进黑暗，把克制的暗红色摊在黑水波上，而近岸的水几乎不亮。浮桥已经破损，有一段桥板被炸掉，挂在绳子上；一条细细的人线还在不停地过桥，有几个人把小小的包袱按在胸前。空气里飘着灰和烧过的纸，近岸水面上浮着断桥板、蓑衣和一只草鞋。',
      must: ['tall smoke column and band of firelight rising from a burning far bank',
        'restrained dull red sheen on black water',
        'damaged pontoon bridge with one span of planks torn away and hanging',
        'thin line of tiny soldiers still crossing without stopping',
        'ash and burnt paper drifting in the air'],
      crowd: 'the thin line of soldiers still crossing the damaged bridge',
      avoid: ['bright daylight', 'blood covering the water', 'fire covering the whole frame', 'torches']
    },
    /* 第三章脚山铺的「每人三发」四张是**叙事画面**，不是景（ART_DIRECTION §3.1）。
       它们的三条硬要求（子弹位置三张完全一致、纯黑底、只有子弹）都是「跨图不变式」，
       AI 出图无法保证位置一致，所以这四张继续用 art/scenes_bullets.js 的程序化 SVG：
       所以本表这四条标 svgOnly:true：tools/bg-art.js 见到就跳过，不会给它们出位图。
       「哪些背景没有位图」这件事在两处各写一次（运行时的 src/data/backgrounds.js noBitmap、
       生成期的本表 svgOnly），tools/check.js 会核对两者一致，防止改一处漏一处。 */
    {
      id: 'bg_bullets_3', ch: 'ch03', name: '三发子弹', svgOnly: true,
      prompt_en: 'Three rifle cartridges standing upright in a row on a flat black surface, nothing else in the picture. Each cartridge is built from a tapering brass case with three visible flat facets, a sharp shoulder, a narrow neck and a grey lead bullet, lit from the upper left so that the left facet of each case is the brightest and the right facet is the darkest.',
      prompt_cn: '三颗立着的步枪弹并排立在一整片黑色的平面上，画面里没有别的东西。每颗子弹由带三块可见竖面的黄铜弹壳、斜肩、弹颈和铅灰色的弹头构成，光从左上来，弹壳左侧的竖面最亮、右侧最暗。',
      must: ['exactly three upright rifle cartridges in a row',
        'flat brass cases with visible facets, shoulders and necks',
        'grey lead bullets', 'a single unbroken black ground filling the rest of the frame'],
      avoid: ['hands', 'weapons', 'any scenery', 'any light source in the picture']
    },
    {
      id: 'bg_bullets_2', ch: 'ch03', name: '三发子弹·二', svgOnly: true,
      prompt_en: 'Two rifle cartridges standing upright on a flat black surface with the wide empty space of a third position left open at the left of the row, the position of the missing cartridge completely unchanged, so the pair sits off centre to the right. Each cartridge has a tapering brass case with three visible flat facets, a sharp shoulder, a narrow neck and a grey lead bullet, lit from the upper left.',
      prompt_cn: '两颗步枪弹立在一片黑色平面上，左侧空着第三个位置——那一颗已经打出去了，位置没有重新居中，所以两颗子弹整体偏右。每颗子弹是带三块可见竖面的黄铜弹壳、斜肩、弹颈和铅灰弹头，光从左上来。',
      must: ['exactly two upright rifle cartridges, off centre to the right',
        'an empty gap at the left of the row exactly one cartridge wide',
        'flat brass cases with visible facets, shoulders and necks',
        'a single unbroken black ground filling the rest of the frame'],
      avoid: ['hands', 'weapons', 'any scenery', 'any light source in the picture', 'centred pair']
    },
    {
      id: 'bg_bullets_1', ch: 'ch03', name: '三发子弹·一', svgOnly: true,
      prompt_en: 'One rifle cartridge standing upright on a flat black surface at the centre of the frame, with the empty space of two fired positions left open on either side so the single cartridge stays exactly where the middle one stood. The case is tapering brass with three visible flat facets, a sharp shoulder, a narrow neck and a grey lead bullet, lit from the upper left.',
      prompt_cn: '只有一颗步枪弹立在画面正中，左右各空着一颗已经打出去的位置——它还在原来中间那一颗的地方。弹壳是带三块可见竖面的黄铜，有斜肩、弹颈和铅灰弹头，光从左上来。',
      must: ['exactly one upright rifle cartridge at the centre of the frame',
        'empty space of two missing cartridges on either side',
        'flat brass case with visible facets, shoulder and neck',
        'a single unbroken black ground filling the rest of the frame'],
      avoid: ['hands', 'weapons', 'any scenery', 'any light source in the picture']
    },
    {
      id: 'bg_black', ch: 'ch03', name: '全黑', svgOnly: true,
      prompt_en: 'A single unbroken flat black field, completely empty, no object, no light, no texture and no gradient anywhere in the frame.',
      prompt_cn: '一整片纯黑，空无一物：没有物件、没有光、没有纹理、没有渐变。',
      must: ['one unbroken flat black field filling the entire frame'],
      avoid: ['any object', 'any light source', 'gradient', 'texture']
    },

    /* ================= 第四至六章 通道 · 黎平 · 猴场 ================= */
    {
      id: 'bg_tongdao', ch: 'ch04', name: '通道·恭城书院',
      prompt_en: 'The inner courtyard of a small Confucian academy in Hunan in December 1934, in steady cold winter rain. Two storeys of dark timber rooms with rows of squared lattice windows face the wet stone courtyard on three sides, rain water runs off the curved eaves in thin threads and stands in shallow puddles on the flagstones, and one bare tree leans over the corner of the wall. Moss darkens the foot of the walls, the courtyard is empty of people, and the whole place is lit by flat grey rain light.',
      prompt_cn: '一九三四年十二月，湖南通道恭城书院的天井，冷冬雨不停。三面是两层深色木构，一排排方格窗棂对着湿石头天井；雨水顺着翘起的檐口拉成细线，石板上积着浅水洼；墙角探出一棵光树。墙脚有青苔。天井里没有人，整个院子是雨天平的灰光。',
      must: ['two storeys of dark timber rooms with rows of squared lattice windows',
        'curved eaves dripping in thin threads',
        'wet flagstone courtyard with shallow puddles',
        'one bare tree leaning over the corner of the wall',
        'an empty courtyard with no people'],
      avoid: ['snow covering the ground', 'bright sunlight', 'crowds']
    },
    {
      id: 'bg_liping', ch: 'ch05', name: '黎平会议',
      prompt_en: 'The inside of a wooden house in a small town in Guizhou on a wet winter night in December 1934. Plank walls and a low wooden ceiling frame a raised fire pit in the middle of the floor, where red embers and one small flame burn under a hanging kettle and the smoke goes up into the rafters. A wooden table with a teapot and two bowls stands beside the fire pit with one oil lamp burning on it, and the open door shows a dark street of stilt houses with wet shining stone. Three or four men in grey-green tunics sit around the fire pit turned away from the viewer.',
      prompt_cn: '一九三四年十二月，贵州小镇木屋，湿冷的夜里。木板墙、低矮的木顶，屋子中间是个抬高的火塘：红炭和一小簇火在吊着的铁壶下面烧，烟往上飘进梁里。火塘边一张木桌，上面有一把茶壶、两只碗和一盏油灯。敞着的门外是黑下来的吊脚楼街巷，石头被雨打湿发亮。三四个穿灰绿军装的人围着火塘坐，背对着镜头。',
      must: ['raised fire pit with red embers and one small flame under a hanging kettle',
        'plank walls and a low wooden ceiling with smoke rising into the rafters',
        'wooden table with a teapot, two bowls and one oil lamp',
        'open door showing a wet shining stone street of stilt houses',
        'three or four men sitting around the fire pit, seen from behind'],
      crowd: 'three or four men sitting around the fire pit, seen from behind',
      avoid: ['bright daylight', 'electric lights', 'modern furniture']
    },
    {
      id: 'bg_houchang', ch: 'ch06', name: '猴场·跨年夜',
      prompt_en: 'A courtyard in a small town on the Wu river in Guizhou at the turn of the year 1935, just after dark. Trampled thin snow covers the flagstones and is scattered with red paper from firecrackers; red paper door gods are pasted on both sides of the wooden gate and one square lantern hangs above it, the only warm light in the picture. A carved stone water jar and a stack of firewood stand against the wall, the gate opens onto a dark lane of wooden shop fronts, and soldiers and townspeople cross the courtyard in small moving groups.',
      prompt_cn: '一九三五年元旦前后，贵州乌江边小镇的院落，刚入夜。石板上一层被踩过的薄雪，雪上散着爆竹的红纸屑；木门两侧贴着红纸门神，门楣上挂一盏方灯——这是画面里唯一的暖光。墙根立着一口雕花石水缸和一堆劈柴，大门外是一条黑下来的木板铺面小巷，院里有三三两两走动的士兵和镇上的人。',
      must: ['trampled thin snow on flagstones scattered with red firecracker paper',
        'red paper door gods pasted on both sides of a wooden gate',
        'one square lantern above the gate as the only warm light',
        'carved stone water jar and a stack of firewood against the wall',
        'gate opening onto a dark lane of wooden shop fronts'],
      crowd: 'soldiers and townspeople crossing the courtyard in small groups, children among them',
      avoid: ['heavy snowfall', 'spring flowers', 'bright daylight', 'modern rooftops']
    },

    /* ================= 第七至九章 遵义 · 赤水 · 土城 · 扎西 ================= */
    {
      id: 'bg_zunyi', ch: 'ch07', name: '遵义会议楼',
      prompt_en: 'A two-storey grey brick mansion in Zunyi in January 1935, seen across its stone courtyard in the early morning. The upper floor runs as an open wooden gallery with dark red painted columns and railings under a shallow tiled roof with upturned eaves, and rows of tall shuttered windows face the courtyard. One ground-floor doorway stands open with a charcoal brazier just inside it glowing dull red on the boards, and telephone wires run along the wall under the eaves. The courtyard is paved with large stone slabs, a few bare branches hang over the enclosing wall, and one small sentry in a grey-green tunic stands in the shadow at the foot of the outside stairs.',
      prompt_cn: '一九三五年一月，遵义，清晨，从石铺天井对面看这座灰砖二层楼。楼上一层是一道木回廊，廊柱与栏杆漆成暗红色，上面压着翘檐的瓦顶，一排高大的板窗朝着天井。楼下有一处门敞着，门里一只炭盆把地板映出暗红。檐下墙面上绷着几条电话线。天井铺着大石板，院墙上探出几枝光枝，外楼梯脚下的阴影里站着一名灰绿军装的哨兵。',
      must: ['two-storey grey brick mansion with an open wooden gallery',
        'dark red painted columns and railings under upturned tiled eaves',
        'charcoal brazier glowing dull red inside an open ground-floor doorway',
        'stone-slab courtyard and bare branches over the enclosing wall',
        'one small lone sentry standing in shadow at the foot of the stairs'],
      avoid: ['modern vehicles', 'electric street lamps', 'crowds', 'neon']
    },
    {
      id: 'bg_council_hall', ch: 'ch04', name: '会议厅·通用',
      prompt_en: 'A small meeting room inside an old Chinese timber house on a winter night in 1934. One kerosene lantern stands on a long dark wooden table and lights the middle of the room, two large unrolled maps cover the table and a third hangs on the plank wall behind with its corners weighted, and plain benches line the table on both sides. A charcoal brazier glows dull red in the corner, the floor is bare dark boards, and the one window is a wooden lattice covered with paper that shows the cold blue of the night outside. Four or five men in grey-green tunics sit and stand around the table with their backs or sides to the viewer, their faces turned down toward the maps.',
      prompt_cn: '一九三四年冬夜，一间木结构老屋的小会议室。一盏马灯立在一张长木桌上，照亮屋子中间；桌上是两张摊开的大地图，木墙后面还挂着第三张，四角压着东西；桌子两边是几条长凳。屋角一盆炭火发着暗红。地面是深色裸木板。唯一的窗子是木格窗，糊着纸，透出外面夜的冷蓝。四五个穿灰绿军装的人围着桌子坐或站，背影或侧身，脸都朝下看着地图。',
      must: ['one kerosene lantern on a long dark wooden table lighting the room centre',
        'two large maps spread on the table and a third hanging on the plank wall',
        'plain benches along both sides of the table',
        'charcoal brazier glowing dull red in the corner',
        'paper-covered lattice window showing cold blue night'],
      crowd: 'four or five officers gathered around the map table, seen from behind and in side view',
      avoid: ['electric lights', 'modern furniture', 'bright daylight']
    },
    {
      id: 'bg_map_table', ch: 'ch02', name: '指挥部·地图桌',
      prompt_en: 'The inside of a farmhouse command post in the field at night in 1934. A large operational map is spread over a plain wooden table and weighted at the corners with a candle stub, a tin of pencils, a field telephone with a cloth-covered cord, and an enamel mug; the map itself is covered with drawn arrows, circles and small blocks. One kerosene lantern hangs from a beam above the table and lights the paper while the rest of the room falls into shadow, with a mud wall, a shuttered window and a straw mat on the earth floor behind. Several officers stand and lean over the map with their faces turned down to the paper, seen only from behind and from the side.',
      prompt_cn: '一九三四年，野地里一间民房改建的指挥部，夜里。一张大比例作战地图摊在素木桌上，四条边用一截蜡烛头、一个铅笔筒、一部带布皮线绳的野战电话和一只搪瓷缸压住；地图上画满箭头、圈和小方块。一盏马灯挂在梁上，只照亮那张纸，屋里其余部分沉进阴影；身后是土墙、一扇关着的板窗和地上的草席。几个军官站在桌边伏着看图，脸都朝下，只能看见背影和侧身。',
      must: ['large operational map spread over a plain wooden table with drawn arrows, circles and blocks',
        'map corners weighted with a candle stub, a tin of pencils, a field telephone and an enamel mug',
        'one kerosene lantern hanging from a beam as the only light',
        'mud wall, shuttered window and straw mat on an earth floor behind',
        'officers leaning over the map with their faces turned down to the paper'],
      crowd: 'several officers standing and leaning over the map table, seen from behind and in side view',
      avoid: ['electric light', 'modern office', 'bright daytime', 'electric desk lamp']
    },
    {
      id: 'bg_tucheng', ch: 'ch08', name: '土城',
      prompt_en: 'A small river town of rammed earth walls in northern Guizhou in January 1935, seen along its only street during a lull in the fighting. The street is narrow and paved with stone slabs and lined with earthen walls and wooden shop fronts; a covered tea barrel with a coarse porcelain bowl beside it stands against one half-open door. Grey gun smoke drifts between the roofs, one house has lost part of its front wall with the broken boards stacked as a barricade across the lane, and at the end of the street the red-brown river shows between the buildings.',
      prompt_cn: '一九三五年一月，黔北土城，趁枪声稍歇时从小镇唯一的街上望过去。街很窄，石板铺地，两边是土墙和木板铺面；一处半开的门边摆着带盖的茶桶和一只粗瓷碗。灰白的硝烟在屋顶之间飘。有一户人家的前墙塌了半边，断门板堆在街心当路障。街的尽头从两排房子之间露出赤褐色的河水。',
      must: ['narrow street paved with stone slabs between rammed earth walls',
        'covered tea barrel with a coarse porcelain bowl beside a half-open door',
        'grey gun smoke drifting between the roofs',
        'one house with its front wall broken and boards stacked as a barricade',
        'red-brown river showing between the buildings at the end of the street'],
      crowd: 'soldiers moving along the street with rifles and a stretcher, and townspeople watching from behind half-open doors',
      avoid: ['modern weapons', 'fire covering the town', 'bright sunlight']
    },
    {
      id: 'bg_chishui', ch: 'ch08', name: '赤水河',
      prompt_en: 'A river gorge in northern Guizhou in January 1935 under low cloud. The river runs red-brown between steep banks of red sandstone, white water breaking around boulders in the narrow channel, and a flight of worn stone steps drops down the near bank to a small ferry landing where a plank walkway and a hauling rope are rigged on posts. Bamboo and thin pines cling to the ledges above, wet rock walls rise on both sides, and a cold mist sits on the water in the middle distance.',
      prompt_cn: '一九三五年一月，黔北河谷，低压的云下。河水在陡峭的红砂岩岸之间流成赤褐色，窄河道里白浪在礁石上碎开；近岸一道磨旧的石阶下到小小的渡口，渡口的木桩上架着跳板和一根拉船的缆绳。岸壁的石台缝里长着竹子和细松，两侧都是湿淋淋的岩壁，中景的水面上压着一层冷雾。',
      must: ['red-brown river water running between steep red sandstone banks',
        'white water breaking around boulders in a narrow channel',
        'worn stone steps down to a small ferry landing',
        'plank walkway and a hauling rope rigged on posts',
        'bamboo and thin pines on the rock ledges above'],
      crowd: 'a short column of tiny soldiers moving down the stone steps toward the landing',
      avoid: ['blue or green water', 'motor boats', 'broad flood plain']
    },

    /* ================= 第十至十一章 娄山关 · 赤水循环 ================= */
    {
      id: 'bg_loushanguan', ch: 'ch10', name: '娄山关',
      prompt_en: 'A stone pass high in the Lou mountain range in Guizhou on the afternoon of 26 February 1935. Two steep bare rock peaks flank a narrow gap through which a single road climbs in switchbacks, and a sea of cloud fills the valley below with its topmost layer burning copper in the low sun. Wind-bent pines stand along the ridge line, the stone parapet of the old pass is broken in places, and the road inside the gap stays in cool shadow while the cloud sea takes the last light.',
      prompt_cn: '一九三五年二月二十六日下午，贵州娄山关。两座陡立的裸岩山峰夹着一道窄口，一条路从山口里折着往上；山下是一整片云海，云层最上面那一层被斜阳烧成铜色。山脊线上立着被风吹歪的松树，旧关隘的石垒残缺不全。山口里的路留着冷影，云海却接着最后的阳光。',
      must: ['two steep bare rock peaks flanking a narrow pass',
        'single road climbing through the gap in switchbacks',
        'sea of cloud filling the valley with a copper-lit top layer',
        'wind-bent pines along the ridge line and a broken stone parapet'],
      crowd: 'a column of tiny soldiers moving up through the pass and a crowd of prisoners sitting in rows on the open ground below it',
      avoid: ['green forest covering the peaks', 'bright midday sun', 'metal railings']
    },
    {
      id: 'bg_jinsha', ch: 'ch12', name: '金沙江·皎平渡',
      prompt_en: 'A deep narrow river canyon in Yunnan in May 1935, seen from the northern landing. Sheer rock walls rise on both sides and the river runs fast along the bottom of the gorge with white foam breaking beside the rocks; seven small wooden boats lie moored at the landing and one is out in the current with two men poling at it. Worn stone steps climb the near bank, a shallow sand strip runs beside the water, and the opposite wall is one unbroken face of grey-brown rock with a single narrow trail cut across it.',
      prompt_cn: '一九三五年五月，云南金沙江皎平渡，从北岸渡口看过去。两侧是笔直的岩壁，江水在谷底跑得很快，贴着礁石翻起白沫；渡口停着七条小木船，另有一条在江心，两个人正拿篙撑着。近岸一道磨旧的石阶往上爬，水边是一条浅沙滩；对岸是一整面灰褐色岩壁，壁上切出一条窄窄的栈道。',
      must: ['sheer rock walls rising on both sides of a deep narrow canyon',
        'fast grey river with white foam breaking beside the rocks',
        'seven small wooden boats moored at the landing and one out in the current',
        'worn stone steps climbing the near bank and a shallow sand strip',
        'a single narrow trail cut across the opposite rock wall'],
      crowd: 'boatmen and soldiers waiting on the stone steps and at the landing',
      avoid: ['wide open river', 'modern boats', 'blue tropical water']
    },

    /* ================= 第十三至十五章 彝海 · 大渡河 · 泸定桥 ================= */
    {
      id: 'bg_yihai', ch: 'ch13', name: '彝海',
      prompt_en: 'A high mountain lake in Sichuan in May 1935, seen from its shore in the middle of the day under thin cloud. The water is clear and completely still, reading as one flat sheet of dull steel with no ripples anywhere, ringed by dark pine forest and bare grey ridges beyond. Several hundred people sit on the grass under the pines in loose groups, wrapped in dark felt cloaks with black cloth turbans wound around their heads, and a line of Red Army soldiers stands on the open shore facing them.',
      prompt_cn: '一九三五年五月，四川高山湖泊彝海，白天薄云下，从岸边看。湖水清而极静，像一整块没有波纹的钝钢；四周是深色的松林，再远是灰秃的山脊。松树下草坡上散坐着几百个人，身披深色查尔瓦披毡，头上裹着黑布头帕；开阔的岸边站着一排红军战士，正对着他们。',
      must: ['clear completely still lake reading as one flat sheet of dull steel',
        'dark pine forest ringing the shore with bare grey ridges beyond',
        'several hundred people seated in loose groups on the grass under the pines',
        'dark felt cloaks and black cloth turbans',
        'a line of Red Army soldiers standing on the open shore'],
      crowd: 'several hundred Yi people seated under the pines and a line of soldiers on the shore, all clearly different individuals',
      avoid: ['weapons raised in the air', 'modern clothing', 'bright saturated water', 'motor boats']
    },
    {
      id: 'bg_dadu', ch: 'ch14', name: '大渡河·安顺场',
      prompt_en: 'A violent river in western Sichuan in May 1935, seen from the southern bank. The current runs across the frame in long white breaking lines and churns between boulders and rock slabs on the shore, and high cliff walls close the far side. One wooden boat works at the near landing with a long pole and a steering oar, a hauling rope is rigged along the bank, and behind the landing a low building of stone and timber with a tiled roof stands back from the water beside a broad flat boulder used as a platform.',
      prompt_cn: '一九三五年五月，川西大渡河，从南岸看。江水横着拉出一道道长长的白浪，在岸边的乱石与石板上翻搅；对岸是高高的崖壁。近岸渡口上一条木船正在作业，一根长篙、一支橹；岸边拉着一条缆绳。渡口后面退开水面处，是一栋石头与木头混建的瓦顶矮房，旁边立着一块当作台子用的大平石。',
      must: ['violent current running in long white breaking lines',
        'boulders and rock slabs on the shore',
        'high cliff walls closing the far side',
        'one wooden boat at the near landing with a long pole and a steering oar',
        'a low stone and timber building with a tiled roof and a broad flat boulder platform'],
      crowd: 'the rowing party and soldiers waiting at the landing in ones and threes',
      avoid: ['calm water', 'iron bridge', 'sunny blue sky']
    },
    {
      id: 'bg_luding', ch: 'ch15', name: '泸定桥',
      prompt_en: 'A chain suspension bridge across a steep river gorge in Sichuan in May 1935, seen from the eastern bridgehead in the late afternoon. Thirteen iron chains stretch between the two stone bridge towers, nine of them forming the walkway and four running as handrails, and most of the planks have been removed so that long empty spans hang above the water with only a short run of planks left near the eastern tower. Fire burns at the eastern end of the bridge, sending up flame and black smoke, and the river below is a white torrent between wet rock walls.',
      prompt_cn: '一九三五年五月下午晚些时候，四川泸定桥，从东岸桥头看。十三根铁索在两座石砌桥楼之间拉直，其中九根做桥面、四根做扶手；桥板大部分已被抽掉，水面上方空出一段段长长的缺口，只有靠东桥楼这一小段还留着几块板。桥的东端在烧，火焰和黑烟往上走；桥下的河水在湿岩壁之间是一片白浪。',
      must: ['thirteen iron chains between two stone bridge towers, nine as walkway and four as handrails',
        'most planks removed with long empty spans above the water',
        'only a short run of planks left near the eastern tower',
        'fire with black smoke burning at the eastern end of the bridge',
        'white torrent of a river between steep rock walls below'],
      crowd: 'small soldiers working their way out along the bare chains and a few men gathered at the eastern bridgehead',
      avoid: ['a complete deck of planks', 'modern suspension bridge', 'calm river']
    },

    /* ================= 第十六至十八章 雪山 · 草地 · 腊子口 ================= */
    {
      id: 'bg_snow_mountain', ch: 'ch16', name: '夹金山',
      prompt_en: 'A high snow ridge in Sichuan in June 1935, seen from just below the pass. Wind drives loose snow across a bare white slope where every fold reads as a hard-edged plane, crevasse lines cut across a glacier on the left, and the pass itself is marked by one wind-polished white stone with a bare branch stuck into the snow beside it. Light comes flat and grey-white from a high overcast sky so that sky and snow almost meet in value, and a long thin line of tiny soldiers climbs the ridge toward the pass with their heads down.',
      prompt_cn: '一九三五年六月，四川夹金山，从垭口下方看。风把浮雪刮过一片光裸的白坡，坡上每一道褶子都是一块硬边的面；左侧一道冰川横着裂开；垭口处只有一块被风磨白的石头，旁边插着一截光树枝。天阴得高而平，天地几乎同明度；一条又细又长的队伍低着头往垭口爬。',
      must: ['bare white snow slope where every fold reads as a hard-edged plane',
        'crevasse lines cutting across a glacier on the left',
        'one wind-polished white stone at the pass with a bare branch stuck in the snow',
        'flat grey-white light with sky and snow almost equal in value',
        'long thin line of tiny soldiers climbing the ridge with heads down'],
      crowd: 'the long thin line of tiny soldiers climbing the ridge toward the pass',
      avoid: ['green vegetation on the upper slope', 'sunny blue sky', 'ski equipment']
    },
    {
      id: 'bg_maogong', ch: 'ch17', name: '懋功会师',
      prompt_en: 'A small mountain town in western Sichuan in June 1935, seen from the valley road on a bright afternoon. Layers of grey tiled roofs and earthen walls climb the slope in steps with a square stone watchtower standing above them, and a wooden plank walkway hangs on the cliff face across the valley. On the road below, two columns of soldiers have met: they wear the same grey-green tunics and octagonal caps with red stars, several red flags are raised, and the two crowds press together with rifles held up and arms around each other.',
      prompt_cn: '一九三五年六月，川西小城懋功，明亮的下午，从谷底路上看。层层灰瓦顶和土墙沿坡一级一级往上排，上面立着一座方形石碉楼；谷对岸的崖壁上挂着一条木栈道。下面的路上，两支队伍迎头会合：一样的灰绿军装、一样的八角帽红星，几面红旗举起来，两队人挤在一起，有人举枪、有人抱在一起。',
      must: ['layers of grey tiled roofs and earthen walls climbing the slope',
        'a square stone watchtower above the roofs',
        'a wooden plank walkway hanging on the cliff across the valley',
        'two converging columns of soldiers meeting on the valley road',
        'raised red flags and soldiers with arms around each other'],
      crowd: 'two converging columns of soldiers greeting each other, several hundred visible',
      avoid: ['modern city', 'motor road', 'aircraft']
    },
    {
      id: 'bg_grassland', ch: 'ch17', name: '松潘草地',
      prompt_en: 'An endless flat marsh in western Sichuan in August 1935 under a low grey sky. Water pools lie between hummocks of dead yellow grass in every direction, not one tree breaks the horizon, and the only line in the landscape is a faint track of trampled grass curving away into the distance. Rain falls in thin visible streaks, the pools reflect the pale sky like dull metal, and a scattered column of soldiers wades along the track, spaced out one behind another, leaning on sticks and carrying packs.',
      prompt_cn: '一九三五年八月，川西松潘草地，低压的灰天。四面八方都是枯黄草墩之间的一汪汪水，地平线上没有一棵树；整片土地上唯一的一条线，是一道被踩倒的草径，弯着伸向远处。雨落成细细可见的斜纹，水洼把灰白的天空照成钝金属的颜色。一列拉得很散的队伍沿着草径淌水前进，一个跟一个隔着距离，拄着棍子、背着包。',
      must: ['endless flat marsh of dead yellow grass hummocks and water pools',
        'not one tree on the horizon',
        'a faint track of trampled grass curving away into the distance',
        'thin visible rain streaks and pools reflecting a pale sky like dull metal',
        'scattered column of soldiers wading along the track with sticks and packs'],
      crowd: 'the scattered column of soldiers wading through the marsh along the track',
      avoid: ['trees', 'hills', 'villages', 'bright sunshine']
    },
    {
      id: 'bg_lazikou', ch: 'ch18', name: '腊子口',
      prompt_en: 'A narrow slot canyon in Gansu in September 1935, seen from outside the entrance at first light. Two sheer rock walls close on a gap about thirty metres wide, a small river runs out along the canyon floor and one wooden bridge crosses it, and on the far side of the bridge a cluster of low stone and timber blockhouses with dark firing slits sits against the cliff with sandbags piled at their base. Ropes and a few damaged beams hang on the near cliff face where men have begun to climb, and the strip of sky between the walls is pale grey with the rest of the gorge still in shadow.',
      prompt_cn: '一九三五年九月，甘肃腊子口，天刚亮时从峡谷口外面看。两道陡直的岩壁夹着约三十米宽的一条缝，谷底一条小河淌出来，河上架着一座木桥；桥那头的崖根下蹲着一片低矮的石木碉堡，射孔是黑的，堡脚堆着沙袋。近处这边的崖壁上垂着绳索和几根断木，人已经开始往上爬；两壁之间那条天空是灰白的，峡谷其余部分还在阴影里。',
      must: ['two sheer rock walls closing on a gap about thirty metres wide',
        'small river along the canyon floor with one wooden bridge across it',
        'cluster of low stone and timber blockhouses with dark firing slits and sandbags',
        'ropes and damaged beams hanging on the near cliff face',
        'pale grey strip of sky between the walls with the gorge in shadow'],
      crowd: 'soldiers at the near bridgehead behind the rocks and a few figures working their way up the cliff on the left',
      avoid: ['wide open valley', 'motor road', 'sunny sky']
    },

    /* ================= 第十九至二十章 哈达铺 · 吴起镇 · 延安 · 会宁 ================= */
    {
      id: 'bg_hadapu', ch: 'ch19', name: '哈达铺',
      prompt_en: 'A small town main street in Gansu in September 1935, seen along its length in the clear afternoon light of the loess country. Shops with wooden fronts and cloth awnings line both sides of a stone-paved street: a general store with sacks and jars outside its door, a medicine shop with a wall of small drawers, a noodle shop, and a mule inn with a broad open gateway. Cloth banners hang from poles above the shopfronts but every banner is blank and unreadable, a faded metal plate is nailed to a board wall beside one doorway, and baskets and copper pots sit on the ground. Bare brown hills close the far end of the street.',
      prompt_cn: '一九三五年九月，甘肃哈达铺，黄土地方清亮的下午，顺着街看清整条街。石板街两边是木板门脸的铺子：杂货铺门口堆着口袋和坛子，药铺有一整面小抽屉的药柜，一家面馆，还有一家院子敞着的骡马店。铺子上方从杆子上垂下布幌子，但每一面幌子都是空的、认不出字；一处门边的板墙上钉着一块褪色的铁皮牌子；地上摆着筐子和铜壶。街的远端是一列光秃的褐色山丘。',
      must: ['stone-paved main street with shops on both sides under cloth awnings',
        'general store with sacks and jars, medicine shop with a wall of small drawers, noodle shop, mule inn',
        'cloth banners hanging above the shopfronts that are blank and unreadable',
        'baskets and copper pots standing on the ground',
        'bare brown hills closing the far end of the street'],
      crowd: 'soldiers shopping at the stalls and townspeople with children among them',
      avoid: ['readable text or letters on any sign or banner', 'motor vehicles', 'electric wires']
    },
    {
      id: 'bg_wuqi', ch: 'ch19', name: '吴起镇',
      prompt_en: 'A dry loess plateau in northern Shaanxi in October 1935, seen from the edge of a gully in the late afternoon. Rows of arched cave dwellings are cut into the far wall of the gully, each with a dark doorway and a paper window, and a bare jujube tree stands beside them with low ochre ridges running away to the horizon behind. The earth wall above the caves carries only weathered whitewash: a few long faint horizontal pale streaks and soft smudged patches that are pure abstract texture, with no letter shapes, no glyphs, no symbols and nothing resembling writing or painting of any kind. Two red flags stand on poles near the dwellings.',
      prompt_cn: '一九三五年十月下午，陕北黄土塬，从一条沟的边上看。沟对面壁上掏出一排拱形窑洞，每孔一个黑洞洞的门和一扇纸窗；旁边立着一棵光秃的枣树，身后是黄褐色的低塬一直铺到天边。窑洞上方的土墙上只有被风蚀过的白灰：几道淡淡的横向痕迹和模糊的浅斑，纯粹是抽象的墙面质感，没有任何字形、符号，也没有任何像字、像画的东西。窑洞边上竖着两面红旗。',
      must: ['rows of arched cave dwellings cut into the gully wall with dark doorways and paper windows',
        'a bare jujube tree beside the dwellings',
        'low ochre ridges running away to the horizon',
        'weathered whitewash on the earth wall left as abstract faint streaks with no letter shapes',
        'two red flags on poles near the dwellings'],
      crowd: 'a column of soldiers coming down into the gully and villagers standing outside the cave doorways',
      avoid: ['readable characters', 'letter-like marks', 'painted calligraphy', 'painted slogans',
        'green forest', 'wet ground']
    },
    {
      id: 'bg_yanan_cave', ch: 'ch19', name: '延安窑洞',
      prompt_en: 'The inside of a cave dwelling in northern Shaanxi at night. A barrel-vaulted room is cut into the earth, its walls plastered pale and washed with the warm light of one small oil lamp standing on a wooden table under the vault. Half of a large paper map lies lit on the table while the rest falls away into shadow, with a thick worn book, a rolled newspaper and a chipped enamel mug beside it. A brick platform bed with a folded quilt sits against the far wall, a paper window with a wooden frame shows cold night blue, a water jar stands in the corner, and one man in a grey-green tunic sits at the table with his back to the viewer.',
      prompt_cn: '陕北夜里，一孔窑洞的内部。拱形土洞，墙面抹得发白，靠拱顶下一张木桌上的小油灯暖光洗过一遍。桌上摊着半张大地图，亮的那半在灯光里、剩下的一半沉进阴影，旁边有一本翻旧的厚书、一卷报纸和一只磕了口的搪瓷缸。对面墙根是一铺砖炕，上面叠着被子；木格纸窗透出夜的冷蓝；屋角立着一口小水缸。一个穿灰绿军装的人坐在桌边，背对镜头。',
      must: ['barrel-vaulted cave room with pale plastered walls',
        'one small oil lamp on a wooden table under the vault as the only light',
        'half of a large paper map lit on the table with a thick book, a rolled newspaper and an enamel mug',
        'brick platform bed with a folded quilt and a paper window showing cold night blue',
        'one man in a grey-green tunic seated at the table with his back to the viewer'],
      avoid: ['electric light', 'modern furniture', 'glass window', 'bright daylight']
    },
    {
      id: 'bg_huining', ch: 'ch20', name: '会宁会师',
      prompt_en: 'A rammed earth city wall and gate tower in Gansu in October 1936, seen from the open ground in front of the gate. The wall is thick ochre earth, the gate tower is a low two-storey timber building with a tiled roof and dead grass growing along its ridge, and three flags on tall poles stand above it. The ground in front of the gate is packed with two armies meeting: thousands of soldiers in grey-green tunics and octagonal caps with red stars fill the whole width of the road, some raising rifles, some carrying the wounded on stretchers, some with their arms around each other, with villagers watching from the side.',
      prompt_cn: '一九三六年十月，甘肃会宁，从城门前的空地上看。城墙是厚厚的黄土夯的，城门上是两层木构矮楼，瓦顶的屋脊上长着枯草，楼上竖着三面临风的大旗。门前的地上挤满了两支会师的队伍：几千名灰绿军装、八角帽红星的战士铺满整条路，有的举枪，有的抬着担架上的伤员，有的抱在一起；路边站着看热闹的老乡。',
      must: ['thick ochre rammed earth city wall and a low two-storey timber gate tower',
        'dead grass growing along the ridge of the tiled gate tower roof',
        'three flags on tall poles above the gate tower',
        'thousands of soldiers of two armies filling the ground in front of the gate',
        'stretchers carrying the wounded and villagers watching from the side'],
      crowd: 'thousands of soldiers of two armies packing the ground in front of the gate, mixed with stretcher parties and villagers',
      avoid: ['modern city', 'vehicles', 'aircraft', 'concrete buildings']
    },

    /* ================= 2026-10 剧情换景补画：十二张新场景 ================= */
    {
      id: 'bg_houchang_street', ch: 'ch06', name: '猴场镇口',
      prompt_en: 'The open ground at the entrance of a small town in Guizhou on a cold January evening in 1935. A low stone platform serves as a makeshift stage at one side of the square, with a rough cloth backdrop and two oil lamps hanging at its corners throwing the only warm light. On the stage a young propaganda soldier in a costume cut from a bedsheet plays a long-term labourer, while a stout landlord in a padded gown is made to sit at the edge of the platform. A crowd of villagers in patched cotton jackets stands in the thin snow watching, some with children on their shoulders, an old woman wiping her eyes. Behind them are mud-brick houses with dark tile roofs, a wooden town gate and bare trees under a deep blue winter sky.',
      prompt_cn: '一九三五年一月，贵州猴场镇口，寒冷的傍晚。广场一侧用矮石台搭了个戏台，台后挂一块粗布幕，台角吊着两盏油灯，这是画面里唯一的暖光。台上一个年轻宣传员穿着用被单改的戏服演长工，一个穿棉袍的胖老财被按在台边坐着。台下站满穿补丁棉袄的乡亲，薄雪盖着地面，有人把孩子扛在肩上，一个老妇人正在抹眼泪。他们身后是土坯墙、黑瓦顶的房屋、一座木镇门和光秃的树，天是深蓝的冬夜。',
      must: ['low stone platform stage with a rough cloth backdrop and two oil lamps', 'young propaganda soldier in a bedsheet costume playing a labourer on stage', 'stout landlord in a padded gown seated at the edge of the platform', 'crowd of villagers in patched cotton jackets standing in thin snow', 'mud-brick houses, a wooden town gate and bare trees behind the square'],
      crowd: 'villagers of different ages in patched padded jackets, some carrying children, an old woman wiping her eyes',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'modern stage lighting', 'electric lights']
    },
    {
      id: 'bg_wujiang', ch: 'ch06', name: '江界河强渡乌江',
      prompt_en: 'The Jiangjie River crossing on the Wu River in Guizhou at dawn in early January 1935, seen from the near bank across a deep gorge. Sheer dark cliffs drop on both sides into a fast black-green river, and three bamboo rafts crowded with soldiers in grey-green uniforms are poling and paddling toward the far bank. Water columns from falling shells rise around the rafts, muzzle flashes and powder smoke mark the enemy blockhouse and trenches on the far cliff, and a woven bamboo cable runs across the gorge. The near bank is a narrow stone beach crowded with waiting soldiers and stacked rafts, with bare winter scrub on the rocks and a pale cold sky above the gorge.',
      prompt_cn: '一九三五年一月初，贵州江界河渡口，清晨，从近岸看整条乌江峡谷。两岸陡直的深色崖壁落进湍急的青黑色江水，三只竹排载满穿灰绿军装的战士，正撑着竹竿向对岸冲。竹排周围竖起炮弹落水的白色水柱，对岸崖根处的碉堡和战壕闪着枪口火光、腾着硝烟，一条竹缆横过峡谷。近岸是一片窄石滩，挤着待渡的战士和叠放的竹排，岩石上只有冬天的枯草，峡谷上方是一线灰白的冷天。',
      must: ['deep narrow gorge with sheer dark cliffs on both banks', 'fast black-green river filling the gorge floor', 'three bamboo rafts crowded with soldiers crossing under fire', 'shell splashes around the rafts and muzzle flashes from the far bank', 'narrow stone beach on the near bank with waiting soldiers and stacked rafts'],
      crowd: 'soldiers packed on the bamboo rafts and a column waiting on the near stone beach',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'modern bridge', 'motor road']
    },
    {
      id: 'bg_zunyi_street', ch: 'ch07', name: '遵义街头',
      prompt_en: 'A busy old street in Zunyi, Guizhou, in January 1935, seen along its length in clear winter daylight. Two-storey timber shopfronts with dark tiled roofs and whitewashed walls line a stone-paved street: a medicine shop with a wall of small wooden drawers, a cloth shop with bolts of indigo and grey fabric stacked in its doorway, a rice shop with open sacks, and a barber stall with a basin and a stool under a cloth awning. Red paper lanterns hang under the eaves, all of them blank, and townspeople in padded cotton coats bargain with soldiers in faded grey-green uniforms. Porters with carrying poles and baskets fill the middle distance, and low hills close the far end of the street.',
      prompt_cn: '一九三五年一月，贵州遵义，清亮的冬日，顺着街看清整条老街。石板街两边是两层木结构铺面，黑瓦顶、白粉墙：药铺里有一整面小木抽屉的药柜，布店门口堆着一匹匹靛蓝和灰色的布，米行的口袋敞着口，剃头摊在布棚下摆着一张凳子和一只铜盆。屋檐下挂着红纸灯笼，灯笼全是空白的；穿棉袍的市民正和穿褪色灰绿军装的战士讨价还价。中景里有挑担子的脚夫和提篮的人，街的远端是一列低矮的山。',
      must: ['stone-paved street lined with two-storey timber shopfronts', 'medicine shop with a wall of small wooden drawers', 'cloth shop with bolts of indigo and grey fabric and a rice shop with open sacks', 'barber stall with a basin and stool under a cloth awning', 'red paper lanterns under the eaves left blank and unreadable'],
      crowd: 'townspeople in padded coats bargaining with soldiers, porters with carrying poles and baskets',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'motor vehicles', 'electric wires']
    },
    {
      id: 'bg_mianning_yamen', ch: 'ch13', name: '冕宁县政府·土牢',
      prompt_en: 'The courtyard of a small county government office in Mianning, Sichuan, in May 1935, seen from the broken main gate. A single row of low tile-roofed timber offices faces a stone-paved courtyard, and the heavy wooden gate hangs splintered and forced open. Along the far side are three low earthen jail cells with iron chains and heavy padlocks on their doors, one door standing open to show wet straw on the floor, iron shackles on the wall, a wooden yoke and a small barred window. Puddles and a few gnawed corn cobs lie against the cell wall, and a group of released Yi prisoners in dark homespun clothing stands in the courtyard, an old man clutching a stone.',
      prompt_cn: '一九三五年五月，四川冕宁，从小衙门被砸开的大门往里看县政府院子。一排低矮的瓦顶木构办公房围着一块石板院坝，厚重的木门裂开、歪挂在门框上。院子对面是三间低矮的土牢，牢门上着铁链和大锁，其中一扇敞着，能看见地上的湿稻草、墙上的铁镣、一副木枷和一扇很小的带栏木窗。牢墙根积着水，水里泡着几根啃剩的玉米芯；院里站着一群被放出来的彝族百姓，穿着深色土布衣服，一个老人抱着一块石头。',
      must: ['low single-storey tile-roofed county office row around a stone courtyard', 'splintered wooden gate forced open', 'three low earthen jail cells with iron chains and padlocks', 'open cell showing wet straw, iron shackles and a small barred window', 'released Yi prisoners in dark homespun clothing in the courtyard'],
      crowd: 'released Yi prisoners of different ages standing in the courtyard, an old man holding a stone',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'modern prison bars', 'concrete buildings']
    },
    {
      id: 'bg_lazikou_cliff_night', ch: 'ch18', name: '夜攀腊子口绝壁',
      prompt_en: 'The cliff above Lazikou Pass in Gansu at night in September 1935, seen from the rock face itself. A sheer wall of dark fractured rock rises out of the frame, broken by narrow ledges, roots and cracks, with a rope made of many grey cloth puttees tied end to end hanging down its face. Several soldiers in faded uniforms cling to the rock and haul themselves upward, one of them reaching for the rope with a rifle slung across his back, while far below at the bottom of the gorge a wooden bridge and the tiny muzzle flashes of the bridgehead are visible. Cold starlight picks out the upper edges of the rock, and the valley is filled with blue-black shadow.',
      prompt_cn: '一九三五年九月，甘肃腊子口，夜里，从绝壁本身的角度看。整幅画面是一面深色碎裂的陡岩，岩面上只有窄石棱、树根和裂缝，一条由许多条灰色绑腿首尾接成的长绳从上方垂下来。几个穿褪色军装的战士贴在岩壁上往上攀，其中一个背着步枪伸手去抓绳子；峡谷深处能看见一座木桥和桥头极小的枪口火光。清冷的星光只勾出岩石上缘的轮廓，山谷里全是蓝黑的阴影。',
      must: ['sheer fractured rock wall filling the frame', 'rope made of many cloth puttees tied end to end hanging down the cliff', 'soldiers clinging to the rock and climbing', 'wooden bridge and tiny muzzle flashes far below in the gorge', 'cold starlight on the upper edges with blue-black shadow below'],
      crowd: 'several climbers spread across the cliff face at different heights',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'daylight', 'moon disc']
    },
    {
      id: 'bg_gannan_loess', ch: 'ch18', name: '甘南黄土坡',
      prompt_en: 'An open loess plateau in southern Gansu in September 1935, seen from a low ridge in clear morning light. Broad rolling slopes of ochre and pale yellow earth stretch away in wide folds, cut by deep dry gullies, with sparse dry grass, a few bare shrubs and terraced fields on the farther slopes. A long column of soldiers in faded grey-green uniforms winds down a footpath toward the foreground, small at middle distance, and thin morning haze lies in the bottoms of the gullies. There is no town, no gate and no city wall anywhere in the picture, only empty highland and a pale blue sky.',
      prompt_cn: '一九三五年九月，甘南，清亮的晨光里从一道低梁上看开阔的黄土坡。赭黄和浅黄的土坡一层层铺开，被深深的干沟切开，坡上只有稀疏的枯草、几丛光秃的灌木和远处几块梯田。一长列穿褪色灰绿军装的战士沿一条土路向近处蜿蜒下行，人在中景里很小；沟底浮着薄薄的晨雾。画面里没有镇子、没有城门、也没有城墙，只有空阔的高原和淡蓝的天。',
      must: ['broad rolling loess slopes in ochre and pale yellow', 'deep dry gullies cutting the plateau', 'sparse dry grass, bare shrubs and terraced fields', 'long column of soldiers winding down a footpath at middle distance', 'empty highland with no town or city wall'],
      crowd: 'a long column of soldiers descending the footpath, small at middle distance',
      avoid: ['town', 'city wall', 'gate tower', 'readable characters', 'letter-like marks', 'painted slogans']
    },
    {
      id: 'bg_hadapu_school', ch: 'ch19', name: '哈达铺读报会议',
      prompt_en: 'The inside of a small village school in Hadapu, Gansu, in September 1935, used as a meeting room in the afternoon. Whitewashed clay walls and a plastered earth floor enclose the room, with paper windows on one side letting in cool daylight and a long blank blackboard on the far wall. An old wooden Eight Immortals table stands in the middle covered with a spread of worn newspapers, their columns of type blurred and unreadable, and four or five men in faded grey-green uniforms and octagonal caps lean over it, one holding a page up to the light. Wooden benches and a few school desks are pushed back against the wall, and an enamel mug and a folded map sit at the table edge.',
      prompt_cn: '一九三五年九月，甘肃哈达铺，下午，一间被当作会议室的小学教室内部。白灰抹的土墙、夯实的土地面，一侧的纸窗透进冷白的天光，对面墙上是一块长长的空黑板。屋子中间摆着一张旧八仙桌，桌上摊满磨旧的报纸，报纸上的字行模糊、认不出；四五个穿褪色灰绿军装、戴八角帽的人俯在桌边看报，其中一人把一张报纸举到光下。长凳和几张课桌靠墙推着，桌角放着一只搪瓷缸和一张折起的地图。',
      must: ['whitewashed clay walls and plastered earth floor of a village schoolroom', 'long blank blackboard on the far wall', 'old wooden Eight Immortals table covered with worn newspapers', 'four or five men in grey-green uniforms leaning over the table', 'paper windows letting in cool daylight'],
      crowd: 'four or five leaders and staff in grey-green uniforms gathered around the table, of different builds and ages',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'modern classroom furniture', 'electric light']
    },
    {
      id: 'bg_bangluo_school', ch: 'ch19', name: '榜罗镇小学会议',
      prompt_en: 'The inside of a village primary school in Bangluo, Gansu, in September 1935, during a short meeting in daylight. Rough whitewashed walls and a packed earth floor enclose a plain room with paper windows and a long blank blackboard on the back wall, its surface wiped clean. Two long dark wooden tables with benches are pushed together in the middle, and a group of men in faded grey-green uniforms sit along them, one standing at the head of the table speaking with one hand raised. A water jug, a few folded papers and a pencil lie on the table, and shafts of pale daylight fall across the floor from the windows.',
      prompt_cn: '一九三五年九月，甘肃榜罗镇，白天，一间乡村小学教室里的短会。粗糙的白灰土墙、夯实的土地面，纸窗透光，后墙是一块抹得干干净净的长黑板。屋子中间拼着两张深色长木桌，周围摆着长凳，一群穿褪色灰绿军装的人沿着桌边坐着，其中一人站在桌首说话，抬起一只手。桌上放着一把水壶、几张折起的纸和一支铅笔，苍白的日光从窗口斜照到地面上。',
      must: ['rough whitewashed walls and packed earth floor of a village schoolroom', 'long blank blackboard wiped clean', 'two long dark wooden tables with benches pushed together', 'group of men in grey-green uniforms seated along the tables', 'one man standing at the head of the table speaking'],
      crowd: 'a group of leaders and staff in grey-green uniforms seated on benches, varied in age and build',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'modern classroom', 'electric light']
    },
    {
      id: 'bg_huining_confucian_temple', ch: 'ch20', name: '会宁文庙大成殿',
      prompt_en: 'The courtyard of the Confucian temple in Huining, Gansu, in October 1936, during the joint forces celebration. A broad hall with a dark tiled roof, red timber columns and closed lattice doors stands at the back of a stone-paved courtyard, and a huge old cypress leans its branches over the roof. The courtyard is packed with soldiers in faded grey-green uniforms and octagonal caps, standing, sitting and crouching, with villagers along the edges. Several plain wooden tables are set in front of the hall, covered with papers and telegrams, and three large red flags on poles rise above the crowd.',
      prompt_cn: '一九三六年十月，甘肃会宁文庙，会师联欢大会时的院落。院子尽头是一座面阔的大殿，深色瓦顶、红漆木柱、格子门关着，一棵巨大的老柏树把枝子伸到殿顶上方。石板院里挤满穿褪色灰绿军装、戴八角帽的战士，有的站着，有的坐着，有的蹲着，院边站着老乡。殿前摆着几张朴素木桌，桌上放着纸张和电报，三面大红旗从人群中高高竖起。',
      must: ['broad temple hall with dark tiled roof and red timber columns', 'huge old cypress leaning over the roof', 'stone-paved courtyard packed with soldiers', 'plain wooden tables covered with papers and telegrams', 'three large red flags above the crowd'],
      crowd: 'hundreds of soldiers and villagers filling the temple courtyard, varied in age, build and wear',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'city gate tower', 'modern buildings']
    },
    {
      id: 'bg_jiangtaibao', ch: 'ch20', name: '将台堡会师',
      prompt_en: 'A rammed-earth fort village on the loess plateau at Jiangtaibao, Gansu, in October 1936, seen from the open ground inside its earthen walls. Thick ochre rammed-earth walls with a low gate and a few watchtowers enclose a packed dirt yard, and low tile-roofed houses and cave mouths line one side. Two columns of soldiers in faded grey-green uniforms meet in the yard, shaking hands and throwing arms around each other, while a group of village women hands out knitted sweaters and thick wool socks from baskets. Soldiers wrap the new socks around their hands and faces, and bare loess ridges and a pale autumn sky show above the wall.',
      prompt_cn: '一九三六年十月，甘肃将台堡，从土堡墙内的空地上看这座黄土堡寨。厚厚的赭黄夯土墙围着夯实的土院，墙上有一座矮堡门和几座角楼，院一侧是低矮的瓦房和窑洞口。两列穿褪色灰绿军装的战士在院里会合，握手、互相抱住肩膀；几个乡村妇女从篮子里拿出织好的毛衣和厚毛袜分发。有战士把新毛袜贴在手上和脸上，墙头上方是光秃的黄土梁和淡秋的天。',
      must: ['thick ochre rammed-earth fort walls with a low gate and watchtowers', 'packed dirt yard inside the fort', 'two columns of soldiers meeting and embracing', 'village women handing out knitted sweaters and wool socks from baskets', 'bare loess ridges above the wall'],
      crowd: 'two meeting columns of soldiers and village women with baskets of knitted goods, varied in age and build',
      avoid: ['city gate tower', 'readable characters', 'letter-like marks', 'painted slogans', 'modern buildings']
    },
    {
      id: 'bg_air_raid_paddy', ch: 'ch02', name: '敌机·开阔稻田',
      prompt_en: 'An open harvested rice paddy in southern China in late October 1934, seen from the muddy field itself under a low overcast sky. Flat flooded paddies stretch to the horizon with only low mud ridges between them, no trees and no ditches anywhere; thin rain falls and every water surface reflects the grey sky. Three dark single-engine biplanes with fixed landing gear fly low across the upper sky, and two tall columns of mud and water rise from bomb strikes in the middle distance among drifting smoke. A score of soldiers in ragged grey-green uniforms lie prone in the muddy water, some with only their heads and backs showing, a few crouching low between the ridges, their straw capes dark with wet.',
      prompt_cn: '一九三四年十月末，中国南方，一片收割后的开阔稻田，从泥田里平看出去，天低而阴。平坦的积水稻田一直铺到天边，田与田之间只有低矮的泥埂，画面里没有一棵树、也没有一条沟；细雨落着，每片水面都映着灰天。三架深色的单发双翼机固定起落架，低低掠过上方天空；中景里两处炸弹落下，泥水柱高高竖起，周围飘着烟。二十来个穿破烂灰绿军装的战士趴在泥水里，有的只露出头和背，有几个缩在田埂间，身上的蓑衣被雨水浸得发黑。',
      must: ['flat flooded rice paddies stretching to the horizon with low mud ridges', 'no trees and no ditches in the open field', 'three dark single-engine biplanes flying low overhead', 'tall columns of mud and water from bomb strikes with drifting smoke', 'soldiers lying prone in the muddy water, some only heads and backs showing'],
      crowd: 'a score of soldiers in ragged grey-green uniforms prone in the paddy mud, varied in pose and distance, a few crouching between the ridges',
      avoid: ['readable characters', 'letter-like marks', 'painted slogans', 'bamboo forest', 'wooded hills', 'modern aircraft', 'jet aircraft', 'city buildings']
    },
    {
      id: 'bg_liupan_mountain', ch: 'ch19', name: '六盘山',
      prompt_en: 'The wind-swept ridge of Liupan Mountain in Ningxia in early October 1935, seen along the crest under a high pale blue sky with thin clouds. To the south, range after range of blue-grey mountains recede in layers; to the north, a vast open loess plateau stretches away in pale yellow and ochre. The near ridge is bare dry grassland and broken loess, every tuft of grass bent hard to one side by the wind, with a narrow trodden path running along the crest. A thin line of tiny soldiers in faded grey-green uniforms climbs the ridge with their heads down, and a V formation of wild geese flies south across the open sky.',
      prompt_cn: '一九三五年十月初，宁夏六盘山，沿着山脊看出去，天高而淡蓝，飘着几缕薄云。南边是一层叠一层的蓝灰色群山，一直退到天边；北边是一整片空旷的黄土高原，泛着浅黄和赭色。近处的山脊是光秃的枯草地和破碎的黄土，每一丛草都被风压向同一侧，山脊上有一条踩出来的窄路。一列穿褪色灰绿军装的细小人影低着头沿山脊上行，天空中一队大雁排成人字向南飞去。',
      must: ['high pale blue sky with thin clouds', 'layered blue-grey mountain ranges receding to the south', 'vast open pale-yellow loess plateau to the north', 'bare dry grassland and broken loess on the near ridge, grass bent by wind', 'a V formation of wild geese flying south', 'a thin line of tiny soldiers climbing the ridge'],
      crowd: 'a thin line of tiny soldiers in faded grey-green uniforms climbing the ridge, varied in distance and pose',
      avoid: ['bamboo', 'green terraces', 'snow', 'readable characters', 'letter-like marks', 'painted slogans', 'modern buildings', 'electric wires']
    },
  ];

  G.ART.bgArtList = BG_ART;
  G.ART.bgArtById = {};
  BG_ART.forEach(function (b) { G.ART.bgArtById[b.id] = b; });

  if (typeof module === 'object' && module.exports) module.exports = G.ART.bgArtById;
})();
