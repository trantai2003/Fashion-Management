import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Package, CheckCircle2, ClipboardList } from "lucide-react";

export default function PickLot() {
    const navigate = useNavigate();
    const { phieuXuatKhoId, chiTietPhieuXuatKhoId } = useParams();
    const { state } = useLocation();

    const bienTheSanPhamId = state?.bienTheSanPhamId;
    const sku              = state?.sku || "-";
    const tenBienThe       = state?.tenBienThe || "-";
    const soLuongCanXuat   = Number(state?.soLuongXuat ?? 0);
    const phieuTrangThai   = state?.phieuTrangThai;
    const isReadOnly       = phieuTrangThai !== 0;

    const [loading,  setLoading]  = useState(false);
    const [lots,     setLots]     = useState([]);
    const [pickMap,  setPickMap]  = useState({});

    useEffect(() => {
        if (!bienTheSanPhamId || !phieuXuatKhoId) {
            toast.error("Thiếu thông tin biến thể");
            navigate(-1);
            return;
        }
        async function loadInitialData() {
            setLoading(true);
            try {
                const [lotsRes, pickedRes] = await Promise.all([
                    phieuXuatKhoService.getAvailableLots(phieuXuatKhoId, bienTheSanPhamId),
                    phieuXuatKhoService.getPickedLots(phieuXuatKhoId, chiTietPhieuXuatKhoId).catch(() => []),
                ]);
                setLots(Array.isArray(lotsRes) ? lotsRes : []);
                if (Array.isArray(pickedRes)) {
                    const map = {};
                    pickedRes.forEach(item => { map[item.loHangId] = String(item.soLuongDaPick); });
                    setPickMap(map);
                }
            } catch { toast.error("Không tải được dữ liệu lô"); }
            finally { setLoading(false); }
        }
        loadInitialData();
    }, [phieuXuatKhoId, bienTheSanPhamId, chiTietPhieuXuatKhoId, navigate]);

    const tongPickMoi = useMemo(() =>
        Object.values(pickMap).reduce((sum, v) => sum + (Number(v) || 0), 0),
    [pickMap]);

    function handleChange(loHangId, rawValue) {
        if (isReadOnly) return;
        if (rawValue === "") { setPickMap(prev => ({ ...prev, [loHangId]: "" })); return; }
        if (!/^\d+$/.test(rawValue)) return;
        setPickMap(prev => ({ ...prev, [loHangId]: rawValue }));
    }

    async function handleSave() {
        if (isReadOnly) return;
        const entries = Object.entries(pickMap).filter(([, v]) => Number(v) > 0);
        if (entries.length === 0) { toast.error("Vui lòng nhập số lượng pick"); return; }
        for (const [id, val] of entries) {
            const lot = lots.find(l => l.loHangId === Number(id));
            if (Number(val) > (lot?.soLuongKhaDung || 0)) { toast.error(`Lô ${lot?.maLo} không đủ tồn kho`); return; }
        }
        if (tongPickMoi > soLuongCanXuat) { toast.error("Tổng số lượng pick vượt quá số lượng cần xuất"); return; }

        setLoading(true);
        try {
            await phieuXuatKhoService.pickLo(phieuXuatKhoId, {
                chiTietPhieuXuatKhoId: Number(chiTietPhieuXuatKhoId),
                loHangPicks: entries.map(([loHangId, soLuongXuat]) => ({ loHangId: Number(loHangId), soLuongXuat: Number(soLuongXuat) })),
            });
            toast.success("Pick lô thành công");
            navigate(-1);
        } catch (e) { toast.error(e?.response?.data?.message || "Pick lô thất bại"); }
        finally { setLoading(false); }
    }

    // Badge trạng thái lô
    function LotStatusBadge({ numValue, tonKhaDung }) {
        if (numValue <= 0) return <span className="text-xs text-slate-400">Không dùng</span>;
        if (numValue > tonKhaDung) return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />Vượt mức
            </span>
        );
        if (numValue === tonKhaDung) return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Hết lô
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />Một phần
            </span>
        );
    }

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate(`/goods-issues/${phieuXuatKhoId}`)}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại chi tiết phiếu
                    </button>

                    {isReadOnly && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Chế độ xem
                        </span>
                    )}
                </div>

                {/* ── Stats cards ── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">SKU</p>
                                <p className="text-sm font-bold text-gray-900 mt-1 font-mono">{sku}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white p-6 md:col-span-1 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Biến thể</p>
                                <p className="text-sm font-bold text-gray-900 mt-1 leading-snug">{tenBienThe}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <ClipboardList className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cần xuất</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{soLuongCanXuat}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${tongPickMoi >= soLuongCanXuat ? "bg-gradient-to-br from-green-50 to-white" : "bg-gradient-to-br from-slate-50 to-white"}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đã pick</p>
                                <p className={`text-2xl font-bold mt-1 ${tongPickMoi >= soLuongCanXuat ? "text-emerald-600" : "text-gray-900"}`}>
                                    {tongPickMoi}<span className="text-sm font-normal text-gray-400">/{soLuongCanXuat}</span>
                                </p>
                            </div>
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${tongPickMoi >= soLuongCanXuat ? "bg-green-100" : "bg-slate-100"}`}>
                                <CheckCircle2 className={`h-6 w-6 ${tongPickMoi >= soLuongCanXuat ? "text-green-600" : "text-slate-400"}`} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Bảng lô hàng ── */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                            <ClipboardList className="h-4 w-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 leading-snug">Danh sách lô khả dụng</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {isReadOnly ? "Xem số lượng đã pick cho từng lô" : "Nhập số lượng cần xuất cho từng lô"}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                            <span className="text-sm text-gray-600">Đang tải danh sách lô...</span>
                        </div>
                    ) : lots.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <Package className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Không có lô khả dụng</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Sản phẩm này hiện không có lô hàng nào khả dụng.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Mã lô</th>
                                        <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Ngày nhập</th>
                                        {!isReadOnly && <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Tồn khả dụng</th>}
                                        <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Số lượng xuất</th>
                                        {!isReadOnly && <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Trạng thái</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {lots.map((lot) => {
                                        const displayValue = pickMap[lot.loHangId] ?? "";
                                        const numValue     = Number(displayValue) || 0;
                                        const tonKhaDung   = Number(lot.soLuongKhaDung) || 0;
                                        return (
                                            <tr key={lot.loHangId} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                <td className="px-4 py-3.5 align-middle">
                                                    <span className="font-bold text-violet-600 tracking-wide font-mono">{lot.maLo}</span>
                                                </td>
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className="text-sm text-slate-600">
                                                        {lot.ngayNhapGanNhat ? new Date(lot.ngayNhapGanNhat).toLocaleDateString("vi-VN") : "—"}
                                                    </span>
                                                </td>
                                                {!isReadOnly && (
                                                    <td className="px-4 py-3.5 align-middle text-center">
                                                        <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1">
                                                            <span className="font-semibold text-slate-800 text-xs">{tonKhaDung}</span>
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        readOnly={isReadOnly}
                                                        value={displayValue}
                                                        onChange={(e) => handleChange(lot.loHangId, e.target.value)}
                                                        placeholder="0"
                                                        className={`w-24 h-9 border rounded-lg text-center font-semibold focus:outline-none transition-all ${
                                                            isReadOnly
                                                                ? "bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                                                                : "border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-white"
                                                        }`}
                                                    />
                                                </td>
                                                {!isReadOnly && (
                                                    <td className="px-4 py-3.5 align-middle text-center">
                                                        <LotStatusBadge numValue={numValue} tonKhaDung={tonKhaDung} />
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {lots.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                Tổng <span className="font-semibold text-violet-600">{lots.length}</span> lô — Đã pick{" "}
                                <span className={`font-semibold ${tongPickMoi >= soLuongCanXuat ? "text-emerald-600" : "text-amber-600"}`}>{tongPickMoi}</span>
                                /{soLuongCanXuat}
                            </p>
                            {!isReadOnly && (
                                <Button
                                    disabled={loading || tongPickMoi <= 0}
                                    onClick={handleSave}
                                    className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold min-w-[140px] disabled:opacity-50"
                                >
                                    {loading
                                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                                        : <><CheckCircle2 className="mr-2 h-4 w-4" />Xác nhận Lô</>
                                    }
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}