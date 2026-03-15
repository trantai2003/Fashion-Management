import { useEffect, useState, useMemo } from "react";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { useNavigate } from "react-router-dom";
import {
  Loader2, Search, RefreshCcw, Package, Plus,
  ChevronDown, ChevronLeft, ChevronRight, Check, Filter,
  FileText, CheckCircle2, XCircle, ClipboardList,
  ArrowUpRight, Warehouse, PlusCircle
} from "lucide-react";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury (đồng bộ với Warehouse)
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

/* Root & nền */
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
  animation: whGrid 40s linear infinite;
}
@keyframes whGrid { to { background-position: 56px 56px; } }

.wh-orb-1 {
  position: fixed; width: 580px; height: 580px; border-radius: 50%;
  background: rgba(184,134,11,0.07); filter: blur(110px);
  top: -180px; right: -130px; pointer-events: none; z-index: 0;
}
.wh-orb-2 {
  position: fixed; width: 420px; height: 420px; border-radius: 50%;
  background: rgba(201,150,12,0.05); filter: blur(100px);
  bottom: -110px; left: -90px; pointer-events: none; z-index: 0;
}

/* Inner */
.wh-inner {
  position: relative; z-index: 1;
  max-width: 1440px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* Nút thêm mới */
.wh-btn-add {
  height: 46px; padding: 0 24px; border-radius: 12px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff; font-weight: 700; font-size: 14px;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  box-shadow: 0 5px 18px rgba(184,134,11,0.32);
  transition: all 0.22s;
}
.wh-btn-add:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(184,134,11,0.48); }

