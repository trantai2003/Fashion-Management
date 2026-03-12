import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Loader2, Search, RefreshCcw, Package, Plus,
    ChevronDown, ChevronLeft, ChevronRight, Check, Filter,
    CheckCircle2, XCircle, ClipboardList, Truck,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_MAP = {
    0: { label: "Nháp", className: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    1: { label: "Chờ duyệt", className: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    2: { label: "Chờ xuất hàng", className: "border-indigo-200 bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    3: { label: "Đang vận chuyển", className: "border-purple-200 bg-purple-50 text-purple-700", dot: "bg-purple-500" },
    4: { label: "Đã hủy", className: "border-red-200 bg-red-50 text-red-600", dot: "bg-red-500" },
    5: { label: "Hoàn tất", className: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-500" },
};

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    ...Object.entries(STATUS_MAP).map(([key, val]) => ({ value: key, label: val.label })),
];

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

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await phieuChuyenKhoService.filter(buildFilterPayload());
            setData(res?.content || []);
            setTotal(res?.totalElements || 0);
        } catch (error) {
            console.error("Lỗi lấy danh sách:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
    }, [filters.keyword, filters.tenKhoNhap, filters.trangThai, filters.page, filters.size]);

    const totalPages = Math.max(1, Math.ceil(total / filters.size));

    const handleReset = () => {
        setFilters({ keyword: "", tenKhoNhap: "", trangThai: "", page: 0, size: 10 });
    };

    const stats = useMemo(() => {
        return {
            nhap: data.filter((d) => d.trangThai === 0).length,
            dangVanChuyen: data.filter((d) => d.trangThai === 3).length,
            hoanTat: data.filter((d) => d.trangThai === 5).length,
            daHuy: data.filter((d) => d.trangThai === 4).length,
        };
    }, [data]);

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

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
                                className="px-3 py-2 text-sm text-white rounded-md bg-slate-900 border border-slate-900 hover:bg-white hover:text-slate-900"
                            >
                                + Tạo Phiếu Chuyển Kho
                            </Link>
                        </div>
                    </div>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đang vận chuyển</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.dangVanChuyen}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Truck className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Hoàn tất</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.hoanTat}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                            {[...Array(totalPages)].map((_, index) => {
                                // Chỉ hiển thị tối đa 3 trang đầu hoặc xử lý logic rút gọn nếu cần
                                if (index < 3 || index === totalPages - 1) {
                                    const active = filters.page === index;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setFilters((prev) => ({ ...prev, page: index }))}
                                            className={`px-3 py-1 text-sm border rounded ${active ? "bg-slate-900 text-white border-slate-900 hover:bg-white hover:text-slate-900" : "bg-white"}`}
                                        >
                                            <span className="truncate">
                                                {STATUS_OPTIONS.find((s) => s.value === filters.trangThai)?.label || "Tất cả trạng thái"}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                        {STATUS_OPTIONS.map((s) => (
                                            <DropdownMenuItem
                                                key={s.value}
                                                onClick={() => setFilters(p => ({ ...p, trangThai: s.value, page: 0 }))}
                                                className="flex items-center justify-between cursor-pointer hover:bg-purple-50"
                                            >
                                                {s.label}
                                                {filters.trangThai === s.value && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Đặt lại */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="flex items-center gap-2 w-full transition-all duration-300 hover:bg-black hover:text-white border-gray-300"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ══ ACTION BUTTONS ══════════════════════════════════════════════ */}
                <div className="flex items-center justify-end gap-3">
                    <Link to="/transfer-tickets/create">
                        <Button className="bg-black text-white hover:bg-white hover:text-black border border-black shadow-sm transition-all duration-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo Phiếu Chuyển Kho
                        </Button>
                    </Link>
                </div>

                {/* ══ TABLE / LOADING / EMPTY ══════════════════════════════════════ */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Đang tải danh sách phiếu chuyển kho...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <ClipboardList className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Không có dữ liệu phiếu chuyển</h3>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                Hiện tại chưa có dữ liệu phù hợp. Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Bảng dữ liệu ── */}
                        <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 w-14">STT</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Số phiếu</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Kho xuất</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Kho nhập</th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Ngày tạo</th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                onClick={() => navigate(`/transfer-tickets/${item.id}`)}
                                                className="cursor-pointer transition-colors duration-150 hover:bg-violet-50/50"
                                            >
                                                <td className="px-4 py-3.5 align-middle text-center w-14">
                                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                                        {filters.page * filters.size + index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 align-middle font-semibold text-violet-600">{item.soPhieuXuat}</td>
                                                <td className="px-4 py-3.5 align-middle">{item.kho?.tenKho}</td>
                                                <td className="px-4 py-3.5 align-middle">{item.khoChuyenDen?.tenKho}</td>
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className="text-sm text-slate-500">
                                                        {new Date(item.ngayTao).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_MAP[item.trangThai]?.className}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_MAP[item.trangThai]?.dot}`} />
                                                        {STATUS_MAP[item.trangThai]?.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Pagination ── */}
                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                                    {filters.size} dòng
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                                {[5, 10, 20, 50, 100].map(size => (
                                                    <DropdownMenuItem
                                                        key={size}
                                                        onClick={() => setFilters((p) => ({ ...p, size, page: 0 }))}
                                                        className="cursor-pointer"
                                                    >
                                                        {size} dòng
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        Hiển thị{" "}
                                        <span className="font-semibold text-gray-900">{filters.page * filters.size + 1}</span>
                                        {" "}-{" "}
                                        <span className="font-semibold text-gray-900">{Math.min((filters.page + 1) * filters.size, total)}</span>
                                        {" "}trong tổng số{" "}
                                        <span className="font-semibold text-purple-600">{total}</span> kết quả
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline" size="sm"
                                            onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                                            disabled={filters.page === 0}
                                            className="gap-1 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Trước
                                        </Button>

                                        <div className="hidden sm:flex gap-1">
                                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;
                                                if (totalPages <= 5) pageNum = idx;
                                                else if (filters.page < 3) pageNum = idx;
                                                else if (filters.page > totalPages - 4) pageNum = totalPages - 5 + idx;
                                                else pageNum = filters.page - 2 + idx;
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant={filters.page === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setFilters((p) => ({ ...p, page: pageNum }))}
                                                        className={
                                                            filters.page === pageNum
                                                                ? "bg-black text-white hover:bg-gray-800 shadow-sm"
                                                                : "border-gray-200"
                                                        }
                                                    >
                                                        {pageNum + 1}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline" size="sm"
                                            onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                                            disabled={filters.page + 1 >= totalPages}
                                            className="gap-1 disabled:opacity-50"
                                        >
                                            Sau <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}