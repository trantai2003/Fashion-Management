import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import supplierQuotationService from '@/services/supplierQuotationService';
import purchaseOrderService from '@/services/purchaseOrderService';

export default function SupplierLogin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('id');
    const emailParam = searchParams.get('email');

    const [email, setEmail] = useState(emailParam || '');
    const [manualSoDonMua, setManualSoDonMua] = useState(''); // For manual input when no URL param
    const [resolvedId, setResolvedId] = useState(null); // Store ID after lookup
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Check for Order ID on mount
    useEffect(() => {
        if (!orderId) {
            // Optional: Info toast or just let user input manual code
            // toast.info("Vui lòng nhập Mã đơn hàng (PO...) để tiếp tục.");
        }
    }, [orderId]);

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
        try {
            let targetId = orderId ? Number(orderId) : null;

            // If we have manual code but no ID yet, try to look it up
            if (!targetId && manualSoDonMua) {
                // Try to lookup ID by code
                try {
                    const searchResult = await purchaseOrderService.filter({
                        filters: [{
                            fieldName: "soDonMua",
                            operation: "EQUALS",
                            value: manualSoDonMua,
                            logicType: "AND"
                        }],
                        sorts: [],
                        page: 0,
                        size: 1
                    });

                    if (searchResult?.data?.content?.length > 0) {
                        targetId = searchResult.data.content[0].id;
                        setResolvedId(targetId);
                    } else {
                        toast.error('Không tìm thấy đơn hàng với mã này.');
                        setLoading(false);
                        return;
                    }
                } catch (lookupError) {
                    console.error('Lookup failed:', lookupError);
                    // Check if 401/403 - which implies we can't search without login
                    if (lookupError.response && (lookupError.response.status === 401 || lookupError.response.status === 403)) {
                        toast.error('Hệ thống không cho phép tra cứu mã đơn hàng công khai. Vui lòng sử dụng ID hoặc liên hệ quản trị viên.');
                    } else {
                        toast.error('Có lỗi khi tra cứu mã đơn hàng.');
                    }
                    setLoading(false);
                    return;
                }
            }

            if (!targetId) {
                toast.error('Vui lòng nhập mã đơn hàng (ví dụ: PO2026...) hoặc sử dụng liên kết từ email.');
                setLoading(false);
                return;
            }

            // Call API to request OTP with the ID
            await supplierQuotationService.requestOtp({
                email,
                donMuaHangId: targetId
            });

            toast.success('Mã OTP đã được gửi đến email của bạn');
            setStep(2);
        } catch (error) {
            console.error('Error sending OTP:', error);
            console.log('📦 Server Response:', error.response); // Debug log

            const errorMessage = error.response?.data?.message || '';
            const status = error.response?.status;

            // Check if OTP is still valid (backend cooldown)
            // Backend returns 400 with message "Otp chưa hết hạn..." if sent recently
            if (status === 400 && (
                errorMessage.toLowerCase().includes('otp') ||
                errorMessage.toLowerCase().includes('hết hạn') ||
                errorMessage.toLowerCase().includes('wait')
            )) {
                toast.info('Mã OTP cũ vẫn còn hiệu lực. Vui lòng kiểm tra email của bạn.');
                setStep(2); // Allow user to proceed
                return;
            }

            const message = errorMessage || 'Có lỗi xảy ra khi gửi OTP. Vui lòng thử lại.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!validateOtp()) return;

        // Use orderId from URL or resolvedId
        const activeId = orderId ? Number(orderId) : resolvedId;

        if (!activeId) {
            toast.error('Không tìm thấy thông tin đơn hàng. Vui lòng thử lại từ đầu.');
            return;
        }

        setLoading(true);

        try {
            // Call API to verify OTP
            const response = await supplierQuotationService.verifyOtp({
                email,
                otp,
                donMuaHangId: activeId
            });

            if (response && response.data) {
                toast.success('Đăng nhập thành công!');

                // Navigate to quotation page with order data
                setTimeout(() => {
                    navigate('/supplier/quotation', {
                        state: {
                            orderData: response.data,
                            supplierEmail: email,
                            orderId: activeId
                        }
                    });
                }, 500);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            const message = error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
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

                                {/* Order Code Field - Only show if no orderId from URL */}
                                {!orderId && step === 1 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="orderCode" className="text-gray-700 font-medium">
                                            Mã đơn hàng <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Package className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="orderCode"
                                                type="text"
                                                placeholder="Nhập mã đơn hàng... (ví dụ: PO2026...)"
                                                className="pl-10 h-11"
                                                value={manualSoDonMua}
                                                onChange={(e) => setManualSoDonMua(e.target.value)}
                                                disabled={loading}
                                            />
                                        </div>
                                        <p className="text-xs text-amber-600">
                                            💡 Nếu bạn có liên kết từ email, mã sẽ tự động điền
                                        </p>
                                    </div>
                                )}

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
                                                    handleSendOtp({ preventDefault: () => { } });
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