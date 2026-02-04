// src/pages/customer/KhachHangDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhachHangById } from "@/services/khachHangService";

export default function KhachHangDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [khachHang, setKhachHang] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getKhachHangById(id);
        setKhachHang(data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin khách hàng");
        navigate("/customer");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Button variant="ghost" className="mb-6 text-purple-600 hover:text-purple-800" onClick={() => navigate("/customer")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="bg-purple-100 p-6 rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-purple-800">Chi tiết khách hàng</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-purple-600">Đang tải...</div>
          ) : khachHang ? (
            <div className="space-y-4">
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">ID:</strong>
                <span>{khachHang.id || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Mã khách hàng:</strong>
                <span>{khachHang.maKhachHang || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Tên khách hàng:</strong>
                <span>{khachHang.tenKhachHang || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Người liên hệ:</strong>
                <span>{khachHang.nguoiLienHe || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Số điện thoại:</strong>
                <span>{khachHang.soDienThoai || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Email:</strong>
                <span>{khachHang.email || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Địa chỉ:</strong>
                <span>{khachHang.diaChi || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Loại khách hàng:</strong>
                <span>{khachHang.loaiKhachHang || '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Trạng thái:</strong>
                <span className={`text-sm font-semibold ${khachHang.trangThai === 1 ? "text-green-700" : "text-red-700"}`}>
                  {khachHang.trangThai === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Ngày tạo:</strong>
                <span>{khachHang.ngayTao ? new Date(khachHang.ngayTao).toLocaleString() : '-'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong className="text-purple-800">Ngày cập nhật:</strong>
                <span>{khachHang.ngayCapNhat ? new Date(khachHang.ngayCapNhat).toLocaleString() : '-'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Không tìm thấy khách hàng</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}