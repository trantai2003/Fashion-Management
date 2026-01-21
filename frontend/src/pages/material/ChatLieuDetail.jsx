// src/pages/material/ChatLieuDetail.jsx
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
    getChatLieuById,
    createChatLieu,
    updateChatLieu,
} from "@/services/chatLieuService";

const formSchema = z.object({
    maChatLieu: z.string().min(1, "Mã chất liệu không được để trống").max(50, "Mã tối đa 50 ký tự"),
    tenChatLieu: z.string().min(1, "Tên chất liệu không được để trống").max(100, "Tên tối đa 100 ký tự"),
    moTa: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
});

export default function ChatLieuDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [localTrangThai, setLocalTrangThai] = useState(true);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maChatLieu: "",
            tenChatLieu: "",
            moTa: "",
        },
    });

    useEffect(() => {
        if (isEdit) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const data = await getChatLieuById(id);
                    form.reset({
                        maChatLieu: data.maChatLieu || "",
                        tenChatLieu: data.tenChatLieu || "",
                        moTa: data.moTa || "",
                    });
                    setLocalTrangThai(true);
                } catch (error) {
                    toast.error(error.response?.data?.message || "Không thể tải thông tin chất liệu");
                    navigate("/material");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, form, navigate, isEdit]);

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            console.log("Bắt đầu submit:", values); // Log để debug

            let result;
            if (isEdit) {
                result = await updateChatLieu(id, values);
                console.log("Update thành công:", result);
                toast.success("Cập nhật chất liệu thành công!", {
                    duration: 4000,
                    position: "top-center",
                });
            } else {
                result = await createChatLieu(values);
                console.log("Create thành công:", result);
                toast.success("Thêm chất liệu mới thành công!", {
                    duration: 4000,
                    position: "top-center",
                });
            }

            navigate("/material");
        } catch (error) {
            console.error("Lỗi khi submit:", error);

            let errorMsg = "Có lỗi xảy ra khi lưu. Vui lòng thử lại!";

            if (error.response) {
                // Lỗi từ backend (HTTP error)
                const res = error.response;
                console.log("Response từ backend:", res);
                errorMsg = res.data?.message || res.data?.error || `Lỗi ${res.status}: ${res.statusText || "Không xác định"}`;
            } else if (error.message) {
                // Lỗi JS hoặc network
                errorMsg = error.message;
            }

            toast.error(errorMsg, {
                duration: 6000,
                position: "top-center",
                style: {
                    background: "#ef4444",
                    color: "white",
                    borderRadius: "8px",
                    padding: "16px",
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Button variant="ghost" className="mb-6 text-purple-600 hover:text-purple-800" onClick={() => navigate("/material")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>

            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-white">
                <CardHeader className="bg-purple-100 p-6 rounded-t-2xl">
                    <CardTitle className="text-2xl font-bold text-purple-800">
                        {isEdit ? "Chỉnh sửa chất liệu" : "Thêm chất liệu mới"}
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                        {isEdit ? "Cập nhật thông tin chất liệu hiện tại" : "Nhập thông tin để tạo chất liệu mới"}
                    </CardDescription>
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
                                        name="maChatLieu"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Mã chất liệu</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: COTTON, NYLON" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tenChatLieu"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Tên chất liệu</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: Cotton 100%, Polyester" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="moTa"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-purple-800">Mô tả</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Mô tả thêm (tùy chọn)" className="border-purple-300 focus:border-purple-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Switch trạng thái - chỉ hiển thị, không gửi lên backend */}
                                    <FormItem className="flex flex-col space-y-3">
                                        <FormLabel className="text-purple-800 font-medium">Trạng thái chất liệu</FormLabel>
                                        <div className="flex items-center space-x-4">
                                            <Switch
                                                checked={localTrangThai}
                                                onCheckedChange={setLocalTrangThai}
                                                className={`data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-400 transition-colors duration-300`}
                                            />
                                            <span
                                                className={`text-sm font-semibold ${
                                                    localTrangThai ? "text-green-700" : "text-red-700"
                                                }`}
                                            >
                        {localTrangThai ? "Hoạt động" : "Ngừng hoạt động"}
                      </span>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">
                                            Bật để chất liệu này có thể sử dụng trong sản phẩm. Tắt để tạm ngừng.
                                        </p>
                                    </FormItem>
                                </>
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-end space-x-4 p-6 bg-purple-50 rounded-b-2xl">
                            <Button type="button" variant="outline" className="border-purple-300 text-purple-600" onClick={() => navigate("/material")}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
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