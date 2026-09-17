const { contextBridge, ipcRenderer } = require('electron');

// Récupérer les valeurs depuis les arguments de process
const apiUrl = process.argv.find(arg => arg.startsWith('--api-url='))?.split('=')[1];
const headerSecret = process.argv.find(arg => arg.startsWith('--header-secret='))?.split('=')[1] || 'SF76KE6eNKz9Y6hQYFtz7fC8h3XG8848KQNPmergSF76KE6eNKz9Y6hQYFtz7fC8h3XG8848KQNPmerg';
const headerName = process.argv.find(arg => arg.startsWith('--header-name='))?.split('=')[1] || 'X-API-Secret-Key-Choco-Plus';

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  openVLCWithVideo: (videoPath) => ipcRenderer.invoke('open-vlc-with-video', videoPath),

  onMaximize: (callback) => ipcRenderer.on('window-maximized', callback),
  onUnmaximize: (callback) => ipcRenderer.on('window-unmaximized', callback),

  setRefreshToken: (token) => ipcRenderer.invoke('secureStore:setRefreshToken', token),
  getRefreshToken: () => ipcRenderer.invoke('secureStore:getRefreshToken'),
  deleteRefreshToken: () => ipcRenderer.invoke('secureStore:deleteRefreshToken'),
  getVersion: () => ipcRenderer.invoke('get-version'),

  onChocoPlayerStatus: (callback) => ipcRenderer.on('choco-player-status', (_event, data) => callback(data)),

  downloadMedia: (payload) => ipcRenderer.invoke('download-media', payload),
  listDownloads: () => ipcRenderer.invoke('list-downloads'),
  isMediaDownloaded: (movieId) => ipcRenderer.invoke('is-media-downloaded', movieId), 
  isEpisodeDownloaded: (data) => ipcRenderer.invoke('is-episode-downloaded', data), 
  deleteDownload: (key) => ipcRenderer.invoke('delete-download', key),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  getMediaInfo: (mediaId) => ipcRenderer.invoke('get-media-info', mediaId),
  getAllEpisodes: (data) => ipcRenderer.invoke('get-all-episodes', data),

  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  apiUrl: apiUrl,
  headerSecret: headerSecret,
  headerName: headerName
});