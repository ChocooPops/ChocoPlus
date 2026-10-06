const { app, BrowserWindow, ipcMain, dialog, session, shell } = require('electron');
const path = require('path');
const url = require('url');
const keytar = require('keytar');
const { exec } = require('child_process');
const { spawn } = require("child_process");
const fs = require('fs');
const http = require('http');
const https = require('https');

const ProcessStatus = Object.freeze({
  LAUNCHING: "LAUNCHING",
  NETWORK_SLOWDOWN: "NETWORK_SLOWDOWN",
  STREAMING: "STREAMING",
  CLOSED: "CLOSED"
});

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
  DOWNLOAD: "DOWNLOAD",
  DELETION: "DELETION"
});

let mediaLaunched = {
  id: 0,
  type: MediaType.OTHER,
}

const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

const SERVICE = 'my-app-auth';
const ACCOUNT = 'refresh-token';

let mainWindow;
let csharpProcess = null;
let currentChocoPlayer = null;

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
   // Load the previous state of the window
  const windowState = loadWindowState();

  // Creating the main window using the saved dimensions
  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    minHeight: 580,
    minWidth: 620,
    resizable: true,
    frame: false,
    transparent: false,
    // expose window controlls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Isolation du contexte pour la sécurité
      enableRemoteModule: false,
      additionalArguments: [
        `--api-url=${process.env.API_URL || 'http://localhost:3000'}`,
        `--header-secret=${process.env.HEADER_SECRET_API}`,
        `--header-name=${process.env.HEADER_NAME_FIELD_SECRET_API}`
      ]
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

  // Handling window closure
  mainWindow.on('close', () => {
    saveWindowState();
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
  return new Promise((resolve, reject) => {
    let endpoint;
    if (mediaType === MediaType.MOVIE) {
      endpoint = `download/download-movie/${id}`;
    } else if (mediaType === MediaType.EPISODE) {
      endpoint = `download/download-episode/${id}`;
    } else {
      return reject(new Error(`Unsupported media type for video download: ${mediaType}`));
    }

    const apiUrl = (process.env.API_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const videoUrl = new URL(`${apiUrl}/${endpoint}`);
    const protocol = videoUrl.protocol === 'https:' ? https : http;

    const headers = { Authorization: `Bearer ${token}` };
    if (process.env.HEADER_NAME_FIELD_SECRET_API && process.env.HEADER_SECRET_API) {
      headers[process.env.HEADER_NAME_FIELD_SECRET_API] = process.env.HEADER_SECRET_API;
    }

    const request = protocol.get(videoUrl, { headers, signal }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`Video download failed (${response.statusCode}) for ${endpoint}`));
      }

      const fileName = getVideoFileName(response.headers);
      const filePath = path.join(targetDir, fileName);
      const partialPath = `${filePath}.part`;
      const totalBytes = parseInt(response.headers['content-length'], 10);
      let receivedBytes = 0;
      let lastPercent = -1;
      let lastSentAt = 0;

      const file = fs.createWriteStream(partialPath);

      const fail = (error) => {
        response.destroy();
        file.destroy();
        fs.unlink(partialPath, () => {});
        reject(error);
      };

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

    request.on('error', reject);
  });
}

