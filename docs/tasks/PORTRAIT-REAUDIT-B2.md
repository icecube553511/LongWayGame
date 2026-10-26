# 立绘复判 B2：透明洞、裁切与机位

工作目录：`C:\Users\12254\Desktop\projects\LongWayGame`。

你是独立审核员，不是修正者。先按 `AGENTS.md` 的顺序读取契约，再读
`docs/reviews/PORTRAIT-SCENE-AUDIT-B.md`、`docs/fixes/PORTRAIT-SCENE-LOOP-B.md`。

只复核 `PSL-B03` 至 `PSL-B07`：

- `zhu_ch06_zunyi_stern`、`lide_ch07_zunyi_fierce` 是否仍有透明洞；
- `li_tiezhu`、`san_wa` 的单人物状态是否仍带地面、灶、碗、围坐群像；
- `san_wa_ch19_north`、`shi_zhu_ch15_luding`、`shi_zhu_ch15_burned`、
  `soldiers_ch09_longmarch` 的底边与机位；
- 自己运行 `node tools/build-portrait-states.js --check`、`node tools/check.js`、
  `python -X utf8 tools/check-portrait-key.py`、
  `python -X utf8 tools/qc-portraits.py`；
- 允许生成 `tmp/` 拼版，不得修改素材。

只写 `docs/reviews/PORTRAIT-SCENE-REAUDIT-B2.md`，不跑 git。
逐条给 `PASS` / `FAIL` / `PARTIAL`、证据和剩余风险。完成即回复。
