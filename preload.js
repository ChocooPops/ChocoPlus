const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  openVLCWithVideo: (videoPath) => ipcRenderer.invoke('open-vlc-with-video', videoPath),

  onMaximize: (callback) => ipcRenderer.on('window-maximized', callback),
  onUnmaximize: (callback) => ipcRenderer.on('window-unmaximized', callback),

  setRefreshToken: (token) => ipcRenderer.invoke('secureStore:setRefreshToken', token),
  getRefreshToken: () => ipcRenderer.invoke('secureStore:getRefreshToken'),
  deleteRefreshToken: () => ipcRenderer.invoke('secureStore:deleteRefreshToken'),
});