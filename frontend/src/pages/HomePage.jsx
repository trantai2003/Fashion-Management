import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, X, ShoppingBag, Package, BarChart3, Users, Zap, Shield,
    Smartphone, TrendingUp, CheckCircle2, ArrowRight, Star, Boxes,
    ChevronDown, ChevronRight, Mail, Phone, Globe, ExternalLink,
    BarChart2, Lock, Cpu, Layers,
} from 'lucide-react';

/* ══════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════ */
const GLOBAL_CSS = `

:root {
  --gold: #d4af37;
  --gold-light: #f0d060;
  --gold-dim: rgba(212,175,55,0.15);
  --dark: #0a0b0f;
  --dark-2: #111218;
  --dark-3: #16171f;
  --dark-border: rgba(255,255,255,0.07);
  --text: rgba(255,255,255,0.85);
  --text-dim: rgba(255,255,255,0.4);
  --text-muted: rgba(255,255,255,0.2);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--dark); color: var(--text); font-family: Inter, system-ui, -apple-system, sans-serif; overflow-x: hidden; }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--dark); }
::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 99px; }

/* Animated grid bg */
.grid-bg {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 64px 64px;
  animation: gridDrift 30s linear infinite;
  opacity: 0.5;
}
@keyframes gridDrift { to { background-position: 64px 64px; } }

/* Glow orbs */
.orb { position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; }

/* Fade-in animations */
.fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.fade-up.visible { opacity: 1; transform: translateY(0); }

/* Gold line accent */
.gold-line {
  display: inline-block; height: 2px; background: linear-gradient(90deg, var(--gold), transparent);
  border-radius: 99px;
}

/* Section label */
.section-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; letter-spacing: 0.2em;
  color: var(--gold); text-transform: uppercase;
  padding: 6px 14px; border: 1px solid rgba(212,175,55,0.3); border-radius: 99px;
  background: rgba(212,175,55,0.06); margin-bottom: 16px;
}
`;

