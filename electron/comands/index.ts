import path from "path";
import fs from "fs";

import { Command, CommandEvent } from "../shared";
import { downloadDir } from "./dirs";
import log from "../log";

import { sendInfoWithElectron } from "./CommandsWithElectron";
import { sendInfoWithWebSocket } from "../main/node/CommandsWithWebSocket";
import GamesCommand, { GameStatusInfo } from "./games";
import SettingsCommand from "./settings";
import DevToolsCommand from "./devTools";
import AdbCommand from "./adb";

const commands: Command<any, any, any>[] = [
  DevToolsCommand,
  AdbCommand,
  GamesCommand,
  SettingsCommand,
];

export const getImagePath = (packageName: string) => {
  let filePath = path.join(downloadDir, ".meta", "thumbnails", packageName + ".jpg");
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../../../assets/images/matrix.png');
  }
  return filePath;
}

export const executeCommand = async (comandEvent: CommandEvent<any, any>) => {
  const command = commands.filter((command) => command.type === comandEvent.type)
  if (command.length === 1) {
    return await command[0].receiver(comandEvent.payload);
  } if (command.length > 1) {
    log.error(`Multiple commands with the same type: ${comandEvent.type}`, commands);
  } else {
    log.error(`Unknown command type: ${comandEvent.type}`);
  }
  return null;
}

export const downloadProgress = async (info: GameStatusInfo) => {
  sendInfoWithElectron(info);
  sendInfoWithWebSocket(info);
}