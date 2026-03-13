import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Trash2, Search, Package, ArrowDown } from "lucide-react";

import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { donBanHangService } from "@/services/donBanHangService";
import { khoService } from "@/services/khoService";

export default function PhieuChuyenKhoCreate() {
    const navigate = useNavigate();

    // --- Data States ---
    const [warehouses, setWarehouses] = useState([]);
    const [variants, setVariants] = useState([]);

    // --- UI States ---
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // --- Form States ---
    const [formData, setFormData] = useState({
        khoXuatId: "",
        khoNhapId: "",
        ghiChu: ""
    });
    const [transferItems, setTransferItems] = useState([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadInitialData() {
        try {
            const [variantRes, khoRes] = await Promise.all([
                donBanHangService.getVariantsForCreate(),
                khoService.filter({ page: 0, size: 100, filters: [] })
            ]);

            setVariants(variantRes?.data?.data || variantRes?.data || []);
            const listKho = khoRes.data?.data?.content || khoRes.data?.content || [];
            setWarehouses(listKho);
        } catch (err) {
            toast.error("Không thể tải dữ liệu khởi tạo");
        }
    }

    const filteredProducts = useMemo(() => {
        const lower = searchTerm.toLowerCase().trim();
        if (!lower) return variants.slice(0, 10);
        return variants.filter(v =>
            v.tenSanPham?.toLowerCase().includes(lower) ||
            v.maBienThe?.toLowerCase().includes(lower)
        );
    }, [searchTerm, variants]);

    const handleAddProduct = (product) => {
        if (transferItems.some(i => i.variantId === product.id)) {
            toast.warning("Sản phẩm này đã có trong danh sách");
            return;
        }
        setTransferItems(prev => [...prev, {
            variantId: product.id,
            sku: product.maBienThe,
            name: product.tenSanPham,
            color: product.tenMau,
            size: product.tenSize,
            material: product.tenChatLieu,
            quantity: 1,
        }]);
        setShowProductDialog(false);
        setSearchTerm("");
    };

    async function handleCreate() {
        if (!formData.khoXuatId || !formData.khoNhapId) {
            return toast.error("Vui lòng chọn đầy đủ kho gửi và kho nhận");
        }
        if (formData.khoXuatId === formData.khoNhapId) {
            return toast.error("Kho gửi và kho nhận không được trùng nhau");
        }
        if (transferItems.length === 0) {
            return toast.error("Vui lòng chọn ít nhất 1 sản phẩm để điều chuyển");
        }

        try {
            setLoading(true);
            const payload = {
                khoXuatId: parseInt(formData.khoXuatId),
                khoNhapId: parseInt(formData.khoNhapId),
                ghiChu: formData.ghiChu?.trim() || "",
                chiTietXuat: transferItems.map(item => ({
                    bienTheSanPhamId: item.variantId,
                    soLuongXuat: item.quantity
                }))
            };

            const res = await phieuChuyenKhoService.create(payload);
            toast.success("Tạo yêu cầu điều chuyển thành công");
            navigate(`/transfer-tickets/${res.id}`);
        } catch (e) {
            toast.error(e?.response?.data?.message || "Lỗi khi tạo phiếu");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                            <h3 className="text-xs font-bold uppercase text-purple-600 tracking-wider">Thông tin lộ trình</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kho xuất (Nguồn)</label>
                                    <select
                                        value={formData.khoXuatId}
                                        onChange={(e) => setFormData({ ...formData, khoXuatId: e.target.value })}
                                        className="mt-2 w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm"
                                    >
                                        <option value="">-- Chọn kho gửi --</option>
                                        {warehouses.map(k => (
                                            <option key={k.id} value={k.id} disabled={Number(formData.khoNhapId) === k.id}>{k.tenKho}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-center py-1">
                                    <ArrowDown className="h-5 w-5 text-gray-300" />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kho nhập (Đích)</label>
                                    <select
                                        value={formData.khoNhapId}
                                        onChange={(e) => setFormData({ ...formData, khoNhapId: e.target.value })}
                                        className="mt-2 w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm"
                                    >
                                        <option value="">-- Chọn kho nhận --</option>
                                        {warehouses.map(k => (
                                            <option key={k.id} value={k.id} disabled={Number(formData.khoXuatId) === k.id}>{k.tenKho}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú</label>
                                <textarea
                                    value={formData.ghiChu}
                                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                                    rows={3}
                                    placeholder="Lý do điều phối hàng..."
                                    className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none text-sm"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right: Items Table */}
                    <div className="lg:col-span-3 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[427px]">
                            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-purple-600" /> Danh mục hàng điều chuyển
                                </h3>
                                <Button
                                    size="sm"
                                    onClick={() => setShowProductDialog(true)}
                                    className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Thêm sản phẩm
                                </Button>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <Table>
                                    <TableHeader className="bg-gray-50 text-gray-600 font-medium">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="px-5 py-3 text-xs font-bold uppercase tracking-wider">Thông tin sản phẩm</TableHead>
                                            <TableHead className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-center w-32">Số lượng</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-100">
                                        {transferItems.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <Package className="h-10 w-10 opacity-10 mb-2" />
                                                        <p className="text-sm italic font-medium">Chưa có sản phẩm nào được chọn</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            transferItems.map((item, index) => (
                                                <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                                                    <TableCell className="px-5 py-4">
                                                        {/* Dòng 1: Tên biến thể */}
                                                        <div className="font-bold text-gray-900 text-[14px] leading-tight mb-1">
                                                            {item.name}
                                                        </div>
                                                        {/* Dòng 2: Mã biến thể */}
                                                        <div className="text-[12px] font-mono text-blue-600 font-medium mb-1">
                                                            {item.sku}
                                                        </div>
                                                        {/* Dòng 3: Thuộc tính */}
                                                        <div className="text-[11px] text-gray-500 italic">
                                                            Phân loại: {item.color || "N/A"} / {item.size || "N/A"} / {item.material || "N/A"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                                                setTransferItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: val } : it));
                                                            }}
                                                            className="w-20 h-9 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-right">
                                                        <Button
                                                            variant="ghost" size="icon"
                                                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                            onClick={() => setTransferItems(prev => prev.filter((_, i) => i !== index))}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {transferItems.length > 0 && (
                                <div className="p-4 bg-gray-50 border-t flex justify-end items-center gap-4 px-8">
                                    <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Tổng số lượng:</span>
                                    <span className="text-xl font-black text-purple-600">
                                        {transferItems.reduce((sum, item) => sum + item.quantity, 0)}
                                    </span>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
                {/* Footer Actions */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                    <Link to="/transfer-tickets" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                        ← Quay lại danh sách
                    </Link>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleCreate}
                            disabled={loading}
                            className="px-8 bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 font-bold shadow-md transition-all duration-200 active:scale-95"
                        >
                            {loading ? "Đang xử lý..." : <>Tạo phiếu điều chuyển</>}
                        </Button>
                    </div>
                </div>
            </div>

            {/* PRODUCT SELECTOR DIALOG */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-xl">
                    <DialogHeader className="p-6 bg-white border-b border-gray-100">
                        <DialogTitle className="text-xl font-bold text-gray-800">Tìm kiếm sản phẩm</DialogTitle>
                        <DialogDescription className="text-gray-500">Chọn biến thể sản phẩm từ danh mục hệ thống.</DialogDescription>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Nhập tên sản phẩm hoặc mã SKU..."
                                className="pl-10 h-11 bg-gray-50 border-gray-200 focus-visible:ring-purple-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </DialogHeader>

                    <div className="max-h-[450px] overflow-y-auto">
                        <Table>
                            <TableBody>
                                {filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell className="h-32 text-center text-gray-400 italic text-sm">
                                            Không tìm thấy sản phẩm phù hợp...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map(product => (
                                        <TableRow
                                            key={product.id}
                                            className="hover:bg-purple-50/50 cursor-pointer group transition-all"
                                            onClick={() => handleAddProduct(product)}
                                        >
                                            <TableCell className="py-4 px-6">
                                                {/* Dòng 1: Tên sản phẩm */}
                                                <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                    {product.tenSanPham}
                                                </div>
                                                {/* Dòng 2: Mã SKU */}
                                                <div className="text-[12px] font-mono text-gray-500 mt-0.5 font-medium">
                                                    {product.maBienThe}
                                                </div>
                                                {/* Dòng 3: Chi tiết phân loại */}
                                                <div className="text-[11px] text-purple-600/70 font-medium mt-1 uppercase tracking-tighter">
                                                    {product.tenMau || "N/A"} / {product.tenSize || "N/A"} / {product.tenChatLieu || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <Button size="sm" variant="outline" className="h-8 border-gray-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all font-bold">
                                                    Chọn
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}