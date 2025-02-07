import { createServer } from "http";
import { readFile } from "fs";
import { join } from "path";

import { getImagePath } from "../../comands/games/images";
import { buildRoot } from "../../comands/dirs";
import log from "../../log";

const reactBuildPath = join(buildRoot, "../react");
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

const PORT = process.env.ROOKIE_WEB_PORT || 3001;
server.listen(PORT, () => {
  log.userInfo(`Server mode running on http://localhost:${PORT}`);
  log.userInfo(`Use ROOKIE_WEB_PORT environment variable to change the port`);
  log.userInfo(`Use ROOKIE_DOWNLOADS_DIR environment variable to change the downloads directory`);
});

log.debug(`Serving static files from ${reactBuildPath}`);

export default server;