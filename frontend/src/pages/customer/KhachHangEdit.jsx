// src/pages/customer/KhachHangEdit.jsx
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft, Save, User, Phone, Mail, MapPin, Users, Building, Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { getKhachHangById, updateKhachHang } from "@/services/khachHangService";

const formSchema = z.object({
  tenKhachHang: z.string().min(1, "Tên khách hàng không được để trống").max(200),
  nguoiLienHe: z.string().max(100).optional(),
  soDienThoai: z.string().max(20)
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam")
    .optional(),
  email: z.string().email("Email không hợp lệ").max(100).optional(),
  diaChi: z.string().optional(),
  loaiKhachHang: z.enum(["le", "si", "doanh_nghiep"], {
    errorMap: () => ({ message: "Vui lòng chọn loại khách hàng hợp lệ" }),
  }),
  trangThai: z.number().optional(),
});

export default function KhachHangEdit() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenKhachHang: "", nguoiLienHe: "", soDienThoai: "",
      email: "", diaChi: "", loaiKhachHang: "le", trangThai: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getKhachHangById(id);
        form.reset({
          tenKhachHang: data.tenKhachHang || "",
          nguoiLienHe:  data.nguoiLienHe  || "",
          soDienThoai:  data.soDienThoai  || "",
          email:        data.email        || "",
          diaChi:       data.diaChi       || "",
          loaiKhachHang: data.loaiKhachHang || "le",
          trangThai:    data.trangThai    || 0,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin khách hàng");
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form, navigate]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await updateKhachHang(id, values);
      toast.success("Cập nhật khách hàng thành công!");
      navigate(`/customers/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
      <div className="space-y-6 w-full max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(`/customers/${id}`)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại chi tiết
          </button>
        </div>

        {/* ── Form panel ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
              <User className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 leading-snug">Chỉnh sửa khách hàng</p>
              <p className="text-xs text-slate-500 mt-0.5">Cập nhật thông tin chi tiết</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="p-8 space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-600">Đang tải...</span>
                  </div>
                ) : (
                  <>
                    {/* Tên khách hàng */}
                    <FormField control={form.control} name="tenKhachHang" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" /> Tên khách hàng <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 h-10" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )} />

                    {/* Người liên hệ */}
                    <FormField control={form.control} name="nguoiLienHe" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Người liên hệ</FormLabel>
                        <FormControl>
                          <Input className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 h-10" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )} />

                    {/* Số điện thoại */}
                    <FormField control={form.control} name="soDienThoai" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" /> Số điện thoại
                        </FormLabel>
                        <FormControl>
                          <Input className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 h-10" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )} />

                    {/* Email */}
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" /> Email
                        </FormLabel>
                        <FormControl>
                          <Input className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 h-10" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )} />

                    {/* Địa chỉ */}
                    <FormField control={form.control} name="diaChi" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" /> Địa chỉ
                        </FormLabel>
                        <FormControl>
                          <Textarea className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 resize-none" rows={3} {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )} />

                    {/* Loại khách hàng */}
                    <FormField control={form.control} name="loaiKhachHang" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" /> Loại khách hàng
                        </FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-3">
                            {[
                              { value: "le",          label: "Cá nhân",    sub: "Khách lẻ",         Icon: User },
                              { value: "si",          label: "Sỉ",         sub: "Mua số lượng lớn", Icon: Users },
                              { value: "doanh_nghiep",label: "Doanh nghiệp",sub: "Công ty, đối tác", Icon: Building },
                            ].map(({ value, label, sub, Icon }) => (
                              <FormItem key={value}>
                                <FormControl>
                                  <RadioGroupItem value={value} id={value} className="peer sr-only" />
                                </FormControl>
                                <FormLabel
                                  htmlFor={value}
                                  className="flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-4 text-center cursor-pointer transition-all duration-150 hover:border-violet-400 hover:bg-violet-50/30 peer-data-[state=checked]:border-violet-600 peer-data-[state=checked]:bg-violet-50"
                                >
                                  <Icon className="h-8 w-8 text-slate-400 peer-data-[state=checked]:text-violet-600 mb-2" />
                                  <span className="font-bold text-sm text-slate-900">{label}</span>
                                  <span className="text-xs text-slate-400 mt-0.5">{sub}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )} />

                    {/* Trạng thái */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-sm font-semibold text-slate-700">Trạng thái hoạt động</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${form.watch("trangThai") === 1 ? "text-emerald-600" : "text-slate-400"}`}>
                          {form.watch("trangThai") === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                        <Switch
                          checked={form.watch("trangThai") === 1}
                          onCheckedChange={(checked) => form.setValue("trangThai", checked ? 1 : 0)}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Panel footer */}
              <div className="flex justify-end gap-3 px-8 py-5 bg-slate-50 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/customers/${id}`)}
                  className="bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 shadow-sm font-medium"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold min-w-[140px]"
                >
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                    : <><Save className="mr-2 h-4 w-4" />Cập nhật</>
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}