import apiClient from "./apiClient";

export const nguoiDungService = {

    async getById(id) {
        const res = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${id}`);
        return res.data; // ResponseData<NguoiDungDto>
    },

    async updateUser(payload) {
        // payload: { id, tenDangNhap, hoTen, email, soDienThoai }
        const res = await apiClient.put("/api/v1/nguoi-dung/update", payload);
        return res.data; // ResponseData<NguoiDungDto>
    },

    async register(payload) {
        const res = await apiClient.post("/api/v1/nguoi-dung/register", payload, { skipAuth: true });
        return res.data;
    },

    async login(payload) {
        const res = await apiClient.post("/api/v1/nguoi-dung/login", payload, { skipAuth: true });
        const token = res?.data?.data?.token;
        if (token) localStorage.setItem("access_token", token);
        return res.data;
    },

    async verifyAccount(payload) {
        // dùng cho KÍCH HOẠT TÀI KHOẢN (register)
        const res = await apiClient.post("/api/v1/nguoi-dung/active-account", payload, { skipAuth: true });
        return res.data;
    },

    async resendOTP(email) {
        const res = await apiClient.post("/api/v1/nguoi-dung/resend-otp", { email }, { skipAuth: true });
        return res.data;
    },

    async sendForgotPasswordOTP(usernameOrEmail) {
        // BE expects: { username }
        const res = await apiClient.post(
            "/api/v1/nguoi-dung/forgot-password",
            { username: usernameOrEmail },
            { skipAuth: true }
        );
        return res.data;
    },

    async resetPassword({ username, otp, password }) {
        // BE expects: { username, otp, password }
        const res = await apiClient.post(
            "/api/v1/nguoi-dung/reset-password",
            { username, otp, password },
            { skipAuth: true }
        );
        return res.data;
    },

    logout() {
        localStorage.removeItem("access_token");
    },

    getToken() {
        return localStorage.getItem("access_token");
    },


};