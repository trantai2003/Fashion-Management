import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Edit, Loader2, User, Mail, Phone, MapPin,
  Calendar, Clock, Hash, Contact2, Users, Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhachHangById } from "@/services/khachHangService";

const LOAI_MAP = {
  le:           { label: "Khách lẻ (Retail)",       badge: "inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700",   dot: "h-1.5 w-1.5 rounded-full bg-blue-500" },
  si:           { label: "Khách sỉ (Wholesale)",     badge: "inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700", dot: "h-1.5 w-1.5 rounded-full bg-green-500" },
  doanh_nghiep: { label: "Doanh nghiệp (Business)", badge: "inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700", dot: "h-1.5 w-1.5 rounded-full bg-purple-500" },
};

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-slate-900 leading-snug">{value || "—"}</p>
    </div>
  );
}

export default function KhachHangDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [loading,    setLoading]    = useState(true);
  const [khachHang,  setKhachHang]  = useState(null);

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
      <div className="lux-sync warehouse-unified p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
          <span className="text-sm text-gray-600">Đang tải thông tin khách hàng...</span>
        </div>
      </div>
    );
  }

  if (!khachHang) return null;

  const loai = LOAI_MAP[khachHang.loaiKhachHang];

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>

          <Button
            onClick={() => navigate(`/customers/${id}/edit`)}
            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold"
          >
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa hồ sơ
          </Button>
        </div>

        {/* ── Stats cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mã khách hàng</p>
                <p className="text-sm font-bold text-gray-900 mt-1 font-mono">{khachHang.maKhachHang}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Hash className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white p-6 md:col-span-1 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loại khách hàng</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{loai?.label || "—"}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{khachHang.soDienThoai || "—"}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${khachHang.trangThai === 1 ? "bg-gradient-to-br from-emerald-50 to-white" : "bg-gradient-to-br from-slate-50 to-white"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                <p className={`text-sm font-bold mt-1 ${khachHang.trangThai === 1 ? "text-emerald-600" : "text-slate-500"}`}>
                  {khachHang.trangThai === 1 ? "Đang hoạt động" : "Ngừng hoạt động"}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${khachHang.trangThai === 1 ? "bg-emerald-100" : "bg-slate-100"}`}>
                <User className={`h-6 w-6 ${khachHang.trangThai === 1 ? "text-emerald-600" : "text-slate-400"}`} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Profile card ── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden h-full">
              {/* Gradient banner */}
              <div className="h-28 bg-gradient-to-r from-slate-800 to-slate-600 relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white p-1 rounded-full shadow-lg ring-2 ring-slate-100">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="pt-14 pb-6 text-center px-6">
                <h2 className="text-lg font-bold text-slate-900">{khachHang.tenKhachHang}</h2>
                <p className="text-slate-400 font-mono text-xs mt-1">{khachHang.maKhachHang}</p>

                {loai && (
                  <div className="mt-3 flex justify-center">
                    <span className={loai.badge}>
                      <span className={loai.dot} />
                      {loai.label}
                    </span>
                  </div>
                )}

                <div className="mt-6 space-y-2 text-left">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm border border-slate-100">
                    <span className="text-slate-500">Mã KH</span>
                    <span className="font-bold text-slate-900 font-mono">{khachHang.maKhachHang}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-sm border border-slate-100">
                    <span className="text-slate-500">Trạng thái</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold ${khachHang.trangThai === 1 ? "text-emerald-600" : "text-slate-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${khachHang.trangThai === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                      {khachHang.trangThai === 1 ? "Hoạt động" : "Ngừng"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Info panels ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin cá nhân */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                  <Contact2 className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Thông tin cá nhân & Liên hệ</p>
                  <p className="text-xs text-slate-500 mt-0.5">Hồ sơ khách hàng</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label="Họ và tên"        value={khachHang.tenKhachHang} />
                  <InfoField label="Người liên hệ"    value={khachHang.nguoiLienHe} />
                  <InfoField label="Số điện thoại"    value={khachHang.soDienThoai} />
                  <InfoField label="Địa chỉ Email"    value={khachHang.email} />
                  <InfoField label="Loại khách hàng"  value={loai?.label} />
                  <InfoField label="Mã định danh"     value={khachHang.maKhachHang} />
                </div>
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <InfoField label="Địa chỉ cư trú / Trụ sở" value={khachHang.diaChi} />
                </div>
              </div>
            </div>

            {/* Nhật ký tài khoản */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-snug">Nhật ký tài khoản</p>
                  <p className="text-xs text-slate-500 mt-0.5">Thời gian tạo và cập nhật</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Calendar className="h-8 w-8 text-slate-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày khởi tạo</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        {khachHang.ngayTao ? new Date(khachHang.ngayTao).toLocaleString('vi-VN') : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock className="h-8 w-8 text-slate-300 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cập nhật cuối</p>
                      <p className="text-slate-900 font-semibold mt-1">
                        {khachHang.ngayCapNhat ? new Date(khachHang.ngayCapNhat).toLocaleString('vi-VN') : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}