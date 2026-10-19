const { app, BrowserWindow, ipcMain, dialog, session, shell } = require('electron');
const path = require('path');
const url = require('url');
const keytar = require('keytar');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const https = require('https');

const ProcessStatus = Object.freeze({
  LAUNCHING: "LAUNCHING",
  NETWORK_SLOWDOWN: "NETWORK_SLOWDOWN",
  STREAMING: "STREAMING",
  CLOSED: "CLOSED"
});

const ProgressStreamMedia = Object.freeze({
  NOT_WATCHED: "NOT_WATCHED",
  IN_PROGRESS: "IN_PROGRESS",
  FINISHED: "FINISHED"
});
const MINIMUM_RATE = 93;

const UPDATE_PROGRESS = "UPDATE_PROGRESS";
const NEW_EPISODE_ID = "NEW_EPISODE_ID";

const MediaType = Object.freeze({
  MOVIE: "MOVIE",
  SERIES: "SERIES",
  SEASON: "SEASON",
  EPISODE: "EPISODE",
  OTHER: "OTHER"
});

const ProgressTypeOperation = Object.freeze({
  DOWNLOAD: "DOWNLOAD"
});

let mediaLaunched = {
  id: 0,
  type: MediaType.OTHER,
}

const TOKEN_SERVICE = 'my-app-auth';
const SERVER_SERVICE = 'my-app-server';
const TOKEN_ACCOUNT = 'refresh-token';
const SETTINGS_SERVICE = 'my-app-settings';
const FORCE_STOP_PLAYER_ACCOUNT = 'force-stop-player';

// Server settings (keytar), stored in memory for preloading, downloads, and ChocoPlayer
const serverSettings = {
  MAIN_URL: '',
  SECURE_DOMAIN: '',
  DASHBOARD_KEY: ''
};

let mainWindow;
let csharpProcess = null;
let forceStopChocoPlayer = false;

// Check that only one instance of the application is open
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // An instance already exists; exit this instance
  app.quit();
} else {
  // This is the first instance; listen for launch attempts
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone has tried to launch a second instance
    // Focus on the existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

// Path to the configuration file
const userDataPath = app.getPath('userData');
const windowStateFile = path.join(userDataPath, 'window-state.json');
const downloadsRootPath = path.join(userDataPath, 'downloads');
const FILE_METADATA = 'metadata.json'

// Function to load the window state
function loadWindowState() {
  try {
    if (fs.existsSync(windowStateFile)) {
      const data = fs.readFileSync(windowStateFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading the window state:', error);
  }

  // Default values
  return {
    width: 1920,
    height: 1080,
    x: undefined,
    y: undefined,
    isMaximized: false
  };
}

// Function to save the window’s state
function saveWindowState() {
  try {
    if (!mainWindow) return;

    const bounds = mainWindow.getBounds();
    const state = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: mainWindow.isMaximized()
    };

    fs.writeFileSync(windowStateFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error saving the window state:', error);
  }
}

function createWindow() {
  let isClosingWindow = false;

  // Load the previous state of the window
  const windowState = loadWindowState();

  // Creating the main window using the saved dimensions
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minHeight: 580,
    minWidth: 670,
    resizable: true,
    frame: false,
    transparent: false,
    // expose window controlls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Context isolation for security
    },
    icon: path.join(__dirname, 'dist/choco-plus/browser/icon.ico'),
  });

  // Restore the maximised state if necessary
  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  // Load the Angular application
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/choco-plus/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Open the developer tools if necessary
  mainWindow.webContents.openDevTools();

  // Removing the menu bar
  mainWindow.setMenu(null);

  // Save the state when changes are made
  mainWindow.on('resize', saveWindowState);
  mainWindow.on('move', saveWindowState);
  mainWindow.on('maximize', () => {
    saveWindowState();
    mainWindow.webContents.send('window-maximized');
  });
  mainWindow.on('unmaximize', () => {
    saveWindowState();
    mainWindow.webContents.send('window-unmaximized');
  });

  mainWindow.on('close', (event) => {
    if (isClosingWindow) return;

    saveWindowState();

    if (!isCSharpRunning()) return;

    event.preventDefault();
    isClosingWindow = true;
    //mainWindow.hide(); // optional: the user sees the window close immediately

    stopCSharpProcess().finally(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
      }
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

//=========================================================================================//*
//=========================================================================================//*
//=================================== MAIN FUNCTION DOWNLOAD ==============================//*
//=========================================================================================//*
//=========================================================================================//*
const activeDownloads = new Set();

function hasActiveDownloads() {
  return activeDownloads.size > 0;
}

// Cancels all ongoing downloads and waits until they have been cleaned up (partial files have been deleted).
async function abortActiveDownloads() {
  const entries = [...activeDownloads];
  entries.forEach((entry) => entry.controller.abort());
  await Promise.allSettled(entries.map((entry) => entry.promise));
}

// True if a download other than exceptKey is in progress for this media (another episode of the same series).
function isMediaDownloading(mediaId, exceptKey) {
  return [...activeDownloads].some((entry) => entry.key !== exceptKey && String(entry.data?.media?.id) === String(mediaId));
}

// Media title (movie) or episode name, taken from the metadata sent by the renderer with download-media.
function getMediaName(data) {
  const { media, episode, mediaType } = data || {};
  if (mediaType === MediaType.EPISODE) return episode?.name || null;
  return media?.title || null;
}

// Cancellations received before the matching download-media (the renderer was still fetching the metadata) :
// key -> resolve of the pending cancel-download. download-media resolves it with the name from its metadata
// and doesn't start the download. The timeout covers a download-media that never comes (metadata fetch failed).
const pendingCancels = new Map();
const PENDING_CANCEL_TIMEOUT_MS = 30000;

function waitForPendingCancel(key) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      pendingCancels.delete(key);
      resolve({ key, fileName: null });
    }, PENDING_CANCEL_TIMEOUT_MS);
    pendingCancels.set(key, (fileName) => {
      clearTimeout(timeout);
      pendingCancels.delete(key);
      resolve({ key, fileName });
    });
  });
}

