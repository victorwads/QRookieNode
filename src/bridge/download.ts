import sendCommand from '../bridge';
import type { GamesCommandName, GamesCommandPayload } from '../../electron/shared';
import type { DownloadInfo } from '../../electron/shared';

export type { DownloadInfo } from '../../electron/shared';

type ListenerCallback = (info: DownloadInfo) => void;
type DownloadingListener = (ids: string[]) => void;

class GameDownloadManager {
  private listeners: { [id: string]: ListenerCallback[] } = {};
  private downloadingGamesChangeListeners: DownloadingListener[] = [];
  private downloadingGames: DownloadInfo[] = [];
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
    callback(this.downloadingGames.map(info => info.id));

    return () => {
      this.removeDownloadingListener(callback);
    };
  }

  public removeDownloadingListener(callback: DownloadingListener) {
    this.downloadingGamesChangeListeners = this.downloadingGamesChangeListeners.filter(listener => listener !== callback);
  }

  public emitDownloading() {
    this.downloadingGamesChangeListeners.forEach(callback => 
      callback(this.downloadingGames.map(info => info.id))
    );
  }

  public getGameInfo(id: string): DownloadInfo | null {
    return this.downloadingGames.find(info => info.id === id) || null;
  }

  private async emit(id: string, info: DownloadInfo) {
    if(this.getGameInfo(id)) {
      this.downloadingGames.push(info);
      this.emitDownloading();
    } else if(info.status !== 'downloading') {
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
    return this.downloadedCache.includes(id);
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

  public remove(id: string): void {
    sendCommand<GamesCommandName, GamesCommandPayload>({
      type: 'games',
      payload: {
        action: 'download',
        id,
      },
    });
  }
}

export default new GameDownloadManager();
