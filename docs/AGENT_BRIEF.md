# 并行 Agent 作业书（root 维护，只读）

> 所有 agent 开工前先读：`docs/SPEC.md`（技术契约）、`docs/STORY_BIBLE.md`（史实与人物）、本文件。
> 本文件由 root 维护，agent 不得修改。契约有疑问 → 发消息给 `/root`。

## 0. 铁律

1. **只写自己名下的文件。** 需要别人文件的改动，发消息给该 agent 或 `/root`。
2. **零构建、零依赖、零网络。** `file://` 双击可运行。禁止 ES Module（`type="module"`）、`fetch()`、CDN、外部字体、外部图片。
3. **全中文**：游戏文本、注释、文档用简体中文（代码标识符英文）。
4. **不允许任何 JS 报错。** 缺图必须静默降级。
5. 改完自己的文件，**必须自己跑一次验证**（见 §5），不要交给别人兜底。

## 1. 目录与所有权

| 路径 | 所有者 |
|---|---|
| `docs/SPEC.md` `docs/STORY_BIBLE.md` `docs/AGENT_BRIEF.md` | root · 冻结 |
| `art/geosvg.js` `art/palette.js` | root · 冻结 |
| `src/data/characters.js` `src/data/backgrounds.js` | root · 冻结 |
| `src/story/manifest.js` | root · 冻结 |
| `tools/build-art.js` `tools/qa-shot.js` | root · 冻结 |
| `art/portraits_*.js` | art-chars-* |
| `art/scenes_*.js` `art/cg_*.js` `art/ui_*.js` | art-scenes-* / art-ui |
| `index.html` `css/style.css` | web-shell |
| `src/engine/engine.js` | engine-core |
| `src/engine/ui.js` | engine-ui |
| `src/engine/save.js` | engine-core |
| `src/engine/audio.js` | audio |
| `src/engine/gallery.js` | extras |
| `src/story/chNN.js` | story-a..e（各自 4 章） |
| `tools/check.js` `README.md` | qa |

## 2. 素材注册契约（art agent 必读）

素材 agent **不直接写文件**，只注册绘制函数；由 `tools/build-art.js` 烘焙。

```js
(function () {
  var G = (typeof window !== 'undefined') ? window : globalThis;
  var GEO = G.GEO;                         // 渲染库
  var ART = G.ART = G.ART || {};
  ART.scenes = ART.scenes || {};           // 背景
  ART.portraits = ART.portraits || {};     // 立绘
  ART.cg = ART.cg || {};                   // 全屏插画
  ART.ui = ART.ui || {};                   // UI 装饰

  ART.scenes['bg_yudu_night'] = function () {   // 1920×1080 完整 SVG 文档
    return GEO.doc(1920, 1080, GEO.sky(1920,1080, GEO.P.sky.night) + /* … */);
  };
  ART.portraits['mao'] = function (face) {      // 600×900 完整 SVG 文档
    return GEO.portraitSVG({ id:'mao', face:face, frame:'three-quarter',
      opts:{ cloth:'#5b6660', hat:'cap', puttee:true, hair:'short', coat:true } });
  };
  ART.ui['divider'] = function () { return GEO.doc(960, 24, GEO.uiDivider(0,16,960,'#bf9a38')); };
})();
```

**id 表已冻结**，见 `src/data/backgrounds.js`（背景/UI/音频）与 `src/data/characters.js`（人物/表情）。
缺任何 id = `tools/check.js` 失败。

## 3. `GEO` 速查（`art/geosvg.js`）

