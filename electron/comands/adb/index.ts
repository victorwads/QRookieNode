import { setupTools } from "./androidToolsSetup";
import { Command, CommandEvent } from "../../shared";
import AdbManager from "./manager";
import { AppInfo, Device, User } from "./types";

export const setupToolsPromisse = setupTools()
  .then(() => console.log("Tools setup successfully!"))
  .catch((err) => console.error("Error setting up tools:", err));


export type AdbCommandName = 'adb';
export type AdbCommand = Command<AdbCommandInput, AdbCommandOutput, AdbCommandName>;
export type AdbCommandEvent = CommandEvent<AdbCommandInput, AdbCommandName>
export interface AdbCommandOutput {
  devices: Device[];
  deviceInfo?: Device;
  users: User[];
  apps: AppInfo[];
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
      apps: await AdbManager.listPackagesForUser()
    } as AdbCommandOutput;
  }
} as AdbCommand;
