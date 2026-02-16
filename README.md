# Jules MCP Server

A Model Context Protocol (MCP) server implementation with HTTP transport support.

## Authors

- **Baibhav Kumar** - Original Author & Primary Developer
- **Antigravity (Google DeepMind)** - Co-author & Technical Contributor

## Overview

This MCP server demonstrates how to build a production-ready MCP server with HTTP transport. It implements proper session management, tool registration, and follows the MCP specification for stateful HTTP connections.

## Features

- ✅ HTTP Transport with session management
- ✅ Server-Sent Events (SSE) support for notifications
- ✅ Proper session lifecycle management
- ✅ Tool registration and execution
- ✅ JSON-RPC 2.0 compliant
- ✅ TypeScript implementation

## Installation

```bash
npm install
```

## Running the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (configurable via environment variables).

## Architecture

### How It Works

The MCP server uses a **stateful HTTP transport** mechanism:

1. **Session Initialization**: Client sends an `initialize` request without a session ID
2. **Session Creation**: Server creates a new MCP server instance, generates a session ID, and stores the transport
3. **Session Reuse**: Subsequent requests include the `mcp-session-id` header to reuse the same server instance
4. **Tool Execution**: Tools are executed within the session context
5. **Session Termination**: Client sends DELETE request to clean up the session

### Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP Server Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Client → POST /server/mcp (initialize)                 │
│     ↓                                                       │
│  2. Server creates McpServer + Transport                    │
│     ↓                                                       │
│  3. Server generates session ID                             │
│     ↓                                                       │
│  4. Server stores transport in map                          │
│     ↓                                                       │
│  5. Client ← Response with session ID                       │
│                                                             │
│  6. Client → POST /server/mcp (with session ID header)     │
│     ↓                                                       │
│  7. Server looks up existing transport                      │
│     ↓                                                       │
│  8. Server executes tool/request                            │
│     ↓                                                       │
│  9. Client ← Response                                       │
│                                                             │
│ 10. Client → DELETE /server/mcp (session cleanup)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── app/
│   ├── controllers/          # Tool handlers
│   ├── interfaces/           # TypeScript interfaces
│   ├── services/             # Logging and utilities
│   └── tools/                # Tool definitions
├── internal-services/
│   ├── initHttp.service.ts   # HTTP server & session management
│   └── initStdio.service.ts  # Stdio transport (for local use)
├── environments.ts           # Configuration
└── server.ts                 # Entry point
```

## Testing with cURL

Here's a complete workflow to test the MCP server manually using curl:

### Step 1: Initialize a Session

```bash
curl -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -i \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "curl-test-client",
        "version": "1.0.0"
      }
    }
  }'
```

**Notice:** The server requires the header `Accept: application/json, text/event-stream`. Without it, you will receive a `406 Not Acceptable` error.

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "logging": {}
    },
    "serverInfo": {
      "name": "Jules MCP",
      "version": "1.0.0"
    }
  }
}
```

**Important:** Look for the `mcp-session-id` header in the response! You'll need this for all subsequent requests.

Example response header:
```
mcp-session-id: 550e8400-e29b-41d4-a716-446655440000
```

### Step 2: Send Initialized Notification

After receiving the initialize response, send the initialized notification:

```bash
# Replace SESSION_ID with the actual session ID from Step 1
curl -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "notifications/initialized"
  }'
```

**Expected Response:** Empty response (204 No Content) or acknowledgment.

### Step 3: List Available Tools

```bash
curl -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "get_author_detail",
        "description": "Get author details for this MCP server",
        "inputSchema": {
          "type": "object",
          "properties": {},
          "required": []
        }
      }
    ]
  }
}
```

### Step 4: Call a Tool

```bash
curl -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_author_detail",
      "arguments": {}
    }
  }'
```

**Expected Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Baibhav Kumar is the author of this MCP server"
      }
    ]
  }
}
```

### Step 5: Establish SSE Stream (Optional)

For receiving server-sent events (notifications, logs, etc.):

```bash
curl -N -X GET http://localhost:3000/server/mcp \
  -H "mcp-session-id: SESSION_ID"
```

This keeps the connection open and streams events as they occur.

### Step 6: Terminate Session

```bash
curl -X DELETE http://localhost:3000/server/mcp \
  -H "mcp-session-id: SESSION_ID"
```

**Expected Response:** 200 OK or 204 No Content

## Complete Test Script

Here's a bash script that runs the complete workflow:

```bash
#!/bin/bash

# Step 1: Initialize and capture session ID
echo "=== Step 1: Initialize Session ==="
RESPONSE=$(curl -s -i -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "curl-test-client",
        "version": "1.0.0"
      }
    }
  }')

# Extract session ID from response headers
SESSION_ID=$(echo "$RESPONSE" | grep -i "mcp-session-id:" | awk '{print $2}' | tr -d '\r')

echo "Session ID: $SESSION_ID"
echo ""

# Step 2: Send initialized notification
echo "=== Step 2: Send Initialized Notification ==="
curl -s -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "notifications/initialized"
  }'
echo -e "\n"

# Step 3: List tools
echo "=== Step 3: List Available Tools ==="
curl -s -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }' | jq '.'
echo ""

# Step 4: Call the tool
echo "=== Step 4: Call get_author_detail Tool ==="
curl -s -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_author_detail",
      "arguments": {}
    }
  }' | jq '.'
echo ""

# Step 5: Terminate session
echo "=== Step 5: Terminate Session ==="
curl -s -X DELETE http://localhost:3000/server/mcp \
  -H "mcp-session-id: $SESSION_ID"
echo -e "\nSession terminated.\n"
```

Save this as `test-mcp.sh`, make it executable (`chmod +x test-mcp.sh`), and run it:

```bash
./test-mcp.sh
```

**Note:** This script requires `jq` for JSON formatting. Install it with:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

## Adding New Tools

To add a new tool:

1. Create a controller in `src/app/controllers/`:

```typescript
// src/app/controllers/myTool.controller.ts
export default async function myToolHandler(args: any) {
    return {
        content: [
            {
                type: "text",
                text: `Result: ${args.input}`
            }
        ]
    };
}
```

2. Define the tool in `src/app/tools/`:

```typescript
// src/app/tools/myTools.ts
import { Tool } from "../interfaces/tools.interface";
import myToolHandler from "../controllers/myTool.controller";

const myTools: Tool[] = [
    {
        name: "my_tool",
        metaData: {
            description: "Description of my tool",
            inputSchema: {
                type: "object",
                properties: {
                    input: {
                        type: "string",
                        description: "Input parameter"
                    }
                },
                required: ["input"]
            }
        },
        handler: myToolHandler
    }
];

export default myTools;
```

3. Export it in `src/app/tools/index.ts`:

```typescript
import authorTools from "./author.tools";
import myTools from "./myTools";

export default [...authorTools, ...myTools];
```

4. Restart the server - your new tool will be automatically registered!

## Environment Variables

```bash
# Server configuration
TRANSPORT=http          # or "stdio" for local use
MCP_PORT=3000          # HTTP server port
NODE_ENV=development   # development or production
```

## Troubleshooting

### Error: "Already connected to a transport"

This means you're trying to connect the same MCP server instance to multiple transports. Make sure each session gets its own server instance.

### Error: "Bad Request: No valid session ID provided"

You're sending a request without the `mcp-session-id` header, or the session doesn't exist. Always include the session ID from the initialize response.

### Error: "Invalid or missing session ID"

The session may have expired or been terminated. Start a new session with the initialize request.

## MCP Protocol Resources

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
