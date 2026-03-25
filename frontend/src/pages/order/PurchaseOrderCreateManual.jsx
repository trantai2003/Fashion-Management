import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import purchaseOrderService from "@/services/purchaseOrderService";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    FileText,
    ArrowLeft,
    Loader2,
    ClipboardList,
    Truck,
    CheckCircle2,
    Send,
    RotateCw,
    Building2,
    ChevronDown,
    Package
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
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
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

/* ── Cards ── */
.sec-card {
  background: #fff; border-radius: 20px; border: 1px solid rgba(184,134,11,0.15);
  overflow: hidden; box-shadow: 0 4px 20px rgba(100,80,30,0.06);
  display: flex; flex-direction: column;
}
.sec-head {
  padding: 18px 24px; background: #faf8f3;
  border-bottom: 1px solid rgba(184,134,11,0.12);
  display: flex; align-items: center; gap: 12px;
}
.sec-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(184,134,11,0.1); color: #b8860b;
}
.sec-title {
  font-family: 'DM Mono', monospace; font-size: 12px;
  letter-spacing: 0.05em; font-weight: 700; color: #1a1612; text-transform: uppercase;
}
.sec-body { padding: 24px; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* ── Controls ── */
.inp-group { display: flex; flex-direction: column; gap: 8px; }
.inp-label {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  text-transform: uppercase; color: #b8860b; letter-spacing: 0.05em;
}
.inp-select, .inp-text, .inp-area {
  width: 100%; height: 44px; padding: 0 16px; border-radius: 12px;
  background: #faf8f3; border: 1.5px solid rgba(184,134,11,0.1);
  font-size: 14px; color: #1a1612; transition: all 0.2s;
}
.inp-select:focus, .inp-text:focus, .inp-area:focus {
  outline: none; border-color: #b8860b; background: #fff; box-shadow: 0 0 0 4px rgba(184,134,11,0.08);
}
.inp-area { height: auto; padding: 14px 16px; min-height: 100px; resize: none; }

/* ── Table ── */
.wh-tbl { width: 100%; border-collapse: collapse; }
.wh-th {
  height: 44px; padding: 0 16px; background: #faf8f3;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  color: rgba(184,134,11,0.6); text-transform: uppercase; letter-spacing: 0.1em;
  border-bottom: 2px solid rgba(184,134,11,0.12);
}
.wh-td { padding: 14px 16px; border-bottom: 1px solid rgba(184,134,11,0.08); font-size: 14px; }

.badge-tag {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 6px; text-transform: uppercase;
}
.badge-tag.gold { background: rgba(184,134,11,0.1); color: #b8860b; }
.badge-tag.emerald { background: rgba(16,185,129,0.1); color: #059669; }
`;

export default function PurchaseOrderCreateManual() {
    const navigate = useNavigate();

    // --- States ---
    const [rfqList, setRfqList] = useState([]);
    const [selectedRFQ, setSelectedRFQ] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const [form, setForm] = useState({
        rfqId: "",
        soDonMua: "",
        ghiChu: "",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const rfqRes = await purchaseOrderService.filter({
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 4, logicType: "AND" }],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page: 0, size: 1000
            });

            setRfqList(rfqRes.data?.content || rfqRes.content || []);
        } catch (error) {
            toast.error("Không thể tải danh sách Yêu cầu báo giá");
        } finally {
            setLoading(false);
        }
    }

    const loadRFQDetails = async (id) => {
        setActionLoading(true);
        try {
            const res = await purchaseOrderService.getById(id);
            const data = res.data;

            setSelectedRFQ(data);
            setForm(prev => ({
                ...prev,
                rfqId: data.id,
                soDonMua: data.soDonMua || prev.soDonMua,
                ghiChu: `Tạo Đơn mua hàng từ RFQ: ${data.soDonMua?.replace(/^PO/, 'RFQ') || data.id}`
            }));
        } catch (error) {
            toast.error("Không thể tải chi tiết Yêu cầu báo giá");
            setSelectedRFQ(null);
            setForm(prev => ({ ...prev, rfqId: "" }));
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelectRFQ = (id) => {
        if (!id) {
            setSelectedRFQ(null);
            setForm(prev => ({ ...prev, rfqId: "", soDonMua: "" }));
            return;
        }
        loadRFQDetails(id);
    };

    const generateOrderNumber = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setForm(prev => ({ ...prev, soDonMua: `PO${y}${m}${d}${r}` }));
    };

    const handleCreate = () => {
        if (!form.rfqId) return toast.error("Vui lòng chọn Yêu cầu báo giá (RFQ)");
        if (!form.soDonMua?.trim()) return toast.error("Vui lòng nhập hoặc sinh số đơn mua");

        setShowConfirmDialog(true);
    };

    const confirmCreate = async () => {
        setSubmitting(true);
        try {
            await purchaseOrderService.chapNhanBaoGia(form.rfqId);

            toast.success('Khởi tạo Đơn mua hàng thành công!');
            setShowConfirmDialog(false);
            setTimeout(() => navigate(`/purchase-orders/${form.rfqId}`), 1000);
        } catch (err) {
            console.error('Error creating PO:', err);
            toast.error(err.response?.data?.message || 'Không thể tạo đơn mua hàng. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    if (loading) {
        return (
            <div className="wh-root flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#b8860b]" />
            </div>
        );
    }

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    <Link
                        to="/purchase-orders"
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150 mb-4"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mt-4">
                        {/* ── Settings (Left Column) ── */}
                        <aside className="lg:col-span-1 flex flex-col gap-6">
                            <div className="sec-card h-full">
                                <div className="sec-head">
                                    <div className="sec-icon-wrap"><FileText size={16} /></div>
                                    <span className="sec-title">Thông tin đơn mua</span>
                                </div>
                                <div className="sec-body">
                                    <div className="inp-group">
                                        <label className="inp-label">Yêu cầu báo giá (RFQ) <span className="text-rose-500">*</span></label>
                                        <select
                                            className="inp-select font-semibold"
                                            value={form.rfqId}
                                            onChange={(e) => handleSelectRFQ(e.target.value)}
                                            disabled={actionLoading}
                                        >
                                            <option value="">-- Chọn RFQ đã nhận báo giá --</option>
                                            {rfqList.map(rfq => (
                                                <option key={rfq.id} value={rfq.id}>
                                                    {rfq.soDonMua?.replace(/^PO/, 'RFQ') || `RFQ-${rfq.id}`} - {rfq.nhaCungCap?.tenNhaCungCap || "Chưa có NCC"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="inp-group">
                                        <label className="inp-label">Số Đơn Mua (PO) <span className="text-rose-500">*</span></label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={form.soDonMua}
                                                onChange={(e) => setForm(prev => ({ ...prev, soDonMua: e.target.value }))}
                                                className="h-11 font-mono font-bold text-[#8b6a21] bg-[#faf8f3] rounded-xl border-[#b8860b]/20 shadow-sm text-[15px] flex-1 focus-visible:ring-[#b8860b]"
                                            />
                                        </div>
                                    </div>

                                    {selectedRFQ && (
                                        <div className="bg-[#faf8f3] border border-[#b8860b]/20 rounded-xl p-4 mt-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 className="h-4 w-4 text-[#b8860b]" />
                                                <p className="text-[12px] font-bold text-[#8b6a21] uppercase tracking-wider">
                                                    Nhà cung cấp
                                                </p>
                                            </div>
                                            <p className="font-bold text-slate-800">{selectedRFQ.nhaCungCap?.tenNhaCungCap || '—'}</p>
                                            <p className="text-[12px] text-slate-500 mt-1">Mã: {selectedRFQ.nhaCungCap?.maNhaCungCap || '—'}</p>

                                            <div className="mt-4 pt-3 border-t border-[#b8860b]/10">
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng tiền NCC báo</p>
                                                <p className="text-xl font-black text-emerald-600 tracking-tight">
                                                    {formatCurrency(selectedRFQ.tongTien)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </aside>

                        {/* ── Content Preview (Right Column) ── */}
                        <div className="lg:col-span-2">
                            <div className="sec-card h-full">
                                <div className="sec-head justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="sec-icon-wrap"><ClipboardList size={16} /></div>
                                        <span className="sec-title">Sản phẩm đã được báo giá</span>
                                    </div>
                                    {selectedRFQ && <span className="badge-tag emerald">Đã báo giá</span>}
                                </div>
                                <div className="flex-1 overflow-x-auto">
                                    {!selectedRFQ ? (
                                        <div className="h-[400px] flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                                            <Truck size={48} />
                                            <p className="font-mono text-xs uppercase tracking-widest italic">Vui lòng chọn RFQ để xem sản phẩm</p>
                                        </div>
                                    ) : (
                                        <table className="wh-tbl">
                                            <thead className="wh-thead">
                                                <tr>
                                                    <th className="wh-th text-left">Sản phẩm</th>
                                                    <th className="wh-th text-center">SL Yêu cầu</th>
                                                    <th className="wh-th text-right">Đơn giá (NCC báo)</th>
                                                    <th className="wh-th text-right">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody className="wh-tbody">
                                                {selectedRFQ.chiTietDonMuaHangs?.map(ct => (
                                                    <tr key={ct.id}>
                                                        <td className="wh-td">
                                                            <div className="flex items-center gap-3">
                                                                {ct.bienTheSanPham?.anhBienThe?.tepTin?.duongDan ? (
                                                                    <img
                                                                        src={ct.bienTheSanPham.anhBienThe.tepTin.duongDan}
                                                                        className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                                                                        alt=""
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                                        <Package className="h-5 w-5 text-slate-300" />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <div className="font-bold text-[#1a1612]">
                                                                        {ct.bienTheSanPham?.tenSanPham || 'Tên sản phẩm'}
                                                                    </div>
                                                                    <div className="font-mono text-[11px] text-[#b8860b] mt-0.5 flex gap-2">
                                                                        <span>{ct.bienTheSanPham?.maSku}</span>
                                                                        <span className="text-slate-400">|</span>
                                                                        <span className="text-slate-500">{ct.bienTheSanPham?.mauSac?.tenMau} - {ct.bienTheSanPham?.size?.maSize}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="wh-td text-center">
                                                            <span className="font-black text-[#1a1612] text-base">
                                                                {ct.soLuongDat || 0}
                                                            </span>
                                                        </td>
                                                        <td className="wh-td text-right">
                                                            <span className="font-semibold text-slate-800">
                                                                {formatCurrency(ct.donGia)}
                                                            </span>
                                                        </td>
                                                        <td className="wh-td text-right">
                                                            <span className="font-bold text-emerald-600">
                                                                {formatCurrency(ct.thanhTien)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!selectedRFQ.chiTietDonMuaHangs || selectedRFQ.chiTietDonMuaHangs.length === 0) && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-8 text-sm text-gray-400 italic">
                                                            RFQ này không có sản phẩm nào
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer Actions ── */}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            onClick={handleCreate}
                            disabled={actionLoading || !form.rfqId}
                            className="flex items-center justify-center h-11 rounded-xl px-6 gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a07409] hover:to-[#b8860b] text-white font-bold shadow-md border-0 transition-all duration-300"
                        >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Tạo đơn mua hàng
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border border-[#b8860b]/20 shadow-2xl">
                    <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0 tracking-wide font-['Playfair_Display']">
                            Xác nhận tạo đơn mua hàng
                        </DialogTitle>
                    </div>
                    <div className="p-6 bg-[#faf8f3]">
                        <DialogDescription className="text-[15px] text-slate-700 mb-6 leading-relaxed">
                            Hệ thống sẽ <strong>chấp nhận báo giá</strong> của RFQ này và khởi tạo đơn mua hàng.
                        </DialogDescription>

                        <div className="bg-white border border-[#b8860b]/20 shadow-sm rounded-xl p-4 space-y-3 mb-6 text-[14px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Số đơn (PO mới):</span>
                                <span className="font-mono font-bold text-[#b8860b] text-[15px]">{form.soDonMua}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Nguồn báo giá:</span>
                                <span className="font-bold text-slate-800">{selectedRFQ?.soDonMua?.replace(/^PO/, 'RFQ') || `#${form.rfqId}`}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-[#b8860b]/10 pt-3 mt-2">
                                <span className="text-[#b8860b] font-bold uppercase text-[12px] tracking-wider">Tổng tiền chốt:</span>
                                <span className="font-black text-emerald-600 text-lg">{formatCurrency(selectedRFQ?.tongTien)}</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={submitting}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto border-slate-300 text-slate-600 hover:bg-slate-100"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={confirmCreate}
                                disabled={submitting}
                                className="h-11 rounded-xl font-bold bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a07409] hover:to-[#b8860b] text-white shadow-md border-0 w-full sm:w-auto transition-all"
                            >
                                {submitting
                                    ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang tạo...</>
                                    : <><Send className="h-4 w-4 mr-2" />Xác nhận</>
                                }
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}