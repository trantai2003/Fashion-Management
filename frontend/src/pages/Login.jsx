import React, { useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { nguoiDungService } from '../services/nguoiDungService';
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Checkbox } from "../components/ui/checkbox";
import { ShoppingBag, User, Lock, Mail, Phone, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loginData, setLoginData] = useState({
        username: '',
        matKhau: ''
    });

    const [registerData, setRegisterData] = useState({
        tenDangNhap: '',
        matKhau: '',
        xacNhanMatKhau: '',
        hoTen: '',
        email: '',
        soDienThoai: ''
    });

    const [errors, setErrors] = useState({});

    const validateRegister = () => {
        const newErrors = {};

        if (!registerData.tenDangNhap) {
            newErrors.tenDangNhap = 'Vui lòng nhập tên đăng nhập';
        } else if (registerData.tenDangNhap.length < 6 || registerData.tenDangNhap.length > 50) {
            newErrors.tenDangNhap = 'Tên đăng nhập phải từ 6-50 ký tự';
        }

        if (!registerData.matKhau) {
            newErrors.matKhau = 'Vui lòng nhập mật khẩu';
        } else if (registerData.matKhau.length < 6) {
            newErrors.matKhau = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!registerData.xacNhanMatKhau) {
            newErrors.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu';
        } else if (registerData.matKhau !== registerData.xacNhanMatKhau) {
            newErrors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
        }

        if (!registerData.hoTen) {
            newErrors.hoTen = 'Vui lòng nhập họ và tên';
        } else if (registerData.hoTen.length < 6 || registerData.hoTen.length > 100) {
            newErrors.hoTen = 'Họ tên phải từ 6-100 ký tự';
        }

        if (!registerData.email) {
            newErrors.email = 'Vui lòng nhập email';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerData.email)) {
                newErrors.email = 'Email không hợp lệ';
            }
        }

        if (!registerData.soDienThoai) {
            newErrors.soDienThoai = 'Vui lòng nhập số điện thoại';
        } else if (registerData.soDienThoai.length < 10 || registerData.soDienThoai.length > 11) {
            newErrors.soDienThoai = 'Số điện thoại phải từ 10-11 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        try {
            if (!loginData.username || !loginData.matKhau) {
                setErrors({ general: 'Vui lòng điền đầy đủ thông tin đăng nhập' });
                setIsLoading(false);
                return;
            }

            // Map username to username as per service requirement
            const payload = {
                username: loginData.username,
                password: loginData.matKhau
            };
            const response = await nguoiDungService.login(payload);

            if (response && response.status === 200) {
                // Login success - Token is already saved in nguoiDungService.login

                // Get token and decode to check role
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        // Decode JWT to get user info
                        const decoded = jwtDecode(token);
                        console.log("LOGIN SUCCESS - Decoded Token:", decoded);

                        // Check role and navigate accordingly
                        const role = decoded.scope || decoded.vaiTro || decoded.role || decoded.authorities;
                        console.log("LOGIN SUCCESS - Detected Role:", role);

                        if (role === 'quan_tri_vien') {
                            console.log("Redirecting to /admin/dashboard");
                            navigate('/dashboard'); // Redirect to dashboard
                        } else if (role === 'quan_ly_kho' || role === 'nhan_vien_kho') {
                            console.log("Redirecting to /warehouse");
                            navigate('/warehouse');
                        } else {
                            console.log("Redirecting to /");
                            navigate('/');
                        }
                    } catch (decodeError) {
                        console.error('Token decode error:', decodeError);
                        navigate('/'); // Default to home if decode fails
                    }
                } else {
                    navigate('/'); // Default to home if no token
                }
            } else {
                setErrors({ general: response.message || 'Đăng nhập thất bại' });
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập';
            setErrors({ general: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (validateRegister()) {
            setIsLoading(true);
            try {
                // Prepare payload
                const payload = {
                    tenDangNhap: registerData.tenDangNhap,
                    matKhau: registerData.matKhau,
                    hoTen: registerData.hoTen,
                    email: registerData.email,
                    soDienThoai: registerData.soDienThoai
                    // Add other fields if necessary
                };

                const response = await nguoiDungService.register(payload);

                if (response && response.status === 200) {
                    // Register success, redirect to verify email page
                    navigate(`/verify-email?email=${encodeURIComponent(registerData.email)}`);
                } else {
                    setErrors({ general: response.message || 'Đăng ký thất bại' });
                }
            } catch (error) {
                console.error("Register error:", error);
                const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký';
                setErrors({ general: errorMessage });
            } finally {
                setIsLoading(false);
            }
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

                            {/* Lock icon */}
                            <circle cx="120" cy="130" r="45" fill="#F472B6" opacity="0.9" />
                            <rect x="108" y="138" width="24" height="20" rx="2" fill="white" />
                            <path d="M 112 138 V 130 A 8 8 0 0 1 128 130 V 138" stroke="white" strokeWidth="3" fill="none" />

                            {/* Phone/Device */}
                            <rect x="200" y="150" width="150" height="280" rx="20" fill="#1F2937" />
                            <rect x="210" y="165" width="130" height="250" rx="10" fill="white" />
                            <rect x="215" y="175" width="120" height="8" rx="4" fill="#6366F1" />

                            {/* Profile icon on phone */}
                            <circle cx="275" cy="220" r="25" fill="#FBBF24" />
                            <circle cx="275" cy="215" r="10" fill="white" />
                            <path d="M 260 235 Q 275 225 290 235" stroke="white" strokeWidth="3" fill="white" />

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

                {/* Right Side - Login/Register Form */}
                <div className="w-full max-w-md mx-auto">
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Welcome to
                                </h1>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    {isLogin ? 'FashionFlow' : 'Đăng ký'}
                                </h2>
                            </div>

                            {isLogin ? (
                                /* Login Form */
                                <div className="space-y-6">
                                    {/* Social Login Buttons */}
                                    {/* Email Input */}

                                    {/* Error Message */}
                                    {errors.general && (
                                        <Alert variant="destructive" className="mb-4">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">{errors.general}</AlertDescription>
                                        </Alert>
                                    )}

                                    {/* Username/Email/Phone Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-gray-700 font-medium">Tên đăng nhập / Email / SĐT</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="Nhập tên đăng nhập, email hoặc SĐT"
                                                className="pl-10 h-12 border-gray-300"
                                                value={loginData.username}
                                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Password Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 h-12 border-gray-300"
                                                value={loginData.matKhau}
                                                onChange={(e) => setLoginData({ ...loginData, matKhau: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                checked={rememberMe}
                                                onCheckedChange={setRememberMe}
                                            />
                                            <label
                                                htmlFor="remember"
                                                className="text-sm text-gray-600 cursor-pointer"
                                            >
                                                Remember me
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => navigate('/forgot-password')}
                                            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>

                                    {/* Login Button */}
                                    <Button
                                        onClick={handleLogin}
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                                    >
                                        {isLoading ? 'Processing...' : 'Login'}
                                    </Button>

                                    {/* Register Link */}
                                    <p className="text-center text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <button
                                            onClick={() => setIsLogin(false)}
                                            className="text-purple-600 hover:text-purple-700 font-semibold"
                                        >
                                            Register
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                /* Register Form */
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-username">Tên đăng nhập *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="reg-username"
                                                placeholder="6-50 ký tự"
                                                className="pl-10"
                                                value={registerData.tenDangNhap}
                                                onChange={(e) => setRegisterData({ ...registerData, tenDangNhap: e.target.value })}
                                            />
                                        </div>
                                        {errors.tenDangNhap && (
                                            <Alert variant="destructive" className="py-2 bg-red-50 border-red-200 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm ml-2">{errors.tenDangNhap}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-fullname">Họ và tên *</Label>
                                        <Input
                                            id="reg-fullname"
                                            placeholder="6-100 ký tự"
                                            value={registerData.hoTen}
                                            onChange={(e) => setRegisterData({ ...registerData, hoTen: e.target.value })}
                                        />
                                        {errors.hoTen && (
                                            <Alert variant="destructive" className="py-2 bg-red-50 border-red-200 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm ml-2">{errors.hoTen}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">Email *</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="reg-email"
                                                type="email"
                                                placeholder="example@email.com"
                                                className="pl-10"
                                                value={registerData.email}
                                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            />
                                        </div>
                                        {errors.email && (
                                            <Alert variant="destructive" className="py-2 bg-red-50 border-red-200 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm ml-2">{errors.email}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-phone">Số điện thoại *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="reg-phone"
                                                placeholder="10-11 ký tự"
                                                className="pl-10"
                                                value={registerData.soDienThoai}
                                                onChange={(e) => setRegisterData({ ...registerData, soDienThoai: e.target.value })}
                                            />
                                        </div>
                                        {errors.soDienThoai && (
                                            <Alert variant="destructive" className="py-2 bg-red-50 border-red-200 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm ml-2">{errors.soDienThoai}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">Mật khẩu *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="reg-password"
                                                type="password"
                                                placeholder="Tối thiểu 6 ký tự"
                                                className="pl-10"
                                                value={registerData.matKhau}
                                                onChange={(e) => setRegisterData({ ...registerData, matKhau: e.target.value })}
                                            />
                                        </div>
                                        {errors.matKhau && (
                                            <Alert variant="destructive" className="py-2 bg-red-50 border-red-200 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm ml-2">{errors.matKhau}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reg-confirm-password">Xác nhận mật khẩu *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="reg-confirm-password"
                                                type="password"
                                                placeholder="Nhập lại mật khẩu"
                                                className="pl-10"
                                                value={registerData.xacNhanMatKhau}
                                                onChange={(e) => setRegisterData({ ...registerData, xacNhanMatKhau: e.target.value })}
                                            />
                                        </div>
                                        {errors.xacNhanMatKhau && (
                                            <Alert variant="destructive" className="py-2 bg-red-50 border-red-200 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm ml-2">{errors.xacNhanMatKhau}</AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleRegister}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                    >
                                        {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                                    </Button>

                                    <p className="text-center text-sm text-gray-600">
                                        Đã có tài khoản?{' '}
                                        <button
                                            onClick={() => setIsLogin(true)}
                                            className="text-purple-600 hover:text-purple-700 font-semibold"
                                        >
                                            Đăng nhập
                                        </button>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}