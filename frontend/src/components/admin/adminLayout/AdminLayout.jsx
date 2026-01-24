import { Outlet, useLocation, useParams } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout() {
    const { pathname } = useLocation();

    const PAGE_META_CONFIG = [
        {
            key: "DASHBOARD",
            match: (path) => path === "/admin/dashboard",
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
            match: (path) => path === "/admin/users/add",
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
            match: (path) => path === "/admin/users",
            title: "User List",
            subtitle: "Xem danh sách nhân viên / khách hàng",
        },
    ];

    const pageMeta = PAGE_META_CONFIG.find((item) =>
        item.match(pathname)
    );


    return (
        <AdminSidebar>
            <Toaster position="top-center" richColors />
            <div className="flex flex-col w-full min-h-0 h-full">
                <div className="shrink-0">
                    <AdminHeader
                        title={pageMeta?.title}
                        subtitle={pageMeta?.subtitle}
                    />
                </div>

                <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-gray-50">
                    <Outlet />
                </main>
            </div>
        </AdminSidebar>
    );
}
