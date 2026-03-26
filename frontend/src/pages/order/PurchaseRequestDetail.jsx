import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ArrowLeft, Warehouse, Calendar, User, FileText, Package,
    CheckCircle, XCircle, Download, Printer, AlertCircle,
    MapPin, ShoppingCart, Clock, ClipboardList, Send
} from "lucide-react";

import purchaseRequestService from '@/services/purchaseRequestService';
import apiClient from '@/services/apiClient';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
};

// Phê duyệt/Từ chối: Chỉ Quản trị viên và Quản lý kho
const APPROVE_ROLES = [ROLE.QUAN_TRI_VIEN, ROLE.QUAN_LY_KHO];
// Gửi báo giá: Quản trị viên và Nhân viên mua hàng
const QUOTATION_ROLES = [ROLE.QUAN_TRI_VIEN, ROLE.NHAN_VIEN_MUA_HANG];

function parseJwt(token) {
    try {
        const b64 = token.split(".")[1];
        return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    } catch { return null; }
}

function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
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

export default function PurchaseRequestDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [requestData, setRequestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [approveDialog, setApproveDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);

    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const statusConfig = {
        1: {
            label: 'Chờ duyệt',
            bannerBg: 'bg-amber-50', bannerBorder: 'border-amber-200',
            iconBg: 'bg-amber-100', iconColor: 'text-amber-600', textColor: 'text-amber-800',
            icon: Clock, description: 'Yêu cầu đang chờ quản lý kho phê duyệt'
        },
        2: {
            label: 'Đã duyệt',
            bannerBg: 'bg-green-50', bannerBorder: 'border-green-200',
            iconBg: 'bg-green-100', iconColor: 'text-green-600', textColor: 'text-green-800',
            icon: CheckCircle, description: 'Yêu cầu đã được duyệt — có thể gửi yêu cầu báo giá'
        },
        3: {
            label: 'Đã chuyển thành báo giá',
            bannerBg: 'bg-blue-50', bannerBorder: 'border-blue-200',
            iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textColor: 'text-blue-800',
            icon: FileText, description: 'Yêu cầu này đã được tạo thành đơn báo giá'
        },
        4: {
            label: 'Từ chối',
            bannerBg: 'bg-rose-50', bannerBorder: 'border-rose-200',
            iconBg: 'bg-rose-100', iconColor: 'text-rose-600', textColor: 'text-rose-800',
            icon: XCircle, description: 'Yêu cầu nhập hàng đã bị từ chối'
        },
        5: {
            label: 'Đã chuyển thành báo giá',
            bannerBg: 'bg-blue-50', bannerBorder: 'border-blue-200',
            iconBg: 'bg-blue-100', iconColor: 'text-blue-600', textColor: 'text-blue-800',
            icon: FileText, description: 'Yêu cầu này đã được tạo thành đơn báo giá'
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const fetchRequestDetail = async () => {
        setLoading(true);
        try {
            const result = await apiClient.get(`/api/v1/yeu-cau-mua-hang/get-by-id/${id}`);
            if (result && result.data && result.data.data) {
                setRequestData(result.data.data);
            }
        } catch (error) {
            console.error('Error fetching request detail:', error);
            toast.error('Không thể tải chi tiết yêu cầu mua hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchRequestDetail();
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

    const handleAction = async (trangThai) => {
        setActionLoading(true);
        try {
            await purchaseRequestService.approve(id, trangThai);
            toast.success(trangThai === 2 ? `Đã phê duyệt yêu cầu #${id}!` : `Đã từ chối yêu cầu #${id}!`);
            setApproveDialog(false);
            setRejectDialog(false);
            await fetchRequestDetail();
        } catch (error) {
            console.error('Error action:', error);
            toast.error(error.response?.data?.message || 'Không thể thực hiện thao tác. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSendQuotationRequest = () => {
        navigate(`/purchase-requests/${id}/send-quotation`);
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Package className="h-8 w-8 animate-bounce text-violet-600" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải dữ liệu yêu cầu...</span>
                </div>
            </div>
        );
    }

    if (!requestData) {
        return (
            <div className="p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 lux-sync">
                <div className="text-center bg-white p-10 rounded-3xl shadow-sm border border-slate-200/60 w-full max-w-md">
                    <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-slate-600 mb-6">Không tìm thấy yêu cầu nhập hàng</p>
                    <Button onClick={() => navigate('/purchase-requests')}
                        className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-white hover:text-slate-900 shadow-md rounded-xl h-12">
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const currentStatus = statusConfig[requestData.trangThai] || statusConfig[1];
    const StatusIcon = currentStatus.icon;

    // Kiểm tra quyền
    const canApprove = APPROVE_ROLES.some(role => userRoles.includes(role));
    const canCreateQuotation = QUOTATION_ROLES.some(role => userRoles.includes(role));

    return (
        <div className="p-6 md:p-8 pb-24 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-[calc(100vh-64px)] lux-sync">

            {/* ── Header ── */}
            <div className="flex flex-col gap-4 mb-2">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button type="button" onClick={() => navigate("/purchase-requests")}
                        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-violet-600 transition-colors duration-200 w-fit">
                        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                    </button>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="h-11 px-5 rounded-xl bg-white border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 shadow-sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4 text-slate-500" /> In yêu cầu
                        </Button>

                        {/* ── Action Buttons ── */}
                        <TooltipProvider>
                            <div className="flex items-center justify-center gap-2">
                                {/* Chờ duyệt (1) */}
                                {requestData.trangThai === 1 && (
                                    <>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button variant="outline" className="h-11 px-5 rounded-xl border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold shadow-sm disabled:opacity-50"
                                                        disabled={!canApprove || loadingAuth}
                                                        onClick={() => canApprove && !loadingAuth && setRejectDialog(true)}>
                                                        <XCircle className="mr-2 h-4 w-4" /> Từ chối
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{!canApprove ? "Bạn không có quyền thao tác" : "Từ chối yêu cầu nhập hàng"}</p></TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    <Button className="h-11 px-6 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md disabled:opacity-50"
                                                        disabled={!canApprove || loadingAuth}
                                                        onClick={() => canApprove && !loadingAuth && setApproveDialog(true)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Phê duyệt
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{!canApprove ? "Bạn không có quyền duyệt" : "Duyệt yêu cầu nhập hàng"}</p></TooltipContent>
                                        </Tooltip>
                                    </>
                                )}

                                {/* Đã duyệt (2) */}
                                {requestData.trangThai === 2 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button className="h-11 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md disabled:opacity-50"
                                                    disabled={loadingAuth || !canCreateQuotation}
                                                    onClick={() => !loadingAuth && canCreateQuotation && handleSendQuotationRequest()}>
                                                    <Send className="mr-2 h-4 w-4" /> Gửi báo giá
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent><p>{!canCreateQuotation ? "Chỉ nhân viên mua hàng có quyền thao tác" : "Tạo đơn báo giá từ yêu cầu này"}</p></TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* ── Status Banner ── */}
            <div className={`rounded-2xl p-6 md:p-8 shadow-sm border ${currentStatus.bannerBg} ${currentStatus.bannerBorder} flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden`}>
                <div className={`absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 rounded-full ${currentStatus.iconBg} blur-3xl opacity-50 pointer-events-none`} />
                <div className="flex items-center gap-5 relative z-10">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${currentStatus.iconBg} shadow-inner border border-white/40 shrink-0`}>
                        <StatusIcon className={`h-8 w-8 ${currentStatus.iconColor}`} />
                    </div>
                    <div>
                        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight ${currentStatus.textColor}`}>{currentStatus.label}</h2>
                        <p className={`mt-1.5 text-[15px] font-medium opacity-80 ${currentStatus.textColor}`}>{currentStatus.description}</p>
                    </div>
                </div>
            </div>

            {/* ── Info Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                <SectionCard title="Thông tin yêu cầu" icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-600">
                    <InfoField label="Ngày tạo yêu cầu" icon={Calendar}>
                        <span className="font-semibold text-slate-800">{formatDateTime(requestData.ngayTao)}</span>
                    </InfoField>
                    <InfoField label="Ngày giao dự kiến" icon={Clock}>
                        <span className="font-semibold text-slate-800">{formatDate(requestData.ngayGiaoDuKien)}</span>
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Ghi chú">
                        <span className="text-[14px] text-slate-600 leading-relaxed block bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                            {requestData.ghiChu || <span className="italic text-slate-400">Không có ghi chú</span>}
                        </span>
                    </InfoField>
                </SectionCard>

                <SectionCard title="Kho nhập hàng" icon={Warehouse} iconBg="bg-amber-100" iconColor="text-amber-600">
                    <InfoField label="Tên kho">
                        <div className="font-bold text-slate-900">{requestData.khoNhap?.tenKho || '—'}</div>
                        {requestData.khoNhap?.maKho && (
                            <div className="mt-1">
                                <span className="inline-flex font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                    {requestData.khoNhap.maKho}
                                </span>
                            </div>
                        )}
                    </InfoField>
                    <Separator className="bg-slate-100" />
                    <InfoField label="Người quản lý kho" icon={User} value={requestData.khoNhap?.quanLy?.hoTen || '—'} />
                    <InfoField label="Địa chỉ" icon={MapPin}>
                        <span className="text-[14px] text-slate-700 leading-snug block line-clamp-2">{requestData.khoNhap?.diaChi || "—"}</span>
                    </InfoField>
                </SectionCard>

                <SectionCard title="Thông tin người dùng" icon={User} iconBg="bg-emerald-100" iconColor="text-emerald-600">
                    <InfoField label="Người tạo" icon={CheckCircle}>
                        <div className="font-semibold text-slate-900">{requestData.nguoiTao?.hoTen || '—'}</div>
                        <div className="text-[13px] text-slate-500 mt-0.5">{requestData.nguoiTao?.email}</div>
                    </InfoField>
                    {requestData.nguoiDuyet && (
                        <>
                            <Separator className="bg-slate-100" />
                            <InfoField label="Người duyệt" icon={CheckCircle}>
                                <div className="font-semibold text-slate-900">{requestData.nguoiDuyet?.hoTen}</div>
                                <div className="text-[13px] text-slate-500 mt-0.5">{requestData.nguoiDuyet?.email}</div>
                            </InfoField>
                        </>
                    )}
                </SectionCard>
            </div>

            {/* ── Product Table ── */}
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
                                <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12 pr-6">SL Yêu cầu</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requestData.chiTietYeuCauMuaHangs?.length > 0 ? (
                                requestData.chiTietYeuCauMuaHangs.map((item, index) => (
                                    <TableRow key={item.id || index} className="hover:bg-slate-50 border-b border-slate-100 group">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-4">
                                                {item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                    <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shadow-sm shrink-0">
                                                        <img src={item.bienTheSanPham.anhBienThe.tepTin.duongDan} alt="Product"
                                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                    </div>
                                                ) : (
                                                    <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                        <Package className="h-6 w-6 text-slate-300" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[15px] text-slate-900 leading-tight">{item.bienTheSanPham?.tenSanPham || item.bienTheSanPham?.maSku}</p>
                                                    <p className="text-[13px] text-slate-500 font-medium mt-1 uppercase tracking-wider flex items-center gap-1">
                                                        Mã: <span className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{item.bienTheSanPham?.maSku}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-5 w-5 rounded-full border border-slate-200 shadow-sm"
                                                    style={{ backgroundColor: item.bienTheSanPham?.mauSac?.maMauHex }}
                                                    title={item.bienTheSanPham?.mauSac?.tenMau} />
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
                                        <TableCell className="text-center py-4 pr-6">
                                            <span className="inline-flex h-8 min-w-[2.5rem] px-3 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/50">
                                                {item.soLuongDat}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-16">
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
                        <div className="w-full sm:w-80 space-y-4">
                            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-200/60 shadow-sm">
                                <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wide">Tổng số lượng SP:</span>
                                <span className="font-black text-slate-800 text-[16px]">
                                    {requestData.chiTietYeuCauMuaHangs?.reduce((sum, item) => sum + item.soLuongDat, 0) || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Approve Dialog ── */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-emerald-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">Xác nhận phê duyệt</DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 leading-relaxed mb-6">
                            Bạn có chắc chắn muốn phê duyệt yêu cầu nhập hàng <span className="font-bold text-slate-900 border-b border-slate-300 pb-0.5">#{requestData.id}</span>?
                            Sau khi duyệt, nhân viên mua hàng có thể tạo đơn báo giá.
                        </DialogDescription>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setApproveDialog(false)} disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold border-slate-200">Hủy bỏ</Button>
                            <Button onClick={() => handleAction(2)} disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận phê duyệt'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Reject Dialog ── */}
            <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-rose-600 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <XCircle className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">Từ chối yêu cầu</DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 leading-relaxed mb-6">
                            Bạn có chắc chắn muốn từ chối yêu cầu nhập hàng <span className="font-bold text-slate-900 border-b border-slate-300 pb-0.5">#{requestData.id}</span>? Hành động này không thể hoàn tác.
                        </DialogDescription>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setRejectDialog(false)} disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold border-slate-200">Hủy bỏ</Button>
                            <Button onClick={() => handleAction(4)} disabled={actionLoading}
                                className="h-11 rounded-xl font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md">
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}