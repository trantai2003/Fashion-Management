import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Search, ShoppingCart, User,
  Truck, Check, Warehouse, Home, Loader2, FileText, ChevronDown,
} from "lucide-react";
import { donBanHangService } from "@/services/donBanHangService";
import { getKhoList } from "@/services/khoService";

export default function DonBanHangCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuoteId = searchParams.get("quoteId");
  const [pendingQuotes, setPendingQuotes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [quoteSearch, setQuoteSearch] = useState("");
  const [showQuoteDropdown, setShowQuoteDropdown] = useState(false);

  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const [formData, setFormData] = useState({
    khoXuatId: "", phiVanChuyen: 0,
    diaChiGiaoHang: "", ghiChu: "",
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      // Fetch các báo giá đang Chờ phản hồi
      const payload = {
        page: 0, size: 100,
        filters: [
          { fieldName: "loaiChungTu", operation: "EQUALS", value: "bao_gia" },
          { fieldName: "trangThai", operation: "EQUALS", value: 0 }
        ]
      };
      const [quotesRes, warehouseRes] = await Promise.all([
        donBanHangService.filter(payload),
        getKhoList(),
      ]);
      
      const quotes = quotesRes?.content || [];
      setPendingQuotes(quotes);
      setWarehouses(warehouseRes || []);

      if (initialQuoteId) {
        let targetQuote = quotes.find(q => q.id.toString() === initialQuoteId);
        
        if (!targetQuote) {
            const detailRes = await donBanHangService.getDetail(initialQuoteId);
            targetQuote = detailRes.data?.donBanHang;
        }
        if (targetQuote) {
            handleSelectQuote(targetQuote);
        }
      }

    } catch { 
      toast.error("Không thể tải dữ liệu hệ thống"); 
    }
  }

  const filteredQuotes = useMemo(() => {
    const lower = quoteSearch.toLowerCase();
    if (!lower.trim()) return pendingQuotes;
    return pendingQuotes.filter(q =>
      q.soDonHang?.toLowerCase().includes(lower) ||
      q.khachHang?.tenKhachHang?.toLowerCase().includes(lower)
    );
  }, [quoteSearch, pendingQuotes]);

  const filteredWarehouses = useMemo(() => {
    const lower = warehouseSearch.toLowerCase();
    if (!lower.trim()) return warehouses;
    return warehouses.filter(w =>
      w.tenKho?.toLowerCase().includes(lower) || w.maKho?.toLowerCase().includes(lower)
    );
  }, [warehouseSearch, warehouses]);

  const handleSelectQuote = async (quote) => {
    setQuoteSearch(`${quote.soDonHang} - ${quote.khachHang?.tenKhachHang || 'Khách lẻ'}`);
    setShowQuoteDropdown(false);
    setSelectedQuoteId(quote.id);
    setSelectedCustomer(quote.khachHang);

    try {
      setLoading(true);
      const res = await donBanHangService.getDetail(quote.id);
      const detail = res.data?.donBanHang;
      const chiTiet = res.data?.chiTiet || [];

      setFormData(prev => ({
        ...prev,
        phiVanChuyen: detail.phiVanChuyen || 0,
        diaChiGiaoHang: detail.diaChiGiaoHang || "",
        ghiChu: detail.ghiChu || "",
      }));

      setOrderItems(chiTiet.map(item => ({
        ...item,
        tenSanPham: item.tenSanPham || "",
        maBienThe: item.sku || "",
        thanhTien: item.soLuongDat * item.donGia
      })));
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết báo giá");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWarehouse = (w) => {
    setFormData(prev => ({ ...prev, khoXuatId: w.id }));
    setWarehouseSearch(w.tenKho);
    setShowWarehouseDropdown(false);
  };

  const totalProductMoney = orderItems.reduce((sum, i) => sum + i.thanhTien, 0);
  const totalOrderMoney = totalProductMoney + Number(formData.phiVanChuyen || 0);

  async function handleCreateOrder() {
    if (!selectedQuoteId) return toast.error("Vui lòng chọn báo giá để tạo đơn");
    if (!formData.khoXuatId) return toast.error("Vui lòng chọn kho xuất hàng");

    try {
      setLoading(true);
      await donBanHangService.convertToOrder(selectedQuoteId, {
        khoXuatId: parseInt(formData.khoXuatId),
        phiVanChuyen: Number(formData.phiVanChuyen),
        ghiChu: formData.ghiChu,
        diaChiGiaoHang: formData.diaChiGiaoHang
      });

      toast.success("Tạo đơn bán hàng thành công");
      navigate("/sales-orders");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.response?.data?.errors?.[0] || "Lỗi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/sales-orders")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách Đơn bán hàng
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Khởi tạo Đơn bán hàng</p>
                  <p className="text-xs text-slate-500 mt-0.5">Chọn báo giá và kho xuất</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="space-y-1.5 relative">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Chọn báo giá *</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm theo mã BG hoặc tên KH..."
                      value={quoteSearch}
                      onChange={(e) => { setQuoteSearch(e.target.value); setShowQuoteDropdown(true); }}
                      onFocus={() => setShowQuoteDropdown(true)}
                      className="pl-9 pr-8 border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-10 font-semibold text-purple-700"
                    />
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {showQuoteDropdown && filteredQuotes.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto ring-1 ring-slate-200/80">
                      {filteredQuotes.map(q => (
                        <div key={q.id} onClick={() => handleSelectQuote(q)} className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b last:border-0 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-purple-600">{q.soDonHang}</span>
                            <span className="text-xs font-semibold text-slate-600">{q.tongCong?.toLocaleString()}đ</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{q.khachHang?.tenKhachHang || 'Khách lẻ'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredQuotes.length === 0 && showQuoteDropdown && (
                    <div className="absolute z-50 w-full mt-1 p-4 bg-white border border-gray-200 rounded-xl text-sm text-center text-gray-500 shadow-xl">
                      Không có báo giá nào đang chờ
                    </div>
                  )}
                </div>

                {selectedCustomer && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-2 text-slate-700">
                    <div className="flex justify-between"><span className="text-slate-400">Khách hàng:</span> <b className="text-slate-900">{selectedCustomer.tenKhachHang}</b></div>
                    <div className="flex justify-between"><span className="text-slate-400">SĐT:</span> <b>{selectedCustomer.soDienThoai}</b></div>
                  </div>
                )}

                <div className="border-t border-slate-100" />

                {/* Kho xuất */}
                <div className="space-y-1.5 relative">
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
                      className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-10"
                    />
                  </div>
                  {showWarehouseDropdown && filteredWarehouses.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto ring-1 ring-slate-200/80">
                      {filteredWarehouses.map(w => (
                        <div key={w.id} onClick={() => handleSelectWarehouse(w)} className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer border-b last:border-0 flex justify-between items-center transition-colors">
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

                {/* Phí vận chuyển */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                    <Truck className="h-3 w-3" /> Phí vận chuyển
                  </Label>
                  <Input
                    type="number"
                    value={formData.phiVanChuyen}
                    onChange={(e) => setFormData({ ...formData, phiVanChuyen: e.target.value })}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-10"
                  />
                </div>

                {/* Địa chỉ nhận */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Địa chỉ nhận hàng</Label>
                  <Input
                    value={formData.diaChiGiaoHang}
                    onChange={(e) => setFormData({ ...formData, diaChiGiaoHang: e.target.value })}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-10"
                  />
                </div>

                {/* Ghi chú */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú đơn hàng</Label>
                  <Textarea
                    value={formData.ghiChu}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Chi tiết đơn hàng (Từ báo giá) ── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden min-h-[400px] flex flex-col">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <ShoppingCart className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Chi tiết đơn hàng</p>
                  <p className="text-xs text-slate-500 mt-0.5">Dữ liệu được kế thừa tự động từ báo giá</p>
                </div>
              </div>

              {/* Empty state / Loading */}
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                  <Loader2 className="h-10 w-10 animate-spin mb-4 text-purple-600" />
                  <p>Đang tải chi tiết...</p>
                </div>
              ) : orderItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <ShoppingCart className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Chưa chọn báo giá</h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Vui lòng tìm và chọn một báo giá bên trái để hiển thị sản phẩm.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Sản phẩm</th>
                          <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Số lượng</th>
                          <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase">Đơn giá</th>
                          <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderItems.map((item, index) => (
                          <tr key={index} className="transition-colors duration-150 hover:bg-slate-50/50">
                            <td className="px-4 py-3.5 align-middle">
                              <span className="font-semibold text-slate-900">{item.tenSanPham}</span>
                              <span className="block font-mono text-xs text-slate-400 mt-0.5">{item.maBienThe}</span>
                            </td>
                            <td className="px-4 py-3.5 align-middle text-center">
                              <span className="inline-block px-3 py-1 bg-slate-100 rounded text-slate-700 font-bold">{item.soLuongDat}</span>
                            </td>
                            <td className="px-4 py-3.5 align-middle text-right">
                              <span className="font-semibold text-slate-700">{item.donGia?.toLocaleString()}đ</span>
                            </td>
                            <td className="px-4 py-3.5 align-middle text-right">
                              <span className="font-bold text-purple-700">{item.thanhTien?.toLocaleString()}đ</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer tổng tiền */}
                  <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 space-y-2 mt-auto">
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
                      <span className="font-black text-purple-700 text-xl">{totalOrderMoney.toLocaleString()} đ</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-end pt-2">
          <Button
            onClick={handleCreateOrder}
            disabled={loading || !selectedQuoteId}
            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold min-w-[200px] h-11"
          >
            {loading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
              : "Xác nhận tạo đơn hàng"
            }
          </Button>
        </div>
      </div>
    </div>
  );
}