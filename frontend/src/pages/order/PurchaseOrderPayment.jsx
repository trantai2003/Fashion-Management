import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const fetchGiaoDich = async (id) => {
  const res = await fetch(`http://localhost:8080/api/v1/nghiep-vu/don-mua-hang/thanh-toan/${id}`);
  const json = await res.json();
  return json.data;
};

const kiemTraThanhToan = async (id) => {
  const res = await fetch(`http://localhost:8080/api/v1/nghiep-vu/don-mua-hang/kiem-tra-thanh-toan/id?id=${id}`);
  const json = await res.json();
  return json.status === 200;
};

const buildVietQRUrl = (data) => {
  if (!data) return null;
  const { nganHang, soNganHang, tongTien, maGiaoDich, tenNhaCungCap } = data;
  const base = `https://img.vietqr.io/image/${nganHang}-${soNganHang}-qr_only.png`;
  const params = new URLSearchParams({
    amount: tongTien?.toString() ?? "0",
    addInfo: maGiaoDich ?? "",
    accountName: tenNhaCungCap ?? "",
  });
  return `${base}?${params.toString()}`;
};

export default function PurchaseOrderPayment() {
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [qrLoaded, setQrLoaded] = useState(false);
  const [paid, setPaid] = useState(false);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchGiaoDich(orderId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  // Poll mỗi 20s
  useEffect(() => {
    if (loading || !data || paid) return;

    intervalRef.current = setInterval(async () => {
      setChecking(true);
      try {
        const ok = await kiemTraThanhToan(orderId);
        if (ok) {
          clearInterval(intervalRef.current);
          setPaid(true);
        }
      } catch (_) { }
      setChecking(false);
    }, 20000);

    return () => clearInterval(intervalRef.current);
  }, [loading, data, paid, orderId]);

  const handleConfirm = () => {
    navigate("/purchase-orders");
  };

  const copy = (val, key) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const qrUrl = buildVietQRUrl(data);
  const fmt = (n) =>
    n != null
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n)
      : "—";

  const fields = data
    ? [
      { label: "Mã đơn mua", value: data.soDonMua, key: "soDonMua" },
      { label: "Mã giao dịch", value: data.maGiaoDich, key: "maGiaoDich", highlight: true },
      { label: "Ngân hàng", value: data.nganHang?.toUpperCase(), key: "nganHang" },
      { label: "Số tài khoản", value: data.soNganHang, key: "soNganHang" },
      { label: "Chủ tài khoản", value: data.tenNhaCungCap, key: "tenNhaCungCap" },
      { label: "Kho", value: data.tenKho, key: "tenKho" },
      { label: "Tổng tiền", value: fmt(data.tongTien), key: "tongTien", money: true },
    ]
    : [];

  return (
    <div style={styles.page}>
      <div style={styles.noise} />

      {/* ── SUCCESS OVERLAY ── */}
      {paid && (
        <div style={styles.overlay}>
          <div style={styles.successCard}>
            <div style={styles.successIconWrap}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="rgba(0,229,100,0.15)" />
                <circle cx="28" cy="28" r="21" fill="rgba(0,229,100,0.2)" />
                <path d="M17 28.5L24.5 36L39 21" stroke="#00e564" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={styles.successTitle}>Thanh toán thành công!</h2>
            <p style={styles.successSub}>
              Giao dịch <strong style={{ color: "#00e5ff" }}>{data?.maGiaoDich}</strong> đã được xác nhận.
            </p>
            <div style={styles.successAmount}>{fmt(data?.tongTien)}</div>
            <button style={styles.confirmBtn} onClick={handleConfirm}>
              Xác nhận &amp; Đóng tab
            </button>
          </div>
        </div>
      )}

      <div style={{ ...styles.card, filter: paid ? "blur(4px)" : "none", transition: "filter 0.3s" }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerAccent} />
          <div>
            <p style={styles.headerEyebrow}>Thanh toán đơn mua hàng</p>
            <h1 style={styles.headerTitle}>
              {loading ? "Đang tải..." : data?.soDonMua ?? `#${orderId}`}
            </h1>
          </div>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot} />
            {checking ? "Đang kiểm tra..." : "Chờ thanh toán"}
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Đang tải thông tin thanh toán…</p>
          </div>
        ) : !data ? (
          <div style={styles.errorWrap}>
            <p style={styles.errorText}>Không tìm thấy thông tin giao dịch.</p>
          </div>
        ) : (
          <div style={styles.body}>
            <div style={styles.qrSection}>
              <div style={styles.qrFrame}>
                {!qrLoaded && (
                  <div style={styles.qrPlaceholder}>
                    <div style={styles.spinner} />
                  </div>
                )}
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="QR thanh toán"
                    style={{ ...styles.qrImg, opacity: qrLoaded ? 1 : 0 }}
                    onLoad={() => setQrLoaded(true)}
                  />
                )}
              </div>
              <p style={styles.qrHint}>Quét mã để thanh toán qua ứng dụng ngân hàng</p>
              <div style={styles.amountBadge}>{fmt(data.tongTien)}</div>
              {/* Polling indicator */}
              <div style={styles.pollingRow}>
                <div style={{ ...styles.pollingDot, background: checking ? "#ffc107" : "#00e564" }} />
                <span style={styles.pollingText}>
                  {checking ? "Đang xác minh giao dịch..." : "Tự động kiểm tra mỗi 20 giây"}
                </span>
              </div>
            </div>

            <div style={styles.infoSection}>
              {fields.map((f) => (
                <div
                  key={f.key}
                  style={{ ...styles.fieldRow, ...(f.highlight ? styles.fieldRowHighlight : {}) }}
                  onClick={() => f.value && copy(f.value, f.key)}
                  title="Click để sao chép"
                >
                  <span style={styles.fieldLabel}>{f.label}</span>
                  <div style={styles.fieldRight}>
                    <span style={{ ...styles.fieldValue, ...(f.money ? styles.fieldMoney : {}) }}>
                      {f.value ?? "—"}
                    </span>
                    {f.value && (
                      <span style={styles.copyIcon}>{copied === f.key ? "✓" : "⧉"}</span>
                    )}
                  </div>
                </div>
              ))}

              <div style={styles.noteBox}>
                <span style={styles.noteIcon}>💡</span>
                <p style={styles.noteText}>
                  Vui lòng nhập <strong>{data.maGiaoDich}</strong> vào nội dung chuyển khoản để hệ thống tự động xác nhận.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes popIn { from{opacity:0;transform:translateY(24px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a3e 50%, #0d1b2a 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    position: "relative", overflow: "hidden",
  },
  noise: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
    backgroundRepeat: "repeat", backgroundSize: "200px",
  },
  // Success overlay
  overlay: {
    position: "fixed", inset: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
    animation: "fadeIn 0.3s ease",
  },
  successCard: {
    background: "linear-gradient(145deg, #0d1b2a, #1a1a3e)",
    border: "1px solid rgba(0,229,100,0.3)",
    borderRadius: 24,
    padding: "48px 40px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    boxShadow: "0 0 80px rgba(0,229,100,0.15), 0 32px 80px rgba(0,0,0,0.6)",
    animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
    maxWidth: 360, width: "100%", textAlign: "center",
  },
  successIconWrap: { marginBottom: 4 },
  successTitle: { margin: 0, fontSize: 24, fontWeight: 700, color: "#fff" },
  successSub: { margin: 0, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 },
  successAmount: {
    fontSize: 28, fontWeight: 800, color: "#00e564",
    background: "rgba(0,229,100,0.08)", border: "1px solid rgba(0,229,100,0.2)",
    borderRadius: 12, padding: "10px 28px",
  },
  confirmBtn: {
    marginTop: 8,
    background: "linear-gradient(135deg, #00e564, #00b84d)",
    border: "none", borderRadius: 12,
    padding: "13px 32px", fontSize: 15, fontWeight: 700, color: "#fff",
    cursor: "pointer", letterSpacing: "0.01em",
    boxShadow: "0 8px 24px rgba(0,229,100,0.3)",
    transition: "transform 0.15s, box-shadow 0.15s",
  },
  // Card
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: 820,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    backdropFilter: "blur(24px)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "24px 32px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.02)",
    position: "relative", overflow: "hidden",
  },
  headerAccent: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
    background: "linear-gradient(180deg, #00e5ff, #7b2ff7)",
    borderRadius: "0 4px 4px 0",
  },
  headerEyebrow: { margin: 0, fontSize: 11, color: "#00e5ff", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 },
  headerTitle: { margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" },
  statusBadge: {
    marginLeft: "auto", display: "flex", alignItems: "center", gap: 7,
    background: "rgba(255, 193, 7, 0.12)", border: "1px solid rgba(255,193,7,0.3)",
    borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#ffc107", fontWeight: 600,
  },
  statusDot: {
    width: 7, height: 7, borderRadius: "50%", background: "#ffc107",
    boxShadow: "0 0 8px #ffc107", animation: "pulse 1.5s infinite",
    display: "inline-block",
  },
  body: { display: "flex", gap: 0, flexWrap: "wrap" },
  qrSection: {
    flex: "0 0 280px",
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "32px 24px",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    gap: 14,
  },
  qrFrame: {
    width: 200, height: 200, background: "#fff", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 40px rgba(0,229,255,0.2), 0 8px 32px rgba(0,0,0,0.4)",
    overflow: "hidden", position: "relative",
  },
  qrImg: { width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" },
  qrPlaceholder: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" },
  qrHint: { margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 1.5 },
  amountBadge: {
    background: "linear-gradient(135deg, #00e5ff22, #7b2ff722)",
    border: "1px solid rgba(0,229,255,0.3)",
    borderRadius: 10, padding: "8px 20px",
    fontSize: 18, fontWeight: 700, color: "#00e5ff", letterSpacing: "-0.01em",
  },
  pollingRow: { display: "flex", alignItems: "center", gap: 7 },
  pollingDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0, transition: "background 0.3s", boxShadow: "0 0 6px currentColor" },
  pollingText: { fontSize: 11, color: "rgba(255,255,255,0.35)" },
  infoSection: {
    flex: 1, minWidth: 0,
    padding: "28px 32px",
    display: "flex", flexDirection: "column", gap: 4,
  },
  fieldRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "11px 14px", borderRadius: 8, cursor: "pointer",
    transition: "background 0.15s", gap: 12,
  },
  fieldRowHighlight: {
    background: "rgba(0, 229, 255, 0.06)",
    border: "1px solid rgba(0,229,255,0.15)",
  },
  fieldLabel: { fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, flexShrink: 0 },
  fieldRight: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  fieldValue: { fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500, textAlign: "right", wordBreak: "break-all" },
  fieldMoney: { color: "#00e5ff", fontWeight: 700, fontSize: 16 },
  copyIcon: { fontSize: 13, color: "rgba(255,255,255,0.3)", flexShrink: 0, userSelect: "none" },
  noteBox: {
    marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start",
    background: "rgba(123, 47, 247, 0.1)", border: "1px solid rgba(123,47,247,0.25)",
    borderRadius: 10, padding: "12px 16px",
  },
  noteIcon: { fontSize: 16, flexShrink: 0 },
  noteText: { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 64, gap: 16 },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  errorWrap: { display: "flex", alignItems: "center", justifyContent: "center", padding: 64 },
  errorText: { color: "#ff5c5c", fontSize: 14 },
  spinner: {
    width: 28, height: 28, borderRadius: "50%",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#00e5ff",
    animation: "spin 0.8s linear infinite",
  },
};