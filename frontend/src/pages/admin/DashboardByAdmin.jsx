import { useEffect, useState } from "react";
import { adminDashboardService } from "@/services/adminDashboardService";
import { adminService } from "@/services/adminService";
import { Link } from "react-router-dom";

export default function DashboardByAdmin() {
    const [data, setData] = useState(null);
    const [latestUsers, setLatestUsers] = useState([]);

    useEffect(() => {
        adminDashboardService.getDashboardByAdmin().then((res) => {
            setData(res.data.data);
        });
        adminService
            .getUserListByAdmin({
                page: 0,
                size: 3,
                sort: "ngayTao,desc",
            })
            .then((res) => {
                setLatestUsers(res.data.data.content);
            });
    }, []);

    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* Quick Stats */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Stat
                    label="User mới (hôm nay)"
                    value={data.newUsersToday}
                />
                <Stat
                    label="Tổng user"
                    value={data.totalUsers}
                />
                <Stat
                    label="Doanh thu ngày"
                    value={`${data.revenueToday.toLocaleString()}₫`}
                />
                <Stat
                    label="Đơn bán hôm nay"
                    value={data.totalOrdersToday}
                />
            </section>

            {/* Charts / Insights */}
            <section className="grid lg:grid-cols-3 gap-4">

                {/* Chart */}
                <div className="bg-white border rounded-xl p-5 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-900">
                                Doanh thu 7 ngày
                            </div>
                            <div className="text-xs text-gray-500">
                                don_ban_hang.ngay_dat_hang
                            </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-600">
                            Last 7 days
                        </div>
                    </div>

                    <div className="mt-4 h-48 w-full rounded-lg bg-gray-50 border flex items-end gap-3 p-4">
                        {data.revenueLast7Days.map((item) => {
                            const height =
                                item.value === 0
                                    ? "8%"
                                    : Math.min(item.value / 1_000_000, 100) + "%";

                            return (
                                <div
                                    key={item.date}
                                    className="w-8 bg-purple-400 rounded-t-md"
                                    style={{ height }}
                                    title={`${item.date}: ${item.value.toLocaleString()}₫`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Quick alerts – giữ UI, data để sau */}
                <div className="bg-white border rounded-xl p-5 shadow-sm">
                    <div className="text-sm font-semibold text-gray-900">
                        Cảnh báo nhanh
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        Gợi ý sau này lấy từ bảng canh_bao
                    </div>

                    <div className="mt-4 space-y-3">
                        <AlertBox
                            title="Tồn kho thấp"
                            subtitle={`${data.lowStockCount} cảnh báo đang chờ xử lý`}
                            color="red"
                        />

                        <AlertBox
                            title="Đơn chờ duyệt"
                            subtitle={`${data.pendingPurchaseOrders} đơn mua / ${data.pendingSaleOrders} đơn bán`}
                            color="yellow"
                        />

                        <AlertBox
                            title="User bị khóa"
                            subtitle={`Hiện có ${data.bannedUsers} user`}
                            color="gray"
                        />
                    </div>
                </div>
                <div className="bg-white border rounded-xl p-5 shadow-sm lg:col-span-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-900">
                                User mới tạo gần đây
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                nguoi_dung (id, ten_dang_nhap, vai_tro, ngay_tao)
                            </div>
                        </div>

                        <Link
                            to="/users"
                            className="text-sm text-purple-600 hover:underline font-medium"
                        >
                            Xem tất cả
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 border-b">
                                    <th className="py-2 pr-3 font-medium">Tên đăng nhập</th>
                                    <th className="py-2 pr-3 font-medium">Họ tên</th>
                                    <th className="py-2 pr-3 font-medium">Vai trò</th>
                                    <th className="py-2 pr-3 font-medium">Trạng thái</th>
                                    <th className="py-2 font-medium">Ngày tạo</th>
                                </tr>
                            </thead>

                            <tbody>
                                {latestUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-b-0 text-sm"
                                    >

                                        <td className="py-3 pr-3 font-medium text-gray-900">
                                            {user.tenDangNhap}
                                        </td>

                                        <td className="py-3 pr-3 text-gray-800">
                                            {user.hoTen}
                                        </td>

                                        <td className="py-3 pr-3">
                                            <span
                                                className={`
                  inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                  ${user.vaiTro === "nhan_vien_kho"
                                                        ? "bg-blue-50 text-blue-600"
                                                        : user.vaiTro === "quan_ly_kho"
                                                            ? "bg-purple-50 text-purple-600"
                                                            : "bg-orange-50 text-orange-600"
                                                    }
                `}
                                            >
                                                {user.vaiTro}
                                            </span>
                                        </td>

                                        <td className="py-3 pr-3">
                                            <span
                                                className={`
                  inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                  ${user.trangThai === 1
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-600"
                                                    }
                `}
                                            >
                                                {user.trangThai === 1 ? "Active" : "Banned"}
                                            </span>
                                        </td>

                                        <td className="py-3 text-gray-700">
                                            {new Date(user.ngayTao).toISOString().slice(0, 10)}
                                        </td>
                                    </tr>
                                ))}

                                {latestUsers.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-6 text-center text-sm text-gray-500"
                                        >
                                            Chưa có user mới
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </section>
        </div>
    );
}

/* ================= SUB COMPONENTS ================= */

function Stat({ label, value }) {
    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="mt-2 text-2xl font-bold text-gray-900">
                {value}
            </div>
        </div>
    );
}

function AlertBox({ title, subtitle, color }) {
    const colorMap = {
        red: "bg-red-50 border-red-200 text-red-700",
        yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
        gray: "bg-gray-50 border-gray-200 text-gray-800",
    };

    return (
        <div
            className={`p-3 rounded-lg border ${colorMap[color]}`}
        >
            <div className="text-sm font-semibold">
                {title}
            </div>
            <div className="text-xs mt-1">
                {subtitle}
            </div>
        </div>
    );
}
