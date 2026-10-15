# R1 提问组 · visual 分区

> 负责人：组长（本轮 4 个并发槽被 /root、/root/r1_ask、g1_engine、g1_content 占满，visual 分区由组长顶）。
> 号段：`R1-Q09` … `R1-Q12`（由组长统一分配）。
> 每条都**先自己验证过**，命令与真实输出原文照贴。未验证的猜测一律不写在这里（见文末「已排除的候选」）。

---

## R1-Q09　插画画廊里有一格「湘江·白昼」永远解锁不了

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q09 |
| **严重度** | P1 |

**现象**

「插画画廊」的"全屏插画"一栏列了 20 项，其中 `bg_xiangjiang_day`（湘江·白昼）在全部 20 章剧本里**没有任何一个 `cg` 步骤**引用它。玩家把二十章全部走完，这一格也永远是「未解锁 · 湘江·白昼」，点它只会弹提示「走到这一段时自动解锁」。

**证据**

1. 画廊列了 20 项，剧本只能产出 19 项：

```powershell
node -e "const fs=require('fs'),vm=require('vm');const used=new Set();for(const f of fs.readdirSync('src/story').filter(x=>/^ch\d+\.js$/.test(x))){const sb={window:{}};vm.runInNewContext(fs.readFileSync('src/story/'+f,'utf8'),sb);const ch=sb.window.STORY[f.slice(0,-3)];const w=s=>{for(const x of s||[]){if(!x)continue;if(x.t==='cg')used.add(x.id);if(x.t==='unlock'&&x.kind==='cg')used.add(x.id);if(x.t==='if'){w(x.then);w(x.else);}}};w(ch.steps);}const sb2={window:{}};vm.runInNewContext(fs.readFileSync('src/engine/gallery.js','utf8'),sb2);const label=Object.keys(sb2.window.VN.gallery.CG_LABEL);const bad=label.filter(i=>!used.has(i));console.log('画廊列出的插画 = '+label.length);console.log('剧本能产出的   = '+used.size);console.log('永远解锁不了   = ['+bad.join(', ')+']');process.exit(bad.length?1:0);"
```

输出（退出码 **1**）：

```
画廊列出的插画 = 20
剧本能产出的   = 19
永远解锁不了   = [bg_xiangjiang_day]
```

2. 解锁路径唯一。`src/engine/engine.js:598` 只有在 `showCg()` 里才 `unlock('cgs', id)`；`src/engine/engine.js:301` 的 `bg` 步骤只解锁 `bgs`；`src/engine/engine.js:767-768` 的显式 `unlock` 步骤全剧只被 `archive` 用过（`rg -n "kind: 'cg'" src/story` 只有一处：`ch14.js:298`，且是 `bg_dadu`，本来就有 cg 步骤）。

3. `bg_xiangjiang_day` 在剧本里只以**背景**出现，从来没有 `cg` 步骤：

```powershell
rg -n bg_xiangjiang_day src/story
```

```
src\story\ch02.js:207:      { t: 'bg', id: 'bg_xiangjiang_day', fx: 'dissolve' },
src\story\ch02.js:292:      { t: 'bg', id: 'bg_xiangjiang_day', fx: 'fade' },
src\story\ch02.js:328:      { t: 'bg', id: 'bg_xiangjiang_day', fx: 'fade' },
src\story\ch03.js:14:      { t: 'bg', id: 'bg_xiangjiang_day', fx: 'fade' },
src\story\ch03.js:67:      { t: 'bg', id: 'bg_xiangjiang_day', fx: 'fade' },
```

4. UI 自己也在宣称 20 项可解锁：`node tools/e2e-steps.js x "title|gallery:showArt|wait:600"` 的「遮罩文本」行末尾打印 `插画画廊 背景 30 · 插画 20`。

**为什么是问题**

玩家把 20 章走完，画廊仍然留一格永远打不开的锁：一个界面明确宣称可解锁、实际不可能达成的条目。README §4 也写着「『插画画廊』里列了 20 张可解锁的」。这不是"少一张图"，是**给玩家的完成度承诺兑现不了**。

**验收标准**

上面第 1 条命令退出码为 0，输出 `永远解锁不了   = []`。

