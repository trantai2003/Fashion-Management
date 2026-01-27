import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
    (config) => {
        if (config.skipAuth) return config;

        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors here, e.g., redirect to login on 401
        return Promise.reject(error);
    }
);

export default apiClient;
