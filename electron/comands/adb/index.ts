import { Command, CommandEvent } from "../../shared";
import AdbManager from "./manager";

export type AdbCommandName = 'adb';
export type AdbCommand = Command<AdbCommandInput, AdbCommandOutput, AdbCommandName>;
export type AdbCommandEvent = CommandEvent<AdbCommandInput, AdbCommandName>
export type AdbCommandInput = { 
  command: 'selectDevice';
  deviceId: string;
} | void

export type Device = {
  serial: string;
  model: string;
  ip?: string;
  batteryLevel?: number;
  androidVersion?: string;
  sdkVersion?: number;
  spaceUsage?: {
      total: number;
      used: number;
  };
}

export type User = {
  id: number;
  name: string;
  running: boolean;
  installedApps?: number;
}

export type AppInfo = {
  packageName: string;
  versionCode: number;
}

export interface AdbCommandOutput {
  devices: Device[];
  deviceInfo?: Device;
  users: User[];
  apps: AppInfo[];
  helthCheck: string;
}

export default {
  type: 'adb',
  receiver: async function () {
    const devices = await AdbManager.listDevices();
    return {
      devices,
      deviceInfo: await AdbManager.getDeviceInfo(),
      users: await AdbManager.listUsers(),
      apps: await AdbManager.listPackagesForUser(),
      helthCheck: await AdbManager.helthCheck(),
    } as AdbCommandOutput;
  }
} as AdbCommand;
