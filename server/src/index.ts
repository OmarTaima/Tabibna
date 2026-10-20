import { createServer } from "node:http";
import { createApp } from "./app.ts";
import { config } from "./config/env.ts";

const app = createApp();
const server = createServer(app);

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[server] ${signal} received; shutting down`);

  const forceTimer = setTimeout(() => {
    console.error("[server] forced shutdown");
    server.closeAllConnections();
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  server.close((error) => {
    clearTimeout(forceTimer);
    if (error) {
      console.error("[server] shutdown failed");
      process.exitCode = 1;
    }
    process.exit();
  });
}

server.on("error", (error: Error) => {
  const code = (error as NodeJS.ErrnoException).code;
  console.error(`[server] failed to start${code ? ` code=${code}` : ""}`);
  process.exit(1);
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

server.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port} mode=${config.mode}`);
});
