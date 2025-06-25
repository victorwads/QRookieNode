import { GameStatusInfo } from "@comands/games";
import log from "./log";
import { sendInfo as sendInfoNode } from "./main/node";

let sendInfoElectron: ((info: GameStatusInfo) => void) | null = null;
if (process.versions.electron) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sendInfoElectron = require("./main/electron/bridge").sendInfo;
  } catch (err) {
    log.error("Failed to load Electron module:", err);
  }
}

export async function sendInfo(info: GameStatusInfo) {
  sendInfoElectron?.(info);
  sendInfoNode(info);
}
