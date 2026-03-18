import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, FileText, User, Home, Truck, Calculator,
  Clock, CheckCircle2, Package, Calendar, Send, XCircle,
  Receipt, Hash, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Trạng thái ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  0: { label: "Nháp", badge: "inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700", dot: "h-1.5 w-1.5 rounded-full bg-yellow-500" },
  1: { label: "Chờ xuất kho", badge: "inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700", dot: "h-1.5 w-1.5 rounded-full bg-blue-500" },
  2: { label: "Đã xuất kho 1 phần", badge: "inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700", dot: "h-1.5 w-1.5 rounded-full bg-indigo-500" },
  3: { label: "Đã xuất kho", badge: "inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700", dot: "h-1.5 w-1.5 rounded-full bg-orange-500" },
  4: { label: "Đã hủy", badge: "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700", dot: "h-1.5 w-1.5 rounded-full bg-red-500" },
  5: { label: "Hoàn thành", badge: "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700", dot: "h-1.5 w-1.5 rounded-full bg-emerald-500" }
};

export default function DonBanHangDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleMarkAsDelivered() {
    try {
      setLoading(true);
      await donBanHangService.markAsDelivered(id); // Nhớ khai báo API này trong donBanHangService
      toast.success("Đã xác nhận giao hàng thành công!");
      fetchDetail();
    }
    catch { toast.error("Không thể xác nhận giao hàng"); }
    finally { setLoading(false); }
  }

  async function fetchDetail() {
    setLoading(true);
    try { const res = await donBanHangService.getDetail(id); setData(res.data); }
    catch { toast.error("Không tải được chi tiết đơn bán"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchDetail(); }, [id]);

  async function handleSendToWarehouse() {
    try { setLoading(true); await donBanHangService.sendToWarehouse(id); toast.success("Đã gửi đơn sang kho"); fetchDetail(); }
    catch { toast.error("Không thể gửi đơn"); }
    finally { setLoading(false); }
  }

  async function handleCancel() {
    try { setLoading(true); await donBanHangService.cancel(id); toast.success("Đã hủy đơn bán"); fetchDetail(); }
    catch { toast.error("Không thể hủy đơn"); }
    finally { setLoading(false); }
  }

  if (loading && !data) {
    return (
      <div className="lux-sync warehouse-unified p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          <span className="text-sm text-gray-600">Đang tải chi tiết đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { donBanHang, chiTiet, phieuXuatKhoList } = data;
  const st = STATUS_MAP[donBanHang.trangThai] ?? STATUS_MAP[0];

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
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

          <div className="flex items-center gap-2">
            <span className={st.badge}><span className={st.dot} />{st.label}</span>

            {donBanHang.trangThai === 0 && (
              <Button
                onClick={handleSendToWarehouse}
                disabled={loading}
                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
              >
                <Send className="mr-2 h-4 w-4" /> Gửi sang kho
              </Button>
            )}

            {donBanHang.trangThai < 3 && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium transition-all duration-200"
              >
                <XCircle className="mr-2 h-4 w-4" /> Hủy đơn
              </Button>
            )}

            {donBanHang.trangThai === 3 && (
              <Button
                onClick={handleMarkAsDelivered}
                disabled={loading}
                className="bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200 font-bold"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Xác nhận đã giao
              </Button>
            )}

            {donBanHang.trangThai >= 0 && (
              <Button
                onClick={() => navigate(`/sales-orders/${id}/invoice`)}
                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
              >
                <Receipt className="mr-2 h-4 w-4" /> Xem hóa đơn
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Thông tin chung ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Chi tiết đơn hàng</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{donBanHang.soDonHang}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Trạng thái */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Trạng thái hiện tại</p>
                  <span className={st.badge}><span className={st.dot} />{st.label}</span>
                </div>

                {/* Info rows */}
                {[
                  { icon: User,     color: "bg-blue-50 text-blue-600",   label: "Khách hàng",         value: donBanHang.khachHang?.tenKhachHang },
                  { icon: Home,     color: "bg-orange-50 text-orange-600", label: "Kho xuất",          value: donBanHang.khoXuat?.tenKho || "Chưa xác định" },
                  { icon: Calendar, color: "bg-indigo-50 text-indigo-600", label: "Ngày đặt",          value: new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) },
                  { icon: MapPin,   color: "bg-red-50 text-red-600",     label: "Địa chỉ nhận hàng", value: donBanHang.diaChiGiaoHang || "—" },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">{value}</p>
                    </div>
                  </div>
                ))}

                {/* Tổng tiền */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Tạm tính</span>
                    <span className="text-sm font-semibold text-slate-600">{(donBanHang.tienHang ?? 0).toLocaleString()}đ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1"><Truck className="h-3 w-3" />Phí vận chuyển</span>
                    <span className="text-sm font-semibold text-slate-600">{(donBanHang.phiVanChuyen ?? 0).toLocaleString()}đ</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1"><Calculator className="h-3.5 w-3.5" />Tổng cộng</span>
                    <span className="text-xl font-black text-slate-900">{(donBanHang.tongCong ?? 0).toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Tables ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Danh mục sản phẩm */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-900">Danh mục sản phẩm</p>
                <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {chiTiet.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Thông tin SKU</th>
                      <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Lượng đặt</th>
                      <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Đã giao</th>
                      <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Đơn giá</th>
                      <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Tạm tính</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chiTiet.map((item) => (
                      <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">{item.tenSanPham}</span>
                          <span className="block font-mono text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Hash className="h-3 w-3" />{item.sku}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-slate-100 px-2 font-bold text-slate-900 ring-1 ring-slate-200 text-xs">
                            {item.soLuongDat}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-semibold text-xs ${item.soLuongDaGiao >= item.soLuongDat ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-50 text-slate-400 ring-1 ring-slate-200"}`}>
                            {item.soLuongDaGiao >= item.soLuongDat && <CheckCircle2 className="h-3.5 w-3.5" />}
                            {item.soLuongDaGiao}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right text-slate-500 text-sm italic">
                          {item.donGia.toLocaleString()}đ
                        </td>
                        <td className="px-4 py-3.5 align-middle text-right">
                          <span className="font-bold text-slate-900">{item.thanhTien.toLocaleString()}đ</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lịch sử xuất hàng */}
            {phieuXuatKhoList && phieuXuatKhoList.length > 0 && (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                    <Clock className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Lịch sử xuất hàng</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Số hiệu phiếu</th>
                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Ngày xuất</th>
                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Trạng thái</th>
                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {phieuXuatKhoList.map((px) => {
                        const pxSt = STATUS_MAP[px.trangThai];
                        return (
                          <tr
                            key={px.id}
                            onClick={() => navigate(`/goods-issues/${px.id}/view`)}
                            className="cursor-pointer transition-colors duration-150 hover:bg-violet-50/50"
                          >
                            <td className="px-4 py-3.5 align-middle">
                              <span className="font-bold text-violet-600 font-mono">{px.soPhieuXuat}</span>
                            </td>
                            <td className="px-4 py-3.5 align-middle text-sm text-slate-600">
                              {new Date(px.ngayXuat).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="px-4 py-3.5 align-middle">
                              {pxSt && (
                                <span className={pxSt.badge}><span className={pxSt.dot} />{pxSt.label}</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 align-middle text-xs text-slate-400 italic">
                              {px.ghiChu || "Không có ghi chú"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}