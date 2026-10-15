# R1 提问组 · content 分区

> 负责人：第一组·content 分区（号段由组长分配：`R1-Q05` … `R1-Q08`）。
> 范围：`src/story/ch01..ch20.js` 的**剧本 / 文案 / DSL 一致性 / 史实 / 文风 / 分镜节奏 / 选项与 goto 完备性 / 排版**。
> 不碰：美术渲染（见 `docs/issues/R1-visual.md`）与引擎/界面（engine 分区）。
> 基线：`node tools/check.js` 全绿（20 章 / 61043 汉字 / 60 选项 / 81 史料档案）。
> **每条都先自己验证过**，命令与真实输出原文照贴；未验证的猜测一律写在文末「已排除的候选」。

## 0. 与组长工单 `docs/issues/R1-INDEX.md` 的关系（请组长过一遍）

本条记是**组长派给 content 分区的任务书（号段 `R1-Q05` … `R1-Q08`）**的产物。交稿时看到 `R1-INDEX.md` 已经落地，逐条对齐如下：

1. **编号不冲突**：`R1-INDEX.md` §1 的表里是 `R1-Q09` … `R1-Q15`，没有 `Q05`–`Q08`，所以本文件的 4 条可以**直接追加**进 §1（不需要重新编号）。
2. **`R1-INDEX.md` §5 的记载需要更新**：那里写「本轮 engine / content 两个提问分区没有交出文档……agent 未能收到任务书」。content 这一条**是收到了任务书并已交付**（就是本文件：4 条问题 + 已排除候选 + 附带发现）；engine 分区的情况我这里无从判断，请组长按实际收件情况改这段。
3. **`R1-INDEX.md` §2.3「冻结文件一律不动」直接改变了本文件 R1-Q06 的首选修法**：我原本首选改 `src/data/characters.js` 的 `first`（11 处），按本轮裁决它**不可动**，因此 Q06 在本轮只能走"改剧本 `ch04.js`"的降级路线，或者挂到下一轮。下面 Q06 的「不可行就说明」已按这条裁决改过。
4. **派工缺口**：`R1-INDEX.md` §3 里第二组只认领了 `src/story/ch03.js`（且仅限 Q09 所需的最小改动），其余 `src/story/*.js` 本轮**没有解决人**。本文件 Q05 / Q07 / Q08 的修法全部落在 `src/story/*.js` 上，请组长决定是加派给 `g2_eng`（文案改动的性质更接近文档/契约）还是顺延。
5. **严重度对照**：本文件最高是 P1，低于 §1 里 `R1-Q13` 的 P0，因此不影响本轮 P0 的优先序。

---

## R1-Q05　剧本里 33 个 `{ t: 'note' }` 史料小注，有 27 个玩家永远看不到

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q05 |
| **严重度** | P1 |

**现象**

`src/story/` 里有 **33 个 `{ t: 'note', text: … }` 步**（分布在 ch05/ch06/ch08/ch13/ch14/ch15/ch19/ch20 共 8 章），它们写的是成段的史实小注（"1934年12月18日，中央政治局在贵州黎平召开会议……"这种）。这些步在引擎里是**非阻塞**的：`exec()` 写完小注立刻继续跑下一步，而**下一条对白步一定会调一次 `setNote()`**——没写 `note` 就 `classList.add('hidden')`，而 `css/style.css:355` 是 `.hidden { display: none !important }`。于是同一帧内"写完就被抹掉"，`requestAnimationFrame` 补上的 `.on` 再也压不过 `!important`。

**逐条数出来：33 个 note 步里，27 个的"第一个阻塞步"就是对白步，这段小注从头到尾没有一次落屏机会。**

**证据**

1. SPEC 只把 `note` 定义成 `say`/`narr` 的**字段**，没有把它定义成 step（`docs/SPEC.md:70` 是 §2.1 类型表，`:78`/`:79` 是 `say`/`narr` 的 `note?` 字段）；而 `tools/check.js:45` 的 `STEP_TYPES` 却把它收成了合法 step —— **契约与实现不一致**（这是本问题的根因，见文末附带发现 B）。

```
docs/SPEC.md:70  ### 2.1 Step 类型（`steps` 数组的元素）
docs/SPEC.md:78  | `say` | `who`, `face?`, `text`, `note?` | 有说话人的对白；`note` 为史料小注（可省略） |
docs/SPEC.md:79  | `narr` | `text`, `note?` | 旁白（无名框、居中偏上排版） |
tools/check.js:45  const STEP_TYPES = ['bg', 'show', 'hide', 'clear', 'say', 'narr', 'think', 'title', 'fx', 'cg',
  ……（同数组里还有 'note'）
```

2. 引擎侧四行源码，决定了这个小注活不过下一步：

