# R2 提问组 · engine 分区（号段 R2-E01…R2-E06）

> 提出人：`/root/c1_engine_code/g1_round2_engine`（第一组 · engine 分区 finder）
> 时间：2026-10-15 19:00–19:10
> 分区边界：本稿只写问题，**没有改动任何源码**。可动文件（第二组用）：
> `index.html`、`css/style.css`、`src/engine/*.js`、`src/data/*.js`（只读）、`tools/`。
>
> 方法说明：所有浏览器侧证据都用仓库自带的真浏览器探针 `tools/e2e-steps.js` 采集
> （无头 Edge + 截图 + `--dump-dom` 诊断），命令与输出**原样粘贴**，可逐条复跑。
> 探针脚本里的 `|` 是操作分隔符，所以下面的 JS 片段一律不用 `||`。
>
> 这一分区是上一轮（R1）完全空缺的面（`R1-INDEX.md` §6 明确记为"下一轮第一组要补
> 代码实现、性能、存档、音频、可维护性"）。下面六条覆盖：存档健壮性、启动性能、
> 契约与实现不一致（两处）、工具链可维护性（两处）。

## 总表

| ID | 严重度 | 标题 | 影响文件 |
|---|---|---|---|
| **R2-E01** | **P1** | 读档时步号不夹取：越界存档**静默**把游戏打断（`running=false`、帧表清空、弹覆盖层，0 报错） | `src/engine/engine.js` |
| **R2-E02** | P1 | 20 章剧本被**加载并执行两遍**（`index.html` 静态标签 20 个 + `boot()` 动态注入 20 个 = 40 个 script 标签，约 633 KB 解析两遍） | `index.html` 或 `src/engine/engine.js` |
| **R2-E03** | P2 | `Tab` 键与 `docs/SPEC.md` §6.2 不符：文档写「Tab 状态」，实现是打开「设置」，且全局没有「状态」入口 | `src/engine/engine.js`（或申请改 SPEC） |
| **R2-E04** | P2 | `docs/SPEC.md` §6 承诺的存档 API `VN.save(slot)` / `VN.load(slot)` / `VN.slots()` **不存在**（`VN.save` 是对象，另两个是 `undefined`） | `src/engine/*.js`（或申请改 SPEC） |
| **R2-E05** | P2 | `tools/e2e-run.js` 非法参数不校验：`pickIndex` 变 `NaN`，把**章节**误判成「不合格」，误导维护者 | `tools/e2e-run.js` |
| **R2-E06** | P2 | 探针在仓库根目录写 `_e2e_*.html`，只在正常退出路径清理：被中断/挂起时**残留**（实测此刻就有 1 个） | `tools/e2e-steps.js`、`tools/e2e-run.js` |

---

## R2-E01　读档步号不夹取，越界存档静默打断游戏

| 字段 | 内容 |
|---|---|
| **严重度** | **P1**（玩家可见：读档后不是回到进度，而是被弹到覆盖层、进度被清空，且没有任何提示） |
| **性质** | 缺陷（健壮性 / 数据兼容） |
| **影响文件** | `src/engine/engine.js` |

### 证据

**1）代码：存档记的是"绝对步号"，读档时原样使用，不夹取**（`src/engine/engine.js`）

```
1079:      path: VN.state.frames.map(function (f) { return { i: f.i }; }),   // 存档：绝对步号
1127:    var path = obj.path || [{ i: 0 }];                                    // 读档：直接用
1132:    var frames = [{ steps: baseSteps, i: path[0] ? path[0].i : 0 }];
1135:      frames.push({ steps: arr, i: path[d].i || 0 });                    // 嵌套 if 分支同样不夹取
```

读档路径上**没有任何**把 `path[*].i` 与该帧 `steps.length` 比较的分支；引擎唯一那处边界判断在
**执行循环**里，而它的语义恰好是"越界 = 本章结束"：

