import sendCommand from '../bridge';
import type { Game, GamesCommandName, GamesCommandPayload } from '../../electron/shared';
export type { Game } from '../../electron/shared';

const cacheKey = 'games';

class GamesManager {
  private cache: Game[];

  constructor() {
    this.cache = JSON.parse(localStorage.getItem(cacheKey) || '[]');
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
    this.cache = await sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
      payload: {
        action: 'list',
      },
    });
    localStorage.setItem(cacheKey, JSON.stringify(this.cache));
    return this.cache;
  }

  public async getDownloadedGames(): Promise<string[]> {
    return await sendCommand<GamesCommandName, GamesCommandPayload, string[]>({
      type: 'games',
      payload: {
        action: 'listDownloaded',
      },
    })
  }

  public downloadGame(game: Game) {
    sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
      payload: {
        action: 'download',
        game,
      },
    });
  }
}

export default new GamesManager();