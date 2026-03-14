import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Building2, Package, Calendar, AlertCircle, CheckCircle,
    Loader2, Send, FileText, Clock, DollarSign, Mail, Phone,
    User, MapPin, ChevronRight, ShieldCheck, Info,
} from "lucide-react";
import supplierQuotationService from '@/services/supplierQuotationService';
import { useLocation, useNavigate } from 'react-router-dom';

/* ─── MOCK DATA (remove in production) ─── */
const MOCK = {
    id: "PO-2024-00142",
    soDonMua: "PO-2024-00142",
    ngayDatHang: "2024-06-01T08:00:00",
    ngayGiaoDuKien: "2024-06-20T08:00:00",
    ghiChu: "Vui lòng đảm bảo hàng đúng màu sắc, size như đã thống nhất. Bao bì cẩn thận.",
    khoNhap: { tenKho: "Kho Miền Nam", diaChi: "123 Nguyễn Văn Linh, Q7, TP.HCM" },
    nguoiTao: { hoTen: "Nguyễn Minh Tuấn", soDienThoai: "0901 234 567", email: "tuan.nguyen@company.vn" },
    chiTietDonMuaHangs: [
        { id: 1, soLuongDat: 200, ghiChu: "", bienTheSanPham: { id: 1, maSku: "SKU-TN-001-RED-L", mauSac: { tenMau: "Đỏ" }, size: { tenSize: "L" }, chatLieu: { tenChatLieu: "Cotton 100%" } } },
        { id: 2, soLuongDat: 150, ghiChu: "", bienTheSanPham: { id: 2, maSku: "SKU-TN-001-BLK-M", mauSac: { tenMau: "Đen" }, size: { tenSize: "M" }, chatLieu: { tenChatLieu: "Cotton 100%" } } },
        { id: 3, soLuongDat: 80, ghiChu: "", bienTheSanPham: { id: 3, maSku: "SKU-TN-002-WHT-XL", mauSac: { tenMau: "Trắng" }, size: { tenSize: "XL" }, chatLieu: { tenChatLieu: "Polyester" } } },
    ],
};

/* ─── HELPERS ─── */
const fmtVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '';
const fmtNum = (n) => Number(n || 0).toLocaleString('vi-VN');

/* ─── SUB-COMPONENTS ─── */

