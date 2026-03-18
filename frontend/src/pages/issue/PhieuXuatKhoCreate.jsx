import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { phieuXuatKhoService } from "@/services/phieuXuatKhoService";
import { donBanHangService } from "@/services/donBanHangService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import { getMineKhoList } from "@/services/khoService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronDown, FileText, Warehouse, ArrowRightLeft, Package,
    ArrowLeft, Loader2, ClipboardList,
} from "lucide-react";

export default function PhieuXuatKhoCreate() {
    const navigate = useNavigate();

    const [exportSource, setExportSource] = useState("SO");
    const [soList, setSoList] = useState([]);
    const [transferList, setTransferList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedSO, setSelectedSO] = useState(null);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState(null);
    const [form, setForm] = useState({
        donBanHangId: "", transferId: "", khoId: "", ghiChu: "", chiTietXuat: [],
    });

    useEffect(() => { fetchInitialData(); }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const myWarehousesRes = await getMineKhoList();
            const warehouseList = myWarehousesRes.data || myWarehousesRes;
            setWarehouses(warehouseList);
            const myWarehouseIds = warehouseList.map(w => w.id);

            // 1. Tải danh sách Đơn Bán Hàng
            const soRes = await donBanHangService.filter({
                page: 0, size: 1000,
                filters: [{ fieldName: "trangThai", operation: "IN", value: [1, 2] }],
                sorts: [{ fieldName: "ngayDatHang", direction: "DESC" }],
            });
            setSoList(soRes.content || soRes.data?.content || []);

            // 2. Tải danh sách Phiếu Chuyển Kho
            const transferRes = await phieuChuyenKhoService.filter({
                page: 0, size: 1000,
                filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 2 }],
                sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
            });

            // 3. Tải danh sách Phiếu Xuất Kho (Bỏ filter NOT_IN để tránh lỗi Backend)
            const exportsRes = await phieuXuatKhoService.filter({
                page: 0, size: 10000
                // Không truyền filter trạng thái từ Frontend nữa
            });
            
            const allExportsRaw = exportsRes.content || exportsRes.data?.content || [];
            
            // Lọc bỏ các phiếu đã hủy (trạng thái = 4) bằng JavaScript
            const allExports = allExportsRaw.filter(pxk => pxk.trangThai !== 4);

            // Trích xuất ra mảng ID của các phiếu chuyển đã được tạo phiếu xuất
            // LƯU Ý: Đảm bảo 'phieuChuyenKhoGocId' là đúng tên trường từ API trả về
            const usedTransferIds = allExports
                .map(pxk => pxk.phieuChuyenKhoGocId || pxk.phieuChuyenId || pxk.transferId)
                .filter(Boolean); // Lọc bỏ null/undefined

            // 4. Lọc phiếu chuyển kho
            const allTransfers = transferRes.content || transferRes.data?.content || [];
            const validTransfers = allTransfers.filter(t => {
                const idKhoXuat = t.kho?.id;
                if (!idKhoXuat) return false;

                // Điều kiện 1: Thuộc kho của tôi
                const isMyWarehouse = myWarehouseIds.map(Number).includes(Number(idKhoXuat));

                // Điều kiện 2: Chưa bị tạo phiếu xuất trước đó (ID không nằm trong mảng usedTransferIds)
                const isNotDuplicated = !usedTransferIds.includes(t.id);

                return isMyWarehouse && isNotDuplicated;
            });

            setTransferList(validTransfers);

            if (warehouseList.length === 1)
                setForm(prev => ({ ...prev, khoId: warehouseList[0].id }));
        } catch {
            toast.error("Không thể tải dữ liệu khởi tạo");
        } finally {
            setLoading(false);
        }
    }

    async function handleSelectSO(soId) {
        if (!soId) { setSelectedSO(null); setForm({ ...form, donBanHangId: "", chiTietXuat: [] }); return; }
        try {
            const res = await donBanHangService.getDetail(soId);
            const data = res.data;
            if (!data.chiTiet.some(ct => ct.soLuongDat > ct.soLuongDaGiao)) {
                toast.error("Đơn hàng này đã giao đủ số lượng."); return;
            }
            setSelectedSO(data);
            setForm(prev => ({
                ...prev,
                donBanHangId: data.donBanHang.id,
                khoId: data.donBanHang?.khoXuat?.id || data.khoXuat?.id,
                chiTietXuat: data.chiTiet
                    .filter(ct => ct.soLuongDat > ct.soLuongDaGiao)
                    .map(item => ({ bienTheSanPhamId: item.bienTheSanPhamId, soLuongXuat: item.soLuongDat - item.soLuongDaGiao })),
            }));
        } catch { toast.error("Không thể tải chi tiết đơn bán"); }
    }

    async function handleSelectTransfer(transferId) {
        if (!transferId) { setSelectedTransfer(null); setForm({ ...form, transferId: "", chiTietXuat: [] }); return; }
        try {
            const res = await phieuChuyenKhoService.getDetail(transferId);
            const data = res.data || res;
            setSelectedTransfer(data);
            setForm(prev => ({ ...prev, transferId: data.id, khoId: data.khoXuatId }));
        } catch { toast.error("Không thể tải chi tiết yêu cầu chuyển kho"); }
    }

    async function createPhieu() {
        if (exportSource === "SO") {
            const validLines = form.chiTietXuat.filter(ct => ct.soLuongXuat > 0);
            if (!form.donBanHangId) return toast.error("Vui lòng chọn đơn bán"), null;
            if (!form.khoId) return toast.error("Vui lòng chọn kho xuất hàng"), null;
            if (validLines.length === 0) return toast.error("Phải có ít nhất 1 sản phẩm xuất > 0"), null;
            try {
                setLoading(true);
                const res = await phieuXuatKhoService.create({
                    donBanHangId: parseInt(form.donBanHangId),
                    khoId: parseInt(form.khoId),
                    ghiChu: form.ghiChu,
                    chiTietXuat: validLines,
                });
                setCreatedId(res.id);
                toast.success("Tạo phiếu xuất bán hàng thành công");
                return res.id;
            } catch (e) { toast.error(e?.response?.data?.message || "Không thể tạo phiếu xuất"); return null; }
            finally { setLoading(false); }
        } else {
            if (!form.transferId) return toast.error("Vui lòng chọn yêu cầu chuyển kho"), null;
            try {
                setLoading(true);
                const res = await phieuChuyenKhoService.createExport(form.transferId);
                const newId = res.data?.id || res.id;
                setCreatedId(newId);
                toast.success("Khởi tạo phiếu xuất chuyển kho thành công");
                return newId;
            } catch (e) { toast.error(e?.response?.data?.message || "Không thể tạo phiếu xuất chuyển kho"); return null; }
            finally { setLoading(false); }
        }
    }

    async function handleSaveDraft() { await createPhieu(); }
    async function handleContinue() {
        const id = createdId || await createPhieu();
        if (id) navigate(`/goods-issues/${id}`);
    }

    const toggleSource = (source) => {
        setExportSource(source);
        setSelectedSO(null);
        setSelectedTransfer(null);
        setForm({ donBanHangId: "", transferId: "", khoId: warehouses.length === 1 ? warehouses[0].id : "", ghiChu: "", chiTietXuat: [] });
    };

    const soLabel = form.donBanHangId ? soList.find(so => so.id === parseInt(form.donBanHangId))?.soDonHang : "Chọn đơn bán hàng";
    const transferLabel = form.transferId ? transferList.find(t => t.id === parseInt(form.transferId))?.soPhieuXuat : "Chọn yêu cầu chuyển kho";
    const khoLabel = form.khoId ? warehouses.find(k => k.id === parseInt(form.khoId))?.tenKho : "Tự động trích xuất";

    return (
        <div className="lux-sync warehouse-unified p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate("/goods-issues")}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors duration-150"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </button>

                    {/* Tab toggle */}
                    <div className="flex p-1 bg-white rounded-xl shadow-sm ring-1 ring-slate-200/80">
                        <button
                            onClick={() => toggleSource("SO")}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-150 ${exportSource === "SO"
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Xuất theo Đơn Bán Hàng
                        </button>
                        <button
                            onClick={() => toggleSource("TRANSFER")}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all duration-150 ${exportSource === "TRANSFER"
                                ? "bg-slate-900 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Xuất Chuyển Kho Nội Bộ
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT: Thông tin lộ trình ── */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100">
                                    <ClipboardList className="h-4 w-4 text-violet-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 leading-snug">Thông tin phiếu xuất</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {exportSource === "SO" ? "Chọn đơn bán hàng và kho xuất" : "Chọn yêu cầu chuyển kho"}
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Nguồn */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        {exportSource === "SO" ? "Đơn bán hàng (SO)" : "Yêu cầu chuyển kho"}
                                    </label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200 h-10">
                                                <div className="flex items-center overflow-hidden">
                                                    {exportSource === "SO"
                                                        ? <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                        : <Package className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    }
                                                    <span className="truncate text-sm">
                                                        {exportSource === "SO" ? soLabel : transferLabel}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[280px] max-h-[300px] overflow-y-auto bg-white border border-gray-100 shadow-xl z-50">
                                            {exportSource === "SO" ? (
                                                soList.length === 0 ? (
                                                    <DropdownMenuItem disabled className="text-gray-500 italic">Không có đơn bán nào khả dụng</DropdownMenuItem>
                                                ) : soList.map(so => (
                                                    <DropdownMenuItem key={so.id} onClick={() => handleSelectSO(so.id)} className="cursor-pointer hover:bg-violet-50 py-2 flex flex-col items-start">
                                                        <span className="font-medium text-gray-900">{so.soDonHang}</span>
                                                        <span className="text-xs text-gray-500">{so.trangThai === 2 ? "Đang xuất dở" : "Chờ xuất kho"}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            ) : (
                                                transferList.length === 0 ? (
                                                    <DropdownMenuItem disabled className="text-gray-500 italic">Không có yêu cầu nào khả dụng</DropdownMenuItem>
                                                ) : transferList.map(t => (
                                                    <DropdownMenuItem key={t.id} onClick={() => handleSelectTransfer(t.id)} className="cursor-pointer hover:bg-violet-50 py-2 flex flex-col items-start">
                                                        <span className="font-medium text-gray-900">{t.soPhieuXuat}</span>
                                                        <span className="text-xs text-gray-500">Đến: {t.khoChuyenDen?.tenKho}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Kho xuất */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kho xuất hàng</label>
                                    <Button variant="outline" disabled className="w-full justify-between font-semibold bg-slate-50 border-gray-200 h-10 text-slate-700 disabled:opacity-80">
                                        <div className="flex items-center overflow-hidden">
                                            <Warehouse className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                            <span className="truncate text-sm">{khoLabel}</span>
                                        </div>
                                    </Button>
                                </div>

                                {/* Ghi chú */}
                                {exportSource === "SO" && (
                                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú</label>
                                        <textarea
                                            value={form.ghiChu}
                                            onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none text-sm"
                                            placeholder="Ghi chú thêm (nếu có)..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Bảng sản phẩm ── */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden min-h-[360px]">
                            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                                    <Package className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 leading-snug">
                                        {exportSource === "SO" ? "Sản phẩm xuất bán" : "Chi tiết yêu cầu điều chuyển"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">Danh sách hàng hóa cần xuất kho</p>
                                </div>
                                {(exportSource === "SO" ? selectedSO?.soDonHang : selectedTransfer?.soPhieuXuat) && (
                                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                                        {exportSource === "SO" ? selectedSO?.soDonHang : selectedTransfer?.soPhieuXuat}
                                    </span>
                                )}
                            </div>

                            {/* Empty state */}
                            {((exportSource === "SO" && !selectedSO) || (exportSource === "TRANSFER" && !selectedTransfer)) && (
                                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                                        <Package className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800">Chưa có dữ liệu</h3>
                                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                        Vui lòng chọn {exportSource === "SO" ? "đơn bán hàng" : "yêu cầu chuyển kho"} để xem danh sách sản phẩm.
                                    </p>
                                </div>
                            )}

                            {/* SO table */}
                            {exportSource === "SO" && selectedSO && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Mặt hàng</th>
                                                <th className="h-12 px-4 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Đặt / Giao</th>
                                                <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">SL Xuất</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedSO.chiTiet.map((item) => {
                                                const conLai = item.soLuongDat - item.soLuongDaGiao;
                                                const formItemIdx = form.chiTietXuat.findIndex(f => f.bienTheSanPhamId === item.bienTheSanPhamId);
                                                return (
                                                    <tr key={item.id} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                        <td className="px-4 py-3.5 align-middle">
                                                            <span className="font-semibold text-slate-900">{item.tenSanPham}</span>
                                                            <span className="block font-mono text-xs text-slate-400 mt-0.5">{item.sku}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 align-middle text-center">
                                                            <span className="text-slate-700">{item.soLuongDat}</span>
                                                            <span className="text-slate-300 mx-1">/</span>
                                                            <span className="text-emerald-600 font-medium">{item.soLuongDaGiao}</span>
                                                        </td>
                                                        <td className="px-4 py-3.5 align-middle text-right">
                                                            <input
                                                                type="number" min={0} max={conLai} disabled={conLai <= 0}
                                                                value={formItemIdx !== -1 ? form.chiTietXuat[formItemIdx]?.soLuongXuat : 0}
                                                                onChange={(e) => {
                                                                    const next = [...form.chiTietXuat];
                                                                    if (formItemIdx !== -1) { next[formItemIdx].soLuongXuat = Number(e.target.value); setForm({ ...form, chiTietXuat: next }); }
                                                                }}
                                                                className="w-24 h-9 border border-gray-200 rounded-lg text-center font-semibold focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all ml-auto disabled:bg-slate-50"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Transfer table */}
                            {exportSource === "TRANSFER" && selectedTransfer && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50">
                                                <th className="h-12 px-4 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">Mặt hàng</th>
                                                <th className="h-12 px-4 text-right font-semibold text-slate-600 tracking-wide text-xs uppercase whitespace-nowrap">SL Yêu cầu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedTransfer.items?.map((item) => (
                                                <tr key={item.bienTheId} className="transition-colors duration-150 hover:bg-violet-50/50">
                                                    <td className="px-4 py-3.5 align-middle">
                                                        <span className="font-semibold text-slate-900">{item.tenSanPham}</span>
                                                        <span className="block font-mono text-xs text-slate-400 mt-0.5">{item.sku}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 align-middle text-right">
                                                        <span className="inline-flex items-center justify-end rounded-lg bg-slate-100 px-2.5 py-1">
                                                            <span className="font-semibold text-slate-800 text-xs">{item.soLuongYeuCau}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Footer */}
                            {((exportSource === "SO" && selectedSO) || (exportSource === "TRANSFER" && selectedTransfer)) && (
                                <div className="flex items-center justify-between px-6 py-5 bg-slate-50 border-t border-slate-100">
                                    <p className="text-sm text-slate-500">
                                        Kho đích:{" "}
                                        <span className="font-semibold text-slate-900">
                                            {exportSource === "TRANSFER" ? selectedTransfer?.khoNhapTen : khoLabel}
                                        </span>
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleSaveDraft}
                                            disabled={loading || (exportSource === "SO" && !form.donBanHangId) || (exportSource === "TRANSFER" && !form.transferId)}
                                            className="bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 shadow-sm transition-all duration-200 font-medium disabled:opacity-50"
                                        >
                                            {exportSource === "SO" ? "Lưu nháp" : "Tạo phiếu"}
                                        </Button>
                                        <Button
                                            onClick={handleContinue}
                                            disabled={loading || (exportSource === "SO" && !form.donBanHangId) || (exportSource === "TRANSFER" && !form.transferId)}
                                            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200 font-bold min-w-[160px] disabled:opacity-50"
                                        >
                                            {loading
                                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                                                : "Tiếp tục bốc Lô →"
                                            }
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}