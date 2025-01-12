import * as https from "https";
import * as http2 from "http2";
import * as fs from "fs";

export class HttpDownloader {
  public download(url: string): Promise<string> {
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
    const tempPath = `${finalPath}.tmp`;

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
      const client = http2.connect(url.origin);
      const req = client.request(headers);
      const fileStream = fs.createWriteStream(finalPath);

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
}


export interface DownloadProgress {
  bytesReceived: number;
  bytesTotal: number;
}