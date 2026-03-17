import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Package, CheckCircle2, ClipboardList } from "lucide-react";

export default function PhieuXuatKhoPrint() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [allPickedLots, setAllPickedLots] = useState({});

    useEffect(() => {
        if (id) {
            fetchFullData();
        }
    }, [id]);

    async function fetchFullData() {
        setLoading(true);
        try {
            const res = await phieuXuatKhoService.getDetail(id);
            const detailData = res?.data || res;
            setData(detailData);

            if (detailData.chiTiet && detailData.chiTiet.length > 0) {
                const lp = detailData.chiTiet.map(item =>
                    phieuXuatKhoService.getPickedLots(id, item.id)
                );
                const results = await Promise.all(lp);
                const map = {};
                detailData.chiTiet.forEach((item, idx) => {
                    const lotsResult = results[idx]?.data || results[idx] || [];
                    map[item.id] = Array.isArray(lotsResult) ? lotsResult : [];
                });
                setAllPickedLots(map);
            }
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải dữ liệu in phiếu xuất");
        } finally {
            setLoading(false);
        }
    }

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg font-semibold bg-[#faf8f3]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#b8860b]" />
                    <p className="text-[#a89f92] font-mono text-xs uppercase tracking-widest">Đang chuẩn bị bản in...</p>
                </div>
            </div>
        );
    }

    const { phieu, chiTiet } = data;
    const isChuyenKho = phieu?.loaiXuat === "chuyen_kho";
    const tongSoLuong = chiTiet?.reduce((acc, item) => acc + (item.soLuongDaPick || 0), 0) || 0;

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0 font-sans">
            {/* NAVBAR */}
            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center px-4 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium transition-colors"
                >
                    <ArrowLeft size={16} /> Quay lại chi tiết phiếu
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-[#b8860b] text-white rounded-lg font-semibold hover:bg-[#a0750a] transition shadow-lg"
                >
                    <Printer size={16} /> In phiếu xuất kho
                </button>
            </div>

            {/* PRINT AREA */}
            <div id="invoice-area" className="max-w-5xl mx-auto bg-white p-12 shadow border print:border-none print:shadow-none print:p-0">
                {/* HEADER */}
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-[#1a1612]">
                            Phiếu Xuất Kho
                        </h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Mã phiếu: 
                            <span className="font-mono text-lg ml-2 font-bold text-[#b8860b]">
                                {phieu?.soPhieuXuat || "---"}
                            </span>
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                            Ngày xuất: {phieu?.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-[#b8860b] uppercase tracking-tighter">
                            Fashion Warehouse System
                        </h2>
                        <p className="text-sm text-gray-500 italic mt-0.5">
                            Hệ thống quản lý kho chuyên nghiệp
                        </p>
                    </div>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-2 gap-12 mb-10 text-sm">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Kho xuất hàng</p>
                            <p className="font-bold text-lg text-[#1a1612]">{phieu?.kho?.tenKho || "---"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Loại nghiệp vụ</p>
                            <p className="font-semibold text-gray-800">
                                {isChuyenKho ? "Chuyển kho nội bộ" : "Xuất bán hàng"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 text-right">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
                                {isChuyenKho ? "Kho nhận hàng" : "Đơn hàng tham chiếu"}
                            </p>
                            <p className="font-bold text-lg text-[#1a1612]">
                                {isChuyenKho 
                                    ? (phieu?.khoChuyenDen?.tenKho || "Nội bộ") 
                                    : (phieu?.donBanHang?.soDonHang || "---")}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
                                Thủ kho thực hiện
                            </p>
                            <p className="font-semibold text-gray-800">
                                {phieu?.nguoiXuat?.hoTen || "Nhân viên kho"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="mb-10">
                    <h3 className="text-xs font-bold uppercase mb-4 border-l-4 border-[#b8860b] pl-3 tracking-widest text-gray-600">
                        Danh sách hàng hóa xuất kho
                    </h3>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-[10px] uppercase border-y border-gray-200 tracking-wider">
                                <th className="p-3 text-left w-12">STT</th>
                                <th className="p-3 text-left">Sản phẩm / Biến thể</th>
                                <th className="p-3 text-left">Lô hàng xuất</th>
                                <th className="p-3 text-right w-24 whitespace-nowrap">Số lượng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {chiTiet?.map((item, idx) => {
                                const pickedLots = allPickedLots[item.id] || [];
                                return (
                                    <tr key={item.id} className="align-top hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-gray-400 font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-[#b8860b] font-mono text-xs mb-0.5">{item.sku}</div>
                                            <div className="text-sm font-semibold text-[#1a1612] leading-tight">{item.tenBienThe}</div>
                                        </td>
                                        <td className="p-4">
                                            {pickedLots.length > 0 ? (
                                                <div className="space-y-1.5">
                                                    {pickedLots.map((lo, lIdx) => (
                                                        <div key={lIdx} className="flex justify-between items-center text-[11px] bg-[#faf8f3] px-3 py-1.5 rounded border border-[#b8860b]/10">
                                                            <span className="font-bold text-[#b8860b] font-mono">{lo.maLo || lo.loHang?.maLo}</span>
                                                            <span className="font-black text-[#1a1612]">{lo.soLuongDaPick || lo.soLuongXuat}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-red-400 text-xs italic opacity-70">Chưa xác định lô hàng</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-bold text-lg text-[#1a1612]">{item.soLuongDaPick || 0}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-[#faf8f3] font-bold border-t-2 border-gray-900">
                                <td colSpan={3} className="p-5 text-right text-[10px] uppercase tracking-[0.3em] text-gray-500">
                                    Tổng số lượng xuất kho
                                </td>
                                <td className="p-5 text-right text-[#b8860b] text-2xl font-black">
                                    {tongSoLuong}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* SIGNATURE */}
                <div className="mt-16 grid grid-cols-2 gap-8 text-center text-xs tracking-wide">
                    <div>
                        <p className="font-bold uppercase mb-20 text-gray-800">Người lập phiếu</p>
                        <p className="font-bold text-[#1a1612]">{phieu?.nguoiXuat?.hoTen || phieu?.nguoiTao?.hoTen || "---"}</p>
                        <p className="text-[10px] text-gray-400 italic mt-1">(Ký và ghi rõ họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold uppercase mb-20 text-gray-800">Người nhận hàng</p>
                        <div className="h-[60px]"></div>
                        <p className="text-[10px] text-gray-400 italic mt-1">(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>

                {/* FOOTER NOTE */}
                <div className="mt-20 pt-8 border-t border-gray-100 text-center text-[9px] text-gray-400 uppercase tracking-[0.4em]">
                    Internal Document · Fashion Warehouse Management · Luxury Premium
                </div>
            </div>
        </div>
    );
}