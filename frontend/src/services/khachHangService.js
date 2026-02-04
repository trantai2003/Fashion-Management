// src/services/khachHangService.js
import api from "@/utils/api";

export const getKhachHangById = async (id) => {
  const response = await api.get(`/customer/${id}`);
  return response.data.data;
};

export const updateKhachHang = async (id, values) => {
  const response = await api.put(`/customer/${id}`, values);
  return response.data.data;
};