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

export default function PurchaseOrderList() {
    const navigate = useNavigate();

    // State management
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showQuotationDialog, setShowQuotationDialog] = useState(false);
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

    // Trạng thái đơn hàng configuration
    const statusConfig = {
        0: {
            label: 'Đã hủy',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
            description: 'Đơn hàng đã bị hủy'
        },
        1: {
            label: 'Chờ duyệt',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: AlertCircle,
            description: 'Đơn hàng đang chờ quản lý phê duyệt'
        },
        2: {
            label: 'Đã duyệt',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: CheckCircle,
            description: 'Đơn hàng đã được duyệt nội bộ'
        },
        3: {
            label: 'Đã gửi mail yêu cầu báo giá đến nhà cung cấp',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Send,
            description: 'Đã gửi email yêu cầu đến nhà cung cấp'
        },
        4: {
            label: 'Đã nhận báo giá',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: FileText,
            description: 'Nhà cung cấp đã xác nhận và gửi báo giá'
        },
        5: {
            label: 'Đã thanh toán',
            color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            icon: CreditCard,
            description: 'Đã chấp nhận báo giá và hoàn thành thanh toán'
        },
        6: {
            label: 'Từ chối báo giá của nhà cung cấp',
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

    // Fetch purchase orders from API
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
                    value: parseInt(filters.nhaCungCapId), // Convert to Integer
                    logicType: "AND"
                });
            }

            // Filter theo kho
            if (filters.khoId && filters.khoId !== 'all') {
                filterArray.push({
                    fieldName: "khoNhap.id",
                    operation: "EQUALS",
                    value: parseInt(filters.khoId), // Convert to Integer
                    logicType: "AND"
                });
            }

            // Filter theo trạng thái
            if (filters.trangThai !== '' && filters.trangThai !== 'all') {
                filterArray.push({
                    fieldName: "trangThai",
                    operation: "EQUALS",
                    value: parseInt(filters.trangThai),
                    logicType: "AND"
                });
            }

            // Filter theo khoảng thời gian
            if (dateRange.from) {
                filterArray.push({
                    fieldName: "ngayDatHang",
                    operation: "GREATER_THAN_OR_EQUAL",
                    value: new Date(dateRange.from).toISOString(),
                    logicType: "AND"
                });
            }

            if (dateRange.to) {
                filterArray.push({
                    fieldName: "ngayDatHang",
                    operation: "LESS_THAN_OR_EQUAL",
                    value: new Date(dateRange.to).toISOString(),
                    logicType: "AND"
                });
            }

            const requestBody = {
                filters: filterArray,
                sorts: [
                    {
                        fieldName: "ngayTao",
                        direction: "DESC"
                    }
                ],
                page: page,
                size: size
            };

            console.log('📤 Filter request:', requestBody);

            const response = await purchaseOrderService.filter(requestBody);

            console.log('📥 Response:', response);

            if (response && response.data) {
                setPurchaseOrders(response.data.content || []);
                setPagination({
                    pageNumber: response.data.number || 0,
                    pageSize: response.data.size || 10,
                    totalElements: response.data.totalElements || 0,
                    totalPages: response.data.totalPages || 0,
                });
            }
        } catch (error) {
            console.error('❌ Error fetching purchase orders:', error);
            showNotification('error', 'Không thể tải danh sách đơn mua hàng. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    // Fetch suppliers for filter - Từ purchase orders
    const fetchSuppliers = async () => {
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

    // Fetch warehouses for filter - Từ purchase orders
    const fetchWarehouses = async () => {
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

    // Fetch user info and roles for authorization
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setLoadingAuth(true);
                setAuthError(null);

                // Get userId from JWT token
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const payload = parseJwt(token);
                if (!payload || !payload.id) {
                    throw new Error('Invalid token payload');
                }

                const userId = payload.id;
                setUserId(userId);

                // Fetch user details to get roles
                const userResponse = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${userId}`);
                const userData = userResponse.data?.data; // Note: API returns { data: userData }

                if (!userData || !userData.vaiTro) {
                    throw new Error('User data or roles not found');
                }

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

        fetchUserInfo();
    }, []);

    // Initial load
    useEffect(() => {
        fetchPurchaseOrders(0, pagination.pageSize);
        fetchSuppliers();
        fetchWarehouses();
    }, []);

    // Handle filter change
    const handleFilterChange = (field, value) => {
        console.log(`🔄 Filter changed - ${field}:`, value);
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Handle date range change
    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    // Handle search
    const handleSearch = () => {
        console.log('🔍 Current filters:', filters);
        console.log('📅 Date range:', dateRange);
        fetchPurchaseOrders(0, pagination.pageSize);
    };

    // Handle reset filters
    const handleResetFilters = () => {
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
        setTimeout(() => {
            fetchPurchaseOrders(0, pagination.pageSize);
        }, 100);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchPurchaseOrders(newPage, pagination.pageSize);
        }
    };

    // Handle page size change
    const handlePageSizeChange = (newSize) => {
        setPagination(prev => ({ ...prev, pageSize: newSize }));
        fetchPurchaseOrders(0, newSize);
    };

    // Handle view detail
    const handleViewDetail = (orderId) => {
        navigate(`/purchase-orders/${orderId}`);
    };
    const handleViewPayment = (orderId) => {
        navigate(`/purchase-orders/${orderId}/payment`);
    }

    // Handle approve order
    const handleApproveOrder = (order, event) => {
        event.stopPropagation();
        setSelectedOrder(order);
        setShowApproveDialog(true);
    };

    // Confirm approve
    const confirmApprove = async () => {
        if (!selectedOrder) return;

        setActionLoading(true);
        try {
            // TODO: Implement approve API
            // await purchaseOrderService.approve(selectedOrder.id);
            await purchaseOrderService.duyetDon(selectedOrder.id, 2);

            showNotification('success', `Đã phê duyệt đơn hàng ${selectedOrder.soDonMua} thành công!`);
            setShowApproveDialog(false);
            setSelectedOrder(null);
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        } catch (error) {
            console.error('Error approving order:', error);
            showNotification('error', 'Không thể phê duyệt đơn hàng. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // Confirm send quotation request
    const confirmSendQuotation = async () => {
        if (!selectedOrder) return;

        setActionLoading(true);
        try {
            // Gửi email yêu cầu báo giá
            await purchaseOrderService.guiMailYeuCauBaoGia(selectedOrder.id);

            // Cập nhật trạng thái đơn hàng thành "Đã gửi mail" (status 3)
            await purchaseOrderService.duyetDon(selectedOrder.id, 3);

            showNotification('success', `Đã gửi email yêu cầu báo giá cho đơn hàng ${selectedOrder.soDonMua} thành công!`);
            setShowQuotationDialog(false);
            setSelectedOrder(null);
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        } catch (error) {
            console.error('Error sending quotation request:', error);
            showNotification('error', 'Không thể gửi email yêu cầu báo giá. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // Handle send quotation request email
    const handleSendQuotationRequest = (order, event) => {
        event.stopPropagation();
        setSelectedOrder(order);
        setShowQuotationDialog(true);
    };

    // Handle cancel order — Không cho phép hủy khi đã gửi mail (3), đã hủy (0) và chưa thỏa mãn (6) không thể thay đổi
    const handleCancelOrder = async (order, event) => {
        event.stopPropagation();
        if (order.trangThai === 0 || order.trangThai === 3 || order.trangThai === 6) {
            showNotification('error', 'Không thể hủy đơn hàng ở trạng thái này!');
            return;
        }

        if (order.trangThai !== 2 && order.trangThai !== 4) {
            showNotification('error', 'Chỉ có thể hủy đơn hàng đã duyệt hoặc đã nhận báo giá!');
            return;
        }

        setActionLoading(true);
        try {
            await purchaseOrderService.duyetDon(order.id, 6);
            showNotification('success', `Đã hủy đơn hàng ${order.soDonMua} thành công!`);
            fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize);
        } catch (error) {
            console.error('Error canceling order:', error);
            showNotification('error', 'Không thể hủy đơn hàng. Vui lòng thử lại!');
        } finally {
            setActionLoading(false);
        }
    };

    // Export to Excel
    const handleExportExcel = async () => {
        try {
            // TODO: Implement export API
            showNotification('success', 'Đang xuất file Excel...');
        } catch (error) {
            console.error('Error exporting:', error);
            showNotification('error', 'Không thể xuất file. Vui lòng thử lại!');
        }
    };

    // Calculate statistics
    const stats = {
        total: pagination.totalElements,
        totalValue: purchaseOrders.reduce((sum, order) => sum + (order.tongTien || 0), 0),
        pending: purchaseOrders.filter(o => o.trangThai === 1).length,
        approved: purchaseOrders.filter(o => o.trangThai === 2 || o.trangThai === 3 || o.trangThai === 4).length,
        completed: purchaseOrders.filter(o => o.trangThai === 5).length,
        cancelled: purchaseOrders.filter(o => o.trangThai === 0 || o.trangThai === 6).length,
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const StatusIcon = statusConfig[status]?.icon || Clock;
        return <StatusIcon className="h-4 w-4" />;
    };

    // Get selected supplier name
    const getSelectedSupplierName = () => {
        if (!filters.nhaCungCapId || filters.nhaCungCapId === 'all') {
            return "Tất cả nhà cung cấp";
        }
        const supplier = suppliers.find(s => s.id === parseInt(filters.nhaCungCapId));
        return supplier ? supplier.tenNhaCungCap : "Đang tải...";
    };

    // Get selected warehouse name
    const getSelectedWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') {
            return "Tất cả kho";
        }
        const warehouse = warehouses.find(w => w.id === parseInt(filters.khoId));
        return warehouse ? warehouse.tenKho : "Đang tải...";
    };

    // Render action buttons based on order status
    const renderActionButtons = (order) => {
        // Kiểm tra trạng thái có cho phép thao tác không
        const canModify = order.trangThai !== 0 && order.trangThai !== 6;

        // Kiểm tra quyền duyệt đơn hàng
        const canApprove = APPROVE_ROLES.some(role => userRoles.includes(role));

        // Disable tất cả buttons khi đang load auth hoặc có lỗi auth
        const authDisabled = loadingAuth || authError;

        return (
            <TooltipProvider>
                <div className="flex items-center justify-center gap-1">
                    {/* Xem chi tiết */}
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
                            <p>{authDisabled ? "Đang tải thông tin người dùng..." : "Xem chi tiết đơn hàng"}</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Thanh toán */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={order.trangThai !== 4 || authDisabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (order.trangThai === 4 && !authDisabled) handleViewPayment(order.id);
                                    }}
                                >
                                    <CreditCard className={`h-4 w-4 ${
                                        authDisabled || order.trangThai !== 4
                                            ? 'text-gray-300'
                                            : 'text-blue-600'
                                    }`} />
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {authDisabled
                                    ? "Đang tải thông tin người dùng..."
                                    : order.trangThai === 4
                                        ? "Thanh toán đơn hàng"
                                        : order.trangThai === 5
                                            ? "Đơn hàng đã thanh toán"
                                            : "Chỉ có thể thanh toán khi đã nhận báo giá"
                                }
                            </p>
                        </TooltipContent>
                    </Tooltip>

                {/* Trạng thái = Chờ duyệt (status 1) */}
                {order.trangThai === 1 && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={!canModify || !canApprove || authDisabled}
                                        onClick={(e) => canModify && canApprove && !authDisabled && handleApproveOrder(order, e)}
                                    >
                                        <CheckCircle className={`h-4 w-4 ${
                                            authDisabled || !canModify || !canApprove
                                                ? 'text-gray-300'
                                                : 'text-green-600'
                                        }`} />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {authDisabled
                                        ? "Đang tải thông tin người dùng..."
                                        : !canModify
                                            ? "Đơn hàng đã kết thúc, không thể thao tác"
                                            : !canApprove
                                                ? "Bạn không có quyền duyệt đơn hàng"
                                                : "Duyệt đơn hàng"
                                    }
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}

                {/* Trạng thái = Đã duyệt (status 2) - Gửi mail yêu cầu báo giá */}
                {order.trangThai === 2 && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={authDisabled || !QUOTATION_REQUEST_ROLES.some(role => userRoles.includes(role))}
                                        onClick={(e) => !authDisabled && QUOTATION_REQUEST_ROLES.some(role => userRoles.includes(role)) && handleSendQuotationRequest(order, e)}
                                    >
                                        <Send className={`h-4 w-4 ${
                                            authDisabled || !QUOTATION_REQUEST_ROLES.some(role => userRoles.includes(role))
                                                ? 'text-gray-300'
                                                : 'text-blue-600'
                                        }`} />
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>
                                    {authDisabled
                                        ? "Đang tải thông tin người dùng..."
                                        : !QUOTATION_REQUEST_ROLES.some(role => userRoles.includes(role))
                                            ? "Chỉ nhân viên mua hàng mới có thể gửi mail yêu cầu báo giá"
                                            : "Gửi email yêu cầu báo giá đến nhà cung cấp"
                                    }
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </>
                )}

                {/* Nút hủy đơn: Cho phép ở trạng thái 2, 4; không cho phép ở 0, 3, 6 */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={!canModify || (order.trangThai !== 2 && order.trangThai !== 4) || authDisabled}
                                onClick={(e) => canModify && !authDisabled && handleCancelOrder(order, e)}
                            >
                                <XCircle className={`h-4 w-4 ${
                                    authDisabled || !canModify
                                        ? 'text-gray-300'
                                        : order.trangThai === 2 || order.trangThai === 4
                                            ? 'text-red-600'
                                            : 'text-gray-300'
                                }`} />
                            </Button>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                            {authDisabled
                                ? "Đang tải thông tin người dùng..."
                                : !canModify
                                    ? "Đơn hàng đã kết thúc, không thể thao tác"
                                    : order.trangThai === 2 || order.trangThai === 4
                                        ? "Hủy đơn hàng"
                                        : (order.trangThai === 0 || order.trangThai === 6 ? "Đơn hàng đã hủy" : "Không thể hủy đơn hàng ở trạng thái này")
                            }
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
        );
    };

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            {/* Notifications */}
            {success && (
                <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert className="bg-red-50 border-red-200 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}


            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.totalValue)}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-600" />
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

                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-purple-600" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Số đơn mua */}
                        <div className="space-y-2">
                            <Label htmlFor="soDonMua" className="text-gray-700 font-medium">
                                Số đơn mua
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="soDonMua"
                                    placeholder="Tìm số đơn..."
                                    className="pl-9 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={filters.soDonMua}
                                    onChange={(e) => handleFilterChange('soDonMua', e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>

                        {/* Nhà cung cấp - FIXED & IMPROVED */}
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
                                            <span className="truncate">
                                                {getSelectedSupplierName()}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[280px] bg-white shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                                    <DropdownMenuItem
                                        onClick={() => handleFilterChange('nhaCungCapId', 'all')}
                                        className="font-medium hover:bg-indigo-50"
                                    >
                                        Tất cả nhà cung cấp
                                    </DropdownMenuItem>
                                    {suppliers.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-gray-500 italic">
                                            Không có nhà cung cấp nào
                                        </DropdownMenuItem>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <DropdownMenuItem
                                                key={supplier.id}
                                                onClick={() => handleFilterChange('nhaCungCapId', supplier.id)}
                                                className="cursor-pointer hover:bg-indigo-50 py-3"
                                            >
                                                <div className="flex flex-col w-full gap-1">
                                                    <span className="font-medium text-gray-900">
                                                        {supplier.tenNhaCungCap}
                                                    </span>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">
                                                            Mã: {supplier.maNhaCungCap}
                                                        </span>
                                                        {supplier.soDienThoai && (
                                                            <span className="text-gray-400">
                                                                {supplier.soDienThoai}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Kho nhập - IMPROVED */}
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
                                            <span className="truncate">
                                                {getSelectedWarehouseName()}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[280px] bg-white shadow-lg border border-gray-100 z-50 max-h-[400px] overflow-y-auto">
                                    <DropdownMenuItem
                                        onClick={() => handleFilterChange('khoId', 'all')}
                                        className="font-medium hover:bg-indigo-50"
                                    >
                                        Tất cả kho
                                    </DropdownMenuItem>
                                    {warehouses.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-gray-500 italic">
                                            Không có kho nào
                                        </DropdownMenuItem>
                                    ) : (
                                        warehouses.map((warehouse) => (
                                            <DropdownMenuItem
                                                key={warehouse.id}
                                                onClick={() => handleFilterChange('khoId', warehouse.id)}
                                                className="cursor-pointer hover:bg-indigo-50 py-3"
                                            >
                                                <div className="flex flex-col w-full gap-1">
                                                    <span className="font-medium text-gray-900">
                                                        {warehouse.tenKho}
                                                    </span>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-500">
                                                            Mã: {warehouse.maKho}
                                                        </span>
                                                        {warehouse.diaChi && (
                                                            <span className="text-gray-400 truncate max-w-[140px]">
                                                                {warehouse.diaChi}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <Label htmlFor="trangThai" className="text-gray-700 font-medium">
                                Trạng thái
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200 hover:bg-gray-50">
                                        <span className="truncate">
                                            {filters.trangThai !== '' && filters.trangThai !== 'all'
                                                ? statusConfig[filters.trangThai]?.label
                                                : "Tất cả trạng thái"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white shadow-lg border border-gray-100 z-50">
                                    <DropdownMenuItem
                                        onClick={() => handleFilterChange('trangThai', 'all')}
                                        className="font-medium hover:bg-indigo-50"
                                    >
                                        Tất cả trạng thái
                                    </DropdownMenuItem>
                                    {Object.entries(statusConfig).map(([key, config]) => (
                                        <DropdownMenuItem
                                            key={key}
                                            onClick={() => handleFilterChange('trangThai', key)}
                                            className="cursor-pointer hover:bg-indigo-50"
                                        >
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
                            <Label htmlFor="tuNgay" className="text-gray-700 font-medium">
                                Từ ngày
                            </Label>
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
                            <Label htmlFor="denNgay" className="text-gray-700 font-medium">
                                Đến ngày
                            </Label>
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
                        <Button
                            onClick={handleSearch}
                            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm h-10 px-4 rounded-xl font-medium transition-all duration-200"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Tìm kiếm
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 h-10 px-4 rounded-xl font-medium transition-all duration-200"
                        >
                            Đặt lại
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
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
                    Tạo đơn mua
                </Button>
            </div>

            {/* Table Section */}
            <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                    <table className="w-full text-sm">

                        {/* HEADER */}
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-14">
                                    STT
                                </th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Số đơn mua
                                </th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Nhà cung cấp
                                </th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Kho nhập
                                </th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Ngày đặt
                                </th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Ngày giao DK
                                </th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Trạng thái
                                </th>
                                <th className="h-12 px-4 text-right font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Tổng tiền
                                </th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody className="divide-y divide-slate-100">

                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                                            <span className="text-slate-500 font-medium">
                                                Đang tải dữ liệu...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : purchaseOrders.length === 0 ? (

                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                                <Package className="h-10 w-10 text-slate-400" />
                                            </div>

                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    Không tìm thấy đơn hàng
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    Thử thay đổi bộ lọc hoặc tạo đơn mua mới
                                                </p>
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

                                        {/* Số đơn */}
                                        <td className="px-4 py-3.5">
                                            <span className="font-bold text-purple-600 tracking-wide">
                                                {order.soDonMua}
                                            </span>
                                        </td>

                                        {/* Nhà cung cấp */}
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">
                                                {order.nhaCungCap?.tenNhaCungCap}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {order.nhaCungCap?.maNhaCungCap}
                                            </p>
                                        </td>

                                        {/* Kho nhập */}
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">
                                                {order.khoNhap?.tenKho}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {order.khoNhap?.maKho}
                                            </p>
                                        </td>

                                        {/* Ngày đặt */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {formatDate(order.ngayDatHang)}
                                            </div>
                                        </td>

                                        {/* Ngày giao */}
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {formatDate(order.ngayGiaoDuKien)}
                                            </div>
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig[order.trangThai]?.color
                                                    }`}
                                            >
                                                {getStatusIcon(order.trangThai)}
                                                {statusConfig[order.trangThai]?.label}
                                            </span>
                                        </td>

                                        {/* Tổng tiền */}
                                        <td className="px-4 py-3.5 text-right">
                                            <span className="font-semibold text-slate-900">
                                                {formatCurrency(order.tongTien || 0)}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td
                                            className="px-4 py-3.5"
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
                        {/* Left side - Page size selector */}
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
                                        <DropdownMenuItem
                                            key={size}
                                            onClick={() => handlePageSizeChange(size)}
                                            className="cursor-pointer"
                                        >
                                            {size} dòng
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Center - Page info */}
                        <div className="text-sm text-gray-600">
                            Hiển thị{' '}
                            <span className="font-semibold text-gray-900">
                                {pagination.pageNumber * pagination.pageSize + 1}
                            </span>
                            {' '}-{' '}
                            <span className="font-semibold text-gray-900">
                                {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}
                            </span>
                            {' '}trong tổng số{' '}
                            <span className="font-semibold text-indigo-600">{pagination.totalElements}</span> kết quả
                        </div>

                        {/* Right side - Navigation buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                disabled={pagination.pageNumber === 0}
                                className="gap-1 disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </Button>

                            {/* Page numbers */}
                            <div className="hidden sm:flex gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = idx;
                                    } else if (pagination.pageNumber < 3) {
                                        pageNum = idx;
                                    } else if (pagination.pageNumber > pagination.totalPages - 4) {
                                        pageNum = pagination.totalPages - 5 + idx;
                                    } else {
                                        pageNum = pagination.pageNumber - 2 + idx;
                                    }

                                    return (
                                        <Button
                                            key={idx}
                                            variant={pagination.pageNumber === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={
                                                pagination.pageNumber === pageNum
                                                    ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
                                                    : "border-gray-200"
                                            }
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
                                disabled={pagination.pageNumber >= pagination.totalPages - 1}
                                className="gap-1 disabled:opacity-50"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            Xác nhận phê duyệt đơn hàng
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            Bạn có chắc chắn muốn phê duyệt đơn hàng{' '}
                            <span className="font-semibold text-gray-900">{selectedOrder?.soDonMua}</span>?
                            <br />
                            <br />
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                                <p className="text-sm text-blue-900">
                                    <strong>Nhà cung cấp:</strong> {selectedOrder?.nhaCungCap?.tenNhaCungCap}
                                    <br />
                                    <strong>Kho nhập:</strong> {selectedOrder?.khoNhap?.tenKho}
                                    <br />
                                    <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder?.tongTien || 0)}
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmApprove}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang phê duyệt...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Phê duyệt
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Quotation Request Confirmation Dialog */}
            <AlertDialog open={showQuotationDialog} onOpenChange={setShowQuotationDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-blue-600">
                            <Send className="h-5 w-5" />
                            Xác nhận gửi email yêu cầu báo giá
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                            Bạn có chắc chắn muốn gửi email yêu cầu báo giá cho đơn hàng{' '}
                            <span className="font-semibold text-gray-900">{selectedOrder?.soDonMua}</span>?
                            <br />
                            <br />
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
                                <p className="text-sm text-blue-900">
                                    <strong>Nhà cung cấp:</strong> {selectedOrder?.nhaCungCap?.tenNhaCungCap}
                                    <br />
                                    <strong>Email nhà cung cấp:</strong> {selectedOrder?.nhaCungCap?.email || 'Chưa có email'}
                                    <br />
                                    <strong>Kho nhập:</strong> {selectedOrder?.khoNhap?.tenKho}
                                    <br />
                                    <strong>Tổng tiền:</strong> {formatCurrency(selectedOrder?.tongTien || 0)}
                                </p>
                            </div>
                            <br />
                            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                                <strong>Lưu ý:</strong> Sau khi gửi email, trạng thái đơn hàng sẽ chuyển thành "Đã gửi mail".
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSendQuotation}
                            disabled={actionLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {actionLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang gửi email...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Gửi email
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
