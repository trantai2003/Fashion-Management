// src/pages/attribute/SizeDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Ruler, Loader2, Tag, SortAsc } from "lucide-react";
import { toast } from "sonner";
import { sizeService } from "@/services/attributeService";

const formSchema = z.object({
    maSize:       z.string().trim().min(1, "Mã size không được để trống").max(50, "Mã tối đa 50 ký tự"),
    tenSize:      z.string().trim().min(1, "Tên size không được để trống").max(100, "Tên tối đa 100 ký tự"),
    loaiSize:     z.string().trim().max(100, "Loại size tối đa 100 ký tự").optional(),
    thuTuSapXep:  z.coerce.number().int().min(0, "Thứ tự sắp xếp phải là số nguyên dương"),
});

export default function SizeDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const isEdit     = !!id;
    const [loading,  setLoading]  = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { maSize: "", tenSize: "", loaiSize: "", thuTuSapXep: 0 },
    });

    useEffect(() => {
        if (!isEdit) return;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await sizeService.getById(id);
                if (res.status === 200) {
                    form.reset({ 
                        maSize:       res.data.maSize      || "",
                        tenSize:      res.data.tenSize     || "",
                        loaiSize:     res.data.loaiSize    || "",
                        thuTuSapXep:  res.data.thuTuSapXep || 0,
                    });
                }
            } catch {
                toast.error("Không thể tải thông tin kích cỡ");
                navigate("/attribute");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form, navigate, isEdit]);

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            if (isEdit) {
                await sizeService.update({ id, ...values });
                toast.success("Cập nhật kích cỡ thành công");
            } else {
                await sizeService.create(values);
                toast.success("Thêm kích cỡ mới thành công");
            }
            navigate("/attribute"); 
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Có lỗi xảy ra khi lưu. Vui lòng thử lại!";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #ca8a04 0%, #b45309 100%)" }}>
                <div className="flex items-center gap-2 bg-white/95 rounded-2xl px-6 py-4 shadow-lg ring-1 ring-white/60">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 min-h-screen"
            style={{ background: "linear-gradient(135deg, #ca8a04 0%, #b45309 100%)" }}>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">

                    {/* ── Top bar ── */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate("/attribute")}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-white/90 hover:text-white transition-colors duration-150"
                        >
                            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                        </button>
                    </div>

                    {/* ── Page title ── */}
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow">
                            {isEdit ? "Chỉnh sửa kích cỡ" : "Thêm kích cỡ mới"}
                        </h2>
                        <p className="text-sm text-white/70 mt-1">
                            {isEdit ? "Cập nhật thông tin kích cỡ hiện tại" : "Nhập thông tin để tạo kích cỡ mới"}
                        </p>
                    </div>

                    {/* ── Thông tin kích cỡ ── */}
                    <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                                <Ruler className="h-4 w-4 text-yellow-600" />
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">Thông tin kích cỡ</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField control={form.control} name="maSize" render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Mã size *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="VD: S, M, L, XL"
                                                className="h-10 font-mono focus:border-yellow-500 focus:ring-yellow-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="tenSize" render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Tên hiển thị *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="VD: Kích thước S, Size 42"
                                                className="h-10 focus:border-yellow-500 focus:ring-yellow-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="loaiSize" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Phân loại
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="VD: Áo, Quần, Giày"
                                                    className="h-10 pl-10 focus:border-yellow-500 focus:ring-yellow-500"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="thuTuSapXep" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Thứ tự sắp xếp
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <SortAsc className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    className="h-10 pl-10 focus:border-yellow-500 focus:ring-yellow-500"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs text-red-500" />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/attribute")}
                            className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all duration-150"
                            style={{ background: "#ffffff", color: "#374151", border: "1px solid #d1d5db" }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold transition-all duration-150 disabled:opacity-50"
                            style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                        >
                            {loading
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
                                : <><Save className="h-4 w-4" /> {isEdit ? "Cập nhật" : "Thêm mới"}</>
                            }
                        </button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
