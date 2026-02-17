import { Tool } from "../interfaces/tools.interface";
import { authenticate } from "../controllers/auth.controller";
import { z } from "zod";

const authTools: Tool[] = [
    {
        name: "authenticate",
        metaData: {
            description: "Authenticate using Google Authenticator OTP to enable other tools for 30 minutes.",
            inputSchema: {
                otp: z.string().describe("The 6-digit OTP from your Google Authenticator app"),
            },
        },
        handler: authenticate
    }
];

export default authTools;