```
 821:  function run() {
 826:      if (f.i >= f.steps.length) {
 827:        VN.state.frames.pop();
 828:        if (!VN.state.frames.length) { endChapter(null); return; }   // 帧表空 → 立即结算本章
 829:        continue;
 830:      }
```

所以"载入一个越界存档"的实际后果是：`run()` 第一次调用就把唯一的帧弹掉 →
`endChapter(null)` → 状态被清空（`frames=[]`、`running=false`）并弹出章节结算覆盖层。

**2）真浏览器复现（本次实测原文）**

```powershell
node tools/e2e-steps.js root-e1-boundary "ch05|n10|note:'len='+VN.state.frames[0].steps.length|js:window.__n=VN.state.frames[0].steps.length|js:try{VN.doLoad({v:1,chapter:'ch05',path:[{i:window.__n}],morale:60,trust:50,hope:55,flags:{},records:{},history:[]})}catch(e){window.__r='throw'}|wait:300|note:'afterIdxEqLen run='+VN.state.running+' framesLen='+VN.state.frames.length+' overlayOpen='+!document.getElementById('overlay').classList.contains('hidden')+' toast='+document.getElementById('toast-layer').textContent.trim().slice(0,30)"
```

```
错误: 0 条
过程: n10@14ms | 'len='+… = "len=312" | 'afterIdxEqLen …' = "afterIdxEqLen run=false framesLen=0 overlayOpen=true toast=史料档案 · 黎平会议史料档案 · 拍桌子的那一夜史料档案 "
```

对照组（同样的调用，只把 `i` 换成 0）：

```
过程: 'pre_ch='+… = "pre_ch=ch05 run=true frames=1" | 'ctrl_r='+… = "ctrl_r=ok ch=ch05 run=true frames=1 morale=61"
```

即：**`i = 步数`（刚好越界一格）→ `running=false`、帧表长度 0、覆盖层被打开、错误 0 条；
`i = 0` → 一切正常**。`i = 9999` 的结果与越界一格完全相同
（`"r=ok framesIsUndef=false framesLen=0 ch=ch05 running=false"`）。

**3）为什么会越界（不是只有手改存档才会遇到）**

`snapshot()` 记录的是**绝对步号**，而剧本步数会因为剧情编辑而变少 —— 本仓库真实发生过：
`docs/fixes/R1-Q05.md` 记录 R1 从 8 章里**删掉了 27 个 `note` 步**；任何在那之前存的档，
步号都可能 ≥ 该章现在的步数。同样的越界也会出现在"上一版游戏留在同一 origin 的
`localStorage` 存档"这一路径上。

### 为什么是问题

* 玩家侧：读档不是"回到进度"，而是被弹到覆盖层（实测同时触发了档案解锁过场），
  引擎状态被清空（`frames=[]`、`running=false`），**没有任何错误提示或兜底**，玩家只能重开。
* 维护侧：这是"以后每次改剧本都可能悄悄弄坏存档"的地雷，而且 `check.js` / `e2e-run.js`
  都测不到（它们不会构造越界存档）。

### 验收标准

1. 上面的复现命令跑完，`afterIdxEqLen run=true framesLen=1`（越界被夹到最后一帧的最后一格），
   并且**不**打开覆盖层（`overlayOpen=false`）；`错误 0 条`。
2. `node tools/check.js` 通过；`node tools/e2e-run.js` 20 章 `走完 ✔`、0 报错。
3. 夹取逻辑要覆盖嵌套 `if` 帧（`engine.js:1135`）。

### 不可行就说明（取舍）

两条都可行，第二组任选其一并在修复记录里写明理由：

* **(a) 夹取降级**（最小改动）：`i = Math.min(Math.max(0, i | 0), Math.max(0, steps.length - 1))`，
  并把 `frames` 里越界的后续帧丢弃。玩家会读到"该章最后一格"，进度不精确但游戏不坏。
* **(b) 明确拒绝**：帧表为空或步号越界时 `toast('这份存档的进度已经失效，已为你跳到该章开头')`
  并从该章开头开始。语义更干净，但要动 UI 文案。

