// src/pages/customer/KhachHangEdit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Users, Building, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getKhachHangById,
  updateKhachHang,
} from "@/services/khachHangService";

// Schema Zod
const formSchema = z.object({
  tenKhachHang: z.string()
    .min(1, "Tên khách hàng không được để trống")
    .max(200, "Tên tối đa 200 ký tự"),

  nguoiLienHe: z.string()
    .max(100, "Người liên hệ tối đa 100 ký tự")
    .optional(),

  soDienThoai: z.string()
    .max(20, "Số điện thoại tối đa 20 ký tự")
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không đúng định dạng Việt Nam (10-11 số, bắt đầu bằng 0 hoặc +84)")
    .optional(),

  email: z.string()
    .email("Email không hợp lệ")
    .max(100, "Email tối đa 100 ký tự")
    .optional(),

  diaChi: z.string().optional(),

  loaiKhachHang: z.enum(["le", "si", "doanh_nghiep"], {
    errorMap: () => ({ message: "Vui lòng chọn loại khách hàng hợp lệ" }),
  }),

  trangThai: z.number().optional(),
});

export default function KhachHangEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tenKhachHang: "",
      nguoiLienHe: "",
      soDienThoai: "",
      email: "",
      diaChi: "",
      loaiKhachHang: "le",
      trangThai: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getKhachHangById(id);
        form.reset({
          tenKhachHang: data.tenKhachHang || "",
          nguoiLienHe: data.nguoiLienHe || "",
          soDienThoai: data.soDienThoai || "",
          email: data.email || "",
          diaChi: data.diaChi || "",
          loaiKhachHang: data.loaiKhachHang || "le",
          trangThai: data.trangThai || 0,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin khách hàng", {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          duration: 5000,
          position: "top-center",
        });
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
      toast.success("Cập nhật khách hàng thành công!", {
        icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
        style: {
          border: "1px solid #10b981",
          background: "linear-gradient(to right, #ecfdf5, #f0fdfa)",
          color: "#065f46",
          padding: "16px 24px",
          borderRadius: "12px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        duration: 4000,
        position: "top-center",
      });
      navigate(`/customers/${id}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật";
      toast.error(errorMsg, {
        icon: <AlertCircle className="h-6 w-6 text-red-600" />,
        style: {
          border: "1px solid #ef4444",
          background: "linear-gradient(to right, #fef2f2, #fee2e2)",
          color: "#991b1b",
          padding: "16px 24px",
          borderRadius: "12px",
          fontWeight: "600",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Button variant="ghost" className="mb-6 text-purple-600 hover:text-purple-800" onClick={() => navigate(`/customers/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại chi tiết
      </Button>

      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-200 p-8 rounded-t-3xl">
          <CardTitle className="text-3xl font-bold text-purple-900">Chỉnh sửa khách hàng</CardTitle>
          <CardDescription className="text-purple-700 mt-2 text-lg">Cập nhật thông tin chi tiết</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="space-y-8 p-8">
              {loading ? (
                <div className="text-center py-12 text-purple-600 text-xl font-medium flex items-center justify-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Đang tải...
                </div>
              ) : (
                <>
                  {/* Tên khách hàng */}
                  <FormField
                    control={form.control}
                    name="tenKhachHang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900 flex items-center gap-3 text-lg font-medium">
                          <User className="h-5 w-5 text-purple-600" />
                          Tên khách hàng
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 pl-11 h-12 text-base transition-all duration-200" {...field} />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Người liên hệ */}
                  <FormField
                    control={form.control}
                    name="nguoiLienHe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900 flex items-center gap-3 text-lg font-medium">
                          <User className="h-5 w-5 text-purple-600" />
                          Người liên hệ
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 pl-11 h-12 text-base transition-all duration-200" {...field} />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Số điện thoại */}
                  <FormField
                    control={form.control}
                    name="soDienThoai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900 flex items-center gap-3 text-lg font-medium">
                          <Phone className="h-5 w-5 text-purple-600" />
                          Số điện thoại
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 pl-11 h-12 text-base transition-all duration-200" {...field} />
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900 flex items-center gap-3 text-lg font-medium">
                          <Mail className="h-5 w-5 text-purple-600" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 pl-11 h-12 text-base transition-all duration-200" {...field} />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Địa chỉ */}
                  <FormField
                    control={form.control}
                    name="diaChi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900 flex items-center gap-3 text-lg font-medium">
                          <MapPin className="h-5 w-5 text-purple-600" />
                          Địa chỉ
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 pl-11 min-h-[100px] text-base transition-all duration-200" {...field} />
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-purple-500" />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-600" />
                      </FormItem>
                    )}
                  />

                  {/* Radio buttons loại khách hàng - đẹp hơn */}
                  <FormField
                    control={form.control}
                    name="loaiKhachHang"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-purple-900 font-medium flex items-center gap-3 text-lg">
                          <Users className="h-5 w-5 text-purple-600" />
                          Loại khách hàng
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-3 gap-5"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="le" id="le" className="peer sr-only" />
                              </FormControl>
                              <FormLabel
                                htmlFor="le"
                                className="flex flex-col items-center justify-between rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 p-6 text-center hover:border-purple-500 hover:shadow-xl peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-purple-100 peer-data-[state=checked]:to-purple-200 peer-data-[state=checked]:shadow-2xl transition-all duration-300 cursor-pointer group"
                              >
                                <User className="h-12 w-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="font-bold text-lg text-purple-900">Cá nhân (le)</div>
                                <div className="text-sm text-purple-700 mt-2">Khách lẻ, mua lẻ</div>
                              </FormLabel>
                            </FormItem>

                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="si" id="si" className="peer sr-only" />
                              </FormControl>
                              <FormLabel
                                htmlFor="si"
                                className="flex flex-col items-center justify-between rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 p-6 text-center hover:border-purple-500 hover:shadow-xl peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-purple-100 peer-data-[state=checked]:to-purple-200 peer-data-[state=checked]:shadow-2xl transition-all duration-300 cursor-pointer group"
                              >
                                <Users className="h-12 w-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="font-bold text-lg text-purple-900">Sỉ (si)</div>
                                <div className="text-sm text-purple-700 mt-2">Khách sỉ, mua số lượng lớn</div>
                              </FormLabel>
                            </FormItem>

                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="doanh_nghiep" id="doanh_nghiep" className="peer sr-only" />
                              </FormControl>
                              <FormLabel
                                htmlFor="doanh_nghiep"
                                className="flex flex-col items-center justify-between rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50 p-6 text-center hover:border-purple-500 hover:shadow-xl peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-purple-100 peer-data-[state=checked]:to-purple-200 peer-data-[state=checked]:shadow-2xl transition-all duration-300 cursor-pointer group"
                              >
                                <Building className="h-12 w-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                                <div className="font-bold text-lg text-purple-900">Doanh nghiệp</div>
                                <div className="text-sm text-purple-700 mt-2">Công ty, đối tác</div>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage className="text-red-500 text-center" />
                      </FormItem>
                    )}
                  />

                  {/* Switch trạng thái */}
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="text-purple-900 font-medium flex items-center gap-3 text-lg">
                      <Switch
                        checked={form.watch("trangThai") === 1}
                        onCheckedChange={(checked) => form.setValue("trangThai", checked ? 1 : 0)}
                        className={`data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-300`}
                      />
                      <span className={`text-lg font-semibold ${form.watch("trangThai") === 1 ? "text-green-700" : "text-red-700"}`}>
                        {form.watch("trangThai") === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </FormLabel>
                  </FormItem>
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-4 p-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-b-2xl">
              <Button type="button" variant="outline" className="border-purple-400 text-purple-700 hover:bg-purple-100 transition-colors" onClick={() => navigate(`/customers/${id}`)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white transition-colors min-w-[140px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Cập nhật
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}