// Cancels the one download tracked under this key and waits for performDownload's own catch block to finish
// cleaning up (removing the partial file / the folder it just created). Resolves with the key and the file
// name : the real video file name if it was known, otherwise the media title / episode name.
async function cancelDownloadByKey(key) {
  const entry = [...activeDownloads].find((candidate) => candidate.key === key);
  if (!entry) {
    return waitForPendingCancel(key);
  }
  entry.controller.abort();
  await entry.promise.catch(() => {});
  return { key, fileName: entry.fileName || getMediaName(entry.data) };
}

// Deletions are never aborted (we don't want to leave a download folder half-deleted) : we just track
// them so before-quit/reload-app can wait for whatever is already running to actually finish first.
const activeDeletions = new Set();

function hasActiveDeletions() {
  return activeDeletions.size > 0;
}

async function waitForActiveDeletions() {
  await Promise.allSettled([...activeDeletions]);
}

async function downloadImage(imageUrl, targetDir) {
  if (!imageUrl) return null;
  return new Promise((resolve, reject) => {
    try {
      const protocol = imageUrl.startsWith('https') ? https : http;
      const fileName = path.basename(new URL(imageUrl).pathname);
      const filePath = path.join(targetDir, fileName);

      const file = fs.createWriteStream(filePath);

      protocol.get(imageUrl, (response) => {
        // Check the status code
        if (response.statusCode !== 200) {
          file.destroy();
          fs.unlink(filePath, () => {});
          return resolve(null);
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          // Return the path in file:// format
          const fileUrl = `file:///${filePath.replace(/\\/g, '/')}`;
          resolve(fileUrl);
        });

        file.on('error', (err) => {
          fs.unlink(filePath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    } catch (error) {
      resolve(null)
    }
  });
}
async function downloadImageArray(imageUrls, imagesDir) {
  if (!Array.isArray(imageUrls)) return [];

  return Promise.all(
    imageUrls.map(url =>
      downloadImage(url, imagesDir).catch(() => '')
    )
  );
}

const VIDEO_DEFAULT_EXTENSION = '.mkv';
const VIDEO_CONTENT_TYPE_EXTENSIONS = {
  'video/x-matroska': '.mkv',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/x-msvideo': '.avi',
  'video/quicktime': '.mov'
};

function getOriginalFileName(headers) {
  const disposition = headers['content-disposition'] || '';
  const encoded = /filename\*\s*=\s*(?:[\w-]+)?'[^']*'([^;]+)/i.exec(disposition);
  const plain = /filename\s*=\s*(?:"([^"]+)"|([^;]+))/i.exec(disposition);
  let name = null;
  try {
    if (encoded) {
      name = decodeURIComponent(encoded[1].trim());
    } else if (plain) {
      name = (plain[1] || plain[2]).trim();
    }
  } catch (error) {
    name = plain ? (plain[1] || plain[2]).trim() : null;
  }
  if (!name) return null;

  name = path.basename(name.replace(/\\/g, '/')).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
  return name && name !== '.' && name !== '..' ? name.slice(0, 200) : null;
}

function getVideoFileName(headers) {
  const contentType = (headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const fallbackExtension = VIDEO_CONTENT_TYPE_EXTENSIONS[contentType] || VIDEO_DEFAULT_EXTENSION;
  const originalName = getOriginalFileName(headers);
  if (!originalName) return `video${fallbackExtension}`;
  return path.extname(originalName) ? originalName : `${originalName}${fallbackExtension}`;
}

async function downloadVideo(mediaType, id, targetDir, key, signal) {
  const token = await getToken();
  // The cancellation may have happened while waiting for the token.
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    let endpoint;
    if (mediaType === MediaType.MOVIE) {
      endpoint = `download/download-movie/${id}`;
    } else if (mediaType === MediaType.EPISODE) {
      endpoint = `download/download-episode/${id}`;
    } else {
      return reject(new Error(`Unsupported media type for video download: ${mediaType}`));
    }

    const videoUrl = new URL(`${serverSettings.MAIN_URL}/${endpoint}`);
    const protocol = videoUrl.protocol === 'https:' ? https : http;

    const headers = { Authorization: `Bearer ${token}` };
    if (serverSettings.SECURE_DOMAIN && serverSettings.DASHBOARD_KEY) {
      headers[serverSettings.SECURE_DOMAIN] = serverSettings.DASHBOARD_KEY;
    }

    let failResponse = null;
    const request = protocol.get(videoUrl, { headers, signal }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`Video download failed (${response.statusCode}) for ${endpoint}`));
      }

      const fileName = getVideoFileName(response.headers);
      // Remembered on the entry so that cancel-download can return the real file name.
      const entry = [...activeDownloads].find((candidate) => candidate.key === key);
      if (entry) entry.fileName = fileName;
      const filePath = path.join(targetDir, fileName);
      const partialPath = `${filePath}.part`;
      const totalBytes = parseInt(response.headers['content-length'], 10);
      let receivedBytes = 0;
      let lastPercent = -1;
      let lastSentAt = 0;

      const file = fs.createWriteStream(partialPath);

      // Only rejects once the .part file is closed and deleted : on Windows, an open file blocks the
      // removal of its folder, so performDownload's cleanup would fail if we rejected any earlier.
      let failed = false;
      const fail = (error) => {
        if (failed) return;
        failed = true;
        response.destroy();
        const removePartial = () => fs.unlink(partialPath, () => reject(error));
        if (file.closed) {
          removePartial();
        } else {
          file.once('close', removePartial);
          file.destroy();
        }
      };
      failResponse = fail;

      response.on('data', (chunk) => {
        receivedBytes += chunk.length;

        if (!mainWindow || mainWindow.isDestroyed()) return;

        // At most one update every 500 ms (or every percentage point): the renderer calculates the speed and the remaining time based on this.
        const now = Date.now();
        const percent = totalBytes > 0 ? Math.min(99, Math.floor((receivedBytes / totalBytes) * 100)) : undefined;
        if (now - lastSentAt >= 500 || (percent !== undefined && percent !== lastPercent)) {
          lastSentAt = now;
          if (percent !== undefined) lastPercent = percent;
          mainWindow.webContents.send('download-progress', {
            key,
            ...(percent !== undefined ? { percent } : {}),
            receivedBytes,
            totalBytes: totalBytes > 0 ? totalBytes : 0,
            fileName,
            type: ProgressTypeOperation.DOWNLOAD
          });
        }
      });

      response.on('error', fail);
      response.on('aborted', () => fail(new Error(`Video download aborted for ${endpoint}`)));
      file.on('error', fail);

      response.pipe(file);

      file.on('finish', () => {
        file.close(() => {
          if (totalBytes > 0 && receivedBytes < totalBytes) {
            return fail(new Error(`Video download incomplete for ${endpoint}`));
          }
          try {
            fs.renameSync(partialPath, filePath);
            resolve({
              filePath,
              totalBytes
            });
          } catch (error) {
            fail(error);
          }
        });
      });
    });

    // Once the response has started (file open), the abort must go through fail() to close the file first.
    request.on('error', (error) => (failResponse ? failResponse(error) : reject(error)));
  });
}

