import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { productService } from "@/services/productService.js";
import { toast } from "sonner";
import {
    Loader2, Search, Save, Printer, RefreshCcw, Package,
    Layers, Tag, ChevronDown, Check, Filter, DollarSign,
} from "lucide-react";

import BarcodePrint from "@/pages/product/components/product/BarcodePrint";
import { useToggle } from "@/hooks/useToggle";
import PaginationComponent from "./components/product/ProductComponent";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "1",   label: "Đang hoạt động" },
    { value: "0",   label: "Ngừng hoạt động" },
];

export default function SkuBuilder() {
    const [skus, setSkus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processedSkus, setProcessedSkus] = useState([]);

    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [isBarcodeModalOpen, openBarcodeModal, closeBarcodeModal] = useToggle(false);
    const [selectedSkusToPrint, setSelectedSkusToPrint] = useState([]);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchSkus = useCallback(async () => {
        try {
            setIsLoading(true);
            const payload = {
                page: 0,
                size: 1000,
                filters: [],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
            };
            const res = await productService.filterProducts(payload);
            const serverResponse = res.data;
            if (serverResponse?.status === 200) {
                const products = serverResponse.data.content || [];
                const flattenedSkus = [];
                products.forEach((product) => {
                    if (product.bienTheSanPhams?.length) {
                        product.bienTheSanPhams.forEach((variant) => {
                            flattenedSkus.push({
                                ...variant,
                                productId: product.id,
                                productName: product.tenSanPham,
                                productCode: product.maSanPham,
                                originalPrice: variant.giaBan,
                                originalCost: variant.giaVon,
                                image: variant.anhBienThe || (product.anhQuanAos?.[0]?.tepTin?.duongDan || product.anhQuanAos?.[0]?.urlAnh),
                            });
                        });
                    }
                });
                setSkus(flattenedSkus);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách SKU:", error);
            toast.error("Không thể tải danh sách SKU");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSkus(); }, [fetchSkus]);

    useEffect(() => {
        let result = [...skus];
        if (keyword.trim()) {
            const lk = keyword.toLowerCase();
            result = result.filter((sku) =>
                sku.productName?.toLowerCase().includes(lk) ||
                sku.maSku?.toLowerCase().includes(lk) ||
                sku.maVachSku?.toLowerCase().includes(lk) ||
                sku.maVach?.toLowerCase().includes(lk) ||
                sku.maBienThe?.toLowerCase().includes(lk)
            );
        }
        if (statusFilter !== "ALL") {
            result = result.filter((sku) => sku.trangThai === Number(statusFilter));
        }
        setProcessedSkus(result);
        setPage(0);
    }, [skus, keyword, statusFilter]);

    // ── Stats ──────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: skus.length,
        active: skus.filter((s) => s.trangThai === 1).length,
        inactive: skus.filter((s) => s.trangThai === 0).length,
        changed: skus.filter((s) => Number(s.giaBan) !== Number(s.originalPrice) || Number(s.giaVon) !== Number(s.originalCost)).length,
    }), [skus]);

    const handlePriceChange = (id, field, value) => {
        setSkus((prev) => prev.map((sku) => sku.id === id ? { ...sku, [field]: value } : sku));
    };

    const savePrice = async (sku) => {
        try {
            await productService.updateSkuPrice(sku.id, sku.giaBan, sku.giaVon);
            toast.success("Cập nhật giá thành công");
            setSkus((prev) =>
                prev.map((s) => s.id === sku.id ? { ...s, originalPrice: s.giaBan, originalCost: s.giaVon } : s)
            );
        } catch {
            toast.error("Không thể cập nhật giá");
        }
    };

    const handlePrintBarcode = (sku) => {
        setSelectedSkusToPrint([{ id: sku.productId, tenSanPham: sku.productName, bienTheSanPhams: [sku] }]);
        openBarcodeModal();
    };

    const currentPageSkus = processedSkus.slice(page * pageSize, (page + 1) * pageSize);

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Tổng biến thể</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Layers className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Ngừng hoạt động</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <Tag className="h-6 w-6 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-white">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chờ lưu giá</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.changed}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Filter ── */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Filter className="h-5 w-5 text-purple-600" />
                        Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Tìm kiếm */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm theo tên SP, SKU, Barcode..."
                                    className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Trạng thái</Label>
                            <DropdownMenu modal={false}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal"
                                    >
                                        <span className="truncate">
                                            {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => setStatusFilter(opt.value)}
                                            className="flex items-center justify-between cursor-pointer hover:bg-purple-50"
                                        >
                                            {opt.label}
                                            {statusFilter === opt.value && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Tải lại */}
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={fetchSkus}
                                disabled={isLoading}
                                className="flex items-center gap-2 w-full transition-all duration-300 hover:bg-purple-600 hover:text-white border-gray-300"
                            >
                                <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                Tải lại
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Table ── */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-gray-600">Đang tải danh sách biến thể...</span>
                </div>
            ) : processedSkus.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                            <Layers className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy biến thể nào</h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                            Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm để xem kết quả khác.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                        {/* Table header bar */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-semibold text-gray-800">Danh sách Biến thể &amp; Giá</span>
                            </div>
                            <span className="text-xs text-gray-500">
                                Tổng:{" "}
                                <span className="font-semibold text-purple-600">{processedSkus.length}</span> biến thể
                            </span>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10">
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <th className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 w-12">STT</th>
                                        <th className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">SKU</th>
                                        <th className="h-11 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Sản phẩm</th>
                                        <th className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Màu / Size</th>
                                        <th className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                                        <th className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Giá vốn</th>
                                        <th className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Giá bán</th>
                                        <th className="h-11 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {currentPageSkus.map((sku, index) => {
                                        const isPriceChanged = Number(sku.giaBan) !== Number(sku.originalPrice) || Number(sku.giaVon) !== Number(sku.originalCost);
                                        return (
                                            <tr key={`${sku.id}-${index}`} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                {/* STT */}
                                                <td className="px-4 py-3 align-middle text-center w-12">
                                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                                        {page * pageSize + index + 1}
                                                    </span>
                                                </td>

                                                {/* SKU */}
                                                <td className="px-4 py-3 align-middle">
                                                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 rounded px-2 py-0.5">
                                                        {sku.maSku || sku.maBienThe || sku.skuCode || "N/A"}
                                                    </span>
                                                </td>

                                                {/* Tên sản phẩm */}
                                                <td className="px-4 py-3 align-middle max-w-[220px]">
                                                    <p className="font-semibold text-slate-800 truncate text-sm" title={sku.productName}>
                                                        {sku.productName}
                                                    </p>
                                                    {sku.productCode && (
                                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{sku.productCode}</p>
                                                    )}
                                                </td>

                                                {/* Màu / Size */}
                                                <td className="px-4 py-3 align-middle text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {sku.mauSac?.tenMau && (
                                                            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                                                {sku.mauSac.tenMau}
                                                            </span>
                                                        )}
                                                        {sku.size?.tenSize && (
                                                            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                                {sku.size.tenSize}
                                                            </span>
                                                        )}
                                                        {!sku.mauSac?.tenMau && !sku.size?.tenSize && (
                                                            <span className="text-xs text-slate-400">—</span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Trạng thái */}
                                                <td className="px-4 py-3 align-middle text-center">
                                                    {sku.trangThai === 1 ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Hoạt động
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                            Ngừng HĐ
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Giá vốn */}
                                                <td className="px-4 py-3 align-middle text-center">
                                                    <Input
                                                        type="number"
                                                        className={`w-28 h-8 text-right text-xs mx-auto border-gray-200 focus:border-purple-400
                                                            ${isPriceChanged ? "border-amber-300 bg-amber-50" : ""}
                                                        `}
                                                        value={sku.giaVon}
                                                        onChange={(e) => handlePriceChange(sku.id, "giaVon", e.target.value)}
                                                    />
                                                </td>

                                                {/* Giá bán */}
                                                <td className="px-4 py-3 align-middle text-center">
                                                    <Input
                                                        type="number"
                                                        className={`w-28 h-8 text-right text-xs mx-auto border-gray-200 focus:border-purple-400
                                                            ${isPriceChanged ? "border-amber-300 bg-amber-50" : ""}
                                                        `}
                                                        value={sku.giaBan}
                                                        onChange={(e) => handlePriceChange(sku.id, "giaBan", e.target.value)}
                                                    />
                                                </td>

                                                {/* Thao tác */}
                                                <td className="px-4 py-3 align-middle">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {isPriceChanged && (
                                                            <button
                                                                type="button"
                                                                title="Lưu giá"
                                                                onClick={() => savePrice(sku)}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                                                            >
                                                                <Save className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            title="In Barcode"
                                                            onClick={() => handlePrintBarcode(sku)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-violet-600 hover:bg-violet-50 hover:border-violet-200"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <Card className="border-0 shadow-md bg-white">
                        <CardContent className="p-0">
                            <PaginationComponent
                                currentPage={page}
                                pageSize={pageSize}
                                totalItems={processedSkus.length}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                                isLoading={isLoading}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

            <BarcodePrint
                isOpen={isBarcodeModalOpen}
                onClose={closeBarcodeModal}
                products={selectedSkusToPrint}
            />
        </div>
    );
}
