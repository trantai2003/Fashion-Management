import apiClient from './apiClient'; // hoặc import axios từ config của bạn

export const thongKeHeThongService = {
    /**
     * Lấy tồn kho chi tiết theo từng kho (dùng khoId từ SecurityContext)
     */
    getTonKho: () =>
        apiClient.get("/api/v1/thong-ke-he-thong/ton-kho"),

    /**
     * Lấy tồn kho chi tiết của 1 biến thể (tất cả các kho)
     * @param {number} bienTheId
     */
    getTonKhoBienThe: (bienTheId) =>
        apiClient.get(`/api/v1/thong-ke-he-thong/ton-kho-bien-the/${bienTheId}`),

    /**
     * Filter tồn kho có phân trang
     * @param {object} filterPayload
     */
    filterTonKho: (filterPayload) =>
        apiClient.post("/api/v1/thong-ke-he-thong/ton-kho/filter", filterPayload),

    /**
     * Lấy top N sản phẩm bán chạy nhất
     * @param {number} top - số lượng sản phẩm muốn lấy (mặc định 10)
     */
    getSanPhamBanChay: (top = 10) =>
        apiClient.get(`/api/v1/thong-ke-he-thong/san-pham/ban-chay/${top}`),

    /**
     * Lấy danh sách biến thể của 1 sản phẩm
     * Gọi API biến thể theo sanPhamId - điều chỉnh endpoint theo backend của bạn
     * @param {number} sanPhamId
     */
    getBienTheByProduct: (sanPhamId) =>
        apiClient.get(`/api/v1/bien-the-san-pham/by-product/${sanPhamId}`),
};