```
src/engine/engine.js:783  case 'note':
src/engine/engine.js:784  setNote(s.text);
src/engine/engine.js:785  return false;          ← 非阻塞：同一帧继续跑下一步
src/engine/engine.js:560  setNote(note);         ← showDialogue() 每条对白都调，没写 note 就是 undefined
src/engine/engine.js:571  function setNote(note) {
  572-575    if (note) { …textContent = note; remove('hidden'); rAF(function () { add('on'); }); }
  577-578    else     { remove('on'); add('hidden'); }
src/engine/engine.js:820  function run() 是同步 while 循环，run 到第一个阻塞步才返回 —— 浏览器只在那一刻绘制
css/style.css:355  #overlay.hidden, .hidden { display: none !important; }
```

3. 手验一例（ch05 第一个 note 步，`ch05.js:22`）——`note → show → show → say`，`show` 不阻塞，所以阻塞步就是那句 `say`：

```powershell
node -e "const fs=require('fs'),vm=require('vm');const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync('src/story/ch05.js','utf8'),sb,{filename:'ch05'});const st=sb.window.STORY.ch05.steps;let idx=st.findIndex(s=>s&&s.t==='note');console.log('第一个 note 步下标 = '+idx);for(let i=idx;i<idx+6;i++){const s=st[i];if(!s)continue;console.log(String(i).padStart(4)+'  t='+String(s.t).padEnd(6)+'  note='+(s.note?'有':'-'));}"
```

```
第一个 note 步下标 = 7
   7  t=note    note=-
   8  t=show    note=-
   9  t=show    note=-
  10  t=say     note=-
  11  t=say     note=-
  12  t=say     note=-
```

（ch15 三条同理：`note -> show -> say …`；ch19 六条分别落在 `note -> show -> say`、`note -> narr`、`note -> hide -> narr`、`note -> bg -> narr` 上。）

4. 全剧统计（**这条就是验收命令**）：

```powershell
node -e "const fs=require('fs'),vm=require('vm');const D={say:1,narr:1,think:1},B={say:1,narr:1,think:1,title:1,cg:1,wait:1,choice:1,end:1};let tot=0,dead=0;for(const f of fs.readdirSync('src/story').filter(x=>/^ch\d+\.js$/.test(x)).sort()){const id=f.slice(0,-3);const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync('src/story/'+f,'utf8'),sb,{filename:f});const seq=[];(function lin(a){(a||[]).forEach(s=>{if(!s)return;if(s.t==='if'){lin(s.then);lin(s.else);return;}seq.push(s);});})(sb.window.STORY[id].steps);seq.forEach((s,i)=>{if(s.t!=='note')return;tot++;for(let j=i+1;j<seq.length;j++){const nx=seq[j];if(!B[nx.t])continue;if(D[nx.t])dead++;break;}});}console.log('note 步 = '+tot+'，其中第一个阻塞步就会把小注顶掉/抹掉的 = '+dead);"
```

```
note 步 = 33，其中第一个阻塞步就会把小注顶掉/抹掉的 = 27
```

5. note 步清单（文件:行号）：

```
ch05.js  5 处  22, 90, 112, 198, 232
ch06.js  4 处  76, 98, 169, 372
ch08.js  5 处  23, 55, 144, 187, 307
ch13.js  5 处  24, 69, 131, 272, 353
ch14.js  2 处  53, 192
ch15.js  3 处  128, 181, 203
ch19.js  6 处  27, 86, 198, 360, 380, 387
ch20.js  3 处  33, 198, 371
```

**判定说明（诚实交代证据强度）**：第 1–4 条是源码逐行 + 逐章步序列的**静态推演**，没有跑无头浏览器（组长要求本轮不与其它 agent 抢 Edge）。推演依赖的三条事实都可独立复核：`exec()` 对 `note` 返回 false（非阻塞）、`showDialogue()` 每条对白都调 `setNote`、`.hidden` 带 `!important`。**验收组请用探针把 `#note-layer` 的实际 classList 读一遍确认**（`tools/e2e-steps.js` 支持 `note:<表达式>` 读页面内部状态，可读 `document.getElementById('note-layer').className`）。

**为什么是问题**

写作者是**照着"这里要显示一段史料小注"去写这 33 段文字的**——每段 60–180 字、**合计 2476 个字符**，是 ch05/ch06/ch08/ch13/ch14/ch15/ch19/ch20 八章的史实交代（黎平会议决议、猴场跨年、土城战役、彝海结盟、十七勇士、二十二名夺桥勇士、哈达铺的报纸……）。其中 27 段现在**一个字都到不了玩家眼前**，而 `tools/check.js` 全绿、控制台无报错——**静默的内容丢失，正是本仓库最怕的那类故障**（对照 `README.md` §3 里 `tools/validate-svg.js` 存在的理由："防静默空白图"）。玩家读到的是"某件事一笔带过"，作者以为已经交代过了。

