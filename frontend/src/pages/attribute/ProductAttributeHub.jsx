import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Save, RotateCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Shadcn & UI Components
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

    const handleOpenModal = (mode, item = null) => {
        setModalConfig({ open: true, mode, item });
        if (item) form.reset(mapToForm(item));
        else form.reset({ ten: "", ma: "", maMauHex: "#000000", loaiSize: "", thuTuSapXep: 0, moTa: "" });
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
                    <button onClick={handleReset} className="h-11 px-6 flex items-center gap-2 text-sm hover:bg-black hover:text-white border border-gray-300 rounded-md transition-all">
                        <RotateCcw className="h-4 w-4" /> Reset Bộ Lọc
                    </button>
                </section>

                {/* Table */}
                <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b">
                        <span className="text-sm font-bold text-gray-800">Danh sách {activeTab}</span>
                        <button onClick={() => handleOpenModal('add')} className="px-4 py-2 text-sm font-bold text-white rounded-md bg-purple-600 hover:bg-purple-700 shadow-md flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Thêm mới
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-bold  text-[10px]">
                                <tr>
                                    <th className="px-4 py-4 text-left w-16">STT</th>
                                    <th className="px-4 py-4 text-left">Mã</th>
                                    <th className="px-4 py-4 text-left">Tên hiển thị</th>
                                    {activeTab === 'color' && <th className="px-4 py-4 text-left">Màu sắc</th>}
                                    {activeTab === 'size' && <th className="px-4 py-4 text-left">Phân loại</th>}
                                    <th className="px-4 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-10 text-center animate-pulse text-gray-400 font-bold ">Đang tải...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold italic">Không có dữ liệu</td></tr>
                                ) : data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleOpenModal('edit', item)}>
                                        <td className="px-4 py-4 text-gray-400">{(filters.page * filters.size) + index + 1}</td>
                                        <td className="px-4 py-4 font-bold text-purple-600  tracking-tighter">{item.maMau || item.maSize || item.maChatLieu}</td>
                                        <td className="px-4 py-4 font-bold text-gray-800">{item.tenMau || item.tenSize || item.tenChatLieu}</td>
                                        {activeTab === 'color' && (
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded border shadow-inner" style={{ backgroundColor: item.maMauHex }} />
                                                    <span className="font-mono text-xs text-gray-400">{item.maMauHex}</span>
                                                </div>
                                            </td>
                                        )}
                                        {activeTab === 'size' && <td className="px-4 py-4 text-gray-500 font-medium">Loại: {item.loaiSize || 'N/A'} - TT: {item.thuTuSapXep}</td>}
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', item); }} className="p-2 text-amber-500 hover:bg-amber-50 rounded-full"><Pencil className="h-4 w-4" /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfig({ open: true, item }); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t bg-white flex items-center justify-between">
                        <span className="text-xs text-gray-400 ">Đang hiển thị {data.length} / {total}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">Rows:</span>
                            <select value={filters.size} onChange={(e) => setFilters(p => ({ ...p, size: Number(e.target.value), page: 0 }))} className="h-8 w-20 px-2 text-xs border rounded-md">
                                {[10, 20, 30, 40, 50].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div className="flex items-center gap-1">
                                <button disabled={filters.page === 0} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-30">Trước</button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i} onClick={() => setFilters(p => ({ ...p, page: i }))} className={`px-3 py-1 text-sm border rounded min-w-[32px] ${filters.page === i ? "bg-purple-600 text-white font-bold" : "bg-white text-gray-600 hover:bg-gray-50"}`}>{i + 1}</button>
                                ))}
                                <button disabled={filters.page + 1 >= totalPages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-30">Sau</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Unified Modal (Chi tiết/Chỉnh sửa) */}
            <Dialog open={modalConfig.open} onOpenChange={(o) => setModalConfig({ ...modalConfig, open: o })}>
                <DialogContent className="bg-white sm:max-w-lg border-none shadow-2xl">
                    <DialogHeader className="border-b pb-4">
                        <DialogTitle className="text-xl font-black text-gray-800  tracking-tighter">
                            {modalConfig.mode === 'add' ? 'Thêm mới' : 'Chi tiết & Cập nhật'} {activeTab}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs  text-gray-500">Mã định danh *</Label>
                                <Input {...form.register("ma")} placeholder="Nhập mã..." className="h-11  font-bold border-gray-200 focus:ring-purple-500" />
                                {form.formState.errors.ma && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.ma.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs  text-gray-500">Tên hiển thị *</Label>
                                <Input {...form.register("ten")} placeholder="Nhập tên..." className="h-11 font-bold border-gray-200 focus:ring-purple-500" />
                                {form.formState.errors.ten && <p className="text-[10px] text-red-500 font-bold">{form.formState.errors.ten.message}</p>}
                            </div>
                        </div>

                        {activeTab === 'color' && (
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs  text-gray-500">Mã màu sắc (Hex)</Label>
                                <div className="flex gap-3">
                                    <input type="color" className="h-11 w-16 rounded border cursor-pointer p-1" {...form.register("maMauHex")} />
                                    <Input {...form.register("maMauHex")} className="flex-1 h-11 font-mono " placeholder="#000000" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'size' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="font-bold text-xs  text-gray-500">Loại Kích Cỡ</Label>
                                    <Input {...form.register("loaiSize")} placeholder="VD: Chữ/Số" className="h-11" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-bold text-xs  text-gray-500">Thứ tự ưu tiên</Label>
                                    <Input type="number" {...form.register("thuTuSapXep")} className="h-11" />
                                </div>
                            </div>
                        )}

                        {(activeTab === 'material' || activeTab === 'size') && (
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs  text-gray-500">Mô tả chi tiết</Label>
                                <Textarea {...form.register("moTa")} rows={3} placeholder="Ghi chú thêm thông tin..." className="resize-none border-gray-200" />
                            </div>
                        )}

                        <DialogFooter className="mt-8 border-t pt-6 gap-3">
                            <Button type="button" variant="ghost" onClick={() => setModalConfig({ ...modalConfig, open: false })} className="h-11 font-bold  text-xs tracking-widest">Đóng</Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white h-11 px-10 font-bold  text-xs tracking-widest shadow-lg shadow-purple-100">
                                <Save className="mr-2 h-4 w-4" /> Lưu dữ liệu
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete */}
            <Dialog open={deleteConfig.open} onOpenChange={(o) => setDeleteConfig({ ...deleteConfig, open: o })}>
                <DialogContent className="bg-white max-w-sm border-none shadow-2xl">
                    <DialogHeader><DialogTitle className="text-red-600 font-black  italic tracking-tighter">Cảnh báo xóa</DialogTitle></DialogHeader>
                    <p className="py-4 text-gray-600 text-sm font-medium">Bạn chắc chắn muốn xóa bản ghi này? <br /><span className="text-red-500 text-xs font-bold underline">Hành động này không thể hoàn tác.</span></p>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteConfig({ open: false, item: null })} className="h-11 flex-1 font-bold  text-xs">Quay lại</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="h-11 flex-1 bg-red-600 font-bold  text-xs shadow-lg shadow-red-100">Xóa vĩnh viễn</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
};

export default ProductAttributeHub;