import * as path from "path";
import * as child_process from "child_process";
import { setupTools, platformToolsDir, binExt } from "./adbDownload";

export const setupToolsPromisse = setupTools()
  .then(() => console.log("Tools setup successfully!"))
  .catch((err) => console.error("Error setting up tools:", err));

import { Command, CommandEvent } from "../../shared";

export interface AdbPayload { }
export type AdbCommandName = 'adb';
export type AdbCommand = Command<AdbPayload, string, AdbCommandName>;
export type AdbCommandEvent = CommandEvent<AdbPayload, string, AdbCommandName>

export default {
  type: 'adb',
  receiver: async function (payload) {
    const adbPath = path.join(platformToolsDir, "adb" + binExt);

    return new Promise((resolve, reject) => {
      const args = ["devices"];
      child_process.execFile(adbPath, args, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
          return;
        }
        resolve(stdout.trim());
      });
    });
    return platformToolsDir;
  }
} as AdbCommand;
