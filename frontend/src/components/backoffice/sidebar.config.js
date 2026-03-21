import {
  LayoutDashboard,
  User,
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
      "quan_ly_kho",
      "nhan_vien_kho",
      "nhan_vien_mua_hang",
      "nhan_vien_ban_hang",
    ],
  },

  // ================= QUẢN TRỊ HỆ THỐNG =================
  {
    label: "Quản lý người dùng",
    icon: User,
    to: "/users",
    roles: ["quan_tri_vien"],
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
      { label: "Danh mục", to: "/danh-muc-quan-ao" },
      { label: "Thuộc tính", to: "/attributes" },
      { label: "Sản phẩm", to: "/products" },
      {
        label: "Biến thể SKU & Giá",
        to: "/sku-builder",
        roles: ["quan_tri_vien", "quan_ly_kho"],
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
        label: "Yêu cầu mua hàng",
        to: "/purchase-requests",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_mua_hang"],
      },
      {
        label: "Đơn mua hàng",
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
      {
        label: "Kho",
        to: "/warehouse",
        roles: ["quan_tri_vien", "quan_ly_kho"],
      },
      { label: "Phiếu xuất kho", to: "/goods-issues" },
      {
        label: "Chuyển kho nội bộ",
        to: "/transfer-tickets",
        roles: ["quan_tri_vien", "quan_ly_kho"]
      },
      { label: "Kiểm kê", to: "/stock-take" },
    ],
  },

  // ================= BÁN HÀNG & KHÁCH HÀNG =================
  {
    label: "Bán hàng",
    icon: ShoppingCart,
    roles: [
      "quan_tri_vien",
      "nhan_vien_ban_hang",
    ],
    children: [
      {
        label: "Khách hàng",
        to: "/customers",
        roles: ["quan_tri_vien", "nhan_vien_ban_hang"],
      },
      {
        label: "Đơn bán hàng",
        to: "/sales-orders",
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
        to: "/bao-cao/ton-kho",
        roles: [
          "quan_tri_vien",
          "quan_ly_kho",
          "nhan_vien_kho",
          "nhan_vien_mua_hang",
          "nhan_vien_ban_hang",
        ],
      },
      {
        label: "Báo cáo nhập – xuất",
        to: "/bao-cao/xuat-nhap",
        roles: ["quan_tri_vien", "quan_ly_kho"],
      },
      {
        label: "Cảnh báo sắp hết hàng",
        to: "/warnings/low-stock",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_mua_hang"],
      },
      {
        label: "Lịch sử giao dịch kho",
        to: "/lich-su-giao-dich-kho",
        roles: ["quan_tri_vien", "quan_ly_kho", "nhan_vien_kho"],
      },
    ],
  },
];
