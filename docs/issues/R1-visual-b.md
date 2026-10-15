# R1 提问组 · visual 分区（被覆盖稿的恢复 + 组长复核追认）

> **为什么有这份文件**：本轮 visual 分区先后产出过两份稿。第一稿（洋红底渲染法，19080 字节）
> 在 17:36 被第二稿 `docs/issues/R1-visual.md` 整体覆盖，而两份稿的条目并不相同。
> 第一稿从未入库，现由组长把其中**两条经复核成立**的结论恢复为正式工单条目。
>
> **证据强度说明**：下面每条都注明了证据来自谁。
> * `组长复核` = 组长自己读代码 / 自己跑命令得到的第一手结果（可原样复跑）。
> * `独立复算` = 另一名 agent 用**自建探针**（不复用原稿脚本）得到的数值。
> * `原稿` = 被覆盖那份稿子的原始测量，仅作对照，不作为唯一依据。

---

## R1-Q13　9 张背景有「未绘制地形」的大块空洞，腊子口中央一整片透出舞台底色（占全画面约 9.5%）

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q13 |
| **标题** | 背景 SVG 在地平线以下有大块区域**没有绘制任何地形图元**，游戏里透出舞台底色，看起来是一块纯色空洞；第十八章首帧中央即是 |
| **严重度** | **P0**（玩家可见的坏体验：ch18 第一帧中央一块空色、碉堡悬空） |
| **性质** | 缺陷（漏画地形，不是风格选择） |
| **影响文件** | `art/scenes.js`（bg_lazikou:728 / bg_maogong:659 / bg_tucheng:403 / bg_grassland:692 / bg_hadapu:762 / bg_snow_mountain:624）、`art/scenes_river.js`（bg_yihai:158 / bg_loushanguan:95）、`art/scenes_jiang.js`（bg_stretcher:380） |

### 证据

**1）组长复核：读代码即可确认"地形没有覆盖到那里"**（`art/scenes.js:728-758`，原文节选）

```js
728:   ART.scenes['bg_lazikou'] = function () {
730:     b += GEO.sky(W, H, [...], { horizon: H * 0.30 });          // 天空只铺到 y = 324
732:     b += GEO.cliffWall(-40, 660, H * 0.02, H + 40, ...);        // 左绝壁：x ∈ [-40, 660]
733:     b += GEO.cliffWall(1260, 1960, H * 0.02, H + 40, ...);      // 右绝壁：x ∈ [1260, 1960]
747:     b += GEO.facet([[520, H*0.66], [1260, H*0.645], [1300, H*0.70], [500, H*0.72]], ...);  // 木桥
751:     b += GEO.bunker(860, H * 0.44, 220, 150, ...);              // 碉堡：y ∈ [475, 625]
752-754: 26 个弹痕椭圆（x∈[700,1240], y∈[0.12H,0.58H]）
755:     b += GEO.smokePlume(980, H * 0.40, 420, ...);               // 硝烟
756:     b += GEO.groundBand(W, H * 0.74, H * 0.82, ...);            // 地面带：y ∈ [799, 886]
```

**结论**：在 `x ∈ (660, 1260)`、`y ∈ (324, ~697)` 这片区域里，除了碉堡、硝烟与弹痕，
**没有任何山体 / 岩壁 / 谷底地形图元**。天空止于 y=324，绝壁止于 x=660/x=1260，
谷底激流从 y=864 才开始，地面带从 y=799 才开始 —— 中间这一片在游戏里就是舞台底色。

**2）洋红底渲染计数**（把背景铺在 `#ff00ff` 页面上截图，未被任何图元覆盖处保持洋红）

| 背景 | 原稿 | 独立复算 | | 背景 | 原稿 | 独立复算 |
|---|---|---|---|---|---|---|
| bg_lazikou | 9.52% | **9.61%** | | bg_hadapu | 1.06% | **1.16%** |
| bg_maogong | 8.27% | **8.32%** | | bg_grassland | 1.11% | **1.46%** |
| bg_tucheng | 7.43% | **7.73%** | | bg_snow_mountain | 0.45% | **0.47%** |
| bg_yihai | 4.03% | **4.13%** | | bg_loushanguan | 0.10% | **0.13%** |
| bg_stretcher | 2.99% | **3.12%** | | bg_luding（对照） | 0.00% | **0.00%** |

