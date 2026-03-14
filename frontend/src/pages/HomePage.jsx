import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Package, BarChart3, Users, Zap, Shield,
    TrendingUp, CheckCircle2, ArrowRight, Star, Boxes,
    ChevronDown, ChevronRight, Mail, Phone, Globe, ExternalLink,
    BarChart2, Lock, Cpu, Layers,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   GLOBAL STYLES — Light Ivory / Gold Luxury
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

/* Subtle grid pattern */
.grid-bg {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: gridDrift 40s linear infinite;
}
@keyframes gridDrift { to { background-position: 56px 56px; } }

/* Orbs */
.orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }

/* Section label pill */
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
`;

/* ══════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════ */
function Nav({ navigate }) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            transition: 'all 0.3s',
            background: scrolled ? 'rgba(250,248,243,0.95)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(184,134,11,0.15)' : '1px solid transparent',
            boxShadow: scrolled ? '0 2px 20px rgba(100,80,30,0.08)' : 'none',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
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

                {/* Desktop links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
                    {[['Tính năng', 'features'], ['Bảng giá', 'pricing'], ['Đánh giá', 'testimonials'], ['Liên hệ', 'contact']].map(([l, id]) => (
                        <a key={l} href={`#${id}`} style={{
                            color: '#7a6e5f', fontSize: 14, fontWeight: 500, textDecoration: 'none',
                            transition: 'color 0.2s', fontFamily: 'DM Sans, sans-serif',
                        }}
                            onMouseEnter={e => e.target.style.color = '#b8860b'}
                            onMouseLeave={e => e.target.style.color = '#7a6e5f'}
                        >{l}</a>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'transparent', border: '1.5px solid rgba(184,134,11,0.4)',
                        color: '#b8860b', padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(184,134,11,0.08)'; e.currentTarget.style.borderColor = '#b8860b'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(184,134,11,0.4)'; }}
                    >Đăng nhập</button>
                    <button style={{
                        background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                        border: 'none', padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 16px rgba(184,134,11,0.35)',
                        fontFamily: 'DM Sans, sans-serif',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(184,134,11,0.45)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,134,11,0.35)'; }}
                    >Dùng thử miễn phí</button>
                </div>
            </div>
        </nav>
    );
}

