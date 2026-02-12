import apiClient from "./apiClient";

export const khoService = {
  filter: async (payload) => {
    console.log(payload);
    const response = await apiClient.post("/api/v1/kho/filter", payload);
    return response.data;
  },
  getById: (id) =>
    apiClient.get(`/api/v1/kho/get-by-id/${id}`),
};