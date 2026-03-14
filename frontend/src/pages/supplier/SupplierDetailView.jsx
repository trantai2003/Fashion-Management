// src/pages/supplier/SupplierDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Edit, Loader2, Building2, User2,
    Phone, Mail, MapPin, Clock, Calendar, FileText
} from "lucide-react";
import { toast } from "sonner";
import { getSupplierById } from "@/services/supplierService";

// ── Section card — đồng nhất với SupplierDetail ───────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <p className="font-semibold text-slate-800 text-[15px]">{title}</p>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">{children}</div>
        </div>
    );
}

// ── Info field — hiển thị label + value dạng readonly ────────────────────
function InfoField({ label, value, mono = false, children }) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <div className="flex-1 flex items-start mt-1">
                {children ?? (
                    <p className={`text-[15px] font-medium text-slate-800 ${mono ? "font-mono" : ""}`}>
                        {value || "—"}
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    return status === 1 ? (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[13px] font-semibold text-emerald-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Hoạt động
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-[13px] font-semibold text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Ngừng hoạt động
        </span>
    );
}

// ── Main component ────────────────────────────────────────────────────────
export default function SupplierDetailView() {
    const { id }      = useParams();
    const navigate    = useNavigate();
    const [supplier, setSupplier] = useState(null);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await getSupplierById(id);
                setSupplier(data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Không thể tải thông tin nhà cung cấp");
                navigate("/supplier");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    if (!supplier) return null;

    return (
        <div className="p-6 md:p-8 pb-24 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] lux-sync">

            {/* ── Top Header and Navigation ── */}
            <div className="flex flex-col gap-4 mb-2">
                <button
                    type="button"
                    onClick={() => navigate("/supplier")}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-violet-600 transition-colors duration-200 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách nhà cung cấp
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200/60 shrink-0">
                            <Building2 className="h-6 w-6 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                                Chi tiết nhà cung cấp
                            </h1>
                            <p className="mt-1 text-[15px] text-slate-500">
                                Xem thông tin chi tiết về nhà cung cấp trên hệ thống
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => navigate(`/supplier/${id}`)}
                            className="h-11 px-6 rounded-xl bg-slate-900 text-white border border-slate-900 font-semibold hover:bg-white hover:text-slate-900 transition-all duration-200 shadow-md"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Row 1: Định danh — full width ── */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-5 w-5 text-violet-600" />
                    <h2 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
                    <InfoField label="Mã định danh">
                        <span className="font-semibold text-violet-600 font-mono text-[15px] bg-violet-50 px-2 py-1 rounded-md border border-violet-100">
                            {supplier.maNhaCungCap || "—"}
                        </span>
                    </InfoField>
                    <InfoField label="Tên nhà cung cấp" value={supplier.tenNhaCungCap} />
                    <InfoField label="Trạng thái hoạt động">
                        <StatusBadge status={supplier.trangThai} />
                    </InfoField>
                </div>
            </div>

            {/* ── Row 2: Liên hệ + Địa chỉ & Hệ thống ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Liên hệ */}
                <SectionCard icon={User2} iconBg="bg-blue-100" iconColor="text-blue-600" title="Thông tin liên hệ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoField label="Người đại diện">
                            <div className="flex items-center gap-2">
                                <User2 className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-[15px] font-medium text-slate-800">
                                    {supplier.nguoiLienHe || "—"}
                                </span>
                            </div>
                        </InfoField>
                        <InfoField label="Số điện thoại hotline">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-[15px] font-medium text-slate-800 font-mono">
                                    {supplier.soDienThoai || "—"}
                                </span>
                            </div>
                        </InfoField>
                    </div>
                    <InfoField label="Email liên hệ chính">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="text-[15px] font-medium text-slate-800">
                                {supplier.email || "—"}
                            </span>
                        </div>
                    </InfoField>
                </SectionCard>

                {/* Địa chỉ + Hệ thống xếp chồng */}
                <div className="flex flex-col gap-6">

                    {/* Địa chỉ */}
                    <SectionCard icon={MapPin} iconBg="bg-amber-100" iconColor="text-amber-600" title="Địa điểm">
                        <InfoField label="Địa chỉ trụ sở chính / Kho">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[15px] font-medium text-slate-800 leading-relaxed">
                                    {supplier.diaChi || "—"}
                                </p>
                            </div>
                        </InfoField>
                    </SectionCard>

                    {/* Thông tin hệ thống */}
                    <div className="rounded-2xl bg-slate-50 shadow-inner border border-slate-200/80 overflow-hidden flex-shrink-0">
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-100">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200">
                                <Clock className="h-4 w-4 text-slate-600" />
                            </div>
                            <p className="font-semibold text-slate-800 text-[15px]">Thông tin hệ thống</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoField label="Ngày tạo">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="text-[15px] font-medium text-slate-700">
                                            {formatDate(supplier.ngayTao)}
                                        </span>
                                    </div>
                                </InfoField>
                                <InfoField label="Cập nhật lần cuối">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                        <span className="text-[15px] font-medium text-slate-700">
                                            {formatDate(supplier.ngayCapNhat)}
                                        </span>
                                    </div>
                                </InfoField>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}