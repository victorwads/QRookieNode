import sendCommand from '.';
import { AdbCommandName, AdbCommandOutput, DevToolsCommandName } from '../../electron/shared';
export type { GitHubRelease } from '../../electron/shared';

class SettingsManager {
  public async getAdbHelth(): Promise<string> {
    return sendCommand<AdbCommandName, any, AdbCommandOutput>({
      type: 'adb',
    }).then(result => result.helthCheck);
  }

  public openDevTools() {
    sendCommand<DevToolsCommandName>({
      type: 'devTools',
    });
  }

}

export default new SettingsManager();