import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { productService } from "@/services/productService.js";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Search, Eye, Edit, Trash2, RefreshCcw, Package, Layers, Plus, CheckCircle2, XCircle, ShoppingBag, ChevronDown, ChevronLeft, ChevronRight, Check, Filter } from "lucide-react";
import { useToggle } from "@/hooks/useToggle";
import AddProductModal from "@/pages/product/components/product/AddProductModal";
import EditProductModal from "@/pages/product/components/product/EditProductModal";
import ProductModal from "@/pages/product/components/product/ProductModal";
import ConfirmModal from "@/components/ui/confirm-modal";
import { formatCurrency, formatDate } from "@/utils/formatters";
import InventoryDrawer from "@/pages/product/components/product/InventoryDrawer";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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
    const [isViewModalOpen, , closeViewModal] = useToggle(false);
    const [isConfirmOpen, openConfirm, closeConfirm] = useToggle(false);

    // ── State mới: Inventory Drawer ──────────────────────────────────────────
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [selectedInventoryProduct, setSelectedInventoryProduct] = useState(null);


    const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const STATUS_OPTIONS = useMemo(() => [
        { value: "ALL", label: "Tất cả trạng thái" },
        { value: "1", label: "Còn hàng" },
        { value: "0", label: "Hết hàng" },
        { value: "2", label: "Ngừng hoạt động" },
    ], []);

    // ── Global stats: đếm toàn bộ không phụ thuộc trang ─────────────────────
    const [globalStats, setGlobalStats] = useState({ conHang: 0, hetHang: 0, ngungHoatDong: 0 });

    const fetchGlobalStats = useCallback(async () => {
        try {
            const makePayload = (trangThai) => ({
                page: 0,
                size: 1,
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: trangThai, logicType: "AND" }],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
            });
            const [r1, r0, r2] = await Promise.all([
                productService.filterProducts(makePayload(1)),
                productService.filterProducts(makePayload(0)),
                productService.filterProducts(makePayload(2)),
            ]);
            setGlobalStats({
                conHang:        r1.data?.data?.totalElements ?? 0,
                hetHang:        r0.data?.data?.totalElements ?? 0,
                ngungHoatDong:  r2.data?.data?.totalElements ?? 0,
            });
        } catch {
            // ignore stats error silently
        }
    }, []);

    useEffect(() => { fetchGlobalStats(); }, [fetchGlobalStats]);

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

    const handleModalSuccess = useCallback(() => { fetchProducts(); fetchGlobalStats(); }, [fetchProducts, fetchGlobalStats]);

    // ── Handlers Inventory Drawer ────────────────────────────────────────────
    const handleOpenInventory = useCallback((product) => {
        setSelectedInventoryProduct(product);
        setIsInventoryOpen(true);
    }, []);

    const handleCloseInventory = useCallback(() => {
        setIsInventoryOpen(false);
        setSelectedInventoryProduct(null);
    }, []);

    const totalPages = Math.max(1, Math.ceil(total / filters.size));

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

                {/* ══ STATS ════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Còn hàng</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{globalStats.conHang}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-gray-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Hết hàng</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{globalStats.hetHang}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-6 w-6 text-red-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ngừng hoạt động</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{globalStats.ngungHoatDong}</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ══ BỘ LỌC TÌM KIẾM ═════════════════════════════════════════════ */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Filter className="h-5 w-5 text-purple-600" />
                            Bộ lọc tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            {/* Tìm kiếm */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm theo tên, mô tả sản phẩm..."
                                        className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                        value={filters.keyword}
                                        onChange={handleFilterChange.keyword}
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
                                                {filters.trangThai === "ALL" && "Tất cả trạng thái"}
                                                {filters.trangThai === "1"   && "Còn hàng"}
                                                {filters.trangThai === "0"   && "Hết hàng"}
                                                {filters.trangThai === "2"   && "Ngừng hoạt động"}
                                            </span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-[200px] bg-white border border-gray-100 shadow-xl z-50"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <DropdownMenuItem
                                                key={s.value}
                                                onClick={() => handleFilterChange.trangThai(s.value)}
                                                className="flex items-center justify-between cursor-pointer hover:bg-purple-50"
                                            >
                                                {s.label}
                                                {filters.trangThai === s.value && <Check className="h-4 w-4" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Giá từ */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Giá từ</Label>
                                <Input
                                    type="number"
                                    value={filters.giaTu}
                                    onChange={handleFilterChange.giaTu}
                                    placeholder="Giá từ"
                                    min="0"
                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Giá đến */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Giá đến</Label>
                                <Input
                                    type="number"
                                    value={filters.giaDen}
                                    onChange={handleFilterChange.giaDen}
                                    placeholder="Đến"
                                    min="0"
                                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Đặt lại */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 w-full transition-all duration-300 hover:bg-purple-600 hover:text-white border-gray-300"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ══ ACTION BUTTONS (dưới bộ lọc) ════════════════════════════════ */}
                <div className="flex items-center justify-end gap-3">
                    <Button
                        onClick={openAddModal}
                        className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm sản phẩm
                    </Button>
                </div>

                {/* ══ TABLE / LOADING / EMPTY ══════════════════════════════════════ */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        <span className="ml-3 text-gray-600">Đang tải danh sách sản phẩm...</span>
                    </div>
                ) : products.length === 0 ? (
                    /* ── Empty State ── */
                    <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                <Package className="h-10 w-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy sản phẩm</h3>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                Hiện tại chưa có dữ liệu sản phẩm phù hợp. Hãy thử thay đổi bộ lọc hoặc từ
                                khoá tìm kiếm để xem kết quả khác.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Bảng dữ liệu ── */}
                        <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            {/* Bảng có chiều cao cố định, cuộn bên trong */}
                            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 w-14">
                                                STT
                                            </th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Hình ảnh
                                            </th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Tên sản phẩm
                                            </th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Giá bán
                                            </th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Trạng thái
                                            </th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Ngày tạo
                                            </th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                                                Thao tác
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {products.map((product, index) => (
                                            <tr
                                                key={product.id}
                                                className="transition-colors duration-150 hover:bg-violet-50/50"
                                            >
                                                {/* STT */}
                                                <td className="px-4 py-3.5 align-middle text-center w-14 text-slate-500 text-xs">
                                                    {filters.page * filters.size + index + 1}
                                                </td>

                                                {/* Hình ảnh */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                                                        {product.anhQuanAos?.[0]?.tepTin?.duongDan ? (
                                                            <img
                                                                src={product.anhQuanAos[0].tepTin.duongDan}
                                                                alt={product.tenSanPham}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <Package className="h-5 w-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Tên sản phẩm */}
                                                <td className="px-4 py-3.5 align-middle max-w-[260px]">
                                                    <Link
                                                        to={`/products/${product.id}`}
                                                        title={product.tenSanPham}
                                                        className="block w-full text-left font-semibold text-slate-900 leading-snug truncate hover:text-violet-600 hover:underline cursor-pointer"
                                                    >
                                                        {product.tenSanPham}
                                                    </Link>
                                                    {product.moTa && (
                                                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                                                            {product.moTa}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Giá bán */}
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1">
                                                        <span className="text-xs font-semibold text-emerald-700">
                                                            {product.giaBanMacDinh ? formatCurrency(product.giaBanMacDinh) : "N/A"}
                                                        </span>
                                                    </span>
                                                </td>

                                                {/* Trạng thái */}
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    {product.trangThai === 1 ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Còn hàng
                                                        </span>
                                                    ) : product.trangThai === 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                            Hết hàng
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                            Ngừng hoạt động
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Ngày tạo */}
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className="text-sm text-slate-500">
                                                        {formatDate(product.ngayTao) !== "N/A" ? formatDate(product.ngayTao) : "-"}
                                                    </span>
                                                </td>

                                                {/* Thao tác */}
                                                <td className="px-4 py-3.5 align-middle">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            title="Xem chi tiết"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-violet-600 hover:bg-violet-50 hover:border-violet-200"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            title="Tồn kho biến thể"
                                                            onClick={() => handleOpenInventory(product)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                                        >
                                                            <Layers className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Chỉnh sửa"
                                                            onClick={() => { setSelectedProductId(product.id); openEditModal(); }}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            title="Xóa sản phẩm"
                                                            onClick={() => handleDeleteClick(product)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-red-500 hover:bg-red-50 hover:border-red-200"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Pagination ── */}
                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {/* Số dòng hiển thị */}
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-[120px] justify-between font-normal bg-white border-gray-200"
                                                >
                                                    {filters.size} dòng
                                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                                {[5, 10, 20, 50, 100].map(size => (
                                                    <DropdownMenuItem
                                                        key={size}
                                                        onClick={() => handleFilterChange.size(size)}
                                                        className="cursor-pointer"
                                                    >
                                                        {size} dòng
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Thông tin trang */}
                                    <div className="text-sm text-gray-600">
                                        Hiển thị{" "}
                                        <span className="font-semibold text-gray-900">
                                            {filters.page * filters.size + 1}
                                        </span>
                                        {" "}-{" "}
                                        <span className="font-semibold text-gray-900">
                                            {Math.min((filters.page + 1) * filters.size, total)}
                                        </span>
                                        {" "}trong tổng số{" "}
                                        <span className="font-semibold text-purple-600">{total}</span> kết quả
                                    </div>

                                    {/* Điều hướng */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleFilterChange.page(filters.page - 1)}
                                            disabled={filters.page === 0}
                                            className="gap-1 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Trước
                                        </Button>

                                        <div className="hidden sm:flex gap-1">
                                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = idx;
                                                } else if (filters.page < 3) {
                                                    pageNum = idx;
                                                } else if (filters.page > totalPages - 4) {
                                                    pageNum = totalPages - 5 + idx;
                                                } else {
                                                    pageNum = filters.page - 2 + idx;
                                                }
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant={filters.page === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleFilterChange.page(pageNum)}
                                                        className={
                                                            filters.page === pageNum
                                                                ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
                                                                : "border-gray-200"
                                                        }
                                                    >
                                                        {pageNum + 1}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleFilterChange.page(filters.page + 1)}
                                            disabled={filters.page >= totalPages - 1}
                                            className="gap-1 disabled:opacity-50"
                                        >
                                            Sau
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* ══ MODALS & DRAWER ══════════════════════════════════════════════════ */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                onSuccess={handleModalSuccess}
            />

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => { setSelectedProductId(null); closeEditModal(); }}
                onSuccess={handleModalSuccess}
                productId={selectedProductId}
            />

            <ProductModal
                isOpen={isViewModalOpen}
                onClose={() => { setSelectedProductId(null); closeViewModal(); }}
                onSuccess={handleModalSuccess}
                productId={selectedProductId}
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa sản phẩm"
                description={
                    productToDelete
                        ? `Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete.tenSanPham}"? Hành động này không thể hoàn tác.`
                        : "Bạn có chắc chắn muốn xóa sản phẩm này?"
                }
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
                isLoading={isDeleting}
            />

            <InventoryDrawer
                isOpen={isInventoryOpen}
                onClose={handleCloseInventory}
                product={selectedInventoryProduct}
            />

        </div>
    );
}
