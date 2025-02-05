import { ipcMain, IpcMainInvokeEvent, app, net, protocol } from "electron";
import path from "path";

import { executeCommand, getImagePath } from ".";
import { BridgeSendCommandEvent, CommandEvent, GameStatusInfo } from "../shared";
import { getMainWindow } from "../main";

app.whenReady().then(() => {
  protocol.handle('game-image', (request) => {
    const packageName = decodeURIComponent(request.url.replace("game-image://", ""));
    return net.fetch('file://' + path.normalize(getImagePath(packageName)));
  })
});

ipcMain.handle(BridgeSendCommandEvent, async (event: IpcMainInvokeEvent, comandEvent: CommandEvent<any, any>) => {
  return executeCommand(comandEvent);
});

export const sendInfoWithElectron = async (info: GameStatusInfo) => {
  getMainWindow()?.webContents.send("downloadProgress", info);
}