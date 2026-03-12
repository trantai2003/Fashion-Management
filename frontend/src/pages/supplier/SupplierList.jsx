// src/pages/supplier/SupplierList.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Eye, Loader2, Users, ChevronDown, Phone, Mail, User2,
    Filter, RefreshCcw, Check, AlertTriangle, CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getAllSupplier, deleteSupplier } from "@/services/supplierService";

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    return status === 1 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Hoạt động
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Ngừng hoạt động
        </span>
    );
}

// ── Action button ─────────────────────────────────────────────────────────
function ActionBtn({ title, onClick, color, children }) {
    const colors = {
        violet: "text-violet-600 hover:bg-violet-50 hover:border-violet-200",
        blue:   "text-blue-600 hover:bg-blue-50 hover:border-blue-200",
        red:    "text-red-500 hover:bg-red-50 hover:border-red-200",
    };
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 ${colors[color]}`}
        >
            {children}
        </button>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy nhà cung cấp</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Chưa có nhà cung cấp nào phù hợp. Hãy thêm mới hoặc thay đổi bộ lọc tìm kiếm.
            </p>
        </div>
    );
}

// ── Confirm Delete Modal ─────────────────────────────────────────────────
function ConfirmDeleteModal({ target, isDeleting, onConfirm, onCancel }) {
    if (!target) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={!isDeleting ? onCancel : undefined}
            />
            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-red-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="font-bold text-red-700 text-base leading-snug">Xác nhận xóa nhà cung cấp</p>
                        <p className="text-xs text-red-500 mt-0.5">Hành động này không thể hoàn tác</p>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
                        <span className="font-semibold text-slate-900">"{target.tenNhaCungCap}"</span>{" "}
                        (mã: <span className="font-mono font-semibold text-violet-600">{target.maNhaCungCap}</span>)?
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                        Toàn bộ thông tin liên quan đến nhà cung cấp này sẽ bị xóa vĩnh viễn.
                    </p>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-black text-slate-600 hover:bg-black hover:text-white transition-all duration-200"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="button"
                        className="bg-black hover:bg-white hover:text-black border border-black text-white min-w-[100px] shadow-sm transition-all duration-200"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</>
                        ) : (
                            <><Trash2 className="mr-2 h-4 w-4" />Xóa</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Filter options ────────────────────────────────────────────────────────
const STATUS_FILTER_OPTIONS = [
    { value: "all",      label: "Tất cả trạng thái" },
    { value: "active",   label: "Hoạt động" },
    { value: "inactive", label: "Ngừng hoạt động" },
];

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierList() {
    const [suppliers,    setSuppliers]    = useState([]);
    const [search,       setSearch]       = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading,      setLoading]      = useState(true);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting,   setIsDeleting]   = useState(false);

    const [pageNumber,  setPageNumber]  = useState(0);
    const [pageSize,    setPageSize]    = useState(10);

    const navigate = useNavigate();

    // ── Fetch ──────────────────────────────────────────────────────────
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllSupplier(search);
            setSuppliers(data);
            setPageNumber(0);
        } catch {
            toast.error("Không thể tải danh sách nhà cung cấp");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);
    useEffect(() => { setPageNumber(0); }, [filterStatus]);

    // ── Delete ─────────────────────────────────────────────────────────
    const handleDeleteClick = (item) => { setDeleteTarget(item); };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteSupplier(deleteTarget.id);
            toast.success(`Đã xóa nhà cung cấp "${deleteTarget.tenNhaCungCap}" thành công`);
            setDeleteTarget(null);
            const updated = suppliers.filter(s => s.id !== deleteTarget.id);
            setSuppliers(updated);
            const newTotal  = updated.filter(s =>
                filterStatus === "all"      ? true :
                filterStatus === "active"   ? s.trangThai === 1 :
                s.trangThai === 0
            ).length;
            const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));
            if (pageNumber >= newTotalPages) setPageNumber(Math.max(0, newTotalPages - 1));
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa thất bại, vui lòng thử lại");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) setDeleteTarget(null);
    };

    // ── Client-side filter ─────────────────────────────────────────────
    const filtered = useMemo(() => {
        return suppliers.filter((item) => {
            const matchSearch =
                !search.trim() ||
                item.maNhaCungCap?.toLowerCase().includes(search.toLowerCase()) ||
                item.tenNhaCungCap?.toLowerCase().includes(search.toLowerCase()) ||
                item.nguoiLienHe?.toLowerCase().includes(search.toLowerCase());

            const matchStatus =
                filterStatus === "all"      ||
                (filterStatus === "active"   && item.trangThai === 1) ||
                (filterStatus === "inactive" && item.trangThai === 0);

            return matchSearch && matchStatus;
        });
    }, [suppliers, search, filterStatus]);

    // ── Stats ──────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total:    suppliers.length,
        active:   suppliers.filter(s => s.trangThai === 1).length,
        inactive: suppliers.filter(s => s.trangThai === 0).length,
    }), [suppliers]);

    // ── Pagination ─────────────────────────────────────────────────────
    const totalElements = filtered.length;
    const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage      = Math.min(pageNumber, totalPages - 1);
    const pageItems     = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

    const handlePageChange = (p) => {
        if (p >= 0 && p < totalPages) setPageNumber(p);
    };

    const handleReset = () => {
        setSearch("");
        setFilterStatus("all");
    };

    const currentFilterLabel = STATUS_FILTER_OPTIONS.find(o => o.value === filterStatus)?.label ?? "Tất cả trạng thái";

    return (
        <>
            <ConfirmDeleteModal
                target={deleteTarget}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
                <div className="space-y-6 w-full">

                    {/* ══ STATS ════════════════════════════════════════════════════════ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tổng nhà cung cấp</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-gray-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ngừng hoạt động</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <XCircle className="h-6 w-6 text-red-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ══ BỘ LỌC TÌM KIẾM ═════════════════════════════════════════════ */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                <Filter className="h-5 w-5 text-purple-600" />
                                Bộ lọc tìm kiếm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Tìm theo mã, tên, người liên hệ..."
                                            className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Status filter */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Trạng thái</Label>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal">
                                                <span className="truncate">{currentFilterLabel}</span>
                                                <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                            {STATUS_FILTER_OPTIONS.map((opt) => (
                                                <DropdownMenuItem
                                                    key={opt.value}
                                                    onClick={() => setFilterStatus(opt.value)}
                                                    className="flex items-center justify-between cursor-pointer hover:bg-purple-50"
                                                >
                                                    {opt.label}
                                                    {filterStatus === opt.value && <Check className="h-4 w-4" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Reset */}
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-black hover:text-white border-gray-300"
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        Đặt lại
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ══ ACTION BUTTONS (dưới bộ lọc) ════════════════════════════════ */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            onClick={() => navigate("/supplier/new")}
                            className="bg-black text-white hover:bg-white hover:text-black border border-black shadow-sm transition-all duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm nhà cung cấp
                        </Button>
                    </div>

                    {/* ══ TABLE / LOADING / EMPTY ══════════════════════════════════════ */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            <span className="ml-3 text-gray-600">Đang tải danh sách nhà cung cấp...</span>
                        </div>
                    ) : pageItems.length === 0 ? (
                        <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                            <EmptyState />
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
                                                <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Mã NCC</th>
                                                <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Tên nhà cung cấp</th>
                                                <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Người liên hệ</th>
                                                <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">SĐT</th>
                                                <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Email</th>
                                                <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                                                <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {pageItems.map((item, index) => (
                                                <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                    <td className="px-4 py-3.5 align-middle text-center w-14">
                                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                                            {safePage * pageSize + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-bold text-violet-600 tracking-wide font-mono">
                                                            {item.maNhaCungCap || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle max-w-[200px]">
                                                        <span className="font-semibold text-slate-900 leading-snug">
                                                            {item.tenNhaCungCap}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center gap-1.5">
                                                            <User2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-slate-700">{item.nguoiLienHe || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-slate-700">{item.soDienThoai || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-slate-600 text-xs">{item.email || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-center">
                                                        <StatusBadge status={item.trangThai} />
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <ActionBtn title="Xem chi tiết" onClick={() => navigate(`/supplier/view/${item.id}`)} color="violet">
                                                                <Eye className="h-4 w-4" />
                                                            </ActionBtn>
                                                            <ActionBtn title="Chỉnh sửa" onClick={() => navigate(`/supplier/${item.id}`)} color="blue">
                                                                <Edit className="h-4 w-4" />
                                                            </ActionBtn>
                                                            <ActionBtn title="Xóa" onClick={() => handleDeleteClick(item)} color="red">
                                                                <Trash2 className="h-4 w-4" />
                                                            </ActionBtn>
                                                        </div>
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
                                        {/* Page size */}
                                        <div className="flex items-center gap-2">
                                            <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                                        {pageSize} dòng
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                                    {[5, 10, 20, 50, 100].map((size) => (
                                                        <DropdownMenuItem
                                                            key={size}
                                                            onClick={() => { setPageSize(size); setPageNumber(0); }}
                                                            className="cursor-pointer"
                                                        >
                                                            {size} dòng
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Page info */}
                                        <div className="text-sm text-gray-600">
                                            Hiển thị{" "}
                                            <span className="font-semibold text-gray-900">{safePage * pageSize + 1}</span>
                                            {" "}-{" "}
                                            <span className="font-semibold text-gray-900">
                                                {Math.min((safePage + 1) * pageSize, totalElements)}
                                            </span>
                                            {" "}trong tổng số{" "}
                                            <span className="font-semibold text-purple-600">{totalElements}</span> kết quả
                                        </div>

                                        {/* Nav */}
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(safePage - 1)}
                                                disabled={safePage === 0}
                                                className="gap-1 disabled:opacity-50"
                                            >
                                                <ChevronLeft className="h-4 w-4" /> Trước
                                            </Button>

                                            <div className="hidden sm:flex gap-1">
                                                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                    let pageNum;
                                                    if (totalPages <= 5)               pageNum = idx;
                                                    else if (safePage < 3)             pageNum = idx;
                                                    else if (safePage > totalPages - 4) pageNum = totalPages - 5 + idx;
                                                    else                               pageNum = safePage - 2 + idx;

                                                    return (
                                                        <Button
                                                            key={idx}
                                                            variant={safePage === pageNum ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={
                                                                safePage === pageNum
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
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(safePage + 1)}
                                                disabled={safePage >= totalPages - 1}
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
        </>
    );
}