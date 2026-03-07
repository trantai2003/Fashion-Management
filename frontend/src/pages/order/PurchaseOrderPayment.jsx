import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    Copy,
    CreditCard,
    Loader2,
    RefreshCw,
    Banknote,
    ShieldCheck,
    Clock,
    AlertTriangle,
    Wallet,
    Hash,
    QrCode,
} from "lucide-react";

/* ─────────────────────────────────────────────
   MOCK SERVICE  (thay bằng service thật)
───────────────────────────────────────────── */
const paymentService = {
    getGiaoDich: async (id) => {
        await new Promise((r) => setTimeout(r, 900));
        return {
            status: 200,
            data: {
                soDonMua: 'PO2024030003',
                maGiaoDich: 'tran_PO2024030003',
                nganHang: 'Vietcombank',
                soNganHang: '1234567890123',
                tenNhaCungCap: 'Công ty Trung Quốc',
                tenKho: 'Kho Hà Nội',
                tongTien: 15_000_000,
            },
        };
    },
    kiemTraThanhToan: async (id) => {
        await new Promise((r) => setTimeout(r, 1200));
        // Simulate 50/50 success for demo
        if (Math.random() > 0.5) return { status: 200, data: 'Success' };
        throw new Error('Chưa thanh toán');
    },
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatCurrency = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const BANK_LOGOS = {
    Vietcombank: '🏦',
    Techcombank: '🏦',
    BIDV: '🏦',
    VietinBank: '🏦',
};

/* ─────────────────────────────────────────────
   COPY BADGE
───────────────────────────────────────────── */
function CopyField({ label, value, mono = false }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="group flex flex-col gap-1">
            <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#94a3b8' }}>
                {label}
            </span>
            <div
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
                onClick={copy}
            >
                <span
                    style={{
                        fontFamily: mono ? '"JetBrains Mono", "Fira Mono", monospace' : 'inherit',
                        fontSize: mono ? 15 : 14,
                        color: '#e2e8f0',
                        fontWeight: mono ? 600 : 400,
                        letterSpacing: mono ? '0.05em' : 'normal',
                    }}
                >
                    {value}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        color: copied ? '#34d399' : '#64748b',
                        transition: 'color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {copied ? (
                        <>
                            <CheckCircle2 size={14} /> Đã sao chép
                        </>
                    ) : (
                        <>
                            <Copy size={14} /> Sao chép
                        </>
                    )}
                </span>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ANIMATED STEP INDICATOR
