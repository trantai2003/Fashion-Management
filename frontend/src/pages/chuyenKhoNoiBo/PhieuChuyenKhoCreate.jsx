import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus, Trash2, Search, Package, ArrowDown, ChevronDown,
    Building2, Loader2, ArrowLeft, ClipboardList,
} from "lucide-react";

import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { donBanHangService } from "@/services/donBanHangService";
import { khoService } from "@/services/khoService";

export default function PhieuChuyenKhoCreate() {
    const navigate = useNavigate();

    const [warehouses, setWarehouses] = useState([]);
    const [variants, setVariants] = useState([]);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ khoXuatId: "", khoNhapId: "", ghiChu: "" });
    const [transferItems, setTransferItems] = useState([]);

    useEffect(() => { loadInitialData(); }, []);

    //tải danh sách biến thể và danh sách kho
    async function loadInitialData() {
        try {
            const [variantRes, khoRes] = await Promise.all([
                donBanHangService.getVariantsForCreate(), // tải danh sách biến thể
                khoService.filter({ page: 0, size: 100, filters: [] }), // tải danh sách kho (giới hạn 100 kho, có thể điều chỉnh nếu cần)
            ]);
            setVariants(variantRes?.data?.data || variantRes?.data || []);
            const listKho = khoRes.data?.data?.content || khoRes.data?.content || []; 
            setWarehouses(listKho);
        } catch {
            toast.error("Không thể tải dữ liệu khởi tạo");
        }
    }

    // Lọc biến thể dựa trên searchTerm, tìm kiếm sản phẩm theo tên hoặc mã SKU, không phân biệt hoa thường
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
            toast("Sản phẩm này đã có trong danh sách", { icon: "⚠️" });
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
        if (!formData.khoXuatId || !formData.khoNhapId)
            return toast.error("Vui lòng chọn đầy đủ kho gửi và kho nhận");
        if (formData.khoXuatId === formData.khoNhapId)
            return toast.error("Kho gửi và kho nhận không được trùng nhau");
        if (transferItems.length === 0)
            return toast.error("Vui lòng chọn ít nhất 1 sản phẩm để điều chuyển");
        try {
            setLoading(true);
            const payload = {
                khoXuatId: parseInt(formData.khoXuatId),
                khoNhapId: parseInt(formData.khoNhapId),
                ghiChu: formData.ghiChu?.trim() || "",
                chiTietXuat: transferItems.map(item => ({
                    bienTheSanPhamId: item.variantId,
                    soLuongXuat: item.quantity,
                })),
            };
            const res = await phieuChuyenKhoService.create(payload); //chạy api
            toast.success("Tạo yêu cầu điều chuyển thành công");
            navigate(`/transfer-tickets/${res.id}`);
        } catch (e) {
            toast.error(e?.response?.data?.message || "Lỗi khi tạo phiếu");
        } finally {
            setLoading(false);
        }
    }

    const totalQty = transferItems.reduce((s, i) => s + i.quantity, 0);

    // ── Warehouse dropdown label helper ──
    const khoXuatLabel = formData.khoXuatId
        ? warehouses.find(k => k.id === parseInt(formData.khoXuatId))?.tenKho
        : "Chọn kho gửi";
    const khoNhapLabel = formData.khoNhapId
        ? warehouses.find(k => k.id === parseInt(formData.khoNhapId))?.tenKho
        : "Chọn kho nhận";

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-yellow-50 via-yellow-50 to-amber-50 min-h-screen">
            <div className="space-y-6 w-full">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate("/transfer-tickets")}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </button>
                </div>

                {/* ── Stats cards ── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Kho nguồn</p>
                                <p className="text-base font-bold text-gray-900 mt-1 truncate">
                                    {khoXuatLabel === "Chọn kho gửi" ? <span className="text-gray-400 font-normal text-sm">Chưa chọn</span> : khoXuatLabel}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Kho đích</p>
                                <p className="text-base font-bold text-gray-900 mt-1 truncate">
                                    {khoNhapLabel === "Chọn kho nhận" ? <span className="text-gray-400 font-normal text-sm">Chưa chọn</span> : khoNhapLabel}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-yellow-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng số lượng</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalQty}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* ── LEFT: Thông tin lộ trình ── */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            {/* Panel header */}
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                                    <ClipboardList className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 leading-snug">Thông tin lộ trình</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Chọn kho xuất và kho nhập</p>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Kho xuất */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Kho xuất (Nguồn)
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between font-normal bg-white border-gray-200 focus:border-yellow-500 h-10"
                                            >
                                                <div className="flex items-center overflow-hidden">
                                                    <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate text-sm">{khoXuatLabel}</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[260px] max-h-[300px] overflow-y-auto bg-white border border-gray-100 shadow-xl z-50">
                                            {warehouses.map((k) => (
                                                <DropdownMenuItem
                                                    key={k.id}
                                                    disabled={Number(formData.khoNhapId) === k.id}
                                                    onClick={() => setFormData({ ...formData, khoXuatId: k.id.toString() })}
                                                    className="cursor-pointer hover:bg-yellow-50 py-2 flex flex-col items-start"
                                                >
                                                    <span className="font-medium text-gray-900">{k.tenKho}</span>
                                                    <span className="text-xs text-gray-500">Mã: {k.maKho}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Arrow */}
                                <div className="flex justify-center">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                        <ArrowDown className="h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* Kho nhập */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Kho nhập (Đích)
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-between font-normal bg-white border-gray-200 focus:border-yellow-500 h-10"
                                            >
                                                <div className="flex items-center overflow-hidden">
                                                    <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate text-sm">{khoNhapLabel}</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[260px] max-h-[300px] overflow-y-auto bg-white border border-gray-100 shadow-xl z-50">
                                            {warehouses.map((k) => (
                                                <DropdownMenuItem
                                                    key={k.id}
                                                    disabled={Number(formData.khoXuatId) === k.id}
                                                    onClick={() => setFormData({ ...formData, khoNhapId: k.id.toString() })}
                                                    className="cursor-pointer hover:bg-yellow-50 py-2 flex flex-col items-start"
                                                >
                                                    <span className="font-medium text-gray-900">{k.tenKho}</span>
                                                    <span className="text-xs text-gray-500">Mã: {k.maKho}</span>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Ghi chú */}
                                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={formData.ghiChu}
                                        onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                                        rows={3}
                                        placeholder="Lý do điều phối hàng..."
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all resize-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Danh sách hàng điều chuyển ── */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            {/* Panel header */}
                            <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                                        <Package className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 leading-snug">Danh mục hàng điều chuyển</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Chọn sản phẩm và số lượng cần chuyển</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setShowProductDialog(true)}
                                    className="bg-yellow-500 text-white border border-yellow-500 hover:bg-yellow-600 shadow-sm transition-all duration-200 h-9"
                                >
                                    <Plus className="h-4 w-4 mr-1.5" />
                                    Thêm sản phẩm
                                </Button>
                            </div>

                            {/* Table */}
                            {transferItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                        <Package className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800">Chưa có sản phẩm nào</h3>
                                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                        Nhấn "Thêm sản phẩm" để chọn hàng hóa cần điều chuyển.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">
                                                    Thông tin sản phẩm
                                                </th>
                                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap w-36">
                                                    Số lượng
                                                </th>
                                                <th className="h-12 px-4 w-14" />
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {transferItems.map((item, index) => (
                                                <tr key={item.variantId} className="transition-colors duration-150 hover:bg-yellow-50/50">
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-semibold text-slate-900 leading-snug">
                                                            {item.name}
                                                        </span>
                                                        <span className="block font-mono text-xs text-yellow-600 mt-0.5">
                                                            {item.sku}
                                                        </span>
                                                        <span className="block text-xs text-slate-400 mt-0.5 italic">
                                                            {item.color || "N/A"} / {item.size || "N/A"} / {item.material || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-center">
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                // Chỉ parse khi có dữ liệu, nếu không để chuỗi rỗng để người dùng có thể xóa
                                                                if (val !== "") {
                                                                    val = parseInt(val);
                                                                    if (isNaN(val) || val < 1) val = 1;
                                                                }
                                                                setTransferItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: val } : it));
                                                            }}
                                                            onBlur={(e) => {
                                                                // Khi click chuột ra ngoài, nếu để trống thì reset về 1
                                                                if (e.target.value === "") {
                                                                    setTransferItems(prev => prev.map((it, i) => i === index ? { ...it, quantity: 1 } : it));
                                                                }
                                                            }}
                                                            className="w-24 h-9 border border-gray-200 rounded-lg text-center font-semibold focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => setTransferItems(prev => prev.filter((_, i) => i !== index))}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-red-400 hover:bg-red-50 hover:border-red-200 transition-all duration-150"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Panel footer */}
                            {transferItems.length > 0 && (
                                <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-t border-slate-100">
                                    <p className="text-sm text-slate-500">
                                        Tổng{" "}
                                        <span className="font-semibold text-yellow-600">{transferItems.length}</span>{" "}
                                        sản phẩm —{" "}
                                        <span className="font-semibold text-yellow-600">{totalQty}</span>{" "}
                                        đơn vị
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm transition-all duration-200 font-medium"
                                            onClick={() => navigate("/transfer-tickets")}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            onClick={handleCreate} //khi bấm vào button tạo phiếu điều chuyển thì sẽ gọi hàm handleCreate để gửi dữ liệu lên server
                                            disabled={loading}
                                            className="bg-yellow-500 text-white border border-yellow-500 hover:bg-yellow-600 shadow-sm transition-all duration-200 min-w-[180px] font-bold"
                                        >
                                            {loading
                                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                                                : <>Tạo phiếu điều chuyển</>
                                            }
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── PRODUCT SELECTOR DIALOG ── */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent
                    className="max-w-2xl p-0 overflow-hidden shadow-2xl rounded-2xl border-none"
                    style={{ background: "#faf7f0", color: "#0f172a", outline: "none" }}
                >
                    {/* Panel header */}
                    <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0" style={{ background: "#fef9c3" }}>
                            <Search className="h-4 w-4" style={{ color: "#ca8a04" }} />
                        </div>
                        <div>
                            <p className="font-semibold leading-snug" style={{ color: "#0f172a" }}>Tìm kiếm sản phẩm</p>
                            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Chọn biến thể sản phẩm từ danh mục hệ thống</p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="px-6 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4" style={{ color: "#9ca3af" }} />
                            <Input
                                placeholder="Nhập tên sản phẩm hoặc mã SKU..."
                                className="pl-9"
                                style={{ background: "#ffffff", color: "#0f172a", borderColor: "#e5e7eb" }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="max-h-[400px] overflow-y-auto" style={{ background: "#faf7f0" }}>
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "#f1f5f9" }}>
                                    <Search className="h-10 w-10" style={{ color: "#94a3b8" }} />
                                </div>
                                <h3 className="text-lg font-semibold" style={{ color: "#1e293b" }}>Không tìm thấy sản phẩm</h3>
                                <p className="mt-2 text-sm" style={{ color: "#64748b" }}>Thử tìm với từ khóa khác</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm" style={{ background: "#faf7f0", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f5efe0" }}>
                                        <th
                                            className="h-10 px-6 text-left font-semibold tracking-wide text-xs uppercase whitespace-nowrap"
                                            style={{ color: "#64748b", borderTop: "1px solid #ede8db", borderBottom: "1px solid #ede8db" }}
                                        >
                                            Sản phẩm
                                        </th>
                                        <th
                                            className="h-10 px-4 w-24"
                                            style={{ borderTop: "1px solid #ede8db", borderBottom: "1px solid #ede8db" }}
                                        />
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product, idx) => (
                                        <tr
                                            key={product.id}
                                            style={{
                                                background: "#faf7f0",
                                                borderBottom: idx < filteredProducts.length - 1 ? "1px solid #ede8db" : "none",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "#fef9c3"}
                                            onMouseLeave={e => e.currentTarget.style.background = "#faf7f0"}
                                            onClick={() => handleAddProduct(product)}
                                        >
                                            <td className="px-6 py-3.5 align-middle">
                                                <span className="font-semibold leading-snug" style={{ color: "#0f172a" }}>
                                                    {product.tenSanPham}
                                                </span>
                                                <span className="block font-mono text-xs mt-0.5" style={{ color: "#ca8a04" }}>
                                                    {product.maBienThe}
                                                </span>
                                                <span className="block text-xs mt-0.5 italic" style={{ color: "#94a3b8" }}>
                                                    {product.tenMau || "N/A"} / {product.tenSize || "N/A"} / {product.tenChatLieu || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 align-middle text-right">
                                                <button
                                                    type="button"
                                                    className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold transition-all duration-150"
                                                    style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "#ca8a04"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "#eab308"}
                                                    onClick={(e) => { e.stopPropagation(); handleAddProduct(product); }}
                                                >
                                                    Chọn
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Panel footer */}
                    <div className="flex items-center justify-between px-6 py-4" style={{ background: "#f5efe0", borderTop: "1px solid #f1f5f9" }}>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                            <span className="font-semibold" style={{ color: "#ca8a04" }}>{filteredProducts.length}</span> kết quả
                        </p>
                        <button
                            type="button"
                            className="inline-flex h-8 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                            style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#faf7f0"}
                            onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                            onClick={() => { setShowProductDialog(false); setSearchTerm(""); }}
                        >
                            Đóng
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}