// src/services/khachHangService.js
import apiClient from "./apiClient";  // Giữ nguyên import

export const getKhachHangById = async (id) => {
  const response = await apiClient.get(`/api/customer/${id}`);  // ← Thêm /api/
  return response.data.data;
};

export const updateKhachHang = async (id, values) => {
  const response = await apiClient.put(`/api/customer/${id}`, values);  // ← Thêm /api/
  return response.data.data;
};