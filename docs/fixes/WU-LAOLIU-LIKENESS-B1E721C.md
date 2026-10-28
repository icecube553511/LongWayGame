# 吴老六形象回退与重制（b1e721c）

## 目标

- 以提交 `b1e721c72872fa4b3d4e3352ee389a577c955127` 中的吴老六为当前唯一长相基准。
- 删除不符合立体几何风格的 `wu_laoliu_weak.svg`。
- 保留当前剧情的 9 个状态，按旧版长相重制全部状态表情。

## 实现

`tools/neko-art.js` 中吴老六的 `LOOK` 与脸部锁定改为旧版长脸、深眼窝、
高颧骨和窄方下颌，并明确禁止再次改成宽方形新脸。重制时以旧版
`wu_laoliu_calm.png` 作为唯一身份参考，不使用后续状态图链式换脸。

重制范围：

- 基础立绘：8 表情。
- 剧情状态：9 状态、48 个实际使用表情。
- `wu_laoliu_weak.svg` 已删除；`wu_laoliu_weak.png` 由旧版平静表情重制为
  同风格的低多边形位图。

重新生成时先把 `b1e721c` 的 `assets/generated/chars/wu_laoliu_calm.png`
取出作为参考图，再运行：

```powershell
node tools/neko-art.js --only wu_laoliu `
  --faces calm,stern,smile,sad,worry,fierce,weak,dawn `
  --reference tmp/wu-laoliu-b1-ref/wu_laoliu_calm.png `
  --concurrency 4 --quality medium

python -X utf8 tools/neko-post.py --raw tmp/neko-raw `
  --out assets/generated/chars `
  wu_laoliu_calm wu_laoliu_stern wu_laoliu_smile wu_laoliu_sad `
  wu_laoliu_worry wu_laoliu_fierce wu_laoliu_weak wu_laoliu_dawn

node tools/neko-states.js --character wu_laoliu --single-base `
  --identity tmp/wu-laoliu-b1-ref/wu_laoliu_calm.png `
  --force --lock-alpha --concurrency 4 --quality medium
```

## 验收

- `node tools/check.js`：280 / 280 基础立绘、625 / 625 形象演进表情。
- `node tools/check-assets.js`：通过。
- `node tools/build-portrait-states.js --check`：35 角色 / 170 状态一致。
- `python tools/check-portrait-key.py`：909 张立绘洋红残留 0。
- `python tools/qc-portraits.py`：455 张表情硬伤 0、构图警告 0。
- 体积档：超过上限文件数 = 0。
- `node tools/e2e-run.js`：20 章全部走完，JS 报错 0。
- `node tools/qa-consistency.js`：违规 0 条。
