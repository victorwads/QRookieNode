export interface VRPTorrent {
    startDownload(torrentUrl: string): Promise<void>;
    stopDownload(torrentId: string): Promise<void>;
}