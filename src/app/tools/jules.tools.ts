import { Tool } from "../interfaces/tools.interface";
import { getSources, listSessions, createSession, approvePlan, listActivities, sendMessage } from "../controllers/jules.controller";
import { z } from "zod";

const julesTools:Tool[] = [
    {
        name: "get_sources",
        metaData: {
            description: "Get sources from Jules API [ An input source for the agent (e.g., a GitHub repository). ]",
        },
        handler: getSources
    },
    {
        name: "list_sessions",
        metaData: {
            description: "List sessions from Jules API [ A session is a conversation between the user and the agent. ]",
            inputSchema: {
                pageSize: z
                .number()
                .optional()
                .default(2)
                .describe("Number of sessions to list"),
            },
        },
        handler: listSessions
    },
    {
        name: "create_session",
        metaData: {
            description: "Create a new session in Jules API.",
            inputSchema: {
                prompt: z.string().describe("The prompt to start the session with (e.g., 'Create a boba app!')"),
                sourceContext: z.object({
                    source: z.string().describe("The source name (e.g., 'sources/github/bobalover/boba')"),
                    githubRepoContext: z.object({
                        startingBranch: z.string().optional().describe("The branch to start from (e.g., 'main')")
                    }).optional()
                }).describe("Context about the source code"),
                automationMode: z.string().optional().describe("The automation mode (e.g., 'AUTO_CREATE_PR')"),
                title: z.string().optional().describe("The title of the session"),
                requirePlanApproval: z.boolean().optional().describe("Whether the session requires explicit plan approval")
            }
        },
        handler: createSession
    },
    {
        name: "approve_plan",
        metaData: {
            description: "Approve the latest plan for a specific session in Jules API.",
            inputSchema: {
                name: z.string().describe("The name of the session (e.g., 'sessions/31415926535897932384')"),
            },
        },
        handler: approvePlan
    },
    {
        name: "list_activities",
        metaData: {
            description: "List activities for a specific session in Jules API.",
            inputSchema: {
                name: z.string().describe("The name of the session (e.g., 'sessions/31415926535897932384')"),
                pageSize: z.number().optional().default(30).describe("Number of activities to list"),
            },
        },
        handler: listActivities
    },
    {
        name: "send_message",
        metaData: {
            description: "Send a message/prompt to the agent within an existing session.",
            inputSchema: {
                name: z.string().describe("The name of the session (e.g., 'sessions/31415926535897932384')"),
                prompt: z.string().describe("The message to send to the agent (e.g., 'Can you make the app corgi themed?')"),
            },
        },
        handler: sendMessage
    }
];
export default julesTools;