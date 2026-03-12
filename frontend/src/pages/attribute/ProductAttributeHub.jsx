import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Save, RotateCcw, Palette, Ruler, Layers, Loader2, AlertTriangle,
    Filter, RefreshCcw, ChevronDown, Check, Package
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { mauSacService, sizeService } from "@/services/attributeService";
import { getAllChatLieu, deleteChatLieu, createChatLieu, updateChatLieu } from "@/services/chatLieuService";

const formSchema = z.object({
    ten:          z.string().min(1, "Tên không được để trống"),
    ma:           z.string().min(1, "Mã không được để trống"),
    maMauHex:     z.string().optional(),
    loaiSize:     z.string().optional(),
    thuTuSapXep:  z.coerce.number().optional(),
    moTa:         z.string().optional(),
});

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
            <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy dữ liệu</h3>
            <p className="mt-2 text-sm text-slate-500">Chưa có {label} nào phù hợp. Hãy thêm mới hoặc thay đổi bộ lọc.</p>
        </div>
    );
}

function ConfirmDeleteModal({ target, label, isDeleting, onConfirm, onCancel }) {
    if (!target) return null;
    const name = target.tenMau || target.tenSize || target.tenChatLieu;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!isDeleting ? onCancel : undefined} />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-red-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="font-bold text-red-700 text-base">Xác nhận xóa {label}</p>
                        <p className="text-xs text-red-500 mt-0.5">Hành động này không thể hoàn tác</p>
                    </div>
                </div>
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Bạn có chắc chắn muốn xóa <span className="font-semibold text-slate-900">"{name}"</span>?
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

function PaginationBar({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }) {
    const start = total === 0 ? 0 : page * pageSize + 1;
    const end   = Math.min((page + 1) * pageSize, total);
    return (
        <Card className="border-0 shadow-md bg-white">
            <CardContent className="p-4">
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
                        Hiển thị <span className="font-semibold text-gray-900">{start}</span> – <span className="font-semibold text-gray-900">{end}</span> trong tổng số <span className="font-semibold text-violet-600">{total}</span> kết quả
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
                                        className={page === p ? "bg-violet-600 text-white hover:bg-violet-700 shadow-sm" : "border-gray-200"}>
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
            </CardContent>
        </Card>
    );
}

// ── Tab icon map ──────────────────────────────────────────────────────────
const TAB_ICONS = { color: Palette, size: Ruler, material: Layers };
const TAB_LABELS = { color: 'màu sắc', size: 'kích cỡ', material: 'chất liệu' };
const TAB_NAMES = { color: 'Màu sắc', size: 'Kích cỡ', material: 'Chất liệu' };

