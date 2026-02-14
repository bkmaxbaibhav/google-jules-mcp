import { config } from "dotenv";
config({ quiet: true });
import environments from "./src/environments"
import initHttpServer from "./src/internal-services/initHttp.service";
import initStdioServer from "./src/internal-services/initStdio.service";

// Redirect all standard logs to stderr immediately to avoid corrupting MCP stdout stream
console.log = console.error;
console.info = console.error;

var global:any = globalThis;

async function startServer(){ 
  const transportType = process.env.TRANSPORT || "http";
  const isStdio = transportType === "stdio";
  
  if (!isStdio) {
    console.warn(`Starting server with ${transportType} transport...`);
    console.warn(`Environment: ${environments.env_type}`);
  }

  if (isStdio) {
    await initStdioServer();
  } else {
    await initHttpServer();
  }
}

process.on("unhandledRejection", (reason:any, promise:any) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startServer();