async function performDownload(data, signal) {

  const { media, info, seasonId, episode, mediaType } = data || {};

  const mediaIdStr = String(media.id);
  const downloadDirMedia = path.join(downloadsRootPath, mediaIdStr);
  const seriesAlreadyDownloaded = Boolean(hasMediaDownloaded(media.id));

  try {

    let results = null;
    let key = '';
    let fileName = null;
    let totalBytes = null;
    if (mediaType === MediaType.MOVIE) {
      key = `${MediaType.MOVIE}-${media.id}`;
    } else if (mediaType === MediaType.EPISODE) {
      key = `${MediaType.EPISODE}-${episode.id}`;
    }

    if (media.title) {
      const mediaIdStr = String(media.id);
      const downloadDirMedia = path.join(downloadsRootPath, mediaIdStr);
      const imagesDirMedia = path.join(downloadDirMedia, 'images');

      delete media.typeZoomX;
      delete media.typeZoomY;
      delete media.typeZoomY;
      delete media.categories;
      delete media.credits;
      delete media.isRecent;
      delete media.otherTitles;
      delete media.watchProgress;
      delete media.stateProgress;

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
          try {
            media[field] = await downloadImageArray(media[field], imagesDirMedia);
          } catch(error) {
            media[field] = null;
          }
        }
      }
      for (const field of imageSources.arrays) {
        if (media[field]) {
          media[field] = media[field].filter(result => result);
        }
      }
      for (const field of imageSources.singles) {
        if (media[field]) {
          try {
            media[field] = await downloadImage(media[field], imagesDirMedia);
          } catch(error) {
            media[field] = null;
          }
        }
      }
      if (media.seasons && Array.isArray(media.seasons)) {
        for (const [index, season] of media.seasons.entries()) {
          media.seasons[index].srcPoster = await downloadImage(season.srcPoster, imagesDirMedia);
          delete media.seasons[index].episodes;
        }
      }
      if (mediaType === MediaType.MOVIE) {
        const data = await downloadVideo(mediaType, media.id, downloadDirMedia, key, signal);
        fileName = path.basename(data.filePath);
        totalBytes = data.totalBytes;
        fs.writeFileSync(path.join(downloadDirMedia, FILE_METADATA), JSON.stringify({ media, info, videoPath: data.filePath }, null, 2));
      } else {
        fs.writeFileSync(path.join(downloadDirMedia, FILE_METADATA), JSON.stringify({ media, info }, null, 2));
      }
      results = { media };
    }

    if (mediaType === MediaType.EPISODE && seasonId && episode && !hasEpisodeDownloaded(media.id, seasonId, episode.id)) {
      const seriesIdStr = String(seasonId);
      const episodeIdStr = String(episode.id);

      const downloadDirEpisode = path.join(downloadDirMedia, seriesIdStr, episodeIdStr);
      const imagesDirEpisode = path.join(downloadDirEpisode, 'images');

      fs.mkdirSync(downloadDirEpisode, { recursive: true });
      fs.rmSync(imagesDirEpisode, { recursive: true, force: true });
      fs.mkdirSync(imagesDirEpisode, { recursive: true });

      episode.srcPoster = await downloadImage(episode.srcPoster, imagesDirEpisode)
      const data = await downloadVideo(mediaType, episode.id, downloadDirEpisode, key, signal);
      fileName = path.basename(data.filePath);
      totalBytes = data.totalBytes;
    
      fs.writeFileSync(path.join(downloadDirEpisode, FILE_METADATA), JSON.stringify({episode, videoPath: data.filePath}, null, 2));
      
      if (results && results.media) {
        const mediaTmp = results.media;
        results = { media: mediaTmp, episode }
      } else {
        results = { episode }
      }
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-progress', { key, type: ProgressTypeOperation.DOWNLOAD, percent: 100, fileName, totalBytes });
    }

    return results
  } catch(error) {
    if (mediaType === MediaType.EPISODE && seriesAlreadyDownloaded && seasonId && episode) {
      fs.rmSync(path.join(downloadDirMedia, String(seasonId), String(episode.id)), { recursive: true, force: true });
    } else {
      fs.rmSync(downloadDirMedia, { recursive: true, force: true });
    }
    throw error;
  }
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

//=========================================================================================//*
//=========================================================================================//*
//=================================== MAIN IPC DOWNLOAD ===================================//*
//=========================================================================================//*
//=========================================================================================//*

ipcMain.handle('download-media', (event, data) => {
  const controller = new AbortController();
  const entry = { controller, promise: null };
  entry.promise = performDownload(data, controller.signal);
  activeDownloads.add(entry);
  entry.promise.finally(() => activeDownloads.delete(entry));
  return entry.promise;
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
      downloads.push(metadata.media);
    } catch (error) {
      // Corrupt metadata: This entry is ignored
    }
  }
  return downloads;
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
  try {
    const metadataPath = path.join(downloadsRootPath, String(mediaId), FILE_METADATA);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    return metadata.info;
  } catch(error) {
    throw error;
  }
});

