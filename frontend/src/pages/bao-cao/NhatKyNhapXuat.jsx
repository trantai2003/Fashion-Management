import { useState, useEffect, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, ArrowDownToLine, ArrowUpFromLine,
  Search, RefreshCw, BarChart2, Calendar, Warehouse, ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── API ───
const BASE_URL = "http://localhost:8080/api/v1/admin/dashboard/bao-cao/nhat-ky-nhap-xuat";
const getToken = () => localStorage.getItem("access_token") ?? "";

const today = new Date();
const thisYear = today.getFullYear();
const thisMonth = today.getMonth() + 1;
const pad = (n) => String(n).padStart(2, "0");
const defaultTuNgay = `${thisYear}-${pad(thisMonth)}-01`;
const defaultDenNgay = today.toISOString().split("T")[0];

// ─── HELPERS ───
const fmt = (n) => {
  const num = Number(n || 0);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " tr";
  return num.toLocaleString("vi-VN");
};
const fmtSL = (n) => (n != null ? Number(n).toLocaleString("vi-VN") : "—");

function buildParams({ loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId, loaiGiaoDich }) {
  const p = new URLSearchParams({ loai });
  if (["ngay", "chi_tiet", "theo_kho"].includes(loai)) { p.set("tuNgay", tuNgay); p.set("denNgay", denNgay); }
  else if (["tuan", "thang"].includes(loai)) { p.set("nam", nam); }
  else if (loai === "nam") { p.set("tuNam", tuNam); p.set("denNam", denNam); }
  else if (loai === "so_sanh") { p.set("nam", nam); p.set("thang", thang); }
  if (khoId && khoId !== "ALL") p.set("khoId", khoId);
  if (loaiGiaoDich && loaiGiaoDich !== "ALL") p.set("loaiGiaoDich", loaiGiaoDich);
  return p.toString();
}

// ─── CUSTOM TOOLTIP ───
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[190px]">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3 font-mono">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-slate-600 text-xs flex-1">{entry.name}</span>
          <span className="text-slate-900 font-bold text-xs font-mono">{fmtSL(entry.value)}</span>
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
function MiniSparkline({ data, dataKey, color }) {
  if (!data?.length) return null;
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sparkGrad_${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#sparkGrad_${dataKey})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── PROGRESS BAR ───
function ProgressBar({ pct, color }) {
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

// ─── BADGE LOẠI GD ───
function LoaiGdBadge({ loai }) {
  const map = {
    nhap_kho: { label: "Nhập kho", cls: "bg-emerald-50 text-emerald-700" },
    xuat_kho: { label: "Xuất kho", cls: "bg-rose-50 text-rose-700" },
    chuyen_kho: { label: "Chuyển kho", cls: "bg-amber-50 text-amber-700" },
    dieu_chinh: { label: "Điều chỉnh", cls: "bg-indigo-50 text-indigo-700" },
  };
  const cfg = map[loai] || { label: loai || "—", cls: "bg-slate-50 text-slate-600" };
  return <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── MAIN ───
export default function NhatKyNhapXuat() {
  const [loai, setLoai] = useState("thang");
  const [nam, setNam] = useState(thisYear);
  const [thang, setThang] = useState(thisMonth);
  const [tuNam, setTuNam] = useState(thisYear - 4);
  const [denNam, setDenNam] = useState(thisYear);
  const [tuNgay, setTuNgay] = useState(defaultTuNgay);
  const [denNgay, setDenNgay] = useState(defaultDenNgay);
  const [khoId, setKhoId] = useState("ALL");
  const [loaiGiaoDich, setLoaiGiaoDich] = useState("ALL");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildParams({ loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId, loaiGiaoDich });
      const res = await fetch(`${BASE_URL}?${params}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      });
      const json = await res.json();
      setData(Array.isArray(json) ? json : json.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId, loaiGiaoDich]);

  useEffect(() => { fetchData(); }, [loai, khoId, loaiGiaoDich]);

  const chartData = data.map(d => ({
    ...d,
    tongNhap: Number(d.tongNhap || 0),
    tongXuat: Number(d.tongXuat || 0),
    chenhLech: Number(d.chenhLech || 0),
    tongGiaTriNhap: Number(d.tongGiaTriNhap || 0),
    tongGiaTriXuat: Number(d.tongGiaTriXuat || 0),
  }));

  const kpi = chartData.reduce(
    (acc, d) => ({
      tongNhap: acc.tongNhap + d.tongNhap,
      tongXuat: acc.tongXuat + d.tongXuat,
      tongGtrNhap: acc.tongGtrNhap + d.tongGiaTriNhap,
      tongGtrXuat: acc.tongGtrXuat + d.tongGiaTriXuat,
    }),
    { tongNhap: 0, tongXuat: 0, tongGtrNhap: 0, tongGtrXuat: 0 }
  );

  const tongChenhLech = kpi.tongNhap - kpi.tongXuat;
  const nhapPct = kpi.tongNhap + kpi.tongXuat > 0 ? Math.round((kpi.tongNhap / (kpi.tongNhap + kpi.tongXuat)) * 100) : 50;
  const xuatPct = 100 - nhapPct;
  const gtrNhapPct = kpi.tongGtrNhap + kpi.tongGtrXuat > 0
    ? Math.round((kpi.tongGtrNhap / (kpi.tongGtrNhap + kpi.tongGtrXuat)) * 100) : 50;

  const tabConfig = [
    { key: "ngay", label: "Theo ngày" },
    { key: "tuan", label: "Theo tuần" },
    { key: "thang", label: "Theo tháng" },
    { key: "nam", label: "Theo năm" },
    { key: "so_sanh", label: "So sánh" },
    { key: "chi_tiet", label: "Chi tiết GD" },
    { key: "theo_kho", label: "Theo kho" },
  ];

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={ArrowDownToLine} label="Tổng SL nhập"
          value={fmtSL(kpi.tongNhap)} sub={`${chartData.length} kỳ thống kê`}
          colorClass="text-emerald-700" bgClass="bg-emerald-100" borderClass="border-emerald-100" />
        <KpiCard icon={ArrowUpFromLine} label="Tổng SL xuất"
          value={fmtSL(kpi.tongXuat)} sub={`Chênh lệch: ${tongChenhLech >= 0 ? "+" : ""}${fmtSL(tongChenhLech)}`}
          colorClass="text-rose-700" bgClass="bg-rose-100" borderClass="border-rose-100" />
        <KpiCard icon={TrendingDown} label="Giá trị nhập"
          value={fmt(kpi.tongGtrNhap)} sub={`${gtrNhapPct}% tổng giá trị`}
          colorClass="text-purple-700" bgClass="bg-purple-100" borderClass="border-purple-100" />
        <KpiCard icon={TrendingUp} label="Giá trị xuất"
          value={fmt(kpi.tongGtrXuat)} sub="Giá trị xuất kho"
          colorClass="text-indigo-700" bgClass="bg-indigo-100" borderClass="border-indigo-100" />
      </div>

      {/* ── FILTER PANEL ── */}
      <Card className="border-0 shadow-md bg-white">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-purple-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bộ lọc nhật ký</span>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Tab group */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
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

            {/* Date range */}
            {["ngay", "chi_tiet", "theo_kho"].includes(loai) && (
              <div className="flex items-center gap-2">
                <Input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)}
                  className="border-slate-200 text-slate-700 h-10 text-sm" />
                <span className="text-slate-400 font-medium">→</span>
                <Input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)}
                  className="border-slate-200 text-slate-700 h-10 text-sm" />
              </div>
            )}

            {/* Year */}
            {["tuan", "thang", "so_sanh"].includes(loai) && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">NĂM</span>
                <select
                  value={nam}
                  onChange={e => setNam(+e.target.value)}
                  className="pl-10 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 appearance-none w-[120px]"
                >
                  {Array.from({ length: 8 }, (_, i) => thisYear - 7 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Month for compare */}
            {loai === "so_sanh" && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">T</span>
                <select
                  value={thang}
                  onChange={e => setThang(+e.target.value)}
                  className="pl-7 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-purple-300 appearance-none w-[90px]"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>T{i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Year range */}
            {loai === "nam" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">TỪ</span>
                  <select value={tuNam} onChange={e => setTuNam(+e.target.value)}
                    className="pl-8 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-purple-300 appearance-none w-[110px]">
                    {Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <span className="text-slate-400 font-medium">→</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 text-[10px] font-bold pointer-events-none">ĐẾN</span>
                  <select value={denNam} onChange={e => setDenNam(+e.target.value)}
                    className="pl-10 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-purple-300 appearance-none w-[110px]">
                    {Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Kho */}
            <div className="relative">
              <Warehouse size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <Select value={khoId} onValueChange={setKhoId}>
                <SelectTrigger className="pl-9 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-slate-400 min-w-[180px]">
                  <SelectValue placeholder="Tất cả kho" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg z-50" position="popper" sideOffset={4}>
                  <SelectItem value="ALL">Tất cả kho</SelectItem>
                  <SelectItem value="1">KHO01 – Hà Nội</SelectItem>
                  <SelectItem value="2">KHO02 – Miền Nam</SelectItem>
                  <SelectItem value="3">KHO03 – Miền Trung</SelectItem>
                  <SelectItem value="4">KHO04 – Ngoại thành</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loại GD */}
            <div className="relative">
              <ArrowLeftRight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <Select value={loaiGiaoDich} onValueChange={setLoaiGiaoDich}>
                <SelectTrigger className="pl-9 pr-4 h-10 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-slate-400 min-w-[160px]">
                  <SelectValue placeholder="Tất cả loại GD" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg z-50" position="popper" sideOffset={4}>
                  <SelectItem value="ALL">Tất cả loại GD</SelectItem>
                  <SelectItem value="nhap_kho">Nhập kho</SelectItem>
                  <SelectItem value="xuat_kho">Xuất kho</SelectItem>
                  <SelectItem value="chuyen_kho">Chuyển kho</SelectItem>
                  <SelectItem value="dieu_chinh">Điều chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={fetchData}
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
                <CardTitle className="text-base font-bold text-slate-800">Biểu đồ nhập xuất kho</CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">Số lượng nhập, xuất &amp; chênh lệch tồn kho theo kỳ</CardDescription>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-300 inline-block" />Nhập kho
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />Xuất kho
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-0.5 bg-amber-700 inline-block rounded-full" />Chênh lệch
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-5">
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradNhap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f7df9f" />
                    <stop offset="100%" stopColor="#e8b923" />
                  </linearGradient>
                  <linearGradient id="gradXuat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f3cf6a" />
                    <stop offset="100%" stopColor="#c79500" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="nhanThoiGian" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "#f1f5f9" }} tickLine={false} />
                <YAxis tickFormatter={fmtSL} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(184,134,11,0.08)" }} />
                <Bar dataKey="tongNhap" name="Nhập kho" fill="url(#gradNhap)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="tongXuat" name="Xuất kho" fill="url(#gradXuat)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line dataKey="chenhLech" name="Chênh lệch" stroke="#8f6500" strokeWidth={2.5}
                  dot={{ r: 3, fill: "#8f6500", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side summary */}
        <div className="flex flex-col gap-3">
          {[
            { label: "Nhập kho", value: fmtSL(kpi.tongNhap), pct: nhapPct, color: "#10b981", textColor: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Xuất kho", value: fmtSL(kpi.tongXuat), pct: xuatPct, color: "#f43f5e", textColor: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100" },
            { label: "Giá trị nhập", value: fmt(kpi.tongGtrNhap), pct: gtrNhapPct, color: "#8b5cf6", textColor: "text-purple-700", bg: "bg-purple-50", border: "border-purple-100" },
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
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Xu hướng nhập kho</p>
                <MiniSparkline data={chartData} dataKey="tongNhap" color="#10b981" />
              </CardContent>
            </Card>
          )}

          <Card className="border border-indigo-100 shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Chỉ số nhanh</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Nhập TB / kỳ</span>
                <span className="text-xs font-bold text-emerald-700">
                  {chartData.length > 0 ? fmtSL(Math.round(kpi.tongNhap / chartData.length)) : "—"}
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Xuất TB / kỳ</span>
                <span className="text-xs font-bold text-rose-700">
                  {chartData.length > 0 ? fmtSL(Math.round(kpi.tongXuat / chartData.length)) : "—"}
                </span>
              </div>
              <div className="h-px bg-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Tỷ lệ nhập/xuất</span>
                <span className={`text-xs font-bold ${tongChenhLech >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {kpi.tongXuat > 0 ? (kpi.tongNhap / kpi.tongXuat).toFixed(2) : "—"}x
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
              <CardTitle className="text-base font-bold text-slate-800">Chi tiết nhật ký nhập xuất</CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">{chartData.length} kỳ được tổng hợp</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70">
                  {["#", "Thời kỳ", "SL Nhập", "SL Xuất", "Chênh lệch", "Giá trị nhập", "Giá trị xuất", "Loại GD"].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap ${i > 1 ? "text-right" : "text-left"} ${i === 7 ? "text-center" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {chartData.map((row, i) => {
                  const cl = row.tongNhap - row.tongXuat;
                  return (
                    <tr key={i} className="hover:bg-purple-50/50 transition-colors duration-100">
                      <td className="px-5 py-3.5 text-xs text-slate-300 font-medium">{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.nhanThoiGian}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-bold text-emerald-700">{fmtSL(row.tongNhap)}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-bold text-rose-600">{fmtSL(row.tongXuat)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${cl >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {cl >= 0 ? "+" : ""}{fmtSL(cl)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm text-purple-700 font-semibold">{fmt(row.tongGiaTriNhap)}</td>
                      <td className="px-5 py-3.5 text-right text-sm text-indigo-700 font-semibold">{fmt(row.tongGiaTriXuat)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {row.loaiGiaoDich ? <LoaiGdBadge loai={row.loaiGiaoDich} /> : <span className="text-xs text-slate-300">—</span>}
                      </td>
                    </tr>
                  );
                })}

                {chartData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
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
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-emerald-700">{fmtSL(kpi.tongNhap)}</td>
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-rose-600">{fmtSL(kpi.tongXuat)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tongChenhLech >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {tongChenhLech >= 0 ? "+" : ""}{fmtSL(tongChenhLech)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-purple-700">{fmt(kpi.tongGtrNhap)}</td>
                    <td className="px-5 py-4 text-right text-sm font-extrabold text-indigo-700">{fmt(kpi.tongGtrXuat)}</td>
                    <td />
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