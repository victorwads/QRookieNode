import * as https from "https";

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
}