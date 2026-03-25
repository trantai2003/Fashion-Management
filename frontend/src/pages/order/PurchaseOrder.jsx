import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "@/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Calendar,
    Package, Filter, Eye, RefreshCw, Warehouse, CheckCircle, XCircle,
    Clock, FileText, Loader2, DollarSign, AlertCircle, Send, CreditCard,
    ShoppingCart,
    Ship,
} from "lucide-react";
import purchaseOrderService from "../../services/purchaseOrderService";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN:      "quan_tri_vien",
    QUAN_LY_KHO:        "quan_ly_kho",
    NHAN_VIEN_KHO:      "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseJwt(token) {
    try { return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); }
    catch { return null; }
}
function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
}

// ─── Status configs ────────────────────────────────────────────────────────────
const PR_STATUS = {
    0: { label: 'Nháp',                color: 'bg-slate-100 text-slate-600 border-slate-200',       icon: Clock },
    1: { label: 'Đã gửi',             color: 'bg-blue-100 text-blue-700 border-blue-200',           icon: Send },
    2: { label: 'Đã duyệt',           color: 'bg-green-100 text-green-700 border-green-200',        icon: CheckCircle },
    3: { label: 'Đã tạo đơn báo giá', color: 'bg-purple-100 text-purple-700 border-purple-200',    icon: FileText },
    4: { label: 'Từ chối',            color: 'bg-red-100 text-red-700 border-red-200',              icon: XCircle },
    5: { label: 'Đang vận chuyển',       color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Ship },
};

const PO_STATUS = {
    0: { label: 'Đã xoá',                  color: 'bg-red-100 text-red-700 border-red-200',             icon: XCircle },
    1: { label: 'Đã gửi yêu cầu báo giá',  color: 'bg-purple-100 text-purple-700 border-purple-200',   icon: Send },
    2: { label: 'Đã nhận báo giá',         color: 'bg-blue-100 text-blue-700 border-blue-200',          icon: FileText },
    3: { label: 'Chờ vận chuyển',          color: 'bg-amber-100 text-amber-700 border-amber-200',       icon: Clock },
    4: { label: 'Từ chối báo giá',         color: 'bg-orange-100 text-orange-700 border-orange-200',    icon: XCircle },
    5: { label: 'Đã thanh toán',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CreditCard },
};

// ─── Tooltip nút thanh toán theo từng trạng thái ──────────────────────────────
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

