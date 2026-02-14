import { createServer, Server } from "node:http";
import environments from "../environments";
import express from "express";
import cors from "cors";
import logger from "../app/services/logging.service";
export default function initHttpServer() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(logger);

    app.get("/server/status", (req:any, res:any) => {
        res.status(200);
        res.send("Server is up and running");
    });

    const server:Server = createServer(app);
    server.listen(environments.server.port, () => {
        console.warn(`HTTP server listening on port ${environments.server.port}`);
    });
    return server;
}
