/**
 * TonKhoTongQuan — Router Page (không phải component)
 *
 * Tự xử lý:
 * - Đọc JWT → lấy userId
 * - Gọi /api/v1/nguoi-dung/get-by-id/{id} → lấy vaiTro + khoPhuTrach
 * - Nếu vai trò đặc quyền (admin/quan_ly_kho/...) → gọi /api/v1/kho/all
 * - Gọi thongKeHeThongService.getTonKhoTongQuan({ khoId?, keyword? })
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Loader2, PackagePlus, Search, Filter,
    Warehouse, RefreshCw, ShieldAlert,
    CheckCircle2, AlertTriangle, XOctagon, Layers,
    ChevronDown, Check
} from "lucide-react";

import apiClient from "@/services/apiClient";
import { thongKeHeThongService } from "@/services/thongKeHeThongService";

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE = {
    QUAN_TRI_VIEN: "quan_tri_vien",
    QUAN_LY_KHO: "quan_ly_kho",
    NHAN_VIEN_KHO: "nhan_vien_kho",
    NHAN_VIEN_MUA_HANG: "nhan_vien_mua_hang",
    NHAN_VIEN_BAN_HANG: "nhan_vien_ban_hang",
};

const ROLES_ALL_KHO = [
    ROLE.QUAN_TRI_VIEN,
    ROLE.QUAN_LY_KHO,
    ROLE.NHAN_VIEN_MUA_HANG,
    ROLE.NHAN_VIEN_BAN_HANG,
];

const ALLOWED_ROLES = Object.values(ROLE);

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.wh-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 28px 28px 56px;
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.wh-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.wh-orb-1 {
  position: fixed; width: 600px; height: 600px; border-radius: 50%;
  background: rgba(184,134,11,0.06); filter: blur(120px);
  top: -200px; right: -150px; pointer-events: none; z-index: 0;
}

.wh-inner {
  position: relative; z-index: 1;
  max-width: 1500px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Cards ── */
.sec-card {
  background: #fff; border-radius: 20px; border: 1px solid rgba(184,134,11,0.15);
  overflow: hidden; box-shadow: 0 4px 20px rgba(100,80,30,0.06);
  display: flex; flex-direction: column;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(184,134,11,0.4); }

.badge-tag {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  padding: 4px 10px; border-radius: 6px; text-transform: uppercase; display: inline-flex; align-items: center; gap: 4px;
}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseJwt(token) {
    try {
        const b64 = token.split(".")[1];
        return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    } catch { return null; }
}

function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
}

function canSeeAllKho(roles) {
    return roles.some(r => ROLES_ALL_KHO.includes(r));
}

function canNhapKho(roles) {
    return roles.some(r => [
        ROLE.QUAN_TRI_VIEN, ROLE.QUAN_LY_KHO,
        ROLE.NHAN_VIEN_KHO, ROLE.NHAN_VIEN_MUA_HANG,
    ].includes(r));
}

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value ?? 0);

const fmt = (n) =>
    n != null ? Number(n).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) : "—";

function trangThaiTon(item) {
    const kha = Number(item.tongSoLuongKhaDung ?? item.onHand ?? 0);
    const min = Number(item.mucTonToiThieu ?? 0);
    if (kha <= 0) return "het_hang";
    if (min > 0 && kha <= min) return "thieu_hang";
    if (min > 0 && kha <= min * 1.5) return "binh_thuong";
    return "du_hang";
}

