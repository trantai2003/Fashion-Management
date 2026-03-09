import { useEffect, useState, useCallback } from "react";
import { X, ChevronRight, ChevronDown, Warehouse, Package, Layers, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { thongKeHeThongService } from "@/services/thongKeHeThongService";
import { formatCurrency } from "@/utils/formatters";

// ─── Badge tồn kho ────────────────────────────────────────────────────────────
function StockBadge({ value }) {
    const num = Number(value ?? 0);
    if (num <= 0)
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-600 font-medium">Hết hàng</span>;
    if (num < 10)
        return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-50 text-yellow-700 font-medium">{num}</span>;
    return <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700 font-medium">{num}</span>;
}

// ─── Bảng lô hàng bên trong 1 kho ────────────────────────────────────────────
function KhoTonKhoPanel({ khoData }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-purple-50 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <Warehouse className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-semibold text-gray-800">{khoData.tenKho}</span>
                    <span className="text-xs text-gray-400">#{khoData.khoId}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-500 hidden sm:flex gap-3">
                        <span>
                            Tồn: <b className="text-gray-700">{Number(khoData.tongSoLuongTon ?? 0).toLocaleString()}</b>
                        </span>
                        <span>
                            Khả dụng:{" "}
                            <b className="text-green-600">{Number(khoData.tongSoLuongKhaDung ?? 0).toLocaleString()}</b>
                        </span>
                        <span>
                            Giá trị: <b className="text-purple-600">{formatCurrency(khoData.giaTriTonKho ?? 0)}</b>
                        </span>
                    </div>
                    {open ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            </button>

            {open && (
                <div className="overflow-x-auto">
                    {!khoData.danhSachLoHang || khoData.danhSachLoHang.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Không có lô hàng nào tại kho này
                        </div>
                    ) : (
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-purple-50 text-purple-700 uppercase tracking-wide text-[11px]">
                                    <th className="px-4 py-2 text-left font-semibold">Mã lô</th>
                                    <th className="px-4 py-2 text-right font-semibold">Tồn kho</th>
                                    <th className="px-4 py-2 text-right font-semibold">Đã đặt</th>
                                    <th className="px-4 py-2 text-right font-semibold">Khả dụng</th>
                                    <th className="px-4 py-2 text-right font-semibold">Giá vốn</th>
                                    <th className="px-4 py-2 text-right font-semibold">Giá trị</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {khoData.danhSachLoHang.map((lo, idx) => (
                                    <tr key={lo.maLo ?? idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5 font-mono font-semibold text-gray-700">{lo.maLo}</td>
                                        <td className="px-4 py-2.5 text-right">
                                            <StockBadge value={lo.soLuongTon} />
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-orange-600">
                                            {Number(lo.soLuongDaDat ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-green-600 font-medium">
                                            {Number(lo.soLuongKhaDung ?? 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-600">
                                            {formatCurrency(lo.giaVon ?? 0)}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-purple-600 font-medium">
                                            {formatCurrency(lo.giaTriTonKho ?? 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Panel 1 biến thể ─────────────────────────────────────────────────────────
function BienThePanel({ bienThe }) {
    const [open, setOpen] = useState(false);
    const [tonKhoList, setTonKhoList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const anhUrl = bienThe.anhBienThe?.tepTin?.duongDan;

    const handleToggle = useCallback(async () => {
        const nextOpen = !open;
        setOpen(nextOpen);

        if (nextOpen && !loaded) {
            try {
                setIsLoading(true);
                const res = await thongKeHeThongService.getTonKhoBienThe(bienThe.id);
                const serverResponse = res.data;
                if (serverResponse?.status === 200) {
                    setTonKhoList(serverResponse.data || []);
                }
            } catch (e) {
                console.error("Lỗi khi tải tồn kho biến thể:", e);
            } finally {
                setIsLoading(false);
                setLoaded(true);
            }
        }
    }, [open, loaded, bienThe.id]);

    const tongTon = tonKhoList.reduce((s, k) => s + Number(k.tongSoLuongTon ?? 0), 0);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header biến thể */}
            <button
                onClick={handleToggle}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
            >
                {/* Ảnh / color swatch */}
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
                    {anhUrl ? (
                        <img src={anhUrl} alt={bienThe.maSku} className="w-full h-full object-cover" />
                    ) : bienThe.mauSac?.maMauHex ? (
                        <span
                            className="w-5 h-5 rounded-full border border-gray-300"
                            style={{ backgroundColor: bienThe.mauSac.maMauHex }}
                        />
                    ) : (
                        <Package className="h-4 w-4 text-gray-300" />
                    )}
                </div>

                {/* Thông tin SKU */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded font-semibold">
                            {bienThe.maSku}
                        </span>
                        {bienThe.mauSac && (
                            <span className="flex items-center gap-1 text-xs text-gray-600">
                                {bienThe.mauSac.maMauHex && (
                                    <span
                                        className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                                        style={{ backgroundColor: bienThe.mauSac.maMauHex }}
                                    />
                                )}
                                {bienThe.mauSac.tenMau}
                            </span>
                        )}
                        {bienThe.size && (
                            <>
                                <span className="text-gray-300 text-xs">·</span>
                                <span className="text-xs text-gray-500">Size {bienThe.size.tenSize}</span>
                            </>
                        )}
                        {bienThe.chatLieu && (
                            <>
                                <span className="text-gray-300 text-xs">·</span>
                                <span className="text-xs text-gray-500">{bienThe.chatLieu.tenChatLieu}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-400">
                            Giá bán:{" "}
                            <b className="text-purple-600">{bienThe.giaBan ? formatCurrency(bienThe.giaBan) : "—"}</b>
                        </span>
                        <span className="text-gray-300 text-xs">|</span>
                        <span className="text-xs text-gray-400">
                            Giá vốn:{" "}
                            <b className="text-gray-600">{bienThe.giaVon ? formatCurrency(bienThe.giaVon) : "—"}</b>
                        </span>
                        {bienThe.trangThai === 1 ? (
                            <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded">Đang bán</span>
                        ) : (
                            <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded">Ngừng bán</span>
                        )}
                    </div>
                </div>

                {/* Tổng tồn */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {loaded && (
                        <span className="text-xs text-gray-500">
                            Tổng tồn:{" "}
                            <b className={tongTon > 0 ? "text-green-600" : "text-red-500"}>
                                {tongTon.toLocaleString()}
                            </b>
                        </span>
                    )}
                    {open ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Danh sách kho */}
            {open && (
                <div className="border-t border-gray-100 bg-gray-50 p-3 space-y-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-purple-600 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải tồn kho...
                        </div>
                    ) : tonKhoList.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Không có dữ liệu tồn kho cho biến thể này
                        </div>
                    ) : (
                        tonKhoList.map((kho, idx) => (
                            <KhoTonKhoPanel key={kho.khoId ?? idx} khoData={kho} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function InventoryDrawer({ isOpen, onClose, product }) {
    // ✅ Dùng trực tiếp bienTheSanPhams từ SanPhamQuanAoDto — không cần gọi API riêng
    const bienTheList = product?.bienTheSanPhams ?? [];

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />

            {/* Drawer panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-purple-600 to-purple-700">
                    <div className="flex items-center gap-3">
                        <Layers className="h-5 w-5 text-white" />
                        <div>
                            <div className="text-white font-semibold text-sm">Tồn kho chi tiết biến thể</div>
                            <div className="text-purple-200 text-xs truncate max-w-xs">{product?.tenSanPham}</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Stats bar */}
                {product && (
                    <div className="flex items-center gap-4 px-5 py-3 bg-purple-50 border-b text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Package className="h-3.5 w-3.5 text-purple-500" />
                            <span className="text-gray-600">
                                Mã SP: <b className="text-purple-700">{product.maSanPham}</b>
                            </span>
                        </div>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600">
                            Tồn kho hiện tại:{" "}
                            <b className="text-green-600">{(product.soLuongTon ?? 0).toLocaleString()}</b>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600">
                            Số biến thể: <b className="text-purple-700">{bienTheList.length}</b>
                        </span>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {bienTheList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 h-48 text-gray-400">
                            <Package className="h-12 w-12 text-gray-200" />
                            <div className="text-sm">Sản phẩm này chưa có biến thể nào</div>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400 px-1">
                                Nhấn vào biến thể để xem tồn kho theo từng kho → nhấn vào kho để xem chi tiết theo lô hàng
                            </p>
                            {bienTheList.map((bt, idx) => (
                                <BienThePanel key={bt.id ?? idx} bienThe={bt} />
                            ))}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose} className="text-sm">
                        Đóng
                    </Button>
                </div>
            </div>
        </>
    );
}