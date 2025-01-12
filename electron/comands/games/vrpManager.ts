import { app } from "electron";
import * as fs from "fs";
import * as path from "path";
import sevenBin from '7zip-bin'
import { extractFull } from 'node-7z'

import { HttpDownloader } from "./httpDownloader";
import vrpPublic from "./vrpPublic";
import Game from "./game";

export interface GameInfo {
  name: string;
  releaseName: string;
  packageName: string;
  version: string;
  lastUpdated: string;
  size: string;
  //status: "local" | "queued" | "downloading" | "downloadable";
}

const metaFileName = "meta.7z";
const userDataDir = path.join(app.getPath("userData"));
const downloadDir = path.join(userDataDir, "downloads");
const extractedDir = path.join(userDataDir, "uncrompressed");
const metaFilePath = path.join(downloadDir, metaFileName);
fs.mkdirSync(downloadDir, { recursive: true });
fs.mkdirSync(extractedDir, { recursive: true });


export class VprManager {

  private games: Map<string, GameInfo> = new Map();

  constructor() {
    this.loadGamesInfo();
  }

  private get gamesFilePath(): string {
    return path.join(downloadDir, "games_info.json");
  }

  public async loadGamesInfo(): Promise<boolean> {
    if (!fs.existsSync(this.gamesFilePath)) {
      console.warn("games_info.json not found");
      await this.updateMetadata();
    }

    try {
      const data = fs.readFileSync(this.gamesFilePath, "utf-8");
      const json = JSON.parse(data) as GameInfo[];

      this.games.clear();
      json.forEach((game) => {
        this.games.set(game.releaseName, game);
      });

      console.log("Games loaded successfully");
      return true;
    } catch (error) {
      console.error("Failed to load games_info.json:", error);
      return false;
    }
  }

  public saveGamesInfo(): boolean {
    try {
      const json = Array.from(this.games.values());
      fs.writeFileSync(this.gamesFilePath, JSON.stringify(json, null, 2), "utf-8");
      console.log("Games saved successfully");
      return true;
    } catch (error) {
      console.error("Failed to save games_info.json:", error);
      return false;
    }
  }

  public getGames(): Game[] {
    return Array.from(this.games.values()).map((game) => ({
      id: game.name,
      image: this.getGameThumbnailPath(game),
    } as Game));
  }

  public getGame(name: string): GameInfo | undefined {
    return this.games.get(name);
  }

  public addOrUpdateGame(game: GameInfo): void {
    this.games.set(game.releaseName, game);
    this.saveGamesInfo();
  }


  public async updateMetadata(): Promise<boolean> {
    const downloader = new HttpDownloader();
    const vrpInfo = await vrpPublic;
    if (!vrpInfo) {
      console.error("Failed to get VRP info");
      return false
    }

    try {
      const downloaded = await downloader.downloadFile(metaFileName, vrpInfo?.baseUri, metaFilePath);

      if (!downloaded) {
        console.error("Failed to download metadata");
        return false;
      }

      await (new Promise((resolve, reject) => {
        const binPath = sevenBin.path7za.replace("Contents/Resources/app.asar", "Contents/Resources/app.asar.unpacked")
        console.log("Extracting metadata...", binPath);
        const seven = extractFull(metaFilePath, downloadDir, {
          $bin: binPath,
          password: vrpInfo.password
        })
        seven.on('end', function () {
          resolve(null);
        })

        seven.on('error', reject)
      }));

      this.parseMetadata();
      this.loadGamesInfo();
      return true;
    } catch (error) {
      console.error("Metadata update failed:", error);
      return false;
    }
  }

  public parseMetadata(): boolean {
    const filePath = path.join(downloadDir, "VRP-GameList.txt");

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      console.warn("VRP-GameList.txt not found");
      return false;
    }

    // Tenta abrir o arquivo
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");

    lines.shift();

    this.games.clear();

    let isEmpty = true;

    for (const line of lines) {
      const parts = line.split(";");

      if (parts.length < 6) {
        console.warn("Invalid line in VRP-GameList.txt:", line);
        continue;
      }

      const game: GameInfo = {
        name: parts[0],
        releaseName: parts[1],
        packageName: parts[2],
        version: parts[3],
        lastUpdated: parts[4],
        size: parts[5],
      };

      this.games.set(game.releaseName, game);
      isEmpty = false;
    }

    this.saveGamesInfo();
    if (isEmpty) {
      console.warn("No games found in VRP-GameList.txt");
      return false;
    } else {
      console.log("Metadata parsed successfully");
      return true;
    }
  }

  public getGameThumbnailPath(game?: GameInfo): string {
    if (!game) {
      return "";
    }
    return path.join(downloadDir, ".meta", "thumbnails", game.packageName + ".jpg");
  }

}

export default (new VprManager());