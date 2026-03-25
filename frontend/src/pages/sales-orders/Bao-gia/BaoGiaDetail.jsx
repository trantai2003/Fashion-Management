import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import apiClient from "@/services/apiClient";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, FileText, User, Calculator,
  Clock, CheckCircle2, Package, Calendar, XCircle,
  Receipt, Hash, MapPin, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ── Constants & Helpers ──────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
    NHAN_VIEN_BAN_HANG: "nhan_vien_ban_hang",
};

function parseJwt(token) {
    try {
        const b64 = token.split(".")[1];
        return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    } catch { return null; }
}

function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
}

// ── Trạng thái Báo Giá ───────────────────────────────────────────────────
const QUOTE_STATUS_MAP = {
  0: { label: "Đang chờ phản hồi", badge: "inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700", dot: "h-1.5 w-1.5 rounded-full bg-amber-500" },
  2: { label: "Đã chốt đơn", badge: "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700", dot: "h-1.5 w-1.5 rounded-full bg-emerald-500" },
  4: { label: "Bị từ chối", badge: "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700", dot: "h-1.5 w-1.5 rounded-full bg-red-500" },
};

export default function BaoGiaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState([]);
  
  // State cho Modal Từ chối
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Fetch roles
  useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const payload = parseJwt(token);
            if (!payload || !payload.id) return;

            const userResponse = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
            const userData = userResponse.data?.data;
            if (userData && userData.vaiTro) {
                setUserRoles(parseRoles(userData.vaiTro));
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin user:', error);
        }
    };
    fetchUserInfo();
  }, []);

  const isKhoRole = userRoles.includes(ROLE.QUAN_LY_KHO) || userRoles.includes(ROLE.NHAN_VIEN_KHO);

  async function fetchDetail() {
    setLoading(true);
    try { 
      const res = await donBanHangService.getDetail(id); 
      setData(res.data); 
    }
    catch { toast.error("Không tải được chi tiết báo giá"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchDetail(); }, [id]);

  // ── Handlers ──
  const handleReject = async () => {
    if (!rejectReason.trim()) {
        toast.error("Vui lòng nhập lý do từ chối");
        return;
    }
    try {
      setRejectLoading(true);
      await donBanHangService.rejectQuote(id, { reason: rejectReason });
      toast.success("Đã từ chối báo giá");
      setShowRejectModal(false);
      fetchDetail();
    } catch {
      toast.error("Không thể từ chối báo giá");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleApprove = () => {
      toast.success("Đang chuyển sang màn hình chốt đơn...");
      navigate(`/sales-orders/create?quoteId=${id}`);
  };

  if (loading && !data) {
    return (
      <div className="lux-sync warehouse-unified p-6 bg-gradient-to-br from-slate-50 via-yellow-50 to-amber-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
          <span className="text-sm text-gray-600">Đang tải chi tiết báo giá...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { donBanHang, chiTiet } = data;
  const st = QUOTE_STATUS_MAP[donBanHang.trangThai] ?? QUOTE_STATUS_MAP[0];

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-yellow-50 to-amber-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/sales-quotations")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách Báo giá
          </button>

          <div className="flex items-center gap-2">
            <span className={st.badge}><span className={st.dot} />{st.label}</span>

            {/* Các role thường mới thấy các nút này */}
            {!isKhoRole && (
              <>
                {donBanHang.trangThai === 0 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium transition-all duration-200"
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Từ chối
                    </Button>
                    <Button
                      onClick={handleApprove}
                      className="bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200 font-bold"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Chấp nhận (Chốt đơn)
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => navigate(`/sales-quotations/${id}/print`)}
                  className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
                >
                  <Receipt className="mr-2 h-4 w-4" /> In / PDF Báo giá
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Thông tin chung ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Chi tiết Báo giá</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{donBanHang.soDonHang}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">

                {/* Info rows */}
                {[
                  { icon: User,     color: "bg-blue-50 text-blue-600",   label: "Khách hàng",        value: donBanHang.khachHang?.tenKhachHang },
                  { icon: Calendar, color: "bg-indigo-50 text-indigo-600", label: "Ngày lập",          value: new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) },
                  { icon: MapPin,   color: "bg-red-50 text-red-600",     label: "Địa chỉ dự kiến", value: donBanHang.diaChiGiaoHang || "—" },
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

                {/* Hiển thị lý do từ chối nếu có */}
                {donBanHang.trangThai === 4 && donBanHang.lyDoTuChoi && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 mt-4">
                      <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1">Lý do từ chối:</p>
                      <p className="text-sm text-red-900 italic">{donBanHang.lyDoTuChoi}</p>
                  </div>
                )}

                {/* Tổng tiền */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Tiền hàng</span>
                    <span className="text-sm font-semibold text-slate-600">{(donBanHang.tienHang ?? 0).toLocaleString()}đ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1">Dự kiến phí VC</span>
                    <span className="text-sm font-semibold text-slate-600">{(donBanHang.phiVanChuyen ?? 0).toLocaleString()}đ</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1"><Calculator className="h-3.5 w-3.5" />Tổng báo giá</span>
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
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <p className="font-semibold text-slate-900">Sản phẩm báo giá</p>
                <span className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {chiTiet.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Mặt hàng</th>
                      <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Số lượng</th>
                      <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Đơn giá</th>
                      <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chiTiet.map((item) => (
                      <tr key={item.id} className="transition-colors duration-150 hover:bg-yellow-50/50">
                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-semibold text-slate-900 text-xs uppercase tracking-wide">{item.tenSanPham}</span>
                          <span className="block font-mono text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Hash className="h-3 w-3" />{item.sku}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-middle text-center">
                          <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-slate-100 px-2 font-bold text-slate-900 ring-1 ring-slate-200 text-xs">
                            {item.soLuongDat}
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

          </div>
        </div>
      </div>

      {/* Modal Nhập lý do từ chối */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" /> Từ chối báo giá
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <p className="text-sm text-slate-500">Vui lòng ghi rõ lý do khách hàng không chấp nhận báo giá này để lưu trữ lịch sử.</p>
                <Textarea 
                    placeholder="Khách hàng chê giá đắt / Hàng không đúng yêu cầu..." 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    className="resize-none"
                />
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => setShowRejectModal(false)}
              className="h-10 px-4 font-semibold text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200"
            >
              Hủy bỏ
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={rejectLoading}
              className="h-10 px-4 font-bold bg-red-600 text-white hover:bg-red-700 border border-red-600 shadow-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
            >
              {rejectLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...</>
              ) : (
                "Xác nhận từ chối"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}