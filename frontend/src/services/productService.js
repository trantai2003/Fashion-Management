import apiClient from "./apiClient";

// ==========================================================
// PRODUCT SERVICE (Quản lý sản phẩm)
// Mục tiêu: gom toàn bộ API dùng cho màn ProductList/Add/Edit
// để UI chỉ gọi 1 nơi duy nhất, dễ trace và bảo trì.
// ==========================================================
export const productService = {

    // Quản lý sản phẩm -> lọc danh sách:
    // Frontend -> ProductController.filter -> ProductService.filter -> ProductRepository.filter/page query
    filterProducts: (payload) => {
        return apiClient.post("/api/v1/san-pham-quan-ao/filter", payload);
    },


    // Chi tiết sản phẩm:
    // Frontend -> ProductController.getById -> ProductService.getById -> ProductRepository.findById (+ map DTO)
    getProductById: (id) => {
        return apiClient.get(`/api/v1/san-pham-quan-ao/get-by-id/${id}`);
    },


    // Thêm sản phẩm mới:
    // Frontend submit FormData -> ProductController.create(@Valid) -> ProductService.create(@Transactional)
    // -> validate nghiệp vụ + save product/variant/image qua Repository -> ApiResponse
    createProduct: (formData) => {
        return apiClient.post("/api/v1/san-pham-quan-ao/create", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },


    // Cập nhật sản phẩm:
    // Frontend -> ProductController.update -> ProductService.update -> Repository.findById/save
    updateProduct: (id, formData) => {
        return apiClient.put("/api/v1/san-pham-quan-ao/update", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },


    // Xóa mềm sản phẩm:
    // Frontend -> ProductController.softDelete -> ProductService.softDelete -> Repository.save(trangThai)
    deleteProduct: (id) => {
        return apiClient.delete(`/api/v1/san-pham-quan-ao/soft-delete/${id}`);
    },

    // Cập nhật trạng thái sản phẩm còn hàng/hết hàng/ngừng hoạt động.
    updateStatus: (id, status) => {
        return apiClient.patch(`/api/v1/san-pham-quan-ao/status/${id}?status=${status}`);
    },

    // Cập nhật giá ở mức SKU (biến thể).
    updateSkuPrice: (skuId, giaBan, giaVon) => {
        let query = `/api/v1/san-pham-quan-ao/sku/${skuId}/price?`;
        if (giaBan !== undefined) query += `price=${giaBan}&`;
        if (giaVon !== undefined) query += `cost=${giaVon}`;
        return apiClient.patch(query);
    },

    // Toggle nhanh trạng thái (endpoint legacy).
    toggleProductStatus: (id) => {
        return apiClient.post(`/api/v1/products/${id}/toggle-status`);
    },

    // Dữ liệu danh mục cho form sản phẩm.
    getCategories: () => {
        return apiClient.get("/api/v1/danh-muc-quan-ao/all");
    },

    // Dữ liệu thuộc tính màu.
    getColors: () => {
        return apiClient.get("/api/v1/mau-sac/all");
    },


    // Dữ liệu thuộc tính size.
    getSizes: () => {
        return apiClient.get("/api/v1/size/all");
    },


    // Dữ liệu thuộc tính chất liệu.
    getMaterials: () => {
        return apiClient.get("/api/v1/chat-lieu/all");
    },


    // Lấy danh sách biến thể theo sản phẩm.
    getProductVariants: (productId) => {
        return apiClient.get(`/api/v1/san-pham-quan-ao/${productId}/variants`);
    }
};