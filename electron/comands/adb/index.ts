import { Command, CommandEvent } from "../../shared";
import AdbManager from "./manager";
import { AppInfo, Device, User } from "./types";

export type AdbCommandName = 'adb';
export type AdbCommand = Command<AdbCommandInput, AdbCommandOutput, AdbCommandName>;
export type AdbCommandEvent = CommandEvent<AdbCommandInput, AdbCommandName>
export interface AdbCommandOutput {
  devices: Device[];
  deviceInfo?: Device;
  users: User[];
  apps: AppInfo[];
  helthCheck: string;
}
export type AdbCommandInput = { 
  command: 'selectDevice';
  deviceId: string;
} | void

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
