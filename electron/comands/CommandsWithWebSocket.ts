import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { readFile } from "fs";
import { join } from "path";

import { CommandEvent, GameStatusInfo } from "../shared";
import { executeCommand, getImagePath } from ".";
import log from "../log";

const reactBuildPath = join(__dirname, "../../react");
log.debug(`Serving static files from ${reactBuildPath}`);

const server = createServer((req, res) => {
  if (req.url?.startsWith("/game-image/")) {
    const packageName = req.url.split("/game-image/")[1];
    readFile(getImagePath(packageName), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Image not found");
        log.error(`Image not found for package: ${packageName}`);
      } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(data);
      }
    });
    return;
  }
      
  const filePath = req.url === "/" ? join(reactBuildPath, "index.html") : join(reactBuildPath, req.url!);
  readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      log.error(`File not found: ${filePath}`);
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

const connections: WebSocket[] = [];
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

export const sendInfoWithWebSocket = async (info: GameStatusInfo) => {
  connections.forEach((ws) => {
    ws.send(JSON.stringify({ event: "download-progress", data: info } as BridgeMessage));
  });
}

const PORT = process.env.ROOKIE_WEB_PORT || 3001;
server.listen(PORT, () => {
  log.userInfo(`Server mode running on http://localhost:${PORT}`);
  log.userInfo(`Use ROOKIE_WEB_PORT environment variable to change the port`);
  log.userInfo(`Use ROOKIE_DOWNLOADS_DIR environment variable to change the downloads directory`);
});