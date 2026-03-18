import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";
import { 
    Loader2, 
    ClipboardList, 
    Package, 
    Warehouse, 
    Calendar, 
    User, 
    Info as InfoIcon,
    ArrowLeft
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
   (Sync with Warehouse / Homepage / Login)
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.wh-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 28px 28px 56px;
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
}

.wh-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.wh-orb-1 {
  position: fixed; width: 500px; height: 500px; border-radius: 50%;
  background: rgba(184,134,11,0.07); filter: blur(100px);
  top: -180px; right: -120px; pointer-events: none; z-index: 0;
}

.wh-inner {
  position: relative; z-index: 1;
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Header ── */
.wh-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.wh-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; color: rgba(184,134,11,0.65);
  text-transform: uppercase;
}
.wh-header-actions { display: flex; align-items: center; gap: 12px; }

/* ── Info Cards ── */
.info-card {
  background: #fff;
  border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; padding: 24px;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
  position: relative; overflow: hidden;
}
.info-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px;
}

.info-item { display: flex; flex-direction: column; gap: 6px; }
.info-lbl {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase; color: rgba(184,134,11,0.6);
}
.info-val {
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; color: #1a1612;
}
.info-val.highlight { color: #b8860b; }

/* ── Badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700;
  font-family: 'DM Sans', sans-serif;
}
.badge-status { text-transform: uppercase; letter-spacing: 0.05em; }
.badge.green { background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.2); }
.badge.amber { background: rgba(184,134,11,0.1); color: #b8860b; border: 1px solid rgba(184,134,11,0.2); }
.badge.blue  { background: rgba(37,99,235,0.08); color: #2563eb; border: 1px solid rgba(37,99,235,0.2); }
.badge.red   { background: rgba(220,38,38,0.08); color: #dc2626; border: 1px solid rgba(220,38,38,0.2); }
.badge.purple { background: rgba(147,51,234,0.08); color: #9333ea; border: 1px solid rgba(147,51,234,0.2); }

.dot { width: 6px; height: 6px; border-radius: 50%; }
.badge.green .dot { background: #16a34a; }
.badge.amber .dot { background: #b8860b; }
.badge.blue  .dot { background: #2563eb; }
.badge.red   .dot { background: #dc2626; }
.badge.purple .dot { background: #9333ea; }
`;

const STATUS_UI = {
    0: { label: "Nháp", cls: "amber" },
    1: { label: "Chờ duyệt", cls: "blue" },
    2: { label: "Đã duyệt", cls: "blue" },
    3: { label: "Đã xuất", cls: "green" },
    4: { label: "Đã huỷ", cls: "red" },
};

export default function PhieuXuatKhoView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuXuatKhoService.view(id);
            setData(res);
        } catch (e) {
            toast.error("Không thể tải chi tiết phiếu xuất");
        } finally {
            setLoading(false);
        }
    }

    if (loading || !data) {
        return (
            <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#b8860b]" />
                    <p className="text-[#a89f92] font-mono text-xs uppercase tracking-widest">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    const statusInfo = STATUS_UI[data.trangThai] || { label: "Không xác định", cls: "blue" };

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    {/* ── Header ── */}
                    <div className="wh-header" style={{ justifyContent: "space-between" }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </button>

                        <div className="wh-header-actions">
                            <span className={`badge badge-status ${statusInfo.cls}`}>
                                <span className="dot" />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    {/* ── Info Section ── */}
                    <div className="info-card">
                        <div className="flex items-center gap-2 mb-6">
                            <ClipboardList size={16} className="text-[#b8860b]" />
                            <h2 className="wh-eyebrow font-bold text-[#1a1612]">Thông tin phiếu xuất</h2>
                        </div>

                        <div className="info-grid">
                            <InfoItem icon={Package} label="Số phiếu xuất" value={data.soPhieuXuat} highlight />
                            
                            <InfoItem 
                                icon={ClipboardList} 
                                label="Sales Order" 
                                value={data.soDonHang} 
                            />

                            <InfoItem 
                                icon={Warehouse} 
                                label="Kho xuất" 
                                value={data.tenKho} 
                            />

                            <InfoItem 
                                icon={Calendar} 
                                label="Ngày xuất" 
                                value={data.ngayXuat ? new Date(data.ngayXuat).toLocaleDateString("vi-VN") : "---"} 
                            />

                            <InfoItem 
                                icon={User} 
                                label="Người xuất" 
                                value={data.nguoiXuat} 
                            />
                        </div>
                        
                        {data.ghiChu && (
                            <div className="mt-6 pt-4 border-t border-[#faf8f3]">
                                <InfoItem icon={InfoIcon} label="Ghi chú" value={data.ghiChu} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function InfoItem({ icon: Icon, label, value, highlight }) {
    return (
        <div className="info-item">
            <div className="flex items-center gap-1.5 mb-1 opacity-80">
                <Icon size={12} className="text-[#b8860b]" />
                <span className="info-lbl">{label}</span>
            </div>
            <div className={`info-val ${highlight ? 'highlight' : ''}`}>{value || "---"}</div>
        </div>
    );
}