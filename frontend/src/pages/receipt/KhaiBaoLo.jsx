import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { toast } from "sonner";

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

    const [form, setForm] = useState(DEFAULT_FORM);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedLot, setSelectedLot] = useState(null);

    const resetForm = useCallback(() => setForm(DEFAULT_FORM), []);

    // LOGIC KIỂM SOÁT QUYỀN CHỈNH SỬA
    const checkIsEditable = () => {
        if (!detail?.phieu) return false;
        
        // 1. Kiểm tra trạng thái phiếu (Chỉ Nháp = 0 mới được sửa)
        const isDraft = detail.phieu.trangThai === 0;
        
        // 2. Kiểm tra loại nghiệp vụ (Chuyển kho/Hoàn trả = Lô tự động -> Không được sửa)
        const loaiNhap = detail.phieu.loaiNhap || "";
        const isAutoLot = loaiNhap.includes("Chuyển kho") || loaiNhap.includes("hoàn trả");

        return isDraft && !isAutoLot;
    };

    const isEditable = checkIsEditable();
    const isAutoLotMode = detail?.phieu?.loaiNhap?.includes("Chuyển kho") || detail?.phieu?.loaiNhap?.includes("hoàn trả");

    const fetchDetail = useCallback(async () => {
        try {
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
        resetForm();
    }, [fetchDetail, resetForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    async function handleSaveLot() {
        if (!isEditable) {
            return toast.error("Phiếu này sử dụng lô hàng tự động hoặc đã khóa, không thể chỉnh sửa");
        }

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
        if (!isEditable) return;
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
                    <Link to={`/goods-receipts/${phieuNhapKhoId}`} className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
                        ← Quay lại chi tiết phiếu
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                            Số lượng cần nhập: <strong className="text-gray-900">{item.soLuongCanNhap}</strong>
                        </span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
                    {/* THÔNG TIN BIẾN THỂ */}
                    <section className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4 tracking-wider text-gray-500 uppercase">Thông tin biến thể</h2>
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                            <Info label="SKU" value={item.sku} bold />
                            <Info label="Tên biến thể" value={item.tenBienThe} />
                            <Info label="Cần nhập" value={item.soLuongCanNhap} bold />
                            <Info
                                label="Trạng thái khai báo"
                                value={`${isAutoLotMode ? item.soLuongCanNhap : (item.soLuongDaKhaiBao ?? 0)} / ${item.soLuongCanNhap}`}
                                className={(isEnough || isAutoLotMode) ? "text-green-600 font-bold" : "text-red-600 font-bold"}
                            />
                        </div>
                    </section>

                    {/* DANH SÁCH LÔ */}
                    <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 font-semibold border-b bg-gray-50 flex justify-between items-center">
                            <span>Danh sách lô hàng</span>
                            {!isEditable && (
                                <span className="text-[11px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
                                    {isAutoLotMode ? "LÔ TỰ ĐỘNG - CHẾ ĐỘ XEM" : "PHIẾU ĐÃ KHÓA - CHẾ ĐỘ XEM"}
                                </span>
                            )}
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
                                <tr>
                                    <th className="px-4 py-3 text-left">Mã lô</th>
                                    <th className="px-4 py-3 text-center">Ngày SX</th>
                                    <th className="px-4 py-3 text-center">Số lượng</th>
                                    <th className="px-4 py-3 text-center">Ghi chú</th>
                                    <th className="px-4 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {lotList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-10 text-center text-gray-400 italic">Chưa có dữ liệu lô hàng</td>
                                    </tr>
                                ) : (
                                    lotList.map((lo) => (
                                        <tr key={lo.loHangId} 
                                            className={`hover:bg-gray-50 transition-colors ${isEditable ? 'cursor-pointer' : ''}`}
                                            onClick={() => {
                                                if (isEditable) {
                                                    setForm({
                                                        maLo: lo.maLo,
                                                        nsx: lo.ngaySanXuat?.slice(0, 10) || "",
                                                        soLuongNhap: lo.soLuongNhap,
                                                        ghiChu: lo.ghiChu || ""
                                                    });
                                                }
                                            }}>
                                            <td className="px-4 py-3 font-medium text-purple-700">{lo.maLo}</td>
                                            <td className="px-4 py-3 text-center">
                                                {lo.ngaySanXuat ? new Date(lo.ngaySanXuat).toLocaleDateString("vi-VN") : "-"}
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold">{lo.soLuongNhap}</td>
                                            <td className="px-4 py-3 text-center text-gray-500">{lo.ghiChu || "-"}</td>
                                            <td className="px-4 py-3 text-right">
                                                {isEditable ? (
                                                    <button
                                                        className="text-red-600 hover:text-red-800 text-xs font-bold"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedLot(lo);
                                                            setShowDeleteConfirm(true);
                                                        }}
                                                    >
                                                        XÓA
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Không thể xóa</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>

                    {/* FORM THÊM LÔ: Ẩn hoàn toàn nếu là Lô tự động hoặc Phiếu đã khóa */}
                    {isEditable ? (
                        <section className="bg-white border rounded-xl shadow-sm p-4 border-purple-100">
                            <h3 className="font-semibold mb-3 text-purple-800">Thêm / Cập nhật lô hàng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 ">Mã lô</label>
                                    <input name="maLo" placeholder="Ví dụ: LO-001" value={form.maLo} onChange={handleInputChange} className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 ">Ngày sản xuất</label>
                                    <input name="nsx" type="date" value={form.nsx} onChange={handleInputChange} className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 ">Số lượng</label>
                                    <input name="soLuongNhap" type="number" placeholder="0" value={form.soLuongNhap} onChange={handleInputChange} className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-500 ">Ghi chú</label>
                                    <input name="ghiChu" placeholder="..." value={form.ghiChu} onChange={handleInputChange} className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end items-center gap-3">
                                {isEnough && (
                                    <span className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200 font-medium">
                                        ✓ Đã khai báo đủ số lượng cần thiết
                                    </span>
                                )}
                                <button onClick={resetForm} className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">Làm mới</button>
                                <button
                                    disabled={loading}
                                    onClick={handleSaveLot}
                                    className={`px-6 py-2 rounded-md text-white text-sm font-bold shadow-md transition-all 
                                        ${loading ? "bg-gray-300" : "bg-purple-600 hover:bg-purple-700 active:scale-95"}`}
                                >
                                    {loading ? "Đang lưu..." : "Lưu lô hàng"}
                                </button>
                            </div>
                        </section>
                    ) : (
                        <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm flex items-center gap-3">
                            <div className="bg-blue-600 text-white p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            </div>
                            <span>
                                {isAutoLotMode 
                                    ? "Lô hàng cho sản phẩm này đã được hệ thống kế thừa tự động từ phiếu xuất kho. Bạn không cần thực hiện khai báo thủ công." 
                                    : "Phiếu đã được xử lý hoặc bị hủy, không thể chỉnh sửa dữ liệu lô hàng."}
                            </span>
                        </div>
                    )}
                </div>

                {/* MODAL DELETE */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-lg font-bold mb-2">Xác nhận xoá lô</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Bạn chắc chắn muốn xoá lô <strong className="text-red-600">{selectedLot?.maLo}</strong>? 
                                Hành động này sẽ trừ số lượng đã khai báo của biến thể này.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Hủy</button>
                                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700">XÓA NGAY</button>
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
        <div className="space-y-1">
            <div className="text-[11px] text-gray-400 tracking-wider uppercase font-bold">{label}</div>
            <div className={`${bold ? "font-bold text-gray-900 text-base" : "text-gray-700"} ${className || ""}`}>{value || "---"}</div>
        </div>
    );
}