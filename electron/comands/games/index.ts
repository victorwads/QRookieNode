import { Command, CommandEvent } from "../../shared";
import GamesManager from "./manager";

export type GamesCommandPayload = GamesActionList | GamesActionWithId;
export type GamesCommandOutput = Game[] | string[] | string | null | void;
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

export type DownloadInfo = ({
  status: 'downloaded' | 'unzipping' | 'installed' | 'none';
} | {
  status: 'error';
  message: string;
} | ({
  status: 'downloading'
  files: DownloadProgress[];
} & DownloadProgress) | {
  status: 'installing' | 'pushing app data',
  installingFile: string;
}) & { id: string; }

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
      return GamesManager.remove(payload.id);
    } else if (payload.action === 'install') {
      return GamesManager.install(payload.id);
    }
    return [];
  }
} as GamesCommand;
