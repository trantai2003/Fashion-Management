import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Users, Zap, Shield,
    TrendingUp, ArrowRight, Boxes,
    ChevronDown, Mail, Phone, ExternalLink,
    BarChart2, Lock, Cpu, Layers, Menu, X, Database, BookOpen
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   GLOBAL STYLES — Light Ivory / Gold Luxury + Responsive
══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

:root {
  --gold:        #b8860b;
  --gold-rich:   #c9960c;
  --gold-light:  #e8b923;
  --gold-pale:   rgba(184,134,11,0.12);
  --gold-dim:    rgba(184,134,11,0.08);
  --ivory:       #faf8f3;
  --ivory-2:     #f5f2ea;
  --ivory-3:     #ede9de;
  --cream:       #f0ead8;
  --sand:        #e8dfc8;
  --text:        #1a1612;
  --text-2:      #3d3529;
  --text-dim:    #7a6e5f;
  --text-muted:  #a89f92;
  --border:      rgba(184,134,11,0.18);
  --border-soft: rgba(184,134,11,0.1);
  --shadow:      0 4px 24px rgba(100,80,30,0.1);
  --shadow-lg:   0 12px 48px rgba(100,80,30,0.15);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--ivory);
  color: var(--text);
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--ivory-2); }
::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.35); border-radius: 99px; }

.grid-bg {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: gridDrift 40s linear infinite;
}
@keyframes gridDrift { to { background-position: 56px 56px; } }

.orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }

.section-label {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em;
  color: var(--gold-rich); text-transform: uppercase;
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: var(--gold-pale);
  margin-bottom: 16px;
}

/* RESPONSIVE LAYOUT CLASSES */
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.btn-group { display: flex; gap: 12px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
.stats-item { text-align: center; padding: 0 32px; border-right: 1px solid var(--border-soft); }
.stats-item:last-child { border-right: none; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 52px; }

.desktop-only { display: flex; }
.mobile-only { display: none; }

.section-padding { padding: 100px 32px; }
.stats-padding { padding: 44px 32px; }

/* TABLET STYLES */
@media (max-width: 1024px) {
  .hero-grid { gap: 40px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); row-gap: 32px; }
  .stats-item:nth-child(2) { border-right: none; }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-grid { grid-template-columns: 1fr 1fr; }
}

