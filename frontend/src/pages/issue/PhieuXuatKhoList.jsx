import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";

const STATUS_MAP = {
    0: {
        label: "Nháp",
        className: "bg-amber-50 text-amber-700",
    },
    1: {
        label: "Chờ duyệt",
        className: "bg-blue-50 text-blue-700",
    },
    2: {
        label: "Đã duyệt",
        className: "bg-indigo-50 text-indigo-700",
    },
    3: {
        label: "Đã xuất",
        className: "bg-green-50 text-green-700",
    },
    4: {
        label: "Đã hủy",
        className: "bg-red-50 text-red-700",
    },
    5: {
        label: "Đã xuất",
        className: "bg-green-50 text-green-700",
    }
};

export default function PhieuXuatKhoList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        keyword: "",
        tenKho: "",
        trangThai: "",
        ngayXuat: "",
        page: 0,
        size: 10,
    });

    function buildFilterPayload() {
        const filterList = [];

        if (filters.keyword?.trim()) {
            const searchKeyword = filters.keyword.trim();
            ["soPhieuXuat", "donBanHang.soDonHang"].forEach((field) => {
                filterList.push({
                    fieldName: field,
                    operation: "LIKE",
                    value: searchKeyword,
                    logicType: "OR",
                });
            });
        }

        if (filters.trangThai !== "") {
            filterList.push({
                fieldName: "trangThai",
                operation: "EQUALS",
                value: Number(filters.trangThai),
            });
        }

        if (filters.tenKho !== "") {
            filterList.push({
                fieldName: "kho.tenKho",
                operation: "LIKE",
                value: filters.tenKho.trim(),
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
            const res = await phieuXuatKhoService.filter(buildFilterPayload());
            let list = res.content || [];
            const filteredList = list.filter((item) => {
                if (item.loaiXuat === "chuyen_kho" || item.loaiXuat === "CHUYEN_KHO") {
                    return item.trangThai >= 2;
                }
                return true;
            });
            let finalData = filteredList;
            if (filters.ngayXuat) {
                finalData = filteredList.filter((item) => {
                    const dateValue = item.ngayXuat || item.ngayTao;
                    if (!dateValue) return false;
                    const date = new Date(dateValue);
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}` === filters.ngayXuat;
                });
            }

            setData(finalData);
            setTotal(res.totalElements || 0);
        } catch (e) {
            console.error("Fetch list error:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [filters.keyword, filters.tenKho, filters.trangThai, filters.ngayXuat, filters.page, filters.size]);

    const totalPages = Math.ceil(total / filters.size);

    const handleReset = () => {
        setFilters({
            keyword: "",
            tenKho: "",
            trangThai: "",
            ngayXuat: "",
            page: 0,
            size: 10,
        });
    };

    return (
        <main className="flex-1">

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                {/* Filters */}
                <section className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="grid md:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-gray-600">
                                Số phiếu / SO
                            </label>
                            <input
                                value={filters.keyword}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        keyword: e.target.value,
                                    }))
                                }
                                placeholder="Nhập số phiếu hoặc SO"
                                className="mt-1 w-full h-11 px-3 rounded-md border
                           focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-600">Kho xuất</label>
                            <input
                                value={filters.tenKho}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        tenKho: e.target.value,
                                    }))
                                }
                                placeholder="Nhập tên kho"
                                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-600">
                                Trạng thái
                            </label>
                            <select
                                value={filters.trangThai}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        trangThai: e.target.value,
                                    }))
                                }
                                className="mt-1 w-full h-11 px-3 rounded-md border bg-white"
                            >
                                <option value="">Tất cả</option>
                                <option value="0">Nháp</option>
                                <option value="1">Chờ duyệt</option>
                                <option value="2">Đã duyệt</option>
                                <option value="3">Đã xuất</option>
                                <option value="4">Đã hủy</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-600">
                                Ngày xuất
                            </label>
                            <input
                                type="date"
                                value={filters.ngayXuat}
                                onChange={(e) =>
                                    setFilters((p) => ({
                                        ...p,
                                        ngayXuat: e.target.value,
                                    }))
                                }
                                className="mt-1 w-full h-11 px-3 rounded-md border
                           focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                        <button variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="px-3 py-2 text-sm transition-all duration-300 hover:bg-black hover:text-white border border-gray-300 rounded-md"
                        >
                            Reset Bộ Lọc
                        </button>
                    </div>
                </section>

                {/* Table */}
                <section className="bg-white border rounded-xl overflow-hidden">

                    <div className="p-4 flex justify-between">
                        <span className="text-sm font-semibold">
                            Danh sách phiếu xuất
                        </span>
                        <div className="flex gap-3 items-center">
                            <span className="text-xs text-gray-500">
                                Tổng: {total}
                            </span>
                            <Link
                                to="/goods-issues/create"
                                className="px-3 py-2 text-sm text-white rounded-md bg-purple-600"
                            >
                                + Tạo Phiếu Xuất Kho
                            </Link>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Số phiếu</th>
                                <th className="px-4 py-3 text-left">Đơn bán hàng</th>
                                <th className="px-4 py-3 text-left">Kho xuất</th>
                                <th className="px-4 py-3 text-left">Ngày tạo</th>
                                <th className="px-4 py-3 text-left">Ngày xuất</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="p-6 text-center"
                                    >
                                        Loading...
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => navigate(`/goods-issues/${item.id}`)}
                                        className="border-t cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-semibold text-purple-600">
                                            {item.soPhieuXuat}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.donBanHang?.soDonHang || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.kho?.tenKho || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(
                                                item.ngayTao
                                            ).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.ngayXuat
                                                ? new Date(item.ngayXuat).toLocaleDateString("vi-VN")
                                                : "Chưa xuất kho"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${STATUS_MAP[item.trangThai]
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
                    <div className="p-4 border-t flex-none bg-white">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Đang hiển thị {data.length} / {total}
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
                                        Trước
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