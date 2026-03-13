import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { toast } from "sonner";

// Mapping trạng thái đồng nhất với phong cách của bạn
const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Chờ xuất hàng", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Đang vận chuyển", className: "bg-purple-50 text-purple-700" },
    5: { label: "Hoàn tất", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuChuyenKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const role = localStorage.getItem("role");
    const isAdmin = role === "quan_tri_vien";
    const isQuanLy = role === "quan_ly_kho" || isAdmin;
    const currentWarehouseId = Number(localStorage.getItem("warehouseId"));

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuChuyenKhoService.getDetail(id);
            // Đảm bảo lấy đúng data từ Response
            setData(res?.data || res);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải chi tiết phiếu chuyển kho");
        } finally {
            setLoading(false);
        }
    }

    // Hàm xử lý thay đổi trạng thái (Gửi duyệt, Phê duyệt)
    async function handleStatusChange(actionFn, successMsg) {
        setIsProcessing(true);
        try {
            await actionFn(id);
            toast.success(successMsg);
            fetchDetail();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Thao tác thất bại");
        } finally {
            setIsProcessing(false);
        }
    }

    // HÀM HỦY TỔNG THỂ: Gọi 1 lần duy nhất để BE tự hủy Issue/Receipt liên quan
    async function handleMasterCancel() {
        setIsProcessing(true);
        try {
            await phieuChuyenKhoService.cancel(id);
            toast.success("Đã huỷ toàn bộ quy trình chuyển kho thành công");
            setShowCancelConfirm(false);
            fetchDetail(); // Load lại để cập nhật status 4
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể huỷ phiếu");
        } finally {
            setIsProcessing(false);
        }
    }

    if (loading || !data) {
        return (
            <div className="p-10 text-center text-sm text-gray-500 font-medium">
                Đang tải dữ liệu phiếu chuyển...
            </div>
        );
    }

    // Kiểm tra quyền: Chỉ quản lý kho đích mới được duyệt
    const isDestinationManager = isAdmin || (isQuanLy && data.khoNhapId === currentWarehouseId);
    // Kiểm tra quyền: Chỉ nhân viên kho nguồn mới được gửi duyệt
    const isSourceStaff = isAdmin || (data.khoXuatId === currentWarehouseId);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    {/* LEFT */}
                    <button
                        onClick={() => navigate("/transfer-tickets")}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium"
                    >
                        ← Quay lại
                    </button>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3 py-1 text-xs rounded font-medium ${STATUS_MAP[data.trangThai]?.className}`}
                        >
                            {STATUS_MAP[data.trangThai]?.label}
                        </span>

                        {/* Nút Hủy: Chỉ hiện khi chưa Hoàn tất (5) hoặc Đã hủy (4) */}
                        {[0, 1, 2, 3].includes(data.trangThai) && (
                            <button
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Huỷ phiếu
                            </button>
                        )}

                        {/* 1. Nút Gửi duyệt */}
                        {data.trangThai === 0 && isSourceStaff && (
                            <button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange(phieuChuyenKhoService.submit, "Đã gửi yêu cầu tới kho đích")}
                                className="px-4 py-2 rounded-md text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
                            >
                                Gửi duyệt
                            </button>
                        )}

                        {/* 2. Nút Phê duyệt */}
                        {data.trangThai === 1 && isDestinationManager && (
                            <button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange(phieuChuyenKhoService.approve, "Phê duyệt nhận hàng thành công")}
                                className="px-4 py-2 rounded-md text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
                            >
                                Phê duyệt
                            </button>
                        )}
                    </div>
                </div>

                {/* ===== CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                    {/* INFO BOX */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="font-bold mb-6 text-gray-900 tracking-wider">
                            Thông tin phiếu chuyển kho nội bộ
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <Info label="Số phiếu xuất gốc" value={data.soPhieuXuat} />
                            <Info label="Kho nguồn (Xuất)" value={data.khoXuatTen} />
                            <Info label="Kho đích (Nhập)" value={data.khoNhapTen} />
                            <Info label="Người Phê duyệt" value={data.nguoiDuyetTen || "Chưa duyệt"} />
                            <Info label="Ngày tạo" value={new Date(data.ngayTao).toLocaleDateString("vi-VN")} />
                            
                            <div className="md:col-span-3">
                                <Info label="Ghi chú" value={data.ghiChu || "Không có ghi chú"} />
                            </div>
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-sm font-semibold">Danh sách hàng hóa luân chuyển</h2>
                            <span className="text-sm font-semibold">
                                {data.items?.length || 0} Sản phẩm
                            </span>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-left">Sản phẩm / SKU</th>
                                    <th className="px-6 py-4 font-medium text-center">Số lượng yêu cầu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.items?.map((item, idx) => {
                                    const isDone = item.soLuongDaPick >= item.soLuongYeuCau;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 group-hover:text-indigo-600 transition-colors font-bold">{item.tenSanPham}</div>
                                                <div className="text-gray-400 font-mono mt-0.5 tracking-tighter">{item.sku}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-700 text-base font-bold">
                                                {item.soLuongYeuCau}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="p-4 bg-gray-50 border-t text-center">
                            <p className="text-[11px] text-gray-400 italic">
                                * Lưu ý: Việc chọn lô hàng cụ thể được thực hiện tại màn hình <b>Xuất kho</b>.
                            </p>
                        </div>
                    </section>
                </div>

                {/* ===== MODAL XÁC NHẬN HỦY DUY NHẤT ===== */}
                {showCancelConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
                        <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-lg font-bold text-gray-900 mb-2 font-sans">Xác nhận huỷ toàn bộ quy trình</h2>
                            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                Bạn chắc chắn muốn huỷ phiếu <strong>{data.soPhieuXuat}</strong>? <br/>
                                <span className="text-red-600 font-bold italic mt-2 block">
                                    Hệ thống sẽ tự động hủy các phiếu Xuất/Nhập liên quan ngay lập tức.
                                </span>
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Quay lại
                                </button>
                                <button
                                    disabled={isProcessing}
                                    onClick={handleMasterCancel}
                                    className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md shadow-red-100 transition-all active:scale-95"
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

// Sub-component hiển thị thông tin (Label-Value)
function Info({ label, value }) {
    return (
        <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                {label}
            </div>
            <div className="font-semibold text-gray-900 leading-tight">
                {value || "---"}
            </div>
        </div>
    );
}