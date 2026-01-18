import { Outlet, useLocation, useParams} from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout() {
    const location = useLocation();
    const pathname = location.pathname;
    const { id } = useParams();
    let pageMeta = null;

    if (pathname === "/admin/users") {
        pageMeta = {
            title: "User List",
            subtitle: "Xem danh sách nhân viên / khách hàng",
        };
    } else if (id) {
        pageMeta = {
            title: "User Detail",
            subtitle: "Thông tin chi tiết",
        };
    } else if (pathname.startsWith("/admin/users/add")) {
        pageMeta = {
            title: "Add User",
            subtitle: "Thêm người dùng mới",
        };
    }

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
