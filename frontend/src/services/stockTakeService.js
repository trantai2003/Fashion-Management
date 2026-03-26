// src/services/stockTakeService.js
import apiClient from "./apiClient";

// Lấy thông tin 1 đợt kiểm kê theo id
export const getStockTake = async (id) => {
  const response = await apiClient.get(`/api/phieu-kiem-ke/${id}`);
  return response.data.data;
};

// Lấy danh sách tất cả đợt kiểm kê
export const getStockTakes = async () => {
  const response = await apiClient.get(`/api/phieu-kiem-ke`);
  return response.data.data ?? [];
};

// Tạo đợt kiểm kê mới → trả về dotKiemKeId (Integer)
export const createStockTake = async (values) => {
  const response = await apiClient.post(`/api/phieu-kiem-ke`, values);
  return response.data.data; // trả về dotKiemKeId (Integer)
};

// Lấy chi tiết các lô hàng trong đợt kiểm kê
export const getStockTakeDetails = async (id) => {
  const response = await apiClient.get(`/api/phieu-kiem-ke/${id}/chi-tiet`);
  return response.data.data ?? [];
};

// Hoàn thành đợt kiểm kê, cập nhật số lượng thực tế
export const completeStockTake = async (id, khoId, updates) => {
  const response = await apiClient.patch(
    `/api/phieu-kiem-ke/${id}/complete?khoId=${khoId}`,
    updates
  );
  return response.data.data;
};