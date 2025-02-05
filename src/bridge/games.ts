import bridge from '../bridge';
import type { Game, GamesCommandName, GamesCommandPayload } from '../../electron/shared';
export type { Game } from '../../electron/shared';

const cacheKey = 'games';

class GamesManager {
  private cache: Game[];

  constructor() {
    try {
      this.cache = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    } catch (e) {
      console.error('Failed to load games cache', e);
      this.cache = [];
    }
  }

  public getCache(): Game[] {
    return this.cache;
  }

  public getGameFromCache(packageName: string): Game | null {
    return this.cache.find((game) => game.packageName === packageName) || null;
  }

  public getGameFromCacheById(id: string): Game | null {
    return this.cache.find((game) => game.id === id) || null;
  }

  public async getGames(): Promise<Game[]> {
    this.cache = await bridge.sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
      payload: {
        action: 'list',
      },
    });
    localStorage.setItem(cacheKey, JSON.stringify(this.cache));
    return this.cache;
  }

  public async install(id: string): Promise<string|null> {
    return await bridge.sendCommand<GamesCommandName, GamesCommandPayload, string|null>({
      type: 'games',
      payload: {
        action: 'install',
        id,
      },
    });
  }

}

export default new GamesManager();