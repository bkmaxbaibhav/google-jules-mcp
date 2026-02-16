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

    const apiKey = req.headers["x-api-key"];
    const validApiKey = process.env.MCP_API_KEY || "jules-secret-key";

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            jsonrpc: "2.0",
            error: {
                code: -32001,
                message: "Unauthorized: Invalid or missing API Key"
            },
            id: req.body?.id || null
        });
    }

    next();
};
