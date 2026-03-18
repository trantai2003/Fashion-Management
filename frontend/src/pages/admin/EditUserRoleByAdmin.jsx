import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROLES } from "@/constants/backend/role";
import { nguoiDungService } from "@/services/nguoiDungService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, ChevronDown, RefreshCcw, UserCog, Lock, Unlock,
  Warehouse, AlertCircle, Save, X,
} from "lucide-react";
import { toast } from "sonner";
import AssignWarehousePermissionModal from "@/components/admin/AssignWarehousePermissionModal";

export default function UserPermissionEditByAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userWarehouses, setUserWarehouses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [form, setForm] = useState({
    role: "quan_ly_kho",
    status: 1,
  });

  const reloadUserWarehouses = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await nguoiDungService.getById(id);
      const dto = res?.data;
      if (!dto) return;

      setForm({
        role: dto.vaiTro || "quan_ly_kho",
        status: dto.trangThai ?? 1,
      });
      setUserWarehouses(dto.khoPhuTrach || []);
    } catch (err) {
      console.error("Lỗi tải thông tin người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadUserWarehouses();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: Number(id),
      vaiTro: form.role,
    };

    try {
      setLoading(true);
      await nguoiDungService.updatePermission(payload);
      toast.success("Cập nhật vai trò người dùng thành công!");
      
      // Nếu có thay đổi trạng thái, xử lý tiếp (nếu cần)
      // Tạm thời chỉ xử lý vai trò như yêu cầu
      
      setTimeout(() => navigate("/users"), 1000);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      toast.error(err.response?.data?.message || "Không thể cập nhật vai trò");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (value) => {
    setForm((prev) => ({ ...prev, role: value }));
  };

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Card */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <UserCog className="h-6 w-6 text-purple-600" />
                  Thiết lập vai trò & quyền kho
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Quản lý vai trò hệ thống và kho phụ trách cho người dùng
                </p>
              </div>
              <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                User ID: {id}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Vai trò hệ thống */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                1. Vai trò hệ thống
              </CardTitle>
              <p className="text-sm text-gray-500">Quyền hạn tổng thể trên toàn hệ thống</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200
                      ${form.role === r.value 
                        ? "border-purple-500 bg-purple-50/60 shadow-sm" 
                        : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/30"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={() => handleRoleChange(r.value)}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{r.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.label}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2. Phân quyền kho */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Warehouse className="h-5 w-5 text-purple-600" />
                2. Kho phụ trách & quyền chi tiết
              </CardTitle>
              <p className="text-sm text-gray-500">
                Người dùng sẽ có quyền truy cập và thực hiện chức năng tại các kho được phân
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Thêm kho mới và thiết lập quyền chức năng cụ thể
                </p>
                <Button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  + Thêm kho & phân quyền
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
              ) : userWarehouses.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                  <AlertCircle className="mx-auto h-10 w-10 text-slate-400" />
                  <h3 className="mt-4 text-lg font-medium text-slate-900">Chưa có kho phụ trách</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Nhấn nút "Thêm kho & phân quyền" để bắt đầu gán kho cho người dùng này.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userWarehouses.map((item) => {
                    const kho = item.kho || {};
                    const isManager = Number(item.laQuanLyKho) === 1;
                    const active = Number(kho.trangThai) === 1;
                    const permissions = item.chiTietQuyenKhos || [];

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-xl border bg-white shadow-sm hover:shadow transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{kho.tenKho}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono text-slate-500">{kho.maKho}</span>
                              <span className="text-xs text-slate-400">• ID: {kho.id}</span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{kho.diaChi}</p>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={active ? "default" : "secondary"}
                              className={active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                              {active ? "Hoạt động" : "Tạm khóa"}
                            </Badge>
                            {isManager && (
                              <Badge className="bg-purple-600 hover:bg-purple-700">
                                Quản lý chính
                              </Badge>
                            )}
                          </div>
                        </div>

                        {permissions.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4 text-purple-600" />
                              Quyền tại kho này
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {permissions.map((p) => (
                                <Badge
                                  key={p.id}
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                                >
                                  {p.quyenHan?.tenQuyen || p.maQuyenHan}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Trạng thái tài khoản */}
          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Lock className="h-5 w-5 text-amber-600" />
                3. Trạng thái tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between bg-amber-50/60 p-5 rounded-xl border border-amber-200">
                <div>
                  <p className="font-medium text-amber-900">Trạng thái hoạt động</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Khóa tài khoản nếu phát hiện vi phạm hoặc không còn sử dụng
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Label htmlFor="status" className="text-sm font-medium">
                    {form.status === 1 ? (
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <Unlock className="h-4 w-4" /> Hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-700">
                        <Lock className="h-4 w-4" /> Tạm khóa
                      </span>
                    )}
                  </Label>

                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: Number(e.target.value) }))}
                    className="h-10 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value={1}>Hoạt động (Active)</option>
                    <option value={0}>Tạm khóa (Banned)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/users")}
              className="border-slate-300 hover:bg-slate-100"
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {loading ? (
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>

        <p className="text-xs text-center text-slate-500 italic pt-4">
          Dữ liệu được lưu vào bảng: nguoi_dung, phan_quyen_nguoi_dung_kho
        </p>

        <AssignWarehousePermissionModal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          userId={id}
          onAssigned={reloadUserWarehouses}
        />
      </div>
    </div>
  );
}