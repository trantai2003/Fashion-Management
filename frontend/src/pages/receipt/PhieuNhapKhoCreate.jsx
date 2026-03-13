import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import purchaseOrderService from "@/services/purchaseOrderService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText } from "lucide-react";

export default function PhieuNhapKhoCreate() {
    const navigate = useNavigate();

    const [poId, setPoId] = useState("");
    const [selectedPO, setSelectedPO] = useState(null);
    const [loading, setLoading] = useState(false);
    const [poList, setPoList] = useState([]);
    const [ghiChu, setGhiChu] = useState("");

    useEffect(() => {
        const fetchPOs = async () => {
            try {
                const res = await purchaseOrderService.filter({
                    page: 0,
                    size: 100,
                    filters: [
                        {
                            fieldName: "trangThai",
                            operator: "EQUALS",
                            value: 4 // Chỉ lấy những PO đã duyệt (trạng thái 4) để tạo phiếu nhập
                        }
                    ],
                    sorts: [{ fieldName: "id", direction: "DESC" }]
                });
                const allContent = res.data?.content || [];
                const filteredContent = allContent.filter(po => po.trangThai === 4);
                setPoList(filteredContent);
            } catch (error) {
                console.error("Lỗi load PO:", error);
            }
        };
        fetchPOs();
    }, []);

    const handleSelectPO = async (id) => {
        if (!id) {
            setPoId("");
            setSelectedPO(null);
            return;
        }
        setPoId(id);
        setLoading(true);
        try {
            const res = await purchaseOrderService.getById(id);
            // Khởi tạo soLuongNhapTay mặc định bằng số lượng còn lại để user tiện nhập liệu
            const data = res.data;
            data.chiTietDonMuaHangs = data.chiTietDonMuaHangs.map(item => ({
                ...item,
                soLuongNhapTay: (item.soLuongDat || 0) - (item.soLuongDaNhan || 0)
            }));
            setSelectedPO(data);
            setGhiChu(`Tạo phiếu nhập kho từ PO ${data.soDonMua}`);
        } catch (error) {
            toast.error("Không thể tải chi tiết đơn mua hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (bienTheId, value) => {
        setSelectedPO(prev => ({
            ...prev,
            chiTietDonMuaHangs: prev.chiTietDonMuaHangs.map(item =>
                item.bienTheSanPham.id === bienTheId
                    ? { ...item, soLuongNhapTay: value === "" ? "" : Number(value) }
                    : item
            )
        }));
    };

    const handleSaveDraft = async (isContinue = false) => {
        if (!selectedPO) {
            toast.error("Vui lòng chọn đơn mua hàng (PO)");
            return;
        }

        // Validate theo logic Backend
        const chiTietPhieuNhapKhos = [];
        for (const ct of selectedPO.chiTietDonMuaHangs) {
            const slNhap = ct.soLuongNhapTay;
            const slConLai = (ct.soLuongDat || 0) - (ct.soLuongDaNhan || 0);

            if (slNhap === "" || slNhap <= 0) {
                toast.error(`Sản phẩm ${ct.bienTheSanPham?.maSku} phải có số lượng nhập lớn hơn 0`);
                return;
            }
            if (slNhap > slConLai) {
                toast.error(`Sản phẩm ${ct.bienTheSanPham?.maSku} vượt quá số lượng còn lại (${slConLai})`);
                return;
            }

            chiTietPhieuNhapKhos.push({
                bienTheSanPhamId: ct.bienTheSanPham.id,
                soLuongDuKienNhap: slNhap
            });
        }

        const payload = {
            donMuaHangId: selectedPO.id,
            ghiChu: ghiChu,
            chiTietPhieuNhapKhos
        };

        setLoading(true);
        try {
            const res = await phieuNhapKhoService.create(payload);
            toast.success("Tạo phiếu nhập nháp thành công");
            navigate(isContinue ? `/goods-receipts/${res.id}` : "/goods-receipts");
        } catch (e) {
            toast.error(e?.response?.data?.message || "Lỗi khi tạo phiếu nhập");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 bg-gray-50/50 min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
                            <h3 className="text-xs font-bold uppercase text-purple-600 tracking-wider">Thông tin đơn hàng</h3>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Chọn đơn mua hàng</label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="mt-2 w-full justify-between font-normal bg-white border-gray-300 h-10"
                                        >
                                            <div className="flex items-center overflow-hidden">
                                                <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">
                                                    {poId
                                                        ? poList.find(po => po.id === parseInt(poId))?.soDonMua + " - " + poList.find(po => po.id === parseInt(poId))?.nhaCungCap?.tenNhaCungCap
                                                        : "Chọn PO"}
                                                </span>
                                            </div>
                                            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[400px] max-h-[400px] overflow-y-auto bg-white" align="start">
                                        {poList.length === 0 ? (
                                            <DropdownMenuItem disabled className="text-gray-500 italic">
                                                Không có đơn mua nào khả dụng
                                            </DropdownMenuItem>
                                        ) : (
                                            poList.map((po) => (
                                                <DropdownMenuItem
                                                    key={po.id}
                                                    onClick={() => handleSelectPO(po.id)}
                                                    className="cursor-pointer hover:bg-gray-100 py-2 flex flex-col items-start"
                                                >
                                                    <span className="font-medium text-gray-900">
                                                        {po.soDonMua}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {po.nhaCungCap?.tenNhaCungCap}
                                                    </span>
                                                </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Ghi chú phiếu</label>
                                <textarea
                                    value={ghiChu}
                                    onChange={(e) => setGhiChu(e.target.value)}
                                    rows={3}
                                    className="mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                                />
                            </div>

                            <div className="pt-2 border-t space-y-3">
                                <div className="group bg-gray-50 rounded-lg p-3 border border-transparent hover:border-purple-200 transition-all">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <span className="text-[13px] text-gray-400 tracking-tight">Kho nhập đích</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {selectedPO?.khoNhap?.tenKho || "Chưa xác định"}
                                    </p>
                                    {selectedPO && (
                                        <span className="text-[10px] text-purple-600 font-medium">
                                            ID Kho: {selectedPO.khoNhap?.id}
                                        </span>
                                    )}
                                </div>

                                {/* Thông tin Nhà cung cấp */}
                                <div className="group bg-gray-50 rounded-lg p-3 border border-transparent hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-[13px] text-gray-400 tracking-tight">Đối tác cung ứng</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 break-words leading-tight" title={selectedPO?.nhaCungCap?.tenNhaCungCap}>
                                        {selectedPO?.nhaCungCap?.tenNhaCungCap || "Chưa chọn PO"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Main Table */}
                    <div className="lg:col-span-3">
                        {selectedPO ? (
                            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Chi tiết mặt hàng</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-medium">
                                            <tr>
                                                <th className="px-5 py-4">Sản phẩm</th>
                                                <th className="px-5 py-4 text-center">SL Đặt</th>
                                                <th className="px-5 py-4 text-center">Đã nhận</th>
                                                <th className="px-5 py-4 text-center">Còn lại</th>
                                                <th className="px-5 py-4 text-right">SL Nhập lần này</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {selectedPO.chiTietDonMuaHangs.map((ct) => {
                                                const slDaNhan = ct.soLuongDaNhan || 0;
                                                const slConLai = ct.soLuongDat - slDaNhan;
                                                const isInvalid = ct.soLuongNhapTay > slConLai || ct.soLuongNhapTay <= 0;

                                                return (
                                                    <tr key={ct.id} className="hover:bg-gray-50/50">
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-gray-900">{ct.bienTheSanPham?.sanPham || ct.bienTheSanPham?.maSku}</div>
                                                            <div className="text-xs text-gray-400 font-mono">{ct.bienTheSanPham?.maSku}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-center text-gray-600">{ct.soLuongDat}</td>
                                                        <td className="px-5 py-4 text-center text-blue-600 font-medium">{slDaNhan}</td>
                                                        <td className="px-5 py-4 text-center text-gray-900 font-bold">{slConLai}</td>
                                                        <td className="px-5 py-4 text-right">
                                                            <div className="inline-block">
                                                                <input
                                                                    type="number"
                                                                    value={ct.soLuongNhapTay}
                                                                    onChange={(e) => handleQtyChange(ct.bienTheSanPham.id, e.target.value)}
                                                                    className={`w-24 h-10 px-3 text-right border rounded-lg outline-none transition-all ${isInvalid
                                                                        ? "border-red-500 bg-red-50 text-red-600 focus:ring-red-100"
                                                                        : "border-gray-300 focus:ring-purple-100 focus:border-purple-500"
                                                                        }`}
                                                                />
                                                            </div>
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
                                <p>Vui lòng chọn đơn mua hàng (PO) để bắt đầu</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-200 flex justify-between gap-2">
                    <Link to="/goods-receipts" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                        ← Quay lại danh sách
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSaveDraft(false)}
                            disabled={loading || !selectedPO}
                            className="bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 h-11 px-8 rounded-xl font-medium transition-all duration-200 shadow-sm disabled:opacity-50"
                        >
                            Lưu nháp
                        </button>
                        <button
                            onClick={() => handleSaveDraft(true)}
                            disabled={loading || !selectedPO}
                            className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm h-11 px-8 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Đang xử lý..." : "Tiếp tục"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}