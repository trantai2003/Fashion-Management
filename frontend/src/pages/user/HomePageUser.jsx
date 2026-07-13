import React, { useState, useEffect } from "react";

/* ══════════════════════════════════════════════
   DESIGN TOKENS  — Ivory / Dark-Gold luxury
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body, #root {
  background: #faf8f3;
  color: #1a1612;
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
}

:root {
  --gold:       #b8860b;
  --gold-rich:  #c9960c;
  --gold-light: #e8b923;
  --gold-pale:  rgba(184,134,11,0.12);
  --gold-dim:   rgba(184,134,11,0.08);
  --ivory:      #faf8f3;
  --ivory-2:    #f5f2ea;
  --ivory-3:    #ede9de;
  --cream:      #f0ead8;
  --text:       #1a1612;
  --text-2:     #3d3529;
  --text-dim:   #7a6e5f;
  --text-muted: #a89f92;
  --border:     rgba(184,134,11,0.18);
  --border-soft:rgba(184,134,11,0.1);
  --shadow:     0 4px 24px rgba(100,80,30,0.1);
  --shadow-lg:  0 12px 48px rgba(100,80,30,0.15);
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--ivory-2); }
::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.35); border-radius: 99px; }

/* ── grid bg ── */
.fsu-grid-bg {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: gridDrift 40s linear infinite;
}
@keyframes gridDrift { to { background-position: 56px 56px; } }

.fsu-orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); pointer-events: none;
}

/* ── section label pill ── */
.fsu-label {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .2em;
  color: var(--gold-rich); text-transform: uppercase;
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--gold-pale);
  margin-bottom: 16px;
}

/* ── buttons ── */
.fsu-btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  color: #fff; border: none;
  padding: 13px 28px; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all .2s;
  box-shadow: 0 6px 24px rgba(184,134,11,.38);
}
.fsu-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(184,134,11,.5); }

