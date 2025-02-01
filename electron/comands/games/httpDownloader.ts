import * as https from "https";
import * as http2 from "http2";
import * as path from "path";
import * as fs from "fs";
import { WriteStream } from "fs";

import settingsManager from "../settings/manager";
import { DownloadInfo, DownloadProgress } from "../../shared";
import { getMainWindow } from "../../main";

const downloadingInfo: Record<string, DownloadInfo> = {};
const instanceUniqId = Math.random().toString(36);

let shouldSend = true;
setInterval(() => { shouldSend = true; }, 100);

const progress = (info: DownloadInfo, id: string) => {
  downloadingInfo[id] = info;
  if(shouldSend || info.percent === 100) {
    shouldSend = false;
    getMainWindow()?.webContents.send("downloadProgress", info);
  }
}

export default class HttpDownloader {
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

  public async downloadFile(fileName: string, baseUrl: string, finalPath: string): Promise<boolean> {
    const tempPath = `${finalPath}`;

    if (fs.existsSync(finalPath)) {
      console.log(`File already exists: ${finalPath}`);
      return true;
    }

    let downloadedBytes = 0;
    if (fs.existsSync(tempPath)) {
      downloadedBytes = fs.statSync(tempPath).size;
    }

    const url = new URL(fileName, baseUrl);
    const headers: Record<string, string> = {
      ":method": "GET",
      ":path": url.pathname,
      "user-agent": "rclone/v1.65.2",
      accept: "*/*",
    };
    if (downloadedBytes > 0) {
      headers["Range"] = `bytes=${downloadedBytes}-`;
    }

    console.log(`Downloading ${url} to ${finalPath}`);
    console.log("Starting from byte:", downloadedBytes);
    console.log("Headers:", headers);

    return new Promise((resolve, reject) => {
      console.log("Connecting to with http2:", url.origin);
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
      fs.unlinkSync(filePath);
    });
    fs.writeFileSync(path.join(downloadPath, instanceUniqId), new Date().toISOString());
  }

  private isLockedDownloadFile(downloadPath: string): boolean {
    return fs.existsSync(path.join(downloadPath, instanceUniqId));
  }

  private isFinishedDownloadFile(downloadPath: string): boolean {
    return fs.existsSync(path.join(downloadPath, "finished"));
  }

  public async downloadDir(baseUrl: string, id: string): Promise<boolean> {
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

    const url = new URL(id + '/', baseUrl);
    const progressInfo: DownloadInfo = {
      id, url: url.toString(),
      bytesReceived: 0,
      bytesTotal: 0,
      percent: 0,
      files: [],
    }
    progress(progressInfo, id);
    
    const listBody = await this.getBodyWithHttp2(url) as string;
    const preTagMatch = listBody.match(/<pre>([\s\S]*?)<\/pre>/);
    if (!preTagMatch) {
      console.warn(`Downloading Error: No pre tag found: ${url}`);
      return false;
    }

    const preText = preTagMatch[1];
    const lines = preText.split('\n');

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
    if (files.length === 0) {
      console.log(`Downloading Error: No files found: ${url}`);
      return false;
    }

    progressInfo.bytesTotal = totalSize;
    progressInfo.files = files;
    progress(progressInfo, id);

    const batch = files.map(file => new Promise((resolve, reject) => {
      const { url: name} = file;
      const fileUrl = new URL(name, url);
      
      const filePath = path.join(downloadDirectory, name);
      const fileStream = fs.createWriteStream(filePath);
      this.getBodyWithHttp2(fileUrl, fileStream, (addSize) => {
        progressInfo.bytesReceived += addSize;
        progressInfo.percent = progressInfo.bytesReceived / progressInfo.bytesTotal * 100;
        file.bytesReceived += addSize;
        file.percent = file.bytesReceived / file.bytesTotal * 100;
        progress(progressInfo, id);
      }).then(() => {
        console.log(`Downloaded: ${name} (${file.bytesTotal} bytes)`);
        fs.writeFileSync(filePath + ".finished", new Date().toISOString());
        resolve(true);
      }).catch((err) => {
        console.error(`Download Error: ${name}`, err);
        reject(err);
      });
    }));
    await Promise.all(batch);
    progressInfo.percent = 100;
    files.forEach(file => {
      file.percent = 100;
      file.bytesReceived = file.bytesTotal;
    });
    progress(progressInfo, id);

    fs.writeFileSync(path.join(downloadDirectory, "finished"), new Date().toISOString());
    console.log(`Download complete: ${id}`);
    return true;
  }
}
