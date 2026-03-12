import { useEffect, useState } from "react";
import { donBanHangService } from "@/services/donBanHangService";
import { Link, useNavigate } from "react-router-dom";

const STATUS_MAP = {
  0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
  1: { label: "Chờ xuất kho", className: "bg-blue-50 text-blue-700" },
  2: { label: "Đã xuất kho", className: "bg-indigo-50 text-indigo-700" },
  3: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
  4: { label: "Đã hủy", className: "bg-red-50 text-red-700" },
};

export default function DonBanHangList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    trangThai: "",
    ngayDatHang: "",
    page: 0,
    size: 10,
  });

  function buildFilterPayload() {
    const filterList = [];

    if (filters.keyword?.trim()) {
      filterList.push({
        fieldName: "soDonHang",
        operation: "LIKE",
        value: filters.keyword.trim(),
      });
    }

    if (filters.trangThai !== "") {
      filterList.push({
        fieldName: "trangThai",
        operation: "EQUALS",
        value: Number(filters.trangThai),
      });
    }

    return {
      page: filters.page,
      size: filters.size,
      filters: filterList,
      sorts: [{ fieldName: "id", direction: "DESC" }],
    };
  }

  async function fetchData() {
    setLoading(true);
    try {
      const payload = buildFilterPayload();
      const res = await donBanHangService.filter(payload);
      let list = res.content || [];

      if (filters.ngayDatHang) {
        list = list.filter((item) => {
          if (!item.ngayDatHang) return false;
          const date = new Date(item.ngayDatHang);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const localDate = `${year}-${month}-${day}`;
          return localDate === filters.ngayDatHang;
        });
      }

      setData(list);
      setTotal(res.totalElements || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [
    filters.keyword,
    filters.trangThai,
    filters.ngayDatHang,
    filters.page,
    filters.size,
  ]);

  const totalPages = Math.ceil(total / filters.size);

  const handleReset = () => {
    setFilters({
      keyword: "",
      trangThai: "",
      ngayDatHang: "",
      page: 0,
      size: 10,
    });
  };

  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* FILTER */}
        <section className="bg-white border rounded-xl p-4 shadow-sm">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Số đơn hàng</label>
              <input
                value={filters.keyword}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    keyword: e.target.value,
                    page: 0,
                  }))
                }
                placeholder="Nhập số đơn hàng"
                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600">Trạng thái</label>
              <select
                value={filters.trangThai}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    trangThai: e.target.value,
                    page: 0,
                  }))
                }
                className="mt-1 w-full h-11 px-3 rounded-md border bg-white outline-none"
              >
                <option value="">Tất cả</option>
                <option value="0">Nháp</option>
                <option value="1">Chờ xác nhận</option>
                <option value="2">Đã xác nhận</option>
                <option value="3">Hoàn thành</option>
                <option value="4">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600">Ngày đặt</label>
              <input
                type="date"
                value={filters.ngayDatHang}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    ngayDatHang: e.target.value,
                    page: 0,
                  }))
                }
                className="mt-1 w-full h-11 px-3 rounded-md border focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-black hover:text-white transition-all"
            >
              Reset Bộ Lọc
            </button>
          </div>
        </section>

        {/* TABLE */}
        <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b">
            <span className="text-sm font-semibold">
              Danh sách đơn bán hàng
            </span>
            <div className="flex gap-3 items-center">
              <span className="text-xs text-gray-500">Tổng: {total}</span>
              <Link
                to="/sales-orders/create"
                className="px-3 py-2 text-sm text-white rounded-md bg-slate-900 border border-slate-900 hover:bg-white hover:text-slate-900 hover:border-slate-900"
              >
                + Tạo Đơn Bán
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3">Số đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Kho xuất</th>
                  <th className="px-4 py-3">Ngày đặt</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      Không tìm thấy dữ liệu
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() =>
                        navigate(`/sales-orders/${item.id}`)
                      }
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 font-semibold text-purple-600">
                        {item.soDonHang}
                      </td>
                      <td className="px-4 py-4">
                        {item.khachHang?.tenKhachHang}
                      </td>
                      <td className="px-4 py-4">
                        {item.khoXuat?.tenKho}
                      </td>
                      <td className="px-4 py-4">
                        {new Date(item.ngayDatHang).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {item.tongCong?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${STATUS_MAP[item.trangThai]?.className
                            }`}
                        >
                          {STATUS_MAP[item.trangThai]?.label}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION SECTION */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Đang hiển thị {data.length} / {total}
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows:</span>
                  <select
                    value={filters.size}
                    onChange={(e) => setFilters((p) => ({ ...p, size: Number(e.target.value), page: 0 }))}
                    className="h-8 w-16 px-1 text-xs border rounded-md outline-none"
                  >
                    {[10, 20, 30, 40, 50].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={filters.page === 0}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Trước
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, idx) => {
                      if (totalPages > 5 && idx > 2 && idx < totalPages - 1 && Math.abs(idx - filters.page) > 1) {
                        if (idx === 3) return <span key={idx} className="px-1 text-gray-400">...</span>;
                        return null;
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => setFilters((p) => ({ ...p, page: idx }))}
                          className={`px-3 py-1 text-sm border rounded transition-colors ${filters.page === idx ? "bg-slate-900 text-white border-slate-900 hover:bg-white hover:text-slate-900" : "bg-white hover:bg-gray-50"
                            }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={filters.page + 1 >= totalPages}
                    onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                    className="px-3 py-1 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
