import { useEffect, useState, useMemo } from "react";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { Link, useNavigate } from "react-router-dom";
import { 
    Loader2, Search, RefreshCcw, Package, Plus,
    ChevronDown, ChevronLeft, ChevronRight, Check, Filter,
    FileText, CheckCircle2, XCircle, ClipboardList,
    ArrowUpRight, LayoutGrid, Warehouse
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
   (Sync with Warehouse / Homepage / Login / Detail)
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.wh-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 28px 28px 56px;
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
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
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Header ── */
.wh-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.wh-title-wrap { display: flex; flex-direction: column; gap: 3px; }
.wh-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; color: rgba(184,134,11,0.65);
  text-transform: uppercase;
}
.wh-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 900; color: #1a1612;
  letter-spacing: -0.5px; line-height: 1.1;
}
.wh-title span { color: #b8860b; }

/* ── Stats ── */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;
}
.stat-card {
  background: #fff; border: 1px solid rgba(184,134,11,0.12);
  border-radius: 18px; padding: 22px;
  box-shadow: 0 4px 15px rgba(100,80,30,0.05);
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(100,80,30,0.1); border-color: #b8860b; }
.stat-lbl { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; color: #a89f92; letter-spacing: 0.1em; }
.stat-val { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 900; color: #1a1612; margin-top: 4px; }
.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }

/* ── Filter Card ── */
.filter-card {
  background: #fff; border-radius: 20px; border: 1px solid rgba(184,134,11,0.15);
  padding: 24px; box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
.inp-wrap { display: flex; flex-direction: column; gap: 7px; }
.inp-lbl { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #b8860b; }
.inp-field {
  height: 44px; padding: 0 16px; border-radius: 11px;
  background: #faf8f3; border: 1.5px solid rgba(184,134,11,0.1);
  font-size: 13px; color: #1a1612; transition: all 0.2s;
}
.inp-field:focus { outline: none; border-color: #b8860b; background: #fff; box-shadow: 0 0 0 3px rgba(184,134,11,0.1); }

/* ── Table Container ── */
.wh-tbl-card {
  background: #fff; border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.wh-tbl-card::before {
  content: ''; display: block; height: 2px;
  background: linear-gradient(90deg, transparent, #b8860b, transparent);
}
.wh-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.wh-thead tr { background: #faf8f3; border-bottom: 2px solid rgba(184,134,11,0.12); }
.wh-th {
  height: 52px; padding: 0 20px;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: rgba(184,134,11,0.6);
}
.wh-tbody tr { border-bottom: 1px solid rgba(184,134,11,0.07); transition: all 0.2s; cursor: pointer; }
.wh-tbody tr:hover { background: rgba(184,134,11,0.045); }
.wh-td { padding: 18px 20px; font-size: 14px; color: #3d3529; }

.id-badge {
  font-family: 'DM Mono', monospace; font-size: 11px; color: #b8860b; font-weight: 700;
  background: rgba(184,134,11,0.08); padding: 4px 10px; border-radius: 8px;
}

/* ── Pagination ── */
.pag-card {
  background: #fff; border: 1px solid rgba(184,134,11,0.15);
  border-radius: 16px; padding: 14px 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.pag-btn {
  height: 36px; padding: 0 14px; border-radius: 9px;
  background: #fff; border: 1px solid rgba(184,134,11,0.15);
  color: #7a6e5f; font-size: 12px; font-weight: 600; transition: all 0.2s;
  display: flex; align-items: center; gap: 6px; cursor: pointer;
}
.pag-btn:hover:not(:disabled) { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }
.pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.pag-btn.active { background: #1a1612; color: #fff; border-color: #1a1612; }

/* ── Badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 99px; font-size: 11px; font-weight: 700;
  font-family: 'DM Sans', sans-serif; text-transform: uppercase; letter-spacing: 0.03em;
}
.badge.green { background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.2); }
.badge.amber { background: rgba(184,134,11,0.1); color: #b8860b; border: 1px solid rgba(184,134,11,0.2); }
.badge.blue  { background: rgba(37,99,235,0.08); color: #2563eb; border: 1px solid rgba(37,99,235,0.2); }
.badge.red   { background: rgba(220,38,38,0.08); color: #dc2626; border: 1px solid rgba(220,38,38,0.2); }
.badge.slate { background: rgba(122,110,95,0.08); color: #7a6e5f; border: 1px solid rgba(122,110,95,0.2); }

/* ── Buttons ── */
.btn-gold {
  height: 44px; padding: 0 22px; border-radius: 11px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  box-shadow: 0 4px 18px rgba(184,134,11,0.35); transition: all 0.2s;
}
.btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(184,134,11,0.48); }

.btn-white {
  height: 44px; padding: 0 22px; border-radius: 11px;
  background: #fff; border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
}
.btn-white:hover { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }
`;

const STATUS_UI = {
    0: { label: "Nháp", cls: "slate" },
    1: { label: "Chờ duyệt", cls: "amber" },
    2: { label: "Đã duyệt", cls: "blue" },
    3: { label: "Đã nhập kho", cls: "green" },
    4: { label: "Đã hủy", cls: "red" },
};

export default function PhieuNhapKhoList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        keyword: "",
        nhaCungCap: "",
        trangThai: "",
        ngayNhap: "",
        page: 0,
        size: 10,
    });

    function buildFilterPayload() {
        const filterList = [];
        if (filters.keyword?.trim()) {
            const searchKeyword = filters.keyword.trim();
            ["soPhieuNhap", "donMuaHang.soDonMua"].forEach((field) => {
                filterList.push({ fieldName: field, operation: "LIKE", value: searchKeyword, logicType: "OR" });
            });
        }
        if (filters.nhaCungCap?.trim()) {
            filterList.push({ fieldName: "nhaCungCap.tenNhaCungCap", operation: "LIKE", value: filters.nhaCungCap.trim() });
        }
        if (filters.trangThai !== "") {
            filterList.push({ fieldName: "trangThai", operation: "EQUALS", value: Number(filters.trangThai) });
        }
        return { page: filters.page, size: filters.size, filters: filterList, sorts: [{ fieldName: "id", direction: "DESC" }] };
    }

    async function fetchData() {
        setLoading(true);
        try {
            const payload = buildFilterPayload();
            const res = await phieuNhapKhoService.filter(payload);
            let list = res.content || [];
            if (filters.ngayNhap) {
                list = list.filter((item) => {
                    if (!item.ngayNhap) return false;
                    const date = new Date(item.ngayNhap);
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    return `${y}-${m}-${d}` === filters.ngayNhap;
                });
            }
            setData(list);
            setTotal(res.totalElements || 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, [filters.keyword, filters.nhaCungCap, filters.trangThai, filters.ngayNhap, filters.page, filters.size]);

    const totalPages = Math.max(1, Math.ceil(total / filters.size));

    const handleReset = () => {
        setFilters({ keyword: "", nhaCungCap: "", trangThai: "", ngayNhap: "", page: 0, size: 10 });
    };

    const stats = useMemo(() => ({
        nhap: data.filter((d) => d.trangThai === 0).length,
        daHoanTat: data.filter((d) => d.trangThai === 3).length,
        daHuy: data.filter((d) => d.trangThai === 4).length,
    }), [data]);

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    {/* ── Header ── */}
                    <div className="wh-header">
                        <div className="wh-title-wrap">
                            <span className="wh-eyebrow">Inventory Management</span>
                            <h1 className="wh-title">Danh sách <span>phiếu nhập</span></h1>
                        </div>
                        <button onClick={() => navigate("/goods-receipts/create")} className="btn-gold">
                            <Plus size={16} strokeWidth={3} /> Tạo Phiếu Nhập Kho
                        </button>
                    </div>

                    {/* ── Stats ── */}
                    <div className="stats-grid">
                        <StatCard icon={Package} label="Tổng phiếu" value={total} color="#b8860b" />
                        <StatCard icon={FileText} label="Bản nháp" value={stats.nhap} color="#7a6e5f" />
                        <StatCard icon={CheckCircle2} label="Đã nhập kho" value={stats.daHoanTat} color="#16a34a" />
                        <StatCard icon={XCircle} label="Đã hủy" value={stats.daHuy} color="#dc2626" />
                    </div>

                    {/* ── Filters ── */}
                    <div className="filter-card">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#faf8f3]">
                            <Filter size={16} className="text-[#b8860b]" />
                            <span className="wh-eyebrow font-bold text-[#1a1612]">Bộ lọc nâng cao</span>
                        </div>
                        <div className="filter-grid">
                            <div className="inp-wrap">
                                <label className="inp-lbl">Số phiếu / PO</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#a89f92]" />
                                    <input 
                                        placeholder="Tìm mã phiếu..." 
                                        className="inp-field w-full pl-10"
                                        value={filters.keyword}
                                        onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value, page: 0 }))}
                                    />
                                </div>
                            </div>
                            <div className="inp-wrap">
                                <label className="inp-lbl">Nhà cung cấp</label>
                                <input 
                                    placeholder="Tên đối tác..." 
                                    className="inp-field"
                                    value={filters.nhaCungCap}
                                    onChange={(e) => setFilters(p => ({ ...p, nhaCungCap: e.target.value, page: 0 }))}
                                />
                            </div>
                            <div className="inp-wrap">
                                <label className="inp-lbl">Trạng thái</label>
                                <select 
                                    className="inp-field"
                                    value={filters.trangThai}
                                    onChange={(e) => setFilters(p => ({ ...p, trangThai: e.target.value, page: 0 }))}
                                >
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="0">Nháp</option>
                                    <option value="1">Chờ duyệt</option>
                                    <option value="3">Đã nhập kho</option>
                                    <option value="4">Đã hủy</option>
                                </select>
                            </div>
                            <div className="inp-wrap">
                                <label className="inp-lbl">Ngày nhập</label>
                                <input 
                                    type="date"
                                    className="inp-field"
                                    value={filters.ngayNhap}
                                    onChange={(e) => setFilters(p => ({ ...p, ngayNhap: e.target.value, page: 0 }))}
                                />
                            </div>
                            <div className="flex items-end">
                                <button onClick={handleReset} className="btn-white w-full">
                                    <RefreshCcw size={14} /> Đặt lại
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="wh-tbl-card">
                        <div className="p-5 border-b border-[#faf8f3] bg-[#faf8f3]/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <LayoutGrid size={14} className="text-[#b8860b]" />
                                <span className="wh-eyebrow font-bold text-[#1a1612]">Dữ liệu phiếu nhập</span>
                            </div>
                            {loading && <Loader2 size={16} className="animate-spin text-[#b8860b]" />}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="wh-tbl">
                                <thead className="wh-thead">
                                    <tr>
                                        <th className="wh-th text-center w-20">No.</th>
                                        <th className="wh-th">Mã Phiếu</th>
                                        <th className="wh-th">Nhà Cung Cấp / Kho</th>
                                        <th className="wh-th text-center">Ngày tạo</th>
                                        <th className="wh-th text-center">Trạng thái</th>
                                        <th className="wh-th text-right">Chi tiết</th>
                                    </tr>
                                </thead>
                                <tbody className="wh-tbody">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="wh-td text-center py-20 bg-white">
                                                <div className="flex flex-col items-center gap-3 opacity-30">
                                                    <ClipboardList size={48} />
                                                    <p className="font-mono text-xs uppercase tracking-widest">Không tìm thấy dữ liệu</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((item, index) => (
                                            <tr key={item.id} onClick={() => navigate(`/goods-receipts/${item.id}`)} className="cursor-pointer transition-colors duration-150 hover:bg-violet-50/50">
                                                <td className="px-4 py-3.5 align-middle text-center w-14 text-slate-500 text-xs">{filters.page * filters.size + index + 1}</td>
                                                <td className="px-4 py-3.5 align-middle font-semibold text-violet-600">{item.soPhieuNhap}</td>
                                                <td className="px-4 py-3.5 align-middle text-slate-600">{item.soDonMua || "-"}</td>
                                                <td className="px-4 py-3.5 align-middle">{item.tenNhaCungCap}</td>
                                                <td className="px-4 py-3.5 align-middle">{item.tenKho}</td>
                                                <td className="px-4 py-3.5 align-middle text-center"><span className="text-sm text-slate-500">{new Date(item.ngayTao).toLocaleDateString("vi-VN")}</span></td>
                                                <td className="px-4 py-3.5 align-middle text-center"><span className="text-sm text-slate-500">{item.ngayNhap ? new Date(item.ngayNhap).toLocaleDateString("vi-VN") : "Chưa nhập kho"}</span></td>
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_MAP[item.trangThai]?.className}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_MAP[item.trangThai]?.dot}`} />
                                                        {STATUS_MAP[item.trangThai]?.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="stat-card">
            <div>
                <p className="stat-lbl">{label}</p>
                <p className="stat-val">{value}</p>
            </div>
            <div className="stat-icon" style={{ backgroundColor: `${color}12` }}>
                <Icon size={20} style={{ color }} />
            </div>
        </div>
    );
}