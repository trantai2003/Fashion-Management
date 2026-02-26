import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { donBanHangService } from "@/services/donBanHangService";
import { khoService } from "@/services/khoService"; 
import { toast } from "sonner";

export default function PhieuXuatKhoCreate() {
    const navigate = useNavigate();
    const [soList, setSoList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedSO, setSelectedSO] = useState(null);
    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState(null);

    const [form, setForm] = useState({
        donBanHangId: "",
        khoId: "",
        ghiChu: "",
        chiTietXuat: [],
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const [soRes, khoRes] = await Promise.all([
                donBanHangService.filter({
                    page: 0,
                    size: 100,
                    filters: [
                        { 
                            fieldName: "trangThai", 
                            operation: "IN", 
                            value: [1, 2]
                        }
                    ],
                    sorts: [{ fieldName: "ngayDatHang", direction: "DESC" }]
                }),
                khoService.filter({
                    page: 0,
                    size: 100,
                    filters: [],
                })
            ]);
            const availableSOs = (soRes.content || []).filter(so => {
                return true; 
            });

            setSoList(availableSOs);
            
            const listKho = khoRes.data?.content || khoRes.data?.data?.content || [];
            setWarehouses(listKho);

            if (listKho.length === 1) {
                setForm(prev => ({ ...prev, khoId: listKho[0].id }));
            }
        } catch (e) {
            toast.error("Không thể tải dữ liệu khởi tạo");
        } finally {
            setLoading(false);
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
            const hasRemaining = data.chiTiet.some(ct => ct.soLuongDat > ct.soLuongDaGiao);
            
            if (!hasRemaining) {
                toast.error("Đơn hàng này đã giao đủ số lượng, không thể tạo thêm phiếu xuất.");
                return;
            }

            setSelectedSO(data);
            
            const targetKhoId = data.donBanHang?.khoXuat?.id || form.khoId;

            setForm((prev) => ({
                ...prev,
                donBanHangId: data.donBanHang.id,
                khoId: targetKhoId,
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
        
        if (!form.donBanHangId) return toast.error("Vui lòng chọn đơn bán"), null;
        if (!form.khoId) return toast.error("Vui lòng chọn kho xuất hàng"), null;
        if (validLines.length === 0) return toast.error("Phải có ít nhất 1 sản phẩm xuất > 0"), null;

        const payload = {
            donBanHangId: form.donBanHangId,
            khoId: form.khoId,
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
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tạo phiếu xuất kho</h1>
                        <p className="text-sm text-gray-500 mt-1">Chọn đơn bán (Chờ xuất/Đang xuất) và kho hàng để thực hiện.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Đơn bán hàng (SO)</label>
                                <select
                                    value={form.donBanHangId}
                                    onChange={(e) => handleSelectSO(e.target.value)}
                                    className="mt-2 w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm"
                                >
                                    <option value="">-- Chọn đơn bán hàng --</option>
                                    {soList.map((so) => (
                                        <option key={so.id} value={so.id}>
                                            {so.soDonHang} {so.trangThai === 2 ? "(Đang xuất)" : "(Mới)"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kho xuất hàng</label>
                                <select
                                    value={form.khoId}
                                    onChange={(e) => setForm({ ...form, khoId: e.target.value })}
                                    disabled={selectedSO?.donBanHang?.khoXuat}
                                    className="mt-2 w-full h-10 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none text-sm disabled:opacity-60"
                                >
                                    <option value="">-- Chọn kho hàng --</option>
                                    {warehouses.map((k) => (
                                        <option key={k.id} value={k.id}>{k.tenKho}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú</label>
                                <textarea
                                    value={form.ghiChu}
                                    onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                    rows={3}
                                    className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none text-sm"
                                />
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-2">
                        {selectedSO ? (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Sản phẩm xuất</h3>
                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                        {selectedSO.soDonHang}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-5 py-3 text-left">Mặt hàng</th>
                                                <th className="px-5 py-3 text-center">Đặt / Giao</th>
                                                <th className="px-5 py-3 text-right">SL Xuất</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedSO.chiTiet.map((item, idx) => {
                                                const conLai = item.soLuongDat - item.soLuongDaGiao;
                                                const formItemIdx = form.chiTietXuat.findIndex(f => f.bienTheSanPhamId === item.bienTheSanPhamId);
                                                
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-gray-900">{item.tenSanPham}</div>
                                                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className="text-gray-900">{item.soLuongDat}</span>
                                                            <span className="text-gray-300 mx-1">/</span>
                                                            <span className="text-green-600 font-medium">{item.soLuongDaGiao}</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={conLai}
                                                                disabled={conLai <= 0}
                                                                value={formItemIdx !== -1 ? form.chiTietXuat[formItemIdx]?.soLuongXuat : 0}
                                                                onChange={(e) => {
                                                                    const value = Number(e.target.value);
                                                                    const next = [...form.chiTietXuat];
                                                                    if (formItemIdx !== -1) {
                                                                        next[formItemIdx].soLuongXuat = value;
                                                                        setForm({ ...form, chiTietXuat: next });
                                                                    }
                                                                }}
                                                                className="w-20 h-9 border border-gray-300 rounded-md text-center focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100"
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
                            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-white">
                                <p className="text-sm font-medium">Vui lòng chọn đơn bán để kê khai</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                    <Link to="/goods-issues" className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
                            disabled={loading || !form.khoId}
                            className="px-8 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}