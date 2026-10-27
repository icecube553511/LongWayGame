# 立绘增量复审：石柱与吴老六脸部刻面

工作目录：`C:\Users\12254\Desktop\projects\LongWayGame`。

## 背景

当前工作区出现一组未提交变更：

- `tools/neko-art.js` 与 `tools/neko-states.js` 为 `shi_zhu`、`wu_laoliu`
  增加脸部多边形约束；
- `assets/generated/chars/shi_zhu_*.png` 与 `wu_laoliu_*.png` 已由现有管线重出。

## 任务

作为独立审核员，只检查这组增量：

1. 两角色在各状态、各表情之间是否保持同脸、同年龄、同帽型/发型、同标志物；
2. 表情是否至少同时改变眉、眼、嘴，且危险场景不读成喜悦；
3. 是否有桌面、地面、家具、其他人物肢体、悬空道具或生硬底边；
4. `calm` 与各表情的身体轮廓、机位与透明蒙版是否稳定；
5. 与背景中的实际使用位置是否兼容。

必须运行：

```powershell
python -X utf8 tools/check-portrait-key.py
python -X utf8 tools/qc-portraits.py
node tools/check.js
```

对关键状态按原生分辨率查看。不得修改源码或素材，不跑 git。

## 输出

只写 `docs/reviews/PORTRAIT-SCENE-REAUDIT-1132.md`。

逐角色、逐状态给 `PASS` / `FAIL` / `PARTIAL`，附截图或文件证据。
发现问题的修法必须能直接交给现有管线执行。完成即回复。
