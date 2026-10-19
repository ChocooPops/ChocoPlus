const { contextBridge, ipcRenderer } = require('electron');

const serverSettings = ipcRenderer.sendSync('secureStore:getServerSettingsSync');
const apiUrl = serverSettings.MAIN_URL ?? '';
const headerName = serverSettings.SECURE_DOMAIN ?? '';
const headerSecret = serverSettings.DASHBOARD_KEY ?? '';

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, args) => ipcRenderer.invoke(channel, args),
  openVLCWithVideo: (videoPath) => ipcRenderer.invoke('open-vlc-with-video', videoPath),

  onMaximize: (callback) => ipcRenderer.on('window-maximized', callback),
  onUnmaximize: (callback) => ipcRenderer.on('window-unmaximized', callback),

  setRefreshToken: (token) => ipcRenderer.invoke('secureStore:setRefreshToken', token),
  getRefreshToken: () => ipcRenderer.invoke('secureStore:getRefreshToken'),
  deleteRefreshToken: () => ipcRenderer.invoke('secureStore:deleteRefreshToken'),
  setKeyTarServer: (data) => ipcRenderer.invoke('secureStore:setKeyTarServer', data),
  setForceStopPlayer: (state) => ipcRenderer.invoke('secureStore:setForceStopPlayer', state),
  getForceStopPlayer: () => ipcRenderer.invoke('secureStore:getForceStopPlayer'),

  getVersion: () => ipcRenderer.invoke('get-version'),

  onChocoPlayerStatus: (callback) => ipcRenderer.on('choco-player-status', (_event, data) => callback(data)),

  downloadMedia: (payload) => ipcRenderer.invoke('download-media', payload),
  cancelDownload: (data) => ipcRenderer.invoke('cancel-download', data),
  listDownloads: () => ipcRenderer.invoke('list-downloads'),
  mediaDownloadedIsEmpty: () => ipcRenderer.invoke('download-is-empty'),
  isMediaDownloaded: (movieId) => ipcRenderer.invoke('is-media-downloaded', movieId), 
  isEpisodeDownloaded: (data) => ipcRenderer.invoke('is-episode-downloaded', data),
  deleteDownload: (data) => ipcRenderer.invoke('delete-download', data),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_event, data) => callback(data)),
  getStorageInfo: () => ipcRenderer.invoke('get-storage-info'),
  getMediaInfo: (mediaId) => ipcRenderer.invoke('get-media-info', mediaId),
  getAllEpisodes: (data) => ipcRenderer.invoke('get-all-episodes', data),
  getLastWatchedEpisode: (seriesId) => ipcRenderer.invoke('get-last-watched-episode', seriesId),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  apiUrl: apiUrl,
  headerSecret: headerSecret,
  headerName: headerName
});