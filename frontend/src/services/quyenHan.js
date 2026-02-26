import apiClient from "./apiClient";

export const quyenHanService = {

    getAllQuyenHan: () => {
        return apiClient.get("/api/v1/dieu-hanh-he-thong/quyen-han/all");
    },

    // Gán quyền cho 1 kho cụ thể (mỗi kho 1 request)
    ganQuyenQuyenHan: ({ khoId, payload }) => {
        return apiClient.post(
            "/api/v1/dieu-hanh-he-thong/quyen-han/gan-quyen",
            payload,
            {
                headers: {
                    "kho_id": khoId,
                },
            }
        );
    },
};