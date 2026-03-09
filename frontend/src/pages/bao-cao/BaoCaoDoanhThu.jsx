import { useState, useEffect, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── API BASE URL ─────────────────────────────────────────────────────────────
const API_BASE = "http://localhost:8080/api/v1";

const getAuthHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
});

// ─── API: Lấy danh sách kho (KhoDto[]) ───────────────────────────────────────
async function fetchKhoList() {
  const res = await fetch(`${API_BASE}/kho/filter`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ filters: [], sorts: [], page: 0, size: 100 }),
  });
  if (!res.ok) throw new Error("Không thể tải danh sách kho");
  const json = await res.json();
  // ResponseData<Page<KhoDto>> → json.data.content
  return json?.data?.content ?? [];
}

// ─── API: Lấy báo cáo doanh thu (DoanhThuChartDTO[]) ─────────────────────────
async function fetchDoanhThu(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") query.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/admin/dashboard/bao-cao/doanh-thu?${query}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
    },
  });
  if (!res.ok) throw new Error("Không thể tải dữ liệu doanh thu");
  const json = await res.json();
  // ResponseData<List<DoanhThuChartDTO>> → json.data
  return json?.data ?? [];
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (!n && n !== 0) return "—";
  const num = Number(n);
  if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
  if (Math.abs(num) >= 1_000_000)     return (num / 1_000_000).toFixed(1) + " tr";
  return num.toLocaleString("vi-VN");
};

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #334155",
      borderRadius: 12, padding: "14px 18px", minWidth: 230,
      boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
    }}>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 6 }}>
          <span style={{ color: p.color, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, display: "inline-block" }} />
            {p.name}
          </span>
          <span style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
            {p.name === "Đơn hàng" ? Number(p.value).toLocaleString("vi-VN") : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    border: `1px solid ${color}22`,
    borderRadius: 16, padding: "20px 24px",
    position: "relative", overflow: "hidden", flex: 1, minWidth: 180
  }}>
    <div style={{
      position: "absolute", top: -20, right: -20, width: 100, height: 100,
      borderRadius: "50%", background: `${color}12`, filter: "blur(20px)"
    }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <span style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>
        {label}
      </span>
      <span style={{ fontSize: 20 }}>{icon}</span>
    </div>
    <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
      {value}
    </div>
    <div style={{ marginTop: 6 }}>
      <span style={{ fontSize: 11, color: "#475569" }}>{sub}</span>
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: "0 0 16px 16px" }} />
  </div>
);

// ─── TAB BUTTON ───────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
    transition: "all 0.2s",
    background: active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
    color: active ? "#fff" : "#64748b",
    boxShadow: active ? "0 4px 20px #6366f144" : "none",
  }}>
    {children}
  </button>
);

