// src/pages/supplier/SupplierDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Loader2, Building2, User2, Phone, Mail, MapPin, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getSupplierById } from "@/services/supplierService";

// ── Info row ──────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, mono = false }) {
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className={`text-sm font-semibold text-slate-900 leading-snug ${mono ? "font-mono" : ""}`}>
                    {value || "—"}
                </p>
            </div>
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
    const { id }        = useParams();
    const navigate      = useNavigate();
    const [supplier,  setSupplier]  = useState(null);
    const [loading,   setLoading]   = useState(true);

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
                <div className="flex items-center gap-2 text-violet-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm text-gray-600">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!supplier) return null;

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* ── Top nav ── */}
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

                {/* ── Content grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Left: Identity card */}
                    <div className="lg:col-span-1 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                                <Building2 className="h-4 w-4 text-violet-600" />
                            </div>
                            <p className="font-semibold text-slate-900 text-sm">Định danh</p>
                        </div>
                        <div className="px-5 py-2">
                            <div className="py-3.5 border-b border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Mã nhà cung cấp</p>
                                <span className="font-bold text-violet-600 tracking-wide font-mono text-sm">
                                    {supplier.maNhaCungCap || "—"}
                                </span>
                            </div>
                            <div className="py-3.5 border-b border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">Tên nhà cung cấp</p>
                                <p className="font-semibold text-slate-900 text-sm leading-snug">
                                    {supplier.tenNhaCungCap || "—"}
                                </p>
                            </div>
                            <div className="py-3.5">
                                <p className="text-xs text-slate-500 mb-1.5">Trạng thái</p>
                                <StatusBadge status={supplier.trangThai} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact + System info */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Contact card */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                                    <User2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <p className="font-semibold text-slate-900 text-sm">Thông tin liên hệ</p>
                            </div>
                            <div className="px-5 py-1">
                                <InfoRow icon={User2}  label="Người liên hệ" value={supplier.nguoiLienHe} />
                                <InfoRow icon={Phone}  label="Số điện thoại"  value={supplier.soDienThoai} />
                                <InfoRow icon={Mail}   label="Email"          value={supplier.email} />
                                <InfoRow icon={MapPin} label="Địa chỉ"        value={supplier.diaChi} />
                            </div>
                        </div>

                        {/* System info card */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                </div>
                                <p className="font-semibold text-slate-900 text-sm">Thông tin hệ thống</p>
                            </div>
                            <div className="px-5 py-1">
                                <InfoRow icon={Calendar} label="Ngày tạo"       value={formatDate(supplier.ngayTao)} />
                                <InfoRow icon={Clock}    label="Ngày cập nhật"  value={formatDate(supplier.ngayCapNhat)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}