async function performDownload(data, key, signal) {
  const { media, info, seasonId, episode, mediaType } = data || {};

  const downloadDirMedia = path.join(downloadsRootPath, String(media.id));
  const seriesAlreadyDownloaded = Boolean(hasMediaDownloaded(media.id));
  let fileName = null;

  try {
    let results = null;
    let totalBytes = null;

    if (media.title) {
      const imagesDirMedia = path.join(downloadDirMedia, 'images');

      delete media.typeZoomX;
      delete media.typeZoomY;
      delete media.categories;
      delete media.credits;
      delete media.isRecent;
      delete media.otherTitles;
      delete media.lastSeasonWatched;

      if (info.casts && Array.isArray(info.casts)) {
        info.casts.forEach((cast) => {
          cast.srcPoster = null;
        });
      }
      if (info.crews && Array.isArray(info.crews)) {
        info.crews.forEach((crew) => {
          crew.srcPoster = null;
        });
      }
      if (media.seasons && Array.isArray(media.seasons)) {
        media.seasons.forEach((season) => {
          delete season.isRecent;
          delete season.isClicked;
        });
      }

      fs.mkdirSync(downloadDirMedia, { recursive: true });
      fs.rmSync(imagesDirMedia, { recursive: true, force: true });
      fs.mkdirSync(imagesDirMedia, { recursive: true });

      const imageSources = {
        arrays: ['srcPosterNormal', 'srcPosterHorizontal', 'srcPosterLicense', 'srcPosterSpecial'],
        singles: ['srcBackgroundImage', 'srcLogo']
      };

      for (const field of imageSources.arrays) {
        if (media[field]) {
          media[field] = (await downloadImageArray(media[field], imagesDirMedia)).filter(result => result);
          signal.throwIfAborted();
        }
      }
      for (const field of imageSources.singles) {
        if (media[field]) {
          try {
            media[field] = await downloadImage(media[field], imagesDirMedia);
          } catch(error) {
            media[field] = null;
          }
          signal.throwIfAborted();
        }
      }
      if (media.seasons && Array.isArray(media.seasons)) {
        for (const [index, season] of media.seasons.entries()) {
          media.seasons[index].srcPoster = await downloadImage(season.srcPoster, imagesDirMedia);
          delete media.seasons[index].episodes;
          signal.throwIfAborted();
        }
      }
      if (mediaType === MediaType.MOVIE) {
        const data = await downloadVideo(mediaType, media.id, downloadDirMedia, key, signal);
        fileName = path.basename(data.filePath);
        totalBytes = data.totalBytes;
        fs.writeFileSync(path.join(downloadDirMedia, FILE_METADATA), JSON.stringify({ media, info, videoPath: data.filePath }, null, 2));
      } else {
        delete media.createdAt;
        delete media.updatedAt;
        fs.writeFileSync(path.join(downloadDirMedia, FILE_METADATA), JSON.stringify({ media, info }, null, 2));
      }
      results = { media };
    }

    if (mediaType === MediaType.EPISODE && seasonId && episode && !hasEpisodeDownloaded(media.id, seasonId, episode.id)) {
      const downloadDirEpisode = path.join(downloadDirMedia, String(seasonId), String(episode.id));
      const imagesDirEpisode = path.join(downloadDirEpisode, 'images');

      fs.mkdirSync(downloadDirEpisode, { recursive: true });
      fs.rmSync(imagesDirEpisode, { recursive: true, force: true });
      fs.mkdirSync(imagesDirEpisode, { recursive: true });

      delete episode.isRecent;

      episode.srcPoster = await downloadImage(episode.srcPoster, imagesDirEpisode)
      signal.throwIfAborted();
      const data = await downloadVideo(mediaType, episode.id, downloadDirEpisode, key, signal);
      fileName = path.basename(data.filePath);
      totalBytes = data.totalBytes;

      fs.writeFileSync(path.join(downloadDirEpisode, FILE_METADATA), JSON.stringify({episode, videoPath: data.filePath}, null, 2));

      results = { ...results, episode };
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-progress', { key, type: ProgressTypeOperation.DOWNLOAD, percent: 100, fileName, totalBytes });
    }

    return results
  } catch(error) {
    // A cleanup failure must not hide the original error.
    try {
      const rmOptions = { recursive: true, force: true, maxRetries: 5, retryDelay: 100 };
      if (mediaType === MediaType.EPISODE && seasonId && episode) {
        // Only this episode's folder : another episode of the same series may be downloading next to it.
        const seasonDir = path.join(downloadDirMedia, String(seasonId));
        fs.rmSync(path.join(seasonDir, String(episode.id)), rmOptions);

        // The season / series folders go only once empty, and if no other download of this series still needs them.
        if (!isMediaDownloading(media.id, key)) {
          if (listNumericDirs(seasonDir).length === 0) {
            fs.rmSync(seasonDir, rmOptions);
          }
          if (!seriesAlreadyDownloaded && listNumericDirs(downloadDirMedia).length === 0) {
            fs.rmSync(downloadDirMedia, rmOptions);
          }
        }
      } else {
        fs.rmSync(downloadDirMedia, rmOptions);
      }
    } catch(cleanupError) {
      console.error('Failed to clean up canceled/failed download :', cleanupError);
    }

    throw error;
  }
}