.fsu-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.7); border: 1.5px solid rgba(184,134,11,.25);
  color: #3d3529; padding: 13px 24px; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all .2s; backdrop-filter: blur(8px);
}
.fsu-btn-ghost:hover { border-color: #b8860b; color: #b8860b; }

/* ── card ── */
.fsu-card {
  background: #fff;
  border: 1px solid rgba(184,134,11,.13);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(100,80,30,.06);
  transition: all .3s;
}
.fsu-card:hover {
  border-color: rgba(184,134,11,.35);
  transform: translateY(-4px);
  box-shadow: 0 12px 36px rgba(100,80,30,.13);
}

/* ── form inputs ── */
.fsu-input {
  width: 100%; padding: 10px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 14px;
  border: 1px solid rgba(184,134,11,.2); border-radius: 10px;
  background: #fff; color: #1a1612;
  outline: none; transition: border-color .2s;
}
.fsu-input:focus { border-color: var(--gold); }

.fsu-input-err { border-color: #dc2626 !important; }
.fsu-err-msg { font-size: 12px; color: #dc2626; margin-top: 4px; font-family: 'DM Mono', monospace; }

/* ── toast ── */
.fsu-toast {
  position: fixed; top: 76px; right: 20px; z-index: 999;
  padding: 12px 20px; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  max-width: 320px;
  box-shadow: 0 8px 28px rgba(100,80,30,.18);
  animation: toastIn .3s ease;
}
@keyframes toastIn { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }
.fsu-toast.success { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
.fsu-toast.error   { background: #fef2f2; border: 1px solid #fca5a5; color: #b91c1c; }

/* ── nav dropdown ── */
.fsu-dropdown {
  position: absolute; right: 0; top: calc(100% + 8px);
  background: linear-gradient(to bottom, #fffaf0, #f7f0df);
  border: 1px solid rgba(184,134,11,.25);
  border-radius: 14px; padding: 6px;
  min-width: 190px; z-index: 999;
  box-shadow: 0 12px 40px rgba(100,80,30,.18);
}
.fsu-dropdown-item {
  width: 100%; text-align: left; padding: 9px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  background: none; border: none; border-radius: 9px;
  cursor: pointer; transition: background .15s;
  display: flex; align-items: center; gap: 8px; color: #3d3529;
}
.fsu-dropdown-item:hover { background: #f2e4bc; }
.fsu-dropdown-item.danger { color: #dc2626; }
.fsu-dropdown-item.danger:hover { background: #fef2f2; }

/* ── pricing card popular ── */
.fsu-plan-popular {
  border: 2px solid var(--gold) !important;
  transform: scale(1.025) !important;
}

/* ── details/summary for FAQ ── */
details > summary { list-style: none; cursor: pointer; }
details > summary::-webkit-details-marker { display: none; }

/* ── animations ── */
@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
.fsu-fadein { animation: fadeUp .7s ease both; }
.fsu-fadein-d1 { animation: fadeUp .7s .15s ease both; }
.fsu-fadein-d2 { animation: fadeUp .7s .3s ease both; }
`;

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8080")+"/api/v1";

const PLANS = [
    {
        id: "free",
        name: "Gói Dùng Thử",
        tag: "Free",
        priceMonthly: 0,
        priceYearly: 0,
        desc: "Trải nghiệm đầy đủ tính năng cơ bản trong 30 ngày.",
        features: [
            "Dùng thử 30 ngày", "Tối đa 100 sản phẩm",
            "Quản lý bán hàng cơ bản", "Quản lý biến thể (màu, kích cỡ)",
            "Báo cáo doanh thu cơ bản", "Thanh toán QR – VietQR",
            "1 tài khoản người dùng", "Hỗ trợ trong giờ làm việc",
        ],
        notIncluded: ["Sản phẩm không giới hạn", "Đồng bộ Shopee / TikTok Shop", "In hóa đơn & mã vạch"],
        note: "Nâng cấp bất cứ lúc nào để mở khóa tính năng nâng cao.",
        popular: false,
    },
    {
        id: "basic",
        name: "Gói Cơ Bản",
        tag: "Basic",
        priceMonthly: 159000,
        priceYearly: 1526400,
        desc: "Đầy đủ công cụ quản lý bán hàng và vận hành kho.",
        features: [
            "Sản phẩm không giới hạn", "Biến thể màu sắc, kích thước, SKU",
            "In hóa đơn & mã vạch", "Báo cáo dòng tiền",
            "Hỗ trợ kê khai thuế", "Hóa đơn điện tử tự động",
            "Thanh toán QR – VietQR", "Tối đa 3 tài khoản nhân viên",
            "Hỗ trợ 7 ngày/tuần",
        ],
        notIncluded: ["Đồng bộ Shopee / TikTok Shop", "Chấm công nhân viên"],
        extraFee: "+1 chi nhánh: 99.000đ/tháng",
        popular: false,
    },
    {
        id: "pro",
        name: "Gói Chuyên Nghiệp",
        tag: "Pro",
        priceMonthly: 219000,
        priceYearly: 2102400,
        desc: "Đồng bộ đa kênh, tự động hóa tồn kho toàn diện.",
        features: [
            "Tất cả tính năng gói Cơ Bản", "Đồng bộ Shopee, TikTok Shop, Facebook",
            "Đồng bộ tồn kho thời gian thực", "Tạo chiến dịch khuyến mãi",
            "Quản lý nhà cung cấp", "Chatbot cơ bản",
            "Nhân viên không giới hạn", "Chấm công (15 nhân viên/chi nhánh)",
        ],
        notIncluded: [],
        extraFee: "+1 chi nhánh: 169.000đ/tháng",
        popular: true,
    },
];

const FEATURES_DATA = [
    { icon: "📊", title: "Báo cáo thông minh", desc: "Theo dõi tồn kho, nhập xuất theo thời gian thực với biểu đồ phân tích trực quan và xuất báo cáo tự động." },
    { icon: "🔔", title: "Cảnh báo tự động", desc: "Thông báo thông minh khi sản phẩm sắp hết hàng hoặc đến kỳ kiểm kho định kỳ." },
    { icon: "⚡", title: "Tích hợp dễ dàng", desc: "Kết nối với các nền tảng bán hàng và kế toán thông qua cổng API chuẩn hóa, nhanh chóng." },
    { icon: "🔒", title: "Bảo mật dữ liệu", desc: "Mã hóa đầu cuối, sao lưu tự động hàng ngày, bảo vệ dữ liệu theo tiêu chuẩn doanh nghiệp." },
    { icon: "📱", title: "Đa nền tảng", desc: "Giao diện responsive hoàn hảo từ PC, máy tính bảng đến điện thoại di động mọi lúc, mọi nơi." },
    { icon: "👥", title: "Quản lý nhóm", desc: "Phân quyền linh hoạt cho thủ kho, kế toán, quản lý bán hàng theo từng vai trò cụ thể." },
];

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function fmtVND(n) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
    return <div className={`fsu-toast ${type}`}>{msg}</div>;
}

/* ══════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════ */
function Navbar({ page, setPage, user, onLogout }) {
    const [drop, setDrop] = useState(false);

    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 100,
            background: "rgba(250,248,243,.97)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(184,134,11,.15)",
            boxShadow: "0 2px 20px rgba(100,80,30,.07)",
            padding: "0 28px", height: 64,
            display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
            {/* Logo */}
            <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: "linear-gradient(135deg, #b8860b, #e8b923)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(184,134,11,.35)",
                    fontSize: 18,
                }}>📦</div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
                    <span style={{ color: "#b8860b" }}>FS</span>
                    <span style={{ color: "#3d3529", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 12, marginLeft: 6, letterSpacing: ".08em" }}>WMS</span>
                </span>
            </div>

            {/* Nav links */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {[["home", "Trang chủ"], ["features", "Tính năng"], ["pricing", "Bảng giá"]].map(([p, label]) => (
                    <button key={p} onClick={() => setPage(p)} style={{
                        padding: "7px 16px", borderRadius: 10, border: "none",
                        background: page === p ? "rgba(184,134,11,.12)" : "none",
                        color: page === p ? "#b8860b" : "#7a6e5f",
                        fontWeight: page === p ? 600 : 400,
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: "pointer",
                        transition: "all .15s",
                    }}>{label}</button>
                ))}
            </div>

            {/* Auth */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {user ? (
                    <div style={{ position: "relative" }}>
                        <button onClick={() => setDrop(d => !d)} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 14px", borderRadius: 10,
                            border: "1px solid rgba(184,134,11,.2)",
                            background: "none", cursor: "pointer", transition: "background .15s",
                            fontFamily: "'DM Sans', sans-serif",
                        }}>
                            <div style={{
                                width: 26, height: 26, borderRadius: "50%",
                                background: "linear-gradient(135deg, #d4a72b, #b8860b)",
                                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, fontFamily: "'Playfair Display', serif",
                            }}>
                                {(user.hoTen || "U")[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#3d3529" }}>{user.hoTen || user.tenDangNhap}</span>
                            <span style={{ fontSize: 10, color: "#a89f92" }}>▼</span>
                        </button>
                        {drop && (
                            <div className="fsu-dropdown">
                                <button className="fsu-dropdown-item" onClick={() => { setPage("profile"); setDrop(false); }}>
                                    👤 Hồ sơ cá nhân
                                </button>
                                <div style={{ height: 1, background: "rgba(184,134,11,.12)", margin: "4px 0" }} />
                                <button className="fsu-dropdown-item danger" onClick={() => { onLogout(); setDrop(false); }}>
                                    🚪 Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button onClick={() => setPage("login")} style={{
                            padding: "8px 18px", borderRadius: 10,
                            border: "1px solid rgba(184,134,11,.3)", background: "none",
                            color: "#b8860b", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                            cursor: "pointer",
                        }}>Đăng nhập</button>
                        <button onClick={() => setPage("register")} className="fsu-btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>
                            Đăng ký miễn phí
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

/* ══════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════ */
function HomePage({ setPage, user }) {
    return (
        <div>
            {/* ── HERO ── */}
            <section style={{
                position: "relative", overflow: "hidden",
                background: "linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%)",
                padding: "100px 32px 80px",
            }}>
                <div className="fsu-grid-bg" />
                <div className="fsu-orb" style={{ width: 580, height: 580, background: "rgba(184,134,11,.08)", top: -180, right: -140 }} />
                <div className="fsu-orb" style={{ width: 380, height: 380, background: "rgba(201,150,12,.06)", bottom: -100, left: -80 }} />

                {/* corner marks */}
                <div style={{ position: "absolute", top: 36, left: 36, width: 100, height: 100, borderTop: "1.5px solid rgba(184,134,11,.3)", borderLeft: "1.5px solid rgba(184,134,11,.3)" }} />
                <div style={{ position: "absolute", bottom: 36, right: 36, width: 100, height: 100, borderBottom: "1.5px solid rgba(184,134,11,.3)", borderRight: "1.5px solid rgba(184,134,11,.3)" }} />

                <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}>
                    {/* left */}
                    <div className="fsu-fadein">
                        <div className="fsu-label">✦ FS WMS Technology Solution ✦</div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 22, color: "#1a1612" }}>
                            Hệ thống quản lý<br />
                            <span style={{ color: "#7a6e5f" }}>kho thời trang</span><br />
                            <span style={{ background: "linear-gradient(135deg, #b8860b, #e8b923)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: 38 }}>
                                Thông minh &amp; Tự động
                            </span>
                        </h1>
                        <p style={{ fontSize: 16, color: "#7a6e5f", lineHeight: 1.8, marginBottom: 36, maxWidth: 460 }}>
                            Tối ưu hóa vòng đời sản phẩm, kiểm soát tồn kho tự động và phân tích chuỗi cung ứng thời gian thực với AI.
                        </p>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <button className="fsu-btn-primary" onClick={() => setPage(user ? "pricing" : "register")}>
                                Bắt đầu miễn phí →
                            </button>
                            <button className="fsu-btn-ghost" onClick={() => setPage("pricing")}>
                                Xem bảng giá
                            </button>
                        </div>
                    </div>

                    {/* right — mini dashboard mockup */}
                    <div className="fsu-fadein-d1">
                        <div style={{ position: "relative" }}>
                            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(ellipse, rgba(184,134,11,.09) 0%, transparent 70%)", pointerEvents: "none" }} />
                            <div style={{
                                background: "#fff", border: "1px solid rgba(184,134,11,.2)", borderRadius: 24,
                                padding: 24, boxShadow: "0 32px 80px rgba(100,80,30,.16), 0 0 0 1px rgba(184,134,11,.06)",
                                position: "relative",
                            }}>
                                <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 2, background: "linear-gradient(90deg, transparent, #b8860b, transparent)", borderRadius: 99 }} />
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                                    <div>
                                        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8860b", letterSpacing: ".15em", textTransform: "uppercase" }}>FS WMS Dashboard</p>
                                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginTop: 2 }}>Tổng quan hệ thống</p>
                                    </div>
                                    <span style={{ background: "rgba(34,197,94,.1)", color: "#16a34a", border: "1px solid rgba(34,197,94,.25)", padding: "3px 10px", borderRadius: 99, fontSize: 10, fontFamily: "'DM Mono', monospace" }}>● ONLINE</span>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
                                    {[
                                        { l: "Tồn kho tổng", v: "142.5K", c: "#b8860b", s: "+1.2%" },
                                        { l: "Đơn chờ duyệt", v: "84", c: "#2563eb", s: "Cần xử lý" },
                                        { l: "Hiệu suất kho", v: "98%", c: "#16a34a", s: "Ổn định" },
                                    ].map(({ l, v, c, s }) => (
                                        <div key={l} style={{ background: "#faf8f3", border: "1px solid rgba(184,134,11,.1)", borderRadius: 12, padding: "12px 14px" }}>
                                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#a89f92", marginBottom: 4 }}>{l}</p>
                                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: c }}>{v}</p>
                                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: s === "Cần xử lý" ? "#dc2626" : "#16a34a", marginTop: 3 }}>{s}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* mini bar chart */}
                                <div style={{ background: "#faf8f3", border: "1px solid rgba(184,134,11,.1)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#a89f92", marginBottom: 10 }}>Lưu lượng nhập xuất / Tuần</p>
                                    <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 48 }}>
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                                                <div style={{ height: h * .55, background: `rgba(184,134,11,${.2 + i * .1})`, borderRadius: "4px 4px 0 0" }} />
                                                <p style={{ fontSize: 9, color: "#a89f92", textAlign: "center", fontFamily: "'DM Mono'" }}>T{i + 2}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* recent orders */}
                                {[
                                    { code: "PO-2024-884", status: "Chờ duyệt", c: "#b8860b", bg: "rgba(184,134,11,.08)" },
                                    { code: "PO-2024-883", status: "Đang vận chuyển", c: "#2563eb", bg: "rgba(37,99,235,.08)" },
                                    { code: "PO-2024-882", status: "Đã nhập kho", c: "#16a34a", bg: "rgba(34,197,94,.08)" },
                                ].map(({ code, status, c, bg }) => (
                                    <div key={code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(184,134,11,.07)" }}>
                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#7a6e5f" }}>{code}</span>
                                        <span style={{ fontSize: 11, color: c, background: bg, padding: "3px 10px", borderRadius: 99, border: `1px solid ${c}30`, fontWeight: 600 }}>{status}</span>
                                    </div>
                                ))}
                            </div>
                            {/* badges */}
                            <div style={{ position: "absolute", top: -14, right: -16, background: "linear-gradient(135deg, #b8860b, #e8b923)", borderRadius: 99, padding: "6px 14px", fontSize: 11, fontWeight: 700, color: "#fff", boxShadow: "0 6px 20px rgba(184,134,11,.45)", whiteSpace: "nowrap" }}>✦ Phần mềm quản lý kho</div>
                            <div style={{ position: "absolute", bottom: -14, left: -16, background: "#fff", border: "1px solid rgba(184,134,11,.25)", borderRadius: 12, padding: "9px 14px", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 16px rgba(100,80,30,.12)" }}>
                                <span style={{ fontSize: 13 }}>🔒</span>
                                <span style={{ fontSize: 12, color: "#3d3529", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>FS Secure Network</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS STRIP ── */}
            <section style={{ background: "#fff", borderTop: "1px solid rgba(184,134,11,.15)", borderBottom: "1px solid rgba(184,134,11,.15)", padding: "44px 32px", boxShadow: "0 2px 20px rgba(100,80,30,.06)" }}>
                <div style={{ maxWidth: 1160, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {[
                        { v: "5+", l: "Kho hàng chi nhánh" },
                        { v: "25,000+", l: "Sản phẩm (SKUs)" },
                        { v: "99.98%", l: "Uptime hệ thống" },
                        { v: "14 ngày", l: "Dùng thử miễn phí" },
                    ].map(({ v, l }, i, arr) => (
                        <div key={l} style={{ textAlign: "center", padding: "0 32px", borderRight: i < arr.length - 1 ? "1px solid rgba(184,134,11,.12)" : "none" }}>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, color: "#b8860b", letterSpacing: -1 }}>{v}</p>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a89f92", marginTop: 4, letterSpacing: ".05em" }}>{l}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES PREVIEW ── */}
            <section style={{ background: "linear-gradient(180deg, #faf8f3 0%, #f0ead8 100%)", padding: "80px 32px", position: "relative", overflow: "hidden" }}>
                <div className="fsu-orb" style={{ width: 500, height: 500, background: "rgba(184,134,11,.05)", top: "20%", left: -200 }} />
                <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <div className="fsu-label">⚙ Phân hệ chức năng</div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 12, color: "#1a1612" }}>
                            Đầy đủ công cụ<br /><span style={{ color: "#b8860b" }}>vận hành chuyên nghiệp</span>
                        </h2>
                        <p style={{ color: "#7a6e5f", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>Mọi thứ bạn cần để điều hành kho hàng thời trang hiện đại và hiệu quả.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                        {FEATURES_DATA.map(({ icon, title, desc }) => (
                            <div key={title} className="fsu-card" style={{ padding: "26px 24px" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, rgba(184,134,11,.15), rgba(232,185,35,.08))", border: "1px solid rgba(184,134,11,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 22 }}>{icon}</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#1a1612" }}>{title}</h3>
                                <p style={{ fontSize: 13, color: "#7a6e5f", lineHeight: 1.7 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: 44 }}>
                        <button className="fsu-btn-ghost" onClick={() => setPage("features")}>Xem tất cả tính năng →</button>
                    </div>
                </div>
            </section>

            {/* ── CTA DARK ── */}
            <section style={{ background: "linear-gradient(135deg, #2d2106 0%, #1a1200 100%)", padding: "80px 32px", position: "relative", overflow: "hidden" }}>
                <div className="fsu-grid-bg" style={{ opacity: .15 }} />
                <div className="fsu-orb" style={{ width: 600, height: 400, background: "rgba(184,134,11,.12)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", border: "1px solid rgba(184,134,11,.4)", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(184,134,11,.1)", fontSize: 32 }}>🛡️</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 900, letterSpacing: -1.2, marginBottom: 16, color: "#fff", lineHeight: 1.1 }}>
                        Sẵn sàng <span style={{ color: "#e8b923" }}>bắt đầu</span> ngay?
                    </h2>
                    <p style={{ color: "rgba(255,255,255,.5)", fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
                        Tạo tài khoản và dùng thử miễn phí 14 ngày — không cần thẻ tín dụng.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button className="fsu-btn-primary" onClick={() => setPage("register")}>Tạo tài khoản miễn phí →</button>
                        <button onClick={() => setPage("pricing")} style={{
                            background: "transparent", border: "1.5px solid rgba(255,255,255,.2)", color: "rgba(255,255,255,.7)",
                            padding: "13px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all .2s",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(232,185,35,.5)"; e.currentTarget.style.color = "#e8b923"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "rgba(255,255,255,.7)"; }}
                        >Xem bảng giá</button>
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ══════════════════════════════════════════════
   FEATURES PAGE
══════════════════════════════════════════════ */
function FeaturesPage() {
    const steps = [
        { n: "01", title: "Tạo tài khoản", desc: "Đăng ký trong vài giây, không cần thẻ tín dụng. Bắt đầu dùng thử miễn phí ngay lập tức." },
        { n: "02", title: "Thiết lập kho hàng", desc: "Tạo kho, nhập danh mục sản phẩm và cấu hình biến thể (màu sắc, kích cỡ, SKU)." },
        { n: "03", title: "Quản lý nhập xuất", desc: "Ghi nhận mọi giao dịch tồn kho theo thời gian thực, tạo đơn đặt hàng và theo dõi vận chuyển." },
        { n: "04", title: "Phân tích & báo cáo", desc: "Xem báo cáo doanh thu, lợi nhuận và biểu đồ phân tích để ra quyết định kinh doanh chính xác." },
    ];

    return (
        <div style={{ background: "linear-gradient(180deg, #faf8f3 0%, #f0ead8 100%)", minHeight: "100vh" }}>
            <section style={{ position: "relative", overflow: "hidden", padding: "80px 32px 60px" }}>
                <div className="fsu-grid-bg" style={{ opacity: .5 }} />
                <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative" }}>
                    <div className="fsu-label">⚙ Tính năng</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 12, color: "#1a1612" }}>
                        Phân hệ chức năng<br /><span style={{ color: "#b8860b" }}>vượt trội</span>
                    </h1>
                    <p style={{ color: "#7a6e5f", fontSize: 15, marginBottom: 56, maxWidth: 520 }}>
                        Thiết kế riêng cho ngành thời trang, may mặc với quy trình xuất nhập kho đặc thù.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                        {FEATURES_DATA.map(({ icon, title, desc }) => (
                            <div key={title} className="fsu-card" style={{ padding: "28px 24px" }}>
                                <div style={{ width: 48, height: 48, borderRadius: 13, background: "linear-gradient(135deg, rgba(184,134,11,.15), rgba(232,185,35,.08))", border: "1px solid rgba(184,134,11,.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 24 }}>{icon}</div>
                                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#1a1612" }}>{title}</h3>
                                <p style={{ fontSize: 13.5, color: "#7a6e5f", lineHeight: 1.75 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section style={{ padding: "60px 32px 80px", background: "#fff", borderTop: "1px solid rgba(184,134,11,.1)" }}>
                <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 52 }}>
                        <div className="fsu-label">→ Quy trình</div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#1a1612", letterSpacing: -.8 }}>Bắt đầu trong 4 bước</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {steps.map(({ n, title, desc }, i) => (
                            <div key={n} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #b8860b, #e8b923)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 16, flexShrink: 0, boxShadow: "0 4px 14px rgba(184,134,11,.35)" }}>{n}</div>
                                    {i < steps.length - 1 && <div style={{ width: 1, height: 48, background: "rgba(184,134,11,.2)", margin: "4px 0" }} />}
                                </div>
                                <div style={{ paddingTop: 10, paddingBottom: i < steps.length - 1 ? 12 : 0 }}>
                                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#1a1612", marginBottom: 6 }}>{title}</p>
                                    <p style={{ fontSize: 13.5, color: "#7a6e5f", lineHeight: 1.7 }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

/* ══════════════════════════════════════════════
   PRICING PAGE
══════════════════════════════════════════════ */
function PricingPage({ user, setPage, showToast }) {
    const [annual, setAnnual] = useState(false);
    const [chosen, setChosen] = useState(null);
    const [checkoutPlan, setCheckoutPlan] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);

    useEffect(() => {
        const savedSub = localStorage.getItem("active_subscription");
        if (savedSub) {
            try {
                const subObj = JSON.parse(savedSub);
                setChosen(subObj.planId);
            } catch (e) {
                console.error(e);
            }
        }
    }, [user]);

    function pickPlan(plan) {
        if (!user) {
            showToast("Vui lòng đăng nhập để chọn gói dịch vụ.", "error");
            setPage("login");
            return;
        }
        if (plan.id === "free") {
            const expDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN");
            const newSub = {
                planId: "free",
                planName: plan.name,
                price: 0,
                status: "Active",
                startDate: new Date().toLocaleDateString("vi-VN"),
                endDate: expDate,
                cycle: "30 ngày"
            };
            localStorage.setItem("active_subscription", JSON.stringify(newSub));
            setChosen("free");
            showToast("Kích hoạt gói dùng thử (Free 30 ngày) thành công!", "success");
            setPage("profile");
        } else {
            setCheckoutPlan(plan);
            setShowCheckout(true);
            setShowPaymentDetails(false);
        }
    }

    return (
        <div style={{ background: "#faf8f3", minHeight: "100vh", padding: "72px 32px 80px" }}>
            <div style={{ maxWidth: 1160, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 52 }}>
                    <div className="fsu-label">💳 Bảng giá dịch vụ</div>
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 46, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 10, color: "#1a1612" }}>
                        Chọn gói phù hợp<br /><span style={{ color: "#b8860b" }}>với quy mô của bạn</span>
                    </h1>
                    <p style={{ color: "#7a6e5f", fontSize: 15, marginBottom: 28 }}>Nâng cấp hoặc chuyển đổi gói bất cứ lúc nào.</p>

                    {/* Toggle */}
                    <div style={{ display: "inline-flex", background: "#f5f2ea", border: "1px solid rgba(184,134,11,.12)", borderRadius: 99, padding: 3 }}>
                        {[["monthly", "Hàng tháng"], ["yearly", "Hàng năm"]].map(([k, label]) => (
                            <button key={k} onClick={() => setAnnual(k === "yearly")} style={{
                                padding: "7px 20px", borderRadius: 99, border: "none",
                                background: (k === "yearly") === annual ? "#fff" : "none",
                                boxShadow: (k === "yearly") === annual ? "0 1px 6px rgba(100,80,30,.1)" : "none",
                                color: "#3d3529", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                display: "flex", alignItems: "center", gap: 6,
                            }}>
                                {label}
                                {k === "yearly" && <span style={{ background: "rgba(184,134,11,.15)", color: "#b8860b", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99 }}>-20%</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "stretch" }}>
                    {PLANS.map(plan => {
                        const price = annual ? plan.priceYearly : plan.priceMonthly;
                        const isCurrent = chosen === plan.id;
                        return (
                            <div key={plan.id} className={plan.popular ? "" : "fsu-card"} style={{
                                background: "#fff",
                                border: plan.popular ? "2px solid #b8860b" : "1px solid rgba(184,134,11,.13)",
                                borderRadius: 24, padding: "28px 24px",
                                display: "flex", flexDirection: "column", position: "relative",
                                transform: plan.popular ? "scale(1.025)" : "none",
                                boxShadow: plan.popular ? "0 12px 40px rgba(184,134,11,.18)" : "0 2px 12px rgba(100,80,30,.06)",
                                transition: "all .3s",
                            }}>
                                {plan.popular && (
                                    <span style={{
                                        position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                                        background: "linear-gradient(135deg, #b8860b, #e8b923)", color: "#fff",
                                        padding: "4px 16px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                                        fontFamily: "'DM Mono', monospace", letterSpacing: ".1em", whiteSpace: "nowrap",
                                        boxShadow: "0 4px 14px rgba(184,134,11,.4)",
                                    }}>✦ PHỔ BIẾN NHẤT ✦</span>
                                )}

                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#1a1612" }}>{plan.name}</span>
                                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, background: "rgba(184,134,11,.1)", color: "#b8860b", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{plan.tag}</span>
                                    </div>
                                    <p style={{ fontSize: 12.5, color: "#a89f92", lineHeight: 1.6, marginBottom: 14 }}>{plan.desc}</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <div style={{ display: "flex", alignItems: "baseline" }}>
                                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, color: "#1a1612" }}>
                                                {price === 0 ? "Miễn phí" : fmtVND(price)}
                                            </span>
                                            {price > 0 && <span style={{ fontSize: 12, color: "#a89f92", marginLeft: 4 }}>/{annual ? "năm" : "tháng"}</span>}
                                        </div>
                                        {plan.extraFee && (
                                            <div style={{ fontSize: 11, fontWeight: 600, color: "#b8860b", background: "rgba(184,134,11,.08)", border: "1px solid rgba(184,134,11,.18)", padding: "3px 10px", borderRadius: 8, width: "fit-content" }}>{plan.extraFee}</div>
                                        )}
                                    </div>
                                </div>

                                <hr style={{ border: "none", borderTop: "1px solid rgba(184,134,11,.1)", margin: "0 0 18px" }} />

                                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9, marginBottom: 18, flexGrow: 1 }}>
                                    {plan.features.map(f => (
                                        <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "#3d3529" }}>
                                            <span style={{ color: "#16a34a", fontSize: 14, lineHeight: 1.3, flexShrink: 0, marginTop: 1 }}>✓</span>{f}
                                        </li>
                                    ))}
                                    {plan.notIncluded?.map(f => (
                                        <li key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, color: "#c9b99a", textDecoration: "line-through" }}>
                                            <span style={{ color: "#f87171", fontSize: 14, lineHeight: 1.3, flexShrink: 0, marginTop: 1 }}>✕</span>{f}
                                        </li>
                                    ))}
                                </ul>

                                {plan.note && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#a89f92", fontStyle: "italic", textAlign: "center", marginBottom: 14 }}>{plan.note}</p>}

                                {isCurrent ? (
                                    <div style={{ textAlign: "center", padding: "10px", background: "rgba(34,197,94,.07)", color: "#16a34a", border: "1px solid rgba(34,197,94,.2)", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>✓ Đang sử dụng</div>
                                ) : (
                                    <button onClick={() => pickPlan(plan)} style={{
                                        width: "100%", padding: "11px", borderRadius: 12, fontWeight: 700, fontSize: 13,
                                        cursor: "pointer", transition: "all .2s",
                                        fontFamily: "'DM Sans', sans-serif",
                                        background: plan.popular ? "linear-gradient(135deg, #b8860b, #e8b923)" : "#faf8f3",
                                        color: plan.popular ? "#fff" : "#b8860b",
                                        boxShadow: plan.popular ? "0 4px 18px rgba(184,134,11,.35)" : "none",
                                        border: plan.popular ? "none" : "1px solid rgba(184,134,11,.3)",
                                    }}
                                        onMouseEnter={e => { if (!plan.popular) e.currentTarget.style.background = "#f0e6c8"; }}
                                        onMouseLeave={e => { if (!plan.popular) e.currentTarget.style.background = "#faf8f3"; }}
                                    >
                                        {plan.id === "free" ? "Use Now" : "Register Now"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FAQ */}
                <div style={{ marginTop: 52, background: "#fff", border: "1px solid rgba(184,134,11,.13)", borderRadius: 20, padding: "28px 32px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#1a1612", marginBottom: 20 }}>Câu hỏi thường gặp</h3>
                    {[
                        ["Tôi có thể hủy gói bất cứ lúc nào không?", "Có, bạn có thể hủy bất cứ lúc nào. Dịch vụ tiếp tục đến hết chu kỳ thanh toán hiện tại."],
                        ["Có hỗ trợ xuất hóa đơn VAT không?", "Tất cả các gói đều hỗ trợ xuất hóa đơn điện tử và kê khai thuế VAT theo quy định."],
                        ["Dữ liệu của tôi có được bảo mật không?", "Toàn bộ dữ liệu được mã hóa 256-bit và sao lưu tự động tại máy chủ đặt tại Việt Nam."],
                        ["Có hỗ trợ nhiều chi nhánh không?", "Có, bạn có thể thêm chi nhánh với phí bổ sung tùy gói. Gói Pro hỗ trợ không giới hạn nhân viên."],
                    ].map(([q, a]) => (
                        <details key={q} style={{ borderBottom: "1px solid rgba(184,134,11,.1)" }}>
                            <summary style={{ padding: "14px 0", fontSize: 14, fontWeight: 600, color: "#1a1612", display: "flex", justifyContent: "space-between" }}>
                                {q} <span style={{ color: "#b8860b", fontFamily: "'DM Mono', monospace" }}>+</span>
                            </summary>
                            <p style={{ fontSize: 13, color: "#7a6e5f", lineHeight: 1.75, paddingBottom: 14 }}>{a}</p>
                        </details>
                    ))}
                </div>
            </div>

            {/* CHECKOUT MODAL FOR PAID PLANS */}
            {showCheckout && checkoutPlan && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 20
                }}>
                    <div style={{
                        background: "#fff", border: "1px solid rgba(184,134,11,0.25)",
                        borderRadius: 24, padding: 32, width: "100%", maxWidth: 460,
                        boxShadow: "0 20px 60px rgba(100,80,30,0.18)", position: "relative"
                    }}>
                        <button onClick={() => setShowCheckout(false)} style={{
                            position: "absolute", top: 16, right: 16, border: "none", background: "none",
                            fontSize: 18, cursor: "pointer", color: "#a89f92", fontWeight: 700
                        }}>✕</button>

                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#1a1612", marginBottom: 6 }}>
                            Đăng ký {checkoutPlan.name}
                        </h3>
                        <p style={{ fontSize: 12.5, color: "#7a6e5f", marginBottom: 20 }}>
                            {checkoutPlan.desc}
                        </p>

                        <div style={{ background: "#fffaf0", border: "1px solid rgba(184,134,11,0.15)", borderRadius: 16, padding: 16, marginBottom: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13.5, fontWeight: 600 }}>
                                <span style={{ color: "#3d3529" }}>Chi phí thanh toán:</span>
                                <span style={{ color: "#b8860b", fontSize: 15 }}>
                                    {fmtVND(annual ? checkoutPlan.priceYearly : checkoutPlan.priceMonthly)}/{annual ? "năm" : "tháng"}
                                </span>
                            </div>
                        </div>

                        {!showPaymentDetails ? (
                            <button
                                onClick={() => setShowPaymentDetails(true)}
                                style={{
                                    width: "100%", padding: "13px", borderRadius: 12, border: "none",
                                    background: "linear-gradient(135deg, #b8860b, #e8b923)", color: "#fff",
                                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                                    boxShadow: "0 6px 20px rgba(184,134,11,0.35)", transition: "all 0.2s"
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "none"}
                            >
                                Register
                            </button>
                        ) : (
                            <div style={{ textAlign: "center" }}>
                                <div style={{ marginBottom: 20 }}>
                                    <p style={{ fontSize: 12.5, color: "#7a6e5f", fontWeight: 600, marginBottom: 12 }}>
                                        Phương thức thanh toán: Quét mã QR (Napas VietQR)
                                    </p>

                                    {/* QR Code image from public img folder */}
                                    <div style={{
                                        width: 200, height: 200, margin: "0 auto 12px",
                                        border: "1px solid rgba(184,134,11,0.18)", borderRadius: 16,
                                        padding: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                        boxShadow: "0 4px 16px rgba(100,80,30,0.06)"
                                    }}>
                                        <img
                                            src="/img/qr.jpg"
                                            alt="QR Code"
                                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
                                        />
                                    </div>

                                    <p style={{ fontSize: 11, color: "#a89f92", lineHeight: 1.5 }}>
                                        Quét mã QR trên để hoàn tất giao dịch chuyển khoản nhanh Napas VietQR.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        const finalPrice = annual ? checkoutPlan.priceYearly : checkoutPlan.priceMonthly;
                                        const expDate = annual
                                            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")
                                            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN");
                                        const newSub = {
                                            planId: checkoutPlan.id,
                                            planName: checkoutPlan.name,
                                            price: finalPrice,
                                            status: "Active",
                                            startDate: new Date().toLocaleDateString("vi-VN"),
                                            endDate: expDate,
                                            cycle: annual ? "Hàng năm" : "Hàng tháng"
                                        };
                                        localStorage.setItem("active_subscription", JSON.stringify(newSub));
                                        setChosen(checkoutPlan.id);
                                        showToast(`Thanh toán thành công và kích hoạt ${checkoutPlan.name}!`, "success");
                                        setShowCheckout(false);
                                        setPage("profile");
                                    }}
                                    style={{
                                        width: "100%", padding: "13px", borderRadius: 12, border: "none",
                                        background: "#16a34a", color: "#fff",
                                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                                        boxShadow: "0 4px 14px rgba(22,163,74,0.35)", transition: "all 0.2s"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "none"}
                                >
                                    Thanh toán thành công
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


/* ══════════════════════════════════════════════
   AUTH PAGES
══════════════════════════════════════════════ */
function AuthShell({ title, subtitle, children }) {
    return (
        <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 20px", background: "linear-gradient(160deg, #faf8f3 0%, #f0ead8 100%)", position: "relative", overflow: "hidden" }}>
            <div className="fsu-grid-bg" style={{ opacity: .5 }} />
            <div className="fsu-orb" style={{ width: 400, height: 400, background: "rgba(184,134,11,.07)", top: -100, right: -80 }} />
            <div style={{ background: "#fff", border: "1px solid rgba(184,134,11,.18)", borderRadius: 24, padding: "40px 36px", width: "100%", maxWidth: 440, position: "relative", boxShadow: "0 20px 60px rgba(100,80,30,.13)" }}>
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: 2, background: "linear-gradient(90deg, transparent, #b8860b, transparent)", borderRadius: 99 }} />
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg, #b8860b, #e8b923)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, boxShadow: "0 6px 20px rgba(184,134,11,.35)" }}>📦</div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, color: "#1a1612", marginBottom: 4 }}>{title}</h2>
                    {subtitle && <p style={{ fontSize: 13, color: "#a89f92", fontFamily: "'DM Mono', monospace" }}>{subtitle}</p>}
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, type = "text", value, onChange, placeholder, error, required }) {
    return (
        <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: "#7a6e5f", marginBottom: 5, letterSpacing: ".05em" }}>
                {label}{required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
            </label>
            <input type={type} value={value} onChange={onChange} placeholder={placeholder}
                className={`fsu-input ${error ? "fsu-input-err" : ""}`} />
            {error && <div className="fsu-err-msg">{error}</div>}
        </div>
    );
}

function LoginPage({ setPage, onLogin, showToast }) {
    const [form, setForm] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    async function submit() {
        const e = {};
        if (!form.username) e.username = "Vui lòng nhập tên đăng nhập.";
        if (!form.password) e.password = "Vui lòng nhập mật khẩu.";
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/nguoi-dung/login`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: form.username, password: form.password }),
            });
            const data = await res.json();
            if (res.ok && data.status === 200) {
                onLogin(data.data);
                showToast("Đăng nhập thành công!", "success");
                setPage("home");
            } else {
                showToast(data.message || "Tài khoản hoặc mật khẩu không chính xác.", "error");
            }
        } catch { showToast("Không thể kết nối đến máy chủ.", "error"); }
        finally { setLoading(false); }
    }

    function f(field) {
        return {
            value: form[field],
            onChange: e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: undefined })); },
            error: errors[field],
        };
    }

    return (
        <AuthShell title="Đăng nhập hệ thống" subtitle="FS WAREHOUSE MANAGEMENT">
            <Field label="TÊN ĐĂNG NHẬP" placeholder="ten_dang_nhap" required {...f("username")} />
            <Field label="MẬT KHẨU" type="password" placeholder="••••••••" required {...f("password")} />
            <div style={{ textAlign: "right", marginBottom: 18, marginTop: -6 }}>
                <span style={{ fontSize: 12, color: "#b8860b", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Quên mật khẩu?</span>
            </div>
            <button onClick={submit} disabled={loading} className="fsu-btn-primary" style={{ width: "100%", justifyContent: "center", opacity: loading ? .7 : 1 }}>
                {loading ? "Đang đăng nhập…" : "Đăng nhập →"}
            </button>
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#a89f92" }}>
                Chưa có tài khoản?{" "}
                <span style={{ color: "#b8860b", fontWeight: 600, cursor: "pointer" }} onClick={() => setPage("register")}>Đăng ký ngay</span>
            </p>
        </AuthShell>
    );
}

function RegisterPage({ setPage, showToast }) {
    const [form, setForm] = useState({ tenDangNhap: "", matKhau: "", hoTen: "", email: "", soDienThoai: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    function validate() {
        const e = {};
        if (!form.tenDangNhap || form.tenDangNhap.length < 6) e.tenDangNhap = "Tối thiểu 6 ký tự.";
        if (!form.matKhau || form.matKhau.length < 6) e.matKhau = "Tối thiểu 6 ký tự.";
        if (!form.hoTen || form.hoTen.length < 6) e.hoTen = "Tối thiểu 6 ký tự.";
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ.";
        if (!form.soDienThoai || form.soDienThoai.length < 10 || form.soDienThoai.length > 11) e.soDienThoai = "Phải từ 10–11 ký tự.";
        return e;
    }

    async function submit() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/nguoi-dung/register`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && (data.status === 200 || data.status === 201)) {
                showToast("Đăng ký thành công! Vui lòng đăng nhập.", "success");
                setPage("login");
            } else {
                showToast(data.message || "Đăng ký không thành công.", "error");
            }
        } catch { showToast("Không thể kết nối đến máy chủ.", "error"); }
        finally { setLoading(false); }
    }

    function f(field) {
        return {
            value: form[field],
            onChange: e => { setForm(p => ({ ...p, [field]: e.target.value })); setErrors(p => ({ ...p, [field]: undefined })); },
            error: errors[field],
        };
    }

    return (
        <AuthShell title="Tạo tài khoản" subtitle="FS WAREHOUSE MANAGEMENT">
            <Field label="TÊN ĐĂNG NHẬP" placeholder="Tên của hàng" required {...f("tenDangNhap")} />
            <Field label="MẬT KHẨU" type="password" placeholder="••••••••" required {...f("matKhau")} />
            <Field label="HỌ VÀ TÊN" placeholder="Nguyễn Văn A" required {...f("hoTen")} />
            <Field label="EMAIL" type="email" placeholder="email@gmail.com" required {...f("email")} />
            <Field label="SỐ ĐIỆN THOẠI" placeholder="0912345678" required {...f("soDienThoai")} />
            <button onClick={submit} disabled={loading} className="fsu-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 6, opacity: loading ? .7 : 1 }}>
                {loading ? "Đang đăng ký…" : "Tạo tài khoản →"}
            </button>
            <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#a89f92" }}>
                Đã có tài khoản?{" "}
                <span style={{ color: "#b8860b", fontWeight: 600, cursor: "pointer" }} onClick={() => setPage("login")}>Đăng nhập</span>
            </p>
        </AuthShell>
    );
}

/* ══════════════════════════════════════════════
   PROFILE PAGE
══════════════════════════════════════════════ */
function ProfilePage({ user, setPage }) {
    if (!user) return null;

    const [sub, setSub] = useState({
        planName: "Chưa đăng ký gói",
        endDate: "—"
    });

    useEffect(() => {
        const savedSub = localStorage.getItem("active_subscription");
        if (savedSub) {
            try {
                const parsed = JSON.parse(savedSub);
                setSub({
                    planName: parsed.planName || parsed.planId,
                    endDate: parsed.endDate || "Không giới hạn"
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    return (
        <div style={{ background: "#faf8f3", minHeight: "calc(100vh - 64px)", padding: "64px 32px" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <div className="fsu-label" style={{ marginBottom: 20 }}>👤 Hồ sơ</div>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#1a1612", marginBottom: 28, letterSpacing: -.8 }}>Thông tin cá nhân</h1>

                <div style={{ background: "#fff", border: "1px solid rgba(184,134,11,.15)", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 24px rgba(100,80,30,.09)" }}>
                    {/* header */}
                    <div style={{ background: "linear-gradient(135deg, #2d2106, #1a1200)", padding: "28px 28px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #d4a72b, #b8860b)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 800, border: "3px solid rgba(232,185,35,.4)", boxShadow: "0 4px 16px rgba(184,134,11,.4)" }}>
                            {(user.hoTen || "U")[0].toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>{user.hoTen}</p>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(232,185,35,.7)", marginTop: 2 }}>{user.tenDangNhap}</p>
                        </div>
                        <div style={{ marginLeft: "auto", background: "rgba(34,197,94,.15)", color: "#4ade80", border: "1px solid rgba(74,222,128,.25)", padding: "4px 12px", borderRadius: 99, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>● ACTIVE</div>
                    </div>

                    {/* body */}
                    <div style={{ padding: "24px 28px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                ["Email", user.email || "—"],
                                ["Số điện thoại", user.soDienThoai || "—"],
                                ["Vai trò", user.vaiTro || "Người dùng"],
                            ].map(([l, v]) => (
                                <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid rgba(184,134,11,.08)" }}>
                                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a89f92", letterSpacing: ".05em" }}>{l.toUpperCase()}</span>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: "#1a1612" }}>{v}</span>
                                </div>
                            ))}
                        </div>

                        {/* subscription */}
                        <div style={{ marginTop: 24 }}>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8860b", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 12 }}>Gói dịch vụ đang dùng</p>
                            <div style={{ background: "rgba(184,134,11,.06)", border: "1px solid rgba(184,134,11,.18)", borderRadius: 14, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: "#b8860b" }}>{sub.planName}</p>
                                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a89f92", marginTop: 3 }}>Hết hạn ngày {sub.endDate}</p>
                                </div>
                                <button className="fsu-btn-primary" onClick={() => setPage("pricing")} style={{ padding: "8px 18px", fontSize: 12 }}>
                                    Nâng cấp →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════ */
function Footer({ setPage }) {
    return (
        <footer style={{ background: "#faf8f3", borderTop: "1px solid rgba(184,134,11,.15)", padding: "56px 32px 28px" }}>
            <div style={{ maxWidth: 1160, margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #b8860b, #e8b923)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 800, color: "#1a1612" }}>
                                <span style={{ color: "#b8860b" }}>FS</span>
                                <span style={{ color: "#7a6e5f", fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 12, marginLeft: 6 }}>WMS</span>
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: "#a89f92", lineHeight: 1.8, maxWidth: 260 }}>
                            Hệ thống giải pháp quản lý kho thông minh cho doanh nghiệp thời trang hiện đại.
                        </p>
                        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                            {["📧", "📞"].map((ic, i) => (
                                <div key={i} style={{ width: 34, height: 34, borderRadius: 9, background: "#fff", border: "1px solid rgba(184,134,11,.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, transition: "all .2s" }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#b8860b"; e.currentTarget.style.background = "rgba(184,134,11,.06)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(184,134,11,.15)"; e.currentTarget.style.background = "#fff"; }}
                                >{ic}</div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: "Sản phẩm", links: [["Trang chủ", "home"], ["Tính năng", "features"], ["Bảng giá", "pricing"]] },
                        { title: "Tài nguyên", links: [["Hướng dẫn", null], ["API Docs", null], ["Chính sách", null]] },
                        { title: "Hỗ trợ", links: [["Liên hệ IT", null], ["Trung tâm trợ giúp", null], ["Bảo mật", null]] },
                    ].map(({ title, links }) => (
                        <div key={title}>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8860b", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 18 }}>{title}</p>
                            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                                {links.map(([l, page]) => (
                                    <li key={l}>
                                        <span onClick={() => page && setPage(page)} style={{ fontSize: 13, color: "#a89f92", cursor: page ? "pointer" : "default", transition: "color .15s" }}
                                            onMouseEnter={e => { if (page) e.target.style.color = "#b8860b"; }}
                                            onMouseLeave={e => { e.target.style.color = "#a89f92"; }}
                                        >{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(184,134,11,.1)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#c9b99a", letterSpacing: ".08em" }}>
                        © 2026 CÔNG TY CỔ PHẦN PHẦN MỀM FASHION SOLUTION (FS). BẢO LƯU MỌI QUYỀN.
                    </p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#c9b99a" }}>v2.0.0 · BUILD 2026</p>
                </div>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════ */
export default function HomePageUser() {
    const [page, setPage] = useState("home");
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);

    function showToast(msg, type = "success") { setToast({ msg, type, key: Date.now() }); }
    function handleLogin(data) { setUser(data?.nguoiDung || data?.user || data || {}); }
    function handleLogout() { setUser(null); setPage("home"); showToast("Đã đăng xuất thành công.", "success"); }

    return (
        <>
            <style>{CSS}</style>
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
                {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
                <main style={{ flexGrow: 1 }}>
                    {page === "home" && <HomePage setPage={setPage} user={user} />}
                    {page === "features" && <FeaturesPage />}
                    {page === "pricing" && <PricingPage user={user} setPage={setPage} showToast={showToast} />}
                    {page === "login" && <LoginPage setPage={setPage} onLogin={handleLogin} showToast={showToast} />}
                    {page === "register" && <RegisterPage setPage={setPage} showToast={showToast} />}
                    {page === "profile" && <ProfilePage user={user} setPage={setPage} />}
                </main>
                <Footer setPage={setPage} />
            </div>
        </>
    );
}