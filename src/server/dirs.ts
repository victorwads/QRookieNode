import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

import log from "./log";

const platformPaths: Record<string, () => string> = {
  win32: () => join(homedir(), "AppData/Roaming/qrookie-node"),
  darwin: () => join(homedir(), "Library/Application Support/qrookie-node"),
  linux: () => join(homedir(), ".config/qrookie-node"),
};
const userDataDir = (platformPaths[process.platform] ?? platformPaths.linux)();

log.info("userDataDir: " + userDataDir);

let foundResourcesDir = __dirname;
while (!existsSync(join(foundResourcesDir, "dist"))) {
  foundResourcesDir = join(foundResourcesDir, "..");
}

export const resourcesDir = foundResourcesDir;
export const buildRoot = __dirname;
export const appDataDir = join(userDataDir, "data");
export const extractedDir = join(appDataDir, "uncompressed");
export const downloadDir = join(appDataDir, "downloads");
export const gamesDirName = "VrGames";
export const gamesDir = join(downloadDir, gamesDirName);

mkdirSync(extractedDir, { recursive: true });
