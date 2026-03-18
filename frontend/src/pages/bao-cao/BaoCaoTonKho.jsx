import { useState, useEffect, useCallback } from "react";
import apiClient from "../../services/apiClient";
import {
    Loader2, Plus, Minus, RefreshCw, Search,
    Warehouse, Package, Layers, TrendingDown, AlertTriangle,
    Box, ChevronRight, X, Filter,
    ChevronDown, ChevronLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function parseJwt(token) {
    try { const b = token.split(".")[1]; return JSON.parse(atob(b.replace(/-/g, "+").replace(/_/g, "/"))); }
    catch { return null; }
}
const ROLES_SEE_ALL = ["quan_tri_vien", "admin", "quan_ly_kho", "nhan_vien_mua_hang", "nhan_vien_ban_hang"];
function shouldSeeAll(vaiTro) {
    if (!vaiTro) return false;
    const roles = vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
    return roles.some(r => ROLES_SEE_ALL.includes(r));
}
const fmt = n => n != null ? Number(n).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) : "—";
const fmtMoney = n => {
    if (n == null) return "—";
    const num = Number(n);
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " tr ₫";
    return num.toLocaleString("vi-VN") + " ₫";
};
const fmtMoneyFull = n => n != null ? Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }) : "—";

function StockBadge({ qty, min }) {
    const q = Number(qty ?? 0), m = Number(min ?? 0);
    if (q === 0) return <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Hết hàng</span>;
    if (m > 0 && q <= m) return <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Sắp hết</span>;
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Còn hàng</span>;
}

function ExpandBtn({ expanded, onClick, size = "md" }) {
    const s = size === "sm" ? "h-5 w-5" : "h-6 w-6", ic = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
    return (
        <button onClick={e => { e.stopPropagation(); onClick(e); }}
            className={`${s} flex items-center justify-center rounded border transition-all duration-150 flex-shrink-0 ${expanded ? "bg-yellow-500 border-yellow-500 text-white shadow-sm" : "bg-white border-gray-300 text-gray-500 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50"}`}>
            {expanded ? <Minus className={ic} /> : <Plus className={ic} />}
        </button>
    );
}

