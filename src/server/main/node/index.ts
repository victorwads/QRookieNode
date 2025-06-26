import { WebSocket, WebSocketServer } from "ws";

import { executeCommand } from "@server/commands";
import { appVersion } from "@server/commands/settings/manager";
import { CommandEvent, GameStatusInfo } from "@server/commands/types";
import log from "@server/log";
import server from "./reactServer";

type BridgeMessage =
  | { id: string; event: "command"; data: CommandEvent<any, any> }
  | { id: string; event: "command-response"; error: boolean; data: unknown }
  | { event: "download-progress"; data: GameStatusInfo };

if (server.listening) {
  log.info("WebSocket server is listening");
  new WebSocketServer({ server }).on("connection", ws => {
    connections.push(ws);
    log.debug("Client connected via WebSocket");

    ws.on("message", message => {
      try {
        const messageJSON = JSON.stringify(message);
        const parsedMessage = JSON.parse(messageJSON) as BridgeMessage;
        log.debug(`Received message: ${messageJSON}`);

        if (parsedMessage.event === "command") {
          executeCommand(parsedMessage.data)
            .then(data => {
              ws.send(
                JSON.stringify({
                  event: "command-response",
                  id: parsedMessage.id,
                  error: false,
                  data,
                })
              );
            })
            .catch(error => {
              ws.send(
                JSON.stringify({
                  event: "command-response",
                  id: parsedMessage.id,
                  error: true,
                  data: error,
                })
              );
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
} else {
  log.error("WebSocket server is not listening");
}

export const sendInfo = (info: GameStatusInfo) => {
  connections.forEach(ws => {
    ws.send(JSON.stringify({ event: "download-progress", data: info } as BridgeMessage));
  });
};

const connections: WebSocket[] = [];

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  log.userInfo("Version:", appVersion);
  log.userInfo("Usage: ./start [options]");
  log.userInfo();
  log.userInfo(`Use --help -h to see this message`);
  log.userInfo(`Use --verbose to see more logs`);
  log.userInfo(`Use ROOKIE_WEB_PORT environment variable to change the port`);
  log.userInfo(`Use ROOKIE_DOWNLOADS_DIR environment variable to change the downloads directory`);
  process.exit(0);
}
