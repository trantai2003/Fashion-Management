import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Save, RotateCcw, Palette, Ruler, Layers, Loader2, AlertTriangle,
    Filter, RefreshCcw, ChevronDown, Check, Package, X, AlertCircle
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

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.lux-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 32px;
  font-family: 'DM Sans', system-ui, sans-serif;
  position: relative;
}

.lux-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.lux-inner {
  position: relative; z-index: 1;
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Header ── */
.lux-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.lux-title-wrap { display: flex; flex-direction: column; gap: 4px; }
.lux-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 11px;
  letter-spacing: 0.25em; color: rgba(184,134,11,0.6);
  text-transform: uppercase; font-weight: 600;
}
.lux-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px; font-weight: 900; color: #1a1612;
  letter-spacing: -0.5px;
}
.lux-title span { color: #b8860b; }

/* ── Tabs ── */
.lux-tabs-list {
  background: rgba(184,134,11,0.05) !important;
  border: 1px solid rgba(184,134,11,0.1) !important;
  padding: 6px !important; border-radius: 16px !important;
}
.lux-tab-trigger {
  font-family: 'DM Mono', monospace !important; font-size: 11px !important;
  font-weight: 700 !important; text-transform: uppercase !important;
  letter-spacing: 0.05em !important; padding: 10px 24px !important;
  border-radius: 12px !important; transition: all 0.3s !important;
  color: #7a6e5f !important;
}
.lux-tab-trigger[data-state='active'] {
  background: #fff !important; color: #b8860b !important;
  box-shadow: 0 4px 12px rgba(184,134,11,0.15) !important;
}

/* ── Filter Card ── */
.lux-filter {
  background: #fff; border-radius: 20px; border: 1px solid rgba(184,134,11,0.15);
  padding: 24px; box-shadow: 0 4px 20px rgba(100,80,30,0.06);
  display: flex; align-items: flex-end; gap: 20px;
}
.lux-input-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.lux-label {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  text-transform: uppercase; color: #b8860b; letter-spacing: 0.05em;
}
.lux-input {
  height: 48px !important; border-radius: 12px !important;
  background: #faf8f3 !important; border: 1.5px solid rgba(184,134,11,0.1) !important;
  font-size: 14px !important; transition: all 0.2s !important;
}
.lux-input:focus {
  outline: none !important; border-color: #b8860b !important; background: #fff !important;
  box-shadow: 0 0 0 4px rgba(184,134,11,0.08) !important;
}

/* ── Table ── */
.wh-tbl-card {
  background: #fff; border-radius: 24px; border: 1px solid rgba(184,134,11,0.15);
  overflow: hidden; box-shadow: 0 10px 40px rgba(100,80,30,0.08);
}
.wh-tbl { width: 100%; border-collapse: collapse; }
.wh-th {
  height: 52px; padding: 0 20px; background: #faf8f3;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  color: rgba(184,134,11,0.6); text-transform: uppercase; letter-spacing: 0.1em;
  text-align: left; border-bottom: 2px solid rgba(184,134,11,0.12);
}
.wh-td { 
  padding: 16px 20px; border-bottom: 1px solid rgba(184,134,11,0.08);
  font-size: 14px; color: #1a1612; transition: all 0.2s;
}
.wh-tr:hover .wh-td { background: rgba(184,134,11,0.03); }

/* ── Buttons ── */
.btn-gold {
  height: 48px; padding: 0 24px; border-radius: 12px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(184,134,11,0.3); transition: all 0.2s;
}
.btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(184,134,11,0.45); }

.btn-white {
  height: 48px; padding: 0 24px; border-radius: 12px;
  background: #fff; border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
}
.btn-white:hover { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }

