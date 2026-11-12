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

  // Internal video player (see media-player.js). The on* methods return a function that removes the listener.
  player: {
    prepare: (request) => ipcRenderer.invoke('player:prepare', request),
    release: (sourceId) => ipcRenderer.invoke('player:release', sourceId),
    saveProgress: (data) => ipcRenderer.invoke('player:save-progress', data),
    // The window is about to close: callback saves the progress (returns a promise), then the main process is told
    onFlushProgress: (callback) => {
      const listener = async (_event, flushId) => {
        try {
          await callback();
        } finally {
          ipcRenderer.send('player:progress-flushed', flushId);
        }
      };
      ipcRenderer.on('player:flush-progress', listener);
      return () => ipcRenderer.removeListener('player:flush-progress', listener);
    },
    onSubtitleCues: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('player:subtitle-cues', listener);
      return () => ipcRenderer.removeListener('player:subtitle-cues', listener);
    },
    onPgsDisplaySets: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('player:pgs-display-sets', listener);
      return () => ipcRenderer.removeListener('player:pgs-display-sets', listener);
    },
    // ChocoPlayer was launched: the internal player has been stopped (only one video at a time)
    onClosedByChocoPlayer: (callback) => {
      const listener = () => callback();
      ipcRenderer.on('player:closed-by-choco-player', listener);
      return () => ipcRenderer.removeListener('player:closed-by-choco-player', listener);
    },
    onStreamError: (callback) => {
      const listener = (_event, data) => callback(data);
      ipcRenderer.on('player:stream-error', listener);
      return () => ipcRenderer.removeListener('player:stream-error', listener);
    }
  },

  apiUrl: apiUrl,
  headerSecret: headerSecret,
  headerName: headerName
});