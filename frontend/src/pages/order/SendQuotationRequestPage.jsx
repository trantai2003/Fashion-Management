import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowLeft, Search, Send, Loader2, Building2,
    Phone, Mail, User, Package, AlertCircle,
    X, Sparkles, ClipboardList, Check, ShoppingBag, Warehouse, Calendar, ListChecks
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

const AVATAR_PALETTES = [
    'from-sky-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-indigo-600',
];
const avatarColor = (name = '') => AVATAR_PALETTES[(name.charCodeAt(0) || 0) % AVATAR_PALETTES.length];

/* ─── SupplierListItem (Dạng List mới) ───────────────────────────────────────── */
function SupplierListItem({ supplier, isSelected, onToggle }) {
    const active = supplier.trangThai === 1;
    return (
        <button
            type="button"
            onClick={() => active && onToggle(supplier.id)}
            disabled={!active}
            className={`
                w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 focus:outline-none
                ${isSelected
                    ? 'bg-blue-50/60'
                    : active
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-slate-50 opacity-60 cursor-not-allowed grayscale-[20%]'
                }
            `}
        >
            {/* Checkbox */}
            <div className="shrink-0 flex items-center justify-center">
                <div className={`
                    h-5 w-5 rounded border flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}
                `}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </div>
            </div>

            {/* Avatar */}
            <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${avatarColor(supplier.tenNhaCungCap)} flex items-center justify-center shrink-0 text-white font-bold text-[14px] shadow-sm`}>
                {getInitials(supplier.tenNhaCungCap)}
            </div>

            {/* Info Col 1: Name & Code */}
            <div className="flex-1 min-w-0 pr-4">
                <p className="font-bold text-[15px] text-slate-800 truncate">{supplier.tenNhaCungCap}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[12px] text-slate-500 font-medium uppercase tracking-wider">{supplier.maNhaCungCap}</span>
                </div>
            </div>

            {/* Info Col 2: Contact (Hidden on very small screens) */}
            <div className="hidden sm:flex flex-col w-56 shrink-0 pr-4 border-l border-slate-100 pl-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{supplier.nguoiLienHe || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-blue-600">{supplier.email || '—'}</span>
                </div>
            </div>

            {/* Status */}
            <div className="shrink-0 w-28 text-right hidden md:block">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {active ? 'Hoạt động' : 'Ngừng GD'}
                </span>
            </div>
        </button>
    );
}

/* ─── RequestInfoPanel (Mở rộng & Rõ ràng) ──────────────────────────────────── */
function RequestInfoPanel({ request, loading, id }) {
    if (loading) return (
        <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
    );
    if (!request) return (
        <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 gap-2">
            <AlertCircle className="h-8 w-8 opacity-40 text-rose-400" />
            <p className="text-[13px] font-medium">Không tìm thấy yêu cầu</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-[18px] text-slate-800">Thông tin yêu cầu <span className="text-blue-600">#{id}</span></h2>
                        <p className="text-[13px] text-slate-500 mt-0.5">Xác nhận thông tin trước khi gửi báo giá đến nhà cung cấp.</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Meta Info (Left) */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Warehouse className="h-3.5 w-3.5" /> Kho nhập</p>
                                <p className="font-bold text-[14px] text-slate-800">{request.khoNhap?.tenKho || '—'}</p>
                                <p className="text-[12px] text-slate-500 font-mono">{request.khoNhap?.maKho}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Ngày giao dự kiến</p>
                                <p className="font-bold text-[14px] text-slate-800">{formatDate(request.ngayGiaoDuKien)}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Người tạo</p>
                            <p className="font-semibold text-[14px] text-slate-800">{request.nguoiTao?.hoTen || '—'}</p>
                        </div>

                        {request.ghiChu && (
                            <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 mt-2">
                                <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Ghi chú từ kho</p>
                                <p className="text-[13px] text-slate-700 leading-relaxed">{request.ghiChu}</p>
                            </div>
                        )}
                    </div>

                    {/* Product List (Right) */}
                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ShoppingBag className="h-3.5 w-3.5" /> Sản phẩm yêu cầu
                            </p>
                            <span className="text-[12px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                {request.chiTietYeuCauMuaHangs?.length || 0} biến thể
                            </span>
                        </div>
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            {(request.chiTietYeuCauMuaHangs || []).map((item, i) => {
                                const img = item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan;
                                console.log(item);
                                return (
                                    <div key={i} className="flex items-center gap-3 bg-slate-50/50 rounded-xl border border-slate-100 px-3 py-2.5 hover:bg-white hover:border-slate-200 transition-colors">
                                        {img ? (
                                            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                                <img src={img} alt="" className="h-full w-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                                <Package className="h-5 w-5 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[13px] text-slate-800 truncate" title={item.bienTheSanPham?.tenSanPham}>
                                                {item.bienTheSanPham?.tenSanPham || item.bienTheSanPham?.tenBienThe || item.bienTheSanPham?.maSku}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <span className="font-mono text-[10px] text-slate-500">{item.bienTheSanPham?.maSku}</span>
                                                {item.bienTheSanPham?.mauSac?.tenMau && (
                                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.bienTheSanPham.mauSac.maMauHex }}></span>
                                                        {item.bienTheSanPham.mauSac.tenMau}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="shrink-0 bg-blue-100 text-blue-700 font-bold text-[13px] px-2.5 py-1 rounded-lg">
                                            SL: {item.soLuongDat}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
    const { id } = useParams();

    // State
    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [request, setRequest] = useState(null);
    const [loadingRequest, setLoadingRequest] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    /* ── Load Data ── */
    useEffect(() => {
        const loadData = async () => {
            try {
                const [resSup, resReq] = await Promise.all([
                    apiClient.get('/api/supplier'),
                    apiClient.get(`/api/v1/yeu-cau-mua-hang/get-by-id/${id}`)
                ]);
                setSuppliers(resSup.data?.data || []);
                setRequest(resReq.data?.data || null);
            } catch {
                toast.error('Lỗi khi tải dữ liệu. Vui lòng thử lại!');
            } finally {
                setLoadingSuppliers(false);
                setLoadingRequest(false);
            }
        };
        if (id) loadData();
    }, [id]);

    /* ── Derived State ── */
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
    const selectedSuppliersList = useMemo(() => suppliers.filter(s => selectedIds.has(s.id)), [suppliers, selectedIds]);
    const selectedCount = selectedIds.size;

    /* ── Handlers ── */
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
            return s.tenNhaCungCap?.toLowerCase().includes(term) || s.maNhaCungCap?.toLowerCase().includes(term);
        }).map(s => s.id)));
    };

    const handleSend = async () => {
        setSubmitting(true);
        try {
            await purchaseRequestService.sendQuotationRequest({
                yeuCauMuaHangId: parseInt(id),
                nhaCungCapIds: Array.from(selectedIds),
                ghiChu: '',
            });
            toast.success(`Đã gửi yêu cầu báo giá đến ${selectedCount} nhà cung cấp!`);
            setShowConfirm(false);
            setTimeout(() => navigate('/purchase-requests'), 1200);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="lux-sync p-6 md:p-8 bg-slate-50/50 min-h-[calc(100vh-64px)] pb-24">

            {/* ── Header ── */}
            <div className="mb-6 flex flex-col gap-4">
                <button type="button" onClick={() => navigate('/purchase-requests')} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors duration-200 w-fit">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                </button>
            </div>

            {/* ── Main Layout: 2 Columns ── */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">

                {/* ════ LEFT COLUMN (Main Content) ════ */}
                <div className="flex-1 min-w-0 space-y-6 w-full">
                    {/* 1. Request Info */}
                    <RequestInfoPanel request={request} loading={loadingRequest} id={id} />

                    {/* 2. Supplier Selection */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-slate-700" />
                                <h2 className="font-bold text-[16px] text-slate-800">Chọn Nhà cung cấp</h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Tìm tên, mã, email..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-[13px] w-full"
                                    />
                                </div>
                                <Button variant="outline" onClick={selectAll} className="h-10 px-4 rounded-xl text-[13px] font-bold text-slate-700 hidden sm:flex shrink-0">
                                    Chọn tất cả
                                </Button>
                            </div>
                        </div>

                        {loadingSuppliers ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                                <p className="text-slate-500 text-[14px]">Đang tải dữ liệu...</p>
                            </div>
                        ) : filteredSuppliers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                <Building2 className="h-10 w-10 text-slate-300 mb-3" />
                                <p className="text-[14px] font-medium">Không tìm thấy nhà cung cấp phù hợp.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {filteredSuppliers.map(supplier => (
                                    <SupplierListItem
                                        key={supplier.id}
                                        supplier={supplier}
                                        isSelected={selectedIds.has(supplier.id)}
                                        onToggle={toggleSupplier}
                                    />
                                ))}
                            </div>
                        )}
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[12px] text-slate-500 font-medium">
                            Hiển thị {filteredSuppliers.length} đối tác. Nhấn vào từng dòng để chọn/bỏ chọn.
                        </div>
                    </div>
                </div>

                {/* ════ RIGHT COLUMN (Sticky Cart) ════ */}
                <div className="w-full xl:w-[380px] shrink-0 sticky top-6">
                    <div className="rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-200 flex flex-col max-h-[calc(100vh-100px)]">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                                <p className="font-bold text-[16px] text-slate-900">Danh sách sẽ gửi</p>
                            </div>
                            <span className="text-[13px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                                {selectedCount} NCC
                            </span>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar min-h-[250px]">
                            {selectedCount === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-10">
                                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                                        <Send className="h-6 w-6 opacity-30" />
                                    </div>
                                    <p className="text-[13px] text-center px-4 leading-relaxed">Bạn chưa chọn đối tác nào.<br />Tích chọn ở danh sách bên trái để thêm vào đây.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Đã chọn</p>
                                        <button onClick={() => setSelectedIds(new Set())} className="text-[12px] text-rose-500 hover:text-rose-700 font-semibold">Bỏ chọn tất cả</button>
                                    </div>
                                    {selectedSuppliersList.map(s => (
                                        <div key={s.id} className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-3 py-3 shadow-sm">
                                            <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${avatarColor(s.tenNhaCungCap)} flex items-center justify-center text-white font-bold text-[12px] shrink-0`}>
                                                {getInitials(s.tenNhaCungCap)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[13px] text-slate-800 truncate">{s.tenNhaCungCap}</p>
                                                <p className="text-[11px] text-slate-500 truncate">{s.email || 'Không có email'}</p>
                                            </div>
                                            <button type="button" onClick={() => toggleSupplier(s.id)} className="h-7 w-7 rounded-full hover:bg-rose-100 flex items-center justify-center transition-colors shrink-0 group">
                                                <X className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-white shrink-0">
                            <Button
                                onClick={() => setShowConfirm(true)}
                                disabled={selectedCount === 0 || loadingRequest || !request}
                                className="w-full h-12 rounded-xl gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[15px] shadow-md transition-all"
                            >
                                <Send className="h-4 w-4" /> Gửi báo giá {selectedCount > 0 ? `(${selectedCount})` : ''}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="rounded-3xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-blue-600 p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                            <Send className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-white m-0">Xác nhận gửi báo giá</DialogTitle>
                            <DialogDescription className="text-blue-100 text-[13px] mt-1">Hệ thống sẽ tự động tạo đơn và gửi email</DialogDescription>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-[14px]">
                            <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Yêu cầu nhập hàng:</span><span className="font-black text-slate-800 text-[15px]">#{id}</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Kho nhập:</span><span className="font-bold text-slate-800">{request?.khoNhap?.tenKho || '—'}</span></div>
                            <div className="h-px bg-slate-200" />
                            <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Số đối tác nhận:</span><span className="font-black text-blue-600 text-[18px] bg-blue-100 px-2 py-0.5 rounded-lg">{selectedCount}</span></div>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Gửi đến ({selectedCount})</p></div>
                            <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto custom-scrollbar">
                                {selectedSuppliersList.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 px-3.5 py-2.5">
                                        <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${avatarColor(s.tenNhaCungCap)} flex items-center justify-center text-white font-bold text-[9px] shrink-0`}>{getInitials(s.tenNhaCungCap)}</div>
                                        <p className="font-semibold text-[13px] text-slate-800 truncate flex-1">{s.tenNhaCungCap}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pb-6 flex gap-3">
                        <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting} className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-700">Hủy bỏ</Button>
                        <Button onClick={handleSend} disabled={submitting} className="flex-1 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2">
                            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Đang gửi...</> : <><Send className="h-4 w-4" />Tiến hành gửi</>}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}