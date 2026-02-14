import { config } from "dotenv";
config();
import environments from "./src/environments"
import initializeDatabase from "./src/internal-services/initSql.service";
import initHttpServer from "./src/internal-services/initHttp.service";
import initSocketServer from "./src/internal-services/initSocket.service";


var global:any = globalThis;

async function startServer(){ 
  console.warn("Starting server...")
  console.warn(`Environment: ${environments.env_type}`);
  const server = await initHttpServer();
}

process.on("unhandledRejection", (reason:any, promise:any) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

startServer();