import apiClient from "./apiClient";
export const phieuChuyenKhoService = {
    async filter(payload) {
        const res = await apiClient.post("/api/v1/phieu-chuyen-kho/filter", payload);
        return res.data?.data || res.data;
    },
}