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
import { Loader2, Search, Eye, Settings, Trash2, RefreshCcw, Package } from "lucide-react";
import { useToggle } from "@/hooks/useToggle";
import ProductModal from "@/pages/product/components/product/ProductModal";
import ConfirmModal from "@/components/ui/confirm-modal";
import PaginationComponent from "./components/product/ProductComponent";
import { formatCurrency, formatDate } from "@/utils/formatters";

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
        sorts: [
            {
                fieldName: "ngayTao",
                direction: "DESC",
            },
        ],
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
        page: 1,
        size: 10,
    });

    const location = useLocation();
    const toastShownRef = useRef(false);
    const navigate = useNavigate();
    const searchTimeoutRef = useRef(null);

    const [isModalOpen, openModal, closeModal] = useToggle(false);
    const [isConfirmOpen, openConfirm, closeConfirm] = useToggle(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const CATEGORY_OPTIONS = useMemo(() => [
        { value: "ALL", label: "Tất cả danh mục" },
        ...categories.map(cat => ({
            value: cat.id.toString(),
            label: cat.tenDanhMuc
        }))
    ], [categories]);

    const STATUS_OPTIONS = useMemo(() => [
        { value: "ALL", label: "Tất cả trạng thái" },
        { value: "1", label: "Đang bán" },
        { value: "0", label: "Ngừng bán" },
    ], []);

    const fetchCategories = useCallback(async () => {
        try {
            setIsCategoriesLoading(true);
            const res = await productService.getCategories();
            const serverResponse = res.data;
            if (serverResponse?.status === 200) {
                setCategories(serverResponse.data || []);
            }
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
                setProducts(pageData.content || []);
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
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchProducts();
        }, filters.keyword ? 500 : 0);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [filters, fetchProducts]);

    useEffect(() => {
        if (!location.state?.success) return;
        if (toastShownRef.current) return;

        toastShownRef.current = true;
        toast.success(location.state.message || "Thao tác thành công");
        navigate(location.pathname, { replace: true });
    }, [location.state, navigate, location.pathname]);

    const handleReset = useCallback(() => {
        setFilters({
            keyword: "",
            danhMuc: "ALL",
            trangThai: "ALL",
            giaTu: "",
            giaDen: "",
            page: 0,
            size: 10,
        });
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

    const handleViewClick = useCallback((productId) => {
        setSelectedProductId(productId);
        openModal();
    }, [openModal, setSelectedProductId]);

    const handleCancelDelete = useCallback(() => {
        if (!isDeleting) {
            setProductToDelete(null);
            closeConfirm();
        }
    }, [isDeleting, closeConfirm]);


    const updateFilter = useCallback((field, value, resetPage = true) => {
        const actualValue = value?.target ? value.target.value : value;

        setFilters(prev => ({
            ...prev,
            [field]: actualValue,
            ...(resetPage && { page: 0 })
        }));
    }, []);

    const handleFilterChange = useMemo(() => ({
        keyword: (e) => updateFilter('keyword', e),
        giaTu: (e) => updateFilter('giaTu', e),
        giaDen: (e) => updateFilter('giaDen', e),

        danhMuc: (value) => updateFilter('danhMuc', value),
        trangThai: (value) => updateFilter('trangThai', value),
        size: (value) => updateFilter('size', Number(value)),

        page: (newPage) => updateFilter('page', newPage, false),
    }), [updateFilter]);


    const handleModalSuccess = useCallback(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleAddClick = useCallback(() => {
        setSelectedProductId(null); // null = create mode
        openModal();
    }, [openModal]);

    const handleEditClick = useCallback((productId) => {
        setSelectedProductId(productId); // set id = edit mode
        openModal();
    }, [openModal]);

    const handleModalClose = useCallback(() => {
        setSelectedProductId(null);
        closeModal();
    }, [closeModal]);

    return (
        <div className="h-screen w-full bg-gray-50 flex flex-col min-h-0">
            <div className="px-6 py-4 flex-none">
                <div className="mb-4">
                    <Label className="text-2xl font-bold text-gray-800">Danh sách sản phẩm</Label>
                </div>
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
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Danh mục
                                </Label>

                                <Select
                                    value={filters.danhMuc}
                                    onValueChange={handleFilterChange.danhMuc}
                                    disabled={isCategoriesLoading || isLoading}
                                >
                                    <SelectTrigger className="w-full h-10 px-3 text-sm">
                                        <SelectValue placeholder={isCategoriesLoading ? "Đang tải..." : "Chọn danh mục"} />
                                    </SelectTrigger>

                                    <SelectContent
                                        position="popper"
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        className="bg-white z-50"
                                    >
                                        {CATEGORY_OPTIONS.map((cat) => {
                                            const active = filters.danhMuc === cat.value;

                                            return (
                                                <SelectItem
                                                    key={cat.value}
                                                    value={cat.value}
                                                    className={
                                                        active
                                                            ? "bg-purple-600 text-white focus:bg-purple-600 focus:text-white"
                                                            : "focus:bg-gray-100"
                                                    }
                                                >
                                                    {cat.label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Trạng thái
                                </Label>

                                <Select
                                    value={filters.trangThai}
                                    onValueChange={handleFilterChange.trangThai}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full h-10 px-3 text-sm">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>

                                    <SelectContent
                                        position="popper"
                                        side="bottom"
                                        align="start"
                                        sideOffset={4}
                                        className="z-50
                                        bg-white
                                        border border-gray-200
                                        shadow-lg
                                        rounded-md
                                              "
                                    >
                                        {STATUS_OPTIONS.map((s) => {
                                            const active = filters.trangThai === s.value;

                                            return (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                    className={
                                                        active
                                                            ? "bg-purple-600 text-white focus:bg-purple-600 focus:text-white"
                                                            : "focus:bg-gray-100"
                                                    }
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[13px] text-gray-600 block leading-none">
                                    Khoảng giá (VNĐ)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={filters.giaTu}
                                        onChange={handleFilterChange.giaTu}
                                        placeholder="Từ"
                                        min="0"
                                        className="w-full h-10 px-3 text-sm focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                                        disabled={isLoading}
                                    />
                                    <Input
                                        type="number"
                                        value={filters.giaDen}
                                        onChange={handleFilterChange.giaDen}
                                        placeholder="Đến"
                                        min="0"
                                        className="w-full h-10 px-3 text-sm focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex items-center justify-end">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="flex items-center gap-2 transition-all duration-300 hover:bg-purple-600 hover:text-white border-gray-300"
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    Reset lại
                                </Button>
                            </div>
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
                                <Button
                                    size="sm"
                                    onClick={handleAddClick}
                                    className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                                >
                                    + Thêm sản phẩm
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-0">
                            <Table className="w-full">

                                <TableHeader>
                                    <TableRow className="bg-gray-50 text-xs text-gray-500">
                                        <TableHead className="px-4 py-3">ID</TableHead>
                                        <TableHead className="px-4 py-3">Hình ảnh</TableHead>
                                        <TableHead className="px-4 py-3">Tên sản phẩm</TableHead>
                                        <TableHead className="px-4 py-3">Danh mục</TableHead>
                                        <TableHead className="px-4 py-3">Giá bán</TableHead>
                                        <TableHead className="px-4 py-3">Tồn kho</TableHead>
                                        <TableHead className="px-4 py-3">Trạng thái</TableHead>
                                        <TableHead className="px-4 py-3">Ngày tạo</TableHead>
                                        <TableHead className="px-4 py-3">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="text-sm text-gray-800">
                                    {isLoading && (
                                        <>
                                            {[...Array(5)].map((_, idx) => (
                                                <TableRow key={`skeleton-${idx}`} className="border-b">
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3">
                                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </>
                                    )}

                                    {!isLoading && products.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="py-16 text-center">
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

                                    {!isLoading && products.map((product) => (
                                        <TableRow key={product.id} className="border-b hover:bg-gray-50">
                                            <TableCell className="px-4 py-3">{product.id}</TableCell>

                                            <TableCell className="px-4 py-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {product.hinhAnh ? (
                                                        <img
                                                            src={product.hinhAnh}
                                                            alt={product.tenSanPham}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-gray-400 text-xs">Không có hình ảnh</div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 font-semibold max-w-xs">
                                                <div className="truncate" title={product.tenSanPham}>
                                                    {product.tenSanPham}
                                                </div>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
                                                    {product.danhMuc?.tenDanhMuc || "N/A"}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 font-medium text-purple-700">
                                                {product.giaBan ? formatCurrency(product.giaBan) : "N/A"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                <span className="font-medium text-green-600">
                                                    {product.soLuongTon || 0}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {product.trangThai === 1 ? (
                                                    <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700">
                                                        Đang bán
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs rounded bg-red-50 text-red-700">
                                                        Ngừng bán
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="px-4 py-3">
                                                {formatDate(product.ngayTao) !== 'N/A' ? formatDate(product.ngayTao) : '-'}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                                <Button
                                                    onClick={() => handleViewClick(product.id)}
                                                    className="text-sm font-semibold text-purple-600 hover:underline flex items-center gap-2"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleEditClick(product.id)}
                                                    className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-2"
                                                >
                                                    <Settings className="h-3.5 w-3.5" />
                                                </Button>

                                                <Button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
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

            <ProductModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
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
        </div>
    );
}