function KpiCard({ icon: Icon, label, value, sub, colorClass, bgClass }) {
    return (
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/95 ring-1 ring-white/60">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                        {sub && <p className="text-xs font-medium text-gray-400 mt-1">{sub}</p>}
                    </div>
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${bgClass}`}>
                        <Icon className={`h-6 w-6 ${colorClass}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Modal dùng _tonKhoRaw đã fetch sẵn — KHÔNG gọi API lại
function LoHangModal({ isOpen, onClose, bienThe }) {
    if (!isOpen || !bienThe) return null;
    const data = bienThe._tonKhoRaw ?? [];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border-none shadow-2xl overflow-hidden" style={{ background: "#faf7f0", color: "#0f172a" }}>
                <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "#ede8db" }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-semibold" style={{ color: "#0f172a" }}>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0" style={{ background: "#fef9c3" }}>
                                    <Box className="w-4 h-4" style={{ color: "#ca8a04" }} />
                                </div>
                                Chi tiết lô hàng — {bienThe?.tenBienThe ?? bienThe?.maSku}
                            </h2>
                            <p className="text-sm mt-1 ml-10" style={{ color: "#64748b" }}>SKU: <span className="font-mono text-yellow-700">{bienThe?.maSku}</span></p>
                        </div>
                        <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-6">
                    {data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Layers className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm">Không có dữ liệu lô hàng cho biến thể này</p>
                        </div>
                    ) : data.map((tk, i) => (
                        <div key={i} className="mb-6 last:mb-0">
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {[
                                    { label: "Tổng tồn", val: fmt(tk.tongSoLuongTon), color: "text-slate-900", bg: "bg-white" },
                                    { label: "Đã đặt", val: fmt(tk.tongSoLuongDaDat), color: "text-amber-600", bg: "bg-amber-50" },
                                    { label: "Khả dụng", val: fmt(tk.tongSoLuongKhaDung), color: "text-emerald-600", bg: "bg-emerald-50" },
                                    { label: "Giá trị tồn", val: fmtMoney(tk.giaTriTonKho), color: "text-purple-700", bg: "bg-purple-50" },
                                ].map(s => (
                                    <div key={s.label} className={`rounded-xl border border-slate-200 p-3 text-center shadow-sm ${s.bg}`}>
                                        <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            {tk.danhSachLoHang?.length > 0 && (
                                <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                {["Mã lô", "Nhà CC", "Ngày SX", "Tồn", "Đã đặt", "Khả dụng", "Giá vốn"].map(h => (
                                                    <th key={h} className="px-3 py-3 text-left font-semibold text-slate-600 uppercase tracking-wide text-[10px]">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {tk.danhSachLoHang.map((lo, j) => (
                                                <tr key={j} className="hover:bg-yellow-50/50 transition-colors">
                                                    <td className="px-3 py-3 font-semibold text-yellow-700">{lo.maLo}</td>
                                                    <td className="px-3 py-3 text-slate-700">{lo.tenNhaCungCap ?? "—"}</td>
                                                    <td className="px-3 py-3 text-slate-500">{lo.ngaySanXuat ? new Date(lo.ngaySanXuat).toLocaleDateString("vi-VN") : "—"}</td>
                                                    <td className="px-3 py-3 text-right font-bold text-slate-700">{fmt(lo.soLuongTon)}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-amber-600">{fmt(lo.soLuongDaDat)}</td>
                                                    <td className="px-3 py-3 text-right font-medium text-emerald-600">{fmt(lo.soLuongKhaDung)}</td>
                                                    <td className="px-3 py-3 text-right font-semibold text-slate-700">{fmtMoneyFull(lo.giaVonLo)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {(tk.ngayNhapGanNhat || tk.ngayXuatGanNhat) && (
                                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                                    {tk.ngayNhapGanNhat && <span>Nhập gần nhất: <b className="text-slate-600">{new Date(tk.ngayNhapGanNhat).toLocaleDateString("vi-VN")}</b></span>}
                                    {tk.ngayXuatGanNhat && <span>Xuất gần nhất: <b className="text-slate-600">{new Date(tk.ngayXuatGanNhat).toLocaleDateString("vi-VN")}</b></span>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Level 3: Biến thể ────────────────────────────────────────────────────────
function BienTheRow({ bt, mucTonToiThieu }) {
    const [modal, setModal] = useState(false);
    const qty = Number(bt.tongSoLuongTon ?? 0), dat = Number(bt.tongSoLuongDaDat ?? 0);
    const kha = Number(bt.tongSoLuongKhaDung ?? 0), gtri = Number(bt.giaTriTonKho ?? 0);
    const attrs = [bt.tenMau !== "—" ? bt.tenMau : null, bt.tenSize !== "—" ? bt.tenSize : null, bt.tenChatLieu !== "—" ? bt.tenChatLieu : null].filter(Boolean).join(" · ");
    const SK = () => <span className="inline-block h-4 w-10 rounded bg-slate-100 animate-pulse align-middle" />;
    return (
        <>
            <tr className="hover:bg-yellow-50/50 transition-colors group">
                <td className="py-2.5 align-middle">
                    <div className="flex items-center" style={{ paddingLeft: "80px" }}>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                            <div className="w-4 h-px bg-slate-200 flex-shrink-0" />
                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
                                {bt.maMauHex && <span style={{ background: bt.maMauHex }} className="h-3 w-3 rounded-full border border-slate-200 flex-shrink-0" />}
                                <div className="min-w-0">
                                    <span className="text-xs font-mono font-bold text-yellow-600 block tracking-wide">{bt.maSku}</span>
                                    <span className="text-xs text-slate-600 truncate block font-medium mt-0.5">{attrs || bt.tenBienThe}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-800 align-middle">{bt._loading ? <SK /> : fmt(qty)}</td>
                <td className="px-4 py-2.5 text-right text-sm text-amber-600 font-semibold align-middle">{bt._loading ? <SK /> : fmt(dat)}</td>
                <td className="px-4 py-2.5 text-right text-sm text-emerald-600 font-bold align-middle">{bt._loading ? <SK /> : fmt(kha)}</td>
                <td className="px-4 py-2.5 text-right align-middle">{bt._loading ? <SK /> : <span className="text-sm font-semibold text-slate-700">{fmtMoney(gtri)}</span>}</td>
                <td className="px-4 py-2.5 text-center align-middle">
                    {bt._loading ? <span className="inline-block h-5 w-16 rounded-full bg-slate-100 animate-pulse" /> : <StockBadge qty={qty} min={mucTonToiThieu} />}
                </td>
                <td className="px-4 py-2.5 text-center align-middle">
                    <button disabled={bt._loading} onClick={() => setModal(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex h-8 w-8 items-center justify-center rounded-lg text-yellow-600 hover:bg-yellow-100 border border-transparent hover:border-yellow-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Xem chi tiết lô hàng">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </td>
            </tr>
            <LoHangModal isOpen={modal} onClose={() => setModal(false)} bienThe={bt} />
        </>
    );
}

// ─── Level 2: Sản phẩm ───────────────────────────────────────────────────────
function SanPhamRow({ sp, tonKhoMap, trangThaiFilter }) {
    const [expanded, setExpanded] = useState(false);
    const bienThes = (sp.bienTheSanPhams ?? []).map(bt => {
        const tk = tonKhoMap[bt.id] ?? {};
        return {
            ...bt,
            tenMau: bt.mauSac?.tenMau ?? "—", maMauHex: bt.mauSac?.maMauHex,
            tenSize: bt.size?.tenSize ?? "—", tenChatLieu: bt.chatLieu?.tenChatLieu ?? "—",
            tongSoLuongTon: tk.tongSoLuongTon ?? 0, tongSoLuongDaDat: tk.tongSoLuongDaDat ?? 0,
            tongSoLuongKhaDung: tk.tongSoLuongKhaDung ?? 0, giaTriTonKho: tk.giaTriTonKho ?? 0,
            _tonKhoRaw: tk._tonKhoRaw ?? [], _loading: tk._loading ?? false,
        };
    });
    const filteredBTs = bienThes.filter(bt => {
        if (trangThaiFilter === "ALL") return true;
        const qty = Number(bt.tongSoLuongTon), min = Number(sp.mucTonToiThieu ?? 0);
        if (trangThaiFilter === "het") return qty === 0;
        if (trangThaiFilter === "saphet") return qty > 0 && min > 0 && qty <= min;
        if (trangThaiFilter === "con") return qty > (min > 0 ? min : 0);
        return true;
    });
    const totalTon = bienThes.reduce((s, b) => s + Number(b.tongSoLuongTon), 0);
    const totalDat = bienThes.reduce((s, b) => s + Number(b.tongSoLuongDaDat), 0);
    const totalKha = bienThes.reduce((s, b) => s + Number(b.tongSoLuongKhaDung), 0);
    const totalGtri = bienThes.reduce((s, b) => s + Number(b.giaTriTonKho), 0);
    const hetCount = bienThes.filter(b => !b._loading && Number(b.tongSoLuongTon) === 0).length;
    const sapCount = bienThes.filter(b => { const q = Number(b.tongSoLuongTon), m = Number(sp.mucTonToiThieu ?? 0); return !b._loading && q > 0 && m > 0 && q <= m; }).length;
    const stillLoading = bienThes.some(b => b._loading);
    const SK = () => <span className="inline-block h-4 w-10 rounded bg-slate-100 animate-pulse" />;
    return (
        <>
            <tr className={`transition-colors cursor-pointer border-b border-slate-50 ${expanded ? "bg-yellow-50/30" : "hover:bg-slate-50"}`} onClick={() => setExpanded(v => !v)}>
                <td className="py-3.5 align-middle">
                    <div className="flex items-center" style={{ paddingLeft: "40px" }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                            <div className="w-px h-8 bg-slate-200 flex-shrink-0" />
                            <ExpandBtn expanded={expanded} size="sm" onClick={() => setExpanded(v => !v)} />
                            <Package size={16} className={`flex-shrink-0 ${expanded ? "text-yellow-600" : "text-slate-400"}`} />
                            <div className="min-w-0">
                                <span className="text-sm font-bold text-slate-900 truncate block">{sp.tenSanPham}</span>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-[11px] font-mono text-slate-500">{sp.maSanPham}</span>
                                    {sp.danhMuc?.tenDanhMuc && <span className="text-[10px] bg-slate-100 text-slate-600 rounded-md px-1.5 py-0.5 font-semibold">{sp.danhMuc.tenDanhMuc}</span>}
                                    <span className="text-[11px] text-slate-400 font-medium">· {bienThes.length} biến thể</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3.5 text-right text-sm font-extrabold text-slate-900 align-middle">{stillLoading ? <SK /> : fmt(totalTon)}</td>
                <td className="px-4 py-3.5 text-right text-sm text-amber-600 font-bold align-middle">{stillLoading ? <SK /> : fmt(totalDat)}</td>
                <td className="px-4 py-3.5 text-right text-sm text-emerald-600 font-extrabold align-middle">{stillLoading ? <SK /> : fmt(totalKha)}</td>
                <td className="px-4 py-3.5 text-right align-middle">{stillLoading ? <SK /> : <span className="text-sm font-bold text-slate-800">{fmtMoney(totalGtri)}</span>}</td>
                <td className="px-4 py-3.5 text-center align-middle">
                    {stillLoading ? <span className="inline-block h-5 w-20 rounded-full bg-slate-100 animate-pulse" /> : (
                        <div className="flex flex-col items-center gap-1">
                            {hetCount > 0 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">{hetCount} hết</span>}
                            {sapCount > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">{sapCount} sắp hết</span>}
                            {hetCount === 0 && sapCount === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">Bình thường</span>}
                        </div>
                    )}
                </td>
                <td className="px-4 py-3.5 text-center align-middle" />
            </tr>
            {expanded && (filteredBTs.length === 0 ? (
                <tr><td colSpan={7} className="py-4 text-sm text-slate-400 italic bg-slate-50/50" style={{ paddingLeft: "96px" }}>Không có biến thể phù hợp với bộ lọc.</td></tr>
            ) : filteredBTs.map(bt => (
                <BienTheRow key={bt.id} bt={bt} mucTonToiThieu={sp.mucTonToiThieu} />
            )))}
        </>
    );
}

// ─── Level 1: Kho ─────────────────────────────────────────────────────────────
function KhoRow({ kho, sanPhams, tonKhoMap, keyword, trangThaiFilter }) {
    const [expanded, setExpanded] = useState(false);
    const filteredSPs = sanPhams.filter(sp => {
        const q = keyword.toLowerCase();
        if (q && !sp.tenSanPham?.toLowerCase().includes(q) && !sp.maSanPham?.toLowerCase().includes(q) && !(sp.bienTheSanPhams ?? []).some(bt => bt.maSku?.toLowerCase().includes(q) || bt.tenBienThe?.toLowerCase().includes(q))) return false;
        if (trangThaiFilter === "ALL") return true;
        return (sp.bienTheSanPhams ?? []).some(bt => {
            const tk = tonKhoMap[bt.id] ?? {}, qty = Number(tk.tongSoLuongTon ?? 0), min = Number(sp.mucTonToiThieu ?? 0);
            if (trangThaiFilter === "het") return qty === 0;
            if (trangThaiFilter === "saphet") return qty > 0 && min > 0 && qty <= min;
            if (trangThaiFilter === "con") return qty > (min > 0 ? min : 0);
            return true;
        });
    });
    let totalTon = 0, totalDat = 0, totalKha = 0, totalGtri = 0, hetCount = 0, sapCount = 0, bienTheCount = 0, anyLoading = false;
    for (const sp of sanPhams) {
        for (const bt of sp.bienTheSanPhams ?? []) {
            const tk = tonKhoMap[bt.id] ?? {};
            if (tk._loading) anyLoading = true;
            const qty = Number(tk.tongSoLuongTon ?? 0), min = Number(sp.mucTonToiThieu ?? 0);
            totalTon += qty; totalDat += Number(tk.tongSoLuongDaDat ?? 0);
            totalKha += Number(tk.tongSoLuongKhaDung ?? 0); totalGtri += Number(tk.giaTriTonKho ?? 0);
            bienTheCount++;
            if (!tk._loading) { if (qty === 0) hetCount++; else if (min > 0 && qty <= min) sapCount++; }
        }
    }
    const SK = () => <span className="inline-block h-4 w-10 rounded bg-slate-100 animate-pulse" />;
    return (
        <>
            <tr className={`cursor-pointer border-y border-slate-200 transition-all duration-200 ${expanded ? "bg-yellow-50/60" : "bg-white hover:bg-slate-50"}`} onClick={() => setExpanded(v => !v)}>
                <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-3">
                        <ExpandBtn expanded={expanded} onClick={() => setExpanded(v => !v)} />
                        <div className={`p-1.5 rounded-lg ${expanded ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-500"}`}><Warehouse size={18} className="flex-shrink-0" /></div>
                        <div className="min-w-0">
                            <span className="text-sm font-bold text-slate-900 block">{kho.tenKho}</span>
                            <div className="flex items-center gap-3 mt-1">
                                {kho.maKho && <span className="text-[11px] font-mono font-bold text-yellow-700 bg-yellow-100/50 border border-yellow-200/50 px-1.5 py-0.5 rounded">{kho.maKho}</span>}
                                <span className="text-[11px] text-slate-600 font-medium">{sanPhams.length} sản phẩm</span>
                                <span className="text-[11px] text-slate-300">·</span>
                                <span className="text-[11px] text-slate-600 font-medium">{bienTheCount} biến thể</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-4 text-right text-sm font-extrabold text-slate-900 align-middle">{anyLoading ? <SK /> : fmt(totalTon)}</td>
                <td className="px-4 py-4 text-right text-sm text-amber-600 font-bold align-middle">{anyLoading ? <SK /> : fmt(totalDat)}</td>
                <td className="px-4 py-4 text-right text-sm text-emerald-600 font-extrabold align-middle">{anyLoading ? <SK /> : fmt(totalKha)}</td>
                <td className="px-4 py-4 text-right align-middle">{anyLoading ? <SK /> : <span className="text-sm font-bold text-slate-800">{fmtMoney(totalGtri)}</span>}</td>
                <td className="px-4 py-4 text-center align-middle">
                    {anyLoading ? <span className="inline-block h-5 w-20 rounded-full bg-slate-100 animate-pulse" /> : (
                        <div className="flex flex-col items-center gap-1.5">
                            {hetCount > 0 && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2.5 py-0.5 shadow-sm">{hetCount} hết</span>}
                            {sapCount > 0 && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5 shadow-sm">{sapCount} sắp hết</span>}
                            {hetCount === 0 && sapCount === 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5 shadow-sm">Bình thường</span>}
                        </div>
                    )}
                </td>
                <td className="px-4 py-4 align-middle" />
            </tr>
            {expanded && (filteredSPs.length === 0 ? (
                <tr className="bg-slate-50 border-b border-slate-100"><td colSpan={7} className="py-6 text-sm text-slate-500 italic text-center">Không tìm thấy dữ liệu trong kho này phù hợp với bộ lọc.</td></tr>
            ) : filteredSPs.map(sp => (
                <SanPhamRow key={sp.id} sp={sp} tonKhoMap={tonKhoMap} trangThaiFilter={trangThaiFilter} keyword={keyword} />
            )))}
        </>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function BaoCaoTonKho() {
    const [userId, setUserId] = useState(null);
    const [khoList, setKhoList] = useState([]);
    const [loadingKho, setLoadingKho] = useState(false);
    // { [khoId]: SanPhamDto[] }
    const [allSanPham, setAllSanPham] = useState({});
    // { [khoId]: { [bienTheId]: { tongSoLuongTon, tongSoLuongDaDat, tongSoLuongKhaDung, giaTriTonKho, _tonKhoRaw, _loading } } }
    const [allTonKho, setAllTonKho] = useState({});
    const [loadingData, setLoadingData] = useState(false);
    const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });
    const [keyword, setKeyword] = useState("");
    const [trangThaiFilter, setTrangThaiFilter] = useState("ALL");
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);

    // STEP 0
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const c = parseJwt(token);
        if (c?.id) setUserId(c.id);
    }, []);

    // STEP 1: GET /nguoi-dung/get-by-id/{id} → quyết định nguồn kho
    useEffect(() => {
        if (!userId) return;
        setLoadingKho(true); setError(null);
        apiClient.get(`/api/v1/nguoi-dung/get-by-id/${userId}`)
            .then(res => {
                const nd = res.data?.data;
                if (shouldSeeAll(nd?.vaiTro)) {
                    return apiClient.get("/api/v1/kho/all").then(r => setKhoList(r.data?.data ?? []));
                } else {
                    setKhoList((nd?.khoPhuTrach ?? []).filter(p => p.trangThai === 1).map(p => p.kho).filter(Boolean));
                }
            })
            .catch(() => setError("Không thể tải thông tin người dùng."))
            .finally(() => setLoadingKho(false));
    }, [userId]);

    // STEP 2 + 3: load sản phẩm tất cả kho, rồi fetch tồn kho từng biến thể
    const loadData = useCallback(async () => {
        if (!khoList.length) return;
        setLoadingData(true); setAllSanPham({}); setAllTonKho({});
        setCurrentPage(0); setError(null);
        let totalBT = 0, doneBT = 0;
        try {
            // STEP 2: song song fetch sản phẩm tất cả kho
            const spResults = await Promise.all(
                khoList.map(kho =>
                    apiClient.get(`/api/v1/san-pham-quan-ao/theo-kho/${kho.id}`)
                        .then(r => ({ khoId: kho.id, sanPhams: r.data?.data ?? [] }))
                        .catch(() => ({ khoId: kho.id, sanPhams: [] }))
                )
            );
            const newSP = {};
            for (const { khoId, sanPhams } of spResults) {
                newSP[khoId] = sanPhams;
                for (const sp of sanPhams) totalBT += (sp.bienTheSanPhams ?? []).length;
            }
            setAllSanPham(newSP);
            setFetchProgress({ done: 0, total: totalBT });

            // Khởi tạo map với _loading=true
            const initTK = {};
            for (const { khoId, sanPhams } of spResults) {
                initTK[khoId] = {};
                for (const sp of sanPhams)
                    for (const bt of sp.bienTheSanPhams ?? [])
                        initTK[khoId][bt.id] = { tongSoLuongTon: 0, tongSoLuongDaDat: 0, tongSoLuongKhaDung: 0, giaTriTonKho: 0, _tonKhoRaw: [], _loading: true };
            }
            setAllTonKho({ ...initTK });

            // STEP 3: fetch tồn kho từng biến thể song song
            const tasks = [];
            for (const { khoId, sanPhams } of spResults)
                for (const sp of sanPhams)
                    for (const bt of sp.bienTheSanPhams ?? [])
                        tasks.push({ khoId, bienTheId: bt.id });

            await Promise.allSettled(
                tasks.map(({ khoId, bienTheId }) =>
                    apiClient.get(`/api/v1/thong-ke-he-thong/ton-kho-bien-the/${khoId}/${bienTheId}`)
                        .then(r => {
                            const tkList = r.data?.data ?? [];
                            const entry = {
                                tongSoLuongTon: tkList.reduce((s, t) => s + Number(t.tongSoLuongTon ?? 0), 0),
                                tongSoLuongDaDat: tkList.reduce((s, t) => s + Number(t.tongSoLuongDaDat ?? 0), 0),
                                tongSoLuongKhaDung: tkList.reduce((s, t) => s + Number(t.tongSoLuongKhaDung ?? 0), 0),
                                giaTriTonKho: tkList.reduce((s, t) => s + Number(t.giaTriTonKho ?? 0), 0),
                                _tonKhoRaw: tkList, _loading: false,
                            };
                            setAllTonKho(prev => ({ ...prev, [khoId]: { ...prev[khoId], [bienTheId]: entry } }));
                            doneBT++; setFetchProgress({ done: doneBT, total: totalBT });
                        })
                        .catch(() => {
                            setAllTonKho(prev => ({ ...prev, [khoId]: { ...prev[khoId], [bienTheId]: { ...(prev[khoId]?.[bienTheId] ?? {}), _loading: false } } }));
                            doneBT++; setFetchProgress({ done: doneBT, total: totalBT });
                        })
                )
            );
        } catch { setError("Không thể tải dữ liệu tồn kho."); }
        finally { setLoadingData(false); }
    }, [khoList]);

    useEffect(() => { loadData(); }, [khoList]);

    const totalItems = khoList.length;
    const paginatedKhoList = khoList.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    const progressPct = fetchProgress.total > 0 ? Math.round((fetchProgress.done / fetchProgress.total) * 100) : 0;

    let gTongBienThe = 0, gTongGiaTri = 0, gHet = 0, gSap = 0, gTotalTon = 0, gTotalDat = 0, gTotalKha = 0;
    for (const kho of khoList) {
        const sps = allSanPham[kho.id] ?? [], tkMap = allTonKho[kho.id] ?? {};
        for (const sp of sps) for (const bt of sp.bienTheSanPhams ?? []) {
            const tk = tkMap[bt.id] ?? {}, qty = Number(tk.tongSoLuongTon ?? 0), min = Number(sp.mucTonToiThieu ?? 0);
            gTongBienThe++;
            if (!tk._loading) { gTongGiaTri += Number(tk.giaTriTonKho ?? 0); gTotalTon += qty; gTotalDat += Number(tk.tongSoLuongDaDat ?? 0); gTotalKha += Number(tk.tongSoLuongKhaDung ?? 0); if (qty === 0) gHet++; else if (min > 0 && qty <= min) gSap++; }
        }
    }

    const isLoading = loadingKho || (loadingData && Object.keys(allSanPham).length === 0);

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 min-h-screen w-full" style={{ background: "linear-gradient(135deg, #ca8a04 0%, #b45309 100%)" }}>
            {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm flex items-center gap-2 shadow-sm"><AlertTriangle className="h-4 w-4 flex-shrink-0" />{error}</div>}

            {/* Progress bar */}
            {loadingData && fetchProgress.total > 0 && fetchProgress.done < fetchProgress.total && (
                <div className="rounded-xl bg-white/95 border border-white/60 px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-yellow-500" />
                            Đang tải tồn kho biến thể... ({fetchProgress.done}/{fetchProgress.total})
                        </span>
                        <span className="text-xs font-semibold text-yellow-700">{progressPct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            )}

            <div className="space-y-6 w-full">
                {/* KPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard icon={Warehouse} label="Tổng kho" value={fmt(khoList.length)} sub="Kho đang quản lý" colorClass="text-blue-600" bgClass="bg-blue-100" />
                    <KpiCard icon={Package} label="Giá trị tồn kho" value={fmtMoney(gTongGiaTri)} sub={`Tổng ${fmt(gTongBienThe)} biến thể`} colorClass="text-purple-600" bgClass="bg-purple-100" />
                    <KpiCard icon={AlertTriangle} label="Sắp hết hàng" value={fmt(gSap)} sub={gTongBienThe > 0 ? `${Math.round((gSap / gTongBienThe) * 100)}% tổng biến thể` : "—"} colorClass="text-amber-600" bgClass="bg-amber-100" />
                    <KpiCard icon={TrendingDown} label="Hết hàng" value={fmt(gHet)} sub={gTongBienThe > 0 ? `${Math.round((gHet / gTongBienThe) * 100)}% tổng biến thể` : "—"} colorClass="text-rose-600" bgClass="bg-rose-100" />
                </div>

                {/* Filter */}
                <Card className="border-0 shadow-lg bg-white/95 ring-1 ring-white/60">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-yellow-600" />Bộ lọc tồn kho
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-2 w-full md:w-auto flex-1 max-w-sm">
                                <Label className="text-gray-700 font-medium">Tìm kiếm sản phẩm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input placeholder="Tìm tên SP, SKU, mã SP..." className="pl-9 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 bg-white" value={keyword} onChange={e => { setKeyword(e.target.value); setCurrentPage(0); }} />
                                </div>
                            </div>
                            <div className="space-y-2 w-full md:w-auto">
                                <Label className="text-gray-700 font-medium">Trạng thái tồn</Label>
                                <div className="flex gap-1 bg-slate-100/80 rounded-xl p-1 border border-slate-200">
                                    {[{ key: "ALL", label: "Tất cả" }, { key: "con", label: "Còn hàng" }, { key: "saphet", label: "Sắp hết" }, { key: "het", label: "Hết hàng" }].map(({ key, label }) => (
                                        <button key={key} onClick={() => { setTrangThaiFilter(key); setCurrentPage(0); }}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-0 ${trangThaiFilter === key ? "bg-white text-yellow-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800 bg-transparent hover:bg-slate-200/50"}`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={loadData} disabled={loadingData}
                                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 h-10 px-6 rounded-xl font-medium shadow-sm transition-all duration-200 flex items-center gap-2 w-full md:w-auto">
                                {loadingData ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                Tải lại
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tree Table */}
                {isLoading ? (
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mb-3" />
                        <span className="font-medium text-slate-600">Đang tải dữ liệu tồn kho...</span>
                    </div>
                ) : khoList.length === 0 ? (
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 flex flex-col items-center justify-center py-20">
                        <Warehouse className="h-12 w-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">Không có kho nào được phân quyền</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Danh sách tồn kho chi tiết</h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Nhấn <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] shadow-sm border border-slate-200">+</span> để mở rộng · Di chuột vào biến thể để xem lô hàng
                                    </p>
                                </div>
                                <div className="text-xs font-semibold text-slate-600 bg-yellow-50 rounded-lg px-4 py-2 border border-yellow-200 text-center">
                                    Tổng <span className="text-yellow-700">{khoList.length}</span> kho · <span className="text-yellow-700">{gTongBienThe}</span> biến thể
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase min-w-[320px]">Kho / Sản phẩm / Biến thể</th>
                                            <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Tổng tồn</th>
                                            <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Đã đặt</th>
                                            <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Khả dụng</th>
                                            <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Giá trị tồn</th>
                                            <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Trạng thái</th>
                                            <th className="h-12 px-4 w-12 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedKhoList.map(kho => (
                                            <KhoRow key={kho.id} kho={kho}
                                                sanPhams={allSanPham[kho.id] ?? []}
                                                tonKhoMap={allTonKho[kho.id] ?? {}}
                                                keyword={keyword} trangThaiFilter={trangThaiFilter} />
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-[3px] border-slate-900 bg-slate-50">
                                            <td className="px-4 py-5 text-sm font-extrabold text-slate-900 uppercase tracking-wide">Tổng cộng tất cả — {khoList.length} kho</td>
                                            <td className="px-4 py-5 text-right text-base font-extrabold text-slate-900">{fmt(gTotalTon)}</td>
                                            <td className="px-4 py-5 text-right text-base font-extrabold text-amber-600">{fmt(gTotalDat)}</td>
                                            <td className="px-4 py-5 text-right text-base font-extrabold text-emerald-700">{fmt(gTotalKha)}</td>
                                            <td className="px-4 py-5 text-right"><span className="text-base font-extrabold text-slate-900">{fmtMoney(gTongGiaTri)}</span></td>
                                            <td colSpan={2} />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">{pageSize} dòng<ChevronDown className="h-4 w-4 opacity-50" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                                {[5, 10, 20, 50, 100].map(s => (
                                                    <DropdownMenuItem key={s} onClick={() => { setPageSize(s); setCurrentPage(0); }} className="cursor-pointer">{s} dòng</DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Hiển thị <span className="font-semibold text-gray-900">{totalItems === 0 ? 0 : currentPage * pageSize + 1}</span> – <span className="font-semibold text-gray-900">{Math.min((currentPage + 1) * pageSize, totalItems)}</span> trong tổng số <span className="font-semibold text-yellow-600">{totalItems}</span> kho
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="gap-1 disabled:opacity-50"><ChevronLeft className="h-4 w-4" />Trước</Button>
                                        <div className="hidden sm:flex gap-1">
                                            {[...Array(Math.max(1, Math.ceil(totalItems / pageSize)))].map((_, idx) => (
                                                <Button key={idx} variant={currentPage === idx ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(idx)}
                                                    className={currentPage === idx ? "bg-slate-900 text-white border border-slate-900 hover:bg-slate-800 shadow-sm" : "border-gray-200 text-slate-600"}>
                                                    {idx + 1}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalItems / pageSize) - 1, p + 1))} disabled={currentPage >= Math.ceil(totalItems / pageSize) - 1 || totalItems === 0} className="gap-1 disabled:opacity-50">Sau<ChevronRight className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}