const inputStyle = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  color: "#e2e8f0", padding: "8px 12px", fontSize: 13,
  fontFamily: "'DM Mono', monospace", outline: "none", width: "100%"
};
const labelStyle = {
  fontSize: 11, color: "#64748b", marginBottom: 4, display: "block",
  letterSpacing: "0.06em", textTransform: "uppercase"
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BaoCaoDoanhThu() {
  const [loai, setLoai]       = useState("thang");
  const [khoId, setKhoId]     = useState("");
  const [khoList, setKhoList] = useState([]);   // KhoDto[]
  const [data, setData]       = useState([]);   // DoanhThuChartDTO[] (raw, BigDecimal as string)
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // params theo loai
  const [tuNgay, setTuNgay]   = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); });
  const [denNgay, setDenNgay] = useState(() => new Date().toISOString().slice(0, 10));
  const [nam, setNam]         = useState(new Date().getFullYear());
  const [tuNam, setTuNam]     = useState(new Date().getFullYear() - 4);
  const [denNam, setDenNam]   = useState(new Date().getFullYear());
  const [thang, setThang]     = useState(new Date().getMonth() + 1);

  // ── Load danh sách kho một lần khi mount ────────────────────────────────────
  useEffect(() => {
    fetchKhoList()
      .then(list => setKhoList(list.filter(k => k.trangThai !== 0))) // bỏ kho xóa mềm
      .catch(err => console.error("Lỗi tải kho:", err));
  }, []);

  // ── Build query params theo loại ────────────────────────────────────────────
  const buildParams = useCallback(() => {
    const base = { loai, ...(khoId ? { khoId } : {}) };
    switch (loai) {
      case "ngay":    return { ...base, tuNgay, denNgay };
      case "tuan":    return { ...base, nam };
      case "thang":   return { ...base, nam };
      case "nam":     return { ...base, tuNam, denNam };
      case "so_sanh": return { ...base, nam, thang };
      default:        return base;
    }
  }, [loai, khoId, tuNgay, denNgay, nam, tuNam, denNam, thang]);

  // ── Gọi API lấy doanh thu ────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchDoanhThu(buildParams())
      .then(setData)
      .catch(err => { setError(err.message); setData([]); })
      .finally(() => setLoading(false));
  }, [buildParams]);

  // Auto-load khi đổi loai
  useEffect(() => { loadData(); }, [loai]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chuyển BigDecimal (string từ JSON) → number cho Recharts ─────────────────
  const chartData = data.map(d => ({
    ...d,
    tienHang:     Number(d.tienHang     || 0),
    phiVanChuyen: Number(d.phiVanChuyen || 0),
    doanhThu:     Number(d.doanhThu     || 0),
    giaVon:       Number(d.giaVon       || 0),
    loiNhuan:     Number(d.loiNhuan     || 0),
    soLuongDon:   Number(d.soLuongDon   || 0),
    tyLeLaiGop:   Number(d.tyLeLaiGop   || 0),
  }));

  // ── KPI summary ──────────────────────────────────────────────────────────────
  const totalDoanhThu   = chartData.reduce((s, d) => s + d.doanhThu,   0);
  const totalLoiNhuan   = chartData.reduce((s, d) => s + d.loiNhuan,   0);
  const totalDon        = chartData.reduce((s, d) => s + d.soLuongDon, 0);
  const avgTyLe         = chartData.length
    ? (chartData.reduce((s, d) => s + d.tyLeLaiGop, 0) / chartData.length).toFixed(2)
    : "0.00";

  // Kho đang chọn (để hiển thị badge)
  const selectedKho = khoList.find(k => String(k.id) === String(khoId));

  const tabs = [
    { key: "ngay",    label: "Theo ngày"  },
    { key: "tuan",    label: "Theo tuần"  },
    { key: "thang",   label: "Theo tháng" },
    { key: "nam",     label: "Theo năm"   },
    { key: "so_sanh", label: "So sánh kỳ" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#020817",
      fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "32px 24px",
      backgroundImage: "radial-gradient(ellipse at 20% 20%, #1e293b44 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #1e3a5f22 0%, transparent 60%)"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        select option { background: #1e293b; }
        @keyframes shimmer { 0%{opacity:.5} 50%{opacity:1} 100%{opacity:.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
          }}>📊</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em" }}>
              Báo cáo Doanh thu
            </h1>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
              Biểu đồ cột kết hợp đường — phân tích theo kỳ
            </p>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="fade-up" style={{
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16,
        padding: "20px 24px", marginBottom: 24,
        display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end"
      }}>
        {/* TABS loại */}
        <div style={{ display: "flex", gap: 4, background: "#020817", padding: 4, borderRadius: 10, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <TabBtn key={t.key} active={loai === t.key} onClick={() => setLoai(t.key)}>{t.label}</TabBtn>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", flex: 1 }}>
          {loai === "ngay" && <>
            <div style={{ minWidth: 140 }}>
              <label style={labelStyle}>Từ ngày</label>
              <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ minWidth: 140 }}>
              <label style={labelStyle}>Đến ngày</label>
              <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)} style={inputStyle} />
            </div>
          </>}

          {(loai === "tuan" || loai === "thang") && (
            <div style={{ minWidth: 100 }}>
              <label style={labelStyle}>Năm</label>
              <input type="number" value={nam} onChange={e => setNam(+e.target.value)} style={inputStyle} />
            </div>
          )}

          {loai === "nam" && <>
            <div style={{ minWidth: 100 }}>
              <label style={labelStyle}>Từ năm</label>
              <input type="number" value={tuNam} onChange={e => setTuNam(+e.target.value)} style={inputStyle} />
            </div>
            <div style={{ minWidth: 100 }}>
              <label style={labelStyle}>Đến năm</label>
              <input type="number" value={denNam} onChange={e => setDenNam(+e.target.value)} style={inputStyle} />
            </div>
          </>}

          {loai === "so_sanh" && <>
            <div style={{ minWidth: 100 }}>
              <label style={labelStyle}>Năm</label>
              <input type="number" value={nam} onChange={e => setNam(+e.target.value)} style={inputStyle} />
            </div>
            <div style={{ minWidth: 100 }}>
              <label style={labelStyle}>Tháng</label>
              <input type="number" min={1} max={12} value={thang} onChange={e => setThang(+e.target.value)} style={inputStyle} />
            </div>
          </>}

          {/* Kho — dùng KhoDto: id, maKho, tenKho, trangThai */}
          <div style={{ minWidth: 210 }}>
            <label style={labelStyle}>Kho</label>
            <select value={khoId} onChange={e => setKhoId(e.target.value)} style={inputStyle}>
              <option value="">— Tất cả kho —</option>
              {khoList.map(k => (
                <option key={k.id} value={k.id}>
                  [{k.maKho}] {k.tenKho}
                </option>
              ))}
            </select>
          </div>

          <button onClick={loadData} disabled={loading} style={{
            padding: "9px 24px",
            background: loading ? "#334155" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            border: "none", borderRadius: 8, color: "#fff", fontWeight: 700,
            fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px #6366f155",
            fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.2s",
            whiteSpace: "nowrap"
          }}>
            {loading ? "⟳ Đang tải..." : "🔍 Xem báo cáo"}
          </button>
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div style={{
          background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 12,
          padding: "14px 20px", marginBottom: 20, color: "#fca5a5",
          fontSize: 13, fontFamily: "'DM Mono', monospace",
          display: "flex", alignItems: "center", gap: 10
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="fade-up" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard label="Tổng doanh thu" value={fmt(totalDoanhThu)} sub="vnđ"        color="#6366f1" icon="💰" />
        <KpiCard label="Lợi nhuận gộp"  value={fmt(totalLoiNhuan)} sub="vnđ"        color="#22d3ee" icon="📈" />
        <KpiCard label="Tỷ lệ lãi gộp"  value={`${avgTyLe}%`}     sub="trung bình" color="#4ade80" icon="🎯" />
        <KpiCard label="Tổng đơn hàng"  value={totalDon.toLocaleString("vi-VN")} sub="đơn" color="#f59e0b" icon="📦" />
      </div>

      {/* ── CHART ── */}
      <div className="fade-up" style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 20, padding: "28px 24px 16px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>
              Biểu đồ Doanh thu &amp; Lợi nhuận
            </h2>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>
              Cột: Giá vốn + Lợi nhuận · Đường: Doanh thu &amp; Số đơn
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selectedKho && (
              <span style={{
                fontSize: 12, color: "#6366f1", fontFamily: "'DM Mono', monospace",
                background: "#6366f111", padding: "4px 12px", borderRadius: 20, border: "1px solid #6366f122"
              }}>
                📦 [{selectedKho.maKho}] {selectedKho.tenKho}
              </span>
            )}
            {loading && (
              <div style={{ fontSize: 12, color: "#6366f1", animation: "shimmer 1s infinite", fontFamily: "'DM Mono', monospace" }}>
                ⟳ Đang tải...
              </div>
            )}
          </div>
        </div>

        {chartData.length === 0 && !loading ? (
          <div style={{
            height: 380, display: "flex", alignItems: "center", justifyContent: "center",
            color: "#334155", fontSize: 14, fontFamily: "'DM Mono', monospace",
            flexDirection: "column", gap: 10
          }}>
            <span style={{ fontSize: 40 }}>📭</span>
            Không có dữ liệu cho kỳ này
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradGV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#334155" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="nhanThoiGian"
                tick={{ fill: "#64748b", fontSize: 12, fontFamily: "'DM Mono', monospace" }}
                axisLine={{ stroke: "#1e293b" }} tickLine={false}
              />
              <YAxis
                yAxisId="tien"
                tickFormatter={v => fmt(v)}
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                axisLine={false} tickLine={false} width={70}
              />
              <YAxis
                yAxisId="don" orientation="right"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "'DM Mono', monospace" }}
                axisLine={false} tickLine={false} width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#94a3b8" }} />

              <Bar yAxisId="tien" dataKey="giaVon"   name="Giá vốn"   stackId="a" fill="url(#gradGV)" radius={[0, 0, 6, 6]} maxBarSize={52} />
              <Bar yAxisId="tien" dataKey="loiNhuan" name="Lợi nhuận" stackId="a" fill="#22d3ee"      radius={[6, 6, 0, 0]} maxBarSize={52} fillOpacity={0.85} />

              <Line
                yAxisId="tien" type="monotone" dataKey="doanhThu" name="Doanh thu"
                stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#020817" }}
                activeDot={{ r: 6, fill: "#818cf8" }}
              />
              <Line
                yAxisId="don" type="monotone" dataKey="soLuongDon" name="Đơn hàng"
                stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4"
                dot={{ fill: "#f59e0b", r: 3, stroke: "#020817", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── TABLE ── */}
      <div className="fade-up" style={{
        marginTop: 20, background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 20, overflow: "hidden"
      }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #1e293b" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Chi tiết số liệu</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#020817" }}>
                {["Kỳ", "Tiền hàng", "Phí VC", "Doanh thu", "Giá vốn", "Lợi nhuận", "Tỷ lệ LN", "Số đơn"].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: h === "Kỳ" ? "left" : "right",
                    color: "#475569", fontWeight: 600, fontSize: 11,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i}
                  style={{ borderTop: "1px solid #1e293b", background: i % 2 === 0 ? "transparent" : "#0a1628", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "#0a1628"}
                >
                  <td style={{ padding: "12px 16px", color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{row.nhanThoiGian}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{fmt(row.tienHang)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{fmt(row.phiVanChuyen)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#818cf8", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmt(row.doanhThu)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{fmt(row.giaVon)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#22d3ee", fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmt(row.loiNhuan)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <span style={{
                      background: row.tyLeLaiGop >= 38 ? "#16a34a22" : "#6366f122",
                      color:      row.tyLeLaiGop >= 38 ? "#4ade80"   : "#818cf8",
                      padding: "3px 10px", borderRadius: 20, fontSize: 12,
                      fontFamily: "'DM Mono', monospace", fontWeight: 600
                    }}>{row.tyLeLaiGop.toFixed(2)}%</span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: "#f59e0b", fontFamily: "'DM Mono', monospace" }}>
                    {row.soLuongDon.toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
              {chartData.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "#334155", fontFamily: "'DM Mono', monospace" }}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
            {chartData.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: "2px solid #334155", background: "#020817" }}>
                  <td style={{ padding: "14px 16px", color: "#f1f5f9", fontWeight: 700 }}>Tổng cộng</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#64748b", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(chartData.reduce((s, d) => s + d.tienHang, 0))}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#64748b", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(chartData.reduce((s, d) => s + d.phiVanChuyen, 0))}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#818cf8", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(totalDoanhThu)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#64748b", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(chartData.reduce((s, d) => s + d.giaVon, 0))}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#22d3ee", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(totalLoiNhuan)}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <span style={{ color: "#4ade80", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{avgTyLe}%</span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right", color: "#f59e0b", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>
                    {totalDon.toLocaleString("vi-VN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <p style={{ textAlign: "center", color: "#1e293b", fontSize: 11, marginTop: 24, fontFamily: "'DM Mono', monospace" }}>
        Chỉ tính đơn hàng trang_thai = 3 (đã giao) · Giá vốn từ chi_tiet_phieu_xuat_kho
      </p>
    </div>
  );
}