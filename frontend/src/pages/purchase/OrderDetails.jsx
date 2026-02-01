import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    ArrowLeft,
    Package,
    Calendar,
    MapPin,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    Truck,
    Building2,
    Phone,
    Mail,
    AlertCircle,
    Download,
    Printer,
    Edit,
    Trash2
} from "lucide-react";

export default function ChiTietDonMuaHang() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [donMuaHang, setDonMuaHang] = useState(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [lyDoHuy, setLyDoHuy] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock data - Thay thế bằng API call thực tế
    useEffect(() => {
        fetchDonMuaHang();
    }, [id]);

    const fetchDonMuaHang = async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with actual API call
            // const response = await donMuaHangService.getById(id);

            // Mock data
            setTimeout(() => {
                setDonMuaHang({
                    id: 1,
                    soDonMua: 'DMH-2024-001',
                    nhaCungCap: {
                        id: 1,
                        maNhaCungCap: 'NCC001',
                        tenNhaCungCap: 'Công ty TNHH Vải Việt Nam',
                        nguoiLienHe: 'Nguyễn Văn A',
                        soDienThoai: '0241234567',
                        email: 'contact@vaivietnam.com',
                        diaChi: 'Số 10, Đường Lê Lợi, Quận Hoàn Kiếm, Hà Nội'
                    },
                    khoNhap: {
                        id: 1,
                        maKho: 'KHO01',
                        tenKho: 'Kho Trung tâm Hà Nội',
                        diaChi: 'Số 100 Phố Huế, Quận Hai Bà Trưng, Hà Nội'
                    },
                    ngayDatHang: '2024-01-15T08:30:00',
                    ngayGiaoDuKien: '2024-01-25T00:00:00',
                    trangThai: 1, // 0: Nháp, 1: Đã gửi, 2: Đã duyệt, 3: Nhận một phần, 4: Đã nhận, 5: Đã hủy
                    tongTien: 45750000,
                    ghiChu: 'Đơn hàng gấp, ưu tiên giao trước ngày 25/01',
                    nguoiTao: {
                        id: 8,
                        hoTen: 'Bùi Thị Nga',
                        email: 'nga.bui@fashion.vn'
                    },
                    nguoiDuyet: null,
                    ngayTao: '2024-01-15T08:30:00',
                    ngayCapNhat: '2024-01-15T08:30:00',
                    chiTiet: [
                        {
                            id: 1,
                            bienTheSanPham: {
                                id: 1,
                                maSku: 'AT001-DEN-L-COTTON',
                                sanPham: {
                                    maSanPham: 'AT001',
                                    tenSanPham: 'Áo thun cổ tròn basic'
                                },
                                mauSac: {
                                    tenMau: 'Đen',
                                    maMauHex: '#000000'
                                },
                                size: {
                                    tenSize: 'Size L'
                                },
                                chatLieu: {
                                    tenChatLieu: 'Cotton 100%'
                                }
                            },
                            soLuongDat: 100,
                            soLuongDaNhan: 0,
                            donGia: 85000,
                            thanhTien: 8500000,
                            ghiChu: ''
                        },
                        {
                            id: 2,
                            bienTheSanPham: {
                                id: 2,
                                maSku: 'AT001-TRANG-M-COTTON',
                                sanPham: {
                                    maSanPham: 'AT001',
                                    tenSanPham: 'Áo thun cổ tròn basic'
                                },
                                mauSac: {
                                    tenMau: 'Trắng',
                                    maMauHex: '#FFFFFF'
                                },
                                size: {
                                    tenSize: 'Size M'
                                },
                                chatLieu: {
                                    tenChatLieu: 'Cotton 100%'
                                }
                            },
                            soLuongDat: 150,
                            soLuongDaNhan: 0,
                            donGia: 85000,
                            thanhTien: 12750000,
                            ghiChu: ''
                        },
                        {
                            id: 3,
                            bienTheSanPham: {
                                id: 3,
                                maSku: 'QJ002-XANHDAM-32-JEAN',
                                sanPham: {
                                    maSanPham: 'QJ002',
                                    tenSanPham: 'Quần jean ống đứng'
                                },
                                mauSac: {
                                    tenMau: 'Xanh navy',
                                    maMauHex: '#000080'
                                },
                                size: {
                                    tenSize: 'Size 32'
                                },
                                chatLieu: {
                                    tenChatLieu: 'Vải jean'
                                }
                            },
                            soLuongDat: 80,
                            soLuongDaNhan: 0,
                            donGia: 180000,
                            thanhTien: 14400000,
                            ghiChu: ''
                        },
                        {
                            id: 4,
                            bienTheSanPham: {
                                id: 4,
                                maSku: 'SM003-TRANG-L-KATE',
                                sanPham: {
                                    maSanPham: 'SM003',
                                    tenSanPham: 'Áo sơ mi công sở'
                                },
                                mauSac: {
                                    tenMau: 'Trắng',
                                    maMauHex: '#FFFFFF'
                                },
                                size: {
                                    tenSize: 'Size L'
                                },
                                chatLieu: {
                                    tenChatLieu: 'Kate'
                                }
                            },
                            soLuongDat: 60,
                            soLuongDaNhan: 0,
                            donGia: 125000,
                            thanhTien: 7500000,
                            ghiChu: ''
                        },
                        {
                            id: 5,
                            bienTheSanPham: {
                                id: 5,
                                maSku: 'AK004-DEN-XL-NI',
                                sanPham: {
                                    maSanPham: 'AK004',
                                    tenSanPham: 'Áo khoác hoodie'
                                },
                                mauSac: {
                                    tenMau: 'Đen',
                                    maMauHex: '#000000'
                                },
                                size: {
                                    tenSize: 'Size XL'
                                },
                                chatLieu: {
                                    tenChatLieu: 'Nỉ'
                                }
                            },
                            soLuongDat: 40,
                            soLuongDaNhan: 0,
                            donGia: 320000,
                            thanhTien: 12800000,
                            ghiChu: 'Cần kiểm tra chất lượng kỹ'
                        }
                    ]
                });
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching don mua hang:', error);
            setIsLoading(false);
        }
    };

    const getTrangThaiInfo = (trangThai) => {
        const statusMap = {
            0: { label: 'Nháp', variant: 'secondary', icon: FileText, color: 'text-gray-500' },
            1: { label: 'Đã gửi', variant: 'default', icon: Clock, color: 'text-blue-500' },
            2: { label: 'Đã duyệt', variant: 'default', icon: CheckCircle, color: 'text-green-500' },
            3: { label: 'Nhận một phần', variant: 'default', icon: Truck, color: 'text-yellow-500' },
            4: { label: 'Đã nhận', variant: 'default', icon: Package, color: 'text-green-600' },
            5: { label: 'Đã hủy', variant: 'destructive', icon: XCircle, color: 'text-red-500' }
        };
        return statusMap[trangThai] || statusMap[0];
    };

    const handleApprove = async () => {
        setIsProcessing(true);
        try {
            // TODO: Call API to approve
            // await donMuaHangService.approve(id);

            setTimeout(() => {
                setDonMuaHang(prev => ({
                    ...prev,
                    trangThai: 2,
                    nguoiDuyet: {
                        id: 2,
                        hoTen: 'Trần Thị Lan',
                        email: 'lan.tran@fashion.vn'
                    }
                }));
                setShowApproveDialog(false);
                setIsProcessing(false);
            }, 1000);
        } catch (error) {
            console.error('Error approving:', error);
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!lyDoHuy.trim()) {
            alert('Vui lòng nhập lý do hủy');
            return;
        }

        setIsProcessing(true);
        try {
            // TODO: Call API to cancel
            // await donMuaHangService.cancel(id, lyDoHuy);

            setTimeout(() => {
                setDonMuaHang(prev => ({
                    ...prev,
                    trangThai: 5,
                    ghiChu: `${prev.ghiChu}\n\nLý do hủy: ${lyDoHuy}`
                }));
                setShowCancelDialog(false);
                setLyDoHuy('');
                setIsProcessing(false);
            }, 1000);
        } catch (error) {
            console.error('Error canceling:', error);
            setIsProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    if (!donMuaHang) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Không tìm thấy đơn mua hàng</AlertDescription>
                </Alert>
            </div>
        );
    }

    const statusInfo = getTrangThaiInfo(donMuaHang.trangThai);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/purchase-orders')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Chi tiết đơn mua hàng
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Mã đơn: <span className="font-semibold">{donMuaHang.soDonMua}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant={statusInfo.variant} className="px-4 py-2 text-sm">
                                <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
                                {statusInfo.label}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Thông tin chung */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Thông tin chung
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ngày đặt hàng</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <p className="text-gray-900">{formatDate(donMuaHang.ngayDatHang)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ngày giao dự kiến</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Truck className="h-4 w-4 text-gray-400" />
                                            <p className="text-gray-900">{formatDateOnly(donMuaHang.ngayGiaoDuKien)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Người tạo</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <p className="text-gray-900">{donMuaHang.nguoiTao.hoTen}</p>
                                        </div>
                                    </div>
                                    {donMuaHang.nguoiDuyet && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Người duyệt</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <p className="text-gray-900">{donMuaHang.nguoiDuyet.hoTen}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {donMuaHang.ghiChu && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                                            {donMuaHang.ghiChu}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Chi tiết sản phẩm */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Danh sách sản phẩm ({donMuaHang.chiTiet.length} mặt hàng)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">#</TableHead>
                                                <TableHead>Mã SKU</TableHead>
                                                <TableHead>Sản phẩm</TableHead>
                                                <TableHead>Màu sắc</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead>Chất liệu</TableHead>
                                                <TableHead className="text-right">SL đặt</TableHead>
                                                <TableHead className="text-right">SL nhận</TableHead>
                                                <TableHead className="text-right">Đơn giá</TableHead>
                                                <TableHead className="text-right">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {donMuaHang.chiTiet.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>
                                                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                            {item.bienTheSanPham.maSku}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{item.bienTheSanPham.sanPham.tenSanPham}</p>
                                                            <p className="text-xs text-gray-500">{item.bienTheSanPham.sanPham.maSanPham}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded border border-gray-300"
                                                                style={{ backgroundColor: item.bienTheSanPham.mauSac.maMauHex }}
                                                            />
                                                            <span className="text-sm">{item.bienTheSanPham.mauSac.tenMau}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{item.bienTheSanPham.size.tenSize}</TableCell>
                                                    <TableCell>{item.bienTheSanPham.chatLieu.tenChatLieu}</TableCell>
                                                    <TableCell className="text-right font-medium">{item.soLuongDat}</TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={item.soLuongDaNhan > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                                                            {item.soLuongDaNhan}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.donGia)}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(item.thanhTien)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Tổng cộng */}
                                <div className="mt-6 border-t pt-4">
                                    <div className="flex justify-end">
                                        <div className="w-80">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-600">Tổng số lượng:</span>
                                                <span className="font-medium">
                                                    {donMuaHang.chiTiet.reduce((sum, item) => sum + item.soLuongDat, 0)} sản phẩm
                                                </span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-600">Đã nhận:</span>
                                                <span className="font-medium text-green-600">
                                                    {donMuaHang.chiTiet.reduce((sum, item) => sum + item.soLuongDaNhan, 0)} sản phẩm
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                                <span>Tổng tiền:</span>
                                                <span className="text-purple-600">{formatCurrency(donMuaHang.tongTien)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {donMuaHang.trangThai === 1 && (
                                    <Button
                                        onClick={() => setShowApproveDialog(true)}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Duyệt đơn hàng
                                    </Button>
                                )}

                                {donMuaHang.trangThai === 2 && (
                                    <Button
                                        onClick={() => navigate(`/purchase-orders/${id}/create-receipt`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Tạo phiếu nhập kho
                                    </Button>
                                )}

                                {[0, 1, 2].includes(donMuaHang.trangThai) && (
                                    <Button
                                        onClick={() => navigate(`/purchase-orders/${id}/edit`)}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Chỉnh sửa
                                    </Button>
                                )}

                                <Button
                                    onClick={() => window.print()}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    In đơn hàng
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Xuất Excel
                                </Button>

                                {[0, 1, 2].includes(donMuaHang.trangThai) && (
                                    <Button
                                        onClick={() => setShowCancelDialog(true)}
                                        variant="destructive"
                                        className="w-full"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Hủy đơn hàng
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Nhà cung cấp */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Nhà cung cấp
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tên công ty</label>
                                    <p className="mt-1 text-gray-900 font-medium">{donMuaHang.nhaCungCap.tenNhaCungCap}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Mã NCC</label>
                                    <p className="mt-1 text-gray-900">{donMuaHang.nhaCungCap.maNhaCungCap}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Người liên hệ</label>
                                    <p className="mt-1 text-gray-900">{donMuaHang.nhaCungCap.nguoiLienHe}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Điện thoại</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <a href={`tel:${donMuaHang.nhaCungCap.soDienThoai}`} className="text-blue-600 hover:underline">
                                            {donMuaHang.nhaCungCap.soDienThoai}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Email</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <a href={`mailto:${donMuaHang.nhaCungCap.email}`} className="text-blue-600 hover:underline text-sm">
                                            {donMuaHang.nhaCungCap.email}
                                        </a>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <p className="text-gray-900 text-sm">{donMuaHang.nhaCungCap.diaChi}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Kho nhập */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Kho nhập hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tên kho</label>
                                    <p className="mt-1 text-gray-900 font-medium">{donMuaHang.khoNhap.tenKho}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Mã kho</label>
                                    <p className="mt-1 text-gray-900">{donMuaHang.khoNhap.maKho}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                                    <div className="flex items-start gap-2 mt-1">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                        <p className="text-gray-900 text-sm">{donMuaHang.khoNhap.diaChi}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Lịch sử
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <div className="w-0.5 h-full bg-gray-200"></div>
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-sm font-medium">Đơn hàng được tạo</p>
                                            <p className="text-xs text-gray-500">{formatDate(donMuaHang.ngayTao)}</p>
                                            <p className="text-xs text-gray-600 mt-1">Bởi {donMuaHang.nguoiTao.hoTen}</p>
                                        </div>
                                    </div>

                                    {donMuaHang.trangThai >= 1 && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                {donMuaHang.trangThai > 1 && <div className="w-0.5 h-full bg-gray-200"></div>}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-medium">Đã gửi nhà cung cấp</p>
                                                <p className="text-xs text-gray-500">{formatDate(donMuaHang.ngayCapNhat)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {donMuaHang.nguoiDuyet && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                {donMuaHang.trangThai > 2 && <div className="w-0.5 h-full bg-gray-200"></div>}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="text-sm font-medium">Đơn hàng đã duyệt</p>
                                                <p className="text-xs text-gray-500">{formatDate(donMuaHang.ngayCapNhat)}</p>
                                                <p className="text-xs text-gray-600 mt-1">Bởi {donMuaHang.nguoiDuyet.hoTen}</p>
                                            </div>
                                        </div>
                                    )}

                                    {donMuaHang.trangThai === 5 && (
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-red-600">Đơn hàng đã hủy</p>
                                                <p className="text-xs text-gray-500">{formatDate(donMuaHang.ngayCapNhat)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận duyệt đơn hàng</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn duyệt đơn mua hàng <strong>{donMuaHang.soDonMua}</strong>?
                            Sau khi duyệt, đơn hàng sẽ được gửi đến nhà cung cấp và bạn có thể tạo phiếu nhập kho.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={isProcessing}>
                            Hủy
                        </Button>
                        <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                            {isProcessing ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do hủy đơn mua hàng <strong>{donMuaHang.soDonMua}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Nhập lý do hủy đơn hàng..."
                            value={lyDoHuy}
                            onChange={(e) => setLyDoHuy(e.target.value)}
                            rows={4}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isProcessing}>
                            Đóng
                        </Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={isProcessing}>
                            {isProcessing ? 'Đang xử lý...' : 'Xác nhận hủy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}