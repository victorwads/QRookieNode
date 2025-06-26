import * as fs from "fs";
import * as path from "path";

import { appDataDir, buildRoot, gamesDir, gamesDirName } from "@server/dirs";
import log from "@server/log";
import SystemProcess from "@server/systemProcess";
import type { Settings, SystemHealth } from ".";

export const appVersion = JSON.parse(
  fs.readFileSync(path.join(buildRoot, "package.json"), "utf-8")
).version;

const settingsPath = path.join(appDataDir, "settings.json");
const { showOpenDialog } = (function () {
  if (process.versions.electron) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return { showOpenDialog: require("electron").dialog.showOpenDialog };
  }
  return { showOpenDialog: () => ({ canceled: true, filePaths: [] }) };
})();

class SettingsManager extends SystemProcess {
  private settings: Settings = {};

  constructor() {
    super();
    this.settings = fs.existsSync(settingsPath)
      ? JSON.parse(fs.readFileSync(settingsPath, "utf-8"))
      : {};
    this.createDownloadsDir();
  }
  private createDownloadsDir() {
    if (!fs.existsSync(this.getDownloadsDir())) {
      fs.mkdirSync(this.getDownloadsDir(), { recursive: true });
    }
  }

  public async setDownloadsDir() {
    const result = await showOpenDialog({
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
      ...this.settings,
      ...(process.env.ROOKIE_DOWNLOADS_DIR ? { downloadsDir: this.getDownloadsDir() } : {}),
    };
  }

  public getDownloadsDir(): string {
    if (process.env.ROOKIE_DOWNLOADS_DIR && fs.existsSync(process.env.ROOKIE_DOWNLOADS_DIR)) {
      return process.env.ROOKIE_DOWNLOADS_DIR;
    }
    if (this.settings.downloadsDir && fs.existsSync(this.settings.downloadsDir)) {
      return path.join(this.settings.downloadsDir, gamesDirName);
    }
    return gamesDir;
  }

  private async getCommandInfo(
    path: string | null,
    name: string,
    lines: number,
    arg: string = "-h"
  ): Promise<string> {
    if (!path) {
      return "Not found, Please install " + name;
    }
    const { stdout } = await this.runCommand(path, [arg]);
    return path + "\n" + stdout.split("\n").slice(0, lines).join("\n");
  }

  private static systemHealthCache: Promise<SystemHealth> | null = null;

  public async getSystemHealth(): Promise<SystemHealth> {
    if (!SettingsManager.systemHealthCache) {
      SettingsManager.systemHealthCache = this.getSystemHealthInternal();
    }
    return SettingsManager.systemHealthCache;
  }

  private async getSystemHealthInternal(): Promise<SystemHealth> {
    const asyncResults = {
      adb: this.getCommandInfo(await this.getAdbPath(), "adb", 2, "version"),
      unzip: this.getCommandPath("unzip").then(path => this.getCommandInfo(path, "unzip", 1)),
      sevenZip: this.getSevenZipPath().then(path => this.getCommandInfo(path, "7zip", 2)),
      java: this.getCommandPath("java").then(path =>
        this.getCommandInfo(path, "java", 3, "--version")
      ),
    };

    return {
      appVersion,
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
