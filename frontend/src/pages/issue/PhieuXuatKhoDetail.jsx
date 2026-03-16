import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { toast } from "sonner";
import { 
    Loader2, Printer, Check, X, 
    ClipboardList, Package, Warehouse, Truck, 
    Calendar, User, AlertCircle, Info as InfoIcon,
    ArrowRight, ArrowLeft
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
.wh-title-wrap { display: flex; flex-direction: column; gap: 3px; }
.wh-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; color: rgba(184,134,11,0.65);
  text-transform: uppercase;
}
.wh-title {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 900; color: #1a1612;
  letter-spacing: -0.5px; line-height: 1;
}
.wh-title span { color: #b8860b; }

.wh-header-actions { display: flex; align-items: center; gap: 12px; }

/* ── Buttons ── */
.btn-gold {
  height: 42px; padding: 0 20px; border-radius: 11px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(184,134,11,0.35);
}
.btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(184,134,11,0.48); }
.btn-gold:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-purple {
  height: 42px; padding: 0 20px; border-radius: 11px;
  background: linear-gradient(135deg, #7e22ce, #a855f7);
  border: none; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(126,34,206,0.35);
}
.btn-purple:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(126,34,206,0.48); }
.btn-purple:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-white {
  height: 42px; padding: 0 20px; border-radius: 11px;
  background: #fff;
  border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.2s;
}
.btn-white:hover:not(:disabled) { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }

