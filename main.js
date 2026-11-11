const { app, BrowserWindow, BrowserView, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');

let win;
let examView = null;
let currentExitPin = '1234567';
let currentPengawasPin = '1234';

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true,
    kiosk: true,        // Kunci layar penuh tanpa taskbar Windows
    alwaysOnTop: true,  // Tetap berada di layer paling depan
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Anti-Screenshot & Screen Record (Layar otomatis hitam jika direkam/screenshot)
  win.setContentProtection(true);

  win.loadFile('index.html');

  // Blokir tombol pintasan Windows & Screenshot
  const blockedKeys = [
    'Alt+Tab',
    'Alt+F4',
    'CommandOrControl+Escape',
    'F11',
    'PrintScreen',
    'CommandOrControl+Shift+S', // Snipping Tool
    'CommandOrControl+Alt+Delete'
  ];

  blockedKeys.forEach(key => {
    try {
      globalShortcut.register(key, () => false);
    } catch (e) {}
  });
}

app.whenReady().then(createWindow);

// Saat siswa menekan "Mulai Ujian"
ipcMain.on('start-exam', (event, { url, exitPinData, duration }) => {
  if (exitPinData && exitPinData.includes('#')) {
    const parts = exitPinData.split('#');
    currentExitPin = parts[0].trim();
    currentPengawasPin = parts[1].trim();
  } else if (exitPinData) {
    currentExitPin = exitPinData.trim();
  }

  // Tampilkan antarmuka bar atas di window utama
  win.webContents.send('init-topbar', { duration: duration || 70 });

  // Buat tampilan khusus Google Form tepat di bawah Top Bar (tinggi bar 50px)
  const bounds = win.getBounds();
  examView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.setBrowserView(examView);
  examView.setBounds({ x: 0, y: 50, width: bounds.width, height: bounds.height - 50 });
  examView.setAutoResize({ width: true, height: true });
  examView.webContents.loadURL(url);

  // Blokir klik kanan di lembar soal Google Form
  examView.webContents.on('context-menu', (e) => e.preventDefault());
});

// Refresh halaman ujian
ipcMain.on('refresh-exam', () => {
  if (examView) {
    examView.webContents.reload();
  }
});

// Verifikasi PIN Keluar dari Top Bar
ipcMain.on('verify-exit-pin', (event, enteredPin) => {
  if (enteredPin === currentExitPin || enteredPin === currentPengawasPin) {
    if (examView) {
      win.removeBrowserView(examView);
      examView = null;
    }
    win.loadFile('index.html');
  } else {
    event.reply('exit-pin-failed');
  }
});

ipcMain.on('exit-app', () => {
  app.exit(0);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
