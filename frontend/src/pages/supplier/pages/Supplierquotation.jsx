import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Building2,
    Package,
    Calendar,
    AlertCircle,
    CheckCircle,
    Loader2,
    Send,
    FileText,
    Clock,
    DollarSign,
    Mail,
    Phone,
    User,
} from "lucide-react";

import supplierQuotationService from '@/services/supplierQuotationService';

import { useLocation, useNavigate } from 'react-router-dom';

export default function SupplierQuotation() {
    const location = useLocation();
    const navigate = useNavigate();

    // Use data passed from login page, or fallback to null (should handle redirect if null)
    // Use data passed from login page, or fallback to null (should handle redirect if null)
    const [orderData] = useState(location.state?.orderData || null);

    useEffect(() => {
        if (!orderData) {
            toast.error('Không tìm thấy thông tin đơn hàng. Vui lòng đăng nhập lại.');
            navigate('/supplier/login');
        }
    }, [orderData, navigate]);

    const [submitting, setSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Form State - Quote Items
    const [quoteItems, setQuoteItems] = useState([]);
    const [supplierNote, setSupplierNote] = useState('');
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

    // Initialize quote items from mock data
    useEffect(() => {
        if (!orderData) return;

        const initialItems = orderData.chiTietDonMuaHangs.map(item => ({
            id: item.id,
            bienTheSanPhamId: item.bienTheSanPham.id,
            maSku: item.bienTheSanPham.maSku,
            tenSanPham: `${item.bienTheSanPham.mauSac?.tenMau} - ${item.bienTheSanPham.size?.tenSize} - ${item.bienTheSanPham.chatLieu?.tenChatLieu}`,
            soLuongDat: item.soLuongDat,
            donGiaDeXuat: 0,
            soLuongCoCap: item.soLuongDat,
            ngayGiaoHang: '',
            ghiChu: item.ghiChu || '',
        }));

        setQuoteItems(initialItems);
        setEstimatedDeliveryDate(orderData.ngayGiaoDuKien?.split('T')[0] || '');
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleUpdateQuoteItem = (index, field, value) => {
        setQuoteItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const calculateItemTotal = (item) => {
        return Number(item.soLuongCoCap) * Number(item.donGiaDeXuat);
    };

    const calculateGrandTotal = () => {
        return quoteItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    };

    const calculateTotalQuantity = () => {
        return quoteItems.reduce((sum, item) => sum + Number(item.soLuongCoCap), 0);
    };

    const validateQuote = () => {
        if (!estimatedDeliveryDate) {
            toast.error('Vui lòng chọn ngày giao hàng dự kiến');
            return false;
        }

        const deliveryDate = new Date(estimatedDeliveryDate);
        const orderDate = new Date(orderData.ngayDatHang);

        if (deliveryDate <= orderDate) {
            toast.error('Ngày giao hàng phải sau ngày đặt hàng');
            return false;
        }

        for (let i = 0; i < quoteItems.length; i++) {
            const item = quoteItems[i];

            if (!item.donGiaDeXuat || item.donGiaDeXuat <= 0) {
                toast.error(`Vui lòng nhập đơn giá hợp lệ cho sản phẩm ${item.tenSanPham}`);
                return false;
            }

            if (!item.soLuongCoCap || item.soLuongCoCap <= 0) {
                toast.error(`Vui lòng nhập số lượng có thể cấp cho sản phẩm ${item.tenSanPham}`);
                return false;
            }

            if (item.soLuongCoCap > item.soLuongDat) {
                toast.error(`Số lượng có thể cấp không được vượt quá số lượng đặt cho sản phẩm ${item.tenSanPham}`);
                return false;
            }
        }

        return true;
    };

    const handleSubmitQuote = () => {
        if (!validateQuote()) return;
        setShowConfirmDialog(true);
    };

    const confirmSubmitQuote = async () => {
        setSubmitting(true);

        try {
            const payload = {
                id: orderData.id,
                ghiChu: supplierNote,
                listChiTietBaoGia: quoteItems.map(item => ({
                    id: item.id,
                    donGiaDeXuat: Number(item.donGiaDeXuat),
                    soLuongCoCap: Number(item.soLuongCoCap),
                    ngayGiaoHang: item.ngayGiaoHang ? new Date(item.ngayGiaoHang).toISOString() : null,
                    ghiChu: item.ghiChu || ''
                })),
            };

            console.log('Sending Quote Payload:', JSON.stringify(payload, null, 2));

            // Call API
            await supplierQuotationService.submitQuote(payload);

            toast.success('Gửi báo giá thành công! Cảm ơn quý đối tác.');
            setShowConfirmDialog(false);

            // Navigate to success page
            setTimeout(() => {
                navigate('/quote-success', { replace: true });
            }, 1000);

        } catch (error) {
            console.error('Error submitting quote:', error);
            const message = error.response?.data?.message || 'Có lỗi xảy ra khi gửi báo giá. Vui lòng thử lại.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!orderData) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 mb-4 shadow-lg shadow-indigo-200">
                        <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Yêu cầu báo giá
                    </h1>
                    <p className="text-gray-600">
                        Vui lòng cung cấp giá và thông tin giao hàng cho đơn đặt hàng bên dưới
                    </p>
                </div>

                {/* Order Information */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Building2 className="h-5 w-5 text-indigo-600" />
                            Thông tin đơn hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Number */}
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Số đơn mua</Label>
                                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <FileText className="h-4 w-4 text-indigo-600" />
                                    <span className="font-semibold text-indigo-700">
                                        {orderData.soDonMua}
                                    </span>
                                </div>
                            </div>

                            {/* Order Date */}
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Ngày đặt hàng</Label>
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-gray-900">
                                        {formatDate(orderData.ngayDatHang)}
                                    </span>
                                </div>
                            </div>

                            {/* Requested Delivery Date */}
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Ngày giao yêu cầu</Label>
                                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span className="font-medium text-amber-700">
                                        {formatDate(orderData.ngayGiaoDuKien)}
                                    </span>
                                </div>
                            </div>

                            {/* Warehouse */}
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-500">Kho nhập</Label>
                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <Package className="h-4 w-4 text-green-600" />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-green-700">
                                            {orderData.khoNhap?.tenKho}
                                        </span>
                                        <span className="text-xs text-green-600">
                                            {orderData.khoNhap?.diaChi}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Note */}
                            {orderData.ghiChu && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-sm text-gray-500">Ghi chú từ khách hàng</Label>
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-gray-700 leading-relaxed">{orderData.ghiChu}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customer Contact Info */}
                        <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-600" />
                                Thông tin liên hệ
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Người đặt</span>
                                        <span className="font-medium text-gray-900">
                                            {orderData.nguoiTao?.hoTen}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Điện thoại</span>
                                        <span className="font-medium text-gray-900">
                                            {orderData.nguoiTao?.soDienThoai}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Email</span>
                                        <span className="font-medium text-blue-600 text-sm">
                                            {orderData.nguoiTao?.email}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quote Items */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5 text-green-600" />
                            Chi tiết sản phẩm - Vui lòng nhập giá
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead className="min-w-[120px]">Mã SKU</TableHead>
                                        <TableHead className="min-w-[250px]">Sản phẩm</TableHead>
                                        <TableHead className="w-[100px] text-center">SL yêu cầu</TableHead>
                                        <TableHead className="w-[120px]">
                                            SL có thể cấp <span className="text-red-500">*</span>
                                        </TableHead>
                                        <TableHead className="w-[150px]">
                                            Đơn giá đề xuất <span className="text-red-500">*</span>
                                        </TableHead>
                                        <TableHead className="w-[150px]">Thành tiền</TableHead>
                                        <TableHead className="w-[150px]">Ngày giao hàng</TableHead>
                                        <TableHead className="w-[200px]">Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quoteItems.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-mono text-sm text-indigo-600 font-semibold">
                                                {item.maSku}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.tenSanPham}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                                    {item.soLuongDat}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={item.soLuongDat}
                                                    value={item.soLuongCoCap}
                                                    onChange={(e) => handleUpdateQuoteItem(index, 'soLuongCoCap', e.target.value)}
                                                    className="w-full"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="1000"
                                                    value={item.donGiaDeXuat}
                                                    onChange={(e) => handleUpdateQuoteItem(index, 'donGiaDeXuat', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Nhập giá..."
                                                />
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-600">
                                                {formatCurrency(calculateItemTotal(item))}
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="date"
                                                    value={item.ngayGiaoHang}
                                                    onChange={(e) => handleUpdateQuoteItem(index, 'ngayGiaoHang', e.target.value)}
                                                    className="w-full"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={item.ghiChu}
                                                    onChange={(e) => handleUpdateQuoteItem(index, 'ghiChu', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Ghi chú..."
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Tổng số mặt hàng</p>
                                <p className="text-3xl font-bold text-gray-900">{quoteItems.length}</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                                <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Tổng số lượng cấp</p>
                                <p className="text-3xl font-bold text-blue-600">{calculateTotalQuantity()}</p>
                            </div>
                            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">Tổng giá trị báo giá</p>
                                <p className="text-3xl font-bold text-green-600">{formatCurrency(calculateGrandTotal())}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Thông tin bổ sung
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Estimated Delivery Date */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Ngày giao hàng dự kiến <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={estimatedDeliveryDate}
                                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                                    min={new Date(orderData.ngayDatHang).toISOString().split('T')[0]}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Ngày giao hàng phải sau ngày đặt hàng ({formatDate(orderData.ngayDatHang)})
                            </p>
                        </div>

                        {/* Supplier Note */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Ghi chú của nhà cung cấp
                            </Label>
                            <Textarea
                                placeholder="Nhập ghi chú về điều khoản thanh toán, vận chuyển, hoặc các thông tin khác..."
                                className="min-h-[120px]"
                                value={supplierNote}
                                onChange={(e) => setSupplierNote(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Important Notes */}
                <Alert className="bg-amber-50 border-amber-200 shadow-md">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900 ml-2">
                        <strong>Lưu ý quan trọng:</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            <li>Vui lòng kiểm tra kỹ số lượng và giá trước khi gửi báo giá</li>
                            <li>Báo giá của bạn sẽ được gửi đến khách hàng để xem xét</li>
                            <li>Sau khi gửi, bạn không thể chỉnh sửa báo giá này</li>
                            <li>Khách hàng sẽ liên hệ lại nếu chấp nhận báo giá</li>
                        </ul>
                    </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex justify-center pb-6">
                    <Button
                        onClick={handleSubmitQuote}
                        disabled={submitting}
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200 px-8"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Đang gửi báo giá...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Gửi báo giá
                            </>
                        )}
                    </Button>
                </div>

                {/* Confirmation Dialog */}
                <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <DialogContent className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl text-indigo-700">
                                <CheckCircle className="h-6 w-6" />
                                Xác nhận gửi báo giá
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Vui lòng xác nhận thông tin báo giá trước khi gửi
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            {/* Quote Summary */}
                            <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Tổng quan báo giá
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Số đơn:</span>
                                        <span className="font-mono font-medium text-indigo-600">
                                            {orderData.soDonMua}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Số mặt hàng:</span>
                                        <span className="font-medium text-gray-900">{quoteItems.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Tổng số lượng:</span>
                                        <span className="font-medium text-gray-900">{calculateTotalQuantity()}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Tổng giá trị:</span>
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(calculateGrandTotal())}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Ngày giao DK:</span>
                                        <span className="font-medium text-gray-900">
                                            {formatDate(estimatedDeliveryDate)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-xs text-blue-800 ml-2">
                                    Sau khi gửi, bạn không thể chỉnh sửa báo giá này. Vui lòng kiểm tra kỹ trước khi xác nhận.
                                </AlertDescription>
                            </Alert>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={submitting}
                            >
                                Kiểm tra lại
                            </Button>
                            <Button
                                onClick={confirmSubmitQuote}
                                disabled={submitting}
                                className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Xác nhận gửi
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}