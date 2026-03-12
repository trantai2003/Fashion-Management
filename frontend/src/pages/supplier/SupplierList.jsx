// src/pages/supplier/SupplierList.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Filter, RefreshCcw, Check, AlertTriangle,
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

// ── Confirm Delete Modal (tách hoàn toàn khỏi table row) ─────────────────
function ConfirmDeleteModal({ target, isDeleting, onConfirm, onCancel }) {
    if (!target) return null;
    return (
        // Backdrop
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={!isDeleting ? onCancel : undefined}
            />
            {/* Dialog */}
            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-red-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="font-bold text-red-700 text-base leading-snug">Xác nhận xóa nhà cung cấp</p>
                        <p className="text-xs text-red-500 mt-0.5">Hành động này không thể hoàn tác</p>
                    </div>
                </div>

                {/* Body */}
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

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-gray-300 text-slate-600 hover:bg-slate-100"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[100px] shadow-sm"
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

    // Delete state — tách riêng, không dùng Dialog lồng trong table row
    const [deleteTarget, setDeleteTarget] = useState(null); // object nhà cung cấp cần xóa
    const [isDeleting,   setIsDeleting]   = useState(false);

    // Pagination
    const [pageNumber,  setPageNumber]  = useState(0);
    const [pageSize,    setPageSize]    = useState(5); // mặc định 5 dòng

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

    // Reset page khi filter đổi
    useEffect(() => { setPageNumber(0); }, [filterStatus]);

    // ── Delete ─────────────────────────────────────────────────────────
    const handleDeleteClick = (item) => {
        setDeleteTarget(item);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteSupplier(deleteTarget.id);
            toast.success(`Đã xóa nhà cung cấp "${deleteTarget.tenNhaCungCap}" thành công`);
            setDeleteTarget(null);
            // Reload và điều chỉnh trang nếu xóa hết item trang cuối
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
            {/* ── Confirm delete modal (portal-like, ngoài layout chính) ── */}
            <ConfirmDeleteModal
                target={deleteTarget}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
                <div className="space-y-6 w-full">

                    {/* ── Page header ── */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Nhà cung cấp</h2>
                            <p className="text-sm text-gray-600 mt-1">Quản lý thông tin các nhà cung cấp</p>
                        </div>
                        <Button
                            onClick={() => navigate("/supplier/new")}
                            className="bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-all duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm nhà cung cấp
                        </Button>
                    </div>

                    {/* ── Filter bar ── */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-4 w-4 text-violet-600" />
                            <span className="text-sm font-semibold text-slate-700">Bộ lọc tìm kiếm</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-gray-700 font-medium text-xs">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm theo mã, tên, người liên hệ..."
                                        className="pl-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status filter */}
                            <div className="space-y-1.5">
                                <Label className="text-gray-700 font-medium text-xs">Trạng thái</Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal">
                                            <span className="truncate text-sm">{currentFilterLabel}</span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                        {STATUS_FILTER_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setFilterStatus(opt.value)}
                                                className="flex items-center justify-between cursor-pointer hover:bg-violet-50"
                                            >
                                                {opt.label}
                                                {filterStatus === opt.value && <Check className="h-4 w-4 text-violet-600" />}
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
                                    className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-violet-600 hover:text-white border-gray-300"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                                <span className="text-sm text-gray-600">Đang tải danh sách...</span>
                            </div>
                        ) : pageItems.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            {["STT", "Mã NCC", "Tên nhà cung cấp", "Người liên hệ", "SĐT", "Email", "Trạng thái", "Thao tác"].map((h, i) => (
                                                <th
                                                    key={h}
                                                    className={`h-12 px-4 font-semibold text-slate-600 tracking-wide text-xs uppercase ${i === 7 ? "text-center" : "text-left"}`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pageItems.map((item, index) => (
                                            <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                {/* STT */}
                                                <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">
                                                    {safePage * pageSize + index + 1}
                                                </td>

                                                {/* Mã NCC */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <span className="font-bold text-violet-600 tracking-wide font-mono">
                                                        {item.maNhaCungCap || "—"}
                                                    </span>
                                                </td>

                                                {/* Tên */}
                                                <td className="px-4 py-3.5 align-middle max-w-[200px]">
                                                    <span className="font-semibold text-slate-900 leading-snug">
                                                        {item.tenNhaCungCap}
                                                    </span>
                                                </td>

                                                {/* Người liên hệ */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="flex items-center gap-1.5">
                                                        <User2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        <span className="text-slate-700">{item.nguoiLienHe || "—"}</span>
                                                    </div>
                                                </td>

                                                {/* SĐT */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        <span className="text-slate-700">{item.soDienThoai || "—"}</span>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        <span className="text-slate-600 text-xs">{item.email || "—"}</span>
                                                    </div>
                                                </td>

                                                {/* Trạng thái */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <StatusBadge status={item.trangThai} />
                                                </td>

                                                {/* Thao tác */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <ActionBtn title="Xem chi tiết" onClick={() => navigate(`/supplier/view/${item.id}`)} color="violet">
                                                            <Eye className="h-4 w-4" />
                                                        </ActionBtn>
                                                        <ActionBtn title="Chỉnh sửa" onClick={() => navigate(`/supplier/${item.id}`)} color="blue">
                                                            <Edit className="h-4 w-4" />
                                                        </ActionBtn>
                                                        <ActionBtn
                                                            title="Xóa"
                                                            onClick={() => handleDeleteClick(item)}
                                                            color="red"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </ActionBtn>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    {totalElements > 0 && (
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-4">
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
                                            {[5, 10, 20, 50].map((size) => (
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
                                    <span className="font-semibold text-violet-600">{totalElements}</span> kết quả
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
                                                            ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
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
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}