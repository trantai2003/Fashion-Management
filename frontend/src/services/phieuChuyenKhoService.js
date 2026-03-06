import apiClient from "./apiClient";
export const phieuChuyenKhoService = {
    async filter(payload) {
        const res = await apiClient.post("/api/v1/phieu-chuyen-kho/filter", payload);
        return res.data?.data || res.data;
    },
    async getDetail(id) {
        const res = await apiClient.get(`/api/v1/phieu-chuyen-kho/${id}`);
        return res.data?.data || res.data;
    },
    async submit(id) {
        return await apiClient.put(`/api/v1/phieu-chuyen-kho/${id}/submit`);
    },
    async approve(id) {
        return await apiClient.put(`/api/v1/phieu-chuyen-kho/${id}/approve`);
    },
    async startShipping(id) {
        return await apiClient.put(`/api/v1/phieu-chuyen-kho/${id}/start-shipping`);
    },
    async cancel(id) {
        return await apiClient.put(`/api/v1/phieu-chuyen-kho/${id}/cancel`);
    },
    async completeReceipt(id) {
        return await apiClient.put(`/api/v1/phieu-nhap-kho/${id}/complete-transfer`);
    },
    async create(payload) {
        const res = await apiClient.post("/api/v1/phieu-chuyen-kho/create", payload);
        return res.data?.data || res.data;
    }
}