import apiClient from "./apiClient";

const purchaseOrderDetailService = {
    /**
     * Lấy chi tiết đơn mua hàng theo ID
     * @param {number} id - ID của đơn mua hàng
     * @returns {Promise<Object>} - Promise trả về dữ liệu chi tiết đơn mua hàng
     */
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/api/v1/don-mua-hang/get-by-id/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching purchase order detail with id ${id}:`, error);
            throw error;
        }
    },
};

export default purchaseOrderDetailService;
