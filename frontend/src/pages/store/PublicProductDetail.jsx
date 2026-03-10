import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Heart, ShieldCheck, RefreshCw, Truck, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function PublicProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getProductById(id);
                if (res.data?.status === 200) {
                    setProduct(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching product detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-4xl font-black mb-4">Sản phẩm không tồn tại</h2>
                <Button className="rounded-full bg-black text-white px-10">QUAY LẠI TRANG CHỦ</Button>
            </div>
        );
    }

    const images = product.anhQuanAos?.map(a => a.tepTin?.duongDan) || ["https://placehold.co/800x1000/f3f4f6/9ca3af?text=No+Image"];

    return (
        <div className="bg-white min-h-screen pb-40">
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest gap-2">
                <span>Trang chủ</span>
                <ChevronRight className="w-3 h-3" />
                <span>{product.danhMuc?.tenDanhMuc}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black">{product.tenSanPham}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Left: Images */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100">
                            <img
                                src={images[selectedImage]}
                                alt={product.tenSanPham}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-purple-600 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <div className="mb-10">
                            <div className="flex items-center gap-4 mb-6">
                                <Badge className="bg-purple-600 text-white font-black px-4 py-1 rounded-full text-[10px] tracking-widest">
                                    {product.danhMuc?.tenDanhMuc || "FASHION"}
                                </Badge>
                                <div className="text-xs font-bold text-green-600 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-1" />
                                    CÒN HÀNG ({product.soLuongTon})
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-black text-black tracking-tighter leading-tight mb-8">
                                {product.tenSanPham}
                            </h1>

                            <div className="flex flex-col gap-2 mb-10">
                                <p className="text-4xl font-black text-black">
                                    {formatCurrency(product.giaBanMacDinh)}
                                </p>
                                <p className="text-xs font-bold text-gray-400">Giá đã bao gồm VAT</p>
                            </div>

                            <div className="prose prose-sm text-gray-600 mb-12">
                                <p className="leading-relaxed text-base font-medium">
                                    {product.moTa || "Không có mô tả cho sản phẩm này."}
                                </p>
                            </div>
                        </div>

                        {/* Add to Cart Area */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-gray-50 rounded-2xl p-2 border border-gray-100">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-white rounded-xl transition-colors"
                                    >-</button>
                                    <span className="w-12 text-center font-black text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-white rounded-xl transition-colors"
                                    >+</button>
                                </div>
                                <Button variant="outline" className="h-[64px] w-[64px] rounded-2xl border-gray-200 hover:border-red-500 hover:text-red-500">
                                    <Heart className="w-6 h-6" />
                                </Button>
                            </div>

                            <Button className="w-full h-20 rounded-3xl bg-black hover:bg-purple-600 text-white font-black text-xl transition-all duration-500 shadow-xl flex items-center justify-center gap-4 transform active:scale-95">
                                <ShoppingCart className="w-7 h-7" />
                                THÊM VÀO GIỎ HÀNG
                            </Button>
                        </div>

                        {/* Benefits */}
                        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 border-t border-gray-100">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <Truck className="w-6 h-6 text-black" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-black">Miễn phí giao hàng</p>
                                    <p className="text-[10px] font-bold text-gray-400">Đơn hàng từ 1.000.000đ</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <RefreshCw className="w-6 h-6 text-black" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-black">Đổi trả 30 ngày</p>
                                    <p className="text-[10px] font-bold text-gray-400">Không cần lý do</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6 text-black" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-black">Bảo hành 12 tháng</p>
                                    <p className="text-[10px] font-bold text-gray-400">Lỗi từ nhà sản xuất</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
