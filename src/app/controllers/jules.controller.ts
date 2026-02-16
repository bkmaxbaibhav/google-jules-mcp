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
        pageSize: 2
    }
    const response = await get(API_PATHS.LIST_SESSIONS, params);
    const essentialSessions = response.data.sessions.map((session: any) => ({
        id: session.id,
        name: session.name,
        title: session.title,
        state: session.state,
        createTime: session.createTime
    }));
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(essentialSessions, null, 2)
            }
        ]
    };
}
