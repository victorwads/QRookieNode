import { WebSocketServer, WebSocket } from "ws";

import { CommandEvent, GameStatusInfo } from "../../comands/types";
import { executeCommand } from "../../comands";
import log from "../../log";
import server from './reactServer'

type BridgeMessage = 
    { id: string; event: 'command'; data: CommandEvent<any, any>;} |
    { id: string; event: 'command-response'; error: boolean; data: unknown;} |
    { event: 'download-progress'; data: GameStatusInfo; }


new WebSocketServer({ server }).on("connection", (ws) => {
  connections.push(ws);
  log.debug("Client connected via WebSocket");

  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString()) as BridgeMessage;
      log.debug(`Received message: ${message.toString()}`);

      if (parsedMessage.event === 'command') {
        executeCommand(parsedMessage.data).then((data) => {
          ws.send(JSON.stringify({ event: "command-response", id: parsedMessage.id, error: false, data }));
        }).catch((error) => {
          ws.send(JSON.stringify({ event: "command-response", id: parsedMessage.id, error: true, data: error }));
        });
      }
    } catch (err) {
      log.error("Error parsing message", err);
    }
  });

  ws.on("close", () => {
    log.debug("Client disconnected");
    connections.splice(connections.indexOf(ws), 1);
  });
});

export const sendInfo = async (info: GameStatusInfo) => {
  connections.forEach((ws) => {
    ws.send(JSON.stringify({ event: "download-progress", data: info } as BridgeMessage));
  });
}

const connections: WebSocket[] = [];
