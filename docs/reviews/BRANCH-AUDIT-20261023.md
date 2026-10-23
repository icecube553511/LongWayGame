# 本地分支审计报告（2026-10-23）

## 审计范围

- 仓库：`https://github.com/icecube553511/LongWayGame`
- 当前工作树：`C:\Users\12254\Desktop\projects\LongWayGame`
- 基线：先执行 `git fetch --prune origin`，再盘点本地分支、远端跟踪与独有提交。
- 判定口径：以 `develop` 为目标分支，分别统计 `develop..<分支>` 与 `<分支>..develop`。
  前者为分支独有提交数，后者为分支落后提交数。

## 分支快照

| 本地分支 | 尖端 | 上游 | 独有提交 | 落后 `develop` | 结论 |
|---|---:|---|---:|---:|---|
| `develop` | `7500e22` | `origin/develop` | 0 | 0 | 当前集成分支 |
| `main` | `a769179` | `origin/main` | 0 | 7 | 严格祖先，可安全快进 |
| `archive/CharactersImage` | `94ea0a0` | 上游已删除 | 0 | 2 | 已吸收，保留作存档 |
| `archive/ProjectAnalyze` | `94ea0a0` | 上游已删除 | 0 | 2 | 已吸收，保留作存档 |
| `backup/before-develop-consolidation-20261022` | `94ea0a0` | 无 | 0 | 2 | 合并前备份，保留 |
| `archive/CharactersImageVariantFix` | `57dd781` | 上游已删除 | 0 | 8 | 已吸收，保留作存档 |
| `archive/MobileUI` | `d4cff4a` | 上游已删除 | 0 | 6 | 已吸收，保留作存档 |
| `archive/main-exe` | `1a6227c` | 上游已删除 | 0 | 6 | 已吸收，保留作存档 |

远端分支另有 `exe`，指向 `d4cff4a`；它同样已被 `develop` 完整包含。

## 判断

1. 所有本地分支相对 `develop` 的独有提交数均为 0，没有游离成果。
2. `main` 是 `develop` 的严格祖先，工作树干净，因此对齐主干不需要制造合并提交，
   使用 `git merge --ff-only develop` 即可。
3. 六个 `archive/*` 与 `backup/*` 分支均已并入 `develop`。其中五条远端跟踪已不存在，
   说明远端工作分支已经收口；本地引用仍有存档价值，本轮不删除。
4. 远端 `exe` 分支也已失去独立内容，但当前删除远端分支不属于本次明确的合并动作，
   留给用户决定。

## 处理决定

- 将 `main` 快进到包含全部已合并工作的 `develop`，随后推送 `develop` 与 `main`。
- 保留全部 `archive/*` 与 `backup/*` 本地分支，避免清理动作造成不可逆的引用消失。
- 推送前后核对远端实际指向；以 `git ls-remote --heads origin` 为准。

## 复核命令

```powershell
git branch -vv
git for-each-ref --format='%(refname:short)|%(objectname:short)|%(upstream:short)|%(upstream:track)' refs/heads
git rev-list --left-right --count develop...main
git ls-remote --heads origin
```

