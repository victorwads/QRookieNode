import { ipcMain, IpcMainInvokeEvent, app, net, protocol } from "electron";
import path from "path";

import { BridgeSendCommandEvent, CommandEvent, GameStatusInfo } from "../../comands/types";
import { getImagePath } from "../../comands/games/images";
import { executeCommand } from "../../comands";
import { getMainWindow } from ".";

app.whenReady().then(() => {
  protocol.handle('game-image', (request) => {
    const packageName = decodeURIComponent(request.url.replace("game-image://", ""));
    return net.fetch('file://' + path.normalize(getImagePath(packageName)));
  })
});

console.log("Bridge is ready");
ipcMain.handle(BridgeSendCommandEvent, async (event: IpcMainInvokeEvent, comandEvent: CommandEvent<any, any>) => {
  return executeCommand(comandEvent);
});

export const sendInfo = async (info: GameStatusInfo) => {
  getMainWindow()?.webContents.send("downloadProgress", info);
}