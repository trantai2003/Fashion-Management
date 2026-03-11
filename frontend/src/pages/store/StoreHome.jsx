import React, { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';


export default function StoreHome() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productService.filterProducts({
                    page: 0,
                    size: 8,
                    filters: [],
                    sorts: [{ fieldName: "ngayTao", direction: "DESC" }]
                });
                if (res.data?.status === 200) {
                    setProducts(res.data.data.content || []);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="flex flex-col">
            {/* Hero Section - Modern & Bold */}
            <section className="relative h-[80vh] bg-black flex items-center overflow-hidden">
                <div className="absolute inset-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero background"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-black tracking-widest mb-8 animate-bounce">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            COLLECTION 2026
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black text-white leading-tight tracking-tighter mb-8">
                            STREET <br />
                            <span className="text-purple-600">REDEFINED.</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-12 max-w-xl leading-relaxed font-medium">
                            Khám phá phong cách thời trang dẫn đầu xu hướng. Chất lượng cao cấp, thiết kế tối giản, phong thái đĩnh đạc.
                        </p>
                        <div className="flex flex-col sm:row gap-4">
                            <Button size="lg" className="h-16 px-10 rounded-full bg-white text-black hover:bg-purple-600 hover:text-white transition-all duration-500 font-black text-lg group">
                                MUA NGAY
                                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                            <Button size="lg" variant="outline" className="h-16 px-10 rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-500 font-black text-lg">
                                XEM BỘ SƯU TẬP
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute bottom-20 right-20 hidden xl:block">
                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">1.2k+</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Sản phẩm</p>
                            </div>
                            <div className="w-px h-10 bg-gray-200" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">50k+</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Khách hàng</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-32 bg-white px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-purple-600 font-black text-xs tracking-widest uppercase mb-4">
                                <TrendingUp className="w-4 h-4" />
                                Trendy Now
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-black tracking-tighter">
                                SẢN PHẨM MỚI NHẤT
                            </h2>
                        </div>
                        <Link to="/search">
                            <Button variant="ghost" className="text-black font-black hover:text-purple-600 group text-lg">
                                Xem tất cả
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-40">
                            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Promotion Banner */}
            <section className="px-4 sm:px-6 lg:px-8 pb-32">
                <div className="max-w-7xl mx-auto bg-purple-600 rounded-[3rem] p-12 md:p-24 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-150 transition-transform duration-1000">
                        <Zap className="w-96 h-96 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <Badge className="bg-white text-purple-600 font-black px-6 py-2 rounded-full mb-8">
                            ƯU ĐÃI ĐỘC QUYỀN
                        </Badge>
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-12 leading-none">
                            GIẢM ĐẾN 50% <br />
                            CHO ĐƠN ĐẦU TIÊN
                        </h2>
                        <Button size="lg" className="h-20 px-16 rounded-full bg-black text-white hover:bg-white hover:text-black transition-all duration-500 font-black text-2xl">
                            NHẬN MÃ NGAY
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Thêm link Link vào component
import { Link as RouterLink } from 'react-router-dom';
function Link(props) {
    return <RouterLink {...props} />;
}
