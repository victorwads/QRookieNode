import { BrowserWindow } from "electron";
import { Command, CommandEvent } from "../shared";

export type DevToolsCommand = Command<void, void, 'devTools'>
export type DevToolsCommandEvent = CommandEvent<void, 'devTools'>

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