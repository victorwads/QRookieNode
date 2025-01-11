const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openDevTools: () => ipcRenderer.send('open-devtools'),
});