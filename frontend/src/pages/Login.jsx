import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import {
    User, Lock, Mail, Phone, AlertCircle, Eye, EyeOff,
    Boxes, ShieldCheck, TrendingUp, Package, CheckCircle,
    ChevronRight, Loader2, ArrowRight,
} from "lucide-react";

/* ══════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
   Matches homepage.jsx aesthetic
══════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold:        #b8860b;
  --gold-rich:   #c9960c;
  --gold-light:  #e8b923;
  --gold-pale:   rgba(184,134,11,0.1);
  --gold-dim:    rgba(184,134,11,0.07);
  --ivory:       #faf8f3;
  --ivory-2:     #f5f2ea;
  --cream:       #f0ead8;
  --sand:        #e8dfc8;
  --text:        #1a1612;
  --text-2:      #3d3529;
  --text-dim:    #7a6e5f;
  --text-muted:  #a89f92;
  --border:      rgba(184,134,11,0.2);
  --border-soft: rgba(184,134,11,0.12);
}

.auth-root {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', system-ui, sans-serif;
  background: var(--ivory);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.auth-root.visible { opacity: 1; transform: translateY(0); }

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--ivory-2); }
::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.3); border-radius: 99px; }

/* ─── Animated grid (left panel) ─── */
.auth-grid-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(var(--gold-dim) 1px, transparent 1px),
    linear-gradient(90deg, var(--gold-dim) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: authGridDrift 30s linear infinite;
}
@keyframes authGridDrift { to { background-position: 56px 56px; } }

/* ─── LEFT PANEL ─── */
.auth-left {
  width: 480px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #faf8f3 0%, #f0ead8 60%, #e8dfc8 100%);
  border-right: 1px solid rgba(184,134,11,0.18);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px 48px;
}
@media (max-width: 960px) { .auth-left { display: none; } }

/* Corner decorations like homepage */
.auth-corner-tl, .auth-corner-br {
  position: absolute;
  width: 100px; height: 100px;
  border: 1.5px solid rgba(184,134,11,0.25);
}
.auth-corner-tl { top: 28px; left: 28px; border-right: none; border-bottom: none; }
.auth-corner-br { bottom: 28px; right: 28px; border-left: none; border-top: none; }

/* Orbs */
.auth-orb-1 {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: rgba(184,134,11,0.09); filter: blur(90px);
  top: -150px; right: -120px; pointer-events: none;
}
.auth-orb-2 {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: rgba(201,150,12,0.07); filter: blur(80px);
  bottom: -80px; left: -60px; pointer-events: none;
}

.auth-left-content {
  position: relative; z-index: 1;
  width: 100%; display: flex; flex-direction: column; gap: 36px;
}

/* Logo */
.al-logo {
  width: 54px; height: 54px; border-radius: 16px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 24px rgba(184,134,11,0.4);
}

/* Eyebrow */
.al-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; color: rgba(184,134,11,0.7);
  text-transform: uppercase; margin-bottom: 10px;
}

/* Title */
.al-title {
  font-family: 'Playfair Display', serif;
  font-size: 40px; font-weight: 900;
  color: var(--text); line-height: 1.05; letter-spacing: -1.5px;
  margin-bottom: 14px;
}
.al-title span { color: var(--gold); }

/* Description */
.al-desc {
  font-size: 14px; color: var(--text-dim);
  line-height: 1.75; max-width: 320px;
  font-family: 'DM Sans', sans-serif;
}

/* Feature cards */
.al-features { display: flex; flex-direction: column; gap: 10px; }
.al-feat {
  display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(184,134,11,0.15);
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(8px);
}
.al-feat:hover {
  background: rgba(255,255,255,0.85);
  border-color: rgba(184,134,11,0.3);
  box-shadow: 0 4px 16px rgba(100,80,30,0.1);
}
.al-feat-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  background: rgba(184,134,11,0.1);
  border: 1px solid rgba(184,134,11,0.18);
  display: flex; align-items: center; justify-content: center;
}
.al-feat-title {
  font-size: 13px; font-weight: 600;
  color: var(--text); margin-bottom: 2px;
  font-family: 'DM Sans', sans-serif;
}
.al-feat-desc {
  font-size: 12px; color: var(--text-dim); line-height: 1.5;
  font-family: 'DM Sans', sans-serif;
}

/* Security badge */
.al-badge {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: 'DM Mono', monospace; font-size: 11px;
  color: var(--text-muted); letter-spacing: 0.05em;
  padding: 8px 14px;
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(184,134,11,0.15);
  border-radius: 99px; width: fit-content;
}

