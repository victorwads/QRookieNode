import { Command, CommandEvent } from "@commands/types";
import settingsManager from "./manager";

export type SettingsCommandPayload = SettinsActions;
export type SettingsCommandOutput = Settings | SystemHealth;
export type SettingsCommandName = "settings";
export type SettingsCommand = Command<SettingsCommandPayload, Settings, SettingsCommandName>;
export type SettingsCommandEvent = CommandEvent<SettingsCommandPayload, SettingsCommandName>;
export type SettingsCommandOutputs = {
  settings: Settings;
  systemHealth: SystemHealth;
};
export type Settings = {
  downloadsDir?: string;
};
export type SystemHealth = {
  appVersion: string;
  electronVersion: string;
  bundledNodeVersion: string;
  adb: string;
  unzip: string;
  sevenZip: string;
  java: string;
};

export type SettinsActions = {
  action: "list" | "setDownloadsDir" | "getSystemHealth";
};

export default {
  type: "settings",
  receiver: async function (payload: SettingsCommandPayload): Promise<SettingsCommandOutput> {
    if (payload.action === "getSystemHealth") {
      return settingsManager.getSystemHealth();
    } else if (payload.action === "setDownloadsDir") {
      await settingsManager.setDownloadsDir();
    }
    return settingsManager.get();
  },
} as SettingsCommand;
