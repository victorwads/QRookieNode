import sevenBin from "7zip-bin";
import { execFile } from "child_process";
import * as path from "path";
import { promisify } from "util";

import { binExt, platformToolsDir, setupTools } from "@commands/adb/androidToolsSetup";
import log from "./log";

const execFileAsync = promisify(execFile);

export default abstract class SystemProcess {
  private static adbPath?: string;
  private static isInitialized = false;

  public constructor() {}

  public async initialize(): Promise<void> {
    if (SystemProcess.isInitialized) return;

    try {
      const adbPath = await this.getCommandPath("adb");

      if (adbPath) {
        SystemProcess.adbPath = adbPath;
        log.info("ADB found at:", adbPath);
      } else {
        SystemProcess.adbPath = path.join(platformToolsDir, "adb" + binExt);
        log.warn(
          `ADB not found, downloading platform-tools. getCommandPath returned: '${adbPath}'`
        );
        await setupTools();
      }

      SystemProcess.isInitialized = true;
    } catch (error) {
      log.error("Failed to initialize SystemProcess:", error);
      throw error;
    }
  }

  public async getCommandPath(comandName: string): Promise<string | null> {
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
      (await this.getCommandPath("7za")) ??
      sevenBin.path7za.replace("app.asar", "app.asar.unpacked")
    );
  }

  public async getAdbPath(): Promise<string> {
    if (!SystemProcess.adbPath) {
      await this.initialize();
    }
    return SystemProcess.adbPath || "error";
  }
}
