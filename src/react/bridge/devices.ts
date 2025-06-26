import bridge from ".";

import type { AdbCommandInput, AdbCommandName, AdbCommandOutput } from "@server/commands/types";
export type { AdbCommandOutput, Device } from "@server/commands/types";

class DeviceManager {
  private cache: AdbCommandOutput["list"] = {
    devices: [],
    users: [],
    apps: [],
  };

  constructor() {
    void this.getDevices();
  }

  public getDevicesCache(): AdbCommandOutput["list"] {
    return this.cache;
  }

  public getPackageVersion(packageName: string): number | null {
    const app = this.cache.apps.find(app => app.packageName === packageName);
    return app ? app.versionCode : null;
  }

  public isGameInstalled(packageName?: string): boolean {
    return this.cache.apps.some(app => app.packageName === packageName);
  }

  public async getDevices(): Promise<AdbCommandOutput["list"]> {
    const result = bridge.sendCommand<AdbCommandName, AdbCommandInput, AdbCommandOutput["list"]>({
      type: "adb",
    });
    this.cache = await result;
    return this.cache;
  }

  public async setDevice(serial: string) {
    await bridge.sendCommand<AdbCommandName, AdbCommandInput, void>({
      type: "adb",
      payload: { command: "selectDevice", serial: serial },
    });
  }

  public async connectWifi(serial: string): Promise<boolean> {
    return !!(await bridge.sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: "adb",
      payload: { command: "connectWifi", serial: serial },
    }));
  }

  public async connectTcp(address: string): Promise<boolean> {
    return !!(await bridge.sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: "adb",
      payload: { command: "connectTcp", address },
    }));
  }

  public async pair(address: string, code: string): Promise<boolean> {
    return !!(await bridge.sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: "adb",
      payload: { command: "pair", address, code },
    }));
  }
}

const deviceManager = new DeviceManager();
export default deviceManager;
