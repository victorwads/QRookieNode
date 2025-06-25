import type { CommandSender, GameStatusInfo } from "@server/comands/types";

import ElectronBridge from "./ElectronBridge";
import WebSocketBridge from "./WebSocketbridge";

export interface BridgeInterface {
  sendCommand: CommandSender;
  registerGameStatusReceiver: (callback: (info: GameStatusInfo) => void) => void;
}

export const isElectron = !!(window as any).sendCommand;
export const isWebsoket = !isElectron;
export const bridge: BridgeInterface = isElectron ? new ElectronBridge() : WebSocketBridge();

export default bridge;
