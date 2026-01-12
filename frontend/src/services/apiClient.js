import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080', // Thay đổi port này nếu backend của bạn chạy ở port khác
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
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
