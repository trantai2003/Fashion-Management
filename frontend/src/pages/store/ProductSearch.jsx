import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import ProductCard from '@/components/store/ProductCard';
import { Loader2, Search, CornerDownRight, X } from 'lucide-react';
import ProductFilter from '@/components/store/ProductFilter';


export default function ProductSearch() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = (newFilters) => {
        setActiveFilters(newFilters);
    };


    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                // Map activeFilters to API filter objects
                const apiFilters = query ? [
                    { fieldName: "tenSanPham", operation: "ILIKE", value: query, logicType: "OR" },
                    { fieldName: "moTa", operation: "ILIKE", value: query, logicType: "OR" }
                ] : [];

                if (activeFilters.category?.length > 0) {
                    apiFilters.push({ fieldName: "danhMuc.id", operation: "IN", value: activeFilters.category, logicType: "AND" });
                }
                if (activeFilters.gender?.length > 0) {
                    apiFilters.push({ fieldName: "gioiTinh", operation: "IN", value: activeFilters.gender, logicType: "AND" });
                }
                if (activeFilters.size?.length > 0) {
                    apiFilters.push({ fieldName: "bienTheSanPhams.size.id", operation: "IN", value: activeFilters.size, logicType: "AND" });
                }
                if (activeFilters.color?.length > 0) {
                    apiFilters.push({ fieldName: "bienTheSanPhams.mauSac.id", operation: "IN", value: activeFilters.color, logicType: "AND" });
                }
                if (activeFilters.material?.length > 0) {
                    apiFilters.push({ fieldName: "chatLieu.id", operation: "IN", value: activeFilters.material, logicType: "AND" });
                }
                
                // Price range mapping
                if (activeFilters.price?.length > 0) {
                    activeFilters.price.forEach(pRange => {
                        if (pRange === 'under_500') {
                            apiFilters.push({ fieldName: "giaBanMacDinh", operation: "LESS_THAN_OR_EQUAL", value: 500000, logicType: "AND" });
                        } else if (pRange === '500_1000') {
                            apiFilters.push({ fieldName: "giaBanMacDinh", operation: "GREATER_THAN_OR_EQUAL", value: 500000, logicType: "AND" });
                            apiFilters.push({ fieldName: "giaBanMacDinh", operation: "LESS_THAN_OR_EQUAL", value: 1000000, logicType: "AND" });
                        } else if (pRange === 'above_1000') {
                            apiFilters.push({ fieldName: "giaBanMacDinh", operation: "GREATER_THAN_OR_EQUAL", value: 1000000, logicType: "AND" });
                        }
                    });
                }

                const res = await productService.filterProducts({
                    page: 0,
                    size: 40,
                    filters: apiFilters,
                    sorts: [{ fieldName: "ngayTao", direction: "DESC" }]
                });
                if (res.data?.status === 200) {
                    setProducts(res.data.data.content || []);
                }
            } catch (error) {
                console.error("Error searching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query, activeFilters]);


    return (
        <div className="bg-white min-h-screen">
            <div className="bg-black py-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 text-purple-500 font-black text-xs tracking-widest uppercase mb-6">
                        <Search className="w-5 h-5" />
                        Search Results
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-4">
                        "{query}"
                    </h1>
                    <div className="flex items-center text-gray-400 text-lg font-medium">
                        <CornerDownRight className="w-6 h-6 mr-3" />
                        Tìm thấy {products.length} sản phẩm phù hợp
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <ProductFilter 
                            onFilterChange={handleFilterChange} 
                            activeFilters={activeFilters} 
                            totalResults={products.length} 
                        />
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="flex justify-center items-center py-40">
                                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-40 text-center">
                                <div className="text-gray-200 mb-8">
                                    <Search className="w-32 h-32" />
                                </div>
                                <h3 className="text-4xl font-black text-black mb-4">Không tìm thấy kết quả</h3>
                                <p className="text-gray-500 max-w-sm mb-10">Rất tiếc, chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc của bạn.</p>
                                <Button 
                                    className="rounded-full bg-black text-white px-10 h-14 font-black"
                                    onClick={() => setActiveFilters({})}
                                >
                                    XÓA BỘ LỌC
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