───────────────────────────────────────────── */
function Steps({ current }) {
    const steps = ['Xem thông tin', 'Chuyển khoản', 'Xác nhận'];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {steps.map((s, i) => (
                <React.Fragment key={i}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                transition: 'all 0.35s ease',
                                background:
                                    i < current
                                        ? 'linear-gradient(135deg,#10b981,#059669)'
                                        : i === current
                                            ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                                            : 'rgba(255,255,255,0.08)',
                                color: i <= current ? '#fff' : '#475569',
                                boxShadow: i === current ? '0 0 18px rgba(139,92,246,0.5)' : 'none',
                                border: i === current ? '2px solid rgba(139,92,246,0.4)' : '2px solid transparent',
                            }}
                        >
                            {i < current ? <CheckCircle2 size={15} /> : i + 1}
                        </div>
                        <span
                            style={{
                                fontSize: 11,
                                color: i <= current ? '#e2e8f0' : '#475569',
                                fontWeight: i === current ? 600 : 400,
                                letterSpacing: '0.02em',
                                textAlign: 'center',
                            }}
                        >
                            {s}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            style={{
                                flex: 1,
                                height: 2,
                                marginBottom: 20,
                                background:
                                    i < current
                                        ? 'linear-gradient(90deg,#10b981,#059669)'
                                        : 'rgba(255,255,255,0.08)',
                                transition: 'background 0.4s ease',
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   QR PLACEHOLDER (VietQR style)
───────────────────────────────────────────── */
function QRCode({ value }) {
    // Render a static SVG grid as QR placeholder
    const cells = 21;
    const size = 168;
    const cell = size / cells;
    const pattern = Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) => {
            // corner squares
            if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) return 1;
            // random data
            return ((r * 31 + c * 17 + r + c) % 3 === 0) ? 1 : 0;
        })
    );
    return (
        <svg width={size} height={size} style={{ borderRadius: 12 }}>
            <rect width={size} height={size} fill="white" rx={12} />
            {pattern.flatMap((row, r) =>
                row.map((v, c) =>
                    v ? (
                        <rect
                            key={`${r}-${c}`}
                            x={c * cell + 1}
                            y={r * cell + 1}
                            width={cell - 1}
                            height={cell - 1}
                            fill="#1e293b"
                            rx={1}
                        />
                    ) : null
                )
            )}
        </svg>
    );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function PurchaseOrderPayment() {
    const navigate = useNavigate();
    const { id } = useParams() || { id: '8' };

    const [step, setStep] = useState(0); // 0=info, 1=transfer, 2=confirm
    const [giaoDich, setGiaoDich] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // null | 'success' | 'pending'
    const [timer, setTimer] = useState(300); // 5 min countdown
    const intervalRef = useRef(null);

    useEffect(() => {
        loadGiaoDich();
    }, []);

    useEffect(() => {
        if (step === 1) {
            intervalRef.current = setInterval(() => {
                setTimer((t) => {
                    if (t <= 1) {
                        clearInterval(intervalRef.current);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(intervalRef.current);
    }, [step]);

    const loadGiaoDich = async () => {
        setLoading(true);
        try {
            const res = await paymentService.getGiaoDich(id);
            if (res.status === 200) setGiaoDich(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckPayment = async () => {
        setChecking(true);
        try {
            await paymentService.kiemTraThanhToan(id);
            setPaymentStatus('success');
            setStep(2);
            clearInterval(intervalRef.current);
        } catch {
            setPaymentStatus('pending');
        } finally {
            setChecking(false);
        }
    };

    const timerStr = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    /* ── STYLES ── */
    const root = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        fontFamily: '"Outfit", "DM Sans", sans-serif',
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
    };

    const glow = {
        position: 'absolute',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
    };

    const glass = {
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    };

    /* ── LOADING ── */
    if (loading) {
        return (
            <div style={{ ...root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#e2e8f0' }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            border: '3px solid rgba(139,92,246,0.3)',
                            borderTop: '3px solid #8b5cf6',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <p style={{ color: '#94a3b8', fontSize: 14 }}>Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    /* ── SUCCESS SCREEN ── */
    if (step === 2 && paymentStatus === 'success') {
        return (
            <div style={{ ...root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ ...glow, width: 400, height: 400, background: 'rgba(16,185,129,0.15)', top: '10%', left: '30%' }} />
                <div style={{ ...glass, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center' }}>
                    <div
                        style={{
                            width: 96,
                            height: 96,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            boxShadow: '0 0 40px rgba(16,185,129,0.4)',
                            animation: 'pop 0.4s ease',
                        }}
                    >
                        <style>{`@keyframes pop{0%{transform:scale(0.5);opacity:0}100%{transform:scale(1);opacity:1}}`}</style>
                        <CheckCircle2 size={48} color="white" />
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ecfdf5', marginBottom: 8 }}>
                        Thanh toán thành công!
                    </h2>
                    <p style={{ color: '#6ee7b7', fontSize: 14, marginBottom: 32 }}>
                        Giao dịch <strong>{giaoDich?.maGiaoDich}</strong> đã được xác nhận
                    </p>
                    <div
                        style={{
                            background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: 16,
                            padding: '20px 24px',
                            marginBottom: 32,
                            textAlign: 'left',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>Đơn hàng</span>
                            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 13 }}>{giaoDich?.soDonMua}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8', fontSize: 13 }}>Số tiền</span>
                            <span style={{ color: '#34d399', fontWeight: 700, fontSize: 18 }}>
                                {formatCurrency(giaoDich?.tongTien)}
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/purchase-orders')}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg,#10b981,#059669)',
                            color: '#fff',
                            fontWeight: 600,
                            padding: '12px',
                            borderRadius: 12,
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Quay về danh sách đơn hàng
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={root}>
            {/* Background glows */}
            <div style={{ ...glow, width: 500, height: 500, background: 'rgba(99,102,241,0.12)', top: -100, right: -100 }} />
            <div style={{ ...glow, width: 400, height: 400, background: 'rgba(139,92,246,0.1)', bottom: -100, left: -50 }} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
            `}</style>

            <div style={{ maxWidth: 860, margin: '0 auto' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#94a3b8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        marginBottom: 24,
                        transition: 'color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#e2e8f0')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                    <ArrowLeft size={16} />
                    Quay lại chi tiết đơn hàng
                </button>

                {/* Title */}
                <div style={{ marginBottom: 32 }}>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 800,
                            color: '#f8fafc',
                            letterSpacing: '-0.02em',
                            marginBottom: 6,
                        }}
                    >
                        Thanh toán đơn hàng
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        Mã đơn:{' '}
                        <span
                            style={{
                                color: '#818cf8',
                                fontWeight: 600,
                                fontFamily: 'monospace',
                            }}
                        >
                            {giaoDich?.soDonMua}
                        </span>
                    </p>
                </div>

                {/* Steps */}
                <div style={{ ...glass, padding: '20px 32px', marginBottom: 24 }}>
                    <Steps current={step} />
                </div>

                {/* STEP 0: Info overview */}
                {step === 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Order Summary */}
                        <div style={{ ...glass, padding: 28, gridColumn: '1 / -1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Wallet size={20} color="white" />
                                    </div>
                                    <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, margin: 0 }}>
                                        Tóm tắt thanh toán
                                    </h3>
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        color: '#fbbf24',
                                        background: 'rgba(251,191,36,0.1)',
                                        border: '1px solid rgba(251,191,36,0.2)',
                                        padding: '4px 12px',
                                        borderRadius: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <Clock size={12} /> Chờ thanh toán
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 16,
                                    marginBottom: 24,
                                }}
                            >
                                {[
                                    { label: 'Nhà cung cấp', value: giaoDich?.tenNhaCungCap, icon: <Building2 size={16} /> },
                                    { label: 'Kho nhập', value: giaoDich?.tenKho, icon: <Wallet size={16} /> },
                                    { label: 'Mã giao dịch', value: giaoDich?.maGiaoDich, icon: <Hash size={16} />, mono: true },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: 16,
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                color: '#64748b',
                                                fontSize: 11,
                                                letterSpacing: '0.06em',
                                                textTransform: 'uppercase',
                                                marginBottom: 8,
                                            }}
                                        >
                                            {item.icon} {item.label}
                                        </div>
                                        <p
                                            style={{
                                                color: '#e2e8f0',
                                                fontWeight: 600,
                                                fontSize: item.mono ? 13 : 14,
                                                fontFamily: item.mono ? 'monospace' : 'inherit',
                                                margin: 0,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '20px 24px',
                                    borderRadius: 16,
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                                    border: '1px solid rgba(139,92,246,0.25)',
                                }}
                            >
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        Tổng số tiền cần thanh toán
                                    </p>
                                    <p style={{ fontSize: 32, fontWeight: 800, color: '#c4b5fd', margin: 0, letterSpacing: '-0.02em' }}>
                                        {formatCurrency(giaoDich?.tongTien)}
                                    </p>
                                </div>
                                <CreditCard size={48} style={{ color: 'rgba(139,92,246,0.4)' }} />
                            </div>
                        </div>

                        {/* Bank info preview */}
                        <div style={{ ...glass, padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Banknote size={20} color="white" />
                                </div>
                                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, margin: 0 }}>
                                    Thông tin ngân hàng
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {[
                                    { label: 'Ngân hàng', value: giaoDich?.nganHang },
                                    { label: 'Số tài khoản', value: giaoDich?.soNganHang, mono: true },
                                    { label: 'Tên thụ hưởng', value: giaoDich?.tenNhaCungCap },
                                ].map((f, i) => (
                                    <CopyField key={i} label={f.label} value={f.value} mono={f.mono} />
                                ))}
                            </div>
                        </div>

                        {/* Security note */}
                        <div style={{ ...glass, padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        background: 'linear-gradient(135deg,#10b981,#059669)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <ShieldCheck size={20} color="white" />
                                </div>
                                <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, margin: 0 }}>
                                    Lưu ý thanh toán
                                </h3>
                            </div>
                            {[
                                'Nhập đúng nội dung chuyển khoản để hệ thống tự xác nhận',
                                'Chuyển đúng số tiền như hiển thị để tránh sai lệch',
                                'Giao dịch sẽ hết hạn sau 5 phút kể từ khi bắt đầu',
                                'Liên hệ quản trị viên nếu gặp sự cố thanh toán',
                            ].map((note, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 10,
                                        padding: '10px 0',
                                        borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    }}
                                >
                                    <div
                                        style={{
                                            minWidth: 20,
                                            height: 20,
                                            borderRadius: '50%',
                                            background: 'rgba(16,185,129,0.2)',
                                            border: '1px solid rgba(16,185,129,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 11,
                                            color: '#34d399',
                                            fontWeight: 700,
                                            marginTop: 1,
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{note}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    color: '#94a3b8',
                                    borderRadius: 12,
                                    padding: '10px 24px',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    fontSize: 14,
                                }}
                            >
                                Hủy
                            </Button>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    padding: '12px 32px',
                                    borderRadius: 12,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(99,102,241,0.45)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.35)';
                                }}
                            >
                                <CreditCard size={16} />
                                Tiến hành thanh toán
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: Transfer */}
                {step === 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
                        {/* Left: transfer details */}
                        <div style={{ ...glass, padding: 32 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                                <div>
                                    <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 18, margin: '0 0 4px' }}>
                                        Chuyển khoản ngân hàng
                                    </h3>
                                    <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                                        Sao chép thông tin và thực hiện chuyển khoản
                                    </p>
                                </div>
                                {/* Countdown */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 16px',
                                        borderRadius: 20,
                                        background: timer < 60 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                                        border: `1px solid ${timer < 60 ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.3)'}`,
                                        color: timer < 60 ? '#f87171' : '#fbbf24',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        fontFamily: 'monospace',
                                    }}
                                >
                                    <Clock size={14} />
                                    {timerStr}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                                <CopyField label="Ngân hàng thụ hưởng" value={giaoDich?.nganHang} />
                                <CopyField label="Số tài khoản" value={giaoDich?.soNganHang} mono />
                                <CopyField label="Tên tài khoản" value={giaoDich?.tenNhaCungCap} />
                                <CopyField
                                    label="Nội dung chuyển khoản"
                                    value={giaoDich?.maGiaoDich}
                                    mono
                                />
                            </div>

                            {/* Amount highlight */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '18px 24px',
                                    borderRadius: 16,
                                    background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))',
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    marginBottom: 28,
                                }}
                            >
                                <div>
                                    <p style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                                        Số tiền chuyển khoản
                                    </p>
                                    <p style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 28, margin: 0, letterSpacing: '-0.02em' }}>
                                        {formatCurrency(giaoDich?.tongTien)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard?.writeText(String(giaoDich?.tongTien))}
                                    style={{
                                        background: 'rgba(139,92,246,0.2)',
                                        border: '1px solid rgba(139,92,246,0.3)',
                                        color: '#c4b5fd',
                                        padding: '8px 16px',
                                        borderRadius: 10,
                                        cursor: 'pointer',
                                        fontSize: 12,
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <Copy size={12} /> Sao chép
                                </button>
                            </div>

                            {/* Warning */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    padding: '14px 16px',
                                    borderRadius: 12,
                                    background: 'rgba(251,191,36,0.07)',
                                    border: '1px solid rgba(251,191,36,0.2)',
                                }}
                            >
                                <AlertTriangle size={18} style={{ color: '#fbbf24', minWidth: 18, marginTop: 1 }} />
                                <p style={{ color: '#d97706', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                                    Vui lòng nhập <strong>đúng nội dung chuyển khoản</strong> để hệ thống tự động xác nhận.
                                    Sai nội dung có thể dẫn đến chậm trễ xử lý đơn.
                                </p>
                            </div>
                        </div>

                        {/* Right: QR + check */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* QR */}
                            <div
                                style={{
                                    ...glass,
                                    padding: 24,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 16,
                                    flex: 1,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
                                    <QrCode size={16} style={{ color: '#818cf8' }} />
                                    <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Quét mã QR</span>
                                </div>
                                <div
                                    style={{
                                        padding: 12,
                                        borderRadius: 20,
                                        background: 'rgba(255,255,255,0.95)',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    <QRCode value={`${giaoDich?.soNganHang}|${giaoDich?.tongTien}|${giaoDich?.maGiaoDich}`} />
                                </div>
                                <p style={{ color: '#475569', fontSize: 12, textAlign: 'center', margin: 0 }}>
                                    Dùng app ngân hàng quét mã<br />để thanh toán nhanh
                                </p>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: '#64748b',
                                        background: 'rgba(255,255,255,0.04)',
                                        padding: '6px 14px',
                                        borderRadius: 20,
                                        border: '1px solid rgba(255,255,255,0.08)',
                                    }}
                                >
                                    {giaoDich?.nganHang} VietQR
                                </div>
                            </div>

                            {/* Check payment */}
                            <div style={{ ...glass, padding: 24 }}>
                                <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
                                    Sau khi hoàn tất chuyển khoản, nhấn xác nhận để kiểm tra giao dịch.
                                </p>
                                {paymentStatus === 'pending' && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: 10,
                                            padding: '12px 14px',
                                            borderRadius: 10,
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            marginBottom: 14,
                                        }}
                                    >
                                        <AlertTriangle size={16} style={{ color: '#f87171', minWidth: 16 }} />
                                        <p style={{ color: '#fca5a5', fontSize: 12, margin: 0 }}>
                                            Chưa xác nhận được giao dịch. Vui lòng đợi và thử lại.
                                        </p>
                                    </div>
                                )}
                                <button
                                    onClick={handleCheckPayment}
                                    disabled={checking || timer === 0}
                                    style={{
                                        width: '100%',
                                        background:
                                            checking || timer === 0
                                                ? 'rgba(99,102,241,0.3)'
                                                : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                        color: checking || timer === 0 ? '#64748b' : '#fff',
                                        fontWeight: 700,
                                        padding: '13px',
                                        borderRadius: 12,
                                        border: 'none',
                                        cursor: checking || timer === 0 ? 'not-allowed' : 'pointer',
                                        fontSize: 14,
                                        fontFamily: 'inherit',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        transition: 'all 0.2s',
                                        boxShadow: checking || timer === 0 ? 'none' : '0 6px 20px rgba(99,102,241,0.35)',
                                    }}
                                >
                                    {checking ? (
                                        <>
                                            <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                                            Đang kiểm tra...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} />
                                            Xác nhận đã chuyển tiền
                                        </>
                                    )}
                                </button>
                                {timer === 0 && (
                                    <p style={{ color: '#f87171', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
                                        Phiên đã hết hạn.{' '}
                                        <span
                                            onClick={() => { setTimer(300); setPaymentStatus(null); }}
                                            style={{ color: '#818cf8', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Làm mới
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}