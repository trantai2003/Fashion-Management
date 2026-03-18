import apiClient from "./apiClient";

export const khoService = {
  filter: (payload) => {
    console.log(payload);
    return apiClient.post("/api/v1/kho/filter", payload);
  },
  getById: (id) =>
    apiClient.get(`/api/v1/kho/get-by-id/${id}`),
  create: (payload) => {
    return apiClient.post("/api/v1/kho/create", payload);
  },
  update: async (payload) => {
    try {
      return await apiClient.put("/api/v1/kho/update", payload);
    } catch (error) {
      // Backward compatibility for BE versions that still accept POST.
      return apiClient.post("/api/v1/kho/update", payload);
    }
  },
  delete: (id) => {
    return apiClient.delete(`/api/v1/kho/soft-delete/${id}`);
  },
  getAllKho: async () => {
    const res = await apiClient.post("/api/v1/kho/filter", {
      filters: [],
      sorts: [],
      page: 0,
      size: 1000,
    });
    return res.data;
  },
  getManagers: () => {
    return apiClient.post("/api/v1/admin/filter", {
      page: 0,
      size: 100,
      filters: [
        {
          fieldName: "vaiTro",
          operation: "EQUALS",
          value: "quan_ly_kho",
          logicType: "AND",
        },
        {
          fieldName: "trangThai",
          operation: "EQUALS",
          value: 1,
          logicType: "AND",
        },
      ],
      sorts: [{ fieldName: "hoTen", direction: "ASC" }],
    });
  },
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
export const getMineKhoList = async () => {
  const res = await apiClient.post("/api/v1/kho/mine", {
    filters: [],
    sorts: [],
    page: 0,
    size: 1000
  });
  return res.data?.data?.content ?? [];
};