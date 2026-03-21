import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "@/services/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    ChevronLeft, ChevronRight, Filter, FileText,
    RefreshCw, CheckCircle, XCircle, Loader2, AlertCircle, Send
} from "lucide-react";
import purchaseOrderService from "../../services/purchaseOrderService";

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

export default function QuotationRequestList() {
    const navigate = useNavigate();

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [userId, setUserId] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    const [pagination, setPagination] = useState({
        pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0,
    });

    const [filters, setFilters] = useState({
        soDonMua: '', nhaCungCapId: '', khoId: '', trangThai: '',
    });

    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    // Cấu hình chỉ có trạng thái 3, 4, 5
    const statusConfig = {
        3: {
            label: 'Đã gửi mail yêu cầu báo giá',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Send,
        },
        4: {
            label: 'Đã nhận báo giá',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: FileText,
        },
        5: {
            label: 'Không chấp nhận báo giá',
            color: 'bg-orange-100 text-orange-800 border-orange-200',
            icon: AlertCircle,
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        });
    };

    // Thêm hàm formatCurrency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency', currency: 'VND',
        }).format(amount || 0);
    };

    const fetchPurchaseOrders = async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const filterArray = [];

            if (filters.soDonMua) filterArray.push({ fieldName: "soDonMua", operation: "LIKE", value: filters.soDonMua, logicType: "AND" });
            if (filters.nhaCungCapId && filters.nhaCungCapId !== 'all') filterArray.push({ fieldName: "nhaCungCap.id", operation: "EQUALS", value: parseInt(filters.nhaCungCapId), logicType: "AND" });
            if (filters.khoId && filters.khoId !== 'all') filterArray.push({ fieldName: "kho.id", operation: "EQUALS", value: parseInt(filters.khoId), logicType: "AND" });

            // CHỈ LẤY TRẠNG THÁI 3, 4, 5
            filterArray.push({
                fieldName: "trangThai",
                operation: "IN",
                value: [3, 4, 5],
                logicType: "AND"
            });

            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({ fieldName: "trangThai", operation: "EQUALS", value: parseInt(filters.trangThai), logicType: "AND" });
            }

            if (dateRange.from) filterArray.push({ fieldName: "ngayTao", operation: "GREATER_THAN_OR_EQUAL", value: dateRange.from, logicType: "AND" });
            if (dateRange.to) filterArray.push({ fieldName: "ngayTao", operation: "LESS_THAN_OR_EQUAL", value: dateRange.to + "T23:59:59", logicType: "AND" });

            const sortArray = [{ fieldName: "ngayTao", direction: "DESC" }];

            const payload = { filters: filterArray, sorts: sortArray, page: page, size: size };
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
            console.error('Error fetching quotation requests:', err);
            setError('Không thể tải danh sách yêu cầu báo giá');
        } finally {
            setLoading(false);
        }
    };

    const loadSuppliers = async () => {
        try {
            const suppliers = await purchaseOrderService.getUniqueSuppliers();
            setSuppliers(suppliers);
        } catch (error) { }
    };

    const loadWarehouses = async () => {
        try {
            const warehouses = await purchaseOrderService.getUniqueWarehouses();
            setWarehouses(warehouses);
        } catch (error) { }
    };

    const loadUserAuth = async () => {
        setLoadingAuth(true);
        setAuthError(null);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) throw new Error('No authentication token found');
            const payload = parseJwt(token);
            if (!payload || !payload.id) throw new Error('Invalid token payload');
            setUserId(payload.id);
            const userResponse = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
            const userData = userResponse.data?.data;
            if (!userData || !userData.vaiTro) throw new Error('User data or roles not found');
            setUserRoles(parseRoles(userData.vaiTro));
        } catch (error) {
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
    }, [filters, dateRange, pagination.pageNumber, pagination.pageSize, loadingAuth, authError]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const clearFilters = () => {
        setFilters({ soDonMua: '', nhaCungCapId: '', khoId: '', trangThai: '' });
        setDateRange({ from: '', to: '' });
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    if (loadingAuth || authError) return null;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Yêu cầu báo giá</h1>
                    <p className="text-gray-600 mt-1">Quản lý các yêu cầu báo giá với nhà cung cấp</p>
                </div>
            </div>

            {/* Notifications */}
            {error && <Alert className="border-red-200 bg-red-50"><AlertCircle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-800">{error}</AlertDescription></Alert>}
            {success && <Alert className="border-green-200 bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">{success}</AlertDescription></Alert>}

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Bộ lọc</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <Label>Trạng thái</Label>
                            <select className="w-full h-10 px-3 py-2 border rounded-md" value={filters.trangThai} onChange={(e) => handleFilterChange('trangThai', e.target.value)}>
                                <option value="">Tất cả trạng thái</option>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" onClick={clearFilters}><RefreshCw className="mr-2 h-4 w-4" /> Xóa bộ lọc</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Danh sách yêu cầu báo giá</span>
                        <Badge variant="secondary">{pagination.totalElements} yêu cầu</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Số đơn mua</TableHead> {/* Thêm cột Số đơn mua */}
                                        <TableHead>Nhà cung cấp</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Tổng tiền</TableHead> {/* Thêm cột Tổng tiền */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchaseOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12">
                                                Không có yêu cầu báo giá nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        purchaseOrders.map((order) => {
                                            const statusInfo = statusConfig[order.trangThai] || {};
                                            const StatusIcon = statusInfo.icon || AlertCircle;
                                            return (
                                                <TableRow
                                                    key={order.id}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => navigate(`/purchase-orders/${order.id}`)}
                                                >
                                                    <TableCell className="font-medium text-blue-600">
                                                        {order.soDonMua ? order.soDonMua.replace(/^PO/, 'RFQ') : '-'}
                                                    </TableCell>

                                                    <TableCell>
                                                        {order.nhaCungCap?.tenNhaCungCap || '-'}
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

                                                    <TableCell className="text-right font-medium text-green-600">
                                                        {formatCurrency(order.tongTien)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}