import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import ProductCard from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Loader2, SlidersHorizontal, PackageX, X } from 'lucide-react';
import ProductFilter from '@/components/store/ProductFilter';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ProductCategory() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterChange = (newFilters) => {
        setActiveFilters(newFilters);
    };


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Map activeFilters to API filter objects
                const apiFilters = [
                    { fieldName: "danhMuc.id", operation: "EQUALS", value: Number(id), logicType: "AND" }
                ];

                if (activeFilters.gender?.length > 0) {
                    apiFilters.push({ fieldName: "gioiTinh", operation: "IN", value: activeFilters.gender, logicType: "AND" });
                }
                if (activeFilters.size?.length > 0) {
                    // Assuming size filtering is by ID
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

                // Fetch Products
                const res = await productService.filterProducts({
                    page: 0,
                    size: 20,
                    filters: apiFilters,
                    sorts: sortBy === "newest" ? [{ fieldName: "ngayTao", direction: "DESC" }] :
                        sortBy === "price_asc" ? [{ fieldName: "giaBanMacDinh", direction: "ASC" }] :
                            [{ fieldName: "giaBanMacDinh", direction: "DESC" }]
                });

                if (res.data?.status === 200) {
                    setProducts(res.data.data.content || []);
                }

                // Fetch categories for title
                const catRes = await productService.getCategories();
                if (catRes.data?.status === 200) {
                    const current = catRes.data.data.find(c => c.id === Number(id));
                    setCategory(current);
                }
            } catch (error) {
                console.error("Error fetching category products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, sortBy, activeFilters]);


    return (
        <div className="bg-white min-h-screen">
            {/* Header / Breadcrumb area */}
            <div className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-6xl font-black text-black tracking-tighter mb-4 uppercase">
                        {category ? category.tenDanhMuc : "Danh mục"}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Khám phá bộ sưu tập sản phẩm trong danh mục {category?.tenDanhMuc}.
                    </p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="border-b border-gray-100 sticky top-20 bg-white/80 backdrop-blur-md z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center text-sm font-bold text-gray-500">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        {products.length} Sản phẩm
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest hidden sm:block">Sắp xếp:</span>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] border-none font-bold text-sm focus:ring-0">
                                <SelectValue placeholder="Mới nhất" />
                            </SelectTrigger>
                            <SelectContent className="font-bold border-gray-100">
                                <SelectItem value="newest">Mới nhất</SelectItem>
                                <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
                                <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Sidebar Filter */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <ProductFilter 
                            onFilterChange={handleFilterChange} 
                            activeFilters={activeFilters} 
                            totalResults={products.length} 
                        />
                    </aside>

                    {/* Product Grid */}
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
                                <div className="bg-gray-50 p-10 rounded-full mb-8">
                                    <PackageX className="w-20 h-20 text-gray-300" />
                                </div>
                                <h3 className="text-3xl font-black text-black mb-4 tracking-tight">Chưa có sản phẩm nào</h3>
                                <p className="text-gray-500 max-w-sm mb-10">Danh mục này hiện đang được cập nhật thêm sản phẩm. Vui lòng quay lại sau.</p>
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
