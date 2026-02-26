// src/pages/customer/KhachHangDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
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
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="text-center py-8 text-purple-600">Đang tải...</div>;

  if (!khachHang) return <div className="text-center py-8 text-muted-foreground">Không tìm thấy khách hàng</div>;

  // Hàm chuyển đổi loại khách hàng thành tên thân thiện
  const getLoaiKhachHangDisplay = (loai) => {
    switch (loai) {
      case "le": return "Cá nhân";
      case "si": return "Sỉ";
      case "doanh_nghiep": return "Doanh nghiệp";
      default: return "-";
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Button variant="ghost" className="mb-6 text-purple-600 hover:text-purple-800" onClick={() => navigate("/customers")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="bg-purple-100 p-6 rounded-t-2xl flex justify-between items-center">
          <CardTitle className="text-2xl font-bold text-purple-800">Chi tiết khách hàng</CardTitle>
          <Button onClick={() => navigate(`/customers/${id}/edit`)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong className="text-purple-800">ID:</strong> {khachHang.id}
            </div>
            <div>
              <strong className="text-purple-800">Mã khách hàng:</strong> {khachHang.maKhachHang || '-'}
            </div>
            <div>
              <strong className="text-purple-800">Tên khách hàng:</strong> {khachHang.tenKhachHang || '-'}
            </div>
            <div>
              <strong className="text-purple-800">Người liên hệ:</strong> {khachHang.nguoiLienHe || '-'}
            </div>
            <div>
              <strong className="text-purple-800">Số điện thoại:</strong> {khachHang.soDienThoai || '-'}
            </div>
            <div>
              <strong className="text-purple-800">Email:</strong> {khachHang.email || '-'}
            </div>
            <div className="col-span-2">
              <strong className="text-purple-800">Địa chỉ:</strong> {khachHang.diaChi || '-'}
            </div>
            <div>
              <strong className="text-purple-800">Loại khách hàng:</strong>{' '}
              <span className="font-medium">
                {getLoaiKhachHangDisplay(khachHang.loaiKhachHang)}
              </span>
            </div>
            <div>
              <strong className="text-purple-800">Trạng thái:</strong>{' '}
              <span className={`font-semibold ${khachHang.trangThai === 1 ? "text-green-700" : "text-red-700"}`}>
                {khachHang.trangThai === 1 ? "Hoạt động" : "Ngừng hoạt động"}
              </span>
            </div>
            <div>
              <strong className="text-purple-800">Ngày tạo:</strong> {khachHang.ngayTao ? new Date(khachHang.ngayTao).toLocaleString('vi-VN') : '-'}
            </div>
            <div>
              <strong className="text-purple-800">Ngày cập nhật:</strong> {khachHang.ngayCapNhat ? new Date(khachHang.ngayCapNhat).toLocaleString('vi-VN') : '-'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}