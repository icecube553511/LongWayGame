'use strict';

const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');

const APP_ID = 'com.martin.longwaygame';
let mainWindow = null;

app.setName('长征 · 万水千山');
app.setAppUserModelId(APP_ID);

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', function () {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app.whenReady().then(function () {
    Menu.setApplicationMenu(null);
    createMainWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 960,
    minHeight: 540,
    show: false,
    frame: true,
    fullscreenable: true,
    autoHideMenuBar: true,
    backgroundColor: '#07090f',
    title: '长征 · 万水千山',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });

  /* 本作是纯离线本地游戏。禁止新窗口、WebView 与非 file:// 导航，
   * 防止误触链接把玩家带到联网页面。 */
  mainWindow.webContents.setWindowOpenHandler(function () {
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', function (event, url) {
    if (!url.startsWith('file://')) event.preventDefault();
  });
  mainWindow.webContents.on('will-attach-webview', function (event) {
    event.preventDefault();
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.on('window-all-closed', function () {
  app.quit();
});
