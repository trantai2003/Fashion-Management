import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { productService } from "@/services/productService.js";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Search, Eye, Settings, Trash2, RefreshCcw, Package, Layers, TrendingUp } from "lucide-react";
import { useToggle } from "@/hooks/useToggle";
import AddProductModal from "@/pages/product/components/product/AddProductModal";
import EditProductModal from "@/pages/product/components/product/EditProductModal";
import ProductModal from "@/pages/product/components/product/ProductModal";
import ConfirmModal from "@/components/ui/confirm-modal";
import PaginationComponent from "./components/product/ProductComponent";
import { formatCurrency, formatDate } from "@/utils/formatters";
// ── 2 component mới ──────────────────────────────────────────────────────────
import InventoryDrawer from "@/pages/product/components/product/InventoryDrawer";
import TopSellingModal from "@/pages/product/components/product/TopSellingModal";

function buildProductFilterPayload(filters) {
    const filterList = [];

    if (filters.keyword?.trim()) {
        ["tenSanPham", "moTa"].forEach((field) => {
            filterList.push({
                fieldName: field,
                operation: "ILIKE",
                value: filters.keyword.trim(),
                logicType: "OR",
            });
        });
    }

    if (filters.danhMuc && filters.danhMuc !== "ALL") {
        filterList.push({
            fieldName: "danhMuc.id",
            operation: "EQUALS",
            value: Number(filters.danhMuc),
            logicType: "AND",
        });
    }

    if (filters.trangThai && filters.trangThai !== "ALL") {
        filterList.push({
            fieldName: "trangThai",
            operation: "EQUALS",
            value: Number(filters.trangThai),
            logicType: "AND",
        });
    }

    if (filters.giaTu && filters.giaTu !== "") {
        filterList.push({
            fieldName: "giaBanMacDinh",
            operation: "GREATER_THAN_OR_EQUAL",
            value: Number(filters.giaTu),
            logicType: "AND",
        });
    }

    if (filters.giaDen && filters.giaDen !== "") {
        filterList.push({
            fieldName: "giaBanMacDinh",
            operation: "LESS_THAN_OR_EQUAL",
            value: Number(filters.giaDen),
            logicType: "AND",
        });
    }

    return {
        page: filters.page,
        size: filters.size,
        filters: filterList,
        sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
    };
}

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

    const [filters, setFilters] = useState({
        keyword: "",
        danhMuc: "ALL",
        trangThai: "ALL",
        giaTu: "",
        giaDen: "",
        page: 0,
        size: 10,
    });

    const location = useLocation();
    const toastShownRef = useRef(false);
    const navigate = useNavigate();
    const searchTimeoutRef = useRef(null);

    const [isAddModalOpen, openAddModal, closeAddModal] = useToggle(false);
    const [isEditModalOpen, openEditModal, closeEditModal] = useToggle(false);
    const [isViewModalOpen, openViewModal, closeViewModal] = useToggle(false);
    const [isConfirmOpen, openConfirm, closeConfirm] = useToggle(false);

    // ── State mới: Inventory Drawer ──────────────────────────────────────────
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [selectedInventoryProduct, setSelectedInventoryProduct] = useState(null);

    // ── State mới: Top Selling Modal ─────────────────────────────────────────
    const [isTopSellingOpen, setIsTopSellingOpen] = useState(false);

    const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const STATUS_OPTIONS = useMemo(() => [
        { value: "ALL", label: "Tất cả trạng thái" },
        { value: "1", label: "Còn hàng" },
        { value: "0", label: "Hết hàng" },
        { value: "2", label: "Ngừng hoạt động" },
    ], []);

    const fetchCategories = useCallback(async () => {
        try {
            setIsCategoriesLoading(true);
            const res = await productService.getCategories();
            const serverResponse = res.data;
            if (serverResponse?.status === 200) setCategories(serverResponse.data || []);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            toast.error("Không thể tải danh mục sản phẩm");
        } finally {
            setIsCategoriesLoading(false);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const payload = buildProductFilterPayload(filters);
            const res = await productService.filterProducts(payload);
            const serverResponse = res.data;
            if (serverResponse?.status === 200) {
                const pageData = serverResponse.data;
                const statusOrder = { 1: 0, 0: 1, 2: 2 };
                const sortedContent = [...(pageData.content || [])].sort((a, b) => {
                    const orderA = statusOrder[a?.trangThai] ?? 99;
                    const orderB = statusOrder[b?.trangThai] ?? 99;
                    return orderA - orderB;
                });
                setProducts(sortedContent);
                setTotal(pageData.totalElements || 0);
            }
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm:", error.response?.data || error.message);
            toast.error("Không thể tải danh sách sản phẩm");
            setProducts([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(fetchProducts, filters.keyword ? 500 : 0);
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [filters, fetchProducts]);

    useEffect(() => {
        if (!location.state?.success || toastShownRef.current) return;
        toastShownRef.current = true;
        toast.success(location.state.message || "Thao tác thành công");
        navigate(location.pathname, { replace: true });
    }, [location.state, navigate, location.pathname]);

    const handleReset = useCallback(() => {
        setFilters({ keyword: "", danhMuc: "ALL", trangThai: "ALL", giaTu: "", giaDen: "", page: 0, size: 10 });
    }, []);

    const handleDeleteClick = useCallback((product) => {
        setProductToDelete(product);
        openConfirm();
    }, [openConfirm]);

    const handleConfirmDelete = useCallback(async () => {
        if (!productToDelete) return;
        try {
            setIsDeleting(true);
            await productService.deleteProduct(productToDelete.id);
            toast.success("Xóa sản phẩm thành công");
            closeConfirm();
            setProductToDelete(null);
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa sản phẩm");
        } finally {
            setIsDeleting(false);
        }
    }, [productToDelete, closeConfirm, fetchProducts]);

    const handleCancelDelete = useCallback(() => {
        if (!isDeleting) { setProductToDelete(null); closeConfirm(); }
    }, [isDeleting, closeConfirm]);

    const updateFilter = useCallback((field, value, resetPage = true) => {
        const actualValue = value?.target ? value.target.value : value;
        setFilters(prev => ({ ...prev, [field]: actualValue, ...(resetPage && { page: 0 }) }));
    }, []);

    const handleFilterChange = useMemo(() => ({
        keyword:  (e) => updateFilter("keyword", e),
        giaTu:    (e) => updateFilter("giaTu", e),
        giaDen:   (e) => updateFilter("giaDen", e),
        danhMuc:  (v) => updateFilter("danhMuc", v),
        trangThai:(v) => updateFilter("trangThai", v),
        size:     (v) => updateFilter("size", Number(v)),
        page:     (v) => updateFilter("page", v, false),
    }), [updateFilter]);

    const handleModalSuccess = useCallback(() => { fetchProducts(); }, [fetchProducts]);

    // ── Handlers Inventory Drawer ────────────────────────────────────────────
    const handleOpenInventory = useCallback((product) => {
        setSelectedInventoryProduct(product);
        setIsInventoryOpen(true);
    }, []);

    const handleCloseInventory = useCallback(() => {
        setIsInventoryOpen(false);
        setSelectedInventoryProduct(null);
    }, []);

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col min-h-0">

            {/* ── Filter card ── */}
            <div className="px-6 py-4 flex-none">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                    <CardContent className="p-4 space-y-3">
                        <div className="grid md:grid-cols-5 gap-4">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Tìm theo tên / mô tả sản phẩm
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={filters.keyword}
                                        onChange={handleFilterChange.keyword}
                                        placeholder="VD: Áo sơ mi, Váy công sở..."
                                        className="w-full h-10 pl-10 pr-3 text-sm focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                                        disabled={isLoading}
                                    />
                                    {isLoading && filters.keyword && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600 animate-spin" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">Trạng thái</Label>
                                <Select value={filters.trangThai} onValueChange={handleFilterChange.trangThai} disabled={isLoading}>
                                    <SelectTrigger className="w-full h-10 px-3 text-sm">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4}
                                                   className="z-50 bg-white border border-gray-200 shadow-lg rounded-md">
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s.value} value={s.value}
                                                        className={filters.trangThai === s.value
                                                            ? "bg-purple-600 text-white focus:bg-purple-600 focus:text-white"
                                                            : "focus:bg-gray-100"}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">Khoảng giá (VNĐ)</Label>
                                <div className="flex gap-2">
                                    <Input type="number" value={filters.giaTu} onChange={handleFilterChange.giaTu}
                                           placeholder="Từ" min="0"
                                           className="w-full h-10 px-3 text-sm focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                                           disabled={isLoading} />
                                    <Input type="number" value={filters.giaDen} onChange={handleFilterChange.giaDen}
                                           placeholder="Đến" min="0"
                                           className="w-full h-10 px-3 text-sm focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                                           disabled={isLoading} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading}
                                    className="flex items-center gap-2 transition-all duration-300 hover:bg-purple-600 hover:text-white border-gray-300">
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Reset lại
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Table card ── */}
            <div className="px-6 pb-4 flex-1 min-h-0">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm h-full min-h-0">
                    <CardContent className="p-0 flex flex-col h-full min-h-0">

                        {/* Table header bar */}
                        <div className="p-4 border-b flex-none flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-600" />
                                <div className="text-sm font-semibold text-gray-800">Danh sách Sản phẩm</div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Đang tải danh sách sản phẩm...
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-500">
                                        Tổng: <span className="font-semibold text-purple-600">{total}</span> sản phẩm
                                    </span>
                                )}

                                {/* ── Nút Top 10 bán chạy ── */}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setIsTopSellingOpen(true)}
                                    className="flex items-center gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                >
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Top bán chạy
                                </Button>

                                <Button size="sm" onClick={openAddModal}
                                        className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm">
                                    + Thêm sản phẩm
                                </Button>
                            </div>
                        </div>

                        {/* Table body */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                            <Table className="w-full">
                                <TableHeader>
                                    <TableRow className="bg-gray-50 text-xs text-gray-500">
                                        <TableHead className="px-4 py-3">ID</TableHead>
                                        <TableHead className="px-4 py-3">Hình ảnh</TableHead>
                                        <TableHead className="px-4 py-3">Tên sản phẩm</TableHead>
                                        <TableHead className="px-4 py-3">Giá bán</TableHead>
                                        <TableHead className="px-4 py-3">Trạng thái</TableHead>
                                        <TableHead className="px-4 py-3">Ngày tạo</TableHead>
                                        <TableHead className="px-4 py-3 text-center">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="text-sm text-gray-800">
                                    {/* Loading skeleton */}
                                    {isLoading && [...Array(5)].map((_, idx) => (
                                        <TableRow key={`skeleton-${idx}`} className="border-b">
                                            {[...Array(7)].map((__, ci) => (
                                                <TableCell key={ci} className="px-4 py-3">
                                                    <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${50 + ci * 8}%` }} />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}

                                    {/* Empty state */}
                                    {!isLoading && products.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Package className="h-12 w-12 text-gray-300" />
                                                    <div className="text-gray-500">
                                                        <div className="font-medium">Không có sản phẩm nào</div>
                                                        <div className="text-xs mt-1">
                                                            {filters.keyword || filters.danhMuc !== "ALL" || filters.trangThai !== "ALL"
                                                                ? "Thử điều chỉnh bộ lọc để tìm thấy sản phẩm"
                                                                : "Hãy thêm sản phẩm đầu tiên"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* Product rows */}
                                    {!isLoading && products.map((product) => (
                                        <TableRow key={product.id} className="border-b hover:bg-gray-50">
                                            <TableCell className="px-4 py-3">{product.id}</TableCell>

                                            <TableCell className="px-4 py-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {product.anhQuanAos?.[0]?.tepTin?.duongDan ? (
                                                        <img src={product.anhQuanAos[0].tepTin.duongDan}
                                                             alt={product.tenSanPham} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-[10px]">Không có ảnh</span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 font-semibold max-w-xs">
                                                <button
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                    className="truncate hover:text-purple-600 hover:underline cursor-pointer block text-left w-full"
                                                    title={product.tenSanPham}
                                                    type="button"
                                                >
                                                    {product.tenSanPham}
                                                </button>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 font-medium text-purple-700">
                                                {product.giaBanMacDinh ? formatCurrency(product.giaBanMacDinh) : "N/A"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {product.trangThai === 1 ? (
                                                    <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700">
                                                        Còn hàng
                                                    </span>
                                                ) : product.trangThai === 0 ? (
                                                    <span className="px-2 py-1 text-xs rounded bg-red-50 text-red-700">
                                                        Hết hàng
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                                                        Ngừng hoạt động
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {formatDate(product.ngayTao) !== "N/A" ? formatDate(product.ngayTao) : "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Xem chi tiết */}
                                                    <button
                                                        onClick={() => navigate(`/products/${product.id}`)}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
                                                        title="Xem chi tiết"
                                                        type="button"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* ── Tồn kho biến thể (NÚT MỚI) ── */}
                                                    <button
                                                        onClick={() => handleOpenInventory(product)}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-teal-600 hover:bg-teal-50 transition-colors"
                                                        title="Xem tồn kho chi tiết biến thể"
                                                    >
                                                        <Layers className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* Chỉnh sửa */}
                                                    <button
                                                        onClick={() => { setSelectedProductId(product.id); openEditModal(); }}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                                                        title="Chỉnh sửa">
                                                        <Settings className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* Xóa */}
                                                    <button
                                                        onClick={() => handleDeleteClick(product)}
                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Xóa sản phẩm">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <PaginationComponent
                            currentPage={filters.page}
                            pageSize={filters.size}
                            totalItems={total}
                            onPageChange={handleFilterChange.page}
                            onPageSizeChange={handleFilterChange.size}
                            isLoading={isLoading}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* ── Modals & Drawer ── */}
            <AddProductModal isOpen={isAddModalOpen} onClose={closeAddModal} onSuccess={handleModalSuccess} />

            <EditProductModal isOpen={isEditModalOpen}
                              onClose={() => { setSelectedProductId(null); closeEditModal(); }}
                              onSuccess={handleModalSuccess} productId={selectedProductId} />

            <ProductModal isOpen={isViewModalOpen}
                          onClose={() => { setSelectedProductId(null); closeViewModal(); }}
                          onSuccess={handleModalSuccess} productId={selectedProductId} />

            <ConfirmModal isOpen={isConfirmOpen} onClose={handleCancelDelete} onConfirm={handleConfirmDelete}
                          title="Xác nhận xóa sản phẩm"
                          description={productToDelete
                              ? `Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete.tenSanPham}"? Hành động này không thể hoàn tác.`
                              : "Bạn có chắc chắn muốn xóa sản phẩm này?"}
                          confirmText="Xóa" cancelText="Hủy" variant="danger" isLoading={isDeleting} />

            {/* ── Inventory Drawer ── */}
            <InventoryDrawer
                isOpen={isInventoryOpen}
                onClose={handleCloseInventory}
                product={selectedInventoryProduct}
            />

            {/* ── Top Selling Modal ── */}
            <TopSellingModal
                isOpen={isTopSellingOpen}
                onClose={() => setIsTopSellingOpen(false)}
            />
        </div>
    );
}