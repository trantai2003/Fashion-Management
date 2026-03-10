import React from 'react';
import { Outlet } from 'react-router-dom';
import StoreNavbar from './StoreNavbar';

export default function StoreLayout() {
    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
            <StoreNavbar />
            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="bg-black text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center space-x-2 mb-8">
                                <div className="bg-white p-2 rounded-xl">
                                    <h1 className="w-6 h-6 text-black font-black flex items-center justify-center">FF</h1>
                                </div>
                                <span className="text-2xl font-black tracking-tighter">
                                    FASHIONFLOW
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Chúng tôi mang đến những giải pháp thời trang hiện đại, kết hợp giữa công nghệ và phong cách sống.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-8">Sản phẩm</h3>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Áo Sơ Mi</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Quần Jean</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Váy Công Sở</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Phụ Kiện</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-8">Trợ giúp</h3>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Chính sách đổi trả</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn chọn size</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Vận chuyển</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-8">Bản tin</h3>
                            <p className="text-sm text-gray-400 mb-6">Đăng ký để nhận thông tin về sản phẩm mới nhất.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email của bạn"
                                    className="bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm flex-grow focus:ring-1 focus:ring-white"
                                />
                                <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                                    GỬI
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-10 flex flex-col md:row items-center justify-between gap-6 text-gray-500 text-xs font-bold uppercase tracking-widest">
                        <p>© 2026 FASHIONFLOW. ALL RIGHTS RESERVED.</p>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Facebook</a>
                            <a href="#" className="hover:text-white transition-colors">Instagram</a>
                            <a href="#" className="hover:text-white transition-colors">Tiktok</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
