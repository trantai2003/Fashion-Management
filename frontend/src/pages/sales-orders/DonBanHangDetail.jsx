import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";
import {
    ArrowLeft,
    Loader2,
    FileText,
    User,
    Home,
    Truck,
    Calculator,
    Clock,
    CheckCircle2,
    Package,
    Calendar,
    Send,
    XCircle,
    Receipt,
    Hash,
    MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700 ring-amber-200" },
    1: { label: "Chờ xuất kho", className: "bg-blue-50 text-blue-700 ring-blue-200" },
    2: { label: "Đang xuất kho", className: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
    3: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    4: { label: "Đã hủy", className: "bg-red-50 text-red-700 ring-red-200" },
};

export default function DonBanHangDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await donBanHangService.getDetail(id);
            setData(res.data);
        } catch (err) {
            toast.error("Không tải được chi tiết đơn bán");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function handleSendToWarehouse() {
        try {
            setLoading(true);
            await donBanHangService.sendToWarehouse(id);
            toast.success("Đã gửi đơn sang kho");
            fetchDetail();
        } catch {
            toast.error("Không thể gửi đơn");
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        try {
            setLoading(true);
            await donBanHangService.cancel(id);
            toast.success("Đã hủy đơn bán");
            fetchDetail();
        } catch {
            toast.error("Không thể hủy đơn");
        } finally {
            setLoading(false);
        }
    }

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                <p className="text-slate-500 font-medium">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (!data) return null;

    const { donBanHang, chiTiet, phieuXuatKhoList } = data;

    return (
        <div className="p-4 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/20 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate("/sales-orders")}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors duration-150 group mb-2"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Quay lại danh danh sách
                        </button>

                    </div>

                    <div className="flex items-center gap-2">
                        {donBanHang.trangThai === 0 && (
                            <Button
                                onClick={handleSendToWarehouse}
                                disabled={loading}
                                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold px-6 h-11"
                            >
                                <Send className="mr-2 h-4 w-4" /> Gửi sang kho
                            </Button>
                        )}

                        {donBanHang.trangThai !== 3 && donBanHang.trangThai !== 4 && (
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                                className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm transition-all duration-200 font-bold h-11"
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Hủy đơn
                            </Button>
                        )}

                        {donBanHang.trangThai === 3 && (
                            <Button
                                onClick={() => navigate(`/sales-orders/${id}/invoice`)}
                                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold px-6 h-11"
                            >
                                <Receipt className="mr-2 h-4 w-4" /> Xem hóa đơn
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Essential Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/80 overflow-hidden border-0">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600 shadow-inner">
                                    <FileText className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 leading-snug">Chi tiết đơn hàng</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Mã: {donBanHang.soDonHang}</p>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trạng thái hiện tại</span>
                                        <div className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1 ring-inset ${STATUS_MAP[donBanHang.trangThai]?.className}`}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                                            {STATUS_MAP[donBanHang.trangThai]?.label?.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 px-2">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-1.5 rounded-lg bg-blue-50 text-blue-600">
                                                <User className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Khách hàng yêu cầu</p>
                                                <p className="text-[15px] font-bold text-slate-800 truncate">{donBanHang.khachHang?.tenKhachHang}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-1.5 rounded-lg bg-orange-50 text-orange-600">
                                                <Home className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Địa điểm xuất kho</p>
                                                <p className="text-[15px] font-bold text-slate-800">{donBanHang.khoXuat?.tenKho || "Chưa xác định"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                                                <Calendar className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Thời gian lập đơn</p>
                                                <p className="text-[15px] font-bold text-slate-800">{new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN", { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-1.5 rounded-lg bg-red-50 text-red-600">
                                                <MapPin className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Địa chỉ nhận hàng</p>
                                                <p className="text-[13px] font-medium text-slate-600 leading-relaxed">{donBanHang.diaChiGiaoHang || "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Tạm tính:</span>
                                        <span className="text-sm font-bold text-slate-600">{(donBanHang.tongCong ?? 0).toLocaleString()}đ</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="h-5 w-5 text-slate-900" />
                                            <span className="text-xs font-black text-slate-900 uppercase">Tổng cộng</span>
                                        </div>
                                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                                            {(donBanHang.tongCong ?? 0).toLocaleString()}đ
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Dynamic Tables */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Table Items */}
                        <Card className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/80 overflow-hidden border-0">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
                                    <Package className="h-4.5 w-4.5" />
                                </div>
                                <p className="font-bold text-slate-900">Danh mục sản phẩm</p>
                                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">{chiTiet.length}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/30">
                                            <th className="h-10 px-6 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-left">Thông tin SKU</th>
                                            <th className="h-10 px-4 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-right">Lượng đặt</th>
                                            <th className="h-10 px-4 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-right">Đã giao</th>
                                            <th className="h-10 px-4 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-right">Giá niêm yết</th>
                                            <th className="h-10 px-6 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-right">Tạm tính</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {chiTiet.map((item) => (
                                            <tr key={item.id} className="transition-all hover:bg-slate-50 group">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-800 group-hover:text-purple-600 transition-colors uppercase text-xs tracking-wide">{item.tenSanPham}</div>
                                                    <div className="text-[10px] font-black text-slate-400 mt-1 flex items-center gap-1.5">
                                                        <Hash className="h-3 w-3" /> {item.sku}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-lg bg-slate-50 px-2 font-black text-slate-900 ring-1 ring-slate-200">
                                                        {item.soLuongDat}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5 text-right">
                                                    <div className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-bold transition-all ${item.soLuongDaGiao >= item.soLuongDat ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-50 text-slate-400 ring-1 ring-slate-200"}`}>
                                                        {item.soLuongDaGiao >= item.soLuongDat && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                        {item.soLuongDaGiao}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-right font-medium text-slate-500 italic">
                                                    {item.donGia.toLocaleString()}đ
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <span className="font-black text-slate-900 group-hover:text-purple-600 text-base tabular-nums">
                                                        {item.thanhTien.toLocaleString()}đ
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* History Goods Issues */}
                        {phieuXuatKhoList && phieuXuatKhoList.length > 0 && (
                            <Card className="rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/80 overflow-hidden border-0">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-inner">
                                        <Clock className="h-4.5 w-4.5" />
                                    </div>
                                    <p className="font-bold text-slate-900">Lịch sử xuất hàng</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/30">
                                                <th className="h-10 px-6 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-left">Số hiệu phiếu</th>
                                                <th className="h-10 px-4 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-left">Ngày giải ngân</th>
                                                <th className="h-10 px-4 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-left">Trạng thái</th>
                                                <th className="h-10 px-6 font-bold text-slate-500 tracking-widest text-[10px] uppercase text-left">Ghi chú vận hành</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {phieuXuatKhoList.map((px) => (
                                                <tr
                                                    key={px.id}
                                                    onClick={() => navigate(`/goods-issues/${px.id}/view`)}
                                                    className="group cursor-pointer hover:bg-indigo-50/30 transition-all"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 group-hover:scale-150 transition-all"></div>
                                                            <span className="font-black text-slate-900 group-hover:text-indigo-600">
                                                                {px.soPhieuXuat}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5 text-slate-600 font-medium">
                                                        {new Date(px.ngayXuat).toLocaleDateString("vi-VN")}
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-inset ${STATUS_MAP[px.trangThai]?.className}`}>
                                                            {STATUS_MAP[px.trangThai]?.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-slate-400 text-xs italic">
                                                        {px.ghiChu || "Không có ghi chú"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}