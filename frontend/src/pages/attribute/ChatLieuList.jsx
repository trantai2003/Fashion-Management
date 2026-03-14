// src/pages/material/ChatLieuList.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
    Eye, Loader2, Layers, ChevronDown, Filter, RefreshCcw, Check, AlertTriangle, X
} from "lucide-react";
import { toast } from "sonner";
import { getAllChatLieu, deleteChatLieu } from "@/services/chatLieuService";

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
  padding: 16px 20px; border-bottom: 1px solid rgba(184,134,11,0.08);
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

.status-pin {
  display: inline-flex; items-center gap: 6px; padding: 4px 12px; border-radius: 8px;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase;
}
.status-pin.active { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
.status-pin.inactive { background: rgba(107,114,128,0.1); color: #6b7280; border: 1px solid rgba(107,114,128,0.2); }
`;

export default function ChatLieuList() {
    const [chatLieus, setChatLieus] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const navigate = useNavigate();

    const fetchChatLieus = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllChatLieu(search);
            setChatLieus(data);
        } catch { toast.error("Không thể tải danh sách chất liệu"); }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => { fetchChatLieus(); }, [fetchChatLieus]);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteChatLieu(deleteTarget.id);
            toast.success(`Đã xóa chất liệu "${deleteTarget.tenChatLieu}"`);
            setChatLieus(prev => prev.filter(s => s.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) { toast.error("Xóa thất bại"); }
        finally { setIsDeleting(false); }
    };

    const filtered = useMemo(() => chatLieus.filter(item => {
        const matchSearch = !search.trim() || item.maChatLieu?.toLowerCase().includes(search.toLowerCase()) || item.tenChatLieu?.toLowerCase().includes(search.toLowerCase());
        const active = item.trangThai === 1 || item.trangThai === true;
        const matchStatus = filterStatus === "all" || (filterStatus === "active" && active) || (filterStatus === "inactive" && !active);
        return matchSearch && matchStatus;
    }), [chatLieus, search, filterStatus]);

    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const pageItems = filtered.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

    return (
        <div className="lux-root">
            <style>{STYLES}</style>
            <div className="lux-inner">
                <header className="lux-header">
                    <h1 className="lux-title">Danh mục <span>chất liệu</span></h1>
                    <button className="btn-gold" onClick={() => navigate("/material/new")}>
                        <Plus size={18} /> Thêm chất liệu mới
                    </button>
                </header>

                <section className="lux-filter">
                    <div className="flex-1 flex flex-col gap-2">
                        <Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold tracking-widest">Search materials</Label>
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-4 text-slate-400" />
                            <Input placeholder="Mã hoặc tên chất liệu..." className="lux-input pl-12" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-[200px] flex flex-col gap-2">
                        <Label className="font-mono text-[10px] text-[#b8860b] uppercase font-bold tracking-widest">Status</Label>
                        <select className="lux-input px-4 appearance-none cursor-pointer" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Ngừng hoạt động</option>
                        </select>
                    </div>
                    <button className="btn-white" onClick={() => { setSearch(""); setFilterStatus("all"); }}><RefreshCcw size={16} /> Reset</button>
                </section>

                <div className="wh-tbl-card">
                    {loading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-4">
                            <Loader2 size={32} className="animate-spin text-[#b8860b]" />
                            <span className="text-sm font-bold text-[#b8860b] uppercase tracking-widest">Loading database...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center opacity-30 gap-3 grayscale">
                            <Layers size={64} />
                            <p className="font-mono text-xs uppercase tracking-widest italic">No materials found</p>
                        </div>
                    ) : (
                        <table className="wh-tbl">
                            <thead>
                                <tr>
                                    <th className="wh-th w-16 text-center">STT</th>
                                    <th className="wh-th">Mã định danh</th>
                                    <th className="wh-th">Tên chất liệu</th>
                                    <th className="wh-th">Mô tả</th>
                                    <th className="wh-th">Trạng thái</th>
                                    <th className="wh-th text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((item, i) => (
                                    <tr key={item.id} className="wh-tr">
                                        <td className="wh-td text-center text-xs font-mono text-slate-400">{pageNumber * pageSize + i + 1}</td>
                                        <td className="wh-td"><span className="font-mono font-bold text-[#b8860b]">{item.maChatLieu || '—'}</span></td>
                                        <td className="wh-td font-bold">{item.tenChatLieu}</td>
                                        <td className="wh-td text-xs text-slate-500 italic max-w-xs truncate">{item.moTa || 'Không có mô tả'}</td>
                                        <td className="wh-td">
                                            <span className={`status-pin ${(item.trangThai === 1 || item.trangThai === true) ? 'active' : 'inactive'}`}>
                                                {(item.trangThai === 1 || item.trangThai === true) ? 'Active' : 'Stopped'}
                                            </span>
                                        </td>
                                        <td className="wh-td text-center">
                                            <div className="flex justify-center gap-1">
                                                <button className="act-btn" onClick={() => navigate(`/material/view/${item.id}`)}><Eye size={16}/></button>
                                                <button className="act-btn" onClick={() => navigate(`/material/${item.id}`)}><Edit size={16}/></button>
                                                <button className="act-btn red" onClick={() => setDeleteTarget(item)}><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalElements > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-rgba(184,134,11,0.1)">
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">showing items {pageNumber * pageSize + 1}-{Math.min((pageNumber + 1) * pageSize, totalElements)} of {totalElements}</span>
                        <div className="flex items-center gap-2">
                            <button disabled={pageNumber === 0} onClick={() => setPageNumber(p => p - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                            <span className="font-mono text-xs font-bold px-4">{pageNumber + 1} / {totalPages}</span>
                            <button disabled={pageNumber >= totalPages - 1} onClick={() => setPageNumber(p => p + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                    <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-10 text-center shadow-2xl border border-red-50 animate-in zoom-in duration-200">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40}/></div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Material?</h2>
                        <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed italic">Are you sure you want to delete <span className="text-slate-900 font-bold">"{deleteTarget.tenChatLieu}"</span>? This process cannot be reversed.</p>
                        <div className="flex flex-col gap-3">
                            <button className="h-14 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2" onClick={handleConfirmDelete} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="animate-spin" size={20}/> : <Trash2 size={20}/>}
                                Confirm Deletion
                            </button>
                            <button className="h-14 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-all" onClick={() => setDeleteTarget(null)}>Return Back</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}