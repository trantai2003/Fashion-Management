// src/pages/attributes/ColorSizeManagement.jsx
import { useState, useEffect } from 'react';
import {
    Plus, Pencil, Trash2, Eye, ChevronLeft, ChevronRight,
    Palette, Ruler, Loader2, AlertTriangle, Search, Filter, RefreshCcw, Check, ChevronDown, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { mauSacService, sizeService } from "@/services/attributeService";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold Luxury
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.lux-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 32px;
  font-family: 'DM Sans', system-ui, sans-serif;
}

.lux-inner { max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }

.lux-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  padding-bottom: 24px; border-bottom: 1.5px solid rgba(184,134,11,0.15);
}
.lux-title {
  font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 900; color: #1a1612;
}
.lux-title span { color: #b8860b; }

.lux-tabs-list {
  background: rgba(184,134,11,0.05) !important; border: 1px solid rgba(184,134,11,0.1) !important;
  padding: 4px !important; border-radius: 14px !important;
}
.lux-tab-trigger {
  font-family: 'DM Mono', monospace !important; font-size: 11px !important;
  font-weight: 700 !important; text-transform: uppercase !important;
  padding: 8px 20px !important; border-radius: 10px !important; color: #7a6e5f !important;
}
.lux-tab-trigger[data-state='active'] {
  background: #fff !important; color: #b8860b !important; box-shadow: 0 4px 10px rgba(184,134,11,0.1) !important;
}

.lux-filter {
  background: #fff; border-radius: 20px; border: 1px solid rgba(184,134,11,0.15);
  padding: 24px; box-shadow: 0 4px 20px rgba(100,80,30,0.06);
  display: flex; align-items: flex-end; gap: 20px;
}

.wh-tbl-card {
  background: #fff; border-radius: 24px; border: 1px solid rgba(184,134,11,0.15);
  overflow: hidden; box-shadow: 0 10px 40px rgba(100,80,30,0.08);
}
.wh-tbl { width: 100%; border-collapse: collapse; }
.wh-th {
  height: 52px; padding: 0 20px; background: #faf8f3;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  color: rgba(184,134,11,0.6); text-transform: uppercase; letter-spacing: 0.1em;
  text-align: left; border-bottom: 2px solid rgba(184,134,11,0.12);
}
.wh-td { 
  padding: 14px 20px; border-bottom: 1px solid rgba(184,134,11,0.08);
  font-size: 14px; color: #1a1612;
}
.wh-tr:hover .wh-td { background: rgba(184,134,11,0.03); }

.btn-gold {
  height: 48px; padding: 0 24px; border-radius: 12px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff; font-size: 14px; font-weight: 700;
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  box-shadow: 0 4px 15px rgba(184,134,11,0.3); transition: all 0.2s;
}
.btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(184,134,11,0.45); }

.btn-white {
  height: 48px; padding: 0 24px; border-radius: 12px;
  background: #fff; border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
}
.btn-white:hover { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }

