import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Type, 
  Building, 
  Clock,
  Hash,
  Contact2
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhachHangById } from "@/services/khachHangService";

const DetailItem = ({ icon: Icon, label, value, colorClass = "text-purple-600" }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white/80 border border-slate-100 hover:border-purple-100 hover:bg-white transition-all duration-300 shadow-sm">
    <div className={`p-2.5 rounded-lg bg-slate-50 ${colorClass} shrink-0`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-[15px] font-bold text-slate-900 mt-1 break-words">{value || "-"}</p>
    </div>
  </div>
);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
        <p className="text-slate-500 font-medium">Đang tải thông tin khách hàng...</p>
      </div>
    );
  }

  if (!khachHang) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
        <User className="h-16 w-16 opacity-20" />
        <p className="text-lg font-medium">Không tìm thấy dữ liệu khách hàng</p>
        <Button variant="outline" onClick={() => navigate("/customers")}>Quay lại danh sách</Button>
      </div>
    );
  }

  const getLoaiKhachHangDisplay = (loai) => {
    switch (loai) {
      case "le": return "Khách lẻ (Retail)";
      case "si": return "Khách sỉ (Wholesale)";
      case "doanh_nghiep": return "Doanh nghiệp (Business)";
      default: return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button 
                variant="ghost" 
                className="group p-0 hover:bg-transparent text-slate-500 hover:text-purple-600 transition-colors"
                onClick={() => navigate("/customers")}
            >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium">Quay lại danh sách</span>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate(`/customers/${id}/edit`)} 
              className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm gap-2 transition-all duration-300 px-6"
            >
              <Edit className="h-4 w-4" /> 
              Chỉnh sửa hồ sơ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Card */}
            <div className="lg:col-span-1">
                <Card className="border-0 shadow-xl shadow-purple-500/5 bg-white overflow-hidden rounded-2xl h-full">
                    <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white p-1 rounded-full shadow-lg">
                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-purple-600">
                                <User className="h-12 w-12" />
                            </div>
                        </div>
                    </div>
                    <CardContent className="pt-16 pb-8 text-center px-6">
                        <h2 className="text-xl font-bold text-slate-900">{khachHang.tenKhachHang}</h2>
                        <p className="text-slate-500 font-medium text-sm mt-1">{khachHang.maKhachHang}</p>
                        
                        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold ring-1 ring-inset shadow-sm">
                            <span className={`h-2 w-2 rounded-full ${khachHang.trangThai === 1 ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                            <span className={khachHang.trangThai === 1 ? "text-green-700" : "text-red-700"}>
                                {khachHang.trangThai === 1 ? "ĐANG HOẠT ĐỘNG" : "NGỪNG HOẠT ĐỘNG"}
                            </span>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 text-sm">
                                <span className="text-slate-500">Mã KH</span>
                                <span className="font-bold text-slate-900">{khachHang.maKhachHang}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 text-sm">
                                <span className="text-slate-500">Loại KH</span>
                                <span className="font-bold text-purple-600">{getLoaiKhachHangDisplay(khachHang.loaiKhachHang).split(' (')[0]}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Detailed Info Grid */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-0 shadow-xl shadow-purple-500/5 bg-white rounded-2xl">
                    <CardHeader className="border-b border-slate-50 px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-purple-600" />
                            Thông tin cá nhân & Liên hệ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem icon={User} label="Họ và tên" value={khachHang.tenKhachHang} />
                            <DetailItem icon={Contact2} label="Người liên hệ" value={khachHang.nguoiLienHe} colorClass="text-blue-600" />
                            <DetailItem icon={Phone} label="Số điện thoại" value={khachHang.soDienThoai} colorClass="text-green-600" />
                            <DetailItem icon={Mail} label="Địa chỉ Email" value={khachHang.email} colorClass="text-orange-600" />
                            <DetailItem icon={Type} label="Loại khách hàng" value={getLoaiKhachHangDisplay(khachHang.loaiKhachHang)} colorClass="text-pink-600" />
                            <DetailItem icon={Hash} label="Mã định danh" value={khachHang.maKhachHang} colorClass="text-slate-600" />
                        </div>
                        <div className="mt-4">
                            <DetailItem icon={MapPin} label="Địa chỉ cư trú / Trụ sở" value={khachHang.diaChi} colorClass="text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl shadow-purple-500/5 bg-white rounded-2xl">
                    <CardHeader className="border-b border-slate-50 px-8 py-6">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-600" />
                            Nhật ký tài khoản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                <Calendar className="h-8 w-8 text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ngày khởi tạo</p>
                                    <p className="text-slate-900 font-bold mt-1">
                                        {khachHang.ngayTao ? new Date(khachHang.ngayTao).toLocaleString('vi-VN') : "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                <Clock className="h-8 w-8 text-slate-400" />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cập nhật cuối</p>
                                    <p className="text-slate-900 font-bold mt-1">
                                        {khachHang.ngayCapNhat ? new Date(khachHang.ngayCapNhat).toLocaleString('vi-VN') : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}