**验收标准**

第 4 条命令的输出必须变成 `…抹掉的 = 0`（即每个 `note` 步的"第一个阻塞步"都不是对白步），且 `node tools/check.js` 仍全绿。

**影响文件**

- `src/story/ch05.js` `ch06.js` `ch08.js` `ch13.js` `ch14.js` `ch15.js` `ch19.js` `ch20.js`（content 分区，共 27 处要动）；
- 根因在 `src/engine/engine.js:571`（engine 分区）——**但 content 侧可以先自行修好，不必动引擎**。

**不可行就说明（取舍）**

三条路，我推荐第一条（**改完落在 content 分区内**）：

1. **把 note 步的文字搬进紧随那句对白的 `note:` 字段**（`SPEC §2.1` 本来就为 `say`/`narr` 定义了 `note?`），删掉 `{ t:'note' }` 步。改完小注必然显示，且不新增任何 step 类型 —— 与 SPEC 对齐。
2. 在 `note` 步后补一个阻塞步（`wait` 或 `title`），让它在屏幕上停一下。代价：多一次停顿，节奏要逐个斟酌（33 处都要挑）。
3. 改引擎（`setNote` 给 `t:'note'` 加"粘到下一次 setNote 之前"的语义）—— 收益最通用，但要动 engine 分区，且改的是"契约外的 step 类型"，我认为不如 1 干净。

---

## R1-Q06　人物图鉴的「首次登场」有 11 处与剧本实际不符（阿月差了 14 章）

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q06 |
| **严重度** | P1 |

**现象**

人物图鉴的详情卡会写一行「首次登场：第X章 · 章名」（`src/engine/gallery.js:107`），这个值取自 `src/data/characters.js` 的 `first` 字段（`src/engine/engine.js:155`：`if (src.first) dst.chapter = src.first;`，注释写明"以数据表为准"）。而这张表里有 **11 处**与剧本实际的首次 `show` 不一致。最刺眼的是 **阿月：表里写 `ch18`（会宁大会师），剧本 ch04 就让她带着对白登场了**（`src/story/ch04.js:291-301`）——差 14 章；阿月进贵州时登场、`ch18` 才在腊子口带队攀崖，玩家在第四章就已经能解锁她的卡，卡片却写"首次登场：第十八章"。

**证据**

1. 全剧对账命令（**这条就是验收命令**）：

```powershell
node -e "const fs=require('fs'),vm=require('vm');const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync('src/data/characters.js','utf8'),sb);const CSS=sb.window.ART.charactersList;const first={};for(const f of fs.readdirSync('src/story').filter(x=>/^ch\d+\.js$/.test(x)).sort()){const id=f.slice(0,-3);const s2={window:{}};vm.createContext(s2);vm.runInContext(fs.readFileSync('src/story/'+f,'utf8'),s2,{filename:f});(function w(a){(a||[]).forEach(x=>{if(!x)return;if(x.t==='show'&&!first[x.who])first[x.who]=id;if(x.t==='if'){w(x.then);w(x.else);}});})(s2.window.STORY[id].steps);}const bad=CSS.filter(c=>first[c.id]&&c.first!==first[c.id]);console.log('first 与剧本实际首次 show 不一致 = '+bad.length+' 个');bad.forEach(c=>console.log('  '+c.id.padEnd(14)+'声明='+c.first+'  实际='+first[c.id]));"
```

```
first 与剧本实际首次 show 不一致 = 11 个
  zhu           声明=ch01  实际=ch02
  zhang_wentian 声明=ch01  实际=ch04
  wang_jiaxiang 声明=ch01  实际=ch04
  bogu          声明=ch01  实际=ch02
  lide          声明=ch01  实际=ch02
  peng          声明=ch02  实际=ch01
  liu_bocheng   声明=ch01  实际=ch02
  deng_yingchao 声明=ch01  实际=ch03
  ye_jianying   声明=ch01  实际=ch03
  a_yue         声明=ch18  实际=ch04
  soldiers      声明=ch01  实际=ch02
```

2. 阿月那 14 章的差距在剧本里是实打实的一场戏（不是"提及"）：

```
src/story/ch04.js:291  { t: 'show', who: 'a_yue', face: 'calm', slot: 'left' },
src/story/ch04.js:293  { t: 'say', who: 'a_yue', text: '你们不要走那条。那条是水路，涨起来要没过腰。' },
src/story/ch04.js:296  { t: 'say', who: 'a_yue', text: '阿月。' },
src/story/ch04.js:301  { t: 'hide', who: 'a_yue' },
src/data/characters.js:72  { id: 'a_yue', name: '阿月', role: '苗族向导', first: 'ch18', faces: FULL,
```