**影响文件**

- `src/engine/gallery.js`（`CG_LABEL` 去掉该项或并入 `bg_xiangjiang_night`），或
- `src/story/ch03.js`（补一个 `{ t: 'cg', id: 'bg_xiangjiang_day' }`），
- `README.md`（若最终画廊变成 19 项，§4 的「20 张可解锁」要同步）。

**不可行就说明（取舍）**

两条路都有代价：删 `CG_LABEL` 一项 = 玩家少一张本该有的插画（`assets/generated/cg/bg_xiangjiang_day.svg` 已经烘焙好了，而且是能"一眼看出是插画"的加强版）；在 ch03 补 `cg` 步骤 = 会往正文里插一个 3200ms 的阻塞步，要挑一处节奏受得住的位置（ch03 是湘江血战，白昼江面本来就是"渡江前"那一拍的画面），并且改完要重跑 `node tools/check.js`。我倾向后者，但这是第二组该拍的板。

---

## R1-Q10　`assets/generated/ui/` 的 16 个 UI 装饰 SVG 从未被任何代码引用

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q10 |
| **严重度** | P2 |

**现象**

`assets/generated/ui/` 下有 16 个烘焙出来的 UI 装饰 SVG（合计 85.5 KB），但整个仓库里**没有一处**真的加载它们。游戏的 HUD / 对话框 / 快捷条 / 图鉴卡片全部由 `css/style.css` 用 `--u` 单位直接画，一个 `url(...)` 都没有。

**证据**

1. 全仓库搜不到引用（只搜到一句注释）：

```powershell
rg -n "generated/ui" index.html css/style.css src
```

```
src\data\backgrounds.js:57:  /* UI 装饰 id 表（build-art 会为每个 key 生成 assets/generated/ui/<key>.svg） */
```

```powershell
rg -n "ui/" index.html css/style.css src
```

```
src\data\backgrounds.js:57:  /* UI 装饰 id 表（build-art 会为每个 key 生成 assets/generated/ui/<key>.svg） */
```

2. 引擎拼资源路径的地方也只认 bg / cg / chars：

```
src\engine\engine.js:24:  function asset(kind, name) { return 'assets/generated/' + (FOLDER[kind] || kind) + '/' + name + '.svg'; }
```

3. 这 16 个文件是：

```powershell
Get-ChildItem assets/generated/ui | Select-Object Name,Length
```

```
arrow_next.svg 274 / bar_hope.svg 696 / bar_morale.svg 696 / bar_trust.svg 696 / btn_plate.svg 305
cloud_motif.svg 425 / divider.svg 525 / lock_icon.svg 584 / mountain_motif.svg 1254 / paper_grain.svg 75564
ribbon_chapter.svg 527 / seal_red.svg 2039 / slot_frame.svg 622 / star_badge.svg 756 / title_frame.svg 2219
vignette_soft.svg 418
```

**为什么是问题**

仓库里长期带着 16 个"看起来是资源、其实是死文件"的产物：维护者（尤其是后续接手的 agent，会照着 `docs/SPEC.md` §4.3 的 `assets/generated/ui/{name}.svg` 去找 UI 素材）会以为界面用的是这些 SVG，照着改却发现毫无效果；`node tools/build-art.js` 每次烘焙都重写它们，等于每次都在 diff 里制造噪音。对玩家没有直接损害，但对"这个仓库怎么维护"是实打实的误导。

**验收标准**

下面两条**至少一条**成立，且可机械复核：

1. 真的用起来：`rg -n "generated/ui" index.html css/style.css src` 至少命中一处**真实引用**（不是注释），并且无头截图里能看到该装饰；或
2. 明确写成"运行时不加载"：`rg -n "generated/ui" README.md` 能读到「构建期产物 / 运行时不加载」的明确结论，读者不会再以为它是线上资源。

**影响文件**

- 选 1 → `index.html`、`css/style.css`（engine 分区）；
- 选 2 → `README.md`（qa）；
- 若要"不再生成"，则要动 `src/data/backgrounds.js` 的 UI id 表（**冻结文件**）与 `tools/build-art.js`（**冻结文件**）——按作业书 §1.4 需要先向 `/root` 申请。

