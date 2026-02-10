import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";

export default function PickLot() {
    const navigate = useNavigate();
    const { phieuXuatKhoId, chiTietPhieuXuatKhoId } = useParams();
    const { state } = useLocation();

    /* ===== STATE FROM DETAIL ===== */
    const bienTheSanPhamId = state?.bienTheSanPhamId;
    const sku = state?.sku || "-";
    const tenBienThe = state?.tenBienThe || "-";
    const soLuongCanXuat = Number(state?.soLuongXuat ?? 0);
    const phieuTrangThai = state?.phieuTrangThai;

    // Logic ReadOnly: Nếu trạng thái phiếu khác 0 (Nháp) thì chỉ cho xem
    const isReadOnly = phieuTrangThai !== 0;

    /* ===== LOCAL STATE ===== */
    const [loading, setLoading] = useState(false);
    const [lots, setLots] = useState([]);
    const [pickMap, setPickMap] = useState({}); // { loHangId: soLuongPick }

    /* ===== GUARD & INITIAL LOAD ===== */
    useEffect(() => {
        if (!bienTheSanPhamId || !phieuXuatKhoId) {
            toast.error("Thiếu thông tin biến thể");
            navigate(-1);
            return;
        }

        async function loadInitialData() {
            setLoading(true);
            try {
                // Gọi song song cả 2 API để tối ưu tốc độ load
                const [lotsRes, pickedRes] = await Promise.all([
                    phieuXuatKhoService.getAvailableLots(phieuXuatKhoId, bienTheSanPhamId),
                    phieuXuatKhoService.getPickedLots(phieuXuatKhoId, chiTietPhieuXuatKhoId).catch(() => [])
                ]);

                setLots(Array.isArray(lotsRes) ? lotsRes : []);

                if (Array.isArray(pickedRes)) {
                    const map = {};
                    pickedRes.forEach(item => {
                        map[item.loHangId] = String(item.soLuongDaPick);
                    });
                    setPickMap(map);
                }
            } catch (e) {
                console.error(e);
                toast.error("Không tải được dữ liệu lô");
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [phieuXuatKhoId, bienTheSanPhamId, chiTietPhieuXuatKhoId, navigate]);

    /* ===== CALC ===== */
    const tongPickMoi = useMemo(() => {
        return Object.values(pickMap).reduce((sum, v) => sum + (Number(v) || 0), 0);
    }, [pickMap]);

    /* ===== INPUT ===== */
    function handleChange(loHangId, rawValue) {
        if (isReadOnly) return; // Không cho phép sửa nếu là ReadOnly

        if (rawValue === "") {
            setPickMap((prev) => ({ ...prev, [loHangId]: "" }));
            return;
        }
        if (!/^\d+$/.test(rawValue)) return;

        setPickMap((prev) => ({
            ...prev,
            [loHangId]: rawValue,
        }));
    }

    /* ===== SAVE ===== */
    async function handleSave() {
        if (isReadOnly) return;

        const entries = Object.entries(pickMap).filter(([, v]) => Number(v) > 0);

        if (entries.length === 0) {
            toast.error("Vui lòng nhập số lượng pick");
            return;
        }

        // Check tồn kho & tổng số lượng
        for (const [id, val] of entries) {
            const lot = lots.find(l => l.loHangId === Number(id));
            if (Number(val) > (lot?.soLuongKhaDung || 0)) {
                toast.error(`Lô ${lot?.maLo} không đủ tồn kho`);
                return;
            }
        }

        if (tongPickMoi > soLuongCanXuat) {
            toast.error("Tổng số lượng pick vượt quá số lượng cần xuất");
            return;
        }

        const loHangPicks = entries.map(([loHangId, soLuongXuat]) => ({
            loHangId: Number(loHangId),
            soLuongXuat: Number(soLuongXuat),
        }));

        setLoading(true);
        try {
            await phieuXuatKhoService.pickLo(phieuXuatKhoId, {
                chiTietPhieuXuatKhoId: Number(chiTietPhieuXuatKhoId),
                loHangPicks,
            });

            toast.success("Pick lô thành công");
            navigate(-1);
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Pick lô thất bại");
        } finally {
            setLoading(false);
        }
    }

    /* ===== RENDER ===== */
    return (
        <main className="flex-1">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link to={`/goods-issues/${phieuXuatKhoId}`} className="text-sm text-gray-500 hover:text-gray-900">
                    ← Back to Issue Detail
                </Link>
                {isReadOnly && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                        Chế độ xem
                    </span>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* INFO */}
                <section className="bg-white border rounded-xl p-6">
                    <h2 className="text-sm font-semibold mb-4">
                        Thông tin sản phẩm xuất kho
                    </h2>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <Info label="SKU" value={sku} />
                        <Info label="Biến thể" value={tenBienThe} />
                        <Info label="Số lượng cần xuất" value={soLuongCanXuat} />
                        <Info
                            label="Số lượng đã pick"
                            value={`${tongPickMoi} / ${soLuongCanXuat}`}
                            highlight={tongPickMoi >= soLuongCanXuat}
                        />
                    </div>
                </section>

                {/* LOT TABLE */}
                <section className="bg-white border rounded-xl overflow-hidden">
                    <div className="p-4 font-semibold">
                        Danh sách lô khả dụng
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">Mã lô</th>
                                <th className="px-4 py-3 text-center">Ngày nhập</th>
                                {!isReadOnly && <th className="px-4 py-3 text-center">Tồn khả dụng</th>}
                                <th className="px-4 py-3 text-center">Số lượng xuất</th>
                                {!isReadOnly && <th className="px-4 py-3 text-center">Trạng thái</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {lots.map((lot) => {
                                const displayValue = pickMap[lot.loHangId] ?? "";
                                const numValue = Number(displayValue) || 0;
                                const tonKhaDung = Number(lot.soLuongKhaDung) || 0;

                                // Logic xác định trạng thái
                                let statusBadge = null;
                                if (numValue <= 0) {
                                    statusBadge = <span className="text-xs text-gray-400">Not used</span>;
                                } else if (numValue === tonKhaDung) {
                                    statusBadge = (
                                        <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700">
                                            Full
                                        </span>
                                    );
                                } else if (numValue > tonKhaDung) {
                                    statusBadge = (
                                        <span className="px-2 py-1 text-xs rounded bg-red-50 text-red-700">
                                            Exceeded
                                        </span>
                                    );
                                } else {
                                    statusBadge = (
                                        <span className="px-2 py-1 text-xs rounded bg-amber-50 text-amber-700">
                                            Partial
                                        </span>
                                    );
                                }

                                return (
                                    <tr key={lot.loHangId} className="border-t">
                                        <td className="px-4 py-3 font-medium">
                                            {lot.maLo}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {lot.ngayNhapGanNhat
                                                ? new Date(lot.ngayNhapGanNhat).toLocaleDateString("vi-VN")
                                                : "-"}
                                        </td>
                                        {!isReadOnly && (
                                            <td className="px-4 py-3 text-center">
                                                {tonKhaDung}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                readOnly={isReadOnly}
                                                value={displayValue}
                                                onChange={(e) => handleChange(lot.loHangId, e.target.value)}
                                                placeholder="0"
                                                className={`w-20 h-9 border rounded-md text-center outline-none transition-all ${
                                                    isReadOnly 
                                                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed" 
                                                    : "border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50/50 focus:bg-white"
                                                }`}
                                            />
                                        </td>
                                        {!isReadOnly && (
                                            <td className="px-4 py-3 text-center">
                                                {statusBadge}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}

                            {lots.length === 0 && !loading && (
                                <tr>
                                    <td
                                        colSpan={isReadOnly ? 3 : 5}
                                        className="p-6 text-center text-gray-500"
                                    >
                                        Không có lô khả dụng
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                {/* ACTION */}
                <div className="mt-4 flex justify-end gap-3">
                    {!isReadOnly && (
                        <button
                            disabled={loading || tongPickMoi <= 0}
                            onClick={handleSave}
                            className="px-4 py-2 rounded-md bg-purple-600 text-white disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Pick"}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}

function Info({ label, value, highlight }) {
    return (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div
                className={`font-semibold ${highlight ? "text-green-600" : ""}`}
            >
                {value}
            </div>
        </div>
    );
}