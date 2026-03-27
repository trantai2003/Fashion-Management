import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Thêm useSearchParams
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Search, Package, Send, Loader2,
    X, Check, Warehouse, FileText, ShoppingBag, Layers,
    ChevronRight, Calendar, Minus, Plus, Trash2
} from 'lucide-react';
import apiClient from '@/services/apiClient';
import { productService } from '@/services/productService';
import purchaseRequestService from '@/services/purchaseRequestService';

const PRODUCT_PAGE_SIZE = 8;

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

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(184,134,11,0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(184,134,11,0.4); }

.badge-tag {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 6px; text-transform: uppercase;
}
.badge-tag.gold { background: rgba(184,134,11,0.1); color: #b8860b; }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// ─── SectionCard layout ───────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, rightElement }) {
    return (
        <div className="sec-card h-full">
            <div className="sec-head justify-between">
                <div className="flex items-center gap-3">
                    <div className="sec-icon-wrap"><Icon size={16} /></div>
                    <span className="sec-title">{title}</span>
                </div>
                {rightElement}
            </div>
            <div className="sec-body">{children}</div>
        </div>
    );
}

// ─── VariantRow ───────────────────────────────────────────────────────────────
function VariantRow({ variant, selectedEntry, onToggle, onQtyChange }) {
    const img = variant.anhBienThe?.tepTin?.duongDan;
    const isSelected = !!selectedEntry;

    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isSelected ? 'bg-white border-[#b8860b]/40 shadow-sm' : 'bg-[#faf8f3] border-transparent hover:bg-black/5'}`}>
            <button type="button" onClick={() => onToggle(variant)} className="shrink-0">
                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#b8860b] border-[#b8860b]' : 'border-slate-300 bg-white'}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
            </button>

            {img
                ? <img src={img} alt="" className="h-9 w-9 rounded-lg object-cover border border-[#b8860b]/20 shrink-0" />
                : <div className="h-9 w-9 rounded-lg bg-white border border-[#b8860b]/10 flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-[#b8860b]/50" /></div>
            }

            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggle(variant)}>
                <p className={`text-[13px] leading-tight truncate ${isSelected ? 'font-bold text-[#1a1612]' : 'font-semibold text-slate-700'}`}>
                    {[variant.mauSac?.tenMau, variant.size?.maSize, variant.chatLieu?.tenChatLieu].filter(Boolean).join(' / ') || variant.maSku}
                </p>
                <p className="font-mono text-[10px] text-[#b8860b] mt-0.5">{variant.maSku}</p>
            </div>

            {isSelected && (
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => onQtyChange(variant.id, Math.max(1, (selectedEntry.soLuong || 1) - 1))}
                        className="h-7 w-7 rounded-md bg-[#b8860b]/10 hover:bg-[#b8860b]/20 flex items-center justify-center transition-colors">
                        <Minus className="h-3 w-3 text-[#b8860b]" />
                    </button>
                    <input
                        type="number"
                        min={1}
                        value={selectedEntry.soLuong || 1}
                        onChange={e => onQtyChange(variant.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center h-7 rounded-md border border-[#b8860b]/30 bg-white text-[13px] font-bold text-[#1a1612] focus:outline-none focus:ring-1 focus:ring-[#b8860b]"
                    />
                    <button type="button" onClick={() => onQtyChange(variant.id, (selectedEntry.soLuong || 1) + 1)}
                        className="h-7 w-7 rounded-md bg-[#b8860b]/10 hover:bg-[#b8860b]/20 flex items-center justify-center transition-colors">
                        <Plus className="h-3 w-3 text-[#b8860b]" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, selectedMap, onToggle, onQtyChange }) {
    const [expanded, setExpanded] = useState(false);
    const variants = (product.bienTheSanPhams || []).filter(v => v.trangThai !== 0);
    const selectedCount = variants.filter(v => selectedMap.has(v.id)).length;
    const allSelected = variants.length > 0 && variants.every(v => selectedMap.has(v.id));

    const mainImg =
        product.anhQuanAos?.find(a => a.anhChinh === 1)?.tepTin?.duongDan ||
        product.anhQuanAos?.[0]?.tepTin?.duongDan ||
        variants[0]?.anhBienThe?.tepTin?.duongDan;

    const handleSelectAll = (e) => {
        e.stopPropagation();
        variants.forEach(v => onToggle(v, product.tenSanPham, !allSelected));
    };

    return (
        <div className={`rounded-2xl border overflow-hidden transition-all ${selectedCount > 0 ? 'border-[#b8860b]/40 shadow-[0_0_0_3px_rgba(184,134,11,0.08)] bg-white' : 'border-[#b8860b]/10 bg-white'}`}>
            <button type="button" onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-[#faf8f3] transition-colors text-left">
                {mainImg
                    ? <img src={mainImg} alt="" className="h-12 w-12 rounded-xl object-cover border border-[#b8860b]/20 shrink-0" />
                    : <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#faf8f3] to-white border border-[#b8860b]/20 flex items-center justify-center shrink-0"><ShoppingBag className="h-5 w-5 text-[#b8860b]/50" /></div>
                }
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-[#1a1612] truncate">{product.tenSanPham}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {product.danhMuc?.tenDanhMuc && <span className="text-[10px] bg-[#b8860b]/10 text-[#b8860b] px-1.5 py-0.5 rounded-md font-bold uppercase">{product.danhMuc.tenDanhMuc}</span>}
                        <span className="font-mono text-[10px] text-[#8b6a21] font-bold">{product.maSanPham}</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium"><Layers className="h-3 w-3" />{variants.length} biến thể</span>
                    </div>
                </div>
                {selectedCount > 0 && (
                    <span className="shrink-0 h-6 min-w-[24px] px-2 rounded-full bg-[#b8860b] text-white text-[11px] font-bold flex items-center justify-center">{selectedCount}</span>
                )}
                <ChevronRight className={`h-4 w-4 text-[#b8860b] shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
                <div className="border-t border-[#b8860b]/10 bg-[#faf8f3]/50 px-3.5 py-3 space-y-2">
                    {variants.length === 0
                        ? <p className="text-center text-[13px] text-slate-400 py-5 italic">Sản phẩm này chưa có biến thể</p>
                        : (
                            <>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-[#b8860b] uppercase tracking-widest">{variants.length} biến thể</p>
                                    <button type="button" onClick={handleSelectAll} className="text-[11px] font-bold text-[#b8860b] hover:text-[#8b6a21]">
                                        {allSelected ? '− Bỏ chọn tất cả' : '+ Chọn tất cả'}
                                    </button>
                                </div>
                                <div className="space-y-1.5">
                                    {variants.map(v => (
                                        <VariantRow
                                            key={v.id}
                                            variant={v}
                                            selectedEntry={selectedMap.get(v.id)}
                                            onToggle={(variant) => onToggle(variant, product.tenSanPham, !selectedMap.has(variant.id))}
                                            onQtyChange={onQtyChange}
                                        />
                                    ))}
                                </div>
                            </>
                        )
                    }
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CreatePurchaseRequestPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); // Đọc query params

    // Form state
    const [khoId, setKhoId] = useState('');
    const [ngayGiaoDuKien, setNgayGiaoDuKien] = useState('');
    const [ghiChu, setGhiChu] = useState('');

    // Warehouses
    const [warehouses, setWarehouses] = useState([]);
    const [loadingWarehouses, setLoadingWarehouses] = useState(true);

    // Products
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [productPage, setProductPage] = useState(0);
    const [productTotalPages, setProductTotalPages] = useState(0);

    // Selected: Map<variantId, { variant, productName, soLuong }>
    const [selected, setSelected] = useState(new Map());

    // Submit
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    //Xử lý đọc Params từ URL
    useEffect(() => {
        const urlKhoId = searchParams.get('khoId');
        const urlBienTheId = searchParams.get('bienTheId');

        if (urlKhoId) {
            setKhoId(urlKhoId); // Tự động chọn kho trên form
        }
        if (urlKhoId && urlBienTheId) {
            findVariantInWarehouse(urlKhoId, urlBienTheId);
        }
    }, []);

    // Hàm  tìm biến thể bằng API lấy toàn bộ sản phẩm theo kho
    const findVariantInWarehouse = async (warehouseId, variantIdToFind) => {
        try {
            const res = await apiClient.get(`/api/v1/san-pham-quan-ao/theo-kho/${warehouseId}`);
            const productsInWarehouse = res.data?.data || res.data || [];

            let foundVariant = null;
            let parentProductName = '';

            // tìm trong toàn bộ sản phẩm của kho này để tìm đúng biến thể
            for (const product of productsInWarehouse) {
                if (product.bienTheSanPhams && product.bienTheSanPhams.length > 0) {
                    const match = product.bienTheSanPhams.find(v => String(v.id) === String(variantIdToFind));
                    if (match) {
                        foundVariant = match;
                        parentProductName = product.tenSanPham;
                        break; // Tìm thấy thì thoát vòng lặp ngay
                    }
                }
            }

            if (foundVariant) {
                // Đẩy vào danh sách đã chọn
                setSelected(prev => {
                    const next = new Map(prev);
                    if (!next.has(foundVariant.id)) {
                        next.set(foundVariant.id, { 
                            variant: foundVariant, 
                            productName: parentProductName, 
                            soLuong: 1 
                        });
                    }
                    return next;
                });
            } else {
                toast.error('Không tìm thấy biến thể này trong kho đã chọn!');
            }

        } catch (error) {
            console.error('Lỗi khi lục tìm biến thể theo kho:', error);
            toast.error('Không thể tải tự động sản phẩm từ link');
        }
    };

    // ── Load warehouses ──
    useEffect(() => {
        const load = async () => {
            setLoadingWarehouses(true);
            try {
                const res = await apiClient.post('/api/v1/kho/filter', {
                    filters: [], sorts: [{ fieldName: 'tenKho', direction: 'ASC' }], page: 0, size: 100,
                });
                setWarehouses(res.data?.data?.content || res.data?.content || []);
            } catch {
                toast.error('Không thể tải danh sách kho');
            } finally {
                setLoadingWarehouses(false);
            }
        };
        load();
    }, []);

    // ── Fetch products ──
    const fetchProducts = useCallback(async (pg = 0, term = '') => {
        setLoadingProducts(true);
        try {
            const res = await productService.filterProducts({
                page: pg, size: PRODUCT_PAGE_SIZE,
                filters: term.trim()
                    ? [{ fieldName: 'tenSanPham', operation: 'LIKE', value: term.trim(), logicType: 'AND' }]
                    : [],
                sorts: [{ fieldName: 'ngayTao', direction: 'DESC' }],
            });
            const data = res?.data?.data || res?.data || {};
            setProducts(data.content || []);
            setProductTotalPages(data.totalPages || 0);
            setProductPage(pg);
        } catch {
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoadingProducts(false);
        }
    }, []);

    useEffect(() => { fetchProducts(0, ''); }, [fetchProducts]);

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(0, searchTerm), 350);
        return () => clearTimeout(t);
    }, [searchTerm, fetchProducts]);

    // ── Selected handlers ──
    const handleToggle = (variant, productName, select) => {
        setSelected(prev => {
            const next = new Map(prev);
            if (select) next.set(variant.id, { variant, productName, soLuong: 1 });
            else next.delete(variant.id);
            return next;
        });
    };

    const handleQtyChange = (variantId, qty) => {
        setSelected(prev => {
            const next = new Map(prev);
            const entry = next.get(variantId);
            if (entry) next.set(variantId, { ...entry, soLuong: qty });
            return next;
        });
    };

    // ── Validate ──
    const validate = () => {
        if (!khoId) { toast.error('Vui lòng chọn kho nhập'); return false; }
        if (!ngayGiaoDuKien) { toast.error('Vui lòng chọn ngày giao dự kiến'); return false; }
        if (selected.size === 0) { toast.error('Vui lòng chọn ít nhất một biến thể sản phẩm'); return false; }
        return true;
    };

    // ── Submit ──
    const handleSubmit = () => {
        if (!validate()) return;
        setShowConfirmDialog(true);
    };

    const confirmCreate = async () => {
        setSubmitting(true);
        try {
            const payload = {
                khoNhapId: parseInt(khoId),
                ngayGiaoDuKien: new Date(ngayGiaoDuKien).toISOString(),
                ghiChu: ghiChu.trim() || null,
                chiTietYeuCauMuaHangs: Array.from(selected.values()).map(({ variant, soLuong }) => ({
                    bienTheSanPhamId: variant.id,
                    soLuongDat: soLuong,
                })),
            };
            await purchaseRequestService.create(payload);
            toast.success('Tạo yêu cầu mua hàng thành công! Chờ quản lý duyệt.');
            setShowConfirmDialog(false);
            setTimeout(() => navigate('/purchase-requests'), 1200);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể tạo yêu cầu. Vui lòng thử lại!');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedWarehouse = warehouses.find(w => w.id === parseInt(khoId));
    const totalItems = Array.from(selected.values()).reduce((s, e) => s + (e.soLuong || 1), 0);

    return (
        <>
            <style>{STYLES}</style>
            <div className="wh-root">
                <div className="wh-grid" />
                <div className="wh-orb-1" />

                <div className="wh-inner">
                    {/* ── Header ── */}
                    <button type="button" onClick={() => navigate('/purchase-requests')}
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-[#b8860b] transition-colors duration-150 mb-2">
                        <ArrowLeft size={16} />
                        Quay lại danh sách yêu cầu
                    </button>

                    <div>
                        <h1 className="text-3xl font-bold text-[#1a1612] font-['Playfair_Display'] tracking-tight">Tạo yêu cầu mua hàng</h1>
                        <p className="text-sm text-slate-500 mt-1">Điền thông tin và chọn sản phẩm cần nhập · Quản lý sẽ xét duyệt trước khi gửi báo giá</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">

                        {/* ── Card trái: Thông tin yêu cầu ── */}
                        <aside className="lg:col-span-5 flex flex-col gap-6">
                            <SectionCard title="Thông tin yêu cầu" icon={FileText}>
                                
                                {/* Kho nhập */}
                                <div className="inp-group">
                                    <label className="inp-label">Kho nhập <span className="text-rose-500">*</span></label>
                                    <select 
                                        className="inp-select font-semibold"
                                        value={khoId}
                                        onChange={e => setKhoId(e.target.value)}
                                        disabled={loadingWarehouses}
                                    >
                                        <option value="">-- Chọn kho nhập --</option>
                                        {warehouses.map(kho => (
                                            <option key={kho.id} value={kho.id}>
                                                {kho.tenKho} {kho.maKho ? `(${kho.maKho})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Ngày giao dự kiến */}
                                <div className="inp-group">
                                    <label className="inp-label">Ngày giao dự kiến <span className="text-rose-500">*</span></label>
                                    <input
                                        type="date"
                                        value={ngayGiaoDuKien}
                                        onChange={e => setNgayGiaoDuKien(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="inp-text font-semibold"
                                    />
                                </div>

                                {/* Ghi chú */}
                                <div className="inp-group">
                                    <label className="inp-label">Ghi chú</label>
                                    <textarea
                                        placeholder="Lý do yêu cầu, ghi chú cho quản lý..."
                                        value={ghiChu}
                                        onChange={e => setGhiChu(e.target.value)}
                                        rows={3}
                                        className="inp-area font-medium"
                                    />
                                </div>

                                {/* Summary đã chọn */}
                                {selected.size > 0 && (
                                    <div className="rounded-xl border border-[#b8860b]/20 bg-[#faf8f3] px-4 py-4 space-y-3 shadow-sm">
                                        <div className="flex items-center justify-between border-b border-[#b8860b]/10 pb-2">
                                            <span className="text-[11px] font-bold text-[#b8860b] uppercase tracking-wide flex items-center gap-1.5">
                                                <Check className="h-4 w-4" /> Đã chọn {selected.size} biến thể
                                            </span>
                                            <button type="button" onClick={() => setSelected(new Map())}
                                                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" /> Xóa tất cả
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                            {Array.from(selected.entries()).map(([id, { variant, productName, soLuong }]) => {
                                                const img = variant.anhBienThe?.tepTin?.duongDan;
                                                return (
                                                    <div key={id} className="flex items-center gap-2.5 bg-white rounded-lg border border-[#b8860b]/10 p-2 shadow-sm">
                                                        {img
                                                            ? <img src={img} alt="" className="h-8 w-8 rounded-md object-cover border border-[#b8860b]/20 shrink-0" />
                                                            : <div className="h-8 w-8 rounded-md bg-[#faf8f3] flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-[#b8860b]/40" /></div>
                                                        }
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[12px] font-bold text-[#1a1612] truncate">{productName}</p>
                                                            <p className="font-mono text-[10px] text-[#8b6a21] mt-0.5">{variant.maSku}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0 bg-[#faf8f3] p-0.5 rounded-md border border-[#b8860b]/10">
                                                            <button type="button" onClick={() => handleQtyChange(id, Math.max(1, soLuong - 1))}
                                                                className="h-6 w-6 rounded bg-white hover:bg-[#b8860b]/10 flex items-center justify-center shadow-sm">
                                                                <Minus className="h-3 w-3 text-[#b8860b]" />
                                                            </button>
                                                            <span className="text-[12px] font-black text-[#1a1612] w-6 text-center">{soLuong}</span>
                                                            <button type="button" onClick={() => handleQtyChange(id, soLuong + 1)}
                                                                className="h-6 w-6 rounded bg-white hover:bg-[#b8860b]/10 flex items-center justify-center shadow-sm">
                                                                <Plus className="h-3 w-3 text-[#b8860b]" />
                                                            </button>
                                                        </div>
                                                        <button type="button" onClick={() => { setSelected(prev => { const n = new Map(prev); n.delete(id); return n; }); }}
                                                            className="h-6 w-6 ml-1 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors">
                                                            <X className="h-3 w-3 text-rose-500" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </SectionCard>
                        </aside>

                        {/* ── Card phải: Chọn sản phẩm ── */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <SectionCard title="Chọn sản phẩm & biến thể" icon={ShoppingBag}
                                rightElement={
                                    <div className="relative w-64 hidden sm:block">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8860b]/50" />
                                        <input
                                            type="text"
                                            placeholder="Tìm tên sản phẩm..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="inp-text h-9 pl-9 text-[13px] !bg-white"
                                        />
                                    </div>
                                }
                            >
                                {/* Mobile Search */}
                                <div className="relative sm:hidden mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b8860b]/50" />
                                    <input
                                        type="text"
                                        placeholder="Tìm tên sản phẩm..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="inp-text pl-9 text-[13px] !bg-white"
                                    />
                                </div>

                                {/* Product list */}
                                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingProducts ? (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#b8860b]">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <p className="text-sm font-medium">Đang tải sản phẩm...</p>
                                        </div>
                                    ) : products.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-[#b8860b]/20 rounded-2xl bg-[#faf8f3] text-slate-500">
                                            <ShoppingBag className="h-10 w-10 opacity-30 text-[#b8860b]" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Không tìm thấy sản phẩm</p>
                                        </div>
                                    ) : products.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            selectedMap={selected}
                                            onToggle={handleToggle}
                                            onQtyChange={handleQtyChange}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {productTotalPages > 1 && (
                                    <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#b8860b]/10 mt-2">
                                        <Button type="button" variant="outline" size="sm"
                                            disabled={productPage === 0 || loadingProducts}
                                            onClick={() => fetchProducts(productPage - 1, searchTerm)}
                                            className="h-9 px-4 rounded-xl text-xs font-bold border-[#b8860b]/20 text-[#b8860b] hover:bg-[#b8860b]/10">← Trước</Button>
                                        <span className="text-xs text-[#1a1612] font-black px-4 py-1.5 bg-[#faf8f3] rounded-xl border border-[#b8860b]/20 shadow-sm">
                                            {productPage + 1} / {productTotalPages}
                                        </span>
                                        <Button type="button" variant="outline" size="sm"
                                            disabled={productPage >= productTotalPages - 1 || loadingProducts}
                                            onClick={() => fetchProducts(productPage + 1, searchTerm)}
                                            className="h-9 px-4 rounded-xl text-xs font-bold border-[#b8860b]/20 text-[#b8860b] hover:bg-[#b8860b]/10">Sau →</Button>
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex justify-end gap-3 mt-4">
                        <Button 
                            onClick={handleSubmit} 
                            disabled={submitting || selected.size === 0} 
                            className="flex items-center justify-center h-12 rounded-xl px-8 gap-2 bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a07409] hover:to-[#b8860b] text-white font-bold shadow-[0_4px_14px_rgba(184,134,11,0.25)] border-0 transition-all duration-300"
                        >
                            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Gửi yêu cầu mua hàng
                        </Button>
                    </div>

                    {/* ── Confirm Dialog ── */}
                    <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                        <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border border-[#b8860b]/20 shadow-2xl bg-white">
                            <div className="bg-gradient-to-r from-[#b8860b] to-[#d4af37] p-6 flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                                    <Send className="h-5 w-5 text-white" />
                                </div>
                                <DialogTitle className="text-xl font-bold text-white m-0 tracking-wide font-['Playfair_Display']">
                                    Xác nhận tạo yêu cầu
                                </DialogTitle>
                            </div>
                            <div className="p-6 bg-[#faf8f3]">
                                <DialogDescription className="text-[15px] text-slate-700 mb-6 leading-relaxed">
                                    Yêu cầu sẽ được gửi đến quản lý để xét duyệt. Sau khi duyệt, hệ thống sẽ tạo đơn báo giá gửi đến nhà cung cấp.
                                </DialogDescription>
                                
                                <div className="bg-white border border-[#b8860b]/20 shadow-sm rounded-xl p-4 space-y-3 mb-6 text-[14px]">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-slate-500 font-medium">Kho nhập:</span>
                                        <span className="font-bold text-[#1a1612] text-[15px]">{selectedWarehouse?.tenKho || '—'}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-slate-500 font-medium">Ngày giao:</span>
                                        <span className="font-bold text-[#1a1612] text-[15px]">{formatDate(ngayGiaoDuKien)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-slate-500 font-medium flex items-center gap-1.5"><Layers className="h-4 w-4"/> Tổng sản phẩm:</span>
                                        <span className="font-black text-[#b8860b] bg-[#b8860b]/10 px-2 py-0.5 rounded-lg text-[16px]">{totalItems} SP ({selected.size} biến thể)</span>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2">
                                    <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}
                                        className="h-11 rounded-xl font-semibold w-full sm:w-auto border-slate-300 text-slate-600 hover:bg-slate-100 bg-white">
                                        Hủy bỏ
                                    </Button>
                                    <Button onClick={confirmCreate} disabled={submitting}
                                        className="h-11 rounded-xl font-bold bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:from-[#a07409] hover:to-[#b8860b] text-white shadow-md border-0 w-full sm:w-auto transition-all">
                                        {submitting
                                            ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Đang tạo...</>
                                            : <><Check className="h-4 w-4 mr-2" />Xác nhận tạo</>
                                        }
                                    </Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}