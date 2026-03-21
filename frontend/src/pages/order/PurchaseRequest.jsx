import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "@/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Calendar,
    Package,
    Filter,
    Eye,
    Plus,
    RefreshCw,
    Building2,
    Warehouse,
    CheckCircle,
    XCircle,
    Clock,
    FileText,
    Loader2,
    Search,
    AlertCircle,
} from "lucide-react";
import purchaseOrderService from "../../services/purchaseOrderService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse JWT payload (không verify) */
function parseJwt(token) {
    try {
        const b64 = token.split(".")[1];
        return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    } catch { return null; }
}

/**
 * Trích danh sách vai trò từ trường vaiTro của NguoiDungDto.
 */
function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
}

export default function PurchaseRequestList() {
    const navigate = useNavigate();

    // State management
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [error, setError] = useState(null);

    // User authorization state
    const [userId, setUserId] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
    });

    // Filter state
    const [filters, setFilters] = useState({
        nhaCungCapId: '',
        khoId: '',
        trangThai: '',
    });

    // Date range filter state
    const [dateRange, setDateRange] = useState({
        from: '',
        to: '',
    });

    // Trạng thái yêu cầu nhập hàng configuration (chỉ hiển thị 0, 1, 2)
    const statusConfig = {
        0: {
            label: 'Đã hủy',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
        },
        1: {
            label: 'Chờ duyệt',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: Clock,
        },
        2: {
            label: 'Đã duyệt',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: CheckCircle,
        }
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

    // Fetch purchase requests from API
    const fetchPurchaseOrders = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const filterArray = [];

            if (filters.khoId && filters.khoId !== 'all') {
                filterArray.push({
                    fieldName: "kho.id",
                    operation: "EQUALS",
                    value: parseInt(filters.khoId),
                    logicType: "AND"
                });
            }

            // Chỉ lấy các yêu cầu ở trạng thái 0, 1, 2
            filterArray.push({
                fieldName: "trangThai",
                operation: "IN",
                value: [0, 1, 2],
                logicType: "AND"
            });

            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({
                    fieldName: "trangThai",
                    operation: "EQUALS",
                    value: parseInt(filters.trangThai),
                    logicType: "AND"
                });
            }

            if (dateRange.from) {
                filterArray.push({
                    fieldName: "ngayTao",
                    operation: "GREATER_THAN_OR_EQUAL",
                    value: dateRange.from,
                    logicType: "AND"
                });
            }
            if (dateRange.to) {
                filterArray.push({
                    fieldName: "ngayTao",
                    operation: "LESS_THAN_OR_EQUAL",
                    value: dateRange.to + "T23:59:59",
                    logicType: "AND"
                });
            }

            const sortArray = [
                {
                    fieldName: "ngayTao",
                    direction: "DESC"
                }
            ];

            const payload = {
                filters: filterArray,
                sorts: sortArray,
                page: page,
                size: size
            };

            const response = await purchaseOrderService.filter(payload);
            const data = response?.data;

            if (data) {
                setPurchaseOrders(data.content || []);
                setPagination({
                    pageNumber: data.pageable?.pageNumber || 0,
                    pageSize: data.pageable?.pageSize || 10,
                    totalElements: data.totalElements || 0,
                    totalPages: data.totalPages || 0,
                });
            }
        } catch (err) {
            console.error('Error fetching purchase requests:', err);
            setError('Không thể tải danh sách yêu cầu nhập hàng');
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const suppliers = await purchaseOrderService.getUniqueSuppliers();
            setSuppliers(suppliers);
        } catch (error) {
            console.error('❌ Error fetching suppliers:', error);
        }
    };

    const loadWarehouses = async () => {
        try {
            const warehouses = await purchaseOrderService.getUniqueWarehouses();
            setWarehouses(warehouses);
        } catch (error) {
            console.error('❌ Error fetching warehouses:', error);
        }
    };

    const loadUserAuth = async () => {
        setLoadingAuth(true);
        setAuthError(null);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No authentication token found');

            const payload = parseJwt(token);
            if (!payload || !payload.id) throw new Error('Invalid token payload');

            const userId = payload.id;
            setUserId(userId);

            const userResponse = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${userId}`);
            const userData = userResponse.data?.data;

            if (!userData || !userData.vaiTro) throw new Error('User data or roles not found');

            const roles = parseRoles(userData.vaiTro);
            setUserRoles(roles);
        } catch (error) {
            console.error('❌ Error fetching user info:', error);
            setAuthError(error.message);
        } finally {
            setLoadingAuth(false);
        }
    };

    useEffect(() => {
        loadUserAuth();
        loadSuppliers();
        loadWarehouses();
    }, []);

    useEffect(() => {
        if (!loadingAuth && !authError) {
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        }
    }, [pagination.pageNumber, pagination.pageSize, loadingAuth, authError]);

    // Handle filters
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
        fetchPurchaseOrders(0, pagination.pageSize);
    };

    const handleResetFilters = () => {
        setFilters({
            nhaCungCapId: '',
            khoId: '',
            trangThai: '',
        });
        setDateRange({
            from: '',
            to: '',
        });
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
        setTimeout(() => {
            fetchPurchaseOrders(0, pagination.pageSize);
        }, 100);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPagination(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, pageNumber: 0, pageSize: newSize }));
    };

    // Action
    const handleViewDetail = (orderId) => {
        navigate(`/purchase-orders/${orderId}`);
    };

    // UI Helpers
    const getStatusIcon = (status) => {
        const StatusIcon = statusConfig[status]?.icon || AlertCircle;
        return <StatusIcon className="h-4 w-4" />;
    };

    const getSelectedSupplierName = () => {
        if (!filters.nhaCungCapId || filters.nhaCungCapId === 'all') return "Tất cả nhà cung cấp";
        const supplier = suppliers.find(s => s.id === parseInt(filters.nhaCungCapId));
        return supplier ? supplier.tenNhaCungCap : "Đang tải...";
    };

    const getSelectedWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') return "Tất cả kho";
        const warehouse = warehouses.find(w => w.id === parseInt(filters.khoId));
        return warehouse ? warehouse.tenKho : "Đang tải...";
    };

    // Stats
    const stats = {
        total: pagination.totalElements,
        pending: purchaseOrders.filter(o => o.trangThai === 1).length,
        approved: purchaseOrders.filter(o => o.trangThai === 2).length,
        cancelled: purchaseOrders.filter(o => o.trangThai === 0).length,
    };

    // Render Action Buttons (Chỉ hiển thị icon xem chi tiết)
    const renderActionButtons = (order) => {
        const authDisabled = loadingAuth || authError;

        return (
            <TooltipProvider>
                <div className="flex items-center justify-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={authDisabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!authDisabled) handleViewDetail(order.id);
                                    }}
                                >
                                    <Eye className={`h-4 w-4 ${authDisabled ? 'text-gray-300' : 'text-purple-600'}`} />
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{authDisabled ? "Đang tải thông tin người dùng..." : "Xem chi tiết"}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        );
    };

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            {/* Notifications */}
            {error && (
                <Alert className="bg-red-50 border-red-200 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {authError && (
                <Alert className="bg-orange-50 border-orange-200 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">{authError}</AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex justify-end items-center">
                <Button
                    onClick={() => navigate('/purchase-orders')}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                    <Package className="mr-2 h-4 w-4" />
                    Xem đơn mua hàng
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-yellow-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.approved}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-red-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cancelled}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Section */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Nhà cung cấp */}
                        <div className="space-y-2">
                            <Label htmlFor="nhaCungCap" className="text-gray-700 font-medium">
                                Nhà cung cấp {suppliers.length > 0 && `(${suppliers.length})`}
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between font-normal bg-white border-gray-200 hover:bg-gray-50"
                                        disabled={suppliers.length === 0}
                                    >
                                        <div className="flex items-center overflow-hidden">
                                            <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{getSelectedSupplierName()}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[280px] bg-white shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('nhaCungCapId', 'all')} className="font-medium hover:bg-indigo-50">
                                        Tất cả nhà cung cấp
                                    </DropdownMenuItem>
                                    {suppliers.map((supplier) => (
                                        <DropdownMenuItem key={supplier.id} onClick={() => handleFilterChange('nhaCungCapId', supplier.id)} className="cursor-pointer hover:bg-indigo-50 py-3">
                                            <div className="flex flex-col w-full gap-1">
                                                <span className="font-medium text-gray-900">{supplier.tenNhaCungCap}</span>
                                                <span className="text-xs text-gray-500">Mã: {supplier.maNhaCungCap}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Kho nhập */}
                        <div className="space-y-2">
                            <Label htmlFor="khoNhap" className="text-gray-700 font-medium">
                                Kho nhập {warehouses.length > 0 && `(${warehouses.length})`}
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between font-normal bg-white border-gray-200 hover:bg-gray-50"
                                        disabled={warehouses.length === 0}
                                    >
                                        <div className="flex items-center overflow-hidden">
                                            <Warehouse className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">{getSelectedWarehouseName()}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[280px] bg-white shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('khoId', 'all')} className="font-medium hover:bg-indigo-50">
                                        Tất cả kho
                                    </DropdownMenuItem>
                                    {warehouses.map((warehouse) => (
                                        <DropdownMenuItem key={warehouse.id} onClick={() => handleFilterChange('khoId', warehouse.id)} className="cursor-pointer hover:bg-indigo-50 py-3">
                                            <div className="flex flex-col w-full gap-1">
                                                <span className="font-medium text-gray-900">{warehouse.tenKho}</span>
                                                <span className="text-xs text-gray-500">Mã: {warehouse.maKho}</span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <Label htmlFor="trangThai" className="text-gray-700 font-medium">Trạng thái</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200 hover:bg-gray-50">
                                        <span className="truncate">
                                            {filters.trangThai !== '' && filters.trangThai !== 'all' ? statusConfig[filters.trangThai]?.label : "Tất cả trạng thái"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white shadow-lg border border-gray-100 z-50">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')} className="font-medium hover:bg-indigo-50">
                                        Tất cả trạng thái
                                    </DropdownMenuItem>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <DropdownMenuItem key={key} onClick={() => handleFilterChange('trangThai', key)} className="cursor-pointer hover:bg-indigo-50">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(parseInt(key))}
                                                {config.label}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Từ ngày */}
                        <div className="space-y-2">
                            <Label htmlFor="tuNgay" className="text-gray-700 font-medium">Từ ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="tuNgay"
                                    type="date"
                                    className="pl-9 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={dateRange.from}
                                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Đến ngày */}
                        <div className="space-y-2">
                            <Label htmlFor="denNgay" className="text-gray-700 font-medium">Đến ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="denNgay"
                                    type="date"
                                    className="pl-9 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={dateRange.to}
                                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-6">
                        <Button onClick={handleSearch} className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm h-10 px-4 rounded-xl font-medium transition-all duration-200">
                            <Search className="h-4 w-4 mr-2" />
                            Tìm kiếm
                        </Button>
                        <Button variant="outline" onClick={handleResetFilters} className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 h-10 px-4 rounded-xl font-medium transition-all duration-200">
                            Đặt lại
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sub Action Buttons */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 h-10 px-4 rounded-xl font-medium transition-all duration-200 gap-2"
                    onClick={() => fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize)}
                >
                    <RefreshCw className="h-4 w-4" />
                    Làm mới
                </Button>
                <Button
                    className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm gap-2 transition-all duration-200"
                    onClick={() => navigate('/purchase-orders/create')}
                >
                    <Plus className="h-4 w-4" />
                    Tạo yêu cầu nhập hàng
                </Button>
            </div>

            {/* Table Section */}
            <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                    <table className="w-full text-sm">
                        {/* HEADER */}
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-14">STT</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Nhà cung cấp</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Kho nhập</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Ngày tạo</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide">Trạng thái</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-24">Thao tác</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                                            <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : purchaseOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                                <Package className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">Không tìm thấy yêu cầu nhập hàng</p>
                                                <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tạo mới</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                purchaseOrders.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => handleViewDetail(order.id)}
                                        className="transition-colors duration-150 hover:bg-violet-50/50 cursor-pointer"
                                    >
                                        {/* STT */}
                                        <td className="px-4 py-3.5 text-center text-slate-500 text-xs">
                                            {pagination.pageNumber * pagination.pageSize + index + 1}
                                        </td>
                                        {/* Nhà cung cấp */}
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">{order.nhaCungCap?.tenNhaCungCap}</p>
                                            <p className="text-xs text-slate-500">{order.nhaCungCap?.maNhaCungCap}</p>
                                        </td>
                                        {/* Kho nhập */}
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">{order.khoNhap?.tenKho || '-'}</p>
                                            <p className="text-xs text-slate-500">{order.khoNhap?.maKho}</p>
                                        </td>
                                        {/* Ngày tạo */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {formatDate(order.ngayTao)}
                                            </div>
                                        </td>
                                        {/* Trạng thái */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig[order.trangThai]?.color}`}>
                                                {getStatusIcon(order.trangThai)}
                                                {statusConfig[order.trangThai]?.label}
                                            </span>
                                        </td>
                                        {/* Action */}
                                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1">
                                                {renderActionButtons(order)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Section */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Page size selector */}
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                        {pagination.pageSize} dòng
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                    {[5, 10, 20, 50, 100].map(size => (
                                        <DropdownMenuItem key={size} onClick={() => handlePageSizeChange(size)} className="cursor-pointer">
                                            {size} dòng
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Page info */}
                        <div className="text-sm text-gray-600">
                            Hiển thị{' '}
                            <span className="font-semibold text-gray-900">
                                {pagination.totalElements === 0 ? 0 : pagination.pageNumber * pagination.pageSize + 1}
                            </span>
                            {' '}-{' '}
                            <span className="font-semibold text-gray-900">
                                {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}
                            </span>
                            {' '}trong tổng số{' '}
                            <span className="font-semibold text-indigo-600">{pagination.totalElements}</span> kết quả
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                disabled={pagination.pageNumber === 0}
                                className="gap-1 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" /> Trước
                            </Button>

                            <div className="hidden sm:flex gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) pageNum = idx;
                                    else if (pagination.pageNumber < 3) pageNum = idx;
                                    else if (pagination.pageNumber > pagination.totalPages - 4) pageNum = pagination.totalPages - 5 + idx;
                                    else pageNum = pagination.pageNumber - 2 + idx;

                                    return (
                                        <Button
                                            key={idx}
                                            variant={pagination.pageNumber === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={pagination.pageNumber === pageNum ? "bg-slate-900 text-white border border-slate-900 shadow-sm" : "border-gray-200"}
                                        >
                                            {pageNum + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                disabled={pagination.pageNumber >= pagination.totalPages - 1 || pagination.totalPages === 0}
                                className="gap-1 disabled:opacity-50"
                            >
                                Sau <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}