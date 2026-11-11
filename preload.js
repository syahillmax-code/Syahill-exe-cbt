const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AndroidBridge', {
  startExamUrl: (url, exitPinData, duration) => {
    ipcRenderer.send('start-exam', { url, exitPinData, duration });
  },
  openUrl: (url) => {
    ipcRenderer.send('open-url', url);
  },
  exitApp: () => {
    ipcRenderer.send('exit-app');
  }
});
