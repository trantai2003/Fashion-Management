import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, Package } from "lucide-react";

export default function QuoteSuccess() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
            <Card className="max-w-2xl w-full border-0 shadow-2xl bg-white">
                <CardContent className="pt-12 pb-8 px-8">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200 animate-pulse">
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center animate-bounce">
                                    <Mail className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Gửi báo giá thành công!
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Cảm ơn quý đối tác đã gửi báo giá
                        </p>
                    </div>

                    {/* Information Cards */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-1">
                                    Email xác nhận đã được gửi
                                </h4>
                                <p className="text-sm text-blue-700">
                                    Bạn sẽ nhận được email xác nhận về báo giá đã gửi trong vài phút tới.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-900 mb-1">
                                    Chờ phản hồi từ khách hàng
                                </h4>
                                <p className="text-sm text-amber-700">
                                    Khách hàng sẽ xem xét báo giá và liên hệ lại với bạn trong thời gian sớm nhất.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-900 mb-1">
                                    Chuẩn bị hàng hóa
                                </h4>
                                <p className="text-sm text-green-700">
                                    Vui lòng chuẩn bị hàng hóa theo số lượng và thời gian đã cam kết trong báo giá.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 mb-8">
                        <h4 className="font-semibold text-gray-900 mb-2 text-center">
                            Cần hỗ trợ?
                        </h4>
                        <p className="text-sm text-gray-600 text-center">
                            Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại được cung cấp trong đơn hàng.
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <Button
                            onClick={() => navigate('/supplier/login')}
                            size="lg"
                            className="gap-2 px-8 bg-slate-900 text-white rounded-xl shadow-lg transition-all duration-300 border border-slate-900 hover:bg-white hover:text-slate-900"
                        >
                            Quay về trang đăng nhập
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}