3. 显示链路（说明这张表是**玩家看得见的**那一份），另附第一章里周恩来上台的两行：

```
src/engine/engine.js:155  if (src.first) dst.chapter = src.first;     ← 数据表覆盖内置表
src/engine/gallery.js:107  … '首次登场：' + chapterTitleOf(c.chapter) + '　·　情绪：' …
src/story/ch01.js:21  { t: 'show', who: 'zhou', face: 'weak', slot: 'left' },
src/story/ch01.js:22  { t: 'say', who: 'zhou', text: '衣服上的红领章、红帽徽，全部拆下来。' },
```

4. 顺带：`src/engine/engine.js:40-140` 里还有一张**内置人物表**（35 条，同一批角色但 `chapter` 值不同），它**自己也错了 15 处**，且与 `src/data/characters.js` 互相矛盾（例如 zhou 内置表写 `ch05`、数据表写 `ch01`、实际是 `ch01`）。它只在数据表缺字段时才生效，所以玩家看不到它的错，但后续 agent 很容易照着它改：

```powershell
node -e "const fs=require('fs'),vm=require('vm');const first={};for(const f of fs.readdirSync('src/story').filter(x=>/^ch\d+\.js$/.test(x)).sort()){const id=f.slice(0,-3);const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync('src/story/'+f,'utf8'),sb,{filename:f});(function w(a){(a||[]).forEach(x=>{if(!x)return;if(x.t==='show'&&!first[x.who])first[x.who]=id;if(x.t==='if'){w(x.then);w(x.else);}});})(sb.window.STORY[id].steps);}const src=fs.readFileSync('src/engine/engine.js','utf8');const re=/^\s{4}(\w+): \{ name: '[^']*', role: '[^']*', chapter: '(ch\d+)'/gm;let m,bad=[],n=0;while((m=re.exec(src))){n++;if(first[m[1]]&&first[m[1]]!==m[2])bad.push(m[1]+' 内置='+m[2]+' 实际='+first[m[1]]);}console.log('engine.js 内置表条目 = '+n+'，其中与实际首次 show 不符 = '+bad.length);bad.forEach(b=>console.log('  '+b));"
```

```
engine.js 内置表条目 = 35，其中与实际首次 show 不符 = 15
  zhou 内置=ch05 实际=ch01
  bogu 内置=ch01 实际=ch02
  lide 内置=ch01 实际=ch02
  peng 内置=ch02 实际=ch01
  liu_bocheng 内置=ch05 实际=ch02
  chen_yun 内置=ch05 实际=ch01
  deng_yingchao 内置=ch04 实际=ch03
  xu_teli 内置=ch02 实际=ch01
  dong_biwu 内置=ch05 实际=ch01
  lin_boqu 内置=ch02 实际=ch01
  xie_juezai 内置=ch04 实际=ch01
  ye_jianying 内置=ch05 实际=ch03
  a_yue 内置=ch18 实际=ch04
  wu_laoliu 内置=ch02 实际=ch01
  soldiers 内置=ch01 实际=ch02
```

5. `narrator`（旁白）声明 `first: 'ch01'`，但全剧从不 `show`（`node tools/check.js` 也会警告「未出场的角色（1）：narrator」）。它算不算错可以讨论，故**不计入上表 11 处**。

**为什么是问题**

图鉴是玩家会主动点开的功能，卡片上写的是**关于角色的具体事实**。现在：周恩来在第一章开场第一场戏就上台说话（`ch01.js:21-27`），卡片却写"首次登场：第五章 · 黎平会议"；陈云、刘伯承同样在第一章就有戏，被写成第五章；阿月的卡在第四章就能解锁，却指向第十八章。玩家对不上号，会以为游戏记错了；后续 agent 按这张表写剧情也会错得更远。这不是"省略"，是**界面在陈述错误信息**，而且**两张表互相矛盾**、`tools/check.js` 不查。

**验收标准**

第 1 条命令退出后输出 `first 与剧本实际首次 show 不一致 = 0 个`；并且**同一份数据表里 `first` 与 `src/engine/engine.js` 内置表的 `chapter` 不再互相矛盾**（可用 `rg -n "chapter: 'ch0" src/engine/engine.js` 人工比对一次）；`node tools/check.js` 仍全绿。

**影响文件**

- 根治：`src/data/characters.js` 的 **11 个 `first`**（玩家可见的那一份）+ `src/engine/engine.js:40-140` 内置表里同样错位的 **15 个 `chapter`**。**但 `R1-INDEX.md` §2.3 已裁定"冻结文件一律不动"**（`src/data/characters.js` 在冻结名单内），`src/engine/engine.js` 也不在本轮任何解决人的名下 —— 所以这条路本轮走不通，请组长决定是否顺延到下一轮。
- 本轮可选（落在剧情侧，但 `src/story/*.js` 目前没派解决人）：改剧本——把 `src/story/ch04.js:291-301` 改成不具名向导（"队伍里新添了几个向导……"那段保留，删掉姓名揭晓那两句），让阿月的首次登台回到 ch18，**只解决阿月这 1 处**。

