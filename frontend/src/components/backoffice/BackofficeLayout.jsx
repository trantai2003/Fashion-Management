import { Outlet, useLocation, useParams } from "react-router-dom";
import BackofficeSidebar from "./BackofficeSidebar";
import BackofficeHeader from "./BackofficeHeader";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function BackofficeLayout() {
    const { pathname } = useLocation();

    const PAGE_META_CONFIG = [
        {
            key: "DASHBOARD",
            match: (path) => path === "/dashboard",
            title: "Admin Dashboard",
            subtitle: "Tổng quan hoạt động quản trị",
        },
        {
            key: "EDIT_USER_ROLE",
            match: (path) => path.endsWith("/edit-role"),
            title: "Edit User Role",
            subtitle: "Cập nhật quyền hạn cho người dùng dựa trên chức vụ",
        },
        {
            key: "RESET_PASSWORD",
            match: (path) => path.endsWith("/reset-password"),
            title: "Reset User Password",
            subtitle: "Admin đặt lại mật khẩu cho người dùng",
        },
        {
            key: "ADD_USER",
            match: (path) => path === "/users/add",
            title: "Add User",
            subtitle: "Thêm người dùng mới",
        },
        {
            key: "USER_DETAIL",
            match: (path) =>
                /^\/admin\/users\/\d+$/.test(path),
            title: "User Detail",
            subtitle: "Thông tin chi tiết",
        },
        {
            key: "USER_LIST",
            match: (path) => path === "/users",
            title: "User List",
            subtitle: "Xem danh sách nhân viên / khách hàng",
        },
        {
            key: "ATTRIBUTES",
            match: (path) => path === "/attributes",
            title: "Quản lý thuộc tính",
            subtitle: "Màu sắc & Kích cỡ",
        },
        {
            key: "MATERIALS",
            match: (path) => path === "/material",
            title: "Quản lý chất liệu",
            subtitle: "Chất liệu sản phẩm",
        },
        {
            key: "PRODUCTS",
            match: (path) => path === "/products",
            title: "Quản lý sản phẩm",
            subtitle: "Danh sách sản phẩm",
        },
        {
            key: "SUPPLIERS",
            match: (path) => path === "/supplier",
            title: "Quản lý nhà cung cấp",
            subtitle: "Danh sách nhà cung cấp",
        },
        {
            key: "WAREHOUSE",
            match: (path) => path === "/warehouse",
            title: "Quản lý kho",
            subtitle: "Quản lý thông tin vận hành các kho hàng",
        },
        {
            key: "GOODS_RECEIPTS",
            match: (path) => path === "/goods-receipts",
            title: "Quản lý phiếu nhập kho",
            subtitle: "Danh sách phiếu nhập kho",
        },
        {
            key: "GOODS_RECEIPTS_CREATE",
            match: (path) => path === "/goods-receipts/create",
            title: "Tạo phiếu nhập kho",
            subtitle: "Tạo mới phiếu nhập kho từ đơn mua hàng (PO)",
        },
        {
            key: "GOODS_RECEIPTS_DETAIL",
            match: (path) => /^\/goods-receipts\/\d+$/.test(path),
            title: "Chi tiết phiếu nhập kho",
            subtitle: "Xem chi tiết phiếu nhập kho",
        },
        {
            key: "LOT_INPUT",
            match: (path) => /^\/goods-receipts\/\d+\/lot-input\/\d+$/.test(path),
            title: "Khai báo lô",
            subtitle: "Khai báo thông tin lô cho sản phẩm nhập kho",
        },
        {
            key: "GOODS_ISSUES",
            match: (path) => path === "/goods-issues",
            title: "Quản lý phiếu xuất kho",
            subtitle: "Danh sách phiếu xuất kho",
        },
        {
            key: "GOODS_ISSUES_CREATE",
            match: (path) => path === "/goods-issues/create",
            title: "Tạo phiếu xuất kho",
            subtitle: "Tạo mới phiếu xuất kho từ đơn bán hàng (SO)",
        },
        {
            key: "GOODS_ISSUES_DETAIL",
            match: (path) => /^\/goods-issues\/\d+$/.test(path),
            title: "Chi tiết phiếu xuất kho",
            subtitle: "Xem chi tiết phiếu xuất kho",
        }
    ];

    const pageMeta = PAGE_META_CONFIG.find((item) =>
        item.match(pathname)
    );


    return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden">
        {/* SIDEBAR */}
        <BackofficeSidebar />

        {/* MAIN CONTENT */}
        <SidebarInset className="flex flex-col min-w-0 w-full">
          <Toaster position="top-center" richColors />

          <BackofficeHeader
            title={pageMeta?.title}
            subtitle={pageMeta?.subtitle}
          />

          <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
