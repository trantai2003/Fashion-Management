// src/pages/supplier/SupplierDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { toast } from "sonner";
import { getSupplierById } from "@/services/supplierService";

export default function SupplierDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load dữ liệu nhà cung cấp
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSupplierById(id);
                setSupplier(data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Không thể tải thông tin nhà cung cấp");
                navigate("/supplier");
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
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="text-center py-8 text-purple-600">Đang tải...</div>
            </div>
        );
    }

    if (!supplier) {
        return null;
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            {/* Header với nút quay lại và chỉnh sửa */}
            <div className="flex items-center justify-between mb-6">
                <Button
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-800"
                    onClick={() => navigate("/supplier")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
                </Button>
                <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => navigate(`/supplier/${id}`)}
                >
                    <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                </Button>
            </div>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                <CardHeader className="bg-purple-100 p-6 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-purple-800">
                        Chi tiết nhà cung cấp
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Mã nhà cung cấp */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-purple-800">
                                Mã nhà cung cấp
                            </label>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="text-gray-900 font-medium">
                                    {supplier.maNhaCungCap || "-"}
                                </span>
                            </div>
                        </div>

                        {/* Tên nhà cung cấp */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-purple-800">
                                Tên nhà cung cấp
                            </label>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="text-gray-900 font-medium">
                                    {supplier.tenNhaCungCap || "-"}
                                </span>
                            </div>
                        </div>

                        {/* Người liên hệ */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-purple-800">
                                Người liên hệ
                            </label>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="text-gray-900">
                                    {supplier.nguoiLienHe || "-"}
                                </span>
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-purple-800">
                                Số điện thoại
                            </label>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="text-gray-900">
                                    {supplier.soDienThoai || "-"}
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-purple-800">
                                Email
                            </label>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span className="text-gray-900">
                                    {supplier.email || "-"}
                                </span>
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-purple-800">
                                Trạng thái
                            </label>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                        supplier.trangThai === 1
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {supplier.trangThai === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Địa chỉ - Full width */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-purple-800">
                            Địa chỉ
                        </label>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <span className="text-gray-900">
                                {supplier.diaChi || "-"}
                            </span>
                        </div>
                    </div>

                    {/* Thông tin thời gian */}
                    <div className="pt-6 border-t border-purple-200">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">
                            Thông tin hệ thống
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ngày tạo */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-purple-800">
                                    Ngày tạo
                                </label>
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <span className="text-gray-900 text-sm">
                                        {formatDate(supplier.ngayTao)}
                                    </span>
                                </div>
                            </div>

                            {/* Ngày cập nhật */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-purple-800">
                                    Ngày cập nhật
                                </label>
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                    <span className="text-gray-900 text-sm">
                                        {formatDate(supplier.ngayCapNhat)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}