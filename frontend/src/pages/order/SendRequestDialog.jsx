/**
 * SendRequestDialog.jsx
 * Dùng bienTheSanPhams có sẵn trong SanPhamQuanAoDto — không gọi API thêm.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronDown, ChevronRight, Search, Package, Send, Loader2,
    X, Check, Warehouse, FileText, ShoppingBag, Layers,
} from 'lucide-react';
import { productService } from '@/services/productService';

const PAGE_SIZE = 8;

/* ─── Chip biến thể đã chọn ──────────────────────────────────────── */
function VariantChip({ variant, productName, onRemove }) {
    const img = variant.anhBienThe?.tepTin?.duongDan;
    return (
        <span className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-800 max-w-[210px]">
            {img
                ? <img src={img} alt="" className="h-4 w-4 rounded-full object-cover shrink-0 border border-indigo-200" />
                : <Package className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
            }
            <span className="truncate">{productName}</span>
            <span className="text-indigo-300">·</span>
            <span className="font-mono text-indigo-600 shrink-0">{variant.maSku}</span>
            <button
                type="button"
                onClick={() => onRemove(variant.id)}
                className="ml-0.5 h-4 w-4 rounded-full bg-indigo-200 hover:bg-red-200 flex items-center justify-center transition-colors shrink-0"
            >
                <X className="h-2.5 w-2.5 text-indigo-700" />
            </button>
        </span>
    );
}

