import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";
import { 
    ArrowLeft,
    Calendar, 
    Package, 
    Tag, 
    ClipboardList, 
    Loader2, 
    AlertCircle, 
    Plus, 
    Trash2, 
    RefreshCcw,
    Database,
    CheckCircle2,
    Info
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
   (Sync with Warehouse / Homepage / Login / Detail)
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.wh-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 28px 28px 56px;
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.wh-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.wh-orb-1 {
  position: fixed; width: 600px; height: 600px; border-radius: 50%;
  background: rgba(184,134,11,0.06); filter: blur(120px);
  top: -200px; right: -150px; pointer-events: none; z-index: 0;
}

.wh-inner {
  position: relative; z-index: 1;
  max-width: 1200px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Header ── */
.wh-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.wh-title-wrap { display: flex; flex-direction: column; gap: 4px; }
.wh-eyebrow {
  font-family: 'DM Mono', monospace; font-size: 11px;
  letter-spacing: 0.25em; color: rgba(184,134,11,0.65);
  text-transform: uppercase; font-weight: 500;
}
.wh-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 900; color: #1a1612;
  letter-spacing: -0.5px;
}
.wh-title span { color: #b8860b; }

/* ── Cards ── */
.sec-card {
  background: #fff; border-radius: 20px; border: 1px solid rgba(184,134,11,0.15);
  overflow: hidden; box-shadow: 0 4px 20px rgba(100,80,30,0.06);
}
.sec-head {
  padding: 16px 24px; background: #faf8f3;
  border-bottom: 1px solid rgba(184,134,11,0.12);
  display: flex; align-items: center; justify-content: space-between;
}
.sec-title {
  font-family: 'DM Mono', monospace; font-size: 11px;
  letter-spacing: 0.05em; font-weight: 700; color: #1a1612; text-transform: uppercase;
  display: flex; align-items: center; gap: 10px;
}
.sec-body { padding: 24px; }

/* ── Info Grid ── */
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
.info-item { display: flex; flex-direction: column; gap: 5px; }
.info-lbl { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(184,134,11,0.6); text-transform: uppercase; letter-spacing: 0.05em; }
.info-val { font-size: 14px; font-weight: 700; color: #1a1612; }
.info-val.highlight { color: #b8860b; font-size: 18px; }

/* ── Table ── */
.wh-tbl { width: 100%; border-collapse: collapse; }
.wh-th {
  height: 44px; padding: 0 16px; background: #faf8f3;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  color: rgba(184,134,11,0.6); text-transform: uppercase; letter-spacing: 0.1em;
  text-align: left; border-bottom: 2px solid rgba(184,134,11,0.12);
}
.wh-tbody tr { border-bottom: 1px solid rgba(184,134,11,0.08); transition: all 0.2s; }
.wh-tbody tr:hover { background: rgba(184,134,11,0.03); }
.wh-td { padding: 14px 16px; font-size: 14px; color: #3d3529; }

/* ── Form ── */
.lot-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; }
.inp-wrap { display: flex; flex-direction: column; gap: 8px; }
.inp-lbl { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700; color: #b8860b; text-transform: uppercase; }
.inp-field {
  height: 44px; padding: 0 16px; border-radius: 10px;
  background: #faf8f3; border: 1.5px solid rgba(184,134,11,0.1);
  font-size: 14px; color: #1a1612; transition: all 0.2s;
}
.inp-field:focus { outline: none; border-color: #b8860b; background: #fff; box-shadow: 0 0 0 4px rgba(184,134,11,0.08); }

/* ── Buttons ── */
.btn-gold {
  height: 44px; padding: 0 24px; border-radius: 12px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(184,134,11,0.3); transition: all 0.2s;
}
.btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(184,134,11,0.45); }

.btn-white {
  height: 44px; padding: 0 24px; border-radius: 12px;
  background: #fff; border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 13px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
}
.btn-white:hover { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }

.back-link {
  display: flex; align-items: center; gap: 6px;
  font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.1em; color: #a89f92;
}
.back-link:hover { color: #b8860b; }

.id-badge { font-family: 'DM Mono', monospace; font-size: 11px; color: #b8860b; font-weight: 700; background: rgba(184,134,11,0.08); padding: 3px 8px; border-radius: 6px; }

/* ── Modals ── */
.modal-overlay {
  fixed inset-0 bg-[#1a1612]/40 backdrop-blur-sm z-[100]
  display flex items-center justify-center p-4
}
.modal-card {
  bg-white rounded-2xl w-full max-w-md shadow-2xl border border-rgba(184,134,11,0.1) overflow-hidden
  animate-in fade-in zoom-in duration-200
}
`;

const DEFAULT_FORM = { maLo: "", nsx: "", soLuongNhap: "", ghiChu: "" };

export default function KhaiBaoLo() {
    const { phieuNhapKhoId, bienTheSanPhamId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const [lotList, setLotList] = useState([]);
    const [form, setForm] = useState(DEFAULT_FORM);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedLot, setSelectedLot] = useState(null);

    const resetForm = useCallback(() => setForm(DEFAULT_FORM), []);

    const checkIsEditable = () => {
        if (!detail?.phieu) return false;
        return detail.phieu.trangThai === 0 && 
               !(detail.phieu.loaiNhap || "").includes("Chuyển kho") && 
               !(detail.phieu.loaiNhap || "").includes("hoàn trả");
    };

    const isEditable = checkIsEditable();
    const isAutoLotMode = detail?.phieu?.loaiNhap?.includes("Chuyển kho") || detail?.phieu?.loaiNhap?.includes("hoàn trả");

    const fetchDetail = useCallback(async () => {
        try {
            const [resDetail, resLots] = await Promise.all([
                phieuNhapKhoService.getDetail(phieuNhapKhoId),
                phieuNhapKhoService.getLotInput(phieuNhapKhoId, Number(bienTheSanPhamId))
            ]);
            const item = resDetail.items.find(i => i.bienTheSanPhamId === Number(bienTheSanPhamId));
            if (!item) {
                toast.error("Không tìm thấy biến thể trong phiếu nhập");
                return navigate(-1);
            }
            setDetail({ phieu: resDetail, item });
            setLotList(Array.isArray(resLots?.data) ? resLots.data : []);
        } catch (e) {
            toast.error("Lỗi khi tải dữ liệu");
        }
    }, [phieuNhapKhoId, bienTheSanPhamId, navigate]);

    useEffect(() => { fetchDetail(); resetForm(); }, [fetchDetail, resetForm]);

    async function handleSaveLot() {
        if (!isEditable) return toast.error("Phiếu đã khóa hoặc lô tự động");
        const { maLo, soLuongNhap, nsx, ghiChu } = form;
        if (!maLo || !soLuongNhap || !nsx) return toast.error("Nhập đầy đủ thông tin bắt buộc");
        setLoading(true);
        try {
            await phieuNhapKhoService.khaiBaoLo(phieuNhapKhoId, {
                bienTheSanPhamId: Number(bienTheSanPhamId),
                maLo, ngaySanXuat: nsx ? `${nsx}T00:00:00.000Z` : null,
                soLuongNhap: Number(soLuongNhap), ghiChu,
            });
            toast.success("Khai báo lô thành công");
            await fetchDetail(); resetForm();
        } catch (e) { toast.error("Không thể khai báo lô"); }
        finally { setLoading(false); }
    }

    async function handleDelete() {
        if (!selectedLot) return;
        try {
            await phieuNhapKhoService.deleteLo(phieuNhapKhoId, selectedLot.chiTietPhieuNhapKhoId);
            toast.success("Xoá lô thành công");
            await fetchDetail(); setShowDeleteConfirm(false); setSelectedLot(null);
        } catch (e) { toast.error("Không thể xoá lô"); }
    }

    if (!detail) return <div className="wh-root flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#b8860b]" /></div>;

    const { item } = detail;
    const isEnough = (item.soLuongDaKhaiBao ?? 0) >= item.soLuongCanNhap;

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate(`/goods-receipts/${phieuNhapKhoId}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại chi tiết phiếu nhập
                        </button>
                    </div>

                    {/* ── Info Component ── */}
                    <div className="sec-card">
                        <div className="sec-head">
                            <span className="sec-title"><Tag size={14} /> Thông tin biến thể</span>
                            <span className="wh-eyebrow text-[10px]">SKU: {item.sku}</span>
                        </div>
                        <div className="sec-body">
                            <div className="info-grid">
                                <InfoItem label="Sản phẩm" value={item.tenBienThe} />
                                <InfoItem label="Mã SKU" value={item.sku} isBadge />
                                <InfoItem label="Cần nhập" value={item.soLuongCanNhap} />
                                <InfoItem 
                                    label="Đã khai báo" 
                                    value={`${isAutoLotMode ? item.soLuongCanNhap : (item.soLuongDaKhaiBao ?? 0)} / ${item.soLuongCanNhap}`} 
                                    highlight={isEnough || isAutoLotMode}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* ── Lot List ── */}
                        <div className="lg:col-span-2">
                            <div className="sec-card">
                                <div className="sec-head">
                                    <span className="sec-title"><ClipboardList size={14} /> Danh sách lô</span>
                                    {!isEditable && (
                                        <span className="text-[10px] bg-[#b8860b]/10 text-[#b8860b] px-3 py-1 rounded-full font-bold uppercase">
                                            {isAutoLotMode ? "Automatic Lots" : "Read Only"}
                                        </span>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="wh-tbl">
                                        <thead>
                                            <tr>
                                                <th className="wh-th">Mã lô</th>
                                                <th className="wh-th text-center">Ngày SX</th>
                                                <th className="wh-th text-center">Số lượng</th>
                                                <th className="wh-th text-right">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="wh-tbody">
                                            {lotList.length === 0 ? (
                                                <tr><td colSpan={4} className="wh-td text-center py-20 opacity-30 italic">Chưa có dữ liệu lô hàng</td></tr>
                                            ) : (
                                                lotList.map((lo) => (
                                                    <tr key={lo.loHangId} className={isEditable ? 'cursor-pointer' : ''} onClick={() => isEditable && setForm({
                                                        maLo: lo.maLo, nsx: lo.ngaySanXuat?.slice(0, 10) || "",
                                                        soLuongNhap: lo.soLuongNhap, ghiChu: lo.ghiChu || ""
                                                    })}>
                                                        <td className="wh-td">
                                                            <span className="id-badge">#{lo.maLo}</span>
                                                            <div className="text-[10px] text-[#a89f92] mt-1 truncate max-w-[150px]">{lo.ghiChu || "-"}</div>
                                                        </td>
                                                        <td className="wh-td text-center font-semibold">
                                                            {lo.ngaySanXuat ? new Date(lo.ngaySanXuat).toLocaleDateString("vi-VN") : "-"}
                                                        </td>
                                                        <td className="wh-td text-center font-black text-[#b8860b]">{lo.soLuongNhap}</td>
                                                        <td className="wh-td text-right">
                                                            {isEditable ? (
                                                                <button className="text-red-500 hover:text-red-700 p-2" onClick={(e) => {
                                                                    e.stopPropagation(); setSelectedLot(lo); setShowDeleteConfirm(true);
                                                                }}><Trash2 size={16} /></button>
                                                            ) : <Info size={14} className="text-[#a89f92] inline-block" />}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* ── Form / Status ── */}
                        <div className="lg:col-span-1">
                            {isEditable ? (
                                <div className="sec-card border-[#b8860b]/30">
                                    <div className="sec-head bg-[#faf8f3]">
                                        <span className="sec-title text-[#b8860b]"><Plus size={14} /> Cập nhật lô</span>
                                    </div>
                                    <div className="sec-body">
                                        <div className="flex flex-col gap-5">
                                            <div className="inp-wrap">
                                                <label className="inp-lbl">Mã lô</label>
                                                <input className="inp-field" name="maLo" placeholder="Ví dụ: LO-001" value={form.maLo} onChange={e => setForm(p => ({ ...p, maLo: e.target.value }))} />
                                            </div>
                                            <div className="inp-wrap">
                                                <label className="inp-lbl">Ngày sản xuất</label>
                                                <input className="inp-field" type="date" value={form.nsx} onChange={e => setForm(p => ({ ...p, nsx: e.target.value }))} />
                                            </div>
                                            <div className="inp-wrap">
                                                <label className="inp-lbl">Số lượng</label>
                                                <input className="inp-field font-bold" type="number" placeholder="0" value={form.soLuongNhap} onChange={e => setForm(p => ({ ...p, soLuongNhap: e.target.value }))} />
                                            </div>
                                            <div className="inp-wrap">
                                                <label className="inp-lbl">Ghi chú</label>
                                                <input className="inp-field" placeholder="..." value={form.ghiChu} onChange={e => setForm(p => ({ ...p, ghiChu: e.target.value }))} />
                                            </div>
                                            <div className="flex flex-col gap-3 mt-2">
                                                <button onClick={handleSaveLot} disabled={loading} className="btn-gold w-full justify-center">
                                                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Lưu lô hàng"}
                                                </button>
                                                <button onClick={resetForm} className="btn-white w-full justify-center">Làm mới</button>
                                            </div>
                                            {isEnough && (
                                                <div className="mt-2 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2 text-green-700 text-xs font-bold uppercase">
                                                    <CheckCircle2 size={14} /> Full quantity declare
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-[#faf8f3] border border-rgba(184,134,11,0.1) rounded-2xl flex flex-col gap-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#b8860b] mx-auto shadow-sm">
                                        <AlertCircle size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-[#7a6e5f]">
                                        {isAutoLotMode 
                                            ? "Hệ thống đã tự động kế thừa lô hàng từ nguồn luân chuyển. Bạn không cần khai báo thủ công." 
                                            : "Phiếu đã khóa hoặc bị hủy, không thể chỉnh sửa dữ liệu lô."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DELETE */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-[#1a1612]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#b8860b]/10 animate-in fade-in zoom-in duration-200">
                        <h2 className="wh-title text-xl mb-3">Xoá <span>lô hàng</span></h2>
                        <p className="text-sm text-[#7a6e5f] mb-6 leading-relaxed uppercase font-black text-[10px] tracking-widest">
                            Chắc chắn muốn xoá lô <span className="text-red-500 font-bold">{selectedLot?.maLo}</span>?
                        </p>
                        <div className="flex justify-end gap-3 font-mono">
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2 rounded-xl text-xs font-bold text-[#7a6e5f] hover:bg-slate-50">Hủy</button>
                            <button onClick={handleDelete} className="px-5 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 shadow-md">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function InfoItem({ label, value, isBadge, highlight }) {
    return (
        <div className="info-item">
            <span className="info-lbl">{label}</span>
            {isBadge ? <span className="id-badge w-fit">{value}</span> : 
            <span className={`info-val ${highlight ? 'highlight' : ''}`}>{value || "---"}</span>}
        </div>
    );
}