/* ─── RIGHT PANEL ─── */
.auth-right {
  flex: 1;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 32px;
  position: relative;
  background-image:
    radial-gradient(circle at 80% 10%, rgba(184,134,11,0.05) 0%, transparent 50%),
    radial-gradient(circle at 15% 90%, rgba(201,150,12,0.04) 0%, transparent 50%);
}

.auth-form-wrap {
  width: 100%; max-width: 440px;
  display: flex; flex-direction: column; gap: 22px;
}

/* Brand header for right panel */
.auth-right-brand {
  display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
}
.auth-right-brand-logo {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 12px rgba(184,134,11,0.35);
}
.auth-right-brand-name {
  font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800;
}
.auth-right-brand-name .gold { color: #b8860b; }
.auth-right-brand-name .tag {
  color: var(--text-dim); font-weight: 500; font-size: 12px;
  margin-left: 6px; font-family: 'DM Mono', monospace; letter-spacing: 0.08em;
}

/* Tab switcher */
.auth-tabs {
  display: flex;
  background: var(--ivory-2);
  border: 1px solid var(--border-soft);
  border-radius: 14px; padding: 4px;
}
.auth-tab {
  flex: 1; padding: 10px 0; border-radius: 11px; border: none;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.25s;
  background: transparent; color: var(--text-muted);
}
.auth-tab.active {
  background: #fff;
  color: var(--gold);
  border: 1px solid var(--border);
  box-shadow: 0 2px 12px rgba(100,80,30,0.1);
}

/* Card */
.auth-card {
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(100,80,30,0.1), 0 0 0 1px rgba(184,134,11,0.05);
}
/* Gold top accent line */
.auth-card::before {
  content: ''; display: block; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

.auth-card-header {
  padding: 26px 30px 20px;
  border-bottom: 1px solid rgba(184,134,11,0.08);
  background: linear-gradient(180deg, rgba(184,134,11,0.03) 0%, transparent 100%);
}
.auth-card-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.5px;
}
.auth-card-sub {
  font-size: 13px; color: var(--text-muted); margin-top: 5px;
  line-height: 1.5; font-family: 'DM Sans', sans-serif;
}

.auth-form {
  padding: 24px 30px 28px;
  display: flex; flex-direction: column; gap: 16px;
}

/* Field */
.af-field { display: flex; flex-direction: column; gap: 6px; }
.af-label {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
  color: rgba(184,134,11,0.75); text-transform: uppercase; letter-spacing: 0.18em;
}

.af-input-wrap { position: relative; }
.af-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); pointer-events: none;
  display: flex; align-items: center;
}

.af-input {
  width: 100%; height: 46px; padding: 0 14px 0 40px;
  background: var(--ivory);
  border: 1.5px solid rgba(184,134,11,0.18);
  border-radius: 12px; outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text);
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.af-input::placeholder { color: var(--text-muted); }
.af-input:focus {
  border-color: var(--gold);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(184,134,11,0.1);
}
.af-input:disabled { opacity: 0.5; cursor: not-allowed; }
.af-input.error { border-color: rgba(220,38,38,0.5); background: rgba(220,38,38,0.03); }
.af-input-no-icon { padding-left: 14px; }

.af-eye {
  position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 0;
  display: flex; align-items: center; transition: color 0.2s;
}
.af-eye:hover { color: var(--gold); }

/* Readonly field */
.af-readonly {
  background: var(--ivory-2) !important;
  color: var(--text-muted) !important;
  cursor: default !important;
  border-style: dashed !important;
  border-color: rgba(184,134,11,0.15) !important;
}

/* Error message */
.af-error-msg {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #dc2626;
  padding: 8px 12px;
  background: rgba(220,38,38,0.06);
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
}

/* Remember + forgot row */
.af-row { display: flex; align-items: center; justify-content: space-between; }
.af-checkbox-wrap { display: flex; align-items: center; gap: 8px; }
.af-checkbox {
  width: 16px; height: 16px; border-radius: 5px;
  accent-color: var(--gold); cursor: pointer;
}
.af-checkbox-label {
  font-size: 13px; color: var(--text-dim); cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.af-link {
  background: none; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  color: var(--gold); transition: color 0.2s;
}
.af-link:hover { color: var(--gold-rich); text-decoration: underline; }

/* Submit button */
.af-btn {
  height: 48px; width: 100%; border-radius: 12px; border: none; cursor: pointer;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.25s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 4px 20px rgba(184,134,11,0.35);
  position: relative; overflow: hidden;
}
.af-btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0; transition: opacity 0.25s;
}
.af-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(184,134,11,0.5);
}
.af-btn:hover::after { opacity: 1; }
.af-btn:active { transform: translateY(0); }
.af-btn:disabled {
  opacity: 0.5; cursor: not-allowed;
  transform: none; box-shadow: none;
}

