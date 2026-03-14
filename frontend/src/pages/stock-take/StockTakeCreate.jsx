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
  ArrowLeft, Loader2, PackageSearch, CheckCircle2, Warehouse,
  Package, ClipboardList,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhoList } from "@/services/khoService";
import {
  createStockTake,
  getStockTake,
  getStockTakeDetails,
  completeStockTake,
} from "@/services/stockTakeService";

// ── Schema ────────────────────────────────────────────────────────────────
const formSchema = z.object({
  khoId: z.number({ invalid_type_error: "Vui lòng chọn kho" }).min(1, "Vui lòng chọn kho"),
  ghiChu: z.string().optional(),
});

// ── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = [
    { label: "Chọn kho" },
    { label: "Nhập số lượng" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, idx) => {
        const active = idx + 1 === step;
        const done   = idx + 1 <  step;
        return (
          <div key={idx} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              done   ? "bg-emerald-500 text-white" :
              active ? "bg-yellow-500 text-white shadow-md shadow-yellow-200" :
                       "bg-slate-100 text-slate-400"
            }`}>
              {done ? "✓" : idx + 1}
            </div>
            <span className={`text-sm font-medium ${
              active ? "text-yellow-700" : done ? "text-emerald-600" : "text-slate-400"
            }`}>
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

// ── Main ──────────────────────────────────────────────────────────────────
export default function StockTakeCreate() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [loading,       setLoading]       = useState(false);
  const [khos,          setKhos]          = useState([]);
  const [dotKiemKeId,   setDotKiemKeId]   = useState(id ? parseInt(id) : null);
  const [selectedKhoId, setSelectedKhoId] = useState(null);
  const [chiTiets,      setChiTiets]      = useState([]);
  const [updates,       setUpdates]       = useState({});
  const [isCompleted,   setIsCompleted]   = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { khoId: 0, ghiChu: "" },
  });

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
          const initMap = {};
          details.forEach((ct) => {
            initMap[ct.id] = parseFloat(ct.soLuongThucTe ?? ct.soLuongHeThong ?? 0);
          });
          setUpdates(initMap);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [dotKiemKeId]);

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

  const handleSoLuongChange = (chiTietId, value) => {
    setUpdates((prev) => ({
      ...prev,
      [chiTietId]: parseInt(value) >= 0 ? parseInt(value) : 0,
    }));
  };

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

  // Stats bước 2
  const totalLo      = chiTiets.length;
  const totalHeThong = chiTiets.reduce((s, ct) => s + parseFloat(ct.soLuongHeThong ?? 0), 0);
  const totalThucTe  = chiTiets.reduce((s, ct) => {
    const v = updates[ct.id] !== undefined ? updates[ct.id] : parseFloat(ct.soLuongThucTe ?? 0);
    return s + v;
  }, 0);

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-yellow-50 via-yellow-50 to-amber-50 min-h-screen">
      <div className="space-y-6 w-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/stock-take")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>
          <StepIndicator step={dotKiemKeId ? 2 : 1} />
        </div>

        {/* ── Stats cards (bước 2) ── */}
        {dotKiemKeId && chiTiets.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng lô hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalLo}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tồn hệ thống</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalHeThong.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Thực tế đã nhập</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalThucTe.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══ BƯỚC 1: Form tạo đợt ══ */}
        {!dotKiemKeId && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">

            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                <PackageSearch className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 leading-snug">Thông tin đợt kiểm kê</p>
                <p className="text-xs text-slate-500 mt-0.5">Vui lòng điền đầy đủ thông tin bên dưới</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreate)}>
                <div className="p-8 space-y-6">

                  <FormField
                    control={form.control}
                    name="khoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">
                          Kho kiểm kê <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(parseInt(v))}
                          defaultValue={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 h-10" style={{ background: "#ffffff" }}>
                              <SelectValue placeholder="Chọn kho..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            position="popper"
                            className="z-50 rounded-xl shadow-xl border"
                            style={{
                              background: "#ffffff",
                              borderColor: "#e5e7eb",
                              color: "#0f172a",
                            }}
                          >
                            {khos.map((kho) => (
                              <SelectItem
                                key={kho.id}
                                value={kho.id.toString()}
                                style={{ color: "#0f172a", cursor: "pointer" }}
                                className="focus:bg-yellow-50 focus:text-slate-900 data-[highlighted]:bg-yellow-50 data-[highlighted]:text-slate-900"
                              >
                                {kho.tenKho}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ghiChu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Ghi chú</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ghi chú thêm (nếu có)..."
                            className="border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 resize-none"
                            style={{ background: "#ffffff" }}
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 px-6 py-5" style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                    style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                    onClick={() => navigate("/stock-take")}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-9 items-center justify-center rounded-lg px-5 text-sm font-bold transition-all duration-150 min-w-[160px]"
                    style={{ background: "#eab308", color: "#ffffff", border: "none", opacity: loading ? 0.7 : 1 }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#ca8a04"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#eab308"; }}
                  >
                    {loading
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo...</>
                      : <><PackageSearch className="mr-2 h-4 w-4" />Tạo đợt kiểm kê</>
                    }
                  </button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* ══ BƯỚC 2: Nhập số lượng ══ */}
        {dotKiemKeId && (
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">

            <div className="flex items-center gap-3 px-6 py-5" style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
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
                <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
                <span className="text-sm text-gray-600">Đang tải danh sách lô hàng...</span>
              </div>

            ) : chiTiets.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <PackageSearch className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Kho không có hàng tồn kho</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Kho này hiện không có lô hàng nào để kiểm kê.
                </p>
              </div>

            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      {[
                        { label: "Sản phẩm / Biến thể", right: false },
                        { label: "Mã SKU",               right: false },
                        { label: "Mã lô",                right: false },
                        { label: "Tồn hệ thống",         right: true  },
                        { label: "Số lượng thực tế",     right: true  },
                        { label: "Chênh lệch",           right: true  },
                      ].map(({ label, right }) => (
                        <th
                          key={label}
                          className={`h-12 px-4 font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap ${right ? "text-right" : "text-left"}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chiTiets.map((ct) => {
                      const tonHeThong = parseFloat(ct.soLuongHeThong ?? 0);
                      const thucTe     = updates[ct.id] !== undefined
                        ? updates[ct.id]
                        : parseFloat(ct.soLuongThucTe ?? 0);
                      const chenhLech  = thucTe - tonHeThong;
                      const hasInput   = updates[ct.id] !== undefined;

                      return (
                        <tr key={ct.id} className="transition-colors duration-150 hover:bg-yellow-50/50">

                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-semibold text-slate-900">
                              {ct.bienTheSanPham?.tenBienThe || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-mono text-xs text-slate-500">
                              {ct.bienTheSanPham?.maSku || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-middle">
                            <span className="font-mono text-xs text-slate-500">
                              {ct.loHang?.maLo || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-middle text-right">
                            <span className="inline-flex items-center justify-end rounded-lg bg-slate-100 px-2.5 py-1">
                              <span className="font-semibold text-slate-800 text-xs">
                                {tonHeThong.toLocaleString("vi-VN")}
                              </span>
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-middle text-right">
                            {isCompleted ? (
                              <span className="inline-flex items-center justify-end rounded-lg bg-slate-100 px-2.5 py-1">
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
                                className="w-28 text-right border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 ml-auto"
                              />
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-middle text-right">
                            {(isCompleted || hasInput) ? (
                              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                chenhLech > 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : chenhLech < 0
                                    ? "bg-red-50 text-red-600"
                                    : "bg-slate-100 text-slate-500"
                              }`}>
                                {chenhLech > 0 ? "+" : ""}
                                {chenhLech.toLocaleString("vi-VN")}
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

            {chiTiets.length > 0 && (
              <div className="flex items-center justify-between px-6 py-5" style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                <p className="text-sm text-slate-500">
                  Tổng{" "}
                  <span className="font-semibold text-yellow-600">{chiTiets.length}</span>{" "}
                  lô hàng
                </p>
                {!isCompleted && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                      style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}
                      onClick={() => navigate("/stock-take")}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      className="inline-flex h-9 items-center justify-center rounded-lg px-5 text-sm font-bold transition-all duration-150 min-w-[180px]"
                      style={{ background: "#eab308", color: "#ffffff", border: "none", opacity: loading ? 0.7 : 1 }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#ca8a04"; }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#eab308"; }}
                      onClick={onComplete}
                    >
                      {loading
                        ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                        : <><CheckCircle2 className="mr-2 h-4 w-4" />Hoàn thành kiểm kê</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}