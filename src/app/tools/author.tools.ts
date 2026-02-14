import { Tool } from "../interfaces/tools.interface";
import getAuthorDetail from "../controllers/author.controller";

const authorTools:Tool[] = [
    {
        name: "get_author_detail",
        metaData: {
            description: "Get author details for this MCP server",
        },
        handler: getAuthorDetail
    }
];
export default authorTools;