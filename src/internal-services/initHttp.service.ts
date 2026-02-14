import { createServer, Server } from "node:http";
import environments from "../environments";
import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { logger, log } from "../app/services/logging.service";
import tools from "../app/tools";
import { Tool } from "../app/interfaces/tools.interface";

export default function initHttpServer() {
    const app = express();
    const mcpServer = new McpServer({
        name: "Jules MCP", 
        version: "1.0.0"
    });

    // Store transports by session ID
    const transports: Record<string, SSEServerTransport> = {};

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(logger);

    app.get("/server/status", (req: any, res: any) => {
        res.status(200);
        res.send("Server is up and running");
    });

    // MCP SSE transport endpoints
    app.get("/sse", async (req: any, res: any) => {
        const transport = new SSEServerTransport("/messages", res);
        transports[transport.sessionId] = transport;

        res.on("close", () => {
            delete transports[transport.sessionId];
        });

        await mcpServer.connect(transport);
    });

    app.post("/messages", async (req: any, res: any) => {
        const sessionId = req.query.sessionId as string;
        const transport = transports[sessionId];

        if (!transport) {
            res.status(404).json({
                jsonrpc: "2.0",
                error: {
                    code: -32001,
                    message: "Session not found",
                },
                id: null
            });
            return;
        }

        await transport.handlePostMessage(req, res, req.body);
    });

    const server:Server = createServer(app);
    server.listen(environments.server.port, () => {
        console.warn(`HTTP server listening on port ${environments.server.port}`);
        tools.forEach((tool:Tool) => {
            log.info(`Registering tool: ${tool.name}`);
            mcpServer.registerTool(tool.name, tool.metaData, tool.handler);
        });        
    });
    return server;
}
