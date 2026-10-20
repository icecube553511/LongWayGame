# 角色形象演进清单（第一阶段 · 需求与判定依据）

> 任务来源：`docs/tasks/CHAR-PROGRESSION-REVIEW.md`（`/root` 下发，第二组先做）。
> 产物：本文件 + `docs/reviews/char-progression-spec.json`。
> 范围：只写评审/需求，不改 `src/story/**`、`src/engine/**`、`src/data/**`、`tools/**`、`art/**`、`assets/**`，不跑 git。
>
> **阶段声明**：本文是「先于出图组给出的形象变化要求」，不是对成图的验收。
> 第二阶段（生成组交稿后）的 `PASS` / `PARTIAL` / `FAIL` 判定必须由独立 agent 追加在文末，并保留本阶段全部内容。

## 0. 结论摘要

清单覆盖 **35/35 个角色**，共 **160 个状态**、**282 个章映射**、**19 个章内 beat**。

- 每个角色实际出场的每一章都有且只有一个默认状态（`chapterStates`）。
- 每个状态列出的表情，覆盖该状态所辖章节剧本里该角色实际用到的全部表情，并始终包含 `calm` 供图鉴使用。
- 19 个 beat 的 `after_text` 全部是剧本原文的连续片段，已逐条用脚本回查。
- `wear` / `dirt` 的每一次回落都能对应到明确补给、换装、洗净或休整章节；详见 §5.4。
- 本阶段只做「需求是否自洽、是否可执行」的机器自检，**不构成对画面质量、史实还原或最终验收的判定**。

## 1. 取证方法

1. 用 Node `vm` 直接加载 `src/story/ch01.js … ch20.js`，不执行游戏、不改文件。
2. 递归遍历 `steps`（含 `if` / `choice` 分支里的 `steps`），统计每个角色在每章实际出现的 `show` / `say` / `think` 步，以及这些步使用的 `face`。
3. 对每个角色取「实际出场章集合」，与 `chapterStates` 的键集合逐章比对；多一章、少一章都判失败。
4. 对每个 `state.faces` 与该状态所辖章节的实际表情并集比对；只允许覆盖更多，不允许漏。
5. 对每个 beat，在该章所有 `text` 中做逐字 `includes` 检查；并检查 `portraitId` 在 `states` 中存在、状态 id 全局唯一。
6. 对每个角色按章序检查 `wear`；出现回落时，必须能在剧本里找到对应补给/换装/洗净/休整依据，或有明确的「只洗不换」说明。

扫描结果（非人工印象）：34 个有台词的 `who` 角色 + `narrator`（`narr` 步没有 `who`，按契约补成 35 人）；实际出现的 `(人物, 表情)` 组合 164 组。主要角色出场步数：`xiaoman` 601、`wu_laoliu` 512、`he_xiaomei` 267、`mao` 231、`san_wa` 181、`soldiers` 177、`zhou` 164。

## 2. 判定判据（第二阶段逐条对照）

| # | 要求 | 可执行的判法 | 本清单提供的依据 |
|---|---|---|---|
| 1 | 服装、装备随行军/战斗/风雪/渡河逐渐破旧、沾泥、缺损 | 同一角色按章序看 `wear` 不下降（除 §5.4 的补给点）；`outfit_cn` 必须写出破口、补丁、泥、湿、霜、火烧痕的具体位置 | 每状态 `wear`/`dirt`/`outfit_cn`；§3 时间轴 |
| 2 | 明确补给、整编、换装、会师物资处才可回新 | 任何 `wear` 回落必须能在剧本中找到补给/换装句；只洗不换只能降 `dirt`，不能降 `wear` | §5.4 的回落点逐条列了剧本步号 |
| 3 | 受伤、包扎、担架、病弱符合章节 | 对照 `injury` 与剧本事件；`bandaged` / `stretcher` / `frost` / `exhausted` 不得提前或拖后 | 每状态 `injury`；§3 伤情列 |
| 4 | 每个状态有符合剧情的手持/背负物 | `props_cn` 必须与 `equipment_cn` 一致，且能在该章剧本找到持有/背负依据 | 每状态 `props_cn`；beat 记录了关键道具转移 |
| 5 | 头部姿态明确且变化克制 | `head.turn` ≤ ±16°、`head.pitch` ≤ ±10°；同一角色相邻状态不要连续反向大角度 | 每状态 `head`；本清单把会议/行军/雪地分开 |
| 6 | 表情只用 8 种 | `faces` 只能是 `calm stern smile sad worry fierce weak dawn` | 每状态 `faces`；脚本已校验 |
| 7 | 35 个角色全覆盖 | `characters` 必须正好 35 个 id，含 `soldiers` / `villagers` / `yi_people` / `narrator` | JSON 顶层 `characters` |
| 8 | 同脸、同年龄、同帽型、同标志物，不换人 | 每个状态的 `appearance_en` 必须重复该角色的年龄、脸型、帽型/发型、标志物；不得让同一 id 换演员 | 每状态 `appearance_en` 的固定识别段；§5.1 |

另外三条硬约束，所有状态都必须成立：

- 单人、600×900 半身、透明背景、低多边形刻面、左上硬光、不画文字。
- 不新增人物 id，不改 `docs/SPEC.md` §3.1 的人物表。
- `appearance_en` 只写画面，不写禁令；禁令全部放 `avoid_en`。

## 3. 全剧时间轴与补给/伤情锚点

下表是「为什么这个角色在这一章是这个磨损度」的总依据。步号是该章 `steps` 展开后的序号，可直接回查。

