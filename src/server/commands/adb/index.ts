import { Command, CommandEvent } from "@commands/types";
import AdbManager from "./manager";

export type AdbCommandName = "adb";
export type AdbCommand = Command<AdbCommandInput, AdbCommandOutputs, AdbCommandName>;
export type AdbCommandEvent = CommandEvent<AdbCommandInput, AdbCommandName>;
export type AdbCommandInput =
  | {
      command: "selectDevice";
      serial: string;
    }
  | {
      command: "connectWifi";
      serial: string;
    }
  | {
      command: "connectTcp";
      address: string;
    }
  | {
      command: "pair";
      address: string;
      code: string;
    }
  | void;

export type Device = {
  serial: string;
  model?: string;
  ip?: string | null;
  batteryLevel?: number;
  androidVersion?: string;
  sdkVersion?: number;
  spaceUsage?: {
    total: number;
    used: number;
  };
};

export type User = {
  id: number;
  name: string;
  running: boolean;
};

export type AppInfo = {
  packageName: string;
  versionCode: number;
};

export type AdbCommandOutput = {
  list: {
    devices: Device[];
    deviceInfo?: Device;
    users: User[];
    apps: AppInfo[];
  };
};

type AdbCommandOutputs = AdbCommandOutput["list"] | void | string | null | boolean;

export default {
  type: "adb",
  receiver: async function (payload: AdbCommandInput): Promise<AdbCommandOutputs> {
    await AdbManager.initialize();

    if (payload?.command === "selectDevice") {
      AdbManager.selectDevice(payload.serial);
      return;
    } else if (payload?.command === "connectWifi") {
      return await AdbManager.connectWifi(payload.serial);
    } else if (payload?.command === "connectTcp") {
      return await AdbManager.connectTcp(payload.address);
    } else if (payload?.command === "pair") {
      return await AdbManager.pair(payload.address, payload.code);
    }

    const devices = await AdbManager.listDevices();
    const promises = {
      deviceInfo: AdbManager.getDeviceInfo(),
      users: AdbManager.listUsers(),
      apps: AdbManager.listPackagesForUser(),
    };
    const info = await promises.deviceInfo;
    return {
      devices: devices.map(device => {
        if (device.serial === info?.serial) {
          return info;
        }
        return device;
      }),
      deviceInfo: (await promises.deviceInfo) || undefined,
      users: await promises.users,
      apps: await promises.apps,
    };
  },
} as AdbCommand;
