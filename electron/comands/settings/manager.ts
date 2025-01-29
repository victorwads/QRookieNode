import * as fs from "fs";
import * as path from "path";
import { dialog } from "electron";

import type { Settings } from ".";
import { gamesDir, userDataDir } from "../dirs";

const settingsPath = path.join(userDataDir, "settings.json");
const gamesDirName = "RookieNodeGames"

class SettingsManager {
  private settings: Settings = {};

  constructor() {
    this.settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, "utf-8")) : {};
  }

  public async setDownloadsDir() {
    const result = await dialog.showOpenDialog({
      title: "Select downloads dir",
      properties: ["openDirectory"],
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      this.settings.downloadsDir = selectedPath;
      fs.mkdirSync(path.join(selectedPath, gamesDirName), { recursive: true });
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

  private save() {
    fs.writeFileSync(settingsPath, JSON.stringify(this.settings));
  }
}

export default new SettingsManager();