/* Header */
.wh-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 20px; border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.wh-title {
  font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900;
  color: #1a1612; letter-spacing: -0.6px;
}
.wh-title span { color: #b8860b; }

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;
}
.stat-card {
  background: #fff; border: 1px solid rgba(184,134,11,0.14);
  border-radius: 18px; padding: 24px;
  box-shadow: 0 4px 16px rgba(100,80,30,0.06);
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.28s;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(100,80,30,0.12); border-color: #b8860b; }
.stat-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.stat-label { font-family: 'DM Mono', monospace; font-size: 11px; text-transform: uppercase; color: #a89f92; letter-spacing: 0.12em; }
.stat-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 900; color: #1a1612; margin-top: 4px; }

/* Table card */
.wh-table-card {
  background: #fff; border-radius: 20px; overflow: hidden;
  box-shadow: 0 6px 24px rgba(100,80,30,0.08);
  border: 1px solid rgba(184,134,11,0.12);
}
.wh-th {
  background: #faf8f3; font-family: 'DM Mono', monospace; font-size: 11px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: #b8860b; padding: 16px 20px; border-bottom: 2px solid rgba(184,134,11,0.15);
}
.wh-td { padding: 16px 20px; color: #1a1612; font-size: 14px; }
.wh-tr:hover { background: rgba(184,134,11,0.04); transition: background 0.18s; }

/* Pagination */
.wh-pag-btn {
  padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(184,134,11,0.2);
  background: white; color: #b8860b; font-weight: 600; cursor: pointer;
  transition: all 0.18s;
}
.wh-pag-btn:hover:not(:disabled) { background: #fef9c3; }
.wh-pag-btn:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const STATUS_UI = {
  0: { label: "Nháp", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  1: { label: "Đã nhập", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  2: { label: "Đã hủy", cls: "bg-red-100 text-red-800 border-red-200" },
  // thêm trạng thái khác nếu có
};

export default function PhieuNhapKhoList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    page: 0,
    size: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, imported: 0, draft: 0 });

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.size]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await phieuNhapKhoService.getAll(filters);
      setData(res.content || []);
      setTotalPages(res.totalPages || 1);

      // Giả định API trả stats hoặc tính từ response
      setStats({
        total: res.totalElements || 0,
        imported: res.content?.filter(i => i.trangThai === 1).length || 0,
        draft: res.content?.filter(i => i.trangThai === 0).length || 0,
      });
    } catch (err) {
      toast.error("Không tải được danh sách phiếu nhập kho");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 0 }));
  };

  const handleReset = () => {
    setFilters({ search: "", status: "all", page: 0, size: 10 });
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(item =>
        item.soPhieuNhap?.toLowerCase().includes(term) ||
        item.tenNhaCungCap?.toLowerCase().includes(term) ||
        item.tenKho?.toLowerCase().includes(term)
      );
    }
    if (filters.status !== "all") {
      result = result.filter(item => item.trangThai === Number(filters.status));
    }
    return result;
  }, [data, filters.search, filters.status]);

  return (
    <>
      <style>{STYLES}</style>
      <div className="wh-root">
        <div className="wh-grid" />
        <div className="wh-orb-1" />
        <div className="wh-orb-2" />

        <div className="wh-inner">
          {/* Header */}
          <div className="wh-header">
            <div>
              
            </div>
            <button
              className="wh-btn-add"
              onClick={() => navigate("/goods-receipts/create")}
            >
              <PlusCircle size={18} /> Tạo phiếu nhập mới
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              icon={Package}
              label="Tổng phiếu nhập"
              value={stats.total}
              color="#b8860b"
            />
            <StatCard
              icon={CheckCircle2}
              label="Đã nhập kho"
              value={stats.imported}
              color="#10b981"
            />
            <StatCard
              icon={FileText}
              label="Nháp / Đang chờ"
              value={stats.draft}
              color="#f59e0b"
            />
          </div>

          {/* Filter */}
          <div className="filter-card">
            <div className="filter-grid">
              <div className="inp-wrap">
                <label className="inp-lbl">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600/60" />
                  <input
                    type="text"
                    placeholder="Số phiếu, nhà cung cấp, kho..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="inp-wrap">
                <label className="inp-lbl">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={e => handleStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-amber-200 focus:border-amber-500 bg-white"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="0">Nháp</option>
                  <option value="1">Đã nhập</option>
                  <option value="2">Đã hủy</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Đặt lại
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="wh-table-card">
            {loading ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-amber-600" />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="py-20 text-center">
                <ClipboardList size={64} className="mx-auto text-amber-200" strokeWidth={1} />
                <h3 className="mt-6 text-xl font-semibold text-slate-700">Chưa có phiếu nhập kho nào</h3>
                <p className="mt-3 text-slate-500 max-w-md mx-auto">
                  Tạo phiếu nhập mới hoặc thay đổi bộ lọc để xem dữ liệu.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="wh-th text-center w-12">#</th>
                        <th className="wh-th">Số phiếu / PO</th>
                        <th className="wh-th">Nhà cung cấp / Kho</th>
                        <th className="wh-th text-center">Ngày tạo</th>
                        <th className="wh-th text-center">Ngày nhập</th>
                        <th className="wh-th text-center">Trạng thái</th>
                        <th className="wh-th text-right pr-8">Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/goods-receipts/${item.id}`)}
                          className="wh-tr cursor-pointer group"
                        >
                          <td className="wh-td text-center text-slate-500 text-xs">
                            {filters.page * filters.size + index + 1}
                          </td>
                          <td className="wh-td">
                            <div className="flex flex-col">
                              <span className="font-bold text-amber-700">#{item.soPhieuNhap}</span>
                              <span className="text-xs text-slate-500 font-mono">
                                PO: {item.soDonMua || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="wh-td">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800">{item.tenNhaCungCap}</span>
                              <span className="text-xs text-amber-700 flex items-center gap-1.5 mt-0.5">
                                <Warehouse size={12} /> {item.tenKho}
                              </span>
                            </div>
                          </td>
                          <td className="wh-td text-center text-slate-600 text-sm">
                            {new Date(item.ngayTao).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="wh-td text-center text-slate-600 text-sm">
                            {item.ngayNhap
                              ? new Date(item.ngayNhap).toLocaleDateString("vi-VN")
                              : "—"}
                          </td>
                          <td className="wh-td text-center">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${STATUS_UI[item.trangThai]?.cls || "bg-slate-100 text-slate-700 border-slate-200"}`}
                            >
                              {STATUS_UI[item.trangThai]?.label || "Không xác định"}
                            </span>
                          </td>
                          <td className="wh-td text-right pr-8">
                            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-50/50 text-amber-700 opacity-0 group-hover:opacity-100 transition-all">
                              <ArrowUpRight size={18} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-amber-100 flex items-center justify-between text-sm text-slate-600">
                  <div>
                    Hiển thị <span className="font-medium">{filteredData.length}</span> / {stats.total} phiếu
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      className="wh-pag-btn"
                      disabled={filters.page === 0}
                      onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="px-4 font-medium">
                      {filters.page + 1} / {totalPages}
                    </span>

                    <button
                      className="wh-pag-btn"
                      disabled={filters.page >= totalPages - 1}
                      onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value.toLocaleString("vi-VN")}</p>
      </div>
      <div className="stat-icon-wrap" style={{ backgroundColor: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  );
}