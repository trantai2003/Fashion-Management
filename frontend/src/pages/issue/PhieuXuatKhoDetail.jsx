import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đã duyệt", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Đã xuất", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
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
            setData(res);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải chi tiết phiếu xuất");
        } finally {
            setLoading(false);
        }
    }

    // Hàm xử lý chung cho Gửi duyệt và Phê duyệt (vì không cần qua modal xác nhận)
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
                    <Link
                        to="/goods-issues"
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                    >
                        ← Back to list
                    </Link>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 text-xs rounded ${STATUS_MAP[phieu.trangThai]?.className}`}
                        >
                            {STATUS_MAP[phieu.trangThai]?.label}
                        </span>

                        {/* Cancel Button - Hiện cho các trạng thái chưa hoàn thành/hủy */}
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
                                className="px-4 py-2 rounded-md text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700"
                            >
                                Hoàn thành xuất kho
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
                            {phieu.loaiXuat === "ban_hang" && (
                                <Info label="Sales Order" value={phieu.soDonHang} />
                            )}

                            {phieu.loaiXuat === "chuyen_kho" && (
                                <Info label="Kho chuyển đến" value={phieu.tenKhoChuyenDen} />
                            )}
                            <Info label="Kho xuất" value={phieu.tenKho} />
                            <Info
                                label="Ngày xuất"
                                value={new Date(phieu.ngayXuat).toLocaleDateString("vi-VN")}
                            />
                            {phieu.ghiChu && (
                                <Info label="Ghi chú" value={phieu.ghiChu} />
                            )}

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
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-left">Biến thể</th>
                                    <th className="px-4 py-3 text-center">SL cần xuất</th>
                                    <th className="px-4 py-3 text-center">SL đã pick</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chiTiet.map((ct) => (
                                    <tr key={ct.id} className="border-t">
                                        <td className="px-4 py-3 font-semibold">{ct.sku}</td>
                                        <td className="px-4 py-3">{ct.tenBienThe}</td>
                                        <td className="px-4 py-3 text-center">{ct.soLuongCanXuat}</td>
                                        <td className="px-4 py-3 text-center">
                                            {ct.soLuongDaPick} / {ct.soLuongCanXuat}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {ct.duSoLuong ? (
                                                <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700">
                                                    Đủ số lượng
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded bg-red-50 text-red-700">
                                                    Chưa đủ
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                disabled={phieu.trangThai === 4}
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
                                                className={`px-3 py-1.5 text-sm rounded-md font-medium
                                                    ${phieu.trangThai === 0
                                                        ? "bg-purple-600 text-white hover:bg-purple-700"
                                                        : phieu.trangThai === 4
                                                        ? "bg-gray-300 text-white cursor-not-allowed"
                                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                                    }
                                                `}
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

                {/* ===== CONFIRM COMPLETE MODAL ===== */}
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                            <h2 className="text-lg font-semibold mb-2">Xác nhận hoàn thành</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Phiếu xuất kho <strong>{phieu.soPhieuXuat}</strong> sẽ được hoàn thành.
                            </p>

                            <ul className="text-sm text-gray-600 list-disc pl-5 mb-4 space-y-1">
                                <li>Trừ tồn kho theo từng lô</li>
                                <li>Ghi lịch sử giao dịch kho</li>
                                <li>Không thể chỉnh sửa lại phiếu</li>
                            </ul>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={async () => {
                                        setIsProcessing(true);
                                        try {
                                            await phieuXuatKhoService.complete(phieu.id);
                                            toast.success("Hoàn thành phiếu xuất thành công");
                                            navigate("/goods-issues");
                                        } catch (e) {
                                            toast.error(e?.response?.data?.message || "Không thể hoàn thành phiếu xuất");
                                        } finally {
                                            setIsProcessing(false);
                                            setShowConfirm(false);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                                >
                                    Xác nhận hoàn thành
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CONFIRM CANCEL MODAL ===== */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận huỷ phiếu</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Bạn chắc chắn muốn huỷ phiếu xuất kho
                                <strong className="mx-1">{phieu.soPhieuXuat}</strong>?
                            </p>

                            <ul className="text-sm text-gray-600 list-disc pl-5 mb-4 space-y-1">
                                <li>Phiếu xuất sẽ chuyển sang trạng thái <b>Đã huỷ</b></li>
                                <li>Các thông tin đã nhập sẽ được giữ lại để tra cứu</li>
                                <li>Không thể tiếp tục thao tác với phiếu này</li>
                            </ul>
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
                                            await phieuXuatKhoService.cancel(phieu.id);
                                            toast.success("Huỷ phiếu xuất thành công");
                                            navigate("/goods-issues");
                                        } catch (e) {
                                            toast.error(e?.response?.data?.message || "Không thể huỷ phiếu xuất");
                                        } finally {
                                            setIsProcessing(false);
                                            setShowCancelConfirm(false);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                                >
                                    Huỷ phiếu xuất
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
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-medium text-gray-900">{value || "-"}</div>
        </div>
    );
}