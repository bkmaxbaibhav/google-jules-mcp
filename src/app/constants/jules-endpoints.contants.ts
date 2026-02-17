const API_PATHS = {
    SOURCES: "/v1alpha/sources",
    LIST_SESSIONS: "/v1alpha/sessions",
    CREATE_SESSION: "/v1alpha/sessions",
    APPROVE_PLAN: "/v1alpha/sessions/{sessionId}/approve-plan",
    LIST_ACTIVITIES: "/v1alpha/sessions/{sessionId}/activities",
    SEND_MESSAGE: "/v1alpha/sessions/{sessionId}/messages"
}

export default API_PATHS