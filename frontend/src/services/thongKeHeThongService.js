import apiClient from './apiClient';

export const thongKeHeThongService = {

    getTonKho: () =>
        apiClient.get("/api/v1/thong-ke-he-thong/ton-kho"),

    getTonKhoBienThe: (bienTheId) =>
        apiClient.get(`/api/v1/thong-ke-he-thong/ton-kho-bien-the/${bienTheId}`),

    filterTonKho: (filterPayload) =>
        apiClient.post("/api/v1/thong-ke-he-thong/ton-kho/filter", filterPayload),

    getSanPhamBanChay: (top = 10) =>
        apiClient.get(`/api/v1/thong-ke-he-thong/san-pham/ban-chay/${top}`),

    getBienTheByProduct: (sanPhamId) =>
        apiClient.get(`/api/v1/bien-the-san-pham/by-product/${sanPhamId}`),

    getTonKhoTongQuan: (params) =>
        apiClient.get("/api/v1/thong-ke-he-thong/ton-kho-tong-quan", { params }),

};