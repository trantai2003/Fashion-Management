// src/pages/stock-take/StockTakeList.jsx
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Eye, ClipboardList, Loader2, ChevronDown, ChevronLeft,
  ChevronRight, Check, Filter, RefreshCcw, Search, Play,
  Package, CheckCircle2, Clock, Warehouse,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getStockTakes } from "@/services/stockTakeService";

// ── Trạng thái ────────────────────────────────────────────────────────────
const TRANG_THAI = {
  0: {
    label: "Đang kiểm kê",
    badge: "inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700",
    dot:   "h-1.5 w-1.5 rounded-full bg-yellow-500",
  },
  1: {
    label: "Hoàn thành",
    badge: "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
    dot:   "h-1.5 w-1.5 rounded-full bg-emerald-500",
  },
};

const FILTER_OPTIONS = [
  { value: "all",     label: "Tất cả trạng thái" },
  { value: "ongoing", label: "Đang kiểm kê" },
  { value: "done",    label: "Hoàn thành" },
];

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <ClipboardList className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Chưa có đợt kiểm kê nào</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Hãy tạo đợt kiểm kê đầu tiên để bắt đầu theo dõi tồn kho thực tế.
      </p>
      <Button
        onClick={onAdd}
        className="mt-6 bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        Tạo đợt đầu tiên
      </Button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function StockTakeList() {
  const navigate = useNavigate();

  const [stockTakes,   setStockTakes]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pageNumber,   setPageNumber]   = useState(0);
  const [pageSize,     setPageSize]     = useState(10);

  useEffect(() => { fetchData(); }, []);

  // Reset về trang 0 khi filter/search thay đổi
  useEffect(() => { setPageNumber(0); }, [searchTerm, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getStockTakes();
      setStockTakes(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách kiểm kê");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  // ── Client-side filter ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return stockTakes.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.maDotKiemKe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tenDotKiemKe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kho?.tenKho?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "ongoing" && item.trangThai === 0) ||
        (filterStatus === "done"    && item.trangThai === 1);

      return matchSearch && matchStatus;
    });
  }, [stockTakes, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const ongoing = filtered.filter((i) => i.trangThai === 0).length;
    const done = filtered.filter((i) => i.trangThai === 1).length;
    const warehouses = new Set(
      filtered
        .map((i) => i.kho?.id ?? i.kho?.tenKho)
        .filter(Boolean)
    ).size;
    return { total, ongoing, done, warehouses };
  }, [filtered]);

  // ── Pagination ────────────────────────────────────────────────────────
  const totalElements = filtered.length;
  const totalPages    = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage      = Math.min(pageNumber, totalPages - 1);
  const pageItems     = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handlePageChange = (p) => {
    if (p >= 0 && p < totalPages) setPageNumber(p);
  };

  const currentFilterLabel = FILTER_OPTIONS.find(o => o.value === filterStatus)?.label ?? "Tất cả trạng thái";

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight"></h2>
            <p className="text-sm text-gray-600 mt-1"></p>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đợt kiểm kê</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang kiểm kê</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.ongoing}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.done}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-purple-50 to-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kho tham gia</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.warehouses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Warehouse className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter bar ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-slate-700">Bộ lọc tìm kiếm</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-gray-700 font-medium text-xs">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo mã đợt, tên đợt, kho..."
                  className="pl-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-medium text-xs">Trạng thái</Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal"
                  >
                    <span className="truncate text-sm">{currentFilterLabel}</span>
                    <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                  {FILTER_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setFilterStatus(opt.value)}
                      className="flex items-center justify-between cursor-pointer hover:bg-violet-50"
                    >
                      {opt.label}
                      {filterStatus === opt.value && <Check className="h-4 w-4 text-violet-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reset */}
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
        </div>
        
        <div className="flex justify-end">
          <Button
            onClick={() => navigate("/stock-take/new")}
            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đợt kiểm kê
          </Button>
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState onAdd={() => navigate("/stock-take/new")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Mã đợt", "Tên đợt", "Kho", "Người chủ trì", "Ngày bắt đầu", "Trạng thái", "Thao tác"].map((h) => (
                      <th
                        key={h}
                        className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((item) => {
                    const tt        = TRANG_THAI[item.trangThai] ?? TRANG_THAI[0];
                    const isOngoing = item.trangThai === 0;
                    return (
                      <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">

                        {/* Mã đợt */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-bold text-violet-600 tracking-wide font-mono">
                            {item.maDotKiemKe}
                          </span>
                        </td>

                        {/* Tên đợt */}
                        <td className="px-4 py-3.5 align-middle max-w-[200px]">
                          <span className="font-semibold text-slate-900 leading-snug">
                            {item.tenDotKiemKe || "—"}
                          </span>
                        </td>

                        {/* Kho */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-medium text-slate-700">
                            {item.kho?.tenKho || "—"}
                          </span>
                        </td>

                        {/* Người chủ trì */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-medium text-slate-700">
                            {item.nguoiChuTri?.hoTen || "—"}
                          </span>
                        </td>

                        {/* Ngày bắt đầu */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="text-sm text-slate-600">
                            {item.ngayBatDau
                              ? new Date(item.ngayBatDau).toLocaleDateString("vi-VN")
                              : "—"}
                          </span>
                        </td>

                        {/* Trạng thái */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className={tt.badge}>
                            <span className={tt.dot} />
                            {tt.label}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-3.5 align-middle">
                          <button
                            type="button"
                            title={isOngoing ? "Tiếp tục" : "Xem chi tiết"}
                            onClick={() => navigate(`/stock-take/${item.id}`)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95 ${
                              isOngoing
                                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                                : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                            }`}
                          >
                            {isOngoing ? (
                              <Play className="h-3.5 w-3.5 fill-current" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalElements > 0 && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

              {/* Page size */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                      {pageSize} dòng
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                    {[5, 10, 20, 50].map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => { setPageSize(size); setPageNumber(0); }}
                        className="cursor-pointer"
                      >
                        {size} dòng
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Page info */}
              <div className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">{safePage * pageSize + 1}</span>
                {" "}-{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min((safePage + 1) * pageSize, totalElements)}
                </span>
                {" "}trong tổng số{" "}
                <span className="font-semibold text-violet-600">{totalElements}</span> kết quả
              </div>

              {/* Nav */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 0}
                  className="gap-1 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Trước
                </Button>

                <div className="hidden sm:flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5)               pageNum = idx;
                    else if (safePage < 3)             pageNum = idx;
                    else if (safePage > totalPages - 4) pageNum = totalPages - 5 + idx;
                    else                               pageNum = safePage - 2 + idx;

                    return (
                      <Button
                        key={idx}
                        variant={safePage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={
                          safePage === pageNum
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
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage >= totalPages - 1}
                  className="gap-1 disabled:opacity-50"
                >
                  Sau <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}