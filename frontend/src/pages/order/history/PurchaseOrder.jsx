import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Search,
    FileText,
    Calendar,
    Package,
    Filter,
    Download,
    Eye,
    Plus,
    RefreshCw,
    Building2,
    Warehouse,
} from "lucide-react";

export default function PurchaseOrderList() {
    const navigate = useNavigate();

    // State management
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

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
        maNhaCungCap: '',
        maKho: '',
        trangThai: '',
        tuNgay: '',
        denNgay: '',
    });

    // Trạng thái đơn hàng configuration
    const statusConfig = {
        0: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        1: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800 border-blue-200' },
        2: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800 border-purple-200' },
        3: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
        4: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' },
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
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

    // Format datetime
    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Fetch purchase orders from API
    const fetchPurchaseOrders = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            // Build filters array
            const filterArray = [];

            if (filters.soDonMua) {
                filterArray.push({
                    fieldName: "soDonMua",
                    operation: "CONTAINS",
                    value: filters.soDonMua,
                    logicType: "AND"
                });
            }

            if (filters.maNhaCungCap && filters.maNhaCungCap !== 'all') {
                filterArray.push({
                    fieldName: "nhaCungCap.maNhaCungCap",
                    operation: "EQUALS",
                    value: filters.maNhaCungCap,
                    logicType: "AND"
                });
            }

            if (filters.maKho && filters.maKho !== 'all') {
                filterArray.push({
                    fieldName: "khoNhap.maKho",
                    operation: "EQUALS",
                    value: filters.maKho,
                    logicType: "AND"
                });
            }

            if (filters.trangThai !== '' && filters.trangThai !== 'all') {
                filterArray.push({
                    fieldName: "trangThai",
                    operation: "EQUALS",
                    value: filters.trangThai,
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

            /*
            const response = await fetch('/api/v1/don-mua-hang/filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            */

            const result = {
                "status": 200,
                "data": {
                    "content": [
                        {
                            "id": 8,
                            "soDonMua": "PO2024030003",
                            "nhaCungCap": {
                                "id": 1,
                                "maNhaCungCap": "NCC001",
                                "tenNhaCungCap": "Công ty Trung Quốc",
                                "nguoiLienHe": "Nguyễn Văn 3",
                                "soDienThoai": "0241234567",
                                "email": "trantai171003@gmail.com",
                                "diaChi": "Số 10, Đường Lê Lợi, Quận Hoàn Kiếm, Hà Nộii",
                                "trangThai": 0,
                                "ngayTao": "2026-01-21T13:53:09Z",
                                "ngayCapNhat": "2026-02-02T16:24:23Z"
                            },
                            "khoNhap": {
                                "id": 1,
                                "maKho": "KHO01",
                                "tenKho": "Kho Hà Nội - Updated",
                                "diaChi": "Cầu Giấy, Hà Nội",
                                "quanLy": {
                                    "id": 4,
                                    "tenDangNhap": "warehouse1",
                                    "hoTen": "Phạm Văn Hùng",
                                    "email": "hung.pham@fashion.vn",
                                    "soDienThoai": "0934567890",
                                    "vaiTro": "nhan_vien_kho",
                                    "trangThai": 1,
                                    "ngayTao": "2026-01-21T13:53:09Z",
                                    "ngayCapNhat": "2026-01-21T13:53:09Z",
                                    "khoPhuTrach": null
                                },
                                "trangThai": 1,
                                "ngayTao": "2026-01-21T13:53:10Z"
                            },
                            "ngayDatHang": "2026-02-02T16:17:33Z",
                            "ngayGiaoDuKien": "2026-03-02T16:17:33Z",
                            "trangThai": 0,
                            "tongTien": 0,
                            "ghiChu": "Đơn nhập phụ kiện",
                            "nguoiTao": {
                                "id": 1,
                                "tenDangNhap": "admin",
                                "hoTen": "Trần Đức Tài",
                                "email": "trantai17102003@gmail.com",
                                "soDienThoai": "0901234567",
                                "vaiTro": "quan_tri_vien",
                                "trangThai": 1,
                                "ngayTao": "2026-01-21T13:53:09Z",
                                "ngayCapNhat": "2026-02-02T13:08:40Z",
                                "khoPhuTrach": null
                            },
                            "nguoiDuyet": {
                                "id": 1,
                                "tenDangNhap": "admin",
                                "hoTen": "Trần Đức Tài",
                                "email": "trantai17102003@gmail.com",
                                "soDienThoai": "0901234567",
                                "vaiTro": "quan_tri_vien",
                                "trangThai": 1,
                                "ngayTao": "2026-01-21T13:53:09Z",
                                "ngayCapNhat": "2026-02-02T13:08:40Z",
                                "khoPhuTrach": null
                            },
                            "ngayTao": "2026-02-02T17:16:57Z",
                            "ngayCapNhat": "2026-02-02T17:16:57Z",
                            "chiTietDonMuaHangs": [
                                {
                                    "id": 18,
                                    "bienTheSanPham": {
                                        "id": 14,
                                        "mauSac": {
                                            "id": 11,
                                            "maMau": "M011",
                                            "tenMau": "Hồng",
                                            "maMauHex": "#FFC0CB",
                                            "ngayTao": "2026-01-21T13:53:09Z"
                                        },
                                        "size": {
                                            "id": 4,
                                            "maSize": "XL",
                                            "tenSize": "Size XL",
                                            "loaiSize": "chu",
                                            "thuTuSapXep": 4,
                                            "moTa": "Size rất lớn",
                                            "ngayTao": "2026-01-21T13:53:10Z"
                                        },
                                        "chatLieu": {
                                            "id": 1,
                                            "maChatLieu": "CL001",
                                            "tenChatLieu": "Cotton 100%",
                                            "moTa": "Vải cotton tự nhiên 100%, thấm hút tốt.",
                                            "ngayTao": "2026-01-21T13:53:09Z"
                                        },
                                        "maSku": "HSQEQQ123",
                                        "maVachSku": "HSQEQQ123",
                                        "giaVon": 1000000,
                                        "giaBan": 1213000,
                                        "trangThai": 1,
                                        "ngayTao": null,
                                        "ngayCapNhat": "2026-01-25T16:29:58Z",
                                        "anhBienThe": {
                                            "id": 1,
                                            "tepTin": {
                                                "id": 2,
                                                "tenTepGoc": "bien_the_san_pham_ao-hong_1769358586239_0",
                                                "tenTaiLen": "bien_the_san_pham_ao-hong_1769358586239_0",
                                                "tenLuuTru": "bien_the_san_pham_ao-hong_1769358586239_0",
                                                "duongDan": "http://171.244.142.43:9000/fashion/bien_the_san_pham_ao-hong_1769358586239_0",
                                                "loaiTepTin": "IMAGE",
                                                "duoiTep": ".jpg",
                                                "kichCo": null,
                                                "moTa": null,
                                                "ngayTao": "2026-01-25T16:29:46Z",
                                                "ngayCapNhat": null,
                                                "trangThai": 1
                                            },
                                            "trangThai": 1,
                                            "ngayTao": "2026-01-25T16:29:46Z",
                                            "ngayCapNhat": null
                                        }
                                    },
                                    "soLuongDat": 50,
                                    "soLuongDaNhan": 0,
                                    "donGia": 300000,
                                    "thanhTien": 15000000,
                                    "ghiChu": "Test"
                                }
                            ]
                        }
                    ],
                    "pageable": {
                        "pageNumber": 0,
                        "pageSize": 10,
                        "sort": {
                            "empty": false,
                            "sorted": true,
                            "unsorted": false
                        },
                        "offset": 0,
                        "paged": true,
                        "unpaged": false
                    },
                    "last": true,
                    "totalElements": 1,
                    "totalPages": 1,
                    "first": true,
                    "size": 10,
                    "number": 0,
                    "sort": {
                        "empty": false,
                        "sorted": true,
                        "unsorted": false
                    },
                    "numberOfElements": 1,
                    "empty": false
                },
                "error": null,
                "message": "Success",
                "timestamp": "2026-02-03T07:32:53.679+00:00",
                "path": "/api/v1/don-mua-hang/filter"
            };

            if (result.status === 200 && result.data) {
                setPurchaseOrders(result.data.content || []);
                setPagination({
                    pageNumber: result.data.number || 0,
                    pageSize: result.data.size || 10,
                    totalElements: result.data.totalElements || 0,
                    totalPages: result.data.totalPages || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch suppliers for filter
    const fetchSuppliers = async () => {
        try {
            // TODO: Replace with actual API endpoint
            const mockSuppliers = [
                { id: 1, maNhaCungCap: 'NCC001', tenNhaCungCap: 'Công ty Trung Quốc' },
                { id: 2, maNhaCungCap: 'NCC002', tenNhaCungCap: 'Công ty Việt Nam' },
            ];
            setSuppliers(mockSuppliers);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    // Fetch warehouses for filter
    const fetchWarehouses = async () => {
        try {
            // TODO: Replace with actual API endpoint
            const mockWarehouses = [
                { id: 1, maKho: 'KHO01', tenKho: 'Kho Hà Nội' },
                { id: 2, maKho: 'KHO02', tenKho: 'Kho Miền Nam' },
                { id: 3, maKho: 'KHO03', tenKho: 'Kho Miền Trung' },
            ];
            setWarehouses(mockWarehouses);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPurchaseOrders(0, pagination.pageSize);
        fetchSuppliers();
        fetchWarehouses();
    }, []);

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Handle search
    const handleSearch = () => {
        fetchPurchaseOrders(0, pagination.pageSize);
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setFilters({
            soDonMua: '',
            maNhaCungCap: '',
            maKho: '',
            trangThai: '',
            tuNgay: '',
            denNgay: '',
        });
        // Fetch with empty filters
        setTimeout(() => {
            fetchPurchaseOrders(0, pagination.pageSize);
        }, 100);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        fetchPurchaseOrders(newPage, pagination.pageSize);
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

    // Calculate statistics
    const stats = {
        total: pagination.totalElements,
        totalValue: purchaseOrders.reduce((sum, order) => sum + (order.tongTien || 0), 0),
        pending: purchaseOrders.filter(o => o.trangThai === 0).length,
        completed: purchaseOrders.filter(o => o.trangThai === 4).length,
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                        Danh sách đơn đặt mua hàng
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý và theo dõi các đơn đặt mua hàng từ nhà cung cấp
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => fetchPurchaseOrders(pagination.pageNumber, pagination.pageSize)}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Làm mới
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </Button>
                    <Button
                        className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        onClick={() => navigate('/purchase-orders/create')}
                    >
                        <Plus className="h-4 w-4" />
                        Tạo đơn mới
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-purple-900 mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Tổng giá trị</p>
                                <p className="text-2xl font-bold text-blue-900 mt-1">
                                    {formatCurrency(stats.totalValue)}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600 font-medium">Chờ duyệt</p>
                                <p className="text-2xl font-bold text-yellow-900 mt-1">
                                    {stats.pending}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Hoàn thành</p>
                                <p className="text-2xl font-bold text-green-900 mt-1">
                                    {stats.completed}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div> */}

            {/* Filter Section */}
            <Card className="border-0 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5 text-purple-600" />
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
                                    className="pl-9"
                                    value={filters.soDonMua}
                                    onChange={(e) => handleFilterChange('soDonMua', e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                        </div>

                        {/* Nhà cung cấp */}
                        <div className="space-y-2">
                            <Label htmlFor="nhaCungCap" className="text-gray-700 font-medium">
                                Nhà cung cấp
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white">
                                        <div className="flex items-center">
                                            <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="truncate ml-2">
                                                {filters.maNhaCungCap && filters.maNhaCungCap !== 'all'
                                                    ? (suppliers.find(s => s.maNhaCungCap === filters.maNhaCungCap)?.tenNhaCungCap || filters.maNhaCungCap)
                                                    : "Tất cả nhà cung cấp"}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[250px] bg-white">
                                    <DropdownMenuItem onClick={() => handleFilterChange('maNhaCungCap', 'all')}>
                                        Tất cả nhà cung cấp
                                    </DropdownMenuItem>
                                    {suppliers.map((supplier) => (
                                        <DropdownMenuItem
                                            key={supplier.id}
                                            onClick={() => handleFilterChange('maNhaCungCap', supplier.maNhaCungCap)}
                                        >
                                            {supplier.tenNhaCungCap} ({supplier.maNhaCungCap})
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Kho nhập */}
                        <div className="space-y-2">
                            <Label htmlFor="khoNhap" className="text-gray-700 font-medium">
                                Kho nhập
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white">
                                        <div className="flex items-center">
                                            <Warehouse className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="truncate ml-2">
                                                {filters.maKho && filters.maKho !== 'all'
                                                    ? (warehouses.find(w => w.maKho === filters.maKho)?.tenKho || filters.maKho)
                                                    : "Tất cả kho"}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[250px] bg-white">
                                    <DropdownMenuItem onClick={() => handleFilterChange('maKho', 'all')}>
                                        Tất cả kho
                                    </DropdownMenuItem>
                                    {warehouses.map((warehouse) => (
                                        <DropdownMenuItem
                                            key={warehouse.id}
                                            onClick={() => handleFilterChange('maKho', warehouse.maKho)}
                                        >
                                            {warehouse.tenKho} ({warehouse.maKho})
                                        </DropdownMenuItem>
                                    ))}
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
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white">
                                        <span className="truncate">
                                            {filters.trangThai && filters.trangThai !== 'all'
                                                ? statusConfig[filters.trangThai]?.label
                                                : "Tất cả trạng thái"}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')}>
                                        Tất cả trạng thái
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', '0')}>Chờ duyệt</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', '1')}>Đã duyệt</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', '2')}>Đang giao</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', '3')}>Đã hủy</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', '4')}>Hoàn thành</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleSearch}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Tìm kiếm
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                        >
                            Đặt lại
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableHead className="font-semibold text-gray-700 w-[130px]">
                                        Số đơn mua
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Nhà cung cấp
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700">
                                        Kho nhập
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 w-[110px]">
                                        Ngày đặt
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 w-[110px]">
                                        Ngày giao DK
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                                        Trạng thái
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 text-right w-[140px]">
                                        Tổng tiền
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-700 w-[100px] text-center">
                                        Thao tác
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-5 w-5 animate-spin text-purple-600" />
                                                <span className="text-gray-500">Đang tải dữ liệu...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : purchaseOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-12 w-12 text-gray-300" />
                                                <p className="text-gray-500">Không có dữ liệu</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchaseOrders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="hover:bg-purple-50/50 transition-colors cursor-pointer"
                                            onClick={() => handleViewDetail(order.id)}
                                        >
                                            <TableCell className="font-medium text-purple-600">
                                                {order.soDonMua}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {order.nhaCungCap?.tenNhaCungCap}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {order.nhaCungCap?.maNhaCungCap}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">
                                                        {order.khoNhap?.tenKho}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {order.khoNhap?.maKho}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {formatDate(order.ngayDatHang)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    {formatDate(order.ngayGiaoDuKien)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={`${statusConfig[order.trangThai]?.color} border`}
                                                >
                                                    {statusConfig[order.trangThai]?.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-gray-900">
                                                {formatCurrency(order.tongTien || 0)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetail(order.id);
                                                    }}
                                                    className="hover:bg-purple-100 hover:text-purple-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Section */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        {/* Left side - Page size selector */}
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[120px] justify-between font-normal bg-white">
                                        {pagination.pageSize} dòng
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[120px] bg-white">
                                    <DropdownMenuItem onClick={() => handlePageSizeChange(5)}>5 dòng</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePageSizeChange(10)}>10 dòng</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePageSizeChange(20)}>20 dòng</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePageSizeChange(50)}>50 dòng</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePageSizeChange(100)}>100 dòng</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Center - Page info */}
                        <div className="text-sm text-gray-600">
                            Hiển thị {pagination.pageNumber * pagination.pageSize + 1} -{' '}
                            {Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)} của{' '}
                            <span className="font-semibold text-purple-600">{pagination.totalElements}</span> kết quả
                        </div>

                        {/* Right side - Navigation buttons */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                disabled={pagination.pageNumber === 0}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </Button>

                            {/* Page numbers */}
                            <div className="flex gap-1">
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
                                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                                    : ""
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
                                className="gap-1"
                            >
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}