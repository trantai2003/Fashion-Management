// src/pages/attributes/ColorSizeManagement.jsx
import { useState, useEffect } from 'react';
import {
    Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight,
    Palette, Ruler, Loader2, AlertTriangle, Search, Filter, RefreshCcw, Check, ChevronDown,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { mauSacService, sizeService } from "@/services/attributeService";
import { toast } from "sonner";

// ── Shared helpers ────────────────────────────────────────────────────────
function ActionBtn({ title, onClick, color, children }) {
    const colors = {
        violet: "text-violet-600 hover:bg-violet-50 hover:border-violet-200",
        blue:   "text-blue-600   hover:bg-blue-50   hover:border-blue-200",
        red:    "text-red-500    hover:bg-red-50    hover:border-red-200",
    };
    return (
        <button type="button" title={title} onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 ${colors[color]}`}>
            {children}
        </button>
    );
}

function EmptyState({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Không có dữ liệu</h3>
            <p className="mt-2 text-sm text-slate-500">Chưa có {label} nào. Hãy thêm mới.</p>
        </div>
    );
}

function ConfirmDeleteModal({ target, label, isDeleting, onConfirm, onCancel }) {
    if (!target) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isDeleting ? onCancel : undefined} />
            <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-red-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="font-bold text-red-700 text-base">Xác nhận xóa</p>
                        <p className="text-xs text-red-500 mt-0.5">Hành động này không thể hoàn tác</p>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Bạn có chắc chắn muốn xóa {label}{" "}
                        <span className="font-semibold text-slate-900">"{target.tenMau || target.tenSize}"</span>?
                    </p>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <Button variant="outline" onClick={onCancel} disabled={isDeleting}>Hủy bỏ</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white min-w-[90px]" onClick={onConfirm} disabled={isDeleting}>
                        {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xóa...</> : <><Trash2 className="mr-2 h-4 w-4" />Xóa</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Pagination row ────────────────────────────────────────────────────────
function PaginationBar({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }) {
    const start = page * pageSize + 1;
    const end   = Math.min((page + 1) * pageSize, total);
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-4 mt-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                {pageSize} dòng <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                            {[5, 10, 20, 50].map(s => (
                                <DropdownMenuItem key={s} onClick={() => onPageSizeChange(s)} className="cursor-pointer">{s} dòng</DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-sm text-gray-600">
                    Hiển thị <span className="font-semibold text-gray-900">{start}</span> - <span className="font-semibold text-gray-900">{end}</span> trong tổng số <span className="font-semibold text-violet-600">{total}</span> kết quả
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0} className="gap-1 disabled:opacity-50">
                        <ChevronLeft className="h-4 w-4" /> Trước
                    </Button>
                    <div className="hidden sm:flex gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                            let p = totalPages <= 5 ? idx : page < 3 ? idx : page > totalPages - 4 ? totalPages - 5 + idx : page - 2 + idx;
                            return (
                                <Button key={idx} variant={page === p ? "default" : "outline"} size="sm" onClick={() => onPageChange(p)}
                                    className={page === p ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm" : "border-gray-200"}>
                                    {p + 1}
                                </Button>
                            );
                        })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} className="gap-1 disabled:opacity-50">
                        Sau <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
const ColorSizeManagement = () => {
    const [activeTab,        setActiveTab]        = useState('color');
    const [showModal,        setShowModal]        = useState(false);
    const [modalMode,        setModalMode]        = useState('add');
    const [selectedItem,     setSelectedItem]     = useState(null);
    const [deleteTarget,     setDeleteTarget]     = useState(null);
    const [isDeleting,       setIsDeleting]       = useState(false);
    const [colorSearch,      setColorSearch]      = useState('');
    const [sizeSearch,       setSizeSearch]       = useState('');

    const [colors,           setColors]           = useState([]);
    const [sizes,            setSizes]            = useState([]);
    const [totalColors,      setTotalColors]      = useState(0);
    const [totalSizes,       setTotalSizes]       = useState(0);
    const [colorPage,        setColorPage]        = useState(0);
    const [colorLimit,       setColorLimit]       = useState(10);
    const [colorTotalPages,  setColorTotalPages]  = useState(0);
    const [sizePage,         setSizePage]         = useState(0);
    const [sizeLimit,        setSizeLimit]        = useState(10);
    const [sizeTotalPages,   setSizeTotalPages]   = useState(0);
    const [loadingColor,     setLoadingColor]     = useState(false);
    const [loadingSize,      setLoadingSize]      = useState(false);

    const [formData, setFormData] = useState({
        tenMau: '', maMau: '', maMauHex: '#000000',
        maSize: '', tenSize: '', loaiSize: '', thuTuSapXep: '', moTa: '',
    });

    const fetchColors = async () => {
        setLoadingColor(true);
        try {
            const res = await mauSacService.filter({ page: colorPage, size: colorLimit, filters: [] });
            if (res.status === 200) {
                setColors(res.data.content);
                setTotalColors(res.data.totalElements);
                setColorTotalPages(res.data.totalPages);
            }
        } catch { toast.error("Không thể tải danh sách màu"); }
        finally { setLoadingColor(false); }
    };

    const fetchSizes = async () => {
        setLoadingSize(true);
        try {
            const res = await sizeService.filter({ page: sizePage, size: sizeLimit, filters: [] });
            if (res.status === 200) {
                setSizes(res.data.content);
                setTotalSizes(res.data.totalElements);
                setSizeTotalPages(res.data.totalPages);
            }
        } catch { toast.error("Không thể tải danh sách size"); }
        finally { setLoadingSize(false); }
    };

    useEffect(() => { fetchColors(); }, [colorPage, colorLimit]);
    useEffect(() => { fetchSizes();  }, [sizePage,  sizeLimit]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (item) {
            if (activeTab === 'color') {
                setFormData({ tenMau: item.tenMau, maMau: item.maMau || '', maMauHex: item.maMauHex || '#000000' });
            } else {
                setFormData({ maSize: item.maSize || '', tenSize: item.tenSize || '', loaiSize: item.loaiSize || '', thuTuSapXep: item.thuTuSapXep || '', moTa: item.moTa || '' });
            }
        } else {
            if (activeTab === 'color') setFormData({ tenMau: '', maMau: '', maMauHex: '#000000' });
            else setFormData({ maSize: '', tenSize: '', loaiSize: '', thuTuSapXep: '', moTa: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            let res;
            if (activeTab === 'color') {
                res = modalMode === 'add' ? await mauSacService.create(formData) : await mauSacService.update({ id: selectedItem.id, ...formData });
            } else {
                res = modalMode === 'add' ? await sizeService.create(formData) : await sizeService.update({ id: selectedItem.id, ...formData });
            }
            if (res.status === 200) {
                toast.success(modalMode === 'add' ? "Thêm mới thành công" : "Cập nhật thành công");
                activeTab === 'color' ? fetchColors() : fetchSizes();
                setShowModal(false);
            } else {
                toast.error(res.message || "Thao tác thất bại");
            }
        } catch { toast.error("Có lỗi xảy ra"); }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = activeTab === 'color' ? await mauSacService.delete(deleteTarget.id) : await sizeService.delete(deleteTarget.id);
            if (res.status === 200) {
                toast.success("Xóa thành công");
                activeTab === 'color' ? fetchColors() : fetchSizes();
            } else {
                toast.error("Xóa thất bại");
            }
        } catch { toast.error("Có lỗi xảy ra khi xóa"); }
        finally { setIsDeleting(false); setDeleteTarget(null); }
    };

    const filteredColors = colors.filter(c =>
        !colorSearch.trim() ||
        c.tenMau?.toLowerCase().includes(colorSearch.toLowerCase()) ||
        c.maMau?.toLowerCase().includes(colorSearch.toLowerCase())
    );

    const filteredSizes = sizes.filter(s =>
        !sizeSearch.trim() ||
        s.tenSize?.toLowerCase().includes(sizeSearch.toLowerCase()) ||
        s.maSize?.toLowerCase().includes(sizeSearch.toLowerCase())
    );

    const modalTitle = modalMode === 'add'
        ? (activeTab === 'color' ? 'Thêm màu mới' : 'Thêm size mới')
        : modalMode === 'edit'
        ? (activeTab === 'color' ? 'Chỉnh sửa màu' : 'Chỉnh sửa size')
        : (activeTab === 'color' ? 'Chi tiết màu' : 'Chi tiết size');

    return (
        <>
            <ConfirmDeleteModal
                target={deleteTarget}
                label={activeTab === 'color' ? 'màu' : 'size'}
                isDeleting={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => { if (!isDeleting) setDeleteTarget(null); }}
            />

            <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight"></h2>
                        <p className="text-sm text-gray-600 mt-1"></p>
                    </div>
                    <Button onClick={() => handleOpenModal('add')} className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200">
                        <Plus className="w-4 h-4 mr-2" />
                        {activeTab === 'color' ? 'Thêm màu mới' : 'Thêm size mới'}
                    </Button>
                </div>

                {/* ── Tabs ── */}
                <Tabs defaultValue="color" onValueChange={(v) => setActiveTab(v)} className="w-full">
                    <TabsList className="bg-white border border-slate-200 shadow-sm h-12 rounded-xl p-1">
                        <TabsTrigger value="color" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                            <Palette className="h-4 w-4" />Màu sắc
                        </TabsTrigger>
                        <TabsTrigger value="size" className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
                            <Ruler className="h-4 w-4" />Kích cỡ
                        </TabsTrigger>
                    </TabsList>

                    {/* ── COLOR TAB ── */}
                    <TabsContent value="color" className="mt-5 space-y-5">
                        {/* Filter */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="h-4 w-4 text-violet-600" />
                                <span className="text-sm font-semibold text-slate-700">Tìm kiếm</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5 md:col-span-3">
                                    <Label className="text-gray-700 font-medium text-xs">Tìm theo mã hoặc tên màu</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input placeholder="Nhập từ khóa..." className="pl-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500" value={colorSearch} onChange={e => setColorSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button variant="outline" onClick={() => setColorSearch('')} className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-slate-900 hover:text-white border-gray-300">
                                        <RefreshCcw className="h-4 w-4" />Đặt lại
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            {loadingColor ? (
                                <div className="flex items-center justify-center py-16 gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                                    <span className="text-sm text-gray-600">Đang tải...</span>
                                </div>
                            ) : filteredColors.length === 0 ? <EmptyState icon={Palette} label="màu sắc" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                {["STT", "Mã màu", "Tên màu", "Màu sắc (Hex)", "Ngày tạo", "Thao tác"].map((h, i) => (
                                                    <th key={h} className={`h-12 px-4 font-semibold text-slate-600 tracking-wide text-xs uppercase ${i === 5 ? "text-center" : "text-left"}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredColors.map((color, index) => (
                                                <tr key={color.id} className="hover:bg-violet-50/50 transition-colors duration-150">
                                                    <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">{colorPage * colorLimit + index + 1}</td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-bold text-violet-600 tracking-wide font-mono">{color.maMau}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle font-semibold text-slate-900">{color.tenMau}</td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md border border-slate-200 shadow-sm flex-shrink-0" style={{ backgroundColor: color.maMauHex }} />
                                                            <span className="font-mono text-xs text-slate-500">{color.maMauHex}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">
                                                        {color.ngayTao ? new Date(color.ngayTao).toLocaleDateString("vi-VN") : "—"}
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <ActionBtn title="Xem" onClick={() => handleOpenModal('view', color)} color="violet"><Eye className="h-4 w-4" /></ActionBtn>
                                                            <ActionBtn title="Sửa" onClick={() => handleOpenModal('edit', color)} color="blue"><Pencil className="h-4 w-4" /></ActionBtn>
                                                            <ActionBtn title="Xóa" onClick={() => setDeleteTarget(color)} color="red"><Trash2 className="h-4 w-4" /></ActionBtn>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        {totalColors > 0 && (
                            <PaginationBar page={colorPage} totalPages={colorTotalPages} total={totalColors} pageSize={colorLimit}
                                onPageChange={setColorPage} onPageSizeChange={(s) => { setColorLimit(s); setColorPage(0); }} />
                        )}
                    </TabsContent>

                    {/* ── SIZE TAB ── */}
                    <TabsContent value="size" className="mt-5 space-y-5">
                        {/* Filter */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter className="h-4 w-4 text-violet-600" />
                                <span className="text-sm font-semibold text-slate-700">Tìm kiếm</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5 md:col-span-3">
                                    <Label className="text-gray-700 font-medium text-xs">Tìm theo mã hoặc tên size</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input placeholder="Nhập từ khóa..." className="pl-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500" value={sizeSearch} onChange={e => setSizeSearch(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button variant="outline" onClick={() => setSizeSearch('')} className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-slate-900 hover:text-white border-gray-300">
                                        <RefreshCcw className="h-4 w-4" />Đặt lại
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            {loadingSize ? (
                                <div className="flex items-center justify-center py-16 gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                                    <span className="text-sm text-gray-600">Đang tải...</span>
                                </div>
                            ) : filteredSizes.length === 0 ? <EmptyState icon={Ruler} label="kích cỡ" /> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                {["STT", "Mã size", "Tên size", "Loại size", "Thứ tự", "Mô tả", "Ngày tạo", "Thao tác"].map((h, i) => (
                                                    <th key={h} className={`h-12 px-4 font-semibold text-slate-600 tracking-wide text-xs uppercase ${i === 7 ? "text-center" : "text-left"}`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredSizes.map((size, index) => (
                                                <tr key={size.id} className="hover:bg-violet-50/50 transition-colors duration-150">
                                                    <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">{sizePage * sizeLimit + index + 1}</td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-bold text-violet-600 tracking-wide font-mono">{size.maSize}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle font-semibold text-slate-900">{size.tenSize}</td>
                                                    <td className="px-4 py-3.5 align-middle text-slate-600">{size.loaiSize || "—"}</td>
                                                    <td className="px-4 py-3.5 align-middle text-slate-600">{size.thuTuSapXep ?? "—"}</td>
                                                    <td className="px-4 py-3.5 align-middle max-w-[160px]">
                                                        <span className="text-slate-500 text-xs line-clamp-1">{size.moTa || "—"}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">
                                                        {size.ngayTao ? new Date(size.ngayTao).toLocaleDateString("vi-VN") : "—"}
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <ActionBtn title="Xem" onClick={() => handleOpenModal('view', size)} color="violet"><Eye className="h-4 w-4" /></ActionBtn>
                                                            <ActionBtn title="Sửa" onClick={() => handleOpenModal('edit', size)} color="blue"><Pencil className="h-4 w-4" /></ActionBtn>
                                                            <ActionBtn title="Xóa" onClick={() => setDeleteTarget(size)} color="red"><Trash2 className="h-4 w-4" /></ActionBtn>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        {totalSizes > 0 && (
                            <PaginationBar page={sizePage} totalPages={sizeTotalPages} total={totalSizes} pageSize={sizeLimit}
                                onPageChange={setSizePage} onPageSizeChange={(s) => { setSizeLimit(s); setSizePage(0); }} />
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* ── Add/Edit/View Modal ── */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-md">
                    <DialogHeader className="border-b border-slate-100 pb-4">
                        <DialogTitle className="text-lg font-bold text-slate-900">{modalTitle}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {activeTab === 'color' ? (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Tên màu <span className="text-red-500">*</span></Label>
                                    <Input disabled={modalMode === 'view'} value={formData.tenMau || ''} onChange={e => setFormData({ ...formData, tenMau: e.target.value })} placeholder="Nhập tên màu" className="border-gray-200 focus:border-violet-500 focus:ring-violet-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Mã màu <span className="text-red-500">*</span></Label>
                                    <Input disabled={modalMode === 'view'} value={formData.maMau || ''} onChange={e => setFormData({ ...formData, maMau: e.target.value })} placeholder="VD: M001" className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 font-mono" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Mã Hex <span className="text-red-500">*</span></Label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" className="h-10 w-14 p-1 border border-gray-200 rounded-lg cursor-pointer flex-shrink-0"
                                            value={formData.maMauHex || '#000000'} disabled={modalMode === 'view'}
                                            onChange={e => setFormData({ ...formData, maMauHex: e.target.value })} />
                                        <Input disabled={modalMode === 'view'} value={formData.maMauHex || '#000000'}
                                            onChange={e => setFormData({ ...formData, maMauHex: e.target.value })} placeholder="#000000"
                                            className="flex-1 border-gray-200 focus:border-violet-500 focus:ring-violet-500 font-mono" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700">Mã size <span className="text-red-500">*</span></Label>
                                        <Input disabled={modalMode === 'view'} value={formData.maSize || ''} onChange={e => setFormData({ ...formData, maSize: e.target.value })} placeholder="S, M, L..." className="border-gray-200 focus:border-violet-500 font-mono" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700">Tên size <span className="text-red-500">*</span></Label>
                                        <Input disabled={modalMode === 'view'} value={formData.tenSize || ''} onChange={e => setFormData({ ...formData, tenSize: e.target.value })} placeholder="Size S, Size M..." className="border-gray-200 focus:border-violet-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700">Loại size</Label>
                                        <Input disabled={modalMode === 'view'} value={formData.loaiSize || ''} onChange={e => setFormData({ ...formData, loaiSize: e.target.value })} placeholder="VD: chữ, số" className="border-gray-200 focus:border-violet-500" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-semibold text-slate-700">Thứ tự</Label>
                                        <Input type="number" disabled={modalMode === 'view'} value={formData.thuTuSapXep || ''} onChange={e => setFormData({ ...formData, thuTuSapXep: e.target.value })} placeholder="1" className="border-gray-200 focus:border-violet-500" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Mô tả</Label>
                                    <Input disabled={modalMode === 'view'} value={formData.moTa || ''} onChange={e => setFormData({ ...formData, moTa: e.target.value })} placeholder="Mô tả thêm" className="border-gray-200 focus:border-violet-500" />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter className="border-t border-slate-100 pt-4 gap-2">
                        {modalMode !== 'view' ? (
                            <>
                                <Button variant="outline" className="border-gray-300 text-slate-600" onClick={() => setShowModal(false)}>Hủy bỏ</Button>
                                <Button onClick={handleSubmit} className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200">
                                    {modalMode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" className="border-gray-300" onClick={() => setShowModal(false)}>Đóng</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ColorSizeManagement;