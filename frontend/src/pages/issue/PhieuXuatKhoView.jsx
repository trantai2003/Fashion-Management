import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { toast } from "sonner";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ duyệt", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đã duyệt", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Đã xuất", className: "bg-green-50 text-green-700" },
    4: { label: "Đã huỷ", className: "bg-red-50 text-red-700" },
};

export default function PhieuXuatKhoView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await phieuXuatKhoService.view(id);
            setData(res);
        } catch (e) {
            toast.error("Không thể tải chi tiết phiếu xuất");
        } finally {
            setLoading(false);
        }
    }

    if (loading || !data) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 space-y-6">

                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-black"
                >
                    ← Quay lại
                </button>

                <div className="bg-white rounded-xl border p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">
                            Phiếu xuất: {data.soPhieuXuat}
                        </h2>

                        <span className={`px-3 py-1 text-xs rounded ${STATUS_MAP[data.trangThai]?.className}`}>
                            {STATUS_MAP[data.trangThai]?.label}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <Info label="Sales Order" value={data.soDonHang} />
                        <Info label="Kho xuất" value={data.tenKho} />
                        <Info label="Ngày xuất" value={new Date(data.ngayXuat).toLocaleDateString("vi-VN")} />
                        <Info label="Người duyệt" value={data.nguoiDuyet} />
                        <Info label="Người xuất" value={data.nguoiXuat} />
                        <Info label="Ghi chú" value={data.ghiChu} />
                    </div>
                </div>

            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-medium text-gray-900">{value || "-"}</div>
        </div>
    );
}