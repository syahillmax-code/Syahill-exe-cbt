const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: true,        // Kiosk mode bawaan Chromium
    alwaysOnTop: true,  // Tetap di layer paling atas
    skipTaskbar: true,  // Sembunyikan dari taskbar agar tidak bisa di-minimize dari taskbar
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  });

  // Anti Screenshot & Screen Recording
  win.setContentProtection(true);

  // Kunci level jendela Windows: selalu di atas aplikasi lain (bahkan di atas Task Manager)
  win.setAlwaysOnTop(true, 'screen-saver');

  win.loadFile('index.html');

  // JIKA SISWA COBA TEKAN WIN + D / MINIMIZE:
  // Otomatis paksa jendela kembali fokus dan layar penuh seketika
  win.on('blur', () => {
    setTimeout(() => {
      if (win && !win.isDestroyed()) {
        win.restore();
        win.setFullScreen(true);
        win.focus();
        win.setAlwaysOnTop(true, 'screen-saver');
      }
    }, 50);
  });

  win.on('minimize', (e) => {
    e.preventDefault();
    win.restore();
    win.setFullScreen(true);
    win.focus();
  });

  // Blokir kombinasi tombol
  const blockedKeys = [
    'Alt+Tab',
    'Alt+F4',
    'CommandOrControl+Escape',
    'F11',
    'PrintScreen',
    'CommandOrControl+Shift+S',
    'Super+D',       // Windows + D di beberapa layout keyboard
    'Meta+D'
  ];

  blockedKeys.forEach(key => {
    try {
      globalShortcut.register(key, () => false);
    } catch (e) {}
  });
}

// Cegah aplikasi dibuka dua kali
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      win.restore();
      win.focus();
    }
  });

  app.whenReady().then(createWindow);
}

ipcMain.on('exit-app', () => {
  app.exit(0);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
