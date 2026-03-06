import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { toast } from "sonner";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đã duyệt", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Modal Confirm States
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [showSendApproveConfirm, setShowSendApproveConfirm] = useState(false);

    const role = localStorage.getItem("role");
    const isQuanLy = role === "quan_ly_kho" || role === "quan_tri_vien";

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

    /**
     * VALIDATE LUỒNG:
     * 1. Số phiếu bắt đầu bằng PN-TRF-
     * 2. Hoặc không có đơn mua hàng (soDonMua = null)
     */
    const isInternalTransfer = data.soPhieuNhap?.startsWith("PN-TRF-") || !data.soDonMua;

    // Xử lý các hành động
    const handleAction = async (actionFn, successMsg, closeModals) => {
        try {
            await actionFn(id);
            toast.success(successMsg);
            closeModals();
            fetchDetail();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Thao tác thất bại");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/goods-receipts")}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                    >
                        ← Quay lại
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs rounded font-medium ${STATUS_MAP[data.trangThai]?.className}`}>
                            {STATUS_MAP[data.trangThai]?.label}
                        </span>

                        {data.trangThai < 3 && (
                            <button
                                className="px-4 py-2 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Huỷ phiếu
                            </button>
                        )}

                        {data.trangThai === 0 && (
                            <button
                                disabled={!isAllDuLo}
                                onClick={() => setShowSendApproveConfirm(true)}
                                className={`px-4 py-2 rounded-md text-sm font-semibold text-white 
                                    ${isAllDuLo ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-300 cursor-not-allowed"}`}
                            >
                                Gửi duyệt
                            </button>
                        )}

                        {data.trangThai === 1 && isQuanLy && (
                            <button
                                onClick={() => setShowApproveConfirm(true)}
                                className="px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Phê duyệt
                            </button>
                        )}

                        {data.trangThai === 2 && (
                            <button
                                onClick={() => setShowCompleteConfirm(true)}
                                className="px-4 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700"
                            >
                                {isInternalTransfer ? "Xác nhận đã nhận hàng" : "Xác nhận nhập kho"}
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                    {/* INFO */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4 text-gray-800 tracking-wider">Thông tin phiếu nhập</h2>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <Info label="Số phiếu" value={data.soPhieuNhap} />
                            <Info label="Kho nhập hàng" value={data.tenKho} />

                            {isInternalTransfer ? (
                                <Info label="Loại nghiệp vụ" value="Chuyển kho nội bộ" />
                            ) : (
                                <>
                                    <Info label="Đơn mua hàng" value={data.soDonMua} />
                                    <Info label="Nhà cung cấp" value={data.tenNhaCungCap} />
                                </>
                            )}

                            <Info label="Người duyệt" value={data.tenNguoiDuyet} />
                            <Info label="Người nhập" value={data.tenNguoiNhap} />
                            <Info label="Ngày nhập phiếu" value={data.ngayNhap
                                ? new Date(data.ngayNhap).toLocaleDateString("vi-VN")
                                : "Chưa nhập kho"} />
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-sm font-semibold">Danh sách sản phẩm</h2>
                        </div>

                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-600">SKU / Biến thể</th>
                                    <th className="px-4 py-3 text-center">SL cần nhập</th>
                                    <th className="px-4 py-3 text-center">SL đã khai báo</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {data.items.map((item) => (
                                    <tr key={item.bienTheSanPhamId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-purple-700">{item.sku}</div>
                                            <div className="text-gray-500 text-xs">{item.tenBienThe}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium">{item.soLuongCanNhap}</td>
                                        <td className="px-4 py-3 text-center font-bold">
                                            {item.soLuongDaKhaiBao ?? 0} / {item.soLuongCanNhap}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.daDuLo ? (
                                                <span className="px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700">Đã đủ lô</span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700">Chưa đủ lô</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => navigate(`/goods-receipts/${data.id}/lot-input/${item.bienTheSanPhamId}`)}
                                                className="px-3 py-1.5 text-xs font-bold rounded shadow-sm bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                                            >
                                                {data.trangThai === 0 ? "Khai báo lô" : "Xem lô"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== MODAL: GỬI DUYỆT ===== */}
                {showSendApproveConfirm && (
                    <ConfirmModal
                        title="Xác nhận gửi duyệt"
                        content={`Bạn muốn gửi duyệt phiếu ${data.soPhieuNhap}?`}
                        onClose={() => setShowSendApproveConfirm(false)}
                        onConfirm={() => handleAction(phieuNhapKhoService.sendToApprove, "Đã gửi duyệt thành công", () => setShowSendApproveConfirm(false))}
                        confirmClass="bg-orange-500 hover:bg-orange-600"
                    />
                )}

                {/* ===== MODAL: PHÊ DUYỆT ===== */}
                {showApproveConfirm && (
                    <ConfirmModal
                        title="Phê duyệt phiếu nhập"
                        content={`Xác nhận phê duyệt phiếu ${data.soPhieuNhap}. Phiếu sẽ sẵn sàng để nhập kho.`}
                        onClose={() => setShowApproveConfirm(false)}
                        onConfirm={() => handleAction(phieuNhapKhoService.approve, "Phê duyệt thành công", () => setShowApproveConfirm(false))}
                        confirmClass="bg-blue-600 hover:bg-blue-700"
                    />
                )}

                {/* ===== MODAL: HOÀN TẤT ===== */}
                {showCompleteConfirm && (
                    <ConfirmModal
                        title={isInternalTransfer ? "Xác nhận nhận hàng chuyển kho" : "Xác nhận nhập kho thực tế"}
                        content={isInternalTransfer
                            ? "Hệ thống sẽ trừ tồn tại Kho Trung Chuyển và cộng vào kho của bạn."
                            : `Hoàn tất nhập kho cho phiếu ${data.soPhieuNhap}.`}
                        onClose={() => setShowCompleteConfirm(false)}
                        onConfirm={() => handleAction(
                            isInternalTransfer ? phieuChuyenKhoService.completeReceipt : phieuNhapKhoService.complete,
                            "Nhập kho thành công",
                            () => setShowCompleteConfirm(false)
                        )}
                        confirmClass="bg-green-600 hover:bg-green-700"
                    />
                )}

                {/* ===== MODAL: HỦY PHIẾU (RẼ NHÁNH TẠI ĐÂY) ===== */}
                {showCancelConfirm && (
                    <ConfirmModal
                        title="Xác nhận huỷ phiếu"
                        content={`Bạn chắc chắn muốn huỷ phiếu ${data.soPhieuNhap}? Thao tác này không thể hoàn tác.`}
                        onClose={() => setShowCancelConfirm(false)}
                        onConfirm={() => handleAction(
                            isInternalTransfer ? phieuChuyenKhoService.cancel : phieuNhapKhoService.cancel,
                            "Đã huỷ phiếu thành công",
                            () => setShowCancelConfirm(false)
                        )}
                        confirmClass="bg-red-600 hover:bg-red-700"
                    />
                )}
            </main>
        </div>
    );
}

// Sub-components
function ConfirmModal({ title, content, onClose, onConfirm, confirmClass }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <h2 className="text-lg font-bold mb-2 text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mb-6">{content}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50 font-medium">Hủy</button>
                    <button onClick={onConfirm} className={`px-4 py-2 rounded-md text-white text-sm font-bold ${confirmClass}`}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <div className="text-[11px] text-gray-400 tracking-wider mb-1 uppercase font-bold">{label}</div>
            <div className="font-semibold text-gray-900">{value || "-"}</div>
        </div>
    );
}