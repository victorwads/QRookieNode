import sendCommand from '.';

import type { AdbCommandInput, AdbCommandName, AdbCommandOutput } from '../../electron/shared';
export type { Device, AdbCommandOutput } from '../../electron/shared';

class DeviceManager {
  private cache: AdbCommandOutput['list'] = {
    devices: [],
    users: [],
    apps: [],
  };

  constructor() {
    this.getDevices();
  }

  public getDevicesCache(): AdbCommandOutput['list'] {
    return this.cache;
  }

  public isGameInstalled(packageName?: string): boolean {
    return this.cache.apps.some(app => app.packageName === packageName);
  }

  public async getDevices(): Promise<AdbCommandOutput['list']> {
    const result = sendCommand<AdbCommandName, AdbCommandInput, AdbCommandOutput['list']>({
      type: 'adb',
    });
    this.cache = await result;
    return this.cache;
  }

  public async setDevice(serial: string) {
    await sendCommand<AdbCommandName, AdbCommandInput, void>({
      type: 'adb',
      payload: { command: 'selectDevice', serial: serial },
    });
  }

  public async connectWifi(serial: string): Promise<boolean> {
    return !!await sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: 'adb',
      payload: { command: 'connectWifi', serial: serial },
    });
  }

  public async connectTcp(address: string): Promise<boolean> {
    return !!await sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: 'adb',
      payload: { command: 'connectTcp', address },
    });
  }

  public async pair(address: string, code: string): Promise<boolean> {
    return !!await sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: 'adb',
      payload: { command: 'pair', address, code },
    });
  }
}

export default new DeviceManager();