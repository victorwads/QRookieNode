import { app, BrowserWindow } from "electron";
import path from "path";

import "./bridge";
import { setupMenu } from "./menu";

import { resourcesDir } from "@server/dirs";

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

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(resourcesDir, "dist/react/index.html"));
    setupMenu();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.on("ready", createMainWindow);
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
