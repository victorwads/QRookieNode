import { app, BrowserWindow, protocol } from "electron";
import path from "path";

import setupBridge from "./comands";
import { setupMenu } from "./features/menu";

let mainWindow;

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
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/react/index.html'));
    setupMenu();
  }
  setupBridge();

  mainWindow.on('closed', () => { mainWindow = null;});
};

app.whenReady().then(() => {
  protocol.registerFileProtocol("local-file", (request, callback) => {
    const url = request.url.replace("local-file:///", "");
    const decodedPath = decodeURIComponent(url);
    callback(path.normalize(decodedPath));
  });
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