/* MOBILE STYLES */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block; }
  
  .mobile-menu-btn { background: transparent; border: none; color: var(--gold-rich); cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .mobile-menu-container {
    position: absolute; top: 68px; left: 0; right: 0;
    background: rgba(250,248,243,0.98); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-soft);
    padding: 24px 32px; display: flex; flex-direction: column; gap: 20px;
    box-shadow: 0 10px 30px rgba(100,80,30,0.1);
  }

  .hero-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; }
  .hero-grid > div:first-child { display: flex; flex-direction: column; align-items: center; text-align: center; }
  .hero-grid p { text-align: center; }
  .hero-title { font-size: 42px !important; line-height: 1.15 !important; }
  
  .btn-group { flex-direction: column; width: 100%; max-width: 320px; margin: 0 auto 36px; }
  .btn-group button { width: 100%; justify-content: center; }

  .mockup-badge-tr { top: -10px !important; right: -10px !important; }
  .mockup-badge-bl { bottom: -10px !important; left: -10px !important; }

  .stats-grid { grid-template-columns: 1fr; row-gap: 32px; }
  .stats-item { border-right: none; padding: 0; }
  .stats-item:not(:last-child) { border-bottom: 1px solid var(--border-soft); padding-bottom: 24px; }

  .section-padding { padding: 60px 20px !important; }
  .stats-padding { padding: 40px 20px !important; }
  .section-title { font-size: 34px !important; }

  .features-grid { grid-template-columns: 1fr; gap: 20px; }
  .footer-grid { grid-template-columns: 1fr; gap: 32px; margin-bottom: 32px; }
  
  .splash-brand-title { font-size: 40px !important; flex-wrap: wrap; justify-content: center; }
  .splash-stats-bar { flex-wrap: wrap; gap: 16px !important; justify-content: center; }
  .splash-stat-item { flex: 1 1 40%; }
}
`;

/* ══════════════════════════════════════════════════
   NAV (INTERNAL)
══════════════════════════════════════════════════ */
function Nav({ navigate }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const navLinks = [
        ['Tổng quan', 'overview'],
        ['Phân hệ', 'modules'],
        ['Tài liệu', 'docs'],
        ['Hỗ trợ IT', 'it-support']
    ];

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            transition: 'all 0.3s',
            background: scrolled || menuOpen ? 'rgba(250,248,243,0.98)' : 'transparent',
            backdropFilter: scrolled || menuOpen ? 'blur(16px)' : 'none',
            borderBottom: scrolled || menuOpen ? '1px solid rgba(184,134,11,0.15)' : '1px solid transparent',
            boxShadow: scrolled && !menuOpen ? '0 2px 20px rgba(100,80,30,0.08)' : 'none',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #b8860b, #e8b923)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(184,134,11,0.35)',
                    }}>
                        <Boxes size={19} style={{ color: '#fff' }} strokeWidth={1.8} />
                    </div>
                    <span style={{ fontSize: 21, fontWeight: 800, letterSpacing: -0.5, fontFamily: 'Playfair Display, serif' }}>
                        <span style={{ color: '#b8860b' }}>FS</span>
                        <span style={{ color: '#3d3529', fontWeight: 600, fontSize: 13, marginLeft: 7, fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}>WMS</span>
                    </span>
                </div>

                <div className="desktop-only" style={{ alignItems: 'center', gap: 36 }}>
                    {navLinks.map(([l, id]) => (
                        <a key={l} href={`#${id}`} style={{
                            color: '#7a6e5f', fontSize: 14, fontWeight: 500, textDecoration: 'none',
                            transition: 'color 0.2s', fontFamily: 'DM Sans, sans-serif',
                        }}
                            onMouseEnter={e => e.target.style.color = '#b8860b'}
                            onMouseLeave={e => e.target.style.color = '#7a6e5f'}
                        >{l}</a>
                    ))}
                </div>

                <div className="desktop-only" style={{ alignItems: 'center', gap: 10 }}>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                        border: 'none', padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 16px rgba(184,134,11,0.35)',
                        fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(184,134,11,0.45)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,134,11,0.35)'; }}
                    >Đăng nhập hệ thống <ArrowRight size={14} /></button>
                </div>

                <button className="mobile-only mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {menuOpen && (
                <div className="mobile-only mobile-menu-container">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {navLinks.map(([l, id]) => (
                            <a key={l} href={`#${id}`} onClick={() => setMenuOpen(false)} style={{
                                color: '#3d3529', fontSize: 16, fontWeight: 600, textDecoration: 'none',
                                fontFamily: 'DM Sans, sans-serif', paddingBottom: 12, borderBottom: '1px solid rgba(184,134,11,0.1)'
                            }}>{l}</a>
                        ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                        <button onClick={() => { setMenuOpen(false); navigate('/login'); }} style={{
                            background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                            border: 'none', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                            boxShadow: '0 4px 16px rgba(184,134,11,0.35)', fontFamily: 'DM Sans, sans-serif', width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}>Đăng nhập hệ thống <ArrowRight size={16} /></button>
                    </div>
                </div>
            )}
        </nav>
    );
}

