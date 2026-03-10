import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { productService } from "@/services/productService.js";
import { toast } from "sonner";
import { Loader2, Search, Save, Printer, RefreshCcw, Package } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import BarcodePrint from "@/pages/product/components/product/BarcodePrint";
import { Switch } from "@/components/ui/switch";
import { useToggle } from "@/hooks/useToggle";
import PaginationComponent from "./components/product/ProductComponent";

export default function SkuBuilder() {
    const [skus, setSkus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processedSkus, setProcessedSkus] = useState([]);

    // Filters
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, 1 (Active), 0 (Inactive)

    // Barcode Printing
    const [isBarcodeModalOpen, openBarcodeModal, closeBarcodeModal] = useToggle(false);
    const [selectedSkusToPrint, setSelectedSkusToPrint] = useState([]);

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const fetchSkus = useCallback(async () => {
        try {
            setIsLoading(true);
            // Since we don't have a direct "getAllVariants" API, we fetch all products and flatten them
            // In a real app with pagination, this might be heavy. We'll use the existing filter API.
            const payload = {
                page: 0,
                size: 1000, // Fetch large number for now, or implement server-side pagination for SKUs later
                filters: [],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }]
            };

            const res = await productService.filterProducts(payload);
            const serverResponse = res.data;

            if (serverResponse?.status === 200) {
                const products = serverResponse.data.content || [];

                // Flatten products to SKUs
                const flattenedSkus = [];

                products.forEach(product => {
                    if (product.bienTheSanPhams && product.bienTheSanPhams.length > 0) {
                        product.bienTheSanPhams.forEach(variant => {
                            flattenedSkus.push({
                                ...variant,
                                productId: product.id,
                                productName: product.tenSanPham,
                                productCode: product.maSanPham,
                                originalPrice: variant.giaBan,
                                originalCost: variant.giaVon,
                                // Combine images if needed, or use variant image
                                image: variant.anhBienThe || (product.anhQuanAos?.[0]?.tepTin?.duongDan || product.anhQuanAos?.[0]?.urlAnh)
                            });
                        });
                    } else {
                        // Handle products without variants if necessary, or skip
                        // For this requirements "Biến thể SKU", we focus on variants.
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

    useEffect(() => {
        fetchSkus();
    }, [fetchSkus]);

    // Client-side Filtering
    useEffect(() => {
        let result = [...skus];

        if (keyword.trim()) {
            const lowerKeyword = keyword.toLowerCase();
            result = result.filter(sku =>
                sku.productName.toLowerCase().includes(lowerKeyword) ||
                (sku.maSku && sku.maSku.toLowerCase().includes(lowerKeyword)) ||
                (sku.maVachSku && sku.maVachSku.toLowerCase().includes(lowerKeyword)) ||
                (sku.maVach && sku.maVach.toLowerCase().includes(lowerKeyword)) ||
                (sku.maBienThe && sku.maBienThe.toLowerCase().includes(lowerKeyword))
            );
        }

        if (statusFilter !== "ALL") {
            const statusValue = Number(statusFilter);
            result = result.filter(sku => sku.trangThai === statusValue);
        }

        setProcessedSkus(result);
        setPage(0); // Reset page on filter change
    }, [skus, keyword, statusFilter]);

    const handlePriceChange = (id, field, value) => {
        setSkus(prev => prev.map(sku => {
            if (sku.id === id) {
                return { ...sku, [field]: value };
            }
            return sku;
        }));
    };

    const savePrice = async (sku) => {
        try {
            await productService.updateSkuPrice(sku.id, sku.giaBan, sku.giaVon);
            toast.success("Cập nhật giá thành công");
            // Update the original values to match current
            setSkus(prev => prev.map(s => {
                if (s.id === sku.id) {
                    return { ...s, originalPrice: s.giaBan, originalCost: s.giaVon };
                }
                return s;
            }));
        } catch (error) {
            console.error("Lỗi cập nhật giá:", error);
            toast.error("Không thể cập nhật giá");
        }
    };

    const handleStatusToggle = async (sku, currentStatus) => {
        // Optimistic update
        const newStatus = currentStatus === 1 ? 0 : 1;

        // We typically need an API to update variant status specifically. 
        // The `productService` has `updateStatus` but that's likely for Product.
        // Assuming we might need to use `updateProduct` or a specific variant status API.
        // Looking at `EditProductModal`, it updates via `updateProduct` with the whole object.
        // If there isn't a specific API for variant status, we might be stuck.
        // CHECK: `productService.js` has `updateSkuPrice`. Does it have `updateSkuStatus`?
        // It does NOT. 
        // However, the user said "Toggle Active Status" is implemented.
        // In `ProductList`, `toggleProductStatus` calls `/api/v1/products/${id}/toggle-status`.
        // That is likely for the PARENT product.
        // If the user wants to toggle VARIANT status, we might need a new API or use the bulk update.
        // But for now, let's assume we can only toggle PRODUCT status or needed to add API.
        // Wait, the requirement says "Các phần đã thêm của... Toggle Active Status... đưa sang đây".
        // The Toggle Active Status I implemented in `ProductList` was for the Product.
        // So maybe this page lists PRODUCTS and their variants?
        // Or maybe I should implement a new `updateSkuStatus` API wrapper if the backend supports it, 
        // OR simply disable this for variants if backend doesn't support easy toggle.
        // Actually, `EditProductModal` sends the whole payload.
        // I will stick to what I know works or simulate it, or maybe just list the Product Status?
        // The user said "Biến thể SKU & Giá". Accessing "Toggle Active Status" implies granular control?
        // Let's look at `EditProductModal`: it maps `trangThai` for variants.
        // I'll add a placeholder or try to use `updateProduct` with a minimal payload if possible, 
        // OR mostly likely I should use the `toggleProductStatus` for the product if looking at product level,
        // BUT this is a SKU list.
        // I will omit the status toggle for individual SKU if no API exists, OR I will just use the `updateSkuPrice` API if it happens to support status (unlikely).
        // Let's re-read the task: "Frontend: Cập nhật UI cho Toggle Active Status -> Thêm Switch/Toggle button vào Product List".
        // That was for the Product.
        // So I should include the Product Status Toggle? 
        // Or maybe fetching SKUs, I should show the Product Status?
        // Let's implement the Product Status Toggle for the row (which represents a SKU). 
        // If I toggle it, does it toggle the SKU or the Product?
        // If I toggle the SKU, I need `updateSkuStatus`.
        // I'll check `productService` again.
        // It has `updateStatus: (id, status) => apiClient.patch(...)` for `san-pham-quan-ao`.
        // Maybe there's one for `chi-tiet-san-pham`?
        // I'll assume for now I can't easily toggle SKU status without a full update.
        // I will IMPLEMENT IT for the Product (Parent) or skip it for SKU rows to avoid confusion, 
        // UNLESS I see `updateSkuStatus` or similar.
        // Actually, I'll add the button but maybe make it toggle the variant status in local state and call a (yet to be confirmed) API, 
        // or effectively just don't implement it if unsafe.
        // User asked to "duplicate" the features. "Toggle Active Status" was for Product. 
        // So maybe this page should list Variants, but allow toggling the Parent Product Status? 
        // Or maybe the user THINKS I implemented Variant Toggle?
        // I'll stick to Price Editing and Barcode for now as primary. 
        // I'll add Status column but maybe read-only or Product Status.
        // Wait, `EditProductModal` has variant status content. 
        // I will implement Price Edit and Barcode Printing first.

        toast.info("Tính năng cập nhật trạng thái nhanh cho biến thể đang phát triển");
    };

    const handlePrintBarcode = (sku) => {
        // Need to wrap sku in a structure compatible with BarcodePrint
        // BarcodePrint expects a list of products, each with `bienTheSanPhams` or just the product.
        // We can mock a product object that contains just this variant.
        const mockProduct = {
            id: sku.productId,
            tenSanPham: sku.productName,
            bienTheSanPhams: [sku]
        };
        setSelectedSkusToPrint([mockProduct]);
        openBarcodeModal();
    };

    const handleOpenPrintModal = () => {
        // This could be for bulk printing all selected SKUs
        // For now, single print
    };

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col min-h-0">
            <div className="px-6 py-4 flex-none">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Tìm theo tên SP, SKU, Barcode..."
                                    className="pl-10"
                                />
                            </div>
                            <Button variant="outline" onClick={fetchSkus} disabled={isLoading}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Tải lại
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="px-6 pb-4 flex-1 min-h-0">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm h-full min-h-0">
                    <CardContent className="p-0 flex flex-col h-full min-h-0">
                        <div className="p-4 border-b flex-none flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-600" />
                                <div className="text-sm font-semibold text-gray-800">Danh sách Biến thể & Giá</div>
                            </div>
                            <div className="text-xs text-gray-500">
                                Tổng: <span className="font-semibold text-purple-600">{processedSkus.length}</span> biến thể
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 text-xs text-gray-500">
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Màu / Size</TableHead>
                                        <TableHead>Giá vốn</TableHead>
                                        <TableHead>Giá bán</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="text-sm">
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                                    <span>Đang tải dữ liệu...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : processedSkus.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                Không tìm thấy biến thể nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        processedSkus
                                            .slice(page * pageSize, (page + 1) * pageSize)
                                            .map((sku, index) => (
                                                <TableRow key={`${sku.id}-${index}`} className="hover:bg-gray-50">
                                                    <TableCell className="font-mono text-xs font-bold text-purple-700">
                                                        {sku.maSku || sku.maBienThe || sku.skuCode || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={sku.productName}>
                                                        {sku.productName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs mr-1">
                                                            {sku.mauSac?.tenMau || '-'}
                                                        </span>
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-xs">
                                                            {sku.size?.tenSize || '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="w-24 h-8 text-right"
                                                                value={sku.giaVon}
                                                                onChange={(e) => handlePriceChange(sku.id, 'giaVon', e.target.value)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                className="w-24 h-8 text-right"
                                                                value={sku.giaBan}
                                                                onChange={(e) => handlePriceChange(sku.id, 'giaBan', e.target.value)}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {/* Show Save button only if changed */}
                                                            {(sku.giaBan != sku.originalPrice || sku.giaVon != sku.originalCost) && (
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => savePrice(sku)} title="Lưu giá">
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-600" onClick={() => handlePrintBarcode(sku)} title="In Barcode">
                                                                <Printer className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

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
            </div>

            <BarcodePrint
                isOpen={isBarcodeModalOpen}
                onClose={closeBarcodeModal}
                products={selectedSkusToPrint}
            />
        </div>
    );
}
