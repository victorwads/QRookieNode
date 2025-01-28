import sendCommand from '.';

import type { AdbCommandName, AdbCommandOutput, Device } from '../../electron/shared';
export type { Device, AdbCommandOutput } from '../../electron/shared';

class DeviceManager {

  private current: Device | null = null;
  private cache: AdbCommandOutput = {
    devices: [],
    users: [],
    apps: [],
    helthCheck: 'loading...',
  };

  public getDevicesCache(): AdbCommandOutput {
    return this.cache;
  }

  public async getDevices(): Promise<AdbCommandOutput> {
    const result = sendCommand<AdbCommandName, any, AdbCommandOutput>({
      type: 'adb',
    });
    this.cache = await result;
    return this.cache;
  }

  public getDevice(): Device | null {
    return this.current
  }

  public setDevice(serial: string) {
    this.cache.devices.find((d) => d.serial === serial);
  }
}

export default new DeviceManager();