---

## R2-E02　20 章剧本被加载并执行两遍

| 字段 | 内容 |
|---|---|
| **严重度** | P1（启动性能 + 无谓重复执行；每次冷启动都多解析约 633 KB） |
| **性质** | 缺陷（重复加载） |
| **影响文件** | `index.html` 或 `src/engine/engine.js`（二者去其一即可） |

### 证据

**1）`index.html` 静态标签**（`index.html:103`–`122`）已经包含全部 20 章：

```
103:<script src="src/story/ch01.js"></script>
…
122:<script src="src/story/ch20.js"></script>
```

**2）`boot()` 又按 manifest 动态注入一遍**（`src/engine/engine.js:1287`–`1300`）：

```js
async function boot() {
  …
  for (var i = 0; i < m.length; i++) {
    var ok = await loadScript(m[i].file);      // 1297：再插一次 <script>
    if (!ok && !window.STORY[m[i].id]) missing.push(m[i].id);
  }
```

**3）真浏览器计数（原文）**

```powershell
node tools/e2e-steps.js root-e1-dupscripts "title|note:'totalScripts='+document.scripts.length+' chapterScriptTags='+[].filter.call(document.scripts,function(s){return /src\/story\/ch/.test(s.src)}).length+' distinctChapters='+Object.keys(window.STORY).length"
```

```
错误: 0 条
过程: … = "totalScripts=49 chapterScriptTags=40 distinctChapters=22"
```

`chapterScriptTags=40` = 20（静态）+ 20（动态）→ 每个章节 IIFE 被**执行两遍**（重复注册
`window.STORY.chNN`，第二次覆盖第一次，幂等但白做功）。

**4）规模**：`src/story/ch01..ch20.js` 合计 **633 629 字节**（实测 `fs.statSync` 累加）。

### 为什么是问题

* 冷启动（`file://` 双击打开）要多解析一遍 633 KB 的剧本 JS，白花的 CPU/内存；
  `boot()` 还是**顺序 await**，20 次注入串在标题画面出现之前。
* 两个入口同时存在会给后续维护者"到底哪边是真来源"的疑问（本仓库已经因为"两份真相"
  付过一次代价，见 `docs/issues/R1-visual-b.md` R1-Q14）。

### 验收标准

1. 上面的计数命令，`chapterScriptTags=20`（不再是 40），`distinctChapters` 不变（仍是全部章节），
   且 `node tools/e2e-run.js` 20 章 `走完 ✔`、0 报错。
2. 缺章降级仍然成立：临时把 `src/story/ch07.js` 改名后打开 `index.html`，`VN.missingChapters`
   里应出现 `ch07`（可读 `note:JSON.stringify(VN.missingChapters)` 验证），页面不报错。

### 不可行就说明（取舍）

推荐 **`boot()` 里加一行短路**（`if (window.STORY[m[i].id]) continue;`）—— 保留
`index.html` 的静态标签（双击即用、不依赖动态注入），同时让缺章检测仍然有效。
另一条路是删掉 `index.html` 的 20 个静态标签、信任动态注入，但那会让"file:// 下
某章加载失败时整章缺失"的风险更大，不推荐。

---

## R2-E03　`Tab` 键与契约不符（文档写「状态」，实现打开「设置」）

| 字段 | 内容 |
|---|---|
| **严重度** | P2（玩家可见的按键行为与文档不一致） |
| **性质** | 契约冲突（SPEC 冻结，需要组长裁决走哪条路） |
| **影响文件** | `src/engine/engine.js`（或申请修改 `docs/SPEC.md` §6.2） |

### 证据

**1）契约**：`docs/SPEC.md:297`

```
`Space`/`Enter`/`左键` 推进对话；`Ctrl` 按住快进；`Esc` 菜单；`H` 隐藏 UI；`A` 自动；`S` 跳过；`Tab` 状态。
```

**2）实现**：`src/engine/engine.js:1259`

```js
case 'Tab': VN.ui.showSettings(); e.preventDefault(); break;
```

