import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowLeft, Search, ShoppingCart, User, Truck, Check, Warehouse, Home } from "lucide-react";

import { donBanHangService } from "@/services/donBanHangService";
import { getKhoList } from "@/services/khoService";

export default function SalesOrderCreate() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [variants, setVariants] = useState([]);
    const [warehouses, setWarehouses] = useState([]); // State danh sách kho
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // State tìm kiếm khách hàng
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

    // State tìm kiếm kho
    const [warehouseSearch, setWarehouseSearch] = useState("");
    const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

    const [formData, setFormData] = useState({
        khachHangId: "",
        khoXuatId: "", // Bắt buộc chọn kho
        phiVanChuyen: 0,
        diaChiGiaoHang: "",
        ghiChu: "",
    });

    const [orderItems, setOrderItems] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [variantRes, customerRes, warehouseRes] = await Promise.all([
                donBanHangService.getVariantsForCreate(),
                donBanHangService.getCustomersForCreate(),
                getKhoList() // Lấy danh sách kho từ Service của bạn
            ]);
            setVariants(variantRes?.data?.data || []);
            setCustomers(customerRes?.data?.data || []);
            setWarehouses(warehouseRes || []); // getKhoList trả về array content
        } catch (err) {
            toast.error("Không thể tải dữ liệu hệ thống");
        }
    }

    const selectedCustomer = useMemo(() =>
        customers.find(c => c.id === Number(formData.khachHangId)),
        [customers, formData.khachHangId]);

    const selectedWarehouse = useMemo(() =>
        warehouses.find(w => w.id === Number(formData.khoXuatId)),
        [warehouses, formData.khoXuatId]);

    // Logic lọc khách hàng
    const filteredCustomers = useMemo(() => {
        const lower = customerSearch.toLowerCase();
        if (!lower.trim()) return [];
        return customers.filter(c =>
            c.tenKhachHang?.toLowerCase().includes(lower) ||
            c.soDienThoai?.includes(lower)
        );
    }, [customerSearch, customers]);

    const handleSelectCustomer = (customer) => {
        setFormData(prev => ({
            ...prev,
            khachHangId: customer.id,
            diaChiGiaoHang: customer.diaChi || ""
        }));
        setCustomerSearch(customer.tenKhachHang);
        setShowCustomerDropdown(false);
    };
    const filteredWarehouses = useMemo(() => {
        const lower = warehouseSearch.toLowerCase();
        if (!lower.trim()) return warehouses;
        return warehouses.filter(w =>
            w.tenKho?.toLowerCase().includes(lower) ||
            w.maKho?.toLowerCase().includes(lower)
        );
    }, [warehouseSearch, warehouses]);

    const handleSelectWarehouse = (warehouse) => {
        setFormData(prev => ({ ...prev, khoXuatId: warehouse.id }));
        setWarehouseSearch(warehouse.tenKho);
        setShowWarehouseDropdown(false);
    };

    const filteredProducts = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return variants.filter(v =>
            v.tenSanPham?.toLowerCase().includes(lower) ||
            v.maBienThe?.toLowerCase().includes(lower)
        );
    }, [searchTerm, variants]);

    const handleAddProduct = (product) => {
        if (orderItems.some(i => i.bienTheSanPhamId === product.id)) {
            toast.warning("Sản phẩm này đã có trong danh sách");
            return;
        }
        setOrderItems(prev => [...prev, {
            bienTheSanPhamId: product.id,
            maBienThe: product.maBienThe,
            tenSanPham: product.tenSanPham,
            soLuongDat: 1,
            giaGoc: product.giaBan,
            donGia: product.giaBan,
            thanhTien: product.giaBan,
        }]);
        setShowProductDialog(false);
    };

    const handleUpdateQty = (index, value) => {
        const qty = value === "" ? 0 : Number(value);
        setOrderItems(prev => {
            const updated = [...prev];
            updated[index].soLuongDat = qty;
            updated[index].thanhTien = qty * updated[index].donGia;
            return updated;
        });
    };
    const handleUpdatePrice = (index, value) => {
        const price = value === "" ? 0 : Number(value);
        setOrderItems(prev => {
            const updated = [...prev];
            updated[index].donGia = price;
            updated[index].thanhTien = price * updated[index].soLuongDat;
            return updated;
        });
    };

    const totalProductMoney = orderItems.reduce((sum, i) => sum + i.thanhTien, 0);
    const totalOrderMoney = totalProductMoney + Number(formData.phiVanChuyen || 0);

    async function handleCreate() {
        if (!formData.khachHangId) return toast.error("Vui lòng chọn khách hàng");
        if (!formData.khoXuatId) return toast.error("Vui lòng chọn kho xuất hàng");
        if (orderItems.length === 0) return toast.error("Chưa có sản phẩm nào trong đơn hàng");

        try {
            setLoading(true);

            const payload = {
                khachHangId: parseInt(formData.khachHangId),
                khoXuatId: parseInt(formData.khoXuatId),
                phiVanChuyen: formData.phiVanChuyen === "" ? 0 : Number(formData.phiVanChuyen),
                diaChiGiaoHang: formData.diaChiGiaoHang?.trim() || "",
                ghiChu: formData.ghiChu?.trim() || "",
                chiTiet: orderItems.map(item => ({
                    bienTheSanPhamId: parseInt(item.bienTheSanPhamId),
                    soLuongDat: parseInt(item.soLuongDat),
                    donGia: parseFloat(item.donGia)
                }))
            };

            await donBanHangService.create(payload);
            toast.success("Tạo đơn bán thành công");
            navigate("/sales-orders");
        } catch (e) {
            const errorMsg = e?.response?.data?.message || e?.response?.data?.errors?.[0] || "Lỗi tạo đơn hàng";
            toast.error(errorMsg);
            console.error("Chi tiết lỗi 400:", e?.response?.data);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái: Form thông tin */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-gray-200">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                    <User className="h-4 w-4" /> Khách hàng & Giao nhận
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {/* 1. CHỌN KHO XUẤT HÀNG */}
                                <div className="relative">
                                    <Label className="text-xs font-bold text-gray-500 uppercase block mb-2 flex items-center gap-1">
                                        <Warehouse className="h-3 w-3 text-slate-900" /> Kho xuất hàng *
                                    </Label>
                                    <div className="relative">
                                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Gõ tên hoặc mã kho..."
                                            value={warehouseSearch}
                                            onChange={(e) => {
                                                setWarehouseSearch(e.target.value);
                                                setShowWarehouseDropdown(true);
                                            }}
                                            onFocus={() => setShowWarehouseDropdown(true)}
                                            className="pl-9 h-10 border-gray-200 focus-visible:ring-slate-900"
                                        />
                                    </div>
                                    {showWarehouseDropdown && filteredWarehouses.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {filteredWarehouses.map(w => (
                                                <div key={w.id} onClick={() => handleSelectWarehouse(w)} className="px-4 py-2 hover:bg-purple-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors">
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-800">{w.tenKho}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-mono">{w.maKho}</div>
                                                    </div>
                                                    {formData.khoXuatId === w.id && <Check className="h-4 w-4 text-green-600" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <hr className="opacity-50" />

                                {/* 2. TÌM KHÁCH HÀNG */}
                                <div className="relative">
                                    <Label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tìm khách hàng *</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Tên hoặc SĐT khách hàng..."
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(e.target.value);
                                                setShowCustomerDropdown(true);
                                            }}
                                            onFocus={() => setShowCustomerDropdown(true)}
                                            className="pl-9 h-10 border-gray-200 focus-visible:ring-slate-900"
                                        />
                                    </div>
                                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {filteredCustomers.map(c => (
                                                <div key={c.id} onClick={() => handleSelectCustomer(c)} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors">
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{c.tenKhachHang}</div>
                                                        <div className="text-xs text-gray-500">{c.soDienThoai}</div>
                                                    </div>
                                                    {formData.khachHangId === c.id && <Check className="h-4 w-4 text-slate-900" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedCustomer && (
                                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-700">
                                        <div className="flex justify-between"><span>SĐT:</span> <b>{selectedCustomer.soDienThoai}</b></div>
                                        <div className="flex justify-between items-start">
                                            <span>Địa chỉ gốc:</span>
                                            <b className="text-right ml-4 break-words max-w-[180px] text-slate-900">{selectedCustomer.diaChi}</b>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label className="text-xs font-bold text-gray-500 flex items-center gap-1 uppercase">
                                        <Truck className="h-3 w-3 text-slate-900" /> Phí vận chuyển
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.phiVanChuyen}
                                        onChange={(e) => setFormData({ ...formData, phiVanChuyen: e.target.value })}
                                        className="mt-2 bg-gray-50 focus-visible:ring-slate-900"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ nhận hàng</Label>
                                    <Input
                                        value={formData.diaChiGiaoHang}
                                        placeholder="Nhập địa chỉ cụ thể..."
                                        onChange={(e) => setFormData({ ...formData, diaChiGiaoHang: e.target.value })}
                                        className="mt-2 bg-gray-50 focus-visible:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <Label className="text-xs font-bold text-gray-500 uppercase">Ghi chú đơn hàng</Label>
                                    <Textarea
                                        value={formData.ghiChu}
                                        onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                                        className="mt-2 bg-gray-50 resize-none focus-visible:ring-purple-500"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cột phải: Chi tiết đơn hàng */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border-gray-200 overflow-hidden flex flex-col min-h-[438px]">
                            <CardHeader className="flex flex-row items-center justify-between px-6 py-4 space-y-0 bg-white border-b">
                                <CardTitle className="text-sm font-bold  text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                    <ShoppingCart className="h-4 w-4 text-slate-900" />
                                    Chi tiết đơn hàng
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => setShowProductDialog(true)}
                                    className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Thêm sản phẩm
                                </Button>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="w-full">
                                    <Table>
                                        <TableHeader className="bg-gray-50 border-b">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="pl-6 h-12 text-gray-600 font-bold  text-[11px]">Sản phẩm</TableHead>
                                                <TableHead className="text-center h-12 text-gray-600 font-bold  text-[11px]">Số lượng</TableHead>
                                                <TableHead className="text-right h-12 text-gray-600 font-bold  text-[11px]">Đơn giá</TableHead>
                                                <TableHead className="text-right pr-6 h-12 text-gray-600 font-bold  text-[11px]">Thành tiền</TableHead>
                                                <TableHead className="w-10"></TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {orderItems.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-40 text-center bg-white">
                                                        <div className="flex flex-col items-center justify-center text-gray-400 space-y-2">
                                                            <ShoppingCart className="h-8 w-8 opacity-20" />
                                                            <p className="text-sm italic font-medium">Chưa có sản phẩm nào được chọn</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                orderItems.map((item, index) => (
                                                    <TableRow key={index} className="hover:bg-purple-50/30 transition-colors border-b last:border-0">
                                                        <TableCell className="pl-6 py-4">
                                                            <div className="font-bold text-gray-900 leading-none">{item.tenSanPham}</div>
                                                            <div className="text-[11px] text-gray-400 font-mono mt-1.5 flex items-center gap-2">
                                                                {item.maBienThe}
                                                            </div>
                                                            {item.donGia < item.giaGoc && (

                                                                <span className="text-orange-600 font-semibold bg-orange-50 px-1.5 py-0.5 rounded text-[10px]">

                                                                    Thấp hơn {Math.ceil(((item.giaGoc - item.donGia) / item.giaGoc) * 100)}% so với niêm yết

                                                                </span>

                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.soLuongDat}
                                                                onChange={(e) => handleUpdateQty(index, e.target.value)}
                                                                className="w-16 h-9 text-center border border-gray-300 rounded focus:ring-2 focus:ring-slate-900 outline-none"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <input
                                                                type="number"
                                                                value={item.donGia}
                                                                onChange={(e) => handleUpdatePrice(index, e.target.value)}
                                                                className="w-24 h-9 text-right border border-gray-300 rounded px-2 focus:ring-2 focus:ring-slate-900 outline-none font-medium"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-slate-900 pr-6 text-base">
                                                            {item.thanhTien?.toLocaleString()}đ
                                                        </TableCell>
                                                        <TableCell className="pr-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:bg-red-50 group"
                                                                onClick={() => setOrderItems(prev => prev.filter((_, i) => i !== index))}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-gray-300 group-hover:text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {orderItems.length > 0 && (
                                    <div className="p-6 bg-gray-50 border-t space-y-3">
                                        <div className="flex justify-end gap-10 text-sm">
                                            <span className="text-gray-500 font-medium">Tổng tiền hàng:</span>
                                            <span className="font-bold text-gray-900 w-32 text-right">{totalProductMoney.toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-end gap-10 text-sm">
                                            <span className="text-gray-500 font-medium">Phí vận chuyển:</span>
                                            <span className="font-bold text-gray-900 w-32 text-right">{(Number(formData.phiVanChuyen) || 0).toLocaleString()} đ</span>
                                        </div>
                                        <div className="flex justify-end gap-10 text-xl pt-3 border-t border-gray-200">
                                            <span className="font-extrabold text-slate-900 text-sm self-center">Tổng thanh toán</span>
                                            <span className="font-black text-slate-900 w-32 text-right">
                                                {totalOrderMoney.toLocaleString()} đ
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                    <Button onClick={() => navigate("/sales-orders")} className="text-sm font-medium text-gray-600 hover:text-slate-900 flex items-center gap-1 group" variant="ghost">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Quay lại danh sách
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={loading}
                        className="px-12 bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 font-bold shadow-md transition-all active:scale-95 h-11"
                    >
                        {loading ? "Đang tạo..." : "Xác nhận tạo đơn hàng"}
                    </Button>
                </div>
            </div>

            {/* PRODUCT SELECTOR DIALOG */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-100">
                        <DialogTitle className="text-xl font-bold text-slate-900">Tìm kiếm sản phẩm</DialogTitle>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Nhập tên sản phẩm hoặc mã SKU..."
                                className="pl-10 h-11 border-gray-300 focus-visible:ring-slate-900"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead>Sản phẩm</TableHead>
                                    <TableHead className="text-right">Giá bán</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map(product => (
                                    <TableRow key={product.id} className="group transition-colors hover:bg-purple-50/40">
                                        <TableCell>
                                            <div className="font-bold text-gray-900">{product.tenSanPham}</div>
                                            <div className="text-xs text-gray-400 tracking-tighter">{product.maBienThe}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-gray-700">
                                            {product.giaBan?.toLocaleString()}đ
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAddProduct(product)}
                                                className="border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white font-medium"
                                            >
                                                Chọn
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}