const STATUS_CFG = {
    het_hang: { label: "Hết hàng", cls: "bg-[#fff0f0] text-[#e03131] border border-[#ffc9c9]", icon: XOctagon },
    thieu_hang: { label: "Thiếu hàng", cls: "bg-[#fff4e6] text-[#e8590c] border border-[#ffd8a8]", icon: AlertTriangle },
    binh_thuong: { label: "Bình thường", cls: "bg-[#ebfbee] text-[#2b8a3e] border border-[#b2f2bb]", icon: CheckCircle2 },
    du_hang: { label: "Dư hàng", cls: "bg-[#e7f5ff] text-[#1864ab] border border-[#a5d8ff]", icon: Layers },
};

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function TonKhoTongQuan() {
    const navigate = useNavigate();

    // ── Auth state ──────────────────────────────────────────────────────────
    const [userId, setUserId] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [khoList, setKhoList] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    // ── Filter state ────────────────────────────────────────────────────────
    const [selectedKhoId, setSelectedKhoId] = useState(null);
    const [keyword, setKeyword] = useState("");
    const [trangThaiFilter, setTrangThaiFilter] = useState("tat_ca");

    // ── Data state ──────────────────────────────────────────────────────────
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const initDone = useRef(false);

    // STEP 0 — đọc userId từ JWT
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { setAuthError("Chưa đăng nhập."); setLoadingAuth(false); return; }
        const claims = parseJwt(token);
        if (claims?.id) setUserId(claims.id);
        else { setAuthError("Token không hợp lệ."); setLoadingAuth(false); }
    }, []);

    // STEP 1 — lấy thông tin user + danh sách kho
    useEffect(() => {
        if (!userId || initDone.current) return;
        initDone.current = true;

        setLoadingAuth(true);
        apiClient.get(`/api/v1/nguoi-dung/get-by-id/${userId}`)
            .then(async (res) => {
                const nd = res.data?.data;
                const roles = parseRoles(nd?.vaiTro);
                setUserRoles(roles);

                let khos = [];
                if (canSeeAllKho(roles)) {
                    const r = await apiClient.get("/api/v1/kho/all");
                    khos = r.data?.data ?? [];
                } else {
                    khos = (nd?.khoPhuTrach ?? [])
                        .filter(p => p.trangThai === 1)
                        .map(p => p.kho)
                        .filter(Boolean);
                }
                setKhoList(khos);

                if (khos.length === 1) {
                    setSelectedKhoId(khos[0].id);
                    localStorage.setItem("selected_kho_id", khos[0].id);
                } else {
                    const savedId = localStorage.getItem("selected_kho_id");
                    if (savedId) setSelectedKhoId(Number(savedId));
                }
            })
            .catch(() => setAuthError("Không thể tải thông tin tài khoản."))
            .finally(() => setLoadingAuth(false));
    }, [userId]);

    // STEP 2 — gọi API getTonKhoTongQuan
    const loadTonKho = useCallback(async ({ khoId, kw } = {}) => {
        setLoading(true);
        try {
            const params = {};
            if (khoId) params.khoId = khoId;
            if (kw) params.keyword = kw;

            const res = await thongKeHeThongService.getTonKhoTongQuan(params);
            const rows = res.data?.data ?? [];
            setData(rows);
            setHasLoaded(true);
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Không thể tải dữ liệu tồn kho");
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-load khi auth xong
    useEffect(() => {
        if (loadingAuth || authError) return;
        const khoId = selectedKhoId ?? (khoList.length === 1 ? khoList[0].id : undefined);
        loadTonKho({ khoId });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingAuth, authError]);

    // Bấm nút Lọc
    const handleFilter = () => {
        const khoId = selectedKhoId ?? (khoList.length === 1 ? khoList[0].id : undefined);
        loadTonKho({ khoId, kw: keyword.trim() || undefined });
    };

    // Chọn kho
    const handleSelectKho = (id) => {
        const numId = id ? Number(id) : null;
        setSelectedKhoId(numId);
        if (numId) localStorage.setItem("selected_kho_id", numId);
        else localStorage.removeItem("selected_kho_id");

        setHasLoaded(false);
        loadTonKho({ khoId: numId ?? undefined, kw: keyword.trim() || undefined });
    };

    // Filter phía client
    const filteredData = data.filter(item =>
        trangThaiFilter === "tat_ca" ? true : trangThaiTon(item) === trangThaiFilter
    );

    // Computed flags
    const hasAccess = userRoles.some(r => ALLOWED_ROLES.includes(r));
    const showNhapKho = canNhapKho(userRoles);
    const multiKho = khoList.length > 1;
    const activeKhoLabel = selectedKhoId
        ? khoList.find(k => k.id === selectedKhoId)?.tenKho ?? "Chọn kho"
        : "Tất cả kho";

    // RENDER: Loading Auth
    if (loadingAuth) {
        return (
            <div className="wh-root flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin text-[#b8860b]" />
                    <p className="font-mono text-sm uppercase tracking-widest text-[#b8860b]">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // RENDER: Auth error
    if (authError) {
        return (
            <div className="wh-root flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <ShieldAlert size={48} className="text-[#c92a2a] opacity-80" />
                    <p className="font-bold text-[#1a1612] text-lg">{authError}</p>
                    <Button variant="outline" onClick={() => window.location.reload()} className="h-11 px-6 bg-[#faf8f3] border-[#b8860b]/30 rounded-xl font-bold text-[#b8860b] hover:bg-white transition-colors">
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    // RENDER: No access
    if (!hasAccess) {
        return (
            <div className="wh-root flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                    <ShieldAlert size={48} className="text-[#8b6a21] opacity-50" />
                    <p className="font-bold text-[#1a1612] text-lg">Bạn không có quyền truy cập trang này.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    {/* ── Page header ── */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-slate-500 mt-1">
                                Theo dõi và quản lý hàng hóa theo biến thể · {hasLoaded && (
                                    <span>Hiển thị <b className="text-[#b8860b]">{filteredData.length}</b> / <b className="text-[#1a1612]">{data.length}</b> bản ghi</span>
                                )}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            disabled={loading}
                            onClick={() => loadTonKho({ khoId: selectedKhoId ?? undefined, kw: keyword.trim() || undefined })}
                            className="h-10 px-4 rounded-xl font-bold border-[#b8860b]/20 text-[#b8860b] bg-white hover:bg-[#faf8f3] transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
                        </Button>
                    </div>

                    {/* ── Bộ lọc ── */}
                    <div className="sec-card p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-end">
                            {/* Trạng thái */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#b8860b]">Trạng thái tồn kho</Label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { key: "tat_ca", label: "Tất cả" },
                                        { key: "het_hang", label: "Hết hàng" },
                                        { key: "thieu_hang", label: "Thiếu" },
                                        { key: "binh_thuong", label: "Bình thường" },
                                        { key: "du_hang", label: "Dư hàng" },
                                    ].map(({ key, label }) => {
                                        const isSelected = trangThaiFilter === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setTrangThaiFilter(key)}
                                                className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all ${isSelected
                                                        ? "bg-[#b8860b] text-white border-[#b8860b] shadow-sm"
                                                        : "bg-[#faf8f3] text-slate-500 border-[#b8860b]/20 hover:border-[#b8860b]/50 hover:bg-white"
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Chọn kho bằng Shadcn DropdownMenu */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#b8860b] flex items-center gap-1.5">
                                    <Warehouse className="h-3 w-3" /> Kho hàng
                                </Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            disabled={!multiKho}
                                            className="w-full justify-between h-11 bg-[#faf8f3] border-[#b8860b]/20 hover:bg-white text-[13px] font-bold text-[#1a1612]"
                                        >
                                            <span className="truncate">{activeKhoLabel}</span>
                                            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56 bg-white border-[#b8860b]/20 shadow-xl z-50 rounded-xl">
                                        {multiKho && (
                                            <DropdownMenuItem
                                                onClick={() => handleSelectKho(null)}
                                                className="flex items-center justify-between cursor-pointer hover:bg-[#faf8f3] text-[13px] font-semibold py-2"
                                            >
                                                Tất cả kho
                                                {!selectedKhoId && <Check className="h-4 w-4 text-[#b8860b]" />}
                                            </DropdownMenuItem>
                                        )}
                                        {khoList.map(kho => (
                                            <DropdownMenuItem
                                                key={kho.id}
                                                onClick={() => handleSelectKho(kho.id)}
                                                className="flex items-center justify-between cursor-pointer hover:bg-[#faf8f3] text-[13px] font-semibold py-2"
                                            >
                                                <span className="truncate">{kho.tenKho}</span>
                                                {selectedKhoId === kho.id && (
                                                    <Check className="h-4 w-4 text-[#b8860b] flex-shrink-0" />
                                                )}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Tìm kiếm bằng Shadcn Input */}
                            <div className="flex flex-col gap-2">
                                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#b8860b]">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8860b]/50" />
                                    <Input
                                        placeholder="SKU, mã SP, tên sản phẩm..."
                                        value={keyword}
                                        onChange={e => setKeyword(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleFilter()}
                                        className="pl-9 h-11 bg-[#faf8f3] border-[#b8860b]/20 focus-visible:ring-[#b8860b] text-[13px] font-medium text-[#1a1612]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Bảng dữ liệu dùng Shadcn Table ── */}
                    <div className="sec-card flex-1 min-h-[400px]">
                        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                            <Table>
                                <TableHeader className="sticky top-0 bg-[#faf8f3] z-10 shadow-sm">
                                    <TableRow className="border-b-[#b8860b]/20 hover:bg-[#faf8f3]">
                                        <TableHead className="whitespace-nowrap text-center text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px] h-12">STT</TableHead>
                                        <TableHead className="whitespace-nowrap text-left text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">Mã SP / SKU</TableHead>
                                        <TableHead className="whitespace-nowrap text-left text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px] min-w-[200px]">Sản phẩm & Biến thể</TableHead>
                                        <TableHead className="whitespace-nowrap text-left text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">Kho</TableHead>
                                        <TableHead className="whitespace-nowrap text-center text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">On Hand</TableHead>
                                        <TableHead className="whitespace-nowrap text-center text-[#1864ab] font-mono font-bold uppercase tracking-wider text-[10px]">↓ Incoming</TableHead>
                                        <TableHead className="whitespace-nowrap text-center text-[#d9480f] font-mono font-bold uppercase tracking-wider text-[10px]">↑ Outgoing</TableHead>
                                        <TableHead className="whitespace-nowrap text-center text-[#0b7285] font-mono font-bold uppercase tracking-wider text-[10px]">Free to Use</TableHead>
                                        <TableHead className="whitespace-nowrap text-right text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">Tồn tối thiểu</TableHead>
                                        <TableHead className="whitespace-nowrap text-right text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">Giá trị tồn</TableHead>
                                        <TableHead className="whitespace-nowrap text-center text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">Tình trạng</TableHead>
                                        <TableHead className="whitespace-nowrap text-center text-[#8b6a21] font-mono font-bold uppercase tracking-wider text-[10px]">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={12} className="h-48 text-center border-b-0">
                                                <div className="flex flex-col items-center justify-center gap-3 text-[#b8860b]">
                                                    <Loader2 className="h-8 w-8 animate-spin" />
                                                    <span className="font-mono text-xs uppercase tracking-widest font-bold">Đang tải bảng tồn kho...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!loading && !hasLoaded && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={12} className="h-48 text-center text-slate-400 font-mono text-sm uppercase tracking-widest border-b-0">
                                                Nhấn <strong className="text-[#b8860b]">Lọc</strong> để xem dữ liệu
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!loading && hasLoaded && filteredData.length === 0 && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={12} className="h-48 text-center text-slate-400 font-mono text-sm uppercase tracking-widest border-b-0">
                                                Không tìm thấy dữ liệu phù hợp
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {!loading && filteredData.map((item, idx) => {
                                        const statusKey = trangThaiTon(item);
                                        const statusCfg = STATUS_CFG[statusKey] ?? STATUS_CFG.binh_thuong;
                                        const StatusIcon = statusCfg.icon;
                                        const isLow = statusKey === "het_hang" || statusKey === "thieu_hang";

                                        const onHand = Number(item.onHand ?? item.tongSoLuongKhaDung ?? 0);
                                        const incoming = Number(item.incoming ?? item.tongSoLuongChoNhan ?? 0);
                                        const outgoing = Number(item.outgoing ?? item.tongSoLuongChoDuaHang ?? 0);
                                        const freeToUse = item.freeToUse != null ? Number(item.freeToUse) : (onHand + incoming - outgoing);
                                        const giaTri = Number(item.tongGiaTri ?? item.giaTriTonKho ?? 0);

                                        return (
                                            <TableRow 
                                                key={`${item.bienTheId}-${item.khoId}-${idx}`} 
                                                className={`border-b border-[#b8860b]/10 transition-colors ${isLow ? 'bg-[#fffaf0] hover:bg-[#fff4e6]' : 'bg-white hover:bg-[#faf8f3]'}`}
                                            >
                                                <TableCell className="text-center font-mono text-slate-400 text-[13px]">{idx + 1}</TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">{item.maSanPham}</span>
                                                        <span className="font-mono text-[11px] font-black text-[#8b6a21] bg-[#b8860b]/10 w-fit px-1.5 py-0.5 rounded">{item.maSku}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="max-w-[250px]">
                                                    <p className="font-bold text-[#1a1612] truncate mb-1 text-[13px]">{item.tenSanPham}</p>
                                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                                                        {item.maMauHex && <span style={{ background: item.maMauHex }} className="h-3 w-3 rounded-full border border-slate-200" />}
                                                        <span className="font-semibold">{item.tenMau}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <Badge variant="outline" className="font-mono font-bold px-1.5 py-0 rounded text-[10px] border-[#b8860b]/20 bg-white">
                                                            {item.tenSize ?? item.maSize}
                                                        </Badge>
                                                        <span className="text-slate-300">|</span>
                                                        <span>{item.tenChatLieu}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <span className="inline-flex items-center gap-1 bg-white border border-[#b8860b]/20 text-[#8b6a21] rounded-md px-2 py-1 text-[11px] font-bold whitespace-nowrap">
                                                        <Warehouse className="h-3 w-3" /> {item.tenKho}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <NumBadge value={onHand} colorClass={isLow ? "bg-[#e03131] text-white" : "bg-[#2b8a3e] text-white"} />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <NumBadge value={incoming} colorClass={incoming > 0 ? "bg-[#1864ab] text-white" : "bg-white text-slate-400 border border-slate-200"} />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <NumBadge value={outgoing} colorClass={outgoing > 0 ? "bg-[#d9480f] text-white" : "bg-white text-slate-400 border border-slate-200"} />
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <NumBadge value={freeToUse} colorClass={freeToUse < 0 ? "bg-[#e03131] text-white" : freeToUse === 0 ? "bg-white text-slate-400 border border-slate-200" : "bg-[#0b7285] text-white"} />
                                                </TableCell>

                                                <TableCell className="text-right font-mono text-slate-500 font-bold text-[13px]">{fmt(item.mucTonToiThieu)}</TableCell>
                                                <TableCell className="text-right font-bold text-[#8b6a21] text-[13px]">{formatCurrency(giaTri)}</TableCell>

                                                <TableCell className="text-center">
                                                    <span className={`badge-tag ${statusCfg.cls}`}>
                                                        <StatusIcon size={12} strokeWidth={3} /> {statusCfg.label}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    {showNhapKho && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/purchase-requests/create?bienTheId=${item.bienTheId}&khoId=${item.khoId}`)}
                                                            className="inline-flex items-center justify-center gap-1.5 h-7 px-3 rounded-lg bg-[#b8860b]/10 text-[#8b6a21] hover:bg-[#b8860b] hover:text-white font-bold text-[11px] transition-colors"
                                                            title="Tạo yêu cầu nhập kho"
                                                        >
                                                            <PackagePlus className="h-3.5 w-3.5" /> Nhập
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* ── Summary footer ── */}
                    {hasLoaded && filteredData.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-[#b8860b]/20 bg-white shadow-sm px-6 py-4">
                            <SummaryItem label="Tổng On Hand" value={fmt(filteredData.reduce((s, i) => s + Number(i.onHand ?? i.tongSoLuongKhaDung ?? 0), 0))} />
                            <Divider />
                            <SummaryItem label="Incoming" value={fmt(filteredData.reduce((s, i) => s + Number(i.incoming ?? i.tongSoLuongChoNhan ?? 0), 0))} valueClass="text-[#1864ab]" />
                            <Divider />
                            <SummaryItem label="Outgoing" value={fmt(filteredData.reduce((s, i) => s + Number(i.outgoing ?? i.tongSoLuongChoDuaHang ?? 0), 0))} valueClass="text-[#d9480f]" />
                            <Divider />
                            <SummaryItem label="Tổng giá trị tồn" value={formatCurrency(filteredData.reduce((s, i) => s + Number(i.tongGiaTri ?? i.giaTriTonKho ?? 0), 0))} valueClass="text-[#2b8a3e]" />
                            <Divider />
                            <SummaryItem label="Cảnh báo (Hết/Thiếu)" value={`${filteredData.filter(i => ["het_hang", "thieu_hang"].includes(trangThaiTon(i))).length} SKU`} valueClass="text-[#e03131]" />
                            {multiKho && (
                                <>
                                    <Divider />
                                    <SummaryItem label="Số lượng kho" value={`${new Set(filteredData.map(i => i.khoId)).size} kho`} />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function NumBadge({ value, colorClass }) {
    return (
        <span className={`inline-flex items-center justify-center min-w-[36px] rounded px-1.5 py-0.5 font-mono text-[12px] font-bold ${colorClass}`}>
            {Number(value).toLocaleString("vi-VN")}
        </span>
    );
}

function SummaryItem({ label, value, valueClass = "text-[#1a1612]" }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] font-bold text-[#b8860b] uppercase tracking-wider">{label}:</span>
            <span className={`font-bold text-[15px] ${valueClass}`}>{value}</span>
        </div>
    );
}

function Divider() {
    return <span className="text-[#b8860b]/20 select-none text-lg leading-none">|</span>;
}