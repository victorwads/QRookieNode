import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import log from "../log";

const platformPaths: Record<string, () => string> = {
  win32: () => path.join(os.homedir(), "AppData/Roaming/qrookie-node"),
  darwin: () => path.join(os.homedir(), "Library/Application Support/qrookie-node"),
  linux: () => path.join(os.homedir(), ".config/qrookie-node")
};
const userDataDir = (platformPaths[process.platform] ?? platformPaths.linux)();

log.info("userDataDir: " + userDataDir);

export const buildRoot = path.join(__dirname, "..");
export const appDataDir = path.join(userDataDir, "data");
export const extractedDir = path.join(appDataDir, "uncrompressed");
export const downloadDir = path.join(appDataDir, "downloads");
export const gamesDirName = "VrGames"
export const gamesDir = path.join(downloadDir, gamesDirName);

fs.mkdirSync(extractedDir, { recursive: true });