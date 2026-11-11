const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('AndroidBridge', {
  exitApp: () => {
    ipcRenderer.send('exit-app');
  }
});
