import apiClient from "./apiClient";

export const khoService = {

  filter: (payload) => {
    return apiClient.post("/api/v1/kho/filter", payload);
  },


  getById: (id) => {
    return apiClient.get(`/api/v1/kho/get-by-id/${id}`);
  },


  create: (warehouseData) => {
    return apiClient.post("/api/v1/kho/create", warehouseData);
  },


  update: (warehouseData) => {
    return apiClient.put("/api/v1/kho/update", warehouseData);
  },


  delete: (id) => {
    return apiClient.delete(`/api/v1/kho/delete/${id}`);
  },


  getManagers: () => {
    return apiClient.post("/api/v1/nguoi-dung/filter", {
      filters: [
        {
          fieldName: "vaiTro",
          operation: "EQUALS",
          value: "quan_ly_kho",
          logicType: "AND"
        }
      ],
      sorts: [
        {
          fieldName: "hoTen",
          direction: "ASC"
        }
      ],
      page: 0,
      size: 100
    });
  }
};