**3）真浏览器实测（原文）**：进入剧情后按 `Tab`

```powershell
node tools/e2e-steps.js root-e1-tab3 "ch05|n20|note:'beforeHidden='+document.getElementById('overlay').classList.contains('hidden')|js:document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true}))|wait:350|note:'afterHidden='+document.getElementById('overlay').classList.contains('hidden')+' head='+document.querySelector('#overlay .ov-head').textContent.trim().slice(0,8)"
```

```
错误: 0 条
过程: n20@14ms | 'beforeHidden='… = "beforeHidden=true" | 'afterHidden='… = "afterHidden=false head=设置返回  ES"
```

**4）全局没有「状态」入口**：`index.html:78`–`85` 的快捷条只有
`data-act` ∈ `auto / skip / history / save / settings / hide`（`engine.js:1220`–`1231` 是它们的处理分支），
没有 `status`。三个数值只存在于常驻 HUD（`#hud .meter`）。

### 为什么是问题

* 玩家按文档里的「Tab 状态」得到的是设置面板 —— 想知道"士气/信任/信念到多少了"的玩家
  要么看不到专门的状态页，要么被误导以为 Tab 就是设置。
* 这是"文档承诺了一个不存在的功能"的典型：维护者按 SPEC 写测试会直接失败。

### 验收标准（任一条达成即可，需在修复记录里写明选了哪条）

1. **实现对齐文档**：按 `Tab` 打开一个「状态」面板（至少包含三项数值 + 已解锁档案/插画计数），
   上面的探针里 `head` 应含「状态」（而不是「设置」）；`Esc` 能关掉；`node tools/check.js` 通过。
2. **文档对齐实现**（需先向组长申请，`docs/SPEC.md` 是冻结文件）：把 §6.2 的 `Tab` 改成
   「设置」，并在同一行补上真实的状态入口（若同时新增则回到第 1 条）。

### 不可行就说明（取舍）

「状态」到底指什么，文档没写死：可能指"三项数值面板"，也可能指"当前进度/存档摘要"。
实现方按最小解释（三项数值 + 章节名）做即可；若组长认为应改文档而不是加面板，
那就必须走冻结文件申请流程，不要在第二组里私自改 SPEC。

---

## R2-E04　SPEC §6 承诺的存档 API 不存在

| 字段 | 内容 |
|---|---|
| **严重度** | P2（契约/文档与实现不一致；玩家不可见，但会误导维护者与自动化） |
| **性质** | 契约冲突（SPEC 冻结） |
| **影响文件** | `src/engine/save.js` / `src/engine/engine.js`（或申请修改 `docs/SPEC.md` §6） |

### 证据

**1）契约**：`docs/SPEC.md:280`

```
VN.save(slot) / VN.load(slot) / VN.slots()
```

**2）实现**：`src/engine/save.js:45` 把 `VN.save` 定义成**对象**（`writeSlot`/`readSlot`/`listSlots`…），
而 `VN.load` / `VN.slots` 在 `src/engine/*.js` 里**没有任何定义**
（`rg -n "VN\.load\b|VN\.slots\b" src` 无命中；引擎内部用的是 `VN.doLoad(obj)` 与 `VN.save.readSlot`）。

**3）真浏览器实测（原文）**

```powershell
node tools/e2e-steps.js root-e1-keys2 "ch05|untilChoice|note:'saveType='+typeof VN.save+' loadType='+typeof VN.load+' slotsType='+typeof VN.slots|js:document.dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true}))|wait:400|note:'choiceLayerHiddenAfterDigit1='+document.getElementById('choice-layer').classList.contains('hidden')"
```

```
错误: 0 条
过程: … | 'saveType='… = "saveType=object loadType=undefined slotsType=undefined" | 'choiceLayerHiddenAfterDigit1='… = "choiceLayerHiddenAfterDigit1=true"
```

