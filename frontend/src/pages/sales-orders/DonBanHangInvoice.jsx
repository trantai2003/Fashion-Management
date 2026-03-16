import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DonBanHangInvoice() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchDetail(); }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await donBanHangService.getDetail(id);
            setData(res.data);
        } catch { toast.error("Không tải được hóa đơn"); }
        finally { setLoading(false); }
    }

    if (loading || !data) {
        return (
            <div className="lux-sync warehouse-unified p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center print:hidden">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-600">Đang tải hóa đơn...</span>
                </div>
            </div>
        );
    }

    const { donBanHang, chiTiet } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-8 print:bg-white print:py-0">

            {/* ── Navbar (chỉ hiện trên màn hình) ── */}
            <div className="max-w-4xl mx-auto mb-6 px-6 print:hidden">
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 px-6 py-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </button>
                    <Button
                        onClick={() => window.print()}
                        className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        In / Xuất PDF
                    </Button>
                </div>
            </div>

            {/* ── Vùng in ── */}
            <div id="invoice-area" className="max-w-4xl mx-auto bg-white p-10 shadow border print:border-none print:shadow-none print:p-0">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold">HÓA ĐƠN BÁN HÀNG</h1>
                    <p className="text-sm text-gray-500 mt-1">Mã đơn: {donBanHang.soDonHang}</p>
                    <p className="text-sm text-gray-500">
                        Ngày: {new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN")}
                    </p>
                </div>

                {/* Bên bán / bên mua */}
                <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                    <div>
                        <p className="font-semibold">Bên bán</p>
                        <p>Fashion Company</p>
                        <p>Địa chỉ: Hà Nội</p>
                        <p>Email: contact@fashion.vn</p>
                    </div>
                    <div>
                        <p className="font-semibold">Bên mua</p>
                        <p>{donBanHang.khachHang.tenKhachHang}</p>
                        <p>{donBanHang.khachHang.diaChi}</p>
                        <p>{donBanHang.khachHang.email}</p>
                    </div>
                </div>

                {/* Bảng sản phẩm */}
                <table className="w-full text-sm border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-3 py-2 text-left">SKU</th>
                            <th className="border px-3 py-2 text-left">Sản phẩm</th>
                            <th className="border px-3 py-2 text-right">SL</th>
                            <th className="border px-3 py-2 text-right">Đơn giá</th>
                            <th className="border px-3 py-2 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chiTiet.map((item) => (
                            <tr key={item.id}>
                                <td className="border px-3 py-2">{item.sku}</td>
                                <td className="border px-3 py-2">{item.tenSanPham}</td>
                                <td className="border px-3 py-2 text-right">{item.soLuongDat}</td>
                                <td className="border px-3 py-2 text-right">{item.donGia.toLocaleString()}</td>
                                <td className="border px-3 py-2 text-right font-semibold">{item.thanhTien.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Tổng */}
                <div className="mt-6 text-right">
                    <p className="text-sm">Tiền hàng: {donBanHang.tienHang.toLocaleString()} đ</p>
                    <p className="text-sm">Phí vận chuyển: {donBanHang.phiVanChuyen.toLocaleString()} đ</p>
                    <p className="text-lg font-bold mt-2">Tổng cộng: {donBanHang.tongCong.toLocaleString()} đ</p>
                </div>

                {/* Chữ ký */}
                <div className="mt-16 text-sm grid grid-cols-2">
                    <div>
                        <p>Người lập</p>
                        <div className="h-16" />
                        <p>{donBanHang.nguoiTao?.hoTen}</p>
                    </div>
                    <div className="text-right">
                        <p>Đại diện khách hàng</p>
                        <div className="h-16" />
                        <p>(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}