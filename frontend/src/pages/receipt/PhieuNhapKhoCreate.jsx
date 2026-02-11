import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import purchaseOrderService from "@/services/purchaseOrderService"; // Import service mới
import { toast } from "sonner"; // Hoặc alert tùy bạn

export default function PhieuNhapKhoCreate() {
    const navigate = useNavigate();

    // ===== STATE =====
    const [ngayNhap, setNgayNhap] = useState("");
    const [poId, setPoId] = useState("");
    const [selectedPO, setSelectedPO] = useState(null);
    const [loading, setLoading] = useState(false);
    const [poList, setPoList] = useState([]); // State lưu danh sách PO từ API

    // ===== EFFECT: LOAD DANH SÁCH PO KHI MOUNT =====
    useEffect(() => {
        const fetchPOs = async () => {
            try {
                // Gọi API filter lấy các PO (có thể thêm filter trạng thái nếu cần)
                const res = await purchaseOrderService.filter({
                    page: 0,
                    size: 100,
                    filters: [],
                    sorts: [{ fieldName: "id", direction: "DESC" }]
                });
                setPoList(res.data?.content || []);
            } catch (error) {
                console.error("Lỗi load PO:", error);
            }
        };
        fetchPOs();
    }, []);

    // ===== HANDLERS =====
    const handleSelectPO = async (id) => {
        if (!id) {
            setPoId("");
            setSelectedPO(null);
            return;
        }
        
        setPoId(id);
        setLoading(true);
        try {
            // Gọi API lấy chi tiết PO theo ID
            const res = await purchaseOrderService.getById(id);
            setSelectedPO(res.data);
        } catch (error) {
            console.error("Lỗi lấy chi tiết PO:", error);
            alert("Không thể tải chi tiết đơn mua hàng");
        } finally {
            setLoading(false);
        }
    };

    // Hàm cập nhật số lượng nhập ngay trên dòng sản phẩm
    const handleQtyChange = (bienTheId, value) => {
        setSelectedPO(prev => ({
            ...prev,
            chiTietDonMuaHangs: prev.chiTietDonMuaHangs.map(item => 
                item.bienTheSanPham.id === bienTheId 
                ? { ...item, soLuongNhapTay: Number(value) } 
                : item
            )
        }));
    };

    const handleSaveDraft = async () => {
        if (!selectedPO) {
            alert("Vui lòng chọn đơn mua hàng (PO)");
            return;
        }

        // Tạo danh sách chi tiết từ selectedPO
        const chiTietPhieuNhapKhos = selectedPO.chiTietDonMuaHangs.map((ct) => ({
            bienTheSanPhamId: ct.bienTheSanPham.id,
            // Ưu tiên lấy số lượng đã sửa, nếu không lấy mặc định từ PO
            soLuongDuKienNhap: ct.soLuongNhapTay ?? ct.soLuong 
        }));

        if (chiTietPhieuNhapKhos.length === 0) {
            alert("Danh sách sản phẩm nhập không được rỗng");
            return;
        }

        const payload = {
            donMuaHangId: selectedPO.id,
            ngayNhap: ngayNhap ? `${ngayNhap}T00:00:00Z` : null,
            ghiChu: "Tạo phiếu nhập kho từ PO " + selectedPO.soDonMua,
            chiTietPhieuNhapKhos
        };

        setLoading(true);
        try {
            // GỌI API THẬT
            const res = await phieuNhapKhoService.create(payload);
            toast.success("Tạo phiếu nhập kho thành công");
            navigate("/goods-receipts"); // Quay lại danh sách
        } catch (e) {
            console.error("Create receipt failed", e);
            alert(e?.response?.data?.message || "Có lỗi khi tạo phiếu nhập kho");
        } finally {
            setLoading(false);
        }
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
                                    value={selectedPO?.khoNhap?.tenKho || ""}
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
                                    {poList.map((po) => (
                                        <option key={po.id} value={po.id}>
                                            {po.soDonMua} | {po.nhaCungCap?.tenNhaCungCap}
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
                                    value={selectedPO?.nhaCungCap?.tenNhaCungCap || ""}
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
                                {selectedPO?.chiTietDonMuaHangs?.length || 0} dòng
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
                                {selectedPO?.chiTietDonMuaHangs?.map((ct) => (
                                    <tr key={ct.id} className="border-t">
                                        <td className="px-4 py-3 font-semibold">{ct.bienTheSanPham?.maSku}</td>
                                        <td className="px-4 py-3">{ct.bienTheSanPham?.tenBienThe || ct.bienTheSanPham?.maSku}</td>
                                        <td className="px-4 py-3">{ct.soLuongDat}</td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                defaultValue={ct.soLuong}
                                                onChange={(e) => handleQtyChange(ct.bienTheSanPham.id, e.target.value)}
                                                className="w-24 h-9 px-2 border rounded-md"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {ct.donGia?.toLocaleString("vi-VN")}
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
                            <button
                                onClick={handleSaveDraft}
                                disabled={loading}
                                className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Draft"}
                            </button>

                            <button
                                type="button"
                                disabled={!selectedPO}
                                className={`px-4 py-2 rounded-md text-white text-sm font-semibold ${!selectedPO ? 'bg-gray-300' : 'bg-purple-600 hover:bg-purple-700'}`}
                                onClick={() => {
                                    // Logic Continue: Lưu rồi nhảy sang detail luôn
                                    handleSaveDraft();
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