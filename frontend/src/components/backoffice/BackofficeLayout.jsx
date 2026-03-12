import { Outlet, useLocation, useParams } from "react-router-dom";
import BackofficeSidebar from "./BackofficeSidebar";
import BackofficeHeader from "./BackofficeHeader";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import "@/styles/print.css";
import { sub } from "date-fns";

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
            title: "Chi tiết người dùng",
            subtitle: "Thông tin chi tiết",
        },
        {
            key: "USER_LIST",
            match: (path) => path === "/users",
            title: "Danh sách người dùng",
        },
        {
            key: "ATTRIBUTES",
            match: (path) => path === "/attributes",
            title: "Quản lý thuộc tính",
            subtitle: "Màu sắc/ Kích cỡ/ Chất liệu",
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
        },
        {
            key: "TRANSFER_TICKETS",
            match: (path) => path === "/transfer-tickets",
            title: "Quản lý phiếu chuyển kho nội bộ",
            subtitle: "Danh sách phiếu chuyển kho nội bộ",
        },
        {
            key: "PICK_LOT",
            match: (path) => /^\/goods-issues\/\d+\/pick-lot\/\d+$/.test(path),
            title: "Chọn lô hàng",
            subtitle: "Chọn lô hàng để xuất kho",
        },
        {
            key: "DANH_MUC_QUAN_AO",
            match: (path) => path === "/danh-muc-quan-ao",
            title: "Quản lý danh mục quần áo",
            subtitle: "Xem và quản lý cấu trúc danh mục quần áo",
        },
        {
            key: "CHI_TIET_SAN_PHAM",
            match: (path) => /^\/products\/\d+$/.test(path),
            title: "Chi tiết sản phẩm",
            subtitle: "Xem thông tin chi tiết về sản phẩm",
        },
        {
            key: "CREATE_TRANSFER_TICKET",
            match: (path) => path === "/transfer-tickets/create",
            title: "Tạo phiếu chuyển kho nội bộ",
            subtitle: "Tạo mới phiếu chuyển kho nội bộ",
        },
        {
            key: "TRANSFER_TICKET_DETAIL",
            match: (path) => /^\/transfer-tickets\/\d+$/.test(path),
            title: "Chi tiết phiếu chuyển kho nội bộ",
            subtitle: "Xem chi tiết phiếu chuyển kho nội bộ",
        },
        {
            key: "SALES_ORDERS",
            match: (path) => path === "/sales-orders",
            title: "Quản lý đơn bán hàng",
            subtitle: "Danh sách đơn bán hàng",
        },
        {
            key: "SALES_ORDER_DETAIL",
            match: (path) => /^\/sales-orders\/\d+$/.test(path),
            title: "Chi tiết đơn bán hàng",
            subtitle: "Xem chi tiết đơn bán hàng",
        },
        {
            key: "CREATE_SALES_ORDER",
            match: (path) => path === "/sales-orders/create",
            title: "Tạo đơn bán hàng",
            subtitle: "Tạo mới đơn bán hàng",
        },
        {
            key: "BAO_CAO_DOANH_THU",
            match: (path) => path === "/bao-cao/doanh-thu",
            title: "Báo cáo doanh thu",
            subtitle: "Xem báo cáo doanh thu theo thời gian",
        },
        {
            key: "BAO_CAO_KHACH_HANG",
            match: (path) => path === "/bao-cao/khach-hang",
            title: "Báo cáo khách hàng",
            subtitle: "Xem báo cáo về khách hàng theo thời gian",
        },
        {
            key: "BAO_CAO_NHAP_XUAT",
            match: (path) => path === "/bao-cao/xuat-nhap",
            title: "Báo cáo nhập xuất",
            subtitle: "Xem báo cáo về nhập xuất hàng hóa theo thời gian",
        },
        {
            key: "PHIEU_NHAP_KHO_PRINT",
            match: (path) => /^\/goods-receipts\/\d+\/print$/.test(path),
            title: "In phiếu nhập kho",
            subtitle: "Xem bản in phiếu nhập kho",
        },
        {
            key: "PHIEU_XUAT_KHO_PRINT",
            match: (path) => /^\/goods-issues\/\d+\/print$/.test(path),
            title: "In phiếu xuất kho",
            subtitle: "Xem bản in phiếu xuất kho",
        },
        {
            key: "STOCK_TAKE",
            match: (path) => path === "/stock-take",
            title: "Quản lý kiểm kê",
            subtitle: "Xem và quản lý các lần kiểm kê tồn kho",

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
