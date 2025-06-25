import sevenBin from "7zip-bin";
import { execFile } from "child_process";
import * as path from "path";
import { promisify } from "util";

import { binExt, platformToolsDir, setupTools } from "@comands/adb/androidToolsSetup";
import log from "./log";

const execFileAsync = promisify(execFile);

export default abstract class SystemProcess {
  private static adbPath?: string;

  constructor() {
    if (SystemProcess.adbPath) {
      return;
    }
    SystemProcess.adbPath = path.join(platformToolsDir, "adb" + binExt);
    this.getCommanPath("adb")
      .then(path => {
        if (path) {
          SystemProcess.adbPath = path;
          log.info("ADB found at:", path);
          return;
        }
        log.warn(`ADB not found, downloading platform-tools. getCommanPath returned: '${path}'`);
        void setupTools();
      })
      .catch(err => {
        log.error(
          `ADB not found, downloading platform-tools. getCommanPath returned error: '${err.message}'`
        );
        void setupTools();
      });
  }

  public async getCommanPath(comandName: string): Promise<string | null> {
    try {
      const { stdout } = await execFileAsync("which", [comandName]);
      const path = (stdout || "").trim();
      return path !== "" ? path : null;
    } catch (error: any) {
      log.warn("Command error: ", error.message);
      return null;
    }
  }

  public async runCommand(
    comandWithPath: string,
    args: string[]
  ): Promise<{
    stdout: string;
    stderr: string;
  }> {
    try {
      let { stdout, stderr } = await execFileAsync(comandWithPath, args);
      stdout = stdout.trim();
      stderr = stderr.trim();
      log.command(comandWithPath, args, stdout, stderr);
      return { stdout, stderr };
    } catch (error: any) {
      log.commandError(comandWithPath, args, error.message);
      return { stdout: "", stderr: error.message };
    }
  }

  public async getSevenZipPath(): Promise<string> {
    return (
      (await this.getCommanPath("7za")) ?? sevenBin.path7za.replace("app.asar", "app.asar.unpacked")
    );
  }

  public getAdbPath(): string {
    return SystemProcess.adbPath || "error";
  }
}
