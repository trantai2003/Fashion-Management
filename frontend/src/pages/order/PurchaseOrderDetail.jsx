import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Building2,
    Warehouse,
    Calendar,
    User,
    FileText,
    Package,
    Edit,
    CheckCircle,
    XCircle,
    Truck,
    Download,
    Printer,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    ShoppingCart,
    Clock,
    ClipboardList,
    Send,
    CreditCard,
} from "lucide-react";

import purchaseOrderDetailService from '@/services/purchaseOrderDetailService';
import apiClient from '@/services/apiClient';

// ── Shared components for lux-sync layout ──────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col h-full items-stretch">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-bold text-slate-800 text-[14px]">{title}</p>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-5 justify-start">{children}</div>
        </div>
    );
}

function InfoField({ label, value, mono = false, icon: Icon, children }) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                {label}
            </div>
            <div className="flex-1 flex items-start mt-0.5">
                {children ?? (
                    <p className={`text-[14px] font-semibold text-slate-800 ${mono ? "font-mono font-bold tracking-tight" : ""}`}>
                        {value || "—"}
                    </p>
                )}
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────

export default function PurchaseOrderDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    // State management
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog states
    const [approveDialog, setApproveDialog] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Định nghĩa color/icon cho từng trạng thái theo phong cách lux-sync
    const statusConfig = {
        0: {
            label: 'Đã hủy',
            bannerBg: 'bg-rose-50',
            bannerBorder: 'border-rose-200',
            iconBg: 'bg-rose-100',
            iconColor: 'text-rose-600',
            textColor: 'text-rose-800',
            icon: XCircle,
            description: 'Đơn hàng đã bị hủy'
        },
        1: {
            label: 'Chờ duyệt',
            bannerBg: 'bg-amber-50',
            bannerBorder: 'border-amber-200',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            textColor: 'text-amber-800',
            icon: AlertCircle,
            description: 'Đơn hàng đang chờ quản lý phê duyệt'
        },
        2: {
            label: 'Đã duyệt',
            bannerBg: 'bg-blue-50',
            bannerBorder: 'border-blue-200',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800',
            icon: CheckCircle,
            description: 'Đơn hàng đã được duyệt nội bộ'
        },
        3: {
            label: 'Đã gửi mail',
            bannerBg: 'bg-purple-50',
            bannerBorder: 'border-purple-200',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            textColor: 'text-purple-800',
            icon: Send,
            description: 'Đã gửi email yêu cầu đến nhà cung cấp'
        },
        4: {
            label: 'Đã nhận báo giá',
            bannerBg: 'bg-emerald-50',
            bannerBorder: 'border-emerald-200',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            textColor: 'text-emerald-800',
            icon: FileText,
            description: 'Nhà cung cấp đã xác nhận và gửi báo giá'
        },
        5: {
            label: 'Đã thanh toán',
            bannerBg: 'bg-teal-50',
            bannerBorder: 'border-teal-200',
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            textColor: 'text-teal-800',
            icon: CreditCard,
            description: 'Đã chấp nhận báo giá và hoàn thành thanh toán'
        },
        6: {
            label: 'Từ chối báo giá của nhà cung cấp',
            bannerBg: 'bg-orange-50',
            bannerBorder: 'border-orange-200',
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            textColor: 'text-orange-800',
            icon: AlertCircle,
            description: 'Báo giá từ nhà cung cấp không đáp ứng yêu cầu'
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Fetch order detail
    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const result = await purchaseOrderDetailService.getById(id);
            if (result && result.status === 200 && result.data) {
                setOrderData(result.data);
            }
        } catch (error) {
            console.error('Error fetching order detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (id) {
            fetchOrderDetail();
        }
    }, [id]);

    // Handle approve order
    const handleApproveOrder = async () => {
        setActionLoading(true);
        try {
            await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${id}/2`);
            toast.success('Đơn hàng đã được duyệt thành công');
            await fetchOrderDetail();
            setApproveDialog(false);
        } catch (error) {
            console.error('Error approving order:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi duyệt đơn hàng. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle cancel order
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error('Vui lòng nhập lý do hủy');
            return;
        }

        setActionLoading(true);
        try {
            await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${id}/0`, { 
                reason: cancelReason 
            });
            toast.success('Đơn hàng đã được hủy thành công');
            await fetchOrderDetail();
            setCancelDialog(false);
            setCancelReason('');
        } catch (error) {
            console.error('Error canceling order:', error);
            toast.error(error.response?.data?.message || 'Lỗi khi hủy đơn hàng. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle export
    const handleExport = () => {
        console.log('Export order:', id);
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Package className="h-8 w-8 animate-bounce text-violet-600" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải dữ liệu đơn hàng...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 lux-sync">
                <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 w-full max-w-md">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-slate-600 mb-6">Không tìm thấy đơn đặt mua hàng</p>
                    <Button
                        onClick={() => navigate('/purchase-orders')}
                        className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-white hover:text-slate-900 shadow-md rounded-xl h-12"
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const currentStatus = statusConfig[orderData.trangThai] || statusConfig[0];
    const StatusIcon = currentStatus.icon;

    return (
        <div className="p-6 md:p-8 pb-24 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync">

            {/* ── Top Header and Navigation ── */}
            <div className="flex flex-col gap-4 mb-2">
                <button
                    type="button"
                    onClick={() => navigate("/purchase-orders")}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-violet-600 transition-colors duration-200 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách đơn hàng
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200/60 shrink-0">
                            <ClipboardList className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-3">
                                Chi tiết đơn đặt mua
                            </h1>
                            <p className="mt-1 text-[15px] font-medium text-slate-500">
                                Mã đơn: <span className="font-mono text-violet-700 font-bold bg-violet-100/50 px-2 py-0.5 rounded border border-violet-200/50">{orderData.soDonMua}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            className="h-11 px-5 rounded-xl bg-white border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-sm"
                            onClick={handlePrint}
                        >
                            <Printer className="mr-2 h-4 w-4 text-slate-500" />
                            In đơn
                        </Button>
                        <Button
                            variant="outline"
                            className="h-11 px-5 rounded-xl bg-white border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 shadow-sm"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4 text-slate-500" />
                            Xuất file
                        </Button>

                        {orderData.trangThai === 1 && (
                            <>
                                <Button
                                    variant="outline"
                                    className="h-11 px-5 rounded-xl border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 font-bold transition-all duration-200 shadow-sm"
                                    onClick={() => setCancelDialog(true)}
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Hủy đơn
                                </Button>
                                <Button
                                    className="h-11 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all duration-200 shadow-md shadow-emerald-600/20"
                                    onClick={() => setApproveDialog(true)}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Phê duyệt
                                </Button>
                            </>
                        )}
                        {orderData.trangThai === 2 && (
                            <Button
                                className="h-11 px-6 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all duration-200 shadow-md shadow-violet-600/20"
                                onClick={() => navigate(`/purchase-orders/${id}/receive`)}
                            >
                                <Package className="mr-2 h-4 w-4" />
                                Nhập hàng
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Status Banner ── */}
            <div className={`rounded-2xl p-6 md:p-8 shadow-sm border ${currentStatus.bannerBg} ${currentStatus.bannerBorder} flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden`}>
                {/* Decorative background blur */}
                <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full ${currentStatus.iconBg} blur-3xl opacity-50 pointer-events-none`}></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${currentStatus.iconBg} shadow-inner border border-white/40 shrink-0`}>
                        <StatusIcon className={`h-8 w-8 ${currentStatus.iconColor}`} />
                    </div>
                    <div>
                        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${currentStatus.textColor}`}>
                            {currentStatus.label}
                        </h2>
                        <p className={`mt-1.5 text-[15px] font-medium opacity-80 ${currentStatus.textColor}`}>
                            {currentStatus.description}
                        </p>
                    </div>
                </div>

                <div className="relative z-10 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/60 shadow-sm ml-auto text-right">
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng giá trị đơn hàng</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {formatCurrency(orderData.tongTien)}
                    </p>
                </div>
            </div>

            {/* ── Info Cards Grid (4 columns) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {/* Order Info */}
                <SectionCard title="Thông tin đơn hàng" icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-600">
                    <InfoField label="Ngày đặt hàng" icon={Calendar}>
                        <span className="font-semibold text-slate-800">{formatDateTime(orderData.ngayDatHang)}</span>
                    </InfoField>
                    <InfoField label="Ngày giao dự kiến" icon={Truck}>
                        <span className="font-semibold text-slate-800">{formatDate(orderData.ngayGiaoDuKien)}</span>
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Ghi chú">
                        <span className="text-[14px] text-slate-600 leading-relaxed block bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                            {orderData.ghiChu || <span className="italic text-slate-400">Không có ghi chú</span>}
                        </span>
                    </InfoField>
                </SectionCard>

                {/* Supplier Info */}
                <SectionCard title="Nhà cung cấp" icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600">
                    <InfoField label="Tên nhà cung cấp">
                        <div className="font-bold text-slate-900">{orderData.nhaCungCap?.tenNhaCungCap}</div>
                        <div className="mt-1">
                            <span className="inline-flex font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {orderData.nhaCungCap?.maNhaCungCap}
                            </span>
                        </div>
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Người liên hệ" icon={User} value={orderData.nhaCungCap?.nguoiLienHe} />
                    <InfoField label="Số điện thoại" icon={Phone} mono value={orderData.nhaCungCap?.soDienThoai} />
                    <InfoField label="Email" icon={Mail} value={orderData.nhaCungCap?.email} />
                </SectionCard>

                {/* Warehouse Info */}
                <SectionCard title="Kho nhập hàng" icon={Warehouse} iconBg="bg-amber-100" iconColor="text-amber-600">
                    <InfoField label="Tên kho">
                        <div className="font-bold text-slate-900">{orderData.khoNhap?.tenKho}</div>
                        <div className="mt-1">
                            <span className="inline-flex font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                {orderData.khoNhap?.maKho}
                            </span>
                        </div>
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Quản lý kho" icon={User} value={orderData.khoNhap?.quanLy?.hoTen} />
                    <InfoField label="Địa chỉ" icon={MapPin}>
                        <span className="text-[14px] text-slate-700 leading-snug block line-clamp-2" title={orderData.khoNhap?.diaChi}>
                            {orderData.khoNhap?.diaChi || "—"}
                        </span>
                    </InfoField>
                </SectionCard>

                {/* Processing Info */}
                <SectionCard title="Thông tin xử lý" icon={User} iconBg="bg-emerald-100" iconColor="text-emerald-600">
                    <InfoField label="Người tạo" icon={CheckCircle}>
                        <div className="font-semibold text-slate-900">{orderData.nguoiTao?.hoTen}</div>
                        <div className="text-[13px] text-slate-500 mt-0.5" title={orderData.nguoiTao?.email}>{orderData.nguoiTao?.email}</div>
                    </InfoField>

                    {orderData.nguoiDuyet && (
                        <>
                            <Separator className="bg-slate-100" />
                            <InfoField label="Người duyệt" icon={CheckCircle}>
                                <div className="font-semibold text-slate-900">{orderData.nguoiDuyet?.hoTen}</div>
                                <div className="text-[13px] text-slate-500 mt-0.5" title={orderData.nguoiDuyet?.email}>{orderData.nguoiDuyet?.email}</div>
                            </InfoField>
                        </>
                    )}

                    <Separator className="bg-slate-100" />
                    <InfoField label="Lịch sử gian" icon={Clock}>
                        <div className="space-y-2 mt-1">
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-slate-500">Tạo:</span>
                                <span className="font-medium text-slate-800">{formatDateTime(orderData.ngayTao)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-slate-500">Cập nhật:</span>
                                <span className="font-medium text-slate-800">{formatDateTime(orderData.ngayCapNhat)}</span>
                            </div>
                        </div>
                    </InfoField>
                </SectionCard>
            </div>

            {/* ── Main Product Table ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Danh sách sản phẩm</h2>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 h-12 w-[350px]">Sản phẩm</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">Màu sắc</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">Size</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">Chất liệu</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-right h-12">
                                    {orderData.trangThai >= 4 ? 'Đơn giá (NCC báo)' : 'Đơn giá dự kiến'}
                                </TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">SL đặt</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">SL nhận</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-right h-12 pr-6">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderData.chiTietDonMuaHangs && orderData.chiTietDonMuaHangs.length > 0 ? (
                                orderData.chiTietDonMuaHangs.map((item, index) => (
                                    <TableRow key={item.id || index} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                {item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                    <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shadow-sm shrink-0">
                                                        <img
                                                            src={item.bienTheSanPham.anhBienThe.tepTin.duongDan}
                                                            alt="Product"
                                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                        <Package className="h-6 w-6 text-slate-300" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[15px] text-slate-900 leading-tight">
                                                        {item.bienTheSanPham?.maSku}
                                                    </p>
                                                    <p className="text-[13px] text-slate-500 font-medium mt-1 uppercase tracking-wider flex items-center gap-1">
                                                        Mã Vạch: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{item.bienTheSanPham?.maVachSku}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div
                                                    className="h-5 w-5 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: item.bienTheSanPham?.mauSac?.maMauHex }}
                                                    title={item.bienTheSanPham?.mauSac?.tenMau}
                                                />
                                                <span className="text-[14px] font-semibold text-slate-700">{item.bienTheSanPham?.mauSac?.tenMau}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-[13px] border border-slate-200">
                                                {item.bienTheSanPham?.size?.maSize}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center py-4 text-[14px] font-medium text-slate-600">
                                            {item.bienTheSanPham?.chatLieu?.tenChatLieu}
                                        </TableCell>
                                        <TableCell className="text-right py-4 font-semibold text-[15px]">
                                            {item.donGia > 0 ? (
                                                <span className={orderData.trangThai >= 4 ? "text-emerald-600 font-bold" : "text-slate-900"}>
                                                    {formatCurrency(item.donGia)}
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 italic text-[13px] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">Chưa báo giá</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className="inline-flex h-8 min-w-[2.5rem] px-3 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/50">
                                                {item.soLuongDat}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <span className="inline-flex h-8 min-w-[2.5rem] px-3 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/50">
                                                {item.soLuongDaNhan || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right py-4 font-black text-violet-700 text-[16px] pr-6">
                                            {item.thanhTien > 0 ? formatCurrency(item.thanhTien) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                <Package className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-semibold text-slate-500">Chưa có sản phẩm nào được thiết lập</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Summary Block */}
                <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100 mt-auto">
                    <div className="flex flex-col sm:flex-row justify-end gap-8">
                        <div className="w-full sm:w-80 space-y-4">
                            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm">
                                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wide">Tổng Mua:</span>
                                <span className="font-black text-slate-800 text-[16px]">
                                    {orderData.chiTietDonMuaHangs?.reduce((sum, item) => sum + item.soLuongDat, 0) || 0} <span className="text-slate-400 font-semibold text-sm">SP</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm">
                                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wide">Tổng Nhận:</span>
                                <span className="font-black text-emerald-600 text-[16px]">
                                    {orderData.chiTietDonMuaHangs?.reduce((sum, item) => sum + (item.soLuongDaNhan || 0), 0) || 0} <span className="text-emerald-600/60 font-semibold text-sm">SP</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dialogs ── */}
            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-emerald-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">
                            Xác nhận phê duyệt
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 leading-relaxed mb-6">
                            Bạn có chắc chắn muốn phê duyệt đơn đặt mua hàng <span className="font-bold text-slate-900 border-b border-slate-300 pb-0.5">{orderData.soDonMua}</span>? Hành động này sẽ chuyển đơn sang trạng thái Đã duyệt.
                        </DialogDescription>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => setApproveDialog(false)}
                                disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold border-slate-200 hover:bg-slate-50"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={handleApproveOrder}
                                disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận phê duyệt'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-rose-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">
                            Hủy đơn mua hàng
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 leading-relaxed mb-4">
                            Đơn hàng <span className="font-bold text-slate-900 border-b border-slate-300 pb-0.5">{orderData.soDonMua}</span> sẽ bị hủy nội bộ. Bạn bắt buộc phải cung cấp lý do.
                        </DialogDescription>

                        <div className="mb-6">
                            <Label htmlFor="cancelReason" className="text-[14px] font-bold text-slate-700 mb-2 block">
                                Lý do hủy <span className="text-rose-500">*</span>
                            </Label>
                            <Textarea
                                id="cancelReason"
                                placeholder="Nhập chi tiết lý do..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="min-h-[100px] resize-y rounded-xl border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-[14px] p-4 shadow-sm"
                            />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCancelDialog(false);
                                    setCancelReason('');
                                }}
                                disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold border-slate-200 hover:bg-slate-50"
                            >
                                Đóng
                            </Button>
                            <Button
                                onClick={handleCancelOrder}
                                disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Tiến hành hủy'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}