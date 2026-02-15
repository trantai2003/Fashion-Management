import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { donBanHangService } from "@/services/donBanHangService";
import { toast } from "sonner";

export default function PhieuXuatKhoCreate() {
    const navigate = useNavigate();
    const [soList, setSoList] = useState([]);
    const [selectedSO, setSelectedSO] = useState(null);
    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState(null);

    const [form, setForm] = useState({
        donBanHangId: "",
        ghiChu: "",
        chiTietXuat: [],
    });

    useEffect(() => {
        fetchSO();
    }, []);

    async function fetchSO() {
        try {
            const res = await donBanHangService.filter({
                page: 0,
                size: 50,
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 1 }],
            });
            setSoList(res.content || []);
        } catch (e) {
            toast.error("Không thể tải danh sách đơn bán");
        }
    }

    async function handleSelectSO(soId) {
        if (!soId) {
            setSelectedSO(null);
            setForm({ ...form, donBanHangId: "", chiTietXuat: [] });
            return;
        }
        try {
            const res = await donBanHangService.getDetail(soId);
            const data = res.data;
            setSelectedSO(data);
            setForm((prev) => ({
                ...prev,
                donBanHangId: data.donBanHang.id,
                chiTietXuat: data.chiTiet
                    .filter((ct) => ct.soLuongDat > ct.soLuongDaGiao)
                    .map((item) => ({
                        bienTheSanPhamId: item.bienTheSanPhamId,
                        soLuongXuat: item.soLuongDat - item.soLuongDaGiao,
                    })),
            }));
        } catch (e) {
            toast.error("Không thể tải chi tiết đơn bán");
        }
    }

    async function createPhieu() {
        const validLines = form.chiTietXuat.filter((ct) => ct.soLuongXuat > 0);
        if (!form.donBanHangId) {
            toast.error("Vui lòng chọn đơn bán");
            return null;
        }
        if (validLines.length === 0) {
            toast.error("Phải có ít nhất 1 sản phẩm xuất > 0");
            return null;
        }

        const payload = {
            donBanHangId: form.donBanHangId,
            ghiChu: form.ghiChu,
            chiTietXuat: validLines,
        };

        try {
            setLoading(true);
            const res = await phieuXuatKhoService.create(payload);
            setCreatedId(res.id);
            toast.success("Tạo phiếu xuất thành công");
            return res.id;
        } catch (e) {
            toast.error(e?.response?.data?.message || "Không thể tạo phiếu xuất");
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveDraft() { await createPhieu(); }

    async function handleContinue() {
        let id = createdId || await createPhieu();
        if (id) navigate(`/goods-issues/${id}`);
    }

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu xuất kho</h1>
                        <p className="text-sm text-gray-500 mt-1">Chọn đơn bán hàng để bắt đầu kê khai số lượng xuất.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Form Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sales Order</label>
                                <select
                                    value={form.donBanHangId}
                                    onChange={(e) => handleSelectSO(e.target.value)}
                                    className="mt-2 w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none text-sm"
                                >
                                    <option value="">-- Chọn đơn bán hàng --</option>
                                    {soList.map((so) => (
                                        <option key={so.id} value={so.id}>{so.soDonHang}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú phiếu xuất</label>
                                <textarea
                                    value={form.ghiChu}
                                    onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                    rows={4}
                                    placeholder="Lưu ý cho nhân viên kho..."
                                    className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none resize-none text-sm"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Table Items */}
                    <div className="lg:col-span-2">
                        {selectedSO ? (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Chi tiết sản phẩm</h3>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">
                                        {selectedSO.soDonHang}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-5 py-3 text-left">Sản phẩm</th>
                                                <th className="px-5 py-3 text-center">Đặt/Giao</th>
                                                <th className="px-5 py-3 text-right">SL Xuất</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedSO.chiTiet.map((item, idx) => {
                                                const conLai = item.soLuongDat - item.soLuongDaGiao;
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-gray-900">{item.tenSanPham}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{item.sku}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className="text-gray-900 font-medium">{item.soLuongDat}</span>
                                                            <span className="text-gray-400 mx-1">/</span>
                                                            <span className="text-gray-500">{item.soLuongDaGiao}</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={conLai}
                                                                value={form.chiTietXuat[idx]?.soLuongXuat || 0}
                                                                onChange={(e) => {
                                                                    const value = Number(e.target.value);
                                                                    const next = [...form.chiTietXuat];
                                                                    next[idx].soLuongXuat = value;
                                                                    setForm({ ...form, chiTietXuat: next });
                                                                }}
                                                                className="w-20 h-9 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-purple-500 outline-none"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        ) : (
                            <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 space-y-2">
                                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d=" departments 9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p>Vui lòng chọn đơn bán hàng để hiển thị chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action Sticky-like */}
                <div className="pt-6 border-t border-gray-200 flex justify-between gap-2">
                    <Link to="/goods-issues" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                        ← Quay lại danh sách
                    </Link>
                    <div className="flex gap-3">
                    <button
                        onClick={handleSaveDraft}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all disabled:opacity-50"
                    >
                        {loading ? "Đang lưu..." : "Lưu nháp"}
                    </button>
                    <button
                        onClick={handleContinue}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Tiếp tục
                    </button>
                    </div>
                </div>
            </div>
        </main>
    );
}