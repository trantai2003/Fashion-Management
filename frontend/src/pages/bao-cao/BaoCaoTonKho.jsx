import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";
import {
    Loader2, Plus, Minus, RefreshCw, Search,
    Warehouse, Package, Layers, TrendingDown, AlertTriangle,
    Box, ChevronRight, X, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── JWT ──────────────────────────────────────────────────────────────────────
function parseJwt(token) {
    try {
        const b = token.split(".")[1];
        return JSON.parse(atob(b.replace(/-/g, "+").replace(/_/g, "/")));
    } catch { return null; }
}

const ROLES_SEE_ALL = ["quan_tri_vien", "admin", "quan_ly_kho", "nhan_vien_mua_hang", "nhan_vien_ban_hang"];
function shouldSeeAll(vaiTro) {
    if (!vaiTro) return false;
    const roles = vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
    return roles.some((r) => ROLES_SEE_ALL.includes(r));
}

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) : "—");
const fmtMoney = (n) => {
    if (n == null) return "—";
    const num = Number(n);
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " tr ₫";
    return num.toLocaleString("vi-VN") + " ₫";
};
const fmtMoneyFull = (n) =>
    n != null ? Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }) : "—";

// ─── Stock badge ──────────────────────────────────────────────────────────────
function StockBadge({ qty, min }) {
    const q = Number(qty ?? 0), m = Number(min ?? 0);
    if (q === 0)
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-[11px] font-bold"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Hết hàng</span>;
    if (q <= m)
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-bold"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Sắp hết</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-bold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Còn hàng</span>;
}

