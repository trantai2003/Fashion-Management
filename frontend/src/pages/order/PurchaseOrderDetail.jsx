import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowLeft, Building2, Warehouse, Calendar, User, FileText, Package,
    CheckCircle, XCircle, Printer, AlertCircle, Phone, Mail,
    MapPin, ShoppingCart, Clock, Send, CreditCard, DollarSign, PackagePlus,
    Loader2, Ship
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

// ─── Status configs ────────────────────────────────────────────────────────────
const PO_STATUS = {
    3: { label: 'Đang vận chuyển', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, desc: 'Đơn hàng đang chờ nhà cung cấp vận chuyển đến kho.' },
    5: { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CreditCard, desc: 'Đơn hàng đã được thanh toán hoàn tất.' },
};

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
            <div className="p-5 flex-1 flex flex-col gap-4 justify-start">{children}</div>
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

export default function PurchaseOrderDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const result = await apiClient.get(`/api/v1/don-mua-hang/get-by-id/${id}`);
            if (result && result.data?.data) {
                setOrderData(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching PO detail:', error);
            toast.error('Không thể tải chi tiết đơn mua hàng');
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
                setLoadingAuth(true);
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

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                    <p className="text-slate-600 mb-6">Không tìm thấy Đơn mua hàng</p>
                    <Button onClick={() => navigate('/purchase-orders')}
                        className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-white hover:text-slate-900 shadow-md rounded-xl h-12">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const currentStatus = PO_STATUS[orderData.trangThai] || { label: 'Không rõ', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Clock, desc: '' };
    const StatusIcon = currentStatus.icon;

    // Phân quyền hiển thị nút
    const canCreateReceipt = userRoles.includes(ROLE.QUAN_TRI_VIEN) || userRoles.includes(ROLE.QUAN_LY_KHO) || userRoles.includes(ROLE.NHAN_VIEN_KHO);

    // Kiểm tra xem đã nhận đủ hàng chưa
    const isFullyReceived = orderData.chiTietDonMuaHangs?.every(
        ct => (ct.soLuongDaNhan || 0) >= (ct.soLuongDat || 0)
    ) && orderData.chiTietDonMuaHangs?.length > 0;

    return (
        <div className="p-6 md:p-8 pb-24 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-[calc(100vh-64px)] lux-sync">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4 mb-2">
                <button type="button" onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-blue-600 transition-colors duration-200 w-fit">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div>
                            <p className="mt-1 text-[15px] font-medium text-slate-500 flex items-center gap-2">
                                <span className="font-mono text-blue-700 font-bold bg-blue-100/50 px-2 py-0.5 rounded border border-blue-200/50">{orderData.soDonMua || '—'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="h-11 px-5 rounded-xl bg-white border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 shadow-sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4 text-slate-500" /> In đơn hàng
                        </Button>

                        {/* ── Action Buttons ── */}
                        {!loadingAuth && (
                            <TooltipProvider>
                                <div className="flex items-center gap-2">
                                    {orderData.trangThai === 3 && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                                                    onClick={() => navigate(`/purchase-orders/${orderData.id}/payment`)}>
                                                    <CreditCard className="mr-2 h-4 w-4" /> Thanh toán
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Thanh toán cho nhà cung cấp</p></TooltipContent>
                                        </Tooltip>
                                    )}

                                    {canCreateReceipt && (orderData.trangThai === 3 || orderData.trangThai === 5) && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={isFullyReceived}
                                                        onClick={() => navigate(`/goods-receipts/create?poId=${orderData.id}`)}>
                                                        <PackagePlus className="mr-2 h-4 w-4" /> Tạo phiếu nhập kho
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{isFullyReceived ? 'Đã nhập đủ số lượng hàng' : 'Tiến hành nhập hàng vào kho'}</p></TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </TooltipProvider>
                        )}
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

                <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/60 shadow-sm ml-auto text-right min-w-[220px]">
                    <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tổng tiền cần thanh toán</p>
                    <p className={`text-2xl sm:text-3xl font-black tracking-tight ${orderData.trangThai === 5 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {formatCurrency(orderData.tongTien)}
                    </p>
                </div>
            </div>

            {/* ── Info Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <SectionCard title="Thông tin đơn hàng" icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-600">
                    <InfoField label="Ngày tạo đơn" icon={Calendar}>
                        <span className="font-semibold text-slate-800">{formatDateTime(orderData.ngayTao)}</span>
                    </InfoField>
                    <InfoField label="Ngày giao dự kiến" icon={Clock}>
                        <span className="font-semibold text-slate-800">{formatDate(orderData.ngayGiaoDuKien)}</span>
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Yêu cầu mua hàng gốc" icon={FileText}>
                        {orderData.yeuCauMuaHang?.soYeuCauMuaHang ? (
                            <span className="font-bold text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/purchase-requests/${orderData.yeuCauMuaHang?.id}`)}>
                                {orderData.yeuCauMuaHang.soYeuCauMuaHang}
                            </span>
                        ) : (
                            <span className="text-slate-400 italic">Không có dữ liệu</span>
                        )}
                    </InfoField>
                </SectionCard>

                <SectionCard title="Nhà cung cấp" icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600">
                    {orderData.nhaCungCap ? (
                        <>
                            <InfoField label="Tên nhà cung cấp">
                                <div className="font-bold text-slate-900">{orderData.nhaCungCap.tenNhaCungCap}</div>
                                <div className="mt-1">
                                    <span className="inline-flex font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                        {orderData.nhaCungCap.maNhaCungCap}
                                    </span>
                                </div>
                            </InfoField>
                            <Separator className="bg-slate-100" />
                            <InfoField label="Người liên hệ" icon={User} value={orderData.nhaCungCap.nguoiLienHe} />
                            <InfoField label="Số điện thoại" icon={Phone} mono value={orderData.nhaCungCap.soDienThoai} />
                            <InfoField label="Email" icon={Mail} value={orderData.nhaCungCap.email} />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                            <Building2 className="h-8 w-8 opacity-30" />
                            <p className="text-[13px] font-medium italic">Không có thông tin</p>
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Kho tiếp nhận & Phụ trách" icon={Warehouse} iconBg="bg-amber-100" iconColor="text-amber-600">
                    <InfoField label="Tên kho nhận hàng">
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
                    <InfoField label="Địa chỉ kho" icon={MapPin}>
                        <span className="text-[14px] text-slate-700 leading-snug block line-clamp-2">{orderData.khoNhap?.diaChi || "—"}</span>
                    </InfoField>
                    <InfoField label="Người phụ trách tạo đơn" icon={User}>
                        <div className="font-semibold text-slate-900">{orderData.nguoiTao?.hoTen || '—'}</div>
                        <div className="text-[13px] text-slate-500 mt-0.5">{orderData.nguoiTao?.email}</div>
                    </InfoField>
                </SectionCard>
            </div>

            {/* ── Product Table ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Package className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">Danh sách Sản phẩm Đặt mua</h2>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 h-12 w-[350px] pl-6">Sản phẩm</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">Màu sắc</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">Size</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">SL Đặt</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">SL Đã Nhận</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-right h-12">Đơn giá</TableHead>
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-right h-12 pr-6">Thành tiền</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderData.chiTietDonMuaHangs?.length > 0 ? (
                                orderData.chiTietDonMuaHangs.map((item, index) => {
                                    const isItemReceived = (item.soLuongDaNhan || 0) >= item.soLuongDat;
                                    return (
                                        <TableRow key={item.id || index} className="hover:bg-slate-50 border-b border-slate-100 group">
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-4">
                                                    {item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                        <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shadow-sm shrink-0">
                                                            <img src={item.bienTheSanPham.anhBienThe.tepTin.duongDan} alt="Product"
                                                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                            <Package className="h-6 w-6 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-[14px] text-slate-900 leading-tight">
                                                            {item.bienTheSanPham?.tenSanPham || item.bienTheSanPham?.tenBienThe || item.bienTheSanPham?.maSku}
                                                        </p>
                                                        <p className="text-[12px] text-slate-500 font-medium mt-1 uppercase tracking-wider flex items-center gap-1">
                                                            Mã: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{item.bienTheSanPham?.maSku}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="h-4 w-4 rounded-full border border-slate-200 shadow-sm"
                                                        style={{ backgroundColor: item.bienTheSanPham?.mauSac?.maMauHex }}
                                                        title={item.bienTheSanPham?.mauSac?.tenMau} />
                                                    <span className="text-[13px] font-semibold text-slate-700">{item.bienTheSanPham?.mauSac?.tenMau}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <span className="inline-flex items-center justify-center min-w-[2rem] h-6 px-2 rounded-md bg-slate-100 text-slate-800 font-bold text-[12px] border border-slate-200">
                                                    {item.bienTheSanPham?.size?.maSize}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <span className="inline-flex h-8 min-w-[2.5rem] px-3 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/50">
                                                    {item.soLuongDat}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center py-4">
                                                <span className={`inline-flex h-8 min-w-[2.5rem] px-3 items-center justify-center rounded-lg font-bold border ${isItemReceived ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-amber-50 text-amber-700 border-amber-200/50'}`}>
                                                    {item.soLuongDaNhan || 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right py-4 font-semibold text-[15px] text-slate-800">
                                                {formatCurrency(item.donGia)}
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-6">
                                                <span className="font-black text-slate-800 text-[16px]">
                                                    {formatCurrency(item.thanhTien)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                                                <Package className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="font-semibold text-slate-500">Chưa có sản phẩm nào</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-slate-50 p-6 sm:p-8 border-t border-slate-100">
                    <div className="flex justify-end">
                        <div className="w-full sm:w-96 space-y-4">
                            <div className="flex justify-between items-center px-4 py-1">
                                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wide">Tổng số lượng Đặt:</span>
                                <span className="font-bold text-slate-800 text-[16px]">
                                    {orderData.chiTietDonMuaHangs?.reduce((sum, item) => sum + item.soLuongDat, 0) || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center bg-white px-5 py-4 rounded-xl border border-slate-200/60 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                    <span className="text-[14px] text-slate-700 font-bold uppercase tracking-wide">Tổng cộng:</span>
                                </div>
                                <span className="font-black text-blue-600 text-[22px]">
                                    {formatCurrency(orderData.tongTien)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}