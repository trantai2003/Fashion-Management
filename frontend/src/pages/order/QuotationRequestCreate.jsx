import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import purchaseRequestService from "@/services/purchaseRequestService";
import apiClient from "@/services/apiClient";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    FileText, ArrowLeft, Loader2, ClipboardList, Truck,
    CheckCircle2, Send, RotateCw, Building2, Check, Users
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

/* Custom Scrollbar cho Supplier List */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(184,134,11,0.4); }

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
`;

export default function QuotationRequestCreate() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // --- States ---
    const [prList, setPrList] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedPR, setSelectedPR] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const [form, setForm] = useState({
        prId: "",
        soDonMua: "",
        ghiChu: "",
    });

    const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            // Lấy danh sách PR (Đã duyệt) từ API filter mới
            const prRes = await apiClient.post('/api/v1/yeu-cau-mua-hang/filter', {
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 2, logicType: "AND" }],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                page: 0, size: 1000
            });
            setPrList(prRes.data?.data?.content || prRes.data?.content || []);

            // Lấy danh sách nhà cung cấp (chỉ hiển thị những NCC đang hoạt động: trangThai = 1)
            const suppRes = await apiClient.get('/api/supplier');
            const allSuppliers = suppRes.data?.data || [];
            setSuppliers(allSuppliers.filter(s => s.trangThai === 1));

            // Xử lý auto-fill nếu đi từ màn detail sang
            const initialPrId = searchParams.get("prId");
            if (initialPrId) {
                await loadPRDetails(initialPrId);
            }
        } catch (error) {
            toast.error("Không thể tải dữ liệu khởi tạo");
        } finally {
            setLoading(false);
        }
    }

    const loadPRDetails = async (id) => {
        setActionLoading(true);
        try {
            const res = await apiClient.get(`/api/v1/yeu-cau-mua-hang/get-by-id/${id}`);
            const data = res.data?.data;
            
            setSelectedPR(data);
            setForm(prev => ({
                ...prev,
                prId: data.id,
                ghiChu: `Tạo yêu cầu báo giá từ PR #${data.id}`
            }));
            generateOrderNumber();
        } catch (error) {
            toast.error("Không thể tải chi tiết Yêu cầu mua hàng");
            setSelectedPR(null);
            setForm(prev => ({ ...prev, prId: "" }));
        } finally { 
            setActionLoading(false); 
        }
    };

    const handleSelectPR = (id) => {
        if (!id) { 
            setSelectedPR(null); 
            setForm(prev => ({ ...prev, prId: "", soDonMua: "" }));
            return; 
        }
        loadPRDetails(id);
    };

    const toggleSupplier = (id) => {
        setSelectedSupplierIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const generateOrderNumber = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const r = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setForm(prev => ({ ...prev, soDonMua: `RFQ${y}${m}${d}${r}` }));
    };

    const handleCreate = () => {
        if (!form.prId) return toast.error("Vui lòng chọn Yêu cầu mua hàng (PR)");
        if (selectedSupplierIds.length === 0) return toast.error("Vui lòng chọn ít nhất một Nhà cung cấp");
        setShowConfirmDialog(true);
    };

    const confirmSend = async () => {
        setSending(true);
        try {
            await purchaseRequestService.sendQuotationRequest({
                yeuCauMuaHangId: parseInt(form.prId),
                nhaCungCapIds: selectedSupplierIds,
                ghiChu: form.ghiChu,
            });

            toast.success(`Đã gửi yêu cầu báo giá đến ${selectedSupplierIds.length} NCC thành công!`);
            setShowConfirmDialog(false);
            setTimeout(() => navigate('/quotation-requests'), 1500);
        } catch (err) {
            console.error('Error sending quotation request:', err);
            toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu báo giá. Vui lòng thử lại!');
        } finally {
            setSending(false);
        }
    };

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
                        to="/quotation-requests"
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
                                    <span className="sec-title">Thông tin gửi báo giá</span>
                                </div>
                                <div className="sec-body">
                                    <div className="inp-group">
                                        <label className="inp-label">Yêu cầu mua hàng (PR) <span className="text-rose-500">*</span></label>
                                        <select
                                            className="inp-select font-semibold"
                                            value={form.prId}
                                            onChange={(e) => handleSelectPR(e.target.value)}
                                            disabled={actionLoading}
                                        >
                                            <option value="">-- Chọn PR đã duyệt --</option>
                                            {prList.map(pr => (
                                                <option key={pr.id} value={pr.id}>
                                                    {pr.soYeuCauMuaHang || `PR-${pr.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="inp-group">
                                        <label className="inp-label">Tiền tố mã báo giá (Tùy chọn)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={form.soDonMua}
                                                onChange={(e) => setForm(prev => ({ ...prev, soDonMua: e.target.value }))}
                                                placeholder="VD: RFQ2024..."
                                                className="h-11 font-mono font-bold text-[#8b6a21] bg-[#faf8f3] rounded-xl border-[#b8860b]/20 shadow-sm text-[15px] flex-1 focus-visible:ring-[#b8860b]"
                                            />
                                            <Button
                                                type="button" variant="outline" onClick={generateOrderNumber}
                                                className="h-11 w-11 p-0 rounded-xl border-[#b8860b]/20 hover:bg-[#b8860b]/10 text-[#b8860b]" title="Tự sinh mã"
                                            >
                                                <RotateCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* ── Multi-select Nhà Cung Cấp ── */}
                                    <div className="inp-group">
                                        <div className="flex items-center justify-between">
                                            <label className="inp-label">Nhà Cung Cấp <span className="text-rose-500">*</span></label>
                                            {selectedSupplierIds.length > 0 && (
                                                <span className="text-[10px] font-bold text-white bg-[#b8860b] px-2 py-0.5 rounded-full shadow-sm">
                                                    {selectedSupplierIds.length} đã chọn
                                                </span>
                                            )}
                                        </div>
                                        <div className="max-h-[220px] overflow-y-auto rounded-xl border border-[#b8860b]/20 bg-[#faf8f3] p-1.5 space-y-1 custom-scrollbar">
                                            {suppliers.length === 0 ? (
                                                <p className="text-center text-[12px] text-slate-400 py-6 italic">Không có dữ liệu NCC</p>
                                            ) : suppliers.map(s => {
                                                const isSelected = selectedSupplierIds.includes(s.id);
                                                return (
                                                    <button
                                                        key={s.id} type="button" onClick={() => toggleSupplier(s.id)}
                                                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left ${isSelected ? 'bg-white border-[#b8860b]/40 shadow-sm' : 'border-transparent hover:bg-black/5'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#b8860b] border-[#b8860b]' : 'border-slate-300 bg-white'}`}>
                                                                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                                                            </div>
                                                            <div>
                                                                <p className={`text-[13px] leading-tight ${isSelected ? 'font-bold text-[#1a1612]' : 'font-semibold text-slate-700'}`}>{s.tenNhaCungCap}</p>
                                                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.maNhaCungCap}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </aside>

                        {/* ── Content Preview (Right Column) ── */}
                        <div className="lg:col-span-2">
                            <div className="sec-card h-full">
                                <div className="sec-head justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="sec-icon-wrap"><ClipboardList size={16} /></div>
                                        <span className="sec-title">Danh sách sản phẩm</span>
                                    </div>
                                    {selectedPR && <span className="badge-tag gold">#{selectedPR.soYeuCauMuaHang || selectedPR.id}</span>}
                                </div>
                                <div className="flex-1 overflow-x-auto">
                                    {!selectedPR ? (
                                        <div className="h-[400px] flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                                            <Truck size={48} />
                                            <p className="font-mono text-xs uppercase tracking-widest italic">Vui lòng chọn Yêu cầu mua hàng</p>
                                        </div>
                                    ) : (
                                        <table className="wh-tbl">
                                            <thead className="wh-thead">
                                                <tr>
                                                    <th className="wh-th text-left">Sản phẩm</th>
                                                    <th className="wh-th text-center">Số lượng yêu cầu</th>
                                                    <th className="wh-th text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="wh-tbody">
                                                {selectedPR.chiTietYeuCauMuaHangs?.map((ct, idx) => (
                                                    <tr key={ct.id || idx}>
                                                        <td className="wh-td">
                                                            <div className="font-bold text-[#1a1612]">
                                                                {ct.bienTheSanPham?.tenSanPham || ct.bienTheSanPham?.tenBienThe || 'Tên sản phẩm'}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-[#b8860b] mt-0.5 flex gap-2">
                                                                <span>{ct.bienTheSanPham?.maSku}</span>
                                                                <span className="text-slate-400">|</span>
                                                                <span className="text-slate-500">{ct.bienTheSanPham?.mauSac?.tenMau} - {ct.bienTheSanPham?.size?.maSize}</span>
                                                            </div>
                                                        </td>
                                                        <td className="wh-td text-center">
                                                            <span className="font-black text-[#1a1612] text-base bg-slate-100 px-2 py-1 rounded-md">
                                                                {ct.soLuongDat || 0}
                                                            </span>
                                                        </td>
                                                        <td className="wh-td text-right">
                                                            <span className="badge-tag gold flex items-center gap-1 justify-end w-max ml-auto">
                                                                <CheckCircle2 size={12} /> Ready
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!selectedPR.chiTietYeuCauMuaHangs || selectedPR.chiTietYeuCauMuaHangs.length === 0) && (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-10 text-sm text-gray-400 italic">
                                                            Yêu cầu này không có sản phẩm nào
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
                            disabled={actionLoading || !form.prId || selectedSupplierIds.length === 0} 
                            className="flex items-center justify-center h-12 rounded-xl px-8 gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a07409] hover:to-[#b8860b] text-white font-bold shadow-[0_4px_14px_rgba(184,134,11,0.25)] border-0 transition-all duration-300"
                        >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Tạo & Gửi {selectedSupplierIds.length > 0 ? `(${selectedSupplierIds.length})` : ''} báo giá
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border border-[#b8860b]/20 shadow-2xl bg-white">
                    <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0 tracking-wide font-['Playfair_Display']">
                            Xác nhận gửi yêu cầu
                        </DialogTitle>
                    </div>
                    <div className="p-6 bg-[#faf8f3]">
                        <DialogDescription className="text-[15px] text-slate-700 mb-6 leading-relaxed">
                            Hệ thống sẽ tạo <strong>{selectedSupplierIds.length} đơn báo giá</strong> và gửi email thông báo đồng loạt đến các nhà cung cấp đã chọn.
                        </DialogDescription>

                        <div className="bg-white border border-[#b8860b]/20 shadow-sm rounded-xl p-4 space-y-3 mb-6 text-[14px]">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-500 font-medium">Mã yêu cầu gốc:</span>
                                <span className="font-bold text-[#1a1612] text-[15px]">{selectedPR?.soYeuCauMuaHang || `#${selectedPR?.id}`}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5"><Users className="h-4 w-4"/> Số lượng gửi:</span>
                                <span className="font-black text-[#b8860b] bg-[#b8860b]/10 px-2 py-0.5 rounded-lg text-[16px]">{selectedSupplierIds.length} NCC</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={sending}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto border-slate-300 text-slate-600 hover:bg-slate-100 bg-white"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={confirmSend}
                                disabled={sending}
                                className="h-11 rounded-xl font-bold bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a07409] hover:to-[#b8860b] text-white shadow-md border-0 w-full sm:w-auto transition-all"
                            >
                                {sending
                                    ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang gửi...</>
                                    : <><Send className="h-4 w-4 mr-2" />Tiến hành gửi</>
                                }
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}