/* ── Action Buttons ── */
.act-btn {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: rgba(184,134,11,0.6);
}
.act-btn:hover { background: rgba(184,134,11,0.1); color: #b8860b; transform: scale(1.1); }
.act-btn.red:hover { background: rgba(220,38,38,0.1); color: #dc2626; }

/* ── Dialogs ── */
.lux-dialog-content {
  background: #fff !important; border-radius: 24px !important;
  border: 1px solid rgba(184,134,11,0.15) !important;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important;
  padding: 0 !important; overflow: hidden !important;
}
.lux-dialog-head {
  padding: 24px 32px; background: #faf8f3;
  border-bottom: 1px solid rgba(184,134,11,0.12);
}
.lux-dialog-body { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
.lux-dialog-foot {
  padding: 20px 32px; background: #faf8f3;
  border-top: 1px solid rgba(184,134,11,0.12);
  display: flex; justify-content: flex-end; gap: 12px;
}
`;

const formSchema = z.object({
    ten: z.string().min(1, "Tên không được để trống"),
    ma: z.string().min(1, "Mã không được để trống"),
    maMauHex: z.string().optional(),
    loaiSize: z.string().optional(),
    thuTuSapXep: z.coerce.number().optional(),
    moTa: z.string().optional(),
});

const TAB_ICONS = { color: Palette, size: Ruler, material: Layers };
const TAB_LABELS = { color: 'màu sắc', size: 'kích cỡ', material: 'chất liệu' };
const TAB_NAMES = { color: 'Màu sắc', size: 'Kích cỡ', material: 'Chất liệu' };

const ProductAttributeHub = () => {
    const [activeTab, setActiveTab] = useState('color');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({ keyword: "", page: 0, size: 10 });
    const [modalConfig, setModalConfig] = useState({ open: false, mode: 'add', item: null });
    const [deleteConfig, setDeleteConfig] = useState({ open: false, item: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewItem, setViewItem] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { ten: "", ma: "", maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" },
    });

    const mapToForm = (item) => {
        if (activeTab === 'color') return { ma: item.maMau, ten: item.tenMau, maMauHex: item.maMauHex || "#000000" };
        if (activeTab === 'size') return { ma: item.maSize, ten: item.tenSize, loaiSize: item.loaiSize, thuTuSapXep: item.thuTuSapXep, moTa: item.moTa };
        if (activeTab === 'material') return { ma: item.maChatLieu, ten: item.tenChatLieu, moTa: item.moTa };
    };

    const mapToPayload = (values) => {
        if (activeTab === 'color') return { maMau: values.ma, tenMau: values.ten, maMauHex: values.maMauHex };
        if (activeTab === 'size') return { maSize: values.ma, tenSize: values.ten, loaiSize: values.loaiSize, thuTuSapXep: values.thuTuSapXep, moTa: values.moTa };
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

    return (
        <div className="lux-root">
            <style>{STYLES}</style>
            <div className="lux-grid" />
            <div className="lux-inner">
                {/* ── Header ── */}
                <header className="lux-header">
                    <div className="lux-title-wrap">
                        <span className="lux-eyebrow">Inventory Catalog</span>
                        <h1 className="lux-title">Quản lý <span>thuộc tính</span></h1>
                    </div>
                </header>

                {/* ── Tabs ── */}
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleReset(); }}>
                    <TabsList className="lux-tabs-list">
                        {['color', 'size', 'material'].map(tab => {
                            const Icon = TAB_ICONS[tab];
                            return (
                                <TabsTrigger key={tab} value={tab} className="lux-tab-trigger">
                                    <Icon size={14} className="mr-2" />
                                    {TAB_NAMES[tab]}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>

                {/* ── Filter ── */}
                <section className="lux-filter">
                    <div className="lux-input-group">
                        <Label className="lux-label">Bộ lọc tìm kiếm</Label>
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-4 text-slate-400" />
                            <Input 
                                value={filters.keyword} 
                                onChange={e => setFilters(p => ({ ...p, keyword: e.target.value, page: 0 }))}
                                placeholder="Tìm kiếm theo mã hoặc tên..." 
                                className="lux-input pl-12" 
                            />
                        </div>
                    </div>
                    <button className="btn-white" onClick={handleReset}>
                        <RefreshCcw size={16} /> Đặt lại
                    </button>
                    <button className="btn-gold" onClick={() => handleOpenModal('add')}>
                        <Plus size={18} /> Thêm {TAB_LABELS[activeTab]} mới
                    </button>
                </section>

            {/* ── Action buttons ── */}
            <div className="flex items-center justify-end">
                <Button onClick={() => handleOpenModal('add')} className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />Thêm {TAB_LABELS[activeTab]} mới
                </Button>
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                        <span className="text-sm text-gray-600">Đang tải...</span>
                    </div>
                ) : data.length === 0 ? <EmptyState icon={TabIcon} label={TAB_LABELS[activeTab]} /> : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase w-16">STT</th>
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Mã</th>
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Tên hiển thị</th>
                                    {activeTab === 'color' && <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Màu sắc</th>}
                                    {activeTab === 'size' && <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Phân loại</th>}
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Pagination ── */}
                {total > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-rgba(184,134,11,0.1)">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                            Showing {filters.page * filters.size + 1}-{Math.min((filters.page + 1) * filters.size, total)} of {total} items
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={filters.page === 0}
                                onClick={() => setFilters(p => ({ ...p, page: p - 1 }))}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="font-mono text-xs font-bold px-4">{filters.page + 1} / {totalPages}</span>
                            <button 
                                disabled={filters.page >= totalPages - 1}
                                onClick={() => setFilters(p => ({ ...p, page: p + 1 }))}
                                className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Form Modal ── */}
            <Dialog open={modalConfig.open} onOpenChange={o => setModalConfig({ ...modalConfig, open: o })}>
                <DialogContent className="lux-dialog-content max-w-lg">
                    <div className="lux-dialog-head">
                        <DialogTitle className="lux-title text-2xl">
                            {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} <span>{TAB_LABELS[activeTab]}</span>
                        </DialogTitle>
                        <DialogDescription className="lux-eyebrow mt-1">Cập nhật danh mục thuộc tính sản phẩm</DialogDescription>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="lux-dialog-body">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="lux-label">Mã định danh *</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            {...form.register("ma")} 
                                            className="lux-input font-mono font-bold text-[#b8860b]" 
                                            placeholder="AUTO-GEN"
                                        />
                                        <button 
                                            type="button" 
                                            className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                                            onClick={() => form.setValue('ma', generateAutoCode())}
                                        >
                                            <RotateCcw size={16} className="text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="lux-label">Tên hiển thị *</Label>
                                    <Input {...form.register("ten")} className="lux-input font-bold" placeholder="Nhập tên..." />
                                </div>
                            </div>

                            {activeTab === 'color' && (
                                <div className="space-y-2">
                                    <Label className="lux-label">Mã màu trực quan (Hex)</Label>
                                    <div className="flex gap-3 items-center">
                                        <input type="color" className="h-12 w-16 rounded-xl border-2 border-slate-200 p-1 cursor-pointer bg-white" {...form.register("maMauHex")} />
                                        <Input {...form.register("maMauHex")} className="flex-1 lux-input font-mono uppercase" placeholder="#000000" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'size' && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="lux-label">Loại kích cỡ</Label>
                                        <Input {...form.register("loaiSize")} className="lux-input" placeholder="VD: Text, Number..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="lux-label">Thứ tự ưu tiên</Label>
                                        <Input type="number" {...form.register("thuTuSapXep")} className="lux-input font-mono" />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'material' || activeTab === 'size') && (
                                <div className="space-y-2">
                                    <Label className="lux-label">Mô tả chi tiết</Label>
                                    <Textarea {...form.register("moTa")} rows={3} className="lux-input h-auto min-h-[100px] py-4 resize-none" placeholder="..." />
                                </div>
                            )}
                        </div>

                        <div className="lux-dialog-foot">
                            <button type="button" className="btn-white" onClick={() => setModalConfig({ ...modalConfig, open: false })}>Hủy bỏ</button>
                            <button type="submit" className="btn-gold">
                                <Save size={18} /> {modalConfig.mode === 'add' ? 'Khởi tạo ngay' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── View Modal ── */}
            <Dialog open={!!viewItem} onOpenChange={o => !o && setViewItem(null)}>
                <DialogContent className="lux-dialog-content max-w-lg">
                    <div className="lux-dialog-head">
                        <DialogTitle className="lux-title text-2xl">Chi tiết <span>{TAB_LABELS[activeTab]}</span></DialogTitle>
                        <DialogDescription className="lux-eyebrow mt-1">Hồ sơ dữ liệu thuộc tính</DialogDescription>
                    </div>
                    {viewItem && (
                        <div className="lux-dialog-body gap-8">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-1">
                                    <p className="lux-label opacity-60">Mã định danh</p>
                                    <p className="text-xl font-mono font-bold text-[#b8860b]">#{viewItem.maMau || viewItem.maSize || viewItem.maChatLieu}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="lux-label opacity-60">Tên hiển thị</p>
                                    <p className="text-xl font-bold text-slate-900">{viewItem.tenMau || viewItem.tenSize || viewItem.tenChatLieu}</p>
                                </div>
                            </div>
                            
                            {activeTab === 'color' && (
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl flex-shrink-0" style={{ background: viewItem.maMauHex }} />
                                    <div>
                                        <p className="lux-label text-[#b8860b]">HEX CODE COLOR</p>
                                        <p className="text-2xl font-mono font-black text-slate-800 uppercase tracking-tighter">{viewItem.maMauHex}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'size' && (
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="lux-label opacity-60">Loại kích cỡ</p>
                                        <p className="font-bold text-slate-700">{viewItem.loaiSize || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="lux-label opacity-60">Thứ tự ưu tiên</p>
                                        <p className="font-bold text-slate-700">{viewItem.thuTuSapXep ?? '—'}</p>
                                    </div>
                                </div>
                            )}

                            {(viewItem.moTa || activeTab === 'material') && (
                                <div className="space-y-2 pt-4 border-t border-dashed border-slate-200">
                                    <p className="lux-label">Mô tả dữ liệu</p>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">{viewItem.moTa || 'Không có mô tả chi tiết cho thuộc tính này.'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="lux-dialog-foot">
                        <button className="btn-white" onClick={() => setViewItem(null)}>Đóng</button>
                        <button className="btn-gold" onClick={() => { handleOpenModal('edit', viewItem); setViewItem(null); }}>
                            <Edit size={18} /> Chỉnh sửa
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Delete Modal ── */}
            {deleteConfig.open && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfig({ open: false, item: null })} />
                    <div className="relative z-10 w-full max-w-sm rounded-[32px] bg-white shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-8 pb-4 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="lux-title text-2xl mb-2">Xác nhận <span>xóa</span></h3>
                            <p className="lux-eyebrow text-xs">Cẩn trọng: Thao tác này không thể hoàn tác</p>
                        </div>
                        <div className="px-8 py-4 text-center">
                            <p className="text-sm text-slate-600">
                                Bạn có chắc chắn muốn xóa vĩnh viễn {TAB_LABELS[activeTab]} 
                                <span className="block font-black text-slate-900 text-lg mt-1">"{deleteConfig.item.tenMau || deleteConfig.item.tenSize || deleteConfig.item.tenChatLieu}"</span>?
                            </p>
                        </div>
                        <div className="p-8 pt-4 flex flex-col gap-2">
                            <button 
                                className="h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                Xóa dữ liệu
                            </button>
                            <button 
                                className="h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                                onClick={() => setDeleteConfig({ open: false, item: null })}
                                disabled={isDeleting}
                            >
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductAttributeHub;