import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ROLES } from "@/constants/backend/role";
import { nguoiDungService } from "@/services/nguoiDungService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowLeft, Warehouse } from "lucide-react";
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

      console.error(e);

    } finally {

      setLoadingUserWarehouses(false);

    }
  };


  useEffect(() => {
    reloadUserWarehouses();
  }, [id]);


  const handleSubmit = (e) => {

    e.preventDefault();

    const payload = {
      userId: Number(id),
      role: form.role,
      status: form.status,
    };

    console.log(payload);

  };


  return (

    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <Link
          to="/users"
          className="flex items-center gap-2 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
          ID: {id}
        </span>

      </div>


      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">


        {/* ROLE */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6 space-y-4">

            <div>
              <h3 className="font-semibold text-gray-900">
                Vai trò hệ thống
              </h3>

              <p className="text-xs text-gray-500">
                Chọn vai trò chính của người dùng trong hệ thống
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">

              {ROLES.map((r) => (

                <label
                  key={r.value}
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
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
                      }))
                    }
                    className="mt-1"
                  />

                  <div>

                    <p className="text-sm font-semibold">
                      {r.label}
                    </p>

                    <p className="text-xs text-gray-500">
                      {r.value}
                    </p>

                  </div>

                </label>

              ))}

            </div>

          </CardContent>
        </Card>



        {/* PERMISSION */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6 flex items-center justify-between">

            <div>

              <h3 className="font-semibold text-gray-900">
                Phân quyền kho
              </h3>

              <p className="text-xs text-gray-500">
                Thêm kho và quyền thao tác cho người dùng
              </p>

            </div>

            <Button
              type="button"
              onClick={() => setShowAssignModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              + Thêm quyền kho
            </Button>

          </CardContent>
        </Card>



        {/* WAREHOUSE LIST */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-6 space-y-4">

            <div className="flex items-center gap-2 font-semibold">
              <Warehouse className="h-4 w-4 text-purple-600" />
              Kho phụ trách
            </div>


            {loadingUserWarehouses ? (

              <p className="text-sm text-gray-500">
                Đang tải danh sách kho...
              </p>

            ) : userWarehouses.length === 0 ? (

              <p className="text-sm text-gray-500 italic">
                Người dùng chưa được phân quyền kho
              </p>

            ) : (

              <div className="space-y-3">

                {userWarehouses.map((item) => {

                  const kho = item.kho || {};
                  const permissions = item.chiTietQuyenKhos || [];

                  return (

                    <div
                      key={item.id}
                      className="p-4 rounded-lg border bg-white shadow-sm"
                    >

                      <div className="flex justify-between">

                        <div>

                          <p className="font-semibold text-violet-600">
                            {kho.maKho}
                          </p>

                          <p className="text-sm font-medium">
                            {kho.tenKho}
                          </p>

                        </div>

                        {Number(item.laQuanLyKho) === 1 && (
                          <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full">
                            Quản lý
                          </span>
                        )}

                      </div>


                      {permissions.length > 0 && (

                        <div className="mt-3 flex flex-wrap gap-2">

                          {permissions.map((p) => (

                            <span
                              key={p.id}
                              className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700"
                            >
                              {p.quyenHan?.tenQuyen || p.maQuyenHan}
                            </span>

                          ))}

                        </div>

                      )}

                    </div>

                  );
                })}

              </div>

            )}

          </CardContent>
        </Card>
        {/* ACTION */}
        <div className="flex justify-end gap-3">

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/users")}
          >
            Hủy
          </Button>

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Lưu thiết lập
          </Button>

        </div>

      </form>



      <AssignWarehousePermissionModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        userId={id}
        onAssigned={reloadUserWarehouses}
      />

    </div>

  );
}