import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService"; // Import thêm service chuyển kho
import { toast } from "sonner";

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

    const role = localStorage.getItem("role");
    const isQuanLy = role === "quan_ly_kho" || role === "quan_tri_vien";

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuXuatKhoService.getDetail(id);
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

    // Hàm xử lý khi xác nhận Hoàn thành/Vận chuyển (Rẽ nhánh tại đây)
    const handleConfirmComplete = async () => {
        setIsProcessing(true);
        try {
            if (phieu.loaiXuat === "chuyen_kho") {
                // Nếu là phiếu chuyển kho -> Gọi API bắt đầu vận chuyển
                await phieuChuyenKhoService.startShipping(phieu.id);
                toast.success("Xác nhận xuất kho và bắt đầu vận chuyển thành công");
            } else {
                // Nếu là phiếu bán hàng -> Gọi API hoàn thành xuất kho cũ
                await phieuXuatKhoService.complete(phieu.id);
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
    const isAllPicked = Array.isArray(chiTiet)
        && chiTiet.length > 0
        && chiTiet.every(ct => ct.duSoLuong === true);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    {/* LEFT */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
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

                        {/* Cancel Button */}
                        {[0, 1, 2].includes(phieu.trangThai) && (
                            <button
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Huỷ phiếu xuất
                            </button>
                        )}

                        {/* 1. Nút Gửi duyệt (Chỉ hiện ở trạng thái Nháp - 0) */}
                        {phieu.trangThai === 0 && (
                            <button
                                disabled={!isAllPicked || isProcessing}
                                onClick={() => handleStatusChange(phieuXuatKhoService.submit, "Đã gửi duyệt phiếu xuất")}
                                className={`
                                    px-4 py-2 rounded-md text-sm font-semibold
                                    ${isAllPicked && !isProcessing
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-300 text-white cursor-not-allowed"}
                                `}
                            >
                                Gửi duyệt
                            </button>
                        )}

                        {/* 2. Nút Phê duyệt (Chỉ hiện ở trạng thái Chờ duyệt - 1) */}
                        {phieu.trangThai === 1 && isQuanLy && (
                            <button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange(phieuXuatKhoService.approve, "Đã phê duyệt phiếu xuất")}
                                className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Phê duyệt
                            </button>
                        )}

                        {/* 3. Nút Hoàn thành (Chỉ hiện ở trạng thái Đã duyệt - 2) */}
                        {phieu.trangThai === 2 && (
                            <button
                                disabled={isProcessing}
                                onClick={() => setShowConfirm(true)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold text-white 
                                    ${phieu.loaiXuat === 'chuyen_kho' ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"}`}
                            >
                                {phieu.loaiXuat === "chuyen_kho" ? "Xác nhận vận chuyển →" : "Hoàn thành xuất kho"}
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                    {/* INFO */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4 text-gray-900">
                            Thông tin phiếu xuất
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <Info label="Số phiếu" value={phieu.soPhieuXuat} />
                            <Info
                                label="Loại xuất"
                                value={
                                    phieu.loaiXuat === "ban_hang"
                                        ? "Xuất bán hàng"
                                        : "Chuyển kho nội bộ"
                                }
                            />
                            {phieu.loaiXuat === "ban_hang" ? (
                                <Info label="Sales Order" value={phieu.donBanHang?.soDonHang} />
                            ) : (
                                <Info label="Kho chuyển đến" value={phieu.khoChuyenDen?.tenKho} />
                            )}
                            <Info label="Kho xuất" value={phieu.kho?.tenKho} />
                            <Info
                                label="Ngày lập"
                                value={new Date(phieu.ngayTao).toLocaleDateString("vi-VN")}
                            />
                            <Info
                                label="Người phụ trách"
                                value={phieu.nguoiXuat?.hoTen || "---"}
                            />
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                            <h2 className="text-sm font-semibold">Danh sách sản phẩm</h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium uppercase">SKU</th>
                                    <th className="px-4 py-3 text-left font-medium uppercase">Biến thể</th>
                                    <th className="px-4 py-3 text-center font-medium uppercase">SL yêu cầu</th>
                                    <th className="px-4 py-3 text-center font-medium uppercase">SL đã pick</th>
                                    <th className="px-4 py-3 text-center font-medium uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-center font-medium uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {chiTiet.map((ct) => (
                                    <tr key={ct.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-semibold text-gray-700">{ct.sku}</td>
                                        <td className="px-4 py-3 text-gray-600">{ct.tenBienThe}</td>
                                        <td className="px-4 py-3 text-center font-medium">{ct.soLuongCanXuat}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={ct.duSoLuong ? "text-green-600 font-bold" : "text-amber-600"}>
                                                {ct.soLuongDaPick} / {ct.soLuongCanXuat}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {ct.duSoLuong ? (
                                                <span className="px-2 py-1 text-[10px] rounded bg-green-50 text-green-700">Đủ hàng</span>
                                            ) : (
                                                <span className="px-2 py-1 text-[10px] rounded bg-red-50 text-red-700">Chưa đủ</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                disabled={phieu.trangThai >= 3}
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
                                                            },
                                                        }
                                                    )
                                                }
                                                className={`text-xs font-bold transition-colors ${phieu.trangThai === 0 ? "text-purple-600 hover:text-purple-800" : "text-blue-600 hover:text-blue-800"}`}
                                            >
                                                {phieu.trangThai === 0 ? "Pick lot →" : "Xem lô →"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== CONFIRM ACTION MODAL (XÁC NHẬN HOÀN TẤT) ===== */}
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                            <h2 className="text-lg font-bold mb-2">
                                {phieu.loaiXuat === "chuyen_kho" ? "Xác nhận vận chuyển" : "Xác nhận xuất kho"}
                            </h2>
                            <p className="text-sm text-gray-600 mb-6">
                                {phieu.loaiXuat === "chuyen_kho" 
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
                                    className={`px-4 py-2 rounded-md text-white text-sm font-bold ${phieu.loaiXuat === 'chuyen_kho' ? "bg-purple-600 hover:bg-purple-700" : "bg-green-600 hover:bg-green-700"}`}
                                >
                                    {isProcessing ? "Đang xử lý..." : "Xác nhận"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CONFIRM CANCEL MODAL ===== */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">Xác nhận huỷ phiếu</h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Bạn chắc chắn muốn huỷ phiếu xuất kho <strong>{phieu.soPhieuXuat}</strong>? Thao tác này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={async () => {
                                        setIsProcessing(true);
                                        try {
                                            if (phieu.loaiXuat === "chuyen_kho") {
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
                                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-bold hover:bg-red-700"
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

function Info({ label, value }) {
    return (
        <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">{label}</div>
            <div className="font-semibold text-gray-900">{value || "---"}</div>
        </div>
    );
}