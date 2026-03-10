import apiClient from "./apiClient";

export const khoService = {
  filter: (payload) => {
    console.log(payload);
    return apiClient.post("/api/v1/kho/filter", payload);
  },
  getById: (id) =>
    apiClient.get(`/api/v1/kho/get-by-id/${id}`),
};

// FIX: Thêm getKhoList dùng endpoint /filter với payload rỗng để lấy tất cả kho
export const getKhoList = async () => {
  const res = await apiClient.post("/api/v1/kho/filter", {
    filters: [],
    sorts: [],
    page: 0,
    size: 1000,
  });
  // Trả về mảng content từ Page object
  return res.data?.data?.content ?? [];
};