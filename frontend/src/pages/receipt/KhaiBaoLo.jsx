import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";

export default function KhaiBaoLo() {
    const { phieuNhapKhoId, bienTheSanPhamId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(null);

    // form
    const [maLo, setMaLo] = useState("");
    const [nsx, setNsx] = useState("");
    const [soLuongNhap, setSoLuongNhap] = useState("");
    const [ghiChu, setGhiChu] = useState("");

    // TODO: sau này lấy từ API read lot
    const [lotList, setLotList] = useState([]);

    useEffect(() => {
        fetchDetail();
    }, []);

    async function fetchDetail() {
        try {
            const res = await phieuNhapKhoService.getDetail(phieuNhapKhoId);
            const item = res.items.find(
                (i) => i.bienTheSanPhamId === Number(bienTheSanPhamId)
            );

            if (!item) {
                toast.error("Không tìm thấy biến thể trong phiếu nhập");
                navigate(-1);
                return;
            }

            setDetail({ phieu: res, item });

            // TODO: replace bằng API getLots()
            setLotList([]); // mặc định chưa có lô
        } catch {
            toast.error("Không tải được dữ liệu");
        }
    }

    async function handleSaveLot() {
        if (!maLo || !soLuongNhap) {
            toast.error("Vui lòng nhập mã lô và số lượng");
            return;
        }

        setLoading(true);
        try {
            await phieuNhapKhoService.khaiBaoLo(phieuNhapKhoId, {
                bienTheSanPhamId: Number(bienTheSanPhamId),
                maLo,
                ngaySanXuat: nsx ? `${nsx}T00:00:00.000Z` : null,
                soLuongNhap: Number(soLuongNhap),
                ghiChu,
            });

            toast.success("Khai báo lô thành công");
            navigate(`/goods-receipts/${phieuNhapKhoId}`);
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể khai báo lô");
        } finally {
            setLoading(false);
        }
    }

    if (!detail) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    const { item, phieu } = detail;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                {/* HEADER */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link
                        to={`/goods-receipts/${phieuNhapKhoId}`}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                    >
                        ← Back to Receipt Detail
                    </Link>

                    <span className="text-sm text-gray-500">
                        Tổng số lượng lô phải = <strong>{item.soLuongCanNhap}</strong>
                    </span>
                </div>

                {/* CONTENT */}
                <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

                    {/* THÔNG TIN SẢN PHẨM */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">
                            Thông tin sản phẩm
                        </h2>

                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                            <Info label="SKU" value={item.sku} bold />
                            <Info label="Tên biến thể" value={item.tenBienThe} />
                            <Info label="Số lượng cần nhập" value={item.soLuongCanNhap} bold />
                            <Info
                                label="Đã khai báo lô"
                                value={`${item.soLuongDaKhaiBao ?? 0} / ${item.soLuongCanNhap}`}
                                className={
                                    (item.soLuongDaKhaiBao ?? 0) >= item.soLuongCanNhap
                                        ? "text-green-600 font-semibold"
                                        : "text-red-600 font-semibold"
                                }
                            />
                        </div>
                    </section>

                    {/* DANH SÁCH LÔ */}
                    <section className="bg-white border rounded-xl shadow-sm">
                        <div className="p-4 font-semibold">
                            Danh sách lô đã khai báo
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Mã lô</th>
                                    <th className="px-4 py-3">NSX</th>
                                    <th className="px-4 py-3">Số lượng</th>
                                    <th className="px-4 py-3">Ghi chú</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {lotList.length === 0 && (
                                    <tr className="border-t">
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                            Chưa có lô nào
                                        </td>
                                    </tr>
                                )}

                                {lotList.map((lo) => (
                                    <tr key={lo.id} className="border-t">
                                        <td className="px-4 py-3">{lo.maLo}</td>
                                        <td className="px-4 py-3">{lo.nsx}</td>
                                        <td className="px-4 py-3 text-center">{lo.soLuong}</td>
                                        <td className="px-4 py-3">{lo.ghiChu}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button className="text-red-600 text-sm">
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* FORM THÊM LÔ */}
                    <section className="bg-white border rounded-xl shadow-sm p-4">
                        <h3 className="font-semibold mb-3">
                            Thêm / chỉnh sửa lô
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                                placeholder="Mã lô"
                                value={maLo}
                                onChange={(e) => setMaLo(e.target.value)}
                                className="h-11 px-3 border rounded-md"
                            />

                            <input
                                type="date"
                                value={nsx}
                                onChange={(e) => setNsx(e.target.value)}
                                className="h-11 px-3 border rounded-md"
                            />

                            <input
                                type="number"
                                placeholder="Số lượng"
                                value={soLuongNhap}
                                onChange={(e) => setSoLuongNhap(e.target.value)}
                                className="h-11 px-3 border rounded-md"
                            />

                            <input
                                placeholder="Ghi chú"
                                value={ghiChu}
                                onChange={(e) => setGhiChu(e.target.value)}
                                className="h-11 px-3 border rounded-md"
                            />
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            {(item.soLuongDaKhaiBao ?? 0) >= item.soLuongCanNhap && (
                                <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                                    Đã đủ số lượng lô bạn có thể chỉnh sửa lại thông tin lô nếu cần
                                </div>
                            )}
                            
                            <button
                                onClick={() => {
                                    setMaLo("");
                                    setNsx("");
                                    setSoLuongNhap("");
                                    setGhiChu("");
                                }}
                                className="px-4 py-2 border rounded-md"
                            >
                                Clear
                            </button>

                            <button
                                disabled={loading}
                                onClick={handleSaveLot}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                            >
                                Save Lot
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

/* ===== small components ===== */

function Info({ label, value, bold, className }) {
    return (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className={`${bold ? "font-semibold" : ""} ${className || ""}`}>
                {value}
            </div>
        </div>
    );
}
