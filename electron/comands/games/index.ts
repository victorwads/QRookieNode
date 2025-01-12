import { Command, CommandEvent } from "../../shared";
import GamesManager from "./manager";

export type GamesCommandPayload = object
export type GamesCommandName = 'games';
export type GamesCommand = Command<GamesCommandPayload, string, GamesCommandName>;
export type GamesCommandEvent = CommandEvent<GamesCommandPayload, GamesCommandName>

export default {
  type: 'games',
  receiver: async function () {
    await GamesManager.update();
    return JSON.stringify(
      {
        games: GamesManager.listGames(),
      }
      , null, 2);
  }
} as GamesCommand;
