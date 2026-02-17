import axios from "axios";
import environments from "../../environments";

const headers = {
    "X-Goog-Api-Key": environments.jules.apiKey,
}

export function get(apiPath: string, params = {}) {
    return axios.get(environments.jules.baseUrl + apiPath, {
        headers,
        params,
    });
}

export function post(apiPath: string, data = {}) {
    return axios.post(environments.jules.baseUrl + apiPath, data, {
        headers,
    });
}
