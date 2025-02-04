import { Command, CommandEvent } from "../../shared";
import settingsManager from "./manager";

export type SettingsCommandPayload = SettinsActions;
export type SettingsCommandOutput = Settings | SystemHelth;
export type SettingsCommandName = 'settings';
export type SettingsCommand = Command<SettingsCommandPayload, Settings, SettingsCommandName>;
export type SettingsCommandEvent = CommandEvent<SettingsCommandPayload, SettingsCommandName>
export type SettingsCommandOutputs = {
  settings: Settings;
  systemHelth: SystemHelth;
}
export type Settings = {
  downloadsDir?: string;
}
export type SystemHelth = {
  appVersion: string;
  electronVersion: string;
  bundledNodeVersion: string;
  adb: string;
  unzip: string;
  sevenZip: string;
  java: string;
}

export type SettinsActions = {
  action: 'list' | 'setDownloadsDir' | 'getSystemHelth';
}

export default {
  type: 'settings',
  receiver: async function (payload: SettingsCommandPayload): Promise<SettingsCommandOutput> {
    if (payload.action === 'getSystemHelth') {
      return settingsManager.getSystemHelth();
    } else if (payload.action === 'setDownloadsDir') {
      await settingsManager.setDownloadsDir();
    }
    return settingsManager.get();
  }
} as SettingsCommand;