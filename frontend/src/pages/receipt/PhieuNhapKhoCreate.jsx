import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import purchaseOrderService from "@/services/purchaseOrderService";
import { getMineKhoList } from "@/services/khoService";
import { toast } from "sonner";
import {
    ChevronDown,
    FileText,
    Warehouse,
    ArrowRightLeft,
    Package,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Calendar,
    User,
    ClipboardList,
    AlertCircle,
    Info,
    LayoutGrid,
    Truck
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
  max-width: 1400px; margin: 0 auto;
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
  font-size: 32px; font-weight: 900; color: #1a1612;
  letter-spacing: -0.5px;
}
.wh-title span { color: #b8860b; }

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

/* ── Source Toggle ── */
.toggle-pill {
  display: flex; background: rgba(184,134,11,0.06);
  padding: 5px; border-radius: 14px; gap: 4px; border: 1px solid rgba(184,134,11,0.1);
}
.toggle-btn {
  padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  cursor: pointer; border: none; background: transparent; color: #7a6e5f;
}
.toggle-btn.active { background: #fff; color: #b8860b; box-shadow: 0 2px 8px rgba(184,134,11,0.15); }

/* ── Table ── */
.wh-tbl { width: 100%; border-collapse: collapse; }
.wh-th {
  height: 44px; padding: 0 16px; background: #faf8f3;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  color: rgba(184,134,11,0.6); text-transform: uppercase; letter-spacing: 0.1em;
  text-align: left; border-bottom: 2px solid rgba(184,134,11,0.12);
}
.wh-td { padding: 14px 16px; border-bottom: 1px solid rgba(184,134,11,0.08); font-size: 14px; }

/* ── Buttons ── */
.btn-gold {
  height: 44px; padding: 0 24px; border-radius: 12px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(184,134,11,0.3); transition: all 0.2s;
}
.btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(184,134,11,0.45); }
.btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-white {
  height: 44px; padding: 0 24px; border-radius: 12px;
  background: #fff; border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
}
.btn-white:hover:not(:disabled) { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }

.back-link {
  display: flex; align-items: center; gap: 6px;
  font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.1em; color: #a89f92;
  transition: color 0.2s;
}
.back-link:hover { color: #b8860b; }

.badge-tag {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 6px; text-transform: uppercase;
}
.badge-tag.gold { background: rgba(184,134,11,0.1); color: #b8860b; }
.badge-tag.indigo { background: rgba(99,102,241,0.1); color: #6366f1; }
.badge-tag.red { background: rgba(220,38,38,0.1); color: #dc2626; }
`;

export default function PhieuNhapKhoCreate() {
    const navigate = useNavigate();

    // --- States cho Loại Nhập ---
    const [importSource, setImportSource] = useState("PO"); // "PO" hoặc "TRANSFER"

    // --- Data States ---
    const [poList, setPoList] = useState([]);
    const [transferList, setTransferList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [selectedPO, setSelectedPO] = useState(null);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [createdId, setCreatedId] = useState(null);

    const [form, setForm] = useState({
        donMuaHangId: "",
        transferId: "",
        khoId: "",
        ghiChu: "",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const myWarehousesRes = await getMineKhoList().catch(() => ({ data: [] }));
            const warehouseList = myWarehousesRes.data || myWarehousesRes || [];
            setWarehouses(warehouseList);

            const [poRes, transferRes3, transferRes4, allReceiptsRes] = await Promise.all([
                purchaseOrderService.filter({
                    page: 0, size: 1000,
                    filters: [{ fieldName: "trangThai", operator: "EQUALS", value: 4 }],
                    sorts: [{ fieldName: "id", direction: "DESC" }]
                }).catch(() => ({ content: [] })),
                phieuChuyenKhoService.filter({
                    page: 0, size: 1000,
                    filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 3 }],
                    sorts: [{ fieldName: "ngayCapNhat", direction: "DESC" }]
                }).catch(() => ({ content: [] })),
                phieuChuyenKhoService.filter({
                    page: 0, size: 1000,
                    filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 4 }],
                    sorts: [{ fieldName: "ngayCapNhat", direction: "DESC" }]
                }).catch(() => ({ content: [] })),
                phieuNhapKhoService.filter({ page: 0, size: 2000 }).catch(() => ({ content: [] }))
            ]);

            const rawPoList = poRes.data?.content || poRes.content || [];
            const validPoList = rawPoList.filter(po => {
                if (po.trangThai !== 4) return false;
                if (po.chiTietDonMuaHangs && Array.isArray(po.chiTietDonMuaHangs)) {
                    return po.chiTietDonMuaHangs.some(ct => (ct.soLuongDaNhan || 0) < (ct.soLuongDat || 0));
                }
                return true;
            });
            setPoList(validPoList);

            const rawTransfers = [
                ...(transferRes3.content || transferRes3.data?.content || []),
                ...(transferRes4.content || transferRes4.data?.content || [])
            ];
            const allReceipts = allReceiptsRes.content || allReceiptsRes.data?.content || [];
            const usedTransferIds = new Set(allReceipts.map(r => r.phieuXuatGocId).filter(Boolean));

            // 1. Lấy danh sách ID các kho mà user đang phụ trách
            const myWarehouseIds = warehouseList.map(w => w.id);

            // 2. Lọc danh sách phiếu chuyển kho
            const availableTransfers = rawTransfers.filter(t => {
                // Loại bỏ các phiếu đã được lập phiếu nhập kho trước đó
                if (usedTransferIds.has(t.id)) return false;

                // Xác định ID kho sẽ làm nhiệm vụ "nhận hàng"
                // - Trạng thái 4 (Đã hủy): Kho xuất nhận lại hàng (khoXuatId hoặc kho.id tùy API backend)
                // - Trạng thái 3 (Đang vận chuyển): Kho đích nhận hàng (khoNhapId hoặc khoChuyenDen.id)
                const targetKhoId = t.trangThai === 4
                    ? (t.khoXuatId || t.kho?.id)
                    : (t.khoNhapId || t.khoChuyenDen?.id);

                // Chỉ hiển thị nếu kho nhận nằm trong danh sách kho mà user quản lý
                return myWarehouseIds.includes(targetKhoId);
            });

            setTransferList(availableTransfers);

            if (warehouseList.length === 1) {
                setForm(prev => ({ ...prev, khoId: warehouseList[0].id }));
            }
        } catch (error) {
            toast.error("Không thể tải dữ liệu khởi tạo");
        } finally {
            setLoading(false);
        }
    }

    const handleSelectPO = async (id) => {
        if (!id) { setSelectedPO(null); return; }
        setActionLoading(true);
        try {
            const res = await purchaseOrderService.getById(id);
            const data = res.data;
            data.chiTietDonMuaHangs = data.chiTietDonMuaHangs.map(item => ({
                ...item,
                soLuongNhapTay: (item.soLuongDat || 0) - (item.soLuongDaNhan || 0)
            }));
            setSelectedPO(data);
            setForm(prev => ({
                ...prev,
                donMuaHangId: data.id,
                khoId: data.khoNhap?.id || prev.khoId,
                ghiChu: `Tạo phiếu nhập kho từ PO ${data.soDonMua}`
            }));
        } catch (error) {
            toast.error("Không thể tải chi tiết đơn mua hàng");
        } finally { setActionLoading(false); }
    };

    const handleSelectTransfer = async (id) => {
        if (!id) { setSelectedTransfer(null); return; }
        setActionLoading(true);
        try {
            const res = await phieuChuyenKhoService.getDetail(id);
            const data = res.data || res;
            setSelectedTransfer(data);
            setForm(prev => ({
                ...prev,
                transferId: data.id,
                khoId: data.trangThai === 4 ? data.khoXuatId : data.khoNhapId,
                ghiChu: data.trangThai === 4
                    ? `Nhập hoàn trả (RET) từ phiếu chuyển bị hủy: ${data.soPhieuXuat}`
                    : `Nhập kho nội bộ từ phiếu chuyển: ${data.soPhieuXuat}`
            }));
        } catch (e) {
            toast.error("Không thể tải chi tiết luân chuyển");
        } finally { setActionLoading(false); }
    };

    async function createPhieu() {
        if (importSource === "PO") {
            if (!selectedPO) return toast.error("Vui lòng chọn đơn mua hàng (PO)"), null;
            const chiTiet = selectedPO.chiTietDonMuaHangs.map(ct => ({
                bienTheSanPhamId: ct.bienTheSanPham.id,
                soLuongDuKienNhap: ct.soLuongNhapTay
            })).filter(ct => ct.soLuongDuKienNhap > 0);

            try {
                setActionLoading(true);
                const res = await phieuNhapKhoService.create({
                    donMuaHangId: selectedPO.id,
                    ghiChu: form.ghiChu,
                    chiTietPhieuNhapKhos: chiTiet
                });
                setCreatedId(res.id);
                toast.success("Tạo phiếu nhập từ PO thành công");
                return res.id;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Lỗi khi tạo phiếu nhập");
                return null;
            } finally { setActionLoading(false); }
        } else {
            if (!form.transferId) return toast.error("Vui lòng chọn yêu cầu chuyển kho"), null;
            try {
                setActionLoading(true);
                const res = await phieuNhapKhoService.createFromTransfer(form.transferId);
                const newId = res.data?.id || res.id;
                setCreatedId(newId);
                toast.success("Khởi tạo phiếu nhập luân chuyển thành công");
                return newId;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Không thể tạo phiếu");
                return null;
            } finally { setActionLoading(false); }
        }
    }

    const handleContinue = async () => {
        let id = createdId || await createPhieu();
        if (id) navigate(`/goods-receipts/${id}`);
    };

    if (loading) return <div className="wh-root flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#b8860b]" /></div>;

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    <Link
                        to="/goods-receipts"
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150 mb-4"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách
                    </Link>

                    {/* ── Source Toggle ── */}
                    <div className="flex justify-center sm:justify-start">
                        <div className="toggle-pill">
                            <button onClick={() => setImportSource("PO")} className={`toggle-btn ${importSource === "PO" ? "active" : ""}`}>
                                <FileText size={14} /> Nhập từ Đối Tác (PO)
                            </button>
                            <button onClick={() => setImportSource("TRANSFER")} className={`toggle-btn ${importSource === "TRANSFER" ? "active" : ""}`}>
                                <ArrowRightLeft size={14} /> Nhận hàng nội bộ
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        {/* ── Settings ── */}
                        <aside className="lg:col-span-1 flex flex-col gap-6">
                            <div className="sec-card h-full">
                                <div className="sec-head">
                                    <div className="sec-icon-wrap"><Package size={16} /></div>
                                    <span className="sec-title">Thông tin nguồn</span>
                                </div>
                                <div className="sec-body">
                                    {importSource === "PO" ? (
                                        <div className="inp-group">
                                            <label className="inp-label">Đơn mua hàng liên kết</label>
                                            <select
                                                className="inp-select"
                                                value={form.donMuaHangId}
                                                onChange={(e) => handleSelectPO(e.target.value)}
                                            >
                                                <option value="">-- Chọn đơn mua (PO) --</option>
                                                {poList.map(po => <option key={po.id} value={po.id}>{po.soDonMua} - {po.nhaCungCap?.tenNhaCungCap}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="inp-group">
                                            <label className="inp-label">Yêu cầu luân chuyển</label>
                                            <select
                                                className="inp-select"
                                                value={form.transferId}
                                                onChange={(e) => handleSelectTransfer(e.target.value)}
                                            >
                                                <option value="">-- Chọn chứng từ vận chuyển --</option>
                                                {transferList.map(t => <option key={t.id} value={t.id}>{t.soPhieuXuat} ({t.khoXuatTen} → {t.khoNhapTen})</option>)}
                                            </select>
                                        </div>
                                    )}

                                    <div className="inp-group">
                                        <label className="inp-label">Kho tiếp nhận</label>
                                        <div className="inp-text flex items-center font-bold bg-[#faf8f3] border-dashed">
                                            <Warehouse size={14} className="mr-2 opacity-50" />
                                            {form.khoId ? warehouses.find(k => k.id === parseInt(form.khoId))?.tenKho : "Tự động trích xuất"}
                                        </div>
                                    </div>

                                    <div className="inp-group">
                                        <label className="inp-label">Ghi chú phiếu</label>
                                        <textarea
                                            className="inp-area"
                                            placeholder="..."
                                            value={form.ghiChu}
                                            onChange={(e) => setForm(p => ({ ...p, ghiChu: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ── Content Preview ── */}
                        <div className="lg:col-span-2">
                            <div className="sec-card h-full">
                                <div className="sec-head justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="sec-icon-wrap"><ClipboardList size={16} /></div>
                                        <span className="sec-title">Mặt hàng dự kiến</span>
                                    </div>
                                    {importSource === "PO" && selectedPO && <span className="badge-tag gold">#{selectedPO.soDonMua}</span>}
                                    {importSource === "TRANSFER" && selectedTransfer && <span className="badge-tag indigo">#{selectedTransfer.soPhieuXuat}</span>}
                                </div>
                                <div className="flex-1 overflow-x-auto">
                                    {((importSource === "PO" && !selectedPO) || (importSource === "TRANSFER" && !selectedTransfer)) ? (
                                        <div className="h-[400px] flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                                            <Truck size={48} />
                                            <p className="font-mono text-xs uppercase tracking-widest italic">Vui lòng chọn nguồn chứng từ</p>
                                        </div>
                                    ) : (
                                        <table className="wh-tbl">
                                            <thead className="wh-thead">
                                                <tr>
                                                    <th className="wh-th">Sản phẩm</th>
                                                    <th className="wh-th text-center">Số lượng</th>
                                                    <th className="wh-th text-right">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody className="wh-tbody">
                                                {importSource === "PO" ? selectedPO.chiTietDonMuaHangs.map(ct => (
                                                    <tr key={ct.id}>
                                                        <td className="wh-td">
                                                            <div className="font-bold text-[#1a1612]">{ct.bienTheSanPham?.sanPham}</div>
                                                            <div className="font-mono text-[11px] text-[#b8860b] mt-0.5">{ct.bienTheSanPham?.maSku}</div>
                                                        </td>
                                                        <td className="wh-td text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-[11px] opacity-40">ORDERED: {ct.soLuongDat}</span>
                                                                <span className="font-black text-[#b8860b] text-base">{ct.soLuongNhapTay}</span>
                                                            </div>
                                                        </td>
                                                        <td className="wh-td text-right">
                                                            <span className="badge-tag gold">Waiting</span>
                                                        </td>
                                                    </tr>
                                                )) : selectedTransfer.items?.map(item => (
                                                    <tr key={item.id}>
                                                        <td className="wh-td">
                                                            <div className="font-bold text-[#1a1612]">{item.tenSanPham}</div>
                                                            <div className="font-mono text-[11px] text-[#b8860b] mt-0.5">{item.sku}</div>
                                                        </td>
                                                        <td className="wh-td text-center">
                                                            <span className="font-black text-[#6366f1] text-base">{item.soLuongCanXuat || item.soLuongDaPick}</span>
                                                        </td>
                                                        <td className="wh-td text-right">
                                                            <span className="badge-tag indigo">In Transit</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer Actions ── */}
                    <div className="flex justify-end gap-3">
                        <button onClick={createPhieu} disabled={actionLoading || !form.khoId} className="btn-white">Lưu nháp</button>
                        <button onClick={handleContinue} disabled={actionLoading || !form.khoId} className="btn-gold">
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                            {importSource === "PO" ? "Tiếp tục khai Lô" : "Nhập kho ngay"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}