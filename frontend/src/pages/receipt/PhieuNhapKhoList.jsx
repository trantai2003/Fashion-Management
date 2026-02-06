import { useEffect, useState } from "react";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { Link } from "react-router-dom";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
    2: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoList() {
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
            sorts: [{ fieldName: "ngayNhap", direction: "DESC" }],
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

                    const itemDate = new Date(item.ngayNhap)
                        .toISOString()
                        .slice(0, 10); // yyyy-MM-dd

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
        <div className="h-screen w-full bg-gray-50 flex flex-col min-h-0">
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">

                    {/* FILTER */}
                    <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="grid md:grid-cols-4 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">
                                    Số phiếu nhập
                                </label>
                                <input
                                    value={filters.soPhieuNhap}
                                    onChange={(e) =>
                                        setFilters((p) => ({ ...p, soPhieuNhap: e.target.value }))
                                    }
                                    placeholder="Số phiếu nhập"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300
                                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">
                                    Nhà cung cấp
                                </label>
                                <input
                                    value={filters.nhaCungCap}
                                    onChange={(e) =>
                                        setFilters((p) => ({ ...p, nhaCungCap: e.target.value }))
                                    }
                                    placeholder="Nhà cung cấp"
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300
                                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">
                                    Trạng thái
                                </label>
                                <select
                                    value={filters.trangThai}
                                    onChange={(e) =>
                                        setFilters((p) => ({ ...p, trangThai: e.target.value }))
                                    }
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300 bg-white
                                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="0">Nháp</option>
                                    <option value="1">Hoàn thành</option>
                                    <option value="2">Đã huỷ</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[13px] text-gray-600 block leading-none">
                                    Ngày nhập
                                </label>
                                <input
                                    type="date"
                                    value={filters.ngayNhap}
                                    onChange={(e) =>
                                        setFilters((p) => ({ ...p, ngayNhap: e.target.value, page: 0 }))
                                    }
                                    className="mt-1 w-full h-11 px-3 rounded-md border border-gray-300
                                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex justify-end gap-2">
                            <button variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="px-3 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-white border border-gray-300 rounded-md"
                            >
                                Reset
                            </button>
                        </div>
                    </section>

                    {/* TABLE */}
                    <section className="bg-white border border-gray-200 rounded-xl shadow-sm h-full min-h-0">
                        <div className="p-4 flex justify-between">
                            <span className="text-sm font-semibold">
                                Danh sách phiếu nhập
                            </span>
                            <div className="flex gap-3 items-center">
                                <span className="text-xs text-gray-500">
                                    Tổng: {total}
                                </span>
                                <Link
                                    to="/goods-receipts/create"
                                    className="px-3 py-2 text-sm text-white rounded-md bg-purple-600"
                                >
                                    + Create Receipt
                                </Link>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Số phiếu</th>
                                    <th className="px-4 py-3 text-left">Đơn mua</th>
                                    <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                                    <th className="px-4 py-3 text-left">Kho</th>
                                    <th className="px-4 py-3 text-left">Ngày nhập</th>
                                    <th className="px-4 py-3 text-left">Trạng thái</th>
                                    <th className="text-right py-3 px-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-6 text-center">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="px-4 py-3 font-semibold">
                                                {item.soPhieuNhap}
                                            </td>
                                            <td className="px-4 py-3">{item.soDonMua}</td>
                                            <td className="px-4 py-3">{item.tenNhaCungCap}</td>
                                            <td className="px-4 py-3">{item.tenKho}</td>
                                            <td className="px-4 py-3">
                                                {new Date(item.ngayNhap).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded ${STATUS_MAP[item.trangThai].className}`}>
                                                    {STATUS_MAP[item.trangThai].label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    to={`/nghiep-vu/phieu-nhap-kho/${item.id}`}
                                                    className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* PAGINATION */}
                        <div className="p-4 border-t flex-none bg-white">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Showing {data.length} / {total}
                                </span>

                                <div className="flex items-center gap-4">
                                    {/* Rows */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Rows:</span>

                                        <select
                                            value={filters.size}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    size: Number(e.target.value),
                                                    page: 0,
                                                }))
                                            }
                                            className="h-8 w-20 px-2 text-xs border rounded-md"
                                        >
                                            {[10, 20, 30, 40, 50].map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Pagination */}
                                    <div className="flex items-center gap-2">
                                        {/* Prev */}
                                        <button
                                            disabled={filters.page === 0}
                                            onClick={() =>
                                                setFilters((p) => ({ ...p, page: p.page - 1 }))
                                            }
                                            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                        >
                                            Prev
                                        </button>

                                        {/* Pages */}
                                        {[1, 2, 3].map((p) => {
                                            if (p > totalPages) return null;
                                            const active = filters.page + 1 === p;

                                            return (
                                                <button
                                                    key={p}
                                                    onClick={() =>
                                                        setFilters((prev) => ({ ...prev, page: p - 1 }))
                                                    }
                                                    className={`px-3 py-1 text-sm border rounded ${active
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-white"
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}

                                        {totalPages > 4 && (
                                            <span className="px-2 text-gray-500">...</span>
                                        )}

                                        {totalPages > 3 && (
                                            <button
                                                onClick={() =>
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        page: totalPages - 1,
                                                    }))
                                                }
                                                className={`px-3 py-1 text-sm border rounded ${filters.page + 1 === totalPages
                                                    ? "bg-purple-600 text-white"
                                                    : "bg-white"
                                                    }`}
                                            >
                                                {totalPages}
                                            </button>
                                        )}

                                        {/* Next */}
                                        <button
                                            disabled={filters.page + 1 >= totalPages}
                                            onClick={() =>
                                                setFilters((p) => ({ ...p, page: p.page + 1 }))
                                            }
                                            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                                        >
                                            Next
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
