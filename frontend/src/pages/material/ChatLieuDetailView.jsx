// src/pages/material/ChatLieuDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getChatLieuById } from "@/services/chatLieuService";

/**
 * Component hiển thị chi tiết Chất liệu (View Only)
 * Có nút Edit để chuyển sang trang chỉnh sửa
 */
export default function ChatLieuDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [chatLieu, setChatLieu] = useState(null);

    // Load dữ liệu chất liệu theo ID
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getChatLieuById(id);
                setChatLieu(data);
            } catch (error) {
                console.error("Lỗi tải chi tiết:", error);
                toast.error("Không thể tải thông tin chất liệu");
                navigate("/material");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10 max-w-4xl">
                <div className="text-center py-20 text-purple-600">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!chatLieu) {
        return (
            <div className="container mx-auto py-10 max-w-4xl">
                <div className="text-center py-20 text-gray-500">
                    Không tìm thấy chất liệu
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            {/* Header - Nút quay lại và Edit */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-800"
                    onClick={() => navigate("/material")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                </Button>

                {/* Nút Edit - Chuyển sang trang chỉnh sửa */}
                <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => navigate(`/material/${id}`)}
                >
                    <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                </Button>
            </div>

            {/* Card hiển thị thông tin */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                <CardHeader className="bg-purple-100 p-6 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-purple-800">
                        Chi tiết Chất liệu
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                        Xem thông tin chi tiết của chất liệu
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8 space-y-6">
                    {/* Mã chất liệu */}
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-500">
                            Mã chất liệu
                        </div>
                        <div className="col-span-2 text-base font-medium text-gray-900">
                            {chatLieu.maChatLieu || "-"}
                        </div>
                    </div>

                    {/* Tên chất liệu */}
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-500">
                            Tên chất liệu
                        </div>
                        <div className="col-span-2 text-base font-medium text-gray-900">
                            {chatLieu.tenChatLieu || "-"}
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-500">
                            Mô tả
                        </div>
                        <div className="col-span-2 text-base text-gray-700 whitespace-pre-wrap">
                            {chatLieu.moTa || "-"}
                        </div>
                    </div>

                    {/* Trạng thái */}
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200">
                        <div className="text-sm font-semibold text-gray-500">
                            Trạng thái
                        </div>
                        <div className="col-span-2">
                            <span
                                className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
                                    chatLieu.trangThai === 1 || chatLieu.trangThai === true
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                            >
                                {chatLieu.trangThai === 1 || chatLieu.trangThai === true
                                    ? "Ngừng hoạt động"
                                    : "Hoạt động"}
                            </span>
                        </div>
                    </div>

                    {/* Ngày tạo */}
                    <div className="grid grid-cols-3 gap-4 pb-4">
                        <div className="text-sm font-semibold text-gray-500 flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            Ngày tạo
                        </div>
                        <div className="col-span-2 text-base text-gray-700">
                            {formatDate(chatLieu.ngayTao)}
                        </div>
                    </div>

                    {/* ID (cho admin/debug) */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div className="text-sm font-semibold text-gray-400">
                            ID
                        </div>
                        <div className="col-span-2 text-sm text-gray-500 font-mono">
                            #{chatLieu.id}
                        </div>
                    </div>
                </CardContent>

                {/* Footer với action buttons */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-600"
                        onClick={() => navigate("/material")}
                    >
                        Đóng
                    </Button>

                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => navigate(`/material/${id}`)}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa chất liệu
                    </Button>
                </div>
            </Card>
        </div>
    );
}