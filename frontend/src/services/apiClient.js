import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

// Mặc định tự động truyền token và kho vào header
// Nếu needToken = false hoặc needKho = false thì không truyền thông tin đó
apiClient.interceptors.request.use(
    (config) => {
        if (config.skipAuth) return config;

        // Mặc định cần truyền token và kho (trừ khi được set thành false)
        const needToken = config.needToken !== false;
        const needKho = config.needKho !== false;

        const token = localStorage.getItem("access_token");
        const khoId = localStorage.getItem("selected_kho_id");
        
        if (token && needToken) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (khoId && needKho) {
            config.headers = config.headers || {};
            config.headers['kho_id'] = khoId;
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
