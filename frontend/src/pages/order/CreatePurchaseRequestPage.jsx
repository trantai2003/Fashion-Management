import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
    ArrowLeft, ChevronDown, Search, Package, Send, Loader2,
    X, Check, Warehouse, FileText, ShoppingBag, Layers,
    ChevronRight, Calendar, Minus, Plus, Trash2, AlertCircle,
} from 'lucide-react';
import apiClient from '@/services/apiClient';
import { productService } from '@/services/productService';
import purchaseRequestService from '@/services/purchaseRequestService';

const PRODUCT_PAGE_SIZE = 8;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// ─── VariantRow ───────────────────────────────────────────────────────────────
function VariantRow({ variant, selectedEntry, onToggle, onQtyChange }) {
    const img = variant.anhBienThe?.tepTin?.duongDan;
    const isSelected = !!selectedEntry;

    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
            {/* Checkbox area */}
            <button type="button" onClick={() => onToggle(variant)} className="shrink-0">
                <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
            </button>

            {/* Image */}
            {img
                ? <img src={img} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                : <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-slate-400" /></div>
            }

            {/* Info */}
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onToggle(variant)}>
                <p className="font-semibold text-[13px] text-slate-800 truncate leading-tight">
                    {[variant.mauSac?.tenMau, variant.size?.maSize, variant.chatLieu?.tenChatLieu].filter(Boolean).join(' / ') || variant.maSku}
                </p>
                <p className="font-mono text-[10px] text-amber-700 font-bold">{variant.maSku}</p>
            </div>

            {/* Quantity input (only when selected) */}
            {isSelected && (
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button type="button" onClick={() => onQtyChange(variant.id, Math.max(1, (selectedEntry.soLuong || 1) - 1))}
                        className="h-6 w-6 rounded-md bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                        <Minus className="h-3 w-3 text-slate-700" />
                    </button>
                    <input
                        type="number"
                        min={1}
                        value={selectedEntry.soLuong || 1}
                        onChange={e => onQtyChange(variant.id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-14 text-center h-6 rounded-md border border-indigo-300 bg-white text-[12px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <button type="button" onClick={() => onQtyChange(variant.id, (selectedEntry.soLuong || 1) + 1)}
                        className="h-6 w-6 rounded-md bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center transition-colors">
                        <Plus className="h-3 w-3 text-indigo-700" />
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
        <div className={`rounded-2xl border overflow-hidden transition-all ${selectedCount > 0 ? 'border-indigo-300 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]' : 'border-slate-200 bg-white'}`}>
            <button type="button" onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50/70 transition-colors text-left">
                {mainImg
                    ? <img src={mainImg} alt="" className="h-11 w-11 rounded-xl object-cover border border-slate-200 shrink-0" />
                    : <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0"><ShoppingBag className="h-5 w-5 text-slate-400" /></div>
                }
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13.5px] text-slate-800 truncate">{product.tenSanPham}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {product.danhMuc?.tenDanhMuc && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">{product.danhMuc.tenDanhMuc}</span>}
                        <span className="font-mono text-[10px] text-amber-700 font-bold">{product.maSanPham}</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium"><Layers className="h-3 w-3" />{variants.length} biến thể</span>
                    </div>
                </div>
                {selectedCount > 0 && (
                    <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{selectedCount}</span>
                )}
                <ChevronRight className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
                <div className="border-t border-slate-100 bg-[#fafbff] px-3.5 py-3 space-y-2">
                    {variants.length === 0
                        ? <p className="text-center text-[13px] text-slate-400 py-5">Sản phẩm này chưa có biến thể</p>
                        : (
                            <>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{variants.length} biến thể</p>
                                    <button type="button" onClick={handleSelectAll} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
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

// ─── SectionCard layout ───────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-bold text-slate-800 text-[14px]">{title}</p>
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CreatePurchaseRequestPage() {
    const navigate = useNavigate();

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

    // ── Load warehouses ──
    useEffect(() => {
        const load = async () => {
            setLoadingWarehouses(true);
            try {
                // Dùng endpoint filter chung hoặc endpoint kho
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
    const selectedIds = new Set(selected.keys());
    const totalItems = Array.from(selected.values()).reduce((s, e) => s + (e.soLuong || 1), 0);

    return (
        <div className="p-5 space-y-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-[calc(100vh-64px)]">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => navigate('/purchase-requests')}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách yêu cầu mua hàng
                </button>
                <div className="flex items-center gap-2">
                    {selected.size > 0 && (
                        <span className="text-[12px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                            ✓ {selected.size} biến thể · {totalItems} sản phẩm
                        </span>
                    )}
                </div>
            </div>

            {/* ── Page title ── */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tạo yêu cầu mua hàng</h1>
                <p className="text-sm text-slate-500 mt-0.5">Điền thông tin và chọn sản phẩm cần nhập · Quản lý sẽ xét duyệt trước khi gửi báo giá</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                {/* ── Card trái: Thông tin yêu cầu ── */}
                <SectionCard title="Thông tin yêu cầu" icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-600">

                    {/* Kho nhập */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Kho nhập <span className="text-rose-500">*</span>
                        </Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={loadingWarehouses}
                                    className="w-full h-11 justify-between font-medium rounded-xl border-slate-200 px-4 text-[14px] bg-white">
                                    <div className="flex items-center gap-2 truncate">
                                        <Warehouse className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className={`truncate ${selectedWarehouse ? 'text-slate-800' : 'text-slate-400'}`}>
                                            {loadingWarehouses ? 'Đang tải...' : selectedWarehouse ? selectedWarehouse.tenKho : 'Chọn kho nhập...'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[340px] max-h-[280px] overflow-y-auto bg-white rounded-xl shadow-xl border-slate-100 p-1">
                                {warehouses.map(kho => (
                                    <DropdownMenuItem key={kho.id} onClick={() => setKhoId(String(kho.id))}
                                        className={`cursor-pointer p-2.5 rounded-lg flex flex-col items-start gap-0.5 ${khoId === String(kho.id) ? 'bg-indigo-50' : ''}`}>
                                        <span className="font-bold text-[13px] text-slate-800">{kho.tenKho}</span>
                                        {(kho.maKho || kho.diaChi) && (
                                            <span className="text-[11px] text-slate-400">
                                                {[kho.maKho, kho.diaChi].filter(Boolean).join(' · ')}
                                            </span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Ngày giao dự kiến */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">
                            Ngày giao dự kiến <span className="text-rose-500">*</span>
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <Input
                                type="date"
                                value={ngayGiaoDuKien}
                                onChange={e => setNgayGiaoDuKien(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="pl-9 h-11 rounded-xl border-slate-200 text-[14px] bg-white"
                            />
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700">Ghi chú</Label>
                        <Textarea
                            placeholder="Lý do yêu cầu, ghi chú cho quản lý..."
                            value={ghiChu}
                            onChange={e => setGhiChu(e.target.value)}
                            rows={3}
                            className="rounded-xl border-slate-200 text-[14px] bg-white resize-none"
                        />
                    </div>

                    {/* Summary đã chọn */}
                    {selected.size > 0 && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                                    <Check className="h-3 w-3" /> Đã chọn {selected.size} biến thể
                                </span>
                                <button type="button" onClick={() => setSelected(new Map())}
                                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1">
                                    <Trash2 className="h-3 w-3" /> Xóa tất cả
                                </button>
                            </div>
                            <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                                {Array.from(selected.entries()).map(([id, { variant, productName, soLuong }]) => {
                                    const img = variant.anhBienThe?.tepTin?.duongDan;
                                    return (
                                        <div key={id} className="flex items-center gap-2 bg-white rounded-lg border border-indigo-100 px-2.5 py-1.5">
                                            {img
                                                ? <img src={img} alt="" className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0" />
                                                : <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><Package className="h-3.5 w-3.5 text-slate-400" /></div>
                                            }
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-semibold text-slate-700 truncate">{productName}</p>
                                                <p className="font-mono text-[10px] text-amber-700">{variant.maSku}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button type="button" onClick={() => handleQtyChange(id, Math.max(1, soLuong - 1))}
                                                    className="h-5 w-5 rounded bg-slate-200 hover:bg-slate-300 flex items-center justify-center">
                                                    <Minus className="h-2.5 w-2.5" />
                                                </button>
                                                <span className="text-[12px] font-bold text-slate-800 w-7 text-center">{soLuong}</span>
                                                <button type="button" onClick={() => handleQtyChange(id, soLuong + 1)}
                                                    className="h-5 w-5 rounded bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center">
                                                    <Plus className="h-2.5 w-2.5 text-indigo-700" />
                                                </button>
                                            </div>
                                            <button type="button" onClick={() => { setSelected(prev => { const n = new Map(prev); n.delete(id); return n; }); }}
                                                className="h-5 w-5 rounded-full bg-slate-200 hover:bg-red-200 flex items-center justify-center shrink-0 transition-colors">
                                                <X className="h-2.5 w-2.5 text-slate-600" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ── Card phải: Chọn sản phẩm ── */}
                <SectionCard title="Chọn sản phẩm & biến thể" icon={ShoppingBag} iconBg="bg-violet-100" iconColor="text-violet-600">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm tên sản phẩm..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 h-10 rounded-xl border-slate-200 bg-white text-[13px]"
                        />
                    </div>

                    {/* Product list */}
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                        {loadingProducts ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <p className="text-sm">Đang tải sản phẩm...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-400">
                                <ShoppingBag className="h-8 w-8 opacity-40" />
                                <p className="text-sm font-semibold text-slate-500">Không tìm thấy sản phẩm</p>
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
                        <div className="flex items-center justify-center gap-2 pt-1">
                            <Button type="button" variant="outline" size="sm"
                                disabled={productPage === 0 || loadingProducts}
                                onClick={() => fetchProducts(productPage - 1, searchTerm)}
                                className="h-8 px-4 rounded-lg text-xs font-semibold">← Trước</Button>
                            <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-white rounded-lg border border-slate-200">
                                {productPage + 1} / {productTotalPages}
                            </span>
                            <Button type="button" variant="outline" size="sm"
                                disabled={productPage >= productTotalPages - 1 || loadingProducts}
                                onClick={() => fetchProducts(productPage + 1, searchTerm)}
                                className="h-8 px-4 rounded-lg text-xs font-semibold">Sau →</Button>
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* ── Action Buttons ── */}
            <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate('/purchase-requests')}
                    className="h-11 rounded-xl px-6 font-semibold border-slate-200">
                    Hủy bỏ
                </Button>
                <Button onClick={handleSubmit}
                    className="h-11 rounded-xl px-6 gap-2 bg-slate-900 hover:bg-slate-700 text-white font-semibold shadow-md">
                    <Send className="h-4 w-4" />
                    Gửi yêu cầu
                </Button>
            </div>

            {/* ── Confirm Dialog ── */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-slate-900 p-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">Xác nhận tạo yêu cầu</DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 mb-5">
                            Yêu cầu sẽ được gửi đến quản lý để xét duyệt. Sau khi duyệt, hệ thống sẽ tạo đơn báo giá gửi đến nhà cung cấp.
                        </DialogDescription>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 mb-5 text-[14px]">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Kho nhập:</span>
                                <span className="font-bold text-slate-800">{selectedWarehouse?.tenKho || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Ngày giao dự kiến:</span>
                                <span className="font-bold text-slate-800">{formatDate(ngayGiaoDuKien)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Số biến thể:</span>
                                <span className="font-bold text-indigo-700">{selected.size} biến thể</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Tổng số lượng:</span>
                                <span className="font-bold text-slate-800">{totalItems} sản phẩm</span>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto">Hủy bỏ</Button>
                            <Button onClick={confirmCreate} disabled={submitting}
                                className="h-11 rounded-xl font-semibold bg-slate-900 hover:bg-slate-700 text-white shadow-md w-full sm:w-auto">
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
    );
}