两次独立测量的数值一致性、以及对照项 bg_luding 为 0.00%，说明这个方法本身不产生假阳性。

**3）玩家可见（真浏览器，不是探针伪影）**：`node tools/e2e-shot.js ch18` 的首帧
（横幅 `JS 错误 0 条 | ch18 / frame 1`）中央就是这一整块同色区域，碉堡悬在中间、
下方没有任何支撑物。ch18 的 `bg_lazikou` 是首个 `bg` 步，淡入结束后空洞依然存在。

### 为什么是问题

* 玩家在第十八章**第一帧**看到"画面正中一块没有任何地形内容的色块 + 一座悬空的碉堡"。
  腊子口的三要素（一线天 / 绝壁 / 木桥）里，"谷底"这一层是缺失的。
* 背景切换（`fade` / `dissolve`）时这块区域会**透出上一张背景**，出现明显穿帮。
* 同类问题在 9 张背景上成立，属系统性漏画，不是单张笔误。

### 验收标准

1. 洋红底重渲染后，上表 9 张的洋红像素占比全部 **< 0.05%**（对照项 bg_luding 已为 0.00%）。
2. `node tools/e2e-shot.js ch18` 首帧中央不再出现整块同色区域，碉堡落在岩体 / 栈道上。
3. 回归：`node tools/check.js` 通过；`node tools/e2e-run.js` 0 报错。

### 不可行就说明（取舍）

推荐**逐张补地形**（在缺口处加谷底岩体 / 暗部面块），`sky()` 保持冻结不动。
另一条路是让冻结文件 `art/geosvg.js:248` 的 `sky()` 铺满整块画布 —— 那会同时改变
**所有**使用 `horizon` 的场景，必须逐张重跑比对，风险更大，不建议。

---

## R1-Q14　17 个背景 id 有两份实现，`art/scenes.js` 静默覆盖地区分册（约 1.9 MB 永不生效的美术代码）

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q14 |
| **标题** | `art/scenes.js` 与 `art/scenes_{meeting,river,north}.js` 对 17 个同一 id 各写一份实现，构建时后者被静默丢弃，`check.js` / `validate-svg.js` 都不报 |
| **严重度** | **P1**（改动静默失效 + 两个"真相"并存，两份已严重发散） |
| **性质** | 缺陷为主，含一个需要美术裁决的取舍点 |
| **影响文件** | `art/scenes.js`、`art/scenes_meeting.js`、`art/scenes_river.js`、`art/scenes_north.js`（可选：`tools/build-art.js`） |

### 证据

**1）组长复核：重复 key 扫描（第一手输出，可原样复跑）**

```powershell
$h=@{}
Get-ChildItem art/*.js | ForEach-Object {
  $f=$_.Name; $n=0
  foreach($l in Get-Content $_.FullName){
    $n++
    if($l -match "ART\.(scenes|portraits|cg|ui)\s*\[\s*'([^']+)'\s*\]\s*=\s*function"){
      $k=$Matches[1]+'::'+$Matches[2]
      if($h.ContainsKey($k)){ "$k   $($h[$k])   |   $f`:$n" } else { $h[$k]="$f`:$n" }
    }
  }
}
```

输出（17 行，左边是被覆盖的那份）：

