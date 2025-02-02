import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

import type { Game } from "./";
import vrpManager from './vrpManager';
import adbManager from '../adb/manager';
import HttpDownloader, { extractDirName } from "./httpDownloader";
import settingsManager from '../settings/manager';

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
      console.log("Downloading games data from...", GameManager.GAMES_URL);
      const data = await this.downloader.download(GameManager.GAMES_URL);

      const json = JSON.parse(data);
      if (!Array.isArray(json)) {
        console.error("Invalid data format:", data);
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
      console.error("Error updating games:", err);
      return false;
    }
  }

  public listGames(): Game[] {
    return this.games;
  }

  public getDownloadedGames(): string[] {
    return vrpManager.getDownloadedGames()
    ;
  }

  private getGameId(releaseName: string): string {
    const hash = crypto.createHash('md5');
    hash.update(releaseName + "\n");
    return hash.digest('hex');
  }

  public download(id: string) {
    vrpManager.downloadGame(id);
  }

  public remove(id: string) {
    console.log("Removing game not implemented yet", id);
  }

  public async install(id: string): Promise<string|null> {
    const game = this.games.find((g) => g.id === id);
    if (!game) {
      return "Game not found:" + id;
    }

    const gameDir = path.join(settingsManager.getDownloadsDir(), id, extractDirName);
    const dataPath = path.join(gameDir, game.packageName || "");

    if (fs.existsSync(dataPath)) {
      return "Install games with custom app data is not supported yet\n\nThis game has " + 
        fs.readdirSync(dataPath).reduce((acc) => acc+1, 0) + " custom app data files that needed to be installed\n\n"
        + "We will support this feature soon"
      ;
    }
    const apkPath = fs.readdirSync(gameDir)
      .find((file) => file.endsWith(".apk"));

    if (!apkPath) {
      return "No apk file found on the downloaded game folder " + gameDir;
    }

    try {
      await adbManager.install(path.join(gameDir, apkPath));
    } catch (err) {
      return "Failed to install game: " + err;
    }
    return null;
  }

}

const manager = new GameManager();
export default manager;