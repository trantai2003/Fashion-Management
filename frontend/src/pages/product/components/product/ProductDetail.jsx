import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Loader2, Package, ChevronRight, Info, Tag, Box, ArrowLeft, ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { productService } from "@/services/productService.js";
import { danhMucQuanAoService } from "@/services/danhMucQuanAoService.js";
import { formatCurrency } from "@/utils/formatters";
import { Button } from "@/components/ui/button";

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [allCategories, setAllCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const navigate = useNavigate();
    const totalImages = product?.anhQuanAos?.length || 0;

    useEffect(() => {
        // Dam bao selectedImageIndex luon hop le khi so anh thay doi.
        if (totalImages === 0) {
            if (selectedImageIndex !== 0) setSelectedImageIndex(0);
            return;
        }
        if (selectedImageIndex > totalImages - 1) {
            setSelectedImageIndex(totalImages - 1);
        }
    }, [totalImages, selectedImageIndex]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Luong tai du lieu chi tiet san pham:
                // Frontend -> productService.getProductById
                // -> ProductController.getById -> ProductService.getById -> ProductRepository.findById.
                // Dong thoi tai cay danh muc de dung breadcrumb cha-con.
                const [productRes, categoryRes] = await Promise.all([
                    productService.getProductById(id),
                    danhMucQuanAoService.getCayDanhMuc()
                ]);

                if (productRes.data?.status === 200) {
                    setProduct(productRes.data.data);
                }
                if (categoryRes.data?.data) {
                    setAllCategories(categoryRes.data.data);
                }
            } catch (error) {
                console.error("Lỗi fetch dữ liệu:", error);
                toast.error("Không thể tải thông tin sản phẩm");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const handlePrevImage = () => setSelectedImageIndex((prev) => Math.max(prev - 1, 0));
    const handleNextImage = () => setSelectedImageIndex((prev) => Math.min(prev + 1, totalImages - 1));
    const showImageControls = totalImages > 1;
    const canGoPrev = selectedImageIndex > 0;
    const canGoNext = selectedImageIndex < totalImages - 1;

    const breadcrumbs = useMemo(() => {
        // Dung DFS tim duong dan danh muc tu root -> danh muc hien tai cua san pham.
        // Muc dich: hien breadcrumb dung theo cau truc cay danh muc.
        if (!product?.danhMuc || !allCategories || allCategories.length === 0) return [];
        const targetId = product.danhMuc.id;
        const findPath = (categories, idToFind, currentPath = []) => {
            for (const cat of categories) {
                const newPath = [...currentPath, cat];
                if (cat.id === idToFind) return newPath;
                if (cat.danhMucCons && cat.danhMucCons.length > 0) {
                    const found = findPath(cat.danhMucCons, idToFind, newPath);
                    if (found) return found;
                }
            }
            return null;
        };
        return findPath(allCategories, targetId) || [product.danhMuc];
    }, [product, allCategories]);

    const statusMeta = useMemo(() => {
        // Map trang thai backend sang giao dien badge/trang thai mau.
        const configs = {
            1: {
                label: "Còn hàng",
                container: "bg-emerald-50 text-emerald-700 border-emerald-200",
                dot: "bg-emerald-500"
            },
            0: {
                label: "Hết hàng",
                container: "bg-rose-50 text-rose-700 border-rose-200",
                dot: "bg-rose-500"
            },
            2: {
                label: "Ngừng hoạt động",
                container: "bg-slate-100 text-slate-600 border-slate-200",
                dot: "bg-slate-400"
            }
        };
        return configs[product?.trangThai] || configs[2];
    }, [product?.trangThai]);

    const variantCount = product?.bienTheSanPhams?.length || 0;

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <Package className="w-16 h-16 text-gray-200" />
            <p className="font-medium text-gray-500">Sản phẩm không tồn tại trong hệ thống.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-16">
            <div className="border-b border-amber-100 bg-white/90 backdrop-blur">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/products")}
                            className="h-9 px-3 rounded-lg border-amber-200 bg-white text-amber-900 hover:bg-amber-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Quay lại danh sách
                        </Button>

                        <div className="hidden sm:block h-4 w-px bg-amber-200" />

                        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                            {breadcrumbs.map((cat) => (
                                <div key={cat.id} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-amber-300" />
                                    <span>{cat.tenDanhMuc}</span>
                                </div>
                            ))}
                            <ChevronRight className="w-4 h-4 text-amber-300" />
                            <span className="font-semibold text-amber-900 truncate max-w-[240px]">{product.tenSanPham}</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 space-y-8">
                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <section className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-5 shadow-sm">
                        <div className="relative aspect-square bg-amber-50 rounded-2xl overflow-hidden border border-amber-100 group">
                            {product.anhQuanAos?.[selectedImageIndex] ? (
                                <img
                                    src={product.anhQuanAos[selectedImageIndex].tepTin?.duongDan}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    alt={product.tenSanPham}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-amber-300 bg-amber-50">
                                    <Package className="w-20 h-20 mb-4 stroke-[1.5]" />
                                    <p className="text-amber-500">Ảnh sản phẩm chưa được cập nhật</p>
                                </div>
                            )}

                            {showImageControls && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        disabled={!canGoPrev}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-sm bg-white border border-amber-200 transition-all ${canGoPrev ? "hover:-translate-x-0.5" : "opacity-50 cursor-not-allowed"}`}
                                    >
                                        <ChevronLeft className="w-5 h-5 text-amber-900" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        disabled={!canGoNext}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-sm bg-white border border-amber-200 transition-all ${canGoNext ? "hover:translate-x-0.5" : "opacity-50 cursor-not-allowed"}`}
                                    >
                                        <ChevronRight className="w-5 h-5 text-amber-900" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3 overflow-x-auto py-3 mt-2">
                            {product.anhQuanAos?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-xl border-2 flex-shrink-0 overflow-hidden transition-all
                                    ${selectedImageIndex === idx ? "border-amber-500" : "border-transparent hover:border-amber-300"}`}
                                >
                                    <img src={img.tepTin?.duongDan} className="w-full h-full object-cover" alt="thumbnail" />
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-6 shadow-sm space-y-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 border border-amber-200 hover:bg-amber-100">
                                    {product.danhMuc?.tenDanhMuc}
                                </Badge>
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.container}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                                    {statusMeta.label}
                                </div>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                                {product.tenSanPham}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-2">
                                    <Box className="w-4 h-4" />
                                    Mã sản phẩm: <b className="text-slate-900">{product.maSanPham || id}</b>
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Mã vạch: <b className="text-slate-900">{product.maVach || "Chưa cập nhật"}</b>
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs text-amber-700 font-medium">Giá bán mặc định</p>
                                <p className="text-lg font-bold text-amber-900 mt-1">{formatCurrency(product.giaBanMacDinh)}</p>
                            </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs text-amber-700 font-medium">Giá vốn mặc định</p>
                                <p className="text-lg font-bold text-amber-900 mt-1">{formatCurrency(product.giaVonMacDinh)}</p>
                            </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs text-amber-700 font-medium">Biến thể hiện có</p>
                                <p className="text-lg font-bold text-amber-900 mt-1">{variantCount}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900">Danh sách biến thể</h3>
                                <span className="text-xs text-slate-500">{variantCount} tùy chọn</span>
                            </div>

                            <div className="rounded-xl border border-amber-200 overflow-hidden bg-white">
                                <div className="max-h-[340px] overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-amber-50 border-b border-amber-200 text-slate-600">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">Chi tiết màu sắc & size</th>
                                            <th className="px-4 py-3 text-right font-semibold">Giá bán lẻ</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-amber-100">
                                        {product.bienTheSanPhams?.map((variant) => (
                                            <tr key={variant.id} className="hover:bg-amber-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-5 h-5 rounded-full border border-white ring-2 ring-amber-100 shadow-sm flex-shrink-0"
                                                            style={{ backgroundColor: variant.mauSac?.maMauHex || variant.mauSac?.maMau }}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-800">{variant.mauSac?.tenMau || "-"}</span>
                                                            <span className="text-xs text-slate-500">Kích cỡ: {variant.size?.tenSize || "-"}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="font-bold text-slate-900">{formatCurrency(variant.giaBan)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-6 shadow-sm">
                    <Tabs defaultValue="desc" className="w-full">
                        <TabsList className="bg-amber-50 border border-amber-200 w-full sm:w-auto justify-start h-auto p-1 gap-1 rounded-xl mb-6">
                            <TabsTrigger
                                value="desc"
                                className="rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-800"
                            >
                                Mô tả chi tiết
                            </TabsTrigger>
                            <TabsTrigger
                                value="spec"
                                className="rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-800"
                            >
                                Thông số kỹ thuật
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="desc" className="mt-0 outline-none">
                            <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 text-slate-700 leading-relaxed">
                                {product.moTa || "Hiện tại chưa có mô tả chi tiết cho sản phẩm này."}
                            </div>
                        </TabsContent>

                        <TabsContent value="spec" className="mt-0 outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                                    <p className="text-xs font-medium text-amber-700 flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" /> Chất liệu chính
                                    </p>
                                    <p className="font-semibold text-slate-900 text-base mt-2">
                                        {product.bienTheSanPhams?.[0]?.chatLieu?.tenChatLieu || "Thông tin đang cập nhật"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                                    <p className="text-xs font-medium text-amber-700 flex items-center gap-2">
                                        <Info className="w-3.5 h-3.5" /> Phân loại ngành hàng
                                    </p>
                                    <p className="font-semibold text-slate-900 text-base mt-2">
                                        {product.danhMuc?.tenDanhMuc}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </section>
            </main>
        </div>
    );
}