import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";

// Tách hằng số mặc định để dễ reset
const DEFAULT_FORM = {
    maLo: "",
    nsx: "",
    soLuongNhap: "",
    ghiChu: ""
};

export default function KhaiBaoLo() {
    const { phieuNhapKhoId, bienTheSanPhamId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const [lotList, setLotList] = useState([]);

    // Gom nhóm form state để quản lý gọn hơn
    const [form, setForm] = useState(DEFAULT_FORM);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedLot, setSelectedLot] = useState(null);

    const resetForm = useCallback(() => setForm(DEFAULT_FORM), []);
    const isCompleted = detail?.phieu?.trangThai === 1;
    const isCancelled = detail?.phieu?.trangThai === 2;

    const fetchDetail = useCallback(async () => {
        try {
            // Fetch song song để tối ưu tốc độ
            const [resDetail, resLots] = await Promise.all([
                phieuNhapKhoService.getDetail(phieuNhapKhoId),
                phieuNhapKhoService.getLotInput(phieuNhapKhoId, Number(bienTheSanPhamId))
            ]);

            const item = resDetail.items.find(i => i.bienTheSanPhamId === Number(bienTheSanPhamId));

            if (!item) {
                toast.error("Không tìm thấy biến thể trong phiếu nhập");
                return navigate(-1);
            }

            setDetail({ phieu: resDetail, item });
            setLotList(Array.isArray(resLots?.data) ? resLots.data : []);
        } catch (e) {
            toast.error("Lỗi khi tải dữ liệu");
            console.error(e);
        }
    }, [phieuNhapKhoId, bienTheSanPhamId, navigate]);

    useEffect(() => {
        fetchDetail();
        resetForm(); // Reset form mỗi khi đổi sản phẩm
    }, [fetchDetail, resetForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    async function handleSaveLot() {
        const { maLo, soLuongNhap, nsx, ghiChu } = form;
        if (!maLo || !soLuongNhap) {
            return toast.error("Vui lòng nhập mã lô và số lượng");
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
            await fetchDetail();
            resetForm();
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể khai báo lô");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (!selectedLot) return;
        try {
            await phieuNhapKhoService.deleteLo(phieuNhapKhoId, selectedLot.chiTietPhieuNhapKhoId);
            toast.success("Xoá lô thành công");
            await fetchDetail();
            setShowDeleteConfirm(false);
            setSelectedLot(null);
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể xoá lô");
        }
    }

    if (!detail) return <div className="p-10 text-center">Loading...</div>;

    const { item } = detail;
    const isEnough = (item.soLuongDaKhaiBao ?? 0) >= item.soLuongCanNhap;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link to={`/goods-receipts/${phieuNhapKhoId}`} className="text-sm text-gray-500 hover:text-gray-900">
                        ← Back to Receipt Detail
                    </Link>
                    <span className="text-sm text-gray-500">
                        Tổng số lượng lô phải = <strong>{item.soLuongCanNhap}</strong>
                    </span>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                    {/* THÔNG TIN SẢN PHẨM */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4">Thông tin sản phẩm</h2>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                            <Info label="SKU" value={item.sku} bold />
                            <Info label="Tên biến thể" value={item.tenBienThe} />
                            <Info label="Số lượng cần nhập" value={item.soLuongCanNhap} bold />
                            <Info
                                label="Đã khai báo lô"
                                value={`${item.soLuongDaKhaiBao ?? 0} / ${item.soLuongCanNhap}`}
                                className={isEnough ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                            />
                        </div>
                    </section>

                    {/* DANH SÁCH LÔ */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 font-semibold border-b">Danh sách lô đã khai báo</div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Mã lô</th>
                                    <th className="px-4 py-3 text-center">NSX</th>
                                    <th className="px-4 py-3 text-center">Số lượng</th>
                                    <th className="px-4 py-3 text-center">Ghi chú</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {lotList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400">Chưa có lô nào</td>
                                    </tr>
                                ) : (
                                    lotList.map((lo) => (
                                        <tr key={lo.loHangId} className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setForm({
                                                maLo: lo.maLo,
                                                nsx: lo.ngaySanXuat?.slice(0, 10) || "",
                                                soLuongNhap: lo.soLuongNhap,
                                                ghiChu: lo.ghiChu || ""
                                            })}>
                                            <td className="px-4 py-3 font-medium">{lo.maLo}</td>
                                            <td className="px-4 py-3 text-center">
                                                {lo.ngaySanXuat ? new Date(lo.ngaySanXuat).toLocaleDateString("vi-VN") : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center">{lo.soLuongNhap}</td>
                                            <td className="px-4 py-3 text-center text-gray-500">{lo.ghiChu || "-"}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    className={`text-sm ${isCompleted
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-red-600 hover:text-red-800"
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        if (isCompleted) {
                                                            toast.error("Không thể xoá lô vì phiếu nhập đã hoàn thành");
                                                            return;
                                                        }
                                                        setSelectedLot(lo);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>

                    {/* FORM THÊM LÔ */}
                    {!isCompleted && (
                        <section className="bg-white border rounded-xl shadow-sm p-4">
                            <h3 className="font-semibold mb-3">Thêm / chỉnh sửa lô</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input name="maLo" placeholder="Mã lô" value={form.maLo} onChange={handleInputChange} className="h-11 px-3 border rounded-md" />
                                <input name="nsx" type="date" value={form.nsx} onChange={handleInputChange} className="h-11 px-3 border rounded-md" />
                                <input name="soLuongNhap" type="number" placeholder="Số lượng" value={form.soLuongNhap} onChange={handleInputChange} className="h-11 px-3 border rounded-md" />
                                <input name="ghiChu" placeholder="Ghi chú" value={form.ghiChu} onChange={handleInputChange} className="h-11 px-3 border rounded-md" />
                            </div>

                            <div className="mt-4 flex justify-end items-center gap-3">
                                {isEnough && (
                                    <span className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                                        Đã khai báo đủ số lượng - Có thể chỉnh sửa nếu cần
                                    </span>
                                )}
                                <button onClick={resetForm} className="px-4 py-2 border rounded-md hover:bg-gray-50">Clear</button>
                                <button
                                    disabled={loading}
                                    onClick={handleSaveLot}
                                    className={`px-4 py-2 rounded-md text-white ${loading ? "bg-gray-300" : "bg-purple-600 hover:bg-purple-700"}`}
                                >
                                    {loading ? "Saving..." : "Save Lot"}
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* MODAL DELETE */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                            <h2 className="text-lg font-semibold mb-2">Xác nhận xoá lô</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Bạn chắc chắn muốn xoá lô
                                <strong className="mx-1">{selectedLot.maLo}</strong>
                                ?
                            </p>

                            <ul className="text-sm text-gray-600 list-disc pl-5 mb-4 space-y-1">
                                <li>Lô hàng sẽ bị xoá hoàn toàn</li>
                                <li>Số lượng đã khai báo sẽ được trừ lại</li>
                                <li>Hành động này không thể hoàn tác</li>
                            </ul>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-md text-sm">Hủy</button>
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700">Xóa lô</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function Info({ label, value, bold, className }) {
    return (
        <div>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className={`${bold ? "font-semibold" : ""} ${className || ""}`}>{value}</div>
        </div>
    );
}