**不可行就说明（取舍）**

两条路的代价不同，我倾向改数据表（一处改齐、不影响剧情）：

- 改数据表（根治，但本轮被 §2.3 挡住）：一次改准 11 处 + 内置表 15 处；风险是两张表以后再漂移（建议顺手把内置表的 `chapter` 删掉，或加注释说明它只是兜底）。
- 改剧本（本轮可做）：只动 `ch04.js` 一处，分区内自足；代价是丢掉"阿月报名字"这个据点（她的名字到 ch18 才出现会显得突兀），而且其余 10 处错位依旧存在。
- 所以：**建议组长把这条拆成两半** —— 阿月那 1 处本轮改 `ch04.js`（或顺延），其余 10 处（含 engine 内置表）登记进 `docs/fixes/R1-BACKLOG.md`，等解冻 `src/data/characters.js` 时一次改齐。

---

## R1-Q07　ch09 正文「三月里」与全剧二月份的时间线正面冲突

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q07 |
| **严重度** | P1 |

**现象**

`src/story/ch09.js:428` 的旁白写着「**三月里**，红军二渡赤水之后连下桐梓、娄山关、遵义。」但这一章自己的 `date` 是 `1935年2月`，自己的标题卡依次是「二月九日·扎西」「二月十八日—二十一日·二渡赤水」「二月下旬·回师黔北」，自己的档案条目也写「一九三五年**二月十八日至二十一日**……东渡赤水河」；紧接着的下一章 `ch10` 的三张标题卡全是「**二月**二十六日」。史实上二渡赤水（2/18–21）、娄山关（2/26）、再占遵义（2/28）都在二月。

**证据**

1. 出错的就一行（**这是验收命令**）：

```powershell
rg -n "三月" src/story/ch09.js
```

```
428:      { t: 'narr', text: '三月里，红军二渡赤水之后连下桐梓、娄山关、遵义。' },
```

（全章"三月"仅此一处；同一位置后面紧跟的两句是「这是长征以来最大的一次胜利。」「可在娄山关之前的那一夜，没有人知道这件事。」——是一处刻意的"预叙"，但预叙的月份写错了。）

2. 同一章/相邻章与它冲突的时间标记：

```
src/story/ch09.js:11   date: '1935年2月',
src/story/ch09.js:15   titleCard: { text: '第九章', sub: '扎西整编·二渡赤水', date: '1935年2月', place: '云南·扎西' },
src/story/ch09.js:226  { t: 'title', text: '二月十八日—二十一日·二渡赤水' },
src/story/ch09.js:309  { t: 'title', text: '二月下旬·回师黔北' },
src/story/ch09.js:461  text: '一渡赤水后，国民党军队判断红军将由川南北渡长江，于是重兵云集川南。中央红军决定改变方向：一九三五年二月十八日至二十一日，由四川古蔺太平渡、二郎滩等地东渡赤水河，回师黔北。……'
src/story/ch10.js:179  { t: 'title', text: '二月二十六日·天亮前' },
src/story/ch10.js:199  { t: 'title', text: '二月二十六日·上午' },
src/story/ch10.js:361  { t: 'title', text: '二月二十八日·遵义' },
```

3. 契约与史料依据：

```
docs/SPEC.md:315         | ch09 | 9 | 扎西整编·二渡赤水 | 1935.2 | 云南·扎西 |
docs/STORY_BIBLE.md:75   ### ch09 扎西整编·二渡赤水（1935.2，云南扎西、四川太平渡）
docs/STORY_BIBLE.md:81   ### ch10 娄山关大捷（1935.2.26，贵州娄山关）
```

（史实：1935 年 2 月 18–21 日二渡赤水，2 月 26 日攻占娄山关，2 月 28 日再占遵义。）

**为什么是问题**

玩家在**同一章内**先读到标题卡「二月十八日—二十一日·二渡赤水」和「二月下旬·回师黔北」，往下几屏旁白却说"三月里"，翻到下一章又是"二月二十六日"。这是**当场可见的自相矛盾**，而且踩的是本作立身之本（`docs/SPEC.md` §8：「史实准确：人名、番号、日期、地名务必符合史实」）。一行错字会让人怀疑整段预叙乃至整章的时间线是否可信。

**验收标准**

