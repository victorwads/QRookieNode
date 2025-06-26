import { app, ipcMain, IpcMainInvokeEvent, net, protocol } from "electron";
import path from "path";

import { executeCommand } from "@server/commands";
import { getImagePath } from "@server/commands/games/images";
import { BridgeSendCommandEvent, CommandEvent, GameStatusInfo } from "@server/commands/types";
import { getMainWindow } from ".";

void app.whenReady().then(() => {
  protocol.handle("game-image", request => {
    const packageName = decodeURIComponent(request.url.replace("game-image://", ""));
    return net.fetch("file://" + path.normalize(getImagePath(packageName)));
  });
});

console.log("Bridge is ready");
ipcMain.handle(
  BridgeSendCommandEvent,
  async (event: IpcMainInvokeEvent, commandEvent: CommandEvent<any, any>) => {
    return executeCommand(commandEvent);
  }
);

export const sendInfo = (info: GameStatusInfo) => {
  getMainWindow()?.webContents.send("downloadProgress", info);
};
