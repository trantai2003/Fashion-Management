import { useEffect, useState } from "react";
import { donBanHangService } from "@/services/donBanHangService";
import { Link, useNavigate } from "react-router-dom";
import { 
  Loader2, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter, 
  RefreshCcw, 
  Search, 
  Check, 
  Calendar, 
  Eye, 
  Trash2, 
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_MAP = {
  0: { label: "Nháp", className: "bg-amber-50 text-amber-700 border border-amber-200" },
  1: { label: "Chờ xuất kho", className: "bg-blue-50 text-blue-700 border border-blue-200" },
  2: { label: "Đã xuất kho", className: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  3: { label: "Hoàn thành", className: "bg-green-50 text-green-700 border border-green-200" },
  4: { label: "Đã hủy", className: "bg-red-50 text-red-700 border border-red-200" },
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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters((p) => ({ ...p, page: newPage }));
    }
  };

  const handlePageSizeChange = (newSize) => {
    setFilters((p) => ({ ...p, size: newSize, page: 0 }));
  };

  // Stats derived from data
  const stats = {
    total: total,
    choXuatKho: data.filter((d) => d.trangThai === 1).length,
    hoanThanh: data.filter((d) => d.trangThai === 3).length,
    daHuy: data.filter((d) => d.trangThai === 4).length,
  };

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="space-y-6 w-full">
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng đơn bán</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ xuất kho</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.choXuatKho}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.hoanThanh}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.daHuy}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FILTER SECTION */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Filter className="h-5 w-5 text-purple-600" />
              Bộ lọc tìm kiếm
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Tìm kiếm */}
              <div className="space-y-2 md:col-span-1">
                <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nhập số đơn hàng..."
                    className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-10"
                    value={filters.keyword}
                    onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value, page: 0 }))}
                  />
                </div>
              </div>

              {/* Trạng thái */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Trạng thái</Label>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal h-10">
                      <span className="truncate">
                        {filters.trangThai === "" && "Tất cả trạng thái"}
                        {filters.trangThai === "0" && "Nháp"}
                        {filters.trangThai === "1" && "Chờ xuất kho"}
                        {filters.trangThai === "2" && "Đã xuất kho"}
                        {filters.trangThai === "3" && "Hoàn thành"}
                        {filters.trangThai === "4" && "Đã hủy"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                    <DropdownMenuItem onClick={() => setFilters((p) => ({ ...p, trangThai: "", page: 0 }))} className="flex items-center justify-between cursor-pointer hover:bg-purple-50">
                      Tất cả trạng thái {filters.trangThai === "" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    {Object.entries(STATUS_MAP).map(([key, value]) => (
                      <DropdownMenuItem key={key} onClick={() => setFilters((p) => ({ ...p, trangThai: key, page: 0 }))} className="flex items-center justify-between cursor-pointer hover:bg-purple-50">
                        {value.label} {filters.trangThai === key && <Check className="h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Ngày đặt */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Ngày đặt</Label>
                <div className="relative">
                  <Input
                    type="date"
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 h-10"
                    value={filters.ngayDatHang}
                    onChange={(e) => setFilters((p) => ({ ...p, ngayDatHang: e.target.value, page: 0 }))}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50 h-10 px-4 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 w-full justify-center"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Đặt lại
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CREATE BUTTON */}
        <div className="flex justify-end">
          <Link to="/sales-orders/create">
            <Button className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm gap-2 transition-all duration-200">
              <Plus className="h-4 w-4" />
              Tạo đơn bán
            </Button>
          </Link>
        </div>

        {/* TABLE SECTION */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="flex items-center justify-center">
                <RefreshCcw className="h-6 w-6 animate-spin text-purple-600 mr-2" />
                Đang tải dữ liệu...
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <ShoppingCart className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy đơn bán hàng nào</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Hãy tạo một đơn bán mới hoặc điều chỉnh bộ lọc tìm kiếm.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Số đơn</th>
                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Khách hàng</th>
                    <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Kho xuất</th>
                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Ngày đặt</th>
                    <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase">Tổng tiền</th>
                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Trạng thái</th>
                    <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors duration-150 hover:bg-purple-50/50 cursor-pointer"
                      onClick={() => navigate(`/sales-orders/${item.id}`)}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-bold text-purple-600 tracking-wide uppercase">{item.soDonHang}</span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-semibold text-slate-900">{item.khachHang?.tenKhachHang || "Khách lẻ"}</div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-slate-600 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          {item.khoXuat?.tenKho}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-center">
                        <div className="text-slate-600 text-xs">
                          {new Date(item.ngayDatHang).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right">
                        <span className="font-bold text-slate-900">
                          {item.tongCong?.toLocaleString("vi-VN")} đ
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_MAP[item.trangThai]?.className}`}>
                          {STATUS_MAP[item.trangThai]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sales-orders/${item.id}`);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-all duration-150 hover:scale-110 active:scale-95 text-purple-600 hover:bg-purple-50 hover:border-purple-200"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION SECTION */}
        <Card className="border-0 shadow-md bg-white">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[120px] justify-between font-normal bg-white border-gray-200"
                    >
                      {filters.size} dòng
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                    {[10, 20, 30, 50].map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => handlePageSizeChange(s)}
                        className="cursor-pointer"
                      >
                        {s} dòng
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {filters.page * filters.size + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min((filters.page + 1) * filters.size, total)}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-purple-600">{total}</span> kết quả
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 0}
                  className="gap-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>

                <div className="hidden sm:flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx;
                    } else if (filters.page < 3) {
                      pageNum = idx;
                    } else if (filters.page > totalPages - 4) {
                      pageNum = totalPages - 5 + idx;
                    } else {
                      pageNum = filters.page - 2 + idx;
                    }

                    return (
                      <Button
                        key={idx}
                        variant={filters.page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          filters.page === pageNum
                            ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm"
                            : "border-gray-200"
                        }
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages - 1}
                  className="gap-1 disabled:opacity-50"
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}