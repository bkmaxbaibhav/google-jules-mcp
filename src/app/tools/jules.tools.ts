import { Tool } from "../interfaces/tools.interface";
import { getSources, listSessions } from "../controllers/jules.controller";

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
        },
        handler: listSessions
    }
];
export default julesTools;