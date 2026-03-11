import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { toast } from "sonner";

// Cập nhật lại Map trạng thái để phù hợp với luồng không duyệt
const STATUS_MAP = {
    0: { label: "Đang kiểm đếm", className: "bg-amber-50 text-amber-700" },
    1: { label: "Đang kiểm đếm", className: "bg-amber-50 text-amber-700" },
    2: { label: "Chờ nhận hàng", className: "bg-blue-50 text-blue-700" }, // Dành cho luồng Chuyển kho
    3: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Chỉ giữ lại Modal cần thiết
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuNhapKhoService.getDetail(id);
            setData(res);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải chi tiết phiếu nhập");
        } finally {
            setLoading(false);
        }
    }

    if (loading || !data) {
        return <div className="p-10 text-center text-sm text-gray-500">Loading...</div>;
    }

    const isAllDuLo = data.items.every(item => item.daDuLo === true);
    const isInternalTransfer = data.soPhieuNhap?.startsWith("PN-TRF-") || !data.soDonMua;

    // Hàm xử lý chung
    const handleAction = async (actionFn, successMsg) => {
        setIsProcessing(true);
        try {
            await actionFn(id);
            toast.success(successMsg);
            setShowCompleteConfirm(false);
            setShowCancelConfirm(false);
            fetchDetail();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Thao tác thất bại");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
                    <button
                        onClick={() => navigate("/goods-receipts")}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                        ← Quay lại
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs rounded font-medium ${STATUS_MAP[data.trangThai]?.className}`}>
                            {STATUS_MAP[data.trangThai]?.label}
                        </span>

                        {data.trangThai !== 4 && (
                            <button
                                onClick={() => navigate(`/goods-receipts/${id}/print`)}
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

                        {/* Nút Hủy: Hiện cho phiếu chưa hoàn thành */}
                        {data.trangThai < 3 && (
                            <button
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Huỷ phiếu
                            </button>
                        )}

                        {/* LOGIC NÚT XÁC NHẬN MỚI */}
                        {((!isInternalTransfer && data.trangThai === 0) || (isInternalTransfer && data.trangThai === 2)) && (
                            <button
                                disabled={!isAllDuLo || isProcessing}
                                onClick={() => setShowCompleteConfirm(true)}
                                className={`px-4 py-2 rounded-md text-sm font-bold text-white shadow-sm transition-all
                                    ${isAllDuLo && !isProcessing
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-gray-300 cursor-not-allowed"}`}
                            >
                                {isInternalTransfer ? "Xác nhận nhận hàng →" : "Xác nhận nhập kho thực tế"}
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                    {/* INFO SECTION */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Thông tin chi tiết</h2>
                            {!isAllDuLo && data.trangThai === 0 && (
                                <span className="text-[10px] text-amber-600 font-bold animate-pulse">
                                    ⚠️ Cần khai báo đủ lô hàng để nhập kho
                                </span>
                            )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <Info label="Số phiếu" value={data.soPhieuNhap} />
                            <Info label="Kho nhập hàng" value={data.tenKho} />
                            <Info label="Loại nghiệp vụ" value={isInternalTransfer ? "Chuyển kho nội bộ" : "Nhập từ nhà cung cấp (PO)"} />
                            {!isInternalTransfer && <Info label="Đơn mua hàng" value={data.soDonMua} />}
                            {!isInternalTransfer && <Info label="Nhà cung cấp" value={data.tenNhaCungCap} />}
                            <Info label="Người nhập thực tế" value={data.tenNguoiNhap || "---"} />
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-4 font-bold">Sản phẩm / Biến thể</th>
                                    <th className="px-4 py-4 text-center">SL yêu cầu</th>
                                    <th className="px-4 py-4 text-center">SL kiểm thực tế</th>
                                    <th className="px-4 py-4 text-center">Trạng thái</th>
                                    <th className="px-4 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.items.map((item) => (
                                    <tr key={item.bienTheSanPhamId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-900">{item.sku}</div>
                                            <div className="text-gray-500 text-xs">{item.tenBienThe}</div>
                                        </td>
                                        <td className="px-4 py-4 text-center font-medium">{item.soLuongCanNhap}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`font-bold ${item.daDuLo ? "text-green-600" : "text-amber-600"}`}>
                                                {item.soLuongDaKhaiBao ?? 0} / {item.soLuongCanNhap}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {item.daDuLo ? (
                                                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Đã đủ</span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Thiếu lô</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/goods-receipts/${data.id}/lot-input/${item.bienTheSanPhamId}`)}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm
                                                    ${data.trangThai === 0
                                                        ? "bg-purple-600 text-white hover:bg-purple-700"
                                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                            >
                                                {data.trangThai === 0 ? "Khai báo lô →" : "Xem lô"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== MODAL: XÁC NHẬN HOÀN TẤT ===== */}
                {showCompleteConfirm && (
                    <ConfirmModal
                        title={isInternalTransfer ? "Xác nhận nhận hàng" : "Hoàn tất nhập kho"}
                        content={isInternalTransfer
                            ? "Xác nhận hàng đã về kho an toàn. Tồn kho sẽ được cộng vào kho của bạn."
                            : `Hệ thống sẽ ghi nhận nhập ${data.items.reduce((acc, i) => acc + i.soLuongDaKhaiBao, 0)} sản phẩm vào kho thực tế.`}
                        onClose={() => setShowCompleteConfirm(false)}
                        onConfirm={() => handleAction(
                            isInternalTransfer ? phieuChuyenKhoService.completeReceipt : phieuNhapKhoService.complete,
                            "Nhập kho thành công"
                        )}
                        confirmClass="bg-green-600 hover:bg-green-700"
                        isLoading={isProcessing}
                    />
                )}

                {/* ===== MODAL: HỦY PHIẾU ===== */}
                {showCancelConfirm && (
                    <ConfirmModal
                        title="Hủy phiếu nhập kho"
                        content="Thao tác này sẽ hủy phiếu và các lô hàng đã khai báo. Bạn có chắc chắn?"
                        onClose={() => setShowCancelConfirm(false)}
                        onConfirm={() => {
                            const targetId = isInternalTransfer ? data.phieuXuatGocId : id;
                            handleAction(
                                () => isInternalTransfer ? phieuChuyenKhoService.cancel(targetId) : phieuNhapKhoService.cancel(targetId),
                                "Đã hủy phiếu thành công"
                            ).then(() => navigate("/goods-receipts"));
                        }}
                        confirmClass="bg-red-600 hover:bg-red-700"
                        isLoading={isProcessing}
                    />
                )}
            </main>
        </div>
    );
}

// Reusable Components
function ConfirmModal({ title, content, onClose, onConfirm, confirmClass, isLoading }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[2px]">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold mb-2 text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">{content}</p>
                <div className="flex justify-end gap-3">
                    <button disabled={isLoading} onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition-colors">
                        Đóng
                    </button>
                    <button disabled={isLoading} onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all ${confirmClass}`}>
                        {isLoading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="space-y-1">
            <div className="text-[11px] text-gray-400 uppercase font-black tracking-widest">{label}</div>
            <div className="font-bold text-gray-900">{value || "---"}</div>
        </div>
    );
}