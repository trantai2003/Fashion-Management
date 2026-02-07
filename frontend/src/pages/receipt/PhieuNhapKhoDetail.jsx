import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";
const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
    2: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const role = localStorage.getItem("role");
    const isNhanVienKho = role === "nhan_vien_kho";

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
        return (
            <div className="p-10 text-center text-sm text-gray-500">
                Loading...
            </div>
        );
    }

    const isAllDuLo = data.items.every(item => item.daDuLo === true);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">

                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">

                    {/* LEFT */}
                    <Link
                        to="/goods-receipts"
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                    >
                        ← Back to list
                    </Link>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 text-xs rounded ${STATUS_MAP[data.trangThai]?.className}`}
                        >
                            {STATUS_MAP[data.trangThai]?.label}
                        </span>

                        {/* Cancel */}
                        {!isNhanVienKho && (
                        <button
                            className="px-4 py-2 rounded-md text-sm
                                           border border-red-200 text-red-600
                                           hover:bg-red-50"
                            onClick={() => {
                                if (data.trangThai === 1) {
                                    toast.error("Phiếu nhập đã hoàn thành, không thể huỷ");
                                    return;
                                }
                                if (data.trangThai === 2) {
                                    toast.error("Phiếu nhập đã bị huỷ trước đó");
                                    return;
                                }
                                setShowCancelConfirm(true)
                            }}
                        >
                            Huỷ phiếu nhập
                        </button>
                        )}
                        
                        {/* Complete */}
                        <button
                            disabled={!isAllDuLo || data.trangThai !== 0}
                            onClick={() => setShowConfirm(true)}
                            className={`
                                    px-4 py-2 rounded-md text-sm font-semibold
                                    ${isAllDuLo && data.trangThai === 0
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-gray-300 text-white cursor-not-allowed"}
                                `}
                        >
                            Hoàn thành phiếu nhập
                        </button>
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* INFO */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">
                            Thông tin phiếu nhập
                        </h2>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <Info label="Số phiếu" value={data.soPhieuNhap} />
                            <Info label="Đơn mua hàng" value={data.soDonMua} />
                            <Info label="Nhà cung cấp" value={data.tenNhaCungCap} />
                            <Info label="Kho nhập" value={data.tenKho} />
                            <Info
                                label="Ngày nhập"
                                value={new Date(data.ngayNhap).toLocaleDateString("vi-VN")}
                            />
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                            <h2 className="text-sm font-semibold">
                                Danh sách sản phẩm
                            </h2>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-left">Biến thể</th>
                                    <th className="px-4 py-3 text-center">SL cần nhập</th>
                                    <th className="px-4 py-3 text-center">SL đã khai báo</th>
                                    <th className="px-4 py-3 text-center">Trạng thái</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.items.map((item) => (
                                    <tr key={item.bienTheSanPhamId} className="border-t">
                                        <td className="px-4 py-3 font-semibold">
                                            {item.sku}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.tenBienThe}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.soLuongCanNhap}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(item.soLuongDaKhaiBao ?? 0)}/{item.soLuongCanNhap}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.daDuLo ? (
                                                <span className="text-green-600 text-lg">✅</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded bg-amber-50 text-amber-700">
                                                    Chưa đủ lô
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {!item.daDuLo && (
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/phieu-nhap-kho/${data.id}/khai-bao-lo/${item.bienTheSanPhamId}`
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                                                >
                                                    Khai báo lô
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* ===== CONFIRM POPUP ===== */}
                {showConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">
                            <h2 className="text-lg font-semibold mb-2">
                                Xác nhận hoàn thành phiếu nhập
                            </h2>

                            <p className="text-sm text-gray-600 mb-4">
                                Phiếu nhập kho <strong>{data.soPhieuNhap}</strong> sẽ được hoàn thành.
                            </p>

                            <ul className="text-sm text-gray-600 list-disc pl-5 mb-4 space-y-1">
                                <li>Tạo / cập nhật lô hàng</li>
                                <li>Cộng tồn kho theo từng lô</li>
                                <li>Không cho phép chỉnh sửa lại phiếu</li>
                            </ul>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => alert("TODO: gọi API hoàn thành")}
                                    className="px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                                >
                                    Confirm & Complete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CANCEL CONFIRM POPUP ===== */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">

                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Xác nhận huỷ phiếu nhập
                            </h2>

                            <p className="text-sm text-gray-600 mb-4">
                                Bạn chắc chắn muốn huỷ phiếu nhập kho
                                <strong className="mx-1">{data.soPhieuNhap}</strong>?
                            </p>

                            <ul className="text-sm text-gray-600 list-disc pl-5 mb-4 space-y-1">
                                <li>Phiếu nhập sẽ chuyển sang trạng thái <b>Đã huỷ</b></li>
                                <li>Các thông tin đã nhập sẽ được giữ lại để tra cứu</li>
                                <li>Không thể tiếp tục khai báo lô cho phiếu này</li>
                            </ul>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={async () => {
                                        try {
                                            await phieuNhapKhoService.cancel(data.id);
                                            setShowCancelConfirm(false);
                                            toast.success("Huỷ phiếu nhập thành công");
                                            navigate("/goods-receipts");
                                        } catch (e) {
                                            toast.error(
                                                e?.response?.data?.message ||
                                                "Không thể huỷ phiếu nhập"
                                            );
                                        }
                                    }}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                                >
                                    Confirm & Cancel
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
