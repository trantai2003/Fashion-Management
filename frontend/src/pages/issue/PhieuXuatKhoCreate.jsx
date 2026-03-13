import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { donBanHangService } from "@/services/donBanHangService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { getMineKhoList } from "@/services/khoService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, Warehouse, ArrowRightLeft, Package } from "lucide-react";

export default function PhieuXuatKhoCreate() {
    const navigate = useNavigate();
    
    // --- States cho Loại Xuất ---
    const [exportSource, setExportSource] = useState("SO"); // "SO" hoặc "TRANSFER"

    // --- Data States ---
    const [soList, setSoList] = useState([]);
    const [transferList, setTransferList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    
    const [selectedSO, setSelectedSO] = useState(null);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState(null);

    const [form, setForm] = useState({
        donBanHangId: "",
        transferId: "",
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
            // 1. Lấy danh sách kho
            const myWarehousesRes = await getMineKhoList();
            const warehouseList = myWarehousesRes.data || myWarehousesRes;
            setWarehouses(warehouseList);

            // 2. Lấy danh sách SO (Chờ xuất / Đang xuất)
            const soRes = await donBanHangService.filter({
                page: 0,
                size: 1000,
                filters: [{ fieldName: "trangThai", operation: "IN", value: [1, 2] }],
                sorts: [{ fieldName: "ngayDatHang", direction: "DESC" }]
            });
            setSoList(soRes.content || soRes.data?.content || []);

            // 3. Lấy danh sách Yêu cầu chuyển kho (Trạng thái 2 = Đã duyệt chờ xuất)
            const transferRes = await phieuChuyenKhoService.filter({
                page: 0,
                size: 1000,
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 2 }],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }]
            });
            setTransferList(transferRes.content || transferRes.data?.content || []);

            if (warehouseList.length === 1) {
                setForm(prev => ({ ...prev, khoId: warehouseList[0].id }));
            }

        } catch (e) {
            console.error("Lỗi khởi tạo màn hình phiếu xuất:", e);
            toast.error("Không thể tải dữ liệu khởi tạo");
        } finally {
            setLoading(false);
        }
    }

    // ===== HANDLE LỰA CHỌN ===== //
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
                toast.error("Đơn hàng này đã giao đủ số lượng.");
                return;
            }

            setSelectedSO(data);
            const targetKhoId = data.donBanHang?.khoXuat?.id || data.khoXuat?.id;

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

    async function handleSelectTransfer(transferId) {
        if (!transferId) {
            setSelectedTransfer(null);
            setForm({ ...form, transferId: "", chiTietXuat: [] });
            return;
        }
        try {
            const res = await phieuChuyenKhoService.getDetail(transferId);
            const data = res.data || res;
            setSelectedTransfer(data);
            setForm((prev) => ({
                ...prev,
                transferId: data.id,
                khoId: data.khoXuatId, // Tự động set kho xuất
            }));
        } catch (e) {
            toast.error("Không thể tải chi tiết yêu cầu chuyển kho");
        }
    }

    // ===== HANDLE TẠO PHIẾU ===== //
    async function createPhieu() {
        if (exportSource === "SO") {
            // Luồng SO (Bán hàng)
            const validLines = form.chiTietXuat.filter((ct) => ct.soLuongXuat > 0);
            if (!form.donBanHangId) return toast.error("Vui lòng chọn đơn bán"), null;
            if (!form.khoId) return toast.error("Vui lòng chọn kho xuất hàng"), null;
            if (validLines.length === 0) return toast.error("Phải có ít nhất 1 sản phẩm xuất > 0"), null;

            const payload = {
                donBanHangId: parseInt(form.donBanHangId),
                khoId: parseInt(form.khoId),
                ghiChu: form.ghiChu,
                chiTietXuat: validLines,
            };

            try {
                setLoading(true);
                const res = await phieuXuatKhoService.create(payload);
                setCreatedId(res.id);
                toast.success("Tạo phiếu xuất bán hàng thành công");
                return res.id;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Không thể tạo phiếu xuất");
                return null;
            } finally {
                setLoading(false);
            }
        } else {
            // Luồng TRANSFER (Chuyển kho) - Chỉ gọi API backend tự sinh phiếu
            if (!form.transferId) return toast.error("Vui lòng chọn yêu cầu chuyển kho"), null;
            try {
                setLoading(true);
                const res = await phieuChuyenKhoService.createExport(form.transferId);
                const newId = res.data?.id || res.id;
                setCreatedId(newId);
                toast.success("Khởi tạo phiếu xuất chuyển kho thành công");
                return newId;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Không thể tạo phiếu xuất chuyển kho");
                return null;
            } finally {
                setLoading(false);
            }
        }
    }

    async function handleSaveDraft() { await createPhieu(); }

    async function handleContinue() {
        let id = createdId || await createPhieu();
        if (id) navigate(`/goods-issues/${id}`);
    }

    // Reset form khi chuyển tab
    const toggleSource = (source) => {
        setExportSource(source);
        setSelectedSO(null);
        setSelectedTransfer(null);
        setForm({
            donBanHangId: "",
            transferId: "",
            khoId: warehouses.length === 1 ? warehouses[0].id : "",
            ghiChu: "",
            chiTietXuat: [],
        });
    };

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ===== BỘ CHUYỂN ĐỔI (TOGGLE) ===== */}
                <div className="flex p-1 bg-gray-200/60 rounded-xl w-fit shadow-inner">
                    <button
                        onClick={() => toggleSource("SO")}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2
                            ${exportSource === "SO" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <FileText className="w-4 h-4" />
                        Xuất theo Đơn Bán Hàng (SO)
                    </button>
                    <button
                        onClick={() => toggleSource("TRANSFER")}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2
                            ${exportSource === "TRANSFER" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Xuất Chuyển Kho Nội Bộ
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT PANEL */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                            
                            {/* Khối chọn Nguồn dựa vào Tab */}
                            {exportSource === "SO" ? (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Đơn bán hàng (SO)</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="mt-2 w-full justify-between font-normal bg-white border-gray-300 h-10">
                                                <div className="flex items-center overflow-hidden">
                                                    <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {form.donBanHangId
                                                            ? soList.find(so => so.id === parseInt(form.donBanHangId))?.soDonHang
                                                            : "Chọn đơn bán hàng"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto bg-white" align="start">
                                            {soList.length === 0 ? (
                                                <DropdownMenuItem disabled className="text-gray-500 italic">Không có đơn bán nào khả dụng</DropdownMenuItem>
                                            ) : (
                                                soList.map((so) => (
                                                    <DropdownMenuItem key={so.id} onClick={() => handleSelectSO(so.id)} className="cursor-pointer hover:bg-gray-100 py-2 flex flex-col items-start">
                                                        <span className="font-medium text-gray-900">{so.soDonHang}</span>
                                                        <span className="text-xs text-gray-500">{so.trangThai === 2 ? "Đang xuất dở" : "Chờ xuất kho"}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Yêu cầu chuyển kho</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="mt-2 w-full justify-between font-normal bg-white border-gray-300 h-10">
                                                <div className="flex items-center overflow-hidden">
                                                    <Package className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {form.transferId
                                                            ? transferList.find(t => t.id === parseInt(form.transferId))?.soPhieuXuat
                                                            : "Chọn yêu cầu chuyển kho"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto bg-white" align="start">
                                            {transferList.length === 0 ? (
                                                <DropdownMenuItem disabled className="text-gray-500 italic">Không có yêu cầu nào khả dụng</DropdownMenuItem>
                                            ) : (
                                                transferList.map((t) => (
                                                    <DropdownMenuItem key={t.id} onClick={() => handleSelectTransfer(t.id)} className="cursor-pointer hover:bg-gray-100 py-2 flex flex-col items-start">
                                                        <span className="font-medium text-gray-900">{t.soPhieuXuat}</span>
                                                        <span className="text-[10px] text-gray-500">Đến: {t.khoChuyenDen?.tenKho}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kho xuất hàng</label>
                                <Button variant="outline" disabled={true} className="mt-2 w-full justify-between font-bold bg-white border-gray-300 h-10 text-gray-700 disabled:opacity-80">
                                    <div className="flex items-center overflow-hidden">
                                        <Warehouse className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">
                                            {form.khoId ? warehouses.find(k => k.id === parseInt(form.khoId))?.tenKho : "Tự động trích xuất"}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                </Button>
                            </div>

                            {/* Ghi chú chỉ áp dụng cho SO vì Transfer sẽ tự sinh ghi chú ở Backend */}
                            {exportSource === "SO" && (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú</label>
                                    <textarea
                                        value={form.ghiChu}
                                        onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                        rows={3}
                                        className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none text-sm"
                                    />
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT PANEL - Bảng dữ liệu */}
                    <div className="lg:col-span-2">
                        
                        {/* HIỂN THỊ NẾU CHỌN SO */}
                        {exportSource === "SO" && selectedSO && (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Sản phẩm xuất bán</h3>
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
                                            {selectedSO.chiTiet.map((item) => {
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
                                                                type="number" min={0} max={conLai} disabled={conLai <= 0}
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
                        )}

                        {/* HIỂN THỊ NẾU CHỌN TRANSFER */}
                        {exportSource === "TRANSFER" && selectedTransfer && (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-purple-50/30">
                                    <div>
                                        <h3 className="font-semibold text-purple-900">Chi tiết yêu cầu điều chuyển</h3>
                                        <p className="text-[11px] text-gray-500 mt-1">Đích đến: <span className="font-bold text-gray-800">{selectedTransfer.khoNhapTen}</span></p>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600 border border-purple-200 bg-white px-2 py-1 rounded shadow-sm">
                                        {selectedTransfer.soPhieuXuat}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-5 py-3 text-left">Mặt hàng</th>
                                                <th className="px-5 py-3 text-center">SL Yêu cầu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedTransfer.items?.map((item) => (
                                                <tr key={item.bienTheId} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-gray-900">{item.tenSanPham}</div>
                                                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center font-bold text-lg text-purple-700">
                                                        {item.soLuongYeuCau}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* EMPTY STATE */}
                        {((exportSource === "SO" && !selectedSO) || (exportSource === "TRANSFER" && !selectedTransfer)) && (
                            <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-white">
                                <Package className="w-12 h-12 mb-3 text-gray-300" />
                                <p className="text-sm font-medium">
                                    Vui lòng chọn {exportSource === "SO" ? "đơn bán hàng" : "yêu cầu chuyển kho"} để tiếp tục
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                    <Link to="/goods-issues" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        ← Quay lại danh sách
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDraft}
                            disabled={loading || (exportSource === "SO" && !form.donBanHangId) || (exportSource === "TRANSFER" && !form.transferId)}
                            className="bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 h-11 px-8 rounded-xl font-medium transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : (exportSource === "SO" ? "Lưu nháp" : "Tạo phiếu")}
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={loading || (exportSource === "SO" && !form.donBanHangId) || (exportSource === "TRANSFER" && !form.transferId)}
                            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm h-11 px-8 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                            Tiếp tục bốc Lô →
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}