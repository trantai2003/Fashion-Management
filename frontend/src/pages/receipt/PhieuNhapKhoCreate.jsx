import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";

export default function PhieuNhapKhoCreate() {
    const navigate = useNavigate();

    // ===== STATE =====
    const [ngayNhap, setNgayNhap] = useState("");
    const [poId, setPoId] = useState("");
    const [selectedPO, setSelectedPO] = useState(null);
    const [loading, setLoading] = useState(false);

    // ===== MOCK DATA (TẠM) =====
    const poListMock = [
        {
            id: 1,
            soDonMua: "PO2024010001",
            tenNhaCungCap: "Công ty A",
            khoNhapId: 1,
            tenKho: "Kho Hà Nội",
        },
        {
            id: 2,
            soDonMua: "PO2024020002",
            tenNhaCungCap: "Công ty B",
            khoNhapId: 2,
            tenKho: "Kho HCM",
        },
    ];

    const poDetailMock = selectedPO
        ? {
            tenNhaCungCap: selectedPO.tenNhaCungCap,
            chiTietDonMuaHangs: [
                {
                    id: 1,
                    sku: "SKU-001",
                    tenSanPham: "Áo thun nam",
                    soLuong: 100,
                    donGia: 120000,
                },
                {
                    id: 2,
                    sku: "SKU-002",
                    tenSanPham: "Quần jean",
                    soLuong: 50,
                    donGia: 350000,
                },
            ],
        }
        : null;

    // ===== HANDLERS =====
    const handleSelectPO = (id) => {
        const po = poListMock.find((p) => String(p.id) === String(id));
        setPoId(id);
        setSelectedPO(po);

        console.log("[MOCK] Selected PO:", po);
    };

    const handleSaveDraft = async () => {
        if (!selectedPO || !poDetailMock) {
            alert("Vui lòng chọn đơn mua hàng (PO)");
            return;
        }

        //Mock chi tiết phiếu nhập kho từ chi tiết PO
        const chiTietPhieuNhapKhos = poDetailMock.chiTietDonMuaHangs.map((ct) => ({
            bienTheSanPhamId: ct.id,       //mock
            soLuongDuKienNhap: ct.soLuong  //mặc định = sl PO
        }));

        if (chiTietPhieuNhapKhos.length === 0) {
            alert("Danh sách sản phẩm nhập không được rỗng");
            return;
        }

        const payload = {
            donMuaHangId: selectedPO.id,
            khoId: selectedPO.khoNhapId, //lay từ PO
            ngayNhap: ngayNhap ? `${ngayNhap}T00:00:00Z` : null,
            ghiChu: "Tạo phiếu nhập kho (MOCK)",
            chiTietPhieuNhapKhos
        };

        //mock mode để test giao diện
        console.log("🚧 [MOCK MODE] CREATE GOODS RECEIPT PAYLOAD");
        console.table(chiTietPhieuNhapKhos);
        console.log(payload);

        alert(
            "Đang ở MOCK MODE.\n" +
            "Phiếu nhập chưa được tạo trong DB.\n" +
            "Khi cắm API PO thật → bật lại createDraft."
        );

        //tam thời kh gọi api
        return;

        /*
        // ===== BẬT LẠI KHI CÓ PO THẬT =====
        setLoading(true);
        try {
            await phieuNhapKhoService.create(payload);
    
            navigate("/goods-receipts", {
                state: {
                    success: true,
                    message: "Tạo phiếu nhập kho thành công",
                },
            });
        } catch (e) {
            console.error("Create receipt failed", e);
            alert("Có lỗi khi tạo phiếu nhập kho");
        } finally {
            setLoading(false);
        }
        */
    };



    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* RECEIPT INFO */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">
                            Thông tin phiếu nhập
                        </h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-gray-600">
                                    Số phiếu nhập
                                </label>
                                <input
                                    disabled
                                    value="AUTO"
                                    className="mt-1 w-full h-11 px-3 border rounded-md bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-600">
                                    Ngày nhập
                                </label>
                                <input
                                    type="date"
                                    value={ngayNhap}
                                    onChange={(e) => setNgayNhap(e.target.value)}
                                    className="mt-1 w-full h-11 px-3 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-600">
                                    Kho nhập
                                </label>
                                <input
                                    disabled
                                    value={selectedPO?.tenKho || ""}
                                    className="mt-1 w-full h-11 px-3 border rounded-md bg-gray-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* PO SELECTION */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">
                            Chọn đơn mua hàng (PO)
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-600">
                                    Đơn mua hàng
                                </label>
                                <select
                                    value={poId}
                                    onChange={(e) => handleSelectPO(e.target.value)}
                                    className="mt-1 w-full h-11 px-3 border rounded-md bg-white"
                                >
                                    <option value="">-- Chọn PO --</option>
                                    {poListMock.map((po) => (
                                        <option key={po.id} value={po.id}>
                                            {po.soDonMua} | {po.tenNhaCungCap}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600">
                                    Nhà cung cấp
                                </label>
                                <input
                                    disabled
                                    value={poDetailMock?.tenNhaCungCap || ""}
                                    className="mt-1 w-full h-11 px-3 border rounded-md bg-gray-100"
                                />
                            </div>
                        </div>
                    </section>

                    {/* PRODUCT LIST */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b flex justify-between">
                            <span className="text-sm font-semibold">
                                Danh sách sản phẩm
                            </span>
                            <span className="text-xs text-gray-500">
                                {poDetailMock?.chiTietDonMuaHangs?.length || 0} dòng
                            </span>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-left">Sản phẩm</th>
                                    <th className="px-4 py-3 text-left">SL PO</th>
                                    <th className="px-4 py-3 text-left">SL nhập</th>
                                    <th className="px-4 py-3 text-left">Đơn giá</th>
                                </tr>
                            </thead>

                            <tbody>
                                {poDetailMock?.chiTietDonMuaHangs?.map((ct) => (
                                    <tr key={ct.id} className="border-t">
                                        <td className="px-4 py-3 font-semibold">{ct.sku}</td>
                                        <td className="px-4 py-3">{ct.tenSanPham}</td>
                                        <td className="px-4 py-3">{ct.soLuong}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                defaultValue={ct.soLuong}
                                                className="w-24 h-9 px-2 border rounded-md"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {ct.donGia.toLocaleString("vi-VN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* ACTIONS */}
                    <div className="flex justify-between">
                        <Link
                            to="/goods-receipts"
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
                                    // tạm thời log – sau này chuyển sang receipt detail / input lot
                                    console.log("Continue to Goods Receipt Detail");
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
