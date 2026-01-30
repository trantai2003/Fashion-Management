import apiClient from "./apiClient";

/**
 * Tất cả API đều trả về:
 * { status, data, message, error }
 */

export const mauSacService = {
  async filter(payload) {
    const res = await apiClient.post("/api/v1/mau-sac/filter", payload);
    return res.data; // ResponseData<Page<MauSacDto>>
  },

  async create(payload) {
    const res = await apiClient.post("/api/v1/mau-sac/create", payload);
    return res.data; // ResponseData<MauSacDto>
  },

  async update(payload) {
    const res = await apiClient.post("/api/v1/mau-sac/update", payload);
    return res.data; // ResponseData<MauSacDto>
  },

  async delete(id) {
    const res = await apiClient.delete(`/api/v1/mau-sac/delete/${id}`);
    return res.data; // ResponseData<String>
  },
};

export const sizeService = {
  async filter(payload) {
    const res = await apiClient.post("/api/v1/size/filter", payload);
    return res.data; // ResponseData<Page<SizeDto>>
  },

  async create(payload) {
    const res = await apiClient.post("/api/v1/size/create", payload);
    return res.data; // ResponseData<SizeDto>
  },

  async update(payload) {
    const res = await apiClient.post("/api/v1/size/update", payload);
    return res.data; // ResponseData<SizeDto>
  },

  async delete(id) {
    const res = await apiClient.delete(`/api/v1/size/delete/${id}`);
    return res.data; // ResponseData<String>
  },
};
