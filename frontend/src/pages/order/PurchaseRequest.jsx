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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Calendar,
    Package,
    Filter,
    Eye,
    Plus,
    RefreshCw,
    Warehouse,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Loader2,
    Search,
    AlertCircle,
} from "lucide-react";
import { purchaseRequestService } from "../../services/purchaseOrderService";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
};

/** Roles được phép duyệt/từ chối yêu cầu mua hàng */
const APPROVE_ROLES = [ROLE.QUAN_TRI_VIEN, ROLE.QUAN_LY_KHO, ROLE.NHAN_VIEN_MUA_HANG];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

export default function PurchaseRequestList() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Action dialog state
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Auth state
    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Pagination
    const [pagination, setPagination] = useState({
        pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0,
    });

    // Filters
    const [filters, setFilters] = useState({ khoId: '', trangThai: '' });
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    /**
     * Trạng thái YeuCauMuaHang:
     *   0 = Từ chối / hủy
     *   1 = Chờ duyệt
     *   2 = Đã duyệt (quản lý kho duyệt)
     */
    const statusConfig = {
        0: { label: 'Đã từ chối', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        1: { label: 'Chờ duyệt',  color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        2: { label: 'Đã duyệt',   color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    };

    const formatDate = (d) => {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const showNotification = (type, msg) => {
        if (type === 'success') { setSuccess(msg); setError(null); setTimeout(() => setSuccess(null), 5000); }
        else { setError(msg); setSuccess(null); setTimeout(() => setError(null), 5000); }
    };

    // ── Fetch data ──────────────────────────────────────────────────────────

    const fetchRequests = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const filterArray = [];

            if (filters.khoId && filters.khoId !== 'all') {
                filterArray.push({ fieldName: "khoNhap.id", operation: "EQUALS", value: parseInt(filters.khoId), logicType: "AND" });
            }
            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({ fieldName: "trangThai", operation: "EQUALS", value: parseInt(filters.trangThai), logicType: "AND" });
            }
            if (dateRange.from) {
                filterArray.push({ fieldName: "ngayTao", operation: "GREATER_THAN_OR_EQUAL", value: dateRange.from, logicType: "AND" });
            }
            if (dateRange.to) {
                filterArray.push({ fieldName: "ngayTao", operation: "LESS_THAN_OR_EQUAL", value: dateRange.to + "T23:59:59", logicType: "AND" });
            }

            // Gọi đúng API: /api/v1/yeu-cau-mua-hang/filter
            const response = await purchaseRequestService.filter({
                filters: filterArray,
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page,
                size,
            });

            const data = response?.data;
            if (data) {
                setRequests(data.content || []);
                setPagination({
                    pageNumber: data.pageable?.pageNumber ?? data.number ?? 0,
                    pageSize:   data.pageable?.pageSize  ?? data.size  ?? size,
                    totalElements: data.totalElements || 0,
                    totalPages:    data.totalPages    || 0,
                });
            }
        } catch (err) {
            console.error('Error fetching purchase requests:', err);
            showNotification('error', 'Không thể tải danh sách yêu cầu nhập hàng');
        } finally {
            setLoading(false);
        }
    };

    /** Lấy danh sách kho từ yêu cầu mua hàng */
    const loadWarehouses = async () => {
        try {
            const response = await purchaseRequestService.filter({
                filters: [], sorts: [{ fieldName: 'ngayTao', direction: 'DESC' }], page: 0, size: 1000,
            });
            const items = response?.data?.content || [];
            const map = new Map();
            items.forEach(r => { if (r.khoNhap?.id) map.set(r.khoNhap.id, r.khoNhap); });
            setWarehouses(Array.from(map.values()).sort((a, b) => (a.tenKho || '').localeCompare(b.tenKho || '')));
        } catch (e) { console.error('Error loading warehouses:', e); }
    };

    const loadUserAuth = async () => {
        setLoadingAuth(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No authentication token');
            const payload = parseJwt(token);
            if (!payload?.id) throw new Error('Invalid token');
            const userRes = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
            const userData = userRes.data?.data;
            if (!userData?.vaiTro) throw new Error('User roles not found');
            setUserRoles(parseRoles(userData.vaiTro));
        } catch (e) {
            console.error('Auth error:', e);
            setAuthError(e.message);
        } finally {
            setLoadingAuth(false);
        }
    };

    useEffect(() => {
        loadUserAuth();
        loadWarehouses();
    }, []);

    useEffect(() => {
        if (!loadingAuth) fetchRequests(0, pagination.pageSize);
    }, [loadingAuth]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const canApprove = APPROVE_ROLES.some(r => userRoles.includes(r));

    const handleApprove = (req, e) => {
        e.stopPropagation();
        setSelectedRequest(req);
        setShowApproveDialog(true);
    };

    const handleReject = (req, e) => {
        e.stopPropagation();
        setSelectedRequest(req);
        setShowRejectDialog(true);
    };

    const confirmApprove = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);
        try {
            // Dùng đúng API: PUT /api/v1/nghiep-vu/yeu-cau-mua-hang/duyet-tu-choi/{id}/2
            await purchaseRequestService.duyet(selectedRequest.id);
            showNotification('success', `Đã duyệt yêu cầu #${selectedRequest.id} thành công!`);
            setShowApproveDialog(false);
            setSelectedRequest(null);
            fetchRequests(pagination.pageNumber, pagination.pageSize);
        } catch (e) {
            console.error('Error approving:', e);
            showNotification('error', 'Không thể duyệt yêu cầu. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    const confirmReject = async () => {
        if (!selectedRequest) return;
        setActionLoading(true);
        try {
            // Dùng đúng API: PUT /api/v1/nghiep-vu/yeu-cau-mua-hang/duyet-tu-choi/{id}/0
            await purchaseRequestService.tuChoi(selectedRequest.id);
            showNotification('success', `Đã từ chối yêu cầu #${selectedRequest.id}!`);
            setShowRejectDialog(false);
            setSelectedRequest(null);
            fetchRequests(pagination.pageNumber, pagination.pageSize);
        } catch (e) {
            console.error('Error rejecting:', e);
            showNotification('error', 'Không thể từ chối yêu cầu. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // ── Filter handlers ──────────────────────────────────────────────────────
    const handleFilterChange = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));
    const handleDateChange = (field, value) => setDateRange(prev => ({ ...prev, [field]: value }));
    const handleSearch = () => { setPagination(prev => ({ ...prev, pageNumber: 0 })); fetchRequests(0, pagination.pageSize); };
    const handleReset = () => {
        setFilters({ khoId: '', trangThai: '' });
        setDateRange({ from: '', to: '' });
        setTimeout(() => fetchRequests(0, pagination.pageSize), 100);
    };
    const handlePageChange = (p) => {
        if (p >= 0 && p < pagination.totalPages) {
            setPagination(prev => ({ ...prev, pageNumber: p }));
            fetchRequests(p, pagination.pageSize);
        }
    };
    const handlePageSizeChange = (s) => {
        setPagination(prev => ({ ...prev, pageNumber: 0, pageSize: s }));
        fetchRequests(0, s);
    };

    // ── Stats ────────────────────────────────────────────────────────────────
    const stats = {
        total:    pagination.totalElements,
        pending:  requests.filter(r => r.trangThai === 1).length,
        approved: requests.filter(r => r.trangThai === 2).length,
        rejected: requests.filter(r => r.trangThai === 0).length,
    };

    const getStatusIcon = (status) => {
        const Icon = statusConfig[status]?.icon || AlertCircle;
        return <Icon className="h-4 w-4" />;
    };
    const getSelectedWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') return "Tất cả kho";
        const w = warehouses.find(w => w.id === parseInt(filters.khoId));
        return w ? w.tenKho : "Đang tải...";
    };

    // ── Render Action Buttons ────────────────────────────────────────────────
    const renderActions = (req) => {
        const authDisabled = loadingAuth || authError;
        const isPending = req.trangThai === 1;
        return (
            <TooltipProvider>
                <div className="flex items-center justify-center gap-1">
                    {/* Xem chi tiết */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon"
                                onClick={(e) => { e.stopPropagation(); navigate(`/purchase-requests/${req.id}`); }}>
                                <Eye className="h-4 w-4 text-purple-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>Xem chi tiết</p></TooltipContent>
                    </Tooltip>

                    {/* Duyệt — chỉ hiển thị khi trạng thái = 1 (Chờ duyệt) */}
                    {isPending && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button variant="ghost" size="icon"
                                        disabled={authDisabled || !canApprove}
                                        onClick={(e) => canApprove && !authDisabled && handleApprove(req, e)}>
                                        <CheckCircle className={`h-4 w-4 ${(!canApprove || authDisabled) ? 'text-gray-300' : 'text-green-600'}`} />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{!canApprove ? "Bạn không có quyền duyệt" : "Duyệt yêu cầu"}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* Từ chối — chỉ hiển thị khi trạng thái = 1 (Chờ duyệt) */}
                    {isPending && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button variant="ghost" size="icon"
                                        disabled={authDisabled || !canApprove}
                                        onClick={(e) => canApprove && !authDisabled && handleReject(req, e)}>
                                        <XCircle className={`h-4 w-4 ${(!canApprove || authDisabled) ? 'text-gray-300' : 'text-red-600'}`} />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{!canApprove ? "Bạn không có quyền từ chối" : "Từ chối yêu cầu"}</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </TooltipProvider>
        );
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            {/* Notifications */}
            {success && (
                <Alert className="bg-green-50 border-green-200"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>
            )}
            {error && (
                <Alert className="bg-red-50 border-red-200"><AlertCircle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Yêu cầu nhập hàng</h1>
                <p className="text-sm text-slate-500">
                    Nhân viên kho tạo yêu cầu → <strong>Quản lý kho duyệt</strong> → Nhân viên mua hàng tạo đơn mua
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng yêu cầu', value: stats.total, bg: 'from-blue-50', iconBg: 'bg-blue-100', Icon: FileText, iconColor: 'text-blue-600' },
                    { label: 'Chờ duyệt',    value: stats.pending, bg: 'from-yellow-50', iconBg: 'bg-yellow-100', Icon: Clock, iconColor: 'text-yellow-600' },
                    { label: 'Đã duyệt',     value: stats.approved, bg: 'from-green-50', iconBg: 'bg-green-100', Icon: CheckCircle, iconColor: 'text-green-600' },
                    { label: 'Đã từ chối',   value: stats.rejected, bg: 'from-red-50', iconBg: 'bg-red-100', Icon: XCircle, iconColor: 'text-red-600' },
                ].map(({ label, value, bg, iconBg, Icon, iconColor }) => (
                    <Card key={label} className={`border-0 shadow-md bg-gradient-to-br ${bg} to-white`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center`}>
                                    <Icon className={`h-6 w-6 ${iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filter */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Filter className="h-5 w-5 text-indigo-600" />Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Kho nhập */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Kho nhập {warehouses.length > 0 && `(${warehouses.length})`}</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200">
                                        <div className="flex items-center overflow-hidden">
                                            <Warehouse className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{getSelectedWarehouseName()}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[260px] bg-white shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('khoId', 'all')} className="font-medium">Tất cả kho</DropdownMenuItem>
                                    {warehouses.map(w => (
                                        <DropdownMenuItem key={w.id} onClick={() => handleFilterChange('khoId', w.id)} className="cursor-pointer py-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{w.tenKho}</p>
                                                <p className="text-xs text-gray-500">{w.maKho}</p>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Trạng thái</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200">
                                        <span className="truncate">
                                            {filters.trangThai !== '' && filters.trangThai !== 'all'
                                                ? statusConfig[filters.trangThai]?.label
                                                : "Tất cả trạng thái"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white shadow-lg border border-gray-100 z-50">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')} className="font-medium">Tất cả trạng thái</DropdownMenuItem>
                                    {Object.entries(statusConfig).map(([key, cfg]) => (
                                        <DropdownMenuItem key={key} onClick={() => handleFilterChange('trangThai', key)} className="cursor-pointer">
                                            <div className="flex items-center gap-2">{getStatusIcon(parseInt(key))}{cfg.label}</div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Từ ngày */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Từ ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-9 border-gray-200" value={dateRange.from} onChange={e => handleDateChange('from', e.target.value)} />
                            </div>
                        </div>

                        {/* Đến ngày */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Đến ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-9 border-gray-200" value={dateRange.to} onChange={e => handleDateChange('to', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSearch} className="bg-slate-900 text-white hover:bg-white hover:text-slate-900 border border-slate-900 h-10 px-4 rounded-xl font-medium">
                            <Search className="h-4 w-4 mr-2" />Tìm kiếm
                        </Button>
                        <Button variant="outline" onClick={handleReset} className="h-10 px-4 rounded-xl font-medium">Đặt lại</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action row */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" className="gap-2 h-10 px-4 rounded-xl"
                    onClick={() => fetchRequests(pagination.pageNumber, pagination.pageSize)}>
                    <RefreshCw className="h-4 w-4" />Làm mới
                </Button>
                <Button className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 gap-2"
                    onClick={() => navigate('/purchase-requests/create')}>
                    <Plus className="h-4 w-4" />Tạo yêu cầu nhập hàng
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-14">STT</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Kho nhập</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Người tạo</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Ngày tạo</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Ngày giao DK</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide">Trạng thái</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-28">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={7} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                                        <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                            <Package className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">Không tìm thấy yêu cầu nhập hàng</p>
                                            <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tạo mới</p>
                                        </div>
                                    </div>
                                </td></tr>
                            ) : requests.map((req, index) => (
                                <tr key={req.id} onClick={() => navigate(`/purchase-requests/${req.id}`)}
                                    className="transition-colors hover:bg-violet-50/50 cursor-pointer">
                                    <td className="px-4 py-3.5 text-center text-slate-500 text-xs">
                                        {pagination.pageNumber * pagination.pageSize + index + 1}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <p className="font-semibold text-slate-900">{req.khoNhap?.tenKho || '-'}</p>
                                        <p className="text-xs text-slate-500">{req.khoNhap?.maKho}</p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <p className="font-semibold text-slate-900">{req.nguoiTao?.hoTen || '-'}</p>
                                        <p className="text-xs text-slate-500">{req.nguoiTao?.email}</p>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(req.ngayTao)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                            <Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(req.ngayGiaoDuKien)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig[req.trangThai]?.color}`}>
                                            {getStatusIcon(req.trangThai)}{statusConfig[req.trangThai]?.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                        {renderActions(req)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[110px] justify-between font-normal bg-white border-gray-200">
                                        {pagination.pageSize} dòng<ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[110px] bg-white shadow-lg border border-gray-100 z-50">
                                    {[5, 10, 20, 50].map(s => (
                                        <DropdownMenuItem key={s} onClick={() => handlePageSizeChange(s)} className="cursor-pointer">{s} dòng</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="text-sm text-gray-600">
                            Hiển thị <span className="font-semibold text-gray-900">{pagination.totalElements === 0 ? 0 : pagination.pageNumber * pagination.pageSize + 1}</span>
                            {' '}-{' '}
                            <span className="font-semibold text-gray-900">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span>
                            {' '}trong{' '}<span className="font-semibold text-indigo-600">{pagination.totalElements}</span> kết quả
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 0} className="gap-1">
                                <ChevronLeft className="h-4 w-4" />Trước
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
                                        className={pagination.pageNumber === p ? "bg-slate-900 text-white border border-slate-900" : "border-gray-200"}>
                                        {p + 1}
                                    </Button>
                                );
                            })}
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                disabled={pagination.pageNumber >= pagination.totalPages - 1 || pagination.totalPages === 0} className="gap-1">
                                Sau<ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />Xác nhận duyệt yêu cầu
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn <strong>duyệt</strong> yêu cầu nhập hàng <strong>#{selectedRequest?.id}</strong>?
                            <br /><br />
                            Sau khi duyệt, nhân viên mua hàng có thể tạo đơn mua hàng và gửi yêu cầu báo giá đến nhà cung cấp.
                            <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-2 text-sm text-green-900">
                                <strong>Kho nhập:</strong> {selectedRequest?.khoNhap?.tenKho}<br />
                                <strong>Người tạo:</strong> {selectedRequest?.nguoiTao?.hoTen}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                            {actionLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</> : <><CheckCircle className="h-4 w-4 mr-2" />Duyệt yêu cầu</>}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-5 w-5" />Xác nhận từ chối yêu cầu
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn <strong>từ chối</strong> yêu cầu nhập hàng <strong>#{selectedRequest?.id}</strong>?
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2 text-sm text-red-900">
                                <strong>Kho nhập:</strong> {selectedRequest?.khoNhap?.tenKho}<br />
                                <strong>Người tạo:</strong> {selectedRequest?.nguoiTao?.hoTen}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                            {actionLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang xử lý...</> : <><XCircle className="h-4 w-4 mr-2" />Từ chối yêu cầu</>}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}