import sendCommand from '.';

import type { AdbCommandInput, AdbCommandName, AdbCommandOutput } from '../../electron/shared';
export type { Device, AdbCommandOutput } from '../../electron/shared';

class DeviceManager {
  private cache: AdbCommandOutput['list'] = {
    devices: [],
    users: [],
    apps: [],
    helthCheck: 'loading...',
  };

  public getDevicesCache(): AdbCommandOutput['list'] {
    return this.cache;
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

  async connectWifi(serial: string): Promise<boolean> {
    const newSerial = await sendCommand<AdbCommandName, AdbCommandInput, string | null>({
      type: 'adb',
      payload: { command: 'connectWifi', serial: serial },
    });
    if (newSerial) {
      return true;
    }
    return false;
  }

}

export default new DeviceManager();