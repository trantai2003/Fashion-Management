import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft, Search, Send, Loader2, CheckCircle, Building2,
    Phone, Mail, MapPin, User, Package, AlertCircle, ChevronRight,
    X, Layers, ShoppingBag, Check, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import apiClient from '@/services/apiClient';
import purchaseRequestService from '@/services/purchaseRequestService';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getInitials = (name = '') =>
    name.split(' ').filter(Boolean).slice(-2).map(w => w[0].toUpperCase()).join('');

// Pastel avatar colors keyed by first char
const AVATAR_PALETTES = [
    'from-sky-400 to-blue-600',
    'from-violet-400 to-purple-600',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-cyan-400 to-indigo-500',
];
const avatarColor = (name = '') =>
    AVATAR_PALETTES[(name.charCodeAt(0) || 0) % AVATAR_PALETTES.length];

/* ─── SupplierCard ───────────────────────────────────────────────────────────── */
function SupplierCard({ supplier, isSelected, onToggle }) {
    const active = supplier.trangThai === 1;
    return (
        <button
            type="button"
            onClick={() => active && onToggle(supplier.id)}
            disabled={!active}
            className={`
                group relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 focus:outline-none
                ${isSelected
                    ? 'border-blue-500 bg-blue-50/60 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
                    : active
                        ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/20'
                        : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                }
            `}
        >
            {/* Selection indicator */}
            <div className={`
                absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 shrink-0
                ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white group-hover:border-blue-300'}
            `}>
                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-start gap-3 mb-3 pr-7">
                <div className={`
                    h-10 w-10 rounded-xl bg-gradient-to-br ${avatarColor(supplier.tenNhaCungCap)}
                    flex items-center justify-center shrink-0 text-white font-black text-[13px] shadow-sm
                `}>
                    {getInitials(supplier.tenNhaCungCap)}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-[14px] text-slate-900 leading-tight truncate">{supplier.tenNhaCungCap}</p>
                    <p className="font-mono text-[11px] text-amber-600 font-semibold mt-0.5">{supplier.maNhaCungCap}</p>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5">
                {supplier.nguoiLienHe && (
                    <div className="flex items-center gap-2 text-[12px] text-slate-600">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{supplier.nguoiLienHe}</span>
                    </div>
                )}
                {supplier.email && (
                    <div className="flex items-center gap-2 text-[12px] text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-blue-600 font-medium">{supplier.email}</span>
                    </div>
                )}
                {supplier.soDienThoai && (
                    <div className="flex items-center gap-2 text-[12px] text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{supplier.soDienThoai}</span>
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded-full
                    ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}
                `}>
                    {active ? '● Hoạt động' : '● Ngừng'}
                </span>
                {isSelected && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="h-2.5 w-2.5" />Đã chọn
                    </span>
                )}
            </div>
        </button>
    );
}

/* ─── OrderSummaryPanel ──────────────────────────────────────────────────────── */
function OrderSummaryPanel({ request, loading }) {
    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
    );
    if (!request) return (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <AlertCircle className="h-8 w-8 opacity-40" />
            <p className="text-sm">Không tìm thấy yêu cầu</p>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kho nhập</p>
                    <p className="font-bold text-[13px] text-slate-800 truncate">{request.khoNhap?.tenKho || '—'}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{request.khoNhap?.maKho}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày giao DK</p>
                    <p className="font-bold text-[13px] text-slate-800">{formatDate(request.ngayGiaoDuKien)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Người tạo</p>
                    <p className="font-semibold text-[13px] text-slate-800 truncate">{request.nguoiTao?.hoTen || '—'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số biến thể</p>
                    <p className="font-bold text-[13px] text-blue-600">{request.chiTietYeuCauMuaHangs?.length || 0}</p>
                </div>
            </div>

            {/* Ghi chú */}
            {request.ghiChu && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Ghi chú</p>
                    <p className="text-[12px] text-slate-700">{request.ghiChu}</p>
                </div>
            )}

            {/* Product list */}
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Sản phẩm yêu cầu
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {(request.chiTietYeuCauMuaHangs || []).map((item, i) => {
                        const img = item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan;
                        return (
                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-3 py-2.5">
                                {img
                                    ? <img src={img} alt="" className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                                    : <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-slate-400" /></div>
                                }
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[12px] text-slate-800 truncate">
                                        {item.bienTheSanPham?.tenBienThe || item.bienTheSanPham?.maSku}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono text-[10px] text-amber-600">{item.bienTheSanPham?.maSku}</span>
                                        {item.bienTheSanPham?.mauSac?.tenMau && (
                                            <span className="text-[10px] text-slate-400">{item.bienTheSanPham.mauSac.tenMau}</span>
                                        )}
                                    </div>
                                </div>
                                <span className="font-bold text-slate-600 text-[13px] shrink-0">×{item.soLuongDat}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function SendQuotationRequestPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // yeuCauMuaHangId

    // Suppliers
    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Request detail
    const [request, setRequest] = useState(null);
    const [loadingRequest, setLoadingRequest] = useState(true);

    // Selection
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Submit
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* ── Load suppliers via GET /api/supplier ── */
    useEffect(() => {
        const load = async () => {
            setLoadingSuppliers(true);
            try {
                const res = await apiClient.get('/api/supplier');
                const list = res.data?.data || [];
                setSuppliers(list);
            } catch {
                toast.error('Không thể tải danh sách nhà cung cấp');
            } finally {
                setLoadingSuppliers(false);
            }
        };
        load();
    }, []);

    /* ── Load yêu cầu mua hàng ── */
    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoadingRequest(true);
            try {
                const res = await apiClient.get(`/api/v1/yeu-cau-mua-hang/get-by-id/${id}`);
                setRequest(res.data?.data || null);
            } catch {
                toast.error('Không thể tải thông tin yêu cầu');
            } finally {
                setLoadingRequest(false);
            }
        };
        load();
    }, [id]);

    /* ── Filtered suppliers ── */
    const filteredSuppliers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return suppliers;
        return suppliers.filter(s =>
            s.tenNhaCungCap?.toLowerCase().includes(term) ||
            s.maNhaCungCap?.toLowerCase().includes(term) ||
            s.email?.toLowerCase().includes(term) ||
            s.nguoiLienHe?.toLowerCase().includes(term)
        );
    }, [suppliers, searchTerm]);

    const activeSuppliers = useMemo(() => suppliers.filter(s => s.trangThai === 1), [suppliers]);

    /* ── Toggle ── */
    const toggleSupplier = (supplierId) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(supplierId) ? next.delete(supplierId) : next.add(supplierId);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(activeSuppliers.filter(s => {
            const term = searchTerm.trim().toLowerCase();
            if (!term) return true;
            return s.tenNhaCungCap?.toLowerCase().includes(term) ||
                s.maNhaCungCap?.toLowerCase().includes(term);
        }).map(s => s.id)));
    };

    const clearAll = () => setSelectedIds(new Set());

    /* ── Submit ── */
    const handleSend = async () => {
        setSubmitting(true);
        try {
            await purchaseRequestService.sendQuotationRequest({
                yeuCauMuaHangId: parseInt(id),
                nhaCungCapIds: Array.from(selectedIds),
                ghiChu: '',
            });
            toast.success(`Đã gửi yêu cầu báo giá đến ${selectedIds.size} nhà cung cấp!`);
            setShowConfirm(false);
            setTimeout(() => navigate('/purchase-requests'), 1200);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedSuppliersList = suppliers.filter(s => selectedIds.has(s.id));

    /* ── Stats ── */
    const activeCount = activeSuppliers.length;
    const selectedCount = selectedIds.size;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">

            {/* ── Top bar ── */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
                    <button type="button" onClick={() => navigate('/purchase-requests')}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </button>

                    <div className="flex items-center gap-2">
                        {selectedCount > 0 && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full">
                                <Check className="h-3.5 w-3.5" />
                                {selectedCount} nhà cung cấp đã chọn
                            </span>
                        )}
                        <Button
                            onClick={() => selectedCount > 0 && setShowConfirm(true)}
                            disabled={selectedCount === 0 || loadingRequest || !request}
                            className="h-9 px-4 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold shadow-md text-[13px] transition-all"
                        >
                            <Send className="h-4 w-4" />
                            Gửi báo giá
                            {selectedCount > 0 && <span className="bg-white/25 rounded-full px-1.5 text-[11px]">{selectedCount}</span>}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-6 items-start">

                {/* ══════════════════════════════════════
                    LEFT: Supplier Selection (70%)
                ══════════════════════════════════════ */}
                <div className="flex-1 min-w-0 space-y-4">

                    {/* Page title */}
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gửi yêu cầu báo giá</h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Chọn nhà cung cấp để gửi email yêu cầu báo giá · Yêu cầu #{id}
                        </p>
                    </div>

                    {/* Search + controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm nhà cung cấp theo tên, mã, email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-slate-200 bg-white text-[13px] focus:border-blue-400 focus:ring-blue-400"
                            />
                            {searchTerm && (
                                <button type="button" onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-slate-300 hover:bg-slate-400 flex items-center justify-center transition-colors">
                                    <X className="h-2.5 w-2.5 text-white" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={selectAll}
                                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-[12px] font-semibold text-slate-600 hover:text-blue-700 transition-all whitespace-nowrap">
                                Chọn tất cả
                            </button>
                            {selectedCount > 0 && (
                                <button type="button" onClick={clearAll}
                                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-[12px] font-semibold text-slate-600 hover:text-rose-600 transition-all whitespace-nowrap">
                                    Bỏ chọn tất cả
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="flex items-center gap-3 text-[12px] text-slate-500 flex-wrap">
                        <span className="font-semibold text-slate-700">{filteredSuppliers.length} nhà cung cấp</span>
                        {searchTerm && <span>· phù hợp tìm kiếm</span>}
                        <span>·</span>
                        <span className="text-emerald-600 font-semibold">{activeCount} hoạt động</span>
                        {selectedCount > 0 && (
                            <>
                                <span>·</span>
                                <span className="text-blue-600 font-bold">{selectedCount} đã chọn</span>
                            </>
                        )}
                    </div>

                    {/* Supplier grid */}
                    {loadingSuppliers ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-slate-500 text-sm font-medium">Đang tải nhà cung cấp...</p>
                        </div>
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-slate-400" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-700">Không tìm thấy nhà cung cấp</p>
                                <p className="text-sm text-slate-400 mt-1">Thử thay đổi từ khoá tìm kiếm</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {filteredSuppliers.map(supplier => (
                                <SupplierCard
                                    key={supplier.id}
                                    supplier={supplier}
                                    isSelected={selectedIds.has(supplier.id)}
                                    onToggle={toggleSupplier}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    RIGHT: Order Summary Panel (30%)
                ══════════════════════════════════════ */}
                <div className="w-full lg:w-[340px] shrink-0 sticky top-20 space-y-4">

                    {/* Order info card */}
                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-violet-600" />
                            </div>
                            <p className="font-bold text-[13px] text-slate-800">Thông tin yêu cầu #{id}</p>
                        </div>
                        <div className="p-5">
                            <OrderSummaryPanel request={request} loading={loadingRequest} />
                        </div>
                    </div>

                    {/* Selected suppliers preview */}
                    {selectedCount > 0 && (
                        <div className="rounded-2xl bg-white border border-blue-200 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-100 bg-blue-50">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-500" />
                                    <p className="font-bold text-[13px] text-blue-800">Sẽ gửi đến</p>
                                </div>
                                <span className="text-[12px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">{selectedCount}</span>
                            </div>
                            <div className="p-3 space-y-2 max-h-[220px] overflow-y-auto">
                                {selectedSuppliersList.map(s => (
                                    <div key={s.id} className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                                        <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${avatarColor(s.tenNhaCungCap)} flex items-center justify-center text-white font-black text-[10px] shrink-0`}>
                                            {getInitials(s.tenNhaCungCap)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[12px] text-slate-800 truncate">{s.tenNhaCungCap}</p>
                                            <p className="text-[11px] text-slate-400 truncate">{s.email || s.maNhaCungCap}</p>
                                        </div>
                                        <button type="button" onClick={() => toggleSupplier(s.id)}
                                            className="h-5 w-5 rounded-full bg-slate-200 hover:bg-rose-200 flex items-center justify-center transition-colors shrink-0">
                                            <X className="h-2.5 w-2.5 text-slate-600" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 pb-4 pt-2">
                                <Button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={loadingRequest || !request}
                                    className="w-full h-10 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] shadow-md disabled:opacity-40"
                                >
                                    <Send className="h-4 w-4" />
                                    Gửi đến {selectedCount} NCC
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-blue-600 p-6 flex items-center gap-3">
                        <div className="h-11 w-11 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Send className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-white m-0">Xác nhận gửi báo giá</DialogTitle>
                            <DialogDescription className="text-blue-100 text-[12px] mt-0.5">
                                Email sẽ được gửi đến từng nhà cung cấp đã chọn
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Summary */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-[14px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Yêu cầu mua hàng:</span>
                                <span className="font-bold text-slate-800">#{id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Kho nhập:</span>
                                <span className="font-bold text-slate-800">{request?.khoNhap?.tenKho || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Số biến thể:</span>
                                <span className="font-bold text-slate-800">{request?.chiTietYeuCauMuaHangs?.length || 0}</span>
                            </div>
                            <div className="h-px bg-slate-200" />
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Số NCC nhận email:</span>
                                <span className="font-black text-blue-600 text-[16px]">{selectedCount}</span>
                            </div>
                        </div>

                        {/* NCC list */}
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nhà cung cấp sẽ nhận</p>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                                {selectedSuppliersList.map(s => (
                                    <div key={s.id} className="flex items-center gap-2.5 px-3 py-2.5">
                                        <div className={`h-6 w-6 rounded-md bg-gradient-to-br ${avatarColor(s.tenNhaCungCap)} flex items-center justify-center text-white font-black text-[9px] shrink-0`}>
                                            {getInitials(s.tenNhaCungCap)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[12px] text-slate-800 truncate">{s.tenNhaCungCap}</p>
                                        </div>
                                        <p className="text-[11px] text-blue-600 font-medium truncate max-w-[140px]">{s.email || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                            <p className="text-[12px] text-amber-800">
                                <strong>Lưu ý:</strong> Hệ thống sẽ tạo đơn mua hàng và gửi email tự động đến từng nhà cung cấp. Thao tác này không thể hoàn tác.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 flex gap-2">
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}
                            className="flex-1 h-11 rounded-xl font-semibold">Hủy bỏ</Button>
                        <Button onClick={handleSend} disabled={submitting}
                            className="flex-1 h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2">
                            {submitting
                                ? <><Loader2 className="h-5 w-5 animate-spin" />Đang gửi...</>
                                : <><Send className="h-4 w-4" />Xác nhận gửi</>
                            }
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}