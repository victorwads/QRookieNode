import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import type { Game } from ".";

import adbManager from "@commands/adb/manager";
import settingsManager from "@commands/settings/manager";
import log from "@server/log";
import HttpDownloader, { extractDirName, progress } from "./downloader";
import vrpManager from "./vrpManager";
import vrpPublic from "./vrpPublic";

interface WebGame {
  name?: string;
  magnet_uri?: string;
  completion_on?: string;
  hash_val?: string;
  size?: string;
  category?: string;
}

interface DownloadedGameFilesInfo {
  id: string;
  packageName: string;
  gameDir: string;
  dataDir?: string;
  obbFiles?: string[];
  apkFile?: string;
}

let loadedGames: boolean = false;

class GameManager {
  private games: Game[] = [];
  private downloader = new HttpDownloader();
  private lastPromise: Promise<boolean> | null = null;

  private static readonly GAMES_URL = "https://torrents.vrpirates.wiki/torrents.json";

  constructor() {
    void this.update();
  }

  public async update(): Promise<boolean> {
    if (this.lastPromise) {
      return this.lastPromise;
    }
    this.lastPromise = this.updateTask().finally(() => (this.lastPromise = null));
    return this.lastPromise;
  }

  public async updateTask(): Promise<boolean> {
    if (loadedGames) {
      return true;
    }
    loadedGames = true;
    try {
      log.info("Downloading games data from...", GameManager.GAMES_URL);
      const data = await this.downloader.download(GameManager.GAMES_URL);

      const json = JSON.parse(data);
      if (!Array.isArray(json)) {
        log.error("Invalid data format:");
        return false;
      }

      this.games = json.map((game: WebGame) => {
        const existingGame = vrpManager.getGame(game.name || "");
        return {
          id: this.getGameId(game.name || ""),
          name: game.name || "Unknown",
          magnetUri: game.magnet_uri || "",
          size: parseInt(game.size || "0"),
          completionOn: parseInt(game.completion_on || "0"),
          category: game.category || "Unknown",
          packageName: existingGame?.packageName,
          normalName: existingGame?.name,
          lastUpdated: existingGame?.lastUpdated,
          version: existingGame?.version,
        } as Game;
      });

      return true;
    } catch (err) {
      log.error("Error updating games:", err);
      loadedGames = false;
      return false;
    }
  }

  public listGames(): Game[] {
    return this.games;
  }

  public getDownloadedGames(): string[] {
    return vrpManager.getDownloadedGames();
  }

  private getGameId(releaseName: string): string {
    const hash = crypto.createHash("md5");
    hash.update(releaseName + "\n");
    return hash.digest("hex");
  }

  public async download(id: string) {
    const vrpInfo = await vrpPublic;
    if (!vrpInfo) {
      log.error("Failed to get VRP info");
      return;
    }

    void this.downloader.downloadDir(vrpInfo.baseUri, id, await vrpPublic);
  }

  public removeDownload(id: string) {
    this.downloader.remove(id);
    this.getDownloadedGames();
  }

  public async uninstall(id: string): Promise<string | null> {
    const game = this.games.find(g => g.id === id);
    if (!game || !game.packageName) {
      return "Game not found:" + id;
    }

    await adbManager.uninstall(game.packageName);
    return null;
  }

  private getDownloadedGameInfo(id: string): DownloadedGameFilesInfo | null {
    const game = this.games.find(g => g.id === id);
    if (!game || !game.packageName) {
      return null;
    }

    const gameDir = path.join(settingsManager.getDownloadsDir(), id, extractDirName);
    const dataDir = path.join(gameDir, game.packageName || "");

    return {
      id,
      gameDir,
      dataDir: fs.existsSync(dataDir) ? dataDir : undefined,
      packageName: game.packageName,
      obbFiles: fs.existsSync(dataDir) ? fs.readdirSync(dataDir) : undefined,
      apkFile: fs.existsSync(gameDir)
        ? fs.readdirSync(gameDir).find(file => file.endsWith(".apk")) || undefined
        : undefined,
    };
  }

  public async install(id: string, justMissing: boolean = false): Promise<string | null> {
    const gameInfo = this.getDownloadedGameInfo(id);
    if (!gameInfo) {
      return "Game or package name not found:" + id;
    }

    const { gameDir, dataDir, packageName, apkFile, obbFiles } = gameInfo;

    if (!apkFile) {
      return "No apk file found on the downloaded game folder " + gameDir;
    }

    let installedObbFiles: string[] = [];
    if (justMissing) {
      installedObbFiles = await adbManager.listObbFiles(packageName);
    }

    try {
      progress({ id, status: "installing", installingFile: apkFile });
      if (!justMissing) {
        await adbManager.install(path.join(gameDir, apkFile));
      }

      if (obbFiles && dataDir) {
        adbManager.createObbDir(packageName || "");

        for (let index = 0; index < obbFiles.length; index++) {
          const name = obbFiles[index];
          progress({
            id,
            status: "pushing app data",
            file: { index, name },
            totalFiles: obbFiles.length,
          });

          if (justMissing && installedObbFiles.includes(name)) {
            continue;
          }
          await adbManager.pushObbFile(path.join(dataDir, name), packageName || "");
        }
      }
    } catch (err: any) {
      progress({ id, status: "error", message: err });
      return "Failed to install game: " + err;
    }
    progress({ id, status: "installed" });
    return null;
  }

  public cancel(id: string): void {
    void this.downloader.cancel(id);
  }

  public async listObbFiles(id: string): Promise<string[]> {
    const game = this.games.find(g => g.id === id);
    if (!game || !game.packageName) {
      return [];
    }

    return adbManager.listObbFiles(game.packageName);
  }

  public getLocalFiles(id: string): string[] {
    const gameInfo = this.getDownloadedGameInfo(id);

    if (!gameInfo) {
      return [];
    }

    return gameInfo.obbFiles || [];
  }
}

const manager = new GameManager();
export default manager;
