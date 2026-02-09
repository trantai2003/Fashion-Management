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
};