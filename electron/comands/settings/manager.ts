import * as fs from "fs";
import * as path from "path";
import { app, dialog } from "electron";

import type { Settings, SystemHelth } from ".";
import log from "../../log";
import { gamesDir, gamesDirName, userDataDir } from "../dirs";

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
      log.debug("Selected downloads dir:", selectedPath);
    }
    this.save();
  }

  public get(): Settings {
    return {
      downloadsDir: this.getDownloadsDir(),
      ...this.settings
    };
  }

  public getDownloadsDir(): string {
    if(process.env.ROOKIE_DOWNLOADS_DIR && fs.existsSync(process.env.ROOKIE_DOWNLOADS_DIR)) {
      return process.env.ROOKIE_DOWNLOADS_DIR;
    }
    if (this.settings.downloadsDir && fs.existsSync(this.settings.downloadsDir)) {
      return path.join(this.settings.downloadsDir, gamesDirName);
    }
    return gamesDir;
  }

  private async getCommandInfo(path: string|null, name: string, lines: number, arg: string = "-h"): Promise<string> {
    if (!path) {
      return "Not found, Please install " + name;
    }
    const { stdout } = await this.runCommand(path, [arg]);
    return path + "\n" +
      stdout.split("\n").slice(0, lines).join("\n");
  }

  public async getSystemHelth(): Promise<SystemHelth> {
    const asyncResults = {
      adb: this.getCommandInfo(this.getAdbPath(), "adb", 2, "version"),
      unzip: this.getCommanPath('unzip').then(path => this.getCommandInfo(path, "unzip", 1)),
      sevenZip: this.getCommandInfo(this.getSevenZipPath(), "7zip", 2),
      java: this.getCommanPath('java').then(path => this.getCommandInfo(path, "java", 3, "--version")),
    }
    return {
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      bundledNodeVersion: process.versions.node,
      adb: await asyncResults.adb,
      unzip: await asyncResults.unzip,
      sevenZip: await asyncResults.sevenZip,
      java: await asyncResults.java,
    };
  }

  private save() {
    fs.writeFileSync(settingsPath, JSON.stringify(this.settings));
  }
}

export default new SettingsManager();