ipcMain.handle('get-all-episodes', (event, data) => {
  try {
    const downloads = [];
    const { seriesId, seasonId } = data;
    const seasonPath = path.join(downloadsRootPath, String(seriesId), String(seasonId));
    if (fs.existsSync(seasonPath)) {
        const entries = fs.readdirSync(seasonPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const metadataPath = path.join(seasonPath, entry.name, FILE_METADATA);
          if (!fs.existsSync(metadataPath)) continue;
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
            downloads.push( metadata.episode );
          } catch (error) {
            // Corrupt metadata: This entry is ignored
          }
        }
    }
    return downloads.sort((a, b) => a.episodeNumber - b.episodeNumber);
  } catch(error) {
    throw error;
  }
});

ipcMain.handle('delete-download', (event, data) => {
  const promise = performDeleteDownload(data);
  activeDeletions.add(promise);
  promise.finally(() => activeDeletions.delete(promise));
  return promise;
});

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
    deletedEntries.push({ key: `${MediaType.SERIES}-${mediaId}`, fileName: media.title, episode: null });
    removeDownloadDir(mediaDir);
  } else if (needsSeason) {
    if (mediaType === MediaType.EPISODE) {
      const episodeDir = path.join(mediaDir, String(seasonId), String(episodeId));
      const metadata = readMetadataFile(path.join(episodeDir, FILE_METADATA));
      const fileName = metadata && metadata.videoPath ? path.basename(metadata.videoPath) : null;
      const episode = metadata ? metadata.episode ?? null : null;
      removeDownloadDir(episodeDir);
      deletedEntries.push({ key: `${MediaType.EPISODE}-${episodeId}`, fileName, episode });
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
      deletedEntries.push({ key: `${MediaType.SERIES}-${mediaId}`, fileName: media.title, episode: null });
      removeDownloadDir(mediaDir);
    }
  } else {
    throw new Error(`Unsupported media type to delete: ${mediaType}`);
  }

  return { entries: deletedEntries, media };
}

//=========================================================================================//
//=========================================================================================//
//===================================== TOKEN STORAGE =====================================//
//=========================================================================================//
//=========================================================================================//
async function getToken() {
  return keytar.getPassword(SERVICE, ACCOUNT);
}
ipcMain.handle('secureStore:setRefreshToken', async (_e, token) => {
  keytar.setPassword(SERVICE, ACCOUNT, token)
});
ipcMain.handle('secureStore:getRefreshToken', async () =>
  getToken()
);
ipcMain.handle('secureStore:deleteRefreshToken', async () =>
  keytar.deletePassword(SERVICE, ACCOUNT)
);

