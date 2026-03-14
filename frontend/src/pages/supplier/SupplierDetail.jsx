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
import { ArrowLeft, Save, Loader2, Building2, User2, Phone, Mail, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getSupplierById, createSupplier, updateSupplier } from "@/services/supplierService";

// ── Schema — validate SĐT Việt Nam ───────────────────────────────────────
const PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/;

const formSchema = z.object({
    maNhaCungCap:  z.string().min(1, "Mã nhà cung cấp không được để trống").max(50, "Mã tối đa 50 ký tự"),
    tenNhaCungCap: z.string().min(1, "Tên nhà cung cấp không được để trống").max(200, "Tên tối đa 200 ký tự"),
    nguoiLienHe:   z.string().max(100, "Tên tối đa 100 ký tự").optional().or(z.literal("")),
    soDienThoai: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine(
            (val) => !val || val.trim() === "" || PHONE_REGEX.test(val.trim()),
            { message: "Số điện thoại không hợp lệ (VD: 0987654321 hoặc +84987654321)" }
        ),
    email: z
        .string()
        .optional()
        .or(z.literal(""))
        .refine(
            (val) => !val || val.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
            { message: "Email không hợp lệ" }
        ),
    diaChi: z.string().max(500, "Địa chỉ tối đa 500 ký tự").optional().or(z.literal("")),
});

// ── Section card ──────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-semibold text-slate-900 text-sm">{title}</p>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ── Status toggle button ──────────────────────────────────────────────────
function StatusToggle({ value, onChange }) {
    return (
        <div className="flex gap-3">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    value
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                        : "border-slate-200 bg-white text-slate-400 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600"
                }`}
            >
                <CheckCircle2 className={`h-4 w-4 transition-colors ${value ? "text-emerald-500" : "text-slate-300"}`} />
                Hoạt động
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    !value
                        ? "border-slate-400 bg-slate-100 text-slate-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                }`}
            >
                <XCircle className={`h-4 w-4 transition-colors ${!value ? "text-slate-500" : "text-slate-300"}`} />
                Ngừng hoạt động
            </button>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const isEdit   = !!id;

    const [loading,   setLoading]   = useState(false);
    const [trangThai, setTrangThai] = useState(true);

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

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate("/supplier")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>
            </div>

            {loading && isEdit ? (
                <div className="flex items-center justify-center py-24 gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-600">Đang tải...</span>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                        {/* ── Row 1: Định danh ── */}
                        <SectionCard icon={Building2} iconBg="bg-violet-100" iconColor="text-violet-600" title="Thông tin định danh">
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
                                                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 disabled:bg-slate-50 disabled:text-slate-400 font-mono"
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

                        {/* ── Row 2: Liên hệ + Địa chỉ & Trạng thái ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* Liên hệ */}
                            <SectionCard icon={User2} iconBg="bg-blue-100" iconColor="text-blue-600" title="Thông tin liên hệ">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="nguoiLienHe"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-semibold text-slate-700">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <User2 className="h-3.5 w-3.5 text-slate-400" />
                                                        Người liên hệ
                                                    </span>
                                                </FormLabel>
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
                                                <FormLabel className="text-sm font-semibold text-slate-700">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        Số điện thoại
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="VD: 0987654321"
                                                        className="border-gray-200 focus:border-violet-500"
                                                        maxLength={15}
                                                        {...field}
                                                    />
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
                                                <FormLabel className="text-sm font-semibold text-slate-700">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        Email
                                                    </span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="VD: abc@company.vn" className="border-gray-200 focus:border-violet-500" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </SectionCard>

                            {/* Địa chỉ + Trạng thái */}
                            <div className="space-y-5">
                                <SectionCard icon={MapPin} iconBg="bg-orange-100" iconColor="text-orange-500" title="Địa chỉ">
                                    <FormField
                                        control={form.control}
                                        name="diaChi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="VD: Số 123 Đường Láng Hạ, Quận Đống Đa, Hà Nội"
                                                        className="border-gray-200 focus:border-violet-500 resize-none"
                                                        rows={4}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </SectionCard>

                                {/* Trạng thái */}
                                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">Trạng thái hoạt động</p>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-xs text-slate-500 mb-3">Chọn trạng thái hoạt động của nhà cung cấp</p>
                                        <StatusToggle value={trangThai} onChange={setTrangThai} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Footer actions ── */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 text-slate-600 hover:bg-slate-100 px-6"
                                onClick={() => navigate("/supplier")}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 min-w-[130px] shadow-sm transition-all duration-200 px-6"
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
    );
}