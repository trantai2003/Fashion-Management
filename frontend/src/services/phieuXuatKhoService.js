import apiClient from "./apiClient";

export const phieuXuatKhoService = {
    async filter(payload) {
        const res = await apiClient.post("/api/v1/phieu-xuat-kho/filter", payload);
        return res.data;
    },
    async create(payload) {
        const res = await apiClient.post("/api/v1/phieu-xuat-kho/create", payload);
        return res.data;
    },
    async getDetail(id) {
        const res = await apiClient.get(`/api/v1/phieu-xuat-kho/${id}`);
        return res.data;
    },
    async cancel(id) {
        return apiClient.put(`/api/v1/phieu-xuat-kho/${id}/cancel`);
    }
};