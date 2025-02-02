import * as crypto from 'crypto';

import vrpManager from './vrpManager';
import HttpDownloader from "./httpDownloader";
import type { Game } from "./";

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
    // vrpManager.remove(id);
  }
}

const manager = new GameManager();
export default manager;