# Windows 桌面版

桌面版由 Electron 壳加载仓库根目录的 `index.html`，玩法与素材管线不变。
Electron 只在构建与桌面窗口中存在，游戏本身仍然零网络、零外部素材。

## 构建

在仓库根目录执行：

```powershell
npm install --prefix desktop
python desktop/make-icon.py
node desktop/build.js
```

产物：

```text
dist/exe/LongWayGame-Main-Martin-1.0.0.exe
```

EXE 的产品名、版权与文件描述都署名为 **Martin**。单文件便携版首次启动会在
系统临时目录解包，退出后由 Electron builder 的便携启动器清理。