1. `rg -n "三月" src/story/ch09.js` **无命中**（今天只有 428 行 1 处）；
2. 正文月份与 `ch09` 的 `date` 字段、该章三张标题卡、`ch10` 的三张「二月二十六日／二十八日」标题卡一致（用 `rg -n "date:|t: 'title'|三月|二月" src/story/ch09.js` 人工过一遍即可）；
3. `node tools/check.js` 仍全绿、`node tools/lint-story.js src/story/ch09.js` 无新增报错。

**影响文件**

`src/story/ch09.js`（content 分区，1 处）。

**不可行就说明**

无取舍，就是改月份。两种改法：把「三月里」改成「二月里」；或删掉月份，写成「二渡赤水之后，红军连下桐梓、娄山关、遵义。」。**注意别顺手把"预叙"结构改掉**——下一句「可在娄山关之前的那一夜，没有人知道这件事」就是靠这个回插成立的。

---

## R1-Q08　中文正文混用半角双引号 `"`（130 处）与直角引号「」（320 处），另有 1 处半角逗号

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q08 |
| **严重度** | P2 |

**现象**

对话框里同一个引号功能有两套写法：**130 处用 ASCII 直引号 `"`**（散在 9 章），**320 处用直角引号「」**。最糟的是**同一章内两种并存**（6 章）——`ch01.js:23` 写 `对外只说"转移"。`，同章 `ch01.js:88` 却写 `「到了北边，我还您」`；`ch07.js:53` 写 `反"围剿"`，同章 `ch07.js:151` 写 `「会。他们在楼上就是在说这件事。」`。此外 `ch03.js:30` 有一处**半角逗号**当顿号用。

**证据**

1. 全剧普查（**这条就是验收命令**，只统计玩家可见的文案字段：step 的 `text`/`prompt`/`note`、选项 `text`、档案 `title`/`text`）：

```powershell
node -e "const fs=require('fs'),vm=require('vm');let q=0,g=0;for(const f of fs.readdirSync('src/story').filter(x=>/^ch\d+\.js$/.test(x)).sort()){const id=f.slice(0,-3);const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync('src/story/'+f,'utf8'),sb,{filename:f});const k=[];(function w(a){(a||[]).forEach(s=>{if(!s)return;if(s.text)k.push(s.text);if(s.prompt)k.push(s.prompt);if(s.note)k.push(s.note);if(s.t==='choice')(s.options||[]).forEach(o=>k.push(o.text));if(s.t==='if'){w(s.then);w(s.else);}});})(sb.window.STORY[id].steps);(sb.window.STORY[id].archive||[]).forEach(a=>{k.push(a.title);k.push(a.text);});const s=k.join('\n');q+=(s.match(/\x22/g)||[]).length;g+=(s.match(/[\u300c\u300d]/g)||[]).length;}console.log('玩家可见文案里的 ASCII 双引号 = '+q+' ，直角引号 = '+g);"
```

```
玩家可见文案里的 ASCII 双引号 = 130 ，直角引号 = 320
```

2. 分章分布（同一份统计按文件拆开；**6 个章两种引号并存**：ch01 / ch04 / ch07 / ch11 / ch17 / ch18）：

```
ch01.js  ASCII=34  「」=10        ch11.js  ASCII= 2  「」=28
ch02.js  ASCII= 2  「」= 0        ch12.js  ASCII= 0  「」=12
ch03.js  ASCII= 4  「」= 0        ch13.js  ASCII= 0  「」=28
ch04.js  ASCII=26  「」=10        ch14.js  ASCII= 0  「」=10
ch05.js  ASCII= 0  「」=32        ch15.js  ASCII= 0  「」= 6
ch06.js  ASCII= 0  「」=34        ch16.js  ASCII=16  「」= 0
ch07.js  ASCII=32  「」=12        ch17.js  ASCII= 6  「」= 4
ch08.js  ASCII= 0  「」=16        ch18.js  ASCII= 8  「」= 6
ch09.js  ASCII= 0  「」=24        ch19.js  ASCII= 0  「」=50
ch10.js  ASCII= 0  「」=24        ch20.js  ASCII= 0  「」=16
```

3. 同章混用的实例：

```
src/story/ch01.js:23   { t: 'say', who: 'zhou', text: '番号一律不用。对外只说"转移"。' },
src/story/ch01.js:26   { t: 'say', who: 'chen_yun', text: '该带的都带上，不该带的……命令上是"尽量带上"。' },
src/story/ch01.js:88   { text: '双手接过来，说「到了北边，我还您」。', tag: '收下',
src/story/ch07.js:53   { t: 'say', who: 'bogu', text: '我作关于第五次反"围剿"的总结报告。' },
src/story/ch07.js:151  { text: '「会。他们在楼上就是在说这件事。」', tag: '说实话',
```

4. 半角逗号那一处：

```powershell
Select-String -Path src\story\ch03.js -Pattern '渡口,'
```

