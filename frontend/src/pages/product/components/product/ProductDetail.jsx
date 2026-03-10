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

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <Package className="w-16 h-16 text-gray-200" />
            <p className="font-medium text-gray-500">Sản phẩm không tồn tại trong hệ thống.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-20 selection:bg-purple-100">
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3 text-sm text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button
                        onClick={() => navigate("/products")}
                        className="flex items-center gap-2 text-gray-900 hover:text-purple-600 font-medium transition-colors mr-2 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Quay lại
                    </button>
                    <div className="h-4 w-[1px] bg-gray-200 mx-2" /> {/* Thanh phân cách đứng */}
                    {breadcrumbs.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            {cat.tenDanhMuc}
                        </div>
                    ))}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.tenSanPham}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                <div className="grid lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-6 space-y-6">
                        <div className="relative aspect-square bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 group shadow-sm">
                            {product.anhQuanAos?.[selectedImageIndex] ? (
                                <img
                                    src={product.anhQuanAos[selectedImageIndex].tepTin?.duongDan}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={product.tenSanPham}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300 bg-gray-50">
                                    <Package className="w-20 h-20 mb-4 stroke-[1.5]" />
                                    <p className="text-gray-400">Ảnh sản phẩm chưa được cập nhật</p>
                                </div>
                            )}
                            {showImageControls && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        disabled={!canGoPrev}
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-sm bg-white/90 backdrop-blur border border-gray-100 transition-all duration-200 hover:shadow-md ${canGoPrev ? "hover:-translate-x-0.5" : "opacity-50 cursor-not-allowed"}`}
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        disabled={!canGoNext}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-sm bg-white/90 backdrop-blur border border-gray-100 transition-all duration-200 hover:shadow-md ${canGoNext ? "hover:translate-x-0.5" : "opacity-50 cursor-not-allowed"}`}
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-700" />
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 overflow-x-auto py-2 scrollbar-hide">
                            {product.anhQuanAos?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`relative w-20 h-20 rounded-2xl border-2 flex-shrink-0 overflow-hidden transition-all duration-300
                                        ${selectedImageIndex === idx
                                            ? 'border-purple-600 scale-95'
                                            : 'border-transparent hover:border-purple-200'}`}
                                >
                                    <img src={img.tepTin?.duongDan} className="w-full h-full object-cover" alt="thumbnail" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-6 flex flex-col">
                        <div className="flex-1 space-y-10">
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border-none">
                                        {product.danhMuc?.tenDanhMuc}
                                    </Badge>
                                    {(() => {
                                        const configs = {
                                            1: {
                                                label: "Còn hàng",
                                                container: "bg-emerald-50 text-emerald-700",
                                                dot: "bg-emerald-500"
                                            },
                                            0: {
                                                label: "Hết hàng",
                                                container: "bg-rose-50 text-rose-700",
                                                dot: "bg-rose-500"
                                            },
                                            2: {
                                                label: "Ngừng hoạt động",
                                                container: "bg-gray-100 text-gray-600",
                                                dot: "bg-gray-400"
                                            }
                                        };
                                        const config = configs[product.trangThai] || configs[2];
                                        return (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.container}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                                                {config.label}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                                    {product.tenSanPham}
                                </h1>

                                <div className="flex items-center gap-2 text-gray-400">
                                    <Box className="w-4 h-4" />
                                    <span className="text-sm font-medium tracking-wide">Mã sản phẩm: {product.maSanPham || id}</span>
                                </div>

                                <div className="flex items-baseline gap-4 pt-2">
                                    <span className="text-4xl font-extrabold text-purple-600 tracking-tight">
                                        {formatCurrency(product.giaBanMacDinh)}
                                    </span>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Danh sách biến thể</h3>
                                    <span className="text-xs text-gray-500">{product.bienTheSanPhams?.length || 0} tùy chọn</span>
                                </div>

                                <div className="rounded-3xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left font-medium">Chi tiết màu sắc & size</th>
                                                <th className="px-6 py-4 text-right font-medium">Giá bán lẻ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {product.bienTheSanPhams?.map((variant) => (
                                                <tr key={variant.id} className="hover:bg-purple-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div
                                                                className="w-6 h-6 rounded-full border border-white ring-2 ring-gray-100 shadow-sm flex-shrink-0"
                                                                style={{ backgroundColor: variant.mauSac?.maMauHex || variant.mauSac?.maMau }}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-gray-800">{variant.mauSac?.tenMau}</span>
                                                                <span className="text-xs text-gray-500 font-medium">Kích cỡ: {variant.size?.tenSize}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-gray-900">{formatCurrency(variant.giaBan)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
                <div className="mt-24">
                    <Tabs defaultValue="desc" className="w-full">
                        <TabsList className="bg-transparent border-b border-gray-100 w-full justify-start h-auto p-0 gap-8 mb-10 rounded-none">
                            <TabsTrigger
                                value="desc"
                                className="border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-0 py-4 text-base font-semibold transition-all"
                            >
                                Mô tả chi tiết
                            </TabsTrigger>
                            <TabsTrigger
                                value="spec"
                                className="border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none px-0 py-4 text-base font-semibold transition-all"
                            >
                                Thông số kỹ thuật
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="desc" className="mt-0 outline-none">
                            <div className="prose prose-purple max-w-4xl text-gray-600 leading-relaxed font-normal">
                                {product.moTa || "Hiện tại chưa có mô tả chi tiết cho sản phẩm này."}
                            </div>
                        </TabsContent>

                        <TabsContent value="spec" className="mt-0 outline-none">
                            <div className="max-w-2xl bg-gray-50/50 rounded-[2rem] p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 border border-gray-100">
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-400 flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" /> Chất liệu chính
                                    </p>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {product.bienTheSanPhams?.[0]?.chatLieu?.tenChatLieu || "Thông tin đang cập nhật"}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-400 flex items-center gap-2">
                                        <Info className="w-3.5 h-3.5" /> Phân loại ngành hàng
                                    </p>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {product.danhMuc?.tenDanhMuc}
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}