| 章 | 剧情/环境 | 磨损基线（详见 JSON） | 明确补给 / 换装 | 伤情 / 装备节点 |
|---|---|---|---|---|
| ch01 于都河畔 | 出发、夜渡、门板浮桥 | 新兵与干部大多 1/1；旧衣为主 | 无换装；`#9-14` 命令拆下鲜红领章帽徽 | `#72-74` 郭大娘给铜顶针；`#192-203` 毛泽东在担架上 |
| ch02 突破封锁线 | 秋雨、泥路、敌机 | 1-2/3-4 | 无；`#110` 小满草鞋已磨穿第三双 | `#117-120` 石柱编第四至第十双草鞋；`#42-43` 全队淋雨 |
| ch03 湘江血战 | 江水、血战、减员 | 2/4 | 无；`#199-200` 何晓梅撕衬衣当绷带 | `#21-23` 周恩来咳血；`#175-179` 小满捡到石柱绑腿；`#209-211` 八万六减到三万 |
| ch04 通道转兵 | 冬雨、书院、会议 | 2/3 | 无 | `#41` 何晓梅手上冻裂；`#244-253` 阿月作为苗族向导出现 |
| ch05 黎平会议 | 整编、轻装 | 2/3 | `#187-220` 轻装：丢印钞机、X 光机、山炮、五口锅；不是发新衣 | `#205-216` 李铁柱只留一口带补丁的铜锅；`#239-253` 重伤员留下 |
| ch06 猴场跨年 | 雪、年饭、标语 | 1-2/1-2 | `#70-101` 每人一斤肉、伤员一斤半；`#132-158` 石灰刷标语 | 无新伤；`#254` 战士补衣服（补丁可降 `wear` 一档，但不换新） |
| ch07 遵义会议 | 城、会议、补给 | 2/1 | `#203-224` 上级发钱买药，何晓梅药箱补齐 | `#268-288` 陈云重核家当；`#45-52` 周恩来三天未睡 |
| ch08 一渡赤水 | 土城、红泥、拉锯 | 3/4 | 无 | `#93` 石柱左肩被打穿；`#192-206` 何晓梅只剩三卷纱布；`#102` 朱德摘帽上阵 |
| ch09 扎西整编 | 雨夹雪、缩编 | 3/4 | `#54-56` 机关干部下连领枪、草鞋、绑腿；`#120-124` 供给部发六十多双草鞋 | `#206-214` 李铁柱把锅顶在头上过河；`#247-255` 三娃脚冻得像石头 |
| ch10 娄山关 | 仰攻、胜利、遵义 | 3/4 | `#291-292` 遵义商会送米和布，红军照价付钱（布用于补，不换新） | `#255-260` 吴老六换缴获的黔军步枪；`#324-330` 三千换三千的账 |
| ch11 三渡四渡 | 连续机动、夜渡 | 3/4 | `#193-195` 河滩丢弃旧棉衣、破伞、多余背包带（减重，不是补给） | `#307-309` 何晓梅洗纱布，凑到十三块；`#302-311` 小满号管刻第四道 |
| ch12 巧渡金沙江 | 江风、九天九夜、追兵 | 4/4 | 无 | `#156-180` 三娃丢鞋、小满让出一只草鞋、吴老六用麻绳绑鞋；`#186-195` 药没有了，只用盐水；`#277-290` 周恩来咳血 |
| ch13 彝海结盟 | 彝区、土牢、歃血 | 3/3 | 无；`#207-210` 小叶丹赠银饰、刘伯承赠手枪；`#223-233` 红军赠旗 | `#46-53` 先遣队被缴械、被剥衣，坚持不还手；`#69-76` 何晓梅用最后一块布 |
| ch14 强渡大渡河 | 暴雨、激流、一条船 | 3-4/4 | 无 | `#238-249` 石柱右腿被石头划开，何晓梅割裤腿包扎；`#293-297` 吴老六鞋底磨穿两个洞 |
| ch15 飞夺泸定桥 | 二百四十里、铁索、火 | 4-5/5 | 无 | `#165-170` 二十二名勇士；`#223-266` 石柱冲火、前胸双臂烧伤、牺牲；`#302-305` 李铁柱在桥头烧水 |
| ch16 翻越夹金山 | 单衣、草鞋、风雪 | 5/4（`frost`） | 无；`#12` 草鞋外缠布条、衣服塞稻草 | `#140-153` 何晓梅用体温救冻脚；`#223-231` 徐特立把绑腿解给战士；`#189-203` 小满的号冻住 |
| ch17 懋功与草地 | 会师、草地、断粮 | 5/5 | `#28-38` 四方面军送新草鞋（小满收着不穿）；`#71-75` 每人每天四两青稞 | `#149-159` 三娃割皮带；`#186-220` 李铁柱饿死、铜锅交给小满；`#244-260` 出草地只剩四十七人 |
| ch18 激战腊子口 | 绝壁、木桥、手榴弹 | 5/5 | `#47-54` 小满把懋功新草鞋给三娃；`#275-279` 何晓梅撕衣角给敌伤兵 | `#205-207` 小满胳膊被划开；`#275` 三娃十个指头六个磨掉皮；`#284-290` 号身多了两个凹痕 |
| ch19 吴起镇 | 哈达铺、六盘山、落脚 | 4-5 → 2-3（见 §5.4） | `#56-74` 每人一块大洋必须花掉；小满买黑布鞋和盐；`#111-122` 三娃领到新布鞋；`#16-19` 会宁总供给部准备毛衣/毛袜/鞋 | `#92-98` 阿月把麻线带系在号管第三节；`#317-319` 铜锅已换人背 |
| ch20 会宁会师 | 会师、将台堡、尾声 | 2-4/1-2 | `#16-19` 毛衣、毛袜、鞋；`#153-159` 一方面军把织好的毛衣毛袜发给二方面军 | `#4-6` 小满十七岁、号长、号管缠旧麻线带；`#167` 三娃十五岁；`#186-196` 何晓梅的手已很稳 |

## 4. 35 人逐人清单

表中 `wear/dirt/injury` 的顺序与 JSON 一致；`ch08,ch10` 这种写法表示该角色在这两章都映射到同一状态，但中间 ch09 不出场。带 beat 的角色在 §4.1 单列。

### 4.1 历史人物

| id | 角色 | 出场章数 | 状态（章 / 标签 / wear / dirt / injury） | beats |
|---|---|---|---|---|
| `mao` | 毛泽东 | 16 | ch01-02 于都出发·疟疾初愈(1/1/exhausted)；ch03 湘江之后·减员(2/4/exhausted)；ch04-05 通道转兵·冬雨(2/3/exhausted)；ch06-07 猴场遵义·休整(2/1/none)；ch08-11 赤水四渡·连续机动(3/4/exhausted)；ch14 大渡河边·地图与渡口(4/4/exhausted)；ch16-18 雪山草地·单衣风霜(5/4/frost)；ch19 吴起镇·落脚陕北(4/2/exhausted) | 0 |
| `zhou` | 周恩来 | 16 | ch01-02 于都出发·长期缺觉(1/1/exhausted)；ch03 湘江·三天未合眼(2/4/exhausted)；ch04-05 通道黎平·冬雨(2/3/exhausted)；ch06-07 猴场遵义·洗整与自责(2/1/exhausted)；ch08-11 土城赤水·泥与烟(3/4/exhausted)；ch12 金沙江·咳血与九昼夜(4/4/exhausted)；ch14 大渡河·糖坊里的老船工(4/4/exhausted)；ch16-17 雪山草地·借毯(5/4/frost)；ch19 吴起镇·洗净的旧衣(4/2/exhausted) | 0 |
| `zhu` | 朱德 | 13 | ch02-03 突破封锁线·与兵同行(1/2/none)；ch04-05 通道黎平·雨里行军(2/3/none)；ch06-07 猴场遵义·火盆边(1/1/none)；ch08,ch10 土城娄山关·战尘(3/4/none)；ch14 大渡河岸·雨水(3/4/none)；ch16-18 雪山草地腊子口·老总也让马(5/4/frost)；ch20 会宁会师·点旗(3/2/none) | 1 |
| `zhang_wentian` | 张闻天 | 5 | ch04-05 通道黎平·斯文理论家(1/2/none)；ch07 遵义会议·反报告(2/2/exhausted)；ch09 扎西整编·冬雨(3/3/exhausted)；ch19 哈达铺吴起·读到陕北(3/2/none) | 0 |
| `wang_jiaxiang` | 王稼祥 | 3 | ch04-05 通道黎平·担架上的重伤(2/2/stretcher)；ch07 遵义会议·第一个提议(3/2/stretcher) | 0 |
| `bogu` | 博古 | 4 | ch02 出发初期·书生气(0/1/none)；ch04-05 通道争论·书卷与犹疑(2/3/exhausted)；ch07 遵义会议·承认失败(3/2/exhausted) | 0 |
| `lide` | 李德 | 5 | ch02 出发初期·地图与条令(1/1/none)；ch04-05 通道黎平·地图合上(2/3/exhausted)；ch06-07 遵义会议·沉默(3/3/exhausted) | 0 |
| `peng` | 彭德怀 | 10 | ch01-03 于都出发·憋着的火(1/2/none)；ch07-10 遵义会议·三军团的家底(3/4/exhausted)；ch17-19 草地之后·清点人数(4/4/exhausted) | 0 |
| `lin` | 林彪 | 4 | ch02-03 出发初期·沉默的军团长(1/2/none)；ch10 娄山关·仰攻(2/3/none)；ch18 腊子口·看石壁(3/4/none) | 0 |
| `nie` | 聂荣臻 | 5 | ch02-03 突破封锁线·政委(1/2/none)；ch07 遵义会议·一军团同意(1/1/none)；ch13 彝海·不许开枪(2/3/none)；ch18 腊子口·找路(3/4/exhausted) | 0 |
| `liu_bocheng` | 刘伯承 | 10 | ch02-03 突破封锁线·总参谋长(1/2/old_wound)；ch06-09 乌江之前·渡江司令(2/3/old_wound)；ch11-12 金沙江·九天九夜(3/4/old_wound)；ch13 彝海结盟·银饰与旗(3/3/old_wound)；ch14 大渡河·石达开的旧路(3/4/old_wound) | 1 |
| `chen_yun` | 陈云 | 3 | ch01 于都出发·编制与家当(1/1/none)；ch07 遵义·重核家当(1/1/none)；ch09 扎西整编·放下账本(2/3/none) | 0 |
| `he_zizhen` | 贺子珍 | 2 | ch01 于都出发·双枪女战士(1/1/exhausted)；ch03 湘江·血与三天三夜(2/4/exhausted) | 0 |
| `deng_yingchao` | 邓颖超 | 2 | ch03 湘江夜渡·咳着护孩子(2/3/exhausted)；ch04 通道之后·问路(2/2/exhausted) | 0 |
| `xu_teli` | 徐特立 | 5 | ch01-02 于都出发·五老之一(1/2/old_wound)；ch06 猴场·墙上的字(1/1/old_wound)；ch16 夹金山·把绑腿给别人(4/4/frost)；ch19 哈达铺·黑板上的陕北(4/2/old_wound) | 1 |
| `dong_biwu` | 董必武 | 1 | ch01 于都出发·温和老者(1/1/none) | 0 |
| `lin_boqu` | 林伯渠 | 5 | ch01 于都出发·管粮的人(1/1/none)；ch09 扎西整编·账本与草鞋(2/3/exhausted)；ch12 金沙江·钱不够了(3/4/exhausted)；ch16-17 雪山草地·四两米(5/4/frost) | 0 |
| `xie_juezai` | 谢觉哉 | 9 | ch01-05 于都出发·日记(1/2/none)；ch06 猴场·分粮与记录(1/1/none)；ch16-18 雪山腊子口·姓名待查(4/4/frost) | 0 |
| `ye_jianying` | 叶剑英 | 5 | ch03-04 湘江之后·断了的电报(2/3/exhausted)；ch11,ch15 赤水·译电与假番号(3/4/exhausted)；ch17 草地之后·纸上的事(4/4/exhausted) | 0 |
| `zhang_guotao` | 张国焘 | 2 | ch17 懋功·讲究的呢军装(0/1/none)；ch20 会宁·瘦了，衣服仍整齐(1/1/exhausted) | 0 |
| `xu_xiangqian` | 徐向前 | 1 | ch17 懋功会师·宽厚(1/2/none) | 0 |
| `li_xiannian` | 李先念 | 1 | ch17 懋功·送来的新草鞋(1/2/none) | 0 |
| `xiao_yedan` | 小叶丹 | 1 | ch13 彝海·黑帕银饰(1/2/none) | 1 |