（同一次探针顺带确认：`docs/SPEC.md:288` 的「选项 键盘 1-4 可选」**是真的能用**的 ——
按 `1` 后选项面板关闭。全剧选项数分布 `{2:16, 3:44}`，最多 3 个，所以 1-4 覆盖得住。此条**不是**问题。）

### 为什么是问题

* 按 SPEC §6 写的任何调用（自动化脚本、未来的重构、验收命令）都会拿到
  `TypeError: VN.save is not a function` —— 契约在说谎，而 `docs/ENGINE_CONTRACT.md` §3
  写的是对象形式，两份文档互相矛盾。

### 验收标准

任一条达成即可（写明选了哪条）：

1. **实现补齐薄封装**（3 行，推荐）：`VN.slots = function(){return VN.save.listSlots();}`、
   `VN.load = function(n){var d=VN.save.readSlot(n); return d?VN.doLoad(d):false;}`、
   `VN.saveTo = function(n){return VN.doSave(n);}` —— 然后上面的探针输出
   `saveType=object loadType=function slotsType=function`（**注意**：`VN.save` 本身是对象，
   `VN.save(slot)` 这条永远不可能成立，所以这条只能做到"补 `load`/`slots` 并把 `save` 记为已知偏差"）。
2. 或走冻结文件申请：把 SPEC §6 那一行改成实际 API（`VN.save.writeSlot/readSlot/listSlots`、
   `VN.doSave/VN.doLoad`），并在 `docs/ENGINE_CONTRACT.md` §3 里保留现状说明。

### 不可行就说明（取舍）

`VN.save(slot)` 与 `VN.save` 作为对象的现状**在 JS 里无法同时成立**（同一个名字）——
所以本条的真实结论是"SPEC §6 的那一行写错了"，最终大概率要走第 2 条（申请改 SPEC），
第 1 条只能补齐 `load`/`slots` 两个名字。请组长裁决。

---

## R2-E05　`tools/e2e-run.js` 非法参数不校验，把章节误判成「不合格」

| 字段 | 内容 |
|---|---|
| **严重度** | P2（工具链：给出误导性结论 + 通过退出码 2 冒充"内容不合格"） |
| **性质** | 缺陷（参数校验） |
| **影响文件** | `tools/e2e-run.js` |

### 证据

**1）代码**（`tools/e2e-run.js:25`–`27`）：三个位置参数直接 `parseInt`，没有校验。

**2）复现（原文）**

```powershell
node tools/e2e-run.js abc 8 600000 ch01
```

```
通关验证：每章自动点第 NaN 个选项，步间隔 8ms，虚拟时间上限 600000ms

章   标题                步数  走完  选项  背景  CG   报错
ch01  于都河畔                4000   ✘     0     2    0  0

合计：1 章 / 4000 步 / 实际渲染的 CG 0 张次
全程没用 CG 的章节：ch01

不合格章节：
  · ch01：走完=false，步数=4000
exit=2
```

**3）根因**：`pickIndex` = `NaN` → `VN.advance()` 在选项面板打开时永远推进不了 → 每章跑满
4000 步上限 → 章节被判「不合格」。玩家可见面**没有坏**，坏的是维护者读到的那句结论。

### 为什么是问题

* 一次误敲参数就会得到"ch01 不合格"这种看起来像**内容缺陷**的结论，而真正的信息是
  "参数错了"；退出码 2 又与"内容不合格"共用，脚本里无法区分。
* `R1-BACKLOG.md` §4 已经登记过同一条，本轮仍未修（属"下一轮候选"清单上的欠账）。

### 验收标准

1. `node tools/e2e-run.js abc 8 600000 ch01` 应打印用法（含三个位置参数的含义）并**直接退出**，
   不再跑任何章节、不再出现"不合格章节"字样；退出码为非 0（建议 1，与"内容不合格"的 2 区分）。
2. `node tools/e2e-run.js 1 8 600000 ch01` 仍然正常工作（`走完 ✔`，退出码行为不变）。

### 不可行就说明（取舍）

