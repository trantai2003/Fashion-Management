import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
    const location = useLocation();

    const pageTitleMap = {
        "/admin/users": {
            title: "User List",
            subtitle: "Xem danh sách nhân viên / khách hàng",
        },
    };

    const pageMeta = pageTitleMap[location.pathname];

    return (
        <div className="h-screen flex bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <AdminHeader
                    title={pageMeta?.title}
                    subtitle={pageMeta?.subtitle}
                />

                {/* CONTENT – CHỈ CHỖ NÀY ĐƯỢC SCROLL */}
                <main className="flex-1 overflow-y-auto min-h-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