### 4.2 虚构人物

| id | 角色 | 出场章数 | 状态（章 / 标签 / wear / dirt / injury） | beats |
|---|---|---|---|---|
| `xiaoman` | 小满 | 20 | ch01 于都出发·吹不响的号(1/1/none)；ch02 雨里行军·第三双草鞋(1/3/exhausted)；ch03 湘江·江边捡到绑腿(2/4/exhausted)；ch04-05 通道黎平·臂上的布条(2/3/exhausted)；ch06-07 猴场遵义·洗整与补给(2/1/none)；ch08-11 赤水四渡·红泥与号(3/4/exhausted)；ch12-15 金沙江到泸定·草鞋与血泡(3/4/exhausted)；ch16 夹金山·号冻住了(5/4/frost)；ch17 草地·李班长还在(5/5/exhausted)；ch18 腊子口·桥头的号(5/4/bandaged)；ch19 哈达铺吴起·黑布鞋(3/2/none)；ch20 会宁·十七岁的号长(2/1/none) | 3 |
| `li_tiezhu` | 李铁柱 | 15 | ch01-02 于都出发·背锅的炊事班长(1/2/none)；ch03-05 湘江之后·锅里只有水(2/4/exhausted)；ch06-07 猴场遵义·锅里终于有油(1/1/none)；ch09-12 赤水金沙·锅顶在头上(3/4/exhausted)；ch14-15 大渡河泸定·手在抖(4/4/exhausted)；ch16 夹金山·锅冻住了(5/4/frost)；ch17 草地·最后一锅鱼汤(5/5/exhausted) | 2 |
| `he_xiaomei` | 何晓梅 | 20 | ch01-02 于都出发·白围裙卫生员(1/1/none)；ch03-05 湘江·撕掉最后一件衬衣(2/4/exhausted)；ch06 猴场·洗净的围裙，空药箱(2/1/none)；ch07 遵义·药品补齐(2/1/none)；ch08-11 土城赤水·只有三卷纱布(3/4/exhausted)；ch12-15 金沙江泸定·只剩盐水(4/4/exhausted)；ch16-18 雪山腊子口·用体温救脚(5/4/frost)；ch19 吴起镇·手不再抖(4/2/none)；ch20 会宁·两年后的军医(2/1/none) | 2 |
| `guo_daniang` | 郭大娘 | 1 | ch01 于都河畔·拆门板的人(2/2/none) | 1 |
| `shi_zhu` | 石柱 | 9 | ch01-02 于都出发·编草鞋的兄长(1/2/none)；ch08 土城·守土坎之前(2/4/none)；ch09,ch10,ch11,ch13 扎西到赤水·带伤的旗手(3/4/bandaged)；ch14 大渡河·先上船(3/4/bandaged)；ch15 泸定桥·二十二分之一(4/5/bandaged) | 3 |
| `a_yue` | 阿月 | 3 | ch04 湘黔边界·苗族向导(1/2/none)；ch18 腊子口·带路上绝壁(2/3/none)；ch19 哈达铺·回腊子口(3/2/none) | 0 |
| `wu_laoliu` | 吴老六 | 20 | ch01-02 于都出发·老兵班长(2/2/old_wound)；ch03-05 湘江·点名(3/4/old_wound)；ch06-07 猴场遵义·洗净的补丁(2/1/old_wound)；ch08-11 赤水四渡·旧枪换新枪(3/4/old_wound)；ch12-15 金沙江泸定·鞋底磨穿(4/5/old_wound)；ch16-18 雪山草地腊子口·老兵也老了(5/5/frost)；ch19-20 吴起会宁·替全班尝一口(4/2/old_wound) | 1 |
| `san_wa` | 三娃 | 17 | ch01-03 于都出发·最小的红小鬼(1/2/none)；ch04 通道冬雨·帽子盖住耳朵(2/3/exhausted)；ch07 遵义·有热饭的几天(2/2/none)；ch09-12 赤水金沙·冻脚与丢鞋(3/4/exhausted)；ch13-15 彝海到泸定·更瘦了(4/4/exhausted)；ch16-17 雪山草地·割皮带(5/5/frost)；ch18 腊子口·手脚都磨破(5/5/bandaged)；ch19 哈达铺·一只新布鞋(3/2/none)；ch20 会宁·十五岁，旧布鞋留一只(3/2/none) | 2 |

### 4.3 群众与旁白

| id | 角色 | 出场章数 | 状态（章 / 标签 / wear / dirt / injury） | beats |
|---|---|---|---|---|
| `soldiers` | 红军战士们 | 14 | ch01-04 出发初期·三个人三种旧(2/3/none)；ch06-07 猴场遵义·洗净与补鞋(2/1/none)；ch09-12 赤水金沙·泥与汗(3/4/exhausted)；ch16-18 雪山草地腊子口·冻伤与绷带(5/5/frost)；ch20 会宁·两双不同的鞋(3/2/none) | 0 |
| `villagers` | 乡亲们 | 14 | ch01-02 于都·白墙黑瓦下的三个人(2/2/none)；ch04,ch06,ch07,ch08,ch09,ch11,ch12 黔滇山村·补丁与靛蓝(3/3/none)；ch14-16 川西北·蓑衣与湿衣(3/4/none)；ch19-20 陕北·白羊肚手巾与热馍(2/2/none) | 0 |
| `yi_people` | 彝族同胞 | 1 | ch13 冕宁土牢·被关押的人(2/4/old_wound) | 1 |
| `narrator` | 旁白 | 20 | ch01-20 历史风尘中的无名背影(2/2/none) | 0 |

### 4.4 章内可见变化（19 个 beat）

这些状态的 `chapters` 是空数组，**只作为章内某一拍之后的 `portraitId` 覆盖**，不要当成整章默认状态。默认状态仍以 `chapterStates` 为准。

