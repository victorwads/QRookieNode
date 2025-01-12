import { HttpDownloader } from "./httpDownloader";
import Game from "./game";
import vrpManager from './vrpManager';

interface WebGame {
  name?: string;
  magnet_uri?: string;
  completion_on?: string;
  hash_val?: string;
  size?: string;
  category?: string;
}

class GameManager {
  private games: Game[] = [];

  private static readonly GAMES_URL = "https://torrents.vrpirates.wiki/torrents.json";

  public async update(): Promise<boolean> {
    try {
      const downloader = new HttpDownloader();
      const data = await downloader.download(GameManager.GAMES_URL);

      const json = JSON.parse(data);
      if (!Array.isArray(json)) {
        console.error("Invalid data format:", data);
        return false;
      }

      this.games = json.map((game: WebGame) => {
        const existingGame = vrpManager.getGame(game.name || "");
        return {
          id: game.hash_val,
          name: game.name || "Unknown",
          magnetUri: game.magnet_uri || "",
          size: parseInt(game.size || "0"),
          completionOn: parseInt(game.completion_on || "0"),
          category: game.category || "Unknown",
          image: vrpManager.getGameThumbnailPath(existingGame),
          packageName: existingGame?.packageName,
          normalName: existingGame?.name,
          lastUpdated: existingGame?.lastUpdated,
          version: existingGame?.version,
        } as Game
      });

      return true;
    } catch (err) {
      console.error("Error updating games:", err);
      return false;
    }
  }

  public listGames(): Game[] {
    return this.games;
  }
}

const manager = new GameManager();
export default manager;