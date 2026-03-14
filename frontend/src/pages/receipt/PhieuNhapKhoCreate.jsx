import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { phieuChuyenKhoService } from "@/services/phieuChuyenKhoService";
import purchaseOrderService from "@/services/purchaseOrderService";
import { getMineKhoList } from "@/services/khoService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    ChevronDown, 
    FileText, 
    Warehouse, 
    ArrowRightLeft, 
    Package, 
    ArrowLeft,
    CheckCircle2,
    Loader2
} from "lucide-react";

// ── Shared components for lux-sync layout ──────────────────────────────
function SectionCard({ icon: Icon, iconBg, iconColor, title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col h-full items-stretch transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${iconBg}`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <h3 className="font-bold text-slate-800 text-[15px]">{title}</h3>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-6 justify-start">{children}</div>
        </div>
    );
}

function StatusBadge({ children, variant = "default" }) {
    const variants = {
        default: "bg-slate-100 text-slate-700 border-slate-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        danger: "bg-rose-50 text-rose-700 border-rose-200",
        purple: "bg-violet-50 text-violet-700 border-violet-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${variants[variant] || variants.default}`}>
            {children}
        </span>
    );
}
// ─────────────────────────────────────────────────────────────────────────

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
    const [actionLoading, setActionLoading] = useState(false);
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

            const usedTransferIds = new Set(allReceipts.map(r => r.phieuChuyenKhoGocId).filter(Boolean));
            const usedTransferCodes = new Set(allReceipts.map(r => {
                if (r.soPhieuChuyenKhoGoc) return r.soPhieuChuyenKhoGoc;
                if (r.ghiChu && r.ghiChu.includes("phiếu chuyển")) {
                    const match = r.ghiChu.match(/PX-[\w-]+|PCK-[\w-]+/);
                    return match ? match[0] : null;
                }
                return null;
            }).filter(Boolean));

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
        setActionLoading(true);
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
            setActionLoading(false);
        }
    };

    const handleSelectTransfer = async (id) => {
        if (!id) {
            setSelectedTransfer(null);
            setForm({ ...form, transferId: "" });
            return;
        }
        setActionLoading(true);
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
            setActionLoading(false);
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
                setActionLoading(true);
                const res = await phieuNhapKhoService.create(payload);
                setCreatedId(res.id);
                toast.success("Tạo phiếu nhập từ PO thành công");
                return res.id;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Lỗi khi tạo phiếu nhập");
                return null;
            } finally {
                setActionLoading(false);
            }
        } else {
            if (!form.transferId) return toast.error("Vui lòng chọn yêu cầu chuyển kho"), null;
            try {
                setActionLoading(true);
                const res = await phieuNhapKhoService.createFromTransfer(form.transferId);
                const newId = res.data?.id || res.id;
                setCreatedId(newId);
                toast.success("Khởi tạo phiếu nhập luân chuyển thành công");
                return newId;
            } catch (e) {
                toast.error(e?.response?.data?.message || "Không thể tạo phiếu nhập luân chuyển");
                return null;
            } finally {
                setActionLoading(false);
            }
        }
    }

    async function handleSaveDraft() { await createPhieu(); }

    async function handleContinue() {
        let id = createdId || await createPhieu();
        if (id) navigate(`/goods-receipts/${id}`);
    }

    const toggleSource = (source) => {
        if (importSource === source) return;
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

    if (loading) {
        return (
            <div className="flex-1 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center lux-sync">
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-sm w-full max-w-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="text-[15px] font-medium text-slate-600">Đang tải biểu mẫu...</span>
                </div>
            </div>
        );
    }

    return (
        <main className="flex-1 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-[calc(100vh-64px)] p-6 md:p-8 pb-32 lux-sync">
            
            {/* ── Top Header and Navigation ── */}
            <div className="flex flex-col gap-4 mb-8">
                <button
                    type="button"
                    onClick={() => navigate("/goods-receipts")}
                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-500 hover:text-purple-600 transition-colors duration-200 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </button>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200/60 shrink-0">
                            <Package className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight">
                                Tạo phiếu nhập kho
                            </h1>
                            <p className="mt-1 text-[15px] font-medium text-slate-500">
                                Khởi tạo chứng từ lưu kho từ đơn mua hoặc điều chuyển
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                         <Button
                            onClick={handleSaveDraft}
                            disabled={actionLoading || (importSource === "PO" && !form.donMuaHangId) || (importSource === "TRANSFER" && !form.transferId)}
                            variant="outline"
                            className="h-11 px-6 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all shadow-sm"
                        >
                            {actionLoading ? "Đang xử lý..." : "Lưu nháp"}
                        </Button>
                        <Button
                            onClick={handleContinue}
                            disabled={actionLoading || (importSource === "PO" && !form.donMuaHangId) || (importSource === "TRANSFER" && !form.transferId)}
                            className="h-11 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all duration-200 shadow-md gap-2"
                        >
                            {importSource === "PO" ? "Tiếp tục khai Lô →" : "Xác nhận nhận hàng →"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ===== BỘ CHUYỂN ĐỔI (TOGGLE) ===== */}
            <div className="flex p-1.5 bg-slate-200/60 backdrop-blur-sm rounded-[14px] w-fit shadow-inner mb-6 mx-auto sm:mx-0 border border-slate-200/50">
                <button
                    onClick={() => toggleSource("PO")}
                    className={`px-6 py-2.5 text-[14px] font-bold rounded-lg transition-all flex items-center gap-2 duration-300 relative
                        ${importSource === "PO" 
                            ? "bg-white text-purple-700 shadow-sm border-slate-200/60" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
                >
                    <FileText className={`w-4 h-4 ${importSource === "PO" ? "text-purple-600" : "opacity-60"}`} />
                    Nhập từ Đối Tác (PO)
                </button>
                <button
                    onClick={() => toggleSource("TRANSFER")}
                     className={`px-6 py-2.5 text-[14px] font-bold rounded-lg transition-all flex items-center gap-2 duration-300
                        ${importSource === "TRANSFER" 
                            ? "bg-white text-indigo-700 shadow-sm border-slate-200/60" 
                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50"}`}
                >
                    <ArrowRightLeft className={`w-4 h-4 ${importSource === "TRANSFER" ? "text-indigo-600" : "opacity-60"}`} />
                    Nhận hàng Luân Chuyển
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT PANEL */}
                <div className="lg:col-span-1 space-y-6">
                    <SectionCard title="Nguồn chứng từ" icon={importSource === "PO" ? FileText : ArrowRightLeft} iconBg={importSource === "PO" ? "bg-purple-100" : "bg-indigo-100"} iconColor={importSource === "PO" ? "text-purple-600" : "text-indigo-600"}>
                        
                        {/* NGUỒN CHỨNG TỪ GỐC */}
                        {importSource === "PO" ? (
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-slate-700">Đơn mua hàng (PO)</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between font-normal bg-white border-slate-200 h-11 rounded-xl shadow-sm text-[14px]">
                                            <div className="flex items-center overflow-hidden">
                                                <FileText className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                                                <span className="truncate font-medium text-slate-700">
                                                    {form.donMuaHangId
                                                        ? poList.find(po => po.id === parseInt(form.donMuaHangId))?.soDonMua
                                                        : "Chọn đơn mua hàng"}
                                                </span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[340px] max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-lg border-slate-100 p-1" align="start">
                                        {poList.length === 0 ? (
                                            <DropdownMenuItem disabled className="text-slate-500 italic p-3">Không có đơn mua hàng khả dụng</DropdownMenuItem>
                                        ) : (
                                            poList.map((po) => (
                                                <DropdownMenuItem key={po.id} onClick={() => handleSelectPO(po.id)} className="cursor-pointer hover:bg-purple-50 focus:bg-purple-50 p-3 flex flex-col items-start gap-1 rounded-lg">
                                                    <span className="font-bold text-slate-800 text-[14px]">{po.soDonMua}</span>
                                                    <span className="text-[12px] text-slate-500 truncate w-full">{po.nhaCungCap?.tenNhaCungCap}</span>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold text-slate-700">Yêu cầu luân chuyển</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between font-normal bg-white border-slate-200 h-11 rounded-xl shadow-sm text-[14px]">
                                            <div className="flex items-center overflow-hidden">
                                                <Package className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                                                <span className="truncate font-medium text-slate-700">
                                                    {form.transferId
                                                        ? transferList.find(t => t.id === parseInt(form.transferId))?.soPhieuXuat
                                                        : "Chọn phiếu đang vận chuyển"}
                                                </span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[340px] max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-lg border-slate-100 p-1" align="start">
                                        {transferList.length === 0 ? (
                                            <DropdownMenuItem disabled className="text-slate-500 italic p-3">Không có lô hàng luân chuyển nào đang chờ</DropdownMenuItem>
                                        ) : (
                                            transferList.map((t) => (
                                                <DropdownMenuItem key={t.id} onClick={() => handleSelectTransfer(t.id)} className="cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 p-3 flex flex-col items-start gap-1 rounded-lg">
                                                    <div className="flex justify-between w-full items-center">
                                                        <span className="font-bold text-slate-800 text-[14px]">{t.soPhieuXuat}</span>
                                                        {t.trangThai === 4 && <StatusBadge variant="danger">Hoàn trả</StatusBadge>}
                                                    </div>
                                                    <span className="text-[12px] text-slate-500 mt-0.5">
                                                        <span className="font-medium text-slate-600">{t.kho?.tenKho || t.khoXuatTen}</span> 
                                                        <span className="mx-1 text-slate-300">→</span> 
                                                        <span className="font-medium text-slate-600">{t.khoChuyenDen?.tenKho || t.khoNhapTen}</span>
                                                    </span>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        {/* KHO NHẬP HÀNG ĐÍCH */}
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold text-slate-700">Kho tiếp nhận</Label>
                            <Button variant="outline" disabled={true} className="w-full justify-between font-bold bg-slate-50 border-slate-200 h-11 text-slate-700 disabled:opacity-100 rounded-xl shadow-sm">
                                <div className="flex items-center overflow-hidden">
                                    <Warehouse className="h-4 w-4 mr-2 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">
                                        {form.khoId ? warehouses.find(k => k.id === parseInt(form.khoId))?.tenKho || "Kho từ chứng từ gốc" : "Tự động trích xuất"}
                                    </span>
                                </div>
                            </Button>
                        </div>

                        {/* GHI CHÚ */}
                        <div className="space-y-2 mt-2">
                            <Label className="text-[13px] font-bold text-slate-700">Ghi chú phiếu nhập</Label>
                            <Textarea
                                value={form.ghiChu}
                                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                                rows={4}
                                placeholder="Ghi chú nội bộ cho phiếu nhập kho này..."
                                readOnly={importSource === "TRANSFER"}
                                className={`min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-purple-500 resize-none text-[14px] shadow-sm p-3.5
                                    ${importSource === "TRANSFER" ? "bg-slate-50 text-slate-500 focus-visible:ring-0 cursor-not-allowed" : "bg-white"}`}
                            />
                        </div>
                    </SectionCard>
                </div>

                {/* RIGHT PANEL - BẢNG PREVIEW DỮ LIỆU */}
                <div className="lg:col-span-2">

                    {/* HIỂN THỊ NẾU CHỌN PO */}
                    {importSource === "PO" && selectedPO && (
                        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                           <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[16px]">Sản phẩm dự kiến nhập</h3>
                                    <p className="text-[13px] text-slate-500 font-medium mt-1">
                                        Các mặt hàng từ đơn đặt hàng nhà cung cấp
                                    </p>
                                </div>
                                <span className="text-[13px] font-bold text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg shadow-sm font-mono">
                                    {selectedPO.soDonMua}
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50/80 text-slate-500 font-bold text-[12px] uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4">Sản phẩm</th>
                                            <th className="px-6 py-4 text-center">Đặt / Nhận</th>
                                            <th className="px-6 py-4 text-center">Còn lại</th>
                                            <th className="px-6 py-4 text-right">Thực nhập lần này</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedPO.chiTietDonMuaHangs.map((ct) => {
                                            const slDaNhan = ct.soLuongDaNhan || 0;
                                            const slConLai = ct.soLuongDat - slDaNhan;
                                            const isInvalid = ct.soLuongNhapTay > slConLai || ct.soLuongNhapTay <= 0;

                                            return (
                                                <tr key={ct.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-[14px] text-slate-900 group-hover:text-purple-700 transition-colors">{ct.bienTheSanPham?.sanPham || ct.bienTheSanPham?.maSku}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="font-mono text-xs font-bold text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
                                                                {ct.bienTheSanPham?.maSku}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-slate-800 font-bold">{ct.soLuongDat}</span>
                                                        <span className="text-slate-300 mx-1">/</span>
                                                        <span className="text-emerald-600 font-bold">{slDaNhan}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                     <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[13px]">
                                                        {slConLai}
                                                     </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Input
                                                            type="number" min={0} max={slConLai} disabled={slConLai <= 0}
                                                            value={ct.soLuongNhapTay}
                                                            onChange={(e) => handleQtyChangePO(ct.bienTheSanPham.id, e.target.value)}
                                                            className={`w-[100px] h-10 px-3 text-center border-slate-200 outline-none transition-all font-bold text-[15px] rounded-xl shadow-sm inline-block
                                                                ${isInvalid ? "border-rose-300 bg-rose-50 text-rose-700 focus-visible:ring-rose-200" : "text-emerald-700 bg-emerald-50/50 border-emerald-200 focus-visible:ring-emerald-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200"}`}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* HIỂN THỊ NẾU CHỌN TRANSFER */}
                    {importSource === "TRANSFER" && selectedTransfer && (
                        <div className="rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200/80 overflow-hidden flex flex-col">
                             <div className="px-6 py-5 border-b border-indigo-100 bg-indigo-50/30 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-indigo-950 text-[16px]">Chi tiết hàng đang đi đường</h3>
                                    <p className="text-[13px] text-indigo-700/70 font-medium mt-1">
                                        Nhận hàng nội bộ từ: <span className="font-bold text-indigo-900">{selectedTransfer.khoXuatTen || selectedTransfer.kho?.tenKho}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[13px] font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg shadow-sm font-mono">
                                        {selectedTransfer.soPhieuXuat}
                                    </span>
                                    {selectedTransfer.trangThai === 4 && (
                                        <StatusBadge variant="danger">Hàng hoàn trả</StatusBadge>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50/80 text-slate-500 font-bold text-[12px] uppercase tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Mặt hàng</th>
                                            <th className="px-6 py-4 text-center">SL Xuất Bến</th>
                                            <th className="px-6 py-4 text-right">Quy trình</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedTransfer.items?.map((item) => (
                                            <tr key={item.bienTheId || item.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-[14px] text-slate-900 group-hover:text-indigo-700 transition-colors">{item.tenSanPham}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                                                            {item.sku}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block bg-emerald-50 text-emerald-700 font-black text-[16px] px-3 py-1 rounded-lg border border-emerald-100">
                                                         {item.soLuongCanXuat || item.soLuongYeuCau || item.soLuongDaPick}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center gap-1.5 text-[12px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md mb-0 font-semibold border border-slate-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                                        Kế thừa tự động
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {((importSource === "PO" && !selectedPO) || (importSource === "TRANSFER" && !selectedTransfer)) && (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white/50 backdrop-blur-sm p-8 text-center">
                            <div className={`h-20 w-20 rounded-full flex items-center justify-center border mb-5 shadow-inner
                                ${importSource === 'PO' ? 'bg-purple-50 border-purple-100 text-purple-300' : 'bg-indigo-50 border-indigo-100 text-indigo-300'}`}>
                                {importSource === 'PO' ? <FileText className="w-10 h-10" /> : <ArrowRightLeft className="w-10 h-10" />}
                            </div>
                            <h3 className="text-[18px] font-bold text-slate-700 mb-2">Chưa chọn chứng từ</h3>
                            <p className="text-[14px] font-medium text-slate-500 max-w-sm mx-auto">
                                Vui lòng chọn {importSource === "PO" ? "Đơn mua hàng (PO)" : "Yêu cầu chuyển kho"} ở cột bên trái để tải danh sách sản phẩm.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}