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
import { 
    ArrowLeft, Save, Loader2, Building2, User2, 
    Phone, Mail, MapPin, CheckCircle2, XCircle, FileText 
} from "lucide-react";
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
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-semibold text-slate-800 text-[15px]">{title}</p>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">{children}</div>
        </div>
    );
}

// ── Status toggle button ──────────────────────────────────────────────────
function StatusToggle({ value, onChange }) {
    return (
        <div className="flex flex-wrap gap-3 mt-1">
            <button
                type="button"
                onClick={() => onChange(true)}
                className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[14px] font-semibold transition-all duration-200 ${
                    value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600"
                }`}
            >
                <CheckCircle2 className={`h-4 w-4 ${value ? "text-emerald-500" : "text-slate-400"}`} />
                <span className="truncate">Hoạt động</span>
            </button>
            <button
                type="button"
                onClick={() => onChange(false)}
                className={`flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[14px] font-semibold transition-all duration-200 ${
                    !value
                        ? "border-slate-400 bg-slate-100 text-slate-800 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                }`}
            >
                <XCircle className={`h-4 w-4 ${!value ? "text-slate-600" : "text-slate-400"}`} />
                <span className="truncate">Ngừng hoạt động</span>
            </button>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const isEdit   = !!id; // Nếu có id → Edit, không có id → Create

    const [loading,   setLoading]   = useState(false);
    const [trangThai, setTrangThai] = useState(true); //mặc định khi tạo mới sẽ là "Hoạt động"

    //khởi tạo form 
    const form = useForm({ 
        resolver: zodResolver(formSchema),
        //tất cả là trường trống khi tạo mới, còn khi edit sẽ được điền dữ liệu từ API vào form.reset() trong useEffect phía dưới
        defaultValues: {
            maNhaCungCap: "", tenNhaCungCap: "",
            nguoiLienHe: "", soDienThoai: "", email: "", diaChi: "",
        },
    });

    // ==================== LOAD DỮ LIỆU KHI EDIT ====================
    useEffect(() => {
        if (!isEdit) return; // ← BỎ QUA khi Create
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSupplierById(id); // Gọi API GET /api/supplier/{id} lấy chi tiết nhà cung cấp theo ID 
                form.reset({ // Điền dữ liệu vào form
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

    // ── Hàm submit ────────────────────────────────────────────────────────────────
    const onSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = { ...values, trangThai: trangThai ? 1 : 0 }; // ← thêm trạng thái vào payload gửi lên API
            // Cập nhật nhà cung cấp
            if (isEdit) {
                await updateSupplier(id, payload); // ← GỌI UPDATE khi ở chế độ Edit, gửi payload đã bao gồm trạng thái lên API
                toast.success("Cập nhật nhà cung cấp thành công");
            // Create nhà cung cấp mới
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
        <div className="lux-sync warehouse-unified gold-text-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            {/* ── Top Header and Navigation ── */}
            <div>
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate("/supplier")}
                        className="inline-flex w-fit items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </button>
                </div>
            </div>

            {loading && isEdit ? (
                <div className="flex flex-col items-center justify-center py-32 gap-3 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-[#b8860b]" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải dữ liệu...</span>
                </div>
            ) : (
                <Form {...form}>
                    <form id="supplier-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* ── Row 1: Định danh ── */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="h-5 w-5 text-[#b8860b]" />
                                <h2 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <FormField
                                    control={form.control}
                                    name="maNhaCungCap"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[14px] font-semibold text-slate-700">
                                                Mã định danh <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="VD: SUP001"
                                                    className="h-12 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:bg-slate-50 disabled:text-slate-400 font-mono text-[14px] px-4 shadow-sm"
                                                    {...field}
                                                    disabled={isEdit}  // Mã định danh không được phép chỉnh sửa khi ở chế độ Edit
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
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[14px] font-semibold text-slate-700">
                                                Tên nhà cung cấp <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="VD: Công ty TNHH ABC Việt Nam"
                                                    className="h-12 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-[14px] px-4 shadow-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* ── Row 2: Liên hệ + Địa chỉ & Trạng thái ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                            {/* Liên hệ */}
                            <SectionCard icon={User2} iconBg="bg-blue-100" iconColor="text-blue-600" title="Thông tin liên hệ">
                                <FormField
                                    control={form.control}
                                    name="nguoiLienHe"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[14px] font-semibold text-slate-700 flex items-center gap-2">
                                                <User2 className="h-4 w-4 text-slate-400" />
                                                Người đại diện
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="VD: Nguyễn Văn A" className="h-12 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-[14px] px-4 shadow-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="soDienThoai"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[14px] font-semibold text-slate-700 flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                Số điện thoại hotline
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="VD: 0987654321"
                                                    className="h-12 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-[14px] px-4 shadow-sm font-mono"
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
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-[14px] font-semibold text-slate-700 flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                Email liên hệ chính
                                            </FormLabel>
                                            <FormControl>
                                                <Input placeholder="VD: lienhe@abc.com.vn" className="h-12 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-[14px] px-4 shadow-sm" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </SectionCard>

                            {/* Địa chỉ + Trạng thái */}
                            <div className="flex flex-col gap-6">
                                <SectionCard icon={MapPin} iconBg="bg-amber-100" iconColor="text-amber-600" title="Địa điểm">
                                    <FormField
                                        control={form.control}
                                        name="diaChi"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2.5 h-full flex flex-col">
                                                <FormLabel className="text-[14px] font-semibold text-slate-700 flex items-center gap-2">
                                                   Địa chỉ trụ sở chính / Kho
                                                </FormLabel>
                                                <FormControl className="flex-1">
                                                    <Textarea
                                                        placeholder="VD: Tòa nhà Detech, Số 8 Tôn Thất Thuyết, Cầu Giấy, Hà Nội..."
                                                        className="h-full min-h-[140px] rounded-xl border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-[14px] p-4 shadow-sm resize-y"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500 text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </SectionCard>

                                {/* Trạng thái */}
                                <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex-shrink-0">
                                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <p className="font-semibold text-slate-800 text-[15px]">Trạng thái hoạt động</p>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[13px] text-slate-500 mb-3 font-medium">Lựa chọn chế độ kích hoạt tài khoản nhà cung cấp này</p>
                                        <StatusToggle value={trangThai} onChange={setTrangThai} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Mobile Footer actions ── */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 pb-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto h-12 rounded-xl border-slate-300 text-slate-700 font-semibold bg-white"
                                onClick={() => navigate("/supplier")}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto h-12 rounded-xl bg-slate-900 text-white border border-slate-900 font-semibold shadow-md"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang lưu...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" />{isEdit ? "Lưu thay đổi" : "Thêm mới"}</>
                                )}
                            </Button>
                        </div>

                    </form>
                </Form>
            )}
        </div>
    );
}