// src/pages/stock-take/StockTakeList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getStockTakes } from "@/services/stockTakeService";

// ── Trạng thái đợt kiểm kê ────────────────────────────────────────────────
const TRANG_THAI = {
  0: {
    label: "Đang kiểm kê",
    badge: "inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700",
    dot: "h-1.5 w-1.5 rounded-full bg-yellow-500",
  },
  1: {
    label: "Hoàn thành",
    badge: "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
    dot: "h-1.5 w-1.5 rounded-full bg-emerald-500",
  },
};

// ── Loại kiểm kê ──────────────────────────────────────────────────────────
const LOAI_KIEM_KE = {
  toan_bo:       "Toàn bộ",
  theo_danh_muc: "Theo danh mục",
  theo_khu_vuc:  "Theo khu vực",
  dot_xuat:      "Đột xuất",
};

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
        className="mt-6 bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-all duration-200"
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
  const [stockTakes, setStockTakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Kiểm kê kho hàng
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Theo dõi và quản lý các đợt kiểm kê tồn kho
            </p>
          </div>
          <Button
            onClick={() => navigate("/stock-take/new")}
            className="bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo đợt kiểm kê
          </Button>
        </div>

        {/* ── Table card ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-violet-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm text-gray-600">Đang tải dữ liệu...</span>
            </div>
          ) : stockTakes.length === 0 ? (
            <EmptyState onAdd={() => navigate("/stock-take/new")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Mã đợt", "Tên đợt", "Kho", "Loại", "Người chủ trì", "Ngày bắt đầu", "Trạng thái", "Thao tác"].map((h) => (
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
                  {stockTakes.map((item) => {
                    const tt = TRANG_THAI[item.trangThai] ?? TRANG_THAI[0];
                    const isOngoing = item.trangThai === 0;
                    return (
                      <tr
                        key={item.id}
                        className="transition-colors duration-150 hover:bg-violet-50/50"
                      >
                        {/* Mã đợt */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-bold text-violet-600 tracking-wide font-mono">
                            {item.maDotKiemKe}
                          </span>
                        </td>

                        {/* Tên đợt */}
                        <td className="px-4 py-3.5 align-middle max-w-[180px]">
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

                        {/* Loại */}
                        <td className="px-4 py-3.5 align-middle">
                          <span className="text-xs text-slate-500">
                            {LOAI_KIEM_KE[item.loaiKiemKe] || item.loaiKiemKe || "—"}
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
                        <td className="px-4 py-3.5 align-middle text-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/stock-take/${item.id}`)}
                            className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all duration-150 hover:scale-105 active:scale-95 ${
                              isOngoing
                                ? "border-violet-200 text-violet-600 hover:bg-violet-50"
                                : "border-transparent text-slate-500 hover:bg-slate-50 hover:border-slate-200"
                            }`}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {isOngoing ? "Tiếp tục" : ""}
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
      </div>
    </div>
  );
}