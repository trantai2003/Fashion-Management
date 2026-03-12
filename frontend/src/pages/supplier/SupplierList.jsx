// src/pages/supplier/SupplierList.jsx
import { useState, useEffect, useCallback } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Eye, Loader2, Users, ChevronDown, MapPin, Phone, Mail, User2,
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
function EmptyState({ onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy nhà cung cấp</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Chưa có nhà cung cấp nào phù hợp. Hãy thêm mới hoặc thay đổi từ khoá tìm kiếm.
            </p>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierList() {
    const [suppliers, setSuppliers]       = useState([]);
    const [search, setSearch]             = useState("");
    const [loading, setLoading]           = useState(true);
    const [deleteId, setDeleteId]         = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting]     = useState(false);
    const [currentPage, setCurrentPage]   = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const navigate = useNavigate();

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllSupplier(search);
            setSuppliers(data);
            setCurrentPage(1);
        } catch {
            toast.error("Không thể tải danh sách nhà cung cấp");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await deleteSupplier(deleteId);
            toast.success("Xóa nhà cung cấp thành công");
            setDeleteId(null);
            setDeleteTarget(null);
            fetchSuppliers();
        } catch {
            toast.error("Xóa thất bại");
        } finally {
            setIsDeleting(false);
        }
    };

    // Pagination
    const totalPages    = Math.ceil(suppliers.length / itemsPerPage);
    const indexOfFirst  = (currentPage - 1) * itemsPerPage;
    const currentItems  = suppliers.slice(indexOfFirst, indexOfFirst + itemsPerPage);

    return (
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

                {/* ── Search bar ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Tìm theo mã hoặc tên nhà cung cấp..."
                            className="pl-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                            <span className="text-sm text-gray-600">Đang tải danh sách...</span>
                        </div>
                    ) : currentItems.length === 0 ? (
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
                                    {currentItems.map((item, index) => (
                                        <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                                            {/* STT */}
                                            <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">
                                                {indexOfFirst + index + 1}
                                            </td>

                                            {/* Mã NCC */}
                                            <td className="px-4 py-3.5 align-middle">
                                                <span className="font-bold text-violet-600 tracking-wide">
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
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <span>
                                                                <ActionBtn
                                                                    title="Xóa"
                                                                    onClick={() => { setDeleteId(item.id); setDeleteTarget(item); }}
                                                                    color="red"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </ActionBtn>
                                                            </span>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-xl border-0">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-red-600 text-lg font-bold">
                                                                    Xác nhận xóa nhà cung cấp
                                                                </DialogTitle>
                                                                <DialogDescription className="text-slate-600 mt-2 leading-relaxed">
                                                                    Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
                                                                    <span className="font-semibold text-slate-900">"{item.tenNhaCungCap}"</span>?{" "}
                                                                    <span className="text-red-500 font-medium">Hành động này không thể hoàn tác.</span>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="gap-3 mt-2">
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-gray-300 text-slate-600"
                                                                    onClick={() => { setDeleteId(null); setDeleteTarget(null); }}
                                                                >
                                                                    Hủy
                                                                </Button>
                                                                <Button
                                                                    className="bg-red-600 hover:bg-red-700 text-white min-w-[80px]"
                                                                    onClick={handleDelete}
                                                                    disabled={isDeleting}
                                                                >
                                                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xóa"}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
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
                {suppliers.length > 0 && (
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Page size */}
                            <div className="flex items-center gap-2">
                                <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                            {itemsPerPage} dòng
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                        {[10, 20, 30, 50].map(size => (
                                            <DropdownMenuItem
                                                key={size}
                                                onClick={() => { setItemsPerPage(size); setCurrentPage(1); }}
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
                                <span className="font-semibold text-gray-900">{indexOfFirst + 1}</span>
                                {" "}-{" "}
                                <span className="font-semibold text-gray-900">
                                    {Math.min(indexOfFirst + itemsPerPage, suppliers.length)}
                                </span>
                                {" "}trong tổng số{" "}
                                <span className="font-semibold text-violet-600">{suppliers.length}</span> kết quả
                            </div>

                            {/* Nav buttons */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 1}
                                    className="gap-1 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Trước
                                </Button>
                                <div className="hidden sm:flex gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        let pageNum;
                                        if (totalPages <= 5) pageNum = idx + 1;
                                        else if (currentPage < 4) pageNum = idx + 1;
                                        else if (currentPage > totalPages - 3) pageNum = totalPages - 4 + idx;
                                        else pageNum = currentPage - 2 + idx;

                                        return (
                                            <Button
                                                key={idx}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={currentPage === pageNum
                                                    ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                                                    : "border-gray-200"
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage === totalPages}
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
    );
}