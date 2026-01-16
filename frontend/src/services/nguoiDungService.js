import apiClient from "./apiClient";

/**
 * Backend response shape:
 * {
 *   status: number,
 *   data: T,
 *   message: string,
 *   error: any
 * }
 */

export const nguoiDungService = {
    async register(payload) {
        // payload: RegisterRequest
        const res = await apiClient.post("/api/v1/nguoi-dung/register", payload);
        return res.data; // ResponseData<string>
    },

    async login(payload) {
        // payload: LoginRequest { userName, password }
        const res = await apiClient.post("/api/v1/nguoi-dung/login", payload);

        // Save token if exists
        const token = res?.data?.data?.token;
        if (token) localStorage.setItem("access_token", token);

        return res.data; // ResponseData<LoginResponse>
    },

    async getById(id) {
        const res = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${id}`);
        return res.data; // ResponseData<NguoiDungDto>
    },

    async filter(payload) {
        // payload: BaseFilterRequest
        const res = await apiClient.post("/api/v1/nguoi-dung/filter", payload);
        return res.data; // ResponseData<Page<NguoiDungDto>>
    },

    async update(id, payload) {
        // payload: UpdateNguoiDungRequest
        const res = await apiClient.put(
            `/api/v1/nguoi-dung/update/${id}`,
            payload
        );
        return res.data; // ResponseData<NguoiDungDto>
    },

    async verifyAccount(payload) {
        const res = await apiClient.post("/api/v1/nguoi-dung/active-account", payload);
        return res.data;
    },

    async resendOTP(email) {
        const res = await apiClient.post("/api/v1/nguoi-dung/resend-otp", { email });
        return res.data;
    },

    async sendForgotPasswordOTP(email) {
        const res = await apiClient.post("/api/v1/nguoi-dung/forgot-password", { email });
        return res.data;
    },

    async verifyForgotPasswordOTP(payload) {
        // payload: { email, otp }
        // Dùng chung API active-account để verify OTP theo yêu cầu
        // Lưu ý: Backend cần đảm bảo không lỗi nếu user đã active và không xóa OTP ngay nếu cần dùng cho bước resetPass
        const res = await apiClient.post("/api/v1/nguoi-dung/active-account", payload);
        return res.data;
    },

    async resetPassword(payload) {
        // payload: { email, otp, newPassword }
        const res = await apiClient.post("/api/v1/nguoi-dung/reset-password", payload);
        return res.data;
    },

    logout() {
        localStorage.removeItem("access_token");
    },

    getToken() {
        return localStorage.getItem("access_token");
    },
};
