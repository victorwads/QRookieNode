import sendCommand from '../bridge';
import type { Game, GamesCommandName, GamesCommandPayload } from '../../electron/shared';
export type { Game } from '../../electron/shared';

class GamesManager {
  private cache: Game[] = [];

  public getCache(): Game[] {
    return this.cache;
  }

  public getGameFromCache(packageName: string): Game | null {
    return this.cache.find((game) => game.packageName === packageName) || null;
  }

  public async getGames() {
    this.cache = await sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
      payload: {
        action: 'list',
      },
    });
    return this.cache;
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