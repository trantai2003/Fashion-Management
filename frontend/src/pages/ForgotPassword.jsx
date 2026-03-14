import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { nguoiDungService } from "../services/nguoiDungService";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Lock, Key, Loader2, ArrowRight, Boxes, ShieldCheck } from "lucide-react";

/* ══════════════════════════════════════════
   STYLES
══════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

.fp-root {
  min-height: 100vh;
  background: var(--dark);
  display: flex; align-items: center; justify-content: center;
  padding: 32px 16px;
  font-family: 'Inter', system-ui, sans-serif;
  position: relative; overflow: hidden;
  opacity: 0; transform: translateY(10px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fp-root.visible { opacity: 1; transform: translateY(0); }

/* Grid background */
.fp-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: gridDrift 25s linear infinite; opacity: 0.4;
}
@keyframes gridDrift { to { background-position: 56px 56px; } }

/* Orbs */
.fp-orb-1 {
  position: absolute; width: 500px; height: 500px; border-radius: 50%;
  background: rgba(212,175,55,0.06); filter: blur(90px);
  top: -180px; right: -180px; pointer-events: none;
}
.fp-orb-2 {
  position: absolute; width: 350px; height: 350px; border-radius: 50%;
  background: rgba(99,102,241,0.07); filter: blur(80px);
  bottom: -100px; left: -100px; pointer-events: none;
}

/* Corner accents */
.fp-corner-tl {
  position: absolute; top: 32px; left: 32px;
  width: 100px; height: 100px;
  border-top: 1px solid rgba(212,175,55,0.2);
  border-left: 1px solid rgba(212,175,55,0.2);
}
.fp-corner-br {
  position: absolute; bottom: 32px; right: 32px;
  width: 100px; height: 100px;
  border-bottom: 1px solid rgba(212,175,55,0.2);
  border-right: 1px solid rgba(212,175,55,0.2);
}

/* Main card */
.fp-card-wrap {
  width: 100%; max-width: 460px; position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 20px;
}

/* Logo area */
.fp-brand {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 4px;
}
.fp-logo {
  width: 44px; height: 44px; border-radius: 13px;
  background: linear-gradient(135deg, #1c1d2e, #252640);
  border: 1px solid rgba(212,175,55,0.4);
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  box-shadow: 0 0 24px rgba(212,175,55,0.18);
}
.fp-brand-text {
  font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;
}
.fp-brand-text span:first-child { color: var(--gold); }
.fp-brand-text span:last-child { color: rgba(255,255,255,0.7); font-weight: 600; font-size: 13px; font-family: 'DM Mono', monospace; letter-spacing: 0.08em; margin-left: 6px; }

/* Card */
.fp-card {
  background: linear-gradient(135deg, var(--dark-3), rgba(22,23,31,0.95));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03);
}
.fp-card::before {
  content: ''; display: block; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

/* Progress bar */
.fp-progress-wrap {
  padding: 20px 32px 0;
}
.fp-progress-steps {
  display: flex; align-items: center; gap: 0;
}
.fp-step-item {
  display: flex; align-items: center; gap: 8px; flex: 1;
}
.fp-step-item:last-child { flex: 0; }
.fp-step-dot {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04); color: var(--text-muted);
  transition: all 0.35s ease;
}
.fp-step-dot.done {
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  color: #0a0b0f; border-color: transparent;
  box-shadow: 0 0 16px rgba(212,175,55,0.4);
}
.fp-step-dot.active {
  background: rgba(212,175,55,0.15);
  border-color: rgba(212,175,55,0.5); color: var(--gold);
}
.fp-step-line {
  flex: 1; height: 1px; background: rgba(255,255,255,0.07);
  margin: 0 8px; position: relative; overflow: hidden;
}
.fp-step-line-fill {
  position: absolute; inset: 0; background: var(--gold);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.5s ease;
}
.fp-step-line-fill.filled { transform: scaleX(1); }
.fp-step-labels {
  display: flex; justify-content: space-between; margin-top: 8px;
  padding: 0 2px;
}
.fp-step-lbl {
  font-family: 'DM Mono', monospace; font-size: 9px;
  color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase;
  text-align: center; flex: 1;
}
.fp-step-lbl.active { color: var(--gold); }

