// src/pages/stock-take/StockTakeList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getStockTakes } from "@/services/stockTakeService";

// Trạng thái đợt kiểm kê
const TRANG_THAI = {
  0: { label: "Đang kiểm kê", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  1: { label: "Hoàn thành",   color: "bg-green-100 text-green-700 border-green-300"  },
};

// Loại kiểm kê
const LOAI_KIEM_KE = {
  toan_bo:       "Toàn bộ",
  theo_danh_muc: "Theo danh mục",
  theo_khu_vuc:  "Theo khu vực",
  dot_xuat:      "Đột xuất",
};

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
    <div className="container mx-auto py-10">
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-400 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-white" />
              <CardTitle className="text-2xl font-bold text-white">
                Danh sách kiểm kê kho
              </CardTitle>
            </div>
            <Button
              onClick={() => navigate("/stock-take/new")}
              className="bg-white text-purple-600 hover:bg-purple-50 font-semibold shadow"
            >
              <Plus className="mr-2 h-4 w-4" /> Tạo đợt kiểm kê
            </Button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-purple-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : stockTakes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <ClipboardList className="h-12 w-12 text-purple-200" />
              <p className="text-lg">Chưa có đợt kiểm kê nào</p>
              <Button
                variant="outline"
                onClick={() => navigate("/stock-take/new")}
                className="mt-2 border-purple-300 text-purple-600"
              >
                <Plus className="mr-2 h-4 w-4" /> Tạo đợt đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="font-semibold text-purple-700">Mã đợt</TableHead>
                  <TableHead className="font-semibold text-purple-700">Tên đợt</TableHead>
                  <TableHead className="font-semibold text-purple-700">Kho</TableHead>
                  <TableHead className="font-semibold text-purple-700">Loại</TableHead>
                  <TableHead className="font-semibold text-purple-700">Người chủ trì</TableHead>
                  <TableHead className="font-semibold text-purple-700">Ngày bắt đầu</TableHead>
                  <TableHead className="font-semibold text-purple-700">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-purple-700 text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockTakes.map((item) => {
                  const tt = TRANG_THAI[item.trangThai] ?? TRANG_THAI[0];
                  return (
                    <TableRow key={item.id} className="hover:bg-purple-50/50 transition-colors">
                      <TableCell className="font-mono text-sm text-purple-600">
                        {item.maDotKiemKe}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.tenDotKiemKe || "—"}
                      </TableCell>
                      <TableCell>{item.kho?.tenKho || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {LOAI_KIEM_KE[item.loaiKiemKe] || item.loaiKiemKe || "—"}
                      </TableCell>
                      <TableCell>{item.nguoiChuTri?.hoTen || "—"}</TableCell>
                      <TableCell className="text-sm">
                        {item.ngayBatDau
                          ? new Date(item.ngayBatDau).toLocaleDateString("vi-VN")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tt.color}`}>
                          {tt.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.trangThai === 0 ? (
                          // Đang kiểm kê → cho phép tiếp tục nhập
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/stock-take/${item.id}`)}
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> Tiếp tục
                          </Button>
                        ) : (
                          // Hoàn thành → chỉ xem
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/stock-take/${item.id}`)}
                            className="text-muted-foreground hover:text-purple-600"
                          >
                            <Eye className="mr-1 h-3.5 w-3.5" /> Xem
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}