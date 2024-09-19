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
        },
        icon: __dirname + "/icon.png",
        frame: true,
    });
    
    // Remove cookies on startup if CLI parameter is activated
    if (process.argv.includes('--clear-cookies')) {
        session.defaultSession.clearStorageData({ storages: ['cookies'] }).then(() => {
            console.log('Cookies cleared');
        }).catch((error) => {
            console.error('Failed to clear cookies:', error);
        });
    }
    
    // Set a valid user agent
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    mainWindow.webContents.setUserAgent(userAgent);

    // Allow certain URLs to open new windows
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        return { action: 'allow' };
    });

    // Load SoundCloud
    mainWindow.loadURL('https://soundcloud.com');

    // Apply adblocker to prevent ads
    ElectronBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
        blocker.enableBlockingInSession(session.defaultSession);
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.log(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);