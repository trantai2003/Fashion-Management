// src/pages/supplier/SupplierDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
    ArrowLeft, Edit, Loader2, Building2, User2,
    Phone, Mail, MapPin, Clock, Calendar, CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getSupplierById } from "@/services/supplierService";

// ── Section card — đồng nhất với SupplierDetail ───────────────────────────
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

// ── Info field — hiển thị label + value dạng readonly ────────────────────
function InfoField({ label, value, mono = false, children }) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            {children ?? (
                <p className={`text-sm font-semibold text-slate-900 leading-snug ${mono ? "font-mono" : ""}`}>
                    {value || "—"}
                </p>
            )}
        </div>
    );
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    return status === 1 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Hoạt động
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
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
            <div className="p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!supplier) return null;

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => navigate("/supplier")}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors duration-150"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>
                <Button
                    onClick={() => navigate(`/supplier/${id}`)}
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all duration-200"
                >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                </Button>
            </div>

            {/* ── Page title ── */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Chi tiết nhà cung cấp</h2>
                <p className="text-sm text-gray-600 mt-1">Thông tin đầy đủ của nhà cung cấp</p>
            </div>

            {/* ── Row 1: Định danh — full width ── */}
            <SectionCard icon={Building2} iconBg="bg-violet-100" iconColor="text-violet-600" title="Thông tin định danh">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <InfoField label="Mã nhà cung cấp">
                        <span className="font-bold text-violet-600 tracking-wide font-mono text-sm">
                            {supplier.maNhaCungCap || "—"}
                        </span>
                    </InfoField>
                    <InfoField label="Tên nhà cung cấp" value={supplier.tenNhaCungCap} />
                    <InfoField label="Trạng thái">
                        <StatusBadge status={supplier.trangThai} />
                    </InfoField>
                </div>
            </SectionCard>

            {/* ── Row 2: Liên hệ + Địa chỉ & Hệ thống ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Liên hệ */}
                <SectionCard icon={User2} iconBg="bg-blue-100" iconColor="text-blue-600" title="Thông tin liên hệ">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InfoField label="Người liên hệ">
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <User2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-900">
                                        {supplier.nguoiLienHe || "—"}
                                    </span>
                                </div>
                            </InfoField>
                            <InfoField label="Số điện thoại">
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-900">
                                        {supplier.soDienThoai || "—"}
                                    </span>
                                </div>
                            </InfoField>
                        </div>
                        <InfoField label="Email">
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="text-sm font-semibold text-slate-900">
                                    {supplier.email || "—"}
                                </span>
                            </div>
                        </InfoField>
                    </div>
                </SectionCard>

                {/* Địa chỉ + Hệ thống xếp chồng */}
                <div className="space-y-5">

                    {/* Địa chỉ */}
                    <SectionCard icon={MapPin} iconBg="bg-orange-100" iconColor="text-orange-500" title="Địa chỉ">
                        <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                                {supplier.diaChi || "—"}
                            </p>
                        </div>
                    </SectionCard>

                    {/* Thông tin hệ thống */}
                    <SectionCard icon={Clock} iconBg="bg-slate-200" iconColor="text-slate-500" title="Thông tin hệ thống">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InfoField label="Ngày tạo">
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-900">
                                        {formatDate(supplier.ngayTao)}
                                    </span>
                                </div>
                            </InfoField>
                            <InfoField label="Ngày cập nhật">
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-900">
                                        {formatDate(supplier.ngayCapNhat)}
                                    </span>
                                </div>
                            </InfoField>
                        </div>
                    </SectionCard>

                </div>
            </div>

        </div>
    );
}