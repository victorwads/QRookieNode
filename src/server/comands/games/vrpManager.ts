import * as fs from "fs";
import { extractFull } from 'node-7z';
import { join } from "path";

import settingsManager from "@comands/settings/manager";
import { downloadDir } from "@server/dirs";
import log from "@server/log";
import RunSystemCommand from "@server/systemProcess";
import HttpDownloader from "./downloader";
import vrpPublic from "./vrpPublic";

export interface GameInfo {
  name: string;
  releaseName: string;
  packageName: string;
  version: string;
  lastUpdated: string;
  size: string;
}

const metaFileName = "meta.7z";
const metaFilePath = join(downloadDir, metaFileName);

export class VprManager extends RunSystemCommand {
  private games: Map<string, GameInfo> = new Map();

  constructor() {
    super();
    this.loadGamesInfo();
  }

  private get gamesFilePath(): string {
    return join(downloadDir, "games_info.json");
  }

  public async loadGamesInfo(): Promise<boolean> {
    if (!fs.existsSync(this.gamesFilePath)) {
      log.warn("games_info.json not found");
      await this.updateMetadata();
    }

    try {
      const data = fs.readFileSync(this.gamesFilePath, "utf-8");
      const json = JSON.parse(data) as GameInfo[];

      this.games.clear();
      json.forEach((game) => {
        this.games.set(game.releaseName, game);
      });

      log.info("Games loaded successfully");
      return true;
    } catch (error) {
      log.error("Failed to load games_info.json:", error);
      return false;
    }
  }

  public saveGamesInfo(): boolean {
    try {
      const json = Array.from(this.games.values());
      fs.writeFileSync(this.gamesFilePath, JSON.stringify(json, null, 2), "utf-8");
      return true;
    } catch (error) {
      log.error("Failed to save games_info.json:", error);
      return false;
    }
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
      log.error("Failed to get VRP info");
      return false
    }

    try {
      const downloaded = await downloader.downloadFile(metaFileName, vrpInfo?.baseUri, metaFilePath);

      if (!downloaded) {
        log.error("Failed to download metadata");
        return false;
      }

      const SevenZipPath = await this.getSevenZipPath();
      await (new Promise((resolve, reject) => {
        log.info("Extracting metadata...", SevenZipPath);
        const seven = extractFull(metaFilePath, downloadDir, {
          $bin: SevenZipPath,
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
      log.error("Metadata update failed:", error);
      return false;
    }
  }

  public parseMetadata(): boolean {
    const filePath = join(downloadDir, "VRP-GameList.txt");

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      log.error("VRP-GameList.txt not found");
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
        log.error("Invalid line in VRP-GameList.txt:", line);
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
      log.error("No games found in VRP-GameList.txt");
      return false;
    } else {
      log.info("Metadata parsed successfully");
      return true;
    }
  }

  public getDownloadedGames(): string[] {
    return fs.readdirSync(settingsManager.getDownloadsDir()).filter((file) => 
      fs.existsSync(join(settingsManager.getDownloadsDir(), file, "finished"))
    );
  }
}

export default (new VprManager());
