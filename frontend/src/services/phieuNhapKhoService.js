import apiClient from "./apiClient";

export const phieuNhapKhoService = {
    async filter(payload) {
        const res = await apiClient.post("/api/v1/phieu-nhap-kho/filter", payload);
        return res.data;
    },
};