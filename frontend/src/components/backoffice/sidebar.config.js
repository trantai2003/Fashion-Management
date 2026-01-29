import {
  LayoutDashboard,
  ShieldAlert,
  Package,
  ArrowDownToLine,
  Warehouse,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

export const SIDEBAR_MENU = [
  // ================= DASHBOARD =================
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
    roles: [
      "quan_tri_vien",
    ],
  },

  // ================= QUẢN TRỊ HỆ THỐNG =================
  {
    label: "Quản trị hệ thống",
    icon: ShieldAlert,
    roles: ["quan_tri_vien"],
    children: [
      { label: "Người dùng", to: "/users" },
      { label: "Nhật ký sự cố / lỗi", to: "/issues" },
    ],
  },

  // ================= DANH MỤC & SẢN PHẨM =================
  {
    label: "Danh mục & Sản phẩm",
    icon: Package,
    roles: [
      "quan_tri_vien",
      "quan_ly_kho",
      "nhan_vien_kho",
      "nhan_vien_mua_hang",
      "nhan_vien_ban_hang",
    ],
    children: [
      { label: "Danh mục", to: "/categories" },
      { label: "Màu sắc", to: "/attributes" },
      { label: "Kích cỡ", to: "/attributes" },
      { label: "Chất liệu", to: "/material" },
      { label: "Sản phẩm", to: "/products" },
      {
        label: "Biến thể SKU & Giá",
        to: "/sku-builder",
        roles: ["quan_tri_vien", "quan_ly_kho"],
      },
      {
        label: "Barcode",
        to: "/barcodes",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_kho"],
      },
    ],
  },

  // ================= MUA HÀNG & NHẬP KHO =================
  {
    label: "Mua hàng & Nhập kho",
    icon: ArrowDownToLine,
    roles: [
      "quan_tri_vien",
      "quan_ly_kho",
      "nhan_vien_mua_hang",
      "nhan_vien_kho",
    ],
    children: [
      {
        label: "Nhà cung cấp",
        to: "/supplier",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_mua_hang"],
      },
      {
        label: "Đơn mua hàng (PO)",
        to: "/purchase-orders",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_mua_hang"],
      },
      {
        label: "Phiếu nhập kho",
        to: "/goods-receipts",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_kho"],
      },
    ],
  },

  // ================= KHO & XUẤT KHO =================
  {
    label: "Kho & Xuất kho",
    icon: Warehouse,
    roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_kho"],
    children: [
      { label: "Kho", to: "/warehouse" },
      { label: "Phiếu xuất kho", to: "/goods-issues" },
      { label: "Danh sách lấy hàng", to: "/pick-lists" },
      { label: "Chuyển kho nội bộ", to: "/stock-transfers" },
      { label: "Kiểm kê", to: "/stock-takes" },
    ],
  },

  // ================= BÁN HÀNG & KHÁCH HÀNG =================
  {
    label: "Bán hàng",
    icon: ShoppingCart,
    roles: [
      "quan_tri_vien",
      "nhan_vien_ban_hang",
      "quan_ly_kho",
      "nhan_vien_kho",
    ],
    children: [
      {
        label: "Khách hàng",
        to: "/customers",
        roles: ["quan_tri_vien", "nhan_vien_ban_hang"],
      },
      {
        label: "Đơn bán hàng",
        to: "/orders",
        roles: ["quan_tri_vien", "nhan_vien_ban_hang"],
      },
    ],
  },

  // ================= BÁO CÁO & CẢNH BÁO =================
  {
    label: "Báo cáo & Cảnh báo",
    icon: BarChart3,
    roles: [
      "quan_tri_vien",
      "quan_ly_kho",
      "nhan_vien_kho",
      "nhan_vien_mua_hang",
      "nhan_vien_ban_hang",
    ],
    children: [
      {
        label: "Báo cáo tồn kho",
        to: "/reports/inventory",
        roles: [
          "quan_tri_vien",
          "quan_ly_kho",
          "nhan_vien_kho",
          "nhan_vien_mua_hang",
        ],
      },
      {
        label: "Báo cáo nhập – xuất",
        to: "/reports/import-export",
        roles: ["quan_tri_vien", "quan_ly_kho"],
      },
      {
        label: "Báo cáo doanh thu",
        to: "/reports/sales",
        roles: ["quan_tri_vien", "quan_ly_kho"],
      },
      {
        label: "Cảnh báo sắp hết hàng",
        to: "/warnings/low-stock",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_mua_hang"],
      },
      {
        label: "Thẻ kho",
        to: "/transactions",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_kho"],
      },
    ],
  },
];
