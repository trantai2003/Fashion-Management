import apiClient from "./apiClient";

export const phieuNhapKhoService = {
    async filter(payload) {
        const res = await apiClient.post("/api/v1/phieu-nhap-kho/filter", payload);
        return res.data;
    },
    async create(payload) {
        const res = await apiClient.post("/api/v1/phieu-nhap-kho/create", payload);
        return res.data;
    },
    async getDetail(id) {
        const res = await apiClient.get(`/api/v1/phieu-nhap-kho/${id}/detail`);
        return res.data;
    },
    async cancel(id) {
        return apiClient.put(`/api/v1/phieu-nhap-kho/${id}/cancel`);
    },
    async khaiBaoLo(phieuNhapKhoId, payload) {
        const res = await apiClient.post(`/api/v1/phieu-nhap-kho/${phieuNhapKhoId}/khai-bao-lo`, payload);
        return res.data;
    },
    async getLotInput(phieuNhapKhoId, bienTheSanPhamId) {
        const res = await apiClient.get(`/api/v1/phieu-nhap-kho/${phieuNhapKhoId}/bien-the/${bienTheSanPhamId}/lo-hang`);
        return res.data;
    },
    async deleteLo(phieuNhapKhoId, chiTietPhieuNhapKhoId) {
        return apiClient.delete(`/api/v1/phieu-nhap-kho/${phieuNhapKhoId}/lo-hang/${chiTietPhieuNhapKhoId}`);
    },
    async complete(id) {
        const res = await apiClient.put(`/api/v1/phieu-nhap-kho/${id}/complete`);
        return res.data;
    },
    createFromTransfer: (transferId) => {
        return apiClient.post(`/api/v1/phieu-nhap-kho/from-transfer/${transferId}`);
    },
    completeTransferReceipt: (id) => {
        return apiClient.put(`/api/v1/phieu-nhap-kho/${id}/complete-transfer`);
    },
};