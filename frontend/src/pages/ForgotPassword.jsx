import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nguoiDungService } from "../services/nguoiDungService";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Lock, Key } from "lucide-react";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();

    // 1: nhập email, 2: nhập OTP, 3: mật khẩu mới, 4: thành công
    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const otpValue = useMemo(() => otp.join(""), [otp]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setFieldError = (key, message) => setErrors((prev) => ({ ...prev, [key]: message }));
    const clearErrors = () => setErrors({});

    const handleSendOTP = async (e) => {
        e.preventDefault();
        clearErrors();

        const trimmed = email.trim();
        if (!trimmed) return setFieldError("email", "Vui lòng nhập email");
        if (!emailRegex.test(trimmed)) return setFieldError("email", "Email không hợp lệ");

        setIsLoading(true);
        try {
            const res = await nguoiDungService.sendForgotPasswordOTP(trimmed);
            if (res?.status === 200) {
                setEmail(trimmed);
                setStep(2);
            } else {
                setFieldError("email", res?.message || "Gửi OTP thất bại");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Có lỗi xảy ra khi gửi OTP";
            setFieldError("email", msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Step 2: chỉ kiểm tra đủ 6 số rồi chuyển step 3 (KHÔNG gọi API)
    const handleGoToNewPassword = (e) => {
        e.preventDefault();
        clearErrors();

        if (otpValue.length !== 6) return setFieldError("otp", "Vui lòng nhập đầy đủ mã OTP");
        setStep(3);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearErrors();

        if (otpValue.length !== 6) return setFieldError("otp", "Vui lòng nhập đầy đủ mã OTP");

        if (!newPassword) return setFieldError("newPassword", "Vui lòng nhập mật khẩu mới");
        if (newPassword.length < 6) return setFieldError("newPassword", "Mật khẩu phải có ít nhất 6 ký tự");
        if (newPassword !== confirmPassword) return setFieldError("confirmPassword", "Mật khẩu xác nhận không khớp");

        setIsLoading(true);
        try {
            const payload = {
                username: email,      // backend cho phép email là username
                otp: otpValue,
                password: newPassword // backend field là "password"
            };

            const res = await nguoiDungService.resetPassword(payload);

            if (res?.status === 200) {
                setStep(4);
            } else {
                setFieldError("general", res?.message || "Đặt lại mật khẩu thất bại");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu";
            setFieldError("general", msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        clearErrors();
        setOtp(["", "", "", "", "", ""]);

        const trimmed = email.trim();
        if (!trimmed) return setFieldError("general", "Vui lòng nhập email trước");

        setIsLoading(true);
        try {
            const res = await nguoiDungService.sendForgotPasswordOTP(trimmed);
            if (res?.status === 200) {
                setFieldError("success", "Mã OTP đã được gửi lại");
                setTimeout(() => setErrors({}), 2500);
            } else {
                setFieldError("general", res?.message || "Gửi lại OTP thất bại");
            }
        } catch (err) {
            const msg = err?.response?.data?.message || "Có lỗi xảy ra khi gửi lại OTP";
            setFieldError("general", msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const next = [...otp];
        next[index] = value;
        setOtp(next);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                <Card className="border-0 shadow-xl">
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            {step !== 4 && (
                                <button
                                    onClick={() => navigate("/login")}
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
                                {step === 1 && "Quên mật khẩu?"}
                                {step === 2 && "Nhập OTP"}
                                {step === 3 && "Đặt mật khẩu mới"}
                                {step === 4 && "Thành công!"}
                            </h1>
                            <p className="text-gray-600">
                                {step === 1 && "Nhập email để nhận mã OTP"}
                                {step === 2 && "Nhập mã OTP đã gửi về email"}
                                {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
                                {step === 4 && "Mật khẩu đã được đặt lại thành công"}
                            </p>
                        </div>

                        {/* Alerts */}
                        {(errors.general || errors.success) && (
                            <div className="space-y-3 mb-4">
                                {errors.general && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{errors.general}</AlertDescription>
                                    </Alert>
                                )}
                                {errors.success && (
                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-800 text-sm">{errors.success}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* Step 1: Email */}
                        {step === 1 && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                {errors.email && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{errors.email}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@gmail.com"
                                            className="pl-10 h-12 border-gray-300"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                >
                                    {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                                </Button>
                            </form>
                        )}

                        {/* Step 2: OTP */}
                        {step === 2 && (
                            <form onSubmit={handleGoToNewPassword} className="space-y-6">
                                {errors.otp && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{errors.otp}</AlertDescription>
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
                                                inputMode="numeric"
                                                maxLength={1}
                                                className="w-12 h-14 text-center text-xl font-bold border-gray-300"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            />
                                        ))}
                                    </div>

                                    <div className="text-center mt-3">
                                        <p className="text-sm text-gray-600">
                                            Không nhận được mã?{" "}
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                className="text-purple-600 hover:text-purple-700 font-semibold"
                                                disabled={isLoading}
                                            >
                                                Gửi lại
                                            </button>
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                >
                                    {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                                </Button>
                            </form>
                        )}

                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-6">
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
                                    <Label htmlFor="newPassword" className="text-gray-700 font-medium">Mật khẩu mới</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Tối thiểu 6 ký tự"
                                            className="pl-10 h-12 border-gray-300"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Xác nhận mật khẩu</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="pl-10 h-12 border-gray-300"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                >
                                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                                </Button>
                            </form>
                        )}

                        {/* Step 4: Success */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="text-center p-6 bg-green-50 rounded-lg">
                                    <p className="text-green-800 mb-2">Mật khẩu của bạn đã được đặt lại thành công!</p>
                                    <p className="text-sm text-gray-600">Bạn có thể đăng nhập với mật khẩu mới.</p>
                                </div>

                                <Button
                                    onClick={() => navigate("/login")}
                                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                >
                                    Đăng nhập ngay
                                </Button>
                            </div>
                        )}

                        {/* Progress */}
                        {step !== 4 && (
                            <div className="mt-8">
                                <div className="flex justify-between items-center">
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`flex-1 h-2 rounded-full mx-1 transition-colors ${s <= step ? "bg-gradient-to-r from-purple-600 to-blue-600" : "bg-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-600">
                                    <span>Email</span>
                                    <span>OTP</span>
                                    <span>Mật khẩu</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
