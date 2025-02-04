import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

import log from '../../log';
import type { Game } from "./";
import vrpManager from './vrpManager';
import adbManager from '../adb/manager';
import HttpDownloader, { extractDirName, progress } from "./httpDownloader";
import settingsManager from '../settings/manager';
import vrpPublic from './vrpPublic';

interface WebGame {
  name?: string;
  magnet_uri?: string;
  completion_on?: string;
  hash_val?: string;
  size?: string;
  category?: string;
}

let loadedGames: boolean = false;

class GameManager {
  private games: Game[] = [];
  private downloader = new HttpDownloader();

  private static readonly GAMES_URL = "https://torrents.vrpirates.wiki/torrents.json";

  public async update(): Promise<boolean> {
    if (loadedGames) {
      return true;
    }
    try {
      log.info("Downloading games data from...", GameManager.GAMES_URL);
      const data = await this.downloader.download(GameManager.GAMES_URL);

      const json = JSON.parse(data);
      if (!Array.isArray(json)) {
        log.error("Invalid data format:", data);
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
        } as Game
      });

      loadedGames = true;
      return true;
    } catch (err) {
      log.error("Error updating games:", err);
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
    const hash = crypto.createHash('md5');
    hash.update(releaseName + "\n");
    return hash.digest('hex');
  }

  public async download(id: string) {
    const vrpInfo = await vrpPublic;
    if (!vrpInfo) {
      log.error("Failed to get VRP info");
      return;
    }

    this.downloader.downloadDir(vrpInfo.baseUri, id)    
  }

  public async remove(id: string) {
    await this.downloader.removeDownload(id);
    this.getDownloadedGames();
  }

  public async install(id: string): Promise<string|null> {
    const game = this.games.find((g) => g.id === id);
    if (!game) {
      return "Game not found:" + id;
    }

    const gameDir = path.join(settingsManager.getDownloadsDir(), id, extractDirName);
    const dataPath = path.join(gameDir, game.packageName || "");

    if (fs.existsSync(dataPath) && !game.packageName) {
      return "Game has custom app data but no game has no package name";;
    }

    const apkPath = fs.readdirSync(gameDir).find((file) => file.endsWith(".apk"));
    if (!apkPath) {
      return "No apk file found on the downloaded game folder " + gameDir;
    }

    try {
      progress({ id , status: 'installing', installingFile: apkPath });
      await adbManager.install(path.join(gameDir, apkPath));

      if (fs.existsSync(dataPath)) {
        await adbManager.createObbDir(game.packageName || "");
        const files = fs.readdirSync(dataPath);

        for(let index = 0; index < files.length; index++) {
          const name = files[index];
          if(name.endsWith(".obb"))
            continue;
          progress({ id , status: 'pushing app data', file: { index, name }, totalFiles: files.length });
          await adbManager.pushObbFile(path.join(dataPath, name), game.packageName || "");
        }
      }
    } catch (err: any) {
      progress({ id , status: 'error', message: err });
      return "Failed to install game: " + err;
    }
    progress({ id , status: 'installed'});
    return null;
  }

  public cancel(id: string): void {
    this.downloader.cancel(id);
  }
}

const manager = new GameManager();
export default manager;