import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Save, RotateCcw, Palette, Ruler, Layers, Loader2, AlertTriangle,
    Filter, RefreshCcw, ChevronDown, Check, Package, X, AlertCircle,
    Hash, Tag, Type, AlignLeft, SortAsc, Pipette
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

/* ══════════════════════════════════════════════════════
   VIEW MODAL — Luxury Ivory/Gold Theme
══════════════════════════════════════════════════════ */
const ViewModal = ({ viewItem, activeTab, onClose, onEdit }) => {
    if (!viewItem) return null;

    const TabIcon = TAB_ICONS[activeTab];
    const tabLabel = TAB_NAMES[activeTab];

    const getCode = (item) => item.maMau || item.maSize || item.maChatLieu || '—';
    const getName = (item) => item.tenMau || item.tenSize || item.tenChatLieu || '—';

    return (
        <Dialog open={!!viewItem} onOpenChange={o => !o && onClose()}>
            <DialogContent
                className="max-w-md p-0 overflow-hidden border-0 shadow-2xl"
                style={{
                    background: '#fffdf8',
                    borderRadius: '24px',
                    border: '1px solid rgba(184,134,11,0.18)',
                    boxShadow: '0 24px 64px rgba(100,80,20,0.16), 0 0 0 1px rgba(184,134,11,0.1)',
                }}
            >
                {/* ── Header strip ── */}
                <div style={{
                    background: 'linear-gradient(135deg, #fdf3d8 0%, #fff8e8 60%, #fdf0cc 100%)',
                    borderBottom: '1.5px solid rgba(184,134,11,0.15)',
                    padding: '22px 28px 18px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* decorative corner accent */}
                    <div style={{
                        position: 'absolute', top: -20, right: -20,
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(184,134,11,0.07)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -30, right: 40,
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'rgba(184,134,11,0.05)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                        {/* Icon badge */}
                        <div style={{
                            width: 42, height: 42, borderRadius: 12,
                            background: 'linear-gradient(135deg, #b8860b, #d4a017)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(184,134,11,0.35)',
                            flexShrink: 0,
                        }}>
                            <TabIcon size={20} color="#fff" />
                        </div>
                        <div>
                            <p style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 10, fontWeight: 700,
                                letterSpacing: '0.18em', textTransform: 'uppercase',
                                color: 'rgba(184,134,11,0.65)', marginBottom: 2,
                            }}>
                                Chi tiết thuộc tính
                            </p>
                            <DialogTitle style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: 20, fontWeight: 800,
                                color: '#1a1612', margin: 0,
                            }}>
                                {tabLabel}
                            </DialogTitle>
                        </div>
                    </div>
                    <DialogDescription className="sr-only">Hồ sơ dữ liệu thuộc tính {tabLabel}</DialogDescription>
                </div>

                {/* ── Body ── */}
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Code + Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div style={{
                            background: '#fff',
                            border: '1.5px solid rgba(184,134,11,0.12)',
                            borderRadius: 14,
                            padding: '14px 16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <Hash size={11} color="rgba(184,134,11,0.6)" />
                                <span style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9, fontWeight: 700,
                                    letterSpacing: '0.15em', textTransform: 'uppercase',
                                    color: 'rgba(184,134,11,0.6)',
                                }}>Mã định danh</span>
                            </div>
                            <p style={{
                                fontFamily: "'DM Mono', monospace",
                                fontSize: 17, fontWeight: 800,
                                color: '#b8860b', letterSpacing: '0.04em',
                                lineHeight: 1.2,
                            }}>
                                {getCode(viewItem)}
                            </p>
                        </div>

                        <div style={{
                            background: '#fff',
                            border: '1.5px solid rgba(184,134,11,0.12)',
                            borderRadius: 14,
                            padding: '14px 16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <Tag size={11} color="rgba(184,134,11,0.6)" />
                                <span style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9, fontWeight: 700,
                                    letterSpacing: '0.15em', textTransform: 'uppercase',
                                    color: 'rgba(184,134,11,0.6)',
                                }}>Tên hiển thị</span>
                            </div>
                            <p style={{
                                fontSize: 15, fontWeight: 700,
                                color: '#1a1612', lineHeight: 1.3,
                                wordBreak: 'break-word',
                            }}>
                                {getName(viewItem)}
                            </p>
                        </div>
                    </div>

                    {/* ── COLOR specific ── */}
                    {activeTab === 'color' && (
                        <div style={{
                            background: '#fff',
                            border: '1.5px solid rgba(184,134,11,0.12)',
                            borderRadius: 14,
                            padding: '16px 18px',
                            display: 'flex', alignItems: 'center', gap: 18,
                        }}>
                            {/* Large color swatch */}
                            <div style={{
                                width: 64, height: 64, borderRadius: 14, flexShrink: 0,
                                background: viewItem.maMauHex || '#000',
                                border: '2.5px solid rgba(184,134,11,0.18)',
                                boxShadow: `0 6px 20px ${viewItem.maMauHex}55, 0 2px 6px rgba(0,0,0,0.08)`,
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <Pipette size={11} color="rgba(184,134,11,0.6)" />
                                    <span style={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: 9, fontWeight: 700,
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        color: 'rgba(184,134,11,0.6)',
                                    }}>Mã màu Hex</span>
                                </div>
                                <p style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 22, fontWeight: 900,
                                    color: '#1a1612', textTransform: 'uppercase',
                                    letterSpacing: '0.06em', lineHeight: 1,
                                }}>
                                    {viewItem.maMauHex || '—'}
                                </p>
                                {/* mini color bar */}
                                <div style={{
                                    marginTop: 8, height: 4, borderRadius: 99,
                                    background: `linear-gradient(90deg, ${viewItem.maMauHex}99, ${viewItem.maMauHex})`,
                                    width: '80%',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* ── SIZE specific ── */}
                    {activeTab === 'size' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                            <div style={{
                                background: '#fff',
                                border: '1.5px solid rgba(184,134,11,0.12)',
                                borderRadius: 14, padding: '14px 16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <Ruler size={11} color="rgba(184,134,11,0.6)" />
                                    <span style={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: 9, fontWeight: 700,
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        color: 'rgba(184,134,11,0.6)',
                                    }}>Loại kích cỡ</span>
                                </div>
                                {viewItem.loaiSize ? (
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px', borderRadius: 99,
                                        background: 'linear-gradient(135deg, #fdf3d8, #fff0cc)',
                                        border: '1px solid rgba(184,134,11,0.2)',
                                        fontSize: 13, fontWeight: 700,
                                        color: '#111111', textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}>{viewItem.loaiSize}</span>
                                ) : (
                                    <p style={{ fontSize: 14, color: '#111111', fontStyle: 'italic' }}>—</p>
                                )}
                            </div>
                            <div style={{
                                background: '#fff',
                                border: '1.5px solid rgba(184,134,11,0.12)',
                                borderRadius: 14, padding: '14px 16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <SortAsc size={11} color="rgba(184,134,11,0.6)" />
                                    <span style={{
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: 9, fontWeight: 700,
                                        letterSpacing: '0.15em', textTransform: 'uppercase',
                                        color: 'rgba(184,134,11,0.6)',
                                    }}>Thứ tự ưu tiên</span>
                                </div>
                                <p style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 22, fontWeight: 800,
                                    color: '#1a1612', lineHeight: 1,
                                }}>{viewItem.thuTuSapXep ?? '—'}</p>
                            </div>
                        </div>
                    )}

                    {/* ── Description (material & size) ── */}
                    {(activeTab === 'material' || activeTab === 'size') && (
                        <div style={{
                            background: '#fff',
                            border: '1.5px solid rgba(184,134,11,0.12)',
                            borderRadius: 14, padding: '14px 16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                <AlignLeft size={11} color="rgba(184,134,11,0.6)" />
                                <span style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 9, fontWeight: 700,
                                    letterSpacing: '0.15em', textTransform: 'uppercase',
                                    color: 'rgba(184,134,11,0.6)',
                                }}>Mô tả chi tiết</span>
                            </div>
                            {viewItem.moTa ? (
                                <p style={{
                                    fontSize: 13, color: '#111111', lineHeight: 1.7,
                                    fontStyle: 'italic', margin: 0,
                                }}>{viewItem.moTa}</p>
                            ) : (
                                <p style={{
                                    fontSize: 13, color: '#111111', fontStyle: 'italic',
                                    borderLeft: '2px solid rgba(184,134,11,0.15)',
                                    paddingLeft: 10, margin: 0,
                                }}>Không có mô tả chi tiết cho thuộc tính này.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: '16px 28px',
                    background: 'linear-gradient(135deg, #fdf3d8 0%, #fff8e8 100%)',
                    borderTop: '1.5px solid rgba(184,134,11,0.12)',
                    display: 'flex', justifyContent: 'flex-end', gap: 10,
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            height: 40, padding: '0 18px', borderRadius: 10,
                            background: '#fff', border: '1.5px solid rgba(184,134,11,0.2)',
                            color: '#111111', fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#111111'; e.currentTarget.style.color = '#111111'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.2)'; e.currentTarget.style.color = '#111111'; }}
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => { onEdit(viewItem); onClose(); }}
                        style={{
                            height: 40, padding: '0 20px', borderRadius: 10,
                            background: 'linear-gradient(135deg, #b8860b, #d4a017)',
                            border: '1.5px solid #b8860b',
                            color: '#fff', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.18s',
                            display: 'flex', alignItems: 'center', gap: 7,
                            boxShadow: '0 4px 14px rgba(184,134,11,0.3)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(184,134,11,0.45)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(184,134,11,0.3)'; }}
                    >
                        <Edit size={15} />
                        Chỉnh sửa
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

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
                <DialogContent
                    className="max-w-xl p-0 overflow-hidden border-0 shadow-2xl"
                    style={{
                        background: '#fffdf8',
                        borderRadius: '24px',
                        border: '1px solid rgba(184,134,11,0.18)',
                        boxShadow: '0 24px 64px rgba(100,80,20,0.16), 0 0 0 1px rgba(184,134,11,0.1)',
                    }}
                >
                    <div style={{
                        background: 'linear-gradient(135deg, #fdf3d8 0%, #fff8e8 60%, #fdf0cc 100%)',
                        borderBottom: '1.5px solid rgba(184,134,11,0.15)',
                        padding: '22px 28px 18px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute', top: -20, right: -20,
                            width: 100, height: 100, borderRadius: '50%',
                            background: 'rgba(184,134,11,0.07)',
                            pointerEvents: 'none',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: -30, right: 40,
                            width: 60, height: 60, borderRadius: '50%',
                            background: 'rgba(184,134,11,0.05)',
                            pointerEvents: 'none',
                        }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: 'linear-gradient(135deg, #b8860b, #d4a017)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(184,134,11,0.35)',
                                flexShrink: 0,
                            }}>
                                <Edit size={18} color="#fff" />
                            </div>
                            <div>
                                <p style={{
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.18em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(184,134,11,0.65)',
                                    marginBottom: 2,
                                }}>
                                    {modalConfig.mode === 'add' ? 'Khởi tạo thuộc tính' : 'Chỉnh sửa thuộc tính'}
                                </p>
                                <DialogTitle style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: 20,
                                    fontWeight: 800,
                                    color: '#1a1612',
                                    margin: 0,
                                }}>
                                    {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} {TAB_NAMES[activeTab]}
                                </DialogTitle>
                            </div>
                        </div>
                        <DialogDescription className="sr-only">Biểu mẫu cập nhật thuộc tính</DialogDescription>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div style={{ background: '#f5f5f5', padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div style={{ background: '#fff', border: '1.5px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                    <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b8860b]/70">Mã định danh *</Label>
                                    <div className="mt-2 flex gap-2">
                                        <Input
                                            {...form.register("ma")}
                                            className="h-10 bg-[#fffdf8] font-mono font-bold text-[#b8860b] border-[#eadcc4] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                            placeholder="VD: 42"
                                        />
                                        {(activeTab === 'color' || activeTab === 'material') && (
                                            <button
                                                type="button"
                                                className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-[#e5d4b2] bg-[#fffaf1] hover:bg-[#fff2db] transition-all"
                                                onClick={() => form.setValue('ma', generateAutoCode())}
                                                title="Tạo mã tự động"
                                            >
                                                <RotateCcw size={15} className="text-[#b8860b]" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ background: '#fff', border: '1.5px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                    <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b8860b]/70">Tên hiển thị *</Label>
                                    <Input
                                        {...form.register("ten")}
                                        className="mt-2 h-10 bg-[#fffdf8] text-black font-semibold border-[#eadcc4] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                        placeholder="Nhập tên hiển thị"
                                    />
                                </div>
                            </div>

                            {activeTab === 'color' && (
                                <div style={{ background: '#fff', border: '1.5px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                    <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b8860b]/70">Mã màu Hex</Label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <input
                                            type="color"
                                            className="h-10 w-16 rounded-lg border border-[#e5d4b2] p-1 cursor-pointer bg-[#fffdf8]"
                                            value={form.watch('maMauHex') || '#000000'}
                                            onChange={(e) => form.setValue('maMauHex', e.target.value.toUpperCase())}
                                        />
                                        <Input
                                            {...form.register("maMauHex")}
                                            className="h-10 bg-[#fffdf8] text-black font-mono uppercase border-[#eadcc4] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'size' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div style={{ background: '#fff', border: '1.5px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                        <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b8860b]/70">Loại kích cỡ</Label>
                                        <Input
                                            {...form.register("loaiSize")}
                                            className="mt-2 h-10 bg-[#fffdf8] text-black border-[#eadcc4] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                            placeholder="VD: Số, Chữ"
                                        />
                                    </div>
                                    <div style={{ background: '#fff', border: '1.5px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                        <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b8860b]/70">Thứ tự ưu tiên</Label>
                                        <Input
                                            type="number"
                                            {...form.register("thuTuSapXep")}
                                            className="mt-2 h-10 bg-[#fffdf8] text-black font-mono border-[#eadcc4] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                        />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'material' || activeTab === 'size') && (
                                <div style={{ background: '#fff', border: '1.5px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                    <Label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#b8860b]/70">Mô tả chi tiết</Label>
                                    <Textarea
                                        {...form.register("moTa")}
                                        rows={3}
                                        className="mt-2 min-h-[88px] resize-none bg-[#fffdf8] text-black border-[#eadcc4] focus-visible:ring-[#b8860b]/30 focus-visible:border-[#b8860b]"
                                        placeholder="Nhập mô tả ngắn"
                                    />
                                </div>
                            )}
                        </div>

                        <div style={{
                            padding: '16px 28px',
                            background: 'linear-gradient(135deg, #fdf3d8 0%, #fff8e8 100%)',
                            borderTop: '1.5px solid rgba(184,134,11,0.12)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10,
                        }}>
                            <button
                                type="button"
                                onClick={() => setModalConfig({ ...modalConfig, open: false })}
                                style={{
                                    height: 40, padding: '0 18px', borderRadius: 12,
                                    background: '#fff', border: '2px solid #1f2937',
                                    color: '#111111', fontSize: 13, fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.18s',
                                }}
                            >
                                Đóng
                            </button>
                            <button
                                type="submit"
                                style={{
                                    height: 40, padding: '0 20px', borderRadius: 12,
                                    background: 'linear-gradient(135deg, #b8860b, #d4a017)',
                                    border: '1.5px solid #b8860b',
                                    color: '#fff', fontSize: 14, fontWeight: 700,
                                    cursor: 'pointer', transition: 'all 0.18s',
                                    display: 'flex', alignItems: 'center', gap: 7,
                                    boxShadow: '0 4px 14px rgba(184,134,11,0.3)',
                                }}
                            >
                                <Save size={15} />
                                {modalConfig.mode === 'add' ? 'Khởi tạo' : 'Chỉnh sửa'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── View Modal (Luxury Gold/Ivory) ── */}
            <ViewModal
                viewItem={viewItem}
                activeTab={activeTab}
                onClose={() => setViewItem(null)}
                onEdit={(item) => handleOpenModal('edit', item)}
            />

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