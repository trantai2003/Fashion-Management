// src/pages/supplier/SupplierDetail.jsx
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
import { ArrowLeft, Save, Loader2, Users, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getSupplierById, createSupplier, updateSupplier } from "@/services/supplierService";

// ── Schema ────────────────────────────────────────────────────────────────
const formSchema = z.object({
    maNhaCungCap:  z.string().min(1, "Mã nhà cung cấp không được để trống").max(50, "Mã tối đa 50 ký tự"),
    tenNhaCungCap: z.string().min(1, "Tên nhà cung cấp không được để trống").max(200, "Tên tối đa 200 ký tự"),
    nguoiLienHe:   z.string().max(100).optional(),
    soDienThoai:   z.string().max(20).optional(),
    email:         z.string().email("Email không hợp lệ").max(100).optional().or(z.literal("")),
    diaChi:        z.string().max(500).optional(),
});

// ── Field group wrapper ───────────────────────────────────────────────────
function SectionCard({ title, children }) {
    return (
        <div className="rounded-xl ring-1 ring-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
            </div>
            <div className="p-5 space-y-5">{children}</div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierDetail() {
    const { id }    = useParams();
    const navigate  = useNavigate();
    const isEdit    = !!id;

    const [loading,    setLoading]    = useState(false);
    const [trangThai,  setTrangThai]  = useState(true);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            maNhaCungCap: "", tenNhaCungCap: "",
            nguoiLienHe: "", soDienThoai: "", email: "", diaChi: "",
        },
    });

    useEffect(() => {
        if (!isEdit) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSupplierById(id);
                form.reset({
                    maNhaCungCap:  data.maNhaCungCap  || "",
                    tenNhaCungCap: data.tenNhaCungCap  || "",
                    nguoiLienHe:   data.nguoiLienHe    || "",
                    soDienThoai:   data.soDienThoai    || "",
                    email:         data.email          || "",
                    diaChi:        data.diaChi         || "",
                });
                setTrangThai(data.trangThai === 1);
            } catch (error) {
                toast.error(error.response?.data?.message || "Không thể tải thông tin nhà cung cấp");
                navigate("/supplier");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form, navigate, isEdit]);

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values, trangThai: trangThai ? 1 : 0 };
            if (isEdit) {
                await updateSupplier(id, payload);
                toast.success("Cập nhật nhà cung cấp thành công");
            } else {
                await createSupplier(payload);
                toast.success("Thêm nhà cung cấp mới thành công");
            }
            navigate("/supplier");
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate("/supplier")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors duration-150"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>

                {/* Page title */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        {isEdit ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEdit ? "Cập nhật thông tin nhà cung cấp" : "Nhập thông tin để tạo nhà cung cấp mới"}
                    </p>
                </div>

                {/* Form card */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                            <Building2 className="h-4 w-4 text-violet-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 leading-snug">Thông tin nhà cung cấp</p>
                            <p className="text-xs text-slate-500 mt-0.5">Vui lòng điền đầy đủ các trường bắt buộc</p>
                        </div>
                    </div>

                    {loading && isEdit ? (
                        <div className="flex items-center justify-center py-16 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                            <span className="text-sm text-gray-600">Đang tải...</span>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="p-6 space-y-5">
                                    {/* Section: Định danh */}
                                    <SectionCard title="Thông tin định danh">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <FormField
                                                control={form.control}
                                                name="maNhaCungCap"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                                            Mã nhà cung cấp <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="VD: SUP001"
                                                                className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 disabled:bg-slate-50 disabled:text-slate-500"
                                                                {...field}
                                                                disabled={isEdit}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="tenNhaCungCap"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700">
                                                            Tên nhà cung cấp <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="VD: Công ty ABC Việt Nam"
                                                                className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </SectionCard>

                                    {/* Section: Liên hệ */}
                                    <SectionCard title="Thông tin liên hệ">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <FormField
                                                control={form.control}
                                                name="nguoiLienHe"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700">Người liên hệ</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="VD: Nguyễn Văn A" className="border-gray-200 focus:border-violet-500" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="soDienThoai"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700">Số điện thoại</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="VD: 0987654321" className="border-gray-200 focus:border-violet-500" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-semibold text-slate-700">Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="VD: abc@company.vn" className="border-gray-200 focus:border-violet-500" {...field} />
                                                        </FormControl>
                                                        <FormMessage className="text-red-500 text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="diaChi"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700">Địa chỉ</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="VD: Số 123 Đường Láng Hạ, Hà Nội"
                                                            className="border-gray-200 focus:border-violet-500 resize-none"
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-500 text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </SectionCard>

                                    {/* Section: Trạng thái */}
                                    <SectionCard title="Trạng thái hoạt động">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Trạng thái</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Bật để nhà cung cấp hoạt động, tắt để tạm ngừng</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={trangThai}
                                                    onCheckedChange={setTrangThai}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300 transition-colors duration-300"
                                                />
                                                {trangThai ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        Ngừng hoạt động
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </SectionCard>
                                </div>

                                {/* Footer */}
                                <div className="flex justify-end gap-3 px-6 py-5 bg-slate-50 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="border-gray-300 text-slate-600"
                                        onClick={() => navigate("/supplier")}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px] shadow-sm transition-all duration-200"
                                    >
                                        {loading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                                        ) : (
                                            <><Save className="mr-2 h-4 w-4" />{isEdit ? "Cập nhật" : "Thêm mới"}</>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </div>
        </div>
    );
}