import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    ChevronDown, Plus, Trash2, Send, ArrowLeft, Building2, Package,
    CheckCircle, AlertCircle, Loader2, Search, Mail,
    FileText, RotateCw, MapPin, Phone, User, ShoppingCart,
    Clock, XCircle, LockKeyhole, Info, Zap,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import purchaseOrderCreateService from '@/services/purchaseOrderCreateService';
import { khoService } from "@/services/khoService";

/* ─── Shared layout components ──────────────────────────────────── */
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



/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function PurchaseOrderCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ── Query-string params: bienTheId và khoId từ URL ──────────────────
    // Ví dụ: /purchase-orders/create?bienTheId=81&khoId=1
    const urlBienTheId = searchParams.get("bienTheId")
        ? parseInt(searchParams.get("bienTheId"), 10)
        : null;
    const urlKhoId = searchParams.get("khoId")
        ? parseInt(searchParams.get("khoId"), 10)
        : null;

    /* ── Data State ── */
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [productVariants, setProductVariants] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    /* ── Prefill state ─────────────────────────────────────────────────
       prefillDone: tránh inject item nhiều lần khi productVariants load xong
    */
    const [prefillDone, setPrefillDone] = useState(false);

    /* ── Form State ── */
    const [loading, setLoading] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const [formData, setFormData] = useState({
        soDonMua: '',
        nhaCungCapId: '',
        khoId: urlKhoId ? String(urlKhoId) : '',   // ← prefill từ URL nếu có
        ngayDatHang: new Date().toISOString().split('T')[0],
        ngayGiaoDuKien: '',
        ghiChu: '',
    });

    const [orderItems, setOrderItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    /* ── Helpers ── */
    const generateOrderNumber = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PO${y}${m}${d}${r}`;
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);



    /* ── Load master data ── */
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingData(true);
            try {
                setFormData(prev => ({ ...prev, soDonMua: generateOrderNumber() }));
                const [suppliersRes, variantsRes, warehousesRes] = await Promise.all([
                    purchaseOrderCreateService.getAllSuppliers(),
                    purchaseOrderCreateService.getAllProductVariants(),
                    khoService.filter({ page: 0, size: 100, filters: [] }),
                ]);

                if (suppliersRes?.data) setSuppliers(suppliersRes.data);
                else if (Array.isArray(suppliersRes)) setSuppliers(suppliersRes);

                const variants = variantsRes?.data ?? (Array.isArray(variantsRes) ? variantsRes : []);
                setProductVariants(variants);
                setFilteredProducts(variants);

                if (warehousesRes?.data?.data?.content) setWarehouses(warehousesRes.data.data.content);
            } catch (error) {
                console.error('Failed to load initial data:', error);
                toast.error('Không thể tải dữ liệu ban đầu');
            } finally {
                setIsLoadingData(false);
            }
        };
        loadData();
    }, []);

    /* ─────────────────────────────────────────────────────────────────
       PREFILL: khi productVariants đã có và URL có bienTheId
       → tự động thêm biến thể đó vào orderItems một lần duy nhất
    ───────────────────────────────────────────────────────────────── */
    useEffect(() => {
        // Điều kiện: có urlBienTheId, danh sách biến thể đã load, chưa inject
        if (!urlBienTheId || productVariants.length === 0 || prefillDone) return;

        const variant = productVariants.find(p => p.id === urlBienTheId);

        if (!variant) {
            // Biến thể không tìm thấy trong danh sách — không báo lỗi ngay, bỏ qua
            console.warn(`[PrefillOrder] bienTheId=${urlBienTheId} không tìm thấy trong danh sách biến thể.`);
            setPrefillDone(true);
            return;
        }

        // Kiểm tra quyền: nếu allowedVariantIds đã được khởi tạo và không chứa variant này
        // thì vẫn thêm vào (allowedVariantIds được tính sau khi myRequest load xong,
        // useEffect này chạy song song — sẽ validate lại khi submit)
        setOrderItems(prev => {
            // Tránh duplicate nếu effect chạy lại
            if (prev.some(item => item.bienTheSanPhamId === variant.id)) return prev;
            return [...prev, {
                bienTheSanPhamId: variant.id,
                maBienThe: variant.maBienThe,
                tenSanPham: variant.tenSanPham,
                thuocTinh: variant.thuocTinh,
                donViTinh: variant.donViTinh || '',
                soLuongDat: 1,
                donGia: 0,
                ghiChu: '',
                anhBienThe: variant.anhBienThe || null,
            }];
        });

        setPrefillDone(true);
    }, [urlBienTheId, productVariants, prefillDone]);
    // allowedVariantIds KHÔNG phải dependency vì validate sẽ làm lại khi submit

    /* ── Filter products in dialog ── */
    useEffect(() => {
        if (!productVariants.length) return;
        if (!searchTerm.trim()) { setFilteredProducts(productVariants); return; }
        const lw = searchTerm.toLowerCase();
        setFilteredProducts(productVariants.filter(p =>
            (p.tenSanPham?.toLowerCase() || '').includes(lw) ||
            (p.maBienThe?.toLowerCase() || '').includes(lw) ||
            (p.thuocTinh?.toLowerCase() || '').includes(lw)
        ));
    }, [searchTerm, productVariants]);

    /* ── Form handlers ── */
    const handleInputChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const handleAddProduct = (product) => {
        if (orderItems.some(item => item.bienTheSanPhamId === product.id)) {
            toast.error('Sản phẩm đã có trong đơn hàng!');
            return;
        }
        setOrderItems(prev => [...prev, {
            bienTheSanPhamId: product.id,
            maBienThe: product.maBienThe,
            tenSanPham: product.tenSanPham,
            thuocTinh: product.thuocTinh,
            donViTinh: product.donViTinh || '',
            soLuongDat: 1,
            donGia: 0,
            ghiChu: '',
            anhBienThe: product.anhBienThe || null,
        }]);
        setShowProductDialog(false);
        setSearchTerm('');
        toast.success('Đã thêm sản phẩm vào đơn hàng');
    };

    const handleUpdateItem = (index, field, value) =>
        setOrderItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });

    const handleRemoveItem = (index) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
        toast.success('Đã xóa sản phẩm khỏi đơn hàng');
    };

    const calculateTotal = () =>
        orderItems.reduce((sum, item) => sum + Number(item.soLuongDat) * Number(item.donGia), 0);

    const validateForm = () => {
        if (!formData.nhaCungCapId) { toast.error('Vui lòng chọn nhà cung cấp'); return false; }
        if (!formData.khoId) { toast.error('Vui lòng chọn kho tiếp nhận'); return false; }
        if (!formData.ngayDatHang) { toast.error('Vui lòng chọn ngày đặt hàng'); return false; }
        if (!formData.ngayGiaoDuKien) { toast.error('Vui lòng chọn ngày giao dự kiến'); return false; }
        if (new Date(formData.ngayGiaoDuKien) <= new Date(formData.ngayDatHang)) {
            toast.error('Ngày giao dự kiến phải sau ngày đặt hàng');
            return false;
        }
        if (orderItems.length === 0) { toast.error('Vui lòng thêm ít nhất một sản phẩm'); return false; }
        for (const item of orderItems) {
            if (!item.soLuongDat || item.soLuongDat <= 0) {
                toast.error(`Số lượng sản phẩm "${item.tenSanPham}" phải lớn hơn 0`);
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
            const selectedSupplier = suppliers.find(s => s.id === parseInt(formData.nhaCungCapId));
            if (!selectedSupplier) { toast.error('Nhà cung cấp không tồn tại'); return; }

            const payload = {
                soDonMua: formData.soDonMua,
                nhaCungCapId: Number(formData.nhaCungCapId),
                ngayDatHang: new Date(formData.ngayDatHang).toISOString(),
                ngayGiaoDuKien: new Date(formData.ngayGiaoDuKien).toISOString(),
                ghiChu: formData.ghiChu || '',
                tongTien: calculateTotal(),
                trangThai: 1,// Mặc định trạng thái là đã gửi duyệt
                chiTietDonMuaHangs: orderItems.map(item => ({
                    bienTheSanPhamId: Number(item.bienTheSanPhamId),
                    soLuongDat: Number(item.soLuongDat),
                    soLuongDaNhan: 0,
                    donGia: Number(item.donGia),
                    thanhTien: Number(item.soLuongDat) * Number(item.donGia),
                    ghiChu: item.ghiChu || '',
                })),
            };

            await purchaseOrderCreateService.create(payload, formData.khoId);
            toast.success(`Đã gửi điện đến ${selectedSupplier.email} thành công!`);
            setShowSendDialog(false);
            setTimeout(() => navigate('/purchase-orders'), 2000);
        } catch (error) {
            if (error.response?.status === 409) {
                toast.error('Mã đơn mua hàng đã tồn tại. Vui lòng tạo lại mã mới.');
            } else {
                toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại!');
            }
        } finally {
            setSendingEmail(false);
        }
    };

    const selectedSupplier = suppliers.find(s => s.id === parseInt(formData.nhaCungCapId)) ?? null;
    const selectedWarehouse = warehouses.find(k => k.id === parseInt(formData.khoId)) ?? null;

    /* ── Loading screens ── */
    if (isLoadingData) {
        return (
            <div className="p-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#b8860b]" />
                    <span className="text-[15px] font-medium text-slate-600">
                        {urlBienTheId ? 'Đang khởi tạo đơn hàng nhanh...' : 'Đang khởi tạo biểu mẫu...'}
                    </span>
                </div>
            </div>
        );
    }



    /* ══════════════════════════════════════════════════════════════════
       MAIN FORM
    ══════════════════════════════════════════════════════════════════ */
    return (
        <div className="p-5 space-y-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync">

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate('/purchase-orders')}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>


            </div>



            {/* ── Info Cards Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

                {/* Card Thiết lập chứng từ */}
                <SectionCard title="Thiết lập chứng từ" icon={FileText} iconBg="bg-amber-100" iconColor="text-amber-600">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Số đơn */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Số Đơn <span className="text-rose-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.soDonMua}
                                    onChange={(e) => handleInputChange('soDonMua', e.target.value)}
                                    className="h-11 font-mono font-bold text-[#8b6a21] rounded-xl border-slate-200 shadow-sm text-[15px] focus-visible:ring-slate-500 flex-1"
                                    placeholder="Mã đơn tự sinh"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleInputChange('soDonMua', generateOrderNumber())}
                                    className="h-11 w-11 p-0 rounded-xl border-slate-200"
                                    title="Tái tạo mã"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Kho tiếp nhận */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Kho Tiếp Nhận <span className="text-rose-500">*</span>
                            </Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full h-11 justify-between font-medium rounded-xl border-slate-200 px-4 text-[14px]">
                                        <div className="flex items-center gap-2 truncate">
                                            <Package className="h-4 w-4 text-slate-400 shrink-0" />
                                            <span className="truncate">
                                                {selectedWarehouse ? selectedWarehouse.tenKho : 'Chọn kho tiếp nhận...'}
                                            </span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[340px] max-h-[320px] overflow-y-auto bg-white rounded-xl shadow-lg" align="start">
                                    {warehouses.map((warehouse) => (
                                        <DropdownMenuItem
                                            key={warehouse.id}
                                            onClick={() => handleInputChange('khoId', warehouse.id)}
                                            className="cursor-pointer p-3 flex flex-col items-start gap-1 rounded-lg mx-1 my-0.5"
                                        >
                                            <span className="font-bold text-slate-800">{warehouse.tenKho}</span>
                                            <span className="text-[12px] text-slate-500">{warehouse.diaChi}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {selectedWarehouse?.diaChi && (
                                <p className="text-[12px] text-slate-400 pl-1 flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-slate-300 inline-block" />
                                    {selectedWarehouse.diaChi}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Ngày đặt / ngày giao */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Ngày Đặt Hàng <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={formData.ngayDatHang}
                                onChange={(e) => handleInputChange('ngayDatHang', e.target.value)}
                                className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">
                                Ngày Giao Dự Kiến <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={formData.ngayGiaoDuKien}
                                onChange={(e) => handleInputChange('ngayGiaoDuKien', e.target.value)}
                                className="h-11 rounded-xl border-slate-200 shadow-sm focus-visible:ring-slate-500"
                            />
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">Ghi Chú</Label>
                        <Textarea
                            value={formData.ghiChu}
                            onChange={(e) => handleInputChange('ghiChu', e.target.value)}
                            placeholder="Ghi chú thêm về đơn hàng..."
                            className="rounded-xl border-slate-200 resize-none"
                            rows={3}
                        />
                    </div>
                </SectionCard>

                {/* Card Nhà cung cấp */}
                <SectionCard title="Nhà Cung Cấp" icon={Building2} iconBg="bg-blue-100" iconColor="text-blue-600">
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Chọn Nhà Cung Cấp <span className="text-rose-500">*</span>
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full h-11 justify-between font-medium rounded-xl border-slate-200 px-4 text-[14px]">
                                    <div className="flex items-center gap-2 truncate">
                                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="truncate">
                                            {selectedSupplier ? selectedSupplier.tenNhaCungCap : 'Chọn nhà cung cấp...'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[340px] max-h-[320px] overflow-y-auto bg-white rounded-xl shadow-lg" align="start">
                                {suppliers.map((s) => (
                                    <DropdownMenuItem
                                        key={s.id}
                                        onClick={() => handleInputChange('nhaCungCapId', s.id)}
                                        className="cursor-pointer p-3 flex flex-col items-start gap-1 rounded-lg mx-1 my-0.5"
                                    >
                                        <span className="font-bold text-slate-800">{s.tenNhaCungCap}</span>
                                        <span className="text-[12px] text-slate-500">{s.email}</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {selectedSupplier && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <InfoField label="Người liên hệ" icon={User} value={selectedSupplier.nguoiLienHe} />
                            <InfoField label="Điện thoại" icon={Phone} value={selectedSupplier.soDienThoai} />
                            <InfoField label="Email" icon={Mail} value={selectedSupplier.email} />
                            <InfoField label="Địa chỉ" icon={MapPin} value={selectedSupplier.diaChi} />
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* ── Order Items Table ── */}
            <SectionCard title="Danh sách Sản phẩm" icon={ShoppingCart} iconBg="bg-emerald-100" iconColor="text-emerald-600">

                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 font-medium">
                        {orderItems.length > 0
                            ? `${orderItems.length} sản phẩm — Tổng: ${formatCurrency(calculateTotal())}`
                            : 'Chưa có sản phẩm nào'}
                    </p>
                    <Button
                        type="button"
                        onClick={() => setShowProductDialog(true)}
                        className="h-9 rounded-xl gap-1.5 bg-gradient-to-r from-[#b8860b] to-[#d4a017] text-white font-semibold shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Thêm sản phẩm
                    </Button>
                </div>

                {orderItems.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl py-12 flex flex-col items-center gap-3 text-slate-400">
                        <Package className="h-10 w-10 opacity-40" />
                        <p className="font-semibold text-slate-500">Chưa có sản phẩm trong đơn hàng</p>
                        <p className="text-sm">Nhấn "Thêm sản phẩm" để bắt đầu</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="font-bold text-slate-700">Sản phẩm</TableHead>
                                <TableHead className="font-bold text-slate-700 text-center w-32">Số lượng</TableHead>
                                <TableHead className="font-bold text-slate-700 text-right w-40" hidden>Đơn giá</TableHead>
                                <TableHead className="font-bold text-slate-700 text-right" hidden>Thành tiền</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderItems.map((item, index) => (
                                <TableRow key={index} className="hover:bg-slate-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {item.anhBienThe?.tepTin?.duongDan ? (
                                                <img src={item.anhBienThe.tepTin.duongDan} alt=""
                                                    className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                                    <Package className="h-4 w-4 text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-[14px] text-slate-800">{item.tenSanPham}</p>
                                                <p className="text-[12px] text-slate-500">{item.thuocTinh}</p>
                                                <p className="font-mono text-[11px] text-amber-700 font-bold">{item.maBienThe}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.soLuongDat}
                                            onChange={(e) => handleUpdateItem(index, 'soLuongDat', e.target.value)}
                                            className="h-9 w-24 text-center rounded-lg font-bold border-slate-200 mx-auto"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right" hidden>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.donGia}
                                            onChange={(e) => handleUpdateItem(index, 'donGia', e.target.value)}
                                            className="h-9 w-36 text-right rounded-lg border-slate-200 ml-auto font-mono"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-bold font-mono text-slate-800" hidden>
                                        {formatCurrency(Number(item.soLuongDat) * Number(item.donGia))}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveItem(index)}
                                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* Total */}
                {orderItems.length > 0 && (
                    <div className="flex justify-end pt-2">
                        <div className="bg-slate-900 text-white rounded-xl px-6 py-3 flex items-center gap-4">
                            <span className="text-sm font-medium opacity-80">Tổng giá trị đơn hàng:</span>
                            <span className="text-xl font-black font-mono">{formatCurrency(calculateTotal())}</span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/purchase-orders')}
                        className="h-11 rounded-xl px-6 font-semibold border-slate-200"
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSendToSupplier}
                        disabled={loading}
                        className="h-11 rounded-xl px-6 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md"
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin" />Đang xử lý...</>
                        ) : (
                            <><Send className="h-4 w-4" />Gửi đến Nhà Cung Cấp</>
                        )}
                    </Button>
                </div>
            </SectionCard>

            {/* ── Product Picker Dialog ── */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="sm:max-w-2xl rounded-2xl overflow-hidden p-0 border-0 shadow-2xl flex flex-col max-h-[80vh]">
                    <div className="bg-[#1a1612] p-6 flex items-center gap-3 shrink-0">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-[#d4a017]" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-white m-0">Chọn Sản phẩm</DialogTitle>
                        </div>
                    </div>

                    <div className="px-6 pt-4 pb-3 bg-[#fffdf8] border-b border-[#eadfc8] shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8a98a]" />
                            <Input
                                placeholder="Tìm theo SKU, tên, thuộc tính..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-[#e8dcc8] bg-white focus-visible:ring-[#b8860b]"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 bg-[#fffdf8]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#f8f3e8] border-b border-[#eadfc8]">
                                    <TableHead className="font-bold text-[#5a4e3a] text-[12px] uppercase tracking-wide pl-6">SKU</TableHead>
                                    <TableHead className="font-bold text-[#5a4e3a] text-[12px] uppercase tracking-wide">Sản phẩm</TableHead>
                                    <TableHead className="font-bold text-[#5a4e3a] text-[12px] uppercase tracking-wide text-center">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-16">
                                            <Search className="h-8 w-8 text-[#d0c3ad] mx-auto mb-2" />
                                            <p className="text-[15px] font-bold text-[#2f2a23]">Không tìm thấy mặt hàng</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.map((product) => {
                                    const isSelected = orderItems.some(item => item.bienTheSanPhamId === product.id);

                                    return (
                                        <TableRow
                                            key={product.id}
                                            className={`border-b border-[#f0e7d8] transition-colors ${
                                                isSelected ? 'opacity-60 bg-[#f8f3e8]' : 'bg-[#fffdf8] hover:bg-[#fff7ea]'
                                            }`}
                                        >
                                            <TableCell className="font-mono text-[13px] text-[#9c7414] font-bold whitespace-nowrap pl-6">
                                                {product.maBienThe}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {product.anhBienThe?.tepTin?.duongDan ? (
                                                        <img src={product.anhBienThe.tepTin.duongDan} alt=""
                                                            className="h-10 w-10 rounded-xl object-cover border border-[#e8dcc8] shrink-0" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-xl bg-[#f6f0e5] border border-[#e8dcc8] flex items-center justify-center shrink-0">
                                                            <Package className="h-4 w-4 text-[#c7b79c]" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-[14px] text-[#1e2c48] line-clamp-1">{product.tenSanPham}</p>
                                                        <p className="text-[12px] text-[#6f7f99] mt-0.5">{product.thuocTinh}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isSelected ? (
                                                    <Button size="sm" variant="outline" disabled
                                                        className="h-8 rounded-xl gap-1 border-[#e2d5bd] text-[#a89f92] font-semibold bg-[#f7f3ea]">
                                                        <CheckCircle className="h-3.5 w-3.5" /> Đã thêm
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" onClick={() => handleAddProduct(product)}
                                                        className="h-8 rounded-xl gap-1 bg-gradient-to-r from-[#b8860b] to-[#d4a017] hover:brightness-95 text-white font-semibold shadow-sm">
                                                        <Plus className="h-3.5 w-3.5" /> Lấy
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="shrink-0 border-t border-[#eadfc8] bg-[#f8f3e8] px-6 py-3 flex items-center justify-between text-xs text-[#7a6e5f]">
                        <span>
                            Hiển thị <span className="font-bold text-[#b8860b]">{filteredProducts.length}</span> mặt hàng
                        </span>
                        <span>Đã chọn: <span className="font-bold text-[#1a1612]">{orderItems.length}</span></span>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Send Confirmation Dialog ── */}
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-slate-900 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">Phát tín hiệu Y/C báo giá</DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 mb-6">
                            Email yêu cầu báo giá sẽ gửi trực tiếp đến hộp thư của đối tác. Vui lòng rà soát cẩn trọng.
                        </DialogDescription>
                        {selectedSupplier && (
                            <div className="space-y-4 mb-6">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
                                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nhà cung cấp</p>
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
                                        <p className="font-black text-[15px] text-emerald-600">
                                            {orderItems.length} <span className="text-[12px] font-medium text-slate-500">sp</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={sendingEmail}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto">Hủy bỏ</Button>
                            <Button onClick={confirmSendEmail} disabled={sendingEmail}
                                className="h-11 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md w-full sm:w-auto">
                                {sendingEmail
                                    ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang gửi thư...</>
                                    : <><Send className="h-4 w-4 mr-2" />Phát lệnh gửi</>
                                }
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    );
}