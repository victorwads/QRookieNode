import bridge from ".";

import type { GamesCommandName, GamesCommandPayload, GameStatusInfo } from "@server/commands/types";
export type { GameStatusInfo, GameStatusType } from "@server/commands/types";

type ListenerCallback = (info: GameStatusInfo) => void;
type DownloadingListener = (info: GameStatusInfo[]) => void;

class GameDownloadManager {
  private listeners: { [id: string]: ListenerCallback[] } = {};
  private downloadingGamesChangeListeners: DownloadingListener[] = [];
  private downloadingGames: { [id: string]: GameStatusInfo } = {};
  private downloadedCache: string[] = [];

  constructor() {
    bridge.registerGameStatusReceiver((info: GameStatusInfo) => {
      void this.emit(info.id, info);
    });
    void this.getDownloadedGames();
  }

  public addListener(id: string, callback: ListenerCallback) {
    if (!this.listeners[id]) {
      this.listeners[id] = [];
    }
    this.listeners[id].push(callback);
    callback(this.getGameStatusInfo(id) || { id, status: "none" });

    return () => {
      this.removeListener(id, callback);
    };
  }

  public removeListener(id: string, callback: ListenerCallback) {
    if (!this.listeners[id]) return;

    this.listeners[id] = this.listeners[id].filter(listener => listener !== callback);

    if (this.listeners[id].length === 0) {
      delete this.listeners[id];
    }
  }

  public addDownloadingListener(callback: DownloadingListener) {
    this.downloadingGamesChangeListeners.push(callback);
    callback(Object.values(this.downloadingGames));

    return () => {
      this.removeDownloadingListener(callback);
    };
  }

  public removeDownloadingListener(callback: DownloadingListener) {
    this.downloadingGamesChangeListeners = this.downloadingGamesChangeListeners.filter(
      listener => listener !== callback
    );
  }

  public emitDownloading() {
    this.downloadingGamesChangeListeners.forEach(callback =>
      callback(Object.values(this.downloadingGames))
    );
  }

  public getGameStatusInfo(id: string): GameStatusInfo | null {
    return this.downloadingGames[id] || null;
  }

  private emit(id: string, info: GameStatusInfo) {
    this.downloadingGames[id] = info;
    if (!this.getGameStatusInfo(id)) {
      this.emitDownloading();
    }
    if (!this.getGameStatusInfo(id) || info.status !== "downloading") {
      this.emitDownloading();
    }

    if (!this.listeners[id]) return;
    this.listeners[id].forEach(callback => callback(info));
  }

  public async getDownloadedGames(): Promise<string[]> {
    const downloadedIds = await bridge.sendCommand<GamesCommandName, GamesCommandPayload, string[]>(
      {
        type: "games",
        payload: { action: "listDownloaded" },
      }
    );
    this.downloadedCache = downloadedIds;
    return downloadedIds;
  }

  public isGameDownloaded(id: string): boolean {
    return this.downloadedCache.includes(id) || this.downloadingGames[id]?.status === "downloaded";
  }

  public downloadGame(id: string) {
    void bridge.sendCommand<GamesCommandName, GamesCommandPayload>({
      type: "games",
      payload: { action: "download", id },
    });
  }

  public async remove(id: string): Promise<void> {
    await bridge.sendCommand<GamesCommandName, GamesCommandPayload>({
      type: "games",
      payload: { action: "removeDownload", id },
    });
    this.downloadedCache = this.downloadedCache.filter(gameId => gameId !== id);
    delete this.downloadingGames[id];
    this.emitDownloading();
  }

  public cancel(id: string) {
    void bridge.sendCommand<GamesCommandName, GamesCommandPayload>({
      type: "games",
      payload: { action: "cancel", id },
    });
  }

  public async getLocalFiles(id: string) {
    return await bridge.sendCommand<GamesCommandName, GamesCommandPayload, string[]>({
      type: "games",
      payload: { action: "getLocalFiles", id },
    });
  }
}

const gameDownloadManager = new GameDownloadManager();
export default gameDownloadManager;
