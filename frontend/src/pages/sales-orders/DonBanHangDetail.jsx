import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";

const STATUS_MAP = {
    0: { label: "Nháp", className: "bg-amber-50 text-amber-700" },
    1: { label: "Chờ xuất kho", className: "bg-blue-50 text-blue-700" },
    2: { label: "Đang xuất kho", className: "bg-indigo-50 text-indigo-700" },
    3: { label: "Hoàn thành", className: "bg-green-50 text-green-700" },
    4: { label: "Đã hủy", className: "bg-red-50 text-red-700" },
};

export default function DonBanHangDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    async function fetchDetail() {
        setLoading(true);
        try {
            const res = await donBanHangService.getDetail(id);
            setData(res.data);
        } catch (err) {
            toast.error("Không tải được chi tiết đơn bán");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDetail();
    }, [id]);

    async function handleSendToWarehouse() {
        try {
            await donBanHangService.sendToWarehouse(id);
            toast.success("Đã gửi đơn sang kho");
            fetchDetail();
        } catch {
            toast.error("Không thể gửi đơn");
        }
    }

    async function handleCancel() {
        try {
            await donBanHangService.cancel(id);
            toast.success("Đã hủy đơn bán");
            fetchDetail();
        } catch {
            toast.error("Không thể hủy đơn");
        }
    }

    function handlePrint() {
        window.print();
    }

    if (loading || !data) {
        return <div className="p-6">Đang tải...</div>;
    }

    const { donBanHang, chiTiet, phieuXuatKhoList } = data;

    return (
        <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                <div id="invoice-area" className="space-y-6">
                    {/* HEADER */}
                    <section
                        className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    Đơn bán: {donBanHang.soDonHang}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Ngày đặt: {new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN")}
                                </p>
                            </div>

                            <span className={`px-3 py-1 text-sm rounded ${STATUS_MAP[donBanHang.trangThai]?.className}`}>
                                {STATUS_MAP[donBanHang.trangThai]?.label}
                            </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Khách hàng</p>
                                <p className="font-medium">{donBanHang.khachHang.tenKhachHang}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Kho xuất</p>
                                <p className="font-medium">{donBanHang.khoXuat.tenKho}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Tổng cộng</p>
                                <p className="font-semibold text-purple-600">
                                    {donBanHang.tongCong.toLocaleString()} đ
                                </p>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex gap-3 flex-wrap">
                            {donBanHang.trangThai === 0 && (
                                <button
                                    onClick={handleSendToWarehouse}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Gửi sang kho
                                </button>
                            )}

                            {donBanHang.trangThai !== 3 && donBanHang.trangThai !== 4 && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Hủy đơn
                                </button>
                            )}
                            {donBanHang.trangThai === 3 && (
                                <button
                                    onClick={() => handlePrint()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                >
                                    In hóa đơn
                                </button>
                            )}
                        </div>
                    </section>

                    {/* CHI TIẾT SẢN PHẨM */}
                    <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b font-semibold">Chi tiết sản phẩm</div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">SKU</th>
                                    <th className="px-4 py-3 text-left">Sản phẩm</th>
                                    <th className="px-4 py-3 text-right">SL đặt</th>
                                    <th className="px-4 py-3 text-right">SL đã giao</th>
                                    <th className="px-4 py-3 text-right">Đơn giá</th>
                                    <th className="px-4 py-3 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {chiTiet.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item.sku}</td>
                                        <td className="px-4 py-3">{item.tenSanPham}</td>
                                        <td className="px-4 py-3 text-right">{item.soLuongDat}</td>
                                        <td className="px-4 py-3 text-right">{item.soLuongDaGiao}</td>
                                        <td className="px-4 py-3 text-right">{item.donGia.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {item.thanhTien.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* PHIẾU XUẤT KHO */}
                <section className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b font-semibold">
                        Phiếu xuất kho ({phieuXuatKhoList.length})
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left">Số phiếu</th>
                                <th className="px-4 py-3 text-left">Ngày xuất</th>
                                <th className="px-4 py-3 text-left">Trạng thái</th>
                                <th className="px-4 py-3 text-left">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {phieuXuatKhoList.map((px) => (
                                <tr
                                    key={px.id}
                                    onClick={() => navigate(`/goods-issues/${px.id}/view`)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 text-purple-600 font-medium">
                                        {px.soPhieuXuat}
                                    </td>
                                    <td className="px-4 py-3">
                                        {new Date(px.ngayXuat).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs rounded ${STATUS_MAP[px.trangThai]?.className}`}>
                                            {STATUS_MAP[px.trangThai]?.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{px.ghiChu}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

            </div>
        </main>
    );
}