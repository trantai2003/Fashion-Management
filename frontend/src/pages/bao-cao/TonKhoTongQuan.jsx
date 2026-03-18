/**
 * TonKhoTongQuan — Router Page (không phải component)
 *
 * Tự xử lý:
 *   - Đọc JWT → lấy userId
 *   - Gọi /api/v1/nguoi-dung/get-by-id/{id} → lấy vaiTro + khoPhuTrach
 *   - Nếu vai trò đặc quyền (admin/quan_ly_kho/...) → gọi /api/v1/kho/all
 *   - Gọi thongKeHeThongService.getTonKhoTongQuan({ khoId?, keyword? })
 *
 * Route ví dụ:
 *   <Route path="/ton-kho-tong-quan" element={<TonKhoTongQuan />} />
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Loader2, History, PackagePlus, Search, Filter,
    Warehouse, RefreshCw, ShieldAlert, ChevronDown, Check,
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
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

/** Các vai trò được xem tất cả kho → dùng /kho/all */
const ROLES_ALL_KHO = [
    ROLE.QUAN_TRI_VIEN,
    ROLE.QUAN_LY_KHO,
    ROLE.NHAN_VIEN_MUA_HANG,
    ROLE.NHAN_VIEN_BAN_HANG,
];

const ALLOWED_ROLES = Object.values(ROLE);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse JWT payload (không verify) */
function parseJwt(token) {
    try {
        const b64 = token.split(".")[1];
        return JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    } catch { return null; }
}

/**
 * Trích danh sách vai trò từ trường vaiTro của NguoiDungDto.
 * vaiTro có thể là string đơn ("quan_tri_vien") hoặc scope space-separated.
 */
function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(" ") ? vaiTro.split(" ") : [vaiTro];
}

/** Vai trò này có được xem tất cả kho không? */
function canSeeAllKho(roles) {
    return roles.some(r => ROLES_ALL_KHO.includes(r));
}

/** Có thể tạo phiếu nhập kho (không phải thuần bán hàng)? */
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

// ── Trạng thái tồn kho — tính dựa trên tongSoLuongKhaDung và mucTonToiThieu
function trangThaiTon(item) {
    const kha = Number(item.tongSoLuongKhaDung ?? item.onHand ?? 0);
    const min = Number(item.mucTonToiThieu ?? 0);
    if (kha <= 0) return "het_hang";
    if (min > 0 && kha <= min) return "thieu_hang";
    if (min > 0 && kha <= min * 1.5) return "binh_thuong";
    return "du_hang";
}

