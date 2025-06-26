import { Command, CommandEvent } from "@commands/types";
import GamesManager from "./manager";

export type GamesCommandPayload = GamesActionList | GamesActionWithId | GameActionInstall;
export type GamesCommandOutput = Game[] | string[] | string | null | void;
export type GamesCommandName = "games";
export type GamesCommand = Command<GamesCommandPayload, Game[], GamesCommandName>;
export type GamesCommandEvent = CommandEvent<GamesCommandPayload, GamesCommandName>;
export type Game = {
  id: string;
  category: string;
  name: string;
  normalName?: string;
  magnetUri: string;
  size: number;
  packageName?: string;
  version?: number;
  lastUpdated?: string;
  completionOn: number;
};

export type GamesActionList = {
  action: "list" | "listDownloaded";
};

export type GamesActionWithId = {
  action: "download" | "uninstall" | "removeDownload" | "cancel" | "listObbFiles" | "getLocalFiles";
  id: string;
};

export type GameActionInstall = {
  action: "install";
  id: string;
  justMissing?: boolean;
};

export type DownloadProgress = {
  url: string;
  bytesReceived: number;
  bytesTotal: number;
  percent: number;
};

export type GameStatusInfo = (
  | {
      status: "downloaded" | "unzipping" | "installed" | "none" | "cancelling";
    }
  | {
      status: "error";
      message: string;
    }
  | ({
      status: "downloading";
      speed: string;
      files: DownloadProgress[];
    } & DownloadProgress)
  | {
      status: "installing";
      installingFile: string;
    }
  | {
      status: "pushing app data";
      totalFiles: number;
      file: {
        index: number;
        name: string;
      };
    }
) & { id: string };

export type GameStatusType = GameStatusInfo["status"];

export default {
  type: "games",
  receiver: async function (payload: GamesCommandPayload): Promise<GamesCommandOutput> {
    if (payload.action === "list") {
      await GamesManager.update();
      return GamesManager.listGames();
    } else if (payload.action === "listDownloaded") {
      return GamesManager.getDownloadedGames();
    } else if (payload.action === "install") {
      return GamesManager.install(payload.id, payload.justMissing);
    }

    payload = payload as GamesActionWithId;
    return GamesManager[payload.action](payload.id);
  },
} as GamesCommand;
