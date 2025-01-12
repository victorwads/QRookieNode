import { ipcMain, IpcMainInvokeEvent } from "electron";

import DevToolsCommand from "./devTools";
import AdbCommand from "./adb";
import GamesCommand from "./games";
import { BridgeSendCommandEvent, Command, CommandEvent } from "../shared";

const commands: Command<any, any, any>[] = [
  DevToolsCommand,
  AdbCommand,
  GamesCommand,
];

const setupBridge = () => {
  ipcMain.handle(BridgeSendCommandEvent, async (event: IpcMainInvokeEvent, comandEvent: CommandEvent<any, any>) => {
    const command = commands.filter((command) => command.type === comandEvent.type)
    if (command.length == 1) {
      return await command[0].receiver(comandEvent.payload);
    } if (command.length > 1) {
      console.error(`Multiple commands with the same type: ${comandEvent.type}`, commands);
    } else {
      console.error(`Unknown command type: ${comandEvent.type}`);
    }
    return null;
  });
}
export default setupBridge;