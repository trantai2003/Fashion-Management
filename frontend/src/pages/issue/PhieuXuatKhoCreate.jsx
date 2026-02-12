import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";

/* ================= MOCK SALES ORDER ================= */
const MOCK_SO_LIST = [
    {
        id: 100,
        soDonHang: "SO-TEST-001",
        khoXuat: "Kho Hà Nội",
        khachHang: "Công ty TNHH Thời Trang Việt",
        chiTiet: [
            {
                bienTheSanPhamId: 14,
                sku: "HSQEQQ123",
                tenBienThe: "Áo sơ mi trắng - M",
                soLuongDat: 10,
                soLuongDaGiao: 6,
                conLai: 4,
            },
            {
                bienTheSanPhamId: 15,
                sku: "hsshashsa",
                tenBienThe: "Áo sơ mi trắng - L",
                soLuongDat: 5,
                soLuongDaGiao: 3,
                conLai: 2,
            },
        ],
    },
];

export default function PhieuXuatKhoCreate() {
    const navigate = useNavigate();

    const [soList] = useState(MOCK_SO_LIST);
    const [selectedSO, setSelectedSO] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        donBanHangId: "",
        ngayXuat: "",
        ghiChu: "",
        chiTietXuat: [],
    });

    /* ================= CHỌN SO (MOCK) ================= */
    const handleSelectSO = (soId) => {
        const so = soList.find((x) => x.id === Number(soId));
        setSelectedSO(so);

        setForm((prev) => ({
            ...prev,
            donBanHangId: so.id,
            chiTietXuat: so.chiTiet.map((item) => ({
                bienTheSanPhamId: item.bienTheSanPhamId,
                soLuongXuat: item.conLai, // mặc định xuất hết
            })),
        }));
    };

    /* ================= SUBMIT ================= */
    const handleSaveDraft = async () => {
        if (!form.donBanHangId) {
            alert("Vui lòng chọn đơn bán hàng (SO)");
            return;
        }

        if (!form.chiTietXuat || form.chiTietXuat.length === 0) {
            alert("Danh sách sản phẩm xuất không được rỗng");
            return;
        }

        const payload = {
            donBanHangId: form.donBanHangId,
            ngayXuat: form.ngayXuat
                ? new Date(form.ngayXuat).toISOString()
                : null,
            ghiChu: "Tạo phiếu xuất kho (MOCK)",
            chiTietXuat: form.chiTietXuat
        };

        console.log("🚧 [MOCK MODE] CREATE GOODS ISSUE PAYLOAD");
        console.log(payload);

        alert("MOCK MODE – payload đúng BE. Sẵn sàng bật API.");
    };


    return (
        <main className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Select SO */}
                <section className="bg-white border rounded-xl p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs">Sales Order</label>
                            <select
                                value={form.donBanHangId}
                                onChange={(e) => handleSelectSO(e.target.value)}
                                className="mt-1 w-full h-11 px-3 border rounded-md"
                            >
                                <option value="">-- Chọn SO --</option>
                                {soList.map((so) => (
                                    <option key={so.id} value={so.id}>
                                        {so.soDonHang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs">Kho xuất</label>
                            <input
                                value={selectedSO?.khoXuat || ""}
                                disabled
                                className="mt-1 w-full h-11 px-3 border rounded-md bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="text-xs">Ngày xuất</label>
                            <input
                                type="date"
                                value={form.ngayXuat}
                                onChange={(e) =>
                                    setForm({ ...form, ngayXuat: e.target.value })
                                }
                                className="mt-1 w-full h-11 px-3 border rounded-md"
                            />
                        </div>
                    </div>
                </section>

                {/* Table sản phẩm */}
                {selectedSO && (
                    <section className="bg-white border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-left">Tên biến thể</th>
                                    <th className="px-4 py-3 text-center">Số lượng đặt</th>
                                    <th className="px-4 py-3 text-center">Số lượng xuất</th>
                                    <th className="px-4 py-3 text-center">Còn lại</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSO.chiTiet.map((item, idx) => (
                                    <tr key={item.bienTheSanPhamId} className="border-t">
                                        <td className="px-4 py-3 font-medium">
                                            {item.sku}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.tenBienThe}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {item.soLuongDat}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input
                                                type="number"
                                                min={0}
                                                max={item.conLai}
                                                value={form.chiTietXuat[idx]?.soLuongXuat}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    const next = [...form.chiTietXuat];
                                                    next[idx].soLuongXuat = value;
                                                    setForm({ ...form, chiTietXuat: next });
                                                }}
                                                className="w-24 h-9 border rounded-md text-center
                     focus:ring-2 focus:ring-purple-500"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center font-semibold">
                                            {item.conLai}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Action */}
                <div className="flex justify-between">
                    <Link
                        to="/goods-issues"
                        className="px-4 py-2 border rounded-md bg-white text-sm"
                    >
                        ← Back
                    </Link>

                    <div className="flex gap-2">
                        {/* Save Draft */}
                        <button
                            onClick={handleSaveDraft}
                            disabled={loading}
                            className="
            px-4 py-2 rounded-md border bg-white
            hover:bg-gray-50
            text-sm
            disabled:opacity-50
        "
                        >
                            {loading ? "Saving..." : "Save Draft"}
                        </button>

                        {/* Continue */}
                        <button
                            type="button"
                            className="
            px-4 py-2 rounded-md
            bg-purple-600 text-white
            text-sm font-semibold
            hover:bg-purple-700
        "
                            onClick={() => {
                                alert("Draft đã tạo (mock). Bước sau: Pick lô.");
                                // sau này:
                                // navigate(`/goods-issues/${createdId}`);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}