| 角色 | 章 | 步号 | `after_text`（原文连续片段） | 覆盖状态 | 画面变化 |
|---|---|---|---|---|---|
| `zhu` | ch08 | 102 | 朱德从外面走进来，把帽子往桌上一放。 | `zhu_ch08_nocap` | 摘下八角帽，露出短硬灰黑发 |
| `liu_bocheng` | ch13 | 210 | 刘伯承把那串银饰戴在脖子上，扣好。 | `liu_bocheng_ch13_necklace` | 领口外多一串彝族银饰 |
| `xu_teli` | ch16 | 227 | （把自己的绑腿解下来，一圈一圈缠上去） | `xu_teli_ch16_bare_legs` | 裤脚松开，绑腿已给别人 |
| `xiao_yedan` | ch13 | 207 | 他伸手，从自己脖子上解下一串银饰，塞到刘伯承手里。 | `xiao_yedan_ch13_oath` | 颈部银饰消失，怀里抱红旗 |
| `xiaoman` | ch03 | 175 | 小满在江边的一块石头上，捡到一条绑腿。 | `xiaoman_ch03_binding` | 右臂缠上石柱的旧绑腿 |
| `xiaoman` | ch17 | 219 | 小满把铜锅背在背上。锅很轻，因为里面什么都没有。 | `xiaoman_ch17_pot` | 背上多一口铜锅 |
| `xiaoman` | ch19 | 98 | 小满把那根带子缠在号管的第三节上，缠了三圈，打了个结。 | `xiaoman_ch19_cord` | 号管第三节多一根深色麻线带 |
| `li_tiezhu` | ch05 | 216 | 他把那口锅背起来，走了。 | `li_tiezhu_ch05_onepot` | 六口锅只剩一口带补丁的 |
| `li_tiezhu` | ch17 | 202 | 第七天早上，他没有站起来。 | `li_tiezhu_ch17_death` | 背靠铜锅坐着，双手搭在锅沿 |
| `he_xiaomei` | ch03 | 200 | 我把自己的衬衣撕了。衬衣也只有一件。 | `he_xiaomei_ch03_torn` | 军装下摆露出撕过的里布 |
| `he_xiaomei` | ch07 | 207 | 上级发了钱，要她把卫生队的药品补齐。 | `he_xiaomei_ch07_supply` | 空药箱重新装满纸包药与绷带 |
| `guo_daniang` | ch01 | 72 | 她把门板放下，从怀里摸出一样很小的东西。 | `guo_daniang_ch01_thimble` | 手里捏着铜顶针递出 |
| `shi_zhu` | ch08 | 93 | 石柱背着两个伤员下来，自己的左肩被子弹打穿了。 | `shi_zhu_ch08_shoulder` | 左肩厚布染血，左腿少一条绑腿 |
| `shi_zhu` | ch14 | 243 | 伤口很长，从膝盖一直划到脚踝，泡了一上午的水，皮肉翻着白。 | `shi_zhu_ch14_leg` | 右裤腿割开，小腿缠白布 |
| `shi_zhu` | ch15 | 259 | 何晓梅撕开他的衣服。前胸和两条手臂都烧伤了，皮肉粘在一起。 | `shi_zhu_ch15_burned` | 前胸双臂烧伤，帽子和完整军装不在 |
| `wu_laoliu` | ch10 | 257 | 卫生员，我的枪换了。 | `wu_laoliu_ch10_rifle` | 换成缴获的黔军步枪 |
| `san_wa` | ch17 | 229 | 他把皮带切成小段，放在锅里，加水，下面架着刚挖出来的湿草根。 | `san_wa_ch17_rope` | 腰间皮带换成草绳 |
| `san_wa` | ch18 | 54 | 他把鞋穿上，系得很紧。系完以后，他抬头看了一眼对面的碉堡。 | `san_wa_ch18_new_shoes` | 换上懋功会师收到的新草鞋 |
| `yi_people` | ch13 | 108 | 几十把铁链一起被砸断。 | `yi_people_ch13_freed` | 脚踝木枷去除，三人站起 |

## 5. 例外、风险与必须提前说清的口径

### 5.1 领章帽徽：保留「褪色暗红」的识别形，不画鲜红

ch01 `#9-14` 明确命令「红领章、红帽徽全部拆下来」。但 `ART_DIRECTION.md` §2 把「领章暗红」「政委臂章」「参谋臂章」列为识别点。本清单的处理是：**鲜红已褪成暗红褐，红星只余暗色布痕/针脚**。这样既服从剧情，又不让观众在 600×900 半身像里失去识别物。

如果生成组要严格按「已经全部拆掉」画，必须同时接受毛泽东/周恩来/聂荣臻等人的识别度下降；这属于契约层面的取舍，需 `/root` 确认，**不要由出图组单方面改**。

### 5.2 群众角色的表情：契约与美术总纲有冲突

`ART_DIRECTION.md` §1 写「群众角色只做 `calm fierce sad`」，但：

- `docs/SPEC.md` §4.2 要求 35×8=280 张，群众同样 8 张；
- 剧本实际用到 `soldiers` / `villagers` 的 `stern`、`smile`、`worry`、`weak`、`dawn`。

本清单以 **SPEC + 剧本实际使用** 为准，`faces` 里会出现群众的 8 种表情。若生成端只做 3 种，会在 `save`/`show` 时回退到 `calm`，不算 JS 报错，但会丢失情绪。建议按 `faces` 全量出，至少先把 `calm/sad/fierce/worry/weak/dawn` 覆盖。

### 5.3 旁白：20 章都有映射，但游戏里不会自动挂立绘

`narr` 步没有 `who`，引擎不会因为旁白自动显示 `narrator`。本清单仍给 `narrator` 全 20 章映射，是为了：

1. 图鉴/资产契约的 35 人全覆盖；
2. 将来若有人把旁白改成 `{t:'say', who:'narrator'}`，有现成状态可接。

`narrator` 的 `faces` 定为 `calm/fierce/sad`（与 `ART_DIRECTION` 的旁白口径一致），不按剧本统计，因为剧本没有 `who:'narrator'`。

旁白没有五官，这三张不能靠眉、眼、嘴区分；要靠**兜帽阴影的深浅、肩线的开合、光源方向、衣摆的动势**区分。出图时不要给旁白画脸，也不要为了凑 8 种表情给他加五官。

### 5.4 磨损回落点：只允许这些地方「变新」

机器复核列出的 14 个 `wear` 回落点，逐条对应：

| 章 | 角色 | 回落 | 依据 |
|---|---|---|---|
| ch06 | `zhu` / `li_tiezhu` / `wu_laoliu` | 2→1 / 2→1 / 3→2 | 猴场、遵义休整，洗衣补衣；只降 `wear` 一档，不换新制服 |
| ch19 | `mao` / `zhou` / `wu_laoliu` / `he_xiaomei` | 5→4 | 哈达铺「物资最充裕的几天」，洗净休整；没有发新军装，只降一档 |
| ch19 | `xiaoman` / `san_wa` | 5→3 | 哈达铺发一块大洋必须花掉；小满买黑布鞋，三娃领到新布鞋 |
| ch19 | `villagers` | 3→2 | 陕北乡亲是本地人，换成白羊肚手巾、棉袄；不是同一批随军群众变新 |
| ch20 | `zhu` / `soldiers` | 5→3 | 会宁总供给部给来的部队准备毛衣、毛袜、鞋；一方面军自己也休整了一年 |
| ch20 | `xiaoman` / `he_xiaomei` | 3→2 / 4→2 | 会师后一年，洗净、补好、领到毛袜/鞋；仍穿旧布，不是新制服 |

除此之外，所有 `wear` 只升不降。`dirt` 可以因洗衣、擦枪、休整下降；`wear` 不会因为「洗了一次」就变新。

### 5.5 半身画幅：鞋袜、绑腿、裤子多数在画外

`docs/SPEC.md` §4.2 要求 600×900 **半身特写**，画到胸口/腰以上，不画腿。本清单仍记录鞋、绑腿、裤脚，是因为：

- 生成提示词需要知道「身上到底有什么」，避免上半身出现不该有的新衣；
- 章内 beat / 未来若改 three-quarter，可以直接复用；
- 评审时不能拿「鞋看不见」当漏画理由。

第二阶段看图时，鞋袜只在 three-quarter 或局部裁剪里判；半身像只判领口、肩、胸、袖、手、脸、帽。

**构图口径冲突（必须先说清）**：`ART_DIRECTION.md` §1 又写了「人物脚底贴近 y≈878，身高占画布 78%–88%」，这是全身比例；`SPEC.md` §4.2 明确「不画腿」。两份文件都声明冲突时以 `SPEC.md` 为准，所以本清单的 `appearance_en` 一律写 **half-body bust（半身胸像）**。如果生成端按 `ART_DIRECTION` 出全身，第二阶段会按「与清单构图不符」判 PARTIAL/FAIL，不能两边各画一套还都算过。

### 5.6 章内状态与「一拍」：beat 不是整章默认

`xiaoman_ch03_binding`、`shi_zhu_ch15_burned` 这类状态在 `states` 里，但 `chapters` 是空数组。生成端应当：

