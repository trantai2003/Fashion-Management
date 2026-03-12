import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Chờ xuất hàng", className: "bg-indigo-50 text-indigo-700" }, //đối với phiếu xuất thì là đã duyệt
    3: { label: "Đang vận chuyển", className: "bg-purple-50 text-purple-700" }, //đối với phiếu xuất thì là đã xuất
    4: { label: "Đã hủy", className: "bg-red-50 text-red-700" },
    5: { label: "Hoàn tất", className: "bg-green-50 text-green-700" },
};

export default function PhieuChuyenKhoList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        keyword: "",
        tenKhoNhap: "",
        trangThai: "",
        page: 0,
        size: 10,
    });

    // Thêm dòng này để tính tổng số trang
    const totalPages = Math.ceil(total / filters.size);

    function buildFilterPayload() {
        const filterList = [];
        if (filters.keyword?.trim()) {
            filterList.push({
                fieldName: "soPhieuXuat",
                operation: "LIKE",
                value: filters.keyword.trim(),
            });
        }

        if (filters.tenKhoNhap?.trim()) {
            filterList.push({
                fieldName: "khoChuyenDen.tenKho",
                operation: "LIKE",
                value: filters.tenKhoNhap.trim(),
            });
        }

        if (filters.trangThai !== "") {
            filterList.push({
                fieldName: "trangThai",
                operation: "EQUALS",
                value: Number(filters.trangThai),
            });
        }

        return {
            page: filters.page,
            size: filters.size,
            filters: filterList,
            sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
        };
    }

    async function fetchData() {
        setLoading(true);
        try {
            const res = await phieuChuyenKhoService.filter(buildFilterPayload());
            // res.data thường chứa { content: [], totalElements: X } tùy cấu trúc API của bạn
            setData(res?.content || []);
            setTotal(res?.totalElements || 0);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [filters.keyword, filters.tenKhoNhap, filters.trangThai, filters.page, filters.size]);

    const handleReset = () => {
        setFilters({ keyword: "", tenKhoNhap: "", trangThai: "", page: 0, size: 10 });
    };

    return (
        <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                {/* Bộ lọc */}
                <section className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="grid md:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs text-gray-600">Số phiếu</label>
                            <input
                                value={filters.keyword}
                                onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value }))}
                                placeholder="Nhập số phiếu..."
                                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600">Kho nhập (Đích)</label>
                            <input
                                value={filters.tenKhoNhap}
                                onChange={(e) => setFilters(p => ({ ...p, tenKhoNhap: e.target.value }))}
                                placeholder="Tên kho nhận hàng"
                                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600">Trạng thái</label>
                            <select
                                value={filters.trangThai}
                                onChange={(e) => setFilters(p => ({ ...p, trangThai: e.target.value }))}
                                className="mt-1 w-full h-11 px-3 rounded-md border bg-white"
                            >
                                <option value="">Tất cả</option>
                                {Object.entries(STATUS_MAP).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button onClick={handleReset} className="px-3 py-2 text-sm border rounded-md hover:bg-gray-100 transition-all">
                            Reset Bộ Lọc
                        </button>
                    </div>
                </section>

                {/* Bảng dữ liệu */}
                <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 flex justify-between items-center bg-gray-50/50">
                        <span className="font-semibold text-gray-700">Danh sách phiếu chuyển kho</span>
                        <div className="flex gap-3 items-center">
                            <span className="text-xs text-gray-500">
                                Tổng: {total}
                            </span>
                            <Link
                                to="/transfer-tickets/create"
                                className="px-3 py-2 text-sm text-white rounded-md bg-purple-600"
                            >
                                + Tạo Phiếu Chuyển Kho
                            </Link>
                        </div>
                    </div>

                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Số phiếu</th>
                                <th className="px-4 py-3">Kho xuất</th>
                                <th className="px-4 py-3">Kho nhập</th>
                                <th className="px-4 py-3">Ngày tạo</th>
                                <th className="px-4 py-3">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-400">Không có dữ liệu phiếu chuyển.</td></tr>
                            ) : (
                                data.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => navigate(`/transfer-tickets/${item.id}`)}
                                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-medium text-purple-600">{item.soPhieuXuat}</td>
                                        <td className="px-4 py-3">{item.kho?.tenKho}</td>
                                        <td className="px-4 py-3">{item.khoChuyenDen?.tenKho}</td>
                                        <td className="px-4 py-3">{new Date(item.ngayTao).toLocaleDateString("vi-VN")}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded ${STATUS_MAP[item.trangThai]
                                                    ?.className
                                                    }`}
                                            >
                                                {
                                                    STATUS_MAP[item.trangThai]
                                                        ?.label
                                                }
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="p-4 border-t flex items-center justify-between bg-white">
                        <span className="text-xs text-gray-500">
                            Đang hiển thị {data.length} / {total}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={filters.page === 0}
                                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                            >
                                Trước
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                // Chỉ hiển thị tối đa 3 trang đầu hoặc xử lý logic rút gọn nếu cần
                                if (index < 3 || index === totalPages - 1) {
                                    const active = filters.page === index;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setFilters((prev) => ({ ...prev, page: index }))}
                                            className={`px-3 py-1 text-sm border rounded ${active ? "bg-purple-600 text-white" : "bg-white"}`}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                disabled={filters.page + 1 >= totalPages}
                                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}