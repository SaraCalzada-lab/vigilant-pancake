import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { registerSocketHandlers, getLocalIp } from "./src/server/socket-handler";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer);
  registerSocketHandlers(io);

  const port = 3000;
  const localIp = getLocalIp();

  httpServer.listen(port, () => {
    console.log(`\n  Quiz Game Server ready!`);
    console.log(`  TV:    http://localhost:${port}/tv`);
    console.log(`  Phone: http://${localIp}:${port}/play\n`);
  });
});