1. 先按 `chapterStates[章][人物]` 出默认立绘；
2. 到了 `beats[].after_text` 对应的那一步之后，用 `beats[].portraitId` 临时覆盖；
3. 不要在章首就用 beat 状态，否则会出现「还没捡到绑腿，右臂已经缠上」。

如果引擎暂时没有 `portraitId` 覆盖能力，**至少不要把这些 beat 状态塞进 `chapterStates`**；否则整章都会错。

### 5.7 选择分支：只把「无条件原文」写成 beat

ch03 小满是否把绑腿缠在右臂，是一个 `choice`；但同一章 `#342` 又无条件写「小满把右臂上的那条绑腿拉紧了一下」，说明剧本把「缠在右臂」当作后续正史。本清单因此把 `xiaoman_ch03_binding` 定为 ch03 后半段的可见变化，并在 ch04-05 状态里保留右臂布条。

其他分支（例如 ch15 石柱布包交给谁）不影响外观，未单列 beat。第二阶段如发现某分支的可见状态与清单冲突，按「剧本后文的无条件描写优先」处理，并把冲突写进报告。

### 5.8 死亡与退场：不给死人排后续状态

- `li_tiezhu` 在 ch17 `#202` 之后不再出场；ch18-20 没有他的状态，铜锅转给小满（ch17 beat），ch19 `#317-319` 又转给别人背。
- `shi_zhu` 在 ch15 `#269-270` 之后不再出场；ch16-20 没有他的状态。ch15 的默认状态是上火线前，`shi_zhu_ch15_burned` 是牺牲前的最后一拍。
- `guo_daniang` 只在 ch01；ch20 的顶针归还对象是郭水生（`villagers` 里的一个具体人，不是 `guo_daniang` 本人）。
- `a_yue` 只在 ch04/ch18/ch19；ch20 没有她。

### 5.9 旧草稿的错位已修正

以下与 `tmp/batch*_specs.json` 的旧草稿不同，均以剧本为准：

- `bogu` 没有 ch03；旧草稿把他放进湘江。
- `zhu` 没有 ch09；旧草稿把扎西整编算给了他。
- `li_tiezhu` 没有 ch08/ch13；旧草稿在这两章给了他状态。
- `shi_zhu` 没有 ch03-07；旧草稿把他放进湘江到遵义。
- `he_zizhen` 在 ch03 没有新增外伤；旧草稿写成「wounded」。
- 旧草稿的 `wear: 15`、`relieved`、`determined` 等非法值/表情全部废弃。

### 5.10 群众不是「复制人」

`soldiers` / `villagers` / `yi_people` 是三人组，不是一个人。每个状态都要求三名不同体态、年龄、脸型、磨损的人：

- `soldiers`：高瘦/矮壮/年轻，三种补丁位置与三种鞋况。
- `villagers`：老人（头巾、拐、篮）、妇女（蓝布衫、围裙）、孩子（改小的旧衣）；跨地区时保留这三类人，只换地区服装。
- `yi_people`：老人/年轻人/高瘦者，三种披毡破损与银饰。

第二阶段不能用「三个人长得一样」的章印图交差；这按 `PRODUCTION_SPEC.md` §4.5 判 FAIL。

### 5.11 主要风险

1. **雪山「单衣」最容易被出图端加棉衣**：ch16 明确写「穿着的还是去年发下来的单衣，脚上还是草鞋」。本清单所有 ch16 状态都禁止棉衣/皮帽；出现即 FAIL。
2. **石柱的伤在左肩，不是右肩**：ch08 `#93` 明写左肩；ch14 是右腿；ch15 是前胸双臂烧伤。左右不要画反。
3. **周恩来 ch03/ch12 的咳血要克制**：手帕上淡淡血迹即可，不做猎奇。
4. **何晓梅绝不可画成男性**：短发+白护士帽+白围裙+红十字臂章，四个识别点至少保留三个。
5. **小满的号是贯穿道具**：ch03 右臂绑腿、ch17 铜锅、ch19 麻线带、ch20 旧麻线带；这四个 beat 是情感线的硬节点。
6. **补给不等于换新**：ch09 的新草鞋是给新兵/俘虏的，ch10 的布是补衣的，ch17 的新草鞋小满收着不穿，ch19 才买黑布鞋。不要把这些章节画成「全员新军装」。

### 5.12 群众 id 与任务书「单人」的冲突

任务书 §3 写「所有状态必须遵守：单人、600×900 半身……」，但冻结的 id 表把 `soldiers`（红军战士们）、`villagers`（乡亲们）、`yi_people`（彝族同胞）定义为**复数群众**；`ART_DIRECTION.md` §2.3 也明确要求「3 人并排」的群像。

本清单的处理：

- **有名字的角色**（含 `narrator`）严格单人；
- **三个群众 id** 是一张 600×900 的「三人组」资产，三个人必须体态、年龄、脸型、磨损各不相同，不允许第四个人，不允许文字；
- 第二阶段判群众图时，按「三人组、可分辨、无复制人」判，不按「画面里只能有一个人」判。

如果生成组把「单人」理解成群众 id 也只能画一个人，会与 `ART_DIRECTION` §2.3 和现有 280 张资产的构图直接冲突。这属于契约取舍，需 `/root` 先改 `ART_DIRECTION` / `SPEC`，**不要由出图组自行决定**。

### 5.13 运行时表已由本清单编译（闸门已通过）

本轮新加的 `tools/build-portrait-states.js` 已经把这条链路收口：

```text
docs/reviews/char-progression-spec.json   （唯一来源）
        └─ node tools/build-portrait-states.js
             └─ src/data/portraitStates.js  （运行时表）
                  └─ node tools/build-portrait-states.js --check
```

实际跑 `node tools/build-portrait-states.js --check` 的输出：

```text
形象演进运行时数据与评审清单一致：35 角色 / 160 状态 / 282 章映射 / 19 个章内变化
```

本轮早期曾有一份 14:36 的并行草稿，与本清单有 154 处章映射/状态 id 差异（例如 `shi_zhu` ch03-07、`li_tiezhu` ch08/13、`zhu` ch09 这些未出场章）。该草稿现已按本清单重新编译并对齐，不再保留两套表。

**仍需注意**：运行时表对齐不等于状态 PNG 齐备。当前 `assets/generated/chars/` 只看到小满的部分状态图；本清单新增的 `xiaoman_ch02_rain`、`xiaoman_ch17_grassland`、`xiaoman_ch18_lazikou`、`xiaoman_ch19_cord` 等还要按 `faces` 补齐。缺图时引擎会回退到 `{id}_{face}.png` 或 SVG，不会 JS 报错，但玩家看不到该状态。

## 6. 机器自检（非独立验收）

本阶段跑了两条只读脚本（放在 `tmp/work/`，不进版本库）：

```powershell
node tmp/work/build-spec.js
node tmp/work/verify-spec.js
```

实际输出：

```text
已写入 docs/reviews/char-progression-spec.json
角色 35，状态 160，章节映射 282，beats 19
复核通过：35 角色 / 160 状态 / 282 章映射
```

复核覆盖：

- 35 个 id 与 SPEC §3.1 一一对应，无多无少；
- 每个角色 `chapterStates` 的键集合 = 剧本实际出场章集合；
- 每个状态 `faces` ⊇ 所辖章节实际使用的表情，且含 `calm`；
- 每个 beat 的 `after_text` 是原文连续片段，`portraitId` 存在；
- `wear`/`dirt` 为 0–5 整数，`injury` 在枚举内；
- 状态 id 全局唯一、前缀为角色 id；
- `appearance_en` 无否定句（否定全在 `avoid_en`）。

另外跑了仓库总闸门 `node tools/check.js`：**检查通过**；唯一警告是「未出场的角色（1）：narrator」——这与 §5.3 的说明一致（`narr` 步没有 `who`，旁白不会自动挂立绘）。

**这不是对成图的验收**。按 `PRODUCTION_SPEC.md` §8.1，自评不算验收；第二阶段的判定必须由独立 agent 做，并附真实截图/命令输出。

## 7. 评审交接与预检记录

第二阶段评审已追加在 §8（2026-10-20）；本节与 §7.1 保留为第一阶段/预检记录。

### 7.1 预检观察（非判定，供生成组提前修正）

写清单时仓库里已经有小满的几张状态图（`assets/generated/chars/xiaoman_ch*.png`，14:41–15:08 生成）。以下只是**非判定的预检观察**，不是最终验收；生成组若已重出，以新图为准。

