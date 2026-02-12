import apiClient from "./apiClient";

export const danhMucQuanAoService = {
    // Lấy cây danh mục
    getCayDanhMuc: () => {
        return apiClient.get("/api/v1/danh-muc-quan-ao/get-cay-danh-muc");
    },

    // Lấy danh mục theo ID
    getById: (id) => {
        return apiClient.get(`/api/v1/danh-muc-quan-ao/get-by-id/${id}`);
    },

    // Tạo danh mục mới
    create: (payload) => {
        return apiClient.post("/api/v1/danh-muc-quan-ao/create", payload);
    },

    // Cập nhật danh mục
    update: (payload) => {
        return apiClient.put("/api/v1/danh-muc-quan-ao/update", payload);
    },

    // Xóa danh mục (soft delete)
    delete: (id) => {
        return apiClient.delete(`/api/v1/danh-muc-quan-ao/delete/${id}`);
    },
};