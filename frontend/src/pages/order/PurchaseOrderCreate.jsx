import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
} from "@/components/ui/dialog";
import {
    ChevronDown,
    Plus,
    Trash2,
    Send,
    ArrowLeft,
    Building2,
    Package,
    CheckCircle,
    Calendar,
    AlertCircle,
    Loader2,
    Search,
    Mail,
    FileText,
    RotateCw,
    MapPin,
    Phone,
    User,
    ShoppingCart,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

import purchaseOrderCreateService from '@/services/purchaseOrderCreateService';
import { khoService } from "@/services/khoService";

// ── Shared components for lux-sync layout ──────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col h-full items-stretch">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-bold text-slate-800 text-[14px]">{title}</p>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-5 justify-start">{children}</div>
        </div>
    );
}

function InfoField({ label, value, mono = false, icon: Icon, children }) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
                {label}
            </div>
            <div className="flex-1 flex items-start mt-0.5">
                {children ?? (
                    <p className={`text-[14px] font-semibold text-slate-800 ${mono ? "font-mono font-bold tracking-tight" : ""}`}>
                        {value || "—"}
                    </p>
                )}
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────

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
                        filters: []
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
                if (warehousesRes && warehousesRes.data && warehousesRes.data.data.content) {
                    setWarehouses(warehousesRes.data.data.content);
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
            donViTinh: product.donViTinh || '',
            soLuongDat: 1,
            donGia: 0,
            ghiChu: '',
            anhBienThe: product.anhBienThe || null, // Capture image if available
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

            const response = await purchaseOrderCreateService.create(payload, formData.khoId);

            showNotification('success', `Đã gửi điện đến ${selectedSupplier.email} thành công!`);
            setShowSendDialog(false);

            setTimeout(() => {
                navigate('/purchase-orders');
            }, 2000);
        } catch (error) {
            console.error('Error sending email:', error);

            if (error.response?.status === 409) {
                showNotification('error', 'Mã đơn mua hàng đã tồn tại. Vui lòng tạo lại mã mới.');
            } else {
                const errorMessage = error.response?.data?.message
                    || error.response?.data?.error
                    || 'Không thể gửi yêu cầu. Vui lòng thử lại!';
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

    const selectedWarehouse = formData.khoId ? warehouses.find(k => k.id === formData.khoId) : null;


    if (isLoadingData) {
        return (
            <div className="p-5 space-y-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-[#b8860b]" />
                    <span className="text-[15px] font-medium text-slate-600">Đang khởi tạo biểu mẫu...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync">
            
            {/* ── Top Header and Navigation ── */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/purchase-orders")}
                    className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>
            </div>

            {/* ── Info Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                {/* Card Thông tin đơn */}
                <SectionCard title="Thiết lập chứng từ" icon={FileText} iconBg="bg-amber-100" iconColor="text-amber-600">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Số Đơn <span className="text-rose-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.soDonMua}
                                    onChange={(e) => handleInputChange('soDonMua', e.target.value)}
                                    className="h-11 font-mono font-bold text-[#8b6a21] rounded-xl border-slate-200 shadow-sm pr-9 text-[15px] focus-visible:ring-slate-500 flex-1"
                                    placeholder="Mã đơn tự sinh"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleInputChange('soDonMua', generateOrderNumber())}
                                    className="h-11 w-11 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-700 shrink-0"
                                    title="Tái tạo mã"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Kho Tiếp Nhận <span className="text-rose-500">*</span>
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 justify-between font-medium rounded-xl border-slate-200 hover:bg-slate-50 px-4 text-[14px]"
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Package className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                {selectedWarehouse ? selectedWarehouse.tenKho : "Chọn kho nhập..."}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[300px] max-h-[300px] overflow-y-auto bg-white rounded-xl shadow-lg border-slate-100" align="start">
                                    {warehouses.length === 0 ? (
                                        <DropdownMenuItem disabled className="text-slate-500 italic p-3">
                                            Không có danh mục kho
                                        </DropdownMenuItem>
                                    ) : (
                                        warehouses.map((kho) => (
                                            <DropdownMenuItem
                                                key={kho.id}
                                                onClick={() => handleInputChange('khoId', kho.id)}
                                                className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100 p-3 flex flex-col items-start gap-1 rounded-lg mx-1 my-0.5"
                                            >
                                                <span className="font-bold text-slate-800">
                                                    {kho.tenKho}
                                                </span>
                                                <span className="text-[13px] text-slate-500 line-clamp-1">
                                                    {kho.diaChi || "Không có địa chỉ"}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-1">
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Ngày đặt <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    type="date"
                                    className="pl-10 h-11 rounded-xl border-slate-200 font-medium text-[15px] focus-visible:ring-slate-500 shadow-sm"
                                    value={formData.ngayDatHang}
                                    onChange={(e) => handleInputChange('ngayDatHang', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Ngày giao dự kiến <span className="text-rose-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                <Input
                                    type="date"
                                    className="pl-10 h-11 rounded-xl border-slate-200 font-medium text-[15px] focus-visible:ring-slate-500 shadow-sm"
                                    value={formData.ngayGiaoDuKien}
                                    onChange={(e) => handleInputChange('ngayGiaoDuKien', e.target.value)}
                                    min={formData.ngayDatHang}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 mt-1">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Ghi chú đơn hàng
                        </Label>
                        <Textarea
                            placeholder="Nhập yêu cầu đặc biệt hoặc ghi chú giao hàng (tuỳ chọn)..."
                            className="min-h-[90px] rounded-xl border-slate-200 focus-visible:ring-slate-500 resize-none text-[14px] shadow-sm p-3.5"
                            value={formData.ghiChu}
                            onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                        />
                    </div>
                </SectionCard>

                {/* Card Nhà Cung Cấp */}
                <SectionCard title="Đối tác cung cấp" icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600">
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Lựa chọn nhà cung cấp <span className="text-rose-500">*</span>
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full h-11 justify-between font-medium rounded-xl border-slate-200 hover:bg-slate-50 px-4 text-[14px]"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="truncate">
                                            {selectedSupplier ? selectedSupplier.tenNhaCungCap : "Tìm nhà cung cấp..."}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[400px] max-h-[350px] overflow-y-auto bg-white rounded-xl shadow-lg border-slate-100 p-1">
                                {suppliers.length === 0 ? (
                                    <DropdownMenuItem disabled className="text-slate-500 italic p-3">
                                        Chuỗi cung ứng trống
                                    </DropdownMenuItem>
                                ) : (
                                    suppliers.map((supplier) => (
                                        <DropdownMenuItem
                                            key={supplier.id}
                                            onClick={() => handleInputChange('nhaCungCapId', supplier.id)}
                                            className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50 p-3 rounded-lg flex flex-col items-start gap-1"
                                        >
                                            <span className="font-bold text-slate-800 text-[14px]">
                                                {supplier.tenNhaCungCap}
                                            </span>
                                            <div className="flex items-center justify-between w-full text-[12px] opacity-80">
                                                <span className="font-mono text-blue-700 bg-blue-100/50 px-1 rounded">
                                                    {supplier.maNhaCungCap}
                                                </span>
                                                <span className="text-slate-500 font-medium">
                                                    {supplier.soDienThoai}
                                                </span>
                                            </div>
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {selectedSupplier ? (
                        <div className="mt-4 p-5 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col gap-3">
                            <InfoField label="Người liên hệ" icon={User} value={selectedSupplier.nguoiLienHe} />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Số điện thoại" icon={Phone} value={selectedSupplier.soDienThoai} mono />
                                <InfoField label="Email" icon={Mail}>
                                    <span className="text-[14px] font-semibold text-blue-700 truncate block" title={selectedSupplier.email}>
                                        {selectedSupplier.email || "—"}
                                    </span>
                                </InfoField>
                            </div>
                            <Separator className="bg-blue-100" />
                            <InfoField label="Địa chỉ" icon={MapPin}>
                                <span className="text-[14px] text-slate-700 block leading-snug">
                                    {selectedSupplier.diaChi || "—"}
                                </span>
                            </InfoField>
                        </div>
                    ) : (
                        <div className="mt-4 flex-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-8 text-center min-h-[180px]">
                            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center border border-slate-200 mb-3 shadow-sm">
                                <Building2 className="h-5 w-5 text-slate-300" />
                            </div>
                            <p className="text-[14px] font-semibold text-slate-500">Chưa chọn NCC</p>
                            <p className="text-[13px] text-slate-400 mt-1 max-w-[200px]">Chọn một nhà cung cấp để xem hồ sơ liên lạc.</p>
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* ── Main Product Table ── */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <ShoppingCart className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 leading-none">Danh mục mặt hàng</h2>
                            <p className="text-[13px] text-slate-500 font-medium mt-1">
                                {orderItems.length} sản phẩm được chọn
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowProductDialog(true)}
                        className="h-10 px-5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-md gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tuyển chọn sản phẩm</span>
                        <span className="sm:hidden">Thêm</span>
                    </Button>
                </div>
                
                <div className="overflow-x-auto min-h-[300px]">
                    {orderItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
                            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-5 shadow-inner">
                                <Package className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-1">Cần bổ sung mặt hàng</h3>
                            <p className="text-[14px] text-slate-500 max-w-sm mx-auto mb-6">
                                Bạn chưa đẩy sản phẩm nào vào phiếu yêu cầu. Nhấn nút "Tuyển chọn" ở róc trên để duyệt danh mục.
                            </p>
                            <Button
                                onClick={() => setShowProductDialog(true)}
                                variant="outline"
                                className="h-11 rounded-xl border-dashed border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 font-bold px-8"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Mở danh mục
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
                                    <TableHead className="w-[60px] text-center font-bold text-[13px] uppercase tracking-wider text-slate-500 h-12">#</TableHead>
                                    <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 h-12 w-[350px]">Sản phẩm</TableHead>
                                    <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center h-12">ĐVT</TableHead>
                                    <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 text-center w-[150px] h-12">SL Yêu Cầu</TableHead>
                                    <TableHead className="font-bold text-[13px] uppercase tracking-wider text-slate-500 h-12">Mô tả (gửi NCC)</TableHead>
                                    <TableHead className="w-[80px] text-center font-bold text-[13px] uppercase tracking-wider text-slate-500 h-12 pr-6">Xóa</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.map((item, index) => (
                                    <TableRow key={index} className="hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                                        <TableCell className="text-center font-medium text-slate-400">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-4">
                                                {item.anhBienThe?.tepTin?.duongDan ? (
                                                    <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden shadow-sm shrink-0">
                                                        <img
                                                            src={item.anhBienThe.tepTin.duongDan}
                                                            alt="Product"
                                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                                                        <Package className="h-5 w-5 text-slate-300" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-[14px] text-slate-900 leading-tight">
                                                        {item.tenSanPham}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                        <span className="font-mono text-xs font-bold text-[#8b6a21] bg-[#fff3d9] border border-[#efd9ad] px-1.5 py-0.5 rounded">
                                                            {item.maBienThe}
                                                        </span>
                                                        <span className="text-[12px] text-slate-500 font-medium">
                                                            {item.thuocTinh}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex h-7 px-2.5 items-center justify-center rounded bg-slate-100 text-slate-700 font-semibold text-[13px]">
                                                {item.donViTinh || 'Cái'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.soLuongDat}
                                                onChange={(e) => handleUpdateItem(index, 'soLuongDat', e.target.value)}
                                                className="w-full text-center font-bold text-emerald-700 bg-emerald-50/30 border-emerald-200 focus-visible:ring-emerald-500 h-10 rounded-xl"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={item.ghiChu}
                                                onChange={(e) => handleUpdateItem(index, 'ghiChu', e.target.value)}
                                                className="w-full text-[13px] border-slate-200 shadow-none hover:border-slate-300 focus-visible:ring-slate-500 h-10 rounded-xl placeholder:text-slate-400"
                                                placeholder="Lưu ý về màu sắc, in ấn..."
                                            />
                                        </TableCell>
                                        <TableCell className="text-center pr-6">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveItem(index)}
                                                className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg group-hover:opacity-100 opacity-50 transition-all"
                                                title="Loại bỏ"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 pb-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/purchase-orders')}
                    className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-all shadow-sm bg-white"
                >
                    Hủy
                </Button>
                <Button
                    type="button"
                    onClick={handleSendToSupplier}
                    disabled={loading || orderItems.length === 0}
                    className="w-full sm:w-auto h-11 px-8 rounded-xl bg-slate-900 text-white border border-slate-900 font-semibold hover:bg-white hover:text-slate-900 min-w-[140px] shadow-md transition-all duration-200"
                >
                    <Send className="mr-2 h-4 w-4" />
                    Gửi yêu cầu
                </Button>
            </div>

            {/* ── Dialogs ── */}
            {/* Product Selection Dialog */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white flex flex-col max-h-[85vh]">
                    <div className="bg-slate-900 p-5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-white/10 rounded-xl flex items-center justify-center">
                                <Search className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-lg font-bold text-white m-0 tracking-wide">
                                Tuyển chọn mặt hàng
                            </DialogTitle>
                        </div>
                    </div>
                    
                    <div className="p-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Gõ tên, mã vạch, mã SKU, màu sắc..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-[14px] shadow-sm focus-visible:ring-slate-900 font-medium placeholder:font-normal"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30">
                        <Table>
                            <TableHeader className="sticky top-0 bg-slate-100/90 backdrop-blur-sm z-10 shadow-sm border-b-slate-200">
                                <TableRow>
                                    <TableHead className="font-bold text-[13px] uppercase text-slate-500 h-12 w-[120px]">Kho</TableHead>
                                    <TableHead className="font-bold text-[13px] uppercase text-slate-500 h-12">Thông tin sản phẩm</TableHead>
                                    <TableHead className="font-bold text-[13px] uppercase text-slate-500 h-12 w-[100px] text-center">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-16">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search className="h-8 w-8 text-slate-300 mb-2" />
                                                <p className="text-[15px] font-bold text-slate-600">Không tìm thấy sản phẩm</p>
                                                <p className="text-[13px] text-slate-400">Thử thay đổi từ khóa tìm kiếm</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const isSelected = orderItems.some(item => item.bienTheSanPhamId === product.id);
                                        return (
                                            <TableRow key={product.id} className={`hover:bg-slate-50 ${isSelected ? 'opacity-50 bg-slate-50/50' : ''}`}>
                                                <TableCell className="font-mono text-[13px] text-[#8b6a21] font-bold whitespace-nowrap">
                                                    {product.maBienThe}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {product.anhBienThe?.tepTin?.duongDan ? (
                                                            <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
                                                                <img src={product.anhBienThe.tepTin.duongDan} alt="" className="h-full w-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                                <Package className="h-4 w-4 text-slate-300" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-[14px] text-slate-800 line-clamp-1">{product.tenSanPham}</p>
                                                            <p className="text-[12px] text-slate-500 mt-0.5">{product.thuocTinh}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {isSelected ? (
                                                        <Button size="sm" variant="outline" disabled className="h-8 rounded-lg gap-1 border-slate-200 text-slate-400 font-medium">
                                                            <CheckCircle className="h-3.5 w-3.5" /> Thêm
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddProduct(product)}
                                                            className="h-8 rounded-lg gap-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" /> Lấy
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Send Confirmation Dialog */}
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-slate-900 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">
                            Phát tín hiệu Y/C báo giá
                        </DialogTitle>
                    </div>
                    
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 mb-6">
                            Thông qua tính năng này, email yêu cầu báo giá sẽ gửi trực tiếp đến hộp thư của đối tác. Vui lòng rà soát cẩn trọng.
                        </DialogDescription>

                        {selectedSupplier && (
                            <div className="space-y-4 mb-6">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-2 -mt-2 opacity-5 pointer-events-none">
                                        <Building2 className="w-24 h-24 text-slate-900" />
                                    </div>
                                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Thiết lập gốc</p>
                                    <p className="font-bold text-[15px] text-slate-800">{selectedSupplier.tenNhaCungCap}</p>
                                    <p className="text-[14px] text-blue-600 font-medium mt-1">{selectedSupplier.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mã đơn</p>
                                        <p className="font-mono font-bold text-[14px] text-[#8b6a21] truncate">{formData.soDonMua}</p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mặt hàng</p>
                                        <p className="font-black text-[15px] text-emerald-600">{orderItems.length} <span className="text-[12px] font-medium text-slate-500">sp</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowSendDialog(false)}
                                disabled={sendingEmail}
                                className="h-11 rounded-xl font-semibold border-slate-200 hover:bg-slate-50 w-full sm:w-auto"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={confirmSendEmail}
                                disabled={sendingEmail}
                                className="h-11 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md w-full sm:w-auto relative overflow-hidden"
                            >
                                {sendingEmail ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Hệ thống đang gửi thư...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Phát lệnh gửi <Send className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}