.btn-danger {
  height: 42px; padding: 0 20px; border-radius: 11px;
  background: rgba(220,38,38,0.05);
  border: 1.5px solid rgba(220,38,38,0.2);
  color: #dc2626; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.2s;
}
.btn-danger:hover:not(:disabled) { background: rgba(220,38,38,0.1); border-color: #dc2626; }

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

/* ── Table ── */
.wh-tbl-card {
  background: #fff;
  border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.wh-tbl-card::before {
  content: ''; display: block; height: 2px;
  background: linear-gradient(90deg, transparent, #b8860b, transparent);
}
.wh-tbl { width: 100%; border-collapse: collapse; text-align: left; }
.wh-thead tr { background: #faf8f3; border-bottom: 1px solid rgba(184,134,11,0.12); }
.wh-th {
  height: 48px; padding: 0 20px;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase; color: rgba(184,134,11,0.6);
}
.wh-tbody tr { border-bottom: 1px solid rgba(184,134,11,0.07); transition: all 0.2s; }
.wh-tbody tr:hover { background: rgba(184,134,11,0.04); }
.wh-td { padding: 16px 20px; font-size: 14px; color: #3d3529; }

.sku-code {
  font-family: 'DM Mono', monospace; font-size: 12px; color: #b8860b; font-weight: 600;
  background: rgba(184,134,11,0.08); padding: 2px 8px; border-radius: 6px;
}

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

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(26, 22, 18, 0.45);
  backdrop-filter: blur(4px); z-index: 1000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-card {
  background: #fff; border-radius: 24px; width: 100%; max-width: 480px;
  border: 1px solid rgba(184,134,11,0.25);
  box-shadow: 0 25px 60px rgba(100,80,30,0.2);
  overflow: hidden; animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: none; } }
.modal-head { padding: 24px 28px 12px; }
.modal-ttl { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 800; color: #1a1612; }
.modal-body { padding: 0 28px 28px; color: #7a6e5f; font-size: 14px; line-height: 1.6; }
.modal-foot { padding: 20px 28px; background: #faf8f3; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid rgba(184,134,11,0.1); }
`;

// Trạng thái phiếu xuất
const STATUS_UI = {
    0: { label: "Nháp", cls: "amber" },
    1: { label: "Chờ duyệt", cls: "blue" },
    2: { label: "Đã duyệt", cls: "blue" },
    3: { label: "Đã xuất", cls: "green" },
    4: { label: "Đã huỷ", cls: "red" },
    5: { label: "Đã xuất", cls: "green" },
};

export default function PhieuXuatKhoDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuXuatKhoService.getDetail(id);
            setData(res?.data || res);
        } catch (e) {
            console.error(e);
            toast.error("Không thể tải chi tiết phiếu xuất");
        } finally {
            setLoading(false);
        }
    }

    // Hàm xử lý khi xác nhận Hoàn thành/Vận chuyển
    const handleConfirmComplete = async () => {
        setIsProcessing(true);
        try {
            await phieuXuatKhoService.complete(data.phieu.id);
            
            if (isChuyenKho) {
                toast.success("Xác nhận xuất kho và bắt đầu vận chuyển thành công");
            } else {
                toast.success("Hoàn thành phiếu xuất bán hàng thành công");
            }
            navigate("/goods-issues");
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể thực hiện thao tác");
        } finally {
            setIsProcessing(false);
            setShowConfirm(false);
        }
    };

    const handleCancelExport = async () => {
        setIsProcessing(true);
        try {
            if (isChuyenKho) {
                await phieuChuyenKhoService.cancel(data.phieu.id);
            } else {
                await phieuXuatKhoService.cancel(data.phieu.id);
            }
            toast.success("Đã huỷ phiếu xuất thành công");
            navigate("/goods-issues");
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể huỷ phiếu");
        } finally {
            setIsProcessing(false);
            setShowCancelConfirm(false);
        }
    };

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

    const { phieu, chiTiet } = data;
    const isChuyenKho = phieu.loaiXuat === "chuyen_kho";
    
    // Kiểm tra xem tất cả mặt hàng đã bốc đủ lô chưa
    const isAllPicked = Array.isArray(chiTiet) 
        && chiTiet.length > 0 
        && chiTiet.every(ct => ct.duSoLuong === true);

    const statusInfo = STATUS_UI[phieu.trangThai] || { label: "Không xác định", cls: "blue" };

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    {/* ── Header actions only (title moved to global top header) ── */}
                    <div className="wh-header" style={{ justifyContent: "space-between" }}>
                        <button
                            type="button"
                            onClick={() => navigate("/goods-issues")}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </button>

                        <div className="wh-header-actions">
                            <span className={`badge badge-status ${statusInfo.cls}`}>
                                <span className="dot" />
                                {statusInfo.label}
                            </span>

                            {/* Nút Hủy: Hiện cho các trạng thái chưa hoàn thành/hủy */}
                            {[0, 1, 2].includes(phieu.trangThai) && (
                                <button
                                    disabled={isProcessing}
                                    className="btn-danger"
                                    onClick={() => setShowCancelConfirm(true)}
                                >
                                    <X size={15} /> Huỷ phiếu
                                </button>
                            )}

                            {/* NÚT IN PHIẾU */}
                            {phieu.trangThai !== 4 && (
                                <button
                                    onClick={() => navigate(`/goods-issues/${phieu.id}/print`)}
                                    className="btn-white"
                                >
                                    <Printer size={15} /> In phiếu
                                </button>
                            )}

                            {/* Nút Hoàn thành/Vận chuyển: Luôn hiển thị ở trạng thái 0 (Nháp) */}
                            {phieu.trangThai === 0 && (
                                <button
                                    disabled={isProcessing || !isAllPicked}
                                    onClick={() => setShowConfirm(true)}
                                    className={isChuyenKho ? "btn-purple" : "btn-gold"}
                                >
                                    {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                    {isChuyenKho ? "Xác nhận vận chuyển" : "Hoàn thành xuất kho"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Info Section ── */}
                    <div className="info-card">
                        <div className="flex items-center gap-2 mb-6">
                            <ClipboardList size={16} className="text-[#b8860b]" />
                            <h2 className="wh-eyebrow font-bold text-[#1a1612]">Thông tin nghiệp vụ</h2>
                        </div>

                        <div className="info-grid">
                            <InfoItem icon={Package} label="Số phiếu xuất" value={phieu.soPhieuXuat} highlight />

                            <InfoItem 
                                icon={InfoIcon} 
                                label="Loại xuất" 
                                value={isChuyenKho ? "Chuyển kho nội bộ" : "Xuất bán hàng"} 
                            />

                            {isChuyenKho ? (
                                <InfoItem icon={Warehouse} label="Kho chuyển đến" value={phieu.khoChuyenDen?.tenKho} />
                            ) : (
                                <InfoItem icon={ClipboardList} label="Đơn bán hàng" value={phieu.donBanHang?.soDonHang} />
                            )}

                            <InfoItem icon={Warehouse} label="Kho xuất hàng" value={phieu.kho?.tenKho} />

                            <InfoItem 
                                icon={Calendar} 
                                label="Ngày tạo phiếu" 
                                value={new Date(phieu.ngayTao).toLocaleDateString("vi-VN")} 
                            />

                            <InfoItem 
                                icon={Calendar} 
                                label="Ngày xuất" 
                                value={phieu.ngayXuat ? new Date(phieu.ngayXuat).toLocaleDateString("vi-VN") : "Chưa xuất kho"} 
                            />

                            <InfoItem 
                                icon={User} 
                                label="Người xuất" 
                                value={phieu.nguoiXuat?.hoTen || "---"} 
                            />
                        </div>
                        
                        {phieu.ghiChu && (
                            <div className="mt-6 pt-4 border-t border-[#faf8f3]">
                                <InfoItem icon={InfoIcon} label="Ghi chú" value={phieu.ghiChu} />
                            </div>
                        )}

                        {isChuyenKho && phieu.trangThai === 0 && !isAllPicked && (
                            <div className="mt-6 p-3 bg-[#f3e8ff] border border-[#e9d5ff] rounded-xl flex items-center gap-3">
                                <AlertCircle size={16} className="text-[#9333ea]" />
                                <p className="text-[#7e22ce] text-xs font-medium">
                                    CẦN BỐC LÔ TRƯỚC KHI XUẤT HÀNG. Hệ thống yêu cầu xác định lô sản phẩm trước khi đưa vào kho Trung chuyển.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Product List ── */}
                    <div className="wh-tbl-card">
                        <div className="p-5 border-b border-[#faf8f3] bg-[#faf8f3]/50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Package size={14} className="text-[#b8860b]" />
                                <span className="wh-eyebrow font-bold text-[#1a1612]">Danh sách sản phẩm</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="wh-tbl">
                                <thead className="wh-thead">
                                    <tr>
                                        <th className="wh-th">SKU / Biến thể</th>
                                        <th className="wh-th text-center">SL Yêu cầu</th>
                                        <th className="wh-th text-center">SL Đã Pick</th>
                                        <th className="wh-th text-center">Trạng thái</th>
                                        <th className="wh-th text-right">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="wh-tbody">
                                    {chiTiet.map((ct) => {
                                        const canEditLot = phieu.trangThai === 0;

                                        return (
                                            <tr key={ct.id}>
                                                <td className="wh-td">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="sku-code w-fit">{ct.sku}</span>
                                                        <span className="font-semibold text-[#1a1612] line-clamp-1">{ct.tenBienThe}</span>
                                                    </div>
                                                </td>
                                                
                                                <td className="wh-td text-center font-bold">
                                                    {ct.soLuongCanXuat}
                                                </td>

                                                <td className="wh-td text-center">
                                                    <span className={`font-mono font-bold ${ct.duSoLuong ? "text-[#16a34a]" : "text-[#b8860b]"}`}>
                                                        {ct.soLuongDaPick}
                                                        <span className="text-[#a89f92] font-normal mx-1">/</span>
                                                        {ct.soLuongCanXuat}
                                                    </span>
                                                </td>

                                                <td className="wh-td text-center">
                                                    {ct.duSoLuong ? (
                                                        <span className="badge green"><span className="dot" /> Đủ hàng</span>
                                                    ) : (
                                                        <span className="badge amber"><span className="dot" /> Chưa đủ</span>
                                                    )}
                                                </td>

                                                <td className="wh-td text-right">
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/goods-issues/${phieu.id}/pick-lot/${ct.id}`,
                                                                {
                                                                    state: {
                                                                        bienTheSanPhamId: ct.bienTheSanPhamId,
                                                                        sku: ct.sku,
                                                                        tenBienThe: ct.tenBienThe,
                                                                        soLuongXuat: ct.soLuongCanXuat,
                                                                        soLuongDaPick: ct.soLuongDaPick,
                                                                        phieuTrangThai: phieu.trangThai,
                                                                        loaiXuat: phieu.loaiXuat
                                                                    },
                                                                }
                                                            )
                                                        }
                                                        className={`h-8 px-4 text-xs inline-flex items-center gap-2 justify-center rounded-lg font-bold transition-all border
                                                            ${canEditLot 
                                                                ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" 
                                                                : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"}`}
                                                    >
                                                        {canEditLot ? "Pick lot" : "Xem lô"} <ArrowRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Modals ── */}
                {showConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <div className="modal-head">
                                <h2 className="modal-ttl">
                                    {isChuyenKho ? "Xác nhận vận chuyển" : "Xác nhận xuất kho"}
                                </h2>
                            </div>
                            <div className="modal-body">
                                {isChuyenKho
                                    ? `Hàng hóa trong phiếu ${phieu.soPhieuXuat} sẽ được trừ tồn tại kho hiện tại và đưa vào kho Trung Chuyển để bắt đầu vận chuyển.`
                                    : `Phiếu xuất kho ${phieu.soPhieuXuat} sẽ được hoàn thành và trừ tồn kho thực tế của các lô đã chọn.`}
                            </div>
                            <div className="modal-foot">
                                <button className="btn-white" onClick={() => setShowConfirm(false)}>Hủy</button>
                                <button 
                                    className={isChuyenKho ? "btn-purple" : "btn-gold"} 
                                    disabled={isProcessing}
                                    onClick={handleConfirmComplete}
                                >
                                    {isProcessing ? "Đang xử lý..." : "Xác nhận thực hiện"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showCancelConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <div className="modal-head">
                                <h2 className="modal-ttl">Hủy phiếu xuất kho</h2>
                            </div>
                            <div className="modal-body">
                                Bạn chắc chắn muốn huỷ phiếu <strong>{phieu.soPhieuXuat}</strong>? Mọi số lượng đã bốc (giữ hàng) sẽ được hoàn tồn. Thao tác này không thể hoàn tác.
                            </div>
                            <div className="modal-foot">
                                <button className="btn-white" onClick={() => setShowCancelConfirm(false)}>Quay lại</button>
                                <button className="btn-danger" onClick={handleCancelExport} disabled={isProcessing}>
                                    {isProcessing ? "Đang xử lý..." : "Xác nhận hủy"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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