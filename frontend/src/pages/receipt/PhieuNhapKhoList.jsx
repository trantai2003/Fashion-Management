import { useEffect, useState } from "react";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { Link, useNavigate } from "react-router-dom";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ Duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đã Duyệt", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        soPhieuNhap: "",
        nhaCungCap: "",
        trangThai: "",
        ngayNhap: "",
        page: 0,
        size: 10,
    });

    function buildFilterPayload(filters) {
        const filterList = [];

        if (filters.soPhieuNhap.trim()) {
            filterList.push({
                fieldName: "soPhieuNhap",
                operation: "LIKE",
                value: filters.soPhieuNhap.trim(),
            });
        }

        if (filters.nhaCungCap.trim()) {
            filterList.push({
                fieldName: "nhaCungCap.tenNhaCungCap",
                operation: "LIKE",
                value: filters.nhaCungCap.trim(),
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
            sorts: [{ fieldName: "id", direction: "DESC" }],
        };
    }

    async function fetchData() {
        setLoading(true);
        try {
            const payload = buildFilterPayload(filters);
            const res = await phieuNhapKhoService.filter(payload);
            let list = res.content || [];
            if (filters.ngayNhap) {
                const selectedDate = filters.ngayNhap;
                list = list.filter((item) => {
                    if (!item.ngayNhap) return false;
                    const itemDate = new Date(item.ngayNhap).toISOString().slice(0, 10);
                    return itemDate === selectedDate;
                });
            }

            setData(list);
            setTotal(res.totalElements || 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [
        filters.page,
        filters.size,
        filters.soPhieuNhap,
        filters.nhaCungCap,
        filters.trangThai,
        filters.ngayNhap,
    ]);

    const totalPages = Math.ceil(total / filters.size);

    const handleReset = () => {
        setFilters({
            soPhieuNhap: "",
            nhaCungCap: "",
            trangThai: "",
            ngayNhap: "",
            page: 0,
            size: 10,
        });
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex flex-col min-h-0">
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">

                    {/* FILTER SECTION */}
                    <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="grid md:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">Số phiếu nhập</label>
                                <input
                                    value={filters.soPhieuNhap}
                                    onChange={(e) => setFilters((p) => ({ ...p, soPhieuNhap: e.target.value, page: 0 }))}
                                    placeholder="Số phiếu nhập"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">Nhà cung cấp</label>
                                <input
                                    value={filters.nhaCungCap}
                                    onChange={(e) => setFilters((p) => ({ ...p, nhaCungCap: e.target.value, page: 0 }))}
                                    placeholder="Nhà cung cấp"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">Trạng thái</label>
                                <select
                                    value={filters.trangThai}
                                    onChange={(e) => setFilters((p) => ({ ...p, trangThai: e.target.value, page: 0 }))}
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="0">Nháp</option>
                                    <option value="1">Chờ Duyệt</option>
                                    <option value="2">Đã Duyệt</option>
                                    <option value="3">Hoàn Thành</option>
                                    <option value="4">Đã Huỷ</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">Ngày nhập</label>
                                <input
                                    type="date"
                                    value={filters.ngayNhap}
                                    onChange={(e) => setFilters((p) => ({ ...p, ngayNhap: e.target.value, page: 0 }))}
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                onClick={handleReset}
                                className="px-3 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-white border border-gray-300 rounded-md"
                            >
                                Reset Bộ Lọc
                            </button>
                        </div>
                    </section>

                    {/* TABLE SECTION */}
                    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 flex justify-between items-center border-b">
                            <span className="text-sm font-semibold">Danh sách phiếu nhập</span>
                            <div className="flex gap-3 items-center">
                                <span className="text-xs text-gray-500">Tổng: {total}</span>
                                <Link
                                    to="/goods-receipts/create"
                                    className="px-3 py-2 text-sm text-white rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
                                >
                                    + Tạo Phiếu Nhập
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 text-[11px] font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Số phiếu</th>
                                        <th className="px-4 py-3">Đơn mua (PO)</th>
                                        <th className="px-4 py-3">Nhà cung cấp</th>
                                        <th className="px-4 py-3">Kho</th>
                                        <th className="px-4 py-3">Ngày nhập</th>
                                        <th className="px-4 py-3">Trạng thái</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td>
                                        </tr>
                                    ) : data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-10 text-center text-gray-400">Không tìm thấy dữ liệu</td>
                                        </tr>
                                    ) : (
                                        data.map((item) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => navigate(`/goods-receipts/${item.id}`)}
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 font-semibold text-purple-600">
                                                    {item.soPhieuNhap}
                                                </td>
                                                <td className="px-4 py-4">{item.soDonMua}</td>
                                                <td className="px-4 py-4">{item.tenNhaCungCap}</td>
                                                <td className="px-4 py-4">{item.tenKho}</td>
                                                <td className="px-4 py-4">
                                                    {new Date(item.ngayNhap).toLocaleDateString("vi-VN")}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2.5 py-1 text-[11px] rounded-full border ${STATUS_MAP[item.trangThai]?.className}`}>
                                                        {STATUS_MAP[item.trangThai]?.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION SECTION */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <span className="text-xs text-gray-500 order-2 sm:order-1">
                                    Đang hiển thị {data.length} / {total} kết quả
                                </span>

                                <div className="flex items-center gap-4 order-1 sm:order-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">Dòng mỗi trang:</span>
                                        <select
                                            value={filters.size}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, size: Number(e.target.value), page: 0 }))}
                                            className="h-8 w-16 px-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        >
                                            {[10, 20, 30, 40, 50].map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            disabled={filters.page === 0}
                                            onClick={(e) => { e.stopPropagation(); setFilters((p) => ({ ...p, page: p.page - 1 })); }}
                                            className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(totalPages)].map((_, idx) => {
                                                // Chỉ hiển thị tối đa 5 trang để tránh bị tràn
                                                if (totalPages > 5 && Math.abs(idx - filters.page) > 2) return null;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => { e.stopPropagation(); setFilters((prev) => ({ ...prev, page: idx })); }}
                                                        className={`w-7 h-7 flex items-center justify-center text-xs border rounded transition-colors ${filters.page === idx ? "bg-purple-600 text-white border-purple-600" : "bg-white hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            disabled={filters.page + 1 >= totalPages}
                                            onClick={(e) => { e.stopPropagation(); setFilters((p) => ({ ...p, page: p.page + 1 })); }}
                                            className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}