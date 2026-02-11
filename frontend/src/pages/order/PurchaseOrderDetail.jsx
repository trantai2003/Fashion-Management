import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    Building2,
    Warehouse,
    Calendar,
    User,
    FileText,
    Package,
    Edit,
    CheckCircle,
    XCircle,
    Truck,
    Download,
    Printer,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    ShoppingCart,
} from "lucide-react";

import purchaseOrderDetailService from '@/services/purchaseOrderDetailService';

export default function PurchaseOrderDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    // State management
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog states
    const [approveDialog, setApproveDialog] = useState(false);
    const [cancelDialog, setCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Trạng thái đơn hàng configuration
    const statusConfig = {
        0: {
            label: 'Chờ duyệt',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: AlertCircle,
            description: 'Đơn hàng đang chờ phê duyệt'
        },
        1: {
            label: 'Đã duyệt',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: CheckCircle,
            description: 'Đơn hàng đã được phê duyệt'
        },
        2: {
            label: 'Đang giao',
            color: 'bg-purple-100 text-purple-800 border-purple-200',
            icon: Truck,
            description: 'Đơn hàng đang trong quá trình giao'
        },
        3: {
            label: 'Đã hủy',
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
            description: 'Đơn hàng đã bị hủy'
        },
        4: {
            label: 'Hoàn thành',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            description: 'Đơn hàng đã hoàn thành'
        },
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

    // Fetch order detail
    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const result = await purchaseOrderDetailService.getById(id);
            if (result && result.status === 200 && result.data) {
                setOrderData(result.data);
            }
        } catch (error) {
            console.error('Error fetching order detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mock implementation (Deprecated)
    const fetchOrderDetailMock = async () => {
        setLoading(true);
        try {
            /*
            const response = await fetch(`/api/v1/don-mua-hang/filter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filters: [
                        {
                            fieldName: "id",
                            operation: "EQUALS",
                            value: id,
                            logicType: "AND"
                        }
                    ],
                    sorts: [],
                    page: 0,
                    size: 1
                }),
            });

            const result = await response.json();
            */

            // Mock data - giống với data trong PurchaseOrderList
            const result = {
                status: 200,
                data: {
                    content: [
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
                            "tongTien": 15000000,
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
                    ]
                }
            };

            if (result.status === 200 && result.data && result.data.content.length > 0) {
                setOrderData(result.data.content[0]);
            }
        } catch (error) {
            console.error('Error fetching order detail:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (id) {
            fetchOrderDetail();
        }
    }, [id]);

    // Handle approve order
    const handleApproveOrder = async () => {
        setActionLoading(true);
        try {
            // TODO: Call approve API
            const response = await fetch(`/api/v1/don-mua-hang/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                await fetchOrderDetail();
                setApproveDialog(false);
            }
        } catch (error) {
            console.error('Error approving order:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle cancel order
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Vui lòng nhập lý do hủy');
            return;
        }

        setActionLoading(true);
        try {
            // TODO: Call cancel API
            const response = await fetch(`/api/v1/don-mua-hang/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: cancelReason }),
            });

            if (response.ok) {
                await fetchOrderDetail();
                setCancelDialog(false);
                setCancelReason('');
            }
        } catch (error) {
            console.error('Error canceling order:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle export
    const handleExport = () => {
        // TODO: Implement export functionality
        console.log('Export order:', id);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Package className="h-12 w-12 animate-pulse text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-500">Không tìm thấy đơn hàng</p>
                    <Button
                        onClick={() => navigate('/purchase-orders')}
                        className="mt-4"
                        variant="outline"
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const StatusIcon = statusConfig[orderData.trangThai]?.icon || AlertCircle;

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate('/purchase-orders')}
                        className="hover:bg-purple-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Chi tiết đơn đặt mua hàng
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Mã đơn: <span className="font-semibold text-purple-600">{orderData.soDonMua}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handlePrint}
                    >
                        <Printer className="h-4 w-4" />
                        In đơn
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        Xuất file
                    </Button>
                    {orderData.trangThai === 0 && (
                        <>
                            <Button
                                variant="outline"
                                className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setCancelDialog(true)}
                            >
                                <XCircle className="h-4 w-4" />
                                Hủy đơn
                            </Button>
                            <Button
                                className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                onClick={() => setApproveDialog(true)}
                            >
                                <CheckCircle className="h-4 w-4" />
                                Phê duyệt
                            </Button>
                        </>
                    )}
                    {orderData.trangThai === 1 && (
                        <Button
                            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            onClick={() => navigate(`/purchase-orders/${id}/receive`)}
                        >
                            <Package className="h-4 w-4" />
                            Nhập hàng
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Banner */}
            <Card className={`border-0 shadow-md ${statusConfig[orderData.trangThai]?.color}`}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-white/50 rounded-full flex items-center justify-center">
                            <StatusIcon className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">
                                {statusConfig[orderData.trangThai]?.label}
                            </h3>
                            <p className="text-sm opacity-90">
                                {statusConfig[orderData.trangThai]?.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-75">Tổng giá trị đơn hàng</p>
                            <p className="text-2xl font-bold mt-1">
                                {formatCurrency(orderData.tongTien)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Info */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-600" />
                                Thông tin đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Số đơn mua</p>
                                    <p className="font-semibold text-gray-900">{orderData.soDonMua}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                                    <Badge variant="outline" className={`${statusConfig[orderData.trangThai]?.color} border`}>
                                        {statusConfig[orderData.trangThai]?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Ngày đặt hàng
                                    </p>
                                    <p className="font-semibold text-gray-900">{formatDateTime(orderData.ngayDatHang)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Ngày giao dự kiến
                                    </p>
                                    <p className="font-semibold text-gray-900">{formatDate(orderData.ngayGiaoDuKien)}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                                    <p className="text-gray-900">{orderData.ghiChu || 'Không có ghi chú'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product Details */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-purple-600" />
                                Chi tiết sản phẩm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                                            <TableHead className="font-semibold">Sản phẩm</TableHead>
                                            <TableHead className="font-semibold text-center">Màu sắc</TableHead>
                                            <TableHead className="font-semibold text-center">Size</TableHead>
                                            <TableHead className="font-semibold text-center">Chất liệu</TableHead>
                                            <TableHead className="font-semibold text-right">Đơn giá</TableHead>
                                            <TableHead className="font-semibold text-center">SL đặt</TableHead>
                                            <TableHead className="font-semibold text-center">SL đã nhận</TableHead>
                                            <TableHead className="font-semibold text-right">Thành tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orderData.chiTietDonMuaHangs && orderData.chiTietDonMuaHangs.length > 0 ? (
                                            orderData.chiTietDonMuaHangs.map((item, index) => (
                                                <TableRow key={item.id || index} className="hover:bg-purple-50/30">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan && (
                                                                <img
                                                                    src={item.bienTheSanPham.anhBienThe.tepTin.duongDan}
                                                                    alt="Product"
                                                                    className="h-12 w-12 rounded object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-gray-900">
                                                                    {item.bienTheSanPham?.maSku}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {item.bienTheSanPham?.maVachSku}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div
                                                                className="h-6 w-6 rounded-full border-2 border-gray-300"
                                                                style={{ backgroundColor: item.bienTheSanPham?.mauSac?.maMauHex }}
                                                            />
                                                            <span className="text-sm">{item.bienTheSanPham?.mauSac?.tenMau}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="bg-gray-50">
                                                            {item.bienTheSanPham?.size?.maSize}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">
                                                        {item.bienTheSanPham?.chatLieu?.tenChatLieu}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {formatCurrency(item.donGia)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {item.soLuongDat}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            {item.soLuongDaNhan || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-purple-600">
                                                        {formatCurrency(item.thanhTien)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    Chưa có sản phẩm
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Summary */}
                            <div className="border-t bg-gray-50 p-6">
                                <div className="flex justify-end">
                                    <div className="w-80 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tổng số lượng:</span>
                                            <span className="font-semibold">
                                                {orderData.chiTietDonMuaHangs?.reduce((sum, item) => sum + item.soLuongDat, 0) || 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Đã nhận:</span>
                                            <span className="font-semibold text-green-600">
                                                {orderData.chiTietDonMuaHangs?.reduce((sum, item) => sum + (item.soLuongDaNhan || 0), 0) || 0}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg">
                                            <span className="font-semibold text-gray-900">Tổng tiền:</span>
                                            <span className="font-bold text-purple-600">
                                                {formatCurrency(orderData.tongTien)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Additional Info */}
                <div className="space-y-6">
                    {/* Supplier Info */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-purple-600" />
                                Nhà cung cấp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tên nhà cung cấp</p>
                                <p className="font-semibold text-gray-900">{orderData.nhaCungCap?.tenNhaCungCap}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mã NCC</p>
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    {orderData.nhaCungCap?.maNhaCungCap}
                                </Badge>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    Người liên hệ
                                </p>
                                <p className="text-gray-900">{orderData.nhaCungCap?.nguoiLienHe}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    Số điện thoại
                                </p>
                                <p className="text-gray-900">{orderData.nhaCungCap?.soDienThoai}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    Email
                                </p>
                                <p className="text-gray-900 text-sm">{orderData.nhaCungCap?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Địa chỉ
                                </p>
                                <p className="text-gray-900 text-sm">{orderData.nhaCungCap?.diaChi}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warehouse Info */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Warehouse className="h-5 w-5 text-purple-600" />
                                Kho nhập hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Tên kho</p>
                                <p className="font-semibold text-gray-900">{orderData.khoNhap?.tenKho}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mã kho</p>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {orderData.khoNhap?.maKho}
                                </Badge>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    Quản lý kho
                                </p>
                                <p className="text-gray-900">{orderData.khoNhap?.quanLy?.hoTen}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Địa chỉ kho
                                </p>
                                <p className="text-gray-900 text-sm">{orderData.khoNhap?.diaChi}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Info */}
                    <Card className="border-0 shadow-md">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-purple-600" />
                                Thông tin xử lý
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Người tạo</p>
                                <p className="font-semibold text-gray-900">{orderData.nguoiTao?.hoTen}</p>
                                <p className="text-xs text-gray-500">{orderData.nguoiTao?.email}</p>
                            </div>
                            {orderData.nguoiDuyet && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Người duyệt</p>
                                    <p className="font-semibold text-gray-900">{orderData.nguoiDuyet?.hoTen}</p>
                                    <p className="text-xs text-gray-500">{orderData.nguoiDuyet?.email}</p>
                                </div>
                            )}
                            <Separator />
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Ngày tạo</p>
                                <p className="text-gray-900 text-sm">{formatDateTime(orderData.ngayTao)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Cập nhật lần cuối</p>
                                <p className="text-gray-900 text-sm">{formatDateTime(orderData.ngayCapNhat)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Xác nhận phê duyệt
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn phê duyệt đơn đặt mua hàng <strong>{orderData.soDonMua}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setApproveDialog(false)}
                            disabled={actionLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleApproveOrder}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {actionLoading ? 'Đang xử lý...' : 'Phê duyệt'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Xác nhận hủy đơn
                        </DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn hủy đơn đặt mua hàng <strong>{orderData.soDonMua}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="cancelReason" className="text-sm font-medium">
                            Lý do hủy <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="cancelReason"
                            placeholder="Nhập lý do hủy đơn..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="mt-2"
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCancelDialog(false);
                                setCancelReason('');
                            }}
                            disabled={actionLoading}
                        >
                            Đóng
                        </Button>
                        <Button
                            onClick={handleCancelOrder}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}