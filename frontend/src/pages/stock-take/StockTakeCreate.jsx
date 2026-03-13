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
import { ArrowLeft, Loader2, PackageSearch, CheckCircle2, Warehouse } from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhoList } from "@/services/khoService";
import {
  createStockTake,
  getStockTake,
  getStockTakeDetails,
  completeStockTake,
} from "@/services/stockTakeService";

// ── Schema validation ─────────────────────────────────────────────────────
const formSchema = z.object({
  khoId: z.number({ invalid_type_error: "Vui lòng chọn kho" }).min(1, "Vui lòng chọn kho"),
  ghiChu: z.string().optional(),
});

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = [
    { label: "Chọn kho", icon: Warehouse },
    { label: "Nhập số lượng", icon: CheckCircle2 },
  ];
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, idx) => {
        const active = idx + 1 === step;
        const done = idx + 1 < step;
        return (
          <div key={idx} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              done ? "bg-emerald-500 text-white" :
              active ? "bg-violet-600 text-white shadow-md shadow-violet-200" :
              "bg-slate-100 text-slate-400"
            }`}>
              {done ? "✓" : idx + 1}
            </div>
            <span className={`text-sm font-medium ${active ? "text-violet-700" : done ? "text-emerald-600" : "text-slate-400"}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`mx-1 h-px w-12 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function StockTakeCreate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [khos, setKhos] = useState([]);
  const [dotKiemKeId, setDotKiemKeId]     = useState(id ? parseInt(id) : null);
  const [selectedKhoId, setSelectedKhoId] = useState(null);
  const [chiTiets, setChiTiets]           = useState([]);
  const [updates, setUpdates]             = useState({});
  const [isCompleted, setIsCompleted]     = useState(false);

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

        if (dotKiemKeId) {
          const [dot, details] = await Promise.all([
            getStockTake(dotKiemKeId),
            getStockTakeDetails(dotKiemKeId),
          ]);
          setSelectedKhoId(dot.kho?.id);
          setIsCompleted(dot.trangThai === 1);
          setChiTiets(details);

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

  // ── Cập nhật số lượng ──
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

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/stock-take")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>

        {/* Page title */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {!dotKiemKeId ? "Tạo đợt kiểm kê" : isCompleted ? "Chi tiết đợt kiểm kê" : "Nhập số lượng thực tế"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {!dotKiemKeId
              ? "Chọn kho và điền thông tin để bắt đầu kiểm kê"
              : isCompleted
              ? "Thông tin chi tiết đợt kiểm kê đã hoàn thành"
              : "Đối chiếu và nhập số lượng đếm được cho từng lô hàng"
            }
          </p>
        </div>

        <StepIndicator step={dotKiemKeId ? 2 : 1} />

        {/* ── BƯỚC 1: Form tạo đợt ── */}
        {!dotKiemKeId && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                <PackageSearch className="h-4.5 w-4.5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-snug">Thông tin đợt kiểm kê</p>
                <p className="text-xs text-slate-500 mt-0.5">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreate)}>
                <div className="p-8 space-y-6">
                  {/* Chọn kho */}
                  <FormField
                    control={form.control}
                    name="khoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">
                          Kho kiểm kê <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-violet-500 focus:ring-violet-500">
                              <SelectValue placeholder="Chọn kho..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {khos.map((kho) => (
                              <SelectItem key={kho.id} value={kho.id.toString()}>
                                {kho.tenKho}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Ghi chú */}
                  <FormField
                    control={form.control}
                    name="ghiChu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Ghi chú</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ghi chú thêm (nếu có)..."
                            className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-8 py-5 bg-slate-50 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-300 text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                    onClick={() => navigate("/stock-take")}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-700 text-white min-w-[160px] shadow-sm transition-all duration-200"
                  >
                    {loading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo...</>
                      : <><PackageSearch className="mr-2 h-4 w-4" />Tạo đợt kiểm kê</>
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* ── BƯỚC 2: Nhập số lượng thực tế ── */}
        {dotKiemKeId && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
            {/* Card header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-snug">Danh sách lô hàng</p>
                <p className="text-xs text-slate-500 mt-0.5">Nhập số lượng thực tế đếm được cho từng lô</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                <span className="text-sm text-gray-600">Đang tải danh sách lô hàng...</span>
              </div>
            ) : chiTiets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <PackageSearch className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-700">Kho không có hàng tồn kho</h3>
                <p className="mt-1 text-sm text-slate-500">Kho này hiện không có lô hàng nào để kiểm kê.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {["Sản phẩm / Biến thể", "Mã SKU", "Mã lô", "Tồn hệ thống", "Số lượng thực tế", "Chênh lệch"].map((h, i) => (
                        <th
                          key={h}
                          className={`h-12 px-4 font-semibold text-slate-600 tracking-wide text-xs uppercase ${i >= 3 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chiTiets.map((ct) => {
                      const tonHeThong = parseFloat(ct.soLuongHeThong ?? 0);
                      const thucTe = updates[ct.id] !== undefined
                        ? updates[ct.id]
                        : parseFloat(ct.soLuongThucTe ?? 0);
                      const chenhLech = thucTe - tonHeThong;
                      const hasInput = updates[ct.id] !== undefined;

                      return (
                        <tr key={ct.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                          {/* Sản phẩm */}
                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-semibold text-slate-900">
                              {ct.bienTheSanPham?.tenBienThe || "—"}
                            </span>
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-mono text-xs text-slate-500">
                              {ct.bienTheSanPham?.maSku || "—"}
                            </span>
                          </td>

                          {/* Mã lô */}
                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-mono text-xs text-slate-500">
                              {ct.loHang?.maLo || "—"}
                            </span>
                          </td>

                          {/* Tồn hệ thống */}
                          <td className="px-4 py-3.5 align-middle text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                              <span className="font-semibold text-slate-800 text-xs">
                                {tonHeThong.toLocaleString("vi-VN")}
                              </span>
                            </span>
                          </td>

                          {/* Nhập thực tế */}
                          <td className="px-4 py-3.5 align-middle text-right">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1">
                                <span className="font-semibold text-slate-800 text-xs">
                                  {thucTe.toLocaleString("vi-VN")}
                                </span>
                              </span>
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                defaultValue={
                                  updates[ct.id] !== undefined
                                    ? updates[ct.id]
                                    : Math.round(parseFloat(ct.soLuongThucTe ?? tonHeThong))
                                }
                                onChange={(e) => handleSoLuongChange(ct.id, e.target.value)}
                                className="w-28 text-right border-gray-200 focus:border-violet-500 focus:ring-violet-500 ml-auto"
                              />
                            )}
                          </td>

                          {/* Chênh lệch */}
                          <td className="px-4 py-3.5 align-middle text-right">
                            {(isCompleted || hasInput) ? (
                              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                chenhLech > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : chenhLech < 0
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {chenhLech > 0 ? "+" : ""}{chenhLech.toLocaleString("vi-VN")}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            {chiTiets.length > 0 && (
              <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Tổng{" "}
                  <span className="font-semibold text-violet-700">{chiTiets.length}</span>{" "}
                  lô hàng
                </p>
                <div className="flex gap-3">
                  {isCompleted ? (
                    <Button
                      onClick={() => navigate("/stock-take")}
                      className="bg-violet-600 hover:bg-violet-700 text-white min-w-[180px] shadow-sm transition-all duration-200"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại danh sách
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-slate-600 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                        onClick={() => navigate("/stock-take")}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={onComplete}
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-700 text-white min-w-[180px] shadow-sm transition-all duration-200"
                      >
                        {loading
                          ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                          : <><CheckCircle2 className="mr-2 h-4 w-4" />Hoàn thành kiểm kê</>
                        }
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}