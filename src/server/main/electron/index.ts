import { app, session, BrowserWindow } from "electron";
import { installExtension, REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import path from "path";

import "./bridge";
import { setupMenu } from "./menu";

import { resourcesDir } from "@server/dirs";

const isDev = process.env.NODE_ENV === "development";

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

let mainWindow: BrowserWindow | null = null;

const createMainWindow = () => {
  const isHeadless = process.argv.includes("--headless");
  if (isHeadless) return;

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    void mainWindow.loadURL("http://localhost:3000");
  } else {
    void mainWindow.loadFile(path.join(resourcesDir, "dist/react/index.html"));
  }

  setupMenu();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.on("ready", async () => {
  await loadDevTools();
  createMainWindow();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Loads the React Developer Tools extension for the specified Electron session
 * if the application is running in development mode.
 *
 * We have to create a hidden BrowserWindow and load the React Developer Tools
 * extension into it. We then wait for React DevTools to load a service worker
 * before closing the window. This hack is necessary, otherwise React DevTools
 * will not be loaded when the main window is created.
 *
 * This process usually only lasts 100ms and we only do this in dev mode.
 */
async function loadDevTools() {
  if (!isDev) return;

  await installExtension([REACT_DEVELOPER_TOOLS]);

  const win = new BrowserWindow({
    show: false,
    webPreferences: { devTools: true },
  });
  await win.loadURL("about:blank");
  win.webContents.openDevTools({ mode: "detach", activate: false });

  await new Promise<void>((resolve, reject) => {
    let checksLeft = 30;
    const interval = setInterval(() => {
      const all = session.defaultSession.serviceWorkers.getAllRunning();
      if (Object.keys(all).length > 0) {
        clearInterval(interval);
        resolve();
      } else {
        checksLeft -= 1;
        if (checksLeft <= 0) {
          clearInterval(interval);
          reject(new Error("react dev tools failed to load a service worker"));
        }
      }
    }, 100);
  });
  win.close();
}
