#!/bin/bash

# MCP Server Test Script
# This script demonstrates the complete MCP workflow using curl

set -e  # Exit on error

# Configuration
API_KEY="jules-secret-key"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         MCP Server Test - Complete Workflow               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Initialize and capture session ID
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Step 1: Initialize Session                                 │"
echo "└─────────────────────────────────────────────────────────────┘"
RESPONSE=$(curl -s -i -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-api-key: $API_KEY" \
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

if [ -z "$SESSION_ID" ]; then
    echo "❌ Failed to get session ID from server"
    echo "Response:"
    echo "$RESPONSE"
    exit 1
fi

echo "✅ Session ID: $SESSION_ID"
echo ""

# Extract and display the response body
BODY=$(echo "$RESPONSE" | sed -n '/^{/,$p')
if command -v jq &> /dev/null; then
    echo "Response:"
    echo "$BODY" | jq '.'
else
    echo "Response (install jq for pretty printing):"
    echo "$BODY"
fi
echo ""

# Step 2: Send initialized notification
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Step 2: Send Initialized Notification                      │"
echo "└─────────────────────────────────────────────────────────────┘"
INIT_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-api-key: $API_KEY" \
  -H "mcp-session-id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "notifications/initialized"
  }')

HTTP_STATUS=$(echo "$INIT_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
INIT_BODY=$(echo "$INIT_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
    echo "✅ Initialized notification sent successfully (HTTP $HTTP_STATUS)"
else
    echo "⚠️  Initialized notification returned HTTP $HTTP_STATUS"
fi

if [ -n "$INIT_BODY" ]; then
    if command -v jq &> /dev/null; then
        echo "$INIT_BODY" | jq '.' 2>/dev/null || echo "$INIT_BODY"
    else
        echo "$INIT_BODY"
    fi
fi
echo ""

# Step 3: List tools
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Step 3: List Available Tools                               │"
echo "└─────────────────────────────────────────────────────────────┘"
TOOLS_RESPONSE=$(curl -s -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-api-key: $API_KEY" \
  -H "mcp-session-id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }')

if command -v jq &> /dev/null; then
    echo "$TOOLS_RESPONSE" | jq '.'
    TOOL_COUNT=$(echo "$TOOLS_RESPONSE" | jq '.result.tools | length')
    echo ""
    echo "✅ Found $TOOL_COUNT tool(s)"
else
    echo "$TOOLS_RESPONSE"
    echo "✅ Tools listed"
fi
echo ""

# Step 4: Call the tool
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Step 4: Call get_author_detail Tool                        │"
echo "└─────────────────────────────────────────────────────────────┘"
TOOL_RESPONSE=$(curl -s -X POST http://localhost:3000/server/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "x-api-key: $API_KEY" \
  -H "mcp-session-id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "get_author_detail",
      "arguments": {}
    }
  }')

if command -v jq &> /dev/null; then
    echo "$TOOL_RESPONSE" | jq '.'
    RESULT=$(echo "$TOOL_RESPONSE" | jq -r '.result.content[0].text' 2>/dev/null || echo "")
    if [ -n "$RESULT" ]; then
        echo ""
        echo "✅ Tool Result: $RESULT"
    fi
else
    echo "$TOOL_RESPONSE"
    echo "✅ Tool executed"
fi
echo ""

# Step 5: Terminate session
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Step 5: Terminate Session                                  │"
echo "└─────────────────────────────────────────────────────────────┘"
DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE http://localhost:3000/server/mcp \
  -H "x-api-key: $API_KEY" \
  -H "mcp-session-id: $SESSION_ID")

HTTP_STATUS=$(echo "$DELETE_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
DELETE_BODY=$(echo "$DELETE_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
    echo "✅ Session terminated successfully (HTTP $HTTP_STATUS)"
else
    echo "⚠️  Session termination returned HTTP $HTTP_STATUS"
fi

if [ -n "$DELETE_BODY" ]; then
    echo "$DELETE_BODY"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  Test Completed Successfully!              ║"
echo "╚════════════════════════════════════════════════════════════╝"
