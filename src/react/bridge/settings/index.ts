import semver from "semver";

import { repoInfo, RepoDownloadsInfo, repoDownloadsInfo } from "./repoInfo";

import bridge from "@bridge";
import {
  DevToolsCommandName,
  Settings,
  SettingsCommandName,
  SettingsCommandOutputs,
  SettingsCommandPayload,
  SystemHealth,
} from "@server/commands/types";
export type { GitHubRelease, Settings, SystemHealth } from "@server/commands/types";
export type { RepoDownloadsInfo };

class SettingsManager {
  public async getHealthInfo(): Promise<SystemHealth> {
    return bridge.sendCommand<
      SettingsCommandName,
      SettingsCommandPayload,
      SettingsCommandOutputs["systemHealth"]
    >({
      type: "settings",
      payload: {
        action: "getSystemHealth",
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
    await repoInfo;
    return repoDownloadsInfo;
  }

  public async hasUpdate(): Promise<string | null> {
    const info = (await this.fetchReposInfo())["victorwads/QRookieNode"];
    const appVersion = (await this.getHealthInfo()).appVersion;

    if (semver.gt(info.lastAppVersion, appVersion)) {
      return `https://github.com/victorwads/QRookieNode/releases/tag/${info.lastAppVersion}`;
    }
    return null;
  }
}

const settingsManager = new SettingsManager();
export default settingsManager;
