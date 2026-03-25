import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury & Print CSS
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.wh-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 28px 28px 56px;
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
}

.wh-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.wh-orb-1 {
  position: fixed; width: 500px; height: 500px; border-radius: 50%;
  background: rgba(184,134,11,0.07); filter: blur(100px);
  top: -180px; right: -120px; pointer-events: none; z-index: 0;
}

.wh-inner {
  position: relative; z-index: 1;
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

.wh-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1.5px solid rgba(184,134,11,0.15);
}

.btn-gold {
  height: 42px; padding: 0 20px; border-radius: 11px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(184,134,11,0.35);
}
.btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(184,134,11,0.48); }

/* ── Cấu hình In ── */
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 10mm 15mm 10mm;
  }
  body {
    margin: 0;
    padding: 0;
    background: white !important;
  }
  .wh-root {
    background: white !important;
    padding: 0 !important;
  }
  .wh-grid, .wh-orb-1, .wh-header {
    display: none !important;
  }
  .print-area {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  table { page-break-inside: auto; }
  tr { page-break-inside: avoid; page-break-after: auto; }
}
`;

export default function BaoGiaPrint() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchDetail(); }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await donBanHangService.getDetail(id);
            setData(res.data);
        } catch { toast.error("Không tải được dữ liệu báo giá"); }
        finally { setLoading(false); }
    }

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center print:hidden">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#b8860b]" />
                    <p className="text-[#a89f92] font-mono text-xs uppercase tracking-widest">Đang tải bản in...</p>
                </div>
            </div>
        );
    }

    const { donBanHang, chiTiet } = data;

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root print:bg-white print:p-0 print:overflow-visible print:h-auto print:max-h-none">
                <div className="wh-grid print:hidden" />
                <div className="wh-orb-1 print:hidden" />

                <div className="wh-inner print:block">
                    {/* ── Navbar (Chỉ hiện trên web) ── */}
                    <div className="wh-header print:hidden" style={{ justifyContent: "space-between" }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại chi tiết báo giá
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="btn-gold"
                        >
                            <Printer size={15} />
                            In / Lưu PDF
                        </button>
                    </div>

                    {/* ── Vùng in (Trang giấy) ── */}
                    <div id="invoice-area" className="print-area max-w-4xl mx-auto bg-white p-12 rounded-2xl border border-[rgba(184,134,11,0.15)] shadow-[0_2px_20px_rgba(100,80,30,0.05)] text-[#1a1612]">

                        {/* Header Báo Giá */}
                        <div className="mb-10 text-center relative">
                            <h1 className="text-3xl font-black font-['Playfair_Display'] text-[#1a1612] tracking-wide mb-2">BẢNG BÁO GIÁ</h1>
                            <p className="text-sm text-[#7a6e5f] font-mono uppercase tracking-wider">Số báo giá: <span className="text-[#b8860b] font-bold">{donBanHang.soDonHang}</span></p>
                            <p className="text-sm text-[#7a6e5f] mt-1">
                                Ngày lập: {new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN")}
                            </p>
                        </div>

                        {/* Bên bán / bên mua */}
                        <div className="grid grid-cols-2 gap-8 mb-10 text-[15px] leading-relaxed">
                            <div className="p-5 bg-[#faf8f3] rounded-xl border border-[rgba(184,134,11,0.1)]">
                                <p className="font-mono text-xs font-bold text-[#b8860b] uppercase tracking-widest mb-2">Đơn vị cung cấp</p>
                                <p className="font-bold text-lg mb-1">FashionFlow Company</p>
                                <p className="text-[#3d3529]">Địa chỉ: Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc, Hà Nội</p>
                                <p className="text-[#3d3529]">Email: contact@fashionflow.vn</p>
                            </div>
                            <div className="p-5 bg-[#faf8f3] rounded-xl border border-[rgba(184,134,11,0.1)]">
                                <p className="font-mono text-xs font-bold text-[#b8860b] uppercase tracking-widest mb-2">Khách hàng</p>
                                <p className="font-bold text-lg mb-1">{donBanHang.khachHang.tenKhachHang}</p>
                                <p className="text-[#3d3529]">{donBanHang.khachHang.diaChi}</p>
                                <p className="text-[#3d3529]">{donBanHang.khachHang.email}</p>
                                <p className="text-[#3d3529]">SĐT: {donBanHang.khachHang.soDienThoai}</p>
                            </div>
                        </div>

                        {/* Bảng sản phẩm */}
                        <div className="overflow-hidden rounded-xl border border-[#e5dfd3]">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#faf8f3] border-b border-[#e5dfd3]">
                                        <th className="px-4 py-3 font-mono text-xs font-bold text-[#7a6e5f] uppercase tracking-wider">SKU</th>
                                        <th className="px-4 py-3 font-mono text-xs font-bold text-[#7a6e5f] uppercase tracking-wider">Tên Mặt Hàng</th>
                                        <th className="px-4 py-3 font-mono text-xs font-bold text-[#7a6e5f] uppercase tracking-wider text-center">SL</th>
                                        <th className="px-4 py-3 font-mono text-xs font-bold text-[#7a6e5f] uppercase tracking-wider text-right">Đơn giá</th>
                                        <th className="px-4 py-3 font-mono text-xs font-bold text-[#7a6e5f] uppercase tracking-wider text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chiTiet.map((item, index) => (
                                        <tr key={item.id} className={index !== chiTiet.length - 1 ? "border-b border-[#f5f0e4]" : ""}>
                                            <td className="px-4 py-4 font-mono text-xs text-[#b8860b] font-semibold">{item.sku}</td>
                                            <td className="px-4 py-4 font-medium text-[#1a1612]">{item.tenSanPham}</td>
                                            <td className="px-4 py-4 text-center font-semibold">{item.soLuongDat}</td>
                                            <td className="px-4 py-4 text-right text-[#3d3529]">{item.donGia.toLocaleString()} đ</td>
                                            <td className="px-4 py-4 text-right font-bold text-[#1a1612]">{item.thanhTien.toLocaleString()} đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tổng */}
                        <div className="mt-8 flex justify-end">
                            <div className="w-1/2 rounded-xl p-5 bg-[#faf8f3] border border-[rgba(184,134,11,0.1)] space-y-2 text-[15px]">
                                <div className="flex justify-between text-[#7a6e5f]">
                                    <span>Tiền hàng:</span>
                                    <span className="font-semibold text-[#1a1612]">{donBanHang.tienHang.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between text-[#7a6e5f]">
                                    <span>Dự kiến phí vận chuyển:</span>
                                    <span className="font-semibold text-[#1a1612]">{donBanHang.phiVanChuyen.toLocaleString()} đ</span>
                                </div>
                                <div className="pt-3 mt-3 border-t border-[#e5dfd3] flex justify-between items-center">
                                    <span className="font-bold uppercase tracking-wider">Tổng giá trị:</span>
                                    <span className="text-xl font-bold text-[#b8860b]">{donBanHang.tongCong.toLocaleString()} đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Điều khoản & Ghi chú Báo Giá */}
                        <div className="mt-10 p-5 bg-[#faf8f3] rounded-xl border border-[rgba(184,134,11,0.1)] text-[14px]">
                            <p className="font-bold text-[#b8860b] uppercase tracking-wider mb-3">Ghi chú & Điều khoản áp dụng</p>
                            <ul className="list-disc pl-5 text-[#3d3529] space-y-1.5 leading-relaxed">
                                {donBanHang.ghiChu && <li><strong>Lưu ý chung:</strong> {donBanHang.ghiChu}</li>}
                                <li>Bảng báo giá này có giá trị hiệu lực trong vòng <strong>15 ngày</strong> kể từ ngày lập.</li>
                                <li>Giá trị thanh toán cuối cùng có thể thay đổi phụ thuộc vào phí vận chuyển thực tế tại thời điểm giao hàng.</li>
                                <li>Quý khách vui lòng kiểm tra kỹ thông tin chủng loại và số lượng sản phẩm trước khi xác nhận.</li>
                            </ul>
                        </div>

                        {/* Chữ ký */}
                        <div className="mt-10 pt-6 text-[15px] flex justify-end pr-16">
                            <div className="text-center">
                                <p className="font-bold uppercase tracking-wider mb-1">Người lập báo giá</p>
                                <p className="text-xs text-[#7a6e5f] italic">(Ký và ghi rõ họ tên)</p>
                                <div className="h-24" />
                                <p className="font-bold text-[#1a1612]">{donBanHang.nguoiTao?.hoTen || "---"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}