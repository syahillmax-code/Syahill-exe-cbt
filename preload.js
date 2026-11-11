const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AndroidBridge', {
  startExamUrl: (url, exitPinData, duration) => {
    ipcRenderer.send('start-exam', { url, exitPinData, duration });
  },
  openUrl: (url) => {
    ipcRenderer.send('start-exam', { url, exitPinData: '1234567', duration: 70 });
  },
  refreshExam: () => {
    ipcRenderer.send('refresh-exam');
  },
  verifyExitPin: (pin) => {
    ipcRenderer.send('verify-exit-pin', pin);
  },
  onPinFailed: (callback) => {
    ipcRenderer.on('exit-pin-failed', () => callback());
  },
  onInitTopBar: (callback) => {
    ipcRenderer.on('init-topbar', (event, data) => callback(data));
  },
  exitApp: () => {
    ipcRenderer.send('exit-app');
  }
});