/* ══════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════ */
function Nav({ navigate }) {
    const [open, setOpen] = useState(false);
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
            background: scrolled ? 'rgba(10,11,15,0.95)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(212,175,55,0.12)' : '1px solid transparent',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #1c1d2e, #252640)',
                        border: '1px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(212,175,55,0.15)',
                    }}>
                        <Boxes size={18} style={{ color: '#d4af37' }} strokeWidth={1.5} />
                    </div>
                    <span style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                        <span style={{ color: '#d4af37' }}>FS</span>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14, marginLeft: 6, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.08em' }}>WMS</span>
                    </span>
                </div>

                {/* Desktop links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 36 }} className="nav-desktop">
                    {['Tính năng', 'Bảng giá', 'Đánh giá', 'Liên hệ'].map(l => (
                        <a key={l} href={`#${l === 'Tính năng' ? 'features' : l === 'Bảng giá' ? 'pricing' : l === 'Đánh giá' ? 'testimonials' : 'contact'}`}
                            style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.target.style.color = '#d4af37'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                        >{l}</a>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'transparent', border: '1px solid rgba(212,175,55,0.4)',
                        color: '#d4af37', padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >Đăng nhập</button>
                    <button style={{
                        background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0b0f',
                        border: 'none', padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(212,175,55,0.3)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.3)'; }}
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
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 100 }}>
            <div className="grid-bg" />
            {/* Orbs */}
            <div className="orb" style={{ width: 600, height: 600, background: 'rgba(212,175,55,0.07)', top: -200, right: -200 }} />
            <div className="orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.08)', bottom: -100, left: -100 }} />

            {/* Corner decorations */}
            <div style={{ position: 'absolute', top: 100, left: 40, width: 120, height: 120, borderTop: '1px solid rgba(212,175,55,0.2)', borderLeft: '1px solid rgba(212,175,55,0.2)' }} />
            <div style={{ position: 'absolute', bottom: 40, right: 40, width: 120, height: 120, borderBottom: '1px solid rgba(212,175,55,0.2)', borderRight: '1px solid rgba(212,175,55,0.2)' }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px', position: 'relative', zIndex: 1, width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
                    {/* Left */}
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px)', transition: 'all 0.8s ease' }}>
                        <div className="section-label">
                            <TrendingUp size={11} />
                            #1 Warehouse Management tại Việt Nam
                        </div>
                        <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 58, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24 }}>
                            Quản lý kho<br />
                            <span style={{ color: '#d4af37' }}>thời trang</span><br />
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>thông minh hơn</span>
                        </h1>
                        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: 40, maxWidth: 460 }}>
                            FS WMS giúp bạn kiểm soát toàn bộ chuỗi cung ứng — từ nhập kho, quản lý tồn kho đến xuất hàng — với công nghệ AI và dashboard real-time. Tăng 300% năng suất chỉ trong 30 ngày.
                        </p>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 36 }}>
                            <button onClick={() => navigate('/login')} style={{
                                background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0b0f',
                                border: 'none', padding: '14px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                                boxShadow: '0 0 32px rgba(212,175,55,0.35)',
                            }}>
                                Bắt đầu miễn phí 14 ngày <ArrowRight size={16} />
                            </button>
                            <button style={{
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.7)', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.color = '#d4af37'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                            >Xem demo <ExternalLink size={14} /></button>
                        </div>
                        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
                            {['Không cần thẻ tín dụng', 'Hủy bất cứ lúc nào', 'Hỗ trợ 24/7'].map(t => (
                                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CheckCircle2 size={13} style={{ color: '#4ade80' }} />{t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Right — Dashboard mockup */}
                    <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(30px) scale(0.97)', transition: 'all 0.8s ease 0.2s', position: 'relative' }}>
                        {/* Glow behind card */}
                        <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                        <div style={{
                            background: 'linear-gradient(135deg, #111218, #16171f)',
                            border: '1px solid rgba(212,175,55,0.2)', borderRadius: 24,
                            padding: 24, boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                            position: 'relative',
                        }}>
                            {/* Card header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'rgba(212,175,55,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>FS WMS Dashboard</p>
                                    <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 700, marginTop: 2 }}>Tổng quan hôm nay</p>
                                </div>
                                <span style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontFamily: 'DM Mono, monospace' }}>● LIVE</span>
                            </div>

                            {/* KPI row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                                {[
                                    { l: 'Doanh thu', v: '₫245.8M', c: '#d4af37', up: '+12.4%' },
                                    { l: 'Đơn hàng', v: '1,234', c: '#60a5fa', up: '+8.1%' },
                                    { l: 'Tồn kho', v: '5,678', c: '#a78bfa', up: '-2.3%' },
                                ].map(({ l, v, c, up }) => (
                                    <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{l}</p>
                                        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: c }}>{v}</p>
                                        <p style={{ fontSize: 11, color: up.startsWith('+') ? '#4ade80' : '#f87171', marginTop: 4 }}>{up}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Mini bar chart */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>Nhập xuất 7 ngày qua</p>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
                                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <div style={{ height: h * 0.6, background: `rgba(212,175,55,${0.3 + i * 0.1})`, borderRadius: '4px 4px 0 0', transition: 'all 0.3s' }} />
                                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', fontFamily: 'DM Mono' }}>T{i + 2}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent orders mini list */}
                            {[
                                { code: 'PO-2024-142', status: 'Đã nhập', color: '#4ade80' },
                                { code: 'PO-2024-143', status: 'Chờ báo giá', color: '#d4af37' },
                                { code: 'PO-2024-144', status: 'Đang xử lý', color: '#60a5fa' },
                            ].map(({ code, status, color }) => (
                                <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{code}</span>
                                    <span style={{ fontSize: 11, color, background: `${color}18`, padding: '2px 10px', borderRadius: 99, border: `1px solid ${color}40` }}>{status}</span>
                                </div>
                            ))}
                        </div>

                        {/* Floating badges */}
                        <div style={{ position: 'absolute', top: -16, right: -20, background: '#d4af37', borderRadius: 99, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#0a0b0f', boxShadow: '0 8px 24px rgba(212,175,55,0.4)', whiteSpace: 'nowrap' }}>
                            ✦ AI-Powered
                        </div>
                        <div style={{ position: 'absolute', bottom: -14, left: -20, background: '#111218', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={14} style={{ color: '#4ade80' }} />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>256-bit Encryption</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll cue */}
            <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.3, animation: 'bounce 2s infinite' }}>
                <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Scroll</p>
                <ChevronDown size={16} style={{ color: '#d4af37' }} />
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
        <section style={{ background: '#111218', borderTop: '1px solid rgba(212,175,55,0.12)', borderBottom: '1px solid rgba(212,175,55,0.12)', padding: '40px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
                {[
                    { v: '10,000+', l: 'Khách hàng tin dùng' },
                    { v: '99.9%', l: 'Uptime đảm bảo' },
                    { v: '5M+', l: 'Đơn hàng xử lý' },
                    { v: '24/7', l: 'Hỗ trợ khách hàng' },
                ].map(({ v, l }, i) => (
                    <div key={l} style={{ textAlign: 'center', padding: '0 32px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                        <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 40, fontWeight: 800, color: '#d4af37', letterSpacing: -1 }}>{v}</p>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>{l}</p>
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
        <section id="features" style={{ padding: '100px 32px', background: 'var(--dark)', position: 'relative', overflow: 'hidden' }}>
            <div className="orb" style={{ width: 500, height: 500, background: 'rgba(212,175,55,0.05)', top: '20%', left: -200 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><Layers size={11} />Tính năng</div>
                    <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 46, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
                        Mọi thứ bạn cần để<br />
                        <span style={{ color: '#d4af37' }}>quản lý kho hiệu quả</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
                        FS WMS cung cấp đầy đủ công cụ giúp bạn kiểm soát mọi khía cạnh của chuỗi cung ứng thời trang
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {features.map(({ icon: Icon, title, desc }, i) => (
                        <div key={title}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28,
                                transition: 'all 0.3s', cursor: 'default',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(212,175,55,0.3)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(255,255,255,0.02))'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'; e.currentTarget.style.transform = 'none'; }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 13,
                                background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
                                border: '1px solid rgba(212,175,55,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                            }}>
                                <Icon size={20} style={{ color: '#d4af37' }} strokeWidth={1.5} />
                            </div>
                            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</p>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{desc}</p>
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
        <section id="pricing" style={{ padding: '100px 32px', background: '#111218', position: 'relative', overflow: 'hidden' }}>
            <div className="grid-bg" style={{ opacity: 0.25 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><BarChart3 size={11} />Bảng giá</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>
                        Chọn gói phù hợp với bạn
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Linh hoạt, minh bạch và không ràng buộc dài hạn</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'center' }}>
                    {plans.map(({ name, price, desc, features, popular }) => (
                        <div key={name}
                            style={{
                                background: popular ? 'linear-gradient(135deg, #1a1810, #1c1a0e)' : 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                border: popular ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 24, padding: popular ? '40px 28px' : '32px 28px',
                                transform: popular ? 'scale(1.04)' : 'none',
                                boxShadow: popular ? '0 0 60px rgba(212,175,55,0.12)' : 'none',
                                position: 'relative',
                            }}>
                            {popular && (
                                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0b0f', padding: '5px 18px', borderRadius: 99, fontSize: 11, fontWeight: 800, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                                    ✦ PHỔ BIẾN NHẤT
                                </div>
                            )}
                            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: popular ? '#d4af37' : 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>{name}</p>
                            <div style={{ marginBottom: 6 }}>
                                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: price === 'Liên hệ' ? 28 : 38, fontWeight: 800, color: popular ? '#d4af37' : 'rgba(255,255,255,0.85)' }}>
                                    {price === 'Liên hệ' ? price : `₫${price}`}
                                </span>
                                {price !== 'Liên hệ' && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>/tháng</span>}
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 28 }}>{desc}</p>
                            <div style={{ height: '1px', background: popular ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.06)', marginBottom: 28 }} />
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                                {features.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                                        <CheckCircle2 size={15} style={{ color: popular ? '#d4af37' : '#4ade80', flexShrink: 0, marginTop: 1 }} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button style={{
                                width: '100%', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                                background: popular ? 'linear-gradient(135deg, #d4af37, #f0d060)' : 'rgba(255,255,255,0.07)',
                                color: popular ? '#0a0b0f' : 'rgba(255,255,255,0.7)',
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
        <section id="testimonials" style={{ padding: '100px 32px', background: 'var(--dark)', position: 'relative' }}>
            <div className="orb" style={{ width: 400, height: 400, background: 'rgba(212,175,55,0.05)', bottom: 0, right: -100 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 72 }}>
                    <div className="section-label"><Star size={11} />Đánh giá</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 46, fontWeight: 800, letterSpacing: -1.5, marginBottom: 16 }}>
                        Khách hàng nói gì về <span style={{ color: '#d4af37' }}>chúng tôi</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>Hơn 10,000 doanh nghiệp đã tin tưởng FS WMS</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {items.map(({ name, role, content, r }) => (
                        <div key={name} style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                            border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28,
                            display: 'flex', flexDirection: 'column', gap: 20,
                        }}>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {Array.from({ length: r }).map((_, i) => <Star key={i} size={14} style={{ fill: '#d4af37', color: '#d4af37' }} />)}
                            </div>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontStyle: 'italic', flex: 1 }}>"{content}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: '#0a0b0f',
                                }}>{name[0]}</div>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 14 }}>{name}</p>
                                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>{role}</p>
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
        <section style={{ padding: '80px 32px', background: '#111218', position: 'relative', overflow: 'hidden' }}>
            <div className="grid-bg" style={{ opacity: 0.2 }} />
            <div className="orb" style={{ width: 600, height: 400, background: 'rgba(212,175,55,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
                {/* Gold ring decoration */}
                <div style={{ width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.3)', margin: '0 auto 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Boxes size={32} style={{ color: '#d4af37' }} strokeWidth={1.5} />
                </div>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, letterSpacing: -1.5, marginBottom: 20, lineHeight: 1.1 }}>
                    Sẵn sàng bắt đầu với <span style={{ color: '#d4af37' }}>FS WMS</span>?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 17, marginBottom: 44, maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.7 }}>
                    Tham gia cùng hàng ngàn doanh nghiệp đang dùng FS WMS để tối ưu hóa quản lý chuỗi cung ứng thời trang.
                </p>
                <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 24 }}>
                    <button onClick={() => navigate('/login')} style={{
                        background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0b0f',
                        border: 'none', padding: '14px 36px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                        boxShadow: '0 0 32px rgba(212,175,55,0.3)',
                    }}>
                        Dùng thử miễn phí 14 ngày <ArrowRight size={16} />
                    </button>
                    <button style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.6)', padding: '14px 32px', borderRadius: 12, fontSize: 15,
                        fontWeight: 500, cursor: 'pointer',
                    }}>Đặt lịch demo</button>
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
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
        <footer style={{ background: '#07080c', borderTop: '1px solid rgba(212,175,55,0.1)', padding: '64px 32px 32px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
                    {/* Brand */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #1c1d2e, #252640)', border: '1px solid rgba(212,175,55,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Boxes size={16} style={{ color: '#d4af37' }} strokeWidth={1.5} />
                            </div>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800 }}>
                                <span style={{ color: '#d4af37' }}>FS</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13, marginLeft: 6, fontFamily: 'DM Mono, monospace' }}>WMS</span>
                            </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, maxWidth: 280 }}>
                            Giải pháp quản lý kho thời trang hàng đầu Việt Nam. Tối ưu hóa chuỗi cung ứng với công nghệ AI tiên tiến.
                        </p>
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            {[Globe, Mail, Phone].map((Icon, i) => (
                                <div key={i} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Icon size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
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
                            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#d4af37', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>{title}</p>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {links.map(l => (
                                    <li key={l}><a href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#d4af37'}
                                        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
                                    >{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>© 2026 FS FASHION GROUP · ALL RIGHTS RESERVED</p>
                    <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em' }}>v2.0.0 · BUILD 2026</div>
                </div>
            </div>
        </footer>
    );
}

/* ══════════════════════════════════════════════════
   SPLASH SCREEN
══════════════════════════════════════════════════ */
function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter'); // enter → hold → exit

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
            <div className="corner-tl" />
            <div className="corner-br" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className={`scanline ${phase === 'hold' ? 'active' : ''}`} />

            <div className="splash-content">
                <div className={`logo-ring ${phase === 'hold' ? 'pulse' : ''}`}>
                    <div className="logo-inner">
                        <Boxes size={36} strokeWidth={1.5} className="logo-icon" />
                    </div>
                    <svg className="logo-svg" viewBox="0 0 120 120">
                        <circle className="logo-track" cx="60" cy="60" r="54" />
                        <circle className={`logo-arc ${phase === 'hold' ? 'drawn' : ''}`} cx="60" cy="60" r="54" />
                    </svg>
                </div>

                <div className={`brand-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <div className="brand-tag">WAREHOUSE MANAGEMENT SYSTEM</div>
                    <h1 className="brand-title">
                        <span className="brand-fs">FS</span>
                        <span className="brand-divider" />
                        <span className="brand-wms">WMS</span>
                    </h1>
                </div>

                <div className={`welcome-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <p className="welcome-line">Welcome to the future of Fashion</p>
                    <p className="welcome-main">FS Warehouse Management System</p>
                    <p className="welcome-sub">Premium Logistics Enterprise · v2.0</p>
                </div>

                <div className={`stats-bar ${phase === 'hold' ? 'visible' : ''}`}>
                    {[
                        { n: '10K+', l: 'Customers' },
                        { n: '99.9%', l: 'Uptime' },
                        { n: '5M+', l: 'Orders' },
                        { n: '24/7', l: 'Support' },
                    ].map(({ n, l }) => (
                        <div key={l} className="stat-item">
                            <span className="stat-num">{n}</span>
                            <span className="stat-label">{l}</span>
                        </div>
                    ))}
                </div>

                <div className="progress-track">
                    <div className={`progress-fill ${phase === 'hold' ? 'filling' : ''}`} />
                </div>
                <p className="progress-label">Synchronizing neural assets…</p>
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
                <div className="fade-in-home">
                    <style>{`
                        .fade-in-home { animation: fadeIn 1s ease both; }
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    `}</style>
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

const SPLASH_STYLES = `
.splash-root {
  position: fixed; inset: 0; z-index: 9999;
  background: #0a0b0f;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1);
  font-family: Inter, system-ui, sans-serif;
}
.splash-root.enter { opacity: 0; }
.splash-root.hold  { opacity: 1; }
.splash-root.exit  { opacity: 0; transform: scale(1.04); pointer-events: none; }

.splash-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridDriftSplash 20s linear infinite;
}
@keyframes gridDriftSplash { to { background-position: 60px 60px; } }

.corner-tl, .corner-br {
  position: absolute; width: 180px; height: 180px; border: 1px solid rgba(212,175,55,0.3);
}
.corner-tl { top: 32px; left: 32px; border-right: none; border-bottom: none; animation: cornerIn 1s 0.5s both; }
.corner-br { bottom: 32px; right: 32px; border-left: none; border-top: none; animation: cornerIn 1s 0.7s both; }
@keyframes cornerIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

.orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; opacity: 0; animation: orbPulse 4s ease-in-out infinite alternate; }
.orb-1 { width: 400px; height: 400px; background: rgba(99,102,241,0.15); top: -100px; right: -100px; }
.orb-2 { width: 300px; height: 300px; background: rgba(212,175,55,0.10); bottom: -80px; left: -80px; animation-delay: 1.5s; }
.orb-3 { width: 250px; height: 250px; background: rgba(16,185,129,0.08); top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 0.8s; }
@keyframes orbPulse { from { opacity: 0.4; } to { opacity: 0.9; } }

.scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent);
  top: -2px; opacity: 0;
}
.scanline.active { animation: scan 3s 0.5s ease-in-out forwards; }
@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

.splash-content { display: flex; flex-direction: column; align-items: center; gap: 28px; position: relative; z-index: 2; text-align: center; }

.logo-ring { position: relative; width: 110px; height: 110px; display: flex; align-items: center; justify-content: center; animation: logoAppear 0.8s 0.2s both; }
@keyframes logoAppear { from { opacity: 0; transform: scale(0.6) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
.logo-inner {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, #1a1b2e 0%, #16213e 100%);
  border: 1px solid rgba(212,175,55,0.4);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 40px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
}
.logo-ring.pulse .logo-inner { box-shadow: 0 0 60px rgba(212,175,55,0.3); }
.logo-icon { color: #d4af37; }
.logo-svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.logo-track { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 2; }
.logo-arc {
  fill: none; stroke: #d4af37; stroke-width: 2; stroke-dasharray: 340; stroke-dashoffset: 340; stroke-linecap: round;
  transition: stroke-dashoffset 2s cubic-bezier(.4,0,.2,1) 0.4s;
}
.logo-arc.drawn { stroke-dashoffset: 0; }

.brand-block { opacity: 0; transform: translateY(20px); transition: all 0.7s 0.6s; }
.brand-block.visible { opacity: 1; transform: translateY(0); }
.brand-tag { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(212,175,55,0.7); margin-bottom: 8px; }
.brand-title { font-size: 48px; font-weight: 800; color: #fff; line-height: 1; display: flex; align-items: center; gap: 16px; letter-spacing: -1px; }
.brand-fs { color: #d4af37; }
.brand-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

.welcome-block { opacity: 0; transform: translateY(16px); transition: all 0.7s 1s; }
.welcome-block.visible { opacity: 1; transform: translateY(0); }
.welcome-line { font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 300; }
.welcome-main { font-size: 22px; font-weight: 600; color: rgba(255,255,255,0.9); margin: 4px 0; }
.welcome-sub { font-family: ui-monospace, monospace; font-size: 11px; color: rgba(212,175,55,0.6); letter-spacing: 0.1em; }

.stats-bar {
  display: flex; gap: 32px; opacity: 0; transform: translateY(12px);
  transition: all 0.7s 1.4s; padding: 16px 32px;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
  background: rgba(255,255,255,0.03); backdrop-filter: blur(10px);
}
.stats-bar.visible { opacity: 1; transform: translateY(0); }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num { font-size: 18px; font-weight: 700; color: #d4af37; }
.stat-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }

.progress-track { width: 200px; height: 2px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
.progress-fill {
  height: 100%; width: 0; background: linear-gradient(90deg, #d4af37, #f0d060);
  border-radius: 99px; transition: width 8.4s cubic-bezier(.4,0,.2,1) 0.8s;
}
.progress-fill.filling { width: 100%; }
.progress-label { font-family: ui-monospace, monospace; font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 0.15em; }
`