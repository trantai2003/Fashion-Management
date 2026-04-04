// src/pages/attribute/ColorDetailView.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Loader2, Edit, Hash, Pipette, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { mauSacService } from "@/services/attributeService";

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

export default function ColorDetailView() {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [loading,  setLoading]  = useState(true);
    const [data,     setData]     = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await mauSacService.getById(id);
                if (res.status === 200) {
                    setData(res.data);
                }
            } catch {
                toast.error("Không thể tải thông tin màu sắc");
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
                        onClick={() => navigate(`/attribute/color/${id}`)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all duration-150"
                        style={{ background: "#eab308", color: "#ffffff", border: "none" }}
                    >
                        <Edit className="h-4 w-4" /> Chỉnh sửa
                    </button>
                </div>

                {/* ── Page title ── */}
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow">
                        Chi tiết màu sắc
                    </h2>
                    <p className="text-sm text-white/70 mt-1">Xem thông tin đầy đủ của màu sắc</p>
                </div>

                {/* ── Color Swatch Display ── */}
                <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 p-8 flex flex-col items-center gap-6">
                    <div 
                        className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl transition-transform hover:scale-105 duration-300"
                        style={{ background: data.maMauHex }}
                    />
                    <div className="text-center">
                        <p className="text-3xl font-black text-slate-900 tracking-tight uppercase">{data.tenMau}</p>
                        <p className="text-lg font-mono font-bold text-yellow-600 mt-1">{data.maMauHex}</p>
                    </div>
                </div>

                {/* ── Thông tin chi tiết ── */}
                <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/60 overflow-hidden">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                            <Palette className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 text-sm">Thông tin hồ sơ</p>
                            <p className="text-xs text-slate-500 mt-0.5">Dữ liệu định danh màu sắc</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoField label="Mã màu" value={data.maMau} icon={Hash} />
                        <InfoField label="Tên màu" value={data.tenMau} icon={Palette} />
                        <InfoField label="Mã HEX" value={data.maMauHex} icon={Pipette} />
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
