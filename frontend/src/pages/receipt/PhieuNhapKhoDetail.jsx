import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";

// Map trạng thái
const STATUS_MAP = {
    0: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700" },
    1: { label: "Đang xử lý", className: "bg-amber-50 text-amber-700" },
    2: { label: "Chờ nhận hàng", className: "bg-blue-50 text-blue-700" }, 
    3: { label: "Đã nhập kho", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuNhapKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuNhapKhoService.getDetail(id);
            // Đảm bảo bóc tách chuẩn data trả về từ API
            setData(res?.data || res);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải chi tiết phiếu nhập");
        } finally {
            setLoading(false);
        }
    }

    if (loading || !data) {
        return <div className="p-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</div>;
    }

    // Logic Phân Loại: Nhận diện luồng
    // Phiếu có soDonMua -> Luồng PO. Nếu không có hoặc có chữ chuyển kho -> Luồng Transfer.
    const isInternalTransfer = !data.soDonMua || (data.loaiNhap || "").includes("Chuyển kho") || (data.loaiNhap || "").includes("hoàn trả");
    const isReturn = (data.loaiNhap || "").includes("hoàn trả");

    // Logic Validate: Đã bốc đủ lô hay chưa?
    const isAllDuLo = (data.items || []).every(item => item.daDuLo === true);

    // Nút xác nhận chỉ mở khi luồng PO đã bốc đủ lô, hoặc là luồng Chuyển kho nội bộ (mặc định đủ lô)
    const canComplete = isInternalTransfer || isAllDuLo;

    // Hàm xử lý Confirm Nhập Kho
    const handleConfirmImport = async () => {
        setIsProcessing(true);
        try {
            if (isInternalTransfer) {
                await phieuNhapKhoService.completeTransferReceipt(id); 
                toast.success("Nhận hàng luân chuyển thành công!");
            } else {
                await phieuNhapKhoService.complete(id);
                toast.success("Nhập kho từ đối tác thành công!");
            }
            setShowCompleteConfirm(false);
            fetchDetail(); // Fetch lại thay vì navigate đi nơi khác để xem kết quả
        } catch (e) {
            toast.error(e?.response?.data?.message || "Xác nhận nhập kho thất bại");
        } finally {
            setIsProcessing(false);
        }
    };

    // Hàm xử lý Hủy Phiếu
    const handleCancelImport = async () => {
        setIsProcessing(true);
        try {
            await phieuNhapKhoService.cancel(id);
            toast.success("Đã hủy phiếu nhập thành công");
            setShowCancelConfirm(false);
            navigate("/goods-receipts");
        } catch (e) {
            toast.error(e?.response?.data?.message || "Hủy phiếu thất bại");
        } finally {
            setIsProcessing(false);
        }
    };

    // Hàm tính tổng số lượng an toàn cho Modal
    const calculateTotalImport = () => {
        if (!data || !data.items) return 0;
        return data.items.reduce((acc, item) => acc + (item.soLuongDaKhaiBao || item.soLuongCanNhap || 0), 0);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* ===== HEADER ===== */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-10">
                    <button
                        onClick={() => navigate("/goods-receipts")}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                    >
                        ← Quay lại danh sách
                    </button>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 text-xs rounded font-medium ${STATUS_MAP[data.trangThai]?.className || "bg-gray-100 text-gray-600"}`}>
                            {STATUS_MAP[data.trangThai]?.label || "Trạng thái không xác định"}
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

                        {/* Nút Hủy: Hiện cho phiếu chưa hoàn thành (0: Nháp) và KHÔNG phải phiếu Hoàn trả */}
                        {!isReturn && data.trangThai === 0 && (
                            <button
                                disabled={isProcessing}
                                className="px-4 py-2 rounded-md text-sm border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                Huỷ phiếu
                            </button>
                        )}

                        {/* Nút Hoàn Tất Nhập Kho (Trạng thái 0 = Nháp) */}
                        {data.trangThai === 0 && (
                            <button
                                disabled={!canComplete || isProcessing}
                                onClick={() => setShowCompleteConfirm(true)}
                                className={`px-4 py-2 rounded-md text-sm font-bold text-white shadow-sm transition-all
                                    ${canComplete && !isProcessing
                                        ? "bg-green-600 hover:bg-green-700 active:scale-95"
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
                    <section className="bg-white border rounded-xl p-6 shadow-sm relative overflow-hidden">
                        {isReturn && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl shadow-sm">
                                PHIẾU HOÀN TRẢ
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-4 mt-2">
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Thông tin chi tiết</h2>
                            {!canComplete && data.trangThai === 0 && (
                                <span className="text-[10px] text-amber-600 font-bold animate-pulse">
                                    ⚠️ Cần khai báo đủ lô hàng để nhập kho
                                </span>
                            )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <Info label="Số phiếu nhập" value={data.soPhieuNhap} />
                            
                            {/* Hiển thị thông tin kho nguồn/đích linh hoạt */}
                            {isInternalTransfer ? (
                                <>
                                    <Info label="Kho xuất hàng đi (Nguồn)" value={data.tenKhoChuyenTu || "Không xác định"} />
                                    <Info label="Kho tiếp nhận (Đích)" value={data.tenKho} />
                                </>
                            ) : (
                                <>
                                    <Info label="Kho nhập hàng" value={data.tenKho} />
                                    <Info label="Nhà cung cấp" value={data.tenNhaCungCap} />
                                </>
                            )}

                            <Info label="Loại nghiệp vụ" value={data.loaiNhap || "Phiếu nhập kho"} />
                            
                            {!isInternalTransfer && <Info label="Đơn mua hàng (PO)" value={data.soDonMua} />}
                            {isInternalTransfer && <Info label="Mã Phiếu Xuất Gốc" value={data.soPhieuChuyenKhoGoc || data.phieuXuatGocId || "Kế thừa tự động"} />}
                            
                            <Info label="Ngày tạo" value={data.ngayNhap ? new Date(data.ngayNhap).toLocaleDateString("vi-VN") : "---"} />
                            <Info label="Người thao tác" value={data.tenNguoiNhap || "---"} />
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-gray-700">Danh sách hàng hóa</h3>
                            {isInternalTransfer && (
                                <span className="text-[11px] text-gray-500 italic bg-white px-2 py-1 rounded border">
                                    Lô hàng được tự động kế thừa từ Phiếu xuất
                                </span>
                            )}
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-4 font-bold">Sản phẩm / Biến thể</th>
                                    <th className="px-4 py-4 text-center">SL cần nhập</th>
                                    <th className="px-4 py-4 text-center">SL sẵn sàng</th>
                                    <th className="px-4 py-4 text-center">Trạng thái</th>
                                    <th className="px-4 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(data.items || []).map((item) => (
                                    <tr key={item.bienTheSanPhamId || Math.random()} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-900">{item.sku}</div>
                                            <div className="text-gray-500 text-xs mt-0.5">{item.tenBienThe}</div>
                                        </td>
                                        <td className="px-4 py-4 text-center font-medium text-gray-900">
                                            {item.soLuongCanNhap || 0}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`font-bold ${item.daDuLo || isInternalTransfer ? "text-green-600" : "text-amber-600"}`}>
                                                {/* Transfer -> SL sẵn sàng = SL cần nhập. PO -> SL thực tế đã pick */}
                                                {isInternalTransfer ? (item.soLuongCanNhap || 0) : (item.soLuongDaKhaiBao || 0)} / {item.soLuongCanNhap || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {item.daDuLo || isInternalTransfer ? (
                                                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold">Đã đủ hàng</span>
                                            ) : (
                                                <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold">Thiếu lô</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/goods-receipts/${data.id}/lot-input/${item.bienTheSanPhamId}`)}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm
                                                    ${isInternalTransfer 
                                                        ? "bg-white border text-gray-700 hover:bg-gray-50" 
                                                        : data.trangThai === 0
                                                            ? "bg-purple-600 text-white hover:bg-purple-700"
                                                            : "bg-white border text-gray-700 hover:bg-gray-50"}`}
                                            >
                                                {isInternalTransfer ? "Lô tự động" : (data.trangThai === 0 ? "Khai báo lô →" : "Xem lô")}
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
                        title={isInternalTransfer ? "Xác nhận nhận hàng luân chuyển" : "Hoàn tất nhập kho thực tế"}
                        content={isInternalTransfer
                            ? `Xác nhận hàng đã về kho an toàn. Tồn kho sẽ tự động được cộng vào kho (${data.tenKho}) của bạn dựa trên dữ liệu lô đã xuất từ kho nguồn.`
                            : `Hệ thống sẽ ghi nhận nhập ${calculateTotalImport()} sản phẩm vào kho thực tế.`}
                        onClose={() => setShowCompleteConfirm(false)}
                        onConfirm={handleConfirmImport}
                        confirmClass="bg-green-600 hover:bg-green-700"
                        isLoading={isProcessing}
                    />
                )}

                {/* ===== MODAL: HỦY PHIẾU ===== */}
                {showCancelConfirm && (
                    <ConfirmModal
                        title="Xác nhận hủy phiếu nhập kho"
                        content="Thao tác này sẽ hủy phiếu hiện tại. Bạn có chắc chắn muốn thực hiện hành động này?"
                        onClose={() => setShowCancelConfirm(false)}
                        onConfirm={handleCancelImport}
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
                <h2 className="text-xl font-bold mb-3 text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600 mb-8 leading-relaxed">{content}</p>
                <div className="flex justify-end gap-3">
                    <button disabled={isLoading} onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Đóng
                    </button>
                    <button disabled={isLoading} onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all ${confirmClass}`}>
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