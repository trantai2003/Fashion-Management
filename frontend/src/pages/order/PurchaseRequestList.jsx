import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ChevronLeft, ChevronRight, ChevronDown, Search, Calendar,
    Filter, Eye, Plus, RefreshCw, Warehouse, CheckCircle,
    XCircle, Clock, FileText, Loader2, AlertCircle, Send,
    Package, Building2, ShoppingBag,
    Ship,
} from 'lucide-react';
import purchaseRequestService from '@/services/purchaseRequestService';
import apiClient from '@/services/apiClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseJwt(token) {
    try {
        const b64 = token.split('.')[1];
        return JSON.parse(atob(b64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch { return null; }
}
function parseRoles(vaiTro) {
    if (!vaiTro) return [];
    return vaiTro.includes(' ') ? vaiTro.split(' ') : [vaiTro];
}

const MANAGER_ROLES = ['quan_tri_vien', 'quan_ly_kho', 'nhan_vien_mua_hang'];

const statusConfig = {
    1: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
    2: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    3: { label: 'Đã gửi báo giá', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Send },
    4: { label: 'Từ chối', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
    5: { label: 'Đang vận chuyển', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Ship },
};

const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

// ─── SendToSupplierDialog ─────────────────────────────────────────────────────
function SendToSupplierDialog({ open, onClose, request, suppliers, onConfirm, submitting }) {
    const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);
    const [ghiChu, setGhiChu] = useState('');

    useEffect(() => {
        if (open) { setSelectedSupplierIds([]); setGhiChu(''); }
    }, [open]);

    const toggleSupplier = (id) => {
        setSelectedSupplierIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl">
                <div className="bg-blue-600 p-6 flex items-center gap-3">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-white m-0">Gửi yêu cầu báo giá</DialogTitle>
                        <DialogDescription className="text-blue-100 text-[12px] mt-0.5">
                            Chọn nhà cung cấp để gửi email báo giá
                        </DialogDescription>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {/* Thông tin yêu cầu */}
                    {request && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[13px] space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Kho nhập:</span>
                                <span className="font-bold text-slate-800">{request.khoNhap?.tenKho || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Số sản phẩm:</span>
                                <span className="font-bold text-slate-800">{request.chiTietYeuCauMuaHangs?.length || 0} biến thể</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Ngày giao dự kiến:</span>
                                <span className="font-bold text-slate-800">{formatDate(request.ngayGiaoDuKien)}</span>
                            </div>
                        </div>
                    )}

                    {/* Chọn nhà cung cấp */}
                    <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            Nhà cung cấp <span className="text-rose-500">*</span>
                            {selectedSupplierIds.length > 0 && (
                                <span className="ml-1 text-[11px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                                    {selectedSupplierIds.length} đã chọn
                                </span>
                            )}
                        </Label>
                        <div className="max-h-[200px] overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 p-2 bg-slate-50">
                            {suppliers.length === 0
                                ? <p className="text-center text-[13px] text-slate-400 py-4 italic">Chưa có nhà cung cấp</p>
                                : suppliers.map(s => {
                                    const isSelected = selectedSupplierIds.includes(s.id);
                                    return (
                                        <button key={s.id} type="button" onClick={() => toggleSupplier(s.id)}
                                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                                            <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                                                {isSelected && <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[13px] text-slate-800 truncate">{s.tenNhaCungCap}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{s.email || s.maNhaCungCap}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            }
                        </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="space-y-1.5">
                        <Label className="text-[13px] font-bold text-slate-700">Ghi chú (tuỳ chọn)</Label>
                        <Input value={ghiChu} onChange={e => setGhiChu(e.target.value)}
                            placeholder="Ghi chú kèm theo email..."
                            className="h-10 rounded-xl border-slate-200 text-[13px]" />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                        <p className="text-[12px] text-amber-800">
                            <strong>Lưu ý:</strong> Hệ thống sẽ gửi email đến từng nhà cung cấp đã chọn và tạo đơn báo giá tương ứng.
                        </p>
                    </div>
                </div>
                <div className="px-6 pb-6 flex gap-2 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={submitting}
                        className="h-11 rounded-xl font-semibold">Hủy</Button>
                    <Button onClick={() => onConfirm({ yeuCauMuaHangId: request?.id, nhaCungCapIds: selectedSupplierIds, ghiChu })}
                        disabled={submitting || selectedSupplierIds.length === 0}
                        className="h-11 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md disabled:opacity-40">
                        {submitting
                            ? <><Loader2 className="h-4 w-4 animate-spin" />Đang gửi...</>
                            : <><Send className="h-4 w-4" />Gửi đến {selectedSupplierIds.length || ''} NCC</>
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────
function DetailDialog({ open, onClose, request }) {
    if (!request) return null;
    const cfg = statusConfig[request.trangThai] || statusConfig[1];
    const StatusIcon = cfg.icon;
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] flex flex-col">
                <div className="bg-slate-900 p-6 flex items-center gap-3 shrink-0">
                    <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-white m-0">Chi tiết yêu cầu #{request.id}</DialogTitle>
                        <DialogDescription className="text-slate-400 text-[12px] mt-0.5">
                            Tạo bởi {request.nguoiTao?.hoTen || '—'} · {formatDate(request.ngayTao)}
                        </DialogDescription>
                    </div>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Status + info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng thái</p>
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                                <StatusIcon className="h-3.5 w-3.5" />{cfg.label}
                            </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kho nhập</p>
                            <p className="font-bold text-[13px] text-slate-800">{request.khoNhap?.tenKho || '—'}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ngày giao dự kiến</p>
                            <p className="font-semibold text-[13px] text-slate-800">{formatDate(request.ngayGiaoDuKien)}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Người duyệt</p>
                            <p className="font-semibold text-[13px] text-slate-800">{request.nguoiDuyet?.hoTen || 'Chưa duyệt'}</p>
                        </div>
                    </div>

                    {request.ghiChu && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Ghi chú</p>
                            <p className="text-[13px] text-slate-700">{request.ghiChu}</p>
                        </div>
                    )}

                    {/* Chi tiết sản phẩm */}
                    <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Sản phẩm ({request.chiTietYeuCauMuaHangs?.length || 0} biến thể)
                        </p>
                        <div className="space-y-2 max-h-[240px] overflow-y-auto">
                            {(request.chiTietYeuCauMuaHangs || []).map((item, i) => {
                                const img = item.bienTheSanPham?.anhBienThe?.tepTin?.duongDan;
                                return (
                                    <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
                                        {img
                                            ? <img src={img} alt="" className="h-9 w-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                                            : <div className="h-9 w-9 rounded-lg bg-slate-200 flex items-center justify-center shrink-0"><Package className="h-4 w-4 text-slate-400" /></div>
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-[13px] text-slate-800 truncate">{item.bienTheSanPham?.tenBienThe || item.bienTheSanPham?.maSku}</p>
                                            <p className="font-mono text-[11px] text-amber-700">{item.bienTheSanPham?.maSku}</p>
                                        </div>
                                        <span className="font-bold text-slate-700 shrink-0 text-[13px]">×{item.soLuongDat}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="px-6 pb-5 shrink-0">
                    <Button variant="outline" onClick={onClose} className="w-full h-10 rounded-xl font-semibold">Đóng</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function PurchaseRequestList() {
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    // Auth
    const [userRoles, setUserRoles] = useState([]);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Pagination
    const [pagination, setPagination] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });

    // Filters
    const [filters, setFilters] = useState({ trangThai: '', khoId: '' });
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [warehouses, setWarehouses] = useState([]);

    // Dialogs
    const [detailRequest, setDetailRequest] = useState(null);
    const [sendRequest, setSendRequest] = useState(null);
    const [approvingId, setApprovingId] = useState(null);  // { id, action: 'approve'|'reject' }
    const [submitting, setSubmitting] = useState(false);

    const isManager = MANAGER_ROLES.some(r => userRoles.includes(r));

    // ── Load auth ──
    useEffect(() => {
        const load = async () => {
            setLoadingAuth(true);
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                const payload = parseJwt(token);
                if (!payload?.id) return;
                const res = await apiClient.get(`/api/v1/nguoi-dung/get-by-id/${payload.id}`);
                const userData = res.data?.data;
                if (userData?.vaiTro) setUserRoles(parseRoles(userData.vaiTro));
            } catch { } finally {
                setLoadingAuth(false);
            }
        };
        load();
    }, []);

    // ── Load warehouses ──
    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.post('/api/v1/kho/filter', {
                    filters: [], sorts: [{ fieldName: 'tenKho', direction: 'ASC' }], page: 0, size: 100,
                });
                setWarehouses(res.data?.data?.content || res.data?.content || []);
            } catch { }
        };
        load();
    }, []);

    // ── Load suppliers ──
    useEffect(() => {
        const load = async () => {
            try {
                const res = await apiClient.post('/api/v1/nha-cung-cap/filter', {
                    filters: [], sorts: [{ fieldName: 'tenNhaCungCap', direction: 'ASC' }], page: 0, size: 200,
                });
                setSuppliers(res.data?.data?.content || res.data?.content || []);
            } catch { }
        };
        load();
    }, []);

    // ── Fetch list ──
    const fetchRequests = async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const filterArray = [];
            if (filters.trangThai && filters.trangThai !== 'all') {
                filterArray.push({ fieldName: 'trangThai', operation: 'EQUALS', value: parseInt(filters.trangThai), logicType: 'AND' });
            }
            if (filters.khoId && filters.khoId !== 'all') {
                filterArray.push({ fieldName: 'khoNhap.id', operation: 'EQUALS', value: parseInt(filters.khoId), logicType: 'AND' });
            }
            if (dateRange.from) filterArray.push({ fieldName: 'ngayTao', operation: 'GREATER_THAN_OR_EQUAL', value: dateRange.from, logicType: 'AND' });
            if (dateRange.to) filterArray.push({ fieldName: 'ngayTao', operation: 'LESS_THAN_OR_EQUAL', value: dateRange.to + 'T23:59:59', logicType: 'AND' });

            const res = await purchaseRequestService.filter({
                filters: filterArray,
                sorts: [{ fieldName: 'ngayTao', direction: 'DESC' }],
                page, size,
            });
            const data = res?.data?.data || res?.data || {};
            setRequests(data.content || []);
            setPagination({
                pageNumber: data.pageable?.pageNumber || 0,
                pageSize: data.pageable?.pageSize || 10,
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 0,
            });
        } catch {
            toast.error('Không thể tải danh sách yêu cầu mua hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loadingAuth) fetchRequests(pagination.pageNumber, pagination.pageSize);
    }, [filters, dateRange, pagination.pageNumber, pagination.pageSize, loadingAuth]);

    // ── Approve / Reject ──
    const handleApprove = async (id, trangThai) => {
        setSubmitting(true);
        try {
            await purchaseRequestService.approve(id, trangThai);
            toast.success(trangThai === 2 ? 'Đã duyệt yêu cầu!' : 'Đã từ chối yêu cầu!');
            setApprovingId(null);
            fetchRequests(pagination.pageNumber, pagination.pageSize);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Send to supplier ──
    const handleSendToSupplier = async (payload) => {
        setSubmitting(true);
        try {
            await purchaseRequestService.sendQuotationRequest(payload);
            toast.success('Đã gửi yêu cầu báo giá đến nhà cung cấp!');
            setSendRequest(null);
            fetchRequests(pagination.pageNumber, pagination.pageSize);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi báo giá thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    const clearFilters = () => {
        setFilters({ trangThai: '', khoId: '' });
        setDateRange({ from: '', to: '' });
        setPagination(prev => ({ ...prev, pageNumber: 0 }));
    };

    // Stats
    const stats = {
        total: pagination.totalElements,
        pending: requests.filter(r => r.trangThai === 1).length,
        approved: requests.filter(r => r.trangThai === 2).length,
        sent: requests.filter(r => r.trangThai === 3).length,
    };

    const getStatusIcon = (status) => {
        const Icon = statusConfig[status]?.icon || AlertCircle;
        return <Icon className="h-4 w-4" />;
    };

    const getSelectedWarehouseName = () => {
        if (!filters.khoId || filters.khoId === 'all') return 'Tất cả kho';
        return warehouses.find(w => w.id === parseInt(filters.khoId))?.tenKho || 'Đang tải...';
    };

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Yêu cầu mua hàng</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Quản lý các yêu cầu nhập hàng từ nhân viên</p>
                </div>
                <Button onClick={() => navigate('/purchase-requests/create')}
                    className="bg-slate-900 text-white hover:bg-slate-700 shadow-sm gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo yêu cầu
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng yêu cầu', value: stats.total, icon: FileText, bg: 'from-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                    { label: 'Chờ duyệt', value: stats.pending, icon: Clock, bg: 'from-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
                    { label: 'Đã duyệt', value: stats.approved, icon: CheckCircle, bg: 'from-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                    { label: 'Đã gửi báo giá', value: stats.sent, icon: Send, bg: 'from-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                ].map(({ label, value, icon: Icon, bg, iconBg, iconColor }) => (
                    <Card key={label} className={`border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br ${bg} to-white`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{label}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                                </div>
                                <div className={`h-11 w-11 rounded-full ${iconBg} flex items-center justify-center`}>
                                    <Icon className={`h-5 w-5 ${iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        Bộ lọc tìm kiếm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Trạng thái */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Trạng thái</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200">
                                        <span className="truncate">
                                            {filters.trangThai && filters.trangThai !== 'all'
                                                ? statusConfig[filters.trangThai]?.label
                                                : 'Tất cả trạng thái'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[200px] bg-white shadow-lg border border-gray-100 z-50">
                                    <DropdownMenuItem onClick={() => handleFilterChange('trangThai', 'all')} className="hover:bg-indigo-50">
                                        Tất cả trạng thái
                                    </DropdownMenuItem>
                                    {Object.entries(statusConfig).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <DropdownMenuItem key={key} onClick={() => handleFilterChange('trangThai', key)} className="cursor-pointer hover:bg-indigo-50">
                                                <div className="flex items-center gap-2"><Icon className="h-4 w-4" />{cfg.label}</div>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Kho */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Kho nhập</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between font-normal bg-white border-gray-200">
                                        <div className="flex items-center overflow-hidden gap-2">
                                            <Warehouse className="h-4 w-4 text-gray-400 shrink-0" />
                                            <span className="truncate">{getSelectedWarehouseName()}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] bg-white shadow-lg border border-gray-100 z-50 max-h-[300px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => handleFilterChange('khoId', 'all')} className="hover:bg-indigo-50 font-medium">
                                        Tất cả kho
                                    </DropdownMenuItem>
                                    {warehouses.map(w => (
                                        <DropdownMenuItem key={w.id} onClick={() => handleFilterChange('khoId', w.id)} className="cursor-pointer hover:bg-indigo-50">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{w.tenKho}</span>
                                                {w.maKho && <span className="text-xs text-gray-500">Mã: {w.maKho}</span>}
                                            </div>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Từ ngày */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Từ ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-9 border-gray-200"
                                    value={dateRange.from}
                                    onChange={e => { setDateRange(p => ({ ...p, from: e.target.value })); setPagination(p => ({ ...p, pageNumber: 0 })); }} />
                            </div>
                        </div>

                        {/* Đến ngày */}
                        <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Đến ngày</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-9 border-gray-200"
                                    value={dateRange.to}
                                    onChange={e => { setDateRange(p => ({ ...p, to: e.target.value })); setPagination(p => ({ ...p, pageNumber: 0 })); }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => { setPagination(p => ({ ...p, pageNumber: 0 })); fetchRequests(0, pagination.pageSize); }}
                            className="bg-slate-900 text-white hover:bg-white hover:text-slate-900 border border-slate-900 h-10 px-4 rounded-xl font-medium transition-all">
                            <Search className="h-4 w-4 mr-2" />Tìm kiếm
                        </Button>
                        <Button variant="outline" onClick={clearFilters} className="h-10 px-4 rounded-xl font-medium">Đặt lại</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => fetchRequests(pagination.pageNumber, pagination.pageSize)}
                    className="gap-2 h-10 px-4 rounded-xl font-medium">
                    <RefreshCw className="h-4 w-4" />Làm mới
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-12">STT</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Kho nhập</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Người tạo</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide">Số SP</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Trạng thái</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Ngày giao DK</th>
                                <th className="h-12 px-4 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Ngày tạo</th>
                                <th className="h-12 px-4 text-center font-semibold text-slate-600 text-xs uppercase tracking-wide w-40">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={8} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                        <span className="text-slate-500 font-medium">Đang tải dữ liệu...</span>
                                    </div>
                                </td></tr>
                            ) : requests.length === 0 ? (
                                <tr><td colSpan={8} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                                            <ShoppingBag className="h-10 w-10 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">Không tìm thấy yêu cầu mua hàng</p>
                                            <p className="text-sm text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tạo yêu cầu mới</p>
                                        </div>
                                    </div>
                                </td></tr>
                            ) : requests.map((req, index) => {
                                const cfg = statusConfig[req.trangThai] || statusConfig[1];
                                const StatusIcon = cfg.icon;
                                return (
                                    <tr key={req.id} className="hover:bg-violet-50/40 transition-colors cursor-pointer"
                                        onClick={() => setDetailRequest(req)}>
                                        <td className="px-4 py-3.5 text-center text-slate-500 text-xs">
                                            {pagination.pageNumber * pagination.pageSize + index + 1}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">{req.khoNhap?.tenKho || '—'}</p>
                                            <p className="text-xs text-slate-400">{req.khoNhap?.maKho}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-slate-900">{req.nguoiTao?.hoTen || '—'}</p>
                                            <p className="text-xs text-slate-400">{req.nguoiTao?.email}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                                {req.chiTietYeuCauMuaHangs?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-slate-600 text-sm">{formatDate(req.ngayGiaoDuKien)}</td>
                                        <td className="px-4 py-3.5 text-slate-600 text-sm">{formatDate(req.ngayTao)}</td>
                                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                {/* Xem chi tiết */}
                                                <button type="button" onClick={() => setDetailRequest(req)}
                                                    title="Xem chi tiết"
                                                    className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                                    <Eye className="h-4 w-4 text-slate-600" />
                                                </button>

                                                {/* Manager: Duyệt (chỉ khi chờ duyệt) */}
                                                {isManager && req.trangThai === 1 && (
                                                    <>
                                                        <button type="button"
                                                            onClick={() => setApprovingId({ id: req.id, action: 'approve' })}
                                                            title="Duyệt"
                                                            className="h-8 w-8 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors">
                                                            <CheckCircle className="h-4 w-4 text-green-700" />
                                                        </button>
                                                        <button type="button"
                                                            onClick={() => setApprovingId({ id: req.id, action: 'reject' })}
                                                            title="Từ chối"
                                                            className="h-8 w-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors">
                                                            <XCircle className="h-4 w-4 text-red-700" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Manager: Gửi báo giá (chỉ khi đã duyệt) */}
                                                {isManager && req.trangThai === 2 && (
                                                    <button type="button"
                                                        onClick={() => navigate(`/purchase-requests/${req.id}/send-quotation`)}
                                                        title="Gửi yêu cầu báo giá"
                                                        className="h-8 px-3 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center gap-1 transition-colors text-[12px] font-semibold text-blue-700">
                                                        <Send className="h-3.5 w-3.5" />
                                                        Gửi NCC
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Card className="border-0 shadow-md bg-white">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-gray-600 whitespace-nowrap">Hiển thị:</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-[120px] justify-between font-normal bg-white border-gray-200">
                                        {pagination.pageSize} dòng <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[120px] bg-white shadow-lg border border-gray-100 z-50">
                                    {[5, 10, 20, 50].map(size => (
                                        <DropdownMenuItem key={size} onClick={() => setPagination(p => ({ ...p, pageNumber: 0, pageSize: size }))} className="cursor-pointer">
                                            {size} dòng
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="text-sm text-gray-600">
                            Hiển thị <span className="font-semibold text-gray-900">{pagination.totalElements === 0 ? 0 : pagination.pageNumber * pagination.pageSize + 1}</span>–
                            <span className="font-semibold text-gray-900">{Math.min((pagination.pageNumber + 1) * pagination.pageSize, pagination.totalElements)}</span> trong
                            <span className="font-semibold text-indigo-600"> {pagination.totalElements}</span> kết quả
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber - 1 }))}
                                disabled={pagination.pageNumber === 0} className="gap-1">
                                <ChevronLeft className="h-4 w-4" /> Trước
                            </Button>
                            <div className="hidden sm:flex gap-1">
                                {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                    let pg = idx;
                                    if (pagination.totalPages > 5) {
                                        if (pagination.pageNumber < 3) pg = idx;
                                        else if (pagination.pageNumber > pagination.totalPages - 4) pg = pagination.totalPages - 5 + idx;
                                        else pg = pagination.pageNumber - 2 + idx;
                                    }
                                    return (
                                        <Button key={idx} variant={pagination.pageNumber === pg ? 'default' : 'outline'} size="sm"
                                            onClick={() => setPagination(p => ({ ...p, pageNumber: pg }))}
                                            className={pagination.pageNumber === pg ? 'bg-slate-900 text-white border-slate-900' : 'border-gray-200'}>
                                            {pg + 1}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, pageNumber: p.pageNumber + 1 }))}
                                disabled={pagination.pageNumber >= pagination.totalPages - 1 || pagination.totalPages === 0} className="gap-1">
                                Sau <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Approve/Reject confirm dialog ── */}
            <Dialog open={!!approvingId} onOpenChange={() => setApprovingId(null)}>
                <DialogContent className="rounded-2xl sm:max-w-sm p-0 overflow-hidden border-0 shadow-2xl">
                    <div className={`p-6 flex items-center gap-3 ${approvingId?.action === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            {approvingId?.action === 'approve'
                                ? <CheckCircle className="h-5 w-5 text-white" />
                                : <XCircle className="h-5 w-5 text-white" />
                            }
                        </div>
                        <DialogTitle className="text-xl font-bold text-white m-0">
                            {approvingId?.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <DialogDescription className="text-[15px] text-slate-600 mb-6">
                            {approvingId?.action === 'approve'
                                ? 'Bạn có chắc muốn duyệt yêu cầu mua hàng này? Sau khi duyệt, có thể gửi báo giá đến nhà cung cấp.'
                                : 'Bạn có chắc muốn từ chối yêu cầu này? Hành động này không thể hoàn tác.'
                            }
                        </DialogDescription>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setApprovingId(null)} disabled={submitting}
                                className="h-11 rounded-xl font-semibold w-full sm:w-auto">Hủy</Button>
                            <Button onClick={() => handleApprove(approvingId.id, approvingId.action === 'approve' ? 2 : 4)}
                                disabled={submitting}
                                className={`h-11 rounded-xl font-semibold w-full sm:w-auto ${approvingId?.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (approvingId?.action === 'approve' ? 'Duyệt' : 'Từ chối')}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ── */}
            <DetailDialog open={!!detailRequest} onClose={() => setDetailRequest(null)} request={detailRequest} />

            {/* ── Send to Supplier Dialog ── */}
            <SendToSupplierDialog
                open={!!sendRequest}
                onClose={() => setSendRequest(null)}
                request={sendRequest}
                suppliers={suppliers}
                onConfirm={handleSendToSupplier}
                submitting={submitting}
            />
        </div>
    );
}