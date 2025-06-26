import { Command, CommandEvent } from "@commands/types";
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

export const executeCommand = async (commandEvent: CommandEvent<any, any>) => {
  const command = commands.filter(command => command.type === commandEvent.type);
  if (command.length === 1) {
    return await command[0].receiver(commandEvent.payload);
  }
  if (command.length > 1) {
    log.error(`Multiple commands with the same type: ${commandEvent.type}`, commands);
  } else {
    log.error(`Unknown command type: ${commandEvent.type}`);
  }
  return null;
};

export const downloadProgress = (info: GameStatusInfo) => {
  sendInfo(info);
};
