// src/pages/attribute/SizeList.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Eye, Loader2, Ruler, ChevronDown, Filter, RefreshCcw,
    Check, AlertCircle, X,
} from "lucide-react";
import { toast } from "sonner";
import { sizeService } from "@/services/attributeService";

export default function SizeList() {
    const [sizes,        setSizes]        = useState([]);
    const [search,       setSearch]       = useState("");
    const [loading,      setLoading]      = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting,   setIsDeleting]   = useState(false);
    const [pageNumber,   setPageNumber]   = useState(0);
    const [pageSize,     setPageSize]     = useState(10);
    const navigate = useNavigate();

    // Hàm tải danh sách kích cỡ từ API
    const fetchSizes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await sizeService.filter({ 
                page: 0, 
                size: 1000, 
                filters: [], 
                sorts: [{ fieldName: "id", direction: "DESC" }] 
            });
            if (res.status === 200) {
                setSizes(res.data.content || []);
            }
        } catch {
            toast.error("Không thể tải danh sách kích cỡ");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSizes(); }, [fetchSizes]);

    // Hàm xử lý xác nhận xóa kích cỡ
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = await sizeService.delete(deleteTarget.id);
            if (res.status === 200) {
                toast.success(`Đã xóa kích cỡ "${deleteTarget.tenSize}"`);
                setSizes(prev => prev.filter(s => s.id !== deleteTarget.id));
                setDeleteTarget(null);
            }
        } catch {
            toast.error("Xóa thất bại");
        } finally {
            setIsDeleting(false);
        }
    };

    // Lọc và phân trang dữ liệu
    const filtered = useMemo(() => sizes.filter(item => {
        const matchSearch = !search.trim()
            || item.maSize?.toLowerCase().includes(search.toLowerCase())
            || item.tenSize?.toLowerCase().includes(search.toLowerCase())
            || item.loaiSize?.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
    }), [sizes, search]);

    const totalElements = filtered.length;
    const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
    const pageItems     = filtered.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

    return (
        <div className="space-y-6">
            {/* ── Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Tổng kích cỡ</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{sizes.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Ruler className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Filters ── */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Filter className="h-5 w-5 text-yellow-600" />
                        Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2 md:col-span-3">
                            <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Mã, tên size hoặc phân loại..."
                                    className="pl-9 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPageNumber(0); }}
                                />
                            </div>
                        </div>

                        {/* Reset */}
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => { setSearch(""); setPageNumber(0); }}
                                className="h-10 w-full flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            >
                                <RefreshCcw className="h-4 w-4" /> Đặt lại
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Add button ── */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => navigate("/attribute/size/new")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold shadow-md transition-all duration-150"
                    style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#ca8a04"}
                    onMouseLeave={e => e.currentTarget.style.background = "#eab308"}
                >
                    <Plus className="h-4 w-4" /> Thêm size mới
                </button>
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl bg-white shadow-md overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase w-14">STT</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Mã size</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Tên hiển thị</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Phân loại</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : pageItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                pageItems.map((item, i) => (
                                    <tr key={item.id} className="transition-colors duration-150 hover:bg-yellow-50/50">
                                        <td className="px-4 py-3.5 align-middle text-center text-slate-500 text-xs">
                                            {pageNumber * pageSize + i + 1}
                                        </td>
                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="font-bold text-yellow-600 tracking-wide font-mono">
                                                {item.maSize || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 align-middle font-semibold text-slate-900">
                                            {item.tenSize}
                                        </td>
                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 uppercase">
                                                {item.loaiSize || "—"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 align-middle">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => navigate(`/attribute/size/view/${item.id}`)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/attribute/size/${item.id}`)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-red-500 hover:bg-red-50 hover:border-red-200"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Pagination ── */}
            {totalElements > 0 && (
                <Card className="border-0 shadow-md bg-white">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="h-9 px-3 rounded-md border border-gray-200 bg-white text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                        >
                                            {pageSize} dòng <ChevronDown className="h-4 w-4 opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                        {[10, 20, 50].map(size => (
                                            <DropdownMenuItem
                                                key={size}
                                                onClick={() => { setPageSize(size); setPageNumber(0); }}
                                                className="cursor-pointer hover:bg-yellow-50"
                                            >
                                                {size} dòng
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="text-sm text-gray-600">
                                Hiển thị{' '}
                                <span className="font-semibold text-gray-900">{pageNumber * pageSize + 1}</span>
                                {' '}–{' '}
                                <span className="font-semibold text-gray-900">{Math.min((pageNumber + 1) * pageSize, totalElements)}</span>
                                {' '}trong tổng số{' '}
                                <span className="font-semibold text-yellow-600">{totalElements}</span> kết quả
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pageNumber === 0}
                                    onClick={() => setPageNumber(p => p - 1)}
                                    className="inline-flex h-8 items-center gap-1 px-3 rounded-md border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Trước
                                </button>

                                <div className="hidden sm:flex gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setPageNumber(idx)}
                                            className="h-8 w-8 rounded-md border text-sm font-medium transition-all"
                                            style={pageNumber === idx
                                                ? { background: "#eab308", color: "#fff", border: "1px solid #eab308" }
                                                : { background: "#fff", color: "#374151", borderColor: "#e5e7eb" }}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={pageNumber >= totalPages - 1}
                                    onClick={() => setPageNumber(p => p + 1)}
                                    className="inline-flex h-8 items-center gap-1 px-3 rounded-md border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors"
                                >
                                    Sau <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Delete confirm dialog ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                    />
                    <div
                        className="relative z-10 w-full max-w-sm rounded-2xl border-none shadow-2xl p-0 overflow-hidden"
                        style={{ background: "#faf7f0" }}
                    >
                        {/* Header */}
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Xác nhận xóa</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Hành động này không thể hoàn tác</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-4">
                            <p className="text-sm text-gray-700">
                                Bạn có chắc chắn muốn xóa kích cỡ{" "}
                                <span className="font-bold text-gray-900">"{deleteTarget.tenSize}"</span>?
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4" style={{ background: "#f5efe0", borderTop: "1px solid #ede8db" }}>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                                style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-all duration-150 disabled:opacity-50"
                                style={{ background: "#dc2626", color: "#ffffff", border: "none" }}
                            >
                                {isDeleting
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang xóa...</>
                                    : <><Trash2 className="h-4 w-4" /> Xóa</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
