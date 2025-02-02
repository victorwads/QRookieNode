import sendCommand from '..';
import { DevToolsCommandName, Settings, SettingsCommandName, SettingsCommandOutputs, SettingsCommandPayload, SystemHelth } from '../../../electron/shared';
import { promisse, RepoDownloadsInfo, repoDownloadsInfo } from './repoInfo';
export type { GitHubRelease, Settings, SystemHelth } from '../../../electron/shared';

export type { RepoDownloadsInfo }

class SettingsManager {
  public async getHelthInfo(): Promise<SystemHelth> {
    return sendCommand<SettingsCommandName, SettingsCommandPayload, SettingsCommandOutputs['systemHelth']>({
      type: 'settings',
      payload: {
        action: 'getSystemHelth'
      }
    });
  }

  public openDevTools() {
    sendCommand<DevToolsCommandName>({
      type: 'devTools',
    });
  }

  public async getSettings(): Promise<Settings> {
    return await sendCommand<SettingsCommandName, SettingsCommandPayload, SettingsCommandOutputs['settings']>({
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