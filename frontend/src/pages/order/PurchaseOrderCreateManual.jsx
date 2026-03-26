import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    FileText, ArrowLeft, Loader2, ClipboardList, Truck,
    Send, Building2, Package, CheckCircle, Calendar, DollarSign
} from "lucide-react";

import apiClient from "@/services/apiClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';

export default function PurchaseOrderCreateManual() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- States ---
    const [quotationList, setQuotationList] = useState([]);
    const [selectedQuotation, setSelectedQuotation] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const [form, setForm] = useState({
        quotationId: "",
        ghiChu: "",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            // Lấy trực tiếp danh sách Đơn mua hàng (Báo giá) có trạng thái = 2 (Đã nhận báo giá)
            const res = await apiClient.post('/api/v1/don-mua-hang/filter', {
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 2, logicType: "AND" }],
                sorts: [{ fieldName: "ngayCapNhat", direction: "DESC" }],
                page: 0, size: 1000
            });

            setQuotationList(res.data?.data?.content || res.data?.content || []);

            // Auto-fill nếu URL có truyền sẵn ID
            const initialId = searchParams.get("id");
            if (initialId) {
                await loadQuotationDetails(initialId);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách báo giá");
        } finally {
            setLoading(false);
        }
    }

    const loadQuotationDetails = async (id) => {
        setActionLoading(true);
        try {
            const res = await apiClient.get(`/api/v1/don-mua-hang/get-by-id/${id}`);
            const data = res.data?.data || res.data;

            setSelectedQuotation(data);
            setForm(prev => ({
                ...prev,
                quotationId: data.id,
            }));
        } catch (error) {
            toast.error("Không thể tải chi tiết Báo giá");
            setSelectedQuotation(null);
            setForm(prev => ({ ...prev, quotationId: "" }));
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelectQuotation = (id) => {
        if (!id) {
            setSelectedQuotation(null);
            setForm(prev => ({ ...prev, quotationId: "" }));
            return;
        }
        loadQuotationDetails(id);
    };

    const handleCreate = () => {
        if (!form.quotationId) return toast.error("Vui lòng chọn một báo giá từ danh sách");
        setShowConfirmDialog(true);
    };

    const confirmCreate = async () => {
        setSubmitting(true);
        try {
            await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${form.quotationId}/3`);

            toast.success('Chấp nhận báo giá & Khởi tạo Đơn mua hàng thành công!');
            setShowConfirmDialog(false);
            setTimeout(() => navigate(`/purchase-orders/${form.quotationId}`), 1000);
        } catch (err) {
            console.error('Error creating PO:', err);
            toast.error(err.response?.data?.message || 'Không thể tạo đơn mua hàng. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-slate-500 font-medium text-[14px]">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="lux-sync p-6 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-[calc(100vh-64px)] pb-24 space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4 mb-2">
                <button type="button" onClick={() => navigate('/purchase-orders')}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors duration-200 w-fit">
                    <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                </button>
            </div>

            {/* ── Main Layout: 2 Columns ── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* ════ LEFT COLUMN (Settings) ════ */}
                <div className="w-full lg:w-[400px] shrink-0 space-y-6">
                    <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <FileText className="h-4 w-4" />
                            </div>
                            <h2 className="font-bold text-[15px] text-slate-800">Thông tin báo giá</h2>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Chọn Báo Giá */}
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-bold text-slate-700">Chọn Báo giá (PO) <span className="text-rose-500">*</span></Label>
                                <select
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    value={form.quotationId}
                                    onChange={(e) => handleSelectQuotation(e.target.value)}
                                    disabled={actionLoading}
                                >
                                    <option value="">-- Vui lòng chọn --</option>
                                    {quotationList.map(q => (
                                        <option key={q.id} value={q.id}>
                                            {q.soDonMua} - {q.nhaCungCap?.tenNhaCungCap || "Chưa rõ"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Mã đơn */}
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-bold text-slate-700">Mã Đơn mua hàng</Label>
                                <Input
                                    value={selectedQuotation ? selectedQuotation.soDonMua : ''}
                                    readOnly
                                    placeholder="Sẽ tự động điền khi chọn báo giá"
                                    className="h-11 font-mono font-bold text-blue-700 bg-blue-50/50 rounded-xl border-slate-200 text-[15px]"
                                />
                            </div>

                            {/* Info NCC rút gọn */}
                            {selectedQuotation && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-4 w-4 text-slate-400" />
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nhà cung cấp</p>
                                    </div>
                                    <p className="font-bold text-[14px] text-slate-900">{selectedQuotation.nhaCungCap?.tenNhaCungCap}</p>
                                    <p className="text-[12px] text-slate-500 font-mono mt-0.5">{selectedQuotation.nhaCungCap?.maNhaCungCap}</p>

                                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng tiền báo giá</p>
                                        <p className="text-xl font-black text-emerald-600 tracking-tight">
                                            {formatCurrency(selectedQuotation.tongTien)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                            <Button
                                onClick={handleCreate}
                                disabled={actionLoading || !form.quotationId}
                                className="w-full h-12 rounded-xl gap-2 bg-slate-900 hover:bg-white hover:text-slate-900 font-bold text-[14px] shadow-md transition-all"
                            >
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Chấp nhận & Tạo Đơn
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ════ RIGHT COLUMN (Preview) ════ */}
                <div className="flex-1 min-w-0">
                    <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col h-full">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <h2 className="text-[16px] font-bold text-slate-800">Chi tiết sản phẩm</h2>
                            </div>
                            {selectedQuotation && (
                                <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-[12px] border border-emerald-200">
                                    Từ Yêu Cầu Gốc: #{selectedQuotation.yeuCauMuaHang?.soYeuCauMuaHang || selectedQuotation.yeuCauMuaHang?.id}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 overflow-x-auto custom-scrollbar min-h-[450px]">
                            {!selectedQuotation ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4 py-24">
                                    <Truck size={56} className="text-slate-400" />
                                    <p className="font-bold text-[14px] uppercase tracking-widest text-slate-500">Vui lòng chọn báo giá bên trái</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-white sticky top-0 z-10 border-b border-slate-200">
                                        <tr>
                                            <th className="h-12 px-6 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest w-[350px]">Sản phẩm</th>
                                            <th className="h-12 px-4 text-center font-bold text-slate-500 text-[11px] uppercase tracking-widest">SL Duyệt</th>
                                            <th className="h-12 px-4 text-right font-bold text-slate-500 text-[11px] uppercase tracking-widest">Đơn giá</th>
                                            <th className="h-12 px-6 text-right font-bold text-slate-500 text-[11px] uppercase tracking-widest">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedQuotation.chiTietDonMuaHangs?.map((ct, idx) => (
                                            <tr key={ct.id || idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        {ct.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                            <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shadow-sm shrink-0">
                                                                <img src={ct.bienTheSanPham.anhBienThe.tepTin.duongDan} alt="Product" className="h-full w-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                                <Package className="h-5 w-5 text-slate-300" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-[14px] text-slate-900 leading-tight">
                                                                {ct.bienTheSanPham?.tenSanPham || ct.bienTheSanPham?.tenBienThe || 'Sản phẩm'}
                                                            </p>
                                                            <div className="font-mono text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                                                                <span>{ct.bienTheSanPham?.maSku}</span>
                                                                <span className="text-slate-300">|</span>
                                                                <span>{ct.bienTheSanPham?.mauSac?.tenMau} - {ct.bienTheSanPham?.size?.maSize}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="font-black text-blue-700 text-[14px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                        {ct.soLuongDat || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="font-semibold text-slate-800 text-[14px]">
                                                        {formatCurrency(ct.donGia)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-emerald-600 text-[15px]">
                                                        {formatCurrency(ct.thanhTien)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!selectedQuotation.chiTietDonMuaHangs || selectedQuotation.chiTietDonMuaHangs.length === 0) && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-10 text-[13px] text-slate-400 italic">
                                                    Báo giá này chưa có sản phẩm chi tiết
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-3xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-emerald-600 p-6 flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-white m-0">Xác nhận tạo đơn hàng</DialogTitle>
                            <DialogDescription className="text-emerald-100 text-[13px] mt-1">
                                Hành động này sẽ chốt báo giá với nhà cung cấp.
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3 text-[14px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Mã đơn mua (PO):</span>
                                <span className="font-mono font-bold text-blue-600 text-[15px]">{selectedQuotation?.soDonMua}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Nhà cung cấp:</span>
                                <span className="font-bold text-slate-800">{selectedQuotation?.nhaCungCap?.tenNhaCungCap}</span>
                            </div>
                            <div className="h-px bg-slate-200 my-2" />
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Tổng tiền chốt:</span>
                                <span className="font-black text-emerald-600 text-[18px]">{formatCurrency(selectedQuotation?.tongTien)}</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={submitting}
                                className="flex-1 h-12 rounded-xl font-bold border-slate-200 text-slate-700"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={confirmCreate}
                                disabled={submitting}
                                className="flex-1 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all gap-2"
                            >
                                {submitting ? <><Loader2 className="h-5 w-5 animate-spin" />Đang xử lý...</> : <><CheckCircle className="h-4 w-4" />Xác nhận</>}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}