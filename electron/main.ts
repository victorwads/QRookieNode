import { app, BrowserWindow, net, protocol } from "electron";
import path from "path";
import fs from "fs";

import "./comands";
import { setupMenu } from "./features/menu";
import { downloadDir } from "./comands/dirs";

let mainWindow: BrowserWindow|null = null;

export function getMainWindow(): BrowserWindow|null {
  return mainWindow;
}

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/react/index.html'));
    setupMenu();
  }

  mainWindow.on('closed', () => { mainWindow = null;});
};

app.whenReady().then(() => {
  protocol.handle('game-image', (request) => {
    const packageName = decodeURIComponent(request.url.replace("game-image://", ""));
    let filePath = path.join(downloadDir, ".meta", "thumbnails", packageName + ".jpg");
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, '../../assets/images/matrix.png');
    }
    return net.fetch('file://' + path.normalize(filePath));
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createMainWindow);
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});