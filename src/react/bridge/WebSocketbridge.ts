import { BridgeInterface } from ".";
import { GameStatusInfo } from "./download";

import { CommandEvent } from "@server/commands/types";

type BridgeMessage =
  | {
      id: string;
      event: "command";
      data: CommandEvent<any, any>;
    }
  | {
      id: string;
      event: "command-response";
      error: boolean;
      data: unknown;
    }
  | {
      event: "download-progress";
      data: GameStatusInfo;
    };

class WebSocketBridge implements BridgeInterface {
  private socket: WebSocket;
  private connectionPromise: Promise<void>;
  private reconnectDelay = 2000;
  private isReconnecting = false;

  private eventHandlers: {
    [event: string]: { resolve: (data: any) => void; reject: (err: any) => void };
  } = {};
  private gameStatusReceiver: ((info: GameStatusInfo) => void) | null = null;

  constructor() {
    this.connectionPromise = Promise.resolve();
    this.socket = this.connect();
  }

  private reconnect() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    setTimeout(() => {
      this.socket.close();
      console.log("Reconnecting to WebSocket...");
      this.socket = this.connect();
    }, this.reconnectDelay);
  }

  private connect(): WebSocket {
    const port =
      process.env.NODE_ENV === "development"
        ? ":3001"
        : window.location.port
          ? ":" + window.location.port
          : "";
    const socketUrl = "ws://" + window.location.hostname + port;

    console.log("Connecting to WebSocket", socketUrl);
    const socket = new WebSocket(socketUrl);

    this.connectionPromise = new Promise(resolve => {
      socket.onopen = () => {
        console.log("WebSocket connected");
        this.isReconnecting = false;
        resolve();
      };
    });

    socket.onerror = () => {
      this.isReconnecting = false;
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.reconnect();
    };

    socket.onmessage = message => {
      try {
        const parsedMessage = JSON.parse(message.data) as BridgeMessage;

        if (parsedMessage.event === "download-progress" && this.gameStatusReceiver) {
          this.gameStatusReceiver(parsedMessage.data);
        } else if (parsedMessage.event === "command-response") {
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

    return socket;
  }

  public async sendCommand<Name extends string, Input, Output>(
    command: CommandEvent<Input, Name>
  ): Promise<Output> {
    await this.connectionPromise;
    const uniqueId = Math.random().toString(36);
    return new Promise((resolve, reject) => {
      try {
        this.eventHandlers[uniqueId] = { resolve, reject };
        this.socket.send(
          JSON.stringify({
            id: uniqueId,
            event: "command",
            data: command,
          })
        );
      } catch (err) {
        reject(err as Error);
      }
    });
  }

  public registerGameStatusReceiver(callback: (info: GameStatusInfo) => void) {
    this.gameStatusReceiver = callback;
  }
}

let instance: WebSocketBridge | null = null;

export default function getBridge() {
  if (!instance) {
    instance = new WebSocketBridge();
  }

  return instance;
}
