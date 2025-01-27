import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { Device, User, AppInfo } from "./types";
import { platformToolsDir, binExt, setupTools } from "./androidToolsSetup";


let adbPath = path.join(platformToolsDir, "adb" + binExt);
const execFileAsync = promisify(execFile);

execFileAsync("which", ["adb"])
  .then(({ stdout }) => {
    const path = "";stdout.trim();
    if (path !== ""){
      adbPath = path;
      console.log("ADB found at:", path);
    } else {
      console.log("ADB not found, downloading platform-tools. which returned:", path);
      setupTools();
    }
  })
  .catch(() => {
    console.log("ADB not found, downloading platform-tools");
    setupTools();
  });


class AdbManager {
  private devices: Device[] = [];
  private users: User[] = [];
  private apps: AppInfo[] = [];
  public serial: string|null = null;

  private async runAdbCommand(args: string[]): Promise<string> {
    try {
      const { stdout } = await execFileAsync(adbPath, args);
      return stdout.trim();
    } catch (error: any) {
      console.error("ADB Command Error:", error.message);
      throw new Error(error.message || "ADB Command Failed");
    }
  }

  public async helthCheck(): Promise<string> {
    try {
      return await this.runAdbCommand(["version"]);;
    } catch (error: any) {
      return error.toString();
    }
  }

  private getDeviceSerial(): string {
    return this.serial || this.devices[0]?.serial || "";
  }

  public async listDevices(): Promise<Device[]> {
    const output = await this.runAdbCommand(["devices"]);
    const lines = output.split("\n").slice(1);
    const all = lines
      .filter((line) => line.includes("\tdevice"))
      .map(async (line) => {
        const [serial] = line.split("\t");
        return { 
          serial,
          model: await this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.product.model"])
        };
      });
    this.devices = await Promise.all(all);
    
    if((!this.serial && this.devices.length > 0) || this.devices.length === 1) {
      this.serial = this.devices[0].serial;
    }
    return this.devices;
  }

  public async getDeviceInfo(serial?: string): Promise<Device|null> {
    serial = this.getDeviceSerial();
    if (!serial) return null

    const model = await this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.product.model"]);
    const ip = await this.runAdbCommand(["-s", serial, "shell", "ip", "route"]);
    const androidVersion = await this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.build.version.release"]);
    const sdkVersion = await this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.build.version.sdk"]);
    const batteryOutput = await this.runAdbCommand(["-s", serial, "shell", "dumpsys", "battery"]);
    const spaceUsageOutput = await this.runAdbCommand(["-s", serial, "shell", "df", "/sdcard"]);

    // Processar os resultados
    const batteryLevel = parseInt(batteryOutput.match(/level:\s*(\d+)/)?.[1] || "0", 10);
    const [, total, used] = spaceUsageOutput.split('\n')[1].match(/(\d+)\s+(\d+)\s+(\d+)/) || [];
    
    const device: Device = {
      serial,
      model,
      ip: ip.match(/src\s+(\d+\.\d+\.\d+\.\d+)/)?.[1],
      androidVersion,
      sdkVersion: parseInt(sdkVersion, 10),
      batteryLevel,
      spaceUsage: { total: parseInt(total || "0"), used: parseInt(used || "0") },
    };

    return device;
  }

  public async listUsers(serial?: string): Promise<User[]> {
    serial = this.getDeviceSerial();
    if (!serial) return []

    const output = await this.runAdbCommand(["-s", serial, "shell", "pm", "list", "users"]);
    const lines = output.split("\n").filter((line) => line.includes("UserInfo"));
    this.users = lines.map((line) => {
      const match = line.match(/UserInfo\{(\d+):([^:]+):/);
      return {
        id: parseInt(match?.[1] || "-1", 10),
        name: match?.[2] || "Unknown",
        running: line.includes("running"),
      };
    });
    return this.users;
  }

  public async listPackagesForUser(serial?: string, userId?: number): Promise<AppInfo[]> {
    serial = this.getDeviceSerial();
    if (!serial) return []

    const args = [
      "-s", serial,
      "shell","pm","list","packages",
      "--show-versioncode",
      "-3",
    ]
    if(userId) {
      args.push("--user", userId.toString());
    }

    const output = await this.runAdbCommand(args);
    const lines = output.split("\n").filter(Boolean);
    this.apps = lines.map((line) => {
      const match = line.match(/package:(\S+)\s+versionCode:(\d+)/);
      return {
        packageName: match?.[1] || "",
        versionCode: parseInt(match?.[2] || "0", 10),
      };
    });
    return this.apps;
  }
}

const adbManager = new AdbManager();
export default adbManager;