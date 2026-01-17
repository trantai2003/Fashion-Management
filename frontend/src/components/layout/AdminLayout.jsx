import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
    const location = useLocation();
    const pathname = location.pathname;

    let pageMeta = null;

    if (pathname === "/admin/users") {
        pageMeta = {
            title: "User List",
            subtitle: "Xem danh sách nhân viên / khách hàng",
        };
    } else if (pathname.startsWith("/admin/users/")) {
        pageMeta = {
            title: "User Detail",
            subtitle: "Thông tin chi tiết",
        };
    }

    return (
        <AdminSidebar>
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