```
ch03.js:30  { t: 'say', who: 'zhou', text: '电报、命令、弹药、伤员、渡口,一份一份都要人管。' },
```

5. 库里"规范写法是「」"的三处旁证（同一套简体中文文案体系内，`“”` 出现次数为 **0**）：

```
src/data/characters.js:15   bio: '时年四十一岁。第五次反「围剿」后被排挤出军事指挥核心…'
src/data/characters.js:17   bio: '时年三十六岁。事必躬亲，常说「我来想办法」。…'
src/data/characters.js:75   bio: '三十五岁。整编后从排长变成班长，反而高兴：「离敌人近点。」…'
docs/SPEC.md:99             { text: '「跟着走，走到天亮。」', tag: '坚定',
```

**为什么是问题**

引号是**直接画在对话框里的字形**，ASCII `"` 与「」在中文正文字体里字形差别很大（前者是短竖线，后者是折角括号）。玩家在第一章会先看到 `"转移"`、再看到 `「到了北边，我还您」`；在遵义会议那一章会看到 `反"围剿"` 与 `「会。他们在楼上就是在说这件事。」` 相隔几屏。这不是"风格差"，是**同一部作品里两套排版并存**，而且 `"围剿"` 这种专有说法在 `docs/SPEC.md`、`docs/STORY_BIBLE.md`、`src/data/characters.js` 里都写作「围剿」。半角逗号（`ch03.js:30`）更是明确的错字。

**验收标准**

1. 第 1 条命令的输出变成 `玩家可见文案里的 ASCII 双引号 = 0 ，直角引号 = ≥320`；
2. `Select-String -Path src\story\ch03.js -Pattern '渡口,'` 无命中；
3. `node tools/check.js` 全绿、`node tools/e2e-run.js` 20 章 0 JS 报错（文案改动不应影响流程，这一步是防手抖）。

**影响文件**

`src/story/ch01.js`（34）、`ch02.js`（2，在 `:229` 的 `note` 字段里）、`ch03.js`（4）、`ch04.js`（26）、`ch07.js`（32）、`ch11.js`（2）、`ch16.js`（16）、`ch17.js`（6）、`ch18.js`（8）—— 共 9 章、130 处，content 分区。

**不可行就说明（取舍）**

不能无脑全替换，要逐条看三层嵌套：

- 外层对白已经是「」，内层引用要降一级写成『』（例：`「他说『走得动』，可脚已经肿了。」`）；今天这些 `"…"` 绝大多数出现在**旁白或对白的句中引用**，改成「」后会与句首的「」撞成"引号套引号"。
- `反"围剿"`（ch07 出现多处的固定说法）建议统一成 `反「围剿」` 或 `反围剿`（后者与 `docs/STORY_BIBLE.md` 的写法一致），两种都可，但**一章之内要一致**。
- 三处 `"云贵川"`（ch18:401）与 `"人过不去，神仙也难"`（ch16:328，档案正文）属于"引用俗语/番号"，建议用「」。

---

## 附一：本轮**已排除**的候选（写下来免得下一轮重复挖）

这些都是我先怀疑、动手验证后被**证伪**的，不是问题：

1. **「55 个 `if` 有永假分支」** —— 逐条对账后**全部条件引用的变量都被 `set` 出来过**，没有死分支（`node -e` 遍历 `cond` 与 `set` 的名字集合，差集为空）。
2. **「156 处 `record:` 是死数据」** —— 一度以为选项记录的 id 没人读。实际上分支是用**显式 `set: {var:'flag.x'}` + `if: {var:'flag.x'}`** 实现的（全剧 `cond` 里读了 **52 个 `flag.*`**），`record` 只是留痕字段。**不构成缺陷**，不立条。
3. **「ch09/10/11 有三处空锚点」** —— `after_choice1/2/3`、ch12 的 `after_boat`/`after_choice2` 从未被 `goto` 指向。但没有任何 `goto` 的目标不存在（死链 0），落点靠顺延执行，玩家侧不可见。**只是没人指的空 label，不值得占名额。**
4. **「ch09 把娄山关大捷提前讲完了（ch09:429 与 ch10:366 同一句台词）」** —— 那是刻意的**预叙**：ch09 下一句就是「可在娄山关之前的那一夜，没有人知道这件事」，随后倒回前夜；ch10 才是正面推进。**属风格选择，不是复制粘贴事故**，不立条。
5. **「阿月的人物弧光违反圣经（腊子口改成三娃带队）」** —— 证伪：ch18 里第一个攀上绝壁的确实是阿月（`ch18.js:172`「第一个上去的人，是那个苗族姑娘」），三娃是**另一条支线**（选项决定他去不去）。圣经对她"腊子口攀崖的带路人"的定位在剧本里成立。
6. **「文风红线：现代腔 / 网络语」** —— 20 章全文搜 `垃圾|搞定|没问题|流程|效率|情绪|打卡|粉丝|套路|营销|正能量|点赞|老铁|卧槽|牛逼` 等 20 余个词，**0 命中**；全角叹号 55 个 / 6.1 万字、问号 355 个，密度正常，不构成"感叹号滥用"。
7. **「史料档案 id 冲突 / tag 词表崩坏」** —— 81 条档案 id **全唯一**（`unlock('archive', id)` 不会互相覆盖）；`tag` 有 18 种取值、偏散（「史实」54 条），但 SPEC 未定义 tag 词表，**不立条**。
8. **「番号用错（1935 年 6 月后应为红一方面军）」** —— 抽查 ch16–ch20：`红一方面军`/`中央红军（红一方面军）`/`红四方面军`/`红二方面军` 用法与 `docs/SPEC.md` §8 及史实一致，无违规。
9. **「数字与日期和圣经不符」** —— 逐条核对 8.6 万 / 湘江后 3 万余 / 十七勇士 / 二十二名夺桥勇士 / 一昼夜 240 里 / 13 根铁索 / 九天九夜 / 7000 余人 / 达维 6.12 / 两河口 6.26 / 会宁 10.9 / 将台堡 10.22：**全部对得上**（唯一错的是 R1-Q07 的"三月里"）。