// ─── Expand Button ────────────────────────────────────────────────────────────
function ExpandBtn({ expanded, onClick, size = "md" }) {
    const s = size === "sm" ? "h-5 w-5" : "h-6 w-6";
    const ic = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(e); }}
            className={`${s} flex items-center justify-center rounded border transition-all duration-150 flex-shrink-0
                ${expanded
                    ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                    : "bg-white border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-600"
                }`}
        >
            {expanded ? <Minus className={ic} /> : <Plus className={ic} />}
        </button>
    );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, colorClass, bgClass, borderClass }) {
    return (
        <Card className={`border ${borderClass} shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
                        <p className={`text-2xl font-bold ${colorClass} truncate`}>{value}</p>
                        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
                    </div>
                    <div className={`w-11 h-11 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0 ml-3`}>
                        <Icon size={20} className={colorClass} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Lô hàng modal ────────────────────────────────────────────────────────────
function LoHangModal({ isOpen, onClose, bienThe, khoId }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !bienThe || !khoId) return;
        setLoading(true);
        apiClient
            .get(`/api/v1/thong-ke-he-thong/ton-kho-bien-the/${khoId}/${bienThe.bienTheId}`)
            .then((r) => setData(r.data?.data ?? []))
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    }, [isOpen, bienThe, khoId]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[80vh] flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Chi tiết lô hàng — {bienThe?.tenBienThe ?? bienThe?.maSku}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">SKU: {bienThe?.maSku}</p>
                    </div>
                    <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2 text-slate-500">
                            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />Đang tải...
                        </div>
                    ) : data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Box className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">Không có dữ liệu lô hàng</p>
                        </div>
                    ) : data.map((tk, i) => (
                        <div key={i} className="mb-6">
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {[
                                    { label: "Tổng tồn", val: fmt(tk.tongSoLuongTon), color: "text-slate-900" },
                                    { label: "Đã đặt", val: fmt(tk.tongSoLuongDaDat), color: "text-amber-600" },
                                    { label: "Khả dụng", val: fmt(tk.tongSoLuongKhaDung), color: "text-emerald-600" },
                                    { label: "Giá trị tồn", val: fmtMoney(tk.giaTriTonKho), color: "text-purple-700" },
                                ].map((s) => (
                                    <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                                        <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            {tk.danhSachLoHang?.length > 0 && (
                                <div className="rounded-xl overflow-hidden ring-1 ring-slate-200">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                {["Mã lô", "Nhà CC", "Ngày SX", "Tồn", "Đã đặt", "Khả dụng", "Giá vốn"].map((h) => (
                                                    <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-500 uppercase tracking-wide text-[10px]">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {tk.danhSachLoHang.map((lo, j) => (
                                                <tr key={j} className="hover:bg-amber-50/40">
                                                    <td className="px-3 py-2.5 font-semibold text-amber-700">{lo.maLo}</td>
                                                    <td className="px-3 py-2.5 text-slate-600">{lo.tenNhaCungCap ?? "—"}</td>
                                                    <td className="px-3 py-2.5 text-slate-500">{lo.ngaySanXuat ? new Date(lo.ngaySanXuat).toLocaleDateString("vi-VN") : "—"}</td>
                                                    <td className="px-3 py-2.5 text-right font-medium text-slate-700">{fmt(lo.soLuongTon)}</td>
                                                    <td className="px-3 py-2.5 text-right text-amber-600">{fmt(lo.soLuongDaDat)}</td>
                                                    <td className="px-3 py-2.5 text-right text-emerald-600">{fmt(lo.soLuongKhaDung)}</td>
                                                    <td className="px-3 py-2.5 text-right text-slate-600">{fmtMoneyFull(lo.giaVonLo)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Row: Biến thể (Level 3) ──────────────────────────────────────────────────
function BienTheRow({ bt, mucTonToiThieu, khoId }) {
    const [modal, setModal] = useState(false);
    const qty = Number(bt.tongSoLuongTon ?? 0);
    const dat = Number(bt.tongSoLuongDaDat ?? 0);
    const kha = Number(bt.tongSoLuongKhaDung ?? 0);
    const gtri = Number(bt.giaTriTonKho ?? 0);

    const attrs = [
        bt.tenMau !== "—" ? bt.tenMau : null,
        bt.tenSize !== "—" ? bt.tenSize : null,
        bt.tenChatLieu !== "—" ? bt.tenChatLieu : null,
    ].filter(Boolean).join(" · ");

    return (
        <>
            <tr className="hover:bg-violet-50/40 transition-colors group">
                {/* Level 3 indent */}
                <td className="py-2.5 align-middle">
                    <div className="flex items-center" style={{ paddingLeft: "80px" }}>
                        {/* Tree line */}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                            <div className="w-4 h-px bg-slate-200 flex-shrink-0" />
                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                                {bt.maMauHex && (
                                    <span style={{ background: bt.maMauHex }}
                                        className="h-3 w-3 rounded-full border border-slate-200 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                    <span className="text-xs font-mono text-amber-600 block">{bt.maSku}</span>
                                    <span className="text-xs text-slate-500 truncate block">{attrs || bt.tenBienThe}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-semibold text-slate-800 align-middle">{fmt(qty)}</td>
                <td className="px-3 py-2.5 text-right text-sm text-amber-600 font-medium align-middle">{fmt(dat)}</td>
                <td className="px-3 py-2.5 text-right text-sm text-emerald-700 font-semibold align-middle">{fmt(kha)}</td>
                <td className="px-3 py-2.5 text-right align-middle">
                    <span className="text-xs font-semibold text-purple-700">{fmtMoney(gtri)}</span>
                </td>
                <td className="px-3 py-2.5 text-center align-middle">
                    <StockBadge qty={qty} min={mucTonToiThieu} />
                </td>
                <td className="px-3 py-2.5 text-center align-middle">
                    <button onClick={() => setModal(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200"
                        title="Xem lô hàng">
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </td>
            </tr>
            <LoHangModal
                isOpen={modal}
                onClose={() => setModal(false)}
                bienThe={{ ...bt, bienTheId: bt.id }}
                khoId={khoId}
            />
        </>
    );
}

// ─── Row: Sản phẩm (Level 2) ──────────────────────────────────────────────────
function SanPhamRow({ sp, tonKhoMap, khoId, trangThaiFilter, keyword }) {
    const [expanded, setExpanded] = useState(false);

    const bienThes = (sp.bienTheSanPhams ?? []).map((bt) => {
        const tk = tonKhoMap[bt.id] ?? {};
        return {
            ...bt,
            tenMau: bt.mauSac?.tenMau ?? "—",
            maMauHex: bt.mauSac?.maMauHex,
            tenSize: bt.size?.tenSize ?? "—",
            tenChatLieu: bt.chatLieu?.tenChatLieu ?? "—",
            tongSoLuongTon: tk.tongSoLuongTon ?? 0,
            tongSoLuongDaDat: tk.tongSoLuongDaDat ?? 0,
            tongSoLuongKhaDung: tk.tongSoLuongKhaDung ?? 0,
            giaTriTonKho: tk.giaTriTonKho ?? 0,
        };
    });

    // Filter variants
    const filteredBTs = bienThes.filter((bt) => {
        if (trangThaiFilter === "ALL") return true;
        const qty = Number(bt.tongSoLuongTon), min = Number(sp.mucTonToiThieu ?? 0);
        if (trangThaiFilter === "het") return qty === 0;
        if (trangThaiFilter === "saphet") return qty > 0 && qty <= min;
        if (trangThaiFilter === "con") return qty > min;
        return true;
    });

    const totalTon = bienThes.reduce((s, b) => s + Number(b.tongSoLuongTon), 0);
    const totalDat = bienThes.reduce((s, b) => s + Number(b.tongSoLuongDaDat), 0);
    const totalKha = bienThes.reduce((s, b) => s + Number(b.tongSoLuongKhaDung), 0);
    const totalGtri = bienThes.reduce((s, b) => s + Number(b.giaTriTonKho), 0);

    const hetCount = bienThes.filter((b) => Number(b.tongSoLuongTon) === 0).length;
    const sapCount = bienThes.filter((b) => {
        const q = Number(b.tongSoLuongTon), m = Number(sp.mucTonToiThieu ?? 0);
        return q > 0 && q <= m;
    }).length;

    return (
        <>
            <tr
                className={`transition-colors cursor-pointer ${expanded ? "bg-amber-50/60" : "hover:bg-slate-50/80"}`}
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Level 2 indent */}
                <td className="py-3 align-middle">
                    <div className="flex items-center" style={{ paddingLeft: "40px" }}>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-3">
                            <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                            <ExpandBtn expanded={expanded} size="sm" onClick={() => setExpanded((v) => !v)} />
                            <Package size={14} className={`flex-shrink-0 ${expanded ? "text-amber-600" : "text-slate-400"}`} />
                            <div className="min-w-0">
                                <span className="text-sm font-semibold text-slate-800 truncate block">{sp.tenSanPham}</span>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-[10px] font-mono text-slate-400">{sp.maSanPham}</span>
                                    {sp.danhMuc?.tenDanhMuc && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-medium">{sp.danhMuc.tenDanhMuc}</span>
                                    )}
                                    <span className="text-[10px] text-slate-400">{bienThes.length} biến thể</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3 text-right text-sm font-bold text-slate-900 align-middle">{fmt(totalTon)}</td>
                <td className="px-3 py-3 text-right text-sm text-amber-600 font-semibold align-middle">{fmt(totalDat)}</td>
                <td className="px-3 py-3 text-right text-sm text-emerald-700 font-bold align-middle">{fmt(totalKha)}</td>
                <td className="px-3 py-3 text-right align-middle">
                    <span className="text-sm font-bold text-purple-700">{fmtMoney(totalGtri)}</span>
                </td>
                <td className="px-3 py-3 text-center align-middle">
                    <div className="flex flex-col items-center gap-1">
                        {hetCount > 0 && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 rounded-full px-1.5 py-0.5">{hetCount} hết</span>
                        )}
                        {sapCount > 0 && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5">{sapCount} sắp hết</span>
                        )}
                        {hetCount === 0 && sapCount === 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5">Bình thường</span>
                        )}
                    </div>
                </td>
                <td className="px-3 py-3 text-center align-middle" />
            </tr>
            {expanded && (
                filteredBTs.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="py-3 text-xs text-slate-400 italic" style={{ paddingLeft: "96px" }}>
                            Không có biến thể phù hợp bộ lọc
                        </td>
                    </tr>
                ) : filteredBTs.map((bt) => (
                    <BienTheRow
                        key={bt.id}
                        bt={bt}
                        mucTonToiThieu={sp.mucTonToiThieu}
                        khoId={khoId}
                    />
                ))
            )}
        </>
    );
}

// ─── Row: Kho (Level 1) ───────────────────────────────────────────────────────
function KhoRow({ kho, sanPhams, tonKhoMap, keyword, trangThaiFilter }) {
    const [expanded, setExpanded] = useState(false);

    // Filter products based on keyword
    const filteredSPs = sanPhams.filter((sp) => {
        const q = keyword.toLowerCase();
        if (!q) return true;
        return (
            sp.tenSanPham?.toLowerCase().includes(q) ||
            sp.maSanPham?.toLowerCase().includes(q) ||
            (sp.bienTheSanPhams ?? []).some((bt) =>
                bt.maSku?.toLowerCase().includes(q) || bt.tenBienThe?.toLowerCase().includes(q)
            )
        );
    }).filter((sp) => {
        if (trangThaiFilter === "ALL") return true;
        return (sp.bienTheSanPhams ?? []).some((bt) => {
            const tk = tonKhoMap[bt.id] ?? {};
            const qty = Number(tk.tongSoLuongTon ?? 0);
            const min = Number(sp.mucTonToiThieu ?? 0);
            if (trangThaiFilter === "het") return qty === 0;
            if (trangThaiFilter === "saphet") return qty > 0 && qty <= min;
            if (trangThaiFilter === "con") return qty > min;
            return true;
        });
    });

    // Kho aggregates from all products (unfiltered)
    let totalTon = 0, totalDat = 0, totalKha = 0, totalGtri = 0;
    let hetCount = 0, sapCount = 0, bienTheCount = 0;
    for (const sp of sanPhams) {
        for (const bt of sp.bienTheSanPhams ?? []) {
            const tk = tonKhoMap[bt.id] ?? {};
            const qty = Number(tk.tongSoLuongTon ?? 0);
            const min = Number(sp.mucTonToiThieu ?? 0);
            totalTon += qty;
            totalDat += Number(tk.tongSoLuongDaDat ?? 0);
            totalKha += Number(tk.tongSoLuongKhaDung ?? 0);
            totalGtri += Number(tk.giaTriTonKho ?? 0);
            bienTheCount++;
            if (qty === 0) hetCount++;
            else if (qty <= min) sapCount++;
        }
    }

    return (
        <>
            {/* KHO ROW — dark header style */}
            <tr
                className={`cursor-pointer border-t-2 border-slate-600 transition-colors ${expanded ? "bg-slate-800" : "bg-slate-700 hover:bg-slate-750"}`}
                style={{ backgroundColor: expanded ? "#1e293b" : "#334155" }}
                onClick={() => setExpanded((v) => !v)}
            >
                <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3">
                        <ExpandBtn
                            expanded={expanded}
                            onClick={() => setExpanded((v) => !v)}
                        />
                        <Warehouse size={16} className={`flex-shrink-0 ${expanded ? "text-amber-400" : "text-slate-300"}`} />
                        <div className="min-w-0">
                            <span className="text-sm font-bold text-white block">{kho.tenKho}</span>
                            <div className="flex items-center gap-3 mt-0.5">
                                {kho.maKho && <span className="text-[10px] font-mono text-slate-400">{kho.maKho}</span>}
                                <span className="text-[11px] text-slate-400">{sanPhams.length} sản phẩm</span>
                                <span className="text-[11px] text-slate-500">·</span>
                                <span className="text-[11px] text-slate-400">{bienTheCount} biến thể</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-4 text-right text-sm font-bold text-white align-middle">{fmt(totalTon)}</td>
                <td className="px-3 py-4 text-right text-sm text-amber-300 font-semibold align-middle">{fmt(totalDat)}</td>
                <td className="px-3 py-4 text-right text-sm text-emerald-400 font-bold align-middle">{fmt(totalKha)}</td>
                <td className="px-3 py-4 text-right align-middle">
                    <span className="text-sm font-bold text-purple-300">{fmtMoney(totalGtri)}</span>
                </td>
                <td className="px-3 py-4 text-center align-middle">
                    <div className="flex flex-col items-center gap-1">
                        {hetCount > 0 && (
                            <span className="text-[10px] font-bold text-rose-300 bg-rose-900/50 rounded-full px-2 py-0.5">{hetCount} hết hàng</span>
                        )}
                        {sapCount > 0 && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-900/40 rounded-full px-2 py-0.5">{sapCount} sắp hết</span>
                        )}
                        {hetCount === 0 && sapCount === 0 && (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/40 rounded-full px-2 py-0.5">Bình thường</span>
                        )}
                    </div>
                </td>
                <td className="px-3 py-4 align-middle" />
            </tr>

            {/* Product rows — expanded */}
            {expanded && (
                filteredSPs.length === 0 ? (
                    <tr className="bg-slate-50">
                        <td colSpan={7} className="py-4 text-sm text-slate-400 italic" style={{ paddingLeft: "44px" }}>
                            Không có sản phẩm phù hợp bộ lọc
                        </td>
                    </tr>
                ) : filteredSPs.map((sp) => (
                    <SanPhamRow
                        key={sp.id}
                        sp={sp}
                        tonKhoMap={tonKhoMap}
                        khoId={kho.id}
                        trangThaiFilter={trangThaiFilter}
                        keyword={keyword}
                    />
                ))
            )}
        </>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function BaoCaoTonKho() {
    const [userId, setUserId] = useState(null);

    const [khoList, setKhoList] = useState([]);
    const [loadingKho, setLoadingKho] = useState(false);

    // key: khoId → [sanPham]
    const [allSanPham, setAllSanPham] = useState({});
    // key: khoId → { bienTheId → tonKho }
    const [allTonKho, setAllTonKho] = useState({});
    const [loadingData, setLoadingData] = useState(false);

    const [keyword, setKeyword] = useState("");
    const [trangThaiFilter, setTrangThaiFilter] = useState("ALL");
    const [error, setError] = useState(null);

    // ── JWT ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const claims = parseJwt(token);
        if (claims?.id) setUserId(claims.id);
    }, []);

    // ── Load kho list ────────────────────────────────────────────────────
    useEffect(() => {
        if (!userId) return;
        setLoadingKho(true);
        apiClient
            .get(`/api/v1/nguoi-dung/get-by-id/${userId}`)
            .then((res) => {
                const nd = res.data?.data;
                if (shouldSeeAll(nd?.vaiTro)) {
                    return apiClient.get("/api/v1/kho/all").then((r) => setKhoList(r.data?.data ?? []));
                } else {
                    const khos = (nd?.khoPhuTrach ?? [])
                        .filter((p) => p.trangThai === 1)
                        .map((p) => p.kho)
                        .filter(Boolean);
                    setKhoList(khos);
                }
            })
            .catch(() => setError("Không thể tải thông tin người dùng."))
            .finally(() => setLoadingKho(false));
    }, [userId]);

    // ── Load data for all khos in parallel ──────────────────────────────
    const loadData = useCallback(async () => {
        if (!khoList.length) return;
        setLoadingData(true);
        try {
            const results = await Promise.all(
                khoList.map(async (kho) => {
                    const [spRes, tkRes] = await Promise.all([
                        apiClient.get(`/api/v1/san-pham-quan-ao/theo-kho/${kho.id}`).catch(() => ({ data: { data: [] } })),
                        apiClient.get(`/api/v1/thong-ke-he-thong/ton-kho`, { headers: { kho_id: kho.id } }).catch(() => ({ data: { data: [] } })),
                    ]);
                    const sanPhams = spRes.data?.data ?? [];
                    const tonKhoArr = tkRes.data?.data ?? [];
                    const tonKhoMap = {};
                    for (const tk of tonKhoArr) tonKhoMap[tk.bienTheId] = tk;
                    return { khoId: kho.id, sanPhams, tonKhoMap };
                })
            );
            const newSP = {}, newTK = {};
            for (const { khoId, sanPhams, tonKhoMap } of results) {
                newSP[khoId] = sanPhams;
                newTK[khoId] = tonKhoMap;
            }
            setAllSanPham(newSP);
            setAllTonKho(newTK);
        } catch {
            setError("Không thể tải dữ liệu tồn kho.");
        } finally {
            setLoadingData(false);
        }
    }, [khoList]);

    useEffect(() => { loadData(); }, [khoList]);

    // ── Global stats ─────────────────────────────────────────────────────
    let gTongBienThe = 0, gTongGiaTri = 0, gHet = 0, gSap = 0;
    for (const kho of khoList) {
        const sps = allSanPham[kho.id] ?? [];
        const tkMap = allTonKho[kho.id] ?? {};
        for (const sp of sps) {
            for (const bt of sp.bienTheSanPhams ?? []) {
                const tk = tkMap[bt.id] ?? {};
                const qty = Number(tk.tongSoLuongTon ?? 0);
                const min = Number(sp.mucTonToiThieu ?? 0);
                gTongBienThe++;
                gTongGiaTri += Number(tk.giaTriTonKho ?? 0);
                if (qty === 0) gHet++;
                else if (qty <= min) gSap++;
            }
        }
    }

    // Footer totals
    const gTotalTon = Object.values(allTonKho).reduce((sum, tkMap) =>
        sum + Object.values(tkMap).reduce((s, tk) => s + Number(tk.tongSoLuongTon ?? 0), 0), 0);
    const gTotalDat = Object.values(allTonKho).reduce((sum, tkMap) =>
        sum + Object.values(tkMap).reduce((s, tk) => s + Number(tk.tongSoLuongDaDat ?? 0), 0), 0);
    const gTotalKha = Object.values(allTonKho).reduce((sum, tkMap) =>
        sum + Object.values(tkMap).reduce((s, tk) => s + Number(tk.tongSoLuongKhaDung ?? 0), 0), 0);

    const isLoading = loadingKho || loadingData;

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Package size={20} className="text-purple-600" />
                        Báo cáo tồn kho
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Xem tồn kho theo Kho → Sản phẩm → Biến thể</p>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
            )}

            {/* ══ KPI CARDS ════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={Warehouse} label="Tổng kho" value={fmt(khoList.length)}
                    sub="Kho đang quản lý"
                    colorClass="text-indigo-700" bgClass="bg-indigo-100" borderClass="border-indigo-100" />
                <KpiCard icon={Package} label="Giá trị tồn kho" value={fmtMoney(gTongGiaTri)}
                    sub={`${fmt(gTongBienThe)} biến thể`}
                    colorClass="text-purple-700" bgClass="bg-purple-100" borderClass="border-purple-100" />
                <KpiCard icon={AlertTriangle} label="Sắp hết hàng" value={fmt(gSap)}
                    sub={gTongBienThe > 0 ? `${Math.round((gSap / gTongBienThe) * 100)}% tổng biến thể` : "—"}
                    colorClass="text-amber-700" bgClass="bg-amber-100" borderClass="border-amber-100" />
                <KpiCard icon={TrendingDown} label="Hết hàng" value={fmt(gHet)}
                    sub={gTongBienThe > 0 ? `${Math.round((gHet / gTongBienThe) * 100)}% tổng biến thể` : "—"}
                    colorClass="text-rose-700" bgClass="bg-rose-100" borderClass="border-rose-100" />
            </div>

            {/* ══ FILTER BAR ═══════════════════════════════════════════════════ */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={14} className="text-purple-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bộ lọc</span>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* Status tabs */}
                        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                            {[
                                { key: "ALL", label: "Tất cả" },
                                { key: "con", label: "Còn hàng" },
                                { key: "saphet", label: "Sắp hết" },
                                { key: "het", label: "Hết hàng" },
                            ].map(({ key, label }) => (
                                <button key={key}
                                    onClick={() => setTrangThaiFilter(key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border-0 ${trangThaiFilter === key
                                        ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700 bg-transparent"}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Keyword */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                            <Input
                                placeholder="Tìm tên SP, SKU, mã SP..."
                                className="pl-9 border-slate-200 text-slate-700 h-10 text-sm w-[260px]"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                            />
                        </div>

                        {/* Reload */}
                        <Button onClick={loadData} disabled={isLoading}
                            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 h-10 px-5 shadow-md transition-all duration-150 gap-2">
                            {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                            Tải lại
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ══ TREE TABLE ═══════════════════════════════════════════════════ */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                    <Loader2 className="h-7 w-7 animate-spin text-purple-600" />
                    <span>Đang tải dữ liệu tồn kho...</span>
                </div>
            ) : khoList.length === 0 ? (
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex flex-col items-center justify-center py-16">
                    <Warehouse className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">Không có kho nào được phân quyền</p>
                </div>
            ) : (
                <Card className="border-0 shadow-md bg-white overflow-hidden">
                    <CardHeader className="pb-3 pt-5 px-6">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-800">Danh sách tồn kho</CardTitle>
                                <CardDescription className="text-xs text-slate-400 mt-1">
                                    Nhấn <span className="font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded text-[10px]">+</span> để mở rộng kho và sản phẩm · Di chuột vào biến thể để xem lô hàng
                                </CardDescription>
                            </div>
                            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                                {khoList.length} kho · {gTongBienThe} biến thể
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-y border-slate-200 bg-slate-50/80">
                                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide min-w-[320px]">
                                            Kho / Sản phẩm / Biến thể
                                        </th>
                                        <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Tổng tồn</th>
                                        <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Đã đặt</th>
                                        <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Khả dụng</th>
                                        <th className="px-3 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">Giá trị tồn</th>
                                        <th className="px-3 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Trạng thái</th>
                                        <th className="px-3 py-3 w-10" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {khoList.map((kho) => (
                                        <KhoRow
                                            key={kho.id}
                                            kho={kho}
                                            sanPhams={allSanPham[kho.id] ?? []}
                                            tonKhoMap={allTonKho[kho.id] ?? {}}
                                            keyword={keyword}
                                            trangThaiFilter={trangThaiFilter}
                                        />
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                                        <td className="px-4 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide">
                                            Tổng cộng — {khoList.length} kho
                                        </td>
                                        <td className="px-3 py-4 text-right text-sm font-extrabold text-slate-800">{fmt(gTotalTon)}</td>
                                        <td className="px-3 py-4 text-right text-sm font-extrabold text-amber-600">{fmt(gTotalDat)}</td>
                                        <td className="px-3 py-4 text-right text-sm font-extrabold text-emerald-700">{fmt(gTotalKha)}</td>
                                        <td className="px-3 py-4 text-right">
                                            <span className="text-sm font-extrabold text-purple-700">{fmtMoney(gTongGiaTri)}</span>
                                        </td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}