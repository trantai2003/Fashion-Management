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
  background: #faf8f3;
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
  color: #b8860b; text-transform: uppercase; letter-spacing: 0.1em;
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
  background: rgba(184,134,11,0.05); color: #b8860b;
  transition: all 0.2s;
}
.act-btn:hover { background: #b8860b; color: #fff; transform: translateY(-2px); }
.act-btn.red { color: #dc2626; background: rgba(220,38,38,0.05); }
.act-btn.red:hover { background: #dc2626; color: #fff; }

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
/* ── Pagination ── */
.pag-card {
  background: #fff; border-radius: 16px; padding: 14px 24px;
  border: 1px solid rgba(184,134,11,0.15);
  display: flex; align-items: center; justify-content: space-between;
}
.pag-btn {
  height: 36px; padding: 0 14px; border-radius: 9px;
  background: #fff; border: 1.5px solid rgba(184,134,11,0.15);
  color: #7a6e5f; font-size: 12px; font-weight: 600; transition: all 0.2s;
  display: flex; align-items: center; gap: 6px; cursor: pointer;
}
.pag-btn:hover:not(:disabled) { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }
.pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }
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

const EmptyState = ({ icon: Icon, label }) => (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Icon size={40} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Chưa có {label}</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Danh mục này hiện đang trống. Hãy bắt đầu bằng cách thêm mới một mục.
        </p>
    </div>
);

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
    const startItem = total === 0 ? 0 : filters.page * filters.size + 1;
    const endItem = Math.min((filters.page + 1) * filters.size, total);
    const TabIcon = TAB_ICONS[activeTab];

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleReset(); }}>
                    <TabsList className="bg-[#f8f2e8] border border-[#e8dcc0] shadow-sm rounded-xl p-1.5">
                        {['color', 'size', 'material'].map(tab => {
                            const Icon = TAB_ICONS[tab];
                            return (
                                <TabsTrigger
                                    key={tab}
                                    value={tab}
                                    className="rounded-lg text-[#7a6e5f] data-[state=active]:bg-[#fff9ef] data-[state=active]:text-[#b8860b] data-[state=active]:border data-[state=active]:border-[#d9c18f]"
                                >
                                    <Icon size={14} className="mr-2" />
                                    {TAB_NAMES[tab]}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </Tabs>

                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-purple-600" />
                            Bộ lọc tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={filters.keyword}
                                        onChange={e => setFilters(p => ({ ...p, keyword: e.target.value, page: 0 }))}
                                        placeholder="Tìm kiếm theo mã hoặc tên..."
                                        className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
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

                <div className="flex items-center justify-end gap-3">
                    <Button
                        onClick={() => handleOpenModal('add')}
                        className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm {TAB_LABELS[activeTab]} mới
                    </Button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                        <EmptyState icon={TabIcon} label={TAB_LABELS[activeTab]} />
                    </div>
                ) : (
                    <>
                        <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 w-14">STT</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Mã</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Tên hiển thị</th>
                                            {activeTab === 'color' && <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Màu sắc</th>}
                                            {activeTab === 'size' && <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Phân loại</th>}
                                            {activeTab === 'material' && <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Mô tả</th>}
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="transition-colors duration-150 hover:bg-violet-50/50"
                                                onClick={() => handleOpenModal('edit', item)}
                                            >
                                                <td className="px-4 py-3.5 align-middle text-center w-14 text-slate-500 text-xs">
                                                    {filters.page * filters.size + index + 1}
                                                </td>
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
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 uppercase">
                                                            {item.loaiSize || '—'}
                                                        </span>
                                                    </td>
                                                )}
                                                {activeTab === 'material' && (
                                                    <td className="px-4 py-3.5 align-middle text-slate-600 italic whitespace-normal break-words min-w-[320px] max-w-[520px]">
                                                        {item.moTa || '—'}
                                                    </td>
                                                )}
                                                <td className="px-4 py-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            title="Xem chi tiết"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-violet-600 hover:bg-violet-50 hover:border-violet-200"
                                                            onClick={() => handleOpenModal('view', item)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Chỉnh sửa"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                                            onClick={() => handleOpenModal('edit', item)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Xóa"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-red-500 hover:bg-red-50 hover:border-red-200"
                                                            onClick={() => setDeleteConfig({ open: true, item })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-[120px] justify-between font-normal bg-white border-gray-200"
                                                >
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
                                        Hiển thị <span className="font-semibold text-gray-900">{startItem}</span>
                                        {" "}-{" "}
                                        <span className="font-semibold text-gray-900">{endItem}</span>
                                        {" "}trong tổng số <span className="font-semibold text-purple-600">{total}</span> kết quả
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
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
                                                        onClick={() => setFilters(p => ({ ...p, page: pageNum }))}
                                                        className={
                                                            filters.page === pageNum
                                                                ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
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
                                            onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                                            disabled={filters.page >= totalPages - 1}
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

            {/* ── Form Modal ── */}
            <Dialog open={modalConfig.open} onOpenChange={o => setModalConfig({ ...modalConfig, open: o })}>
                <DialogContent className="attr-light-modal max-w-lg border border-[#e5d4b2] bg-[#fffdf8] text-[#2f2a23] shadow-2xl dark:!bg-[#fffdf8] dark:!text-[#2f2a23]">
                    <div className="border-b border-[#e5d4b2] bg-gradient-to-r from-[#fff7ea] to-[#fff3df] px-6 py-4">
                        <DialogTitle className="text-xl font-bold text-[#2f2a23]">
                            {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} <span className="text-[#b8860b]">{TAB_LABELS[activeTab]}</span>
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-[#8b7355]">Cập nhật danh mục thuộc tính sản phẩm</DialogDescription>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-5 px-6 py-5">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b7355]">Mã định danh *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            {...form.register("ma")}
                                            className="bg-[#fffdf8] font-mono font-bold text-[#b8860b] border-[#e5d4b2] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                            placeholder="AUTO-GEN"
                                        />
                                        <button
                                            type="button"
                                            className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-[#e5d4b2] bg-[#fffaf1] hover:bg-[#fff2db] transition-all"
                                            onClick={() => form.setValue('ma', generateAutoCode())}
                                        >
                                            <RotateCcw size={16} className="text-[#b8860b]" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b7355]">Tên hiển thị *</Label>
                                    <Input
                                        {...form.register("ten")}
                                        className="bg-[#fffdf8] font-semibold border-[#e5d4b2] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                        placeholder="Nhập tên..."
                                    />
                                </div>
                            </div>

                            {activeTab === 'color' && (
                                <div className="space-y-2">
                                    <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b7355]">Mã màu trực quan (Hex)</Label>
                                    <div className="flex gap-3 items-center">
                                        <input type="color" className="h-10 w-14 rounded-lg border border-[#e5d4b2] p-1 cursor-pointer bg-[#fffdf8]" {...form.register("maMauHex")} />
                                        <Input
                                            {...form.register("maMauHex")}
                                            className="flex-1 bg-[#fffdf8] font-mono uppercase border-[#e5d4b2] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'size' && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b7355]">Loại kích cỡ</Label>
                                        <Input {...form.register("loaiSize")} className="bg-[#fffdf8] border-[#e5d4b2] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]" placeholder="VD: Text, Number..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b7355]">Thứ tự ưu tiên</Label>
                                        <Input type="number" {...form.register("thuTuSapXep")} className="bg-[#fffdf8] font-mono border-[#e5d4b2] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]" />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'material' || activeTab === 'size') && (
                                <div className="space-y-2">
                                    <Label className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b7355]">Mô tả chi tiết</Label>
                                    <Textarea {...form.register("moTa")} rows={3} className="min-h-[100px] resize-none bg-[#fffdf8] border-[#e5d4b2] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]" placeholder="..." />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-[#e5d4b2] bg-[#fff8ed] px-6 py-4">
                            <button type="button" className="inline-flex h-10 items-center rounded-lg border border-[#d9c18f] px-4 text-sm font-medium text-[#7a6e5f] bg-white hover:bg-[#fff3db]" onClick={() => setModalConfig({ ...modalConfig, open: false })}>Hủy bỏ</button>
                            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#b8860b] bg-[#b8860b] px-4 text-sm font-medium text-white hover:bg-white hover:text-[#b8860b] transition-all">
                                <Save size={16} /> {modalConfig.mode === 'add' ? 'Khởi tạo ngay' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── View Modal ── */}
            <Dialog open={!!viewItem} onOpenChange={o => !o && setViewItem(null)}>
                <DialogContent className="max-w-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <DialogTitle className="text-xl font-bold text-slate-900">Chi tiết <span className="text-violet-600">{TAB_LABELS[activeTab]}</span></DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-slate-500">Hồ sơ dữ liệu thuộc tính</DialogDescription>
                    </div>
                    {viewItem && (
                        <div className="space-y-6 px-6 py-5">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Mã định danh</p>
                                    <p className="text-xl font-mono font-bold text-violet-600">#{viewItem.maMau || viewItem.maSize || viewItem.maChatLieu}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Tên hiển thị</p>
                                    <p className="text-xl font-bold text-slate-900">{viewItem.tenMau || viewItem.tenSize || viewItem.tenChatLieu}</p>
                                </div>
                            </div>

                            {activeTab === 'color' && (
                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl flex-shrink-0" style={{ background: viewItem.maMauHex }} />
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-violet-600">HEX CODE COLOR</p>
                                        <p className="text-2xl font-mono font-black text-slate-800 uppercase tracking-tighter">{viewItem.maMauHex}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'size' && (
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Loại kích cỡ</p>
                                        <p className="font-bold text-slate-700">{viewItem.loaiSize || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Thứ tự ưu tiên</p>
                                        <p className="font-bold text-slate-700">{viewItem.thuTuSapXep ?? '—'}</p>
                                    </div>
                                </div>
                            )}

                            {(viewItem.moTa || activeTab === 'material') && (
                                <div className="space-y-2 pt-4 border-t border-dashed border-slate-200">
                                    <p className="text-xs uppercase tracking-wide text-slate-500">Mô tả dữ liệu</p>
                                    <p className="text-sm text-slate-600 leading-relaxed italic">{viewItem.moTa || 'Không có mô tả chi tiết cho thuộc tính này.'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100" onClick={() => setViewItem(null)}>Đóng</button>
                        <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-4 text-sm font-medium text-white hover:bg-white hover:text-slate-900 transition-all" onClick={() => { handleOpenModal('edit', viewItem); setViewItem(null); }}>
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
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Xác nhận <span className="text-red-500">xóa</span></h3>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Cẩn trọng: Thao tác này không thể hoàn tác</p>
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