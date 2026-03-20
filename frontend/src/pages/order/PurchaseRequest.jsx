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
    Search,
    Calendar,
    Package,
    Filter,
    Download,
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
    DollarSign,
    MoreVertical,
    AlertCircle,
    Send,
    CreditCard,
    Trash2,
} from "lucide-react";
import purchaseOrderService from "../../services/purchaseOrderService";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
    NHAN_VIEN_BAN_HANG: "nhan_vien_ban_hang",
};

/** Các vai trò được phép duyệt đơn hàng */
const APPROVE_ROLES = [
    ROLE.QUAN_TRI_VIEN,
    ROLE.QUAN_LY_KHO,
];

/** Vai trò được phép gửi mail yêu cầu báo giá */
const QUOTATION_REQUEST_ROLES = [
    ROLE.NHAN_VIEN_MUA_HANG,
];

/** Vai trò được phép chấp nhận/từ chối báo giá */
const QUOTATION_RESPONSE_ROLES = [
    ROLE.NHAN_VIEN_MUA_HANG,
];

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
 * vaiTro có thể là string đơn ("quan_tri_vien") hoặc scope space-separated.
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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // User authorization state
    const [userId, setUserId] = useState(null);
    const [userRoles, setUserRoles] = useState([]); // string[]
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
        soDonMua: '',
        nhaCungCapId: '',
        khoId: '',
        trangThai: '',
    });

    // Date range filter state
    const [dateRange, setDateRange] = useState({
        from: '',
        to: '',
    });

    // Trạng thái yêu cầu nhập hàng configuration (trạng thái < 6)
    const statusConfig = {
        0: {
            label: 'Đã hủy',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
            description: 'Yêu cầu nhập hàng đã bị hủy'
        },
        1: {
            label: 'Chờ duyệt',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: AlertCircle,
            description: 'Yêu cầu nhập hàng đang chờ quản lý phê duyệt'
        },
        2: {
            label: 'Đã duyệt',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: CheckCircle,
            description: 'Yêu cầu nhập hàng đã được duyệt nội bộ'
        },
        3: {
            label: 'Đã gửi mail yêu cầu báo giá',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Send,
            description: 'Đã gửi email yêu cầu báo giá đến nhà cung cấp'
        },
        4: {
            label: 'Đã nhận báo giá',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: FileText,
            description: 'Nhà cung cấp đã xác nhận và gửi báo giá'
        },
        5: {
            label: 'Không chấp nhận báo giá',
            color: 'bg-orange-100 text-orange-800 border-orange-200',
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

    // Show notification
    const showNotification = (type, message) => {
        if (type === 'success') {
            setSuccess(message);
            setError(null);
            setTimeout(() => setSuccess(null), 5000);
        } else {
            setError(message);
            setSuccess(null);
            setTimeout(() => setError(null), 5000);
        }
    };

    // Fetch purchase requests from API (chỉ lấy trạng thái < 6)
    const fetchPurchaseOrders = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const filterArray = [];

            // Filter theo số đơn mua
            if (filters.soDonMua) {
                filterArray.push({
                    fieldName: "soDonMua",
                    operation: "LIKE",
                    value: filters.soDonMua,
                    logicType: "AND"
                });
            }

            // Filter theo nhà cung cấp - Sử dụng ID từ relation
            if (filters.nhaCungCapId && filters.nhaCungCapId !== 'all') {
                filterArray.push({
                    fieldName: "nhaCungCap.id",
                    operation: "EQUALS",
                    value: parseInt(filters.nhaCungCapId),
                    logicType: "AND"
                });
            }

            // Filter theo kho - Sử dụng ID từ relation
            if (filters.khoId && filters.khoId !== 'all') {
                filterArray.push({
                    fieldName: "kho.id",
                    operation: "EQUALS",
                    value: parseInt(filters.khoId),
                    logicType: "AND"
                });
            }

            // Filter theo trạng thái - chỉ lấy trạng thái < 6 (yêu cầu nhập hàng)
            filterArray.push({
                fieldName: "trangThai",
                operation: "IN",
                value: [0, 1, 2, 3, 4, 5],
                logicType: "AND"
            });

            // Filter theo trạng thái cụ thể nếu có
            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({
                    fieldName: "trangThai",
                    operation: "EQUALS",
                    value: parseInt(filters.trangThai),
                    logicType: "AND"
                });
            }

            // Date range filter
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

    // ── [FIX 1] Load suppliers — dùng purchaseOrderService.getUniqueSuppliers() giống PO ──
    const loadSuppliers = async () => {
        try {
            console.log('📤 Fetching unique suppliers from purchase orders...');
            const suppliers = await purchaseOrderService.getUniqueSuppliers();
            console.log('✅ Suppliers loaded:', suppliers.length, 'items');
            setSuppliers(suppliers);
            if (suppliers.length === 0) {
                console.warn('⚠️ No suppliers found in orders');
            }
        } catch (error) {
            console.error('❌ Error fetching suppliers:', error);
            showNotification('error', 'Không thể tải danh sách nhà cung cấp');
        }
    };

    // ── [FIX 2] Load warehouses — dùng purchaseOrderService.getUniqueWarehouses() giống PO ──
    const loadWarehouses = async () => {
        try {
            console.log('📤 Fetching unique warehouses from purchase orders...');
            const warehouses = await purchaseOrderService.getUniqueWarehouses();
            console.log('✅ Warehouses loaded:', warehouses.length, 'items');
            setWarehouses(warehouses);
            if (warehouses.length === 0) {
                console.warn('⚠️ No warehouses found in orders');
            }
        } catch (error) {
            console.error('❌ Error fetching warehouses:', error);
            showNotification('error', 'Không thể tải danh sách kho');
        }
    };

    // ── [FIX 3] Load user auth — gọi API /nguoi-dung/get-by-id giống PO ──
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

            // Fetch user details to get roles (giống PO)
            const userResponse = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${userId}`);
            const userData = userResponse.data?.data;

            if (!userData || !userData.vaiTro) throw new Error('User data or roles not found');

            const roles = parseRoles(userData.vaiTro);
            setUserRoles(roles);
        } catch (error) {
            console.error('❌ Error fetching user info:', error);
            setAuthError(error.message);
            showNotification('error', 'Không thể tải thông tin người dùng');
        } finally {
            setLoadingAuth(false);
        }
    };

    // Initialize data
    useEffect(() => {
        loadUserAuth();
        loadSuppliers();
        loadWarehouses();
    }, []);

    // Fetch purchase requests when filters or pagination change
    useEffect(() => {
        if (!loadingAuth && !authError) {
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        }
    }, [filters, dateRange, pagination.pageNumber, pagination.pageSize, loadingAuth, authError]);

    // Handle approve order
    const handleApproveOrder = (order, event) => {
        event?.stopPropagation();
        setSelectedOrder(order);
        setShowApproveDialog(true);
    };

    // ── [FIX 4] Confirm approve order — dùng duyetDon(id, 2) giống PO ──
    const confirmApproveOrder = async () => {
        if (!selectedOrder) return;

        setActionLoading(true);
        try {
            await purchaseOrderService.duyetDon(selectedOrder.id, 2);
            showNotification('success', `Đã phê duyệt yêu cầu nhập hàng ${selectedOrder.soDonMua} thành công!`);
            setShowApproveDialog(false);
            setSelectedOrder(null);
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        } catch (err) {
            console.error('Error approving order:', err);
            showNotification('error', err.response?.data?.message || 'Không thể duyệt yêu cầu nhập hàng');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle send quotation request — navigate sang trang riêng để điền soDonMua + nhaCungCapId
    const handleSendQuotationRequest = (order, event) => {
        event?.stopPropagation();
        navigate(`/purchase-requests/${order.id}/gui-bao-gia`);
    };

    // Handle accept quotation (chỉ cho trạng thái 4)
    const handleAcceptQuotation = async (order, event) => {
        event?.stopPropagation();
        if (order.trangThai !== 4) return;

        setActionLoading(true);
        try {
            await purchaseOrderService.chapNhanBaoGia(order.id);
            showNotification('success', 'Chấp nhận báo giá thành công!');
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        } catch (err) {
            console.error('Error accepting quotation:', err);
            showNotification('error', err.response?.data?.message || 'Không thể chấp nhận báo giá');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle reject quotation (chỉ cho trạng thái 4)
    const handleRejectQuotation = async (order, event) => {
        event?.stopPropagation();
        if (order.trangThai !== 4) return;

        setActionLoading(true);
        try {
            await purchaseOrderService.tuChoiBaoGia(order.id);
            showNotification('success', 'Từ chối báo giá thành công!');
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        } catch (err) {
            console.error('Error rejecting quotation:', err);
            showNotification('error', err.response?.data?.message || 'Không thể từ chối báo giá');
        } finally {
            setActionLoading(false);
        }
    };

    // Render action buttons based on order status and user roles
    const renderActionButtons = (order) => {
        const status = order.trangThai;
        const canApprove = APPROVE_ROLES.some(role => userRoles.includes(role));
        const canSendQuotation = QUOTATION_REQUEST_ROLES.some(role => userRoles.includes(role));
        const authDisabled = loadingAuth || authError;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {/* Duyệt đơn hàng - chỉ trạng thái 1 */}
                    {status === 1 && canApprove && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuItem
                                        onClick={(e) => !authDisabled && handleApproveOrder(order, e)}
                                        disabled={authDisabled}
                                        className="cursor-pointer"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                        Duyệt yêu cầu
                                    </DropdownMenuItem>
                                </TooltipTrigger>
                                {authDisabled && (
                                    <TooltipContent>
                                        <p>Đang tải thông tin xác thực...</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Gửi mail yêu cầu báo giá - chỉ trạng thái 2 */}
                    {status === 2 && canSendQuotation && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuItem
                                        onClick={(e) => !authDisabled && handleSendQuotationRequest(order, e)}
                                        disabled={authDisabled}
                                        className="cursor-pointer"
                                    >
                                        <Send className="mr-2 h-4 w-4 text-blue-600" />
                                        Gửi yêu cầu báo giá
                                    </DropdownMenuItem>
                                </TooltipTrigger>
                                {authDisabled && (
                                    <TooltipContent>
                                        <p>Đang tải thông tin xác thực...</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Chấp nhận báo giá - chỉ trạng thái 4 */}
                    {status === 4 && (
                        <DropdownMenuItem
                            onClick={(e) => handleAcceptQuotation(order, e)}
                            className="cursor-pointer text-green-600"
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Chấp nhận báo giá
                        </DropdownMenuItem>
                    )}

                    {/* Từ chối báo giá - chỉ trạng thái 4 */}
                    {status === 4 && (
                        <DropdownMenuItem
                            onClick={(e) => handleRejectQuotation(order, e)}
                            className="cursor-pointer text-red-600"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Từ chối báo giá
                        </DropdownMenuItem>
                    )}

                    {/* Xem chi tiết */}
                    <DropdownMenuItem
                        onClick={() => navigate(`/purchase-orders/${order.id}`)}
                        className="cursor-pointer"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    // Handle filter changes
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    // Handle date range changes
    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, pageNumber: newPage }));
    };

    // Handle page size change
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, pageNumber: 0, pageSize: newSize }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            soDonMua: '',
            nhaCungCapId: '',
            khoId: '',
            trangThai: '',
        });
        setDateRange({
            from: '',
            to: '',
        });
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    if (loadingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Alert className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {authError}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Yêu cầu nhập hàng</h1>
                        <p className="text-gray-600 mt-1">
                            Quản lý các yêu cầu nhập hàng từ nhà cung cấp
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/purchase-orders/create')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo yêu cầu nhập hàng
                    </Button>
                </div>

                {/* Notifications */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Số đơn mua */}
                            <div>
                                <Label htmlFor="soDonMua">Số đơn mua</Label>
                                <Input
                                    id="soDonMua"
                                    placeholder="Nhập số đơn mua..."
                                    value={filters.soDonMua}
                                    onChange={(e) => handleFilterChange('soDonMua', e.target.value)}
                                />
                            </div>

                            {/* Nhà cung cấp */}
                            <div>
                                <Label htmlFor="nhaCungCapId">Nhà cung cấp</Label>
                                <select
                                    id="nhaCungCapId"
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.nhaCungCapId}
                                    onChange={(e) => handleFilterChange('nhaCungCapId', e.target.value)}
                                >
                                    <option value="">Tất cả nhà cung cấp</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.tenNhaCungCap}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Kho */}
                            <div>
                                <Label htmlFor="khoId">Kho</Label>
                                <select
                                    id="khoId"
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.khoId}
                                    onChange={(e) => handleFilterChange('khoId', e.target.value)}
                                >
                                    <option value="">Tất cả kho</option>
                                    {warehouses.map(warehouse => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.tenKho}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <Label htmlFor="trangThai">Trạng thái</Label>
                                <select
                                    id="trangThai"
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filters.trangThai}
                                    onChange={(e) => handleFilterChange('trangThai', e.target.value)}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <Label htmlFor="fromDate">Từ ngày</Label>
                                <Input
                                    id="fromDate"
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => handleDateRangeChange('from', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="toDate">Đến ngày</Label>
                                <Input
                                    id="toDate"
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => handleDateRangeChange('to', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Filter actions */}
                        <div className="flex gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="border-gray-300"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Purchase Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Danh sách yêu cầu nhập hàng</span>
                            <Badge variant="secondary">
                                {pagination.totalElements} yêu cầu
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Số đơn mua</TableHead>
                                            <TableHead>Nhà cung cấp</TableHead>
                                            <TableHead>Kho</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead>Tổng tiền</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchaseOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12">
                                                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <p className="text-gray-500">Không có yêu cầu nhập hàng nào</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            purchaseOrders.map((order) => {
                                                const statusInfo = statusConfig[order.trangThai] || {};
                                                const StatusIcon = statusInfo.icon || AlertCircle;

                                                return (
                                                    <TableRow key={order.id} className="hover:bg-gray-50">
                                                        <TableCell className="font-medium">
                                                            {order.soDonMua}
                                                        </TableCell>
                                                        <TableCell>
                                                            {order.nhaCungCap?.tenNhaCungCap || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {order.kho?.tenKho || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={statusInfo.color}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(order.ngayTao)}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-green-600">
                                                            {formatCurrency(order.tongTien)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {renderActionButtons(order)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="pageSize">Hiển thị:</Label>
                                    <select
                                        id="pageSize"
                                        value={pagination.pageSize}
                                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                        className="h-8 px-2 py-1 border border-gray-300 rounded text-sm"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                        disabled={pagination.pageNumber === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Trước
                                    </Button>

                                    <span className="text-sm text-gray-600">
                                        Trang {pagination.pageNumber + 1} / {pagination.totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                        disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                    >
                                        Sau
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Approve Dialog */}
                <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-5 w-5" />
                                Duyệt yêu cầu nhập hàng
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                                Bạn có chắc chắn muốn duyệt yêu cầu nhập hàng{" "}
                                <span className="font-semibold text-gray-900">
                                    {selectedOrder?.soDonMua}
                                </span>{" "}
                                không?
                                <br />
                                <br />
                                Sau khi duyệt, yêu cầu sẽ được chuyển sang trạng thái "Đã duyệt" và có thể gửi mail yêu cầu báo giá đến nhà cung cấp.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmApproveOrder}
                                disabled={actionLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {actionLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Duyệt yêu cầu
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </TooltipProvider>
    );
}