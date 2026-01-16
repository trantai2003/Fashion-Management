import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
    Mail,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Lock,
    Key
} from 'lucide-react';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!email) {
            setErrors({ email: 'Vui lòng nhập email' });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrors({ email: 'Email không hợp lệ' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await nguoiDungService.sendForgotPasswordOTP(email);

            if (response && response.status === 200) {
                setStep(2);
            } else {
                setErrors({ email: response.message || 'Gửi OTP thất bại' });
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP';
            setErrors({ email: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setErrors({});

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setErrors({ otp: 'Vui lòng nhập đầy đủ mã OTP' });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                email: email,
                otp: otpValue
            };

            const response = await nguoiDungService.verifyForgotPasswordOTP(payload);

            if (response && response.status === 200) {
                setStep(3);
            } else {
                setErrors({ otp: response.message || 'Mã OTP không chính xác' });
            }
        } catch (error) {
            console.error('Verify OTP error:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xác thực OTP';
            setErrors({ otp: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!newPassword) {
            setErrors({ newPassword: 'Vui lòng nhập mật khẩu mới' });
            return;
        }

        if (newPassword.length < 6) {
            setErrors({ newPassword: 'Mật khẩu phải có ít nhất 6 ký tự' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: 'Mật khẩu xác nhận không khớp' });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                email: email,
                otp: otp.join(''),
                newPassword: newPassword
            };

            const response = await nguoiDungService.resetPassword(payload);

            if (response && response.status === 200) {
                setStep(4);
            } else {
                setErrors({ general: response.message || 'Đặt lại mật khẩu thất bại' });
            }
        } catch (error) {
            console.error('Reset password error:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value[0];
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleResendOTP = async () => {
        setOtp(['', '', '', '', '', '']);
        setErrors({});

        try {
            const response = await nguoiDungService.sendForgotPasswordOTP(email);

            if (response && response.status === 200) {
                setErrors({ success: 'Mã OTP đã được gửi lại' });
                setTimeout(() => setErrors({}), 3000);
            } else {
                setErrors({ general: response.message || 'Gửi lại OTP thất bại' });
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại OTP';
            setErrors({ general: errorMessage });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                {/* Left Side - Illustration */}
                <div className="hidden md:flex flex-col items-center justify-center p-8">
                    <div className="relative w-full max-w-md">
                        <svg viewBox="0 0 400 500" className="w-full h-auto">
                            {/* Background shapes */}
                            <circle cx="100" cy="100" r="60" fill="#F472B6" opacity="0.2" />
                            <circle cx="320" cy="150" r="40" fill="#A78BFA" opacity="0.2" />

                            {/* Person illustration */}
                            <ellipse cx="80" cy="420" rx="25" ry="8" fill="#1F2937" opacity="0.2" />
                            <rect x="60" y="350" width="40" height="70" rx="20" fill="#7C3AED" />
                            <circle cx="80" cy="320" r="25" fill="#FCD34D" />
                            <path d="M 70 315 Q 80 310 90 315" stroke="#1F2937" strokeWidth="2" fill="none" />
                            <circle cx="75" cy="315" r="2" fill="#1F2937" />
                            <circle cx="85" cy="315" r="2" fill="#1F2937" />

                            {/* Lock icon with key */}
                            <circle cx="120" cy="130" r="45" fill="#F472B6" opacity="0.9" />
                            <rect x="108" y="138" width="24" height="20" rx="2" fill="white" />
                            <path d="M 112 138 V 130 A 8 8 0 0 1 128 130 V 138" stroke="white" strokeWidth="3" fill="none" />

                            {/* Key */}
                            <g transform="translate(280, 120)">
                                <circle cx="0" cy="0" r="8" fill="#FBBF24" />
                                <rect x="5" y="-2" width="30" height="4" rx="2" fill="#FBBF24" />
                                <rect x="30" y="-5" width="3" height="4" fill="#FBBF24" />
                                <rect x="30" y="1" width="3" height="4" fill="#FBBF24" />
                            </g>

                            {/* Phone/Device */}
                            <rect x="200" y="150" width="150" height="280" rx="20" fill="#1F2937" />
                            <rect x="210" y="165" width="130" height="250" rx="10" fill="white" />
                            <rect x="215" y="175" width="120" height="8" rx="4" fill="#6366F1" />

                            {/* Mail icon on phone */}
                            <rect x="250" y="210" width="50" height="35" rx="4" fill="#FBBF24" />
                            <path d="M 250 210 L 275 230 L 300 210" stroke="white" strokeWidth="3" fill="none" />

                            {/* Input fields on phone */}
                            <rect x="225" y="265" width="100" height="12" rx="6" fill="#E5E7EB" />
                            <rect x="225" y="285" width="100" height="12" rx="6" fill="#E5E7EB" />

                            {/* Button on phone */}
                            <rect x="235" y="315" width="80" height="20" rx="10" fill="#F472B6" />

                            {/* Gear decorations */}
                            <g transform="translate(180, 80)">
                                <circle cx="0" cy="0" r="20" fill="#D1D5DB" />
                                <circle cx="0" cy="0" r="12" fill="white" />
                            </g>
                            <g transform="translate(240, 60)">
                                <circle cx="0" cy="0" r="15" fill="#D1D5DB" />
                                <circle cx="0" cy="0" r="9" fill="white" />
                            </g>
                        </svg>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full max-w-md mx-auto">
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                {step !== 4 && (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="flex items-center text-gray-600 hover:text-purple-600 mb-4 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Quay lại
                                    </button>
                                )}

                                <div className="mb-4">
                                    {step === 1 && <Mail className="w-16 h-16 mx-auto text-purple-600" />}
                                    {step === 2 && <Key className="w-16 h-16 mx-auto text-purple-600" />}
                                    {step === 3 && <Lock className="w-16 h-16 mx-auto text-purple-600" />}
                                    {step === 4 && <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />}
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {step === 1 && 'Quên mật khẩu?'}
                                    {step === 2 && 'Xác thực OTP'}
                                    {step === 3 && 'Đặt mật khẩu mới'}
                                    {step === 4 && 'Thành công!'}
                                </h1>
                                <p className="text-gray-600">
                                    {step === 1 && 'Nhập email để nhận mã xác thực'}
                                    {step === 2 && 'Mã OTP đã được gửi đến email của bạn'}
                                    {step === 3 && 'Tạo mật khẩu mới cho tài khoản'}
                                    {step === 4 && 'Mật khẩu đã được đặt lại thành công'}
                                </p>
                            </div>

                            {/* Step 1: Email Input */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    {errors.email && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.email}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 font-medium">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example@gmail.com"
                                                className="pl-10 h-12 border-gray-300"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSendOTP}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                    >
                                        {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: OTP Verification */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    {errors.otp && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.otp}</AlertDescription>
                                        </Alert>
                                    )}

                                    {errors.success && (
                                        <Alert className="bg-green-50 border-green-200">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <AlertDescription className="text-green-800 text-sm">
                                                {errors.success}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Mã OTP</Label>
                                        <div className="flex gap-2 justify-center">
                                            {otp.map((digit, index) => (
                                                <Input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    maxLength={1}
                                                    className="w-12 h-14 text-center text-xl font-bold border-gray-300"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleVerifyOTP}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                    >
                                        {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">
                                            Không nhận được mã?{' '}
                                            <button
                                                onClick={handleResendOTP}
                                                className="text-purple-600 hover:text-purple-700 font-semibold"
                                            >
                                                Gửi lại
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: New Password */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    {errors.general && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.general}</AlertDescription>
                                        </Alert>
                                    )}

                                    {errors.newPassword && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.newPassword}</AlertDescription>
                                        </Alert>
                                    )}

                                    {errors.confirmPassword && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.confirmPassword}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                                            Mật khẩu mới
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                placeholder="Tối thiểu 6 ký tự"
                                                className="pl-10 h-12 border-gray-300"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                            Xác nhận mật khẩu
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="Nhập lại mật khẩu mới"
                                                className="pl-10 h-12 border-gray-300"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleResetPassword}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                    </Button>
                                </div>
                            )}

                            {/* Step 4: Success */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="text-center p-6 bg-green-50 rounded-lg">
                                        <p className="text-green-800 mb-4">
                                            Mật khẩu của bạn đã được đặt lại thành công!
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Bạn có thể đăng nhập với mật khẩu mới
                                        </p>
                                    </div>

                                    <Button
                                        onClick={() => navigate('/login')}
                                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                    >
                                        Đăng nhập ngay
                                    </Button>
                                </div>
                            )}

                            {/* Progress Indicator */}
                            {step !== 4 && (
                                <div className="mt-8">
                                    <div className="flex justify-between items-center">
                                        {[1, 2, 3].map((s) => (
                                            <div
                                                key={s}
                                                className={`flex-1 h-2 rounded-full mx-1 transition-colors ${s <= step
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                                    : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                                        <span>Email</span>
                                        <span>OTP</span>
                                        <span>Mật khẩu mới</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}