import { useState, useEffect, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, DollarSign, Package, Percent,
  Search, RefreshCw, BarChart2, Calendar, Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── API ───
const API_BASE = "http://localhost:8080/api/v1";
const getAuthHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}` });

async function fetchKhoList() {
  const res = await fetch(`${API_BASE}/kho/filter`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({ filters: [], sorts: [], page: 0, size: 100 }),
  });
  const json = await res.json();
  return json?.data?.content ?? [];
}

async function fetchDoanhThu(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== "") query.set(k, v); });
  const res = await fetch(`${API_BASE}/admin/dashboard/bao-cao/doanh-thu?${query}`, { headers: getAuthHeader() });
  const json = await res.json();
  return json?.data ?? [];
}

// ─── HELPERS ───
const fmt = (n) => {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " tr";
  return num.toLocaleString("vi-VN");
};

// ─── CUSTOM TOOLTIP ───
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[180px]">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-600 text-xs flex-1">{entry.name}</span>
          <span className="text-slate-900 font-bold text-xs">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI CARD ───
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

// ─── MINI SPARKLINE ───
function MiniSparkline({ data, color }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="doanhThu" stroke={color} strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── PROGRESS BAR ───
function ProgressBar({ pct, color }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

// ─── MAIN ───
export default function BaoCaoDoanhThu() {
  const [loai, setLoai] = useState("thang");
  const [khoId, setKhoId] = useState("ALL");
  const [khoList, setKhoList] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [tuNam, setTuNam] = useState(new Date().getFullYear() - 4);
  const [denNam, setDenNam] = useState(new Date().getFullYear());
  const [tuNgay, setTuNgay] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [denNgay, setDenNgay] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchKhoList().then(list => setKhoList(list.filter(k => k.trangThai !== 0)));
  }, []);

  const buildParams = useCallback(() => {
    const base = { loai, ...(khoId !== "ALL" ? { khoId } : {}) };
    if (loai === "ngay") return { ...base, tuNgay, denNgay };
    if (loai === "nam") return { ...base, tuNam, denNam };
    if (loai === "so_sanh") return { ...base, nam, thang };
    return { ...base, nam };
  }, [loai, khoId, tuNgay, denNgay, nam, tuNam, denNam, thang]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchDoanhThu(buildParams())); }
    catch { setData([]); }
    setLoading(false);
  }, [buildParams]);

  useEffect(() => { loadData(); }, [loai, khoId]);

  const chartData = data.map(d => ({
    ...d,
    doanhThu: Number(d.doanhThu || 0),
    giaVon: Number(d.giaVon || 0),
    loiNhuan: Number(d.loiNhuan || 0),
    soLuongDon: Number(d.soLuongDon || 0),
    tyLeLaiGop: Number(d.tyLeLaiGop || 0),
  }));

  const totalDoanhThu = chartData.reduce((s, d) => s + d.doanhThu, 0);
  const totalLoiNhuan = chartData.reduce((s, d) => s + d.loiNhuan, 0);
  const totalGiaVon = chartData.reduce((s, d) => s + d.giaVon, 0);
  const totalDon = chartData.reduce((s, d) => s + d.soLuongDon, 0);
  const avgTyLe = chartData.length
    ? (chartData.reduce((s, d) => s + d.tyLeLaiGop, 0) / chartData.length).toFixed(2)
    : 0;

  const loiNhuanPct = totalDoanhThu ? Math.round((totalLoiNhuan / totalDoanhThu) * 100) : 0;
  const giaVonPct = totalDoanhThu ? Math.round((totalGiaVon / totalDoanhThu) * 100) : 0;

  const tabConfig = [
    { key: "ngay", label: "Theo ngày" },
    { key: "thang", label: "Theo tháng" },
    { key: "nam", label: "Theo năm" },
    { key: "so_sanh", label: "So sánh" },
  ];

  return (
    <div className="lux-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Tổng doanh thu" value={fmt(totalDoanhThu)}
          sub={`${chartData.length} kỳ thống kê`}
          colorClass="text-purple-700" bgClass="bg-purple-100" borderClass="border-purple-100" />
        <KpiCard icon={TrendingUp} label="Lợi nhuận gộp" value={fmt(totalLoiNhuan)}
          sub={`Chiếm ${loiNhuanPct}% doanh thu`}
          colorClass="text-emerald-700" bgClass="bg-emerald-100" borderClass="border-emerald-100" />
        <KpiCard icon={Percent} label="Tỷ lệ lãi gộp TB" value={avgTyLe + "%"}
          sub="Trung bình các kỳ"
          colorClass="text-indigo-700" bgClass="bg-indigo-100" borderClass="border-indigo-100" />
        <KpiCard icon={Package} label="Tổng đơn hàng" value={totalDon.toLocaleString()}
          sub="Đơn hàng hoàn thành"
          colorClass="text-amber-700" bgClass="bg-amber-100" borderClass="border-amber-100" />
      </div>

      {/* ── FILTER PANEL ── */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-purple-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bộ lọc báo cáo</span>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Tab group */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
              {tabConfig.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setLoai(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border-0 ${loai === key
                    ? "bg-white text-purple-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700 bg-transparent"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loai === "ngay" && (
              <div className="flex items-center gap-2">
                <Input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)}
                  className="border-slate-200 text-slate-700 h-10 text-sm" />
                <span className="text-slate-400 font-medium">→</span>
                <Input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)}
                  className="border-slate-200 text-slate-700 h-10 text-sm" />
              </div>
            )}

            {(loai === "thang" || loai === "so_sanh") && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">NĂM</span>
                <Input type="number" value={nam} onChange={e => setNam(e.target.value)}
                  className="w-[110px] pl-10 border-slate-200 h-10 text-sm text-slate-700" />
              </div>
            )}

            {loai === "nam" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">TỪ</span>
                  <Input type="number" value={tuNam} onChange={e => setTuNam(e.target.value)}
                    className="w-[110px] pl-8 border-slate-200 h-10 text-sm text-slate-700" />
                </div>
                <span className="text-slate-400 font-medium">→</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">ĐẾN</span>
                  <Input type="number" value={denNam} onChange={e => setDenNam(e.target.value)}
                    className="w-[110px] pl-10 border-slate-200 h-10 text-sm text-slate-700" />
                </div>
              </div>
            )}

            {loai === "so_sanh" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">T</span>
                <Input type="number" value={thang} onChange={e => setThang(e.target.value)}
                  className="w-[90px] pl-7 border-slate-200 h-10 text-sm text-slate-700" />
              </div>
            )}

            <div className="relative">
              <Warehouse size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <Select value={khoId} onValueChange={setKhoId}>
                <SelectTrigger className="pl-9 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-slate-400 focus:border-slate-400 min-w-[200px]">
                  <SelectValue placeholder="Tất cả kho" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg z-50" position="popper" sideOffset={4}>
                  <SelectItem value="ALL" className="text-slate-700 cursor-pointer focus:bg-slate-50 hover:bg-slate-50">Tất cả kho</SelectItem>
                  {khoList.map(k => (
                    <SelectItem key={k.id} value={String(k.id)} className="text-slate-700 cursor-pointer focus:bg-slate-50 hover:bg-slate-50">
                      [{k.maKho}] {k.tenKho}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={loadData}
              disabled={loading}
              className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 active:bg-slate-100 h-10 px-5 shadow-md shadow-slate-200 transition-all duration-150 gap-2"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
              Xem báo cáo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── CHART + SUMMARY ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">

        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="pb-2 pt-5 px-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Biểu đồ doanh thu</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">Doanh thu, giá vốn &amp; lợi nhuận theo kỳ</CardDescription>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-slate-200 inline-block" />Giá vốn
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-purple-400 inline-block" />Lợi nhuận
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 bg-emerald-500 inline-block rounded-full" />Doanh thu
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-5">
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradGiaVon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                  <linearGradient id="gradLoiNhuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="nhanThoiGian" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#f1f5f9" }} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139,92,246,0.04)" }} />
                <Bar dataKey="giaVon" name="Giá vốn" stackId="a" fill="url(#gradGiaVon)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="loiNhuan" name="Lợi nhuận" stackId="a" fill="url(#gradLoiNhuan)" radius={[4, 4, 0, 0]} />
                <Line dataKey="doanhThu" name="Doanh thu" stroke="#10b981" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side summary */}
        <div className="flex flex-col gap-3">
          {[
            { label: "Doanh thu", value: fmt(totalDoanhThu), pct: 100, color: "#8b5cf6", textColor: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
            { label: "Giá vốn", value: fmt(totalGiaVon), pct: giaVonPct, color: "#94a3b8", textColor: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" },
            { label: "Lợi nhuận", value: fmt(totalLoiNhuan), pct: loiNhuanPct, color: "#10b981", textColor: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
          ].map(item => (
            <Card key={item.label} className={`border ${item.border} shadow-sm bg-white`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{item.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.bg} ${item.textColor}`}>{item.pct}%</span>
                </div>
                <p className={`text-xl font-bold ${item.textColor} mb-3`}>{item.value}</p>
                <ProgressBar pct={item.pct} color={item.color} />
              </CardContent>
            </Card>
          ))}

          {chartData.length > 1 && (
            <Card className="border border-emerald-100 shadow-sm bg-white">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Xu hướng doanh thu</p>
                <MiniSparkline data={chartData} color="#8b5cf6" />
              </CardContent>
            </Card>
          )}

          <Card className="border border-indigo-100 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chỉ số nhanh</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Giá trị TB / đơn</span>
                <span className="text-xs font-bold text-purple-700">{totalDon > 0 ? fmt(totalDoanhThu / totalDon) : "—"}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">LN trung bình / kỳ</span>
                <span className="text-xs font-bold text-emerald-700">{chartData.length > 0 ? fmt(totalLoiNhuan / chartData.length) : "—"}</span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Tỷ lệ lãi gộp TB</span>
                <span className={`text-xs font-bold ${Number(avgTyLe) >= 20 ? "text-emerald-700" : Number(avgTyLe) >= 10 ? "text-amber-600" : "text-rose-600"}`}>
                  {avgTyLe}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <Card className="border-0 shadow-md bg-white">
        <CardHeader className="pb-3 pt-5 px-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">Chi tiết số liệu</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">{chartData.length} kỳ được tổng hợp</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70">
                  {["#", "Thời kỳ", "Doanh thu", "Giá vốn", "Lợi nhuận", "Tỷ lệ lãi", "Số đơn"].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap ${i > 1 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {chartData.map((row, i) => (
                  <tr key={i} className="hover:bg-purple-50/50 transition-colors duration-100">
                    <td className="px-5 py-3.5 text-xs text-slate-300 font-medium">{String(i + 1).padStart(2, "0")}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.nhanThoiGian}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-purple-700">{fmt(row.doanhThu)}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-slate-500">{fmt(row.giaVon)}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-emerald-700">{fmt(row.loiNhuan)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${row.tyLeLaiGop >= 20 ? "bg-emerald-50 text-emerald-700"
                        : row.tyLeLaiGop >= 10 ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                        }`}>
                        {row.tyLeLaiGop.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-slate-600">{row.soLuongDon.toLocaleString()}</td>
                  </tr>
                ))}

                {chartData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <BarChart2 size={24} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Không có dữ liệu</p>
                        <p className="text-xs text-slate-400">Hãy thay đổi bộ lọc và thử lại</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

              {chartData.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <td colSpan={2} className="px-5 py-4 text-xs font-bold text-slate-600 uppercase tracking-wide">Tổng cộng</td>
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-purple-700">{fmt(totalDoanhThu)}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-500">{fmt(totalGiaVon)}</td>
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-emerald-700">{fmt(totalLoiNhuan)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">{avgTyLe}%</span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-slate-600">{totalDon.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}