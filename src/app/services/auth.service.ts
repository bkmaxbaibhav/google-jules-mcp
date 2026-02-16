import { Request, Response, NextFunction } from "express";
import environments from "../../environments";

/**
 * Middleware to validate API Key in the request headers
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    // Stdio transport does not use HTTP auth
    if (process.env.TRANSPORT === "stdio") {
        return next();
    }

    // Check for API key in headers OR query parameters (useful for clients that don't support custom headers)
    const apiKeyHeader = req.headers["x-api-key"];
    const apiKeyQuery = req.query.apiKey;
    
    const apiKey = apiKeyHeader || apiKeyQuery;
    const validApiKey = process.env.MCP_API_KEY || "jules-secret-key";

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            jsonrpc: "2.0",
            error: {
                code: -32001,
                message: "Unauthorized: Invalid or missing API Key. Provide it in 'x-api-key' header or 'apiKey' query parameter."
            },
            id: req.body?.id || null
        });
    }

    next();
};
