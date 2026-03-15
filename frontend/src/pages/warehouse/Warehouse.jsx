import React, { useState, useEffect, useCallback } from 'react';
import {
    Loader2, ChevronDown, ChevronLeft, ChevronRight, Plus,
    Package, CheckCircle2, XCircle, BarChart3, Filter,
    Search, RefreshCcw, Eye, Edit, Trash2, Check,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { khoService } from '@/services/khoService';
import { useToggle } from '@/hooks/useToggle';
import ConfirmModal from '@/components/ui/confirm-modal';
import {
    WarehouseDialog
} from '.';

/* ══════════════════════════════════════════════════════
   STYLES — Light Ivory / Gold  (matches homepage + login)
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

/* ── Root ── */
.wh-root {
  min-height: 100vh;
  background: linear-gradient(160deg, #faf8f3 0%, #f5f0e4 55%, #ede9de 100%);
  padding: 28px 28px 56px;
  position: relative;
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow-x: hidden;
}

/* ── Animated grid ── */
.wh-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(184,134,11,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(184,134,11,0.05) 1px, transparent 1px);
  background-size: 56px 56px;
  animation: whGrid 35s linear infinite;
}
@keyframes whGrid { to { background-position: 56px 56px; } }

/* ── Orbs ── */
.wh-orb-1 {
  position: fixed; width: 500px; height: 500px; border-radius: 50%;
  background: rgba(184,134,11,0.07); filter: blur(100px);
  top: -180px; right: -120px; pointer-events: none; z-index: 0;
}
.wh-orb-2 {
  position: fixed; width: 360px; height: 360px; border-radius: 50%;
  background: rgba(201,150,12,0.05); filter: blur(90px);
  bottom: -100px; left: -80px; pointer-events: none; z-index: 0;
}

/* ── Inner ── */
.wh-inner {
  position: relative; z-index: 1;
  max-width: 1400px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 22px;
}

/* ── Add button ── */
.wh-btn-add {
  height: 42px; padding: 0 22px; border-radius: 11px;
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border: none; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; gap: 7px; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 18px rgba(184,134,11,0.35);
  position: relative; overflow: hidden;
}
.wh-btn-add::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0; transition: opacity 0.2s;
}
.wh-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(184,134,11,0.48); }
.wh-btn-add:hover::after { opacity: 1; }

/* ════════════════════════════════
   STAT CARDS
════════════════════════════════ */
.wh-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
}
@media (max-width: 900px) { .wh-stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .wh-stats { grid-template-columns: 1fr; } }