async function performDeleteDownload(data) {
  const { mediaType, mediaId, seasonId, episodeId } = data || {};
  const needsSeason = mediaType === MediaType.SEASON || mediaType === MediaType.EPISODE;
  const needsEpisode = mediaType === MediaType.EPISODE;

  if (!isDownloadId(mediaId) || (needsSeason && !isDownloadId(seasonId)) || (needsEpisode && !isDownloadId(episodeId))) {
    throw new Error('Invalid download to delete');
  }

  const mediaDir = path.join(downloadsRootPath, String(mediaId));
  const deletedEntries = [];
  let media = null;
  // Only for an episode deletion : true if its season has no episode left (null otherwise).
  let hasNoEpisode = null;

  if (mediaType === MediaType.MOVIE) {
    const metadata = readMetadataFile(path.join(mediaDir, FILE_METADATA));
    const fileName = metadata && metadata.videoPath ? path.basename(metadata.videoPath) : null;
    media = metadata ? metadata.media ?? null : null;
    removeDownloadDir(mediaDir);
    deletedEntries.push({ key: `${MediaType.MOVIE}-${mediaId}`, fileName });
  } else if (mediaType === MediaType.SERIES) {
    const metadata = readMetadataFile(path.join(mediaDir, FILE_METADATA));
    media = metadata ? metadata.media ?? null : null;
    deletedEntries.push(...collectSeriesEntries(mediaDir));
    deletedEntries.push({ key: `${MediaType.SERIES}-${mediaId}`, fileName: media?.title ?? null, episode: null });
    removeDownloadDir(mediaDir);
  } else if (needsSeason) {
    if (mediaType === MediaType.EPISODE) {
      const episodeDir = path.join(mediaDir, String(seasonId), String(episodeId));
      const metadata = readMetadataFile(path.join(episodeDir, FILE_METADATA));
      const fileName = metadata && metadata.videoPath ? path.basename(metadata.videoPath) : null;
      const episode = metadata ? metadata.episode ?? null : null;
      removeDownloadDir(episodeDir);
      deletedEntries.push({ key: `${MediaType.EPISODE}-${episodeId}`, fileName, episode });
      // Checked before the empty-season cleanup below removes the season folder.
      hasNoEpisode = listNumericDirs(path.join(mediaDir, String(seasonId))).length === 0;
    } else {
      deletedEntries.push(...collectSeriesEntries(mediaDir, seasonId));
      removeDownloadDir(path.join(mediaDir, String(seasonId)));
    }

    // A season without episodes no longer has a reason to exist, nor does a series without seasons.
    for (const season of listNumericDirs(mediaDir)) {
      if (listNumericDirs(path.join(mediaDir, season)).length === 0) {
        removeDownloadDir(path.join(mediaDir, season));
        deletedEntries.push({ key: `${MediaType.SEASON}-${season}`, fileName: null, episode: null });
      }
    }
    if (listNumericDirs(mediaDir).length === 0) {
      const seriesMetadata = readMetadataFile(path.join(mediaDir, FILE_METADATA));
      media = seriesMetadata ? seriesMetadata.media ?? null : null;
      deletedEntries.push({ key: `${MediaType.SERIES}-${mediaId}`, fileName: media?.title ?? null, episode: null });
      removeDownloadDir(mediaDir);
    }
  } else {
    throw new Error(`Unsupported media type to delete: ${mediaType}`);
  }

  return { entries: deletedEntries, media, hasNoEpisode };
}

// Check if a media's own metadata exists (its video too, for a movie — the two are written together;
// a series never has its own videoPath, only its episodes do, so it isn't required here).
function hasMediaDownloaded(mediaId) {
  try {
    const downloadDirMedia = path.join(downloadsRootPath, String(mediaId), FILE_METADATA);
    if (fs.existsSync(downloadDirMedia)) {
      const fileContent = fs.readFileSync(downloadDirMedia, 'utf-8');
      if (!fileContent.trim()) {
        return false;
      }
      const metadata = JSON.parse(fileContent);
      return Boolean(metadata.media && metadata.media.id);
    } else {
      return false;
    }
  } catch(error) {
    return false;
  }
}

// Check if an episode of a series exists
function hasEpisodeDownloaded(seriesId, seasonId, episodeId) {
 try {
    const downloadDirEpisode = path.join(downloadsRootPath, String(seriesId), String(seasonId), String(episodeId), FILE_METADATA);
    if (fs.existsSync(downloadDirEpisode)) {
      const fileContent = fs.readFileSync(downloadDirEpisode, 'utf-8');
      if (!fileContent.trim()) {
        return false;
      }
      const metadata = JSON.parse(fileContent);
      return metadata.episode.id && metadata.videoPath;
    } else {
      return false;
    }
  } catch(error) {
    return false;
  }
}

const CACHE_FOLDER_NAMES = ['Cache', 'Code Cache', 'GPUCache', 'DawnGraphiteCache', 'DawnWebGPUCache', 'Shared Dictionary'];
function getDiskUsage(targetPath) {
  try {
    const stats = fs.statfsSync(targetPath);
    return {
      totalBytes: stats.blocks * stats.bsize,
      freeBytes: stats.bavail * stats.bsize
    };
  } catch (error) {
    return { totalBytes: 0, freeBytes: 0 };
  }
}

function getFolderSizeBytes(dirPath) {
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        total += getFolderSizeBytes(entryPath);
      } else if (entry.isFile()) {
        try {
          total += fs.statSync(entryPath).size;
        } catch (error) {
          // Unreadable file: it is ignored.
        }
      }
    }
  } catch (error) {
    // Folder does not exist or is unreadable.
  }
  return total;
}

function removeDownloadDir(targetPath) {
  const root = path.resolve(downloadsRootPath) + path.sep;
  const resolved = path.resolve(targetPath);
  if (!resolved.startsWith(root)) {
    throw new Error('Invalid download path');
  }
  fs.rmSync(resolved, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

function isDownloadId(value) {
  return /^\d+$/.test(String(value));
}

// Parsed metadata.json (movie, series or episode), or null if missing/unreadable.
function readMetadataFile(metadataPath) {
  try {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  } catch (error) {
    return null;
  }
}

// Names of numeric subfolders (seasons of a series, episodes of a season; “images” is ignored).
function listNumericDirs(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && isDownloadId(entry.name))
      .map((entry) => entry.name);
  } catch (error) {
    return [];
  }
}