/* Card header */
.fp-card-head {
  padding: 24px 32px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.fp-back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  font-family: 'Inter', sans-serif; font-size: 12px;
  color: var(--text-muted); margin-bottom: 16px;
  padding: 0; transition: color 0.2s;
}
.fp-back-btn:hover { color: var(--gold); }

.fp-step-icon {
  width: 52px; height: 52px; border-radius: 16px; margin-bottom: 16px;
  background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.25);
  display: flex; align-items: center; justify-content: center; color: var(--gold);
  transition: all 0.3s;
}
.fp-step-icon.success {
  background: rgba(74,222,128,0.1); border-color: rgba(74,222,128,0.3); color: #4ade80;
}
.fp-card-title {
  font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px;
}
.fp-card-sub { font-size: 13px; color: var(--text-dim); line-height: 1.6; }

/* Form body */
.fp-form { padding: 24px 32px 28px; display: flex; flex-direction: column; gap: 18px; }

/* Field */
.fp-field { display: flex; flex-direction: column; gap: 7px; }
.fp-label {
  font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500;
  color: rgba(212,175,55,0.65); text-transform: uppercase; letter-spacing: 0.18em;
}
.fp-input-wrap { position: relative; }
.fp-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  color: rgba(255,255,255,0.25); pointer-events: none; display: flex; align-items: center;
}
.fp-input {
  width: 100%; height: 48px; padding: 0 16px 0 42px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 13px; outline: none;
  font-family: 'Inter', sans-serif; font-size: 14px; color: #fff;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.fp-input::placeholder { color: rgba(255,255,255,0.2); }
.fp-input:focus {
  border-color: rgba(212,175,55,0.5); background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
}
.fp-input.error { border-color: rgba(239,68,68,0.6); }

/* Error / success message */
.fp-msg {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 11px 14px; border-radius: 11px;
  font-size: 13px; line-height: 1.5;
}
.fp-msg.err {
  color: #f87171; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
}
.fp-msg.suc {
  color: #4ade80; background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
}

/* OTP boxes */
.fp-otp-boxes { display: flex; gap: 10px; justify-content: center; }
.fp-otp-box {
  width: 52px; height: 58px; border-radius: 13px; text-align: center;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
  font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; color: #fff;
  outline: none; transition: all 0.15s;
}
.fp-otp-box:focus {
  border-color: rgba(212,175,55,0.55); background: rgba(255,255,255,0.09);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.1);
}
.fp-otp-box.filled {
  border-color: rgba(212,175,55,0.45); background: rgba(212,175,55,0.08); color: var(--gold);
}
.fp-otp-box.error { border-color: rgba(239,68,68,0.5); }
.fp-resend { text-align: center; font-size: 12px; color: var(--text-dim); margin-top: 4px; }
.fp-link {
  background: none; border: none; cursor: pointer;
  font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
  color: var(--gold); transition: color 0.2s; padding: 0;
}
.fp-link:hover { color: var(--gold-light); text-decoration: underline; }
.fp-link:disabled { opacity: 0.5; cursor: not-allowed; }

/* Submit button */
.fp-btn {
  height: 50px; width: 100%; border-radius: 13px; border: none; cursor: pointer;
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  color: #0a0b0f; font-family: 'Inter', sans-serif;
  font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.25s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 0 28px rgba(212,175,55,0.3);
  position: relative; overflow: hidden;
}
.fp-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(212,175,55,0.45); }
.fp-btn:active { transform: translateY(0); }
.fp-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

