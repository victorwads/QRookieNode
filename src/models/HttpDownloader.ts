export interface HttpDownloader {
    downloadFile(url: string, destination: string): Promise<void>;
    getFileSize(url: string): Promise<number>;
}