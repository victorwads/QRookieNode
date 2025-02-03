import * as https from "https";
import * as http2 from "http2";
import * as path from "path";
import * as fs from "fs";
import { WriteStream } from "fs";

import { GameStatusInfo, DownloadProgress } from "../../shared";
import { getMainWindow } from "../../main";
import RunSystemCommand from "../runSystemCommand";
import settingsManager from "../settings/manager";
import vrpPublic from "./vrpPublic";

export const extractDirName = "extracted";

const downloadingInfo: Record<string, GameStatusInfo> = {};
const instanceUniqId = Math.random().toString(36);

let shouldSend = true;
setInterval(() => { shouldSend = true; }, 30);

export const progress = async (info: GameStatusInfo) => {
  downloadingInfo[info.id] = info;
  if(shouldSend || info.status !==  'downloading') {
    shouldSend = false;
    getMainWindow()?.webContents.send("downloadProgress", info);
  }
}

export default class HttpDownloader extends RunSystemCommand {
  public download(url: string): Promise<string> {
    console.log(`Downloading with https: ${url}`);
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode === 200) {
            resolve(data);
          } else {
            reject(`HTTP Error: ${response.statusCode}`);
          }
        });

        response.on("error", (error) => {
          reject(error);
        });
      });
    });
  }

  public removeDownload(id: string) {
    const downloadDirectory = path.join(settingsManager.getDownloadsDir(), id);
    fs.rmSync(downloadDirectory, { recursive: true });
  }

  public async downloadFile(fileName: string, baseUrl: string, finalPath: string): Promise<boolean> {
    const tempPath = `${finalPath}`;

    if (fs.existsSync(finalPath)) {
      console.log(`File already exists: ${finalPath}`);
      return true;
    }

    const url = new URL(fileName, baseUrl);
    const headers: Record<string, string> = {
      ":method": "GET",
      ":path": url.pathname,
      "user-agent": "rclone/v1.65.2",
      accept: "*/*",
    };
    console.log(`Downloading ${url} to ${finalPath}`);
    
    return new Promise((resolve, reject) => {
      const client = http2.connect(url.origin);
      const req = client.request(headers);
      const fileStream = fs.createWriteStream(tempPath);

      req.on("response", (headers) => {
        if (headers[":status"] !== 200) {
          reject(new Error(`HTTP/2 Error: ${headers[":status"]}`));
          req.close();
          return;
        }

        req.on("data", (chunk) => {
          fileStream.write(chunk);
        });

        req.on("end", () => {
          fileStream.close();
          fs.renameSync(tempPath, finalPath);
          console.log(`Download completed: ${finalPath}`);
          resolve(true);
          client.close(); // Fecha a conexão HTTP/2
        });
      });

      req.on("error", (err) => {
        fileStream.close();
        fs.unlinkSync(finalPath); // Remove o arquivo corrompido
        reject(err);
        client.close(); // Fecha a conexão em caso de erro
      });

      req.end();
    });
  }

  private async getBodyWithHttp2(url: URL, stream?: WriteStream, progress?: (addSize: number) => void): Promise<string|boolean> {
    console.log(`Downloading: ${url}`);
    const client = http2.connect(url.origin);
    const headers: Record<string, string> = {
      ":method": "GET",
      ":path": url.pathname,
      "user-agent": "rclone/v1.65.2",
      accept: "*/*",
    };
    const req = client.request(headers);

    let body = stream ? false : "";
    await new Promise((resolve, reject) => {
      req.on("response", (headers) => {
        if (headers[":status"] !== 200) {
          reject(new Error(`HTTP/2 Error: ${headers[":status"]}`));
          req.close();
          return;
        }
        req.on("data", (chunk) => {
          progress?.(chunk.length);
          if(stream) {
            stream.write(chunk);
          } else {
            body += chunk;
          }
        });
        req.on("end", () => {
          if(stream) {
            body = true;
            stream.close();
          }
          resolve(true);
          client.close();
        });
      });
      req.on("error", (err) => {
        reject(err);
        client.close();
        if(stream) {
          stream.close();
        }
      });
      req.end();
    });
    return body;
  }

  private initDownloadFileLock(downloadPath: string) {
    fs.readdirSync(downloadPath).forEach((file) => {
      const filePath = path.join(downloadPath, file);
      const finishedPath = filePath + ".finished";
      if (file.endsWith("finished") || fs.existsSync(finishedPath)) {
        return;
      }
      fs.rmSync(filePath, { recursive: true });
    });
    fs.writeFileSync(path.join(downloadPath, instanceUniqId), new Date().toISOString());
  }

  private isLockedDownloadFile(downloadPath: string): boolean {
    return fs.existsSync(path.join(downloadPath, instanceUniqId));
  }

  private isFinishedDownloadFile(downloadPath: string): boolean {
    return fs.existsSync(path.join(downloadPath, "finished"));
  }

  private prepareDownloadIfNeeded(id: string): string|boolean {
    const downloadDirectory = path.join(settingsManager.getDownloadsDir(), id);
    if (!fs.existsSync(downloadDirectory)) {
      fs.mkdirSync(downloadDirectory, { recursive: true });
    }

    if (this.isFinishedDownloadFile(downloadDirectory)) {
      console.log(`Download already finished: ${id}`);
      return true;
    }
    if (this.isLockedDownloadFile(downloadDirectory)) {
      console.log(`Download already in progress: ${id}`);
      return true;
    }
    this.initDownloadFileLock(downloadDirectory);

    return downloadDirectory;
  }

  public async downloadDir(baseUrl: string, id: string): Promise<GameStatusInfo|null> {
    const prepareResult = this.prepareDownloadIfNeeded(id);
    const url = new URL(id + '/', baseUrl);
    let progressInfo: GameStatusInfo = {
      id, url: url.toString(),
      status: "downloading",
      speed: "loading...",
      bytesReceived: 0,
      bytesTotal: 0,
      percent: 0,
      files: [],
    }

    if(prepareResult === true) {
      progressInfo = { id, status: "downloaded" };
      progress(progressInfo);
      return progressInfo;
    }
    const downloadDirectory = prepareResult as string;
    
    progress(progressInfo);
    const {files, totalSize} = await this.getGameDownloadFiles(url);
    if (files.length === 0) {
      console.log(`Downloading Error: No files found: ${url}`);
      return null;
    }
    progressInfo.bytesTotal = totalSize;
    progressInfo.files = files;
    progress(progressInfo);

    try {
      await this.batchDownloadFiles(id, url, downloadDirectory, files, progressInfo);
    } catch (err: any) {
      progressInfo = { id, status: 'error', message: err.message };

      progressInfo.status = "error";
      progressInfo.message = err.message;
      return null;
    }

    progressInfo = { id, status: 'unzipping' };
    progress(progressInfo);
    await this.unZipDownloadedFiles(id, downloadDirectory);

    progressInfo = { id, status: 'downloaded' };
    progress(progressInfo);

    fs.writeFileSync(path.join(downloadDirectory, "finished"), new Date().toISOString());
    console.log(`Download complete: ${id}`);
    return progressInfo;
  }

  private async unZipDownloadedFiles(id: string, downloadDirectory: string) {
    await this.runCommand(this.getSevenZipPath(), [
      "x",
      "-y",
      "-o" + downloadDirectory,
      "-p" + (await vrpPublic)?.password,
      path.join(downloadDirectory, id + ".7z.001"),
    ])
    fs.readdirSync(downloadDirectory)
      .filter(item => fs.statSync(path.join(downloadDirectory, item)).isDirectory())
      .forEach(dir => {
        fs.renameSync(path.join(downloadDirectory, dir), path.join(downloadDirectory, extractDirName));
      });

    fs.readdirSync(downloadDirectory)
      .filter(item => item.startsWith(id))
      .forEach(file => {
        fs.unlinkSync(path.join(downloadDirectory, file));
      });
  }
  
  private batchDownloadFiles(
    id: string, url: URL, downloadDirectory: string,
    files: DownloadProgress[], progressInfo: GameStatusInfo
  ): Promise<void> {
    if(progressInfo.status !== 'downloading')
      return Promise.resolve();

    let resolvePromise: () => void;
    let rejectPromise: () => void;
    const finalPromise = new Promise<void>((resolve, reject) => { 
      resolvePromise = resolve as () => void; 
      rejectPromise = reject as () => void;
    });

    const queeeMaxSimultaneous = 3;
    let downloadSpeed = 0; 
    let downloadingNow = 0;
    let currentIndex = 0;

    const interval = setInterval(() => {
      progressInfo.speed = formatSpeed(downloadSpeed);
      downloadSpeed = 0;
    }, 1000);

    const downloadNext = async () => {
      if (currentIndex >= files.length) {
        const isFinished = files.reduce((acc, file) => acc && file?.percent === 100, true);
        if (isFinished) {
          resolvePromise();
        }
        return;
      }
      while (downloadingNow < queeeMaxSimultaneous && currentIndex < files.length) {
        downloadingNow++;
        downloadOne(files[currentIndex]).finally(() => {
          downloadingNow--;
          downloadNext();
        }).catch(rejectPromise);
        currentIndex++;
      }
    };

    const downloadOne = async (file: DownloadProgress) => new Promise((resolve, reject) => {
      const { url: name} = file;
      const fileUrl = new URL(name, url);
      
      const filePath = path.join(downloadDirectory, name);
      const finishedPath = filePath + ".finished";

      const finishProgress = () => {
        file.bytesReceived = file.bytesTotal;
        file.percent = 100;
        progress(progressInfo);
      }

      if (fs.existsSync(finishedPath)) {
        console.log(`File already exists: ${name}`);
        progressInfo.bytesReceived! += file.bytesTotal;
        progressInfo.percent = progressInfo.bytesReceived! / progressInfo.bytesTotal! * 100;
        finishProgress();
        resolve(true);
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      this.getBodyWithHttp2(fileUrl, fileStream, (addSize) => {
        downloadSpeed += addSize;
        progressInfo.bytesReceived! += addSize;
        progressInfo.percent = progressInfo.bytesReceived! / progressInfo.bytesTotal! * 100;
        file.bytesReceived += addSize;
        file.percent = file.bytesReceived / file.bytesTotal * 100;
        progress(progressInfo);
      }).then(() => {
        fs.writeFileSync(finishedPath, new Date().toISOString());
        finishProgress();
        resolve(true);
      }).catch((err) => {
        console.error(`Download Error: ${name}`, err);
        reject(err);
      });
    });

    downloadNext();
    return finalPromise.then(() => clearInterval(interval));
  }

  private async getGameDownloadFiles(url: URL): Promise<{
    files: DownloadProgress[],
    totalSize: number
  }> {
    const listBody = await this.getBodyWithHttp2(url) as string;
    const preTagMatch = listBody.match(/<pre>([\s\S]*?)<\/pre>/);
    let lines: string[] = [];
    if (!preTagMatch) {
      console.log(`Downloading Error: No pre tag found: ${url}`);
    } else {
      const preText = preTagMatch[1];
      lines = preText.split('\n');  
    }

    let totalSize = 0;
    const files: DownloadProgress[] = [];
    for (const line of lines) {
      const match = line.match(/<a href="([^"]+)">[^<]+<\/a>\s+(\d{2}-\w{3}-\d{4}\s+\d{2}:\d{2})\s+(\d+)/);
      if (match) {
        const name = match[1];
        const bytesTotal = parseInt(match[3], 10);
        totalSize += bytesTotal;
        files.push({
          url: name,
          bytesTotal,
          bytesReceived: 0,
          percent: 0,
        });
      }
    }

    return {files, totalSize};
  }
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond >= 1e9) {
    return (bytesPerSecond / 1e9).toFixed(2) + " GB/s";
  } else if (bytesPerSecond >= 1e6) {
    return (bytesPerSecond / 1e6).toFixed(2) + " MB/s";
  } else if (bytesPerSecond >= 1e3) {
    return (bytesPerSecond / 1e3).toFixed(2) + " KB/s";
  }
  return bytesPerSecond + " B/s";
}