```
scenes::bg_council_hall   scenes_meeting.js:56   |   scenes.js:123
scenes::bg_tongdao        scenes_meeting.js:94   |   scenes.js:159
scenes::bg_liping         scenes_meeting.js:125  |   scenes.js:209
scenes::bg_houchang       scenes_meeting.js:159  |   scenes.js:278
scenes::bg_zunyi          scenes_meeting.js:201  |   scenes.js:327
scenes::bg_tucheng        scenes_river.js:62     |   scenes.js:403
scenes::bg_map_table      scenes_meeting.js:241  |   scenes.js:447
scenes::bg_luding         scenes_river.js:225    |   scenes.js:500
scenes::bg_chishui        scenes_river.js:30     |   scenes.js:573
scenes::bg_snow_mountain  scenes_north.js:14     |   scenes.js:624
scenes::bg_maogong        scenes_north.js:45     |   scenes.js:659
scenes::bg_grassland      scenes_north.js:76     |   scenes.js:692
scenes::bg_lazikou        scenes_north.js:113    |   scenes.js:728
scenes::bg_hadapu         scenes_north.js:146    |   scenes.js:762
scenes::bg_wuqi           scenes_north.js:180    |   scenes.js:799
scenes::bg_huining        scenes_north.js:210    |   scenes.js:837
scenes::bg_yanan_cave     scenes_north.js:238    |   scenes.js:869
```

**2）为什么"右边赢"**：`tools/build-art.js:36,39-40`

```js
const isRootArt = (f) => f === 'scenes.js' || f === 'portraits_root.js';
/* root 的文件最后加载：同名 id 以 root 的注册为准（避免并发写入互相覆盖） */
.sort((a, b) => (isRootArt(a) ? 1 : 0) - (isRootArt(b) ? 1 : 0) || a.localeCompare(b))
```

→ 地区分册里那 17 份实现**永远不会被烘焙**，是死代码。

**3）两份已经严重发散**（原稿用"只加载地区分册 / 只加载 scenes.js 各烘一遍"的方式测得，
产物一律等于 `scenes.js` 那份）：

```
bg_chishui    regional=360525  scenes.js=32347
bg_tucheng    regional=250346  scenes.js=46936
bg_houchang   regional=307153  scenes.js=90889
bg_lazikou    regional=254470  scenes.js=67236
```

肉眼对照：`bg_houchang` 地区版画面里有**一整排挑担的队伍**，实际烘焙版**一个人都没有**。
也就是说"被丢掉的那份"并非冗余副本。

### 为什么是问题

* **改动静默失效**：`art/scenes_*.js` 属于美术 agent 的文件。谁去改 `scenes_north.js:113` 的腊子口，
  `node tools/build-art.js` 会成功、`check.js` 会通过、**画面一点变化都没有**。
  这正是作业书 §1.6「每个改动都要能被一条命令验证」要避免的情况，而现有工具链没有任何一条命令能发现它。
* **两个"真相"**：同一 id 两份实现，约 1.9 MB 永不生效的美术代码散布在 4 个文件里，
  后来者无法只从仓库判断哪份是现行版本。
* 本仓库是多 agent 并行改美术的流水线，这个坑下一轮必然再踩。

### 验收标准

1. 上面那段扫描脚本输出**为空**（无重复 key）。
2. 删除被覆盖的那一份之后：`node tools/build-art.js` 成功，且
   `git status --short assets/generated` **没有任何变化**（证明删的确实是死代码，画面零回归）。
3. `node tools/check.js` 通过、`node tools/e2e-run.js` 0 报错。

### 不可行就说明（取舍）

`build-art.js` 的注释表明"root 后加载"是**刻意的并发保护**，所以本条不以"取消覆盖机制"为解。
两种可接受的收法：

* **(a) 以 `scenes.js` 为唯一真相**：删掉地区分册里那 17 份死代码；并在 `build-art.js` 里加
  "同名 key → 打印警告"（不阻断构建），让下次踩坑立刻可见。
* **(b) 以地区分册为真相**（内容更丰富的那份）：把那 17 个 id 的 `scenes.js` 版本删掉或改为转发，
  重新烘焙后按 R1-Q13 的方式逐张截图复核。

**取舍点**：`docs/ART_DIRECTION.md` 对 `bg_houchang` 的要求是"庭院、爆竹红屑、雪、门神红纸、灯笼"，
并没有要求"有人"；实际烘焙版的红屑 + 空场并不违反该条目，所以"哪一份画面对"需要美术裁决。
本条硬性要求只有一条：**不能同时留两份，且必须留痕。**
