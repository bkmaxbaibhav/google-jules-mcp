import { createServer, Server } from "node:http";
import environments from "../environments";
import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { logger } from "../app/services/logging.service";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import tools from "../app/tools";
import { Tool } from "../app/interfaces/tools.interface";
import { log } from "../app/services/logging.service";
import { randomUUID } from "node:crypto";

// Map to store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Helper function to create and configure an MCP server
function createMcpServer(): McpServer {
    const mcpServer = new McpServer({
        name: "Jules MCP",
        version: "1.0.0"
    });

    // Register all tools
    tools.forEach((tool: Tool) => {
        log.info(`Registering tool: ${tool.name}`);
        mcpServer.registerTool(tool.name, tool.metaData, tool.handler);
    });

    return mcpServer;
}

// Helper to check if request is an initialize request
function isInitializeRequest(body: any): boolean {
    return body?.method === "initialize";
}

export default function initHttpServer() {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use(logger);

    app.get("/server/status", (req: Request, res: Response) => {
        res.status(200);
        res.send("Server is up and running");
    });

    app.post("/server/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        
        if (sessionId) {
            console.log(`Received MCP request for session: ${sessionId}`);
        } else {
            console.log('Request body:', req.body);
        }

        try {
            let transport: StreamableHTTPServerTransport;

            if (sessionId && transports[sessionId]) {
                // Reuse existing transport for this session
                transport = transports[sessionId];
            } else if (!sessionId && isInitializeRequest(req.body)) {
                // New initialization request - create new server and transport
                transport = new StreamableHTTPServerTransport({
                    sessionIdGenerator: () => randomUUID(),
                    onsessioninitialized: (newSessionId) => {
                        // Store the transport by session ID when session is initialized
                        console.log(`Session initialized with ID: ${newSessionId}`);
                        transports[newSessionId] = transport;
                    }
                });

                // Set up onclose handler to clean up transport when closed
                transport.onclose = () => {
                    const sid = transport.sessionId;
                    if (sid && transports[sid]) {
                        console.log(`Transport closed for session ${sid}, removing from transports map`);
                        delete transports[sid];
                    }
                };

                // Connect the transport to a new MCP server
                const mcpServer = createMcpServer();
                await mcpServer.connect(transport);
                await transport.handleRequest(req, res, req.body);
                return; // Already handled
            } else {
                // Invalid request - no session ID or not initialization request
                res.status(400).json({
                    jsonrpc: "2.0",
                    error: {
                        code: -32000,
                        message: "Bad Request: No valid session ID provided"
                    },
                    id: null
                });
                return;
            }

            // Handle the request with existing transport
            await transport.handleRequest(req, res, req.body);
        } catch (error) {
            console.error(error);
            if (!res.headersSent) {
                res.status(500).json({
                    jsonrpc: "2.0",
                    id: req.body.id || undefined,
                    error: {
                        code: -32603,
                        message: "Internal server error"
                    }
                });
            }
        }
    });

    app.get("/server/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        
        if (!sessionId || !transports[sessionId]) {
            res.status(400).send("Invalid or missing session ID");
            return;
        }

        console.log(`Establishing SSE stream for session ${sessionId}`);
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    });

    app.delete("/server/mcp", async (req: Request, res: Response) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined;
        
        if (!sessionId || !transports[sessionId]) {
            res.status(404).send("Invalid or missing session ID");
            return;
        }

        console.log(`Received session termination request for session ${sessionId}`);
        try {
            const transport = transports[sessionId];
            await transport.handleRequest(req, res);
        } catch (error) {
            console.error("Error handling session termination:", error);
            if (!res.headersSent) {
                res.status(500).send("Error processing session termination");
            }
        }
    });
    const server:Server = createServer(app);
    server.listen(environments.server.port, () => {
        console.warn(`HTTP server listening on port ${environments.server.port}`);      
    });
    return server;
}
