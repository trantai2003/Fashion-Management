import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROLES } from "@/constants/backend/role";
import { nguoiDungService } from "@/services/nguoiDungService";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import AssignWarehousePermissionModal from "@/components/admin/AssignWarehousePermissionModal";

export default function UserPermissionEditByAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingUserWarehouses, setLoadingUserWarehouses] = useState(true);
  const [userWarehouses, setUserWarehouses] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [form, setForm] = useState({
    role: "quan_ly_kho",
    status: 1,
  });

  const reloadUserWarehouses = async () => {
    if (!id) return;
    try {
      setLoadingUserWarehouses(true);
      const res = await nguoiDungService.getById(id);
      const dto = res?.data;
      if (!dto) return;

      setForm((prev) => ({
        ...prev,
        role: dto.vaiTro || prev.role,
        status: dto.trangThai ?? prev.status,
      }));
      setUserWarehouses(dto.khoPhuTrach || []);
    } catch (e) {
      console.error("Lỗi load thông tin người dùng & kho phụ trách", e);
    } finally {
      setLoadingUserWarehouses(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      userId: Number(id),
      role: form.role,
      status: form.status,
    };
    console.log("Payload gửi BE:", payload);
  };

  useEffect(() => {
    reloadUserWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="flex-1 p-6 flex flex-col items-center min-h-screen bg-gray-50">
      <div className="max-w-2xl w-full bg-white border rounded-xl shadow-lg overflow-hidden">

        {/* ===== HEADER CARD ===== */}
        <div className="p-6 border-b bg-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Thiết lập vai trò & Kho
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cập nhật quyền hạn cho người dùng dựa trên chức vụ
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            ID: {id}
          </span>
        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          {/* ===== ROLE ===== */}
          <section>
            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider italic">
              1. Vai trò hệ thống (Cột: vai_tro)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className="relative flex items-center p-3 border rounded-lg cursor-pointer
                             hover:bg-gray-50 transition-all
                             has-checked:border-purple-600
                             has-checked:bg-purple-50"
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={form.role === r.value}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        role: r.value,
                        permissions: {}, // reset quyền
                      }))
                    }
                    className="h-4 w-4 text-purple-600"
                  />

                  <div className="ml-3">
                    <p className="text-sm font-semibold">{r.value}</p>
                    <p className="text-[10px] text-gray-500">
                      {r.label}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* ===== PERMISSION ===== */}
          <section>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider italic">
                2. Phân quyền chức năng theo vai trò
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Chọn kho phụ trách trước, sau đó phân quyền chức năng trong cửa sổ bật lên.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-500">
                Bấm nút bên phải để thêm mới phân quyền kho cho người dùng.
              </p>
              <Button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="text-xs font-semibold bg-linear-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
              >
                + Thêm mới phân quyền kho
              </Button>
            </div>
          </section>

          {/* ===== WAREHOUSE ===== */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider italic">
                3. Kho phụ trách hiện tại
              </label>
              <span className="text-[10px] text-gray-400">
                * Tự động cập nhật sau khi thêm mới phân quyền kho
              </span>
            </div>

            {loadingUserWarehouses ? (
              <p className="text-xs text-gray-500">Đang tải danh sách kho phụ trách...</p>
            ) : userWarehouses.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                Chưa có kho phụ trách. Bấm &quot;Thêm mới phân quyền kho&quot; để bắt đầu.
              </p>
            ) : (
              <div className="space-y-3">
                {userWarehouses.map((item) => {
                  const kho = item.kho || {};
                  const isManager = Number(item.laQuanLyKho) === 1;
                  const active = Number(kho.trangThai) === 1;
                  const permissions = item.chiTietQuyenKhos || [];

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg border bg-white shadow-sm flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {kho.tenKho}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono uppercase">
                            {kho.maKho} • ID: {kho.id}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {kho.diaChi}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border ${active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-500 border-gray-200"
                              }`}
                          >
                            {active ? "KHO HOẠT ĐỘNG" : "KHO TẠM KHÓA"}
                          </span>
                          {isManager && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-purple-600 text-white font-bold">
                              QUẢN LÝ CHÍNH
                            </span>
                          )}
                        </div>
                      </div>

                      {permissions.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-[11px] font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-purple-500" />
                            Quyền tại kho này
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {permissions.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100"
                              >
                                {p.quyenHan?.tenQuyen || p.maQuyenHan}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ===== STATUS ===== */}
          <section className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-900">
                  Trạng thái hoạt động
                </p>
                <p className="text-xs text-amber-700">
                  Khóa tài khoản nếu phát hiện vi phạm
                </p>
              </div>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: Number(e.target.value),
                  }))
                }
                className="text-sm border-amber-300 rounded-md bg-white px-3 py-1.5 font-semibold
                           text-amber-900 focus:ring-2 focus:ring-amber-500"
              >
                <option value={1}>Hoạt động (Active)</option>
                <option value={0}>Tạm khóa (Banned)</option>
              </select>
            </div>
          </section>

          {/* ===== ACTION ===== */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600
               hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy Thay Đổi
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold text-white bg-purple-600
                         hover:bg-purple-700 rounded-lg shadow-md active:scale-95"
            >
              Lưu Thiết Lập
            </button>
          </div>
        </form>
      </div>

      <p className="mt-6 text-xs text-gray-400 italic">
        Dữ liệu được lưu vào các bảng: nguoi_dung, phan_quyen_nguoi_dung_kho
      </p>

      <AssignWarehousePermissionModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        userId={id}
        onAssigned={reloadUserWarehouses}
      />
    </main>
  );
}
