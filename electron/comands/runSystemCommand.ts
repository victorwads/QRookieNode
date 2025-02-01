import * as path from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import sevenBin from "7zip-bin"


import { platformToolsDir, binExt, setupTools } from "./adb/androidToolsSetup";

const execFileAsync = promisify(execFile);

export default abstract class RunSystemCommand {

  private static adbPath?: string;

  constructor() {
    if (RunSystemCommand.adbPath) {
      return;
    }
    RunSystemCommand.adbPath = path.join(platformToolsDir, "adb" + binExt);
    this.getCommanPath('adb').then((path) => {
      if (path) {
        RunSystemCommand.adbPath = path;
        console.log("ADB found at:", path);
        return;
      }
      console.log(`ADB not found, downloading platform-tools. getCommanPath returned: '${path}'`);
      setupTools();
    }).catch((err) => {
      console.log(`ADB not found, downloading platform-tools. getCommanPath returned error: '${err.message}'`);
      setupTools();
    });
  }

  public async getCommanPath(comandName: string): Promise<string|null> {
    const { stdout } = await execFileAsync("which", [comandName]);
    const path = (stdout||'').trim();
    return path !== "" ? path : null;
  }

  public async runCommand(comandWithPath: string, args: string[]): Promise<{
    stdout: string;
    stderr: string;
  }> {
    try {
      const { stdout, stderr } = await execFileAsync(comandWithPath, args);
      return { stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (error: any) {
      console.error(error.message);
      return { stdout: "", stderr: error.message }
    }
  }

  public getSevenZipPath(): string {
    return sevenBin.path7za.replace("app.asar", "app.asar.unpacked");
  }

  public getAdbPath(): string {
    return RunSystemCommand.adbPath || "error";
  }

}