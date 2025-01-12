import { Command, CommandEvent } from "../../shared";
import Game from "./game";
import GamesManager from "./manager";

export type GamesCommandPayload = object
export type GamesCommandName = 'games';
export type GamesCommand = Command<GamesCommandPayload, Game[], GamesCommandName>;
export type GamesCommandEvent = CommandEvent<GamesCommandPayload, GamesCommandName>

export default {
  type: 'games',
  receiver: async function () {
    await GamesManager.update();
    return GamesManager.listGames();
  }
} as GamesCommand;
