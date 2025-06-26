import * as fs from "fs";
import { WriteStream } from "fs";
import * as http2 from "http2";
import * as https from "https";
import * as path from "path";

import { downloadProgress } from "@commands";
import settingsManager from "@commands/settings/manager";
import { DownloadProgress, GameStatusInfo } from "@commands/types";
import log from "@server/log";
import RunSystemCommand from "@server/systemProcess";
import { statusCodeToReasonPhrase } from "@server/utils";

import type { VrpPublicData } from "./vrpPublic";

export const extractDirName = "extracted";

const downloadingInfo: Record<string, GameStatusInfo> = {};
const instanceUniqId = Math.random().toString(36);
const CANCELLED = -1;

let shouldSend = true;
setInterval(() => {
  shouldSend = true;
}, 30);

export const progress = (info: GameStatusInfo) => {
  if (info.status !== "cancelling" && cancelRequests[info.id]) {
    info = { id: info.id, status: "cancelling" };
  }
  downloadingInfo[info.id] = info;
  if (shouldSend || info.status !== "downloading") {
    shouldSend = false;
    void downloadProgress(info);
  }
};

const cancelRequests: { [id: string]: () => void } = {};

export default class Downloader extends RunSystemCommand {
  public download(url: string): Promise<string> {
    log.info(`Downloading with https: ${url}`);
    return new Promise((resolve, reject) => {
      https.get(url, response => {
        let data = "";

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP Error: ${response.statusCode}`));
          }
        });

        response.on("error", error => {
          reject(error);
        });
      });
    });
  }

  public remove(id: string) {
    const downloadDirectory = path.join(settingsManager.getDownloadsDir(), id);
    fs.rmSync(downloadDirectory, { recursive: true });
  }

  public async downloadFile(
    fileName: string,
    baseUrl: string,
    finalPath: string
  ): Promise<boolean> {
    const tempPath = `${finalPath}`;

    if (fs.existsSync(finalPath)) {
      log.warn(`File already exists: ${finalPath}`);
      return true;
    }

    const url = new URL(fileName, baseUrl);
    const headers: Record<string, string> = {
      ":method": "GET",
      ":path": url.pathname,
      "user-agent": "rclone/v1.65.2",
      accept: "*/*",
    };
    log.info(`Downloading ${url} to ${finalPath}`);

    return new Promise((resolve, reject) => {
      const client = http2.connect(url.origin);
      const req = client.request(headers);
      const fileStream = fs.createWriteStream(tempPath);

      req.on("response", headers => {
        if (headers[":status"] !== 200) {
          fileStream.close();
          fs.unlinkSync(finalPath); // Remove the corrupted file
          reject(
            new Error(
              `HTTP/2 Error: ${headers[":status"]} - ${
                statusCodeToReasonPhrase[headers[":status"] || ""]
              }`
            )
          );
          req.close();
          return;
        }

        req.on("data", chunk => {
          fileStream.write(chunk);
        });

        req.on("end", () => {
          fileStream.close();
          fs.renameSync(tempPath, finalPath);
          log.info(`Download completed: ${finalPath}`);
          resolve(true);
          client.close(); // Close the HTTP/2 connection
        });
      });

      req.on("error", err => {
        fileStream.close();
        fs.unlinkSync(finalPath); // Remove the corrupted file
        reject(err as Error);
        client.close(); // Close the connection in case of an error
      });

      req.end();
    });
  }

  private async getBodyWithHttp2(
    url: URL,
    stream?: WriteStream,
    progress?: (addSize: number) => boolean
  ): Promise<string | boolean> {
    log.info(`Downloading: ${url}`);
    const client = http2.connect(url.origin);
    const headers: Record<string, string> = {
      ":method": "GET",
      ":path": url.pathname,
      "user-agent": "rclone/v1.65.2",
      accept: "*/*",
    };
    const req = client.request(headers);

    let body = stream ? false : "";
    let canceled = false;
    await new Promise((resolve, reject) => {
      req.on("response", headers => {
        if (headers[":status"] !== 200) {
          reject(new Error(`HTTP/2 Error: ${headers[":status"]} ${url}`));
          req.close();
          return;
        }
        req.on("data", chunk => {
          if (stream) {
            stream.write(chunk);
          } else {
            body += chunk;
          }
          if (progress?.(chunk.length) === false) {
            canceled = true;
            req.close();
            client.close();
            log.debug(`Download on data, canceled: ${url}`);
          }
        });
        req.on("end", () => {
          if (stream) {
            body = true;
            stream.close();
          }
          client.close();
          if (canceled) {
            log.debug(`Download on end, canceled: ${url}`);
            reject(new Error(`Download canceled ${url}`));
          } else {
            resolve(true);
          }
        });
      });
      req.on("error", err => {
        if (canceled) {
          log.debug(`Download on error, canceled: ${url}`);
        }
        reject(new Error(`Download error ${url} - ${err}`));
        client.close();
        if (stream) {
          stream.close();
        }
      });
      req.end();
    });
    return body;
  }

  private initDownloadFileLock(downloadPath: string) {
    fs.readdirSync(downloadPath).forEach(file => {
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

  private prepareDownloadIfNeeded(id: string): string | boolean {
    const downloadDirectory = path.join(settingsManager.getDownloadsDir(), id);
    if (!fs.existsSync(downloadDirectory)) {
      fs.mkdirSync(downloadDirectory, { recursive: true });
    }

    if (this.isFinishedDownloadFile(downloadDirectory)) {
      log.info(`Download already finished: ${id}`);
      return true;
    }
    if (this.isLockedDownloadFile(downloadDirectory)) {
      log.info(`Download already in progress: ${id}`);
      return true;
    }
    this.initDownloadFileLock(downloadDirectory);

    return downloadDirectory;
  }

  private isCanceled(id: string): boolean {
    if (cancelRequests[id]) {
      return true;
    }
    return false;
  }

  private cancelIfRequested(id: string): boolean {
    if (cancelRequests[id]) {
      log.debug(`Canceling previous download: ${id}`);
      cancelRequests[id]();
      return true;
    }
    return false;
  }

  public async downloadDir(
    baseUrl: string,
    id: string,
    vrpPublicData: VrpPublicData | null
  ): Promise<GameStatusInfo | null> {
    const prepareResult = this.prepareDownloadIfNeeded(id);
    const url = new URL(id + "/", baseUrl);
    let progressInfo: GameStatusInfo = {
      id,
      url: url.toString(),
      status: "downloading",
      speed: "loading...",
      bytesReceived: 0,
      bytesTotal: 0,
      percent: 0,
      files: [],
    };

    if (prepareResult === true) {
      progressInfo = { id, status: "downloaded" };
      progress(progressInfo);
      return progressInfo;
    }
    const downloadDirectory = prepareResult as string;

    progress(progressInfo);
    const { files, totalSize } = await this.getGameDownloadFiles(url);
    if (files.length === 0) {
      log.error(`Download Error: No files found: ${url}`);
      return null;
    }

    progressInfo.bytesTotal = totalSize;
    progressInfo.files = files;
    progress(progressInfo);

    if (this.cancelIfRequested(id)) {
      return null;
    }

    let batchResult: boolean = false;
    try {
      batchResult = await this.batchDownloadFiles(id, url, downloadDirectory, files, progressInfo);
    } catch (err: any) {
      progressInfo = { id, status: "error", message: err.message };

      progressInfo.status = "error";
      progressInfo.message = err.message;
      return null;
    }

    if (this.cancelIfRequested(id)) {
      return null;
    }
    if (batchResult === false) {
      progressInfo = { id, status: "error", message: "Unknown error, see logs" };
      progress(progressInfo);
      return null;
    }

    progressInfo = { id, status: "unzipping" };
    progress(progressInfo);
    await this.unZipDownloadedFiles(id, downloadDirectory, vrpPublicData?.password);

    progressInfo = { id, status: "downloaded" };
    progress(progressInfo);

    fs.writeFileSync(path.join(downloadDirectory, "finished"), new Date().toISOString());
    log.info(`Download complete: ${id}`);
    return progressInfo;
  }

  private async unZipDownloadedFiles(id: string, downloadDirectory: string, password?: string) {
    await this.runCommand(await this.getSevenZipPath(), [
      "x",
      "-y",
      "-o" + downloadDirectory,
      password ? "-p" + password : "",
      path.join(downloadDirectory, id + ".7z.001"),
    ]);
    fs.readdirSync(downloadDirectory)
      .filter(item => fs.statSync(path.join(downloadDirectory, item)).isDirectory())
      .forEach(dir => {
        fs.renameSync(
          path.join(downloadDirectory, dir),
          path.join(downloadDirectory, extractDirName)
        );
      });

    fs.readdirSync(downloadDirectory)
      .filter(item => item.startsWith(id))
      .forEach(file => {
        fs.unlinkSync(path.join(downloadDirectory, file));
      });
  }

  private batchDownloadFiles(
    id: string,
    url: URL,
    downloadDirectory: string,
    files: DownloadProgress[],
    progressInfo: GameStatusInfo
  ): Promise<boolean> {
    if (progressInfo.status !== "downloading") return Promise.resolve(false);

    let resolvePromise: (result: boolean) => void;
    const finalPromise = new Promise<boolean>(resolve => {
      resolvePromise = resolve;
    });

    const queueMaxSimultaneous = 5;
    let downloadSpeed = 0;
    let downloadingNow = 0;
    let currentIndex = 0;
    let success = true;

    const interval = setInterval(() => {
      progressInfo.speed = formatSpeed(downloadSpeed);
      downloadSpeed = 0;
    }, 1000);

    const downloadNext = () => {
      if (currentIndex >= files.length) {
        const isFinished = files.reduce(
          (acc, file) => acc && (file?.percent === 100 || file?.percent === CANCELLED),
          true
        );
        if (isFinished) {
          resolvePromise(success);
        }
        return;
      }
      while (downloadingNow < queueMaxSimultaneous && currentIndex < files.length) {
        downloadingNow++;
        void downloadOne(files[currentIndex])
          .then(result => {
            success = success && result;
          })
          .finally(() => {
            downloadingNow--;
            log.debug(`Handling next ${currentIndex}/${files.length}`);
            downloadNext();
          });
        currentIndex++;
      }
    };

    const downloadOne = async (file: DownloadProgress) =>
      new Promise<boolean>(resolve => {
        if (this.isCanceled(id)) {
          file.percent = CANCELLED;
          resolve(false);
          return false;
        }

        const { url: name } = file;
        const fileUrl = new URL(name, url);

        const filePath = path.join(downloadDirectory, name);
        const finishedPath = filePath + ".finished";

        const finishProgress = () => {
          file.bytesReceived = file.bytesTotal;
          file.percent = 100;
          progress(progressInfo);
        };

        if (fs.existsSync(finishedPath)) {
          log.info(`File already exists: ${name}`);
          progressInfo.bytesReceived += file.bytesTotal;
          progressInfo.percent = (progressInfo.bytesReceived / progressInfo.bytesTotal) * 100;
          finishProgress();
          resolve(true);
          return;
        }

        log.debug(`Downloading ${currentIndex}/${files.length}: ${file.url}`);
        const fileStream = fs.createWriteStream(filePath);
        this.getBodyWithHttp2(fileUrl, fileStream, addSize => {
          downloadSpeed += addSize;
          progressInfo.bytesReceived += addSize;
          progressInfo.percent = (progressInfo.bytesReceived / progressInfo.bytesTotal) * 100;
          file.bytesReceived += addSize;
          file.percent = (file.bytesReceived / file.bytesTotal) * 100;
          if (this.isCanceled(id)) {
            file.percent = CANCELLED;
            return false;
          }
          progress(progressInfo);
          return true;
        })
          .then(() => {
            fs.writeFileSync(finishedPath, new Date().toISOString());
            finishProgress();
            resolve(true);
          })
          .catch(err => {
            log.error(`Download Error: ${name}`, err);
            resolve(false);
          });
      });

    downloadNext();
    return finalPromise.finally(() => clearInterval(interval));
  }

  private async getGameDownloadFiles(url: URL): Promise<{
    files: DownloadProgress[];
    totalSize: number;
  }> {
    const listBody = (await this.getBodyWithHttp2(url)) as string;
    const preTagMatch = listBody.match(/<pre>([\s\S]*?)<\/pre>/);
    let lines: string[] = [];
    if (!preTagMatch) {
      log.error(`Downloading Error: No pre tag found: ${url}`);
    } else {
      const preText = preTagMatch[1];
      lines = preText.split("\n");
    }

    let totalSize = 0;
    const files: DownloadProgress[] = [];
    for (const line of lines) {
      const match = line.match(
        /<a href="([^"]+)">[^<]+<\/a>\s+(\d{2}-\w{3}-\d{4}\s+\d{2}:\d{2})\s+(\d+)/
      );
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

    return { files, totalSize };
  }

  public async cancel(id: string) {
    const cancelRequest = cancelRequests[id];
    progress({ id, status: "cancelling" });
    return new Promise<void>(resolve => {
      cancelRequests[id] = () => {
        if (cancelRequest) {
          cancelRequest();
        }
        log.debug(`Canceled download: ${id}`);
        delete cancelRequests[id];
        progress({ id, status: "none" });
        resolve();
      };
    });
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
