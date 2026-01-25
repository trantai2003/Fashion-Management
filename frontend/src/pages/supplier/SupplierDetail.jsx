// src/pages/supplier/SupplierDetail.jsx
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
// Thay đổi: import toast từ sonner thay vì react-hot-toast
import { toast } from "sonner";
import {
    getSupplierById,
    createSupplier,
    updateSupplier,
} from "@/services/supplierService";

// Schema validation cho form nhà cung cấp
const formSchema = z.object({
    maNhaCungCap: z.string().min(1, "Mã nhà cung cấp không được để trống").max(50, "Mã tối đa 50 ký tự"),
    tenNhaCungCap: z.string().min(1, "Tên nhà cung cấp không được để trống").max(200, "Tên tối đa 200 ký tự"),
    nguoiLienHe: z.string().max(100, "Người liên hệ tối đa 100 ký tự").optional(),
    soDienThoai: z.string().max(20, "Số điện thoại tối đa 20 ký tự").optional(),
    email: z.string().email("Email không hợp lệ").max(100, "Email tối đa 100 ký tự").optional(),
    diaChi: z.string().max(500, "Địa chỉ tối đa 500 ký tự").optional(),
});

export default function SupplierDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id; // Kiểm tra chế độ chỉnh sửa hay thêm mới
    const [loading, setLoading] = useState(false);
    const [trangThai, setTrangThai] = useState(true);

    // Khởi tạo form với react-hook-form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maNhaCungCap: "",
            tenNhaCungCap: "",
            nguoiLienHe: "",
            soDienThoai: "",
            email: "",
            diaChi: "",
        },
    });

    // Load dữ liệu khi ở chế độ chỉnh sửa
    useEffect(() => {
        if (isEdit) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const data = await getSupplierById(id);
                    // Populate form với dữ liệu từ API
                    form.reset({
                        maNhaCungCap: data.maNhaCungCap || "",
                        tenNhaCungCap: data.tenNhaCungCap || "",
                        nguoiLienHe: data.nguoiLienHe || "",
                        soDienThoai: data.soDienThoai || "",
                        email: data.email || "",
                        diaChi: data.diaChi || "",
                    });
                    // Set trạng thái (1 = hoạt động, 0 = ngừng hoạt động)
                    setTrangThai(data.trangThai === 1);
                } catch (error) {
                    // Thay đổi: sử dụng toast.error từ sonner
                    toast.error(error.response?.data?.message || "Không thể tải thông tin nhà cung cấp");
                    navigate("/supplier");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, form, navigate, isEdit]);

    // Xử lý submit form
    const onSubmit = async (values) => {
        setLoading(true);
        try {
            // Thêm trạng thái vào payload (1 hoặc 0)
            const payload = { ...values, trangThai: trangThai ? 1 : 0 };

            if (isEdit) {
                // Cập nhật nhà cung cấp
                await updateSupplier(id, payload);
                // Thay đổi: toast.success từ sonner (không cần options)
                toast.success("Cập nhật nhà cung cấp thành công");
            } else {
                // Thêm mới nhà cung cấp
                await createSupplier(payload);
                toast.success("Thêm nhà cung cấp mới thành công");
            }

            // Quay về trang danh sách
            navigate("/supplier");
        } catch (error) {
            // Xử lý thông báo lỗi
            let errorMessage = "Có lỗi xảy ra khi lưu. Vui lòng thử lại!";
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            }
            // Thay đổi: toast.error từ sonner
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-3xl">
            {/* Nút quay lại */}
            <Button variant="ghost" className="mb-6 text-purple-600 hover:text-purple-800" onClick={() => navigate("/supplier")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                <CardHeader className="bg-purple-100 p-6 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-purple-800">
                        {isEdit ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                        {isEdit ? "Cập nhật thông tin nhà cung cấp" : "Nhập thông tin để tạo nhà cung cấp mới"}
                    </CardDescription>
                </CardHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <CardContent className="space-y-6 p-6">
                            {loading ? (
                                <div className="text-center py-8 text-purple-600">Đang tải...</div>
                            ) : (
                                <>
                                    {/* Field Mã nhà cung cấp */}
                                    <FormField
                                        control={form.control}
                                        name="maNhaCungCap"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Mã nhà cung cấp</FormLabel>
                                                <FormControl>
                                                    {/* Disable khi edit để không cho sửa mã */}
                                                    <Input placeholder="VD: SUP001" className="border-purple-300 focus:border-purple-500" {...field} disabled={isEdit} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field Tên nhà cung cấp */}
                                    <FormField
                                        control={form.control}
                                        name="tenNhaCungCap"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Tên nhà cung cấp</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: Công ty ABC Việt Nam" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field Người liên hệ */}
                                    <FormField
                                        control={form.control}
                                        name="nguoiLienHe"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Người liên hệ</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: Nguyễn Văn A" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field Số điện thoại */}
                                    <FormField
                                        control={form.control}
                                        name="soDienThoai"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Số điện thoại</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: 0987654321" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field Email */}
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: abc@company.vn" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Field Địa chỉ */}
                                    <FormField
                                        control={form.control}
                                        name="diaChi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Địa chỉ</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="VD: Số 123 Đường Láng Hạ, Hà Nội" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Switch trạng thái */}
                                    <FormItem className="flex flex-col space-y-3">
                                        <FormLabel className="text-purple-800 font-medium">Trạng thái</FormLabel>
                                        <div className="flex items-center space-x-4">
                                            <Switch
                                                checked={trangThai}
                                                onCheckedChange={setTrangThai}
                                                className={`data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-300`}
                                            />
                                            <span
                                                className={`text-sm font-semibold ${
                                                    trangThai ? "text-green-700" : "text-red-700"
                                                }`}
                                            >
                                                {trangThai ? "Hoạt động" : "Ngừng hoạt động"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">
                                            Bật để nhà cung cấp này hoạt động. Tắt để tạm ngừng.
                                        </p>
                                    </FormItem>
                                </>
                            )}
                        </CardContent>

                        {/* Footer với các nút hành động */}
                        <CardFooter className="flex justify-end space-x-4 p-6 bg-purple-50 rounded-b-2xl">
                            <Button type="button" variant="outline" className="border-purple-300 text-purple-600" onClick={() => navigate("/supplier")}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}