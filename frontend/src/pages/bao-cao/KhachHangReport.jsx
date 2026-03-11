import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart,
  Bar, Line, ReferenceLine
} from "recharts";

// ── Đổi BASE_URL nếu backend chạy domain/port khác ───────────────────────────
const BASE_URL = "http://localhost:8080/api/v1/admin/dashboard/bao-cao/khach-hang";

// Lấy token JWT từ localStorage (key tùy theo cách bạn lưu)
const getToken = () =>
  localStorage.getItem("access_token") ??
  "";

// ── Build query string theo loại ─────────────────────────────────────────────
function buildParams({ loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId }) {
  const p = new URLSearchParams({ loai });
  if (loai === "ngay") {
    p.set("tuNgay", tuNgay);
    p.set("denNgay", denNgay);
  } else if (loai === "tuan" || loai === "thang") {
    p.set("nam", nam);
  } else if (loai === "nam") {
    p.set("tuNam", tuNam);
    p.set("denNam", denNam);
  } else if (loai === "so_sanh") {
    p.set("nam", nam);
    p.set("thang", thang);
  }
  if (khoId) p.set("khoId", khoId);
  return p.toString();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => (n != null ? Number(n).toLocaleString("vi-VN") : "—");

const today = new Date();
const thisYear  = today.getFullYear();
const thisMonth = today.getMonth() + 1;
const defaultTuNgay  = `${thisYear}-${String(thisMonth).padStart(2, "0")}-01`;
const defaultDenNgay = today.toISOString().split("T")[0];

const kpiCalc = (data) => {
  if (!data.length) return { tongMoi: 0, tongQuayLai: 0, tongMua: 0, trungBinhMoi: 0 };
  const tongMoi     = data.reduce((s, d) => s + (Number(d.soKhachMoi) || 0), 0);
  const tongQuayLai = data.reduce((s, d) => s + (Number(d.soKhachQuayLai) || 0), 0);
  const tongMua     = data.reduce((s, d) => s + (Number(d.tongKhachMua) || 0), 0);
  return { tongMoi, tongQuayLai, tongMua, trungBinhMoi: Math.round(tongMoi / data.length) };
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,14,26,0.97)", border: "1px solid rgba(99,202,183,0.25)",
      borderRadius: 12, padding: "12px 16px", fontSize: 13, minWidth: 180,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <p style={{ color:"#63CAB7", fontWeight:700, marginBottom:8, fontFamily:"'Sora',sans-serif" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} style={{ display:"flex", justifyContent:"space-between", gap:24, marginBottom:4 }}>
          <span style={{ color:p.color, opacity:0.9 }}>{p.name}</span>
          <span style={{ color:"#fff", fontWeight:600 }}>
            {p.name.includes("%")
              ? `${Number(p.value) > 0 ? "+" : ""}${Number(p.value).toFixed(1)}%`
              : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function KhachHangReport() {
  const [loai, setLoai]       = useState("thang");
  const [nam, setNam]         = useState(thisYear);
  const [thang, setThang]     = useState(thisMonth);
  const [tuNam, setTuNam]     = useState(thisYear - 4);
  const [denNam, setDenNam]   = useState(thisYear);
  const [tuNgay, setTuNgay]   = useState(defaultTuNgay);
  const [denNgay, setDenNgay] = useState(defaultDenNgay);
  const [khoId, setKhoId]     = useState("");
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("tong_hop");

  // ── Real API fetch ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams({ loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId });
      const token  = getToken();
      const res = await fetch(`${BASE_URL}?${params}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      // Hỗ trợ { data: [...] } hoặc [...] trực tiếp
      setData(Array.isArray(json) ? json : (json.data ?? []));
    } catch (e) {
      setError(e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [loai, nam, thang, tuNam, denNam, tuNgay, denNgay, khoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const kpi = kpiCalc(data);
  const lastGrowth = data.length > 1 ? data[data.length - 1]?.tyLeTangTruong : null;

  // ── KPI Card ────────────────────────────────────────────────────────────────
  const KPICard = ({ label, value, sub, accent, icon }) => (
    <div style={{
      background: "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))",
      border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
      padding: "20px 24px", position: "relative", overflow: "hidden", flex: 1, minWidth: 160,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent }} />
      <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:28, fontWeight:800, color:"#fff", fontFamily:"'Sora',sans-serif", lineHeight:1.1 }}>
        {fmt(value)}
      </div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:4, letterSpacing:"0.06em", textTransform:"uppercase" }}>
        {label}
      </div>
      {sub != null && (
        <div style={{ marginTop:8, fontSize:12, fontWeight:600, color: Number(sub)>=0?"#63CAB7":"#FF6B8A" }}>
          {Number(sub)>=0?"▲":"▼"} {Math.abs(Number(sub)).toFixed(1)}% kỳ trước
        </div>
      )}
    </div>
  );

  const Skeleton = () => (
    <div className="shimmer" style={{
      height:110, borderRadius:16, flex:1,
      background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.06)",
    }} />
  );

  return (
    <div style={{
      minHeight:"100vh", background:"#080C18", color:"#E8EDF5",
      fontFamily:"'DM Sans','Segoe UI',sans-serif", paddingBottom:48,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:rgba(99,202,183,0.3);border-radius:3px}
        .tab-btn{background:none;border:none;cursor:pointer;transition:all .2s}
        .loai-btn{border:none;cursor:pointer;transition:all .2s;font-family:inherit}
        .loai-btn:hover{transform:translateY(-1px)}
        .ctrl{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#E8EDF5;border-radius:8px;padding:6px 10px;font-family:inherit;font-size:13px;cursor:pointer}
        .ctrl:focus{outline:none;border-color:rgba(99,202,183,0.5)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .35s ease forwards}
        @keyframes shimmer{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}
        .shimmer{animation:shimmer 1.4s ease infinite}
      `}</style>

      {/* ── Header ── */}
      <div style={{
        background:"linear-gradient(180deg,rgba(99,202,183,0.07) 0%,transparent 100%)",
        borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"32px 40px 28px",
      }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:"linear-gradient(135deg,#63CAB7,#3DA89A)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
              }}>👥</div>
              <h1 style={{
                margin:0, fontSize:22, fontWeight:800, fontFamily:"'Sora',sans-serif",
                background:"linear-gradient(90deg,#fff 0%,#63CAB7 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>Báo cáo Tăng trưởng Khách hàng</h1>
            </div>
            <p style={{ margin:0, color:"rgba(255,255,255,0.4)", fontSize:13 }}>
              Phân tích xu hướng khách mới · quay lại · tích lũy
            </p>
          </div>
          {/* Kho filter */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Kho</span>
            <select className="ctrl" value={khoId} onChange={e => setKhoId(e.target.value)}>
              <option value="">Tất cả kho</option>
              <option value="1">KHO01 – Hà Nội</option>
              <option value="2">KHO02 – Miền Nam</option>
              <option value="3">KHO03 – Miền Trung</option>
              <option value="4">KHO04 – Ngoại thành</option>
            </select>
          </div>
        </div>

        {/* ── Bộ lọc loại + tham số ── */}
        <div style={{ display:"flex", gap:6, marginTop:24, flexWrap:"wrap", alignItems:"center" }}>
          {[
            { key:"ngay",    label:"Theo Ngày"  },
            { key:"tuan",    label:"Theo Tuần"  },
            { key:"thang",   label:"Theo Tháng" },
            { key:"nam",     label:"Theo Năm"   },
            { key:"so_sanh", label:"So sánh kỳ" },
          ].map(({ key, label }) => (
            <button key={key} className="loai-btn" onClick={() => setLoai(key)} style={{
              padding:"7px 18px", borderRadius:8, fontSize:13, fontWeight:600,
              background: loai===key ? "linear-gradient(135deg,#63CAB7,#3DA89A)" : "rgba(255,255,255,0.06)",
              color: loai===key ? "#fff" : "rgba(255,255,255,0.55)",
              border: loai===key ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}>{label}</button>
          ))}

          <div style={{ display:"flex", gap:8, alignItems:"center", marginLeft:"auto", flexWrap:"wrap" }}>
            {loai === "ngay" && (<>
              <input className="ctrl" type="date" value={tuNgay}  onChange={e=>setTuNgay(e.target.value)}/>
              <span style={{ color:"rgba(255,255,255,0.3)", fontSize:12 }}>→</span>
              <input className="ctrl" type="date" value={denNgay} onChange={e=>setDenNgay(e.target.value)}/>
            </>)}
            {(loai==="tuan"||loai==="thang"||loai==="so_sanh") && (
              <select className="ctrl" value={nam} onChange={e=>setNam(+e.target.value)}>
                {Array.from({length:8},(_,i)=>thisYear-7+i).map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            )}
            {loai==="so_sanh" && (
              <select className="ctrl" value={thang} onChange={e=>setThang(+e.target.value)}>
                {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>Tháng {i+1}</option>)}
              </select>
            )}
            {loai==="nam" && (<>
              <select className="ctrl" value={tuNam} onChange={e=>setTuNam(+e.target.value)}>
                {Array.from({length:10},(_,i)=>thisYear-9+i).map(y=><option key={y} value={y}>Từ {y}</option>)}
              </select>
              <select className="ctrl" value={denNam} onChange={e=>setDenNam(+e.target.value)}>
                {Array.from({length:10},(_,i)=>thisYear-9+i).map(y=><option key={y} value={y}>Đến {y}</option>)}
              </select>
            </>)}

            <button className="loai-btn" onClick={fetchData} disabled={loading} style={{
              padding:"7px 20px", borderRadius:8, fontSize:13, fontWeight:700,
              background: loading ? "rgba(99,202,183,0.3)" : "linear-gradient(135deg,#63CAB7,#3DA89A)",
              color:"#fff", border:"none", cursor: loading?"not-allowed":"pointer",
            }}>
              {loading ? "Đang tải…" : "Xem báo cáo"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"32px 40px 0" }}>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{
            marginBottom:24, padding:"14px 20px", borderRadius:12,
            background:"rgba(255,107,138,0.1)", border:"1px solid rgba(255,107,138,0.25)",
            color:"#FF6B8A", fontSize:13, display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <span><strong>Lỗi khi tải dữ liệu:</strong> {error}</span>
            <button onClick={fetchData} style={{
              marginLeft:"auto", background:"rgba(255,107,138,0.15)",
              border:"1px solid rgba(255,107,138,0.3)", color:"#FF6B8A",
              borderRadius:8, padding:"4px 14px", cursor:"pointer", fontSize:12,
            }}>Thử lại</button>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div style={{ display:"flex", gap:16, marginBottom:32, flexWrap:"wrap" }}>
          {loading
            ? [0,1,2,3].map(i=><Skeleton key={i}/>)
            : (<>
                <KPICard label="Khách mới"       value={kpi.tongMoi}      sub={lastGrowth} accent="linear-gradient(90deg,#63CAB7,#3DA89A)" icon="🆕"/>
                <KPICard label="Khách quay lại"  value={kpi.tongQuayLai}  sub={null}       accent="linear-gradient(90deg,#818CF8,#6366F1)" icon="🔁"/>
                <KPICard label="Tổng khách mua"  value={kpi.tongMua}      sub={null}       accent="linear-gradient(90deg,#F59E0B,#D97706)" icon="🛍️"/>
                <KPICard label="TB khách mới/kỳ" value={kpi.trungBinhMoi} sub={null}       accent="linear-gradient(90deg,#EC4899,#BE185D)" icon="📊"/>
              </>)
          }
        </div>

        {/* ── Chart Panel ── */}
        <div style={{
          background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)",
          borderRadius:20, overflow:"hidden",
        }}>
          {/* Tab bar */}
          <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 24px" }}>
            {[
              { key:"tong_hop",    label:"Tổng hợp"      },
              { key:"tang_truong", label:"Tăng trưởng %"  },
              { key:"tich_luy",   label:"Tích lũy"       },
            ].map(({ key, label }) => (
              <button key={key} className="tab-btn" onClick={()=>setActiveTab(key)} style={{
                padding:"14px 20px", fontSize:13, fontWeight:600,
                color: activeTab===key?"#63CAB7":"rgba(255,255,255,0.4)",
                borderBottom: activeTab===key?"2px solid #63CAB7":"2px solid transparent",
                marginBottom:-1,
              }}>{label}</button>
            ))}
          </div>

          <div style={{ padding:"28px 24px" }}>
            {loading ? (
              <div className="shimmer" style={{ height:320, borderRadius:12, background:"rgba(255,255,255,0.04)" }}/>
            ) : data.length === 0 ? (
              <div style={{ height:320, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                <span style={{ fontSize:40 }}>📭</span>
                <span style={{ color:"rgba(255,255,255,0.25)", fontSize:14 }}>Không có dữ liệu cho kỳ này</span>
              </div>
            ) : (
              <div className="fade-up">
                {activeTab === "tong_hop" && (
                  <>
                    <p style={{ margin:"0 0 20px", fontSize:13, color:"rgba(255,255,255,0.35)" }}>
                      Phân bổ khách mới &amp; quay lại theo từng kỳ
                    </p>
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={data} barGap={4}>
                        <defs>
                          <linearGradient id="gMoi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#63CAB7" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#63CAB7" stopOpacity={0.5}/>
                          </linearGradient>
                          <linearGradient id="gQL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818CF8" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#818CF8" stopOpacity={0.5}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="nhanThoiGian" tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend wrapperStyle={{fontSize:12,color:"rgba(255,255,255,0.5)",paddingTop:12}}/>
                        <Bar dataKey="soKhachMoi"     name="Khách mới"      fill="url(#gMoi)" radius={[4,4,0,0]}/>
                        <Bar dataKey="soKhachQuayLai" name="Khách quay lại" fill="url(#gQL)"  radius={[4,4,0,0]}/>
                        <Line dataKey="tongKhachMua"  name="Tổng khách mua" stroke="#F59E0B" strokeWidth={2} dot={{r:3,fill:"#F59E0B"}} type="monotone"/>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </>
                )}

                {activeTab === "tang_truong" && (
                  <>
                    <p style={{ margin:"0 0 20px", fontSize:13, color:"rgba(255,255,255,0.35)" }}>
                      % tăng trưởng khách mới so với kỳ trước
                    </p>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="gGrow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#63CAB7" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="#63CAB7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="nhanThoiGian" tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4"/>
                        <Area
                          dataKey="tyLeTangTruong" name="Tăng trưởng %"
                          stroke="#63CAB7" strokeWidth={2.5} fill="url(#gGrow)"
                          dot={(props) => {
                            const { cx, cy, value } = props;
                            if (value == null) return null;
                            return <circle key={`g-${cx}`} cx={cx} cy={cy} r={4} fill={Number(value)>=0?"#63CAB7":"#FF6B8A"}/>;
                          }}
                          type="monotone"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop:20, display:"flex", flexWrap:"wrap", gap:8 }}>
                      {data.filter(d=>d.tyLeTangTruong!=null).map(d=>(
                        <div key={d.nhanThoiGian} style={{
                          padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700,
                          background: Number(d.tyLeTangTruong)>=0?"rgba(99,202,183,0.12)":"rgba(255,107,138,0.12)",
                          color: Number(d.tyLeTangTruong)>=0?"#63CAB7":"#FF6B8A",
                          border:`1px solid ${Number(d.tyLeTangTruong)>=0?"rgba(99,202,183,0.2)":"rgba(255,107,138,0.2)"}`,
                        }}>
                          {d.nhanThoiGian}：{Number(d.tyLeTangTruong)>0?"+":""}{Number(d.tyLeTangTruong).toFixed(1)}%
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "tich_luy" && (
                  <>
                    <p style={{ margin:"0 0 20px", fontSize:13, color:"rgba(255,255,255,0.35)" }}>
                      Tổng khách mới tích lũy theo thời gian
                    </p>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="gAcc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818CF8" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#818CF8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                        <XAxis dataKey="nhanThoiGian" tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Area dataKey="tichLuyKhachMoi" name="Khách mới tích lũy"
                          stroke="#818CF8" strokeWidth={2.5} fill="url(#gAcc)"
                          dot={{r:3,fill:"#818CF8"}} type="monotone"/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Data Table ── */}
        {!loading && data.length > 0 && (
          <div style={{ marginTop:24 }} className="fade-up">
            <div style={{
              background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:16, overflow:"hidden",
            }}>
              <div style={{ padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:14, fontWeight:600, fontFamily:"'Sora',sans-serif" }}>Chi tiết dữ liệu</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>{data.length} bản ghi</span>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"rgba(255,255,255,0.03)" }}>
                      {["Kỳ","Khách mới","Quay lại","Tổng mua","Tích lũy","Tăng trưởng"].map(h=>(
                        <th key={h} style={{
                          padding:"12px 16px", textAlign:h==="Kỳ"?"left":"right",
                          color:"rgba(255,255,255,0.35)", fontWeight:600,
                          letterSpacing:"0.06em", fontSize:11, textTransform:"uppercase",
                          borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, i) => (
                      <tr key={i}
                        style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background .15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(99,202,183,0.04)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ padding:"11px 16px", fontWeight:600, color:"#E8EDF5", fontFamily:"'Sora',sans-serif" }}>
                          {row.nhanThoiGian}
                        </td>
                        <td style={{ padding:"11px 16px", textAlign:"right", color:"#63CAB7", fontWeight:600 }}>
                          {fmt(row.soKhachMoi)}
                        </td>
                        <td style={{ padding:"11px 16px", textAlign:"right", color:"#818CF8" }}>
                          {fmt(row.soKhachQuayLai)}
                        </td>
                        <td style={{ padding:"11px 16px", textAlign:"right", color:"rgba(255,255,255,0.7)" }}>
                          {fmt(row.tongKhachMua)}
                        </td>
                        <td style={{ padding:"11px 16px", textAlign:"right", color:"rgba(255,255,255,0.5)" }}>
                          {fmt(row.tichLuyKhachMoi)}
                        </td>
                        <td style={{ padding:"11px 16px", textAlign:"right" }}>
                          {row.tyLeTangTruong == null ? (
                            <span style={{ color:"rgba(255,255,255,0.2)" }}>—</span>
                          ) : (
                            <span style={{
                              padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700,
                              background: Number(row.tyLeTangTruong)>=0?"rgba(99,202,183,0.12)":"rgba(255,107,138,0.12)",
                              color: Number(row.tyLeTangTruong)>=0?"#63CAB7":"#FF6B8A",
                            }}>
                              {Number(row.tyLeTangTruong)>=0?"+":""}{Number(row.tyLeTangTruong).toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}