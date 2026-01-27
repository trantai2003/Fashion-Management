import apiClient from "./apiClient";

export const khoService = {
  filter: (payload) =>
    apiClient.post("/api/v1/kho/filter", payload),

  getById: (id) =>
    apiClient.get(`/api/v1/kho/get-by-id/${id}`),
};