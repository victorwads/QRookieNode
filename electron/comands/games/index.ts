import { Command, CommandEvent } from "../../shared";
import GamesManager from "./manager";

export type GamesCommandPayload = GamesActionList | GamesActionDownload;
export type GamesCommandName = 'games';
export type GamesCommand = Command<GamesCommandPayload, Game[], GamesCommandName>;
export type GamesCommandEvent = CommandEvent<GamesCommandPayload, GamesCommandName>
export type Game = {
  id: string;
  category: string;
  name: string;
  normalName?: string
  magnetUri: string;
  size: number;
  packageName?: string;
  version?: string;
  lastUpdated?: string;
  completionOn: number;
}

export type GamesActionList = {
  action: 'list' | 'listDownloaded';
}

export type GamesActionDownload = {
  action: 'download';
  game: Game;
}

export type DownloadProgress = {
  url: string;
  bytesReceived: number;
  bytesTotal: number;
  percent: number;
}

export type DownloadInfo = {
  id: string;
  files: DownloadProgress[];
} & DownloadProgress;

export default {
  type: 'games',
  receiver: async function (payload: GamesCommandPayload): Promise<Game[]> {
    if (payload.action === 'list') {
      await GamesManager.update();
      return GamesManager.listGames();
    } else if (payload.action === 'listDownloaded') {
      return GamesManager.getDownloadedGames();
    } else if (payload.action === 'download') {
      GamesManager.download(payload.game);
    }
    return [];
  }
} as GamesCommand;