/* ══════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════ */
function Hero({ navigate }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    return (
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 100, background: 'linear-gradient(160deg, #faf8f3 0%, #f5f0e4 50%, #eee6d0 100%)' }}>
            <div className="grid-bg" />
            {/* Orbs */}
            <div className="orb" style={{ width: 600, height: 600, background: 'rgba(184,134,11,0.08)', top: -200, right: -150 }} />
            <div className="orb" style={{ width: 400, height: 400, background: 'rgba(201,150,12,0.06)', bottom: -100, left: -80 }} />
            {/* Corner deco */}
            <div style={{ position: 'absolute', top: 110, left: 40, width: 110, height: 110, borderTop: '1.5px solid rgba(184,134,11,0.25)', borderLeft: '1.5px solid rgba(184,134,11,0.25)' }} />
            <div style={{ position: 'absolute', bottom: 40, right: 40, width: 110, height: 110, borderBottom: '1.5px solid rgba(184,134,11,0.25)', borderRight: '1.5px solid rgba(184,134,11,0.25)' }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 1, width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                    {/* Left */}
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
                        <div className="section-label">
                            <TrendingUp size={11} />
                            #1 Warehouse Management tại Việt Nam
                        </div>
                        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 58, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.5, marginBottom: 24, color: '#1a1612' }}>
                            Quản lý kho<br />
                            <span style={{ color: '#b8860b' }}>thời trang</span><br />
                            <span style={{ color: '#7a6e5f', fontWeight: 700 }}>thông minh hơn</span>
                        </h1>
                        <p style={{ fontSize: 16, color: '#7a6e5f', lineHeight: 1.8, marginBottom: 40, maxWidth: 460, fontFamily: 'DM Sans, sans-serif' }}>
                            FS WMS giúp bạn kiểm soát toàn bộ chuỗi cung ứng — từ nhập kho, quản lý tồn kho đến xuất hàng — với công nghệ AI và dashboard real-time. Tăng 300% năng suất chỉ trong 30 ngày.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
                            <button onClick={() => navigate('/login')} style={{
                                background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                                border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                boxShadow: '0 6px 28px rgba(184,134,11,0.4)', fontFamily: 'DM Sans, sans-serif',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(184,134,11,0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(184,134,11,0.4)'; }}
                            >
                                Bắt đầu miễn phí 14 ngày <ArrowRight size={16} />
                            </button>
                            <button style={{
                                background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(184,134,11,0.25)',
                                color: '#3d3529', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                backdropFilter: 'blur(8px)', fontFamily: 'DM Sans, sans-serif',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8860b'; e.currentTarget.style.color = '#b8860b'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(184,134,11,0.25)'; e.currentTarget.style.color = '#3d3529'; }}
                            >Xem demo <ExternalLink size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#a89f92', fontFamily: 'DM Sans, sans-serif' }}>
                            {['Không cần thẻ tín dụng', 'Hủy bất cứ lúc nào', 'Hỗ trợ 24/7'].map(t => (
                                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CheckCircle2 size={13} style={{ color: '#22c55e' }} />{t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right — Dashboard mockup */}
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px) scale(0.97)', transition: 'all 0.8s ease 0.2s', position: 'relative' }}>
                        <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse, rgba(184,134,11,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                        <div style={{
                            background: '#fff',
                            border: '1px solid rgba(184,134,11,0.2)', borderRadius: 24,
                            padding: 26, boxShadow: '0 32px 80px rgba(100,80,30,0.18), 0 0 0 1px rgba(184,134,11,0.06)',
                            position: 'relative',
                        }}>
                            {/* Gold top line */}
                            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: 'linear-gradient(90deg, transparent, #b8860b, transparent)', borderRadius: 99 }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#b8860b', letterSpacing: '0.15em', textTransform: 'uppercase' }}>FS WMS Dashboard</p>
                                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 700, marginTop: 2, color: '#1a1612' }}>Tổng quan hôm nay</p>
                                </div>
                                <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontFamily: 'DM Mono, monospace' }}>● LIVE</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                                {[
                                    { l: 'Doanh thu', v: '₫245.8M', c: '#b8860b', up: '+12.4%' },
                                    { l: 'Đơn hàng', v: '1,234', c: '#2563eb', up: '+8.1%' },
                                    { l: 'Tồn kho', v: '5,678', c: '#7c3aed', up: '-2.3%' },
                                ].map(({ l, v, c, up }) => (
                                    <div key={l} style={{ background: '#faf8f3', border: '1px solid rgba(184,134,11,0.12)', borderRadius: 14, padding: '14px 16px' }}>
                                        <p style={{ fontSize: 11, color: '#a89f92', marginBottom: 6, fontFamily: 'DM Mono, monospace' }}>{l}</p>
                                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: c }}>{v}</p>
                                        <p style={{ fontSize: 11, color: up.startsWith('+') ? '#16a34a' : '#dc2626', marginTop: 4, fontFamily: 'DM Mono, monospace' }}>{up}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Mini bar chart */}
                            <div style={{ background: '#faf8f3', border: '1px solid rgba(184,134,11,0.1)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                                <p style={{ fontSize: 11, color: '#a89f92', marginBottom: 12, fontFamily: 'DM Mono, monospace' }}>Nhập xuất 7 ngày qua</p>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <div style={{ height: h * 0.6, background: `rgba(184,134,11,${0.25 + i * 0.1})`, borderRadius: '4px 4px 0 0' }} />
                                            <p style={{ fontSize: 9, color: '#a89f92', textAlign: 'center', fontFamily: 'DM Mono' }}>T{i + 2}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {[
                                { code: 'PO-2024-142', status: 'Đã nhập', color: '#16a34a', bg: 'rgba(34,197,94,0.08)' },
                                { code: 'PO-2024-143', status: 'Chờ báo giá', color: '#b8860b', bg: 'rgba(184,134,11,0.08)' },
                                { code: 'PO-2024-144', status: 'Đang xử lý', color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
                            ].map(({ code, status, color, bg }) => (
                                <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(184,134,11,0.08)' }}>
                                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#7a6e5f' }}>{code}</span>
                                    <span style={{ fontSize: 11, color, background: bg, padding: '3px 10px', borderRadius: 99, border: `1px solid ${color}30`, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{status}</span>
                                </div>
                            ))}
                        </div>

                        {/* Floating badges */}
                        <div style={{ position: 'absolute', top: -14, right: -20, background: 'linear-gradient(135deg, #b8860b, #e8b923)', borderRadius: 99, padding: '7px 14px', fontSize: 11, fontWeight: 700, color: '#fff', boxShadow: '0 6px 20px rgba(184,134,11,0.45)', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
                            ✦ AI-Powered
                        </div>
                        <div style={{ position: 'absolute', bottom: -14, left: -20, background: '#fff', border: '1px solid rgba(184,134,11,0.25)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(100,80,30,0.12)' }}>
                            <Shield size={14} style={{ color: '#22c55e' }} />
                            <span style={{ fontSize: 12, color: '#3d3529', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll cue */}
            <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4, animation: 'bounce 2s infinite' }}>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: '#a89f92', textTransform: 'uppercase' }}>Scroll</p>
                <ChevronDown size={16} style={{ color: '#b8860b' }} />
            </div>
            <style>{`@keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }`}</style>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   STATS STRIP
══════════════════════════════════════════════════ */
function StatsStrip() {
    return (
        <section style={{ background: '#fff', borderTop: '1px solid rgba(184,134,11,0.15)', borderBottom: '1px solid rgba(184,134,11,0.15)', padding: '44px 32px', boxShadow: '0 2px 20px rgba(100,80,30,0.06)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
                {[
                    { v: '10,000+', l: 'Khách hàng tin dùng' },
                    { v: '99.9%', l: 'Uptime đảm bảo' },
                    { v: '5M+', l: 'Đơn hàng xử lý' },
                    { v: '24/7', l: 'Hỗ trợ khách hàng' },
                ].map(({ v, l }, i) => (
                    <div key={l} style={{ textAlign: 'center', padding: '0 32px', borderRight: i < 3 ? '1px solid rgba(184,134,11,0.12)' : 'none' }}>
                        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 42, fontWeight: 800, color: '#b8860b', letterSpacing: -1 }}>{v}</p>
                        <p style={{ fontSize: 13, color: '#a89f92', marginTop: 4, fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' }}>{l}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════ */
function FeaturesSection() {
    const features = [
        { icon: Package, title: 'Quản lý kho thông minh', desc: 'Theo dõi tồn kho real-time, cảnh báo hết hàng tự động và quản lý nhập xuất hiệu quả với AI dự báo.' },
        { icon: BarChart2, title: 'Báo cáo & Phân tích', desc: 'Dashboard trực quan với biểu đồ chi tiết, export PDF/Excel giúp đưa ra quyết định kinh doanh chính xác.' },
        { icon: Users, title: 'Quản lý nhân viên', desc: 'Phân quyền linh hoạt theo từng module, theo dõi hiệu suất và quản lý ca làm việc dễ dàng.' },
        { icon: Zap, title: 'Xử lý nhanh chóng', desc: 'Giao diện tối ưu giúp xử lý đơn hàng và báo giá từ nhà cung cấp nhanh gấp 3 lần truyền thống.' },
        { icon: Lock, title: 'Bảo mật tuyệt đối', desc: 'Mã hóa 256-bit, sao lưu tự động hàng giờ và tuân thủ các tiêu chuẩn bảo mật ISO 27001.' },
        { icon: Cpu, title: 'AI & Tự động hóa', desc: 'Machine learning dự báo nhu cầu, tự động tạo đơn mua và tối ưu hóa mức tồn kho tối thiểu.' },
    ];

    return (
        <section id="features" style={{ padding: '100px 32px', background: 'linear-gradient(180deg, #faf8f3 0%, #f0ead8 100%)', position: 'relative', overflow: 'hidden' }}>
            <div className="orb" style={{ width: 500, height: 500, background: 'rgba(184,134,11,0.06)', top: '20%', left: -200 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><Layers size={11} />Tính năng</div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 46, fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 16, color: '#1a1612' }}>
                        Mọi thứ bạn cần để<br />
                        <span style={{ color: '#b8860b' }}>quản lý kho hiệu quả</span>
                    </h2>
                    <p style={{ color: '#7a6e5f', fontSize: 16, maxWidth: 520, margin: '0 auto', fontFamily: 'DM Sans, sans-serif' }}>
                        FS WMS cung cấp đầy đủ công cụ giúp bạn kiểm soát mọi khía cạnh của chuỗi cung ứng thời trang
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
   PRICING
══════════════════════════════════════════════════ */
function PricingSection() {
    const plans = [
        {
            name: 'Starter', price: '299,000', desc: 'Phù hợp cho cửa hàng nhỏ',
            features: ['Tối đa 1,000 sản phẩm', 'Báo cáo cơ bản', '2 người dùng', 'Hỗ trợ email', 'Lưu trữ 5GB'],
            popular: false,
        },
        {
            name: 'Professional', price: '599,000', desc: 'Dành cho doanh nghiệp vừa',
            features: ['Sản phẩm không giới hạn', 'Báo cáo AI nâng cao', '10 người dùng', 'Hỗ trợ ưu tiên 24/7', 'Lưu trữ 50GB', 'Tích hợp API đầy đủ'],
            popular: true,
        },
        {
            name: 'Enterprise', price: 'Liên hệ', desc: 'Giải pháp doanh nghiệp lớn',
            features: ['Tất cả tính năng Pro', 'Tùy chỉnh theo yêu cầu', 'Người dùng không giới hạn', 'Dedicated support', 'Lưu trữ unlimited', 'On-premise deployment'],
            popular: false,
        },
    ];

    return (
        <section id="pricing" style={{ padding: '100px 32px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div className="grid-bg" style={{ opacity: 0.4 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><BarChart3 size={11} />Bảng giá</div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 46, fontWeight: 900, letterSpacing: -1, marginBottom: 16, color: '#1a1612' }}>
                        Chọn gói phù hợp với bạn
                    </h2>
                    <p style={{ color: '#7a6e5f', fontSize: 16, fontFamily: 'DM Sans, sans-serif' }}>Linh hoạt, minh bạch và không ràng buộc dài hạn</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'center' }}>
                    {plans.map(({ name, price, desc, features, popular }) => (
                        <div key={name}
                            style={{
                                background: popular ? 'linear-gradient(160deg, #2d2106, #3d2e08)' : '#fff',
                                border: popular ? '1px solid rgba(184,134,11,0.5)' : '1px solid rgba(184,134,11,0.15)',
                                borderRadius: 24, padding: popular ? '40px 28px' : '32px 28px',
                                transform: popular ? 'scale(1.04)' : 'none',
                                boxShadow: popular ? '0 20px 60px rgba(100,80,30,0.25)' : '0 2px 12px rgba(100,80,30,0.06)',
                                position: 'relative',
                            }}>
                            {popular && (
                                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff', padding: '5px 18px', borderRadius: 99, fontSize: 11, fontWeight: 800, fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                                    ✦ PHỔ BIẾN NHẤT
                                </div>
                            )}
                            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: popular ? 'rgba(232,185,35,0.8)' : '#a89f92', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>{name}</p>
                            <div style={{ marginBottom: 6 }}>
                                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: price === 'Liên hệ' ? 28 : 38, fontWeight: 800, color: popular ? '#e8b923' : '#1a1612' }}>
                                    {price === 'Liên hệ' ? price : `₫${price}`}
                                </span>
                                {price !== 'Liên hệ' && <span style={{ color: popular ? 'rgba(232,185,35,0.5)' : '#a89f92', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>/tháng</span>}
                            </div>
                            <p style={{ color: popular ? 'rgba(255,255,255,0.45)' : '#a89f92', fontSize: 13, marginBottom: 28, fontFamily: 'DM Sans, sans-serif' }}>{desc}</p>
                            <div style={{ height: '1px', background: popular ? 'rgba(232,185,35,0.2)' : 'rgba(184,134,11,0.1)', marginBottom: 28 }} />
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                                {features.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: popular ? 'rgba(255,255,255,0.65)' : '#7a6e5f', fontFamily: 'DM Sans, sans-serif' }}>
                                        <CheckCircle2 size={15} style={{ color: popular ? '#e8b923' : '#22c55e', flexShrink: 0, marginTop: 1 }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button style={{
                                width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                                background: popular ? 'linear-gradient(135deg, #b8860b, #e8b923)' : 'rgba(184,134,11,0.08)',
                                color: popular ? '#fff' : '#b8860b',
                                fontFamily: 'DM Sans, sans-serif',
                                boxShadow: popular ? '0 6px 20px rgba(184,134,11,0.4)' : 'none',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                            >{price === 'Liên hệ' ? 'Liên hệ tư vấn' : 'Bắt đầu ngay'}</button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════ */
function TestimonialsSection() {
    const items = [
        { name: 'Nguyễn Thị Mai', role: 'CEO · Mai Fashion Store', content: 'FS WMS đã giúp cửa hàng của tôi tăng 40% hiệu suất quản lý kho. Dashboard real-time giúp tôi luôn nắm bắt được tình hình tồn kho tức thì.', r: 5 },
        { name: 'Trần Văn Hùng', role: 'Quản lý · Hùng Clothing', content: 'Tôi đã thử nhiều phần mềm nhưng FS WMS là tốt nhất. Module báo giá nhà cung cấp cực kỳ tiện lợi, tiết kiệm rất nhiều thời gian.', r: 5 },
        { name: 'Lê Thị Hoa', role: 'Chủ cửa hàng · Hoa Boutique', content: 'Hệ thống cảnh báo hết hàng giúp tôi không bao giờ bỏ lỡ đơn hàng. Nhóm support phản hồi rất nhanh và chuyên nghiệp.', r: 5 },
    ];

    return (
        <section id="testimonials" style={{ padding: '100px 32px', background: 'linear-gradient(180deg, #f5f0e4 0%, #faf8f3 100%)', position: 'relative' }}>
            <div className="orb" style={{ width: 400, height: 400, background: 'rgba(184,134,11,0.06)', bottom: 0, right: -100 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><Star size={11} />Đánh giá</div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 46, fontWeight: 900, letterSpacing: -1, marginBottom: 16, color: '#1a1612' }}>
                        Khách hàng nói gì về <span style={{ color: '#b8860b' }}>chúng tôi</span>
                    </h2>
                    <p style={{ color: '#7a6e5f', fontSize: 16, fontFamily: 'DM Sans, sans-serif' }}>Hơn 10,000 doanh nghiệp đã tin tưởng FS WMS</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {items.map(({ name, role, content, r }) => (
                        <div key={name} style={{
                            background: '#fff', border: '1px solid rgba(184,134,11,0.12)',
                            borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
                            boxShadow: '0 2px 12px rgba(100,80,30,0.06)',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(100,80,30,0.14)'; e.currentTarget.style.borderColor = 'rgba(184,134,11,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(100,80,30,0.06)'; e.currentTarget.style.borderColor = 'rgba(184,134,11,0.12)'; }}
                        >
                            <div style={{ display: 'flex', gap: 3 }}>
                                {Array.from({ length: r }).map((_, i) => <Star key={i} size={14} style={{ fill: '#b8860b', color: '#b8860b' }} />)}
                            </div>
                            <p style={{ fontSize: 15, color: '#7a6e5f', lineHeight: 1.8, fontStyle: 'italic', flex: 1, fontFamily: 'DM Sans, sans-serif' }}>"{content}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(184,134,11,0.1)' }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #b8860b, #e8b923)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 800, color: '#fff',
                                }}>{name[0]}</div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 14, color: '#1a1612', fontFamily: 'DM Sans, sans-serif' }}>{name}</p>
                                    <p style={{ fontSize: 12, color: '#a89f92', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════ */
function CTASection({ navigate }) {
    return (
        <section style={{ padding: '90px 32px', background: 'linear-gradient(135deg, #2d2106 0%, #1a1200 100%)', position: 'relative', overflow: 'hidden' }}>
            <div className="grid-bg" style={{ opacity: 0.15 }} />
            <div className="orb" style={{ width: 600, height: 400, background: 'rgba(184,134,11,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(184,134,11,0.4)', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(184,134,11,0.1)' }}>
                    <Boxes size={32} style={{ color: '#e8b923' }} strokeWidth={1.5} />
                </div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 900, letterSpacing: -1.5, marginBottom: 20, lineHeight: 1.1, color: '#fff' }}>
                    Sẵn sàng bắt đầu với <span style={{ color: '#e8b923' }}>FS WMS</span>?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, marginBottom: 44, maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>
                    Tham gia cùng hàng ngàn doanh nghiệp đang dùng FS WMS để tối ưu hóa quản lý chuỗi cung ứng thời trang.
                </p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 24 }}>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'linear-gradient(135deg, #b8860b, #e8b923)', color: '#fff',
                        border: 'none', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                        boxShadow: '0 6px 28px rgba(184,134,11,0.5)', fontFamily: 'DM Sans, sans-serif',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(184,134,11,0.6)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(184,134,11,0.5)'; }}
                    >
                        Dùng thử miễn phí 14 ngày <ArrowRight size={16} />
                    </button>
                    <button style={{
                        background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.7)', padding: '14px 32px', borderRadius: 12, fontSize: 15,
                        fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,185,35,0.5)'; e.currentTarget.style.color = '#e8b923'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    >Đặt lịch demo</button>
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
                    KHÔNG CẦN THẺ TÍN DỤNG · HỦY BẤT CỨ LÚC NÀO · HỖ TRỢ 24/7
                </p>
            </div>
        </section>
    );
}

/* ══════════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════════ */
function Footer() {
    return (
        <footer style={{ background: '#faf8f3', borderTop: '1px solid rgba(184,134,11,0.15)', padding: '64px 32px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 52 }}>
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
                            Giải pháp quản lý kho thời trang hàng đầu Việt Nam. Tối ưu hóa chuỗi cung ứng với công nghệ AI tiên tiến.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            {[Globe, Mail, Phone].map((Icon, i) => (
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
                        { title: 'Sản phẩm', links: ['Tính năng', 'Bảng giá', 'API', 'Tích hợp'] },
                        { title: 'Công ty', links: ['Về chúng tôi', 'Blog', 'Tuyển dụng', 'Liên hệ'] },
                        { title: 'Hỗ trợ', links: ['Trung tâm trợ giúp', 'Hướng dẫn', 'Điều khoản', 'Bảo mật'] },
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

                <div style={{ borderTop: '1px solid rgba(184,134,11,0.1)', paddingTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#c9b99a', letterSpacing: '0.08em' }}>© 2026 FS FASHION GROUP · ALL RIGHTS RESERVED</p>
                    <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: '#c9b99a', letterSpacing: '0.1em' }}>v2.0.0 · BUILD 2026</div>
                </div>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════
   SPLASH SCREEN — Light Ivory Gold
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

/* Logo ring */
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

/* Brand block */
.splash-brand-block { opacity: 0; transform: translateY(18px); transition: all 0.7s 0.6s; }
.splash-brand-block.visible { opacity: 1; transform: translateY(0); }
.splash-brand-tag { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(184,134,11,0.7); margin-bottom: 8px; }
.splash-brand-title {
  font-family: 'Playfair Display', serif;
  font-size: 52px; font-weight: 900; line-height: 1; color: #1a1612;
  display: flex; align-items: center; gap: 16px; letter-spacing: -1px;
}
.splash-brand-fs { color: #b8860b; }
.splash-brand-divider { width: 1px; height: 42px; background: rgba(184,134,11,0.25); }
.splash-brand-wms { color: #3d3529; font-size: 38px; font-family: 'DM Mono', monospace; font-weight: 500; }

/* Welcome block */
.splash-welcome-block { opacity: 0; transform: translateY(16px); transition: all 0.7s 1s; }
.splash-welcome-block.visible { opacity: 1; transform: translateY(0); }
.splash-welcome-line { font-size: 13px; color: #a89f92; font-weight: 300; font-family: 'DM Sans', sans-serif; }
.splash-welcome-main { font-size: 22px; font-weight: 600; color: #1a1612; margin: 5px 0; font-family: 'Playfair Display', serif; }
.splash-welcome-sub { font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(184,134,11,0.7); letter-spacing: 0.1em; }

/* Stats bar */
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

/* Progress */
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
                {/* Logo ring */}
                <div className={`splash-logo-ring ${phase === 'hold' ? 'pulse' : ''}`}>
                    <div className="splash-logo-inner">
                        <Boxes size={36} strokeWidth={1.8} className="splash-logo-icon" />
                    </div>
                    <svg className="splash-logo-svg" viewBox="0 0 120 120">
                        <circle className="splash-logo-track" cx="60" cy="60" r="54" />
                        <circle className={`splash-logo-arc ${phase === 'hold' ? 'drawn' : ''}`} cx="60" cy="60" r="54" />
                    </svg>
                </div>

                {/* Brand */}
                <div className={`splash-brand-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <div className="splash-brand-tag">WAREHOUSE MANAGEMENT SYSTEM</div>
                    <h1 className="splash-brand-title">
                        <span className="splash-brand-fs">FS</span>
                        <span className="splash-brand-divider" />
                        <span className="splash-brand-wms">WMS</span>
                    </h1>
                </div>

                {/* Welcome */}
                <div className={`splash-welcome-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <p className="splash-welcome-line">Welcome to the future of Fashion</p>
                    <p className="splash-welcome-main">FS Warehouse Management System</p>
                    <p className="splash-welcome-sub">Premium Logistics Enterprise · v2.0</p>
                </div>

                {/* Stats */}
                <div className={`splash-stats-bar ${phase === 'hold' ? 'visible' : ''}`}>
                    {[{ n: '10K+', l: 'Customers' }, { n: '99.9%', l: 'Uptime' }, { n: '5M+', l: 'Orders' }, { n: '24/7', l: 'Support' }].map(({ n, l }) => (
                        <div key={l} className="splash-stat-item">
                            <span className="splash-stat-num">{n}</span>
                            <span className="splash-stat-label">{l}</span>
                        </div>
                    ))}
                </div>

                {/* Progress */}
                <div className="splash-progress-track">
                    <div className={`splash-progress-fill ${phase === 'hold' ? 'filling' : ''}`} />
                </div>
                <p className="splash-progress-label">Initializing system modules…</p>
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
                    <PricingSection />
                    <TestimonialsSection />
                    <CTASection navigate={navigate} />
                    <Footer />
                </div>
            )}
        </>
    );
}