// Entries ({ key, fileName, episode }) for everything in a TV series' folder (SEASON-<id>, EPISODE-<id>).
// A season has no file/metadata of its own (fileName and episode null); an episode carries its video's
// file name and its full metadata.
function collectSeriesEntries(seriesDir, onlySeasonId) {
  const entries = [];
  const seasonIds = onlySeasonId ? [String(onlySeasonId)] : listNumericDirs(seriesDir);
  for (const seasonId of seasonIds) {
    entries.push({ key: `${MediaType.SEASON}-${seasonId}`, fileName: null, episode: null });
    const seasonDir = path.join(seriesDir, seasonId);
    listNumericDirs(seasonDir).forEach((episodeId) => {
      const metadata = readMetadataFile(path.join(seasonDir, episodeId, FILE_METADATA));
      const fileName = metadata && metadata.videoPath ? path.basename(metadata.videoPath) : null;
      const episode = metadata ? metadata.episode ?? null : null;
      entries.push({ key: `${MediaType.EPISODE}-${episodeId}`, fileName, episode });
    });
  }
  return entries;
}

function getAllEpisodesBySeriesId(seriesId) {
  const episodes = [];
  if (!seriesId) return episodes;
  try {
    if (!seriesId) return episodes;
    const seriesPath = path.join(downloadsRootPath, String(seriesId));
    if (fs.existsSync(seriesPath)) {
      const seasonsFolders = fs.readdirSync(seriesPath, { withFileTypes: true });
      for (const seasonFolder of seasonsFolders) {
        if (seasonFolder.isDirectory()) {
          const seasonPath = path.join(seriesPath, seasonFolder.name);
          const episodeFolders = fs.readdirSync(seasonPath, { withFileTypes: true });
          for (const episodeFolder of episodeFolders) {
            if (episodeFolder.isDirectory()) {
              const episodePath = path.join(seasonPath, episodeFolder.name, FILE_METADATA);
              try {
                const metadata = JSON.parse(fs.readFileSync(episodePath, 'utf-8'));
                if (metadata) {
                  episodes.push(metadata);
                }
              } catch(error) {

              }
            }
          }
        }
      }
    }
    return episodes.sort((a, b) => a.episode.episodeNumber - b.episode.episodeNumber);
  } catch(error) {
    return episodes
  }
}

function getMetadataByMediaId(mediaId) {
  try {
    const mediaPath = path.join(downloadsRootPath, String(mediaId), FILE_METADATA);
    if (!fs.existsSync(mediaPath)) {
      return null
    }
    const metadata = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
    return metadata;
  } catch(error) {
    return null;
  }
}

function getMetadataByEpisodeId(seriesId, seasonId, episodeId) {
  try {
    const mediaPath = path.join(downloadsRootPath, String(seriesId), String(seasonId), String(episodeId), FILE_METADATA);
    if (!fs.existsSync(mediaPath)) {
      return null;
    }
    const metadata = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
    return metadata;
  } catch(error) {
    return null;
  }
}

// For a series : flags the seasons with no downloaded episode (hasNoEpisodes) and selects (isClicked) the season
// of the most recently created/updated episode, otherwise the first season that has episodes. Other media unchanged.
function formatSeriesSeasons(media) {
  if (!media || media.mediaType !== MediaType.SERIES || !Array.isArray(media.seasons)) {
    return media;
  }
  let lastSeasonWatched = null;
  let maxDate = null;
  media.seasons.forEach((season) => {
    const episodes = getAllEpisodeBySeasonId(media.id, season.id);
    if (episodes.length > 0) {
      season.hasNoEpisodes = false;
      if (lastSeasonWatched === null) {
        lastSeasonWatched = season.id;
      }
      episodes.forEach((episode) => {
        const { createdAt, updatedAt } = episode;
        if (!createdAt && !updatedAt) return;
        const created = createdAt ? new Date(createdAt).getTime() : -Infinity;
        const updated = updatedAt ? new Date(updatedAt).getTime() : -Infinity;
        const episodeDate = Math.max(created, updated);
        if (maxDate === null || episodeDate > maxDate) {
          maxDate = episodeDate;
          lastSeasonWatched = season.id;
        }
      });
    } else {
      season.hasNoEpisodes = true;
    }
  });
  media.seasons.forEach((season) => {
    season.isClicked = season.id === lastSeasonWatched;
  });
  return media;
}

function getAllEpisodeBySeasonId(seriesId, seasonId) {
  const downloads = [];
  try {
    const seasonPath = path.join(downloadsRootPath, String(seriesId), String(seasonId));
    if (fs.existsSync(seasonPath)) {
      const entries = fs.readdirSync(seasonPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const metadataPath = path.join(seasonPath, entry.name, FILE_METADATA);
        if (!fs.existsSync(metadataPath)) continue;
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          downloads.push(metadata.episode);
        } catch (error) {
          // Corrupt metadata: This entry is ignored
        }
      }
    }
  } finally {
    return downloads;
  }
}

function getStatProgressType(watchProgress) {
  if (watchProgress === 0) {
    return ProgressStreamMedia.NOT_WATCHED;
  } else if (watchProgress < MINIMUM_RATE) {
    return ProgressStreamMedia.IN_PROGRESS;
  } else {
    return ProgressStreamMedia.FINISHED;
  }
}

function updateProgressMovieById(movieId, progress) {
  try {
    const movie = getMetadataByMediaId(movieId);
    if (!movie) return;
    movie.media.watchProgress = progress;
    movie.media.stateProgress = getStatProgressType(progress);
    movie.media.updatedAt = new Date();

    const moviePath = path.join(downloadsRootPath, String(movieId), FILE_METADATA);
    fs.writeFileSync(moviePath, JSON.stringify(movie, null, 2));
  } catch(error) {
    return;
  }
}

function updateProgressEpisodeById(seriesId, seasonId, episodeId, progress) {
  try {
    const episode = getMetadataByEpisodeId(seriesId, seasonId, episodeId);
    if (!episode) return;
    episode.episode.watchProgress = progress;
    episode.episode.stateProgress = getStatProgressType(progress);
    episode.episode.updatedAt = new Date();

    const episodePath = path.join(downloadsRootPath, String(seriesId), String(seasonId), String(episodeId), FILE_METADATA);
    fs.writeFileSync(episodePath, JSON.stringify(episode, null, 2));
  } catch(error) {
    return;
  }
}


