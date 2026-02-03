const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const path = require('path');
const url = require('url');
const keytar = require('keytar');
const { exec } = require('child_process');
const { spawn } = require("child_process");

const SERVICE = 'my-app-auth';
const ACCOUNT = 'refresh-token';

let mainWindow;
let csharpProcess = null;

function createWindow() {
  // Création de la fenêtre principale
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
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
    },
    icon: path.join(__dirname, 'dist/choco-plus/browser/icon.ico'),
  });

  // Charger l'application Angular
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/choco-plus/browser/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Ouvrir les outils de développement si nécessaire
  //mainWindow.webContents.openDevTools();

  // Suppression de la barre de menu
  mainWindow.setMenu(null);

  // Gestion de la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-unmaximized');
  });
}

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

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mkv'] },
    ],
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
        console.error(`Erreur : ${error.message}`);
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
    console.log('Cache vidé');
  });

  ses.clearStorageData({
    storages: ['cookies', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers'],
    quotas: ['temporary', 'persistent', 'syncable']
  }).then(() => {
    console.log('Données de stockage supprimées');
  });
})

ipcMain.handle('reload-app', async () => {
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

ipcMain.handle('secureStore:setRefreshToken', async (_e, token) => {
  keytar.setPassword(SERVICE, ACCOUNT, token)
});
ipcMain.handle('secureStore:getRefreshToken', async () =>
  keytar.getPassword(SERVICE, ACCOUNT)
);
ipcMain.handle('secureStore:deleteRefreshToken', async () =>
  keytar.deletePassword(SERVICE, ACCOUNT)
);


ipcMain.handle('launch-java-app', async (event, dataObject) => {
  try {
    await stopCSharpProcess(true);

    const bounds = mainWindow.getBounds();
    dataObject.PositionX = bounds.x;
    dataObject.PositionY = bounds.y;
    dataObject.IsMaximized = mainWindow.isMaximized();
    dataObject.IsFullScreen = mainWindow.isFullScreen();
    dataObject.Token = await keytar.getPassword(SERVICE, ACCOUNT);

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

    csharpProcess.stdout.on('data', (data) => {
      //console.log(`C# stdout: ${data}`);
    });

    csharpProcess.stderr.on('data', (data) => {
      //console.error(`C# stderr: ${data}`);
    });

    csharpProcess.on('close', (code) => {
      //console.log(`C# process exited with code ${code}`);
      csharpProcess = null;
    });

    csharpProcess.on('error', (err) => {
      //console.error('Failed to start C# process:', err);
      csharpProcess = null;
    });

    return 'C# Player lancé';
  } catch (err) {
    throw new Error(err.message);
  }
});

app.on('before-quit', async (event) => {
  if (csharpProcess && !csharpProcess.killed) {
    event.preventDefault();
    await stopCSharpProcess(true);
    app.quit();
  }
});

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