```
文档   GEO.doc(w,h,body,{defs,bg})            GEO.portraitSVG({id,face,frame,scale,opts})
形状   poly(pts,fill,o) pline(pts,stroke,o) pth(d,fill,o) rect circle ell ln grp text
       ngon(cx,cy,r,sides,rot,squash) facet(pts,color,o) facetBand(top,bot,color,o)
       inset/move/expand/scalePts/jitter/centroid/ptAt   boxIso(x,y,w,h,d,color,o)
天空   sky(w,h,ramp,{horizon,glow}) sunDisc(cx,cy,r,color,{disc:'moon'}) stars glowBand
       cloudBank mistBand snowfall rainfall embers smokePlume vignette
地形   ridgeLine mountainRange(w,horizon,color,{amp,segs,seed,snowcap,grad})
       cliffWall groundBand waterBand lakeSurface
植被   pineTree bambooCluster broadleafTree shrubRow grassTufts reeds lotusHummock
建筑   house tower gate ropeBridge(x0,y0,x1,y1,sag,deck,{gaps}) plankBridge tent
       cityWall stairs caveMouth
道具   torch campfire lantern(x,y,r,glow) flag banner woodenBoat raft stretcher rifle
       packBag copperPot bugle mapOnTable chair telegraphPole fenceRow stoneMarker
       barbedWire bunker wallPoster
人物   humanoid(opts) crowd(count,{x0,x1,y0,y1,h,color,seed}) portraitSVG(spec)
UI     uiStar uiFrame uiRibbon uiBtn(w,h) uiMountainMotif uiCloudMotif uiDivider
工具   GEO.P（配色表） GEO.RNG(seed) GEO.ramp(list,t) GEO.mix/lighten/darken/alpha/mul
```

### 3.1 `humanoid(opts)` 参数

```
H,gy,cx            画布高度 / 脚底 y / 中轴 x（默认 H=900, gy=H, cx=H/2）
build              体型系数 0.8(瘦小) ~ 1.25(壮硕)
pose               stand walk march run salute point armscrossed hold carry raiseone
                   kneel sit shield
skin,cloth,pants   主色（十六进制字符串或 GEO.ramp(...)）
hat                none|cap|oct|helmet|straw|turban|scarf|fur|hood
star/starColor     八角帽上的红星（默认开）
hair               short|long|bun|braid|crew|receding|bald|none
hairColor,browColor,eyeColor,glassColor
facialHair         mustache|beard|stubble|full
glasses bandage armband scarf cloak pack sash apron coat(coatLen)
collar(默认 true)/collarColor 领章   belt/buckle 皮带
puttee             绑腿   shoe 鞋色   headScale 头身比（小孩 1.05~1.18）
extra              函数 ({X,Y,H,shY,hiY,shW,hiW}) => svg 片段，用来画专属道具
```

`GEO.POSES` 的关节坐标以 H 为单位、相对 (cx,gy)；`GEO.lerpPose(a,b,t)` 可插值出中间姿态。

### 3.2 立绘构图

`frame: 'three-quarter'`（默认，膝上，面部清晰）｜`'full'`（全身）｜`'bust'`（胸像）。
画布固定 600×900，透明背景。**默认就用 three-quarter**，除非该角色需要展示腿脚细节。

## 4. 剧本 agent 必读

只写 `src/story/chNN.js`，格式严格按 `docs/SPEC.md` §2。
每章：`steps ≥ 90`、正文 ≥ 3000 汉字、`choice ≥ 2`、`archive ≥ 3`。
只用 SPEC §3.1 的 `who`、§3.2 的 `face`、§4.1 的 `bg`。`goto` 目标必须存在。
文风见 `docs/STORY_BIBLE.md` 五、红线。

自检（务必跑）：

```powershell
node tools/check.js --chapter ch07      # 单章
```

## 5. 通用自检命令

```powershell
node tools/build-art.js        # 烘焙素材；会列出缺失的绘制函数
node tools/check.js            # 全量校验（20 章 + 资源 + 死链）
node tools/check.js --chapter ch07
node tools/serve.js            # 本地 http 预览（可选，file:// 也应能跑）
```

## 6. 汇报格式

完成后向 `/root` 发 `FINAL_ANSWER`，包含：写了哪些文件、自检命令与输出摘要、已知缺口。
