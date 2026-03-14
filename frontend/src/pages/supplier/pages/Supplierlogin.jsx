import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import {
    Building2, Mail, Loader2, Package,
    TrendingUp, CheckCircle, ShieldCheck, Boxes,
    ChevronRight,
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
        const t2 = setTimeout(() => setPhase('exit'), 8800);
        const t3 = setTimeout(onDone, 7200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, []);

    return (
        <div className={`sp-root ${phase}`}>
            <style>{SPLASH_STYLES}</style>

            {/* Animated grid background */}
            <div className="sp-grid" />

            {/* Corner accent lines */}
            <div className="sp-corner-tl" />
            <div className="sp-corner-br" />

            {/* Floating orbs */}
            <div className="sp-orb-1" />
            <div className="sp-orb-2" />

            {/* Scanline */}
            <div className={`sp-scanline ${phase === 'hold' ? 'active' : ''}`} />

            {/* Content */}
            <div className="sp-content">
                {/* Logo mark */}
                <div className={`sp-logo-ring ${phase === 'hold' ? 'pulse' : ''}`}>
                    <div className="sp-logo-inner">
                        <Boxes size={36} strokeWidth={1.8} className="sp-logo-icon" />
                    </div>
                    <svg className="sp-logo-svg" viewBox="0 0 120 120">
                        <circle className="sp-logo-track" cx="60" cy="60" r="54" />
                        <circle className={`sp-logo-arc ${phase === 'hold' ? 'drawn' : ''}`} cx="60" cy="60" r="54" />
                    </svg>
                </div>

                {/* Brand */}
                <div className={`sp-brand-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <div className="sp-brand-tag">WAREHOUSE MANAGEMENT SYSTEM</div>
                    <h1 className="sp-brand-title">
                        <span className="sp-brand-fs">FS</span>
                        <span className="sp-brand-divider" />
                        <span className="sp-brand-wms">WMS</span>
                    </h1>
                </div>

                {/* Welcome text */}
                <div className={`sp-welcome-block ${phase === 'hold' ? 'visible' : ''}`}>
                    <p className="sp-welcome-line">Welcome to the future of Fashion</p>
                    <p className="sp-welcome-main">FS Warehouse Management System</p>
                    <p className="sp-welcome-sub">Supplier Procurement Portal · v2.0</p>
                </div>

                {/* Stats bar */}
                <div className={`sp-stats-bar ${phase === 'hold' ? 'visible' : ''}`}>
                    {[
                        { n: '10K+', l: 'Customers' },
                        { n: '500+', l: 'Suppliers' },
                        { n: '99.9%', l: 'Uptime' },
                        { n: '24/7', l: 'Support' },
                    ].map(({ n, l }) => (
                        <div key={l} className="sp-stat-item">
                            <span className="sp-stat-num">{n}</span>
                            <span className="sp-stat-label">{l}</span>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="sp-progress-track">
                    <div className={`sp-progress-fill ${phase === 'hold' ? 'filling' : ''}`} />
                </div>
                <p className="sp-progress-label">Initializing secure connection…</p>
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
        <div className={`lf-page ${visible ? 'lf-visible' : ''}`}>
            <style>{LOGIN_STYLES}</style>

            {/* Left panel */}
            <div className="lf-left">
                <div className="lf-left-grid" />
                <div className="lf-left-orb-1" />
                <div className="lf-left-orb-2" />
                <div className="lf-corner-tl" />
                <div className="lf-corner-br" />

                <div className="lf-left-content">
                    {/* Logo */}
                    <div className="lf-logo">
                        <div className="lf-logo-box">
                            <Boxes size={22} strokeWidth={1.8} style={{ color: '#fff' }} />
                        </div>
                        <div className="lf-logo-text">
                            <span className="lf-logo-fs">FS</span>
                            <span className="lf-logo-sep" />
                            <span className="lf-logo-wms">WMS</span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="lf-headline">
                        <div className="lf-eyebrow">
                            <TrendingUp size={10} style={{ color: '#b8860b' }} />
                            FS · Warehouse Management
                        </div>
                        <h1 className="lf-title">Supplier<br />Portal</h1>
                        <p className="lf-desc">
                            Nền tảng quản lý đơn hàng và báo giá dành riêng cho nhà cung cấp của FS Fashion Group.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="lf-features">
                        {[
                            { Icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', title: 'Báo giá nhanh chóng', desc: 'Nhận và phản hồi RFQ trong vài phút' },
                            { Icon: Package, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', title: 'Theo dõi đơn hàng', desc: 'Lịch sử và trạng thái đơn theo thời gian thực' },
                            { Icon: TrendingUp, color: '#e8b923', bg: 'rgba(232,185,35,0.12)', title: 'Phân tích hiệu suất', desc: 'Dashboard thống kê doanh thu & giao dịch' },
                        ].map(({ Icon, color, bg, title, desc }) => (
                            <div key={title} className="lf-feat">
                                <div className="lf-feat-icon" style={{ background: bg, border: `1px solid ${color}33` }}>
                                    <Icon size={15} strokeWidth={2} style={{ color }} />
                                </div>
                                <div>
                                    <p className="lf-feat-title">{title}</p>
                                    <p className="lf-feat-desc">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom badge */}
                    <div className="lf-bottom-badge">
                        <ShieldCheck size={12} style={{ color: '#b8860b' }} />
                        <span>Secured by 256-bit TLS Encryption</span>
                    </div>
                </div>
            </div>

            {/* Right panel */}
            <div className="lf-right">
                <div className="lf-right-orb" />
                <div className="lf-form-wrap">

                    {/* Step indicator */}
                    <div className="lf-steps">
                        <div className={`lf-step ${step >= 1 ? 'lf-step-active' : 'lf-step-dim'}`}>
                            <span className="lf-step-dot">{step > 1 ? '✓' : '1'}</span>
                            <span>Email</span>
                        </div>
                        <div className="lf-step-line" />
                        <div className={`lf-step ${step >= 2 ? 'lf-step-active' : 'lf-step-dim'}`}>
                            <span className="lf-step-dot">{step > 2 ? '✓' : '2'}</span>
                            <span>Xác thực</span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="lf-card">
                        {/* Gold top line */}
                        <div className="lf-card-topline" />

                        <div className="lf-card-header">
                            <h2 className="lf-card-title">
                                {step === 1 ? 'Đăng nhập' : 'Nhập mã OTP'}
                            </h2>
                            <p className="lf-card-sub">
                                {step === 1
                                    ? 'Nhập email và mã đơn để nhận OTP xác thực'
                                    : <><span>Mã đã gửi đến </span><strong>{email}</strong></>}
                            </p>
                        </div>

                        <form
                            onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}
                            className="lf-form"
                        >
                            {/* Email field */}
                            <div className="lf-field">
                                <label className="lf-lbl">
                                    Email <span className="lf-req">*</span>
                                </label>
                                <div className="lf-input-wrap">
                                    <Mail size={14} className="lf-input-icon" />
                                    <input
                                        type="email"
                                        placeholder="supplier@company.com"
                                        className={`lf-input ${errors.email ? 'lf-input-err' : ''}`}
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                                        disabled={loading || step === 2}
                                    />
                                </div>
                                {errors.email && <p className="lf-err-msg">{errors.email}</p>}
                            </div>

                            {/* Order code field */}
                            {!orderId && step === 1 && (
                                <div className="lf-field">
                                    <label className="lf-lbl">
                                        Mã đơn hàng <span className="lf-req">*</span>
                                    </label>
                                    <div className="lf-input-wrap">
                                        <Package size={14} className="lf-input-icon" />
                                        <input
                                            type="text"
                                            placeholder="VD: PO2026-00142"
                                            className="lf-input lf-mono"
                                            value={manualSoDonMua}
                                            onChange={e => setManualSoDonMua(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* OTP field */}
                            {step === 2 && (
                                <div className="lf-field lf-otp-anim">
                                    <div className="lf-otp-label-row">
                                        <label className="lf-lbl">
                                            Mã OTP <span className="lf-req">*</span>
                                        </label>
                                    </div>
                                    <div className="lf-input-wrap">
                                        <ShieldCheck size={14} className="lf-input-icon" />
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="Nhập mã 6 chữ số"
                                            className={`lf-input lf-input-otp ${errors.otp ? 'lf-input-err' : ''}`}
                                            value={otp}
                                            onChange={e => {
                                                const v = e.target.value.replace(/\D/, '').slice(0, 6);
                                                setOtp(v);
                                                setErrors(p => ({ ...p, otp: '' }));
                                            }}
                                            autoFocus
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.otp && <p className="lf-err-msg">{errors.otp}</p>}
                                    <div className="lf-resend">
                                        Không nhận được mã?{' '}
                                        <button
                                            type="button"
                                            className="lf-link"
                                            onClick={() => handleSendOtp({ preventDefault: () => { } })}
                                            disabled={loading}
                                        >
                                            Gửi lại
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Submit button */}
                            <button type="submit" disabled={loading} className="lf-btn">
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className="lf-spin" />
                                        Đang xử lý...
                                    </>
                                ) : step === 1 ? (
                                    <>Nhận mã OTP <ChevronRight size={15} style={{ opacity: 0.7 }} /></>
                                ) : (
                                    <>Xác thực & Đăng nhập <ChevronRight size={15} style={{ opacity: 0.7 }} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="lf-footer">
                        Cần hỗ trợ?{' '}
                        <a href="mailto:support@fswms.vn" className="lf-link">
                            Liên hệ bộ phận kỹ thuật
                        </a>
                    </p>
                    <p className="lf-copy">© 2026 FS Fashion Group · All rights reserved</p>
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
            {!showLogin && <SplashScreen onDone={() => setShowLogin(true)} />}
            {showLogin && <LoginForm />}
        </>
    );
}

/* ══════════════════════════════════════════
   SPLASH CSS — Gold / Ivory (matches homepage)
══════════════════════════════════════════ */
const SPLASH_STYLES = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.sp-root {
  position: fixed; inset: 0; z-index: 9999;
  background: linear-gradient(160deg, #faf8f3 0%, #f0ead8 60%, #e8dfc8 100%);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1);
  font-family: system-ui, sans-serif;
}
.sp-root.enter { opacity: 0; }
.sp-root.hold  { opacity: 1; }
.sp-root.exit  { opacity: 0; transform: scale(1.03); pointer-events: none; }

/* Grid */
.sp-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.07) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: spGrid 25s linear infinite;
}
@keyframes spGrid { to { background-position: 56px 56px; } }

/* Corner accents */
.sp-corner-tl, .sp-corner-br {
  position: absolute; width: 180px; height: 180px;
  border: 1.5px solid rgba(184,134,11,0.3);
}
.sp-corner-tl { top: 32px; left: 32px; border-right: none; border-bottom: none; animation: spCorner 1s 0.5s both; }
.sp-corner-br { bottom: 32px; right: 32px; border-left: none; border-top: none; animation: spCorner 1s 0.7s both; }
@keyframes spCorner { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

/* Orbs */
.sp-orb-1 {
  position: absolute; width: 500px; height: 500px; border-radius: 50%;
  background: rgba(184,134,11,0.1); filter: blur(90px);
  top: -150px; right: -150px; pointer-events: none;
  animation: spOrb 5s ease-in-out infinite alternate;
}
.sp-orb-2 {
  position: absolute; width: 350px; height: 350px; border-radius: 50%;
  background: rgba(201,150,12,0.08); filter: blur(80px);
  bottom: -100px; left: -80px; pointer-events: none;
  animation: spOrb 4s 1s ease-in-out infinite alternate;
}
@keyframes spOrb { from { opacity: 0.5; transform: scale(0.95); } to { opacity: 1; transform: scale(1.05); } }

/* Scanline */
.sp-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(184,134,11,0.55), transparent);
  top: -2px; opacity: 0;
}
.sp-scanline.active { animation: spScan 3.5s 0.5s ease-in-out forwards; }
@keyframes spScan { 0%{top:0;opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{top:100%;opacity:0} }

/* Content */
.sp-content {
  display: flex; flex-direction: column; align-items: center;
  gap: 28px; position: relative; z-index: 2; text-align: center;
}

/* Logo ring */
.sp-logo-ring {
  position: relative; width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
  animation: spLogoAppear 0.8s 0.2s both;
}
@keyframes spLogoAppear { from{opacity:0;transform:scale(0.6) rotate(-15deg)} to{opacity:1;transform:scale(1) rotate(0)} }
.sp-logo-inner {
  width: 78px; height: 78px; border-radius: 22px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 32px rgba(184,134,11,0.4), 0 0 0 1px rgba(184,134,11,0.2);
  transition: box-shadow 1s;
}
.sp-logo-ring.pulse .sp-logo-inner {
  box-shadow: 0 12px 48px rgba(184,134,11,0.55), 0 0 0 1px rgba(184,134,11,0.3);
}
.sp-logo-icon { color: #fff; }
.sp-logo-svg { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.sp-logo-track { fill: none; stroke: rgba(184,134,11,0.15); stroke-width: 2; }
.sp-logo-arc {
  fill: none; stroke: #b8860b; stroke-width: 2;
  stroke-dasharray: 340; stroke-dashoffset: 340; stroke-linecap: round;
  transition: stroke-dashoffset 2s cubic-bezier(.4,0,.2,1) 0.4s;
}
.sp-logo-arc.drawn { stroke-dashoffset: 0; }

/* Brand */
.sp-brand-block { opacity: 0; transform: translateY(18px); transition: all 0.7s 0.6s; }
.sp-brand-block.visible { opacity: 1; transform: translateY(0); }
.sp-brand-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px; letter-spacing: 0.2em;
  color: rgba(184,134,11,0.7); text-transform: uppercase; margin-bottom: 8px;
}
.sp-brand-title {
  font-size: 52px; font-weight: 900; line-height: 1; color: #1a1612;
  display: flex; align-items: center; gap: 16px; letter-spacing: -1px;
}
.sp-brand-fs { color: #b8860b; }
.sp-brand-divider { width: 1px; height: 42px; background: rgba(184,134,11,0.25); }
.sp-brand-wms {
  color: #3d3529;
  font-family: ui-monospace, monospace; font-size: 38px; font-weight: 500;
}

/* Welcome */
.sp-welcome-block { opacity: 0; transform: translateY(16px); transition: all 0.7s 1s; }
.sp-welcome-block.visible { opacity: 1; transform: translateY(0); }
.sp-welcome-line { font-size: 13px; color: #a89f92; font-weight: 300; }
.sp-welcome-main { font-size: 22px; font-weight: 600; color: #1a1612; margin: 5px 0; }
.sp-welcome-sub {
  font-family: ui-monospace, monospace; font-size: 11px;
  color: rgba(184,134,11,0.7); letter-spacing: 0.1em;
}

/* Stats */
.sp-stats-bar {
  display: flex; gap: 32px; opacity: 0; transform: translateY(12px);
  transition: all 0.7s 1.4s;
  padding: 16px 32px;
  border: 1px solid rgba(184,134,11,0.2); border-radius: 14px;
  background: rgba(255,255,255,0.6); backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(100,80,30,0.1);
}
.sp-stats-bar.visible { opacity: 1; transform: translateY(0); }
.sp-stat-item { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.sp-stat-num { font-size: 20px; font-weight: 800; color: #b8860b; }
.sp-stat-label {
  font-family: ui-monospace, monospace; font-size: 10px;
  color: #a89f92; text-transform: uppercase; letter-spacing: 0.1em;
}

/* Progress */
.sp-progress-track {
  width: 220px; height: 3px; background: rgba(184,134,11,0.15); border-radius: 99px; overflow: hidden;
}
.sp-progress-fill {
  height: 100%; width: 0;
  background: linear-gradient(90deg, #b8860b, #e8b923);
  border-radius: 99px;
  transition: width 8.4s cubic-bezier(.4,0,.2,1) 0.8s;
  box-shadow: 0 0 8px rgba(184,134,11,0.5);
}
.sp-progress-fill.filling { width: 100%; }
.sp-progress-label {
  font-family: ui-monospace, monospace; font-size: 10px;
  color: #c9b99a; letter-spacing: 0.15em;
}
`;

/* ══════════════════════════════════════════
   LOGIN CSS — Gold / Ivory (matches homepage)
══════════════════════════════════════════ */
const LOGIN_STYLES = `

.lf-page {
  display: flex; min-height: 100vh;
  font-family: system-ui, sans-serif;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
}
.lf-page.lf-visible { opacity: 1; transform: translateY(0); }

/* ── Left dark panel ── */
.lf-left {
  width: 420px; flex-shrink: 0;
  background: linear-gradient(160deg, #1a1200 0%, #2d2106 60%, #3d2e08 100%);
  position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 40px;
}
@media (max-width: 900px) { .lf-left { display: none; } }

.lf-left-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.08) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: lfGrid 35s linear infinite;
}
@keyframes lfGrid { to { background-position: 56px 56px; } }

.lf-left-orb-1 {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: rgba(184,134,11,0.12); filter: blur(90px);
  top: -130px; right: -130px; pointer-events: none;
}
.lf-left-orb-2 {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: rgba(201,150,12,0.08); filter: blur(80px);
  bottom: -80px; left: -80px; pointer-events: none;
}

.lf-corner-tl, .lf-corner-br {
  position: absolute; width: 100px; height: 100px;
  border: 1px solid rgba(184,134,11,0.25);
}
.lf-corner-tl { top: 24px; left: 24px; border-right: none; border-bottom: none; }
.lf-corner-br { bottom: 24px; right: 24px; border-left: none; border-top: none; }

.lf-left-content {
  position: relative; z-index: 1; width: 100%;
  display: flex; flex-direction: column; gap: 32px;
}

/* Logo */
.lf-logo { display: flex; align-items: center; gap: 10px; }
.lf-logo-box {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 18px rgba(184,134,11,0.45);
}
.lf-logo-text { display: flex; align-items: center; gap: 8px; }
.lf-logo-fs { font-size: 22px; font-weight: 900; color: #e8b923; letter-spacing: -0.5px; }
.lf-logo-sep { width: 1px; height: 18px; background: rgba(184,134,11,0.4); }
.lf-logo-wms {
  font-family: ui-monospace, monospace; font-size: 13px;
  font-weight: 500; color: rgba(255,255,255,0.5); letter-spacing: 0.08em;
}

/* Headline */
.lf-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: ui-monospace, monospace; font-size: 10px;
  letter-spacing: 0.18em; color: rgba(184,134,11,0.65);
  text-transform: uppercase; margin-bottom: 10px;
}
.lf-title {
  font-size: 40px; font-weight: 900; color: #fff;
  line-height: 1.05; letter-spacing: -1px; margin-bottom: 12px;
}
.lf-desc { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.7; }

/* Feature items */
.lf-features { display: flex; flex-direction: column; gap: 10px; }
.lf-feat {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 13px; border-radius: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(184,134,11,0.12);
  transition: background 0.2s, border-color 0.2s;
}
.lf-feat:hover { background: rgba(255,255,255,0.07); border-color: rgba(184,134,11,0.25); }
.lf-feat-icon {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.lf-feat-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); margin-bottom: 2px; }
.lf-feat-desc { font-size: 11px; color: rgba(255,255,255,0.32); line-height: 1.5; }

/* Bottom badge */
.lf-bottom-badge {
  display: flex; align-items: center; gap: 6px;
  font-family: ui-monospace, monospace; font-size: 10px;
  color: rgba(184,134,11,0.5); letter-spacing: 0.06em;
}

/* ── Right panel ── */
.lf-right {
  flex: 1; position: relative;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 32px; overflow: hidden;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 60%, #ede9de 100%);
}
.lf-right-orb {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: rgba(184,134,11,0.07); filter: blur(90px);
  top: -120px; right: -80px; pointer-events: none;
}

.lf-form-wrap {
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column; gap: 18px;
  position: relative; z-index: 1;
}

/* Steps */
.lf-steps { display: flex; align-items: center; gap: 8px; }
.lf-step {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: #a89f92;
  transition: color 0.3s;
}
.lf-step-active { color: #1a1612; }
.lf-step-dim { color: #c9b99a; }
.lf-step-dot {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(184,134,11,0.12); color: #a89f92;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  transition: all 0.3s;
}
.lf-step-active .lf-step-dot {
  background: linear-gradient(135deg, #b8860b, #e8b923);
  color: #fff;
  box-shadow: 0 2px 10px rgba(184,134,11,0.4);
}
.lf-step-line { flex: 1; height: 1px; background: rgba(184,134,11,0.2); max-width: 40px; }

/* Card */
.lf-card {
  background: #fff;
  border: 1px solid rgba(184,134,11,0.2);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(100,80,30,0.1), 0 1px 4px rgba(100,80,30,0.06);
  position: relative;
}
.lf-card-topline {
  height: 2px;
  background: linear-gradient(90deg, transparent, #b8860b, transparent);
}
.lf-card-header {
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(184,134,11,0.1);
  background: linear-gradient(180deg, rgba(184,134,11,0.03) 0%, transparent 100%);
}
.lf-card-title {
  font-size: 22px; font-weight: 800; color: #1a1612; letter-spacing: -0.5px;
}
.lf-card-sub { font-size: 13px; color: #a89f92; margin-top: 4px; }
.lf-card-sub strong { color: #3d3529; }

/* Form */
.lf-form {
  padding: 24px 28px 28px;
  display: flex; flex-direction: column; gap: 16px;
}
.lf-field { display: flex; flex-direction: column; gap: 6px; }
.lf-lbl {
  font-family: ui-monospace, monospace; font-size: 10px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase; color: rgba(184,134,11,0.7);
}
.lf-req { color: #ef4444; }

.lf-input-wrap { position: relative; }
.lf-input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: #a89f92; pointer-events: none;
}
.lf-input {
  width: 100%; height: 44px; padding: 0 14px 0 38px;
  background: #faf8f3; border: 1.5px solid rgba(184,134,11,0.2);
  border-radius: 11px; outline: none;
  font-size: 14px; color: #1a1612;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.lf-input::placeholder { color: #a89f92; }
.lf-input:focus {
  border-color: #b8860b; background: #fff;
  box-shadow: 0 0 0 3px rgba(184,134,11,0.1);
}
.lf-input:disabled { opacity: 0.5; cursor: not-allowed; }
.lf-input-err { border-color: #ef4444 !important; }
.lf-input.lf-mono { font-family: ui-monospace, monospace; font-size: 13px; letter-spacing: 0.05em; }
.lf-input.lf-input-otp { font-family: ui-monospace, monospace; font-size: 18px; letter-spacing: 0.3em; font-weight: bold; }
.lf-input.lf-input-otp::placeholder { font-family: system-ui, sans-serif; font-size: 14px; letter-spacing: normal; font-weight: normal; }

.lf-err-msg { font-size: 12px; color: #ef4444; }

/* OTP */
.lf-otp-anim { animation: lfOtpIn 0.35s ease both; }
@keyframes lfOtpIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.lf-otp-label-row { display: flex; align-items: center; justify-content: space-between; }
.lf-otp-boxes { display: flex; gap: 8px; margin-top: 2px; }
.lf-otp-box {
  flex: 1; height: 52px; border-radius: 12px;
  border: 1.5px solid rgba(184,134,11,0.2); background: #faf8f3;
  text-align: center;
  font-family: ui-monospace, monospace; font-size: 20px; font-weight: 700;
  color: #1a1612; outline: none; transition: all 0.15s;
}
.lf-otp-box:focus { border-color: #b8860b; background: #fff; box-shadow: 0 0 0 3px rgba(184,134,11,0.1); }
.lf-otp-box.lf-otp-filled { border-color: #22c55e; background: rgba(34,197,94,0.06); }
.lf-otp-box.lf-otp-err { border-color: #ef4444; }
.lf-resend { font-size: 12px; color: #a89f92; text-align: center; margin-top: 6px; }

/* Submit button */
.lf-btn {
  height: 48px; border-radius: 12px; width: 100%;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  color: #fff; border: none;
  font-size: 14px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 18px rgba(184,134,11,0.38);
  position: relative; overflow: hidden;
}
.lf-btn::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
  opacity: 0; transition: opacity 0.3s;
}
.lf-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(184,134,11,0.52);
}
.lf-btn:hover::before { opacity: 1; }
.lf-btn:active { transform: translateY(0); }
.lf-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
.lf-spin { animation: lfSpin 1s linear infinite; }
@keyframes lfSpin { to { transform: rotate(360deg); } }

/* Links */
.lf-link {
  background: none; border: none; cursor: pointer;
  color: #b8860b; font-size: 12px; font-weight: 600;
  text-decoration: none; transition: color 0.2s;
}
.lf-link:hover { color: #8a6308; text-decoration: underline; }

.lf-footer { font-size: 13px; color: #a89f92; text-align: center; }
.lf-copy {
  font-family: ui-monospace, monospace; font-size: 11px;
  color: #c9b99a; text-align: center; letter-spacing: 0.04em;
}
`;