import { useEffect, useState, useMemo } from "react";
import { phieuNhapKhoService } from "@/services/phieuNhapKhoService";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Loader2, Search, RefreshCcw, Package, Plus,
    ChevronDown, ChevronLeft, ChevronRight, Check, Filter,
    FileText, CheckCircle2, XCircle, ClipboardList,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_MAP = {
    0: { label: "Nháp", className: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    1: { label: "Chờ duyệt", className: "border-blue-200 bg-blue-50 text-blue-700", dot: "bg-blue-500" },
    2: { label: "Đã duyệt", className: "border-indigo-200 bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    3: { label: "Đã nhập kho", className: "border-green-200 bg-green-50 text-green-700", dot: "bg-green-500" },
    4: { label: "Đã hủy", className: "border-red-200 bg-red-50 text-red-600", dot: "bg-red-500" },
};

const STATUS_OPTIONS = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "0", label: "Nháp" },
    { value: "3", label: "Đã nhập kho" },
    { value: "4", label: "Đã hủy" },
];

export default function PhieuNhapKhoList() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        keyword: "",
        nhaCungCap: "",
        trangThai: "",
        ngayNhap: "",
        page: 0,
        size: 10,
    });

    function buildFilterPayload() {
        const filterList = [];
        if (filters.keyword?.trim()) {
            const searchKeyword = filters.keyword.trim();
            ["soPhieuNhap", "donMuaHang.soDonMua"].forEach((field) => {
                filterList.push({ fieldName: field, operation: "LIKE", value: searchKeyword, logicType: "OR" });
            });
        }
        if (filters.nhaCungCap?.trim()) {
            filterList.push({ fieldName: "nhaCungCap.tenNhaCungCap", operation: "LIKE", value: filters.nhaCungCap.trim() });
        }
        if (filters.trangThai !== "") {
            filterList.push({ fieldName: "trangThai", operation: "EQUALS", value: Number(filters.trangThai) });
        }
        return { page: filters.page, size: filters.size, filters: filterList, sorts: [{ fieldName: "id", direction: "DESC" }] };
    }

    async function fetchData() {
        setLoading(true);
        try {
            const payload = buildFilterPayload();
            const res = await phieuNhapKhoService.filter(payload);
            let list = res.content || [];
            if (filters.ngayNhap) {
                list = list.filter((item) => {
                    if (!item.ngayNhap) return false;
                    const date = new Date(item.ngayNhap);
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, "0");
                    const d = String(date.getDate()).padStart(2, "0");
                    return `${y}-${m}-${d}` === filters.ngayNhap;
                });
            }
            setData(list);
            setTotal(res.totalElements || 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, [filters.keyword, filters.nhaCungCap, filters.trangThai, filters.ngayNhap, filters.page, filters.size]);

    const totalPages = Math.max(1, Math.ceil(total / filters.size));

    const handleReset = () => {
        setFilters({ keyword: "", nhaCungCap: "", trangThai: "", ngayNhap: "", page: 0, size: 10 });
    };

    const stats = useMemo(() => ({
        nhap: data.filter((d) => d.trangThai === 0).length,
        daHoanTat: data.filter((d) => d.trangThai === 3).length,
        daHuy: data.filter((d) => d.trangThai === 4).length,
    }), [data]);

    return (
        <div className="lux-sync p-6 space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
            <div className="space-y-6 w-full">

                {/* ══ STATS ═══════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Tổng phiếu nhập</p><p className="text-2xl font-bold text-gray-900 mt-1">{total}</p></div>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"><Package className="h-6 w-6 text-blue-600" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Nháp</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.nhap}</p></div>
                                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center"><FileText className="h-6 w-6 text-amber-600" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Đã nhập kho</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.daHoanTat}</p></div>
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-green-600" /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-red-50 to-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div><p className="text-sm font-medium text-gray-600">Đã hủy</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.daHuy}</p></div>
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center"><XCircle className="h-6 w-6 text-red-500" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ══ BỘ LỌC TÌM KIẾM ════════════════════════════════════════════ */}
                <Card className="border-0 shadow-lg bg-white">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900"><Filter className="h-5 w-5 text-purple-600" />Bộ lọc tìm kiếm</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Số phiếu / PO</Label>
                                <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input placeholder="Nhập số phiếu hoặc PO" className="pl-9 border-gray-200 focus:border-purple-500 focus:ring-purple-500" value={filters.keyword} onChange={(e) => setFilters((p) => ({ ...p, keyword: e.target.value, page: 0 }))} disabled={loading} /></div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Nhà cung cấp</Label>
                                <Input placeholder="Tên nhà cung cấp" className="border-gray-200 focus:border-purple-500 focus:ring-purple-500" value={filters.nhaCungCap} onChange={(e) => setFilters((p) => ({ ...p, nhaCungCap: e.target.value, page: 0 }))} disabled={loading} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Trạng thái</Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between bg-white border-gray-200 hover:bg-gray-50 font-normal">
                                            <span className="truncate">{STATUS_OPTIONS.find((s) => s.value === filters.trangThai)?.label || "Tất cả trạng thái"}</span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                        {STATUS_OPTIONS.map((s) => (<DropdownMenuItem key={s.value} onClick={() => setFilters((p) => ({ ...p, trangThai: s.value, page: 0 }))} className="flex items-center justify-between cursor-pointer hover:bg-purple-50">{s.label}{filters.trangThai === s.value && <Check className="h-4 w-4" />}</DropdownMenuItem>))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Ngày nhập</Label>
                                <Input type="date" value={filters.ngayNhap} onChange={(e) => setFilters((p) => ({ ...p, ngayNhap: e.target.value, page: 0 }))} className="border-gray-200 focus:border-purple-500 focus:ring-purple-500" disabled={loading} />
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={handleReset} disabled={loading} className="flex items-center gap-2 w-full transition-all duration-300 hover:bg-slate-900 hover:text-white border-gray-300"><RefreshCcw className="h-4 w-4" />Đặt lại</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ══ ACTION BUTTONS ══════════════════════════════════════════════ */}
                <div className="flex items-center justify-end gap-3">
                    <Link to="/goods-receipts/create">
                        <Button className="bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm transition-all duration-200"><Plus className="w-4 h-4 mr-2" />Tạo Phiếu Nhập Kho</Button>
                    </Link>
                </div>

                {/* ══ TABLE / LOADING / EMPTY ═════════════════════════════════════ */}
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /><span className="ml-3 text-gray-600">Đang tải danh sách phiếu nhập kho...</span></div>
                ) : data.length === 0 ? (
                    <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100"><ClipboardList className="h-10 w-10 text-slate-400" /></div>
                            <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy phiếu nhập kho</h3>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Hiện tại chưa có dữ liệu phù hợp. Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                            <div className="overflow-x-auto overflow-y-auto max-h-[520px]">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="border-b border-slate-200 bg-slate-50">
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 w-14">STT</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Số phiếu</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Đơn mua</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Nhà cung cấp</th>
                                            <th className="h-12 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Kho</th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Ngày tạo</th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Ngày nhập</th>
                                            <th className="h-12 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((item, index) => (
                                            <tr key={item.id} onClick={() => navigate(`/goods-receipts/${item.id}`)} className="cursor-pointer transition-colors duration-150 hover:bg-violet-50/50">
                                                <td className="px-4 py-3.5 align-middle text-center w-14"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{filters.page * filters.size + index + 1}</span></td>
                                                <td className="px-4 py-3.5 align-middle font-semibold text-violet-600">{item.soPhieuNhap}</td>
                                                <td className="px-4 py-3.5 align-middle text-slate-600">{item.soDonMua || "-"}</td>
                                                <td className="px-4 py-3.5 align-middle">{item.tenNhaCungCap}</td>
                                                <td className="px-4 py-3.5 align-middle">{item.tenKho}</td>
                                                <td className="px-4 py-3.5 align-middle text-center"><span className="text-sm text-slate-500">{new Date(item.ngayTao).toLocaleDateString("vi-VN")}</span></td>
                                                <td className="px-4 py-3.5 align-middle text-center"><span className="text-sm text-slate-500">{item.ngayNhap ? new Date(item.ngayNhap).toLocaleDateString("vi-VN") : "Chưa nhập kho"}</span></td>
                                                <td className="px-4 py-3.5 align-middle text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_MAP[item.trangThai]?.className}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_MAP[item.trangThai]?.dot}`} />
                                                        {STATUS_MAP[item.trangThai]?.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ── Pagination ── */}
                        <Card className="border-0 shadow-md bg-white">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">{filters.size} dòng<ChevronDown className="h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                                {[5, 10, 20, 50, 100].map(size => (<DropdownMenuItem key={size} onClick={() => setFilters((p) => ({ ...p, size, page: 0 }))} className="cursor-pointer">{size} dòng</DropdownMenuItem>))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Hiển thị <span className="font-semibold text-gray-900">{filters.page * filters.size + 1}</span> - <span className="font-semibold text-gray-900">{Math.min((filters.page + 1) * filters.size, total)}</span> trong tổng số <span className="font-semibold text-purple-600">{total}</span> kết quả
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))} disabled={filters.page === 0} className="gap-1 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Trước</Button>
                                        <div className="hidden sm:flex gap-1">
                                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;
                                                if (totalPages <= 5) pageNum = idx;
                                                else if (filters.page < 3) pageNum = idx;
                                                else if (filters.page > totalPages - 4) pageNum = totalPages - 5 + idx;
                                                else pageNum = filters.page - 2 + idx;
                                                return (<Button key={idx} variant={filters.page === pageNum ? "default" : "outline"} size="sm" onClick={() => setFilters((p) => ({ ...p, page: pageNum }))} className={filters.page === pageNum ? "bg-slate-900 text-white border border-slate-900 hover:bg-white hover:text-slate-900 shadow-sm" : "border-gray-200"}>{pageNum + 1}</Button>);
                                            })}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))} disabled={filters.page + 1 >= totalPages} className="gap-1 disabled:opacity-50">Sau <ChevronRight className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}

