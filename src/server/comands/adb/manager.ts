import * as fs from "fs";
import * as path from "path";

import log from "@server/log";
import SystemProcess from "@server/systemProcess";
import type { AppInfo, Device, User } from ".";

class AdbManager extends SystemProcess {
  private currentDevice: Device | null = null;
  private devices: Device[] = [];
  private users: User[] = [];
  private apps: AppInfo[] = [];
  public serial: string | null = null;

  constructor() {
    super();
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    await this.listDevices();
  }

  private async runAdbCommand(args: string[]): Promise<string> {
    const { stdout } = await this.runCommand(await this.getAdbPath(), args);
    return stdout;
  }

  private getDeviceSerial(): string | undefined {
    if (!(this.serial && this.devices.find(device => device.serial === this.serial))) {
      this.selectDevice(this.devices[0]?.serial);
    }
    return this.serial || undefined;
  }

  public selectDevice(serial: string): void {
    this.apps = [];
    this.users = [];
    this.serial = serial;
  }

  private async getSerials(): Promise<string[]> {
    const output = await this.runAdbCommand(["devices"]);
    const lines = output.split("\n").slice(1);
    return lines
      .filter(line => line.includes("\tdevice"))
      .map(line => {
        const [serial] = line.split("\t");
        return serial.trim();
      });
  }

  public async listDevices(): Promise<Device[]> {
    const serials = await this.getSerials();
    const all = serials.map(async serial => ({
      serial,
      ip: await this.getIp(serial),
      model:
        this.devices.find(device => device.serial === serial)?.model ||
        (await this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.product.model"])),
    }));

    this.devices = (await Promise.all(all)).map(device => ({
      ...(this.devices.find(d => d.serial === device.serial) || {}),
      ...device,
    }));

    const serial = this.getDeviceSerial();
    this.currentDevice = this.devices.find(device => device.serial === serial) || null;

    return this.devices;
  }

  public async getDeviceInfo(serial?: string): Promise<Device | null> {
    serial = this.getDeviceSerial();
    if (!serial) return null;

    const cachedDevice: Device = this.devices.find(device => device.serial === serial) || {
      serial: serial,
    };

    const ip = cachedDevice.ip || this.getIp(serial);
    const model =
      cachedDevice?.model ||
      this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.product.model"]);
    const androidVersion =
      cachedDevice?.androidVersion ||
      this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.build.version.release"]);
    const sdkVersion =
      cachedDevice?.sdkVersion?.toString() ||
      this.runAdbCommand(["-s", serial, "shell", "getprop", "ro.build.version.sdk"]);
    const batteryOutput = this.runAdbCommand(["-s", serial, "shell", "dumpsys", "battery"]);
    const spaceUsageOutput = this.runAdbCommand(["-s", serial, "shell", "df", "/sdcard"]);

    const batteryLevel = parseInt((await batteryOutput)?.match(/level:\s*(\d+)/)?.[1] || "0", 10);
    const [, total, used] =
      (await spaceUsageOutput).split("\n")[1]?.match(/(\d+)\s+(\d+)\s+(\d+)/) || [];

    cachedDevice.model = await model;
    cachedDevice.ip = await ip;
    cachedDevice.androidVersion = await androidVersion;
    cachedDevice.sdkVersion = parseInt(await sdkVersion, 10);
    cachedDevice.batteryLevel = batteryLevel;
    cachedDevice.spaceUsage = { total: parseInt(total || "0"), used: parseInt(used || "0") };
    return cachedDevice;
  }

  private async getIp(serial: string): Promise<string | null> {
    const ip = await this.runAdbCommand(["-s", serial, "shell", "ip", "route"]);
    const filteredIp = ip.match(/src\s+(\d+\.\d+\.\d+\.\d+)/)?.[1] || "";
    return filteredIp.trim().length > 0 ? filteredIp : null;
  }

  public async listUsers(serial?: string): Promise<User[]> {
    serial = this.getDeviceSerial();
    if (!serial) return [];

    if (!this.users.length) {
      return this.users;
    }

    const output = await this.runAdbCommand(["-s", serial, "shell", "pm", "list", "users"]);
    const lines = output.split("\n").filter(line => line.includes("UserInfo"));
    this.users = lines.map(line => {
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
    if (!serial) return [];

    if (this.apps.length > 0) {
      return this.apps;
    }

    const args = [
      "-s",
      serial,
      "shell",
      "pm",
      "list",
      "packages",
      "--user",
      userId.toString(),
      "--show-versioncode",
      "-3",
    ];

    const output = await this.runAdbCommand(args);
    const lines = output.split("\n").filter(Boolean);
    this.apps = lines.map(line => {
      const match = line.match(/package:(\S+)\s+versionCode:(\d+)/);
      return {
        packageName: match?.[1] || "",
        versionCode: parseInt(match?.[2] || "0"),
      };
    });
    return this.apps;
  }

  public async connectWifi(serial: string): Promise<string | null> {
    const ip = await this.getIp(serial);
    if (!ip) {
      log.error(new Error("Failed to get IP address"));
      return null;
    }
    await this.runAdbCommand(["-s", serial, "tcpip", "5555"]);
    return this.connectTcp(ip);
  }

  public async connectTcp(address: string): Promise<string | null> {
    await this.runAdbCommand(["connect", address]);
    const serials = await this.getSerials();
    const newSerial = serials.find(s => s.includes(address));
    if (!newSerial) {
      log.error(new Error("Failed to connect to the device" + address));
      return null;
    }
    this.selectDevice(newSerial);
    return newSerial;
  }

  public async pair(address: string, code: string): Promise<boolean> {
    const output = await this.runAdbCommand(["pair", address, code]);
    return output.includes("connected to") || output.includes("successfully");
  }

  public async uninstall(packageName: string) {
    const serial = this.getDeviceSerial();
    if (!serial) throw new Error("No device selected");

    await this.runAdbCommand(["-s", serial, "uninstall", packageName]);

    this.apps = this.apps.filter(app => app.packageName !== packageName);
  }

  public async install(apkPath: string): Promise<boolean> {
    const serial = this.getDeviceSerial();
    if (!serial) throw new Error("No device selected");
    if (!fs.existsSync(apkPath)) throw new Error("APK not found " + apkPath);

    await this.runAdbCommand(["-s", serial, "install", apkPath]);

    this.apps = [];
    return true;
  }

  public createObbDir(packageName: string): void {
    const serial = this.getDeviceSerial();
    if (!serial) throw new Error("No device selected");

    void this.runAdbCommand([
      "-s",
      serial,
      "shell",
      "mkdir",
      "-p",
      `/sdcard/Android/obb/${packageName}/`,
    ]);
  }

  public async pushObbFile(filePath: string, packageName: string): Promise<void> {
    const serial = this.getDeviceSerial();
    if (!serial) throw new Error("No device selected");
    if (!fs.existsSync(filePath)) throw new Error("File not found " + filePath);

    const fileName = path.basename(filePath);
    await this.runAdbCommand([
      "-s",
      serial,
      "push",
      "-p",
      filePath,
      `/sdcard/Android/obb/${packageName}/${fileName}`,
    ]);
  }

  public async listObbFiles(packageName: string): Promise<string[]> {
    const serial = this.getDeviceSerial();
    if (!serial) throw new Error("No device selected");

    const output = await this.runAdbCommand([
      "-s",
      serial,
      "shell",
      "ls",
      `/sdcard/Android/obb/${packageName}/`,
    ]);

    return output.split("\n");
  }
}

const adbManager = new AdbManager();
export default adbManager;