.wh-stat {
  background: #fff;
  border: 1px solid rgba(184,134,11,0.15);
    font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: #7a6e5f; white-space: nowrap;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  position: relative; overflow: hidden;
}
.wh-stat::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.wh-stat.s-gold::before  { background: linear-gradient(90deg, transparent, #b8860b, transparent); }
.wh-stat.s-green::before { background: linear-gradient(90deg, transparent, #16a34a, transparent); }
.wh-stat.s-red::before   { background: linear-gradient(90deg, transparent, #dc2626, transparent); }
.wh-stat.s-blue::before  { background: linear-gradient(90deg, transparent, #2563eb, transparent); }
.wh-stat:hover {
  border-color: rgba(184,134,11,0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(100,80,30,0.13);
}
.wh-stat-lbl {
  font-family: 'DM Mono', monospace; font-size: 11px;
  color: #a89f92; letter-spacing: 0.05em; margin-bottom: 6px;
}
.wh-stat-val {
  font-family: 'Playfair Display', serif;
  font-size: 28px; font-weight: 800; color: #1a1612; letter-spacing: -1px;
}
.wh-stat-ico {
  width: 44px; height: 44px; border-radius: 13px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.wh-stat-ico.s-gold  { background: rgba(184,134,11,0.12); }
.wh-stat-ico.s-green { background: rgba(34,197,94,0.1); }
.wh-stat-ico.s-red   { background: rgba(220,38,38,0.08); }
.wh-stat-ico.s-blue  { background: rgba(37,99,235,0.08); }

/* Shared stat-card accent line (same visual idea as issue screen) */
.wh-stat-card {
    position: relative;
    overflow: hidden;
}
.wh-stat-card::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--stat-line, #b8860b), transparent);
}
.wh-stat-card.s-blue  { --stat-line: #2563eb; }
.wh-stat-card.s-amber { --stat-line: #d97706; }
.wh-stat-card.s-green { --stat-line: #16a34a; }
.wh-stat-card.s-red   { --stat-line: #dc2626; }

/* ════════════════════════════════
   FILTER CARD
════════════════════════════════ */
.wh-filter {
  background: #fff;
  border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.wh-filter-head {
  padding: 16px 22px 14px;
  border-bottom: 1px solid rgba(184,134,11,0.08);
  background: linear-gradient(180deg, rgba(184,134,11,0.03) 0%, transparent 100%);
  display: flex; align-items: center; gap: 8px;
}
.wh-filter-ttl {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
  letter-spacing: 0.15em; text-transform: uppercase; color: rgba(184,134,11,0.7);
}
.wh-filter-body {
  padding: 18px 22px 22px;
  display: grid; grid-template-columns: 2fr 1fr auto; gap: 14px; align-items: end;
}
@media (max-width: 700px) { .wh-filter-body { grid-template-columns: 1fr; } }

.wh-field { display: flex; flex-direction: column; gap: 6px; }
.wh-lbl {
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase; color: rgba(184,134,11,0.7);
}

.wh-search-wrap { position: relative; }
.wh-search-ico {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: #a89f92; pointer-events: none; display: flex; align-items: center;
}
.wh-inp {
  width: 100%; height: 42px; padding: 0 14px 0 38px;
  background: #faf8f3;
  border: 1.5px solid rgba(184,134,11,0.18);
  border-radius: 11px; outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1a1612;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.wh-inp::placeholder { color: #a89f92; }
.wh-inp:focus {
  border-color: #b8860b; background: #fff;
  box-shadow: 0 0 0 3px rgba(184,134,11,0.1);
}
.wh-inp:disabled { opacity: 0.45; cursor: not-allowed; }

.wh-sel-btn {
  width: 100%; height: 42px; padding: 0 14px;
  background: #faf8f3;
  border: 1.5px solid rgba(184,134,11,0.18);
  border-radius: 11px;
  color: #7a6e5f; font-size: 13px;
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.wh-sel-btn:hover { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.05); }

.wh-btn-reset {
  height: 42px; padding: 0 18px; border-radius: 11px;
  background: transparent;
  border: 1.5px solid rgba(184,134,11,0.2);
  color: #7a6e5f; font-size: 13px; font-weight: 500;
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
  font-family: 'DM Sans', sans-serif;
}
.wh-btn-reset:hover { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.06); }
.wh-btn-reset:disabled { opacity: 0.4; cursor: not-allowed; }

/* Dropdown */
.wh-dd-content {
  background: #fff !important;
  border: 1px solid rgba(184,134,11,0.2) !important;
  border-radius: 13px !important;
  box-shadow: 0 12px 40px rgba(100,80,30,0.15) !important;
  overflow: hidden !important;
}
.wh-dd-item {
  color: #7a6e5f !important;
  font-size: 13px !important;
  cursor: pointer !important;
  font-family: 'DM Sans', sans-serif !important;
  padding: 10px 14px !important;
  display: flex !important; align-items: center !important; justify-content: space-between !important;
  transition: background 0.15s, color 0.15s !important;
}
.wh-dd-item:hover { background: rgba(184,134,11,0.07) !important; color: #b8860b !important; }

/* ════════════════════════════════
   TABLE
════════════════════════════════ */
.wh-tbl-card {
    background: #fffdf8;
  border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; overflow: hidden;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.wh-tbl-card::before {
  content: ''; display: block; height: 2px;
  background: linear-gradient(90deg, transparent, #b8860b, transparent);
}
.wh-tbl-scroll { overflow-x: auto; overflow-y: auto; max-height: 520px; }

.wh-tbl { width: 100%; border-collapse: collapse; text-align: left; }

.wh-thead { position: sticky; top: 0; z-index: 5; }
.wh-thead tr {
    background: #faf8f3;
    border-bottom: 1px solid rgba(184,134,11,0.12);
}
.wh-th {
    height: 48px; padding: 0 16px;
    font-family: 'DM Mono', monospace; font-size: 12px;
    font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: #7a6e5f; white-space: nowrap;
}
.wh-th.c { text-align: center; }

.wh-tbody tr { border-bottom: 1px solid rgba(184,134,11,0.07); transition: background 0.15s; }
.wh-tbody tr:last-child { border-bottom: none; }
.wh-tbody tr:hover { background: rgba(184,134,11,0.04); }
.wh-td { padding: 14px 16px; vertical-align: middle; }
.wh-td.c { text-align: center; }

.wh-stt {
    font-family: 'DM Mono', monospace; font-size: 11px; color: #a89f92;
    font-weight: 500;
}
.wh-code {
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #b8860b;
    letter-spacing: 0.025em;
    white-space: nowrap;
}
.wh-name { font-size: 14px; font-weight: 600; color: #1a1612; font-family: 'DM Sans', sans-serif; }
.wh-addr {
  font-size: 12px; color: #a89f92; margin-top: 2px;
  font-family: 'DM Sans', sans-serif;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;
}
.wh-mgr { font-size: 13px; color: #3d3529; font-family: 'DM Sans', sans-serif; }

.wh-badge {
  display: inline-flex; align-items: center; gap: 6px;
  border-radius: 99px; padding: 4px 12px; font-size: 11px; font-weight: 600;
  white-space: nowrap; font-family: 'DM Sans', sans-serif;
}
.wh-badge.on  { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.22);  color: #16a34a; }
.wh-badge.off { background: rgba(220,38,38,0.07);  border: 1px solid rgba(220,38,38,0.2);   color: #dc2626; }
.wh-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.wh-badge.on  .wh-dot { background: #16a34a; }
.wh-badge.off .wh-dot { background: #dc2626; }

.wh-stock { font-family: 'DM Mono', monospace; font-size: 13px; color: #b8860b; font-weight: 600; }
.wh-date  { font-family: 'DM Mono', monospace; font-size: 12px; color: #a89f92; }

.wh-acts { display: flex; align-items: center; justify-content: center; gap: 4px; }
.wh-act {
  width: 32px; height: 32px; border-radius: 9px;
  border: 1.5px solid transparent; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.wh-act:hover { transform: scale(1.1); }
.wh-act.v      { color: #b8860b; }
.wh-act.v:hover{ background: rgba(184,134,11,0.1);  border-color: rgba(184,134,11,0.3); }
.wh-act.e      { color: #2563eb; }
.wh-act.e:hover{ background: rgba(37,99,235,0.08);  border-color: rgba(37,99,235,0.25); }
.wh-act.d      { color: #dc2626; }
.wh-act.d:hover{ background: rgba(220,38,38,0.08);  border-color: rgba(220,38,38,0.25); }

/* ════════════════════════════════
   EMPTY STATE
════════════════════════════════ */
.wh-empty {
    background: #fffdf8; border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; padding: 72px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 14px; text-align: center;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.wh-empty-ico {
  width: 72px; height: 72px; border-radius: 20px;
  background: rgba(184,134,11,0.08); border: 1px solid rgba(184,134,11,0.15);
  display: flex; align-items: center; justify-content: center;
}
.wh-empty-ttl {
  font-family: 'Playfair Display', serif;
  font-size: 18px; font-weight: 700; color: #1a1612;
}
.wh-empty-dsc { font-size: 13px; color: #a89f92; max-width: 380px; line-height: 1.7; font-family: 'DM Sans', sans-serif; }

/* ════════════════════════════════
   LOADING
════════════════════════════════ */
.wh-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 80px 32px; color: #7a6e5f; font-size: 14px;
  font-family: 'DM Sans', sans-serif;
}
.wh-spin { animation: whSpin 0.9s linear infinite; }
@keyframes whSpin { to { transform: rotate(360deg); } }

/* ════════════════════════════════
   PAGINATION
════════════════════════════════ */
.wh-pag {
    background: #fffdf8; border: 1px solid rgba(184,134,11,0.15);
  border-radius: 18px; padding: 16px 22px;
  box-shadow: 0 2px 12px rgba(100,80,30,0.07);
}
.wh-pag-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.wh-pag-left   { display: flex; align-items: center; gap: 8px; }
.wh-pag-lbl    { font-family: 'DM Mono', monospace; font-size: 10px; color: #a89f92; letter-spacing: 0.1em; text-transform: uppercase; }
.wh-pag-sz-btn {
  height: 34px; padding: 0 12px; border-radius: 9px;
  background: #faf8f3; border: 1.5px solid rgba(184,134,11,0.18);
  color: #7a6e5f; font-size: 12px;
  display: flex; align-items: center; gap: 6px; cursor: pointer;
  transition: all 0.15s; font-family: 'DM Mono', monospace;
}
.wh-pag-sz-btn:hover { border-color: #b8860b; color: #b8860b; }
.wh-pag-info   { font-family: 'DM Mono', monospace; font-size: 11px; color: #a89f92; letter-spacing: 0.04em; }
.wh-pag-info strong { color: #3d3529; }
.wh-pag-info .g { color: #b8860b; }
.wh-pag-nav    { display: flex; align-items: center; gap: 5px; }
.wh-pag-btn {
  height: 34px; min-width: 34px; padding: 0 10px; border-radius: 9px;
  background: #faf8f3; border: 1.5px solid rgba(184,134,11,0.15);
  color: #7a6e5f; font-size: 13px; font-weight: 500;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;
  transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.wh-pag-btn:hover:not(:disabled) { border-color: #b8860b; color: #b8860b; background: rgba(184,134,11,0.06); }
.wh-pag-btn.act {
  background: linear-gradient(135deg, #b8860b, #e8b923);
  border-color: transparent; color: #fff; font-weight: 700;
  box-shadow: 0 3px 12px rgba(184,134,11,0.35);
}
.wh-pag-btn:disabled { opacity: 0.35; cursor: not-allowed; }
`;

/* ── Filter payload builder ── */
function buildPayload(filters) {
    const list = [];
    if (filters.searchTerm?.trim()) {
        ["tenKho", "maKho", "diaChi"].forEach(f =>
            list.push({ fieldName: f, operation: "ILIKE", value: filters.searchTerm.trim(), logicType: "OR" })
        );
    }
    if (filters.filterStatus === "active")
        list.push({ fieldName: "trangThai", operation: "EQUALS", value: 1, logicType: "AND" });
    else if (filters.filterStatus === "inactive")
        list.push({ fieldName: "trangThai", operation: "EQUALS", value: 0, logicType: "AND" });

    return {
        filters: list,
        sorts: [{ fieldName: "ngayTao", direction: "DESC" }],
        page: filters.pageNumber,
        size: filters.pageSize,
    };
}

const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' },
];

/* ════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════ */
export default function WarehouseManagement() {
    const [warehouses, setWarehouses] = useState([]);
    const [managers, setManagers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingManagers, setIsLoadingManagers] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [pagination, setPagination] = useState({
        pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0,
    });

    const [showDialog, setShowDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('create');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isConfirmOpen, openConfirm, closeConfirm] = useToggle(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        maKho: '', tenKho: '', diaChi: '', quanLyId: '', trangThai: 1,
    });
    const [errors, setErrors] = useState({});

    /* ── Fetch warehouses ── */
    const fetchWarehouses = useCallback(async (
        page = pagination.pageNumber,
        size = pagination.pageSize,
    ) => {
        try {
            setIsLoading(true);
            const res = await khoService.filter(
                buildPayload({ searchTerm, filterStatus, pageNumber: page, pageSize: size })
            );
            console.log(res);
            const d = res?.data?.data ?? res?.data;
            if (d) {
                setWarehouses(d.content || []);
                setPagination(prev => ({
                    ...prev,
                    pageNumber: d.number || 0,
                    pageSize: Math.max(d.size, 1),
                    totalElements: d.totalElements || 0,
                    totalPages: d.totalPages || 0,
                }));
            } else {
                setWarehouses([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách kho:", err);
            toast.error("Không thể tải danh sách kho");
            setWarehouses([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filterStatus, pagination.pageNumber, pagination.pageSize]);

    /* ── Fetch managers ── */
    const fetchManagers = useCallback(async () => {
        try {
            setIsLoadingManagers(true);
            const res = await khoService.getManagers();
            if (res.data?.status === 200) {
                setManagers((res.data.data.content || []).map(u => ({ id: u.id, name: u.hoTen })));
            }
        } catch (err) {
            console.error("Lỗi khi tải danh sách quản lý:", err);
            toast.error("Không thể tải danh sách người quản lý");
        } finally {
            setIsLoadingManagers(false);
        }
    }, []);

    useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);
    useEffect(() => { if (showDialog) fetchManagers(); }, [showDialog, fetchManagers]);

    /* ── Pagination ── */
    const handlePageChange = p => { if (p >= 0 && p < pagination.totalPages) setPagination(prev => ({ ...prev, pageNumber: p })); };
    const handlePageSizeChange = sz => setPagination(prev => ({ ...prev, pageSize: sz, pageNumber: 0 }));

    /* ── Validation ── */
    const validateForm = () => {
        const e = {};
        if (!formData.maKho) e.maKho = 'Vui lòng nhập mã kho';
        if (!formData.tenKho) e.tenKho = 'Vui lòng nhập tên kho';
        else if (formData.tenKho.length < 5) e.tenKho = 'Tên kho phải có ít nhất 5 ký tự';
        if (!formData.diaChi) e.diaChi = 'Vui lòng nhập địa chỉ';
        if (!formData.quanLyId) e.quanLyId = 'Vui lòng chọn người quản lý';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ── Dialog ── */
    const handleOpenDialog = (mode, wh = null) => {
        setDialogMode(mode);
        setSelectedWarehouse(wh);
        if (mode === 'create')
            setFormData({ maKho: '', tenKho: '', diaChi: '', quanLyId: '', trangThai: 1 });
        else if (mode === 'edit' && wh)
            setFormData({ maKho: wh.maKho, tenKho: wh.tenKho, diaChi: wh.diaChi, quanLyId: wh.quanLy?.id?.toString() || '', trangThai: wh.trangThai ?? 1 });
        setErrors({});
        setShowDialog(true);
    };

    const handleCloseDialog = () => { setShowDialog(false); setSelectedWarehouse(null); setErrors({}); };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        try {
            const data = { maKho: formData.maKho, tenKho: formData.tenKho, diaChi: formData.diaChi, quanLyId: Number(formData.quanLyId), trangThai: Number(formData.trangThai) };
            console.log('Sending warehouse data:', data);
            let res;
            if (dialogMode === 'create') res = await khoService.create(data);
            else if (dialogMode === 'edit') res = await khoService.update({ id: selectedWarehouse.id, ...data });
            if (res?.data?.status >= 400) { toast.error(res.data.message || 'Có lỗi xảy ra'); return; }
            toast.success(dialogMode === 'create' ? 'Thêm kho mới thành công!' : 'Cập nhật thông tin kho thành công!');
            setShowDialog(false); setErrors({}); fetchWarehouses();
        } catch (err) {
            console.error('Chi tiết lỗi:', err);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);
            toast.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xử lý kho');
        }
    };

    const handleDeleteClick = useCallback((wh) => { setWarehouseToDelete(wh); openConfirm(); }, [openConfirm]);

    const handleConfirmDelete = useCallback(async () => {
        if (!warehouseToDelete) return;
        try {
            setIsDeleting(true);
            await khoService.delete(warehouseToDelete.id);
            toast.success('Xóa kho thành công!');
            closeConfirm(); setWarehouseToDelete(null); fetchWarehouses();
        } catch (err) {
            console.error('Lỗi khi xóa kho:', err);
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa kho');
        } finally { setIsDeleting(false); }
    }, [warehouseToDelete, closeConfirm, fetchWarehouses]);

    const handleCancelDelete = useCallback(() => {
        if (!isDeleting) { setWarehouseToDelete(null); closeConfirm(); }
    }, [isDeleting, closeConfirm]);

    /* ── Computed stats ── */
    const stats = {
        total: pagination.totalElements,
        active: warehouses.filter(w => w.trangThai === 1).length,
        inactive: warehouses.filter(w => w.trangThai === 0).length,
        totalStock: warehouses.reduce((s, w) => s + (w.soLuongTon || 0), 0),
    };

    const statusLabel = STATUS_OPTIONS.find(o => o.value === filterStatus)?.label ?? 'Tất cả trạng thái';
    const warehouseHeaderCellStyle = {
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.08em',
        color: '#7a6e5f',
    };

    /* ══════════════
       RENDER
    ══════════════ */
    return (
        <>
            <style>{STYLES}</style>

            <div className="wh-root gold-text-sync">
                <div className="wh-grid" />
                <div className="wh-orb-1" />
                <div className="wh-orb-2" />

                <div className="wh-inner">

                    {/* ── Stats ── */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="wh-stat-card s-blue border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tổng kho</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.total}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Package className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="wh-stat-card s-amber border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-amber-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.active}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="wh-stat-card s-green border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-green-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ngừng hoạt động</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.inactive}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <XCircle className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="wh-stat-card s-red border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-gradient-to-br from-red-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Tổng tồn kho</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>{stats.totalStock.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <BarChart3 className="h-6 w-6 text-red-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* ── Filter ── */}
                    <Card className="border-0 shadow-lg bg-[#fffdf8]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                                <Filter className="h-5 w-5 text-[#b8860b]" />
                                Bộ lọc tìm kiếm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-gray-700 font-medium">Tìm kiếm</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm theo tên kho, mã kho, địa chỉ..."
                                        className="pl-9 bg-[#fffdf8] border-[#b8860b]/20 focus:border-[#b8860b] focus:ring-[#b8860b]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Trạng thái</Label>
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between bg-[#fffdf8] border-[#b8860b]/20 hover:bg-[#b8860b]/10 font-normal text-[#3d3529]"
                                            disabled={isLoading}
                                        >
                                            <span className="truncate">{statusLabel}</span>
                                            <ChevronDown className="h-4 w-4 opacity-70 flex-shrink-0" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px] bg-white border border-gray-100 shadow-xl z-50">
                                        {STATUS_OPTIONS.map((opt) => (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                onClick={() => setFilterStatus(opt.value)}
                                                className="flex items-center justify-between cursor-pointer hover:bg-[#b8860b]/10"
                                            >
                                                {opt.label}
                                                {filterStatus === opt.value && <Check className="h-4 w-4 text-[#b8860b]" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Reset */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-[#b8860b] hover:text-white border-[#b8860b]/25 text-[#7a6e5f]"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                        </CardContent>
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="wh-btn-add" onClick={() => handleOpenDialog('create')}>
                            <Plus size={15} /> Thêm kho mới
                        </button>
                    </div>

                    {/* ── Content ── */}
                    {isLoading ? (
                        <div className="wh-loading">
                            <Loader2 size={22} className="wh-spin" style={{ color: '#b8860b' }} />
                            <span>Đang tải danh sách kho...</span>
                        </div>
                    ) : warehouses.length > 0 ? (
                        <>
                            {/* ── Table ── */}
                            <div className="wh-tbl-card">
                                <div className="wh-tbl-scroll">
                                    <table className="wh-tbl">
                                        <thead className="sticky top-0 z-10">
                                            <tr className="border-b border-[#e6dcc9] bg-[#f8f3e8]">
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-center text-xs font-semibold uppercase whitespace-nowrap w-14">STT</th>
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-left text-xs font-semibold uppercase whitespace-nowrap">Mã kho</th>
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-left text-xs font-semibold uppercase whitespace-nowrap">Tên kho</th>
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-left text-xs font-semibold uppercase whitespace-nowrap">Người quản lý</th>
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-center text-xs font-semibold uppercase whitespace-nowrap">Trạng thái</th>
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-center text-xs font-semibold uppercase whitespace-nowrap">Tồn kho</th>
                                                <th style={warehouseHeaderCellStyle} className="h-12 px-4 text-center text-xs font-semibold uppercase whitespace-nowrap">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="wh-tbody">
                                            {warehouses.map((wh, idx) => (
                                                <tr key={wh.id}>
                                                    <td className="wh-td c">
                                                        <span className="wh-stt">
                                                            {pagination.pageNumber * pagination.pageSize + idx + 1}
                                                        </span>
                                                    </td>
                                                    <td className="wh-td">
                                                        <span className="wh-code">{wh.maKho || '—'}</span>
                                                    </td>
                                                    <td className="wh-td">
                                                        <p className="wh-name">{wh.tenKho}</p>
                                                        {wh.diaChi && <p className="wh-addr">{wh.diaChi}</p>}
                                                    </td>
                                                    <td className="wh-td">
                                                        <span className="wh-mgr">{wh.quanLy?.hoTen || '—'}</span>
                                                    </td>
                                                    <td className="wh-td c">
                                                        {wh.trangThai === 1 ? (
                                                            <span className="wh-badge on"><span className="wh-dot" />Hoạt động</span>
                                                        ) : (
                                                            <span className="wh-badge off"><span className="wh-dot" />Ngừng hoạt động</span>
                                                        )}
                                                    </td>
                                                    <td className="wh-td c">
                                                        <span className="wh-stock">{(wh.soLuongTon || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="wh-td">
                                                        <div className="wh-acts">
                                                            <button type="button" title="Xem chi tiết" className="wh-act v"
                                                                onClick={() => handleOpenDialog('view', wh)}>
                                                                <Eye size={15} />
                                                            </button>
                                                            <button type="button" title="Chỉnh sửa" className="wh-act e"
                                                                onClick={() => handleOpenDialog('edit', wh)}>
                                                                <Edit size={15} />
                                                            </button>
                                                            <button type="button" title="Xóa kho" className="wh-act d"
                                                                onClick={() => handleDeleteClick(wh)}>
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ── Pagination ── */}
                            <div className="wh-pag">
                                <div className="wh-pag-row">
                                    {/* Size selector */}
                                    <div className="wh-pag-left">
                                        <span className="wh-pag-lbl">Hiển thị</span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="wh-pag-sz-btn">
                                                    {pagination.pageSize} dòng
                                                    <ChevronDown size={12} style={{ opacity: 0.5 }} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="wh-dd-content" style={{ minWidth: 130 }}>
                                                {[5, 10, 20, 50, 100].map(sz => (
                                                    <DropdownMenuItem key={sz} onClick={() => handlePageSizeChange(sz)} className="wh-dd-item">
                                                        {sz} dòng
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Info */}
                                    <p className="wh-pag-info">
                                        <strong>{pagination.pageNumber * pagination.pageSize + 1}</strong>
                                        {' — '}
                                        <strong>{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</strong>
                                        {' / '}
                                        <span className="g">{pagination.totalElements}</span> kết quả
                                    </p>

                                    {/* Nav */}
                                    <div className="wh-pag-nav">
                                        <button className="wh-pag-btn" onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={pagination.pageNumber === 0}>
                                            <ChevronLeft size={14} /> Trước
                                        </button>

                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                                let p;
                                                if (pagination.totalPages <= 5) p = i;
                                                else if (pagination.pageNumber < 3) p = i;
                                                else if (pagination.pageNumber > pagination.totalPages - 4) p = pagination.totalPages - 5 + i;
                                                else p = pagination.pageNumber - 2 + i;
                                                return (
                                                    <button key={i} className={`wh-pag-btn ${pagination.pageNumber === p ? 'act' : ''}`}
                                                        onClick={() => handlePageChange(p)}>
                                                        {p + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button className="wh-pag-btn" onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={pagination.pageNumber >= pagination.totalPages - 1}>
                                            Sau <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Empty ── */
                        <div className="wh-empty">
                            <div className="wh-empty-ico">
                                <Package size={32} style={{ color: 'rgba(184,134,11,0.45)' }} strokeWidth={1.5} />
                            </div>
                            <p className="wh-empty-ttl">Không tìm thấy kho hàng</p>
                            <p className="wh-empty-dsc">
                                Chưa có dữ liệu kho phù hợp. Hãy thay đổi bộ lọc hoặc thêm kho mới.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Modals ── */}
                <WarehouseDialog
                    showDialog={showDialog}
                    setShowDialog={setShowDialog}
                    dialogMode={dialogMode}
                    selectedWarehouse={selectedWarehouse}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    managers={managers}
                    isLoadingManagers={isLoadingManagers}
                    onSubmit={handleSubmit}
                    onClose={handleCloseDialog}
                />

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                    title="Xác nhận xóa kho"
                    description={
                        warehouseToDelete
                            ? `Bạn có chắc chắn muốn xóa kho "${warehouseToDelete.tenKho}"? Hành động này không thể hoàn tác.`
                            : "Bạn có chắc chắn muốn xóa kho này?"
                    }
                    confirmText="Xóa"
                    cancelText="Hủy"
                    variant="danger"
                    isLoading={isDeleting}
                />
            </div>
        </>
    );
}