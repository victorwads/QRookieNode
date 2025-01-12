import { setupTools } from "./androidToolsSetup";
import { Command, CommandEvent } from "../../shared";
import AdbManager from "./manager";

export const setupToolsPromisse = setupTools()
  .then(() => console.log("Tools setup successfully!"))
  .catch((err) => console.error("Error setting up tools:", err));


export type AdbPayload = object
export type AdbCommandName = 'adb';
export type AdbCommand = Command<AdbPayload, string, AdbCommandName>;
export type AdbCommandEvent = CommandEvent<AdbPayload, AdbCommandName>

export default {
  type: 'adb',
  receiver: async function () {
    const devices = await AdbManager.listDevices();
    return JSON.stringify(
      {
        devices,
        deviceInfo: await AdbManager.getDeviceInfo(),
        users: await AdbManager.listUsers(),
        apps: await AdbManager.listPackagesForUser()
      }
      , null, 2);
  }
} as AdbCommand;
