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
    try {
      const { stdout } = await execFileAsync("which", [comandName]);
      const path = (stdout||'').trim();
      return path !== "" ? path : null;
    } catch (error: any) {
      console.log("Command error: ", error.message);
      return null;
    }
  }

  public async runCommand(comandWithPath: string, args: string[]): Promise<{
    stdout: string;
    stderr: string;
  }> {
    console.log("Running command:", comandWithPath, args.join(" "));
    try {
      const { stdout, stderr } = await execFileAsync(comandWithPath, args);
      console.log("Command executed successfully", stdout.trim(), stderr.trim());
      return { stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (error: any) {
      console.log("Command error: ", error.message);
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