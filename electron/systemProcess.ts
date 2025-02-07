import * as path from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import sevenBin from "7zip-bin"

import log from "./log";
import { platformToolsDir, binExt, setupTools } from "./comands/adb/androidToolsSetup";

const execFileAsync = promisify(execFile);

export default abstract class SystemProcess {

  private static adbPath?: string;

  constructor() {
    if (SystemProcess.adbPath) {
      return;
    }
    SystemProcess.adbPath = path.join(platformToolsDir, "adb" + binExt);
    this.getCommanPath('adb').then((path) => {
      if (path) {
        SystemProcess.adbPath = path;
        log.info("ADB found at:", path);
        return;
      }
      log.warn(`ADB not found, downloading platform-tools. getCommanPath returned: '${path}'`);
      setupTools();
    }).catch((err) => {
      log.error(`ADB not found, downloading platform-tools. getCommanPath returned error: '${err.message}'`);
      setupTools();
    });
  }

  public async getCommanPath(comandName: string): Promise<string|null> {
    try {
      const { stdout } = await execFileAsync("which", [comandName]);
      const path = (stdout||'').trim();
      return path !== "" ? path : null;
    } catch (error: any) {
      log.error("Command error: ", error.message);
      return null;
    }
  }

  public async runCommand(comandWithPath: string, args: string[]): Promise<{
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
      return { stdout: "", stderr: error.message }
    }
  }

  public async getSevenZipPath(): Promise<string> {
    return await this.getCommanPath('7za') ?? sevenBin.path7za.replace("app.asar", "app.asar.unpacked");
  }

  public getAdbPath(): string {
    return SystemProcess.adbPath || "error";
  }

}