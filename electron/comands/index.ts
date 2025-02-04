import { ipcMain, IpcMainInvokeEvent } from "electron";

import DevToolsCommand from "./devTools";
import AdbCommand from "./adb";
import GamesCommand from "./games";
import SettingsCommand from "./settings";
import { BridgeSendCommandEvent, Command, CommandEvent } from "../shared";

const commands: Command<any, any, any>[] = [
  DevToolsCommand,
  AdbCommand,
  GamesCommand,
  SettingsCommand,
];

const setupBridge = () => {
  ipcMain.handle(BridgeSendCommandEvent, async (event: IpcMainInvokeEvent, comandEvent: CommandEvent<any, any>) => {
    const command = commands.filter((command) => command.type === comandEvent.type)
    if (command.length === 1) {
      return await command[0].receiver(comandEvent.payload);
    } if (command.length > 1) {
      console.log(`Multiple commands with the same type: ${comandEvent.type}`, commands);
    } else {
      console.log(`Unknown command type: ${comandEvent.type}`);
    }
    return null;
  });
}

setupBridge();