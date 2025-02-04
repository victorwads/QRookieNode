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

  public async runCommand(comandWithPath: string, args: string[], maxLogLines: number = 20): Promise<{
    stdout: string;
    stderr: string;
  }> {
    try {
      let { stdout, stderr } = await execFileAsync(comandWithPath, args);
      stdout = stdout.trim();
      stderr = stderr.trim();
      const stdoutLines = stdout.split("\n");
      console.log(
        "\n<----------------------------------------",
        `\n\x1b[32mCommand '${comandWithPath} ${args.join(" ")}'\nexecuted successfully, stdout:\x1b[0m`,
        "\n\x1b[33m" + stdoutLines.slice(0, maxLogLines).join("\n") + "\x1b[0m",
        stdoutLines.length > maxLogLines ? `\n...and ${stdoutLines.length - maxLogLines} more lines` : "",
        stderr ? "\n\x1b[31mWith stderr: \n" + stderr.split("\n").slice(0, maxLogLines).join("\n") + "\x1b[0m" : "",
        "\n---------------------------------------->"
      );
      return { stdout, stderr };
    } catch (error: any) {
      console.log(
        "\n\x1b[31m<----------------------------------------",
        `\nCommand '${comandWithPath} ${args.join(" ")}' executed with error:`,
        "\n" + error.message,
        "\n---------------------------------------->\x1b[0m"
      );
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