import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowLeft, Building2, Warehouse, Calendar, User, FileText, Package,
    CheckCircle, XCircle, Printer, AlertCircle, Phone, Mail,
    MapPin, ShoppingCart, Clock, Send, CreditCard, DollarSign, ListChecks,
    Eye, Loader2, Ship
} from "lucide-react";

import apiClient from '@/services/apiClient';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
};

function parseJwt(token) {
    try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); }
    catch { return null; }
}

function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
}

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ─── Status configs (Đồng bộ với List) ─────────────────────────────────────────
const PR_STATUS = {
    3: { label: 'Đã gửi yêu cầu báo giá', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText, desc: 'Yêu cầu này đã được tạo thành các đơn báo giá để gửi NCC.' },
    5: { label: 'Đã chuyển thành đơn mua hàng', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Ship, desc: 'Đã chốt báo giá, đơn hàng đang được tiến hành xử lý/vận chuyển.' },
};

const PO_STATUS = {
    0: { label: 'Đã xoá', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
    1: { label: 'Đã gửi YC báo giá', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Send },
    2: { label: 'Đã nhận báo giá', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
    3: { label: 'Đã chuyển thành đơn mua hàng', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: CheckCircle },
    4: { label: 'Từ chối báo giá', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: XCircle },
    5: { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CreditCard },
};

function getPaymentTooltip(trangThai) {
    switch (trangThai) {
        case 0: return 'Đơn đã bị xoá, không thể thanh toán';
        case 1: return 'Chưa nhận báo giá từ NCC, không thể thanh toán';
        case 2: return 'Chưa duyệt báo giá, không thể thanh toán';
        case 3: return 'Thanh toán đơn mua hàng';
        case 4: return 'Báo giá đã bị từ chối, không thể thanh toán';
        case 5: return 'Đơn đã được thanh toán rồi';
        default: return 'Không thể thanh toán';
    }
}

// ── Shared components ──────────────────────────────────────────────────────────
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

export default function QuotationRequestDetail() {
    const navigate = useNavigate();
    const { id } = useParams(); // ID Yêu cầu mua hàng

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // States Dialog 
    const [acceptDialog, setAcceptDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approvingPo, setApprovingPo] = useState(null); // Lưu ID của đơn PO đang được chọn duyệt/từ chối

    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const result = await apiClient.get(`/api/v1/yeu-cau-mua-hang/get-by-id/${id}`);
            if (result && result.data?.data) {
                setOrderData(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching quotation detail:', error);
            toast.error('Không thể tải chi tiết yêu cầu báo giá');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrderDetail();
    }, [id]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const payload = parseJwt(token);
                if (!payload || !payload.id) return;
                const userResponse = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
                const userData = userResponse.data?.data;
                if (userData?.vaiTro) setUserRoles(parseRoles(userData.vaiTro));
            } catch (error) {
                console.error('Error fetching user info:', error);
            } finally {
                setLoadingAuth(false);
            }
        };
        fetchUserInfo();
    }, []);

    // ── Hàm xử lý Duyệt/Từ chối cho từng Báo giá (PO) ──
    const handlePoAction = async (poId, trangThai) => {
        if (trangThai === 4 && !rejectReason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
        }
        setActionLoading(true);
        try {
            await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${poId}/${trangThai}`);
            toast.success(trangThai === 3 ? 'Đã chấp nhận báo giá thành công!' : 'Đã từ chối báo giá!');
            setAcceptDialog(false);
            setRejectDialog(false);
            setApprovingPo(null);
            setRejectReason('');
            await fetchOrderDetail(); // Tải lại data để cập nhật bảng
        } catch (error) {
            console.error('Error action:', error);
            toast.error('Không thể thực hiện thao tác. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 lux-sync">
                <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 w-full max-w-md">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-slate-600 mb-6">Không tìm thấy dữ liệu yêu cầu</p>
                    <Button onClick={() => navigate('/quotation-requests')}
                        className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-white hover:text-slate-900 shadow-md rounded-xl h-12">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const currentStatus = PR_STATUS[orderData.trangThai] || { label: 'Không rõ', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Clock, desc: '' };
    const StatusIcon = currentStatus.icon;
    
    // Quyền: Nhân viên mua hàng hoặc Quản trị viên
    const canApprove = userRoles.includes(ROLE.NHAN_VIEN_MUA_HANG) || userRoles.includes(ROLE.QUAN_TRI_VIEN);

    // Tính tổng tiền các báo giá đã được chấp nhận
    const acceptedTotal = (orderData.donMuaHangs || [])
        .filter(po => po.trangThai === 3 || po.trangThai === 5)
        .reduce((sum, po) => sum + (Number(po.tongTien) || 0), 0);

    return (
        <div className="p-6 md:p-8 pb-24 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-[calc(100vh-64px)] lux-sync">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4 mb-2">
                <button type="button" onClick={() => navigate('/quotation-requests')}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors duration-200 w-fit">
                    <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div>
                            <p className="mt-1 text-[15px] font-medium text-slate-500">
                                <span className="font-mono text-blue-700 font-bold bg-blue-100/50 px-2 py-0.5 rounded border border-blue-200/50">{orderData.soYeuCauMuaHang || `#${id}`}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="h-11 px-5 rounded-xl bg-white border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 shadow-sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4 text-slate-500" /> In thông tin
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Status Banner ── */}
            <div className={`rounded-2xl p-6 md:p-8 shadow-sm border ${currentStatus.color} flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full bg-white/40 blur-3xl pointer-events-none`} />
                <div className="flex items-center gap-5 relative z-10">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 shadow-inner border border-white/40 shrink-0`}>
                        <StatusIcon className="h-8 w-8 text-current opacity-80" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">{currentStatus.label}</h2>
                        <p className="mt-1.5 text-[15px] font-medium opacity-80 text-slate-700">{currentStatus.desc}</p>
                    </div>
                </div>
                
                <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/60 shadow-sm ml-auto text-right min-w-[200px]">
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng giá trị chốt</p>
                    <p className={`text-2xl sm:text-3xl font-black tracking-tight ${acceptedTotal > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {acceptedTotal > 0 ? formatCurrency(acceptedTotal) : 'Chưa có'}
                    </p>
                </div>
            </div>

            {/* ── Info Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                <SectionCard title="Thông tin yêu cầu" icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-600">
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Ngày tạo YC" icon={Calendar}>
                            <span className="font-semibold text-slate-800">{formatDateTime(orderData.ngayTao)}</span>
                        </InfoField>
                        <InfoField label="Ngày giao dự kiến" icon={Clock}>
                            <span className="font-semibold text-slate-800">{formatDate(orderData.ngayGiaoDuKien)}</span>
                        </InfoField>
                        <InfoField label="Người tạo" icon={User}>
                            <span className="font-semibold text-slate-800">{orderData.nguoiTao?.hoTen || '—'}</span>
                        </InfoField>
                        <InfoField label="Tổng sản phẩm" icon={Package}>
                            <span className="font-bold text-blue-600">{orderData.chiTietYeuCauMuaHangs?.length || 0} biến thể</span>
                        </InfoField>
                    </div>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Ghi chú từ kho">
                        <span className="text-[14px] text-slate-600 leading-relaxed block bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                            {orderData.ghiChu || <span className="italic text-slate-400">Không có ghi chú</span>}
                        </span>
                    </InfoField>
                </SectionCard>

                <SectionCard title="Địa điểm nhận hàng" icon={Warehouse} iconBg="bg-amber-100" iconColor="text-amber-600">
                    <InfoField label="Tên kho">
                        <div className="font-bold text-slate-900">{orderData.khoNhap?.tenKho || '—'}</div>
                        {orderData.khoNhap?.maKho && (
                            <div className="mt-1">
                                <span className="inline-flex font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                    {orderData.khoNhap.maKho}
                                </span>
                            </div>
                        )}
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Người quản lý kho" icon={User} value={orderData.khoNhap?.quanLy?.hoTen || '—'} />
                    <InfoField label="Địa chỉ" icon={MapPin}>
                        <span className="text-[14px] text-slate-700 leading-snug block line-clamp-2">{orderData.khoNhap?.diaChi || "—"}</span>
                    </InfoField>
                </SectionCard>
            </div>

            {/* ── Table 1: Sản phẩm cần mua (Từ Yêu Cầu Gốc) ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                        <Package className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Sản phẩm yêu cầu (Gốc)</h2>
                </div>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200 sticky top-0 z-10">
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 h-11 w-[350px]">Sản phẩm</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-11">Màu sắc</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-11">Size</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-11">Số lượng cần mua</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(orderData.chiTietYeuCauMuaHangs || []).map((item, index) => (
                                <TableRow key={item.id || index} className="hover:bg-slate-50 border-b border-slate-100 group">
                                    <TableCell className="py-3">
                                        <div className="flex items-center gap-3">
                                            {item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shadow-sm shrink-0">
                                                    <img src={item.bienTheSanPham.anhBienThe.tepTin.duongDan} alt="Product" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                    <Package className="h-5 w-5 text-slate-300" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-[14px] text-slate-900 leading-tight">
                                                    {item.bienTheSanPham?.tenSanPham || item.bienTheSanPham?.tenBienThe || item.bienTheSanPham?.maSku}
                                                </p>
                                                <p className="text-[12px] text-slate-500 font-medium mt-1 uppercase tracking-wider flex items-center gap-1">
                                                    Mã: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{item.bienTheSanPham?.maSku}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: item.bienTheSanPham?.mauSac?.maMauHex }} title={item.bienTheSanPham?.mauSac?.tenMau} />
                                            <span className="text-[13px] font-semibold text-slate-700">{item.bienTheSanPham?.mauSac?.tenMau}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-md bg-slate-100 text-slate-800 font-bold text-[12px] border border-slate-200">
                                            {item.bienTheSanPham?.size?.maSize}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center py-3">
                                        <span className="inline-flex h-8 min-w-[2.5rem] px-3 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-black border border-blue-200/50">
                                            {item.soLuongDat}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Table 2: Các Báo giá từ Nhà Cung Cấp ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <ListChecks className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Danh sách Báo giá từ Nhà cung cấp</h2>
                    </div>
                    <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[13px]">
                        {orderData.donMuaHangs?.length || 0} báo giá
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 h-12 w-[160px] pl-6">Mã Báo Giá</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 text-left h-12">Nhà cung cấp</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 text-left h-12">Ngày gửi</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 text-left h-12">Hạn chót</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 text-center h-12">Trạng thái</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 text-right h-12">Tổng tiền (NCC báo)</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wider text-slate-500 text-center h-12 w-[140px] pr-6">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderData.donMuaHangs?.length > 0 ? (
                                orderData.donMuaHangs.map((po) => {
                                    const cfg = PO_STATUS[po.trangThai] ?? { label: 'Không rõ', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock };
                                    const StatusIcon = cfg.icon;
                                    const isAccepted = po.trangThai === 3 || po.trangThai === 5;
                                    const showApproveActions = po.trangThai === 2;
                                    const canPay = po.trangThai === 3;

                                    return (
                                        <TableRow key={po.id} className="hover:bg-slate-50 border-b border-slate-100 group cursor-pointer" onClick={() => navigate(`/quotation/${po.id}`)}>
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <span className="font-bold text-[13px] text-slate-800 group-hover:text-blue-600 transition-colors">{po.soDonMua?.replace(/^PO/, 'Q-')}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <p className="font-semibold text-[14px] text-slate-900">{po.nhaCungCap?.tenNhaCungCap}</p>
                                                <p className="text-[12px] text-slate-500 font-mono mt-0.5">{po.nhaCungCap?.maNhaCungCap}</p>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(po.ngayDatHang)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(po.ngayGiaoDuKien)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${cfg.color}`}>
                                                    <StatusIcon className="h-3.5 w-3.5" /> {cfg.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right py-4">
                                                <span className={`font-black text-[15px] ${isAccepted ? 'text-emerald-600' : 'text-slate-800'}`}>
                                                    {formatCurrency(po.tongTien)}
                                                </span>
                                                {isAccepted && <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Đã chốt</p>}
                                            </TableCell>
                                            <TableCell className="text-center pr-6 py-4" onClick={e => e.stopPropagation()}>
                                                <TooltipProvider>
                                                    <div className="flex items-center justify-center gap-0.5">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                                                    onClick={() => navigate(`/quotation/${po.id}`)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Xem chi tiết báo giá</p></TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span tabIndex={canPay ? undefined : 0}>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                                                                        disabled={!canPay}
                                                                        onClick={(e) => { e.stopPropagation(); navigate(`/purchase-orders/${po.id}/payment`); }}>
                                                                        <CreditCard className={`h-4 w-4 ${canPay ? 'text-blue-600' : 'text-slate-300'}`} />
                                                                    </Button>
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>{getPaymentTooltip(po.trangThai)}</p></TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-semibold text-slate-500">Chưa có báo giá nào từ nhà cung cấp</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Accept Dialog ── */}
            <AlertDialog open={acceptDialog} onOpenChange={(open) => !open && setAcceptDialog(false)}>
                <AlertDialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-emerald-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-white m-0">Xác nhận chấp nhận báo giá</AlertDialogTitle>
                    </div>
                    <div className="p-6">
                        <AlertDialogDescription className="text-[15px] text-slate-600 leading-relaxed mb-6">
                            Bạn có chắc chắn muốn chấp nhận báo giá cho đơn hàng này?
                            Hành động này sẽ chốt mức giá và nhà cung cấp sẽ tiến hành giao hàng.
                        </AlertDialogDescription>
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel disabled={actionLoading} onClick={() => { setAcceptDialog(false); setApprovingPo(null); }}
                                className="h-11 rounded-xl font-semibold border-slate-200 m-0">Hủy bỏ</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handlePoAction(approvingPo, 3)} disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md m-0">
                                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Chấp nhận báo giá
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Reject Dialog ── */}
            <AlertDialog open={rejectDialog} onOpenChange={(open) => !open && setRejectDialog(false)}>
                <AlertDialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-rose-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-white m-0">Từ chối báo giá</AlertDialogTitle>
                    </div>
                    <div className="p-6">
                        <AlertDialogDescription className="text-[15px] text-slate-600 leading-relaxed mb-4">
                            Bạn đang từ chối báo giá của đơn hàng này. Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                        <div className="mb-6">
                            <Label htmlFor="rejectReason" className="text-[13px] font-bold text-slate-700 mb-2 block">
                                Lý do từ chối <span className="text-rose-500">*</span>
                            </Label>
                            <Textarea
                                id="rejectReason"
                                placeholder="Nhập lý do (VD: Giá quá cao, không đúng yêu cầu...)"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-[100px] resize-y rounded-xl border-slate-200 focus:border-rose-500 text-[14px] p-3 shadow-sm"
                            />
                        </div>
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel disabled={actionLoading} onClick={() => { setRejectDialog(false); setRejectReason(''); setApprovingPo(null); }}
                                className="h-11 rounded-xl font-semibold border-slate-200 m-0">Hủy bỏ</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handlePoAction(approvingPo, 4)} disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md m-0">
                                {actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                Xác nhận từ chối
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}