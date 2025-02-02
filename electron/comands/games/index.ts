import { Command, CommandEvent } from "../../shared";
import GamesManager from "./manager";

export type GamesCommandPayload = GamesActionList | GamesActionWithId;
export type GamesCommandOutput = Game[] | string[];
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

export type GamesActionWithId = {
  action: 'download' | 'install' | 'removeDownload';
  id: string;
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
  receiver: async function (payload: GamesCommandPayload): Promise<GamesCommandOutput> {
    if (payload.action === 'list') {
      await GamesManager.update();
      return GamesManager.listGames();
    } else if (payload.action === 'listDownloaded') {
      return GamesManager.getDownloadedGames();
    } else if (payload.action === 'download') {
      GamesManager.download(payload.id);
    } else if (payload.action === 'removeDownload') {
      GamesManager.remove(payload.id);
    }
    return [];
  }
} as GamesCommand;
