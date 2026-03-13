import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Building2, Mail, Loader2, ArrowRight, Package,
    TrendingUp, CheckCircle, ShieldCheck, Boxes,
    ChevronRight, Zap,
} from "lucide-react";
import supplierQuotationService from '@/services/supplierQuotationService';
import purchaseOrderService from '@/services/purchaseOrderService';

/* ══════════════════════════════════════════
   SPLASH SCREEN
══════════════════════════════════════════ */
function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter'); // enter → hold → exit

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 400);
        const t2 = setTimeout(() => setPhase('exit'), 6000);
        const t3 = setTimeout(onDone, 7200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <div className={`splash-root ${phase}`}>
            {/* Animated grid background */}
            <div className="splash-grid" />

            {/* Corner accent lines */}
            <div className="corner-tl" />
            <div className="corner-br" />

            {/* Floating orbs */}
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            {/* Scanline */}
            <div className={`scanline ${phase === 'hold' ? 'active' : ''}`} />

            {/* Content */}
            <div className="splash-content">
                {/* Logo mark */}
                <div className={`logo-ring ${phase === 'hold' ? 'pulse' : ''}`}>
                    <div className="logo-inner">
                        <Boxes size={36} strokeWidth={1.5} className="logo-icon" />
                    </div>
                    <svg className="logo-svg" viewBox="0 0 120 120">
                        <circle className="logo-track" cx="60" cy="60" r="54" />
                        <circle className={`logo-arc ${phase === 'hold' ? 'drawn' : ''}`} cx="60" cy="60" r="54" />
                    </svg>
                </div>

                {/* Brand */}
                <div className={`brand-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <div className="brand-tag">WAREHOUSE MANAGEMENT SYSTEM</div>
                    <h1 className="brand-title">
                        <span className="brand-fs">FS</span>
                        <span className="brand-divider" />
                        <span className="brand-wms">WMS</span>
                    </h1>
                </div>

                {/* Welcome text */}
                <div className={`welcome-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <p className="welcome-line">Welcome to the</p>
                    <p className="welcome-main">FS Warehouse Management System</p>
                    <p className="welcome-sub">Supplier Procurement Portal · v2.0</p>
                </div>

                {/* Stats bar */}
                <div className={`stats-bar ${phase === 'hold' ? 'visible' : ''}`}>
                    {[
                        { n: '10K+', l: 'Orders' },
                        { n: '500+', l: 'Suppliers' },
                        { n: '99.9%', l: 'Uptime' },
                        { n: '24/7', l: 'Support' },
                    ].map(({ n, l }) => (
                        <div key={l} className="stat-item">
                            <span className="stat-num">{n}</span>
                            <span className="stat-label">{l}</span>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="progress-track">
                    <div className={`progress-fill ${phase === 'hold' ? 'filling' : ''}`} />
                </div>
                <p className="progress-label">Initializing secure connection…</p>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════ */
function LoginForm() {
    const [searchParams] = useSearchParams?.() || [new URLSearchParams()];
    const navigate = useNavigate?.() || (() => { });
    const orderId = searchParams?.get?.('id');
    const emailParam = searchParams?.get?.('email');

    const [email, setEmail] = useState(emailParam || '');
    const [manualSoDonMua, setManualSoDonMua] = useState('');
    const [resolvedId, setResolvedId] = useState(null);
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [visible, setVisible] = useState(false);

    useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

    const validateEmail = () => {
        if (!email) { setErrors({ email: 'Vui lòng nhập email' }); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErrors({ email: 'Email không hợp lệ' }); return false; }
        setErrors({}); return true;
    };

    const validateOtp = () => {
        if (!otp) { setErrors({ otp: 'Vui lòng nhập mã OTP' }); return false; }
        if (otp.length < 6) { setErrors({ otp: 'Mã OTP phải có 6 ký tự' }); return false; }
        setErrors({}); return true;
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault?.();
        if (!validateEmail()) return;
        setLoading(true);
        try {
            let targetId = orderId ? Number(orderId) : null;
            if (!targetId && manualSoDonMua) {
                try {
                    const res = await purchaseOrderService?.filter?.({
                        filters: [{ fieldName: "soDonMua", operation: "EQUALS", value: manualSoDonMua, logicType: "AND" }],
                        sorts: [], page: 0, size: 1,
                    });
                    if (res?.data?.content?.length > 0) { targetId = res.data.content[0].id; setResolvedId(targetId); }
                    else { toast.error('Không tìm thấy đơn hàng với mã này.'); return; }
                } catch { toast.error('Có lỗi khi tra cứu mã đơn hàng.'); return; }
            }
            if (!targetId) { toast.error('Vui lòng nhập mã đơn hàng hoặc sử dụng liên kết từ email.'); return; }
            await supplierQuotationService?.requestOtp?.({ email, donMuaHangId: targetId });
            toast.success('Mã OTP đã được gửi đến email của bạn');
            setStep(2);
        } catch (err) {
            const msg = err?.response?.data?.message || '';
            if (err?.response?.status === 400 && msg.toLowerCase().includes('otp')) {
                toast.info('Mã OTP vẫn còn hiệu lực. Vui lòng kiểm tra email.'); setStep(2); return;
            }
            toast.error(msg || 'Có lỗi xảy ra khi gửi OTP.');
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault?.();
        if (!validateOtp()) return;
        const activeId = orderId ? Number(orderId) : resolvedId;
        if (!activeId) { toast.error('Không tìm thấy thông tin đơn hàng.'); return; }
        setLoading(true);
        try {
            const res = await supplierQuotationService?.verifyOtp?.({ email, otp, donMuaHangId: activeId });
            if (res?.data) {
                toast.success('Đăng nhập thành công!');
                setTimeout(() => navigate('/supplier/quotation', { state: { orderData: res.data, supplierEmail: email, orderId: activeId } }), 500);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
        } finally { setLoading(false); }
    };

    return (
        <div className={`login-page ${visible ? 'lp-visible' : ''}`}>
            <style>{LOGIN_STYLES}</style>

            {/* Left panel — dark */}
            <div className="lp-left">
                <div className="lp-left-noise" />

                <div className="lp-left-content">
                    <div className="lp-logo">
                        <Boxes size={28} strokeWidth={1.5} />
                    </div>

                    <div className="lp-headline">
                        <div className="lp-eyebrow">FS · Warehouse Management</div>
                        <h1 className="lp-title">Supplier<br />Portal</h1>
                        <p className="lp-desc">Nền tảng quản lý đơn hàng và báo giá dành riêng cho nhà cung cấp của FS Fashion Group.</p>
                    </div>

                    <div className="lp-features">
                        {[
                            { Icon: CheckCircle, color: '#4ade80', title: 'Báo giá nhanh chóng', desc: 'Nhận và phản hồi RFQ trong vài phút' },
                            { Icon: Package, color: '#60a5fa', title: 'Theo dõi đơn hàng', desc: 'Lịch sử và trạng thái đơn theo thời gian thực' },
                            { Icon: TrendingUp, color: '#f59e0b', title: 'Phân tích hiệu suất', desc: 'Dashboard thống kê doanh thu & giao dịch' },
                        ].map(({ Icon, color, title, desc }) => (
                            <div key={title} className="lp-feat">
                                <div className="lp-feat-icon" style={{ '--fc': color }}>
                                    <Icon size={16} strokeWidth={2} style={{ color }} />
                                </div>
                                <div>
                                    <p className="lp-feat-title">{title}</p>
                                    <p className="lp-feat-desc">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lp-bottom-badge">
                        <ShieldCheck size={13} />
                        <span>Secured by 256-bit TLS Encryption</span>
                    </div>
                </div>
            </div>

            {/* Right panel — light form */}
            <div className="lp-right">
                <div className="lp-form-wrap">

                    {/* Step indicator */}
                    <div className="lp-steps">
                        <div className={`lp-step ${step >= 1 ? 'lp-step-done' : ''}`}>
                            <span className="lp-step-dot">{step > 1 ? '✓' : '1'}</span>
                            <span>Email</span>
                        </div>
                        <div className="lp-step-line" />
                        <div className={`lp-step ${step >= 2 ? 'lp-step-done' : 'lp-step-dim'}`}>
                            <span className="lp-step-dot">{step > 2 ? '✓' : '2'}</span>
                            <span>Xác thực</span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="lp-card">
                        <div className="lp-card-header">
                            <h2 className="lp-card-title">
                                {step === 1 ? 'Đăng nhập' : 'Nhập mã OTP'}
                            </h2>
                            <p className="lp-card-sub">
                                {step === 1
                                    ? 'Nhập email và mã đơn để nhận OTP xác thực'
                                    : <>Mã đã gửi đến <strong>{email}</strong></>}
                            </p>
                        </div>

                        <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="lp-form">

                            {/* Email */}
                            <div className="lp-field">
                                <Label className="lp-label">Email <span className="lp-req">*</span></Label>
                                <div className="lp-input-wrap">
                                    <Mail size={15} className="lp-input-icon" />
                                    <input
                                        type="email" placeholder="supplier@company.com"
                                        className={`lp-input ${errors.email ? 'lp-input-err' : ''}`}
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                                        disabled={loading || step === 2}
                                    />
                                </div>
                                {errors.email && <p className="lp-err-msg">{errors.email}</p>}
                            </div>

                            {/* Order code */}
                            {!orderId && step === 1 && (
                                <div className="lp-field">
                                    <Label className="lp-label">Mã đơn hàng <span className="lp-req">*</span></Label>
                                    <div className="lp-input-wrap">
                                        <Package size={15} className="lp-input-icon" />
                                        <input
                                            type="text" placeholder="VD: PO2026-00142"
                                            className="lp-input lp-mono"
                                            value={manualSoDonMua}
                                            onChange={e => setManualSoDonMua(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* OTP */}
                            {step === 2 && (
                                <div className="lp-field lp-otp-field">
                                    <div className="lp-otp-label-row">
                                        <Label className="lp-label">Mã OTP <span className="lp-req">*</span></Label>
                                        <button type="button" onClick={() => { setStep(1); setOtp(''); setErrors({}); }}
                                            className="lp-link">← Thay đổi email</button>
                                    </div>
                                    <div className="lp-otp-boxes">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <input
                                                key={i}
                                                type="text" maxLength={1}
                                                className={`lp-otp-box ${errors.otp ? 'lp-otp-err' : ''} ${otp[i] ? 'lp-otp-filled' : ''}`}
                                                value={otp[i] || ''}
                                                onChange={e => {
                                                    const v = e.target.value.replace(/\D/, '');
                                                    const arr = otp.split('');
                                                    arr[i] = v;
                                                    const next = arr.join('').slice(0, 6);
                                                    setOtp(next);
                                                    setErrors(p => ({ ...p, otp: '' }));
                                                    if (v && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
                                                }}
                                                id={`otp-${i}`}
                                                autoFocus={i === 0}
                                                disabled={loading}
                                            />
                                        ))}
                                    </div>
                                    {errors.otp && <p className="lp-err-msg">{errors.otp}</p>}
                                    <div className="lp-resend">
                                        Không nhận được mã?{' '}
                                        <button type="button" className="lp-link"
                                            onClick={() => handleSendOtp({ preventDefault: () => { } })}
                                            disabled={loading}>Gửi lại</button>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button type="submit" disabled={loading} className="lp-btn">
                                {loading
                                    ? <><Loader2 size={16} className="lp-spin" />Đang xử lý...</>
                                    : step === 1
                                        ? <>Nhận mã OTP<ChevronRight size={16} className="opacity-50" /></>
                                        : <>Xác thực & Đăng nhập<ChevronRight size={16} className="opacity-50" /></>}
                            </button>
                        </form>
                    </div>

                    <p className="lp-footer">
                        Cần hỗ trợ?{' '}
                        <a href="mailto:support@fswms.vn" className="lp-link">Liên hệ bộ phận kỹ thuật</a>
                    </p>
                    <p className="lp-copy">© 2026 FS Fashion Group · All rights reserved</p>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   ROOT
══════════════════════════════════════════ */
export default function SupplierLoginPage() {
    const [showLogin, setShowLogin] = useState(false);
    return (
        <>
            <style>{SPLASH_STYLES}</style>
            {!showLogin && <SplashScreen onDone={() => setShowLogin(true)} />}
            {showLogin && <LoginForm />}
        </>
    );
}

/* ══════════════════════════════════════════
   SPLASH CSS
══════════════════════════════════════════ */
const SPLASH_STYLES = `

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.splash-root {
  position: fixed; inset: 0; z-index: 9999;
  background: #0a0b0f;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1);
}
.splash-root.enter { opacity: 0; }
.splash-root.hold  { opacity: 1; }
.splash-root.exit  { opacity: 0; transform: scale(1.04); pointer-events: none; }

/* Grid */
.splash-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridDrift 20s linear infinite;
}
@keyframes gridDrift { to { background-position: 60px 60px; } }

/* Corner accents */
.corner-tl, .corner-br {
  position: absolute;
  width: 180px; height: 180px;
  border: 1px solid rgba(212,175,55,0.3);
}
.corner-tl { top: 32px; left: 32px; border-right: none; border-bottom: none; animation: cornerIn 1s 0.5s both; }
.corner-br { bottom: 32px; right: 32px; border-left: none; border-top: none; animation: cornerIn 1s 0.7s both; }
@keyframes cornerIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

/* Orbs */
.orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); pointer-events: none; opacity: 0;
  animation: orbPulse 4s ease-in-out infinite alternate;
}
.orb-1 { width: 400px; height: 400px; background: rgba(99,102,241,0.15); top: -100px; right: -100px; animation-delay: 0s; }
.orb-2 { width: 300px; height: 300px; background: rgba(212,175,55,0.10); bottom: -80px; left: -80px; animation-delay: 1.5s; }
.orb-3 { width: 250px; height: 250px; background: rgba(16,185,129,0.08); top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 0.8s; }
@keyframes orbPulse { from { opacity: 0.4; } to { opacity: 0.9; } }

/* Scanline */
.scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent);
  top: -2px; opacity: 0;
}
.scanline.active { animation: scan 3s 0.5s ease-in-out forwards; }
@keyframes scan { 0% { top: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

/* Content */
.splash-content {
  display: flex; flex-direction: column; align-items: center; gap: 28px;
  position: relative; z-index: 2; text-align: center;
}

/* Logo ring */
.logo-ring {
  position: relative; width: 110px; height: 110px;
  display: flex; align-items: center; justify-content: center;
  animation: logoAppear 0.8s 0.2s both;
}
@keyframes logoAppear { from { opacity: 0; transform: scale(0.6) rotate(-20deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
.logo-inner {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, #1a1b2e 0%, #16213e 100%);
  border: 1px solid rgba(212,175,55,0.4);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 40px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
  transition: box-shadow 1s;
}
.logo-ring.pulse .logo-inner { box-shadow: 0 0 60px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,255,255,0.05); }
.logo-icon { color: #d4af37; }
.logo-svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.logo-track { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 2; }
.logo-arc {
  fill: none; stroke: #d4af37; stroke-width: 2;
  stroke-dasharray: 340; stroke-dashoffset: 340;
  stroke-linecap: round;
  transition: stroke-dashoffset 2s cubic-bezier(.4,0,.2,1) 0.4s;
}
.logo-arc.drawn { stroke-dashoffset: 0; }

/* Brand */
.brand-block { opacity: 0; transform: translateY(20px); transition: all 0.7s 0.6s; }
.brand-block.visible { opacity: 1; transform: translateY(0); }
.brand-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 10px; letter-spacing: 0.2em;
  color: rgba(212,175,55,0.7); margin-bottom: 8px;
}
.brand-title {
  font-family: Inter, system-ui, sans-serif; font-size: 48px; font-weight: 800;
  color: #fff; line-height: 1; display: flex; align-items: center; gap: 16px;
  letter-spacing: -1px;
}
.brand-fs { color: #d4af37; }
.brand-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }
.brand-wms { color: rgba(255,255,255,0.85); }

/* Welcome */
.welcome-block { opacity: 0; transform: translateY(16px); transition: all 0.7s 1s; }
.welcome-block.visible { opacity: 1; transform: translateY(0); }
.welcome-line { font-family: Inter, system-ui, sans-serif; font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 300; }
.welcome-main { font-family: Inter, system-ui, sans-serif; font-size: 22px; font-weight: 600; color: rgba(255,255,255,0.9); margin: 4px 0; }
.welcome-sub {
  font-family: ui-monospace, monospace; font-size: 11px;
  color: rgba(212,175,55,0.6); letter-spacing: 0.1em;
}

/* Stats */
.stats-bar {
  display: flex; gap: 32px; opacity: 0; transform: translateY(12px);
  transition: all 0.7s 1.4s; padding: 16px 32px;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
  background: rgba(255,255,255,0.03); backdrop-filter: blur(10px);
}
.stats-bar.visible { opacity: 1; transform: translateY(0); }
.stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-num { font-family: Inter, system-ui, sans-serif; font-size: 18px; font-weight: 700; color: #d4af37; }
.stat-label { font-family: Inter, system-ui, sans-serif; font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; }

/* Progress */
.progress-track {
  width: 200px; height: 2px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden;
}
.progress-fill {
  height: 100%; width: 0; background: linear-gradient(90deg, #d4af37, #f0d060);
  border-radius: 99px; transition: width 5s cubic-bezier(.4,0,.2,1) 0.8s;
}
.progress-fill.filling { width: 100%; }
.progress-label { font-family: ui-monospace, monospace; font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 0.15em; }
`;

/* ══════════════════════════════════════════
   LOGIN CSS
══════════════════════════════════════════ */
const LOGIN_STYLES = `

.login-page {
  display: flex; min-height: 100vh;
  font-family: Inter, system-ui, sans-serif;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.login-page.lp-visible { opacity: 1; transform: translateY(0); }

/* Left dark panel */
.lp-left {
  width: 440px; flex-shrink: 0;
  background: #0a0b0f;
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 40px;
}
@media (max-width: 900px) { .lp-left { display: none; } }
.lp-left-noise {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
}
.lp-left-content { position: relative; z-index: 1; width: 100%; display: flex; flex-direction: column; gap: 36px; }
.lp-logo {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, #1c1d2e, #252640);
  border: 1px solid rgba(212,175,55,0.35);
  display: flex; align-items: center; justify-content: center;
  color: #d4af37;
  box-shadow: 0 0 24px rgba(212,175,55,0.15);
}
.lp-eyebrow {
  font-family: ui-monospace, monospace; font-size: 10px;
  letter-spacing: 0.18em; color: rgba(212,175,55,0.65);
  text-transform: uppercase; margin-bottom: 8px;
}
.lp-title {
  font-family: Inter, system-ui, sans-serif; font-size: 40px; font-weight: 800;
  color: #fff; line-height: 1.05; letter-spacing: -1px;
  margin-bottom: 12px;
}
.lp-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; }

.lp-features { display: flex; flex-direction: column; gap: 12px; }
.lp-feat {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  transition: background 0.2s;
}
.lp-feat:hover { background: rgba(255,255,255,0.05); }
.lp-feat-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: rgba(255,255,255,0.05);
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.08);
}
.lp-feat-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); margin-bottom: 2px; }
.lp-feat-desc { font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.4; }

.lp-bottom-badge {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: rgba(255,255,255,0.25);
  font-family: ui-monospace, monospace; letter-spacing: 0.05em;
}

/* Right light panel */
.lp-right {
  flex: 1; background: #f9fafb;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 32px;
  background-image:
    radial-gradient(circle at 80% 20%, rgba(99,102,241,0.05) 0%, transparent 60%),
    radial-gradient(circle at 20% 80%, rgba(212,175,55,0.04) 0%, transparent 60%);
}
.lp-form-wrap { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 20px; }

/* Steps */
.lp-steps { display: flex; align-items: center; gap: 8px; }
.lp-step { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #6b7280; transition: color 0.3s; }
.lp-step-done { color: #0a0b0f; }
.lp-step-dim { color: #d1d5db; }
.lp-step-dot {
  width: 22px; height: 22px; border-radius: 50%;
  background: #e5e7eb; color: #9ca3af;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; transition: all 0.3s;
}
.lp-step-done .lp-step-dot { background: #0a0b0f; color: #fff; }
.lp-step-line { flex: 1; height: 1px; background: #e5e7eb; max-width: 40px; }

/* Card */
.lp-card {
  background: #fff; border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}
.lp-card-header {
  padding: 28px 28px 0;
  border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; margin-bottom: 4px;
}
.lp-card-title { font-family: Inter, system-ui, sans-serif; font-size: 22px; font-weight: 700; color: #0a0b0f; }
.lp-card-sub { font-size: 13px; color: #9ca3af; margin-top: 4px; }
.lp-card-sub strong { color: #374151; }

/* Form */
.lp-form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 18px; }
.lp-field { display: flex; flex-direction: column; gap: 6px; }
.lp-label { font-size: 12px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.06em; }
.lp-req { color: #ef4444; }

.lp-input-wrap { position: relative; }
.lp-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
.lp-input {
  width: 100%; height: 44px; padding: 0 14px 0 38px;
  border: 1.5px solid #e5e7eb; border-radius: 12px;
  font-family: Inter, system-ui, sans-serif; font-size: 14px; color: #111827;
  background: #fafafa; outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.lp-input:focus { border-color: #0a0b0f; background: #fff; box-shadow: 0 0 0 3px rgba(10,11,15,0.08); }
.lp-input:disabled { opacity: 0.5; cursor: not-allowed; }
.lp-input-err { border-color: #ef4444 !important; }
.lp-input.lp-mono { font-family: ui-monospace, monospace; font-size: 13px; letter-spacing: 0.05em; }

.lp-err-msg { font-size: 12px; color: #ef4444; display: flex; align-items: center; gap: 4px; }

/* OTP boxes */
.lp-otp-field { animation: slideUp 0.35s ease both; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.lp-otp-label-row { display: flex; align-items: center; justify-content: space-between; }
.lp-otp-boxes { display: flex; gap: 8px; }
.lp-otp-box {
  flex: 1; height: 52px; border-radius: 12px;
  border: 1.5px solid #e5e7eb; background: #fafafa;
  text-align: center; font-family: ui-monospace, monospace;
  font-size: 20px; font-weight: 600; color: #0a0b0f;
  outline: none; transition: all 0.15s;
}
.lp-otp-box:focus { border-color: #0a0b0f; background: #fff; box-shadow: 0 0 0 3px rgba(10,11,15,0.08); }
.lp-otp-box.lp-otp-filled { border-color: #4ade80; background: #f0fdf4; }
.lp-otp-box.lp-otp-err { border-color: #ef4444; }
.lp-otp-err-box { border-color: #ef4444 !important; }
.lp-resend { font-size: 12px; color: #9ca3af; text-align: center; }

/* Button */
.lp-btn {
  height: 48px; border-radius: 12px; width: 100%;
  background: #0a0b0f; color: #fff;
  font-family: Inter, system-ui, sans-serif; font-size: 14px; font-weight: 600;
  border: 1px solid #0a0b0f; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); letter-spacing: 0.02em;
  position: relative; overflow: hidden;
}
.lp-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0; transition: opacity 0.3s;
}
.lp-btn:hover { 
  background: #fff; 
  color: #0a0b0f; 
  transform: translateY(-1px); 
  box-shadow: 0 12px 24px rgba(10,11,15,0.12);
}
.lp-btn:hover::before { opacity: 1; }
.lp-btn:active { transform: translateY(0); }
.lp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.lp-btn-arrow { margin-left: auto; opacity: 0.5; }
.lp-spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Links */
.lp-link { background: none; border: none; cursor: pointer; color: #6366f1; font-size: 12px; font-weight: 600; text-decoration: none; }
.lp-link:hover { color: #4f46e5; text-decoration: underline; }

.lp-footer { font-size: 13px; color: #9ca3af; text-align: center; }
.lp-copy { font-size: 11px; color: #d1d5db; text-align: center; }
`;