import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { registerSocketHandlers, getLocalIp } from "./src/server/socket-handler";

const dev = process.env.NODE_ENV !== "production";
const port = 3000;
const httpServer = createServer();
const app = next({ dev, httpServer, webpack: true, turbopack: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  httpServer.on("request", (req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer);
  registerSocketHandlers(io);

  const localIp = getLocalIp();

  httpServer.listen(port, () => {
    console.log(`\n  Quiz Game Server ready!`);
    console.log(`  TV:    http://localhost:${port}/tv`);
    console.log(`  Phone: http://${localIp}:${port}/play\n`);
  });
});