function shuffleMediaPosters(media) {
  const POSTER_KEYS = [
    "srcPosterSpecial",
    "srcPosterLicense",
    "srcPosterHorizontal",
    "srcPosterNormal",
  ];

  const shuffle = (arr) => {
    const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
  };

  const result = { ...media };
  for (const key of POSTER_KEYS) {
    const value = result[key];
    if (Array.isArray(value) && value.length > 1) {
      result[key] = shuffle(value);
    }
  }
  return result;
}

//=========================================================================================//*
//=========================================================================================//*
//=================================== MAIN IPC DOWNLOAD ===================================//*
//=========================================================================================//*
//=========================================================================================//*

ipcMain.handle('download-media', (event, data) => {
  const controller = new AbortController();
  const key = data?.mediaType === MediaType.MOVIE
    ? `${MediaType.MOVIE}-${data.media.id}`
    : data?.mediaType === MediaType.EPISODE
      ? `${MediaType.EPISODE}-${data.episode.id}`
      : null;
  // Canceled while the renderer was still preparing it : nothing to download, just hand the name back.
  const resolvePendingCancel = pendingCancels.get(key);
  if (resolvePendingCancel) {
    resolvePendingCancel(getMediaName(data));
    return { canceled: true };
  }
  const entry = { key, controller, promise: null, data, fileName: null };
  entry.promise = performDownload(data, key, controller.signal);
  activeDownloads.add(entry);
  // .finally() returns a new promise that rejects too : without a catch it becomes an unhandled rejection.
  entry.promise.finally(() => activeDownloads.delete(entry)).catch(() => {});
  // A cancellation is not an error : the renderer gets its result through the cancel-download handler,
  // so we resolve instead of rejecting (otherwise Electron logs "Error occurred in handler").
  return entry.promise
    .then((results) => {
      // Same season formatting as list-downloads (done here, once the episode is on disk).
      if (results && results.media) {
        formatSeriesSeasons(results.media);
      }
      return results;
    })
    .catch((error) => {
      if (controller.signal.aborted) {
        return { canceled: true };
      }
      throw error;
    });
});

// Cancels, by key, the one download the user clicked while it was WAITING/IN_PROGRESS. performDownload's
// own catch block (same one used for the app-quit/reload abort path) takes care of removing whatever was
// already written to disk, so there's nothing extra to clean up here.
ipcMain.handle('cancel-download', async (event, data) => {
  const { key } = data || {};
  if (!key) return { key: null, fileName: null };
  return cancelDownloadByKey(key);
});

ipcMain.handle('get-storage-info', () => {
  const { totalBytes, freeBytes } = getDiskUsage(userDataPath);
  const downloadsBytes = getFolderSizeBytes(downloadsRootPath);
  const cacheBytes = CACHE_FOLDER_NAMES.reduce(
    (sum, name) => sum + getFolderSizeBytes(path.join(userDataPath, name)),
    0
  );

  return { totalBytes, freeBytes, downloadsBytes, cacheBytes };
});

ipcMain.handle('list-downloads', () => {
  if (!fs.existsSync(downloadsRootPath)) return [];
  try {
    const entries = fs.readdirSync(downloadsRootPath, { withFileTypes: true });

    const sortedDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const dirPath = path.join(downloadsRootPath, entry.name);
        const metadataPath = path.join(dirPath, FILE_METADATA);
        if (!fs.existsSync(metadataPath)) return null;
        const stats = fs.statSync(dirPath);
        return {
          metadataPath,
          time: stats.birthtimeMs || stats.mtimeMs // creation, else modification
        };
      })
      .filter((dir) => dir !== null)
      .sort((a, b) => a.time - b.time); // oldest first

    const downloads = [];
    for (const { metadataPath } of sortedDirs) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        let formatedMedia = formatSeriesSeasons(metadata.media);
        formatedMedia = shuffleMediaPosters(formatedMedia);

        downloads.push(formatSeriesSeasons(formatedMedia));
      } catch (error) {
        // Corrupt metadata: This entry is ignored
      }
    }
    return downloads;
  } catch(error) {
    return []
  }
});

ipcMain.handle('download-is-empty', () => {
  try {
    const entries = fs.readdirSync(downloadsRootPath, { withFileTypes: true });
    const hasMedia = entries.some((entry) =>
      entry.isDirectory() && fs.existsSync(path.join(downloadsRootPath, entry.name, FILE_METADATA))
    );
    return !hasMedia;
  } catch (error) {
    return true;
  }
});

ipcMain.handle('is-media-downloaded', (event, movieId) => {
  return hasMediaDownloaded(movieId);
});

ipcMain.handle('is-episode-downloaded', (event, data) => {
  const { seriesId, seasonId, episodeId } = data;
  return hasEpisodeDownloaded(seriesId, seasonId, episodeId);
});

ipcMain.handle('get-media-info', (event, mediaId) => {
  const metadataPath = path.join(downloadsRootPath, String(mediaId), FILE_METADATA);
  if (fs.existsSync(metadataPath)) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    return metadata.info;
  } else {
    return null;
  }
});

ipcMain.handle('get-all-episodes', (event, data) => {
  const { seriesId, seasonId } = data;
  const downloads = getAllEpisodeBySeasonId(seriesId, seasonId);
  return downloads.sort((a, b) => a.episodeNumber - b.episodeNumber);
});

ipcMain.handle('get-last-watched-episode', (event, seriesId) => {
  const episodes = getAllEpisodesBySeriesId(seriesId);
  if (!episodes || episodes.length === 0) return null;

  const getEntryTime = (entry) => {
    const { createdAt, updatedAt } = entry.episode;
    const created = createdAt ? new Date(createdAt).getTime() : -Infinity;
    const updated = updatedAt ? new Date(updatedAt).getTime() : -Infinity;
    return Math.max(created, updated);
  };

  const latest = episodes.reduce((best, entry) =>
    getEntryTime(entry) > getEntryTime(best) ? entry : best
  );

  return latest.episode;
});

