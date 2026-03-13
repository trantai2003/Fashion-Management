import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { toast } from "sonner";

// Giữ nguyên bộ STATUS_MAP từ snippet mới nhất của bạn
const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đã duyệt", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Đã xuất", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
    5: { label: "Đã xuất", className: "bg-green-50 text-green-700" },
};

export default function PhieuXuatKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Lấy thông tin từ localStorage
    const role = localStorage.getItem("role");
    const currentWarehouseId = Number(localStorage.getItem("warehouseId"));

    // Xác định quyền đặc biệt
    const isAdmin = role === "quan_tri_vien";
    const isQuanLy = role === "quan_ly_kho" || isAdmin;

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuXuatKhoService.getDetail(id);
            // Bóc tách dữ liệu nếu bị bọc bởi ResponseData
            setData(res?.data || res);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải chi tiết phiếu xuất");
        } finally {
            setLoading(false);
        }
    }

    // Hàm xử lý chung cho Gửi duyệt và Phê duyệt
    async function handleStatusChange(actionFn, successMsg) {
        setIsProcessing(true);
        try {
            await actionFn(id);
            toast.success(successMsg);
            fetchDetail(); // Load lại dữ liệu
        } catch (e) {
            toast.error(e?.response?.data?.message || "Thao tác thất bại");
        } finally {
            setIsProcessing(false);
        }
    }

    // Hàm xử lý khi xác nhận Hoàn thành/Vận chuyển
    // Hàm xử lý khi xác nhận Hoàn thành/Vận chuyển
    const handleConfirmComplete = async () => {
        setIsProcessing(true);
        try {
            await phieuXuatKhoService.complete(phieu.id);
            
            if (isChuyenKho) {
                toast.success("Xác nhận xuất kho và bắt đầu vận chuyển thành công");
            } else {
                toast.success("Hoàn thành phiếu xuất bán hàng thành công");
            }
            navigate("/goods-issues");
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể thực hiện thao tác");
        } finally {
            setIsProcessing(false);
            setShowConfirm(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="p-10 text-center text-sm text-gray-500">
                Loading...
            </div>
        );
    }

    const { phieu, chiTiet } = data;

    // Kiểm tra loại phiếu
    const isChuyenKho = phieu.loaiXuat === "chuyen_kho";

    // Kiểm tra xem tất cả mặt hàng đã bốc đủ lô chưa
    const isAllPicked = Array.isArray(chiTiet)
        && chiTiet.length > 0
        && chiTiet.every(ct => ct.duSoLuong === true);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
                    {/* LEFT */}
                    <button
                        onClick={() => navigate("/goods-issues")}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                        ← Quay lại
                    </button>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 text-xs rounded font-medium ${STATUS_MAP[phieu.trangThai]?.className}`}
                        >
                            {STATUS_MAP[phieu.trangThai]?.label}
                        </span>

                        {/* Nút Hủy: Hiện cho các trạng thái chưa hoàn thành/hủy */}
                        {[0, 1, 2].includes(phieu.trangThai) && (
                            <button
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Huỷ phiếu xuất
                            </button>
                        )}

                        {/* NÚT IN PHIẾU */}
                        {phieu.trangThai !== 4 && (
                            <button
                                onClick={() => navigate(`/goods-issues/${phieu.id}/print`)}
                                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                    <rect x="6" y="14" width="12" height="8"></rect>
                                </svg>
                                In phiếu
                            </button>
                        )}

                        {/* Nút Hoàn thành/Vận chuyển: Luôn hiển thị ở trạng thái 0 (Nháp) */}
                        {phieu.trangThai === 0 && (
                            <button
                                disabled={isProcessing || !isAllPicked}
                                onClick={() => setShowConfirm(true)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold text-white shadow-sm
                                    ${isAllPicked && !isProcessing
                                        ? (isChuyenKho ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700")
                                        : "bg-gray-300 cursor-not-allowed"}`}
                            >
                                {isChuyenKho ? "Xác nhận vận chuyển →" : "Hoàn thành xuất kho"}
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                    {/* THÔNG TIN CHUNG */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4 text-gray-900 uppercase tracking-wider">
                            Thông tin phiếu xuất
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <Info label="Số phiếu" value={phieu.soPhieuXuat} />

                            <Info
                                label="Loại xuất"
                                value={isChuyenKho ? "Chuyển kho nội bộ" : "Xuất bán hàng"}
                            />

                            {isChuyenKho ? (
                                <Info label="Kho chuyển đến" value={phieu.khoChuyenDen?.tenKho} />
                            ) : (
                                <Info label="Đơn bán hàng" value={phieu.donBanHang?.soDonHang} />
                            )}

                            <Info label="Kho xuất hàng" value={phieu.kho?.tenKho} />

                            <Info
                                label="Ngày tạo phiếu"
                                value={new Date(phieu.ngayTao).toLocaleDateString("vi-VN")}
                            />

                            <Info
                                label="Ngày xuất"
                                value={phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString("vi-VN") : "Chưa xuất kho"}
                            />

                            <Info
                                label="Người xuất"
                                value={phieu.nguoiXuat?.hoTen || "---"}
                            />

                            {phieu.ghiChu && (
                                <div className="md:col-span-3">
                                    <Info label="Ghi chú" value={phieu.ghiChu} />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* DANH SÁCH SẢN PHẨM */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-sm font-bold text-gray-800">Danh sách sản phẩm</h2>
                            {isChuyenKho && phieu.trangThai === 0 && !isAllPicked && (
                                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                                    CẦN BỐC LÔ TRƯỚC KHI XUẤT HÀNG
                                </span>
                            )}
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 text-left">SKU / Biến thể</th>
                                    <th className="px-4 py-3 text-center">SL yêu cầu</th>
                                    <th className="px-4 py-3 text-center">SL đã pick</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-center">Hành động</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {chiTiet.map((ct) => {
                                    const canEditLot = phieu.trangThai === 0;

                                    return (
                                        <tr key={ct.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-800">{ct.sku}</div>
                                                <div className="text-[11px] text-gray-500">{ct.tenBienThe}</div>
                                            </td>

                                            <td className="px-4 py-3 text-center font-semibold text-gray-700">
                                                {ct.soLuongCanXuat}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span className={ct.duSoLuong ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                                                    {ct.soLuongDaPick} / {ct.soLuongCanXuat}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                {ct.duSoLuong ? (
                                                    <span className="px-2 py-1 text-[10px] rounded bg-green-50 text-green-700 font-bold">Đủ hàng</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-[10px] rounded bg-red-50 text-red-700 font-bold">Chưa đủ</span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/goods-issues/${phieu.id}/pick-lot/${ct.id}`,
                                                            {
                                                                state: {
                                                                    bienTheSanPhamId: ct.bienTheSanPhamId,
                                                                    sku: ct.sku,
                                                                    tenBienThe: ct.tenBienThe,
                                                                    soLuongXuat: ct.soLuongCanXuat,
                                                                    soLuongDaPick: ct.soLuongDaPick,
                                                                    phieuTrangThai: phieu.trangThai,
                                                                    loaiXuat: phieu.loaiXuat
                                                                },
                                                            }
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-md shadow-sm transition-all
                                                        ${canEditLot
                                                            ? "bg-purple-600 text-white hover:bg-purple-700"
                                                            : "bg-blue-600 text-white hover:bg-blue-700"}`}
                                                >
                                                    {canEditLot ? "Pick lot →" : "Xem lô →"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== MODAL: XÁC NHẬN HOÀN TẤT / VẬN CHUYỂN ===== */}
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
                            <h2 className="text-lg font-bold mb-2 text-gray-900">
                                {isChuyenKho ? "Xác nhận vận chuyển" : "Xác nhận xuất kho"}
                            </h2>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                {isChuyenKho
                                    ? `Hàng hóa trong phiếu ${phieu.soPhieuXuat} sẽ được trừ tồn tại kho hiện tại và đưa vào kho Trung Chuyển để bắt đầu vận chuyển.`
                                    : `Phiếu xuất kho ${phieu.soPhieuXuat} sẽ được hoàn thành và trừ tồn kho thực tế của các lô đã chọn.`}
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={handleConfirmComplete}
                                    className={`px-4 py-2 rounded-md text-white text-sm font-bold shadow-md
                                        ${isChuyenKho ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"}`}
                                >
                                    {isProcessing ? "Đang xử lý..." : "Xác nhận thực hiện"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== MODAL: XÁC NHẬN HỦY ===== */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận huỷ phiếu xuất</h2>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Bạn chắc chắn muốn huỷ phiếu <strong>{phieu.soPhieuXuat}</strong>? Mọi số lượng đã bốc (giữ hàng) sẽ được hoàn tồn. Thao tác này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={async () => {
                                        setIsProcessing(true);
                                        try {
                                            if (isChuyenKho) {
                                                await phieuChuyenKhoService.cancel(phieu.id);
                                            } else {
                                                await phieuXuatKhoService.cancel(phieu.id);
                                            }

                                            toast.success("Đã huỷ phiếu xuất thành công");
                                            navigate("/goods-issues");
                                        } catch (e) {
                                            toast.error(e?.response?.data?.message || "Không thể huỷ phiếu");
                                        } finally {
                                            setIsProcessing(false);
                                            setShowCancelConfirm(false);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md"
                                >
                                    {isProcessing ? "Đang xử lý..." : "Xác nhận huỷ"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Sub-component Helper
function Info({ label, value }) {
    return (
        <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">
                {label}
            </div>
            <div className="font-semibold text-gray-900 leading-tight">
                {value || "---"}
            </div>
        </div>
    );
}