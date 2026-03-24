import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import purchaseOrderService from "@/services/purchaseOrderService";
import apiClient from "@/services/apiClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    ChevronDown
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

/* ── Header ── */
.wh-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1.5px solid rgba(184,134,11,0.15);
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
        nhaCungCapId: "",
        ghiChu: "",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            // Lấy danh sách PR (Đã duyệt) và danh sách nhà cung cấp song song
            const [prRes, suppRes] = await Promise.all([
                purchaseOrderService.filter({
                    filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 2, logicType: "AND" }],
                    sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
                    page: 0, size: 1000
                }),
                purchaseOrderService.getUniqueSuppliers()
            ]);
            
            setPrList(prRes.data?.content || prRes.content || []);
            setSuppliers(suppRes || []);

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
            const res = await purchaseOrderService.getById(id);
            const data = res.data;
            
            setSelectedPR(data);
            setForm(prev => ({
                ...prev,
                prId: data.id,
                soDonMua: data.soDonMua || prev.soDonMua,
                nhaCungCapId: data.nhaCungCap?.id || prev.nhaCungCapId,
                ghiChu: `Tạo yêu cầu báo giá từ PR: ${data.soDonMua || data.id}`
            }));
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
            setForm(prev => ({ ...prev, prId: "", soDonMua: "", nhaCungCapId: "" }));
            return; 
        }
        loadPRDetails(id);
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
        if (!form.prId) return toast.error("Vui lòng chọn Yêu cầu mua hàng (PR)");
        if (!form.soDonMua?.trim()) return toast.error("Vui lòng nhập số đơn mua");
        if (!form.nhaCungCapId) return toast.error("Vui lòng chọn nhà cung cấp");
        
        setShowConfirmDialog(true);
    };

    const confirmSend = async () => {
        setSending(true);
        try {
            // Logic gửi y hệt màn SendQuotationRequest
            await apiClient.put('/api/v1/nghiep-vu/don-mua-hang/gui-yeu-cau-bao-gia', {
                id: parseInt(form.prId),
                soDonMua: form.soDonMua.trim(),
                nhaCungCapId: parseInt(form.nhaCungCapId),
            });

            toast.success('Đã gửi yêu cầu báo giá thành công! Trạng thái đã được cập nhật.');
            setShowConfirmDialog(false);
            setTimeout(() => navigate('/quotation-requests'), 1500);
        } catch (err) {
            console.error('Error sending quotation request:', err);
            toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu báo giá. Vui lòng thử lại!');
        } finally {
            setSending(false);
        }
    };

    const selectedSupplier = suppliers.find(s => s.id === parseInt(form.nhaCungCapId)) ?? null;

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
                                                    {pr.soDonMua || `PR-${pr.id}`} - {pr.nhaCungCap?.tenNhaCungCap || "Chưa có NCC"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="inp-group">
                                        <label className="inp-label">Số Đơn <span className="text-rose-500">*</span></label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={form.soDonMua}
                                                onChange={(e) => setForm(prev => ({ ...prev, soDonMua: e.target.value }))}
                                                placeholder="Nhập hoặc tự sinh..."
                                                className="h-11 font-mono font-bold text-[#8b6a21] bg-[#faf8f3] rounded-xl border-[#b8860b]/20 shadow-sm text-[15px] flex-1 focus-visible:ring-[#b8860b]"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={generateOrderNumber}
                                                className="h-11 w-11 p-0 rounded-xl border-[#b8860b]/20 hover:bg-[#b8860b]/10 text-[#b8860b]"
                                                title="Tự sinh mã"
                                            >
                                                <RotateCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="inp-group">
                                        <label className="inp-label">Nhà Cung Cấp <span className="text-rose-500">*</span></label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-11 justify-between font-medium rounded-xl border-[#b8860b]/20 bg-[#faf8f3] px-4 text-[14px]"
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Building2 className="h-4 w-4 text-[#b8860b] shrink-0" />
                                                        <span className="truncate text-[#1a1612]">
                                                            {selectedSupplier ? selectedSupplier.tenNhaCungCap : 'Chọn nhà cung cấp...'}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                className="w-[380px] max-h-[320px] overflow-y-auto bg-white rounded-xl shadow-lg border border-slate-100 z-50"
                                                align="start"
                                            >
                                                {suppliers.length === 0 ? (
                                                    <div className="p-4 text-center text-slate-500 text-sm italic">Không có dữ liệu</div>
                                                ) : suppliers.map((s) => (
                                                    <DropdownMenuItem
                                                        key={s.id}
                                                        onClick={() => setForm(prev => ({ ...prev, nhaCungCapId: s.id }))}
                                                        className="cursor-pointer p-3 flex flex-col items-start gap-1 rounded-lg mx-1 my-0.5 hover:bg-slate-50 focus:bg-slate-50"
                                                    >
                                                        <span className="font-bold text-slate-800">{s.tenNhaCungCap}</span>
                                                        <div className="flex items-center justify-between w-full text-xs text-slate-500">
                                                            <span>Mã: {s.maNhaCungCap}</span>
                                                            {s.email && <span className="text-slate-400 truncate max-w-[180px]">{s.email}</span>}
                                                        </div>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="inp-group mt-2">
                                        <label className="inp-label">Ghi chú (Nội bộ)</label>
                                        <textarea
                                            className="inp-area text-[13px]"
                                            placeholder="..."
                                            value={form.ghiChu}
                                            onChange={(e) => setForm(p => ({ ...p, ghiChu: e.target.value }))}
                                        />
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
                                    {selectedPR && <span className="badge-tag gold">#{selectedPR.soDonMua || selectedPR.id}</span>}
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
                                                {selectedPR.chiTietDonMuaHangs?.map(ct => (
                                                    <tr key={ct.id}>
                                                        <td className="wh-td">
                                                            <div className="font-bold text-[#1a1612]">
                                                                {ct.bienTheSanPham?.tenSanPham || 'Tên sản phẩm'}
                                                            </div>
                                                            <div className="font-mono text-[11px] text-[#b8860b] mt-0.5 flex gap-2">
                                                                <span>{ct.bienTheSanPham?.maSku}</span>
                                                                <span className="text-slate-400">|</span>
                                                                <span className="text-slate-500">{ct.bienTheSanPham?.mauSac?.tenMau} - {ct.bienTheSanPham?.size?.maSize}</span>
                                                            </div>
                                                        </td>
                                                        <td className="wh-td text-center">
                                                            <span className="font-black text-[#1a1612] text-base">
                                                                {ct.soLuongDat || 0}
                                                            </span>
                                                        </td>
                                                        <td className="wh-td text-right">
                                                            <span className="badge-tag gold flex items-center gap-1 justify-end w-max ml-auto">
                                                                <CheckCircle2 size={12} /> Approved
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(!selectedPR.chiTietDonMuaHangs || selectedPR.chiTietDonMuaHangs.length === 0) && (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-8 text-sm text-gray-400 italic">
                                                            PR này không có sản phẩm nào
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
                            disabled={actionLoading || !form.prId} 
                            className="h-11 rounded-xl px-6 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md transition-all"
                        >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Tạo & Gửi báo giá
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-slate-900 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Send className="h-5 w-5 text-[#b8860b]" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">
                            Xác nhận gửi yêu cầu báo giá
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 mb-6">
                            Hệ thống sẽ gửi email yêu cầu báo giá đến nhà cung cấp và cập nhật trạng thái đơn hàng.
                        </DialogDescription>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mb-6 text-[14px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Số đơn:</span>
                                <span className="font-mono font-bold text-[#8b6a21]">{form.soDonMua}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Nhà cung cấp:</span>
                                <span className="font-bold text-slate-800">{selectedSupplier?.tenNhaCungCap}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Email gửi đến:</span>
                                <span className="font-semibold text-blue-600">{selectedSupplier?.email || '—'}</span>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={sending}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto"
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                onClick={confirmSend}
                                disabled={sending}
                                className="h-11 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md w-full sm:w-auto"
                            >
                                {sending
                                    ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang gửi...</>
                                    : <><Send className="h-4 w-4 mr-2" />Xác nhận gửi</>
                                }
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}