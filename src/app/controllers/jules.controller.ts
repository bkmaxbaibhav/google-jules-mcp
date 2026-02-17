import { get, post } from "../services/http.service";
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

export async function listSessions(payload: any) {
    const params = {
        pageSize: payload.pageSize
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

export async function createSession(payload: any) {
    const response = await post(API_PATHS.LIST_SESSIONS, payload);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
            }
        ]
    };
}

export async function approvePlan(payload: any) {
    const response = await post(`/v1alpha/${payload.name}:approvePlan`);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
            }
        ]
    };
}

export async function listActivities(payload: any) {
    const params = {
        pageSize: payload.pageSize || 30
    }
    const response = await get(`/v1alpha/${payload.name}/activities`, params);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
            }
        ]
    };
}

export async function sendMessage(payload: any) {
    const { name, prompt } = payload;
    const response = await post(`/v1alpha/${name}:sendMessage`, { prompt });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(response.data, null, 2)
            }
        ]
    };
}
