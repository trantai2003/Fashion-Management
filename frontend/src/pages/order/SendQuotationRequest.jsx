import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import {
    ArrowLeft, Send, Building2, FileText, ChevronDown,
    Loader2, CheckCircle, Package, RotateCw, AlertCircle,
} from "lucide-react";

import apiClient from '@/services/apiClient';
import purchaseOrderDetailService from '@/services/purchaseOrderDetailService';
import purchaseOrderService from '@/services/purchaseOrderService';

/* ─── Shared layout ─────────────────────────────────────────────── */
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-bold text-slate-800 text-[14px]">{title}</p>
            </div>
            <div className="p-6 flex flex-col gap-5">{children}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function SendQuotationRequest() {
    const navigate = useNavigate();
    const { id } = useParams(); // id của đơn mua hàng

    /* ── State ── */
    const [orderData, setOrderData] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(true);

    const [suppliers, setSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(true);

    const [formData, setFormData] = useState({
        soDonMua: '',
        nhaCungCapId: '',
    });

    const [sending, setSending] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    /* ── Load order detail ── */
    useEffect(() => {
        const fetchOrder = async () => {
            setLoadingOrder(true);
            try {
                const result = await purchaseOrderDetailService.getById(id);
                if (result?.status === 200 && result?.data) {
                    setOrderData(result.data);
                    // Prefill soDonMua nếu đã có
                    if (result.data.soDonMua) {
                        setFormData(prev => ({ ...prev, soDonMua: result.data.soDonMua }));
                    }
                    // Prefill nhaCungCapId nếu đã có
                    if (result.data.nhaCungCap?.id) {
                        setFormData(prev => ({ ...prev, nhaCungCapId: result.data.nhaCungCap.id }));
                    }
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                toast.error('Không thể tải thông tin đơn hàng');
            } finally {
                setLoadingOrder(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    /* ── Load suppliers ── */
    useEffect(() => {
        const fetchSuppliers = async () => {
            setLoadingSuppliers(true);
            try {
                const suppliers = await purchaseOrderService.getUniqueSuppliers();
                setSuppliers(suppliers);
            } catch (err) {
                console.error('Error fetching suppliers:', err);
                toast.error('Không thể tải danh sách nhà cung cấp');
            } finally {
                setLoadingSuppliers(false);
            }
        };
        fetchSuppliers();
    }, []);

    /* ── Helpers ── */
    const selectedSupplier = suppliers.find(s => s.id === parseInt(formData.nhaCungCapId)) ?? null;

    const generateOrderNumber = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PO${y}${m}${d}${r}`;
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        });
    };

    /* ── Validate ── */
    const validate = () => {
        if (!formData.soDonMua.trim()) {
            toast.error('Vui lòng nhập số đơn mua');
            return false;
        }
        if (!formData.nhaCungCapId) {
            toast.error('Vui lòng chọn nhà cung cấp');
            return false;
        }
        return true;
    };

    /* ── Submit ── */
    const handleSubmit = () => {
        if (!validate()) return;
        setShowConfirmDialog(true);
    };

    const confirmSend = async () => {
        setSending(true);
        try {
            // Gọi API PUT /don-mua-hang/gui-yeu-cau-bao-gia
            // Backend sẽ tự cập nhật trạng thái sang 3 và gửi mail
            await apiClient.put('/api/v1/nghiep-vu/don-mua-hang/gui-yeu-cau-bao-gia', {
                id: parseInt(id),
                soDonMua: formData.soDonMua.trim(),
                nhaCungCapId: parseInt(formData.nhaCungCapId),
            });

            toast.success('Đã gửi yêu cầu báo giá thành công! Trạng thái đơn hàng đã được cập nhật.');
            setShowConfirmDialog(false);
            setTimeout(() => navigate('/quotation-requests'), 1500);
        } catch (err) {
            console.error('Error sending quotation request:', err);
            toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu báo giá. Vui lòng thử lại!');
        } finally {
            setSending(false);
        }
    };

    /* ── Loading ── */
    if (loadingOrder) {
        return (
            <div className="p-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải thông tin đơn hàng...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="p-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 max-w-md w-full">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-slate-600 mb-6">Không tìm thấy đơn hàng</p>
                    <Button onClick={() => navigate('/purchase-requests')}
                        className="w-full bg-slate-900 text-white rounded-xl h-11">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    /* ══════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════ */
    return (
        <div className="p-5 space-y-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)]">

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate(`/purchase-orders/${id}`)}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại chi tiết yêu cầu
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* ── Card: Thông tin gửi báo giá ── */}
                <SectionCard title="Thông tin gửi báo giá" icon={Send} iconBg="bg-blue-100" iconColor="text-blue-600">

                    {/* Số đơn mua */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Số Đơn<span className="text-rose-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.soDonMua}
                                onChange={(e) => setFormData(prev => ({ ...prev, soDonMua: e.target.value }))}
                                placeholder="Nhập hoặc tự sinh mã đơn..."
                                className="h-11 font-mono font-bold text-[#8b6a21] rounded-xl border-slate-200 shadow-sm text-[15px] flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormData(prev => ({ ...prev, soDonMua: generateOrderNumber() }))}
                                className="h-11 w-11 p-0 rounded-xl border-slate-200"
                                title="Tự sinh mã"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[12px] text-slate-400">
                            Mã đơn sẽ được gửi kèm trong email đến nhà cung cấp
                        </p>
                    </div>

                    {/* Nhà cung cấp */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Nhà Cung Cấp <span className="text-rose-500">*</span>
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={loadingSuppliers}
                                    className="w-full h-11 justify-between font-medium rounded-xl border-slate-200 px-4 text-[14px]"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="truncate">
                                            {loadingSuppliers
                                                ? 'Đang tải...'
                                                : selectedSupplier
                                                    ? selectedSupplier.tenNhaCungCap
                                                    : 'Chọn nhà cung cấp...'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[380px] max-h-[320px] overflow-y-auto bg-white rounded-xl shadow-lg"
                                align="start"
                            >
                                {suppliers.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-sm italic">
                                        Không có nhà cung cấp nào
                                    </div>
                                ) : suppliers.map((s) => (
                                    <DropdownMenuItem
                                        key={s.id}
                                        onClick={() => setFormData(prev => ({ ...prev, nhaCungCapId: s.id }))}
                                        className="cursor-pointer p-3 flex flex-col items-start gap-1 rounded-lg mx-1 my-0.5"
                                    >
                                        <span className="font-bold text-slate-800">{s.tenNhaCungCap}</span>
                                        <div className="flex items-center justify-between w-full text-xs text-slate-500">
                                            <span>Mã: {s.maNhaCungCap}</span>
                                            {s.email && <span className="text-slate-400 truncate max-w-[180px]">{s.email}</span>}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Thông tin nhà cung cấp đã chọn */}
                        {selectedSupplier && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 mt-2">
                                <p className="text-[12px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                                    Thông tin nhà cung cấp
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-[13px]">
                                    <div>
                                        <span className="text-slate-500">Người liên hệ:</span>
                                        <p className="font-semibold text-slate-800">{selectedSupplier.nguoiLienHe || '—'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Điện thoại:</span>
                                        <p className="font-semibold text-slate-800 font-mono">{selectedSupplier.soDienThoai || '—'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500">Email:</span>
                                        <p className="font-semibold text-blue-700">{selectedSupplier.email || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lưu ý */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-[13px] text-amber-800">
                            <strong>Lưu ý:</strong> Sau khi gửi, hệ thống sẽ tự động gửi email đến nhà cung cấp
                            và chuyển trạng thái đơn hàng sang <strong>"Đã gửi mail yêu cầu báo giá"</strong>.
                        </p>
                    </div>
                </SectionCard>

                {/* ── Card: Thông tin đơn hàng (readonly) ── */}
                <SectionCard title="Thông tin đơn hàng" icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-600">
                    <div className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kho nhập</p>
                                <p className="font-bold text-slate-800 text-[14px]">{orderData.khoNhap?.tenKho || '—'}</p>
                                <p className="text-[12px] text-slate-500 font-mono">{orderData.khoNhap?.maKho}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Người tạo</p>
                                <p className="font-bold text-slate-800 text-[14px]">{orderData.nguoiTao?.hoTen || '—'}</p>
                                <p className="text-[12px] text-slate-500">{orderData.nguoiTao?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày đặt hàng</p>
                                <p className="font-semibold text-slate-800">{formatDate(orderData.ngayDatHang)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày giao dự kiến</p>
                                <p className="font-semibold text-slate-800">{formatDate(orderData.ngayGiaoDuKien)}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sản phẩm trong đơn</p>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {orderData.chiTietDonMuaHangs?.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-[13px] py-1.5 border-b border-slate-100 last:border-0">
                                        <div className="flex items-center gap-2">
                                            {item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                <img
                                                    src={item.bienTheSanPham.anhBienThe.tepTin.duongDan}
                                                    alt=""
                                                    className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                                    <Package className="h-4 w-4 text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-slate-700">{item.bienTheSanPham?.maSku}</p>
                                                <p className="text-[11px] text-slate-400">{item.bienTheSanPham?.mauSac?.tenMau} - {item.bienTheSanPham?.size?.maSize}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-600">x{item.soLuongDat}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Tổng SP:</span>
                                <span className="font-black text-slate-800">{orderData.chiTietDonMuaHangs?.length || 0}</span>
                            </div>
                        </div>

                        {orderData.ghiChu && (
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ghi chú</p>
                                <p className="text-[13px] text-slate-600 leading-relaxed">{orderData.ghiChu}</p>
                            </div>
                        )}
                    </div>
                </SectionCard>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex justify-end gap-3 pt-2">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/purchase-orders/${id}`)}
                    className="h-11 rounded-xl px-6 font-semibold border-slate-200"
                >
                    Hủy bỏ
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="h-11 rounded-xl px-6 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                >
                    <Send className="h-4 w-4" />
                    Gửi yêu cầu báo giá
                </Button>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-blue-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">
                            Xác nhận gửi yêu cầu báo giá
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 mb-6">
                            Hệ thống sẽ gửi email yêu cầu báo giá đến nhà cung cấp và cập nhật trạng thái đơn hàng.
                        </DialogDescription>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-6 text-[14px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Số đơn:</span>
                                <span className="font-mono font-bold text-[#8b6a21]">{formData.soDonMua}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Nhà cung cấp:</span>
                                <span className="font-bold text-slate-800">{selectedSupplier?.tenNhaCungCap}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Email gửi đến:</span>
                                <span className="font-semibold text-blue-600">{selectedSupplier?.email || '—'}</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={sending}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={confirmSend}
                                disabled={sending}
                                className="h-11 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md w-full sm:w-auto"
                            >
                                {sending
                                    ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang gửi...</>
                                    : <><Send className="h-4 w-4 mr-2" />Xác nhận gửi</>
                                }
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}