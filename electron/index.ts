import { GameStatusInfo } from "./comands/games";
import log from "./log";
import { sendInfo as sendInfoNode } from "./main/node";

let electron: typeof import("./main/electron/bridge") | null = null;

if (process.versions.electron) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    electron = require("./main/electron");
  } catch (err) {
    log.error("Failed to load Electron module:", err);
  }
}

export async function sendInfo(info: GameStatusInfo) {
  if (electron && typeof electron.sendInfo === "function") {
    electron.sendInfo(info);
  }
  sendInfoNode(info);
}