import apiClient from "./apiClient";
import { getMineKhoList } from "./khoService";

/**
 * Lấy toàn bộ lịch sử giao dịch kho.
 * Backend tự lọc theo phân quyền:
 *   - quan_tri_vien  → tất cả
 *   - quan_ly_kho    → kho mình phụ trách
 *   - nhan_vien_kho  → giao dịch mình thực hiện
 */
export const getLichSuGiaoDichKho = async () => {
  const response = await apiClient.get(`/api/lich-su-giao-dich-kho`);
  return response.data.data;
};

export const getChiTietLichSu = async (id) => {
  const response = await apiClient.get(`/api/lich-su-giao-dich-kho/${id}`);
  return response.data.data;
};

/**
 * Lấy danh sách ID kho mà user hiện tại có quyền truy cập.
 * Dùng cùng endpoint /api/v1/kho/mine như PhieuChuyenKhoDetail.
 */
export const getMyWarehouseIds = async () => {
  const listKho = await getMineKhoList();
  return listKho.map((k) => k.id);
};

/**
 * Kiểm tra user có quyền xem chi tiết giao dịch của một kho cụ thể không.
 *   - Admin → luôn có quyền
 *   - Quản lý / Nhân viên → phải thuộc kho đó
 */
export const canViewGiaoDich = ({ khoId, myWarehouseIds, role }) => {
  if (role === "quan_tri_vien") return true;
  return myWarehouseIds.includes(khoId);
};