const STATUS_CFG = {
    het_hang: { label: "Hết hàng", cls: "bg-red-100 text-red-700 border-red-200" },
    thieu_hang: { label: "Thiếu hàng", cls: "bg-orange-100 text-orange-700 border-orange-200" },
    binh_thuong: { label: "Bình thường", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    du_hang: { label: "Dư hàng", cls: "bg-blue-100 text-blue-700 border-blue-200" },
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SK = ({ w = "w-16" }) => (
    <span className={`inline-block h-4 ${w} rounded bg-slate-100 animate-pulse`} />
);

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function TonKhoTongQuan() {
    const navigate = useNavigate();

    // ── Auth state ──────────────────────────────────────────────────────────
    const [userId, setUserId] = useState(null);
    const [userRoles, setUserRoles] = useState([]);   // string[]
    const [khoList, setKhoList] = useState([]);   // { id, tenKho, maKho }[]
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [authError, setAuthError] = useState(null);

    // ── Filter state ────────────────────────────────────────────────────────
    const [selectedKhoId, setSelectedKhoId] = useState(null);   // null = tất cả
    const [keyword, setKeyword] = useState("");
    const [trangThaiFilter, setTrangThaiFilter] = useState("tat_ca");

    // ── Data state ──────────────────────────────────────────────────────────
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // prevent double-fire on StrictMode
    const initDone = useRef(false);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 0 — đọc userId từ JWT
    // ════════════════════════════════════════════════════════════════════════
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) { setAuthError("Chưa đăng nhập."); setLoadingAuth(false); return; }
        const claims = parseJwt(token);
        if (claims?.id) setUserId(claims.id);
        else { setAuthError("Token không hợp lệ."); setLoadingAuth(false); }
    }, []);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 1 — lấy thông tin user + danh sách kho
    // ════════════════════════════════════════════════════════════════════════
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
                    // Vai trò đặc quyền → lấy toàn bộ kho
                    const r = await apiClient.get("/api/v1/kho/all");
                    khos = r.data?.data ?? [];
                } else {
                    // Nhân viên kho → chỉ dùng khoPhuTrach
                    khos = (nd?.khoPhuTrach ?? [])
                        .filter(p => p.trangThai === 1)
                        .map(p => p.kho)
                        .filter(Boolean);
                }
                setKhoList(khos);

                // Tự động chọn kho đầu tiên nếu chỉ có 1 kho (hoặc vai trò buộc chọn kho)
                if (khos.length === 1) {
                    setSelectedKhoId(khos[0].id);
                    localStorage.setItem("selected_kho_id", khos[0].id);
                }
            })
            .catch(() => setAuthError("Không thể tải thông tin tài khoản."))
            .finally(() => setLoadingAuth(false));
    }, [userId]);

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2 — gọi API getTonKhoTongQuan
    // ════════════════════════════════════════════════════════════════════════
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

    // Auto-load khi auth xong (nếu không cần chọn kho bắt buộc)
    useEffect(() => {
        if (loadingAuth || authError) return;
        // Nếu chỉ có đúng 1 kho → đã set selectedKhoId, load theo kho đó
        // Nếu nhiều kho và có quyền xem tất → load không filter kho
        const mustSelect = khoList.length === 1;
        const firstKhoId = khoList.length === 1 ? khoList[0].id : undefined;
        loadTonKho({ khoId: firstKhoId });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadingAuth, authError]);

    // ── Bấm nút Lọc ─────────────────────────────────────────────────────────
    const handleFilter = () => {
        // Nếu chỉ có 1 kho → bắt buộc filter theo kho đó
        const khoId = selectedKhoId ?? (khoList.length === 1 ? khoList[0].id : undefined);
        loadTonKho({ khoId, kw: keyword.trim() || undefined });
    };

    // ── Chọn kho → cập nhật localStorage + re-load ──────────────────────────
    const handleSelectKho = (id) => {
        setSelectedKhoId(id);
        if (id) localStorage.setItem("selected_kho_id", id);
        else localStorage.removeItem("selected_kho_id");
        // reset data để user biết đang load lại
        setHasLoaded(false);
        loadTonKho({ khoId: id ?? undefined, kw: keyword.trim() || undefined });
    };

    // ── Filter phía client ───────────────────────────────────────────────────
    const filteredData = data.filter(item =>
        trangThaiFilter === "tat_ca" ? true : trangThaiTon(item) === trangThaiFilter
    );

    // ── Computed flags ───────────────────────────────────────────────────────
    const hasAccess = userRoles.some(r => ALLOWED_ROLES.includes(r));
    const showNhapKho = canNhapKho(userRoles);
    const multiKho = khoList.length > 1;
    const activeKhoLabel = selectedKhoId
        ? khoList.find(k => k.id === selectedKhoId)?.tenKho ?? "Chọn kho"
        : "Tất cả kho";

    // ════════════════════════════════════════════════════════════════════════
    // RENDER — loading auth
    // ════════════════════════════════════════════════════════════════════════
    if (loadingAuth) {
        return (
            <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Đang xác thực tài khoản...</span>
            </div>
        );
    }

    // ── Auth error ────────────────────────────────────────────────────────────
    if (authError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
                <ShieldAlert className="h-10 w-10 opacity-60" />
                <p className="font-medium">{authError}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Thử lại
                </Button>
            </div>
        );
    }

    // ── Không có quyền ────────────────────────────────────────────────────────
    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <ShieldAlert className="h-10 w-10 opacity-40" />
                <p className="font-medium">Bạn không có quyền truy cập trang này.</p>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ════════════════════════════════════════════════════════════════════════
    return (
        <div className="p-6 space-y-5 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* ── Page header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">
                        Báo cáo tồn kho tổng quan
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Tổng hợp tồn kho theo biến thể · {hasLoaded && (
                            <span>
                                Hiển thị <b className="text-slate-700">{filteredData.length}</b> /
                                <b className="text-slate-700"> {data.length}</b> bản ghi
                            </span>
                        )}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    onClick={() => loadTonKho({
                        khoId: selectedKhoId ?? undefined,
                        kw: keyword.trim() || undefined,
                    })}
                    className="gap-1.5 border-slate-200 hover:bg-white"
                >
                    {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <RefreshCw className="h-4 w-4" />
                    }
                    Làm mới
                </Button>
            </div>

            {/* ── Bộ lọc ── */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Trạng thái tồn kho */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Trạng thái tồn kho
                        </Label>
                        <div className="flex flex-wrap gap-1">
                            {[
                                { key: "tat_ca", label: "Tất cả" },
                                { key: "het_hang", label: "Hết hàng" },
                                { key: "thieu_hang", label: "Thiếu" },
                                { key: "binh_thuong", label: "Bình thường" },
                                { key: "du_hang", label: "Dư hàng" },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setTrangThaiFilter(key)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all
                                        ${trangThaiFilter === key
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {(
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                <Warehouse className="h-3 w-3" />
                                Kho
                            </Label>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between font-normal bg-white border-slate-200 h-9 text-sm"
                                    >
                                        <span className="truncate">{activeKhoLabel}</span>
                                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56 bg-white border border-slate-100 shadow-xl z-50">
                                    {multiKho && (
                                        <DropdownMenuItem
                                            onClick={() => handleSelectKho(null)}
                                            className="flex items-center justify-between cursor-pointer hover:bg-purple-50 text-sm"
                                        >
                                            Tất cả kho
                                            {!selectedKhoId && <Check className="h-4 w-4 text-purple-600" />}
                                        </DropdownMenuItem>
                                    )}
                                    {khoList.map(kho => (
                                        <DropdownMenuItem
                                            key={kho.id}
                                            onClick={() => handleSelectKho(kho.id)}
                                            className="flex items-center justify-between cursor-pointer hover:bg-purple-50 text-sm"
                                        >
                                            <span className="truncate">{kho.tenKho}</span>
                                            {selectedKhoId === kho.id && (
                                                <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Keyword */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Tìm kiếm
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="SKU, mã SP, tên sản phẩm..."
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleFilter()}
                                className="pl-8 border-slate-200 focus:border-purple-500 h-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Nút lọc */}
                    <div className="flex items-end">
                        <Button
                            onClick={handleFilter}
                            disabled={loading}
                            className="w-full gap-2 bg-slate-900 text-white hover:bg-white hover:text-slate-900 border border-slate-900 h-9 transition-all"
                        >
                            {loading
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Filter className="h-4 w-4" />
                            }
                            Lọc
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Bảng dữ liệu ── */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                    <Table>
                        <TableHeader className="sticky top-0 z-10">
                            <TableRow className="bg-slate-50 border-b border-slate-200">
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500 w-10 text-center">STT</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Mã SP</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[160px]">Tên sản phẩm</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Màu</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Size</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Chất liệu</TableHead>
                                <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Kho</TableHead>
                                <TableHead className="text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">On Hand</TableHead>
                                <TableHead className="text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-blue-600">↓ Incoming</TableHead>
                                <TableHead className="text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-rose-600">↑ Outgoing</TableHead>
                                <TableHead className="text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-sky-600">Free to Use</TableHead>
                                <TableHead className="text-right whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Tồn tối thiểu</TableHead>
                                <TableHead className="text-right whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Giá trị tồn</TableHead>
                                <TableHead className="text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Cảnh báo</TableHead>
                                <TableHead className="text-center whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-500">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-slate-100">
                            {/* Loading */}
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-48 text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-400">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Đang tải dữ liệu tồn kho...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Chưa tải */}
                            {!loading && !hasLoaded && (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-48 text-center text-slate-400 text-sm">
                                        Nhấn <strong className="text-slate-600">Lọc</strong> để xem dữ liệu tồn kho
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Không có kết quả */}
                            {!loading && hasLoaded && filteredData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={16} className="h-48 text-center text-slate-400 text-sm">
                                        Không tìm thấy dữ liệu phù hợp
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Data rows */}
                            {!loading && filteredData.map((item, idx) => {
                                const status = trangThaiTon(item);
                                const { label, cls } = STATUS_CFG[status] ?? STATUS_CFG.binh_thuong;
                                const isLow = status === "het_hang" || status === "thieu_hang";

                                // Mapping field names — BE có thể trả về onHand hoặc tongSoLuongKhaDung
                                const onHand = Number(item.onHand ?? item.tongSoLuongKhaDung ?? 0);
                                const incoming = Number(item.incoming ?? item.tongSoLuongChoNhan ?? 0);
                                const outgoing = Number(item.outgoing ?? item.tongSoLuongChoDuaHang ?? 0);
                                // freeToUse = onHand + incoming - outgoing
                                const freeToUse = onHand + incoming - outgoing;
                                const giaTri = Number(item.tongGiaTri ?? item.giaTriTonKho ?? 0);

                                return (
                                    <TableRow
                                        key={`${item.bienTheId}-${item.khoId}-${idx}`}
                                        className={`transition-colors ${isLow
                                            ? "bg-red-50/40 hover:bg-red-50/70"
                                            : "hover:bg-slate-50/60"}`}
                                    >
                                        {/* STT */}
                                        <TableCell className="text-center text-xs text-slate-400 font-mono">
                                            {idx + 1}
                                        </TableCell>

                                        {/* Mã SP */}
                                        <TableCell className="font-mono text-xs text-slate-500">
                                            {item.maSanPham}
                                        </TableCell>

                                        {/* Tên SP */}
                                        <TableCell className="max-w-[200px]">
                                            <span className="font-medium text-slate-900 text-sm line-clamp-2">
                                                {item.tenSanPham}
                                            </span>
                                        </TableCell>

                                        {/* SKU */}
                                        <TableCell>
                                            <span className="font-mono text-xs font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-1.5 py-0.5">
                                                {item.maSku}
                                            </span>
                                        </TableCell>

                                        {/* Màu */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {item.maMauHex && (
                                                    <span
                                                        style={{ background: item.maMauHex }}
                                                        className="h-3.5 w-3.5 rounded-full border border-slate-200 flex-shrink-0"
                                                    />
                                                )}
                                                <span className="text-xs text-slate-700">{item.tenMau}</span>
                                            </div>
                                        </TableCell>

                                        {/* Size */}
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs">
                                                {item.tenSize ?? item.maSize}
                                            </Badge>
                                        </TableCell>

                                        {/* Chất liệu */}
                                        <TableCell className="text-xs text-slate-500">
                                            {item.tenChatLieu}
                                        </TableCell>

                                        {/* Kho (ẩn nếu đang filter 1 kho) */}
                                        {
                                            <TableCell>
                                                <div className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 rounded-md px-1.5 py-0.5">
                                                    <Warehouse className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                                                    <span className="text-xs font-medium text-yellow-800 whitespace-nowrap">
                                                        {item.tenKho}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        }

                                        {/* On Hand */}
                                        <TableCell className="text-center">
                                            <NumBadge
                                                value={onHand}
                                                colorClass={isLow
                                                    ? "bg-red-500 text-white"
                                                    : "bg-emerald-500 text-white"}
                                            />
                                        </TableCell>

                                        {/* Incoming — slDat - slDaNhan từ đơn mua */}
                                        <TableCell className="text-center">
                                            <NumBadge
                                                value={incoming}
                                                colorClass={incoming > 0
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-slate-100 text-slate-500"}
                                            />
                                        </TableCell>

                                        {/* Outgoing — slDat - slDaGiao từ đơn bán */}
                                        <TableCell className="text-center">
                                            <NumBadge
                                                value={outgoing}
                                                colorClass={outgoing > 0
                                                    ? "bg-rose-500 text-white"
                                                    : "bg-slate-100 text-slate-500"}
                                            />
                                        </TableCell>

                                        {/* Free to Use = onHand + incoming - outgoing */}
                                        <TableCell className="text-center">
                                            <NumBadge
                                                value={freeToUse}
                                                colorClass={freeToUse < 0
                                                    ? "bg-red-500 text-white"
                                                    : freeToUse === 0
                                                        ? "bg-slate-100 text-slate-500"
                                                        : "bg-sky-500 text-white"}
                                            />
                                        </TableCell>

                                        {/* Tồn tối thiểu */}
                                        <TableCell className="text-right text-xs text-slate-500">
                                            {fmt(item.mucTonToiThieu)}
                                        </TableCell>

                                        {/* Giá trị tồn */}
                                        <TableCell className="text-right text-sm font-medium text-slate-700">
                                            {formatCurrency(giaTri)}
                                        </TableCell>

                                        {/* Cảnh báo */}
                                        <TableCell className="text-center">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
                                                {label}
                                            </span>
                                        </TableCell>

                                        {/* Thao tác */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 gap-1 text-xs border-slate-200 hover:bg-slate-50"
                                                    onClick={() => {
                                                        navigate(`/lich-su-giao-dich?bienTheId=${item.bienTheId}&khoId=${item.khoId}`);
                                                    }}
                                                >
                                                    <History className="h-3 w-3" />
                                                    Lịch sử
                                                </Button>

                                                {showNhapKho && (
                                                    <Button
                                                        size="sm"
                                                        className="h-7 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                                        onClick={() => {
                                                            navigate(`/purchase-orders/create?bienTheId=${item.bienTheId}&khoId=${item.khoId}`);
                                                        }}
                                                    >
                                                        <PackagePlus className="h-3 w-3" />
                                                        Nhập hàng
                                                    </Button>
                                                )}
                                            </div>
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
                <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-3 text-sm">
                    <SummaryItem
                        label="Tổng On Hand"
                        value={fmt(filteredData.reduce((s, i) => s + Number(i.onHand ?? i.tongSoLuongKhaDung ?? 0), 0))}
                    />
                    <Divider />
                    <SummaryItem
                        label="Incoming"
                        value={fmt(filteredData.reduce((s, i) => s + Number(i.incoming ?? i.tongSoLuongChoNhan ?? 0), 0))}
                        valueClass="text-blue-600"
                    />
                    <Divider />
                    <SummaryItem
                        label="Outgoing"
                        value={fmt(filteredData.reduce((s, i) => s + Number(i.outgoing ?? i.tongSoLuongChoDuaHang ?? 0), 0))}
                        valueClass="text-rose-600"
                    />
                    <Divider />
                    <SummaryItem
                        label="Tổng giá trị tồn"
                        value={formatCurrency(filteredData.reduce((s, i) => s + Number(i.tongGiaTri ?? i.giaTriTonKho ?? 0), 0))}
                        valueClass="text-emerald-700"
                    />
                    <Divider />
                    <SummaryItem
                        label="Hết / Thiếu hàng"
                        value={`${filteredData.filter(i => ["het_hang", "thieu_hang"].includes(trangThaiTon(i))).length} SKU`}
                        valueClass="text-red-600"
                    />
                    {multiKho && (
                        <>
                            <Divider />
                            <SummaryItem
                                label="Số kho"
                                value={`${new Set(filteredData.map(i => i.khoId)).size} kho`}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NumBadge({ value, colorClass }) {
    return (
        <span className={`inline-flex items-center justify-center min-w-[40px] rounded-md px-2 py-0.5 text-sm font-bold ${colorClass}`}>
            {Number(value).toLocaleString("vi-VN")}
        </span>
    );
}

function SummaryItem({ label, value, valueClass = "text-slate-800" }) {
    return (
        <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-sm">{label}:</span>
            <span className={`font-semibold text-sm ${valueClass}`}>{value}</span>
        </div>
    );
}

function Divider() {
    return <span className="text-slate-200 select-none">|</span>;
}