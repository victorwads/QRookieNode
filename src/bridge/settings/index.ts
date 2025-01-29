import sendCommand from '..';
import { AdbCommandName, AdbCommandOutput, DevToolsCommandName, Settings, SettingsCommandName, SettingsCommandPayload } from '../../../electron/shared';
import { promisse, RepoDownloadsInfo, repoDownloadsInfo } from './repoInfo';
export type { GitHubRelease, Settings } from '../../../electron/shared';

export type { RepoDownloadsInfo }

class SettingsManager {
  public async getAdbHelth(): Promise<string> {
    return sendCommand<AdbCommandName, any, AdbCommandOutput['list']>({
      type: 'adb',
    }).then(result => result.helthCheck);
  }

  public openDevTools() {
    sendCommand<DevToolsCommandName>({
      type: 'devTools',
    });
  }

  public async getSettings(): Promise<Settings> {
    return await sendCommand<SettingsCommandName, SettingsCommandPayload, Settings>({
      type: 'settings',
      payload: {
        action: 'list',
      }
    });
  }

  public async setDownloadPath(): Promise<Settings> {
    return await sendCommand<SettingsCommandName, SettingsCommandPayload>({
      type: 'settings',
      payload: {
        action: 'setDownloadsDir',
      }
    });
  }

  public getReposInfo(): RepoDownloadsInfo {
    return repoDownloadsInfo;
  }

  public async fetchReposInfo(): Promise<RepoDownloadsInfo> {
    await promisse;
    return repoDownloadsInfo;
  }
}

export default new SettingsManager();