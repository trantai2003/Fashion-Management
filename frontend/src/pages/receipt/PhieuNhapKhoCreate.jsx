import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import purchaseOrderService from "@/services/purchaseOrderService";
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

export default function PhieuNhapKhoCreate() {
    const navigate = useNavigate();

    // --- States cho Loại Nhập ---
    const [importSource, setImportSource] = useState("PO"); // "PO" hoặc "TRANSFER"

    // --- Data States ---
    const [poList, setPoList] = useState([]);
    const [transferList, setTransferList] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    const [selectedPO, setSelectedPO] = useState(null);
    const [selectedTransfer, setSelectedTransfer] = useState(null);

    const [loading, setLoading] = useState(false);
    const [createdId, setCreatedId] = useState(null);

    const [form, setForm] = useState({
        donMuaHangId: "",
        transferId: "",
        khoId: "",
        ghiChu: "",
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            const myWarehousesRes = await getMineKhoList().catch(() => ({ data: [] }));
            const warehouseList = myWarehousesRes.data || myWarehousesRes || [];
            setWarehouses(warehouseList);

            // Gọi song song 4 API
            const [poRes, transferRes3, transferRes4, allReceiptsRes] = await Promise.all([
                purchaseOrderService.filter({
                    page: 0, size: 1000,
                    filters: [{ fieldName: "trangThai", operator: "EQUALS", value: 4 }],
                    sorts: [{ fieldName: "id", direction: "DESC" }]
                }).catch(() => ({ content: [] })),

                phieuChuyenKhoService.filter({
                    page: 0, size: 1000,
                    filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 3 }],
                    sorts: [{ fieldName: "ngayCapNhat", direction: "DESC" }]
                }).catch(() => ({ content: [] })),

                phieuChuyenKhoService.filter({
                    page: 0, size: 1000,
                    filters: [{ fieldName: "trangThai", operation: "EQUALS", value: 4 }],
                    sorts: [{ fieldName: "ngayCapNhat", direction: "DESC" }]
                }).catch(() => ({ content: [] })),

                // Lấy TẤT CẢ phiếu nhập kho (cả nháp, cả đã nhập xong)
                phieuNhapKhoService.filter({
                    page: 0, size: 2000, // Lấy số lượng lớn để bao quát hết dữ liệu cũ
                }).catch(() => ({ content: [] }))
            ]);

            // --- LOGIC LỌC PO ---
            // --- LOGIC LỌC PO ---
            const rawPoList = poRes.data?.content || poRes.content || [];

            const validPoList = rawPoList.filter(po => {
                if (po.trangThai !== 4) return false;
                if (po.chiTietDonMuaHangs && Array.isArray(po.chiTietDonMuaHangs)) {
                    return po.chiTietDonMuaHangs.some(ct => (ct.soLuongDaNhan || 0) < (ct.soLuongDat || 0));
                }
                const tongDat = po.tongSoLuongDat ?? po.soLuongDat;
                const tongNhan = po.tongSoLuongDaNhan ?? po.soLuongDaNhan ?? po.tongSoLuongNhan;

                if (tongDat !== undefined && tongNhan !== undefined) {
                    return tongNhan < tongDat;
                }
                return true;
            });

            setPoList(validPoList);

            // Gộp các phiếu chuyển đang vận chuyển và bị hủy
            const rawTransfers = [
                ...(transferRes3.content || transferRes3.data?.content || []),
                ...(transferRes4.content || transferRes4.data?.content || [])
            ];

            const validTransfers = rawTransfers.filter(t => t.trangThai === 3 || t.trangThai === 4);

            // --- LOGIC LOẠI TRỪ TRIỆT ĐỂ ---
            const allReceipts = allReceiptsRes.content || allReceiptsRes.data?.content || [];

            // 1. Tạo danh sách các ID gốc đã được sử dụng (dùng Set để tăng tốc độ tìm kiếm)
            const usedTransferIds = new Set(allReceipts.map(r => r.phieuChuyenKhoGocId).filter(Boolean));

            // 2. Tạo danh sách các Mã chứng từ gốc đã được sử dụng (quan trọng cho đơn Hoàn trả)
            const usedTransferCodes = new Set(allReceipts.map(r => {
                // Lấy soPhieuChuyenKhoGoc hoặc bóc từ ghi chú nếu soPhieuChuyenKhoGoc bị null
                if (r.soPhieuChuyenKhoGoc) return r.soPhieuChuyenKhoGoc;
                if (r.ghiChu && r.ghiChu.includes("phiếu chuyển")) {
                    const match = r.ghiChu.match(/PX-[\w-]+|PCK-[\w-]+/); // Tìm định dạng mã phiếu
                    return match ? match[0] : null;
                }
                return null;
            }).filter(Boolean));

            // 3. Lọc: Chỉ hiện những phiếu chuyển CHƯA có ID và CHƯA có Mã trong danh sách đã xử lý
            const availableTransfers = validTransfers.filter(t => {
                const isIdUsed = usedTransferIds.has(t.id);
                const isCodeUsed = usedTransferCodes.has(t.soPhieuXuat);
                return !isIdUsed && !isCodeUsed;
            });

            setTransferList(availableTransfers);

            if (warehouseList.length === 1) {
                setForm(prev => ({ ...prev, khoId: warehouseList[0].id }));
            }

        } catch (error) {
            console.error("Lỗi khởi tạo màn hình phiếu nhập:", error);
            toast.error("Không thể tải dữ liệu khởi tạo");
        } finally {
            setLoading(false);
        }
    }

    // ===== HANDLE LỰA CHỌN ===== //
    const handleSelectPO = async (id) => {
        if (!id) {
            setSelectedPO(null);
            setForm({ ...form, donMuaHangId: "" });
            return;
        }
        setLoading(true);
        try {
            const res = await purchaseOrderService.getById(id);
            const data = res.data;
            data.chiTietDonMuaHangs = data.chiTietDonMuaHangs.map(item => ({
                ...item,
                soLuongNhapTay: (item.soLuongDat || 0) - (item.soLuongDaNhan || 0)
            }));

            setSelectedPO(data);
            setForm(prev => ({
                ...prev,
                donMuaHangId: data.id,
                khoId: data.khoNhap?.id || prev.khoId,
                ghiChu: `Tạo phiếu nhập kho từ PO ${data.soDonMua}`
            }));
        } catch (error) {
            toast.error("Không thể tải chi tiết đơn mua hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTransfer = async (id) => {
        if (!id) {
            setSelectedTransfer(null);
            setForm({ ...form, transferId: "" });
            return;
        }
        setLoading(true);
        try {
            const res = await phieuChuyenKhoService.getDetail(id);
            const data = res.data || res;
            setSelectedTransfer(data);
            setForm(prev => ({
                ...prev,
                transferId: data.id,
                // Nếu trạng thái 4 (Hủy) -> Nhập lại Kho Xuất (khoA). Ngược lại Nhập Kho Đích (khoB)
                khoId: data.trangThai === 4 ? data.khoXuatId : data.khoNhapId,
                ghiChu: data.trangThai === 4
                    ? `Nhập hoàn trả (RET) từ phiếu chuyển bị hủy: ${data.soPhieuXuat}`
                    : `Nhập kho thủ công từ phiếu chuyển: ${data.soPhieuXuat}`
            }));
        } catch (e) {
            toast.error("Không thể tải chi tiết yêu cầu chuyển kho");
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChangePO = (bienTheId, value) => {
        setSelectedPO(prev => ({
            ...prev,
            chiTietDonMuaHangs: prev.chiTietDonMuaHangs.map(item =>
                item.bienTheSanPham.id === bienTheId
                    ? { ...item, soLuongNhapTay: value === "" ? "" : Number(value) }
                    : item
            )
        }));
    };

    // ===== HANDLE TẠO PHIẾU ===== //
    async function createPhieu() {
        if (importSource === "PO") {
            if (!selectedPO) return toast.error("Vui lòng chọn đơn mua hàng (PO)"), null;

            const chiTietPhieuNhapKhos = [];
            for (const ct of selectedPO.chiTietDonMuaHangs) {
                const slNhap = ct.soLuongNhapTay;
                const slConLai = (ct.soLuongDat || 0) - (ct.soLuongDaNhan || 0);

                if (slNhap === "" || slNhap <= 0) {
                    toast.error(`Sản phẩm ${ct.bienTheSanPham?.maSku} phải có số lượng nhập lớn hơn 0`);
                    return null;
                }
                if (slNhap > slConLai) {
                    toast.error(`Sản phẩm ${ct.bienTheSanPham?.maSku} vượt quá số lượng còn lại (${slConLai})`);
                    return null;
                }
                chiTietPhieuNhapKhos.push({
                    bienTheSanPhamId: ct.bienTheSanPham.id,
                    soLuongDuKienNhap: slNhap
                });
            }

            const payload = {
                donMuaHangId: selectedPO.id,
                ghiChu: form.ghiChu,
                chiTietPhieuNhapKhos
            };

            try {
                setLoading(true);
                const res = await phieuNhapKhoService.create(payload);
                setCreatedId(res.id);
                toast.success("Tạo phiếu nhập từ PO thành công");
                return res.id;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Lỗi khi tạo phiếu nhập");
                return null;
            } finally {
                setLoading(false);
            }
        } else {
            if (!form.transferId) return toast.error("Vui lòng chọn yêu cầu chuyển kho"), null;
            try {
                setLoading(true);
                const res = await phieuNhapKhoService.createFromTransfer(form.transferId);
                const newId = res.data?.id || res.id;
                setCreatedId(newId);
                toast.success("Khởi tạo phiếu nhập luân chuyển thành công");
                return newId;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Không thể tạo phiếu nhập luân chuyển");
                return null;
            } finally {
                setLoading(false);
            }
        }
    }

    async function handleSaveDraft() { await createPhieu(); }

    async function handleContinue() {
        let id = createdId || await createPhieu();
        if (id) navigate(`/goods-receipts/${id}`);
    }

    const toggleSource = (source) => {
        setImportSource(source);
        setSelectedPO(null);
        setSelectedTransfer(null);
        setForm({
            donMuaHangId: "",
            transferId: "",
            khoId: warehouses.length === 1 ? warehouses[0].id : "",
            ghiChu: "",
        });
    };

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ===== BỘ CHUYỂN ĐỔI (TOGGLE) ===== */}
                <div className="flex p-1 bg-gray-200/60 rounded-xl w-fit shadow-inner">
                    <button
                        onClick={() => toggleSource("PO")}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2
                            ${importSource === "PO" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <FileText className="w-4 h-4" />
                        Nhập từ Đối Tác (PO)
                    </button>
                    <button
                        onClick={() => toggleSource("TRANSFER")}
                        className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2
                            ${importSource === "TRANSFER" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Nhận hàng Luân Chuyển
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT PANEL */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">

                            {/* NGUỒN CHỨNG TỪ GỐC */}
                            {importSource === "PO" ? (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Đơn mua hàng (PO)</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="mt-2 w-full justify-between font-normal bg-white border-gray-300 h-10">
                                                <div className="flex items-center overflow-hidden">
                                                    <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {form.donMuaHangId
                                                            ? poList.find(po => po.id === parseInt(form.donMuaHangId))?.soDonMua
                                                            : "Chọn đơn mua hàng"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto bg-white" align="start">
                                            {poList.length === 0 ? (
                                                <DropdownMenuItem disabled className="text-gray-500 italic">Không có PO nào khả dụng</DropdownMenuItem>
                                            ) : (
                                                poList.map((po) => (
                                                    <DropdownMenuItem key={po.id} onClick={() => handleSelectPO(po.id)} className="cursor-pointer hover:bg-gray-100 py-2 flex flex-col items-start">
                                                        <span className="font-medium text-gray-900">{po.soDonMua}</span>
                                                        <span className="text-[10px] text-gray-500 truncate w-full">{po.nhaCungCap?.tenNhaCungCap}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Yêu cầu luân chuyển</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="mt-2 w-full justify-between font-normal bg-white border-gray-300 h-10">
                                                <div className="flex items-center overflow-hidden">
                                                    <Package className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">
                                                        {form.transferId
                                                            ? transferList.find(t => t.id === parseInt(form.transferId))?.soPhieuXuat
                                                            : "Chọn phiếu đang vận chuyển"}
                                                    </span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[300px] max-h-[400px] overflow-y-auto bg-white" align="start">
                                            {transferList.length === 0 ? (
                                                <DropdownMenuItem disabled className="text-gray-500 italic">Không có lô hàng luân chuyển nào đang chờ</DropdownMenuItem>
                                            ) : (
                                                transferList.map((t) => (
                                                    <DropdownMenuItem key={t.id} onClick={() => handleSelectTransfer(t.id)} className="cursor-pointer hover:bg-gray-100 py-2 flex flex-col items-start">
                                                        <div className="flex justify-between w-full">
                                                            <span className="font-medium text-gray-900">{t.soPhieuXuat}</span>
                                                            {/* TAG HOÀN TRẢ */}
                                                            {t.trangThai === 4 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">HOÀN TRẢ</span>}
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 mt-1">Từ: {t.kho?.tenKho || t.khoXuatTen} ➜ Đến: {t.khoChuyenDen?.tenKho || t.khoNhapTen}</span>
                                                    </DropdownMenuItem>
                                                ))
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}

                            {/* KHO NHẬP HÀNG ĐÍCH */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kho tiếp nhận</label>
                                <Button variant="outline" disabled={true} className="mt-2 w-full justify-between font-bold bg-white border-gray-300 h-10 text-gray-700 disabled:opacity-80">
                                    <div className="flex items-center overflow-hidden">
                                        <Warehouse className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                        <span className="truncate">
                                            {form.khoId ? warehouses.find(k => k.id === parseInt(form.khoId))?.tenKho || "Kho từ chứng từ" : "Tự động trích xuất"}
                                        </span>
                                    </div>
                                </Button>
                            </div>

                            {/* GHI CHÚ */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ghi chú</label>
                                <textarea
                                    value={form.ghiChu}
                                    onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                    rows={3}
                                    readOnly={importSource === "TRANSFER"}
                                    className={`mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all outline-none resize-none text-sm
                                        ${importSource === "TRANSFER" ? "bg-gray-100 text-gray-500" : "bg-gray-50"}`}
                                />
                            </div>
                        </section>
                    </div>

                    {/* RIGHT PANEL - BẢNG PREVIEW DỮ LIỆU */}
                    <div className="lg:col-span-2">

                        {/* HIỂN THỊ NẾU CHỌN PO */}
                        {importSource === "PO" && selectedPO && (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Sản phẩm dự kiến nhập</h3>
                                    <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded">
                                        {selectedPO.soDonMua}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-5 py-4">Sản phẩm</th>
                                                <th className="px-5 py-4 text-center">Đặt / Nhận</th>
                                                <th className="px-5 py-4 text-center">Còn lại</th>
                                                <th className="px-5 py-4 text-right">Thực nhập lần này</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedPO.chiTietDonMuaHangs.map((ct) => {
                                                const slDaNhan = ct.soLuongDaNhan || 0;
                                                const slConLai = ct.soLuongDat - slDaNhan;
                                                const isInvalid = ct.soLuongNhapTay > slConLai || ct.soLuongNhapTay <= 0;

                                                return (
                                                    <tr key={ct.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-gray-900">{ct.bienTheSanPham?.sanPham || ct.bienTheSanPham?.maSku}</div>
                                                            <div className="text-xs text-gray-400 font-mono mt-0.5">{ct.bienTheSanPham?.maSku}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className="text-gray-900">{ct.soLuongDat}</span>
                                                            <span className="text-gray-300 mx-1">/</span>
                                                            <span className="text-green-600 font-medium">{slDaNhan}</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center text-gray-900 font-bold">{slConLai}</td>
                                                        <td className="px-5 py-4 text-right">
                                                            <input
                                                                type="number" min={0} max={slConLai} disabled={slConLai <= 0}
                                                                value={ct.soLuongNhapTay}
                                                                onChange={(e) => handleQtyChangePO(ct.bienTheSanPham.id, e.target.value)}
                                                                className={`w-24 h-10 px-3 text-right border rounded-lg outline-none transition-all font-semibold
                                                                    ${isInvalid ? "border-red-500 bg-red-50 text-red-600 focus:ring-red-100" : "border-gray-300 focus:ring-green-100 focus:border-green-500 disabled:bg-gray-100"}`}
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
                        {importSource === "TRANSFER" && selectedTransfer && (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                                    <div>
                                        <h3 className="font-semibold text-green-900">Chi tiết hàng đang đi đường</h3>
                                        <p className="text-[11px] text-gray-500 mt-1">Từ: <span className="font-bold text-gray-800">{selectedTransfer.khoXuatTen || selectedTransfer.kho?.tenKho}</span></p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs font-bold text-green-700 bg-white border border-green-200 px-2 py-1 rounded shadow-sm">
                                            {selectedTransfer.soPhieuXuat}
                                        </span>
                                        {/* TAG HOÀN TRẢ TRONG BẢNG */}
                                        {selectedTransfer.trangThai === 4 && (
                                            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded">HÀNG HOÀN TRẢ</span>
                                        )}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-5 py-4 text-left">Mặt hàng</th>
                                                <th className="px-5 py-4 text-center">SL Xuất Bến</th>
                                                <th className="px-5 py-4 text-right">Lô hàng kèm theo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedTransfer.items?.map((item) => (
                                                <tr key={item.bienTheId || item.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-medium text-gray-900">{item.tenSanPham}</div>
                                                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-center font-bold text-lg text-green-700">
                                                        {item.soLuongCanXuat || item.soLuongYeuCau || item.soLuongDaPick}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <span className="text-[11px] bg-green-100 text-green-800 px-2 py-1 rounded font-semibold border border-green-200">
                                                            Kế thừa tự động
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* EMPTY STATE */}
                        {((importSource === "PO" && !selectedPO) || (importSource === "TRANSFER" && !selectedTransfer)) && (
                            <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-white">
                                <Package className="w-12 h-12 mb-3 text-gray-300" />
                                <p className="text-sm font-medium">
                                    Vui lòng chọn {importSource === "PO" ? "Đơn mua hàng" : "Yêu cầu chuyển kho"} để tiếp tục
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                    <Link to="/goods-receipts" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        ← Quay lại danh sách
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSaveDraft}
                            disabled={loading || (importSource === "PO" && !form.donMuaHangId) || (importSource === "TRANSFER" && !form.transferId)}
                            className="bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 h-11 px-8 rounded-xl font-medium transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : (importSource === "PO" ? "Lưu nháp" : "Lưu nháp")}
                        </button>
                        <button
                            onClick={handleContinue}
                            disabled={loading || (importSource === "PO" && !form.donMuaHangId) || (importSource === "TRANSFER" && !form.transferId)}
                            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm h-11 px-8 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                            {importSource === "PO" ? "Tiếp tục khai Lô →" : "Xác nhận nhận hàng →"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}