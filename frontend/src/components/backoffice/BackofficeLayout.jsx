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