// ─── Sub-component: PO rows inside expandable panel ───────────────────────────
function DonMuaHangRows({ donMuaHangs = [], navigate, userRoles, onAction, actionLoading }) {
    const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

    // Chỉ nhân viên mua hàng mới có quyền duyệt / từ chối báo giá
    const canApprove = userRoles.includes(ROLE.NHAN_VIEN_MUA_HANG);

    if (donMuaHangs.length === 0) {
        return (
            <tr>
                <td colSpan={9}>
                    <div className="flex items-center justify-center gap-2 py-6 text-slate-400 text-sm">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Chưa có đơn mua hàng nào</span>
                    </div>
                </td>
            </tr>
        );
    }

    return donMuaHangs.map((po) => {
        const cfg = PO_STATUS[po.trangThai] ?? { label: 'Không rõ', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock };
        const StatusIcon = cfg.icon;
        const isAccepted = po.trangThai === 3 || po.trangThai === 5;

        // Nút duyệt/từ chối chỉ xuất hiện khi trạng thái = 2 (đã nhận báo giá)
        const showApproveActions = po.trangThai === 2;
        // Nút thanh toán chỉ active khi trạng thái = 3 (đã chấp nhận báo giá, chờ vận chuyển)
        const canPay = po.trangThai === 3;

        return (
            <tr
                key={po.id}
                onClick={() => navigate(`/purchase-orders/${po.id}`)}
                className="bg-indigo-50/40 hover:bg-indigo-50/80 cursor-pointer transition-colors border-b border-indigo-100/60 last:border-0"
            >
                {/* Indent */}
                <td className="pl-8 pr-2 py-3 w-10" />

                {/* Số đơn mua */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                        <span className="font-bold text-indigo-600 text-sm tracking-wide">{po.soDonMua}</span>
                    </div>
                </td>

                {/* Nhà cung cấp */}
                <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800 text-sm">{po.nhaCungCap?.tenNhaCungCap}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{po.nhaCungCap?.maNhaCungCap}</p>
                </td>

                {/* Ngày gửi */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDate(po.ngayDatHang)}
                    </div>
                </td>

                {/* Hết hạn */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDate(po.ngayGiaoDuKien)}
                    </div>
                </td>

                {/* Trạng thái */}
                <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                    </span>
                </td>

                {/* Người tạo */}
                <td className="px-4 py-3 text-sm text-slate-600">
                    {po.nguoiTao?.hoTen || '-'}
                </td>

                {/* Tổng tiền */}
                <td className="px-4 py-3 text-right">
                    <span className={`font-bold text-sm ${isAccepted ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {formatCurrency(po.tongTien)}
                    </span>
                    {isAccepted && (
                        <p className="text-xs text-emerald-500 mt-0.5">Đã chấp nhận</p>
                    )}
                </td>

                {/* Thao tác */}
                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <TooltipProvider>
                        <div className="flex items-center justify-center gap-0.5">

                            {/* Xem chi tiết */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                        onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                                        <Eye className="h-4 w-4 text-indigo-500" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Xem chi tiết đơn mua hàng</p></TooltipContent>
                            </Tooltip>

                            {/* Duyệt / Từ chối — chỉ hiện khi trạng thái = 2 */}
                            {showApproveActions && (
                                <>
                                    {/* Duyệt báo giá */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            {/*
                                             * Bọc <span> để Tooltip vẫn hiển thị khi button bị disabled
                                             * (disabled element không fire pointer events)
                                             */}
                                            <span tabIndex={canApprove ? undefined : 0}>
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8"
                                                    disabled={!canApprove || actionLoading}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await onAction(po.id, 3);
                                                    }}
                                                >
                                                    <CheckCircle className={`h-4 w-4 ${canApprove ? 'text-emerald-600' : 'text-slate-300'}`} />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{canApprove
                                                ? 'Duyệt báo giá'
                                                : 'Chỉ nhân viên mua hàng mới có thể thực hiện'}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* Từ chối báo giá */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span tabIndex={canApprove ? undefined : 0}>
                                                <Button
                                                    variant="ghost" size="icon" className="h-8 w-8"
                                                    disabled={!canApprove || actionLoading}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await onAction(po.id, 4);
                                                    }}
                                                >
                                                    <XCircle className={`h-4 w-4 ${canApprove ? 'text-red-500' : 'text-slate-300'}`} />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{canApprove
                                                ? 'Từ chối báo giá'
                                                : 'Chỉ nhân viên mua hàng mới có thể thực hiện'}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </>
                            )}

                            {/* Thanh toán — luôn hiển thị, tooltip + disabled thay đổi theo trạng thái */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span tabIndex={canPay ? undefined : 0}>
                                        <Button
                                            variant="ghost" size="icon" className="h-8 w-8"
                                            disabled={!canPay}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/purchase-orders/${po.id}/payment`);
                                            }}
                                        >
                                            <CreditCard className={`h-4 w-4 ${canPay ? 'text-blue-600' : 'text-slate-300'}`} />
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{getPaymentTooltip(po.trangThai)}</p>
                                </TooltipContent>
                            </Tooltip>

                        </div>
                    </TooltipProvider>
                </td>
            </tr>
        );
    });
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function PurchaseOrder() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [userRoles, setUserRoles] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [pagination, setPagination] = useState({
        pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0,
    });
    const [filters, setFilters] = useState({ soYeuCauMuaHang: '', khoId: '', trangThai: '' });
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

    const showNotification = (type, msg) => {
        if (type === 'success') { setSuccess(msg); setError(null); setTimeout(() => setSuccess(null), 5000); }
        else { setError(msg); setSuccess(null); setTimeout(() => setError(null), 5000); }
    };

    // ── Load auth ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const loadAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const payload = parseJwt(token);
                if (!payload?.id) return;
                const res = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
                const data = res.data?.data;
                if (data?.vaiTro) setUserRoles(parseRoles(data.vaiTro));
            } catch (e) {
                console.error('Auth error:', e);
            }
        };
        loadAuth();
    }, []);

    // ── Fetch requests ────────────────────────────────────────────────────────
    const fetchRequests = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const filterArray = [];
            if (filters.soYeuCauMuaHang) filterArray.push({ fieldName: "soYeuCauMuaHang", operation: "LIKE", value: filters.soYeuCauMuaHang, logicType: "AND" });
            if (filters.khoId && filters.khoId !== 'all') filterArray.push({ fieldName: "khoNhap.id", operation: "EQUALS", value: parseInt(filters.khoId), logicType: "AND" });
            if (filters.trangThai && filters.trangThai !== 'all') filterArray.push({ fieldName: "trangThai", operation: "EQUALS", value: parseInt(filters.trangThai), logicType: "AND" });
            if (dateRange.from) filterArray.push({ fieldName: "ngayTao", operation: "GREATER_THAN_OR_EQUAL", value: new Date(dateRange.from).toISOString(), logicType: "AND" });
            if (dateRange.to) filterArray.push({ fieldName: "ngayTao", operation: "LESS_THAN_OR_EQUAL", value: new Date(dateRange.to).toISOString(), logicType: "AND" });

            const response = await apiClient.post('/api/v1/yeu-cau-mua-hang/filter', {
                filters: filterArray,
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page, size,
            });

            if (response?.data?.data) {
                setRequests(response.data.data.content || []);
                setPagination({
                    pageNumber: response.data.data.pageable?.pageNumber ?? 0,
                    pageSize:   response.data.data.pageable?.pageSize   ?? size,
                    totalElements: response.data.data.totalElements || 0,
                    totalPages:    response.data.data.totalPages    || 0,
                });
            }
        } catch (e) {
            console.error('Error fetching purchase requests:', e);
            showNotification('error', 'Không thể tải danh sách yêu cầu mua hàng. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const ware = await purchaseOrderService.getUniqueWarehouses();
                setWarehouses(ware);
            } catch (e) { console.error('Error loading warehouses:', e); }
        };
        init();
        fetchRequests(0, 10);
    }, []);

    // ── Duyệt / Từ chối báo giá ───────────────────────────────────────────────
    const handleApproveAction = async (poId, trangThai) => {
        setActionLoading(true);
        try {
            await apiClient.put(`/api/v1/nghiep-vu/don-mua-hang/duyet-don/${poId}/${trangThai}`);
            showNotification('success', trangThai === 3 ? 'Đã duyệt báo giá thành công!' : 'Đã từ chối báo giá!');
            fetchRequests(pagination.pageNumber, pagination.pageSize);
        } catch {
            showNotification('error', 'Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Toggle expand ─────────────────────────────────────────────────────────
    const toggleExpand = (id, e) => {
        e.stopPropagation();
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Tổng tiền đã chấp nhận ────────────────────────────────────────────────
    const getAcceptedTotal = (req) => {
        const accepted = (req.donMuaHangs || []).filter(po => po.trangThai === 3 || po.trangThai === 5);
        if (accepted.length === 0) return null;
        return accepted.reduce((sum, po) => sum + (Number(po.tongTien) || 0), 0);
    };

    // ── Filter helpers ────────────────────────────────────────────────────────
    const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));
    const handleDateChange = (field, value) => setDateRange(prev => ({ ...prev, [field]: value }));
    const handleSearch = () => fetchRequests(0, pagination.pageSize);
    const handleReset = () => {
        setFilters({ soYeuCauMuaHang: '', khoId: '', trangThai: '' });
        setDateRange({ from: '', to: '' });
        setTimeout(() => fetchRequests(0, pagination.pageSize), 100);
    };
    const handlePageChange = (p) => { if (p >= 0 && p < pagination.totalPages) fetchRequests(p, pagination.pageSize); };
    const handlePageSizeChange = (s) => { setPagination(prev => ({ ...prev, pageSize: s })); fetchRequests(0, s); };

    const getWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') return "Tất cả kho";
        return warehouses.find(w => w.id === parseInt(filters.khoId))?.tenKho || "Đang tải...";
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalAccepted = requests.reduce((sum, r) => sum + (getAcceptedTotal(r) ?? 0), 0);
    const stats = [
        { label: 'Tổng yêu cầu',          value: pagination.totalElements,                         Icon: FileText,    bg: 'from-blue-50',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-600' },
        { label: 'Tổng giá trị chấp nhận', value: formatCurrency(totalAccepted),                    Icon: DollarSign,  bg: 'from-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { label: 'Đã duyệt',              value: requests.filter(r => r.trangThai === 2).length,    Icon: CheckCircle, bg: 'from-green-50',   iconBg: 'bg-green-100',   iconColor: 'text-green-600' },
        { label: 'Đã tạo đơn báo giá',    value: requests.filter(r => r.trangThai === 3).length,   Icon: ShoppingCart, bg: 'from-purple-50', iconBg: 'bg-purple-100',  iconColor: 'text-purple-600' },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            {success && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                    <Button onClick={() => navigate('/purchase-orders')} variant="outline" className="border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                    <ShoppingCart className="mr-2 h-4 w-4" />Xem đơn mua hàng
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, Icon, bg, iconBg, iconColor }) => (
                    <Card key={label} className={`border-0 shadow-md bg-gradient-to-br ${bg} to-white`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
                                </div>
                                <div className={`h-11 w-11 rounded-full ${iconBg} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                        <Filter className="h-4 w-4 text-indigo-600" />Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm text-slate-600 font-medium">Số yêu cầu</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input placeholder="Tìm số yêu cầu..." className="pl-9 h-9 border-slate-200 text-sm"
                                    value={filters.soYeuCauMuaHang}
                                    onChange={e => handleFilterChange('soYeuCauMuaHang', e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-slate-600 font-medium">Kho nhập {warehouses.length > 0 && `(${warehouses.length})`}</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-9 justify-between font-normal border-slate-200 text-sm" disabled={warehouses.length === 0}>
                                        <div className="flex items-center overflow-hidden">
                                            <Warehouse className="h-3.5 w-3.5 mr-2 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{getWarehouseName()}</span>
                                        </div>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] bg-white shadow-lg border border-slate-100 z-50 max-h-[300px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('khoId', 'all')} className="font-medium text-sm">Tất cả kho</DropdownMenuItem>
                                    {warehouses.map(w => (
                                        <DropdownMenuItem key={w.id} onClick={() => handleFilterChange('khoId', w.id)} className="cursor-pointer py-2 text-sm">
                                            <div>
                                                <p className="font-medium text-slate-800">{w.tenKho}</p>
                                                <p className="text-xs text-slate-400">{w.maKho}</p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-slate-600 font-medium">Trạng thái</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-9 justify-between font-normal border-slate-200 text-sm">
                                        <span className="truncate">{filters.trangThai && filters.trangThai !== 'all' ? PR_STATUS[filters.trangThai]?.label : "Tất cả trạng thái"}</span>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white shadow-lg border border-slate-100 z-50">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')} className="font-medium text-sm">Tất cả trạng thái</DropdownMenuItem>
                                    {Object.entries(PR_STATUS).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <DropdownMenuItem key={key} onClick={() => handleFilterChange('trangThai', key)} className="cursor-pointer text-sm">
                                                <div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{cfg.label}</div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-slate-600 font-medium">Từ ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                <Input type="date" className="pl-9 h-9 border-slate-200 text-sm" value={dateRange.from} onChange={e => handleDateChange('from', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSearch} size="sm" className="bg-slate-900 text-white hover:bg-slate-700 px-4">
                            <Search className="h-3.5 w-3.5 mr-2" />Tìm kiếm
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset} className="px-4">Đặt lại</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action row */}
            <div className="flex items-center justify-end">
                <Button variant="outline" size="sm" className="gap-2"
                    onClick={() => fetchRequests(pagination.pageNumber, pagination.pageSize)}>
                    <RefreshCw className="h-3.5 w-3.5" />Làm mới
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[620px]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-11 w-10 px-3" />
                                <th className="h-11 px-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Mã yêu cầu</th>
                                <th className="h-11 px-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Kho nhập</th>
                                <th className="h-11 px-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Ngày tạo</th>
                                <th className="h-11 px-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Ngày giao dự kiến</th>
                                <th className="h-11 px-4 text-center font-semibold text-slate-500 text-xs uppercase tracking-wide">Trạng thái</th>
                                <th className="h-11 px-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wide">Người tạo</th>
                                <th className="h-11 px-4 text-right font-semibold text-slate-500 text-xs uppercase tracking-wide">Tổng tiền</th>
                                <th className="h-11 px-4 text-center font-semibold text-slate-500 text-xs uppercase tracking-wide w-24">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={9} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                        <span className="text-slate-400 text-sm">Đang tải dữ liệu...</span>
                                    </div>
                                </td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={9} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Package className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="font-semibold text-slate-600">Không tìm thấy yêu cầu mua hàng</p>
                                        <p className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc làm mới trang</p>
                                    </div>
                                </td></tr>
                            ) : requests.map((req) => {
                                const isExpanded = expandedRows.has(req.id);
                                const prCfg = PR_STATUS[req.trangThai] ?? { label: 'Không rõ', color: 'bg-slate-100 text-slate-500 border-slate-200', icon: Clock };
                                const PrIcon = prCfg.icon;
                                const poCount = req.donMuaHangs?.length || 0;
                                const acceptedTotal = getAcceptedTotal(req);
                                const hasPos = poCount > 0;

                                return (
                                    <React.Fragment key={req.id}>
                                        {/* ── Parent row ── */}
                                        <tr
                                            onClick={() => navigate(`/purchase-requests/${req.id}`)}
                                            className={`transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/60' : 'hover:bg-slate-50/80'}`}
                                        >
                                            {/* Expand toggle */}
                                            <td className="px-3 py-3.5 text-center" onClick={e => hasPos && toggleExpand(req.id, e)}>
                                                {hasPos ? (
                                                    <button className={`h-6 w-6 rounded-md flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'}`}>
                                                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                                    </button>
                                                ) : (
                                                    <div className="h-6 w-6 rounded-md bg-slate-50 flex items-center justify-center">
                                                        <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                    </div>
                                                )}
                                            </td>

                                            {/* Mã yêu cầu + badge số đơn */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-indigo-700 tracking-wide">{req.soYeuCauMuaHang}</span>
                                                    {poCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 border border-indigo-200">
                                                            <ShoppingCart className="h-3 w-3" />{poCount} NCC
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <p className="font-semibold text-slate-800">{req.khoNhap?.tenKho}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{req.khoNhap?.maKho}</p>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(req.ngayTao)}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(req.ngayGiaoDuKien)}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${prCfg.color}`}>
                                                    <PrIcon className="h-3.5 w-3.5" />
                                                    {prCfg.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5 text-sm text-slate-600">
                                                {req.nguoiTao?.hoTen || '-'}
                                            </td>

                                            <td className="px-4 py-3.5 text-right">
                                                {acceptedTotal !== null ? (
                                                    <>
                                                        <span className="font-bold text-emerald-700">{formatCurrency(acceptedTotal)}</span>
                                                        <p className="text-xs text-emerald-500 mt-0.5">Đã chấp nhận</p>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">Chưa có</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8"
                                                                onClick={() => navigate(`/purchase-requests/${req.id}`)}>
                                                                <Eye className="h-4 w-4 text-indigo-500" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>Xem chi tiết yêu cầu</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </td>
                                        </tr>

                                        {/* ── Expanded PO sub-table ── */}
                                        {isExpanded && hasPos && (
                                            <tr>
                                                <td colSpan={9} className="p-0">
                                                    <div className="bg-indigo-50/30 border-t border-b border-indigo-100">
                                                        <div className="px-8 pt-3 pb-1.5">
                                                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                                                                <ShoppingCart className="h-3 w-3" />
                                                                Báo giá từ NCC ({poCount} báo giá)
                                                            </p>
                                                        </div>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b border-indigo-100 bg-indigo-50/60">
                                                                    <th className="h-9 w-10 px-3" />
                                                                    <th className="h-9 px-4 text-left font-semibold text-indigo-500 text-xs uppercase tracking-wide">Số đơn mua</th>
                                                                    <th className="h-9 px-4 text-left font-semibold text-indigo-500 text-xs uppercase tracking-wide">Nhà cung cấp</th>
                                                                    <th className="h-9 px-4 text-left font-semibold text-indigo-500 text-xs uppercase tracking-wide">Ngày gửi</th>
                                                                    <th className="h-9 px-4 text-left font-semibold text-indigo-500 text-xs uppercase tracking-wide">Hết hạn</th>
                                                                    <th className="h-9 px-4 text-center font-semibold text-indigo-500 text-xs uppercase tracking-wide">Trạng thái</th>
                                                                    <th className="h-9 px-4 text-left font-semibold text-indigo-500 text-xs uppercase tracking-wide">Người tạo</th>
                                                                    <th className="h-9 px-4 text-right font-semibold text-indigo-500 text-xs uppercase tracking-wide">Tổng tiền</th>
                                                                    <th className="h-9 px-4 text-center font-semibold text-indigo-500 text-xs uppercase tracking-wide w-32">Thao tác</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <DonMuaHangRows
                                                                    donMuaHangs={req.donMuaHangs}
                                                                    navigate={navigate}
                                                                    userRoles={userRoles}
                                                                    onAction={handleApproveAction}
                                                                    actionLoading={actionLoading}
                                                                />
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-slate-500 whitespace-nowrap">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[110px] justify-between font-normal border-slate-200 text-sm h-9">
                                        {pagination.pageSize} dòng<ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[110px] bg-white shadow-lg border border-slate-100 z-50">
                                    {[5, 10, 20, 50].map(s => (
                                        <DropdownMenuItem key={s} onClick={() => handlePageSizeChange(s)} className="cursor-pointer text-sm">{s} dòng</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-800">{pagination.totalElements === 0 ? 0 : pagination.pageNumber * pagination.pageSize + 1}</span>
                            {' – '}
                            <span className="font-semibold text-slate-800">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span>
                            {' trong '}
                            <span className="font-semibold text-indigo-600">{pagination.totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                disabled={pagination.pageNumber === 0} className="gap-1 h-8 px-3 text-sm">
                                <ChevronLeft className="h-3.5 w-3.5" />Trước
                            </Button>
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                let p = idx;
                                if (pagination.totalPages > 5) {
                                    if (pagination.pageNumber < 3) p = idx;
                                    else if (pagination.pageNumber > pagination.totalPages - 4) p = pagination.totalPages - 5 + idx;
                                    else p = pagination.pageNumber - 2 + idx;
                                }
                                return (
                                    <Button key={idx} variant={pagination.pageNumber === p ? "default" : "outline"} size="sm"
                                        onClick={() => handlePageChange(p)}
                                        className={`h-8 w-8 p-0 text-sm ${pagination.pageNumber === p ? "bg-slate-900 text-white border-slate-900" : "border-slate-200"}`}>
                                        {p + 1}
                                    </Button>
                                );
                            })}
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                disabled={pagination.pageNumber >= pagination.totalPages - 1 || pagination.totalPages === 0}
                                className="gap-1 h-8 px-3 text-sm">
                                Sau<ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}