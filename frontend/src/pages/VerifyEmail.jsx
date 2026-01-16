import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Mail, CheckCircle2, AlertCircle, Key, ArrowLeft } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Get email from URL params
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

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

    const handleVerify = async (e) => {
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

            const response = await nguoiDungService.verifyAccount(payload);

            if (response && response.status === 200) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setErrors({ general: response.message || 'Xác thực thất bại' });
            }
        } catch (error) {
            console.error('Verify error:', error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xác thực';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtp(['', '', '', '', '', '']);
        setErrors({});

        try {
            const response = await nguoiDungService.resendOTP(email);

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

                            {/* Mail icon */}
                            <circle cx="120" cy="130" r="45" fill="#F472B6" opacity="0.9" />
                            <rect x="100" y="120" width="40" height="25" rx="3" fill="white" />
                            <path d="M 100 120 L 120 135 L 140 120" stroke="#F472B6" strokeWidth="2" fill="none" />

                            {/* Phone/Device */}
                            <rect x="200" y="150" width="150" height="280" rx="20" fill="#1F2937" />
                            <rect x="210" y="165" width="130" height="250" rx="10" fill="white" />
                            <rect x="215" y="175" width="120" height="8" rx="4" fill="#6366F1" />

                            {/* Checkmark on phone */}
                            <circle cx="275" cy="230" r="30" fill="#10B981" opacity="0.2" />
                            <path d="M 260 230 L 270 240 L 290 220" stroke="#10B981" strokeWidth="4" fill="none" />

                            {/* OTP boxes on phone */}
                            <rect x="225" y="270" width="15" height="20" rx="3" fill="#E5E7EB" />
                            <rect x="245" y="270" width="15" height="20" rx="3" fill="#E5E7EB" />
                            <rect x="265" y="270" width="15" height="20" rx="3" fill="#E5E7EB" />
                            <rect x="285" y="270" width="15" height="20" rx="3" fill="#E5E7EB" />
                            <rect x="305" y="270" width="15" height="20" rx="3" fill="#E5E7EB" />
                            <rect x="325" y="270" width="15" height="20" rx="3" fill="#E5E7EB" />

                            {/* Button on phone */}
                            <rect x="235" y="315" width="80" height="20" rx="10" fill="#F472B6" />
                        </svg>
                    </div>
                </div>

                {/* Right Side - Verification Form */}
                <div className="w-full max-w-md mx-auto">
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-8">
                            {!success ? (
                                <>
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="flex items-center text-gray-600 hover:text-purple-600 mb-4 transition-colors"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Quay lại đăng nhập
                                        </button>

                                        <div className="mb-4">
                                            <Key className="w-16 h-16 mx-auto text-purple-600" />
                                        </div>

                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            Xác thực Email
                                        </h1>
                                        <p className="text-gray-600">
                                            Mã OTP đã được gửi đến email
                                        </p>
                                        {email && (
                                            <p className="text-purple-600 font-semibold mt-1">
                                                {email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Error Messages */}
                                    {errors.general && (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.general}</AlertDescription>
                                        </Alert>
                                    )}

                                    {errors.otp && (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.otp}</AlertDescription>
                                        </Alert>
                                    )}

                                    {errors.success && (
                                        <Alert className="bg-green-50 border-green-200 mb-4">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <AlertDescription className="text-green-800 text-sm">
                                                {errors.success}
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {/* OTP Input */}
                                    <div className="space-y-6">
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
                                            onClick={handleVerify}
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
                                </>
                            ) : (
                                /* Success State */
                                <div className="text-center space-y-6">
                                    <div className="mb-4">
                                        <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
                                    </div>

                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Xác thực thành công!
                                    </h1>

                                    <div className="p-6 bg-green-50 rounded-lg">
                                        <p className="text-green-800 mb-4">
                                            Tài khoản của bạn đã được kích hoạt thành công!
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Đang chuyển hướng đến trang đăng nhập...
                                        </p>
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
