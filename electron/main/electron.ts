import { app, BrowserWindow } from "electron";
import path from "path";

import "../comands";
import { setupMenu } from "./electron/menu";

let mainWindow: BrowserWindow|null = null;

export function getMainWindow(): BrowserWindow|null {
  return mainWindow;
}

const createMainWindow = () => {
  const isHeadless = process.argv.includes("--headless");
  if (isHeadless)
    return

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron', 'preload.js'),
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