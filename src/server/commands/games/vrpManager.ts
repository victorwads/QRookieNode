import * as fs from "fs";
import { extractFull } from "node-7z";
import { join } from "path";

import settingsManager from "@commands/settings/manager";
import { downloadDir } from "@server/dirs";
import log from "@server/log";
import RunSystemCommand from "@server/systemProcess";
import HttpDownloader from "./downloader";
import vrpPublic from "./vrpPublic";

export interface GameInfo {
  name: string;
  releaseName: string;
  packageName: string;
  version: number;
  lastUpdated: string;
  size: string;
}

type CachedGameInfo =
  | {
      lastDownloaded: string;
      games: GameInfo[];
    }
  | GameInfo[];

const metaFileName = "meta.7z";
const metaFilePath = join(downloadDir, metaFileName);
const gamesInfoFileName = "games_info.json";

export class VprManager extends RunSystemCommand {
  private games: Map<string, GameInfo> = new Map();

  constructor() {
    super();
    void this.loadGamesInfo();
  }

  private get gamesFilePath(): string {
    return join(downloadDir, gamesInfoFileName);
  }

  public async loadGamesInfo(): Promise<boolean> {
    if (!fs.existsSync(this.gamesFilePath)) {
      log.warn("games_info.json not found");
      const result = await this.updateMetadata();
      if (!result) {
        log.error(
          "Failed to update metadata. There is an issue with either your connection, or the server."
        );
        return false;
      }
    }

    try {
      const data = fs.readFileSync(this.gamesFilePath, "utf-8");
      const json = JSON.parse(data) as CachedGameInfo;
      if (Array.isArray(json)) {
        log.error("Invalid games_info.json");
        await this.updateMetadata();
        return true;
      }
      const lastDownloaded = new Date(json.lastDownloaded);
      if (new Date().getTime() - lastDownloaded.getTime() > 1000 * 60 * 60 * 24) {
        log.warn("Games info is outdated");
        await this.updateMetadata();
        return true;
      } else {
        log.info("Games info is up to date");
      }

      this.games.clear();
      json.games.forEach(game => {
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
      const games = Array.from(this.games.values());
      const json: CachedGameInfo = {
        lastDownloaded: new Date().toISOString(),
        games,
      };
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
      return false;
    }

    try {
      const downloaded = await downloader.downloadFile(
        metaFileName,
        vrpInfo?.baseUri,
        metaFilePath
      );

      if (!downloaded) {
        log.error("Failed to download metadata");
        return false;
      }

      const SevenZipPath = await this.getSevenZipPath();
      await new Promise((resolve, reject) => {
        log.info("Extracting metadata...", SevenZipPath);
        const seven = extractFull(metaFilePath, downloadDir, {
          $bin: SevenZipPath,
          password: vrpInfo.password,
        });
        seven.on("end", function () {
          resolve(null);
        });

        seven.on("error", reject);
      });

      this.parseMetadata();
      void this.loadGamesInfo();
      return true;
    } catch (error) {
      log.error("Metadata update failed:", error);
      return false;
    }
  }

  public parseMetadata(): boolean {
    const filePath = join(downloadDir, "VRP-GameList.txt");

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      log.error("VRP-GameList.txt not found");
      return false;
    }

    // Attempt to open the file
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
        version: Number.parseInt(parts[3]),
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
    return fs
      .readdirSync(settingsManager.getDownloadsDir())
      .filter(file => fs.existsSync(join(settingsManager.getDownloadsDir(), file, "finished")));
  }
}

export default new VprManager();