// ── Main component ────────────────────────────────────────────────────────
const ProductAttributeHub = () => {
    const [activeTab,     setActiveTab]    = useState('color');
    const [data,          setData]         = useState([]);
    const [loading,       setLoading]      = useState(false);
    const [total,         setTotal]        = useState(0);
    const [filters,       setFilters]      = useState({ keyword: "", page: 0, size: 10 });
    const [modalConfig,   setModalConfig]  = useState({ open: false, mode: 'add', item: null });
    const [deleteConfig,  setDeleteConfig] = useState({ open: false, item: null });
    const [isDeleting,    setIsDeleting]   = useState(false);
    const [viewItem,      setViewItem]     = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { ten: "", ma: "", maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" },
    });

    const mapToForm = (item) => {
        if (activeTab === 'color')    return { ma: item.maMau,    ten: item.tenMau,    maMauHex: item.maMauHex || "#000000" };
        if (activeTab === 'size')     return { ma: item.maSize,   ten: item.tenSize,   loaiSize: item.loaiSize, thuTuSapXep: item.thuTuSapXep, moTa: item.moTa };
        if (activeTab === 'material') return { ma: item.maChatLieu, ten: item.tenChatLieu, moTa: item.moTa };
    };

    const mapToPayload = (values) => {
        if (activeTab === 'color')    return { maMau: values.ma, tenMau: values.ten, maMauHex: values.maMauHex };
        if (activeTab === 'size')     return { maSize: values.ma, tenSize: values.ten, loaiSize: values.loaiSize, thuTuSapXep: values.thuTuSapXep, moTa: values.moTa };
        if (activeTab === 'material') return { maChatLieu: values.ma, tenChatLieu: values.ten, moTa: values.moTa };
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const filterList = [];
            if (filters.keyword?.trim()) {
                const kw = filters.keyword.trim();
                const fields = activeTab === 'color' ? ['tenMau', 'maMau'] : activeTab === 'size' ? ['tenSize', 'maSize'] : ['tenChatLieu', 'maChatLieu'];
                fields.forEach(f => filterList.push({ fieldName: f, operation: "LIKE", value: kw, logicType: "OR" }));
            }
            const payload = { page: filters.page, size: filters.size, filters: filterList, sorts: [{ fieldName: "id", direction: "DESC" }] };
            if (activeTab === 'color') {
                const res = await mauSacService.filter(payload);
                setData(res.data.content || []); setTotal(res.data.totalElements || 0);
            } else if (activeTab === 'size') {
                const res = await sizeService.filter(payload);
                setData(res.data.content || []); setTotal(res.data.totalElements || 0);
            } else {
                const res = await getAllChatLieu(filters.keyword);
                setData(res || []); setTotal(res?.length || 0);
            }
        } catch { toast.error("Lỗi tải dữ liệu"); }
        finally { setLoading(false); }
    }, [activeTab, filters]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleReset = () => setFilters({ keyword: "", page: 0, size: 10 });
    const generateAutoCode = () => {
        const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return activeTab === 'color' ? `MS-${r}` : activeTab === 'material' ? `CL-${r}` : '';
    };

    const handleOpenModal = (mode, item = null) => {
        if (mode === 'view') { setViewItem(item); return; }
        setModalConfig({ open: true, mode, item });
        if (item) form.reset(mapToForm(item));
        else {
            const autoCode = mode === 'add' && (activeTab === 'color' || activeTab === 'material') ? generateAutoCode() : '';
            form.reset({ ten: "", ma: autoCode, maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" });
        }
    };

    const onSubmit = async (values) => {
        try {
            const payload = mapToPayload(values);
            if (modalConfig.mode === 'add') {
                activeTab === 'color' ? await mauSacService.create(payload) : activeTab === 'size' ? await sizeService.create(payload) : await createChatLieu(payload);
                toast.success("Thêm mới thành công");
            } else {
                const id = modalConfig.item.id;
                activeTab === 'color' ? await mauSacService.update({ id, ...payload }) : activeTab === 'size' ? await sizeService.update({ id, ...payload }) : await updateChatLieu(id, payload);
                toast.success("Cập nhật thành công");
            }
            setModalConfig({ open: false, mode: 'add', item: null });
            fetchData();
        } catch { toast.error("Thao tác thất bại"); }
    };

    const confirmDelete = async () => {
        if (!deleteConfig.item) return;
        setIsDeleting(true);
        try {
            activeTab === 'color' ? await mauSacService.delete(deleteConfig.item.id) : activeTab === 'size' ? await sizeService.delete(deleteConfig.item.id) : await deleteChatLieu(deleteConfig.item.id);
            toast.success("Xóa thành công");
            setDeleteConfig({ open: false, item: null });
            fetchData();
        } catch { toast.error("Xóa thất bại"); }
        finally { setIsDeleting(false); }
    };

    const totalPages = Math.max(1, Math.ceil(total / filters.size));
    const TabIcon = TAB_ICONS[activeTab];

    const getTabIcon = () => {
        if (activeTab === 'color') return <div className="h-4 w-4 rounded-full border border-gray-200 shadow-sm" style={{ background: 'linear-gradient(to br, #ff0000, #00ff00, #0000ff)' }} />;
        if (activeTab === 'size') return <Ruler className="h-5 w-5 text-blue-600" />;
        return <Layers className="h-5 w-5 text-purple-600" />;
    };

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
             {deleteConfig.open && (
                <ConfirmDeleteModal
                    target={deleteConfig.item}
                    label={TAB_LABELS[activeTab]}
                    isDeleting={isDeleting}
                    onConfirm={confirmDelete}
                    onCancel={() => { if (!isDeleting) setDeleteConfig({ open: false, item: null }); }}
                />
            )}
            <div className="space-y-6 w-full">
                
                {/* ══ STATS ════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng {TAB_LABELS[activeTab]}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    {getTabIcon()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Tabs ── */}
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleReset(); }}>
                    <TabsList className="bg-white border border-slate-200 shadow-sm h-12 rounded-xl p-1">
                        {['color', 'size', 'material'].map(tab => {
                            const Icon = TAB_ICONS[tab];
                            return (
                                <TabsTrigger key={tab} value={tab}
                                    className="flex items-center gap-2 px-6 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all">
                                    <Icon className="h-4 w-4" />{TAB_NAMES[tab]}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>

                {/* ── Filter bar ── */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-violet-600" />
                            Bộ lọc tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[300px] space-y-2">
                                <Label className="text-gray-700 font-medium">Tìm kiếm mã hoặc tên</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input value={filters.keyword} onChange={e => setFilters(p => ({ ...p, keyword: e.target.value, page: 0 }))}
                                        placeholder="Nhập từ khóa tìm kiếm..." className="h-11 pl-10 border-gray-200 focus:border-violet-500 focus:ring-violet-500" />
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleReset} className="h-11 px-6 flex items-center gap-2 transition-all duration-300 hover:bg-violet-600 hover:text-white border-gray-300">
                                <RefreshCcw className="h-4 w-4" />Đặt lại bộ lọc
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Action buttons ── */}
                <div className="flex items-center justify-end">
                    <Button onClick={() => handleOpenModal('add')} className="bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-all duration-200 px-6 h-11">
                        <Plus className="w-4 h-4 mr-2" />Thêm {TAB_LABELS[activeTab]} mới
                    </Button>
                </div>

                {/* ── Table ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800">Danh sách {TAB_LABELS[activeTab]}</h3>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                            <span className="text-sm text-gray-600">Đang tải...</span>
                        </div>
                    ) : data.length === 0 ? <EmptyState icon={TabIcon} label={TAB_LABELS[activeTab]} /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase w-16">STT</th>
                                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Mã</th>
                                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Tên hiển thị</th>
                                        {activeTab === 'color'    && <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Màu sắc</th>}
                                        {activeTab === 'size'     && <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Phân loại</th>}
                                        {activeTab === 'material' && <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Mô tả</th>}
                                        <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-violet-50/50 transition-colors duration-150 cursor-pointer" onClick={() => handleOpenModal('edit', item)}>
                                            <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">{filters.page * filters.size + index + 1}</td>
                                            <td className="px-4 py-3.5 align-middle">
                                                <span className="font-bold text-violet-600 tracking-wide font-mono">
                                                    {item.maMau || item.maSize || item.maChatLieu}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-middle font-semibold text-slate-900">
                                                {item.tenMau || item.tenSize || item.tenChatLieu}
                                            </td>
                                            {activeTab === 'color' && (
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md border border-slate-200 shadow-sm flex-shrink-0" style={{ backgroundColor: item.maMauHex }} />
                                                        <span className="font-mono text-xs text-slate-500">{item.maMauHex}</span>
                                                    </div>
                                                </td>
                                            )}
                                            {activeTab === 'size' && (
                                                <td className="px-4 py-3.5 align-middle text-slate-600 text-xs">
                                                    Loại: {item.loaiSize || 'N/A'} · TT: {item.thuTuSapXep ?? '—'}
                                                </td>
                                            )}
                                            {activeTab === 'material' && (
                                                <td className="px-4 py-3.5 align-middle max-w-[200px]">
                                                    <span className="text-slate-500 text-xs line-clamp-1">{item.moTa || '—'}</span>
                                                </td>
                                            )}
                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex items-center justify-center gap-1">
                                                    <ActionBtn title="Xem" onClick={(e) => { e.stopPropagation(); handleOpenModal('view', item); }} color="violet"><Eye className="h-4 w-4" /></ActionBtn>
                                                    <ActionBtn title="Sửa" onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', item); }} color="blue"><Edit className="h-4 w-4" /></ActionBtn>
                                                    <ActionBtn title="Xóa" onClick={(e) => { e.stopPropagation(); setDeleteConfig({ open: true, item }); }} color="red"><Trash2 className="h-4 w-4" /></ActionBtn>
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
                {total > 0 && (
                    <PaginationBar
                        page={filters.page} totalPages={totalPages} total={total} pageSize={filters.size}
                        onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))}
                        onPageSizeChange={(s) => setFilters(prev => ({ ...prev, size: s, page: 0 }))}
                    />
                )}
            </div>

            {/* ── Add/Edit Modal ── */}
            <Dialog open={modalConfig.open} onOpenChange={o => setModalConfig({ ...modalConfig, open: o })}>
                <DialogContent className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg">
                    <DialogHeader className="border-b border-slate-100 pb-4">
                        <DialogTitle className="text-lg font-bold text-slate-900">
                            {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} {TAB_LABELS[activeTab]}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            {modalConfig.mode === 'add' ? 'Điền thông tin để tạo ' : 'Cập nhật thông tin '}{TAB_LABELS[activeTab]}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Mã định danh *</Label>
                                <div className="flex gap-2">
                                    <Input {...form.register("ma")} placeholder={activeTab === 'color' ? 'MS-0000' : activeTab === 'material' ? 'CL-0000' : 'Nhập mã...'}
                                        className="h-10 border-gray-200 focus:border-violet-500 font-mono text-violet-600 font-semibold" />
                                    {modalConfig.mode === 'add' && (activeTab === 'color' || activeTab === 'material') && (
                                        <Button type="button" variant="outline" size="icon" onClick={() => form.setValue('ma', generateAutoCode())} title="Tạo mã tự động" className="h-10 w-10 border-gray-200 flex-shrink-0">
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                {form.formState.errors.ma && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">{form.formState.errors.ma.message}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Tên hiển thị *</Label>
                                <Input {...form.register("ten")} placeholder="Nhập tên..." className="h-10 border-gray-200 focus:border-violet-500" />
                                {form.formState.errors.ten && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-xs">{form.formState.errors.ten.message}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        {activeTab === 'color' && (
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Mã màu Hex</Label>
                                <div className="flex gap-3 items-center">
                                    <input type="color" className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer p-1 bg-white flex-shrink-0" {...form.register("maMauHex")} />
                                    <Input {...form.register("maMauHex")} className="flex-1 h-10 border-gray-200 focus:border-violet-500 font-mono" placeholder="#000000" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'size' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Loại kích cỡ</Label>
                                    <Input {...form.register("loaiSize")} placeholder="VD: Chữ/Số" className="h-10 border-gray-200 focus:border-violet-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold text-slate-700">Thứ tự ưu tiên</Label>
                                    <Input type="number" {...form.register("thuTuSapXep")} className="h-10 border-gray-200 focus:border-violet-500" />
                                </div>
                            </div>
                        )}

                        {(activeTab === 'material' || activeTab === 'size') && (
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700">Mô tả chi tiết</Label>
                                <Textarea {...form.register("moTa")} rows={3} placeholder="Ghi chú thêm..." className="resize-none border-gray-200 focus:border-violet-500" />
                            </div>
                        )}

                        <DialogFooter className="border-t border-slate-100 pt-4 gap-2">
                            <Button type="button" variant="outline" className="border-gray-300 text-slate-600" onClick={() => setModalConfig({ ...modalConfig, open: false })}>Hủy bỏ</Button>
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm">
                                <Save className="mr-2 h-4 w-4" />{modalConfig.mode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── View Modal ── */}
            <Dialog open={!!viewItem} onOpenChange={o => !o && setViewItem(null)}>
                <DialogContent className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-lg">
                    <DialogHeader className="border-b border-slate-100 pb-4">
                        <DialogTitle className="text-lg font-bold text-slate-900">Chi tiết {TAB_LABELS[activeTab]}</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">Xem thông tin chi tiết</DialogDescription>
                    </DialogHeader>
                    {viewItem && (
                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã định danh</p>
                                    <p className="font-bold text-violet-600 font-mono">{viewItem.maMau || viewItem.maSize || viewItem.maChatLieu}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tên hiển thị</p>
                                    <p className="font-semibold text-slate-900">{viewItem.tenMau || viewItem.tenSize || viewItem.tenChatLieu}</p>
                                </div>
                            </div>
                            {activeTab === 'color' && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã màu (Hex)</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg border-2 border-gray-200 shadow-sm" style={{ backgroundColor: viewItem.maMauHex }} />
                                        <p className="font-mono font-semibold text-slate-900">{viewItem.maMauHex}</p>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'size' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Loại kích cỡ</p>
                                            <p className="font-semibold text-slate-900">{viewItem.loaiSize || '—'}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thứ tự ưu tiên</p>
                                            <p className="font-semibold text-slate-900">{viewItem.thuTuSapXep ?? '—'}</p>
                                        </div>
                                    </div>
                                    {viewItem.moTa && (
                                        <div className="space-y-1.5">
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mô tả</p>
                                            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{viewItem.moTa}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {activeTab === 'material' && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mô tả</p>
                                    <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{viewItem.moTa || '—'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="border-t border-slate-100 pt-4 gap-2">
                        <Button variant="outline" className="border-gray-300 text-slate-600" onClick={() => setViewItem(null)}>Đóng</Button>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => { handleOpenModal('edit', viewItem); setViewItem(null); }}>
                            <Edit className="mr-2 h-4 w-4" />Chỉnh sửa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductAttributeHub;