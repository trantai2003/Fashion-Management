import React, { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from 'lucide-react';

export default function ProductFilter({ onFilterChange, activeFilters, totalResults }) {
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, colorRes, sizeRes, matRes] = await Promise.all([
                    productService.getCategories(),
                    productService.getColors(),
                    productService.getSizes(),
                    productService.getMaterials()
                ]);

                if (catRes.data?.status === 200) setCategories(catRes.data.data);
                if (colorRes.data?.status === 200) setColors(colorRes.data.data);
                if (sizeRes.data?.status === 200) setSizes(sizeRes.data.data);
                if (matRes.data?.status === 200) setMaterials(matRes.data.data);
            } catch (error) {
                console.error("Error fetching filter metadata:", error);
            }
        };
        fetchMetadata();
    }, []);

    const genders = [
        { id: 'NAM', label: 'Nam' },
        { id: 'NU', label: 'Nữ' },
        { id: 'UNISEX', label: 'Unisex' }
    ];

    const priceRanges = [
        { id: 'under_500', label: 'Dưới 500,000đ', min: 0, max: 500000 },
        { id: '500_1000', label: '500,000đ - 1,000,000đ', min: 500000, max: 1000000 },
        { id: 'above_1000', label: 'Trên 1,000,000đ', min: 1000000, max: 99999999 }
    ];

    const handleToggleFilter = (type, value) => {
        const currentValues = activeFilters[type] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        
        onFilterChange({ ...activeFilters, [type]: newValues });
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    return (
        <div className="w-full flex flex-col gap-8 pb-20">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-3xl font-black text-black tracking-tighter">Bộ lọc</h2>
                    <p className="text-sm font-bold text-gray-400 mt-1">{totalResults} kết quả</p>
                </div>
                {Object.keys(activeFilters).length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-gray-400 hover:text-purple-600 font-bold gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Xóa tất cả
                    </Button>
                )}
            </div>

            <Accordion type="multiple" defaultValue={["category", "gender", "size", "color", "price", "material"]} className="w-full">
                {/* Danh mục */}
                <AccordionItem value="category" className="border-b-0 mb-4">
                    <AccordionTrigger className="text-lg font-black text-black hover:no-underline uppercase tracking-tight py-4">
                        Danh mục
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggleFilter('category', cat.id)}>
                                <Checkbox 
                                    id={`cat-${cat.id}`} 
                                    checked={(activeFilters.category || []).includes(cat.id)}
                                    className="w-5 h-5 rounded-md border-gray-200 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                />
                                <Label className="text-sm font-bold text-gray-600 group-hover:text-black cursor-pointer transition-colors">
                                    {cat.tenDanhMuc}
                                </Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                {/* Giới tính */}
                <AccordionItem value="gender" className="border-b-0 mb-4">
                    <AccordionTrigger className="text-lg font-black text-black hover:no-underline uppercase tracking-tight py-4">
                        Giới tính
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                        {genders.map((g) => (
                            <div key={g.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggleFilter('gender', g.id)}>
                                <Checkbox 
                                    id={`gender-${g.id}`} 
                                    checked={(activeFilters.gender || []).includes(g.id)}
                                    className="w-5 h-5 rounded-md border-gray-200 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                />
                                <Label className="text-sm font-bold text-gray-600 group-hover:text-black cursor-pointer transition-colors">
                                    {g.label}
                                </Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                {/* Kích thước */}
                <AccordionItem value="size" className="border-b-0 mb-4">
                    <AccordionTrigger className="text-lg font-black text-black hover:no-underline uppercase tracking-tight py-4">
                        Kích thước
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6">
                        <div className="grid grid-cols-4 gap-2">
                            {sizes.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleToggleFilter('size', s.id)}
                                    className={`h-10 rounded-xl font-black text-xs transition-all border-2 ${
                                        (activeFilters.size || []).includes(s.id)
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-500 border-gray-100 hover:border-black hover:text-black'
                                    }`}
                                >
                                    {s.tenSize}
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Màu sắc */}
                <AccordionItem value="color" className="border-b-0 mb-4">
                    <AccordionTrigger className="text-lg font-black text-black hover:no-underline uppercase tracking-tight py-4">
                        Màu sắc
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6">
                        <div className="flex flex-wrap gap-3">
                            {colors.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => handleToggleFilter('color', c.id)}
                                    title={c.tenMauSac}
                                    className={`w-10 h-10 rounded-full border-2 p-1 transition-all ${
                                        (activeFilters.color || []).includes(c.id)
                                            ? 'border-black scale-110 shadow-lg'
                                            : 'border-transparent hover:scale-110'
                                    }`}
                                >
                                    <div 
                                        className="w-full h-full rounded-full border border-gray-100 shadow-inner" 
                                        style={{ backgroundColor: c.maMauSac }} 
                                    />
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Giá */}
                <AccordionItem value="price" className="border-b-0 mb-4">
                    <AccordionTrigger className="text-lg font-black text-black hover:no-underline uppercase tracking-tight py-4">
                        Giá
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                        {priceRanges.map((p) => (
                            <div key={p.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggleFilter('price', p.id)}>
                                <Checkbox 
                                    id={`price-${p.id}`} 
                                    checked={(activeFilters.price || []).includes(p.id)}
                                    className="w-5 h-5 rounded-md border-gray-200 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                />
                                <Label className="text-sm font-bold text-gray-600 group-hover:text-black cursor-pointer transition-colors">
                                    {p.label}
                                </Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                {/* Chất liệu */}
                <AccordionItem value="material" className="border-b-0 mb-4">
                    <AccordionTrigger className="text-lg font-black text-black hover:no-underline uppercase tracking-tight py-4">
                        Chất liệu
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                        {materials.map((m) => (
                            <div key={m.id} className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleToggleFilter('material', m.id)}>
                                <Checkbox 
                                    id={`mat-${m.id}`} 
                                    checked={(activeFilters.material || []).includes(m.id)}
                                    className="w-5 h-5 rounded-md border-gray-200 data-[state=checked]:bg-black data-[state=checked]:border-black"
                                />
                                <Label className="text-sm font-bold text-gray-600 group-hover:text-black cursor-pointer transition-colors">
                                    {m.tenChatLieu}
                                </Label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
