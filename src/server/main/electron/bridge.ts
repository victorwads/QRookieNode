import { app, ipcMain, IpcMainInvokeEvent, net, protocol } from "electron";
import path from "path";

import { executeCommand } from "@server/comands";
import { getImagePath } from "@server/comands/games/images";
import { BridgeSendCommandEvent, CommandEvent, GameStatusInfo } from "@server/comands/types";
import { getMainWindow } from ".";

app.whenReady().then(() => {
  protocol.handle("game-image", request => {
    const packageName = decodeURIComponent(request.url.replace("game-image://", ""));
    return net.fetch("file://" + path.normalize(getImagePath(packageName)));
  });
});

console.log("Bridge is ready");
ipcMain.handle(
  BridgeSendCommandEvent,
  async (event: IpcMainInvokeEvent, comandEvent: CommandEvent<any, any>) => {
    return executeCommand(comandEvent);
  }
);

export const sendInfo = async (info: GameStatusInfo) => {
  getMainWindow()?.webContents.send("downloadProgress", info);
};
