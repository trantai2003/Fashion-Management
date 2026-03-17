// src/pages/lich-su-giao-dich-kho/LichSuGiaoDichKhoList.jsx
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search, Filter, RefreshCcw, ChevronDown, ChevronLeft, ChevronRight,
    Check, Loader2, History, ArrowDownToLine, ArrowUpFromLine,
    ArrowLeftRight, SlidersHorizontal, Warehouse, Eye,
    CalendarDays, User2, FileText, Hash, Package,
} from "lucide-react";
import { toast } from "sonner";
import { getLichSuGiaoDichKho, getChiTietLichSu } from "@/services/lichSuGiaoDichKhoService";

// ── Constants ─────────────────────────────────────────────────────────────
const LOAI_GIAO_DICH_CONFIG = {
    nhap_kho:   { label: "Nhập kho",   icon: ArrowDownToLine,   bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
    xuat_kho:   { label: "Xuất kho",   icon: ArrowUpFromLine,   bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     dot: "bg-red-500"     },
    chuyen_kho: { label: "Chuyển kho", icon: ArrowLeftRight,    bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    dot: "bg-blue-500"    },
    dieu_chinh: { label: "Điều chỉnh", icon: SlidersHorizontal, bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500"   },
};

const LOAI_FILTER_OPTIONS = [
    { value: "all",        label: "Tất cả loại giao dịch" },
    { value: "nhap_kho",   label: "Nhập kho"   },
    { value: "xuat_kho",   label: "Xuất kho"   },
    { value: "chuyen_kho", label: "Chuyển kho" },
    { value: "dieu_chinh", label: "Điều chỉnh" },
];

// ── Loại Badge ────────────────────────────────────────────────────────────
function LoaiBadge({ loai }) {
    const cfg = LOAI_GIAO_DICH_CONFIG[loai] ?? {
        label: loai, bg: "bg-slate-50", border: "border-slate-200",
        text: "text-slate-600", dot: "bg-slate-400",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border ${cfg.border} ${cfg.bg} px-2.5 py-1 text-xs font-semibold ${cfg.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

// ── Action button ─────────────────────────────────────────────────────────
function ActionBtn({ title, onClick, children }) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-violet-600 transition-all duration-150 hover:scale-110 hover:bg-violet-50 hover:border-violet-200 active:scale-95"
        >
            {children}
        </button>
    );
}

// ── Empty State ───────────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <History className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Không có giao dịch nào</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Chưa có dữ liệu phù hợp. Hãy thay đổi bộ lọc tìm kiếm.
            </p>
        </div>
    );
}

// ── Field helper ──────────────────────────────────────────────────────────
function Field({ icon: Icon, label, value, mono = false }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className={`text-[14px] font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}

function SoLuongCell({ label, value, color, prefix = "" }) {
    return (
        <div className="flex flex-col items-center py-4 bg-white">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{prefix}{value}</p>
        </div>
    );
}

// ── Detail Modal ──────────────────────────────────────────────────────────
function DetailModal({ open, onClose, item, loading }) {
    const formatDate = (val) =>
        val ? new Date(val).toLocaleString("vi-VN", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        }) : "—";

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-slate-800">
                        <History className="h-5 w-5 text-violet-600" />
                        Chi tiết giao dịch {item ? `#${item.id}` : ""}
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                        <span className="text-sm text-slate-500">Đang tải...</span>
                    </div>
                ) : item ? (
                    <div className="space-y-5 py-2">
                        {/* Header */}
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                {formatDate(item.ngayGiaoDich)}
                            </div>
                            <LoaiBadge loai={item.loaiGiaoDich} />
                        </div>

                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <Field icon={Package}      label="Sản phẩm"          value={item.tenSanPham} />
                            <Field icon={Hash}         label="SKU"               value={item.maSku} mono />
                            <Field icon={FileText}     label="Lô hàng"           value={item.maLo} mono />
                            <Field icon={Warehouse}    label="Kho"               value={item.tenKho} />
                            {item.tenKhoChuyenDen && (
                                <Field icon={ArrowLeftRight} label="Kho chuyển đến" value={item.tenKhoChuyenDen} />
                            )}
                            <Field icon={User2}        label="Người thực hiện"   value={item.nguoiDungTen} />
                            {item.loaiThamChieu && (
                                <Field icon={FileText} label="Loại tham chiếu"   value={item.loaiThamChieu} />
                            )}
                            {item.idThamChieu && (
                                <Field icon={Hash}     label="ID tham chiếu"     value={`#${item.idThamChieu}`} mono />
                            )}
                        </div>

                        {/* Số lượng */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="grid grid-cols-3 divide-x divide-slate-200">
                                <SoLuongCell label="Trước" value={item.soLuongTruoc ?? 0} color="text-slate-700" />
                                <SoLuongCell
                                    label="Thay đổi"
                                    value={item.soLuong ?? 0}
                                    color={Number(item.soLuong) > 0 ? "text-emerald-600" : Number(item.soLuong) < 0 ? "text-red-600" : "text-slate-700"}
                                    prefix={Number(item.soLuong) > 0 ? "+" : ""}
                                />
                                <SoLuongCell label="Sau" value={item.soLuongSau ?? 0} color="text-slate-700" />
                            </div>
                        </div>

                        {/* Ghi chú */}
                        {item.ghiChu && (
                            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                                <p className="font-semibold text-amber-600 mb-1">Ghi chú</p>
                                <p>{item.ghiChu}</p>
                            </div>
                        )}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function LichSuGiaoDichKhoList() {
    const [data,          setData]          = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [search,        setSearch]        = useState("");
    const [filterLoai,    setFilterLoai]    = useState("all");
    const [pageNumber,    setPageNumber]    = useState(0);
    const [pageSize,      setPageSize]      = useState(10);
    const [selectedId,    setSelectedId]    = useState(null);
    const [chiTiet,       setChiTiet]       = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────
    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const list = await getLichSuGiaoDichKho();
            setData(list);
            setPageNumber(0);
        } catch {
            toast.error("Không thể tải lịch sử giao dịch kho");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setPageNumber(0); }, [filterLoai, search]);

    // ── Filter ─────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        return data.filter((item) => {
            const q = search.toLowerCase().trim();
            const matchSearch = !q ||
                item.tenSanPham?.toLowerCase().includes(q) ||
                item.maSku?.toLowerCase().includes(q) ||
                item.maLo?.toLowerCase().includes(q) ||
                item.tenKho?.toLowerCase().includes(q) ||
                item.nguoiDungTen?.toLowerCase().includes(q);
            const matchLoai = filterLoai === "all" || item.loaiGiaoDich === filterLoai;
            return matchSearch && matchLoai;
        });
    }, [data, search, filterLoai]);

    // ── Stats ──────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        nhap_kho:   data.filter(i => i.loaiGiaoDich === "nhap_kho").length,
        xuat_kho:   data.filter(i => i.loaiGiaoDich === "xuat_kho").length,
        chuyen_kho: data.filter(i => i.loaiGiaoDich === "chuyen_kho").length,
        dieu_chinh: data.filter(i => i.loaiGiaoDich === "dieu_chinh").length,
    }), [data]);

    // ── Pagination ─────────────────────────────────────────────────────
    const totalElements = filtered.length;
    const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage      = Math.min(pageNumber, totalPages - 1);
    const pageItems     = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
    const handlePageChange = (p) => { if (p >= 0 && p < totalPages) setPageNumber(p); };
    const handleReset = () => { setSearch(""); setFilterLoai("all"); };

    // ── Detail ─────────────────────────────────────────────────────────
    const handleViewDetail = async (id) => {
        setSelectedId(id);
        setChiTiet(null);
        setLoadingDetail(true);
        try {
            const detail = await getChiTietLichSu(id);
            setChiTiet(detail);
        } catch {
            toast.error("Không thể tải chi tiết");
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseModal = () => { setSelectedId(null); setChiTiet(null); };

    const currentLoaiLabel = LOAI_FILTER_OPTIONS.find(o => o.value === filterLoai)?.label ?? "Tất cả";

    const formatDate = (val) =>
        val ? new Date(val).toLocaleString("vi-VN", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        }) : "—";

    return (
        <>
            <DetailModal open={!!selectedId} onClose={handleCloseModal} item={chiTiet} loading={loadingDetail} />

            <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
                <div className="space-y-6 w-full">

                    {/* ── Stats ── */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { key: "nhap_kho",   label: "Nhập kho",   iconBg: "bg-emerald-100", iconColor: "text-emerald-600", Icon: ArrowDownToLine   },
                            { key: "xuat_kho",   label: "Xuất kho",   iconBg: "bg-red-100",     iconColor: "text-red-500",     Icon: ArrowUpFromLine   },
                            { key: "chuyen_kho", label: "Chuyển kho", iconBg: "bg-blue-100",    iconColor: "text-blue-600",    Icon: ArrowLeftRight    },
                            { key: "dieu_chinh", label: "Điều chỉnh", iconBg: "bg-amber-100",   iconColor: "text-amber-600",   Icon: SlidersHorizontal },
                        ].map(({ key, label, iconBg, iconColor, Icon }) => (
                            <Card key={key} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">{label}</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats[key]}</p>
                                        </div>
                                        <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center`}>
                                            <Icon className={`h-6 w-6 ${iconColor}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    {/* ── Filter bar ── */}
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
                                            placeholder="Tìm theo sản phẩm, SKU, lô, kho, người thực hiện..."
                                            className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Loại filter */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">Loại giao dịch</Label>
                                    <DropdownMenu modal={false}>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal">
                                                <span className="truncate">{currentLoaiLabel}</span>
                                                <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[220px] bg-white border border-gray-100 shadow-xl z-50">
                                            {LOAI_FILTER_OPTIONS.map((opt) => (
                                                <DropdownMenuItem
                                                    key={opt.value}
                                                    onClick={() => setFilterLoai(opt.value)}
                                                    className="flex items-center gap-2 cursor-pointer hover:bg-purple-50"
                                                >
                                                    {opt.value !== "all" && (
                                                        <span className={`h-2 w-2 rounded-full ${LOAI_GIAO_DICH_CONFIG[opt.value]?.dot}`} />
                                                    )}
                                                    <span className="flex-1">{opt.label}</span>
                                                    {filterLoai === opt.value && <Check className="h-4 w-4" />}
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
                                        className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-purple-600 hover:text-white border-gray-300"
                                    >
                                        <RefreshCcw className="h-4 w-4" />
                                        Đặt lại
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Table ── */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-16 gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                                <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
                            </div>
                        ) : pageItems.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            {["STT", "Ngày giao dịch", "Loại", "Sản phẩm", "SKU", "Lô hàng", "Kho", "Số lượng", "Người thực hiện", ""].map((h, i) => (
                                                <th
                                                    key={i}
                                                    className={`h-12 px-4 font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap ${i === 9 ? "text-center" : "text-left"}`}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pageItems.map((item, index) => {
                                            const soLuong = Number(item.soLuong);
                                            const soLuongColor =
                                                soLuong > 0 ? "text-emerald-600" :
                                                soLuong < 0 ? "text-red-600" :
                                                "text-slate-700";
                                            const soLuongPrefix = soLuong > 0 ? "+" : "";

                                            return (
                                                <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                    <td className="px-4 py-3.5 align-middle text-slate-400 text-xs">
                                                        {safePage * pageSize + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle whitespace-nowrap text-slate-600">
                                                        {formatDate(item.ngayGiaoDich)}
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <LoaiBadge loai={item.loaiGiaoDich} />
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle max-w-[180px]">
                                                        <span className="font-semibold text-slate-900 line-clamp-2">
                                                            {item.tenSanPham || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                                                            {item.maSku || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-mono text-xs text-slate-600">
                                                            {item.maLo || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center gap-1.5">
                                                            <Warehouse className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-slate-700">{item.tenKho || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className={`font-bold text-base ${soLuongColor}`}>
                                                            {soLuongPrefix}{item.soLuong}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center gap-1.5">
                                                            <User2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="text-slate-700">{item.nguoiDungTen || "—"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-center">
                                                        <ActionBtn title="Xem chi tiết" onClick={() => handleViewDetail(item.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </ActionBtn>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    {totalElements > 0 && (
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

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
                                            {[10, 20, 50, 100].map((size) => (
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

                                <div className="text-sm text-gray-600">
                                    Hiển thị{" "}
                                    <span className="font-semibold text-gray-900">{safePage * pageSize + 1}</span>
                                    {" "}–{" "}
                                    <span className="font-semibold text-gray-900">
                                        {Math.min((safePage + 1) * pageSize, totalElements)}
                                    </span>
                                    {" "}trong tổng số{" "}
                                    <span className="font-semibold text-violet-600">{totalElements}</span> kết quả
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handlePageChange(safePage - 1)}
                                        disabled={safePage === 0}
                                        className="gap-1 disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Trước
                                    </Button>

                                    <div className="hidden sm:flex gap-1">
                                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                            let pageNum;
                                            if (totalPages <= 5)                pageNum = idx;
                                            else if (safePage < 3)              pageNum = idx;
                                            else if (safePage > totalPages - 4) pageNum = totalPages - 5 + idx;
                                            else                                pageNum = safePage - 2 + idx;
                                            return (
                                                <Button
                                                    key={idx}
                                                    variant={safePage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={safePage === pageNum
                                                        ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
                                                        : "border-gray-200"}
                                                >
                                                    {pageNum + 1}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline" size="sm"
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