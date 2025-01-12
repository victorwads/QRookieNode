import { BrowserWindow } from "electron";
import { Command, CommandEvent } from "../shared";

export type DevToolsCommandName = 'devTools'
export type DevToolsCommand = Command<void, void, DevToolsCommandName>
export type DevToolsCommandEvent = CommandEvent<void, DevToolsCommandName>

export default {
  type: 'devTools',
  receiver: function () {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      if (focusedWindow.webContents.isDevToolsOpened()) {
        focusedWindow.webContents.closeDevTools();
      } else {
        focusedWindow.webContents.openDevTools();
      }
    }
  }
} as DevToolsCommand;