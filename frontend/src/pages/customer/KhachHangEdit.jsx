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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getKhachHangById,
  updateKhachHang,
} from "@/services/khachHangService";

// Schema Zod - validation cơ bản (chưa check trùng vì backend chưa hỗ trợ API)
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

  // Dropdown enum - bắt buộc chọn nếu muốn
  loaiKhachHang: z.enum(["le", "si", "doanh_nghiep"], {
    errorMap: () => ({ message: "Vui lòng chọn loại khách hàng hợp lệ" }),
  }).optional(),

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
      loaiKhachHang: "",
      trangThai: 0,
    },
    mode: "onChange", // Validate realtime
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
          loaiKhachHang: data.loaiKhachHang || "",
          trangThai: data.trangThai || 0,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Không thể tải thông tin khách hàng");
        navigate("/customer");
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
        duration: 3000,
        position: "top-right",
      });
      navigate(`/customer/${id}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi cập nhật";
      toast.error(errorMsg, {
        duration: 5000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Button variant="ghost" className="mb-6 text-purple-600 hover:text-purple-800" onClick={() => navigate(`/customer/${id}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại chi tiết
      </Button>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
        <CardHeader className="bg-purple-100 p-6 rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-purple-800">Chỉnh sửa khách hàng</CardTitle>
          <CardDescription className="text-purple-600">Cập nhật thông tin khách hàng</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-6 p-6">
              {loading ? (
                <div className="text-center py-8 text-purple-600">Đang tải...</div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="tenKhachHang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-800">Tên khách hàng</FormLabel>
                        <FormControl>
                          <Input className="border-purple-300 focus:border-purple-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nguoiLienHe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-800">Người liên hệ</FormLabel>
                        <FormControl>
                          <Input className="border-purple-300 focus:border-purple-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="soDienThoai"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-800">Số điện thoại</FormLabel>
                        <FormControl>
                          <Input className="border-purple-300 focus:border-purple-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-800">Email</FormLabel>
                        <FormControl>
                          <Input className="border-purple-300 focus:border-purple-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diaChi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-800">Địa chỉ</FormLabel>
                        <FormControl>
                          <Textarea className="border-purple-300 focus:border-purple-500" {...field} />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loaiKhachHang"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-800">Loại khách hàng</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-purple-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Chọn loại khách hàng</option>
                            <option value="le">Cá nhân (le)</option>
                            <option value="si">Sỉ (si)</option>
                            <option value="doanh_nghiep">Doanh nghiệp</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormItem className="flex flex-col space-y-3">
                    <FormLabel className="text-purple-800 font-medium">Trạng thái</FormLabel>
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={form.watch("trangThai") === 1}
                        onCheckedChange={(checked) => form.setValue("trangThai", checked ? 1 : 0)}
                        className={`data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-300`}
                      />
                      <span className={`text-sm font-semibold ${form.watch("trangThai") === 1 ? "text-green-700" : "text-red-700"}`}>
                        {form.watch("trangThai") === 1 ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                    </div>
                  </FormItem>
                </>
              )}
            </CardContent>

            <CardFooter className="flex justify-end space-x-4 p-6 bg-purple-50 rounded-b-2xl">
              <Button type="button" variant="outline" className="border-purple-300 text-purple-600" onClick={() => navigate(`/customer/${id}`)}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Đang lưu..." : "Cập nhật"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}