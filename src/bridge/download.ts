import sendCommand from '../bridge';
import type { GamesCommandName, GamesCommandPayload } from '../../electron/shared';
import type { DownloadInfo } from '../../electron/shared';

export type { DownloadInfo } from '../../electron/shared';

type ListenerCallback = (info: DownloadInfo) => void;
type DownloadingListener = (info: DownloadInfo[]) => void;

class GameDownloadManager {
  private listeners: { [id: string]: ListenerCallback[] } = {};
  private downloadingGamesChangeListeners: DownloadingListener[] = [];
  private downloadingGames: { [id: string]: DownloadInfo } = {};
  private downloadedCache: string[] = [];

  constructor() {
    const { downloads } = (window as any);
    downloads.receive((info: DownloadInfo) => {
      this.emit(info.id, info);
    });
    this.getDownloadedGames();
  }

  public addListener(id: string, callback: ListenerCallback) {
    if (!this.listeners[id]) {
      this.listeners[id] = [];
    }
    this.listeners[id].push(callback);
    callback(this.getGameInfo(id) || { id, status: 'none' });

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
    this.downloadingGamesChangeListeners = this.downloadingGamesChangeListeners.filter(listener => listener !== callback);
  }

  public emitDownloading() {
    this.downloadingGamesChangeListeners.forEach(callback => 
      callback(Object.values(this.downloadingGames))
    );
  }

  public getGameInfo(id: string): DownloadInfo | null {
    return this.downloadingGames[id] || null;
  }

  private async emit(id: string, info: DownloadInfo) {
    this.downloadingGames[id] = info;
    if(!this.getGameInfo(id)) {
      this.emitDownloading();
    }
    if(!this.getGameInfo(id) || info.status !== 'downloading') {
      this.emitDownloading();
    }

    if (!this.listeners[id]) return;
    this.listeners[id].forEach(callback => callback(info));
  }

  public async getDownloadedGames(): Promise<string[]> {
    const downloadedIds = await sendCommand<GamesCommandName, GamesCommandPayload, string[]>({
      type: 'games',
      payload: {
        action: 'listDownloaded',
      },
    })
    this.downloadedCache = downloadedIds;
    return downloadedIds;
  }

  public isGameDownloaded(id: string): boolean {
    return this.downloadedCache.includes(id) || this.downloadingGames[id]?.status === 'downloaded';
  }

  public downloadGame(id: string) {
    sendCommand<GamesCommandName, GamesCommandPayload>({
      type: 'games',
      payload: {
        action: 'download',
        id,
      },
    });
  }

  public async remove(id: string): Promise<void> {
    await sendCommand<GamesCommandName, GamesCommandPayload>({
      type: 'games',
      payload: {
        action: 'removeDownload',
        id,
      },
    });
    this.downloadedCache = this.downloadedCache.filter(gameId => gameId !== id);
    delete this.downloadingGames[id];
    this.emitDownloading();
  }
}

export default new GameDownloadManager();
