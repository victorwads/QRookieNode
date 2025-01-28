import type { DownloadInfo } from '../../electron/shared';
export type { DownloadInfo } from '../../electron/shared';

type ListenerCallback = (info: DownloadInfo) => void;

class GameDownloadManager {
  private listeners: { [id: string]: ListenerCallback[] } = {};

  constructor() {
    const { downloads } = (window as any);
    downloads.receive((info: DownloadInfo) => {
      this.emit(info.id, info);
    });
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

  private emit(id: string, info: DownloadInfo) {
    if (!this.listeners[id]) return;

    this.listeners[id].forEach(callback => callback(info));
  }
}

export default new GameDownloadManager();
