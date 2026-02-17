# Jules MCP Server

A specialized Model Context Protocol (MCP) server that acts as a secure bridge to the **Jules API** (Google's Agentic API). It allows AI clients (like Claude Desktop, Cursor, etc.) to interact with Jules capable agents for tasks like code generation, plan approval, and session management.

## 🚀 Features

- **Jules API Integration**: Full suite of tools to `create_session`, `send_message`, `approve_plan`, and `list_activities`.
- **Dual-Layer Security**:
  - **API Key**: Restricts server access to authorized clients.
  - **TOTP (Time-based One-Time Password)**: Protects sensitive actions (like approving plans) with a 30-minute session window using Google Authenticator.
- **Stateful HTTP Transport**: Supports SSE (Server-Sent Events) for real-time agent updates.
- **TypeScript**: Built with type safety and modern best practices.

## 🛠️ Prerequisites

- **Node.js** v18+
- **Jules API Key**: Access to the Google Jules API.
- **Google Authenticator App**: For generating TOTP codes.

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bkmaxbaibhav/google-jules-mcp.git
   cd jules-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Copy the example and update with your credentials:
   ```bash
   cp .env.example .env
   ```

   **Required `.env` variables:**
   - `JULES_API_KEY`: Your Google Jules API Key.
   - `JULES_BASE_URL`: `https://jules.googleapis.com` (default)
   - `MCP_API_KEY`: A secret key you define to secure this server.
   - `TOTP_SECRET`: A base32 string for TOTP generation (e.g., `JBSWY3DPEHPK3PXP`).
     > *Tip: You can generate a TOTP secret and QR code using online tools or a CLI utility to scan into your Google Authenticator app.*

## 🏃 Running the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production
npm run build
npm start
```

Server runs on `http://localhost:3000` by default.

## 🔒 Authentication Flow

This server implements strict security to prevent unauthorized agent actions:

1.  **Connection**: The MCP client connects using the `x-api-key` header matching your `MCP_API_KEY`.
2.  **Discovery**: "Safe" tools like `list_tools` and `get_sources` work immediately.
3.  **Action**: Trying to call `create_session` or `approve_plan` will initially fail with:
    > *TOTP Authentication Required: Use the 'authenticate' tool...*
4.  **Unlock**: You must call the `authenticate` tool with the current code from your Google Authenticator app.
    -   **Tool**: `authenticate`
    -   **Params**: `{ "otp": "123456" }`
5.  **Session**: Once verified, the server unlocks all tools for **30 minutes**.

## 🤖 Using with AI Clients

### Claude Desktop / Cursor / Other MCP Clients

Configure your client to connect to this server via HTTP (SSE).

**URL**: `http://localhost:3000/server/mcp`
**Headers**:
- `x-api-key`: `<Your configured MCP_API_KEY>`

### Example Workflow prompt for AI

Once connected, you can ask the AI:

> "I want to start a new coding task. Please authenticate me first."
> *(AI calls `authenticate` tool, you provide the code)*
> "Great, now create a session to build a React app using the github source 'sources/github/myuser/myrepo'."

## 🧰 Available Tools

| Tool Name | Description | Inputs |
|-----------|-------------|--------|
| `authenticate` | Unlocks sensitive tools for 30 mins | `otp` (String) |
| `get_sources` | List available input sources (repos) | None |
| `list_sessions` | List recent agent sessions | `pageSize` (Optional) |
| `create_session` | Start a new agent session | `prompt`, `sourceContext` |
| `send_message` | Send a new prompt to an existing session | `name`, `prompt` |
| `approve_plan` | Approve the agent's proposed plan | `name` (Session Name) |
| `list_activities` | View agent logs/activities | `name`, `pageSize` |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on submitting PRs.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
