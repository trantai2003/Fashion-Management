import apiClient from './apiClient';

const purchaseOrderService = {
    /**
     * Lấy chi tiết đơn mua hàng theo ID
     * @param {number} id 
     * @returns Promise<ResponseData<DonMuaHangDto>>
     */
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/api/v1/don-mua-hang/get-by-id/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching purchase order ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lọc và phân trang danh sách đơn mua hàng
     * @param {Object} filterRequest - Đối tượng BaseFilterRequest (filters, sorts, page, size)
     * @returns Promise<ResponseData<Page<DonMuaHangDto>>>
     */
    filter: async (filterRequest) => {
        try {
            const response = await apiClient.post(`/api/v1/don-mua-hang/filter`, filterRequest);
            return response.data;
        } catch (error) {
            console.error('Error filtering purchase orders:', error);
            throw error;
        }
    },

    /**
     * (Optional) Helper để build nhanh object filter nếu bạn muốn dùng ở nhiều nơi
     */
    buildFilterRequest: (filters = [], page = 0, size = 10, sorts = []) => {
        return {
            filters: filters,
            sorts: sorts.length > 0 ? sorts : [{ fieldName: "ngayTao", direction: "DESC" }],
            page: page,
            size: size
        };
    },

    /**
     * Lấy danh sách nhà cung cấp unique từ các đơn mua hàng
     * @returns Promise<Array<NhaCungCap>>
     */
    getUniqueSuppliers: async () => {
        try {
            const response = await apiClient.post(`/api/v1/don-mua-hang/filter`, {
                filters: [],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page: 0,
                size: 1000 // Lấy nhiều để có đủ suppliers
            });

            const orders = response.data?.data?.content || [];

            // Lọc unique suppliers
            const suppliersMap = new Map();
            orders.forEach(order => {
                if (order.nhaCungCap && order.nhaCungCap.id) {
                    suppliersMap.set(order.nhaCungCap.id, order.nhaCungCap);
                }
            });

            // Convert Map to Array và sort theo tên
            return Array.from(suppliersMap.values()).sort((a, b) =>
                (a.tenNhaCungCap || '').localeCompare(b.tenNhaCungCap || '')
            );
        } catch (error) {
            console.error('Error fetching unique suppliers:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách kho unique từ các đơn mua hàng
     * @returns Promise<Array<Kho>>
     */
    getUniqueWarehouses: async () => {
        try {
            const response = await apiClient.post(`/api/v1/don-mua-hang/filter`, {
                filters: [],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page: 0,
                size: 1000 // Lấy nhiều để có đủ warehouses
            });

            const orders = response.data?.data?.content || [];

            // Lọc unique warehouses
            const warehousesMap = new Map();
            orders.forEach(order => {
                if (order.khoNhap && order.khoNhap.id) {
                    warehousesMap.set(order.khoNhap.id, order.khoNhap);
                }
            });

            // Convert Map to Array và sort theo tên
            return Array.from(warehousesMap.values()).sort((a, b) =>
                (a.tenKho || '').localeCompare(b.tenKho || '')
            );
        } catch (error) {
            console.error('Error fetching unique warehouses:', error);
            throw error;
        }
    },

    /**
     * Cập nhật trạng thái đơn mua hàng
     * @param {number} id 
     * @param {number} trangThai 
     * @returns Promise<ResponseData<string>>
     */
    duyetDon: async (id, trangThai) => {
        try {
            const response = await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${id}/${trangThai}`);
            return response.data;
        } catch (error) {
            console.error(`Error updating purchase order status ${id}:`, error);
            throw error;
        }
    },

    /**
     * Gửi email yêu cầu báo giá đến nhà cung cấp
     * @param {number} id - ID của đơn mua hàng
     * @returns Promise<ResponseData<string>>
     */
    guiMailYeuCauBaoGia: async (id) => {
        try {
            const response = await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${id}/3`);
            return response.data;
        } catch (error) {
            console.error(`Error sending quotation request email for purchase order ${id}:`, error);
            throw error;
        }
    }
};

export default purchaseOrderService;