/* ══════════════════════════════════════════════════
   HERO (INTERNAL)
══════════════════════════════════════════════════ */
function Hero({ navigate }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    return (
        <section id="overview" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 100, background: 'linear-gradient(160deg, #faf8f3 0%, #f5f0e4 50%, #eee6d0 100%)' }}>
            <div className="grid-bg" />
            <div className="orb" style={{ width: 600, height: 600, background: 'rgba(184,134,11,0.08)', top: -200, right: -150 }} />
            <div className="orb" style={{ width: 400, height: 400, background: 'rgba(201,150,12,0.06)', bottom: -100, left: -80 }} />
            <div style={{ position: 'absolute', top: 110, left: 40, width: 110, height: 110, borderTop: '1.5px solid rgba(184,134,11,0.25)', borderLeft: '1.5px solid rgba(184,134,11,0.25)' }} />
            <div style={{ position: 'absolute', bottom: 40, right: 40, width: 110, height: 110, borderBottom: '1.5px solid rgba(184,134,11,0.25)', borderRight: '1.5px solid rgba(184,134,11,0.25)' }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%' }}>
                <div className="hero-grid">
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
                        <div className="section-label">
                            <Database size={11} />
                            Portal Dành Riêng Cho Nhân Sự
                        </div>
                        <h1 className="hero-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: 52, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.2, marginBottom: 24, color: '#1a1612' }}>
                            Trung tâm<br />
                            <span style={{ color: '#7a6e5f' }}>vận hành kho</span><br />
                            <span style={{ color: '#b8860b', fontWeight: 700, fontSize: 38, display: 'inline-block', marginTop: 10 }}>FS - Fashion Solution</span>
                        </h1>
                        <p style={{ fontSize: 16, color: '#7a6e5f', lineHeight: 1.8, marginBottom: 40, maxWidth: 460, fontFamily: 'DM Sans, sans-serif' }}>
                            Truy cập vào không gian làm việc số để quản lý toàn bộ chuỗi cung ứng nội bộ: kiểm soát tồn kho, phê duyệt đơn mua hàng và báo cáo hiệu suất tự động.
                        </p>
                        <div className="btn-group">
                            <button onClick={() => navigate('/login')} style={{
                                background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                                border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                boxShadow: '0 6px 28px rgba(184,134,11,0.4)', fontFamily: 'DM Sans, sans-serif',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(184,134,11,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(184,134,11,0.4)'; }}
                            >
                                Truy cập Dashboard <ArrowRight size={16} />
                            </button>
                            <button style={{
                                background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(184,134,11,0.25)',
                                color: '#3d3529', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                backdropFilter: 'blur(8px)', fontFamily: 'DM Sans, sans-serif',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8860b'; e.currentTarget.style.color = '#b8860b'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.25)'; e.currentTarget.style.color = '#3d3529'; }}
                            >Xem tài liệu HDSD <BookOpen size={14} /></button>
                        </div>
                    </div>

                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px) scale(0.97)', transition: 'all 0.8s ease 0.2s', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse, rgba(184,134,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        <div style={{
                            background: '#fff',
                            border: '1px solid rgba(184,134,11,0.2)', borderRadius: 24,
                            padding: 26, boxShadow: '0 32px 80px rgba(100,80,30,0.18), 0 0 0 1px rgba(184,134,11,0.06)',
                            position: 'relative', width: '100%', overflowX: 'auto'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, transparent, #b8860b, transparent)', borderRadius: 99 }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#b8860b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>FS WMS Dashboard</p>
                                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, marginTop: 2, color: '#1a1612' }}>Tổng quan hệ thống</p>
                                </div>
                                <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontFamily: 'DM Mono, monospace' }}>● SYSTEM ONLINE</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16, minWidth: 320 }}>
                                {[
                                    { l: 'Tồn kho tổng', v: '142.5K', c: '#b8860b', up: '+1.2%' },
                                    { l: 'Đơn chờ duyệt', v: '84', c: '#2563eb', up: 'Cần xử lý' },
                                    { l: 'Hiệu suất kho', v: '98%', c: '#16a34a', up: 'Ổn định' },
                                ].map(({ l, v, c, up }) => (
                                    <div key={l} style={{ background: '#faf8f3', border: '1px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                        <p style={{ fontSize: 11, color: '#a89f92', marginBottom: 6, fontFamily: 'DM Mono, monospace' }}>{l}</p>
                                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: c }}>{v}</p>
                                        <p style={{ fontSize: 11, color: up === 'Cần xử lý' ? '#dc2626' : '#16a34a', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>{up}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#faf8f3', border: '1px solid rgba(184,134,11,0.1)', borderRadius: 14, padding: 16, marginBottom: 14, minWidth: 320 }}>
                                <p style={{ fontSize: 11, color: '#a89f92', marginBottom: 12, fontFamily: 'DM Mono, monospace' }}>Lưu lượng nhập xuất / Tuần</p>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <div style={{ height: h * 0.6, background: `rgba(184,134,11,${0.25 + i * 0.1})`, borderRadius: '4px 4px 0 0' }} />
                                            <p style={{ fontSize: 9, color: '#a89f92', textAlign: 'center', fontFamily: 'DM Mono' }}>T{i + 2}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ minWidth: 320 }}>
                                {[
                                    { code: 'PO-2024-884', status: 'Chờ duyệt', color: '#b8860b', bg: 'rgba(184,134,11,0.08)' },
                                    { code: 'PO-2024-883', status: 'Đang vận chuyển', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
                                    { code: 'PO-2024-882', status: 'Đã nhập kho', color: '#16a34a', bg: 'rgba(34,197,94,0.08)' },
                                ].map(({ code, status, color, bg }) => (
                                    <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(184,134,11,0.08)' }}>
                                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#7a6e5f' }}>{code}</span>
                                        <span style={{ fontSize: 11, color, background: bg, padding: '3px 10px', borderRadius: 99, border: `1px solid ${color}30`, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mockup-badge-tr" style={{ position: 'absolute', top: -14, right: -20, background: 'linear-gradient(135deg, #b8860b, #e8b923)', borderRadius: 99, padding: '7px 14px', fontSize: 11, fontWeight: 700, color: '#fff', boxShadow: '0 6px 20px rgba(184,134,11,0.45)', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif', zIndex: 2 }}>
                            ✦ Internal Only
                        </div>
                        <div className="mockup-badge-bl" style={{ position: 'absolute', bottom: -14, left: -20, background: '#fff', border: '1px solid rgba(184,134,11,0.25)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(100,80,30,0.12)', zIndex: 2 }}>
                            <Shield size={14} style={{ color: '#22c55e' }} />
                            <span style={{ fontSize: 12, color: '#3d3529', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, whiteSpace: 'nowrap' }}>FS Secure Network</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4, animation: 'bounce 2s infinite' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#a89f92', textTransform: 'uppercase' }}>Scroll</p>
                <ChevronDown size={16} style={{ color: '#b8860b' }} />
            </div>
            <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }`}</style>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   STATS STRIP (INTERNAL)
══════════════════════════════════════════════════ */
function StatsStrip() {
    return (
        <section className="stats-padding" style={{ background: '#fff', borderTop: '1px solid rgba(184,134,11,0.15)', borderBottom: '1px solid rgba(184,134,11,0.15)', boxShadow: '0 2px 20px rgba(100,80,30,0.06)' }}>
            <div className="stats-grid" style={{ maxWidth: 1200, margin: '0 auto' }}>
                {[
                    { v: '5', l: 'Kho hàng chi nhánh' },
                    { v: '20,000+', l: 'Sản phẩm quản lý' },
                    { v: '500+', l: 'Đơn xử lý mỗi ngày' },
                    { v: '99.9%', l: 'Tỉ lệ chính xác' },
                ].map(({ v, l }) => (
                    <div className="stats-item" key={l}>
                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 800, color: '#b8860b', letterSpacing: -1 }}>{v}</p>
                        <p style={{ fontSize: 13, color: '#a89f92', marginTop: 4, fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>{l}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   FEATURES / MODULES (INTERNAL)
══════════════════════════════════════════════════ */
function FeaturesSection() {
    const features = [
        { icon: Package, title: 'Quản lý kho hàng', desc: 'Kiểm soát số lượng tồn kho theo thời gian thực tại toàn bộ hệ thống chi nhánh, tự động cảnh báo mức tồn kho tối thiểu.' },
        { icon: BarChart2, title: 'Báo cáo thông minh', desc: 'Trích xuất báo cáo vận hành chi tiết, tự động hóa bằng AI để tối ưu hóa quy trình nhập xuất.' },
        { icon: Users, title: 'Quản lý nhân sự', desc: 'Phân quyền linh hoạt (Thủ kho, Kế toán, Quản lý). Theo dõi KPI và hiệu suất từng ca làm việc.' },
        { icon: Zap, title: 'Quy trình PO', desc: 'Khởi tạo và phê duyệt đơn đặt hàng (Purchase Order) từ nhà cung cấp một cách đồng bộ và minh bạch.' },
        { icon: Lock, title: 'Bảo mật dữ liệu', desc: 'Mã hóa cấp doanh nghiệp cho mọi luồng dữ liệu nội bộ. Phân quyền chặt chẽ trên từng tác vụ.' },
        { icon: Cpu, title: 'Tự động hóa', desc: 'Hệ thống tự động đề xuất số lượng nhập hàng dựa trên machine learning và lịch sử tiêu thụ.' },
    ];

    return (
        <section id="modules" className="section-padding" style={{ background: 'linear-gradient(180deg, #faf8f3 0%, #f0ead8 100%)', position: 'relative', overflow: 'hidden' }}>
            <div className="orb" style={{ width: 500, height: 500, background: 'rgba(184,134,11,0.06)', top: '20%', left: -200 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><Layers size={11} />Phân hệ hệ thống</div>
                    <h2 className="section-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: 46, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 16, color: '#1a1612' }}>
                        Các chức năng<br />
                        <span style={{ color: '#b8860b' }}>vận hành chính</span>
                    </h2>
                    <p style={{ color: '#7a6e5f', fontSize: 16, maxWidth: 520, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
                        Dành riêng cho nhân sự FS, hệ thống được chia thành các phân hệ chuyên trách.
                    </p>
                </div>

                <div className="features-grid">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title}
                            style={{
                                background: '#fff', border: '1px solid rgba(184,134,11,0.12)',
                                borderRadius: 20, padding: 28, transition: 'all 0.3s', cursor: 'default',
                                boxShadow: '0 2px 12px rgba(100,80,30,0.06)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(184,134,11,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(100,80,30,0.14)'; }}
                            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(184,134,11,0.12)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(100,80,30,0.06)'; }}
                        >
                            <div style={{
                                width: 46, height: 46, borderRadius: 13,
                                background: 'linear-gradient(135deg, rgba(184,134,11,0.15), rgba(232,185,35,0.08))',
                                border: '1px solid rgba(184,134,11,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                            }}>
                                <Icon size={20} style={{ color: '#b8860b' }} strokeWidth={1.5} />
                            </div>
                            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#1a1612' }}>{title}</p>
                            <p style={{ fontSize: 14, color: '#7a6e5f', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   CTA (INTERNAL)
══════════════════════════════════════════════════ */
function CTASection({ navigate }) {
    return (
        <section className="section-padding" style={{ background: 'linear-gradient(135deg, #2d2106 0%, #1a1200 100%)', position: 'relative', overflow: 'hidden' }}>
            <div className="grid-bg" style={{ opacity: 0.15 }} />
            <div className="orb" style={{ width: 600, height: 400, background: 'rgba(184,134,11,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(184,134,11,0.4)', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(184,134,11,0.1)' }}>
                    <Shield size={32} style={{ color: '#e8b923' }} strokeWidth={1.5} />
                </div>
                <h2 className="section-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 900, letterSpacing: -1.5, marginBottom: 20, lineHeight: 1.1, color: '#fff' }}>
                    Truy cập vào <span style={{ color: '#e8b923' }}>Hệ thống</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, marginBottom: 44, maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>
                    Sử dụng tài khoản email doanh nghiệp của bạn để truy cập vào hệ thống phần mềm quản lý kho FS WMS.
                </p>
                <div className="btn-group" style={{ justifyContent: 'center', marginTop: 44, marginBottom: 24 }}>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                        border: 'none', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                        boxShadow: '0 6px 28px rgba(184,134,11,0.5)', fontFamily: 'DM Sans, sans-serif',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(184,134,11,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(184,134,11,0.5)'; }}
                    >
                        Đăng nhập hệ thống <ArrowRight size={16} />
                    </button>
                    <button style={{
                        background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.7)', padding: '14px 32px', borderRadius: 12, fontSize: 15,
                        fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,185,35,0.5)'; e.currentTarget.style.color = '#e8b923'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    >Liên hệ IT Support</button>
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                    YÊU CẦU ỦY QUYỀN TRUY CẬP · GHI LOG HỆ THỐNG LIÊN TỤC
                </p>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   FOOTER (INTERNAL)
══════════════════════════════════════════════════ */
function Footer() {
    return (
        <footer style={{ background: '#faf8f3', borderTop: '1px solid rgba(184,134,11,0.15)', padding: '64px 32px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div className="footer-grid">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #b8860b, #e8b923)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(184,134,11,0.3)' }}>
                                <Boxes size={16} style={{ color: '#fff' }} strokeWidth={1.8} />
                            </div>
                            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 800, color: '#1a1612' }}>
                                <span style={{ color: '#b8860b' }}>FS</span>
                                <span style={{ color: '#7a6e5f', fontWeight: 500, fontSize: 13, marginLeft: 6, fontFamily: 'DM Mono, monospace' }}>WMS</span>
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#a89f92', lineHeight: 1.8, maxWidth: 280, fontFamily: 'DM Sans, sans-serif' }}>
                            Nền tảng quản trị nội bộ FS. Mọi dữ liệu trên hệ thống là tài sản của công ty và yêu cầu bảo mật.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            {[Mail, Phone].map((Icon, i) => (
                                <div key={i} style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', border: '1px solid rgba(184,134,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8860b'; e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.15)'; e.currentTarget.style.background = '#fff'; }}
                                >
                                    <Icon size={14} style={{ color: '#a89f92' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {[
                        { title: 'Phân hệ', links: ['Kho Hàng', 'Đơn Mua', 'Nhân Sự', 'Báo Cáo'] },
                        { title: 'Tài nguyên', links: ['Quy trình chuẩn', 'Sổ tay hướng dẫn', 'Quy định bảo mật', 'Thông báo nội bộ'] },
                        { title: 'Hỗ trợ', links: ['Gửi yêu cầu IT', 'Lịch bảo trì', 'Cấp lại mật khẩu'] },
                    ].map(({ title, links }) => (
                        <div key={title}>
                            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#b8860b', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>{title}</p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {links.map(l => (
                                    <li key={l}><a href="#" style={{ fontSize: 13, color: '#a89f92', textDecoration: 'none', transition: 'color 0.2s', fontFamily: 'DM Sans, sans-serif' }}
                                        onMouseEnter={e => e.target.style.color = '#b8860b'}
                                        onMouseLeave={e => e.target.style.color = '#a89f92'}
                                    >{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(184,134,11,0.1)', paddingTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#c9b99a', letterSpacing: '0.08em' }}>© 2026 FS FASHION SOLUTION · WAREHOUSE MANAGEMENT SYSTEM</p>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#c9b99a', letterSpacing: '0.1em' }}>v2.0.0 · BUILD 2026</div>
                </div>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════
   SPLASH SCREEN — Light Ivory Gold (INTERNAL)
══════════════════════════════════════════════════ */
const SPLASH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

.splash-root {
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(160deg, #faf8f3 0%, #f0ead8 60%, #e8dfc8 100%);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1);
  font-family: 'DM Sans', system-ui, sans-serif;
}
.splash-root.enter { opacity: 0; }
.splash-root.hold  { opacity: 1; }
.splash-root.exit  { opacity: 0; transform: scale(1.03); pointer-events: none; }

.splash-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.07) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: splashGridDrift 25s linear infinite;
}
@keyframes splashGridDrift { to { background-position: 56px 56px; } }

.splash-corner-tl, .splash-corner-br {
  position: absolute; width: 180px; height: 180px;
  border: 1.5px solid rgba(184,134,11,0.3);
}
.splash-corner-tl { top: 32px; left: 32px; border-right: none; border-bottom: none; animation: splashCornerIn 1s 0.5s both; }
.splash-corner-br { bottom: 32px; right: 32px; border-left: none; border-top: none; animation: splashCornerIn 1s 0.7s both; }
@keyframes splashCornerIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

.splash-orb-1 {
  position: absolute; width: 500px; height: 500px; border-radius: 50%;
  background: rgba(184,134,11,0.1); filter: blur(90px);
  top: -150px; right: -150px; pointer-events: none;
  animation: splashOrbPulse 5s ease-in-out infinite alternate;
}
.splash-orb-2 {
  position: absolute; width: 350px; height: 350px; border-radius: 50%;
  background: rgba(201,150,12,0.08); filter: blur(80px);
  bottom: -100px; left: -80px; pointer-events: none;
  animation: splashOrbPulse 4s 1s ease-in-out infinite alternate;
}
@keyframes splashOrbPulse { from { opacity: 0.5; transform: scale(0.95); } to { opacity: 1; transform: scale(1.05); } }

.splash-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(184,134,11,0.5), transparent);
  top: -2px; opacity: 0;
}
.splash-scanline.active { animation: splashScan 3.5s 0.5s ease-in-out forwards; }
@keyframes splashScan { 0%{top:0;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }

.splash-content {
  display: flex; flex-direction: column; align-items: center;
  gap: 28px; position: relative; z-index: 2; text-align: center;
}

.splash-logo-ring {
  position: relative; width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
  animation: splashLogoAppear 0.8s 0.2s both;
}
@keyframes splashLogoAppear { from{opacity:0;transform:scale(0.6) rotate(-15deg)} to{opacity:1;transform:scale(1) rotate(0)} }

.splash-logo-inner {
  width: 78px; height: 78px; border-radius: 22px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 32px rgba(184,134,11,0.4), 0 0 0 1px rgba(184,134,11,0.2);
}
.splash-logo-ring.pulse .splash-logo-inner {
  box-shadow: 0 12px 48px rgba(184,134,11,0.55), 0 0 0 1px rgba(184,134,11,0.3);
}
.splash-logo-icon { color: #fff; }

.splash-logo-svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.splash-logo-track { fill: none; stroke: rgba(184,134,11,0.15); stroke-width: 2; }
.splash-logo-arc {
  fill: none; stroke: #b8860b; stroke-width: 2;
  stroke-dasharray: 340; stroke-dashoffset: 340; stroke-linecap: round;
  transition: stroke-dashoffset 2s cubic-bezier(.4,0,.2,1) 0.4s;
}
.splash-logo-arc.drawn { stroke-dashoffset: 0; }

.splash-brand-block { opacity: 0; transform: translateY(18px); transition: all 0.7s 0.6s; }
.splash-brand-block.visible { opacity: 1; transform: translateY(0); }
.splash-brand-tag { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(184,134,11,0.7); margin-bottom: 8px; }
.splash-brand-title {
  font-family: 'Playfair Display', serif;
  font-size: 52px; font-weight: 900; line-height: 1; color: #1a1612;
  display: flex; align-items: center; gap: 16px; letter-spacing: -1px; justify-content: center;
}
.splash-brand-fs { color: #b8860b; }
.splash-brand-divider { width: 1px; height: 42px; background: rgba(184,134,11,0.25); }
.splash-brand-wms { color: #3d3529; font-size: 38px; font-family: 'DM Mono', monospace; font-weight: 500; }

.splash-welcome-block { opacity: 0; transform: translateY(16px); transition: all 0.7s 1s; }
.splash-welcome-block.visible { opacity: 1; transform: translateY(0); }
.splash-welcome-line { font-size: 13px; color: #a89f92; font-weight: 300; font-family: 'DM Sans', sans-serif; }
.splash-welcome-main { font-size: 22px; font-weight: 600; color: #1a1612; margin: 5px 0; font-family: 'Playfair Display', serif; }
.splash-welcome-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(184,134,11,0.7); letter-spacing: 0.1em; }

.splash-stats-bar {
  display: flex; gap: 32px; opacity: 0; transform: translateY(12px);
  transition: all 0.7s 1.4s;
  padding: 16px 32px;
  border: 1px solid rgba(184,134,11,0.2);
  border-radius: 14px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(100,80,30,0.1);
}
.splash-stats-bar.visible { opacity: 1; transform: translateY(0); }
.splash-stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.splash-stat-num { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: #b8860b; }
.splash-stat-label { font-family: 'DM Mono', monospace; font-size: 10px; color: #a89f92; text-transform: uppercase; letter-spacing: 0.1em; }

.splash-progress-track {
  width: 220px; height: 3px; background: rgba(184,134,11,0.15); border-radius: 99px; overflow: hidden;
}
.splash-progress-fill {
  height: 100%; width: 0;
  background: linear-gradient(90deg, #b8860b, #e8b923);
  border-radius: 99px;
  transition: width 8.4s cubic-bezier(.4,0,.2,1) 0.8s;
  box-shadow: 0 0 8px rgba(184,134,11,0.5);
}
.splash-progress-fill.filling { width: 100%; }
.splash-progress-label { font-family: 'DM Mono', monospace; font-size: 10px; color: #c9b99a; letter-spacing: 0.15em; }
`;

function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 400);
        const t2 = setTimeout(() => setPhase('exit'), 8800);
        const t3 = setTimeout(onDone, 7200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <div className={`splash-root ${phase}`}>
            <style>{SPLASH_STYLES}</style>
            <div className="splash-grid" />
            <div className="splash-corner-tl" />
            <div className="splash-corner-br" />
            <div className="splash-orb-1" />
            <div className="splash-orb-2" />
            <div className={`splash-scanline ${phase === 'hold' ? 'active' : ''}`} />

            <div className="splash-content">
                <div className={`splash-logo-ring ${phase === 'hold' ? 'pulse' : ''}`}>
                    <div className="splash-logo-inner">
                        <Boxes size={36} strokeWidth={1.8} className="splash-logo-icon" />
                    </div>
                    <svg className="splash-logo-svg" viewBox="0 0 120 120">
                        <circle className="splash-logo-track" cx="60" cy="60" r="54" />
                        <circle className={`splash-logo-arc ${phase === 'hold' ? 'drawn' : ''}`} cx="60" cy="60" r="54" />
                    </svg>
                </div>

                <div className={`splash-brand-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <div className="splash-brand-tag">INTERNAL MANAGEMENT SYSTEM</div>
                    <h1 className="splash-brand-title">
                        <span className="splash-brand-fs">FS</span>
                        <span className="splash-brand-divider" />
                        <span className="splash-brand-wms">WMS</span>
                    </h1>
                </div>

                <div className={`splash-welcome-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <p className="splash-welcome-line">Hệ thống quản lý chuỗi cung ứng nội bộ</p>
                    <p className="splash-welcome-main">FS - Fashion Solution</p>
                    <p className="splash-welcome-sub">Secure Network Access · v2.0</p>
                </div>

                <div className={`splash-stats-bar ${phase === 'hold' ? 'visible' : ''}`}>
                    {[{ n: 'SECURE', l: 'Connection' }, { n: '256-BIT', l: 'Encryption' }, { n: 'SYNC', l: 'Database' }].map(({ n, l }) => (
                        <div key={l} className="splash-stat-item">
                            <span className="splash-stat-num">{n}</span>
                            <span className="splash-stat-label">{l}</span>
                        </div>
                    ))}
                </div>

                <div className="splash-progress-track">
                    <div className={`splash-progress-fill ${phase === 'hold' ? 'filling' : ''}`} />
                </div>
                <p className="splash-progress-label">Establishing secure connection…</p>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════════ */
export default function FashionFlowHomepage() {
    const navigate = useNavigate?.() || (() => { });
    const [showHome, setShowHome] = useState(false);

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            {!showHome && <SplashScreen onDone={() => setShowHome(true)} />}
            {showHome && (
                <div style={{ animation: 'fadeInHome 0.8s ease both' }}>
                    <style>{`@keyframes fadeInHome { from { opacity: 0; } to { opacity: 1; } }`}</style>
                    <Nav navigate={navigate} />
                    <Hero navigate={navigate} />
                    <StatsStrip />
                    <FeaturesSection />
                    <CTASection navigate={navigate} />
                    <Footer />
                </div>
            )}
        </>
    );
}