// src/pages/material/ChatLieuDetail.jsx
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
import { ArrowLeft, Save, Layers, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getChatLieuById, createChatLieu, updateChatLieu } from "@/services/chatLieuService";

const formSchema = z.object({
    maChatLieu:  z.string().min(1, "Mã chất liệu không được để trống").max(50, "Mã tối đa 50 ký tự"),
    tenChatLieu: z.string().min(1, "Tên chất liệu không được để trống").max(100, "Tên tối đa 100 ký tự"),
    moTa:        z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
});

// ── Status toggle — đồng nhất với SupplierDetail ─────────────────────────
function StatusToggle({ value, onChange }) {
    return (
        <div className="flex gap-2">
            <button type="button" onClick={() => onChange(1)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200
                    ${value === 1 ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
                <CheckCircle2 className="h-4 w-4" />Hoạt động
            </button>
            <button type="button" onClick={() => onChange(0)}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200
                    ${value === 0 ? "border-slate-400 bg-slate-100 text-slate-700 shadow-sm" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"}`}>
                <XCircle className="h-4 w-4" />Ngừng hoạt động
            </button>
        </div>
    );
}

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

export default function ChatLieuDetail() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const isEdit     = !!id;
    const [loading,  setLoading]  = useState(false);
    const [trangThai, setTrangThai] = useState(1);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { maChatLieu: "", tenChatLieu: "", moTa: "" },
    });

    useEffect(() => {
        if (!isEdit) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getChatLieuById(id);
                form.reset({
                    maChatLieu:  data.maChatLieu  || "",
                    tenChatLieu: data.tenChatLieu || "",
                    moTa:        data.moTa        || "",
                });
                setTrangThai(data.trangThai === 1 || data.trangThai === true ? 1 : 0);
            } catch {
                toast.error("Không thể tải thông tin chất liệu");
                navigate("/material");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, form, navigate, isEdit]);

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values, trangThai };
            if (isEdit) {
                await updateChatLieu(id, payload);
                toast.success("Cập nhật chất liệu thành công");
            } else {
                await createChatLieu(payload);
                toast.success("Thêm chất liệu mới thành công");
            }
            navigate("/material");
        } catch {
            toast.error("Có lỗi xảy ra khi lưu. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* ── Top bar ── */}
                    <div className="flex items-center justify-between">
                        <button type="button" onClick={() => navigate("/material")}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors duration-150">
                            <ArrowLeft className="h-4 w-4" />Quay lại danh sách
                        </button>
                    </div>

                    {/* ── Page title ── */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {isEdit ? "Chỉnh sửa chất liệu" : "Thêm chất liệu mới"}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {isEdit ? "Cập nhật thông tin chất liệu hiện tại" : "Nhập thông tin để tạo chất liệu mới"}
                        </p>
                    </div>

                    {/* ── Row 1: Thông tin cơ bản — full width ── */}
                    <SectionCard icon={Layers} iconBg="bg-violet-100" iconColor="text-violet-600" title="Thông tin chất liệu">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField control={form.control} name="maChatLieu" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-slate-700">
                                        Mã chất liệu <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: COTTON, NYLON" className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 font-mono" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="tenChatLieu" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-slate-700">
                                        Tên chất liệu <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="VD: Cotton 100%, Polyester" className="border-gray-200 focus:border-violet-500 focus:ring-violet-500" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="sm:col-span-2">
                                <FormField control={form.control} name="moTa" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-slate-700">Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea rows={4} placeholder="Mô tả thêm về chất liệu (tùy chọn)" className="border-gray-200 focus:border-violet-500 focus:ring-violet-500 resize-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    </SectionCard>

                    {/* ── Row 2: Trạng thái ── */}
                    <SectionCard icon={CheckCircle2} iconBg="bg-emerald-100" iconColor="text-emerald-600" title="Trạng thái">
                        <div className="space-y-3">
                            <StatusToggle value={trangThai} onChange={setTrangThai} />
                            <p className="text-xs text-slate-500">
                                Bật để chất liệu này có thể sử dụng trong sản phẩm. Tắt để tạm ngừng.
                            </p>
                        </div>
                    </SectionCard>

                    {/* ── Footer actions ── */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" className="border-gray-300 text-slate-600 hover:bg-gray-50" onClick={() => navigate("/material")}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all duration-200 min-w-[120px]">
                            {loading
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                                : <><Save className="mr-2 h-4 w-4" />{isEdit ? "Cập nhật" : "Thêm mới"}</>
                            }
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}