ipcMain.handle('delete-download', (event, data) => {
  const promise = performDeleteDownload(data);
  activeDeletions.add(promise);
  promise.finally(() => activeDeletions.delete(promise));
  return promise;
});

//=========================================================================================//
//=========================================================================================//
//===================================== TOKEN STORAGE =====================================//
//=========================================================================================//
//=========================================================================================//
async function getToken() {
  return await keytar.getPassword(TOKEN_SERVICE, TOKEN_ACCOUNT);
}

async function loadServerSettings() {
  for (const account of Object.keys(serverSettings)) {
    serverSettings[account] = await keytar.getPassword(SERVER_SERVICE, account) ?? '';
  }
}

ipcMain.handle('secureStore:setRefreshToken', async (_e, token) => {
  await keytar.setPassword(TOKEN_SERVICE, TOKEN_ACCOUNT, token)
});
ipcMain.handle('secureStore:getRefreshToken', async () =>
  getToken()
);
ipcMain.handle('secureStore:deleteRefreshToken', async () =>
  await keytar.deletePassword(TOKEN_SERVICE, TOKEN_ACCOUNT)
);

ipcMain.handle('secureStore:setKeyTarServer', async (_e, data) => {
  const { account, value } = data;
  if (!value) {
    await keytar.deletePassword(SERVER_SERVICE, account)
  } else {
    await keytar.setPassword(SERVER_SERVICE, account, value)
  }
  if (account in serverSettings) {
    serverSettings[account] = value ?? '';
  }
});

async function loadForceStopPlayer() {
  forceStopChocoPlayer = (await keytar.getPassword(SETTINGS_SERVICE, FORCE_STOP_PLAYER_ACCOUNT)) === 'true';
}

ipcMain.handle('secureStore:setForceStopPlayer', async (_e, state) => {
  forceStopChocoPlayer = Boolean(state);
  await keytar.setPassword(SETTINGS_SERVICE, FORCE_STOP_PLAYER_ACCOUNT, String(forceStopChocoPlayer));
});
ipcMain.handle('secureStore:getForceStopPlayer', () =>
  forceStopChocoPlayer
);

ipcMain.on('secureStore:getServerSettingsSync', (event) => {
  event.returnValue = serverSettings;
});

//=========================================================================================//
//=========================================================================================//
//===================================== CHOCO PLAYER ======================================//
//=========================================================================================//
//=========================================================================================//

function isCSharpRunning() {
  return Boolean(csharpProcess && csharpProcess.exitCode === null && csharpProcess.signalCode === null);
}

