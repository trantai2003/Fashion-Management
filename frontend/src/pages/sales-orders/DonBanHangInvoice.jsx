import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";

export default function DonBanHangInvoice() {
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
            const res = await donBanHangService.getDetail(id);
            setData(res.data);
        } catch (err) {
            toast.error("Không tải được hóa đơn");
        } finally {
            setLoading(false);
        }
    }

    function handlePrint() {
        window.print();
    }

    if (loading || !data) {
        return <div className="p-6">Đang tải...</div>;
    }

    const { donBanHang, chiTiet } = data;

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <div id="invoice-area" className="max-w-4xl mx-auto bg-white p-10 shadow print:shadow-none">

                {/* ACTION BAR (Ẩn khi in) */}
                <div className="flex justify-between mb-6 print:hidden">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-gray-500 hover:text-black"
                    >
                        ← Quay lại
                    </button>

                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                        In / Xuất PDF
                    </button>
                </div>

                {/* HEADER */}
                <div className="mb-10">
                    <h1 className="text-2xl font-bold">
                        HÓA ĐƠN BÁN HÀNG
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Mã đơn: {donBanHang.soDonHang}
                    </p>
                    <p className="text-sm text-gray-500">
                        Ngày: {new Date(donBanHang.ngayDatHang).toLocaleDateString("vi-VN")}
                    </p>
                </div>

                {/* COMPANY INFO */}
                <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                    <div>
                        <p className="font-semibold">Bên bán</p>
                        <p>Fashion Company</p>
                        <p>Địa chỉ: Hà Nội</p>
                        <p>Email: contact@fashion.vn</p>
                    </div>

                    <div>
                        <p className="font-semibold">Bên mua</p>
                        <p>{donBanHang.khachHang.tenKhachHang}</p>
                        <p>{donBanHang.khachHang.diaChi}</p>
                        <p>{donBanHang.khachHang.email}</p>
                    </div>
                </div>

                {/* TABLE */}
                <table className="w-full text-sm border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border px-3 py-2 text-left">SKU</th>
                            <th className="border px-3 py-2 text-left">Sản phẩm</th>
                            <th className="border px-3 py-2 text-right">SL</th>
                            <th className="border px-3 py-2 text-right">Đơn giá</th>
                            <th className="border px-3 py-2 text-right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chiTiet.map((item) => (
                            <tr key={item.id}>
                                <td className="border px-3 py-2">{item.sku}</td>
                                <td className="border px-3 py-2">{item.tenSanPham}</td>
                                <td className="border px-3 py-2 text-right">{item.soLuongDat}</td>
                                <td className="border px-3 py-2 text-right">
                                    {item.donGia.toLocaleString()}
                                </td>
                                <td className="border px-3 py-2 text-right font-semibold">
                                    {item.thanhTien.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTAL */}
                <div className="mt-6 text-right">
                    <p className="text-sm">
                        Tiền hàng: {donBanHang.tienHang.toLocaleString()} đ
                    </p>
                    <p className="text-sm">
                        Phí vận chuyển: {donBanHang.phiVanChuyen.toLocaleString()} đ
                    </p>
                    <p className="text-lg font-bold mt-2">
                        Tổng cộng: {donBanHang.tongCong.toLocaleString()} đ
                    </p>
                </div>

                {/* FOOTER */}
                <div className="mt-16 text-sm grid grid-cols-2">
                    <div>
                        <p>Người lập</p>
                        <div className="h-16"></div>
                        <p>{donBanHang.nguoiTao?.hoTen}</p>
                    </div>

                    <div className="text-right">
                        <p>Đại diện khách hàng</p>
                        <div className="h-16"></div>
                        <p>(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>

            </div>
        </div>
    );
}