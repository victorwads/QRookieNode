import { Command, CommandEvent } from "../../shared";
import settingsManager from "./manager";

export type SettingsCommandPayload = SettinsActions;
export type SettingsCommandName = 'settings';
export type SettingsCommand = Command<SettingsCommandPayload, Settings, SettingsCommandName>;
export type SettingsCommandEvent = CommandEvent<SettingsCommandPayload, SettingsCommandName>
export type Settings = {
  downloadsDir?: string;
}

export type SettinsActions = {
  action: 'list' | 'setDownloadsDir';
}

export default {
  type: 'settings',
  receiver: async function (payload: SettingsCommandPayload): Promise<Settings> {
    if (payload.action === 'setDownloadsDir') {
      await settingsManager.setDownloadsDir();
    }
    return settingsManager.get();
  }
} as SettingsCommand;