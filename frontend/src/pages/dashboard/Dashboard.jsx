import DashboardAdmin from "./admin/DashboardAdmin";
import DashboardWarehouseManager from "./warehouse-manager/DashboardWarehouseManager";
import DashboardWarehouseStaff from "./warehouse-staff/DashboardWarehouseStaff";
import DashboardSalesStaff from "./sales-staff/DashboardSalesStaff";
import DashboardPurchaseStaff from "./purchase-staff/DashboardPurchaseStaff";

export default function Dashboard() {

    const role = localStorage.getItem("role");

    const DASHBOARD_MAP = {
        quan_tri_vien: DashboardAdmin,
        quan_ly_kho: DashboardWarehouseManager,
        nhan_vien_kho: DashboardWarehouseStaff,
        nhan_vien_ban_hang: DashboardSalesStaff,
        nhan_vien_mua_hang: DashboardPurchaseStaff
    };

    const DashboardComponent = DASHBOARD_MAP[role];

    if (!DashboardComponent) {
        return <div className="lux-sync p-6 min-h-screen">Không có quyền truy cập</div>;
    }

    return <DashboardComponent />;
}