/* Success panel */
.fp-success-panel {
  margin: 4px 0 4px;
  padding: 20px; border-radius: 14px;
  background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.2);
  text-align: center;
}
.fp-success-panel p:first-child { font-size: 14px; font-weight: 600; color: #4ade80; margin-bottom: 6px; }
.fp-success-panel p:last-child { font-size: 12px; color: var(--text-dim); line-height: 1.6; }

/* Footer */
.fp-footer {
  text-align: center;
  font-family: 'DM Mono', monospace; font-size: 9px;
  color: var(--text-muted); letter-spacing: 0.1em;
}

/* Spinner */
.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Step transition */
.step-enter { animation: stepIn 0.35s cubic-bezier(.4,0,.2,1) both; }
@keyframes stepIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
`;

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

    const [username, setUsername] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const otpValue = useMemo(() => otp.join(""), [otp]);

    const clearErrors = () => setErrors({});
    const setFieldError = (key, msg) => setErrors(prev => ({ ...prev, [key]: msg }));

    const isLikelyEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const handleSendOTP = async (e) => {
        e.preventDefault(); clearErrors();
        const trimmed = username.trim();
        if (!trimmed) return setFieldError("username", "Vui lòng nhập email / tên đăng nhập");
        if (trimmed.includes("@") && !isLikelyEmail(trimmed)) return setFieldError("username", "Email không hợp lệ");
        setIsLoading(true);
        try {
            const res = await nguoiDungService.sendForgotPasswordOTP(trimmed);
            if (res?.status === 200) { setUsername(trimmed); setOtp(["", "", "", "", "", ""]); setStep(2); }
            else setFieldError("username", res?.message || "Gửi OTP thất bại");
        } catch (err) {
            setFieldError("username", err?.response?.data?.message || "Có lỗi xảy ra khi gửi OTP");
        } finally { setIsLoading(false); }
    };

    const handleGoStep3 = (e) => {
        e.preventDefault(); clearErrors();
        if (otpValue.length !== 6) return setFieldError("otp", "Vui lòng nhập đủ 6 số OTP");
        setStep(3);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault(); clearErrors();
        const trimmed = username.trim();
        if (!trimmed) return setFieldError("general", "Thiếu username/email");
        if (otpValue.length !== 6) return setFieldError("general", "Thiếu OTP");
        if (!newPassword) return setFieldError("newPassword", "Vui lòng nhập mật khẩu mới");
        if (newPassword.length < 6) return setFieldError("newPassword", "Mật khẩu tối thiểu 6 ký tự");
        if (newPassword !== confirmPassword) return setFieldError("confirmPassword", "Mật khẩu xác nhận không khớp");
        setIsLoading(true);
        try {
            const res = await nguoiDungService.resetPassword({ username: trimmed, otp: otpValue, password: newPassword });
            if (res?.status === 200) setStep(4);
            else setFieldError("general", res?.message || "Đặt lại mật khẩu thất bại");
        } catch (err) {
            setFieldError("general", err?.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu");
        } finally { setIsLoading(false); }
    };

    const handleResendOTP = async () => {
        clearErrors();
        const trimmed = username.trim();
        if (!trimmed) return setFieldError("general", "Vui lòng nhập email/username trước");
        setIsLoading(true);
        try {
            const res = await nguoiDungService.sendForgotPasswordOTP(trimmed);
            if (res?.status === 200) {
                setOtp(["", "", "", "", "", ""]);
                setFieldError("success", "OTP đã được gửi lại");
                setTimeout(() => setErrors({}), 2500);
            } else setFieldError("general", res?.message || "Gửi lại OTP thất bại");
        } catch (err) {
            setFieldError("general", err?.response?.data?.message || "Có lỗi xảy ra khi gửi lại OTP");
        } finally { setIsLoading(false); }
    };

    const handleOtpChange = (index, value) => {
        const v = value.replace(/\D/g, "").slice(0, 1);
        const next = [...otp]; next[index] = v; setOtp(next);
        if (v && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };
    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0)
            document.getElementById(`otp-${index - 1}`)?.focus();
    };

    /* Progress step state */
    const stepState = (s) => {
        if (s < step) return "done";
        if (s === step) return "active";
        return "";
    };

    const STEP_LABELS = ["Email", "OTP", "Mật khẩu"];
    const STEP_ICONS = {
        1: <Mail size={22} />,
        2: <Key size={22} />,
        3: <Lock size={22} />,
        4: <CheckCircle2 size={22} />,
    };
    const STEP_TITLES = {
        1: "Quên mật khẩu?",
        2: "Xác thực OTP",
        3: "Đặt mật khẩu mới",
        4: "Thành công!",
    };
    const STEP_SUBS = {
        1: "Nhập email hoặc tên đăng nhập để nhận mã OTP",
        2: "Nhập mã 6 số đã được gửi về email của bạn",
        3: "Nhập mật khẩu mới và xác nhận để hoàn tất",
        4: "Mật khẩu đã được đặt lại thành công",
    };

    return (
        <>
            <style>{STYLES}</style>
            <div className={`fp-root ${visible ? "visible" : ""}`}>
                <div className="fp-grid" />
                <div className="fp-orb-1" /><div className="fp-orb-2" />
                <div className="fp-corner-tl" /><div className="fp-corner-br" />

                <div className="fp-card-wrap">
                    {/* Brand */}
                    <div className="fp-brand">
                        <div className="fp-logo"><Boxes size={22} strokeWidth={1.5} /></div>
                        <div className="fp-brand-text">
                            <span>FS</span><span>WMS</span>
                        </div>
                    </div>

                    {/* Card */}
                    <div className="fp-card">
                        {/* Progress (hidden on step 4) */}
                        {step !== 4 && (
                            <div className="fp-progress-wrap">
                                <div className="fp-progress-steps">
                                    {[1, 2, 3].map((s, i) => (
                                        <React.Fragment key={s}>
                                            <div className="fp-step-item">
                                                <div className={`fp-step-dot ${stepState(s)}`}>
                                                    {s < step ? "✓" : s}
                                                </div>
                                            </div>
                                            {i < 2 && (
                                                <div className="fp-step-line">
                                                    <div className={`fp-step-line-fill ${step > s ? "filled" : ""}`} />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <div className="fp-step-labels">
                                    {STEP_LABELS.map((l, i) => (
                                        <div key={l} className={`fp-step-lbl ${i + 1 === step ? "active" : ""}`}>{l}</div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="fp-card-head">
                            {step !== 4 && (
                                <button type="button" className="fp-back-btn" onClick={() => step === 1 ? navigate("/login") : setStep(s => s - 1)}>
                                    <ArrowLeft size={13} /> Quay lại
                                </button>
                            )}
                            <div className={`fp-step-icon ${step === 4 ? "success" : ""}`}>
                                {STEP_ICONS[step]}
                            </div>
                            <div className="fp-card-title">{STEP_TITLES[step]}</div>
                            <div className="fp-card-sub">{STEP_SUBS[step]}</div>
                        </div>

                        {/* ─ STEP 1 ─ */}
                        {step === 1 && (
                            <form key="s1" className="fp-form step-enter" onSubmit={handleSendOTP}>
                                {errors.username && (
                                    <div className="fp-msg err"><AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{errors.username}</span></div>
                                )}
                                <div className="fp-field">
                                    <label className="fp-label">Email / Tên đăng nhập</label>
                                    <div className="fp-input-wrap">
                                        <span className="fp-icon"><Mail size={15} /></span>
                                        <input
                                            className={`fp-input ${errors.username ? "error" : ""}`}
                                            type="text" placeholder="example@gmail.com hoặc username"
                                            value={username}
                                            onChange={e => { setUsername(e.target.value); clearErrors(); }}
                                            autoComplete="username"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="fp-btn" disabled={isLoading}>
                                    {isLoading ? <><Loader2 size={16} className="spin" /> Đang gửi...</> : <>Gửi mã OTP <ArrowRight size={15} /></>}
                                </button>
                            </form>
                        )}

                        {/* ─ STEP 2 ─ */}
                        {step === 2 && (
                            <form key="s2" className="fp-form step-enter" onSubmit={handleGoStep3}>
                                {errors.general && <div className="fp-msg err"><AlertCircle size={14} style={{ flexShrink: 0 }} /><span>{errors.general}</span></div>}
                                {errors.success && <div className="fp-msg suc"><CheckCircle2 size={14} style={{ flexShrink: 0 }} /><span>{errors.success}</span></div>}
                                {errors.otp && <div className="fp-msg err"><AlertCircle size={14} style={{ flexShrink: 0 }} /><span>{errors.otp}</span></div>}

                                <div className="fp-field">
                                    <label className="fp-label">Mã OTP 6 số</label>
                                    <div className="fp-otp-boxes">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text" inputMode="numeric" maxLength={1}
                                                className={`fp-otp-box ${digit ? "filled" : ""} ${errors.otp ? "error" : ""}`}
                                                value={digit}
                                                onChange={e => handleOtpChange(index, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(index, e)}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                    <div className="fp-resend">
                                        Không nhận được mã?{" "}
                                        <button type="button" className="fp-link" onClick={handleResendOTP} disabled={isLoading}>
                                            Gửi lại OTP
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="fp-btn" disabled={isLoading || otpValue.length !== 6}>
                                    {isLoading ? <><Loader2 size={16} className="spin" /> Đang xử lý...</> : <>Tiếp tục <ArrowRight size={15} /></>}
                                </button>
                            </form>
                        )}

                        {/* ─ STEP 3 ─ */}
                        {step === 3 && (
                            <form key="s3" className="fp-form step-enter" onSubmit={handleResetPassword}>
                                {errors.general && <div className="fp-msg err"><AlertCircle size={14} style={{ flexShrink: 0 }} /><span>{errors.general}</span></div>}

                                <div className="fp-field">
                                    <label className="fp-label">Mật khẩu mới</label>
                                    <div className="fp-input-wrap">
                                        <span className="fp-icon"><Lock size={15} /></span>
                                        <input
                                            className={`fp-input ${errors.newPassword ? "error" : ""}`}
                                            type="password" placeholder="Tối thiểu 6 ký tự"
                                            value={newPassword}
                                            onChange={e => { setNewPassword(e.target.value); clearErrors(); }}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {errors.newPassword && <div className="fp-msg err" style={{ marginTop: 4 }}><AlertCircle size={13} /><span>{errors.newPassword}</span></div>}
                                </div>

                                <div className="fp-field">
                                    <label className="fp-label">Xác nhận mật khẩu</label>
                                    <div className="fp-input-wrap">
                                        <span className="fp-icon"><Lock size={15} /></span>
                                        <input
                                            className={`fp-input ${errors.confirmPassword ? "error" : ""}`}
                                            type="password" placeholder="Nhập lại mật khẩu mới"
                                            value={confirmPassword}
                                            onChange={e => { setConfirmPassword(e.target.value); clearErrors(); }}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    {errors.confirmPassword && <div className="fp-msg err" style={{ marginTop: 4 }}><AlertCircle size={13} /><span>{errors.confirmPassword}</span></div>}
                                </div>

                                <button type="submit" className="fp-btn" disabled={isLoading}>
                                    {isLoading ? <><Loader2 size={16} className="spin" /> Đang xử lý...</> : <>Đặt lại mật khẩu <ArrowRight size={15} /></>}
                                </button>
                            </form>
                        )}

                        {/* ─ STEP 4 ─ */}
                        {step === 4 && (
                            <div key="s4" className="fp-form step-enter">
                                <div className="fp-success-panel">
                                    <p>Mật khẩu đã được đặt lại thành công!</p>
                                    <p>Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.</p>
                                </div>
                                <button className="fp-btn" onClick={() => navigate("/login")}>
                                    Đăng nhập ngay <ArrowRight size={15} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="fp-footer">© 2026 FS FASHION GROUP · ALL RIGHTS RESERVED</div>
                </div>
            </div>
        </>
    );
}