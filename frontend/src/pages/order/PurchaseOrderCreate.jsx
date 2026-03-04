import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogOverlay,
    DialogPortal,
} from "@/components/ui/dialog";
import {
    ChevronDown,
    Plus,
    Trash2,
    Save,
    Send,
    ArrowLeft,
    Building2,
    Package,
    Calendar,
    CheckCircle,
    AlertCircle,
    Loader2,
    Search,
    X,
    Mail,
    FileText,
    RotateCw,
} from "lucide-react";

import purchaseOrderCreateService from '@/services/purchaseOrderCreateService';
import { khoService } from "@/services/khoService";

export default function PurchaseOrderCreate() {
    const navigate = useNavigate();

    // Data State
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [productVariants, setProductVariants] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Form State
    const [loading, setLoading] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const [formData, setFormData] = useState({
        soDonMua: '',
        nhaCungCapId: '',
        khoId: '',
        ngayDatHang: new Date().toISOString().split('T')[0],
        ngayGiaoDuKien: '',
        ghiChu: '',
    });

    const [orderItems, setOrderItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    const generateOrderNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PO${year}${month}${day}${random}`;
    };

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                // Generate Order Number
                setFormData(prev => ({
                    ...prev,
                    soDonMua: generateOrderNumber()
                }));

                // Fetch Suppliers, Variants, and Warehouses
                const [suppliersRes, variantsRes, warehousesRes] = await Promise.all([
                    purchaseOrderCreateService.getAllSuppliers(),
                    purchaseOrderCreateService.getAllProductVariants(),
                    khoService.filter({
                        page: 0,
                        size: 100,
                        filters: [],
                        sorts: []
                    })
                ]);

                // Handle Suppliers Response
                if (suppliersRes && suppliersRes.data) {
                    setSuppliers(suppliersRes.data);
                } else if (Array.isArray(suppliersRes)) {
                    setSuppliers(suppliersRes);
                }

                // Handle Variants Response
                if (variantsRes && variantsRes.data) {
                    setProductVariants(variantsRes.data);
                    setFilteredProducts(variantsRes.data);
                } else if (Array.isArray(variantsRes)) {
                    setProductVariants(variantsRes);
                    setFilteredProducts(variantsRes);
                }

                // Handle Warehouses Response
                if (warehousesRes?.data?.data?.content) {
                    setWarehouses(warehousesRes.data.data.content);
                } else if (warehousesRes?.data?.content) {
                    setWarehouses(warehousesRes.data.content);
                }

            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast.error("Không thể tải dữ liệu ban đầu");
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, []);

    // Filter products
    useEffect(() => {
        if (!productVariants.length) return;

        if (searchTerm.trim() === '') {
            setFilteredProducts(productVariants);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = productVariants.filter(p =>
                (p.tenSanPham?.toLowerCase() || '').includes(lowerTerm) ||
                (p.maBienThe?.toLowerCase() || '').includes(lowerTerm) ||
                (p.thuocTinh?.toLowerCase() || '').includes(lowerTerm)
            );
            setFilteredProducts(filtered);
        }
    }, [searchTerm, productVariants]);

    const showNotification = (type, message) => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddProduct = (product) => {
        const existingIndex = orderItems.findIndex(item => item.bienTheSanPhamId === product.id);

        if (existingIndex >= 0) {
            showNotification('error', 'Sản phẩm đã có trong đơn hàng!');
            return;
        }

        const newItem = {
            bienTheSanPhamId: product.id,
            maBienThe: product.maBienThe,
            tenSanPham: product.tenSanPham,
            thuocTinh: product.thuocTinh,
            donViTinh: product.donViTinh,
            soLuongDat: 1,
            donGia: 0,
            ghiChu: '',
        };

        setOrderItems(prev => [...prev, newItem]);
        setShowProductDialog(false);
        setSearchTerm('');
        showNotification('success', 'Đã thêm sản phẩm vào đơn hàng');
    };

    const handleUpdateItem = (index, field, value) => {
        setOrderItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleRemoveItem = (index) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
        showNotification('success', 'Đã xóa sản phẩm khỏi đơn hàng');
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => {
            return sum + (Number(item.soLuongDat) * Number(item.donGia));
        }, 0);
    };

    const calculateTotalQuantity = () => {
        return orderItems.reduce((sum, item) => sum + Number(item.soLuongDat), 0);
    };

    const validateForm = () => {
        if (!formData.nhaCungCapId) {
            showNotification('error', 'Vui lòng chọn nhà cung cấp');
            return false;
        }

        if (!formData.khoId) {
            showNotification('error', 'Vui lòng chọn kho nhập');
            return false;
        }

        if (!formData.ngayDatHang) {
            showNotification('error', 'Vui lòng chọn ngày đặt hàng');
            return false;
        }

        if (!formData.ngayGiaoDuKien) {
            showNotification('error', 'Vui lòng chọn ngày giao dự kiến');
            return false;
        }

        if (new Date(formData.ngayGiaoDuKien) <= new Date(formData.ngayDatHang)) {
            showNotification('error', 'Ngày giao dự kiến phải sau ngày đặt hàng');
            return false;
        }

        if (orderItems.length === 0) {
            showNotification('error', 'Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
            return false;
        }

        for (let i = 0; i < orderItems.length; i++) {
            const item = orderItems[i];
            if (!item.soLuongDat || item.soLuongDat <= 0) {
                showNotification('error', `Số lượng sản phẩm "${item.tenSanPham}" phải lớn hơn 0`);
                return false;
            }
        }

        return true;
    };

    const handleSaveDraft = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                soDonMua: formData.soDonMua,
                nhaCungCapId: Number(formData.nhaCungCapId),
                ngayDatHang: new Date(formData.ngayDatHang).toISOString(),  // ✅ ISO string
                ngayGiaoDuKien: new Date(formData.ngayGiaoDuKien).toISOString(),  // ✅ ISO string
                ghiChu: formData.ghiChu || '',
                tongTien: calculateTotal(),
                trangThai: 1,
                chiTietDonMuaHangs: orderItems.map(item => ({
                    bienTheSanPhamId: item.bienTheSanPhamId,
                    soLuongDat: Number(item.soLuongDat),
                    soLuongDaNhan: 0,
                    donGia: Number(item.donGia),
                    thanhTien: Number(item.soLuongDat) * Number(item.donGia),
                    ghiChu: item.ghiChu || '',
                })),
            };

            await purchaseOrderCreateService.create(payload, formData.khoId);

            showNotification('success', 'Lưu đơn mua hàng thành công!');

            setTimeout(() => {
                navigate('/purchase-orders');
            }, 2000);
        } catch (error) {
            console.error('Error saving order:', error);
            console.error('Response data:', error.response?.data);

            if (error.response?.status === 409) {
                showNotification('error', 'Mã đơn mua hàng đã tồn tại. Vui lòng tạo lại mã mới.');
            } else {
                showNotification('error', error.response?.data?.message || 'Không thể lưu đơn hàng. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSendToSupplier = () => {
        if (!validateForm()) return;
        setShowSendDialog(true);
    };

    const confirmSendEmail = async () => {
        if (!validateForm()) return;

        setSendingEmail(true);
        try {
            // ✅ Validate supplier exists
            const selectedSupplier = suppliers.find(s => s.id === parseInt(formData.nhaCungCapId));
            if (!selectedSupplier) {
                showNotification('error', 'Nhà cung cấp không tồn tại');
                setSendingEmail(false);
                return;
            }

            // ✅ Validate all products exist
            const invalidProducts = orderItems.filter(item =>
                !productVariants.find(p => p.id === item.bienTheSanPhamId)
            );
            if (invalidProducts.length > 0) {
                showNotification('error', 'Có sản phẩm không hợp lệ trong đơn hàng');
                setSendingEmail(false);
                return;
            }

            const deliveryDate = new Date(formData.ngayGiaoDuKien);
            const orderDate = new Date(formData.ngayDatHang);

            if (isNaN(deliveryDate.getTime()) || isNaN(orderDate.getTime())) {
                showNotification('error', 'Ngày tháng không hợp lệ');
                setSendingEmail(false);
                return;
            }

            const payload = {
                soDonMua: formData.soDonMua,
                nhaCungCapId: Number(formData.nhaCungCapId),
                ngayDatHang: orderDate.toISOString(),
                ngayGiaoDuKien: deliveryDate.toISOString(),
                ghiChu: formData.ghiChu || '',
                tongTien: calculateTotal(),
                trangThai: 3,
                chiTietDonMuaHangs: orderItems.map(item => ({
                    bienTheSanPhamId: Number(item.bienTheSanPhamId), // ✅ Ensure it's a number
                    soLuongDat: Number(item.soLuongDat),
                    soLuongDaNhan: 0,
                    donGia: Number(item.donGia),
                    thanhTien: Number(item.soLuongDat) * Number(item.donGia),
                    ghiChu: item.ghiChu || '',
                })),
            };

            console.log('Payload:', JSON.stringify(payload, null, 2));
            console.log('Selected Supplier:', selectedSupplier);
            console.log('Order Items:', orderItems);

            const response = await purchaseOrderCreateService.create(payload, formData.khoId);

            showNotification('success', `Đã gửi email đến ${selectedSupplier.email} thành công!`);
            setShowSendDialog(false);

            setTimeout(() => {
                navigate('/purchase-orders');
            }, 2000);
        } catch (error) {
            console.error('Error sending email:', error);
            console.error('Error response:', error.response?.data);

            if (error.response?.status === 409) {
                showNotification('error', 'Mã đơn mua hàng đã tồn tại. Vui lòng tạo lại mã mới.');
            } else {
                const errorMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || 'Không thể gửi email. Vui lòng thử lại!';
                showNotification('error', errorMessage);
            }
        } finally {
            setSendingEmail(false);
        }
    };

    const getSelectedSupplier = () => {
        if (!formData.nhaCungCapId) return null;
        return suppliers.find(s => s.id === parseInt(formData.nhaCungCapId));
    };

    const selectedSupplier = getSelectedSupplier();

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => navigate('/purchase-orders')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Tạo đơn mua hàng
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Tạo đơn đặt hàng mới và gửi yêu cầu báo giá đến nhà cung cấp
                        </p>
                    </div>
                </div>
            </div>

            {/* Order Information */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Thông tin đơn hàng
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Số đơn mua */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Số đơn mua <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.soDonMua}
                                    onChange={(e) => handleInputChange('soDonMua', e.target.value)}
                                    className="font-semibold text-indigo-600"
                                    placeholder="Nhập số đơn mua..."
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleInputChange('soDonMua', generateOrderNumber())}
                                    title="Tạo mã mới"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Kho nhập */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Kho nhập <span className="text-red-500">*</span>
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between font-normal"
                                    >
                                        <div className="flex items-center">
                                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                                            <span className="truncate">
                                                {formData.khoId
                                                    ? warehouses.find(k => k.id === formData.khoId)?.tenKho
                                                    : "Chọn kho nhập"}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[300px] max-h-[300px] overflow-y-auto bg-white" align="start">
                                    {warehouses.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-gray-500 italic">
                                            Không có kho nào
                                        </DropdownMenuItem>
                                    ) : (
                                        warehouses.map((kho) => (
                                            <DropdownMenuItem
                                                key={kho.id}
                                                onClick={() => handleInputChange('khoId', kho.id)}
                                                className="cursor-pointer hover:bg-gray-100 py-2 flex flex-col items-start"
                                            >
                                                <span className="font-medium text-gray-900">
                                                    {kho.tenKho}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {kho.diaChi}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Nhà cung cấp */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Nhà cung cấp <span className="text-red-500">*</span>
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between font-normal"
                                    >
                                        <div className="flex items-center overflow-hidden">
                                            <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate">
                                                {selectedSupplier ? selectedSupplier.tenNhaCungCap : "Chọn nhà cung cấp"}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[400px] max-h-[400px] overflow-y-auto bg-white">
                                    {suppliers.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-gray-500 italic">
                                            Không có nhà cung cấp nào
                                        </DropdownMenuItem>
                                    ) : (
                                        suppliers.map((supplier) => (
                                            <DropdownMenuItem
                                                key={supplier.id}
                                                onClick={() => handleInputChange('nhaCungCapId', supplier.id)}
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
                                                        <span className="text-gray-400">
                                                            {supplier.soDienThoai}
                                                        </span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {selectedSupplier && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-gray-600">Người liên hệ:</span>
                                            <span className="ml-2 font-medium">{selectedSupplier.nguoiLienHe}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Điện thoại:</span>
                                            <span className="ml-2 font-medium">{selectedSupplier.soDienThoai}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="ml-2 font-medium text-blue-600">{selectedSupplier.email}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600">Địa chỉ:</span>
                                            <span className="ml-2 font-medium">{selectedSupplier.diaChi}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ngày đặt hàng */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Ngày đặt hàng <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={formData.ngayDatHang}
                                    onChange={(e) => handleInputChange('ngayDatHang', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Ngày giao dự kiến */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">
                                Ngày giao dự kiến <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={formData.ngayGiaoDuKien}
                                    onChange={(e) => handleInputChange('ngayGiaoDuKien', e.target.value)}
                                    min={formData.ngayDatHang}
                                />
                            </div>
                        </div>

                        {/* Ghi chú */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-700 font-medium">
                                Ghi chú
                            </Label>
                            <Textarea
                                placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
                                className="min-h-[100px]"
                                value={formData.ghiChu}
                                onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Package className="h-5 w-5 text-indigo-600" />
                            Chi tiết sản phẩm
                        </CardTitle>
                        <Button
                            onClick={() => setShowProductDialog(true)}
                            className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Thêm sản phẩm
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {orderItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">Chưa có sản phẩm nào</p>
                            <p className="text-sm text-gray-500 mt-1">Nhấn "Thêm sản phẩm" để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="w-[50px]">STT</TableHead>
                                        <TableHead>Mã sản phẩm</TableHead>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead>Thuộc tính</TableHead>
                                        <TableHead className="w-[120px]">Số lượng</TableHead>
                                        <TableHead className="w-[200px]">Ghi chú</TableHead>
                                        <TableHead className="w-[80px]">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orderItems.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-mono text-sm text-indigo-600">
                                                {item.maBienThe}
                                            </TableCell>
                                            <TableCell className="font-medium">{item.tenSanPham}</TableCell>
                                            <TableCell className="text-sm text-gray-600">{item.thuocTinh}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.soLuongDat}
                                                    onChange={(e) => handleUpdateItem(index, 'soLuongDat', e.target.value)}
                                                    className="w-full"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={item.ghiChu}
                                                    onChange={(e) => handleUpdateItem(index, 'ghiChu', e.target.value)}
                                                    className="w-full"
                                                    placeholder="Ghi chú..."
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary */}
            {orderItems.length > 0 && (
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Tổng số mặt hàng</p>
                                <p className="text-3xl font-bold text-gray-900">{orderItems.length}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Tổng số lượng</p>
                                <p className="text-3xl font-bold text-blue-600">{calculateTotalQuantity()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pb-6">
                <Button
                    variant="outline"
                    onClick={() => navigate('/purchase-orders')}
                    className="gap-2"
                >
                    <X className="h-4 w-4" />
                    Hủy
                </Button>
                <Button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="gap-2 bg-gray-600 hover:bg-gray-700"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Lưu nháp
                        </>
                    )}
                </Button>
                <Button
                    onClick={handleSendToSupplier}
                    disabled={loading}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-200"
                >
                    <Send className="h-4 w-4" />
                    Gửi yêu cầu báo giá
                </Button>
            </div>

            {/* Product Selection Dialog */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                {/* Chỉnh sửa: Thay max-w-6xl thành max-w-[95vw] hoặc screen-2xl, thêm overflow-x-hidden */}
                <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-0">
                    <div className="p-6 flex flex-col h-full overflow-x-hidden"> {/* Thêm overflow-x-hidden ở đây */}
                        <DialogHeader className="border-b pb-4 mb-4">
                            <DialogTitle className="flex items-center gap-2 text-lg">
                                <Package className="h-5 w-5 text-indigo-600" />
                                Chọn sản phẩm
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Tìm kiếm và chọn sản phẩm để thêm vào đơn hàng
                            </DialogDescription>
                        </DialogHeader>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm sản phẩm theo tên, mã..."
                                className="pl-9 bg-white text-gray-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Chỉnh sửa: Bọc Table trong một div có overflow-y-auto nhưng KHÔNG có overflow-x-auto */}
                        <div className="flex-1 overflow-y-auto border rounded-lg bg-white shadow-sm overflow-x-hidden">
                            <Table>
                                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                                    <TableRow className="border-b">
                                        <TableHead className="font-semibold text-gray-700">Mã sản phẩm</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Tên sản phẩm</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Thuộc tính</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Tồn kho</TableHead>
                                        <TableHead className="font-semibold text-gray-700 w-[120px] text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                Không tìm thấy sản phẩm phù hợp
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <TableRow key={product.id} className="hover:bg-indigo-50/30 transition-colors">
                                                <TableCell className="font-mono text-sm text-indigo-600 font-medium whitespace-nowrap">
                                                    {product.maBienThe}
                                                </TableCell>
                                                <TableCell className="font-medium text-gray-900">
                                                    {product.tenSanPham}
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-600">
                                                    {product.thuocTinh}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.tonKho > 20 ? 'bg-green-100 text-green-700' :
                                                        product.tonKho > 10 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.tonKho} {product.donViTinh}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddProduct(product)}
                                                        disabled={orderItems.some(item => item.bienTheSanPhamId === product.id)}
                                                        className="gap-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Thêm
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Send Confirmation Dialog */}
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                {/* Apply light theme gradient explicitly to match Add Product Dialog */}
                <DialogContent className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-gray-200 shadow-xl max-w-md w-full">
                    <DialogHeader className="pb-4 border-b border-gray-200">
                        <DialogTitle className="flex items-center gap-2 text-xl text-indigo-700">
                            <Mail className="h-6 w-6" />
                            Xác nhận gửi yêu cầu
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Email yêu cầu báo giá sẽ được gửi đến nhà cung cấp
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSupplier && (
                        <div className="space-y-4 py-2">
                            {/* Supplier Info - Using White Card style */}
                            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
                                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Thông tin nhà cung cấp
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Tên:</span>
                                        <span className="font-medium text-gray-900 text-right">{selectedSupplier.tenNhaCungCap}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium text-blue-600 text-right">{selectedSupplier.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Người liên hệ:</span>
                                        <span className="font-medium text-gray-900 text-right">{selectedSupplier.nguoiLienHe}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info - Using White Card style */}
                            <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
                                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Thông tin đơn hàng
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Số đơn:</span>
                                        <span className="font-mono font-medium text-indigo-600 text-right">{formData.soDonMua}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Số mặt hàng:</span>
                                        <span className="font-medium text-gray-900 text-right">{orderItems.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">Tổng số lượng:</span>
                                        <span className="font-medium text-gray-900 text-right">{calculateTotalQuantity()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Ngày giao DK:</span>
                                        <span className="font-medium text-gray-900 text-right">
                                            {new Date(formData.ngayGiaoDuKien).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-xs text-amber-800 ml-2">
                                    Nhà cung cấp sẽ nhận được email báo giá và cần xác thực trước khi phản hồi.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <DialogFooter className="border-t border-gray-200 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowSendDialog(false)}
                            disabled={sendingEmail}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmSendEmail}
                            disabled={sendingEmail}
                            className="gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md shadow-indigo-200"
                        >
                            {sendingEmail ? (
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
    );
}