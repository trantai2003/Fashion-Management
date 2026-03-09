// src/pages/stock-take/StockTakeCreate.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, PackageSearch, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhoList } from "@/services/khoService";
import {
  createStockTake,
  getStockTake,
  getStockTakeDetails,
  completeStockTake,
} from "@/services/stockTakeService";

// ──────────────────────────────────────────────
// Schema validation
// ──────────────────────────────────────────────
const formSchema = z.object({
  khoId: z.number({ invalid_type_error: "Vui lòng chọn kho" }).min(1, "Vui lòng chọn kho"),
  ghiChu: z.string().optional(),
});

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function StockTakeCreate() {
  const { id } = useParams();                                   // có id = đang xem đợt đã tạo
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [khos, setKhos] = useState([]);

  // Sau khi tạo xong, lưu dotKiemKeId và khoId để dùng khi complete
  const [dotKiemKeId, setDotKiemKeId]   = useState(id ? parseInt(id) : null);
  const [selectedKhoId, setSelectedKhoId] = useState(null);

  // Danh sách chi tiết lô hàng
  const [chiTiets, setChiTiets] = useState([]);

  // Map chiTietId → soLuongThucTe người dùng nhập
  const [updates, setUpdates] = useState({});

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { khoId: 0, ghiChu: "" },
  });

  // ── Load dữ liệu ban đầu ──
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const khoData = await getKhoList();
        setKhos(khoData);

        // Nếu có id trên URL (vào từ nút "Tiếp tục") → fetch đợt để lấy khoId, rồi load chi tiết
        if (dotKiemKeId) {
          const [dot, details] = await Promise.all([
            getStockTake(dotKiemKeId),
            getStockTakeDetails(dotKiemKeId),
          ]);
          setSelectedKhoId(dot.kho?.id);
          setChiTiets(details);

          // FIX: Khởi tạo updates từ soLuongThucTe đã lưu trong DB
          // Nếu không, submit sẽ fallback về soLuongHeThong → sai
          const initialUpdates = {};
          details.forEach((ct) => {
            initialUpdates[ct.id] = parseFloat(ct.soLuongThucTe ?? ct.soLuongHeThong ?? 0);
          });
          setUpdates(initialUpdates);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [dotKiemKeId]);

  // ── Tạo đợt kiểm kê ──
  const onCreate = async (values) => {
    setLoading(true);
    try {
      const newId = await createStockTake(values);
      setDotKiemKeId(newId);
      setSelectedKhoId(values.khoId);

      const details = await getStockTakeDetails(newId);
      setChiTiets(details);

      toast.success("Tạo đợt kiểm kê thành công! Hãy nhập số lượng thực tế.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Tạo đợt kiểm kê thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ── Cập nhật số lượng thực tế khi người dùng nhập ──
  const handleSoLuongChange = (chiTietId, value) => {
    setUpdates((prev) => ({
      ...prev,
      [chiTietId]: parseInt(value) >= 0 ? parseInt(value) : 0,
    }));
  };

  // ── Hoàn thành kiểm kê ──
  const onComplete = async () => {
    if (!dotKiemKeId || !selectedKhoId) {
      toast.error("Thiếu thông tin đợt kiểm kê");
      return;
    }

    setLoading(true);
    try {
      const updateList = chiTiets.map((ct) => ({
        chiTietId: ct.id,
        // Ưu tiên giá trị người dùng đã nhập (updates),
        // fallback về soLuongThucTe từ DB (đã khởi tạo vào updates khi load),
        // cuối cùng mới fallback về 0
        soLuongThucTe: updates[ct.id] !== undefined
          ? updates[ct.id]
          : parseFloat(ct.soLuongThucTe ?? 0),
      }));

      await completeStockTake(dotKiemKeId, selectedKhoId, updateList);
      toast.success("Hoàn thành kiểm kê thành công!");
      navigate("/stock-take");
    } catch (err) {
      toast.error(err.response?.data?.message || "Hoàn thành kiểm kê thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      {/* Nút quay lại */}
      <Button
        variant="ghost"
        className="mb-6 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
        onClick={() => navigate("/stock-take")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
      </Button>

      {/* ── BƯỚC 1: Form tạo đợt ── */}
      {!dotKiemKeId && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-400 p-6">
            <div className="flex items-center gap-3">
              <PackageSearch className="h-6 w-6 text-white" />
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  Tạo đợt kiểm kê kho hàng
                </CardTitle>
                <CardDescription className="text-purple-100 mt-1">
                  Chọn kho và điền thông tin để bắt đầu
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreate)}>
              <CardContent className="space-y-6 p-8">
                {/* Chọn kho */}
                <FormField
                  control={form.control}
                  name="khoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800 font-semibold">
                        Kho kiểm kê <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-purple-200 focus:border-purple-400">
                            <SelectValue placeholder="Chọn kho..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {khos.map((kho) => (
                            <SelectItem key={kho.id} value={kho.id.toString()}>
                              {kho.tenKho}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                {/* Ghi chú */}
                <FormField
                  control={form.control}
                  name="ghiChu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800 font-semibold">Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ghi chú thêm (nếu có)..."
                          className="border-purple-200 focus:border-purple-400 resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex justify-end gap-3 px-8 py-5 bg-purple-50 rounded-b-2xl">
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-300 text-purple-600"
                  onClick={() => navigate("/stock-take")}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[160px]"
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo...</>
                    : <><PackageSearch className="mr-2 h-4 w-4" />Tạo đợt kiểm kê</>
                  }
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}

      {/* ── BƯỚC 2: Nhập số lượng thực tế ── */}
      {dotKiemKeId && (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-400 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-white" />
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  Nhập số lượng thực tế
                </CardTitle>
                <CardDescription className="text-purple-100 mt-1">
                  Đối chiếu và nhập số lượng đếm được cho từng lô hàng
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-purple-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Đang tải danh sách lô hàng...</span>
              </div>
            ) : chiTiets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <PackageSearch className="h-10 w-10 text-purple-200" />
                <p>Kho này không có hàng tồn kho để kiểm kê</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-50 hover:bg-purple-50">
                    <TableHead className="font-semibold text-purple-700">Sản phẩm / Biến thể</TableHead>
                    <TableHead className="font-semibold text-purple-700">Mã SKU</TableHead>
                    <TableHead className="font-semibold text-purple-700">Mã lô</TableHead>
                    <TableHead className="font-semibold text-purple-700 text-right">Tồn hệ thống</TableHead>
                    <TableHead className="font-semibold text-purple-700 text-right">Số lượng thực tế</TableHead>
                    <TableHead className="font-semibold text-purple-700 text-right">Chênh lệch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chiTiets.map((ct) => {
                    // FIX: dùng đúng field name từ ChiTietKiemKeDto
                    const tonHeThong = parseFloat(ct.soLuongHeThong ?? 0);
                    const thucTe = updates[ct.id] !== undefined
                      ? updates[ct.id]
                      : parseFloat(ct.soLuongThucTe ?? 0);
                    const chenhLech = thucTe - tonHeThong;

                    return (
                      <TableRow key={ct.id} className="hover:bg-purple-50/40 transition-colors">
                        <TableCell className="font-medium">
                          {ct.bienTheSanPham?.tenBienThe || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {ct.bienTheSanPham?.maSku || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {ct.loHang?.maLo || "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {tonHeThong.toLocaleString("vi-VN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            defaultValue={updates[ct.id] !== undefined ? updates[ct.id] : Math.round(parseFloat(ct.soLuongThucTe ?? tonHeThong))}
                            onChange={(e) => handleSoLuongChange(ct.id, e.target.value)}
                            className="w-28 text-right border-purple-200 focus:border-purple-400 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {updates[ct.id] !== undefined ? (
                            <span className={
                              chenhLech > 0 ? "text-green-600" :
                              chenhLech < 0 ? "text-red-600" :
                              "text-muted-foreground"
                            }>
                              {chenhLech > 0 ? "+" : ""}{chenhLech.toLocaleString("vi-VN")}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {chiTiets.length > 0 && (
            <CardFooter className="flex justify-between items-center px-6 py-5 bg-purple-50 rounded-b-2xl">
              <p className="text-sm text-muted-foreground">
                Tổng <span className="font-semibold text-purple-700">{chiTiets.length}</span> lô hàng
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-600"
                  onClick={() => navigate("/stock-take")}
                >
                  Hủy
                </Button>
                <Button
                  onClick={onComplete}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[180px]"
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                    : <><CheckCircle2 className="mr-2 h-4 w-4" />Hoàn thành kiểm kê</>
                  }
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}