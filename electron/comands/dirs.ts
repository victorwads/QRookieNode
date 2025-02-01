import { app } from "electron";
import * as path from "path";
import * as fs from "fs";

export const userDataDir = path.join(app.getPath("userData"), "data");
export const extractedDir = path.join(userDataDir, "uncrompressed");
export const downloadDir = path.join(userDataDir, "downloads");
export const gamesDirName = "VrGames"
export const gamesDir = path.join(downloadDir, gamesDirName);

fs.mkdirSync(extractedDir, { recursive: true });