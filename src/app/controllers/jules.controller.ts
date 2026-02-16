import { get} from "../services/http.service";
import API_PATHS from "../constants/jules-endpoints.contants";

export async function getSources() {
    const response = await get(API_PATHS.SOURCES);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response.data.sources, null, 2)
            }
        ]
    };
}

export async function listSessions() {
    const params = {
        pageSize: 5
    }
    const response = await get(API_PATHS.LIST_SESSIONS, params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response.data.sessions, null, 2)
            }
        ]
    };
}
