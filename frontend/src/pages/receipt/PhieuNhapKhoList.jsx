import { useEffect, useState } from "react";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { Link, useNavigate } from "react-router-dom";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đã duyệt", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Đã nhập kho", className: "bg-green-50 text-green-700" },
    4: { label: "Đã hủy", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        keyword: "", // Gộp Số phiếu và Số đơn mua (PO)
        nhaCungCap: "",
        trangThai: "",
        ngayNhap: "",
        page: 0,
        size: 10,
    });

    function buildFilterPayload() {
        const filterList = [];

        // Tìm kiếm keyword theo Số phiếu hoặc Số đơn mua (Logic OR giống PhieuXuat)
        if (filters.keyword?.trim()) {
            const searchKeyword = filters.keyword.trim();
            ["soPhieuNhap", "donMuaHang.soDonMua"].forEach((field) => {
                filterList.push({
                    fieldName: field,
                    operation: "LIKE",
                    value: searchKeyword,
                    logicType: "OR",
                });
            });
        }

        if (filters.nhaCungCap?.trim()) {
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
            const payload = buildFilterPayload();
            const res = await phieuNhapKhoService.filter(payload);
            let list = res.content || [];

            if (filters.ngayNhap) {
                list = list.filter((item) => {
                    if (!item.ngayNhap) return false;
                    const date = new Date(item.ngayNhap);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const itemDateLocal = `${year}-${month}-${day}`;
                    return itemDateLocal === filters.ngayNhap;
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
    }, [filters.keyword, filters.nhaCungCap, filters.trangThai, filters.ngayNhap, filters.page, filters.size]);

    const totalPages = Math.ceil(total / filters.size);

    const handleReset = () => {
        setFilters({
            keyword: "",
            nhaCungCap: "",
            trangThai: "",
            ngayNhap: "",
            page: 0,
            size: 10,
        });
    };

    return (
        <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

                {/* FILTERS SECTION */}
                <section className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="grid md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-gray-600">Số phiếu / PO</label>
                            <input
                                value={filters.keyword}
                                onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value, page: 0 }))}
                                placeholder="Nhập số phiếu hoặc PO"
                                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600">Nhà cung cấp</label>
                            <input
                                value={filters.nhaCungCap}
                                onChange={(e) => setFilters((p) => ({ ...p, nhaCungCap: e.target.value, page: 0 }))}
                                placeholder="Tên nhà cung cấp"
                                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600">Trạng thái</label>
                            <select
                                value={filters.trangThai}
                                onChange={(e) => setFilters((p) => ({ ...p, trangThai: e.target.value, page: 0 }))}
                                className="mt-1 w-full h-11 px-3 rounded-md border bg-white outline-none"
                            >
                                <option value="">Tất cả</option>
                                <option value="0">Nháp</option>
                                <option value="3">Đã nhập kho</option>
                                <option value="4">Đã hủy</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-600">Ngày nhập</label>
                            <input
                                type="date"
                                value={filters.ngayNhap}
                                onChange={(e) => setFilters((p) => ({ ...p, ngayNhap: e.target.value, page: 0 }))}
                                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleReset}
                            className="px-3 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-white border border-gray-300 rounded-md"
                        >
                            Reset Bộ Lọc
                        </button>
                    </div>
                </section>

                {/* TABLE SECTION */}
                <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b">
                        <span className="text-sm font-semibold">Danh sách phiếu nhập</span>
                        <div className="flex gap-3 items-center">
                            <span className="text-xs text-gray-500">Tổng: {total}</span>
                            <Link
                                to="/goods-receipts/create"
                                className="px-3 py-2 text-sm text-white rounded-md bg-purple-600 hover:bg-purple-700 transition-colors"
                            >
                                + Tạo Phiếu Nhập Kho
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Số phiếu</th>
                                    <th className="px-4 py-3">Đơn mua (PO)</th>
                                    <th className="px-4 py-3">Nhà cung cấp</th>
                                    <th className="px-4 py-3">Kho</th>
                                    <th className="px-4 py-3">Ngày tạo</th>
                                    <th className="px-4 py-3">Ngày nhập</th>
                                    <th className="px-4 py-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
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
                                            <td className="px-4 py-4 font-semibold text-purple-600">{item.soPhieuNhap}</td>
                                            <td className="px-4 py-4 text-gray-600">{item.soDonMua || "-"}</td>
                                            <td className="px-4 py-4">{item.tenNhaCungCap}</td>
                                            <td className="px-4 py-4">{item.tenKho}</td>
                                            <td className="px-4 py-4">
                                                {new Date(item.ngayTao).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="px-4 py-4">
                                                {item.ngayNhap
                                                    ? new Date(item.ngayNhap).toLocaleDateString("vi-VN")
                                                    : "Chưa nhập kho"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs rounded ${STATUS_MAP[item.trangThai]?.className}`}>
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
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Đang hiển thị {data.length} / {total}
                            </span>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Rows:</span>
                                    <select
                                        value={filters.size}
                                        onChange={(e) => setFilters((p) => ({ ...p, size: Number(e.target.value), page: 0 }))}
                                        className="h-8 w-16 px-1 text-xs border rounded-md outline-none"
                                    >
                                        {[10, 20, 30, 40, 50].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={filters.page === 0}
                                        onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Trước
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, idx) => {
                                            // Logic hiển thị phân trang có rút gọn (giống PhieuXuat)
                                            if (totalPages > 5 && idx > 2 && idx < totalPages - 1 && Math.abs(idx - filters.page) > 1) {
                                                if (idx === 3) return <span key={idx} className="px-1 text-gray-400">...</span>;
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setFilters((p) => ({ ...p, page: idx }))}
                                                    className={`px-3 py-1 text-sm border rounded transition-colors ${filters.page === idx ? "bg-purple-600 text-white border-purple-600" : "bg-white hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        disabled={filters.page + 1 >= totalPages}
                                        onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
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
    );
}