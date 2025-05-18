import type { BridgeInterface } from ".";

export default class ElectronBridge implements BridgeInterface {
  private global = window as any;

  public sendCommand = this.global.sendCommand;
  public registerGameStatusReceiver = this.global.downloads.receive;
}
