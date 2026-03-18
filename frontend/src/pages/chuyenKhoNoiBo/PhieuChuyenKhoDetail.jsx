import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { getMineKhoList } from "@/services/khoService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ClipboardList, Building2, Package } from "lucide-react";

// ── Trạng thái ────────────────────────────────────────────────────────────
const STATUS_MAP = {
    0: {
        label: "Nháp",
        badge: "inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700",
        dot:   "h-1.5 w-1.5 rounded-full bg-yellow-500",
    },
    1: {
        label: "Chờ duyệt",
        badge: "inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700",
        dot:   "h-1.5 w-1.5 rounded-full bg-blue-500",
    },
    2: {
        label: "Chờ xuất hàng",
        badge: "inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700",
        dot:   "h-1.5 w-1.5 rounded-full bg-indigo-500",
    },
    3: {
        label: "Đang vận chuyển",
        badge: "inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700",
        dot:   "h-1.5 w-1.5 rounded-full bg-purple-500",
    },
    5: {
        label: "Hoàn tất",
        badge: "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
        dot:   "h-1.5 w-1.5 rounded-full bg-emerald-500",
    },
    4: {
        label: "Đã huỷ",
        badge: "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700",
        dot:   "h-1.5 w-1.5 rounded-full bg-red-500",
    },
};

