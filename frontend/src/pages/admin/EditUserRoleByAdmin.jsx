import { useState, useEffect } from "react";
import { ROLES } from "@/constants/backend/role";
import PermissionMatrix from "@/components/admin/PermissionMatrix";
import { useParams, useNavigate } from "react-router-dom";
import { khoService } from "@/services/khoService";

export default function UserPermissionEditByAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingKho, setLoadingKho] = useState(true);
  const [form, setForm] = useState({
    role: "quan_ly_kho",
    permissions: {},
    warehouses: [],
    status: 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      userId: Number(id),
      role: form.role,
      permissions: Object.keys(form.permissions).filter(
        (k) => form.permissions[k]
      ),
      khoList: form.warehouses
        .filter((w) => w.isAssigned)
        .map((w) => ({
          khoId: w.warehouseId,
          isManager: w.isManager,
        })),
      status: form.status,
    };

    console.log("Payload gửi BE:", payload);
  };




  useEffect(() => {
    const fetchKho = async () => {
      try {
        setLoadingKho(true);

        const res = await khoService.filter({
          page: 0,
          size: 100,
        });

        const khoDtos = res.data.data.content;

        setForm((prev) => ({
          ...prev,
          warehouses: khoDtos.map((k) => ({
            warehouseId: k.id,
            name: k.tenKho,
            isAssigned: false,
            isManager: false,
          })),
        }));
      } catch (e) {
        console.error("Lỗi load kho", e);
      } finally {
        setLoadingKho(false);
      }
    };

    fetchKho();
  }, []);


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
                             has-[:checked]:border-purple-600
                             has-[:checked]:bg-purple-50"
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
                Các quyền bên dưới sẽ được áp dụng dựa trên vai trò đã chọn
              </p>
            </div>

            <PermissionMatrix form={form} setForm={setForm} />
          </section>

          {/* ===== WAREHOUSE ===== */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider italic">
                3. Phân kho phụ trách
              </label>
              <span className="text-[10px] text-gray-400">
                * User chỉ thao tác trên các kho được chọn
              </span>
            </div>

            <div className="space-y-3">
              {form.warehouses.map((w) => (
                <div
                  key={w.warehouseId}
                  className={`flex items-center justify-between p-4 rounded-lg border
                    ${w.isAssigned ? "bg-gray-50 border-purple-100" : "bg-white border-gray-200"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={w.isAssigned}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          warehouses: prev.warehouses.map((x) =>
                            x.warehouseId === w.warehouseId
                              ? {
                                ...x,
                                isAssigned: !x.isAssigned,
                                isManager: x.isAssigned ? false : x.isManager,
                              }
                              : x
                          ),
                        }))
                      }
                      className="h-5 w-5 rounded text-purple-600"
                    />

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {w.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono uppercase">
                        Mã: {w.warehouseId}
                      </p>
                    </div>
                  </div>

                  {w.isAssigned && form.role === "quan_ly_kho" && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          warehouses: prev.warehouses.map((x) =>
                            x.warehouseId === w.warehouseId
                              ? { ...x, isManager: !x.isManager }
                              : x
                          ),
                        }))
                      }
                      className={`text-[10px] font-bold px-3 py-1.5 rounded border shadow-sm
                        ${w.isManager
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-400 border-gray-200"}`}
                    >
                      QUẢN LÝ CHÍNH
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              onClick={() => navigate("/admin/users")}
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
    </main>
  );
}
