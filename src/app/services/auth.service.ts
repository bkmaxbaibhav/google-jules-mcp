import { Request, Response, NextFunction } from "express";
import environments from "../../environments";
import { sessionService } from "./session.service";

/**
 * Middleware to validate API Key in the request headers
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    // Stdio transport does not use HTTP auth
    if (process.env.TRANSPORT === "stdio") {
        return next();
    }

    // 1. Check for custom header
    const apiKeyHeader = req.headers["x-api-key"];
    
    // 2. Check for standard Authorization header (Bearer token)
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    
    // 3. Check for query parameter
    const apiKeyQuery = req.query.apiKey;
    
    const apiKey = apiKeyHeader || bearerToken || apiKeyQuery;
    const validApiKey = environments.mcp.apiKey;

    // First check the API Key itself
    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            jsonrpc: "2.0",
            error: {
                code: -32001,
                message: "Unauthorized: Invalid or missing API Key."
            },
            id: req.body?.id || null
        });
    }

    // Now check if authenticated via OTP (except for the authenticate tool, initialize, or GET requests for SSE)
    const isAuthRequest = (req.body?.method === "tools/call" && req.body?.params?.name === "authenticate") || 
                         (req.body?.method === "initialize") ||
                         (req.method === "GET");
    
    if (!isAuthRequest && !sessionService.isAuthenticated()) {
        return res.status(401).json({
            jsonrpc: "2.0",
            error: {
                code: -32002,
                message: "Session expired or not authenticated. Please use the 'authenticate' tool with your Google Authenticator OTP to enable tools for 30 minutes."
            },
            id: req.body?.id || null
        });
    }

    next();
};
