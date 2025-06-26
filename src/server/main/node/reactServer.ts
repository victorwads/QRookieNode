import { readFile } from "fs";
import { createServer } from "http";
import { networkInterfaces } from "os";
import { join } from "path";

import { getImagePath } from "@commands/games/images";
import { buildRoot } from "@server/dirs";
import log from "@server/log";

const reactBuildPath = join(buildRoot, "../react");
const server = createServer((req, res) => {
  if (req.url?.startsWith("/game-image/")) {
    const packageName = req.url.split("/game-image/")[1];
    readFile(getImagePath(packageName), (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Image not found");
        log.error(`Image not found for package: ${packageName}`, err);
      } else {
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        res.end(data);
      }
    });
    return;
  }

  const filePath =
    req.url === "/" ? join(reactBuildPath, "index.html") : join(reactBuildPath, req.url!);
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

function getLanIps() {
  const interfaces = networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const PORT: number = Number.parseInt(process.env.ROOKIE_WEB_PORT || "3001");

server.listen(PORT, () => {
  log.userInfo(`Server mode running on http://localhost:${PORT}`);
  getLanIps().forEach(ip => {
    log.userInfo(`Server mode running on http://${ip}:${PORT}`);
  });
});
log.debug(`Serving static files from ${reactBuildPath}`);

export default server;