> **历史说明（2026-10-20 17:20 追加）**：生成组随后重烘焙了全部 585 张状态图；小满三张现为 `ch01` 74 KB、`ch16` 93 KB、`ch19` 78 KB，均已低于 512 KB，画风/年龄/服装也有变化。下表保留为当时的预检记录，**正式判定以 §8 为准**。

| 文件 | 已确认 | 观察到的问题 | 可直接执行的修法（英文修正句） |
|---|---|---|---|
| `xiaoman_ch01_departure_calm.png` | 600×900 RGBA、透明底、切面、左上硬光；310,013 B | 军装看起来合身且偏新；领章与帽星是鲜红；帽子不够大；军号横抱在胸前，不是斜挎在身侧 | `oversized faded blue-grey tunic with drooping shoulder seams and sleeves covering half the hands, cap brim pressed down to the eyebrows, collar tabs and cap star faded dark red-brown, bugle hanging at the right side with the right hand on the strap` |
| `xiaoman_ch16_snow_calm.png` | 600×900 RGBA、透明底、切面、左上硬光；雪霜与破袖成立 | 帽星仍是橙红；脸偏成年；手上有干净白绷带（清单未要求）；622,386 B，超过 512 KB 立绘上限 | `frost-crusted cap with the star reduced to a dull brown cloth shadow, rounder fifteen-year-old cheeks and softer jaw, a dirty frost wrap instead of a clean white hand bandage`；重烘焙后压到 512 KB 以下 |
| `xiaoman_ch19_wuqi_calm.png` | 600×900 RGBA、透明底、切面、左上硬光；暗红领章与旧军装成立；486,953 B | 脸偏成年；双手大面积白绷带（清单只写 ch18 左臂新伤）；号上没有 ch19 beat 的深色麻线带（这张是章默认状态，麻线带应另出 `xiaoman_ch19_cord`） | `younger fifteen-year-old face, narrow frost wrap on the hands instead of heavy white bandages`；另出 `xiaoman_ch19_cord` 时加 `dark braided cord tied around the third section of the bugle tube` |

这三张的共同结论：**画幅、透明底、切面、左上硬光都成立**；主要偏差集中在年龄感、帽星/领章颜色、服装新旧和手持物。第二阶段正式评审时，这些点会按 `PASS` / `PARTIAL` / `FAIL` 重新判，不沿用本节措辞。

第二阶段必须逐项检查：

1. 清单与剧本、史实是否一致（重点：石柱左右伤、何晓梅性别、雪山单衣、补给点）。
2. 同一角色是否同脸、同年龄、同帽型/发型、同标志物；35 人两两可区分。
3. 磨损是否连续；`wear` 回落是否只出现在 §5.4 的点。
4. 道具接触点：号带、铜锅、门板、担架、银饰、枪、药箱是否真的在手上/背上/腰上。
5. 头部角度与视线是否克制；同一角色相邻状态是否突然扭头/抬头。
6. 表情是否与对白情绪相符；8 种表情是否仍可区分（至少眉、眼、嘴三处同时变）。
7. 资源是否齐：`assets/generated/chars/{id}_{face}.png` 是否按 `faces` 全量存在；缺图是否静默回退。
8. 体积是否过档：立绘 PNG ≤ 512 KB；`node tools/check.js` 与体积自检末行 `超过本档上限的文件数 = 0`。
9. 关键图是否至少看原生分辨率或局部裁剪（600–900 px），不以缩图判块面。
10. JS 是否 0 报错；`node tools/e2e-run.js` 是否全剧通关。

判定格式（每条）：

```text
[PASS|PARTIAL|FAIL] <角色>/<状态或章 beat>
证据：<截图路径 / 命令输出 / 画面具体位置>
问题：<一句话>
修法：<可直接执行的英文修正句，或「原句 → 改句」，或「移到第 N 步」>
```

`PARTIAL` / `FAIL` 没有可执行修法 = 评审不合格。

## 8. 第二阶段评审（独立复核，2026-10-20）

### 8.1 复核范围与证据

**机器闸门（全部通过）**

```text
node tools/build-portrait-states.js --check
  形象演进运行时数据与评审清单一致：35 角色 / 160 状态 / 282 章映射 / 19 个章内变化

python tmp/work/check-state-pngs.py
  清单状态图：585 张；缺失 0；600×900；透明上角；最大 146 KB

python tools/check-portrait-key.py
  立绘洋红残留检查：765 张；洋红残留：0 张超阈值

node tools/check.js
  检查通过（唯一警告：narrator 未出场）

node tools/check-assets.js
  规范检查通过

node tools/e2e-run.js
  20 章 / 24062 步 / 0 条 JS 报错
```

**目视取证**

- 35 人 calm 总览：`tmp/review/all-calm.jpg`（原生 600×900 缩到 180×270，只用于辨识度/连续性，不用于判块面）。
- 主要角色全状态 calm 拼版：`tmp/review/states-{mao,zhou,zhu,xiaoman,he_xiaomei,wu_laoliu,san_wa,shi_zhu,li_tiezhu,liu_bocheng}.jpg`。
- 表情差分拼版：`tmp/review/xiaoman-faces.jpg`、`hexiaomei-faces.jpg`、`wulaoliu-faces.jpg`、`sanwa-faces.jpg`、`zhou-ch08-faces.jpg`、`xie-ch16-faces.jpg`、`deng-ch03-faces.jpg`。
- 原生分辨率逐张看过的关键图：`xiaoman_ch01_departure_calm`、`xiaoman_ch16_snow_calm`、`xiaoman_ch17_pot_calm`、`xiaoman_ch16_snow_calm`、`san_wa_ch01_start_calm`、`zhu_ch02_start_calm`、`peng_ch01_start_calm`、`nie_ch02_start_calm`、`mao_ch01_ill_calm`、`zhou_ch01_start_calm`、`lin_ch02_start_calm`、`he_zizhen_ch01_start_calm`、`xu_xiangqian_ch17_maogong_calm`、`zhang_guotao_ch17_maogong_calm`、`chen_yun_ch01_start_calm`、`shi_zhu_ch15_burned_calm`、`li_tiezhu_ch17_death_calm`、`xiao_yedan_ch13_yihai_calm`、`xiao_yedan_ch13_oath_calm`、`yi_people_ch13_freed_calm`。

**覆盖限制**：585 张没有逐张按原生分辨率看；用的是「全量机器检查 + 35 人总览 + 主要角色状态拼版 + 表情拼版 + 异常值定向原生复核」。未逐张原生看的图，判定只覆盖构图/连续性/资源层面，不声称已经逐块面验收。

### 8.2 总判定

**PARTIAL（可用，但需修）**。

- 角色级：**PASS 17 / PARTIAL 18 / FAIL 0**。
- 状态/文件级：**FAIL 3 项**（`xiaoman_ch16_snow_smile`、`xie_juezai_ch16_snow`、`mao_ch16_snow` 的厚衣）；`zhou_ch08_chishui` 的 stern/sad 已在 17:24–17:25 回同脸，剩 worry/机位漂移判 PARTIAL；`he_xiaomei_ch03_xiangjiang_sad` 已在 17:22 重出单人头像，改判 PASS。其余为 PARTIAL。
- 资源齐全、运行时表一致、0 条 JS 报错、0 张洋红残留、0 张超 512 KB，这些硬闸门都过；问题集中在**画面一致性**，不是资源缺失。

### 8.3 逐人判定

