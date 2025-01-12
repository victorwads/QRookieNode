import { BrowserWindow } from "electron";
import { Command, CommandEvent } from "../shared";

export type DevToolsCommandName = 'devTools'
export type DevToolsCommand = Command<void, void, DevToolsCommandName>
export type DevToolsCommandEvent = CommandEvent<void, void, DevToolsCommandName>

export default {
    type: 'devTools',
    receiver: function () {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow) {
            focusedWindow.webContents.isDevToolsOpened()
            ? focusedWindow.webContents.closeDevTools()
            : focusedWindow.webContents.openDevTools();
        }
    }
} as DevToolsCommand;