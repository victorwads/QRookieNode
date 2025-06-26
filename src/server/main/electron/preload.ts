import { contextBridge, ipcRenderer } from "electron";

import { BridgeSendCommandEventType, CommandSender } from "@commands/types";

export const BridgeSendCommandEvent: BridgeSendCommandEventType = "sendCommand";

if (contextBridge) {
  ipcRenderer.setMaxListeners(50);
  contextBridge.exposeInMainWorld(
    BridgeSendCommandEvent,
    (async command => await ipcRenderer.invoke(BridgeSendCommandEvent, command)) as CommandSender
  );
  contextBridge.exposeInMainWorld("downloads", {
    receive: (func: any) => ipcRenderer.on("downloadProgress", (event, ...args) => func(...args)),
    remove: (callback: any) => ipcRenderer.removeListener("downloadProgress", callback),
  });
}
