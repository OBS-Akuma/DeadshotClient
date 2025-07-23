const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

// GPU and performance related switches
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

let splashWindow;
let mainWindow;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  splashWindow.loadFile('splash.html');
  splashWindow.once('ready-to-show', () => splashWindow.show());
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    fullscreen: true,      // <-- Start in fullscreen
    autoHideMenuBar: true, // <-- Hide menu bar (even on Alt)
    icon: path.join(__dirname, 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      sandbox: false,
    },
    title: 'Deadshot',
  });

  // Intercept navigation to changelog and redirect to local patchnotes.html
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.includes('https://deadshot.io/changelog.html')) {
      event.preventDefault();
      mainWindow.loadFile(path.join(__dirname, 'patchnotes.html'));
    }
  });

  // Intercept new window/open attempts to changelog URL and open local patchnotes instead
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('https://deadshot.io/changelog.html')) {
      mainWindow.loadFile(path.join(__dirname, 'patchnotes.html'));
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.loadURL('https://deadshot.io/');

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      img {
        position: relative !important;
        left: -1000px !important;
        border: none !important;
        outline: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      img:not([src]), img[src=""], img[src^="https://grabify.link/images/pixel.png"] {
        display: none !important;
      }
      a:has(img:only-child) {
        display: none !important;
      }
      a {
        border: none !important;
        outline: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
    `);

    // Show main window after 5 seconds, close splash
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
      mainWindow.show();
    }, 5000);
  });
}

app.whenReady().then(() => {
  // Block common ad/tracking domains
  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: [
        "*://*/*.ads*",
        "*://*/ads/*",
        "*://*.doubleclick.net/*",
        "*://*.googlesyndication.com/*",
        "*://*.adservice.google.com/*",
        "*://*.adnxs.com/*",
        "*://*.pubmatic.com/*",
        "*://track.wargaming-aff.com/*",
        "*://cdn1.vntsm.com/*"
      ]
    },
    (details, callback) => {
      console.log("[AdBlock] Blocking:", details.url);
      callback({ cancel: true });
    }
  );

  createSplashWindow();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
