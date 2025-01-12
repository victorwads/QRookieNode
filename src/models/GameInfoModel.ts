import { GameInfo } from './GameInfo';

export class GameInfoModel {
  private games: GameInfo[] = [];

  public addGame(game: GameInfo): void {
    this.games.push(game);
  }

  public getGames(): GameInfo[] {
    return this.games;
  }
}