.act-btn {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: rgba(184,134,11,0.6);
}
.act-btn:hover { background: rgba(184,134,11,0.1); color: #b8860b; transform: scale(1.1); }
.act-btn.red:hover { background: rgba(220,38,38,0.1); color: #dc2626; }
`;

const PaginationBar = ({ page, totalPages, total, pageSize, onPageChange }) => (
    <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-rgba(184,134,11,0.1)">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Displaying {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total}
        </span>
        <div className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => onPageChange(page - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="font-mono text-xs font-bold px-4">{page + 1} / {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
    </div>
);

const ColorSizeManagement = () => {
    const [activeTab, setActiveTab] = useState('color');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [colorSearch, setColorSearch] = useState('');
    const [sizeSearch, setSizeSearch] = useState('');

    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [totalColors, setTotalColors] = useState(0);
    const [totalSizes, setTotalSizes] = useState(0);
    const [colorPage, setColorPage] = useState(0);
    const [colorLimit, setColorLimit] = useState(10);
    const [sizePage, setSizePage] = useState(0);
    const [sizeLimit, setSizeLimit] = useState(10);
    const [loadingColor, setLoadingColor] = useState(false);
    const [loadingSize, setLoadingSize] = useState(false);

    const [formData, setFormData] = useState({
        tenMau: '', maMau: '', maMauHex: '#000000',
        maSize: '', tenSize: '', loaiSize: '', thuTuSapXep: '', moTa: '',
    });

    const fetchColors = async () => {
        setLoadingColor(true);
        try {
            const res = await mauSacService.filter({ page: colorPage, size: colorLimit, filters: [] });
            if (res.status === 200) {
                setColors(res.data.content);
                setTotalColors(res.data.totalElements);
            }
        } catch { toast.error("Không thể tải danh sách màu"); }
        finally { setLoadingColor(false); }
    };

    const fetchSizes = async () => {
        setLoadingSize(true);
        try {
            const res = await sizeService.filter({ page: sizePage, size: sizeLimit, filters: [] });
            if (res.status === 200) {
                setSizes(res.data.content);
                setTotalSizes(res.data.totalElements);
            }
        } catch { toast.error("Không thể tải danh sách size"); }
        finally { setLoadingSize(false); }
    };

    useEffect(() => { fetchColors(); }, [colorPage, colorLimit]);
    useEffect(() => { fetchSizes();  }, [sizePage,  sizeLimit]);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        if (item) {
            setFormData(activeTab === 'color' 
                ? { tenMau: item.tenMau, maMau: item.maMau || '', maMauHex: item.maMauHex || '#000000' }
                : { maSize: item.maSize || '', tenSize: item.tenSize || '', loaiSize: item.loaiSize || '', thuTuSapXep: item.thuTuSapXep || '', moTa: item.moTa || '' }
            );
        } else {
            setFormData(activeTab === 'color' 
                ? { tenMau: '', maMau: '', maMauHex: '#000000' }
                : { maSize: '', tenSize: '', loaiSize: '', thuTuSapXep: '', moTa: '' }
            );
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            let res;
            if (activeTab === 'color') {
                res = modalMode === 'add' ? await mauSacService.create(formData) : await mauSacService.update({ id: selectedItem.id, ...formData });
            } else {
                res = modalMode === 'add' ? await sizeService.create(formData) : await sizeService.update({ id: selectedItem.id, ...formData });
            }
            if (res.status === 200) {
                toast.success(modalMode === 'add' ? "Thêm mới thành công" : "Cập nhật thành công");
                activeTab === 'color' ? fetchColors() : fetchSizes();
                setShowModal(false);
            }
        } catch { toast.error("Có lỗi xảy ra"); }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = activeTab === 'color' ? await mauSacService.delete(deleteTarget.id) : await sizeService.delete(deleteTarget.id);
            if (res.status === 200) {
                toast.success("Xóa thành công");
                activeTab === 'color' ? fetchColors() : fetchSizes();
            }
        } catch { toast.error("Có lỗi xảy ra khi xóa"); }
        finally { setIsDeleting(false); setDeleteTarget(null); }
    };

    const filteredColors = colors.filter(c => !colorSearch.trim() || c.tenMau?.toLowerCase().includes(colorSearch.toLowerCase()) || c.maMau?.toLowerCase().includes(colorSearch.toLowerCase()));
    const filteredSizes = sizes.filter(s => !sizeSearch.trim() || s.tenSize?.toLowerCase().includes(sizeSearch.toLowerCase()) || s.maSize?.toLowerCase().includes(sizeSearch.toLowerCase()));

    return (
        <div className="lux-root">
            <style>{STYLES}</style>
            <div className="lux-inner">
                <header className="lux-header">
                    <h1 className="lux-title">Danh mục <span>thuộc tính</span></h1>
                    <button className="btn-gold" onClick={() => handleOpenModal('add')}>
                        <Plus size={18} /> Thêm {activeTab === 'color' ? 'màu' : 'size'} mới
                    </button>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="lux-tabs-list">
                        <TabsTrigger value="color" className="lux-tab-trigger"><Palette size={14} className="mr-2"/>Màu sắc</TabsTrigger>
                        <TabsTrigger value="size" className="lux-tab-trigger"><Ruler size={14} className="mr-2"/>Kích cỡ</TabsTrigger>
                    </TabsList>

                    <TabsContent value="color" className="mt-6 space-y-6">
                        <section className="lux-filter">
                            <div className="flex-1 flex flex-col gap-2">
                                <Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold tracking-widest">Search colors</Label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-4 text-slate-400" />
                                    <Input placeholder="Mã hoặc tên màu..." className="lux-input pl-12" value={colorSearch} onChange={e => setColorSearch(e.target.value)} />
                                </div>
                            </div>
                            <button className="btn-white" onClick={() => setColorSearch('')}><RefreshCcw size={16} /> Reset</button>
                        </section>
                        <div className="wh-tbl-card">
                            <table className="wh-tbl">
                                <thead>
                                    <tr>
                                        <th className="wh-th w-16 text-center">STT</th>
                                        <th className="wh-th">Mã màu</th>
                                        <th className="wh-th">Tên màu</th>
                                        <th className="wh-th">HEX Code</th>
                                        <th className="wh-th text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredColors.map((c, i) => (
                                        <tr key={c.id} className="wh-tr">
                                            <td className="wh-td text-center text-xs font-mono text-slate-400">{colorPage * colorLimit + i + 1}</td>
                                            <td className="wh-td"><span className="font-mono font-bold text-[#b8860b]">{c.maMau}</span></td>
                                            <td className="wh-td font-bold">{c.tenMau}</td>
                                            <td className="wh-td">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md border" style={{ background: c.maMauHex }} />
                                                    <span className="font-mono text-xs">{c.maMauHex}</span>
                                                </div>
                                            </td>
                                            <td className="wh-td text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button className="act-btn" onClick={() => handleOpenModal('view', c)}><Eye size={16}/></button>
                                                    <button className="act-btn" onClick={() => handleOpenModal('edit', c)}><Pencil size={16}/></button>
                                                    <button className="act-btn red" onClick={() => setDeleteTarget(c)}><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalColors > 0 && <PaginationBar page={colorPage} totalPages={Math.ceil(totalColors/colorLimit)} total={totalColors} pageSize={colorLimit} onPageChange={setColorPage} />}
                    </TabsContent>

                    <TabsContent value="size" className="mt-6 space-y-6">
                        <section className="lux-filter">
                            <div className="flex-1 flex flex-col gap-2">
                                <Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold tracking-widest">Search sizes</Label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-4 text-slate-400" />
                                    <Input placeholder="Mã hoặc tên size..." className="lux-input pl-12" value={sizeSearch} onChange={e => setSizeSearch(e.target.value)} />
                                </div>
                            </div>
                            <button className="btn-white" onClick={() => setSizeSearch('')}><RefreshCcw size={16} /> Reset</button>
                        </section>
                        <div className="wh-tbl-card">
                            <table className="wh-tbl">
                                <thead>
                                    <tr>
                                        <th className="wh-th w-16 text-center">STT</th>
                                        <th className="wh-th">Mã size</th>
                                        <th className="wh-th">Tên size</th>
                                        <th className="wh-th">Phân loại</th>
                                        <th className="wh-th text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSizes.map((s, i) => (
                                        <tr key={s.id} className="wh-tr">
                                            <td className="wh-td text-center text-xs font-mono text-slate-400">{sizePage * sizeLimit + i + 1}</td>
                                            <td className="wh-td"><span className="font-mono font-bold text-[#b8860b]">{s.maSize}</span></td>
                                            <td className="wh-td font-bold">{s.tenSize}</td>
                                            <td className="wh-td text-xs text-slate-500">{s.loaiSize || '—'}</td>
                                            <td className="wh-td text-center">
                                                <div className="flex justify-center gap-1">
                                                    <button className="act-btn" onClick={() => handleOpenModal('view', s)}><Eye size={16}/></button>
                                                    <button className="act-btn" onClick={() => handleOpenModal('edit', s)}><Pencil size={16}/></button>
                                                    <button className="act-btn red" onClick={() => setDeleteTarget(s)}><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalSizes > 0 && <PaginationBar page={sizePage} totalPages={Math.ceil(totalSizes/sizeLimit)} total={totalSizes} pageSize={sizeLimit} onPageChange={setSizePage} />}
                    </TabsContent>
                </Tabs>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="lux-dialog-content max-w-md">
                    <div className="lux-dialog-head">
                        <DialogTitle className="lux-title text-2xl">
                            {modalMode === 'add' ? 'Thêm mới' : modalMode === 'edit' ? 'Cập nhật' : 'Chi tiết'} <span>{activeTab === 'color' ? 'màu' : 'size'}</span>
                        </DialogTitle>
                    </div>
                    <div className="lux-dialog-body">
                        {activeTab === 'color' ? (
                            <>
                                <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Account Name</Label>
                                    <Input disabled={modalMode === 'view'} value={formData.tenMau} onChange={e => setFormData({...formData, tenMau: e.target.value})} className="lux-input" placeholder="Tên màu" /></div>
                                <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Unique Code</Label>
                                    <Input disabled={modalMode === 'view'} value={formData.maMau} onChange={e => setFormData({...formData, maMau: e.target.value})} className="lux-input font-mono" placeholder="Mã màu" /></div>
                                <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Hex Visual</Label>
                                    <div className="flex gap-3 items-center">
                                        <input type="color" disabled={modalMode === 'view'} value={formData.maMauHex} onChange={e => setFormData({...formData, maMauHex: e.target.value})} className="h-10 w-14 rounded-lg bg-white p-1 border" />
                                        <Input disabled={modalMode === 'view'} value={formData.maMauHex} onChange={e => setFormData({...formData, maMauHex: e.target.value})} className="lux-input flex-1 font-mono" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Size ID</Label>
                                        <Input disabled={modalMode === 'view'} value={formData.maSize} onChange={e => setFormData({...formData, maSize: e.target.value})} className="lux-input font-mono" /></div>
                                    <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Display Name</Label>
                                        <Input disabled={modalMode === 'view'} value={formData.tenSize} onChange={e => setFormData({...formData, tenSize: e.target.value})} className="lux-input" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Category</Label>
                                        <Input disabled={modalMode === 'view'} value={formData.loaiSize} onChange={e => setFormData({...formData, loaiSize: e.target.value})} className="lux-input" /></div>
                                    <div className="space-y-1"><Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold">Priority</Label>
                                        <Input type="number" disabled={modalMode === 'view'} value={formData.thuTuSapXep} onChange={e => setFormData({...formData, thuTuSapXep: e.target.value})} className="lux-input" /></div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="lux-dialog-foot">
                        <button className="btn-white" onClick={() => setShowModal(false)}>{modalMode === 'view' ? 'Đóng' : 'Hủy'}</button>
                        {modalMode !== 'view' && <button className="btn-gold" onClick={handleSubmit}>Lưu thông tin</button>}
                    </div>
                </DialogContent>
            </Dialog>

            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl overflow-hidden border border-red-100">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32}/></div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Delete attribute?</h2>
                        <p className="text-sm text-slate-500 mb-8 px-4">This action cannot be undone. Are you sure you want to proceed?</p>
                        <div className="flex flex-col gap-2">
                            <button className="h-12 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all" onClick={handleConfirmDelete} disabled={isDeleting}>Confirm Delete</button>
                            <button className="h-12 rounded-xl text-slate-400 font-bold hover:bg-slate-50 transition-all" onClick={() => setDeleteTarget(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorSizeManagement;