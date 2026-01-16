import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
    const location = useLocation();

    // Map route → title (sau này mở rộng)
    const pageTitleMap = {
        "/admin/users": {
            title: "User List",
            subtitle: "Xem danh sách nhân viên / khách hàng",
        },
    };

    const pageMeta = pageTitleMap[location.pathname];

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader
                    title={pageMeta?.title}
                    subtitle={pageMeta?.subtitle}
                />

                {/* Content */}
                <main className="flex-1 overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