**不可行就说明（取舍）**

"删掉这 16 个文件 + 不再生成"看着最干净，但要同时改两个冻结文件（UI id 表 + 烘焙器），影响面比收益大；而且 `paper_grain.svg`(75 KB) 这类纸纹确实可能是留给下一轮 UI 重做的半成品。所以我建议的**首选**是第 2 条（写清运行时不加载），把"要不要真的用起来"留给后续的 UI 轮次决定。

---

## R1-Q11　`node tools/validate-svg.js` 在干净的仓库上恒失败（base64 载荷被误判成 NaN）

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q11 |
| **严重度** | P1 |

**现象**

`tools/validate-svg.js` 现在**永远**返回退出码 1，报「34 个文件有问题」。而这 34 条全是假警报：它们唯一的罪名是「含 NaN 数值」，可是这些文件里根本没有任何 NaN —— 是内嵌的 base64 群众素材的**随机三个字母**恰好拼出了 `NaN`。

**证据**

1. 守卫恒失败：

```powershell
node tools/validate-svg.js; "exit=$LASTEXITCODE"
```

```
[validate-svg] 检查 356 个文件，合计 17.5 MB
[validate-svg] 34 个文件有问题：
  × assets/generated/bg/bg_camp_fire.svg
      - 含 NaN 数值
  × assets/generated/bg/bg_dadu.svg
      - 含 NaN 数值
  …（共 34 条，全部只报「含 NaN 数值」，全部落在 bg/ 与 cg/）
exit=1
```

2. 命中的是 base64 载荷，不是数值属性（`bg_yudu_night.svg` 第 193496 字节处）：

```
MIbJ6gE9vQSi27firNnejMRKqxZfaJjVOYWD1ppzVeayQUSdZxqHRa0FhnuhjQWQbHfEyxGFE4tgVtDMIwACUU2mgkUQRlUrOsSGQyBqM1GONFFl5pBZIlC/NaNcYodk6BeDUKwH5P/n5RZ/FDAH74wQP7NmZg2BdJeh9k/44LC72dSgYtZECQsYJFe3kLsXKINgwgIC
```

3. 把 data URI 抠掉之后再查，全仓库 356 个 SVG 里 NaN / undefined 各 **0** 处：

```powershell
Get-ChildItem assets/generated -Recurse -Filter *.svg | ForEach-Object { $c=Get-Content $_.FullName -Raw; $s=[regex]::Replace($c,'data:image/[a-z+]+;base64,[A-Za-z0-9+/=]+','«B64»'); $nan=([regex]::Matches($s,'NaN')).Count; $und=([regex]::Matches($s,'undefined')).Count; if($nan -gt 0 -or $und -gt 0){ "{0} NaN={1} und={2}" -f $_.Name,$nan,$und } }
```

输出：（空 —— 一个都没有）

4. 病灶就一行，子串匹配没区分"数值属性里的 NaN"和"base64 里的 NaN 三个字母"：

```
tools/validate-svg.js:38:  if (src.indexOf('NaN') >= 0) problems.push('含 NaN 数值');
```

5. 这批 base64 来自 18 张背景内嵌的群众素材（`bg_xiangjiang_day` 14 段、`bg_yudu_night` 8 段…，cg/ 是 bg/ 的加强版所以同命中）。

**为什么是问题**

`README.md` §3 把 `tools/validate-svg.js` 列为交付前自检工具，它自己的注释写着存在的意义是「防『静默空白图』」。现在它在**完全干净的仓库**上恒返回 1：这个守卫等于作废——真的出现 NaN 时，那一条真警报会淹没在 34 条假警报里；把它当交付闸门的流程（CI、agent 自检）也永远红着，最后所有人都学会忽略它。**一个恒红的守卫比没有守卫更糟。**

**验收标准**

1. `node tools/validate-svg.js; "exit=$LASTEXITCODE"` → 退出码 **0**，且最后一行是 `[validate-svg] 全部通过。`
2. 真故障仍然抓得住（不能靠"干脆不查 NaN"糊过去）：把一份 bg 复制到 `tmp/`，把其中任意一个数值属性改成 `NaN`，`node tools/validate-svg.js tmp/` 必须退出码 1 并指名该文件。

