import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Menu,
    X,
    ShoppingBag,
    Package,
    BarChart3,
    Users,
    Zap,
    Shield,
    Smartphone,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    Star
} from 'lucide-react';

export default function FashionFlowHomepage() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: Package,
            title: 'Quản lý kho thông minh',
            description: 'Theo dõi tồn kho real-time, cảnh báo hết hàng tự động và quản lý nhập xuất hiệu quả'
        },
        {
            icon: BarChart3,
            title: 'Báo cáo & Phân tích',
            description: 'Dashboard trực quan với biểu đồ chi tiết giúp đưa ra quyết định kinh doanh chính xác'
        },
        {
            icon: Users,
            title: 'Quản lý nhân viên',
            description: 'Phân quyền linh hoạt, theo dõi hiệu suất và quản lý ca làm việc dễ dàng'
        },
        {
            icon: Zap,
            title: 'Xử lý nhanh chóng',
            description: 'Giao diện tối ưu giúp xử lý đơn hàng nhanh gấp 3 lần so với phương pháp truyền thống'
        },
        {
            icon: Shield,
            title: 'Bảo mật tuyệt đối',
            description: 'Mã hóa dữ liệu đa lớp, sao lưu tự động và tuân thủ các tiêu chuẩn bảo mật quốc tế'
        },
        {
            icon: Smartphone,
            title: 'Đa nền tảng',
            description: 'Truy cập mọi lúc mọi nơi trên web, mobile và tablet với trải nghiệm nhất quán'
        }
    ];

    const stats = [
        { value: '10,000+', label: 'Khách hàng tin dùng' },
        { value: '99.9%', label: 'Uptime đảm bảo' },
        { value: '5M+', label: 'Đơn hàng xử lý' },
        { value: '24/7', label: 'Hỗ trợ khách hàng' }
    ];

    const testimonials = [
        {
            name: 'Nguyễn Thị Mai',
            role: 'CEO - Mai Fashion Store',
            content: 'FashionFlow đã giúp cửa hàng của tôi tăng 40% hiệu suất quản lý kho. Giao diện đơn giản nhưng đầy đủ tính năng!',
            rating: 5
        },
        {
            name: 'Trần Văn Hùng',
            role: 'Quản lý - Hùng Clothing',
            content: 'Tôi đã thử nhiều phần mềm nhưng FashionFlow là tốt nhất. Báo cáo chi tiết và dễ sử dụng.',
            rating: 5
        },
        {
            name: 'Lê Thị Hoa',
            role: 'Chủ cửa hàng - Hoa Boutique',
            content: 'Hệ thống cảnh báo hết hàng giúp tôi không bao giờ bỏ lỡ đơn hàng. Rất hài lòng!',
            rating: 5
        }
    ];

    const pricingPlans = [
        {
            name: 'Starter',
            price: '299,000',
            description: 'Phù hợp cho cửa hàng nhỏ',
            features: [
                'Quản lý tối đa 1000 sản phẩm',
                'Báo cáo cơ bản',
                '2 người dùng',
                'Hỗ trợ email',
                'Lưu trữ 5GB'
            ],
            popular: false
        },
        {
            name: 'Professional',
            price: '599,000',
            description: 'Dành cho doanh nghiệp vừa',
            features: [
                'Sản phẩm không giới hạn',
                'Báo cáo nâng cao + AI',
                '10 người dùng',
                'Hỗ trợ ưu tiên 24/7',
                'Lưu trữ 50GB',
                'Tích hợp API'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Liên hệ',
            description: 'Giải pháp cho doanh nghiệp lớn',
            features: [
                'Tất cả tính năng Pro',
                'Tùy chỉnh theo yêu cầu',
                'Người dùng không giới hạn',
                'Dedicated support',
                'Lưu trữ không giới hạn',
                'On-premise deployment'
            ],
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                FashionFlow
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition">Tính năng</a>
                            <a href="#pricing" className="text-gray-700 hover:text-purple-600 font-medium transition">Bảng giá</a>
                            <a href="#testimonials" className="text-gray-700 hover:text-purple-600 font-medium transition">Đánh giá</a>
                            <a href="#contact" className="text-gray-700 hover:text-purple-600 font-medium transition">Liên hệ</a>
                            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50" onClick={() => navigate('/login')}>
                                Đăng nhập
                            </Button>
                            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                Dùng thử miễn phí
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-gray-700"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-4 py-4 space-y-3">
                            <a href="#features" className="block text-gray-700 hover:text-purple-600 font-medium">Tính năng</a>
                            <a href="#pricing" className="block text-gray-700 hover:text-purple-600 font-medium">Bảng giá</a>
                            <a href="#testimonials" className="block text-gray-700 hover:text-purple-600 font-medium">Đánh giá</a>
                            <a href="#contact" className="block text-gray-700 hover:text-purple-600 font-medium">Liên hệ</a>
                            <Button variant="outline" className="w-full border-purple-600 text-purple-600" onClick={() => navigate('/login')}>
                                Đăng nhập
                            </Button>
                            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                                Dùng thử miễn phí
                            </Button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                #1 Phần mềm quản lý kho quần áo tại Việt Nam
                            </Badge>
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Quản lý kho thời trang
                                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    thông minh hơn
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                FashionFlow giúp bạn quản lý kho hàng, đơn hàng và nhân viên một cách hiệu quả với công nghệ AI tiên tiến. Tăng 300% năng suất chỉ trong 30 ngày!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8">
                                    Bắt đầu miễn phí 14 ngày
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                                <Button size="lg" variant="outline" className="text-lg px-8 border-gray-300">
                                    Xem demo
                                </Button>
                            </div>
                            <div className="mt-8 flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                                    Không cần thẻ tín dụng
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                                    Hủy bất cứ lúc nào
                                </div>
                            </div>
                        </div>

                        {/* Hero Illustration */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl p-8 shadow-2xl">
                                <div className="bg-white rounded-2xl p-6 shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                                        <Badge className="bg-green-100 text-green-700">Live</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                                            <div>
                                                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                                                <p className="text-2xl font-bold text-gray-900">₫245,8M</p>
                                            </div>
                                            <div className="text-green-600">
                                                <TrendingUp className="w-8 h-8" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Đơn hàng</p>
                                                <p className="text-xl font-bold text-gray-900">1,234</p>
                                            </div>
                                            <div className="p-4 bg-pink-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Sản phẩm</p>
                                                <p className="text-xl font-bold text-gray-900">5,678</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 bg-yellow-400 p-3 rounded-full shadow-lg animate-bounce">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-pink-400 p-3 rounded-full shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
                            Tính năng
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Mọi thứ bạn cần để
                            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                quản lý kho hiệu quả
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            FashionFlow cung cấp đầy đủ công cụ giúp bạn kiểm soát mọi khía cạnh của kho hàng thời trang
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                            Bảng giá
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Chọn gói phù hợp với bạn
                        </h2>
                        <p className="text-xl text-gray-600">
                            Linh hoạt, minh bạch và không ràng buộc dài hạn
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, index) => (
                            <Card key={index} className={`relative ${plan.popular ? 'border-2 border-purple-600 shadow-2xl scale-105' : 'border-2 border-gray-200'}`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1">
                                            Phổ biến nhất
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-gray-900">{plan.price === 'Liên hệ' ? plan.price : `₫${plan.price}`}</span>
                                        {plan.price !== 'Liên hệ' && <span className="text-gray-600">/tháng</span>}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 mb-6">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}>
                                        {plan.price === 'Liên hệ' ? 'Liên hệ tư vấn' : 'Bắt đầu ngay'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
                            Đánh giá
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Khách hàng nói gì về chúng tôi
                        </h2>
                        <p className="text-xl text-gray-600">
                            Hơn 10,000 doanh nghiệp đã tin tưởng FashionFlow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="border-2 border-gray-100 hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <div className="flex mb-3">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <CardDescription className="text-base text-gray-700 italic">
                                        "{testimonial.content}"
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-3">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Sẵn sàng bắt đầu với FashionFlow?
                    </h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Tham gia cùng hàng ngàn doanh nghiệp đang sử dụng FashionFlow để tối ưu hóa quản lý kho
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8">
                            Dùng thử miễn phí 14 ngày
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8">
                            Đặt lịch demo
                        </Button>
                    </div>
                    <p className="mt-6 text-purple-100 text-sm">
                        Không cần thẻ tín dụng • Hủy bất cứ lúc nào • Hỗ trợ 24/7
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">FashionFlow</span>
                            </div>
                            <p className="text-sm">
                                Giải pháp quản lý kho thời trang hàng đầu Việt Nam
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Sản phẩm</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-purple-400">Tính năng</a></li>
                                <li><a href="#" className="hover:text-purple-400">Bảng giá</a></li>
                                <li><a href="#" className="hover:text-purple-400">API</a></li>
                                <li><a href="#" className="hover:text-purple-400">Tích hợp</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Công ty</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-purple-400">Về chúng tôi</a></li>
                                <li><a href="#" className="hover:text-purple-400">Blog</a></li>
                                <li><a href="#" className="hover:text-purple-400">Tuyển dụng</a></li>
                                <li><a href="#" className="hover:text-purple-400">Liên hệ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-4">Hỗ trợ</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-purple-400">Trung tâm trợ giúp</a></li>
                                <li><a href="#" className="hover:text-purple-400">Hướng dẫn</a></li>
                                <li><a href="#" className="hover:text-purple-400">Điều khoản</a></li>
                                <li><a href="#" className="hover:text-purple-400">Bảo mật</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-sm">
                        <p>© 2026 FashionFlow. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}