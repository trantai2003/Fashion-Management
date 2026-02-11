import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Building2,
    Mail,
    Loader2,
    ArrowRight,
    Package,
    TrendingUp,
    CheckCircle,
    ShieldCheck,
} from "lucide-react";

export default function SupplierLogin() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateEmail = () => {
        if (!email) {
            setErrors({ email: 'Vui lòng nhập email' });
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ email: 'Email không hợp lệ' });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateOtp = () => {
        if (!otp) {
            setErrors({ otp: 'Vui lòng nhập mã OTP' });
            return false;
        } else if (otp.length < 6) {
            setErrors({ otp: 'Mã OTP phải có 6 ký tự' });
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!validateEmail()) return;

        setLoading(true);

        // Simulate API Send OTP
        setTimeout(() => {
            console.log('Sending OTP to:', email);

            // Simulate check email existence
            if (email.includes('@')) {
                toast.success('Mã OTP đã được gửi đến email của bạn');
                setStep(2);
            } else {
                toast.error('Email không tồn tại trong hệ thống');
            }

            setLoading(false);
        }, 1500);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!validateOtp()) return;

        setLoading(true);

        // Simulate API Verify OTP
        setTimeout(() => {
            console.log('Verifying OTP:', otp, 'for email:', email);

            // Simulate successful login
            if (otp === '123456') {
                toast.success('Đăng nhập thành công!');

                setTimeout(() => {
                    toast.info('Chào mừng bạn đến với cổng nhà cung cấp');
                    // navigate('/supplier/dashboard');
                }, 1000);
            } else {
                toast.error('Mã OTP không đúng hoặc đã hết hạn');
            }

            setLoading(false);
        }, 1500);
    };

    const handleBack = () => {
        setStep(1);
        setOtp('');
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding & Features */}
                <div className="hidden lg:block space-y-8">
                    {/* Logo & Title */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-200">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                Cổng nhà cung cấp
                            </h1>
                            <p className="text-lg text-gray-600">
                                Quản lý đơn hàng và báo giá một cách dễ dàng
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Nhận yêu cầu báo giá nhanh chóng
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Nhận thông báo ngay khi có yêu cầu báo giá mới từ khách hàng
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Quản lý đơn hàng hiệu quả
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Theo dõi trạng thái đơn hàng và lịch sử giao dịch một cách dễ dàng
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Phân tích và báo cáo chi tiết
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Xem thống kê doanh thu và hiệu suất bán hàng theo thời gian thực
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full">
                    <Card className="border-0 shadow-2xl bg-white">
                        <CardHeader className="space-y-1 pb-6">
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                {step === 1 ? 'Đăng nhập' : 'Xác thực OTP'}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                {step === 1
                                    ? 'Nhập email để nhận mã xác thực'
                                    : `Mã OTP đã được gửi đến ${email}`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="supplier@company.com"
                                            className={`pl-10 h-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors({ ...errors, email: '' });
                                            }}
                                            disabled={loading || step === 2}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* OTP Field */}
                                {step === 2 && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="otp" className="text-gray-700 font-medium">
                                                Mã OTP <span className="text-red-500">*</span>
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                disabled={loading}
                                            >
                                                Thay đổi email?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="Nhập 6 số..."
                                                className={`pl-10 h-11 tracking-widest ${errors.otp ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                                value={otp}
                                                maxLength={6}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    setOtp(value);
                                                    if (errors.otp) setErrors({ ...errors, otp: '' });
                                                }}
                                                autoFocus
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.otp && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                {errors.otp}
                                            </p>
                                        )}
                                        <div className="text-right">
                                            <button
                                                type="button"
                                                disabled={loading}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                                onClick={() => {
                                                    toast.info('Đã gửi lại mã OTP');
                                                    // Logic resend API here
                                                }}
                                            >
                                                Gửi lại mã?
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-lg shadow-indigo-200 text-base font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            {step === 1 ? 'Nhận mã OTP' : 'Xác thực & Đăng nhập'}
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>

                                {/* Support Link */}
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Cần hỗ trợ?{' '}
                                        <a
                                            href="#"
                                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                                        >
                                            Liên hệ với chúng tôi
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Mobile Features */}
                    <div className="lg:hidden mt-6 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Nhận báo giá nhanh chóng</p>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <Package className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Quản lý đơn hàng hiệu quả</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-gray-600">
                    © 2026 Fashion System. All rights reserved.
                </p>
            </div>
        </div>
    );
}