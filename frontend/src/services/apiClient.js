import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.skipAuth) return config;

        const fixedToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0cmFudGFpMTcxMDIwMDNAZ21haWwuY29tIiwic29EaWVuVGhvYWkiOiIwOTAxMjM0NTY3IiwiaXNzIjoiRmFzaGlvblN5c3RlbSIsInRlbkRhbmdOaGFwIjoiYWRtaW4iLCJ1c2VyQWdlbnQiOiJHb29nbGUiLCJ0cmFuZ1RoYWkiOjEsInNjb3BlIjoicXVhbl90cmlfdmllbiIsIndhcmVob3VzZVBlcm1pc3Npb25zIjoiW10iLCJpZCI6MSwiaG9UZW4iOiJUcuG6p24gxJDhu6ljIFTDoGkiLCJleHAiOjE3Njk0MDI0NTcsImlhdCI6MTc2OTMxNjA1N30.EaRVpuzlJzzAtWJjcgZ1Meb1QnOZoWmtFaO20xkL0V0";

        const token = fixedToken || localStorage.getItem("access_token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {

        if (response?.data?.status >= 400) {
            const error = new Error(response.data.message || 'Error');
            error.response = response;
            return Promise.reject(error);
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
