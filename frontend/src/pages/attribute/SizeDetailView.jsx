// src/pages/attribute/SizeDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ruler, Loader2, Edit, Hash, Tag, SortAsc, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { sizeService } from "@/services/attributeService";

function InfoField({ label, value, icon: Icon }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            {Icon && <Icon className="h-8 w-8 text-slate-300 flex-shrink-0" />}
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-slate-900 font-semibold mt-1 truncate">{value || "—"}</p>
            </div>
        </div>
    );
}

export default function SizeDetailView() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [loading,  setLoading]  = useState(true);
    const [data,     setData]     = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await sizeService.getById(id);
                if (res.status === 200) {
                    setData(res.data);
                }
            } catch {
                toast.error("Không thể tải thông tin kích cỡ");
                navigate("/attribute");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    if (loading) {
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

    if (!data) return null;

    return (
        <div className="p-6 space-y-6 min-h-screen"
            style={{ background: "linear-gradient(135deg, #ca8a04 0%, #b45309 100%)" }}>

            <div className="space-y-6 max-w-2xl mx-auto">

                {/* ── Top bar ── */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate("/attribute")}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-white/90 hover:text-white transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(`/attribute/size/${id}`)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all duration-150"
                        style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                    >
                        <Edit className="h-4 w-4" /> Chỉnh sửa
                    </button>
                </div>

                {/* ── Page title ── */}
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow">
                        Chi tiết kích cỡ
                    </h2>
                    <p className="text-sm text-white/70 mt-1">Xem thông tin đầy đủ của kích cỡ</p>
                </div>

                {/* ── Info Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Mã kích cỡ</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{data.maSize}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Hash className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Thứ tự hiển thị</p>
                            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{data.thuTuSapXep}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <SortAsc className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* ── Thông tin chi tiết ── */}
                <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                            <Ruler className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 text-sm">Thông tin hồ sơ</p>
                            <p className="text-xs text-slate-500 mt-0.5">Dữ liệu định danh kích cỡ</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField label="Tên hiển thị" value={data.tenSize} icon={Tag} />
                        <InfoField label="Phân loại" value={data.loaiSize} icon={Hash} />
                    </div>
                </div>

                {/* ── Nhật ký ── */}
                <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                            <Calendar className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">Thời gian hệ thống</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField 
                            label="Ngày khởi tạo" 
                            value={data.ngayTao ? new Date(data.ngayTao).toLocaleString('vi-VN') : "—"} 
                            icon={Calendar} 
                        />
                        <InfoField 
                            label="Cập nhật cuối" 
                            value={data.ngayCapNhat ? new Date(data.ngayCapNhat).toLocaleString('vi-VN') : "—"} 
                            icon={FileText} 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
