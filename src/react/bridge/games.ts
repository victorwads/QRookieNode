import bridge from ".";

import type { Game, GamesCommandName, GamesCommandPayload } from "@server/commands/types";
export type { Game } from "@server/commands/types";

const cacheKey = "games";

class GamesManager {
  private cache: Game[];

  constructor() {
    try {
      this.cache = JSON.parse(localStorage.getItem(cacheKey) || "[]");
    } catch (e) {
      console.error("Failed to load games cache", e);
      this.cache = [];
    }
  }

  public getCache(): Game[] {
    return this.cache;
  }

  public getGameFromCache(packageName: string): Game | null {
    return this.cache.find(game => game.packageName === packageName) || null;
  }

  public getGameFromCacheById(id: string): Game | null {
    return this.cache.find(game => game.id === id) || null;
  }

  public async getGames(): Promise<Game[]> {
    this.cache = await bridge.sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: "games",
      payload: { action: "list" },
    });
    localStorage.setItem(cacheKey, JSON.stringify(this.cache));
    return this.cache;
  }

  public async install(id: string, justMissing: boolean = false): Promise<string | null> {
    return await bridge.sendCommand<GamesCommandName, GamesCommandPayload, string | null>({
      type: "games",
      payload: { action: "install", justMissing, id },
    });
  }

  public async uninstall(id: string) {
    return await bridge.sendCommand<GamesCommandName, GamesCommandPayload, string | null>({
      type: "games",
      payload: { action: "uninstall", id },
    });
  }

  public async getObbFileList(id: string): Promise<string[]> {
    return await bridge.sendCommand<GamesCommandName, GamesCommandPayload, string[]>({
      type: "games",
      payload: { action: "listObbFiles", id },
    });
  }
}

const gamesManager = new GamesManager();
export default gamesManager;
