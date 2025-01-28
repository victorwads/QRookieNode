import sendCommand from '../bridge';
import type { Game, GamesCommandName, GamesCommandPayload } from '../../electron/shared';
export type { Game } from '../../electron/shared';

class GamesManager {
  private cache: Game[] = [];

  public getCache(): Game[] {
    return this.cache;
  }

  public async getGames() {
    return sendCommand<GamesCommandName, GamesCommandPayload, Game[]>({
      type: 'games',
      payload: {
        action: 'list',
      },
    });
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