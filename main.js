const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');

app.disableHardwareAcceleration();

let mainWindow;

async function createWindow() {
    const fetch = (await import('node-fetch')).default;

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load SoundCloud
    mainWindow.loadURL('https://soundcloud.com');

    // Apply adblocker to prevent ads
    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInSession(session.defaultSession);
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);