import apiClient from "./apiClient";

export const getLichSuGiaoDichKho = async () => {
  const response = await apiClient.get(`/api/lich-su-giao-dich-kho`);
  return response.data.data;
};

export const getChiTietLichSu = async (id) => {
  const response = await apiClient.get(`/api/lich-su-giao-dich-kho/${id}`);
  return response.data.data;
};