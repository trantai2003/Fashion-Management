import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ShoppingBag, 
    Search, 
    Menu, 
    X, 
    User, 
    Heart,
    ChevronDown,
    LayoutDashboard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { productService } from '@/services/productService';

export default function StoreNavbar() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productService.getCategories();
                if (res.data?.status === 200) {
                    setCategories(res.data.data.slice(0, 5));
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                        <div className="bg-black p-2 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-black">
                            FASHION<span className="text-purple-600">FLOW</span>
                        </span>
                    </Link>

                    {/* Desktop Categories */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {categories.map((cat) => (
                            <Link 
                                key={cat.id} 
                                to={`/category/${cat.id}`} 
                                className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors"
                            >
                                {cat.tenDanhMuc}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full bg-gray-50 border-none rounded-full pl-10 h-10 text-sm focus-visible:ring-2 focus-visible:ring-purple-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                            <Heart className="w-5 h-5 text-gray-700" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 relative">
                            <ShoppingBag className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">0</span>
                        </Button>
                        
                        {localStorage.getItem("access_token") ? (
                            <Link to="/dashboard">
                                <Button variant="outline" className="rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 transition-all font-black uppercase text-[10px] tracking-tighter gap-2">
                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                    Quản lý
                                </Button>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <Button variant="outline" className="rounded-full border-gray-200 hover:border-black transition-all font-semibold">
                                    Đăng nhập
                                </Button>
                            </Link>
                        )}
                    </div>


                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
                    <div className="px-4 py-6 space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-full bg-gray-50 border-none rounded-xl pl-10 h-12"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Danh mục</p>
                            {categories.map((cat) => (
                                <Link 
                                    key={cat.id} 
                                    to={`/category/${cat.id}`} 
                                    className="block px-2 py-3 text-lg font-bold text-gray-900 border-b border-gray-50"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {cat.tenDanhMuc}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            {localStorage.getItem("access_token") ? (
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-tighter flex items-center justify-center gap-2">
                                        <LayoutDashboard className="w-5 h-5" />
                                        Trang quản lý
                                    </Button>
                                </Link>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full h-12 rounded-xl bg-black hover:bg-gray-800 text-white font-bold">
                                        Đăng nhập
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </nav>
    );
}
