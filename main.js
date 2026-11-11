const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: true,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');

  // Kunci pintasan keluar standar Windows
  globalShortcut.register('Alt+Tab', () => false);
  globalShortcut.register('Alt+F4', () => false);
  globalShortcut.register('CommandOrControl+Escape', () => false);
  globalShortcut.register('F11', () => false);
}

app.whenReady().then(createWindow);

ipcMain.on('start-exam', (event, { url }) => {
  win.loadURL(url);
});

ipcMain.on('open-url', (event, url) => {
  win.loadURL(url);
});

ipcMain.on('exit-app', () => {
  app.exit(0);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
