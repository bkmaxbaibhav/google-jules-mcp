import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import tools from "../app/tools";
import { Tool } from "../app/interfaces/tools.interface";
import { log } from "../app/services/logging.service";

export default async function initStdioServer() {
    const mcpServer = new McpServer({
        name: "Jules MCP",
        version: "1.0.0"
    });

    tools.forEach((tool: Tool) => {
        log.info(`Registering tool: ${tool.name}`);
        mcpServer.registerTool(tool.name, tool.metaData, tool.handler);
    });

    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error("MCP Server running on stdio");
    return mcpServer;
}
