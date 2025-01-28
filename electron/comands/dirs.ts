import { app } from "electron";
import * as path from "path";
import * as fs from "fs";

export const userDataDir = path.join(app.getPath("userData"));
export const downloadDir = path.join(userDataDir, "downloads");
export const gamesDir = path.join(downloadDir, "games");
export const extractedDir = path.join(userDataDir, "uncrompressed");

fs.mkdirSync(downloadDir, { recursive: true });
fs.mkdirSync(extractedDir, { recursive: true });