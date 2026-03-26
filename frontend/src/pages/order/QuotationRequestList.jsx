import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "@/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, Calendar,
    Package, Filter, Eye, RefreshCw, Warehouse, CheckCircle, XCircle,
    Clock, FileText, Loader2, DollarSign, AlertCircle, Send, CreditCard,
    ShoppingCart, Ship, ListChecks, Plus,
} from "lucide-react";
import purchaseOrderService from "../../services/purchaseOrderService";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
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

const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '—';

// ─── Status configs ────────────────────────────────────────────────────────────
// Chỉ tập trung vào 3 và 5 cho Parent Row
const PR_STATUS = {
    3: { label: 'Đã gửi yêu cầu báo giá', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FileText },
    5: { label: 'Đã chuyển thành đơn mua hàng', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Ship },
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

// ─── Sub-component: PO rows inside expandable panel ───────────────────────────
function DonMuaHangRows({ donMuaHangs = [], navigate, userRoles, onAction, actionLoading }) {
    const canApprove = userRoles.includes(ROLE.NHAN_VIEN_MUA_HANG) || userRoles.includes(ROLE.QUAN_TRI_VIEN);

    if (donMuaHangs.length === 0) {
        return (
            <tr>
                <td colSpan={9}>
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                        <ShoppingCart className="h-6 w-6 opacity-50" />
                        <span className="text-[13px] font-medium">Chưa có đơn mua hàng (báo giá) nào</span>
                    </div>
                </td>
            </tr>
        );
    }

    return donMuaHangs.map((po) => {
        const cfg = PO_STATUS[po.trangThai] ?? { label: 'Không rõ', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Clock };
        const StatusIcon = cfg.icon;
        const isAccepted = po.trangThai === 3 || po.trangThai === 5;
        const showApproveActions = po.trangThai === 2;
        const canPay = po.trangThai === 3;

        return (
            <tr
                key={po.id}
                onClick={() => navigate(`/quotation/${po.id}`)}
                className="bg-white hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-100 last:border-0 group"
            >
                <td className="pl-6 w-12" />

                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="font-bold text-[13px] text-slate-800 group-hover:text-blue-600 transition-colors">{po.soDonMua?.replace(/^PO/, 'Q-')}</span>
                    </div>
                </td>

                <td className="px-4 py-3">
                    <p className="font-semibold text-[13px] text-slate-800 truncate max-w-[150px]">{po.nhaCungCap?.tenNhaCungCap}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{po.nhaCungCap?.maNhaCungCap}</p>
                </td>

                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[12px] font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" /> {formatDate(po.ngayDatHang)}
                    </div>
                </td>

                <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-600 text-[12px] font-medium">
                        <Calendar className="h-3 w-3 text-slate-400" /> {formatDate(po.ngayGiaoDuKien)}
                    </div>
                </td>

                <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" /> {cfg.label}
                    </span>
                </td>

                <td className="px-4 py-3 text-[13px] font-medium text-slate-600 truncate max-w-[120px]">
                    {po.nguoiTao?.hoTen || '-'}
                </td>

                <td className="px-4 py-3 text-right">
                    <span className={`font-black text-[14px] ${isAccepted ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {formatCurrency(po.tongTien)}
                    </span>
                    {isAccepted && <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Đã chốt</p>}
                </td>

                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <TooltipProvider>
                        <div className="flex items-center justify-center gap-1">
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
                </td>
            </tr>
        );
    });
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function QuotationRequestList() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const [userRoles, setUserRoles] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
    const [filters, setFilters] = useState({ soYeuCauMuaHang: '', khoId: '', trangThai: '' });
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

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
                if (res.data?.data?.vaiTro) setUserRoles(parseRoles(res.data.data.vaiTro));
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

            // CHÚ Ý: Mặc định luôn lọc parent row là 3 và 5
            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({ fieldName: "trangThai", operation: "EQUALS", value: parseInt(filters.trangThai), logicType: "AND" });
            } else {
                filterArray.push({ fieldName: "trangThai", operation: "IN", value: [3, 5], logicType: "AND" });
            }

            if (filters.soYeuCauMuaHang) filterArray.push({ fieldName: "soYeuCauMuaHang", operation: "LIKE", value: filters.soYeuCauMuaHang, logicType: "AND" });
            if (filters.khoId && filters.khoId !== 'all') filterArray.push({ fieldName: "khoNhap.id", operation: "EQUALS", value: parseInt(filters.khoId), logicType: "AND" });
            if (dateRange.from) filterArray.push({ fieldName: "ngayTao", operation: "GREATER_THAN_OR_EQUAL", value: dateRange.from, logicType: "AND" });
            if (dateRange.to) filterArray.push({ fieldName: "ngayTao", operation: "LESS_THAN_OR_EQUAL", value: dateRange.to + 'T23:59:59', logicType: "AND" });

            const response = await apiClient.post('/api/v1/yeu-cau-mua-hang/filter', {
                filters: filterArray,
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page, size,
            });

            if (response?.data?.data) {
                setRequests(response.data.data.content || []);
                setPagination({
                    pageNumber: response.data.data.pageable?.pageNumber ?? 0,
                    pageSize: response.data.data.pageable?.pageSize ?? size,
                    totalElements: response.data.data.totalElements || 0,
                    totalPages: response.data.data.totalPages || 0,
                });
            }
        } catch (e) {
            console.error('Error fetching purchase requests:', e);
            showNotification('error', 'Không thể tải danh sách. Vui lòng thử lại!');
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
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
        fetchRequests(0, pagination.pageSize);
    };

    const clearFilters = () => {
        setFilters({ soYeuCauMuaHang: '', khoId: '', trangThai: '' });
        setDateRange({ from: '', to: '' });
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
        setTimeout(() => fetchRequests(0, pagination.pageSize), 100);
    };

    const handlePageChange = (p) => {
        if (p >= 0 && p < pagination.totalPages) fetchRequests(p, pagination.pageSize);
    };

    const handlePageSizeChange = (s) => {
        setPagination(prev => ({ ...prev, pageNumber: 0, pageSize: s }));
        fetchRequests(0, s);
    };

    const getWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') return "Tất cả kho";
        return warehouses.find(w => w.id === parseInt(filters.khoId))?.tenKho || "Đang tải...";
    };

    // ── Stats ─────────────────────────────────────────────────────────────────
    const totalAccepted = requests.reduce((sum, r) => sum + (getAcceptedTotal(r) ?? 0), 0);
    const stats = [
        { label: 'Tổng yêu cầu', value: pagination.totalElements, Icon: FileText, bg: 'from-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
        { label: 'Giá trị chốt (hiện tại)', value: formatCurrency(totalAccepted), Icon: DollarSign, bg: 'from-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { label: 'Đã tạo báo giá', value: requests.filter(r => r.trangThai === 3).length, Icon: ShoppingCart, bg: 'from-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
        { label: 'Đang vận chuyển', value: requests.filter(r => r.trangThai === 5).length, Icon: Ship, bg: 'from-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
    ];

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-[calc(100vh-64px)] pb-24">

            {/* Notifications */}
            {success && (
                <Alert className="bg-emerald-50 border-emerald-200 shadow-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800 font-medium">{success}</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert className="bg-rose-50 border-rose-200 shadow-sm">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <AlertDescription className="text-rose-800 font-medium">{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, Icon, bg, iconBg, iconColor }) => (
                    <Card key={label} className={`border-0 shadow-md bg-gradient-to-br ${bg} to-white overflow-hidden rounded-2xl`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                                    <p className="text-xl font-black text-slate-900 mt-1.5">{value}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                                    <Icon className={`h-6 w-6 ${iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white rounded-2xl">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
                        <Filter className="h-4 w-4 text-indigo-600" /> Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

                        {/* Mã Yêu cầu */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">Mã yêu cầu</Label>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Tìm theo mã yêu cầu..." className="pl-10 h-10 rounded-xl border-slate-200 bg-white text-[13px]"
                                    value={filters.soYeuCauMuaHang} onChange={e => handleFilterChange('soYeuCauMuaHang', e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSearch()} />
                            </div>
                        </div>

                        {/* Kho nhập */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">Kho nhập {warehouses.length > 0 && `(${warehouses.length})`}</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-10 justify-between font-normal border-slate-200 bg-white text-[13px] rounded-xl" disabled={warehouses.length === 0}>
                                        <div className="flex items-center overflow-hidden gap-2">
                                            <Warehouse className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{getWarehouseName()}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] bg-white shadow-lg border border-slate-100 z-50 rounded-xl max-h-[300px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('khoId', 'all')} className="font-bold text-[13px] py-2.5 hover:bg-indigo-50 cursor-pointer">
                                        Tất cả kho
                                    </DropdownMenuItem>
                                    {warehouses.map(w => (
                                        <DropdownMenuItem key={w.id} onClick={() => handleFilterChange('khoId', w.id)} className="cursor-pointer py-2.5 hover:bg-indigo-50">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[13px] text-slate-800">{w.tenKho}</span>
                                                <span className="text-[11px] text-slate-500 font-mono mt-0.5">{w.maKho}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">Trạng thái</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-10 justify-between font-medium border-slate-200 bg-white text-[13px] rounded-xl">
                                        <span className="truncate">
                                            {filters.trangThai && filters.trangThai !== 'all' ? PR_STATUS[filters.trangThai]?.label : "Tất cả (3 & 5)"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] bg-white shadow-lg border border-slate-100 z-50 rounded-xl">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')} className="font-bold text-[13px] py-2.5 hover:bg-indigo-50 cursor-pointer">
                                        Tất cả (3 & 5)
                                    </DropdownMenuItem>
                                    {Object.entries(PR_STATUS).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <DropdownMenuItem key={key} onClick={() => handleFilterChange('trangThai', key)} className="cursor-pointer py-2.5 font-medium text-[13px] hover:bg-indigo-50">
                                                <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-slate-400" />{cfg.label}</div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label className="text-[13px] font-bold text-slate-700">Từ ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input type="date" className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-[13px]" value={dateRange.from} onChange={e => handleDateChange('from', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label className="text-[13px] font-bold text-slate-700">Đến ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input type="date" className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-[13px]" value={dateRange.to} onChange={e => handleDateChange('to', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end mt-5">
                        <Button variant="outline" onClick={clearFilters} className="h-10 px-5 rounded-xl font-bold text-[13px] border-slate-200 text-slate-600 hover:bg-slate-50">
                            Đặt lại
                        </Button>
                        <Button onClick={handleSearch} className="h-10 px-5 rounded-xl font-bold text-[13px] bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all">
                            <Search className="h-4 w-4 mr-2" /> Tìm kiếm
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => fetchRequests(pagination.pageNumber, pagination.pageSize)} className="h-10 px-4 rounded-xl font-bold text-[13px] border-slate-200 text-slate-700 hover:bg-slate-50 gap-2">
                    <RefreshCw className="h-4 w-4" /> Làm mới
                </Button>
                <Button className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 gap-2 h-10 px-4 rounded-xl font-bold text-[13px] transition-all"
                    onClick={() => navigate('/quotation-requests/create')}>
                    <Plus className="h-4 w-4" /> Tạo yêu cầu báo giá
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-bold text-[15px] text-slate-800">Danh sách quản lý</h2>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar max-h-[650px]">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr className="border-b border-slate-200 bg-slate-100/90 backdrop-blur-sm">
                                <th className="h-12 w-14 px-3" />
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Mã yêu cầu</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Kho nhập</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Ngày tạo</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Ngày giao DK</th>
                                <th className="h-12 px-4 text-center font-bold text-slate-500 text-[11px] uppercase tracking-widest">Trạng thái</th>
                                <th className="h-12 px-4 text-left font-bold text-slate-500 text-[11px] uppercase tracking-widest">Người tạo</th>
                                <th className="h-12 px-4 text-right font-bold text-slate-500 text-[11px] uppercase tracking-widest">Tổng tiền chốt</th>
                                <th className="h-12 px-4 text-center font-bold text-slate-500 text-[11px] uppercase tracking-widest w-24">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={9} className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                        <span className="text-slate-500 text-[14px] font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={9} className="py-28 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <Package className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-slate-700">Không tìm thấy yêu cầu báo giá nào</p>
                                            <p className="text-[13px] text-slate-500 mt-1">Vui lòng thử thay đổi bộ lọc</p>
                                        </div>
                                    </div>
                                </td></tr>
                            ) : requests.map((req) => {
                                const isExpanded = expandedRows.has(req.id);
                                const prCfg = PR_STATUS[req.trangThai] ?? { label: 'Không rõ', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: Clock };
                                const PrIcon = prCfg.icon;
                                const poCount = req.donMuaHangs?.length || 0;
                                const acceptedTotal = getAcceptedTotal(req);
                                const hasPos = poCount > 0;

                                return (
                                    <React.Fragment key={req.id}>
                                        {/* ── Parent row (Yêu Cầu) ── */}
                                        <tr
                                            onClick={() => navigate(`/quotation-requests/${req.id}`)}
                                            className={`transition-colors cursor-pointer border-b ${isExpanded ? 'bg-indigo-50/40 border-indigo-100' : 'bg-white hover:bg-slate-50/80 border-slate-100'}`}
                                        >
                                            <td className="px-3 py-4 text-center" onClick={e => hasPos && toggleExpand(req.id, e)}>
                                                {hasPos ? (
                                                    <button className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </button>
                                                ) : (
                                                    <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-start gap-1.5">
                                                    <span className="font-black text-[14px] text-indigo-700 tracking-tight">#{req.soYeuCauMuaHang}</span>
                                                    {poCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 border border-indigo-200">
                                                            <ShoppingCart className="h-3 w-3" />{poCount} báo giá
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="font-bold text-[13px] text-slate-800">{req.khoNhap?.tenKho}</p>
                                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{req.khoNhap?.maKho}</p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 text-[12px] font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(req.ngayTao)}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 text-[12px] font-medium">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {formatDate(req.ngayGiaoDuKien)}
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-bold ${prCfg.color}`}>
                                                    <PrIcon className="h-3.5 w-3.5" /> {prCfg.label}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-[13px] font-medium text-slate-600">
                                                {req.nguoiTao?.hoTen || '-'}
                                            </td>

                                            <td className="px-4 py-4 text-right">
                                                {acceptedTotal !== null ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-black text-[15px] text-emerald-600">{formatCurrency(acceptedTotal)}</span>
                                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">Giá trị chốt</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[12px] font-medium italic">Chưa có dữ liệu</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-indigo-100 hover:text-indigo-700"
                                                                onClick={() => navigate(`/quotation-requests/${req.id}`)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>Xem chi tiết yêu cầu</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </td>
                                        </tr>

                                        {/* ── Expanded PO sub-table (Đơn báo giá con) ── */}
                                        {isExpanded && hasPos && (
                                            <tr>
                                                <td colSpan={9} className="p-0 border-b border-slate-200">
                                                    <div className="bg-slate-50/60 pb-6 pt-2 shadow-inner">
                                                        <div className="pl-14 pr-8">
                                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                                <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                                                    <ListChecks className="h-4 w-4 text-blue-600" />
                                                                    <p className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">Danh sách Báo giá từ NCC thuộc yêu cầu này</p>
                                                                </div>
                                                                <div className="overflow-x-auto custom-scrollbar">
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="border-b border-slate-100 bg-white">
                                                                                <th className="h-10 w-8" />
                                                                                <th className="h-10 px-4 text-left font-bold text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Mã báo giá</th>
                                                                                <th className="h-10 px-4 text-left font-bold text-slate-400 text-[10px] uppercase tracking-widest">Nhà cung cấp</th>
                                                                                <th className="h-10 px-4 text-left font-bold text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Ngày gửi</th>
                                                                                <th className="h-10 px-4 text-left font-bold text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Hạn chót</th>
                                                                                <th className="h-10 px-4 text-center font-bold text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Trạng thái</th>
                                                                                <th className="h-10 px-4 text-left font-bold text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Người tạo (NCC)</th>
                                                                                <th className="h-10 px-4 text-right font-bold text-slate-400 text-[10px] uppercase tracking-widest whitespace-nowrap">Giá NCC báo</th>
                                                                                <th className="h-10 px-4 text-center font-bold text-slate-400 text-[10px] uppercase tracking-widest w-28">Thao tác</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <DonMuaHangRows
                                                                                donMuaHangs={req.donMuaHangs}
                                                                                navigate={navigate}
                                                                                userRoles={userRoles}
                                                                                actionLoading={actionLoading}
                                                                            />
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
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
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-[13px] font-medium text-slate-500 whitespace-nowrap">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[100px] justify-between font-bold border-slate-200 text-[13px] h-9 rounded-xl bg-white hover:bg-slate-50">
                                        {pagination.pageSize} dòng <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[100px] bg-white shadow-lg border border-slate-100 z-50 rounded-xl">
                                    {[5, 10, 20, 50, 100].map(s => (
                                        <DropdownMenuItem key={s} onClick={() => handlePageSizeChange(s)} className="cursor-pointer text-[13px] font-medium py-2 text-center justify-center hover:bg-indigo-50">{s} dòng</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-[13px] text-slate-500 font-medium">
                            Hiển thị <span className="font-bold text-slate-900">{pagination.totalElements === 0 ? 0 : pagination.pageNumber * pagination.pageSize + 1}</span>
                            {' – '}
                            <span className="font-bold text-slate-900">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span>
                            {' trong '}
                            <span className="font-bold text-indigo-600">{pagination.totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 0} className="gap-1 h-9 px-3 text-[13px] font-bold rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                                <ChevronLeft className="h-3.5 w-3.5" /> Trước
                            </Button>
                            <div className="hidden sm:flex gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let p = idx;
                                    if (pagination.totalPages > 5) {
                                        if (pagination.pageNumber < 3) p = idx;
                                        else if (pagination.pageNumber > pagination.totalPages - 4) p = pagination.totalPages - 5 + idx;
                                        else p = pagination.pageNumber - 2 + idx;
                                    }
                                    return (
                                        <Button key={idx} variant={pagination.pageNumber === p ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p)} className={`h-9 w-9 p-0 text-[13px] font-bold rounded-xl ${pagination.pageNumber === p ? "bg-slate-900 text-white shadow-md border-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"}`}>
                                            {p + 1}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber >= pagination.totalPages - 1 || pagination.totalPages === 0} className="gap-1 h-9 px-3 text-[13px] font-bold rounded-xl border-slate-200 bg-white hover:bg-slate-50">
                                Sau <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}