/* ─── Row một biến thể ───────────────────────────────────────────── */
function VariantRow({ variant, isSelected, onToggle }) {
    const img = variant.anhBienThe?.tepTin?.duongDan;
    const mau = variant.mauSac?.tenMauSac;
    const size = variant.size?.tenSize;
    const chat = variant.chatLieu?.tenChatLieu;

    return (
        <button
            type="button"
            onClick={() => onToggle(variant)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left group ${isSelected
                    ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                }`}
        >
            {/* Ảnh */}
            {img
                ? <img src={img} alt="" className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                : (
                    <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-slate-400" />
                    </div>
                )
            }

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-[13px] text-slate-800 truncate leading-tight">
                    {variant.tenBienThe || [mau, size, chat].filter(Boolean).join(' / ') || variant.maSku}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {mau && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            <span
                                className="h-2 w-2 rounded-full border border-slate-300 shrink-0"
                                style={{ background: variant.mauSac?.maHex || '#ccc' }}
                            />
                            {mau}
                        </span>
                    )}
                    {size && (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">{size}</span>
                    )}
                    <span className="font-mono text-[10px] text-amber-700 font-bold">{variant.maSku}</span>
                </div>
            </div>

            {/* Checkbox tùy chỉnh */}
            <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-300'
                }`}>
                {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </div>
        </button>
    );
}

/* ─── Card một sản phẩm ─────────────────────────────────────────── */
function ProductCard({ product, selectedVariantIds, onToggle }) {
    const [expanded, setExpanded] = useState(false);

    // Lấy trực tiếp từ bienTheSanPhams, lọc bỏ đã xóa (trangThai = 0)
    const variants = (product.bienTheSanPhams || []).filter(v => v.trangThai !== 0);
    const selectedCount = variants.filter(v => selectedVariantIds.has(v.id)).length;
    const allSelected = variants.length > 0 && variants.every(v => selectedVariantIds.has(v.id));

    // Ảnh đại diện sản phẩm: ưu tiên ảnh chính → ảnh đầu → ảnh biến thể đầu
    const mainImg =
        product.anhQuanAos?.find(a => a.anhChinh === 1)?.tepTin?.duongDan ||
        product.anhQuanAos?.[0]?.tepTin?.duongDan ||
        variants[0]?.anhBienThe?.tepTin?.duongDan;

    const handleSelectAll = (e) => {
        e.stopPropagation();
        variants.forEach(v => onToggle(v, product.tenSanPham, !allSelected));
    };

    return (
        <div className={`rounded-2xl border overflow-hidden transition-all ${selectedCount > 0
                ? 'border-indigo-300 shadow-[0_0_0_3px_rgba(99,102,241,0.08)]'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}>
            {/* ── Header sản phẩm ── */}
            <button
                type="button"
                onClick={() => setExpanded(p => !p)}
                className="w-full flex items-center gap-3 p-3.5 bg-white hover:bg-slate-50/70 transition-colors text-left"
            >
                {mainImg
                    ? <img src={mainImg} alt="" className="h-11 w-11 rounded-xl object-cover border border-slate-200 shrink-0" />
                    : (
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-5 w-5 text-slate-400" />
                        </div>
                    )
                }

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13.5px] text-slate-800 truncate leading-tight">{product.tenSanPham}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {product.danhMuc?.tenDanhMuc && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">
                                {product.danhMuc.tenDanhMuc}
                            </span>
                        )}
                        <span className="font-mono text-[10px] text-amber-700 font-bold">{product.maSanPham}</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                            <Layers className="h-3 w-3" />
                            {variants.length} biến thể
                        </span>
                    </div>
                </div>

                {selectedCount > 0 && (
                    <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {selectedCount}
                    </span>
                )}

                <ChevronRight className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {/* ── Panel biến thể (không cần fetch thêm) ── */}
            {expanded && (
                <div className="border-t border-slate-100 bg-[#fafbff] px-3.5 py-3 space-y-2">
                    {variants.length === 0 ? (
                        <p className="text-center text-[13px] text-slate-400 py-5">Sản phẩm này chưa có biến thể</p>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {variants.length} biến thể
                                </p>
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    {allSelected ? '− Bỏ chọn tất cả' : '+ Chọn tất cả'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {variants.map(v => (
                                    <VariantRow
                                        key={v.id}
                                        variant={v}
                                        isSelected={selectedVariantIds.has(v.id)}
                                        onToggle={(variant) => onToggle(variant, product.tenSanPham, !selectedVariantIds.has(variant.id))}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN DIALOG
═══════════════════════════════════════════════════════════════════ */
export default function SendRequestDialog({ open, onClose, onSubmit, submitting, warehouses }) {
    const [khoId, setKhoId] = useState('');
    const [ghiChu, setGhiChu] = useState('');

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Map<variantId, { variant, productName }>
    const [selected, setSelected] = useState(new Map());

    /* ── Fetch sản phẩm (bienTheSanPhams bundled sẵn) ── */
    const fetchProducts = async (pg = 0, term = '') => {
        setLoadingProducts(true);
        try {
            const res = await productService.filterProducts({
                page: pg,
                size: PAGE_SIZE,
                filters: term.trim()
                    ? [{ fieldName: 'tenSanPham', operation: 'LIKE', value: term.trim(), logicType: 'AND' }]
                    : [],
                sorts: [{ fieldName: 'ngayTao', direction: 'DESC' }],
            });
            const data = res?.data?.data || res?.data || {};
            setProducts(data.content || []);
            setTotalPages(data.totalPages || 0);
            setPage(pg);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (open) {
            setSelected(new Map());
            setKhoId('');
            setGhiChu('');
            setSearchTerm('');
            fetchProducts(0, '');
        }
    }, [open]);

    useEffect(() => {
        const t = setTimeout(() => { if (open) fetchProducts(0, searchTerm); }, 350);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const handleToggle = (variant, productName, select) => {
        setSelected(prev => {
            const next = new Map(prev);
            if (select) next.set(variant.id, { variant, productName });
            else next.delete(variant.id);
            return next;
        });
    };

    const handleSubmit = () => {
        if (!parseInt(khoId) || selected.size === 0) return;
        onSubmit({
            khoId: parseInt(khoId),
            bienTheSanPhamIds: Array.from(selected.keys()),
            ghiChu,
        });
    };

    const selectedIds = new Set(selected.keys());
    const selectedWarehouse = warehouses.find(k => k.id === parseInt(khoId));

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl rounded-2xl overflow-hidden p-0 border-0 shadow-2xl flex flex-col max-h-[90vh]">

                {/* ── Header ── */}
                <div className="bg-slate-900 px-6 py-5 flex items-center gap-3 shrink-0">
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                        <DialogTitle className="text-[17px] font-bold text-white m-0 leading-tight">
                            Gửi Yêu cầu Nhập Hàng
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-[12px] mt-0.5">
                            Chọn kho và biến thể sản phẩm cần nhập · Admin xét duyệt trước khi tạo đơn
                        </DialogDescription>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50">
                    <div className="p-5 space-y-4">

                        {/* Kho + Ghi chú */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Warehouse className="h-3.5 w-3.5" />
                                    Kho nhập <span className="text-rose-500">*</span>
                                </Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full h-10 justify-between rounded-xl border-slate-200 bg-white text-[13px] font-medium px-3 hover:bg-slate-50"
                                        >
                                            <span className={`truncate ${selectedWarehouse ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {selectedWarehouse ? selectedWarehouse.tenKho : 'Chọn kho...'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-40 shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[280px] max-h-[240px] overflow-y-auto bg-white rounded-xl shadow-xl border-slate-100 p-1">
                                        {warehouses.map(kho => (
                                            <DropdownMenuItem
                                                key={kho.id}
                                                onClick={() => setKhoId(String(kho.id))}
                                                className={`cursor-pointer p-2.5 rounded-lg flex flex-col items-start gap-0.5 ${khoId === String(kho.id) ? 'bg-indigo-50' : ''
                                                    }`}
                                            >
                                                <span className="font-bold text-[13px] text-slate-800">{kho.tenKho}</span>
                                                {kho.diaChi && <span className="text-[11px] text-slate-400">{kho.diaChi}</span>}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Ghi chú</Label>
                                <Input
                                    placeholder="Lý do yêu cầu..."
                                    value={ghiChu}
                                    onChange={e => setGhiChu(e.target.value)}
                                    className="h-10 rounded-xl border-slate-200 bg-white text-[13px]"
                                />
                            </div>
                        </div>

                        {/* ── Summary chips ── */}
                        {selected.size > 0 && (
                            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-3.5 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                                        <Check className="h-3 w-3" />
                                        Đã chọn {selected.size} biến thể
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelected(new Map())}
                                        className="text-[11px] font-semibold text-rose-500 hover:text-rose-700"
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from(selected.entries()).map(([id, { variant, productName }]) => (
                                        <VariantChip
                                            key={id}
                                            variant={variant}
                                            productName={productName}
                                            onRemove={(vid) => setSelected(prev => {
                                                const next = new Map(prev);
                                                next.delete(vid);
                                                return next;
                                            })}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Danh sách sản phẩm ── */}
                        <div className="space-y-2.5">
                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <ShoppingBag className="h-3.5 w-3.5" />
                                Chọn sản phẩm & biến thể <span className="text-rose-500">*</span>
                            </Label>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm tên sản phẩm..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10 rounded-xl border-slate-200 bg-white text-[13px]"
                                />
                            </div>

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
                            ) : (
                                <div className="space-y-2">
                                    {products.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            selectedVariantIds={selectedIds}
                                            onToggle={handleToggle}
                                        />
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-1">
                                    <Button
                                        type="button" variant="outline" size="sm"
                                        disabled={page === 0 || loadingProducts}
                                        onClick={() => fetchProducts(page - 1, searchTerm)}
                                        className="h-8 px-4 rounded-lg text-xs font-semibold"
                                    >← Trước</Button>
                                    <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-white rounded-lg border border-slate-200">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <Button
                                        type="button" variant="outline" size="sm"
                                        disabled={page >= totalPages - 1 || loadingProducts}
                                        onClick={() => fetchProducts(page + 1, searchTerm)}
                                        className="h-8 px-4 rounded-lg text-xs font-semibold"
                                    >Sau →</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Sticky footer ── */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-3.5 flex items-center justify-between gap-4">
                    <p className="text-[13px]">
                        {selected.size > 0
                            ? <span className="font-semibold text-indigo-700">✓ {selected.size} biến thể được chọn</span>
                            : <span className="text-slate-400 italic">Chưa chọn biến thể nào</span>
                        }
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button" variant="outline" onClick={onClose} disabled={submitting}
                            className="h-10 px-5 rounded-xl text-[13px] font-semibold"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="button" onClick={handleSubmit}
                            disabled={submitting || selected.size === 0 || !khoId}
                            className="h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold gap-2 shadow-md disabled:opacity-40"
                        >
                            {submitting
                                ? <><Loader2 className="h-4 w-4 animate-spin" />Đang gửi...</>
                                : <><Send className="h-4 w-4" />Gửi yêu cầu</>
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}