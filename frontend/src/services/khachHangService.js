// src/services/khachHangService.js
import apiClient from "./apiClient";  // Giữ nguyên import

//Lấy chi tiết khách hàng bằng ID
export const getKhachHangById = async (id) => {
  const response = await apiClient.get(`/api/v1/khach-hang/${id}`);  // ← Thêm /api/
  return response.data.data;
};

//Cập nhật thông tin khách hàng
export const updateKhachHang = async (id, values) => {
  const response = await apiClient.put(`/api/v1/khach-hang/${id}`, values);  // ← Thêm /api/
  return response.data.data;
};