import { Command, CommandEvent } from "../../shared";
import Game from "./game";
import GamesManager from "./manager";

interface ListAction {
  action: 'list';
}
interface DownloadAction {
  action: 'download';
  game: Game;
}

export type GamesCommandPayload = ListAction | DownloadAction;
export type GamesCommandName = 'games';
export type GamesCommand = Command<GamesCommandPayload, Game[], GamesCommandName>;
export type GamesCommandEvent = CommandEvent<GamesCommandPayload, GamesCommandName>

export default {
  type: 'games',
  receiver: async function (payload: GamesCommandPayload): Promise<Game[]> {
    if (payload.action === 'list') {
      await GamesManager.update();
      return GamesManager.listGames();
    } else if (payload.action === 'download') {
      GamesManager.download(payload.game);
    }
    return [];
  }
} as GamesCommand;