没有取舍难点：校验 `pickIndex` 为 1–9 的正整数、`stepMs`/`budget` 为正整数即可。
唯一要注意的是别把"章节真的不合格"这条路径的退出码改掉（`R1-BACKLOG.md` 里明确说不许吞掉）。

---

## R2-E06　探针在仓库根目录写临时页，被中断时残留

| 字段 | 内容 |
|---|---|
| **严重度** | P2（工具链卫生：根目录会被残留页面污染，且残留页仍可当入口打开） |
| **性质** | 缺陷（异常路径不清理） |
| **影响文件** | `tools/e2e-steps.js`、`tools/e2e-run.js`（`tools/e2e-shot.js` 用的是固定名 `_e2e.html`，同类） |

### 证据

**1）代码**：三个工具都在仓库根目录建页（相对路径才能找到 `css/`、`src/`），清理只在正常路径上：

```
tools/e2e-steps.js:271  const pagePath = path.join(ROOT, `_e2e_${process.pid}_${Date.now().toString(36)}.html`);
tools/e2e-steps.js:315  try { fs.unlinkSync(pagePath); } catch (e) { /* 忽略 */ }
tools/e2e-run.js:181    const pagePath = path.join(ROOT, `_e2erun_${process.pid}_${Date.now().toString(36)}.html`);
tools/e2e-run.js:195    try { fs.unlinkSync(pagePath); } catch (e) { /* 忽略 */ }
tools/e2e-shot.js:56    const pagePath = path.join(ROOT, '_e2e.html');
```

**2）实测残留（原文）**：本轮我用探针做验收时，有一次 `e2e-steps.js` 跑挂（无头 Edge 停在
`--dump-dom` 阶段，进程低 CPU 挂住 30 s 以上），被我手动杀掉后：

```powershell
Get-ChildItem _e2e*.html | Select-Object Name,Length,LastWriteTime
```

```
Name                     Length LastWriteTime
_e2e_17696_mv9fnoc5.html  15274 2026/10/15 19:05:56
_e2e-probe-ch01.html      10341 2026/10/15 17:07:38
```

两个都不是本轮正常收尾留下的：`_e2e-probe-ch01.html` 是更早一次探针的残留（`R1-BACKLOG.md` §3 记过），
`_e2e_17696_*.html` 是这次被杀掉的进程留下的。

**3）影响范围有限但不为零**：`.gitignore:7` 的 `_e2e*.html` 已经把这类文件挡在版本库外
（`R1-INDEX.md` §2.4 接受过这条改动），所以不会污染提交；但它们是**可加载的入口页副本**，
留在根目录会让人误以为有第二个 `index.html`，而且会一直堆积。

### 为什么是问题

* 探针是本仓库验收流程的主力工具（`docs/AGENT_WORKFLOW.md` §5 列的六条命令里三条是它），
  崩一次就在根目录盖一个章；多 agent 并发跑探针时残留会互相混淆（谁的、哪一版、还准不准）。
* 玩家不可见，但维护者每次都要手工判断"这个页面能不能删"。

### 验收标准

1. 制造一次异常退出（例如 `node tools/e2e-steps.js x "ch01|n1"` 跑到一半 Ctrl+C，或直接
   `Stop-Process` 掉探针进程），仓库根目录**不应**留下 `_e2e*.html`
   （可复跑 `Get-ChildItem _e2e*.html` 验证；正常路径本来就干净）。
2. `node tools/e2e-steps.js ch05 "ch05|n20"`、`node tools/e2e-run.js 1 8 600000 ch01`
   正常路径行为不变（截图与诊断输出仍可用）。

### 不可行就说明（取舍）

页面**必须**留在根目录才能用相对路径加载 `css/`、`src/`（复制到 `tmp/` 会 404），
所以不要走"换目录"这条路。可行做法：在脚本开头注册
`process.on('exit' | 'SIGINT' | 'SIGTERM', cleanup)`，并在 Windows 的
`process.on('SIGHUP')` 上兜一层（另可用 `try/finally` 包住 `runEdge` 调用）。