**影响文件**

`tools/validate-svg.js`（作业书 §4 规定 `tools/*.js` 共享，改动前先在 `docs/issues/R1-*.md` 登记、由组长协调；本轮只有这一处要动 tools）。

**不可行就说明**

无取舍。修法就是把检测放到"剔除 data URI 之后"：

```js
const bare = src.replace(/data:[A-Za-z0-9.+-]+\/[A-Za-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/g, '«B64»');
if (bare.indexOf('NaN') >= 0) problems.push('含 NaN 数值');
```

`undefined` 与 `fill=""` 两个检查同理一并挪到剔除之后（现在它们也是子串匹配，只是恰好没被 base64 命中）。

---

## R1-Q12　4 张背景 + 4 张 CG 超过 `docs/ART_DIRECTION.md` §4.4 的 400 KB 上限

| 字段 | 内容 |
|---|---|
| **ID** | R1-Q12 |
| **严重度** | P2 |

**现象**

`docs/ART_DIRECTION.md` §4「验收（美术 agent 自检清单）」第 4 条写着「单文件体积 ≤ 400 KB」。实测有 11 个文件超过（8 个是背景/CG，最大 583 KB，超上限 45%）。

**证据**

```powershell
node -e "const fs=require('fs'),p=require('path');const LIM=400*1024;let n=0;for(const d of ['bg','cg','ui','chars']){for(const f of fs.readdirSync(p.join('assets/generated',d)).sort()){const s=fs.statSync(p.join('assets/generated',d,f)).size;if(s>LIM){n++;console.log((s/1024).toFixed(0).padStart(5)+' KB  assets/generated/'+d+'/'+f);}}}console.log('超过 400KB 的文件数 = '+n);"
```

```
  440 KB  assets/generated/bg/bg_huining.svg
  523 KB  assets/generated/bg/bg_rain_march.svg
  581 KB  assets/generated/bg/bg_xiangjiang_day.svg
  452 KB  assets/generated/bg/bg_yudu_night.svg
  441 KB  assets/generated/cg/bg_huining.svg
  525 KB  assets/generated/cg/bg_rain_march.svg
  583 KB  assets/generated/cg/bg_xiangjiang_day.svg
  453 KB  assets/generated/cg/bg_yudu_night.svg
  405 KB  assets/generated/chars/nie_worry.png
  427 KB  assets/generated/chars/wu_laoliu_fierce.png
  435 KB  assets/generated/chars/wu_laoliu_smile.png
超过 400KB 的文件数 = 11
```

**为什么是问题**

`ART_DIRECTION.md` 是后续美术 agent 的契约，上限被突破 45% 而没人发现，说明这条自检项事实上没有被执行过。同时体积的去向值得注意：超标部分几乎全来自**内嵌的 base64 群众素材**（`bg_yudu_night.svg` 内 102 个 `<use>`、8 个内嵌 `<symbol>`；`bg_xiangjiang_day.svg` 56 个 `<use>`、14 个 `<symbol>`），这些素材在默认视图下大半压在对话框后面，属于"玩家看不到、解析成本照付"的开销。

**验收标准**

下面这条命令的末行必须是 `超过 400KB 的文件数 = 0`：

```powershell
node -e "const fs=require('fs'),p=require('path');const LIM=400*1024;let n=0;for(const d of ['bg','cg']){for(const f of fs.readdirSync(p.join('assets/generated',d)))if(fs.statSync(p.join('assets/generated',d,f)).size>LIM)n++;}console.log('超过 400KB 的文件数 = '+n);"
```

（或者：§4.4 的上限被改成一个有理由支撑的数值，并在该文件里写明理由与新的判据。）

**影响文件**

- `art/scenes_*.js`（群众素材的 `<use>` 数量/尺寸），或
- `docs/ART_DIRECTION.md`（**非冻结**，§4.4 的上限与理由）。

**不可行就说明（取舍）**

