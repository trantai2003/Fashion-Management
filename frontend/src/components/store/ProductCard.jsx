import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';

export default function ProductCard({ product }) {
    const mainImage = product.anhQuanAos?.[0]?.tepTin?.duongDan || "https://placehold.co/600x800/f3f4f6/9ca3af?text=No+Image";

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100">
            {/* Image Container */}
            <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden">
                <img
                    src={mainImage}
                    alt={product.tenSanPham}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.soLuongTon > 0 ? (
                        <Badge className="bg-white/90 backdrop-blur-sm text-black border-none font-bold text-[10px] px-2 py-1">
                            NEW ARRIVAL
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="font-bold text-[10px] px-2 py-1">
                            OUT OF STOCK
                        </Badge>
                    )}
                </div>

                <button className="absolute bottom-4 right-4 p-3 bg-white text-black rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white">
                    <ShoppingBag className="w-5 h-5" />
                </button>
            </Link>

            {/* Content */}
            <div className="p-6">
                <div className="mb-2 flex justify-between items-start">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                        {product.danhMuc?.tenDanhMuc || "Fashion"}
                    </p>
                    <div className="flex items-center text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[10px] font-bold text-gray-400 ml-1">4.5</span>
                    </div>
                </div>

                <Link to={`/product/${product.id}`} className="block mb-3">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                        {product.tenSanPham}
                    </h3>
                </Link>

                <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-black">
                        {formatCurrency(product.giaBanMacDinh)}
                    </p>
                    <button className="text-gray-300 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