| 角色 | 判定 | 主要依据 / 需修 |
|---|---|---|
| `mao` | PARTIAL | 8 个状态脸型连续，但整体像 30 岁而非 41 岁；ch16 围巾/外套过厚，违背单衣；领章鲜红与“帽徽已拆”不一致。修：加年龄/病容，ch16 改薄衣+粗布，统一褪色领章。 |
| `zhou` | PARTIAL | ch01-06、ch12-19 连续；ch08 的 stern/sad 已在 17:24–17:25 回同脸，但 crop/头身比仍与 calm 不同，worry 还是旧机位。修：四张统一同一机位/头身比。 |
| `zhu` | PARTIAL | 灰须、宽肩、步枪、毯子连续；脸偏长偏瘦，设计表要圆脸宽颌；ch20 大衣看着像新呢大衣。修：圆脸宽颌，ch20 改洗净旧军装。 |
| `zhang_wentian` | PASS | 圆框眼镜、灰围巾、笔记本、深灰军装连续；年龄/瘦长脸成立。 |
| `wang_jiaxiang` | PASS | 担架、腹部厚绷带、苍白瘦脸连续；ch07 更瘦更高，符合。 |
| `bogu` | PASS | 中山装、手风琴、圆框眼镜、书生气成立；ch07 去掉手风琴、只剩报告，符合会议。 |
| `lide` | PASS | 外国人面部、土黄呢大衣、地图筒、望远镜；与红军灰绿军装区分明显。 |
| `peng` | PASS | 方脸、浓眉、下颌前突、望远镜、手枪；ch01 与 ch08-10 的战损连续。领章鲜红是系统问题。 |
| `lin` | PARTIAL | 年轻、笔直、望远镜成立；脸与周恩来过近，脸级不够可分。修：窄下颌、薄眉、更少年感。 |
| `nie` | PARTIAL | 方正、稳重、政委臂章成立；但加了设计表没有的圆框眼镜，容易与张闻天混。修：去掉圆眼镜或换窄框。 |
| `liu_bocheng` | PASS | 右眼眼罩、望远镜、地图、挺拔身形；ch13 红旗/手枪与结盟 beat 连续。 |
| `chen_yun` | PASS | 清瘦文气、旧皮包、账本、钢笔；脸与周/林可分。 |
| `he_zizhen` | PASS | 女性、齐肩短发、双枪枪套、束腰；ch03 血手帕、无新增外伤，符合剧本。 |
| `deng_yingchao` | PARTIAL | 女性、灰围巾、针线包成立；ch03 的 weak/dawn 机位与光线跳变。修：同机位同夜色，只改表情。 |
| `xu_teli` | PARTIAL | 白发白须、圆眼镜、木棍、驼背成立；长衫是毛边厚 gown，缺灰绿军装，ch16 毛袖口违背单衣。修：薄军装+薄长衫，去掉毛边，ch16 加霜/破口。 |
| `dong_biwu` | PARTIAL | 灰白短发、书、温和老者成立；但穿的是民用灰色长衫，不是灰绿军装。修：军装领口+薄长衫。 |
| `lin_boqu` | PARTIAL | 眼镜、算盘、粮袋、账本成立；ch16-17 合并状态偏“冷饿”而非明确的雪山/草地。修：拆 ch16/17，或改成过渡造型。 |
| `xie_juezai` | PARTIAL | 全白须发、拐棍、日记成立；ch01/06 是毛边民用长衫，ch16 仍是厚毛边、干净日记、无破口。修：军装+薄长衫；ch16 去毛边、加霜/破口。 |
| `ye_jianying` | PASS | 参谋臂章、电报、铅笔、军便帽；ch03-17 的疲惫递进成立。 |
| `zhang_guotao` | PASS | 体胖宽脸、深灰好料军装、怀表、手枪；ch20 变瘦但仍整齐，符合。 |
| `xu_xiangqian` | PARTIAL | 宽厚敦实、望远镜成立；缺红四方面军标识，和普通一方面军军官难分。修：加红四方面军帽徽/领章区别。 |
| `li_xiannian` | PASS | 年轻、硬下颌、步枪、新草鞋；懋功送鞋的身份点成立。 |
| `xiao_yedan` | PASS | 黑帕、银饰、查尔瓦、佩刀；结盟 beat 去掉银饰、抱红旗，变化明确。 |
| `xiaoman` | PARTIAL | 脸/号/布包连续；军装不够“偏大”，脸从 15 到 17 岁、从草地饥饿到会宁的变化不够；ch16 仍显壮实。修：偏大军装/帽，ch17 凹颊裂唇，ch20 更成熟。 |
| `li_tiezhu` | PARTIAL | 铜锅、围裙、头巾、憨厚脸连续；ch17 饥饿死亡状态成立；ch16 雪山图没有霜/雪，围裙偏干净。修：锅沿结霜、围裙冻硬、帽肩落雪。 |
| `he_xiaomei` | PARTIAL | 女性、白围裙、红十字、药箱连续；ch03 sad 已于 17:22 重出为同机位单人头像；ch16 外套仍偏厚。修：ch16 薄衣+冻硬围裙。 |
| `guo_daniang` | PASS | 蓝布大襟衫、深色围裙、蓝头巾、门板、顶针；ch01 顶针 beat 成立。 |
| `shi_zhu` | PARTIAL | 红旗、步枪、左肩伤、少一条绑腿连续；ch15 burned 前胸烧伤不够可读。修：胸口/双臂加可见焦红烧伤、烟灰、绷带。 |
| `a_yue` | PASS | 银片头饰、银项圈、靛蓝百褶裙、背篓、柴刀；ch18 麻绳、ch19 刻痕木棍成立。 |
| `wu_laoliu` | PARTIAL | 旧疤、烟袋、步枪、补丁连续；帽星在不同状态时有时无，ch06 赤脚与“新草鞋”不符。修：统一帽星；ch06 露草鞋或裁到腰。 |
| `san_wa` | PARTIAL | 过大的帽/衣、草绳腰带、黑布鞋/草鞋细节成立；ch16-17 合并成一张草地锅边图，ch16 雪山没有雪。修：拆 ch16 雪 / ch17 草，雪图无锅、加霜。 |
| `soldiers` | PARTIAL | 三人可分辨、磨损不同；ch16-18 合并成雪景，草地/腊子口仍用雪图。修：拆 ch16/17/18，或改过渡造型。 |
| `villagers` | PASS | 老人/妇女/孩子三类人稳定，地区服装更换合理；ch19 白羊肚手巾/黄米馍成立。注：老人脸随地区略有变化，若要求严格同三人需固定。 |
| `yi_people` | PASS | 三人年龄/体态可分；ch13 土牢→砸链后站起、去掉木枷，beat 成立。 |
| `narrator` | PASS | 兜帽无脸、灰色长衫、无标识；calm/fierce/sad 可靠肩线/阴影区分。 |

### 8.4 具体 FAIL / PARTIAL 与可执行修法

