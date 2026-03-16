import apiClient from "./apiClient";

const applicationRequestService = {
    /**
     * Nhân viên mua hàng: Lấy yêu cầu tạo đơn của mình
     */
    getMyRequest: async () => {
        const res = await apiClient.get('/api/v1/nghiep-vu/yeu-cau-tao-don-cua-toi');
        return res.data?.data ?? null;
    },

    /**
     * Nhân viên mua hàng: Gửi yêu cầu tạo đơn mua hàng
     * @param {{ nguoiDungId: number, khoId: number, bienTheSanPhamIds: number[], ghiChu: string }} payload
     */
    createRequest: async (payload) => {
        const res = await apiClient.post('/api/v1/nghiep-vu/tao-yeu-cau-tao-don-mua-hang', payload);
        return res.data;
    },

    /**
     * Admin / Quản lý kho: Lấy danh sách tất cả yêu cầu
     */
    getAllRequests: async () => {
        const res = await apiClient.get('/api/v1/nghiep-vu/danh-sach-yeu-cau-tao-don-mua-hang');
        return res.data?.data ?? [];
    },

    /**
     * Admin / Quản lý kho: Duyệt hoặc từ chối yêu cầu
     * @param {number} nguoiDungId  - ID người dùng (dùng làm path id theo backend)
     * @param {number} status       - 2 = duyệt, 0 = từ chối
     */
    reviewRequest: async (nguoiDungId, status) => {
        const res = await apiClient.get(
            `/api/v1/nghiep-vu/duyet-yeu-cau-tao-don-mua-hang/${nguoiDungId}/${status}`
        );
        return res.data;
    },
};

export default applicationRequestService;