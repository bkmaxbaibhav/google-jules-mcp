import { config } from "dotenv";
config();
import environments from "./src/environments"
import initHttpServer from "./src/internal-services/initHttp.service";


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