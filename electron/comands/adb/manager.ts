import * as fs from "fs";

import log from "../../log";
import SystemProcess from "../../systemProcess";
import type { Device, User, AppInfo } from ".";

class AdbManager extends SystemProcess {
  private devices: Device[] = [];
  private users: User[] = [];
  private apps: AppInfo[] = [];
  public serial: string|null = null;

  constructor() {
    super();  
  }

  private async runAdbCommand(args: string[]): Promise<string> {
    const { stdout } = await this.runCommand(this.getAdbPath(), args);
    return stdout;
  }

  private getDeviceSerial(): string|undefined {
    if(!(this.serial && this.devices.find((device) => device.serial === this.serial))) {
      this.serial = this.devices[0]?.serial || null;
    }
    return this.serial || undefined;
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
      log.error(new Error("Failed to get IP address"));
      return null;
    }
    await this.runAdbCommand(["-s", serial, "tcpip", "5555"]);
    return this.connectTcp(ip);
  }

  public async connectTcp(address: string): Promise<string|null> {
    await this.runAdbCommand(["connect", address]);
    const serials = await this.getSerials();
    const newSerial = serials.find((s) => s.includes(address));
    if (!newSerial) {
      log.error(new Error("Failed to connect to the device" + address));
      return null;
    }
    this.serial = newSerial;
    return newSerial;
  }

  public async pair(address: string, code: string): Promise<boolean> {
    const output = await this.runAdbCommand(["pair", address, code]);
    return output.includes("connected to") || output.includes("successfully");
  }

  public async install(apkPath: string): Promise<boolean> {
    const serial = this.getDeviceSerial()
    if (!serial)
      throw new Error("No device selected");
    if (!fs.existsSync(apkPath))
      throw new Error("APK not found " + apkPath);

    await this.runAdbCommand([
      "-s", serial,
      "install", apkPath
    ]);

    return true;
  }

  public createObbDir(packageName: string): void {
    const serial = this.getDeviceSerial()
    if (!serial)
      throw new Error("No device selected");

    this.runAdbCommand([
      "-s", serial,
      "shell", "mkdir", "-p", `/sdcard/Android/obb/${packageName}/`
    ]);
  }

  public async pushObbFile(filePath: string, packageName: string): Promise<void> {
    const serial = this.getDeviceSerial()
    if (!serial)
      throw new Error("No device selected");
    if (!fs.existsSync(filePath))
      throw new Error("File not found " + filePath);
    
    await this.runAdbCommand([
      "-s", serial,
      "push", "-p", filePath, `/sdcard/Android/obb/${packageName}/`
    ]);
  }
}

const adbManager = new AdbManager();
export default adbManager;