function stopCSharpProcess(force = forceStopChocoPlayer, timeoutMs = 3000) {
  mediaLaunched.id = 0;
  mediaLaunched.type = MediaType.OTHER;

  return new Promise((resolve) => {
    const proc = csharpProcess;
    if (!proc || proc.exitCode !== null || proc.signalCode !== null) {
      csharpProcess = null;
      return resolve();
    }

    let timer = null;
    proc.once('close', () => {
      clearTimeout(timer);
      if (csharpProcess === proc) csharpProcess = null;
      resolve();
    });

    const kill = (useForce) => {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${proc.pid} /T${useForce ? ' /F' : ''}`, () => {});
      } else {
        proc.kill(useForce ? 'SIGKILL' : 'SIGTERM');
      }
    };

    try {
      kill(force);
      if (!force) timer = setTimeout(() => kill(true), timeoutMs);
    } catch (e) {
      clearTimeout(timer);
      csharpProcess = null;
      resolve();
    }
  });
}

let launchQueue = Promise.resolve();

ipcMain.handle('launch-choco-player', (event, dataObject) => {
  const run = launchQueue.then(() => launchChocoPlayer(dataObject));
  launchQueue = run.catch(() => {});
  return run;
});

async function launchChocoPlayer(dataObject) {
  try {
    // Same media already playing: nothing to do.
    if (
      (mediaLaunched.type === MediaType.MOVIE && mediaLaunched.id === dataObject.MediaId) ||
      (mediaLaunched.type === MediaType.SERIES && mediaLaunched.id === dataObject.EpisodeId)
    ) {
      return;
    }

    // Another media is playing: stop it cleanly before launching the new one.
    if (isCSharpRunning()) {
      const previous = { ...mediaLaunched };
      await stopCSharpProcess();
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (previous.type === MediaType.MOVIE) {
          mainWindow.webContents.send('choco-player-status', { MediaId: previous.id });
        } else if (previous.type === MediaType.SERIES) {
          mainWindow.webContents.send('choco-player-status', { EpisodeId: previous.id });
        }
      }
    }

    if (!mainWindow || mainWindow.isDestroyed()) return;

    // Sent after the stop: otherwise the old process's CLOSED would arrive after this LAUNCHING.
    mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.LAUNCHING });

    mediaLaunched.id = 0;
    mediaLaunched.type = MediaType.OTHER;

    if (dataObject.MediaType === MediaType.MOVIE) {
      mediaLaunched.id = dataObject.MediaId;
      mediaLaunched.type = MediaType.MOVIE;

      const metadata = getMetadataByMediaId(dataObject.MediaId);
      if (metadata && metadata.videoPath) {
        dataObject.Url = metadata.videoPath;
      }
    } else if (dataObject.MediaType === MediaType.SERIES) {
      mediaLaunched.id = dataObject.EpisodeId;
      mediaLaunched.type = MediaType.SERIES;

      const metadata = getMetadataByEpisodeId(dataObject.MediaId, dataObject.SeasonId, dataObject.EpisodeId);
      if (metadata && metadata.videoPath) {
        dataObject.Url = metadata.videoPath;
      }

      dataObject.EpisodesStorage = getAllEpisodesBySeriesId(dataObject.MediaId);
    } else {
      mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.CLOSED });
      return;
    }

    const bounds = mainWindow.getBounds();
    dataObject.BaseUrl = serverSettings.MAIN_URL;
    dataObject.PositionX = bounds.x;
    dataObject.PositionY = bounds.y;
    dataObject.IsMaximized = mainWindow.isMaximized();
    dataObject.IsFullScreen = mainWindow.isFullScreen();
    dataObject.Token = await getToken();
    dataObject.HEADER_NAME = serverSettings.SECURE_DOMAIN;
    dataObject.HEADER_SECRET = serverSettings.DASHBOARD_KEY;
    dataObject.WatchProgress = dataObject.WatchProgress ?? 0;

    const csharpAppPath = app.isPackaged
      ? path.join(process.resourcesPath, 'ChocoPlayer', 'ChocoPlayer.exe')
      : path.join(__dirname, 'ChocoPlayer', 'bin', 'Debug', 'net9.0-windows', 'ChocoPlayer.exe');

    const proc = spawn(csharpAppPath, [JSON.stringify(dataObject)], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    csharpProcess = proc;

    // The handlers below only act on THIS process, never on the one that replaced it.
    const isCurrent = () => csharpProcess === proc;
    const canSend = () => isCurrent() && mainWindow && !mainWindow.isDestroyed();

    // stdout can split a line across two chunks: keep the unfinished end for the next chunk.
    let stdoutRest = '';

    proc.stdout.on('data', (data) => {
      const lines = (stdoutRest + data.toString()).split('\n');
      stdoutRest = lines.pop();

      for (const rawLine of lines) {
        const message = rawLine.trim();
        if (!message) continue;

        if (message.startsWith(NEW_EPISODE_ID)) {
          if (isCurrent() && mediaLaunched.type === MediaType.SERIES) {
            mediaLaunched.id = Number(message.split(' : ')[1].trim());
          }
          continue;
        }

        if (Object.values(ProcessStatus).includes(message)) {
          if (canSend()) {
            mainWindow.webContents.send('choco-player-status', { status: message });
          }
          continue;
        }

        if (message.startsWith(UPDATE_PROGRESS)) {
          const parts = message.split(' : ').map((part) => part.trim());
          const mediaId = Number(parts[2]);

          if (message.includes(MediaType.MOVIE)) {
            const progress = Number(parts[3]);
            // Written to disk in all cases (even if the window is closed or the process was replaced).
            updateProgressMovieById(mediaId, progress);
            if (canSend()) {
              mainWindow.webContents.send('choco-player-status', {
                MediaId: mediaId,
                WatchProgress: progress,
                StateProgress: getStatProgressType(progress)
              });
            }
          } else if (message.includes(MediaType.EPISODE)) {
            const seasonId = Number(parts[3]);
            const episodeId = Number(parts[4]);
            const progress = Number(parts[5]);
            updateProgressEpisodeById(mediaId, seasonId, episodeId, progress);
            if (canSend()) {
              mainWindow.webContents.send('choco-player-status', {
                EpisodeId: episodeId,
                WatchProgress: progress,
                StateProgress: getStatProgressType(progress)
              });
            }
          }
        }
      }
    });

    proc.on('close', () => {
      if (!isCurrent()) return;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.CLOSED });
      }
      mediaLaunched.id = 0;
      mediaLaunched.type = MediaType.OTHER;
      csharpProcess = null;
    });

    proc.on('error', (err) => {
      console.error('ChocoPlayer error:', err);
      if (!isCurrent()) return;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.CLOSED });
      }
      mediaLaunched.id = 0;
      mediaLaunched.type = MediaType.OTHER;
      csharpProcess = null;
    });

    return 'C# Player launched';
  } catch (err) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.CLOSED });
    }
    await stopCSharpProcess(true);
    throw new Error(err.message);
  }
}

//=========================================================================================//*
//=========================================================================================//*
//=================================== MAIN APPLICATION ===================================//*
//=========================================================================================//*
//=========================================================================================//*
app.on('ready', async () => {
  await loadServerSettings();
  await loadForceStopPlayer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('get-version', () => {
  return app.getVersion()
});

ipcMain.handle('open-external', async (_event, url) => {
  if (typeof url !== 'string' || !url.startsWith('http')) {
    throw new Error('URL invalide');
  }

  await shell.openExternal(url);
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths;
});

ipcMain.handle('open-vlc-with-video', async (event, videoPath) => {
  return new Promise((resolve, reject) => {
    const vlcPath = `"C:\\Program Files\\VideoLAN\\VLC\\vlc.exe"`;
    const absolutePath = path.isAbsolute(videoPath)
      ? videoPath
      : path.resolve(app.getPath('home'), videoPath);

    const uriPath = encodeURI(`file:///${absolutePath.replace(/\\/g, '/')}`);
    const command = `${vlcPath} ${uriPath} --fullscreen --no-video-title-show`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(`VLC a démarré avec succès.`);
    });
  });
});

ipcMain.handle('is-fullscreen', async () => {
  const isFullScreen = mainWindow.isFullScreen();
  return isFullScreen;
});

ipcMain.handle('toggle-fullscreen', async () => {
  const isFullScreen = mainWindow.isFullScreen();
  mainWindow.setFullScreen(!isFullScreen);
  return !isFullScreen;
});

ipcMain.handle('disable-fullscreen', async () => {
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  }
});

ipcMain.handle('delete-cache', async () => {
  const ses = session.defaultSession;

  await Promise.all([
    ses.clearCache(),
    ses.clearStorageData({
      storages: ['cookies', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers'],
      quotas: ['temporary', 'persistent', 'syncable']
    })
  ]);
});

ipcMain.handle('reload-app', async () => {
  await loadServerSettings();
  if (isCSharpRunning()) {
    await stopCSharpProcess();
  }
  if (hasActiveDownloads()) {
    await abortActiveDownloads();
  }
  if (hasActiveDeletions()) {
    await waitForActiveDeletions();
  }
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/choco-plus/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
});

ipcMain.handle('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  return mainWindow.isMaximized();
});

ipcMain.handle('window-close', () => {
  mainWindow.close();
});

let isQuitting = false;
app.on('before-quit', async (event) => {
  if (isQuitting) return;
  const needsCleanup = (isCSharpRunning()) || hasActiveDownloads() || hasActiveDeletions();

  if (!needsCleanup) return;

  event.preventDefault();
  isQuitting = true;

  try {
    if (isCSharpRunning()) {
      await stopCSharpProcess();
    }
    if (hasActiveDownloads()) {
      await abortActiveDownloads();
    }
    if (hasActiveDeletions()) {
      await waitForActiveDeletions();
    }
  } finally {
    app.quit();
  }
});