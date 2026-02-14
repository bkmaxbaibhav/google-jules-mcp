import { config } from "dotenv";
config();
import environments from "./src/environments"
import initHttpServer from "./src/internal-services/initHttp.service";
import initStdioServer from "./src/internal-services/initStdio.service";

var global:any = globalThis;

async function startServer(){ 
  // Always start HTTP server as it's the primary mode
  await initHttpServer();

  // If TRANSPORT is set to stdio, also start the stdio interface
  if (environments.server.transport === "stdio") {
    console.error("Starting secondary STDIO transport...");
    await initStdioServer();
  }
}

process.on("unhandledRejection", (reason:any, promise:any) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startServer();