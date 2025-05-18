import { Command, CommandEvent } from "@comands/types";
import { sendInfo } from "@server";
import log from "@server/log";

import AdbCommand from "./adb";
import GamesCommand, { GameStatusInfo } from "./games";
import SettingsCommand from "./settings";
import DevToolsCommand from "./settings/devTools";

const commands: Command<any, any, any>[] = [
  DevToolsCommand,
  AdbCommand,
  GamesCommand,
  SettingsCommand,
];

export const executeCommand = async (comandEvent: CommandEvent<any, any>) => {
  const command = commands.filter(command => command.type === comandEvent.type);
  if (command.length === 1) {
    return await command[0].receiver(comandEvent.payload);
  }
  if (command.length > 1) {
    log.error(`Multiple commands with the same type: ${comandEvent.type}`, commands);
  } else {
    log.error(`Unknown command type: ${comandEvent.type}`);
  }
  return null;
};

export const downloadProgress = async (info: GameStatusInfo) => {
  sendInfo(info);
};