/* Divider */
.af-divider {
  display: flex; align-items: center; gap: 12px;
  font-size: 11px; color: var(--text-muted);
  font-family: 'DM Mono', monospace; letter-spacing: 0.08em; text-transform: uppercase;
}
.af-divider::before, .af-divider::after {
  content: ''; flex: 1; height: 1px;
  background: rgba(184,134,11,0.15);
}

/* Alert */
.af-alert-general {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; font-size: 13px; color: #dc2626;
  background: rgba(220,38,38,0.06);
  border: 1px solid rgba(220,38,38,0.2);
  border-radius: 11px; line-height: 1.5;
  font-family: 'DM Sans', sans-serif;
}

/* Footer */
.auth-footer {
  text-align: center; font-size: 13px;
  color: var(--text-dim); font-family: 'DM Sans', sans-serif;
}
.auth-footer-copy {
  text-align: center;
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: var(--text-muted); letter-spacing: 0.08em;
}

/* Spinner */
.spin { animation: spinAnim 0.9s linear infinite; }
@keyframes spinAnim { to { transform: rotate(360deg); } }
`;

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */
export default function AuthPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("access_token")) navigate("/products");
    }, []);

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => { setTimeout(() => setVisible(true), 60); }, []);

    const [loginData, setLoginData] = useState({ username: '', matKhau: '' });
    const [registerData, setRegisterData] = useState({
        tenDangNhap: '', matKhau: '', xacNhanMatKhau: '', hoTen: '', email: '', soDienThoai: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validateRegister = () => {
        const e = {};
        if (!registerData.matKhau) e.matKhau = 'Vui lòng nhập mật khẩu';
        else if (registerData.matKhau.length < 6) e.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
        if (!registerData.xacNhanMatKhau) e.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
        else if (registerData.matKhau !== registerData.xacNhanMatKhau) e.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
        if (!registerData.hoTen) e.hoTen = 'Vui lòng nhập họ và tên';
        else if (registerData.hoTen.length < 6 || registerData.hoTen.length > 100) e.hoTen = 'Họ tên phải từ 6–100 ký tự';
        if (!registerData.email) e.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) e.email = 'Email không hợp lệ';
        if (!registerData.soDienThoai) e.soDienThoai = 'Vui lòng nhập số điện thoại';
        else if (registerData.soDienThoai.length < 10 || registerData.soDienThoai.length > 11) e.soDienThoai = 'Số điện thoại phải từ 10–11 ký tự';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault(); setIsLoading(true); setErrors({});
        try {
            if (!loginData.username || !loginData.matKhau) {
                setErrors({ general: 'Vui lòng điền đầy đủ thông tin đăng nhập' });
                return;
            }
            const response = await nguoiDungService.login({ username: loginData.username, password: loginData.matKhau });
            if (response?.status === 200) {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const decoded = jwtDecode(token);
                    const role = decoded.scope || decoded.vaiTro || decoded.role || decoded.authorities;
                    localStorage.setItem('role', role);
                    const warehouseId = decoded.khoId || decoded.warehouseId;
                    if (warehouseId) localStorage.setItem('selected_kho_id', warehouseId);
                    navigate('/dashboard');
                } else navigate('/');
            } else setErrors({ general: response.message || 'Đăng nhập thất bại' });
        } catch (error) {
            setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập' });
        } finally { setIsLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateRegister()) return;
        setIsLoading(true);
        try {
            const response = await nguoiDungService.register({
                tenDangNhap: registerData.tenDangNhap,
                matKhau: registerData.matKhau,
                hoTen: registerData.hoTen,
                email: registerData.email,
                soDienThoai: registerData.soDienThoai,
            });
            if (response?.status === 200) {
                navigate(`/verify-email?email=${encodeURIComponent(registerData.email)}`);
            } else setErrors({ general: response.message || 'Đăng ký thất bại' });
        } catch (error) {
            setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký' });
        } finally { setIsLoading(false); }
    };

    const switchTab = (login) => { setIsLogin(login); setErrors({}); };

    return (
        <>
            <style>{STYLES}</style>
            <div className={`auth-root ${visible ? 'visible' : ''}`}>

                {/* ── LEFT PANEL ── */}
                <div className="auth-left">
                    <div className="auth-grid-bg" />
                    <div className="auth-corner-tl" />
                    <div className="auth-corner-br" />
                    <div className="auth-orb-1" />
                    <div className="auth-orb-2" />

                    <div className="auth-left-content">
                        {/* Logo */}
                        <div className="al-logo">
                            <Boxes size={26} strokeWidth={1.8} style={{ color: '#fff' }} />
                        </div>

                        {/* Brand text */}
                        <div>
                            <div className="al-eyebrow">Fashion Warehouse System</div>
                            <h1 className="al-title">
                                <span>FS</span> WMS
                            </h1>
                            <p className="al-desc">
                                Nền tảng quản lý kho thời trang thông minh — kiểm soát toàn bộ chuỗi cung ứng với AI và dashboard real-time.
                            </p>
                        </div>

                        {/* Feature cards */}
                        <div className="al-features">
                            {[
                                {
                                    icon: <TrendingUp size={16} style={{ color: '#b8860b' }} />,
                                    title: 'Dashboard real-time',
                                    desc: 'Theo dõi tồn kho và doanh thu theo từng giây'
                                },
                                {
                                    icon: <Package size={16} style={{ color: '#2563eb' }} />,
                                    title: 'Quản lý đơn hàng',
                                    desc: 'Từ nhập kho đến xuất hàng, không bỏ sót gì'
                                },
                                {
                                    icon: <CheckCircle size={16} style={{ color: '#16a34a' }} />,
                                    title: 'AI dự báo tồn kho',
                                    desc: 'Cảnh báo thông minh trước khi hết hàng'
                                },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className="al-feat">
                                    <div className="al-feat-icon">{icon}</div>
                                    <div>
                                        <p className="al-feat-title">{title}</p>
                                        <p className="al-feat-desc">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Security badge */}
                        <div className="al-badge">
                            <ShieldCheck size={13} style={{ color: '#16a34a' }} />
                            Bảo mật 256-bit TLS · ISO 27001
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="auth-right">
                    <div className="auth-form-wrap">

                        {/* Mobile brand (hidden on desktop via left panel) */}
                        <div className="auth-right-brand">
                            <div className="auth-right-brand-logo">
                                <Boxes size={18} strokeWidth={1.8} style={{ color: '#fff' }} />
                            </div>
                            <div className="auth-right-brand-name">
                                <span className="gold">FS</span>
                                <span className="tag">WMS</span>
                            </div>
                        </div>

                        {/* Tab switcher */}
                        <div className="auth-tabs">
                            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => switchTab(true)}>
                                Đăng nhập
                            </button>
                            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => switchTab(false)}>
                                Đăng ký
                            </button>
                        </div>

                        {/* Card */}
                        <div className="auth-card">
                            <div className="auth-card-header">
                                <h2 className="auth-card-title">
                                    {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
                                </h2>
                                <p className="auth-card-sub">
                                    {isLogin
                                        ? 'Đăng nhập vào hệ thống FS WMS'
                                        : 'Điền đầy đủ thông tin để bắt đầu'}
                                </p>
                            </div>

                            {isLogin ? (
                                /* ─ LOGIN FORM ─ */
                                <form className="auth-form" onSubmit={handleLogin}>
                                    {errors.general && (
                                        <div className="af-alert-general">
                                            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <span>{errors.general}</span>
                                        </div>
                                    )}

                                    <div className="af-field">
                                        <label className="af-label">Tên đăng nhập / Email / SĐT</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><User size={15} /></span>
                                            <input
                                                className={`af-input ${errors.username ? 'error' : ''}`}
                                                type="text"
                                                placeholder="Nhập tên đăng nhập, email hoặc SĐT"
                                                value={loginData.username}
                                                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="af-field">
                                        <label className="af-label">Mật khẩu</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><Lock size={15} /></span>
                                            <input
                                                className="af-input"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={loginData.matKhau}
                                                onChange={e => setLoginData({ ...loginData, matKhau: e.target.value })}
                                                style={{ paddingRight: 44 }}
                                            />
                                            <button type="button" className="af-eye" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="af-row">
                                        <div className="af-checkbox-wrap">
                                            <input
                                                type="checkbox" id="remember" className="af-checkbox"
                                                checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                                            />
                                            <label htmlFor="remember" className="af-checkbox-label">Ghi nhớ đăng nhập</label>
                                        </div>
                                        <button type="button" className="af-link" onClick={() => navigate('/forgot-password')}>
                                            Quên mật khẩu?
                                        </button>
                                    </div>

                                    <button type="submit" className="af-btn" disabled={isLoading}>
                                        {isLoading
                                            ? <><Loader2 size={16} className="spin" /> Đang xử lý...</>
                                            : <>Đăng nhập <ArrowRight size={15} /></>}
                                    </button>
                                </form>
                            ) : (
                                /* ─ REGISTER FORM ─ */
                                <form className="auth-form" onSubmit={handleRegister}>
                                    {errors.general && (
                                        <div className="af-alert-general">
                                            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                                            <span>{errors.general}</span>
                                        </div>
                                    )}

                                    <div className="af-field">
                                        <label className="af-label">Tên đăng nhập</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><User size={15} /></span>
                                            <input
                                                className="af-input af-readonly"
                                                type="text"
                                                placeholder="Tự động tạo từ email"
                                                value={registerData.tenDangNhap}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="af-field">
                                        <label className="af-label">Họ và tên *</label>
                                        <div className="af-input-wrap">
                                            <input
                                                className={`af-input af-input-no-icon ${errors.hoTen ? 'error' : ''}`}
                                                type="text" placeholder="Nguyễn Văn A (6–100 ký tự)"
                                                value={registerData.hoTen}
                                                onChange={e => setRegisterData({ ...registerData, hoTen: e.target.value })}
                                            />
                                        </div>
                                        {errors.hoTen && <div className="af-error-msg"><AlertCircle size={13} />{errors.hoTen}</div>}
                                    </div>

                                    <div className="af-field">
                                        <label className="af-label">Email *</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><Mail size={15} /></span>
                                            <input
                                                className={`af-input ${errors.email ? 'error' : ''}`}
                                                type="email" placeholder="example@email.com"
                                                value={registerData.email}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setRegisterData({ ...registerData, email: val, tenDangNhap: val.split('@')[0] });
                                                }}
                                            />
                                        </div>
                                        {errors.email && <div className="af-error-msg"><AlertCircle size={13} />{errors.email}</div>}
                                    </div>

                                    <div className="af-field">
                                        <label className="af-label">Số điện thoại *</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><Phone size={15} /></span>
                                            <input
                                                className={`af-input ${errors.soDienThoai ? 'error' : ''}`}
                                                type="text" placeholder="10–11 ký tự"
                                                value={registerData.soDienThoai}
                                                onChange={e => setRegisterData({ ...registerData, soDienThoai: e.target.value })}
                                            />
                                        </div>
                                        {errors.soDienThoai && <div className="af-error-msg"><AlertCircle size={13} />{errors.soDienThoai}</div>}
                                    </div>

                                    <div className="af-divider">Bảo mật tài khoản</div>

                                    <div className="af-field">
                                        <label className="af-label">Mật khẩu *</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><Lock size={15} /></span>
                                            <input
                                                className={`af-input ${errors.matKhau ? 'error' : ''}`}
                                                type="password" placeholder="Tối thiểu 6 ký tự"
                                                value={registerData.matKhau}
                                                onChange={e => setRegisterData({ ...registerData, matKhau: e.target.value })}
                                            />
                                        </div>
                                        {errors.matKhau && <div className="af-error-msg"><AlertCircle size={13} />{errors.matKhau}</div>}
                                    </div>

                                    <div className="af-field">
                                        <label className="af-label">Xác nhận mật khẩu *</label>
                                        <div className="af-input-wrap">
                                            <span className="af-icon"><Lock size={15} /></span>
                                            <input
                                                className={`af-input ${errors.xacNhanMatKhau ? 'error' : ''}`}
                                                type="password" placeholder="Nhập lại mật khẩu"
                                                value={registerData.xacNhanMatKhau}
                                                onChange={e => setRegisterData({ ...registerData, xacNhanMatKhau: e.target.value })}
                                            />
                                        </div>
                                        {errors.xacNhanMatKhau && <div className="af-error-msg"><AlertCircle size={13} />{errors.xacNhanMatKhau}</div>}
                                    </div>

                                    <button type="submit" className="af-btn" disabled={isLoading}>
                                        {isLoading
                                            ? <><Loader2 size={16} className="spin" /> Đang xử lý...</>
                                            : <>Tạo tài khoản <ChevronRight size={15} /></>}
                                    </button>
                                </form>
                            )}
                        </div>

                        <p className="auth-footer">
                            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
                            <button className="af-link" onClick={() => switchTab(!isLogin)}>
                                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                            </button>
                        </p>
                        <p className="auth-footer-copy">© 2026 FS FASHION GROUP · ALL RIGHTS RESERVED</p>
                    </div>
                </div>

            </div>
        </>
    );
}