**我倾向改契约而不是硬压素材。** §4.4 那句限制的理由写的是「避免上万个碎多边形」，但本仓库超标的原因不是碎多边形，是内嵌位图——理由和现象对不上。硬压的唯一手段是减少群众 `<use>` 数量，那会直接削掉画面里的行军队伍（`bg_yudu_night` 是"火把排成一线"的夜渡，队伍本身就是要拍的景）。所以合理解法是把 §4.4 改成分档：纯矢量场景 ≤ 400 KB，含内嵌位图素材的场景另给上限（并在文件里写清为什么）。

**附带发现（同一处文档失准，未单独立条）**：`README.md` §5 仍然写着「整套美术是**程序化生成**的，**没有一张位图**、没有一个外部素材……仓库里只有 SVG 和 JS」。实测 `assets/generated/chars/` 下有 **174 张 AI 生成的 PNG 立绘**（600×900 RGBA，已核对尺寸与模式全部合规），18 张背景里还内嵌了 base64 位图素材。SPEC §4.2 的 2026-10-15 变更说明承认了 AI 立绘，但 README 的这段宣言没有跟着改。改动落在 `README.md`（qa 分区），建议第二组顺手带上。

---

## 附：本轮**已排除**的候选（写下来免得下一轮重复挖）

这些都是我先怀疑、动手验证后被**证伪**的，不是问题：

1. **「背景缺块/整片空白」** —— `bg_all.png` 缩略图里 `bg_dadu.svg`、`bg_jinsha.svg` 看着像一块平涂。放大到 1920×1080 重渲后是正常的峡谷/激流/崖壁，只是缩略图把细节糊掉了。**缩略图不能当证据。**
2. **立绘尺寸/模式不合规** —— 174 张 PNG 全部 `600×900`、全部 `RGBA`，0 个异常（`python` + PIL 全量核对）。
3. **洋红抠底残留** —— 174 张 PNG 逐一统计"R>150 且 B>150 且 G<0.6·min(R,B)"的像素占比，**全部为 0.000%**；不透明占比也没有异常值。
4. **8 种表情不可区分** —— 抽了 `mao` / `xiaoman` / `guo_daniang` / `he_xiaomei` 四人的 8 表情拼版肉眼核对，眉、眼、嘴三处都有明显变化，符合 SPEC §4.2。唯一瑕疵是 `he_xiaomei_smile.png` 的帽徽画成红十字、其余 7 张是红星（单张 AI 出图的口径不一致），不足以立条。
5. **背景里有文字** —— ART_DIRECTION §3 要求背景「不画任何文字」。剔除 base64 后全仓库 356 个 SVG 搜 `<text|font-family|font-size` → **0 个命中**。
6. **群众素材被对话框完全遮住** —— 一度以为背景里的群众戳全落在对话框后面。实测对话框遮挡区是画布 y≈845…1034（`tmp/e2e/vf-ch01.png` 逐行统计暗行得到），而群众戳的 y 顶分布在 510…860，`bg_snow_mountain` / `bg_yudu_night` / `bg_camp_fire` 等十来张是**露在对话框上方、玩家看得见**的（见 `tmp/e2e/vf-ch16e.png` 对话框上沿那一排行军小人）。所以这条不成立，只剩 R1-Q12 里的体积账。
7. **群众素材是"等距贴图带"很廉价** —— 属于美术口味判断（`docs/ART_DIRECTION.md` 没有禁止），且 AI 素材本身也是刻面风格，**标 `性质: 取舍` 足够，不值得占一条名额**。

## 附：本轮用到的一次性脚本（都在 `tmp/` 下，已被 `.gitignore` 忽略，不进版本库）

| 脚本 | 用途 |
|---|---|
| `tmp/vfind/inspect.py` | 把 `chars/*.png` 拼成对比图（`--faces mao xiaoman` 出表情拼版）+ 洋红抠底残留统计 |
| `tmp/vfind/crowd-y.js` | 统计每张背景里群众 `<use>` 戳的 y 坐标上下界 |
| `tmp/vfind/title-cg.js` | 找「`title` 步后紧跟 `cg` 步」的章节（13 处 / 12 章，已转交 engine 分区做 R1 强问题） |
| `tmp/vfind/bisect.js` | 逐个"只保留一层遮罩"跑探针，定位压黑画面的元素 |
