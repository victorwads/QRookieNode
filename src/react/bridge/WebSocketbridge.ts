import { BridgeInterface } from ".";
import { CommandEvent } from "../../server/comands/types";
import { GameStatusInfo } from "./download";

type BridgeMessage = {
  id: string;
  event: 'command';
  data: CommandEvent<any, any>;
} | {
  id: string;
  event: 'command-response';
  error: boolean;
  data: unknown;
} | {
  event: 'download-progress';
  data: GameStatusInfo;
}

export default class WebSocketBridge implements BridgeInterface {
  private socket: WebSocket;
  private connectionPromise: Promise<void>;

  private eventHandlers: { [event: string]: {resolve: (data: any) => void, reject: (err: any) => void} } = {};
  private gameStatusReceiver: ((info: GameStatusInfo) => void) |  null = null;

  constructor() {
    console.log("Connecting to WebSocket", process.env.NODE_ENV);
    const port = process.env.NODE_ENV === "development" ? ":3001"
      : (window.location.port ? ":" + window.location.port : "");
    this.socket = new WebSocket("ws://" + window.location.hostname + port);
    this.connectionPromise = new Promise((resolve) => {
      this.socket.onopen = () => {
        console.log("WebSocket connected");
        resolve();
      };
    });

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    this.socket.onmessage = (message) => {
      try {
        const parsedMessage = JSON.parse(message.data) as BridgeMessage;
        
        if (parsedMessage.event === 'download-progress' && this.gameStatusReceiver) {
          this.gameStatusReceiver(parsedMessage.data);
        } else if (parsedMessage.event === 'command-response') {
          if (this.eventHandlers[parsedMessage.id]) {
            if (parsedMessage.error) {
              this.eventHandlers[parsedMessage.id].reject(parsedMessage.data);
            } else {
              this.eventHandlers[parsedMessage.id].resolve(parsedMessage.data);
            }
            delete this.eventHandlers[parsedMessage.id];
          } else {
            console.error("Received response for unknown event:", parsedMessage.id);
          }
        } else {
          console.error("Unknown event:", parsedMessage.event);
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    };
  }

  public async sendCommand<Name extends string, Input, Output>(command: CommandEvent<Input, Name>): Promise<Output> {
    await this.connectionPromise;
    const uniqueId = Math.random().toString(36);
    return new Promise((resolve, reject) => {
      try {
        this.eventHandlers[uniqueId] = { resolve, reject };
        this.socket.send(JSON.stringify({ 
          id: uniqueId,
          event: 'command',
          data: command
        }));
      } catch (err) {
        reject(err);
      }
    });
  }

  public registerGameStatusReceiver(callback: (info: GameStatusInfo) => void) {
    this.gameStatusReceiver = callback;
  }
}