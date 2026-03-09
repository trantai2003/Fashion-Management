import { useState, useEffect, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  BarChart, ReferenceLine
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8080/api/v1/admin/dashboard/bao-cao/nhat-ky-nhap-xuat";
const getToken = () => localStorage.getItem("access_token") ?? "";

const today     = new Date();
const thisYear  = today.getFullYear();
const thisMonth = today.getMonth() + 1;
const pad       = (n) => String(n).padStart(2, "0");
const defaultTuNgay  = `${thisYear}-${pad(thisMonth)}-01`;
const defaultDenNgay = today.toISOString().split("T")[0];

function buildParams({ loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId, loaiGiaoDich }) {
  const p = new URLSearchParams({ loai });
  if (loai === "ngay" || loai === "chi_tiet" || loai === "theo_kho") {
    p.set("tuNgay", tuNgay); p.set("denNgay", denNgay);
  } else if (loai === "tuan" || loai === "thang") {
    p.set("nam", nam);
  } else if (loai === "nam") {
    p.set("tuNam", tuNam); p.set("denNam", denNam);
  } else if (loai === "so_sanh") {
    p.set("nam", nam); p.set("thang", thang);
  }
  if (khoId)        p.set("khoId", khoId);
  if (loaiGiaoDich) p.set("loaiGiaoDich", loaiGiaoDich);
  return p.toString();
}

const fmtSL  = (n) => n != null ? Number(n).toLocaleString("vi-VN") : "—";
const fmtVND = (n) => n != null ? Number(n).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }) : "—";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  nhap:    "#34D399",   // emerald
  xuat:    "#F87171",   // red
  chenh:   "#FBBF24",   // amber
  gtrNhap: "#6EE7B7",
  gtrXuat: "#FCA5A5",
  bg:      "#0D1117",
  panel:   "#161B22",
  border:  "rgba(255,255,255,0.08)",
  text:    "#C9D1D9",
  muted:   "rgba(201,209,217,0.4)",
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0D1117", border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "12px 16px", fontSize: 12,
      minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <p style={{ color: C.nhap, fontWeight: 700, marginBottom: 8 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 20, marginBottom: 3 }}>
          <span style={{ color: p.color }}>{p.name}</span>
          <span style={{ color: "#fff", fontWeight: 600 }}>
            {String(p.name).includes("Giá trị") ? fmtVND(p.value) : fmtSL(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────────────────────
const KPICard = ({ label, value, isVND, accent, icon, sub, subLabel }) => (
  <div style={{
    background: C.panel, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 150,
    position: "relative", overflow: "hidden",
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: accent }} />
    <div style={{ paddingLeft: 8 }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontSize: isVND ? 16 : 24, fontWeight: 800, color: "#fff",
        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1,
        wordBreak: "break-all",
      }}>
        {isVND ? fmtVND(value) : fmtSL(value)}
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </div>
      {sub != null && (
        <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>
          {subLabel}: <span style={{ color: "#fff", fontWeight: 600 }}>{fmtSL(sub)}</span>
        </div>
      )}
    </div>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skel = ({ h = 100, w = "100%" }) => (
  <div className="skel" style={{ height: h, width: w, borderRadius: 10, background: "rgba(255,255,255,0.04)" }} />
);

// ─────────────────────────────────────────────────────────────────────────────
export default function NhatKyNhapXuat() {
  const [loai,          setLoai]          = useState("thang");
  const [nam,           setNam]           = useState(thisYear);
  const [thang,         setThang]         = useState(thisMonth);
  const [tuNam,         setTuNam]         = useState(thisYear - 4);
  const [denNam,        setDenNam]        = useState(thisYear);
  const [tuNgay,        setTuNgay]        = useState(defaultTuNgay);
  const [denNgay,       setDenNgay]       = useState(defaultDenNgay);
  const [khoId,         setKhoId]         = useState("");
  const [loaiGiaoDich,  setLoaiGiaoDich]  = useState("");
  const [data,          setData]          = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);
  const [activeTab,     setActiveTab]     = useState("so_luong");
  const [viewMode,      setViewMode]      = useState("chart"); // chart | table

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = buildParams({ loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId, loaiGiaoDich });
      const token  = getToken();
      const res    = await fetch(`${BASE_URL}?${params}`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : (json.data ?? []));
    } catch (e) {
      setError(e.message); setData([]);
    } finally {
      setLoading(false);
    }
  }, [loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId, loaiGiaoDich]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Tính KPI ──────────────────────────────────────────────────────────────
  const kpi = data.reduce((acc, d) => ({
    tongNhap:      acc.tongNhap      + (Number(d.tongNhap)      || 0),
    tongXuat:      acc.tongXuat      + (Number(d.tongXuat)      || 0),
    tongGtrNhap:   acc.tongGtrNhap   + (Number(d.tongGiaTriNhap)|| 0),
    tongGtrXuat:   acc.tongGtrXuat   + (Number(d.tongGiaTriXuat) || 0),
    soPhieuNhap:   acc.soPhieuNhap   + (Number(d.soPhieuNhap)   || 0),
    soPhieuXuat:   acc.soPhieuXuat   + (Number(d.soPhieuXuat)   || 0),
  }), { tongNhap: 0, tongXuat: 0, tongGtrNhap: 0, tongGtrXuat: 0, soPhieuNhap: 0, soPhieuXuat: 0 });

  const loaiLabels = {
    ngay: "Theo Ngày", tuan: "Theo Tuần", thang: "Theo Tháng",
    nam: "Theo Năm", so_sanh: "So sánh kỳ", chi_tiet: "Chi tiết GD", theo_kho: "Theo Kho",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Mono', 'Courier New', monospace", paddingBottom: 48 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:rgba(52,211,153,0.25);border-radius:3px}
        .btn{border:none;cursor:pointer;font-family:inherit;transition:all .18s}
        .btn:hover{filter:brightness(1.15)}
        .ctrl{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:${C.text};border-radius:7px;padding:6px 10px;font-family:inherit;font-size:12px;cursor:pointer}
        .ctrl:focus{outline:none;border-color:rgba(52,211,153,0.5)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp .3s ease forwards}
        @keyframes skel{0%{opacity:.4}50%{opacity:.8}100%{opacity:.4}}
        .skel{animation:skel 1.5s ease infinite}
        tr.hover-row:hover td{background:rgba(52,211,153,0.04)!important}
      `}</style>

      {/* ── Header bar ── */}
      <div style={{
        background: `linear-gradient(180deg, rgba(52,211,153,0.06) 0%, transparent 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "28px 40px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <span style={{ fontSize: 26 }}>📋</span>
              <h1 style={{
                fontSize: 20, fontWeight: 800, color: "#fff",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "-0.02em",
              }}>
                NHẬT KÝ&nbsp;
                <span style={{ color: C.nhap }}>NHẬP</span>
                &nbsp;—&nbsp;
                <span style={{ color: C.xuat }}>XUẤT</span>
              </h1>
            </div>
            <p style={{ fontSize: 12, color: C.muted, letterSpacing: "0.04em" }}>
              Theo dõi luồng hàng hóa ra · vào · tồn kho theo thời gian
            </p>
          </div>

          {/* Kho + Loại GD */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Kho</span>
              <select className="ctrl" value={khoId} onChange={e => setKhoId(e.target.value)}>
                <option value="">Tất cả kho</option>
                <option value="1">KHO01 – Hà Nội</option>
                <option value="2">KHO02 – Miền Nam</option>
                <option value="3">KHO03 – Miền Trung</option>
                <option value="4">KHO04 – Ngoại thành</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Loại GD</span>
              <select className="ctrl" value={loaiGiaoDich} onChange={e => setLoaiGiaoDich(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="nhap_kho">Nhập kho</option>
                <option value="xuat_kho">Xuất kho</option>
                <option value="chuyen_kho">Chuyển kho</option>
                <option value="dieu_chinh">Điều chỉnh</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Loại filter ── */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          {Object.entries(loaiLabels).map(([key, label]) => (
            <button key={key} className="btn" onClick={() => setLoai(key)} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: loai === key ? C.nhap : "rgba(255,255,255,0.05)",
              color: loai === key ? "#0D1117" : C.muted,
              border: loai === key ? "none" : `1px solid ${C.border}`,
            }}>{label}</button>
          ))}

          {/* Dynamic params */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto", flexWrap: "wrap" }}>
            {(loai === "ngay" || loai === "chi_tiet" || loai === "theo_kho") && (<>
              <input className="ctrl" type="date" value={tuNgay}  onChange={e => setTuNgay(e.target.value)} />
              <span style={{ color: C.muted, fontSize: 11 }}>→</span>
              <input className="ctrl" type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)} />
            </>)}

            {(loai === "tuan" || loai === "thang" || loai === "so_sanh") && (
              <select className="ctrl" value={nam} onChange={e => setNam(+e.target.value)}>
                {Array.from({ length: 8 }, (_, i) => thisYear - 7 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}

            {loai === "so_sanh" && (
              <select className="ctrl" value={thang} onChange={e => setThang(+e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>T{i + 1}</option>)}
              </select>
            )}

            {loai === "nam" && (<>
              <select className="ctrl" value={tuNam}  onChange={e => setTuNam(+e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map(y => <option key={y} value={y}>Từ {y}</option>)}
              </select>
              <select className="ctrl" value={denNam} onChange={e => setDenNam(+e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => thisYear - 9 + i).map(y => <option key={y} value={y}>Đến {y}</option>)}
              </select>
            </>)}

            <button className="btn" onClick={fetchData} disabled={loading} style={{
              padding: "6px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700,
              background: loading ? "rgba(52,211,153,0.3)" : C.nhap,
              color: "#0D1117", border: "none",
            }}>
              {loading ? "Đang tải…" : "► Tải báo cáo"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 40px 0" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{
            marginBottom: 20, padding: "13px 18px", borderRadius: 10,
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)",
            color: C.xuat, fontSize: 13, display: "flex", alignItems: "center", gap: 10,
          }}>
            <span>⚠</span>
            <span><b>Lỗi:</b> {error}</span>
            <button onClick={fetchData} className="btn" style={{
              marginLeft: "auto", background: "rgba(248,113,113,0.12)", color: C.xuat,
              border: "1px solid rgba(248,113,113,0.3)", borderRadius: 7,
              padding: "4px 14px", fontSize: 12,
            }}>Thử lại</button>
          </div>
        )}

        {/* ── KPI Row ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {loading ? [0,1,2,3,4,5].map(i => <Skel key={i} h={100} />) : (<>
            <KPICard label="Tổng SL Nhập"     value={kpi.tongNhap}    accent={C.nhap}    icon="📥" />
            <KPICard label="Tổng SL Xuất"     value={kpi.tongXuat}    accent={C.xuat}    icon="📤" />
            <KPICard label="Giá trị Nhập"     value={kpi.tongGtrNhap} accent={C.gtrNhap} icon="💰" isVND />
            <KPICard label="Giá trị Xuất"     value={kpi.tongGtrXuat} accent={C.gtrXuat} icon="💸" isVND />
            <KPICard label="Số phiếu Nhập"    value={kpi.soPhieuNhap} accent={C.nhap}    icon="📄"
                     sub={kpi.soPhieuXuat} subLabel="Phiếu xuất" />
          </>)}
        </div>

        {/* ── Chart / Table toggle ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          {/* Chart tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {[
              { key: "so_luong", label: "Số lượng" },
              { key: "gia_tri",  label: "Giá trị ₫" },
              { key: "so_phieu", label: "Số phiếu" },
            ].map(({ key, label }) => (
              <button key={key} className="btn" onClick={() => setActiveTab(key)} style={{
                padding: "6px 14px", borderRadius: "6px 6px 0 0", fontSize: 12, fontWeight: 600,
                background: activeTab === key ? C.panel : "rgba(255,255,255,0.03)",
                color: activeTab === key ? "#fff" : C.muted,
                border: `1px solid ${activeTab === key ? C.border : "transparent"}`,
                borderBottom: activeTab === key ? `1px solid ${C.panel}` : `1px solid ${C.border}`,
              }}>{label}</button>
            ))}
          </div>
          {/* View mode */}
          <div style={{ display: "flex", gap: 4 }}>
            {["chart", "table"].map(m => (
              <button key={m} className="btn" onClick={() => setViewMode(m)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 11,
                background: viewMode === m ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.04)",
                color: viewMode === m ? C.nhap : C.muted,
                border: `1px solid ${viewMode === m ? "rgba(52,211,153,0.3)" : C.border}`,
              }}>{m === "chart" ? "📊 Biểu đồ" : "📋 Bảng"}</button>
            ))}
          </div>
        </div>

        {/* ── Chart panel ── */}
        <div style={{
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: "0 12px 12px 12px", padding: "24px 20px", marginBottom: 24,
        }}>
          {loading ? (
            <Skel h={320} />
          ) : data.length === 0 ? (
            <div style={{ height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontSize: 36, opacity: 0.3 }}>📭</span>
              <span style={{ fontSize: 13, color: C.muted }}>Không có dữ liệu</span>
            </div>
          ) : viewMode === "chart" ? (
            <div className="fu">
              {/* TAB: Số lượng */}
              {activeTab === "so_luong" && (
                <>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>
                    Số lượng hàng nhập · xuất · chênh lệch tồn kho
                  </p>
                  <ResponsiveContainer width="100%" height={310}>
                    <ComposedChart data={data} barGap={2}>
                      <defs>
                        <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.nhap} stopOpacity={0.85}/>
                          <stop offset="100%" stopColor={C.nhap} stopOpacity={0.45}/>
                        </linearGradient>
                        <linearGradient id="gX" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.xuat} stopOpacity={0.85}/>
                          <stop offset="100%" stopColor={C.xuat} stopOpacity={0.45}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="nhanThoiGian" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 10 }}/>
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)"/>
                      <Bar dataKey="tongNhap" name="SL Nhập"   fill="url(#gN)" radius={[3,3,0,0]}/>
                      <Bar dataKey="tongXuat" name="SL Xuất"   fill="url(#gX)" radius={[3,3,0,0]}/>
                      <Line dataKey="chenhLech" name="Chênh lệch" stroke={C.chenh} strokeWidth={2}
                        dot={{ r: 3, fill: C.chenh }} type="monotone"/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* TAB: Giá trị */}
              {activeTab === "gia_tri" && (
                <>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>
                    Giá trị tiền hàng nhập · xuất (VNĐ)
                  </p>
                  <ResponsiveContainer width="100%" height={310}>
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="gGN" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.nhap} stopOpacity={0.3}/>
                          <stop offset="100%" stopColor={C.nhap} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="gGX" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={C.xuat} stopOpacity={0.3}/>
                          <stop offset="100%" stopColor={C.xuat} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="nhanThoiGian" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}
                        tickFormatter={v => v >= 1e9 ? `${(v/1e9).toFixed(1)}T` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 10 }}/>
                      <Area dataKey="tongGiaTriNhap" name="Giá trị Nhập" stroke={C.nhap} strokeWidth={2}
                        fill="url(#gGN)" type="monotone"/>
                      <Area dataKey="tongGiaTriXuat" name="Giá trị Xuất" stroke={C.xuat} strokeWidth={2}
                        fill="url(#gGX)" type="monotone"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              )}

              {/* TAB: Số phiếu */}
              {activeTab === "so_phieu" && (
                <>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>
                    Số lượng phiếu nhập · xuất theo kỳ
                  </p>
                  <ResponsiveContainer width="100%" height={310}>
                    <BarChart data={data} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                      <XAxis dataKey="nhanThoiGian" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false}/>
                      <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize: 11, color: C.muted, paddingTop: 10 }}/>
                      <Bar dataKey="soPhieuNhap" name="Phiếu Nhập" fill={C.nhap} opacity={0.8} radius={[3,3,0,0]}/>
                      <Bar dataKey="soPhieuXuat" name="Phiếu Xuất" fill={C.xuat} opacity={0.8} radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>
          ) : (
            /* ── Table view ── */
            <div className="fu" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Kỳ / Nguồn", "SL Nhập", "SL Xuất", "Chênh lệch", "GT Nhập", "GT Xuất", "P.Nhập", "P.Xuất"].map((h, i) => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: i === 0 ? "left" : "right",
                        color: C.muted, fontWeight: 600, fontSize: 10,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                        whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="hover-row" style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono',monospace" }}>
                        {row.nhanThoiGian}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: C.nhap, fontWeight: 600 }}>
                        {fmtSL(row.tongNhap)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: C.xuat, fontWeight: 600 }}>
                        {fmtSL(row.tongXuat)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <span style={{
                          color: Number(row.chenhLech) >= 0 ? C.nhap : C.xuat,
                          fontWeight: 700,
                        }}>
                          {Number(row.chenhLech) >= 0 ? "+" : ""}{fmtSL(row.chenhLech)}
                        </span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: C.muted, fontSize: 11 }}>
                        {fmtVND(row.tongGiaTriNhap)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: C.muted, fontSize: 11 }}>
                        {fmtVND(row.tongGiaTriXuat)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: C.nhap }}>
                        {fmtSL(row.soPhieuNhap)}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", color: C.xuat }}>
                        {fmtSL(row.soPhieuXuat)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* ── Summary row ── */}
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${C.border}`, background: "rgba(52,211,153,0.04)" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 800, color: C.nhap, fontSize: 11, textTransform: "uppercase" }}>
                      Tổng cộng
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: C.nhap, fontWeight: 800 }}>{fmtSL(kpi.tongNhap)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: C.xuat, fontWeight: 800 }}>{fmtSL(kpi.tongXuat)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <span style={{ color: kpi.tongNhap - kpi.tongXuat >= 0 ? C.nhap : C.xuat, fontWeight: 800 }}>
                        {kpi.tongNhap - kpi.tongXuat >= 0 ? "+" : ""}{fmtSL(kpi.tongNhap - kpi.tongXuat)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: C.muted, fontWeight: 700, fontSize: 11 }}>{fmtVND(kpi.tongGtrNhap)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: C.muted, fontWeight: 700, fontSize: 11 }}>{fmtVND(kpi.tongGtrXuat)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: C.nhap, fontWeight: 700 }}>{fmtSL(kpi.soPhieuNhap)}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: C.xuat, fontWeight: 700 }}>{fmtSL(kpi.soPhieuXuat)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* ── Record count footer ── */}
        {!loading && data.length > 0 && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "right", marginTop: -16 }}>
            {data.length} bản ghi · {loaiLabels[loai]}
            {khoId ? ` · KHO${pad(khoId)}` : " · Tất cả kho"}
            {loaiGiaoDich ? ` · ${loaiGiaoDich}` : ""}
          </div>
        )}
      </div>
    </div>
  );
}