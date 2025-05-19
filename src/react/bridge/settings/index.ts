import semver from "semver";

import { promisse, RepoDownloadsInfo, repoDownloadsInfo } from "./repoInfo";

import bridge from "@bridge";
import {
  DevToolsCommandName,
  Settings,
  SettingsCommandName,
  SettingsCommandOutputs,
  SettingsCommandPayload,
  SystemHelth,
} from "@server/comands/types";
export type { GitHubRelease, Settings, SystemHelth } from "@server/comands/types";
export type { RepoDownloadsInfo };

class SettingsManager {
  public async getHelthInfo(): Promise<SystemHelth> {
    return bridge.sendCommand<
      SettingsCommandName,
      SettingsCommandPayload,
      SettingsCommandOutputs["systemHelth"]
    >({
      type: "settings",
      payload: {
        action: "getSystemHelth",
      },
    });
  }

  public openDevTools() {
    void bridge.sendCommand<DevToolsCommandName>({
      type: "devTools",
    });
  }

  public async getSettings(): Promise<Settings> {
    return await bridge.sendCommand<
      SettingsCommandName,
      SettingsCommandPayload,
      SettingsCommandOutputs["settings"]
    >({
      type: "settings",
      payload: {
        action: "list",
      },
    });
  }

  public async setDownloadPath(): Promise<Settings> {
    return (await bridge.sendCommand<SettingsCommandName, SettingsCommandPayload>({
      type: "settings",
      payload: {
        action: "setDownloadsDir",
      },
    })) as Settings;
  }

  public getReposInfo(): RepoDownloadsInfo {
    return repoDownloadsInfo;
  }

  public async fetchReposInfo(): Promise<RepoDownloadsInfo> {
    await promisse;
    return repoDownloadsInfo;
  }

  public async hasUpdate(): Promise<string | null> {
    const info = (await this.fetchReposInfo())["victorwads/QRookieNode"];
    const appVersion = (await this.getHelthInfo()).appVersion;

    if (semver.gt(info.lastAppVersion, appVersion)) {
      return `https://github.com/victorwads/QRookieNode/releases/tag/${info.lastAppVersion}`;
    }
    return null;
  }
}

const settingsManager = new SettingsManager();
export default settingsManager;
