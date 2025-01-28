import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { platformToolsDir, binExt, setupTools } from "./androidToolsSetup";
import type { Device, User, AppInfo } from "./";

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
      return "error"
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

  public selectDevice(serial: string): void {
    this.serial = serial;
  }

  private async getSerials(): Promise<string[]> {
    const output = await this.runAdbCommand(["devices"]);
    const lines = output.split("\n").slice(1);
    return lines
      .filter((line) => line.includes("\tdevice"))
      .map((line) => {
        const [serial] = line.split("\t");
        return serial.trim();
      });
  }

  public async listDevices(): Promise<Device[]> {
    const serials = await this.getSerials();
    const all = serials.map(async (serial) => ({ 
      serial,
      ip: await this.getIp(serial),
      model: await this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.product.model"])
    }));
    this.devices = await Promise.all(all);
    
    if((!this.serial && this.devices.length > 0) || this.devices.length === 1) {
      this.serial = this.devices[0].serial;
    }
    return this.devices;
  }

  public async getDeviceInfo(serial?: string): Promise<Device|null> {
    serial = this.getDeviceSerial();
    if (!serial) return null

    const ip = this.getIp(serial);
    const model = this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.product.model"]);
    const androidVersion = this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.build.version.release"]);
    const sdkVersion = this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.build.version.sdk"]);
    const batteryOutput = this.runAdbCommand(["-s", serial, "shell", "dumpsys", "battery"]);
    const spaceUsageOutput = this.runAdbCommand(["-s", serial, "shell", "df", "/sdcard"]);

    // Processar os resultados
    const batteryLevel = parseInt((await batteryOutput)?.match(/level:\s*(\d+)/)?.[1] || "0", 10);
    const [, total, used] = (await spaceUsageOutput).split('\n')[1]?.match(/(\d+)\s+(\d+)\s+(\d+)/) || [];
    
    return {
      serial,
      model: await model,
      ip: await ip,
      androidVersion: await androidVersion,
      sdkVersion: parseInt(await sdkVersion, 10),
      batteryLevel,
      spaceUsage: { total: parseInt(total || "0"), used: parseInt(used || "0") },
    } as Device;
  }

  private async getIp(serial: string): Promise<string|null> {
    const ip = await this.runAdbCommand(["-s", serial, "shell", "ip", "route"]);
    const filteredIp = ip.match(/src\s+(\d+\.\d+\.\d+\.\d+)/)?.[1] || "";
    return filteredIp.trim().length > 0 ? filteredIp : null;
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

  public async listPackagesForUser(serial?: string, userId: number = 0): Promise<AppInfo[]> {
    serial = this.getDeviceSerial();
    if (!serial) return []

    const args = [
      "-s", serial,
      "shell","pm","list","packages",
      "--user", userId.toString(),
      "--show-versioncode",
      "-3",
    ]

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

  public async connectWifi(serial: string): Promise<string|null> {
    const ip = await this.getIp(serial);
    if (!ip) {
      console.log(new Error("Failed to get IP address"));
      return null;
    }
    await this.runAdbCommand(["-s", serial, "tcpip", "5555"]);
    await this.runAdbCommand(["connect", ip]);
    const serials = await this.getSerials();
    const newSerial = serials.find((s) => s.includes(ip));
    if (!newSerial) {
      console.error(new Error("Failed to connect to the device"));
      return null;
    }
    this.serial = newSerial;
    return newSerial;
  }
}

const adbManager = new AdbManager();
export default adbManager;