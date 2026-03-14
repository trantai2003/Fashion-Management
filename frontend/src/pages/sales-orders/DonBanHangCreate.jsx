import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Plus, Trash2, ArrowLeft, Search, ShoppingCart, User,
  Truck, Check, Warehouse, Home, Loader2, Package,
} from "lucide-react";
import { donBanHangService } from "@/services/donBanHangService";
import { getKhoList } from "@/services/khoService";

export default function SalesOrderCreate() {
  const navigate = useNavigate();

  const [customers,             setCustomers]             = useState([]);
  const [variants,              setVariants]              = useState([]);
  const [warehouses,            setWarehouses]            = useState([]);
  const [showProductDialog,     setShowProductDialog]     = useState(false);
  const [searchTerm,            setSearchTerm]            = useState("");
  const [loading,               setLoading]               = useState(false);
  const [customerSearch,        setCustomerSearch]        = useState("");
  const [showCustomerDropdown,  setShowCustomerDropdown]  = useState(false);
  const [warehouseSearch,       setWarehouseSearch]       = useState("");
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  const [formData, setFormData] = useState({
    khachHangId: "", khoXuatId: "", phiVanChuyen: 0,
    diaChiGiaoHang: "", ghiChu: "",
  });
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [variantRes, customerRes, warehouseRes] = await Promise.all([
        donBanHangService.getVariantsForCreate(),
        donBanHangService.getCustomersForCreate(),
        getKhoList(),
      ]);
      setVariants(variantRes?.data?.data || []);
      setCustomers(customerRes?.data?.data || []);
      setWarehouses(warehouseRes || []);
    } catch { toast.error("Không thể tải dữ liệu hệ thống"); }
  }

  const selectedCustomer = useMemo(() =>
    customers.find(c => c.id === Number(formData.khachHangId)),
    [customers, formData.khachHangId]);

  const filteredCustomers = useMemo(() => {
    const lower = customerSearch.toLowerCase();
    if (!lower.trim()) return [];
    return customers.filter(c =>
      c.tenKhachHang?.toLowerCase().includes(lower) || c.soDienThoai?.includes(lower)
    );
  }, [customerSearch, customers]);

  const filteredWarehouses = useMemo(() => {
    const lower = warehouseSearch.toLowerCase();
    if (!lower.trim()) return warehouses;
    return warehouses.filter(w =>
      w.tenKho?.toLowerCase().includes(lower) || w.maKho?.toLowerCase().includes(lower)
    );
  }, [warehouseSearch, warehouses]);

  const filteredProducts = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return variants.filter(v =>
      v.tenSanPham?.toLowerCase().includes(lower) || v.maBienThe?.toLowerCase().includes(lower)
    );
  }, [searchTerm, variants]);

  const handleSelectCustomer = (c) => {
    setFormData(prev => ({ ...prev, khachHangId: c.id, diaChiGiaoHang: c.diaChi || "" }));
    setCustomerSearch(c.tenKhachHang);
    setShowCustomerDropdown(false);
  };

  const handleSelectWarehouse = (w) => {
    setFormData(prev => ({ ...prev, khoXuatId: w.id }));
    setWarehouseSearch(w.tenKho);
    setShowWarehouseDropdown(false);
  };

  const handleAddProduct = (product) => {
    if (orderItems.some(i => i.bienTheSanPhamId === product.id)) {
      toast("Sản phẩm này đã có trong danh sách", { icon: "⚠️" });
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
  const totalOrderMoney   = totalProductMoney + Number(formData.phiVanChuyen || 0);

  async function handleCreate() {
    if (!formData.khachHangId) return toast.error("Vui lòng chọn khách hàng");
    if (!formData.khoXuatId)   return toast.error("Vui lòng chọn kho xuất hàng");
    if (orderItems.length === 0) return toast.error("Chưa có sản phẩm nào trong đơn hàng");
    try {
      setLoading(true);
      await donBanHangService.create({
        khachHangId:     parseInt(formData.khachHangId),
        khoXuatId:       parseInt(formData.khoXuatId),
        phiVanChuyen:    formData.phiVanChuyen === "" ? 0 : Number(formData.phiVanChuyen),
        diaChiGiaoHang:  formData.diaChiGiaoHang?.trim() || "",
        ghiChu:          formData.ghiChu?.trim() || "",
        chiTiet: orderItems.map(item => ({
          bienTheSanPhamId: parseInt(item.bienTheSanPhamId),
          soLuongDat:       parseInt(item.soLuongDat),
          donGia:           parseFloat(item.donGia),
        })),
      });
      toast.success("Tạo đơn bán thành công");
      navigate("/sales-orders");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.response?.data?.errors?.[0] || "Lỗi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-yellow-50 via-yellow-50 to-amber-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/sales-orders")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Thông tin đơn ── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                  <User className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Khách hàng & Giao nhận</p>
                  <p className="text-xs text-slate-500 mt-0.5">Chọn kho và khách hàng</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Kho xuất */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Warehouse className="h-3 w-3" /> Kho xuất hàng *
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Gõ tên hoặc mã kho..."
                      value={warehouseSearch}
                      onChange={(e) => { setWarehouseSearch(e.target.value); setShowWarehouseDropdown(true); }}
                      onFocus={() => setShowWarehouseDropdown(true)}
                      className="pl-9 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 h-10"
                    />
                  </div>
                  {showWarehouseDropdown && filteredWarehouses.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto ring-1 ring-slate-200/80">
                      {filteredWarehouses.map(w => (
                        <div key={w.id} onClick={() => handleSelectWarehouse(w)} className="px-4 py-2.5 hover:bg-yellow-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{w.tenKho}</div>
                            <div className="text-xs text-slate-400 font-mono">{w.maKho}</div>
                          </div>
                          {formData.khoXuatId === w.id && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100" />

                {/* Khách hàng */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Khách hàng *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tên hoặc SĐT khách hàng..."
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="pl-9 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 h-10"
                    />
                  </div>
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto ring-1 ring-slate-200/80">
                      {filteredCustomers.map(c => (
                        <div key={c.id} onClick={() => handleSelectCustomer(c)} className="px-4 py-2.5 hover:bg-yellow-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{c.tenKhachHang}</div>
                            <div className="text-xs text-slate-500">{c.soDienThoai}</div>
                          </div>
                          {formData.khachHangId === c.id && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedCustomer && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-2 text-slate-700">
                      <div className="flex justify-between"><span className="text-slate-400">SĐT:</span> <b>{selectedCustomer.soDienThoai}</b></div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400">Địa chỉ gốc:</span>
                        <b className="text-right ml-4 max-w-[180px] text-slate-900">{selectedCustomer.diaChi}</b>
                      </div>
                    </div>
                  )}
                </div>

                {/* Phí vận chuyển */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Phí vận chuyển
                  </Label>
                  <Input
                    type="number"
                    value={formData.phiVanChuyen}
                    onChange={(e) => setFormData({ ...formData, phiVanChuyen: e.target.value })}
                    className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 h-10"
                  />
                </div>

                {/* Địa chỉ nhận */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Địa chỉ nhận hàng</Label>
                  <Input
                    value={formData.diaChiGiaoHang}
                    placeholder="Nhập địa chỉ cụ thể..."
                    onChange={(e) => setFormData({ ...formData, diaChiGiaoHang: e.target.value })}
                    className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 h-10"
                  />
                </div>

                {/* Ghi chú */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú đơn hàng</Label>
                  <Textarea
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Chi tiết đơn hàng ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-snug">Chi tiết đơn hàng</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sản phẩm và số lượng</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowProductDialog(true)}
                  className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 h-9"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Thêm sản phẩm
                </Button>
              </div>

              {/* Empty state */}
              {orderItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <ShoppingCart className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Chưa có sản phẩm nào</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Nhấn "Thêm sản phẩm" để chọn hàng hóa cho đơn.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Sản phẩm</th>
                          <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap w-28">Số lượng</th>
                          <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap w-36">Đơn giá</th>
                          <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap w-36">Thành tiền</th>
                          <th className="h-12 px-4 w-12" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderItems.map((item, index) => (
                          <tr key={index} className="transition-colors duration-150 hover:bg-yellow-50/50">
                            <td className="px-4 py-3.5 align-middle">
                              <span className="font-semibold text-slate-900">{item.tenSanPham}</span>
                              <span className="block font-mono text-xs text-slate-400 mt-0.5">{item.maBienThe}</span>
                              {item.donGia < item.giaGoc && (
                                <span className="inline-flex items-center rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-xs font-semibold text-amber-700 mt-1">
                                  Thấp hơn {Math.ceil(((item.giaGoc - item.donGia) / item.giaGoc) * 100)}% so với niêm yết
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 align-middle text-center">
                              <input
                                type="number" min="1" value={item.soLuongDat}
                                onChange={(e) => handleUpdateQty(index, e.target.value)}
                                className="w-20 h-9 text-center border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 font-semibold"
                              />
                            </td>
                            <td className="px-4 py-3.5 align-middle text-right">
                              <input
                                type="number" value={item.donGia}
                                onChange={(e) => handleUpdatePrice(index, e.target.value)}
                                className="w-28 h-9 text-right border border-gray-200 rounded-lg px-2 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 font-medium"
                              />
                            </td>
                            <td className="px-4 py-3.5 align-middle text-right">
                              <span className="font-bold text-slate-900">{item.thanhTien?.toLocaleString()}đ</span>
                            </td>
                            <td className="px-4 py-3.5 align-middle text-center">
                              <button
                                type="button"
                                onClick={() => setOrderItems(prev => prev.filter((_, i) => i !== index))}
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

                  {/* Footer tổng tiền */}
                  <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tổng tiền hàng:</span>
                      <span className="font-semibold text-slate-900">{totalProductMoney.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Phí vận chuyển:</span>
                      <span className="font-semibold text-slate-900">{(Number(formData.phiVanChuyen) || 0).toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between text-base pt-3 border-t border-slate-200">
                      <span className="font-bold text-slate-900">Tổng thanh toán</span>
                      <span className="font-black text-slate-900 text-lg">{totalOrderMoney.toLocaleString()} đ</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate("/sales-orders")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
          <Button
            onClick={handleCreate}
            disabled={loading}
            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold min-w-[200px] h-11"
          >
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo...</>
              : "Xác nhận tạo đơn hàng"
            }
          </Button>
        </div>
      </div>

      {/* ── Product Dialog ── */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl"
          style={{ background: "#faf7f0", color: "#0f172a", outline: "none" }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-3 px-6 py-5" style={{ background: "#faf7f0" }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full flex-shrink-0" style={{ background: "#fef9c3" }}>
              <Search className="h-4 w-4" style={{ color: "#ca8a04" }} />
            </div>
            <div>
              <p className="font-semibold leading-snug" style={{ color: "#0f172a" }}>Tìm kiếm sản phẩm</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Chọn biến thể từ danh mục hệ thống</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 pb-4" style={{ background: "#faf7f0" }}>
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

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto" style={{ background: "#faf7f0" }}>
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "#f1ead8" }}>
                  <Package className="h-10 w-10" style={{ color: "#b45309" }} />
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
                    >Sản phẩm</th>
                    <th
                      className="h-10 px-4 text-right font-semibold tracking-wide text-xs uppercase whitespace-nowrap"
                      style={{ color: "#64748b", borderTop: "1px solid #ede8db", borderBottom: "1px solid #ede8db" }}
                    >Giá bán</th>
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
                        <span className="font-semibold leading-snug" style={{ color: "#0f172a" }}>{product.tenSanPham}</span>
                        <span className="block font-mono text-xs mt-0.5" style={{ color: "#ca8a04" }}>{product.maBienThe}</span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right">
                        <span className="font-semibold" style={{ color: "#475569" }}>{product.giaBan?.toLocaleString()}đ</span>
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
          <div className="flex items-center justify-between px-6 py-4" style={{ background: "#f5efe0", borderTop: "1px solid #ede8db" }}>
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