export default function PhieuChuyenKhoDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();

    const [data,               setData]               = useState(null);
    const [loading,            setLoading]            = useState(false);
    const [showCancelConfirm,  setShowCancelConfirm]  = useState(false);
    const [isProcessing,       setIsProcessing]       = useState(false);
    const [myWarehouseIds,      setMyWarehouseIds]     = useState([]);

    const role               = localStorage.getItem("role");
    const isAdmin            = role === "quan_tri_vien";
    const isQuanLy           = role === "quan_ly_kho" || isAdmin;
    const currentWarehouseId = Number(localStorage.getItem("selected_kho_id"));

    useEffect(() => { fetchDetail(); fetchMyWarehouses(); }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuChuyenKhoService.getDetail(id);
            setData(res?.data || res);
        } catch {
            toast.error("Không thể tải chi tiết phiếu chuyển kho");
        } finally {
            setLoading(false);
        }
    }
    async function fetchMyWarehouses() {
        try {
            const listKho = await getMineKhoList();
            setMyWarehouseIds(listKho.map(kho => kho.id));
        } catch (error) {
            console.error("Lỗi khi tải danh sách kho phân quyền:", error);
        }
    }

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

    async function handleMasterCancel() {
        setIsProcessing(true);
        try {
            await phieuChuyenKhoService.cancel(id);
            toast.success("Đã huỷ toàn bộ quy trình chuyển kho thành công");
            setShowCancelConfirm(false);
            fetchDetail();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể huỷ phiếu");
        } finally {
            setIsProcessing(false);
        }
    }

    // ── Loading ──
    if (loading || !data) {
        return (
            <div className="lux-sync warehouse-unified p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-600">Đang tải dữ liệu phiếu chuyển...</span>
                </div>
            </div>
        );
    }

    const st                   = STATUS_MAP[data.trangThai] ?? STATUS_MAP[0];
    const isDestinationManager = isAdmin || (isQuanLy && myWarehouseIds.includes(data.khoNhapId));
    const isSourceStaff        = isAdmin || myWarehouseIds.includes(data.khoXuatId);
    const totalItems           = data.items?.length || 0;
    const totalQty             = data.items?.reduce((s, i) => s + (i.soLuongYeuCau || 0), 0) || 0;

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate("/transfer-tickets")}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Badge trạng thái */}
                        <span className={st.badge}>
                            <span className={st.dot} />
                            {st.label}
                        </span>

                        {/* Nút Huỷ */}
                        {[0, 1, 2, 3].includes(data.trangThai) && (
                            <Button
                                variant="outline"
                                disabled={isProcessing}
                                onClick={() => setShowCancelConfirm(true)}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium transition-all duration-200"
                            >
                                Huỷ phiếu
                            </Button>
                        )}

                        {/* Nút Gửi duyệt */}
                        {data.trangThai === 0 && isDestinationManager && (
                            <Button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange(phieuChuyenKhoService.submit, "Đã gửi yêu cầu tới kho đích")}
                                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
                            >
                                {isProcessing
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                                    : "Gửi duyệt"
                                }
                            </Button>
                        )}

                        {/* Nút Phê duyệt */}
                        {data.trangThai === 1 && isSourceStaff && (
                            <Button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange(phieuChuyenKhoService.approve, "Phê duyệt nhận hàng thành công")}
                                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
                            >
                                {isProcessing
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                                    : "Phê duyệt"
                                }
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Stats cards ── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Kho nguồn</p>
                                <p className="text-sm font-bold text-gray-900 mt-1 leading-snug">{data.khoXuatTen || "—"}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Kho đích</p>
                                <p className="text-sm font-bold text-gray-900 mt-1 leading-snug">{data.khoNhapTen || "—"}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Số loại SP</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <ClipboardList className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng số lượng</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{totalQty}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Thông tin phiếu ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                            <ClipboardList className="h-4 w-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 leading-snug">Thông tin phiếu chuyển kho nội bộ</p>
                            <p className="text-xs text-slate-500 mt-0.5">Chi tiết về phiếu điều chuyển</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <InfoField label="Số phiếu xuất gốc" value={data.soPhieuXuat} mono />
                            <InfoField label="Kho nguồn (Xuất)"  value={data.khoXuatTen} />
                            <InfoField label="Kho đích (Nhập)"   value={data.khoNhapTen} />
                            <InfoField label="Người phê duyệt"   value={data.nguoiDuyetTen || "Chưa duyệt"} />
                            <InfoField
                                label="Ngày tạo"
                                value={data.ngayTao ? new Date(data.ngayTao).toLocaleDateString("vi-VN") : "—"}
                            />
                            <div className="md:col-span-3">
                                <InfoField label="Ghi chú" value={data.ghiChu || "Không có ghi chú"} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Danh sách hàng hóa ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                                <Package className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 leading-snug">Danh sách hàng hóa luân chuyển</p>
                                <p className="text-xs text-slate-500 mt-0.5">Chi tiết các sản phẩm trong phiếu</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">
                                        Sản phẩm / SKU
                                    </th>
                                    <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">
                                        Số lượng yêu cầu
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.items?.map((item, idx) => (
                                    <tr key={idx} className="transition-colors duration-150 hover:bg-violet-50/50">
                                        <td className="px-4 py-3.5 align-middle">
                                            <span className="font-semibold text-slate-900 leading-snug">
                                                {item.tenSanPham}
                                            </span>
                                            <span className="block font-mono text-xs text-violet-600 mt-0.5">
                                                {item.sku}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 align-middle text-right">
                                            <span className="inline-flex items-center justify-end rounded-lg bg-slate-100 px-2.5 py-1">
                                                <span className="font-semibold text-slate-800 text-xs">
                                                    {item.soLuongYeuCau}
                                                </span>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Tổng{" "}
                            <span className="font-semibold text-violet-600">{totalItems}</span>{" "}
                            sản phẩm
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                            * Việc chọn lô hàng cụ thể được thực hiện tại màn hình <strong>Xuất kho</strong>.
                        </p>
                    </div>
                </div>

            </div>

            {/* ── Modal xác nhận huỷ ── */}
            {showCancelConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Modal header */}
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                                <span className="text-red-600 text-base">⚠</span>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 leading-snug">Xác nhận huỷ toàn bộ quy trình</p>
                                <p className="text-xs text-slate-500 mt-0.5">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>

                        {/* Modal body */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Bạn chắc chắn muốn huỷ phiếu{" "}
                                <span className="font-bold text-slate-900">{data.soPhieuXuat}</span>?
                            </p>
                            <p className="mt-3 text-sm font-semibold text-red-600">
                                Hệ thống sẽ tự động hủy các phiếu Xuất/Nhập liên quan ngay lập tức.
                            </p>
                        </div>

                        {/* Modal footer */}
                        <div className="flex justify-end gap-3 px-6 py-5 bg-slate-50 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelConfirm(false)}
                                className="bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 shadow-sm transition-all duration-200 font-medium"
                            >
                                Quay lại
                            </Button>
                            <Button
                                disabled={isProcessing}
                                onClick={handleMasterCancel}
                                className="bg-red-600 text-white border border-red-600 hover:bg-white hover:text-red-600 shadow-sm transition-all duration-200 font-bold min-w-[140px]"
                            >
                                {isProcessing
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                                    : "Xác nhận huỷ"
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Sub-component ─────────────────────────────────────────────────────────
function InfoField({ label, value, mono = false }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {label}
            </p>
            <p className={`font-semibold text-slate-900 leading-snug ${mono ? "font-mono text-violet-600" : ""}`}>
                {value || "—"}
            </p>
        </div>
    );
}