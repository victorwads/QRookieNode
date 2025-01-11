const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  mainWindow.body = 'Hello World';
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000'); // React dev server
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html')); // Arquivos de produção
  }
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

ipcMain.on('open-devtools', (event) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.openDevTools();
  }
});

app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});