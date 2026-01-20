// MAP NhomQuyen + IPermissionType

export const PERMISSION_GROUPS = [
  {
    groupKey: "quan_ly_kho",
    groupLabel: "Quản lý kho",
    permissions: [
      { key: "xem_ton_kho", label: "Xem tồn kho" },
      { key: "xem_chi_tiet_lo", label: "Xem chi tiết lô" },
      { key: "dieu_chinh_ton_kho", label: "Điều chỉnh tồn kho" },
      { key: "chuyen_kho", label: "Chuyển kho" },
    ],
  },
  {
    groupKey: "nhap_kho",
    groupLabel: "Nhập kho",
    permissions: [
      { key: "tao_don_mua_hang", label: "Tạo đơn mua hàng" },
      { key: "duyet_don_mua_hang", label: "Duyệt đơn mua hàng" },
      { key: "tao_phieu_nhap", label: "Tạo phiếu nhập" },
      { key: "duyet_phieu_nhap", label: "Duyệt phiếu nhập" },
      { key: "huy_phieu_nhap", label: "Hủy phiếu nhập" },
    ],
  },
  {
    groupKey: "xuat_kho",
    groupLabel: "Xuất kho",
    permissions: [
      { key: "tao_don_ban_hang", label: "Tạo đơn bán hàng" },
      { key: "duyet_don_ban_hang", label: "Duyệt đơn bán hàng" },
      { key: "tao_phieu_xuat", label: "Tạo phiếu xuất" },
      { key: "duyet_phieu_xuat", label: "Duyệt phiếu xuất" },
      { key: "huy_phieu_xuat", label: "Hủy phiếu xuất" },
    ],
  },
  {
    groupKey: "bao_cao",
    groupLabel: "Báo cáo",
    permissions: [
      { key: "xem_bao_cao_ton_kho", label: "Xem báo cáo tồn kho" },
      { key: "xem_bao_cao_nhap_xuat", label: "Xem báo cáo nhập xuất" },
      { key: "xem_bao_cao_doanh_thu", label: "Xem báo cáo doanh thu" },
      { key: "xuat_bao_cao", label: "Xuất báo cáo" },
    ],
  },
  {
    groupKey: "cai_dat",
    groupLabel: "Cài đặt",
    permissions: [
      { key: "quan_ly_nhan_vien_kho", label: "Quản lý nhân viên kho" },
      { key: "cap_quyen_nhan_vien", label: "Cấp quyền nhân viên" },
      { key: "quan_ly_san_pham", label: "Quản lý sản phẩm" },
      { key: "quan_ly_nha_cung_cap", label: "Quản lý nhà cung cấp" },
      { key: "quan_ly_khach_hang", label: "Quản lý khách hàng" },
    ],
  },
];