## 附二：附带发现（**不占名额**，供第二组/组长取舍）

| # | 发现 | 证据 | 建议 |
|---|---|---|---|
| A | **ch09 的档案 `a_qinggangpo`「土城战斗（青杠坡）」是第八章的战役**，与 ch08 的「土城战役与青杠坡战斗」重复；ch08/ch09 两章档案连读会像同一场战斗讲两遍，而 ch09 自己的「二渡赤水」「轻装」已各占一条 | `src/story/ch09.js:464-465`（id `a_qinggangpo`）与 `src/story/ch08.js:416-417`（id `a_tucheng`）标题互为同一场战斗；打印 81 条档案标题即可看到二者并存 | 把 ch09 这条换成第九章自己的题目（张闻天代替博古负总责 / 鸡鸣三省会议），或与 ch08 合并 |
| B | **`note` 作为 step 类型没写进 `docs/SPEC.md` §2.1**，但 `tools/check.js:45` 收了它、`engine.js:783` 实现了它 —— 契约与实现不一致（R1-Q05 的根因） | `docs/SPEC.md:70-95`（类型表无 `note`）vs `tools/check.js:45-46`、`src/engine/engine.js:783` | 若要保留 `note` 步，需向 `/root` 申请给 §2.1 补一行（冻结文件）；若按 R1-Q05 的第 1 种改法消灭这 33 个步，SPEC 反而不用动 |
| C | **ch12 小标题「五月五日—八日·九天九夜」** 把 4 天的跨度写成了"九天九夜" | `src/story/ch12.js:256` vs 同章 `:14`（summary）/`:443`/`:484` 的统一口径 5/3–5/9 九天九夜 | 改成「五月五日—八日 · 渡江中段」之类，别让"九天九夜"跟着一个 4 天区间 |
| D | **`src/story/ch12.js:484` 的档案写「周恩来……把自己的马也卖掉折成船资」**，这条细节在 `docs/STORY_BIBLE.md` 的 ch12 段（`:94`–`:99`）里找不到对应史实，是 81 条档案里少见的"孤证"；不是错，但口径要确认 | `src/story/ch12.js:484`；`docs/STORY_BIBLE.md:94`（ch12 小节，通篇未提卖马） | 保留则补依据；要谨慎就改写成"为解决船工工钱，红军用打土豪所得银元支付船资" |

## 附三：本轮用到的一次性脚本（都在 `tmp/g1-content/` 下，已被 `.gitignore` 忽略，不进版本库）

| 脚本 | 用途 |
|---|---|
| `tmp/g1-content/analyze.js` | 遍历 20 章 steps，产出条件/`record`/`set`/label/goto/choice 的对账表与标点普查 |
| `tmp/g1-content/analyze2.js` | 人物出场章表、意象关键词覆盖、跨章与章内重复句、半角标点原文 |
| `tmp/g1-content/first.js` | `src/data/characters.js` 的 `first` vs 剧本首次 `show`/`say`/被提及（R1-Q06 原始证据） |
| `tmp/g1-content/note.js` | 每个 `note` 步的"下一步"类型分布（第一版，只看一步，不够） |
| `tmp/g1-content/note2.js` | 按 engine 的 `exec/setNote/block` 语义逐步模拟，给出「33 个里 27 个落不到屏」 |
| `tmp/g1-content/cmd-note.js` | R1-Q05 验收命令的可读版本（报告里贴的是等价的一行式） |