//=========================================================================================//
//=========================================================================================//
//===================================== CHOCO PLAYER ======================================//
//=========================================================================================//
//=========================================================================================//
function stopCSharpProcess(force = false) {
  return new Promise((resolve) => {
    if (!csharpProcess || csharpProcess.killed) {
      csharpProcess = null;
      return resolve();
    }

    csharpProcess.once('close', () => {
      csharpProcess = null;
      resolve();
    });

    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${csharpProcess.pid} /T ${force ? '/F' : ''}`);
      } else {
        csharpProcess.kill('SIGTERM');
      }
    } catch (e) {
      csharpProcess = null;
      resolve();
    }
  });
}

ipcMain.handle('launch-choco-player', async (event, dataObject) => {
  try {
        
    mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.LAUNCHING });

    if (currentChocoPlayer?.MediaId === dataObject.MediaId && currentChocoPlayer?.EpisodeId === dataObject.EpisodeId) {
      return null;
    }
    // Vérifier si un processus est déjà en cours d'exécution
    if (csharpProcess && !csharpProcess.killed) {
      await stopCSharpProcess(true);
      if (mediaLaunched.type === MediaType.MOVIE) {
        mainWindow.webContents.send('choco-player-status', { MediaId: mediaLaunched.id ?? 0 });
      } else if (mediaLaunched.type === MediaType.SERIES) {
        mainWindow.webContents.send('choco-player-status', { EpisodeId: mediaLaunched.id ?? 0 });
      }
    }

    mediaLaunched.id = 0;
    mediaLaunched.type = MediaType.OTHER;

    if (dataObject.MediaType === MediaType.MOVIE) {
      mediaLaunched.id = dataObject.MediaId;
      mediaLaunched.type = dataObject.MediaType;
    } else if (dataObject.MediaType === MediaType.SERIES) {
      mediaLaunched.id = dataObject.EpisodeId;
      mediaLaunched.type = dataObject.MediaType;
    }

    currentChocoPlayer = dataObject;
    const bounds = mainWindow.getBounds();
    dataObject.BaseUrl = process.env.API_URL;
    dataObject.PositionX = bounds.x;
    dataObject.PositionY = bounds.y;
    dataObject.IsMaximized = mainWindow.isMaximized();
    dataObject.IsFullScreen = mainWindow.isFullScreen();
    dataObject.Token = await keytar.getPassword(SERVICE, ACCOUNT);
    dataObject.HEADER_NAME = process.env.HEADER_NAME_FIELD_SECRET_API;
    dataObject.HEADER_SECRET = process.env.HEADER_SECRET_API;
    dataObject.WatchProgress = dataObject.WatchProgress ?? 0;

    let csharpAppPath = '';
    if (app.isPackaged) {
      csharpAppPath = path.join(process.resourcesPath, 'ChocoPlayer', 'ChocoPlayer.exe');
    } else {
      csharpAppPath = path.join(
        __dirname,
        'ChocoPlayer', 'bin', 'Debug', 'net9.0-windows', 'ChocoPlayer.exe'
      );
    }

    const jsonString = JSON.stringify(dataObject);

    csharpProcess = spawn(
      csharpAppPath,
      [jsonString],
      {
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    // csharpProcess.on('spawn', () => {
    //   if (mainWindow && !mainWindow.isDestroyed()) {
    //     mainWindow.webContents.send('choco-player-status', { ...dataObject, status: ProcessStatus.LAUNCHING });
    //   }
    // });
  
    csharpProcess.stdout.on('data', async (data) => {
      const stdoutBuffer = data.toString();

      const lines = stdoutBuffer.split('\n');

      for (const rawLine of lines) {
        const message = rawLine.trim();
        if (!mainWindow || mainWindow.isDestroyed()) return;

        if (message.startsWith(NEW_EPISODE_ID) && mediaLaunched.type === MediaType.SERIES) {
          const id = Number(message.split(' : ')[1].trim());
          mediaLaunched.id = id;
          continue;
        }

        if (Object.values(ProcessStatus).includes(message)) {
          mainWindow.webContents.send('choco-player-status', { status: message });
          continue;
        } else if (message.startsWith(UPDATE_PROGRESS)) {
          const id = Number(message.split(' : ')[2].trim());
          if (message.includes(MediaType.MOVIE)) {
            mainWindow.webContents.send('choco-player-status', { MediaId: id });
            continue;
          } else if (message.includes(MediaType.EPISODE)) {
            mainWindow.webContents.send('choco-player-status', { EpisodeId: id });

            continue;
          }
        }
      }

    });

    // csharpProcess.stderr.on('data', (data) => {
    // });

    csharpProcess.on('close', (code) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.CLOSED });
      }
      currentChocoPlayer = null;
      csharpProcess = null;
    });

    csharpProcess.on('error', (err) => {
      csharpProcess = null;
    });

    return 'C# Player launched';
  } catch (err) {
    mainWindow.webContents.send('choco-player-status', { status: ProcessStatus.CLOSED });
    throw new Error(err.message);
  }
});

//=========================================================================================//*
//=========================================================================================//*
//=================================== MAIN APPLICATION ===================================//*
//=========================================================================================//*
//=========================================================================================//*
app.on('ready', createWindow);

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
  if (mainWindow.isFullScreen) {
    mainWindow.setFullScreen(false);
  }
});


ipcMain.handle('delete-cache', async () => {
  const ses = session.defaultSession;

  ses.clearCache().then(() => {
  });

  ses.clearStorageData({
    storages: ['cookies', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers'],
    quotas: ['temporary', 'persistent', 'syncable']
  }).then(() => {
  });
})

ipcMain.handle('reload-app', async () => {
  await stopCSharpProcess(true);
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
  const needsCleanup = (csharpProcess && !csharpProcess.killed) || hasActiveDownloads() || hasActiveDeletions();

  if (!needsCleanup) return;

  event.preventDefault();
  isQuitting = true;

  try {
    if (csharpProcess && !csharpProcess.killed) {
      await stopCSharpProcess(true);
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