import * as fs from "fs";
import * as path from "path";
import { app, dialog } from "electron";

import type { Settings, SystemHelth } from ".";
import { gamesDir, gamesDirName, userDataDir } from "../dirs";

import adbManager from "../adb/manager";
import RunSystemCommand from "../runSystemCommand";

const settingsPath = path.join(userDataDir, "settings.json");

class SettingsManager extends RunSystemCommand {
  private settings: Settings = {};

  constructor() {
    super();
    this.settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, "utf-8")) : {};
    this.createDownloadsDir();
  }
  private async createDownloadsDir() {
    if (!fs.existsSync(this.getDownloadsDir())) {
      fs.mkdirSync(this.getDownloadsDir(), { recursive: true });
    }
  }

  public async setDownloadsDir() {
    const result = await dialog.showOpenDialog({
      title: "Select downloads dir",
      properties: ["openDirectory"],
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      this.settings.downloadsDir = selectedPath;
      this.createDownloadsDir();
      console.log("Selected downloads dir:", selectedPath);
    }
    this.save();
  }

  public get(): Settings {
    return this.settings;
  }

  public getDownloadsDir(): string {
    if (this.settings.downloadsDir && fs.existsSync(this.settings.downloadsDir)) {
      return path.join(this.settings.downloadsDir, gamesDirName);
    }
    return gamesDir;
  }

  public async getSystemHelth(): Promise<SystemHelth> {
    
    return {
      appVersion: app.getVersion(),
      adb: await adbManager.helthCheck(),
      unzip: (await this.getCommanPath('unzip')) || "Not found, Please install unzip",
      sevenZip: this.getSevenZipPath(),
      java: (await this.getCommanPath('java')) || "Not found, Please install java",
    };
  }

  private save() {
    fs.writeFileSync(settingsPath, JSON.stringify(this.settings));
  }
}

export default new SettingsManager();
