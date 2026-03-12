import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Edit, Trash2, Search, ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Shadcn & UI Components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// Services
import { mauSacService, sizeService } from "@/services/attributeService";
import { getAllChatLieu, deleteChatLieu, createChatLieu, updateChatLieu } from "@/services/chatLieuService";

// Schema validation (Không còn trường trạng thái)
const formSchema = z.object({
    ten: z.string().min(1, "Tên không được để trống"),
    ma: z.string().min(1, "Mã không được để trống"),
    maMauHex: z.string().optional(),
    loaiSize: z.string().optional(),
    thuTuSapXep: z.coerce.number().optional(),
    moTa: z.string().optional(),
});

const ProductAttributeHub = () => {
    const [activeTab, setActiveTab] = useState('color');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({ keyword: "", page: 0, size: 10 });
    const [modalConfig, setModalConfig] = useState({ open: false, mode: 'add', item: null });
    const [deleteConfig, setDeleteConfig] = useState({ open: false, item: null });
    const [viewItem, setViewItem] = useState(null);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { ten: "", ma: "", maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" }
    });

    // --- MAPPING LOGIC ---
    const mapToForm = (item) => {
        if (activeTab === 'color') return { ma: item.maMau, ten: item.tenMau, maMauHex: item.maMauHex || "#000000" };
        if (activeTab === 'size') return { ma: item.maSize, ten: item.tenSize, loaiSize: item.loaiSize, thuTuSapXep: item.thuTuSapXep, moTa: item.moTa };
        if (activeTab === 'material') return { ma: item.maChatLieu, ten: item.tenChatLieu, moTa: item.moTa };
    };

    const mapToPayload = (values) => {
        if (activeTab === 'color') return { maMau: values.ma, tenMau: values.ten, maMauHex: values.maMauHex };
        if (activeTab === 'size') return { maSize: values.ma, tenSize: values.ten, loaiSize: values.loaiSize, thuTuSapXep: values.thuTuSapXep, moTa: values.moTa };
        if (activeTab === 'material') return { maChatLieu: values.ma, tenChatLieu: values.ten, moTa: values.moTa };
    };

    // --- FETCH DATA (SEARCH MÃ + TÊN) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            const filterList = [];
            if (filters.keyword?.trim()) {
                const kw = filters.keyword.trim();
                const fields = activeTab === 'color' ? ['tenMau', 'maMau'] :
                    activeTab === 'size' ? ['tenSize', 'maSize'] : ['tenChatLieu', 'maChatLieu'];
                fields.forEach(f => filterList.push({ fieldName: f, operation: "LIKE", value: kw, logicType: "OR" }));
            }

            const payload = { page: filters.page, size: filters.size, filters: filterList, sorts: [{ fieldName: "id", direction: "DESC" }] };

            if (activeTab === 'color') {
                res = await mauSacService.filter(payload);
                setData(res.data.content || []);
                setTotal(res.data.totalElements || 0);
            } else if (activeTab === 'size') {
                res = await sizeService.filter(payload);
                setData(res.data.content || []);
                setTotal(res.data.totalElements || 0);
            } else {
                const resData = await getAllChatLieu(filters.keyword);
                setData(resData || []);
                setTotal(resData.length || 0);
            }
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    }, [activeTab, filters]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleReset = () => setFilters({ keyword: "", page: 0, size: 10 });

    const generateAutoCode = () => {
        const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        if (activeTab === 'color') return `MS-${randomDigits}`;
        if (activeTab === 'material') return `CL-${randomDigits}`;
        return '';
    };

    const getTabLabel = () => {
        if (activeTab === 'color') return 'màu sắc';
        if (activeTab === 'material') return 'chất liệu';
        return activeTab;
    };

    const handleOpenModal = (mode, item = null) => {
        if (mode === 'view') {
            setViewItem(item);
        } else {
            setModalConfig({ open: true, mode, item });
            if (item) form.reset(mapToForm(item));
            else {
                const autoCode = mode === 'add' && (activeTab === 'color' || activeTab === 'material') ? generateAutoCode() : '';
                form.reset({ ten: "", ma: autoCode, maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" });
            }
        }
    };

    const onSubmit = async (values) => {
        try {
            const payload = mapToPayload(values);
            if (modalConfig.mode === 'add') {
                activeTab === 'color' ? await mauSacService.create(payload) : activeTab === 'size' ? await sizeService.create(payload) : await createChatLieu(payload);
                toast.success("Thêm mới thành công");
            } else {
                const id = modalConfig.item.id;
                activeTab === 'color' ? await mauSacService.update({ id, ...payload }) : activeTab === 'size' ? await sizeService.update({ id, ...payload }) : await updateChatLieu(id, payload);
                toast.success("Cập nhật thành công");
            }
            setModalConfig({ open: false, mode: 'add', item: null });
            fetchData();
        } catch (error) {
            toast.error("Thao tác thất bại");
        }
    };

    const confirmDelete = async () => {
        try {
            activeTab === 'color' ? await mauSacService.delete(deleteConfig.item.id) : activeTab === 'size' ? await sizeService.delete(deleteConfig.item.id) : await deleteChatLieu(deleteConfig.item.id);
            toast.success("Xóa thành công");
            setDeleteConfig({ open: false, item: null });
            fetchData();
        } catch (error) { toast.error("Xóa thất bại"); }
    };

    const totalPages = Math.ceil(total / filters.size);

    return (
        <main className="flex-1 bg-gray-50/30 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); handleReset(); }}>
                    <TabsList className="bg-white border shadow-sm h-12">
                        <TabsTrigger value="color" className="px-10 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Màu sắc</TabsTrigger>
                        <TabsTrigger value="size" className="px-10 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Kích cỡ</TabsTrigger>
                        <TabsTrigger value="material" className="px-10 data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">Chất liệu</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Filters */}
                <section className="bg-white border rounded-xl p-4 shadow-sm flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[300px]">
                        <label className="text-xs text-gray-600 font-bold  tracking-widest">Tìm kiếm mã hoặc tên</label>
                        <div className="relative mt-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                value={filters.keyword}
                                onChange={(e) => setFilters(p => ({ ...p, keyword: e.target.value, page: 0 }))}
                                placeholder="Nhập từ khóa tìm kiếm..."
                                className="w-full h-11 pl-10 pr-3 rounded-md border focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>
                    <button onClick={handleReset} className="h-11 px-6 flex items-center gap-2 text-sm border border-gray-300 rounded-md transition-all text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300">
                        <RotateCcw className="h-4 w-4" /> Reset Bộ Lọc
                    </button>
                </section>

                {/* Table */}
                <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b border-slate-200">
                        <span className="text-sm font-bold text-slate-800">Danh sách {getTabLabel()}</span>
                        <button onClick={() => handleOpenModal('add')} className="px-4 py-2 text-sm font-bold text-white rounded-md bg-purple-600 hover:bg-purple-700 shadow-md flex items-center gap-2 transition-all">
                            <Plus className="h-4 w-4" /> Thêm mới
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="h-12 px-4 py-0 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase w-16">STT</th>
                                    <th className="h-12 px-4 py-0 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Mã</th>
                                    <th className="h-12 px-4 py-0 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Tên hiển thị</th>
                                    {activeTab === 'color' && <th className="h-12 px-4 py-0 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Màu sắc</th>}
                                    {activeTab === 'size' && <th className="h-12 px-4 py-0 text-left font-semibold text-slate-600 tracking-wide text-xs uppercase">Phân loại</th>}
                                    <th className="h-12 px-4 py-0 text-center font-semibold text-slate-600 tracking-wide text-xs uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center animate-pulse text-slate-400 font-bold">Đang tải...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-slate-400 font-bold italic">Không có dữ liệu</td></tr>
                                ) : data.map((item, index) => (
                                    <tr key={item.id} className="transition-colors duration-150 hover:bg-purple-50/50" onClick={() => handleOpenModal('edit', item)}>
                                        <td className="px-4 py-3.5 align-middle text-slate-500 font-medium">{(filters.page * filters.size) + index + 1}</td>
                                        <td className="px-4 py-3.5 align-middle font-bold text-purple-600 tracking-wide">{item.maMau || item.maSize || item.maChatLieu}</td>
                                        <td className="px-4 py-3.5 align-middle font-semibold text-slate-900">{item.tenMau || item.tenSize || item.tenChatLieu}</td>
                                        {activeTab === 'color' && (
                                            <td className="px-4 py-3.5 align-middle">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded border border-slate-300 shadow-sm" style={{ backgroundColor: item.maMauHex }} />
                                                    <span className="font-mono text-xs text-slate-500">{item.maMauHex}</span>
                                                </div>
                                            </td>
                                        )}
                                        {activeTab === 'size' && <td className="px-4 py-3.5 align-middle text-slate-600 font-medium text-sm">Loại: {item.loaiSize || 'N/A'} - TT: {item.thuTuSapXep}</td>}
                                        <td className="px-4 py-3.5 align-middle">
                                            <div className="flex items-center justify-center gap-1">
                                                <button type="button" title="Xem chi tiết" onClick={(e) => { e.stopPropagation(); handleOpenModal('view', item); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-violet-600 hover:bg-violet-50 hover:border-violet-200 transition-all duration-150 hover:scale-110 active:scale-95"><Eye className="h-4 w-4" /></button>
                                                <button type="button" title="Chỉnh sửa" onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', item); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-150 hover:scale-110 active:scale-95"><Edit className="h-4 w-4" /></button>
                                                <button type="button" title="Xóa" onClick={(e) => { e.stopPropagation(); setDeleteConfig({ open: true, item }); }} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-red-500 hover:bg-red-50 hover:border-red-200 transition-all duration-150 hover:scale-110 active:scale-95"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-slate-200 bg-white p-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Left side - Page size selector */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-slate-600 whitespace-nowrap font-medium">Hiển thị:</label>
                                <select value={filters.size} onChange={(e) => setFilters(p => ({ ...p, size: Number(e.target.value), page: 0 }))} className="h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                                    {[10, 20, 30, 40, 50].map(s => <option key={s} value={s}>{s} dòng</option>)}
                                </select>
                            </div>

                            {/* Center - Page info */}
                            <div className="text-sm text-slate-600 font-medium">
                                Hiển thị{' '}
                                <span className="font-semibold text-slate-900">
                                    {filters.page * filters.size + 1}
                                </span>
                                {' '}-{' '}
                                <span className="font-semibold text-slate-900">
                                    {Math.min((filters.page + 1) * filters.size, total)}
                                </span>
                                {' '}trong tổng số{' '}
                                <span className="font-semibold text-purple-600">{total}</span> kết quả
                            </div>

                            {/* Right side - Navigation buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
                                    disabled={filters.page === 0}
                                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-1 flex items-center"
                                >
                                    Trước
                                </button>

                                {/* Page numbers */}
                                <div className="hidden sm:flex gap-1">
                                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = idx;
                                        } else if (filters.page < 3) {
                                            pageNum = idx;
                                        } else if (filters.page > totalPages - 4) {
                                            pageNum = totalPages - 5 + idx;
                                        } else {
                                            pageNum = filters.page - 2 + idx;
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setFilters(p => ({ ...p, page: pageNum }))}
                                                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all min-w-[32px] ${
                                                    filters.page === pageNum
                                                        ? 'bg-purple-600 text-white shadow-sm'
                                                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
                                    disabled={filters.page + 1 >= totalPages}
                                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all gap-1 flex items-center"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Unified Modal (Thêm mới/Chỉnh sửa) */}
            <Dialog open={modalConfig.open} onOpenChange={(o) => setModalConfig({ ...modalConfig, open: o })}>
                <DialogContent className="w-[95vw] max-w-2xl !bg-white !text-slate-950 rounded-2xl border border-gray-200 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chỉnh sửa'} {getTabLabel()}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            {modalConfig.mode === 'add' ? 'Điền thông tin để tạo ' : 'Cập nhật thông tin '}{getTabLabel()} mới
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ma" className="text-sm text-gray-600 font-normal">
                                    Mã định danh *
                                    {modalConfig.mode === 'add' && (activeTab === 'color' || activeTab === 'material') && (
                                        <span className="text-xs text-purple-600 ml-2 font-semibold"></span>
                                    )}
                                </Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="ma" 
                                        {...form.register("ma")} 
                                        placeholder={
                                            modalConfig.mode === 'add' && activeTab === 'color' ? 'MS-0000' :
                                            modalConfig.mode === 'add' && activeTab === 'material' ? 'CL-0000' :
                                            'Nhập mã...'
                                        }
                                        className="h-11 bg-white border-gray-200 font-semibold text-purple-600" 
                                    />
                                    {modalConfig.mode === 'add' && (activeTab === 'color' || activeTab === 'material') && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => form.setValue('ma', generateAutoCode())}
                                            title="Tạo mã mới"
                                            className="h-11 w-11 border-gray-200"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                {form.formState.errors.ma && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{form.formState.errors.ma.message}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ten" className="text-sm text-gray-600 font-normal">Tên hiển thị *</Label>
                                <Input id="ten" {...form.register("ten")} placeholder="Nhập tên..." className="h-11 bg-white border-gray-200" />
                                {form.formState.errors.ten && (
                                    <Alert variant="destructive" className="py-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">{form.formState.errors.ten.message}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        {activeTab === 'color' && (
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 font-normal">Mã màu sắc (Hex)</Label>
                                <div className="flex gap-3">
                                    <input type="color" className="h-11 w-16 rounded border border-gray-200 cursor-pointer p-1 bg-white" {...form.register("maMauHex")} />
                                    <Input {...form.register("maMauHex")} className="flex-1 h-11 bg-white border-gray-200 font-mono text-sm" placeholder="#000000" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'size' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 font-normal">Loại Kích Cỡ</Label>
                                    <Input {...form.register("loaiSize")} placeholder="VD: Chữ/Số" className="h-11 bg-white border-gray-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 font-normal">Thứ tự ưu tiên</Label>
                                    <Input type="number" {...form.register("thuTuSapXep")} className="h-11 bg-white border-gray-200" />
                                </div>
                            </div>
                        )}

                        {(activeTab === 'material' || activeTab === 'size') && (
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-600 font-normal">Mô tả chi tiết</Label>
                                <Textarea {...form.register("moTa")} rows={3} placeholder="Ghi chú thêm thông tin..." className="resize-none border-gray-200 bg-white" />
                            </div>
                        )}

                        <DialogFooter className="border-t pt-6 gap-3">
                            <Button type="button" variant="ghost" onClick={() => setModalConfig({ ...modalConfig, open: false })} className="h-11 font-semibold text-sm">Đóng</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-8 font-semibold text-sm shadow-lg shadow-purple-100">
                                <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <Dialog open={deleteConfig.open} onOpenChange={(o) => setDeleteConfig({ ...deleteConfig, open: o })}>
                <DialogContent className="w-[95vw] max-w-md !bg-white !text-slate-950 rounded-2xl border border-gray-200 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-red-600">
                            Xác nhận xóa
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Vui lòng xác nhận hành động xóa này
                        </DialogDescription>
                    </DialogHeader>
                    <p className="py-4 text-slate-700 text-base font-medium">
                        Bạn chắc chắn muốn xóa bản ghi này? 
                        <br />
                        <span className="text-red-600 text-sm font-bold block mt-2">⚠️ Hành động này không thể hoàn tác.</span>
                    </p>
                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setDeleteConfig({ open: false, item: null })} className="h-11 flex-1 font-semibold text-sm">Hủy</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="h-11 flex-1 bg-red-600 hover:bg-red-700 font-semibold text-sm shadow-lg shadow-red-100">Xóa vĩnh viễn</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Modal - Detail */}
            <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
                <DialogContent className="w-[95vw] max-w-2xl !bg-white !text-slate-950 rounded-2xl border border-gray-200 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Chi tiết thông tin {getTabLabel()}
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                            Xem các thông tin chi tiết về {getTabLabel()}
                        </DialogDescription>
                    </DialogHeader>
                    {viewItem && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 font-normal">Mã định danh</Label>
                                    <p className="font-semibold text-base text-slate-900">{viewItem.maMau || viewItem.maSize || viewItem.maChatLieu}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 font-normal">Tên hiển thị</Label>
                                    <p className="font-semibold text-base text-slate-900">{viewItem.tenMau || viewItem.tenSize || viewItem.tenChatLieu}</p>
                                </div>
                            </div>
                            {activeTab === 'color' && (
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 font-normal">Mã màu (Hex)</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded border-2 border-gray-300 shadow-sm" style={{ backgroundColor: viewItem.maMauHex }} />
                                        <p className="font-mono text-base font-semibold text-slate-900">{viewItem.maMauHex}</p>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'size' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600 font-normal">Loại kích cỡ</Label>
                                            <p className="font-semibold text-base text-slate-900">{viewItem.loaiSize || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600 font-normal">Thứ tự ưu tiên</Label>
                                            <p className="font-semibold text-base text-slate-900">{viewItem.thuTuSapXep}</p>
                                        </div>
                                    </div>
                                    {viewItem.moTa && (
                                        <div className="space-y-2">
                                            <Label className="text-sm text-gray-600 font-normal">Mô tả</Label>
                                            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{viewItem.moTa}</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {activeTab === 'material' && (
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-600 font-normal">Mô tả</Label>
                                    <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{viewItem.moTa || 'N/A'}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="border-t pt-6">
                        <Button type="button" variant="ghost" onClick={() => setViewItem(null)} className="h-11 font-semibold text-sm">Đóng</Button>
                        <Button type="button" onClick={() => { handleOpenModal('edit', viewItem); setViewItem(null); }} className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-6 font-semibold text-sm shadow-lg shadow-blue-100">
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
};

export default ProductAttributeHub;