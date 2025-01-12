import { contextBridge, ipcRenderer } from "electron";
import { BridgeSendCommandEventType, CommandSender } from "./shared";

export const BridgeSendCommandEvent: BridgeSendCommandEventType = 'sendCommand';

if (contextBridge) {
  contextBridge.exposeInMainWorld(
    BridgeSendCommandEvent,
    (async (command) => await ipcRenderer.invoke(BridgeSendCommandEvent, command)) as CommandSender
  )
}