import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // cấu hình theo môi trường
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (gắn token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle error chung)
api.interceptors.response.use(
  (response) => response.data, // chỉ trả data cho gọn
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Có lỗi xảy ra";

    return Promise.reject(message);
  }
);

export default api;