function StepBadge({ n, label, active, done }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all
      ${done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold
        ${done ? 'bg-emerald-500 text-white' : active ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                {done ? '✓' : n}
            </span>
            {label}
        </div>
    );
}

function InfoField({ icon: Icon, label, value, variant = 'default', sub }) {
    const borders = {
        default: 'border-slate-200',
        indigo: 'border-indigo-200',
        amber: 'border-amber-200',
        emerald: 'border-emerald-200',
    };
    const iconColors = { default: 'text-slate-400', indigo: 'text-indigo-500', amber: 'text-amber-500', emerald: 'text-emerald-500' };
    return (
        <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <div className={`flex items-start gap-2.5 p-3 rounded-xl border bg-white ${borders[variant]}`}>
                <Icon size={15} className={`mt-0.5 flex-shrink-0 ${iconColors[variant]}`} />
                <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
                    {sub && <p className="text-[11px] mt-0.5 text-slate-500 font-medium">{sub}</p>}
                </div>
            </div>
        </div>
    );
}

function ContactCard({ icon: Icon, label, value, color }) {
    const colors = {
        indigo: { ring: 'ring-indigo-100', bg: 'bg-indigo-50', icon: 'text-indigo-600', text: 'text-indigo-700' },
        emerald: { ring: 'ring-emerald-100', bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-slate-800' },
        blue: { ring: 'ring-blue-100', bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-700' },
    };
    const c = colors[color];
    return (
        <div className={`flex items-center gap-3 p-3.5 bg-white rounded-xl ring-1 ${c.ring} hover:shadow-sm transition-shadow`}>
            <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={c.icon} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className={`text-sm font-semibold truncate ${c.text}`}>{value}</p>
            </div>
        </div>
    );
}

function SummaryKpi({ icon: Icon, label, value, sub, color }) {
    const colors = {
        slate: { border: 'border-slate-200', icon: 'text-slate-500', val: 'text-slate-800' },
        blue: { border: 'border-blue-200', icon: 'text-blue-500', val: 'text-blue-700' },
        emerald: { border: 'border-emerald-200', icon: 'text-emerald-500', val: 'text-emerald-700' },
    };
    const c = colors[color];
    return (
        <div className={`bg-white border ${c.border} rounded-2xl p-5 flex flex-col gap-3 shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center`}>
                <Icon size={18} className={c.icon} />
            </div>
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-black mt-0.5 ${c.val}`}>{value}</p>
                {sub && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{sub}</p>}
            </div>
        </div>
    );
}

/* ─── MAIN ─── */
export default function SupplierQuotation() {
    const location = useLocation?.() || {};
    const navigate = useNavigate?.() || (() => { });
    const [orderData] = useState(location.state?.orderData || MOCK);

    const [quoteItems, setQuoteItems] = useState([]);
    const [supplierNote, setSupplierNote] = useState('');
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const isQuoted = orderData?.trangThai === 4;

    useEffect(() => {
        if (!orderData) return;
        setQuoteItems(orderData.chiTietDonMuaHangs.map(item => ({
            id: item.id,
            bienTheSanPhamId: item.bienTheSanPham.id,
            maSku: item.bienTheSanPham.maSku,
            tenSanPham: [item.bienTheSanPham.mauSac?.tenMau, item.bienTheSanPham.size?.tenSize, item.bienTheSanPham.chatLieu?.tenChatLieu].filter(Boolean).join(' · '),
            soLuongDat: item.soLuongDat,
            donGiaDeXuat: item.donGia || '',
            soLuongCoCap: item.soLuongCoCap || item.soLuongDat,
            ghiChu: item.ghiChuNCC || item.ghiChu || '',
        })));
        setSupplierNote(orderData.ghiChuNCC || '');
        setEstimatedDeliveryDate(orderData.ngayGiaoDuKien?.split('T')[0] || '');
    }, [orderData]);

    const update = (i, field, value) => setQuoteItems(p => { const a = [...p]; a[i] = { ...a[i], [field]: value }; return a; });
    const itemTotal = (it) => Number(it.soLuongCoCap) * Number(it.donGiaDeXuat || 0);
    const grandTotal = () => quoteItems.reduce((s, it) => s + itemTotal(it), 0);
    const totalQty = () => quoteItems.reduce((s, it) => s + Number(it.soLuongCoCap), 0);

    const validate = () => {
        if (!estimatedDeliveryDate) { toast.error('Vui lòng chọn ngày giao hàng dự kiến'); return false; }
        for (const it of quoteItems) {
            if (!it.donGiaDeXuat || Number(it.donGiaDeXuat) <= 0) { toast.error(`Nhập đơn giá cho: ${it.tenSanPham}`); return false; }
            if (Number(it.soLuongCoCap) > it.soLuongDat) { toast.error(`SL cấp vượt SL đặt: ${it.tenSanPham}`); return false; }
        }
        return true;
    };

    const handleSubmit = () => { if (validate()) setShowConfirmDialog(true); };

    const confirmSubmit = async () => {
        setSubmitting(true);
        try {
            await supplierQuotationService?.submitQuote?.({
                id: orderData.id,
                ghiChu: supplierNote,
                chiTietDonMuaHangBaoGias: quoteItems.map(it => ({ id: it.id, donGia: Number(it.donGiaDeXuat), ghiChu: it.ghiChu })),
            });
            toast.success('Gửi báo giá thành công! Cảm ơn quý đối tác.');
            setShowConfirmDialog(false);
            setTimeout(() => navigate('/quote-success', { replace: true }), 1000);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally { setSubmitting(false); }
    };

    if (!orderData) return null;

    const filledCount = quoteItems.filter(it => Number(it.donGiaDeXuat) > 0).length;
    const allFilled = filledCount === quoteItems.length && quoteItems.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
            <style>{`
                .fade-in { animation: fadeIn 0.4s ease both; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .row-hover:hover td { background: rgba(147, 51, 234, 0.05) !important; }
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
                .price-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
            `}</style>

            {/* ── TOP BANNER ── */}
            <Card className="max-w-6xl mx-auto border border-indigo-100 shadow-sm bg-indigo-50/50 rounded-2xl overflow-hidden mb-8">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shadow-sm">
                            <ShieldCheck size={22} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Cổng báo giá nhà cung cấp</p>
                            <p className="text-lg font-black tracking-tight text-indigo-900">Fashion Management</p>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <StepBadge n="1" label="Xem đơn" done />
                        <ChevronRight size={14} className="text-indigo-200" />
                        <StepBadge n="2" label={isQuoted ? "Xem báo giá" : "Nhập giá"} active={!allFilled && !isQuoted} done={allFilled || isQuoted} />
                        <ChevronRight size={14} className="text-indigo-200" />
                        <StepBadge n="3" label="Hoàn tất" done={isQuoted} />
                    </div>
                </div>
            </Card>

            <div className="max-w-6xl mx-auto space-y-6 fade-in">
                {/* ── PAGE TITLE ── */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm">
                                {orderData.soDonMua}
                            </span>
                            <span className="text-xs text-slate-500">·</span>
                            <span className="text-xs text-slate-500 font-medium font-mono">Đặt ngày {fmtDate(orderData.ngayDatHang)}</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            {isQuoted ? 'Xem lại báo giá' : 'Yêu cầu báo giá'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            {isQuoted ? 'Báo giá này đã được gửi cho hệ thống Fashion Management' : 'Vui lòng cung cấp đơn giá và thông tin giao hàng chi tiết'}
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border shadow-sm transition-all duration-300
                        ${isQuoted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : allFilled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'}`}>
                        {isQuoted ? <ShieldCheck size={16} /> : allFilled ? <CheckCircle size={16} /> : <Info size={16} />}
                        {isQuoted ? 'Đơn hàng đã được báo giá' : allFilled ? `Sẵn sàng gửi (${quoteItems.length}/${quoteItems.length})` : `Đang nhập (${filledCount}/${quoteItems.length})`}
                    </div>
                </div>

                {/* ── 2-COL LAYOUT ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                    {/* Order Info */}
                    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
                        <CardHeader className="px-6 py-4 border-b border-slate-50 bg-white">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Building2 size={16} className="text-indigo-500" />
                                Thông tin đơn mua hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoField icon={FileText} label="Số hiệu đơn" value={orderData.soDonMua} variant="indigo" />
                                <InfoField icon={Calendar} label="Ngày niêm yết" value={fmtDate(orderData.ngayDatHang)} />
                                <InfoField icon={Clock} label="Ngày cần giao" value={fmtDate(orderData.ngayGiaoDuKien)} variant="amber" />
                                <InfoField icon={MapPin} label="Kho tiếp nhận" value={orderData.khoNhap?.tenKho} sub={orderData.khoNhap?.diaChi} variant="emerald" />
                            </div>
                            {orderData.ghiChu && (
                                <div className="mt-5 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Info size={12} className="text-blue-500" />
                                        Ghi chú từ khách hàng
                                    </p>
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{orderData.ghiChu}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
                        <CardHeader className="px-6 py-4 border-b border-slate-50 bg-white">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <User size={16} className="text-indigo-500" />
                                Nhân viên phụ trách
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <ContactCard icon={User} label="Người đặt" value={orderData.nguoiTao?.hoTen} color="indigo" />
                            <ContactCard icon={Phone} label="Hotline" value={orderData.nguoiTao?.soDienThoai} color="emerald" />
                            <ContactCard icon={Mail} label="Email liên hệ" value={orderData.nguoiTao?.email} color="blue" />
                        </CardContent>
                    </Card>
                </div>

                {/* ── TABLE ── */}
                <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/80">
                    <CardHeader className="px-6 py-5 border-b border-slate-100 bg-white flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Package size={16} className="text-indigo-500" />
                            Danh sách mặt hàng báo giá
                        </CardTitle>
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                            {quoteItems.length} sản phẩm
                        </span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white border-b border-slate-200">
                                        {['#', 'Mã SKU', 'Thông tin sản phẩm', 'SL yêu cầu', 'SL có thể cấp', 'Đơn giá đề xuất', 'Thành tiền', 'Ghi chú'].map((h, i) => (
                                            <th key={i} className={`h-12 px-4 text-left font-bold text-slate-500 tracking-wide text-[10px] uppercase whitespace-nowrap
                                                ${i === 0 ? 'w-12 text-center' : i >= 3 && i <= 6 ? 'text-right' : 'text-left'}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {quoteItems.map((item, i) => {
                                        const total = itemTotal(item);
                                        const hasPrice = Number(item.donGiaDeXuat) > 0;
                                        return (
                                            <tr key={i} className="row-hover transition-all duration-150">
                                                <td className="px-4 py-4 text-center">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-50 text-slate-500 text-xs font-bold border border-slate-100 flex items-center justify-center mx-auto shadow-sm">
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="font-bold text-indigo-600 font-mono text-xs bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100 whitespace-nowrap">
                                                        {item.maSku}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-slate-800 max-w-[200px] leading-snug">
                                                    {item.tenSanPham}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-extrabold border border-slate-200">
                                                        {item.soLuongDat}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <Input
                                                        type="number" min="0" max={item.soLuongDat}
                                                        value={item.soLuongCoCap}
                                                        disabled={isQuoted}
                                                        onChange={e => update(i, 'soLuongCoCap', e.target.value)}
                                                        className={`w-20 ml-auto text-right text-xs font-bold border-slate-200 rounded-lg h-9 price-input ${isQuoted ? 'bg-slate-100' : 'bg-slate-50/50'}`}
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="relative inline-flex items-center">
                                                        <Input
                                                            type="number" min="0" step="1000"
                                                            value={item.donGiaDeXuat}
                                                            disabled={isQuoted}
                                                            onChange={e => update(i, 'donGiaDeXuat', e.target.value)}
                                                            placeholder="0"
                                                            className={`w-36 text-right text-xs font-bold h-9 pr-8 price-input rounded-lg border shadow-sm transition-all
                                                                ${hasPrice ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white'}`}
                                                        />
                                                        <span className="absolute right-2.5 text-[10px] text-slate-400 font-bold pointer-events-none">₫</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`text-sm font-extrabold transition-colors duration-300 ${hasPrice ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                        {hasPrice ? fmtVND(total) : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Input
                                                        value={item.ghiChu}
                                                        disabled={isQuoted}
                                                        onChange={e => update(i, 'ghiChu', e.target.value)}
                                                        placeholder="Lưu ý..."
                                                        className={`w-40 text-xs font-medium border-slate-200 h-9 rounded-lg ${isQuoted ? 'bg-slate-100' : 'bg-slate-50/50'}`}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {grandTotal() > 0 && (
                                    <tfoot>
                                        <tr className="bg-white border-t-2 border-indigo-50">
                                            <td colSpan={5} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tổng hợp báo giá</td>
                                            <td className="px-4 py-5 text-right font-bold text-slate-500 text-xs">
                                                {fmtNum(totalQty())} sản phẩm
                                            </td>
                                            <td className="px-4 py-5 text-right">
                                                <span className="text-2xl font-black text-indigo-700 block tracking-tight">
                                                    {fmtVND(grandTotal())}
                                                </span>
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* ── FOOTER ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
                    <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-100">
                        <CardHeader className="px-6 py-4 border-b border-slate-50 bg-white">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={16} className="text-indigo-500" />
                                Ghi chú & Điều khoản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} className="text-indigo-500" />
                                    Ngày giao hàng dự kiến <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    type="date" value={estimatedDeliveryDate}
                                    readOnly={true}
                                    disabled={isQuoted}
                                    onChange={e => setEstimatedDeliveryDate(e.target.value)}
                                    min={orderData.ngayDatHang?.split('T')[0]}
                                    className={`border-slate-200 text-slate-800 h-11 rounded-xl price-input font-bold ${isQuoted ? 'bg-slate-100' : 'bg-slate-50/50 cursor-pointer'}`}
                                />
                                <p className="text-[10px] text-slate-400 font-medium">Lưu ý: Ngày giao tối thiểu phải sau ngày đặt hàng</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Thông tin bổ sung</Label>
                                <Textarea
                                    placeholder="Ví dụ: Miễn phí vận chuyển, Thanh toán 50% trước..."
                                    className="min-h-[120px] shadow-inner border-slate-200 rounded-2xl text-sm font-medium resize-none price-input p-4"
                                    value={supplierNote}
                                    disabled={isQuoted}
                                    onChange={e => setSupplierNote(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4">
                            <SummaryKpi icon={Package} label="Số mặt hàng" value={quoteItems.length} sub={`${filledCount} đã nhập giá`} color="slate" />
                            <SummaryKpi icon={DollarSign} label="Tổng số lượng" value={fmtNum(totalQty())} sub="Tổng cộng" color="blue" />
                            <SummaryKpi icon={CheckCircle} label="Thành tiền" value={grandTotal() > 0 ? fmtVND(grandTotal()) : '—'} sub="Chưa VAT" color="emerald" />
                        </div>

                        <Button
                            onClick={isQuoted ? () => navigate('/supplier/login') : handleSubmit}
                            disabled={!isQuoted && (submitting || !allFilled)}
                            className={`w-full h-14 text-sm font-black rounded-2xl gap-2 transition-all duration-300 shadow-lg border-2
                                ${isQuoted
                                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-white hover:text-slate-900 hover:shadow-2xl hover:-translate-y-1'
                                    : allFilled
                                        ? 'bg-slate-900 text-white border-slate-900 hover:bg-white hover:text-slate-900 hover:shadow-2xl hover:-translate-y-1'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'}`}
                        >
                            {isQuoted ? (
                                <>
                                    <ChevronRight className="rotate-180" size={20} />
                                    Quay lại trang đề xuất
                                </>
                            ) : submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : allFilled ? (
                                <>
                                    <Send size={20} />
                                    Gửi báo giá ngay
                                </>
                            ) : (
                                `Vui lòng nhập đủ giá (${filledCount}/${quoteItems.length})`
                            )}
                        </Button>
                        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl">
                            <h5 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <AlertCircle size={14} className="text-amber-600" />
                                Quy trình quan trọng
                            </h5>
                            <ul className="text-[10px] text-amber-700 space-y-1 font-bold list-disc list-inside opacity-80 leading-relaxed">
                                <li>Kiểm tra kỹ trước khi bấm gửi</li>
                                <li>Hệ thống tự động lưu trữ báo giá</li>
                                <li>Phản hồi sẽ được gửi qua email</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONFIRM DIALOG ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="bg-white max-w-md rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
                    <div className="bg-indigo-50/50 px-6 py-6 border-b border-indigo-100">
                        <DialogHeader>
                            <DialogTitle className="text-indigo-900 text-lg font-black flex items-center gap-2">
                                <ShieldCheck size={20} className="text-indigo-600" />
                                Xác nhận gửi báo giá
                            </DialogTitle>
                            <p className="text-indigo-600/70 text-sm mt-1 font-medium">Vui lòng kiểm tra lại thông tin trước khi xác nhận</p>
                        </DialogHeader>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                            {[
                                { label: 'Số đơn', value: orderData.soDonMua, mono: true },
                                { label: 'Số mặt hàng', value: `${quoteItems.length} sản phẩm` },
                                { label: 'Tổng số lượng', value: fmtNum(totalQty()) },
                                { label: 'Tổng giá trị', value: fmtVND(grandTotal()), highlight: true },
                                { label: 'Ngày giao dự kiến', value: fmtDate(estimatedDeliveryDate) },
                            ].map(({ label, value, mono, highlight }) => (
                                <div key={label} className="flex justify-between items-center px-4 py-3">
                                    <span className="text-sm text-slate-500">{label}</span>
                                    <span className={`text-sm font-semibold ${highlight ? 'text-emerald-700' : 'text-slate-800'} ${mono ? 'mono text-indigo-600' : ''}`}>
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                            <Info size={13} className="flex-shrink-0 mt-0.5 text-blue-600" />
                            Sau khi gửi, bạn không thể chỉnh sửa báo giá này.
                        </div>
                    </div>
                    <DialogFooter className="px-6 pb-6 gap-3">
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}
                            className="flex-1 h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                            Kiểm tra lại
                        </Button>
                        <Button onClick={confirmSubmit} disabled={submitting}
                            className="flex-1 h-10 rounded-xl bg-slate-900 text-white gap-2 font-semibold transition-all duration-300 border border-slate-900 hover:bg-white hover:text-slate-900">
                            {submitting ? <><Loader2 size={14} className="animate-spin" />Đang gửi...</>
                                : <><Send size={14} />Xác nhận gửi</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}