| 文件 / 状态 | 判定 | 证据 | 修法 |
|---|---|---|---|
| `zhou_ch08_chishui_worry.png`（stern/sad 已改善，剩 crop/机位） | **PARTIAL** | stern/sad 在 17:24–17:25 重出后已回同脸；但 calm 是胸像、stern/sad 是中景，worry 仍是旧中景，头身比/桌面占比不一致，切换时仍会跳镜头。 | `regenerate worry and smile from the new stern base; then regenerate calm from the same camera and crop, so all four faces share one head size, one map-table framing and one light direction` |
| `he_xiaomei_ch03_xiangjiang_sad.png`（17:22 已重出） | **PASS（复判）** | 现为单人 600×900 胸像，同机位、同白围裙/红十字/药箱，只改悲伤表情；原“另一场景”问题已消失。剩领章鲜红属于系统问题。 | 无需单条修法；并入 §8.5 的领章统一。 |
| `xiaoman_ch16_snow_smile.png` | **FAIL** | 与同状态其余 7 张不是同一角色/同一画风：更写实、更暗、脸型/帽型/衣装都不同。当前状态 `faces` 不含 smile，属于多余坏图；若以后加 smile 会直接穿帮。 | `regenerate from xiaoman_ch16_snow_calm as the identity and pose reference; keep the same face, cap, frost and uniform; change only the mouth and eyes; or delete this unused file` |
| `xie_juezai_ch16_snow_*` | **FAIL** | 毛边厚长衫、干净日记、无明显霜/破口；与“单衣翻雪山、衣摆撕口、白须结冰”冲突。 | `thin grey-green military tunic under a thin torn scholar gown, no fur cuffs, frost on the white beard and shoulders, a wind tear at the hem, the diary edge stiff with cold` |
| `mao_ch16_snow_calm.png` | **FAIL** | 厚围巾/厚领口，人物像 30 岁；与“单衣、粗布缠腰、41 岁病后消瘦”冲突。 | `gaunt 41-year-old face, thin single-layer grey-green tunic with a crude cloth waist wrap, frost on the shoulders and cap, no thick scarf or padded collar` |
| `san_wa_ch16_snow_calm.png` | **PARTIAL** | 状态覆盖 ch16-17；图是草地锅边场景，没有雪；ch16 雪山段会直接用这张。 | `split into san_wa_ch16_snow (frost, no pot, snow on cap/shoulders) and san_wa_ch17_grassland (pot, cut belt, mud); regenerate both` |
| `xiaoman_ch17_grassland_calm.png` | **PARTIAL** | 脸仍圆润健康，和“草地断粮、李班长刚死、五天才四两粮”不符。 | `hollow cheeks, sunken eyes, cracked lips, sharp jaw, same pot and straw-rope belt; keep the boy's identity but show starvation` |
| `shi_zhu_ch15_burned_calm.png` | **PARTIAL** | 前胸裸露但烧伤不可读，整体过暗；观众更像看到“疲惫伤员”而不是“冲火后烧伤”。 | `visible scorched red burns across the exposed chest and both forearms, soot on the face, rough bandages, keep the rifle and red flag; lift the exposure slightly so the burns read` |
| `li_tiezhu_ch16_snow_calm.png` | **PARTIAL** | 锅沿无冰、围裙偏干净、帽肩无雪；雪山段不够冷。 | `frost on the copper pot rim, frozen stiff apron, snow on the headband and shoulders, cracked hands; keep the pot hugged to the chest` |
| `he_xiaomei_ch16_snow_calm.png` | **PARTIAL** | 外套偏厚，像棉衣；与“单衣+白围裙”冲突。 | `thin grey-green tunic and frozen white apron, frost on the nurse cap and brows, no padded coat; keep the soldier's frostbitten feet against her chest` |
| `deng_yingchao_ch03_ill_weak/dawn.png` | **PARTIAL** | weak 更近、dawn 更亮更暖；同一条夜渡对白里切表情会跳。 | `same camera, crop and cold night lighting as deng_yingchao_ch03_ill_calm; only change brows, eyes and mouth` |
| `zhu_ch02_start_calm.png` | **PARTIAL** | 脸偏长偏瘦，设计表要圆脸、宽颌、宽肩厚背。 | `rounder face, wider jaw, thicker neck and shoulders; keep the grey-flecked beard, rifle and octagonal cap` |
| `mao_ch01_ill_calm.png` | **PARTIAL** | 像 30 岁，不够 41 岁病后消瘦；领章鲜红、帽无星，和其他人标识不统一。 | `gaunt 41-year-old face with deep-set eyes and hollow cheeks; dull dark-red collar tabs with stitch marks; keep the cap without a bright star` |
| `nie_ch02_start_calm.png` | **PARTIAL** | 圆框眼镜不在设计表，容易和张闻天混。 | `remove the round glasses; keep the square steady face, commissar armband and notebook; give him narrower eyes to separate him from Zhang Wentian` |
| `lin_ch02_start_calm.png` | **PARTIAL** | 与周恩来脸型/眉眼过近。 | `narrower jaw, thinner brows, younger cleaner face; keep the upright posture, binoculars and neat cap` |
| `xu_xiangqian_ch17_maogong_calm.png` | **PARTIAL** | 没有红四方面军标识，和普通一方面军军官难分。 | `add a distinct Fourth Front Army red cap badge or collar mark; keep the broad stout build and binoculars` |
| `xiaoman_ch01_departure_calm.png` | **PARTIAL** | 军装合身、帽不偏大；与“明显不合身、帽檐压眉”不符。 | `oversized faded blue-grey tunic with drooping shoulder seams and sleeves covering half the hands; oversized cap with the brim pressed to the eyebrows` |
| `wu_laoliu_ch06_supply_calm.png` | **PARTIAL** | 赤脚可见，但状态写“新草鞋”。 | `visible new straw sandals on both feet; if feet are below the crop, crop at the waist so bare feet are not shown` |
| `zhu_ch20_huining_calm.png` | **PARTIAL** | 厚重呢大衣，像新发的；状态写“洗净旧军装”。 | `washed faded grey-green tunic, no heavy new greatcoat; keep the grey beard and clasped hands` |
| `xu_teli` / `dong_biwu` / `xie_juezai` ch01/06 | **PARTIAL** | 民用长衫，缺灰绿军装领口/领章；徐/谢还带毛边，董必武是素面长衫。五人组的历史军装身份弱。 | `grey-green military tunic visible at the collar under a thin scholar gown; remove the fur cuffs; keep the white beard, glasses/staff and book` |
| `mao/zhu/xie/wu/he_xiaomei/san_wa/soldiers/lin_boqu` 的 ch16-18 合并状态 | **PARTIAL** | 一张雪景被多个章共用（`san_wa`/`lin_boqu` 为 ch16-17，其余为 ch16-18）；草地/腊子口会错误地出现积雪和厚霜。 | `split the merged state into ch16 snow, ch17 grassland and ch18 lazikou (or use a snow-free cold-wet transitional look and document the compromise)` |
| 全部 585 张 | **PARTIAL（契约）** | 实际是 palette PNG（mode P + tRNS），`SPEC.md` 写的是 RGBA；浏览器透明正常，但契约字面不符。 | `either re-export as RGBA PNG under 512 KB, or update SPEC/PRODUCTION_SPEC to explicitly allow palette PNG with tRNS after visual alpha check` |
| 全体红军角色 | **PARTIAL（系统）** | 帽星/领章有的鲜红、有的消失、有的只剩针脚；同一章内不统一，且 ch01 #9 已命令拆鲜红标识。 | `use one consistent insignia treatment for all ch01+ states: dull dark-red collar tabs with stitch marks and a dark star shadow; no bright red star, no random bare cap` |

### 8.5 系统性修法（按优先级）

**P0：会直接穿帮的**

1. **表情变体必须同机位/同姿势/同画风**。用同状态的 `calm` 当身份与构图参考，只改眉、眼、嘴；不要每个表情独立重画。`he_xiaomei_ch03_xiangjiang_sad` 已修复；`zhou_ch08_chishui` 的 stern/sad 已回同脸但 crop 仍漂，worry/smile 仍待统一；`xiaoman_ch16_snow_smile` 仍待重出或删除。
2. **雪山单衣**。`xie_juezai`、`mao`、`he_xiaomei`、`xu_teli`、`dong_biwu`、`li_tiezhu` 的雪景都出现了毛边/厚外套/干净围裙；按 §8.4 的英文句重出。雪山段允许“借来的粗毯”，但不允许自带棉衣/皮帽/毛边。
3. **ch16-18 合并状态**。目前雪景被草地、腊子口共用；要么拆状态（推荐），要么用“冷湿、无积雪”的过渡造型并在报告里明确这是妥协。

**P1：身份与连续性**

4. **统一领章/帽星**：见 §8.4 最后一行。
5. **年龄与消瘦**：毛泽东 41 岁病容、小满 ch17 饥饿、小满 15→17 岁、朱德圆脸宽颌、林彪与周恩来分开、聂荣臻去圆眼镜、徐向前加四方面军标识。
6. **五老军装**：徐特立/董必武/谢觉哉的军装领口要可见；长衫可以薄，但不能变成民用毛边厚袍。
7. **石柱烧伤可读**：胸口/双臂的烧伤必须一眼看出，不能只是“脏”。

**P2：契约与流程**

8. **palette PNG vs RGBA**：要么改契约允许 P+tRNS（需 `/root`），要么重导出 RGBA；两者选一，不要评审时一会儿按 RGBA 判、一会儿按体积判。
9. **群众老人脸**：`villagers` 的老人跨地区略有换脸；若要求严格同三人，固定同一张老人脸，只换服装。
10. **多余坏图**：`xiaoman_ch16_snow_smile.png` 当前状态不需要 smile；删掉或重出，避免以后加表情时踩雷。

### 8.6 复判条件

修完后至少重跑：

```powershell
node tools/build-portrait-states.js --check
node tools/check.js
node tools/check-assets.js
python tools/check-portrait-key.py
node tools/e2e-run.js
```

并对 §8.4 表中的文件逐张按原生分辨率复看；修好的项在本节追加 `PASS`，未修的保持 `PARTIAL`/`FAIL`。如果拆了 ch16-18 状态，必须重新生成运行时表、重新统计 `585` 的覆盖数，并确认没有新的缺图。

**本轮总判定：PARTIAL。** 资源与运行时链路已经收口，画面可用；但表情变体一致性、雪山单衣、ch16-18 合并状态这三类问题会在玩家实际推进时被看见，不能直接报 PASS。
